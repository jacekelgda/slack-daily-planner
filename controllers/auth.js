import express from 'express'

import { exchangeCodeForToken } from '../handlers/api/slack'

import * as calendarHandler from '../handlers/calendar'
import * as storeHandler from '../handlers/store'
import * as botHandler from '../handlers/bot'

const router = new express.Router()

router.post('/gcalauth', async function (req, res) {
  const googleAuthCode = req.body.code
  try {
    const googleOauthClient = await calendarHandler.exchangeCodeToToken(googleAuthCode)
    res.send('Thanks!')
  } catch (e) {
    console.log('Google auth error', e)
    res.send('Sorry, there was an error')
  }
})

router.get('/auth', async function (req, res) {
  try {
    let token = await exchangeCodeForToken(req.query.code)
    storeHandler.storeUserToken(token)
    const bot = botHandler.createNewDedicatedBotConnection({
      token: token.bot.bot_access_token,
      user: token.user_id
    })
    botHandler.greetingsAfterInstall(bot, token.user_id)
    res.send('Thank you for authorizing our application')
  } catch (e) {
    res.send('Error. Invalid/expired code.')
    console.log('Auth error', e)
  }
})

export default router
