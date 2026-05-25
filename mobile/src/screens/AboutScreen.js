import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Về SORA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Hero Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1599643478524-fb66f4568dbb?q=80&w=1200&auto=format&fit=crop' }}
          style={s.heroSection}
          resizeMode="cover"
        >
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <Text style={s.heroSub}>Câu Chuyện Thương Hiệu</Text>
            <Text style={s.heroTitleText}>SORA</Text>
            <View style={s.heroDivider} />
            <Text style={s.heroSlogan}>
              "Tuyệt tác trang sức – Nơi khí chất độc bản được tôn vinh."
            </Text>
          </View>
        </ImageBackground>

        {/* 2. Core Story & Portrait */}
        <View style={s.storySection}>
          <Text style={s.sectionSubtitle}>Khởi Nguồn Khí Chất</Text>
          <View style={s.titleDivider} />

          <Text style={s.leadText}>
            SORA không chỉ là trang sức, SORA là tuyên ngôn của sự tinh tế. Ra đời với mong muốn mang đến những món phụ kiện vượt qua giá trị vật chất thông thường, chúng tôi chế tác nên những mảnh ghép phản chiếu tâm hồn và cá tính riêng biệt của thế hệ trẻ hiện đại.
          </Text>

          {/* Overlapping Image layout */}
          <View style={s.imgContainer}>
            <View style={s.imgBorder} />
            <View style={s.imgWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' }}
                style={s.storyImg}
                resizeMode="cover"
              />
            </View>
          </View>

          <Text style={s.subHeading}>Câu Chuyện Của SORA</Text>
          <Text style={s.descText}>
            Lấy cảm hứng từ từ "Sora" (Bầu trời) trong tiếng Nhật – biểu tượng của sự tự do, vô hạn và thuần khiết. Mỗi thiết kế của SORA bắt đầu từ những nét phác thảo đầy đam mê, đi qua đôi bàn tay tài hoa của các nghệ nhân kim hoàn, để trở thành một tác phẩm nghệ thuật thu nhỏ.{'\n\n'}
            Chúng tôi tin rằng, trang sức cao cấp không cần phải quá phô trương, sự sang trọng thực sự nằm ở sự tối giản, tỉ mỉ và một câu chuyện có chiều sâu.
          </Text>
        </View>

        {/* 3. Mission & Vision */}
        <View style={s.missionVisionContainer}>
          {/* Mission Card */}
          <View style={s.mvCard}>
            <View style={[s.mvIndicator, { backgroundColor: '#9f273b' }]} />
            <Text style={s.mvLabel}>SỨ MỆNH</Text>
            <Text style={s.mvTitle}>Đánh thức vẻ đẹp tiềm ẩn</Text>
            <Text style={s.mvDesc}>
              Trao quyền cho người trẻ tự tin thể hiện bản ngã qua từng món trang sức chế tác tinh xảo. SORA đồng hành cùng bạn trong mọi khoảnh khắc, biến những điều bình dị trở nên phi thường.
            </Text>
          </View>

          {/* Vision Card */}
          <View style={s.mvCard}>
            <View style={[s.mvIndicator, { backgroundColor: '#e7ce7d' }]} />
            <Text style={[s.mvLabel, { color: '#8c826e' }]}>TẦM NHÌN</Text>
            <Text style={s.mvTitle}>Biểu tượng đương đại</Text>
            <Text style={s.mvDesc}>
              Trở thành thương hiệu trang sức cao cấp hàng đầu dành cho thế hệ Millennials và Gen Z tại Việt Nam. Định hình lại khái niệm "Luxury" – Hiện đại, Bền vững và Cầm nắm được cảm xúc.
            </Text>
          </View>
        </View>

        {/* 4. Core Values */}
        <View style={s.valuesSection}>
          <Text style={s.valuesHeader}>Giá Trị Cốt Lõi</Text>
          <View style={[s.titleDivider, { backgroundColor: '#e7ce7d', alignSelf: 'center', marginBottom: 30 }]} />

          {/* Value 1 */}
          <View style={s.valueRow}>
            <View style={s.iconCircle}>
              <Ionicons name="sparkles" size={24} color="#e7ce7d" />
            </View>
            <View style={s.valueTextWrap}>
              <Text style={s.valueTitle}>Chế Tác Thủ Công</Text>
              <Text style={s.valueDesc}>
                Mỗi sản phẩm là kết tinh từ hàng chục giờ lao động miệt mài của các nghệ nhân giàu kinh nghiệm.
              </Text>
            </View>
          </View>

          {/* Value 2 */}
          <View style={s.valueRow}>
            <View style={s.iconCircle}>
              <Ionicons name="ribbon-outline" size={24} color="#e7ce7d" />
            </View>
            <View style={s.valueTextWrap}>
              <Text style={s.valueTitle}>Thiết Kế Độc Bản</Text>
              <Text style={s.valueDesc}>
                Hướng tới phong cách Minimal tinh tế, không hòa lẫn. Tôn vinh vẻ đẹp cá nhân của người sở hữu.
              </Text>
            </View>
          </View>

          {/* Value 3 */}
          <View style={s.valueRow}>
            <View style={s.iconCircle}>
              <Ionicons name="leaf-outline" size={24} color="#e7ce7d" />
            </View>
            <View style={s.valueTextWrap}>
              <Text style={s.valueTitle}>Chất Liệu Bền Vững</Text>
              <Text style={s.valueDesc}>
                Tuyển chọn khắt khe từ Vàng, Bạc cao cấp đến Đá quý thiên nhiên, cam kết nguồn gốc minh bạch.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Material Stories */}
        <View style={s.materialsSection}>
          <Text style={s.sectionSubtitle}>Tuyệt Tác Từ Vật Liệu Cao Cấp</Text>
          <Text style={s.sectionLabel}>Sự kết hợp hoàn hảo giữa nét kiêu sa của đá quý và sự vĩnh cửu của kim loại quý.</Text>

          <View style={s.materialsGrid}>
            {/* Card 1 */}
            <View style={s.materialCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop' }}
                style={s.materialImg}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={s.materialOverlay}
              >
                <Text style={s.materialTitle}>Vàng 18K / 24K</Text>
                <Text style={s.materialDesc}>Sang trọng & Rạng rỡ</Text>
              </LinearGradient>
            </View>

            {/* Card 2 */}
            <View style={s.materialCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=600&auto=format&fit=crop' }}
                style={s.materialImg}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={s.materialOverlay}
              >
                <Text style={s.materialTitle}>Bạc Ý 925</Text>
                <Text style={s.materialDesc}>Thanh lịch & Hiện đại</Text>
              </LinearGradient>
            </View>

            {/* Card 3 */}
            <View style={s.materialCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1573408301145-b98c4af01158?q=80&w=600&auto=format&fit=crop' }}
                style={s.materialImg}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={s.materialOverlay}
              >
                <Text style={s.materialTitle}>Đá Quý & Kim Cương</Text>
                <Text style={s.materialDesc}>Tỏa sáng & Trường tồn</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* 6. Brand Commitments */}
        <View style={s.commitSection}>
          <Text style={s.commitHeader}>Lời Cam Kết Của Chúng Tôi</Text>

          <View style={s.commitGrid}>
            <View style={s.commitBox}>
              <View style={s.commitIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={26} color="#cc1e2e" />
              </View>
              <Text style={s.commitTxt}>BẢO HÀNH TRỌN ĐỜI</Text>
            </View>

            <View style={s.commitBox}>
              <View style={s.commitIconWrap}>
                <Ionicons name="gift-outline" size={26} color="#cc1e2e" />
              </View>
              <Text style={s.commitTxt}>BAO BÌ SANG TRỌNG</Text>
            </View>

            <View style={s.commitBox}>
              <View style={s.commitIconWrap}>
                <Ionicons name="sparkles-outline" size={26} color="#cc1e2e" />
              </View>
              <Text style={s.commitTxt}>LÀM SẠCH MIỄN PHÍ</Text>
            </View>

            <View style={s.commitBox}>
              <View style={s.commitIconWrap}>
                <Ionicons name="card-outline" size={26} color="#cc1e2e" />
              </View>
              <Text style={s.commitTxt}>THANH TOÁN AN TOÀN</Text>
            </View>
          </View>
        </View>

        {/* 7. CTA Section */}
        <View style={s.ctaSection}>
          <Ionicons name="sparkles" size={40} color="#e7ce7d" style={{ marginBottom: 20 }} />
          <Text style={s.ctaTitle}>Sẵn Sàng Tỏa Sáng Cùng SORA?</Text>
          <Text style={s.ctaDesc}>
            Hãy để chúng tôi giúp bạn tìm thấy món trang sức thuộc về riêng bạn. Một dấu ấn thời gian, một mảnh ghép hoàn hảo cho phong cách thường nhật.
          </Text>

          <TouchableOpacity
            style={s.ctaBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <Text style={s.ctaBtnTxt}>Khám Phá SORA</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fffdf6',
    paddingTop: Platform.OS === 'ios' ? 0 : 28,
  },
  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // 1. Hero Section
  heroSection: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#9f273b',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  heroSub: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 11,
    color: '#e7ce7d',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 10,
  },
  heroTitleText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    color: '#e7ce7d',
    letterSpacing: 6,
    marginBottom: 16,
  },
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#e7ce7d',
    marginBottom: 16,
  },
  heroSlogan: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },

  // 2. Core Story & Portrait
  storySection: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  sectionSubtitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#9f273b',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDivider: {
    width: 50,
    height: 2,
    backgroundColor: '#ebd5a3',
    alignSelf: 'center',
    marginBottom: 20,
  },
  leadText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14.5,
    color: '#555',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  imgContainer: {
    width: '100%',
    aspectRatio: 1.25,
    marginVertical: 20,
    position: 'relative',
  },
  imgBorder: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: '#e7ce7d',
    zIndex: 1,
  },
  imgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 15,
    bottom: 15,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storyImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  subHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  descText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13.5,
    color: '#666',
    lineHeight: 22,
  },

  // 3. Mission & Vision
  missionVisionContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 20,
  },
  mvCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2eae0',
    padding: 24,
    paddingLeft: 28,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  mvIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  mvLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#9f273b',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  mvTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  mvDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 21,
  },

  // 4. Core Values
  valuesSection: {
    backgroundColor: '#9f273b',
    marginTop: 44,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  valuesHeader: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#e7ce7d',
    textAlign: 'center',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    marginBottom: 26,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e7ce7d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(231, 206, 125, 0.08)',
  },
  valueTextWrap: {
    flex: 1,
  },
  valueTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#e7ce7d',
    marginBottom: 6,
  },
  valueDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
  },

  // 5. Materials Section
  materialsSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionLabel: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#8c826e',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 24,
  },
  materialsGrid: {
    gap: 16,
  },
  materialCard: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  materialImg: {
    width: '100%',
    height: '100%',
  },
  materialOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 16,
  },
  materialTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#e7ce7d',
    marginBottom: 2,
  },
  materialDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  // 6. Commitments Section
  commitSection: {
    marginTop: 44,
    backgroundColor: '#f4f1ee',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  commitHeader: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#9f273b',
    textAlign: 'center',
    marginBottom: 28,
  },
  commitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  commitBox: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  commitIconWrap: {
    marginBottom: 12,
  },
  commitTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#333',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // 7. CTA Section
  ctaSection: {
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fffdf6',
  },
  ctaTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#9f273b',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 290,
  },
  ctaBtn: {
    backgroundColor: '#9f273b',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#e7ce7d',
    shadowColor: '#9f273b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
