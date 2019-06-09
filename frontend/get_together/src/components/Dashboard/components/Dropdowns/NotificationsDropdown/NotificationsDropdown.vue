<template>
  <div class="dropdown-menu" aria-labelledby="notificationsPopoverLink">
    <div v-if="notifications.length > 0">
      <div v-for="(notification, index) in notifications" v-bind:key="notification.notification_id">
        <div v-if="index !== 0" class="dropdown-divider"></div>

        <a class="entry" v-on:click="notification_action(notification)">
          <div class="notif">
            <div class="mx-3">
              <span v-html="notification.text"></span>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div v-else>
      <span>No new notifications!</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "notifications-dropdown",
  sockets: {
    update_notifications: async function(data) {
      await retrieve_notifications(this);
    }
  },
  async beforeMount() {
    await retrieve_notifications(this);
  },
  data() {
    return {
      notifications: []
    };
  },
  methods: {
    async notification_action(notification) {
      await notification_seen(this, notification);
    }
  }
};

function notification_seen(self, notification) {
  return new Promise((resolve, reject) => {
    const user_token = self.$cookie.get("user_token");
    const params = {
      user_token,
      notification_id: notification.notification_id
    };
    self.$http.callAPI(
      "/core/notifications",
      "mark_as_seen",
      params,
      (err, res) => {
        if (err) {
          resolve(null);
          return;
        }

        resolve(res);
      }
    );
  });
}

function retrieve_notifications(self) {
  return new Promise((resolve, reject) => {
    const user_token = self.$cookie.get("user_token");
    const params = { user_token };
    self.$http.callAPI(
      "/core/notifications",
      "retrieve",
      params,
      (err, res) => {
        if (err) {
          resolve(null);
          return;
        }
        res.forEach(notification => process_notification(notification));
        self.notifications = res;
        resolve(res);
      }
    );
  });
}

function process_notification(notification) {
  switch (notification.type) {
    case "NEW_COMMENT": {
      const { comment_author, group_name } = notification.notification_params;
      notification.text = `<b>${comment_author}</b> left a comment on the group <b>${group_name}</b>`;
      break;
    }
  }
}
</script>

<style scoped>
.dropdown-menu {
  width: 300px;
  text-align: center;
}

.notif:hover {
  background-color: ivory;
}

.notif {
  color: #000;
}

.entry {
  text-align: center;
  margin-top: 3px;
}
</style>
