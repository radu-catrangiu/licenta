<template src="./template.html" />

<script>
/* eslint-disable */
export default {
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false
    }
  },
  methods: {
    create() {
      this.$router.push({
        name: "Create Account", 
        params: { 
          username: this.username,
          password: this.password
        }
      });
    }
  },
  mounted() {
    document.title = "Log In | Get Together";
    console.log(this.appConfig);
  }
};
</script>

<style src="./style.css" />
