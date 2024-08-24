import PriorityQueue from "priority-queue-typescript";
import {Cell, Execution, MutableGame, Game, MutablePlayer, PlayerInfo, TerraNullius, Tile} from "../Game";
import {AttackIntent, BoatAttackIntentSchema, Intent, Turn} from "../Schemas";
import {AttackExecution} from "./AttackExecution";
import {SpawnExecution} from "./SpawnExecution";
import {BotSpawner} from "./BotSpawner";
import {BoatAttackExecution} from "./BoatAttackExecution";


export class Executor {

    constructor(private gs: Game) {

    }

    createExecs(turn: Turn): Execution[] {
        return turn.intents.map(i => this.createExec(i))
    }

    createExec(intent: Intent): Execution {
        if (intent.type == "attack") {
            return new AttackExecution(
                intent.troops,
                intent.attackerID,
                intent.targetID,
                new Cell(intent.targetX, intent.targetY)
            )
        } else if (intent.type == "spawn") {
            return new SpawnExecution(
                new PlayerInfo(intent.name, intent.isBot, intent.clientID),
                new Cell(intent.x, intent.y)
            )
        } else if (intent.type == "boat") {
            return new BoatAttackExecution(
                intent.attackerID,
                intent.targetID,
                new Cell(intent.x, intent.y),
                intent.troops
            )
        } else {
            throw new Error(`intent type ${intent} not found`)
        }
    }


    spawnBots(numBots: number): Execution[] {
        return new BotSpawner(this.gs).spawnBots(numBots).map(i => this.createExec(i))
    }
}