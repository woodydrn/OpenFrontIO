import {Config, PlayerConfig} from "../configuration/Config";
import {Cell, Execution, MutableGame, MutablePlayer, Player, PlayerID, PlayerInfo, TerraNullius} from "../Game"
import {PseudoRandom} from "../PseudoRandom"
import {simpleHash} from "../Util";
import {AttackExecution} from "./AttackExecution";

export class BotExecution implements Execution {

    private active = true
    private random: PseudoRandom;
    private attackRate: number
    private mg: MutableGame
    private neighborsTerra = true


    constructor(private bot: MutablePlayer) {
        this.random = new PseudoRandom(simpleHash(bot.id()))
        this.attackRate = this.random.nextInt(10, 50)
    }
    activeDuringSpawnPhase(): boolean {
        return false
    }

    init(mg: MutableGame, ticks: number) {
        this.mg = mg
        // this.neighborsTerra = this.bot.neighbors().filter(n => n == this.gs.terraNullius()).length > 0
    }

    tick(ticks: number) {

        if (ticks < this.mg.config().turnsUntilGameStart()) {
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
                        if (n.owner() == this.mg.terraNullius() && n.isLand()) {
                            this.sendAttack(this.mg.terraNullius())
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
        this.mg.addExecution(new AttackExecution(
            this.bot.troops() / 20,
            this.bot.id(),
            toAttack.isPlayer() ? toAttack.id() : null,
            null
        ))
    }

    owner(): MutablePlayer {
        return this.bot
    }

    isActive(): boolean {
        return this.active
    }
}