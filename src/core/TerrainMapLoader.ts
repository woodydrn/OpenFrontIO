import {Jimp as JimpType, JimpConstructors} from '@jimp/core';
import 'jimp';
import {TerrainTile} from '../../generated/protos';
import {Cell} from './Game';

declare const Jimp: JimpType & JimpConstructors;


export class TerrainMap {

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

// TODO: make terrain api better.
export class Terrain {
    constructor(
        public readonly expansionCost: number,
        public readonly expansionTime: number,
    ) { }
}

export type TerrainType = typeof TerrainTypes[keyof typeof TerrainTypes];

export const TerrainTypes = {
    Land: new Terrain(1, 1),
    Water: new Terrain(0, 0)
}

export async function loadTerrainMap(): Promise<TerrainMap> {
    const imageModule = await import(`../../resources/maps/World.png`);
    const imageUrl = imageModule.default;
    const image = await Jimp.read(imageUrl)
    const {width, height} = image.bitmap;

    const terrain: TerrainType[][] = Array(width).fill(null).map(() => Array(height).fill(TerrainTypes.Water));

    image.scan(0, 0, width, height, function (x: number, y: number, idx: number) {
        const t: TerrainTile = new TerrainTile()
        const red = this.bitmap.data[idx + 0];

        if (red > 100) {
            terrain[x][y] = TerrainTypes.Land;
        }
    })

    return new TerrainMap(terrain);
}