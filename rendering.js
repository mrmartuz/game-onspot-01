import { viewWidth, viewHeight, offsetX, offsetY, tileSize } from './game_variables.js';
import { visited, px, py, health, gold, food, water, group } from './game_variables.js';
import { getTile, getEmojiForFlora, getEmojiForLocation, getEmojiForEntity } from './utils.js';
import { hash } from './utils.js'; // For grass tufts

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');

export function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    viewWidth = Math.floor(canvas.width / tileSize);
    if (viewWidth % 2 === 0) viewWidth--;
    viewHeight = Math.floor(canvas.height / tileSize);
    if (viewHeight % 2 === 0) viewHeight--;
    offsetX = (canvas.width - viewWidth * tileSize) / 2;
    offsetY = (canvas.height - viewHeight * tileSize) / 2;
}

export function draw(offsetDeltaX, offsetDeltaY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let vx = 0; vx < viewWidth; vx++) {
        for (let vy = 0; vy < viewHeight; vy++) {
            let tx = px - Math.floor(viewWidth / 2) + vx;
            let ty = py - Math.floor(viewHeight / 2) + vy;
            let tile = getTile(tx, ty);
            let drawX = offsetX + offsetDeltaX + vx * tileSize;
            let drawY = offsetY + offsetDeltaY + vy * tileSize;
            let key = `${tx},${ty}`;
            if (!visited.has(key)) {
                ctx.fillStyle = 'black';
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
                continue;
            }
            ctx.fillStyle = tile.terrain === 'sand' ? 'yellow' : tile.terrain === 'dirt' ? 'green' : 'gray';
            ctx.fillRect(drawX, drawY, tileSize, tileSize);

            // Render grass tufts spread across the full tile
            if (tile.terrain === 'dirt' && tile.flora > 0) {
                const tuftCount = tile.flora * 3; // Up to 30 tufts at flora=10; adjust for density
                for (let i = 0; i < tuftCount; i++) {
                    // Vary green shade for depth (darker to lighter green)
                    const greenShade = Math.floor(100 + hash(tx, ty, 500 + i) * 100); // 100-200 for rgb(0, greenShade, 0)
                    ctx.fillStyle = `rgb(0, ${greenShade}, 0)`;
                    const rx = Math.floor(hash(tx, ty, 100 + i) * tileSize);
                    const baseY = drawY + Math.floor(hash(tx, ty, 200 + i) * tileSize); // Random across full height
                    const tuftWidth = 2 + Math.floor(hash(tx, ty, 300 + i) * 3); // 2-4px wide
                    const tuftHeight = 4 + Math.floor(hash(tx, ty, 400 + i) * 5); // 4-8px tall
                    ctx.fillRect(drawX + rx, baseY - tuftHeight, tuftWidth, tuftHeight); // Draw upward from base
                }
            }

            if (tile.flora_type !== 'none') {
                ctx.font = '20px serif';
                ctx.fillText(getEmojiForFlora(tile.flora_type), drawX + tileSize / 2, drawY + tileSize / 2);
            }
            if (tile.location !== 'none') {
                ctx.font = '20px serif';
                ctx.fillText(getEmojiForLocation(tile.location), drawX + tileSize / 2, drawY + tileSize / 2);
            }
            if (tile.entity !== 'none') {
                ctx.font = '24px serif';
                ctx.fillText(getEmojiForEntity(tile.entity), drawX + tileSize / 2, drawY + tileSize / 2);
            }
        }
    }
    // Draw player
    let playerX = offsetX + Math.floor(viewWidth / 2) * tileSize + tileSize / 2;
    let playerY = offsetY + Math.floor(viewHeight / 2) * tileSize + tileSize / 2;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(playerX, playerY, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
}

export function updateStatus() {
    document.getElementById('status-bar').innerText = `🪙: ${Math.floor(gold)} 🍞: ${Math.floor(food)} 💧: ${Math.floor(water)} ❤️‍🩹: ${Math.floor(health)} 👥: ${group.length}`;
}