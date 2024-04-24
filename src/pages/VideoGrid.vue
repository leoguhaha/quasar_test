<template>
  <q-layout>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" border>
      <q-list>
        <q-item-label header class="custom-item-label bg-primary">哨兵列表</q-item-label>
        <q-expansion-item v-for="menuItem in menuItems" :key="menuItem.label" :label="menuItem.label" icon="layers" class="bg-orange">
          <q-item v-for="subItem in menuItem.children" :key="subItem" clickable v-close-popup
            @click="handleClick(subItem)" class="bg-yellow">
            <q-item-section>{{ subItem }}</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <q-item-label header class="custom-item-label bg-primary">视频</q-item-label>
      <video-wall :video-urls="videoUrls" style="height: 60vh"></video-wall>
      <my-logs style="height: 35vh"></my-logs>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import VideoWall from "../components/VideoWall.vue";
import MyLogs from "src/components/MyLogs.vue";
import { ref } from 'vue';

const videoUrls = ref([
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
  "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
]);
const leftDrawerOpen = ref(true);
const menuItems = ref([
  {
    label: '执勤组1',
    children: ['机器人A1', '机器人A2']
  },
  {
    label: '执勤组2',
    children: ['机器人A3', '机器人A4']
  }
]);
function handleClick(item) {
  console.log(item + ' 被点击');
};
</script>
<style>
.custom-item-label {
  color: whitesmoke;
  /* 黑色文字 */
  height: 30px;
  /* 调整高度，您可以根据需求调整 */
  display: flex;
  align-items: center;
  padding: 0 15px;
  /* 根据需要调整内边距以垂直居中文本 */
  /* font-weight: bold; */
  border: 1px solid gray;
  justify-content: center;
}
</style>
