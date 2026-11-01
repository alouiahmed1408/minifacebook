// Local development (`npm start` / `ng serve`).
// Uses the dev-server proxy in proxy.conf.json, so the browser only talks to
// http://localhost:4200 and there is no cross-origin (CORS) request at all.
export const environment = {
  production: false,
  apiUrl: '/api'
};
