<template>
  <q-page-container>
    <div class="video-grid">
      <!-- 这里是主视频 -->
      <VideoDisplay class="video-small" :key="videoUrls[0]" :videoUrl="videoUrls[0]" :index="0" />
      <!-- 这里是小视频 -->
      <div class="video-small" v-for="(url, index) in videoUrls.slice(1)" :key="url">
        <VideoDisplay :videoUrl="url" :index="index+1" />
      </div>
    </div>
  </q-page-container>
</template>
<script>
import VideoDisplay from 'src/pages/VideoDisplay.vue';

export default {
  components: {
    VideoDisplay
  },
  data() {
    return {
      // 假设有9个不同的视频源URL
      videoUrls: [
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
      ]
    }
  }
}
</script>

<style>
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.video-main {
  grid-column: 2 / span 1;
  grid-row: 1 / span 2;
  width: 100%; /* 确保视频充满容器 */
  aspect-ratio: 16 / 9; /* 可选，保持视频的宽高比 */
}

.video-small {
  grid-row: span 1; /* 每个小视频占用一行 */
  width: 100%; /* 确保视频充满容器 */
  aspect-ratio: 16 / 9; /* 可选，保持视频的宽高比 */
}
</style>
