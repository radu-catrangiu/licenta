<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col">
          <img id="logo" src="../../../assets/logo5.svg" alt>
        </div>
        <div class="col text-right mt-4">
          <a class="mx-4">
            <span id="groups_button" class="text-right header-btn">
              <i class="far fa-bell"></i>
            </span>
          </a>
          <a class="mx-4">
            <span id="groups_button" class="text-right header-btn">
              <i class="fas fa-users"></i>
            </span>
          </a>
          <a class="ml-4" href="#" v-on:click="show_account_details">
            <span id="account_button" class="text-right header-btn">
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
      this.$("#accountModal").modal("show");
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

.header-btn:hover {
  color: gray;
}

.header-btn {
  font-size: 4.5em; 
  color: black;
}
</style>
