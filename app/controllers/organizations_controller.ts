import Organization from '#models/organization'
import type { HttpContext } from '@adonisjs/core/http'
import slugifyImport from 'slugify'

const slugify = slugifyImport as unknown as (str: string, opts?: any) => string

export default class OrganizationsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const orgs = await Organization.all()
    return response.ok(orgs)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const { name, slug } = request.only(['name', 'slug'])
    const finalSlug = slug ? slug : slugify(name, { lower: true, strict: true })
    const exists = await Organization.findBy('slug', finalSlug)
    if (exists) {
      return response.conflict({ message: 'Slug already exists' })
    }
    const org = await Organization.create({ name, slug: finalSlug })
    return response.created(org)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const org = await Organization.findBy('slug', params.id)
    if (!org) return response.notFound({ message: 'Not found' })
    return response.ok(org)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const org = await Organization.findBy('slug', params.id)
    if (!org) return response.notFound({ message: 'Not found' })
    const { name, slug } = request.only(['name', 'slug'])
    if (name) org.name = name
    if (slug) org.slug = slug
    else if (name) org.slug = slugify(name, { lower: true, strict: true })
    await org.save()
    return response.ok(org)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const org = await Organization.findBy('slug', params.id)
    if (!org) return response.notFound({ message: 'Not found' })
    await org.delete()
    return response.noContent()
  }
}
