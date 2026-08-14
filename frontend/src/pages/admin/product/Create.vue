<template>
    <div class="product-create-wrapper ">
        <div class="container-fluid py-4" v-if="!isPageLoading">

            <div class="row mb-4 align-items-center">
                <div class="col-md-6 d-flex align-items-center">
                    <router-link :to="{ name: 'admin-products' }"
                        class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style="width: 40px; height: 40px;">
                        <i class="bi bi-arrow-left fw-bold"></i>
                    </router-link>
                    <div class="d-flex flex-column">
                        <h3 class="fw-bold text-dark mb-0">Thêm Sản phẩm Trang sức</h3>
                        <p class="text-muted small mb-0 mt-1">Khởi tạo sản phẩm gốc và các biến thể phân loại</p>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header bg-white border-bottom-0">
                    <ul class="nav nav-underline custom-scrollbar-x flex-nowrap">
                        <li class="nav-item">
                            <a class="nav-link py-3 px-4 fw-bold custom-tab"
                                :class="{ 'active-tab': currentStep === 1 }" href="#" @click.prevent="currentStep = 1">
                                <span class="step-circle me-2">1</span> Thông tin cơ bản
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link py-3 px-4 fw-bold custom-tab"
                                :class="{ 'active-tab': currentStep === 2, 'disabled text-muted': !canProceedToStep2 }"
                                href="#" @click.prevent="proceedIfValid">
                                <span class="step-circle me-2">2</span> Phân loại & Biến thể (Kho)
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="card-body">
                    <form @submit.prevent="submitProduct" id="productForm">

                        <div v-show="currentStep === 1" class="row g-4">
                            <div class="col-lg-8">
                                <div class="p-4 bg-light rounded-4 border h-100">
                                    <h6 class="fw-bold mb-4 text-dark form-section-title"><i
                                            class="bi bi-card-text me-2"></i>Dữ liệu cơ sở</h6>
                                    <div class="row g-3">
                                        <div class="col-md-12">
                                            <label class="form-label fw-bold">Tên sản phẩm <span
                                                    class="text-danger">*</span></label>
                                            <input type="text" class="form-control form-control-lg" v-model="form.name"
                                                @input="generateSlug" required
                                                placeholder="VD: Nhẫn đính hôn Kim Cương tự nhiên">
                                        </div>
                                        <div class="col-md-12">
                                            <label class="form-label fw-bold">Đường dẫn (Slug)</label>
                                            <input type="text" class="form-control bg-light text-muted font-monospace"
                                                v-model="form.slug" readonly>
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Danh mục <span
                                                    class="text-danger">*</span></label>
                                            <select class="form-select border-brand fw-semibold text-brand"
                                                v-model="form.category_id" required>
                                                <option value="" disabled>-- Chọn danh mục --</option>
                                                <option v-if="categories.length === 0" value="" disabled
                                                    class="text-danger">
                                                    ⚠️ Trống! Cần tạo Danh mục.
                                                </option>
                                                <option v-else v-for="cat in categories" :key="cat.id" :value="cat.id">
                                                    {{ cat.name }}
                                                </option>
                                            </select>
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Thương hiệu</label>
                                            <select class="form-select fw-semibold" v-model="form.brand_id">
                                                <option value="">-- Không có (No Brand) --</option>
                                                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                                                    {{ brand.name }}
                                                </option>
                                            </select>
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Giá tham khảo <span
                                                    class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <input type="text" class="form-control"
                                                    :value="formatCurrency(form.base_price)"
                                                    @input="updateBasePrice($event)" required>
                                                <span class="input-group-text bg-light">VNĐ</span>
                                            </div>
                                        </div>

                                        <div class="col-md-6 mt-3">
                                            <label class="form-label fw-bold text-dark">
                                                <i class="bi bi-diagram-3-fill text-brand me-1"></i> Hoa hồng Affiliate
                                            </label>
                                            <div class="input-group">
                                                <input type="number" 
                                                    class="form-control fw-bold text-brand" 
                                                    v-model.number="form.affiliate_commission_rate" 
                                                    min="0" 
                                                    max="100" 
                                                    step="0.01" 
                                                    placeholder="VD: 5.5">
                                                <span class="input-group-text bg-light fw-bold">%</span>
                                            </div>
                                            <small class="text-muted fst-italic mt-1 d-block" style="font-size: 0.75rem;">
                                                <i class="bi bi-info-circle me-1"></i>Để 0% nếu không áp dụng hoa hồng giới thiệu.
                                            </small>
                                        </div>

                                        <!-- Trình soạn thảo Word (Quill Editor) cho mô tả sản phẩm -->
                                        <div class="col-md-12 mt-3">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <label class="form-label fw-bold text-dark mb-0">Mô tả sản phẩm</label>
                                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="isHtmlMode = !isHtmlMode">
                                                    <i class="bi bi-code-slash me-1"></i>
                                                    {{ isHtmlMode ? 'Chuyển sang Trực quan (Visual)' : 'Chuyển sang HTML (Code)' }}
                                                </button>
                                            </div>
                                            <div class="editor-container shadow-sm rounded-4 position-relative border bg-white">
                                                <QuillEditor v-if="!isHtmlMode" theme="snow" toolbar="full" v-model:content="form.description" contentType="html" placeholder="Mô tả chi tiết sản phẩm..." />
                                                <textarea v-else class="form-control font-monospace p-3" rows="10" v-model="form.description" placeholder="<p>Mô tả HTML...</p>" style="min-height: 250px; background-color: #2d2d2d; color: #f8f8f2; border: none;"></textarea>
                                            </div>
                                        </div>

                                        <div class="col-md-12 mt-3">
                                            <div
                                                class="alert alert-info small border-0 bg-info bg-opacity-10 text-muted m-0">
                                                <i class="bi bi-info-circle me-1 text-info"></i>
                                                Sản phẩm mặc định sẽ ở trạng thái <strong>Nháp (Draft)</strong>. Bạn cần
                                                cấu hình biến thể ở Bước 2 để xuất bản.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-4">
                                <div class="p-4 bg-light rounded-4 border text-center h-100">
                                    <h6 class="fw-bold mb-3 text-start form-section-title"><i
                                            class="bi bi-image me-2"></i>Ảnh Đại Diện <span class="text-danger">*</span>
                                    </h6>
                                    <div class="mb-3 position-relative border rounded-4 overflow-hidden bg-white"
                                        style="height: 250px;">
                                        <img v-if="thumbnailPreview" :src="thumbnailPreview"
                                            class="w-100 h-100 object-fit-contain p-2">
                                        <div v-else
                                            class="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                                            <i class="bi bi-camera fs-1 mb-2 opacity-50"></i>
                                            <span class="small fw-semibold text-danger">Bắt buộc tải ảnh</span>
                                        </div>
                                    </div>
                                    <input type="file" class="d-none" id="thumbUpload" accept="image/*"
                                        @change="handleThumbUpload">
                                    <label for="thumbUpload"
                                        class="btn btn-outline-brand rounded-pill w-100 fw-semibold"><i
                                            class="bi bi-upload me-1"></i> Chọn ảnh chính</label>
                                </div>
                            </div>

                            <div class="col-12 text-end border-top pt-4 mt-4">
                                <button type="button"
                                    class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm py-2"
                                    @click="proceedToStep2" :disabled="!canProceedToStep2 || isProcessingSchema">
                                    <span v-if="isProcessingSchema"
                                        class="spinner-border spinner-border-sm me-2"></span>
                                    {{ isProcessingSchema ? 'Đang cấu hình lưới...' : 'Chuyển sang Bộ tạo Biến thể' }}
                                    <i class="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>

                        <div v-show="currentStep === 2">

                            <div class="card border shadow-sm rounded-3 overflow-visible mb-4">
                                <div
                                    class="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <h6 class="fw-bold mb-0 text-brand d-flex align-items-center">
                                        <i class="bi bi-grid-3x3-gap-fill me-2"></i> CẤU HÌNH LƯỚI SẢN PHẨM
                                    </h6>

                                    <div class="attr-toolbar d-flex align-items-center gap-2">
                                        <div class="input-group input-group-sm">
                                            <select class="form-select border-secondary fw-bold text-secondary"
                                                v-model="selectedAttrToAdd" style="min-width: 150px;">
                                                <option value="">+ Chọn thuộc tính</option>
                                                <template v-if="systemAttributes.length > 0">
                                                    <option v-for="attr in systemAttributes" :key="attr.id"
                                                        :value="attr.id"
                                                        :disabled="activeAttributes.includes(attr.id.toString())">
                                                        {{ attr.name }}
                                                    </option>
                                                </template>
                                            </select>
                                            <button type="button" class="btn btn-success px-3 fw-bold"
                                                title="Thêm cột vào bảng" @click="addAttributeColumn">
                                                <i class="bi bi-plus-lg"></i>
                                            </button>
                                        </div>

                                        <div class="vr mx-1 text-secondary opacity-25"></div>

                                        <button type="button" class="btn btn-sm btn-outline-primary border-0 fw-bold"
                                            @click="openModal('createAttrModal')">
                                            <i class="bi bi-plus-circle me-1"></i> Thuộc tính mới
                                        </button>
                                        <button type="button" class="btn btn-sm btn-outline-secondary border-0 fw-bold"
                                            @click="openModal('manageAttrModal')">
                                            <i class="bi bi-gear-fill me-1"></i> Quản lý
                                        </button>
                                    </div>
                                </div>

                                <div class="card-body p-0" style="position: relative; z-index: 1040;">
                                    <div class="table-responsive" style="min-height: 350px; overflow: visible;">
                                        <table class="table table-bordered mb-0 variant-table w-100">
                                            <thead>
                                                <tr>
                                                    <th style="width: 70px;">Ảnh</th>
                                                    <th style="min-width: 150px;">SKU <span class="fw-light text-muted"
                                                            style="font-size: 0.75em">(Tự
                                                            sinh)</span></th>

                                                    <th v-for="attrId in activeAttributes" :key="attrId"
                                                        style="min-width: 130px;"
                                                        class="bg-light text-dark position-relative">
                                                        {{ getAttributeName(attrId) }}
                                                        <i class="bi bi-x-circle-fill text-danger position-absolute top-50 end-0 translate-middle-y me-2 cursor-pointer opacity-50 hover-opacity-100"
                                                            title="Gỡ cột" @click="removeAttributeColumn(attrId)"></i>
                                                    </th>

                                                    <th style="width: 150px;" class="bg-light-brand text-dark">Giá bán
                                                        (VNĐ) <span class="text-danger">*</span></th>
                                                    <th style="width: 140px;">Khuyến mãi</th>
                                                    <th style="width: 100px;">Kho <span class="text-danger">*</span>
                                                    </th>
                                                    <th style="width: 50px;"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="variants.length === 0">
                                                    <td :colspan="6 + activeAttributes.length" class="text-center py-5">
                                                        <div class="text-muted"><i
                                                                class="bi bi-inbox fs-1 opacity-25 d-block mb-2"></i>Chưa
                                                            có dòng
                                                            biến thể nào. Hãy thêm dòng mới.</div>
                                                    </td>
                                                </tr>

                                                <tr v-else v-for="(v, index) in variants" :key="index"
                                                    class="variant-row" :class="{ 'row-error': v.hasDuplicateError }">
                                                    <td class="text-center position-relative">
                                                        <label class="cursor-pointer d-block m-0">
                                                            <img :src="v.preview || 'https://placehold.co/40x40?text=+'"
                                                                class="img-preview-sm"
                                                                onerror="this.src='https://placehold.co/40x40?text=+'">
                                                            <input type="file" class="d-none" accept="image/*"
                                                                @change="handleVariantImage(index, $event)">
                                                        </label>
                                                    </td>

                                                    <td>
                                                        <input type="text"
                                                            class="form-control form-control-sm font-monospace"
                                                            v-model="v.sku" placeholder="Tự động" required>
                                                    </td>

                                                    <td v-for="attrId in activeAttributes" :key="attrId" class="align-middle" style="min-width: 160px;">
                                                        <div class="position-relative custom-vue-dropdown" @click.stop>
                                                            <button
                                                                class="btn btn-sm w-100 text-start d-flex justify-content-between align-items-center bg-white border shadow-sm"
                                                                :class="{ 'is-invalid border-danger text-danger': v.attrError }" type="button"
                                                                @click="toggleDropdown($event, index, attrId)">
                                                                <span class="text-truncate pe-2 fw-bold" style="font-size: 0.85rem;">{{ getSelectedValueName(attrId, v.attributes[attrId]) }}</span>
                                                                <i class="bi text-muted" style="font-size: 0.75rem;" :class="activeDropdown === `${index}-${attrId}` ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                                                            </button>

                                                            <transition name="fade">
                                                                <div v-show="activeDropdown === `${index}-${attrId}`"
                                                                    class="position-absolute shadow-lg border rounded-4 p-3 bg-white"
                                                                    :style="[
                                                                        { width: '420px', zIndex: 1050, left: 0, cursor: 'default' },
                                                                        dropdownPosition === 'top' ? { bottom: '100%', marginBottom: '6px' } : { top: '100%', marginTop: '6px' }
                                                                    ]">

                                                                    <div class="input-group input-group-sm mb-3 shadow-sm">
                                                                        <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
                                                                        <input type="text"
                                                                            class="form-control border-start-0 shadow-none bg-light border-secondary-subtle"
                                                                            v-model="attrSearchQuery" placeholder="Lọc nhanh giá trị..." @click.stop>
                                                                    </div>

                                                                    <div class="row g-3">
                                                                        <div class="col-6 border-end pe-3">
                                                                            <h6 class="small text-muted fw-bold border-bottom pb-2 mb-2"><i class="bi bi-alphabet me-1"></i>Chữ / Ký tự (A-Z)</h6>
                                                                            <div class="d-flex flex-wrap gap-2 custom-scrollbar-y pe-1" style="max-height: 200px; overflow-y: auto;">
                                                                                <div v-for="val in getSortedValues(attrId).alpha" :key="val.id"
                                                                                    class="badge border d-flex align-items-center p-0 shadow-sm transition-all rounded-pill overflow-hidden w-100"
                                                                                    :class="v.attributes[attrId] == val.id ? 'bg-primary text-white border-primary' : 'bg-white text-dark hover-border-primary'">
                                                                                    <span class="cursor-pointer px-3 py-2 flex-grow-1 text-center fw-bold text-truncate" style="font-size: 0.9rem;"
                                                                                        @click="selectAttrValue(index, attrId, val.id)" :title="val.value">{{ val.value }}</span>
                                                                                </div>
                                                                                <span v-if="getSortedValues(attrId).alpha.length === 0" class="text-muted small fst-italic py-1 w-100 text-center">Trống</span>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-6 ps-2">
                                                                            <h6 class="small text-muted fw-bold border-bottom pb-2 mb-2"><i class="bi bi-sort-numeric-down me-1"></i>Chữ Số (Tăng dần)</h6>
                                                                            <div class="d-flex flex-wrap gap-2 custom-scrollbar-y pe-1" style="max-height: 200px; overflow-y: auto;">
                                                                                <div v-for="val in getSortedValues(attrId).numeric" :key="val.id"
                                                                                    class="badge border d-flex align-items-center p-0 shadow-sm transition-all rounded-pill overflow-hidden w-100"
                                                                                    :class="v.attributes[attrId] == val.id ? 'bg-primary text-white border-primary' : 'bg-white text-dark hover-border-primary'">
                                                                                    <span class="cursor-pointer px-3 py-2 flex-grow-1 text-center fw-bold text-truncate" style="font-size: 0.9rem;"
                                                                                        @click="selectAttrValue(index, attrId, val.id)" :title="val.value">{{ val.value }}</span>
                                                                                </div>
                                                                                <span v-if="getSortedValues(attrId).numeric.length === 0" class="text-muted small fst-italic py-1 w-100 text-center">Trống</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <hr class="my-3">
                                                                    <button type="button"
                                                                        class="btn btn-sm btn-light text-success w-100 fw-bold border-dashed shadow-sm-hover py-2"
                                                                        @click.stop="activeDropdown = null; handleAttributeChange({target: {value: 'NEW'}}, attrId, index)">
                                                                        <i class="bi bi-plus-circle-fill me-1"></i> Bổ sung thêm giá trị vào hệ thống
                                                                    </button>
                                                                </div>
                                                            </transition>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <input type="text"
                                                            class="form-control form-control-sm text-end fw-bold text-brand"
                                                            :class="{ 'is-invalid': v.priceError }" 
                                                            :value="formatCurrency(v.price)"
                                                            required @input="updateVariantPrice(index, 'price', $event)">
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                            class="form-control form-control-sm text-end"
                                                            :class="{ 'is-invalid': v.saleError }"
                                                            :value="formatCurrency(v.promotional_price)"
                                                            @input="updateVariantPrice(index, 'promotional_price', $event)">
                                                    </td>
                                                    <td>
                                                        <input type="number"
                                                            class="form-control form-control-sm text-center"
                                                            :class="{ 'is-invalid': v.stockError }"
                                                            v-model="v.stock_quantity" min="1" required>
                                                    </td>
                                                    <td class="text-center text-nowrap">
                                                        <button type="button"
                                                            class="btn btn-sm text-primary border-0 hover-primary"
                                                            @click="duplicateVariant(index)" title="Nhân bản biến thể này">
                                                            <i class="bi bi-copy fs-6"></i>
                                                        </button>
                                                        <button type="button"
                                                            class="btn btn-sm text-secondary border-0 hover-danger"
                                                            @click="removeVariantRow(index)" title="Xóa dòng">
                                                            <i class="bi bi-x-lg fs-6"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div
                                    class="card-footer bg-white py-3 d-flex justify-content-between align-items-center sticky-bottom shadow-sm">
                                    <button type="button" class="btn btn-light border text-brand fw-bold px-3 btn-sm"
                                        @click="addVariantRow">
                                        <i class="bi bi-plus-circle-dotted me-2"></i>Thêm dòng biến thể
                                    </button>

                                    <div class="d-flex align-items-center gap-3">
                                        <div class="form-check form-switch m-0">
                                            <input class="form-check-input" type="checkbox" id="publishSwitch"
                                                v-model="form.isPublished">
                                            <label class="form-check-label fw-semibold" for="publishSwitch">Xuất bản
                                                ngay</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between pt-2">
                                <button type="button" class="btn btn-light px-4 border fw-semibold"
                                    @click="currentStep = 1"><i class="bi bi-arrow-left me-1"></i> Trở lại Bước
                                    1</button>
                                <button type="submit" class="btn btn-brand text-white px-5 py-2 fw-bold shadow"
                                    :disabled="isSaving || variants.length === 0">
                                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> HOÀN TẤT
                                    LƯU
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div v-else class="d-flex flex-column justify-content-center align-items-center w-100"
            style="min-height: 70vh;">
            <h1 class="logo-shimmer mb-3">ThinkHub</h1>
            <p class="text-muted small tracking-widest text-uppercase">Chuẩn bị không gian làm việc...</p>
        </div>


        <div class="modal fade" id="createAttrModal" tabindex="-1">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header py-2 bg-primary text-white">
                        <h6 class="modal-title fw-bold">Tạo thuộc tính mới</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Tên thuộc tính</label>
                            <input type="text" class="form-control" v-model="newAttrForm.name"
                                placeholder="VD: Chất liệu" @keydown.enter.prevent="submitCreateAttribute">
                        </div>
                        <button type="button" class="btn btn-primary w-100 btn-sm fw-bold"
                            @click="submitCreateAttribute" :disabled="!newAttrForm.name">Lưu ngay</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="createValueModal" tabindex="-1">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header py-2 bg-success text-white">
                        <h6 class="modal-title fw-bold">Thêm giá trị mới</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Giá trị cho: <span class="text-success">{{
                                currentOperatingAttr ? currentOperatingAttr.name : '' }}</span></label>
                            <input type="text" class="form-control" v-model="newValueForm.value"
                                placeholder="VD: Xanh ngọc" @keydown.enter.prevent="submitCreateValue"
                                ref="newValueInputRef">
                        </div>
                        <button type="button" class="btn btn-success w-100 btn-sm fw-bold" @click="submitCreateValue"
                            :disabled="!newValueForm.value">Lưu giá trị</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="manageAttrModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header py-2 bg-secondary text-white">
                        <h6 class="modal-title fw-bold">Quản lý Thuộc tính hệ thống</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Chọn thuộc tính cần sửa:</label>
                            <select class="form-select" v-model="selectedAttrToManage">
                                <option value="">-- Chọn thuộc tính --</option>
                                <template v-if="systemAttributes.length > 0">
                                    <option v-for="attr in systemAttributes" :key="attr.id" :value="attr.id">{{
                                        attr.name }}</option>
                                </template>
                            </select>
                        </div>

                        <div v-if="selectedAttrToManage">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Tên hiển thị mới:</label>
                                <input type="text" class="form-control" v-model="manageAttrName"
                                    @keydown.enter.prevent="updateAttribute(selectedAttrToManage)">
                                <div class="form-text small">Lưu ý: Thay đổi này sẽ cập nhật trên toàn hệ thống.</div>
                            </div>
                            <div class="d-flex justify-content-between pt-2 border-top mt-3">
                                <button type="button" class="btn btn-sm btn-outline-danger px-3"
                                    @click="deleteAttribute(selectedAttrToManage)">
                                    <i class="bi bi-trash me-1"></i> Xóa vĩnh viễn
                                </button>
                                <button type="button" class="btn btn-sm btn-primary px-3"
                                    @click="updateAttribute(selectedAttrToManage)" :disabled="!manageAttrName">
                                    <i class="bi bi-save me-1"></i> Cập nhật
                                </button>
                            </div>

                            <div class="mb-3 mt-4 pt-4 border-top">
                                <label class="form-label small fw-bold d-block"><i class="bi bi-list-task me-2"></i>Danh sách giá trị hiện có (Nhấn <i class="bi bi-x-circle-fill text-danger mx-1"></i> để xóa vĩnh viễn):</label>
                                <div class="row g-3 p-3 bg-light rounded-4 border shadow-sm">
                                    <div class="col-6">
                                        <h6 class="small text-muted fw-bold text-center border-bottom pb-2 mb-3"><i class="bi bi-alphabet me-1"></i>Chữ cái / Ký tự</h6>
                                        <div class="d-flex flex-column gap-2 pe-1 custom-scrollbar-y" style="max-height: 250px; overflow-y: auto;">
                                            <div v-for="val in getSortedValues(selectedAttrToManage).alpha" :key="val.id"
                                                class="d-flex justify-content-between align-items-center bg-white border rounded-3 px-3 py-2 shadow-sm transition-all hover-border-primary">
                                                <span class="fw-bold text-dark text-truncate" :title="val.value">{{ val.value }}</span>
                                                <button type="button" class="btn btn-sm text-danger p-0 border-0 ms-2 flex-shrink-0 hover-scale"
                                                    @click="deleteAttributeValue(val.id)" title="Xóa rác"><i class="bi bi-x-circle-fill fs-5"></i></button>
                                            </div>
                                            <div v-if="getSortedValues(selectedAttrToManage).alpha.length === 0" class="text-center text-muted small fst-italic py-3 border border-dashed rounded-3">Trống</div>
                                        </div>
                                    </div>
                                    <div class="col-6 border-start ps-4">
                                        <h6 class="small text-muted fw-bold text-center border-bottom pb-2 mb-3"><i class="bi bi-sort-numeric-down me-1"></i>Chữ Số (Tăng dần)</h6>
                                        <div class="d-flex flex-column gap-2 pe-1 custom-scrollbar-y" style="max-height: 250px; overflow-y: auto;">
                                            <div v-for="val in getSortedValues(selectedAttrToManage).numeric" :key="val.id"
                                                class="d-flex justify-content-between align-items-center bg-white border rounded-3 px-3 py-2 shadow-sm transition-all hover-border-primary">
                                                <span class="fw-bold text-dark text-truncate" :title="val.value">{{ val.value }}</span>
                                                <button type="button" class="btn btn-sm text-danger p-0 border-0 ms-2 flex-shrink-0 hover-scale"
                                                    @click="deleteAttributeValue(val.id)" title="Xóa rác"><i class="bi bi-x-circle-fill fs-5"></i></button>
                                            </div>
                                            <div v-if="getSortedValues(selectedAttrToManage).numeric.length === 0" class="text-center text-muted small fst-italic py-3 border border-dashed rounded-3">Trống</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import axios from 'axios';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const queryClient = useQueryClient();
