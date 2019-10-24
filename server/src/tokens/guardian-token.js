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
          message: 'Enter your Guardian developer secret key',
          initial: process.env.GUARDIAN_SECRET_KEY
        }
      ],
      promptsOpts
    )

    const sectionsRes = await axios.get(
      'https://content.guardianapis.com/sections',
      { params: { 'api-key': secretKey } }
    )

    const sectionToChoice = section => {
      return {
        title: section.webTitle,
        value: section.id
      }
    }

    const { sections } = await prompts({
      type: 'autocompleteMultiselect',
      name: 'sections',
      message: 'Pick an edition',
      choices: sectionsRes.data.response.results.map(sectionToChoice)
    })

    return { secretKey, sections }
  },
  hasExpired() {
    return false
  },
  refreshToken() {
    return null
  }
}
