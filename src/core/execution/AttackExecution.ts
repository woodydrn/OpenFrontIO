import {PriorityQueue} from "@datastructures-js/priority-queue";
import {Cell, Execution, MutableGame, MutablePlayer, PlayerID, TerraNullius, Tile} from "../Game";
import {PseudoRandom} from "../PseudoRandom";
import {manhattanDist} from "../Util";

export class AttackExecution implements Execution {
    private active: boolean = true;
    private toConquer: PriorityQueue<TileContainer> = new PriorityQueue<TileContainer>((a: TileContainer, b: TileContainer) => a.priority - b.priority);
    private random = new PseudoRandom(123)

    private _owner: MutablePlayer
    private target: MutablePlayer | TerraNullius

    private mg: MutableGame

    private numTilesWithEnemy = 0
    private borderTiles: Set<Tile> = new Set()

    constructor(
        private troops: number,
        private _ownerID: PlayerID,
        private targetID: PlayerID | null,
        private targetCell: Cell | null,
    ) { }

    activeDuringSpawnPhase(): boolean {
        return false
    }

    init(mg: MutableGame, ticks: number) {
        if (!this.active) {
            return
        }


        // TODO: remove this and fix directed expansion.
        this.targetCell = null

        this._owner = mg.player(this._ownerID)
        this.target = this.targetID == null ? mg.terraNullius() : mg.player(this.targetID)
        this.troops = Math.min(this._owner.troops(), this.troops)
        this._owner.setTroops(this._owner.troops() - this.troops)
        this.mg = mg

        for (const exec of mg.executions()) {
            if (exec.isActive() && exec instanceof AttackExecution && exec != this) {
                const otherAttack = exec as AttackExecution
                // Target has opposing attack, cancel them out
                if (this.target.isPlayer() && otherAttack.targetID == this._ownerID && this.targetID == otherAttack._ownerID) {
                    if (otherAttack.troops > this.troops) {
                        otherAttack.troops -= this.troops
                        // otherAttack.calculateToConquer()
                        this.active = false
                        return
                    } else {
                        this.troops -= otherAttack.troops
                        otherAttack.active = false
                    }
                }
                // Existing attack on same target, add troops
                if (otherAttack._owner == this._owner && otherAttack.targetID == this.targetID) {
                    otherAttack.troops += this.troops
                    otherAttack.calculateToConquer()
                    this.active = false
                    return
                }
            }
        }

        this.calculateToConquer()
    }

    tick(ticks: number) {
        if (!this.active) {
            return
        }
        if (ticks < this.mg.config().numSpawnPhaseTurns()) {
            return
        }

        let numTilesPerTick = this.mg.config().attackTilesPerTick(this._owner, this.target, this.numTilesWithEnemy)
        if (this.targetCell != null) {
            numTilesPerTick /= 2
        }
        let badTiles = 0
        while (numTilesPerTick > 0) {
            if (this.troops < 1) {
                this.active = false
                return
            }

            if (this.toConquer.size() < this.numTilesWithEnemy / 2) {
                this.calculateToConquer()
            }
            if (badTiles > 1000) {
                console.log('bad tiles')
                this.borderTiles.clear()
                this.calculateToConquer()
                badTiles = 0
                continue
            }
            if (this.toConquer.size() == 0) {
                badTiles = 0
                this.active = false
                this._owner.addTroops(this.troops)
                return
            }

            const toConquerContainer = this.toConquer.dequeue()
            const tileToConquer: Tile = toConquerContainer.tile
            const onBorder = tileToConquer.neighbors().filter(t => t.owner() == this._owner).length > 0
            if (tileToConquer.owner() != this.target || !onBorder) {
                badTiles++
                continue
            }
            const {attackerTroopLoss, defenderTroopLoss, tilesPerTickUsed} = this.mg.config().attackLogic(this._owner, this.target, tileToConquer)
            numTilesPerTick -= tilesPerTickUsed
            this.troops -= attackerTroopLoss
            if (this.target.isPlayer()) {
                this.target.removeTroops(defenderTroopLoss)
            }
            this._owner.conquer(tileToConquer)
            if (this.target.isPlayer() && this.target.numTilesOwned() < 100) {
                for (let i = 0; i < 10; i++) {
                    for (const tile of this.target.tiles()) {
                        if (tile.borders(this._owner)) {
                            this._owner.conquer(tile)
                        } else {
                            for (const neighbor of tile.neighbors()) {
                                const no = neighbor.owner()
                                if (no.isPlayer() && no != this.target) {
                                    this.mg.player(no.id()).conquer(tile)
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private calculateToConquer() {
        this.numTilesWithEnemy = 0
        this.toConquer.clear()

        const newBorder: Set<Tile> = new Set()
        let existingBorder: ReadonlySet<Tile> = this.borderTiles
        if (existingBorder.size == 0) {
            existingBorder = this._owner.borderTiles()
        }
        for (const tile of existingBorder) {
            for (const neighbor of tile.neighbors()) {
                if (neighbor.isWater() || neighbor.owner() != this.target) {
                    continue
                }
                newBorder.add(neighbor)
                this.numTilesWithEnemy += 1
                let numOwnedByMe = neighbor.neighbors()
                    .filter(t => t.isLand())
                    .filter(t => t.owner() == this._owner)
                    .length
                let dist = 0
                if (this.targetCell != null) {
                    dist = manhattanDist(tile.cell(), this.targetCell)
                }
                if (numOwnedByMe > 2) {
                    numOwnedByMe = 1000
                }
                this.toConquer.enqueue(new TileContainer(neighbor, dist + -numOwnedByMe))
            }
        }
        this.borderTiles = newBorder
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