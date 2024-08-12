import {Executor} from "../core/execution/Executor";
import {Cell, ClientID, MutableGame, LobbyID, PlayerEvent, PlayerID, PlayerInfo, MutablePlayer, TerrainMap, TileEvent, Player, Game, BoatEvent, TerrainTypes} from "../core/Game";
import {createGame} from "../core/GameImpl";
import {Ticker, TickEvent} from "../core/Ticker";
import {EventBus} from "../core/EventBus";
import {Config} from "../core/configuration/Config";
import {GameRenderer} from "./graphics/GameRenderer";
import {InputHandler, MouseUpEvent, ZoomEvent, DragEvent, MouseDownEvent} from "./InputHandler"
import {ClientIntentMessageSchema, ClientJoinMessageSchema, ClientMessageSchema, ServerMessage, ServerMessageSchema, ServerSyncMessage, Turn} from "../core/Schemas";



export function createClientGame(name: string, clientID: ClientID, lobbyID: LobbyID, config: Config, terrainMap: TerrainMap): ClientGame {
    let eventBus = new EventBus()
    let gs = createGame(terrainMap, eventBus)
    let gameRenderer = new GameRenderer(gs, config.theme(), document.createElement("canvas"))
    let ticker = new Ticker(config.tickIntervalMs(), eventBus)

    return new ClientGame(
        name,
        clientID,
        lobbyID,
        ticker,
        eventBus,
        gs,
        gameRenderer,
        new InputHandler(eventBus),
        new Executor(gs, config.player()),
        config
    )
}

export class ClientGame {

    private myPlayer: Player
    private turns: Turn[] = []
    private socket: WebSocket
    private isActive = false

    private ticksPerTurn = 1

    private ticksThisTurn = 0
    private currTurn = 0

    private spawned = false

    private intervalID: NodeJS.Timeout

    constructor(
        private playerName: string,
        private id: ClientID,
        private gameID: LobbyID,
        private ticker: Ticker,
        private eventBus: EventBus,
        private gs: Game,
        private renderer: GameRenderer,
        private input: InputHandler,
        private executor: Executor,
        private config: Config
    ) { }

    public joinLobby() {
        this.socket = new WebSocket(`ws://localhost:3000`)
        this.socket.onopen = () => {
            console.log('Connected to game server!');
            this.socket.send(
                JSON.stringify(
                    ClientJoinMessageSchema.parse({
                        type: "join",
                        lobbyID: this.gameID,
                        clientID: this.id
                    })
                )
            )
        };
        this.socket.onmessage = (event: MessageEvent) => {
            const message: ServerMessage = ServerMessageSchema.parse(JSON.parse(event.data))
            if (message.type == "start") {
                console.log("starting game!")
                this.start()
            }
            if (message.type == "turn") {
                if (message.turn.intents)
                    this.addTurn(message.turn)
            }
        };
    }

    public start() {
        this.isActive = true
        console.log('starting game!')
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
        this.executor.spawnBots(1000)


        this.intervalID = setInterval(() => this.tick(), 10);
    }

    public stop() {
        clearInterval(this.intervalID)
        this.isActive = false
    }

    public addTurn(turn: Turn): void {
        this.turns.push(turn)
    }

    public tick() {
        if (this.ticksThisTurn >= this.ticksPerTurn) {
            if (this.currTurn >= this.turns.length) {
                return
            }
            this.executor.addTurn(this.turns[this.currTurn])
            this.currTurn++
            this.ticksThisTurn = 0
        }
        this.ticksThisTurn++
        console.log('client ticking')
        this.gs.tick()
        this.renderer.tick()
    }

    private playerEvent(event: PlayerEvent) {
        console.log('received new player event!')
        // TODO: what if multiple players has same name
        if (event.player.info().name == this.playerName) {
            console.log('setting name')
            this.myPlayer = event.player
        }
        this.renderer.playerEvent(event)
    }

    private inputEvent(event: MouseDownEvent) {
        if (!this.isActive) {
            return
        }
        const cell = this.renderer.screenToWorldCoordinates(event.x, event.y)
        if (!this.gs.isOnMap(cell)) {
            return
        }
        const tile = this.gs.tile(cell)
        if (!tile.hasOwner() && !this.spawned && this.myPlayer == null) {
            this.sendSpawnIntent(cell)
            this.spawned = true
            return
        }
        if (!this.spawned || this.myPlayer == null) {
            return
        }

        const owner = tile.owner()
        const targetID = owner.isPlayer() ? owner.id() : null
        if (tile.owner() != this.myPlayer && tile.terrain() == TerrainTypes.Land) {
            if (this.myPlayer.sharesBorderWith(tile.owner())) {
                this.sendAttackIntent(targetID, cell, this.config.player().attackAmount(this.myPlayer, owner))
            } else {
                // TODO verify on ocean
                console.log('going to send boat')
                this.sendBoatAttackIntent(targetID, cell, this.config.player().boatAttackAmount(this.myPlayer, owner))
            }
        }

    }

    private sendSpawnIntent(cell: Cell) {
        const spawn = JSON.stringify(
            ClientIntentMessageSchema.parse({
                type: "intent",
                clientID: this.id,
                gameID: this.gameID,
                intent: {
                    type: "spawn",
                    name: this.playerName,
                    isBot: false,
                    x: cell.x,
                    y: cell.y
                }
            })
        )
        console.log(spawn)
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log(`seding spawn intent: ${spawn}`)
            this.socket.send(spawn)
        } else {
            console.log('WebSocket is not open. Current state:', this.socket.readyState);
        }
    }

    private sendAttackIntent(targetID: PlayerID, cell: Cell, troops: number) {
        const attack = JSON.stringify(
            ClientIntentMessageSchema.parse({
                type: "intent",
                clientID: this.id,
                gameID: this.gameID,
                intent: {
                    type: "attack",
                    attackerID: this.myPlayer.id(),
                    targetID: targetID,
                    troops: troops,
                    targetX: cell.x,
                    targetY: cell.y
                }
            })
        )
        console.log(attack)
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log(`sending attack intent: ${attack}`)
            this.socket.send(attack)
        } else {
            console.log('WebSocket is not open. Current state:', this.socket.readyState);
        }
    }

    private sendBoatAttackIntent(targetID: PlayerID, cell: Cell, troops: number) {
        const attack = JSON.stringify(
            ClientIntentMessageSchema.parse({
                type: "intent",
                clientID: this.id,
                gameID: this.gameID,
                intent: {
                    type: "boat",
                    attackerID: this.myPlayer.id(),
                    targetID: targetID,
                    troops: troops,
                    x: cell.x,
                    y: cell.y,
                }
            })
        )
        console.log(attack)
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log(`sending boat attack intent: ${attack}`)
            this.socket.send(attack)
        } else {
            console.log('WebSocket is not open. Current state:', this.socket.readyState);
        }
    }

}