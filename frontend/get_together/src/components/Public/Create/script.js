/* eslint-disable */

export default {
    data() {
        return {
            username: '',
            email: '',
            password1: '',
            password2: '',
            termsAndConditions: false
        };
    },
    methods: {
        create() {
            createAccount(this);
        }
    },
    mounted() {
        const user_token = this.$cookie.get('user_token');
        if (user_token) {
            this.$router.push('/dashboard');
        }
        this.username = this.$route.params.username || '';
        this.password1 = this.$route.params.password || '';
        if (this.username.length > 0 || this.password1.length > 0) {
            this.$refs.email.focus();
        } else {
            this.$refs.username.focus();
        }
        document.title = 'Create Account | Get Together';
        console.log(this.appConfig);
    }
};

async function createAccount(self) {
    const params = {
        username: self.username,
        email: self.email,
        password: self.password1
    };

    self.$http.callAPI('/core/users', 'create_account', params, (err, res) => {
        if (err) {
            console.log(err, res);
            return ;
        }
        self.$cookie.set('user_token', res.result.user_token);
        self.$router.push("/dashboard");
    });
}
