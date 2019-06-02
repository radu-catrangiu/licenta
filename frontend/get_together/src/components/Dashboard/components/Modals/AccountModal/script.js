import Datepicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
import {VueCroppieComponent} from 'vue-croppie';

let VueCroppie = VueCroppieComponent;
let date = new Date();
date.setFullYear(date.getFullYear() - 13);

export default {
    components: {
        Datepicker,
        VueCroppie
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
            },
            filename: "",
            image: null,
            cropped: null
        };
    },
    mounted() {
        /* eslint-disable */
        this.$('#accountModal').on('hidden.bs.modal', e => {
            this.$('div#dashboard').css('-webkit-filter', 'blur(0px)');
            this.$('div#dashboard').css('-moz-filter', 'blur(0px)');
            this.$('div#dashboard').css('-o-filter', 'blur(0px)');
            this.$('div#dashboard').css('-ms-filter', 'blur(0px)');
            this.$('div#dashboard').css('filter', 'blur(0px)');
        });
    },
    methods: {
        logout() {
            this.$cookie.delete('group_id');
            this.$cookie.delete('user_token');
            this.$router.push('/');
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.createImage(files[0]);
            this.filename = files[0].name;
        },
        createImage(file) {
            var reader = new FileReader();
            var vm = this;

            reader.onload = e => {
                vm.image = e.target.result;
                this.bind();
            };
            reader.readAsDataURL(file);
        },
        removeImage: function(e) {
            this.image = '';
        },
        bind() {
            let url = this.image;
            this.$refs.croppieRef.bind({
                url: url,
            });
        },
        crop() {
            let options = {
                format: 'png', 
                circle: true
            }
            this.$refs.croppieRef.result(options, (output) => {
                this.cropped = output;
            });
        },
        rotate(rotationAngle) {
            // Rotates the image
            this.$refs.croppieRef.rotate(rotationAngle);
        }
    }
};
