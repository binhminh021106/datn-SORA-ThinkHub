<template>
  <div class="checkout-page bg-light-custom pb-5" style="min-height: 100vh; font-family: 'Lato', sans-serif;">
    
    <div class="bg-transparent pt-4 pb-2 border-bottom border-light-subtle bg-white mb-5 shadow-sm">
      <div class="container d-flex justify-content-between align-items-center">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 font-oswald text-uppercase tracking-wide small" style="font-size: 0.75rem;">
            <li class="breadcrumb-item"><router-link to="/cart" class="text-muted text-decoration-none hover-primary">Giỏ hàng</router-link></li>
            <li class="breadcrumb-item active fw-bold text-sora-primary" aria-current="page">Thanh Toán</li>
          </ol>
        </nav>
        <h2 class="font-serif fw-bold text-dark mb-0 fs-4 tracking-wider text-uppercase">Thủ Tục Đặt Hàng</h2>
      </div>
    </div>

    <div class="container">
      <div v-if="isInitializing" class="d-flex flex-column justify-content-center align-items-center py-5 my-5">
        <div class="spinner-border text-sora-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <p class="text-muted font-oswald tracking-widest text-uppercase small">Đang chuẩn bị đơn hàng của bạn...</p>
      </div>

      <div v-else-if="cartItems.length === 0" class="text-center py-5 bg-white shadow-sm border-top border-4 border-danger-custom">
        <div class="py-5">
          <i class="bi bi-bag-x fs-1 text-muted opacity-50 mb-3 d-block" style="font-size: 4rem !important;"></i>
          <h3 class="fs-4 text-dark mb-3 font-serif">Giỏ hàng trống</h3>
          <p class="text-secondary mb-4">Không có sản phẩm nào để thanh toán. Vui lòng quay lại cửa hàng.</p>
          <button @click="router.push('/shop')" class="btn luxury-btn-solid rounded-0 px-5 py-3 text-uppercase fw-bold tracking-wider">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div v-else class="row g-5">
        <div class="col-lg-7">
          <div class="bg-white p-4 p-md-5 shadow-sm border border-light-subtle mb-4">
            <h4 class="font-serif fw-bold text-dark mb-4 pb-3 border-bottom d-flex align-items-center">
              <i class="bi bi-geo-alt-fill text-gold me-2"></i> Thông Tin Giao Hàng
            </h4>
            
            <form @submit.prevent="submitOrder">
              <div class="row g-4">
                
                <div class="col-md-12">
                  <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Email nhận hóa đơn <span class="text-danger">*</span></label>
                  <input type="email" class="form-control luxury-input" v-model="form.customer_email" placeholder="Ví dụ: email@domain.com" required>
                </div>

                <div class="col-md-12" v-if="addresses.length > 0">
                    <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Sổ địa chỉ của bạn</label>
                    <div class="address-selector position-relative">
                        <div class="selected-address-box p-3 border rounded bg-white position-relative cursor-pointer transition-all" 
                             :class="{'border-sora-primary shadow-sm': !useNewAddress, 'border-light-subtle': useNewAddress}"
                             @click="showAddressDropdown = !showAddressDropdown">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="icon-wrap rounded-circle d-flex justify-content-center align-items-center" style="width: 40px; height: 40px; background-color: #fcf4f5;">
                                        <i class="bi bi-geo-alt-fill text-sora-primary fs-5"></i>
                                    </div>
                                    <div v-if="!useNewAddress && getSelectedAddress()">
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <h6 class="mb-0 fw-bold text-dark text-uppercase tracking-wide" style="font-size: 0.95rem;">
                                                {{ getSelectedAddress().customer_name }} <span class="text-muted fw-light mx-1">|</span> {{ getSelectedAddress().customer_phone }}
                                            </h6>
                                            <span v-if="getSelectedAddress().is_default" class="badge bg-danger-subtle text-sora-primary fw-bold px-2 py-1" style="font-size: 0.6rem; letter-spacing: 1px;">MẶC ĐỊNH</span>
                                        </div>
                                        <small class="text-muted lh-base d-block" style="font-size: 0.85rem;">{{ formatFullAddress(getSelectedAddress()) }}</small>
                                    </div>
                                    <div v-else>
                                        <h6 class="mb-0 fw-bold text-dark font-oswald tracking-wide text-uppercase">Tùy chỉnh: Nhập địa chỉ mới</h6>
                                    </div>
                                </div>
                                <i class="bi text-muted transition-transform fs-5" :class="showAddressDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                            </div>
                        </div>

                        <div v-show="showAddressDropdown" class="address-dropdown-options position-absolute w-100 mt-1 border border-light-subtle rounded shadow bg-white overflow-hidden z-index-dropdown">
                            <div v-for="addr in addresses" :key="addr.id" 
                                 class="address-option-item p-3 border-bottom cursor-pointer transition-all hover-bg-light"
                                 :class="{'bg-danger-subtle bg-opacity-10': selectedAddressId === addr.id && !useNewAddress}"
                                 @click="selectAddress(addr.id)">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <span class="fw-bold text-dark text-uppercase tracking-wide" style="font-size: 0.9rem;">
                                                {{ addr.customer_name }} <span class="text-muted fw-light mx-1">|</span> {{ addr.customer_phone }}
                                            </span>
                                            <span v-if="addr.is_default" class="badge bg-danger-subtle text-sora-primary fw-bold px-2" style="font-size: 0.6rem;">MẶC ĐỊNH</span>
                                        </div>
                                        <small class="text-muted d-block" style="font-size: 0.85rem;">{{ formatFullAddress(addr) }}</small>
                                    </div>
                                    <i v-if="selectedAddressId === addr.id && !useNewAddress" class="bi bi-check-circle-fill text-sora-primary fs-4 shadow-sm rounded-circle bg-white"></i>
                                </div>
                            </div>
                            
                            <div class="address-option-item p-3 cursor-pointer text-sora-primary fw-bold font-oswald tracking-wide text-uppercase hover-bg-light d-flex align-items-center" 
                                 @click="selectNewAddress()">
                                <i class="bi bi-plus-circle-fill fs-5 me-2"></i> Nhập địa chỉ giao hàng khác
                                <i v-if="useNewAddress" class="bi bi-check-circle-fill text-sora-primary fs-4 ms-auto shadow-sm rounded-circle bg-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-12" v-show="useNewAddress || addresses.length === 0">
                    <div class="p-4 bg-light border border-light-subtle rounded position-relative mt-2">
                        <div v-if="addresses.length > 0" class="position-absolute top-0 start-50 translate-middle-y bg-white px-2 small text-muted font-oswald tracking-widest text-uppercase fw-bold">Thông Tin Nhận Hàng</div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Họ và tên <span class="text-danger">*</span></label>
                                <input type="text" class="form-control luxury-input" v-model="form.customer_name" placeholder="Tên người nhận" :required="useNewAddress || addresses.length === 0">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Số điện thoại <span class="text-danger">*</span></label>
                                <input type="tel" class="form-control luxury-input" v-model="form.customer_phone" placeholder="SĐT liên hệ" :required="useNewAddress || addresses.length === 0">
                            </div>

                            <div class="col-md-4">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                                <select class="form-select luxury-input" v-model="selectedProvinceCode" @change="fetchDistricts" :required="useNewAddress || addresses.length === 0">
                                    <option value="" disabled>Chọn Tỉnh/Thành</option>
                                    <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Quận/Huyện <span class="text-danger">*</span></label>
                                <select class="form-select luxury-input" v-model="selectedDistrictCode" @change="fetchWards" :disabled="!selectedProvinceCode" :required="useNewAddress || addresses.length === 0">
                                    <option value="" disabled>Chọn Quận/Huyện</option>
                                    <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Phường/Xã <span class="text-danger">*</span></label>
                                <select class="form-select luxury-input" v-model="selectedWardCode" :disabled="!selectedDistrictCode" :required="useNewAddress || addresses.length === 0">
                                    <option value="" disabled>Chọn Phường/Xã</option>
                                    <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Số nhà, Tên đường <span class="text-danger">*</span></label>
                                <input type="text" class="form-control luxury-input" v-model="specificAddress" placeholder="VD: 123 Đường Lê Lợi" :required="useNewAddress || addresses.length === 0">
                            </div>

                        </div>
                    </div>
                </div>

                <div class="col-md-12 mt-4">
                  <label class="form-label font-oswald text-muted text-uppercase tracking-wide small fw-bold">Ghi chú (Tùy chọn)</label>
                  <textarea class="form-control luxury-input" v-model="form.order_note" rows="2" placeholder="VD: Giao giờ hành chính, bọc quà..."></textarea>
                </div>
              </div>

              <h4 class="font-serif fw-bold text-dark mt-5 mb-4 pb-3 border-bottom d-flex align-items-center">
                <i class="bi bi-credit-card-2-front-fill text-gold me-2"></i> Phương Thức Thanh Toán
              </h4>

              <div class="payment-methods-grid d-flex flex-column gap-3">
                <label class="payment-method-box d-flex align-items-center justify-content-between p-3" :class="{'active': form.payment_method === 'cod'}">
                  <input type="radio" name="payment_method" value="cod" v-model="form.payment_method" class="d-none">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-wrap bg-light text-dark rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" style="width: 45px; height: 45px;">
                      <i class="bi bi-cash-stack fs-5"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-bold text-dark font-oswald tracking-wide text-uppercase">Thanh toán khi nhận hàng (COD)</h6>
                      <small class="text-muted">Thanh toán trực tiếp bằng tiền mặt khi giao hàng</small>
                    </div>
                  </div>
                  <div class="radio-indicator flex-shrink-0 ms-3"></div>
                </label>

                <label class="payment-method-box d-flex align-items-center justify-content-between p-3" :class="{'active': form.payment_method === 'momo'}">
                  <input type="radio" name="payment_method" value="momo" v-model="form.payment_method" class="d-none">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-wrap rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 border" style="width: 45px; height: 45px; background-color: #a50064; color: white;">
                      <i class="bi bi-wallet2 fs-5"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-bold text-dark font-oswald tracking-wide text-uppercase" style="color: #a50064 !important;">Thanh toán Ví MoMo / ATM</h6>
                      <small class="text-muted">Thanh toán an toàn qua cổng MoMo Sandbox</small>
                    </div>
                  </div>
                  <div class="radio-indicator flex-shrink-0 ms-3"></div>
                </label>
              </div>
            </form>
          </div>
        </div>

        <!-- CỘT BÊN PHẢI: GIỎ HÀNG & ƯU ĐÃI -->
        <div class="col-lg-5">
          <div class="bg-white shadow-sm border border-light-subtle sticky-top" style="top: 100px;">
            <div class="p-4 bg-light border-bottom">
              <h4 class="font-serif fw-bold text-dark mb-0 d-flex align-items-center justify-content-between">
                <span>Tổng Quan Đơn Hàng</span>
                <span class="badge bg-sora-primary rounded-pill font-oswald fs-6">{{ totalQuantity }} Món</span>
              </h4>
            </div>
            
            <div class="p-4 custom-scrollbar" style="max-height: 450px; overflow-y: auto;">
              <div v-for="item in cartItems" :key="item.id" class="d-flex align-items-start gap-3 mb-4 pb-4 border-bottom border-light-subtle last-border-0">
                <div class="position-relative flex-shrink-0" style="width: 75px; height: 75px;">
                  <img :src="getImageUrl(getItemImage(item))" @error="handleImageError" class="w-100 h-100 object-fit-cover border shadow-sm rounded-1 bg-white p-1">
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-sora-primary shadow-sm" style="font-family: 'Oswald', sans-serif; font-size: 0.75rem; padding: 0.35em 0.5em;">
                    {{ item.quantity }}
                  </span>
                </div>
                
                <div class="flex-grow-1 ps-2">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="fw-bold text-dark font-serif mb-1 fs-6 lh-sm pr-3" style="max-width: 85%;">{{ getItemName(item) }}</h6>
                    <button class="btn btn-link text-danger p-0 border-0 ms-2 flex-shrink-0" @click="removeItem(item.id)" :disabled="item.isUpdating" title="Xóa khỏi giỏ hàng">
                        <i class="bi bi-trash3 fs-5"></i>
                    </button>
                  </div>
                  
                  <div class="small text-muted font-oswald text-uppercase tracking-wide mb-2" style="font-size: 0.7rem;">
                    <span v-if="item.combo_id" class="text-gold fw-bold"><i class="bi bi-stars"></i> Gói Ưu Đãi</span>
                    <span v-else-if="item.variant?.attributes">
                      <span v-for="(val, key, idx) in parseAttributes(item.variant.attributes)" :key="key">
                        {{ val }}<span v-if="idx < Object.keys(parseAttributes(item.variant.attributes)).length - 1">, </span>
                      </span>
                    </span>
                  </div>
                  
                  <div class="d-flex justify-content-between align-items-center mt-3">
                      <div class="fw-bold text-sora-primary font-oswald fs-5">{{ formatPrice(getItemPrice(item)) }}</div>
                      
                      <div class="input-group input-group-sm" style="width: 85px;">
                          <button class="btn btn-outline-secondary rounded-0 px-2 border-light-subtle" @click="updateQuantity(item, -1)" :disabled="item.quantity <= 1 || item.isUpdating">-</button>
                          <input type="text" class="form-control text-center rounded-0 border-light-subtle px-1 fw-bold font-oswald text-dark" :value="item.quantity" readonly>
                          <button class="btn btn-outline-secondary rounded-0 px-2 border-light-subtle" @click="updateQuantity(item, 1)" :disabled="item.isUpdating">+</button>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PHẦN CHỌN MÃ GIẢM GIÁ COUPON -->
            <div class="p-4 bg-light border-top border-bottom border-light-subtle">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="font-oswald tracking-wide text-uppercase mb-1 fw-bold text-dark"><i class="bi bi-ticket-perforated text-sora-primary me-2"></i>SORA Voucher</h6>
                        <small class="text-muted" v-if="!selectedCoupon && !isCouponBlocked">Chưa áp dụng ưu đãi nào</small>
                        <small class="text-success fw-bold text-uppercase tracking-wide" v-else-if="selectedCoupon">Đã áp dụng: {{ selectedCoupon.code }}</small>
                    </div>
                    <button v-if="!isCouponBlocked" @click="openCouponModal" type="button" class="btn luxury-btn-outline btn-sm py-2 px-3 font-oswald tracking-widest text-uppercase fw-bold">
                        {{ selectedCoupon ? 'Đổi Mã' : 'Chọn Mã' }}
                    </button>
                </div>
                <div v-if="isCouponBlocked" class="text-danger small fst-italic mt-2 fw-medium">
                    <i class="bi bi-info-circle me-1"></i> Không thể dùng mã giảm giá vì Giỏ hàng chứa Gói Ưu Đãi (Combo) không cho phép cộng dồn.
                </div>
            </div>

            <!-- THÔNG TIN ĐẶC QUYỀN HẠNG THÀNH VIÊN -->
            <div class="p-4 bg-light border-bottom border-light-subtle" v-if="tierDiscountInfo">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="font-oswald tracking-wide text-uppercase mb-1 fw-bold text-dark">
                            <i class="bi bi-star-fill text-gold me-2"></i>Đặc Quyền Hạng {{ tierDiscountInfo.tier_name }}
                        </h6>
                        <small class="text-muted" v-if="tierDiscountInfo.remaining_quota > 0">
                            Giảm {{ tierDiscountInfo.discount_percent }}% tổng đơn hàng (Còn {{ tierDiscountInfo.remaining_quota }}/{{ tierDiscountInfo.yearly_quota }} lượt)
                        </small>
                        <small class="text-danger fw-bold text-uppercase tracking-wide" v-else>
                            <i class="bi bi-exclamation-circle-fill me-1"></i> Đã hết lượt giảm giá năm nay ({{ tierDiscountInfo.yearly_quota }}/{{ tierDiscountInfo.yearly_quota }})
                        </small>
                    </div>
                    <span class="badge bg-gold text-dark border rounded-pill font-oswald px-3 py-2" v-if="tierDiscountInfo.remaining_quota > 0">
                        TỰ ĐỘNG ÁP DỤNG
                    </span>
                </div>
            </div>

            <div class="p-4 bg-white">
              <div class="d-flex justify-content-between mb-3 text-dark font-oswald tracking-wide text-uppercase small">
                <span class="text-muted">Tạm tính:</span>
                <span class="fw-bold">{{ formatPrice(subTotal) }}</span>
              </div>
              
              <div class="d-flex justify-content-between mb-3 text-dark font-oswald tracking-wide text-uppercase small">
                  <span class="text-muted">Phí giao hàng:</span>
                  <span class="fw-bold" :class="shippingFee === 0 ? 'text-success' : ''">
                      {{ shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) }}
                  </span>
              </div>
              
              <small class="text-muted d-block mt-1 mb-3 pb-3 border-bottom" style="font-size: 0.78rem; line-height: 1.3;">
                  {{ shippingNote }}<br>
                  <span style="font-size: 0.75rem;"><i class="bi bi-info-circle me-1"></i> Phí tính theo khoảng cách thực tế từ Buôn Ma Thuột.</span>
              </small>

              <div v-if="discountAmount > 0" class="d-flex justify-content-between mb-3 text-success font-oswald tracking-wide text-uppercase small fw-bold">
                <span>Ưu đãi Voucher:</span>
                <span>- {{ formatPrice(discountAmount) }}</span>
              </div>

              <div v-if="tierDiscountAmount > 0" class="d-flex justify-content-between mb-3 text-success font-oswald tracking-wide text-uppercase small fw-bold">
                <span>Ưu đãi hạng {{ tierDiscountInfo?.tier_name }}:</span>
                <span>- {{ formatPrice(tierDiscountAmount) }}</span>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-2 border-dark">
                <span class="text-dark font-oswald tracking-widest text-uppercase fw-bold">Tổng Thanh Toán:</span>
                <span class="fs-3 fw-bold text-sora-primary ">{{ formatPrice(totalAmount) }}</span>
              </div>
            </div>

            <div class="p-4 pt-0 bg-white">
              <button @click="submitOrder" :disabled="isSubmitting || cartItems.length === 0" class="btn luxury-btn-solid w-100 py-3 font-oswald tracking-widest text-uppercase fw-bold shadow-sm fs-5 d-flex justify-content-center align-items-center">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-if="!isSubmitting" class="bi bi-bag-check-fill me-2"></i> 
                {{ isSubmitting ? 'ĐANG XỬ LÝ...' : (form.payment_method === 'momo' ? 'THANH TOÁN QUA MOMO' : 'HOÀN TẤT ĐẶT HÀNG') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL COUPON -->
    <div class="modal fade" id="couponModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header bg-light border-bottom p-4">
            <h5 class="modal-title font-serif fw-bold text-dark d-flex align-items-center"><i class="bi bi-ticket-detailed text-gold me-2"></i> SORA Vouchers</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-light-custom custom-scrollbar">
              <div v-if="availableCoupons.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-ticket-x fs-1 mb-2 d-block"></i>
                  <p class="font-oswald tracking-wide">Hiện không có mã giảm giá nào khả dụng.</p>
              </div>
              <div class="d-flex flex-column gap-3">
                  <div v-for="coupon in availableCoupons" :key="coupon.id" 
                       class="card border-0 shadow-sm rounded position-relative overflow-hidden cursor-pointer transition-all"
                       :class="{'border border-sora-primary bg-danger-subtle bg-opacity-10': selectedCoupon?.id === coupon.id, 'opacity-50': subTotal < coupon.min_spend}"
                       @click="applyCoupon(coupon)">
                      <div class="position-absolute top-0 bottom-0 start-0 border-start border-3 border-dashed border-sora-primary" style="width: 5px;"></div>
                      
                      <div class="card-body p-3 ps-4 d-flex align-items-center justify-content-between">
                          <div>
                              <h6 class="fw-bold font-oswald text-sora-primary tracking-wide text-uppercase mb-1">{{ coupon.name }}</h6>
                              <div class="fw-bold text-dark fs-5 font-serif mb-1">
                                  Giảm {{ coupon.type === 'fixed' ? formatPrice(coupon.value) : coupon.value + '%' }}
                              </div>
                              <small class="text-muted d-block">Đơn tối thiểu: {{ formatPrice(coupon.min_spend) }}</small>
                              <div class="mt-2 text-danger small fw-bold font-oswald tracking-wide" v-if="subTotal < coupon.min_spend">
                                  <i class="bi bi-exclamation-circle-fill me-1"></i> Mua thêm {{ formatPrice(coupon.min_spend - subTotal) }} để dùng
                              </div>
                          </div>
                          <div class="text-end ps-3 border-start">
                              <span class="badge bg-dark rounded-pill font-monospace mb-2">{{ coupon.code }}</span>
                              <div v-if="selectedCoupon?.id === coupon.id" class="text-success mt-2"><i class="bi bi-check-circle-fill fs-3 shadow-sm rounded-circle bg-white"></i></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="modal-footer border-top bg-white p-3">
              <button type="button" @click="clearCoupon" class="btn btn-outline-secondary rounded-0 font-oswald tracking-widest text-uppercase fw-bold px-4" v-if="selectedCoupon">Bỏ Chọn</button>
              <button type="button" class="btn luxury-btn-solid rounded-0 font-oswald tracking-widest text-uppercase fw-bold px-4 ms-auto" data-bs-dismiss="modal">Đồng ý</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const router = useRouter();

const isInitializing = ref(true);
const isSubmitting = ref(false);
const isUpdatingCart = ref(false);

const cartItems = ref([]);
const addresses = ref([]);
const availableCoupons = ref([]);
const tierDiscountInfo = ref(null); // Biến lưu thông tin Hạng thành viên

const selectedAddressId = ref(null);
const useNewAddress = ref(false);
const showAddressDropdown = ref(false);

const selectedCoupon = ref(null);
let couponModalInstance = null;

// BIẾN CHO CHỌN TỈNH THÀNH
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvinceCode = ref('');
const selectedDistrictCode = ref('');
const selectedWardCode = ref('');
const specificAddress = ref(''); 

const form = ref({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '', 
    order_note: '',
    payment_method: 'cod'
});

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  cancelButtonColor: '#6c757d',
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase',
    cancelButton: 'px-4 py-2 mx-2 rounded-0 fw-bold font-oswald tracking-widest text-uppercase'
  }
});

