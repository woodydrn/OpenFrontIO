import PriorityQueue from "priority-queue-typescript";
import {Cell, Execution, MutableGame, Game, MutablePlayer, PlayerInfo, TerraNullius, Tile} from "../Game";
import {AttackIntent, BoatAttackIntentSchema, Intent, Turn} from "../Schemas";
import {AttackExecution} from "./AttackExecution";
import {SpawnExecution} from "./SpawnExecution";
import {BotSpawner} from "./BotSpawner";
import {BoatAttackExecution} from "./BoatAttackExecution";
import {PlayerConfig} from "../configuration/Config";


export class Executor {

    constructor(private gs: Game, private playerConfig: PlayerConfig) {

    }

    createExecs(turn: Turn): Execution[] {
        return turn.intents.map(i => this.createExec(i))
    }

    createExec(intent: Intent) {
        if (intent.type == "attack") {
            return new AttackExecution(
                intent.troops,
                intent.attackerID,
                intent.targetID,
                new Cell(intent.targetX, intent.targetY),
                this.playerConfig
            )
        } else if (intent.type == "spawn") {
            return new SpawnExecution(
                new PlayerInfo(intent.name, intent.isBot, intent.clientID),
                new Cell(intent.x, intent.y),
                this.playerConfig
            )
        } else if (intent.type == "boat") {
            return new BoatAttackExecution(
                intent.attackerID,
                intent.targetID,
                new Cell(intent.x, intent.y),
                intent.troops,
                this.playerConfig
            )
        } else {
            throw new Error(`intent type ${intent} not found`)
        }
    }


    spawnBots(numBots: number): void {
        new BotSpawner(this.gs).spawnBots(numBots).forEach(i => this.createExec(i))
    }
}