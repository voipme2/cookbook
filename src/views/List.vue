<template>
    <v-card>
        <v-container
                fluid
                grid-list-lg
        >
            <v-layout row wrap>
                <v-flex xs12 v-for="recipes in recipes">
                    <v-card >
                        <v-layout>
                            <v-flex xs5>
                                <v-img
                                        :src="recipe.imageUrl"
                                        height="125px"
                                        contain
                                ></v-img>
                            </v-flex>
                            <v-flex xs7>
                                <v-card-title primary-title>
                                    <div>
                                        <div class="headline">{{recipe.name}}</div>
                                        <div>{{recipe.description}}</div>
                                    </div>
                                </v-card-title>
                            </v-flex>
                        </v-layout>
                        <v-divider light></v-divider>
                        <v-card-actions class="pa-3">
                            <v-btn icon>
                                <v-icon>edit</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </v-card>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: "List",
    computed: mapState(['recipes'])
  }
</script>

<style scoped>

</style>