const getSafeStorage = (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const removeSafeStorage = (key) => { try { localStorage.removeItem(key); } catch(e) {} };

const getHeaders = () => {
  const headers = { 'Accept': 'application/json' };
  const token = getSafeStorage('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const sid = getSafeStorage('cart_session_id');
  if (sid) headers['X-Cart-Session-Id'] = sid;
  return headers;
};

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = rawBaseUrl.replace(/\/api\/?$/, '');

const fetchProvinces = async () => {
    try {
        const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await response.json();
        if (data.error === 0) {
            provinces.value = data.data.map(item => ({ code: item.id, name: item.full_name }));
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh thành", error);
    }
};

const fetchDistricts = async () => {
    selectedDistrictCode.value = '';
    selectedWardCode.value = '';
    districts.value = [];
    wards.value = [];
    if (!selectedProvinceCode.value) return;
    try {
        const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvinceCode.value}.htm`);
        const data = await response.json();
        if (data.error === 0) {
            districts.value = data.data.map(item => ({ code: item.id, name: item.full_name }));
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách quận huyện", error);
    }
};

const fetchWards = async () => {
    selectedWardCode.value = '';
    wards.value = [];
    if (!selectedDistrictCode.value) return;
    try {
        const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictCode.value}.htm`);
        const data = await response.json();
        if (data.error === 0) {
            wards.value = data.data.map(item => ({ code: item.id, name: item.full_name }));
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách phường xã", error);
    }
};

const SHOP_LAT = 12.6675;
const SHOP_LNG = 108.0378;
const DAKLAK_PROVINCE_CODE = '66';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getLatLongFromAddress = async (fullAddress) => {
    if (!fullAddress || fullAddress.length < 10) return null;

    const parts = fullAddress.split(',').map(p => p.trim());

    while (parts.length >= 2) { 
        const queryAddress = parts.join(', ');
        try {
            const url = new URL('https://nominatim.openstreetmap.org/search');
            url.search = new URLSearchParams({ 
                q: queryAddress, 
                format: 'json', 
                limit: 1,
                countrycodes: 'vn',
                addressdetails: 1
            });
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data?.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            } else {
                parts.shift();
            }
        } catch (e) {
            console.error('❌ Nominatim lỗi:', e.message);
            return null; 
        }
    }
    
    return null; 
};

const calculateShippingFee = (distance) => {
    distance = Math.max(0, Math.round(distance || 0));
    if (distance <= 25) return 0;
    if (distance <= 70)  return 25000;
    if (distance <= 150) return 35000;
    if (distance <= 250) return 45000;
    const extraKm = distance - 250;
    const extraFee = Math.ceil(extraKm / 120) * 15000;
    return Math.min(45000 + extraFee, 130000);
};

const shippingFee = ref(0);
const shippingNote = ref('Đang tính phí vận chuyển...');

let shippingTimeout = null;

watch(
    [
        selectedProvinceCode,
        selectedDistrictCode,
        selectedWardCode,
        specificAddress,
        useNewAddress,
        () => form.value.customer_address
    ],
    () => {
        if (shippingTimeout) clearTimeout(shippingTimeout);

        shippingTimeout = setTimeout(async () => {
            shippingNote.value = 'Đang tính phí vận chuyển...';

            if (selectedProvinceCode.value === '66' || selectedProvinceCode.value === '12') {
                shippingFee.value = 0;
                shippingNote.value = 'Miễn phí (nội tỉnh Đắk Lắk)';
                return;
            }

            let addressParts = [];
            if (useNewAddress.value || addresses.value.length === 0) {
                if (specificAddress.value) addressParts.push(specificAddress.value.trim());
                const wName = wards.value.find(w => w.code === selectedWardCode.value)?.name || '';
                const dName = districts.value.find(d => d.code === selectedDistrictCode.value)?.name || '';
                const pName = provinces.value.find(p => p.code === selectedProvinceCode.value)?.name || '';
                if (wName) addressParts.push(wName);
                if (dName) addressParts.push(dName);
                if (pName) addressParts.push(pName);
            } else {
                addressParts = [form.value.customer_address];
            }

            const fullAddress = addressParts.filter(Boolean).join(', ') + ', Việt Nam';

            if (!fullAddress || fullAddress.length < 15) {
                shippingFee.value = 35000;
                shippingNote.value = 'Chưa có địa chỉ đầy đủ';
                return;
            }

            const coords = await getLatLongFromAddress(fullAddress);
            if (coords) {
                const distance = haversineDistance(SHOP_LAT, SHOP_LNG, coords.lat, coords.lng);
                shippingFee.value = calculateShippingFee(distance);
                shippingNote.value = `📍 ${distance.toFixed(1)} km từ Buôn Ma Thuột`;
            } else {
                shippingFee.value = 35000;
                shippingNote.value = 'Phí vận chuyển: 35.000đ (không lấy được khoảng cách)';
            }
        }, 650);
    },
    { immediate: true }
);

// --- LOGIC GIAO DIỆN & TÍNH TOÁN ---
const getItemName = (item) => {
    if (item.combo_id && item.combo) return item.combo.name;
    if (item.product_variant_id && item.variant) return item.variant.product?.name || 'Trang sức SORA';
    return 'Sản phẩm';
};

const getItemImage = (item) => {
    if (item.combo_id && item.combo) return item.combo.thumbnail_image;
    if (item.product_variant_id && item.variant) return item.variant.image_url || item.variant.product?.thumbnail_image;
    return null;
};

const getItemPrice = (item) => {
    if (item.price !== undefined) return parseFloat(item.price);
    if (item.variant) return parseFloat(item.variant.promotional_price || item.variant.price || 0);
    return 0; 
};

const parseAttributes = (attr) => {
    if (typeof attr === 'object') return attr;
    try { return JSON.parse(attr); } catch { return {}; }
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
const getImageUrl = (path) => path ? (path.startsWith('http') ? path : `${apiBaseUrl}/storage/${path}`) : defaultPlaceholder;
const handleImageError = (e) => { e.target.src = defaultPlaceholder; };

const totalQuantity = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));
const subTotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.quantity * getItemPrice(item)), 0));

