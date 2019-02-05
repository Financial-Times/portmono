const {Command, flags} = require('@oclif/command')
const Heroku = require('heroku-client')
const ConfigReader = require('../config')

class HerokuPromoteCommand extends Command {
  async run() {
    const {flags} = this.parse(HerokuPromoteCommand)
    const configReader = new ConfigReader()
    const configFile = configReader.read()

    if (!configFile.pipelines) {
      this.log('Nothing to deploy!')
      return
    }
    try {
      const config = configFile.pipelines[flags.pipeline]
      this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })
      this.heroku.post('/pipeline-promotions', {
        body: config
      })
      .then(response => {
        console.log(response)
      })
      .catch((err) => {
        console.log(err)
      })
    } catch(err) {
      console.log(err)
    }
  }
}

HerokuPromoteCommand.description = `Promote a Heroku application within a pipeline`

HerokuPromoteCommand.flags = {
  pipeline: flags.string({char: 'p', description: 'Pipeline to promote'}),
}

module.exports = HerokuPromoteCommand
