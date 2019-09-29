const axios = require('axios')
const prompts = require('prompts')
const { colorizeURL, promptsOpts } = require('../token-tools')

//
// Relevant links
// - https://open-platform.theguardian.com/access/
// - https://open-platform.theguardian.com/documentation/
//

module.exports = {
  async createFromCLI(dashund) {
    console.log("First, you'll need a guardian developer key")
    console.log(
      'Open:',
      colorizeURL('https://open-platform.theguardian.com/access/')
    )
    console.log()

    const { secretKey } = await prompts(
      [
        {
          type: 'password',
          name: 'secretKey',
          message: 'Enter your darksky secret key',
          initial: process.env.GUARDIAN_SECRET_KEY
        }
      ],
      promptsOpts
    )

    const params = { 'api-key': secretKey }
    const res = await axios.get('http://content.guardianapis.com/editions', {
      params
    })

    const editionToChoice = edition => {
      return {
        title: edition.edition,
        value: edition.id
      }
    }

    const { edition } = await prompts({
      type: 'select',
      name: 'edition',
      message: 'Pick an edition',
      choices: res.data.response.results.map(editionToChoice)
    })

    return { secretKey, edition }
  },
  hasExpired() {
    return false
  },
  refreshToken() {
    return null
  }
}
