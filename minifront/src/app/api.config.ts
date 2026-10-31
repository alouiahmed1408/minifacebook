// All HTTP calls go through /api.
//  - dev:  `npm start` proxies /api -> http://localhost:8086 (see proxy.conf.json)
//  - prod: Nginx proxies /api -> the Spring Boot container (see nginx.conf)
export const API_URL = 'https://YOUR-BACKEND.onrender.com';
