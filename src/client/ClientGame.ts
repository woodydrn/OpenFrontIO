import {Executor} from "../core/execution/ExecutionManager";
import {Cell, MutableGame, PlayerEvent, PlayerID, MutablePlayer, TileEvent, Player, Game, BoatEvent, Tile} from "../core/Game";
import {createGame} from "../core/GameImpl";
import {EventBus} from "../core/EventBus";
import {Config} from "../core/configuration/Config";
import {GameRenderer} from "./graphics/GameRenderer";
import {InputHandler, MouseUpEvent, ZoomEvent, DragEvent, MouseDownEvent} from "./InputHandler"
import {ClientID, ClientIntentMessageSchema, ClientJoinMessageSchema, ClientLeaveMessageSchema, ClientMessageSchema, GameID, Intent, ServerMessage, ServerMessageSchema, ServerSyncMessage, Turn} from "../core/Schemas";
import {TerrainMap} from "../core/TerrainMapLoader";
import {and, bfs, dist, manhattanDist} from "../core/Util";
import {TerrainRenderer} from "./graphics/TerrainRenderer";



export function createClientGame(name: string, clientID: ClientID, gameID: GameID, config: Config, terrainMap: TerrainMap): ClientGame {
    let eventBus = new EventBus()
    let game = createGame(terrainMap, eventBus, config)
    let terrainRenderer = new TerrainRenderer(game)
    let gameRenderer = new GameRenderer(game, terrainRenderer)

    return new ClientGame(
        name,
        clientID,
        gameID,
        eventBus,
        game,
        gameRenderer,
        new InputHandler(eventBus),
        new Executor(game)
    )
}

export class ClientGame {

    private myPlayer: Player
    private turns: Turn[] = []
    private socket: WebSocket
    private isActive = false

    private currTurn = 0


    private intervalID: NodeJS.Timeout

    private isProcessingTurn = false

    constructor(
        public playerName: string,
        private id: ClientID,
        private gameID: GameID,
        private eventBus: EventBus,
        private gs: Game,
        private renderer: GameRenderer,
        private input: InputHandler,
        private executor: Executor
    ) { }

    public join() {
        const wsHost = process.env.WEBSOCKET_URL || window.location.host;
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.socket = new WebSocket(`${wsProtocol}//${wsHost}`)
        this.socket.onopen = () => {
            console.log('Connected to game server!');
            this.socket.send(
                JSON.stringify(
                    ClientJoinMessageSchema.parse({
                        type: "join",
                        gameID: this.gameID,
                        clientID: this.id,
                        lastTurn: this.turns.length
                    })
                )
            )
        };
        this.socket.onmessage = (event: MessageEvent) => {
            const message: ServerMessage = ServerMessageSchema.parse(JSON.parse(event.data))
            if (message.type == "start") {
                console.log("starting game!")
                for (const turn of message.turns) {
                    if (turn.turnNumber < this.turns.length) {
                        continue
                    }
                    this.turns.push(turn)
                }
                if (!this.isActive) {
                    this.start()
                }
                this.sendIntent(
                    {
                        type: "updateName",
                        name: this.playerName,
                        clientID: this.id
                    }
                )
            }
            if (message.type == "turn") {
                this.addTurn(message.turn)
            }
        };
        this.socket.onerror = (err) => {
            console.error('Socket encountered error: ', err, 'Closing socket');
            this.socket.close();
        };
        this.socket.onclose = (event: CloseEvent) => {
            console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
            if (!this.isActive) {
                return
            }
            if (event.code != 1000) {
                this.join()
            }
        };

    }

    public start() {
        this.isActive = true
        // TODO: make each class do this, or maybe have client intercept all requests?
        //this.eventBus.on(TickEvent, (e) => this.tick(e))
        this.eventBus.on(TileEvent, (e) => this.renderer.tileUpdate(e))
        this.eventBus.on(PlayerEvent, (e) => this.playerEvent(e))
        this.eventBus.on(BoatEvent, (e) => this.renderer.boatEvent(e))
        this.eventBus.on(MouseUpEvent, (e) => this.inputEvent(e))
        this.eventBus.on(ZoomEvent, (e) => this.renderer.onZoom(e))
        this.eventBus.on(DragEvent, (e) => this.renderer.onMove(e))

        this.renderer.initialize()
        this.input.initialize()
        this.gs.addExecution(...this.executor.spawnBots(this.gs.config().numBots()))

        this.intervalID = setInterval(() => this.tick(), 10);
    }

