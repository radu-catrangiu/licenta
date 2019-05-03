import Vue from 'vue';
import App from './App.vue';

import { config } from './config';
import Axios from 'axios';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import JQuery from 'jquery';
import validate_token from './utils/validate_token';

Vue.prototype.validate_token = validate_token;
Vue.prototype.appConfig = config;
Vue.prototype.$ = JQuery;
Vue.prototype.$http = Axios;
Vue.prototype.$http.callAPI = async (service, method, params, callback) => {
    if (!callback) {
        callback = () => {};
    }
    const req = {
        id: 1,
        jsonrpc: '2.0',
        method: method,
        params: params
    };

    const api = config.$apiUrl;
    try {
        const result = await Axios.post(`${api}${service}`, req);
        if (result.data.result) {
            return callback(null, result.data.result);
        } else if (result.data.error) {
            return callback(result.data.error);
        } else {
            return callback(result.data);
        }
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

import Home from './components/Home.vue';
import Login from './components/Public/Login/Login.vue';
import CreateAccount from './components/Public/Create/CreateAccount.vue';
import Dashboard from './components/Dashboard/Dashboard.vue';
import Invite from './components/Invite.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/create', name: 'Create Account', component: CreateAccount },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/invite', name: 'Invite', component: Invite }
];

const router = new VueRouter({ routes, mode: 'history' });

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
