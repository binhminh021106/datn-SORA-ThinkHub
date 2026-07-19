<template>
    <section class="blog-page">
        <!-- banner tin tức đầu trang -->
        <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
            <div class="banner-ambient"></div>
            <div class="banner-glow banner-glow-left"></div>
            <div class="banner-glow banner-glow-right"></div>
            <div class="banner-monogram font-serif">SORA MAGAZINE</div>
            <div class="banner-line-art banner-line-art-left"></div>
            <div class="banner-line-art banner-line-art-right"></div>

            <div class="position-relative z-index-2 text-center px-3 banner-content d-flex flex-column align-items-center">
                <p class="text-champagne font-oswald tracking-widest mb-2 text-uppercase small">
                    <i class="bi bi-journal-text me-2"></i>SORA MAGAZINE
                </p>
                <h1 class="display-3 fw-bold font-serif mb-2 text-gold-gradient text-uppercase" v-if="searchQuery">TÌM KIẾM: "{{ searchQuery }}"</h1>
                <h1 class="display-3 fw-bold font-serif mb-2 text-gold-gradient text-uppercase" v-else-if="authorQuery">TÁC GIẢ: "{{ authorQuery }}"</h1>
                <h1 class="display-3 fw-bold font-serif mb-2 text-gold-gradient text-uppercase" v-else-if="categoryQuery">DANH MỤC: "{{ categoryQuery }}"</h1>
                <h1 class="display-3 fw-bold font-serif mb-2 text-gold-gradient text-uppercase" v-else>SORA BLOG</h1>
                <div class="d-flex align-items-center justify-content-center mb-3">
                  <svg width="120" height="15" viewBox="0 0 150 20" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.9;">
                    <path d="M10 10h40m50 0h40M65 10c0-3 4-5 10-5s10 2 10 5-4 5-10 5-10-2-10-5z" stroke="#e7ce7d" stroke-width="1.5" fill="none" />
                  </svg>
                </div>
                <p class="banner-subtitle fw-light fs-5 mb-0 font-serif text-white-50 d-none d-md-block" style="max-width: 800px; margin: 0 auto;">
                    Khám phá xu hướng trang sức & bí quyết làm đẹp tinh tế mỗi ngày.
                </p>
            </div>
        </section>

        <main class="page-container container">
            <SoraBlogSkeleton v-if="isLoading" class="fade-in" />

            <!-- Dữ liệu thực tế -->
            <div v-else class="page-layout fade-in" :class="{ 'opacity-50': isFetching }">
                <section class="content-column">
                    <!-- Trạng thái trống -->
                    <div v-if="allLatestPosts.length === 0" class="empty-state card-style">
                        <i class="bi bi-newspaper display-4 text-muted mb-3"></i>
                        <h3 class="text-main" v-if="searchQuery">Không tìm thấy kết quả cho "{{ searchQuery }}"</h3>
                        <h3 class="text-main" v-else-if="authorQuery">Không tìm thấy bài viết của "{{ authorQuery }}"</h3>
                        <h3 class="text-main" v-else-if="categoryQuery">Chưa có bài viết trong "{{ categoryQuery }}"</h3>
                        <h3 class="text-main" v-else>Chưa có tin tức nào</h3>
                        <p class="text-muted">Vui lòng thử lại với từ khóa khác hoặc quay lại sau.</p>
                        <button v-if="isSearching" @click="clearSearch"
                            class="btn btn-outline-main rounded-pill px-4 py-2 mt-3 fw-bold">Xem tất cả bài viết</button>
                    </div>

                    <template v-else>
                        <h3 class="featured-heading text-main font-serif" v-if="featuredPost">
                            <i class="bi bi-bullseye me-2 text-accent"></i>
                            {{ isSearching ? 'Kết quả nổi bật' : 'Tin tức nổi bật' }}
                        </h3>

                        <!-- Bài viết nổi bật (Chỉ hiện ở trang 1) -->
                        <article v-if="featuredPost" class="featured-post card-style product-card">
                            <div class="featured-image-wrap img-zoom-wrapper overflow-hidden">
                                <router-link
                                    :to="{ name: 'PostDetailt', params: { slug: featuredPost.slug || toSlug(featuredPost.title) } }"
                                    class="full-link d-block h-100 w-100">
                                    <div class="featured-image h-100 w-100"
                                        :style="{ backgroundImage: `url(${getFullImage(featuredPost.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                                        <div class="cat-badge font-oswald text-uppercase" v-if="featuredPost.category">{{ featuredPost.category }}
                                        </div>
                                    </div>
                                </router-link>
                            </div>
                            <div class="featured-body bg-white">
                                <div class="d-flex align-items-center mb-3">
                                    <span class="badge-custom me-2 font-oswald" v-if="isSearching">KẾT QUẢ TÌM KIẾM</span>
                                    <span class="badge-custom me-2 font-oswald" v-else>MỚI NHẤT</span>
                                    <span class="date-meta fw-medium"><i class="bi bi-calendar3 text-accent me-1"></i>
                                        {{ formatDate(featuredPost.created_at) }}</span>
                                </div>

                                <h2 class="featured-title font-serif fw-bold">
                                    <router-link
                                        :to="{ name: 'PostDetailt', params: { slug: featuredPost.slug || toSlug(featuredPost.title) } }"
                                        class="text-reset text-decoration-none hover-primary">
                                        {{ featuredPost.title }}
                                    </router-link>
                                </h2>
                                <p class="excerpt fw-light" style="text-align: justify;">{{ getExcerpt(featuredPost, 180) }}</p>

                                <div class="post-footer">
                                    <span class="author fw-medium">
                                        <i class="bi bi-person-circle text-accent me-1"></i>
                                        <a href="#"
                                            @click.prevent="searchByAuthor(featuredPost.author_name || 'SORA Admin')"
                                            class="author-link">
                                            {{ featuredPost.author_name || 'SORA Admin' }}
                                        </a>
                                    </span>
                                    <router-link
                                        :to="{ name: 'PostDetailt', params: { slug: featuredPost.slug || toSlug(featuredPost.title) } }"
                                        class="read-more-btn font-oswald text-uppercase tracking-widest text-sora-primary">
                                        Đọc tiếp <i class="bi bi-arrow-right ms-2 fs-6"></i>
                                    </router-link>
                                </div>
                            </div>
                        </article>

                        <!-- Lưới bài viết khác -->
                        <div v-if="paginatedPosts.length > 0" class="latest-section" id="latest-news-section">
                            <h3 class="section-heading text-main font-serif">
                                <i class="bi bi-grid-fill me-2 text-accent"></i> {{ isSearching ? 'Các kết quả khác' : 'Tin mới cập nhật' }}
                            </h3>

                            <div class="latest-posts-grid">
                                <NewsPostCard v-for="post in paginatedPosts" :key="post.id" :post="post" />
                            </div>

                            <!-- Phân trang API bằng Laravel Paginator -->
                            <div v-if="totalPages > 1" class="pagination-wrapper">
                                <button class="page-btn prev" :disabled="currentPage === 1"
                                    @click="changePage(currentPage - 1)">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                                <div class="page-numbers">
                                    <button v-for="page in totalPages" :key="page" class="page-btn fw-bold font-oswald"
                                        :class="{ active: currentPage === page }" @click="changePage(page)">
                                        {{ page }}
                                    </button>
                                </div>
                                <button class="page-btn next" :disabled="currentPage === totalPages"
                                    @click="changePage(currentPage + 1)">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </section>

                <!-- Sidebar -->
                <aside class="sidebar-column custom-scrollbar" :style="{ top: sidebarTop, maxHeight: 'calc(100vh - ' + sidebarTop + ' - 20px)', overflowY: 'auto' }">
                    <!-- Widget Tìm kiếm -->
                    <div class="sidebar-widget search-widget border-light-subtle shadow-sm bg-white">
                        <h4 class="font-serif text-main"><i class="bi bi-search me-2 text-accent"></i> Tìm kiếm</h4>
                        <div class="search-box">
                            <input type="text" v-model="searchInput" @input="handleSearchInput" @keyup.enter="executeSearch" placeholder="Nhập từ khóa..." class="font-inter">
                            <button @click="executeSearch" class="bg-main"><i class="bi bi-search"></i></button>
                        </div>

                        <div v-if="authorQuery"
                            class="alert bg-light-custom border border-main text-main mt-3 py-2 px-3 d-flex justify-content-between align-items-center small rounded">
                            <span>Tác giả: <strong class="font-serif">{{ authorQuery }}</strong></span>
                            <button @click="clearSearch" class="btn-close ms-2" aria-label="Close"></button>
                        </div>
                        <div v-if="categoryQuery"
                            class="alert bg-light-custom border border-main text-main mt-3 py-2 px-3 d-flex justify-content-between align-items-center small rounded">
                            <span>Danh mục: <strong class="font-serif">{{ categoryQuery }}</strong></span>
                            <button @click="clearSearch" class="btn-close ms-2" aria-label="Close"></button>
                        </div>
                    </div>

                    <!-- Widget Danh mục -->
                    <div class="sidebar-widget category-widget border-light-subtle shadow-sm bg-white">
                        <h4 class="font-serif text-main"><i class="bi bi-tags-fill me-2 text-accent"></i> Danh mục</h4>
                        <ul>
                            <li v-for="cat in CATEGORIES" :key="cat.name">
                                <a href="#" @click.prevent="searchByCategory(cat.name)"
                                    :class="{ 'active-cat': categoryQuery === cat.name }">
                                    <i class="bi me-2 text-accent" :class="cat.icon || 'bi-caret-right-fill'"></i> {{ cat.name }}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Widget Phổ biến -->
                    <div class="sidebar-widget popular-widget border-light-subtle shadow-sm bg-white">
                        <h4 class="font-serif text-main"><i class="bi bi-star-fill me-2 text-accent"></i> Phổ biến nhất</h4>

                        <div v-if="!popularPosts || popularPosts.length === 0" class="text-center py-3 text-muted small">
                            Chưa có dữ liệu nổi bật
                        </div>

                        <div v-for="(post, index) in popularPosts" :key="post?.id || index"
                            class="popular-post-item product-card p-2 rounded">
                            <div class="flex-shrink-0 img-zoom-wrapper rounded border overflow-hidden"
                                style="width: 70px; height: 60px;">
                                <img :src="getFullImage(post?.image_url)" @error="handleImageError"
                                    class="w-100 h-100 object-fit-cover bg-light transition-transform duration-700 group-hover-scale">
                            </div>

                            <div class="flex-grow-1 ms-3">
                                <router-link
                                    :to="{ name: 'PostDetailt', params: { slug: post?.slug || toSlug(post?.title) } }"
                                    class="text-reset text-decoration-none product-title-link">
                                    <p class="product-title font-serif fw-bold text-dark m-0 lh-base" style="font-size: 0.95rem;">{{ post?.title }}</p>
                                </router-link>
                                <span class="post-meta-small d-block mt-1">
                                    <i class="bi bi-eye text-accent"></i> {{ formatViews(post?.views) }} lượt xem
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Widget Đăng ký -->
                    <div
                        class="sidebar-widget support-box mt-4 border-light-subtle shadow-sm bg-light-custom text-center">
                        <i class="bi bi-envelope-paper-fill fs-1 text-main mb-2 d-block"></i>
                        <h5 class="fw-bold font-serif text-main mb-2">Đăng ký nhận tin</h5>
                        <p class="text-muted small mb-3 fw-light">Đừng bỏ lỡ các kiến thức và ưu đãi trang sức mới nhất từ SORA.</p>
                        <button class="btn btn-main w-100 rounded-pill fw-bold font-oswald tracking-widest text-uppercase">Đăng ký ngay</button>
                    </div>
                </aside>
            </div>
        </main>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import NewsPostCard from '@/components/ui/NewsPostCard.vue';
