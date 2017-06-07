import express from 'express'
import interactiveMessagesController from './interactiveMessages'
import authController from './auth'

const router = new express.Router()

router.use(interactiveMessagesController)
router.use(authController)

export default router
