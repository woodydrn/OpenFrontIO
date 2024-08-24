import {Colord} from "colord";
import {Cell, Game, PlayerEvent, Tile, TileEvent, Player, Execution, BoatEvent} from "../../core/Game";
import {Theme} from "../../core/configuration/Config";
import {DragEvent, ZoomEvent} from "../InputHandler";
import {NameRenderer} from "./NameRenderer";
import {bfs, manhattanDist} from "../../core/Util";
import {PseudoRandom} from "../../core/PseudoRandom";



export class GameRenderer {
	private backgroundCanvas: HTMLCanvasElement
	private territoryCanvas: HTMLCanvasElement

	private territoryContext: CanvasRenderingContext2D

	private scale: number = .8
	private offsetX: number = 0
	private offsetY: number = 100

	private context: CanvasRenderingContext2D

	private imageData: ImageData

	private nameRenderer: NameRenderer;

	private random = new PseudoRandom(123)

	constructor(private gs: Game, private theme: Theme, private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext("2d")
		this.nameRenderer = new NameRenderer(gs, theme)
	}

	initialize() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		// Set canvas style to fill the screen
		this.canvas.style.position = 'fixed';
		this.canvas.style.left = '0';
		this.canvas.style.top = '0';
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';

		this.imageData = this.context.getImageData(0, 0, this.gs.width(), this.gs.height())
		this.initImageData()
		this.nameRenderer.initialize()


		document.body.appendChild(this.canvas);
		window.addEventListener('resize', () => this.resizeCanvas());
		this.resizeCanvas();

		this.backgroundCanvas = document.createElement('canvas');
		const backgroundCtx = this.backgroundCanvas.getContext('2d');
		this.backgroundCanvas.width = this.gs.width();
		this.backgroundCanvas.height = this.gs.height();
		backgroundCtx.putImageData(this.imageData, 0, 0);


		this.territoryCanvas = document.createElement('canvas')
		this.territoryCanvas.width = this.gs.width();
		this.territoryCanvas.height = this.gs.height();
		this.territoryContext = this.territoryCanvas.getContext('2d')

