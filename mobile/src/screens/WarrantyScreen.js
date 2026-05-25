import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// FAQ data from frontend web app
const FAQ_SECTIONS = [
  {
    title: 'Đặt Hàng & Sản Phẩm',
    icon: 'cart-outline',
    data: [
      {
        question: 'Làm thế nào để chọn đúng size nhẫn / vòng tay?',
        answer: 'SORA có Bảng hướng dẫn đo size chi tiết trên mỗi sản phẩm. Bạn có thể đo bằng thước dây hoặc tham chiếu với trang sức có sẵn. Nếu cần hỗ trợ, chuyên viên SORA luôn trực tuyến để hướng dẫn bạn.',
      },
      {
        question: 'SORA có nhận thiết kế trang sức theo yêu cầu (Bespoke) không?',
        answer: 'Hoàn toàn có thể. SORA cung cấp dịch vụ Bespoke Jewelry. Đội ngũ thiết kế 3D và nghệ nhân kim hoàn của chúng tôi sẽ hiện thực hóa ý tưởng độc bản của riêng bạn.',
      },
      {
        question: 'Sản phẩm có đi kèm Giấy chứng nhận kiểm định không?',
        answer: 'Tất cả sản phẩm Kim cương thiên nhiên (từ 3ly6) và Đá quý cao cấp đều đi kèm Giấy chứng nhận chất lượng từ các tổ chức uy tín (GIA, PNJ Lab, Doji Lab). Sản phẩm vàng/bạc đều có giấy đảm bảo tuổi vàng chuẩn xác.',
      },
    ],
  },
  {
    title: 'Giao Hàng & Nhận Hàng',
    icon: 'bus-outline',
    data: [
      {
        question: 'Thời gian giao hàng dự kiến là bao lâu?',
        answer: '• Nội thành TP.HCM/Hà Nội: Hỏa tốc 2-4 tiếng (hàng có sẵn).\n• Các tỉnh thành khác: 2 - 4 ngày làm việc thông qua đối tác vận chuyển bảo hiểm.\n• Hàng đặt trước (Pre-order/Custom): Thời gian chế tác và giao hàng khoảng 10 - 15 ngày.',
      },
      {
        question: 'Kiện hàng trang sức giá trị cao gửi đi có an toàn không?',
        answer: 'SORA cam kết chịu 100% rủi ro trong quá trình vận chuyển. Mọi kiện hàng đều được mua bảo hiểm toàn giá trị, đóng gói niêm phong bảo mật đa lớp và yêu cầu xác thực bằng giấy tờ tùy thân khi nhận.',
      },
    ],
  },
  {
    title: 'Bảo Hành & Hậu Mãi',
    icon: 'shield-checkmark-outline',
    data: [
      {
        question: 'Chính sách bảo hành cơ bản của SORA gồm những gì?',
        answer: 'Bảo hành TRỌN ĐỜI miễn phí các dịch vụ: Làm sạch sóng siêu âm, kiểm tra ổ chấu giữ đá. Bảo hành 6 tháng đối với lỗi kỹ thuật (rơi đá tấm, đứt dây chuyền do lỗi sản xuất). Hỗ trợ xi mạ, cắt/nối size ưu đãi cho Thành viên.',
      },
    ],
  },
  {
    title: 'Thanh Toán & Bảo Mật',
    icon: 'card-outline',
    data: [
      {
        question: 'SORA hỗ trợ những hình thức thanh toán nào?',
        answer: 'Đa dạng phương thức thanh toán an toàn: Chuyển khoản ngân hàng, Thẻ tín dụng/ATM nội địa (qua VNPay), Ví điện tử, và Thanh toán tiền mặt khi nhận hàng (COD - Yêu cầu cọc trước 10% với đơn hàng trên 5 triệu).',
      },
    ],
  },
];

