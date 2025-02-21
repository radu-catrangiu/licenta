import moment from 'moment';

export default {
    name: 'comments-section',
    data() {
        return {
            group_id: '',
            comments_batch: 5,
            comments_count: 0,
            pages: 0,
            current_page: 0,
            comments: [],
            new_comment: '',
            current_comments_page: []
        };
    },
    sockets: {
        update_comments: async function (data) {
            if (data.group_id === this.group_id) {
                this.comments = new Array(this.pages);
                await retrieve_comments(this, this.group_id);
            }
        }
    },
    beforeMount() {
        this.comments_batch = this.appConfig.comments_batch;
        this.$store.subscribe(async mutation => {
            if (mutation.type === 'set_current_group') {
                const group_id = mutation.payload.group_id;
                this.group_id = group_id;
                await get_comments_count(this, group_id);
                this.pages = Math.ceil(
                    this.comments_count / this.comments_batch
                );
                this.comments = new Array(this.pages);
                await retrieve_comments(this, group_id);
            }
        });
    },
    computed: {
        page() {
            return this.current_page + 1;
        },
        comments_page() {
            return this.comments[this.current_page];
        }
    },
    filters: {
        time_ago(timestamp) {
            return moment(timestamp).fromNow();
        }
    },
    methods: {
        async next_page() {
            this.current_page++;
            if (!this.comments[this.current_page]) {
                await retrieve_comments(this, this.group_id);
            } else {
                this.current_comments_page = this.comments[this.current_page];
            }
        },
        async prev_page() {
            this.current_page--;
            if (!this.comments[this.current_page]) {
                await retrieve_comments(this, this.group_id);
            } else {
                this.current_comments_page = this.comments[this.current_page];
            }
        },
        async add_comment() {
            if (this.new_comment.length === 0) {
                return;
            }
            await add_comment(this, this.group_id);
            this.new_comment = '';
            await get_comments_count(this, this.group_id);
            this.pages = Math.ceil(this.comments_count / this.comments_batch);
            this.comments = new Array(this.pages);
            await retrieve_comments(this, this.group_id);
        },
        reply(comment) {
            if (!comment || !comment.user)
                return null;
            
            const user = comment.user.username;
            if (this.new_comment.length > 0) {
                this.new_comment += ` `;
            }
            this.new_comment += `@${user}`;

            this.$([document.documentElement, document.body]).animate({
                scrollTop: this.$("#comment-input").offset().top - 10
            }, 500);
        },
        async like(comment) {
            await give_like_dislike(this, this.group_id, 'like', comment);
            comment.liked = true;
            comment.likes++;
        },
        async dislike(comment) {
            await give_like_dislike(this, this.group_id, 'dislike', comment);
            comment.liked = false;
            comment.likes--;
        },
        filter_reply(content) {
            if (!content)
                return null;
            const regex = /@[a-z\-_A-Z]*/g;
            const found = content.match(regex) || [];
            for (let str of found) {
                content = content.replace(str, `<span class="reply"><b>${str}</b></span>`);
            }
            return '<span>' + content + '</span>';
        }
    }
};

function get_comments_count(self, group_id) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id
        };
        self.$http.callAPI('/core/comments', 'count', params, (err, res) => {
            if (err) {
                resolve(0);
                return;
            }

            self.comments_count = res.count;
            resolve(res.count);
        });
    });
}

function retrieve_comments(self, group_id) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id,
            start: self.current_page * self.comments_batch,
            count: self.comments_batch
        };
        self.$http.callAPI('/core/comments', 'retrieve', params, (err, res) => {
            if (err) {
                resolve(null);
                return;
            }
            for (let comment of res) {
                comment.user.profile_picture_id = get_profile_pic_url(self, comment);
            }
            self.comments[self.current_page] = res;
            self.current_comments_page = res;
            resolve(res);
        });
    });
}

function add_comment(self, group_id) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id,
            comment: self.new_comment
        };
        self.$http.callAPI('/core/comments', 'add', params, (err, res) => {
            if (err) {
                resolve(null);
                return;
            }
            self.comments[self.current_page] = res;
            self.current_comments_page = res;
            resolve(res);
        });
    });
}

function give_like_dislike(self, group_id, type, comment) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id,
            comment_id: comment.comment_id
        };
        self.$http.callAPI('/core/comments', type, params, (err, res) => {
            if (err) {
                resolve(null);
                return;
            }
            resolve(res);
        });
    });
}

function get_profile_pic_url(self, comment) {
    if (!comment || !comment.user) {
        return null;
    }
    const id = comment.user.profile_picture_id;
    return `${self.appConfig.$apiUrl}/profile_picture/${id}.png`;
}