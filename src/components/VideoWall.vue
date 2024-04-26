<template>
  <div>
    <div class="video-top">
      <div class="video-main">
        <VideoDisplay :videoUrl="videoUrls[0]" :index="0" @videoClicked="handleVideoClicked" />
      </div>
      <div class="video-right column">
        <div v-for="index in 4" :key="`right-${index}`" class="col">
          <VideoDisplay :videoUrl="videoUrls[index]" :index="index" @videoClicked="handleVideoClicked" />
        </div>
      </div>
    </div>
    <div class="video-bottom row">
      <div v-for="index in 4" :key="`bottom-${index}`" class="col" style="background-color: yellow">
        <VideoDisplay :videoUrl="videoUrls[index + 4]" :index="index + 4" @videoClicked="handleVideoClicked" />
      </div>
    </div>
  </div>
</template>

<!-- <script>
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
  methods: {
    handleVideoClicked(index) {
      console.log("Video clicked:", index);
      console.log("videoUrls[0]", this.videoUrls[0]);
      const temp = this.videoUrls[0];
      this.$set(this.videoUrls, 0, this.videoUrls[index]);
      this.$set(this.videoUrls, index, temp);
      console.log("videoUrls", this.videoUrls);

      // 你可能还需要重启JSMpeg播放器以加载新的视频URL，依赖于如何在VideoDisplay组件中实现播放逻辑
    },
  },
};
</script> -->
<script setup>
import { ref, reactive, toRefs } from 'vue';
import VideoDisplay from "src/components/VideoDisplay.vue";

// 定义 props
const props = defineProps({
  videoUrls: {
    type: Array,
    required: true,
  },
});

// 将 videoUrls 定义为响应式引用
const state = reactive({ videoUrls: props.videoUrls });

// 处理视频点击
const handleVideoClicked = (index) => {
  console.log("Video clicked:", index);

  // 交换视频 URLs
  const temp = state.videoUrls[0];
  state.videoUrls[0] = state.videoUrls[index];
  state.videoUrls[index] = temp;

  // 由于 videoUrls 已经是响应式的，不需要重新赋值来触发更新
  console.log("Updated videoUrls", state.videoUrls);
  // 重新加载视频
  
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
