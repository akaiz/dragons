<style src="./styles.scss" lang="scss"></style>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import _, { ArrayIterator } from "lodash";
import VueToast from "vue-toast-notification";
import moment from "moment";
import "vue-toast-notification/dist/index.css";
import BayesClassifier from "bayes-classifier";
import GameApi from "../../services/GameService";
import { isBase64, transform, predictor } from "./util/helpers";
import {
  Game,
  Purchase,
  GameAd,
  GameSolution,
  ShopItem,
} from "../../interfaces/GameInterfaces";
import { positiveData, negativeData } from "../../util/training";
import Shop from "./Shop.vue";
import Listing from "./Listing.vue";
import Statistics from "./Statistics.vue";

Vue.use(VueToast);

@Component({ components: { Shop, Listing, Statistics } })
export default class Index extends Vue {
  public started: boolean = false;
  public lost: boolean = false;
  public gameData?: Game;
  public service = new GameApi();
  public messages: GameAd[] = [];
  public shopItems?: ShopItem[];
  public classifier: any;
  public solvingWarningCount = 0;
  public solvingCount = 0;
  public gameId: string = "";
  public created() {
    this.shopItems = [];
    this.classifier = new BayesClassifier();
    this.classifier.addDocuments(positiveData, `positive`);
    this.classifier.addDocuments(negativeData, `negative`);
    this.classifier.train();
    this.gameData = this.service.gameData;
  }
  public startGame() {
    this.lost = false;
    this.started = true;
    this.solvingWarningCount = 0;
    this.solvingCount = 0;
    this.service.startGame().then((data: Game) => {
      this.gameId = data.gameId;
      this.getMessages();
      this.service
        .shopList()
        .then((shopItems: ShopItem[]) => (this.shopItems = shopItems));
    });
    this.toast("info", `Win some free scores at the "Get free scores" button`, {
      position: "top-right",
      duration: 6000,
    });
  }
  public toast(type: string, data: string, style: any = null) {
    const toast = Vue.$toast;
    switch (type) {
      case "info":
        toast.info(data, style);
        break;
      case "error":
        toast.error(data, style);
        break;
      case "open":
        toast.open(data, style);
        break;
      case "success":
        toast.success(data, style);
        break;
      default:
        toast.info(data, style);
        break;
    }
  }
  public removeMessage(message: GameAd) {
    this.messages = this.messages.filter((msg) => msg.adId !== message.adId);
  }
  public getMessages() {
    this.solvingWarningCount += 1;
    this.service.getMessages().then((data: GameAd[]) => {
      const freeValues = ['Piece of cake', 'Sure thing'];

      this.messages = data
        .filter((ad: GameAd) =>
          freeValues.includes(ad.probability) === false ? true : false,
        )
        .map((ad: GameAd) => transform(ad, this.classifier))
        .sort((x: GameAd, y: GameAd) => {
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
  public solveAdItem(message: GameAd, solveType: string = "free") {
    if (solveType === "manual") {
      this.solvingCount += 1;
      if (this.solvingWarningCount < 2 && this.solvingCount === 3) {
        this.solvingWarningCount += 1;
        this.solvingCount = 0;
        this.toast("info", `Dont miss out on the free scores`, {
          position: "top-right",
        });
      }
    }
    this.service
      .solveMessage(message.adId)
      .then((data: GameSolution) => {
        this.gameData = data;
        if (data.lives === 0 || data.status === "Game Over") {
          this.lost = true;
          this.messages = [];
          this.toast('error', `You have lost the game`);
        }
        this.removeMessage(message);

        if (data.success) {
          this.toast(
           'open',
            `You have earned ${solveType === "free" ? "free" : ""} ${
              message.reward
            } scores`,
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
        }
      });
  }
  public shopItem(item: ShopItem) {
    this.service.shopItem(item.id).then((data: Purchase) => {
      if (data.shoppingSuccess) {
        this.gameData!.lives = data.lives;
        this.gameData!.gold = data.gold;
        this.toast(
          'success',
          `Shoping of ${item.name} at  ${item.cost} cost was successful`,
        );
      }
    });
  }
  public adExpired(msg: GameAd) {
    this.removeMessage(msg);
    this.availableAdsInLIsting();
  }

  public availableAdsInLIsting() {
    if (this.messages.length === 0) {
      if (this.lost !== true) {
        this.getMessages();
      }
    }
  }
  public togalModal(state: boolean) {
    if (state) {
      this.$modal.show('shopModal', { height: "auto" });
    } else {
      this.$modal.hide('shopModal');
    }
  }
}
</script>
<template>
  <div class="container-fluid">
    <div v-if="started == false" class="container-centered">
      <button class="my-1 btn btn-outline-success" v-on:click="startGame()">Start Game</button>
    </div>
    <div v-else>
      <Statistics
        v-bind:lost="lost"
        v-bind:gameData="gameData"
        v-bind:gameId="gameId"
        @getMessages="getMessages"
        @togalModal="togalModal"
        @startGame="startGame"
      />
    </div>

    <div class="mt-10 message-listing">
      <Listing v-bind:messages="messages" @solveAdItem="solveAdItem" />
      <modal name="shopModal" width="50%" height="85%" :pivotX="0.5" :pivotY="0.1">
        <Shop v-bind:shopItems="shopItems" @shopItem="shopItem"></Shop>
      </modal>
    </div>
  </div>
</template>