const isPageLoading = ref(true);
const isSaving = ref(false);
const isProcessingSchema = ref(false);
const currentStep = ref(1);
const isHtmlMode = ref(false);

const categories = ref([]);
const systemAttributes = ref([]);
const brands = ref([]);

const form = ref({
    category_id: '', brand_id: '', name: '', slug: '', base_price: 0, isPublished: true, affiliate_commission_rate: 0, description: ''
});
const thumbnailFile = ref(null);
const thumbnailPreview = ref(null);

const activeAttributes = ref([]);
const selectedAttrToAdd = ref('');
const variants = ref([]);

let createAttrModalObj = null;
let createValueModalObj = null;
let manageAttrModalObj = null;

const newAttrForm = ref({ name: '' });
const newValueForm = ref({ value: '' });
const currentOperatingAttr = ref(null);
const currentOperatingRowIndex = ref(null);
const newValueInputRef = ref(null);

const selectedAttrToManage = ref('');
const manageAttrName = ref('');

// Custom Vue Dropdown
const activeDropdown = ref(null);
const attrSearchQuery = ref('');
const dropdownPosition = ref('bottom');

const toggleDropdown = (event, rowIndex, attrId) => {
    const key = `${rowIndex}-${attrId}`;
    if (activeDropdown.value === key) {
        activeDropdown.value = null;
    } else {
        activeDropdown.value = key;
        attrSearchQuery.value = '';
        
        if (event && event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 350; // Ước lượng chiều cao dropdown
            
            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                dropdownPosition.value = 'top';
            } else {
                dropdownPosition.value = 'bottom';
            }
        }
    }
};

