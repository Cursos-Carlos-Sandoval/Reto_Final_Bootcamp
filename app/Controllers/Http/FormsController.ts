import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Answer from '../../Models/Answer'
import Form from '../../Models/Form'

export default class FormsController {
  private static async parseAllData(answers: Answer[]) {
    // response container
    let form: { id: number; question: string; options: { id: number; answer: string }[] }[] = []

    // store the state of the question to relate it to the answers when it is
    // time to change the question (remember that they are organized by question_id)
    let actualQuestion: number | undefined
    let actualQuestionString: string = ''

    // store answers of question
    let tempMap: { id: number; answer: string }[] = []

    while (answers.length > 0) {
      // get answer of que
      const answerObj: Answer | undefined = answers.pop()
      if (answerObj === undefined) break

      // first iteration - set state
      if (actualQuestion === undefined) {
        actualQuestion = answerObj.question_id
        actualQuestionString = answerObj.question.question
      }

      // change of context (state) and last case
      if (answerObj.question_id !== actualQuestion || answers.length === 0) {
        // push relation to container
        form.unshift({
          id: actualQuestion,
          question: actualQuestionString,
          options: tempMap,
        })

        // reset state
        tempMap = []
        actualQuestion = undefined
      }

      // push answer
      const optionObj = { id: answerObj.id, answer: answerObj.answer }
      tempMap.unshift(optionObj)
    }

    // push answer that got stuck in the buffer
    form[0].options.unshift(tempMap[0])
    return form
  }

  public async getAllQuestions({ response }: HttpContextContract) {
    try {
      const answers = await Answer.query()
        .preload('question')
        .where('state', true)
        .orderBy('question_id', 'asc')
      const form = await FormsController.parseAllData(answers)
      response.status(200).send({
        state: true,
        message: 'Formulario',
        questions: form,
      })
    } catch (error) {
      console.error(error)
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