const hasComboInCart = computed(() => cartItems.value.some(item => item.combo_id !== null));
const isCouponBlocked = computed(() => cartItems.value.some(item => item.combo_id !== null && item.combo && !item.combo.is_discount_stackable));

watch(isCouponBlocked, (isBlocked) => {
    if (isBlocked && selectedCoupon.value) selectedCoupon.value = null;
});

const discountAmount = computed(() => {
    if (!selectedCoupon.value || isCouponBlocked.value) return 0;
    if (subTotal.value < selectedCoupon.value.min_spend) return 0; 
    if (selectedCoupon.value.type === 'fixed') return parseFloat(selectedCoupon.value.value);
    return subTotal.value * (parseFloat(selectedCoupon.value.value) / 100);
});

// THÊM: Tính số tiền giảm giá của hạng thành viên
const tierDiscountAmount = computed(() => {
    if (!tierDiscountInfo.value) return 0;
    if (tierDiscountInfo.value.remaining_quota <= 0) return 0; // Đã hết lượt dùng thì bằng 0
    return subTotal.value * (parseFloat(tierDiscountInfo.value.discount_percent) / 100);
});

// CẬP NHẬT: Trừ đi cả phần tiền giảm hạng thành viên
const totalAmount = computed(() => Math.max(subTotal.value - discountAmount.value - tierDiscountAmount.value + shippingFee.value, 0));

