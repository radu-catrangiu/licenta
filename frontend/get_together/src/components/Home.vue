<template>
  <div>I am Home</div>
</template>

<script>
export default {
  mounted() {
    // eslint-disable-next-line
    console.log(this.$cookie);
    const user_token = this.$cookie.get('user_token');
    if (!user_token) {
      this.$router.push("/login");
    } else {
      this.$router.push("/dashboard");
    }
  }
};
</script>

<style>
</style>
