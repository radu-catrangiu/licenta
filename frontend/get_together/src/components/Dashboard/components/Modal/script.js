import Datepicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

let date = new Date();
date.setFullYear(date.getFullYear() - 13);

export default {
    components: {
        Datepicker
    },
    data() {
        return {
            firstname: '',
            lastname: '',
            date: new Date(),
            options: {
                format: 'DD.MM.YYYY',
                minDate: new Date('1900-01-01T00:00:00.000Z'),
                maxDate: date,
                icons: {
                    time: 'far fa-clock',
                    date: 'far fa-calendar',
                    up: 'fas fa-arrow-up',
                    down: 'fas fa-arrow-down',
                    previous: 'fas fa-chevron-left',
                    next: 'fas fa-chevron-right',
                    today: 'fas fa-calendar-check',
                    clear: 'far fa-trash-alt',
                    close: 'far fa-times-circle'
                }
            }
        };
    },
    mounted() {
        this.$('#exampleModalCenter').modal('show');
    }
};
