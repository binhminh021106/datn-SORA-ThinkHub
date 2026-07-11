import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import SmartImage from '../components/SmartImage';
import { API_BASE_URL } from '../config/api';

const NativeWebView = Platform.OS === 'web' ? null : require('react-native-webview').WebView;

const BRAND_RED = '#9f273b';
const BRAND_GOLD = '#e7ce7d';
const PAGE_MAX_WIDTH = 680;

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace(/\/api$/, '');
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

const formatViews = (views) => new Intl.NumberFormat('vi-VN').format(Number(views) || 0);

const getArticleContent = (article) => (
  article?.content
  || article?.body
  || article?.article_content
  || article?.description
  || ''
);

const normalizeArticleContent = (content) => {
  const origin = API_BASE_URL.replace(/\/api$/, '');
  return String(content || '<p>Nội dung bài viết đang được cập nhật.</p>')
    .replace(/src=(["'])\/storage\//gi, `src=$1${origin}/storage/`)
    .replace(/src=(["'])storage\//gi, `src=$1${origin}/storage/`);
};

const sanitizeArticleHtml = (html) => String(html || '')
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  .replace(/<(iframe|object|embed|form|input|button|textarea|select|option|link|meta)\b[^>]*>.*?<\/\1>/gis, '')
  .replace(/<(iframe|object|embed|form|input|button|textarea|select|option|link|meta)\b[^>]*\/?>/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
  .replace(/\s+(href|src)\s*=\s*(['"])\s*(javascript:|data:)[^'"]*\2/gi, '')
  .replace(/\s+(href|src)\s*=\s*(javascript:|data:)[^\s>]*/gi, '');

const buildHtml = (content) => {
  const normalizedContent = sanitizeArticleHtml(normalizeArticleContent(content));

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: transparent; }
          body { color: #4d4747; font-family: Georgia, "Times New Roman", serif; font-size: 16px; line-height: 1.78; overflow: hidden; }
          p { margin: 0 0 16px; }
          h1, h2, h3, h4 { color: #292222; line-height: 1.35; margin: 24px 0 12px; }
          h1 { font-size: 25px; } h2 { font-size: 22px; } h3 { font-size: 19px; }
          img { display: block; max-width: 100%; height: auto; margin: 18px auto; border-radius: 6px; }
          ul, ol { margin: 0 0 16px; padding-left: 22px; }
          li { margin-bottom: 7px; }
          blockquote { margin: 18px 0; padding: 11px 14px; color: #77404a; background: #fbf3f1; border-left: 3px solid #9f273b; }
          a { color: #9f273b; }
          iframe, video { max-width: 100%; }
        </style>
      </head>
      <body>
        ${normalizedContent}
        <script>
          const sendHeight = () => {
            window.ReactNativeWebView.postMessage(String(document.documentElement.scrollHeight));
          };
          window.addEventListener('load', sendHeight);
          document.querySelectorAll('img').forEach((image) => image.addEventListener('load', sendHeight));
          new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
          setTimeout(sendHeight, 100);
          setTimeout(sendHeight, 500);
        </script>
      </body>
    </html>
  `;
};

const renderWebArticleContent = (content) => (
  React.createElement('div', {
    style: {
      color: '#4d4747',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 16,
      lineHeight: 1.78,
      width: '100%',
    },
    dangerouslySetInnerHTML: { __html: sanitizeArticleHtml(normalizeArticleContent(content)) },
  })
);

const fetchNewsDetailQuery = async (slug) => {
  if (!slug) {
    throw new Error('Không tìm thấy đường dẫn bài viết.');
  }

  const response = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json();

  if (!response.ok || payload.status !== 'success') {
    throw new Error(payload.message || 'Không thể tải bài viết.');
  }

  return payload.data;
};

export default function NewsDetailScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const slug = route.params?.slug;
  const initialArticle = route.params?.article || null;
  const [contentHeight, setContentHeight] = useState(160);
  const horizontalPadding = width >= 720 ? 24 : 16;

  const articleQuery = useQuery({
    queryKey: ['news', 'detail', slug],
    queryFn: () => fetchNewsDetailQuery(slug),
    enabled: !!slug,
    placeholderData: initialArticle || undefined,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });

  const article = articleQuery.data || null;
  const isLoading = articleQuery.isLoading && !article;
  const isRefreshing = articleQuery.isRefetching && !!article;
  const errorText = articleQuery.isError
    ? articleQuery.error?.message || 'Không thể kết nối đến máy chủ.'
    : '';
  const articleContent = getArticleContent(article);

  const html = useMemo(() => buildHtml(articleContent), [articleContent]);

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
            <Text style={styles.headerTitle}>CHI TIẾT TIN TỨC</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="book-outline" size={21} color={BRAND_GOLD} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={(
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => articleQuery.refetch()}
              colors={[BRAND_RED]}
              tintColor={BRAND_RED}
            />
          )}
        >
          <View style={[styles.page, { maxWidth: PAGE_MAX_WIDTH, paddingHorizontal: horizontalPadding }]}>
            {!!errorText && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={19} color={BRAND_RED} />
                <Text style={styles.errorText}>{errorText}</Text>
                <TouchableOpacity onPress={() => articleQuery.refetch()} activeOpacity={0.75}>
                  <Text style={styles.retryText}>THỬ LẠI</Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoading && !article ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={BRAND_RED} />
                <Text style={styles.loadingText}>ĐANG TẢI BÀI VIẾT...</Text>
              </View>
            ) : article ? (
              <>
                <View style={styles.breadcrumb}>
                  <TouchableOpacity onPress={() => navigation.navigate('News')} activeOpacity={0.75}>
                    <Text style={styles.breadcrumbLink}>TIN TỨC</Text>
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={13} color="#b3a39f" />
                  <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{article.category || 'Cẩm nang'}</Text>
                </View>

                <Text style={styles.category}>{article.category || 'Cẩm nang trang sức'}</Text>
                <Text style={styles.title}>{article.title}</Text>
                {!!article.excerpt && <Text style={styles.excerpt}>{article.excerpt}</Text>}

                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={15} color={BRAND_RED} />
                  <Text style={styles.metaText}>{article.author_name || 'SORA Editorial'}</Text>
                  <View style={styles.metaDot} />
                  <Ionicons name="calendar-outline" size={14} color={BRAND_RED} />
                  <Text style={styles.metaText}>{formatDate(article.created_at)}</Text>
                  <View style={styles.metaDot} />
                  <Ionicons name="eye-outline" size={15} color={BRAND_RED} />
                  <Text style={styles.metaText}>{formatViews(article.views)}</Text>
                </View>

                <SmartImage source={{ uri: getStorageUrl(article.image_url) }} style={styles.heroImage} />

                <View style={styles.articleBody}>
                  <View style={styles.bodyHeading}>
                    <View style={styles.headingLine} />
                    <Text style={styles.bodyKicker}>CÂU CHUYỆN SORA</Text>
                    <View style={styles.headingLine} />
                  </View>
                  {articleQuery.isFetching && !articleContent ? (
                    <View style={styles.contentLoadingBox}>
                      <ActivityIndicator size="small" color={BRAND_RED} />
                      <Text style={styles.contentLoadingText}>ĐANG TẢI NỘI DUNG BÀI VIẾT...</Text>
                    </View>
                  ) : Platform.OS === 'web' ? (
                    <View style={styles.webArticleContent}>
                      {renderWebArticleContent(articleContent)}
                    </View>
                  ) : (
                    <NativeWebView
                      source={{ html, baseUrl: API_BASE_URL.replace(/\/api$/, '') }}
                      style={[styles.webView, { height: contentHeight }]}
                      originWhitelist={['*']}
                      scrollEnabled={false}
                      onMessage={(event) => {
                        const nextHeight = Number(event.nativeEvent.data);
                        if (Number.isFinite(nextHeight) && nextHeight > 0) setContentHeight(nextHeight);
                      }}
                    />
                  )}
                </View>

                <View style={styles.footerCard}>
                  <Ionicons name="diamond-outline" size={24} color={BRAND_RED} />
                  <Text style={styles.footerTitle}>SORA Jewelry</Text>
                  <Text style={styles.footerText}>Nơi vẻ đẹp tinh tế được kể bằng những món trang sức mang dấu ấn riêng.</Text>
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('News')} activeOpacity={0.82}>
                    <Ionicons name="arrow-back" size={15} color="#fff" />
                    <Text style={styles.backButtonText}>QUAY LẠI TIN TỨC</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
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
  headerTitle: { marginTop: 1, color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 18, letterSpacing: 1.1 },
  scroll: { flex: 1, backgroundColor: '#f8f6f3' },
  scrollContent: { paddingBottom: 28 },
  page: { width: '100%', alignSelf: 'center', paddingTop: 18 },
  breadcrumb: { marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 5 },
  breadcrumbLink: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.1 },
  breadcrumbCurrent: { flex: 1, color: '#998d8a', fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  category: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { marginTop: 7, color: '#292222', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 39 },
  excerpt: { marginTop: 12, color: '#766d6d', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, lineHeight: 23 },
  metaRow: { marginTop: 16, marginBottom: 17, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  metaText: { color: '#8c8280', fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 0.25 },
  metaDot: { width: 3, height: 3, marginHorizontal: 2, borderRadius: 2, backgroundColor: BRAND_GOLD },
  heroImage: { width: '100%', height: 235, borderRadius: 7, backgroundColor: '#ede7e3' },
  articleBody: { marginTop: 18, padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee7e2', borderRadius: 7 },
  bodyHeading: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headingLine: { flex: 1, height: 1, backgroundColor: '#eadfd8' },
  bodyKicker: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 10, letterSpacing: 1.5 },
  webView: { width: '100%', backgroundColor: 'transparent' },
  webArticleContent: { width: '100%', maxWidth: '100%', overflow: 'hidden' },
  contentLoadingBox: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contentLoadingText: {
    color: BRAND_RED,
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    letterSpacing: 1,
  },
  errorBox: { marginBottom: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff4f5', borderWidth: 1, borderColor: '#f0d6da', borderRadius: 6 },
  errorText: { flex: 1, color: '#82404a', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 17 },
  retryText: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 0.7 },
  loadingState: { minHeight: 420, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1.1 },
  footerCard: { marginTop: 18, padding: 20, alignItems: 'center', backgroundColor: '#f8efe9', borderWidth: 1, borderColor: '#eddfd6', borderRadius: 7 },
  footerTitle: { marginTop: 6, color: '#392d2d', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  footerText: { marginTop: 5, color: '#806f6f', textAlign: 'center', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 19 },
  backButton: { marginTop: 14, paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: BRAND_RED, borderRadius: 4 },
  backButtonText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.1 },
});
