import {Cell, Execution, MutableGame, MutablePlayer, Player, PlayerID, PlayerInfo, TerraNullius, Tile} from "../Game"
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


    constructor(private playerInfo: PlayerInfo) {
        this.random = new PseudoRandom(simpleHash(playerInfo.id))
        this.attackRate = this.random.nextInt(10, 50)
    }

    init(mg: MutableGame, ticks: number) {
        this.mg = mg
    }

    tick(ticks: number) {

        if (this.mg.inSpawnPhase()) {
            if (ticks % 10 == 0) {
                this.mg.addExecution(new SpawnExecution(
                    this.playerInfo,
                    this.randomLand().cell()
                ))
            }
        }

        if (ticks % this.attackRate != 0) {
            return
        }

        // if (this.neighborsTerraNullius) {
        //     for (const b of this.bot.borderTiles()) {
        //         for (const n of b.neighbors()) {
        //             if (n.owner() == this.mg.terraNullius() && n.isLand()) {
        //                 this.sendAttack(this.mg.terraNullius())
        //                 return
        //             }
        //         }
        //     }
        //     this.neighborsTerraNullius = false
        // }

        // const border = Array.from(this.bot.borderTiles()).flatMap(t => t.neighbors()).filter(t => t.hasOwner() && t.owner() != this.bot)

        // if (border.length == 0) {
        //     return
        // }

        // const toAttack = border[this.random.nextInt(0, border.length)]
        // this.sendAttack(toAttack.owner())
    }

    randomLand(): Tile {
        while (true) {
            const cell = new Cell(this.random.nextInt(0, this.mg.width()), this.random.nextInt(0, this.mg.height()))
            const tile = this.mg.tile(cell)
            if (tile.isLand()) {
                return tile
            }
        }
    }

    // sendAttack(toAttack: Player | TerraNullius) {
    //     this.mg.addExecution(new AttackExecution(
    //         this.bot.troops() / 20,
    //         this.bot.id(),
    //         toAttack.isPlayer() ? toAttack.id() : null,
    //         null,
    //         null
    //     ))
    // }

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