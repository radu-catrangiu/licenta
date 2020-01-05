export default async function validate_token(self, redirect) {
    const user_token = self.$cookie.get('user_token');
    if (!user_token) {
        self.$cookie.delete('user_token');
        self.$router.push('/login');
        return;
    }
    const params = { token: user_token };

    return new Promise ((resolve) => {
        self.$http.callAPI('/core/tokens', 'validate', params, (err, res) => {
            if (err) {
                self.$cookie.delete('user_token');
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
                self.$cookie.delete('user_token');
                self.$router.push('/login');
                resolve();
            }
        });
    });
}
