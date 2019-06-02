<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col">
          <img id="logo" src="../../../assets/logo5.svg" alt>
        </div>
        <div class="col text-right mt-4">
          <div class="btn-group mx-4">
            <a
              href="#"
              role="button"
              id="notificationsDropdownLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              data-offset="-100,0"
            >
              <span id="groups_button" class="text-right header-btn">
                <i class="far fa-bell"></i>
              </span>
            </a>
            <notifications-dropdown/>
          </div>

          <div class="btn-group mx-4">
            <a
              href="#"
              role="button"
              id="groupsDropdownLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              data-offset="-100,0"
            >
              <span id="groups_button" class="text-right header-btn">
                <i class="fas fa-users"></i>
              </span>
            </a>
            <groups-dropdown/>
          </div>
          <div class="btn-group ml-4">
          <a href="#" v-on:click="openModal('#accountModal')">
            <span id="account_button" class="text-right header-btn">
              <i class="fas fa-user-circle"></i>
            </span>
          </a>
          </div>
        </div>
      </div>
    </div>

    <p class="text-right"></p>
  </div>
</template>

<script>
import GroupsDropdown from "./Dropdowns/GroupsDropdown/GroupsDropdown.vue";
import NotificationsDropdown from "./Dropdowns/NotificationsDropdown/NotificationsDropdown.vue";
export default {
  components: {
    GroupsDropdown,
    NotificationsDropdown
  },
  methods: {
    openModal(id) {
      this.$("div#dashboard").css("-webkit-filter", "blur(5px)");
      this.$("div#dashboard").css("-moz-filter", "blur(5px)");
      this.$("div#dashboard").css("-o-filter", "blur(5px)");
      this.$("div#dashboard").css("-ms-filter", "blur(5px)");
      this.$("div#dashboard").css("filter", "blur(5px)");
      this.$(id).modal("show");
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
