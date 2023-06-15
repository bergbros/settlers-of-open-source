import { GameRoad, EdgeCoords, HexDirection } from 'soos-gamelogic';
import { edgeCoordsToPixels, vertexCoordsToPixels } from '../../utils';
import './Road.scss';

export type RoadProps = {
  gameRoad: GameRoad;
  onClick: (edgeCoords: EdgeCoords) => void;
};

export const Road = (props: RoadProps) => {
  const { gameRoad, onClick } = props;
  const { x, y } = edgeCoordsToPixels(gameRoad.coords);

  let playerClass = '';
  if (gameRoad.showMe() && gameRoad.player) {
    playerClass = 'p' + gameRoad.player?.index;
  }

  const roadCoords = gameRoad.getCoords();
  let roadOrientation = "vertical";
  if (roadCoords.direction === HexDirection.NW || roadCoords.direction === HexDirection.SE) {
    roadOrientation = "neSlant"
  } else if (roadCoords.direction === HexDirection.NE || roadCoords.direction === HexDirection.SW) {
    roadOrientation = "nwSlant"
  }

  return (
    <div className={'Road ' + roadOrientation + " " + playerClass}
      key={`r:${gameRoad.coords.hexCoords.x},${gameRoad.coords.hexCoords.y},${gameRoad.coords.direction}`}
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      onClick={() => onClick(gameRoad.getCoords())}
    >

    </div>
  );
}
