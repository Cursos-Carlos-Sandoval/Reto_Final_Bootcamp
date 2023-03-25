/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'UsersController.login')

  Route.group(() => {
    Route.group(() => {
      Route.get('/getUsers', 'UsersController.getAllStudents')
      Route.get('/getUser/:id_user', 'UsersController.getUserById')
      Route.get('/getByMail/:email', 'UsersController.getByMail')
      Route.post('/create', 'UsersController.registerStudent')
      Route.put('/update/:id_user', 'UsersController.editUser')
      Route.delete('/delete/:id_user', 'UsersController.deleteUser')
    })
      .prefix('/user')
      .middleware('admin')

    Route.group(() => {
      Route.get('/getQuestions', 'QuestionsController.getQuestions')

      Route.group(() => {
        Route.post('/create', 'QuestionsController.register')
        Route.put('/editQuestion/:id_question', 'QuestionsController.editById')
        Route.delete('/deleteQuestion/:id_question', 'QuestionsController.deleteById')

        Route.get('/getAnswers/:id_question', 'AnswersController.getAnswersByQuestionId')
        Route.put('/updateAnswer/:id_answer', 'AnswersController.editById')
      }).middleware('admin')
    }).prefix('/questions')

    Route.group(() => {
      Route.get('/getQuestions', 'FormsController.getAllQuestions')
      Route.post('/postQuestions', 'FormsController.saveQuestions')
    })
      .prefix('/form')
      .middleware('admin')

    Route.group(() => {
      Route.get('/getRoles', 'RolesController.getAll')
    })
      .prefix('/role')
      .middleware('admin')

    Route.group(() => {
      Route.get('/getTypes', 'TypesDocumentsController.getAll')
    })
      .prefix('/type_document')
      .middleware('admin')
  }).middleware('auth')
}).prefix('/api/v1')
