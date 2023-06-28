import { Game } from 'soos-gamelogic';
import RobberImg from '/Robber.png';
import { hexCoordsToPixels, HexHeight, HexWidth } from '../../utils';
import './Robber.scss';

export type RobberProps = {
  game: Game;
};

export const Robber = (props: RobberProps) => {
  const { game } = props;
  let { x, y } = hexCoordsToPixels(game.robberLocation);
  x += HexWidth * 0.7;
  y += HexHeight * 0.3;
  return (
    <img
      className="RobberImage"
      src={RobberImg}
      onClick={() => console.log('robber is at', game.robberLocation)}
      style={{
        transform: `translate(${x}px,${y}px)`
      }}
    ></img>
  );
};
