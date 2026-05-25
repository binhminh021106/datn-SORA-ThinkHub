import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

const STATIC_PROVINCES = [
  { "code": "89", "name": "Tỉnh An Giang" },
  { "code": "77", "name": "Tỉnh Bà Rịa - Vũng Tàu" },
  { "code": "24", "name": "Tỉnh Bắc Giang" },
  { "code": "06", "name": "Tỉnh Bắc Kạn" },
  { "code": "95", "name": "Tỉnh Bạc Liêu" },
  { "code": "27", "name": "Tỉnh Bắc Ninh" },
  { "code": "83", "name": "Tỉnh Bến Tre" },
  { "code": "74", "name": "Tỉnh Bình Dương" },
  { "code": "70", "name": "Tỉnh Bình Phước" },
  { "code": "60", "name": "Tỉnh Bình Thuận" },
  { "code": "52", "name": "Tỉnh Bình Định" },
  { "code": "96", "name": "Tỉnh Cà Mau" },
  { "code": "92", "name": "Thành phố Cần Thơ" },
  { "code": "04", "name": "Tỉnh Cao Bằng" },
  { "code": "64", "name": "Tỉnh Gia Lai" },
  { "code": "02", "name": "Tỉnh Hà Giang" },
  { "code": "35", "name": "Tỉnh Hà Nam" },
  { "code": "01", "name": "Thành phố Hà Nội" },
  { "code": "42", "name": "Tỉnh Hà Tĩnh" },
  { "code": "30", "name": "Tỉnh Hải Dương" },
  { "code": "31", "name": "Thành phố Hải Phòng" },
  { "code": "93", "name": "Tỉnh Hậu Giang" },
  { "code": "79", "name": "Thành phố Hồ Chí Minh" },
  { "code": "17", "name": "Tỉnh Hoà Bình" },
  { "code": "33", "name": "Tỉnh Hưng Yên" },
  { "code": "56", "name": "Tỉnh Khánh Hòa" },
  { "code": "91", "name": "Tỉnh Kiên Giang" },
  { "code": "62", "name": "Tỉnh Kon Tum" },
  { "code": "12", "name": "Tỉnh Lai Châu" },
  { "code": "68", "name": "Tỉnh Lâm Đồng" },
  { "code": "20", "name": "Tỉnh Lạng Sơn" },
  { "code": "10", "name": "Tỉnh Lào Cai" },
  { "code": "80", "name": "Tỉnh Long An" },
  { "code": "36", "name": "Tỉnh Nam Định" },
  { "code": "40", "name": "Tỉnh Nghệ An" },
  { "code": "37", "name": "Tỉnh Ninh Bình" },
  { "code": "58", "name": "Tỉnh Ninh Thuận" },
  { "code": "25", "name": "Tỉnh Phú Thọ" },
  { "code": "54", "name": "Tỉnh Phú Yên" },
  { "code": "44", "name": "Tỉnh Quảng Bình" },
  { "code": "49", "name": "Tỉnh Quảng Nam" },
  { "code": "51", "name": "Tỉnh Quảng Ngãi" },
  { "code": "22", "name": "Tỉnh Quảng Ninh" },
  { "code": "45", "name": "Tỉnh Quảng Trị" },
  { "code": "94", "name": "Tỉnh Sóc Trăng" },
  { "code": "14", "name": "Tỉnh Sơn La" },
  { "code": "72", "name": "Tỉnh Tây Ninh" },
  { "code": "34", "name": "Tỉnh Thái Bình" },
  { "code": "19", "name": "Tỉnh Thái Nguyên" },
  { "code": "38", "name": "Tỉnh Thanh Hóa" },
  { "code": "46", "name": "Tỉnh Thừa Thiên Huế" },
  { "code": "82", "name": "Tỉnh Tiền Giang" },
  { "code": "84", "name": "Tỉnh Trà Vinh" },
  { "code": "08", "name": "Tỉnh Tuyên Quang" },
  { "code": "86", "name": "Tỉnh Vĩnh Long" },
  { "code": "26", "name": "Tỉnh Vĩnh Phúc" },
  { "code": "15", "name": "Tỉnh Yên Bái" },
  { "code": "48", "name": "Thành phố Đà Nẵng" },
  { "code": "66", "name": "Tỉnh Đắk Lắk" },
  { "code": "67", "name": "Tỉnh Đắk Nông" },
  { "code": "11", "name": "Tỉnh Điện Biên" },
  { "code": "75", "name": "Tỉnh Đồng Nai" },
  { "code": "87", "name": "Tỉnh Đồng Tháp" }
];

