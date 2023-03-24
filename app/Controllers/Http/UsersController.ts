import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import bcryptjs from 'bcryptjs'
import User from '../../Models/User'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
  private static async createUser(dataRequest: any) {
    const trx = await Database.transaction()

    try {
      const {
        firstName,
        secondName,
        surname,
        secondSurName,
        typeDocument,
        documentNumber,
        email,
        password,
        rol,
        phone,
      } = dataRequest

      const salt = bcryptjs.genSaltSync()
      await User.create({
        first_name: firstName,
        second_name: secondName,
        surname: surname,
        second_sur_name: secondSurName,
        type_document: typeDocument,
        document_number: documentNumber,
        email: email,
        password: bcryptjs.hashSync(password, salt),
        rol_id: rol,
        phone: phone,
      })

      await trx.commit()
    } catch (error) {
      console.error(error)
      await trx.rollback()
      throw new Error('User creation failed')
    }
  }

  private static async getUserByEmail(email: string): Promise<User | null> {
    return await User.findBy('email', email)
  }

  private static isValidPassword(password: string, user: User | null): boolean {
    if (user === null) return false
    return bcryptjs.compareSync(password, user.password)
  }

  private static createToken(payload: any): string {
    const options = {
      expiresIn: '60 mins',
    }
    return jwt.sign(payload, Env.get('JWT_PRIVATE_KEY'), options)
  }

  public static getTokenFromHeader(authorizationHeader: string): string {
    return authorizationHeader.split(' ')[1]
  }

  public static verifyToken(authorizationHeader: string): void {
    const token = UsersController.getTokenFromHeader(authorizationHeader)
    jwt.verify(token, Env.get('JWT_PRIVATE_KEY'), (error: any) => {
      if (error) {
        throw new Error('Expired token')
      }
    })
  }

  public static getTokenPayload(authorizationHeader: string): JwtPayload | any {
    const token = UsersController.getTokenFromHeader(authorizationHeader)
    return jwt.verify(token, Env.get('JWT_PRIVATE_KEY'), { complete: true }).payload
  }

  public async getAllStudents({ request, response }: HttpContextContract) {
    try {
      const params = request.all()

      const students = await Database.from('users')
        .where('rol_id', Database.from('roles').select('id').where('name', 'Estudiante')) // get role_id of student
        .andWhere('state', true)
        .select(
          'first_name',
          'second_name',
          'surname',
          'second_sur_name',
          'type_document',
          'document_number',
          'email',
          'phone'
        )
        .paginate(params?.page ?? 1, params?.perPage ?? 10)

      response.status(200).json({
        state: true,
        message: 'Listado de estudiantes',
        users: students.toJSON()?.data ?? [],
      })
    } catch (error) {
      console.error(error)
      response.status(400).json({ state: false, message: 'Fallo en el listado de estudiantes' })
    }
  }

  public async registerStudent({ request, response }: HttpContextContract) {
    try {
      await UsersController.createUser(request.all())
      response.status(200).json({ state: true, message: 'Estudiante creado correctamente' })
    } catch (error) {
      response.status(400).json({ state: false, message: 'Fallo en la creación del estudiante' })
    }
  }

  public async login({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const user = await UsersController.getUserByEmail(email)
      if (!user)
        return response.status(400).json({ state: false, message: 'contraseña o email invalido ' })

      if (!UsersController.isValidPassword(password, user))
        return response.status(400).json({ state: false, message: 'contraseña o email invalido ' })

      const payload = {
        id: user.id,
        type_document: user.type_document,
        document_number: user.document_number,
        rol_id: user.rol_id,
        state: user.state,
      }

      const token: string = UsersController.createToken(payload)
      const roleName = await Database.from('roles').select('name').where('id', user.rol_id)
      response.status(200).json({
        state: true,
        id: user.id,
        name: `${user.first_name} ${user.second_name} ${user.surname} ${user.second_sur_name}`,
        role: `${roleName[0].name}`,
        token: token,
        message: 'Ingreso exitoso',
      })
    } catch (error) {
      console.error(error)
      response.status(400).json({ state: false, message: 'contraseña o email invalido' })
    }
  }

  public async editUser({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      await User.query()
        .where('id', request.param('id_user'))
        .update({
          first_name: request.input('firstName'),
          second_name: request.input('secondName'),
          surname: request.input('surname'),
          second_sur_name: request.input('secondSurName'),
          type_document: request.input('typeDocument'),
          document_number: request.input('documentNumber'),
          email: request.input('email'),
          phone: request.input('phone'),
        })
      await trx.commit()

      response.status(200).json({ state: true, message: 'Se actualizo correctamente' })
    } catch (error) {
      await trx.rollback()
      response.status(400).json({ state: false, message: 'Error al actualizar' })
    }
  }

  public async deleteUser({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const user = await User.findByOrFail('id', request.param('id_user'))
      user.state = false
      await user.save()
      await trx.commit()
      response.status(200).json({ state: true, message: 'Se elimino el estudiante correctamente' })
    } catch (error) {
      console.error(error)
      trx.rollback()
    }
  }

  public async getUserById({ request, response }: HttpContextContract) {
    try {
      const user = await User.query()
        .where('id', request.param('id_user'))
        .andWhere('state', true)
        .first()
      response.status(200).json({ state: true, user: user })
    } catch (error) {
      response
        .status(400)
        .json({ state: false, message: 'Error al consultar el detalle del usuario' })
    }
  }

  public async getByMail({ request, response }: HttpContextContract) {
    try {
      const email = request.param('email')
      const user = await UsersController.getUserByEmail(email)
      response.status(200).json({
        state: true,
        message: 'Usuario indicado',
        data: {
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
          state: user?.state,
        },
      })
    } catch (error) {
      console.error(error)
      response.status(400).json({
        state: false,
        message: 'Error al obtener el usuario',
      })
    }
  }
}
