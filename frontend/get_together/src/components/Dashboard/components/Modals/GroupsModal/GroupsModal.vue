<template>
  <div>
    <div class="modal fade" id="groupsModal" tabindex="-1" role="dialog" data-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Group Options</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3" v-if="is_owner">
              <div class="input-group-prepend">
                <span class="input-group-text">Group Description</span>
              </div>
              <textarea class="form-control" aria-label="Group Description" v-model="description"></textarea>
            </div>

            <div class="input-group mb-3" v-if="is_owner">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Venues type</label>
              </div>
              <select class="custom-select" v-model="venues_type">
                <option value="cafe" :selected="venues_type==='cafe'">Cafe</option>
                <option value="bar" :selected="venues_type==='bar'">Bar</option>
                <option value="restaurant" :selected="venues_type==='restaurant'">Restaurant</option>
              </select>
            </div>

            <div class="input-group mb-3" v-if="is_owner || anyone_can_invite">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <span class="mr-2">Single Use?</span>
                  <input type="checkbox" v-model="single_use" :disabled="!is_owner">
                </div>
                <button
                  class="btn btn-primary"
                  v-on:click="create_invite"
                  type="button"
                >Generate Invite Link</button>
              </div>
              <input
                type="text"
                v-model="join_link"
                v-on:click="copy_to_clipboard"
                id="join_link"
                class="form-control"
                readonly
              >
            </div>
            <div v-else>You could generate invite links from here if the group owner would allow it</div>

            <div class="form-check" v-if="is_owner">
              <input class="form-check-input" type="checkbox" value v-model="anyone_can_invite">
              <label class="form-check-label">Anyone can invite?</label>
            </div>

            <!--  -->
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-primary"
              v-on:click="update_group_info"
              v-if="is_owner"
            >Update Info</button>
            <button class="btn btn-danger" v-on:click="delete_group" v-if="is_owner">Delete Group</button>
            <button class="btn btn-warning" v-on:click="leave_group">Leave Group</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      join_link: "",
      single_use: false,
      description: "",
      venues_type: "",
      is_owner: false,
      anyone_can_invite: false
    };
  },
  props: ["group"],
  mounted() {
    /* eslint-disable */
    this.$store.subscribe(async mutation => {
      if (mutation.type === "set_current_group") {
        const group_id = mutation.payload.group_id;
        this.group_id = group_id;
        this.venues_type = mutation.payload.venues_type || "cafe";
        this.description = mutation.payload.description;
        this.is_owner = mutation.payload.is_owner;
        this.anyone_can_invite = mutation.payload.anyone_can_invite || false;

        if (!this.is_owner) {
          this.single_use = true;
        }
      }
    });
    this.$("#groupsModal").on("hidden.bs.modal", e => {
      this.$("div#dashboard").css("-webkit-filter", "blur(0px)");
      this.$("div#dashboard").css("-moz-filter", "blur(0px)");
      this.$("div#dashboard").css("-o-filter", "blur(0px)");
      this.$("div#dashboard").css("-ms-filter", "blur(0px)");
      this.$("div#dashboard").css("filter", "blur(0px)");
    });
  },
  methods: {
    update_group_info() {
      const user_token = this.$cookie.get("user_token");
      const params = {
        user_token,
        group_id: this.group.group_id,
        group_info: {
          description: this.description,
          venues_type: this.venues_type,
          anyone_can_invite: this.anyone_can_invite
        }
      };
      this.$http.callAPI(
        "/core/groups",
        "update_group_info",
        params,
        (err, res) => {
          if (err) {
            console.log(err, res);
            return;
          }
          this.$router.go();
        }
      );
    },
    delete_group() {
      const user_token = this.$cookie.get("user_token");
      const params = { user_token, group_id: this.group.group_id };
      this.$http.callAPI("/core/groups", "delete_group", params, (err, res) => {
        if (err) {
          console.log(err, res);
          return;
        }
        this.$cookie.delete("group_id");
        this.$router.go();
      });
    },
    leave_group() {
      const user_token = this.$cookie.get("user_token");
      const params = { user_token, group_id: this.group.group_id };
      this.$http.callAPI("/core/groups", "leave_group", params, (err, res) => {
        if (err) {
          console.log(err, res);
          return;
        }
        this.$cookie.delete("group_id");
        this.$router.go();
      });
    },
    create_invite() {
      const user_token = this.$cookie.get("user_token");
      const params = {
        user_token,
        group_id: this.group.group_id,
        single_use: this.single_use
      };
      this.$http.callAPI(
        "/core/groups",
        "create_invite",
        params,
        (err, res) => {
          if (err) {
            console.log(err, res);
            return;
          }
          const protocol = location.protocol;
          const slashes = protocol.concat("//");
          let host = slashes.concat(window.location.hostname);
          const port = location.port;
          if (port != 80 || port != 443) {
            host = host.concat(":" + port);
          }

          this.join_link = host.concat("/invite?code=" + res);
        }
      );
    },
    copy_to_clipboard() {
      const link_input = document.getElementById("join_link");
      link_input.select();
      document.execCommand("copy");

      /* Replace this with a toast */
      alert("Copied the text: " + link_input.value);
    }
  }
};
</script>

<style>
</style>
