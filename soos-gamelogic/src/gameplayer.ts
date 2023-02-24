import { ResourceType } from './terrain-type';
import VertexCoords from './utils/vertex-coords';

export default class GamePlayer {
  // Cards
  // Victory points
  // name
  index: number;
  name: string;
  cards: number[];
  victoryPoints: number;

  constructor(index: number, name: string) {
    this.index = index;
    this.name = name;
    this.cards = [0,0,0,0,0];
    this.victoryPoints = 0;
  }

  addCard(resource?:ResourceType){
    if(resource!==undefined)
      this.cards[resource]++;
  }
  spend(action:number[]){
//    console.log("spending");
//    console.log(action);
    for (let i = 0; i<action.length; i++){
      if (i>=this.cards.length) return;
      this.cards[i] = this.cards[i]-action[i];
      if (this.cards[i]<0) throw new Error("Negative resources!");
    }
  }
}