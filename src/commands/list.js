const {Command} = require('@oclif/command')
const ConfigReader = require('../config')

class ListCommand extends Command {
  async run() {
    const configReader = new ConfigReader()
    const config = configReader.read()

    if (!config.deploy) {
      this.log('No services defined!')
      return
    }


    this.log("Services:")
    config.deploy.forEach(service => this.log(service.app))
  }
}

ListCommand.description = `List
...
Lists services within this monorepo.
`

module.exports = ListCommand
