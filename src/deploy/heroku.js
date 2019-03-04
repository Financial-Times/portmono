const Deploy = require('./deploy')
const Heroku = require('heroku-client')
const netrc = require('netrc-parser').default
const git = require('../git')

class HerokuDeploy extends Deploy {
  constructor(opts) {
    super(opts)
    this.herokuToken = process.env.HEROKU_API_TOKEN
    this.heroku = new Heroku({token: this.herokuToken})
    this.appName = opts.appName
    this.directory = opts.directory
    this.force = opts.force || false
    this.stage = opts.stage || 'development'
  }

  async deploy() {
    try {
      await this.configureNetrc()
      //  Retrieve app data via the API, we're really just looking for the pipeline id....
      const appData = await this.getAppData(this.appName)
      //  So that we can retrieve an array of all of the apps in that pipeline....
      const apps = await this.getAppsInPipeline(appData.pipeline.id)
      //  When we have the apps, we can look for one that matches the requested stage...
      const appId = this.getAppIdByStage(this.stage, apps)
      //  We then retrieve the actual app version we want to deploy to....
      if (appId !== false) {
        const actualApp = await this.getApp(appId)
        //  And push our subtree to the relevant remote
        const gitRemote = `heroku-${actualApp.name}`
        await git.RemoteCreate(gitRemote, actualApp.git_url)

        const subtreePushArguments = [this.directory, gitRemote, 'master']
        if (this.force) {
          subtreePushArguments.push(true)
        }
        await git.SubtreePush(...subtreePushArguments)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async configureNetrc() {
    netrc.loadSync()
    const hosts = ['api.heroku.com', 'git.heroku.com']
    hosts.forEach(host => {
      if (!netrc.machines[host]) netrc.machines[host] = {}
      netrc.machines[host].password = this.herokuToken
    })
    netrc.saveSync()
  }

  async getApp(id) {
    try {
      const app = await this.heroku.get(`/apps/${id}`)
      return app
    } catch (err) {
      throw new Error(err.body.message)
    }
  }

  async getAppData(appName) {
    return this.heroku.get('/apps/' + appName + '/pipeline-couplings')
  }

  async getAppsInPipeline(pipelineId) {
    return this.heroku.get('/pipelines/' + pipelineId + '/pipeline-couplings')
  }

  getAppIdByStage(stage, apps) {
    var result = false

    apps.forEach(app => {
      if (app.stage === stage) {
        result = app.app.id
      }
    })

    return result;
  }

  withGitAuth(url) {
    const rewritten = new URL(url)
    rewritten.username = 'heroku'
    rewritten.password = this.herokuToken
    return rewritten.toString()
  }
}

module.exports = HerokuDeploy
