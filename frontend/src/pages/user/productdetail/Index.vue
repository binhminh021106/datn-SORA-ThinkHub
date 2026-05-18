<template>
  <div class="product-page">
    
    <!-- LOADING STATE SKELETON -->
    <div v-if="isLoading" class="container py-4 fade-in" style="max-width: 1300px; margin: 0 auto;">
       <!-- Breadcrumb Skeleton -->
       <div class="skeleton-box skeleton-text w-25 mb-4 shimmer py-2"></div>
       
       <div class="product-grid">
           <!-- Product Gallery Skeleton -->
           <div class="product-gallery">
               <div class="thumbnails-list">
                   <div v-for="i in 4" :key="i" class="skeleton-box shimmer rounded mb-2" style="width: 75px; height: 75px;"></div>
               </div>
               <div class="main-image-wrapper">
                   <div class="skeleton-box shimmer rounded w-100 h-100"></div>
               </div>
           </div>

           <!-- Product Info Skeleton -->
           <div class="product-info">
               <div class="skeleton-box skeleton-text w-25 mb-3 shimmer"></div>
               <div class="skeleton-box skeleton-title w-75 mb-4 shimmer" style="height: 36px;"></div>
               <div class="skeleton-box skeleton-title w-50 mb-4 shimmer" style="height: 30px;"></div>
               
               <div class="skeleton-box w-100 mb-4 shimmer rounded border border-light" style="height: 60px;"></div>
               
               <div class="mb-4">
                   <div class="skeleton-box skeleton-text w-25 mb-2 shimmer"></div>
                   <div class="d-flex gap-2 mb-3">
                       <div v-for="i in 4" :key="i" class="skeleton-box shimmer rounded-circle" style="width: 36px; height: 36px;"></div>
                   </div>
                   <div class="skeleton-box skeleton-text w-25 mb-2 shimmer"></div>
                   <div class="d-flex gap-2">
                       <div v-for="i in 3" :key="i" class="skeleton-box shimmer rounded" style="width: 60px; height: 36px;"></div>
                   </div>
               </div>
               
               <div class="action-area mb-4 d-flex gap-3">
                   <div class="skeleton-box shimmer rounded" style="width: 130px; height: 48px;"></div>
                   <div class="action-buttons d-flex gap-3" style="flex: 1;">
                       <div class="skeleton-box shimmer rounded" style="flex: 1; height: 48px;"></div>
                       <div class="skeleton-box shimmer rounded" style="flex: 1; height: 48px;"></div>
                   </div>
               </div>

               <div class="d-flex gap-3 mb-4">
                  <div class="skeleton-box shimmer rounded" style="flex: 1; height: 48px;"></div>
                  <div class="skeleton-box shimmer rounded-circle" style="width: 48px; height: 48px;"></div>
               </div>
               
               <div class="skeleton-box skeleton-text w-100 mb-2 shimmer mt-4"></div>
               <div class="skeleton-box skeleton-text w-100 mb-2 shimmer"></div>
               <div class="skeleton-box skeleton-text w-75 shimmer"></div>
           </div>
       </div>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else-if="product">
      <!-- Breadcrumb -->
      <div class="breadcrumb fade-in">
        <span>Trang chủ</span> <span class="separator">/</span>
        <span>Sản phẩm</span> <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </div>

      <main class="product-container fade-in">
        <div class="product-grid">
          
          <div class="product-gallery">
            <div class="thumbnails-list">
              <button 
                v-for="(img, idx) in product.images" 
                :key="idx" 
                @click="setMainImage(img)"
                class="thumb-btn"
                :class="{ 'active': img === mainImage }"
              >
                <img :src="img" :alt="'Thumbnail ' + idx" class="thumb-img">
              </button>
            </div>
            
            <!-- ẢNH CHÍNH & NÚT YÊU THÍCH NỔI -->
            <div class="main-image-wrapper position-relative">
              <button class="main-wishlist-btn" :class="{ 'active': isFavourited(product.id) }" @click.stop="toggleFavourite(product)" :title="isFavourited(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'" :disabled="isTogglingFav === product.id">
                  <span v-if="isTogglingFav === product.id" class="spinner-border spinner-border-sm text-danger" style="width: 1rem; height: 1rem;"></span>
                  <i v-else :class="isFavourited(product.id) ? 'bi bi-suit-heart-fill text-danger' : 'bi bi-suit-heart'"></i>
              </button>
              <img :src="mainImage" :alt="product.name" class="main-img" @error="handleImageError">
            </div>
          </div>

          <div class="product-info">
            
            <div class="product-brand-top">
              <span v-if="product.brand" class="brand-name" @click="goToShopWithBrand(product.brand.id)">
                {{ product.brand.name }}
              </span>
              <span v-else class="brand-name">SORA JEWELRY</span>
              <span class="sku" v-if="product.sku">SKU: {{ product.sku }}</span>
            </div>

            <h1 class="product-title">{{ product.name }}</h1>
            
            <!-- PRICE DISPLAY - giữ nguyên cấu trúc cũ -->
            <div class="product-price mb-3" style="display: flex; align-items: center; gap: 15px;">
              <template v-if="isAllAttributesSelected && currentVariant">
                <span class="price-current" style="font-size: 24px; font-weight: 700; color: rgb(159,39,59);">{{ formatMoney(currentVariant.promotional_price || currentVariant.price) }}</span>
                <span v-if="currentVariant.promotional_price" class="price-old" style="font-size: 16px; color: #999; text-decoration: line-through;">
                  {{ formatMoney(currentVariant.price) }}
                </span>
                <span v-if="currentVariant.promotional_price" class="discount-badge" style="background: #fff0f2; color: rgb(159,39,59); padding: 3px 8px; font-size: 12px; font-weight: 600; border-radius: 4px;">
                  -{{ Math.round((1 - currentVariant.promotional_price / currentVariant.price) * 100) }}%
                </span>
              </template>
              <template v-else>
                <span class="price-current" style="font-size: 24px; font-weight: 700; color: rgb(159,39,59);">{{ formatMoney(product.promotional_price || product.base_price || product.variants?.[0]?.price) }}</span>
              </template>
            </div>

            <div class="flash-sale-countdown mb-4">
              <div class="countdown-text">Nhanh lên! Chương trình khuyến mãi kết thúc sau:</div>
              <div class="countdown-timer">
                <span class="time-block">{{ countdown.days }}</span> <span class="colon">:</span>
                <span class="time-block">{{ countdown.hours }}</span> <span class="colon">:</span>
                <span class="time-block">{{ countdown.minutes }}</span> <span class="colon">:</span>
                <span class="time-block">{{ countdown.seconds }}</span>
              </div>
            </div>

            <!-- VARIANT SELECTION - giữ nguyên cấu trúc cũ -->
            <div v-if="product.attributes" class="product-variants mb-4">
              <div v-for="(options, attrName) in product.attributes" :key="attrName" class="variant-group mb-3">
                <div class="variant-label-wrapper d-flex justify-content-between align-items-center gap-2 mb-2">
                  <h3 class="variant-label mb-0" style="font-size: 16px; font-weight: 600; color: #333;">
                    {{ attrName }}
                    <span v-if="selectedAttributes[attrName]" style="color: #666; font-weight: 500; text-transform: none; font-size: 14px;">
                      : {{ getOptionName(attrName, selectedAttributes[attrName]) }}
                    </span>
                  </h3>
                  <button
                    v-if="isSizeAttribute(attrName)"
                    @click="showSizeGuideModal = true"
                    class="size-guide-btn-compact"
                    type="button"
                    title="Xem hướng dẫn kích cỡ"
                    style="background: none; border: none; color: #9f273b; font-size: 14px; cursor: pointer;"
                  >
                    <i class="bi bi-rulers"></i>
                  </button>
                </div>
                
                <!-- Color Options -->
                <div v-if="isColorAttribute(attrName)" class="variant-options color-options d-flex gap-2 flex-wrap">
                  <button 
                    v-for="option in options" 
                    :key="option.id"
                    @click="!isOptionDisabled(attrName, option.id) && selectAttribute(attrName, option.id)"
                    class="color-swatch-btn d-flex justify-content-center align-items-center"
                    :class="{ 
                      'active': selectedAttributes[attrName] === option.id,
                      'disabled': isOptionDisabled(attrName, option.id)
                    }"
                    :title="option.name"
                    :style="{ 
                      width: '36px', height: '36px', borderRadius: '50%', border: selectedAttributes[attrName] === option.id ? '2px solid #9f273b' : '1px solid #ddd',
                      backgroundColor: getColorCode(option.name),
                      opacity: isOptionDisabled(attrName, option.id) ? 0.4 : 1,
                      cursor: isOptionDisabled(attrName, option.id) ? 'not-allowed' : 'pointer'
                    }"
                    :disabled="isOptionDisabled(attrName, option.id)"
                  >
                    <i v-if="selectedAttributes[attrName] === option.id" class="bi bi-check fw-bold" :class="isLightColor(option.name) ? 'text-dark' : 'text-white'" style="font-size: 1.3rem;"></i>
                    <i v-else-if="isOptionDisabled(attrName, option.id)" class="bi bi-slash-circle text-secondary" style="font-size: 1rem;"></i>
                  </button>
                </div>
                
                <!-- Text/Size Options -->
                <div v-else class="variant-options d-flex gap-2 flex-wrap">
                  <button 
                    v-for="option in options" 
                    :key="option.id"
                    @click="!isOptionDisabled(attrName, option.id) && selectAttribute(attrName, option.id)"
                    class="variant-btn"
                    :class="{ 
                      'active': selectedAttributes[attrName] === option.id,
                      'disabled': isOptionDisabled(attrName, option.id)
                    }"
                    :disabled="isOptionDisabled(attrName, option.id)"
                    :style="{ 
                      padding: '8px 16px', border: selectedAttributes[attrName] === option.id ? '2px solid #9f273b' : '1px solid #ddd',
                      backgroundColor: selectedAttributes[attrName] === option.id ? '#fff0f2' : '#fff',
                      color: selectedAttributes[attrName] === option.id ? '#9f273b' : '#333',
                      borderRadius: '6px', fontSize: '14px', cursor: isOptionDisabled(attrName, option.id) ? 'not-allowed' : 'pointer',
                      opacity: isOptionDisabled(attrName, option.id) ? 0.4 : 1
                    }"
                  >
                    {{ option.name }}
                    <i v-if="isOptionDisabled(attrName, option.id)" class="bi bi-slash-circle ms-1" style="font-size: 0.8rem;"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- STOCK STATUS - giữ nguyên cấu trúc cũ -->
            <div class="stock-progress-wrapper mb-4">
              <template v-if="isAllAttributesSelected && currentVariant">
                <div v-if="currentStock > 0 && currentStock < 10" class="stock-alert critical" style="background: #fff0f2; border: 1px solid #f8d7da; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                  <p class="stock-text" style="color: #721c24; margin: 0; font-size: 14px;">Only <strong>{{ currentStock }}</strong> item(s) left in stock! (Chỉ còn {{ currentStock }} sản phẩm)</p>
                  <div class="progress-bar-bg" style="height: 6px; background: #f8d7da; border-radius: 3px; margin-top: 8px;">
                    <div class="progress-bar-fill red-fill" :style="{ width: stockProgressWidth + '%', height: '100%', background: '#dc3545', borderRadius: '3px' }"></div>
                  </div>
                </div>
                
                <div v-else-if="currentStock >= 10 && currentStock < 15" class="stock-alert warning" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                  <p class="stock-text" style="color: #856404; margin: 0; font-size: 14px;">Sắp hết hàng (Còn {{ currentStock }} sản phẩm)</p>
                  <div class="progress-bar-bg" style="height: 6px; background: #ffeaa7; border-radius: 3px; margin-top: 8px;">
                    <div class="progress-bar-fill orange-fill" :style="{ width: stockProgressWidth + '%', height: '100%', background: '#fd7e14', borderRadius: '3px' }"></div>
                  </div>
                </div>

                <div v-else class="stock-status-luxury" style="font-size: 14px; color: #28a745; font-weight: 500;">
                  <span :class="currentStock > 0 ? 'in-stock' : 'out-of-stock'">
                    <i class="bi" :class="currentStock > 0 ? 'bi-box-seam-fill' : 'bi-box-seam'"></i> 
                    {{ currentStock > 0 ? `Còn ${currentStock} sản phẩm` : 'Pre-Order (Đặt trước / Hết hàng)' }}
                  </span>
                </div>
              </template>
              
              <template v-else>
                <span class="text-muted fst-italic" style="font-size: 0.9rem; color: #888;">
                  <i class="bi bi-info-circle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại để xem số lượng
                </span>
              </template>
            </div>

            <div class="action-area">
              <div class="quantity-selector">
                <button class="qty-btn" @click="updateQuantity(-1)">-</button>
                <input type="number" 
                       v-model.number="selectedQuantity" 
                       @change="validateQuantity"
                       class="qty-input">
                <button class="qty-btn" @click="updateQuantity(1)">+</button>
              </div>

              <div class="action-buttons">
                <button 
                  class="btn-add-cart"
                  @click="addToCart"
                >
                  THÊM VÀO GIỎ
                </button>
                <button class="btn-consult">TƯ VẤN NGAY</button>
              </div>
            </div>

            <!-- CỤM NÚT SO SÁNH & YÊU THÍCH -->
            <div class="d-flex flex-row gap-3 mt-4 align-items-center">
              <button 
                class="btn-action-sub" 
                style="flex: 1;"
                @click="handleToggleCompare({ id: product.id, name: product.name, image: mainImage })"
                :class="{ 'active': isInCompare(product.id) }"
              >
                <i class="bi bi-arrow-left-right me-1"></i>
                {{ isInCompare(product.id) ? 'Bỏ so sánh' : 'Thêm so sánh' }}
              </button>

              <button 
                class="btn-wishlist-action" 
                @click="toggleFavourite(product)"
                :class="{ 'active': isFavourited(product.id) }"
                :title="isFavourited(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                :disabled="isTogglingFav === product.id"
              >
                <span v-if="isTogglingFav === product.id" class="spinner-border spinner-border-sm text-danger" style="width: 1.2rem; height: 1.2rem;"></span>
                <i v-else :class="isFavourited(product.id) ? 'bi bi-suit-heart-fill text-danger' : 'bi bi-suit-heart'"></i>
              </button>
            </div>

            <div class="product-short-desc mt-4">
              <p><em>(*) Giá niêm yết trên đây là <strong>GIÁ THAM KHẢO</strong> dành cho nhẫn nữ với các thông số tiêu chuẩn. Giá có thể thay đổi trên thực tế tùy thuộc vào thông số cụ thể <strong>theo ni tay và yêu cầu riêng của từng khách hàng.</strong></em></p>
              
              <div class="notes">
                <h4>GHI CHÚ</h4>
                <ul>
                  <li>Sản phẩm được bảo hành trọn đời với phiếu bảo hành đính kèm.</li>
                  <li>Nhấn nút <strong>TƯ VẤN NGAY</strong> để gặp nhân viên hỗ trợ thêm về thông tin và báo giá sản phẩm.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>

      <section class="featured-lines-section fade-in">
        <h2 class="section-title text-center font-serif text-sora-primary"><i class="bi bi-stars text-gold me-2"></i> Dòng hàng nổi bật</h2>

        <div class="featured-lines-container">
          
          <!-- Banner -->
          <div class="featured-banner">
            <img src="https://bazaarvietnam.vn/wp-content/uploads/2015/05/co-nen-cat-toc-ngan-02-lisa-blackpink-bvlgari.jpg" alt="SORA Banner">
            
            <!-- Badge khuyến mãi -->
            <div class="promo-badge bg-sora-primary shadow-sm border border-light">
              <i class="bi bi-fire me-1"></i> Giảm đến 30%
            </div>
          </div>

          <!-- Content -->
          <div class="featured-content">

            <!-- Brand filter -->
            <div class="featured-tags">
               <h1 class="font-serif text-sora-primary mb-3">SORA <i class="bi bi-brightness-high fs-4 text-gold"></i></h1>
               <div class="d-flex flex-wrap gap-2">
                  <button 
                    v-for="brand in shopBrands" 
                    :key="brand.id" 
                    class="f-tag-btn"
                    @click="goToShopWithBrand(brand.id)"
                  >
                    <i class="bi bi-gem text-sora-primary me-1"></i> {{ brand.name || 'Thương hiệu' }} 
                  </button>
               </div>
            </div>

            <!-- Nội dung -->
            <div class="featured-desc text-muted">
              <p>
                <i class="bi bi-gem text-sora-primary me-2"></i><strong>Sora – Tỏa sáng vẻ đẹp tinh tế</strong> với những thiết kế trang sức cao cấp, chế tác tỉ mỉ đến từng chi tiết.
              </p>

              <p>
                <i class="bi bi-stars text-gold me-2"></i>Từ phong cách tối giản đến sang trọng, mỗi sản phẩm là một dấu ấn riêng giúp bạn nổi bật mọi lúc.
              </p>

              <!-- Ưu đãi -->
              <div class="featured-benefits mt-4">
                <div class="benefit-item"><i class="bi bi-truck fs-2 text-sora-primary mb-2"></i><span>Miễn phí<br>vận chuyển</span></div>
                <div class="benefit-item"><i class="bi bi-box2-heart fs-2 text-sora-primary mb-2"></i><span>Tặng hộp quà<br>cao cấp</span></div>
                <div class="benefit-item"><i class="bi bi-person-vcard fs-2 text-sora-primary mb-2"></i><span>Ưu đãi<br>thành viên</span></div>
              </div>

            </div>

          </div>
        </div>
      </section>

      <!-- CÓ THỂ BẠN SẼ THÍCH SECTION -->
      <section class="recommendations-section fade-in">
        <div class="recommendations-header">
          <div class="rec-title-wrap">
            <h2 class="rec-title font-serif text-sora-primary mb-0"><i class="bi bi-bag-heart-fill text-gold me-2"></i> CÓ THỂ BẠN SẼ THÍCH</h2>
            <p class="rec-subtitle ms-4 ps-2">Khám phá thêm các sản phẩm chất lượng khác</p>
          </div>
          
          <div class="rec-controls">
            <div class="rec-tabs">
              <button :class="{ active: activeTab === 'related_category' }" @click="changeRecTab('related_category')">Cùng danh mục</button>
              <button :class="{ active: activeTab === 'new' }" @click="changeRecTab('new')">Sản phẩm mới</button>
              <button :class="{ active: activeTab === 'viewed' }" @click="changeRecTab('viewed')">Sản phẩm đã xem</button>
            </div>
            
            <div class="rec-arrows">
              <button @click="scrollRecSlider('left')" class="arrow-btn" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button @click="scrollRecSlider('right')" class="arrow-btn" aria-label="Next">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="isLoadingRecs" class="rec-loading">
          <div class="spinner small-spinner"></div>
        </div>

        <!-- LIST SẢN PHẨM GỢI Ý - SỬ DỤNG COMPONENT PRODUCTCARD ĐÃ TÍCH HỢP ĐẦY ĐỦ -->
        <div v-else class="rec-slider-container" ref="recSliderRef">
          <div 
            v-for="item in recommendedProducts" 
            :key="item.id" 
            class="position-relative"
            style="min-width: 250px; max-width: 250px; flex-shrink: 0;"
          >
            <!-- Sử dụng ProductCard Đã Được Nâng Cấp -->
            <ProductCard
              :product="item"
              :is-in-wishlist="isFavourited(item.id)"
              :is-in-compare="isInCompare(item.id)"
              :show-wishlist="true"
              :show-compare="true"
              :show-add-to-cart="true"
              @toggle-wishlist="toggleFavourite"
              @toggle-compare="handleToggleCompare"
              @add-to-cart="openQuickAdd"
            />
          </div>
          
          <div v-if="recommendedProducts.length === 0" class="rec-empty">
            Chưa có sản phẩm nào để hiển thị ở mục này.
          </div>
        </div>
      </section>

      <section class="product-description-section fade-in">
        <h2 class="section-title text-center font-serif text-sora-primary mb-5"><i class="bi bi-journal-text text-gold me-2"></i>MÔ TẢ SẢN PHẨM</h2>
        <div class="description-content" v-html="product.description"></div>
      </section>

      <!-- PRODUCT REVIEWS SECTION -->
      <section class="product-reviews-section fade-in">
        <h2 class="section-title text-center font-serif text-sora-primary mb-5"><i class="bi bi-star-fill text-gold me-2"></i>ĐÁNH GIÁ SẢN PHẨM</h2>
        
        <div class="reviews-overview shadow-sm border border-light-subtle" v-if="product.reviews && product.reviews.length > 0">
          <div class="row align-items-center w-100 m-0">
             <div class="col-md-5 text-center border-end border-light-subtle py-4">
               <div class="rating-score display-2 font-oswald fw-bold text-sora-primary lh-1 mb-2">{{ Number(product.rating_avg).toFixed(1) }}<span class="fs-4 text-muted">/5</span></div>
               <div class="rating-stars fs-4 text-gold mb-2">
                 <i v-for="n in 5" :key="n" class="bi" :class="n <= Math.round(product.rating_avg) ? 'bi-star-fill' : 'bi-star'"></i>
               </div>
               <div class="rating-count text-muted fw-medium font-oswald text-uppercase tracking-widest">{{ product.reviews.length }} nhận xét</div>
             </div>
             <div class="col-md-7 px-md-5 py-4 text-center text-md-start">
               <p class="font-serif fst-italic text-secondary fs-5 mb-0 lh-lg">"Những chia sẻ chân thực từ khách hàng đã trải nghiệm sự hoàn mỹ tại SORA."</p>
             </div>
          </div>
        </div>

        <div class="reviews-list mt-5" v-if="product.reviews && product.reviews.length > 0">
          <div class="review-item bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle mb-4" v-for="review in product.reviews" :key="review.id">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div class="d-flex align-items-center gap-3">
                <div class="review-avatar">
                  <img :src="review.user?.avatar_url || 'https://ui-avatars.com/api/?name=' + (review.user?.fullName || 'Guest') + '&background=9f273b&color=fff'" alt="Avatar" class="rounded-circle object-fit-cover shadow-sm border border-2 border-white" width="55" height="55">
                </div>
                <div class="review-user-info">
                  <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="review-username fw-bold text-dark fs-6 font-serif">{{ review.user?.fullName || 'Khách hàng' }}</span>
                      <span class="badge bg-success bg-opacity-10 text-success fw-medium px-2 py-1" style="font-size: 0.65rem;"><i class="bi bi-check-circle-fill me-1"></i>Đã mua hàng</span>
                  </div>
                  <div class="review-rating text-gold" style="font-size: 0.9rem;">
                    <i v-for="n in 5" :key="n" class="bi" :class="n <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                  </div>
                </div>
              </div>
              <div class="review-date text-muted small fw-medium font-oswald tracking-widest text-uppercase"><i class="bi bi-calendar-event me-1"></i>{{ new Date(review.created_at).toLocaleDateString('vi-VN') }}</div>
            </div>
            
            <div class="review-content text-dark mb-4" style="line-height: 1.8; font-size: 1.05rem;">
              <p class="mb-0">{{ review.comment }}</p>
            </div>
            
            <div class="review-images d-flex gap-3 flex-wrap mb-4" v-if="review.images && review.images.length > 0">
              <div v-for="(img, index) in review.images" :key="index" class="cursor-zoom-in rounded-3 overflow-hidden border border-light-subtle shadow-sm" style="width: 90px; height: 90px;" @click="viewFullImage(img)">
                <img :src="img" alt="Review Image" class="w-100 h-100 object-fit-cover transition-all img-zoom-hover" @error="handleImageError">
              </div>
            </div>
            
            <div class="review-admin-reply bg-light-custom p-4 rounded-3 border-start border-4 border-main mt-2" v-if="review.admin_reply">
              <div class="reply-title fw-bold text-sora-primary mb-2 d-flex align-items-center font-serif fs-6">
                  <i class="bi bi-stars me-2 text-gold"></i> Phản hồi từ SORA JEWELRY
              </div>
              <p class="mb-0 text-secondary" style="line-height: 1.6; font-size: 0.95rem;">{{ review.admin_reply }}</p>
            </div>
          </div>
        </div>
        
        <div class="no-reviews py-5 text-center bg-light-custom rounded-4 border border-light-subtle mt-4" v-else>
          <i class="bi bi-chat-heart text-gold opacity-50 display-1 mb-3 d-block"></i>
          <h5 class="font-serif text-dark mb-2 fw-bold">Chưa có đánh giá nào</h5>
          <p class="text-muted">Hãy là người đầu tiên sở hữu và đánh giá kiệt tác này.</p>
        </div>
      </section>

    </template>
    
    <!-- SIZE GUIDE MODAL COMPONENT -->
    <SizeGuideModal :show="showSizeGuideModal" @close="showSizeGuideModal = false" />

    <!-- GỌI COMPONENT SO SÁNH VÀ CHUYỀN DỮ LIỆU TỪ TRONG PAGE VÀO -->
    <CompareModal 
      ref="compareModalRef" 
      :shop-slug="shopSlug" 
      :base-product-id="product?.id" 
      @update-list="compareList = $event" 
    />

    <!-- POPUP QUICK ADD TỪ COMPONENT PRODUCT CARD -->
    <div class="modal fade" id="quickAddModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header bg-sora-primary text-white rounded-0 border-0 p-4">
            <h5 class="modal-title font-serif fw-bold tracking-wider">Tùy chọn Sản phẩm</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="quickAddProduct">
            <div class="d-flex gap-3 mb-4 pb-4 border-bottom border-light-subtle">
               <img :src="quickAddDisplayImage" @error="handleImageError" class="object-fit-cover border shadow-sm" style="width: 80px; height: 80px; border-radius: 4px;">
               <div class="d-flex flex-column justify-content-center">
                  <small class="text-uppercase font-oswald tracking-widest text-gold fw-bold" style="font-size: 0.7rem;">{{ quickAddProduct.category?.name || 'Trang Sức SORA' }}</small>
                  <h6 class="font-serif fw-bold mb-1 text-dark fs-5">{{ quickAddProduct.name }}</h6>
                  <span class="text-sora-primary fw-bold font-serif fs-5">{{ formatMoney(quickAddSelectedPrice) }}</span>
               </div>
            </div>

            <div v-for="(values, attrName) in quickAddMatrix" :key="attrName" class="mb-4">
               <p class="text-dark font-oswald tracking-wide text-uppercase mb-2 small fw-bold">
                 {{ attrName }}: <span class="fw-normal text-sora-primary ms-1">{{ quickAddSelections[attrName] || '' }}</span>
               </p>
               <div class="d-flex flex-wrap gap-2">
                 <label v-for="val in values" :key="val" class="attr-chip m-0 cursor-pointer transition-all" :class="{'selected': String(quickAddSelections[attrName]) === String(val)}">
                   <input type="radio" class="d-none" :value="val" v-model="quickAddSelections[attrName]" @change="quickAddError = false">
                   <div class="chip-inner px-3 py-2 d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                     <span class="fw-bold font-oswald tracking-wide small">{{ val }}</span>
                   </div>
                 </label>
               </div>
            </div>
            
            <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-if="quickAddError">
               <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại.
            </div>
            <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-else-if="quickAddMatrix && Object.keys(quickAddMatrix).length > 0 && !quickAddSelectedVariant && isQuickAddAllSelected">
               <i class="bi bi-x-circle-fill me-1"></i> Phiên bản này đã hết hàng hoặc không tồn tại.
            </div>

            <button @click="confirmQuickAdd" class="btn luxury-btn-solid w-100 py-3 mt-4 font-oswald tracking-widest text-uppercase fw-bold shadow-sm fs-6" style="background-color: #9f273b; color: white; border: none;">
               <i class="bi bi-bag-plus-fill me-2"></i> Xác nhận thêm
            </button>
          </div>
          <div v-else class="p-5 text-center">
             <div class="spinner-border text-sora-primary" role="status"></div>
             <p class="mt-3 text-muted font-oswald tracking-widest text-uppercase small">Đang nạp dữ liệu...</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';
