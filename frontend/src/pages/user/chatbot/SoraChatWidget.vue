<template>
  <div class="live-chat-wrapper z-index-max font-luxury">
    <button 
      v-if="!isOpen && !hideFab"
      class="live-chat-fab btn rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed transition-transform bg-primary"
      :class="isOpen ? 'scale-0' : 'scale-100'"
      @click="toggleChat"
      title="Chat trực tiếp với nhân viên"
    >
      <i class="bi bi-headset text-white fs-4"></i>
      <span class="position-absolute top-0 start-0 translate-middle p-2 bg-danger border border-light rounded-circle">
        <span class="visually-hidden">New messages</span>
      </span>
    </button>

    <div 
      class="live-chat-window position-fixed bg-white shadow-lg overflow-hidden d-flex flex-column transition-all"
      :class="isOpen ? 'chatbot-open' : 'chatbot-closed'"
      style="width: 380px; height: 550px; border-radius: 16px; right: 25px; bottom: 25px; z-index: 999999;"
    >
      <!-- Header -->
      <div class="bg-primary p-3 position-relative d-flex align-items-center justify-content-between text-white">
        <div class="d-flex align-items-center gap-2">
          <div class="position-relative">
            <div class="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="bi bi-headset fs-5"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle" style="margin-bottom: 2px; margin-right: 2px;"></span>
          </div>
          <div>
            <h6 class="fw-bold mb-0 lh-1">CSKH Trực Tuyến</h6>
            <small class="text-white-50" style="font-size: 0.7rem;">Nhân viên sẽ trả lời ngay</small>
          </div>
        </div>
        <button @click="toggleChat" class="btn btn-link text-white opacity-75 p-0 border-0 shadow-none">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-grow-1 chat-body-scroll p-3" ref="chatBodyRef" style="background-color: #f8f9fa;" @click="closeAllPickers">
        <div v-for="msg in messages" :key="msg.id" :id="'msg-' + msg.id" class="d-flex mb-3 msg-row" :class="msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'" @mouseenter="hoveredMsgId = msg.id" @mouseleave="hoveredMsgId = null">
          <div v-if="msg.type === 'admin'" class="me-2 mt-auto">
            <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 0.7rem;">NV</div>
          </div>

          <!-- Image message -->
          <template v-if="msg.message_type === 'image'">
            <div class="msg-bubble-wrap" :class="msg.type === 'user' ? 'align-items-end' : 'align-items-start'">
              <div style="max-width: 100%; position: relative;">
                <!-- Quote block -->
                <div v-if="msg.reply_to" class="quote-block mb-1" :class="msg.type === 'user' ? 'quote-block-user' : 'quote-block-admin'" @click="scrollToMessage(msg.reply_to.id)" style="cursor: pointer;">
                  <p class="quote-text"><i class="bi bi-reply-fill me-1 opacity-75"></i>{{ msg.reply_to.text || (msg.reply_to.message_type === 'image' ? '📷 Hình ảnh' : '📎 File') }}</p>
                </div>
                <img :src="msg.file_url" :alt="msg.file_name || 'image'" class="user-chat-image" @click="openLightbox(msg.file_url)" />
                <div><small :class="msg.type === 'user' ? 'text-white-50' : 'text-muted'" style="font-size: 0.65rem;">{{ msg.time }}</small></div>
              </div>
              <!-- Action bar beside bubble -->
              <div class="msg-actions-side" v-show="hoveredMsgId === msg.id">
                <button class="msg-action-btn-pro" @click.stop="setReply(msg)" title="Trả lời"><i class="bi bi-reply-fill"></i></button>
              </div>
            </div>
          </template>

          <!-- File message -->
          <template v-else-if="msg.message_type === 'file'">
            <div class="msg-bubble-wrap" :class="msg.type === 'user' ? 'align-items-end' : 'align-items-start'">
              <div class="p-2 shadow-sm rounded" :class="msg.type === 'user' ? 'bg-primary text-white text-end rounded-user' : 'bg-white border text-start rounded-bot'" style="max-width: 100%;">
                <!-- Quote block -->
                <div v-if="msg.reply_to" class="quote-block mb-1" :class="msg.type === 'user' ? 'quote-block-user' : 'quote-block-admin'" @click="scrollToMessage(msg.reply_to.id)" style="cursor: pointer;">
                  <p class="quote-text"><i class="bi bi-reply-fill me-1 opacity-75"></i>{{ msg.reply_to.text || (msg.reply_to.message_type === 'image' ? '📷 Hình ảnh' : '📎 File') }}</p>
                </div>
                <a :href="msg.file_url" target="_blank" rel="noopener noreferrer" download class="user-file-link" :class="msg.type === 'user' ? 'text-white' : 'text-dark'">
                  <i class="bi bi-file-earmark-arrow-down-fill me-1"></i>
                  <span style="font-size: 0.82rem; font-weight: 600;">{{ msg.file_name || msg.text }}</span>
                  <span v-if="msg.file_size" style="font-size: 0.65rem; opacity: 0.75; display: block;">{{ msg.file_size }}</span>
                </a>
                <small :class="msg.type === 'user' ? 'text-white-50' : 'text-muted'" style="font-size: 0.65rem;">{{ msg.time }}</small>
              </div>
              <!-- Action bar beside bubble -->
              <div class="msg-actions-side" v-show="hoveredMsgId === msg.id">
                <button class="msg-action-btn-pro" @click.stop="setReply(msg)" title="Trả lời"><i class="bi bi-reply-fill"></i></button>
              </div>
            </div>
          </template>

          <!-- Text/Emoji message -->
          <template v-else>
            <div class="msg-bubble-wrap" :class="msg.type === 'user' ? 'align-items-end' : 'align-items-start'">
              <div class="p-2 shadow-sm rounded" :class="msg.type === 'user' ? 'bg-primary text-white text-end rounded-user' : 'bg-white border text-start rounded-bot'" style="max-width: 100%;">
                <!-- Quote block -->
                <div v-if="msg.reply_to" class="quote-block mb-1" :class="msg.type === 'user' ? 'quote-block-user' : 'quote-block-admin'" @click="scrollToMessage(msg.reply_to.id)" style="cursor: pointer;">
                  <p class="quote-text"><i class="bi bi-reply-fill me-1 opacity-75"></i>{{ msg.reply_to.text || (msg.reply_to.message_type === 'image' ? '📷 Hình ảnh' : '📎 File') }}</p>
                </div>
                <p class="mb-0 text-break" style="font-size: 0.9rem; line-height: 1.4;" v-text="msg.text"></p>
                <small :class="msg.type === 'user' ? 'text-white-50' : 'text-muted'" style="font-size: 0.65rem;">{{ msg.time }}</small>
              </div>
              <!-- Action bar beside bubble -->
              <div class="msg-actions-side" v-show="hoveredMsgId === msg.id">
                <button class="msg-action-btn-pro" @click.stop="setReply(msg)" title="Trả lời"><i class="bi bi-reply-fill"></i></button>
              </div>
            </div>
          </template>
        </div>

        
        <div v-if="isTyping" class="mb-3 d-flex justify-content-start">
          <div class="me-2 mt-auto">
             <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 0.7rem;">NV</div>
          </div>
          <div class="bg-white p-2 shadow-sm rounded-bot border d-flex align-items-center gap-1">
             <span class="spinner-grow spinner-grow-sm text-secondary" style="width: 0.5rem; height: 0.5rem;"></span>
             <span class="spinner-grow spinner-grow-sm text-secondary" style="width: 0.5rem; height: 0.5rem;"></span>
             <span class="spinner-grow spinner-grow-sm text-secondary" style="width: 0.5rem; height: 0.5rem;"></span>
          </div>
        </div>
      </div>

      <!-- Reply Preview Bar -->
      <div v-if="replyTo" class="reply-preview-bar">
        <div class="reply-preview-content">
          <p class="reply-preview-text mb-0"><i class="bi bi-reply-fill me-1 text-primary"></i>{{ replyTo.text || (replyTo.message_type === 'image' ? '📷 Hình ảnh' : '📎 File') }}</p>
        </div>
        <button class="reply-cancel-btn" @click="clearReply" title="Hủy trả lời"><i class="bi bi-x"></i></button>
      </div>

      <!-- File Preview (compact) -->
      <div v-if="selectedFile" class="file-preview-compact">
        <img v-if="selectedFilePreview" :src="selectedFilePreview" alt="preview" class="preview-thumb-sm" />
        <i v-else class="bi bi-file-earmark-fill preview-file-icon"></i>
        <span class="preview-file-name">{{ selectedFile.name }}</span>
        <button class="preview-remove-btn" @click="removeSelectedFile"><i class="bi bi-x"></i></button>
      </div>

      <!-- Footer -->
      <div class="bg-white border-top" style="position: relative;">
        <!-- Emoji Picker -->
        <div v-if="showEmojiPicker" class="user-emoji-picker" @click.stop>
          <div class="emoji-categories">
            <button
              v-for="cat in emojiCategories"
              :key="cat.name"
              class="emoji-cat-btn"
              :class="{ active: activeCategory === cat.name }"
              @click="activeCategory = cat.name"
              :title="cat.label"
            >{{ cat.icon }}</button>
          </div>
          <div class="emoji-grid">
            <button
              v-for="emoji in filteredEmojis"
              :key="emoji"
              class="emoji-btn"
              @click.stop="insertEmoji(emoji)"
            >{{ emoji }}</button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="d-flex align-items-center gap-1 px-2 pt-1">
          <!-- File Button -->
          <button
            class="chat-toolbar-btn"
            title="Đính kèm file"
            @click.stop="triggerFileInput"
            :disabled="!isLoggedIn"
          >
            <i class="bi bi-paperclip"></i>
          </button>
          <input ref="fileInputRef" type="file" style="display:none" @change="onFileSelected" accept="*/*" />
          <!-- Emoji Button -->
          <button
            class="chat-toolbar-btn"
            title="Emoji"
            @click.stop="toggleEmojiPicker"
            :disabled="!isLoggedIn"
          >
            <i class="bi bi-emoji-smile"></i>
          </button>
        </div>

        <form @submit.prevent="sendMessage" class="d-flex flex-column px-2 pb-2">
          <div class="d-flex align-items-center gap-2">
            <input 
              type="text" 
              v-model="inputText" 
              class="form-control rounded-pill bg-light border-0 px-3 py-2" 
              placeholder="Nhập tin nhắn..."
              :disabled="!isLoggedIn"
              ref="messageInputRef"
              style="font-size: 0.88rem;"
              maxlength="500"
            >
            <button
              type="submit"
              class="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
              style="width: 38px; height: 38px; flex-shrink: 0;"
              :disabled="(!inputText.trim() && !selectedFile) || !isLoggedIn"
            >
              <i class="bi bi-send-fill" style="font-size: 0.85rem;"></i>
            </button>
          </div>
          <div class="text-end px-2 pt-1" v-if="isLoggedIn">
             <small class="text-muted" style="font-size: 0.65rem;">{{ inputText.length }}/500 ký tự</small>
          </div>
        </form>
        <div v-if="!isLoggedIn" class="text-center pb-2 text-danger" style="font-size: 0.75rem;">
          Vui lòng đăng nhập để gửi tin nhắn cho CSKH!
        </div>
      </div>

    </div>

    <!-- Image Lightbox -->
    <div v-if="lightboxUrl" class="user-lightbox" @click="lightboxUrl = null">
      <img :src="lightboxUrl" alt="preview" class="user-lightbox-img" @click.stop />
      <button class="user-lightbox-close" @click="lightboxUrl = null"><i class="bi bi-x-lg"></i></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch, defineProps, defineEmits } from 'vue';
