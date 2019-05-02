import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

export default {
    data() {
        return {
            group_name: "",
            invite_id: ""
        };
    },
    mounted() {
        /* eslint-disable */
        this.$('#onboardingModal').on('hidden.bs.modal', e => {
            this.$('div#dashboard').css('-webkit-filter', 'blur(0px)');
            this.$('div#dashboard').css('-moz-filter', 'blur(0px)');
            this.$('div#dashboard').css('-o-filter', 'blur(0px)');
            this.$('div#dashboard').css('-ms-filter', 'blur(0px)');
            this.$('div#dashboard').css('filter', 'blur(0px)');
        });
    },
    methods: {
        create_group() {
            const user_token = this.$cookie.get('user_token');
            const params = { user_token, group_name: this.group_name };
            this.$http.callAPI('/core/groups', 'create_group', params, (err, res) => {
                if (err) {
                    console.log(err, res);
                    return ;
                }
                this.$cookie.set('group_id', res.group_id);
                this.$router.go();
            });
        },
        join_group() {
            const user_token = this.$cookie.get('user_token');
            const params = { user_token, redeem_code: this.invite_id };
            this.$http.callAPI('/core/groups', 'join_group', params, (err, res) => {
                if (err) {
                    console.log(err, res);
                    return ;
                }
                this.$cookie.set('group_id', res.group_id);
                this.$router.go();
            });
        }
    }
};
