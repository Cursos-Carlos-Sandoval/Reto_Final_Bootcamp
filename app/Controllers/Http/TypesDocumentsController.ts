import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TypesDocument from '../../Models/TypesDocument'
import Database from '@ioc:Adonis/Lucid/Database'

export default class TypesDocumentsController {
  public async register({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const { name } = request.all()
      const typeDocument = new TypesDocument()
      typeDocument.name = name

      await typeDocument.save()
      await trx.commit()

      response.status(200).json({ status: true, message: 'Tipo de documento creado correctamente' })
    } catch (error) {
      await trx.rollback()
      console.error(error)

      response
        .status(400)
        .json({ status: false, message: 'Fallo en la creación del tipo de documento' })
    }
  }

  public async getAll(): Promise<TypesDocument[]> {
    return await TypesDocument.query().select('*').where('state', true)
  }
}