import clientApiClient from '@/utils/clientApiClient';
import { getToken } from '@/composables/useUtilities';

const props = defineProps({
  visible: { type: Boolean, default: false },
  hideFab: { type: Boolean, default: false }
});
const emit = defineEmits(['update:visible']);

const isOpen = ref(false);
const inputText = ref('');
const isTyping = ref(false);
const chatBodyRef = ref(null);
const messageInputRef = ref(null);
const messages = ref([]);
const isSocketActive = ref(false);
const userId = ref(null);
const isLoggedIn = ref(false);

// File upload
const fileInputRef = ref(null);
const selectedFile = ref(null);
const selectedFilePreview = ref(null);

// Emoji (input)
const showEmojiPicker = ref(false);
const emojiSearch = ref('');
const activeCategory = ref('smileys');

// Lightbox
const lightboxUrl = ref(null);

// Reply
const hoveredMsgId = ref(null);
const replyTo = ref(null);

// clientApiClient handles auth token and headers automatically

// ===== EMOJI DATA =====
const emojiCategories = [
  { name: 'smileys', label: 'Mặt cười', icon: '😀' },
  { name: 'people', label: 'Con người', icon: '👋' },
  { name: 'animals', label: 'Động vật', icon: '🐶' },
  { name: 'food', label: 'Đồ ăn', icon: '🍕' },
  { name: 'travel', label: 'Du lịch', icon: '✈️' },
  { name: 'objects', label: 'Đồ vật', icon: '💡' },
  { name: 'symbols', label: 'Ký hiệu', icon: '❤️' },
];

