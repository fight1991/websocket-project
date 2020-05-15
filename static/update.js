$(function() {
  layui.use(['layer', 'element', 'upload', 'form'], function(){
    var layer = layui.layer, form = layui.form, element = layui.element, upload = layui.upload;
    var reader = new FileReader(); // 读取器
    var step = 512; // 每次读取字节数b
    var fileObj = null; // 文件对象
    var cuLoaded = 0; // 当前已经读取的字节总数
    var totalLoaded = 0; // 当前文件总字节数
    var sum = 0; // 和校验, 取末尾2位数
    var progressIndex = null // 进度loading
    // 1. 建立websocket
    if (!globalObj.isConnect) {
      createSocket(layer, function() {
        wsMessage(readBlob)
      });
    }
    //2.点击升级按钮
      //2.1 点击升级按钮时分片上传开始
    form.on('submit(formSet)', function(data){
      if (!globalObj.isConnect) {
        layer.msg('网络未建立连接', {icon: 2});
        return false
      }
      if (!fileObj) {
        layer.msg('请选择文件', {icon: 2});
        return false
      }
      // 先发送包文件信息
      let headInfo = {
        fun: 'up', // up 升级 set 配网
        size: totalLoaded,
        sum: sum
      }
      globalObj.ws.send(JSON.stringify(headInfo))
      // 分段读取开始
      progressIndex = progressIng(layer)
      // readBlob()
      return false; // 阻止表单提交
    });
    // 3. 重置按钮
    $('.upFormRset').click(function() {
      fileObj = null
      $('.filename').text('')
    })
    // 4. 获取上传的文件对象
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
          reader.readAsArrayBuffer(fileObj)
          reader.onload = function () {
            console.log(this.result)
            let unit8 = new Uint8Array(this.result)
            sum = sumCheck(unit8, 2)
          }
        })
      }
    });
  });
  function readBlob () {
    if (cuLoaded > totalLoaded) {
      console.log('文件传输完毕')
      // layer.msg('文件传输完毕', {icon: 1})
      return
    }
    let temp = fileObj.slice(cuLoaded, cuLoaded + step)
    reader.readAsArrayBuffer(temp)
    // 文件读取成功
    reader.onload = function () {
      cuLoaded += step
      var percent = Math.ceil(cuLoaded * 100 / totalLoaded)
      // 当文件读取进度100%时,停留在99,只能说明文件传输成功,
      if (percent > 100) {
        percent = 99
      }
      element.progress('upprogress', percent + '%')
      // 帧头2 + 命令1 + 数据长度2 + 索引1 + 数据域n + 帧尾2
      // var tempBuffer8 = new Int8Array(this.result)
      // var totalLength = 2 + 1 + 2 + 1 + tempBuffer8.length + 2
      // let result = mergeBuffer(totalLength, cuLoaded / step, tempBuffer8).buffer
      globalObj.ws.send(result)
    }
  }
  function mergeBuffer(totalLength, index, newBuffer) {
    let arry = new Int8Array(totalLength)
    // 添加帧头
    arry[0] = '0xA'
    arry[1] = 'EBF'
    // 添加命令
    arry[2] = '0x21'
    // 添加数据长度
    arry[3] = '0x00'
    arry[4] = '0x05'
    // 添加数据索引
    arry[5] = index
    newBuffer.forEach((v, i) => {
      arry[5 + i + 1] = v
    })
    // 0xECFD
    arry[arry.length - 1] = 'CFD'
    arry[arry.length - 2] = '0xE'
    return arry
  }
  function sumCheck (arr, length) {
    let total = 0
    for (let i = 0; i < arr.length; i++) {
      total += arr[i]
    }
    return Number(total.toString().slice(arr.length-length))
  }
  function wsMessage (data, callback) {
    let flag = false
    if (data) {
      if (data.fun == "upInit") {
        form.val('upForm', data.result)
      }
      if (data.fun == "upResult") {
        if (data.result == 0) {
          layer.msg('操作失败', {icon: 2})
        } else {
          // layer.msg('操作成功', {icon: 1})
          // 开始发包
          callback && callback()
        }
      }
      if (data.fun == "upPack") {
        // 包接受成功继续发送
        if (data.result < 32768) {
          callback && callback()
        }
        if (65535 > data.result > 32768) {
          element.progress('upprogress', '100%')
          layer.close(progressIndex)
          layer.msg('升级完成', {icon: 2})
        }
        if (data.result == 65535) {
          layer.msg('升级失败,请重新尝试', {icon: 2})
          setTimeout(() => {
            location.reload()
          })
        }
      }
    }
  }
  function progressIng (layer) {
    var index = layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      area: '60%',
      // offset: '100px',
      content: $('.progress-ing') //这里content是一个DOM，注意：最好该元素要存放在body最外层，否则可能被其它的相对元素所影响
    });
    return index
  }
})