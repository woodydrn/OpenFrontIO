import cluster from "cluster"
import {Config} from "../configuration/Config"
import {Execution, MutableGame, MutablePlayer, PlayerID, Tile} from "../Game"
import {bfs, calculateBoundingBox, getMode, inscribed, simpleHash} from "../Util"
import {GameImpl} from "../GameImpl"

export class PlayerExecution implements Execution {

    private readonly ticksPerIslandCalc = 50

    private player: MutablePlayer
    private config: Config
    private lastCalc = 0
    private mg: MutableGame

    constructor(private playerID: PlayerID) {
    }

    activeDuringSpawnPhase(): boolean {
        return false
    }

    init(mg: MutableGame, ticks: number) {
        this.mg = mg
        this.config = mg.config()
        this.player = mg.player(this.playerID)
        this.lastCalc = ticks + (simpleHash(this.player.name()) % this.ticksPerIslandCalc)
    }

    tick(ticks: number) {
        if (ticks < this.config.numSpawnPhaseTurns()) {
            return
        }
        this.player.setTroops(this.config.troopAdditionRate(this.player))

        if (ticks - this.lastCalc > this.ticksPerIslandCalc) {
            this.lastCalc = ticks
            const start = performance.now()
            this.removeIslands()
            const end = performance.now()
            if (end - start > 1000) {
                console.log(`player ${this.player.name()}, took ${end - start}ms`)
            }
        }
    }

    private removeIslands() {
        const clusters = this.calculateClusters()
        if (clusters.length <= 1) {
            return
        }
        clusters.sort((a, b) => b.size - a.size);
        const main = clusters.shift()
        const mainBox = calculateBoundingBox(main)
        for (const toRemove of clusters) {
            const toRemoveBox = calculateBoundingBox(toRemove)
            if (inscribed(mainBox, toRemoveBox)) {
                return
            }

            for (const tile of toRemove) {
                if (tile.isOceanShore()) {
                    return
                }
            }
            this.removeIsland(toRemove)
        }
    }

    private removeIsland(cluster: Set<Tile>) {
        console.log('removing island!')
        const arr = Array.from(cluster)
        const mode = getMode(arr.flatMap(t => t.neighbors()).filter(t => t.hasOwner() && t.owner() != this.player).map(t => t.owner().id()))
        if (mode == null) {
            console.warn('mode is null')
            return
        }
        const firstTile = arr[0]
        const filter = (n: Tile): boolean => n.owner() == firstTile.owner()
        const tiles = bfs(firstTile, filter)

        const modePlayer = this.mg.player(mode)
        if (modePlayer == null) {
            console.warn('mode player is null')
        }
        for (const tile of tiles) {
            modePlayer.conquer(tile)
        }
    }

    private calculateClusters(): Set<Tile>[] {
        const seen = new Set<Tile>()
        const border = this.player.borderTiles()
        const clusters: Set<Tile>[] = []
        for (const tile of border) {
            if (seen.has(tile)) {
                continue
            }

            const cluster = new Set<Tile>()
            const queue: Tile[] = [tile]
            seen.add(tile)
            let loops = 0;
            while (queue.length > 0) {
                loops += 1
                const curr = queue.shift()
                cluster.add(curr)

                const neighbors = (this.mg as GameImpl).neighborsWithDiag(curr)
                for (const neighbor of neighbors) {
                    // if (this.mg.ticks() == 736 && loops > 580000) {
                    //     // console.log(`got neighbor ${neighbor.cell().toString()}`)
                    //     gr.paintBlack(neighbor)
                    // }
                    if (neighbor.isBorder() && border.has(neighbor)) {
                        if (!seen.has(neighbor)) {
                            queue.push(neighbor)
                            seen.add(neighbor)
                        }
                    }
                }
            }
            clusters.push(cluster)
        }
        return clusters
    }

    owner(): MutablePlayer {
        return this.player
    }

    private active = true
    isActive(): boolean {
        // return this.player.isAlive()
        return this.active
    }
}