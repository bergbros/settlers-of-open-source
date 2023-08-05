import { GameRoad, EdgeCoords, HexDirection } from 'soos-gamelogic';
import { edgeCoordsToPixels } from '../../utils';
import Variables from '../../scss/variables';
import './Road.scss';

export type RoadProps = {
  gameRoad: GameRoad;
  onClick: (edgeCoords: EdgeCoords) => void;
  premove: boolean;
};

export const Road = (props: RoadProps) => {
  const { gameRoad, onClick } = props;
  const gameRoadCoords = gameRoad.coords;
  const { x, y } = edgeCoordsToPixels(gameRoadCoords);

  const playerIdx = gameRoad.player?.index ?? -1;

  let playerClass = '';
  if (gameRoad.showMe() && gameRoad.player) {
    playerClass = 'p' + playerIdx;
  }

  const playerColor = Variables.PlayerColors[playerIdx];

  const roadCoords = gameRoad.getCoords();
  let rotation = 0, translateX = 0, translateY = 0;
  if (roadCoords.direction === HexDirection.NW || roadCoords.direction === HexDirection.SE) {
    rotation = -33;
    translateX = 2;
    translateY = 10;
  } else if (roadCoords.direction === HexDirection.NE || roadCoords.direction === HexDirection.SW) {
    rotation = 33;
    translateX = 12;
    translateY = 0;
  } else {
    rotation = 90;
    translateX = 5;
    translateY = 10;
  }

  let fillOpacity, strokeDasharray, strokeWidth = 0;
  if (playerIdx === -1 || props.premove) {
    // dotted line
    fillOpacity = '0';
    strokeDasharray = '3 2';
    strokeWidth = 3;
  }

  const svg = (
    <svg
      width={40}
      height={20}
      style={{
        transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
        // point that we rotate around
        transformOrigin: '16px 8px',
      }}
    >
      <rect
        x={4}
        y={4}
        width={26}
        height={10}
        stroke={playerColor}
        strokeWidth={strokeWidth}
        fill={playerColor}
        fillOpacity={fillOpacity}
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );

  return (
    <div
      className='Road'
      key={`r:${gameRoad.coords.hexCoords.x},${gameRoad.coords.hexCoords.y},${gameRoad.coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px',
      }}
      onClick={() => onClick(gameRoadCoords)}
    >
      {svg}
    </div>
  );
};
