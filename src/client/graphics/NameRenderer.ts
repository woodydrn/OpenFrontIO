import PriorityQueue from "priority-queue-typescript"
import {Cell, Game, Player} from "../../core/Game"
import {PseudoRandom} from "../../core/PseudoRandom"
import {Theme} from "../../core/configuration/Config"
import {calculateBoundingBox, placeName} from "./NameBoxCalculator"

class RenderInfo {
    public isVisible = true
    constructor(
        public player: Player,
        public lastRenderCalc: number,
        public lastBoundingCalculated: number,
        public boundingBox: {min: Cell, max: Cell},
        public location: Cell,
        public fontSize: number
    ) { }
}

export class NameRenderer {

    private lastChecked = 0
    private refreshRate = 1000

    private rand = new PseudoRandom(10)
    private renderInfo: Map<Player, RenderInfo> = new Map()
    private context: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement
    private renders: RenderInfo[] = []
    private seenPlayers: Set<Player> = new Set()

    constructor(private game: Game, private theme: Theme) {

    }


    public initialize() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.style.position = 'fixed';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.width = this.game.width();
        this.canvas.height = this.game.height();
    }

    public tick() {
        const now = Date.now()
        if (now - this.lastChecked > this.refreshRate) {
            this.lastChecked = now
            this.renders = this.renders.filter(r => r.player.isAlive())
            for (const player of this.game.players()) {
                if (player.isAlive()) {
                    if (!this.seenPlayers.has(player)) {
                        this.seenPlayers.add(player)
                        this.renders.push(new RenderInfo(player, 0, 0, null, null, 0))
                    }
                } else {
                    this.seenPlayers.delete(player)
                }
            }
        }
        for (const render of this.renders) {
            const now = Date.now()
            if (now - render.lastBoundingCalculated > this.refreshRate) {
                render.boundingBox = calculateBoundingBox(render.player);
                render.lastBoundingCalculated = now
            }
            if (render.isVisible && now - render.lastRenderCalc > this.refreshRate) {
                this.calculateRenderInfo(render)
                render.lastRenderCalc = now + this.rand.nextInt(-50, 50)
            }
        }
    }

    public render(mainContex: CanvasRenderingContext2D, scale: number, uppperLeft: Cell, bottomRight: Cell) {
        for (const render of this.renders) {
            render.isVisible = this.isVisible(render, uppperLeft, bottomRight)
            if (render.player.isAlive() && render.isVisible && render.fontSize * scale > 10) {
                this.renderPlayerInfo(render, mainContex, scale, uppperLeft, bottomRight)
            }
        }
    }

    isVisible(render: RenderInfo, min: Cell, max: Cell): boolean {
        const ratio = (max.x - min.x) / Math.max(20, (render.boundingBox.max.x - render.boundingBox.min.x))
        if (render.player.info().isBot) {
            if (ratio > 25) {
                return false
            }
        } else {
            if (ratio > 30) {
                return false
            }
        }
        if (render.boundingBox.max.x < min.x || render.boundingBox.max.y < min.y || render.boundingBox.min.x > max.x || render.boundingBox.min.y > max.y) {
            return false
        }
        return true
    }

    calculateRenderInfo(render: RenderInfo) {
        if (render.player.numTilesOwned() == 0) {
            render.fontSize = 0
            return
        }
        render.lastRenderCalc = Date.now() + this.rand.nextInt(0, 100)
        const [cell, size] = placeName(this.game, render.player)
        render.location = cell
        render.fontSize = Math.max(1, Math.floor(size))
    }

    renderPlayerInfo(render: RenderInfo, context: CanvasRenderingContext2D, scale: number, uppperLeft: Cell, bottomRight: Cell) {
        const nameCenterX = Math.floor(render.location.x - this.game.width() / 2)
        const nameCenterY = Math.floor(render.location.y - this.game.height() / 2)

        context.textRendering = "optimizeSpeed";

        context.font = `${render.fontSize}px ${this.theme.font()}`;
        context.fillStyle = this.theme.playerInfoColor(render.player.id()).toHex();
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.fillText(render.player.info().name, nameCenterX, nameCenterY - render.fontSize / 2);
        context.font = `bold ${render.fontSize}px ${this.theme.font()}`;
        let troops: string = ""
        if (render.player.troops() > 100000) {
            troops = String(Math.floor(render.player.troops() / 1000)) + "K"
        } else if (render.player.troops() > 10000) {
            troops = String((render.player.troops() / 1000).toFixed(1)) + "K"
        } else if (render.player.troops() > 1000) {
            troops = String((render.player.troops() / 1000).toFixed(2)) + "K"
        }
        else {
            troops = String(Math.floor(render.player.troops()))
        }
        context.fillText(troops, nameCenterX, nameCenterY + render.fontSize);
    }
}