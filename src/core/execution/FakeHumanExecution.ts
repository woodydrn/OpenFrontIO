import {Cell, Execution, MutableGame, MutablePlayer, Player, PlayerID, PlayerInfo, TerraNullius} from "../Game"
import {PseudoRandom} from "../PseudoRandom"
import {simpleHash} from "../Util";
import {AttackExecution} from "./AttackExecution";
import {SpawnExecution} from "./SpawnExecution";

export class FakeHumanExecution implements Execution {

    private active = true
    private random: PseudoRandom;
    private attackRate: number
    private mg: MutableGame
    private neighborsTerraNullius = true


    constructor(private bot: MutablePlayer) {
        this.random = new PseudoRandom(simpleHash(bot.id()))
        this.attackRate = this.random.nextInt(10, 50)
    }
    activeDuringSpawnPhase(): boolean {
        return true
    }

    init(mg: MutableGame, ticks: number) {
        this.mg = mg
    }

    tick(ticks: number) {

        if (ticks < this.mg.config().numSpawnPhaseTurns()) {
            if(ticks % 10 == 0) {
                this.mg.addExecution(new SpawnExecution(
                    null, null
                ))
            }
        }

        if (!this.bot.isAlive()) {
            this.active = false
            return
        }

        if (ticks % this.attackRate != 0) {
            return
        }

        if (this.neighborsTerraNullius) {
            for (const b of this.bot.borderTiles()) {
                for (const n of b.neighbors()) {
                    if (n.owner() == this.mg.terraNullius() && n.isLand()) {
                        this.sendAttack(this.mg.terraNullius())
                        return
                    }
                }
            }
            this.neighborsTerraNullius = false
        }

        const border = Array.from(this.bot.borderTiles()).flatMap(t => t.neighbors()).filter(t => t.hasOwner() && t.owner() != this.bot)

        if (border.length == 0) {
            return
        }

        const toAttack = border[this.random.nextInt(0, border.length)]
        this.sendAttack(toAttack.owner())
    }

    sendAttack(toAttack: Player | TerraNullius) {
        this.mg.addExecution(new AttackExecution(
            this.bot.troops() / 20,
            this.bot.id(),
            toAttack.isPlayer() ? toAttack.id() : null,
            null,
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