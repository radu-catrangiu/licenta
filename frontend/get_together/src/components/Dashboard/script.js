import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import AccountModal from './components/Modals/AccountModal/AccountModal.vue';
import OnboardingModal from './components/Modals/OnboardingModal/OnboardingModal.vue';
import GroupsModal from './components/Modals/GroupsModal/GroupsModal.vue';
import GoogleMap from './components/GoogleMap/GoogleMap.vue';
// import { async, resolve } from 'q';

export default {
    name: 'dashboard',
    components: {
        Header,
        Footer,
        AccountModal,
        OnboardingModal,
        GroupsModal,
        GoogleMap
    },
    data() {
        return {
            day_index: 0,
            show_schedule_card: false,
            user_info: {},
            group_ids: [],
            current_group: {}
        };
    },
    async mounted() {
        await this.validate_token(this, null);

        document.title = 'Dashboard | Get Together';
        let res = await get_user_info(this);
        if (res) {
            await retrieve_group_details(this);
        }
    },
    updated() {
        // eslint-disable-next-line
        console.log(this.$('[data-toggle="tooltip"]'));
        this.$('[data-toggle="tooltip"]').tooltip({ animation: false });
    },
    filters: {
        initial: function(value) {
            return value.toUpperCase()[0];
        }
    },
    methods: {
        open_groups_mgmt() {
            show_modal(this, '#groupsModal', 'show');
        }
    }
};

function show_modal(self, id, options) {
    // TODO: Show modal only if user is part of no group
    self.$('div#dashboard').css('-webkit-filter', 'blur(5px)');
    self.$('div#dashboard').css('-moz-filter', 'blur(5px)');
    self.$('div#dashboard').css('-o-filter', 'blur(5px)');
    self.$('div#dashboard').css('-ms-filter', 'blur(5px)');
    self.$('div#dashboard').css('filter', 'blur(5px)');
    self.$(id).modal(options);
}

async function get_user_info(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        self.$http.callAPI(
            '/core/user_mgmt',
            'get_user_info',
            { user_token },
            (err, res) => {
                // eslint-disable-next-line
                console.log(err, res);
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                if (res.groups.length === 0) {
                    show_modal(self, '#onboardingModal', { keyboard: false });
                    resolve(false);
                } else {
                    self.group_ids = res.groups;
                    self.user_info = res;
                    resolve(true);
                }
            }
        );
    });
}

async function retrieve_group_details(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0]
        };
        self.$http.callAPI(
            '/core/groups',
            'retrieve_group_details',
            params,
            (err, res) => {
                // eslint-disable-next-line
                console.log(err, res);
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.current_group = res;
                resolve(true);
            }
        );
    });
}
