import moment from "moment";
import _ from "lodash"; 

import {
    Game,
    Purchase,
    GameAd,
    GameSolution,
    ShopItem
  } from "../../../interfaces/GameInterfaces";

export const isBase64 = (str: string)=> {
    return str.includes("=") ? atob(str) : str;
  }

  export const transform = (msg: GameAd,classifier:any): GameAd=> {
    let item = Object.create(msg);
    if (msg.encrypted && msg.encrypted == 1) {
      item.probability = atob(msg.probability);
      item.adId = atob(msg.adId);
      item.message = atob(msg.message);
    }
    item.prediction = _.upperFirst(predictor(item,classifier));
    item.startedTime = moment().unix();
    item.endTime = moment()
      .add(msg.expiresIn, "minutes")
      .unix();
    return item;
  }
  export const predictor = (msg: GameAd,classifier:any) =>{
    switch (msg.probability) {
      case "Suicide mission":
      case "Rather detrimental":
        return "negative";
      default:
        return classifier.classify(msg.message + "," + msg.probability);
    }
  }
  export const adStatus = (message: GameAd) => {
    let probability: any = {
      "Piece of cake": "green",
      "Hmmm....": "orange",
      "Sure thing": "green",
      "Walk in the park": "gray",
      "Quite likely": "gray",
      Gamble: "purple",
      Risky: "red",
      "Rather detrimental": "red",
      "Suicide mission": "red"
    };
    return probability[message.probability];
  }