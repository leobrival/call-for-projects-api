import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { test } from '@japa/runner'
import supertest from 'supertest'

const BASE_URL = 'http://localhost:3333/v1'

test.group('AuthController', (group) => {
  group.each.setup(async () => {
    // Nettoyer les utilisateurs avant chaque test
    await User.query().delete()
  })

  group.each.teardown(async () => {
    // Nettoyer après chaque test
    await User.query().delete()
  })

  test('signup - success', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'signup-success@example.com',
        password: 'ValidPassword1!',
        fullName: 'Test User',
      })
      .expect(201)

    assert.property(res.body, 'id')
    assert.equal(res.body.email, 'signup-success@example.com')
    assert.equal(res.body.fullName, 'Test User')
  })

  test('signup - email already exists', async ({ assert }) => {
    await UserFactory.merge({
      email: 'existing@example.com',
      password: 'password',
    }).create()

    const res = await supertest(BASE_URL)
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

  test('signup - invalid email', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'invalid-email',
        password: 'ValidPassword1!',
        fullName: 'Test User',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - password too short', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'shortpw@example.com',
        password: 'Short1!',
        fullName: 'Shorty',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - password missing uppercase', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'noupper@example.com',
        password: 'lowercase1!',
        fullName: 'No Upper',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - password missing lowercase', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nolower@example.com',
        password: 'UPPERCASE1!',
        fullName: 'No Lower',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - password missing digit', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nodigit@example.com',
        password: 'NoDigitHere!',
        fullName: 'No Digit',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - password missing symbol', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nosymbol@example.com',
        password: 'NoSymbol1234',
        fullName: 'No Symbol',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signup - fullName missing', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nofullname@example.com',
        password: 'ValidPassword1!',
      })
      .expect(422)

    assert.property(res.body, 'errors')
    assert.isArray(res.body.errors)
  })

  test('signin - success', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'signin-success@example.com',
      password: 'ValidPassword1!',
    }).create()

    const res = await supertest(BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: user.email,
        password: 'ValidPassword1!',
      })
      .expect(200)

    assert.property(res.body, 'token')
    assert.property(res.body, 'user')
    assert.equal(res.body.user.email, user.email)
  })

  test('signin - invalid email', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nonexistent@example.com',
        password: 'ValidPassword1!',
      })
      .expect(401)

    assert.include(res.body.message, 'Invalid credentials')
  })

  test('signin - invalid password', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'signin-invalid-pw@example.com',
      password: 'ValidPassword1!',
    }).create()

    const res = await supertest(BASE_URL)
      .post('/signin')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        email: user.email,
        password: 'WrongPassword1!',
      })
      .expect(401)

    assert.include(res.body.message, 'Invalid credentials')
  })
})