const emojiData = {
  smileys: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐'],
  people: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾','🦵','🦶','👂','🦻','👃','👀','👅','👄','💋','🫂','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵'],
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐟','🐬','🐳','🐋','🦈'],
  food: ['🍕','🍔','🌮','🌯','🥙','🌭','🍟','🥚','🍳','🧇','🥞','🍞','🥐','🥖','🧀','🥗','🍲','🍜','🍝','🍛','🍣','🍱','🍗','🍖','🌽','🎂','🍰','🧁','🍭','🍬','🍫','🍩','🍦','🍨','🍮','☕','🍵','🧃','🥤','🧋','🍺','🍷','🍸'],
  travel: ['✈️','🚀','🚁','🛸','🚂','🚄','🚇','🚌','🚑','🚒','🚓','🚕','🚗','🚙','🛻','🏎️','🏍️','🛵','🚲','🛴','🚢','⚓','🛟','⵵','🗺️','🧭','🏔️','🌋','🏕️','🏖️','🏝️','🌅','🌄','🌉','🌃','🏙️'],
  objects: ['💡','🔦','🕯️','💰','💴','💵','💳','💎','⚖️','🪙','🔑','🗝️','🔐','🔒','🔓','🪪','📱','💻','⌨️','🖥️','📷','📹','🎥','📞','☎️','📺','📻','🧭','⏱️','⏰','⌚','🔬','🔭','🧲','🔧','🔨','⚒️','🛠️'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','♻️','✅','❎','🆗','🆙','🆒','🆕','🆓','🚫','⭕','❌','❗','❓','💯'],
};

const filteredEmojis = computed(() => {
  const list = emojiData[activeCategory.value] || [];
  if (!emojiSearch.value.trim()) return list;
  const all = Object.values(emojiData).flat();
  return all.filter(e => e.includes(emojiSearch.value));
});

// ===== HELPERS =====
const formatTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const formatTimeFromTs = (ts) => new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const formatFileSize = (bytes) => {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
};

const scrollToMessage = (id) => {
  const el = document.getElementById('msg-' + id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-msg');
    setTimeout(() => el.classList.remove('highlight-msg'), 2000);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

const openLightbox = (url) => { lightboxUrl.value = url; };

// ===== EMOJI (input) =====
const toggleEmojiPicker = () => { showEmojiPicker.value = !showEmojiPicker.value; };
const closeAllPickers = () => { showEmojiPicker.value = false; };
const insertEmoji = (emoji) => {
  inputText.value += emoji;
  messageInputRef.value?.focus();
};

// ===== REPLY =====
const setReply = (msg) => {
  replyTo.value = msg;
  nextTick(() => messageInputRef.value?.focus());
};
const clearReply = () => { replyTo.value = null; };

// ===== FILE UPLOAD =====
const triggerFileInput = () => { fileInputRef.value?.click(); };

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => { selectedFilePreview.value = ev.target.result; };
    reader.readAsDataURL(file);
  } else {
    selectedFilePreview.value = null;
  }
  e.target.value = '';
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  selectedFilePreview.value = null;
};

// ===== AUTH =====
const checkAuth = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.id) {
      userId.value = userData.id;
      isLoggedIn.value = true;
      return true;
    }
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    if (authData && authData.user) {
      userId.value = authData.user.id;
      isLoggedIn.value = true;
      return true;
    }
  } catch(e) {}
  isLoggedIn.value = false;
  return false;
};

