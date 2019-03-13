<template src="./template.html" />

<script>
/* eslint-disable */
export default {
  data() {
    return {
      username: "",
      email: "",
      password1: "",
      password2: "",
      termsAndConditions: false
    }
  },
  methods: {
    create() {
      this.$router.push("/");
    }
  },
  mounted() {
    this.username = this.$route.params.username || "";
    this.password1 = this.$route.params.password || "";
    if (this.username.length > 0 || this.password1.length > 0) {
      this.$refs.email.focus();
    } else {
      this.$refs.username.focus();
    }
    document.title = "Create Account | Get Together";
    console.log(this.appConfig);
  }
};
</script>

<style src="./style.css" scoped/>
