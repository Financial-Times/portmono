if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: '.env',
  })
}

const {Command, flags} = require('@oclif/command')
const Heroku = require('heroku-client')
const pipelines = require('../config/pipelines')

class HerokuPromoteCommand extends Command {
  async run() {
    const {flags} = this.parse(HerokuPromoteCommand)
    try {
      const config = pipelines[flags.pipeline]
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
