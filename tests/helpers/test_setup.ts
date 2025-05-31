import supertest from 'supertest'
import User from '#models/user'

const BASE_URL = 'http://localhost:3333/v1'

// Define token options matching those in AuthController
const TOKEN_OPTIONS = {
  name: 'api_auth_token',
  abilities: ['*'],
  expiresIn: '30 days',
  tokenType: 'auth_token',
}

export async function createUserAndLogin(email?: string, password?: string, fullName?: string) {
  // Créer un email unique si non fourni
  const userEmail =
    email || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`
  const userPassword = password || 'ValidPassword1!'
  const userName = fullName || 'Test User'

  console.log(`DEBUG test_setup: creating user with email ${userEmail}`)

  try {
    // Créer le user via l'API
    const signupRes = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: userEmail, password: userPassword, fullName: userName })
      .expect(201)

    const userId = signupRes.body.id
    console.log(`DEBUG test_setup: user created with ID ${userId}`)

    // Se connecter pour obtenir le token
    console.log(`DEBUG test_setup: logging in with email ${userEmail}`)
    const loginRes = await supertest(BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: userEmail, password: userPassword })
      .expect(200)

    const token = loginRes.body.token

    if (!token) {
      console.error('DEBUG test_setup: No token received from login response')
      throw new Error('No token received from login')
    }

    console.log(`DEBUG test_setup: received token (length: ${token.length})`)
    console.log('DEBUG test_setup: token type:', loginRes.body.type)
    console.log('DEBUG test_setup: token abilities:', loginRes.body.abilities)

    // Alternative method: Create token directly if API method fails
    if (!token || token.length < 20) {
      console.log('DEBUG test_setup: token from API too short, creating token directly')

      // Find the user we just created
      const user = await User.findBy('email', userEmail)

      if (!user) {
        throw new Error(`User not found: ${userEmail}`)
      }

      // Create a token with the same options as in AuthController
      const directToken = await User.accessTokens.create(user, TOKEN_OPTIONS)

      if (!directToken || !directToken.value) {
        throw new Error('Failed to create token directly')
      }

      console.log(`DEBUG test_setup: created direct token (length: ${directToken.value.length})`)

      // Use this token instead
      return { token: directToken.value, userId }
    }

    return { token, userId }
  } catch (error) {
    console.error('DEBUG test_setup: error in createUserAndLogin:', error.message)
    throw error
  }
}

export async function createOrganization(token: string, name = 'Test Org') {
  const res = await supertest(BASE_URL)
    .post('/organizations')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
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
