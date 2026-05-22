<template>
  <div class="profile-page bg-light-custom font-sans pb-5 min-vh-100 position-relative">
    
    <!-- Tiêu đề trang -->
    <section class="py-5 bg-white text-center shadow-sm mb-5">
      <div class="container py-3">
        <h1 class="display-6 font-serif text-main mb-3">Tài Khoản Của Tôi</h1>
        <div class="divider bg-accent mx-auto"></div>
      </div>
    </section>

    <div class="container">
      <div v-if="!isLoggedIn" class="text-center py-5 bg-white shadow-sm p-5 border border-light mb-5">
        <h4 class="text-danger-custom mb-3">Bạn chưa đăng nhập!</h4>
        <p class="text-secondary mb-4">Vui lòng đăng nhập để xem và chỉnh sửa thông tin cá nhân.</p>
        <router-link to="/login" class="btn btn-main px-5 py-2 text-uppercase">Đăng nhập ngay</router-link>
      </div>

      <div v-else class="row g-4 g-lg-5">
        
        <!-- SIDEBAR MENU BÊN TRÁI -->
        <div class="col-lg-3">
          <div class="bg-white p-4 shadow-sm border border-light text-center mb-4 rounded-3">
            
            <!-- SVG Gradient Definitions (hidden, dùng chung cho toàn trang) -->
            <svg width="0" height="0" style="position:absolute">
              <defs>
                <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#bdbdbd" />
                  <stop offset="100%" style="stop-color:#9e9e9e" />
                </linearGradient>
                <linearGradient id="grad-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e0e0e0" />
                  <stop offset="50%" style="stop-color:#b0b0b0" />
                  <stop offset="100%" style="stop-color:#c8c8c8" />
                </linearGradient>
                <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffd700" />
                  <stop offset="50%" style="stop-color:#f5a623" />
                  <stop offset="100%" style="stop-color:#ffec8b" />
                </linearGradient>
                <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#76d7f5" />
                  <stop offset="50%" style="stop-color:#4dd0e1" />
                  <stop offset="100%" style="stop-color:#a8e6f0" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Avatar + Huy Hiệu Tier (Shopee-style) -->
            <div class="avatar-tier-container mx-auto mb-4 position-relative" style="width: 140px; height: 155px;">
              
              <!-- HUY HIỆU TIER phía trên avatar -->
              <div class="tier-badge-crown" :class="tierBadgeClass" v-if="currentTierInfo.name">
                <div class="tier-badge-inner">
                  <span class="tier-badge-svg" v-html="tierSvgIcon"></span>
                  <span class="tier-badge-label">{{ currentTierInfo.name }}</span>
                </div>
              </div>
              <div class="tier-badge-crown tier-default" v-else>
                <div class="tier-badge-inner">
                  <span class="tier-badge-svg" v-html="tierSvgDefault"></span>
                  <span class="tier-badge-label">Thành viên</span>
                </div>
              </div>

              <!-- Avatar -->
              <div class="avatar-wrapper mx-auto position-relative rounded-circle overflow-hidden bg-light" 
                   style="width: 120px; height: 120px; cursor: pointer; border: 4px solid #fff; box-shadow: 0 0 0 3px var(--tier-border-color, #e7ce7d), 0 8px 16px rgba(0,0,0,0.1);" 
                   :style="{ '--tier-border-color': tierBorderColor }"
                   @click="triggerFileInput" title="Click để thay đổi ảnh đại diện">
                
                <img :src="previewAvatar || getImageUrl(form.avatar_url) || 'https://ui-avatars.com/api/?name=' + form.fullName + '&background=9f273b&color=fff'" 
                     alt="Avatar" class="w-100 h-100 object-fit-cover" style="object-position: center;">
                
                <!-- Lớp phủ khi hover -->
                <div class="avatar-upload-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="small mt-1 fw-medium" style="font-size: 0.75rem; letter-spacing: 0.5px;">Đổi ảnh</span>
                </div>
              </div>
            </div>
            
            <!-- Thẻ input file ẩn -->
            <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange">

            <h5 class="font-serif text-dark mb-1 fw-bold" style="font-size: 1.25rem;">{{ form.fullName || 'Thành viên SORA' }}</h5>
            <p class="text-muted small fw-light mb-0">{{ form.email }}</p>
          </div>

          <div class="bg-white shadow-sm border border-light overflow-hidden rounded-3">
            <ul class="list-unstyled mb-0 profile-menu">
              <li>
                <router-link to="/profile" class="d-flex align-items-center p-3 text-decoration-none active-menu">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Hồ sơ cá nhân
                </router-link>
              </li>
              <li>
                <router-link to="/order" class="d-flex align-items-center p-3 text-decoration-none text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Đơn mua của tôi
                </router-link>
              </li>
              <li>
                <router-link to="/favourite" class="d-flex align-items-center p-3 text-decoration-none text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Sản phẩm yêu thích
                </router-link>
              </li>
              <li class="border-top">
                <a href="#" @click.prevent="logout" class="d-flex align-items-center p-3 text-decoration-none text-danger-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- CÁC FORM CẬP NHẬT BÊN PHẢI -->
        <div class="col-lg-9">

          <!-- ====== CARD HẠNG THÀNH VIÊN ====== -->
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

          <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
            
            <!-- FORM 1: THÔNG TIN CÁ NHÂN & ĐỊA CHỈ -->
            <h3 class="h4 font-serif text-dark mb-1">Hồ Sơ Của Tôi</h3>
            <p class="text-secondary fw-light border-bottom pb-3 mb-4">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-accent" role="status"></div>
            </div>

            <form v-else @submit.prevent="updateProfile">
              <div class="row mb-4 align-items-center">
                <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Tên Đăng Nhập / Email</label>
                <div class="col-sm-9 col-md-7">
                  <input type="email" class="form-control bg-light text-muted" :value="form.email" disabled>
                  <small class="text-muted fw-light mt-1 d-block">Email không thể thay đổi</small>
                </div>
              </div>

              <div class="row mb-4 align-items-center">
                <label for="fullName" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Họ Và Tên</label>
                <div class="col-sm-9 col-md-7">
                  <input type="text" class="form-control custom-input" :class="{'is-invalid': errors.fullName}" id="fullName" v-model="form.fullName" @blur="validateField('fullName')" required placeholder="Nhập họ và tên của bạn">
                  <div v-if="errors.fullName" class="invalid-feedback">{{ errors.fullName }}</div>
                </div>
              </div>

              <div class="row mb-4 align-items-center">
                <label for="phone" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Số Điện Thoại</label>
                <div class="col-sm-9 col-md-7">
                  <input type="tel" class="form-control custom-input" :class="{'is-invalid': errors.phone}" id="phone" v-model="form.phone" @input="form.phone = form.phone.replace(/\D/g, '')" @blur="validateField('phone')" placeholder="Nhập số điện thoại liên hệ">
                  <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
                </div>
              </div>

              <div class="row mb-4 align-items-center">
                <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium" :class="{'text-danger': errors.gender}">Giới Tính</label>
                <div class="col-sm-9 col-md-7">
                  <div class="d-flex gap-4 pt-2">
                    <div class="form-check custom-radio">
                      <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderMale" value="Nam" v-model="form.gender" @change="validateField('gender')">
                      <label class="form-check-label text-secondary" for="genderMale">Nam</label>
                    </div>
                    <div class="form-check custom-radio">
                      <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderFemale" value="Nữ" v-model="form.gender" @change="validateField('gender')">
                      <label class="form-check-label text-secondary" for="genderFemale">Nữ</label>
                    </div>
                    <div class="form-check custom-radio">
                      <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderOther" value="Khác" v-model="form.gender" @change="validateField('gender')">
                      <label class="form-check-label text-secondary" for="genderOther">Khác</label>
                    </div>
                  </div>
                  <div v-if="errors.gender" class="small text-danger mt-1">{{ errors.gender }}</div>
                </div>
              </div>

              <div class="row mb-4 align-items-center">
                <label for="birthday" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Ngày Sinh</label>
                <div class="col-sm-9 col-md-7">
                  <input type="date" class="form-control custom-input" :class="{'is-invalid': errors.birthday}" id="birthday" v-model="form.birthday" @blur="validateField('birthday')">
                  <div v-if="errors.birthday" class="invalid-feedback">{{ errors.birthday }}</div>
                </div>
              </div>

              <!-- HIỂN THỊ SỔ ĐỊA CHỈ -->
              <div class="row mb-5 align-items-start">
                <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium pt-2">Sổ Địa Chỉ</label>
                <div class="col-sm-9 col-md-7">
                  
                  <div v-if="isLoadingAddresses" class="spinner-border spinner-border-sm text-accent mt-2" role="status"></div>
                  
                  <!-- Trạng thái chưa có địa chỉ -->
                  <div v-else-if="!defaultAddress" class="d-flex align-items-center justify-content-between bg-light p-3 rounded border border-light">
                    <span class="text-secondary fw-light small">Chưa có địa chỉ nhận hàng.</span>
                    <button type="button" @click="openAddAddressModal" class="btn btn-sm btn-outline-main text-uppercase fw-medium rounded-0" style="letter-spacing: 0.05em;">
                      + Thêm Mới
                    </button>
                  </div>

                  <!-- Trạng thái đã có địa chỉ -->
                  <div v-else class="border border-light p-3 rounded-3 bg-light-custom position-relative transition-all hover-shadow">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="mb-0 text-dark font-serif d-flex align-items-center fw-bold">
                        {{ defaultAddress.customer_name }}
                        <span class="text-muted mx-2 fw-light fw-normal">|</span>
                        <span class="text-secondary fw-normal fs-6">{{ defaultAddress.customer_phone }}</span>
                      </h6>
                      <!-- Nút Mở Modal Sổ địa chỉ -->
                      <button type="button" @click="openAddressListModal" class="btn btn-link text-accent p-0 text-decoration-none fw-medium small" style="font-size: 0.85rem;">
                        Thay Đổi
                      </button>
                    </div>
                    <p class="text-secondary mb-1 small">{{ defaultAddress.shipping_address }}</p>
                    <p class="text-secondary mb-0 fw-light small">{{ defaultAddress.ward }}, {{ defaultAddress.district }}, {{ defaultAddress.city }}</p>
                    
                    <span v-if="defaultAddress.is_default" class="badge bg-main text-white mt-2 px-2 py-1" style="font-size: 0.65rem;">Mặc Định</span>
                    <span v-if="addresses.length > 1" class="text-muted small ms-2 fw-light fst-italic">(và {{ addresses.length - 1 }} địa chỉ khác)</span>
                  </div>

                </div>
              </div>

              <div class="row">
                <div class="col-sm-9 offset-sm-3">
                  <button type="submit" class="btn btn-main px-5 py-2 text-uppercase fw-medium rounded-0" :disabled="isSaving" style="letter-spacing: 0.1em;">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
                  </button>
                </div>
              </div>
            </form>

            <!-- FORM 2: ĐỔI MẬT KHẨU -->
            <div class="mt-5 pt-4 border-top">
              <h3 class="h4 font-serif text-dark mb-1">Đổi Mật Khẩu</h3>
              <p class="text-secondary fw-light mb-4">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              
              <form @submit.prevent="changePassword">
                <div class="row mb-4 align-items-center">
                  <label for="currentPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Hiện Tại</label>
                  <div class="col-sm-9 col-md-7">
                    <input type="password" class="form-control custom-input" id="currentPassword" v-model="passwordForm.current_password" required placeholder="Nhập mật khẩu hiện tại">
                  </div>
                </div>
                
                <div class="row mb-4 align-items-center">
                  <label for="newPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Mới</label>
                  <div class="col-sm-9 col-md-7">
                    <input type="password" class="form-control custom-input" id="newPassword" v-model="passwordForm.password" required minlength="6" placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)">
                  </div>
                </div>

                <div class="row mb-4 align-items-center">
                  <label for="confirmPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Xác Nhận Mật Khẩu</label>
                  <div class="col-sm-9 col-md-7">
                    <input type="password" class="form-control custom-input" id="confirmPassword" v-model="passwordForm.password_confirmation" required placeholder="Nhập lại mật khẩu mới">
                  </div>
                </div>

                <div class="row">
                  <div class="col-sm-9 offset-sm-3">
                    <button type="submit" class="btn btn-outline-main px-5 py-2 text-uppercase fw-medium rounded-0" :disabled="isChangingPassword" style="letter-spacing: 0.1em;">
                      <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đổi Mật Khẩu
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL QUẢN LÝ SỔ ĐỊA CHỈ (CỬA SỔ BẬT LÊN)  -->
    <!-- ========================================== -->
    <transition name="modal-fade">
      <div v-if="isAddressModalOpen" class="custom-modal-overlay" @click.self="closeAddressModal">
        <div class="custom-modal-content p-4 p-md-5 position-relative">
          
          <!-- Nút Đóng Modal -->
          <button type="button" class="btn-close position-absolute top-0 end-0 m-4" @click="closeAddressModal" aria-label="Close"></button>

          <!-- TIÊU ĐỀ & NÚT THÊM -->
          <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
            <div>
              <h3 class="h4 font-serif text-dark mb-1">Sổ Địa Chỉ</h3>
              <p class="text-secondary fw-light mb-0">Quản lý địa chỉ nhận hàng của bạn</p>
            </div>
            <button v-if="!showAddressForm" @click="openAddAddressForm" class="btn btn-main px-4 py-2 text-uppercase fw-medium rounded-0" style="font-size: 0.85rem; letter-spacing: 0.05em;">
              + Thêm Địa Chỉ
            </button>
          </div>

          <!-- GIAO DIỆN HIỂN THỊ DANH SÁCH -->
          <div v-if="!showAddressForm">
            <div v-if="addresses.length === 0" class="text-center py-5 bg-light border border-light rounded-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-muted mb-3 opacity-50 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-secondary mb-0">Bạn chưa có địa chỉ nào được lưu.</p>
            </div>

            <div v-else class="row g-3">
              <div v-for="addr in addresses" :key="addr.id" class="col-12">
                <div class="border border-light p-4 position-relative bg-light-custom rounded-3 transition-all hover-shadow">
                  <!-- Badge Mặc Định -->
                  <span v-if="addr.is_default" class="badge bg-main position-absolute top-0 end-0 m-3 px-3 py-2 fw-medium tracking-wide">Mặc Định</span>
                  
                  <div class="row align-items-center">
                    <div class="col-md-8 col-lg-9">
                      <h5 class="font-serif text-dark mb-2 d-flex align-items-center fw-bold">
                        {{ addr.customer_name }} 
                        <span class="text-muted mx-2 fw-light fw-normal">|</span> 
                        <span class="text-secondary fw-normal fs-6">{{ addr.customer_phone }}</span>
                      </h5>
                      <p class="text-secondary mb-1">{{ addr.shipping_address }}</p>
                      <p class="text-secondary mb-0 fw-light">{{ addr.ward }}, {{ addr.district }}, {{ addr.city }}</p>
                    </div>
                    
                    <div class="col-md-4 col-lg-3 d-flex flex-column justify-content-center align-items-md-end mt-3 mt-md-0 border-md-start ps-md-4">
                      <div class="d-flex gap-3 mb-2">
                        <a href="#" @click.prevent="openEditAddressForm(addr)" class="text-accent text-decoration-none fw-medium hover-main transition-all">Cập nhật</a>
                        <a href="#" @click.prevent="confirmDeleteAddress(addr.id)" class="text-danger-custom text-decoration-none fw-medium transition-all">Xóa</a>
                      </div>
                      <button v-if="!addr.is_default" @click="setDefaultAddress(addr.id)" class="btn btn-sm btn-outline-secondary rounded-0 mt-2 w-100">Làm mặc định</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- GIAO DIỆN FORM THÊM / CẬP NHẬT TRONG MODAL -->
          <div v-if="showAddressForm" class="bg-white">
            <h4 class="font-serif text-main mb-4">{{ isEditingAddress ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới' }}</h4>
            <form @submit.prevent="saveAddress">
              <div class="row g-4 mb-4">
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-medium">Họ và tên người nhận <span class="text-danger">*</span></label>
                  <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.customer_name}" v-model="addressForm.customer_name" @blur="validateAddressField('customer_name')" required placeholder="Nhập họ tên">
                  <div v-if="addressErrors.customer_name" class="invalid-feedback">{{ addressErrors.customer_name }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-medium">Số điện thoại <span class="text-danger">*</span></label>
                  <input type="tel" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.customer_phone}" v-model="addressForm.customer_phone" @input="addressForm.customer_phone = addressForm.customer_phone.replace(/\D/g, '')" @blur="validateAddressField('customer_phone')" required placeholder="Nhập số điện thoại">
                  <div v-if="addressErrors.customer_phone" class="invalid-feedback">{{ addressErrors.customer_phone }}</div>
                </div>
              </div>

              <!-- ĐÃ CẬP NHẬT: SỬ DỤNG BỘ DATA CHUẨN Kenzouno1 (GIỐNG ADMIN) -->
              <div class="row g-4 mb-4">
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Tỉnh / Thành phố <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.city}" v-model="addressForm.city" @change="handleCityChange(); validateAddressField('city')" required>
                    <option value="" disabled>-- Chọn Tỉnh/TP --</option>
                    <option v-for="p in provincesData" :key="p.Id" :value="p.Name">{{ p.Name }}</option>
                  </select>
                  <div v-if="addressErrors.city" class="invalid-feedback">{{ addressErrors.city }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Quận / Huyện <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.district}" v-model="addressForm.district" @change="handleDistrictChange(); validateAddressField('district')" :disabled="!addressForm.city" required>
                    <option value="" disabled>-- Chọn Quận/Huyện --</option>
                    <option v-for="d in districtsData" :key="d.Id" :value="d.Name">{{ d.Name }}</option>
                  </select>
                  <div v-if="addressErrors.district" class="invalid-feedback">{{ addressErrors.district }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Phường / Xã <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.ward}" v-model="addressForm.ward" @change="validateAddressField('ward')" :disabled="!addressForm.district" required>
                    <option value="" disabled>-- Chọn Phường/Xã --</option>
                    <option v-for="w in wardsData" :key="w.Id" :value="w.Name">{{ w.Name }}</option>
                  </select>
                  <div v-if="addressErrors.ward" class="invalid-feedback">{{ addressErrors.ward }}</div>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-end mb-2">
                  <label class="form-label text-secondary small fw-medium mb-0">Địa chỉ cụ thể <span class="text-danger">*</span></label>
                  <button type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" @click="getCurrentLocation" :disabled="isLocating">
                    <span v-if="isLocating" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-geo-alt"></i> Lấy định vị hiện tại
                  </button>
                </div>
                <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.shipping_address}" v-model="addressForm.shipping_address" @blur="validateAddressField('shipping_address')" required placeholder="Số nhà, tên tòa nhà, tên đường...">
                <div v-if="addressErrors.shipping_address" class="invalid-feedback">{{ addressErrors.shipping_address }}</div>
                
                <!-- HIỂN THỊ BẢN ĐỒ KHI ĐÃ CÓ MAP URL -->
                <div v-if="mapUrl" class="mt-3 rounded overflow-hidden border shadow-sm">
                  <iframe :src="mapUrl" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
              </div>

              <div class="form-check custom-checkbox mb-5">
                <input class="form-check-input" type="checkbox" id="isDefaultAddress" v-model="addressForm.is_default">
                <label class="form-check-label text-secondary" for="isDefaultAddress">Đặt làm địa chỉ mặc định</label>
              </div>

              <div class="d-flex gap-3">
                <button type="submit" class="btn btn-main px-5 py-2 rounded-0 text-uppercase fw-medium" :disabled="isSavingAddress" style="letter-spacing: 0.05em;">
                  <span v-if="isSavingAddress" class="spinner-border spinner-border-sm me-2"></span>Hoàn Thành
                </button>
                <button type="button" @click="closeAddressForm" class="btn btn-outline-secondary px-5 py-2 rounded-0 text-uppercase fw-medium" style="letter-spacing: 0.05em;">Trở Lại</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();


