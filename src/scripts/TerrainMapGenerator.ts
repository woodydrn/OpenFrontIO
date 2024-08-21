import PImage from 'pureimage';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {createReadStream, createWriteStream} from 'fs';
import zlib from 'zlib';
import {promisify} from 'util';

const deflateRaw = promisify(zlib.deflateRaw);
const inflateRaw = promisify(zlib.inflateRaw);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TerrainMap {
    width: number;
    height: number;
    terrain: TerrainTile[][];
}

interface TerrainTile {
    isLand: boolean
}

export async function loadTerrainMap(): Promise<TerrainMap> {
    try {
        const imagePath = path.resolve(__dirname, '..', '..', 'resources', 'maps', 'World.png');
        console.log('Attempting to load image from:', imagePath);

        try {
            await fs.access(imagePath);
        } catch (error) {
            throw new Error(`Image file not found at ${imagePath}. Please ensure the file exists.`);
        }

        const readStream = createReadStream(imagePath);
        const img = await PImage.decodePNGFromStream(readStream);

        console.log('Image loaded successfully');
        console.log('Image dimensions:', img.width, 'x', img.height);

        const terrainMap: TerrainMap = {
            width: img.width,
            height: img.height,
            terrain: []
        };

        // Iterate through each pixel
        for (let x = 0; x < img.width; x++) {
            terrainMap.terrain[x] = [];
            for (let y = 0; y < img.height; y++) {
                const color = img.getPixelRGBA(x, y);
                const red = (color >> 24) & 0xff;
                // Extract the red channel (assuming it represents height)
                const height = (color >> 24) & 0xff;
                terrainMap.terrain[x][y] = {
                    isLand: red > 100
                };
            }
        }

        console.log('Terrain data extracted');


        // Serialize the terrain data using MessagePack
        const msg = JSON.stringify(terrainMap)
        const compressedData = await deflateRaw(msg);



        // Save the serialized data
        const outputPath = path.join(__dirname, 'terrain_data.msgpack');
        fs.writeFile(outputPath, compressedData);
        console.log('Serialized terrain data saved to:', outputPath);

        return terrainMap

    } catch (error) {
        console.error('Error loading or processing the terrain map:', error);
        throw error;
    }
}

// Test the function
loadTerrainMap().then(terrainData => {
    console.log('Terrain data loaded');
    console.log('Terrain data extracted');
}).catch(console.error);

console.log('Processing terrain map...');


async function loadAndDecodeTerrainData(): Promise<TerrainMap> {
    try {
        // Construct the path to the MessagePack file
        const filePath = path.join(__dirname, 'terrain_data.msgpack');

        // Read the file
        const data = await fs.readFile(filePath);

        const inflated = await inflateRaw(data)
        const decodedData = JSON.parse(inflated.toString('utf-8')) as TerrainMap

        console.log('Terrain data loaded and decoded successfully');
        console.log('Dimensions:', decodedData.width, 'x', decodedData.height);
        console.log('Sample height at (0,0):', decodedData.terrain[0][0]);

        return decodedData;
    } catch (error) {
        console.error('Error loading or decoding the terrain data:', error);
        throw error;
    }
}

// Usage example
loadAndDecodeTerrainData()
    .then(terrainData => {
        // You can now use terrainData in your application
        console.log('Terrain data ready for use');
    })
    .catch(console.error);