const selectAttrValue = (rowIndex, attrId, valueId) => {
    variants.value[rowIndex].attributes[attrId] = valueId;
    activeDropdown.value = null;
    validateDuplicates();
};

const getSelectedValueName = (attrId, valueId) => {
    if (!valueId) return '-- Chọn --';
    const attr = systemAttributes.value.find(a => a.id === parseInt(attrId));
    if (!attr || !attr.values) return '-- Chọn --';
    const valObj = attr.values.find(v => v.id === parseInt(valueId));
    return valObj ? valObj.value : '-- Chọn --';
};

const getSortedValues = (attrId) => {
    const attr = systemAttributes.value.find(a => a.id === parseInt(attrId));
    if (!attr || !attr.values) return { alpha: [], numeric: [] };

    let filtered = attr.values;
    if (attrSearchQuery.value) {
        const q = attrSearchQuery.value.toLowerCase();
        filtered = filtered.filter(v => v.value.toLowerCase().includes(q));
    }

    const alpha = [];
    const numeric = [];

    filtered.forEach(v => {
        if (!isNaN(parseFloat(v.value))) {
            numeric.push(v);
        } else {
            alpha.push(v);
        }
    });

    alpha.sort((a, b) => a.value.toString().localeCompare(b.value.toString(), 'vi', { sensitivity: 'base' }));
    numeric.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

    return { alpha, numeric };
};

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const canProceedToStep2 = computed(() => {
    return form.value.name && form.value.name.trim().length >= 3 && form.value.category_id && form.value.base_price > 0 && thumbnailFile.value;
});

