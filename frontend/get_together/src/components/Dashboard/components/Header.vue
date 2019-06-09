<template>
  <div class="container">
    <div class="row">
      <div class="col-md">
        <img id="logo" src="../../../assets/logo.svg" alt>
        <img id="logo" src="../../../assets/text-logo.svg" alt>
      </div>
      <div class="col-md text-right">
        <div class="btn-group ml-4">
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
              <span class="fa-layers fa-fw">
                <i class="far fa-bell"></i>
                <span class="counter fa-layers-text badge badge-pill badge-warning" v-if="notifications_count > 0">{{notifications_count}}</span>
              </span>
              <!-- Groups -->
            </span>
          </a>
          <notifications-dropdown/>
        </div>

        <div class="btn-group ml-4">
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
  },
  computed: {
    notifications_count() {
      return this.$store.getters.notifications_count;
    }
  }
};
</script>

<style scoped>
#logo {
  margin: auto;
  /* margin-left: 50%; */
  height: 40px;
}

.header-btn:hover {
  color: gray;
}

.header-btn {
  padding-top: 20px;
  font-size: 1.7em;
  color: black;
}

.counter {
  font-size: 40%; 
  margin-right: -10px;
  float: left;
}
</style>
