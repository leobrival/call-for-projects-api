import Organization from '#models/organization'
import Project from '#models/project'
import AuthService from '#services/auth_service'
import OpenAIEmbeddingService from '#services/openai_embedding_service'
import SupabaseVectorService from '#services/supabase_vector_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProjectsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const projects = await Project.all()
    return response.ok(projects)
  }

  /**
   * Display the projects page with Inertia.js
   */
  async indexPage({ inertia, auth }: HttpContext) {
    const projects = await Project.query().preload('organization')

    return inertia.render('Projects', {
      projects,
      auth: {
        user: AuthService.getUserForProtectedPage(auth),
      },
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const { organizationId, name, description } = request.only([
      'organizationId',
      'name',
      'description',
    ])
    const user = await auth.authenticate()
    if (!user) {
      return response.unauthorized({ message: 'User not authenticated' })
    }
    const createdBy = user.id
    if (!organizationId) {
      return response.unprocessableEntity({ message: 'organizationId is required' })
    }
    const org = await Organization.find(organizationId)
    if (!org) {
      return response.unprocessableEntity({ message: 'Organization not found' })
    }
    const project = await Project.create({ name, description, organizationId, createdBy })
    return response.created(project)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const project = await Project.find(params.id)
    if (!project) return response.notFound({ message: 'Not found' })
    return response.ok(project)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const project = await Project.find(params.id)
    if (!project) return response.notFound({ message: 'Not found' })
    const { name, description, organizationId } = request.only([
      'name',
      'description',
      'organizationId',
    ])
    if (name) project.name = name
    if (description) project.description = description
    if (organizationId) project.organizationId = organizationId
    await project.save()
    return response.ok(project)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const project = await Project.find(params.id)
    if (!project) return response.notFound({ message: 'Not found' })
    await project.delete()
    return response.noContent()
  }

  // Upload a vectorized document for a project
  async uploadVectorDocument({ params, request, response }: HttpContext) {
    const { projectId } = params
    const { content, metadata } = request.only(['content', 'metadata'])
    if (!content) {
      return response.badRequest({ message: 'content is required' })
    }
    try {
      // Vectorisation via service externalisé
      const embeddingService = new OpenAIEmbeddingService()
      const embedding = await embeddingService.getEmbedding(content)
      // Insert dans Supabase
      const supabase = new SupabaseVectorService()
      const doc = await supabase.insertVector({
        project_id: projectId,
        content,
        embedding,
        metadata,
      })
      return response.created(doc)
    } catch (err) {
      return response.internalServerError({ message: err.message })
    }
  }

  // Test Supabase connection and insert dummy doc
  async testSupabaseVector({ params, response }: HttpContext) {
    const { projectId } = params
    try {
      const supabase = new SupabaseVectorService()
      const doc = await supabase.insertVector({
        project_id: projectId,
        content: 'dummy',
        embedding: Array(1536).fill(0.1), // dummy embedding
        metadata: { test: true },
      })
      return response.ok({ success: true, doc })
    } catch (err) {
      return response.internalServerError({ message: err.message })
    }
  }

  // List all projects for a specific organization
  async listByOrganization({ params, response }: HttpContext) {
    const { organizationId } = params
    const projects = await Project.query().where('organization_id', organizationId)
    return response.ok(projects)
  }

  // List all projects created by a specific user
  async listByUser({ params, response }: HttpContext) {
    const { userId } = params
    const projects = await Project.query().where('created_by', userId)
    return response.ok(projects)
  }

  // Ask: RAG (Retrieval Augmented Generation) for a project
  async ask({ params, request, response }: HttpContext) {
    const { projectId } = params
    const { question, matchCount = 5 } = request.only(['question', 'matchCount'])
    if (!question) {
      return response.badRequest({ message: 'question is required' })
    }
    try {
      // 1. Vectorise la question
      const embeddingService = new OpenAIEmbeddingService()
      const embedding = await embeddingService.getEmbedding(question)
      // 2. Cherche les documents les plus proches
      const supabase = new SupabaseVectorService()
      const docs = await supabase.searchVectors(projectId, embedding, matchCount)
      // 3. Compose le contexte
      const context = docs && docs.length ? docs.map((d) => d.content).join('\n---\n') : ''
      // 4. Compose le prompt
      const prompt = `Voici des extraits de documents du projet :\n${context}\n\nQuestion :\n${question}\n\nRéponds en t'appuyant sur ces documents.`
      // 5. Appelle OpenAI (chat)
      // Remplace par ton service de chat si besoin
      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant qui répond en t'appuyant sur le contexte fourni.`,
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 512,
        }),
      })
      if (!chatRes.ok) {
        const err = await chatRes.text()
        return response.internalServerError({ message: 'OpenAI chat error', details: err })
      }
      const chatJson = (await chatRes.json()) as { choices?: { message?: { content?: string } }[] }
      const answer = chatJson.choices?.[0]?.message?.content || ''
      return response.ok({ answer, context: docs })
    } catch (err) {
      return response.internalServerError({ message: err.message })
    }
  }
}
