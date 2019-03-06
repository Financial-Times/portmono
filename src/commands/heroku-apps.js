const {Command} = require('@oclif/command')
const HerokuClient = require('../heroku-client')

class HerokuAppsCommand extends Command {
  async run() {
    this.heroku = new HerokuClient({ token: process.env.HEROKU_API_TOKEN })
    this.heroku.listApps()
  }
}

HerokuAppsCommand.description = `List Heroku apps linked to a given API Key, useful to get ids for managing apps`

module.exports = HerokuAppsCommand
