<!-- <template>
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
</template> -->

<template>
  <div class="video-container">
    <!-- 左侧大视频 -->
    <div class="video-large">
      <VideoDisplay :videoUrl="state.videoUrls[0]" :index="0" @videoClicked="handleVideoClicked" />
    </div>

    <!-- 中间四个小视频 -->
    <div class="video-middle">
      <div v-for="index in 4" :key="`middle-${index}`" class="video-small">
        <VideoDisplay :videoUrl="state.videoUrls[index]" :index="index" @videoClicked="handleVideoClicked" />
      </div>
    </div>

    <!-- 右侧四个小视频 -->
    <div class="video-right">
      <div v-for="index in 4" :key="`right-${index + 4}`" class="video-small">
        <VideoDisplay :videoUrl="state.videoUrls[index + 4]" :index="index + 4" @videoClicked="handleVideoClicked" />
      </div>
    </div>
  </div>
</template>

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
.video-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.video-large {
  width: 60%;
  /* 调整大视频显示区域的宽度 */
  height: 100%;
  background-color: aqua;
}

.video-middle,
.video-right {
  display: flex;
  flex-direction: column;
  width: 20%;
  /* 中间和右侧区域各占 25% 的宽度 */
}

.video-small {
  width: 100%;
  height: 25%;
  /* 每个小视频占据 25% 的高度 */
  background-color: lightgrey;
  /* 可根据需要修改背景颜色 */
  /* margin-bottom: 1px; 添加一些边距 */
}

.video-small:last-child {
  margin-bottom: 0;
  /* 移除最后一个元素的底部边距 */
}
</style>
