import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user_info: {},
        group_ids: [],
        groups_list: [],
        current_group: {},
        all_venues: Array(7),
        notifications_count: 0
    },
    mutations: {
        set_user_info(state, payload) {
            state.user_info = payload;
        },
        set_group_ids(state, payload) {
            state.group_ids = payload;
        },
        set_groups_list(state, payload) {
            state.groups_list = payload;
        },
        set_current_group(state, payload) {
            state.current_group = payload;
        },
        set_all_venues(state, payload) {
            state.all_venues = payload;
        },
        set_notifications_count(state, payload) {
            state.notifications_count = payload;
        }
    },
    actions: {},
    getters: {
        user_info(state) {
            return state.user_info;
        },
        group_ids(state) {
            return state.group_ids;
        },
        groups_list(state) {
            return state.groups_list;
        },
        current_group(state) {
            return state.current_group;
        },
        current_group_id(state) {
            return state.current_group.group_id;
        },
        all_venues(state) {
            return state.all_venues;
        },
        notifications_count(state) {
            return state.notifications_count;
        }
    }
});

export default store;
