/* eslint-disable */
export default {
    data() {
        return {
            username: '',
            password: '',
            rememberMe: false
        };
    },
    methods: {
        create() {
            this.$router.push({
                name: 'Create Account',
                params: {
                    username: this.username,
                    password: this.password
                }
            });
        },
        login() {
            loginAccount(this);
        }
    },
    mounted() {
        document.title = 'Log In | Get Together';
        console.log(this.appConfig);
    }
};

function loginAccount(self) {
    const params = {
        username: self.username,
        password: self.password,
        rememberMe: self.rememberMe
    };
    
    self.$http.callAPI('/core/users', 'login', params, (err, res) => {
        if (err) {
            console.log(err, res);
            return ;
        }
        self.$cookie.set('user_token', res.user_token);
        self.$router.push("/dashboard");
    });
}
