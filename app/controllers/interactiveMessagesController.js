import express from 'express'

const router = new express.Router()

router.post('/im', function (req, res) {
	if (req.body.payload) {
		payload = JSON.parse(req.body.payload)

    console.log('im', payload)

		message = {
			"text": "Thanks!",
		};
		res.json(message);

	} else {
		res.send('Invalid param');
	}
})

export { router }