import SoraBlogSkeleton from '@/components/ui/SoraBlogSkeleton.vue';
import { API_BASE_URL, getStorageUrl } from '@/utils/env';

// --- CONFIG ---
// Tăng số lượng tải lên 7 để chừa 1 bài nổi bật và đúng 6 bài ở phần danh sách lưới bên dưới
const ITEMS_PER_PAGE = 7;
const SITE_NAME = 'SORA Jewelry';

const CATEGORIES = [
    { name: 'Xu hướng trang sức', icon: 'bi-star' },
    { name: 'Bí quyết chọn trang sức', icon: 'bi-cpu' },
    { name: 'Trang sức theo dịp', icon: 'bi-tools' },
    { name: 'Kiến thức đá quý & kim loại', icon: 'bi-gift' }
];

// --- STATE ---
const searchInput = ref(''); 
const searchQuery = ref(''); 
const authorQuery = ref('');
const categoryQuery = ref('');
const currentPage = ref(1);

// --- TANSTACK QUERY: FETCH NEWS CHÍNH ---
const fetchNews = async ({ queryKey }) => {
    const [_key, page, q, author, category] = queryKey;
    
    const params = { page, per_page: ITEMS_PER_PAGE };
    if (q) params.q = q;
    if (author) params.author = author;
    if (category) params.category = category;

    const { data } = await axios.get(`${API_BASE_URL}/news`, { params });
    return data.data; 
};

