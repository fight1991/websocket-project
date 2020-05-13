$(function() {
  layui.use(['layer', 'element', 'upload', 'form'], function(){
    var layer = layui.layer, form = layui.form, element = layui.element, upload = layui.upload;
    var reader = null; // 读取器
    var step = 2; // 每次读取字节数b
    var fileObj = null; // 文件对象
    var cuLoaded = 0; // 当前已经读取的字节总数
    var totalLoaded = 0; // 当前文件总字节数
    var ws = null;
    var isConnect = false; // 是否成功建立连接
    createSocket(); // 建立websocket
    form.verify({
      testaa: function (value, item) {
        if (!value) {
          return 'cannot be empty!'
        }
      }
    })
    //2.升级按钮
        //2.1 点击升级按钮时分片上传开始
    form.on('submit(formSet)', function(data){
      // layer.msg(JSON.stringify(data.field));
      // var index = layer.load();
      // setTimeout(() => {
      //   layer.close(index);
      // }, 5000)
      // 
      if (!isConnect) {
        layer.msg('网络未建立连接', {icon: 2});
        return false
      }
      if (!fileObj) {
        layer.msg('请选择文件', {icon: 2});
        return false
      }
      // 分段读取开始
      reader = new FileReader()
      readBlob()
      return false; // 阻止表单提交
    });
    //1.取上传的文件对象
    upload.render({
      elem: '#sfile',
      auto: false,
      accept:'file',
      exts: 'txt|hex',
      choose: function ({preview}) {
        preview(function(index, file, result){
          console.log(file)
          if (file.size  > 1024 * 2) { // 大于2k
            layer.msg('文件不能大于2k', {icon: 2}); 
            return false
          }
          totalLoaded = file.size
          fileObj = file
          $('.filename').text(file.name)
        })
      }
    });
    // layui.use('element', function(){
    //   var element = layui.element;
    // });
    function readBlob () {
      if (cuLoaded > totalLoaded) {
        console.log('文件传输完毕')
        return
      }
      let temp = fileObj.slice(cuLoaded, cuLoaded + step)
      reader.readAsArrayBuffer(temp)
      // 文件读取成功
      reader.onload = function () {
        cuLoaded += step
        var percent = Math.ceil(cuLoaded * 100 / totalLoaded) //获取进度百分比
        if (percent > 100) {
          percent = 100
        }
        element.progress('upprogress', percent + '%')
        ws.send(this.result)
      } 
    }
    function createSocket(success) {
      var index = layer.load();
      ws = new WebSocket('ws://192.168.100.1');
      ws.onopen = function() {
        layer.msg('网络已连接', {icon: 1})
        isConnect = true
        success && success()
        layer.close(index);
      }
      ws.onmessage = function(e) {
        console.log('接受到服务端发来的数据', e.data)
        // 如果服务端接收成功继续读取
        readBlob()
      }
      ws.onclose = function() {
        isConnect = false
        layer.msg('网路连接失败', {icon: 5}); 
        layer.close(index);
      }
      ws.onerror = function() {
        isConnect = false
        layer.msg('网路连接失败', {icon: 5}); 
        layer.close(index);
      }
    }
  });
})