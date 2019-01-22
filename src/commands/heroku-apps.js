const { Command } = require('@oclif/command')
const Heroku = require('heroku-client')

class HerokuAppsCommand extends Command {
  async run() {
    this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })
    this.heroku.get('/apps').then(apps => {
      console.log(apps)
    })
    .catch((err) => {
      console.log(err)
    })
  }
}

HerokuAppsCommand.description = `List Heroku apps linked to a given API Key, useful to get ids for managing apps`

module.exports = HerokuAppsCommand
