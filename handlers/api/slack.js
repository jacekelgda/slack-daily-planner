import slack from 'slack-node'
import { handleAuthResponse } from '../../util/error'
import { getUserToken } from '../../handlers/store'
import { bots } from '../../handlers/bot'

const identifyDevBotData = () => {
  return new Promise((resolve, reject) => {
    const slackClient = new slack(process.env.slack_bot_token)
    slackClient.api('auth.test', (err, response) => {
      if (err) {
        reject(err)
      } else {
        resolve(response)
      }
    })
  })
}

const exchangeCodeForToken = (code) => {
  return new Promise((resolve, reject) => {
    const data = {
      client_id: process.env.slack_app_client_id,
      client_secret: process.env.slack_app_client_secret,
      code,
      redirect_uri: process.env.slack_app_redirect_uri,
    }

    const slackClient = new slack(process.env.slack_api_token)
    slackClient.api('oauth.access', data, (err, response) => {
      try {
        handleAuthResponse(response)
      } catch (e) {
        reject('invalid token')
        console.log('oauth access error', e)
      } finally {
        resolve(response)
      }
    })
  })
}

const getListOfPrivateChannel = async (user) => {
  const userToken = await getUserToken(user)
  const slackClient = new slack(userToken.token)
  return new Promise((resolve, reject) => {
    slackClient.api('groups.list', {}, (err, response) => {
      resolve(response.groups)
    })
  })
}

const inviteBotToPrivateChannel = async (user, channel) => {
  const userToken = await getUserToken(user)
  const bot = bots[user].identity.id
  const slackClient = new slack(userToken.token)
  return new Promise((resolve, reject) => {
    const data = { channel, user: bot }
    slackClient.api('groups.invite', data, (err, response) => {
      resolve(response)
    })
  })
}

const createPrivateChannel = async (user, name) => {
  const userToken = await getUserToken(user)
  const slackClient = new slack(userToken.token)
  return new Promise((resolve, reject) => {
    slackClient.api('groups.create', { name }, (err, response) => {
      resolve(response)
    })
  })
}

export {
  exchangeCodeForToken,
  identifyDevBotData,
  getListOfPrivateChannel,
  inviteBotToPrivateChannel,
  createPrivateChannel,
}
