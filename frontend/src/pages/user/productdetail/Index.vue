<template>
  <div class="product-page">
    
    <!-- LOADING STATE SKELETON (ĐÃ ĐƯỢC NÂNG CẤP) -->
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
            
            <div class="product-price mb-3">
              <template v-if="isAllAttributesSelected && currentVariant">
                <span class="price-current">{{ formatMoney(currentVariant.promotional_price || currentVariant.price) }}</span>
                <span v-if="currentVariant.promotional_price" class="price-old">
                  {{ formatMoney(currentVariant.price) }}
                </span>
                <span v-if="currentVariant.promotional_price" class="discount-badge">
                  -{{ Math.round((1 - currentVariant.promotional_price / currentVariant.price) * 100) }}%
                </span>
              </template>
              <template v-else>
                <span class="price-current">{{ formatMoney(product.promotional_price || product.base_price || product.variants?.[0]?.price) }}</span>
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

            <div class="product-variants">
              <div v-for="(options, attrName) in product.attributes" :key="attrName" class="variant-group">
                <div class="variant-label-wrapper">
                  <h3 class="variant-label">
                    {{ attrName }}
                    <span v-if="selectedAttributes[attrName]" style="color: #333; font-weight: 600; text-transform: none; font-size: 15px;">
                      : {{ getOptionName(attrName, selectedAttributes[attrName]) }}
                    </span>
                  </h3>
                  <button
                    v-if="isSizeAttribute(attrName)"
                    @click="openSizeGuide"
                    class="size-guide-btn"
                    title="Xem hướng dẫn kích cỡ"
                  >
                    <i class="bi bi-rulers"></i> Hướng dẫn size
                  </button>
                </div>
                
                <div v-if="isColorAttribute(attrName)" class="variant-options color-options">
                  <button 
                    v-for="option in options" 
                    :key="option.id"
                    @click="selectAttribute(attrName, option.id)"
                    class="color-swatch-btn d-flex justify-content-center align-items-center"
                    :class="{ 'active': selectedAttributes[attrName] === option.id }"
                    :title="option.name"
                    :style="{ backgroundColor: getColorCode(option.name) }"
                  >
                    <i v-if="selectedAttributes[attrName] === option.id" class="bi bi-check fw-bold" :class="isLightColor(option.name) ? 'text-dark' : 'text-white'" style="font-size: 1.3rem;"></i>
                  </button>
                </div>
                
                <div v-else class="variant-options">
                  <button 
                    v-for="option in options" 
                    :key="option.id"
                    @click="selectAttribute(attrName, option.id)"
                    class="variant-btn"
                    :class="{ 'active': selectedAttributes[attrName] === option.id }"
                  >
                    {{ option.name }}
                  </button>
                </div>
              </div>
            </div>

            <div class="stock-progress-wrapper mb-4">
              <template v-if="isAllAttributesSelected && currentVariant">
                <div v-if="currentStock > 0 && currentStock < 10" class="stock-alert critical">
                  <p class="stock-text">Only <strong>{{ currentStock }}</strong> item(s) left in stock! (Chỉ còn {{ currentStock }} sản phẩm)</p>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill red-fill" :style="{ width: stockProgressWidth + '%' }"></div>
                  </div>
                </div>
                
                <div v-else-if="currentStock >= 10 && currentStock < 15" class="stock-alert warning">
                  <p class="stock-text">Sắp hết hàng (Còn {{ currentStock }} sản phẩm)</p>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill orange-fill" :style="{ width: stockProgressWidth + '%' }"></div>
                  </div>
                </div>

                <div v-else class="stock-status-luxury">
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
                @click="toggleCompare({ id: product.id, name: product.name, image: mainImage })"
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

        <div v-else class="rec-slider-container" ref="recSliderRef">
          
          <div 
            v-for="item in recommendedProducts" 
            :key="item.id" 
            class="sora-luxury-card"
            style="min-width: 250px; max-width: 250px; flex-shrink: 0;"
            @click="goToProduct(item.slug || item.id)"
          >
            <!-- Nút So Sánh (Floating) -->
            <button class="compare-float-btn" 
                    :class="{ 'active': isInCompare(item.id) }"
                    title="So sánh" 
                    @click.stop="toggleCompare({ id: item.id, name: item.name, image: getImageUrl(item.thumbnail_image) })">
              <i class="bi bi-arrow-left-right"></i>
            </button>

            <!-- Vùng hình ảnh -->
            <div class="sora-card-image">
                <div class="sora-card-badges">
                    <!-- <span v-if="item.is_new" class="sora-badge">MỚI</span> -->
                </div>

                <button class="sora-wishlist-btn" :class="{ 'active': isFavourited(item.id) }" @click.stop="toggleFavourite(item)" :title="isFavourited(item.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'" :disabled="isTogglingFav === item.id">
                    <span v-if="isTogglingFav === item.id" class="spinner-border spinner-border-sm text-danger" style="width: 1rem; height: 1rem;"></span>
                    <i v-else :class="isFavourited(item.id) ? 'bi bi-suit-heart-fill text-danger' : 'bi bi-suit-heart'"></i>
                </button>

                <!-- Ảnh -->
                <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" @error="handleImageError">
            </div>

            <!-- Vùng thông tin -->
            <div class="sora-card-info">
                <h3 class="sora-card-title" :title="item.name">{{ item.name }}</h3>
                <p class="sora-card-category">{{ item.category?.name || item.brand?.name || 'Trang sức SORA' }}</p>
                
                <div class="sora-card-price">
                    <span v-if="item.promotional_price" class="sora-card-price-old">{{ formatMoney(item.base_price) }}</span>
                    <span>{{ formatMoney(item.promotional_price || item.base_price) }}</span>
                </div>
            </div>

            <!-- Vùng nút hover hiện lên -->
            <div class="sora-card-action">
                <button class="sora-action-btn" @click.stop="goToProduct(item.slug || item.id)">
                    <i class="bi bi-eye me-1"></i> XEM CHI TIẾT
                </button>
            </div>
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

      <!-- PRODUCT REVIEWS SECTION (ĐÃ NÂNG CẤP GIAO DIỆN XỊN XÒ VÀ HIỂN THỊ ĐÚNG ẢNH/SỐ SAO) -->
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
    
    <!-- MODAL HƯỚNG DẪN SIZE -->
    <transition name="fade">
      <div v-if="showSizeGuideModal" class="size-guide-modal-overlay" @click.self="closeSizeGuide">
        <div class="size-guide-modal">
          <div class="size-guide-modal-header">
            <h3>Hướng Dẫn Kích Cỡ</h3>
            <button class="close-btn" @click="closeSizeGuide">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="size-guide-modal-body">
            <div class="size-chart-section">
              <h4 class="section-title">Bảng Kích Cỡ Tiêu Chuẩn</h4>
              <p class="section-desc">Những kích cỡ bên dưới là những thông số tiêu chuẩn cho nhẫn nữ. Kích cỡ có thể thay đổi tùy theo yêu cầu riêng của từng khách hàng.</p>

              <div class="size-table">
                <div class="table-header">
                  <div class="table-cell">Kích Cỡ Nhẫn</div>
                  <div class="table-cell">Đường Kính (mm)</div>
                  <div class="table-cell">Chu Vi (mm)</div>
                </div>
                <div v-for="size in sizeGuideData" :key="size.size" class="table-row">
                  <div class="table-cell">{{ size.size }}</div>
                  <div class="table-cell">{{ size.diameter }} mm</div>
                  <div class="table-cell">{{ size.circumference }} mm</div>
                </div>
              </div>
            </div>

            <div class="measurement-guide-section mt-5">
              <h4 class="section-title">Cách Đo Kích Cỡ Nhẫn</h4>
              <ul class="measurement-steps">
                <li>
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Sử dụng một sợi dây mềm hoặc giấy</strong> - Quấn xung quanh ngón tay của bạn, vị trí mà bạn sẽ đeo nhẫn
                  </div>
                </li>
                <li>
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Đánh dấu vị trí giao nhau</strong> - Ghi dấu ở điểm hai đầu sợi dây/giấy gặp nhau
                  </div>
                </li>
                <li>
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Đo chu vi</strong> - Dùng thước đo chu vi của sợi dây từ điểm đầu đến điểm cuối (tính bằng mm)
                  </div>
                </li>
                <li>
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Đối chiếu với bảng</strong> - Tìm chu vi gần nhất trong bảng kích cỡ phía trên để xác định size nhẫn của bạn
                  </div>
                </li>
              </ul>
            </div>

            <div class="tips-section mt-5 p-4" style="background-color: #f8f9fa; border-left: 4px solid rgb(159,39,59); border-radius: 4px;">
              <h4 class="section-title mb-3" style="margin-top: 0;"><i class="bi bi-lightbulb-fill text-warning me-2"></i> Lưu Ý Quan Trọng</h4>
              <ul class="tips-list">
                <li>Đo kích cỡ khi tay bạn ở nhiệt độ bình thường (không lạnh)</li>
                <li>Đeo nhẫn vào ngón tay ít nhất 30 phút trước khi mua để chắc chắn kích cỡ phù hợp</li>
                <li>Nếu bạn không chắc chắn, hãy liên hệ với đội hỗ trợ của chúng tôi để được tư vấn</li>
                <li>Sau khi mua, bạn có thể thay đổi kích cỡ nhẫn miễn phí trong 30 ngày đầu</li>
              </ul>
            </div>
          </div>

          <div class="size-guide-modal-footer">
            <button class="btn-close-guide" @click="closeSizeGuide">Đóng</button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="slide-up">
      <div v-if="compareList.length > 0" class="compare-bottom-bar">
        <div class="compare-inner">
          <div class="compare-info">
            <h4>So sánh sản phẩm ({{ compareList.length }}/4)</h4>
          </div>
          <div class="compare-items">
            <div v-for="n in 4" :key="n" class="compare-item" :class="{ empty: !compareList[n-1] }">
              <template v-if="compareList[n-1]">
                <img :src="compareList[n-1].image || getImageUrl(compareList[n-1].thumbnail_image)" :alt="compareList[n-1].name">
                <button class="remove-compare" @click="removeFromCompare(compareList[n-1].id)">
                  <i class="bi bi-x"></i>
                </button>
              </template>
              <span v-else><i class="bi bi-plus text-muted"></i></span>
            </div>
          </div>
          <div class="compare-actions">
            <button class="btn-clear-compare" @click="clearCompare">Xóa tất cả</button>
            <button class="btn-go-compare" :disabled="compareList.length < 2" @click="goToComparePage">So sánh ngay</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- POPUP THÊM SO SÁNH -->
    <transition name="fade">
      <div v-if="showComparePopup" class="compare-modal-overlay" @click.self="closeComparePopup">
        <div class="compare-modal">
          <div class="compare-modal-header">
            <h3>Thêm sản phẩm so sánh</h3>
            <div class="header-search-wrap">
              <input type="text" v-model="searchQuery" @input="handleSearchInput" placeholder="Tìm tên sản phẩm..." class="modal-search-input">
            </div>
            <button class="close-btn" @click="closeComparePopup"><i class="bi bi-x-lg"></i></button>
          </div>

          <div class="compare-modal-tabs">
            <button :class="{ active: comparePopupTab === 'suggestions' }" @click="comparePopupTab = 'suggestions'">Gợi ý</button>
            <button :class="{ active: comparePopupTab === 'favourites' }" @click="fetchFavouritesForCompare">Yêu thích</button>
          </div>

          <div class="compare-modal-body">
            <!-- TAB GỢI Ý -->
            <div v-if="comparePopupTab === 'suggestions'">
              <div v-if="isLoadingCompareSuggestions" class="text-center py-4">
                <div class="spinner small-spinner mx-auto" style="margin: 0 auto;"></div>
              </div>
              <div v-else-if="filteredSuggestions.length > 0" class="compare-suggestions-grid">
                <div v-for="item in filteredSuggestions" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img" @error="handleImageError">
                  <div class="suggestion-info">
                    <div class="suggestion-name" :title="item.name">{{ item.name }}</div>
                    <div class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</div>
                    <button class="btn-add-suggestion" :class="{ 'is-added': isInCompare(item.id) }" @click="toggleCompare({ id: item.id, name: item.name, image: getImageUrl(item.thumbnail_image) })">
                      {{ isInCompare(item.id) ? 'Đã thêm' : 'Thêm' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-msg">Không tìm thấy sản phẩm gợi ý.</div>
            </div>

            <!-- TAB YÊU THÍCH -->
            <div v-if="comparePopupTab === 'favourites'">
              <div v-if="!isLoggedIn" class="not-logged-in-msg">Vui lòng đăng nhập để xem danh sách yêu thích.</div>
              <div v-else-if="isLoadingFavourites" class="text-center py-4">
                <div class="spinner small-spinner mx-auto" style="margin: 0 auto;"></div>
              </div>
              <div v-else-if="filteredFavourites.length > 0" class="compare-suggestions-grid">
                <div v-for="item in filteredFavourites" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img" @error="handleImageError">
                  <div class="suggestion-info">
                    <div class="suggestion-name" :title="item.name">{{ item.name }}</div>
                    <div class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</div>
                    <button class="btn-add-suggestion" :class="{ 'is-added': isInCompare(item.id) }" @click="toggleCompare({ id: item.id, name: item.name, image: getImageUrl(item.thumbnail_image) })">
                      {{ isInCompare(item.id) ? 'Đã thêm' : 'Thêm' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-msg">Danh sách yêu thích đang trống.</div>
            </div>
          </div>

          <div class="compare-modal-footer">
            <button class="btn-outline" @click="closeComparePopup">Đóng</button>
            <button class="btn-primary" :disabled="compareList.length < 2" @click="goToComparePage">Xem so sánh ({{ compareList.length }})</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const product = ref(null);
const mainImage = ref('');
const selectedAttributes = ref({});
const selectedQuantity = ref(1);
const isLoading = ref(true);
const showSizeGuideModal = ref(false);

const sizeGuideData = [
  { size: '5', diameter: 15.7, circumference: 50 },
  { size: '6', diameter: 16.5, circumference: 52 },
  { size: '7', diameter: 17.4, circumference: 54 },
  { size: '8', diameter: 18.3, circumference: 57 },
  { size: '9', diameter: 19.1, circumference: 60 },
  { size: '10', diameter: 20.0, circumference: 62.5 },
  { size: '11', diameter: 20.9, circumference: 65 },
  { size: '12', diameter: 21.8, circumference: 68 },
  { size: '13', diameter: 22.6, circumference: 71 },
  { size: '14', diameter: 23.5, circumference: 74 },
  { size: '15', diameter: 24.4, circumference: 76.5 },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const shopSlug = route.params.shop_slug || 'aurora';

const soraPlaceholder = '/Sora-placeholder.png'; 

const isColorAttribute = (name) => {
  const lowerName = name.toLowerCase();
  return lowerName.includes('màu') || lowerName.includes('color');
};

const isSizeAttribute = (name) => {
  const lowerName = name.toLowerCase();
  return lowerName.includes('size') || lowerName.includes('kích cỡ') || lowerName.includes('cỡ') || lowerName.includes('ni tay');
};

const getColorCode = (colorName) => {
  if(!colorName) return '#e0e0e0';
  const map = {
    'đỏ': '#cc1e2e', 'red': '#cc1e2e', 'đỏ đô': '#8b0000', 'đỏ mận': '#800000', 'đỏ tươi': '#ff0000', 'ruby': '#e0115f',
    'xanh': '#2e5b9f', 'blue': '#2e5b9f', 'xanh dương': '#007bff', 'xanh biển': '#1e90ff', 'xanh ngọc': '#009981', 'xanh lá': '#28a745', 'green': '#28a745', 'xanh lục': '#228b22', 'emerald': '#50c878',
    'vàng': '#e7ce7d', 'gold': '#e7ce7d', 'vàng 18k': '#d4af37', 'vàng 24k': '#ffd700', 'vàng chanh': '#fada5e', 'vàng kem': '#fdfd96',
    'trắng': '#ffffff', 'white': '#ffffff', 'vàng trắng': '#f4f4f4', 'bạch kim': '#e5e4e2', 'bạc': '#c0c0c0', 'silver': '#c0c0c0', 'trong suốt': '#f0f8ff',
    'đen': '#2c2c2c', 'black': '#2c2c2c', 'xám': '#808080', 'gray': '#808080', 'ghi': '#808080',
    'hồng': '#f4a4b4', 'pink': '#f4a4b4', 'vàng hồng': '#b76e79', 'rose gold': '#b76e79', 'tím': '#800080', 'purple': '#800080', 'thạch anh tím': '#9966cc',
    'nâu': '#8b4513', 'brown': '#8b4513', 'cam': '#fd7e14', 'orange': '#fd7e14'
  };
  return map[colorName.toLowerCase().trim()] || '#e0e0e0'; 
};

const isLightColor = (colorName) => {
  const code = getColorCode(colorName);
  const lightCodes = ['#ffffff', '#fcfcfc', '#f4f4f4', '#e5e4e2', '#c0c0c0', '#e0e0e0', '#fada5e', '#fdfd96', '#f0f8ff', '#ffb6c1', '#f4a4b4'];
  return lightCodes.includes(code);
};

const getOptionName = (attrName, optionId) => {
  if (!product.value || !product.value.attributes) return '';
  const options = product.value.attributes[attrName];
  if (!options) return '';
  const opt = options.find(o => o.id === optionId);
  return opt ? opt.name : '';
};

const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' });
let timerInterval = null;

const activeTab = ref('related_category');
const recommendedProducts = ref([]);
const isLoadingRecs = ref(false);
const recSliderRef = ref(null);

const shopBrands = ref([]); 

const compareList = ref([]);
const showComparePopup = ref(false);
const compareSuggestions = ref([]);
const isLoadingCompareSuggestions = ref(false);

const comparePopupTab = ref('suggestions');
const favouriteProducts = ref([]);
const isLoadingFavourites = ref(false);

// Hàm getToken dùng chung cho toàn page
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
        if (parsed.user && parsed.user.token) return parsed.user.token;
      }
    } catch(e) {}
  }
  return '';
};

const isLoggedIn = computed(() => !!getToken());

const searchQuery = ref('');
let searchTimeout = null;

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

// ==========================================
// LOGIC WISHLIST (YÊU THÍCH) - ĐỒNG BỘ API MỚI
// ==========================================
const favourites = ref([]);
const isTogglingFav = ref(null);

const fetchFavorites = async () => {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE_URL}/client/favourites`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (data.status) {
      favourites.value = data.data.map(fav => fav.product_id);
    }
  } catch (e) {
    console.error('Không thể tải danh sách yêu thích', e);
  }
};

const isFavourited = (productId) => {
  if (!productId) return false;
  return favourites.value.includes(productId);
};

const toggleFavourite = async (prod) => {
  if (!prod || !prod.id) return;
  const token = getToken();
  
  if (!token) {
    soraAlert.fire({
      icon: 'warning',
      title: 'Bạn chưa đăng nhập!',
      text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
      confirmButtonText: 'Đăng Nhập Ngay',
      showCancelButton: true,
      cancelButtonText: 'Đóng'
    }).then((result) => {
      if (result.isConfirmed) router.push('/login');
    });
    return;
  }

  isTogglingFav.value = prod.id; 

  try {
    const response = await fetch(`${API_BASE_URL}/client/favourites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ product_id: prod.id })
    });
    
    const data = await response.json();

    if (data.status) {
      if (data.action === 'added') {
        favourites.value.push(prod.id);
        Toast.fire({ icon: 'success', title: 'Đã thêm vào yêu thích' });
      } else if (data.action === 'removed') {
        favourites.value = favourites.value.filter(id => id !== prod.id);
        Toast.fire({ icon: 'info', title: 'Đã bỏ yêu thích' });
      }
    } else {
      if (response.status === 401) {
          Toast.fire({ icon: 'error', title: 'Phiên đăng nhập hết hạn. Vui lòng tải lại.' });
      }
    }
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra, thử lại sau' });
  } finally {
    isTogglingFav.value = null; 
  }
};
// ==========================================

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
});

