<template>
  <div class="row gx-2 gy-5 gy-lg-0" aria-hidden="true">
    <div class="col-lg-7">
      <div class="bg-white p-4 p-md-5 shadow-sm border border-light-subtle">
        <SoraSkeleton width="44%" height="28px" radius="4px" class="mb-4" />
        <div class="row g-4">
          <div class="col-12">
            <SoraSkeleton height="16px" width="150px" radius="4px" class="mb-2" />
            <SoraSkeleton height="45px" radius="0" />
          </div>
          <div class="col-md-6">
            <SoraSkeleton height="16px" width="100px" radius="4px" class="mb-2" />
            <SoraSkeleton height="45px" radius="0" />
          </div>
          <div class="col-md-6">
            <SoraSkeleton height="16px" width="100px" radius="4px" class="mb-2" />
            <SoraSkeleton height="45px" radius="0" />
          </div>
          <div class="col-12">
             <SoraSkeleton height="16px" width="180px" radius="4px" class="mb-2" />
             <SoraSkeleton height="45px" radius="0" />
          </div>
          <div class="col-12 mt-4">
            <SoraSkeleton height="16px" width="130px" radius="4px" class="mb-2" />
            <SoraSkeleton height="60px" radius="0" />
          </div>
        </div>
        
        <SoraSkeleton width="42%" height="28px" radius="4px" class="mt-5 mb-4" />
        <div class="d-flex flex-column gap-3">
          <SoraSkeleton height="80px" radius="0" />
          <SoraSkeleton height="80px" radius="0" />
          <SoraSkeleton height="80px" radius="0" />
        </div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="bg-white border border-light-subtle shadow-sm">
        <div class="p-4 pb-3 border-bottom">
           <SoraSkeleton width="50%" height="24px" radius="4px" />
        </div>
        <div class="p-4 border-bottom">
           <SoraListSkeleton :rows="3" image-size="75px" />
        </div>
        <div class="p-4 bg-white">
          <div class="d-flex justify-content-between mb-3">
            <SoraSkeleton width="100px" height="16px" />
            <SoraSkeleton width="120px" height="16px" />
          </div>
          <div class="d-flex justify-content-between mb-4 pb-3 border-bottom">
            <SoraSkeleton width="120px" height="16px" />
            <SoraSkeleton width="80px" height="16px" />
          </div>
          <div class="d-flex justify-content-between mt-4 pt-3 border-top border-2 border-dark">
            <SoraSkeleton width="130px" height="20px" />
            <SoraSkeleton width="150px" height="30px" />
          </div>
        </div>
        <div class="p-4 pt-0 bg-white">
           <SoraSkeleton width="100%" height="56px" radius="0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
import SoraListSkeleton from './SoraListSkeleton.vue';
</script>