const renderedIds = new Set();

// ===== FETCH HISTORY =====
const fetchHistory = async () => {
  if (!checkAuth()) {
    messages.value = [{ id: 'sys1', type: 'admin', message_type: 'text', text: 'Kính chào quý khách! Vui lòng Đăng Nhập ở góc trên cùng bên phải để chuyên viên có thể hỗ trợ trực tiếp.', time: 'Ngay bây giờ' }];
    return;
  }
  // Không gọi API nếu không có token
  const token = getToken();
  if (!token) {
    isLoggedIn.value = false;
    messages.value = [{ id: 'sys1', type: 'admin', message_type: 'text', text: 'Kính chào quý khách! Vui lòng Đăng Nhập ở góc trên cùng bên phải để chuyên viên có thể hỗ trợ trực tiếp.', time: 'Ngay bây giờ' }];
    return;
  }
  try {
    const res = await clientApiClient.get('/client/messages');
    if (res.data.status) {
      messages.value = res.data.data.map(m => {
        renderedIds.add(m.id);
        return {
          id: m.id,
          type: Number(m.sender_id) === Number(userId.value) ? 'user' : 'admin',
          message_type: m.message_type || 'text',
          text: m.content,
          file_url: m.file_url || null,
          file_name: m.file_name || null,
          file_size: m.file_size || null,
          time: formatTimeFromTs(m.created_at)
        };

      });

      if (messages.value.length === 0) {
        messages.value.push({ 
          id: 'sys2', 
          type: 'admin',
          message_type: 'text',
          text: 'Chào bạn! Đây là cổng chat hỗ trợ trực tiếp từ nhân viên thật. Mình có thể giúp gì cho bạn?', 
          time: 'Vừa xong' 
        });
      }
      scrollToBottom();
    }
  } catch(err) {
    if (err.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> hiện thông báo đăng nhập
      isLoggedIn.value = false;
      messages.value = [{ id: 'sys1', type: 'admin', message_type: 'text', text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để được hỗ trợ.', time: 'Ngay bây giờ' }];
    } else {
      console.error(err);
    }
  }
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && messages.value.length === 0) {
    // Chỉ fetch nếu đã đăng nhập
    if (checkAuth() && getToken()) {
      fetchHistory();
    } else {
      messages.value = [{ id: 'sys1', type: 'admin', message_type: 'text', text: 'Kính chào quý khách! Vui lòng Đăng Nhập ở góc trên cùng bên phải để chuyên viên có thể hỗ trợ trực tiếp.', time: 'Ngay bây giờ' }];
    }
  }
  if (isOpen.value) {
    nextTick(scrollToBottom);
  } else {
    emit('update:visible', false);
    showEmojiPicker.value = false;
  }
};

watch(() => props.visible, (visible) => {
  isOpen.value = visible;
  if (visible) {
    nextTick(scrollToBottom);
  }
});

// ===== SEND MESSAGE =====
const sendMessage = async () => {
  const hasText = inputText.value.trim();
  const hasFile = selectedFile.value;
  if ((!hasText && !hasFile) || !isLoggedIn.value) return;

  if (hasFile) {
    // Gửi file
    const file = selectedFile.value;
    const isImage = file.type.startsWith('image/');
    const tempId = Date.now();
    const currentReply = replyTo.value;
    clearReply();
    const tempMsg = {
      id: tempId,
      type: 'user',
      message_type: isImage ? 'image' : 'file',
      text: file.name,
      file_url: selectedFilePreview.value || '',
      file_name: file.name,
      file_size: formatFileSize(file.size),
      time: formatTime(),
      reply_to: currentReply || null
    };
    messages.value.push(tempMsg);
    removeSelectedFile();
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiver_id', 1);
      const res = await clientApiClient.post('/client/messages', formData);
      if (res.data.status) {
        const realMsg = res.data.data;
        const idx = messages.value.findIndex(m => m.id === tempId);
        if (idx !== -1) {
          renderedIds.add(realMsg.id);
          messages.value[idx] = {
            id: realMsg.id,
            type: 'user',
            message_type: realMsg.message_type,
            text: realMsg.content,
            file_url: realMsg.file_url,
            file_name: realMsg.file_name,
            file_size: realMsg.file_size,
            time: formatTimeFromTs(realMsg.created_at),
            reply_to: tempMsg.reply_to
          };
        }
      }
    } catch(err) {
      console.error(err);
      messages.value = messages.value.filter(m => m.id !== tempId);
    }
  } else {
    // Gửi text
    const userMessage = inputText.value;
    const currentReply = replyTo.value;
    clearReply();
    const tempMsg = {
      id: Date.now(),
      type: 'user',
      message_type: 'text',
      text: userMessage,
      time: formatTime(),
      reply_to: currentReply || null
    };
    messages.value.push(tempMsg);
    inputText.value = '';
    scrollToBottom();

    isTyping.value = true;
    scrollToBottom();

    try {
      const res = await clientApiClient.post('/client/messages', {
        receiver_id: 1,
        content: userMessage
      });

      if (res.data.status) {
        const realMsg = res.data.data;
        const idx = messages.value.findIndex(m => m.id === tempMsg.id);
        if (idx !== -1) {
          renderedIds.add(realMsg.id);
          messages.value[idx] = {
            id: realMsg.id,
            type: 'user',
            message_type: 'text',
            text: realMsg.content,
            time: formatTimeFromTs(realMsg.created_at),
            reply_to: tempMsg.reply_to
          };
        }
      }
    } catch(err) {
      console.error(err);
      messages.value = messages.value.filter(m => m.id !== tempMsg.id);
    } finally {
      isTyping.value = false;
    }
  }
};

