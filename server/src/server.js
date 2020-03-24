const dashund = require('./dashund')

;(async () => {
  await dashund.runServer(3000)
  console.log('Listening on :3000')
})()

process.on('SIGINT', () => process.exit(0))
