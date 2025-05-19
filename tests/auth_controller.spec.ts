import User from '#models/user'
import { test } from '@japa/runner'
import supertest from 'supertest'
import { createUserAndLogin, deleteUser } from './helpers/test_setup.js'

const BASE_URL = 'http://localhost:3333/v1'

let userId: string
let token: string

// Helpers
test.group('AuthController', (group) => {
  group.each.setup(async () => {
    const user = await createUserAndLogin('test@example.com', 'ValidPassword1!', 'Test User')
    userId = user.userId
    token = user.token
    await User.query().delete() // Clean users before each test
  })

  group.each.teardown(async () => {
    await deleteUser(token, userId)
  })

  test('signup - success', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'ValidPassword1!',
        fullName: 'Test User',
      })
      .expect(201)
    assert.equal(res.body.email, 'test@example.com')
    assert.equal(res.body.fullName, 'Test User')
    assert.notProperty(res.body, 'password')
  })

  test('signup - email already used', async ({ assert }) => {
    await User.create({
      email: 'test@example.com',
      password: 'ValidPassword1!',
      fullName: 'Test User',
    })
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'ValidPassword1!',
        fullName: 'Test User',
      })
      .expect(409)
    assert.equal(res.body.message, 'Email already registered')
  })

  test('signup - password too short', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'shortpw@example.com',
        password: 'Short1!',
        fullName: 'Shorty',
      })
      .expect(422)
    assert.include(res.body.message, 'Password must be at least 12 characters')
  })

  test('signup - password missing uppercase', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'noUpper@example.com',
        password: 'lowercase1!',
        fullName: 'No Upper',
      })
      .expect(422)
    assert.include(res.body.message, 'Password must be at least 12 characters')
  })

  test('signup - password missing lowercase', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'noLower@example.com',
        password: 'UPPERCASE1!',
        fullName: 'No Lower',
      })
      .expect(422)
    assert.include(res.body.message, 'Password must be at least 12 characters')
  })

  test('signup - password missing digit', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'noDigit@example.com',
        password: 'NoDigitHere!',
        fullName: 'No Digit',
      })
      .expect(422)
    assert.include(res.body.message, 'Password must be at least 12 characters')
  })

  test('signup - password missing symbol', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'noSymbol@example.com',
        password: 'NoSymbol1234',
        fullName: 'No Symbol',
      })
      .expect(422)
    assert.include(res.body.message, 'Password must be at least 12 characters')
  })

  test('signup - fullName missing', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'nofullname@example.com',
        password: 'ValidPassword1!',
      })
      .expect(422)
    assert.property(res.body, 'message')
  })

  test('signin - success', async ({ assert }) => {
    await User.create({
      email: 'login@example.com',
      password: 'ValidPassword1!',
      fullName: 'Login User',
    })
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: 'login@example.com',
        password: 'ValidPassword1!',
      })
      .expect(200)
    assert.property(res.body, 'token')
    assert.equal(res.body.type, 'bearer')
    assert.equal(res.body.user.email, 'login@example.com')
    assert.notProperty(res.body.user, 'password')
  })

  test('signin - email unknown', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: 'unknown@example.com',
        password: 'ValidPassword1!',
      })
      .expect(401)
    assert.equal(res.body.message, 'Invalid credentials')
  })

  test('signin - password incorrect', async ({ assert }) => {
    await User.create({
      email: 'wrongpw@example.com',
      password: 'ValidPassword1!',
      fullName: 'Wrong PW',
    })
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: 'wrongpw@example.com',
        password: 'WrongPassword!',
      })
      .expect(401)
    assert.equal(res.body.message, 'Invalid credentials')
  })

  test('signin - email vide', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: '',
        password: 'ValidPassword1!',
      })
      .expect(401)
    assert.equal(res.body.message, 'Invalid credentials')
  })

  test('signin - password vide', async ({ assert }) => {
    await User.create({
      email: 'empty@example.com',
      password: 'ValidPassword1!',
      fullName: 'Empty PW',
    })
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: 'empty@example.com',
        password: '',
      })
      .expect(401)
    assert.equal(res.body.message, 'Invalid credentials')
  })

  test('signup - champs en trop', async ({ assert }) => {
    const res = await supertest(BASE_URL)
      .post('/signup')
      .send({
        email: 'extrafield@example.com',
        password: 'ValidPassword1!',
        fullName: 'Extra Field',
        extra: 'should be ignored',
      })
      .expect(201)
    assert.equal(res.body.email, 'extrafield@example.com')
    assert.notProperty(res.body, 'extra')
  })

  test('signin - champs en trop', async ({ assert }) => {
    await User.create({
      email: 'extrafield2@example.com',
      password: 'ValidPassword1!',
      fullName: 'Extra Field2',
    })
    const res = await supertest(BASE_URL)
      .post('/signin')
      .send({
        email: 'extrafield2@example.com',
        password: 'ValidPassword1!',
        extra: 'should be ignored',
      })
      .expect(200)
    assert.property(res.body, 'token')
    assert.notProperty(res.body, 'extra')
  })
})
