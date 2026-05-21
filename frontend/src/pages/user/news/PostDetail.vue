<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

// --- CONFIG ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
const soraPlaceholder = '/Sora-placeholder.png'; 

// --- HELPER METHODS ---
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

const getFullImage = (path) => {
    if (!path) return soraPlaceholder;
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('storage/')) {
        cleanPath = cleanPath.substring(8);
    }
    return `${STORAGE_URL}/${cleanPath}`;
};

const handleImageError = (e) => { e.target.src = soraPlaceholder; };

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
};

const updateSeoTags = (postData) => {
    if (!postData) return;
    const title = postData.meta_title || postData.title;
    document.title = title;

    const setMetaTag = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const setOpenGraphTag = (property, content) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const desc = postData.meta_description || postData.excerpt || postData.sapo || '';
    setMetaTag('description', desc);
    if (postData.meta_keywords) setMetaTag('keywords', postData.meta_keywords);

    setOpenGraphTag('og:title', title);
    setOpenGraphTag('og:description', desc);
    setOpenGraphTag('og:image', getFullImage(postData.image_url));
    setOpenGraphTag('og:url', window.location.href);
    setOpenGraphTag('og:type', 'article');
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã copy link bài viết!', showConfirmButton: false, timer: 1500 });
    });
};

// --- DATA FETCHING (TANSTACK QUERY) ---
const currentSlug = computed(() => route.params.slug);

const fetchPostDetail = async ({ queryKey }) => {
    const [_key, slug] = queryKey;
    const response = await axios.get(`${API_BASE_URL}/news/${slug}`);
    return response.data.data;
};

// 1. QUERY CHI TIẾT BÀI VIẾT (TÍCH HỢP BẮT CACHE ĐỂ HIỂN THỊ TỨC THÌ)
const { data: rawPost, isLoading: isPostLoading, isFetching: isPostFetching, isError } = useQuery({
    queryKey: ['postDetail', currentSlug],
    queryFn: fetchPostDetail,
    enabled: !!currentSlug.value,
    staleTime: 5 * 60 * 1000, // Cache chi tiết 5 phút
    placeholderData: () => {
        // MA THUẬT Ở ĐÂY: Tìm kiếm bài viết này trong Cache của trang Danh Sách (đã tải trước đó)
        let found = null;
        
        // Tìm trong cache danh sách NewsList
        const queries = queryClient.getQueriesData({ queryKey: ['newsList'] });
        for (const [key, data] of queries) {
            if (data && data.data) {
                found = data.data.find(p => p.slug === currentSlug.value || toSlug(p.title) === currentSlug.value);
                if (found) break;
            }
        }
        
        // Nếu không có, thử tìm trong cache Popular News
        if (!found) {
            const popular = queryClient.getQueryData(['popularNews']);
            if (popular) {
                found = popular.find(p => p.slug === currentSlug.value || toSlug(p.title) === currentSlug.value);
            }
        }

        if (found) {
            // Trả về dữ liệu tìm thấy, đính kèm cờ `isPartial: true` báo hiệu thiếu Content
            return { ...found, isPartial: true };
        }
        return undefined;
    }
});

// 2. FETCH CÁC BÀI VIẾT LIÊN QUAN (Lấy 6 bài mới nhất bỏ qua bài hiện tại)
const fetchRelatedPosts = async () => {
    const response = await axios.get(`${API_BASE_URL}/news`, { params: { per_page: 6 }});
    return response.data.data.data || response.data.data || [];
};

const { data: relatedPostsRaw, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['relatedNews', currentSlug],
    queryFn: fetchRelatedPosts,
    enabled: !!currentSlug.value,
    staleTime: 10 * 60 * 1000,
});

// --- COMPUTED FORMATTING ---
const post = computed(() => {
    if (!rawPost.value) return null;
    const data = rawPost.value;
    return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        author: {
            name: data.author_name || 'Admin',
            avatar: data.author_name ? `https://ui-avatars.com/api/?name=${data.author_name}&background=9f273b&color=fff` : soraPlaceholder,
            role: "Tác giả"
        },
        created_at: data.created_at,
        category: data.category || "Tin tức",
        view_count: data.views || 0,
        thumbnail: getFullImage(data.image_url),
        sapo: data.excerpt || '',
        content: data.content || '',
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        image_url: data.image_url,
        isPartial: !!data.isPartial // Cờ xác định dữ liệu này lấy từ cache ngoài index hay là dữ liệu thật
    };
});

