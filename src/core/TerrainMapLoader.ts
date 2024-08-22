import {Jimp as JimpType, JimpConstructors} from '@jimp/core';
import 'jimp';
import {TerrainTile} from '../../generated/protos';
import {Cell} from './Game';

declare const Jimp: JimpType & JimpConstructors;


export class TerrainMap {

    constructor(public readonly tiles: Terrain[][]) { }

    terrain(cell: Cell): Terrain {
        return this.tiles[cell.x][cell.y]
    }

    width(): number {
        return this.tiles.length
    }

    height(): number {
        return this.tiles[0].length
    }
}

export enum TerrainType {
    Land,
    Water
}

export class Terrain {
    public shoreline: boolean = false
    constructor(public type: TerrainType) { }
}

export async function loadTerrainMap(): Promise<TerrainMap> {
    const imageModule = await import(`../../resources/maps/World.png`);
    const imageUrl = imageModule.default;
    const image = await Jimp.read(imageUrl)
    const {width, height} = image.bitmap;

    const terrain: Terrain[][] = Array(width).fill(null).map(() => Array(height).fill(null));

    image.scan(0, 0, width, height, function (x: number, y: number, idx: number) {
        const t: TerrainTile = new TerrainTile()
        const red = this.bitmap.data[idx + 0];

        if (red > 100) {
            terrain[x][y] = new Terrain(TerrainType.Land)
        } else {
            terrain[x][y] = new Terrain(TerrainType.Water);
        }
    })

    process(terrain)

    return new TerrainMap(terrain);
}

function process(map: Terrain[][]) {
    for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map[0].length; y++) {
            const terrain = map[x][y]
            const ns = neighbors(x, y, map)
            if (terrain.type == TerrainType.Land) {
                if (ns.filter(t => t.type == TerrainType.Water).length > 0) {
                    terrain.shoreline = true
                }
            } else {
                if (ns.filter(t => t.type == TerrainType.Land).length > 0) {
                    terrain.shoreline = true
                }
            }
        }
    }
}

function neighbors(x: number, y: number, map: Terrain[][]): Terrain[] {
    const ns: Terrain[] = []
    if (x > 0) {
        ns.push(map[x - 1][y])
    }
    if (x < map.length - 1) {
        ns.push(map[x + 1][y])
    }
    if (y > 0) {
        ns.push(map[x][y - 1])
    }
    if (y < map[0].length - 1) {
        ns.push(map[x][y + 1])
    }
    return ns
}