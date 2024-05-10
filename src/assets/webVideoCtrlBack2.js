let WebVideoCtrl;

import('./webVideoCtrl.js').then(module => {
    WebVideoCtrl = module.default;
}).catch(err => {
    console.error("无法导入 WebVideoCtrl: ", err);
});
