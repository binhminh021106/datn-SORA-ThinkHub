<template>
  <div class="tier-card mb-4 rounded-3 overflow-hidden shadow-sm" :class="tierCardClass">
    <div class="tier-card-bg">
      <div class="tier-card-body p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <!-- Thông tin hạng hiện tại -->
          <div class="d-flex align-items-center gap-3">
            <div class="tier-card-icon-wrap" :class="tierBadgeClass">
              <span class="tier-card-svg" v-html="tierSvgIconLg"></span>
            </div>
            <div>
              <div class="tier-card-rank-label">Hạng thành viên</div>
              <div class="tier-card-rank-name">{{ currentTierInfo.name || 'Thành viên mới' }}</div>
            </div>
          </div>
          <!-- Quyền lợi -->
          <div class="d-flex gap-4 flex-wrap">
            <div class="tier-benefit-item" v-if="currentTierInfo.discount">
              <span class="tier-benefit-value">{{ currentTierInfo.discount }}%</span>
              <span class="tier-benefit-label">Giảm giá</span>
            </div>
            <div class="tier-benefit-item" v-if="currentTierInfo.serviceQuota">
              <span class="tier-benefit-value">{{ currentTierInfo.serviceQuota }}</span>
              <span class="tier-benefit-label">Dịch vụ/năm</span>
            </div>
            <div class="tier-benefit-item">
              <span class="tier-benefit-value">{{ formatCurrency(form.accumulated_spent || 0) }}</span>
              <span class="tier-benefit-label">Đã chi tiêu</span>
            </div>
          </div>
        </div>

        <!-- Thanh tiến trình đến hạng tiếp theo -->
        <div v-if="nextTierInfo" class="tier-progress-section mt-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="tier-progress-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#9f273b" style="vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10" fill="none" stroke="#9f273b" stroke-width="2"/><path d="M12 8v4l3 3" fill="none" stroke="#9f273b" stroke-width="2" stroke-linecap="round"/></svg>
              Hạng tiếp theo: <strong>{{ nextTierInfo.name }}</strong>
            </span>
            <span class="tier-progress-label">
              {{ formatCurrency(form.accumulated_spent || 0) }} / {{ formatCurrency(nextTierInfo.min_spent) }}
            </span>
          </div>
          <div class="tier-progress-bar">
            <div class="tier-progress-fill" :style="{ width: tierProgressPercent + '%' }"></div>
          </div>
          <div class="tier-progress-hint mt-2">
            Còn <strong>{{ formatCurrency(amountToNextTier) }}</strong> nữa để lên hạng {{ nextTierInfo.name }}
          </div>
        </div>
        <div v-else class="tier-progress-section mt-3">
          <div class="tier-progress-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ffd700" style="vertical-align: -2px; margin-right: 3px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Chúc mừng! Bạn đã đạt hạng thành viên <strong>cao nhất</strong>.
          </div>
        </div>

        <!-- Roadmap các hạng -->
        <div class="tier-roadmap mt-4" v-if="allTiers.length > 0">
          <div class="tier-roadmap-track">
            <div class="tier-roadmap-line"></div>
            <!-- Mốc mặc định (0đ) -->
            <div class="tier-roadmap-point" :class="{ 'achieved': true }">
              <div class="tier-roadmap-dot"></div>
              <div class="tier-roadmap-info">
                <span class="tier-roadmap-name">Thành viên</span>
              </div>
            </div>
            <div v-for="tier in allTiers" :key="tier.id" class="tier-roadmap-point"
                 :class="{ 'achieved': isTierAchieved(tier) }">
              <div class="tier-roadmap-dot"></div>
              <div class="tier-roadmap-info">
                <span class="tier-roadmap-name">{{ tier.name }}</span>
                <span class="tier-roadmap-spent">{{ formatCurrencyShort(tier.min_spent) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
});

const allTiers = computed(() => props.form.all_tiers || []);

const currentTierInfo = computed(() => {
  if (props.form.tier) {
    return {
      name: props.form.tier.name,
      discount: parseFloat(props.form.tier.discount_percent) || 0,
      serviceQuota: props.form.tier.yearly_service_quota || 0,
      minSpent: parseFloat(props.form.tier.min_spent) || 0,
      iconUrl: props.form.tier.icon_url || null,
    };
  }
  return { name: '', discount: 0, serviceQuota: 0, minSpent: 0, iconUrl: null };
});

const nextTierInfo = computed(() => {
  const tiers = allTiers.value;
  if (!tiers.length) return null;
  const spent = props.form.accumulated_spent || 0;
  return tiers.find(t => parseFloat(t.min_spent) > spent) || null;
});

const tierProgressPercent = computed(() => {
  if (!nextTierInfo.value) return 100;
  const spent = props.form.accumulated_spent || 0;
  const target = parseFloat(nextTierInfo.value.min_spent);
  if (target <= 0) return 100;
  return Math.min(Math.round((spent / target) * 100), 100);
});

