import {getConfig} from "../core/configuration/Config";
import {defaultConfig} from "../core/configuration/DefaultConfig";
import {devConfig} from "../core/configuration/DevConfig";
import {TerrainMap} from "../core/Game";
import {PseudoRandom} from "../core/PseudoRandom";
import {GameID, Lobby, ServerMessage, ServerMessageSchema} from "../core/Schemas";
import {loadTerrainMap} from "../core/TerrainMapLoader";
import {ClientGame, createClientGame} from "./ClientGame";
import {v4 as uuidv4} from 'uuid';

// import WebSocket from 'ws';

class Client {
    private hasJoined = false

    private socket: WebSocket | null = null;
    private terrainMap: Promise<TerrainMap>
    private game: ClientGame

    private lobbiesContainer: HTMLElement | null;
    private lobbiesInterval: NodeJS.Timeout | null = null;

    private random = new PseudoRandom(1234)

    constructor() {
        this.lobbiesContainer = document.getElementById('lobbies-container');
    }

    initialize(): void {
        this.terrainMap = loadTerrainMap()
        this.startLobbyPolling()
    }

    private startLobbyPolling(): void {
        this.fetchAndUpdateLobbies(); // Fetch immediately on start
        this.lobbiesInterval = setInterval(() => this.fetchAndUpdateLobbies(), 1000);
    }

    private async fetchAndUpdateLobbies(): Promise<void> {
        try {
            const lobbies = await this.fetchLobbies();
            this.updateLobbiesDisplay(lobbies);
        } catch (error) {
            console.error('Error fetching and updating lobbies:', error);
        }
    }

    private updateLobbiesDisplay(lobbies: Lobby[]): void {
        if (!this.lobbiesContainer) return;

        this.lobbiesContainer.innerHTML = ''; // Clear existing lobbies

        lobbies.forEach(lobby => {
            const button = document.createElement('button');
            button.textContent = `Join Lobby ${lobby.id} (${Math.floor((lobby.startTime - Date.now()) / 1000)}s)`;
            button.onclick = () => this.joinLobby(lobby);
            this.lobbiesContainer.appendChild(button);
        });

        // // Join first lobby
        // if (!this.hasJoined && lobbies.length > 0) {
        //     this.hasJoined = true
        //     console.log(`joining lobby ${lobbies[0].id}`)
        //     this.joinLobby(lobbies[0].id)
        // }
    }

    async fetchLobbies(): Promise<Lobby[]> {
        const url = '/lobbies';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            }
            const data = await response.json();
            return data.lobbies;
        } catch (error) {
            console.error('Error fetching lobbies:', error);
            throw error;
        }
    }

    private async joinLobby(lobby: Lobby) {
        clearInterval(this.lobbiesInterval)
        this.lobbiesContainer.innerHTML = `Joining: ${lobby.id}`; // Clear existing lobbies
        this.terrainMap.then((map) => {
            if (this.game != null) {
                return
            }
            // TODO make id more random, if two player join same millisecond get same id.
            this.game = createClientGame(getUsername(), new PseudoRandom(Date.now()).nextID(), lobby.id, getConfig(), map)
            this.game.join()
        })
    }
}

function getUsername(): string {
    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    if (usernameInput) {
        const trimmedValue = usernameInput.value.trim();
        return trimmedValue || 'Anon'; // Return 'Anon' if the trimmed value is empty
    }
    return 'Anon'; // Return 'Anon' if the input element is not found
}

// Initialize the client when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Client().initialize();
});