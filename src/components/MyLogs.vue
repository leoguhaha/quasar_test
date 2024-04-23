<template>
  <q-table
    row-key="id"
    :rows="rows"
    :columns="columns"
    binary-state-sort
    flat
    bordered
  >
    <template v-slot:body-cell-image="props">
      <q-td :props="props">
        <img
          :src="props.row.image"
          class="my-table-image"
          @click="openDialog(props.row.image)"
          style="width: 100px; cursor: pointer"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-location="props">
      <q-td :props="props">
        <img
          :src="props.row.locationImage"
          class="my-table-image"
          @click="openDialog(props.row.locationImage)"
          style="width: 100px; cursor: pointer"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog" fullscreen class="image-dialog">
    <q-card class="q-pa-md">
      <q-card-section class="row items-center">
        <q-btn
          icon="close"
          @click="closeDialog"
          round
          dense
          flat
          class="q-ml-auto"
        />
      </q-card-section>
      <q-card-section class="image-container" @wheel="handleWheel">
        <img :src="currentImage" :style="imageStyle" @load="resetImageStyle" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";

const rows = ref([
  // 示例数据，请根据实际需要添加或修改
  {
    id: 1,
    time: "2023-01-01 12:00",
    locationImage: "https://via.placeholder.com/1080x720", // 假设图片地址
    image: "https://via.placeholder.com/1080x720", // 假设图片地址
    status: "处理中",
    area: "执勤区1",
  },
  // 其余数据...
]);

const columns = ref([
  {
    name: "id",
    required: true,
    label: "序号",
    align: "left",
    field: (row) => row.id,
    sortable: true,
  },
  {
    name: "time",
    align: "left",
    label: "预警时间",
    field: "time",
    sortable: true,
  },
  {
    name: "location",
    label: "预警位置",
    field: "locationImage",
    sortable: true,
  },
  { name: "image", label: "警情画面", field: "image", sortable: false },
  { name: "status", label: "处置状态", field: "status", sortable: false },
  { name: "area", label: "所属执勤区", field: "area", sortable: true },
]);

const dialog = ref(false);
const currentImage = ref("");

const imageStyle = reactive({
  transform: "scale(1, 1)",
  transition: "transform 0.2s ease",
});
let scale = 1;

function openDialog(imageSrc) {
  currentImage.value = imageSrc;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  // Reset scale
  resetImageStyle();
}

function resetImageStyle() {
  scale = 1;
  imageStyle.transform = "scale(1, 1)";
}

function handleWheel(event) {
  event.preventDefault();
  const zoomIntensity = 0.1;
  scale += event.deltaY * -zoomIntensity;
  scale = Math.max(scale, 1); // Prevent scale down below 1 (normal size)
  imageStyle.transform = `scale(${scale}, ${scale})`;
}
</script>

<style>
.my-table-image {
  height: auto;
  max-height: 64px;
}
</style>