export default function WarrantyScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'faq'
  const [expandedFaq, setExpandedFaq] = useState(null); // 'section-index' format e.g. "0-1"

  const toggleFaq = (indexStr) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedFaq === indexStr) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(indexStr);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Chính Sách & FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabsContainer}>
        <TouchableOpacity
          style={[s.tabButton, activeTab === 'policy' && s.tabButtonActive]}
          onPress={() => setActiveTab('policy')}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={18} color={activeTab === 'policy' ? '#9f273b' : '#666'} style={{ marginRight: 6 }} />
          <Text style={[s.tabButtonText, activeTab === 'policy' && s.tabButtonTextActive]}>Chính sách bảo hành</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tabButton, activeTab === 'faq' && s.tabButtonActive]}
          onPress={() => setActiveTab('faq')}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle" size={19} color={activeTab === 'faq' ? '#9f273b' : '#666'} style={{ marginRight: 6 }} />
          <Text style={[s.tabButtonText, activeTab === 'faq' && s.tabButtonTextActive]}>Giải đáp FAQ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'policy' ? (
          <View>
            {/* Intro Hero banner style */}
            <View style={s.heroCard}>
              <Text style={s.heroSub}>SORA JEWELRY</Text>
              <Text style={s.heroTitle}>Chính Sách Đổi Trả & Thu Mua</Text>
              <View style={s.heroDivider} />
              <Text style={s.heroDesc}>
                Tại SORA, chúng tôi trân trọng mọi quyết định của bạn. Chính sách hậu mãi được thiết kế rõ ràng nhằm bảo vệ quyền lợi tối đa cho khách hàng.
              </Text>
            </View>

            {/* Mốc thời gian 1 */}
            <View style={s.card}>
              <View style={[s.badge, { backgroundColor: '#9f273b' }]}>
                <Text style={s.badgeTxt}>Mốc 1: Dưới 7 ngày</Text>
              </View>
              <Text style={s.cardTitle}>Đổi Trả Sự Hài Lòng</Text>
              <Text style={s.cardDesc}>
                Trong vòng 07 ngày đầu tiên, chúng tôi hỗ trợ <Text style={s.highlight}>Hoàn tiền 100%</Text> hoặc đổi sang thiết kế khác nếu bạn chưa thực sự ưng ý.
              </Text>
              
              <Text style={s.sectionLabel}>ĐIỀU KIỆN TIÊN QUYẾT:</Text>
              
              <View style={s.ruleRow}>
                <Ionicons name="checkmark-circle" size={18} color="#9f273b" style={s.ruleIcon} />
                <Text style={s.ruleTxt}>Sản phẩm phải còn nguyên vẹn 100%, chưa qua sử dụng.</Text>
              </View>
              <View style={s.ruleRow}>
                <Ionicons name="lock-closed" size={18} color="#9f273b" style={s.ruleIcon} />
                <Text style={s.ruleTxt}>
                  <Text style={s.bold}>Tem niêm phong (Security Tag) CÒN NGUYÊN VẸN</Text>, chưa bị cắt đứt hay tháo rời (Bắt buộc).
                </Text>
              </View>
              <View style={s.ruleRow}>
                <Ionicons name="cube" size={18} color="#9f273b" style={s.ruleIcon} />
                <Text style={s.ruleTxt}>Đầy đủ hộp, phụ kiện, hóa đơn và giấy kiểm định đi kèm.</Text>
              </View>
            </View>

            {/* Mốc thời gian 2 */}
            <View style={s.card}>
              <View style={[s.badge, { backgroundColor: '#333' }]}>
                <Text style={s.badgeTxt}>Mốc 2: Từ ngày thứ 8</Text>
              </View>
              <Text style={s.cardTitle}>Chính Sách Thu Đổi</Text>
              <Text style={s.cardDesc}>
                Khi tem niêm phong đã được cắt, trang sức chính thức thuộc về bạn. Chúng tôi áp dụng tỷ lệ thu mua tối ưu nhất:
              </Text>

              <View style={s.tradeInRow}>
                <View style={s.tradeInInfo}>
                  <Ionicons name="sync" size={18} color="#9f273b" style={{ marginRight: 8 }} />
                  <Text style={s.tradeInLabel}>Thu Đổi Sản Phẩm Mới (Trade-in):</Text>
                </View>
                <View style={s.tradeInValueContainer}>
                  <Text style={s.tradeInValue}>80% - 85%</Text>
                  <Text style={s.tradeInSub}>giá trị hoá đơn</Text>
                </View>
              </View>

              <View style={[s.tradeInRow, { borderLeftColor: '#333' }]}>
                <View style={s.tradeInInfo}>
                  <Ionicons name="cash-outline" size={18} color="#333" style={{ marginRight: 8 }} />
                  <Text style={s.tradeInLabel}>Bán Lại Tiền Mặt (Cash-out):</Text>
                </View>
                <View style={s.tradeInValueContainer}>
                  <Text style={[s.tradeInValue, { color: '#333' }]}>70% - 75%</Text>
                  <Text style={s.tradeInSub}>giá trị hoá đơn</Text>
                </View>
              </View>
            </View>

            {/* Lưu ý quan trọng */}
            <Text style={s.sectionHeader}>Điều Khoản & Lưu Ý Quan Trọng</Text>

            <View style={s.gridContainer}>
              <View style={s.gridCard}>
                <Ionicons name="create-outline" size={22} color="#9f273b" />
                <Text style={s.gridTitle}>Hàng Đặt Riêng</Text>
                <Text style={s.gridDesc}>Sản phẩm Custom-made hoặc khắc tên KHÔNG áp dụng hoàn tiền 100%. Hỗ trợ thu mua theo trọng lượng thực tế.</Text>
              </View>

              <View style={s.gridCard}>
                <Ionicons name="analytics" size={22} color="#9f273b" />
                <Text style={s.gridTitle}>Giám Định Đá Quý</Text>
                <Text style={s.gridDesc}>Kim cương/Đá quý trên 10 triệu cần 2-3 ngày làm việc để Chuyên viên kiểm tra trước khi hoàn tiền.</Text>
              </View>

              <View style={s.gridCard}>
                <Ionicons name="trending-up" size={22} color="#9f273b" />
                <Text style={s.gridTitle}>Biến Động Giá</Text>
                <Text style={s.gridDesc}>Trang sức Vàng Trơn thu lại dựa trên trọng lượng thực tế nhân với tỷ giá niêm yết tại thời điểm giao dịch.</Text>
              </View>

              <View style={s.gridCard}>
                <Ionicons name="gift-outline" size={22} color="#9f273b" />
                <Text style={s.gridTitle}>Khuyến Mãi</Text>
                <Text style={s.gridDesc}>Hoàn tiền dựa trên giá thực tế khách trả. Giá trị quà khuyến mãi đi kèm sẽ khấu trừ nếu không trả lại.</Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* FAQ Header */}
            <View style={[s.heroCard, { backgroundColor: '#fcfaf6', borderColor: '#ebd5a3' }]}>
              <Text style={[s.heroSub, { color: '#8c826e' }]}>SORA LẮNG NGHE</Text>
              <Text style={s.heroTitle}>Câu Hỏi Thường Gặp (FAQ)</Text>
              <View style={[s.heroDivider, { backgroundColor: '#ebd5a3' }]} />
              <Text style={s.heroDesc}>
                Tổng hợp giải đáp nhanh chóng cho các thắc mắc phổ biến nhất khi mua sắm tại SORA Jewelry.
              </Text>
            </View>

            {/* Accordion list */}
            {FAQ_SECTIONS.map((section, sIndex) => (
              <View key={sIndex} style={s.faqSection}>
                <View style={s.faqSectionHeader}>
                  <Ionicons name={section.icon} size={20} color="#9f273b" style={{ marginRight: 8 }} />
                  <Text style={s.faqSectionTitle}>{section.title}</Text>
                </View>

                {section.data.map((faq, fIndex) => {
                  const itemKey = `${sIndex}-${fIndex}`;
                  const isExpanded = expandedFaq === itemKey;
                  return (
                    <View key={fIndex} style={[s.faqItem, isExpanded && s.faqItemActive]}>
                      <TouchableOpacity
                        style={s.faqQuestionRow}
                        onPress={() => toggleFaq(itemKey)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.faqQuestionText, isExpanded && s.faqQuestionTextActive]}>
                          {faq.question}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={isExpanded ? '#9f273b' : '#8c826e'}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={s.faqAnswerContainer}>
                          <Text style={s.faqAnswerText}>{faq.answer}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'ios' ? 0 : 28 },
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },

  // Tabs style
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  tabButtonActive: {
    backgroundColor: '#fffdf9',
    borderColor: '#ebd5a3',
    borderWidth: 1.5,
  },
  tabButtonText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase',
  },
  tabButtonTextActive: {
    color: '#9f273b',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#9f273b',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#9f273b',
    marginBottom: 12,
  },
  heroDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Premium Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13.5,
    color: '#555',
    lineHeight: 21,
    marginBottom: 16,
  },
  highlight: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#9f273b',
  },
  sectionLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 11,
    color: '#8c826e',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  ruleTxt: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  bold: {
    fontFamily: 'Oswald_600SemiBold',
  },

  // Trade in row
  tradeInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderLeftWidth: 3,
    borderLeftColor: '#9f273b',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
  },
  tradeInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.7,
  },
  tradeInLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12.5,
    color: '#333',
  },
  tradeInValueContainer: {
    alignItems: 'flex-end',
    flex: 0.3,
  },
  tradeInValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#9f273b',
  },
  tradeInSub: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 9,
    color: '#888',
  },

  // Notes Grid
  sectionHeader: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2eae0',
    padding: 12,
    width: (width - 44) / 2, // Perfect split
    marginBottom: 8,
  },
  gridTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13.5,
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  gridDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11.5,
    color: '#666',
    lineHeight: 16,
  },

  // FAQ Accordion
  faqSection: {
    marginBottom: 20,
  },
  faqSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#9f273b',
    paddingBottom: 8,
    marginBottom: 12,
  },
  faqSectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#9f273b',
    textTransform: 'uppercase',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqItemActive: {
    borderColor: '#ebd5a3',
    borderLeftWidth: 3,
    borderLeftColor: '#9f273b',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestionText: {
    flex: 0.95,
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#444',
  },
  faqQuestionTextActive: {
    color: '#9f273b',
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#f5f5f5',
    paddingTop: 10,
    backgroundColor: '#fbfbfb',
  },
  faqAnswerText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12.5,
    color: '#666',
    lineHeight: 18.5,
  },
});
