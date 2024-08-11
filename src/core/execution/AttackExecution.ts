import PriorityQueue from "priority-queue-typescript";
import {Cell, Execution, MutableGame, MutablePlayer, PlayerID, Player, TerrainTypes, TerraNullius, Tile} from "../Game";
import {PseudoRandom} from "../PseudoRandom";
import {manhattanDist} from "../Util";

export class AttackExecution implements Execution {
    private active: boolean = true;
    private toConquer: PriorityQueue<TileContainer> = new PriorityQueue<TileContainer>(1000, (a: TileContainer, b: TileContainer) => a.priority - b.priority);
    private random = new PseudoRandom(123)

    private _owner: MutablePlayer
    private target: MutablePlayer | TerraNullius

    private mg: MutableGame

    constructor(
        private troops: number,
        private _ownerID: PlayerID,
        private targetID: PlayerID | null,
        private targetCell: Cell | null
    ) { }

    init(gs: MutableGame, ticks: number) {
        this._owner = gs.player(this._ownerID)
        this.target = this.targetID == null ? gs.terraNullius() : gs.player(this.targetID)
        this.troops = Math.min(this._owner.troops(), this.troops)
        this._owner.setTroops(this._owner.troops() - this.troops)
        this.mg = gs
    }

    tick(ticks: number) {
        if (!this.active) {
            return
        }
        // const t = this.mg.tile(new Cell(0, 0))
        // this.toConquer.add(new TileContainer(t, 4))
        // this.toConquer.add(new TileContainer(t, 1))
        // this.toConquer.add(new TileContainer(t, 2))
        // this.toConquer.add(new TileContainer(t, 3))

        // while (this.toConquer.size() > 0) {
        //     console.log(`!!! got ${this.toConquer.poll().priority}`)
        // }


        let numTilesPerTick = this._owner.borderTiles().size / 2
        while (numTilesPerTick > 0) {
            if (this.troops < 1) {
                this.active = false
                return
            }

            if (this.toConquer.size() < 5) {
                this.calculateToConquer()
            }
            if (this.toConquer.size() == 0) {
                this.active = false
                this._owner.addTroops(this.troops)
                return
            }

            const toConquerContainer = this.toConquer.poll()
            const tileToConquer: Tile = toConquerContainer.tile
            const onBorder = tileToConquer.neighbors().filter(t => t.owner() == this._owner).length > 0
            if (tileToConquer.owner() != this.target || !onBorder) {
                continue
            }
            this._owner.conquer(tileToConquer.cell())
            this.troops -= 1
            numTilesPerTick -= 1
        }
    }

    private calculateToConquer() {
        // console.profile('calc_to_conquer')



        // let closestTile: Tile;
        // let closestDist: number = Number.POSITIVE_INFINITY;
        // for (const enemyTile of enemyBorder) {
        //     const dist = manhattanDist(enemyTile.cell(), this.targetCell)
        //     if (dist < closestDist) {
        //         closestTile = enemyTile
        //     }
        // }

        // tileByDist.forEach(t => console.log(`tile dist: ${manhattanDist(t.cell(), closestTile.cell())}`))
        // let tileByDist = []
        // if (this.targetCell == null) {
        //     tileByDist = Array.from(enemyBorder).slice().sort((a, b) => this.random.next() - .5)
        // } else {
        // }
        // for (let i = 0; i < Math.min(enemyBorder.size / 2, tileByDist.length); i++) {
        //     const enemyTile = tileByDist[i]
        //     const numOwnedByMe = enemyTile.neighbors()
        //         .filter(t => t.terrain() == TerrainTypes.Land)
        //         .filter(t => t.owner() == this._owner)
        //         .length
        //     // this.toConquer.add(new TileContainer(enemyTile, numOwnedByMe + (this.random.next() % 5) + (-5 * i / tileByDist.length)))
        //     const r = this.random.next() % 4
        //     this.toConquer.add(new TileContainer(enemyTile, r + numOwnedByMe * 1000))
        // }
        this.toConquer.clear()


        // if (this.targetCell != null) {
        //     let tiles = Array.from(enemyBorder)
        //     tiles = tiles.slice().sort((a, b) => manhattanDist(a.cell(), this.targetCell) - manhattanDist(b.cell(), this.targetCell))
        //     for (let i = 0; i < tiles.length; i++) {
        //         const numOwnedByMe = tiles[i].neighbors()
        //             .filter(t => t.terrain() == TerrainTypes.Land)
        //             .filter(t => t.owner() == this._owner)
        //             .length

        //         let distModifer = 0
        //         if (this.targetCell != null) {
        //             distModifer = i / tiles.length * 2
        //         }
        //         this.toConquer.add(new TileContainer(tiles[i], distModifer - numOwnedByMe + this.random.nextInt(0, 2)))
        //         // this.toConquer.add(new TileContainer(tiles[i], i))
        //     }
        // } else {
        for (const tile of this._owner.borderTiles()) {
            for (const neighbor of tile.neighbors()) {
                if (neighbor.terrain() == TerrainTypes.Water || neighbor.owner() != this.target) {
                    continue
                }
                // const numOwnedByMe = tile.neighbors()
                //     .filter(t => t.terrain() == TerrainTypes.Land)
                //     .filter(t => t.owner() == this._owner)
                //     .length
                this.toConquer.add(new TileContainer(neighbor, 1))
            }
        }
        // }

        // console.profileEnd('calc_to_conquer')


    }

    owner(): MutablePlayer {
        return this._owner
    }

    isActive(): boolean {
        return this.active
    }

}


class TileContainer {
    constructor(public readonly tile: Tile, public readonly priority: number) { }
}