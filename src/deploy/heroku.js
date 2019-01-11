const Deploy = require('./deploy')
const Heroku = require('heroku-client')
const netrc = require('netrc-parser').default
const git = require('../git')

class HerokuDeploy extends Deploy {
    constructor(opts) {
      super(opts)
      this.herokuToken = process.env.HEROKU_API_TOKEN
      this.heroku = new Heroku({ token: this.herokuToken })
      this.appName = opts.appName
      this.directory = opts.directory
      this.force = opts.force || false
    }

    async deploy() {
      try {
        await this.configureNetrc()

        const app = await this.getApp()
        const gitRemote = `heroku-${this.appName}`
        await git.RemoteCreate(gitRemote, app.git_url)

        const subtreePushArguments = [this.directory, gitRemote, 'master']
        if (this.force) {
          subtreePushArguments.push('--force')
        }
        await git.SubtreePush(...subtreePushArguments)
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

    async getApp() {
      try {
        const app = await this.heroku.get(`/apps/${this.appName}`)
        return app
      } catch (err) {
        throw new Error(err.body.message)
      }
    }

    log() {
      console.log(`${this.appName}:`, ...arguments)
    }

    withGitAuth(url) {
      const rewritten = new URL(url)
      rewritten.username = 'heroku'
      rewritten.password = this.herokuToken
      return rewritten.toString()
    }
}

module.exports = HerokuDeploy
