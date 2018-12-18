const {Command} = require('@oclif/command')
const fs = require('fs')
const path = require('path')

class ListCommand extends Command {
  async run() {
    const configFile = JSON.parse(fs.readFileSync(path.resolve('./portmono.json')))

    this.log("Services:")
    configFile.deploy.forEach(service => this.log(service.app))
  }
}

ListCommand.description = `List
...
Lists services within this monorepo.
`

module.exports = ListCommand
