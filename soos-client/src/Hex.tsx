import { MouseEventHandler } from 'react';
import { HexCoords, MapHex, ResourceType, TerrainType } from 'soos-gamelogic';
import { hexCoordsToPixels } from './utils';

function getTerrainClass(terrainType: TerrainType, resourceType?: ResourceType): string {
    if(terrainType !== TerrainType.Land) return '';
    let terrainClass = '';
    switch(resourceType){
        case ResourceType.Brick: terrainClass = 'brick'; break;
        case ResourceType.Grain: terrainClass = 'grain'; break;
        case ResourceType.Ore: terrainClass = 'ore';   break;
        case ResourceType.Sheep: terrainClass = 'sheep'; break;
        case ResourceType.Wood: terrainClass = 'wood';  break;
        case ResourceType.None: terrainClass = 'desert';break;
        default: terrainClass = ''; break;
      }
    
    return terrainClass;
}

export type HexProps = {
    mapHex: MapHex;
    onClick: (hexCoords: HexCoords) => void;
}

export default function Hex(props: HexProps) {
    const { mapHex, onClick } = props;

    const terrainClass = getTerrainClass(mapHex.terrainType, mapHex.resourceType);

    const { x, y } = hexCoordsToPixels(mapHex.coords);

    const tileNumber = mapHex.frequency
        ? (<div className="tileNumber">{mapHex.frequency}</div>)
        : null;
    
    //console.log(`adding hex at: ${mapHex.coords.x},${mapHex.coords.y}`)
    return (
        <div
            key={`h:${mapHex.coords.x},${mapHex.coords.y}`}
            className={`Hex ${terrainClass}`} 
            style={{
                left: x + 'px',
                top: y + 'px',
            }}
            onClick={() => onClick(mapHex.coords)}
        >
            {tileNumber}
        </div>
    )
}
