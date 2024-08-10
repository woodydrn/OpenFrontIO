import {Cell, Execution, MutableGame, MutablePlayer, PlayerID, PlayerInfo} from "../Game"
import {PseudoRandom} from "../PseudoRandom"
import {AttackExecution} from "./AttackExecution";

export class BotExecution implements Execution {

    private active = true
    private random: PseudoRandom;
    private attackRate: number
    private gs: MutableGame

    constructor(private bot: MutablePlayer) {

        this.random = new PseudoRandom(bot.id())
        this.attackRate = this.random.nextInt(50, 200)
    }

    init(gs: MutableGame, ticks: number) {
        this.gs = gs
    }

    tick(ticks: number) {
        if (!this.bot.isAlive()) {
            this.active = false
            return
        }


        if (ticks % this.attackRate == 0) {
            const ns = this.bot.neighbors()
            if (ns.length == 0) {
                return
            }

            const toAttack = ns[this.random.nextInt(0, ns.length)]

            this.gs.addExecution(new AttackExecution(
                this.bot.troops() / 15,
                this.bot.id(),
                toAttack.isPlayer() ? toAttack.id() : null,
                null
            ))
        }
    }

    owner(): MutablePlayer {
        return this.bot
    }

    isActive(): boolean {
        return this.active
    }
}