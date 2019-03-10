<template>
  <div>I am Home</div>
</template>

<script>
export default {
  mounted() {
    // eslint-disable-next-line
    console.log(this.$http)
    this.$router.push("/login");
  }
};
</script>

<style>
</style>
