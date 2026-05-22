<template>
  <div class="storefront-wrapper font-luxury bg-white">
    <div>
      <section class="hero-carousel position-relative">
        <div id="homeBannerCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div v-for="(banner, index) in data.banners" :key="banner.id" class="carousel-item" :class="{ active: index === 0 }">
              <img :src="getImageUrl(banner.image_desktop)" class="d-block w-100 hero-img object-fit-cover" alt="Banner" @error="handleImageError">
              <div class="carousel-overlay"></div>
              <div class="carousel-caption d-none d-md-flex flex-column justify-content-center align-items-center h-100 text-center px-5">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="divider-gold" style="width: 40px;"></span>
                  <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald">SORA Exclusive</h6>
                  <span class="divider-gold" style="width: 40px;"></span>
                </div>
                <h2 class="display-3 font-serif fw-bold text-white mb-5 shadow-text lh-sm">{{ banner.title || 'VẺ ĐẸP VĨNH CỬU' }}</h2>
                <div class="mt-2">
                  <a :href="banner.target_url || '#'" class="btn-luxury-slide btn-luxury-white rounded-pill d-inline-block position-relative text-uppercase tracking-widest fw-bold text-decoration-none px-5 py-3 border border-1 overflow-hidden font-oswald shadow-lg" style="font-size: 0.9rem;">
                    <span class="position-relative z-index-2 transition-colors duration-500">Khám Phá Cửa Hàng</span>
                    <div class="position-absolute inset-0 slide-bg transition-transform duration-500" style="transform: translateX(-101%);"></div>
                  </a>
                </div>
              </div>
            </div>
            <div v-if="data.banners.length === 0" class="carousel-item active bg-dark d-flex align-items-center justify-content-center" style="height: 80vh;">
              <h2 class="text-gold font-serif tracking-widest display-4">SORA JEWELRY</h2>
            </div>
          </div>
          <button class="carousel-control-prev w-auto px-4" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="prev">
            <div class="nav-icon-wrapper rounded-circle d-flex justify-content-center align-items-center transition-all">
              <i class="bi bi-chevron-left fs-2 text-white fw-light"></i>
            </div>
          </button>
          <button class="carousel-control-next w-auto px-4" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="next">
            <div class="nav-icon-wrapper rounded-circle d-flex justify-content-center align-items-center transition-all">
              <i class="bi bi-chevron-right fs-2 text-white fw-light"></i>
            </div>
          </button>
        </div>
      </section>

      <section class="coupons-section py-5 position-relative bg-white" v-if="data.coupons.length > 0">
        <div class="container py-5 position-relative z-index-2">
          <div class="text-center mb-5">
            <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
              <span class="divider-gold" style="width: 30px;"></span>
              <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Đặc Quyền Mua Sắm</h6>
              <span class="divider-gold" style="width: 30px;"></span>
            </div>
            <h3 class="font-serif fw-bold text-dark display-6">Món Quà Từ SORA</h3>
          </div>

          <div class="coupon-scroll-container d-flex gap-4 pb-4 px-2 justify-content-lg-center">
            <div v-for="coupon in data.coupons" :key="coupon.id" class="flex-shrink-0 position-relative transition-transform hover-translate-up" style="width: 300px;">

              <div class="d-flex flex-column h-100 position-relative overflow-hidden p-1" style="background: linear-gradient(135deg, #dfbc68 0%, #fef3ce 45%, #c59b46 100%); box-shadow: 0 15px 35px rgba(0,0,0,0.12); border-radius: 10px;">

                <div class="d-flex flex-column flex-grow-1 p-3 position-relative" style="border: 1px solid rgba(255,255,255,0.7); border-radius: 8px;">

                  <i class="bi bi-gem position-absolute text-white opacity-50" style="font-size: 10rem; right: -20px; top: -20px; z-index: 0; pointer-events: none; transform: rotate(15deg);"></i>

                  <div class="position-relative z-index-1 text-center mb-3">
                    <h5 class="fw-bold text-dark font-serif tracking-widest text-uppercase mb-2" style="font-size: 1.25rem;">{{ coupon.code }}</h5>
                    <div class="mx-auto mb-2" style="height: 2px; width: 40px; background-color: rgba(0,0,0,0.15);"></div>

                    <div class="d-flex justify-content-center align-items-start" style="color: #9f273b; text-shadow: 1px 1px 0px rgba(255,255,255,0.8);">
                      <span class="fw-bold font-serif lh-1" style="font-size: 3.5rem;">{{ coupon.discount_type === 'percent' ? coupon.discount_value : formatShortCurrency(coupon.discount_value) }}</span>
                      <span class="fw-bold ms-1 mt-2 fs-4 font-serif">{{ coupon.discount_type === 'percent' ? '%' : '₫' }}</span>
                    </div>
                  </div>

                  <div class="position-relative z-index-1 text-center mt-auto">
                    <p class="text-dark fst-italic font-serif mb-3 fw-medium" style="font-size: 0.9rem;">
                      Áp dụng cho đơn từ {{ formatCurrency(coupon.min_order_value) }}
                    </p>

                    <button @click="saveCoupon(coupon.code)" class="btn w-100 py-2 fw-bold tracking-widest text-uppercase font-oswald shadow-sm d-flex justify-content-center align-items-center gap-2 transition-all hover-translate-up" style="background-color: #9f273b; color: #fef3ce; border: 2px solid #7a1d2d; border-radius: 6px; font-size: 0.85rem;">
                      <i class="bi bi-bookmark-star-fill fs-6"></i>
                      LƯU MÃ NGAY
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="categories-section py-5 bg-white">
        <div class="container py-4 text-center">
          <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
            <span class="divider-gold" style="width: 30px;"></span>
            <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Lựa Chọn Di Sản</h6>
            <span class="divider-gold" style="width: 30px;"></span>
          </div>
          <h3 class="font-serif fw-bold text-dark mb-5 display-6">Danh Mục Trang Sức</h3>
          
          <div class="row g-4 justify-content-center">
            <div v-for="cat in data.categories" :key="cat.id" class="col-6 col-md-4 col-lg-2">
              <router-link :to="`/category/${cat.id}`" class="text-decoration-none group d-block">
                <div class="position-relative mx-auto mb-3 category-img-box">
                  <div class="position-absolute inset-0 rounded-circle border border-1 border-gold opacity-0 group-hover-opacity-100 transition-all duration-700 z-index-2 m-2"></div>
                  <div class="ratio ratio-1x1 overflow-hidden bg-light rounded-circle shadow-sm group-hover-shadow transition-all duration-500">
                    <img :src="getImageUrl(cat.image)" class="object-fit-cover gentle-zoom filter-brightness" alt="Category" @error="handleImageError">
                  </div>
                </div>
                <h6 class="text-dark font-serif fw-bold group-hover-text-primary transition-colors fs-5 mt-4">{{ cat.name }}</h6>
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="brand-story-section py-6 position-relative bg-white overflow-hidden" style="padding-top: 6rem; padding-bottom: 6rem;">
        <div class="position-absolute font-serif fst-italic" style="font-size: clamp(15rem, 25vw, 30rem); top: -5%; left: -2%; z-index: 0; line-height: 1; user-select: none; color: #f5f5f5;">S</div>
        <div class="position-absolute font-serif fst-italic" style="font-size: clamp(15rem, 25vw, 30rem); bottom: -10%; right: -2%; z-index: 0; line-height: 1; user-select: none; color: #f5f5f5;">R</div>
        <div class="container position-relative z-index-2">
          <div class="row align-items-center g-0">
            <div class="col-lg-6 position-relative mb-5 mb-lg-0 pe-lg-5">
              <div class="story-image-wrapper position-relative mx-auto ms-lg-0" style="max-width: 500px;">
                <div class="position-absolute border border-1 border-gold rounded-4" style="top: -20px; left: -20px; right: 20px; bottom: 20px; z-index: 1;"></div>
                <div class="position-relative z-index-2 overflow-hidden bg-light shadow-lg rounded-4">
                  <img src="https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=1000&auto=format&fit=crop" class="w-100 object-fit-cover transition-transform duration-700 story-img-hover" style="height: 600px; filter: contrast(1.05) saturate(1.1);" alt="SORA Craftsmanship" loading="lazy">
                </div>
                <div class="position-absolute bg-white p-2 shadow-lg z-index-3 d-none d-md-block rounded-3" style="bottom: -40px; right: -40px; width: 220px;">
                  <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=400&auto=format&fit=crop" class="w-100 object-fit-cover rounded-2" style="height: 250px;" alt="SORA Details" loading="lazy">
                </div>
              </div>
            </div>

            <div class="col-lg-6 ps-lg-5 mt-5 mt-lg-0 text-center text-lg-start">
              <div class="ps-xl-4">
                <div class="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 mb-3">
                  <span class="divider-gold" style="width: 30px;"></span>
                  <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Nghệ Thuật Chế Tác</h6>
                </div>
                <h2 class="font-serif fw-bold text-dark display-4 mb-4 lh-sm">
                  Tinh Hoa Hội Tụ<br>
                  <span class="text-primary-luxury fst-italic">Trong Từng Giọt Vàng</span>
                </h2>
                <p class="text-muted fw-light mb-4 lh-lg" style="font-size: 1.15rem; max-width: 500px; margin-left: auto; margin-right: auto; margin-left: lg-0;">
                  Tại SORA, mỗi món trang sức không đơn thuần là vật điểm xuyết, mà là một di sản mang đậm dấu ấn cá nhân. Bằng đôi bàn tay tài hoa và khối óc tinh tế của những nghệ nhân kim hoàn bậc thầy, chúng tôi gọt giũa những viên đá thô ráp thành biểu tượng của sự sang trọng, quyền quý và vẻ đẹp vượt thời gian.
                </p>
                <p class="text-dark fw-medium font-serif fst-italic mb-5" style="font-size: 1.2rem;">
                  "Trang sức SORA - Nơi khoảnh khắc hóa vĩnh cửu."
                </p>
                <router-link to="/about" class="btn-luxury-slide btn-luxury-primary rounded-pill d-inline-block position-relative text-uppercase tracking-widest fw-bold text-decoration-none px-5 py-3 border border-1 overflow-hidden font-oswald shadow-sm" style="font-size: 0.9rem;">
                  <span class="position-relative z-index-2 transition-colors duration-500">Khám Phá Di Sản</span>
                  <div class="position-absolute inset-0 slide-bg transition-transform duration-500" style="transform: translateX(-101%);"></div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="products-section py-5 my-3 container bg-white">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-5 pb-3 border-bottom border-secondary border-opacity-10 gap-3">
          <div class="text-center text-md-start">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
              <span class="divider-gold d-md-none" style="width: 20px;"></span>
              <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Xu Hướng</h6>
              <span class="divider-gold d-md-none" style="width: 20px;"></span>
            </div>
            <h3 class="font-serif fw-bold text-dark mb-0 display-6">Tuyệt Tác Mới Nhất</h3>
          </div>
          <router-link to="/shop" class="btn-luxury-slide btn-luxury-primary rounded-pill d-inline-block position-relative text-uppercase tracking-widest fw-bold text-decoration-none px-4 py-2 border border-1 overflow-hidden font-oswald shadow-sm" style="font-size: 0.8rem;">
            <span class="position-relative z-index-2 transition-colors duration-500">Xem Bộ Sưu Tập</span>
            <div class="position-absolute inset-0 slide-bg transition-transform duration-500" style="transform: translateX(-101%);"></div>
          </router-link>
        </div>

        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          <div class="col" v-for="product in data.products" :key="product.id">
            <ProductCard
              :product="product"
              :is-in-wishlist="isInWishlist(product.id)"
              :is-in-compare="isInCompare(product.id)"
              @toggle-wishlist="toggleWishlist"
              @toggle-compare="handleToggleCompare"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </div>
      </section>

      <section class="combo-section py-5 overflow-hidden" style="background-color: #faf8f5;" v-if="data.combos && data.combos.length > 0">
        <div class="container text-center mb-4">
          <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
            <span class="divider-gold" style="width: 30px;"></span>
            <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Đồng Điệu</h6>
            <span class="divider-gold" style="width: 30px;"></span>
          </div>
          <h3 class="font-serif fw-bold text-dark display-6 mb-0">Bộ Sưu Tập Giới Hạn</h3>
        </div>

        <div class="container-fluid px-0 pb-2 position-relative">
          <swiper
            :key="data.combos.length"
            :modules="swiperModules"
            :grabCursor="true"
            :centeredSlides="true"
            slidesPerView="auto"
            :breakpoints="{
              '320': { spaceBetween: -30 },
              '768': { spaceBetween: -80 },
              '1024': { spaceBetween: -120 }
            }"
            :loop="false"
            :speed="800"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            @swiper="onComboSwiperInit"
            @slideChange="onComboSlideChange"
            class="combo-swiper-luxury"
          >
            <swiper-slide v-for="combo in data.combos" :key="combo.id" class="combo-slide-luxury">
              <div class="luxury-horizontal-card bg-white d-flex flex-column flex-md-row align-items-center p-4 p-lg-5 mx-auto border-0 rounded-4">
                <div class="combo-img-wrapper position-relative flex-shrink-0 mb-4 mb-md-0 mx-auto" style="width: 100%; max-width: 320px;">
                  <div class="position-absolute bg-secondary bg-opacity-10 d-none d-md-block rounded-circle" style="top: 20px; bottom: -20px; left: -20px; right: 20px; z-index: 0;"></div>
                  <router-link :to="'/combos/' + combo.slug" class="d-block position-relative z-index-1 shadow-sm bg-white rounded-circle overflow-hidden" style="aspect-ratio: 1/1; padding: 12px;">
                    <img :src="getImageUrl(combo.thumbnail_image || combo.image)" class="w-100 h-100 object-fit-cover rounded-circle" alt="Combo SORA" @error="handleImageError">
                  </router-link>
                </div>

                <div class="combo-content-container flex-grow-1 ps-md-5 ms-md-3 text-start text-center text-md-start">
                  <span class="text-gold tracking-widest text-uppercase mb-2 fw-bold font-oswald d-block" style="font-size: 0.75rem;">Sora Collection</span>
                  <router-link :to="'/combos/' + combo.slug" class="text-decoration-none">
                    <h3 class="font-serif fw-bold text-dark mb-3 hover-text-primary transition-colors fs-2">{{ combo.name }}</h3>
                  </router-link>
                  <div class="divider-gold mb-4 mx-auto mx-md-0" style="width: 40px; height: 2px;"></div>
                  <p class="text-muted fw-light mb-4 text-truncate-3" style="font-size: 1.05rem; line-height: 1.7;">
                    {{ combo.description || 'Sự kết hợp hoàn mỹ giữa nghệ thuật chế tác kim hoàn đỉnh cao và vẻ đẹp vượt thời gian.' }}
                  </p>

                  <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4">
                    <span class="text-primary-luxury fw-bold fs-3 font-serif">{{ formatCurrency(combo.promotional_price || combo.price) }}</span>
                    <span v-if="combo.base_price || combo.old_price" class="text-muted text-decoration-line-through small fw-light font-serif">{{ formatCurrency(combo.base_price || combo.old_price) }}</span>
                  </div>
                  
                  <router-link :to="'/combos/' + combo.slug" class="btn-luxury-slide btn-luxury-primary rounded-pill d-inline-block position-relative text-uppercase tracking-widest fw-bold text-decoration-none px-5 py-3 border border-1 overflow-hidden font-oswald shadow-sm" style="font-size: 0.85rem;">
                    <span class="position-relative z-index-2 transition-colors duration-500">Khám Phá Ngay</span>
                    <div class="position-absolute inset-0 slide-bg transition-transform duration-500" style="transform: translateX(-101%);"></div>
                  </router-link>
                </div>
              </div>
            </swiper-slide>
          </swiper>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-2 pb-2">
            <button @click="prevCombo" :disabled="isComboBeginning" class="btn bg-white rounded-circle shadow-sm border border-light-subtle d-flex justify-content-center align-items-center custom-nav-btn" style="width: 48px; height: 48px;">
              <i class="bi bi-chevron-left fs-5 fw-light"></i>
            </button>
            <button @click="nextCombo" :disabled="isComboEnd" class="btn bg-white rounded-circle shadow-sm border border-light-subtle d-flex justify-content-center align-items-center custom-nav-btn" style="width: 48px; height: 48px;">
              <i class="bi bi-chevron-right fs-5 fw-light"></i>
            </button>
          </div>
        </div>
      </section>

      <section class="gallery-section py-5 mt-3 mb-4">
        <div class="container text-center mb-5">
          <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
            <span class="divider-gold" style="width: 30px;"></span>
            <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Khoảnh Khắc SORA</h6>
            <span class="divider-gold" style="width: 30px;"></span>
          </div>
          <h2 class="font-serif fw-bold text-dark display-5 mb-3">Chân Dung Khách Hàng</h2>
          <p class="text-muted fw-light mx-auto" style="max-width: 600px; font-size: 1.05rem; line-height: 1.6;">
            Khoảnh khắc rạng ngời của những vị khách quý. SORA tự hào là mảnh ghép hoàn hảo tôn vinh vẻ đẹp độc bản của bạn.
          </p>
        </div>

        <div class="container-fluid px-0 overflow-hidden">
          <div class="sora-marquee-wrapper">
            <div class="sora-marquee-track py-3">
              <div v-for="groupIndex in 2" :key="'group-' + groupIndex" class="sora-marquee-group">
                <div v-for="(img, index) in displayGalleries" :key="'g' + groupIndex + '-' + index" class="gallery-slide-item px-2">
                  <div class="gallery-img-wrapper position-relative group cursor-pointer bg-light border border-white rounded-4 shadow-sm" style="border-width: 4px !important;">
                     <img :src="img.image_path ? getImageUrl(img.image_path) : img" class="w-100 object-fit-cover" alt="Sora Customer" @error="handleImageError">
                     <div class="gallery-overlay position-absolute inset-0 d-flex justify-content-center align-items-center opacity-0 transition-all duration-500 z-index-2">
                        <i class="bi bi-instagram text-white fs-1 fw-light"></i>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="blog-section py-5" style="background-color: #faf8f5;">
        <div class="container py-4">
          <div class="text-center mb-5">
            <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
              <span class="divider-gold" style="width: 30px;"></span>
              <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.85rem;">Cẩm Nang</h6>
              <span class="divider-gold" style="width: 30px;"></span>
            </div>
            <h3 class="font-serif fw-bold text-dark mb-0 display-6">Kiến Thức Trang Sức</h3>
          </div>
          
          <div class="row g-4" v-if="data.news && data.news.length > 0">
            <div class="col-md-4" v-for="article in data.news.slice(0, 3)" :key="article.id">
              <NewsPostCard :post="article" />
            </div>
          </div>
          <div v-else class="text-center text-muted fst-italic font-serif">
            Chưa có bài viết nào được xuất bản.
          </div>
        </div>
      </section>

      <section class="membership-banner py-6 position-relative" style="background-color: #111;">
        <div class="position-absolute inset-0 opacity-25" style="background: radial-gradient(circle at 50% 0%, rgba(159, 39, 59, 0.8) 0%, rgba(17, 17, 17, 1) 70%);"></div>
        
        <div class="container position-relative z-index-2 py-5 text-center">
          <div class="d-inline-flex justify-content-center align-items-center rounded-circle border border-gold border-opacity-25 mb-4" style="width: 80px; height: 80px;">
            <i class="bi bi-gem text-gold display-6"></i>
          </div>
          
          <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
            <span class="divider-gold" style="width: 40px; background-color: rgba(231, 206, 125, 0.3);"></span>
            <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-0 font-oswald" style="font-size: 0.9rem;">SORA Privilege Club</h6>
            <span class="divider-gold" style="width: 40px; background-color: rgba(231, 206, 125, 0.3);"></span>
          </div>
          
          <h2 class="font-serif fw-bold text-white display-5 mb-4">Đặc Quyền Hội Viên</h2>
          <p class="fw-light text-white opacity-75 mx-auto mb-5" style="max-width: 600px; font-size: 1.1rem;">Đăng ký thành viên để tận hưởng đặc quyền chăm sóc trang sức trọn đời và chiết khấu VIP dành riêng cho bạn.</p>
          
          <div class="row justify-content-center g-4 mb-5">
            <div class="col-md-3" v-for="tier in data.tiers" :key="tier.id">
              <div class="p-4 border bg-dark h-100 shadow-lg transition-transform hover-translate-up position-relative overflow-hidden group rounded-4" style="border-color: rgba(231, 206, 125, 0.3) !important;">
                <div class="position-absolute inset-0 bg-gold opacity-0 group-hover-opacity-10 transition-colors duration-500"></div>
                <h5 class="text-gold font-serif fw-bold display-6 mb-3 position-relative z-index-2">{{ tier.name }}</h5>
                <div class="divider-gold mx-auto mb-4 position-relative z-index-2" style="width: 30px; height: 1px;"></div>
                <ul class="list-unstyled text-center small mb-0 text-white opacity-75 lh-lg position-relative z-index-2 font-luxury">
                  <li>Chiết khấu đặc quyền {{ tier.discount_percent }}%</li>
                  <li>{{ tier.yearly_service_quota }} lần Spa miễn phí/năm</li>
                  <li>Ưu tiên nhận BST mới</li>
                </ul>
              </div>
            </div>
          </div>
          
          <router-link to="/register" class="btn-luxury-slide btn-luxury-gold rounded-pill d-inline-block position-relative text-uppercase tracking-widest fw-bold text-decoration-none px-5 py-3 border border-1 overflow-hidden font-oswald shadow-lg" style="font-size: 0.9rem;">
            <span class="position-relative z-index-2 transition-colors duration-500">Tạo Tài Khoản Ngay</span>
            <div class="position-absolute inset-0 slide-bg transition-transform duration-500" style="transform: translateX(-101%);"></div>
          </router-link>
        </div>
      </section>

      <CompareModal 
        ref="compareModalRef" 
        shop-slug="sora" 
        @update-list="compareList = $event" 
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import Toast from '@/utils/toastConfig';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';
import NewsPostCard from '@/components/ui/NewsPostCard.vue';

