const Deploy = require('./deploy')
const HerokuClient = require('../heroku-client')
const netrc = require('netrc-parser').default
const git = require('../git')

class HerokuDeploy extends Deploy {
  constructor(opts) {
    super(opts)
    this.herokuToken = process.env.HEROKU_API_TOKEN
    this.heroku = new HerokuClient({token: this.herokuToken})
    this.appName = opts.appName
    this.directory = opts.directory
    this.force = opts.force || false
    this.stage = opts.stage || 'development'
  }

  /**
   * Run a deployment via the Heroku API
   * @returns {Promise<void>}
   */
  async deploy() {
    try {
      await this.configureNetrc()
      //  Retrieve app data via the API...
      const appData = await this.heroku.getAppData(this.appName)
      //  We're really just looking for the pipeline id....
      const pipelineId = appData.pipeline.id
      //  So that we can retrieve an array of all of the apps in that pipeline....
      const apps = await this.heroku.getAppsInPipeline(pipelineId)
      //  When we have the apps, we can look for one that matches the requested stage...
      const appId = this.heroku.getAppIdByStage(this.stage, apps, this.appName)
      //  We then retrieve the actual app version we want to deploy to....
      if (appId !== false) {
        const actualApp = await this.heroku.getApp(appId)
        //  And push our subtree to the relevant remote
        const gitRemote = `heroku-${actualApp.name}`
        await git.RemoteCreate(gitRemote, actualApp.git_url)

        const subtreePushArguments = [this.directory, gitRemote, 'master']
        if (this.force) {
          subtreePushArguments.push(true)
        }
        await git.SubtreePush(...subtreePushArguments)
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Use the HerokuToken to interact with remote hosts
   * @returns {Promise<void>}
   */
  async configureNetrc() {
    netrc.loadSync()
    const hosts = ['api.heroku.com', 'git.heroku.com']
    hosts.forEach(host => {
      if (!netrc.machines[host]) netrc.machines[host] = {}
      netrc.machines[host].password = this.herokuToken
    })
    netrc.saveSync()
  }
}

module.exports = HerokuDeploy
