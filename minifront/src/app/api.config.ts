import { environment } from '../environments/environment';

// All HTTP calls go through this base URL.
//  - dev:  `npm start` -> /api is proxied to http://localhost:8086 (see proxy.conf.json)
//  - prod: the absolute backend URL (see src/environments/environment.ts)
export const API_URL = environment.apiUrl;
