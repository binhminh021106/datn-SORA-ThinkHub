import React, { createRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const customAlertRef = createRef();

/**
 * Triggers a custom luxury SORA alert modal.
 * Works as a drop-in replacement for Alert.alert.
 * 
 * @param {string} title 
 * @param {string} message 
 * @param {Array<{ text: string, onPress: Function, style?: string }>} buttons 
 * @param {string} icon Optional Ionicons name override
 */
export const showCustomAlert = (title, message, buttons = null, icon = 'information-circle') => {
  customAlertRef.current?.show(title, message, buttons, icon);
};

const CustomAlertComponent = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState(null);
  const [icon, setIcon] = useState('information-circle');

  useImperativeHandle(ref, () => ({
    show: (t, m, b = null, ic = 'information-circle') => {
      setTitle(t);
      setMessage(m);
      setButtons(b);
      setIcon(ic);
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
    }
  }));

  const handleButtonPress = (onPress) => {
    setVisible(false);
    if (onPress) {
      // Small timeout to allow Modal fade transition to finish smoothly
      setTimeout(() => {
        onPress();
      }, 200);
    }
  };

  const getIconColor = () => {
    const t = title.toLowerCase();
    if (t.includes('thành công') || t.includes('cảm ơn') || t.includes('đã gửi') || t.includes('hoàn tất')) return '#2e7d32'; // Green
    if (t.includes('lỗi') || t.includes('thất bại') || t.includes('xoá') || t.includes('hủy') || t.includes('huỷ')) return '#c62828'; // Red
    if (t.includes('cảnh báo') || t.includes('thông báo') || t.includes('yêu cầu')) return '#f57c00'; // Orange
    return '#9f273b'; // SORA main Burgundy
  };

  const getIconName = () => {
    if (icon !== 'information-circle') return icon;
    const t = title.toLowerCase();
    if (t.includes('thành công') || t.includes('cảm ơn') || t.includes('đã gửi') || t.includes('hoàn tất')) return 'checkmark-circle-outline';
    if (t.includes('lỗi') || t.includes('thất bại')) return 'alert-circle-outline';
    if (t.includes('xoá') || t.includes('hủy') || t.includes('huỷ')) return 'trash-outline';
    if (t.includes('cảnh báo') || t.includes('thông báo')) return 'warning-outline';
    return 'information-circle-outline';
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={s.overlay}>
        <View style={s.container}>
          <View style={[s.iconWrap, { backgroundColor: getIconColor() + '12' }]}>
            <Ionicons name={getIconName()} size={32} color={getIconColor()} />
          </View>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          
          <View style={s.btnRow}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, idx) => {
                const isCancel = btn.style === 'cancel' || btn.text?.toLowerCase() === 'huỷ' || btn.text?.toLowerCase() === 'hủy' || btn.text?.toLowerCase() === 'không';
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      s.btn,
                      isCancel ? s.btnCancel : s.btnConfirm,
                      buttons.length > 2 && { width: '100%', marginBottom: 8 }
                    ]}
                    onPress={() => handleButtonPress(btn.onPress)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      s.btnTxt,
                      isCancel ? s.btnTxtCancel : s.btnTxtConfirm
                    ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <TouchableOpacity
                style={[s.btn, s.btnConfirm, { width: '100%' }]}
                onPress={() => setVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[s.btnTxt, s.btnTxtConfirm]}>ĐỒNG Ý</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default CustomAlertComponent;

const { width } = Dimensions.get('window');
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fffdf9',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    padding: 24,
    width: width * 0.85,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    flexWrap: 'wrap',
  },
  btn: {
    flex: 1,
    minWidth: 100,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: '#9f273b',
  },
  btnCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  btnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  btnTxtConfirm: {
    color: '#fff',
  },
  btnTxtCancel: {
    color: '#666',
  },
});
