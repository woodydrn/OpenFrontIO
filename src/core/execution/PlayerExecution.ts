import {Execution, MutableGame, MutablePlayer, PlayerID} from "../Game"

export class PlayerExecution implements Execution {

    private player: MutablePlayer

    constructor(private playerID: PlayerID) {
    }

    init(gs: MutableGame, ticks: number) {
        this.player = gs.player(this.playerID)
    }

    tick(ticks: number) {
        let toAdd = Math.sqrt(this.player.numTilesOwned() * this.player.troops()) / 5

        const max = Math.sqrt(this.player.numTilesOwned()) * 100 + 1000
        const ratio = 1 - this.player.troops() / max
        toAdd *= ratio * ratio * ratio
        this.player.addTroops(
            Math.max(2, toAdd)
        );
        this.player.setTroops(Math.min(this.player.troops(), max))
    }

    owner(): MutablePlayer {
        return this.player
    }

    isActive(): boolean {
        return this.player.isAlive()
    }
}