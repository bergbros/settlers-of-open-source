import VertexCoords from './utils/vertex-coords';

export default class Player {
  // Cards
  // Victory points
  // name
  index: number;
  name: string;
  cards: string[];
  victoryPoints: number;

  constructor(index: number, name: string) {
    this.index = index;
    this.name = name;
    this.cards = [""];
    this.victoryPoints = 0;
  }
}