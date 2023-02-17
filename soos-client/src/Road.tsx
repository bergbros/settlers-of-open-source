import { GameRoad } from 'soos-gamelogic';
import EdgeCoords from 'soos-gamelogic/src/utils/edge-coords';
import { HexDirection } from 'soos-gamelogic/src/utils/hex-coords';
import { edgeCoordsToPixels, vertexCoordsToPixels } from './utils';

export type RoadProps = {
  gameRoad: GameRoad;
  onClick: (edgeCoords: EdgeCoords) => void;
};

export default function Road(props: RoadProps) {
  const { gameRoad, onClick } = props;
  const { x, y } = edgeCoordsToPixels(gameRoad.coords);

  const playerClass = gameRoad.isUnclaimed() ? '' : 'p' + gameRoad.player?.index;

  const roadCoords = gameRoad.getCoords();
  let roadOrientation = "vertical";
  if(roadCoords.direction === HexDirection.NW || roadCoords.direction === HexDirection.SE){
    roadOrientation = "neSlant"
  } else if(roadCoords.direction === HexDirection.NE || roadCoords.direction === HexDirection.SW){
    roadOrientation = "nwSlant"
  }

  return (
    <div className={'Road ' + roadOrientation + playerClass}
      key={`t:${gameRoad.coords.hexCoords.x},${gameRoad.coords.hexCoords.y},${gameRoad.coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      onClick={() => onClick(gameRoad.getCoords())}
    >

    </div>
  );
}
