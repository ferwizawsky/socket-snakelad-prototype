<script setup>
import { useFetch, useLocalFetch } from "@/composables/management/fetch";
import { getPreviewPNG } from "@/composables/pixia/pixelImageLib";
import { ref, watch } from "vue";
import { onBeforeUnmount, onMounted } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { debounce } from "lodash";

let animationInterval;
const layerPixels = ref([]);
const pointerLayer = ref([]);
const currentIndex = ref(0);
// const !paused = ref(true);
const props = defineProps([
  "fps",
  "src",
  "outlined",
  "data",
  "dev",
  "paused",
  "index",
  "id",
]);
const equipmentPreview = ref();
const heroPreview = ref();
const fps = ref(8);
const indexSelecterLayer = ref(0);
const indexSelectedCanvas = ref(0);
const equipmentWidth = ref(0);
const heroPreviewWidth = ref(0);
const config = ref({});
const dataSrc = ref();

useResizeObserver(equipmentPreview, () => {
  if (equipmentPreview.value) {
    equipmentWidth.value = equipmentPreview.value.clientWidth;
  }
});

useResizeObserver(heroPreview, () => {
  if (heroPreview.value) {
    heroPreviewWidth.value = heroPreview.value.clientWidth;
  }
});

onBeforeUnmount(() => {
  clearInterval(animationInterval);
});
const setVariable = (pixels) => {
  console.log(pixels);
  layerPixels.value = pixels.layerPixels || [];
  pointerLayer.value = pixels.pointerLayer || [];
  config.value = pixels.config || {};
};
// const stopPreview = () => {
//   !paused.value = false;
//   cancelAnimationFrame(animationFrame);
// };

const playPreview = (pixels) => {
  setVariable(pixels);
  // !paused.value = true;

  const animate = (timestamp) => {
    if (props.paused) return;
    const timeSinceLastFrame = timestamp - lastFrameTime;
    if (timeSinceLastFrame >= targetFrameDuration.value) {
      lastFrameTime = timestamp; // Update the last frame timestamp\
      currentIndex.value =
        (currentIndex.value + 1) %
        layerPixels.value[indexSelecterLayer.value].layer.length;
    }

    // Request the next frame
    animationFrame = requestAnimationFrame(animate);
  };

  cancelAnimationFrame(animationFrame); // Ensure no duplicate loops
  requestAnimationFrame(animate);
};
watch(
  () => props.data,
  (e) => {
    setVariable(e);
    if (
      props.dev &&
      e?.layerPixels?.[indexSelecterLayer.value]?.layer?.length > 1
    ) {
      cancelAnimationFrame(animationFrame);
      currentIndex.value = 0;
      playPreview(e);
    }
    // console.log("Changes", e);
  },
  {
    deep: true,
  }
);
watch(
  () => props.index,
  (e) => {
    indexSelecterLayer.value = e;
    cancelAnimationFrame(animationFrame);
    currentIndex.value = 0;
    playPreviewDebounced(props.data ?? dataSrc.value);
  }
);
watch(
  () => props.data,
  (e) => {
    playPreviewDebounced(e);
  },
  {
    once: true,
  }
);
const playPreviewDebounced = debounce(playPreview, 100);
let animationFrame;
let lastFrameTime = 0; // Tracks the last frame's timestamp
const targetFrameDuration = ref(1000 / (props.fps ?? fps.value)); // Frame duration in ms

// Update frame duration if FPS changes
watch(
  () => props.fps,
  (newFps) => {
    targetFrameDuration.value = 1000 / newFps;
  }
);

