<template>
  <div>I am Home</div>
</template>

<script>
export default {
  async mounted() {
    await this.validate_token(this, '/dashboard');
  }
};
</script>

<style>
</style>