// CẤU HÌNH THÔNG BÁO (SWEETALERT2 ĐỒNG BỘ UI)

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase'
  }
});

const showToast = (message, type = 'success') => {
  soraAlert.fire({
    icon: type,
    title: type === 'success' ? 'Thành Công!' : 'Có Lỗi Xảy Ra!',
    text: message,
    timer: type === 'success' ? 2500 : undefined,
    showConfirmButton: type !== 'success'
  });
};

const isLoggedIn = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);

const fileInput = ref(null);
const avatarFile = ref(null);
const previewAvatar = ref(null);

const provincesData = ref([]);
const districtsData = ref([]);
const wardsData = ref([]);

const fetchProvinces = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
    
    if (!response.ok) {
        throw new Error('Lỗi mạng khi tải dữ liệu');
    }
    
    const data = await response.json();
    provincesData.value = data;
    
  } catch (error) {
    console.error('Lỗi lấy dữ liệu hành chính:', error);
    
    try {
      const fallbackResponse = await fetch('https://provinces.open-api.vn/api/p/');
      const fallbackData = await fallbackResponse.json();
      provincesData.value = fallbackData.map(p => ({ Id: p.code, Name: p.name, Districts: [] }));
    } catch (fallbackError) {
      console.error('Fallback API cũng lỗi:', fallbackError);
    }
  }
};

