import {PlayerInfo} from "../Game";
import {PlayerConfig} from "./Config";
import {DefaultConfig, DefaultPlayerConfig, defaultPlayerConfig} from "./DefaultConfig";

export const devConfig = new class extends DefaultConfig {
    gameCreationRate(): number {
        return 2 * 1000
    }
    lobbyLifetime(): number {
        return 5 * 1000
    }
    turnIntervalMs(): number {
        return 100
    }
    player(): PlayerConfig {
        return devPlayerConfig
    }
    numBots(): number {
        return 500
    }
}

export const devPlayerConfig = new class extends DefaultPlayerConfig {
    startTroops(playerInfo: PlayerInfo): number {
        if (playerInfo.isBot) {
            return 1000
        }
        return 5000
    }
}