import {Config, PlayerConfig} from "../configuration/Config"
import {Execution, MutableGame, MutablePlayer, PlayerID} from "../Game"

export class PlayerExecution implements Execution {

    private player: MutablePlayer

    constructor(private playerID: PlayerID, private config: Config) {
    }

    init(gs: MutableGame, ticks: number) {
        this.player = gs.player(this.playerID)
    }

    tick(ticks: number) {
        if (ticks < this.config.turnsUntilGameStart()) {
            return
        }
        this.player.setTroops(this.config.player().troopAdditionRate(this.player))
    }

    owner(): MutablePlayer {
        return this.player
    }

    isActive(): boolean {
        return this.player.isAlive()
    }
}