<template>
  <div class="GmapContainer">
    <h1 v-if="!mapLoaded"> Click to load map </h1>
    <div class="Gmap" v-on:click.once="loadMap"/>
  </div>
</template>

<script>
import gmapsInit from "../utils/gmaps";

export default {
  name: "Gmap",
  data: function() {
    return {
      mapLoaded: false
    };
  },
  async mounted() {
    // await this.loadMap();
  },
  methods: {
    async loadMap() {
      try {
        const google = await gmapsInit();
        const geocoder = new google.maps.Geocoder();
        const map = new google.maps.Map(this.$el);

        geocoder.geocode({ address: "Bucharest" }, (results, status) => {
          if (status !== "OK" || !results[0]) {
            throw new Error(status);
          }
          map.setOptions({
            streetViewControl: false,
            disableDefaultUI: true,
            scrollwheel: false
          });
          map.setCenter(results[0].geometry.location);
          map.fitBounds(results[0].geometry.viewport);

          map.setZoom(12);
          this.mapLoaded = true;
        });
      } catch (error) {
        // eslint-disable-next-line
        console.debug(error);
      }
    }
  }
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.Gmap {
  width: 100vw;
  height: 50vh;
}

.GmapContainer {
  width: 100vw;
  height: 50vh;
  background: rgb(136, 136, 129)
}

.GmapContainer h1 {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>