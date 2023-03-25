import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Answer from '../../Models/Answer'
import Form from '../../Models/Form'

export default class FormsController {
  public async getAllQuestions({ response }: HttpContextContract) {
    try {
      const answers = await Answer.query().preload('question').select('*').where('state', true)
      response.status(200).send({ state: true, questions: answers ?? [] })
    } catch (error) {
      response.status(400).send({ state: false, message: 'Error al obtener el listado' })
    }
  }

  public async saveQuestions({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const studentId = request.input('student_id')
      const answersId: number[] = request.input('answers')

      const data = answersId.map((id) => {
        return {
          student_id: studentId,
          answer_id: id,
          state: true,
        }
      })

      await Form.createMany(data)
      await trx.commit()
      response.status(200).send({ state: true, message: 'Respuestas almacenadas con éxito' })
    } catch (error) {
      trx.rollback()
      console.error(error)
      response
        .status(400)
        .send({ state: false, message: 'No se pudieron almacenar las respuestas' })
    }
  }
}
