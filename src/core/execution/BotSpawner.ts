import {Cell, Game} from "../Game";
import {PseudoRandom} from "../PseudoRandom";
import {SpawnIntent} from "../Schemas";
import {bfs, dist as dist} from "../Util";
import {getSpawnCells} from "./Util";


export class BotSpawner {
    private cellToIndex: Map<string, number>;
    private freeTiles: Cell[];
    private numFreeTiles;
    private random = new PseudoRandom(123);

    constructor(private gs: Game) { }

    spawnBots(numBots: number): SpawnIntent[] {
        const bots: SpawnIntent[] = [];
        this.cellToIndex = new Map<string, number>();
        this.freeTiles = new Array();
        this.numFreeTiles = 0;

        this.gs.forEachTile(tile => {
            if (tile.isWater()) {
                return;
            }
            if (tile.hasOwner()) {
                return;
            }

            this.freeTiles.push(tile.cell());
            this.cellToIndex.set(tile.cell().toString(), this.numFreeTiles);
            this.numFreeTiles++;
        });
        for (let i = 0; i < numBots; i++) {
            bots.push(this.spawnBot("Bot" + i));
        }
        return bots;
    }

    spawnBot(botName: string): SpawnIntent {
        const rand = this.random.nextInt(0, this.numFreeTiles);
        const spawn = this.freeTiles[rand];
        bfs(this.gs.tile(spawn), dist(50)).forEach(t => this.removeCell(t.cell()))
        const spawnIntent: SpawnIntent = {
            type: 'spawn',
            name: botName,
            isBot: true,
            x: spawn.x,
            y: spawn.y
        };
        return spawnIntent;
    }

    private removeCell(cell: Cell) {
        if (!this.cellToIndex.has(cell.toString())) {
            return
        }
        const index = this.cellToIndex.get(cell.toString());
        this.cellToIndex.delete(cell.toString())

        this.freeTiles[index] = this.freeTiles[this.numFreeTiles - 1];
        this.cellToIndex.set(this.freeTiles[index].toString(), index);
        this.numFreeTiles--;
    }
}
