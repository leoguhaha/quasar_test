<template>
  <div>
    <!-- 例子中只是演示如何使用VideoWall组件 -->
    <video-wall :video-urls="videoUrls" style="height: 60vh"></video-wall>
    <my-logs style="height: 35vh"></my-logs>
  </div>
</template>

<script>
import VideoWall from "../components/VideoWall.vue";
import MyLogs from "src/components/MyLogs.vue";

export default {
  components: {
    VideoWall,
    MyLogs,
  },
  data() {
    return {
      // 假设有9个不同的视频源URL
      videoUrls: [
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
        "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102",
      ], // 这里填入你的视频URL数组
    };
  },
};
</script>
