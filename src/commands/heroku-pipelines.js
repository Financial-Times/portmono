const { Command } = require('@oclif/command')
const Heroku = require('heroku-client')

class HerokuPipelinesCommand extends Command {
  async run() {
    this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })
    this.heroku.get('/pipelines').then(pipelines => {
      console.log(pipelines)
    })
    .catch((err) => {
      console.log(err)
    })
  }
}

HerokuPipelinesCommand.description = `List Heroku pipelines linked to a given API Key, useful to get ids for managing apps`

module.exports = HerokuPipelinesCommand
