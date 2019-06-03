const {Command, flags} = require('@oclif/command')
const ConfigReader = require('../config')

class DeployCommand extends Command {
  constructor(...args) {
    super(...args)
    this.deployStates = []
    this.hasDeployFailed = false
  }

  async run() {
    const {flags} = this.parse(DeployCommand)
    this.force = (flags.force === true)
    this.stage = flags.stage ? flags.stage : 'development'
    const singleApp = flags['single-app']? flags['single-app'] : false

    const configReader = new ConfigReader()
    const configFile = configReader.read()

    if (!configFile.deploy) {
      this.log('Nothing to deploy!')
      return
    }
    
    if(singleApp !== false){
      this.log(`Starting single app deploy for ${singleApp}`)
      const singleAppToDeploy = configFile.deploy.filter((serviceConfig) => {
        return serviceConfig.app === singleApp
      }).shift()

      if(singleAppToDeploy === undefined){
        this.error(`App ${singleApp} not found in portmono.json!`)
      }

      await this.runDeploy(singleAppToDeploy)
      return
    }

    for(const serviceConfig of configFile.deploy) {
      await this.runDeploy(serviceConfig)
    }
    
    //Display a summary of all of the deploys that have been pushed
    console.table(this.deployStates)

    if(this.hasDeployFailed) {
      //If deploy has failed return a non zero status code
      this.error('Deploy failed!')
    }
  }

  async runDeploy(serviceConfig){
    try {
      const serviceName = serviceConfig.name || serviceConfig.app
      const servicePath = serviceConfig.src

      switch (serviceConfig.type) {
        case 'heroku': {
          const HerokuDeploy = require('../deploy/heroku')
          const herokuDeploy = new HerokuDeploy({
            appName: serviceName,
            directory: servicePath,
            stage: this.stage,
            force: this.force
          })
          try {
            await herokuDeploy.deploy()
            this.addDeployState(serviceName, herokuDeploy.getDeployStatus())
          } catch (err) {
            this.addDeployState(serviceName, false)
            this.warn(`Error occurred for ${serviceName}: ${err.toString()}`)
          }
        }
          break;
      }
    } catch (err) {
      this.error(err)
    }
  }

  addDeployState(appName, state){
    //If one deploy has failed mark the entire deploy as having failed
    if(!state){
      this.hasDeployFailed = true
    }

    //Push a row to be used by console.table
    this.deployStates.push({
      "App Name": appName,
      "Did Deploy?": state
    })
  }
}

DeployCommand.flags = {
  force: flags.boolean({char: 'f'}),
  stage: flags.string({char: 's'}),
  'single-app': flags.string()
}

DeployCommand.description = `Deploy
...
Deploys services within this monorepo.
`

module.exports = DeployCommand
