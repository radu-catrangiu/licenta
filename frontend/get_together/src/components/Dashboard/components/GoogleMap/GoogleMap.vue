<template>
  <div class="GoogleMapContainer">
    <h1 v-if="!mapLoaded">Click to load map, {{user.username}}</h1>
    <div class="GoogleMap" v-on:click.once="loadMap"/>
  </div>
</template>

<script>
import GoogleMapInit from "./gmaps";
import MapStyle from "./mapStyle";
import init from "./init.json";

let Google;

export default {
  name: "GoogleMap",
  data: function() {
    return {
      map: {},
      markers: {},
      venue_markers: [],
      mapLoaded: false,
      point_to_location: false
    };
  },
  props: ["user", "venues", "locations", "point_to_location_callback"],
  async mounted() {
    /* eslint-disable */
    this.loadMap();
  },
  watch: {
    locations: function(new_val, old_val) {
      if (this.mapLoaded) {
        console.log("watch:", new_val);
        unset_markers(this.markers);
        set_markers(this.map, this.markers, new_val);
      }
    },
    venues: function(new_val, old_val) {
      if (this.mapLoaded) {
        unset_venue_markers(this.venue_markers);
        set_venue_marker(this, this.map, this.venue_markers, new_val);
      }
    }
  },
  methods: {
    async loadMap() {
      try {
        Google = await GoogleMapInit();

        this.map = new Google.maps.Map(this.$el, {
          styles: MapStyle.blueGray,
          zoom: 12,
          streetViewControl: false,
          disableDefaultUI: true,
          gestureHandling: "cooperative"
        });
        let map = this.map;

        map.setCenter(init.geometry.location);
        map.fitBounds(init.geometry.viewport);

        map.addListener("click", e => {
          console.log(e);
          if (this.point_to_location) {
            const location = {
              lat_lng: {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              }
            };

            if (this.point_to_location_callback)
              this.point_to_location_callback(location);

            this.point_to_location = false;
          }
        });

        this.mapLoaded = true;
        this.$parent.map_loaded = true;
        set_markers(this.map, this.markers, this.locations);
        set_venue_marker(this, this.map, this.venue_markers, this.venues);
      } catch (error) {
        // eslint-disable-next-line
        console.debug(error);
      }
    }
  }
};

function unset_markers(markers) {
  for (let user in markers) {
    markers[user].setVisible(false);
  }
}

function set_markers(map, markers, locations) {
  locations.forEach(location => {
    if (!location) {
      return;
    }

    if (!markers[location.username]) {
      markers[location.username] = new Google.maps.Marker({
        map: map,
        label: {
          color: "black",
          fontWeight: "bold",
          text: location.username
        }
      });
    }
    if (location.lat_lng && location.lat_lng.lat && location.lat_lng.lng)
      move_marker(markers[location.username], location.lat_lng);
  });
}

function move_marker(marker, position) {
  if (!marker) {
    return;
  }
  marker.setPosition(position);
  marker.setVisible(true);
}

function set_venue_marker(self, map, venue_markers, venues) {
  venues.forEach(venue => {
    if (!venue) {
      return;
    }
    const marker = new Google.maps.Marker({
      map: map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
      }
    });

    marker.addListener("click", function() {
      self.$parent.venue_clicked(venue);
    });

    venue_markers.push(marker);

    if (
      venue.geometry.location &&
      venue.geometry.location.lat &&
      venue.geometry.location.lng
    )
      move_marker(marker, venue.geometry.location);
  });
}

function unset_venue_markers(venue_markers) {
  venue_markers.forEach(marker => {
    marker.setMap(null);
  });
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.GoogleMap {
  /* width: 100vw; */
  height: 55vh;
}

.GoogleMapContainer {
  width: 100%;
  height: 50vh;
  background: #efefef;
}

.GoogleMapContainer h1 {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>