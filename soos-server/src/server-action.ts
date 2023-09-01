

export default class ServerAction {
  actionJSON: string;
  playerId: number;
  constructor(actionJSON: string, playerId: number) {
    this.actionJSON = actionJSON;
    this.playerId = playerId;
  }
}
