export interface Game{
    gameId:string,
    gold:number
    highScore: number
    level: number
    lives: number
    score: number
    turn: number
}
export interface GameSolution extends Game{
  message: string,
  success:boolean,
  status?:string,
}
export interface GameAd{
    adId: string,
    message:string,
    reward:number,
    expiresIn:number,
    probability:string,
    encrypted?:number,
    startedTime?:number,
    endTime?:number,
    prediction?:string,
}
export interface ShopItem{
  id: string,
  name:string,
  cost:number,
}
export interface Purchase{
  shoppingSuccess:string
  gold:number
  level: number
  lives: number
  turn: number
}
