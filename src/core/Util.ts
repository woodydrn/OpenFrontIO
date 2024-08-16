import {Cell} from "./Game";

export function manhattanDist(c1: Cell, c2: Cell): number {
    return Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y);
}

export function within(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}