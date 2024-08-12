import {PlayerConfig} from "../configuration/Config"
import {Execution, MutableGame, MutablePlayer, PlayerID} from "../Game"

export class PlayerExecution implements Execution {

    private player: MutablePlayer

    constructor(private playerID: PlayerID, private playerConfig: PlayerConfig) {
    }

    init(gs: MutableGame, ticks: number) {
        this.player = gs.player(this.playerID)
    }

    tick(ticks: number) {
        this.player.setTroops(this.playerConfig.troopAdditionRate(this.player))
    }

    owner(): MutablePlayer {
        return this.player
    }

    isActive(): boolean {
        return this.player.isAlive()
    }
}