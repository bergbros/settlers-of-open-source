

export default class ServerAction {
    actionJSON: string;
    playerID: number;
    constructor(actionJSON: string, playerID: number) {
        this.actionJSON = actionJSON;
        this.playerID = playerID;
    }
}
