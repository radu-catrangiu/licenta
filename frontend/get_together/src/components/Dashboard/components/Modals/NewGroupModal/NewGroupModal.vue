<template>
  <div
    class="modal fade"
    id="newGroupModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="newGroupModalTitle"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="newGroupModalTitle">Create a new group!</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body text-center">
          <div class="col-sm text-center">
            <i style="font-size: 2.5em;" class="mt-3 fas fa-plus-circle"></i>
          </div>

          <br>
          <input
            type="groupname"
            id="inputGroupname"
            class="form-control text-center"
            placeholder="Group Name"
            v-model.trim="group_name"
          >
          <br>
          <p class="mt-5">Create a group and invite your friends for a meetup!</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" v-on:click="create_group">Create Group</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      group_name: ""
    };
  },
  mounted() {
    /* eslint-disable */
    this.$("#newGroupModal").on("hidden.bs.modal", e => {
      this.$("div#dashboard").css("-webkit-filter", "blur(0px)");
      this.$("div#dashboard").css("-moz-filter", "blur(0px)");
      this.$("div#dashboard").css("-o-filter", "blur(0px)");
      this.$("div#dashboard").css("-ms-filter", "blur(0px)");
      this.$("div#dashboard").css("filter", "blur(0px)");
    });
  },
  methods: {
    create_group() {
      const user_token = this.$cookie.get("user_token");
      const params = { user_token, group_name: this.group_name };
      this.$http.callAPI("/core/groups", "create_group", params, (err, res) => {
        if (err) {
          console.log(err, res);
          return;
        }
        this.$cookie.set("group_id", res.group_id);
        this.$router.go();
      });
    }
  }
};
</script>

<style>
</style>
