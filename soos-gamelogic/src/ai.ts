import Game from './game.js';
import { AllResourceTypes, GameTown, VertexCoords } from './index.js';
import { getEdges, getHexes } from './utils/vertex-coords.js';

// evaluate all possible towns by production, get top {count}
export function findBestSettlementSpots(game: Game, count: number): VertexCoords[] {
  type EvaluatedTown = {
    town: GameTown;
    coords: VertexCoords;
    production: number;
  }

  const towns: EvaluatedTown[] = [];

  for (const town of game.map.towns) {
    if (town.isUnclaimed()) {
      towns.push({
        town,
        coords: town.coords!,
        production: evaluateTown(game, town),
      })
    }
  }

  // sort by production, in descending order
  towns.sort((a: EvaluatedTown, b: EvaluatedTown) => b.production - a.production);
  return towns.slice(0, count).map(et => et.coords);
}

function evaluateTown(game: Game, newTown: GameTown, log = false): number {
  let prodScore = 0;
  const tradeBenefit: number[] = [];
  const potentialNewProduction: number[] = [];
  const currPlayer = game.players[game.currPlayerIdx];
  for (const resource of AllResourceTypes) {
    prodScore += newTown.production[resource] * ((currPlayer.tradeRatio[resource] - 4) / 3 + 1);
    potentialNewProduction.push(currPlayer.resourceProduction[resource] + newTown.production[resource]);
    tradeBenefit.push(0);
  }
  if (!newTown.coords) {
    throw new Error('evaluated town has no coords??');
  }

  let tradeScore = 0;
  for (const coords of getHexes(newTown.coords)) {
    if (game.map.getHex(coords)?.getTrade() === 1) {
      const newTR = game.getTradeRatios(coords);
      for (const resource of AllResourceTypes) {
        if (!newTR) {
          continue;
        }
        tradeBenefit[resource] = Math.max(0, currPlayer.tradeRatio[resource] - newTR[resource]) * (potentialNewProduction[resource] + .5);
      }
      //console.log("port: ");
      //console.log(tradeBenefit);
    }
  }
  for (const resource of AllResourceTypes) {
    tradeScore += tradeBenefit[resource];
  }
  if (log) {
    console.log(potentialNewProduction);
    console.log(tradeBenefit);
  }
  newTown.eval = prodScore + tradeScore / 8;
  return newTown.eval;
}