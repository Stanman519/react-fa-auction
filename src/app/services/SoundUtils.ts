import UIfx from 'uifx'

const notification = require('../../assets/sounds/Blow.mp3');
const beep = new UIfx(notification, { volume: 1 });

export function playNotificationSound() {
    beep.play();
}