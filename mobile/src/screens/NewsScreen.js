import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { API_BASE_URL } from '../config/api';

const BRAND_RED = '#9f273b';
const BRAND_GOLD = '#e7ce7d';
const PAGE_MAX_WIDTH = 680;
const ARTICLES_PER_PAGE = 3;
const ALL_CATEGORY = 'Tất cả';

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace('/api', '');
  if (path.startsWith('http')) {
    return path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
  }
  if (path.startsWith('/storage/')) return `${origin}${path}`;
  if (path.startsWith('storage/')) return `${origin}/${path}`;
  return `${origin}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatViews = (views) => {
  const value = Number(views) || 0;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
};

const getReadTime = (excerpt) => {
  const wordCount = String(excerpt || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(Math.ceil(wordCount / 45), 2)} phút đọc`;
};

const mapArticle = (article) => ({
  ...article,
  id: article.id,
  category: article.category || 'Tin tức',
  title: article.title || 'Bài viết SORA',
  excerpt: article.excerpt || 'Khám phá những câu chuyện và kiến thức trang sức được tuyển chọn từ SORA.',
  date: formatDate(article.created_at),
  author: article.author_name || 'SORA Editorial',
  readTime: getReadTime(article.excerpt),
  views: formatViews(article.views),
  rawViews: Number(article.views) || 0,
  image: getStorageUrl(article.image_url),
});

function ArticleMeta({ article, light = false }) {
  const color = light ? 'rgba(255,255,255,0.86)' : '#8b8b8b';
  return (
    <View style={styles.metaRow}>
      <Ionicons name="calendar-outline" size={13} color={light ? BRAND_GOLD : BRAND_RED} />
      <Text style={[styles.metaText, { color }]}>{article.date}</Text>
      <View style={styles.metaDot} />
      <Text style={[styles.metaText, { color }]}>{article.readTime}</Text>
    </View>
  );
}

