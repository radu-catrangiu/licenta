export default async function validate_token(self, redirect) {
    const user_token = self.$cookie.get('user_token');
    const params = { token: user_token };

    return new Promise ((resolve) => {
        self.$http.callAPI('/core/tokens', 'validate', params, (err, res) => {
            if (err) {
                self.$router.push('/login');
                resolve();
                return;
            }
    
            if (res.status === 0) {
                if (redirect) {
                    self.$router.push(redirect);
                }
                resolve();
            } else {
                self.$router.push('/login');
                resolve();
            }
        });
    });
}
