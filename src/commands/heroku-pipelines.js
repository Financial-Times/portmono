const { Command } = require('@oclif/command')
const HerokuClient = require('../heroku-client')

class HerokuPipelinesCommand extends Command {
  async run() {
    this.heroku = new HerokuClient({ token: process.env.HEROKU_API_TOKEN })
    this.heroku.listPipelines()
  }
}

HerokuPipelinesCommand.description = `List Heroku pipelines linked to a given API Key, useful to get ids for managing apps`

module.exports = HerokuPipelinesCommand
