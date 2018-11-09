<template>
    <v-app>
        <v-navigation-drawer
                v-model="drawer"
                clipped
                app
        >
            <v-list dense>
                <v-list-tile>
                    <v-list-tile-action>
                        <v-icon>edit</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Create</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="openDownload">
                    <v-list-tile-action>
                        <v-icon>download</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Download</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar dark color="primary">
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title class="white--text">cookbook</v-toolbar-title>

            <v-spacer></v-spacer>
            <search></search>
        </v-toolbar>
        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
  import Search from '@/components/Search.vue'

  export default {
    name: 'App',
    components: {
      Search
    },
    data: () => {
      return {
        drawer: null
      }
    },
    methods: {
      openDownload() {

      }
    },
    mounted() {
      this.$store.dispatch("loadRecipes");
    }
  }
</script>
