$(function() {
  layui.use(['layer', 'form'], function(){
    var layer = layui.layer ,form = layui.form;
    if (!globalObj.isConnect) {
      createSocket(layer);
    }
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
      var index = layer.load();
      setTimeout(() => {
        layer.close(index);
      }, 5000)
      return false; // 阻止表单提交
    });

  });
  $(function(){
    $("#showbtn").click(function(){
      if ($("#pwd").attr('type') == "password") {
        $("#pwd").attr('type', 'text');
        $("#showbtn").text('隐藏密码');
      } else {
        $("#pwd").attr('type', 'password');
        $("#showbtn").text('显示密码');

      }
    });
	});
})