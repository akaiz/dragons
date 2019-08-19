<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import "vue-toast-notification/dist/index.css";
import { positiveData, negativeData } from "../../util/training";
import { adStatus } from "./util/helpers";
import { GameAd } from "../../interfaces/GameInterfaces";
@Component
export default class Listing extends Vue {
  @Prop() messages: any;
  status(message: GameAd): string {
    return adStatus(message);
  }
}
</script>
<template>
  <div class="container-fluid">
    <h4 class="px-3 py-0">Ad's listing</h4>
    <v-container fluid>
      <v-row>
        <v-col v-for="message in messages" :key="message.adId" cols="4">
          <v-card flat tile>
            <div class="px-4 message-item">
              <p class="my-1">
                <b>AdId:</b>
                {{ message.adId }}
              </p>
              <p class="my-1">
                <b>Message:</b>
                {{ message.message }}
              </p>
              <p class="my-1">
                <b>Probability:</b>
                <span v-bind:style="{ color: status(message) }">{{
                  message.probability
                }}</span>
              </p>
              <p class="my-1">
                <b>Reward:</b>
                {{ message.reward }}
              </p>
              <p class="my-1">
                <b>We predict:</b>
                <span
                  v-bind:style="{
                    color: message.prediction === 'Positive' ? 'green' : 'black'
                  }"
                  >{{ message.prediction }}</span
                >
              </p>
              <p class="my-1">
                <b>Expires in:</b>
                <span class="count-down">
                  <vue-countdown-timer
                    @end_callback="message;"
                    :start-time="message.startedTime"
                    :end-time="message.endTime"
                    :interval="1000"
                    :end-text="'Ended!'"
                    :day-txt="null"
                    :hour-txt="null"
                    :minutes-txt="'mins'"
                    :seconds-txt="'sec'"
                  ></vue-countdown-timer>
                </span>
              </p>
              <button
                class="my-1 btn btn-secondary py-0"
                v-on:click="$emit('solveAdItem', message, `manual`)"
              >
                Solve
              </button>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
