import {Colord} from "colord";
import {Cell, MutableGame, Game, PlayerEvent, Tile, TileEvent, Player, Execution, BoatEvent} from "../../core/Game";
import {Theme} from "../../core/Settings";
import {DragEvent, ZoomEvent} from "../InputHandler";
import {calculateBoundingBox, placeName} from "../NameBoxCalculator";
import {PseudoRandom} from "../../core/PseudoRandom";
import {BoatAttackExecution} from "../../core/execution/BoatAttackExecution";
import {NameRenderer} from "./NameRenderer";



export class GameRenderer {
	private tempCanvas;

	private scale: number = .8
	private offsetX: number = 0
	private offsetY: number = 100

	private context: CanvasRenderingContext2D

	private imageData: ImageData

	private nameRenderer: NameRenderer;


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


		requestAnimationFrame(() => this.renderGame());
	}

	initImageData() {
		this.gs.forEachTile((tile) => {
			//const color = this.theme.terrainColor(tile.terrain())
			this.paintTile(tile)
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

		if (this.tempCanvas != null) {
			// Draw the game content from the temp canvas
			this.context.drawImage(
				this.tempCanvas,
				-this.gs.width() / 2,
				-this.gs.height() / 2,
				this.gs.width(),
				this.gs.height()
			);
		}
		const [upperLeft, bottomRight] = this.boundingRect()
		this.nameRenderer.render(this.context, this.scale, upperLeft, bottomRight)

		// const paths = this.gs.executions().map(e => e as Execution).filter(e => e instanceof BoatAttackExecution).map(e => e as BoatAttackExecution).filter(e => e.path != null).map(e => e.path)
		// paths.forEach(p => {
		// 	p.forEach(t => {
		// 		this.paintCell(t.cell(), new Colord({r: 255, g: 255, b: 255}))
		// 	})
		// })

		requestAnimationFrame(() => this.renderGame());
	}

	tick() {
		// Create a temporary canvas for the game content
		this.tempCanvas = document.createElement('canvas');
		const tempCtx = this.tempCanvas.getContext('2d');
		this.tempCanvas.width = this.gs.width();
		this.tempCanvas.height = this.gs.height();

		// Put the ImageData on the temp canvas
		tempCtx.putImageData(this.imageData, 0, 0);
		this.nameRenderer.tick()
	}

	tileUpdate(event: TileEvent) {
		this.paintTile(event.tile)
		event.tile.neighbors().forEach(t => this.paintTile(t))
	}

	playerEvent(event: PlayerEvent) {
	}

	boatEvent(event: BoatEvent) {
		this.paintCell(event.boat.tile().cell(), new Colord({r: 255, g: 255, b: 255}))
		this.gs.neighbors(event.boat.tile()).forEach(t => this.paintTile(t))
	}

	resize(width: number, height: number): void {
		this.canvas.width = Math.ceil(width / window.devicePixelRatio);
		this.canvas.height = Math.ceil(height / window.devicePixelRatio);
	}

	paintTile(tile: Tile) {
		let terrainColor = this.theme.terrainColor(tile.terrain())
		this.paintCell(tile.cell(), terrainColor)
		const owner = tile.owner()
		if (owner.isPlayer()) {
			if (tile.isBorder()) {
				this.paintCell(tile.cell(), this.theme.borderColor(owner.id()))
			} else {
				this.paintCell(tile.cell(), this.theme.territoryColor(owner.id()))
			}
		}
	}

	paintCell(cell: Cell, color: Colord) {
		const index = (cell.y * this.gs.width()) + cell.x
		const offset = index * 4
		this.imageData.data[offset] = color.rgba.r;
		this.imageData.data[offset + 1] = color.rgba.g;
		this.imageData.data[offset + 2] = color.rgba.b;
		this.imageData.data[offset + 3] = color.rgba.a * 255 | 0
	}

	onZoom(event: ZoomEvent) {
		const oldScale = this.scale;
		const zoomFactor = 1 + event.delta / 600;
		this.scale *= zoomFactor;

		// Clamp the scale to prevent extreme zooming
		this.scale = Math.max(0.1, Math.min(10, this.scale));

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