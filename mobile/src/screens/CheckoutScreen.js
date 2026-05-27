import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import { showCustomAlert } from "../components/CustomAlert";

// Mock Alert to use CustomAlert globally in this screen
const OriginalAlert = Alert;
const CustomAlertShim = {
  alert: (title, message, buttons, options) => {
    showCustomAlert(title, message, buttons);
  }
};

const { width } = Dimensions.get("window");

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function CheckoutScreen({ route }) {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Retrieve checkout items passed from Cart, fallback to dummy
  const [checkoutItems, setCheckoutItems] = useState(route?.params?.checkoutItems || []);

  // Personal Info States
  const [personalName, setPersonalName] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  // API Data
  const [apiCoupons, setApiCoupons] = useState([]);
  const [tierDiscountInfo, setTierDiscountInfo] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      const sessionId = await AsyncStorage.getItem("cart_session_id");

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (sessionId) headers["X-Cart-Session-Id"] = sessionId;

      const res = await fetch(`${API_BASE_URL}/client/checkout/init`, { headers });
      const json = await res.json();

      if (json.success) {
        // We do not override checkoutItems with json.cart_items because they are raw unmapped items.
        // We rely on the pre-mapped checkoutItems passed via navigation route params.
        if (json.addresses) {
          setAddresses(json.addresses);
          const defaultAddr = json.addresses.find((a) => a.is_default);
          if (defaultAddr) {
            setSelectedAddrId(defaultAddr.id);
          } else if (json.addresses.length > 0) {
            setSelectedAddrId(json.addresses[0].id);
          }
        }
        if (json.user) {
          setPersonalName(json.user.name || "");
          setPersonalPhone(json.user.phone || "");
          setPersonalEmail(json.user.email || "");
        }
        if (json.coupons) setApiCoupons(json.coupons);
        if (json.tier_discount) setTierDiscountInfo(json.tier_discount);
      }
    } catch (error) {
      console.log("Error fetching init data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Address Modal States
  const [isAddAddrVisible, setIsAddAddrVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newReceiver, setNewReceiver] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDetail, setNewDetail] = useState("");

  // States
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // vnpay, momo, cod, bank
  const [note, setNote] = useState("");

  // Custom Modal for Order Success
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [orderId] = useState(
    () => "SORA-" + Math.floor(100000 + Math.random() * 900000),
  );

  // Subtotal Calculation
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || item.qty || 1),
    0,
  );
  const shippingFee = 0; // Miễn phí vận chuyển bảo mật

  const tierDiscountAmount = tierDiscountInfo ? subtotal * (tierDiscountInfo.discount_percent / 100) : 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount - tierDiscountAmount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const coupon = apiCoupons.find((c) => c.code.toUpperCase() === code);
    if (!coupon) {
      showCustomAlert("Mã giảm giá", "Mã không tồn tại hoặc đã hết hạn.");
      return;
    }

    if (coupon.min_spend && subtotal < coupon.min_spend) {
      showCustomAlert("Mã giảm giá", `Đơn hàng chưa đạt giá trị tối thiểu (${fmt(coupon.min_spend)}) để áp dụng mã này.`);
      return;
    }

    let discount = 0;
    if (coupon.type === "fixed") {
      discount = coupon.value;
    } else {
      discount = subtotal * (coupon.value / 100);
    }

    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }

    setDiscountAmount(discount);
    setAppliedCode(code);
    showCustomAlert(
      "Mã giảm giá",
      `Áp dụng thành công mã "${code}"!`,
    );
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    setAppliedCode("");
    setPromoCode("");
  };

  const handleDeleteAddress = (id) => {
    if (id === "addr_1" || id === "addr_2" || id === "addr_3") {
      showCustomAlert("Địa chỉ", "Không thể xoá địa chỉ mặc định của hệ thống!");
      return;
    }
    showCustomAlert(
      "Xoá địa chỉ",
      "Bạn chắc chắn muốn xoá địa chỉ giao hàng này?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            setAddresses((prev) => prev.filter((a) => a.id !== id));
            if (selectedAddrId === id) {
              setSelectedAddrId("addr_1");
            }
          },
        },
      ],
    );
  };

  const handleAddNewAddress = () => {
    if (
      !newLabel.trim() ||
      !newReceiver.trim() ||
      !newPhone.trim() ||
      !newDetail.trim()
    ) {
      showCustomAlert("Lỗi", "Vui lòng điền đầy đủ tất cả thông tin!");
      return;
    }
    const newId = "addr_" + Date.now();
    const newAddr = {
      id: newId,
      is_local: true,
      label: newLabel.trim(),
      receiver: newReceiver.trim(),
      phone: newPhone.trim(),
      detail: newDetail.trim(),
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddrId(newId);

    // Clear and Close
    setNewLabel("");
    setNewReceiver("");
    setNewPhone("");
    setNewDetail("");
    setIsAddAddrVisible(false);

    showCustomAlert("Thành công", "Đã thêm và lựa chọn địa chỉ giao hàng mới!");
  };

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      showCustomAlert("Lỗi", "Giỏ hàng trống.");
      return;
    }

    if (addresses.length > 0 && !selectedAddrId) {
      showCustomAlert("Lỗi", "Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    if (addresses.length === 0 && (!personalName.trim() || !personalPhone.trim())) {
      showCustomAlert("Lỗi", "Vui lòng cung cấp địa chỉ giao hàng.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const token = await AsyncStorage.getItem("auth_token");
      const sessionId = await AsyncStorage.getItem("cart_session_id");

      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (sessionId) headers["X-Cart-Session-Id"] = sessionId;

      let payload = {
        customer_name: personalName,
        customer_phone: personalPhone,
        customer_email: personalEmail,
        order_note: note,
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
      };

      if (appliedCode) {
        payload.coupon_code = appliedCode;
      }

      const selectedAddress = addresses.find(a => a.id === selectedAddrId);
      if (selectedAddress?.is_local) {
        payload.customer_name = selectedAddress.receiver || personalName;
        payload.customer_phone = selectedAddress.phone || personalPhone;
        payload.customer_address = selectedAddress.detail || "Chưa có địa chỉ chi tiết";
      } else if (selectedAddress) {
        payload.user_address_id = selectedAddress.id;
      } else {
        payload.customer_address = newDetail || "Chưa có địa chỉ chi tiết";
      }

      const res = await fetch(`${API_BASE_URL}/client/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        if (json.payment_url) {
          showCustomAlert("Thành công", "Đang chuyển hướng thanh toán...");
          setCreatedOrder(json.data);
          setIsSuccessModalVisible(true);
        } else {
          setCreatedOrder(json.data);
          setIsSuccessModalVisible(true);
        }
      } else {
        showCustomAlert("Lỗi đặt hàng", json.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.log("Error placing order", error);
      showCustomAlert("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={{ marginTop: 10, fontFamily: "Oswald_500Medium", color: "#9f273b", fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Đang chuẩn bị thanh toán...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerInner}>
          <View style={s.headerIconRow}>
            <Ionicons name="shield-checkmark" size={16} color="#e7ce7d" />
            <Text style={s.headerSupTitle}>SORA SECURE CHECKOUT</Text>
          </View>
          <Text style={s.headerTitle}>Thanh Toán</Text>
          <View style={s.headerGoldLine} />
        </View>
        <View style={{ width: 38 }} />
        {/* Placeholder to balance back button */}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* ── SECTION 1: THÔNG TIN KHÁCH HÀNG (LIÊN HỆ) ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <Ionicons name="person-outline" size={18} color="#9f273b" />
              <Text style={s.sectionTitle}>Thông tin khách hàng</Text>
            </View>
            <TouchableOpacity
              style={s.editInfoBtn}
              onPress={() => {
                if (isEditingInfo) {
                  // Validate before saving
                  if (
                    !personalName.trim() ||
                    !personalPhone.trim() ||
                    !personalEmail.trim()
                  ) {
                    showCustomAlert(
                      "Lỗi",
                      "Vui lòng nhập đầy đủ thông tin khách hàng!",
                    );
                    return;
                  }
                }
                setIsEditingInfo(!isEditingInfo);
              }}
            >
              <Ionicons
                name={isEditingInfo ? "checkmark-circle" : "create-outline"}
                size={14}
                color="#9f273b"
              />
              <Text style={s.editInfoBtnTxt}>
                {isEditingInfo ? "LƯU" : "SỬA"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingInfo ? (
            <View style={s.editInfoForm}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Họ và tên</Text>
                <TextInput
                  style={s.infoTextInput}
                  value={personalName}
                  onChangeText={setPersonalName}
                  placeholder="Nhập họ và tên"
                />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={s.infoTextInput}
                  value={personalPhone}
                  onChangeText={setPersonalPhone}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Email</Text>
                <TextInput
                  style={s.infoTextInput}
                  value={personalEmail}
                  onChangeText={setPersonalEmail}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          ) : (
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Họ và tên:</Text>
                <Text style={s.infoVal}>{personalName}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Số điện thoại:</Text>
                <Text style={s.infoVal}>{personalPhone}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Email:</Text>
                <Text style={s.infoVal}>{personalEmail}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── SECTION 2: SỔ ĐỊA CHỈ (ĐỊA CHỈ NHẬN HÀNG) ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Ionicons name="location-outline" size={18} color="#9f273b" />
              <Text style={s.sectionTitle}>Địa chỉ nhận hàng</Text>
            </View>
            <TouchableOpacity
              style={s.editInfoBtn}
              onPress={() => setIsAddAddrVisible(true)}
            >
              <Ionicons name="add-circle" size={14} color="#9f273b" />
              <Text style={s.editInfoBtnTxt}>THÊM MỚI</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((addr) => {
            const isSelected = selectedAddrId === addr.id;
            const isDefault = addr.is_default;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[s.addrCard, isSelected && s.addrCardSelected]}
                onPress={() => setSelectedAddrId(addr.id)}
                activeOpacity={0.8}
              >
                <View style={s.addrCardHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      flex: 1,
                    }}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? "#9f273b" : "#aaa"}
                    />
                    <Text
                      style={[s.addrLabel, isSelected && s.addrLabelSelected]}
                      numberOfLines={1}
                    >
                      {addr.label || "Địa chỉ"}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {isSelected ? (
                      <View style={s.activeBadge}>
                        <Text style={s.activeBadgeTxt}>Chọn nhận</Text>
                      </View>
                    ) : null}
                    {!isDefault ? (
                      <TouchableOpacity
                        onPress={() => handleDeleteAddress(addr.id)}
                        style={{ padding: 4 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#cc1e2e"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <View style={s.addrBody}>
                  <Text style={s.addrUser}>
                    {addr.customer_name || addr.receiver || personalName}{" "}
                    <Text style={s.addrPhone}>• {addr.customer_phone || addr.phone || personalPhone}</Text>
                  </Text>
                  <Text style={s.addrDetail}>{addr.shipping_address || addr.detail}{addr.ward ? `, ${addr.ward}, ${addr.district}, ${addr.city}` : ""}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── SECTION 3: SẢN PHẨM TRONG ĐƠN ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="basket-outline" size={18} color="#9f273b" />
            <Text style={s.sectionTitle}>Sản phẩm trong đơn</Text>
          </View>

          <View style={s.orderItemsContainer}>
            {checkoutItems.map((item) => {
              return (
                <View key={item.id} style={s.orderItemRow}>
                  <Image source={{ uri: item.image }} style={s.orderItemImg} />
                  <View style={s.orderItemInfo}>
                    <Text style={s.orderItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.category ? (
                      <Text style={{ fontFamily: "Oswald_400Regular", fontSize: 10, color: "#888", marginBottom: 2 }}>
                        {item.category}
                      </Text>
                    ) : null}
                    <Text style={s.orderItemVariant}>{item.variant}</Text>
                    <View style={s.orderItemPriceRow}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={s.orderItemPrice}>{fmt(item.price)}</Text>
                        {item.oldPrice ? (
                          <Text style={{ fontFamily: "Oswald_400Regular", fontSize: 10, color: "#999", textDecorationLine: "line-through" }}>
                            {fmt(item.oldPrice)}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={s.orderItemQty}>SL: {item.qty}</Text>
                    </View>
                  </View>
                  <Text style={s.orderItemTotal}>
                    {fmt(item.price * item.qty)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── SECTION 4: PHƯƠNG THỨC THANH TOÁN ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="card-outline" size={18} color="#9f273b" />
            <Text style={s.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          {/* CỔNG MOMO */}
          <TouchableOpacity
            style={[
              s.payMethodRow,
              paymentMethod === "momo" && s.payMethodActive,
            ]}
            onPress={() => setPaymentMethod("momo")}
          >
            <View style={s.payMethodLeft}>
              <Ionicons
                name={
                  paymentMethod === "momo"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={paymentMethod === "momo" ? "#9f273b" : "#aaa"}
              />
              <Image
                source={{
                  uri: "https://developers.momo.vn/v3/vi/assets/images/transparent-background-logo-138ebf0ffca865ec0f1a7d9c1e4a9f3c.png",
                }}
                style={s.payIconImg}
              />
              <Text style={s.payMethodLabel}>Ví Điện Tử MoMo</Text>
            </View>
            <Text style={s.payBadge}>Tự động</Text>
          </TouchableOpacity>

          {/* CỔNG VNPAY */}
          <TouchableOpacity
            style={[
              s.payMethodRow,
              paymentMethod === "vnpay" && s.payMethodActive,
            ]}
            onPress={() => setPaymentMethod("vnpay")}
          >
            <View style={s.payMethodLeft}>
              <Ionicons
                name={
                  paymentMethod === "vnpay"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={paymentMethod === "vnpay" ? "#9f273b" : "#aaa"}
              />
              <Image
                source={{
                  uri: "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg",
                }}
                style={s.payIconImg}
              />
              <Text style={s.payMethodLabel}>Cổng thanh toán VNPay</Text>
            </View>
            <Text style={s.payBadge}>Ưu đãi thẻ</Text>
          </TouchableOpacity>

          {/* CỔNG CHUYỂN KHOẢN NGÂN HÀNG */}
          <TouchableOpacity
            style={[
              s.payMethodRow,
              paymentMethod === "bank" && s.payMethodActive,
            ]}
            onPress={() => setPaymentMethod("bank")}
          >
            <View style={s.payMethodLeft}>
              <Ionicons
                name={
                  paymentMethod === "bank"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={paymentMethod === "bank" ? "#9f273b" : "#aaa"}
              />
              <View style={[s.payIconBg, { backgroundColor: "#c5a85c" }]}>
                <MaterialCommunityIcons name="bank" size={16} color="#fff" />
              </View>
              <Text style={s.payMethodLabel}>Chuyển khoản trực tiếp</Text>
            </View>
            <Text style={s.payBadge}>Thủ công</Text>
          </TouchableOpacity>

          {/* THÔNG TIN CHUYỂN KHOẢN DYNAMIC */}
          {paymentMethod === "bank" ? (
            <View style={s.bankInfoBox}>
              <Text style={s.bankTitle}>THÔNG TIN TÀI KHOẢN SORA</Text>
              <View style={s.bankInfoRow}>
                <Text style={s.bankInfoLabel}>Ngân hàng:</Text>
                <Text style={s.bankInfoVal}>Vietcombank (VCB)</Text>
              </View>
              <View style={s.bankInfoRow}>
                <Text style={s.bankInfoLabel}>Số tài khoản:</Text>
                <Text style={s.bankInfoValCopy}>1023456789</Text>
              </View>
              <View style={s.bankInfoRow}>
                <Text style={s.bankInfoLabel}>Chủ tài khoản:</Text>
                <Text style={s.bankInfoVal}>
                  CÔNG TY CỔ PHẦN TRANG SỨC SORA
                </Text>
              </View>
              <View style={s.bankInfoRow}>
                <Text style={s.bankInfoLabel}>Nội dung:</Text>
                <Text style={s.bankInfoValHighlight}>SORA CK-{orderId}</Text>
              </View>
              <Text style={s.bankNotice}>
                * Vui lòng chuyển khoản đúng số tiền thanh toán bên dưới kèm nội
                dung chuyển khoản để hệ thống tự động duyệt nhanh nhất.
              </Text>
            </View>
          ) : null}

          {/* COD (CASH ON DELIVERY) */}
          <TouchableOpacity
            style={[
              s.payMethodRow,
              paymentMethod === "cod" && s.payMethodActive,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <View style={s.payMethodLeft}>
              <Ionicons
                name={
                  paymentMethod === "cod"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={paymentMethod === "cod" ? "#9f273b" : "#aaa"}
              />
              <View style={[s.payIconBg, { backgroundColor: "#2d6a4f" }]}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={16}
                  color="#fff"
                />
              </View>
              <Text style={s.payMethodLabel}>
                Thanh toán khi nhận hàng (COD)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── SECTION 5: GHI CHÚ ĐƠN HÀNG ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="create-outline" size={18} color="#9f273b" />
            <Text style={s.sectionTitle}>Ghi chú đơn hàng</Text>
          </View>
          <TextInput
            style={s.noteInput}
            placeholder="Ví dụ: Vui lòng giao giờ hành chính, gọi trước khi giao 15 phút, đóng gói hộp quà..."
            value={note}
            onChangeText={setNote}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* ── SECTION 6: MÃ GIẢM GIÁ ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="pricetag-outline" size={18} color="#9f273b" />
            <Text style={s.sectionTitle}>Mã ưu đãi (Coupon)</Text>
          </View>

          <View style={s.promoContainer}>
            <TextInput
              style={s.promoInput}
              placeholder="Nhập mã (Ví dụ: SORA10, VIPJEWELRY)"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              editable={!appliedCode}
            />
            {appliedCode ? (
              <TouchableOpacity
                style={s.promoBtnCancel}
                onPress={handleRemovePromo}
              >
                <Text style={s.promoBtnTxt}>HUỶ</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={s.promoBtnApply}
                onPress={handleApplyPromo}
              >
                <Text style={s.promoBtnTxt}>ÁP DỤNG</Text>
              </TouchableOpacity>
            )}
          </View>
          {appliedCode ? (
            <Text style={s.promoSuccessMsg}>
              <Ionicons name="checkmark-circle" size={12} color="green" /> Đã áp
              dụng mã thành công!
            </Text>
          ) : null}
        </View>

        {/* ── SECTION 7: TỔNG KẾT CHI PHÍ ── */}
        <View style={s.section}>
          <View style={s.costRow}>
            <Text style={s.costLabel}>Tạm tính:</Text>
            <Text style={s.costVal}>{fmt(subtotal)}</Text>
          </View>
          <View style={s.costRow}>
            <Text style={s.costLabel}>Phí vận chuyển bảo mật:</Text>
            <Text style={s.costValFree}>MIỄN PHÍ</Text>
          </View>
          {discountAmount > 0 ? (
            <View style={s.costRow}>
              <Text style={s.costLabel}>Mã giảm giá:</Text>
              <Text style={s.costValDiscount}>-{fmt(discountAmount)}</Text>
            </View>
          ) : null}
          {tierDiscountAmount > 0 ? (
            <View style={s.costRow}>
              <Text style={s.costLabel}>Hạng thành viên ({tierDiscountInfo?.tier_name}):</Text>
              <Text style={s.costValDiscount}>-{fmt(tierDiscountAmount)}</Text>
            </View>
          ) : null}
          <View style={[s.costRow, s.costRowTotal]}>
            <Text style={s.costLabelTotal}>TỔNG THANH TOÁN:</Text>
            <Text style={s.costValTotal}>{fmt(total)}</Text>
          </View>
        </View>

        {/* BUTTON ĐẶT HÀNG */}
        <TouchableOpacity
          style={[s.placeOrderBtn, isPlacingOrder && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          activeOpacity={0.9}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={s.placeOrderBtnTxt}>ĐẶT HÀNG AN TOÀN NGAY</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODAL ĐẶT HÀNG THÀNH CÔNG ── */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={s.modalBg}>
          <View style={s.modalContainer}>
            <View style={s.successCircle}>
              <Ionicons name="checkmark" size={48} color="#e7ce7d" />
            </View>

            <Text style={s.modalTitle}>Đặt Hàng Thành Công!</Text>
            <Text style={s.modalSup}>Cảm ơn bạn đã tin tưởng SORA Jewelry</Text>

            <View style={s.orderSummaryBox}>
              <Text style={s.summaryTitle}>CHI TIẾT ĐƠN HÀNG</Text>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Mã đơn hàng:</Text>
                <Text style={s.summaryValHighlight}>{createdOrder ? createdOrder.order_code : orderId}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Tổng thanh toán:</Text>
                <Text style={s.summaryVal}>{fmt(total)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Phương thức:</Text>
                <Text style={s.summaryVal}>
                  {paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : paymentMethod === "momo"
                      ? "Ví điện tử MoMo"
                      : paymentMethod === "vnpay"
                        ? "Cổng VNPay"
                        : paymentMethod === "bank"
                          ? "Chuyển khoản trực tiếp"
                          : ""}
                </Text>
              </View>
            </View>

            <Text style={s.successNotice}>
              Nhân viên chăm sóc khách hàng của SORA sẽ liên hệ qua điện thoại
              để xác nhận đơn hàng của bạn trong vòng 15 phút.
            </Text>

            <TouchableOpacity
              style={s.continueBtn}
              onPress={handleCloseSuccess}
            >
              <Text style={s.continueBtnTxt}>TIẾP TỤC MUA SẮM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL THÊM ĐỊA CHỈ MỚI ── */}
      <Modal
        visible={isAddAddrVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={s.modalBg}>
          <View style={s.addrModalContainer}>
            <Text style={s.addrModalTitle}>Thêm Địa Chỉ Giao Hàng</Text>

            <ScrollView
              style={{ width: "100%" }}
              showsVerticalScrollIndicator={false}
            >
              <View style={s.modalInputGroup}>
                <Text style={s.modalInputLabel}>
                  Tên sổ địa chỉ (ví dụ: Nhà riêng, Công ty...)
                </Text>
                <TextInput
                  style={s.modalTextInput}
                  value={newLabel}
                  onChangeText={setNewLabel}
                  placeholder="Nhà riêng, Văn phòng..."
                />
              </View>

              <View style={s.modalInputGroup}>
                <Text style={s.modalInputLabel}>Họ và tên người nhận</Text>
                <TextInput
                  style={s.modalTextInput}
                  value={newReceiver}
                  onChangeText={setNewReceiver}
                  placeholder="Nhập tên người nhận"
                />
              </View>

              <View style={s.modalInputGroup}>
                <Text style={s.modalInputLabel}>Số điện thoại nhận hàng</Text>
                <TextInput
                  style={s.modalTextInput}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={s.modalInputGroup}>
                <Text style={s.modalInputLabel}>
                  Địa chỉ chi tiết (Số nhà, đường, quận, tp...)
                </Text>
                <TextInput
                  style={[s.modalTextInput, { minHeight: 60 }]}
                  value={newDetail}
                  onChangeText={setNewDetail}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/tp..."
                  multiline={true}
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => {
                  setIsAddAddrVisible(false);
                  setNewLabel("");
                  setNewReceiver("");
                  setNewPhone("");
                  setNewDetail("");
                }}
              >
                <Text style={s.modalBtnCancelTxt}>HUỶ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSave]}
                onPress={handleAddNewAddress}
              >
                <Text style={s.modalBtnSaveTxt}>LƯU ĐỊA CHỈ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // HEADER
  header: {
    backgroundColor: "#9f273b",
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInner: {
    alignItems: "center",
    flex: 1,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  headerSupTitle: {
    fontFamily: "Oswald_400Regular",
    fontSize: 9,
    letterSpacing: 2,
    color: "#e7ce7d",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#fff",
    marginBottom: 8,
  },
  headerGoldLine: {
    width: 44,
    height: 2,
    backgroundColor: "#e7ce7d",
    borderRadius: 2,
  },

  scroll: { flex: 1 },

  // SECTIONS
  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 14,
    color: "#222",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // INFO CARD
  infoCard: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#888",
  },
  infoVal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 13,
    color: "#333",
  },

  // ADDRESS CARDS
  addrCard: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  addrCardSelected: {
    borderColor: "#9f273b",
    backgroundColor: "#fffafa",
  },
  addrCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addrLabel: {
    fontFamily: "Oswald_500Medium",
    fontSize: 13,
    color: "#555",
  },
  addrLabelSelected: {
    color: "#9f273b",
  },
  activeBadge: {
    backgroundColor: "#9f273b",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 9,
    color: "#fff",
    textTransform: "uppercase",
  },
  addrBody: {
    paddingLeft: 24,
  },
  addrUser: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
    marginBottom: 2,
  },
  addrPhone: {
    color: "#666",
    fontWeight: "normal",
  },
  addrDetail: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
  },
  addNewAddrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#9f273b",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 6,
  },
  addNewAddrTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#9f273b",
  },

  // ORDER ITEMS
  orderItemsContainer: {
    gap: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderItemImg: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  orderItemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  orderItemName: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
    textTransform: "uppercase",
  },
  orderItemVariant: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
  },
  orderItemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 3,
  },
  orderItemPrice: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 11,
    color: "#9f273b",
  },
  orderItemQty: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    color: "#666",
  },
  orderItemTotal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
  },

  // PROMO CODE
  promoContainer: {
    flexDirection: "row",
    gap: 8,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: "Oswald_400Regular",
    backgroundColor: "#fafafa",
  },
  promoBtnApply: {
    backgroundColor: "#9f273b",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  promoBtnCancel: {
    backgroundColor: "#6c757d",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  promoBtnTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 0.5,
  },
  promoSuccessMsg: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "green",
    marginTop: 6,
  },

  // PAYMENT METHODS
  payMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  payMethodActive: {
    borderColor: "#9f273b",
    backgroundColor: "#fffafa",
  },
  payMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  payIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  payIconTxt: {
    color: "#fff",
    fontFamily: "Oswald_600SemiBold",
    fontSize: 11,
  },
  payIconImg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    resizeMode: "contain",
  },
  payMethodLabel: {
    fontFamily: "Oswald_500Medium",
    fontSize: 13,
    color: "#333",
  },
  payBadge: {
    fontFamily: "Oswald_500Medium",
    fontSize: 9,
    color: "#dbb758",
    backgroundColor: "#fbf6e8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // BANK BOX DYNAMIC
  bankInfoBox: {
    backgroundColor: "#fbf6e8",
    borderColor: "#e7ce7d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
    gap: 6,
  },
  bankTitle: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 11,
    color: "#8b6e30",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bankInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bankInfoLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    color: "#666",
  },
  bankInfoVal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
  },
  bankInfoValCopy: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#9f273b",
  },
  bankInfoValHighlight: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#8b6e30",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e7ce7d",
  },
  bankNotice: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    color: "#9e844a",
    lineHeight: 14,
    marginTop: 6,
  },

  // NOTES
  noteInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: "Oswald_400Regular",
    backgroundColor: "#fafafa",
    minHeight: 60,
  },

  // COSTS
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  costLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#888",
  },
  costVal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 13,
    color: "#333",
  },
  costValFree: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#28a745",
  },
  costValDiscount: {
    fontFamily: "Oswald_500Medium",
    fontSize: 13,
    color: "#dc3545",
  },
  costRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 6,
  },
  costLabelTotal: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#222",
  },
  costValTotal: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: "#9f273b",
  },

  // BUTTON PLACE ORDER
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9f273b",
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 14,
    shadowColor: "#9f273b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  placeOrderBtnTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 14,
    color: "#fff",
    letterSpacing: 1.5,
  },

  // MODAL SUCCESS
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.88,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9f273b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#e7ce7d",
  },
  modalTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#9f273b",
    marginBottom: 4,
  },
  modalSup: {
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    color: "#777",
    marginBottom: 20,
  },
  orderSummaryBox: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  summaryTitle: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 11,
    color: "#888",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    color: "#666",
  },
  summaryVal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
  },
  summaryValHighlight: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#9f273b",
  },
  successNotice: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 24,
  },
  continueBtn: {
    width: "100%",
    backgroundColor: "#9f273b",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  continueBtnTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 1.5,
  },
  // EDIT CUSTOMER INFO STYLES
  editInfoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9f273b",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editInfoBtnTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 10,
    color: "#9f273b",
  },
  editInfoForm: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#777",
    textTransform: "uppercase",
  },
  infoTextInput: {
    borderWidth: 1,
    borderColor: "#e7ce7d",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#333",
    backgroundColor: "#fafafa",
  },

  // ADD ADDRESS MODAL STYLES
  addrModalContainer: {
    width: width * 0.9,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  addrModalTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#9f273b",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInputGroup: {
    marginBottom: 12,
    width: "100%",
  },
  modalInputLabel: {
    fontFamily: "Oswald_500Medium",
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#333",
    backgroundColor: "#fafafa",
    width: "100%",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalBtnCancelTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#666",
  },
  modalBtnSave: {
    backgroundColor: "#9f273b",
  },
  modalBtnSaveTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 0.5,
  },
});
