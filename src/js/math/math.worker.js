onmessage = function(e) {
  console.log('Math Worker Log ::: Message received from main script ::: ', e.data);

  var result = e.data;

  result.success = true;

  postMessage(result);
}