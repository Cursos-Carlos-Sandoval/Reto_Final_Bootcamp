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
        rolId,
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
        rol_id: rolId,
        phone: phone,
      })

      await trx.commit()
    } catch (error) {
      console.error(error)
      await trx.rollback()
      throw new Error('User creation failed')
    }
  }

  private static async getUserByEmail(email: string): Promise<User> {
    const data = await User.query()
      .select('*')
      .where('email', email)
      .andWhere('state', true)
      .first()
    if (data === null) throw new Error('User not found')
    return data
  }

  private static isValidPassword(password: string, user: User): boolean {
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
        users: students.toJSON()?.data,
      })
    } catch (error) {
      console.error(error)
      response.status(400).json({ state: false, message: 'Fallo en el listado de estudiantes' })
    }
  }

  public async registerStudent({ request, response }: HttpContextContract) {
    try {
      const body = request.all()
      const data = {
        firstName: body.first_name,
        secondName: body.second_name,
        surname: body.surname,
        secondSurName: body.second_sur_name,
        typeDocument: body.type_document,
        documentNumber: body.document_number,
        email: body.email,
        password: body.password,
        rolId: body.rol_id,
        phone: body.phone,
      }

      await UsersController.createUser(data)
      response.status(200).json({ state: true, message: 'Estudiante creado correctamente' })
    } catch (error) {
      response.status(400).json({ state: false, message: 'Fallo en la creación del estudiante' })
    }
  }

  public async login({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    let user: User
    try {
      user = await UsersController.getUserByEmail(email)
      if (!UsersController.isValidPassword(password, user))
        return response.status(400).json({ state: false, message: 'contraseña o email invalido' })
    } catch (error) {
      console.error(error)
      return response.status(400).json({ state: false, message: 'contraseña o email invalido' })
    }

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
  }

  public async editUser({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      if (request.input('password') !== request.input('retype_password')) {
        throw new Error('Passwords do not match')
      }

      await User.findOrFail(request.param('id_user'))

      const salt = bcryptjs.genSaltSync()
      await User.query()
        .where('id', request.param('id_user'))
        .andWhere('state', true)
        .update({
          first_name: request.input('first_name'),
          second_name: request.input('second_name'),
          surname: request.input('surname'),
          second_sur_name: request.input('second_sur_name'),
          type_document: request.input('type_document'),
          document_number: request.input('document_number'),
          email: request.input('email'),
          password: bcryptjs.hashSync(request.input('password'), salt),
          phone: request.input('phone'),
        })
      await trx.commit()

      response.status(200).json({ state: true, message: 'Se actualizo correctamente' })
    } catch (error) {
      await trx.rollback()
      response.status(400).json({ state: false, message: 'Error al editar el usuario' })
    }
  }

  public async deleteUser({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const user = await User.query()
        .where('id', request.param('id_user'))
        .andWhere('state', true)
        .firstOrFail()
      await user.save()
      await trx.commit()
      response.status(200).json({ state: true, message: 'Se elimino el estudiante correctamente' })
    } catch (error) {
      console.error(error)
      trx.rollback()
      response
        .status(400)
        .json({ state: false, message: 'Ocurrió un fallo al eliminar el estudiante' })
    }
  }

  public async getUserById({ request, response }: HttpContextContract) {
    try {
      const user = await User.query()
        .where('id', request.param('id_user'))
        .andWhere('state', true)
        .firstOrFail()

      response.status(200).json({
        state: true,
        message: 'Usuario solicitado',
        user: {
          id: user?.id,
          first_name: user?.first_name,
          second_name: user?.second_name,
          surname: user?.surname,
          second_sur_name: user?.second_sur_name,
          type_document: user?.type_document,
          document_number: user?.document_number,
          email: user?.email,
          rol_id: user?.rol_id,
          phone: user?.phone,
          state: user?.state,
        },
      })
    } catch (error) {
      response
        .status(400)
        .json({ state: false, message: 'Error al consultar el detalle del usuario', user: null })
    }
  }

  public async getByMail({ request, response }: HttpContextContract) {
    try {
      const plainEmail: string = request.param('email')
      const email = plainEmail.replace('%40', '@')
      const user = await UsersController.getUserByEmail(email)

      response.status(200).json({
        state: true,
        message: 'Usuario solicitado',
        user: {
          id: user?.id,
          first_name: user?.first_name,
          second_name: user?.second_name,
          surname: user?.surname,
          second_sur_name: user?.second_sur_name,
          type_document: user?.type_document,
          document_number: user?.document_number,
          email: user?.email,
          rol_id: user?.rol_id,
          phone: user?.phone,
          state: user?.state,
        },
      })
    } catch (error) {
      console.error(error)
      response
        .status(400)
        .json({ state: false, message: 'Error al consultar el detalle del usuario', user: null })
    }
  }
}
