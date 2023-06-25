import { AllResourceTypes, resourceToString, ResourceType } from './terrain-type.js';

export default class GamePlayer {
  // Cards
  // Victory points
  // name
  index: number;
  name: string;
  cards: number[];
  tradeRatio: number[];
  victoryPoints: number;
  resourceProduction: number[];

  constructor(index: number, name: string) {
    this.index = index;
    this.name = name;
    this.cards = [];
    this.tradeRatio = [];
    this.victoryPoints = 0;
    this.resourceProduction = [];
    for (const resourceType of AllResourceTypes) {
      this.cards.push(0);
      this.tradeRatio.push(4);
      this.resourceProduction.push(0);
    }
  }

  addCard(resource?: ResourceType, count?: number) {
    const cardCount = count !== undefined ? count : 1;
    if (resource !== undefined) {
      this.cards[resource] += cardCount;
    }
    //console.log("added " + resource + ":" + cardCount);
  }

  spend(action: number[]): boolean {
    // TODO use hasResources() here

    //does the player have the resources?
    for (let i = 0; i < action.length; i++) {
      if (i >= this.cards.length) {
        throw new Error('wrong number of costs for this action??');
      }
      if (this.cards[i] < action[i] || this.cards[i] < 0) {
        return false;
      }
    }

    //actually spend it since we know player has it
    console.log('Spending! ');
    console.log(action);
    for (let i = 0; i < action.length; i++) {
      this.cards[i] = this.cards[i] - action[i];
    }
    return true;
  }

  hasResources(action: number[]): boolean {
    //does the player have the resources?
    for (let i = 0; i < action.length; i++) {
      if (i >= this.cards.length) {
        throw new Error('wrong number of costs for this action??');
      }
      if (this.cards[i] < action[i] || this.cards[i] < 0) {
        return false;
      }
    }
    return true;
  }

  currentResources(): ResourceType[] {
    const resList: ResourceType[] = [];
    for (const allRes of AllResourceTypes) {
      for (let i = 0; i < this.cards[allRes]; i++) {
        resList.push(allRes);
      }
    }
    return resList;
  }

  lose(res: ResourceType) {
    if (this.cards[res] < 1) {
      throw new Error('Player ' + this.index + 1 + ' cannot lose resource ' + resourceToString(res));
    }
    this.cards[res]--;
  }

  toString() {
    return ('p;' +
      this.index + ';' +
      this.name + ';' +
      this.cards + ';' +
      this.victoryPoints
    );
  }

  setChildPrototypes() {
    //nothing to serialize!
  }

}
