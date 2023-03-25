import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Question from '../../Models/Question'
import Database from '@ioc:Adonis/Lucid/Database'
import Answer from '../../Models/Answer'

export default class QuestionsController {
  public async register({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const data = request.input('question')
      const question = await Question.create({
        question: data,
      })

      // Create answers per question
      const options = request.input('options')
      const parsedOptions = options.map(({ answer, is_correct }) => {
        return {
          answer: answer,
          is_correct: is_correct,
          question_id: question.id,
        }
      })

      await Answer.createMany(parsedOptions)

      await trx.commit()
      response.status(200).send({ state: true, message: 'Pregunta creada exitosamente' })
    } catch (error) {
      await trx.rollback()
      console.error(error)
      response.status(400).send({ state: false, message: 'Error al crear la pregunta' })
    }
  }

  public async getQuestions({ response }: HttpContextContract) {
    try {
      const question = await Question.query().where('state', true).select('id', 'question')
      response
        .status(200)
        .send({ state: true, message: 'Listado de preguntas', questions: question ?? [] })
    } catch (error) {
      response.status(400).send({ state: false, message: 'Error al listar las preguntas' })
    }
  }

  public async editById({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      await Question.query()
        .where('id', request.param('id_question'))
        .update({
          question: request.input('question'),
        })
      await trx.commit()

      response.status(200).send({ state: true, message: 'Pregunta editada con éxito' })
    } catch (error) {
      await trx.rollback()
      console.error(error)
      response.status(400).send({ state: false, message: 'Error al editar la pregunta' })
    }
  }

  public async deleteById({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const question = await Question.findOrFail(request.param('id_question'))
      question.state = false
      await question.save()
      await trx.commit()
      response.status(200).send({ state: true, message: 'Pregunta eliminada con éxito' })
    } catch (error) {
      await trx.rollback()
      console.error(error)
      response.status(400).send({ state: false, message: 'Error al eliminar la pregunta' })
    }
  }
}
