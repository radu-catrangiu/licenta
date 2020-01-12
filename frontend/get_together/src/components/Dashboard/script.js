import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import AccountModal from './components/Modals/AccountModal/AccountModal.vue';
import OnboardingModal from './components/Modals/OnboardingModal/OnboardingModal.vue';
import NewGroupModal from './components/Modals/NewGroupModal/NewGroupModal.vue';
import GroupsModal from './components/Modals/GroupsModal/GroupsModal.vue';
import GoogleMap from './components/GoogleMap/GoogleMap.vue';
import CommentsSection from './components/CommentsSection/CommentsSection.vue';
import ScheduleInput from './components/ScheduleInput.vue';
import ResultsCard from './components/ResultsCard.vue';

export default {
    name: 'dashboard',
    components: {
        Header,
        Footer,
        AccountModal,
        OnboardingModal,
        NewGroupModal,
        GroupsModal,
        GoogleMap,
        CommentsSection,
        ScheduleInput,
        ResultsCard
    },
    sockets: {
        connect: function () {
            this.$socket.emit('authentication', {
                token: this.$cookie.get('user_token')
            });
        },
        update_group: async function () {
            await retrieve_group_details(this);
            await get_venues_list(this);
        },
        disconnect: function (data) {
            // eslint-disable-next-line
            console.log('socket disconnected: ', data);
        }
    },
    data() {
        return {
            weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            map_loaded: false,
            day_index: 0,
            show_schedule_section: false,
            time_intervals: Array(7).fill({
                start: 0,
                end: 24 * 60
            })
        };
    },
    computed: {
        voted_venue() {
            return this.$store.getters.voted_venues[this.day_index] || null;
        },
        ready() {
            return this.ready_members.includes(this.user_info.username);
        },
        members_not_ready() {
            return this.current_group.members.filter(member => !this.ready_members.includes(member.username));
        },
        ready_members() {
            return this.current_group.members_ready || [];
        },
        can_vote() {
            return this.locations.find(e => e.username === this.user_info.username).lat_lng.lat != null;
        },
        group_description() {
            return this.$store.getters.current_group.description || 'cafe';
        },
        venues_type() {
            return this.$store.getters.current_group.venues_type || 'cafe';
        },
        user_info() {
            return this.$store.getters.user_info;
        },
        group_ids() {
            return this.$store.getters.group_ids;
        },
        current_group() {
            return this.$store.getters.current_group;
        },
        all_venues() {
            return this.$store.getters.all_venues;
        },
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
    async created() {
        await this.validate_token(this, null);
        
        let res = await get_user_info(this);
        if (res) {
            await get_group_names(this);
            await retrieve_group_details(this);
            await get_venues_list(this);
            await set_time_intervals(this);
            this.$store.subscribe(async mutation => {
                if (mutation.type === 'set_current_group') {
                    await set_time_intervals(this);
                }
            });
        }
    },
    async mounted() {
        document.title = 'Dashboard | Meet Up';
        this.$socket.open();
    },
    updated() {
        this.$('[data-toggle="tooltip"]').tooltip({ animation: false });
    },
    filters: {
        initial: function(value) {
            return value.toUpperCase()[0];
        }
    },
    methods: {
        async mark_ready() {
            await mark_as_ready(this);
        },
        async unmark_ready() {
            await unmark_as_ready(this);
        },
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
                lat_lng: location.lat_lng,
                time_intervals: [this.time_intervals[this.day_index]]
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
        },
        venue_clicked(venue) {
            const elem = this.$('#' + venue.id);
            const container = this.$('#venues_list');
            if (elem.length == 0 || !this.map_loaded) {
                return;
            }
            
            elem.addClass('clicked');
            container.animate(
                {
                    scrollTop: elem.offset().top - container.offset().top + container.scrollTop()
                },
                500,
                () => {
                    container.scrollTop(
                        elem.offset().top - container.offset().top + container.scrollTop()
                    );
                    setTimeout(function() {
                        elem.removeClass('clicked');
                    }, 1000, 'swing');
                }
            );
        },
        async vote_venue(venue) {
            await vote_venue(this, venue.id);
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
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                if (res.groups.length === 0) {
                    show_modal(self, '#onboardingModal', { keyboard: false });
                    resolve(false);
                } else {
                    self.$store.commit('set_group_ids', res.groups);
                    self.$store.commit('set_user_info', res);
                    resolve(true);
                }
            }
        );
    });
}

async function get_group_names(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_ids: self.group_ids
        };
        self.$http.callAPI(
            '/core/groups',
            'get_group_names',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit('set_groups_list', res);
                resolve(true);
            }
        );
    });
}

function get_voted_venues(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0]
        };
        self.$http.callAPI(
            '/core/locations',
            'get_voted_ids',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit("set_voted_venues", res);
                resolve(true);
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
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit('set_current_group', res);
                get_voted_venues(self);
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
            group_id: self.$cookie.get('group_id') || self.group_ids[0],
            type: self.current_group.venues_type || 'cafe'
        };
        self.$http.callAPI(
            '/core/locations',
            'get_venues',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit("set_all_venues", res);
                resolve(true);
            }
        );
    });
}

function set_time_intervals(self) {
    return new Promise(resolve => {
        if (!self.current_group || !self.current_group.locations) {
            return resolve(false);
        }
        const username = self.user_info.username;
        const time_intervals = self.current_group.locations
            .find(e => e.username === username)
            .days.map(e => e.time_intervals[0] || { start: 0, end: 24 * 60 });
        self.time_intervals = time_intervals;
        resolve(true);
    });
}

function vote_venue(self, venue_id) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0],
            venue_id,
            day: self.day_index
        };
        self.$http.callAPI(
            '/core/locations',
            'vote_location',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit("set_voted_venues", res);
                resolve(true);
            }
        );
    });
}

function mark_as_ready(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0],
            username: self.user_info.username
        };
        self.$http.callAPI(
            '/core/groups',
            'mark_as_ready',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }
                // eslint-disable-next-line
                console.log(res);
                resolve(true);
            }
        );
    });
}

function unmark_as_ready(self) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id: self.$cookie.get('group_id') || self.group_ids[0],
            username: self.user_info.username
        };
        self.$http.callAPI(
            '/core/groups',
            'unmark_as_ready',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }
                // eslint-disable-next-line
                console.log(res);
                resolve(true);
            }
        );
    });
}