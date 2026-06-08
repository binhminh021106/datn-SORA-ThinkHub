import React, { useRef, useState, useEffect } from "react";
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
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../config/api";
import { showCustomAlert } from "../components/CustomAlert";
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from "../styles/typography";

// Mock Alert to use CustomAlert globally in this screen
const OriginalAlert = Alert;
const CustomAlertShim = {
  alert: (title, message, buttons, options) => {
    showCustomAlert(title, message, buttons);
  }
};

const { width } = Dimensions.get("window");

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";
const MOMO_MIN_AMOUNT = 10000;
const MOMO_MAX_AMOUNT = 50000000;
const NEW_ADDRESS_API_URL = "https://esgoo.net/api-tinhthanh-new/4/0.htm";
const mapNewAddressProvinces = (items = []) => items.map((item) => ({
  code: item.id,
  name: item.full_name || item.name,
  wards: (item.data2 || []).map((ward) => ({
    code: ward.id,
    name: ward.full_name || ward.name,
  })),
}));

const fetchCheckoutInitData = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  const sessionId = await AsyncStorage.getItem("cart_session_id");

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers["X-Cart-Session-Id"] = sessionId;

  const res = await fetch(`${API_BASE_URL}/client/checkout/init`, { headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load checkout init data");
  }

  return json;
};

const fetchNewAddressProvinces = async () => {
  const res = await fetch(NEW_ADDRESS_API_URL);
  const data = await res.json();

  if (data?.error === 0 && Array.isArray(data.data)) {
    return mapNewAddressProvinces(data.data);
  }

  throw new Error("Province data is empty");
};

const getCheckoutHeaders = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  const sessionId = await AsyncStorage.getItem("cart_session_id");

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers["X-Cart-Session-Id"] = sessionId;

  return headers;
};