const amountToNextTier = computed(() => {
  if (!nextTierInfo.value) return 0;
  const spent = props.form.accumulated_spent || 0;
  return Math.max(parseFloat(nextTierInfo.value.min_spent) - spent, 0);
});

const isTierAchieved = (tier) => {
  return (props.form.accumulated_spent || 0) >= parseFloat(tier.min_spent);
};

const tierBadgeClass = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-silver';
  return 'tier-default';
});

const svgStar = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgShield = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const svgCrown = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M2 20h20v2H2zM4 17l2-10 4 4 2-6 2 6 4-4 2 10H4z"/></svg>`;
const svgDiamond = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.5L5.5 9h13L12 17.5z"/></svg>`;

const tierSvgIconLg = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return svgDiamond(28, 'grad-diamond');
  if (name.includes('vàng') || name.includes('gold')) return svgCrown(28, 'grad-gold');
  if (name.includes('bạc') || name.includes('silver')) return svgShield(28, 'grad-silver');
  return svgStar(28, 'grad-default');
});

const tierCardClass = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-card-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-card-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-card-silver';
  return 'tier-card-default';
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const formatCurrencyShort = (val) => {
  const num = parseFloat(val);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' tỷ';
  if (num >= 1000000) return (num / 1000000).toFixed(0) + ' tr';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
};
</script>

<style scoped>
/* CARD HẠNG THÀNH VIÊN */
.tier-card {
  border: 1px solid transparent;
  position: relative;
}

.tier-card-bg {
  position: relative;
  overflow: hidden;
}

.tier-card-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.08;
  pointer-events: none;
}

.tier-card-default {
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  border-color: #e0e0e0;
}
.tier-card-default .tier-card-bg::before { background: #888; }

.tier-card-silver {
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  border-color: #c0c0c0;
}
.tier-card-silver .tier-card-bg::before { background: #aaa; }

.tier-card-gold {
  background: linear-gradient(135deg, #fffdf5 0%, #fff8e1 100%);
  border-color: #ffd54f;
}
.tier-card-gold .tier-card-bg::before { background: #ffd700; }

.tier-card-diamond {
  background: linear-gradient(135deg, #f0fcff 0%, #e0f7fa 100%);
  border-color: #80deea;
}
.tier-card-diamond .tier-card-bg::before { background: #26c6da; }

.tier-card-body { position: relative; z-index: 1; }

.tier-card-icon-wrap {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.tier-card-icon-wrap.tier-default { background: #f5f5f5; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.tier-card-icon-wrap.tier-silver { background: linear-gradient(135deg, #f0f0f0, #dcdcdc); box-shadow: 0 2px 10px rgba(150,150,150,0.2); }
.tier-card-icon-wrap.tier-gold { background: linear-gradient(135deg, #fff8e1, #fce38a); box-shadow: 0 3px 14px rgba(245,166,35,0.25); }
.tier-card-icon-wrap.tier-diamond { background: linear-gradient(135deg, #e0f7fa, #b2ebf2); box-shadow: 0 3px 14px rgba(77,208,225,0.25); }

.tier-card-svg { display: flex; align-items: center; line-height: 0; }

.tier-card-rank-label {
  font-size: 0.72rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.tier-card-rank-name {
  font-size: 1.3rem;
  font-weight: 800;
  font-family: "Playfair Display", serif;
  color: #333;
  line-height: 1.2;
}

.tier-benefit-item {
  text-align: center;
  min-width: 70px;
}

.tier-benefit-value {
  display: block;
  font-size: 1.05rem;
  font-weight: 800;
  color: #9f273b;
  line-height: 1.2;
}

.tier-benefit-label {
  display: block;
  font-size: 0.68rem;
  color: #888;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tier-progress-section {
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.tier-progress-label {
  font-size: 0.78rem;
  color: #666;
}

.tier-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0,0,0,0.08);
  border-radius: 10px;
  overflow: hidden;
}

.tier-progress-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #9f273b, #e7ce7d);
  transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

.tier-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.tier-progress-hint {
  font-size: 0.75rem;
  color: #888;
}

.tier-roadmap {
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.tier-roadmap-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  padding: 0 12px;
}

.tier-roadmap-line {
  position: absolute;
  top: 10px;
  left: 24px;
  right: 24px;
  height: 3px;
  background: #e0e0e0;
  z-index: 0;
  border-radius: 2px;
}

.tier-roadmap-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  min-width: 55px;
}

.tier-roadmap-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  margin-bottom: 6px;
  transition: all 0.3s;
}

.tier-roadmap-point.achieved .tier-roadmap-dot {
  background: linear-gradient(135deg, #9f273b, #e7ce7d);
  box-shadow: 0 2px 8px rgba(159,39,59,0.35);
}

.tier-roadmap-info {
  text-align: center;
}

.tier-roadmap-name {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #666;
}

.tier-roadmap-point.achieved .tier-roadmap-name {
  color: #9f273b;
}

.tier-roadmap-spent {
  display: block;
  font-size: 0.62rem;
  color: #aaa;
  margin-top: 1px;
}
</style>
