var globalObj = {
  ws: null,
  isConnect: false
}
window.onbeforeunload = function () {
  if (globalObj.ws) {
    globalObj.ws.close()
    globalObj.isConnect = false
    globalObj.ws = null
  }
}
function createSocket(layer, onmessage) {
  var layIndex = progressTip(layer)
  ws = new WebSocket('ws://192.168.100.1');
  ws.onopen = function() {
    layer.msg('网络已连接', {icon: 1})
    globalObj.isConnect = true
    closeProgressTip(layer, layIndex)
  }
  ws.onmessage = function(e) {
    console.log('接受到服务端发来的数据', e.data)
    // 如果服务端接收成功继续读取
    let data = isJSON(e.data) ? JSON.parse(e.data) : ''
    onmessage && onmessage(data)
  }
  ws.onclose = function() {
    globalObj.isConnect = false
    // layer.msg('网路连接失败', {icon: 5}); 
    // closeAllTips(layer)
  }
  ws.onerror = function() {
    globalObj.isConnect = false
    layer.msg('网路连接失败', {icon: 5}); 
    closeProgressTip(layer, layIndex)
  }
}
function progressTip (layer) {
  var index = layer.open({
    type: 1,
    title: false,
    closeBtn: 0,
    offset: '100px',
    content: $('.progress-box') //这里content是一个DOM，注意：最好该元素要存放在body最外层，否则可能被其它的相对元素所影响
  });
  return index
}
function closeProgressTip (layer, index) {
  layer.close(index);
}
function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj=JSON.parse(str);
      if(typeof obj == 'object' && obj ){
        return true;
      }else{
        return false;
      }
    } catch(e) {
      return false;
    }
  } else {
    return false;
  }
}