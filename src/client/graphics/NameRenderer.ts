import PriorityQueue from "priority-queue-typescript"
import {Cell, Game, Player} from "../../core/Game"
import {PseudoRandom} from "../../core/PseudoRandom"
import {Theme} from "../../core/configuration/Config"
import {calculateBoundingBox} from "../NameBoxCalculator"

class RenderInfo {
    constructor(public player: Player, public lastRendered: number, public location: Cell, public fontSize: number) { }
}

export class NameRenderer {

    private lastChecked = 0
    private refreshRate = 1000

    private rand = new PseudoRandom(10)
    private renderInfo: Map<Player, RenderInfo> = new Map()
    private context: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement
    private toRender: PriorityQueue<RenderInfo> = new PriorityQueue<RenderInfo>(1000, (a: RenderInfo, b: RenderInfo) => a.lastRendered - b.lastRendered);
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

    public render(mainContex: CanvasRenderingContext2D, scale: number, uppperLeft: Cell, bottomRight: Cell) {
        // mainContex.drawImage(
        //     this.canvas,
        //     -this.game.width() / 2,
        //     -this.game.height() / 2,
        //     this.game.width(),
        //     this.game.height()
        // )
        for (const render of this.toRender) {
            if (render.player.isAlive()) {
                this.renderPlayerInfo(render, mainContex, scale, uppperLeft, bottomRight)
            }
        }
    }

    public tick() {
        const now = Date.now()
        if (now - this.lastChecked > this.refreshRate) {
            this.lastChecked = now
            for (const player of this.game.players()) {
                if (!this.seenPlayers.has(player)) {
                    this.toRender.add(new RenderInfo(player, 0, null, null))
                    this.seenPlayers.add(player)
                }
            }
        }

        while (!this.toRender.empty() && now - this.toRender.peek().lastRendered > this.refreshRate) {
            const renderInfo = this.toRender.poll()
            this.calculateRenderInfo(renderInfo)
            renderInfo.lastRendered = now + this.rand.nextInt(-50, 50)
            this.toRender.add(renderInfo)
        }

    }

    calculateRenderInfo(render: RenderInfo): boolean {

        let wasUpdated = false

        render.lastRendered = Date.now() + this.rand.nextInt(0, 100)
        wasUpdated = true

        const box = calculateBoundingBox(render.player)
        const centerX = box.min.x + ((box.max.x - box.min.x) / 2)
        const centerY = box.min.y + ((box.max.y - box.min.y) / 2)
        render.location = new Cell(centerX, centerY)
        render.fontSize = Math.max(Math.min(box.max.x - box.min.x, box.max.y - box.min.y) / render.player.info().name.length / 2, 1.5)
        return wasUpdated
    }

    renderPlayerInfo(render: RenderInfo, context: CanvasRenderingContext2D, scale: number, uppperLeft: Cell, bottomRight: Cell) {
        if (render.fontSize * scale < 10) {
            return
        }

        const nameCenterX = Math.floor(render.location.x - this.game.width() / 2)
        const nameCenterY = Math.floor(render.location.y - this.game.height() / 2)

        if (render.location.x < uppperLeft.x || render.location.x > bottomRight.x || render.location.y < uppperLeft.y || render.location.y > bottomRight.y) {
            return
        }


        context.textRendering = "optimizeSpeed";

        context.font = `bold ${render.fontSize}px ${this.theme.font()}`;
        context.fillStyle = this.theme.playerInfoColor(render.player.id()).toHex();
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.fillText(render.player.info().name, nameCenterX, nameCenterY - render.fontSize / 2);
        context.fillText(String(Math.floor(render.player.troops())), nameCenterX, nameCenterY + render.fontSize);
    }
}