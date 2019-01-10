const path = require('path')
const dotenv = require('dotenv')
const ConfigReader = require('../config')

const pm2EcosystemFormat = {
  apps : []
}

const pm2Service = {
  name: '<<service>>',
  cwd: '<<path>>',
  script: 'npm run start',
  instances: 1,
  autorestart: true,
  watch: true,
  max_memory_restart: '1G',
  env: {
    PORT: 0, // Let node allocate a random port.
    NODE_ENV: 'development'
  }
}

class PM2Ecosystem {

  static generateHerokuApps(serviceConfig) {
    return serviceConfig.deploy

      // We can only act on Heroku apps.
      .filter(l => l.type === 'heroku')

      // Spec out a service file.
      .map(appConfig => {
        const name = appConfig.name || appConfig.app
        const cwd = path.resolve(appConfig.src)

        // Allow conditionally overriding any variables via a dotenv.
        const env = Object.assign({}, pm2Service.env, dotenv.parse(`${cwd}/.env`))

        // Attempt to read the PORT variable from the master process (this)
        // Format: `a-service-name` => `a_service_name_PORT`
        env.PORT = process.env[`${name.replace('-', '_')}_PORT`] || env.PORT

        // Finally merge everything into a normal pm2 config file.
        return Object.assign({}, pm2Service, {name, cwd, env})
      })
  }

  // Return an ecosystem schema
  static ecosystem() {
    const configReader = new ConfigReader()
    const serviceConfig = configReader.read()

    const pm2Ecosystem = Object.assign({}, pm2EcosystemFormat)
    pm2Ecosystem.apps = this.generateHerokuApps(serviceConfig)

    return pm2Ecosystem
  }

}

module.exports = PM2Ecosystem
