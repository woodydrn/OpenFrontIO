import {functional} from "typia";
import {Cell, Tile} from "./Game";

export function manhattanDist(c1: Cell, c2: Cell): number {
    return Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y);
}

export function manhattenDistWrapped(c1: Cell, c2: Cell, width: number): number {
    // Calculate x distance
    let dx = Math.abs(c1.x - c2.x);
    // Check if wrapping around the x-axis is shorter
    dx = Math.min(dx, width - dx);

    // Calculate y distance (no wrapping for y-axis)
    let dy = Math.abs(c1.y - c2.y);

    // Return the sum of x and y distances
    return dx + dy;
}

export function within(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function dist(dist: number): (root: Tile, tile: Tile) => boolean {
    return (root: Tile, n: Tile) => manhattanDist(root.cell(), n.cell()) <= dist;
}

export function and(x: (root: Tile, tile: Tile) => boolean, y: (root: Tile, tile: Tile) => boolean): (root: Tile, tile: Tile) => boolean {
    return (root: Tile, tile: Tile) => x(root, tile) && y(root, tile)
}

export function bfs(tile: Tile, filter: (root: Tile, tile: Tile) => boolean): Set<Tile> {
    const seen = new Set<Tile>
    const q: Tile[] = []
    q.push(tile)
    while (q.length > 0) {
        const curr = q.pop()
        seen.add(curr)
        for (const n of curr.neighbors()) {
            if (!seen.has(n) && filter(tile, n)) {
                q.push(n)
            }
        }
    }
    return seen
}

export function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}