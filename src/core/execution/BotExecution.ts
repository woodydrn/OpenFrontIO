import {Config, PlayerConfig} from "../configuration/Config";
import {Cell, Execution, MutableGame, MutablePlayer, Player, PlayerID, PlayerInfo, TerrainTypes, TerraNullius} from "../Game"
import {PseudoRandom} from "../PseudoRandom"
import {AttackExecution} from "./AttackExecution";

export class BotExecution implements Execution {

    private active = true
    private random: PseudoRandom;
    private attackRate: number
    private gs: MutableGame
    private neighborsTerra = true


    constructor(private bot: MutablePlayer, private config: Config) {

        this.random = new PseudoRandom(bot.id())
        this.attackRate = this.random.nextInt(10, 50)
    }

    init(gs: MutableGame, ticks: number) {
        this.gs = gs
        // this.neighborsTerra = this.bot.neighbors().filter(n => n == this.gs.terraNullius()).length > 0
    }

    tick(ticks: number) {

        if (ticks < this.config.turnsUntilGameStart()) {
            return
        }

        if (!this.bot.isAlive()) {
            this.active = false
            return
        }

        if (ticks % this.attackRate == 0) {
            if (this.neighborsTerra) {
                for (const b of this.bot.borderTiles()) {
                    for (const n of b.neighbors()) {
                        if (n.owner() == this.gs.terraNullius() && n.terrain() == TerrainTypes.Land) {
                            this.sendAttack(this.gs.terraNullius())
                            return
                        }
                    }
                }
                this.neighborsTerra = false
            }

            const ns = this.bot.neighbors()
            if (ns.length == 0) {
                return
            }
            const toAttack = ns[this.random.nextInt(0, ns.length)]
            this.sendAttack(toAttack)
        }
    }

    sendAttack(toAttack: Player | TerraNullius) {
        this.gs.addExecution(new AttackExecution(
            this.bot.troops() / 20,
            this.bot.id(),
            toAttack.isPlayer() ? toAttack.id() : null,
            null,
            this.config
        ))
    }

    owner(): MutablePlayer {
        return this.bot
    }

    isActive(): boolean {
        return this.active
    }
}