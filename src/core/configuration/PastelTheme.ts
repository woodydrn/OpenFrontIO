import {Colord, colord} from "colord";
import {PlayerID, TerrainType, TerrainTypes} from "../Game";
import {Theme} from "./Config";

export const pastelTheme = new class implements Theme {
    private background = colord({r: 100, g: 100, b: 100});
    private land = colord({r: 244, g: 243, b: 198});
    private water = colord({r: 160, g: 203, b: 231});
    private territoryColors: Colord[] = [
        colord({r: 255, g: 179, b: 186}), // Vibrant Light Pink
        colord({r: 255, g: 223, b: 186}), // Vibrant Peach
        colord({r: 190, g: 255, b: 190}), // Vibrant Light Green
        colord({r: 173, g: 216, b: 255}), // Vibrant Light Blue
        colord({r: 224, g: 187, b: 255}), // Vibrant Light Purple
        colord({r: 255, g: 191, b: 230}), // Vibrant Pink
        colord({r: 210, g: 255, b: 210}), // Vibrant Mint Green
        colord({r: 255, g: 213, b: 179}), // Vibrant Light Orange
        colord({r: 198, g: 198, b: 255}), // Vibrant Lavender
        colord({r: 255, g: 255, b: 186}), // Vibrant Light Yellow
        colord({r: 186, g: 255, b: 201}), // Vibrant Seafoam Green
        colord({r: 255, g: 186, b: 255}), // Vibrant Light Magenta
        colord({r: 210, g: 255, b: 210}), // Vibrant Pale Green
        colord({r: 255, g: 202, b: 202}), // Vibrant Salmon Pink
        colord({r: 206, g: 206, b: 255}), // Vibrant Periwinkle
        colord({r: 255, g: 234, b: 186}), // Vibrant Cream
        colord({r: 186, g: 255, b: 255}), // Vibrant Light Cyan
        colord({r: 238, g: 210, b: 255}), // Vibrant Lilac
        colord({r: 206, g: 255, b: 238}), // Vibrant Pale Turquoise
        colord({r: 255, g: 209, b: 186}), // Vibrant Peach
        colord({r: 186, g: 216, b: 255}), // Vibrant Baby Blue
        colord({r: 246, g: 255, b: 186}), // Vibrant Pale Yellow
        colord({r: 220, g: 186, b: 255}), // Vibrant Light Violet
        colord({r: 255, g: 186, b: 213}), // Vibrant Rose
        colord({r: 186, g: 255, b: 226}), // Vibrant Honeydew
        colord({r: 206, g: 236, b: 255}), // Vibrant Sky Blue
        colord({r: 255, g: 232, b: 206}), // Vibrant Wheat
        colord({r: 206, g: 255, b: 255}), // Vibrant Pale Cyan
        colord({r: 255, g: 216, b: 216}), // Vibrant Misty Rose
        colord({r: 216, g: 216, b: 255}), // Vibrant Pale Lavender
        colord({r: 255, g: 250, b: 205}), // Vibrant Pale Goldenrod
        colord({r: 216, g: 255, b: 216}), // Vibrant Pale Mint
        colord({r: 255, g: 216, b: 255}), // Vibrant Pale Plum
        colord({r: 220, g: 255, b: 220}), // Vibrant Mint Cream
        colord({r: 255, g: 220, b: 220}), // Vibrant Pale Pink
        colord({r: 220, g: 220, b: 255}), // Vibrant Pale Blue
        colord({r: 255, g: 255, b: 220}), // Vibrant Light Goldenrod
        colord({r: 220, g: 255, b: 255}), // Vibrant Light Azure
        colord({r: 255, g: 220, b: 255}), // Vibrant Pale Magenta
        colord({r: 230, g: 255, b: 230}), // Vibrant Honeydew
        colord({r: 255, g: 230, b: 230}), // Vibrant Lavender Blush
        colord({r: 230, g: 230, b: 255}), // Vibrant Ghost White
        colord({r: 255, g: 239, b: 219}), // Vibrant Seashell
        colord({r: 219, g: 255, b: 239}), // Vibrant Mint Cream
        colord({r: 239, g: 219, b: 255}), // Vibrant Pale Lavender
        colord({r: 255, g: 250, b: 230}), // Vibrant Floral White
        colord({r: 230, g: 255, b: 250}), // Vibrant Azure Mist
        colord({r: 250, g: 230, b: 255}), // Vibrant Pale Purple
        colord({r: 250, g: 255, b: 230}), // Vibrant Ivory
        colord({r: 230, g: 250, b: 255})  // Vibrant Alice Blue
    ];
    playerInfoColor(id: PlayerID): Colord {
        return colord({r: 0, g: 0, b: 0})
    }

    territoryColor(id: PlayerID): Colord {
        return this.territoryColors[id % this.territoryColors.length]
    }

    borderColor(id: PlayerID): Colord {
        const tc = this.territoryColor(id).rgba;
        return colord({
            r: Math.max(tc.r - 20, 0),
            g: Math.max(tc.g - 20, 0),
            b: Math.max(tc.b - 20, 0)
        })
    }

    terrainColor(tile: TerrainType): Colord {
        if (tile == TerrainTypes.Land) {
            return this.land;
        }
        return this.water;
    }

    backgroundColor(): Colord {
        return this.background;
    }

    font(): string {
        return "Arial";
    }
}