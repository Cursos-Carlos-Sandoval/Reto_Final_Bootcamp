import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import UsersController from '../../app/Controllers/Http/UsersController'

export default class TestHttpCalls {
  private static readonly API_BASE = 'api/v1'

  public static async getToken(body: { email: string; password: string }): Promise<string> {
    const endpoint = `${TestHttpCalls.API_BASE}/login`
    const axiosResponse = await axios.post(`${Env.get('PATH_APP') + endpoint}`, body)

    return axiosResponse.data['token'] ?? ''
  }

  public static async getAdminToken(): Promise<string> {
    const body = {
      email: 'admin@example.com',
      password: '123456',
    }

    return await TestHttpCalls.getToken(body)
  }

  public static async getStudentToken(): Promise<string> {
    const body = {
      email: 'admin@example.com',
      password: '123456',
    }

    return await TestHttpCalls.getToken(body)
  }

  public static async getBodyFromEmail(email: string) {
    const user = await UsersController.getUserByEmail(email)
    if (user === null) return null
    return {
      id: user?.id,
      firstName: user?.first_name,
      secondName: user?.second_name,
      surname: user?.surname,
      secondSurName: user?.second_sur_name,
      typeDocument: user?.type_document,
      documentNumber: user?.document_number,
      email: user?.email,
      rol: user?.rol_id,
      phone: user?.phone,
    }
  }

  public static async createUser(body: any, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/create`

    const axiosResponse = await axios.post(`${Env.get('PATH_APP') + endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }

  public static async editUser(id_user: number, body: any, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/update/${id_user}`
    const axiosResponse = await axios.put(`${Env.get('PATH_APP') + endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }

  public static async deleteUser(id_user: number, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/delete/${id_user}`
    const axiosResponse = await axios.put(`${Env.get('PATH_APP') + endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }
}
