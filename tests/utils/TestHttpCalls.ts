import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

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
      email: 'test@test.com',
      password: 'testExecute',
    }

    return await TestHttpCalls.getToken(body)
  }

  public static async getBodyFromEmail(email: string, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/getByMail/${email}`

    const axiosResponse = await axios.get(`${Env.get('PATH_APP') + endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse.data
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
    const endpoint = `${TestHttpCalls.API_BASE}/user/update/${id_user}`
    const axiosResponse = await axios.put(`${Env.get('PATH_APP') + endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }

  public static async deleteUser(id_user: number, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/delete/${id_user}`
    const axiosResponse = await axios.delete(`${Env.get('PATH_APP') + endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }

  public static async getAllUsers(token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/getUsers`
    const axiosResponse = await axios.get(`${Env.get('PATH_APP') + endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }

  public static async getUserById(userId: number, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/getUser/${userId}`
    const axiosResponse = await axios.get(`${Env.get('PATH_APP') + endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }
}
