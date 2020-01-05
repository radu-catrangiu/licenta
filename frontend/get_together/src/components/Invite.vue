<template>
  <div>
    <!-- <div class="dropdown">
      <a
        class="btn btn-secondary dropdown-toggle"
        href="#"
        role="button"
        id="dropdownMenuLink"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >Dropdown link</a>

      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
        <div class="ml-3">
          <a href="#">Test1</a>
        </div>
        <div class="ml-3">
          <a href="#">test2</a>
        </div>
        <div class="ml-3">
          <a href="#">TEST3</a>
        </div>
      </div>
    </div> -->
    Invite Page should never show. Something went wrong.
  </div>
</template>

<script>
export default {
  created() {
    const user_token = this.$cookie.get("user_token");
    if (!user_token) {
      this.$router.replace("/login");
      return;
    }
    const redeem_code = this.$route.query.code;
    const params = { user_token, redeem_code };
    this.$http.callAPI("/core/groups", "join_group", params, (err, res) => {
      if (err) {
        console.log(err, res);
        return;
      }
      this.$router.replace("/dashboard");
    });
  }
};
</script>

<style>
</style>
