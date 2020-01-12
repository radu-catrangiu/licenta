<template>
  <div>Link is expired. You will be redirected!</div>
</template>

<script>
export default {
  created() {
    const user_token = this.$cookie.get("user_token");
    if (!user_token) {
      this.$cookie.set(
        "redirect_url",
        encodeURIComponent(location.pathname + location.search)
      );
      this.$router.replace("/login");
      return;
    }
    const redeem_code = this.$route.query.code;
    const params = { user_token, redeem_code };
    this.$http.callAPI("/core/groups", "join_group", params, (err, res) => {
      if (err) {
        // eslint-disable-next-line
        console.log(err, res);
        setTimeout(() => {
          this.$router.replace("/dashboard");
        }, 2000);
        return;
      }
      this.$router.replace("/dashboard");
    });
  }
};
</script>

<style>
</style>
