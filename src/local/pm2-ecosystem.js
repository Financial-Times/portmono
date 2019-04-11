const path = require('path')
const {existsSync, readFileSync} = require('fs')
const {parse} = require('dotenv')
const ConfigReader = require('../config')

const pm2EcosystemFormat = {
  apps : []
}

//Shared env vars
const sharedEnvVars = {
  PORT: 0, // Let node allocate a random port.
  NODE_ENV: 'development',
  DYNO: 'x'
}

const pm2Service = {
  name: '<<service>>',
  cwd: '<<path>>',
  script: 'npm run start',
  instances: 1,
  autorestart: true,
  watch: true,
  max_memory_restart: '1G',
  env: sharedEnvVars
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

        const templateEnv = Object.assign({}, pm2Service.env)
        const globalEnv = {} // Global variables (specified for _this_ process)
        const localEnv = {} // Used for local overrides

        // Attempt to load in local-overrides.
        const localDotEnvFile = path.resolve(cwd, '.env')
        if (existsSync(localDotEnvFile)) {
          Object.assign(localEnv, parse(readFileSync(path.resolve(cwd, '.env'))))
        }

        // Override variables globally from the master process (this)
        // Format: `a-service-name` => `a_service_name_VARIABLE`
        const globalOverride = name.replace('-', '_')
        Object.keys(process.env)
          .filter(key => key.startsWith(globalOverride))
          .forEach(key => globalEnv[key.replace(`${globalOverride}_`, '')] = process.env[key])

        // Squash templated environment, global environment and local environment.
        const env = Object.assign({}, localEnv, globalEnv, templateEnv)

        // Explicitly read the PORT variable from the master process (this)
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
