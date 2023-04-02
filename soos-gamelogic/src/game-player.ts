import { AllResourceTypes, resourceToString, ResourceType } from './terrain-type.js';
import VertexCoords from './utils/vertex-coords.js';

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
    for (let i = 0; i < action.length; i++) {
      if (i >= this.cards.length) return;
      this.cards[i] = this.cards[i] - action[i];
      if (this.cards[i] < 0) throw new Error("Negative resources!");
    }
  }

  currentResources(): ResourceType[] {
    const resList: ResourceType[] = [];
    for (const allRes of AllResourceTypes) {
      for (let i = 0; i < this.cards[allRes]; i++)
        resList.push(allRes);
    }
    return resList;
  }

  lose(res: ResourceType) {
    if (this.cards[res] < 1) throw new Error("Player " + this.index + 1 + " cannot lose resource " + resourceToString(res));
    this.cards[res]--;
  }

  toString() {
    return ("p;" +
      this.index + ";" +
      this.name + ";" +
      this.cards + ";" +
      this.victoryPoints
    );
  }

}