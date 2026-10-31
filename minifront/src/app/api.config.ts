// All HTTP calls go through /api.
//  - dev:  `npm start` proxies /api -> http://localhost:8086 (see proxy.conf.json)
//  - prod: Nginx proxies /api -> the Spring Boot container (see nginx.conf)
export const API_URL = 'https://minifacebook-api-89d4.onrender.com/';