const proceedIfValid = () => {
    if (canProceedToStep2.value) {
        proceedToStep2();
    }
};

const generateSlug = () => {
    let s = form.value.name.toLowerCase();
    s = s.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    s = s.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    s = s.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    s = s.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    s = s.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    s = s.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    s = s.replace(/đ/gi, 'd');
    form.value.slug = s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-+/g, '-');
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    let num = value.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const updateBasePrice = (event) => {
    let rawValue = event.target.value.replace(/\D/g, '');
    form.value.base_price = rawValue ? parseInt(rawValue, 10) : '';
    event.target.value = formatCurrency(rawValue);
};

const updateVariantPrice = (index, field, event) => {
    let rawValue = event.target.value.replace(/\D/g, '');
    variants.value[index][field] = rawValue ? parseInt(rawValue, 10) : '';
    event.target.value = formatCurrency(rawValue);
    validateRow(index);
};

const handleThumbUpload = (e) => {
    const f = e.target.files[0];
    if (f) {
        if (f.size > 15 * 1024 * 1024) { Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); return; }
        thumbnailFile.value = f;
        thumbnailPreview.value = URL.createObjectURL(f);
    }
};

const proceedToStep2 = async () => {
    isProcessingSchema.value = true;

    const selectedCat = categories.value.find(c => c.id === form.value.category_id);

    if (selectedCat && selectedCat.attributes_schema && selectedCat.attributes_schema.length > 0) {

        let addedAnyColumn = false;

        for (const schemaName of selectedCat.attributes_schema) {
            let existingAttr = systemAttributes.value.find(a => a.name.toLowerCase() === schemaName.toLowerCase());
            let attrIdToAdd = null;

            if (existingAttr) {
                attrIdToAdd = existingAttr.id.toString();
            } else {
                try {
                    const res = await axios.post(`${API_URL}/admin/attributes`,
                        { name: schemaName },
                        { headers: getHeaders() }
                    );
                    res.data.data.values = [];
                    systemAttributes.value.push(res.data.data);
                    attrIdToAdd = res.data.data.id.toString();
                } catch (e) { console.error('Lỗi tự động tạo thuộc tính', e); }
            }

            if (attrIdToAdd && !activeAttributes.value.includes(attrIdToAdd)) {
                activeAttributes.value.push(attrIdToAdd);
                addedAnyColumn = true;
            }
        }

        if (addedAnyColumn && variants.value.length === 0) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Hệ thống tự động nạp thuộc tính từ Danh mục', showConfirmButton: false, timer: 3000 });
        }
    }

    if (variants.value.length === 0) {
        addVariantRow();
    } else {
        variants.value.forEach(v => {
            if (!v.attributes) v.attributes = {};
            activeAttributes.value.forEach(attrId => {
                if (v.attributes[attrId] === undefined) {
                    v.attributes[attrId] = "";
                }
            });
        });
    }

    isProcessingSchema.value = false;
    currentStep.value = 2;
};

