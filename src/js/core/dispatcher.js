import EE from 'eventemitter3';

export default class Dispatcher extends EE {
  constructor() {
    super();
    console.log('Dispatcher');
  }
};