import {EventBus} from "./EventBus";
import {Cell, Execution, MutableGame, Game, MutablePlayer, PlayerEvent, PlayerID, PlayerInfo, Player, TerrainMap, TerrainType, TerrainTypes, TerraNullius, Tile, TileEvent, Boat, MutableBoat, BoatEvent} from "./Game";

export function createGame(terrainMap: TerrainMap, eventBus: EventBus): Game {
    return new GameImpl(terrainMap, eventBus)
}

type CellString = string

class TileImpl implements Tile {

    public _isBorder = false

    constructor(
        private readonly gs: GameImpl,
        public _owner: PlayerImpl | TerraNulliusImpl,
        private readonly _cell: Cell,
        private readonly _terrain: TerrainType
    ) { }

    onShore(): boolean {
        return this.neighbors()
            .filter(t => t.terrain() == TerrainTypes.Water)
            .length > 0
    }

    hasOwner(): boolean {return this._owner != this.gs._terraNullius}
    owner(): MutablePlayer | TerraNullius {return this._owner}
    isBorder(): boolean {return this._isBorder}
    isInterior(): boolean {return this.hasOwner() && !this.isBorder()}
    cell(): Cell {return this._cell}
    terrain(): TerrainType {return this._terrain}

    neighbors(): Tile[] {
        return this.gs.neighbors(this)
    }

    game(): Game {return this.gs}
}

export class BoatImpl implements MutableBoat {

    constructor(
        private g: GameImpl,
        private _tile: Tile,
        private _troops: number,
        private _owner: PlayerImpl,
        private _target: PlayerImpl | TerraNulliusImpl
    ) { }

    move(tile: Tile): void {
        this._tile = tile
        this.g.fireBoatUpdateEvent(this)
    }
    setTroops(troops: number): void {
        this._troops = troops
    }
    troops(): number {
        return this._troops
    }
    tile(): Tile {
        return this._tile
    }
    owner(): PlayerImpl {
        return this._owner
    }
    target(): PlayerImpl | TerraNullius {
        return this._target
    }
}

export class PlayerImpl implements MutablePlayer {
    public _borderTiles: Map<CellString, Tile> = new Map()
    public _borderTileSet: Set<Tile> = new Set()

    public _boats: BoatImpl[] = []
    public tiles: Map<CellString, Tile> = new Map<CellString, Tile>()

    constructor(private gs: GameImpl, public readonly _id: PlayerID, public readonly playerInfo: PlayerInfo, private _troops) {
    }

    addBoat(troops: number, tile: Tile, target: Player | TerraNullius): BoatImpl {
        const b = new BoatImpl(this.gs, tile, troops, this, target as PlayerImpl | TerraNulliusImpl)
        this._boats.push(b)
        this.gs.fireBoatUpdateEvent(b)
        return b
    }
    boats(): BoatImpl[] {
        return this._boats
    }
    sharesBorderWith(other: Player | TerraNullius): boolean {
        for (const border of this._borderTileSet) {
            for (const neighbor of border.neighbors()) {
                if (neighbor.owner() == other) {
                    return true
                }
            }
        }
        return false
    }
    numTilesOwned(): number {
        return this.tiles.size
    }

    borderTiles(): ReadonlySet<Tile> {
        return this._borderTileSet
    }

    neighbors(): (MutablePlayer | TerraNullius)[] {
        const ns: Set<(MutablePlayer | TerraNullius)> = new Set()
        for (const border of this.borderTiles()) {
            for (const neighbor of border.neighbors()) {
                if (neighbor.owner() != this) {
                    ns.add((neighbor as TileImpl)._owner)
                }
            }
        }
        return Array.from(ns)
    }

    addTroops(troops: number): void {
        this._troops += troops
    }
    removeTroops(troops: number): void {
        this._troops -= troops
    }

    isPlayer(): this is MutablePlayer {return true as const}
    ownsTile(cell: Cell): boolean {return this.tiles.has(cell.toString())}
    setTroops(troops: number) {this._troops = troops}
    conquer(cell: Cell) {this.gs.conquer(this, cell)}
    info(): PlayerInfo {return this.playerInfo}
    id(): PlayerID {return this._id}
    troops(): number {return this._troops}
    isAlive(): boolean {return this.tiles.size > 0}
    gameState(): MutableGame {return this.gs}
    executions(): Execution[] {
        return this.gs.executions().filter(exec => exec.owner().id() == this.id())
    }
}

class TerraNulliusImpl implements TerraNullius {
    public tiles: Map<Cell, Tile> = new Map<Cell, Tile>()


    constructor(private gs: GameImpl) {
    }

    id(): PlayerID {
        return 0
    }
    ownsTile(cell: Cell): boolean {
        return this.tiles.has(cell)
    }
    isPlayer(): false {return false as const}

}

export class TerrainMapImpl implements TerrainMap {

    constructor(public readonly tiles: TerrainType[][]) { }

    terrain(cell: Cell): TerrainType {
        return this.tiles[cell.x][cell.y]
    }

    width(): number {
        return this.tiles.length
    }

    height(): number {
        return this.tiles[0].length
    }
}

export class GameImpl implements MutableGame {
    private ticks = 0

    private unInitExecs: Execution[] = []

    idCounter: PlayerID = 1; // Zero reserved for TerraNullius
    map: TileImpl[][]
    _players: Map<PlayerID, PlayerImpl> = new Map<PlayerID, PlayerImpl>
    private execs: Execution[] = []
    private _width: number
    private _height: number
    _terraNullius: TerraNulliusImpl