const fetchInitData = async () => {
    try {
        const res = await axios.get(`${apiBaseUrl}/api/client/checkout/init`, { headers: getHeaders() });
        if (res.data && res.data.success) {
            cartItems.value = res.data.cart_items || [];
            addresses.value = res.data.addresses || [];
            availableCoupons.value = res.data.coupons || [];
            tierDiscountInfo.value = res.data.tier_discount || null; // Nhận thông tin Hạng từ Backend

            if (res.data.user) {
                form.value.customer_email = res.data.user.email || '';
                form.value.customer_name = res.data.user.name || '';
                form.value.customer_phone = res.data.user.phone || '';
            } else {
                const userStr = getSafeStorage('user_info');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    form.value.customer_email = u.email || '';
                    if (addresses.value.length === 0) {
                        form.value.customer_name = u.fullName || u.name || '';
                        form.value.customer_phone = u.phone || '';
                    }
                }
            }

            if (addresses.value.length > 0) {
                const defaultAddr = addresses.value.find(a => a.is_default === 1) || addresses.value[0];
                selectedAddressId.value = defaultAddr.id;
                useNewAddress.value = false;
                form.value.customer_address = formatFullAddress(defaultAddr); 
            } else {
                useNewAddress.value = true;
            }
        }
    } catch (error) {
        console.error('Lỗi khởi tạo Checkout:', error);
        
        if (error.response && error.response.status === 401) {
            soraAlert.fire({
                icon: 'info',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để tiếp tục thanh toán.',
                confirmButtonText: 'Đăng nhập ngay',
                allowOutsideClick: false
            }).then(() => {
                router.push({ name: 'login' }); 
            });
        } 
        else if (error.response && error.response.status === 404) {
             soraAlert.fire({ icon: 'error', title: 'Lỗi 404', text: 'Đường dẫn API không tồn tại. Vui lòng kiểm tra lại thiết lập biến môi trường VITE_API_BASE_URL' });
        }
    }
};

