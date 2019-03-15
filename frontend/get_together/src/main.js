import Vue from 'vue';
import App from './App.vue';

import { config } from './config';
import Axios from 'axios';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.prototype.appConfig = config;
Vue.prototype.$http = Axios;
Vue.prototype.$http.callAPI = async (service, method, params, callback) => {
    const req = {
        id: 1,
        jsonrpc: '2.0',
        method: method,
        params: params
    };

    const api = config.$apiUrl;
    try {
        const result = await Axios.post(`${api}${service}`, req);
        return callback(null, result.data);
    } catch (error) {
        return callback(error);
    }
};

import VueGeolocation from 'vue-browser-geolocation';
import VueRouter from 'vue-router';
import VueCookie from 'vue-cookie';
Vue.use(VueGeolocation);
Vue.use(VueRouter);
Vue.use(VueCookie);

Vue.config.productionTip = false;

import Login from './components/Public/Login/Login.vue';
// import GMap from "./components/GMap.vue";
import Home from './components/Home.vue';
import CreateAccount from './components/Public/Create/CreateAccount.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/create', name: 'Create Account', component: CreateAccount }
];

const router = new VueRouter({ routes, mode: 'history' });

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
