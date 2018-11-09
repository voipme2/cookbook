<template>
    <v-autocomplete
            :items="recipes"
            v-model="search"
            hide-no-data
            label="Name"
    ></v-autocomplete>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: "Search",
    data: () => {
      return {
        search: null
      }
    },
    computed: mapState(['recipes'])
  }
</script>

<style scoped>

</style>
