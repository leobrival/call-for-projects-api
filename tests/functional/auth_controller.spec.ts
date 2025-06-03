import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { test } from '@japa/runner'
import supertest from 'supertest'

const API_BASE_URL = 'http://localhost:3333/v1'
const WEB_BASE_URL = 'http://localhost:3333'

test.group('Authentication API (tokens)', (group) => {
  group.each.setup(async () => {
    // Clean users before each test
    await User.query().delete()
  })

  group.each.teardown(async () => {
    // Clean up after each test
    await User.query().delete()
  })

  test('API signup - success', async ({ assert }) => {
    const res = await supertest(API_BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'api-signup@example.com',
        password: 'ValidPassword1!',
        fullName: 'API Test User',
      })
      .expect(201)

    assert.property(res.body, 'id')
    assert.equal(res.body.email, 'api-signup@example.com')
    assert.equal(res.body.fullName, 'API Test User')
    assert.notProperty(res.body, 'password') // Ensure password is not exposed
  })

  test('API signup - email already exists', async ({ assert }) => {
    await UserFactory.merge({
      email: 'existing@example.com',
      password: 'password',
    }).create()

    const res = await supertest(API_BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'existing@example.com',
        password: 'ValidPassword1!',
        fullName: 'Test User',
      })
      .expect(409)

    assert.include(res.body.message, 'Email already registered')
  })

  test('API signup - password validation errors', async ({ assert }) => {
    // Test missing fields and password requirements
    const testCases = [
      {
        name: 'invalid email',
        data: { email: 'invalid-email', password: 'ValidPassword1!', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'password too short',
        data: { email: 'short@example.com', password: 'Short1!', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'password missing uppercase',
        data: { email: 'noupper@example.com', password: 'lowercase1!', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'password missing lowercase',
        data: { email: 'nolower@example.com', password: 'UPPERCASE1!', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'password missing digit',
        data: { email: 'nodigit@example.com', password: 'NoDigitHere!', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'password missing symbol',
        data: { email: 'nosymbol@example.com', password: 'NoSymbol1234', fullName: 'Test' },
        expectedStatus: 422,
      },
      {
        name: 'fullName missing',
        data: { email: 'nofullname@example.com', password: 'ValidPassword1!' },
        expectedStatus: 422,
      },
    ]

    for (const testCase of testCases) {
      const res = await supertest(API_BASE_URL)
        .post('/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(testCase.data)
        .expect(testCase.expectedStatus)

      assert.property(res.body, 'errors', `Failed for case: ${testCase.name}`)
      assert.isArray(res.body.errors, `Failed for case: ${testCase.name}`)
    }
  })

  test('API signin - success', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'api-signin@example.com',
      password: 'ValidPassword1!',
    }).create()

    const res = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(200)

    // Verify token response format
    assert.property(res.body, 'token')
    assert.property(res.body, 'type')
    assert.property(res.body, 'expires_in')
    assert.property(res.body, 'user')
    assert.equal(res.body.type, 'bearer')
    assert.equal(res.body.user.email, user.email)
    assert.notProperty(res.body.user, 'password') // Ensure password is not exposed
  })

  test('API signin - invalid credentials', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'api-signin-invalid@example.com',
      password: 'ValidPassword1!',
    }).create()

    // Test invalid email
    const res1 = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nonexistent@example.com',
        password: 'ValidPassword1!',
      })
      .expect(401)

    assert.include(res1.body.message, 'Invalid credentials')

    // Test invalid password
    const res2 = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: user.email,
        password: 'WrongPassword1!',
      })
      .expect(401)

    assert.include(res2.body.message, 'Invalid credentials')
  })

  test('API logout - success', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'api-logout@example.com',
      password: 'ValidPassword1!',
    }).create()

    // Sign in to get token
    const signinRes = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })

    const token = signinRes.body.token

    // Test that the token works first
    await supertest(API_BASE_URL)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    // Then logout
    const logoutRes = await supertest(API_BASE_URL)
      .post('/logout')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    assert.equal(logoutRes.status, 200)
    assert.include(logoutRes.body.message, 'Logged out')
  })

  test('API logout - without token', async ({ assert }) => {
    const res = await supertest(API_BASE_URL)
      .post('/logout')
      .set('Accept', 'application/json')
      .expect(401)

    // Check for errors property instead of message for validation errors
    assert.property(res.body, 'errors')
  })

  test('API protected route - with valid token', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'api-protected@example.com',
      password: 'ValidPassword1!',
    }).create()

    // Sign in to get token
    const signinRes = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })

    const token = signinRes.body.token

    // Access protected route
    const res = await supertest(API_BASE_URL)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.isArray(res.body)
  })

  test('API protected route - without token', async ({ assert }) => {
    const res = await supertest(API_BASE_URL)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(401)

    // Check for errors property instead of message for validation errors
    assert.property(res.body, 'errors')
  })
})

