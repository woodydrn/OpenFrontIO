import {Player, PlayerInfo, TerraNullius, Tile} from "../Game";
import {Config, PlayerConfig, Theme} from "./Config";
import {pastelTheme} from "./PastelTheme";

export const defaultConfig = new class implements Config {
    player(): PlayerConfig {
        return defaultPlayerConfig
    }
    turnIntervalMs(): number {
        return 100
    }
    gameCreationRate(): number {
        return 2 * 1000
    }
    lobbyLifetime(): number {
        return 10 * 1000
    }
    theme(): Theme {return pastelTheme;}
}

export const defaultPlayerConfig = new class implements PlayerConfig {

    attackLogic(attacker: Player, defender: Player | TerraNullius, tileToConquer: Tile): {attackerTroopLoss: number; defenderTroopLoss: number; tilesPerTickUsed: number} {
        if (defender.isPlayer()) {
            return {
                attackerTroopLoss: Math.max(defender.troops() / attacker.troops(), 1),
                defenderTroopLoss: 0,
                tilesPerTickUsed: Math.max(defender.troops() / attacker.troops(), .25)
            }
        } else {
            return {attackerTroopLoss: 1, defenderTroopLoss: 0, tilesPerTickUsed: 1}
        }

    }

    attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number {
        return numAdjacentTilesWithEnemy / 4
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
        return 1000
    }

    troopAdditionRate(player: Player): number {
        let toAdd = Math.sqrt(player.numTilesOwned() * player.troops()) / 5

        const max = Math.sqrt(player.numTilesOwned()) * 100 + 1000
        const ratio = 1 - player.troops() / max
        toAdd *= ratio * ratio * ratio
        toAdd = Math.max(2, toAdd)
        return Math.min(player.troops() + toAdd, max)
    }

}