const getSelectedAddress = () => {
    if (!selectedAddressId.value) return null;
    return addresses.value.find(a => a.id === selectedAddressId.value);
};
const formatFullAddress = (addr) => {
    if (!addr) return '';
    return [addr.shipping_address, addr.ward, addr.district, addr.city].filter(Boolean).join(', ');
};

const selectAddress = (id) => {
    selectedAddressId.value = id;
    useNewAddress.value = false;
    showAddressDropdown.value = false;
    
    const addr = addresses.value.find(a => a.id === id);
    if (addr) {
        form.value.customer_address = formatFullAddress(addr);
    }
};

const selectNewAddress = () => {
    selectedAddressId.value = null;
    useNewAddress.value = true;
    showAddressDropdown.value = false;
    form.value.customer_address = ''; 
};

const updateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    
    item.isUpdating = true;
    isUpdatingCart.value = true;
    try {
        const res = await axios.put(`${apiBaseUrl}/api/client/cart/${item.id}`, { quantity: newQty }, { headers: getHeaders() });
        if (res.data.success) {
            item.quantity = newQty;
            if (selectedCoupon.value && subTotal.value < selectedCoupon.value.min_spend) {
                selectedCoupon.value = null;
                Swal.fire({toast:true, position:'top', icon:'warning', title:'Đã hủy mã giảm giá vì chưa đạt giá trị tối thiểu', showConfirmButton:false, timer:2000});
            }
        }
    } catch (error) {
        Swal.fire({toast:true, position:'top', icon:'error', title:'Lỗi cập nhật', showConfirmButton:false, timer:2000});
    } finally {
        item.isUpdating = false;
        isUpdatingCart.value = false;
    }
};

