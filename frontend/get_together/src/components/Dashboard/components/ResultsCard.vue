<template>
  <div class="card-body">
    <div class="mb-4 text-right"> 
      <button class="btn btn-info">Done Choosing</button>
    </div>

    <h3 class="text-center">Vote Results</h3>

    <div class="row">
      <div class="col text-center">
        <div class="row mt-2" v-for="(vote, index) in votes" v-bind:key="index">
          <div class="col">
            <div class="row">
              <b class="mx-auto">{{weekdays[index]}}</b>
            </div>

            <div class="progress" style="height: 30px;">
              <div
                v-for="(option, index) in vote"
                v-bind:key="index"
                class="progress-bar text-truncate"
                :class="get_bg(index)"
                :title="option.name"
                role="progressbar"
                :style="{width: `${get_percent(option.votes)}%`}"
                :aria-valuenow="get_percent(option.votes)"
                aria-valuemin="0"
                aria-valuemax="100"
              ><span class="mx-auto" style="font-size: 120%" :title="option.name">{{option.name}}</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="col">
        <h3 class="text-center">Location</h3>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: "results-card",
  data() {
    return {
      weekdays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      members_count: 0,
      votes_data: [],
      all_venues: [],
      votes: []
    };
  },
  methods: {
    get_bg(index) {
      const bg = ['bg-primary', 'bg-warning', 'bg-info', 'bg-danger'];
      const text = ['text-light', 'text-dark', 'text-light', 'text-light'];
      return {
        [bg[index % bg.length]] : true,
        [text[index % text.length]] : true
      }
    },
    get_percent(votes) {
      return votes/this.members_count * 100;
    }
  },
  mounted() {
    this.$store.subscribe(mutation => {
      if (mutation.type === "set_current_group") {
        this.members_count = mutation.payload.members.length;
        this.votes_data = mutation.payload.votes;
        this.$forceUpdate();
      }

      if (mutation.type === "set_all_venues") {
        this.all_venues = mutation.payload;
        if (!this.votes_data) return;
        this.votes_data.forEach((votes, index) => {
          const venue_ids = Object.keys(votes);
          const all_venues = this.$store.getters.all_venues;

          this.votes[index] = all_venues[index]
            .filter(venue => venue_ids.includes(venue.id))
            .map(venue => {
              return {
                id: venue.id,
                name: venue.name,
                votes: votes[venue.id]
              };
            });
        });
        this.$forceUpdate();
      }
    });
  }
};
</script>

<style>
</style>
