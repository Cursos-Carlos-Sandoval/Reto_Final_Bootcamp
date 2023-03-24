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

  public static async createUser(body: any, token: string) {
    const endpoint = `${TestHttpCalls.API_BASE}/user/create`

    const axiosResponse = await axios.post(`${Env.get('PATH_APP') + endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return axiosResponse
  }
}
