import { EnvironmentConfig } from "./env-config";

const API_ENDPOINT_V1 = 'https://prodgenapi-pw.azurewebsites.net/api/';
// const API_ENDPOINT_V1 = 'http://localhost:9492/api/'; // local api url

export const environment: EnvironmentConfig = {
  production: false,
  apiKey: '9d391065-2abe-4681-9ea3-a78557a42a13',
  apiUrlV1: API_ENDPOINT_V1,
  apiUrlV2: API_ENDPOINT_V1 + 'v2'
};
