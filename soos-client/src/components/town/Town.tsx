import { vertexCoordsToPixels } from '../../utils';
import { GameTown, VertexCoords } from 'soos-gamelogic';
import Variables from '../../scss/variables';
import './Town.scss';

export type TownProps = {
  gameTown: GameTown;
  highlighted: boolean;
  premove: boolean;
  onClick: (vertexCoords: VertexCoords) => void;
};

// offset slightly from 0,0 so stroke doesn't go outside bounds of svg
const baseOffset = 3;

function townPoint(townSize: number, point: [number, number]) {
  const x = point[0];
  const y = point[1];
  return `${baseOffset + x * townSize},${baseOffset + y * townSize}`;
}

function townPoints(townSize: number, pointList: [number, number][]) {
  return pointList.map(p => townPoint(townSize, p)).join(' ');
}

const settlementSize = 20;
const settlementPolygonPoints = townPoints(settlementSize, [[0, 1], [0, .4], [.5, 0], [1, .4], [1, 1]]);

const citySize = 24;
const cityPolygonPoints = townPoints(citySize, [[0, .25], [0, 1], [1, 1], [1, .5], [.5, .5], [.5, .25], [.25, 0]]);

const suburbSize = 28;
// same as city for now
const suburbPolygonPoints = townPoints(suburbSize, [[0, .25], [0, 1], [1, 1], [1, .5], [.5, .5], [.5, .25], [.25, 0]]);

export const Town = (props: TownProps) => {
  const { gameTown, onClick, premove, highlighted } = props;

  const playerIdx = gameTown.playerIdx ?? -1;
  const playerColor = Variables.PlayerColors[playerIdx];

  const playerClass = gameTown.isUnclaimed() ? 'unclaimed' : '';
  let highlightedClass = '';
  if (highlighted || premove) {
    highlightedClass = 'highlight';
  }
  // let townLevel = '';
  let townSize = 10, points;

  let svg = null;
  switch (gameTown.townLevel) {
    case 0:
    case 1:
      townSize = settlementSize;
      points = settlementPolygonPoints;
      break;
    case 2:
      townSize = citySize;
      points = cityPolygonPoints;
      break;
    case 3:
      townSize = suburbSize;
      points = suburbPolygonPoints;
      break;
  }

  let fillOpacity, strokeDasharray, strokeWidth = 0;
  if (playerIdx === -1 || premove) {
    // dotted line
    fillOpacity = '0';
    strokeDasharray = '4 2';
    strokeWidth = 3;
  }

  svg = (
    <svg width={townSize + 5} height={townSize + 5} style={{ transform: `translate(${-baseOffset}px, ${-baseOffset}px)` }}>
      <polygon
        points={points}
        fill={playerColor}
        fillOpacity={fillOpacity}
        stroke={playerColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    </svg >
  );

  const { x, y } = vertexCoordsToPixels(gameTown.coords!);

  const shouldDisplay = premove || highlighted || playerIdx !== -1;
  if (!shouldDisplay) return null;

  return (
    <div className={'Town ' + playerClass + ' ' + highlightedClass}
      key={`t:${gameTown.coords!.hexCoords.x},${gameTown.coords!.hexCoords.y},${gameTown.coords!.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px',
      }}
      onClick={() => onClick(gameTown.coords!)}
    >
      {/* {highlighted && gameTown.eval} */}
      {svg}
    </div>
  );
};