    public stop() {
        clearInterval(this.intervalID)
        this.isActive = false
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log('on stop: leaving game')
            const msg = ClientLeaveMessageSchema.parse({
                type: "leave",
                clientID: this.id,
                gameID: this.gameID,
            })
            this.socket.send(JSON.stringify(msg))
        } else {
            console.log('WebSocket is not open. Current state:', this.socket.readyState);
            console.log('attempting reconnect')
        }
    }

    public addTurn(turn: Turn): void {
        if (this.turns.length != turn.turnNumber) {
            console.error(`got wrong turn have turns ${this.turns.length}, received turn ${turn.turnNumber}`)
        }
        this.turns.push(turn)
    }

    public tick() {
        if (this.currTurn >= this.turns.length || this.isProcessingTurn) {
            return
        }
        this.isProcessingTurn = true
        this.gs.addExecution(...this.executor.createExecs(this.turns[this.currTurn]))
        this.gs.tick()
        this.renderer.tick()
        this.currTurn++
        this.isProcessingTurn = false
    }

    private playerEvent(event: PlayerEvent) {
        console.log('received new player event!')
        if (event.player.clientID() == this.id) {
            console.log('setting name')
            this.myPlayer = event.player
        }
        this.renderer.playerEvent(event)
    }

    private inputEvent(event: MouseDownEvent) {
        // if (this.turns.length < this.config.turnsUntilGameStart()) {
        //     return
        // }
        if (!this.isActive) {
            return
        }
        const cell = this.renderer.screenToWorldCoordinates(event.x, event.y)
        if (!this.gs.isOnMap(cell)) {
            return
        }
        const tile = this.gs.tile(cell)
        if (tile.isLand() && !tile.hasOwner() && this.gs.inSpawnPhase()) {
            this.sendSpawnIntent(cell)
            return
        }
        if (this.gs.inSpawnPhase()) {
            return
        }
        if (this.myPlayer == null) {
            return
        }

        const owner = tile.owner()
        const targetID = owner.isPlayer() ? owner.id() : null;

        if (tile.owner() == this.myPlayer) {
            return
        }

        if (tile.hasOwner()) {
            // Attack Player
            if (tile.isLand()) {
                if (this.myPlayer.sharesBorderWith(tile.owner())) {
                    this.sendAttackIntent(targetID, cell, this.gs.config().attackAmount(this.myPlayer, owner))
                } else if (owner.isPlayer()) {
                    console.log('going to send boat')
                    this.sendBoatAttackIntent(targetID, cell, this.gs.config().boatAttackAmount(this.myPlayer, owner))
                }
            }
            return
        }



        // Attack Terra Nullius
        if (tile.isLand()) {

            const neighbors = Array.from(bfs(tile, and((r, t) => t.isLand(), dist(100))));
            for (const n of neighbors) {
                if (this.myPlayer.borderTiles().has(n)) {
                    this.sendAttackIntent(targetID, cell, this.gs.config().attackAmount(this.myPlayer, owner))
                    return
                }
            }

            const tn = Array.from(bfs(tile, dist(30)))
                .filter(t => t.isOceanShore())
                .filter(t => !t.hasOwner())
                .sort((a, b) => manhattanDist(tile.cell(), a.cell()) - manhattanDist(tile.cell(), b.cell()))
            if (tn.length > 0) {
                this.sendBoatAttackIntent(targetID, tn[0].cell(), this.gs.config().boatAttackAmount(this.myPlayer, owner))
            } else {
                this.sendAttackIntent(targetID, cell, this.gs.config().attackAmount(this.myPlayer, owner))
            }
        }

        if (tile.isOcean()) {
            const bordersOcean = Array.from(this.myPlayer.borderTiles()).filter(t => t.isOceanShore()).length > 0
            if (!bordersOcean) {
                return
            }
            const tn = Array.from(bfs(tile, dist(3)))
                .filter(t => t.isOceanShore())
                .filter(t => !t.hasOwner())
                .sort((a, b) => manhattanDist(tile.cell(), a.cell()) - manhattanDist(tile.cell(), b.cell()))
            if (tn.length > 0) {
                this.sendBoatAttackIntent(targetID, tn[0].cell(), this.gs.config().boatAttackAmount(this.myPlayer, owner))
            }
        }
    }

    private sendSpawnIntent(cell: Cell) {
        this.sendIntent({
            type: "spawn",
            clientID: this.id,
            name: this.playerName,
            isBot: false,
            x: cell.x,
            y: cell.y
        })
    }

    private sendAttackIntent(targetID: PlayerID, cell: Cell, troops: number) {
        this.sendIntent({
            type: "attack",
            clientID: this.id,
            attackerID: this.myPlayer.id(),
            targetID: targetID,
            troops: troops,
            targetX: cell.x,
            targetY: cell.y
        })
    }

    private sendBoatAttackIntent(targetID: PlayerID, cell: Cell, troops: number) {
        this.sendIntent({
            type: "boat",
            clientID: this.id,
            attackerID: this.myPlayer.id(),
            targetID: targetID,
            troops: troops,
            x: cell.x,
            y: cell.y,
        })
    }

    private sendIntent(intent: Intent) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const msg = ClientIntentMessageSchema.parse({
                type: "intent",
                clientID: this.id,
                gameID: this.gameID,
                intent: intent
            })
            this.socket.send(JSON.stringify(msg))
        } else {
            console.log('WebSocket is not open. Current state:', this.socket.readyState);
            console.log('attempting reconnect')
        }
    }

}