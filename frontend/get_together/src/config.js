/* eslint-disable */
let config;

if (process.env.NODE_ENV === "production") {
  config = {
    $api_url: "https://api.xxx.com",
    timeoutDuration: 30000,
    someOtherProps: 'xyz'
  };
} else {
  config = {
    $api_url: "https://yyy.test:8443",
    timeoutDuration: 1000,
    someOtherProps: 'abc'
  };
}

export { config }