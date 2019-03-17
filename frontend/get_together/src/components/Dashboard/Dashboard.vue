<template>
  <div>
    <AccountModal/>
    <div id="dashboard" class="container">
      <Header/>
      <!-- Card Start -->
      <div class="card shadow p-2 mt-2 mb-4 bg-light rounded-lg border border-white">
        <div class="card-body row">
          <div class="col text-left"> 
            <h2>{Group Title}</h2>
          </div>
          <div class="col text-right"> 
            <h2>{Member Icons}</h2>
          </div>
        </div>
      </div>
      <!-- Card End -->
      <!-- Card Start -->
      <div id="map_card" class="card shadow mb-4 rounded-lg border border-white">
        <div class="card-body">
          <GoogleMap />
        </div>
      </div>
      <!-- Card End -->
      <!-- Card Start -->
      <div class="card shadow p-2 mt-2 mb-4 bg-light rounded-lg border border-white">
        <div class="card-body">
          <!-- <GoogleMap /> -->
        </div>
      </div>
      <!-- Card End -->
      <!-- Card Start -->
      <!-- <div
        class="card shadow p-2 mb-4 bg-light rounded-lg border border-white"
        v-for="i in numbers"
        :key="i"
      >
        <div class="card-body">
          <div v-for="j in numbers2" :key="j">{{i}}.{{j}} This is some text within a card body.</div>
        </div>
      </div> -->
      <!-- Card End -->
      <Footer/>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import AccountModal from "./components/Modals/AccountModal/AccountModal.vue";
import GoogleMap from "./components/GoogleMap/GoogleMap.vue";
export default {
  name: "dashboard",
  components: {
    Header,
    Footer,
    AccountModal,
    GoogleMap
  },
  data() {
    return {
      numbers: [],
      numbers2: []
    };
  },
  mounted() {
    for (let i = 1; i < 4; i++) {
      this.numbers.push(i);
    }
    for (let i = 1; i < 10; i++) {
      this.numbers2.push(i);
    }
    document.title = "Dashboard | Get Together";
  }
};
</script>

<style>
#obj {
  text-align: center;
}

#map_card {
  background: #EFEFEF;
}
</style>
