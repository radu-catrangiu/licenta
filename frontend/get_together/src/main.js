import Vue from "vue";
import App from "./App.vue";
import VueGeolocation from "vue-browser-geolocation";
import VueRouter from "vue-router";

Vue.use(VueGeolocation);
Vue.use(VueRouter);

Vue.config.productionTip = false;

import Login from "./components/Login.vue";
// import Home from "./components/Home.vue";
import GMap from "./components/GMap.vue";

const routes = [
  { path: "/", name: "Acasa", component: GMap },
  { path: "/login", name: "Login", component: Login }
];

const router = new VueRouter({ routes, mode: 'history'});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");

import { config } from './config';

Vue.prototype.appConfig = config