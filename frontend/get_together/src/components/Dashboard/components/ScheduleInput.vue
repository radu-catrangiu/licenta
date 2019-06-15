<template>
  <span>
    <span>Time interval: </span>
    <select v-model="interval.start" v-on:change="forceUpdate">
      <option
        v-for="value in possible_start_values(interval.end)"
        :value="value"
        :key="value"
        :selected="value === interval.start"
      >{{value | toTimeOfDay}}</option>
    </select>
    <span class="mx-2">-</span>
    <select v-model="interval.end" v-on:change="forceUpdate">
      <option
        v-for="value in possible_end_values(interval.start)"
        :value="value"
        :key="value"
        :selected="value === interval.end"
      >{{value | toTimeOfDay}}</option>
    </select>
  </span>
</template>

<script>
export default {
  name: "ScheduleInput",
  props: ["day"],
  data() {
    return {
      possible_values: [],
      minutes_in_day: 24 * 60,
      days: Array(7)
    };
  },
  watch: {},
  created() {
    for (let v = 0; v <= this.minutes_in_day; v += 30) {
      this.possible_values.push(v);
    }
    for (let day = 0; day < 7; day++) {
      this.days[day] = {
        start: 0,
        end: 24 * 60
      };
    }
  },
  computed: {
    interval() {
      return this.days[this.day];
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
  methods: {
    forceUpdate() {
      this.$forceUpdate();
    },
    possible_start_values(end) {
      return this.possible_values.filter(e => e < end);
    },
    possible_end_values(start) {
      return this.possible_values.filter(e => e > start);
    }
  }
};
</script>

<style>
</style>
