import { test } from '@japa/runner'
import TestHttpCalls from '../utils/TestHttpCalls'

test.group('Crud Users', async (group) => {
  group.each.timeout(6000)
  let adminToken = ''
  let studentToken = ''
  const studentBody = {
    first_name: 'daniel',
    second_name: 'jose',
    surname: 'cruz',
    second_sur_name: 'casallas',
    type_document: 1,
    document_number: '987654321',
    email: 'estudiante_generado@gmail.com',
    password: '32jdkdi',
    rol_id: 2,
    phone: '32123122314',
  }
  group.setup(async () => {
    adminToken = await TestHttpCalls.getAdminToken()
    studentToken = await TestHttpCalls.getStudentToken()
  })

  test('Create user - Invalid credentials', async ({ assert }) => {
    await assert.rejects(async () => await TestHttpCalls.createUser(studentBody, studentToken))
  })

  test('Create user - Incomplete info', async ({ assert }) => {
    const data = {
      first_name: studentBody.first_name,
      second_name: studentBody.second_name,
    }
    await assert.rejects(async () => await TestHttpCalls.createUser(data, adminToken))
  })

  test('Create user - Valid credentials', async ({ assert }) => {
    try {
      const response = await TestHttpCalls.createUser(studentBody, adminToken)
      assert.strictEqual(response?.status, 200)
      assert.strictEqual(response?.data['message'], 'Estudiante creado correctamente')
    } catch (error) {
      assert.fail()
    }
  })

  test('Edit user - Invalid credentials', async ({ assert }) => {
    await assert.rejects(async () => {
      await TestHttpCalls.editUser(
        2,
        {
          first_name: 'Test',
          second_name: 'Test',
          surname: 'Test',
          second_sur_name: 'Test',
          type_document: 1,
          document_number: 100000000,
          email: 'test@test.com',
          password: 'testExecute',
          retype_password: 'testExecute',
          rol_id: 2,
          phone: '100000000',
        },
        studentToken
      )
    })
  })

  test('Edit user - Incomplete info', async ({ assert }) => {
    try {
      await TestHttpCalls.editUser(
        2,
        {
          document_number: 100000000,
          phone: '100000000',
        },
        adminToken
      )
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Edit user - Invalid info', async ({ assert }) => {
    try {
      await TestHttpCalls.editUser(-Number.POSITIVE_INFINITY, {}, adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Edit user - Password not match', async ({ assert }) => {
    try {
      await TestHttpCalls.editUser(
        2,
        {
          first_name: 'Test',
          second_name: 'Test',
          surname: 'Test',
          second_sur_name: 'Test',
          type_document: 1,
          document_number: 100000000,
          email: 'test@test.com',
          password: 'testExecute',
          retype_password: 'testExecute',
          rol_id: 2,
          phone: '100000000',
        },
        adminToken
      )
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Edit user - Valid credentials', async ({ assert }) => {
    try {
      await TestHttpCalls.editUser(
        2,
        {
          first_name: 'Test',
          second_name: 'Test',
          surname: 'Test',
          second_sur_name: 'Test',
          type_document: 1,
          document_number: 100000000,
          email: 'test@test.com',
          password: 'testExecute',
          rol_id: 2,
          phone: '100000000',
        },
        adminToken
      )
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Get Users - Invalid credentials', async ({ assert }) => {
    await assert.rejects(async () => {
      await TestHttpCalls.getAllUsers(studentToken)
    })
  })

  test('Get Users - Valid credentials', async ({ assert }) => {
    try {
      const { data } = await TestHttpCalls.getAllUsers(adminToken)
      assert.isTrue(data?.state)
    } catch (error) {
      assert.fail()
    }
  })

  test('Get user by id - Invalid credentials', async ({ assert }) => {
    let userId: number = 0
    try {
      const userResponse = await TestHttpCalls.getBodyFromEmail('test@test.com', adminToken)
      userId = userResponse.user['id']
      assert.isNotNull(userId)
      assert.notStrictEqual(userId, 0)
    } catch (error) {
      assert.fail()
    }

    try {
      await TestHttpCalls.getUserById(userId, studentToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Get user by id - Valid credentials', async ({ assert }) => {
    let userId: number = 0
    try {
      const userResponse = await TestHttpCalls.getBodyFromEmail('test@test.com', adminToken)
      userId = userResponse.user['id']
      assert.isNotNull(userId)
      assert.notStrictEqual(userId, 0)
    } catch (error) {
      assert.fail()
    }

    try {
      const response = await TestHttpCalls.getUserById(userId, adminToken)
      assert.strictEqual(response.status, 200)
    } catch (error) {
      assert.fail()
    }
  })

  test('Delete user - Invalid credentials', async ({ assert }) => {
    let userId: number = 0
    // Get data
    try {
      const userResponse = await TestHttpCalls.getBodyFromEmail('admin@example.com', adminToken)
      userId = userResponse.user['id']
      assert.isNotNull(userId)
      assert.notStrictEqual(userId, 0)
    } catch (error) {
      assert.fail()
    }

    // Function
    try {
      await TestHttpCalls.deleteUser(userId, studentToken)
      assert.fail()
    } catch (error) {
      const user = await TestHttpCalls.getUserById(userId, adminToken)
      assert.isTrue(user.data['state'])
    }
  })

  test('Delete user - Invalid info', async ({ assert }) => {
    const userId = 0
    try {
      await TestHttpCalls.deleteUser(userId, adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })

  test('Delete user - Valid credentials', async ({ assert }) => {
    try {
      const userResponse = await TestHttpCalls.getBodyFromEmail('test@test.com', adminToken)
      const userId = userResponse.user['id']
      assert.isNotNull(userId)
      assert.notStrictEqual(userId, 0)

      const response = await TestHttpCalls.deleteUser(userId, adminToken)
      assert.strictEqual(response.status, 200)
    } catch (error) {
      assert.fail()
    }

    try {
      await TestHttpCalls.getBodyFromEmail('test@test.com', adminToken)
      assert.fail()
    } catch (error) {
      assert.isTrue(true)
    }
  })
})
