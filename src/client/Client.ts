import {getConfig} from "../core/configuration/Config";
import {defaultConfig} from "../core/configuration/DefaultConfig";
import {devConfig} from "../core/configuration/DevConfig";
import {PseudoRandom} from "../core/PseudoRandom";
import {GameID, Lobby, ServerMessage, ServerMessageSchema} from "../core/Schemas";
import {loadTerrainMap, TerrainMap} from "../core/TerrainMapLoader";
import {ClientGame, createClientGame} from "./ClientGame";
import backgroundImage from '../../resources/images/PastelMap.png';
import favicon from '../../resources/images/Favicon.png';

import './styles.css';



// import WebSocket from 'ws';

class Client {
    private hasJoined = false

    private socket: WebSocket | null = null;
    private terrainMap: Promise<TerrainMap>
    private game: ClientGame

    private lobbiesContainer: HTMLElement | null;
    private lobbiesInterval: NodeJS.Timeout | null = null;
    private isLobbyHighlighted: boolean = false;

    private random = new PseudoRandom(1234)

    constructor() {
        this.lobbiesContainer = document.getElementById('lobbies-container');
    }

    initialize(): void {
        setFavicon()
        this.terrainMap = loadTerrainMap()
        this.startLobbyPolling()
        setupUsernameCallback((username) => {
            console.log('Username updated:', username);
            if (this.game != null) {
                this.game.playerName = username
            }
        });
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
        if (lobbies.length === 0) {
            document.getElementById('lobby-button').style.display = 'none';
            return;
        }

        const lobby = lobbies[0];
        const lobbyButton = document.getElementById('lobby-button');
        const nameElement = document.getElementById('lobby-name');
        const timerElement = document.getElementById('lobby-timer');
        const playerCountElement = document.getElementById('player-count');

        if (lobbyButton) {
            lobbyButton.style.display = 'flex';
            lobbyButton.onclick = () => this.joinLobby(lobby);

            // Preserve the highlighted state
            lobbyButton.classList.toggle('highlighted', this.isLobbyHighlighted);
        }

        if (nameElement) nameElement.textContent = `Game ${lobby.id}`;
        if (timerElement) {
            const timeRemaining = Math.max(0, Math.floor((lobby.startTime - Date.now()) / 1000));
            timerElement.textContent = `Starts in: ${timeRemaining}s`;
        }
        if (playerCountElement) playerCountElement.textContent = `Players: ${lobby.numClients}`;
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

    private joinLobby(lobby: Lobby) {
        const lobbyButton = document.getElementById('lobby-button');
        if (lobbyButton) {
            this.isLobbyHighlighted = !this.isLobbyHighlighted;
            lobbyButton.classList.toggle('highlighted', this.isLobbyHighlighted);
        }
        if (!this.isLobbyHighlighted) {
            this.game.stop()
            this.game = null
            return
        }

        if (this.game != null) {
            return;
        }
        this.terrainMap.then(tm => {
            this.game = createClientGame(getUsername(), new PseudoRandom(Date.now()).nextID(), lobby.id, getConfig(), tm);
            this.game.join();
            const g = this.game;
            window.addEventListener('beforeunload', function (event) {
                console.log('Browser is closing');
                g.stop();
            });
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

function setupUsernameCallback(callback: (username: string) => void): void {
    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            const username = getUsername();
            callback(username);
        });
    } else {
        console.error('Username input element not found');
    }
}




// Initialize the client when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Client().initialize();
});

document.body.style.backgroundImage = `url(${backgroundImage})`;

function setFavicon(): void {
    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = favicon;
    document.head.appendChild(link);
}