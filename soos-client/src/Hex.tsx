import { HexCoords, ResourceType, TerrainType } from 'soos-gamelogic';
import GameHex from 'soos-gamelogic/src/gamehex';
import { hexCoordsToPixels } from './utils';

// Debug thing to show the HexCoords of every hex on the board.
const showAllCoords = true;

function getTerrainClass(terrainType: TerrainType, resourceType?: ResourceType): string {
  if (terrainType === TerrainType.Water) {
    return 'water';
  }
  if (terrainType !== TerrainType.Land) {
    return '';
  }
  let terrainClass = '';
  switch (resourceType) {
    case ResourceType.Brick: terrainClass = 'brick'; break;
    case ResourceType.Grain: terrainClass = 'grain'; break;
    case ResourceType.Ore: terrainClass = 'ore'; break;
    case ResourceType.Sheep: terrainClass = 'sheep'; break;
    case ResourceType.Wood: terrainClass = 'wood'; break;
    case ResourceType.None: terrainClass = 'desert'; break;
    default: terrainClass = ''; break;
  }

  return terrainClass;
}

export type HexProps = {
  gameHex: GameHex;
  onClick: (hexCoords: HexCoords) => void;
  placeRobber: boolean;
};

export default function Hex(props: HexProps) {
  const { gameHex, onClick, placeRobber } = props;

  const terrainClass = getTerrainClass(gameHex.terrainType, gameHex.resourceType);

  const { x, y } = hexCoordsToPixels(gameHex.coords);

  const highlightedHex = placeRobber && gameHex.resourceType !== undefined && gameHex.resourceType !== ResourceType.None ? " highlight" : "";
  const tileNumber = gameHex.frequency
    ? (<div className={"tileNumber" + highlightedHex} >{gameHex.frequency}</div>)
    : null;

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
