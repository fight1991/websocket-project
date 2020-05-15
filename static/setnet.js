$(function() {
  layui.use(['layer', 'form'], function(){
    var layer = layui.layer ,form = layui.form;
    var loadTag = null // loading框
    if (!globalObj.isConnect) {
      createSocket(layer, wsMessage);
    }
    // 表单必填项校验
    form.verify({
      ssId: function (value, item) {
        if (!value) {
          return 'cannot be empty!'
        }
      },
      password: function (value, item) {
        if (!value) {
          return 'cannot be empty!'
        }
      }
    })
    //监听提交
    form.on('submit(formSet)', function(data){
      // layer.msg(JSON.stringify(data.field));
      let {ssId, password} = data.field
      globalObj.ws.send(JSON.stringify({
        ssId,
        password
      }))
      loadTag = layer.load();
      return false; // 阻止表单提交
    });
  });
  // 显示或隐藏密码
  $("#showbtn").click(function(){
    if ($("#pwd").attr('type') == "password") {
      $("#pwd").attr('type', 'text');
      $("#showbtn").text('隐藏密码');
    } else {
      $("#pwd").attr('type', 'password');
      $("#showbtn").text('显示密码');

    }
  });
  function wsMessage (data) {
    if (data) {
      if (data.fun == "netInit") {
        form.val('setForm', data.result)
      }
      if (data.fun == "netResult") {
        layer.close(loadTag)
        if (data.result == 0) {
          layer.msg('操作失败', {icon: 2})
        } else {
          layer.msg('操作成功', {icon: 1})
          setTimeout(() => {
            location.reload()
          }, 1000)
        }
      }
    }
  }
})
