import {Cell, Tile} from "./Game";

export function manhattanDist(c1: Cell, c2: Cell): number {
    return Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y);
}

export function within(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function bfs(tile: Tile, dist: number): Set<Tile> {
    const seen = new Set<Tile>
    const q: Tile[] = []
    q.push(tile)
    while (q.length > 0) {
        const curr = q.pop()
        seen.add(curr)
        for (const n of curr.neighbors()) {
            if (!seen.has(n) && manhattanDist(tile.cell(), n.cell()) <= dist) {
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