		requestAnimationFrame(() => this.renderGame());
	}

	initImageData() {
		this.gs.forEachTile((tile) => {
			let terrainColor = this.theme.terrainColor(tile)
			const index = (tile.cell().y * this.gs.width()) + tile.cell().x
			const offset = index * 4
			this.imageData.data[offset] = terrainColor.rgba.r;
			this.imageData.data[offset + 1] = terrainColor.rgba.g;
			this.imageData.data[offset + 2] = terrainColor.rgba.b;
			this.imageData.data[offset + 3] = terrainColor.rgba.a * 255 | 0
		})
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		//this.redraw()
	}

	renderGame() {
		// Clear the canvas
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, this.gs.width(), this.gs.height());

		// Set background
		this.context.fillStyle = this.theme.backgroundColor().toHex();
		this.context.fillRect(0, 0, this.gs.width(), this.gs.height());

		// Disable image smoothing for pixelated effect
		if (this.scale > 3) {
			this.context.imageSmoothingEnabled = false;
		} else {
			this.context.imageSmoothingEnabled = true;
		}

		// Apply zoom and pan
		this.context.setTransform(
			this.scale,
			0,
			0,
			this.scale,
			this.gs.width() / 2 - this.offsetX * this.scale,
			this.gs.height() / 2 - this.offsetY * this.scale
		);

		// Draw the game content from the temp canvas
		this.context.drawImage(
			this.backgroundCanvas,
			-this.gs.width() / 2,
			-this.gs.height() / 2,
			this.gs.width(),
			this.gs.height()
		);

		this.context.drawImage(
			this.territoryCanvas,
			-this.gs.width() / 2,
			-this.gs.height() / 2,
			this.gs.width(),
			this.gs.height()
		)

		const [upperLeft, bottomRight] = this.boundingRect()
		this.nameRenderer.render(this.context, this.scale, upperLeft, bottomRight)

		requestAnimationFrame(() => this.renderGame());
	}

	tick() {
		this.nameRenderer.tick()
	}

	tileUpdate(event: TileEvent) {
		this.paintTerritory(event.tile)
		event.tile.neighbors().forEach(t => this.paintTerritory(t))
	}

	playerEvent(event: PlayerEvent) {
	}

	boatEvent(event: BoatEvent) {
		bfs(event.oldTile, 2).forEach(t => this.paintTerritory(t))
		if (event.boat.isActive()) {
			bfs(event.boat.tile(), 2).forEach(t => this.paintCell(t.cell(), this.theme.borderColor(event.boat.owner().id())))
			bfs(event.boat.tile(), 1).forEach(t => this.paintCell(t.cell(), this.theme.territoryColor(event.boat.owner().id())))

		}
	}

	resize(width: number, height: number): void {
		this.canvas.width = Math.ceil(width / window.devicePixelRatio);
		this.canvas.height = Math.ceil(height / window.devicePixelRatio);
	}

	paintTerritory(tile: Tile) {
		if (!tile.hasOwner()) {
			this.clearCell(tile.cell())
			return
		}
		// this.territoryContext.clearRect(tile.cell().x, tile.cell().y, 1, 1);
		if (tile.isBorder()) {
			this.territoryContext.fillStyle = this.theme.borderColor(tile.owner().id()).toRgbString()
		} else {
			this.territoryContext.fillStyle = this.theme.territoryColor(tile.owner().id()).toRgbString()
		}
		this.territoryContext.fillRect(tile.cell().x, tile.cell().y, 1, 1);
	}

	paintCell(cell: Cell, color: Colord) {
		this.territoryContext.fillStyle = color.toRgbString()
		this.territoryContext.fillRect(cell.x, cell.y, 1, 1);
	}

	clearCell(cell: Cell) {
		this.territoryContext.clearRect(cell.x, cell.y, 1, 1);
	}

	onZoom(event: ZoomEvent) {
		const oldScale = this.scale;
		const zoomFactor = 1 + event.delta / 600;
		this.scale /= zoomFactor;

		// Clamp the scale to prevent extreme zooming
		this.scale = Math.max(0.5, Math.min(20, this.scale));

		const canvasRect = this.canvas.getBoundingClientRect();
		const canvasX = event.x - canvasRect.left;
		const canvasY = event.y - canvasRect.top;

		// Calculate the world point we want to zoom towards
		const zoomPointX = (canvasX - this.gs.width() / 2) / oldScale + this.offsetX;
		const zoomPointY = (canvasY - this.gs.height() / 2) / oldScale + this.offsetY;

		// Adjust the offset
		this.offsetX = zoomPointX - (canvasX - this.gs.width() / 2) / this.scale;
		this.offsetY = zoomPointY - (canvasY - this.gs.height() / 2) / this.scale;
	}

	onMove(event: DragEvent) {
		this.offsetX -= event.deltaX / this.scale;
		this.offsetY -= event.deltaY / this.scale;
	}


	screenToWorldCoordinates(screenX: number, screenY: number): Cell {

		const canvasRect = this.canvas.getBoundingClientRect();
		const canvasX = screenX - canvasRect.left;
		const canvasY = screenY - canvasRect.top;

		// Calculate the world point we want to zoom towards
		const centerX = (canvasX - this.gs.width() / 2) / this.scale + this.offsetX;
		const centerY = (canvasY - this.gs.height() / 2) / this.scale + this.offsetY;

		const gameX = centerX + this.gs.width() / 2
		const gameY = centerY + this.gs.height() / 2

		return new Cell(Math.floor(gameX), Math.floor(gameY));
	}

	boundingRect(): [Cell, Cell] {

		// Calculate the world point we want to zoom towards
		const LeftX = (- this.gs.width() / 2) / this.scale + this.offsetX;
		const TopY = (- this.gs.height() / 2) / this.scale + this.offsetY;

		const gameLeftX = LeftX + this.gs.width() / 2
		const gameTopY = TopY + this.gs.height() / 2


		// Calculate the world point we want to zoom towards
		const rightX = (screen.width - this.gs.width() / 2) / this.scale + this.offsetX;
		const rightY = (screen.height - this.gs.height() / 2) / this.scale + this.offsetY;

		const gameRightX = rightX + this.gs.width() / 2
		const gameBottomY = rightY + this.gs.height() / 2

		return [new Cell(Math.floor(gameLeftX), Math.floor(gameTopY)), new Cell(Math.floor(gameRightX), Math.floor(gameBottomY))]
	}

}