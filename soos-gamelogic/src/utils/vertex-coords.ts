// settlements
import HexCoords, { HexDirection } from './hex-coords';

export enum VertexDirection {
    // in clockwise order
    N= 0,
    NE = 1,
    SE = 2,
    S = 3,
    SW = 4,
    NW = 5,
  }

const VertexDirectionsNeedNormalize = Object.freeze([
    VertexDirection.NE,
    VertexDirection.SE,
  VertexDirection.S,
])

export default class VertexCoords {
  coords: HexCoords;
  direction: VertexDirection;

  constructor(coords: HexCoords, direction: VertexDirection) {
    this.coords = coords;
    this.direction = direction;
  }

  normalize():VertexCoords {
    let finalVC:VertexCoords = new VertexCoords(this.coords,this.direction);
    if (VertexDirectionsNeedNormalize.includes(this.direction)) {
        if (this.direction===VertexDirection.SE){
            finalVC = new VertexCoords( new HexCoords(this.coords.x+1,this.coords.y), VertexDirection.NW);
        } else if (this.direction===VertexDirection.S){
            //?? ideally I would use shovedRight here, but I don't have access to it I believe
            finalVC = new VertexCoords( new HexCoords(this.coords.x+(this.coords.y%2),this.coords.y+1), VertexDirection.NW);
        } else { //South East
            finalVC = new VertexCoords( new HexCoords(this.coords.x+(this.coords.y%2),this.coords.y+1), VertexDirection.N);
        }
    }
    return finalVC;
  }

  opposite():VertexCoords{
    let opp:VertexCoords= new VertexCoords(this.coords,this.direction+3);
    if (opp.direction>5) opp.direction-=6;
    return opp;
  }
}