const handleCityChange = () => {
  addressForm.value.district = '';
  addressForm.value.ward = '';
  updateDistricts();
  wardsData.value = [];
};

const handleDistrictChange = () => {
  addressForm.value.ward = '';
  updateWards();
};

const updateDistricts = () => {
  const province = provincesData.value.find(p => p.Name === addressForm.value.city);
  districtsData.value = province ? province.Districts : [];
};
const updateWards = () => {
  const district = districtsData.value.find(d => d.Name === addressForm.value.district);
  wardsData.value = district ? district.Wards : [];
};


// STATE QUẢN LÝ SỔ ĐỊA CHỈ

const addresses = ref([]);
const isLoadingAddresses = ref(false);
const isAddressModalOpen = ref(false); 
const showAddressForm = ref(false);
const isEditingAddress = ref(false);
const isSavingAddress = ref(false);
const addressForm = ref({
  id: null,
  customer_name: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  district: '',
  ward: '',
  is_default: false
});

const addressErrors = ref({
  customer_name: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  district: '',
  ward: ''
});

const validateAddressField = (field) => {
  if (field === 'customer_name') {
    let val = addressForm.value.customer_name || '';
    val = val.trim().replace(/\s+/g, ' ');
    addressForm.value.customer_name = val;
    if (!val) {
      addressErrors.value.customer_name = 'Vui lòng nhập tên người nhận';
    } else if (val.length < 2 || val.length > 50) {
      addressErrors.value.customer_name = 'Tên người nhận phải từ 2 đến 50 ký tự';
    } else if (!/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/.test(val)) {
      addressErrors.value.customer_name = 'Tên người nhận phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)';
    } else {
      addressErrors.value.customer_name = '';
    }
  }

  if (field === 'customer_phone') {
    let val = addressForm.value.customer_phone || '';
    val = val.replace(/\D/g, ''); 
    addressForm.value.customer_phone = val;
    
    if (!val) {
      addressErrors.value.customer_phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) {
      addressErrors.value.customer_phone = 'Số điện thoại không hợp lệ';
    } else {
      addressErrors.value.customer_phone = '';
    }
  }

  if (field === 'shipping_address') {
    let val = addressForm.value.shipping_address || '';
    if (!val) {
      addressErrors.value.shipping_address = 'Vui lòng nhập địa chỉ chi tiết';
    } else if (val.length < 10) {
      addressErrors.value.shipping_address = 'Địa chỉ quá ngắn';
    } else if (val.length > 255) {
      addressErrors.value.shipping_address = 'Địa chỉ tối đa 255 ký tự';
    } else {
      addressErrors.value.shipping_address = '';
    }
  }

  if (field === 'city') {
    addressErrors.value.city = addressForm.value.city ? '' : 'Vui lòng chọn Tỉnh/TP';
  }
  if (field === 'district') {
    addressErrors.value.district = addressForm.value.district ? '' : 'Vui lòng chọn Quận/Huyện';
  }
  if (field === 'ward') {
    addressErrors.value.ward = addressForm.value.ward ? '' : 'Vui lòng chọn Phường/Xã';
  }
};

