<template>
  <span>
    <span class="mr-1">Time interval:</span>
    <select v-model="interval.start" v-on:change="forceUpdate" ref="startSelect">
      <option
        v-for="value in possible_start_values(interval.end)"
        :value="value"
        :key="value"
        :selected="value === interval.start"
      >{{value | toTimeOfDay}}</option>
    </select>
    <span class="mx-2">-</span>
    <select v-model="interval.end" v-on:change="forceUpdate" ref="endSelect">
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
const minutes_in_day = 24 * 60;
export default {
  name: "ScheduleInput",
  props: ["value"],
  data() {
    return {
      possible_values: [],
      interval: this.value
    };
  },
  watch: {
    value(new_value, old_value) {
      this.interval = new_value;
    }
  },
  created() {
    console.log("created!!", this.value);
    for (let v = 0; v <= minutes_in_day; v += 30) {
      this.possible_values.push(v);
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
      this.$emit("input", this.interval);
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
