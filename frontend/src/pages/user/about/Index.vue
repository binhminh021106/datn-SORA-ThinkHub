<template>
  <div class="about-page font-sans">
    
    <!-- 1. Tiêu đề chính (Hero Section) -->
    <section class="hero-section position-relative d-flex align-items-center justify-content-center text-center">
      <div class="hero-overlay position-absolute w-100 h-100"></div>
      <div class="position-relative z-1 d-flex flex-column align-items-center px-3">
        <span class="text-accent text-uppercase fw-bold mb-3 tracking-wide" style="font-size: 0.85rem; letter-spacing: 0.3em;">Câu chuyện thương hiệu</span>
        <h1 class="display-1 fw-bold text-accent font-serif mb-4" style="letter-spacing: 0.1em;">SORA</h1>
        <p class="h4 fw-light fst-italic text-white max-w-2xl">
          "Tuyệt tác trang sức – Nơi khí chất độc bản được tôn vinh."
        </p>
      </div>
    </section>

    <!-- 2. Đoạn giới thiệu ngắn & 3. Câu chuyện thương hiệu -->
    <section class="py-5 mt-4">
      <div class="container">
        <div class="row align-items-center gx-5">
          <div class="col-md-6 order-2 order-md-1 mt-4 mt-md-0">
            <div class="position-relative overflow-hidden img-wrapper">
              <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop" alt="" class="img-fluid w-100 object-fit-cover shadow-sm transition-transform custom-img-portrait" />
              <div class="img-border position-absolute"></div>
            </div>
          </div>
          <div class="col-md-6 order-1 order-md-2">
            <div class="mb-5">
              <h2 class="display-6 font-serif text-main mb-3">Khởi Nguồn Khí Chất</h2>
              <div class="divider bg-accent mb-4"></div>
              <p class="lead fw-light text-secondary" style="line-height: 1.8;">
                SORA không chỉ là trang sức, SORA là tuyên ngôn của sự tinh tế. Ra đời với mong muốn mang đến những món phụ kiện vượt qua giá trị vật chất thông thường, chúng tôi chế tác nên những mảnh ghép phản chiếu tâm hồn và cá tính riêng biệt của thế hệ trẻ hiện đại.
              </p>
            </div>
            <div>
              <h3 class="h4 font-serif text-dark mb-3">Câu Chuyện Của SORA</h3>
              <p class="fw-light text-secondary" style="line-height: 1.8;">
                Lấy cảm hứng từ từ "Sora" (Bầu trời) trong tiếng Nhật – biểu tượng của sự tự do, vô hạn và thuần khiết. Mỗi thiết kế của SORA bắt đầu từ những nét phác thảo đầy đam mê, đi qua đôi bàn tay tài hoa của các nghệ nhân kim hoàn, để trở thành một tác phẩm nghệ thuật thu nhỏ. Chúng tôi tin rằng, trang sức cao cấp không cần phải quá phô trương, sự sang trọng thực sự nằm ở sự tối giản, tỉ mỉ và một câu chuyện có chiều sâu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Sứ mệnh & 5. Tầm nhìn -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card h-100 border-light shadow-sm card-hover p-4 p-md-5 position-relative overflow-hidden">
              <div class="card-indicator bg-main position-absolute top-0 start-0 h-100"></div>
              <div class="card-body">
                <h3 class="text-main text-uppercase fw-bold mb-3" style="font-size: 0.85rem; letter-spacing: 0.15em;">Sứ mệnh</h3>
                <h4 class="h2 font-serif text-dark mb-4">Đánh thức vẻ đẹp tiềm ẩn</h4>
                <p class="fw-light text-secondary mb-0" style="line-height: 1.8;">
                  Trao quyền cho người trẻ tự tin thể hiện bản ngã qua từng món trang sức chế tác tinh xảo. SORA đồng hành cùng bạn trong mọi khoảnh khắc, biến những điều bình dị trở nên phi thường.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="card h-100 border-light shadow-sm card-hover p-4 p-md-5 position-relative overflow-hidden">
              <div class="card-indicator bg-accent position-absolute top-0 start-0 h-100"></div>
              <div class="card-body">
                <h3 class="text-accent text-uppercase fw-bold mb-3" style="font-size: 0.85rem; letter-spacing: 0.15em;">Tầm nhìn</h3>
                <h4 class="h2 font-serif text-dark mb-4">Biểu tượng đương đại</h4>
                <p class="fw-light text-secondary mb-0" style="line-height: 1.8;">
                  Trở thành thương hiệu trang sức cao cấp hàng đầu dành cho thế hệ Millennials và Gen Z tại Việt Nam. Định hình lại khái niệm "Luxury" – Hiện đại, Bền vững và Cầm nắm được cảm xúc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Giá trị cốt lõi -->
    <section class="py-5 bg-main text-white mt-5">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="display-5 font-serif text-accent mb-3">Giá Trị Cốt Lõi</h2>
          <div class="divider bg-accent mx-auto"></div>
        </div>
        
        <div class="row g-5 text-center">
          <div class="col-md-4">
            <div class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Chế Tác Thủ Công</h4>
            <p class="fw-light text-white-50 px-3">Mỗi sản phẩm là kết tinh từ hàng chục giờ lao động miệt mài của các nghệ nhân giàu kinh nghiệm.</p>
          </div>
          <div class="col-md-4">
            <div class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Thiết Kế Độc Bản</h4>
            <p class="fw-light text-white-50 px-3">Hướng tới phong cách Minimal tinh tế, không hòa lẫn. Tôn vinh vẻ đẹp cá nhân của người sở hữu.</p>
          </div>
          <div class="col-md-4">
            <div class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Chất Liệu Bền Vững</h4>
            <p class="fw-light text-white-50 px-3">Tuyển chọn khắt khe từ Vàng, Bạc cao cấp đến Đá quý thiên nhiên, cam kết nguồn gốc minh bạch.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Giới thiệu sản phẩm -->
    <section class="py-5 my-5">
      <div class="container">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
          <div class="max-w-xl">
            <h2 class="display-6 font-serif text-main mb-3">Tuyệt Tác Từ Vật Liệu Cao Cấp</h2>
            <p class="text-secondary fw-light mb-0">Sự kết hợp hoàn hảo giữa nét kiêu sa của đá quý và sự vĩnh cửu của kim loại quý.</p>
          </div>
          <router-link to="/products" class="d-none d-md-inline-flex align-items-center text-main text-decoration-none fw-medium mt-3 mt-md-0 product-link">
            Khám phá bộ sưu tập
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="ms-2">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>

        <div class="row g-4">
          <!-- Vàng 18k -->
          <div class="col-md-4">
            <div class="card border-0 rounded-0 overflow-hidden shadow-sm product-card">
              <div class="img-zoom-wrapper position-relative square-ratio bg-light">
                <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                <div class="product-overlay position-absolute bottom-0 w-100 p-4 text-center">
                  <h3 class="h4 font-serif text-accent mb-1">Vàng 18K / 24K</h3>
                  <p class="text-white-50 fw-light small mb-0">Sang trọng & Rạng rỡ</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Bạc Ý -->
          <div class="col-md-4">
            <div class="card border-0 rounded-0 overflow-hidden shadow-sm product-card">
              <div class="img-zoom-wrapper position-relative square-ratio bg-light">
                <img src="https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=600&auto=format&fit=crop" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                <div class="product-overlay position-absolute bottom-0 w-100 p-4 text-center">
                  <h3 class="h4 font-serif text-accent mb-1">Bạc Ý 925</h3>
                  <p class="text-white-50 fw-light small mb-0">Thanh lịch & Hiện đại</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Đá quý -->
          <div class="col-md-4">
            <div class="card border-0 rounded-0 overflow-hidden shadow-sm product-card">
              <div class="img-zoom-wrapper position-relative square-ratio bg-light">
                <img src="https://images.unsplash.com/photo-1573408301145-b98c4af01158?q=80&w=600&auto=format&fit=crop" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                <div class="product-overlay position-absolute bottom-0 w-100 p-4 text-center">
                  <h3 class="h4 font-serif text-accent mb-1">Đá Quý & Kim Cương</h3>
                  <p class="text-white-50 fw-light small mb-0">Tỏa sáng & Trường tồn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. Cam kết với khách hàng -->
    <section class="py-5" style="background-color: #f4f1ee;">
      <div class="container py-4 text-center">
        <h2 class="h2 font-serif text-main mb-5">Lời Cam Kết Của Chúng Tôi</h2>
        <div class="row g-4 text-dark">
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Bảo hành trọn đời</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Bao bì sang trọng</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
             <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Làm sạch miễn phí</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Thanh toán an toàn</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. Đoạn kết + Lời kêu gọi hành động (CTA) -->
    <section class="py-5 my-5 text-center">
      <div class="container d-flex flex-column align-items-center py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" class="text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h2 class="display-5 font-serif text-main mb-4">Sẵn Sàng Tỏa Sáng Cùng SORA?</h2>
        <p class="lead fw-light text-secondary mb-5" style="max-width: 600px;">
          Hãy để chúng tôi giúp bạn tìm thấy món trang sức thuộc về riêng bạn. Một dấu ấn thời gian, một mảnh ghép hoàn hảo cho phong cách thường nhật.
        </p>
        <router-link 
          to="/products" 
          class="btn btn-main btn-lg text-uppercase fw-medium px-5 py-3 rounded-0" style="letter-spacing: 0.1em;">
          Khám Phá SORA
        </router-link>
      </div>
    </section>

  </div>
