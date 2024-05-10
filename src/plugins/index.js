/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from "./vuetify";
import router from "./router";
import axios from "axios";

const baseURL = "http://localhost:8080";
// const baseUrl = process.env.API_URL;
export const api = axios.create({ baseURL });

export function registerPlugins(app) {
  app.use(vuetify);
  app.use(router);
}