import SizeGuideModal from '@/components/ui/SizeGuideModal.vue';
import VariantSelector from '@/components/ui/VariantSelector.vue';
import StockStatusBar from '@/components/ui/StockStatusBar.vue';
import PriceDisplay from '@/components/ui/PriceDisplay.vue';

// Composables
import { useWishlist } from '@/composables/useWishlist';
import { useProductVariants } from '@/composables/useProductVariants';
import { isColorAttribute, isSizeAttribute } from '@/composables/useColorMapping';
import { getToken, getHeaders, getFullImage, formatMoney } from '@/composables/useUtilities';
import { usePublicRefreshListener } from '@/composables/usePublicRefreshListener.js';

const route = useRoute();
const router = useRouter();
const product = ref(null);
const mainImage = ref('');
const isLoading = ref(true);
const showSizeGuideModal = ref(false);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const shopSlug = route.params.shop_slug || 'aurora';
const soraPlaceholder = '/Sora-placeholder.png';

// Wishlist composable
const { favourites, isTogglingFav, fetchFavorites, isFavourited, toggleFavourite: toggleFav } = useWishlist();

// Variants composable - need to pass product ref
let variantsComposable;

const getVariantsComposable = () => {
  if (!variantsComposable && product.value) {
    variantsComposable = useProductVariants({ value: product.value });
  }
  return variantsComposable || useProductVariants({ value: null });
};