const fetchOrderStatus = async (orderCode) => {
  if (!orderCode) return null;

  const headers = await getCheckoutHeaders();
  const res = await fetch(`${API_BASE_URL}/client/orders/${orderCode}`, { headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Khong the kiem tra trang thai don hang.");
  }

  return json.data;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchOrderStatusWithRetry = async (orderCode, attempts = 3) => {
  let latestOrder = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    latestOrder = await fetchOrderStatus(orderCode);
    if (latestOrder?.payment_status === "paid") return latestOrder;
    if (attempt < attempts - 1) await wait(1500);
  }

  return latestOrder;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000, controller = new AbortController()) => {
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export default function CheckoutScreen({ route }) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const checkoutRequestControllerRef = useRef(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Retrieve checkout items passed from Cart, fallback to dummy
  const [checkoutItems, setCheckoutItems] = useState(route?.params?.checkoutItems || []);

  useEffect(() => {
    let isMounted = true;

    const requireLogin = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!isMounted) return;

      if (!token) {
        navigation.replace("Login");
        return;
      }

      setIsCheckingAuth(false);
    };

    requireLogin();

    return () => {
      isMounted = false;
    };
  }, [checkoutItems, navigation]);

  // Personal Info States
  const [personalName, setPersonalName] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  // API Data
  const [apiCoupons, setApiCoupons] = useState([]);
  const [tierDiscountInfo, setTierDiscountInfo] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  const checkoutInitQuery = useQuery({
    queryKey: ["checkout", "init"],
    queryFn: fetchCheckoutInitData,
    enabled: !isCheckingAuth,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    const json = checkoutInitQuery.data;
    if (!json?.success) return;

    if (Array.isArray(json.addresses)) {
      setAddresses(json.addresses);
      setSelectedAddrId((currentId) => {
        if (currentId && json.addresses.some((address) => address.id === currentId)) {
          return currentId;
        }
        const defaultAddr = json.addresses.find((address) => address.is_default);
        return defaultAddr?.id || json.addresses[0]?.id || null;
      });
    }

    if (json.user && !isEditingInfo) {
      setPersonalName(json.user.name || "");
      setPersonalPhone(json.user.phone || "");
      setPersonalEmail(json.user.email || "");
    }

    setApiCoupons(json.coupons || []);
    setTierDiscountInfo(json.tier_discount || null);
  }, [checkoutInitQuery.data, isEditingInfo]);

  const handleRefresh = () => {
    checkoutInitQuery.refetch();
  };

  const isLoading = checkoutInitQuery.isLoading && !checkoutInitQuery.data;
  const isRefreshing = checkoutInitQuery.isRefetching && !!checkoutInitQuery.data;

  // Add Address Modal States
  const [isAddAddrVisible, setIsAddAddrVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newReceiver, setNewReceiver] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newWard, setNewWard] = useState("");
  const [addressProvinces, setAddressProvinces] = useState([]);
  const [addressWards, setAddressWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [addressSelectorType, setAddressSelectorType] = useState(null);
  const [isAddressSelectorVisible, setIsAddressSelectorVisible] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [isManualAddressMode, setIsManualAddressMode] = useState(false);

  const addressProvinceQuery = useQuery({
    queryKey: ["address", "vietnam-34-provinces"],
    queryFn: fetchNewAddressProvinces,
    enabled: isAddressSelectorVisible && addressSelectorType === "city" && !isManualAddressMode,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  useEffect(() => {
    if (addressProvinceQuery.data) {
      setAddressProvinces(addressProvinceQuery.data);
    }
  }, [addressProvinceQuery.data]);

  useEffect(() => {
    if (!addressProvinceQuery.isError) return;
    setIsManualAddressMode(true);
    setIsAddressSelectorVisible(false);
    showCustomAlert("Địa chỉ", "Không thể tải danh sách Tỉnh / Thành phố. Bạn có thể tự nhập tay địa chỉ.");
  }, [addressProvinceQuery.isError]);

  useEffect(() => {
    return () => {
      if (checkoutRequestControllerRef.current) {
        checkoutRequestControllerRef.current.abort();
        checkoutRequestControllerRef.current = null;
      }
    };
  }, []);

  // States
  const [promoCode, setPromoCode] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // vnpay, momo, cod, bank
  const [note, setNote] = useState("");

  // Custom Modal for Order Success
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
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

  const resetNewAddressForm = () => {
    setNewLabel("");
    setNewReceiver("");
    setNewPhone("");
    setNewDetail("");
    setNewCity("");
    setNewDistrict("");
    setNewWard("");
    setSelectedProvinceCode(null);
    setAddressWards([]);
    setAddressSearchQuery("");
    setAddressSelectorType(null);
    setIsAddressSelectorVisible(false);
    setIsManualAddressMode(false);
  };

  const handleOpenAddressSelector = (type) => {
    setAddressSelectorType(type);
    setAddressSearchQuery("");
    setIsAddressSelectorVisible(true);

    if (type === "city") {
      queryClient.prefetchQuery({
        queryKey: ["address", "vietnam-34-provinces"],
        queryFn: fetchNewAddressProvinces,
        staleTime: 1000 * 60 * 60 * 24,
      });
    }
  };

  const getFilteredAddressItems = () => {
    const query = addressSearchQuery.trim().toLowerCase();
    const source = addressSelectorType === "city" ? addressProvinces : addressWards;

    if (!query) return source;
    return source.filter((item) => item.name.toLowerCase().includes(query));
  };

  const handleSelectAddressItem = (item) => {
    if (addressSelectorType === "city") {
      if (item.name !== newCity) {
        setNewCity(item.name);
        setSelectedProvinceCode(item.code);
        setNewDistrict("");
        setNewWard("");
        setAddressWards(item.wards || []);
      }
    } else if (addressSelectorType === "ward") {
      setNewWard(item.name);
    }

    setIsAddressSelectorVisible(false);
  };

  const handleAddNewAddress = () => {
    if (
      !newLabel.trim() ||
      !newReceiver.trim() ||
      !newPhone.trim() ||
      !newCity.trim() ||
      !newWard.trim() ||
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
      city: newCity.trim(),
      district: "",
      ward: newWard.trim(),
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddrId(newId);

    // Clear and Close
    resetNewAddressForm();
    setIsAddAddrVisible(false);

    showCustomAlert("Thành công", "Đã thêm và lựa chọn địa chỉ giao hàng mới!");
  };

  const getCheckoutCustomerInfo = () => {
    const selectedAddress = addresses.find((address) => address.id === selectedAddrId);
    const addressParts = selectedAddress
      ? [
        selectedAddress.shipping_address || selectedAddress.detail,
        selectedAddress.ward,
        selectedAddress.city,
      ].filter(Boolean)
      : [];

    return {
      selectedAddress,
      customerName: (selectedAddress?.customer_name || selectedAddress?.receiver || personalName).trim(),
      customerPhone: (selectedAddress?.customer_phone || selectedAddress?.phone || personalPhone).trim(),
      customerEmail: personalEmail.trim(),
      customerAddress: addressParts.join(", "),
    };
  };

  const validateCustomerContact = ({ customerName, customerPhone, customerEmail }) => {
    if (!customerName) {
      showCustomAlert("Thông tin khách hàng", "Vui lòng nhập họ tên người nhận hàng.");
      return false;
    }

    if (!customerPhone) {
      showCustomAlert("Thông tin khách hàng", "Vui lòng nhập số điện thoại người nhận hàng.");
      return false;
    }

    if (!/^[0-9\s\-+()]{9,15}$/.test(customerPhone)) {
      showCustomAlert("Thông tin khách hàng", "Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 15 ký tự.");
      return false;
    }

    if (!customerEmail) {
      showCustomAlert("Thông tin khách hàng", "Vui lòng nhập email để nhận hóa đơn.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      showCustomAlert("Thông tin khách hàng", "Email không đúng định dạng.");
      return false;
    }

    return true;
  };

  const validateCustomerInfo = (customerInfo) => {
    if (!validateCustomerContact(customerInfo)) return false;

    if (!customerInfo.customerAddress) {
      showCustomAlert("Địa chỉ giao hàng", "Vui lòng chọn hoặc thêm địa chỉ giao hàng cụ thể.");
      return false;
    }

    return true;
  };

  const handleOpenOrderConfirm = () => {
    if (checkoutItems.length === 0) {
      showCustomAlert("Lỗi", "Giỏ hàng trống.");
      return;
    }

    if (addresses.length > 0 && !selectedAddrId) {
      showCustomAlert("Lỗi", "Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    const customerInfo = getCheckoutCustomerInfo();
    if (!validateCustomerInfo(customerInfo)) return;

    setIsPlacingOrder(false);
    setIsConfirmModalVisible(true);
  };

  const handleSavePersonalInfo = async () => {
    const customerInfo = {
      customerName: personalName.trim(),
      customerPhone: personalPhone.trim(),
      customerEmail: personalEmail.trim(),
    };
    if (!validateCustomerContact(customerInfo)) return;

    const cleanPhone = customerInfo.customerPhone.replace(/[^0-9]/g, "");
    if (!/^0[35789][0-9]{8}$/.test(cleanPhone)) {
      showCustomAlert("Thông tin khách hàng", "Số điện thoại phải gồm 10 chữ số và đúng đầu số Việt Nam.");
      return;
    }

    setIsSavingPersonalInfo(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        showCustomAlert("Thông tin khách hàng", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", customerInfo.customerName);
      formData.append("phone", cleanPhone);
      formData.append("contact_only", "1");

      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || result.status !== true) {
        const message = result?.errors
          ? Object.values(result.errors).flat().join("\n")
          : result?.message || "Không thể cập nhật thông tin cá nhân.";
        showCustomAlert("Không thể lưu", message);
        return;
      }

      const updatedUser = result.data || {};
      setPersonalName(updatedUser.fullName || customerInfo.customerName);
      setPersonalPhone(updatedUser.phone || customerInfo.customerPhone);
      queryClient.setQueryData(["checkout", "init"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user: {
            ...(oldData.user || {}),
            ...updatedUser,
            name: updatedUser.fullName || customerInfo.customerName,
            phone: updatedUser.phone || cleanPhone,
          },
        };
      });
      try {
        const cached = await AsyncStorage.getItem("user");
        await AsyncStorage.setItem("user", JSON.stringify({
          ...(cached ? JSON.parse(cached) : {}),
          ...updatedUser,
        }));
      } catch (_) { }

      setIsEditingInfo(false);
      showCustomAlert("Thành công", "Thông tin cá nhân đã được cập nhật.");
    } catch (error) {
      console.log("Error saving checkout personal info", error);
      showCustomAlert("Lỗi kết nối", "Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSavingPersonalInfo(false);
    }
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

    const customerInfo = getCheckoutCustomerInfo();
    if (!validateCustomerInfo(customerInfo)) return;

    if (paymentMethod === "momo" && (total < MOMO_MIN_AMOUNT || total > MOMO_MAX_AMOUNT)) {
      setIsConfirmModalVisible(false);
      setTimeout(() => {
        showCustomAlert(
          "Không thể thanh toán MoMo",
          `MoMo chỉ hỗ trợ đơn hàng từ ${fmt(MOMO_MIN_AMOUNT)} đến ${fmt(MOMO_MAX_AMOUNT)}. Vui lòng chọn phương thức thanh toán khác hoặc điều chỉnh giá trị đơn hàng.`
        );
      }, 250);
      return;
    }
    try {
      setIsPlacingOrder(true);
      const checkoutController = new AbortController();
      checkoutRequestControllerRef.current = checkoutController;
      const headers = await getCheckoutHeaders();

      let payload = {
        customer_name: customerInfo.customerName,
        customer_phone: customerInfo.customerPhone,
        customer_email: customerInfo.customerEmail,
        customer_address: customerInfo.customerAddress,
        order_note: note,
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
        checkout_source: "mobile",
      };

      if (appliedCode) {
        payload.coupon_code = appliedCode;
      }

      const normalizedAffiliateCode = affiliateCode.trim();
      if (normalizedAffiliateCode) {
        payload.affiliate_code = normalizedAffiliateCode;
      }

      const selectedAddress = customerInfo.selectedAddress;
      if (selectedAddress?.is_local) {
        payload.customer_name = selectedAddress.receiver || personalName;
        payload.customer_phone = selectedAddress.phone || personalPhone;
        payload.customer_address = [
          selectedAddress.detail,
          selectedAddress.ward,
          selectedAddress.city,
        ].filter(Boolean).join(", ") || "Chưa có địa chỉ chi tiết";
      } else if (selectedAddress) {
        payload.user_address_id = selectedAddress.id;
      } else {
        payload.customer_address = newDetail || "Chưa có địa chỉ chi tiết";
      }

      const res = await fetchWithTimeout(`${API_BASE_URL}/client/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      }, 18000, checkoutController);

      const json = await res.json();
      console.log("Checkout response:", json);
      if (json.success) {
        setIsConfirmModalVisible(false);
        if (json.payment_url) {
          setIsPlacingOrder(false);
          handleMomoPayment({
            paymentUrl: json.payment_url,
            order: json.data,
          });
          return;
        } else if (paymentMethod === "momo") {
          showCustomAlert("Lỗi thanh toán", json.message || "MoMo chưa trả về đường dẫn thanh toán. Vui lòng thử lại.");
        } else {
          setCreatedOrder(json.data);
          setIsSuccessModalVisible(true);
        }
      } else {
        showCustomAlert("Lỗi đặt hàng", json.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.log("Error placing order", error);
      if (error?.name !== "AbortError") {
        showCustomAlert("Lỗi", "Không thể kết nối đến máy chủ.");
      }
    } finally {
      checkoutRequestControllerRef.current = null;
      setIsPlacingOrder(false);
    }
  };

  const handleCloseOrderConfirm = () => {
    if (checkoutRequestControllerRef.current) {
      checkoutRequestControllerRef.current.abort();
      checkoutRequestControllerRef.current = null;
    }
    setIsPlacingOrder(false);
    setIsConfirmModalVisible(false);
  };

  async function handleMomoPayment({ paymentUrl, order }) {
    const orderCode = order?.order_code;

    try {
      await Linking.openURL(paymentUrl);
    } catch (error) {
      console.log("Error opening MoMo payment URL", error);
      showCustomAlert("Lỗi thanh toán", "Không thể mở cổng thanh toán MoMo. Vui lòng thử lại.");
      return;
    }

    if (!orderCode) {
      showCustomAlert(
        "Đơn hàng đang xử lý",
        "Đơn hàng MoMo đã được tạo nhưng app chưa nhận được mã đơn để kiểm tra tự động. Bạn có thể vào lịch sử đơn hàng để theo dõi.",
        [
          { text: "Ở lại", style: "cancel" },
          { text: "Lịch sử đơn", onPress: () => navigation.navigate("OrderHistory") },
        ],
        "time-outline"
      );
      return;
    }

    setTimeout(async () => {
      try {
        const latestOrder = await fetchOrderStatusWithRetry(orderCode);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["checkout", "init"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });

        if (latestOrder?.payment_status === "paid") {
          setCreatedOrder(latestOrder);
          setIsSuccessModalVisible(true);
          return;
        }

        showCustomAlert(
          "Đơn hàng đang chờ thanh toán",
          "MoMo chưa xác nhận thanh toán cho đơn hàng này. Bạn có thể vào lịch sử đơn hàng để kiểm tra lại sau.",
          [
            { text: "Ở lại", style: "cancel" },
            { text: "Lịch sử đơn", onPress: () => navigation.navigate("OrderHistory") },
          ],
          "time-outline"
        );
      } catch (error) {
        console.log("Error checking MoMo order status", error);
        showCustomAlert(
          "Chưa kiểm tra được thanh toán",
          "App chưa kiểm tra được trạng thái MoMo. Vui lòng vào lịch sử đơn hàng để theo dõi đơn vừa tạo.",
          [
            { text: "Ở lại", style: "cancel" },
            { text: "Lịch sử đơn", onPress: () => navigation.navigate("OrderHistory") },
          ],
          "warning-outline"
        );
      }
    }, 2500);
  }
  const handleCloseSuccess = () => {
    setIsSuccessModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  if (isCheckingAuth || isLoading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={{ marginTop: 10, fontFamily: "Oswald_500Medium", color: "#9f273b", fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Đang chuẩn bị thanh toán...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
    <SafeAreaView style={s.topSafe} />
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#9f273b" translucent={false} />

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#9f273b"]}
            tintColor="#9f273b"
          />
        }
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
                  handleSavePersonalInfo();
                  return;
                }
                setIsEditingInfo(true);
              }}
              disabled={isSavingPersonalInfo}
            >
              {isSavingPersonalInfo ? (
                <ActivityIndicator size="small" color="#9f273b" />
              ) : (
                <Ionicons
                  name={isEditingInfo ? "checkmark-circle" : "create-outline"}
                  size={14}
                  color="#9f273b"
                />
              )}
              <Text style={s.editInfoBtnTxt}>
                {isSavingPersonalInfo ? "ĐANG LƯU" : isEditingInfo ? "LƯU" : "SỬA"}
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
                  <Text style={s.addrDetail}>{addr.shipping_address || addr.detail}{addr.ward ? `, ${addr.ward}, ${addr.city}` : ""}</Text>
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
                          <Text style={s.orderItemOldPrice}>
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
          {paymentMethod === "momo" && (
            <View style={s.momoPaymentHint}>
              <Ionicons name="information-circle-outline" size={14} color="#9f273b" />
              <Text style={s.momoPaymentHintText}>
                App sẽ mở cổng MoMo. Thanh toán xong, quay lại ứng dụng để kiểm tra đơn hàng.
              </Text>
            </View>
          )}

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
                <Text style={s.bankInfoValCopy}>1036153976</Text>
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
          <View style={s.affiliateBox}>
            <View style={s.affiliateHeader}>
              <Ionicons name="people-outline" size={16} color="#9f273b" />
              <Text style={s.affiliateTitle}>Mã người giới thiệu</Text>
            </View>
            <TextInput
              style={s.affiliateInput}
              placeholder="Nhập mã affiliate nếu có"
              value={affiliateCode}
              onChangeText={setAffiliateCode}
              autoCapitalize="characters"
            />
          </View>
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
          onPress={handleOpenOrderConfirm}
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

      {/* MODAL XAC NHAN DAT HANG */}
      <Modal
        visible={isConfirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseOrderConfirm}
      >
        <View style={s.modalBg}>
          <View style={s.confirmModalContainer}>
            <View style={s.confirmHeader}>
              <View>
                <Text style={s.confirmTitle}>Xác Nhận Đặt Hàng</Text>
                <Text style={s.confirmSubtitle}>Kiểm tra thông tin trước khi thanh toán</Text>
              </View>
              <TouchableOpacity
                style={s.confirmCloseBtn}
                onPress={handleCloseOrderConfirm}
              >
                <Ionicons name="close" size={21} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={s.confirmCustomerBox}>
              <View style={s.confirmSectionHeading}>
                <Ionicons name="person-outline" size={15} color="#9f273b" />
                <Text style={s.confirmSectionTitle}>THÔNG TIN NHẬN HÀNG</Text>
              </View>
              <Text style={s.confirmCustomerName}>{getCheckoutCustomerInfo().customerName}</Text>
              <Text style={s.confirmCustomerText}>{getCheckoutCustomerInfo().customerPhone}</Text>
              <Text style={s.confirmCustomerText}>{getCheckoutCustomerInfo().customerAddress}</Text>
            </View>

            <View style={s.confirmProductsHeader}>
              <View style={s.confirmSectionHeading}>
                <Ionicons name="bag-handle-outline" size={15} color="#9f273b" />
                <Text style={s.confirmSectionTitle}>SẢN PHẨM</Text>
              </View>
              <Text style={s.confirmProductCount}>{checkoutItems.length} sản phẩm</Text>
            </View>

            <ScrollView style={s.confirmProductsScroll} showsVerticalScrollIndicator={false}>
              {checkoutItems.map((item, index) => {
                const quantity = item.quantity || item.qty || 1;
                return (
                  <View key={`confirm-${item.id || index}`} style={s.confirmProductRow}>
                    <Image source={{ uri: item.image }} style={s.confirmProductImage} />
                    <View style={s.confirmProductInfo}>
                      <Text style={s.confirmProductName} numberOfLines={2}>{item.name}</Text>
                      {item.variant ? (
                        <Text style={s.confirmProductVariant} numberOfLines={1}>{item.variant}</Text>
                      ) : null}
                      <Text style={s.confirmProductQuantity}>Số lượng: {quantity}</Text>
                    </View>
                    <Text style={s.confirmProductPrice}>{fmt(item.price * quantity)}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={s.confirmTotalRow}>
              <Text style={s.confirmTotalLabel}>TỔNG THANH TOÁN</Text>
              <Text style={s.confirmTotalValue}>{fmt(total)}</Text>
            </View>

            <View style={s.confirmActions}>
              <TouchableOpacity
                style={[s.confirmActionBtn, s.confirmBackBtn]}
                onPress={handleCloseOrderConfirm}
              >
                <Text style={s.confirmBackText}>QUAY LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmActionBtn, s.confirmSubmitBtn, isPlacingOrder && { opacity: 0.7 }]}
                onPress={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.confirmSubmitText}>XÁC NHẬN MUA</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DAT HANG THANH CONG */}
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
                <Text style={s.summaryPrice}>{fmt(createdOrder?.total_amount || total)}</Text>
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
          <KeyboardAvoidingView
            style={s.addrKeyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          >
          <View style={s.addrModalContainer}>
            <Text style={s.addrModalTitle}>Thêm Địa Chỉ Giao Hàng</Text>

            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={s.addrModalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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

              <View style={s.addressModeRow}>
                <Text style={s.addressModeLabel}>Cách nhập địa chỉ</Text>
                <TouchableOpacity
                  style={s.addressModeBtn}
                  activeOpacity={0.75}
                  onPress={() => setIsManualAddressMode((prev) => !prev)}
                >
                  <Ionicons name={isManualAddressMode ? "list-outline" : "create-outline"} size={14} color="#9f273b" />
                  <Text style={s.addressModeBtnTxt}>
                    {isManualAddressMode ? "Chọn từ danh sách" : "Tự nhập tay"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isManualAddressMode ? (
                <>
                  <View style={s.modalInputGroup}>
                    <Text style={s.modalInputLabel}>Tỉnh / Thành phố</Text>
                    <TextInput
                      style={s.modalTextInput}
                      value={newCity}
                      onChangeText={setNewCity}
                      placeholder="Nhập Tỉnh / Thành phố"
                      placeholderTextColor="#aaa"
                    />
                  </View>

                  <View style={s.modalInputGroup}>
                    <Text style={s.modalInputLabel}>Phường / Xã</Text>
                    <TextInput
                      style={s.modalTextInput}
                      value={newWard}
                      onChangeText={setNewWard}
                      placeholder="Nhập Phường / Xã"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={s.modalInputGroup}>
                    <Text style={s.modalInputLabel}>Tỉnh / Thành phố</Text>
                    <TouchableOpacity style={s.addressSelectTrigger} activeOpacity={0.75} onPress={() => handleOpenAddressSelector("city")}>
                      <Text style={[s.addressSelectTxt, !newCity && s.addressSelectPlaceholder]}>
                        {newCity || "Chọn Tỉnh / Thành phố"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#8c826e" />
                    </TouchableOpacity>
                  </View>

                  <View style={s.modalInputGroup}>
                    <Text style={s.modalInputLabel}>Phường / Xã</Text>
                    <TouchableOpacity
                      style={[s.addressSelectTrigger, !selectedProvinceCode && s.addressSelectDisabled]}
                      activeOpacity={0.75}
                      disabled={!selectedProvinceCode}
                      onPress={() => handleOpenAddressSelector("ward")}
                    >
                      <Text style={[s.addressSelectTxt, !newWard && s.addressSelectPlaceholder]}>
                        {newWard || "Chọn Phường / Xã"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#8c826e" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={s.modalInputGroup}>
                <Text style={s.modalInputLabel}>
                  Địa chỉ chi tiết (Số nhà, tên đường...)
                </Text>
                <TextInput
                  style={[s.modalTextInput, { minHeight: 60 }]}
                  value={newDetail}
                  onChangeText={setNewDetail}
                  placeholder="Số nhà, tên đường..."
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
                  resetNewAddressForm();
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
          </KeyboardAvoidingView>

          {isAddressSelectorVisible && (
            <View style={s.addressSelectorOverlay}>
              <View style={s.addressSelectorContainer}>
                <View style={s.addressSelectorHeader}>
                  <Text style={s.addressSelectorTitle}>
                    {addressSelectorType === "city"
                      ? "Chọn Tỉnh / Thành phố"
                      : "Chọn Phường / Xã"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsAddressSelectorVisible(false)} style={s.addressSelectorCloseBtn}>
                    <Ionicons name="close" size={22} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={s.addressSelectorSearchWrap}>
                  <Ionicons name="search-outline" size={17} color="#8c826e" style={{ marginRight: 8 }} />
                  <TextInput
                    style={s.addressSelectorSearchInput}
                    value={addressSearchQuery}
                    onChangeText={setAddressSearchQuery}
                    placeholder="Tìm kiếm..."
                    placeholderTextColor="#aaa"
                  />
                  {!!addressSearchQuery && (
                    <TouchableOpacity onPress={() => setAddressSearchQuery("")}>
                      <Ionicons name="close-circle" size={16} color="#bbb" />
                    </TouchableOpacity>
                  )}
                </View>

                {addressProvinceQuery.isFetching && addressSelectorType === "city" ? (
                  <View style={s.addressSelectorCenter}>
                    <ActivityIndicator size="large" color="#9f273b" />
                  </View>
                ) : (
                  <ScrollView style={s.addressSelectorList} keyboardShouldPersistTaps="handled">
                    {getFilteredAddressItems().length === 0 ? (
                      <View style={s.addressSelectorEmpty}>
                        <Text style={s.addressSelectorEmptyTxt}>Không tìm thấy kết quả phù hợp</Text>
                      </View>
                    ) : (
                      getFilteredAddressItems().map((item) => {
                        const isSelected =
                          (addressSelectorType === "city" && item.name === newCity)  ||
                          (addressSelectorType === "ward" && item.name === newWard);

                        return (
                          <TouchableOpacity
                            key={item.code}
                            style={[s.addressSelectorItem, isSelected && s.addressSelectorItemActive]}
                            activeOpacity={0.75}
                            onPress={() => handleSelectAddressItem(item)}
                          >
                            <Text style={[s.addressSelectorItemTxt, isSelected && s.addressSelectorItemTxtActive]}>{item.name}</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={18} color="#9f273b" />}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  topSafe: { flex: 0, backgroundColor: "#9f273b" },
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // HEADER
  header: {
    backgroundColor: "#9f273b",
    paddingTop: 14,
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
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 11,
    color: "#9f273b",
  },
  orderItemOldPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
  },
  orderItemQty: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    color: "#666",
  },
  orderItemTotal: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
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
  affiliateBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ead9dc",
    backgroundColor: "#fffafa",
  },
  affiliateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  affiliateTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#9f273b",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  affiliateInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ead9dc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: "Oswald_400Regular",
    color: "#333",
    backgroundColor: "#fff",
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
  momoPaymentHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: -2,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fffafa",
    borderWidth: 1,
    borderColor: "#ead9dc",
  },
  momoPaymentHintText: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    lineHeight: 16,
    color: "#6f3b45",
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
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 13,
    color: "#333",
  },
  costValFree: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#28a745",
  },
  costValDiscount: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
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
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
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

  // MODAL CONFIRM ORDER
  confirmModalContainer: {
    width: width * 0.92,
    maxWidth: 520,
    maxHeight: "86%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  confirmTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#9f273b",
  },
  confirmSubtitle: {
    marginTop: 3,
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#777",
  },
  confirmCloseBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCustomerBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    gap: 3,
  },
  confirmSectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confirmSectionTitle: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 11,
    color: "#9f273b",
  },
  confirmCustomerName: {
    marginTop: 5,
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#333",
  },
  confirmCustomerText: {
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "#666",
  },
  confirmProductsHeader: {
    marginTop: 14,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confirmProductCount: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#888",
  },
  confirmProductsScroll: {
    maxHeight: 230,
  },
  confirmProductRow: {
    minHeight: 72,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  confirmProductImage: {
    width: 54,
    height: 54,
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
  },
  confirmProductInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  confirmProductName: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#333",
  },
  confirmProductVariant: {
    marginTop: 2,
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    color: "#888",
  },
  confirmProductQuantity: {
    marginTop: 3,
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#666",
  },
  confirmProductPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 12,
    color: "#9f273b",
  },
  confirmTotalRow: {
    marginTop: 12,
    paddingTop: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  confirmTotalLabel: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#333",
  },
  confirmTotalValue: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 17,
    color: "#9f273b",
  },
  confirmActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  confirmActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBackBtn: {
    borderWidth: 1,
    borderColor: "#9f273b",
    backgroundColor: "#fff",
  },
  confirmSubmitBtn: {
    backgroundColor: "#9f273b",
  },
  confirmBackText: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#9f273b",
  },
  confirmSubmitText: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 12,
    color: "#fff",
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
  summaryPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
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
    justifyContent: "center",
    gap: 4,
    minWidth: 76,
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
  addrKeyboardAvoid: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addrModalContainer: {
    width: width * 0.9,
    maxHeight: "76%",
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
  addrModalScrollContent: {
    paddingBottom: 8,
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
  addressModeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
    paddingVertical: 4,
  },
  addressModeLabel: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#555",
  },
  addressModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#ead4d8",
    backgroundColor: "#fff7f8",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addressModeBtnTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 11,
    color: "#9f273b",
  },
  addressSelectTrigger: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  addressSelectDisabled: {
    opacity: 0.55,
    backgroundColor: "#f1f1f1",
  },
  addressSelectTxt: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#333",
    marginRight: 8,
  },
  addressSelectPlaceholder: {
    color: "#aaa",
  },
  addressSelectorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addressSelectorContainer: {
    width: "100%",
    maxHeight: "74%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  addressSelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 11,
    marginBottom: 12,
  },
  addressSelectorTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 16,
    color: "#9f273b",
  },
  addressSelectorCloseBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#f7f7f7",
  },
  addressSelectorSearchWrap: {
    height: 42,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  addressSelectorSearchInput: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#333",
    paddingVertical: 0,
  },
  addressSelectorCenter: {
    paddingVertical: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  addressSelectorList: {
    maxHeight: 320,
  },
  addressSelectorItem: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  addressSelectorItemActive: {
    backgroundColor: "#fff7f8",
    borderRadius: 8,
  },
  addressSelectorItemTxt: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#444",
    marginRight: 10,
  },
  addressSelectorItemTxtActive: {
    fontFamily: "Oswald_500Medium",
    color: "#9f273b",
  },
  addressSelectorEmpty: {
    paddingVertical: 30,
    alignItems: "center",
  },
  addressSelectorEmptyTxt: {
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#888",
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
