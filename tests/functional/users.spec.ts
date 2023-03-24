import { test } from '@japa/runner'
import TestHttpCalls from '../utils/TestHttpCalls'

test.group('Login', async (group) => {
  group.each.timeout(6000)
  let token: string = ''

  test('Invalid login', async ({ assert }) => {
    await assert.rejects(
      async () => await TestHttpCalls.getToken({ email: 'error', password: 'error' })
    )
  })

  test('Valid login', async ({ assert }) => {
    try {
      token = await TestHttpCalls.getAdminToken()
      assert.isString(token)
      assert.notEqual(token, '')
    } catch (error) {
      assert.fail()
    }
  })
})

test.group('Get Users', async (group) => {
  group.each.timeout(6000)

  test('Create user - Valid credentials', async ({ assert }) => {
    try {
      const token = await TestHttpCalls.getAdminToken()
      const body = {
        firstName: 'daniel',
        secondName: 'jose',
        surname: 'cruz',
        secondSurName: 'casallas',
        typeDocument: 1,
        documentNumber: '123456789',
        email: 'danielc88@gmail.co',
        password: '32jdkdi',
        rol: 2,
        phone: '32123122314',
      }
      const response = await TestHttpCalls.createUser(body, token)

      assert.strictEqual(response?.status, 200)
      assert.strictEqual(response?.data['message'], 'Estudiante creado correctamente')
    } catch (error) {
      assert.fail()
    }
  })
})
