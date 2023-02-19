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
    if(resource)
      this.cards[resource]++;
  }
}