const isLocating = ref(false);
const mapUrl = ref('');

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showToast('Trình duyệt của bạn không hỗ trợ định vị', 'error');
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`);
      if (response.data && response.data.display_name) {
        mapUrl.value = `https://maps.google.com/maps?q=${lat},${lon}&hl=vi&z=15&output=embed`;
        addressForm.value.shipping_address = response.data.display_name;
        validateAddressField('shipping_address');
        showToast('Đã lấy vị trí hiện tại', 'success');
      }
    } catch (err) {
      showToast('Lỗi khi lấy thông tin địa chỉ từ tọa độ', 'error');
    } finally {
      isLocating.value = false;
    }
  }, (err) => {
    showToast('Không thể lấy vị trí. Vui lòng cấp quyền!', 'error');
    isLocating.value = false;
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
};

const defaultAddress = computed(() => {
  if (addresses.value.length === 0) return null;
  const def = addresses.value.find(addr => addr.is_default);
  return def || addresses.value[0]; 
});

const form = ref({
  fullName: '', email: '', phone: '', gender: '', birthday: '', avatar_url: '',
  tier_id: null, accumulated_spent: 0, accumulated_orders: 0, tier: null, all_tiers: []
});

const errors = ref({
  fullName: '',
  phone: '',
  gender: '',
  birthday: ''
});

