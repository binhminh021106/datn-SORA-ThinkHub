<template>
  <section class="home-stats-band position-relative overflow-hidden">
    <div class="banner-ambient"></div>
    <div class="banner-glow banner-glow-left"></div>
    <div class="banner-glow banner-glow-right"></div>
    <div class="banner-monogram font-serif">SORA</div>
    <div class="banner-line-art banner-line-art-left d-none d-md-block"></div>
    <div class="banner-line-art banner-line-art-right d-none d-md-block"></div>

    <div class="stat-container position-relative z-index-2">
      <StatItem v-for="(item, index) in stats" :key="'stat-'+index" :item="item" :index="index" />
    </div>
  </section>
</template>

<script setup>
import StatItem from './StatItem.vue';

defineProps({
  stats: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.home-stats-band {
  background: linear-gradient(90deg, #380710 0%, #7d1225 50%, #380710 100%);
  position: relative;
  color: #fff;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.4);
}

@media (max-width: 767px) {
  .home-stats-band {
    padding: 1.25rem 1rem;
  }
}

.banner-ambient, .banner-glow {
  display: none;
}

.banner-glow-left {
  left: -80px;
  bottom: -80px;
}

.banner-glow-right {
  right: -80px;
  top: -80px;
}

.banner-monogram {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  text-align: center;
  color: rgba(231, 206, 125, 0.06);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
}

.banner-line-art {
  position: absolute;
  width: 70px;
  height: 70px;
  border: 1px solid rgba(231, 206, 125, 0.5);
  box-shadow: 0 0 15px rgba(231, 206, 125, 0.1) inset;
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(231, 206, 125, 0.3);
}

.banner-line-art-left {
  left: 8%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.banner-line-art-right {
  right: 8%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.stat-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  position: relative;
  z-index: 10;
  max-width: 100%;
  margin: 0 auto;
}
</style>
