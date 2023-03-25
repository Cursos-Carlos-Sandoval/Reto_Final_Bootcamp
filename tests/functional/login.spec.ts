import { test } from '@japa/runner'
import TestHttpCalls from '../utils/TestHttpCalls'

test.group('Login', async (group) => {
  group.each.timeout(6000)
  let token: string = ''

  test('Invalid login - Invalid password', async ({ assert }) => {
    await assert.rejects(
      async () => await TestHttpCalls.getToken({ email: 'admin@example.com', password: 'error' })
    )
  })

  test('Invalid login - Invalid email', async ({ assert }) => {
    await assert.rejects(
      async () => await TestHttpCalls.getToken({ email: 'error', password: '123456' })
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
