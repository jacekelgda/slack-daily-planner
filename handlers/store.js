import firebase from 'firebase'
import * as messageFormatter from '../util/formatter'
import { identifyDevBotData } from './api/slack'

const TOKENS = 'tokens'
const TEAMS = 'teams'
const USERS = 'users'

const config = {
  apiKey: process.env.firebase_config_apiKey,
  authDomain: process.env.firebase_config_authDomain,
  databaseURL: process.env.firebase_config_databaseURL,
  storageBucket: process.env.firebase_config_storageBucket,
  messagingSenderId: process.env.firebase_config_messagingSenderId
};

const init = () => {
  try {
    firebase.initializeApp(config)
    firebase.auth().signInAnonymously()
  } catch (e) {
    console.log('Firebase auth error', e)
  }
}

const storeTeamToken = (token) => {
  const botData = { botToken: token.bot.bot_access_token, botUserId: token.bot.bot_user_id }
  const data = { teamId: token.team_id, bot: botData, token: token.access_token }
  const ref = `${TOKENS}/${TEAMS}/${token.team_id}`
  firebase.database().ref(ref).set(data)
}

const storeUserToken = (token) => {
  const botData = { botToken: token.bot.bot_access_token, botUserId: token.bot.bot_user_id }
  const data = { teamId: token.team_id, bot: botData, token: token.access_token }
  const ref = `${TOKENS}/${USERS}/${token.user_id}`
  firebase.database().ref(ref).set(data)
}

const setupDevTeam = async function() {
  let devBotData = await identifyDevBotData()
  const botData = { bot_access_token: process.env.slack_bot_token, bot_user_id: devBotData.user_id}
  const tokenData = { bot: botData, team_id: devBotData.team_id, access_token: process.env.slack_api_token}
  storeTeamToken(tokenData)
}

const getAllTokens = () => {
  return new Promise((resolve, reject) => {
    const teamsTokens = firebase.database().ref(`${TOKENS}/${USERS}`)
      teamsTokens.once('value', (snapshot) => {
        let tokens = []
        const snaps = snapshot.val()
        for (var key in snaps) {
          if (snaps.hasOwnProperty(key)) {
            tokens.push({ token: snaps[key].bot.botToken, team: key })
          }
        }
        resolve(tokens)
    })
  })
}

const createNewTasksList = (id, items) => {
  return new Promise((resolve, reject) => {
    items.forEach((item, index) => {
      firebase.database().ref('lists/' + id + '/tasks/' + index).set({
        name: item,
        achieved: false
      })
    })
    resolve(true)
  })
}

const fetchCurrentList = () => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists').limitToLast(1)
    lastEntry.on('value', (snapshot) => {
      let tasks
      snapshot.forEach(function(data) {
        tasks = data.val().tasks
      })
      resolve(tasks)
    })
  })
}

const fetchList = (id) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists/' + id)
    lastEntry.on('value', (snapshot) => {
      resolve(snapshot.val().tasks)
    })
  })
}

const getCurrentListId = () => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists').limitToLast(1)
    lastEntry.on('value', (snapshot) => {
      let listId;
      snapshot.forEach(function(data) {
        listId = data.key
      })
      resolve(listId)
    })
  })
}

const persistTasksFromMessageToList = (id, message) => {
  const items = messageFormatter.processMessage(message);
  fetchCurrentList().then((tasks) => {
    items.forEach((item, index) => {
      firebase.database().ref('lists/' + id + '/tasks/' + (index + tasks.length)).set({
        name: item,
        achieved: false
      })
    })
  })
}

const persistJournalMessageDetails = (listId, ts, channel) => {
  firebase.database().ref('lists/' + listId + '/meta').set({
    channel: channel,
    ts: ts
  })
}

/**
 * @return {ts, channel}
 */
const getListMetadata = (id) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists/' + id + '/meta')
    lastEntry.on('value', (snapshot) => {
      if (snapshot.val()) {
        resolve({
          ts: snapshot.val().ts,
          channel:snapshot.val().channel
        })
      } else {
        resolve({ts: null, channel:null})
      }
    })
  })
}

const markTaskAchieved = (currentListId, index, item) => {
  firebase.database().ref('lists/' + currentListId + '/tasks/' + index).set(item)
}

const storeAuthToken = (token) => {
  firebase.database().ref('auth/').set(token)
}

const getAuthToken = () => {
  return new Promise((resolve, reject) => {
    const token = firebase.database().ref('auth')
    token.on('value', (snapshot) => {
      resolve(snapshot.val())
    })
  })
}

export {
  createNewTasksList,
  fetchList,
  fetchCurrentList,
  getCurrentListId,
  persistTasksFromMessageToList,
  persistJournalMessageDetails,
  getListMetadata,
  markTaskAchieved,
  storeAuthToken,
  getAuthToken,
  storeTeamToken,
  setupDevTeam,
  getAllTokens,
  init,
  storeUserToken,
}
