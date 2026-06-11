<template>
  <div class="services-page font-sans bg-light-custom pb-5">
    
    <!-- 1. Tiêu đề chính (Hero Section) -->
    <section class="hero-services position-relative d-flex align-items-center justify-content-center text-center overflow-hidden">
      <div class="hero-overlay position-absolute w-100 h-100 top-0 start-0"></div>
      <div class="position-relative z-1 d-flex flex-column align-items-center px-3 pt-5">
        <span class="text-accent text-uppercase fw-bold mb-3 tracking-wide" style="font-size: 0.85rem; letter-spacing: 0.3em;">Dịch vụ đặc quyền</span>
        <h1 class="display-3 fw-bold text-white font-serif mb-3" style="letter-spacing: 0.05em;">Dấu Ấn Độc Bản</h1>
        <div class="divider bg-accent mb-4 mx-auto"></div>
      </div>
    </section>

    <!-- 2. Đoạn giới thiệu -->
    <section class="py-5 bg-white text-center" style="position: relative; z-index: 2;">
      <div class="container py-4">
        <div class="max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" class="text-main mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <h2 class="h3 font-serif text-dark mb-4">Nghệ Thuật Chăm Sóc Khách Hàng Cao Cấp</h2>
          <p class="text-secondary fw-light lead" style="line-height: 1.8;">
            Tại SORA, trải nghiệm mua sắm không dừng lại ở khoảnh khắc trao tay. Chúng tôi mang đến hệ sinh thái dịch vụ hậu mãi toàn diện và cá nhân hóa, đảm bảo mỗi tác phẩm trang sức luôn giữ trọn vẻ đẹp nguyên bản và kể tiếp câu chuyện của riêng bạn.
          </p>
        </div>
      </div>
    </section>

    <!-- 3. Danh sách dịch vụ -->
    <section class="py-5 bg-light-custom">
      <div class="container">
        <div class="row g-4">
          
          <!-- Dịch vụ 1 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Thiết Kế Theo Yêu Cầu</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Biến ý tưởng thành hiện thực. Đội ngũ thiết kế 3D và nghệ nhân SORA sẽ đồng hành cùng bạn phác thảo và chế tác nên món trang sức mang đậm dấu ấn cá nhân (Bespoke Jewelry).
              </p>
            </div>
          </div>

          <!-- Dịch vụ 2 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Khắc Tên & Thông Điệp</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Cá nhân hóa tuyệt đối bằng công nghệ khắc laser tinh xảo. Lưu giữ ngày kỷ niệm, tên gọi hoặc một thông điệp bí mật mặt trong chiếc nhẫn hay mặt dây chuyền của bạn.
              </p>
            </div>
          </div>

          <!-- Dịch vụ 3 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Làm Sạch & Bảo Dưỡng</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Trang sức SORA được hưởng đặc quyền làm sạch bằng sóng siêu âm miễn phí trọn đời, giúp kim cương và đá quý luôn giữ được độ sáng lấp lánh như ngày đầu.
              </p>
            </div>
          </div>

          <!-- Dịch vụ 4 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Sửa Chữa & Đánh Bóng</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Từ việc thay đổi kích cỡ (ni niềng) đến hàn, xi mạ và khôi phục bề mặt kim loại bị xước. Đội ngũ kỹ thuật viên của SORA sẽ phục hồi nguyên trạng tác phẩm của bạn.
              </p>
            </div>
          </div>

          <!-- Dịch vụ 5 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Tư Vấn Phong Cách</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Phiên làm việc 1:1 cùng Stylist trang sức của chúng tôi. Tìm kiếm món đồ phù hợp với cung mệnh, làn da, dáng người hay hoàn thiện bộ trang phục dạ hội của bạn.
              </p>
            </div>
          </div>

          <!-- Dịch vụ 6 -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-0 shadow-sm service-card p-4 p-md-5 text-center">
              <div class="icon-wrapper mx-auto mb-4 border border-accent rounded-circle d-flex align-items-center justify-content-center text-main" style="width: 70px; height: 70px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 class="h5 font-serif text-dark mb-3">Nghệ Thuật Gói Quà</h3>
              <p class="text-secondary fw-light small mb-0" style="line-height: 1.7;">
                Mỗi sản phẩm SORA được đặt trong hộp nhung bọc lụa cao cấp, kèm ruy băng thắt tay tỉ mỉ và một tấm thiệp viết tay theo yêu cầu, tạo nên món quà hoàn hảo không tì vết.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 4. Điểm nổi bật & 5. Cam kết -->
    <section class="py-5 bg-main text-white my-5">
      <div class="container py-4">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 pe-lg-5">
            <h2 class="display-6 font-serif text-accent mb-4">Chuẩn Mực SORA</h2>
            <div class="divider bg-accent mb-4"></div>
            <p class="fw-light mb-5" style="line-height: 1.8; color: rgba(255,255,255,0.85);">
              Vượt qua chuẩn mực thông thường, chúng tôi thiết lập nên những quy chuẩn khắt khe nhất trong cả khâu chế tác lẫn dịch vụ.
            </p>
            
            <div class="row g-4">
              <div class="col-sm-6">
                <div class="d-flex align-items-start">
                  <svg class="text-accent me-3 flex-shrink-0 mt-1" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <div>
                    <h4 class="h6 font-serif text-accent mb-1">Thủ công tinh xảo</h4>
                    <p class="small text-white-50 fw-light">Chi tiết được trau chuốt bởi bàn tay nghệ nhân.</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="d-flex align-items-start">
                  <svg class="text-accent me-3 flex-shrink-0 mt-1" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <div>
                    <h4 class="h6 font-serif text-accent mb-1">Chất liệu cao cấp</h4>
                    <p class="small text-white-50 fw-light">Tuyển chọn nghiêm ngặt từ nguồn uy tín.</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="d-flex align-items-start">
                  <svg class="text-accent me-3 flex-shrink-0 mt-1" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <div>
                    <h4 class="h6 font-serif text-accent mb-1">Cá nhân hóa</h4>
                    <p class="small text-white-50 fw-light">Lắng nghe và tạo ra dấu ấn của riêng bạn.</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="d-flex align-items-start">
                  <svg class="text-accent me-3 flex-shrink-0 mt-1" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <div>
                    <h4 class="h6 font-serif text-accent mb-1">Chăm sóc tận tâm</h4>
                    <p class="small text-white-50 fw-light">Hỗ trợ nhanh chóng, thấu hiểu khách hàng.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6">
            <div class="bg-white text-dark p-5 position-relative shadow-lg">
              <div class="position-absolute top-0 start-0 w-100 h-100 border border-accent m-2 pointer-events-none" style="transform: translate(-10px, -10px); z-index: 0;"></div>
              <div class="position-relative z-1 text-center">
                <h3 class="h4 font-serif text-main mb-4">Cam Kết Từ SORA</h3>
                <ul class="list-unstyled mb-0 text-start d-inline-block text-secondary fw-light">
                  <li class="mb-3 d-flex align-items-center">
                    <span class="bg-light-custom rounded-circle p-2 me-3 text-main">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                    Thời gian xử lý dịch vụ nhanh chóng, đúng hẹn.
                  </li>
                  <li class="mb-3 d-flex align-items-center">
                    <span class="bg-light-custom rounded-circle p-2 me-3 text-main">
                       <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </span>
                    Chính sách bảo hành minh bạch, rõ ràng.
                  </li>
                  <li class="d-flex align-items-center">
                    <span class="bg-light-custom rounded-circle p-2 me-3 text-main">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                    </span>
                    Đội ngũ hỗ trợ nhiệt tình 24/7.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Câu kết + Lời kêu gọi hành động (CTA) -->
    <section class="py-5 text-center px-3">
      <div class="container d-flex flex-column align-items-center py-4">
        <h2 class="display-6 font-serif text-main mb-4">Để Lại Dấu Ấn Của Riêng Bạn</h2>
        <p class="lead fw-light text-secondary mb-5" style="max-width: 600px;">
          Hãy kể cho chúng tôi nghe câu chuyện bạn muốn truyền tải qua trang sức. Đặt lịch tư vấn hoặc trải nghiệm dịch vụ chăm sóc đặc quyền ngay hôm nay.
        </p>
        <div class="d-flex flex-column flex-sm-row gap-3">
          <router-link 
            to="/contact" 
            class="btn btn-main btn-lg text-uppercase fw-medium px-5 py-3 rounded-0" style="letter-spacing: 0.1em;">
            Liên Hệ Tư Vấn
          </router-link>
          <router-link 
            to="/combos" 
            class="btn btn-outline-main btn-lg text-uppercase fw-medium px-5 py-3 rounded-0" style="letter-spacing: 0.1em;">
            Xem Bộ Sưu Tập
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// Giao diện tĩnh giới thiệu dịch vụ bằng Bootstrap 5
</script>

<style scoped>
/* Màu sắc thương hiệu SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.border-accent { border-color: #e7ce7d !important; }

/* Font Serif cho tiêu đề */
.font-serif {
  font-family: "Playfair Display", "Merriweather", serif;
}
.max-w-2xl { max-width: 42rem; }

/* Hero Section */
.hero-services {
  height: 50vh;
  background-color: #2c2420;
  background-image: url('https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=2000&auto=format&fit=crop'); /* Hình ảnh chế tác/dụng cụ kim hoàn */
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  background: rgba(40, 0, 10, 0.6); /* Ám đỏ đô tối */
}
.divider {
  width: 4rem;
  height: 2px;
}

/* Service Card Hover Effect */
.service-card {
  transition: all 0.4s ease;
  border-bottom: 3px solid transparent !important;
}
.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important;
  border-bottom: 3px solid #e7ce7d !important;
}
.icon-wrapper {
  transition: all 0.4s ease;
}
.service-card:hover .icon-wrapper {
  background-color: #9f273b;
  color: #fff !important;
  border-color: #9f273b !important;
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
</style>