async function getJson() {
  try {
    const { data } = await useLocalFetch("GET", props.src);
    let dataTmp = JSON.parse(JSON.stringify(data)); // Deep copy
    dataSrc.value = dataTmp;
    playPreview(dataTmp);
  } catch (error) {}
}
onMounted(() => {
  if (props.src) {
    getJson();
  }
  if (props.data?.layerPixels?.length > 1) {
    playPreview(props.data);
  }
});
const cachedImages = new Map();
const getCachedPreviewPNG = (canvas, width = 16, height = 16, index = "x0") => {
  const key = `${canvas}-${width}-${height}-${index}`;
  if (!cachedImages.has(key)) {
    cachedImages.set(key, getPreviewPNG(canvas, width, height));
  }
  return cachedImages.get(key);
};

defineExpose({ playPreview });
</script>
<template>
  <div
    v-if="layerPixels?.[indexSelecterLayer]?.layer?.length"
    ref="equipmentPreview"
    class="relative flex justify-center items-center"
    :class="outlined ? 'outlined' : ''"
    :style="{
      height: `${equipmentWidth}px`,
    }"
  >
    <img
      v-if="layerPixels?.[indexSelecterLayer].layer?.[currentIndex]?.canvas"
      ref="heroPreview"
      :src="
        props.dev
          ? getPreviewPNG(
              !paused &&
                layerPixels?.[indexSelecterLayer].layer?.[currentIndex]?.canvas
                ? layerPixels?.[indexSelecterLayer].layer?.[currentIndex]
                    ?.canvas
                : [],
              config.size.width ?? 16,
              config.size.height ?? 16
            )
          : getCachedPreviewPNG(
              !paused
                ? layerPixels?.[indexSelecterLayer].layer?.[currentIndex]
                    ?.canvas
                : [],
              config.size.width ?? 16,
              config.size.height ?? 16,
              (props.id ?? 'x') + indexSelecterLayer + '_' + currentIndex
            )
      "
      class="m-auto"
      :style="{
        width: `${(equipmentWidth / 24) * config?.size?.width}px`,
        imageRendering: 'pixelated',
        '-moz-image-rendering': 'crisp-edges', // Firefox
        '-o-image-rendering': 'crisp-edges', // Opera
        '-webkit-image-rendering': 'optimize-contrast', // Webkit (non-standard)
        'image-rendering': 'crisp-edges', // Additional vendor prefix
      }"
    />
    <img
      v-for="(item, index) in pointerLayer"
      :src="
        getCachedPreviewPNG(
          item.canvas,
          item?.size?.width ?? 24,
          item?.size?.height ?? 24,
          'y' + index
        )
      "
      class="absolute ease-linear"
      :alt="
        layerPixels?.[indexSelecterLayer].layer?.[currentIndex]?.pointer?.[
          item.name
        ]?.rotate
      "
      style=""
      :style="{
        'transition-duration': `${item?.duration ?? 0}ms`,
        imageRendering: 'pixelated',
        '-moz-image-rendering': 'crisp-edges', // Firefox
        '-o-image-rendering': 'crisp-edges', // Opera
        '-webkit-image-rendering': 'optimize-contrast', // Webkit (non-standard)
        'image-rendering': 'crisp-edges', // Additional vendor prefix

        width: `${100 * (item.scale ?? 1)}%`,
        transform: `translate(-50%, -50%) rotate(${
          layerPixels?.[indexSelecterLayer].layer?.[
            !paused ? currentIndex : indexSelectedCanvas
          ]?.pointer?.[item.name]?.rotate ?? 0
        }deg)`,
        top: `${
          layerPixels?.[indexSelecterLayer].layer?.[
            !paused ? currentIndex : indexSelectedCanvas
          ]?.pointer?.[item.name]?.y *
            (heroPreviewWidth / 16) +
          heroPreviewWidth / 4
        }px`, //currentIndex
        left: `${
          layerPixels?.[indexSelecterLayer].layer?.[
            !paused ? currentIndex : indexSelectedCanvas
          ]?.pointer?.[item.name]?.x *
            (heroPreviewWidth / 16) +
          heroPreviewWidth / 4
        }px`,
      }"
    />
  </div>
</template>
