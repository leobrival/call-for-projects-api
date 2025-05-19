import SupabaseVectorService from '#services/supabase_vector_service'
import { test } from '@japa/runner'
import 'dotenv/config'
import fetch from 'node-fetch'
import {
  createOrganization,
  createProject,
  createUserAndLogin,
  deleteOrganization,
  deleteProject,
  deleteUser,
} from '../helpers/test_setup.js'

console.log('Début du test')

const openaiKey = process.env.OPENAI_API_KEY

let userId: string
let orgId: string
let projectId: string
let token: string

test.group('SupabaseVectorService', (group) => {
  group.each.setup(async () => {
    const user = await createUserAndLogin(
      'vectoruser2@example.com',
      'ValidPassword1!',
      'Vector User2'
    )
    userId = user.userId
    token = user.token
    orgId = await createOrganization(token)
    projectId = await createProject(token, orgId)
  })

  group.each.teardown(async () => {
    await deleteProject(token, projectId)
    await deleteOrganization(token, orgId)
    await deleteUser(token, userId)
  })

  test('insert a vectorized document from OpenAI embedding', async ({ assert }) => {
    try {
      if (!openaiKey) throw new Error('OPENAI_API_KEY missing')

      console.log('Avant appel OpenAI')

      // 1. Génère un embedding OpenAI
      const text = 'Ceci est un test vectoriel.'
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      })
      assert.isTrue(res.ok, 'OpenAI API call failed')
      type OpenAIEmbeddingResponse = { data: { embedding: number[] }[] }
      const json = (await res.json()) as OpenAIEmbeddingResponse
      const embedding = json.data[0].embedding
      assert.isArray(embedding)
      assert.isAbove(embedding.length, 0)

      console.log('Avant insert Supabase')

      // 2. Insert dans Supabase via le service
      const svc = new SupabaseVectorService()
      const doc = {
        project_id: 'test-project',
        content: text,
        embedding,
        metadata: { test: true },
      }
      const inserted = await svc.insertVector(doc)
      assert.exists(inserted)
      assert.equal(inserted.project_id, 'test-project')
      assert.equal(inserted.content, text)
    } catch (e) {
      console.error('Test error:', e)
      throw e
    }
  })
})
