<template>
  <div class="GoogleMapContainer">
    <h1 v-if="!mapLoaded"> Click to load map </h1>
    <div class="GoogleMap" v-on:click.once="loadMap"/>
  </div>
</template>

<script>
import GoogleMapInit from "./gmaps";
import MapStyle from './mapStyle';

export default {
  name: "GoogleMap",
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
        const google = await GoogleMapInit();
        const geocoder = new google.maps.Geocoder();
        const map = new google.maps.Map(this.$el, {
          styles: MapStyle.night
        });

        geocoder.geocode({ address: "Bucharest, Unirii" }, (results, status) => {
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

.GoogleMap {
  width: 100vw;
  height: 50vh;
}

.GoogleMapContainer {
  width: 100%;
  height: 50vh;
  background: gray
}

.GoogleMapContainer h1 {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>