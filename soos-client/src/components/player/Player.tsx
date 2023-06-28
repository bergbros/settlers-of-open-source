import './Player.scss';

export type PlayerProps = {
  playerIndex: number,
  playerName: string,
  isMe: boolean,
  totalResources: number,
  victoryPoints: number,
};

export const Player = (props: PlayerProps) => {
  const { playerIndex, playerName, isMe, totalResources, victoryPoints } = props;

  const playerClass = 'p' + playerIndex;

  return (
    <div
      className={'Player ' + playerClass}
      key={playerClass}
    >
      <div className='playerName'>{playerName + (isMe ? ' (me)' : '')}</div>
      <div className='totalResources'>Resources: {totalResources}</div>
      <div className='victoryPoints'>Victory Points: {victoryPoints}</div>
    </div>
  );
};
