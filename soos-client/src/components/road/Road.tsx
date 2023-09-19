import { GameRoad, HexDirection } from 'soos-gamelogic';
import { edgeCoordsToPixels } from '../../utils';
import Variables from '../../scss/variables';
import './Road.scss';

export type RoadProps = {
  boardPlayerIdx:number|undefined;
  gameRoad: GameRoad;
  highlighted: boolean;
  makingPremoves: boolean;
  premoveQueued: boolean;
  onClick: () => void;
};

export const Road = (props: RoadProps) => {
  const { boardPlayerIdx, gameRoad, onClick, makingPremoves, premoveQueued, highlighted } = props;
  const coords = gameRoad.coords;
  const { x, y } = edgeCoordsToPixels(coords);
  const playerIdx = gameRoad.playerIdx ?? -1;
  const shouldDisplay = makingPremoves || highlighted || playerIdx !== -1|| premoveQueued;

  // don't display anything at all
  if (!shouldDisplay) {
    return null;
  }

  const pieceColor = Variables.PlayerColors[playerIdx];
  const piecePlayerIdx = gameRoad.playerIdx?? -1;
  let roadColor = pieceColor;
  let roadColorId = piecePlayerIdx.toString();
  if(boardPlayerIdx!==undefined && premoveQueued){
    roadColor=Variables.PlayerColors[boardPlayerIdx];
    roadColorId = boardPlayerIdx.toString();
    //console.log('prepping premove on town for ' + roadColor);
  }

  return (
    <div
      className='Road'
      key={`r:${coords.hexCoords.x},${coords.hexCoords.y},${coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px',
      }}
      onClick={() => {
        console.log('road Clicked');
        onClick();
      }}
    >
      {makeSVG(
        coords.direction,
        roadColor,
        props.makingPremoves || (playerIdx === -1 && props.highlighted),
        premoveQueued,
        roadColorId,
      )}
    </div>
  );
};

function makeSVG(direction: HexDirection, color: string, dotted: boolean, hashed:boolean, hashId:string) {
  let rotation = 0, translateX = 0, translateY = 0;
  if (direction === HexDirection.NW || direction === HexDirection.SE) {
    rotation = -33;
    translateX = 2;
    translateY = 10;
  } else if (direction === HexDirection.NE || direction === HexDirection.SW) {
    rotation = 33;
    translateX = 12;
    translateY = 0;
  } else {
    rotation = 90;
    translateX = 5;
    translateY = 10;
  }

  let fillOpacity, strokeDasharray, strokeWidth = 0;
  if (dotted && !hashed) {
    // dotted line
    fillOpacity = '0';
    strokeDasharray = '3 2';
    strokeWidth = 3;
  }
  const checkerSize = 3;
  const checkersName = 'checkers'+hashId;
  const checkersURL = 'url(#'+checkersName+')';

  return (
    <svg
      width={40}
      height={20}
      style={{
        transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
        // point that we rotate around
        transformOrigin: '16px 8px',
      }}
    >
      <defs>
        <pattern id={checkersName} x={checkerSize} y={checkerSize} width={2*checkerSize} height={2*checkerSize} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={checkerSize} height={checkerSize} style={{ stroke: 'none', fill: color }}/>
          <rect x={checkerSize} y={checkerSize} width={checkerSize} height={checkerSize} style={{ stroke: 'none', fill: color }}/>
        </pattern>
      </defs>
      <rect
        x={4}
        y={4}
        width={26}
        height={10}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={(hashed? checkersURL: color)}
        fillOpacity={fillOpacity}
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );
}
