<template>
  <div class="dropdown-menu" aria-labelledby="groupsPopoverLink">
    <a class="entry selected" href="#" v-on:click="openModal('#newGroupModal')">
      <div class="btn btn-warning">
        <div class="mx-3">Create new group</div>
      </div>
    </a>

    <div v-for="group in groups_list" :key="group.group_id">
      <div class="dropdown-divider"></div>

      <a class="entry" href="#" v-on:click="switch_group(group.group_id)">
        <div class="group_entry">
          <div class="mx-3">{{group.group_name}}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {},
  methods: {
    openModal(id) {
      this.$("div#dashboard").css("-webkit-filter", "blur(5px)");
      this.$("div#dashboard").css("-moz-filter", "blur(5px)");
      this.$("div#dashboard").css("-o-filter", "blur(5px)");
      this.$("div#dashboard").css("-ms-filter", "blur(5px)");
      this.$("div#dashboard").css("filter", "blur(5px)");
      this.$(id).modal("show");
    },
    async switch_group(group_id) {
      this.$store.commit("set_all_venues", Array(7).fill([]));
      await retrieve_group_details(this, group_id);
      await get_venues_list(this, group_id);
    }
  },
  computed: {
    groups_list() {
      return this.$store.getters.groups_list;
    }
  }
};

function retrieve_group_details(self, group_id) {
  return new Promise(resolve => {
    const user_token = self.$cookie.get("user_token");
    const params = {
      user_token,
      group_id
    };
    self.$http.callAPI(
      "/core/groups",
      "retrieve_group_details",
      params,
      (err, res) => {
        if (err) {
          // Do something
          resolve(false);
          return;
        }

        self.$store.commit("set_current_group", res);
        self.$cookie.set("group_id", group_id);
        resolve(true);
      }
    );
  });
}

function get_venues_list(self, group_id) {
    return new Promise(resolve => {
        const user_token = self.$cookie.get('user_token');
        const params = {
            user_token,
            group_id
        };
        self.$http.callAPI(
            '/core/locations',
            'get_venues',
            params,
            (err, res) => {
                if (err) {
                    // Do something
                    resolve(false);
                    return;
                }

                self.$store.commit("set_all_venues", res);
                resolve(true);
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

.group_entry:hover {
  background-color: ivory;
}

.group_entry {
  color: #000;
}

.create_new_group:hover {
  background-color: gray;
  color: black;
  text-decoration: none;
}

.create_new_group {
  background-color: rgb(45, 45, 41);
  color: rgb(255, 255, 255);
  text-decoration: none;
}

.entry {
  text-align: center;
  margin-top: 3px;
}

a.entry.selected {
  background-color: rgb(252, 188, 77);
}
</style>
