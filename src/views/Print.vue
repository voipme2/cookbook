<template>
    <v-layout row>
        <v-flex xs12>
            <div class="title">{{recipe.name}}</div>
        </v-flex>
        <v-flex xs12></v-flex>
    </v-layout>
    <div flex-sm="95" flex-gt-sm="80">
        <h3>{{recipe.name}}</h3>
        <h4>Ingredients</h4>
        <ul>
            <li ng-repeat="ingred in recipe.ingredients">
                {{ingred.text}}
            </li>
        </ul>
        <ol>
            <li style="padding: 5px" ng-repeat="step in recipe.steps">
                {{step.text}}
            </li>
        </ol>
        <div layout="row" layout-align="center">
            <div flex="10">
                <md-button class="md-primary md-raised" ng-click="back()">Back</md-button>
            </div>
        </div>
    </div>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: "Print",
    computed: mapState(['currentRecipe'])
  }
</script>

<style scoped>

</style>