// ===== WEBSOCKET =====
onMounted(() => {
  if (checkAuth()) {
    fetchHistory();

    if (window.Echo) {
      isSocketActive.value = true;
      window.Echo.private(`chat.${userId.value}`)
        .listen('.MessageSent', (e) => {
          const msg = e.message;
          if (renderedIds.has(msg.id)) return;
          renderedIds.add(msg.id);
          if (Number(msg.sender_id) === 1) {
            messages.value.push({
              id: msg.id,
              type: 'admin',
              message_type: msg.message_type || 'text',
              text: msg.content,
              file_url: msg.file_url || null,
              file_name: msg.file_name || null,
              file_size: msg.file_size || null,
              time: formatTimeFromTs(msg.created_at)
            });
            scrollToBottom();
            if (!isOpen.value) toggleChat();
          }
        });
    }

  }
});

onUnmounted(() => {
  if (window.Echo && userId.value) {
    window.Echo.leaveChannel(`chat.${userId.value}`);
  }
});
</script>

<style scoped>
.z-index-max { z-index: 100000; }
.transition-all { transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
.transition-transform { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

.live-chat-wrapper {
  position: fixed;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.live-chat-fab {
  width: 60px;
  height: 60px;
  z-index: 100001;
}

.scale-0 { transform: scale(0); opacity: 0; pointer-events: none; }
.scale-100 { transform: scale(1); opacity: 1; pointer-events: auto; }

.live-chat-window {
  transform-origin: bottom right;
  z-index: 100001;
}

.chatbot-open { transform: scale(1); opacity: 1; pointer-events: auto; }
.chatbot-closed { transform: scale(0.5); opacity: 0; pointer-events: none; }

.rounded-bot { border-radius: 4px 16px 16px 16px; }
.rounded-user { border-radius: 16px 4px 16px 16px; }

.chat-body-scroll {
  overflow-y: auto;
  scroll-behavior: smooth;
}
.chat-body-scroll::-webkit-scrollbar { width: 5px; }
.chat-body-scroll::-webkit-scrollbar-track { background: transparent; }
.chat-body-scroll::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 10px; }

/* ===== Image in chat ===== */
.user-chat-image {
  max-width: 200px;
  max-height: 180px;
  border-radius: 12px;
  cursor: zoom-in;
  object-fit: cover;
  display: block;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}
.user-chat-image:hover { transform: scale(1.02); }

/* ===== File link ===== */
.user-file-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-file-link:hover { text-decoration: underline; }

/* ===== File Preview compact ===== */
.file-preview-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #eff6ff;
  border-top: 1px solid #bfdbfe;
  font-size: 0.78rem;
}

.preview-thumb-sm {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #bfdbfe;
  flex-shrink: 0;
}

.preview-file-icon {
  font-size: 1.5rem;
  color: #1e40af;
  flex-shrink: 0;
}

.preview-file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e3a5f;
  font-weight: 500;
}