const validateField = (field) => {
  if (field === 'fullName') {
    let val = form.value.fullName || '';
    val = val.trim().replace(/\s+/g, ' ');
    form.value.fullName = val;
    
    if (!val) {
      errors.value.fullName = 'Vui lòng nhập họ và tên';
    } else if (val.length < 2 || val.length > 50) {
      errors.value.fullName = 'Họ tên phải từ 2 đến 50 ký tự';
    } else if (!/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/.test(val)) {
      errors.value.fullName = 'Họ tên phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)';
    } else {
      errors.value.fullName = '';
    }
  }

  if (field === 'phone') {
    let val = form.value.phone || '';
    val = val.replace(/\D/g, ''); 
    form.value.phone = val;
    
    if (!val) {
      errors.value.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) {
      errors.value.phone = 'Số điện thoại không hợp lệ';
    } else {
      errors.value.phone = '';
    }
  }

  if (field === 'birthday') {
    let val = form.value.birthday || '';
    if (!val) {
      errors.value.birthday = 'Vui lòng chọn ngày sinh';
    } else {
      const bday = new Date(val);
      const today = new Date();
      if (bday > today) {
        errors.value.birthday = 'Ngày sinh không hợp lệ';
      } else {
        let age = today.getFullYear() - bday.getFullYear();
        const m = today.getMonth() - bday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
          age--;
        }
        if (age < 13) {
          errors.value.birthday = 'Bạn chưa đủ tuổi sử dụng';
        } else {
          errors.value.birthday = '';
        }
      }
    }
  }

  if (field === 'gender') {
    if (!form.value.gender) {
      errors.value.gender = 'Vui lòng chọn giới tính';
    } else {
      errors.value.gender = '';
    }
  }
};

