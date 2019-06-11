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
    this.deployStatus = false
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

        const subtreePushArguments = []
        
        //  If we are forcing a deploy...
        if(this.force){
          //  Create a temp remote branch
          const remoteBranch = await git.createTemporaryBranch(this.directory, gitRemote)
          //  Try to force push the branch 
          try {
            const result = await git.SubtreeForcePush(gitRemote, remoteBranch, 'master')
            console.log(result)
            //  Mark the deploy as having succeeded
            this.deployStatus = true
          } catch (err) {
            //  In the event that the build in heroku fails and is rejected...
            console.log(`Failed to push to ${gitRemote} ${remoteBranch}: ${err}`)
          } finally {
            //  Always clean up the temp branch
            const result = await git.SubtreeDeleteBranch(remoteBranch)
            console.log(result)
          } 
        } else {
          //Try to do a standard subtree push
          const result = await git.SubtreePush(this.directory, gitRemote, 'master')
          console.log(result)
          this.deployStatus = true
        }
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

  getDeployStatus(){
    return this.deployStatus
  }
}

module.exports = HerokuDeploy
