<template>
  <div class="chat-dock-wrapper">
    <!-- Satellite buttons visible when expanded -->
    <transition name="fade-slide">
      <div v-if="expanded" class="chat-dock-actions">
        <!-- SORA AI Satellite Button -->
        <button 
          @click="activeSora = true" 
          class="chat-satellite-btn sora-sat" 
          title="SORA AI"
        >
          <i class="bi bi-robot fs-4"></i>
        </button>
        <!-- Live Chat Satellite Button -->
        <button 
          @click="activeLive = true" 
          class="chat-satellite-btn live-sat" 
          title="Chat trực tiếp"
        >
          <i class="bi bi-headset fs-4"></i>
        </button>
      </div>
    </transition>

    <!-- Central toggle button -->
    <button :class="['chat-dock-toggle', { open: expanded }]" class="btn rounded-circle shadow-lg" @click="togglePanel" title="Mở menu hỗ trợ">
      <i class="bi bi-chat-dots-fill fs-4"></i>
      <span v-if="showAnyChat" class="status-dot"></span>
    </button>

    <!-- Chat widgets (always rendered, hidden with hideFab) -->
    <ChatbotWidget :visible="activeSora" :hideFab="true" @update:visible="activeSora = $event" />
    <SoraChatWidget :visible="activeLive" :hideFab="true" @update:visible="activeLive = $event" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ChatbotWidget from './ChatbotWidget.vue';
import SoraChatWidget from './SoraChatWidget.vue';

const expanded = ref(false);
const activeSora = ref(false);
const activeLive = ref(false);

const togglePanel = () => {
  expanded.value = !expanded.value;
};

const showAnyChat = computed(() => activeSora.value || activeLive.value);

// When SORA opens, close Live Chat and satellites
watch(() => activeSora.value, (newVal) => {
  if (newVal) {
    activeLive.value = false;
    expanded.value = false;
  }
});

// When Live Chat opens, close SORA and satellites
watch(() => activeLive.value, (newVal) => {
  if (newVal) {
    activeSora.value = false;
    expanded.value = false;
  }
});
</script>

<style scoped>
.chat-dock-wrapper {
  position: fixed;
  right: 25px;
  bottom: 25px;
  z-index: 100001;
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.chat-dock-actions {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 140px;
  height: 140px;
  pointer-events: auto;
}

.chat-satellite-btn {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  pointer-events: auto;
}

.chat-satellite-btn:hover {
  transform: scale(1.08);
}

.chat-satellite-btn.sora-sat {
  right: 8px;
  bottom: 72px;
  background: linear-gradient(135deg, #f97316, #fbbf24);
}

.chat-satellite-btn.live-sat {
  right: 72px;
  bottom: 8px;
  background: linear-gradient(135deg, #3b82f6, #38bdf8);
}

.chat-dock-toggle {
  position: absolute;
  width: 62px;
  height: 62px;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #9f273b, #7a1c2d);
  color: #fff;
  border: 2px solid #e7ce7d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24);
  pointer-events: auto;
  transition: transform 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.chat-dock-toggle.open {
  transform: rotate(45deg);
}

.chat-dock-toggle:hover {
  transform: scale(1.05);
}

.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