test.group('Authentication Web (sessions)', (group) => {
  group.each.setup(async () => {
    // Clean users before each test
    await User.query().delete()
  })

  group.each.teardown(async () => {
    // Clean up after each test
    await User.query().delete()
  })

  test('Web signup - success with redirect', async ({ assert }) => {
    const res = await supertest(WEB_BASE_URL)
      .post('/register')
      .set('Accept', 'text/html')
      .send({
        email: 'web-signup@example.com',
        password: 'ValidPassword1!',
        fullName: 'Web Test User',
      })
      .expect(302) // Redirect after successful signup

    // Should redirect to home page by default
    assert.include(res.headers.location, '/')
  })

  test('Web signup - validation error with redirect', async ({ assert }) => {
    const res = await supertest(WEB_BASE_URL)
      .post('/register')
      .set('Accept', 'text/html')
      .send({
        email: 'web-signup-invalid@example.com',
        password: 'short', // Invalid password
        fullName: 'Web Test User',
      })
      .expect(302) // Redirect on error

    // Should redirect back to register page
    assert.include(res.headers.location, '/register')
  })

  test('Web login - success with redirect', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'web-login@example.com',
      password: 'ValidPassword1!',
    }).create()

    const res = await supertest(WEB_BASE_URL)
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(302) // Redirect after successful login

    // Should redirect to home page by default
    assert.include(res.headers.location, '/')
  })

  test('Web login - invalid credentials with redirect', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'web-login-invalid@example.com',
      password: 'ValidPassword1!',
    }).create()

    const res = await supertest(WEB_BASE_URL)
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'WrongPassword!',
      })
      .expect(302) // Redirect on error

    // Should redirect back to login page
    assert.include(res.headers.location, '/login')
  })

  test('Web logout - success with redirect', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'web-logout@example.com',
      password: 'ValidPassword1!',
    }).create()

    // Create a session by logging in first
    const agent = supertest.agent(WEB_BASE_URL)

    await agent
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(302)

    // Then logout
    const res = await agent.post('/logout').set('Accept', 'text/html').expect(302)

    // Should redirect to login page
    assert.include(res.headers.location, '/login')
  })

  test('Web protected page - authenticated access', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'web-protected@example.com',
      password: 'ValidPassword1!',
    }).create()

    const agent = supertest.agent(WEB_BASE_URL)

    // Login first
    await agent
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(302)

    // Access protected page
    const res = await agent.get('/projects').set('Accept', 'text/html').expect(200)

    // Should render the page content
    assert.include(res.text, 'Projects')
  })

  test('Web protected page - unauthenticated redirect', async ({ assert }) => {
    const res = await supertest(WEB_BASE_URL)
      .get('/projects')
      .set('Accept', 'text/html')
      .expect(302)

    // Should redirect to login page
    assert.include(res.headers.location, '/login')
  })

  test('Web intelligent redirect - stores intended URL', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'web-redirect@example.com',
      password: 'ValidPassword1!',
    }).create()

    const agent = supertest.agent(WEB_BASE_URL)

    // Try to access protected page first (should store intended URL)
    await agent.get('/organizations').set('Accept', 'text/html').expect(302)

    // Login with the same session
    const res = await agent
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(302)

    // Should redirect to the originally intended URL
    assert.include(res.headers.location, '/organizations')
  })
})

test.group('Authentication Cross-Guard Compatibility', (group) => {
  group.each.setup(async () => {
    // Clean users before each test
    await User.query().delete()
  })

  group.each.teardown(async () => {
    // Clean up after each test
    await User.query().delete()
  })

  test('Same user can authenticate via both API and web', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'cross-auth@example.com',
      password: 'ValidPassword1!',
    }).create()

    // Test API authentication
    const apiRes = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(200)

    assert.property(apiRes.body, 'token')
    assert.equal(apiRes.body.user.email, user.email)

    // Test web authentication with same user
    const webRes = await supertest(WEB_BASE_URL)
      .post('/login')
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(302)

    assert.include(webRes.headers.location, '/')
  })

  test('User data format consistency between API and web', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'consistency@example.com',
      password: 'ValidPassword1!',
      fullName: 'Consistency Test',
    }).create()

    // Get user data from API
    const apiRes = await supertest(API_BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(200)

    const apiUser = apiRes.body.user

    // Verify user data format from AuthService.formatUserForResponse()
    assert.property(apiUser, 'id')
    assert.property(apiUser, 'email')
    assert.property(apiUser, 'fullName')
    assert.notProperty(apiUser, 'password')
    assert.notProperty(apiUser, 'createdAt')
    assert.notProperty(apiUser, 'updatedAt')

    // Verify data values
    assert.equal(apiUser.email, 'consistency@example.com')
    assert.equal(apiUser.fullName, 'Consistency Test')
  })

  test('AuthService methods work correctly', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'authservice@example.com',
      password: 'ValidPassword1!',
      fullName: 'AuthService Test',
    }).create()

    // Test formatUserForResponse
    const { default: AuthService } = await import('#services/auth_service')
    const formattedUser = AuthService.formatUserForResponse(user)

    assert.isNotNull(formattedUser, 'formattedUser should not be null')
    assert.equal(formattedUser!.id, user.id)
    assert.equal(formattedUser!.email, user.email)
    assert.equal(formattedUser!.fullName, user.fullName)
    assert.notProperty(formattedUser!, 'password')

    // Test null user
    const nullUser = AuthService.formatUserForResponse(null)
    assert.isNull(nullUser)
  })
})