    constructor(terrainMap: TerrainMap, private eventBus: EventBus) {
        this._terraNullius = new TerraNulliusImpl(this)
        this._width = terrainMap.width();
        this._height = terrainMap.height();
        this.map = new Array(this._width);
        for (let x = 0; x < this._width; x++) {
            this.map[x] = new Array(this._height);
            for (let y = 0; y < this._height; y++) {
                let cell = new Cell(x, y);
                this.map[x][y] = new TileImpl(this, this._terraNullius, cell, terrainMap.terrain(cell));
            }
        }
    }

    tick() {
        this.executions().forEach(e => e.tick(this.ticks))
        this.unInitExecs.forEach(e => e.init(this, this.ticks))

        this.removeInactiveExecutions()

        this.execs.push(...this.unInitExecs)
        this.unInitExecs = []
        this.ticks++
    }

    terraNullius(): TerraNullius {
        return this._terraNullius
    }

    removeInactiveExecutions(): void {
        this.execs = this.execs.filter(e => e.isActive())
    }

    players(): MutablePlayer[] {
        return Array.from(this._players.values()).filter(p => p.isAlive())
    }

    executions(): Execution[] {
        return this.execs
    }

    addExecution(...exec: Execution[]) {
        this.unInitExecs.push(...exec)
    }

    removeExecution(exec: Execution) {
        this.execs.filter(execution => execution !== exec)
    }

    width(): number {
        return this._width
    }

    height(): number {
        return this._height
    }

    forEachTile(fn: (tile: Tile) => void): void {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                fn(this.tile(new Cell(x, y)))
            }
        }
    }

    playerView(id: PlayerID): MutablePlayer {
        return this.player(id)
    }

    addPlayer(playerInfo: PlayerInfo): MutablePlayer {
        let id = this.idCounter
        this.idCounter++
        let player = new PlayerImpl(this, id, playerInfo, 10000)
        this._players.set(id, player)
        this.eventBus.emit(new PlayerEvent(player))
        return player
    }

    player(id: PlayerID | null): MutablePlayer {
        if (!this._players.has(id)) {
            throw new Error(`Player with id ${id} not found`)
        }
        return this._players.get(id)
    }

    tile(cell: Cell): Tile {
        this.assertIsOnMap(cell)
        return this.map[cell.x][cell.y]
    }

    isOnMap(cell: Cell): boolean {
        return cell.x >= 0
            && cell.x < this._width
            && cell.y >= 0
            && cell.y < this._height
    }

    neighbors(tile: Tile): Tile[] {
        this.assertIsOnMap(tile.cell())
        const x = tile.cell().x
        const y = tile.cell().y
        const ns: TileImpl[] = []
        if (y > 0) {
            ns.push(this.map[x][y - 1])
        }
        if (y < this._height - 1) {
            ns.push(this.map[x][y + 1])
        }
        if (x > 0) {
            ns.push(this.map[x - 1][y])
        }
        if (x < this._width - 1) {
            ns.push(this.map[x + 1][y])
        }
        return ns
    }

    private assertIsOnMap(cell: Cell) {
        if (!this.isOnMap(cell)) {
            throw new Error(`cell ${cell.toString()} is not on map`)
        }
    }

    conquer(owner: PlayerImpl, cell: Cell): void {
        if (owner.ownsTile(cell)) {
            throw new Error(`Player ${owner} already owns cell ${cell.toString()}`)
        }
        if (!owner.isPlayer()) {
            throw new Error("Must be a player")
        }
        let tile = this.tile(cell) as TileImpl
        if (tile.terrain() == TerrainTypes.Water) {
            throw new Error("Cannot conquer water")
        }
        let previousOwner = tile._owner
        if (previousOwner.isPlayer()) {
            previousOwner.tiles.delete(cell.toString())
            previousOwner._borderTiles.delete(cell.toString())
            previousOwner._borderTileSet.delete(tile)
            tile._isBorder = false
        }
        tile._owner = owner
        owner.tiles.set(cell.toString(), tile)
        this.updateBorders(tile)
        this.eventBus.emit(new TileEvent(tile))
    }

    private updateBorders(tile: Tile) {
        const tiles: Tile[] = []
        tiles.push(tile)
        tile.neighbors().forEach(t => tiles.push(t))
        tiles.filter(t => t.hasOwner()).forEach(t => {
            if (this.isBorder(t)) {
                (t.owner() as PlayerImpl)._borderTiles.set(t.cell().toString(), t);
                (t.owner() as PlayerImpl)._borderTileSet.add(t);
                (t as TileImpl)._isBorder = true
            } else {
                (t.owner() as PlayerImpl)._borderTiles.delete(t.cell().toString());
                (t.owner() as PlayerImpl)._borderTileSet.delete(t);
                (t as TileImpl)._isBorder = false
            }
        })
    }

    isBorder(tile: Tile): boolean {
        if (!tile.hasOwner()) {
            return false
        }
        for (const neighbor of tile.neighbors()) {
            let bordersEnemy = tile.owner() != neighbor.owner()
            if (bordersEnemy) {
                return true
            }
        }
        return false
    }

    public fireBoatUpdateEvent(boat: Boat) {
        this.eventBus.emit(new BoatEvent(boat))
    }

}