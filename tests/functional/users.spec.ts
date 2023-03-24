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

test.group('Crud Users', async (group) => {
  group.each.timeout(6000)
  const adminToken = await TestHttpCalls.getAdminToken()
  const studentToken = await TestHttpCalls.getStudentToken()
  const studentBody = {
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

  test('Create user - Invalid credentials', async ({ assert }) => {
    await assert.rejects(async () => await TestHttpCalls.createUser(studentBody, studentToken))
  })

  test('Create user - Incomplete info', async ({ assert }) => {
    const { firstName, secondName } = studentBody
    await assert.rejects(
      async () => await TestHttpCalls.createUser({ firstName, secondName }, adminToken)
    )
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
          rol_id: 2,
          phone: '100000000',
        },
        studentToken
      )
    })
  })

  test('Edit user - Incomplete info', async ({ assert }) => {
    await assert.rejects(async () => {
      await TestHttpCalls.editUser(
        2,
        {
          document_number: 100000000,
          phone: '100000000',
        },
        adminToken
      )
    })
  })

  test('Edit user - Valid credentials', async ({ assert }) => {
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
          rol_id: 2,
          phone: '100000000',
        },
        adminToken
      )
    })
  })

  test('Get Users - Invalid credentials', async ({ assert }) => {
    await assert.rejects(async () => {})
  })

  test('Get Users - Valid credentials', async ({ assert }) => {})

  test('Delete user - Invalid credentials', async ({ assert }) => {
    const user = await TestHttpCalls.getBodyFromEmail(studentBody.email)
    const userId = user?.id ?? 0
    assert.isNotNull(user)
    assert.notEqual(user?.id, 0)

    await assert.rejects(async () => {
      await TestHttpCalls.deleteUser(userId, studentToken)
    })
  })

  test('Delete user - Invalid info', async ({ assert }) => {
    const userId = 0

    await assert.rejects(async () => {
      await TestHttpCalls.deleteUser(userId, adminToken)
    })
  })

  test('Delete user - Valid credentials', async ({ assert }) => {
    try {
      const user = await TestHttpCalls.getBodyFromEmail(studentBody.email)
      const userId = user?.id ?? 0
      assert.isNotNull(user)
      assert.notEqual(user?.id, 0)

      const response = await TestHttpCalls.deleteUser(userId, studentToken)
      assert.strictEqual(response.status, 200)
    } catch (error) {
      assert.fail()
    }
  })
})
