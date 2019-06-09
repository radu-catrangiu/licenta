/* eslint-disable */
let config;
const API_PORT = process.env.API_PORT || 3333;
const API_URL = process.env.API_URL || document.location.hostname;

if (process.env.NODE_ENV === "production") {
  config = {
    $apiUrl: `http://${API_URL}:${API_PORT}`
  };
} else {
  config = {
    $apiUrl: `http://${API_URL}:${API_PORT}`
  };
}

config.comments_batch = 5;
config.push_server = `http://${API_URL}:6969`;

export { config }