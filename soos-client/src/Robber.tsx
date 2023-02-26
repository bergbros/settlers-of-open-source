import { HexCoords } from 'soos-gamelogic';
import RobberImg from "/RobberImg.png";
import { hexCoordsToPixels, HexHeight, HexWidth } from './utils';



export type RobberProps = {
    location: HexCoords;
};
  
export default function Robber(props: RobberProps) {
    const { location } = props;
    let { x, y } = hexCoordsToPixels(location);
    x+=HexWidth*0.6;
    y+=HexHeight*0.2;
    return(
        <img 
        className = "RobberImage" 
        src={RobberImg}
        style={{
            left: x + 'px',
            top: y + 'px'
          }}
        ></img>
    ) ;
}