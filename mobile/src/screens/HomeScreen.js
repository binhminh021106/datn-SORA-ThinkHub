import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView, TextInput, Dimensions, StatusBar, Animated, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Dummy Data
const BANNERS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1000&auto=format&fit=crop' },
];

const BEST_SELLERS = [
  { id: '1', name: 'Nhẫn Kim Cương Eternal Trắng 18K', category: 'Nhẫn Cao Cấp', price: '25.000.000đ', oldPrice: '30.500.000đ', discount: '-18%', image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop', rating: 5 },
  { id: '2', name: 'Dây Chuyền Ngọc Trai Tự Nhiên Biển Nam', category: 'Dây Chuyền', price: '12.500.000đ', oldPrice: '15.000.000đ', discount: '-16%', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop', rating: 4 },
  { id: '3', name: 'Bông Tai Sapphire Xanh Cao Cấp', category: 'Bông Tai', price: '18.200.000đ', oldPrice: '22.000.000đ', discount: '-20%', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', rating: 5 },
];

const CATEGORIES = [
  { id: '1', name: 'Nhẫn', icon: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=300&auto=format&fit=crop' },
  { id: '2', name: 'Dây Chuyền', icon: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop' },
  { id: '3', name: 'Bông Tai', icon: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop' },
  { id: '4', name: 'Lắc Tay', icon: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=300&auto=format&fit=crop' },
  { id: '5', name: 'Vòng Cổ', icon: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=300&auto=format&fit=crop' },
  { id: '6', name: 'Ghim Cài', icon: 'https://images.unsplash.com/photo-1573408301185-9519df1f2c1f?q=80&w=300&auto=format&fit=crop' },
];

const NEWS = [
  {
    id: '1',
    tag: 'Cẩm Nang',
    title: 'Hướng dẫn chọn nhẫn kim cương cưới phù hợp',
    excerpt: 'Kiến thức cần biết giúp bạn lựa chọn cặp nhẫn cưới đẹp và ý nghĩa, phù hợp với tài chính và thẩm mỹ riêng.',
    date: '15 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    tag: 'Xu Hướng',
    title: 'Top 5 xu hướng trang sức năm 2025 bạn không thể bỏ lỡ',
    excerpt: 'Từ phong trào tả năng đến tối giản sang trọng, khám phá những điều dần xuất hiện trên bản thảm đỏ tính đến tháng 6.',
    date: '10 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    tag: 'Chăm Sóc',
    title: 'Cách bảo quản trang sức vàng & đá quý đúng cách',
    excerpt: 'Những mẹo nhỏ giúp trang sức của bạn luôn sáng bóng và bền đẹp theo thời gian dù sử dụng hàng ngày.',
    date: '05 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
];

export default function HomeScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {/* Discount Badge */}
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
      
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory} numberOfLines={1}>{item.category}</Text>
        <Text style={styles.oldPrice}>{item.oldPrice}</Text>
        <Text style={styles.newPrice}>{item.price}</Text>
        
        <View style={styles.productFooter}>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star, index) => (
              <Ionicons key={index} name={index < item.rating ? "star" : "star-outline"} size={12} color="#f1c40f" />
            ))}
          </View>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER SECTION (Like Emart Mall but SORA colors) */}
      <View style={styles.headerContainer}>
        {/* Top Row: Menu, Logo, Icon */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
          
          <Image 
            source={require('../../assets/logo1.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="globe-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchDropdown}>
            <Text style={styles.searchDropdownText}>Tất cả</Text>
            <Ionicons name="caret-down" size={12} color="#333" />
          </View>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Tìm kiếm trong SORA..." 
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.barcodeIcon}>
            <MaterialCommunityIcons name="barcode-scan" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Top Tab Menu */}
        <View style={styles.topTabMenu}>
          <TouchableOpacity style={styles.topTabItem}>
            <Text style={styles.topTabText}>XU HƯỚNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topTabItem, styles.topTabItemActive]}>
            <Text style={[styles.topTabText, styles.topTabTextActive]}>TRANG CHỦ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topTabItem}>
            <Text style={styles.topTabText}>BỘ SƯU TẬP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY SECTION */}
      <ScrollView 
        style={styles.bodyContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9f273b']}
            tintColor="#9f273b"
          />
        }
      >
        
        {/* Hero Banner Carousel */}
        <View style={styles.bannerSection}>
          <Image source={{ uri: BANNERS[0].image }} style={styles.heroBannerImage} />
          {/* Pagination dots (static for now) */}
          <View style={styles.paginationContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>DANH MỤC</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Image source={{ uri: cat.icon }} style={styles.categoryImage} />
                  <View style={styles.categoryOverlay} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SẢN PHẨM BÁN CHẠY</Text>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>Xem Thêm</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={BEST_SELLERS}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* News Section */}
        <View style={styles.newsSectionContainer}>
          {/* Section header */}
          <View style={styles.newsSectionHeader}>
            <Text style={styles.newsTagLabel}>CẨM NANG</Text>
            <Text style={styles.sectionTitle}>Kiến Thức Trang Sức</Text>
          </View>

          {NEWS.map((article) => (
            <TouchableOpacity key={article.id} style={styles.newsCard}>
              <Image source={{ uri: article.image }} style={styles.newsCardImage} />
              <View style={styles.newsCardBody}>
                <Text style={styles.newsCardTag}>{article.tag}</Text>
                <Text style={styles.newsCardTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.newsCardExcerpt} numberOfLines={2}>{article.excerpt}</Text>
                <View style={styles.newsCardFooter}>
                  <Ionicons name="calendar-outline" size={12} color="#999" />
                  <Text style={styles.newsCardDate}> {article.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra Space at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* SIDE MENU (DRAWER OVERLAY) */}
      {isMenuOpen && (
        <View style={styles.menuOverlayWrapper}>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.menuOverlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <Image source={require('../../assets/logo1.png')} style={styles.menuLogo} resizeMode="contain" />
                <TouchableOpacity onPress={toggleMenu} style={styles.menuCloseBtn}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.menuBody} showsVerticalScrollIndicator={false}>
                {/* User Section */}
                <TouchableOpacity style={styles.menuUserSection} onPress={() => { toggleMenu(); navigation.navigate('Login'); }}>
                  <View style={styles.menuAvatar}>
                    <Ionicons name="person" size={30} color="#9f273b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuUserName}>Đăng nhập / Đăng ký</Text>
                    <Text style={styles.menuUserSub}>Nhận ưu đãi hạng thành viên</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>KHÁM PHÁ</Text>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="diamond-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Cửa hàng Trang sức</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="sparkles-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Bộ Sưu Tập Giới Hạn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="gold" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Bảng Giá Vàng</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>HỖ TRỢ & DỊCH VỤ</Text>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="information-circle-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Về SORA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Chính sách bảo hành</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="call-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Liên hệ CSKH</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <View style={styles.menuFooter}>
                <Text style={styles.menuFooterText}>SORA JEWELRY v1.0.0</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Match header color for safe area
  },
  headerContainer: {
    backgroundColor: '#fff', 
    paddingTop: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  iconButton: {
    padding: 5,
  },
  logo: {
    height: 55, // Tăng kích thước logo
    width: 220,
    
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
  },
  searchDropdownText: {
    fontSize: 13,
    fontFamily: 'Oswald_500Medium',
    marginRight: 5,
    color: '#333',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Oswald_400Regular',
  },
  barcodeIcon: {
    paddingHorizontal: 10,
  },
  topTabMenu: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
  },
  topTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabItemActive: {
    borderBottomColor: '#9f273b',
  },
  topTabText: {
    fontSize: 12,
    fontFamily: 'Oswald_400Regular',
    color: '#999',
    textTransform: 'uppercase',
  },
  topTabTextActive: {
    color: '#333',
    fontFamily: 'Oswald_500Medium',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannerSection: {
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 18,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  categoriesList: {
    paddingHorizontal: 0,
    gap: 14,
    marginTop: 14,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e7ce7d',
    marginBottom: 7,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(159,39,59,0.10)',
  },
  categoryName: {
    fontSize: 11,
    fontFamily: 'Oswald_400Regular',
    textTransform: 'uppercase',
    color: '#555',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroBannerImage: {
    width: width,
    height: width * 0.55, // Chiều cao linh hoạt theo thiết bị để hình không bị cắt méo
    resizeMode: 'cover',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#9f273b',
    width: 15,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#333',
  },

  // === NEWS SECTION ===
  newsSectionContainer: {
    backgroundColor: '#f9f9f9',
    marginTop: 10,
    paddingBottom: 10,
  },
  newsSectionHeader: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  newsTagLabel: {
    fontSize: 11,
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  newsCardImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  newsCardBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  newsCardTag: {
    fontSize: 10,
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  newsCardTitle: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#222',
    lineHeight: 18,
    marginBottom: 4,
  },
  newsCardExcerpt: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#777',
    lineHeight: 15,
    marginBottom: 6,
  },
  newsCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsCardDate: {
    fontSize: 10,
    fontFamily: 'Oswald_400Regular',
    color: '#aaa',
  },


  viewMoreButton: {
    backgroundColor: '#e7ce7d', // Gold button
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  viewMoreText: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    color: '#fff',
  },
  productList: {
    paddingHorizontal: 10,
  },
  productCard: {
    width: 140,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#cc1e2e',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    textTransform: 'uppercase',
    color: '#333',
    lineHeight: 16,
    marginBottom: 0,
  },
  productCategory: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#888',
    marginTop: 2,
    marginBottom: 6,
  },
  oldPrice: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  newPrice: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#9f273b', // Red price matching website
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  menuOverlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLogo: {
    height: 40,
    width: 150,
  },
  menuCloseBtn: {
    padding: 5,
  },
  menuBody: {
    flex: 1,
  },
  menuUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbf9f6',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e7ce7d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuUserName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  menuUserSub: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#9f273b',
  },
  menuSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuSectionTitle: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Oswald_400Regular',
    color: '#333',
  },
  menuFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuFooterText: {
    fontSize: 11,
    fontFamily: 'Oswald_400Regular',
    color: '#aaa',
    letterSpacing: 1,
  },
});
