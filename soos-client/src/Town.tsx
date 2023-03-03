import GameTown from 'soos-gamelogic/src/gametown';
import VertexCoords from 'soos-gamelogic/src/utils/vertex-coords';
import { vertexCoordsToPixels } from './utils';

export type TownProps = {
  gameTown: GameTown;
  onClick: (vertexCoords: VertexCoords) => void;
};

export default function Town(props: TownProps) {
  const { gameTown, onClick } = props;

  const playerClass = gameTown.isUnclaimed() ? '' : 'p' + gameTown.player?.index;
  let highlighted = ''
  if (gameTown.highlighted) {
    console.log("highlighting");
    highlighted = 'highlight';
  }
  let townLevel = '';
  let townRadius = 10;
  switch (gameTown.townLevel) {
    case 1:
      townLevel = ' settlement';
      townRadius = 10;
      break;
    case 2:
      townLevel = ' city';
      townRadius = 12;
      break;
    case 3:
      townLevel = ' suburb';
      townRadius = 14;
      break;
  }

  const { x, y } = vertexCoordsToPixels(gameTown.coords);

  return (
    <div className={'Town' + townLevel + ' ' + playerClass + ' ' + highlighted}
      key={`t:${gameTown.coords.hexCoords.x},${gameTown.coords.hexCoords.y},${gameTown.coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      onClick={() => onClick(gameTown.coords)}
    >

    </div>
  );
}
