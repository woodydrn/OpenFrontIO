import {Player, PlayerInfo} from "../Game";
import {DefaultConfig} from "./DefaultConfig";

export const devConfig = new class extends DefaultConfig {
    numSpawnPhaseTurns(): number {
        return 40
    }
    gameCreationRate(): number {
        return 2 * 1000
    }
    lobbyLifetime(): number {
        return 4 * 1000
    }
    turnIntervalMs(): number {
        return 100
    }

    numBots(): number {
        return 350
    }

    startTroops(playerInfo: PlayerInfo): number {
        if (playerInfo.isBot) {
            return 5000
        }
        return 5000
    }

    // troopAdditionRate(player: Player): number {
    //     let max = Math.sqrt(player.numTilesOwned()) * 2000 + 10000 + 10000
    //     max = Math.min(max, 1_000_000)

    //     let toAdd = 10 + (player.troops() + Math.sqrt(player.troops() * player.numTilesOwned())) / 200 * 100

    //     return Math.min(player.troops() + toAdd, max)
    // }
}