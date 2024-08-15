import {EventBus} from "../core/EventBus";
import {ClientID, GameID} from "../core/Game";
import {ClientMessage, ClientMessageSchema, Intent, ServerStartGameMessage, ServerStartGameMessageSchema, ServerTurnMessageSchema, Turn} from "../core/Schemas";
import {Config} from "../core/configuration/Config";
import {Ticker, TickEvent} from "../core/Ticker";
import {Client} from "./Client";

export class GameServer {

    private turns: Turn[] = []
    private intents: Intent[] = []
    private lastUpdate = 0;

    constructor(
        public readonly id: GameID,
        private startTime: number,
        private clients: Map<ClientID, Client>,
        private settings: Config,
    ) {
        this.lastUpdate = Date.now()
    }

    public start() {
        this.clients.forEach(c => {
            c.ws.on('message', (message: string) => {
                this.lastUpdate = Date.now()
                const clientMsg: ClientMessage = ClientMessageSchema.parse(JSON.parse(message))
                if (clientMsg.type == "intent") {
                    if (clientMsg.gameID == this.id) {
                        this.addIntent(clientMsg.intent)
                    } else {
                        console.warn(`client ${clientMsg.clientID} sent to wrong game`)
                    }
                }
            })
        })


        const startGame = JSON.stringify(ServerStartGameMessageSchema.parse(
            {
                type: "start"
            }
        ))
        this.clients.forEach(c => {
            c.ws.send(startGame)
        })
        setInterval(() => this.endTurn(), this.settings.turnIntervalMs());
    }

    private addIntent(intent: Intent) {
        this.intents.push(intent)
    }

    private endTurn() {
        const pastTurn: Turn = {
            turnNumber: this.turns.length,
            gameID: this.id,
            intents: this.intents
        }
        this.turns.push(pastTurn)
        this.intents = []

        const msg = JSON.stringify(ServerTurnMessageSchema.parse(
            {
                type: "turn",
                turn: pastTurn
            }
        ))
        this.clients.forEach(c => {
            c.ws.send(msg)
        })
    }

    public isActive(): boolean {
        return Date.now() - this.lastUpdate < 1000 * 60 * 5 // 5 minutes
    }

    endGame() {
        // Close all WebSocket connections
        this.clients.forEach(client => {
            client.ws.removeAllListeners('message');
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
        });
    }

}