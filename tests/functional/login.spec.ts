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