.preview-remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.8rem;
  flex-shrink: 0;
  line-height: 1;
}
.preview-remove-btn:hover { background: #fee2e2; color: #dc2626; }

/* ===== Toolbar buttons ===== */
.chat-toolbar-btn {
  background: none;
  border: none;
  color: #6b7280;
  padding: 4px 7px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s;
  line-height: 1;
}
.chat-toolbar-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #1e3a5f;
}
.chat-toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== EMOJI PICKER (User) ===== */
.user-emoji-picker {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 14px;
  box-shadow: 0 -8px 24px rgba(0,0,0,0.08);
  z-index: 200;
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.emoji-categories {
  display: flex;
  padding: 6px 8px;
  gap: 2px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
}

.emoji-cat-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px 6px;
  border-radius: 7px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.emoji-cat-btn:hover, .emoji-cat-btn.active { background: #f3f4f6; }

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  padding: 6px;
  gap: 2px;
  max-height: 160px;
  overflow-y: auto;
}

.emoji-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 3px;
  border-radius: 6px;
  transition: background 0.1s;
  line-height: 1;
  text-align: center;
}
.emoji-btn:hover { background: #f3f4f6; }

/* ===== LIGHTBOX ===== */
.user-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.user-lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.user-lightbox-close {
  position: fixed;
  top: 20px;
  right: 24px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-lightbox-close:hover { background: rgba(255,255,255,0.3); }

/* ===== MSG BUBBLE WRAP ===== */
.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  position: relative;
}

/* ===== ACTION BAR (beside bubble) ===== */
.msg-actions-side {
  display: flex;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  transform: translateY(-50%) scale(0.9);
  position: absolute;
  top: 50%;
}
.msg-row.justify-content-end .msg-actions-side {
  right: calc(100% + 8px);
}
.msg-row.justify-content-start .msg-actions-side {
  left: calc(100% + 8px);
}
.msg-row:hover .msg-actions-side {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(-50%) scale(1);
}

.highlight-msg {
  animation: highlight 2s ease;
}
@keyframes highlight {
  0% { background-color: rgba(59, 130, 246, 0.2); border-radius: 8px; }
  100% { background-color: transparent; border-radius: 8px; }
}

.msg-action-btn-pro {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0,0,0,0.05);
  color: #6b7280;
  cursor: pointer;
  font-size: 0.95rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}
