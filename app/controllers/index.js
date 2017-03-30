import express from 'express'
import interactiveMessagesController from './interactiveMessagesController'

const router = new express.Router()

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
router.use(interactiveMessagesController)

export { router }