function ArticleCard({ article, onPress }) {
  return (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.86} onPress={() => onPress(article)}>
      <SmartImage source={{ uri: article.image }} style={styles.articleImage} />
      <View style={styles.articleBody}>
        <Text style={styles.articleCategory}>{article.category}</Text>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.articleExcerpt} numberOfLines={2}>{article.excerpt}</Text>
        <View style={styles.articleFooter}>
          <ArticleMeta article={article} />
          <Ionicons name="arrow-forward" size={17} color={BRAND_RED} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PopularArticle({ article, rank, onPress }) {
  return (
    <TouchableOpacity style={styles.popularCard} activeOpacity={0.86} onPress={() => onPress(article)}>
      <Text style={styles.popularRank}>{String(rank).padStart(2, '0')}</Text>
      <View style={styles.popularBody}>
        <Text style={styles.popularCategory}>{article.category}</Text>
        <Text style={styles.popularTitle} numberOfLines={2}>{article.title}</Text>
        <View style={styles.popularMeta}>
          <Ionicons name="eye-outline" size={13} color="#9b9b9b" />
          <Text style={styles.popularViews}>{article.views} lượt xem</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMountedRef = useRef(true);
  const [newsList, setNewsList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [currentPage, setCurrentPage] = useState(1);
  const horizontalPadding = width >= 720 ? 24 : 16;

  const loadNews = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorText('');

    try {
      const [newsResponse, popularResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/news?per_page=50`, { headers: { Accept: 'application/json' } }),
        fetch(`${API_BASE_URL}/news/popular`, { headers: { Accept: 'application/json' } }),
      ]);
      const [newsPayload, popularPayload] = await Promise.all([
        newsResponse.json(),
        popularResponse.json(),
      ]);

      if (!newsResponse.ok || newsPayload.status !== 'success') {
        throw new Error(newsPayload.message || 'Không thể tải danh sách tin tức.');
      }

      const articles = (newsPayload.data?.data || []).map(mapArticle);
      const articleMap = new Map(articles.map((article) => [String(article.id), article]));
      const popularArticles = popularResponse.ok && popularPayload.status === 'success'
        ? (popularPayload.data || []).map((article) => mapArticle({
          ...articleMap.get(String(article.id)),
          ...article,
        }))
        : [];

      if (!isMountedRef.current) return;
      setNewsList(articles);
      setPopularList(popularArticles);
    } catch (error) {
      if (!isMountedRef.current) return;
      setErrorText(error.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadNews();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadNews]);

  const categories = useMemo(() => {
    const serverCategories = newsList.map((article) => article.category).filter(Boolean);
    return [ALL_CATEGORY, ...new Set(serverCategories)];
  }, [newsList]);

  const filteredNews = useMemo(() => {
    const keyword = searchText.trim().toLocaleLowerCase('vi-VN');
    return newsList.filter((article) => {
      const matchesCategory = activeCategory === ALL_CATEGORY || article.category === activeCategory;
      const matchesSearch = !keyword
        || article.title.toLocaleLowerCase('vi-VN').includes(keyword)
        || article.excerpt.toLocaleLowerCase('vi-VN').includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, newsList, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchText]);

  const totalPages = Math.max(Math.ceil(filteredNews.length / ARTICLES_PER_PAGE), 1);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageArticles = filteredNews.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );
  const featuredArticle = pageArticles[0];
  const latestArticles = pageArticles.slice(1);
  const popularArticles = (popularList.length ? popularList : [...newsList]
    .sort((a, b) => b.rawViews - a.rawViews))
    .slice(0, 3);
  const openArticle = (article) => {
    if (!article?.slug) return;
    navigation.navigate('NewsDetail', { slug: article.slug, article });
  };

  return (
    <>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_RED} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>SORA EDITORIAL</Text>
            <Text style={styles.headerTitle}>TIN TỨC</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="newspaper-outline" size={22} color={BRAND_GOLD} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={(
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNews({ refreshing: true })}
              colors={[BRAND_RED]}
              tintColor={BRAND_RED}
            />
          )}
        >
          <View style={[styles.page, { maxWidth: PAGE_MAX_WIDTH, paddingHorizontal: horizontalPadding }]}>
          <View style={styles.intro}>
            <Text style={styles.introKicker}>SORA - CHẠM ĐẾN SỰ HOÀN MỸ</Text>
            <Text style={styles.introTitle}>Cẩm nang trang sức</Text>
            <Text style={styles.introText}>
              Khám phá xu hướng, kiến thức và những gợi ý tinh tế để mỗi món trang sức luôn mang dấu ấn riêng.
            </Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={BRAND_RED} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm bài viết..."
              placeholderTextColor="#a6a6a6"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!searchText && (
              <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#bcbcbc" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
                  onPress={() => setActiveCategory(category)}
                  activeOpacity={0.78}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {!!errorText && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={BRAND_RED} />
              <Text style={styles.errorText}>{errorText}</Text>
              <TouchableOpacity onPress={() => loadNews()} activeOpacity={0.75}>
                <Text style={styles.retryText}>THỬ LẠI</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={BRAND_RED} />
              <Text style={styles.loadingText}>ĐANG TẢI TIN TỨC SORA...</Text>
            </View>
          ) : featuredArticle ? (
            <>
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={styles.sectionKicker}>TUYỂN CHỌN</Text>
                  <Text style={styles.sectionTitle}>Tin nổi bật</Text>
                </View>
                <Ionicons name="sparkles-outline" size={21} color={BRAND_GOLD} />
              </View>

              <TouchableOpacity style={styles.featuredCard} activeOpacity={0.88} onPress={() => openArticle(featuredArticle)}>
                <SmartImage source={{ uri: featuredArticle.image }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredCategory}>{featuredArticle.category}</Text>
                  <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
                  <Text style={styles.featuredExcerpt} numberOfLines={2}>{featuredArticle.excerpt}</Text>
                  <View style={styles.featuredFooter}>
                    <ArticleMeta article={featuredArticle} light />
                    <View style={styles.readMore}>
                      <Text style={styles.readMoreText}>ĐỌC TIẾP</Text>
                      <Ionicons name="arrow-forward" size={15} color="#fff" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {!!latestArticles.length && (
                <>
                  <View style={styles.sectionHeadingRow}>
                    <View>
                      <Text style={styles.sectionKicker}>MỚI NHẤT</Text>
                      <Text style={styles.sectionTitle}>Tin mới cập nhật</Text>
                    </View>
                    <Text style={styles.articleCount}>{filteredNews.length} bài viết</Text>
                  </View>
                  {latestArticles.map((article) => <ArticleCard key={article.id} article={article} onPress={openArticle} />)}
                </>
              )}

              {totalPages > 1 && (
                <View style={styles.paginationBar}>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? '#bbb' : BRAND_RED} />
                  </TouchableOpacity>

                  <Text style={styles.pageStatus}>Trang {currentPage} / {totalPages}</Text>

                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? '#bbb' : BRAND_RED} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={42} color="#d0b86d" />
              <Text style={styles.emptyTitle}>Không tìm thấy bài viết</Text>
              <Text style={styles.emptyText}>Thử thay đổi từ khóa hoặc chọn một chủ đề khác.</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchText('');
                  setActiveCategory(ALL_CATEGORY);
                }}
              >
                <Text style={styles.resetText}>XEM TẤT CẢ</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !!popularArticles.length && (
            <View style={styles.popularSection}>
              <Text style={styles.sectionKicker}>ĐƯỢC QUAN TÂM</Text>
              <Text style={styles.sectionTitle}>Đọc nhiều nhất</Text>
              <View style={styles.popularList}>
                {popularArticles.map((article, index) => (
                  <PopularArticle key={article.id} article={article} rank={index + 1} onPress={openArticle} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.subscribeBox}>
            <Ionicons name="mail-open-outline" size={27} color={BRAND_RED} />
            <Text style={styles.subscribeTitle}>Đón đọc câu chuyện mới</Text>
            <Text style={styles.subscribeText}>
              Những góc nhìn chọn lọc về trang sức và phong cách từ SORA.
            </Text>
            <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.82}>
              <Text style={styles.subscribeButtonText}>ĐĂNG KÝ NHẬN TIN</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  topSafeArea: { flex: 0, backgroundColor: BRAND_RED },
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND_RED,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.25)',
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerEyebrow: { color: BRAND_GOLD, fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.8 },
  headerTitle: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 19, letterSpacing: 1.2, marginTop: 1 },
  scroll: { flex: 1, backgroundColor: '#f8f6f3' },
  scrollContent: { paddingBottom: 28 },
  page: { width: '100%', alignSelf: 'center' },
  intro: { paddingTop: 26, paddingBottom: 20 },
  introKicker: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.5, marginBottom: 7 },
  introTitle: { color: '#211d1d', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 29, lineHeight: 36, marginBottom: 8 },
  introText: { color: '#727272', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, lineHeight: 22 },
  searchBox: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfd8',
    borderRadius: 6,
  },
  searchInput: { flex: 1, paddingVertical: 10, color: '#333', fontFamily: 'Oswald_400Regular', fontSize: 14 },
  categoryList: { paddingVertical: 16, gap: 8 },
  categoryButton: {
    height: 35,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfd8',
    borderRadius: 18,
  },
  categoryButtonActive: { backgroundColor: BRAND_RED, borderColor: BRAND_RED },
  categoryText: { color: '#686868', fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 0.4 },
  categoryTextActive: { color: '#fff' },
  errorBox: {
    minHeight: 48,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff4f5',
    borderWidth: 1,
    borderColor: '#f0d6da',
    borderRadius: 6,
  },
  errorText: { flex: 1, color: '#82404a', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 17 },
  retryText: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 0.7 },
  loadingState: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1.1 },
  sectionHeadingRow: { marginTop: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionKicker: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.8, marginBottom: 2 },
  sectionTitle: { color: '#242020', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, lineHeight: 28 },
  articleCount: { color: '#a06b73', fontFamily: 'Oswald_400Regular', fontSize: 12 },
  featuredCard: { height: 380, marginBottom: 18, overflow: 'hidden', borderRadius: 7, backgroundColor: '#ddd' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(22,10,12,0.48)' },
  featuredContent: { ...StyleSheet.absoluteFillObject, padding: 18, justifyContent: 'flex-end' },
  featuredCategory: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: '#fff',
    backgroundColor: BRAND_RED,
    borderRadius: 3,
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  featuredTitle: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25, lineHeight: 31, marginBottom: 8 },
  featuredExcerpt: { color: 'rgba(255,255,255,0.84)', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 19 },
  featuredFooter: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: 'Oswald_400Regular', fontSize: 11 },
  metaDot: { width: 3, height: 3, marginHorizontal: 2, borderRadius: 2, backgroundColor: '#c9b572' },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readMoreText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1 },
  articleCard: {
    minHeight: 150,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee7e2',
  },
  articleImage: { width: 124, minHeight: 150 },
  articleBody: { flex: 1, padding: 12 },
  articleCategory: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  articleTitle: { color: '#282323', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, lineHeight: 21, marginTop: 3 },
  articleExcerpt: { color: '#808080', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 12, lineHeight: 17, marginTop: 5 },
  articleFooter: { marginTop: 'auto', paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paginationBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 20, paddingBottom: 4 },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead9bf',
    backgroundColor: '#fff',
  },
  pageButtonDisabled: { backgroundColor: '#f7f7f7', borderColor: '#eee' },
  pageStatus: { color: '#555', fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  emptyState: {
    paddingHorizontal: 28,
    paddingVertical: 34,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee7e2',
    borderRadius: 6,
  },
  emptyTitle: { marginTop: 12, color: '#292222', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  emptyText: { marginTop: 7, color: '#878787', textAlign: 'center', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 19 },
  resetButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: BRAND_RED, borderRadius: 4 },
  resetText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.2 },
  popularSection: { marginTop: 26 },
  popularList: { marginTop: 10, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#eee7e2' },
  popularCard: { minHeight: 84, paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f2ece8' },
  popularRank: { width: 42, color: BRAND_GOLD, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25 },
  popularBody: { flex: 1 },
  popularCategory: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase' },
  popularTitle: { marginTop: 2, color: '#332d2d', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, lineHeight: 18 },
  popularMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  popularViews: { color: '#9b9b9b', fontFamily: 'Oswald_400Regular', fontSize: 11 },
  subscribeBox: { marginTop: 22, padding: 22, alignItems: 'center', backgroundColor: '#f8efe9', borderRadius: 6, borderWidth: 1, borderColor: '#eddfd6' },
  subscribeTitle: { marginTop: 8, color: '#332626', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19 },
  subscribeText: { marginTop: 6, color: '#806f6f', textAlign: 'center', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 19 },
  subscribeButton: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: BRAND_RED, borderRadius: 4 },
  subscribeButtonText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.2 },
});