export default function AddressScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // API Tỉnh Thành States
  const [provinces, setProvinces] = useState(STATIC_PROVINCES);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  // Selector Modal States
  const [selectorType, setSelectorType] = useState(null); // 'city' | 'district' | 'ward'
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectorLoading, setSelectorLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // Load Provinces
  const loadProvinces = async () => {
    setProvinces(STATIC_PROVINCES);
  };

  // Load Districts
  const loadDistricts = async (provCode) => {
    setSelectorLoading(true);
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${provCode}.htm`);
      const data = await res.json();
      if (data && data.error === 0 && Array.isArray(data.data)) {
        const mapped = data.data.map(d => ({ code: d.id, name: d.full_name }));
        setDistricts(mapped);
      } else {
        throw new Error('Dữ liệu Quận/Huyện trống');
      }
    } catch (e) {
      Alert.alert(
        'Lỗi kết nối',
        'Không thể tự động tải danh sách Quận/Huyện. Ứng dụng sẽ chuyển sang chế độ tự nhập tay.',
        [{ text: 'ĐỒNG Ý', onPress: () => {
          setIsManualMode(true);
          setShowSelector(false);
        }}]
      );
    } finally {
      setSelectorLoading(false);
    }
  };

  // Load Wards
  const loadWards = async (distCode) => {
    setSelectorLoading(true);
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${distCode}.htm`);
      const data = await res.json();
      if (data && data.error === 0 && Array.isArray(data.data)) {
        const mapped = data.data.map(w => ({ code: w.id, name: w.full_name }));
        setWards(mapped);
      } else {
        throw new Error('Dữ liệu Phường/Xã trống');
      }
    } catch (e) {
      Alert.alert(
        'Lỗi kết nối',
        'Không thể tự động tải danh sách Phường/Xã. Ứng dụng sẽ chuyển sang chế độ tự nhập tay.',
        [{ text: 'ĐỒNG Ý', onPress: () => {
          setIsManualMode(true);
          setShowSelector(false);
        }}]
      );
    } finally {
      setSelectorLoading(false);
    }
  };

  // Handle Open Selector
  const handleOpenSelector = (type) => {
    setSelectorType(type);
    setSearchQuery('');
    setShowSelector(true);
    
    if (type === 'city') {
      loadProvinces();
    } else if (type === 'district' && selectedProvinceCode) {
      loadDistricts(selectedProvinceCode);
    } else if (type === 'ward' && selectedDistrictCode) {
      loadWards(selectedDistrictCode);
    }
  };

  const getFilteredItems = () => {
    const query = searchQuery.trim().toLowerCase();
    let sourceList = [];
    if (selectorType === 'city') sourceList = provinces;
    else if (selectorType === 'district') sourceList = districts;
    else if (selectorType === 'ward') sourceList = wards;

    if (!query) return sourceList;
    return sourceList.filter(item => item.name.toLowerCase().includes(query));
  };

  const handleSelectItem = (item) => {
    if (selectorType === 'city') {
      if (item.name !== city) {
        setCity(item.name);
        setSelectedProvinceCode(item.code);
        
        // Reset district & ward
        setDistrict('');
        setWard('');
        setSelectedDistrictCode(null);
        setDistricts([]);
        setWards([]);
      }
    } else if (selectorType === 'district') {
      if (item.name !== district) {
        setDistrict(item.name);
        setSelectedDistrictCode(item.code);
        
        // Reset ward
        setWard('');
        setWards([]);
      }
    } else if (selectorType === 'ward') {
      setWard(item.name);
    }
    setShowSelector(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/client/profile/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setAddresses(data.data || []);
      }
    } catch (e) {
      // Offline fallback can be added, but simple message is premium
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentAddressId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCity('');
    setDistrict('');
    setWard('');
    setShippingAddress('');
    setIsDefault(addresses.length === 0); // If first address, force default
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setIsManualMode(false);
    setShowModal(true);
  };

  const handleOpenEditModal = async (item) => {
    setIsEditing(true);
    setCurrentAddressId(item.id);
    setCustomerName(item.customer_name || '');
    setCustomerPhone(item.customer_phone || '');
    setCity(item.city || '');
    setDistrict(item.district || '');
    setWard(item.ward || '');
    setShippingAddress(item.shipping_address || '');
    setIsDefault(item.is_default === 1);
    setIsManualMode(false);
    setShowModal(true);

    // Tự động khớp code tỉnh thành thông minh từ dữ liệu text có sẵn
    try {
      let provs = STATIC_PROVINCES;
      setProvinces(provs);

      const matchProv = provs.find(p => 
        p.name.toLowerCase() === item.city?.toLowerCase() || 
        p.name.replace(/(Thành phố|Tỉnh)\s+/i, '').toLowerCase() === item.city?.replace(/(Thành phố|Tỉnh)\s+/i, '').toLowerCase()
      );

      if (matchProv) {
        setSelectedProvinceCode(matchProv.code);
        
        const resDist = await fetch(`https://esgoo.net/api-tinhthanh/2/${matchProv.code}.htm`);
        const distData = await resDist.json();
        let dists = [];
        if (distData && distData.error === 0 && Array.isArray(distData.data)) {
          dists = distData.data.map(d => ({ code: d.id, name: d.full_name }));
        }
        setDistricts(dists);

        const matchDist = dists.find(d => 
          d.name.toLowerCase() === item.district?.toLowerCase() || 
          d.name.replace(/(Quận|Huyện|Thị xã|Thành phố)\s+/i, '').toLowerCase() === item.district?.replace(/(Quận|Huyện|Thị xã|Thành phố)\s+/i, '').toLowerCase()
        );

        if (matchDist) {
          setSelectedDistrictCode(matchDist.code);

          const resWard = await fetch(`https://esgoo.net/api-tinhthanh/3/${matchDist.code}.htm`);
          const wardData = await resWard.json();
          let wList = [];
          if (wardData && wardData.error === 0 && Array.isArray(wardData.data)) {
            wList = wardData.data.map(w => ({ code: w.id, name: w.full_name }));
          }
          setWards(wList);
        } else {
          setIsManualMode(true);
        }
      } else {
        setIsManualMode(true);
      }
    } catch (err) {
      console.log('Auto-match province error:', err);
      setIsManualMode(true);
    }
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên người nhận.');
      return false;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Tỉnh/Thành phố.');
      return false;
    }
    if (!district.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Quận/Huyện.');
      return false;
    }
    if (!ward.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Phường/Xã.');
      return false;
    }
    if (!shippingAddress.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ chi tiết.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const url = isEditing
        ? `${API_BASE_URL}/client/profile/addresses/${currentAddressId}`
        : `${API_BASE_URL}/client/profile/addresses`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.replace(/[^0-9]/g, ''),
          city: city.trim(),
          district: district.trim(),
          ward: ward.trim(),
          shipping_address: shippingAddress.trim(),
          is_default: isDefault ? 1 : 0,
        }),
      });

      const result = await response.json();
      if (response.ok && result.status) {
        setShowModal(false);
        Alert.alert('Thành công', isEditing ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
        fetchAddresses();
      } else {
        Alert.alert('Thất bại', result.message || 'Không thể lưu địa chỉ.');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc chắn muốn xoá địa chỉ này khỏi sổ địa chỉ không?',
      [
        { text: 'HỦY', style: 'cancel' },
        {
          text: 'XOÁ',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('auth_token');
              if (!token) return;

              const res = await fetch(`${API_BASE_URL}/client/profile/addresses/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              });

              const data = await res.json();
              if (res.ok && data.status) {
                Alert.alert('Thông báo', 'Đã xoá địa chỉ thành công!');
                fetchAddresses();
              } else {
                Alert.alert('Lỗi', data.message || 'Không thể xoá địa chỉ.');
              }
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/client/profile/addresses/${id}/default`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.status) {
        Alert.alert('Thông báo', 'Đã đặt làm địa chỉ giao hàng mặc định!');
        fetchAddresses();
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
    }
  };

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#9f273b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sổ Địa Chỉ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.listContainer} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="location-outline" size={80} color="#ddd" />
            <Text style={s.emptyTitle}>Sổ địa chỉ trống</Text>
            <Text style={s.emptySub}>Bạn chưa thêm bất kỳ địa chỉ giao hàng nào.</Text>
            <TouchableOpacity style={s.addFirstBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
              <Text style={s.addFirstBtnTxt}>THÊM ĐỊA CHỈ ĐẦU TIÊN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((item) => (
            <View key={item.id} style={[s.card, item.is_default === 1 && s.cardDefault]}>
              <View style={s.cardHeader}>
                <View style={s.nameRow}>
                  <Ionicons name="person" size={14} color="#9f273b" />
                  <Text style={s.customerName}>{item.customer_name}</Text>
                  {item.is_default === 1 && (
                    <View style={s.defaultBadge}>
                      <Text style={s.defaultBadgeTxt}>Mặc định</Text>
                    </View>
                  )}
                </View>
                <Text style={s.customerPhone}>SĐT: {item.customer_phone}</Text>
              </View>

              <View style={s.cardBody}>
                <Ionicons name="map-outline" size={16} color="#8c826e" style={s.mapIcon} />
                <Text style={s.addressTxt}>
                  {item.shipping_address}, {item.ward}, {item.district}, {item.city}
                </Text>
              </View>

              <View style={s.cardActions}>
                {item.is_default !== 1 && (
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() => handleSetDefault(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#8c826e" />
                    <Text style={s.actionBtnTxt}>Đặt mặc định</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[s.actionBtn, { marginLeft: 'auto' }]}
                  onPress={() => handleOpenEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color="#9f273b" />
                  <Text style={[s.actionBtnTxt, { color: '#9f273b' }]}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.actionBtn, { marginLeft: 16 }]}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#cc1e2e" />
                  <Text style={[s.actionBtnTxt, { color: '#cc1e2e' }]}>Xoá</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── FLOATING ADD BUTTON ── */}
      {addresses.length > 0 && (
        <TouchableOpacity style={s.floatingAddBtn} onPress={handleOpenAddModal} activeOpacity={0.85}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={s.floatingAddBtnTxt}>THÊM ĐỊA CHỈ MỚI</Text>
        </TouchableOpacity>
      )}

      {/* ── FORM ADD / EDIT MODAL ── */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>{isEditing ? 'Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} style={s.modalForm}>
              {/* Receiver Name */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>TÊN NGƯỜI NHẬN</Text>
                <TextInput
                  style={s.textInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Nhập tên người nhận"
                  placeholderTextColor="#bbb"
                />
              </View>

              {/* Receiver Phone */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>SỐ ĐIỆN THOẠI</Text>
                <TextInput
                  style={s.textInput}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Nhập số điện thoại 10 số"
                  placeholderTextColor="#bbb"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {/* Manual mode toggle button */}
              <View style={s.manualRow}>
                <Text style={s.manualLabel}>Cách nhập địa chỉ</Text>
                <TouchableOpacity
                  style={s.manualSwitchBtn}
                  onPress={() => setIsManualMode(!isManualMode)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={isManualMode ? "list-outline" : "create-outline"} size={14} color="#9f273b" />
                  <Text style={s.manualSwitchBtnTxt}>
                    {isManualMode ? 'Chọn từ danh sách' : 'Tự nhập tay'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isManualMode ? (
                <>
                  {/* City Input */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>TỈNH / THÀNH PHỐ</Text>
                    <TextInput
                      style={s.textInput}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Nhập Tỉnh / Thành phố"
                      placeholderTextColor="#bbb"
                    />
                  </View>

                  {/* District Input */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>QUẬN / HUYỆN</Text>
                    <TextInput
                      style={s.textInput}
                      value={district}
                      onChangeText={setDistrict}
                      placeholder="Nhập Quận / Huyện"
                      placeholderTextColor="#bbb"
                    />
                  </View>

                  {/* Ward Input */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>PHƯỜNG / XÃ</Text>
                    <TextInput
                      style={s.textInput}
                      value={ward}
                      onChangeText={setWard}
                      placeholder="Nhập Phường / Xã"
                      placeholderTextColor="#bbb"
                    />
                  </View>
                </>
              ) : (
                <>
                  {/* City Selector */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>TỈNH / THÀNH PHỐ</Text>
                    <TouchableOpacity
                      style={s.selectTrigger}
                      onPress={() => handleOpenSelector('city')}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.selectTriggerTxt, !city && s.selectPlaceholder]}>
                        {city || 'Chọn Tỉnh / Thành phố'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#8c826e" />
                    </TouchableOpacity>
                  </View>

                  {/* District Selector */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>QUẬN / HUYỆN</Text>
                    <TouchableOpacity
                      style={[s.selectTrigger, !city && s.selectDisabled]}
                      onPress={() => city && handleOpenSelector('district')}
                      disabled={!city}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.selectTriggerTxt, !district && s.selectPlaceholder]}>
                        {district || 'Chọn Quận / Huyện'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#8c826e" />
                    </TouchableOpacity>
                  </View>

                  {/* Ward Selector */}
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>PHƯỜNG / XÃ</Text>
                    <TouchableOpacity
                      style={[s.selectTrigger, !district && s.selectDisabled]}
                      onPress={() => district && handleOpenSelector('ward')}
                      disabled={!district}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.selectTriggerTxt, !ward && s.selectPlaceholder]}>
                        {ward || 'Chọn Phường / Xã'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#8c826e" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Detailed Address */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>ĐỊA CHỈ CHI TIẾT (ĐƯỜNG, SỐ NHÀ)</Text>
                <TextInput
                  style={[s.textInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                  placeholder="Nhập số nhà, tên đường..."
                  placeholderTextColor="#bbb"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>

              {/* Set as Default Switch */}
              <View style={s.switchGroup}>
                <Text style={s.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: '#e0e0e0', true: '#f5dcd2' }}
                  thumbColor={isDefault ? '#9f273b' : '#f4f3f4'}
                  disabled={!isEditing && addresses.length === 0} // Always default if first
                />
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.8}
              >
                <Text style={s.modalBtnCancelTxt}>HỦY</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnConfirm]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.modalBtnConfirmTxt}>LƯU LẠI</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── SELECTOR OVERLAY (Inside the same Modal to avoid multi-modal conflict) ── */}
        {showSelector && (
          <View style={[StyleSheet.absoluteFill, s.selectorOverlay]}>
            <View style={s.selectorContainer}>
              <View style={s.selectorHeader}>
                <Text style={s.selectorTitle}>
                  {selectorType === 'city' ? 'Chọn Tỉnh / Thành phố' :
                   selectorType === 'district' ? 'Chọn Quận / Huyện' : 'Chọn Phường / Xã'}
                </Text>
                <TouchableOpacity onPress={() => setShowSelector(false)} style={s.selectorCloseBtn}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={s.selectorSearchWrap}>
                <Ionicons name="search-outline" size={18} color="#8c826e" style={{ marginRight: 8 }} />
                <TextInput
                  style={s.selectorSearchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor="#bbb"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>

              {/* List */}
              {selectorLoading ? (
                <View style={s.selectorCenter}>
                  <ActivityIndicator size="large" color="#9f273b" />
                </View>
              ) : (
                <ScrollView 
                  style={s.selectorList} 
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {getFilteredItems().length === 0 ? (
                    <View style={s.selectorEmpty}>
                      <Text style={s.selectorEmptyTxt}>Không tìm thấy kết quả phù hợp</Text>
                    </View>
                  ) : (
                    getFilteredItems().map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          s.selectorItem,
                          ((selectorType === 'city' && item.name === city) ||
                           (selectorType === 'district' && item.name === district) ||
                           (selectorType === 'ward' && item.name === ward)) && s.selectorItemActive
                        ]}
                        onPress={() => handleSelectItem(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          s.selectorItemTxt,
                          ((selectorType === 'city' && item.name === city) ||
                           (selectorType === 'district' && item.name === district) ||
                           (selectorType === 'ward' && item.name === ward)) && s.selectorItemTxtActive
                        ]}>
                          {item.name}
                        </Text>
                        {((selectorType === 'city' && item.name === city) ||
                          (selectorType === 'district' && item.name === district) ||
                          (selectorType === 'ward' && item.name === ward)) && (
                          <Ionicons name="checkmark" size={18} color="#9f273b" />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </Modal>
      {/* The selector modal has been merged into the main form modal */}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'ios' ? 0 : 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },

  // HEADER
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

  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for floating button
  },

  // CARD SHAPES
  card: {
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDefault: {
    borderColor: '#ebd5a3',
    shadowColor: '#ebd5a3',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 10,
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 15,
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#9f273b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 9,
    color: '#fff',
    textTransform: 'uppercase',
  },
  customerPhone: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mapIcon: {
    marginTop: 2,
    marginRight: 6,
  },
  addressTxt: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#8c826e',
  },

  // FLOATING ADD BTN
  floatingAddBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9f273b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#9f273b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingAddBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1.5,
  },

  // EMPTY STATE
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#999',
    marginBottom: 28,
  },
  addFirstBtn: {
    backgroundColor: '#9f273b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1.5,
  },

  // MODAL STYLINGS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end', // Slide up from bottom
  },
  modalContainer: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#ebd5a3',
    maxHeight: '85%',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#9f273b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#8c826e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    height: 44,
    paddingHorizontal: 12,
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#333',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    marginTop: 8,
  },
  switchLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#333',
  },

  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#ebd5a3',
  },
  modalBtnConfirm: {
    backgroundColor: '#9f273b',
  },
  modalBtnCancelTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#8c826e',
    letterSpacing: 1,
  },
  modalBtnConfirmTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1,
  },

  // SELECT TRIGGERS AND SELECTOR MODAL
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    height: 44,
    paddingHorizontal: 12,
  },
  selectDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e5e5e5',
    opacity: 0.6,
  },
  selectTriggerTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#bbb',
  },

  // SELECTOR MODAL
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectorContainer: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 12,
    marginBottom: 12,
  },
  selectorTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#9f273b',
  },
  selectorCloseBtn: {
    padding: 4,
  },
  selectorSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  selectorSearchInput: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#333',
    paddingVertical: 0,
  },
  selectorCenter: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorList: {
    maxHeight: 300,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fcf8f2',
  },
  selectorItemActive: {
    backgroundColor: '#fcf8f2',
    borderRadius: 4,
  },
  selectorItemTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  selectorItemTxtActive: {
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
  },
  selectorEmpty: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  selectorEmptyTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#999',
  },

  // MANUAL MODE STYLES
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  manualLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#333',
  },
  manualSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebd5a3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  manualSwitchBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#9f273b',
    textTransform: 'uppercase',
  },
});
