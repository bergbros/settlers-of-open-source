import { Game, HexCoords } from 'soos-gamelogic';
import RobberImg from "/Robber.png";
import { hexCoordsToPixels, HexHeight, HexWidth } from './utils';



export type RobberProps = {
    game: Game;
};

export default function Robber(props: RobberProps) {
    const { game } = props;
    let { x, y } = hexCoordsToPixels(game.robberLocation);
    x += HexWidth * 0.6;
    y += HexHeight * 0.2;
    return (
        <img
            className="RobberImage"
            src={RobberImg}
            onClick={() => console.log("robber is at " + game.robberLocation)}
            style={{
                left: x + 'px',
                top: y + 'px'
            }}
        ></img>
    );
}