</template>

<script setup>
// Trang giới thiệu sử dụng UI Bootstrap 5
</script>

<style scoped>
/* Màu sắc thương hiệu SORA */
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }
.border-accent { border-color: #e7ce7d !important; }

/* Font Serif cho tiêu đề */
.font-serif {
  font-family: "Playfair Display", "Merriweather", serif;
}

/* Các tiện ích tùy chỉnh */
.max-w-2xl { max-width: 42rem; margin-left: auto; margin-right: auto; }
.max-w-xl { max-width: 36rem; margin-left: auto; margin-right: auto; }
.object-fit-cover { object-fit: cover !important; }

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
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
}

/* Hero Section */
.hero-section {
  height: 60vh;
  background-color: #9f273b;
  background-image: url('https://images.unsplash.com/photo-1599643478524-fb66f4568dbb?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  background: rgba(0, 0, 0, 0.4);
}

/* Image wrapper (Border xoắn) */
.img-wrapper {
  padding: 1rem;
}
.img-wrapper img {
  position: relative;
  z-index: 2;
}
.img-border {
  top: 0; left: 0; right: 2rem; bottom: 2rem;
  border: 1px solid #e7ce7d;
  z-index: 1;
}
.custom-img-portrait {
  aspect-ratio: 4/5;
}

/* Đường kẻ ngăn cách (Divider) */
.divider {
  width: 4rem;
  height: 2px;
}

/* Card Mission & Vision */
.card-hover {
  transition: box-shadow 0.3s ease;
}
.card-hover:hover {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.card-indicator {
  width: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}
.card-hover:hover .card-indicator {
  width: 100%;
  opacity: 0.05;
}

/* Icon vòng tròn */
.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}

/* Khối sản phẩm (Fix ảnh vuông tuyệt đối) */
.square-ratio {
  width: 100%;
  padding-bottom: 100%; /* Tạo tỷ lệ vuông chuẩn 1:1 */
  display: block;
  overflow: hidden;
}
.img-zoom-wrapper img {
  transition: transform 0.7s ease;
}
.product-card:hover .img-zoom-wrapper img {
  transform: scale(1.1);
}
.product-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  z-index: 2;
}

/* Link khám phá */
.product-link:hover {
  color: #cc1e2e !important;
}
</style>