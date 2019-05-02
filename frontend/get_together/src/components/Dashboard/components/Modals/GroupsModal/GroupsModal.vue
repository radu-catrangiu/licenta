<template>
  <div>
    <div class="modal fade" id="groupsModal" tabindex="-1" role="dialog" data-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Groups Management</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>{{group.group_id}}</p>

            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <span class="mr-2">Single Use?</span>
                  <input type="checkbox" v-model="single_use">
                </div>
                <button
                  class="btn btn-primary"
                  v-on:click="create_invite"
                  type="button"
                >Generate Link</button>
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

            <!--  -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger" v-on:click="delete_group">Delete Group</button>
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
      single_use: false
    };
  },
  props: ["group"],
  mounted() {
    /* eslint-disable */
    this.$("#groupsModal").on("hidden.bs.modal", e => {
      this.$("div#dashboard").css("-webkit-filter", "blur(0px)");
      this.$("div#dashboard").css("-moz-filter", "blur(0px)");
      this.$("div#dashboard").css("-o-filter", "blur(0px)");
      this.$("div#dashboard").css("-ms-filter", "blur(0px)");
      this.$("div#dashboard").css("filter", "blur(0px)");
    });
  },
  methods: {
    delete_group() {
      const user_token = this.$cookie.get("user_token");
      const params = { user_token, group_id: this.group.group_id };
      this.$http.callAPI("/core/groups", "delete_group", params, (err, res) => {
        if (err) {
          console.log(err, res);
          return;
        }
        this.$cookie.delete("group_id") 
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
        this.$cookie.delete("group_id") 
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
