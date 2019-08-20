<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { positiveData, negativeData } from '../../util/training';
import { Game } from '../../interfaces/GameInterfaces';
@Component
export default class Statistics extends Vue {
  @Prop() public gameData?: Game;
  @Prop({ default: '' }) public gameId?: string;
  @Prop({ default: false }) public readonly lost?: boolean;
}
</script>
<template>
  <div class="container-fluid">
    <div class="row my-1">
      <div class="col-xs-12 col-sm-5 col-md-7">
        <span
          class="fa-stack fa-lg shop-icon"
          v-on:click="$emit('togalModal', true)"
        >
          <i class="fa fa-circle fa-stack-2x"></i>
          <i class="fa fa-shopping-basket fa-stack-1x fa-inverse"></i>
        </span>
        <span>GameId: {{ gameId }}</span>
      </div>
      <div class="mt-2 card py-2 px-3 col-xs-12 col-sm-7 col-md-5">
        <div>
          <button
            class="col-xs-12 col-sm-5 col-md-3 my-1 btn btn-secondary py-1"
            v-show="lost == false"
            v-on:click="$emit('getMessages')"
          >
            Load new Ads
          </button>
          <button
            class="col-xs-12 col-sm-5 offset-sm-1 col-md-3 my-1 btn btn-success py-1"
            v-show="lost == false"
            v-on:click="$emit('getMessages')"
          >
            Get free scores
          </button>
          <button
            class="col-xs-12 col-sm-5 col-md-3 offset-md-1 my-1 btn btn-outline-secondary py-1"
            v-on:click="$emit('startGame')"
          >
            Restart
          </button>
        </div>
        <h5 style="font-weight:bold" class="my-1">
          {{ lost ? "Previous Results" : "Current results" }}
        </h5>
        <p>
          <b>Score:</b>
          {{ gameData.score ? gameData.score : 0 }}
        </p>
        <p>
          <b>Lives:</b>
          {{ gameData ? gameData.lives : 0 }}
        </p>
        <p>
          <b>Gold:</b>
          {{ gameData ? gameData.gold : 0 }}
        </p>
      </div>
    </div>
  </div>
</template>