const removeItem = async (itemId) => {
  soraAlert.fire({
    title: 'Xóa sản phẩm?',
    text: "Bạn có chắc chắn muốn bỏ mặt hàng này khỏi giỏ không?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      isUpdatingCart.value = true;
      try {
        const response = await axios.delete(`${apiBaseUrl}/api/client/cart/${itemId}`, { headers: getHeaders() });
        if (response.data.success) {
          cartItems.value = cartItems.value.filter(i => i.id !== itemId);
          if (selectedCoupon.value && subTotal.value < selectedCoupon.value.min_spend) {
              selectedCoupon.value = null;
          }
        }
      } catch (error) {
        soraAlert.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi xóa. Vui lòng thử lại.', confirmButtonText: 'Đóng' });
      } finally {
        isUpdatingCart.value = false;
      }
    }
  });
};

const openCouponModal = () => {
    if (isCouponBlocked.value) return; 
    if (!couponModalInstance) {
        couponModalInstance = new window.bootstrap.Modal(document.getElementById('couponModal'));
    }
    couponModalInstance.show();
};
const applyCoupon = (coupon) => {
    if (subTotal.value < coupon.min_spend) return;
    selectedCoupon.value = coupon;
};
const clearCoupon = () => {
    selectedCoupon.value = null;
    if (couponModalInstance) couponModalInstance.hide();
};

