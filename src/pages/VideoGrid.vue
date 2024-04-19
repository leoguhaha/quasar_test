<template>
  <q-page-container>
    <div class="video-grid">
      <!-- 主视频 -->
      <VideoDisplay
        class="video-main"
        :key="videoUrls[0]"
        :videoUrl="videoUrls[0]"
        :index="0"
      />
      <!-- 其他小视频 -->
      <div
        class="video-small"
        v-for="(url, index) in videoUrls.slice(1)"
        :key="url"
      >
        <VideoDisplay :videoUrl="url" :index="index + 1" />
      </div>
    </div>
  </q-page-container>
</template>
<script>
import VideoDisplay from "src/pages/VideoDisplay.vue";

export default {
  components: {
    VideoDisplay,
  },
  data() {
    return {
      // 假设有9个不同的视频源URL
      videoUrls: [
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/101",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T112200Z&endtime=20240417T114000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201?starttime=20240417T122200Z&endtime=20240417T134000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T132200Z&endtime=20240417T144000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/201?starttime=20240417T142200Z&endtime=20240417T154000Z",
        "rtsp://admin:Asb11023@192.168.111.10:554/Streaming/tracks/102?starttime=20240417T152200Z&endtime=20240417T164000Z",
      ],
    };
  },
};
</script>

<style>
.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 横向4等分 */
  grid-template-rows: repeat(5, 1fr); /* 纵向5等分 */
  gap: 10px;
}

.video-main {
  /* 注意，需要将video-small改为video-main来引用主视频 */
  grid-column: 1 / span 3; /* 宽3等分 */
  grid-row: 1 / span 4; /* 高4等分 */
  width: 100%;
}

.video-small {
  /* 这些视频宽高都是1等分，CSS样式可以和之前保持一致 */
  width: 100%;
  aspect-ratio: 16 / 9; /* 根据需要调整 */
}
</style>
