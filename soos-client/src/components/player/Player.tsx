import { GamePlayer, resourceToString, AllResourceTypes } from 'soos-gamelogic';
import './Player.scss';

export type PlayerProps = {
  player: GamePlayer,
  details: boolean
};

export const Player = (props: PlayerProps) => {
  const { player, details } = props;
  //const { x, y } = vertexCoordsToPixels(gameTown.coords);

  const playerClass = 'p' + player.index;
  const hand: string[] = [];
  let totalResources = 0;
  for (let i = 0; i < AllResourceTypes.length; i++) {
    const resourceType = AllResourceTypes[i];
    totalResources += player.cards[resourceType];
    if (details) {
      hand.push(resourceToString(resourceType) + ': ' + player.cards[resourceType] + '\n');
    }
  }
  hand.push('Total Resources: ' + totalResources);

  return (
    <div className="PlayerList">
      <div className={'Player ' + playerClass}
        key={playerClass}
      >
        {player.name}
        <div className={'Player'}>
          {hand}
        </div>
      </div>
    </div>
  );
};
