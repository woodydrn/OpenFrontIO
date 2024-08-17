import {Player, PlayerInfo, TerraNullius, Tile} from "../Game";
import {within} from "../Util";
import {Config, PlayerConfig, Theme} from "./Config";
import {pastelTheme} from "./PastelTheme";



export class DefaultConfig implements Config {
    turnsUntilGameStart(): number {
        return 25
    }
    numBots(): number {
        return 500
    }
    player(): PlayerConfig {
        return defaultPlayerConfig
    }
    turnIntervalMs(): number {
        return 100
    }
    gameCreationRate(): number {
        return 31.5 * 1000
    }
    lobbyLifetime(): number {
        return 30 * 1000
    }
    theme(): Theme {return pastelTheme;}
}

export const defaultPlayerConfig = new class implements PlayerConfig {

    attackLogic(attacker: Player, defender: Player | TerraNullius, tileToConquer: Tile): {attackerTroopLoss: number; defenderTroopLoss: number; tilesPerTickUsed: number} {
        if (defender.isPlayer()) {
            return {
                attackerTroopLoss: Math.min(defender.troops() / 1000, 10),
                defenderTroopLoss: Math.min(attacker.troops() / 2000, 5),
                tilesPerTickUsed: 1
            }
        } else {
            return {attackerTroopLoss: 1, defenderTroopLoss: 0, tilesPerTickUsed: 1}
        }

    }

    attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number {
        if (defender.isPlayer()) {
            return within(attacker.numTilesOwned() / defender.numTilesOwned(), .01, .5) * numAdjacentTilesWithEnemy
        } else {
            return numAdjacentTilesWithEnemy / 4
        }
    }

    boatAttackAmount(attacker: Player, defender: Player | TerraNullius): number {
        return attacker.troops() / 5
    }

    attackAmount(attacker: Player, defender: Player | TerraNullius) {
        if (attacker.info().isBot) {
            return attacker.troops() / 20
        } else {
            return attacker.troops() / 5
        }
    }

    startTroops(playerInfo: PlayerInfo): number {
        if (playerInfo.isBot) {
            return 1000
        }
        return 5000
    }

    troopAdditionRate(player: Player): number {
        const max = Math.sqrt(player.numTilesOwned()) * 1000 + 1000

        let toAdd = 10 + (player.troops() + Math.sqrt(player.troops() * player.numTilesOwned())) / 250

        return Math.min(player.troops() + toAdd, max)
    }

}

export const defaultConfig = new DefaultConfig()
