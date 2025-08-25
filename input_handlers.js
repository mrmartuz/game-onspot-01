import { move } from './movement.js';
import { showMenu } from './interactions.js';
import { events } from './game_variables.js';
import { offsetX, offsetY, tileSize, viewWidth, viewHeight, canvas } from './rendering.js';

const directions = [
    {id: 'btn-n', dx: 0, dy: -1},
    {id: 'btn-ne', dx: 1, dy: -1},
    {id: 'btn-e', dx: 1, dy: 0},
    {id: 'btn-se', dx: 1, dy: 1},
    {id: 'btn-s', dx: 0, dy: 1},
    {id: 'btn-sw', dx: -1, dy: 1},
    {id: 'btn-w', dx: -1, dy: 0},
    {id: 'btn-nw', dx: -1, dy: -1}
];

export function setupInputs() {
    directions.forEach(dir => {
        document.getElementById(dir.id).addEventListener('click', () => move(dir.dx, dir.dy));
    });

    // Tap on player for menu
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let touchX = e.touches[0].clientX - rect.left;
        let touchY = e.touches[0].clientY - rect.top;
        let vx = Math.floor((touchX - offsetX) / tileSize);
        let vy = Math.floor((touchY - offsetY) / tileSize);
        let centerV = Math.floor(viewWidth / 2);
        if (vx === centerV && vy === centerV) {
            showMenu();
        }
    });

    // Tap on status bar for menu
    document.getElementById('status-bar').addEventListener('touchstart', (e) => {
        e.preventDefault();
        showMenu();
    });

    // Tap on date bar for events
    document.getElementById('date-bar').addEventListener('touchstart', (e) => {
        e.preventDefault();
        const list = events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
        alert(list || 'No events yet. 📜');
    });
}