// Computed refs from variants composable
const selectedAttributes = computed(() => {
  const comp = getVariantsComposable();
  return comp ? comp.selectedAttributes.value : {};
});
const selectedQuantity = computed({
  get: () => {
    const comp = getVariantsComposable();
    return comp ? comp.selectedQuantity.value : 1;
  },
  set: (value) => {
    const comp = getVariantsComposable();
    if (comp) {
      comp.selectedQuantity.value = value;
    }
  }
});
const isAllAttributesSelected = computed(() => {
  const comp = getVariantsComposable();
  return comp ? comp.isAllAttributesSelected.value : false;
});
const currentVariant = computed(() => {
  const comp = getVariantsComposable();
  return comp ? comp.currentVariant.value : null;
});
const currentStock = computed(() => {
  const comp = getVariantsComposable();
  return comp ? comp.currentStock.value : null;
});
const stockProgressWidth = computed(() => {
  const comp = getVariantsComposable();
  return comp ? comp.stockProgressWidth.value : 0;
});

// Countdown & Recommendations
const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' });
let timerInterval = null;
const activeTab = ref('related_category');
const recommendedProducts = ref([]);
const isLoadingRecs = ref(false);
const recSliderRef = ref(null);
const shopBrands = ref([]);

// Compare & Quick Add
const compareModalRef = ref(null);
const compareList = ref([]);
const quickAddProduct = ref(null);
const quickAddMatrix = ref({});
const quickAddSelections = ref({});
const quickAddError = ref(false);
let quickAddModalInstance = null;

