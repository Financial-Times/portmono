const {Command} = require('@oclif/command')
const ConfigReader = require('../config')

class ValidateCommand extends Command {
  async run() {
    const configReader = new ConfigReader()
    configReader.validate()
  }
}

ValidateCommand.description = `Validate
...
Validates the service configuration file.
`

module.exports = ValidateCommand
