/* eslint-disable */
let config;

if (process.env.NODE_ENV === "production") {
  config = {
    $api_url: "http://localhost:8080"
  };
} else {
  config = {
    $api_url: "http://localhost:8080"
  };
}

export { config }