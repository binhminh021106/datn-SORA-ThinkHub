const fs = require('fs');
const content = fs.readFileSync('src/pages/admin/setting/Index.vue', 'utf8');
const startTag = `<div :class="activeTab === 'placeholder' ? 'tab-pane-active' : 'tab-pane-inactive'" style="grid-area: 1 / 1;">`;
const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf('<div class="modal fade" id="cropperModal"');
console.log(content.substring(startIdx, endIdx));