// Helper functions
const isInCompare = (id) => compareList.value.some(item => item.id === id);

const handleToggleCompare = (prod) => {
  if (compareModalRef.value) compareModalRef.value.toggleCompare(prod);
};

// Quick Add computed properties
const isQuickAddAllSelected = computed(() => {
  const requiredAttrs = Object.keys(quickAddMatrix.value);
  if (requiredAttrs.length === 0) return true;
  return requiredAttrs.every(attr => quickAddSelections.value[attr]);
});

const quickAddSelectedVariant = computed(() => {
  if (!quickAddProduct.value || !quickAddProduct.value.variants) return null;
  const requiredAttrs = Object.keys(quickAddMatrix.value);
  if (requiredAttrs.length === 0) return quickAddProduct.value.variants[0];
  if (!isQuickAddAllSelected.value) return null;
  return quickAddProduct.value.variants.find(v => {
    return requiredAttrs.every(attr => v.formatted_attributes && String(v.formatted_attributes[attr]) === String(quickAddSelections.value[attr]));
  });
});

const quickAddDisplayImage = computed(() => {
  if (!quickAddProduct.value) return getFullImage(null);
  const selectedVar = quickAddSelectedVariant.value;
  if (selectedVar && selectedVar.image_url) return getFullImage(selectedVar.image_url);
  if (quickAddProduct.value.thumbnail_image) return getFullImage(quickAddProduct.value.thumbnail_image);
  return getFullImage(quickAddProduct.value.fallback_image);
});

