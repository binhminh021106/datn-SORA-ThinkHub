<template>
  <div class="sora-chatbot-wrapper">
    <transition name="bounce">
      <button v-if="!isOpen && !hideFab" @click="toggleChat" class="btn-chatbot-trigger shadow-lg d-flex justify-content-center align-items-center">
        <i class="bi bi-robot fs-2 text-white"></i><span class="notification-dot"></span>
      </button>
    </transition>

    <transition name="slide-up">
      <div v-if="isOpen" class="chat-window shadow-lg d-flex flex-column bg-white">
        <div class="chat-header p-3 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-bot bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm">
              <i class="bi bi-stars text-gold fs-5"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold font-serif text-white tracking-widest">SORA AI</h6>
              <small class="text-white-50"><span class="status-dot bg-success"></span> Đang trực tuyến</small>
            </div>
          </div>
          <button @click="toggleChat" class="btn-close-chat bg-transparent border-0 text-white p-2"><i class="bi bi-x-lg fs-5"></i></button>
        </div>

        <div class="chat-body flex-grow-1 p-3 overflow-auto custom-scrollbar" ref="chatBody">
          <div class="d-flex flex-column gap-3">
            <div v-for="(msg, index) in messages" :key="index" class="d-flex flex-column">
              <div class="message-bubble p-3 shadow-sm" :class="msg.sender === 'bot' ? 'bot-msg' : 'user-msg'">
                <div v-html="msg.text" class="msg-text font-luxury" style="font-size: 0.95rem; line-height: 1.6;"></div>
                <div class="time-stamp text-end mt-2 font-luxury" :class="msg.sender === 'bot' ? 'text-muted' : 'text-white-50'">{{ msg.time }}</div>
              </div>

              <div v-if="msg.sender === 'bot' && msg.options && msg.options.length > 0" class="d-flex flex-wrap gap-2 mt-2">
                <button v-for="(opt, idx) in msg.options" :key="idx" 
                        @click="handleOptionClick(opt)"
                        class="btn btn-sm rounded-pill btn-outline-gold fw-bold font-luxury transition-all shadow-sm d-flex align-items-center">
                  {{ opt.label }}
                  <i v-if="opt.link" class="bi bi-box-arrow-up-right ms-2" style="font-size: 0.75rem;"></i>
                </button>
              </div>
            </div>

            <div v-if="isLoading" class="message-bubble bot-msg p-3 shadow-sm" style="width: 80px; height: 45px;">
              <div class="typing-indicator d-flex gap-1 justify-content-center align-items-center h-100">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-footer p-3 bg-white border-top">
          <form @submit.prevent="sendMessage" class="d-flex gap-2 align-items-center">
            <input type="text" v-model="userInput" class="form-control sora-input shadow-none" placeholder="Nhập câu hỏi tại đây..." :disabled="isLoading" required>
            <button type="submit" class="btn btn-send shadow-sm d-flex justify-content-center align-items-center" :disabled="isLoading || !userInput.trim()">
              <i class="bi bi-send-fill text-white fs-5"></i>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const props = defineProps({
  visible: { type: Boolean, default: false },
  hideFab: { type: Boolean, default: false }
});
const emit = defineEmits(['update:visible']);
const router = useRouter(); 
const isOpen = ref(false);
const isLoading = ref(false);
const userInput = ref('');
const chatBody = ref(null);

watch(() => props.visible, (visible) => {
  isOpen.value = visible;
  if (visible) {
    nextTick(() => {
      if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
    });
  }
});

