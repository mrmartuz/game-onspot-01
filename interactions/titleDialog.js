import { startMenu } from './startMenu.js';

export async function titleDialog() {
    const logo = '../images/logo.jpg';
    const div = document.createElement('div');
    div.id = 'title-dialog';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.height = '100%';
    div.style.width = '100%';
    const img = document.createElement('img');
    img.src = logo;
    img.alt = 'ExpoGa Logo';
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectPosition = 'center center';
    img.style.objectFit = 'contain';
    div.appendChild(img);
    div.addEventListener('click', () => {
        div.remove();
        startMenu();
    });
    document.body.appendChild(div);
}