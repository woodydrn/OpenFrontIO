import {GameID, LobbyID} from "../core/Game";
import {Client} from "./Client";
import {Lobby} from "./Lobby";
import {GameServer} from "./GameServer";
import {Config} from "../core/configuration/Config";
import {defaultConfig} from "../core/configuration/DefaultConfig";
import {PseudoRandom} from "../core/PseudoRandom";

export class GameManager {

    private lastNewLobby: number = 0

    private _lobbies: Map<LobbyID, Lobby> = new Map()

    private games: Map<GameID, GameServer> = new Map()

    private random = new PseudoRandom(123)

    constructor(private settings: Config) { }


    public hasLobby(lobbyID: LobbyID): boolean {
        return this._lobbies.has(lobbyID)
    }

    public addClientToLobby(client: Client, lobbyID: LobbyID) {
        this._lobbies.get(lobbyID).addClient(client)
    }

    addLobby(lobby: Lobby) {
        this._lobbies.set(lobby.id, lobby)
    }

    lobby(id: LobbyID): Lobby {
        return this._lobbies.get(id)
    }

    lobbies(): Lobby[] {
        return Array.from(this._lobbies.values())
    }

    addGame(game: GameServer) {
        this.games.set(game.id, game)
    }

    tick() {
        const now = Date.now()

        const active = this.lobbies().filter(l => !l.isExpired(now - 2000))
        const expired = this.lobbies().filter(l => l.isExpired(now - 2000))
        this._lobbies = new Map(active.map(lobby => [lobby.id, lobby]));
        expired.forEach(lobby => {
            const game = new GameServer(lobby.id, now, lobby.clients, this.settings)
            this.games.set(game.id, game)
            game.start()
        })

        if (now > this.lastNewLobby + this.settings.lobbyCreationRate()) {
            this.lastNewLobby = now
            this.addLobby(new Lobby(this.random.nextID(), this.settings.lobbyLifetime()))
        }

        const activeGames: Map<GameID, GameServer> = new Map()
        for (const [id, game] of this.games) {
            if (game.isActive()) {
                activeGames.set(id, game)
            } else {
                game.endGame()
            }
        }
        //this.games = activeGames
    }
}