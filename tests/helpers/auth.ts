import supertest from 'supertest'
const BASE_URL = 'http://localhost:3333/v1'

export async function createUserAndLogin(email: string, password: string, fullName: string) {
  await supertest(BASE_URL).post('/signup').send({ email, password, fullName }).expect(201)
  const res = await supertest(BASE_URL).post('/signin').send({ email, password }).expect(200)
  return res.body.token
}