const checkDirectBuy = async () => {
    const directComboStr = getSafeStorage('checkout_combo_direct');
    if (directComboStr) {
        try {
            const payload = JSON.parse(directComboStr);
            const res = await axios.post(`${apiBaseUrl}/api/client/cart/add-combo`, payload, { headers: getHeaders() });
            if (res.data && res.data.session_id && !getSafeStorage('auth_token')) {
                try { localStorage.setItem('cart_session_id', res.data.session_id); } catch(e){}
            }
            removeSafeStorage('checkout_combo_direct');
        } catch (e) {}
    }
};

const submitOrder = async () => {
    if (!form.value.customer_name || !form.value.customer_phone || !form.value.customer_email) {
        soraAlert.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng điền đầy đủ các thông tin nhận hàng!' });
        return;
    }

    if (useNewAddress.value || addresses.value.length === 0) {
        if (!selectedProvinceCode.value || !selectedDistrictCode.value || !selectedWardCode.value || !specificAddress.value) {
            soraAlert.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng chọn đầy đủ Tỉnh/Huyện/Xã và nhập số nhà!' });
            return;
        }
        
        const pName = provinces.value.find(p => p.code === selectedProvinceCode.value)?.name || '';
        const dName = districts.value.find(d => d.code === selectedDistrictCode.value)?.name || '';
        const wName = wards.value.find(w => w.code === selectedWardCode.value)?.name || '';

        form.value.customer_address = `${specificAddress.value}, ${wName}, ${dName}, ${pName}`;
    }

    const payload = {
        user_address_id: useNewAddress.value ? null : selectedAddressId.value,
        customer_name: form.value.customer_name,
        customer_phone: form.value.customer_phone,
        customer_address: form.value.customer_address,
        customer_email: form.value.customer_email,
        order_note: form.value.order_note,
        payment_method: form.value.payment_method,
        coupon_code: selectedCoupon.value && !isCouponBlocked.value ? selectedCoupon.value.code : null,
        shipping_fee: shippingFee.value
    };

    isSubmitting.value = true;
    try {
        const res = await axios.post(`${apiBaseUrl}/api/client/checkout`, payload, { headers: getHeaders() });
        
        if (res.data.success) {
            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
                return; 
            }
            
            soraAlert.fire({
                icon: 'success',
                title: 'ĐẶT HÀNG THÀNH CÔNG',
                html: `Cảm ơn bạn đã mua sắm tại SORA.<br>Mã đơn hàng: <b>${res.data.data.order_code}</b>`,
                confirmButtonText: 'Xong',
                allowOutsideClick: false
            }).then(() => {
                removeSafeStorage('cart_session_id');
                router.push('/checkout/success?order=' + res.data.data.order_code).catch(()=>{});
            });
        }
    } catch (error) {
        let errorMsg = 'Không thể đặt hàng. Vui lòng thử lại sau.';
        if (error.response?.status === 422 && error.response?.data?.errors) {
            errorMsg = Object.values(error.response.data.errors)[0][0]; 
        } else if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
        }
        soraAlert.fire({ icon: 'error', title: 'Thanh toán không thành công', text: errorMsg });
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(async () => {
    const token = getSafeStorage('auth_token');
    if (!token) {
         soraAlert.fire({
            icon: 'warning',
            title: 'Yêu cầu đăng nhập',
            text: 'Bạn cần đăng nhập để tiến hành thanh toán.',
            confirmButtonText: 'Đăng nhập ngay',
            allowOutsideClick: false
        }).then(() => {
            router.push({ name: 'login' }); 
        });
        return; 
    }

    isInitializing.value = true;
    await checkDirectBuy();
    await fetchInitData(); 
    await fetchProvinces();
    isInitializing.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

onUnmounted(() => {
    if (couponModalInstance) couponModalInstance.dispose();
    if (shippingTimeout) clearTimeout(shippingTimeout);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.bg-light-custom { background-color: #faf9f6; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-wide { letter-spacing: 1px; }
.tracking-widest { letter-spacing: 2px; }
.z-index-dropdown { z-index: 1050; }

.text-sora-primary { color: #9f273b !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }
.bg-gold { background-color: #e7ce7d !important; }
.border-danger-custom { border-color: #9f273b !important; }
.border-sora-primary { border-color: #9f273b !important; }
.border-dashed { border-style: dashed !important; }

.hover-primary:hover { color: #9f273b !important; }
.hover-bg-light:hover { background-color: #f8f9fa !important; }

.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.3s ease; }
.transition-transform { transition: transform 0.3s ease; }

.luxury-btn-solid { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.luxury-btn-solid:hover:not(:disabled) { background-color: #7a1c2d; border-color: #7a1c2d; color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }
.luxury-btn-solid:disabled { opacity: 0.7; cursor: not-allowed; }

.luxury-btn-outline { color: #9f273b; border: 1px solid #9f273b; background: transparent; transition: 0.3s; }
.luxury-btn-outline:hover { background: #9f273b; color: white; }

.luxury-input {
    border-radius: 0;
    border: 1px solid #ddd;
    padding: 12px 15px;
    background-color: #fff;
    transition: all 0.3s;
    font-size: 0.95rem;
}
.luxury-input:focus {
    border-color: #9f273b;
    box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.1);
    outline: none;
}
.form-select.luxury-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
}

.payment-method-box {
    border: 1px solid #eee;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}
.payment-method-box:hover {
    border-color: #ccc;
    background-color: #fafafa;
}
.payment-method-box.active {
    border-color: #9f273b;
    background-color: #fffafa;
    box-shadow: 0 4px 15px rgba(159, 39, 59, 0.08);
}
.radio-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ddd;
    position: relative;
    transition: all 0.3s;
    background: #fff;
}
.payment-method-box.active .radio-indicator { border-color: #9f273b; }
.payment-method-box.active .radio-indicator::after {
    content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 10px; height: 10px; border-radius: 50%; background-color: #9f273b;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbb; }
.last-border-0:last-child { border-bottom: none !important; padding-bottom: 0 !important; margin-bottom: 0 !important; }
</style>