const getAttributeName = (attrId) => {
    const a = systemAttributes.value.find(x => x.id == attrId);
    return a ? a.name : 'Unknown';
};
const getAttributeValues = (attrId) => {
    const a = systemAttributes.value.find(x => x.id == attrId);
    return a ? (a.values || []) : [];
};

const addAttributeColumn = () => {
    if (!selectedAttrToAdd.value) return;
    if (!activeAttributes.value.includes(selectedAttrToAdd.value.toString())) {
        activeAttributes.value.push(selectedAttrToAdd.value.toString());

        variants.value.forEach(v => {
            if (!v.attributes) v.attributes = {};
            v.attributes[selectedAttrToAdd.value.toString()] = "";
        });
    }
    selectedAttrToAdd.value = '';
};

const removeAttributeColumn = (attrId) => {
    Swal.fire({ title: 'Gỡ cột?', text: "Dữ liệu ở cột này của tất cả biến thể sẽ bị xóa. Tiếp tục?", icon: 'warning', showCancelButton: true }).then((result) => {
        if (result.isConfirmed) {
            activeAttributes.value = activeAttributes.value.filter(id => id != attrId);
            variants.value.forEach(v => {
                delete v.attributes[attrId];
            });
            validateDuplicates();
        }
    });
};

const addVariantRow = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = form.value.slug ? form.value.slug.substring(0, 4).toUpperCase().replace(/-/g, '') : 'SKU';
    const newSku = `${prefix}${randomCode}-V${variants.value.length + 1}`;

    let rowAttrs = {};
    activeAttributes.value.forEach(id => rowAttrs[id] = "");

    variants.value.push({
        sku: newSku, price: form.value.base_price, promotional_price: 0, stock_quantity: 10,
        imageFile: null, preview: null, attributes: rowAttrs,
        hasDuplicateError: false, attrError: false, priceError: false, saleError: false, stockError: false
    });
};

