const {Command, flags} = require('@oclif/command')
const ConfigReader = require('../config')

class DeployCommand extends Command {
  async run() {
    const {flags} = this.parse(DeployCommand)
    const force = (flags.force === true)
    const version = flags.version || 'staging'

    const configReader = new ConfigReader()
    const configFile = configReader.read()

    if (!configFile.deploy) {
      this.log('Nothing to deploy!')
      return
    }

    configFile.deploy.forEach(serviceConfig => {
      try {
        const serviceName = serviceConfig.name || serviceConfig.apps[version]
        const servicePath = serviceConfig.src

        switch (serviceConfig.type) {
            case 'heroku': {
                const HerokuDeploy = require('../deploy/heroku')
                const herokuDeploy = new HerokuDeploy({
                  appName: serviceName,
                  directory: servicePath,
                  force
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

DeployCommand.flags = {
  force: flags.boolean({char: 'f'})
}

DeployCommand.description = `Deploy
...
Deploys services within this monorepo.
`

module.exports = DeployCommand
