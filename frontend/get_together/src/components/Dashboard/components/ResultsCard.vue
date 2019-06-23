<template>
  <div class="card-body">
    <h3 v-if="results_ready" class="text-center">Final Results</h3>
    <h3 v-else class="text-center">Vote Results</h3>

    <div class="row">
      <div v-if="results_ready" class="col">
        <div v-if="final_results.length > 0" class="list-group mx-5 my-2">
          <div
            v-for="(result, index) in final_results"
            v-bind:key="index"
            class="list-group-item list-group-item-action"
          >
            <div class="d-flex w-100 justify-content-between">
              <h4>
                <img class="mx-2" :src="result.venue.icon" height="24" width="24">
                {{result.venue.name}}
              </h4>
              <h5 class="mb-1">{{result.weekday}}</h5>
            </div>
            <p class="mb-1">{{result.venue.vicinity}}</p>
            <small v-if="result.interval.start < result.interval.end">
              Anytime between
              <b>{{result.interval.start | toTimeOfDay}}</b> and
              <b>{{result.interval.end | toTimeOfDay}}</b>
            </small>
            <small v-else>Sadly, we couldn't match any of your schedules ;(</small>
          </div>
        </div>
        <div v-else class="text-center">
          <h4>Sadly, we couldn't compute any results using your schedules and preferences</h4>
        </div>
      </div>
      <div v-else class="col text-center">
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
              >
                <span class="mx-auto" style="font-size: 120%" :title="option.name">{{option.name}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      group_data: null,
      votes_data: [],
      all_venues: [],
      votes: []
    };
  },
  computed: {
    results_ready() {
      if (this.all_venues.length == 0 || !this.group_data) {
        return false;
      }

      return (
        this.group_data.members.length === this.group_data.members_ready.length
      );
    },
    final_results() {
      if (!this.$store.getters.all_venues) {
        return [];
      }
      // if (this.all_venues.length === 0) {
      //   this.all_venues = this.$store.getters.all_venues;
      // }

      return compute_results(this.group_data, this.all_venues)
        .map((elem, index) => {
          if (!elem) {
            return null;
          }
          elem.weekday = this.weekdays[index];
          return elem;
        })
        .filter(elem => elem != null && elem.venue);
    }
  },
  methods: {
    get_bg(index) {
      const bg = ["bg-primary", "bg-warning", "bg-info", "bg-danger"];
      const text = ["text-light", "text-dark", "text-light", "text-light"];
      return {
        [bg[index % bg.length]]: true,
        [text[index % text.length]]: true
      };
    },
    get_percent(votes) {
      return (votes / this.members_count) * 100;
    }
  },
  filters: {
    toTimeOfDay(minutes) {
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;
      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      return h + ":" + m;
    }
  },
  mounted() {
    this.$store.subscribe(mutation => {
      if (mutation.type === "set_current_group") {
        this.group_data = mutation.payload;
        this.members_count = mutation.payload.members.length;
        this.votes_data = mutation.payload.votes;
        this.$forceUpdate();
      }

      if (mutation.type === "set_all_venues") {
        this.all_venues = mutation.payload;
        if (!this.votes_data) return;
        this.votes_data.forEach((votes, index) => {
          const venue_ids = Object.keys(votes || {});
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

function compute_results(group_data, all_venues) {
  let time_intervals = group_data.locations
    .reduce((acc, data) => {
      const time_intervals = data.days.map(e => e.time_intervals[0] || null);
      for (let i = 0; i < 7; i++) {
        if (time_intervals[i] != null) {
          if (acc[i] instanceof Array) {
            acc[i].push(time_intervals[i]);
          } else {
            acc[i] = [time_intervals[i]];
          }
        }
      }
      return acc;
    }, Array(7).fill(null))
    .map(intervals_for_day => {
      if (!intervals_for_day || intervals_for_day.length == 0) return null;
      return intervals_for_day.reduce(
        (acc, val) => {
          if (acc.start < val.start) {
            acc.start = val.start;
          }
          if (acc.end > val.end) {
            acc.end = val.end;
          }
          return acc;
        },
        { start: 0, end: 24 * 60 }
      );
    });

  let chosen_venues = group_data.votes.map((votes, day_index) => {
    let vote_values = Object.values(votes);
    let vote_keys = Object.keys(votes);
    let venues = [];

    if (vote_values.length === 0) {
      return null;
    }

    if (
      vote_values.length > 1 &&
      Math.min(...vote_values) === Math.max(...vote_values)
    ) {
      venues = vote_keys
        .map(id => all_venues[day_index].find(venue => venue.id === id))
        .sort((a, b) => {
          if (a.rating > b.rating) {
            return -1;
          }
          if (b.rating > a.rating) {
            return 1;
          }
          return 0;
        });
    } else {
      let max_id = vote_keys.reduce((acc, val) => {
        return votes[val] > votes[acc] ? val : acc;
      }, vote_keys[0]);
      venues = [all_venues[day_index].find(venue => venue.id === max_id)];
    }

    return venues[0] || null;
  });

  let res = Array(7)
    .fill(null)
    .map((e, index) => {
      if (!time_intervals[index] || !chosen_venues[index]) {
        return null;
      }
      // if (time_intervals[index].start > time_intervals[index].end) {
      //   return null;
      // }
      return {
        venue: chosen_venues[index],
        interval: time_intervals[index]
      };
    });

  return res;
}
</script>

<style>
</style>
