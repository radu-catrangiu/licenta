<template src="./template.html" />

<script>
/* eslint-disable */
export default {
  methods: {
    login() {
      this.$router.push("/");
    }
  },
  mounted() {
    document.title = "Create Account | Get Together";
    console.log(this.appConfig);
  }
};
</script>

<style src="./style.css" scoped/>