const swiperModules = [Pagination, Navigation, Autoplay];
const isLoading = ref(true);
const router = useRouter();

const comboSwiperRef = ref(null);
const isComboBeginning = ref(true);
const isComboEnd = ref(false);

const onComboSwiperInit = (swiper) => {
  comboSwiperRef.value = swiper;
  isComboBeginning.value = swiper.isBeginning;
  isComboEnd.value = swiper.isEnd;
};

const onComboSlideChange = (swiper) => {
  isComboBeginning.value = swiper.isBeginning;
  isComboEnd.value = swiper.isEnd;
};

const nextCombo = () => {
  if (comboSwiperRef.value) comboSwiperRef.value.slideNext();
};

const prevCombo = () => {
  if (comboSwiperRef.value) comboSwiperRef.value.slidePrev();
};

const wishlistIds = ref([]);
const compareModalRef = ref(null);
const compareList = ref([]);

const data = reactive({
  banners: [],
  coupons: [],
  categories: [],
  products: [],
  combos: [],
  tiers: [],
  galleries: [],
  news: [] 
});

const dummyGalleries = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600'
];

const displayGalleries = computed(() => {
  let baseArray = (data.galleries && data.galleries.length > 0) ? data.galleries : dummyGalleries;
  let arr = [...baseArray];
  while (arr.length < 10) {
    arr = [...arr, ...baseArray];
  }
  return arr;
});

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
const soraPlaceholder = '/Sora-placeholder.png';

