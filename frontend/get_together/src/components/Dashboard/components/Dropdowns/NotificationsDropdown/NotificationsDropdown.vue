<template>
  <div class="dropdown-menu" aria-labelledby="notificationsPopoverLink">
    <div v-if="notifications.length > 0">
      <div class="btn btn-danger" v-on:click="clear_all_notifications">
        <span>CLEAR ALL NOTIFICATIONS</span>
      </div>
      <div class="dropdown-divider"></div>
    </div>
    <div v-if="notifications.length > 0" class="overflow-auto" style="max-height: 25vh;">
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
      await get_notifications_count(this);
    }
  },
  async beforeMount() {
    await retrieve_notifications(this);
    await get_notifications_count(this);
  },
  data() {
    return {
      notifications: []
    };
  },
  methods: {
    async notification_action(notification) {
      await notification_seen(this, notification);
      await get_notifications_count(this);
    },
    clear_all_notifications() {
      clear_all_notifications(this);
    }
  }
};

function clear_all_notifications(self) {
  return new Promise((resolve, reject) => {
    const user_token = self.$cookie.get("user_token");
    const params = { user_token };
    self.$http.callAPI(
      "/core/notifications",
      "mark_all_as_seen",
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
        self.notifications = self.notifications.filter(
          e => e.notification_id != notification.notification_id
        );
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
      const { user, group_name } = notification.notification_params;
      notification.text = `<b>${user}</b> left a comment on the group <b>${group_name}</b>`;
      break;
    }
    case "LIKE_COMMENT": {
      const { user, group_name } = notification.notification_params;
      notification.text = `<b>${user}</b> liked your comment on the group <b>${group_name}</b>`;
      break;
    }
    case "MARKED_READY": {
      const { user, group_name } = notification.notification_params;
      notification.text = `<b>${user}</b> marked himself ready in the group <b>${group_name}</b>`;
      break;
    }
    case "MARKED_NOT_READY": {
      const { user, group_name } = notification.notification_params;
      notification.text = `<b>${user}</b> marked himself not ready in the group <b>${group_name}</b>`;
      break;
    }
  }
}

function get_notifications_count(self) {
  return new Promise((resolve, reject) => {
    const user_token = self.$cookie.get("user_token");
    const params = { user_token };
    self.$http.callAPI(
      "/core/notifications",
      "count_new",
      params,
      (err, res) => {
        if (err) {
          resolve(null);
          return;
        }
        self.$store.commit("set_notifications_count", res.count);
        resolve(res);
      }
    );
  });
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
