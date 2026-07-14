import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import defaultLogoImg from '@/assets/images/logo1.png';

export const useSettingsStore = defineStore('settings', () => {
    // Default logo path for the project
    const defaultLogo = defaultLogoImg; 
    const settings = ref({
        site_logo: '',
        logo_footer: '',
        footer_brand_desc: '',
        footer_copyright: '',
        footer_address: '',
        footer_email: '',
        footer_socials: [],
        footer_trust_items: []
    });

    const isLoading = ref(false);

    const fetchSettings = async () => {
        isLoading.value = true;
        try {
            const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await axios.get(`${BACKEND_URL}/client/settings`);
            if (res.data && res.data.status === 'success') {
                const data = res.data.data;
                
                settings.value.site_logo = data.logo_header ? (data.logo_header.startsWith('http') || data.logo_header.startsWith('data:') ? data.logo_header : `${import.meta.env.VITE_URL}/storage/${data.logo_header}`) : defaultLogo;
                settings.value.logo_footer = data.logo_footer ? (data.logo_footer.startsWith('http') || data.logo_footer.startsWith('data:') ? data.logo_footer : `${import.meta.env.VITE_URL}/storage/${data.logo_footer}`) : '';
                settings.value.footer_brand_desc = data.footer_brand_desc || 'SORA mang đến những thiết kế trang sức tinh tế, tôn vinh vẻ đẹp đích thực và phong cách cá nhân của bạn. Mỗi chế tác là một tác phẩm nghệ thuật.';
                settings.value.footer_copyright = data.footer_copyright || '© 2026 SORA JEWELRY. ALL RIGHTS RESERVED.';
                settings.value.footer_address = data.footer_address || '123 Đường Ngọc Hồi, Hà Nội';
                settings.value.footer_email = data.footer_email || 'SORA@GMAIL.COM';
                settings.value.footer_trust_items = data.footer_trust_items || [
                    { icon: 'bi-truck', title: 'GIAO HÀNG MIỄN PHÍ', subtitle: 'Cho đơn hàng từ 1.000.000đ' },
                    { icon: 'bi-shield-check', title: 'BẢO HÀNH TRỌN ĐỜI', subtitle: 'Làm sáng & đánh bóng miễn phí' },
                    { icon: 'bi-arrow-repeat', title: 'ĐỔI TRẢ DỄ DÀNG', subtitle: 'Trong vòng 7 ngày đầu tiên' },
                    { icon: 'bi-headset', title: 'HỖ TRỢ 24/7', subtitle: 'Hotline: 1234.567.8910' }
                ];
                settings.value.footer_socials = data.footer_socials || [
                     {icon: 'bi-facebook', url: '#', title: 'Facebook'},
                     {icon: 'bi-instagram', url: '#', title: 'Instagram'},
                     {icon: 'bi-twitter-x', url: '#', title: 'Twitter'},
                     {icon: 'bi-youtube', url: '#', title: 'Youtube'}
                ];
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Default mock if API fails
            settings.value.site_logo = defaultLogo;
        } finally {
            isLoading.value = false;
        }
    };

    const listenToRealtimeUpdates = () => {
        if (window.Echo) {
            window.Echo.channel('settings')
                .stopListening('SettingUpdated') // Prevent duplicates
                .listen('SettingUpdated', (e) => {
                    console.log('Settings updated from server via Reverb', e);
                    fetchSettings();
                });
                
            return () => {
                window.Echo.channel('settings').stopListening('SettingUpdated');
            };
        }
        return () => {};
    };

    return {
        settings,
        isLoading,
        defaultLogo,
        fetchSettings,
        listenToRealtimeUpdates
    };
});
