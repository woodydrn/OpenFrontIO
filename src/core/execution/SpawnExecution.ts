import {Config, PlayerConfig} from "../configuration/Config"
import {Cell, Execution, MutableGame, MutablePlayer, PlayerInfo} from "../Game"
import {BotExecution} from "./BotExecution"
import {PlayerExecution} from "./PlayerExecution"
import {getSpawnCells} from "./Util"

export class SpawnExecution implements Execution {

    active: boolean = true
    private mg: MutableGame

    constructor(
        private playerInfo: PlayerInfo,
        private cell: Cell
    ) { }

    init(mg: MutableGame, ticks: number) {
        this.mg = mg
    }

    tick(ticks: number) {
        if (!this.isActive()) {
            return
        }

        if (ticks >= this.mg.config().turnsUntilGameStart()) {
            this.active = false
            return
        }

        const existing = this.mg.players().find(p => p.info().clientID != null && p.info().clientID == this.playerInfo.clientID)
        if (existing) {
            existing.tiles().forEach(t => existing.relinquish(t))
            getSpawnCells(this.mg, this.cell).forEach(c => {
                existing.conquer(this.mg.tile(c))
            })
            return
        }

        const player = this.mg.addPlayer(this.playerInfo, this.mg.config().player().startTroops(this.playerInfo))
        getSpawnCells(this.mg, this.cell).forEach(c => {
            player.conquer(this.mg.tile(c))
        })
        this.mg.addExecution(new PlayerExecution(player.id()))
        if (player.info().isBot) {
            this.mg.addExecution(new BotExecution(player))
        }
        this.active = false
    }
    owner(): MutablePlayer {
        return null
    }
    isActive(): boolean {
        return this.active
    }

    activeDuringSpawnPhase(): boolean {
        return true
    }

}