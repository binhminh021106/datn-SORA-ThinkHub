import { createRouter, createWebHistory } from 'vue-router';
import user from './user';
import admin from './admin';

const routes = [
    ...user,
    ...admin,

    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/errors/NotFound.vue'),
        meta: {
            title: '404 - Không tìm thấy trang'
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0, behavior: 'smooth' };
        }
    }
});

const readAdminStorage = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

const getStoredAdminInfo = () => {
    const savedInfo = readAdminStorage('admin_info');
    if (!savedInfo) return null;

    try {
        return JSON.parse(savedInfo);
    } catch {
        return null;
    }
};

const hasAdminToken = () => Boolean(
    readAdminStorage('admin_token') ||
    readAdminStorage('adminToken')
);

const hasRequiredAdminLevel = (requiredLevel) => {
    const storedInfo = getStoredAdminInfo();
    const roleId = readAdminStorage('admin_role');
    const roleLevel = Number(readAdminStorage('admin_level') || storedInfo?.role?.level || 0);
    const storedRoleLevel = Number(storedInfo?.role?.level || 0);

    return (
        roleId == 1 ||
        (roleLevel > 0 && roleLevel <= requiredLevel) ||
        storedInfo?.role_id == 1 ||
        storedInfo?.role?.id == 1 ||
        (storedRoleLevel > 0 && storedRoleLevel <= requiredLevel)
    );
};

router.beforeEach((to) => {
    const superAdminRoute = to.matched.find((record) => record.meta?.requiresSuperAdmin);
    if (!superAdminRoute) return true;

    if (!hasAdminToken()) {
        return {
            name: 'admin-login',
            query: { redirect: to.fullPath },
        };
    }

    const requiredLevel = Number(superAdminRoute.meta.requiredAdminLevel || 1);
    if (!hasRequiredAdminLevel(requiredLevel)) {
        return { name: 'admin-dashboard' };
    }

    return true;
});

export default router;
