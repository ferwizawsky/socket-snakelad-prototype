<script setup>
import { ref, onMounted, computed } from "vue";
import PixelAnimate from "./components/pixia/PixelAnimate.vue";

import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const indexed = ref(0);
const message = ref("");
const messages = ref([]);

const sendMessage = () => {
  if (message.value.trim()) {
    socket.emit("message", message.value);
    message.value = "";
  }
};

onMounted(() => {
  socket.on("message", (msg) => {
    messages.value.push(msg);
  });
});

const animationDuration = ref(500);

const maxBox = ref(100);
const playerPost = ref(0);
const recentRoll = ref(0);
const playerLocation = computed(() => {
  return {
    x: playerPost.value % 10,
    y: Math.floor(playerPost.value / 10),
  };
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function meluncur() {
  recentRoll.value = randomInt(1, 6);
  for (let i = 0; i < recentRoll.value; i++) {
    setTimeout(() => {
      playerPost.value += 1;
    }, i * animationDuration.value);
  }
  indexed.value = 1;
  setTimeout(() => {
    indexed.value = 0;
  }, recentRoll.value * animationDuration.value);
}
</script>

<template>
  <div class="h-screen bg-primary">
    <div class="p-5 hidden">
      <h1 class="text-xl font-bold">Vue + Socket.IO Chat</h1>
      <input
        v-model="message"
        class="border p-2 mr-2"
        placeholder="Type a message"
      />
      <button @click="sendMessage" class="bg-black/50 text-white px-4 py-2">
        Send
      </button>
      <ul>
        <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
      </ul>
    </div>
    <div class="text-center pt-10 pb-5">
      <button
        @click="meluncur()"
        class="bg-black/20 text-white px-4 py-2 cursor-pointer hover:bg-black/50"
      >
        Meluncurrr
      </button>
      {{ recentRoll }}
    </div>

    <div class="grid grid-cols-10 gap-0 px-4 relative max-w-[1000px] mx-auto">
      <div
        v-for="index in maxBox"
        @click="playerPost = index - 1"
        class="flex items-center justify-center border h-[100px]"
      >
        {{ index }}
      </div>

      <div
        class="w-[100px] absolute ease-linear"
        :style="{
          top: `${playerLocation.y * 100 + 5}px`,
          left: `${playerLocation.x * 97 + 5}px`,
          'transition-duration': `${animationDuration}ms`,
        }"
      >
        <PixelAnimate
          class=""
          @click="indexed = 1"
          src="/animate/pipingv2.pixiaprj"
          :index="indexed"
        />
      </div>
    </div>
  </div>
</template>
