import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Answer from '../../Models/Answer'

export default class AnswersController {
  public async editById({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      await Answer.query()
        .where('id', request.param('id_opcion'))
        .update({
          answer: request.input('opcion'),
          is_correct: request.input('iscorrect'),
        })

      await trx.commit()
      response.status(200).send({ state: true, message: 'Opción editada con éxito' })
    } catch (error) {
      await trx.rollback()
      console.error(error)
      response.status(400).send({ state: false, message: 'Error al editar la opción' })
    }
  }

  public async getAnswersByQuestionId({ request, response }: HttpContextContract) {
    try {
      const answers = await Answer.query()
        .where('question_id', request.param('id_question'))
        .andWhere('state', true)
        .select('id', 'answer')

      response.status(200).send({ state: true, message: 'Listado de opciones', options: answers })
    } catch (error) {
      console.error(error)
      response
        .status(400)
        .send({ state: false, message: 'Error al obtener el listado de opciones' })
    }
  }
}
