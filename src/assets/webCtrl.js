// WebVideoCtrlWrapper.js
(function(global) {
  function WebVideoCtrlWrapper(options) {
      // 在这里创建一个局部的WebVideoCtrl实例
      // 由于原始的WebVideoCtrl将自己挂载到window对象上，我们需要一个独立的作用域以避免这种情况
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // 由于WebVideoCtrl是建立在window对象上的，所以我们在iframe的contentWindow上创建一个新的环境
      const localWindow = iframe.contentWindow;

      // 执行原来的WebVideoCtrl代码片段，这里为了示例简单化，假设是直接调用已经定义好的函数
      // 在实际情况中，你可能需要以字符串形式将原WebVideoCtrl的代码传入，并使用eval或new Function等方式执行
      localWindow.eval(`(function() {
          if (localWindow.WebVideoCtrl) {
              var WebVideoCtrl = function() { /* 初始化代码 */ }
              var NS = localWindow.WebVideoCtrl = WebVideoCtrl;
              NS.version = "3.3.1"
          }
      })(localWindow);`);

      this.instance = new localWindow.WebVideoCtrl(options);

      // 如果需要清理，可以销毁iframe，这里暂时不处理
  }

  // 如果需要，可以在这里添加实例方法的代理
  WebVideoCtrlWrapper.prototype.play = function() {
      this.instance.play();
      // 实际播放逻辑，通过this.instance调用原WebVideoCtrl的方法
  }

  // 如果你使用的是CommonJS或者ES模块系统，可以导出这个封装
  if (typeof module !== 'undefined' && module.exports) {
      module.exports = WebVideoCtrlWrapper;
  } else {
      global.WebVideoCtrlWrapper = WebVideoCtrlWrapper;
  }
})(this);