const removeVariantRow = (index) => {
    variants.value.splice(index, 1);
    validateDuplicates();
};

const duplicateVariant = (index) => {
    const v = variants.value[index];
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = form.value.slug ? form.value.slug.substring(0, 4).toUpperCase().replace(/-/g, '') : 'SKU';
    const newSku = `${prefix}${randomCode}-V${variants.value.length + 1}`;

    const newVariant = {
        ...JSON.parse(JSON.stringify(v)),
        id: null,
        sku: newSku,
        imageFile: null,
        preview: null,
        current_image: null,
        hasDuplicateError: false,
        attrError: false,
        priceError: false,
        saleError: false,
        stockError: false
    };

    variants.value.splice(index + 1, 0, newVariant);
    validateDuplicates();
};

const handleVariantImage = (index, e) => {
    const f = e.target.files[0];
    if (f) {
        variants.value[index].imageFile = f;
        variants.value[index].preview = URL.createObjectURL(f);
    }
};

const openModal = (id) => {
    const m = new window.bootstrap.Modal(document.getElementById(id));
    if (id === 'createAttrModal') createAttrModalObj = m;
    if (id === 'createValueModal') createValueModalObj = m;
    if (id === 'manageAttrModal') manageAttrModalObj = m;
    m.show();
};

const hideModals = () => {
    if (createAttrModalObj) createAttrModalObj.hide();
    if (createValueModalObj) createValueModalObj.hide();
    if (manageAttrModalObj) manageAttrModalObj.hide();
};

const submitCreateAttribute = async () => {
    if (!newAttrForm.value.name) return;
    try {
        const res = await axios.post(`${API_URL}/admin/attributes`,
            { name: newAttrForm.value.name },
            { headers: getHeaders() }
        );
        res.data.data.values = [];
        systemAttributes.value.push(res.data.data);
        hideModals();
        newAttrForm.value.name = '';
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã thêm thuộc tính', showConfirmButton: false, timer: 2000 });
    } catch (e) {
        if (e.response) Swal.fire('Lỗi', e.response.data.message || 'Lỗi thêm thuộc tính', 'error');
    }
};

