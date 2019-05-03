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
            current_group: {},
            all_venues: Array(7)
        };
    },
    computed: {
        locations() {
            let index = this.day_index;
            if (!this.current_group.locations) {
                return {};
            }
            const locations = this.current_group.locations.map(user => {
                if (!user.days[index] || !user.days[index].lat_lng) {
                    return null;
                }

                return {
                    username: user.username,
                    lat_lng: user.days[index].lat_lng
                };
            });

            return locations;
        },
        venues() {
            let index = this.day_index;
            return this.all_venues[index];
        }
    },
    async mounted() {
        await this.validate_token(this, null);

        
        document.title = 'Dashboard | Get Together';
        let res = await get_user_info(this);
        if (res) {
            await retrieve_group_details(this);
            await get_venues_list(this);
        }
    },
    updated() {
        // eslint-disable-next-line
        // console.log(this.$('[data-toggle="tooltip"]'));
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
        },
        get_browser_location() {
            this.$getLocation({}).then(coordinates => {
                this.point_to_location_callback({ lat_lng: coordinates });
            });
        },
        point_to_location_callback(location) {
            let user_locations = this.current_group.locations.find(
                user => user.username === this.user_info.username
            );

            if (!user_locations) {
                user_locations = {
                    username: this.user_info.username,
                    days: Array(7)
                };
                this.current_group.locations.push(user_locations);
            }

            if (!user_locations.days[this.day_index]) {
                user_locations.days[this.day_index] = location;
            } else {
                user_locations.days[this.day_index].lat_lng = location.lat_lng;
            }

            const user_token = this.$cookie.get('user_token');
            const params = {
                user_token,
                group_id: this.current_group.group_id,
                day: this.day_index,
                lat_lng: location.lat_lng
            };
            this.$http.callAPI('/core/locations', 'report_location', params);
        },
        get_point_location() {
            this.$refs.google_map.point_to_location = true;
        },
        delete_location() {
            let user_locations = this.current_group.locations.find(
                user => user.username === this.user_info.username
            );

            if (
                !user_locations ||
                !user_locations.days ||
                !user_locations.days[this.day_index] ||
                !user_locations.days[this.day_index].lat_lng ||
                !(
                    user_locations.days[this.day_index].lat_lng.lat &&
                    user_locations.days[this.day_index].lat_lng.lng
                )
            ) {
                return;
            }

            user_locations.days[this.day_index].lat_lng = {};

            const user_token = this.$cookie.get('user_token');
            const params = {
                user_token,
                group_id: this.current_group.group_id,
                day: this.day_index
            };
            this.$http.callAPI('/core/locations', 'delete_location', params);
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

function get_venues_list(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0]
        };
        self.$http.callAPI(
            '/core/locations',
            'get_venues',
            params,
            (err, res) => {
                // eslint-disable-next-line
                console.log(err, res);
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.all_venues = res;
                resolve(true);
            }
        );
    });
}
