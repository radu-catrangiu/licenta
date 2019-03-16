<template>
  <div>
    <Modal/>
    <div id="dashboard" class="container">
      <Header/>
      <div
        class="card shadow p-2 mb-4 bg-light rounded-lg border border-white"
        v-for="i in numbers"
        :key="i"
      >
        <div class="card-body">
          <div v-for="j in numbers2" :key="j">{{i}}.{{j}} This is some text within a card body.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Modal from "./components/Modal/Modal.vue";
export default {
  name: "dashboard",
  components: {
    Header,
    Modal
  },
  data() {
    return {
      numbers: [],
      numbers2: []
    };
  },
  mounted() {
    for (let i = 1; i < 10; i++) {
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

</style>
