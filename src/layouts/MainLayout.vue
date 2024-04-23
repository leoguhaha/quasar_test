<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" style="height: 4vh">
      <q-tabs align="justify">
        <q-route-tab to="" label="调度" />
        <q-route-tab to="" label="地图" />
        <q-route-tab to="" label="历史警情" />
      </q-tabs>
    </q-header>

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

const linksList = [
  {
    title: "执勤组1",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "机器人A1",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "机器人A2",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "车载B1",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "固定C1",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "执勤组2",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "机器人A3",
    caption: "Community Quasar projects",
    icon: "favorite",
    // link: 'https://awesome.quasar.dev',
  },
];
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
