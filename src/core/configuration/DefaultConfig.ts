import {Player, PlayerInfo, TerrainType, TerraNullius, Tile} from "../Game";
import {within} from "../Util";
import {Config, Theme} from "./Config";
import {pastelTheme} from "./PastelTheme";



export class DefaultConfig implements Config {
    boatMaxNumber(): number {
        return 3
    }
    boatMaxDistance(): number {
        return 500
    }
    numSpawnPhaseTurns(): number {
        return 100
    }
    numBots(): number {
        return 350
    }
    turnIntervalMs(): number {
        return 100
    }
    gameCreationRate(): number {
        return 10 * 1000
    }
    lobbyLifetime(): number {
        return 20 * 1000
    }
    theme(): Theme {return pastelTheme;}

    attackLogic(attacker: Player, defender: Player | TerraNullius, tileToConquer: Tile): {attackerTroopLoss: number; defenderTroopLoss: number; tilesPerTickUsed: number} {
        let mag = 0
        switch (tileToConquer.terrain()) {
            case TerrainType.Plains:
                mag = 1
            case TerrainType.Highland:
                mag = 3
            case TerrainType.Mountain:
                mag = 10
        }
        if (defender.isPlayer()) {
            return {
                attackerTroopLoss: within(defender.troops() / attacker.troops() / 10 * mag, 1, 100),
                defenderTroopLoss: within(attacker.troops() / defender.troops() / 10, 1, 100),
                tilesPerTickUsed: mag + 1
            }
        } else {
            return {
                attackerTroopLoss: mag,
                defenderTroopLoss: 0,
                tilesPerTickUsed: Math.max(mag / 2, 1)
            }
        }
    }

    attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number {
        if (defender.isPlayer()) {
            return within(attacker.troops() / defender.troops() * 2, .01, .5) * numAdjacentTilesWithEnemy * 3
        } else {
            return numAdjacentTilesWithEnemy * 2
        }
    }

    boatAttackAmount(attacker: Player, defender: Player | TerraNullius): number {
        return attacker.troops() / 5
    }

    attackAmount(attacker: Player, defender: Player | TerraNullius) {
        if (attacker.isBot()) {
            return attacker.troops() / 20
        } else {
            return attacker.troops() / 5
        }
    }

    startTroops(playerInfo: PlayerInfo): number {
        if (playerInfo.isBot) {
            return 10000
        }
        return 10000
    }

    troopAdditionRate(player: Player): number {
        let max = Math.sqrt(player.numTilesOwned()) * 3000 + 50000
        max = Math.min(max, 1_000_000)

        let toAdd = 10 + (player.troops() + Math.sqrt(player.troops() * player.numTilesOwned())) / 100

        const ratio = 1 - (player.troops() / max)
        toAdd *= ratio
        // console.log(`to add ${toAdd}`)

        return Math.min(player.troops() + toAdd, max)
    }
}


export const defaultConfig = new DefaultConfig()