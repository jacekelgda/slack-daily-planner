import express from 'express'
import interactiveMessagesController from './interactiveMessagesController'

const router = new express.Router()

router.use(interactiveMessagesController)

export default router