const passwordForm = ref({
  current_password: '', password: '', password_confirmation: ''
});

const apiBase = `${import.meta.env.VITE_API_BASE_URL}/client/profile`; 

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val; 
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed && typeof parsed === 'object') {
        if (parsed.access_token) return parsed.access_token;
        if (parsed.token) return parsed.token;
      }
    } catch(e) {}
  }
  return '';
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000/storage/${path}`;
};


// CÁC HÀM XỬ LÝ SỔ ĐỊA CHỈ 

const openAddAddressModal = () => {
  isAddressModalOpen.value = true;
  openAddAddressForm();
};

const openAddressListModal = () => {
  isAddressModalOpen.value = true;
  showAddressForm.value = false;
};

const closeAddressModal = () => {
  isAddressModalOpen.value = false;
  setTimeout(() => {
    showAddressForm.value = false;
  }, 300); 
};

const fetchAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    const response = await axios.get(`${apiBase}/addresses`, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      addresses.value = response.data.data;
    }
  } catch (error) {
    console.error('Lỗi lấy địa chỉ:', error);
  } finally {
    isLoadingAddresses.value = false;
  }
};

const openAddAddressForm = () => {
  isEditingAddress.value = false;
  addressForm.value = { 
    id: null, 
    customer_name: form.value.fullName || '', 
    customer_phone: form.value.phone || '',   
    shipping_address: '', 
    city: '', 
    district: '', 
    ward: '', 
    is_default: addresses.value.length === 0 
  };
  districtsData.value = []; // Reset list Huyện
  wardsData.value = [];     // Reset list Xã
  mapUrl.value = '';        // Reset bản đồ
  showAddressForm.value = true;
};

const openEditAddressForm = (addr) => {
  isEditingAddress.value = true;
  addressForm.value = { 
    ...addr, 
    is_default: addr.is_default === 1 || addr.is_default === true 
  };
  
  // Mồi sẵn dữ liệu Huyện/Xã để hiển thị đúng theo Tỉnh/Huyện mà DB trả ra
  updateDistricts();
  updateWards();
  
  mapUrl.value = ''; // Reset bản đồ
  showAddressForm.value = true;
};

const closeAddressForm = () => {
  if (addresses.value.length === 0) {
    closeAddressModal();
  } else {
    showAddressForm.value = false;
  }
};

const saveAddress = async () => {
  validateAddressField('customer_name');
  validateAddressField('customer_phone');
  validateAddressField('shipping_address');
  validateAddressField('city');
  validateAddressField('district');
  validateAddressField('ward');

  if (
    addressErrors.value.customer_name || 
    addressErrors.value.customer_phone || 
    addressErrors.value.shipping_address || 
    addressErrors.value.city || 
    addressErrors.value.district || 
    addressErrors.value.ward
  ) {
    return;
  }

  isSavingAddress.value = true;
  try {
    const url = isEditingAddress.value ? `${apiBase}/addresses/${addressForm.value.id}` : `${apiBase}/addresses`;
    const method = isEditingAddress.value ? 'put' : 'post';
    const payload = { ...addressForm.value, is_default: addressForm.value.is_default ? 1 : 0 };

    const response = await axios[method](url, payload, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });

    if (response.data.status) {
      showToast(response.data.message, 'success');
      fetchAddresses(); 
      showAddressForm.value = false; 
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
       showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'error');
    } else {
       showToast('Lỗi lưu địa chỉ.', 'error');
    }
  } finally {
    isSavingAddress.value = false;
  }
};

const confirmDeleteAddress = async (id) => {
  soraAlert.fire({
    title: 'Xóa Địa Chỉ?',
    text: "Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ tay?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'XÓA NGAY',
    cancelButtonText: 'HỦY'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${apiBase}/addresses/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
        });
        if (response.data.status) {
          showToast('Đã xóa địa chỉ', 'success');
          fetchAddresses();
        }
      } catch (error) {
        showToast('Lỗi khi xóa địa chỉ.', 'error');
      }
    }
  });
};

const setDefaultAddress = async (id) => {
  try {
    const response = await axios.put(`${apiBase}/addresses/${id}/default`, {}, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      showToast('Đã thay đổi địa chỉ mặc định', 'success');
      fetchAddresses();
    }
  } catch (error) {
    showToast('Lỗi thiết lập địa chỉ mặc định', 'error');
  }
};

const fetchProfile = async () => {
  try {
    const response = await axios.get(apiBase, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    
    if (response.data.status) {
      const userData = response.data.data;
      form.value = {
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthday: userData.birthday || '',
        avatar_url: userData.avatar_url || '',
        tier_id: userData.tier_id || null,
        accumulated_spent: parseFloat(userData.accumulated_spent) || 0,
        accumulated_orders: parseInt(userData.accumulated_orders) || 0,
        tier: userData.tier || null,
        all_tiers: userData.all_tiers || []
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      isLoggedIn.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

const triggerFileInput = () => { fileInput.value.click(); };
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
  }
};

const updateProfile = async () => {
  validateField('fullName');
  validateField('phone');
  validateField('gender');
  validateField('birthday');

  if (errors.value.fullName || errors.value.phone || errors.value.gender || errors.value.birthday) {
    const firstError = ['fullName', 'phone', 'gender', 'birthday'].find(k => errors.value[k] !== '');
    if (firstError) {
      const el = document.getElementById(firstError) || document.querySelector(`input[name="${firstError}"]`);
      if (el) el.focus();
    }
    return;
  }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('fullName', form.value.fullName || '');
    if (form.value.phone) formData.append('phone', form.value.phone);
    if (form.value.gender) formData.append('gender', form.value.gender);
    if (form.value.birthday) formData.append('birthday', form.value.birthday);
    if (avatarFile.value) formData.append('avatar', avatarFile.value);

    const response = await axios.post(apiBase, formData, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (response.data.status) {
      showToast(response.data.message, 'success');
      if (response.data.data.avatar_url) form.value.avatar_url = response.data.data.avatar_url;
      previewAvatar.value = null;
      avatarFile.value = null;
      updateLocalAuthData(response.data.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      showToast(`Lỗi dữ liệu: ${firstErrorMsg}`, 'error');
    } else {
      showToast('Lỗi cập nhật. Vui lòng thử lại sau.', 'error');
    }
  } finally {
    isSaving.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  isChangingPassword.value = true;
  try {
    const response = await axios.post(`${apiBase}/password`, passwordForm.value, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      showToast(response.data.message, 'success');
      passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showToast(error.response.data.message, 'error'); 
    } else if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      showToast(`Lỗi: ${firstErrorMsg}`, 'error');
    } else {
      showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
  } finally {
    isChangingPassword.value = false;
  }
};

const updateLocalAuthData = (newData) => {
  try {
    let authState = JSON.parse(localStorage.getItem('auth') || '{}');
    if (authState.user) {
      authState.user.fullName = newData.fullName;
      if (newData.avatar_url) authState.user.avatar_url = newData.avatar_url;
      localStorage.setItem('auth', JSON.stringify(authState));
    }
  } catch(err) {
    return err;
  }
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login'; 
};

onMounted(() => {
  const token = getToken();
  if (token) {
    isLoggedIn.value = true;
    fetchProfile();
    fetchAddresses(); 
    fetchProvinces(); // NẠP DỮ LIỆU TỈNH THÀNH KHI MỞ TRANG
  } else {
    isLoggedIn.value = false;
    isLoading.value = false;
  }
});

// ===== TÍNH TOÁN THÔNG TIN HẠNG THÀNH VIÊN =====
const allTiers = computed(() => form.value.all_tiers || []);

const currentTierInfo = computed(() => {
  if (form.value.tier) {
    return {
      name: form.value.tier.name,
      discount: parseFloat(form.value.tier.discount_percent) || 0,
      serviceQuota: form.value.tier.yearly_service_quota || 0,
      minSpent: parseFloat(form.value.tier.min_spent) || 0,
      iconUrl: form.value.tier.icon_url || null,
    };
  }
  return { name: '', discount: 0, serviceQuota: 0, minSpent: 0, iconUrl: null };
});

const nextTierInfo = computed(() => {
  const tiers = allTiers.value;
  if (!tiers.length) return null;
  const spent = form.value.accumulated_spent || 0;
  // Tìm tier tiếp theo mà user chưa đạt
  return tiers.find(t => parseFloat(t.min_spent) > spent) || null;
});

const tierProgressPercent = computed(() => {
  if (!nextTierInfo.value) return 100;
  const spent = form.value.accumulated_spent || 0;
  const target = parseFloat(nextTierInfo.value.min_spent);
  if (target <= 0) return 100;
  return Math.min(Math.round((spent / target) * 100), 100);
});

const amountToNextTier = computed(() => {
  if (!nextTierInfo.value) return 0;
  const spent = form.value.accumulated_spent || 0;
  return Math.max(parseFloat(nextTierInfo.value.min_spent) - spent, 0);
});

const isTierAchieved = (tier) => {
  return (form.value.accumulated_spent || 0) >= parseFloat(tier.min_spent);
};

// Hàm xác định kiểu huy hiệu dựa trên tên tier
const tierBadgeClass = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-silver';
  return 'tier-default';
});

// --- SVG ICON TEMPLATES (thay vì dùng emoji) ---
const svgStar = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgShield = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const svgCrown = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M2 20h20v2H2zM4 17l2-10 4 4 2-6 2 6 4-4 2 10H4z"/></svg>`;
const svgDiamond = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.5L5.5 9h13L12 17.5z"/></svg>`;

