import Vue from "vue";
import App from "./App.vue";
import VueGeolocation from "vue-browser-geolocation";
import VueRouter from "vue-router";
import { config } from './config';
import Axios from 'axios';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.prototype.appConfig = config
Vue.prototype.$http = Axios;

Vue.use(VueGeolocation);
Vue.use(VueRouter);

Vue.config.productionTip = false;

import Login from "./components/Public/Login/Login.vue";
// import GMap from "./components/GMap.vue";
import Home from "./components/Home.vue";
import CreateAccount from "./components/Public/Create/CreateAccount.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/create", name: "Create Account", component: CreateAccount}
];

const router = new VueRouter({ routes, mode: 'history'});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
