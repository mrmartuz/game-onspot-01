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
        let vy = Math.floor((y - gameState.offsetY) / gameState.tileSize);
        let centerV = Math.floor(gameState.viewWidth / 2);
        if (vx === centerV && vy === centerV) {
            showMenu();
        }
    };

    // Add touch and click listeners for canvas (player interaction)
    canvas.addEventListener('touchstart', handlePlayerInteraction);
    canvas.addEventListener('click', handlePlayerInteraction);

    // Function to handle status bar stat block clicks
    const handleStatBlockClick = (e) => {
        e.preventDefault();
        const statBlock = e.target.closest('.stat-block');
        if (!statBlock) return;
        
        const statType = statBlock.dataset.type;
        
        switch (statType) {
            case 'gold':
                showGoldDialog();
                break;
            case 'food':
            case 'water':
            case 'cart':
                showInventoryDialog();
                break;
            case 'discoveries':
                showDiscoveriesDialog();
                break;
            case 'health':
            case 'group':
                showHealthGroupDialog();
                break;
            default:
                showMenu(); // Fallback to general menu
        }
    };

    // Add touch and click listeners for status bar (individual stat blocks)
    const statusBar = document.getElementById('status-bar');
    statusBar.addEventListener('touchstart', handleStatBlockClick);
    statusBar.addEventListener('click', handleStatBlockClick);

    // Add touch and click listeners for date bar
    const dateBar = document.getElementById('date-bar');
    dateBar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
        showChoiceDialog(list || 'No events yet. 📜', [
            {label: 'OK', value: 'ok'}
        ]);
    });
    dateBar.addEventListener('click', () => {
        const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
        showChoiceDialog(list || 'No events yet. 📜', [
            {label: 'OK', value: 'ok'}
        ]);
    });
}