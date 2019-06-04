import Datepicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
import {VueCroppieComponent} from 'vue-croppie';

let VueCroppie = VueCroppieComponent;
let max_date = new Date();
// date.setFullYear(date.getFullYear() - 13);

export default {
    components: {
        Datepicker,
        VueCroppie
    },
    data() {
        return {
            firstname: '',
            lastname: '',
            gender: 'unspecified',
            birthdate: "",
            options: {
                format: 'DD.MM.YYYY',
                minDate: new Date('1900-01-01T00:00:00.000Z'),
                maxDate: max_date,
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
            cropped: null,
            profile_picture_id: "",
            old_profile_picture_id: ""
        };
    },
    computed: {
        profile_pic_url() {
            const api_url = this.appConfig.$apiUrl;
            return `${api_url}/profile_picture/${this.old_profile_picture_id}.png`
        }
    },
    mounted() {
        this.$store.subscribe((mutation) => {
            if (mutation.type === 'set_user_info') {
                const { info } = this.$store.getters.user_info;
                this.firstname = info.firstname || "";
                this.lastname = info.lastname || "";
                this.gender = info.gender || "unspecified";
                this.old_profile_picture_id = info.profile_picture_id || "";
                this.birthdate = info.birthdate ? new Date(info.birthdate) : this.birthdate;
            }
        });

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
        async update() {
            if (this.image != null) {
                this.crop(() => {
                    upload_file(this, () => {
                        update_user_info(this, (err, res) => {
                            console.log(err, res);
                            this.$('#accountModal').modal('hide');
                            this.image = "";
                            this.cropped = "";
                            this.filename = "";
                            this.old_profile_picture_id = this.profile_picture_id;
                        });
                    });
                });
            } else {
                update_user_info(this, (err, res) => {
                    console.log(err, res);
                    this.$('#accountModal').modal('hide');
                });
            }

        },
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
        crop(callback) {
            let options = {
                type: 'blob',
                format: 'png', 
                circle: true
            }
            this.$refs.croppieRef.result(options, (output) => {
                this.cropped = output;
                callback();
            });
        },
        rotate(rotationAngle) {
            // Rotates the image
            this.$refs.croppieRef.rotate(rotationAngle);
        }
    }
};

function update_user_info(self, done) {
    const user_token = self.$cookie.get("user_token");
    let from, birthdate;
    if (self.birthdate) {
        from = self.birthdate.split('.');
        birthdate = new Date(from[2], from[1] - 1, from[0])
    }
    const params = {
        user_token,
        firstname: self.firstname,
        lastname: self.lastname,
        gender: self.gender,
        birthdate: birthdate || undefined,
        profile_picture_id: self.profile_picture_id
    };

    console.log(JSON.stringify(params));
    self.$http.callAPI('/core/user_mgmt', 'update_user_info', params, (err, res) => {
        if (err) {
            return done(err);
        }

        return done(null, res);
    });
}

async function upload_file(self, callback) {
    const user_token = self.$cookie.get('user_token');
    const api_url = self.appConfig.$apiUrl;
    const data = new FormData();

    data.append('user_token', user_token);
    data.append('file', self.cropped);
    console.log(self.cropped);

    let res = await self.$http.post(`${api_url}/upload/picture`, data);
    self.profile_picture_id = res.data.picture_id;
    console.log(res)
    callback();
}
