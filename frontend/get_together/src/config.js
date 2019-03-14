/* eslint-disable */
let config;

if (process.env.NODE_ENV === "production") {
  config = {
    $apiUrl: "http://localhost:8080"
  };
} else {
  config = {
    $apiUrl: "http://localhost:3333"
  };
}

export { config }