const relatedPosts = computed(() => {
    if (!relatedPostsRaw.value) return [];
    return relatedPostsRaw.value
        .filter(item => item.id !== rawPost.value?.id)
        .slice(0, 5)
        .map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug, 
            image: getFullImage(item.image_url),
            created_at: item.created_at
        }));
});

// --- WATCHERS ---
watch(() => rawPost.value, (newData) => {
    // Chỉ cập nhật SEO khi bài viết đã tải xong Full Content (tránh đè SEO rác)
    if (newData && !newData.isPartial) {
        updateSeoTags(post.value);
    }
}, { immediate: true });

watch(currentSlug, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
    <div class="post-detail-page bg-light-custom pb-5">

        <!-- HIỆU ỨNG SKELETON KHI LOAD LẦN ĐẦU (Không có Cache) -->
        <div v-if="isPostLoading" class="container py-4 fade-in">
            <div class="skeleton-box skeleton-text w-25 mb-4 shimmer py-3"></div>

            <div class="row my-4">
                <div class="col-lg-8 pe-lg-5">
                    <div class="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle">
                        <div class="skeleton-box skeleton-text w-25 mb-3 shimmer"></div>
                        <div class="skeleton-box skeleton-title w-100 mb-2 shimmer" style="height: 40px;"></div>
                        <div class="skeleton-box skeleton-title w-75 mb-4 shimmer" style="height: 40px;"></div>
                        
                        <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                            <div class="skeleton-box rounded-circle shimmer me-3" style="width: 40px; height: 40px;"></div>
                            <div class="skeleton-box skeleton-text w-25 shimmer"></div>
                            <div class="skeleton-box skeleton-text w-25 ms-4 shimmer"></div>
                        </div>

                        <div class="p-4 bg-light-custom rounded-3 mb-4 border-start border-4 border-light">
                            <div class="skeleton-box skeleton-text w-100 mb-2 shimmer"></div>
                            <div class="skeleton-box skeleton-text w-75 shimmer"></div>
                        </div>

                        <div class="skeleton-box w-100 rounded-4 mb-5 shimmer" style="height: 450px;"></div>

                        <div v-for="i in 6" :key="i" class="skeleton-box skeleton-text w-100 mb-3 shimmer"></div>
                        <div class="skeleton-box skeleton-text w-50 mb-5 shimmer"></div>
                        
                        <div class="d-flex align-items-center bg-light-custom p-4 rounded-4 mt-5 border border-light-subtle">
                            <div class="skeleton-box rounded-circle shimmer me-4" style="width: 80px; height: 80px;"></div>
                            <div class="flex-grow-1">
                                <div class="skeleton-box skeleton-title w-50 mb-2 shimmer"></div>
                                <div class="skeleton-box skeleton-text w-75 shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 mt-5 mt-lg-0">
                    <div class="bg-white p-4 rounded-4 shadow-sm border border-light-subtle mb-4">
                        <div class="skeleton-box skeleton-title w-50 mb-4 shimmer"></div>
                        <div v-for="i in 4" :key="i" class="d-flex mb-4">
                            <div class="skeleton-box rounded shimmer flex-shrink-0" style="width: 90px; height: 70px;"></div>
                            <div class="ms-3 flex-grow-1 d-flex flex-column justify-content-center">
                                <div class="skeleton-box skeleton-text w-100 mb-2 shimmer"></div>
                                <div class="skeleton-box skeleton-text w-75 shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="isError || !post" class="container py-5 text-center">
            <h2 class="font-serif">Không tìm thấy bài viết</h2>
            <p class="text-muted">Bài viết bạn đang tìm kiếm không tồn tại hoặc đường dẫn không hợp lệ.</p>
            <router-link :to="{ name: 'news' }" class="btn btn-main px-4 py-2 mt-3 font-oswald text-uppercase tracking-widest rounded-pill">Quay lại trang tin tức</router-link>
        </div>

        <!-- HIỂN THỊ DỮ LIỆU TỪ CACHE HOẶC DATA THẬT -->
        <div v-else class="fade-in">
            <!-- Breadcrumb -->
            <div class="bg-white py-2 border-bottom shadow-sm">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0 text-small fw-medium">
                            <li class="breadcrumb-item">
                                <router-link to="/" class="text-reset text-decoration-none back-link hover-underline">Trang chủ</router-link>
                            </li>
                            <li class="breadcrumb-item">
                                <router-link :to="{ name: 'news' }" class="text-reset text-decoration-none back-link hover-underline">Tin tức</router-link>
                            </li>
                            <li class="breadcrumb-item active text-truncate text-main" style="max-width: 300px;" aria-current="page">{{ post.title }}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div class="container my-5">
                <div class="row">

                    <!-- Nội dung bài viết -->
                    <div class="col-lg-8 pe-lg-5">
                        <article class="article-container bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle position-relative">
                            
                            <!-- Indicator nhỏ góc phải báo hiệu đang update ngầm -->
                            <div v-if="post.isPartial && isPostFetching" class="position-absolute top-0 end-0 m-4 d-flex align-items-center text-muted small">
                                <div class="spinner-border spinner-border-sm text-main me-2" role="status"></div>
                                Đang tải nội dung...
                            </div>

                            <header class="article-header mb-4">
                                <span class="badge bg-main mb-3 px-3 py-2 fs-6 shadow-sm font-oswald tracking-widest" v-if="post.category">{{ post.category }}</span>
                                <h1 class="article-title text-main">{{ post.title }}</h1>

                                <div class="article-meta d-flex align-items-center mt-4 text-muted border-bottom pb-3 flex-wrap gap-3">
                                    <div class="d-flex align-items-center">
                                        <img :src="post.author.avatar" @error="handleImageError" alt="Author" class="rounded-circle me-2 shadow-sm border object-fit-cover" width="40" height="40">
                                        <span>Bởi <strong class="text-dark">{{ post.author.name }}</strong></span>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-clock me-2 text-main"></i> {{ formatDate(post.created_at) }}
                                    </div>
                                    <div v-if="post.view_count >= 0" class="d-flex align-items-center">
                                        <i class="bi bi-eye me-2 text-main"></i> {{ post.view_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }} lượt xem
                                    </div>
                                </div>
                            </header>

                            <div v-if="post.sapo" class="article-sapo p-4 bg-light-custom rounded-3 mb-4 fst-italic border-start border-4 border-main fw-medium text-secondary">
                                {{ post.sapo }}
                            </div>

                            <figure class="figure w-100 mb-5">
                                <img :src="post.thumbnail" @error="handleImageError" class="figure-img img-fluid rounded-4 w-100 shadow-sm object-fit-cover" alt="Thumbnail" style="max-height: 500px;">
                            </figure>

                            <!-- NẾU CHỈ MỚI CÓ CACHE (isPartial), HIỆN SKELETON Ở VÙNG CONTENT -->
                            <div v-if="post.isPartial" class="article-body-skeleton fade-in py-3">
                                <div v-for="i in 8" :key="i" class="skeleton-box skeleton-text w-100 mb-3 shimmer" :style="{'width': i%3===0 ? '80%' : '100%'}"></div>
                                <div class="skeleton-box skeleton-text w-50 mb-5 shimmer"></div>
                            </div>
                            
                            <!-- NẾU ĐÃ LOAD XONG DATA THẬT -->
                            <div v-else class="article-body text-dark fade-in" style="line-height: 1.8; font-size: 1.05rem;" v-html="post.content"></div>

                            <!-- Thẻ tác giả -->
                            <div class="author-box d-flex align-items-center bg-light-custom p-4 rounded-4 mt-5 border border-light-subtle">
                                <img :src="post.author.avatar" @error="handleImageError" class="rounded-circle me-4 shadow-sm border object-fit-cover flex-shrink-0" width="80" height="80">
                                <div>
                                    <h5 class="fw-bold mb-1 text-main font-serif">{{ post.author.name }}</h5>
                                    <p class="mb-0 text-secondary fst-italic">"Chia sẻ kiến thức, xu hướng và đam mê cái đẹp."</p>
                                </div>
                            </div>

                        </article>
                    </div>

                    <!-- Sidebar Bài viết liên quan -->
                    <div class="col-lg-4 mt-5 mt-lg-0">
                        <aside class="sidebar-sticky">
                            
                            <div class="bg-white p-4 rounded-4 shadow-sm border border-light-subtle mb-4">
                                <h4 class="widget-title font-serif">Bài viết mới nhất</h4>

                                <!-- Loading related posts -->
                                <div v-if="isRelatedLoading" class="mt-4">
                                     <div v-for="i in 4" :key="i" class="d-flex mb-4">
                                        <div class="skeleton-box rounded shimmer flex-shrink-0" style="width: 90px; height: 70px;"></div>
                                        <div class="ms-3 flex-grow-1 d-flex flex-column justify-content-center">
                                            <div class="skeleton-box skeleton-text w-100 mb-2 shimmer"></div>
                                            <div class="skeleton-box skeleton-text w-75 shimmer"></div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="related-posts mt-4 fade-in">
                                    <p v-if="relatedPosts.length === 0" class="text-muted fst-italic">Chưa có bài viết nào khác.</p>

                                    <router-link :to="{ name: 'PostDetailt', params: { slug: item.slug ? item.slug : toSlug(item.title) } }" 
                                                 v-for="item in relatedPosts" :key="item.id" 
                                                 class="related-item d-flex mb-4 text-decoration-none product-card product-title-link p-2 rounded">
                                        <div class="flex-shrink-0 img-zoom-wrapper rounded border" style="width: 90px; height: 70px;">
                                            <img :src="item.image" @error="handleImageError" class="w-100 h-100 object-fit-cover">
                                        </div>
                                        <div class="flex-grow-1 ms-3 d-flex flex-column justify-content-center">
                                            <h6 class="mb-1 text-dark product-title fw-bold">{{ item.title }}</h6>
                                            <small class="text-muted d-flex align-items-center mt-1">
                                                <i class="bi bi-calendar-event me-1 text-accent"></i> {{ formatDate(item.created_at).split(' ')[0] }}
                                            </small>
                                        </div>
                                    </router-link>
                                </div>
                            </div>

                            <div class="bg-white p-4 rounded-4 shadow-sm border border-light-subtle text-center">
                                <h6 class="fw-bold text-dark mb-3">Chia sẻ bài viết này</h6>
                                <p class="small text-muted mb-3">Lan tỏa kiến thức hữu ích đến bạn bè của bạn.</p>
                                <button class="btn btn-outline-main w-100 fw-bold rounded-pill font-oswald tracking-widest text-uppercase" @click="copyToClipboard()">
                                    <i class="bi bi-share-fill me-2"></i> Sao chép liên kết
                                </button>
                            </div>

                        </aside>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;500;600;700&display=swap');

/* MÀU SẮC THƯƠNG HIỆU SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }
.border-main { border-color: #9f273b !important; }

/* Các thành phần cơ bản */
.btn-main { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.3s ease; }
.btn-main:hover { background-color: #cc1e2e; color: white; }
.btn-outline-main { color: #9f273b; border: 1px solid #9f273b; background: transparent; transition: all 0.2s ease; }
.btn-outline-main:hover { background-color: #9f273b; color: white; }
.btn-outline-secondary:hover { background-color: #e9ecef; color: #2c2c2c; }

/* Font chữ & Định dạng cơ bản */
.post-detail-page {
    font-family: 'Inter', sans-serif;
    color: #2c2c2c;
}
h1, h2, h3, h4, h5, h6 { 
    font-family: 'Inter', sans-serif !important; 
    font-weight: 700; 
}
.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.font-oswald { font-family: "Oswald", sans-serif !important; }
.object-fit-cover { object-fit: cover !important; }
.tracking-wide { letter-spacing: 0.1em; }
.tracking-widest { letter-spacing: 1px; }

/* Nút Quay Lại (Breadcrumb) */
.back-link { transition: all 0.3s ease; }
.back-link:hover { color: #9f273b !important; transform: translateX(-5px); }
.hover-underline:hover { text-decoration: underline !important; }

/* Cấu trúc chi tiết bài viết */
.article-title {
    font-weight: 800;
    font-size: 2.2rem;
    line-height: 1.3;
}

.article-body :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 25px auto;
    display: block;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.article-body :deep(h2), .article-body :deep(h3) {
    color: #9f273b;
    margin-top: 30px;
    margin-bottom: 15px;
    font-family: "Playfair Display", serif;
}

.article-body :deep(p) {
    margin-bottom: 1.2rem;
}

/* Sidebar & Widget */
.sidebar-sticky {
    position: sticky;
    top: 100px;
}

.widget-title {
    font-size: 1.25rem;
    color: #9f273b;
    border-bottom: 2px solid #e7ce7d;
    padding-bottom: 12px;
    margin-bottom: 0;
}

/* Hiệu ứng Product Card (Áp dụng cho bài liên quan) */
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-bottom: 2px solid transparent !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.08)!important;
  border-bottom: 2px solid #e7ce7d !important;
}

/* Hiệu ứng Image Zoom */
.img-zoom-wrapper { overflow: hidden; display: block; border-radius: 6px; }
.img-zoom-wrapper img { transition: transform 0.8s ease; }
.product-card:hover .img-zoom-wrapper img { transform: scale(1.08); }

/* Tiêu đề bài viết liên quan */
.product-title { 
    font-size: 0.95rem; 
    line-height: 1.4; 
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease; 
}
.product-title-link { transition: color 0.3s ease; }
.product-card:hover .product-title, .product-title-link:hover .product-title { color: #9f273b !important; }

/* HIỆU ỨNG CHUYỂN ĐỘNG VÀ SKELETON */
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