const { data: newsPaginator, isLoading, isFetching } = useQuery({
    queryKey: ['newsList', currentPage, searchQuery, authorQuery, categoryQuery],
    queryFn: fetchNews,
    placeholderData: keepPreviousData, 
    staleTime: 5 * 60 * 1000, 
});

// --- TANSTACK QUERY: POPULAR NEWS ---
const fetchPopular = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/news/popular`);
    return data.data;
};

const { data: popularPosts } = useQuery({
    queryKey: ['popularNews'],
    queryFn: fetchPopular,
    staleTime: 10 * 60 * 1000,
});

// --- COMPUTED FROM QUERY DATA ---
const isSearching = computed(() => !!searchQuery.value || !!authorQuery.value || !!categoryQuery.value);
const allLatestPosts = computed(() => newsPaginator.value?.data || []);
const totalPages = computed(() => newsPaginator.value?.last_page || 1);

const featuredPost = computed(() => {
    if (currentPage.value === 1 && allLatestPosts.value.length > 0) {
        return allLatestPosts.value[0];
    }
    return null;
});

const paginatedPosts = computed(() => {
    if (featuredPost.value) {
        return allLatestPosts.value.slice(1);
    }
    return allLatestPosts.value;
});

// --- HELPER METHODS ---
const soraPlaceholder = '/Sora-placeholder.png';

const toSlug = (str) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/(\s+)/g, '-');
    str = str.replace(/^-+/g, '');
    str = str.replace(/-+$/g, '');
    return str;
};

const formatViews = (count) => {
    if (!count) return 0;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getFullImage = (path) => {
    return getStorageUrl(path, soraPlaceholder);
};

const handleImageError = (e) => { e.target.src = soraPlaceholder; };

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

const getExcerpt = (post, length = 180) => {
    if (post.excerpt) return post.excerpt;
    return 'Chưa có mô tả...';
};

const updateListingSeo = () => {
    document.title = `Tin tức & Xu hướng trang sức - ${SITE_NAME}`;
};

// --- ACTIONS ---
let debounceTimer = null;
const handleSearchInput = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery.value = searchInput.value;
        authorQuery.value = ''; 
        categoryQuery.value = '';
        currentPage.value = 1; 
    }, 500);
};

const executeSearch = () => {
    searchQuery.value = searchInput.value;
    authorQuery.value = ''; 
    categoryQuery.value = '';
    currentPage.value = 1;
};

const searchByAuthor = (authorName) => {
    searchInput.value = ''; searchQuery.value = ''; categoryQuery.value = ''; 
    authorQuery.value = authorName;
    currentPage.value = 1;
};

const searchByCategory = (catName) => {
    searchInput.value = ''; searchQuery.value = ''; authorQuery.value = ''; 
    categoryQuery.value = catName;
    currentPage.value = 1;
};

const clearSearch = () => {
    searchInput.value = ''; searchQuery.value = ''; authorQuery.value = ''; categoryQuery.value = '';
    currentPage.value = 1;
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        const listSection = document.getElementById('latest-news-section');
        if (listSection) listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const sidebarTop = ref('100px');
let lastScrollY = 0;
let isHeaderHidden = false;

const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 200) {
        if (currentScrollY > lastScrollY && !isHeaderHidden) {
            isHeaderHidden = true;
        } else if (currentScrollY < lastScrollY && isHeaderHidden) {
            isHeaderHidden = false;
        }
    } else {
        isHeaderHidden = false;
    }
    sidebarTop.value = isHeaderHidden ? '20px' : '100px';
    lastScrollY = currentScrollY;
};

onMounted(() => {
    updateListingSeo();
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Oswald:wght@400;500;600;700&display=swap');


:root {
    --primary: #9f273b;
    --primary-dark: #cc1e2e;
    --accent: #e7ce7d;
    --text-dark: #2c2c2c;
    --bg-light: #faf9f8;
}
</style>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Oswald:wght@400;500;600;700&display=swap');


.bg-light-custom { background-color: var(--bg-light) !important; }
.bg-main { background-color: var(--primary) !important; }
.text-main { color: var(--primary) !important; }
.text-accent { color: var(--accent) !important; }
.text-sora-primary { color: #9f273b !important; }
.border-main { border-color: var(--primary) !important; }
.tracking-widest { letter-spacing: 1px; }

/* Các thành phần cơ bản */
.btn-main { background-color: var(--primary); color: white; border: 1px solid var(--primary); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.btn-main:hover { background-color: var(--primary-dark); border-color: var(--primary-dark); color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }
.btn-outline-main { color: var(--primary); border: 1px solid var(--primary); background: transparent; transition: all 0.2s ease; }
.btn-outline-main:hover { background-color: var(--primary); color: white; }

.object-fit-cover { object-fit: cover !important; }
.font-inter { font-family: 'Manrope', sans-serif; }
.font-serif { font-family: 'Josefin Sans', sans-serif !important; }
.font-oswald { font-family: "Oswald", sans-serif !important; }
.tracking-wide { letter-spacing: 0.1em; }

/* Badge hiển thị trên ảnh nổi bật */
.cat-badge { position: absolute; top: 20px; left: 20px; background: rgba(159, 39, 59, 0.95); color: white; padding: 6px 18px; font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; border-radius: 4px; z-index: 2; }

/* Link tác giả */
.author-link { color: var(--text-dark); text-decoration: none; transition: color 0.2s; }
.author-link:hover { color: var(--primary); text-decoration: underline; }

/* Giao diện Page */
.blog-page { font-family: 'Manrope', sans-serif; background-color: var(--bg-light); min-height: 100vh; color: var(--text-dark); display: flex; flex-direction: column; }
.text-reset { text-decoration: none; color: inherit; transition: color 0.2s; }

h1, h2, h3, h4, h5, h6 { font-family: 'Manrope', sans-serif; font-weight: 700; color: var(--text-dark); }
.hover-primary:hover { color: #9f273b !important;}

/* Hero Banner (Sora Banner Style) */
.text-champagne { color: #ead089 !important; }
.z-index-2 { z-index: 2; }

.sora-banner {
  min-height: 340px;
  background:
    linear-gradient(135deg, rgba(54, 6, 17, 0.98), rgba(114, 20, 38, 0.96) 48%, rgba(74, 9, 24, 0.98)),
    repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 14px);
  isolation: isolate;
}

.sora-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 236, 189, 0.2), transparent 42%),
    linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 44%, transparent 64%);
  opacity: 0.9;
  z-index: 0;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 68%);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow-left { left: -120px; bottom: -150px; }
.banner-glow-right { right: -100px; top: -120px; }

.banner-monogram {
  position: absolute;
  inset: auto 0 52px;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
}

.banner-content { max-width: 850px; }

.banner-content h1 {
  letter-spacing: 0;
  line-height: 1.05;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.32);
}

.banner-subtitle {
  color: rgba(255, 248, 231, 0.9);
  line-height: 1.75;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.banner-line-art {
  position: absolute;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  transform: rotate(45deg);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left { left: 8%; top: 24%; }
.banner-line-art-right { right: 8%; bottom: 22%; }

/* Layout Grid */
.page-container { margin: 50px auto; flex-grow: 1; }
.page-layout { display: grid; grid-template-columns: 1fr 340px; gap: 48px; align-items: start; position: relative; transition: opacity 0.3s; }
.card-style { background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04); overflow: hidden; }
.empty-state { padding: 60px 0; text-align: center; grid-column: 1 / -1; }

/* Bài nổi bật (Featured Post) */
.featured-heading { font-size: 1.6rem; margin-bottom: 20px; display: flex; align-items: center; padding-bottom: 10px; border-bottom: 2px solid var(--accent); }
.featured-post { display: flex; flex-direction: row; min-height: 400px; margin-bottom: 50px; }
.featured-image-wrap { width: 60%; position: relative; display: flex; border-radius: 12px 0 0 12px; }
.featured-image { transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.featured-post:hover .featured-image { transform: scale(1.08); }
.featured-body { width: 40%; padding: 40px; display: flex; flex-direction: column; justify-content: center; }

.badge-custom { background-color: var(--primary); color: white; padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; letter-spacing: 1px; font-weight: 700; }
.date-meta { font-size: 0.85rem; color: #888; }
.featured-title { font-size: 1.8rem; line-height: 1.3; margin-bottom: 15px; }
.excerpt { color: #666; margin-bottom: 25px; line-height: 1.6; font-size: 1rem; }
.post-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; border-top: 1px solid #eee; padding-top: 15px; }
.read-more-btn { color: var(--primary); font-weight: 700; text-decoration: none; display: flex; align-items: center; transition: transform 0.2s; }
.read-more-btn:hover { transform: translateX(5px); color: #cc1e2e;}

/* Các bài mới cập nhật (Lưới) */
.section-heading { font-size: 1.4rem; margin-bottom: 25px; display: flex; align-items: center; }
.latest-posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }

/* ==================================
   Hiệu ứng Hover SORA Brand chung
================================== */
.product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; border-bottom: 2px solid transparent !important; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .08) !important; border-bottom: 2px solid var(--accent) !important; }
.img-zoom-wrapper img { transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.product-card:hover .img-zoom-wrapper img { transform: scale(1.08); }

.product-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-title-link { transition: color 0.3s ease; }
.product-card:hover .product-title, .product-title-link:hover .product-title { color: var(--primary) !important; }

/* Sidebar Widgets */
.sidebar-column { display: flex; flex-direction: column; gap: 30px; position: sticky; transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-widget { padding: 25px; border-radius: 12px; }
.sidebar-widget h4 { border-bottom: 1px dashed #ccc; padding-bottom: 15px; display: flex; align-items: center; }

.search-box { display: flex; gap: 8px; }
.search-box input { flex-grow: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 8px; outline: none; background: #fff; transition: border 0.2s; }
.search-box input:focus { border-color: var(--primary); }
.search-box button { color: white; border: none; width: 45px; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
.search-box button:hover { background: var(--primary-dark); }

.category-widget ul { list-style: none; padding: 0; margin: 0; }
.category-widget li { margin-bottom: 8px; }
.category-widget a { text-decoration: none; color: var(--text-dark); font-weight: 500; padding: 8px 10px; border-radius: 6px; display: flex; align-items: center; transition: all 0.2s; }
.category-widget a:hover, .category-widget a.active-cat { background-color: rgba(159, 39, 59, 0.08); color: var(--primary); padding-left: 15px; }

/* Popular Posts */
.popular-post-item { display: flex; align-items: center; margin-bottom: 15px; cursor: pointer; }
.popular-post-item:last-child { margin-bottom: 0; }
.post-meta-small { font-size: 0.8rem; color: #888; }

/* Pagination */
.pagination-wrapper { display: flex; justify-content: center; align-items: center; margin-top: 40px; gap: 15px; }
.page-numbers { display: flex; gap: 8px; }
.page-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; background: #FFFFFF; border-radius: 8px; color: var(--text-dark); cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.page-btn:disabled { background: var(--bg-light); color: #ccc; cursor: not-allowed; border-color: #eee; }

/* Responsive */
@media (max-width: 992px) {
    .page-layout { grid-template-columns: 1fr; gap: 40px; }
    .featured-post { flex-direction: column; min-height: auto; }
    .featured-image-wrap { width: 100%; height: 250px; border-radius: 12px 12px 0 0; }
    .featured-body { width: 100%; padding: 25px; border-radius: 0 0 12px 12px; }
    .featured-title { font-size: 1.5rem; }
    .sidebar-column { order: 1; }
    
    .sora-banner { min-height: 340px; }
    .banner-line-art { opacity: 0.45; }
}

@media (max-width: 768px) {
    .sora-banner { min-height: 160px; }
    .banner-content h1 { font-size: clamp(1.1rem, 4.5vw, 1.4rem) !important; white-space: normal; margin-bottom: 0 !important; }
    .banner-content p.text-champagne { margin-bottom: 0.25rem !important; font-size: 0.75rem; }
    .banner-subtitle { font-size: 0.9rem !important; }
    .banner-line-art { display: none; }
    .banner-monogram {
        bottom: 10px;
        font-size: 1.8rem;
        white-space: nowrap;
    }
}

.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
