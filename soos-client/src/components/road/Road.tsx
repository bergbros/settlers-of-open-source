import { GameRoad, HexDirection } from 'soos-gamelogic';
import { edgeCoordsToPixels } from '../../utils';
import Variables from '../../scss/variables';
import './Road.scss';

export type RoadProps = {
  gameRoad: GameRoad;
  highlighted: boolean;
  premove: boolean;
  onClick: () => void;
};

export const Road = (props: RoadProps) => {
  const { gameRoad, onClick, premove, highlighted } = props;
  const coords = gameRoad.coords;
  const { x, y } = edgeCoordsToPixels(coords);
  const playerIdx = gameRoad.playerIdx ?? -1;
  const shouldDisplay = premove || highlighted || playerIdx !== -1;

  // don't display anything at all
  if (!shouldDisplay) {
    return null;
  }

  return (
    <div
      className='Road'
      key={`r:${coords.hexCoords.x},${coords.hexCoords.y},${coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px',
      }}
      onClick={() => onClick()}
    >
      {makeSVG(
        coords.direction,
        Variables.PlayerColors[playerIdx],
        props.premove || (playerIdx === -1 && props.highlighted),
      )}
    </div>
  );
};

function makeSVG(direction: HexDirection, color: string, dotted: boolean) {
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
  if (dotted) {
    // dotted line
    fillOpacity = '0';
    strokeDasharray = '3 2';
    strokeWidth = 3;
  }

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
      <rect
        x={4}
        y={4}
        width={26}
        height={10}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={color}
        fillOpacity={fillOpacity}
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );
}
