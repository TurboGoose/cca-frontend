/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from "./vuetify";
import router from "./router";
import axios from "axios";

export const api = axios.create({ baseURL: process.env.API_URL })

export function registerPlugins(app) {
  app.use(vuetify);
  app.use(router);
}
