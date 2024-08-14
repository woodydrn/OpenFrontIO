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

    addTurn(turn: Turn) {
        turn.intents.forEach(i => this.addIntent(i))
    }

    addIntent(intent: Intent) {
        if (intent.type == "attack") {
            this.gs.addExecution(
                new AttackExecution(
                    intent.troops,
                    intent.attackerID,
                    intent.targetID,
                    new Cell(intent.targetX, intent.targetY)
                )
            )
        } else if (intent.type == "spawn") {
            this.gs.addExecution(
                new SpawnExecution(
                    new PlayerInfo(intent.name, intent.isBot, intent.clientID),
                    new Cell(intent.x, intent.y),
                    this.playerConfig
                )
            )
        } else if (intent.type == "boat") {
            this.gs.addExecution(
                new BoatAttackExecution(
                    intent.attackerID,
                    intent.targetID,
                    new Cell(intent.x, intent.y),
                    intent.troops,
                )
            )
        } else {
            throw new Error(`intent type ${intent} not found`)
        }
    }


    spawnBots(numBots: number): void {
        new BotSpawner(this.gs).spawnBots(numBots).forEach(i => this.addIntent(i))
    }
}