import {DefaultConfig} from "./DefaultConfig";

export const devConfig = new class extends DefaultConfig {
    gameCreationRate(): number {
        return 2 * 1000
    }
    lobbyLifetime(): number {
        return 10 * 1000
    }
}