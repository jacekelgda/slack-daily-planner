import express from 'express'
import * as botHandler from '../handlers/bot'
import * as storeHandler from '../handlers/store'

const router = new express.Router()

router.post('/im', async function (req, res) {
	if (req.body.payload) {
		const payload = JSON.parse(req.body.payload)
    const originalMessageText = payload.original_message.attachments[0].text
    if (payload.actions[0].value === '1') {
      const listId = payload.callback_id
      let listMeta = await storeHandler.getListMetadata(listId)
      if (listMeta.ts && listMeta.channel) {
        botHandler.updateMessageInJournal(listMeta.ts, originalMessageText, listMeta.channel)
      } else {
        botHandler.sendMessageToJournal(listId, originalMessageText)
      }
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