.msg-action-btn-pro:hover { 
  background: #3b82f6; 
  color: white; 
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

/* ===== REPLY PREVIEW BAR ===== */
.reply-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px;
  background: #eff6ff;
  border-top: 2px solid #93c5fd;
  border-left: 4px solid #3b82f6;
  animation: slideUp 0.18s ease;
}
.reply-preview-content { flex: 1; min-width: 0; }
.reply-preview-label {
  display: block;
  font-size: 0.72rem;
  color: #3b82f6;
  font-weight: 600;
  margin-bottom: 2px;
}
.reply-preview-text {
  margin: 0;
  font-size: 0.78rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.reply-cancel-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.15s;
}
.reply-cancel-btn:hover { background: #fee2e2; color: #dc2626; }

/* ===== QUOTE BLOCK in bubble ===== */
.quote-block {
  border-radius: 6px;
  padding: 5px 10px;
  margin-bottom: 6px;
  font-size: 0.78rem;
}
.quote-block-user {
  background: rgba(255,255,255,0.2);
  border-left: 3px solid rgba(255,255,255,0.7);
}
.quote-block-admin {
  background: #f0f4ff;
  border-left: 3px solid #93c5fd;
}
.quote-author {
  display: block;
  font-weight: 700;
  font-size: 0.7rem;
  margin-bottom: 2px;
  opacity: 0.85;
}
.quote-text {
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
