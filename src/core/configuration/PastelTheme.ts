import {Colord, colord, random} from "colord";
import {PlayerID, Tile} from "../Game";
import {Theme} from "./Config";
import {time} from "console";
import {PseudoRandom} from "../PseudoRandom";
import {simpleHash} from "../Util";

export const pastelTheme = new class implements Theme {
    private rand = new PseudoRandom(123)

    private background = colord({r: 60, g: 60, b: 60});
    private land = colord({r: 194, g: 193, b: 148});
    private shore = colord({r: 204, g: 203, b: 158});

    private water = colord({r: 110, g: 153, b: 181});
    private shorelineWater = colord({r: 100, g: 143, b: 171});

    private territoryColors: Colord[] = [
        colord({r: 205, g: 129, b: 136}), // Darker Light Pink
        colord({r: 205, g: 173, b: 136}), // Darker Peach
        colord({r: 140, g: 205, b: 140}), // Darker Light Green
        colord({r: 123, g: 166, b: 205}), // Darker Light Blue
        colord({r: 174, g: 137, b: 205}), // Darker Light Purple
        colord({r: 205, g: 141, b: 180}), // Darker Pink
        colord({r: 160, g: 205, b: 160}), // Darker Mint Green
        colord({r: 205, g: 163, b: 129}), // Darker Light Orange
        colord({r: 148, g: 148, b: 205}), // Darker Lavender
        colord({r: 205, g: 205, b: 136}), // Darker Light Yellow
        colord({r: 136, g: 205, b: 151}), // Darker Seafoam Green
        colord({r: 205, g: 136, b: 205}), // Darker Light Magenta
        colord({r: 160, g: 205, b: 160}), // Darker Pale Green
        colord({r: 205, g: 152, b: 152}), // Darker Salmon Pink
        colord({r: 156, g: 156, b: 205}), // Darker Periwinkle
        colord({r: 205, g: 184, b: 136}), // Darker Cream
        colord({r: 136, g: 205, b: 205}), // Darker Light Cyan
        colord({r: 188, g: 160, b: 205}), // Darker Lilac
        colord({r: 156, g: 205, b: 188}), // Darker Pale Turquoise
        colord({r: 205, g: 159, b: 136}), // Darker Peach
        colord({r: 136, g: 166, b: 205}), // Darker Baby Blue
        colord({r: 196, g: 205, b: 136}), // Darker Pale Yellow
        colord({r: 170, g: 136, b: 205}), // Darker Light Violet
        colord({r: 205, g: 136, b: 163}), // Darker Rose
        colord({r: 136, g: 205, b: 176}), // Darker Honeydew
        colord({r: 156, g: 186, b: 205}), // Darker Sky Blue
        colord({r: 205, g: 182, b: 156}), // Darker Wheat
        colord({r: 156, g: 205, b: 205}), // Darker Pale Cyan
        colord({r: 205, g: 166, b: 166}), // Darker Misty Rose
        colord({r: 166, g: 166, b: 205}), // Darker Pale Lavender
        colord({r: 205, g: 200, b: 155}), // Darker Pale Goldenrod
        colord({r: 166, g: 205, b: 166}), // Darker Pale Mint
        colord({r: 205, g: 166, b: 205}), // Darker Pale Plum
        colord({r: 170, g: 205, b: 170}), // Darker Mint Cream
        colord({r: 205, g: 170, b: 170}), // Darker Pale Pink
        colord({r: 170, g: 170, b: 205}), // Darker Pale Blue
        colord({r: 205, g: 205, b: 170}), // Darker Light Goldenrod
        colord({r: 170, g: 205, b: 205}), // Darker Light Azure
        colord({r: 205, g: 170, b: 205}), // Darker Pale Magenta
        colord({r: 180, g: 205, b: 180}), // Darker Honeydew
        colord({r: 205, g: 180, b: 180}), // Darker Lavender Blush
        colord({r: 180, g: 180, b: 205}), // Darker Ghost White
        colord({r: 205, g: 189, b: 169}), // Darker Seashell
        colord({r: 169, g: 205, b: 189}), // Darker Mint Cream
        colord({r: 189, g: 169, b: 205}), // Darker Pale Lavender
        colord({r: 205, g: 200, b: 180}), // Darker Floral White
        colord({r: 180, g: 205, b: 200}), // Darker Azure Mist
        colord({r: 200, g: 180, b: 205}), // Darker Pale Purple
        colord({r: 200, g: 205, b: 180}), // Darker Ivory
        colord({r: 180, g: 200, b: 205})  // Darker Alice Blue
    ];

    playerInfoColor(id: PlayerID): Colord {
        return colord({r: 50, g: 50, b: 50})
    }

    territoryColor(id: PlayerID): Colord {
        return this.territoryColors[simpleHash(id) % this.territoryColors.length]
    }

    borderColor(id: PlayerID): Colord {
        const tc = this.territoryColor(id).rgba;
        return colord({
            r: Math.max(tc.r - 40, 0),
            g: Math.max(tc.g - 40, 0),
            b: Math.max(tc.b - 40, 0)
        })
    }

    terrainColor(tile: Tile): Colord {
        if (tile.isLand()) {
            if (tile.isShore()) {
                return this.shore
            }
            return colord({
                r: 174 + 5 * tile.magnitude(),
                g: 163 + 5 * tile.magnitude(),
                b: 128 + 5 * tile.magnitude()
            })
        } else {
            const w = this.water.rgba
            if (tile.isShorelineWater()) {
                return this.shorelineWater
            }
            if (tile.magnitude() < 7) {
                return colord({
                    r: Math.max(w.r - 7 + tile.magnitude(), 0),
                    g: Math.max(w.g - 7 + tile.magnitude(), 0),
                    b: Math.max(w.b - 7 + tile.magnitude(), 0)
                })
            }
            return this.water
        }
    }

    backgroundColor(): Colord {
        return this.background;
    }

    font(): string {
        return "Overpass, sans-serif";
    }
}