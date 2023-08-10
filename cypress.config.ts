import { defineConfig } from "cypress";

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false, // disable video when run "npx cypress run"
  env: {
    // it is overwrote by cypress.env.json. we don't want to push cypress.env.json. we add manual by run the comman "npx cypress open --env username=abs,password=xyz"
    // or we can run with secret data by using "DB_USERNAME="123" PASSWORD="xxx" npm run cy:open_process"
    username: "artem.bondar16@gmail.com",
    password: "CypressTest1",
    apiUrl: "https://api.realworld.io",
  },
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    excludeSpecPattern: ["**/1-getting-started/*", "**/2-advanced-examples/*"],
    setupNodeEvents(on, config) {
      {
        // write when we want to run with secret data
        // const username = process.env['DB_USERNAME']
        // const password = process.env['PASSWORD']
        // if(!password){
        //   throw new Error("Missing password evironment variable")
        // }
        // config.env = {username,password};
        // return config
      }
      // implement node event listeners here
    },
  },
});