const handleAttributeChange = (event, attrId, rowIndex) => {
    const val = event.target.value;
    if (val === 'NEW') {
        currentOperatingAttr.value = systemAttributes.value.find(x => x.id == attrId);
        currentOperatingRowIndex.value = rowIndex;
        newValueForm.value.value = '';
        variants.value[rowIndex].attributes[attrId] = '';
        openModal('createValueModal');
        nextTick(() => { if (newValueInputRef.value) newValueInputRef.value.focus(); });
    } else {
        validateDuplicates();
    }
};

const submitCreateValue = async () => {
    if (!newValueForm.value.value || !currentOperatingAttr.value) return;
    try {
        const payload = { attribute_id: currentOperatingAttr.value.id, value: newValueForm.value.value };
        const res = await axios.post(`${API_URL}/admin/attribute-values`, payload, { headers: getHeaders() });

        const attrObj = systemAttributes.value.find(x => x.id == currentOperatingAttr.value.id);
        if (attrObj) {
            if (!attrObj.values) attrObj.values = [];
            attrObj.values.push(res.data.data);
        }
        if (currentOperatingRowIndex.value !== null) {
            variants.value[currentOperatingRowIndex.value].attributes[attrObj.id] = res.data.data.id;
        }
        hideModals();
        validateDuplicates();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã thêm giá trị', showConfirmButton: false, timer: 2000 });
    } catch (e) {
        if (e.response) Swal.fire('Lỗi', e.response.data.message || 'Lỗi thêm giá trị', 'error');
    }
};

watch(selectedAttrToManage, (newId) => {
    if (newId) {
        const attr = systemAttributes.value.find(a => a.id === parseInt(newId));
        if (attr) manageAttrName.value = attr.name;
    } else {
        manageAttrName.value = '';
    }
});

const updateAttribute = async (id) => {
    if (!manageAttrName.value || !id) return;
    try {
        await axios.put(`${API_URL}/admin/attributes/${id}`,
            { name: manageAttrName.value },
            { headers: getHeaders() }
        );
        const attr = systemAttributes.value.find(a => a.id === parseInt(id));
        if (attr) attr.name = manageAttrName.value;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 2000 });
    } catch (e) {
        if (e.response) Swal.fire('Lỗi', e.response.data.message || 'Lỗi cập nhật', 'error');
    }
};

const deleteAttribute = async (id) => {
    if (!id) return;
    Swal.fire({ title: 'Xóa thuộc tính?', text: "Thuộc tính này và các giá trị của nó sẽ bị xóa!", icon: 'warning', showCancelButton: true }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/admin/attributes/${id}`, { headers: getHeaders() });
                systemAttributes.value = systemAttributes.value.filter(a => a.id !== parseInt(id));
                selectedAttrToManage.value = '';
                if (manageAttrModalObj) manageAttrModalObj.hide();

                if (activeAttributes.value.includes(id.toString())) {
                    removeAttributeColumn(id.toString());
                }
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa', showConfirmButton: false, timer: 2000 });
            } catch (e) {
                if (e.response) Swal.fire('Lỗi', e.response.data.message || 'Không thể xóa', 'error');
            }
        }
    });
};

const deleteAttributeValue = async (id) => {
    if (!id) return;
    Swal.fire({ title: 'Xóa giá trị?', text: "Hành động này không thể hoàn tác!", icon: 'warning', showCancelButton: true }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/admin/attribute-values/${id}`, { headers: getHeaders() });
                const attr = systemAttributes.value.find(a => a.id === selectedAttrToManage.value);
                if (attr && attr.values) {
                    attr.values = attr.values.filter(v => v.id !== id);
                }
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa giá trị', showConfirmButton: false, timer: 2000 });
            } catch (e) {
                if (e.response) Swal.fire('Lỗi', e.response.data.message || 'Không thể xóa giá trị này', 'error');
            }
        }
    });
};

const validateRow = (index) => {
    const v = variants.value[index];
    v.priceError = v.price <= 0 || v.price === '';
    v.saleError = parseFloat(v.promotional_price) > parseFloat(v.price);
    v.stockError = v.stock_quantity === '' || v.stock_quantity <= 0;
};

const validateDuplicates = () => {
    if (activeAttributes.value.length === 0) return;
    const seen = new Set();
    let hasDuplicate = false;

    variants.value.forEach((v, i) => {
        v.attrError = false;
        v.hasDuplicateError = false;

        let isFullSelected = true;
        let sigArray = [];

        activeAttributes.value.forEach(attrId => {
            const val = v.attributes[attrId];
            if (!val) isFullSelected = false;
            sigArray.push(val);
        });

        if (!isFullSelected) {
            v.attrError = true;
        } else {
            const signature = sigArray.join('-');
            if (seen.has(signature)) {
                v.hasDuplicateError = true;
                hasDuplicate = true;
                const firstDupIdx = variants.value.findIndex(x => {
                    let sArray = [];
                    activeAttributes.value.forEach(a => sArray.push(x.attributes[a]));
                    return sArray.join('-') === signature;
                });
                if (firstDupIdx !== -1) variants.value[firstDupIdx].hasDuplicateError = true;
            } else {
                seen.add(signature);
            }
        }
    });

    if (hasDuplicate) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Phát hiện Biến thể trùng lặp!', showConfirmButton: false, timer: 3000 });
    return hasDuplicate;
};

