import { defineConfig } from 'cypress';
import axios from 'axios';

export default defineConfig({
  e2e: {
    baseUrl: 'https://demo.opencart.com/en-gb',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    defaultCommandTimeout: 10_000,
    pageLoadTimeout: 30_000,
    requestTimeout: 15_000,
    responseTimeout: 15_000,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    video: true,
    screenshotOnRunFailure: true,

    viewportWidth: 1280,
    viewportHeight: 800,

    // CYPRESS_MOCK=true in CI promotes to Cypress.env('MOCK') automatically
    env: {
      MOCK: false,
    },

    setupNodeEvents(on, config) {
      on('task', {
        log(message: string) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },

        checkCloudflare: async (): Promise<boolean> => {
          try {
            const response = await axios.get<string>('https://demo.opencart.com', {
              timeout: 10_000,
              validateStatus: () => true,
              responseType: 'text',
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QE-Lab/2.0)' },
              maxRedirects: 3,
            });
            if (response.status === 403) return true;
            if (typeof response.data === 'string') {
              return (
                response.data.includes('Just a moment') ||
                response.data.includes('_cf_chl') ||
                response.data.includes('cf-browser-verification')
              );
            }
            return false;
          } catch {
            return false;
          }
        },
      });
      return config;
    },
  },
});
