const {Command, flags} = require('@oclif/command')
const Heroku = require('../heroku-client')

class HerokuPromoteCommand extends Command {
  /**
   * Run a promotion via the Heroku API
   * @returns {Promise<void>}
   */
  async run() {
    try {
      const {flags} = this.parse(HerokuPromoteCommand)

      this.herokuToken = process.env.HEROKU_API_TOKEN
      this.heroku = new Heroku({token: this.herokuToken})

      //  Identify source and target stages
      const sourceStage = flags.source
      const targetStage = this.getTargetStage(sourceStage, flags.target)
      //  Retrieve app data via the API...
      const appData = await this.heroku.getAppData(flags.app)
      //  We're really just looking for the pipeline id....
      const pipelineId = appData.pipeline.id
      //  So that we can retrieve an array of all of the apps in that pipeline....
      const apps = await this.heroku.getAppsInPipeline(pipelineId)
      //  Verify both exist within pipeline, and get their unique ids
      const sourceAppId = this.heroku.getAppIdByStage(sourceStage, apps, flags.app)
      const targetAppId = this.heroku.getAppIdByStage(targetStage, apps, flags.app)

      console.log('Promoting ' + flags.app + ' from ' + sourceStage + ' to ' + targetStage)
      //  Perform the promotion
      this.heroku.promote(pipelineId, sourceAppId, targetAppId)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * These are the only valid stages we're able to use for Heroku
   * @returns {string[]}
   */
  validStages() {
    return ['development', 'staging', 'production']
  }

  /**
   * Use a specified target or attempt to work out the next stage automatically
   * @param sourceStage {string}
   * @param targetStage {string}
   * @returns {string}
   */
  getTargetStage(sourceStage, targetStage = null) {
    if (targetStage) {
      if (this.validStages().includes(targetStage)) {
        return targetStage
      }

      throw('Invalid target stage ' + targetStage)
    }

    const sourceIndex = this.validStages().indexOf(sourceStage)

    if (this.validStages()[sourceIndex + 1]) {
      return this.validStages()[sourceIndex + 1]
    }

    throw('Invalid target stage ' + targetStage)
  }
}

HerokuPromoteCommand.description = `Promote a Heroku application within a pipeline`

HerokuPromoteCommand.flags = {
  app: flags.string({char: 'a', description: 'App to promote'}),
  source: flags.string({char: 's', description: 'Source stage'}),
  target: flags.string({char: 't', description: 'Target stage'}),
}

module.exports = HerokuPromoteCommand
