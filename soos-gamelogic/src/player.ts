import VertexCoords from './utils/vertex-coords';

export default class Player {
  // Cards
  // Victory points
  // name
  name:string;
  cards:string[];
  victoryPoints:number;
  

  constructor(name:string){
    this.name = name;
    this.cards = [""];
    this.victoryPoints=0;
  }

  placeSettlement(location:VertexCoords){


  }
}