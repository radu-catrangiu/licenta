<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm">
          <img id="logo" src="../../../assets/logo5.svg" alt>
        </div>
        <div class="col-sm"></div>
        <div class="col-sm text-right mt-3">
          <a href="#" v-on:click="show_account_details">
          <span style="font-size: 5em; color: black;" class="text-right">
            <i class="fas fa-user-circle"></i>
          </span>
          </a>
        </div>
      </div>
    </div>

    <p class="text-right"></p>
  </div>
</template>

<script>
export default {
  methods: {
    show_account_details() {
      this.$("div#dashboard").css("-webkit-filter", "blur(5px)");
      this.$("div#dashboard").css("-moz-filter", "blur(5px)");
      this.$("div#dashboard").css("-o-filter", "blur(5px)");
      this.$("div#dashboard").css("-ms-filter", "blur(5px)");
      this.$("div#dashboard").css("filter", "blur(5px)");
      this.$("#exampleModalCenter").modal("show");
    }
  }
};
</script>

<style scoped>
#logo {
  margin: auto;
  /* margin-left: 50%; */
  height: 150px;
  width: 150px;
}
</style>
