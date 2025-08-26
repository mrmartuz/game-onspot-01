import { move } from './movement.js';
import { showMenu, showChoiceDialog, showGoldDialog, showInventoryDialog, showDiscoveriesDialog, showHealthGroupDialog } from './interactions.js';
import { gameState } from './game_variables.js';
import { canvas } from './rendering.js';

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
    // Direction buttons (already working with click events)
    directions.forEach(dir => {
        document.getElementById(dir.id).addEventListener('click', () => move(dir.dx, dir.dy));
    });

    // Function to handle player interaction (for both touch and click)
    const handlePlayerInteraction = (e) => {
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.type === 'touchstart') {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else if (e.type === 'click') {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        let vx = Math.floor((x - gameState.offsetX) / gameState.tileSize);
        let statusBar = document.getElementById('status-bar');
        let statusBarRect = statusBar.getBoundingClientRect();
        let statusBarHeight = statusBarRect.height;
        let vy = Math.floor(((y - gameState.offsetY) / gameState.tileSize));
        
        // Check if click is on the player (center tile)
        let centerTileX = Math.floor(gameState.viewWidth / 2);
        let centerTileY = Math.floor(gameState.viewHeight / 2);
        
        if (vx === centerTileX && vy === centerTileY) {
            showMenu();
        }
    };

    // Add touch and click listeners for canvas (player interaction)
    canvas.addEventListener('touchstart', handlePlayerInteraction);
    canvas.addEventListener('click', handlePlayerInteraction);

    // Setup click and touchstart listeners for all status buttons
    const goldButton = document.getElementById('gold-button');
    const inventoryButton = document.getElementById('inventory-button');
    const groupButton = document.getElementById('group-button');
    const dateButton = document.getElementById('date-button');
    const discoveriesButton = document.getElementById('discoveries-button');

    // Gold button
    goldButton.addEventListener('click', showGoldDialog);
    goldButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showGoldDialog();
    });

    // Inventory button
    inventoryButton.addEventListener('click', showInventoryDialog);
    inventoryButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showInventoryDialog();
    });

    // Group button
    groupButton.addEventListener('click', showHealthGroupDialog);
    groupButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showHealthGroupDialog();
    });

    // Date button
    dateButton.addEventListener('click', () => {
        const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
        showChoiceDialog(list || 'No events yet. 📜', [
            {label: 'OK', value: 'ok'}
        ]);
    });
    dateButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
        showChoiceDialog(list || 'No events yet. 📜', [
            {label: 'OK', value: 'ok'}
        ]);
    });

    // Discoveries button
    discoveriesButton.addEventListener('click', showDiscoveriesDialog);
    discoveriesButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showDiscoveriesDialog();
    });
}