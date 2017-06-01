import Botkit from 'botkit'
import { bots } from '../../chatHandler'

const identifyDevBotData = () => {
    bot.api.auth.test({}, (err, response) => {
      console.log(err, response)
    })
  })
}

// const exchangeCodeForToken = (code) => {
//   return new Promise((resolve, reject) => {
//     const data = {
//       client_id: process.env.slack_app_client_id,
//       client_secret: process.env.slack_app_client_secret,
//       code,
//       redirect_uri: process.env.slack_app_redirect_uri,
//     }
//     const slackClient = new slack(process.env.slack_api_token)
//     slackClient.api('oauth.access', data, (err, response) => {
//       try {
//         errorUtil.handleAuthResponse(response)
//       } catch (e) {
//         reject('invalid token')
//       } finally {
//         resolve(response)
//       }
//     })
//   })
// }
//


export {
  // exchangeCodeForToken,
  identifyDevBotData,
}
