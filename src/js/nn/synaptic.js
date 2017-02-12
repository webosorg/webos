(function() {
  return synaptic = {
    learn(obj) {
      if (obj.step && typeof obj.step === 'number') {
        return obj.step++;
      } else {
        obj.step = 0;
        return;
      }
    }
  }
}());