import { AllResourceTypes, resourceToString, ResourceType } from './terrain-type';
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
    this.cards = [0, 0, 0, 0, 0];
    this.victoryPoints = 0;
  }

  addCard(resource?: ResourceType, count?: number) {
    const cardCount = count ? count : 1;
    if (resource !== undefined)
      this.cards[resource] += cardCount;
  }
  spend(action: number[]) {
    //    console.log("spending");
    //    console.log(action);
    for (let i = 0; i < action.length; i++) {
      if (i >= this.cards.length) return;
      this.cards[i] = this.cards[i] - action[i];
      if (this.cards[i] < 0) throw new Error("Negative resources!");
    }
  }

  currentResources(): ResourceType[] {
    // TODO push a resource *per card* instead of just 1 per resource
    const resList: ResourceType[] = [];
    for (const allRes of AllResourceTypes)
      resList.push(AllResourceTypes[allRes]);

    for (const res of resList) {
      if (this.cards[res] === 0) {
        resList.splice(res, 1);
      }
    }
    return resList;
  }
  lose(res: ResourceType) {
    if (this.cards[res] < 1) throw new Error("Player " + this.index + 1 + " cannot lose resource " + resourceToString(res));
    this.cards[res]--;
  }

}