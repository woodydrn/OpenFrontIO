import {PlayerConfig} from "../configuration/Config"
import {Cell, Execution, MutableGame, MutablePlayer, PlayerInfo} from "../Game"
import {BotExecution} from "./BotExecution"
import {PlayerExecution} from "./PlayerExecution"
import {getSpawnCells} from "./Util"

export class SpawnExecution implements Execution {

    active: boolean = true
    private gs: MutableGame

    constructor(
        private playerInfo: PlayerInfo,
        private cell: Cell,
        private playerConfig: PlayerConfig
    ) { }


    init(gs: MutableGame, ticks: number) {
        this.gs = gs
    }

    tick(ticks: number) {
        if (!this.isActive()) {
            return
        }
        const player = this.gs.addPlayer(this.playerInfo, this.playerConfig.startTroops(this.playerInfo))
        getSpawnCells(this.gs, this.cell).forEach(c => {
            player.conquer(this.gs.tile(c))
        })
        this.gs.addExecution(new PlayerExecution(player.id(), this.playerConfig))
        if (player.info().isBot) {
            this.gs.addExecution(new BotExecution(player))
        }
        this.active = false
    }
    owner(): MutablePlayer {
        return null
    }
    isActive(): boolean {
        return this.active
    }
}