const dashund = require('./dashund')

;(async () => {
  await dashund.runServer(3000)
  console.log('Listening on :3000')
})()
