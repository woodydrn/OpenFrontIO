import {Player, PlayerInfo, TerraNullius, Tile} from "../Game";
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
        const mag = tileToConquer.magnitude() / 5
        if (defender.isPlayer()) {
            return {
                attackerTroopLoss: Math.min(defender.troops() / 2000, 10) + mag,
                defenderTroopLoss: Math.min(attacker.troops() / 3000, 5),
                tilesPerTickUsed: mag + 1
            }
        } else {
            return {
                attackerTroopLoss: mag,
                defenderTroopLoss: 0,
                tilesPerTickUsed: mag + 1
            }
        }
    }

    attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number {
        if (defender.isPlayer()) {
            return within(attacker.numTilesOwned() / defender.numTilesOwned() * 2, .01, .5) * numAdjacentTilesWithEnemy * 2 / 25
        } else {
            return numAdjacentTilesWithEnemy * 2 / 25
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
            return 5000
        }
        return 5000
    }

    troopAdditionRate(player: Player): number {
        let max = Math.sqrt(player.numTilesOwned()) * 2000 + 10000 + 10000
        max = Math.min(max, 1_000_000)

        let toAdd = 10 + (player.troops() + Math.sqrt(player.troops() * player.numTilesOwned())) / 200

        return Math.min(player.troops() + toAdd, max)
    }
}


export const defaultConfig = new DefaultConfig()