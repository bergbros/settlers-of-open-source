import { GamePlayer, ResourceType, resourceToString, AllResourceTypes } from 'soos-gamelogic';

export type PlayerProps = {
  player: GamePlayer
};

export default function Player(props: PlayerProps) {
  const { player } = props;
  //const { x, y } = vertexCoordsToPixels(gameTown.coords);

  const playerClass = 'p' + player.index;
  const hand: string[] = [];
  for (let i = 0; i < AllResourceTypes.length; i++) {
    const resourceType = AllResourceTypes[i];
    hand.push(resourceToString(resourceType) + ': ' + player.cards[resourceType] + '\n');
  }

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
}
