<template>
  <q-layout view="hHh Lpr lff">
    <q-tabs v-model="tab" dense class="bg-primary text-grey-5 shadow-2 bold-tabs" inline-label active-color="white"
      indicator-color="transparent">
      <q-tab name="diaodu" icon="alarm" label="调度"/>
      <q-tab name="ditu" icon="map" label="地图" />
      <q-tab name="jingqing" icon="warning" label="历史警情" />
    </q-tabs>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-yellow-14 text-red-6">
      <div class="q-pa-md" style="display: flex; justify-content: space-between;">
        <div class="text-bold">当前登录用户信息</div>
        <div class="text-bold">部署方案管理</div>
        <div class="text-bold">报障运维管理</div>
        <div class="text-bold">用户权限管理</div>
        <div class="text-bold">非预警数据管理</div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useWebSocketSubscriptions } from "src/composables/useWebSocketSubscriptions";
import EssentialLink from "src/components/EssentialLink.vue";

const { subscribe, unsubscribe } = useWebSocketSubscriptions();
const leftDrawerOpen = ref(false);
const currentUser = ref('张三');
const app_cmd_vel_msg = ref({
  v: 0,
  w: 0,
});
const tab = ref('diaodu')

// onMounted(() => {
//   subscribe("/app_cmd_vel", (message) => {
//     // 这里处理/app_cmd_vel话题的消息
//     //console.log("Received /app_cmd_vel message:", message);
//     let msg_obj = JSON.parse(JSON.parse(message));
//     //console.log("MSG Content:", msg_obj["msg"]);
//     app_cmd_vel_msg.value = {
//       v: msg_obj.msg?.v ?? 0, // 如果v不存在，使用默认值0
//       w: msg_obj.msg?.w ?? 0, // 如果w不存在，使用默认值0
//     };
//   });
//   subscribe("/cmd_status", (message) => {
//     // 这里处理/app_cmd_vel话题的消息
//     //console.log("Received /app_cmd_vel message:", message);
//   });
// });
// onUnmounted(() => {
//   unsubscribe("/app_cmd_vel");
//   unsubscribe("/cmd_status");
// });
</script>
<style>
.header-flex-center {
  display: flex;
  align-items: center;
  height: 30px;
}

/* 这个类用于使得 q-tabs 整体宽度填充父容器 */
.full-width-tabs {
  width: 100%;
  justify-content: space-around;
  /* 这将确保tab之间的间隔均匀 */
}

/* 用于使每个 tab 标签具有相同的弹性 */
.q-tab,
.q-route-tab {
  flex-grow: 1;
  /* 使每个tab都填充相同比例的可用空间 */
  text-align: center;
  /* 增加这一行确保每个 tab 内的文字也居中 */
}
.bold-tabs .q-tab__label {
  font-weight: bold;
}
</style>
