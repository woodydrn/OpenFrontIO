import {Colord, colord} from "colord";
import {PlayerID, Tile} from "../Game";
import {Theme} from "./Config";
import {simpleHash} from "../Util";

export const vintageTheme = new class implements Theme {

    private background = colord({r: 150, g: 140, b: 120});
    private land = colord({r: 195, g: 175, b: 155})
    private shore = colord({r: 210, g: 190, b: 170});  // Brighter beige for shore

    private water = colord({r: 160, g: 180, b: 200})
    private shorelineWater = colord({r: 200, g: 200, b: 205});  // Slightly lighter muted blue for shoreline water

    private territoryColors: Colord[] = [
        // Original colors, adjusted for a more rustic look
        colord({r: 160, g: 125, b: 120}), // Faded dusty rose
        colord({r: 125, g: 155, b: 130}), // Muted sage green
        colord({r: 160, g: 150, b: 120}), // Weathered khaki
        colord({r: 125, g: 140, b: 155}), // Aged steel blue
        colord({r: 155, g: 125, b: 150}), // Worn mauve
        colord({r: 145, g: 155, b: 120}), // Faded olive
        colord({r: 125, g: 155, b: 155}), // Weathered teal
        colord({r: 160, g: 145, b: 120}), // Aged tan
        colord({r: 140, g: 125, b: 155}), // Faded lavender
        colord({r: 155, g: 155, b: 120}), // Aged mustard

        // Extended palette with a rustic touch
        colord({r: 170, g: 135, b: 125}), // Rustic terracotta
        colord({r: 130, g: 170, b: 145}), // Weathered mint
        colord({r: 170, g: 160, b: 125}), // Antique gold
        colord({r: 130, g: 150, b: 170}), // Worn denim
        colord({r: 170, g: 130, b: 160}), // Aged plum
        colord({r: 155, g: 170, b: 130}), // Faded lime
        colord({r: 130, g: 170, b: 170}), // Weathered turquoise
        colord({r: 170, g: 155, b: 130}), // Rustic sand
        colord({r: 155, g: 130, b: 170}), // Aged periwinkle
        colord({r: 170, g: 170, b: 130}), // Faded chartreuse
        colord({r: 145, g: 110, b: 105}), // Rustic burgundy
        colord({r: 110, g: 145, b: 120}), // Weathered forest green
        colord({r: 145, g: 135, b: 110}), // Aged olive
        colord({r: 110, g: 125, b: 145}), // Faded stormy blue
        colord({r: 145, g: 110, b: 135}), // Worn grape
        colord({r: 130, g: 145, b: 110}), // Aged avocado
        colord({r: 110, g: 145, b: 145}), // Weathered cyan
        colord({r: 145, g: 130, b: 110}), // Rustic camel
        colord({r: 130, g: 110, b: 145}), // Faded lilac
        colord({r: 145, g: 145, b: 110}), // Weathered antique gold
        colord({r: 165, g: 130, b: 120}), // Rustic coral
        colord({r: 120, g: 165, b: 140}), // Weathered sage
        colord({r: 165, g: 155, b: 120}), // Aged mustard
        colord({r: 120, g: 145, b: 165}), // Worn blue-gray
        colord({r: 165, g: 120, b: 155}), // Faded orchid
        colord({r: 145, g: 165, b: 120}), // Aged pear
        colord({r: 120, g: 165, b: 165}), // Weathered aqua
        colord({r: 165, g: 145, b: 120}), // Rustic taupe
        colord({r: 145, g: 120, b: 165}), // Worn wisteria
        colord({r: 165, g: 165, b: 120}), // Weathered antique brass
        colord({r: 155, g: 120, b: 110}), // Rustic rust
        colord({r: 110, g: 155, b: 130}), // Aged sea green
        colord({r: 155, g: 145, b: 110}), // Weathered khaki
        colord({r: 110, g: 135, b: 155}), // Worn slate
        colord({r: 155, g: 110, b: 145}), // Faded mauve
        colord({r: 135, g: 155, b: 110}), // Aged olive drab
        colord({r: 110, g: 155, b: 155}), // Weathered teal
        colord({r: 155, g: 135, b: 110}), // Rustic bronze
        colord({r: 135, g: 110, b: 155}), // Worn amethyst
        colord({r: 155, g: 155, b: 110})  // Aged chartreuse
    ];

    playerInfoColor(id: PlayerID): Colord {
        return colord({r: 90, g: 90, b: 90});  // Slightly lighter grey for player info
    }

    territoryColor(id: PlayerID): Colord {
        return this.territoryColors[simpleHash(id) % this.territoryColors.length];
    }

    borderColor(id: PlayerID): Colord {
        const tc = this.territoryColor(id).rgba;
        return colord({
            r: Math.max(tc.r - 25, 0),
            g: Math.max(tc.g - 25, 0),
            b: Math.max(tc.b - 25, 0)
        });
    }

    terrainColor(tile: Tile): Colord {
        if (tile.isLand()) {
            if (tile.isShore()) {
                return this.shore;
            }
            return this.land;
        } else {
            const w = this.water.rgba;
            if (tile.isShorelineWater()) {
                return this.shorelineWater;
            }
            if (tile.magnitude() < 5) {
                return colord({
                    r: Math.max(w.r + 5 - tile.magnitude() / 2, 0),
                    g: Math.max(w.g + 5 - tile.magnitude() / 2, 0),
                    b: Math.max(w.b + 5 - tile.magnitude() / 2, 0)
                });
            }
            return this.water;
        }
    }

    backgroundColor(): Colord {
        return this.background;
    }

    font(): string {
        return "Georgia, serif";  // A more vintage-looking font
    }
}