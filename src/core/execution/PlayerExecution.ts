import {Config, PlayerConfig} from "../configuration/Config"
import {Execution, MutableGame, MutablePlayer, PlayerID} from "../Game"

export class PlayerExecution implements Execution {

    private player: MutablePlayer
    private config: Config

    constructor(private playerID: PlayerID) {
    }

    activeDuringSpawnPhase(): boolean {
        return false
    }

    init(mg: MutableGame, ticks: number) {
        this.config = mg.config()
        this.player = mg.player(this.playerID)
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