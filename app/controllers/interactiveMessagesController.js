import express from 'express'
import { sendMessageToJournal } from '../handlers/chatHandler'

const router = new express.Router()

router.post('/im', function (req, res) {
	if (req.body.payload) {
		const payload = JSON.parse(req.body.payload)
    const originalMessageText = payload.original_message.attachments[0].text
    if (payload.actions[0].value === '1') {
      sendMessageToJournal(originalMessageText)
    }
		const message = {
			"text": "Done!",
		}
		res.json(message);

	} else {
		res.send('Invalid param')
	}
})

export default router
