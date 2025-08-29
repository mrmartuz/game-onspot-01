
const gameDialog = document.getElementById('game-dialog');

export async function showChoiceDialog(message, buttons) {
    return new Promise((resolve) => {
        gameDialog.innerHTML = '';
        // Wrap the message in a div
        const pDiv = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = message || 'No message provided'; // Fallback for empty message
        pDiv.appendChild(p);
        gameDialog.appendChild(pDiv);
        // Wrap each button in its own div
        if (buttons && buttons.length > 0) {
            buttons.forEach(({label, value}) => {
                const btnDiv = document.createElement('div');
                const btn = document.createElement('button');
                btn.textContent = label || 'Unnamed Button';
                btn.addEventListener('click', () => {
                    gameDialog.close(value);
                });
                btnDiv.appendChild(btn);
                gameDialog.appendChild(btnDiv);
            });
        } else {
            console.warn('getShowChoiceDialog: No buttons provided, adding fallback Close button');
            const btnDiv = document.createElement('div');
            const btn = document.createElement('button');
            btn.textContent = '❌ Close';
            btn.addEventListener('click', () => {
                gameDialog.close('close');
            });
            btnDiv.appendChild(btn);
            gameDialog.appendChild(btnDiv);
        }
        // Log dialog content for debugging
        // Ensure dialog is not already open
        if (gameDialog.open) {
            gameDialog.close();
        }
        gameDialog.showModal();
        gameDialog.addEventListener('close', () => resolve(gameDialog.returnValue), {once: true});
    });
}