import {Player, PlayerInfo, TerraNullius} from "../Game";
import {Config, PlayerConfig, Theme} from "./Config";
import {pastelTheme} from "./PastelTheme";

export const defaultConfig = new class implements Config {
    player(): PlayerConfig {
        throw new Error("Method not implemented.");
    }

    ticksPerTurn(): number {
        return 1
    }
    turnIntervalMs(): number {
        return 100
    }
    lobbyCreationRate(): number {
        return 2 * 1000
    }
    lobbyLifetime(): number {
        return 3 * 1000
    }
    theme(): Theme {return pastelTheme;}

    tickIntervalMs(): number {
        return 1000 / 20; // 50ms
    }
}

export const defaultPlayerConfig = new class implements PlayerConfig {
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
        return Math.min(player.troops(), max)
    }

    attackLogic(attack: Player, defender: Player | TerraNullius): number {
        throw new Error("Method not implemented.");
    }

}