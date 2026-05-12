<template>
  <div class="modal fade glass-modal" id="mapTrackingModal" tabindex="-1" aria-hidden="true" style="z-index: 1070;" ref="modalRef">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
        <div class="modal-header border-bottom bg-light p-3">
          <div class="d-flex align-items-center w-100">
            <div class="bg-brand text-white rounded p-2 me-3 d-flex align-items-center justify-content-center shadow-sm">
              <i class="bi bi-truck fs-5"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold text-dark mb-0">Hệ Thống Tracking SORA (Mapbox Premium)</h5>
              <p class="text-muted small mb-0 font-monospace">Lộ trình: 
                <span class="text-brand fw-bold">{{ mapData?.origin?.name || 'Đang tải...' }}</span> 
                <i class="bi bi-arrow-right mx-1"></i> 
                <span class="text-brand fw-bold">{{ mapData?.destination?.name || 'Đang tải...' }}</span>
              </p>
            </div>
            <select v-model="selectedWarehouseId" @change="initMap(true)" class="form-select form-select-sm border-brand text-brand fw-bold shadow-sm cursor-pointer bg-white me-3" style="width: auto; min-width: 140px; border-width: 2px;">
              <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">Kho: {{ wh.name }}</option>
            </select>
            <button type="button" class="btn-close" @click="hide"></button>
          </div>
        </div>
        
        <div class="modal-body p-0 position-relative map-container">
          <div id="tracking-map" style="height: 65vh; width: 100%; background-color: #f8f9fa; z-index: 1;"></div>
          <div v-if="isMapLoading" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style="z-index: 10;">
            <div class="spinner-border text-brand mb-2" style="width: 3rem; height: 3rem;"></div>
            <div class="fw-bold text-brand text-uppercase tracking-widest small">Đang kết nối vệ tinh Mapbox...</div>
          </div>
        </div>
        
        <div class="modal-footer border-top-0 bg-light p-3 justify-content-between align-items-center">
          <div class="small text-muted"><i class="bi bi-shield-check text-success me-1"></i>Dữ liệu đường bộ thời gian thực từ Mapbox Premium.</div>
          <button type="button" class="btn btn-secondary px-4 rounded-pill fw-bold shadow-sm" @click="hide">Đóng bản đồ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const modalRef = ref(null);
let bsModal = null;

const orderId = ref(null);
const orderStatus = ref(null);
const isMapLoading = ref(false);
const mapData = ref(null);

let leafletMap = null;
let routingLine = null;
let truckMarker = null;
let animationFrameId = null;

// TOKEN MAPBOX CỦA BẠN
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const warehouses = ref([
  { id: 'bmt', name: 'Buôn Ma Thuột', lat: 12.6667, lng: 108.0383 },
  { id: 'hn', name: 'Hà Nội', lat: 21.028511, lng: 105.804817 },
  { id: 'hcm', name: 'TP.HCM', lat: 10.762622, lng: 106.660172 },
  { id: 'dn', name: 'Đà Nẵng', lat: 16.054407, lng: 108.202164 },
  { id: 'ct', name: 'Cần Thơ', lat: 10.045162, lng: 105.746857 }
]);
const selectedWarehouseId = ref('bmt');

const loadLeafletScript = () => {
  return new Promise((resolve) => {
    if (window.L) return resolve();
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => resolve(); document.head.appendChild(script);
  });
};

const stopAnimation = () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };

// HÀM QUÉT ĐƯỜNG: ƯU TIÊN MAPBOX (ĐƯỜNG BỘ THẬT)
const fetchRobustRoute = async (p1, p2) => {
  try {
    // 1. Thử gọi Mapbox Directions API (Cực kỳ chính xác)
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    const res = await axios.get(url, { timeout: 8000 });
    if (res.data?.routes?.[0]) {
      return res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    }
  } catch (err) {
    console.warn("Mapbox lỗi hoặc hết hạn, chuyển sang OSRM dự phòng...");
    // 2. Dự phòng: OSRM (Đường bộ cộng đồng)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`;
    const resOsrm = await axios.get(osrmUrl);
    if (resOsrm.data?.routes?.[0]) return resOsrm.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  }
  throw new Error("No route found");
};

// Hàm nội suy (chống xe nhảy cóc)
const interpolateLine = (points, targetCount = 350) => {
  if (points.length >= targetCount) return points;
  const newPoints = [];
  const segments = Math.max(2, Math.ceil(targetCount / Math.max(1, points.length - 1)));
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]; const end = points[i+1];
    for (let j = 0; j < segments; j++) {
      newPoints.push([ start[0] + (end[0] - start[0]) * (j / segments), start[1] + (end[1] - start[1]) * (j / segments) ]);
    }
  }
  newPoints.push(points[points.length - 1]);
  return newPoints;
};

