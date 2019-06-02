/* eslint-disable */
let config;

if (process.env.NODE_ENV === "production") {
  const API_PORT = process.env.API_PORT || 3333;
  const API_URL = process.env.API_URL || document.location.hostname;
  config = {
    $apiUrl: `http://${API_URL}:${API_PORT}`
  };
} else {
  const API_PORT = process.env.API_PORT || 3333;
  const API_URL = process.env.API_URL || document.location.hostname;
  config = {
    $apiUrl: `http://${API_URL}:${API_PORT}`
  };
}

export { config }