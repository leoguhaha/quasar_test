<template>
  <q-layout view="hHh Lpr lFf">
    <!-- <q-header elevated class="bg-primary text-white header-flex-center">

    </q-header> -->
    <q-tabs v-model="tab" dense class="bg-primary text-grey-5 shadow-2" inline-label active-color="white"
      indicator-color="transparent">
      <q-tab icon="alarm" label="调度" />
      <q-tab icon="map" label="地图" />
      <q-tab icon="warning" label="历史警情" />
    </q-tabs>

    <q-page-container>
      <router-view style="width: 100%; height: 96vh" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useWebSocketSubscriptions } from "src/composables/useWebSocketSubscriptions";
import EssentialLink from "src/components/EssentialLink.vue";

const { subscribe, unsubscribe } = useWebSocketSubscriptions();
const leftDrawerOpen = ref(false);
const app_cmd_vel_msg = ref({
  v: 0,
  w: 0,
});

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
</style>
