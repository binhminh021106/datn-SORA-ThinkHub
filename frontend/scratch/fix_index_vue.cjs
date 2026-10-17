const fs = require('fs');

let content = fs.readFileSync('D:/laragon/www/datn-SORA-ThinkHub/frontend/src/pages/admin/setting/Index.vue', 'utf8');

// Replace activePlaceholderClientUrl
content = content.replace(
`const activePlaceholderClientUrl = computed(() => {
    if (placeholderApplyTarget.value === 'both') return placeholderClientUrl.value;
    if (placeholderApplyTarget.value === 'client') return placeholderClientUrl.value;
    return settingsStore.settings.placeholder_client_active || defaultPlaceholder;
});`,
`const activePlaceholderClientUrl = computed(() => {
    if (placeholderClientUrl.value && (placeholderApplyTarget.value === 'both' || placeholderApplyTarget.value === 'client')) return placeholderClientUrl.value;
    return settingsStore.settings.placeholder_client_active || defaultPlaceholder;
});`);

// Replace activePlaceholderAdminUrl
content = content.replace(
`const activePlaceholderAdminUrl = computed(() => {
    if (placeholderApplyTarget.value === 'both') return placeholderClientUrl.value; // It sets both to the same selected image
    if (placeholderApplyTarget.value === 'admin') return placeholderAdminUrl.value;
    return settingsStore.settings.placeholder_admin_active || defaultPlaceholder;
});`,
`const activePlaceholderAdminUrl = computed(() => {
    if (placeholderAdminUrl.value && (placeholderApplyTarget.value === 'both' || placeholderApplyTarget.value === 'admin')) return placeholderAdminUrl.value;
    return settingsStore.settings.placeholder_admin_active || defaultPlaceholder;
});`);

// Replace MẶC ĐỊNH box
content = content.replace(
`:class="(activePlaceholderClientUrl === defaultPlaceholder || activePlaceholderAdminUrl === defaultPlaceholder) ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"`,
`:class="((!activePlaceholderClientUrl || activePlaceholderClientUrl === defaultPlaceholder) || (!activePlaceholderAdminUrl || activePlaceholderAdminUrl === defaultPlaceholder)) ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"`);

content = content.replace(
`<span v-if="activePlaceholderClientUrl === defaultPlaceholder"`,
`<span v-if="!activePlaceholderClientUrl || activePlaceholderClientUrl === defaultPlaceholder"`);

content = content.replace(
`<span v-if="activePlaceholderAdminUrl === defaultPlaceholder" class="position-absolute badge rounded-pill bg-info shadow-sm" :style="activePlaceholderClientUrl === defaultPlaceholder ? 'top: -8px; right: 50px;' : 'top: -8px; right: -8px;'" style="font-size: 0.7rem; z-index: 10;">ADMIN <i class="bi bi-check-lg"></i></span>`,
`<span v-if="!activePlaceholderAdminUrl || activePlaceholderAdminUrl === defaultPlaceholder" class="position-absolute badge rounded-pill bg-info shadow-sm" :style="(!activePlaceholderClientUrl || activePlaceholderClientUrl === defaultPlaceholder) ? 'top: -8px; right: 50px;' : 'top: -8px; right: -8px;'" style="font-size: 0.7rem; z-index: 10;">ADMIN <i class="bi bi-check-lg"></i></span>`);

// Replace Gallery Loop box
content = content.replace(
`:class="(activePlaceholderClientUrl === url || activePlaceholderAdminUrl === url) ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"`,
`:class="( (activePlaceholderClientUrl && url.includes(activePlaceholderClientUrl) && activePlaceholderClientUrl !== defaultPlaceholder) || (activePlaceholderAdminUrl && url.includes(activePlaceholderAdminUrl) && activePlaceholderAdminUrl !== defaultPlaceholder) ) ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"`);

content = content.replace(
`<span v-if="activePlaceholderClientUrl === url" class="position-absolute badge rounded-pill bg-primary shadow-sm" style="top: -8px; right: -8px; font-size: 0.7rem; z-index: 10;">CLIENT <i class="bi bi-check-lg"></i></span>`,
`<span v-if="activePlaceholderClientUrl && url.includes(activePlaceholderClientUrl) && activePlaceholderClientUrl !== defaultPlaceholder" class="position-absolute badge rounded-pill bg-primary shadow-sm" style="top: -8px; right: -8px; font-size: 0.7rem; z-index: 10;">CLIENT <i class="bi bi-check-lg"></i></span>`);

content = content.replace(
`<span v-if="activePlaceholderAdminUrl === url" class="position-absolute badge rounded-pill bg-info shadow-sm" :style="activePlaceholderClientUrl === url ? 'top: -8px; right: 50px;' : 'top: -8px; right: -8px;'" style="font-size: 0.7rem; z-index: 10;">ADMIN <i class="bi bi-check-lg"></i></span>`,
`<span v-if="activePlaceholderAdminUrl && url.includes(activePlaceholderAdminUrl) && activePlaceholderAdminUrl !== defaultPlaceholder" class="position-absolute badge rounded-pill bg-info shadow-sm" :style="(activePlaceholderClientUrl && url.includes(activePlaceholderClientUrl) && activePlaceholderClientUrl !== defaultPlaceholder) ? 'top: -8px; right: 50px;' : 'top: -8px; right: -8px;'" style="font-size: 0.7rem; z-index: 10;">ADMIN <i class="bi bi-check-lg"></i></span>`);

fs.writeFileSync('D:/laragon/www/datn-SORA-ThinkHub/frontend/src/pages/admin/setting/Index.vue', content, 'utf8');
console.log('Fixed Index.vue!');
