const { Command } = require('@oclif/command')
const HerokuClient = require('../heroku-client')

class HerokuPipelinesCommand extends Command {
  /**
   * Return a list of available pipelines via the Heroku API, useful for obtaining unique ids for further interactions
   * @returns {Promise<void>}
   */
  async run() {
    this.heroku = new HerokuClient({ token: process.env.HEROKU_API_TOKEN })
    const pipelines = this.heroku.listPipelines()
    console.log(pipelines)
  }
}

HerokuPipelinesCommand.description = `List Heroku pipelines linked to a given API Key, useful to get ids for managing apps`

module.exports = HerokuPipelinesCommand
