import { getShowChoiceDialog } from '../interactions.js';


export async function showDeathDialog(death){
    if(death === 'health'){
        await getShowChoiceDialog('You died fighting! ☠️', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    } else if(death === 'gold'){
        await getShowChoiceDialog('You paid your debt with your life! ☠️', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    } else if(death === 'hunting'){
        await getShowChoiceDialog('The hunter became the hunted! ☠️ \n You died!', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    }
}