const getStock = (variant) => {
  if(!variant) return 0;
  return variant.stock_quantity ?? variant.stock ?? 0;
};

const currentStock = computed(() => {
  if (!isAllAttributesSelected.value || !currentVariant.value) return null;
  return getStock(currentVariant.value);
});

const stockProgressWidth = computed(() => {
  const stock = currentStock.value;
  if (!stock) return 0;
  const percent = (stock / 15) * 100;
  return percent > 100 ? 100 : percent;
});

const loadCompareList = () => {
  try {
    const stored = localStorage.getItem(`compare_list_${shopSlug}`);
    if (stored) compareList.value = JSON.parse(stored);
  } catch (e) { compareList.value = []; }
};

watch(compareList, (newVal) => {
  localStorage.setItem(`compare_list_${shopSlug}`, JSON.stringify(newVal));
}, { deep: true });

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return compareSuggestions.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return compareSuggestions.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

const filteredFavourites = computed(() => {
  if (!searchQuery.value) return favouriteProducts.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return favouriteProducts.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

const fetchCompareSuggestions = async (query = '') => {
  isLoadingCompareSuggestions.value = true;
  try {
    let url = new URL(`${API_BASE_URL}/shop/${shopSlug}/products`);
    url.searchParams.append('per_page', query ? '20' : '10');
    url.searchParams.append('sort', 'new'); 
    if (product.value?.id) url.searchParams.append('exclude_id', product.value.id);
    if (query) url.searchParams.append('search', query);

    const response = await fetch(url.toString());
    const result = await response.json();
    if (result.success && result.data?.data) compareSuggestions.value = result.data.data;
  } catch (error) { console.error("Lỗi tải sản phẩm gợi ý:", error); } 
  finally { isLoadingCompareSuggestions.value = false; }
};

const handleSearchInput = () => {
  if (comparePopupTab.value === 'suggestions') {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { fetchCompareSuggestions(searchQuery.value); }, 500); 
  }
};

const isInCompare = (id) => compareList.value.some(item => item.id === id);

const toggleCompare = (prod) => {
  if (isInCompare(prod.id)) removeFromCompare(prod.id);
  else {
    if (compareList.value.length >= 4) return Toast.fire({ icon: 'warning', title: 'Chỉ được so sánh tối đa 4 sản phẩm' });
    compareList.value.push(prod);
    Toast.fire({ icon: 'success', title: 'Đã thêm vào danh sách so sánh' });
    if (!showComparePopup.value) openComparePopup();
  }
};

const removeFromCompare = (id) => compareList.value = compareList.value.filter(item => item.id !== id);
const clearCompare = () => compareList.value = [];

const goToComparePage = () => {
  if (compareList.value.length < 2) return Toast.fire({ icon: 'info', title: 'Vui lòng chọn ít nhất 2 sản phẩm' });
  showComparePopup.value = false;
  const baseProductId = product.value ? product.value.id : compareList.value[0].id;
  router.push({ path: `/shop/${shopSlug}/compare`, query: { spGoc: baseProductId } });
};

const openComparePopup = async () => {
  showComparePopup.value = true; comparePopupTab.value = 'suggestions'; searchQuery.value = '';
  if (compareSuggestions.value.length === 0) await fetchCompareSuggestions();
};
const closeComparePopup = () => showComparePopup.value = false;

const openSizeGuide = () => showSizeGuideModal.value = true;
const closeSizeGuide = () => showSizeGuideModal.value = false;

const fetchFavouritesForCompare = async () => {
  comparePopupTab.value = 'favourites';
  if(!isLoggedIn.value || favouriteProducts.value.length > 0) return;
  isLoadingFavourites.value = true;
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/client/favourites`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const result = await response.json();
    if (result.status && result.data) favouriteProducts.value = result.data.map(item => item.product).filter(p => p !== null);
  } catch (error) { console.error("Lỗi lấy danh sách yêu thích:", error); } 
  finally { isLoadingFavourites.value = false; }
};

const isAllAttributesSelected = computed(() => {
  if (!product.value || !product.value.attributes) return false;
  const requiredAttrs = Object.keys(product.value.attributes);
  if (requiredAttrs.length === 0) return true; 
  return requiredAttrs.every(attr => selectedAttributes.value[attr] !== undefined);
});

const currentVariant = computed(() => {
  if (!product.value || !product.value.variants) return null;
  return product.value.variants.find((variant) => {
    const attrs = variant.attributes || {};
    for (const [attrName, selectedOptionId] of Object.entries(selectedAttributes.value)) {
      if (String(attrs[attrName]) !== String(selectedOptionId)) return false;
    }
    return true;
  });
});

// ĐÃ FIX: Hàm xử lý Url Ảnh (tự động nối /storage/ chuẩn)
const getFullImage = (path) => {
    if (!path) return soraPlaceholder;
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('storage/')) return `${BACKEND_URL}/${cleanPath}`;
    return `${BACKEND_URL}/storage/${cleanPath}`;
};

const getImageUrl = getFullImage; 

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

const fetchProductData = async () => {
  const productSlug = route.params.slug || route.params.product_slug; 
  if (!productSlug) return isLoading.value = false;
  
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/shop/${shopSlug}/products/${productSlug}`);
    const result = await response.json();

    if (result.success && result.data) {
      product.value = result.data;
      
      if (product.value.variants) {
        product.value.variants.forEach(v => {
          if (typeof v.attributes === 'string') {
            try { v.attributes = JSON.parse(v.attributes); } catch(e) {}
          }
        });
      }

      if (product.value.images) {
        product.value.images = product.value.images.map(img => getImageUrl(img));
        if (product.value.images.length > 0) mainImage.value = product.value.images[0];
      }
      
      selectedAttributes.value = {}; selectedQuantity.value = 1;
      
      saveToRecentlyViewed(product.value);
      fetchRecommendations('related_category');
      startCountdown();
    } 
  } catch (error) { console.error("Lỗi kết nối API:", error); } 
  finally { isLoading.value = false; }
};

