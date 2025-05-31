import { test } from '@japa/runner'
import fetch from 'node-fetch'
import {
  createOrganization,
  createProject,
  createUserAndLogin,
  deleteOrganization,
  deleteProject,
  deleteUser,
} from '../helpers/test_setup.js'

const BASE_URL = 'http://localhost:3333/v1'
const TEST_DOC = 'Le soleil est une étoile.'
const TEST_QUESTION = "Qu'est-ce que le soleil ?"

let userId: string
let orgId: string
let projectId: string
let token: string

test.group('RAG API', (group) => {
  group.each.setup(async () => {
    const uniqueEmail = `vectoruser_${Date.now()}@example.com`
    const user = await createUserAndLogin(uniqueEmail, 'ValidPassword1!', 'Vector User')
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

  test('upload + ask returns answer with context', async ({ assert }) => {
    console.log('Début du test RAG')
    // 3. Upload un document vectorisé
    const uploadRes = await fetch(`${BASE_URL}/projects/${projectId}/vectors/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content: TEST_DOC, metadata: { test: true } }),
    })
    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.error('Upload error:', err)
    }
    assert.isTrue(uploadRes.ok, 'Upload failed')
    const uploadJson = (await uploadRes.json()) as any
    assert.exists(uploadJson.id)

    // 4. Fait une requête /ask
    const askRes = await fetch(`${BASE_URL}/projects/${projectId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question: TEST_QUESTION }),
    })
    assert.isTrue(askRes.ok, 'Ask failed')
    const askJson = (await askRes.json()) as any
    assert.exists(askJson.answer)
    assert.isString(askJson.answer)
    assert.isAbove(askJson.answer.length, 0)
    assert.isArray(askJson.context)
    assert.isAbove(askJson.context.length, 0)
  })
})
