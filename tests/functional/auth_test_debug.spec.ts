import User from '#models/user'
import { createUserAndLogin } from '#tests/helpers/test_setup'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import supertest from 'supertest'

const BASE_URL = 'http://localhost:3333/v1'

// Token options that match those in AuthController
const TOKEN_OPTIONS = {
  name: 'api_auth_token',
  abilities: ['*'],
  expiresIn: '30 days',
  tokenType: 'auth_token',
}

test.group('Auth Debug', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.each.teardown(async () => {
    await User.query().delete()
  })

  test('debug token creation and validation', async ({ assert }) => {
    // Créer un utilisateur directement avec un email unique
    const uniqueEmail = `test_${Date.now()}@example.com`
    const user = await User.create({
      email: uniqueEmail,
      password: 'ValidPassword1!',
      fullName: 'Test User',
    })

    console.log('User created:', user.id)

    // Créer un token directement avec les mêmes options que dans AuthController
    const token = await User.accessTokens.create(user, TOKEN_OPTIONS)
    console.log('Token created, length:', token.value?.length)
    console.log('Token type:', typeof token.value)

    // Vérifier que le token existe en base
    const tokens = await User.accessTokens.all(user)
    console.log('Tokens in DB:', tokens.length)

    // Tester la validation du token directement
    try {
      const foundToken = await User.accessTokens.verify(token.value!)
      if (foundToken) {
        console.log('Token validation successful, token details:', {
          tokenableId: foundToken.tokenableId,
          type: foundToken.type,
          abilities: foundToken.abilities,
        })
      }
    } catch (error) {
      console.error('Token validation failed:', error.message)
    }

    // Maintenant tester via l'API
    const res = await supertest(BASE_URL)
      .get('/auth-test')
      .set('Authorization', `Bearer ${token.value}`)
      .set('Accept', 'application/json')

    console.log('Response status:', res.status)
    console.log('Response body:', res.body)

    assert.equal(res.status, 200)
  })

  test('debug token authentication', async ({ assert }) => {
    // Créer un utilisateur et obtenir un token
    const { token, userId } = await createUserAndLogin()

    console.log('Token generated, length:', token.length)
    console.log('User ID:', userId)

    // Vérifier que l'utilisateur existe dans la base
    const userInDb = await User.find(userId)
    console.log('User in DB:', userInDb ? 'Found' : 'Not found')

    // Vérifier les tokens dans la base
    if (userInDb) {
      const tokens = await User.accessTokens.all(userInDb)
      console.log('Tokens in DB:', tokens.length)

      if (tokens.length > 0) {
        console.log('Token from DB details:', {
          type: tokens[0].type,
          abilities: tokens[0].abilities,
          name: tokens[0].name,
        })
      }
    }

    // Tester l'authentification avec ce token
    const res = await supertest(BASE_URL)
      .get('/auth-test')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    console.log('Response status:', res.status)
    console.log('Response body:', res.body)

    assert.equal(res.status, 200)
  })

  test('debug database connection and auth structure', async ({ assert }) => {
    // Vérifier que les tables existent
    const tables = await db
      .from('information_schema.tables')
      .where('table_schema', 'public')
      .whereIn('table_name', ['users', 'auth_access_tokens'])
      .select('table_name')

    console.log(
      'Existing tables:',
      tables.map((t: any) => t.table_name)
    )

    // Créer un utilisateur et un token
    const user = await User.create({
      email: `test_db_${Date.now()}@example.com`,
      password: 'ValidPassword1!',
      fullName: 'DB Test User',
    })

    // Créer le token avec les mêmes options que dans AuthController
    const token = await User.accessTokens.create(user, TOKEN_OPTIONS)
    console.log('Token created with value, length:', token.value?.length)

    // Vérifier directement en base
    const tokenRecord = await db.from('auth_access_tokens').where('tokenable_id', user.id).first()

    console.log('Token in database:', {
      id: tokenRecord?.id,
      tokenable_id: tokenRecord?.tokenable_id,
      hash: tokenRecord?.hash?.substring(0, 20) + '...',
      type: tokenRecord?.type,
      abilities: tokenRecord?.abilities,
      name: tokenRecord?.name,
    })

    // Tester la vérification directe
    try {
      const verifiedToken = await User.accessTokens.verify(token.value!)
      if (verifiedToken) {
        console.log('Direct verification successful')
        console.log('Verified token details:', {
          tokenableId: verifiedToken.tokenableId,
          type: verifiedToken.type,
          abilities: verifiedToken.abilities,
          name: verifiedToken.name,
        })
      }
    } catch (error) {
      console.error('Direct verification failed:', error.message)
    }

    assert.isTrue(true) // Ce test ne devrait pas échouer, juste diagnostiquer
  })
})
