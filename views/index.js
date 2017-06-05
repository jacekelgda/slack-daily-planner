import express from 'express'
import * as storeHandler from '../handlers/store'
import * as calendarHandler from '../handlers/calendar'

const router = new express.Router()

router.get('/', async function (req, res) {
  try {
    const token = await storeHandler.getAuthToken()
    const client = await calendarHandler.authorize(token)
    res.send('Ok')
  } catch (e) {
    console.log('Auth error:', e)
    const authUrl = await calendarHandler.generateAuthUrl()
    const html = `<a href="${authUrl}">Authenticate application with google api</a>
    <form action="/api/auth" method="post">
       Enter code:
       <input type="text" name="code" placeholder="Code ..." />
       <br>
       <button type="submit">Submit</button>
    </form>`
    res.send(html)
  }
})

export default router
