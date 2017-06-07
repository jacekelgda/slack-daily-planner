import slack from 'slack-node'
import { handleAuthResponse } from '../../util/error'

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



export {
  exchangeCodeForToken,
  identifyDevBotData,
}
