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
    constructor(public terrainType: TerrainType) { }
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

function process(terrain: Terrain[][]) {
    
}