const initMap = async (isAutoTriggered = false) => {
  if (!orderId.value) return;
  isMapLoading.value = true;
  stopAnimation();

  try {
    const res = await axios.get(`${API_URL}/admin/orders/${orderId.value}/simulation`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } 
    });
    mapData.value = res.data.data;

    const selectedWh = warehouses.value.find(w => w.id === selectedWarehouseId.value);
    if (selectedWh) mapData.value.origin = { name: `SORA (${selectedWh.name})`, lat: selectedWh.lat, lng: selectedWh.lng };

    const p1 = [mapData.value.origin.lat, mapData.value.origin.lng];
    const p2 = [mapData.value.destination.lat, mapData.value.destination.lng];

    await loadLeafletScript();

    if (!leafletMap) {
      leafletMap = window.L.map('tracking-map', { scrollWheelZoom: false }).setView(p1, 6);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(leafletMap);
    } else {
      if (routingLine) leafletMap.removeLayer(routingLine);
      if (truckMarker) leafletMap.removeLayer(truckMarker);
    }

    nextTick(() => { leafletMap.invalidateSize(); });

    let routeCoords = [];
    try {
      routeCoords = await fetchRobustRoute(p1, p2);
    } catch (err) {
      routeCoords = [p1, p2]; // Fallback chim bay nếu cả 2 API sập
    }
    
    routeCoords = interpolateLine(routeCoords, 400);

    routingLine = window.L.polyline(routeCoords, { color: '#009981', weight: 6, opacity: 0.9 }).addTo(leafletMap);
    leafletMap.fitBounds(routingLine.getBounds(), { padding: [50, 50] });

    const iconA = window.L.divIcon({ html: `<div class="map-icon-point">A</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    const iconB = window.L.divIcon({ html: `<div class="map-icon-point">B</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    window.L.marker(p1, { icon: iconA }).bindPopup('Xuất phát').addTo(leafletMap);
    window.L.marker(p2, { icon: iconB }).bindPopup('Điểm nhận').addTo(leafletMap);

    const truckIcon = window.L.divIcon({ html: `<div class="map-icon-truck"><i class="bi bi-truck"></i></div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
    let currentIndex = 0; let speed = 0;
    const totalPoints = routeCoords.length;

    if (orderStatus.value === 'delivered') {
      if (isAutoTriggered) { currentIndex = 0; speed = Math.max(1, Math.floor(totalPoints / 100)); }
      else { currentIndex = totalPoints - 1; speed = 0; }
    } else if (orderStatus.value === 'shipping') {
      currentIndex = 0; speed = Math.max(1, Math.floor(totalPoints / 400));
    }

    truckMarker = window.L.marker(routeCoords[currentIndex], { icon: truckIcon }).addTo(leafletMap);
    isMapLoading.value = false;

    if (speed > 0) {
      const animate = () => {
        if (currentIndex < totalPoints - 1) {
          currentIndex += speed;
          if (currentIndex >= totalPoints) currentIndex = totalPoints - 1;
          truckMarker.setLatLng(routeCoords[currentIndex]);
          animationFrameId = requestAnimationFrame(animate);
        } else {
          if (orderStatus.value === 'shipping') { currentIndex = 0; animationFrameId = requestAnimationFrame(animate); }
          else { truckMarker.bindPopup('<b class="text-success">GIAO HÀNG THÀNH CÔNG!</b>').openPopup(); }
        }
      };
      animate();
    }
  } catch (e) {
    isMapLoading.value = false;
  }
};

const show = (id, whId = 'bmt', status = 'pending', autoRun = false) => {
    orderId.value = id; selectedWarehouseId.value = whId; orderStatus.value = status;
    if (!bsModal) {
        bsModal = new window.bootstrap.Modal(modalRef.value, { backdrop: 'static' });
        modalRef.value.addEventListener('hidden.bs.modal', stopAnimation);
    }
    bsModal.show();
    initMap(autoRun);
};

const hide = () => { stopAnimation(); if (bsModal) bsModal.hide(); };

onBeforeUnmount(() => { stopAnimation(); if (bsModal) bsModal.dispose(); });

defineExpose({ show, hide });
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.tracking-widest { letter-spacing: 2px; }
.glass-modal { backdrop-filter: blur(5px); background-color: rgba(0, 0, 0, 0.3); }
</style>

<style>
.map-icon-point { background-color: #212529; color: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid #e7ce7d; font-weight: bold; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); }
.map-icon-truck { background-color: #009981; color: #fff; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0, 153, 129, 0.5); font-size: 20px; }
</style>