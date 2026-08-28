<template>
    <div class="modal fade" id="colorDictionaryModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow">
                <div class="modal-header py-2 bg-info text-white">
                    <h6 class="modal-title fw-bold"><i class="bi bi-palette-fill me-2"></i>Quản lý Từ Điển Màu (Smart Color Mapping)</h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="row g-0">
                        <!-- Form thêm/sửa -->
                        <div class="col-md-4 border-end bg-light p-3">
                            <h6 class="fw-bold mb-3 text-brand border-bottom pb-2">
                                {{ editingColor ? 'Sửa màu sắc' : 'Thêm màu mới' }}
                            </h6>
                            <form @submit.prevent="submitForm">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Tên màu <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" v-model="form.name" placeholder="VD: Đỏ đồng, Vàng tây..." required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Mã màu (HEX) <span class="text-danger">*</span></label>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="color" class="form-control form-control-color p-1" style="width: 45px; height: 38px;" v-model="form.color_code">
                                        <input type="text" class="form-control text-uppercase" v-model="form.color_code" placeholder="#FFFFFF" required pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$">
                                    </div>
                                </div>
                                <div class="d-flex gap-2 mt-4">
                                    <button type="button" class="btn btn-sm btn-light border flex-fill fw-semibold" v-if="editingColor" @click="resetForm">
                                        Hủy
                                    </button>
                                    <button type="submit" class="btn btn-sm btn-info text-white flex-fill fw-bold shadow-sm" :disabled="isSaving">
                                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                                        {{ editingColor ? 'Cập nhật' : 'Thêm vào từ điển' }}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Danh sách -->
                        <div class="col-md-8 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0 text-dark">Danh sách mã màu</h6>
                                <div class="input-group input-group-sm w-50">
                                    <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Tìm tên màu..." v-model="searchQuery">
                                </div>
                            </div>

                            <div class="table-responsive custom-scrollbar-y" style="max-height: 400px;">
                                <table class="table table-hover table-sm align-middle mb-0">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th class="ps-3">Tên màu</th>
                                            <th>Mã HEX</th>
                                            <th>Hiển thị</th>
                                            <th class="text-end pe-3" style="width: 80px;">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="isLoading">
                                            <td colspan="4" class="text-center py-4 text-muted">
                                                <div class="spinner-border spinner-border-sm text-info me-2"></div> Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                        <tr v-else-if="filteredColors.length === 0">
                                            <td colspan="4" class="text-center py-4 text-muted fst-italic">
                                                Không tìm thấy màu sắc nào.
                                            </td>
                                        </tr>
                                        <tr v-else v-for="color in filteredColors" :key="color.id">
                                            <td class="ps-3 fw-semibold text-dark">{{ color.name }}</td>
                                            <td class="text-muted font-monospace small">{{ color.color_code }}</td>
                                            <td>
                                                <div class="color-preview-circle shadow-sm" :style="{ backgroundColor: color.color_code }" :title="color.name"></div>
                                            </td>
                                            <td class="text-end pe-3">
                                                <button class="btn btn-sm btn-light text-primary border-0 p-1 me-1 hover-scale" @click="editColor(color)" title="Sửa">
                                                    <i class="bi bi-pencil-square"></i>
                                                </button>
                                                <button class="btn btn-sm btn-light text-danger border-0 p-1 hover-scale" @click="deleteColor(color.id)" title="Xóa">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import adminApiClient from '@/utils/adminApiClient';
import Swal from 'sweetalert2';

const colors = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const searchQuery = ref('');

const form = ref({
    name: '',
    color_code: '#000000'
});
const editingColor = ref(null);

const fetchColors = async () => {
    isLoading.value = true;
    try {
        const res = await adminApiClient.get('/color-dictionaries');
        colors.value = res.data || [];
    } catch (e) {
        console.error("Lỗi tải từ điển màu", e);
    } finally {
        isLoading.value = false;
    }
};

const filteredColors = computed(() => {
    if (!searchQuery.value) return colors.value;
    const q = searchQuery.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return colors.value.filter(c => {
        const n = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return n.includes(q);
    });
});

const resetForm = () => {
    form.value = { name: '', color_code: '#000000' };
    editingColor.value = null;
};

const editColor = (color) => {
    editingColor.value = color;
    form.value = { name: color.name, color_code: color.color_code };
};

const submitForm = async () => {
    isSaving.value = true;
    try {
        if (editingColor.value) {
            await adminApiClient.put(`/color-dictionaries/${editingColor.value.id}`, form.value);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật màu', showConfirmButton: false, timer: 1500 });
        } else {
            await adminApiClient.post('/color-dictionaries', form.value);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã thêm màu', showConfirmButton: false, timer: 1500 });
        }
        await fetchColors();
        resetForm();
    } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Không thể lưu dữ liệu', 'error');
    } finally {
        isSaving.value = false;
    }
};

const deleteColor = async (id) => {
    Swal.fire({ title: 'Xóa màu này?', text: "Hành động này không thể hoàn tác!", icon: 'warning', showCancelButton: true }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await adminApiClient.delete(`/color-dictionaries/${id}`);
                await fetchColors();
                if (editingColor.value?.id === id) resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa màu', showConfirmButton: false, timer: 1500 });
            } catch (e) {
                Swal.fire('Lỗi', e.response?.data?.message || 'Không thể xóa', 'error');
            }
        }
    });
};

onMounted(() => {
    window.fetchColorDictionaries = fetchColors;
    fetchColors();
});
</script>

<style scoped>
.color-preview-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
}
</style>
