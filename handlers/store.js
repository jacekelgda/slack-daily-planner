import firebase from 'firebase'
import * as messageFormatter from '../util/formatter'
import { identifyDevBotData } from './api/slack'

const TOKENS = 'tokens'
const TEAMS = 'teams'
const USERS = 'users'
const LISTS = 'lists'

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
    const usersTokens = firebase.database().ref(`${TOKENS}/${USERS}`)
      usersTokens.once('value', (snapshot) => {
        let tokens = []
        const snaps = snapshot.val()
        for (var key in snaps) {
          if (snaps.hasOwnProperty(key)) {
            tokens.push({ token: snaps[key].bot.botToken, user: key })
          }
        }
        resolve(tokens)
    })
  })
}

// ^^ tokens, slack auth - might need another file

const createNewTasksList = (id, items, userId) => {
  return new Promise((resolve, reject) => {
    let newList = []
    items.forEach((item, index) => {
      const data = {
        name: item,
        achieved: false
      }
      firebase.database().ref(`${LISTS}/${userId}/${id}/tasks/${index}`).set(data)
      newList.push(data)
    })
    resolve(newList)
  })
}

const fetchCurrentList = (userId) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref(`${LISTS}/${userId}`).limitToLast(1)
    lastEntry.on('value', (snapshot) => {
      let tasks
      snapshot.forEach(function(data) {
        tasks = data.val().tasks
      })
      resolve(tasks)
    })
  })
}

const fetchList = (id, userId) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref(`${LISTS}/${userId}/${id}`)
    lastEntry.on('value', (snapshot) => {
      resolve(snapshot.val().tasks)
    })
  })
}

const getCurrentListId = (userId) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref(`${LISTS}/${userId}`).limitToLast(1)
    lastEntry.on('value', (snapshot) => {
      let listId;
      snapshot.forEach(function(data) {
        listId = data.key
      })
      resolve(listId)
    })
  })
}

const persistTasksFromMessageToList = (id, message, userId) => {
  const items = messageFormatter.processMessage(message);
  fetchCurrentList(userId).then((tasks) => {
    items.forEach((item, index) => {
      const taskKey = index + tasks.length
      firebase.database().ref(`${LISTS}/${userId}/${id}/tasks/${taskKey}`).set({
        name: item,
        achieved: false
      })
    })
  })
}

const persistJournalMessageDetails = (listId, ts, channel, userId) => {
  firebase.database().ref(`${LISTS}/${userId}/${listId}/meta`).set({
    channel: channel,
    ts: ts
  })
}

/**
 * @return {ts, channel}
 */
const getListMetadata = (id, userId) => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref(`${LISTS}/${userId}/${id}/meta`)
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

const markTaskAchieved = (currentListId, index, item, userId) => {
  firebase.database().ref(`${LISTS}/${userId}/${currentListId}/tasks/${index}`).set(item)
}

const storeGCalAuthToken = (token) => {
  firebase.database().ref('auth/').set(token)
}

const getGCalAuthToken = () => {
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
  storeGCalAuthToken,
  getGCalAuthToken,
  storeTeamToken,
  setupDevTeam,
  getAllTokens,
  init,
  storeUserToken,
}
