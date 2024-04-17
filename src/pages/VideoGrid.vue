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
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T112200Z&endtime=20240417T114000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201?starttime=20240417T122200Z&endtime=20240417T134000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T132200Z&endtime=20240417T144000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201?starttime=20240417T142200Z&endtime=20240417T154000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T152200Z&endtime=20240417T164000Z",
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
