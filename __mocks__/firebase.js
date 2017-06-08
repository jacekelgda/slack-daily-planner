const val = () => {
  return {
    ts: '123',
    channel: 'abc123',
  }
}

const on = (value, callback) => {
  if (value == 'value') {
    callback({ val })
  }
}

const ref = (url) => {
  return { on }
}

const database = () => {
  return { ref }
}

export default {
  database
}