const quickAddSelectedPrice = computed(() => {
  if (!quickAddProduct.value) return 0;
  const selectedVar = quickAddSelectedVariant.value;
  if (selectedVar) return selectedVar.promotional_price || selectedVar.price;
  return quickAddProduct.value.promotional_price || quickAddProduct.value.base_price || quickAddProduct.value.fallback_price || 0;
});

// Quick Add functions
const openQuickAdd = async (prod) => {
  quickAddProduct.value = null;
  quickAddError.value = false;
  quickAddSelections.value = {};
  quickAddMatrix.value = {};

  if (!quickAddModalInstance) {
    quickAddModalInstance = new window.bootstrap.Modal(document.getElementById('quickAddModal'));
  }
  quickAddModalInstance.show();

  try {
    const res = await axios.get(`${API_BASE_URL}/shop/all/products/${prod.slug}`);
    if (res.data && res.data.data) {
      quickAddProduct.value = {
        ...res.data.data,
        fallback_image: prod.thumbnail_image,
        fallback_price: prod.base_price
      };

      const matrix = {};
      if (quickAddProduct.value.variants) {
        quickAddProduct.value.variants.forEach(variant => {
          let attrs = {};
          let attrVals = variant.attributeValues || variant.attribute_values;
          if (attrVals) {
            attrVals.forEach(av => { if (av.attribute) attrs[av.attribute.name] = av.value; });
          } else if (variant.attributes) {
            attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
          }
          variant.formatted_attributes = attrs;
          Object.entries(attrs).forEach(([attrName, attrValue]) => {
            if (!matrix[attrName]) matrix[attrName] = new Set();
            matrix[attrName].add(attrValue);
          });
        });
      }

      const finalMatrix = {};
      Object.keys(matrix).forEach(key => { finalMatrix[key] = Array.from(matrix[key]); });
      quickAddMatrix.value = finalMatrix;

      if (quickAddProduct.value.variants && quickAddProduct.value.variants.length === 1) {
        const singleVariant = quickAddProduct.value.variants[0];
        if (singleVariant.formatted_attributes) {
          Object.entries(singleVariant.formatted_attributes).forEach(([attrName, attrValue]) => {
            quickAddSelections.value[attrName] = attrValue;
          });
        }
      }
    }
  } catch (e) {
    quickAddModalInstance.hide();
    soraAlert.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải thông tin sản phẩm' });
  }
};

const confirmQuickAdd = async () => {
  if (!isQuickAddAllSelected.value) {
    quickAddError.value = true;
    return;
  }
  quickAddError.value = false;

  const selectedVar = quickAddSelectedVariant.value;
  if (!selectedVar) {
    Toast.fire({ icon: 'error', title: 'Phiên bản đã hết hàng!' });
    return;
  }

  try {
    const payload = { product_variant_id: selectedVar.id, quantity: 1 };
    const res = await axios.post(`${API_BASE_URL}/client/cart`, payload, { headers: getHeaders() });

    if (res.data.session_id) {
      localStorage.setItem('cart_session_id', res.data.session_id);
    }

    quickAddModalInstance.hide();
    Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
  } catch (error) {
    const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
    soraAlert.fire({ icon: 'error', title: 'Lỗi', text: msg });
  }
};

// Swal utilities
const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  cancelButtonColor: '#6c757d',
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded-pill shadow-sm fw-bold', cancelButton: 'px-4 py-2 mx-2 rounded-pill fw-bold' }
});

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#fffafa',
  color: '#9f273b',
  iconColor: '#9f273b'
});

// Wishlist wrapper with Toast & soraAlert
const toggleFavourite = async (prod) => {
  await toggleFav(prod, Toast, soraAlert, router);
};

