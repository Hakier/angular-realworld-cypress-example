import { defineConfig } from 'cypress';


export default defineConfig({
  e2e: {
    viewportHeight: 1080,
    viewportWidth: 1920,
    baseUrl: 'http://localhost:4200',
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  env: {
    username: 'artem.bondar16@gmail.com',
    password: 'CypressTest1',
    apiUrl: 'https://conduit.productionready.io',
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
  setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Promise<Cypress.PluginConfigOptions | void> | Cypress.PluginConfigOptions | void {
    const { USERNAME: username, PASSWORD: password } = process.env;

    if (!password) {
      throw new Error('Missing PASSWORD environment variable');
    }

    config.env = { username, password };

    return config;
  }
});
