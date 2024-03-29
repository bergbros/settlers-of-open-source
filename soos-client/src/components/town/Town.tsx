import { vertexCoordsToPixels } from '../../utils';
import { GameTown, VertexCoords } from 'soos-gamelogic';
import Variables from '../../scss/variables';
import './Town.scss';

export type TownProps = {
  boardPlayerIdx:number|undefined;
  gameTown: GameTown;
  highlighted: boolean;
  makingPremove: boolean;
  premoveQueued:boolean;
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
const settlementPolygonPoints = townPoints(settlementSize, [[ 0, 1 ], [ 0, .4 ], [ .5, 0 ], [ 1, .4 ], [ 1, 1 ]]);

const citySize = 24;
const cityPolygonPoints = townPoints(citySize, [[ 0, .25 ], [ 0, 1 ], [ 1, 1 ], [ 1, .5 ], [ .5, .5 ], [ .5, .25 ], [ .25, 0 ]]);

const suburbSize = 28;
// same as city for now
const suburbPolygonPoints = townPoints(suburbSize, [[ 0, .25 ], [ 0, 1 ], [ 1, 1 ], [ 1, .5 ], [ .5, .5 ], [ .5, .25 ], [ .25, 0 ]]);

export const Town = (props: TownProps) => {
  const { boardPlayerIdx, gameTown, onClick, makingPremove, highlighted, premoveQueued } = props;

  const piecePlayerIdx = gameTown.playerIdx ?? -1;
  const pieceColor = Variables.PlayerColors[piecePlayerIdx];
  const pieceClass = gameTown.isUnclaimed() && !premoveQueued ? 'unclaimed' : '';
  let highlightedClass = '';
  if (highlighted) {
    highlightedClass = 'highlight';
  }
  // let townLevel = '';
  let townSize = 10, points:string = '';

  let svg = null;
  let activePlayersTown = false;
  if (piecePlayerIdx===boardPlayerIdx){
    activePlayersTown = true;
  }
  let levelUpTown = 0;
  if (makingPremove && activePlayersTown){
    levelUpTown = 1;
  }

  switch (gameTown.townLevel + levelUpTown) {
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

  let townColor = pieceColor;
  let townColorId = piecePlayerIdx.toString();
  if(boardPlayerIdx!==undefined && premoveQueued){
    townColor=Variables.PlayerColors[boardPlayerIdx];
    townColorId = boardPlayerIdx.toString();
    console.log('prepping premove on town for ' + townColor);
  }

  svg = makeTownSVG(townSize, points, townColor,
    highlighted || (makingPremove && activePlayersTown), premoveQueued, townColorId);

  const { x, y } = vertexCoordsToPixels(gameTown.coords!);

  const shouldDisplay = highlighted || piecePlayerIdx !== -1 || premoveQueued;
  if (!shouldDisplay) {
    return null;
  }
  highlightedClass= '';
  return (
    <div className={'Town ' + pieceClass + ' ' + highlightedClass}
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

function makeTownSVG(townSize:number, points:string,  townColor:string, dotted:boolean,
  hashed:boolean, hashId:string ){

  let fillOpacity, strokeDasharray, strokeWidth = 0;
  if (dotted && !hashed) {
    // dotted line
    fillOpacity = '0';
    strokeDasharray = '3 2';
    strokeWidth = 3;
  }
  const checkersName = 'checkers'+hashId;
  const checkersURL = 'url(#'+checkersName+')';
  const checkerSize = 3;
  return (
    <svg
      width={townSize + 5}
      height={townSize + 5}
      style={{ transform: `translate(${-baseOffset}px, ${-baseOffset}px)` }}>
      <defs>
        <pattern id={checkersName} x={checkerSize} y={checkerSize} width={2*checkerSize} height={2*checkerSize} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={checkerSize} height={checkerSize} style={{ stroke: 'none', fill: townColor }}/>
          <rect x={checkerSize} y={checkerSize} width={checkerSize} height={checkerSize} style={{ stroke: 'none', fill: townColor }}/>
        </pattern>
      </defs>
      <polygon
        points={points}
        fill= {(hashed? checkersURL:townColor)}
        fillOpacity={fillOpacity}
        stroke={townColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />

    </svg >);

}
