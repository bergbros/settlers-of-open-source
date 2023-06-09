import { HexCoords, ResourceType, TerrainType, GameHex, Game } from 'soos-gamelogic';
import { hexCoordsToPixels } from './utils';
import { isSeaType, resourceToLand, resourceToSymbol } from 'soos-gamelogic/src/terrain-type';

// Debug thing to show the HexCoords of every hex on the board.
const showAllCoords = true;

function getTerrainClass(terrainType: TerrainType, resourceType?: ResourceType): string {
  let terrainClass = '';
  if (terrainType === TerrainType.Water) {
    switch (resourceType) {
      case ResourceType.BrickPort: terrainClass = 'brick port'; break;
      case ResourceType.GrainPort: terrainClass = 'grain port'; break;
      case ResourceType.OrePort: terrainClass = 'ore port'; break;
      case ResourceType.SheepPort: terrainClass = 'sheep port'; break;
      case ResourceType.WoodPort: terrainClass = 'wood port'; break;
      case ResourceType.AnyPort: terrainClass = 'desert port'; break;
      case ResourceType.None: terrainClass = 'water'; break;
      default: terrainClass = 'water'; break;
    }
    return terrainClass;
  }
  if (terrainType !== TerrainType.Land) {
    return '';
  }
  switch (resourceType) {
    case ResourceType.Brick: terrainClass = 'brick'; break;
    case ResourceType.Grain: terrainClass = 'grain'; break;
    case ResourceType.Ore: terrainClass = 'ore'; break;
    case ResourceType.Sheep: terrainClass = 'sheep'; break;
    case ResourceType.Wood: terrainClass = 'wood'; break;
    case ResourceType.None: terrainClass = 'desert'; break;
    default: terrainClass = 'empty'; break;
  }

  return terrainClass;
}

export type HexProps = {
  gameHex: GameHex;
  onClick: (hexCoords: HexCoords) => void;
  placeRobber: boolean;
};

function getTradeRatio(resource: ResourceType) {
  if (resource === ResourceType.AnyPort)
    return '3:1';
  else
    return '2:1';
}

function centerIcon(gameHex: GameHex, highlightedHex: string) {
  let myDiv: null | JSX.Element = <div></div>;

  if (gameHex.frequency) {
    const dots = <div className='dots'>{resourceToSymbol(gameHex.resourceType).repeat(gameHex.production)}</div>;
    myDiv = <div className={"tileNumber none" + highlightedHex} >{gameHex.frequency}{dots}</div>;
  } else if (gameHex.terrainType && gameHex.terrainType === TerrainType.Water && gameHex.resourceType && gameHex.resourceType !== ResourceType.WaterNone) {
    myDiv = <div className={"port " + resourceToLand(gameHex.resourceType)}>{resourceToSymbol(gameHex.resourceType) + getTradeRatio(gameHex.resourceType)}</div>;
  } else {
    myDiv = null;
  }
  return myDiv;
}

export default function Hex(props: HexProps) {
  const { gameHex, onClick, placeRobber } = props;

  const terrainClass = isSeaType(gameHex.resourceType) ? 'water' : getTerrainClass(gameHex.terrainType, gameHex.resourceType);

  const { x, y } = hexCoordsToPixels(gameHex.coords);

  const highlightedHex = placeRobber && gameHex.resourceType !== undefined && gameHex.resourceType !== ResourceType.None ? " highlight" : "";
  const tileNumber = centerIcon(gameHex, highlightedHex);

  const coordsLabel = showAllCoords ? (<div className='tileCoords'>{gameHex.coords.x},{gameHex.coords.y}</div>) : null;


  return (
    <div
      key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
      className={`Hex ${terrainClass}`}
      style={{
        left: x + 'px',
        top: y + 'px',
      }}
      onClick={() => onClick(gameHex.coords)}
    >
      {tileNumber}
      {coordsLabel}
    </div>
  );
}


