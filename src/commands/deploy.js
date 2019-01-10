const {Command} = require('@oclif/command')
const ConfigReader = require('../config')

class DeployCommand extends Command {
  async run() {
    const configReader = new ConfigReader()
    const configFile = configReader.read()

    if (!configFile.deploy) {
      this.log('Nothing to deploy!')
      return
    }

    configFile.deploy.forEach(serviceConfig => {
      try {
        const serviceName = serviceConfig.name || serviceConfig.app
        const servicePath = serviceConfig.src

        switch (serviceConfig.type) {
            case 'heroku': {
                const HerokuDeploy = require('../deploy/heroku')
                const herokuDeploy = new HerokuDeploy({
                  appName: serviceName,
                  directory: servicePath
                })
                try {
                  herokuDeploy.deploy()
                } catch (err) {
                  this.error(`Error occurred for ${serviceName}:`, err.message)
                }
            }
            break;
        }
      } catch (err) {
        this.error(err)
      }
    })

  }
}

DeployCommand.description = `Deploy
...
Deploys services within this monorepo.
`

module.exports = DeployCommand