// Countdown
const startCountdown = () => {
  const targetTime = new Date().getTime() + (5 * 60 * 60 * 1000 + 59 * 60 * 1000 + 47 * 1000);
  const updateTime = () => {
    const now = new Date().getTime();
    const distance = targetTime - now;
    if (distance < 0) {
      clearInterval(timerInterval);
      countdown.value = { days: '00', hours: '00', minutes: '00', seconds: '00' };
      return;
    }
    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    countdown.value = {
      days: d < 10 ? '0' + d : d.toString(),
      hours: h < 10 ? '0' + h : h.toString(),
      minutes: m < 10 ? '0' + m : m.toString(),
      seconds: s < 10 ? '0' + s : s.toString()
    };
  };
  updateTime();
  timerInterval = setInterval(updateTime, 1000);
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (quickAddModalInstance) quickAddModalInstance.dispose();
}); 

const viewFullImage = (url) => {
  Swal.fire({
    imageUrl: url,
    imageAlt: 'Product Image',
    width: 600,
    imageHeight: 600,
    padding: 0,
    background: 'transparent',
    backdrop: 'rgba(0,0,0,0.85)',
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      image: 'rounded-3 shadow-lg object-fit-contain bg-white',
      popup: 'p-0 bg-transparent'
    }
  });
};