const submitProduct = async () => {
    if (!form.value.name || form.value.name.trim().length < 3) {
        Swal.fire('Lỗi Dữ liệu', 'Tên sản phẩm phải có ít nhất 3 ký tự.', 'error'); return;
    }
    if (!form.value.base_price || form.value.base_price <= 0) {
        Swal.fire('Lỗi Dữ liệu', 'Giá tham khảo phải lớn hơn 0.', 'error'); return;
    }

    validateDuplicates();
    let hasHardError = false;

    variants.value.forEach((v, i) => {
        validateRow(i);
        if (v.priceError || v.saleError || v.attrError || v.hasDuplicateError || v.stockError) hasHardError = true;
    });

    if (hasHardError) {
        Swal.fire('Lỗi Dữ liệu', 'Vui lòng kiểm tra các dòng bị bôi đỏ (Chưa chọn thuộc tính, giá tiền không hợp lệ, tồn kho phải lớn hơn 0, hoặc trùng lặp biến thể).', 'error'); return;
    }

    isSaving.value = true;
    try {
        const formData = new FormData();
        formData.append('category_id', form.value.category_id);

        if (form.value.brand_id) {
            formData.append('brand_id', form.value.brand_id);
        }

        formData.append('name', form.value.name);
        formData.append('slug', form.value.slug);
        formData.append('base_price', form.value.base_price);
        formData.append('status', form.value.isPublished ? 'published' : 'draft');
        formData.append('description', form.value.description || '');
        
        // THÊM MỚI: Đẩy dữ liệu affiliate_commission_rate vào payload
        formData.append('affiliate_commission_rate', form.value.affiliate_commission_rate);
        
        formData.append('thumbnail_image', thumbnailFile.value);

        const variantsPayload = variants.value.map(v => ({
            sku: v.sku,
            price: v.price,
            promotional_price: v.promotional_price || 0,
            stock_quantity: v.stock_quantity,
            attributes: v.attributes
        }));
        formData.append('variants_data', JSON.stringify(variantsPayload));

        variants.value.forEach((v, index) => {
            if (v.imageFile) formData.append(`variant_image_${index}`, v.imageFile);
        });

        const res = await axios.post(`${API_URL}/admin/products`, formData, {
            headers: getHeaders()
        });

        // Hủy bỏ cache của danh sách sản phẩm để ép tải lại dữ liệu mới nhất khi quay về màn Index
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });

        Swal.fire({ icon: 'success', title: 'Hoàn tất Xuất bản', text: res.data.message, timer: 2000, showConfirmButton: false }).then(() => {
            router.push({ name: 'admin-products' });
        });
    } catch (e) {
        if (e.response) {
            let errorHtml = '';
            if (e.response.data.errors) {
                errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
                Object.values(e.response.data.errors).flat().forEach(msg => {
                    errorHtml += `<li class="mb-1">${msg}</li>`;
                });
                errorHtml += '</ul>';
            } else {
                errorHtml = `<p class="text-danger">${e.response.data.message}</p>`;
            }

            Swal.fire({
                title: 'Dữ liệu không hợp lệ',
                html: errorHtml,
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        } else {
            Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
        }
    } finally {
        isSaving.value = false;
    }
};

const fetchData = async () => {
    try {
        const [catRes, attrRes, brandRes] = await Promise.all([
            axios.get(`${API_URL}/admin/categories?status=active`, { headers: getHeaders() }),
            axios.get(`${API_URL}/admin/attributes`, { headers: getHeaders() }),
            axios.get(`${API_URL}/admin/brands?status=active`, { headers: getHeaders() })
        ]);

        const catData = catRes.data;
        categories.value = Array.isArray(catData.data) ? catData.data : (Array.isArray(catData.data?.data) ? catData.data.data : []);

        const attrData = attrRes.data;
        systemAttributes.value = Array.isArray(attrData.data) ? attrData.data : [];

        const brandData = brandRes.data;
        brands.value = Array.isArray(brandData.data) ? brandData.data : [];

    } catch (e) {
        console.error('Lỗi khởi tạo dữ liệu trang Create Product:', e);
    } finally {
        setTimeout(() => { isPageLoading.value = false; }, 500);
    }
};

const closeDropdownListener = () => {
    if (activeDropdown.value) activeDropdown.value = null;
};

onMounted(() => {
    fetchData();
    window.addEventListener('click', closeDropdownListener);
});

onBeforeUnmount(() => {
    window.removeEventListener('click', closeDropdownListener);
});
</script>

<style scoped>
.custom-tab {
    color: #6c757d;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
}

.custom-tab:not(.disabled):hover {
    color: #009981;
}

.custom-tab.active-tab {
    color: #009981 !important;
    border-bottom-color: #009981;
}

.step-circle {
    display: inline-flex;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e9ecef;
    color: #6c757d;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}

.active-tab .step-circle {
    background: #009981;
    color: white;
}

.form-section-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #6c757d;
    text-transform: uppercase;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
}

.bg-brand {
    background-color: #009981 !important;
}

.text-brand {
    color: #009981 !important;
}

.border-brand {
    border-color: #009981 !important;
}

.btn-brand {
    background-color: #009981;
    color: white;
    transition: 0.2s;
}

.btn-brand:hover {
    background-color: #007a67;
    color: white;
}

.btn-outline-brand {
    color: #009981;
    border-color: #009981;
    transition: 0.2s;
}

.btn-outline-brand:hover {
    background-color: #009981;
    color: white;
}

.cursor-pointer {
    cursor: pointer;
}

.hover-opacity-100:hover {
    opacity: 1 !important;
}

.hover-danger:hover {
    color: #dc3545 !important;
}

.bg-light-brand {
    background-color: #f2fcfb;
}

.variant-table th {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #555;
    vertical-align: middle;
    text-align: center;
    border-bottom: 2px solid #e9ecef;
    white-space: nowrap;
    padding: 12px;
}

.variant-table td {
    vertical-align: middle;
    padding: 8px;
}

.img-preview-sm {
    width: 42px;
    height: 42px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: #fff;
    transition: transform 0.2s;
}

.img-preview-sm:hover {
    transform: scale(1.1);
    border-color: #009981;
}

.is-invalid {
    border-color: #dc3545 !important;
    background-color: #fff8f8;
    animation: shake 0.3s ease-in-out;
}

.row-error td {
    background-color: #fff5f5 !important;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-3px);
    }

    50% {
        transform: translateX(3px);
    }

    75% {
        transform: translateX(-3px);
    }

    100% {
        transform: translateX(0);
    }
}

.logo-shimmer {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: -1.5px;
    background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shine 1.5s linear infinite;
}

@keyframes shine {
    to {
        background-position: 200% center;
    }
}
</style>