<style src="./styles.scss" lang="scss"></style>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import _, { ArrayIterator } from "lodash";
import VueToast from "vue-toast-notification";
import moment from "moment";
import "vue-toast-notification/dist/index.css";

import GameApi from "../../services/GameService";
import { isBase64, transform, predictor } from "./util/helpers";
import {
  Game,
  Purchase,
  GameAd,
  GameSolution,
  ShopItem
} from "../../interfaces/GameInterfaces";
import { positiveData, negativeData } from "../../util/training";
import Shop from "./Shop.vue";
import Listing from "./Listing.vue";
import Statistics from "./Statistics.vue";
Vue.use(VueToast);
var BayesClassifier = require("bayes-classifier");

@Component({ components: { Shop, Listing ,Statistics} })
export default class Index extends Vue {
  started: boolean = false;
  lost: boolean = false;
  gameData?: Game;
  service = new GameApi();
  messages: Array<GameAd> = [];
  shopItems?: Array<ShopItem> ;
  classifier: any;
  solvingWarningCount = 0;
  solvingCount = 0;
  gameId: string = "";

  created() {
    this.classifier = new BayesClassifier();
    this.classifier.addDocuments(positiveData, `positive`);
    this.classifier.addDocuments(negativeData, `negative`);
    this.classifier.train();
    this.gameData = this.service.gameData;
  }
  startGame() {
    this.lost = false;
    this.started = true;
    this.solvingWarningCount = 0;
    this.solvingCount = 0;
    this.service.startGame().then((data: Game) => {
      this.gameId = data.gameId;
      this.getMessages();
    });
    Vue.$toast.info(`Win some free scores at the "Get free scores" button`, {
      position: "top-right",
      duration: 6000
    });
  }

  removeMessage(message: GameAd) {
    this.messages = this.messages.filter(msg => msg.adId != message.adId);
  }
  getMessages() {
    this.solvingWarningCount += 1;
    this.service.getMessages().then((data: Array<GameAd>) => {
      let freeValues = ["Piece of cake", "Sure thing"];

      this.messages = data
        .filter((ad: GameAd) =>
          freeValues.includes(ad.probability) == false ? true : false
        )
        .map((ad: GameAd) => transform(ad, this.classifier))
        .sort(function(x: GameAd, y: GameAd) {
          return x.expiresIn - y.expiresIn;
        });
      // Solve free ad's
      data.map((ad: GameAd) => {
        switch (ad.probability) {
          case "Piece of cake":
          case "Sure thing":
            return this.solveAdItem(ad, "free");
          default:
            break;
        }
      });
    });
  }
  solveAdItem(message: GameAd, solveType: string = "free") {
    if (solveType === "manual") {
      this.solvingCount += 1;
      if (this.solvingWarningCount < 2 && this.solvingCount == 3) {
        this.solvingWarningCount += 1;
        this.solvingCount = 0;
        Vue.$toast.info(`Dont miss out on the free scores`, {
          position: "top-right"
        });
      }
    }
    this.service
      .solveMessage(message.adId)
      .then((data: GameSolution) => {
        this.gameData = data;
        if (data.lives == 0 || data.status === "Game Over") {
          return Promise.reject("Game Over");
        }
        this.removeMessage(message);

        if (data.success) {
          Vue.$toast.open(
            `You have earned ${solveType === "free" ? "free" : ""} ${
              message.reward
            } scores`
          );
        }
        this.availableAdsInLIsting();
      })
      .catch((error: any) => {
        if (
          error.response &&
          error.response.data.error === "No ad by this ID exists"
        ) {
          this.removeMessage(message);
          this.availableAdsInLIsting();
        } else if (error == "Game Over") {
          this.lost = true;
          this.messages = [];
          Vue.$toast.error(`You have lost the game`);
        }
      });
  }
  shopItem(item: ShopItem) {
    this.service.shopItem(item.id).then((data: Purchase) => {
      if (data.shoppingSuccess) {
        this.gameData!.lives = data.lives;
        this.gameData!.gold = data.gold;
        Vue.$toast.success(
          `Shoping of ${item.name} at  ${item.cost} cost was successful`
        );
      }
    });
  }
  adExpired(msg: GameAd) {
    this.removeMessage(msg);
    this.availableAdsInLIsting();
  }

  availableAdsInLIsting() {
    if (this.messages.length == 0) {
      if (this.lost != true) {
        this.getMessages();
      }
    }
  }
  togalModal(state: boolean) {
    if (state) {
      this.service
        .shopList()
        .then((data: Array<ShopItem>) => (this.shopItems = data));
      this.$modal.show("shopModal", { height: "auto" });
    } else {
      this.$modal.hide("shopModal");
    }
  }
}
</script>
<template>
  <div class="container-fluid">
    <div v-if="started == false" class="container-centered">
      <button class="my-1 btn btn-outline-success" v-on:click="startGame()">
        Start Game
      </button>
    </div>
    <div v-else>
      <Statistics 
                   v-bind:lost="lost"  
                   v-bind:gameData="gameData"
                   v-bind:gameId="gameId"
                   @getMessages="getMessages" 
                   @togalModal="togalModal" 
                   @startGame="startGame"/>
      </div>

      <div class="mt-10 message-listing">
        <Listing
          v-bind:messages="messages"
          @solveAdItem="solveAdItem"
        />
        <modal
          name="shopModal"
          width="50%"
          height="85%"
          :pivotX="0.5"
          :pivotY="0.1"
        >
          <Shop v-bind:shopItems="shopItems" @shopItem="shopItem"></Shop>
        </modal>
      </div>
    </div>
</template>
