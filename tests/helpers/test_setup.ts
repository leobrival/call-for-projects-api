import supertest from 'supertest'
const BASE_URL = 'http://localhost:3333/v1'

export async function createUserAndLogin(email: string, password: string, fullName: string) {
  const signupRes = await supertest(BASE_URL)
    .post('/signup')
    .send({ email, password, fullName })
    .expect(201)
  const userId = signupRes.body.id
  const res = await supertest(BASE_URL).post('/signin').send({ email, password }).expect(200)
  return { token: res.body.token, userId }
}

export async function createOrganization(
  token: string,
  name = 'Test Org',
  description = 'Organisation de test'
) {
  const res = await supertest(BASE_URL)
    .post('/organizations')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description })
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
    .send({ name, description, organizationId })
    .expect(201)
  return res.body.id
}

export async function deleteUser(token: string, userId: string) {
  try {
    await supertest(BASE_URL)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
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
      .expect(204)
  } catch (err) {
    console.warn(`deleteProject failed for ${projectId}:`, err.message)
  }
}