const tierSvgDefault = svgStar(15, 'grad-default');

const tierSvgIcon = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return svgDiamond(15, 'grad-diamond');
  if (name.includes('vàng') || name.includes('gold')) return svgCrown(15, 'grad-gold');
  if (name.includes('bạc') || name.includes('silver')) return svgShield(15, 'grad-silver');
  return svgStar(15, 'grad-default');
});

const tierSvgIconLg = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return svgDiamond(28, 'grad-diamond');
  if (name.includes('vàng') || name.includes('gold')) return svgCrown(28, 'grad-gold');
  if (name.includes('bạc') || name.includes('silver')) return svgShield(28, 'grad-silver');
  return svgStar(28, 'grad-default');
});

const tierBorderColor = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return '#b9f2ff';
  if (name.includes('vàng') || name.includes('gold')) return '#ffd700';
  if (name.includes('bạc') || name.includes('silver')) return '#c0c0c0';
  return '#e7ce7d';
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
/* Màu sắc thương hiệu SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }

.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.divider { width: 4rem; height: 2px; }
.object-fit-cover { object-fit: cover !important; }
.tracking-wide { letter-spacing: 0.1em; }
.tracking-widest { letter-spacing: 2px; }

/* ==================================== */
/* HUY HIỆU TIER TRÊN AVATAR           */
/* ==================================== */
.avatar-tier-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tier-badge-crown {
  display: flex;
  justify-content: center;
  margin-bottom: -8px;
  z-index: 2;
  position: relative;
  animation: badgeFloat 3s ease-in-out infinite;
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.tier-badge-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.tier-badge-svg { display: flex; align-items: center; line-height: 0; }
.tier-badge-label { text-transform: uppercase; }

.tier-default .tier-badge-inner {
  background: #f5f5f5;
  color: #757575;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.tier-silver .tier-badge-inner {
  background: linear-gradient(135deg, #f5f5f5 0%, #d6d6d6 50%, #ececec 100%);
  color: #5a5a5a;
  border: 1px solid #c0c0c0;
  box-shadow: 0 2px 10px rgba(150,150,150,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
}

.tier-gold .tier-badge-inner {
  background: linear-gradient(135deg, #fceabb 0%, #f8b500 50%, #fce38a 100%);
  color: #7a5800;
  border: 1px solid #e6a800;
  box-shadow: 0 2px 12px rgba(245,166,35,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
}

.tier-diamond .tier-badge-inner {
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 40%, #b2ebf2 70%, #e0f7fa 100%);
  color: #00838f;
  border: 1px solid #4dd0e1;
  box-shadow: 0 2px 14px rgba(77,208,225,0.35), inset 0 1px 0 rgba(255,255,255,0.7);
}

/* ==================================== */
/* CARD HẠNG THÀNH VIÊN               */
/* ==================================== */
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

/* Progress bar */
.tier-progress-section {
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.tier-progress-label {
  font-size: 0.78rem;
  color: #666;
}

.tier-progress-emoji { font-size: 0.85rem; }

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

/* Tier Roadmap */
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

/* Menu Sidebar */
.profile-menu a {
  transition: all 0.3s ease;
}
.profile-menu a:hover {
  background-color: #faf9f8;
  color: #9f273b !important;
}
.active-menu {
  color: #9f273b !important;
  background-color: #f8eaec;
  font-weight: 500;
  border-left: 3px solid #9f273b;
}

/* Avatar Hover Effect */
.avatar-upload-overlay {
  background-color: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

/* Hiệu ứng hover cho card địa chỉ */
.transition-all { transition: all 0.3s ease; }
.hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); border-color: #e7ce7d !important; }
.hover-main:hover { color: #9f273b !important; }

/* Custom Input / Select */
.custom-input {
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
}
.custom-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
  outline: none;
}
/* Trả lại không gian cho icon của form-select Bootstrap */
select.custom-input {
  padding-right: 2.5rem; 
}
/* CSS làm mờ mũi tên dropdown ở thẻ select nếu nó bị disable */
.custom-input:disabled {
  background-color: #f8f9fa !important;
  cursor: not-allowed;
}

/* Custom Checkbox / Radio */
.custom-radio .form-check-input:checked,
.custom-checkbox .form-check-input:checked {
  background-color: #9f273b;
  border-color: #9f273b;
}

/* Nút bấm (Button) */
.btn-main {
  background-color: #9f273b;
  color: white;
  border: 1px solid #9f273b;
  transition: all 0.3s ease;
}
.btn-main:hover {
  background-color: #cc1e2e;
  border-color: #cc1e2e;
  color: white;
}
.btn-outline-main {
  background-color: transparent;
  color: #9f273b;
  border: 1px solid #9f273b;
  transition: all 0.3s ease;
}
.btn-outline-main:hover {
  background-color: #9f273b;
  color: white;
}

/* ======================================= */
/* TÙY CHỈNH MODAL SỔ ĐỊA CHỈ              */
/* ======================================= */
.custom-modal-overlay {
  position: fixed;
  top: 0; 
  left: 0; 
  width: 100vw; 
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}
.custom-modal-content {
  background: white;
  width: 100%;
  max-width: 850px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 1rem 4rem rgba(0,0,0,0.25);
}
/* Hiệu ứng trượt và mờ khi bật Modal */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; transform: translateY(-20px); }
</style>  