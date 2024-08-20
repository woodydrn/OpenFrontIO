import Jimp from 'jimp';
import * as $protobuf from 'protobufjs/minimal.js';
// import {TerrainTile} from '../generated/protos';

async function generateTerrainMap(imagePath, outputDir) {
    const terrain = new TerrainTile()
    try {
        // const imageModule = await import(imagePath);
        // const imageUrl = imageModule.default;
        // const image = await Jimp.read(imageUrl);
        // const {width, height} = image.bitmap;

        // const map = new TerrainMap();
        // map.TerrainTile

        // image.scan(0, 0, width, height, function (x, y, idx) {
        //     const terrain = new TerrainTile();
        //     const red = this.bitmap.data[idx + 0];

        //     if (red > 100) {
        //         // terrain[x][y] = TerrainTypes.Land;
        //     }
        // });

        // return new TerrainMapImpl(terrain);
        console.log('Terrain map generated successfully');
    } catch (error) {
        console.error('Error generating terrain map:', error);
    }
}

// Usage
const imagePath = process.argv[2];
const outputDir = process.argv[3] || 'generated';

if (!imagePath) {
    console.error('Usage: node TerrainMapGenerator.js <imagePath> [outputDir]');
    process.exit(1);
}

generateTerrainMap(imagePath, outputDir).catch(console.error);

export {generateTerrainMap};