const fetchBrands = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/shop/${shopSlug}/brands`);
    const result = await response.json();
    if (result.success && result.data) shopBrands.value = result.data.slice(0, 10);
  } catch (error) { console.error("Lỗi tải thương hiệu:", error); }
};

onMounted(() => {
  loadCompareList(); 
  fetchFavorites(); 
  fetchProductData();
  fetchBrands();
});

watch(() => route.params.slug, (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(timerInterval) clearInterval(timerInterval); 
    fetchProductData();
  }
});

const selectAttribute = (attrName, optionId) => {
  if (selectedAttributes.value[attrName] === optionId) delete selectedAttributes.value[attrName];
  else selectedAttributes.value[attrName] = optionId;
  selectedQuantity.value = 1; 
  if (isAllAttributesSelected.value && currentVariant.value) {
    const variantImage = currentVariant.value.image || currentVariant.value.image_url;
    if (variantImage) {
      setMainImage(getImageUrl(variantImage));
    }
  }
};

const updateQuantity = (delta) => {
  if (!isAllAttributesSelected.value || !currentVariant.value) return Toast.fire({ icon: 'info', title: 'Vui lòng chọn phân loại' });
  let newQty = selectedQuantity.value + delta;
  const stock = currentStock.value;
  if (newQty < 1) newQty = 1;
  if (newQty > stock) { Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' }); newQty = stock; }
  selectedQuantity.value = newQty;
};

const validateQuantity = () => {
  if (!isAllAttributesSelected.value || !currentVariant.value) { Toast.fire({ icon: 'info', title: 'Vui lòng chọn phân loại' }); return selectedQuantity.value = 1; }
  let qty = parseInt(selectedQuantity.value);
  const stock = currentStock.value;
  if (isNaN(qty) || qty < 1) return selectedQuantity.value = 1;
  if (qty > stock) { Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' }); selectedQuantity.value = stock; }
};

const getHeaders = () => {
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let sid = localStorage.getItem('cart_session_id');
  if (!sid && !token) { 
    sid = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sid);
  }
  if (sid) headers['X-Cart-Session-Id'] = sid;
  return headers;
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
  } catch (error) { console.error("Lỗi lưu sản phẩm đã xem:", error); }
};

const fetchRecommendations = async (tab) => {
  activeTab.value = tab;
  isLoadingRecs.value = true;
  recommendedProducts.value = []; 
  
  if (tab === 'viewed') {
    try {
      const viewed = JSON.parse(localStorage.getItem('viewed_products') || '[]');
      recommendedProducts.value = viewed.filter(p => p.id !== product.value?.id);
    } catch (error) {} finally { isLoadingRecs.value = false; }
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
  } catch (error) {} finally { isLoadingRecs.value = false; }
};

const changeRecTab = (tab) => { if (activeTab.value !== tab) fetchRecommendations(tab); };
const scrollRecSlider = (direction) => {
  if (recSliderRef.value) recSliderRef.value.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
};
const goToProduct = (slug) => {
  if (!slug) return;
  router.push({ params: { ...route.params, slug: slug } }).catch(() => window.location.href = `/shop/${shopSlug}/productdetail/${slug}`);
};

const formatMoney = (amount) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';
const setMainImage = (url) => mainImage.value = url;
const handleImageError = (e) => e.target.src = soraPlaceholder;

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

<style>

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
.main-wishlist-btn, .sora-wishlist-btn {
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
}
.main-wishlist-btn { position: absolute; top: 20px; right: 20px; }
.sora-wishlist-btn { position: absolute; top: 15px; right: 15px; }

.main-wishlist-btn:hover, .sora-wishlist-btn:hover {
    transform: scale(1.1);
    color: #cc1e2e;
}
.main-wishlist-btn.active, .sora-wishlist-btn.active { color: #dc3545; }
.main-wishlist-btn.active i, .sora-wishlist-btn.active i { color: #dc3545 !important; }
.main-wishlist-btn i, .sora-wishlist-btn i { font-size: 1.15rem; margin-top: 2px; }

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

/* =========================================
   SORA LUXURY PRODUCT CARD
   ========================================= */
.sora-luxury-card { background: #ffffff; border: 1px solid #f0f0f0; position: relative; display: flex; flex-direction: column; overflow: hidden; transition: all 0.4s ease; cursor: pointer; height: 100%; }
.sora-luxury-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.06); border-color: #e5e5e5; }
.sora-card-image { position: relative; aspect-ratio: 1/1; overflow: hidden; background-color: #fcfcfc; }
.sora-card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.sora-luxury-card:hover .sora-card-image img { transform: scale(1.08); }
.compare-float-btn { position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.8); border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #777; cursor: pointer; z-index: 20; transition: all 0.2s; border-radius: 50%; }
.compare-float-btn:hover, .compare-float-btn.active { color: #fff; background: rgb(159,39,59); }
.sora-card-badges { position: absolute; top: 15px; left: 15px; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
.compare-float-btn ~ .sora-card-badges { top: 55px; } 
.sora-badge { background: #ffffff; color: #222; font-family: 'Oswald', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; padding: 4px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.sora-card-info { padding: 20px 15px 70px 15px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
.sora-card-title { font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; color: #111; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sora-card-category { font-family: 'Playfair Display', serif; font-style: italic; color: #666; font-size: 0.95rem; margin-bottom: 15px; }
.sora-card-price { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #9f273b; margin-top: auto; }
.sora-card-price-old { font-size: 0.95rem; color: #999; text-decoration: line-through; margin-right: 10px; font-weight: 400; }
.sora-card-action { position: absolute; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); z-index: 10; }
.sora-luxury-card:hover .sora-card-action { transform: translateY(0); }
.sora-action-btn { width: 100%; padding: 14px 0; background: #731621; color: #ffffff; border: none; font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.3s ease; }
.sora-action-btn:hover { background: #500f17; }

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

/* CSS SO SÁNH */
.compare-bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding: 15px 20px; z-index: 9999; border-top: 2px solid rgb(159,39,59); }
.compare-inner { max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 20px; }
.compare-info h4 { font-size: 15px; margin-bottom: 2px; color: #333; }
.compare-items { display: flex; gap: 15px; }
.compare-item { width: 60px; height: 60px; border: 1px solid #ddd; border-radius: 6px; position: relative; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
.compare-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.compare-item.empty span { font-size: 24px; color: #ccc; }
.remove-compare { position: absolute; top: -8px; right: -8px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.compare-actions { display: flex; gap: 15px; }
.btn-clear-compare { background: transparent; border: none; text-decoration: underline; color: #777; cursor: pointer; }
.btn-go-compare { background: rgb(159,39,59); color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-go-compare:disabled { background: #ccc; cursor: not-allowed; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 60px) {
  .compare-inner { flex-direction: column; gap: 15px; }
  .compare-actions { width: 100%; justify-content: space-between; }
  .btn-go-compare { flex: 1; margin-left: 15px; }
}

.compare-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.compare-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.compare-modal-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; }
.compare-modal-header h3 { font-size: 18px; margin: 0; color: #222; font-weight: 600; white-space: nowrap;}
.header-search-wrap { display: flex; align-items: center; gap: 15px; flex: 1; justify-content: flex-end; }
.modal-search-input { padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 13px; width: 100%; max-width: 250px; transition: border-color 0.3s, box-shadow 0.3s; }
.modal-search-input:focus { border-color: rgb(159,39,59); box-shadow: 0 0 5px rgba(159,39,59,0.2); }
.close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: #888; transition: color 0.2s;}
.close-btn:hover { color: rgb(159,39,59); }
.compare-modal-body { padding: 20px 25px; overflow-y: auto; flex: 1; }
.compare-modal-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
.compare-suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.suggestion-card { border: 1px solid #eee; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; }
.suggestion-card:hover { border-color: rgb(159,39,59); transform: translateY(-3px); }
.suggestion-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; background: #f9f9f9;}
.suggestion-info { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; }
.suggestion-name { font-size: 13px; font-weight: 500; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #333; line-height: 1.4;}
.suggestion-price { font-size: 14px; font-weight: 600; color: rgb(159,39,59); margin-bottom: 10px; }
.btn-add-suggestion { background: transparent; border: 1px solid rgb(159,39,59); color: rgb(159,39,59); padding: 6px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; width: 100%; }
.btn-add-suggestion:hover { background: rgb(159,39,59); color: #fff; }
.btn-add-suggestion.is-added { background: rgb(159,39,59); color: #fff; }
.compare-modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 15px; background: #fdfdfd; border-radius: 0 0 12px 12px; }
.btn-outline { background: transparent; border: 1px solid #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #555; font-weight: 600; transition: background 0.2s; }
.btn-outline:hover { background: #eee; }
.btn-primary { background: rgb(159,39,59); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600; transition: opacity 0.2s; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }

/* ĐÃ THÊM: CSS phục hồi cho Tab Gợi ý & Yêu thích Modal So Sánh */
.compare-modal-tabs { display: flex; border-bottom: 1px solid #eee; background: #fafafa; }
.compare-modal-tabs button { flex: 1; padding: 12px 15px; background: transparent; border: none; font-size: 14px; font-weight: 600; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
.compare-modal-tabs button.active { color: #9f273b; border-bottom-color: #9f273b; background: #fff; }
.compare-modal-tabs button:hover:not(.active) { background: #f0f0f0; }
.not-logged-in-msg, .empty-msg { text-align: center; padding: 40px 20px; color: #888; font-style: italic; }

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
</style>