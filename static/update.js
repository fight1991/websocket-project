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
    layui.use('upload', function(){
      var upload = layui.upload;
       
      //执行实例
      var uploadInst = upload.render({
        elem: '#sfile'
      ,url: 'https://httpbin.org/post' //改成您自己的上传接口
      ,auto: false
      ,accept:'file'
      ,exts: 'txt|hex'
      ,done: function(res){
        layer.msg('上传成功');
        console.log(res)
      }
      ,error: function(){
        //请求异常回调
      }
      });
      layui.use('element', function(){
        var element = layui.element;
      });
    });
  });
// })