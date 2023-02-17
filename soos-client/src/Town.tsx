import MapTown from 'soos-gamelogic/src/map-town';
import VertexCoords from 'soos-gamelogic/src/utils/vertex-coords';
import { vertexCoordsToPixels } from './utils';

export type TownProps = {
  mapTown: MapTown;
  onClick: (vertexCoords: VertexCoords) => void;
};

export default function Town(props: TownProps) {
  const { mapTown, onClick } = props;
  const { x, y } = vertexCoordsToPixels(mapTown.coords);

  const playerClass = mapTown.isUnclaimed() ? '' : 'p' + mapTown.player?.index;

  return (
    <div className={'Town ' + playerClass}
      key={`t:${mapTown.coords.hexCoords.x},${mapTown.coords.hexCoords.y},${mapTown.coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      onClick={() => onClick(mapTown.coords)}
    >

    </div>
  );
}
