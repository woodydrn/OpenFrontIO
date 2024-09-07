import {Cell, Execution, MutableGame, Game, MutablePlayer, PlayerInfo, TerraNullius, Tile} from "../Game";
import {AttackIntent, BoatAttackIntentSchema, Intent, Turn} from "../Schemas";
import {AttackExecution} from "./AttackExecution";
import {SpawnExecution} from "./SpawnExecution";
import {BotSpawner} from "./BotSpawner";
import {BoatAttackExecution} from "./BoatAttackExecution";
import {PseudoRandom} from "../PseudoRandom";
import {UpdateNameExecution} from "./UpdateNameExecution";


export class Executor {

    private random = new PseudoRandom(999)

    constructor(private gs: Game) {

    }

    createExecs(turn: Turn): Execution[] {
        return turn.intents.map(i => this.createExec(i))
    }

    createExec(intent: Intent): Execution {
        if (intent.type == "attack") {
            const source: Cell | null = intent.sourceX != null && intent.sourceY != null ? new Cell(intent.sourceX, intent.sourceY) : null
            const target: Cell | null = intent.targetX != null && intent.targetY != null ? new Cell(intent.targetX, intent.targetY) : null
            return new AttackExecution(
                intent.troops,
                intent.attackerID,
                intent.targetID,
                source,
                target,
            )
        } else if (intent.type == "spawn") {
            return new SpawnExecution(
                new PlayerInfo(intent.name, intent.playerType, intent.clientID, this.random.nextID()),
                new Cell(intent.x, intent.y)
            )
        } else if (intent.type == "boat") {
            return new BoatAttackExecution(
                intent.attackerID,
                intent.targetID,
                new Cell(intent.x, intent.y),
                intent.troops
            )
        } else if (intent.type == "updateName") {
            return new UpdateNameExecution(
                intent.name,
                intent.clientID
            )
        } else {
            throw new Error(`intent type ${intent} not found`)
        }
    }


    spawnBots(numBots: number): Execution[] {
        return new BotSpawner(this.gs).spawnBots(numBots).map(i => this.createExec(i))
    }
}