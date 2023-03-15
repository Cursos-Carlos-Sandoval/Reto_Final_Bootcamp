import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TypesDocument from '../../Models/TypesDocument'

export default class TypesDocumentsController {
  public async register({ request, response }: HttpContextContract) {
    const { name } = request.all()
    const typeDocument = new TypesDocument()
    typeDocument.name = name

    await typeDocument.save()
    return response.status(200).json({ typeDocument, msg: 'Type document registered' })
  }

  public async getAllTypesDocuments(): Promise<TypesDocument[]> {
    return await TypesDocument.all()
  }
}
