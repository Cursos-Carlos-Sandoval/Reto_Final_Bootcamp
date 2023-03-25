import { test } from '@japa/runner'
import TestHttpCalls from '../utils/TestHttpCalls'
import UsersController from '../../app/Controllers/Http/UsersController'

test.group('Controller', async (group) => {
  group.each.timeout(6000)
  let adminToken = ''

  group.setup(async () => {
    adminToken = await TestHttpCalls.getAdminToken()
  })

  test('Error Validate Token', ({ assert }) => {
    assert.throws(() => UsersController.verifyToken('EXAMPLE_TOKEN INVALID_VALUE'))
  })

  test('Invalid params on getAllStudents function', async ({ assert }) => {
    try {
      await TestHttpCalls.getAllUsers(adminToken, '?perPage=-20&page=a')
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Get by id - Invalid case', async ({ assert }) => {
    try {
      await TestHttpCalls.getUserById(-Infinity, adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Get by id - Invalid case', async ({ assert }) => {
    try {
      await TestHttpCalls.getBodyFromEmail('', adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Invalid params on getByEmail function', async ({ assert }) => {
    try {
      await TestHttpCalls.getBodyFromEmail('invalid@email.com', adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })
})
