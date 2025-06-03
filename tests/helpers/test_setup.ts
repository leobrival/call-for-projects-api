import supertest from 'supertest'

const BASE_URL = 'http://localhost:3333/v1'

export async function createUserAndLogin(email?: string, password?: string, fullName?: string) {
  // Create a unique email if not provided
  const userEmail =
    email || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`
  const userPassword = password || 'ValidPassword1!'
  const userName = fullName || 'Test User'

  try {
    // Create the user via API
    const signupRes = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: userEmail, password: userPassword, fullName: userName })
      .expect(201)

    const userId = signupRes.body.id

    // Sign in to get the token
    const loginRes = await supertest(BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: userEmail, password: userPassword })
      .expect(200)

    const token = loginRes.body.token

    if (!token) {
      throw new Error('No token received from login')
    }

    return { token, userId }
  } catch (error) {
    console.error('Error in createUserAndLogin:', error.message)
    throw error
  }
}

export async function createOrganization(token: string, name?: string) {
  // Generate a unique name if not provided
  const uniqueName = name || `Test Org ${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  const slug = uniqueName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const res = await supertest(BASE_URL)
    .post('/organizations')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({ name: uniqueName, slug })
    .expect(201)
  return res.body.id
}

export async function createProject(
  token: string,
  organizationId: string,
  name = 'Test Project',
  description = 'Projet de test'
) {
  const res = await supertest(BASE_URL)
    .post('/projects')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({ name, description, organizationId })
    .expect(201)
  return res.body.id
}

export async function deleteUser(token: string, userId: string) {
  try {
    await supertest(BASE_URL)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect(204)
  } catch (err) {
    console.warn(`deleteUser failed for ${userId}:`, err.message)
  }
}

export async function deleteOrganization(token: string, orgId: string) {
  try {
    await supertest(BASE_URL)
      .delete(`/organizations/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect(204)
  } catch (err) {
    console.warn(`deleteOrganization failed for ${orgId}:`, err.message)
  }
}

export async function deleteProject(token: string, projectId: string) {
  try {
    await supertest(BASE_URL)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .expect(204)
  } catch (err) {
    console.warn(`deleteProject failed for ${projectId}:`, err.message)
  }
}
