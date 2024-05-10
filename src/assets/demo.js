// CommonJS模块
$(function () {
  WebVideoCtrl.I_InitPlugin({
    bWndFull: false,     //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
    iWndowType: 1,
    cbInitPluginComplete: function () {
      WebVideoCtrl.I_InsertOBJECTPlugin('test').then(() => { // 使用domId初始化插件
          // 登录
          WebVideoCtrl.I_Login("10.20.0.122", 1, "80", "admin", "Asb11023", {
              timeout: 3000,
              success: function (xmlDoc) {
                  console.log("登录成功！");
                  var szDeviceIdentify = "10.20.0.122"
                  var iRtspPort = 554
                  var iChannelID = 1
                  var bZeroChannel = false
                  var szInfo = "";
                  var iStreamType = 1;
                  // var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0);
                  var startRealPlay = function () {
                      WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
                          iStreamType: iStreamType,
                          iChannelID: iChannelID,
                          bZeroChannel: bZeroChannel,
                          success: function () {
                              szInfo = "开始预览成功！";
                              console.log(szDeviceIdentify + " " + szInfo);
                                                  // 获取你想修改的DOM元素
                              var myElement = document.getElementById('test');
                              if (myElement) {
                                  // 清空所有内联样式
                                  myElement.style = "";

                                  // 添加新的样式 - 以下是示例
                                  myElement.style.display = "flex"; // 使用flex布局
                                  myElement.style.justifyContent = "center"; // 水平居中
                                  myElement.style.alignItems = "center"; // 垂直居中
                                  myElement.style.backgroundColor = "#f0f0f0"; // 背景色
                                  myElement.style.width = "600px"
                                  myElement.style.marginLeft = "500px"
                              }
                          },
                          error: function (oError) {
                              szInfo = "开始预览失败！";
                              console.log(szDeviceIdentify + " " + szInfo);
                          }
                      });
                  };
                  startRealPlay();
                  // if (oWndInfo != null) {// 已经在播放了，先停止
                  //     WebVideoCtrl.I_Stop({
                  //         success: function () {
                  //             var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0);
                  //             if (oWndInfo != null) {
                  //                 startRealPlay();
                  //             }
                  //         }
                  //     });
                  // } else {
                  //     var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0);
                  //     if (oWndInfo != null) {
                  //         startRealPlay();
                  //     }
                  // }
              },
              error: function (oError) {
                  if (ERROR_CODE_LOGIN_REPEATLOGIN === status) {
                      console.log("重复登录！");
                  } else {
                      console.log("登录失败！");
                  }
              }
          });
      }, (e) => {
          console.log('error', e);
          alert("插件初始化失败，请确认是否已安装插件；如果未安装，请双击开发包目录里的HCWebSDKPlugin.exe安装！");
      })
  }
})
});
