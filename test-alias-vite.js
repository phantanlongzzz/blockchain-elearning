import { resolve } from 'path';
const regex = /.*\/assets\/dlu-logo\.png$/;
console.log(regex.test('../../assets/dlu-logo.png'));
console.log(regex.test('/src/assets/dlu-logo.png'));
