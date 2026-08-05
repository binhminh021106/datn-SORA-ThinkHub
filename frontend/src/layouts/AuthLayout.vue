<template>
  <main class="auth-layout">
    <router-view />
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100dvh;
}

.auth-home-link-mobile {
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid rgba(231, 206, 125, 0.65);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.92);
  box-shadow: 0 8px 20px rgba(75, 30, 40, 0.1);
  color: #8f2034;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.auth-home-link-mobile:hover {
  background: #9f273b;
  color: #fff;
  transform: translateY(-2px);
}

@media (max-width: 767.98px) {
  .auth-home-link-mobile {
    display: inline-flex;
  }
}
</style>
