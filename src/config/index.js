const path = require('path')
const fs = require('fs')

class ConfigReader {
  constructor(configPath = null) {
    if (configPath === null) {
      configPath = path.resolve('./portmono.json')
    }
    this.configPath = configPath
  }

  // Make sure it actually exists.
  exists() {
    if (!this.configPath) {
      throw new Error(`${this.configPath} does not seem like a valid path.`)
    }
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`${this.configPath} does not exist.`)
    }
    return true
  }

  // Valdiate config file against JSON schema.
  validate() {
    this.exists()
    return true
  }

  // Read the configuration file.
  read() {
    this.exists()
    if (!this.validate()) {
    }
    const config = JSON.parse(fs.readFileSync(this.configPath))
    return config
  }
}

module.exports = ConfigReader
