<template>
  <div>
    <div class="video-top">
      <div class="video-main">
        <VideoDisplay :videoUrl="videoUrls[0]" :index="0" />
      </div>
      <div class="video-right column">
        <div v-for="index in 4" :key="`right-${index}`" class="col">
          <VideoDisplay :videoUrl="videoUrls[index]" :index="index" />
        </div>
      </div>
    </div>
    <div class="video-bottom row">
      <div
        v-for="index in 4"
        :key="`bottom-${index}`"
        class="col"
        style="background-color: yellow"
      >
        <VideoDisplay :videoUrl="videoUrls[index + 4]" :index="index + 4" />
      </div>
    </div>
  </div>
</template>

<script>
// 注意适当调整视频组件和日志组件的导入路径以适应实际的项目结构
import VideoDisplay from "src/components/VideoDisplay.vue";

export default {
  name: "VideoWall",
  components: {
    VideoDisplay,
  },
  props: {
    videoUrls: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.video-top {
  width: 100%;
  height: 80%;
  background-color: red;
  display: flex;
}
.video-bottom {
  width: 100%;
  height: 20%;
  background-color: yellow;
}
.video-main {
  width: 75%;
  height: 100%;
  background-color: aqua;
  display: flex;
}
.video-right {
  width: 25%;
  height: 100%;
  background-color: blue;
}
</style>