const getImageUrl = (path) => {
  if (!path) return soraPlaceholder;
  if (path.startsWith('http')) return path;
  let cleanPath = path.replace(/^\/+/, '').replace(/^public\//, '').replace(/^storage\//, '').replace(/^\/+/, '');        
  return `${API_BASE}/storage/${cleanPath}`;
};

const handleImageError = (e) => { 
  e.target.onerror = null; 
  e.target.src = soraPlaceholder; 
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const formatShortCurrency = (value) => {
  if (value >= 1000000) return (value / 1000000) + 'Tr';
  if (value >= 1000) return (value / 1000) + 'K';
  return value;
};

const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('userToken') || localStorage.getItem('user_token') || null;
};

const isInCompare = (id) => compareList.value.some(item => item.id === id);
const handleToggleCompare = (prod) => { if (compareModalRef.value) compareModalRef.value.toggleCompare(prod); };
const handleAddToCart = (product) => { if (product?.slug) router.push({ name: 'productDetail', params: { shop_slug: product.category?.slug || 'all', slug: product.slug } }); };
const isInWishlist = (productId) => wishlistIds.value.includes(productId);

const showWishlistNotification = (isAdded) => {
  Toast.fire({
    icon: isAdded ? 'success' : 'info',
    title: isAdded ? 'Đã thêm vào danh sách yêu thích!' : 'Đã bỏ khỏi danh sách yêu thích'
  });
  localStorage.setItem('sora_wishlist', JSON.stringify(wishlistIds.value));
};

const loadWishlist = async () => {
  const token = getToken();
  if (!token) {
    const stored = localStorage.getItem('sora_wishlist');
    if (stored) wishlistIds.value = JSON.parse(stored);
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/api/client/favourites`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const result = await response.json();
    if (response.ok && result.status && Array.isArray(result.data)) {
      wishlistIds.value = result.data.map((item) => item.product?.id).filter(Boolean);
      localStorage.setItem('sora_wishlist', JSON.stringify(wishlistIds.value));
    } else {
      const stored = localStorage.getItem('sora_wishlist');
      if (stored) wishlistIds.value = JSON.parse(stored);
    }
  } catch (error) {
    const stored = localStorage.getItem('sora_wishlist');
    if (stored) wishlistIds.value = JSON.parse(stored);
  }
};

const toggleWishlist = async (product) => {
  const token = getToken();
  if (!token) {
    const index = wishlistIds.value.indexOf(product.id);
    const isAdding = index === -1;
    if (isAdding) wishlistIds.value.push(product.id);
    else wishlistIds.value.splice(index, 1);
    showWishlistNotification(isAdding);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/client/favourites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: product.id })
    });
    const result = await response.json();
    if (!response.ok || !result.status) throw new Error(result.message || 'Không thể cập nhật yêu thích.');

    const isAdded = result.action === 'added';
    if (isAdded && !wishlistIds.value.includes(product.id)) {
      wishlistIds.value.push(product.id);
    } else if (!isAdded) {
      wishlistIds.value = wishlistIds.value.filter((id) => id !== product.id);
    }
    showWishlistNotification(isAdded);
  } catch (error) {
    if (error?.response?.status === 401) {
      Swal.fire({ icon: 'warning', title: 'Vui lòng đăng nhập để sử dụng chức năng yêu thích', confirmButtonColor: '#9f273b' });
      return;
    }
    Swal.fire({ icon: 'error', title: 'Không thể cập nhật yêu thích', text: error.message || 'Xin thử lại sau.' });
  }
};

const fetchHomepageData = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/client/home-data`, { headers: { 'Accept': 'application/json' } });
    const result = await response.json();
    if (result.success) {
      data.banners = result.data.banners || [];
      data.coupons = result.data.coupons || [];
      data.categories = result.data.categories || [];
      data.products = result.data.products || [];
      data.combos = result.data.combos || [];
      data.tiers = result.data.tiers || [];
      if(result.data.galleries) data.galleries = result.data.galleries;
      data.news = result.data.news || [];
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

const saveCoupon = (code) => {
  Toast.fire({ 
    icon: 'success', 
    title: 'Lưu mã thành công!',
    text: `Mã ${code} đã được thêm vào ví voucher của bạn.`
  });
};

onMounted(() => {
  fetchHomepageData();
  loadWishlist(); 
});
</script>

<style>
:root {
  --color-primary: #9f273b; 
  --color-gold: #e7ce7d;    
  --color-accent: #cc1e2e;  
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Oswald:wght@400;500;600;700&display=swap');

.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }

.tracking-widest { letter-spacing: 0.15em; }
.text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.text-truncate-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.z-index-1 { z-index: 1; }
.z-index-2 { z-index: 2; }
.z-index-3 { z-index: 3; }
.z-index-max { z-index: 9999; }
.inset-0 { inset: 0; }
.cursor-pointer { cursor: pointer; }

.text-gold { color: #e7ce7d !important; }
.text-primary-luxury { color: #9f273b !important; }
.bg-primary-luxury { background-color: #9f273b !important; }
.border-gold { border-color: #e7ce7d !important; }
.divider-gold { height: 1px; background-color: #e7ce7d; display: inline-block; }

/* LUXURY SLIDE BUTTONS */
.btn-luxury-slide { background-color: transparent; }
.btn-luxury-slide:hover .slide-bg { transform: translateX(0) !important; }
.slide-bg { z-index: 1; }

.btn-luxury-primary { border-color: #9f273b; color: #9f273b; }
.btn-luxury-primary .slide-bg { background-color: #9f273b; }
.btn-luxury-primary:hover span { color: #fff !important; }

.btn-luxury-white { border-color: #fff; color: #fff; }
.btn-luxury-white .slide-bg { background-color: #fff; }
.btn-luxury-white:hover span { color: #000 !important; }

.btn-luxury-gold { border-color: #e7ce7d; color: #e7ce7d; }
.btn-luxury-gold .slide-bg { background-color: #e7ce7d; }
.btn-luxury-gold:hover span { color: #111 !important; }

/* UTILITIES */
.hero-carousel { height: 85vh; min-height: 600px; background: #111; }
.hero-img { height: 85vh; min-height: 600px; opacity: 0.6; }
.carousel-overlay { position: absolute; inset: 0; background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); }
.shadow-text { text-shadow: 2px 2px 8px rgba(0,0,0,0.7); }
.nav-icon-wrapper { width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); }
.nav-icon-wrapper:hover { background: #e7ce7d; border-color: #e7ce7d; }
.nav-icon-wrapper:hover i { color: #111 !important; }

/* VIP TICKET COUPONS */
.coupon-scroll-container { overflow-x: auto; scrollbar-width: none; }
.coupon-scroll-container::-webkit-scrollbar { display: none; }
.vip-ticket-card { border: 1px solid rgba(231, 206, 125, 0.4) !important; }
.ticket-cutout { position: absolute; width: 24px; height: 24px; background-color: #faf8f5; border-radius: 50%; right: -12px; z-index: 4; border: 1px solid rgba(231, 206, 125, 0.4); }
.ticket-cutout.top { top: -12px; border-bottom-color: transparent; border-right-color: transparent; transform: rotate(-45deg); }
.ticket-cutout.bottom { bottom: -12px; border-top-color: transparent; border-right-color: transparent; transform: rotate(45deg); }
.group-hover-target:hover .underline-hover { width: 100% !important; }
.underline-base { border-color: rgba(159, 39, 59, 0.2) !important; }

/* CATEGORY GENTLE ZOOM */
.category-img-box { max-width: 85%; }
.gentle-zoom { transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1) !important; }
.group:hover .gentle-zoom { transform: scale(1.05) !important; }

.group:hover .group-hover-scale { transform: scale(1.08); }
.group:hover .group-hover-text-primary { color: #9f273b !important; }
.group:hover .group-hover-opacity-100 { opacity: 1 !important; }
.group-hover-opacity-10 { opacity: 0.1 !important; }
.group:hover .group-hover-opacity-10 { opacity: 0.1 !important; }
.group-hover-shadow { transition: box-shadow 0.5s ease; }
.group:hover .group-hover-shadow { box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }

.transition-colors { transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, width 0.5s ease; }
.transition-transform { transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.transition-all { transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.hover-translate-up:hover { transform: translateY(-8px); }
.filter-brightness { filter: brightness(0.95); transition: filter 0.5s; }
.group:hover .filter-brightness { filter: brightness(1); }
.hover-text-gold:hover { color: #e7ce7d !important; border-color: #e7ce7d !important; }

/* BRAND STORY */
.story-image-wrapper { perspective: 1000px; }
.story-img-hover:hover { transform: scale(1.05); }

/* COMBO SWIPER */
.combo-swiper-luxury { padding: 40px 0 60px 0; overflow: hidden; } 
.combo-slide-luxury { width: 90%; max-width: 850px; transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1); opacity: 0.4; transform: scale(0.85); z-index: 1; position: relative; }
.combo-slide-luxury.swiper-slide-active { opacity: 1; transform: scale(1); z-index: 10; }
.combo-slide-luxury.swiper-slide-prev, .combo-slide-luxury.swiper-slide-next { z-index: 5; }
.luxury-horizontal-card { box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.combo-slide-luxury.swiper-slide-active .luxury-horizontal-card { box-shadow: 0 25px 50px rgba(0,0,0,0.08) !important; }

.custom-nav-btn { color: #333; transition: all 0.3s ease; }
.custom-nav-btn:hover:not(:disabled) { background-color: var(--color-primary) !important; color: white !important; border-color: var(--color-primary) !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159, 39, 59, 0.2) !important; }
.custom-nav-btn:disabled { opacity: 0.35 !important; cursor: not-allowed; background-color: #f8f9fa !important; border-color: #dee2e6 !important; color: #adb5bd !important; box-shadow: none !important; }

/* GALLERY MARQUEE */
.sora-marquee-wrapper { display: flex; overflow: hidden; width: 100%; }
.sora-marquee-track { display: flex; width: max-content; animation: soraMarquee 30s linear infinite; }
.sora-marquee-track:hover { animation-play-state: paused; }
.sora-marquee-group { display: flex; align-items: center; flex-shrink: 0; }
.gallery-slide-item { width: 50vw; flex-shrink: 0; padding: 0; }
@media (min-width: 576px) { .gallery-slide-item { width: 33.333vw; } }
@media (min-width: 768px) { .gallery-slide-item { width: 25vw; } }
@media (min-width: 1024px) { .gallery-slide-item { width: 20vw; } }
@media (min-width: 1400px) { .gallery-slide-item { width: 16.666vw; } }

@keyframes soraMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.gallery-img-wrapper { width: 100%; overflow: hidden; }
.gallery-slide-item:nth-child(odd) .gallery-img-wrapper { height: 320px; }
.gallery-slide-item:nth-child(even) .gallery-img-wrapper { height: 450px; }
.gallery-img-wrapper img { height: 100%; transition: transform 0.8s ease; }
.gallery-img-wrapper:hover img { transform: scale(1.08); }
.gallery-overlay { background: rgba(159, 39, 59, 0.6); }
.gallery-img-wrapper:hover .gallery-overlay { opacity: 1 !important; }

@media (max-width: 768px) {
  .gallery-slide-item:nth-child(odd) .gallery-img-wrapper { height: 220px; }
  .gallery-slide-item:nth-child(even) .gallery-img-wrapper { height: 300px; }
}
</style>