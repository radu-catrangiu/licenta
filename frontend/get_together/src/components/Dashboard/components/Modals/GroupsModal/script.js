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
        this.$('#groupsModal').on('hidden.bs.modal', e => {
            this.$('div#dashboard').css('-webkit-filter', 'blur(0px)');
            this.$('div#dashboard').css('-moz-filter', 'blur(0px)');
            this.$('div#dashboard').css('-o-filter', 'blur(0px)');
            this.$('div#dashboard').css('-ms-filter', 'blur(0px)');
            this.$('div#dashboard').css('filter', 'blur(0px)');
        });
    }
};
