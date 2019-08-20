import axios from 'axios';
import {Game, Purchase, GameAd, GameSolution, ShopItem} from '../interfaces/GameInterfaces';

export default class GameApi {
    public gameData?: Game;
    public gameId!: string;
    public url = 'https://dragonsofmugloar.com/api/v2';
    constructor() {
     this.gameData = {
      lives: 0,
      score: 0,
      gold: 0,
      gameId: '',
      highScore: 0,
      turn: 0,
      level: 0,
    };
    }
    public async startGame(): Promise<Game> {
      const response = await axios.post<Game>(`${this.url}/game/start`);
      this.gameId = response.data.gameId;
      this.gameData = response.data;
      return response.data;
    }

    public async getMessages(): Promise<GameAd[]> {
      return (await axios.get<GameAd[]>(`${this.url}/${this.gameId}/messages`)
      ).data;
    }
    public async solveMessage(addId: string): Promise<GameSolution> {
     return (await axios.post<GameSolution>(`${this.url}/${this.gameId}/solve/${addId}`,
      {gameId: this.gameId, addId})).data;
    }
    public async shopList(): Promise<ShopItem[]> {
      return (await axios.get<ShopItem[]>(`${this.url}/${this.gameId}/shop`)).data;
     }
     public async shopItem(itemId: string): Promise<Purchase> {
      return (await axios.post<Purchase>(`${this.url}/${this.gameId}/shop/buy/${itemId}`,
       {gameId: this.gameId, itemId})).data;
     }
  }
