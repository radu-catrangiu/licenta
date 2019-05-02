<template>
  <div>
    <OnboardingModal/>
    <GroupsModal :group="current_group"/>
    <AccountModal/>
    <div id="dashboard" class="container">
      <Header/>
      <!-- Card Start -->
      <div class="card shadow p-2 mt-2 mb-4 bg-light rounded-lg border border-white">
        <div class="card-body row" style="display: -webkit-box;">
          <div class="col text-left">
            <h2 v-if="!current_group.name">{Group Name}</h2>
            <h2 v-else>{{current_group.name}}</h2>
          </div>
          <div class="col text-right">
            <div v-if="!current_group.members">
              <h2>{Member Icons}</h2>
            </div>
            <div v-else class="testimonial-group">
              <div class="row justify-content-end pr-3">
                <div
                  class="col-xs-1 ml-2 circle"
                  v-for="member in current_group.members"
                  :key="member.username"
                >
                  <div
                    data-toggle="tooltip"
                    data-placement="left"
                    :title="member.username"
                  >{{ member.username | initial }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Card End -->
      <!-- Card Start -->
      <div id="map_card" class="card shadow mb-4 rounded-lg border border-white">
        <div class="card-body">
          <GoogleMap/>
        </div>
      </div>
      <!-- Card End -->
      <!-- Card Start -->
      <div class="card shadow p-2 mt-2 mb-4 bg-light rounded-lg border border-white">
        <button class="btn btn-primary" v-on:click="open_groups_mgmt">Open Group Management Modal</button>
      </div>
      <!-- Card End -->
      <Footer/>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import AccountModal from "./components/Modals/AccountModal/AccountModal.vue";
import OnboardingModal from "./components/Modals/OnboardingModal/OnboardingModal.vue";
import GroupsModal from "./components/Modals/GroupsModal/GroupsModal.vue";
import GoogleMap from "./components/GoogleMap/GoogleMap.vue";
import { async, resolve } from "q";

export default {
  name: "dashboard",
  components: {
    Header,
    Footer,
    AccountModal,
    OnboardingModal,
    GroupsModal,
    GoogleMap
  },
  data() {
    return {
      group_ids: [],
      current_group: {}
    };
  },
  async mounted() {
    await this.validate_token(this, null);

    document.title = "Dashboard | Get Together";
    let res = await retrieve_groups(this);
    if (res) {
      await retrieve_group_details(this);
    }
  },
  updated() {
    console.log(this.$('[data-toggle="tooltip"]'));
    this.$('[data-toggle="tooltip"]').tooltip({ animation: false });
  },
  filters: {
    initial: function(value) {
      return value.toUpperCase()[0];
    }
  },
  methods: {
    open_groups_mgmt() {
      show_modal(this, "#groupsModal", "show");
    }
  }
};

function show_modal(self, id, options) {
  // TODO: Show modal only if user is part of no group
  self.$("div#dashboard").css("-webkit-filter", "blur(5px)");
  self.$("div#dashboard").css("-moz-filter", "blur(5px)");
  self.$("div#dashboard").css("-o-filter", "blur(5px)");
  self.$("div#dashboard").css("-ms-filter", "blur(5px)");
  self.$("div#dashboard").css("filter", "blur(5px)");
  self.$(id).modal(options);
}

async function retrieve_groups(self) {
  return new Promise(resolve => {
    const user_token = self.$cookie.get("user_token");
    self.$http.callAPI(
      "/core/groups",
      "retrieve_groups",
      { user_token },
      (err, res) => {
        console.log(err, res);
        if (err) {
          // Do something
          resolve(false);
          return;
        }

        if (res.length === 0) {
          show_modal(self, "#onboardingModal", { keyboard: false });
          resolve(false);
        } else {
          self.group_ids = res;
          resolve(true);
        }
      }
    );
  });
}

async function retrieve_group_details(self) {
  return new Promise(resolve => {
    const user_token = self.$cookie.get("user_token");
    const params = {
      user_token,
      group_id: self.$cookie.get("group_id") || self.group_ids[0]
    };
    self.$http.callAPI(
      "/core/groups",
      "retrieve_group_details",
      params,
      (err, res) => {
        console.log(err, res);
        if (err) {
          // Do something
          resolve(false);
          return;
        }

        self.current_group = res;
        resolve(true);
      }
    );
  });
}
</script>

<style>
#obj {
  text-align: center;
}

#map_card {
  background: #efefef;
}

.circle {
  border-radius: 50%;
  width: 42px;
  height: 42px;
  padding: 2px;
  text-align: center;
  font: 32px Arial, sans-serif;
  background: #777;
  color: #fff;
  border: 2px solid #777;
}

.circle:nth-child(4n + 1) {
  background: #fed766;
  border: 2px solid #fed766;
  color: #272727;
}
.circle:nth-child(4n + 2) {
  background: #009fb7;
  border: 2px solid #009fb7;
  color: #272727;
}
.circle:nth-child(4n + 3) {
  background: #696773;
  border: 2px solid #696773;
  color: #eff1f3;
}

.circle:nth-child(4n + 4) {
  background: #272727;
  border: 2px solid #272727;
  color: #eff1f3;
}

/* The heart of the matter */
.testimonial-group > .row {
  overflow-x: auto;
  white-space: nowrap;
}

.testimonial-group .row {
  display: -ms-flexbox;
  display: -webkit-box;
  /* display: flex; */
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.testimonial-group .row::-webkit-scrollbar {
  display: none;
}

.testimonial-group > .row > .col-xs-1 {
  display: inline-block;
  float: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}
</style>