// API & Data functions
const fetchProductData = async () => {
  const productSlug = route.params.slug || route.params.product_slug;
  if (!productSlug) return isLoading.value = false;

  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/shop/${shopSlug}/products/${productSlug}`);
    const result = await response.json();

    if (result.success && result.data) {
      product.value = result.data;

      // Re-initialize variantsComposable with new product
      variantsComposable = null;

      if (product.value.variants) {
        product.value.variants.forEach(v => {
          if (typeof v.attributes === 'string') {
            try { v.attributes = JSON.parse(v.attributes); } catch (e) { }
          }
        });
      }

      if (product.value.images) {
        product.value.images = product.value.images.map(img => getFullImage(img));
        if (product.value.images.length > 0) mainImage.value = product.value.images[0];
      }

      saveToRecentlyViewed(product.value);
      fetchRecommendations('related_category');
      startCountdown();
    }
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveToRecentlyViewed = (prod) => {
  try {
    let viewed = JSON.parse(localStorage.getItem('viewed_products') || '[]');
    viewed = viewed.filter(p => p.id !== prod.id);
    viewed.unshift({
      id: prod.id, slug: route.params.slug || route.params.product_slug, name: prod.name,
      thumbnail_image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
      brand: prod.brand, base_price: prod.variants && prod.variants.length > 0 ? prod.variants[0].price : 0,
      promotional_price: prod.variants && prod.variants.length > 0 ? prod.variants[0].promotional_price : null
    });
    if (viewed.length > 12) viewed.pop();
    localStorage.setItem('viewed_products', JSON.stringify(viewed));
  } catch (error) {
    console.error("Lỗi lưu sản phẩm đã xem:", error);
  }
};

const fetchRecommendations = async (tab) => {
  activeTab.value = tab;
  isLoadingRecs.value = true;
  recommendedProducts.value = [];

  if (tab === 'viewed') {
    try {
      const viewed = JSON.parse(localStorage.getItem('viewed_products') || '[]');
      recommendedProducts.value = viewed.filter(p => p.id !== product.value?.id);
    } catch (error) { } finally {
      isLoadingRecs.value = false;
    }
    return;
  }

  try {
    let url = new URL(`${API_BASE_URL}/shop/${shopSlug}/products`);
    url.searchParams.append('per_page', '8');
    if (product.value?.id) url.searchParams.append('exclude_id', product.value.id);
    if (tab === 'related_category' && product.value?.category?.slug) url.searchParams.append('categories', product.value.category.slug);
    else if (tab === 'new') url.searchParams.append('sort', 'new');

    const response = await fetch(url.toString());
    const result = await response.json();
    if (result.success && result.data?.data) recommendedProducts.value = result.data.data;
  } catch (error) { } finally {
    isLoadingRecs.value = false;
  }
};

// Variants methods wrapper using composable
const selectAttribute = (attrName, optionId) => {
  const comp = getVariantsComposable();
  if (comp) {
    comp.selectAttribute(attrName, optionId);
    if (comp.isAllAttributesSelected.value && comp.currentVariant.value) {
      const variantImage = comp.currentVariant.value.image || comp.currentVariant.value.image_url;
      if (variantImage) {
        setMainImage(getFullImage(variantImage));
      }
    }
  }
};

const updateQuantity = (delta) => {
  const comp = getVariantsComposable();
  if (comp) {
    comp.updateQuantity(delta, Toast);
  }
};

const validateQuantity = () => {
  const comp = getVariantsComposable();
  if (comp) {
    comp.validateQuantity(Toast);
  }
};

// Helper functions for template
const isOptionDisabled = (attrName, optionId) => {
  const comp = getVariantsComposable();
  return comp ? !comp.isOptionAvailable(attrName, optionId) : false;
};

const getOptionName = (attrName, optionId) => {
  if (!product.value?.attributes?.[attrName]) return '';
  const option = product.value.attributes[attrName].find(opt => opt.id === optionId);
  return option ? option.name : '';
};

const addToCart = async () => {
  if (!isAllAttributesSelected.value || !currentVariant.value) return Toast.fire({ icon: 'info', title: 'Vui lòng chọn đầy đủ thông tin.' });
  if (selectedQuantity.value > currentStock.value) return Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' });

  try {
    const payload = { product_variant_id: currentVariant.value.id, quantity: selectedQuantity.value };
    const response = await axios.post(`${API_BASE_URL}/client/cart`, payload, { headers: getHeaders() });

    if (response.data.success) {
      Toast.fire({ icon: 'success', title: 'Thêm vào giỏ thành công' });
      if (response.data.session_id) localStorage.setItem('cart_session_id', response.data.session_id);
      router.push('/cart');
    }
  } catch (error) {
    let errorMsg = 'Hệ thống đang bận, không thể thêm vào giỏ hàng lúc này.';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
      if (errorMsg.includes('vượt quá tồn kho')) return Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' });
    }
    soraAlert.fire({ icon: 'error', title: 'Không thành công', text: errorMsg });
  }
};

const goToShopWithBrand = (brandId) => {
  if (!brandId) return;
  router.push({ path: `/shop/${shopSlug}`, query: { brand: brandId } }).catch(() => window.location.href = `/shop/${shopSlug}?brand=${brandId}`);
};

const changeRecTab = (tab) => {
  if (activeTab.value !== tab) fetchRecommendations(tab);
};

const scrollRecSlider = (direction) => {
  if (recSliderRef.value) recSliderRef.value.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
};

const setMainImage = (url) => mainImage.value = url;

const handleImageError = (e) => e.target.src = soraPlaceholder;

// Lifecycle hooks
onMounted(() => {
  fetchFavorites();
  fetchProductData();
});

watch(() => route.params.slug, (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (timerInterval) clearInterval(timerInterval);
    fetchProductData();
  }
});

</script>

<style>
:root {
  --sora-primary: rgb(159,39,59);
  --sora-primary-hover: #cc1e2e;
  --sora-text: #333333;
  --sora-gray: #f8f9fa;
  --sora-border: #eaeaea;
}
</style>

<style scoped>
/* =========================================
   LUXURY UI & PURE CSS LAYOUT 
   ========================================= */
* { box-sizing: border-box; margin: 0; padding: 0; }

.product-page { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #ffffff; min-height: 100vh; padding: 20px 0; color: var(--sora-text); }
.loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; color: #555; }
.spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--sora-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
.small-spinner { width: 30px; height: 30px; border-width: 2px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.breadcrumb { max-width: 1300px; margin: 0 auto 30px auto; font-size: 13px; color: #888; padding: 0 20px; }
.breadcrumb .separator { margin: 0 10px; color: #ccc; }
.breadcrumb .current { color: #333; }
.product-container, .featured-lines-section, .recommendations-section, .product-description-section { max-width: 1300px; margin: 0 auto; background: #fff; padding: 0 20px 50px 20px; }

/* GRID SẢN PHẨM 2 CỘT */
.product-grid { display: flex; gap: 50px; align-items: flex-start; }
.product-gallery { display: flex; gap: 15px; width: 58%; }
.thumbnails-list { display: flex; flex-direction: column; gap: 10px; width: 75px; flex-shrink: 0; }
.thumb-btn { width: 75px; height: 75px; border: 1px solid transparent; background: var(--sora-gray); cursor: pointer; overflow: hidden; transition: all 0.3s ease; padding: 0; border-radius: 4px; }
.thumb-btn:hover { border-color: #ccc; }
.thumb-btn.active { border-color: var(--sora-primary); } 
.thumb-img { width: 100%; height: 100%; object-fit: cover; }

.main-image-wrapper { flex-grow: 1; border: none; background: var(--sora-gray); display: flex; align-items: center; justify-content: center; padding: 0; aspect-ratio: 1 / 1; border-radius: 8px; position: relative;}
.main-img { width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 8px; }


.product-info { width: 42%; padding-top: 10px; }
.product-brand-top { font-size: 13px; color: #666; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
.product-brand-top .brand-name { color: var(--sora-text); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
.product-brand-top .sku { color: #999; border-left: 1px solid #ddd; padding-left: 10px; }
.product-title { font-size: 26px; font-weight: 500; color: #222; margin-bottom: 20px; line-height: 1.3; letter-spacing: 0.5px; }
.product-price { display: flex; align-items: center; gap: 15px; }
.price-current { font-size: 24px; font-weight: 700; color: rgb(159,39,59); }
.price-old { font-size: 16px; color: #999; text-decoration: line-through; }
.discount-badge { background: #fff0f2; color: rgb(159,39,59); padding: 3px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; }

/* FLASH SALE & PROGRESS */
.flash-sale-countdown { display: flex; align-items: center; justify-content: space-between; background-color: #fdf0f0; border: 1px solid #fad4d4; border-radius: 6px; padding: 12px 16px; }
.countdown-text { color: #F56C6C; font-size: 14px; font-weight: 500; }
.countdown-timer { display: flex; align-items: center; gap: 5px; font-size: 18px; font-weight: 700; color: #F56C6C; letter-spacing: 1px; }
.countdown-timer .colon { margin: 0 2px; color: #f56c6c; opacity: 0.7; }
.stock-progress-wrapper { margin-top: 10px; }
.stock-alert { display: flex; flex-direction: column; gap: 8px; }
.stock-text { font-size: 13px; color: #666; margin: 0; }
.stock-text strong { font-size: 14px; color: #333; }
.progress-bar-bg { width: 100%; height: 6px; background-color: #e4e7ed; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease-in-out; }
.red-fill { background-color: #F56C6C; }
.orange-fill { background-color: #E6A23C; }
.stock-status-luxury { font-size: 14px; font-weight: 500; }
.in-stock { color: rgb(159,39,59); } 
.out-of-stock { color: #999; }

/* VARIANTS */
.product-variants { margin-bottom: 15px; }
.variant-group { margin-bottom: 20px; }
.variant-label { font-size: 13px; color: #555; margin-bottom: 12px; font-weight: 500; text-transform: uppercase; }
.variant-options { display: flex; flex-wrap: wrap; gap: 12px; }
.color-options { gap: 15px; }
.color-swatch-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #dcdcdc; cursor: pointer; position: relative; transition: all 0.2s ease; padding: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); }
.color-swatch-btn:hover { transform: scale(1.05); border-color: #999; }
.color-swatch-btn.active { border: 2px solid #222; box-shadow: inset 0 0 0 3px #fff; transform: scale(1.1); }
.variant-btn { background: #f8f9fa; border: 1px solid #e9ecef; color: #6c757d; padding: 10px 18px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; min-width: 60px; text-align: center; border-radius: 6px; }
.variant-btn:hover { border-color: rgba(159,39,59, 0.5); color: rgb(159,39,59); background-color: #ffffff; }
.variant-btn.active { background: rgb(159,39,59); border-color: rgb(159,39,59); color: #ffffff; box-shadow: 0 4px 10px rgba(159,39,59,0.2); }

/* ACTIONS */
.action-area { display: flex; gap: 15px; margin-bottom: 15px; }
.quantity-selector { display: flex; border: 1px solid #eaeaea; height: 48px; border-radius: 8px; overflow: hidden; background-color: #f8f9fa; }
.qty-btn { width: 40px; background: transparent; border: none; font-size: 18px; cursor: pointer; color: #555; transition: color 0.2s; }
.qty-btn:hover { color: rgb(159,39,59); }
.qty-input { width: 45px; text-align: center; border: none; background: transparent; font-size: 15px; font-weight: 600; color: #333; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
.action-buttons { flex: 1; display: flex; gap: 15px; }
.btn-add-cart, .btn-consult { flex: 1; height: 48px; border: none; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; border-radius: 8px; transition: all 0.3s ease; }
.btn-add-cart { background-color: transparent; color: rgb(159,39,59); border: 1px solid rgb(159,39,59); }
.btn-add-cart:hover { background-color: rgb(159,39,59); color: #fff; box-shadow: 0 4px 15px rgba(159,39,59,0.3); }
.btn-consult { background-color: #fff; border: 1px solid #333; color: #333; }
.btn-consult:hover { background-color: #333; color: #fff; }

.btn-action-sub {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: 1px dashed #ccc;
    border-radius: 8px;
    color: #555;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    height: 48px;
}
.btn-action-sub:hover { border-color: rgb(159,39,59); color: rgb(159,39,59); }
.btn-action-sub.active { background: #fdf5f6; color: rgb(159,39,59); border-color: rgb(159,39,59); border-style: solid; }
.btn-action-sub.active i { color: rgb(159,39,59) !important; }

/* =========================================
   ĐỒNG BỘ NÚT YÊU THÍCH VỚI TRANG CHỦ
   ========================================= */
.main-wishlist-btn {
    width: 38px;
    height: 38px;
    background: #ffffff;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
    z-index: 10;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #6c757d; 
    position: absolute; top: 20px; right: 20px;
}
.main-wishlist-btn:hover {
    transform: scale(1.1);
    color: #cc1e2e;
}
.main-wishlist-btn.active { color: #dc3545; }
.main-wishlist-btn.active i { color: #dc3545 !important; }
.main-wishlist-btn i { font-size: 1.15rem; margin-top: 2px; }

.btn-wishlist-action {
    width: 48px;
    height: 48px;
    background: #ffffff;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.3rem;
    flex-shrink: 0;
}
.btn-wishlist-action:hover { transform: scale(1.1); color: #cc1e2e; }
.btn-wishlist-action.active { color: #dc3545; }
.btn-wishlist-action.active i { color: #dc3545 !important; }

.product-short-desc { border-top: 1px dotted #e5e5e5; padding-top: 25px; font-size: 13px; line-height: 1.6; color: #555; }
.product-short-desc p { margin-bottom: 20px; }
.notes h4 { font-size: 12px; color: #222; margin-bottom: 10px; letter-spacing: 0.5px; }
.notes ul { list-style: none; padding-left: 0; }
.notes li { position: relative; padding-left: 12px; margin-bottom: 8px; }
.notes li::before { content: '•'; position: absolute; left: 0; color: rgb(159,39,59); }

/* SECTIONS */
.featured-lines-section { padding-top: 30px; border-top: 1px solid #eee; }
.text-center { text-align: center; }
.featured-lines-section .section-title { font-size: 22px; font-weight: 600; color: #222; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; }
.featured-lines-container { display: flex; gap: 40px; align-items: center; }
.featured-banner { width: 50%; overflow: hidden; aspect-ratio: 4 / 3; display: flex; justify-content: center; align-items: center; border-radius: 8px; position: relative; }
.featured-banner img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
.featured-banner img:hover { transform: scale(1.05); }

/* Promo Badge Đã Cập Nhật Emojis -> Icons */
.promo-badge { position: absolute; top: 15px; left: 15px; color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; }
.bg-sora-primary { background-color: var(--sora-primary) !important; }
.text-sora-primary { color: var(--sora-primary) !important; }
.text-gold { color: #e7ce7d !important; }

.featured-content { width: 50%; display: flex; flex-direction: column; gap: 25px; }
.featured-tags { margin-bottom: 15px; }
.f-tag-btn { background: transparent; border: 1px solid #ccc; color: #555; padding: 10px 20px; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; border-radius: 50px; }
.f-tag-btn:hover, .f-tag-btn:first-child { background: var(--sora-primary); color: #fff; border-color: var(--sora-primary); }

.featured-benefits { display: flex; gap: 20px; text-align: center; }
.benefit-item { display: flex; flex-direction: column; align-items: center; font-size: 0.85rem; font-weight: 500; color: #555; }

.recommendations-section { padding-top: 40px; border-top: 1px solid #eee;}
.recommendations-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 20px; margin-bottom: 20px; }
.rec-title-wrap { display: flex; flex-direction: column; gap: 8px; }
.rec-title { font-size: 18px; font-weight: 600; color: #222; letter-spacing: 1px; }
.rec-subtitle { font-size: 13px; color: #777; }
.rec-controls { display: flex; align-items: center; gap: 24px; }
.rec-tabs { display: flex; gap: 25px; }
.rec-tabs button { background: none; border: none; font-size: 14px; font-weight: 500; color: #888; cursor: pointer; padding-bottom: 10px; border-bottom: 2px solid transparent; transition: all 0.2s; }
.rec-tabs button:hover { color: rgb(159,39,59); }
.rec-tabs button.active { color: rgb(159,39,59); border-bottom-color: rgb(159,39,59); }
.rec-arrows { display: flex; gap: 8px; }
.arrow-btn { width: 36px; height: 36px; border: 1px solid #ddd; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #555; transition: all 0.2s; border-radius: 50%; }
.arrow-btn:hover { background: rgb(159,39,59); color: #fff; border-color: rgb(159,39,59); }
.rec-loading, .rec-empty { min-height: 250px; display: flex; align-items: center; justify-content: center; color: #777; }
.rec-slider-container { display: flex; gap: 20px; overflow-x: auto; scroll-behavior: smooth; padding-bottom: 20px; -ms-overflow-style: none; scrollbar-width: none; }
.rec-slider-container::-webkit-scrollbar { display: none; }

.product-description-section { padding-top: 40px; border-top: 1px solid #eee; margin-top: 20px;}
.section-title { font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
.description-content { line-height: 1.8; color: #555; font-size: 15px; }

/* REVIEWS SECTION - ĐÃ REDESIGN LẠI GIAO DIỆN XỊN XÒ VÀ HIỂN THỊ ĐÚNG SỐ SAO */
.bg-light-custom { background-color: #faf9f8 !important; }
.border-main { border-color: #9f273b !important; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.tracking-widest { letter-spacing: 2px; }

.product-reviews-section { padding-top: 40px; border-top: 1px solid #eee; margin-top: 20px; max-width: 1300px; margin-left: auto; margin-right: auto; background: #fff; padding-bottom: 50px; padding-left: 20px; padding-right: 20px; }
.reviews-overview { border-radius: 12px; background: #fff; }
.rating-score { color: rgb(159,39,59); }
.rating-stars { color: #e7ce7d; }

.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-item { transition: box-shadow 0.3s; }
.review-item:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; }

.review-images .cursor-zoom-in { cursor: zoom-in; }
.group-hover-scale:hover { transform: scale(1.08); }

/* SIZE GUIDE BUTTON STYLING */
.variant-label-wrapper { position: relative; }

.size-guide-btn-compact {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1.5px solid #ddd;
  background: white;
  color: #9f273b;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.size-guide-btn-compact:hover {
  border-color: #9f273b;
  background: #fdf5f6;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(159, 39, 59, 0.15);
}

.size-guide-btn-compact:active {
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .product-grid { flex-wrap: wrap; }
  .product-gallery { width: 100%; }
  .product-info { width: 100%; }
  .featured-lines-container { flex-direction: column; }
  .featured-banner, .featured-content { width: 100%; }
}
@media (max-width: 768px) {
  .product-gallery { flex-direction: column-reverse; }
  .thumbnails-list { flex-direction: row; width: 100%; overflow-x: auto; }
  .thumb-btn { width: 60px; height: 60px; }
  .recommendations-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .rec-controls { width: 100%; justify-content: space-between; }
  .rec-tabs { overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
  .action-area { flex-wrap: wrap; }
  .quantity-selector { width: 100%; justify-content: center; }
  .flash-sale-countdown { flex-direction: column; align-items: flex-start; gap: 8px; }
}

/* SKELETON LOADING CSS */
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.shimmer {
    background: #f6f7f8;
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-repeat: no-repeat;
    background-size: 800px 100%;
    animation: placeholderShimmer 1.5s linear infinite forwards;
}
@keyframes placeholderShimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

.skeleton-box { background-color: #eee; border-radius: 4px; }
.skeleton-text { height: 16px; border-radius: 4px; }
.skeleton-title { height: 28px; border-radius: 4px; }

/* CSS QUICK ADD MODAL CHIP */
.attr-chip { border-radius: 4px; overflow: hidden; min-width: 55px; }
.attr-chip .chip-inner { border: 1px solid #dee2e6; background-color: #fff; color: #555; border-radius: 4px; transition: all 0.3s ease-in-out; padding: 6px 12px; }
.attr-chip:hover .chip-inner { border-color: #e7ce7d; color: #9f273b; }
.attr-chip.selected .chip-inner { background-color: #9f273b; border-color: #9f273b; color: #fff !important; box-shadow: 0 4px 10px rgba(159, 39, 59, 0.25); }
.attr-chip.selected .chip-inner span { color: #fff !important; }
</style>