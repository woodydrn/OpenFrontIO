import {Theme} from "../../core/configuration/Config";
import {Game} from "../../core/Game";
import {ClientID} from "../../core/Schemas";
import {renderTroops} from "./Utils";

export class UIRenderer {
    private exitButton: HTMLButtonElement;

    constructor(private game: Game, private theme: Theme, private clientID: ClientID) {

    }

    init() {
        this.createExitButton()
    }

    createExitButton() {
        this.exitButton = document.createElement('button');
        this.exitButton.innerHTML = '&#10005;'; // HTML entity for "×" (multiplication sign)
        this.exitButton.style.position = 'fixed';
        this.exitButton.style.top = '20px';
        this.exitButton.style.right = '20px';
        this.exitButton.style.zIndex = '1000';
        this.exitButton.style.width = '40px';
        this.exitButton.style.height = '40px';
        this.exitButton.style.fontSize = '20px';
        this.exitButton.style.fontWeight = 'bold';
        this.exitButton.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; // More translucent red
        this.exitButton.style.color = 'white';
        this.exitButton.style.border = 'none';
        this.exitButton.style.borderRadius = '50%';
        this.exitButton.style.cursor = 'pointer';
        this.exitButton.style.display = 'flex';
        this.exitButton.style.justifyContent = 'center';
        this.exitButton.style.alignItems = 'center';
        this.exitButton.style.transition = 'background-color 0.3s';

        this.exitButton.addEventListener('mouseover', () => {
            this.exitButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Less translucent on hover
        });

        this.exitButton.addEventListener('mouseout', () => {
            this.exitButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Back to more translucent
        });

        this.exitButton.addEventListener('click', () => this.onExitButtonClick());
        document.body.appendChild(this.exitButton);
    }

    render(context) {
        const p = this.game.players().find(p => p.clientID() == this.clientID);
        let troopCount = p ? `${renderTroops(p.troops())}` : '';

        context.save();
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        const x = 65 + 18 * (troopCount.length - 2); // Right edge of the text area
        const y = 40; // Distance from the top

        context.font = `bold ${60}px ${this.theme.font()}`;
        context.fillText(troopCount, x, y);
        context.restore();
    }

    onExitButtonClick() {
        console.log('Button clicked!');
        window.location.reload();
        // Add your button action here
    }

}