const messages = ref([
  {
    sender: 'bot',
    text: 'Kính chào Quý khách! Trợ lý AI SORA có thể giúp gì cho Quý khách hôm nay ạ?',
    options: [
      { label: 'Vàng SORA', link: '' }, 
      { label: 'Kim Cương SORA', link: '' }, 
      { label: 'Xem Cửa Hàng', link: '/shop' }
    ], 
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollToBottom();
  } else {
    emit('update:visible', false);
  }
};
const scrollToBottom = async () => { await nextTick(); if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight; };

// XỬ LÝ KHI KHÁCH BẤM NÚT
const handleOptionClick = (opt) => {
  if (opt.link && opt.link.trim() !== '') {
    // Nếu có Link -> Chuyển trang
    if (opt.link.startsWith('http')) {
      window.open(opt.link, '_blank');
    } else {
      router.push(opt.link);
      isOpen.value = false;
    }
  } else {
    // Nếu không có Link -> Chat tiếp bằng Label của nút đó
    userInput.value = opt.label;
    sendMessage();
  }
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text) return;

  messages.value.push({ sender: 'user', text: text, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) });
  userInput.value = ''; isLoading.value = true; scrollToBottom();

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/client/chatbot`, { message: text });
    if (response.data.success) {
      messages.value.push({ sender: 'bot', text: response.data.reply, options: response.data.options, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) });
    }
  } catch (error) {
    messages.value.push({ sender: 'bot', text: 'Dạ, hệ thống SORA đang bận.', options: [], time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) });
  } finally {
    isLoading.value = false; scrollToBottom();
  }
};
</script>

<style scoped>
/* Toàn bộ CSS giữ nguyên form Luxury cũ không thay đổi */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.tracking-widest { letter-spacing: 0.15em; }
.sora-chatbot-wrapper { position: fixed; bottom: 25px; right: 25px; z-index: 999999; display: flex; flex-direction: column; align-items: flex-end; pointer-events: none; }
.btn-chatbot-trigger, .chat-window { pointer-events: auto; }
.btn-chatbot-trigger { width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #9f273b, #7a1c2d); border: 2px solid #e7ce7d; cursor: pointer; position: relative; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.btn-chatbot-trigger:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 12px 25px rgba(159, 39, 59, 0.4) !important; }
.notification-dot { position: absolute; top: 2px; right: 2px; width: 15px; height: 15px; background-color: #ff3b30; border: 2px solid white; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(255, 59, 48, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); } }
.chat-window { width: 380px; height: 550px; border-radius: 16px; border: 1px solid rgba(231, 206, 125, 0.4); box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important; overflow: hidden; }
.chat-header { background: linear-gradient(135deg, #9f273b, #7a1c2d); border-bottom: 2px solid #e7ce7d; }
.text-gold { color: #e7ce7d !important; }
.avatar-bot { width: 45px; height: 45px; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.btn-close-chat { transition: all 0.3s ease; cursor: pointer; }
.btn-close-chat:hover { transform: rotate(90deg); color: #e7ce7d !important; }
.chat-body { background-color: #fbf9f6; }
.message-bubble { max-width: 85%; border-radius: 18px; position: relative; }
.bot-msg { background-color: #ffffff; color: #333; border: 1px solid #eaeaea; align-self: flex-start; border-bottom-left-radius: 4px; }
.user-msg { background-color: #9f273b; color: #ffffff; align-self: flex-end; border-bottom-right-radius: 4px; }
.msg-text :deep(b) { color: #9f273b; }
.user-msg .msg-text :deep(b) { color: #e7ce7d; }
.time-stamp { font-size: 0.7rem; }
.btn-outline-gold { color: #9f273b; border: 1px solid #9f273b; background: white; padding: 6px 14px; font-size: 0.85rem; }
.btn-outline-gold:hover { background: linear-gradient(135deg, #9f273b, #7a1c2d); color: white; border-color: #9f273b; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(159, 39, 59, 0.2) !important; }
.sora-input { border-radius: 25px; border: 1px solid #e0e0e0; background-color: #f4f4f4; padding: 12px 20px; }
.sora-input:focus { border-color: #9f273b; background-color: #fff; box-shadow: 0 0 0 3px rgba(159, 39, 59, 0.1) !important; }
.btn-send { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background-color: #9f273b; border: none; transition: all 0.2s; }
.btn-send:hover:not(:disabled) { background-color: #7a1c2d; transform: scale(1.05); }
.btn-send:disabled { background-color: #cccccc; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9f273b; }
.typing-indicator .dot { width: 6px; height: 6px; background-color: #9f273b; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
.typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); transform-origin: bottom right; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: scale(0.5) translateY(50px); }
.bounce-enter-active { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.bounce-leave-active { animation: bounce-in 0.3s reverse; }
@keyframes bounce-in { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
@media (max-width: 576px) { .chat-window { width: calc(100vw - 30px); height: 60vh; } }
</style>