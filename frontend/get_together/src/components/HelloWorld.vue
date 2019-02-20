<template>
  <div class="hello">
    <p>Latitude: {{location}}</p>
    <button v-on:click="get_location">Get Location</button>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: "HelloWorld",
  props: {
    msg: String,
    location_prop: Object
  },
  data: function() {
    return {
      location: this.location_prop || {}
    };
  },
  methods: {
    get_location: function() {
      this.$getLocation({}).then(coordinates => {
        this.location = coordinates;
        console.log(coordinates);
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
