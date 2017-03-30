import firebase from 'firebase'
import * as messageFormatter from '../util/formatter'

const config = {
  apiKey: process.env.firebase_config_apiKey,
  authDomain: process.env.firebase_config_authDomain,
  databaseURL: process.env.firebase_config_databaseURL,
  storageBucket: process.env.firebase_config_storageBucket,
  messagingSenderId: process.env.firebase_config_messagingSenderId
};

const app = firebase.initializeApp(config);

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
    const lastEntry = firebase.database().ref('lists').limitToLast(1);
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

export {
  createNewTasksList,
  fetchList,
  fetchCurrentList,
  getCurrentListId,
  persistTasksFromMessageToList
}
