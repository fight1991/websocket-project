// $(function() {
  layui.use(['layer', 'form'], function(){
    var layer = layui.layer ,form = layui.form;
    form.verify({
      testaa: function (value, item) {
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
// })