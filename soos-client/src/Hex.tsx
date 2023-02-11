import { MouseEventHandler } from 'react';
import { HexCoords, MapHex, ResourceType, TerrainType } from 'soos-gamelogic';
import { hexCoordsToPixels } from './utils';

function getTerrainClass(terrainType: TerrainType, resourceType?: ResourceType): string {
    return '';
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

    return (
        <div
            className={`Hex ${terrainClass}`} style={{
                left: x + 'px',
                top: y + 'px',
            }}
            key={`h:${x},${y}`}
            onClick={() => onClick(mapHex.coords)}
        >
            {tileNumber}
        </div>
    )
}
