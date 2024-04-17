// useWebSocketSubscriptions.js
import { onMounted, onUnmounted, ref } from "vue";

export function useWebSocketSubscriptions() {
  // 存储关于话题和它们对应回调函数的映射
  const topicCallbacks = ref({});

  const subscribe = (topic, callback) => {
    // 订阅逻辑，可能包括调用API订阅话题
    window.mainApi.subscribe(topic);

    // 存储回调函数供之后使用
    topicCallbacks.value[topic] = callback;
  };

  const unsubscribe = (topic) => {
    // 取消订阅逻辑
    window.mainApi.unsubscribe(topic);

    // 从映射中删除话题
    delete topicCallbacks.value[topic];
  };

  // 处理接收到的所有消息
  const onMessageReceived = (topic, message) => {
    if (topicCallbacks.value[topic]) {
      topicCallbacks.value[topic](message);
    }
  };

  onMounted(() => {
    window.mainApi.onMessage(onMessageReceived);
  });

  onUnmounted(() => {
    // 取消订阅所有话题
    Object.keys(topicCallbacks.value).forEach(unsubscribe);
  });

  return { subscribe, unsubscribe };
}
