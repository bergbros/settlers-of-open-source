import GameTown from 'soos-gamelogic/src/gametown';
import VertexCoords from 'soos-gamelogic/src/utils/vertex-coords';
import { vertexCoordsToPixels } from './utils';

export type TownProps = {
  gameTown: GameTown;
  onClick: (vertexCoords: VertexCoords) => void;
};

export default function Town(props: TownProps) {
  const { gameTown, onClick } = props;
  const { x, y } = vertexCoordsToPixels(gameTown.coords);

  const playerClass = gameTown.isUnclaimed() ? '' : 'p' + gameTown.player?.index;

  return (
    <div className={'Town ' + playerClass}
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
