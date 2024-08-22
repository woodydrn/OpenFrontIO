import {getConfig} from "../core/configuration/Config";
import {defaultConfig} from "../core/configuration/DefaultConfig";
import {devConfig} from "../core/configuration/DevConfig";
import {PseudoRandom} from "../core/PseudoRandom";
import {GameID, Lobby, ServerMessage, ServerMessageSchema} from "../core/Schemas";
import {loadTerrainMap, TerrainMap} from "../core/TerrainMapLoader";
import {ClientGame, createClientGame} from "./ClientGame";
import {v4 as uuidv4} from 'uuid';
import backgroundImage from '../../resources/images/empty_map.png';
import './styles.css';



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
            button.className = 'lobby-button';

            const nameElement = document.createElement('div');
            nameElement.className = 'lobby-name';
            nameElement.textContent = `Lobby ${lobby.id}`;

            const timerElement = document.createElement('div');
            timerElement.className = 'lobby-timer';
            const timeRemaining = Math.max(0, Math.floor((lobby.startTime - Date.now()) / 1000));
            timerElement.textContent = `Starts in: ${timeRemaining}s`;

            const playerCountElement = document.createElement('div');
            playerCountElement.className = 'player-count';
            playerCountElement.textContent = `Players: ${lobby.numClients}`

            button.appendChild(nameElement);
            button.appendChild(timerElement);
            button.appendChild(playerCountElement);

            button.onclick = () => this.joinLobby(lobby);
            this.lobbiesContainer.appendChild(button);
        });
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
        clearInterval(this.lobbiesInterval);

        if (this.lobbiesContainer) {
            // Clear existing content
            this.lobbiesContainer.innerHTML = '';

            // Ensure the container takes up the full height of the viewport
            this.lobbiesContainer.style.display = 'flex';
            this.lobbiesContainer.style.justifyContent = 'center';
            this.lobbiesContainer.style.alignItems = 'center';
            this.lobbiesContainer.style.minHeight = '100vh';

            // Create and add the joining message
            const joiningMessage = document.createElement('div');
            joiningMessage.textContent = `Joining: ${lobby.id}`;
            joiningMessage.className = 'joining-message';

            this.lobbiesContainer.appendChild(joiningMessage);
        }

        this.terrainMap.then((map) => {
            if (this.game != null) {
                return;
            }
            this.game = createClientGame(getUsername(), new PseudoRandom(Date.now()).nextID(), lobby.id, getConfig(), map);
            this.game.join();
            const g = this.game
            window.addEventListener('beforeunload', function (event) {
                // Your function logic here
                console.log('Browser is closing');
                g.stop()
            });
        });
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

document.body.style.backgroundImage = `url(${backgroundImage})`;

