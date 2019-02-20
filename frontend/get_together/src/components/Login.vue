<template>
    <div>
        I am Login
        <button @click="login">go home</button>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    methods: {
        login() {
            this.$router.push('/');
        }
    },
    mounted() {
        console.log(this.appConfig)
    }
}
</script>

<style>

</style>
