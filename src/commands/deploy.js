const path = require('path')
const os = require('os')
const fs = require('fs')
const {Command} = require('@oclif/command')

class DeployCommand extends Command {
  async run() {
    const configFile = JSON.parse(fs.readFileSync(path.resolve('./portmono.json')))

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
                  console.error(`Error occurred for ${serviceName}:`, err.message)
                }

                // console.log(`git subtree push --prefix ${servicePath} heroku-${serviceName} master --force`)
            }
            break;
        }
      } catch (err) {
        console.error(err)
      }
    })

  }
}

DeployCommand.description = `Deploy
...
Deploys services within this monorepo.
`

module.exports = DeployCommand
