// CommonJS模块
function initDemo(){
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
};

function moveTo(top, left){
  // 将test这个div移动到top和left位置
  var test = document.getElementById('test');
  console.log('test0', test);
  console.log('top', top);
  console.log('left', left);
  test.style.marginTop = top;
  test.style.marginLeft = left;
  console.log('test1', test);
}
