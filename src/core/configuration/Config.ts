import {Player, PlayerID, PlayerInfo, TerrainType, TerrainTypes, TerraNullius} from "../Game";
import {Colord, colord} from "colord";
import {pastelTheme} from "./PastelTheme";

export interface Config {
	theme(): Theme;
	player(): PlayerConfig
	turnIntervalMs(): number
	tickIntervalMs(): number
	ticksPerTurn(): number
	lobbyCreationRate(): number
	lobbyLifetime(): number
}

export interface PlayerConfig {
	startTroops(playerInfo: PlayerInfo): number
	troopAdditionRate(player: Player): number
	attackLogic(attack: Player, defender: Player | TerraNullius): number
	attackAmount(attacker: Player, defender: Player | TerraNullius): number
	boatAttackAmount(attacker: Player, defender: Player | TerraNullius): number
}

export interface Theme {
	playerInfoColor(id: PlayerID): Colord;
	territoryColor(id: PlayerID): Colord;
	borderColor(id: PlayerID): Colord;
	terrainColor(tile: TerrainType): Colord;
	backgroundColor(): Colord;
	font(): string;
}

