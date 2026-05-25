-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 22, 2026 at 06:53 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint NOT NULL,
  `fullname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` bigint NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `fullname`, `email`, `password`, `role_id`, `phone`, `avatar_url`, `status`, `created_at`, `updated_at`, `deleted_at`, `email_verified_at`, `address`) VALUES
(16, 'Hiếu', 'hieuv12321@gmail.com', '$2y$12$GMMHuh79dq742HsnirBWI.zSnslKBkaUvD2fQ.HCAQgIwIYCGkd6i', 1, '0377975276', 'avatars/admin/avatar_admin_16_1778867675.png', 'active', '2026-03-11 07:18:25', '2026-05-19 05:09:34', NULL, '2026-03-11 07:18:25', '4, Xã Ea Rốk, Huyện Ea Súp, Tỉnh Đắk Lắk'),
(19, 'Test12', 'test12@gmail.com', '$2y$12$oBOrow6jMbhJXq./OXQSFu/.b5ZxO1hwkNWRlWI1IQFbUTFUqI2gS', 14, '0987654322', NULL, 'locked', '2026-03-12 08:31:00', '2026-03-23 09:01:09', NULL, NULL, 'ab, Tỉnh Cao Bằng'),
(20, 'Tấn Tuấn', 'tuanbtpk04033@gmail.com', '$2y$12$83Kc8JmVMb8TwJAlpBAaCOV6aDqPV7Z7ynuaYS8B9IqK75eWVDG92', 1, '0936363636', NULL, 'active', '2026-03-19 10:05:42', '2026-03-19 10:05:42', NULL, NULL, NULL),
(21, 'Lê Thị Mỹ Duyên', 'duyenltmpk04047@gmail.com', '$2y$12$sbC09hT2J3AFIqitt7GCxe3B9w.aDHFtODuAQeK2RyN0A7TQS5xEq', 1, '0941220016', NULL, 'active', '2026-03-20 07:31:17', '2026-03-20 07:31:17', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `admin_attendances`
--

CREATE TABLE `admin_attendances` (
  `id` bigint UNSIGNED NOT NULL,
  `admin_id` bigint NOT NULL,
  `work_shift_id` bigint UNSIGNED DEFAULT NULL,
  `shift_start_time` time DEFAULT NULL COMMENT 'Giờ bắt đầu ca ngay lúc check-in',
  `shift_end_time` time DEFAULT NULL COMMENT 'Giờ kết thúc ca ngay lúc check-in',
  `shift_late_tolerance` int DEFAULT '0' COMMENT 'Số phút cho phép đi muộn lúc check-in',
  `attendance_date` date NOT NULL COMMENT 'Ngày chấm công thực tế (Y-m-d)',
  `clock_in` datetime DEFAULT NULL COMMENT 'Thời gian bấm check-in hành chính',
  `clock_out` datetime DEFAULT NULL COMMENT 'Thời gian bấm check-out hành chính',
  `status` enum('present','late','absent','on_leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present' COMMENT 'Trạng thái đi làm: Đúng giờ, Muộn, Vắng, Nghỉ phép',
  `late_minutes` int NOT NULL DEFAULT '0' COMMENT 'Số phút đi muộn',
  `early_leave_minutes` int NOT NULL DEFAULT '0' COMMENT 'Số phút về sớm',
  `checkout_status` enum('pending','completed','forgotten') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái về: Chưa về, Đã checkout, Quên checkout hệ thống đóng',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lưu IP mạng để đối soát vị trí',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Lưu thông tin trình duyệt/thiết bị (VD: ASUS TUF)',
  `note` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do đi muộn hoặc giải trình từ nhân sự',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_attendances`
--

INSERT INTO `admin_attendances` (`id`, `admin_id`, `work_shift_id`, `shift_start_time`, `shift_end_time`, `shift_late_tolerance`, `attendance_date`, `clock_in`, `clock_out`, `status`, `late_minutes`, `early_leave_minutes`, `checkout_status`, `ip_address`, `user_agent`, `note`, `created_at`, `updated_at`) VALUES
(1, 16, NULL, NULL, NULL, 0, '2026-05-20', '2026-05-20 07:54:20', '2026-05-20 08:00:36', 'present', 0, 0, 'completed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', NULL, '2026-05-20 00:54:20', '2026-05-20 01:00:36'),
(2, 16, 1, NULL, NULL, 0, '2026-05-21', '2026-05-21 09:50:41', '2026-05-21 09:51:28', 'present', 0, -459, 'completed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', NULL, '2026-05-21 02:50:41', '2026-05-21 02:51:28'),
(3, 16, 1, '08:00:00', '17:30:00', 0, '2026-05-22', '2026-05-22 03:21:56', '2026-05-22 03:41:50', 'late', 278, -828, 'completed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', NULL, '2026-05-21 20:21:56', '2026-05-21 20:41:50');

-- --------------------------------------------------------

--
-- Table structure for table `admin_shift_assignments`
--

CREATE TABLE `admin_shift_assignments` (
  `id` bigint UNSIGNED NOT NULL,
  `admin_id` bigint NOT NULL,
  `work_shift_id` bigint UNSIGNED NOT NULL,
  `valid_from` date NOT NULL DEFAULT (curdate()) COMMENT 'Ngày bắt đầu áp dụng ca này',
  `valid_to` date DEFAULT NULL COMMENT 'Ngày kết thúc áp dụng (NULL nghĩa là vô thời hạn)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_shift_assignments`
--

INSERT INTO `admin_shift_assignments` (`id`, `admin_id`, `work_shift_id`, `valid_from`, `valid_to`, `created_at`, `updated_at`) VALUES
(2, 20, 1, '2026-05-22', NULL, '2026-05-20 01:54:41', '2026-05-20 01:54:41'),
(7, 16, 1, '2026-05-22', NULL, '2026-05-20 19:49:18', '2026-05-20 19:49:18'),
(8, 21, 1, '2026-05-22', NULL, '2026-05-21 20:21:48', '2026-05-21 20:21:48'),
(9, 19, 1, '2026-05-22', NULL, '2026-05-21 20:21:48', '2026-05-21 20:21:48');

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_applications`
--

CREATE TABLE `affiliate_applications` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'ID của user nộp đơn',
  `social_links` text COLLATE utf8mb4_unicode_ci COMMENT 'Lưu link Facebook, Tiktok, Instagram... của ứng viên',
  `introduce_message` text COLLATE utf8mb4_unicode_ci COMMENT 'Lời giới thiệu lý do muốn hợp tác',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Trạng thái đơn hàng',
  `admin_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do từ chối hoặc ghi chú của Admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên thuộc tính (VD: Kích cỡ, Chất liệu, Loại đá)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Xóa mềm thuộc tính'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Size', '2026-03-17 11:05:47', '2026-03-17 11:05:47', NULL),
(2, 'Độ dài', '2026-03-17 11:05:53', '2026-03-17 11:05:53', NULL),
(3, 'màu', '2026-03-18 07:11:37', '2026-03-18 07:11:37', NULL),
(4, 'loại', '2026-03-18 07:11:38', '2026-03-18 07:11:38', NULL),
(5, 'chất liệu', '2026-03-18 07:11:38', '2026-03-18 07:11:38', NULL),
(6, 'TEST', '2026-03-19 02:34:52', '2026-04-24 22:16:08', '2026-04-24 22:16:08'),
(7, 'njn', '2026-03-20 00:33:49', '2026-04-24 22:15:43', '2026-04-24 22:15:43'),
(8, 'bac', '2026-03-20 00:34:27', '2026-04-24 22:15:51', '2026-04-24 22:15:51'),
(9, 'Màu Sắc', '2026-03-23 07:27:36', '2026-03-23 07:27:36', NULL),
(10, 'Kích cỡ', '2026-03-23 07:30:22', '2026-04-24 22:15:57', '2026-04-24 22:15:57'),
(11, 'Kích thước', '2026-03-23 07:31:29', '2026-03-23 07:31:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` bigint UNSIGNED NOT NULL,
  `attribute_id` bigint UNSIGNED NOT NULL,
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Giá trị cụ thể (VD: Ni 10, Vàng 18K, Đính Ruby)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Xóa mềm giá trị thuộc tính'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `attribute_id`, `value`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'M', '2026-03-17 11:06:31', '2026-03-17 11:06:31', NULL),
(2, 2, '12', '2026-03-17 11:06:40', '2026-03-17 11:06:40', NULL),
(3, 2, '11', '2026-03-17 11:07:30', '2026-03-17 11:07:30', NULL),
(4, 2, '14', '2026-03-17 18:27:19', '2026-03-17 18:27:19', NULL),
(5, 3, 'vàng', '2026-03-18 07:23:36', '2026-03-18 07:23:36', NULL),
(6, 2, '10', '2026-03-18 07:23:53', '2026-03-18 07:23:53', NULL),
(7, 3, 'xanh', '2026-03-18 07:24:00', '2026-03-18 07:24:00', NULL),
(8, 4, 'a', '2026-03-18 07:24:18', '2026-03-18 07:24:18', NULL),
(9, 5, 'vàng', '2026-03-18 07:24:29', '2026-03-18 07:24:29', NULL),
(10, 5, 'bạc', '2026-03-18 07:24:37', '2026-03-18 07:24:37', NULL),
(11, 4, 'dden', '2026-03-20 00:34:42', '2026-03-20 00:34:42', NULL),
(12, 6, 'den', '2026-03-20 00:35:11', '2026-03-20 00:35:11', NULL),
(13, 9, 'Vàng', '2026-03-23 07:28:33', '2026-03-23 07:28:33', NULL),
(14, 10, '2', '2026-03-23 07:30:39', '2026-03-23 07:30:39', NULL),
(15, 11, '2', '2026-03-23 07:31:41', '2026-03-23 07:31:41', NULL),
(16, 9, 'Đen', '2026-04-10 09:04:16', '2026-04-10 09:04:16', NULL),
(17, 9, 'Trắng', '2026-04-10 09:04:31', '2026-04-10 09:04:31', NULL),
(18, 9, 'Xanh lá', '2026-04-10 09:04:39', '2026-04-10 09:04:39', NULL),
(19, 9, 'Hồng', '2026-04-10 09:11:40', '2026-04-10 09:11:40', NULL),
(20, 9, 'Xanh dương', '2026-04-10 09:11:52', '2026-04-10 09:11:52', NULL),
(21, 9, 'Nâu', '2026-04-10 10:00:23', '2026-04-10 10:00:23', NULL),
(22, 1, '8 – 14', '2026-04-24 22:14:37', '2026-04-24 22:14:37', NULL),
(23, 1, '14 – 2', '2026-04-24 22:15:21', '2026-04-24 22:15:21', NULL),
(24, 5, '18K', '2026-04-24 22:16:37', '2026-04-24 22:16:37', NULL),
(25, 5, '24K', '2026-04-24 22:16:45', '2026-04-24 22:16:45', NULL),
(26, 11, '1', '2026-04-24 23:48:15', '2026-04-24 23:48:15', NULL),
(101, 1, 'Ni 10', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(102, 1, 'Ni 12', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(103, 1, 'Ni 14', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(104, 1, 'Ni 16', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(105, 5, 'Vàng Trắng 18K', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(106, 5, 'Vàng Hồng 18K', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(107, 5, 'Bạch Kim (Platinum)', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(108, 1, '16 cm', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(109, 1, '18 cm', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(110, 5, 'Vàng 24K Nguyên Chất', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(111, 1, '45 cm', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL),
(112, 1, '50 cm', '2026-04-25 09:23:57', '2026-04-25 09:23:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` bigint UNSIGNED NOT NULL,
  `brand_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_desktop` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'home_slider',
  `sort_order` int DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `click_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `brand_id`, `title`, `image_desktop`, `image_mobile`, `target_url`, `position`, `sort_order`, `start_date`, `end_date`, `status`, `click_count`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 'Jewelry Sora', 'banners/desktop/banner_desk_abcd_1774327313.jpg', 'banners/mobile/banner_mob_abcd_1774327314.jpg', 'http://localhost:5173/shop', 'home_slider', 1, '2026-03-14 04:56:00', '2026-03-31 04:56:00', 'active', 0, '2026-03-19 17:56:42', '2026-04-23 08:43:50', NULL),
(2, NULL, 'Luxury Combos', 'banners/desktop/banner_desk_luxury-combos_1776959101.jpg', 'banners/mobile/banner_mob_khai-truong_1774327447.jpg', 'http://localhost:5173/combos', 'home_slider', 2, '2026-03-23 18:43:00', '2026-03-31 18:43:00', 'active', 0, '2026-03-23 21:44:07', '2026-04-23 08:45:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên thương hiệu (VD: PNJ, DOJI, Cartier)',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Logo thương hiệu',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT NULL COMMENT 'Thứ tự hiển thị (Chỉ có khi Active)',
  `status` enum('active','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `sort_order`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'Sora', 'sora', 'brands/brand_sora_1774275527.png', 'Sora trang sức cao cấp.', 2, 'active', '2026-03-18 05:21:34', '2026-04-23 00:27:48', NULL),
(4, 'TEST1', 'test1', 'brands/brand_test_1776774897.jpg', NULL, NULL, 'hidden', '2026-04-21 05:34:57', '2026-04-23 00:38:35', '2026-04-23 00:38:35'),
(5, 'TEST', 'test', 'brands/brand_test_1776929255.jpg', 'TEST', 3, 'active', '2026-04-23 00:27:35', '2026-04-24 23:47:23', NULL),
(6, 'test22', 'test22', 'brands/brand_test222_1778871453.jpg', NULL, 4, 'active', '2026-05-15 11:57:33', '2026-05-15 12:01:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-sora_gold_last_updated', 's:16:\"09:46 28/03/2026\";', 1774691495),
('laravel-cache-sora_gold_prices', 'a:26:{i:0;a:3:{s:4:\"name\";s:28:\"SJC -Bán Lẻ(nghìn/chỉ)\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:1;a:3:{s:4:\"name\";s:25:\"Kim TT/AVPL(nghìn/chỉ)\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:2;a:3:{s:4:\"name\";s:54:\"NHẪN TRÒN 9999 HƯNG THỊNH VƯỢNG(nghìn/chỉ)\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:3;a:3:{s:4:\"name\";s:20:\"Nguyên Liệu 99.99\";s:3:\"buy\";s:6:\"16,000\";s:4:\"sell\";s:6:\"16,200\";}i:4;a:3:{s:4:\"name\";s:19:\"Nguyên Liệu 99.9\";s:3:\"buy\";s:6:\"15,950\";s:4:\"sell\";s:6:\"16,050\";}i:5;a:3:{s:4:\"name\";s:41:\"NỮ TRANG 9999 - BÁN LẺ(nghìn/chỉ)\";s:3:\"buy\";s:6:\"16,800\";s:4:\"sell\";s:6:\"17,200\";}i:6;a:3:{s:4:\"name\";s:26:\"NỮ TRANG 999 - BÁN LẺ\";s:3:\"buy\";s:6:\"16,750\";s:4:\"sell\";s:6:\"17,150\";}i:7;a:3:{s:4:\"name\";s:53:\"Nữ trang 99                          -    Bán Lẻ\";s:3:\"buy\";s:6:\"16,680\";s:4:\"sell\";s:6:\"17,130\";}i:8;a:3:{s:4:\"name\";s:15:\"SJC - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:9;a:3:{s:4:\"name\";s:11:\"Kim TT/AVPL\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:10;a:3:{s:4:\"name\";s:40:\"NHẪN TRÒN 9999 HƯNG THỊNH VƯỢNG\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:11;a:3:{s:4:\"name\";s:28:\"Nữ trang 99.99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,800\";s:4:\"sell\";s:6:\"17,200\";}i:12;a:3:{s:4:\"name\";s:27:\"Nữ trang 99.9 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,750\";s:4:\"sell\";s:6:\"17,150\";}i:13;a:3:{s:4:\"name\";s:25:\"Nữ trang 99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,680\";s:4:\"sell\";s:6:\"17,130\";}i:14;a:3:{s:4:\"name\";s:15:\"SJC - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:15;a:3:{s:4:\"name\";s:16:\"AVPL - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:16;a:3:{s:4:\"name\";s:40:\"NHẪN TRÒN 9999 HƯNG THỊNH VƯỢNG\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:17;a:3:{s:4:\"name\";s:28:\"Nữ trang 99.99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,800\";s:4:\"sell\";s:6:\"17,200\";}i:18;a:3:{s:4:\"name\";s:27:\"Nữ trang 99.9 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,750\";s:4:\"sell\";s:6:\"17,150\";}i:19;a:3:{s:4:\"name\";s:25:\"Nữ trang 99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,680\";s:4:\"sell\";s:6:\"17,130\";}i:20;a:3:{s:4:\"name\";s:15:\"SJC - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:21;a:3:{s:4:\"name\";s:16:\"AVPL - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:22;a:3:{s:4:\"name\";s:52:\"Nhẫn Tròn 9999 Hưng Thịnh Vượng - Bán Lẻ\";s:3:\"buy\";s:6:\"16,980\";s:4:\"sell\";s:6:\"17,280\";}i:23;a:3:{s:4:\"name\";s:28:\"Nữ trang 99.99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,800\";s:4:\"sell\";s:6:\"17,200\";}i:24;a:3:{s:4:\"name\";s:27:\"Nữ trang 99.9 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,750\";s:4:\"sell\";s:6:\"17,150\";}i:25;a:3:{s:4:\"name\";s:25:\"Nữ trang 99 - Bán Lẻ\";s:3:\"buy\";s:6:\"16,680\";s:4:\"sell\";s:6:\"17,130\";}}', 1774691495);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'ID user nếu đã đăng nhập. NULL nếu là Guest',
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID phiên trình duyệt/thiết bị của Guest',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(13, NULL, 'session_p8002rib5', '2026-03-26 08:23:11', '2026-03-26 08:23:11'),
(30, 69, NULL, '2026-04-11 00:14:45', '2026-04-11 00:14:45'),
(46, 73, NULL, '2026-04-25 00:01:11', '2026-04-25 00:01:11'),
(47, NULL, 'session_kuiek6b74', '2026-05-18 03:25:41', '2026-05-18 03:25:41');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint UNSIGNED NOT NULL,
  `cart_id` bigint UNSIGNED NOT NULL,
  `combo_id` bigint UNSIGNED DEFAULT NULL,
  `combo_selections` json DEFAULT NULL COMMENT 'Lưu mảng các variant khách chọn',
  `product_variant_id` bigint UNSIGNED DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `combo_id`, `combo_selections`, `product_variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(45, 30, NULL, NULL, 18, 1, '2026-04-11 01:10:34', '2026-04-11 01:10:34'),
(46, 30, NULL, NULL, 104, 1, '2026-04-11 01:35:39', '2026-04-11 01:35:39'),
(48, 30, 4, '[{\"combo_item_id\": 85, \"selected_variant_id\": 106}, {\"combo_item_id\": 86, \"selected_variant_id\": 83}, {\"combo_item_id\": 87, \"selected_variant_id\": 66}]', NULL, 1, '2026-04-15 01:32:44', '2026-04-15 01:32:44'),
(50, 30, NULL, NULL, 106, 1, '2026-04-15 01:48:21', '2026-04-15 01:48:21'),
(77, 46, NULL, NULL, 74, 1, '2026-04-25 00:01:11', '2026-04-25 00:01:11'),
(82, 47, NULL, NULL, 580, 1, '2026-05-18 03:25:41', '2026-05-18 03:25:41'),
(83, 46, NULL, NULL, 724, 1, '2026-05-21 02:47:15', '2026-05-21 02:47:15');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'VD: Nhẫn, Dây chuyền...',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT NULL COMMENT 'Thứ tự hiển thị (Chỉ có khi Active)',
  `attributes_schema` json DEFAULT NULL COMMENT 'Định nghĩa template thuộc tính (VD: ["Size nhẫn", "Chất liệu"])',
  `status` enum('active','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `thumbnail`, `sort_order`, `attributes_schema`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(8, NULL, 'Nhẫn Kim Cương', 'nhan-kim-cuong', 'Các mẫu nhẫn đính kim cương tự nhiên.', 'categories/CTz6tEQNNDQGfYhZeM3pJywJ7tQfTkzxhxKPSJbQ.jpg', 4, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(9, NULL, 'Nhẫn Cưới', 'nhan-cuoi', 'Cặp nhẫn cưới cho ngày trọng đại.', 'categories/Xoc2CNKpUH5c1WcFVMHngGEGFSEohksWR3OUjJk8.jpg', 5, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(10, NULL, 'Lắc Tay', 'lac-tay', 'Lắc tay vàng và bạc tinh xảo.', 'categories/bYBod1ULEjmYeV3etGKfPQ79HzZUCj3og3FdqHQX.jpg', 2, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(11, NULL, 'Dây Chuyền Vàng', 'day-chuyen-vang', 'Dây chuyền vàng 18k, 24k.', 'categories/JBJaS1IP6RnEfbhPfCK2Nyn5G8p6wQCDFZLGFqNd.webp', 6, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(12, NULL, 'Mặt Dây Chuyền', 'mat-day-chuyen', 'Mặt dây chuyền đính đá quý.', 'categories/VeAH5IsJZ3huaDvK7SwVi3j1Q9DvdVjsctkqnQwF.jpg', 1, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(13, NULL, 'Kiềng Cổ', 'kieng-co', 'Kiềng cổ truyền thống cho cô dâu.', 'categories/u1Tioj6LU3190GLiBbBywrardKNVXKTVKJqQH6Cp.jpg', 3, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(14, NULL, 'Trang Sức Trẻ Em', 'trang-suc-tre-em', 'Các mẫu nhỏ gọn, an toàn cho bé.', 'categories/UdpcZ88fUjwTtFOUGbjh73C4o2YqQhymBkYPx7Mo.jpg', 8, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(15, NULL, 'Đồng Hồ Cao Cấp', 'dong-ho-cao-cap', 'Đồng hồ chính hãng đính đá.', 'categories/5W9fItTL8yml2fod1zpnCKGpqBKKfmXRiHYsfva7.jpg', 9, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(16, NULL, 'Quà Tặng Phong Thủy', 'qua-tang-phong-thuy', 'Trang sức mang lại may mắn.', 'categories/zoVkL3SE0bQsREGkZbTlUvdm1pLoZXpllt4zIEgu.jpg', 10, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(17, NULL, 'Bộ Trang Sức', 'bo-trang-suc', 'Sự kết hợp hoàn hảo giữa nhẫn, bông tai và dây chuyền.', 'categories/9pOoAtLD6skrs4J7hi1tlNvmImxXtoTYOrsCvZZn.jpg', 7, '[]', 'active', '2026-04-10 08:33:34', '2026-04-24 23:46:58', NULL),
(18, NULL, 'TEST1', 'test1-deleted-1776930133', NULL, 'categories/jxbxja8h9fLtMFyxjhBwyfx3agXgdo5uflO5EwBD.png', NULL, '[\"Màu\", \"Size\"]', 'active', '2026-04-21 05:33:23', '2026-04-23 00:42:13', '2026-04-23 00:42:13'),
(19, NULL, 'TEST1', 'test1', NULL, NULL, NULL, '[]', 'hidden', '2026-04-23 00:42:20', '2026-04-24 04:58:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_responses`
--

CREATE TABLE `chatbot_responses` (
  `id` bigint UNSIGNED NOT NULL,
  `keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Từ khóa khách sẽ nhập',
  `reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung SORA phản hồi',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_responses`
--

INSERT INTO `chatbot_responses` (`id`, `keyword`, `reply`, `created_at`, `updated_at`, `options`) VALUES
(1, 'kim cương', 'Dạ, toàn bộ kim cương tại SORA đều có chứng nhận GIA quốc tế và được tuyển chọn kỹ lưỡng ạ.', '2026-04-19 06:59:54', '2026-04-24 18:33:39', '[{\"label\":\"Tham khảo nhẫn kim cương ngay!\",\"link\":null}]'),
(2, 'vàng', 'Bên SORA sử dụng vàng chất lượng cao như vàng 18K, 24K, đảm bảo độ tinh khiết và độ bền. Tùy nhu cầu anh/chị muốn mua cho cá nhân hay gia đình, bên em sẽ tư vấn loại phù hợp nhất ạ.', '2026-04-19 06:59:54', '2026-04-20 19:23:56', '[{\"label\":\"[SORA] Vàng 18K\",\"link\":null},{\"label\":\"[SORA] Vàng 24K\",\"link\":null}]'),
(4, 'địa chỉ', 'Dạ, địa chỉ của SORA nằm ngay 01 Nguyễn Tất Thành, TP Buôn Ma Thuột!', '2026-04-19 00:24:57', '2026-04-24 18:24:40', '[]'),
(5, 'vàng 18k', 'Dạ, vàng 18K: ~75% vàng, còn lại là hợp kim → cứng hơn, đeo đẹp, ít móp.', '2026-04-19 00:49:53', '2026-04-19 00:49:53', '[{\"label\":\"Nhẫn Kim Tiền Vàng 18K\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-kim-tien-18k\"},{\"label\":\"Lắc Tay Vàng Cho Bé\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/lac-tay-vang-be\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(6, 'vàng 24k', 'Dạ, vàng 24K: gần như vàng nguyên chất (~99.9%), giá trị cao, phù hợp tích trữ.', '2026-04-19 00:53:06', '2026-04-19 00:54:35', '[{\"label\":\"Dây Chuyền Vàng 24K\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/day-chuyen-24k\"},{\"label\":\"Dây Chuyền Mắt Xích\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/day-chuyen-mat-xich\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(7, 'nhẫn', 'Dạ, Anh/chị đang tìm nhẫn đeo hằng ngày, nhẫn đôi hay nhẫn mang ý nghĩa đặc biệt ạ?\nBên SORA có nhiều mẫu rất hợp gu, em gửi mình tham khảo nhé.', '2026-04-20 19:21:07', '2026-04-20 19:21:58', '[{\"label\":\"[SORA] Nhẫn Cưới Rose Gold\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-cuoi-rose-gold\"},{\"label\":\"[SORA] Nhẫn Cưới Diamond Touch\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-cuoi-diamond-touch\"},{\"label\":\"[SORA] Nhẫn Cưới Forever Love\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-cuoi-forever-love\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(8, 'lắc tay', 'Dạ, Anh/chị thích lắc tay kiểu đơn giản thanh mảnh hay có điểm nhấn nổi bật ạ?\nBên SORA đang có nhiều mẫu rất xinh, em gửi mình tham khảo nhé.', '2026-04-20 19:26:52', '2026-04-20 19:27:13', '[{\"label\":\"[SORA] Lắc Tay Đá Ruby\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/lac-tay-ruby\"},{\"label\":\"[SORA] Lắc Tay Ngọc Trai\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/lac-tay-ngoc-trai\"},{\"label\":\"[SORA] Lắc Tay Đính Đá Sapphire\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/lac-tay-sapphire\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(9, 'giá vàng hiện nay', 'Bên SORA cập nhật giá vàng theo thị trường nên anh/chị luôn mua đúng giá, không bị đội giá.\nNgoài giá vàng, bên em còn đầu tư thiết kế nên sản phẩm vừa đẹp vừa giữ giá trị lâu dài.', '2026-04-24 18:18:21', '2026-04-24 18:18:21', '[{\"label\":\"Xem giá vàng ngay!\",\"link\":\"http:\\/\\/localhost:5173\\/gia-vang\"}]'),
(10, 'bộ sưu tập', 'Dạ, Bộ sưu tập SORA tập trung vào các dòng nhẫn, lắc tay, dây chuyền vàng 18K – vừa bền đẹp vừa dễ phối đồ, phù hợp đeo hằng ngày hoặc làm quà tặng ý nghĩa. Em gửi mình xem mẫu phù hợp luôn nhé!', '2026-04-24 18:23:44', '2026-04-24 18:23:44', '[{\"label\":\"a\",\"link\":\"a\"}]'),
(11, 'combo', 'Dạ, Combo SORA tập trung vào các dòng nhẫn, lắc tay, dây chuyền vàng 18K – vừa bền đẹp vừa dễ phối đồ, phù hợp đeo hằng ngày hoặc làm quà tặng ý nghĩa. Em gửi mình xem mẫu phù hợp luôn nhé!', '2026-04-24 18:24:16', '2026-04-24 18:24:16', '[{\"label\":\"b\",\"link\":\"b\"}]'),
(12, 'quà tặng phong thuỷ', 'Dạ, Quà tặng phong thuỷ SORA không chỉ là món trang sức, mà còn là lời chúc may mắn, tài lộc và thành công được gửi gắm một cách tinh tế và sang trọng. Mời anh/chị tham khảo các mẫu quà tặng ạ!', '2026-04-24 18:28:09', '2026-04-24 18:28:09', '[{\"label\":\"c\",\"link\":\"c\"},{\"label\":\"c\",\"link\":\"c\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(13, 'nhẫn kim cương', 'Dạ, Bên SORA tập trung vào nhẫn kim cương nên từng mẫu đều được chăm chút kỹ từ kiểu dáng đến độ lấp lánh.\nĐeo vừa sang, vừa giữ giá trị lâu dài – rất phù hợp làm quà tặng hoặc cầu hôn.', '2026-04-24 18:34:57', '2026-04-24 21:55:41', '[{\"label\":\"Nhẫn Kim Cương Eternity\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-kim-cuong-eternity\"},{\"label\":\"Nhẫn Kim Cương Pear Shape\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-kim-cuong-pear\"},{\"label\":\"Nhẫn Kim Cương Oval\",\"link\":\"http:\\/\\/localhost:5173\\/shop\\/aurora-jewelry\\/product\\/nhan-kim-cuong-oval\"},{\"label\":\"Xem thêm tại đây!\",\"link\":\"http:\\/\\/localhost:5173\\/shop\"}]'),
(14, 'ship', 'Dạ, SORA có hỗ trợ giao hàng toàn quốc 🚚\n✔️ Miễn phí trong phạm vi 25km\n✔️ Các khu vực xa hơn sẽ tính phí theo khoảng cách\n👉 Đặc biệt: một số khu vực bên em đang hỗ trợ freeship 🎁\n\nAnh/chị cho em xin địa chỉ (tỉnh đã sáp nhập) để kiểm tra phí ship chính xác cho mình nhé!', '2026-04-24 18:50:24', '2026-04-24 18:50:24', '[{\"label\":\"TP. Hồ Chí Minh\",\"link\":null},{\"label\":\"TP. Đà Nẵng\",\"link\":null},{\"label\":\"TP. Hà Nội\",\"link\":null}]'),
(15, 'gia lai (~180 km)', 'Dạ, với Gia Lai thì phí ship của mình là \"45.000đ\" ạ!', '2026-04-24 18:56:17', '2026-04-24 18:56:17', '[]'),
(16, 'khánh hoà (~190 km)', 'Dạ, với Khánh Hoà thì phí ship của mình là \"45.000đ\" ạ!', '2026-04-24 18:56:42', '2026-04-24 18:56:42', '[]'),
(17, 'lâm đồng (~210 km)', 'Dạ, với Lâm Đồng thì phí ship của mình là \"45.000đ\" ạ!', '2026-04-24 18:56:59', '2026-04-24 18:56:59', '[]'),
(18, 'đồng nai (~320 km)', 'Dạ, với Đồng Nai thì phí ship của mình là \"60.000đ\" ạ!', '2026-04-24 18:57:32', '2026-04-24 18:57:32', '[]'),
(19, 'tp. hồ chí minh (~350 km)', 'Dạ, với TP. Hồ Chí Minh thì phí ship của mình là \"60.000đ\" ạ!', '2026-04-24 18:57:51', '2026-04-24 18:57:51', '[]'),
(20, 'quảng ngãi (~380 km)', 'Dạ, với Quảng Ngãi thì phí ship của mình là \"75.000đ\" ạ!', '2026-04-24 18:58:16', '2026-04-24 18:58:16', '[]'),
(21, 'tây ninh (~380 km)', 'Dạ, với Tây Ninh thì phí ship của mình là \"75.000đ\" ạ!', '2026-04-24 18:58:35', '2026-04-24 18:58:35', '[]'),
(22, 'đồng tháp (~450 km)', 'Dạ, với Đồng Tháp thì phí ship của mình là \"75.000đ\" ạ!', '2026-04-24 18:58:49', '2026-04-24 18:58:49', '[]'),
(23, 'vĩnh long (~480 km)', 'Dạ, với Vĩnh Long thì phí ship của mình là \"75.000đ\" ạ!', '2026-04-24 18:59:04', '2026-04-24 18:59:04', '[]'),
(24, 'tp. cần thơ (~510 km)', 'Dạ, với TP. Cần Thơ thì phí ship của mình là \"90.000đ\" ạ!', '2026-04-24 18:59:37', '2026-04-24 18:59:37', '[]'),
(25, 'tp. đà nẵng (~530 km)', 'Dạ, với TP. Đà Nẵng thì phí ship của mình là \"90.000đ\" ạ!', '2026-04-24 19:00:36', '2026-04-24 19:00:36', '[]'),
(26, 'an giang (~540 km)', 'Dạ, với An Giang thì phí ship của mình là \"90.000đ\" ạ!', '2026-04-24 19:00:51', '2026-04-24 19:00:51', '[]'),
(27, 'tp. huế (~630 km)', 'Dạ, với TP. Huế thì phí ship của mình là \"105.000đ\" ạ!', '2026-04-24 19:01:17', '2026-04-24 19:01:17', '[]'),
(28, 'cà mau (~660 km)', 'Dạ, với Cà Mau thì phí ship của mình là \"105.000đ\" ạ!', '2026-04-24 19:01:32', '2026-04-24 19:01:32', '[]'),
(29, 'quảng trị (~700 km)', 'Dạ, với Quảng Trị thì phí ship của mình là \"105.000đ\" ạ!', '2026-04-24 19:01:57', '2026-04-24 19:01:57', '[]'),
(30, 'hà tĩnh (~950 km)', 'Dạ, với Hà Tĩnh thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:02:59', '2026-04-24 19:02:59', '[]'),
(31, 'nghệ an (~1.000 km)', 'Dạ, với Nghệ An thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:03:14', '2026-04-24 19:03:14', '[]'),
(32, 'thanh hóa (~1.150 km)', 'Dạ, với Thanh Hóa thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:03:34', '2026-04-24 19:03:34', '[]'),
(33, 'ninh bình (~1.200 km)', 'Dạ, với Ninh Bình thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:04:38', '2026-04-24 19:04:38', '[]'),
(34, 'hưng yên (~1.280 km)', 'Dạ, với Hưng Yên thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:05:03', '2026-04-24 19:05:03', '[]'),
(35, 'tp hà nội (~1.300 km)', 'Dạ, với TP Hà Nội thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:05:39', '2026-04-24 19:05:39', '[]'),
(36, 'bắc ninh (1.330 km)', 'Dạ, với Bắc Ninh thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:05:58', '2026-04-24 19:05:58', '[]'),
(37, 'tp hải phòng (~1.350 km)', 'Dạ, với TP Hải Phòng thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:06:14', '2026-04-24 19:06:14', '[]'),
(38, 'thái nguyên (1.380 km)', 'Dạ, với Thái Nguyên thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:06:32', '2026-04-24 19:06:32', '[]'),
(39, 'phú thọ (~1.380 km)', 'Dạ, với Phú Thọ thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:06:54', '2026-04-24 19:06:54', '[]'),
(40, 'tuyên quang (~1.430 km)', 'Dạ, với Tuyên Quang thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:07:15', '2026-04-24 19:07:15', '[]'),
(41, 'lạng sơn (~1.450 km)', 'Dạ, với Lạng Sơn thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:07:39', '2026-04-24 19:07:39', '[]'),
(42, 'quảng ninh (~1.450 km)', 'Dạ, với Quảng Ninh thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:07:58', '2026-04-24 19:07:58', '[]'),
(43, 'sơn la (~1.500 km)', 'Dạ, với Sơn La thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:08:43', '2026-04-24 19:08:43', '[]'),
(44, 'cao bằng (~1.600 km)', 'Dạ, với Cao Bằng (Quê Anh Độ Mixi) thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:09:36', '2026-04-24 19:15:33', '[]'),
(45, 'lào cai (~1.600 km)', 'Dạ, với Lào Cai thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:10:07', '2026-04-24 19:10:07', '[]'),
(46, 'điện biên (~1.650 km)', 'Dạ, với Điện Biên thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:10:27', '2026-04-24 19:10:27', '[]'),
(47, 'lai châu (~1.700 km)', 'Dạ, với Lai Châu thì phí ship của mình là \"130.000đ\" ạ!', '2026-04-24 19:10:43', '2026-04-24 19:10:43', '[]'),
(48, 'sài gòn (~350 km)', 'Dạ, với Sài Gòn (TP. Hồ Chí Minh) thì phí ship của mình là \"60.000đ\" ạ!', '2026-04-24 19:18:58', '2026-04-24 19:19:11', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `combos`
--

CREATE TABLE `combos` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên Combo',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ảnh đại diện Combo',
  `target_gender` enum('male','female','unisex','couple') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unisex' COMMENT 'Phân loại giới tính/Cặp đôi',
  `target_age_group` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Độ tuổi hướng tới (VD: 18-25, 25-40, Trung niên)',
  `theme` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chủ đề/Dịp (VD: Valentine, Kỷ niệm, Quà tặng Mẹ)',
  `discount_type` enum('percentage','fixed_amount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage' COMMENT 'Giảm theo % hoặc trừ thẳng tiền',
  `discount_value` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Giá trị giảm',
  `is_discount_stackable` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Cho phép áp dụng thêm Voucher',
  `usage_limit` int DEFAULT NULL COMMENT 'Giới hạn số lượt mua',
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `combos`
--

INSERT INTO `combos` (`id`, `name`, `slug`, `description`, `thumbnail_image`, `target_gender`, `target_age_group`, `theme`, `discount_type`, `discount_value`, `is_discount_stackable`, `usage_limit`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Combo forever', 'combo-forever', 'Combo forever', 'combos/combo_combo-forever_1774277548.jpg', 'couple', NULL, 'valungtung', 'percentage', 5.00, 0, 3, '2026-03-24 07:20:00', '2026-04-22 23:20:00', 'active', '2026-03-23 07:52:28', '2026-04-11 03:31:09', '2026-04-11 03:31:09'),
(2, 'Ngày của em', 'ngay-cua-em', 'Ngày của em', 'combos/combo_ngay-cua-em_1774691495.jpg', 'female', NULL, 'valungtung', 'percentage', 5.00, 0, 10, '2026-03-27 05:00:00', '2026-03-31 05:00:00', 'active', '2026-03-28 02:51:35', '2026-04-11 03:00:55', '2026-04-11 03:00:55'),
(3, 'Ngày cho anh', 'ngay-cho-anh', 'Ngày cho anh', 'combos/combo_ngay-cho-anh_1774691566.jpg', 'unisex', NULL, 'valungtung', 'percentage', 5.00, 0, 10, '2026-03-27 05:00:00', '2026-03-31 05:00:00', 'active', '2026-03-28 02:52:46', '2026-04-11 03:00:58', '2026-04-11 03:00:58'),
(4, 'luxury', 'luxury', NULL, 'combos/combo_luxury_1775902117.jpg', 'female', NULL, NULL, 'fixed_amount', 2000000.00, 0, 10, '2026-04-11 05:00:00', '2026-04-30 05:00:00', 'active', '2026-04-11 03:08:38', '2026-04-22 19:20:49', NULL),
(5, 'Thiên Thần Nhỏ', 'thien-than-nho', NULL, 'combos/combo_thien-than-nho_1776958427.jpg', 'unisex', NULL, NULL, 'percentage', 15.00, 0, 8, '2026-04-23 05:00:00', '2026-04-30 05:00:00', 'active', '2026-04-23 08:33:47', '2026-04-24 23:58:30', NULL),
(6, '25 NGÀY GIỮ THÁNG', '25-ngay-giu-thang', 'ƯU ĐÃI', 'combos/combo_25-ngay-giu-thang_1777099773.jpg', 'couple', '18-36', 'LƯƠNG', 'fixed_amount', 500000.00, 0, 9, '2026-04-25 05:00:00', '2026-08-29 05:00:00', 'active', '2026-04-24 23:49:33', '2026-05-19 02:14:07', NULL),
(7, 'Test123', 'test123', 'Test123', 'combos/combo_test123_1779182137.jpg', 'unisex', '12', 'Test123', 'percentage', 50.00, 0, NULL, '2026-05-19 09:15:00', '2026-07-31 09:15:00', 'active', '2026-05-19 02:15:37', '2026-05-19 02:15:47', '2026-05-19 02:15:47');

-- --------------------------------------------------------

--
-- Table structure for table `combo_items`
--

CREATE TABLE `combo_items` (
  `id` bigint UNSIGNED NOT NULL,
  `combo_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `product_variant_id` bigint UNSIGNED DEFAULT NULL COMMENT 'NULL: Khách được chọn biến thể | ID: Ép cố định biến thể',
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `combo_items`
--

INSERT INTO `combo_items` (`id`, `combo_id`, `product_id`, `product_variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(88, 4, 102, NULL, 1, '2026-04-22 19:20:49', '2026-04-22 19:20:49'),
(89, 4, 79, NULL, 1, '2026-04-22 19:20:49', '2026-04-22 19:20:49'),
(90, 4, 62, NULL, 1, '2026-04-22 19:20:49', '2026-04-22 19:20:49'),
(91, 5, 70, NULL, 1, '2026-04-23 08:33:47', '2026-04-23 08:33:47'),
(92, 5, 71, NULL, 1, '2026-04-23 08:33:47', '2026-04-23 08:33:47'),
(93, 5, 73, NULL, 1, '2026-04-23 08:33:47', '2026-04-23 08:33:47'),
(94, 5, 72, NULL, 1, '2026-04-23 08:33:47', '2026-04-23 08:33:47'),
(99, 6, 99, 599, 1, '2026-05-19 02:14:07', '2026-05-19 02:14:07'),
(100, 6, 93, NULL, 1, '2026-05-19 02:14:07', '2026-05-19 02:14:07'),
(101, 7, 109, NULL, 1, '2026-05-19 02:15:37', '2026-05-19 02:15:37'),
(102, 7, 108, NULL, 1, '2026-05-19 02:15:37', '2026-05-19 02:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `commission_histories`
--

CREATE TABLE `commission_histories` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'ID của người làm affiliate được hưởng',
  `order_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Mã đơn hàng phát sinh hoa hồng (nếu có)',
  `amount` decimal(15,2) NOT NULL COMMENT 'Số tiền biến động (Số dương là cộng tiền, số âm là trừ tiền)',
  `type` enum('earn','payout','deduct') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'earn: Nhận từ đơn, payout: Rút tiền, deduct: Trừ tiền do hủy/hoàn đơn',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết lý do biến động',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint UNSIGNED NOT NULL,
  `fullname` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','resolved') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `fullname`, `phone`, `email`, `message`, `status`, `created_at`, `updated_at`) VALUES
(1, 'hieuht', '0377975276', 'hieuhtpk04060@gmail.com', 'Hello!', 'pending', '2026-04-07 03:16:53', '2026-04-07 03:16:53'),
(2, 'hieuht', '0377975276', 'hieuhtpk04060@gmail.com', 'Chào admin', 'pending', '2026-04-16 03:13:27', '2026-04-16 03:13:27'),
(3, 'hieuht', '0377975276', 'hieuhtpk04060@gmail.com', 'chào admin', 'pending', '2026-04-16 03:17:53', '2026-04-16 03:17:53'),
(4, 'Hoàng Thanh Hiếu', '0323123435', 'hieuhtpk04060@gmail.com', 'Chào admin', 'pending', '2026-04-24 06:08:11', '2026-04-24 06:08:11'),
(5, 'Hoàng Thanh Hiếu', '0323123435', 'hieuhtpk04060@gmail.com', 'tooi muoos goi quà', 'resolved', '2026-04-24 23:52:25', '2026-04-24 23:52:46');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `min_spend` bigint NOT NULL DEFAULT '0',
  `type` varchar(20) NOT NULL,
  `value` bigint NOT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_count` int NOT NULL DEFAULT '0',
  `usage_limit_per_user` int DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` datetime DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `user_id`, `name`, `code`, `min_spend`, `type`, `value`, `usage_limit`, `usage_count`, `usage_limit_per_user`, `expires_at`, `is_used`, `created_at`, `updated_at`, `deleted_at`, `status`) VALUES
(15, NULL, 'abc', 'abca', 1, 'fixed', 1, 1, 1, 1, '2026-04-20 00:00:00', 0, '2026-03-19 02:14:14', '2026-03-19 15:05:19', '2026-03-19 15:05:19', 'active'),
(16, NULL, 'SORA', 'SORA', 10000000, 'percentage', 10, 99999, 4, 1, '2027-01-01 16:02:00', 0, '2026-03-19 14:20:37', '2026-04-23 09:02:33', NULL, 'active'),
(17, NULL, 'welcome', 'WELCOME', 5000000, 'fixed', 500000, 100, 0, 1, '2027-01-01 16:03:00', 0, '2026-04-23 09:04:01', '2026-04-23 09:04:01', NULL, 'active'),
(18, NULL, '99 đóa hồng', '99DOAHONG', 10000000, 'fixed', 999000, 100, 0, 2, '2027-01-01 16:04:00', 0, '2026-04-23 09:05:11', '2026-04-23 09:08:40', '2026-04-23 16:08:40', 'active'),
(19, NULL, '30/04 - 01/05', 'NANNANANANAAA', 500000, 'fixed', 100000, 9999, 0, 1, '2028-12-23 16:07:00', 0, '2026-04-23 09:07:54', '2026-04-23 09:08:34', '2026-04-23 16:08:34', 'active'),
(22, 74, 'Voucher Sinh Nhật 2026', 'HYFXGCPW', 0, 'birthday', 12, 1, 0, 1, '2026-05-27 20:26:04', 0, '2026-05-20 20:26:04', '2026-05-21 01:48:32', '2026-05-21 08:48:32', 'active'),
(23, 75, 'Voucher Sinh Nhật 2026', 'BGAKHUXH', 0, 'birthday', 26, 1, 0, 1, '2026-05-27 20:26:08', 0, '2026-05-20 20:26:08', '2026-05-21 01:48:32', '2026-05-21 08:48:32', 'active'),
(24, 76, 'Voucher Sinh Nhật 2026', 'KZB6WSHG', 0, 'birthday', 27, 1, 0, 1, '2026-05-28 00:22:53', 0, '2026-05-21 00:22:53', '2026-05-21 01:48:32', '2026-05-21 08:48:32', 'active'),
(25, 76, 'Voucher Sinh Nhật 2026', '1CDBPMIH', 0, 'birthday', 21, 1, 1, 1, '2026-05-28 01:48:42', 1, '2026-05-21 01:48:42', '2026-05-21 19:39:52', '2026-05-22 02:39:52', 'active'),
(26, 76, 'Voucher Sinh Nhật 2026', 'UJTOT6L5', 0, 'birthday', 21, 1, 0, 1, '2026-05-28 19:40:24', 0, '2026-05-21 19:40:24', '2026-05-21 19:40:24', NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `customer_galleries`
--

CREATE TABLE `customer_galleries` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_galleries`
--

INSERT INTO `customer_galleries` (`id`, `title`, `image_path`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(9, 'sora', 'customer_galleries/YivdM3ItEcuQQUKEQtcH8uwaSRK5PdFMksKV7AsW.webp', 0, 1, '2026-04-09 21:00:18', '2026-04-11 03:58:16'),
(10, 'necklace', 'customer_galleries/6AJNJ8UUyk8pJc7bo34pCcSwBQxSJ2NjoT4IqMq6.webp', 0, 1, '2026-04-23 09:17:29', '2026-04-23 09:17:29'),
(11, 'jewelry', 'customer_galleries/bwnPrmwaEuD90bdJ88B4koYkSPTMSl7GEWdvm9SI.webp', 0, 1, '2026-04-23 09:26:34', '2026-04-23 09:26:34'),
(12, 'jewelry', 'customer_galleries/jK2Ttv9VPrqa0aI2VYNASU5EYNv04FyeCf7qt8HK.jpg', 0, 1, '2026-04-23 09:27:13', '2026-04-23 09:27:13');

-- --------------------------------------------------------

--
-- Table structure for table `favourites`
--

CREATE TABLE `favourites` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `favourites`
--

INSERT INTO `favourites` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES
(7, 71, 8, '2026-03-26 21:10:17', '2026-03-26 21:10:17'),
(12, 73, 107, '2026-04-24 06:09:55', '2026-04-24 06:09:55'),
(16, 70, 108, '2026-05-12 06:47:23', '2026-05-12 06:47:23'),
(23, 70, 107, '2026-05-18 05:38:35', '2026-05-18 05:38:35'),
(26, 70, 96, '2026-05-18 18:17:55', '2026-05-18 18:17:55'),
(32, 70, 76, '2026-05-18 18:28:59', '2026-05-18 18:28:59');

-- --------------------------------------------------------

--
-- Table structure for table `membership_tiers`
--

CREATE TABLE `membership_tiers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'Bạc, Vàng, Kim Cương...',
  `min_spent` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Ngưỡng chi tiêu tối thiểu',
  `min_orders` int NOT NULL DEFAULT '0' COMMENT 'Ngưỡng số đơn hàng tối thiểu',
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Phần trăm giảm giá mặc định',
  `yearly_discount_quota` int NOT NULL DEFAULT '0',
  `yearly_service_quota` int NOT NULL DEFAULT '0' COMMENT 'Số lần vệ sinh/đánh bóng miễn phí mỗi năm (Câu hỏi 2)',
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `membership_tiers`
--

INSERT INTO `membership_tiers` (`id`, `name`, `min_spent`, `min_orders`, `discount_percent`, `yearly_discount_quota`, `yearly_service_quota`, `icon`, `created_at`, `updated_at`) VALUES
(1, 'Bạc', 15000000.00, 2, 2.00, 5, 5, 'tiers/5d0qob6N6fAeMPnnr2VbkreeTjfqGbk5MeG5VaJx.jpg', '2026-04-23 01:05:49', '2026-04-24 04:41:40'),
(2, 'Vàng', 50000000.00, 4, 5.00, 10, 5, 'tiers/mBVCwYP6SvmC1N7WsUel2WQeOMsvmOfdPeqOUje9.jpg', '2026-04-23 01:06:53', '2026-04-23 03:03:06'),
(3, 'Kim Cương', 200000000.00, 10, 10.00, 20, 15, 'tiers/siAlC5YOnxFxWOHm9kmVDwreXvdrz5uA6hTzA0BI.jpg', '2026-04-23 01:08:28', '2026-04-25 00:05:43');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint UNSIGNED NOT NULL,
  `sender_id` int UNSIGNED NOT NULL,
  `receiver_id` int UNSIGNED NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `message_type`, `file_url`, `file_name`, `file_size`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 72, 1, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-09 22:38:45', '2026-04-09 22:38:45'),
(2, 72, 1, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-09 22:39:47', '2026-04-09 22:39:47'),
(3, 1, 72, 'sao vậy', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:19:00', '2026-04-10 07:19:00'),
(4, 1, 72, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:25:51', '2026-04-10 07:25:51'),
(5, 72, 1, 'd', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:30:59', '2026-04-10 07:30:59'),
(6, 1, 72, 'ádsad', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:31:03', '2026-04-10 07:31:03'),
(7, 72, 1, 'em muốn tư vấn', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:32:14', '2026-04-10 07:32:14'),
(8, 1, 72, 'có gì không em', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:32:23', '2026-04-10 07:32:23'),
(9, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:33:56', '2026-04-10 07:33:56'),
(10, 1, 73, 'ok em', 'text', NULL, NULL, NULL, 0, '2026-04-10 07:34:01', '2026-04-10 07:34:01'),
(11, 73, 1, 'hú', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:43:35', '2026-04-11 03:43:35'),
(12, 1, 73, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:43:46', '2026-04-11 03:43:46'),
(13, 73, 1, 'hahahaha', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:43:51', '2026-04-11 03:43:51'),
(14, 73, 1, 'kk', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:44:47', '2026-04-11 03:44:47'),
(15, 1, 73, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:44:52', '2026-04-11 03:44:52'),
(16, 1, 72, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:45:01', '2026-04-11 03:45:01'),
(17, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:50:15', '2026-04-11 03:50:15'),
(18, 1, 73, 'dsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:50:19', '2026-04-11 03:50:19'),
(19, 73, 1, 'bruh', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:50:33', '2026-04-11 03:50:33'),
(20, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:53:37', '2026-04-11 03:53:37'),
(21, 73, 16, 'làm được không vậy', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:55:12', '2026-04-11 03:55:12'),
(22, 73, 16, 'dsadsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 03:55:58', '2026-04-11 03:55:58'),
(23, 73, 16, 'dsad', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:00:13', '2026-04-11 04:00:13'),
(24, 22, 73, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:00:16', '2026-04-11 04:00:16'),
(25, 22, 73, 'alo alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:00:23', '2026-04-11 04:00:23'),
(26, 73, 16, 'sao vậy cu', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:00:27', '2026-04-11 04:00:27'),
(27, 22, 73, 'sao vạy', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:01:32', '2026-04-11 04:01:32'),
(28, 73, 16, 'ok', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:01:36', '2026-04-11 04:01:36'),
(29, 22, 73, 'bạn cần gì không', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:01:48', '2026-04-11 04:01:48'),
(30, 73, 16, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:01:54', '2026-04-11 04:01:54'),
(31, 73, 16, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:07:17', '2026-04-11 04:07:17'),
(32, 22, 73, 'dsadsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:07:23', '2026-04-11 04:07:23'),
(33, 73, 16, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:11:10', '2026-04-11 04:11:10'),
(34, 22, 73, 'ok', 'text', NULL, NULL, NULL, 0, '2026-04-11 04:11:14', '2026-04-11 04:11:14'),
(35, 73, 16, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-13 00:55:46', '2026-04-13 00:55:46'),
(36, 22, 73, 'sao vậy', 'text', NULL, NULL, NULL, 0, '2026-04-13 00:55:52', '2026-04-13 00:55:52'),
(37, 73, 16, 'hi', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:04:34', '2026-04-13 01:04:34'),
(38, 73, 16, 'hi', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:04:39', '2026-04-13 01:04:39'),
(39, 22, 73, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:04:43', '2026-04-13 01:04:43'),
(40, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:11:21', '2026-04-13 01:11:21'),
(41, 1, 73, 'hahaha', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:11:30', '2026-04-13 01:11:30'),
(42, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:11:44', '2026-04-13 01:11:44'),
(43, 73, 1, 'hahaha', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:11:47', '2026-04-13 01:11:47'),
(44, 1, 73, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:11:51', '2026-04-13 01:11:51'),
(45, 1, 73, 'dsfds', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:12:38', '2026-04-13 01:12:38'),
(46, 73, 1, 'dsafads', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:12:42', '2026-04-13 01:12:42'),
(47, 1, 73, 'hh', 'text', NULL, NULL, NULL, 0, '2026-04-13 01:13:30', '2026-04-13 01:13:30'),
(48, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-13 05:52:22', '2026-04-13 05:52:22'),
(49, 1, 73, 'sao z bes', 'text', NULL, NULL, NULL, 0, '2026-04-13 05:52:27', '2026-04-13 05:52:27'),
(50, 73, 1, 'gg', 'text', NULL, NULL, NULL, 0, '2026-04-13 05:56:26', '2026-04-13 05:56:26'),
(51, 1, 73, 'sao z', 'text', NULL, NULL, NULL, 0, '2026-04-13 05:56:34', '2026-04-13 05:56:34'),
(52, 73, 1, 'ok bé', 'text', NULL, NULL, NULL, 0, '2026-04-13 05:56:39', '2026-04-13 05:56:39'),
(56, 73, 1, 'k', 'text', NULL, NULL, NULL, 0, '2026-04-14 03:12:33', '2026-04-14 03:12:33'),
(57, 1, 73, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-14 03:12:49', '2026-04-14 03:12:49'),
(58, 73, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-04-22 23:34:47', '2026-04-22 23:34:47'),
(59, 1, 73, 'hú', 'text', NULL, NULL, NULL, 0, '2026-04-22 23:36:39', '2026-04-22 23:36:39'),
(60, 73, 1, 'dsadsa', 'text', NULL, NULL, NULL, 0, '2026-04-22 23:36:43', '2026-04-22 23:36:43'),
(61, 73, 1, '.env be', 'file', 'http://localhost:8000/storage/chat_files/qBWXhDqQ8DKyJtDF9DkdnzqWfcxNTHeRUHXNapA2.txt', '.env be', '2.06 KB', 0, '2026-04-22 23:49:24', '2026-04-22 23:49:24'),
(62, 1, 73, '🤗', 'text', NULL, NULL, NULL, 0, '2026-04-22 23:49:34', '2026-04-22 23:49:34'),
(63, 73, 1, '🙄', 'text', NULL, NULL, NULL, 0, '2026-04-23 11:53:00', '2026-04-23 11:53:00'),
(64, 73, 1, 'CHÀO BẠN, TÔI CẦN GIÚP ĐỠ', 'text', NULL, NULL, NULL, 0, '2026-04-24 23:50:28', '2026-04-24 23:50:28'),
(65, 1, 73, 'issehieu1115@gmail.com', 'text', NULL, NULL, NULL, 0, '2026-04-24 23:50:51', '2026-04-24 23:50:51'),
(66, 71, 1, 'Chào 😄', 'text', NULL, NULL, NULL, 0, '2026-05-13 09:26:48', '2026-05-13 09:26:48'),
(67, 71, 1, 'chào', 'text', NULL, NULL, NULL, 0, '2026-05-13 09:27:20', '2026-05-13 09:27:20'),
(68, 71, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-05-13 09:28:32', '2026-05-13 09:28:32'),
(69, 71, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-05-13 09:28:48', '2026-05-13 09:28:48'),
(70, 73, 1, 'hello', 'text', NULL, NULL, NULL, 0, '2026-05-13 09:31:47', '2026-05-13 09:31:47'),
(71, 70, 1, 'alo', 'text', NULL, NULL, NULL, 0, '2026-05-13 10:01:34', '2026-05-13 10:01:34'),
(72, 70, 1, '😄', 'text', NULL, NULL, NULL, 0, '2026-05-13 10:01:43', '2026-05-13 10:01:43'),
(73, 1, 70, '😄', 'text', NULL, NULL, NULL, 0, '2026-05-13 13:47:05', '2026-05-13 13:47:05');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_11_14_010848_create_sessions_table', 1),
(2, '2025_11_13_082251_create_test_table', 2),
(3, '2025_11_16_075325_create_personal_access_tokens_table', 2),
(4, '2025_11_18_140020_create_cache_table', 3),
(5, '2025_12_04_134450_create_password_reset_tokens_table', 4),
(6, '2025_12_11_150059_add_to_email_to_support_emails_table', 4),
(7, '2026_03_30_140014_create_reviews_table', 5),
(8, '2026_04_01_034805_add_refund_columns_to_orders_table', 6),
(9, '2026_04_01_083151_create_contacts_table', 7),
(10, '2026_04_09_104630_create_customer_galleries_table', 8),
(11, '2026_04_23_090714_add_order_id_to_tier_service_usages_table', 9),
(12, '2026_04_23_090716_add_tier_discount_amount_to_orders_table', 9),
(13, '2026_04_23_093900_add_yearly_discount_quota_to_membership_tiers_table', 10),
(14, '2026_05_20_064045_create_admin_attendances_table', 11),
(15, '2026_05_20_074558_create_work_shifts_tables', 12),
(16, '2026_05_20_125000_create_work_day_settings_table', 13),
(17, '2026_05_20_132056_add_is_overnight_to_work_shifts_table', 14),
(18, '2026_05_20_134137_update_work_shifts_table_add_working_days_and_soft_deletes', 15),
(19, '2026_05_20_142301_add_overtime_days_to_work_shifts_table', 16);

-- --------------------------------------------------------

--
-- Table structure for table `module_permissions`
--

CREATE TABLE `module_permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `module_code` varchar(100) NOT NULL,
  `required_level` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `module_permissions`
--

INSERT INTO `module_permissions` (`id`, `module_name`, `module_code`, `required_level`) VALUES
(1, 'Quản lý Role & Phân Quyền', 'admin_roles', 1),
(2, 'Quản lý Sản phẩm & Biến thể', 'admin_products', 2),
(4, 'Quản lý Tài khoản khách hàng', 'admin_users', 2),
(5, 'Xem thống kê cơ bản', 'admin_dashboard', 5),
(6, 'Quản lý Nhân sự', 'admin_staff', 1),
(10, 'Quản lý Danh mục', 'admin_categories', 2),
(12, 'Quản lý Thương hiệu', 'admin_brands', 2),
(13, 'Quản lý Đơn hàng', 'admin_orders', 2),
(14, 'Quản lý Mã giảm giá', 'admin_coupons', 2),
(15, 'Quản lý Banner & Quảng cáo', 'admin_banners', 2),
(16, 'Quản lý Hạng thành viên', 'admin_tiers', 2),
(17, 'Quản lý Combo sản phẩm', 'admin_combos', 2),
(18, 'Quản lý Đánh giá', 'admin_reviews', 2),
(19, 'Quản lý Kho hàng', 'admin_inventory', 2),
(20, 'admin_contacts', 'admin_contacts', 2),
(21, 'Dashboard', 'dashboard', 2),
(22, 'admin_news', 'admin_news', 2),
(23, 'admin_chat', 'admin_chat', 2),
(24, 'admin_chatbot', 'admin_chatbot', 2),
(25, 'admin_attendance', 'admin_attendance', 2);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','published','draft') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `views` int NOT NULL DEFAULT '0',
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `meta_keywords` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `slug`, `excerpt`, `content`, `image_url`, `author_name`, `category`, `status`, `views`, `meta_title`, `meta_description`, `meta_keywords`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Bí Quyết Chọn Mua Trang Sức Đá Sapphire Hoàn Hảo', 'bi-quyet-chon-mua-trang-suc-da-sapphire-hoan-hao', 'Hướng dẫn chi tiết cách chọn mua trang sức đá Sapphire sang trọng, bền đẹp và hợp phong thủy cho phái nữ.', '<p>Trang sức đá Sapphire luôn toát lên vẻ đẹp quyền quý và vô cùng sang trọng.</p><p>Màu xanh hoàng gia của Sapphire dễ dàng thu hút mọi ánh nhìn từ xung quanh.</p><p>Đây là loại đá quý mang biểu tượng cho sự chân thành và tình yêu vĩnh cửu.</p><p>Độ cứng của Sapphire rất cao, chỉ xếp ngay sau kim cương trong tự nhiên.</p><p>Vì thế, Sapphire rất phù hợp để chế tác thành những chiếc nhẫn đính hôn đắt giá.</p><p>Để chọn mua được viên Sapphire đẹp, bạn cần chú ý kỹ đến sắc xanh của nó.</p><p>Màu xanh càng đậm, đều màu và trong suốt thì viên đá càng có giá trị cao.</p><p>Bạn cũng nên xem xét cẩn thận về độ cắt giác của từng viên đá quý.</p><p>Một vết cắt đạt chuẩn sẽ giúp viên đá phản chiếu ánh sáng rực rỡ nhất.</p><p>Hãy tránh chọn những viên đá có chứa nhiều tạp chất hoặc xuất hiện vết nứt nhỏ.</p><p>Khách hàng nên yêu cầu cửa hàng cung cấp đầy đủ giấy kiểm định chất lượng đá.</p><p>Giấy kiểm định sẽ giúp bạn hoàn toàn an tâm về nguồn gốc xuất xứ của sản phẩm.</p><p>Về mặt phong thủy, đá Sapphire cực kỳ phù hợp với người mang mệnh Thủy và Mộc.</p><p>Sở hữu viên đá này sẽ mang lại rất nhiều may mắn và bình an cho chủ nhân.</p><p>Khi sử dụng, bạn hãy lưu ý tránh để Sapphire tiếp xúc trực tiếp với hóa chất mạnh.</p><p>Lời khuyên là nên tháo trang sức ra khi bạn làm việc nhà hoặc chơi thể thao.</p><p>Bạn có thể làm sạch đá bằng nước ấm và một chút dung dịch xà phòng nhẹ nhàng.</p><p>Sau đó, hãy dùng khăn thật mềm lau khô để đá luôn giữ được độ sáng bóng.</p><p>Điều quan trọng nhất là hãy đến các cửa hàng kim hoàn uy tín để mua trang sức.</p><p>SORA Jewelry luôn tự hào cung cấp các dòng trang sức đá Sapphire chất lượng cao nhất.</p><p>Chúng tôi cam kết mang đến trải nghiệm tuyệt vời cùng chế độ bảo hành trọn đời.</p>', '/storage/news/SuX9oWjPxkn4iQTXbsXVBCGAall3G3Y3Kf0NXVZX.jpg', 'Nguyễn Thị Kim Hiền', 'Bí quyết chọn trang sức', 'published', 150, 'Bí Quyết Chọn Mua Trang Sức Đá Sapphire Hoàn Hảo', 'Đá Sapphire là biểu tượng của sự sang trọng. Khám phá cách chọn mua trang sức đá quý Sapphire đẹp nhất.', 'sapphire, trang sức đá quý, nhẫn sapphire', '2026-04-08 20:56:20', '2026-04-15 14:43:56', NULL),
(2, 'Xu Hướng Trang Sức Đá Ruby Lên Ngôi Năm Nay', 'xu-huong-trang-suc-da-ruby-len-ngoi-nam-nay', 'Đá Ruby với sắc đỏ quyến rũ đang là xu hướng hàng đầu trong ngành trang sức cao cấp hiện nay.', '<p>Đá Ruby từ lâu đã được mệnh danh là ông vua của các loại đá quý.</p><p>Sắc đỏ rực rỡ của Ruby mang đến vẻ đẹp vô cùng quyến rũ và đầy quyền lực.</p><p>Xu hướng trang sức năm nay đang chứng kiến sự lên ngôi mạnh mẽ của đá Ruby thiên nhiên.</p><p>Phái đẹp cực kỳ ưa chuộng những thiết kế dây chuyền đính đá Ruby tinh xảo, bắt mắt.</p><p>Về mặt ý nghĩa, Ruby tượng trưng cho sự đam mê và một tình yêu vô cùng mãnh liệt.</p><p>Viên đá này còn được tin rằng sẽ mang lại sự giàu sang và thịnh vượng cho người đeo.</p><p>Khi chọn mua Ruby, màu đỏ huyết bồ câu được xem là màu sắc có giá trị đắt đỏ nhất.</p><p>Độ trong suốt của viên đá cũng là yếu tố quyết định trực tiếp đến giá thành sản phẩm.</p><p>Ruby tự nhiên thường sẽ có một vài tì vết nhỏ bên trong cấu trúc của viên đá.</p><p>Những viên Ruby hoàn toàn không có tì vết thường cực kỳ hiếm và giá vô cùng cao.</p><p>Để thiết kế nổi bật, Ruby thường được kết hợp hoàn hảo cùng vàng trắng hoặc kim cương.</p><p>Sự kết hợp này giúp tôn lên trọn vẹn sắc đỏ kiêu sa của viên đá quý hoàng gia.</p><p>Người mệnh Thổ và Hỏa đặc biệt thích hợp để đeo trang sức đính đá Ruby tự nhiên.</p><p>Nó đóng vai trò như một lá bùa hộ mệnh, giúp thu hút năng lượng tích cực mỗi ngày.</p><p>Bạn nên thường xuyên vệ sinh trang sức Ruby để giữ cho viên đá luôn lấp lánh rạng ngời.</p><p>Tránh để đá bị va đập mạnh với các vật cứng khác trong quá trình sinh hoạt hàng ngày.</p><p>Định kỳ mỗi sáu tháng, hãy mang trang sức đến cửa hàng để được bảo dưỡng chuyên nghiệp.</p><p>SORA Jewelry hiện đang ra mắt bộ sưu tập trang sức Ruby thiết kế độc quyền giới hạn.</p><p>Mỗi sản phẩm đều được chế tác thủ công bởi những nghệ nhân kim hoàn lành nghề nhất.</p><p>Hãy đến ngay cửa hàng của chúng tôi để tự mình chiêm ngưỡng vẻ đẹp tuyệt mỹ này.</p>', '/storage/news/vOgA29ssxAaNWbFOVFSmuvzKkgGHMkMz0btHlSau.jpg', 'Nguyễn Thị Kim Hiền', 'Xu hướng trang sức', 'published', 230, 'Xu Hướng Trang Sức Đá Ruby Lên Ngôi Năm Nay', 'Tìm hiểu lý do tại sao trang sức đá Ruby lại thu hút giới mộ điệu và trở thành xu hướng mới.', 'ruby, trang sức ruby, đá quý đỏ', '2026-04-09 11:56:33', '2026-04-15 15:24:22', NULL),
(4, 'Mẹo Nhận Biết Trang Sức Kim Cương Tự Nhiên Chuẩn Xác', 'meo-nhan-biet-trang-suc-kim-cuong-tu-nhien-chuan-xac', 'Làm thế nào để phân biệt kim cương tự nhiên và nhân tạo? Bỏ túi ngay những mẹo kiểm tra cực chuẩn.', '<p>Kim cương luôn giữ vững vị trí độc tôn trong thế giới trang sức xa xỉ cao cấp.</p><p>Sự lấp lánh vĩnh cửu của kim cương là khao khát của mọi tín đồ đam mê cái đẹp.</p><p>Việc phân biệt kim cương tự nhiên và nhân tạo là điều cực kỳ quan trọng khi mua sắm.</p><p>Mẹo đầu tiên là kiểm tra độ phản xạ ánh sáng của viên đá dưới ánh nắng mặt trời.</p><p>Kim cương thật thường lấp lánh ánh sáng xám trắng xen lẫn những dải màu sắc cầu vồng nhẹ.</p><p>Bạn có thể thử hà hơi trực tiếp lên bề mặt của viên kim cương để kiểm tra nhanh.</p><p>Kim cương thật tản nhiệt rất nhanh nên lớp sương mờ sẽ biến mất gần như ngay lập tức.</p><p>Một cách khác là đọc chữ qua viên kim cương nếu nó chưa được đính lên vỏ trang sức.</p><p>Vì cấu trúc phức tạp, bạn sẽ không thể nhìn rõ chữ xuyên qua một viên kim cương thật.</p><p>Kiểm tra độ cứng cũng là một cách hay, kim cương có thể làm xước mặt kính dễ dàng.</p><p>Tuy nhiên, cách an toàn và chính xác tuyệt đối nhất vẫn là kiểm tra qua máy thử chuyên dụng.</p><p>Mọi viên kim cương tự nhiên đạt chuẩn đều đi kèm với giấy chứng nhận quốc tế GIA uy tín.</p><p>Khách hàng tuyệt đối không nên mua những sản phẩm kim cương giá trị cao mà thiếu giấy tờ.</p><p>Giấy GIA thể hiện rõ bốn yếu tố quan trọng: trọng lượng, màu sắc, độ tinh khiết và nét cắt.</p><p>Trang sức kim cương rất dễ bám dầu mỡ từ da tay nên cần được vệ sinh thường xuyên.</p><p>Nên ngâm trang sức vào nước xà phòng pha loãng và dùng cọ mềm chải nhẹ nhàng các kẽ đá.</p><p>Tuyệt đối tránh sử dụng các dung dịch tẩy rửa mạnh chứa clo để bảo vệ vỏ nhẫn vàng.</p><p>SORA Jewelry cam kết phân phối kim cương tự nhiên hoàn toàn hợp pháp và có nguồn gốc rõ ràng.</p><p>Các thiết kế nhẫn kim cương tại cửa hàng luôn dẫn đầu xu hướng trang sức hiện đại.</p><p>Trải nghiệm ngay dịch vụ mua sắm trang sức thượng lưu cùng SORA với nhiều ưu đãi đặc quyền.</p>', NULL, 'Nguyễn Thị Kim Hiền', 'Bí quyết chọn trang sức', 'published', 86, 'Mẹo Nhận Biết Trang Sức Kim Cương Tự Nhiên', 'Hướng dẫn những cách đơn giản nhất để phân biệt kim cương tự nhiên và nhân tạo cho người mới.', 'kim cương, nhận biết kim cương, trang sức', '2026-04-15 14:38:27', '2026-05-18 19:30:01', NULL),
(5, 'Trang Sức Ngọc Trai: Vẻ Đẹp Vượt Thời Gian', 'trang-suc-ngoc-trai-ve-dep-vuot-thoi-gian', 'Ngọc trai mang đến sự thanh lịch, quý phái. Tìm hiểu cách phối đồ với trang sức ngọc trai hoàn hảo.', '<p>Ngọc trai luôn được xem là món quà vô giá và đầy bí ẩn từ sâu thẳm đại dương.</p><p>Khác với đá quý, ngọc trai là loại ngọc duy nhất được tạo ra từ một sinh vật sống.</p><p>Vẻ đẹp thuần khiết của ngọc trai mang đến sự thanh lịch và sang trọng cho người phụ nữ.</p><p>Trang sức ngọc trai không bao giờ lỗi mốt và phù hợp với mọi độ tuổi khác nhau.</p><p>Một chuỗi vòng cổ ngọc trai có thể phối hoàn hảo cùng những bộ váy dạ hội quyến rũ.</p><p>Hoặc bạn có thể dùng hoa tai ngọc trai điểm xuyết cho trang phục công sở thanh lịch hàng ngày.</p><p>Chất lượng của ngọc trai được đánh giá qua độ bóng, độ tròn, kích thước và màu sắc tự nhiên.</p><p>Ngọc trai ánh hồng, ánh vàng hoặc ngọc trai đen Tahiti thường có giá trị cực kỳ đắt đỏ.</p><p>Ngọc trai thật sẽ có cảm giác mát lạnh và hơi nhám khi cọ xát nhẹ vào răng của bạn.</p><p>Độ bóng mượt của ngọc tự nhiên rất có chiều sâu, phản chiếu ánh sáng mềm mại tinh tế.</p><p>Vì có nguồn gốc hữu cơ, ngọc trai đòi hỏi quy trình bảo quản tỉ mỉ và cẩn thận hơn.</p><p>Kẻ thù lớn nhất của bề mặt ngọc trai chính là nước hoa, keo xịt tóc và mỹ phẩm.</p><p>Nguyên tắc vàng là hãy đeo trang sức ngọc trai vào cuối cùng sau khi đã trang điểm xong.</p><p>Và luôn nhớ tháo ngọc trai ra đầu tiên trước khi bắt đầu quy trình tẩy trang buổi tối.</p><p>Tuyệt đối không ngâm ngọc trai trong nước vì sẽ làm mục sợi dây xâu vòng bên trong.</p><p>Sau mỗi lần đeo, hãy dùng một chiếc khăn ẩm thật mềm lau nhẹ nhàng bề mặt viên ngọc.</p><p>Cất giữ ngọc trai trong hộp lót nhung mềm, để riêng biệt, không chạm vào các loại đá quý cứng.</p><p>SORA Jewelry chuyên cung cấp các dòng ngọc trai nuôi cấy nước mặn và nước ngọt chất lượng cao.</p><p>Từng viên ngọc đều được tuyển chọn kỹ lưỡng, đảm bảo độ bóng hoàn hảo và không tì vết.</p><p>Khám phá ngay bộ sưu tập đại dương đang trưng bày tại showroom của chúng tôi.</p>', NULL, 'Nguyễn Thị Kim Hiền', 'Phối đồ trang sức', 'published', 95, 'Trang Sức Ngọc Trai: Vẻ Đẹp Vượt Thời Gian', 'Bí quyết diện trang sức ngọc trai giúp tôn lên vẻ đẹp thanh lịch và kiêu sa của người phụ nữ.', 'ngọc trai, trang sức ngọc trai, phối đồ', '2026-04-15 14:49:29', '2026-04-15 14:49:29', NULL),
(6, 'Khám Phá Sức Hút Của Trang Sức Ngọc Lục Bảo Emerald', 'kham-pha-suc-hut-cua-trang-suc-ngoc-luc-bao-emerald', 'Ngọc Lục Bảo Emerald mang vẻ đẹp bí ẩn và sang trọng. Xem ngay bộ sưu tập mới nhất từ SORA.', '<p>Ngọc Lục Bảo, hay còn gọi là Emerald, là một trong tứ đại đá quý hiếm nhất hành tinh.</p><p>Sắc xanh lục rực rỡ đặc trưng của Emerald khiến bất kỳ ai cũng phải đắm say ngắm nhìn.</p><p>Vẻ đẹp của Ngọc Lục Bảo gắn liền với lịch sử lâu đời của giới hoàng gia và quý tộc.</p><p>Nữ hoàng Cleopatra của Ai Cập cổ đại được cho là có niềm đam mê mãnh liệt với viên đá này.</p><p>Màu xanh của Emerald tượng trưng cho sự sinh sôi nảy nở, hy vọng và sự tươi mới mùa xuân.</p><p>Về mặt phong thủy, viên đá này đặc biệt mang lại may mắn lớn cho người mệnh Mộc và Hỏa.</p><p>Nó giúp chủ nhân xua tan căng thẳng, cân bằng cảm xúc và mang lại sự bình yên nội tâm.</p><p>Hầu hết Ngọc Lục Bảo tự nhiên đều chứa các bao thể, thường được gọi là khu vườn nhỏ.</p><p>Những bao thể này chính là minh chứng rõ nét nhất cho nguồn gốc tự nhiên của viên đá quý.</p><p>Rất hiếm khi tìm thấy một viên Emerald hoàn toàn trong suốt mà không có bất kỳ tì vết nào.</p><p>Viên đá càng trong, màu xanh càng đậm thì giá trị trên thị trường trang sức càng đắt đỏ.</p><p>Độ cứng của Emerald nằm ở mức khá, tuy nhiên nó lại dễ giòn và nứt nếu bị va đập.</p><p>Do đó, kỹ thuật chế tác Emerald đòi hỏi người thợ kim hoàn phải có tay nghề cực kỳ cao.</p><p>Cắt giác Emerald là kiểu mài chữ nhật xếp tầng giúp bảo vệ viên đá tối đa nhất.</p><p>Khi vệ sinh trang sức đính Ngọc Lục Bảo, bạn tuyệt đối không được dùng sóng siêu âm hoặc hơi nước.</p><p>Chỉ nên lau nhẹ nhàng viên đá bằng khăn mềm kết hợp với một chút xà phòng pha cực loãng.</p><p>Tránh để viên đá tiếp xúc trực tiếp với nhiệt độ cao hoặc sự thay đổi nhiệt độ quá đột ngột.</p><p>Tại SORA Jewelry, những thiết kế dây chuyền và nhẫn đính Emerald luôn là mặt hàng được săn đón nhất.</p><p>Mỗi sản phẩm là một tuyệt tác nghệ thuật tôn vinh vẻ đẹp kiêu sa và quyền quý của phái đẹp.</p><p>Quý khách hãy ghé thăm cửa hàng SORA để lựa chọn ngay món trang sức cao cấp ưng ý nhất.</p>', NULL, 'Nguyễn Thị Kim Hiền', 'Kiến thức đá quý', 'published', 112, 'Khám Phá Sức Hút Của Trang Sức Ngọc Lục Bảo', 'Tại sao Ngọc Lục Bảo lại được giới quý tộc yêu thích? Tìm hiểu ý nghĩa và giá trị của Emerald.', 'ngọc lục bảo, emerald, trang sức cao cấp', '2026-04-15 15:33:41', '2026-04-23 10:39:19', NULL),
(7, 'Ý Nghĩa Phong Thủy Của Dây Chuyền Thạch Anh Tím', 'y-nghia-phong-thuy-cua-day-chuyen-thach-anh-tim', 'Đá Thạch Anh Tím (Amethyst) không chỉ đẹp mà còn có tác dụng an thần, mang lại may mắn tài lộc.', '<p>Đá Thạch Anh Tím, hay Amethyst, nổi bật bởi sắc tím huyền bí, từ nhạt đến đậm quyến rũ.</p><p>Trong lịch sử, loại đá này từng có giá trị ngang ngửa với cả Ruby hay Sapphire quyền lực.</p><p>Ngày nay, Thạch Anh Tím trở nên phổ biến hơn nhưng vẫn giữ nguyên được vẻ đẹp và sức hút.</p><p>Trang sức chế tác từ Thạch Anh Tím mang đậm phong cách cổ điển xen lẫn nét tinh tế hiện đại.</p><p>Đeo một mặt dây chuyền Thạch Anh Tím giúp tôn lên vùng cổ thon gọn và làn da sáng.</p><p>Về ý nghĩa phong thủy, Amethyst được coi là viên đá của sự thông thái và trí tuệ minh mẫn.</p><p>Năng lượng từ đá giúp thanh lọc tâm trí, giảm căng thẳng và đem lại giấc ngủ cực kỳ ngon.</p><p>Nhiều người tin rằng đặt viên đá này dưới gối sẽ giúp ngăn ngừa hoàn toàn những cơn ác mộng.</p><p>Thạch Anh Tím cực kỳ tương sinh với những người mang bản mệnh Hỏa và mệnh Thổ trong phong thủy.</p><p>Khi chọn mua Thạch Anh Tím, bạn nên quan sát kỹ độ trong suốt và sự đồng đều của màu sắc.</p><p>Viên đá có màu tím đậm, phớt chút ánh đỏ hoặc ánh xanh luôn được định giá cao nhất thị trường.</p><p>Đá tự nhiên dưới ánh sáng mặt trời sẽ toát lên vẻ lấp lánh vô cùng tự nhiên và sống động.</p><p>Khác với đá nhân tạo nhuộm màu, Thạch Anh Tím thật có thể cảm nhận độ mát lạnh khi chạm vào.</p><p>Với độ cứng cao, Thạch Anh Tím khá bền và thích hợp để đeo liên tục hàng ngày.</p><p>Dù vậy, bạn vẫn nên cẩn thận không để bề mặt đá bị trầy xước bởi các kim loại cứng hơn.</p><p>Đặc biệt, không phơi viên đá dưới ánh nắng mặt trời gắt quá lâu vì màu tím có thể bị phai.</p><p>Chỉ cần rửa qua nước sạch và lau bằng vải mềm là đủ để trang sức luôn sạch sẽ, sáng bóng.</p><p>SORA Jewelry mang đến rất nhiều mẫu vòng tay và bông tai Thạch Anh Tím tinh xảo cho mùa lễ hội.</p><p>Đây chắc chắn sẽ là món quà tuyệt vời đầy ý nghĩa dành tặng cho người thân yêu của bạn.</p><p>Theo dõi website của chúng tôi để không bỏ lỡ các ưu đãi trang sức phong thủy siêu hấp dẫn.</p>', '/storage/news/8gcSlxKEp6ZeIAOopQ6TBJXfekdRBCtsjBxNAVj8.jpg', 'Nguyễn Thị Kim Hiền', 'Phong thủy', 'published', 321, 'Ý Nghĩa Phong Thủy Của Dây Chuyền Thạch Anh Tím', 'Tác dụng bất ngờ của Thạch Anh Tím trong phong thủy và sức khỏe mà bạn chưa từng biết.', 'thạch anh tím, amethyst, trang sức phong thủy', '2026-04-15 15:33:51', '2026-04-24 05:48:15', NULL),
(8, 'Cách Bảo Quản Vòng Cẩm Thạch Luôn Sáng Bóng Lâu Dài', 'cach-bao-quan-vong-cam-thach-luon-sang-bong-lau-dai', 'Bạn đã biết cách chăm sóc vòng Cẩm Thạch để đá lên nước và sáng bóng theo thời gian chưa?', '<p>Vòng tay đá Cẩm Thạch từ xa xưa đã là biểu tượng của nét đẹp Á Đông truyền thống.</p><p>Khác với sự lấp lánh của kim cương, Cẩm Thạch mang vẻ đẹp dịu dàng, đằm thắm và thanh tao.</p><p>Người xưa tin rằng ngọc dưỡng người, người dưỡng ngọc, đeo càng lâu ngọc càng sáng và lên nước đẹp.</p><p>Năng lượng của đá Cẩm Thạch giúp điều hòa khí huyết, mang lại sức khỏe và tuổi thọ viên mãn.</p><p>Viên ngọc xanh này còn được coi là lá bùa hộ mệnh bảo vệ chủ nhân khỏi những rủi ro.</p><p>Để ngọc luôn sáng bóng, việc bảo quản trang sức đúng cách là yếu tố vô cùng quan trọng.</p><p>Điều cấm kỵ nhất là để vòng Cẩm Thạch tiếp xúc với các loại hóa chất tẩy rửa mạnh trong nhà.</p><p>Hóa chất sẽ ăn mòn lớp bảo vệ tự nhiên, làm đá bị mờ đục và mất đi độ bóng nguyên bản.</p><p>Khi tắm, giặt quần áo hay rửa bát, bạn nên cẩn thận tháo vòng tay ngọc ra để bảo quản.</p><p>Cơ thể con người tiết ra dầu tự nhiên, đây chính là lớp dưỡng chất tốt nhất cho ngọc Cẩm Thạch.</p><p>Vì thế, cách dưỡng ngọc tốt nhất không phải là cất giữ trong hộp kín mà là thường xuyên đeo chúng.</p><p>Nếu ngọc bị bám bụi bẩn, hãy ngâm vào nước ấm khoảng mười phút rồi dùng khăn cotton mềm lau sạch.</p><p>Tuyệt đối không dùng bàn chải lông cứng vì sẽ tạo ra các vết xước dăm trên bề mặt vòng ngọc.</p><p>Rất nhiều người nhầm lẫn giữa Cẩm Thạch tự nhiên và ngọc đã qua xử lý hóa chất độc hại.</p><p>Ngọc xử lý thường có màu sắc rực rỡ bất thường nhưng sẽ nhanh chóng xỉn màu chỉ sau vài tháng.</p><p>Để tránh mua phải hàng giả, hãy luôn yêu cầu giấy kiểm định chất lượng từ các trung tâm uy tín.</p><p>Cẩm Thạch tự nhiên khi gõ nhẹ vào nhau sẽ phát ra âm thanh thanh thúy, ngân vang cực kỳ êm tai.</p><p>SORA Jewelry tự hào mang đến bộ sưu tập vòng ngọc Cẩm Thạch tự nhiên chưa qua xử lý hóa học.</p><p>Mỗi chiếc vòng là một tác phẩm nguyên khối mang đậm nét đẹp độc bản do thiên nhiên ban tặng.</p><p>Đến với SORA, khách hàng hoàn toàn yên tâm về chất lượng cùng chế độ hậu mãi cực kỳ tận tâm.</p>', '/storage/news/c9ZjosihLYjvfkT3bxGf3VowQ8CJtvYSeRYscU2p.webp', 'Nguyễn Thị Kim Hiền', 'Bảo quản trang sức', 'published', 178, 'Cách Bảo Quản Vòng Cẩm Thạch Luôn Sáng Bóng', 'Mẹo vệ sinh và bảo quản trang sức Cẩm Thạch để đá luôn giữ được màu sắc tự nhiên đẹp nhất.', 'cẩm thạch, bảo quản trang sức, vòng ngọc', '2026-04-15 15:33:58', '2026-04-23 10:28:57', NULL),
(9, 'Trang Sức Đá Topaz Xanh: Lựa Chọn Mát Mẻ Cho Mùa Hè', 'trang-suc-da-topaz-xanh-lua-chon-mat-me-cho-mua-he', 'Topaz xanh dương mang lại cảm giác tươi mát, trẻ trung. Gợi ý trang sức đá Topaz nổi bật mùa hè này.', '<p>Đá Topaz xanh dương mang trong mình sắc màu tươi mát, gợi nhớ đến những bãi biển nhiệt đới lộng gió.</p><p>Đây là một trong những loại đá quý được săn đón nồng nhiệt nhất mỗi khi mùa hè sôi động gõ cửa.</p><p>Sắc xanh lấp lánh của Topaz dễ dàng kết hợp hoàn hảo với những trang phục có tông màu trắng hoặc pastel.</p><p>Bông tai hay nhẫn đính đá Topaz sẽ là điểm nhấn rực rỡ, giúp phái đẹp thêm phần trẻ trung, năng động.</p><p>Về mặt ý nghĩa, Topaz xanh biểu tượng cho sự an bình, niềm vui và sự lạc quan yêu đời vô bờ bến.</p><p>Năng lượng từ viên đá này giúp làm dịu tâm trí, xua tan những cảm xúc tiêu cực và muộn phiền.</p><p>Người Hy Lạp cổ đại từng tin rằng Topaz có sức mạnh giúp người đeo trở nên vô hình trước nguy hiểm.</p><p>Trong phong thủy phương Đông, Topaz xanh cực kỳ tương sinh với những người mang mệnh Thủy và mệnh Mộc.</p><p>Đá Topaz có độ cứng cao đạt mức tốt, rất thích hợp để chế tác thành trang sức đeo hàng ngày.</p><p>Độ bền bỉ này giúp bề mặt viên đá ít bị trầy xước bởi các tác động vật lý thông thường.</p><p>Tuy nhiên, cấu trúc tinh thể của Topaz có các mặt trượt nên viên đá dễ bị nứt nếu chịu lực gõ mạnh.</p><p>Do đó, khi làm việc nặng, bạn vẫn nên cẩn thận tháo nhẫn đính đá Topaz cất vào trong hộp bảo quản.</p><p>Vệ sinh Topaz cực kỳ đơn giản, chỉ cần dùng nước ấm pha chút xà phòng nhẹ rồi dùng khăn mềm lau khô.</p><p>Tránh để viên đá bị tác động bởi sự thay đổi nhiệt độ đột ngột vì có thể làm phai màu sắc tự nhiên.</p><p>Màu xanh của Topaz trên thị trường thường được chia thành các cấp độ từ nhạt đến đậm sâu thẳm.</p><p>Topaz xanh đậm mang vẻ đẹp huyền bí, sang trọng và có mức giá nhỉnh hơn so với các loại khác.</p><p>Khi chọn mua trang sức, hãy để ý đến độ cắt giác tinh xảo giúp viên Topaz phát huy tối đa độ rực rỡ.</p><p>Bộ sưu tập biển cả của SORA Jewelry chính thức ra mắt với hàng loạt thiết kế Topaz xanh vô cùng bắt mắt.</p><p>Chất liệu bạc Ý cao cấp và vàng trắng được sử dụng để làm nền bệ phóng hoàn hảo cho viên đá.</p><p>Hãy làm mới phong cách thời trang mùa hè của bạn bằng những món trang sức Topaz tuyệt đẹp từ nhà SORA.</p>', '/storage/news/68wfc878O00dX7l3KPEAPpCQrZCwq9MsV6P5cBBs.webp', 'Nguyễn Thị Kim Hiền', 'Xu hướng trang sức', 'published', 88, 'Trang Sức Đá Topaz Xanh: Lựa Chọn Mát Mẻ', 'Topaz xanh - Viên đá quý hoàn hảo cho bộ trang sức mùa hè của những cô nàng năng động.', 'đá topaz, trang sức mùa hè, topaz xanh', '2026-04-15 15:34:05', '2026-04-23 10:07:39', NULL),
(10, 'Đá Aquamarine Và Những Thiết Kế Mặt Dây Chuyền Ấn Tượng', 'da-aquamarine-va-nhung-thiet-ke-mat-day-chuyen-an-tuong', 'Khám phá sự thanh khiết của đá Aquamarine qua các mẫu mặt dây chuyền tinh xảo từ thương hiệu SORA Jewelry.', '<p>Aquamarine, hay Ngọc Xanh Biển, là viên đá quý lấp lánh mang hơi thở thuần khiết của đại dương bao la.</p><p>Cái tên Aquamarine bắt nguồn từ tiếng Latinh, có nghĩa là nước biển, phản ánh đúng màu sắc tuyệt đẹp của nó.</p><p>Từ màu xanh nhạt trong vắt cho đến sắc xanh lục lam quyến rũ, viên đá này luôn tỏa ra sức hút khó cưỡng.</p><p>Truyền thuyết kể rằng Aquamarine là báu vật của các nàng tiên cá, giúp bảo vệ thủy thủ vượt qua sóng gió.</p><p>Ngày nay, đây là viên đá biểu tượng cho lòng dũng cảm, sự thanh bình và mang lại hạnh phúc viên mãn.</p><p>Trang sức đính đá Aquamarine là món quà sinh nhật vô cùng hoàn hảo dành cho những người sinh vào tháng Ba.</p><p>Trong thiết kế kim hoàn, Aquamarine thường được chế tác thành những mặt dây chuyền bản lớn vô cùng ấn tượng.</p><p>Kích thước tinh thể Aquamarine tự nhiên khá lớn, cho phép các nghệ nhân thỏa sức sáng tạo với những nhát cắt phức tạp.</p><p>Kiểu cắt giọt nước hoặc cắt giác ngọc lục bảo là những kiểu dáng giúp tôn vinh trọn vẹn vẻ đẹp của viên đá.</p><p>Mặt dây chuyền Aquamarine phối cùng dây chuyền vàng trắng tạo nên vẻ đẹp sang trọng, thanh lịch cho các quý cô.</p><p>Khi lựa chọn Aquamarine, độ trong suốt là một tiêu chí cực kỳ quan trọng để đánh giá chất lượng viên đá.</p><p>Những viên đá cao cấp thường không có tì vết khi nhìn bằng mắt thường và phản chiếu ánh sáng lấp lánh rực rỡ.</p><p>Về phong thủy, màu xanh của Aquamarine đại diện cho mệnh Thủy, mang đến nguồn năng lượng tĩnh lặng và sự hài hòa.</p><p>Đeo trang sức Aquamarine giúp cải thiện kỹ năng giao tiếp, giúp người đeo tự tin bộc lộ suy nghĩ của bản thân.</p><p>Độ cứng của Aquamarine thuộc nhóm đá quý có khả năng chống trầy xước khá tốt trong quá trình sử dụng.</p><p>Việc bảo quản cũng rất dễ dàng, bạn chỉ cần giữ đá tránh xa các nguồn nhiệt độ quá cao gây hại.</p><p>Làm sạch mặt dây chuyền bằng bàn chải lông mềm và nước xà phòng ấm sẽ giúp đá luôn giữ được độ sáng.</p><p>SORA Jewelry tự hào mang đến cho khách hàng những viên Aquamarine được khai thác trực tiếp với chất lượng cực phẩm.</p><p>Mỗi thiết kế mặt dây chuyền đều được chăm chút tỉ mỉ, làm tôn lên nét đẹp đài các, kiêu sa của phái nữ.</p><p>Tham khảo ngay gian hàng trực tuyến của SORA để sở hữu món trang sức mang ý nghĩa may mắn tuyệt vời này.</p>', '/storage/news/6hQlGvcN23zuniruSYSTH10wzmtZ5PNShJEKk2Gw.png', 'Nguyễn Thị Kim Hiền', 'Bộ sưu tập', 'published', 107, 'Đá Aquamarine Và Thiết Kế Mặt Dây Chuyền Ấn Tượng', 'Bộ sưu tập trang sức Aquamarine cao cấp với thiết kế hiện đại, tinh tế dành cho phái đẹp.', 'aquamarine, mặt dây chuyền, trang sức sora', '2026-04-15 15:34:12', '2026-05-12 08:57:10', NULL),
(11, 'Tại Sao Nên Chọn Nhẫn Đính Hôn Bằng Đá Garnet Đỏ?', 'tai-sao-nen-chon-nhan-dinh-hon-bang-da-garnet-do', 'Đá Garnet đỏ rực rỡ tượng trưng cho tình yêu mãnh liệt, là lựa chọn nhẫn đính hôn độc đáo, ý nghĩa.', '<p>Garnet, hay còn được gọi là Ngọc Hồng Lựu, là một trong những loại đá quý có lịch sử lâu đời nhất.</p><p>Sắc đỏ rực rỡ đầy nồng nhiệt của Garnet luôn gợi lên cảm giác về sự ấm áp và đam mê cháy bỏng.</p><p>Rất nhiều người đang chọn nhẫn đính hôn đính đá Garnet thay vì kim cương truyền thống để tạo sự độc đáo phá cách.</p><p>Màu đỏ máu rực của Garnet tượng trưng cho một tình yêu mãnh liệt, thủy chung và không bao giờ phai nhạt.</p><p>Tặng nhẫn Garnet trong ngày đính hôn chính là lời thề nguyện gắn kết bền chặt, mãi mãi không chia lìa.</p><p>Đặc biệt, viên đá này còn được tin là có khả năng thắp lại ngọn lửa tình yêu đang nguội lạnh trong hôn nhân.</p><p>Về giá trị, Garnet sở hữu mức giá dễ tiếp cận hơn rất nhiều so với Ruby, nhưng vẻ đẹp lại không hề thua kém.</p><p>Garnet có độ chiết suất ánh sáng cao, nên dưới ánh đèn, viên đá lấp lánh sắc đỏ vô cùng rực rỡ và lôi cuốn.</p><p>Ngoài màu đỏ, thế giới Garnet còn ẩn chứa các biến thể màu xanh lục quý hiếm được săn đón vô cùng mạnh mẽ.</p><p>Tuy nhiên, sắc đỏ sậm vẫn là gam màu được ưa chuộng và sử dụng nhiều nhất trong các thiết kế trang sức cưới.</p><p>Khi mua nhẫn đính đá Garnet, bạn nên chọn những vỏ nhẫn làm từ chất liệu vàng hồng hoặc vàng nguyên bản tinh khiết.</p><p>Sự kết hợp này mang đậm nét đẹp cổ điển hoàng gia, làm nổi bật viên đá trung tâm một cách tinh tế nhất.</p><p>Đá Garnet đạt độ cứng tiêu chuẩn, hoàn toàn đáp ứng tốt cho nhu cầu đeo trang sức hàng ngày của phái đẹp.</p><p>Để viên đá luôn bền đẹp, bạn không nên để nhẫn tiếp xúc với sự thay đổi nhiệt độ quá đột ngột trong môi trường.</p><p>Việc vệ sinh nhẫn cực kỳ đơn giản, chỉ cần dùng nước ấm pha xà phòng dịu nhẹ và lau bằng vải cotton mềm mại.</p><p>Garnet không bao giờ qua xử lý tăng cường màu sắc, vẻ đẹp bạn thấy là hoàn toàn tự nhiên chân thực nhất.</p><p>Trong phong thủy, Ngọc Hồng Lựu mang năng lượng tích cực mạnh mẽ, thu hút sự may mắn và tài lộc rủng rỉnh.</p><p>Những cô gái mệnh Hỏa và mệnh Thổ vô cùng thích hợp để sở hữu cho mình một chiếc nhẫn đính hôn đá Garnet.</p><p>SORA Jewelry cung cấp dịch vụ thiết kế nhẫn đính hôn Garnet theo yêu cầu, khắc tên và ngày kỷ niệm ý nghĩa riêng.</p><p>Hãy để chiếc nhẫn Garnet rực rỡ của SORA làm chứng nhân cho tình yêu vĩnh cửu và rạng ngời của hai bạn.</p>', '/storage/news/ZTUe9aiPAReXOKejnc57zPcyJwK2XLXrzt62yTbC.jpg', 'Nguyễn Thị Kim Hiền', 'Trang sức cưới', 'published', 217, 'Tại Sao Nên Chọn Nhẫn Đính Hôn Bằng Đá Garnet Đỏ?', 'Garnet đỏ rực - Lựa chọn tuyệt vời cho chiếc nhẫn đính hôn mang biểu tượng tình yêu nồng cháy.', 'đá garnet, nhẫn đính hôn, trang sức cưới', '2026-04-15 15:34:24', '2026-05-18 21:06:13', NULL),
(12, 'Trang Sức Bạc Đính Đá CZ Lấp Lánh Cuốn Hút', 'trang-suc-bac-dinh-da-cz-lap-lanh-cuon-hut', 'Đá Cubic Zirconia lấp lánh như kim cương kết hợp cùng bạc Ý mang đến vẻ đẹp hiện đại, sang trọng.', '<p>Bên cạnh các loại đá quý đắt tiền, đá Cubic Zirconia là lựa chọn cực kỳ phổ biến trong ngành trang sức.</p><p>Đá CZ sở hữu độ lấp lánh và độ trong suốt hoàn hảo, được chế tác mô phỏng theo cấu trúc kim cương.</p><p>Dù là đá nhân tạo, CZ vẫn mang lại vẻ đẹp vô cùng sang trọng và cuốn hút cho người sử dụng.</p><p>Mức giá của trang sức đính đá CZ rất phải chăng, phù hợp với nhiều đối tượng khách hàng trẻ tuổi.</p><p>Khi được đính trên nền chất liệu bạc Ý cao cấp, những viên đá CZ càng trở nên nổi bật và tỏa sáng.</p><p>Bạc Ý có độ sáng bóng tuyệt vời, không chứa niken nên tuyệt đối an toàn và không gây kích ứng da người đeo.</p><p>Một bộ trang sức bạc đính đá lấp lánh sẽ là phụ kiện hoàn hảo cho những buổi tiệc tối lãng mạn lôi cuốn.</p><p>Bạn có thể dễ dàng thay đổi nhiều kiểu dáng trang sức CZ khác nhau mà không lo tốn quá nhiều chi phí tốn kém.</p><p>Để giữ cho trang sức luôn sáng, hãy thỉnh thoảng dùng dung dịch làm sáng bạc chuyên dụng để đánh bóng định kỳ.</p><p>Hạn chế đeo trang sức bạc khi tắm biển hoặc bơi ở hồ bơi có chứa nhiều clo tẩy rửa cực kỳ mạnh.</p><p>Nếu đá CZ bị mờ đi do bám mồ hôi, chỉ cần dùng bàn chải đánh răng mềm cọ nhẹ là đá lại sáng bừng.</p><p>SORA Jewelry liên tục cập nhật những bộ sưu tập bạc xi bạch kim đính đá cao cấp chuẩn chất lượng quốc tế.</p><p>Thiết kế trẻ trung, bắt kịp xu hướng thời trang thế giới chắc chắn sẽ làm hài lòng những vị khách khó tính nhất.</p><p>Hãy tặng món trang sức nhỏ xinh này cho bạn bè hoặc tự thưởng cho chính mình sau những ngày làm việc chăm chỉ.</p><p>Khách hàng mua sắm tại SORA luôn được hưởng chính sách đánh bóng và làm mới trang sức bạc hoàn toàn miễn phí trọn đời.</p>', '/storage/news/gkxK5potknDYeynBE7sw9WAjUQ5MFqsF2IUYmTuK.webp', 'Nguyễn Thị Kim Hiền', 'Xu hướng trang sức', 'published', 143, 'Trang Sức Bạc Đính Đá CZ Lấp Lánh Cuốn Hút', 'Tìm hiểu vẻ đẹp hiện đại của trang sức bạc đính đá Cubic Zirconia với mức giá siêu hợp lý.', 'đá cz, cubic zirconia, trang sức bạc', '2026-04-15 15:34:36', '2026-05-19 06:54:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã đơn hàng (VD: ORD-20260319-XYZ)',
  `user_id` bigint DEFAULT NULL COMMENT 'ID Khách hàng (NULL nếu cho phép mua Guest)',
  `customer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú của khách hàng',
  `sub_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tier_discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `refund_amount` decimal(15,2) DEFAULT NULL,
  `refund_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `coupon_id` bigint UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cod','vnpay','momo','bank_transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `payment_status` enum('unpaid','paid','refunded','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `status` enum('pending','confirmed','processing','shipping','delivered','cancelled','returned','return_requested') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `affiliate_id` bigint DEFAULT NULL COMMENT 'ID của user giới thiệu đơn này',
  `commission_amount` decimal(15,2) DEFAULT '0.00' COMMENT 'Số tiền hoa hồng phát sinh từ đơn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `user_id`, `customer_name`, `customer_phone`, `customer_email`, `customer_address`, `order_note`, `sub_total`, `discount_amount`, `tier_discount_amount`, `shipping_fee`, `total_amount`, `refund_amount`, `refund_note`, `coupon_id`, `coupon_code`, `payment_method`, `payment_status`, `status`, `created_at`, `updated_at`, `deleted_at`, `affiliate_id`, `commission_amount`) VALUES
(1, 'ORD-20260319-001', 69, 'Test11', '0345678910', NULL, '2, Xã Lý Văn Lâm, Thành phố Cà Mau, Tỉnh Cà Mau', 'Giao trong giờ hành chính giúp mình', 100000.00, 0.00, 0.00, 30000.00, 130000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-17 01:30:00', '2026-03-19 09:41:24', NULL, NULL, 0.00),
(2, 'ORD-20260319-002', 69, 'Test11', '0345678910', NULL, '2, Xã Lý Văn Lâm, Thành phố Cà Mau, Tỉnh Cà Mau', 'Gọi trước khi giao', 300000.00, 0.00, 0.00, 0.00, 300000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-03-19 02:15:00', '2026-03-19 09:17:23', NULL, NULL, 0.00),
(3, 'ORD-20260319-003', 69, 'Test11', '0345678910', NULL, '2, Xã Lý Văn Lâm, Thành phố Cà Mau, Tỉnh Cà Mau', 'Nhẫn bị xước, yêu cầu hoàn tiền', 100000.00, 0.00, 0.00, 0.00, 100000.00, 100000.00, 'SORA rất tiếc không thể chấp nhận yêu cầu hoàn tiền do sản phẩm không đáp ứng đủ điều kiện đổi trả ban đầu.', NULL, NULL, 'momo', 'paid', 'cancelled', '2026-03-10 03:00:00', '2026-04-11 01:26:24', NULL, NULL, 0.00),
(8, 'SORANKMU3WXI', 69, 'Nguyễn Văn A', '0345678910', 'hieuv12321@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 54250000.00, 0.00, 0.00, 0.00, 54250000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 06:28:39', '2026-03-26 06:28:39', NULL, NULL, 0.00),
(9, 'SORAJJLN4BBO', 69, 'Nguyễn Văn A', '0345678910', 'hieuv12321@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 48250000.00, 0.00, 0.00, 0.00, 48250000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 06:30:56', '2026-03-26 06:30:56', NULL, NULL, 0.00),
(10, 'SORADWJAO4WC', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 15000000.00, 0.00, 0.00, 0.00, 15000000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 06:44:55', '2026-03-26 06:44:55', NULL, NULL, 0.00),
(11, 'SORA6MVROF1Y', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 6000000.00, 0.00, 0.00, 0.00, 6000000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 06:52:20', '2026-03-26 06:52:20', NULL, NULL, 0.00),
(12, 'SORA0175EJPG', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 6000000.00, 0.00, 0.00, 0.00, 6000000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'confirmed', '2026-03-26 07:14:26', '2026-05-15 10:56:08', NULL, NULL, 0.00),
(13, 'SORAOZVZQFW9', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 6000000.00, 0.00, 0.00, 0.00, 6000000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 07:15:26', '2026-03-26 07:15:26', NULL, NULL, 0.00),
(14, 'SORAMZG8QT2L', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 6000000.00, 0.00, 0.00, 0.00, 6000000.00, NULL, NULL, NULL, NULL, 'vnpay', 'unpaid', 'pending', '2026-03-26 07:17:25', '2026-03-26 07:17:25', NULL, NULL, 0.00),
(15, 'SORAKMUO1SLA', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 6000000.00, 0.00, 0.00, 0.00, 6000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'cancelled', '2026-03-26 07:19:02', '2026-04-04 07:49:49', NULL, NULL, 0.00),
(38, 'SORAQBZV6EN1', 69, 'Nguyễn Văn A', '0345678910', 'hieuv12321@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 40250000.00, 0.00, 0.00, 0.00, 40250000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-03-27 21:55:33', '2026-03-27 21:55:33', NULL, NULL, 0.00),
(39, 'SORARCQH0IIK', 70, 'Thanh Hieu', '0377975276', 'hieuhtpk04060@gmail.com', 'DAK LAK', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-03-27 22:20:57', '2026-03-27 22:20:57', NULL, NULL, 0.00),
(40, 'SORAN9NQVC9X', 70, 'Thanh Hieu', '0377975276', 'hieuhtpk04060@gmail.com', 'dak lak', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-03-27 22:25:21', '2026-03-27 22:25:21', NULL, NULL, 0.00),
(41, 'SORA7YGMPQJ2', 70, 'Thanh Hieu', '0377975276', 'hieuhtpk04060@gmail.com', 'DAK LAK', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-03-27 22:30:47', '2026-03-27 22:30:47', NULL, NULL, 0.00),
(42, 'SORAUODHFF8P', 70, 'hiếu hoàng', '0377975276', 'hieuhtpk04060@gmail.com', 'dak lak', NULL, 15000000.00, 0.00, 0.00, 0.00, 15000000.00, 0.00, 'SORA rất tiếc không thể chấp nhận yêu cầu hoàn tiền do sản phẩm không đáp ứng đủ điều kiện đổi trả ban đầu.', NULL, NULL, 'momo', 'paid', 'pending', '2026-03-31 05:42:24', '2026-03-31 22:46:34', NULL, NULL, 0.00),
(43, 'SORABRLGUUOH', 70, 'hiếu hoàng', '0377975276', 'hieuhtpk04060@gmail.com', 'dark lắm', NULL, 8000000.00, 0.00, 0.00, 0.00, 8000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'confirmed', '2026-03-31 05:53:08', '2026-04-23 04:39:12', NULL, NULL, 0.00),
(44, 'SORATOY7RLM0', 71, 'Hiếu Hoàng', '0345678910', 'hieuv12321@gmail.com', 'dak lak', NULL, 15000000.00, 0.00, 0.00, 0.00, 15000000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-03-31 05:57:23', '2026-04-23 05:00:11', NULL, NULL, 0.00),
(45, 'SORANHEU6SG8', 71, 'Hiếu Hoàng', '0345678910', 'hieuv12321@gmail.com', '123', NULL, 15000000.00, 0.00, 0.00, 0.00, 15000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'confirmed', '2026-03-31 06:05:29', '2026-04-11 00:08:33', NULL, NULL, 0.00),
(46, 'SORABPNEWFMR', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'momo', 'paid', 'delivered', '2026-04-04 03:52:06', '2026-04-23 07:05:28', NULL, NULL, 0.00),
(47, 'SORAMPV8GLBW', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 2100000.00, 0.00, 0.00, 4900000.00, NULL, NULL, 16, 'GIAM30%', 'cod', 'paid', 'delivered', '2026-04-04 06:04:20', '2026-04-23 05:18:20', NULL, NULL, 0.00),
(48, 'SORA2RY8IGZQ', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-04 06:15:07', '2026-04-09 21:02:18', NULL, NULL, 0.00),
(49, 'SORATDNO2BAI', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'cancelled', '2026-04-04 06:21:33', '2026-04-04 07:50:02', NULL, NULL, 0.00),
(50, 'SORARFVSMTYX', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 2100000.00, 0.00, 0.00, 4900000.00, NULL, NULL, 16, 'GIAM30%', 'cod', 'unpaid', 'cancelled', '2026-04-04 06:23:21', '2026-04-04 07:49:40', NULL, NULL, 0.00),
(51, 'SORAHEIYWGL0', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'cancelled', '2026-04-04 06:31:59', '2026-04-04 07:49:28', NULL, NULL, 0.00),
(52, 'SORAM40UHSRQ', 69, 'Nguyễn Văn A', '0345678910', 'Test1@gmail.com', 'aaaa, Xã Nhơn Phúc, Thị xã An Nhơn, Tỉnh Bình Định', NULL, 7000000.00, 0.00, 0.00, 0.00, 7000000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-04 07:50:12', '2026-04-09 03:10:10', NULL, NULL, 0.00),
(53, 'SORAMR8X7R5H', 73, 'Hoàng Thanh Hiếu', '0345678911', 'issehieu1115@gmail.com', 'a, Xã Tây Thuận, Huyện Tây Sơn, Tỉnh Bình Định', NULL, 40000000.00, 0.00, 0.00, 45000.00, 40045000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-21 07:46:43', '2026-04-21 07:47:53', NULL, NULL, 0.00),
(54, 'SORANMRQOMRR', 73, 'Hoàng Thanh Hiếu', '0345678911', 'issehieu1115@gmail.com', 'ab, Phường Thắng Lợi, Thành phố Pleiku, Tỉnh Gia Lai', NULL, 6000000.00, 0.00, 0.00, 35000.00, 6035000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-23 01:10:29', '2026-04-23 01:16:58', NULL, NULL, 0.00),
(55, 'SORAU8LPQGE6', 73, 'hieu', '0345678911', 'issehieu1115@gmail.com', 'a, Phường 11, Quận 6, Thành phố Hồ Chí Minh', NULL, 49000000.00, 14700000.00, 0.00, 60000.00, 34360000.00, NULL, NULL, 16, 'GIAM30%', 'cod', 'paid', 'delivered', '2026-04-23 01:34:10', '2026-04-23 01:35:16', NULL, NULL, 0.00),
(56, 'SORABCYEHDF4', 73, 'hieu', '0345678911', 'issehieu1115@gmail.com', 'a, Xã Suối Bạc, Huyện Sơn Hòa, Tỉnh Phú Yên', NULL, 51000000.00, 0.00, 2550000.00, 35000.00, 48485000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-23 03:06:57', '2026-04-23 04:29:31', NULL, NULL, 0.00),
(57, 'SORAPZNR36WG', 73, 'hieu', '0345678911', 'issehieu1115@gmail.com', 'a, Xã Giáp Sơn, Huyện Lục Ngạn, Tỉnh Bắc Giang', NULL, 51000000.00, 0.00, 5100000.00, 130000.00, 46030000.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'delivered', '2026-04-23 04:32:13', '2026-04-23 04:34:23', NULL, NULL, 0.00),
(58, 'SORAQZDYHQFI', 73, 'hieu', '0345678911', 'issehieu1115@gmail.com', '01, Phường Tân Định, Quận 1, Thành phố Hồ Chí Minh', NULL, 45000000.00, 0.00, 2250000.00, 60000.00, 42810000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'shipping', '2026-04-24 06:11:48', '2026-05-15 08:17:40', NULL, NULL, 0.00),
(59, 'SORAWUXHJAND', 73, 'hieu 2', '0345678912', 'issehieu1115@gmail.com', '4, Phường 8, Thành phố Bến Tre, Tỉnh Bến Tre', NULL, 400000.00, 0.00, 20000.00, 60000.00, 440000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'shipping', '2026-04-24 23:03:04', '2026-05-15 07:37:39', NULL, NULL, 0.00),
(60, 'SORAMV8HUONU', 73, 'hieu 2', '0345678912', 'issehieu1115@gmail.com', '4, Phường 8, Thành phố Bến Tre, Tỉnh Bến Tre', NULL, 500000.00, 0.00, 25000.00, 60000.00, 535000.00, NULL, NULL, NULL, NULL, 'momo', 'paid', 'cancelled', '2026-04-24 23:22:24', '2026-04-24 23:25:56', NULL, NULL, 0.00),
(61, 'SORAWUVNV8S4', 73, 'hieu 2', '0345678912', 'issehieu1115@gmail.com', '4, Phường 8, Thành phố Bến Tre, Tỉnh Bến Tre', NULL, 3305000.00, 0.00, 165250.00, 60000.00, 3199750.00, NULL, NULL, NULL, NULL, 'cod', 'paid', 'return_requested', '2026-04-24 23:42:29', '2026-04-25 00:02:21', NULL, NULL, 0.00),
(62, 'SORACB46UZBE', 73, 'hieu 2', '0345678912', 'issehieu1115@gmail.com', '4, Phường 8, Thành phố Bến Tre, Tỉnh Bến Tre', NULL, 8000000.00, 0.00, 400000.00, 35000.00, 7635000.00, NULL, NULL, NULL, NULL, 'momo', 'paid', 'cancelled', '2026-04-24 23:42:56', '2026-04-24 23:45:28', NULL, NULL, 0.00),
(63, 'SORAPMBOYXSN', 73, 'hieu 2', '0345678912', 'issehieu1115@gmail.com', '4, Phường 8, Thành phố Bến Tre, Tỉnh Bến Tre', NULL, 1128305000.00, 0.00, 56415250.00, 60000.00, 1071949750.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'cancelled', '2026-04-24 23:58:30', '2026-04-24 23:59:22', NULL, NULL, 0.00),
(64, 'SORAP8187NPQ', 72, 'Lê Thị Mỹ Duyên', '0941220016', 'duyenltmpk04047@gmail.com', '123, Xã Tam Giang Tây, Huyện Ngọc Hiển, Tỉnh Cà Mau', NULL, 1125000000.00, 0.00, 0.00, 90000.00, 1125090000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'cancelled', '2026-04-24 23:59:25', '2026-04-25 00:00:59', NULL, NULL, 0.00),
(65, 'SORAYE7VBZBZ', 70, 'hiếu hoàng', '0377975276', 'hieuhtpk04060@gmail.com', 'a, Xã Vũ Bản, Huyện Bình Lục, Tỉnh Hà Nam', 'a', 35600000.00, 0.00, 0.00, 130000.00, 35730000.00, NULL, NULL, NULL, NULL, 'cod', 'unpaid', 'pending', '2026-05-17 21:06:12', '2026-05-17 21:06:12', NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_variant_id` bigint UNSIGNED DEFAULT NULL COMMENT 'ID của Biến thể cụ thể (Ni 12, Vàng 18k)',
  `combo_id` bigint UNSIGNED DEFAULT NULL,
  `combo_selections` json DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lưu tên cứng lúc mua',
  `variant_sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lưu mã SKU cứng lúc mua',
  `variant_attributes` json DEFAULT NULL COMMENT 'Lưu cấu hình biến thể (VD: {"Size": "12", "Chất liệu": "Bạch kim"})',
  `variant_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh của biến thể đó',
  `price` decimal(15,2) NOT NULL COMMENT 'Giá bán (đã tính khuyến mãi) TẠI THỜI ĐIỂM MUA',
  `quantity` int NOT NULL DEFAULT '1',
  `total_price` decimal(15,2) NOT NULL COMMENT 'price * quantity'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_variant_id`, `combo_id`, `combo_selections`, `product_name`, `variant_sku`, `variant_attributes`, `variant_image`, `price`, `quantity`, `total_price`) VALUES
(1, 1, NULL, NULL, NULL, NULL, 'nhẫn abc', 'NHAN-2', '{\"màu\": \"xanh\", \"loại\": \"a\", \"Độ dài\": \"10\", \"chất liệu\": \"vàng\"}', 'products/variants/var_nhan-2_1773772783.png', 100000.00, 1, 100000.00),
(2, 2, NULL, NULL, NULL, NULL, 'nhẫn abc', 'NHAN--1', '{\"màu\": \"vàng\", \"loại\": \"a\", \"Độ dài\": \"11\", \"chất liệu\": \"bạc\"}', 'products/variants/var_nhan-1_1773796959.png', 100000.00, 2, 200000.00),
(3, 2, NULL, NULL, NULL, NULL, 'nhẫn abc', 'NHAN--2', '{\"màu\": \"vàng\", \"loại\": \"a\", \"Độ dài\": \"12\", \"chất liệu\": \"vàng\"}', 'products/variants/var_nhan-2_1773797247.jpg', 100000.00, 1, 100000.00),
(4, 3, NULL, NULL, NULL, NULL, 'nhẫn abc', 'NHAN--3', '{\"màu\": \"vàng\", \"loại\": \"a\", \"Độ dài\": \"14\", \"chất liệu\": \"bạc\"}', 'products/variants/var_nhan-3_1773797247.png', 100000.00, 1, 100000.00),
(5, 8, NULL, NULL, 1, '[{\"combo_item_id\": 57, \"selected_variant_id\": 9}, {\"combo_item_id\": 58, \"selected_variant_id\": 8}, {\"combo_item_id\": 59, \"selected_variant_id\": 7}, {\"combo_item_id\": 60, \"selected_variant_id\": 2}]', 'Combo forever', 'COMBO-1', NULL, 'combos/combo_combo-forever_1774277548.jpg', 33250000.00, 1, 33250000.00),
(6, 8, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774277141.jpg', 15000000.00, 1, 15000000.00),
(7, 8, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(8, 9, NULL, NULL, 1, '[{\"combo_item_id\": 57, \"selected_variant_id\": 9}, {\"combo_item_id\": 58, \"selected_variant_id\": 11}, {\"combo_item_id\": 59, \"selected_variant_id\": 10}, {\"combo_item_id\": 60, \"selected_variant_id\": 12}]', 'Combo forever', 'COMBO-1', NULL, 'combos/combo_combo-forever_1774277548.jpg', 33250000.00, 1, 33250000.00),
(9, 9, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774277141.jpg', 15000000.00, 1, 15000000.00),
(10, 10, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774277141.jpg', 15000000.00, 1, 15000000.00),
(11, 11, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(12, 12, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(13, 13, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(14, 14, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(15, 15, NULL, NULL, NULL, NULL, 'Nhẫn Sora 2', 'NHAN1403-V1', NULL, 'products/variants/var_nhan1403-v1_1774447395.jpg', 6000000.00, 1, 6000000.00),
(39, 38, NULL, NULL, 1, '[{\"combo_item_id\": 57, \"selected_variant_id\": 9}, {\"combo_item_id\": 58, \"selected_variant_id\": 8}, {\"combo_item_id\": 59, \"selected_variant_id\": 7}, {\"combo_item_id\": 60, \"selected_variant_id\": 2}]', 'Combo forever', 'COMBO-1', NULL, 'combos/combo_combo-forever_1774277548.jpg', 33250000.00, 1, 33250000.00),
(40, 38, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN2027-V2', NULL, 'products/variants/var_nhan2027-v2_1774350641.jpg', 7000000.00, 1, 7000000.00),
(41, 39, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN2027-V2', NULL, 'products/variants/var_nhan2027-v2_1774350641.jpg', 7000000.00, 1, 7000000.00),
(42, 40, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(43, 41, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN2027-V2', NULL, 'products/variants/var_nhan2027-v2_1774350641.jpg', 7000000.00, 1, 7000000.00),
(44, 42, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774544518.jpg', 15000000.00, 1, 15000000.00),
(45, 43, NULL, NULL, NULL, NULL, 'Vòng Cổ Sora', 'VONG9662-V2', NULL, 'products/variants/var_vong9662-v2_1774350670.jpg', 8000000.00, 1, 8000000.00),
(46, 44, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774544518.jpg', 15000000.00, 1, 15000000.00),
(47, 45, NULL, NULL, NULL, NULL, 'Vong Tay Sora', 'VONG6732-V1', NULL, 'products/variants/var_vong6732-v1_1774544518.jpg', 15000000.00, 1, 15000000.00),
(48, 46, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(49, 47, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(50, 48, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(51, 49, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(52, 50, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(53, 51, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(54, 52, NULL, NULL, NULL, NULL, 'Nhẫn', 'NHAN4929-V1', NULL, 'products/variants/var_nhan4929-v1_1774276245.jpg', 7000000.00, 1, 7000000.00),
(55, 53, 60, 64, NULL, NULL, 'Kiềng Cổ Cô Dâu Truyền Thống', 'SKU-KIENG-CO-BRIDE', NULL, 'products/variants/var_sku-kieng-co-bride_1775836553.jpg', 40000000.00, 1, 40000000.00),
(56, 54, 48, 52, NULL, NULL, 'Dây Chuyền Bi Vàng', 'SKU-DAY-CHUYEN-BI', NULL, 'products/variants/var_sku-day-chuyen-bi_1775837752.jpg', 6000000.00, 1, 6000000.00),
(57, 55, 18, 22, NULL, NULL, 'Nhẫn Kim Cương Pear Shape', 'SKU-NHAN-KIM-CUONG-PEAR', NULL, 'products/variants/var_sku-nhan-kim-cuong-pear_1775840638.jpg', 49000000.00, 1, 49000000.00),
(58, 56, 19, 23, NULL, NULL, 'Nhẫn Kim Cương Cushion Cut', 'SKU-NHAN-KIM-CUONG-CUSHION', NULL, 'products/variants/var_sku-nhan-kim-cuong-cushion_1775840489.jpg', 51000000.00, 1, 51000000.00),
(59, 57, 19, 23, NULL, NULL, 'Nhẫn Kim Cương Cushion Cut', 'SKU-NHAN-KIM-CUONG-CUSHION', NULL, 'products/variants/var_sku-nhan-kim-cuong-cushion_1775840489.jpg', 51000000.00, 1, 51000000.00),
(60, 58, 102, 106, NULL, NULL, 'Bộ Trang Sức Ngọc Trai Biển', 'SKU-SET-SEA-PEARL', NULL, 'products/variants/var_sku-set-sea-pearl_1775832543.jpg', 45000000.00, 1, 45000000.00),
(61, 59, 75, 79, NULL, NULL, 'Nhẫn Trẻ Em Điều Chỉnh Size', 'SKU-NHAN-BE-ADJUSTABLE', NULL, 'products/variants/var_sku-nhan-be-adjustable_1775835031.jpg', 400000.00, 1, 400000.00),
(62, 60, 70, 74, NULL, NULL, 'Vòng Tay Bạc Bé Gái', 'SKU-VONG-TAY-BAC-BE-GAI', NULL, 'products/variants/var_sku-vong-tay-bac-be-gai_1775835505.jpg', 500000.00, 1, 500000.00),
(63, 61, NULL, NULL, 5, '[{\"combo_item_id\": 91, \"selected_variant_id\": 74}, {\"combo_item_id\": 92, \"selected_variant_id\": 75}, {\"combo_item_id\": 93, \"selected_variant_id\": 77}, {\"combo_item_id\": 94, \"selected_variant_id\": 76}]', 'Thiên Thần Nhỏ', 'COMBO-5', NULL, 'combos/combo_thien-than-nho_1776958427.jpg', 2805000.00, 1, 2805000.00),
(64, 61, 70, 74, NULL, NULL, 'Vòng Tay Bạc Bé Gái', 'SKU-VONG-TAY-BAC-BE-GAI', NULL, 'products/variants/var_sku-vong-tay-bac-be-gai_1775835505.jpg', 500000.00, 1, 500000.00),
(65, 62, 91, 95, NULL, NULL, 'Nhẫn Tỳ Hưu Chiêu Tài', 'SKU-NHAN-TY-HUU', NULL, 'products/variants/var_sku-nhan-ty-huu_1775833415.jpg', 8000000.00, 1, 8000000.00),
(66, 63, NULL, NULL, 5, '[{\"combo_item_id\": 91, \"selected_variant_id\": 74}, {\"combo_item_id\": 92, \"selected_variant_id\": 75}, {\"combo_item_id\": 93, \"selected_variant_id\": 77}, {\"combo_item_id\": 94, \"selected_variant_id\": 76}]', 'Thiên Thần Nhỏ', 'COMBO-5', NULL, 'combos/combo_thien-than-nho_1776958427.jpg', 2805000.00, 1, 2805000.00),
(67, 63, 70, 74, NULL, NULL, 'Vòng Tay Bạc Bé Gái', 'SKU-VONG-TAY-BAC-BE-GAI', NULL, 'products/variants/var_sku-vong-tay-bac-be-gai_1775835505.jpg', 500000.00, 1, 500000.00),
(68, 63, 109, 148, NULL, NULL, 'Bộ Trang Sức Kim Cương Tấm', 'SET2274-V2', NULL, 'products/variants/var_set2274-v2_1777099698.jpg', 75000000.00, 15, 1125000000.00),
(69, 64, 109, 148, NULL, NULL, 'Bộ Trang Sức Kim Cương Tấm', 'SET2274-V2', NULL, 'products/variants/var_set2274-v2_1777099698.jpg', 75000000.00, 15, 1125000000.00),
(70, 65, NULL, NULL, 6, '[{\"combo_item_id\": 97, \"selected_variant_id\": 101}, {\"combo_item_id\": 98, \"selected_variant_id\": 593}]', '25 NGÀY GIỮ THÁNG', 'COMBO-6', NULL, 'combos/combo_25-ngay-giu-thang_1777099773.jpg', 5150000.00, 1, 5150000.00),
(71, 65, 29, 33, NULL, NULL, 'Nhẫn Cưới Rose Gold', 'SKU-NHAN-CUOI-ROSE-GOLD', NULL, 'products/variants/var_sku-nhan-cuoi-rose-gold_1775839458.jpg', 21000000.00, 1, 21000000.00),
(72, 65, 96, 596, NULL, NULL, 'Nhẫn Kim Tiền Vàng 18K', 'SKU-NHAN-KIM-TIEN-18K-V2', NULL, 'products/thumbnails/prod_nhan-kim-tien-vang-18k_1775833000.webp', 4725000.00, 2, 9450000.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_status_histories`
--

CREATE TABLE `order_status_histories` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `old_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Lý do thay đổi (VD: Lý do hủy đơn)',
  `changed_by` bigint UNSIGNED DEFAULT NULL COMMENT 'ID của Admin/User thực hiện đổi trạng thái',
  `changed_by_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'user, admin, or system',
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_histories`
--

INSERT INTO `order_status_histories` (`id`, `order_id`, `old_status`, `new_status`, `note`, `changed_by`, `changed_by_type`, `created_at`) VALUES
(1, 1, NULL, 'pending', 'Khách hàng đặt đơn thành công', NULL, NULL, '2026-03-17 01:30:00'),
(2, 1, 'pending', 'confirmed', 'Đã gọi điện xác nhận', 16, NULL, '2026-03-17 02:00:00'),
(3, 1, 'confirmed', 'shipping', 'Đã giao cho đơn vị vận chuyển', 16, NULL, '2026-03-17 08:00:00'),
(4, 1, 'shipping', 'delivered', 'Khách đã nhận hàng và xác nhận', 16, NULL, '2026-03-18 08:00:00'),
(5, 2, NULL, 'pending', 'Khách hàng đặt đơn thành công', NULL, NULL, '2026-03-19 02:15:00'),
(6, 3, NULL, 'pending', 'Khách hàng đặt đơn thành công', NULL, NULL, '2026-03-10 03:00:00'),
(7, 3, 'pending', 'confirmed', 'Đã xác nhận đơn hàng', 16, NULL, '2026-03-10 04:00:00'),
(8, 3, 'confirmed', 'shipping', 'Đang vận chuyển', 16, NULL, '2026-03-11 01:00:00'),
(9, 3, 'shipping', 'delivered', 'Giao hàng thành công', 16, NULL, '2026-03-13 07:00:00'),
(10, 3, 'delivered', 'returned', 'Khách khiếu nại hộp móp, yêu cầu trả hàng hoàn tiền', 16, NULL, '2026-03-19 03:30:00'),
(11, 2, 'pending', 'shipping', NULL, 16, NULL, '2026-03-19 06:48:39'),
(12, 2, 'shipping', 'cancelled', 'loi', 16, NULL, '2026-03-19 06:49:19'),
(13, 1, 'delivered', 'returned', 'a', 16, NULL, '2026-03-19 07:06:43'),
(14, 3, 'pending', 'confirmed', NULL, 16, NULL, '2026-03-19 07:17:31'),
(15, 1, 'pending', 'confirmed', NULL, 16, NULL, '2026-03-19 09:04:30'),
(16, 1, 'confirmed', 'processing', NULL, 16, NULL, '2026-03-19 09:04:37'),
(17, 2, 'pending', 'confirmed', NULL, 16, NULL, '2026-03-19 09:05:23'),
(18, 3, 'confirmed', 'processing', NULL, 16, NULL, '2026-03-19 09:05:46'),
(19, 2, 'confirmed', 'processing', NULL, 16, NULL, '2026-03-19 09:06:36'),
(20, 2, 'processing', 'shipping', NULL, 16, NULL, '2026-03-19 09:06:44'),
(21, 3, 'processing', 'shipping', NULL, 16, NULL, '2026-03-19 09:12:18'),
(22, 1, 'processing', 'shipping', NULL, 16, NULL, '2026-03-19 09:12:52'),
(23, 1, 'shipping', 'delivered', NULL, 16, NULL, '2026-03-19 09:13:27'),
(24, 2, 'shipping', 'delivered', NULL, 16, NULL, '2026-03-19 09:17:23'),
(25, 3, 'shipping', 'delivered', NULL, 16, NULL, '2026-03-19 09:32:16'),
(26, 3, 'pending', 'confirmed', NULL, 16, NULL, '2026-03-24 09:46:16'),
(27, 3, 'confirmed', 'processing', NULL, 16, 'admin', '2026-03-24 10:20:20'),
(28, 3, 'processing', 'shipping', NULL, 16, 'admin', '2026-03-24 10:20:25'),
(29, 3, 'shipping', 'delivered', NULL, 16, 'admin', '2026-03-24 10:20:30'),
(30, 3, 'pending', 'confirmed', NULL, 16, 'admin', '2026-03-24 10:28:04'),
(31, 3, 'confirmed', 'processing', NULL, 16, 'admin', '2026-03-24 10:28:10'),
(32, 3, 'processing', 'shipping', NULL, 16, 'admin', '2026-03-24 10:28:15'),
(33, 3, 'shipping', 'delivered', NULL, 16, 'admin', '2026-03-24 10:28:29'),
(34, 8, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 06:28:39'),
(35, 9, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 06:30:56'),
(36, 10, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 06:44:55'),
(37, 11, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 06:52:20'),
(38, 12, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 07:14:26'),
(39, 13, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 07:15:26'),
(40, 14, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 07:17:25'),
(41, 15, NULL, 'pending', 'Khách hàng đặt đơn thành công', 69, 'user', '2026-03-26 07:19:02'),
(64, 38, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-03-27 21:55:33'),
(65, 39, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-03-27 22:20:57'),
(66, 40, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-03-27 22:25:21'),
(67, 41, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-03-27 22:30:47'),
(68, 42, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-03-31 05:42:24'),
(69, 43, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-03-31 05:53:08'),
(70, 44, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 71, 'user', '2026-03-31 05:57:23'),
(71, 45, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 71, 'user', '2026-03-31 06:05:29'),
(72, 3, 'returned', 'returned', 'Đã gửi Email từ chối hoàn tiền.', 16, 'admin', '2026-03-31 22:08:03'),
(73, 42, 'pending', 'pending', 'Đã gửi Email từ chối hoàn tiền.', 16, 'admin', '2026-03-31 22:46:34'),
(75, 3, 'cancelled', 'cancelled', 'Đã gửi Email từ chối hoàn tiền.', 16, 'admin', '2026-03-31 22:57:59'),
(76, 46, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 03:52:06'),
(77, 47, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 06:04:20'),
(78, 48, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 06:15:07'),
(79, 49, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 06:21:33'),
(80, 50, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 06:23:21'),
(81, 51, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 06:31:59'),
(82, 51, 'pending', 'cancelled', 'Khách hủy: không muốn mua nữa', 69, 'user', '2026-04-04 07:49:28'),
(83, 50, 'pending', 'cancelled', 'Khách hủy: Lý do khác', 69, 'user', '2026-04-04 07:49:40'),
(84, 15, 'pending', 'cancelled', 'Khách hủy: Lý do khác', 69, 'user', '2026-04-04 07:49:49'),
(85, 49, 'pending', 'cancelled', 'Khách hủy: Lý do khác', 69, 'user', '2026-04-04 07:50:02'),
(86, 52, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 69, 'user', '2026-04-04 07:50:12'),
(87, 52, 'pending', 'confirmed', NULL, 16, 'admin', '2026-04-09 02:55:26'),
(88, 52, 'confirmed', 'processing', NULL, 16, 'admin', '2026-04-09 03:09:40'),
(89, 52, 'processing', 'shipping', NULL, 16, 'admin', '2026-04-09 03:09:50'),
(90, 52, 'shipping', 'delivered', NULL, 16, 'admin', '2026-04-09 03:10:10'),
(91, 48, 'pending', 'confirmed', NULL, 16, 'admin', '2026-04-09 21:01:17'),
(92, 47, 'pending', 'confirmed', NULL, 16, 'admin', '2026-04-09 21:01:24'),
(93, 46, 'pending', 'confirmed', NULL, 16, 'admin', '2026-04-09 21:01:34'),
(94, 48, 'confirmed', 'processing', NULL, 16, 'admin', '2026-04-09 21:01:47'),
(95, 48, 'processing', 'shipping', NULL, 16, 'admin', '2026-04-09 21:01:58'),
(96, 48, 'shipping', 'delivered', NULL, 16, 'admin', '2026-04-09 21:02:18'),
(97, 45, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận thành công.', 16, 'admin', '2026-04-11 00:08:33'),
(98, 47, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-04-11 01:05:18'),
(99, 3, 'cancelled', 'cancelled', 'Đã gửi Email thỏa thuận số tiền hoàn lại.', 16, 'admin', '2026-04-11 01:26:24'),
(100, 53, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-21 07:46:43'),
(101, 53, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-04-21 07:47:13'),
(102, 53, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-04-21 07:47:23'),
(103, 53, 'processing', 'shipping', 'Đơn hàng đang trên đường giao đến bạn', 16, 'admin', '2026-04-21 07:47:34'),
(104, 53, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-21 07:47:53'),
(105, 54, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-23 01:10:29'),
(106, 54, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-04-23 01:16:21'),
(107, 54, 'confirmed', 'processing', 'Đang đóng gói sản phẩm', 16, 'admin', '2026-04-23 01:16:29'),
(108, 54, 'processing', 'shipping', 'Đơn hàng đã bắt đầu vận chuyển', 16, 'admin', '2026-04-23 01:16:37'),
(109, 54, 'shipping', 'delivered', 'Khách đã nhận hàng và đồng kiểm', 16, 'admin', '2026-04-23 01:16:58'),
(110, 55, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-23 01:34:10'),
(111, 55, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-04-23 01:34:44'),
(112, 55, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-04-23 01:34:51'),
(113, 55, 'processing', 'shipping', 'Đơn hàng đang trên đường giao đến bạn', 16, 'admin', '2026-04-23 01:34:58'),
(114, 55, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-23 01:35:16'),
(115, 56, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-23 03:06:57'),
(116, 56, 'pending', 'confirmed', 'Đã xác nhận đơn hàng', 16, 'admin', '2026-04-23 03:44:11'),
(117, 56, 'confirmed', 'processing', 'Đang tiến hành đóng gói sản phẩm', 16, 'admin', '2026-04-23 03:44:26'),
(118, 56, 'processing', 'shipping', 'Kiện hàng đang trên đường đi', 16, 'admin', '2026-04-23 03:54:29'),
(119, 44, 'pending', 'confirmed', 'Đã xác nhận đơn hàng', 16, 'admin', '2026-04-23 04:03:01'),
(120, 44, 'confirmed', 'processing', 'Đang tiến hành đóng gói sản phẩm', 16, 'admin', '2026-04-23 04:06:38'),
(121, 44, 'processing', 'shipping', 'Đã bàn giao cho đối tác vận chuyển', 16, 'admin', '2026-04-23 04:12:05'),
(122, 56, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-23 04:29:31'),
(123, 57, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-23 04:32:13'),
(124, 57, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-04-23 04:33:51'),
(125, 57, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-04-23 04:34:07'),
(126, 57, 'processing', 'shipping', 'Đơn hàng đã bắt đầu vận chuyển', 16, 'admin', '2026-04-23 04:34:16'),
(127, 57, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-23 04:34:23'),
(128, 43, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-04-23 04:39:12'),
(129, 44, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-23 05:00:11'),
(130, 47, 'processing', 'shipping', 'Đã bàn giao cho đối tác vận chuyển', 16, 'admin', '2026-04-23 05:18:04'),
(131, 47, 'shipping', 'delivered', 'Giao hàng thành công, khách đã ký nhận', 16, 'admin', '2026-04-23 05:18:20'),
(132, 46, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-04-23 07:04:58'),
(133, 46, 'processing', 'shipping', 'Đơn hàng đã bắt đầu vận chuyển', 16, 'admin', '2026-04-23 07:05:18'),
(134, 46, 'shipping', 'delivered', 'Giao hàng thành công', 16, 'admin', '2026-04-23 07:05:28'),
(135, 58, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 06:11:48'),
(136, 59, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 23:03:04'),
(137, 60, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 23:22:24'),
(138, 60, 'pending', 'cancelled', 'Khách hủy: toi khong muon mua nua', 73, 'user', '2026-04-24 23:25:56'),
(139, 61, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 23:42:29'),
(140, 62, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 23:42:56'),
(141, 61, 'pending', 'confirmed', 'Đã xác nhận đơn hàng', 16, 'admin', '2026-04-24 23:44:39'),
(142, 61, 'confirmed', 'processing', 'Đang tiến hành đóng gói sản phẩm', 16, 'admin', '2026-04-24 23:44:43'),
(143, 61, 'processing', 'shipping', 'Đã bàn giao cho đối tác vận chuyển', 16, 'admin', '2026-04-24 23:44:47'),
(144, 61, 'shipping', 'delivered', 'Giao hàng thành công, khách đã ký nhận', 16, 'admin', '2026-04-24 23:44:50'),
(145, 62, 'pending', 'cancelled', 'Khách hủy: TÔI KO MUỐN NƯACX, TÔI MUOONS ĐỔI SP KHÁC', 73, 'user', '2026-04-24 23:45:28'),
(146, 63, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 73, 'user', '2026-04-24 23:58:30'),
(147, 63, 'pending', 'cancelled', 'Khách hủy: toi khong muon mua nữa', 73, 'user', '2026-04-24 23:59:22'),
(148, 64, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 72, 'user', '2026-04-24 23:59:25'),
(149, 64, 'pending', 'cancelled', 'Khách hàng đổi ý', 16, 'admin', '2026-04-25 00:00:59'),
(150, 61, 'delivered', 'return_requested', 'Khách yêu cầu hoàn hàng: Sản phẩm bị lỗi, trầy xước từ trước', 73, 'user', '2026-04-25 00:02:21'),
(151, 59, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-05-15 06:04:35'),
(152, 58, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-05-15 07:35:46'),
(153, 59, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-05-15 07:36:13'),
(154, 59, 'processing', 'shipping', 'Đơn hàng đã bắt đầu vận chuyển', 16, 'admin', '2026-05-15 07:37:39'),
(155, 58, 'confirmed', 'processing', 'Đơn hàng đang được xử lý', 16, 'admin', '2026-05-15 07:38:03'),
(156, 58, 'processing', 'shipping', 'Đơn hàng đã bắt đầu vận chuyển', 16, 'admin', '2026-05-15 08:17:40'),
(157, 12, 'pending', 'confirmed', 'Đơn hàng đã được xác nhận', 16, 'admin', '2026-05-15 10:56:08'),
(158, 65, NULL, 'pending', 'Khách hàng khởi tạo đơn hàng', 70, 'user', '2026-05-17 21:06:12');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint NOT NULL,
  `slug` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `slug`, `name`, `group_name`, `created_at`, `updated_at`) VALUES
(1, 'dashboard.access', 'Truy cập Dashboard', 'Tổng quan', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(2, 'admins.access', 'Quản lý Tài khoản nội bộ', 'Người dùng', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(3, 'users.access', 'Quản lý Khách hàng', 'Người dùng', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(4, 'categories.access', 'Quản lý Danh mục', 'Sản phẩm', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(5, 'products.access', 'Quản lý Sản phẩm', 'Sản phẩm', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(6, 'orders.access', 'Quản lý Đơn hàng', 'Bán hàng', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(7, 'news.access', 'Quản lý Tin tức', 'Nội dung', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(8, 'comments.access', 'Quản lý Bình luận', 'Tương tác', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(9, 'reviews.access', 'Quản lý Đánh giá', 'Tương tác', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(10, 'slides.access', 'Quản lý Slide & Banner', 'Giao diện', '2025-11-30 18:03:10', '2025-11-30 18:03:10'),
(11, 'coupons.access', 'Quản lý Mã giảm giá', 'Bán hàng', '2025-11-30 18:03:10', '2025-11-30 18:03:10');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 58, 'client-token', 'c768a764513cd3d920617911afb532218bf6f70b0d23e2a331006abe9868fa9d', '[\"*\"]', NULL, NULL, '2025-11-18 08:16:57', '2025-11-18 08:16:57'),
(2, 'App\\Models\\User', 58, 'client-token', '409ada0118feee684626545ac9a109532732702a002eaab01d54e95860eaac3d', '[\"*\"]', NULL, NULL, '2025-11-18 08:24:04', '2025-11-18 08:24:04'),
(3, 'App\\Models\\User', 58, 'client-token', '179fb534718fbeb849631216c1ca496e49674ed8eb7dc5909bf0e01bd162ed84', '[\"*\"]', '2025-11-19 05:40:23', NULL, '2025-11-18 08:26:39', '2025-11-19 05:40:23'),
(4, 'App\\Models\\Admin', 2, 'admin-token', '70563a529c11a51eeee9bd68d48dc82cd6fd77d6079831c972931f61f9ec8ddf', '[\"*\"]', NULL, NULL, '2025-11-18 19:10:44', '2025-11-18 19:10:44'),
(5, 'App\\Models\\Admin', 2, 'admin-token', '4975fc389d778ff6c24d86d64a4f8ff99f1c688245fdc81b1f15f3e50a063358', '[\"*\"]', NULL, NULL, '2025-11-18 19:16:08', '2025-11-18 19:16:08'),
(6, 'App\\Models\\Admin', 2, 'admin-token', '5d006f89b04502c80dc7cce0fc27f7945cbd12956541be51eb7f6cf199eaec16', '[\"*\"]', NULL, NULL, '2025-11-18 19:20:47', '2025-11-18 19:20:47'),
(7, 'App\\Models\\Admin', 2, 'admin-token', 'ce69bc38d28ae034292333e59cb82b83a891996b31e2c89ece72a634622de6df', '[\"*\"]', NULL, NULL, '2025-11-18 19:23:40', '2025-11-18 19:23:40'),
(8, 'App\\Models\\Admin', 2, 'admin-token', '647ddfb20def9e599e7352567af2feeda09024ffddba8f38890c75eb5b3756f5', '[\"*\"]', NULL, NULL, '2025-11-18 19:51:29', '2025-11-18 19:51:29'),
(9, 'App\\Models\\Admin', 2, 'admin-token', 'ea9e7dad2f26c3629d1256f0256f5920f2accca0729448f56aa69f125af67df4', '[\"*\"]', NULL, NULL, '2025-11-18 19:51:34', '2025-11-18 19:51:34'),
(10, 'App\\Models\\Admin', 2, 'admin-token', '2a3ebad3a40a7d501d10f5b958fd5a4cee1573c284766c644bdbe3732460d2bc', '[\"*\"]', NULL, NULL, '2025-11-18 19:51:44', '2025-11-18 19:51:44'),
(11, 'App\\Models\\Admin', 2, 'admin-token', 'fb25869b61b1310661b35360b73778614f0def0da18b24ce549d48f1f30bd730', '[\"*\"]', NULL, NULL, '2025-11-18 20:01:33', '2025-11-18 20:01:33'),
(12, 'App\\Models\\Admin', 3, 'admin-token', '049ed94615dc3f20e6d866dbec735140634d3c8f7a3cc26aec9c8be6b2ade46e', '[\"*\"]', NULL, NULL, '2025-11-18 20:05:44', '2025-11-18 20:05:44'),
(13, 'App\\Models\\Admin', 2, 'admin-token', '07074acfd16a873be4e6dae545b6a75e9fdf2decc9d7a949fec6022ccde7129a', '[\"*\"]', NULL, NULL, '2025-11-18 20:11:31', '2025-11-18 20:11:31'),
(14, 'App\\Models\\Admin', 3, 'admin-token', '2771cf05a238cd17968485d2f80361bc4186b071740cbaef94de9fd4bb4471eb', '[\"*\"]', NULL, NULL, '2025-11-18 20:31:52', '2025-11-18 20:31:52'),
(15, 'App\\Models\\Admin', 2, 'admin-token', '2e4f4be960506297c91eb1d2a9e0c1094bc64f73f139eb88a5e63d519c6fe056', '[\"*\"]', '2025-11-19 05:41:03', NULL, '2025-11-18 20:53:39', '2025-11-19 05:41:03'),
(16, 'App\\Models\\Admin', 2, 'admin-token', 'e698f6f2bdf3721839bd1acfd06f310110d003af88f2c68eeac3fd51a519add5', '[\"*\"]', '2025-11-19 22:18:28', NULL, '2025-11-19 05:41:29', '2025-11-19 22:18:28'),
(17, 'App\\Models\\Admin', 2, 'admin-token', 'b0e34740563dca35cef342bc9a0ad494c88f7fb1f403bb7a170f6a05cafc840e', '[\"*\"]', '2025-11-19 06:15:18', NULL, '2025-11-19 05:51:23', '2025-11-19 06:15:18'),
(18, 'App\\Models\\Admin', 2, 'admin-token', '4ead25d766bb82454bdfbce53bb33fdd942af5640cf7e926eb0aa63058ea9db8', '[\"*\"]', NULL, NULL, '2025-11-19 05:57:01', '2025-11-19 05:57:01'),
(19, 'App\\Models\\Admin', 2, 'admin-token', '54e142a1c1891b93f1793aca173e962c4502d400670f514038d045e14102abd0', '[\"*\"]', NULL, NULL, '2025-11-19 06:14:14', '2025-11-19 06:14:14'),
(20, 'App\\Models\\User', 62, 'client-token', 'b2587da3322f4c6fef01358e9a74ea1a86d57253ae516c2dc47d0fd0d9a610ab', '[\"*\"]', '2025-11-28 23:00:58', NULL, '2025-11-19 22:35:13', '2025-11-28 23:00:58'),
(21, 'App\\Models\\Admin', 2, 'admin-token', '067d3273e04d36d567034f8efcc3e977a982f151f1053f633f942da7716df181', '[\"*\"]', '2025-11-19 22:44:48', NULL, '2025-11-19 22:37:07', '2025-11-19 22:44:48'),
(22, 'App\\Models\\Admin', 2, 'admin-token', '189898dbc16da90e13e9ad84b61147e081502f6a1d979d89c9b2b178473bf24d', '[\"*\"]', '2025-11-28 07:01:30', NULL, '2025-11-19 22:54:08', '2025-11-28 07:01:30'),
(23, 'App\\Models\\Admin', 6, 'admin-token', '7df6c7ec4d2b3b02853deb08cce7d66b388ff2d2fd223955bfc51847fa36c7f3', '[\"*\"]', '2025-11-28 11:58:07', NULL, '2025-11-28 07:02:14', '2025-11-28 11:58:07'),
(24, 'App\\Models\\Admin', 6, 'admin-token', '689cb7a53b1e78ed0b24dd3248349dd6c948fbb497fef6deb58b098b8eb063b3', '[\"*\"]', NULL, NULL, '2025-11-28 11:58:13', '2025-11-28 11:58:13'),
(25, 'App\\Models\\Admin', 6, 'admin-token', 'efcbe8169a176a43489c700494ebdf83b789b4511f5aa0a8b1d9c5d5ccefc89d', '[\"*\"]', NULL, NULL, '2025-11-28 11:58:53', '2025-11-28 11:58:53'),
(26, 'App\\Models\\Admin', 6, 'admin-token', 'e9f442a67d521d3749fbed3cfc4788227fe528190402761456f477c714311c7d', '[\"*\"]', '2025-11-28 12:43:00', NULL, '2025-11-28 11:59:32', '2025-11-28 12:43:00'),
(27, 'App\\Models\\Admin', 6, 'admin-token', '3b24e8da2884b019769480b378e0e9d4b183e25d0b4187cb014fe7df4a967f14', '[\"*\"]', '2025-11-28 12:46:43', NULL, '2025-11-28 12:45:50', '2025-11-28 12:46:43'),
(28, 'App\\Models\\Admin', 6, 'admin-token', '732feffdfa84217f7320b05989461baa4ccc48176194d56a18ba11c389d40f4d', '[\"*\"]', '2025-11-28 12:49:14', NULL, '2025-11-28 12:47:52', '2025-11-28 12:49:14'),
(29, 'App\\Models\\Admin', 6, 'admin-token', 'f9ef1c37c517ec76bd69ad33cd107d38cf67346feb1aaa7e068139d9b3bfd22d', '[\"*\"]', '2025-11-28 12:55:18', NULL, '2025-11-28 12:49:21', '2025-11-28 12:55:18'),
(30, 'App\\Models\\Admin', 6, 'admin-token', 'a1345b34399c09e6227add00e4f5f6a6bc7d7cc96ca4468ca9daa6f14903331b', '[\"*\"]', '2025-11-30 11:50:11', NULL, '2025-11-28 12:55:23', '2025-11-30 11:50:11'),
(31, 'App\\Models\\User', 63, 'client-token', '1d2e1c396514ea4145b51999448c78a73d364ff72a306e405f1b8f5ab8c64679', '[\"*\"]', NULL, NULL, '2025-11-29 00:38:02', '2025-11-29 00:38:02'),
(32, 'App\\Models\\Admin', 7, 'admin-token', 'f2a1ebd05153d57e44b22ed56213b96ad4f8c77e3a72f6326051077bf4da62ca', '[\"*\"]', '2025-11-30 11:51:10', NULL, '2025-11-30 11:51:05', '2025-11-30 11:51:10'),
(33, 'App\\Models\\Admin', 6, 'admin-token', '041b91e0dc9b1ef2cd4f0b79068b9a17790915b78dafe017e6a67ce523e8660a', '[\"*\"]', '2025-11-30 12:22:06', NULL, '2025-11-30 11:51:28', '2025-11-30 12:22:06'),
(34, 'App\\Models\\Admin', 8, 'admin-token', 'c6ec45d96db67f8b0e6dd2875b1a4f1e4d45469e903341f8ff1d76e9c6b88107', '[\"*\"]', '2025-12-02 06:26:12', NULL, '2025-12-01 22:32:47', '2025-12-02 06:26:12'),
(35, 'App\\Models\\Admin', 8, 'admin-token', '501a3d22b5e99e4a62b68b76bf35065a1f718efb279689d7fd641cde59c5cd33', '[\"*\"]', '2025-12-02 06:56:17', NULL, '2025-12-02 06:29:26', '2025-12-02 06:56:17'),
(36, 'App\\Models\\Admin', 9, 'admin-token', '459ba0449b19d1a26174834f64ca19211d30ce3bed589755937dc8c4749ac963', '[\"*\"]', '2025-12-04 01:18:46', NULL, '2025-12-02 10:48:09', '2025-12-04 01:18:46'),
(37, 'App\\Models\\User', 63, 'client-token', '77035930e3bb2de54cd536b2c68598a77ccf8f12017e0cabd8f6aab307fd2b0b', '[\"*\"]', '2025-12-03 03:51:39', NULL, '2025-12-02 12:00:26', '2025-12-03 03:51:39'),
(38, 'App\\Models\\User', 63, 'client-token', '7cf820e8f02ef1fe83fec3fe66b81fc8f63e7e10a70fe24d4045af69b65226cd', '[\"*\"]', '2025-12-03 04:26:56', NULL, '2025-12-03 03:56:09', '2025-12-03 04:26:56'),
(39, 'App\\Models\\User', 63, 'client-token', '631a23e7e65e941288d0a55ac6ecae7d30367fb2236832e067d817c6cf498124', '[\"*\"]', '2025-12-04 01:19:41', NULL, '2025-12-03 04:26:59', '2025-12-04 01:19:41'),
(40, 'App\\Models\\Admin', 10, 'admin-token', 'a45c93a51cc633e4a836d5138e3124825e87bca119bc114e42441b934c05c914', '[\"*\"]', '2025-12-04 07:22:41', NULL, '2025-12-04 01:53:20', '2025-12-04 07:22:41'),
(41, 'App\\Models\\User', 65, 'client-token', 'b9addf3d6eddfc248472336e22b843d9e6860dbb89d6f16bd4959297bd2eae17', '[\"*\"]', '2025-12-05 02:53:44', NULL, '2025-12-04 02:06:40', '2025-12-05 02:53:44'),
(42, 'App\\Models\\Admin', 11, 'admin-token', '236cc5a16b909749807e5bf83327fcbc7438a291b3474bb54d2c9326e64cf05a', '[\"*\"]', '2025-12-04 09:38:51', NULL, '2025-12-04 07:47:11', '2025-12-04 09:38:51'),
(43, 'App\\Models\\Admin', 1, 'admin-token', '27d2dc73c32a234945d84716fe5b33ed3551c22a4fe7002dd9b0a34e9f5dbed9', '[\"*\"]', '2025-12-05 19:24:20', NULL, '2025-12-04 09:40:36', '2025-12-05 19:24:20'),
(44, 'App\\Models\\User', 65, 'client-token', '2f32fb48d1db91efd874169e5743b704768e9b4d613ee8f8d7832e776d4b89c6', '[\"*\"]', '2025-12-05 19:23:35', NULL, '2025-12-05 05:54:58', '2025-12-05 19:23:35'),
(45, 'App\\Models\\User', 66, 'client-token', 'bfce56dfd3b1cc3e8b46add270c85fba3cf832b6201bc9f311eb7067c51fe6f5', '[\"*\"]', '2025-12-05 05:56:16', NULL, '2025-12-05 05:56:11', '2025-12-05 05:56:16'),
(46, 'App\\Models\\Admin', 12, 'admin-token', '791db30cf740548421e5e24acaa7f42c1751d5248122ae66a1f38bf9e1d17990', '[\"*\"]', '2025-12-09 02:06:02', NULL, '2025-12-06 06:30:57', '2025-12-09 02:06:02'),
(47, 'App\\Models\\User', 63, 'client-token', 'fe275fe224a56ed65d0cdc74e32771d5cf2fcfbb241e6cd64796ec66d0efa9cd', '[\"*\"]', '2025-12-10 09:35:09', NULL, '2025-12-09 05:25:34', '2025-12-10 09:35:09'),
(48, 'App\\Models\\Admin', 13, 'admin-token', 'b688d4f89f2d7aac77861677c74a877986f3216cdf331e1a40f2bb94a3399af4', '[\"*\"]', '2025-12-09 05:29:52', NULL, '2025-12-09 05:29:45', '2025-12-09 05:29:52'),
(49, 'App\\Models\\Admin', 13, 'admin-token', 'bbfcdef180baea15cf2f1a804db5432f88ace51cba0e14217da9e1b4ba0c2228', '[\"*\"]', '2025-12-13 04:21:25', NULL, '2025-12-09 05:30:38', '2025-12-13 04:21:25'),
(50, 'App\\Models\\User', 63, 'client-token', '035ffcd69a84e9cee3983803b7726d20dced069be0bcc16d8606089e5d3a7a99', '[\"*\"]', '2025-12-11 00:36:07', NULL, '2025-12-10 09:59:43', '2025-12-11 00:36:07'),
(51, 'App\\Models\\User', 63, 'client-token', '6d3a24215a4f37f6ee535c381cd83ad4cd8ff1e7c28327b51b44abf9ed02e451', '[\"*\"]', '2025-12-11 00:49:25', NULL, '2025-12-11 00:42:00', '2025-12-11 00:49:25'),
(52, 'App\\Models\\User', 67, 'client-token', '31fbf3da5be907bbb6382482f29c3ca1dc818e7c39dfe5d82be091adc66cd4a4', '[\"*\"]', '2025-12-11 00:50:46', NULL, '2025-12-11 00:50:41', '2025-12-11 00:50:46'),
(53, 'App\\Models\\User', 67, 'client-token', '005c1deabf4a29b6937b5162c9b2089f49e191298f423a476682b9c76804709e', '[\"*\"]', '2025-12-11 01:34:12', NULL, '2025-12-11 00:51:56', '2025-12-11 01:34:12'),
(54, 'App\\Models\\User', 63, 'client-token', 'b2a85bf6e48048b49f3b6209fe81755778edfb421b671e5b2fa394b3e76e76d2', '[\"*\"]', '2025-12-11 02:13:05', NULL, '2025-12-11 01:34:46', '2025-12-11 02:13:05'),
(55, 'App\\Models\\User', 63, 'client-token', '2cd6a13b3bbbeba53a448388e327d69c2989530d2c3e5308b6e968ea689c9099', '[\"*\"]', '2025-12-11 06:55:32', NULL, '2025-12-11 03:06:07', '2025-12-11 06:55:32'),
(56, 'App\\Models\\User', 67, 'client-token', '00dbd5c71ac7828ded9bab3d2e90ae3f5957c51c56b077fc204ab602868c6d46', '[\"*\"]', '2025-12-12 22:30:12', NULL, '2025-12-11 06:55:58', '2025-12-12 22:30:12'),
(57, 'App\\Models\\User', 63, 'client-token', '9ebf69dbb12f060f86e66e7d4359b21f8daa0d41c28b97e6b04c83d39dd726d8', '[\"*\"]', '2025-12-13 04:04:42', NULL, '2025-12-12 22:30:24', '2025-12-13 04:04:42'),
(58, 'App\\Models\\User', 63, 'client-token', 'a707e5bb8e8905d2d94199c1873fd688d403dbb10e618e08689c81f3c69d0e04', '[\"*\"]', '2025-12-13 04:12:29', NULL, '2025-12-13 04:05:49', '2025-12-13 04:12:29'),
(59, 'App\\Models\\Admin', 13, 'admin-token', '7416066088bc2477af4433fb466a9ce0127bc4b6d75c3661f765f25b61addf07', '[\"*\"]', '2025-12-14 03:23:23', NULL, '2025-12-13 04:22:44', '2025-12-14 03:23:23'),
(60, 'App\\Models\\User', 63, 'client-token', 'e567ee2dc5ada3dae0151c5dd1b9b35520e97abdb845b105b71a510f898fcfb6', '[\"*\"]', '2025-12-14 01:03:55', NULL, '2025-12-13 22:27:46', '2025-12-14 01:03:55'),
(61, 'App\\Models\\User', 68, 'client-token', 'd098a8c8ab87c6c1a720afd527091bc49cc2c25becd8f3ad3424e2503e70b935', '[\"*\"]', '2025-12-14 00:47:38', NULL, '2025-12-14 00:41:21', '2025-12-14 00:47:38'),
(62, 'App\\Models\\User', 68, 'client-token', '0e3cb89b58f97cfd8db39e96a00f3b50b2ffed7adbf4f246d30a88bf831dbfc4', '[\"*\"]', '2025-12-14 01:08:19', NULL, '2025-12-14 01:04:23', '2025-12-14 01:08:19'),
(63, 'App\\Models\\User', 68, 'client-token', '890850829dd0b5c90b874fdcb41a05dc2b6f0246aa2bb9cf8ef3f2379a15ecdb', '[\"*\"]', '2025-12-14 01:06:38', NULL, '2025-12-14 01:06:32', '2025-12-14 01:06:38'),
(64, 'App\\Models\\User', 68, 'client-token', '06baed59d10060f695e79c55d9e0ad80f46693813e4898cab47983c0a3cadc0c', '[\"*\"]', '2025-12-14 01:07:55', NULL, '2025-12-14 01:07:32', '2025-12-14 01:07:55'),
(65, 'App\\Models\\User', 68, 'client-token', '638fcf1a7f082c67f6702c8204b3ec2d4f926866e671a6ac42bd556443aa9bb0', '[\"*\"]', '2025-12-14 01:08:30', NULL, '2025-12-14 01:08:24', '2025-12-14 01:08:30'),
(66, 'App\\Models\\User', 68, 'client-token', 'aa972f83f3bb98cd233424545a2c9da6b137481122b8074857c2be060522c0fb', '[\"*\"]', '2025-12-14 01:53:36', NULL, '2025-12-14 01:12:28', '2025-12-14 01:53:36'),
(67, 'App\\Models\\User', 68, 'client-token', '6c94884d8a6a69bc7e4f745027c215c9760388bba3398ea6a20ea1580860b42a', '[\"*\"]', '2025-12-14 03:05:15', NULL, '2025-12-14 01:55:05', '2025-12-14 03:05:15'),
(76, 'App\\Models\\Admin', 17, 'admin_token', '762c6dab4cd7dd9f09f9025fb72dfcd4cf6202f8f521a439755ccbf7482d1ea3', '[\"*\"]', NULL, NULL, '2026-03-11 10:05:00', '2026-03-11 10:05:00'),
(78, 'App\\Models\\Admin', 19, 'admin_token', 'e07564e8983c3a79351eb43f63ec5f5a9fbc8c716d2129cb2174bd28b8714ec5', '[\"*\"]', '2026-03-12 08:39:53', NULL, '2026-03-12 08:39:34', '2026-03-12 08:39:53'),
(82, 'App\\Models\\Admin', 19, 'admin_token', 'fd0191dfe763cd253a1b434c38da027358471d4b03976a1d566e5f10615118f7', '[\"*\"]', '2026-03-13 07:24:55', NULL, '2026-03-13 07:24:53', '2026-03-13 07:24:55'),
(102, 'App\\Models\\Admin', 20, 'admin_token', 'acd323e9998b1215b5d9e7ae334a3f2f72e1e8fdc3d6b5d3d581f01a45c55c77', '[\"level:1\"]', '2026-03-19 18:04:58', NULL, '2026-03-19 10:06:04', '2026-03-19 18:04:58'),
(103, 'App\\Models\\Admin', 21, 'admin_token', '31b01ecc0a0bcc68c5571749a8025d4856441848e60dc71c7b056a47c42d4b0b', '[\"level:3\"]', '2026-03-20 01:26:06', NULL, '2026-03-20 00:30:43', '2026-03-20 01:26:06'),
(104, 'App\\Models\\Admin', 21, 'admin_token', 'b1e64f54fa8474fc844fa42d1a1383b6b6a69dbc7ea6276288855f6a4a88f68e', '[\"level:1\"]', '2026-03-21 04:22:51', NULL, '2026-03-21 03:05:28', '2026-03-21 04:22:51'),
(105, 'App\\Models\\Admin', 21, 'admin_token', '0917a5e5643dbc3734b1a54ed27e8e9977bc62680d607b10b5b28976556fcebb', '[\"level:1\"]', '2026-03-21 03:29:46', NULL, '2026-03-21 03:23:33', '2026-03-21 03:29:46'),
(106, 'App\\Models\\Admin', 21, 'admin_token', '39dbbad0ce7868aefd62072b61b29720c4fc0e78b60da2347eac2f3b10177716', '[\"level:1\"]', '2026-03-21 04:22:50', NULL, '2026-03-21 03:50:02', '2026-03-21 04:22:50'),
(107, 'App\\Models\\Admin', 21, 'admin_token', 'c9fb55ad49ee2bbf27b153a21f28f8554c0adb900675c9133fb3d86c3ec78046', '[\"level:1\"]', '2026-03-22 02:13:57', NULL, '2026-03-21 04:32:58', '2026-03-22 02:13:57'),
(108, 'App\\Models\\Admin', 21, 'admin_token', '1a74a8f616d39ac3740b6ef658e2200ca8f3175f173fa5ea4107ce89f422603a', '[\"level:1\"]', '2026-03-22 08:59:30', NULL, '2026-03-22 02:31:13', '2026-03-22 08:59:30'),
(112, 'App\\Models\\User', 70, 'auth_token', 'd9c0ea6463ecd74b667dacbba6b45f1ed53aca823b501889d7e27f2c1e1e8609', '[\"*\"]', '2026-03-23 20:06:55', NULL, '2026-03-23 20:06:52', '2026-03-23 20:06:55'),
(113, 'App\\Models\\User', 70, 'auth_token', '2fefabf4b10ea83408c4e56a78a966402881ca673dbed00f7b131399dd75e76c', '[\"*\"]', '2026-03-23 21:28:36', NULL, '2026-03-23 20:11:29', '2026-03-23 21:28:36'),
(115, 'App\\Models\\Admin', 16, 'admin_token', '25c4be8fb22c67a0c0591958fd2203563d623b16d9dce38ca5f8533858f3fe56', '[\"level:1\"]', '2026-03-24 05:50:10', NULL, '2026-03-24 04:04:19', '2026-03-24 05:50:10'),
(116, 'App\\Models\\User', 69, 'auth_token', '3582872c0177bac2691b04b455b4640925cc787929d218a8e777aad4794fcad6', '[\"*\"]', '2026-03-26 08:08:18', NULL, '2026-03-24 05:09:31', '2026-03-26 08:08:18'),
(117, 'App\\Models\\Admin', 16, 'admin_token', '8491dba919d79b6209fe0ec823d3632fc778de59d16808cbe025e7687c41a213', '[\"level:1\"]', '2026-03-24 10:41:07', NULL, '2026-03-24 05:51:21', '2026-03-24 10:41:07'),
(118, 'App\\Models\\Admin', 16, 'admin_token', 'bfe688639dafaf4854456772a6fcf88b789e4355000daee9a2b83db41bac13b8', '[\"level:1\"]', '2026-03-25 07:59:03', NULL, '2026-03-24 19:25:08', '2026-03-25 07:59:03'),
(119, 'App\\Models\\Admin', 16, 'admin_token', '20aba9e8507becda1c645f28fdf280ae8394f234f8fe419d0e995a240bd43e87', '[\"level:1\"]', '2026-03-26 10:23:22', NULL, '2026-03-26 05:47:44', '2026-03-26 10:23:22'),
(120, 'App\\Models\\User', 69, 'auth_token', 'f3328319ea006336d4d80eb68fde54899c40a6b92de06f28109339f78fadf9b8', '[\"*\"]', '2026-03-26 10:23:54', NULL, '2026-03-26 08:25:32', '2026-03-26 10:23:54'),
(121, 'App\\Models\\Admin', 16, 'admin_token', '9c3207a21ad0b6fa1260322a0c757572fb951ee39d09175da7ca0dcf68b6b81a', '[\"level:1\"]', '2026-03-26 21:09:13', NULL, '2026-03-26 21:03:35', '2026-03-26 21:09:13'),
(122, 'App\\Models\\Admin', 16, 'admin_token', '10917187b4a4d365e25760b214f5ed535bf2d36bc86ecc9f9d8057ea54d08409', '[\"level:1\"]', '2026-03-26 21:23:09', NULL, '2026-03-26 21:15:00', '2026-03-26 21:23:09'),
(123, 'App\\Models\\User', 69, 'auth_token', '2f10bf2a687a33612d78548059fd1d45427bfad54656ad3576b3d9d387485532', '[\"*\"]', '2026-03-27 21:53:42', NULL, '2026-03-26 21:23:58', '2026-03-27 21:53:42'),
(124, 'App\\Models\\User', 69, 'auth_token', 'c710ffa21c86239b072d751e54e3e9d5100b3cb082c2f5616f8db5d8b6594377', '[\"*\"]', '2026-03-27 22:17:17', NULL, '2026-03-27 21:54:54', '2026-03-27 22:17:17'),
(125, 'App\\Models\\Admin', 16, 'admin_token', '5e50e982964d0c79c54b5114c1fb58b9fd6eb3b91f32958cc55182148a7a1f5d', '[\"level:1\"]', '2026-03-28 03:02:12', NULL, '2026-03-27 22:16:11', '2026-03-28 03:02:12'),
(126, 'App\\Models\\User', 70, 'auth_token', 'ce49e14d56630260f4404a5b1feb458c0418dfa5b77c808352ccf577d2cc211d', '[\"*\"]', '2026-03-28 02:28:54', NULL, '2026-03-27 22:18:40', '2026-03-28 02:28:54'),
(127, 'App\\Models\\User', 70, 'auth_token', '3479ac06682303d29dce1115b2ab51059b7677ccf648fd3543caa8023b7a2304', '[\"*\"]', '2026-03-28 02:46:18', NULL, '2026-03-28 02:41:26', '2026-03-28 02:46:18'),
(128, 'App\\Models\\User', 69, 'auth_token', 'd5c9f3b2a9c55d6c3a086596e0983e1ac2f5c9a73a2795955bc95918b88c2cee', '[\"*\"]', '2026-03-31 05:41:27', NULL, '2026-03-28 02:47:49', '2026-03-31 05:41:27'),
(129, 'App\\Models\\Admin', 16, 'admin_token', '18cd2cd37a550b7d1bb2aa56d292489fcf7bd22c9eb0f31bd17ac9ec6461dee4', '[\"level:1\"]', '2026-03-29 23:33:31', NULL, '2026-03-29 23:30:23', '2026-03-29 23:33:31'),
(130, 'App\\Models\\Admin', 16, 'admin_token', 'eeedfd5cc9e9b0f45acd17d52760fc12cb03847723e0c9870808b2562947a29f', '[\"level:1\"]', '2026-03-30 01:15:59', NULL, '2026-03-30 01:15:52', '2026-03-30 01:15:59'),
(131, 'App\\Models\\Admin', 16, 'admin_token', 'a2d0ff2b31c399d785b0604f1b19c86181eb936d9518b8117ec9302a1c6007db', '[\"level:1\"]', '2026-03-30 07:27:41', NULL, '2026-03-30 06:31:45', '2026-03-30 07:27:41'),
(132, 'App\\Models\\Admin', 16, 'admin_token', '831e81bab663e6c9eed15f02430b1e695a554070bc84144c44ebf65ac264d446', '[\"level:1\"]', '2026-03-30 09:12:11', NULL, '2026-03-30 08:25:28', '2026-03-30 09:12:11'),
(133, 'App\\Models\\Admin', 16, 'admin_token', '742e7f700a12b1dd9bceedea1a00c89a6ffc08520cc997b68d29c8d7ec1a58bf', '[\"level:1\"]', '2026-03-31 03:29:27', NULL, '2026-03-31 02:42:06', '2026-03-31 03:29:27'),
(134, 'App\\Models\\Admin', 16, 'admin_token', 'db507553316b94bd477e9e876b02798c5d12bc38d871cf6790da568885255f05', '[\"level:1\"]', '2026-03-31 07:06:30', NULL, '2026-03-31 03:29:44', '2026-03-31 07:06:30'),
(135, 'App\\Models\\User', 70, 'auth_token', 'b7b8a45059fc8609751a73b4e78f7f02cbe5bb83456bfefe8ba50afc2e8f7a3d', '[\"*\"]', '2026-03-31 05:54:43', NULL, '2026-03-31 05:41:51', '2026-03-31 05:54:43'),
(136, 'App\\Models\\User', 71, 'auth_token', '8ee67891e9a2d5ff864dae7c01dc58a0487a3f188b86b4d2cd0f3080133651f6', '[\"*\"]', '2026-04-04 03:20:43', NULL, '2026-03-31 05:55:02', '2026-04-04 03:20:43'),
(137, 'App\\Models\\Admin', 16, 'admin_token', 'e0b7364a84d8dda81ee1f27a8a856d9beb21653b557f1b9c20c6273f0421d9bc', '[\"level:1\"]', '2026-03-31 09:30:29', NULL, '2026-03-31 07:06:51', '2026-03-31 09:30:29'),
(138, 'App\\Models\\Admin', 16, 'admin_token', 'bc9cb294a20792e2c20720b7ac6b867dcc948c0349a1bd4af8887ac7a8134c77', '[\"level:1\"]', '2026-04-01 01:38:35', NULL, '2026-03-31 19:02:54', '2026-04-01 01:38:35'),
(139, 'App\\Models\\Admin', 16, 'admin_token', '556fc88eda528d88fb3dfa827df4336301b379e0f2cecc0509855a47a373b172', '[\"level:1\"]', '2026-04-03 07:24:51', NULL, '2026-04-03 07:18:58', '2026-04-03 07:24:51'),
(140, 'App\\Models\\Admin', 16, 'admin_token', '6d8e3be0a1884ad9b6f7a99b180562fb23fc65ccdbda25551c3333de2d790d36', '[\"level:1\"]', '2026-04-04 06:06:54', NULL, '2026-04-04 02:55:02', '2026-04-04 06:06:54'),
(141, 'App\\Models\\User', 69, 'auth_token', '5401d4f0ee8f051cb08d4c26a7fe92b5827a1357467c029471980ebad1afc4ec', '[\"*\"]', '2026-04-04 06:06:54', NULL, '2026-04-04 03:50:41', '2026-04-04 06:06:54'),
(142, 'App\\Models\\Admin', 16, 'admin_token', '0c0f1e77588fed60c45b62a686131fa1e010fa1b86b52d825c86c15ba6224856', '[\"level:1\"]', '2026-04-04 06:34:04', NULL, '2026-04-04 06:14:06', '2026-04-04 06:34:04'),
(143, 'App\\Models\\User', 69, 'auth_token', 'd0a8e03fe71f02f1d21565b6fe0cace0073dec7f492e5910a5c8731e5383d84c', '[\"*\"]', '2026-04-04 08:49:54', NULL, '2026-04-04 06:14:42', '2026-04-04 08:49:54'),
(144, 'App\\Models\\Admin', 16, 'admin_token', '68ac3d61d515d940c55e0ff9be73714d946505178a057f6a3bd09896aedc2b56', '[\"level:1\"]', '2026-04-04 08:49:51', NULL, '2026-04-04 07:48:38', '2026-04-04 08:49:51'),
(145, 'App\\Models\\Admin', 16, 'admin_token', 'c11e6a953a061ec08f6b151d7477bdb500eac29ac58cd1b4e377b3ae903c8a4e', '[\"level:1\"]', '2026-04-07 03:17:14', NULL, '2026-04-07 03:15:38', '2026-04-07 03:17:14'),
(146, 'App\\Models\\Admin', 16, 'admin_token', '97105882d4c96de37b5e044869b68930ece2ba4643eed3716b63f45ff95d9e92', '[\"level:1\"]', '2026-04-09 03:47:18', NULL, '2026-04-09 02:23:28', '2026-04-09 03:47:18'),
(147, 'App\\Models\\Admin', 16, 'admin_token', '1b0f975909fdf81f15233fd1169059384836d7877ad49ecc7ff4f79f7fba60b5', '[\"level:1\"]', '2026-04-09 21:22:54', NULL, '2026-04-09 20:59:41', '2026-04-09 21:22:54'),
(148, 'App\\Models\\Admin', 21, 'admin_token', 'fa34487a6dcbfeb64f9613f9f0860ca36b5a739287c4f95af01217c0be6f4b90', '[\"level:1\"]', '2026-04-10 07:43:52', NULL, '2026-04-10 01:32:39', '2026-04-10 07:43:52'),
(149, 'App\\Models\\Admin', 21, 'admin_token', '26cbcff2d0310448532638eeea9c8aa774db3b11d6ba5fba4d410c4ec7f5efe7', '[\"level:1\"]', '2026-04-10 10:13:37', NULL, '2026-04-10 07:44:52', '2026-04-10 10:13:37'),
(150, 'App\\Models\\User', 72, 'auth_token', '2236c9467d0174bcc4d1e595fa3d8c8042705ac5c47e3d5bfc8792af0e79476e', '[\"*\"]', '2026-04-10 10:13:56', NULL, '2026-04-10 07:46:11', '2026-04-10 10:13:56'),
(151, 'App\\Models\\Admin', 16, 'admin_token', '41a5699c4d6d3206eb478172f9f9b353fdc080cdec9cb1dfe8dae4d60478da83', '[\"level:1\"]', '2026-04-11 00:05:11', NULL, '2026-04-10 22:55:19', '2026-04-11 00:05:11'),
(152, 'App\\Models\\Admin', 16, 'admin_token', 'b48f8091c5c6ff75eb382de1cd54bd836c15149348690804e6192f3e29cc67a2', '[\"level:1\"]', '2026-04-11 03:58:22', NULL, '2026-04-11 00:05:12', '2026-04-11 03:58:22'),
(153, 'App\\Models\\User', 69, 'auth_token', 'aac3ae3cce33cef410062cbbd8962f943a19959170aefbdd22fbcfcdc58961d2', '[\"*\"]', '2026-04-15 00:42:55', NULL, '2026-04-11 00:14:40', '2026-04-15 00:42:55'),
(154, 'App\\Models\\Admin', 16, 'admin_token', 'e942d595e8fcc52fcbf24cf600bf33954492b6c418c0d8c93cad995430f30559', '[\"level:1\"]', '2026-04-11 02:17:18', NULL, '2026-04-11 00:22:33', '2026-04-11 02:17:18'),
(155, 'App\\Models\\Admin', 16, 'admin_token', '531253310b631b739577ab7e233f558f4f0a384a68314b30f8a6e766e9bc4f85', '[\"level:1\"]', '2026-04-14 03:46:37', NULL, '2026-04-14 02:53:03', '2026-04-14 03:46:37'),
(156, 'App\\Models\\User', 69, 'auth_token', 'd9c75a0c899d48f6ccb7852adc3173224f7725a87ed83985ade083207b3f7942', '[\"*\"]', '2026-04-14 03:48:11', NULL, '2026-04-14 02:56:29', '2026-04-14 03:48:11'),
(157, 'App\\Models\\Admin', 16, 'admin_token', 'cd74987931756eb23c2c7fa68c0bad9edcdd2fa57298c6b20d7b767d40cd4099', '[\"level:1\"]', '2026-04-15 01:53:19', NULL, '2026-04-15 00:39:08', '2026-04-15 01:53:19'),
(158, 'App\\Models\\User', 69, 'auth_token', '5ac90ef991ef2183ee8d8d1a07fa2a03954f09126bb43fafb5f519102fc0cb70', '[\"*\"]', '2026-04-15 01:45:41', NULL, '2026-04-15 01:30:44', '2026-04-15 01:45:41'),
(159, 'App\\Models\\User', 69, 'auth_token', '2279211ae865fc501e1b3ea0b48b7e23dfe7a92d9b7a8788eb5898ecf38c1ec1', '[\"*\"]', '2026-04-15 01:48:25', NULL, '2026-04-15 01:47:45', '2026-04-15 01:48:25'),
(160, 'App\\Models\\User', 70, 'auth_token', '12bf2eab7c2c155cad3f2d1c2809b9d997ad337e061286320eb7e27c46f0fba5', '[\"*\"]', '2026-04-16 03:03:04', NULL, '2026-04-16 03:02:57', '2026-04-16 03:03:04'),
(161, 'App\\Models\\User', 69, 'auth_token', '5a91bd2c0c0b9ad5c452b1fec869b165545915b0466011c2b1a993423fd45086', '[\"*\"]', '2026-04-16 03:05:31', NULL, '2026-04-16 03:05:26', '2026-04-16 03:05:31'),
(162, 'App\\Models\\User', 70, 'auth_token', '8e8a4b2e84f9cda484e5d24e13b096a231038e54a8e7e7d11bce923aa59d4752', '[\"*\"]', '2026-04-16 03:14:18', NULL, '2026-04-16 03:11:30', '2026-04-16 03:14:18'),
(163, 'App\\Models\\User', 70, 'auth_token', 'aeb65d07f4e1b6c9fd37d2ba7ae34633679a367b40aad02da8dfd0c881cf885e', '[\"*\"]', '2026-04-16 03:16:32', NULL, '2026-04-16 03:16:22', '2026-04-16 03:16:32'),
(164, 'App\\Models\\User', 73, 'auth_token', '2fbfed8c6c8cccdeb9e6c1926fbe8d721aeb62d2c1026e4e373af9c964cf5440', '[\"*\"]', '2026-04-16 03:18:38', NULL, '2026-04-16 03:17:17', '2026-04-16 03:18:38'),
(165, 'App\\Models\\User', 73, 'auth_token', '12994e0db93c3cff8db568e8d831d1344fe169804e63a2bd8037f3dfec72de47', '[\"*\"]', '2026-04-16 03:24:38', NULL, '2026-04-16 03:24:32', '2026-04-16 03:24:38'),
(166, 'App\\Models\\User', 73, 'auth_token', '1887b556ad58c8e08e80ff0dccf1a84bdc48dc9441d26f8518a42a0607400304', '[\"*\"]', '2026-04-23 01:26:34', NULL, '2026-04-16 03:34:58', '2026-04-23 01:26:34'),
(167, 'App\\Models\\Admin', 16, 'admin_token', '0984727c6406a3645ea1056dac4dd3c6b167fde0672abac538ac1c853ae9e795', '[\"level:1\"]', '2026-04-16 04:20:14', NULL, '2026-04-16 03:50:55', '2026-04-16 04:20:14'),
(168, 'App\\Models\\Admin', 16, 'admin_token', '9f3c94945fd7407aec0f00b94932d7fd108b69ca3e41816584911e0ba10b5435', '[\"level:1\"]', '2026-04-16 23:43:37', NULL, '2026-04-16 23:38:58', '2026-04-16 23:43:37'),
(169, 'App\\Models\\Admin', 16, 'admin_token', '6ae13c097307d93cf9624fd7eec5f83b88bd25f3c87a4a7dc5d15f8620e7a4cc', '[\"level:1\"]', '2026-04-21 05:23:14', NULL, '2026-04-21 05:18:46', '2026-04-21 05:23:14'),
(170, 'App\\Models\\Admin', 16, 'admin_token', 'fe7150fe78dd7eb7df874102659a09165d5b3c9b901c273f0dbbb08ff07f2fed', '[\"level:1\"]', '2026-04-21 08:02:27', NULL, '2026-04-21 05:23:41', '2026-04-21 08:02:27'),
(171, 'App\\Models\\Admin', 16, 'admin_token', '9511cf221e4763892d6dbf3b3c38e04568bada2c2bb3ed9502198de1ed66919e', '[\"level:1\"]', '2026-04-23 01:26:39', NULL, '2026-04-22 19:13:57', '2026-04-23 01:26:39'),
(172, 'App\\Models\\User', 73, 'auth_token', 'c79e6e7869ab3362637502934c2089afff2b51bc78e0760114b6deadf03eebde', '[\"*\"]', '2026-04-23 01:26:41', NULL, '2026-04-23 01:26:30', '2026-04-23 01:26:41'),
(173, 'App\\Models\\User', 73, 'auth_token', '8d6cc7d14c84afd75227ee153d8fa2fb2661957c846ac6fafd448c1ca1960c50', '[\"*\"]', '2026-04-24 07:35:30', NULL, '2026-04-23 01:27:08', '2026-04-24 07:35:30'),
(174, 'App\\Models\\Admin', 16, 'admin_token', '6ba6d21ecc69ff336ce09257dfeea6eccc58a9035f55e4c5d935d9f58aa34ad1', '[\"level:1\"]', '2026-04-23 05:10:24', NULL, '2026-04-23 01:28:37', '2026-04-23 05:10:24'),
(175, 'App\\Models\\Admin', 16, 'admin_token', '9d255cac88976202d1a52c9c75c9e42349a30e27cbfd490369f3793237e8172f', '[\"level:1\"]', '2026-04-23 06:15:09', NULL, '2026-04-23 05:10:59', '2026-04-23 06:15:09'),
(176, 'App\\Models\\Admin', 16, 'admin_token', '6f5610f6f32a910d3616f57e7a4598f349f7552ce8951e4ef8a8f7ae34a439dd', '[\"level:1\"]', '2026-04-24 06:11:04', NULL, '2026-04-23 06:18:41', '2026-04-24 06:11:04'),
(177, 'App\\Models\\Admin', 16, 'admin_token', '639a97be9cadf39d37e1519a10466716ee11c6fc596f886421e6629d601b3a44', '[\"level:1\"]', '2026-04-24 22:01:35', NULL, '2026-04-24 19:58:26', '2026-04-24 22:01:35'),
(178, 'App\\Models\\User', 73, 'auth_token', '64fda1675d98925c36c25b6a4166aae6830f0396014ae5112572934c6aae160e', '[\"*\"]', '2026-04-24 22:02:08', NULL, '2026-04-24 22:01:28', '2026-04-24 22:02:08'),
(179, 'App\\Models\\User', 73, 'auth_token', '0cb6b87eeaa497c4091fb8a5d232ccf1e5b910d661661984366d85ae3b32c664', '[\"*\"]', '2026-04-24 23:54:37', NULL, '2026-04-24 22:02:35', '2026-04-24 23:54:37'),
(180, 'App\\Models\\Admin', 16, 'admin_token', '5af58148f4b19e734131536b56f0cd70a295cb4b1765a55d67b3f341b2742b53', '[\"level:1\"]', '2026-04-25 02:25:12', NULL, '2026-04-24 22:03:02', '2026-04-25 02:25:12'),
(181, 'App\\Models\\User', 73, 'auth_token', '6d33dc873606087e8251578c4de7b6e5e34e4ae114f7758a541e886c867ebcb7', '[\"*\"]', '2026-04-25 02:37:28', NULL, '2026-04-24 23:55:13', '2026-04-25 02:37:28'),
(182, 'App\\Models\\User', 72, 'auth_token', '205c08f7e9181dd4b13db69990dd522f554a2359495a112922240c93bf76fe38', '[\"*\"]', '2026-04-25 01:00:08', NULL, '2026-04-24 23:56:43', '2026-04-25 01:00:08'),
(183, 'App\\Models\\User', 70, 'auth_token', '290a007b89621623b60f36189a08d2abf67cf6af15b3b6153fc970cc505f308b', '[\"*\"]', '2026-05-18 18:00:21', NULL, '2026-05-12 05:23:20', '2026-05-18 18:00:21'),
(184, 'App\\Models\\Admin', 16, 'admin_token', '9f375b0507fa4ca3fa8cd9b1f4c00fbc189147496ff5662d8265122d3c6b7e89', '[\"level:1\"]', '2026-05-17 20:27:19', NULL, '2026-05-12 05:25:46', '2026-05-17 20:27:19'),
(185, 'App\\Models\\User', 70, 'auth_token', 'be8213f8c54c239936e1653c77faf015b6f807bde703b62abd6b6fb80002cab0', '[\"*\"]', '2026-05-12 06:32:27', NULL, '2026-05-12 06:31:47', '2026-05-12 06:32:27'),
(186, 'App\\Models\\User', 70, 'auth_token', '1a56f2bbc6b6aa44d55cd614075e90ea33e2325e51b1b0eff92ffdfcc5986b0c', '[\"*\"]', '2026-05-12 09:28:25', NULL, '2026-05-12 06:33:05', '2026-05-12 09:28:25'),
(187, 'App\\Models\\User', 70, 'auth_token', 'bbc2d5c5b8f961df6485119d9cd82a4d76285513fa7f20cb84738cb8d5687bb9', '[\"*\"]', '2026-05-12 09:29:10', NULL, '2026-05-12 09:28:59', '2026-05-12 09:29:10'),
(188, 'App\\Models\\User', 71, 'auth_token', '225a72f43e3d67c255693e34274072dda7f2e20e8d003ecfde71afbce334c2f1', '[\"*\"]', '2026-05-13 09:28:48', NULL, '2026-05-12 09:29:36', '2026-05-13 09:28:48'),
(189, 'App\\Models\\Admin', 16, 'admin_token', 'c141fe823e809f4026f91a0f5eef15e54c8b011863fe8b7111cf492f3b06f9ae', '[\"level:1\"]', '2026-05-13 09:55:39', NULL, '2026-05-13 09:17:31', '2026-05-13 09:55:39'),
(190, 'App\\Models\\User', 73, 'auth_token', 'e337907f058b47c91ccc4a9fb9bd17a0bcc4111180cf641610b96270e89b7ad0', '[\"*\"]', '2026-05-13 09:56:26', NULL, '2026-05-13 09:31:30', '2026-05-13 09:56:26'),
(191, 'App\\Models\\Admin', 16, 'admin_token', 'affbad7d1e3749271817070e43c8892eecdac5e2d97491c1455f5eb7b33a9395', '[\"level:1\"]', '2026-05-13 10:07:31', NULL, '2026-05-13 09:59:48', '2026-05-13 10:07:31'),
(192, 'App\\Models\\User', 70, 'auth_token', '1cc2c16ea5497a830c867e20315446692daa13b6d2da15e0ed6b0a0e48788c26', '[\"*\"]', '2026-05-15 11:06:18', NULL, '2026-05-13 10:01:18', '2026-05-15 11:06:18'),
(193, 'App\\Models\\Admin', 16, 'admin_token', 'e63fc3c43fd825a58cd9d3d95ecdc7491b9cd61e29042a41d6a0fc5912dccfac', '[\"level:1\"]', '2026-05-14 06:14:56', NULL, '2026-05-13 12:39:38', '2026-05-14 06:14:56'),
(194, 'App\\Models\\Admin', 16, 'admin_token', '502b26e4e87be203a7c3cdb89f39fc313f20ef30ed0dafb360799d8f0825e0ef', '[\"level:1\"]', '2026-05-15 06:54:52', NULL, '2026-05-15 06:03:46', '2026-05-15 06:54:52'),
(195, 'App\\Models\\Admin', 16, 'admin_token', 'a2e2461dd9409b1f12a7ad2270676f89b7ce044a3a411f9688cd14055e0e7e41', '[\"level:1\"]', '2026-05-15 11:06:09', NULL, '2026-05-15 07:35:26', '2026-05-15 11:06:09'),
(196, 'App\\Models\\Admin', 16, 'admin_token', 'feb10f973aae48fecd2fe34392039f320f9d70a6f6ac1e6ad7726a86554a25c2', '[\"level:1\"]', '2026-05-15 11:21:31', NULL, '2026-05-15 11:16:44', '2026-05-15 11:21:31'),
(197, 'App\\Models\\Admin', 16, 'admin_token', 'cb90d9cb23d67b2b6551b938595aaa2fde9d4a30b8c1569d386f5c9ed9223d5f', '[\"level:1\"]', '2026-05-15 12:18:33', NULL, '2026-05-15 11:21:32', '2026-05-15 12:18:33'),
(198, 'App\\Models\\Admin', 16, 'admin_token', '062158867fcf5104e0b3efd034caa1ac01451225e76e835c707c9fed66f4e6be', '[\"level:1\"]', '2026-05-15 22:25:05', NULL, '2026-05-15 12:36:37', '2026-05-15 22:25:05'),
(199, 'App\\Models\\Admin', 16, 'admin_token', '2cceb46a43216586f96414589fe825854aa8506845e45e7dc554f2f782a71a85', '[\"level:1\"]', '2026-05-15 22:29:51', NULL, '2026-05-15 22:29:45', '2026-05-15 22:29:51'),
(200, 'App\\Models\\Admin', 16, 'admin_token', '915cb1ff1d4d00354d80f61684dfb1e3917b948c659668235d661fc875422d1e', '[\"level:1\"]', '2026-05-17 20:56:12', NULL, '2026-05-15 22:30:03', '2026-05-17 20:56:12'),
(201, 'App\\Models\\User', 70, 'auth_token', '0aeb4a19b5d126dc4ea9526b6e72b44267cf4e09826833429b7d87466d43a325', '[\"*\"]', '2026-05-17 20:29:15', NULL, '2026-05-16 01:45:51', '2026-05-17 20:29:15'),
(202, 'App\\Models\\User', 70, 'auth_token', '768a0572eb383c22c001ff4e6b1efccb692be62afb3ca57fb4570492cc127293', '[\"*\"]', '2026-05-17 20:56:33', NULL, '2026-05-17 20:30:08', '2026-05-17 20:56:33'),
(203, 'App\\Models\\User', 70, 'auth_token', 'b21acf581cd90cc14a856bce4692ccdd7e21968164f91dc8a0620a5039717c0e', '[\"*\"]', '2026-05-17 21:41:15', NULL, '2026-05-17 20:58:31', '2026-05-17 21:41:15'),
(204, 'App\\Models\\User', 70, 'auth_token', '8ab584cac650539b55a874f62dbf1db1d361610727dc264199193178920b977c', '[\"*\"]', '2026-05-18 21:07:51', NULL, '2026-05-18 03:39:35', '2026-05-18 21:07:51'),
(205, 'App\\Models\\Admin', 16, 'admin_token', '7f2528d02a4dcbaf264fc47e274f8ba335205eceb0a7e4d97809a045fba1aed7', '[\"level:1\"]', '2026-05-19 04:20:14', NULL, '2026-05-18 21:08:43', '2026-05-19 04:20:14'),
(206, 'App\\Models\\Admin', 16, 'admin_token', '6c04d2a441dd1cabce4449a901d947372ba49fc17114eff3c9f6b75ed7611e00', '[\"level:1\"]', '2026-05-19 05:36:36', NULL, '2026-05-19 04:43:51', '2026-05-19 05:36:36'),
(207, 'App\\Models\\Admin', 16, 'admin_token', 'ba3a9602c51520c7069e7f394f4b251c286239d70e7eada54212b123323dcf12', '[\"level:1\"]', '2026-05-19 18:41:11', NULL, '2026-05-19 05:37:21', '2026-05-19 18:41:11'),
(208, 'App\\Models\\Admin', 16, 'admin_token', '1c5394a7147ed5a47ad24d738df662bd88ad9fe69341ec00ab6874fa76c7ba93', '[\"level:1\"]', '2026-05-20 21:52:03', NULL, '2026-05-19 18:52:11', '2026-05-20 21:52:03'),
(209, 'App\\Models\\User', 70, 'auth_token', 'be9c8e57f8f2aa7d5c014e61e7ba69de1d21d67ee84755772919d9a55b81058b', '[\"*\"]', '2026-05-21 00:25:08', NULL, '2026-05-21 00:24:56', '2026-05-21 00:25:08'),
(210, 'App\\Models\\User', 73, 'auth_token', '35731b4764742b763be0bc89c2480fd1013ccf19d0cde3398ab982007aedf032', '[\"*\"]', '2026-05-21 02:49:47', NULL, '2026-05-21 00:26:21', '2026-05-21 02:49:47'),
(211, 'App\\Models\\Admin', 16, 'admin_token', '76ac041ee1111cf442229ba7eeb6b1cedc566d8b5f29d916ea5c7cffe35e550d', '[\"level:1\"]', '2026-05-21 20:52:25', NULL, '2026-05-21 02:50:33', '2026-05-21 20:52:25'),
(212, 'App\\Models\\User', 70, 'auth_token', '48b4ed1414756d75109c236869aaf6bf7160f1f93f46461dcb904d6a110ee7ce', '[\"*\"]', '2026-05-21 21:17:41', NULL, '2026-05-21 18:38:21', '2026-05-21 21:17:41'),
(213, 'App\\Models\\Admin', 16, 'admin_token', '2fbf35ac07dc2872c00d898f2d9d50d4e2022bee997d7b29f1fc98353035bce7', '[\"level:1\"]', '2026-05-21 21:22:56', NULL, '2026-05-21 20:52:33', '2026-05-21 21:22:56'),
(214, 'App\\Models\\User', 71, 'auth_token', '4981c1f5d50574ba8acb6a3b0656802d6377c0fdf630428aaae16dfead0fbb80', '[\"*\"]', '2026-05-21 21:22:58', NULL, '2026-05-21 21:18:07', '2026-05-21 21:22:58'),
(215, 'App\\Models\\User', 70, 'auth_token', '6b2263f6206924b8b833f104f0af92bfa383fd038a36c0fe17f49d632ae06e79', '[\"*\"]', '2026-05-21 21:27:44', NULL, '2026-05-21 21:23:31', '2026-05-21 21:27:44'),
(216, 'App\\Models\\Admin', 16, 'admin_token', '95da653e1b72b76c83367fbbbbbb469943da7b6843ab2c5ce1318ede1fca5e56', '[\"level:1\"]', '2026-05-21 21:37:05', NULL, '2026-05-21 21:36:59', '2026-05-21 21:37:05'),
(217, 'App\\Models\\Admin', 16, 'admin_token', '3fb6217f6c501db90695c3a91a909f31b967ea399ec10417baf51c49c0f48315', '[\"level:1\"]', '2026-05-21 21:59:21', NULL, '2026-05-21 21:38:17', '2026-05-21 21:59:21'),
(218, 'App\\Models\\User', 70, 'auth_token', '9fbce0dea17ca4e3c08604e76512c07ff052a39e8c8deb36b2855e383f0c2057', '[\"*\"]', '2026-05-21 21:51:48', NULL, '2026-05-21 21:50:47', '2026-05-21 21:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `brand_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Sản phẩm thuộc thương hiệu nào',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên chung (VD: Nhẫn đính hôn Hoa Hồng)',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Giá sàn tham khảo',
  `promotional_price` decimal(15,2) DEFAULT NULL COMMENT 'Giá giảm (nếu có)',
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ảnh đại diện chung',
  `specifications` json DEFAULT NULL COMMENT 'Thông số kỹ thuật chung',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('published','draft','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `review_count` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Tổng số lượt đánh giá',
  `rating_avg` decimal(3,2) NOT NULL DEFAULT '0.00' COMMENT 'Số sao trung bình (VD: 4.50)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `slug`, `base_price`, `promotional_price`, `description`, `thumbnail_image`, `specifications`, `is_featured`, `status`, `created_at`, `updated_at`, `deleted_at`, `review_count`, `rating_avg`) VALUES
(10, 8, NULL, 'Nhẫn Kim Cương Solitaire', 'nhan-kim-cuong-solitaire', 45000000.00, NULL, '<h3>Cảm Hứng Thiết Kế</h3><p>Nhẫn Kim Cương Solitaire từ SORA mang vẻ đẹp kinh điển vượt thời gian. Với thiết kế tối giản chỉ tôn vinh duy nhất một viên kim cương chủ, sản phẩm là minh chứng cho tình yêu thuần khiết, duy nhất và vĩnh cửu. Kỹ thuật chấu vương miện giúp ánh sáng đi qua viên kim cương ở mọi góc độ, mang lại độ lấp lánh rực rỡ nhất.</p><h3>Thông Tin Chi Tiết</h3><ul><li><strong>Viên chủ:</strong> Kim cương tự nhiên GIA, nước D, độ tinh khiết VVS1.</li><li><strong>Trọng lượng viên chủ:</strong> ~ 0.5 Carat (5ly4).</li><li><strong>Chất liệu vỏ:</strong> Tùy chọn Vàng Trắng 18K, Vàng Hồng 18K hoặc Bạch Kim.</li><li><strong>Kiểu dáng:</strong> Solitaire truyền thống, bản nhẫn thanh mảnh tôn dáng tay.</li></ul><h3>Chính Sách SORA</h3><p>✔️ Miễn phí khắc tên và ngày kỷ niệm.<br>✔️ Bảo hành làm sáng, đánh bóng trọn đời.<br>✔️ Thu đổi kim cương lên đến 90% giá trị.</p>', 'products/thumbnails/prod_nhan-kim-cuong-solitaire_1775841210.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 10:13:30', NULL, 0, 0.00),
(11, 8, NULL, 'Nhẫn Halo Diamond', 'nhan-halo-diamond', 52000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-halo-diamond_1775841161.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:12:41', NULL, 0, 0.00),
(12, 8, NULL, 'Nhẫn Kim Cương Princess Cut', 'nhan-kim-cuong-princess', 38000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-princess-cut_1775841077.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:11:17', NULL, 0, 0.00),
(13, 8, NULL, 'Nhẫn Kim Cương Vintage', 'nhan-kim-cuong-vintage', 41000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-vintage_1775840991.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:09:51', NULL, 0, 0.00),
(14, 8, NULL, 'Nhẫn Kim Cương Eternity', 'nhan-kim-cuong-eternity', 60000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-eternity_1775840873.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 10:07:53', NULL, 0, 0.00),
(15, 8, NULL, 'Nhẫn Kim Cương Marquise', 'nhan-kim-cuong-marquise', 47000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-marquise_1775840791.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:06:31', NULL, 0, 0.00),
(16, 8, NULL, 'Nhẫn Kim Cương Oval', 'nhan-kim-cuong-oval', 43000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-oval_1775840737.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:05:37', NULL, 0, 0.00),
(17, 8, NULL, 'Nhẫn Kim Cương Emerald Cut', 'nhan-kim-cuong-emerald', 55000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-emerald-cut_1775840681.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:04:41', NULL, 0, 0.00),
(18, 8, NULL, 'Nhẫn Kim Cương Pear Shape', 'nhan-kim-cuong-pear', 49000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-pear-shape_1775840638.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:03:58', NULL, 0, 0.00),
(19, 8, NULL, 'Nhẫn Kim Cương Cushion Cut', 'nhan-kim-cuong-cushion', 51000000.00, NULL, '<h3>Vẻ Đẹp Hoàn Mỹ</h3><p>Thuộc bộ sưu tập nhẫn kim cương cao cấp của SORA, sản phẩm được thiết kế tỉ mỉ để tôn vinh sự rực rỡ của viên đá chủ. Mỗi viên kim cương đều trải qua quy trình kiểm định GIA khắt khe, đạt chuẩn về độ cắt, màu sắc và độ tinh khiết.</p><ul><li><strong>Chất liệu:</strong> Vàng 18K cao cấp đúc đặc.</li><li><strong>Kiểu dáng:</strong> Sang trọng, lấp lánh, phù hợp làm nhẫn cầu hôn hoặc quà tặng đẳng cấp.</li><li><strong>Bảo hành:</strong> Làm mới, đánh bóng miễn phí trọn đời.</li></ul>', 'products/thumbnails/prod_nhan-kim-cuong-cushion-cut_1775840489.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 10:01:29', NULL, 0, 0.00),
(20, 9, NULL, 'Cặp Nhẫn Cưới Harmony', 'nhan-cuoi-harmony', 15000000.00, NULL, '<h3>Cảm Hứng Thiết Kế</h3><p>Cặp Nhẫn Cưới Harmony là sự hòa quyện hoàn hảo giữa sự mạnh mẽ của nam giới và nét dịu dàng của nữ giới. Đường cắt vát chéo chạy dọc thân nhẫn tượng trưng cho sự gắn kết không thể tách rời của hai tâm hồn đồng điệu.</p><h3>Thông Tin Chi Tiết</h3><ul><li><strong>Nhẫn nam:</strong> Bản dày 4mm, thiết kế xước phay mờ mạnh mẽ, nam tính.</li><li><strong>Nhẫn nữ:</strong> Bản dày 3mm, đính dải kim cương tấm tự nhiên (0.05ct) lấp lánh dọc theo đường vát chéo.</li><li><strong>Chất liệu:</strong> Vàng 18K nguyên khối, độ bền cao, chống trầy xước tốt.</li></ul><h3>Ý Nghĩa</h3><p>Nhẫn cưới Harmony không chỉ là món trang sức, mà còn là lời thề nguyện đồng hành cùng nhau vượt qua mọi thăng trầm của cuộc sống.</p>', 'products/thumbnails/prod_cap-nhan-cuoi-harmony_1775840426.png', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 10:00:26', NULL, 0, 0.00),
(21, 9, NULL, 'Nhẫn Cưới Forever Love', 'nhan-cuoi-forever-love', 18000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-forever-love_1775840287.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:58:07', NULL, 0, 0.00),
(22, 9, NULL, 'Nhẫn Cưới Destiny', 'nhan-cuoi-destiny', 20000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-destiny_1775840196.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:56:36', NULL, 0, 0.00),
(23, 9, NULL, 'Nhẫn Cưới True Heart', 'nhan-cuoi-true-heart', 12000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-true-heart_1775840034.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:53:54', NULL, 0, 0.00),
(24, 9, NULL, 'Nhẫn Cưới Pure Gold', 'nhan-cuoi-pure-gold', 25000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-pure-gold_1775839818.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:50:18', NULL, 0, 0.00),
(25, 9, NULL, 'Nhẫn Cưới Diamond Touch', 'nhan-cuoi-diamond-touch', 22000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-diamond-touch_1775839742.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:49:02', NULL, 0, 0.00),
(26, 9, NULL, 'Nhẫn Cưới Infinity', 'nhan-cuoi-infinity', 17000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-infinity_1775839645.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:47:25', NULL, 0, 0.00),
(27, 9, NULL, 'Nhẫn Cưới Classic Plain', 'nhan-cuoi-classic-plain', 10000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-classic-plain_1775839586.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:46:26', NULL, 0, 0.00),
(28, 9, NULL, 'Nhẫn Cưới Two Tone', 'nhan-cuoi-two-tone', 19000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-two-tone_1775839515.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:45:15', NULL, 0, 0.00),
(29, 9, NULL, 'Nhẫn Cưới Rose Gold', 'nhan-cuoi-rose-gold', 21000000.00, NULL, '<h3>Tình Yêu Vĩnh Cửu</h3><p>Kỷ vật thiêng liêng minh chứng cho chặng đường gắn kết trăm năm. Thiết kế nhẫn mang phong cách thanh lịch, đề cao sự thoải mái khi đeo hàng ngày mà vẫn giữ được nét tinh tế, khác biệt.</p><ul><li><strong>Thiết kế:</strong> Dễ dàng phối cùng nhẫn đính hôn. Bản nhẫn bo tròn mềm mại (comfort-fit).</li><li><strong>Tùy chọn:</strong> Hỗ trợ khắc laser tên hoặc ngày kỷ niệm miễn phí bên trong lòng nhẫn.</li></ul>', 'products/thumbnails/prod_nhan-cuoi-rose-gold_1775839458.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:44:18', NULL, 0, 0.00),
(30, 10, NULL, 'Lắc Tay Vàng 18K', 'lac-tay-vang-18k', 8000000.00, NULL, '<h3>Cảm Hứng Thiết Kế</h3><p>Lắc Tay Vàng 18K Minimalist là phụ kiện không thể thiếu cho những quý cô yêu thích sự thanh lịch và tinh tế. Thiết kế mắt xích vuông đan xen chặt chẽ tạo độ rũ mềm mại, ôm trọn cổ tay phái đẹp.</p><h3>Đặc Điểm Nổi Bật</h3><ul><li><strong>Phong cách:</strong> Hiện đại, dễ dàng phối hợp với đồng hồ hoặc các loại vòng tay khác (layering).</li><li><strong>Chất liệu:</strong> Vàng 18K chuẩn tuổi, mang lại độ bóng bẩy và sắc vàng ấm áp sang trọng.</li><li><strong>Khóa cài:</strong> Khóa bấm an toàn kép, thao tác dễ dàng nhưng cực kỳ chắc chắn.</li></ul><p><em>Gợi ý: Lựa chọn hoàn hảo để đeo hàng ngày nơi công sở hoặc trong những buổi tiệc nhẹ nhàng.</em></p>', 'products/thumbnails/prod_lac-tay-vang-18k_1775839341.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:42:21', NULL, 0, 0.00),
(31, 10, NULL, 'Lắc Tay Bạc Italy', 'lac-tay-bac-italy', 2000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-bac-italy_1775839293.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:41:33', NULL, 0, 0.00),
(32, 10, NULL, 'Lắc Tay Đính Đá Sapphire', 'lac-tay-sapphire', 12000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-dinh-da-sapphire_1775839237.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:40:37', NULL, 0, 0.00),
(33, 10, NULL, 'Lắc Tay Charm May Mắn', 'lac-tay-charm', 5000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-charm-may-man_1775839185.webp', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 09:39:45', NULL, 0, 0.00),
(34, 10, NULL, 'Lắc Tay Dạng Kiềng', 'lac-tay-kieng', 15000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-dang-kieng_1775839104.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:38:24', NULL, 0, 0.00),
(35, 10, NULL, 'Lắc Tay Ngọc Trai', 'lac-tay-ngoc-trai', 7000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-ngoc-trai_1775839009.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:36:49', NULL, 0, 0.00),
(36, 10, NULL, 'Lắc Tay Đá Ruby', 'lac-tay-ruby', 18000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-da-ruby_1775838965.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:36:05', NULL, 0, 0.00),
(37, 10, NULL, 'Lắc Tay Kim Cương Tấm', 'lac-tay-diamond-melee', 25000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-kim-cuong-tam_1775838866.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:34:26', NULL, 0, 0.00),
(38, 10, NULL, 'Lắc Tay Trơn Thanh Lịch', 'lac-tay-minimalist', 4000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-tron-thanh-lich_1775838777.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:32:57', NULL, 0, 0.00),
(39, 10, NULL, 'Lắc Tay Bản To Sang Trọng', 'lac-tay-bold', 20000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_lac-tay-ban-to-sang-trong_1775838708.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:31:48', NULL, 0, 0.00),
(40, 11, NULL, 'Dây Chuyền Vàng 24K', 'day-chuyen-24k', 15000000.00, NULL, '<h3>Tinh Hoa Chế Tác</h3><p>Sợi dây chuyền Vàng 24K (99.99%) mang đậm nét đẹp truyền thống và giá trị tích lũy vượt trội. Được chế tác bởi những nghệ nhân kim hoàn lành nghề nhất của SORA, sản phẩm giữ trọn vẹn màu vàng phú quý đặc trưng.</p><h3>Thông Số Kỹ Thuật</h3><ul><li><strong>Trọng lượng:</strong> 3 Chỉ vàng 24K.</li><li><strong>Kiểu mắt xích:</strong> Mắt xích chữ O kép, chịu lực cực tốt, khó đứt gãy.</li><li><strong>Độ dài:</strong> Tùy chọn 45cm (ôm sát cổ) hoặc 50cm (vừa vặn trước ngực).</li></ul><p><em>*Sản phẩm có kèm theo giấy đảm bảo vàng chuẩn tuổi từ trung tâm kiểm định độc lập. Rất thích hợp làm quà tặng trong các dịp lễ, cưới hỏi, lễ mừng thọ.</em></p>', 'products/thumbnails/prod_day-chuyen-vang-24k_1775838641.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 09:30:41', NULL, 0, 0.00),
(41, 11, NULL, 'Dây Chuyền Vàng Trắng', 'day-chuyen-vang-trang', 9000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-vang-trang_1775838524.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:28:44', NULL, 0, 0.00),
(42, 11, NULL, 'Dây Chuyền Mắt Xích', 'day-chuyen-mat-xich', 11000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-mat-xich_1775838474.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:27:54', NULL, 0, 0.00),
(43, 11, NULL, 'Dây Chuyền Sợi Mảnh', 'day-chuyen-soi-manh', 4000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-soi-manh_1775838275.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:24:35', NULL, 0, 0.00),
(44, 11, NULL, 'Dây Chuyền Vàng Ý', 'day-chuyen-vang-y', 13000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-vang-y_1775838107.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:21:47', NULL, 0, 0.00),
(45, 11, NULL, 'Dây Chuyền Đính Đá Quý', 'day-chuyen-gemstone', 20000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-dinh-da-quy_1775837964.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:19:24', NULL, 0, 0.00),
(46, 11, NULL, 'Dây Chuyền Choker Vàng', 'day-chuyen-choker', 8500000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-choker-vang_1775837872.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:17:52', NULL, 0, 0.00),
(47, 11, NULL, 'Dây Chuyền Dài Thời Trang', 'day-chuyen-long', 12000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-dai-thoi-trang_1775837819.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:16:59', NULL, 0, 0.00),
(48, 11, NULL, 'Dây Chuyền Bi Vàng', 'day-chuyen-bi', 6000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-bi-vang_1775837752.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:15:52', NULL, 0, 0.00),
(49, 11, NULL, 'Dây Chuyền Nam Vàng 18K', 'day-chuyen-nam-18k', 35000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_day-chuyen-nam-vang-18k_1775837704.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:15:04', NULL, 0, 0.00),
(50, 12, NULL, 'Mặt Dây Chuyền Trái Tim', 'mat-day-heart', 3000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-trai-tim_1775837620.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:13:40', NULL, 0, 0.00),
(51, 12, NULL, 'Mặt Dây Chuyền Thánh Giá', 'mat-day-cross', 2500000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-thanh-gia_1775837330.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:08:50', NULL, 0, 0.00),
(52, 12, NULL, 'Mặt Dây Chuyền Kim Cương', 'mat-day-diamond', 15000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-kim-cuong_1775837272.jpeg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 09:07:52', NULL, 0, 0.00),
(53, 12, NULL, 'Mặt Dây Chuyền Cỏ 4 Lá', 'mat-day-chuyen-co-4-la', 3500000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-co-4-la_1775837198.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:06:38', NULL, 0, 0.00),
(54, 12, NULL, 'Mặt Dây Chuyền Tỳ Hưu', 'mat-day-ty-huu', 6000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-ty-huu_1775836960.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:02:40', NULL, 0, 0.00),
(55, 12, NULL, 'Mặt Dây Chuyền Chữ Cái', 'mat-day-letter', 2000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-chu-cai_1775836884.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:01:24', NULL, 0, 0.00),
(56, 12, NULL, 'Mặt Dây Chuyền Đá Emerald', 'mat-day-emerald', 18000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-da-emerald_1775836812.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 09:00:12', NULL, 0, 0.00),
(57, 12, NULL, 'Mặt Dây Chuyền Phật Bản Mệnh', 'mat-day-buddha', 7000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-phat-ban-menh_1775836750.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:59:10', NULL, 0, 0.00),
(58, 12, NULL, 'Mặt Dây Chuyền Ngọc Bích', 'mat-day-jade', 12000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-ngoc-bich_1775836675.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:57:55', NULL, 0, 0.00),
(59, 12, NULL, 'Mặt Dây Chuyền Hồ Ly', 'mat-day-ho-ly', 4500000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-ho-ly_1775836620.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:57:00', NULL, 0, 0.00),
(60, 13, NULL, 'Kiềng Cổ Cô Dâu Truyền Thống', 'kieng-co-bride', 40000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-co-dau-truyen-thong_1775836553.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 08:55:53', NULL, 0, 0.00),
(61, 13, NULL, 'Kiềng Cổ Chạm Khắc Long Phụng', 'kieng-co-dragon-phoenix', 55000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-cham-khac-long-phung_1775836496.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:54:56', NULL, 0, 0.00),
(62, 13, NULL, 'Kiềng Cổ Trơn 24K', 'kieng-co-plain-24k', 35000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-tron-24k_1775836366.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:52:46', NULL, 0, 0.00),
(63, 13, NULL, 'Kiềng Cổ Hoa Mai', 'kieng-co-hoa-mai', 42000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-hoa-mai_1775836312.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:51:52', NULL, 0, 0.00),
(64, 13, NULL, 'Kiềng Cổ Bản Lớn Quý Phái', 'kieng-co-large', 70000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-ban-lon-quy-phai_1775836182.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:49:42', NULL, 0, 0.00),
(65, 13, NULL, 'Kiềng Cổ Đính Đá Quý', 'kieng-co-gem', 85000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-dinh-da-quy_1775836094.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:48:14', NULL, 0, 0.00),
(66, 13, NULL, 'Kiềng Cổ Cách Điệu Hiện Đại', 'kieng-co-modern', 48000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-cach-dieu-hien-dai_1775836010.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:46:50', NULL, 0, 0.00),
(67, 13, NULL, 'Kiềng Cổ Mảnh Thanh Thoát', 'kieng-co-slim', 30000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-manh-thanh-thoat_1775835922.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:45:22', NULL, 0, 0.00),
(68, 13, NULL, 'Kiềng Cổ Quà Tặng Đính Hôn', 'kieng-co-gift', 38000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-qua-tang-dinh-hon_1775835804.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:43:24', NULL, 0, 0.00),
(69, 13, NULL, 'Kiềng Cổ Vàng Ý Cao Cấp', 'kieng-co-italy', 60000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_kieng-co-vang-y-cao-cap_1775835743.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:42:23', NULL, 0, 0.00),
(70, 14, NULL, 'Vòng Tay Bạc Bé Gái', 'vong-tay-bac-be-gai', 500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-bac-be-gai_1775835505.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:38:25', NULL, 0, 0.00),
(71, 14, NULL, 'Dây Chuyền Bạc Cho Bé', 'day-chuyen-bac-be', 600000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_day-chuyen-bac-cho-be_1775835402.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:36:42', NULL, 0, 0.00),
(72, 14, NULL, 'Bông Tai Nụ Bé Yêu', 'bong-tai-nu-be', 1500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_bong-tai-nu-be-yeu_1775835291.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:34:51', NULL, 0, 0.00),
(73, 14, NULL, 'Lắc Chân Bạc Có Chuông', 'lac-chan-bell', 700000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_lac-chan-bac-co-chuong_1775835221.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:33:41', NULL, 0, 0.00),
(74, 14, NULL, 'Mặt Dây Chuyền Hình Thú', 'mat-day-animal', 800000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-hinh-thu_1775835097.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:31:37', NULL, 0, 0.00),
(75, 14, NULL, 'Nhẫn Trẻ Em Điều Chỉnh Size', 'nhan-be-adjustable', 400000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_nhan-tre-em-dieu-chinh-size_1775835031.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:30:31', NULL, 0, 0.00),
(76, 14, NULL, 'Bộ Trang Sức Mickey', 'set-mickey', 2500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-mickey_1775834951.webp', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 08:29:11', NULL, 0, 0.00),
(77, 14, NULL, 'Lắc Tay Vàng Cho Bé', 'lac-tay-vang-be', 3500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_lac-tay-vang-cho-be_1775834886.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:28:06', NULL, 0, 0.00),
(78, 14, NULL, 'Vòng Cổ Bình An', 'vong-co-peace-be', 1200000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-co-binh-an_1775834729.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:25:29', NULL, 0, 0.00),
(79, 14, NULL, 'Bông Tai Hình Ngôi Sao', 'bong-tai-star-be', 1400000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_bong-tai-hinh-ngoi-sao_1775834587.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:23:07', NULL, 0, 0.00),
(80, 15, NULL, 'Đồng Hồ Rolex Demo', 'watch-rolex-demo', 250000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-rolex-demo_1775834373.webp', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 08:19:33', NULL, 0, 0.00);
INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `slug`, `base_price`, `promotional_price`, `description`, `thumbnail_image`, `specifications`, `is_featured`, `status`, `created_at`, `updated_at`, `deleted_at`, `review_count`, `rating_avg`) VALUES
(81, 15, NULL, 'Đồng Hồ Cartier Tank', 'watch-cartier-tank', 180000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-cartier-tank_1775834311.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:18:31', NULL, 0, 0.00),
(82, 15, NULL, 'Đồng Hồ Omega Seamaster', 'watch-omega-sea', 120000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-omega-seamaster_1775834239.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:17:19', NULL, 0, 0.00),
(83, 15, NULL, 'Đồng Hồ Longines Elegant', 'watch-longines-ele', 45000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-longines-elegant_1775834132.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:15:32', NULL, 0, 0.00),
(84, 15, NULL, 'Đồng Hồ Tissot Gold', 'watch-tissot-gold', 35000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-tissot-gold_1775834081.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:14:41', NULL, 0, 0.00),
(85, 15, NULL, 'Đồng Hồ Nữ Đính Kim Cương', 'watch-female-diamond', 95000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-nu-dinh-kim-cuong_1775833939.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 08:12:19', NULL, 0, 0.00),
(86, 15, NULL, 'Đồng Hồ Seiko Presage', 'watch-seiko-pre', 15000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-seiko-presage_1775833819.jpeg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:10:19', NULL, 0, 0.00),
(87, 15, NULL, 'Đồng Hồ Orient Star', 'watch-orient-star', 18000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-orient-star_1775833764.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:09:24', NULL, 0, 0.00),
(88, 15, NULL, 'Đồng Hồ Frederique Constant', 'watch-fc', 55000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-frederique-constant_1775833716.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:08:36', NULL, 0, 0.00),
(89, 15, NULL, 'Đồng Hồ Hublot Style', 'watch-hublot-style', 300000000.00, NULL, '<h3>Điểm Nhấn Thanh Lịch</h3><p>Món trang sức lý tưởng để tô điểm cho cổ tay thon gọn của phái đẹp. Từng đường nét được chế tác với sự sắc sảo, đảm bảo độ linh hoạt khi cử động mà không gây cộm hay vướng víu.</p><ul><li><strong>Kiểu dáng:</strong> Dây xích mảnh hoặc bản to tùy theo mã sản phẩm, đi kèm khóa cài an toàn chắc chắn.</li><li><strong>Bảo quản:</strong> Khuyên dùng dung dịch vệ sinh trang sức chuyên dụng để duy trì độ sáng bóng.</li></ul>', 'products/thumbnails/prod_dong-ho-hublot-style_1775833642.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:07:22', NULL, 0, 0.00),
(90, 16, NULL, 'Vòng Tay Đá Thạch Anh', 'vong-thach-anh', 1500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-da-thach-anh_1775833546.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:05:46', NULL, 0, 0.00),
(91, 16, NULL, 'Nhẫn Tỳ Hưu Chiêu Tài', 'nhan-ty-huu', 8000000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_nhan-ty-huu-chieu-tai_1775833415.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 08:03:35', NULL, 0, 0.00),
(92, 16, NULL, 'Vòng Tay Trầm Hương', 'vong-tram-huong', 5000000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-tram-huong_1775833328.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:02:08', NULL, 0, 0.00),
(93, 16, NULL, 'Mặt Dây Chuyền Ve Sầu', 'mat-day-cicada', 3000000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_mat-day-chuyen-ve-sau_1775833251.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 08:00:51', NULL, 0, 0.00),
(94, 16, NULL, 'Vòng Tay Mắt Hổ', 'vong-mat-ho', 1200000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-mat-ho_1775833120.png', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:58:40', NULL, 0, 0.00),
(95, 16, NULL, 'Lu Thống May Mắn', 'lu-thong-luck', 4000000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_lu-thong-may-man_1775833073.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:57:53', NULL, 0, 0.00),
(96, 16, NULL, 'Nhẫn Kim Tiền Vàng 18K', 'nhan-kim-tien-18k', 4500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_nhan-kim-tien-vang-18k_1775833000.webp', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 07:56:40', NULL, 0, 0.00),
(97, 16, NULL, 'Vòng Tay Chỉ Đỏ Kim Cương', 'vong-chi-do', 2500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-chi-do-kim-cuong_1775832924.jfif', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:55:24', NULL, 0, 0.00),
(98, 16, NULL, 'Mặt Dây Ngọc Phỉ Thúy', 'mat-day-jadeite', 20000000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_mat-day-ngoc-phi-thuy_1775832873.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:54:33', NULL, 0, 0.00),
(99, 16, NULL, 'Vòng Tay Đá Đào Hoa', 'vong-rhodochrosite', 3500000.00, NULL, '<h3>Bình An & Trọn Vẹn</h3><p>Không chỉ mang ý nghĩa làm đẹp, sản phẩm còn là biểu tượng của sự may mắn, mang năng lượng bình an và những lời chúc tốt đẹp nhất gửi gắm đến người đeo.</p><ul><li><strong>Thiết kế:</strong> Nhỏ gọn, tinh xảo, bo tròn các góc cạnh để đảm bảo an toàn tối đa trong quá trình sử dụng.</li><li><strong>Công dụng:</strong> Thu hút vượng khí, xua tan năng lượng tiêu cực. Quà tặng ý nghĩa.</li></ul>', 'products/thumbnails/prod_vong-tay-da-dao-hoa_1775832788.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:53:08', NULL, 0, 0.00),
(100, 17, NULL, 'Bộ Trang Sức Cưới Kim Cương', 'set-wedding-diamond', 150000000.00, NULL, '<h3>Đẳng Cấp Hoàng Gia</h3><p>Tuyệt tác Bộ Trang Sức Cưới Kim Cương là vầng hào quang rực rỡ nhất dành cho cô dâu trong ngày trọng đại. Lấy cảm hứng từ những giọt sương ban mai, bộ sản phẩm là sự kết tụ của hàng trăm viên kim cương tuyển chọn tinh khiết nhất.</p><h3>Bộ Sản Phẩm Bao Gồm</h3><ol><li><strong>Dây chuyền kim cương:</strong> Thiết kế thác nước với viên chủ 1 Carat hình giọt nước (Pear Shape).</li><li><strong>Đôi hoa tai:</strong> Dáng dài sang trọng, chuyển động lấp lánh theo từng bước đi của cô dâu.</li><li><strong>Lắc tay:</strong> Thiết kế Tennis đính full kim cương tấm vòng quanh cổ tay.</li></ol><h3>Giá Trị Đặc Quyền</h3><p>Bộ sưu tập giới hạn chỉ sản xuất 5 bộ mỗi năm. Được chế tác hoàn toàn từ Bạch Kim (Platinum) nguyên khối để giữ chặt từng viên kim cương và mang lại độ bền vĩnh cửu không bao giờ phai màu.</p>', 'products/thumbnails/prod_bo-trang-suc-cuoi-kim-cuong_1775832709.jpeg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 07:51:49', NULL, 0, 0.00),
(101, 17, NULL, 'Bộ Trang Sức Vàng 24K Cổ Điển', 'set-24k-classic', 85000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-vang-24k-co-dien_1775832621.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:50:21', NULL, 0, 0.00),
(102, 17, NULL, 'Bộ Trang Sức Ngọc Trai Biển', 'set-sea-pearl', 45000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-ngoc-trai-bien_1775832543.jpg', NULL, 1, 'published', '2026-04-10 08:36:54', '2026-04-10 07:49:03', NULL, 0, 0.00),
(103, 17, NULL, 'Bộ Trang Sức Đá Ruby Sang Trọng', 'set-ruby-lux', 95000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-da-ruby-sang-trong_1775832466.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 07:47:46', NULL, 0, 0.00),
(104, 17, NULL, 'Bộ Trang Sức Hoa Mai Vàng', 'set-hoa-mai', 35000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-hoa-mai-vang_1775811708.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 02:01:48', NULL, 0, 0.00),
(105, 17, NULL, 'Bộ Trang Sức Vàng Ý Hiện Đại', 'bo-trang-suc-vang-y-hien-dai', 25000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-vang-y-hien-dai_1775811599.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 01:59:59', NULL, 0, 0.00),
(106, 17, NULL, 'Bộ Trang Sức Đá Sapphire Xanh', 'set-sapphire-blue', 55000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-da-sapphire-xanh_1775811531.webp', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 01:58:51', NULL, 0, 0.00),
(107, 17, NULL, 'Bộ Trang Sức Bạc Đính Đá', 'set-silver-cz', 5000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-bac-dinh-da_1775811471.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 01:57:51', NULL, 0, 0.00),
(108, 17, NULL, 'Bộ Trang Sức Hồ Điệp', 'set-butterfly', 12000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-ho-diep_1775811341.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 01:55:41', NULL, 0, 0.00),
(109, 17, 2, 'Bộ Trang Sức Kim Cương Tấm', 'set-diamond-melee', 75000000.00, NULL, '<h3>Phụ Kiện Hoàn Hảo</h3><p>Một thiết kế nổi bật giúp tôn lên vùng cổ quyến rũ và xương quai xanh thanh tú. Từ những buổi tiệc tối sang trọng đến phong cách công sở hàng ngày, sản phẩm này luôn biết cách thu hút ánh nhìn.</p><ul><li><strong>Chế tác:</strong> Sự cân bằng hoàn hảo giữa tính thẩm mỹ và độ bền vững cơ học.</li><li><strong>Chất liệu:</strong> An toàn tuyệt đối với mọi loại da, không chứa niken gây dị ứng.</li></ul>', 'products/thumbnails/prod_bo-trang-suc-kim-cuong-tam_1775811256.jpg', NULL, 0, 'published', '2026-04-10 08:36:54', '2026-04-10 22:56:05', NULL, 0, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã định danh bán hàng (VD: NHAN-HH-V18-S10)',
  `price` decimal(15,2) NOT NULL COMMENT 'Giá bán niêm yết của biến thể',
  `promotional_price` decimal(15,2) DEFAULT NULL COMMENT 'Giá khuyến mãi',
  `stock_quantity` int NOT NULL DEFAULT '0' COMMENT 'Số lượng tồn kho thực tế',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh riêng của biến thể (VD: Nhẫn vàng thì hiện ảnh vàng)',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Biến thể mặc định hiển thị đầu tiên',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Xóa mềm biến thể'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `price`, `promotional_price`, `stock_quantity`, `image_url`, `is_default`, `created_at`, `updated_at`, `deleted_at`) VALUES
(14, 10, 'SKU-NHAN-KIM-CUONG-SOLITAIRE', 45000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-solitaire_1775841210.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:13:30', NULL),
(15, 11, 'SKU-NHAN-HALO-DIAMOND', 52000000.00, NULL, 50, 'products/variants/var_sku-nhan-halo-diamond_1775841161.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:12:41', NULL),
(16, 12, 'SKU-NHAN-KIM-CUONG-PRINCESS', 38000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-princess_1775841077.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:11:17', NULL),
(17, 13, 'SKU-NHAN-KIM-CUONG-VINTAGE', 41000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-vintage_1775840991.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:09:51', NULL),
(18, 14, 'SKU-NHAN-KIM-CUONG-ETERNITY', 60000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-eternity_1775840873.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:07:53', NULL),
(19, 15, 'SKU-NHAN-KIM-CUONG-MARQUISE', 47000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-marquise_1775840791.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:06:31', NULL),
(20, 16, 'SKU-NHAN-KIM-CUONG-OVAL', 43000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-oval_1775840737.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:05:37', NULL),
(21, 17, 'SKU-NHAN-KIM-CUONG-EMERALD', 55000000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-cuong-emerald_1775840681.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 10:04:41', NULL),
(22, 18, 'SKU-NHAN-KIM-CUONG-PEAR', 49000000.00, NULL, 49, 'products/variants/var_sku-nhan-kim-cuong-pear_1775840638.jpg', 1, '2026-04-10 08:38:55', '2026-04-23 01:34:10', NULL),
(23, 19, 'SKU-NHAN-KIM-CUONG-CUSHION', 51000000.00, NULL, 48, 'products/variants/var_sku-nhan-kim-cuong-cushion_1775840489.jpg', 1, '2026-04-10 08:38:55', '2026-04-23 04:32:13', NULL),
(24, 20, 'SKU-NHAN-CUOI-HARMONY', 15000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-harmony_1775840426.png', 1, '2026-04-10 08:38:55', '2026-04-10 10:00:26', NULL),
(25, 21, 'SKU-NHAN-CUOI-FOREVER-LOVE', 18000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-forever-love_1775840287.png', 1, '2026-04-10 08:38:55', '2026-04-10 09:58:07', NULL),
(26, 22, 'SKU-NHAN-CUOI-DESTINY', 20000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-destiny_1775840196.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:56:36', NULL),
(27, 23, 'SKU-NHAN-CUOI-TRUE-HEART', 12000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-true-heart_1775840034.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:53:54', NULL),
(28, 24, 'SKU-NHAN-CUOI-PURE-GOLD', 25000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-pure-gold_1775839818.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:50:18', NULL),
(29, 25, 'SKU-NHAN-CUOI-DIAMOND-TOUCH', 22000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-diamond-touch_1775839742.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:49:02', NULL),
(30, 26, 'SKU-NHAN-CUOI-INFINITY', 17000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-infinity_1775839645.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:47:25', NULL),
(31, 27, 'SKU-NHAN-CUOI-CLASSIC-PLAIN', 10000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-classic-plain_1775839586.png', 1, '2026-04-10 08:38:55', '2026-04-10 09:46:26', NULL),
(32, 28, 'SKU-NHAN-CUOI-TWO-TONE', 19000000.00, NULL, 50, 'products/variants/var_sku-nhan-cuoi-two-tone_1775839515.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:45:15', NULL),
(33, 29, 'SKU-NHAN-CUOI-ROSE-GOLD', 21000000.00, NULL, 49, 'products/variants/var_sku-nhan-cuoi-rose-gold_1775839458.jpg', 1, '2026-04-10 08:38:55', '2026-05-17 21:06:12', NULL),
(34, 30, 'SKU-LAC-TAY-VANG-18K', 8000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-vang-18k_1775839341.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:42:21', NULL),
(35, 31, 'SKU-LAC-TAY-BAC-ITALY', 2000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-bac-italy_1775839293.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:41:33', NULL),
(36, 32, 'SKU-LAC-TAY-SAPPHIRE', 12000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-sapphire_1775839237.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:40:37', NULL),
(37, 33, 'SKU-LAC-TAY-CHARM', 5000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-charm_1775839185.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:39:45', NULL),
(38, 34, 'SKU-LAC-TAY-KIENG', 15000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-kieng_1775839104.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:38:24', NULL),
(39, 35, 'SKU-LAC-TAY-NGOC-TRAI', 7000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-ngoc-trai_1775839009.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:36:49', NULL),
(40, 36, 'SKU-LAC-TAY-RUBY', 18000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-ruby_1775838965.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:36:05', NULL),
(41, 37, 'SKU-LAC-TAY-DIAMOND-MELEE', 25000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-diamond-melee_1775838866.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:34:26', NULL),
(42, 38, 'SKU-LAC-TAY-MINIMALIST', 4000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-minimalist_1775838777.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:32:57', NULL),
(43, 39, 'SKU-LAC-TAY-BOLD', 20000000.00, NULL, 50, 'products/variants/var_sku-lac-tay-bold_1775838708.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:31:48', NULL),
(44, 40, 'SKU-DAY-CHUYEN-24K', 15000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-24k_1775838641.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:30:41', NULL),
(45, 41, 'SKU-DAY-CHUYEN-VANG-TRANG', 9000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-vang-trang_1775838524.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:28:44', NULL),
(46, 42, 'SKU-DAY-CHUYEN-MAT-XICH', 16000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-mat-xich_1775838474.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:27:54', NULL),
(47, 43, 'SKU-DAY-CHUYEN-SOI-MANH', 4000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-soi-manh_1775838275.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:24:35', NULL),
(48, 44, 'SKU-DAY-CHUYEN-VANG-Y', 13000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-vang-y_1775838107.png', 1, '2026-04-10 08:38:55', '2026-04-10 09:21:47', NULL),
(49, 45, 'SKU-DAY-CHUYEN-GEMSTONE', 20000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-gemstone_1775837964.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:19:24', NULL),
(50, 46, 'SKU-DAY-CHUYEN-CHOKER', 8500000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-choker_1775837872.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:17:52', NULL),
(51, 47, 'SKU-DAY-CHUYEN-LONG', 12000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-long_1775837819.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:16:59', NULL),
(52, 48, 'SKU-DAY-CHUYEN-BI', 6000000.00, NULL, 49, 'products/variants/var_sku-day-chuyen-bi_1775837752.jpg', 1, '2026-04-10 08:38:55', '2026-04-23 01:10:29', NULL),
(53, 49, 'SKU-DAY-CHUYEN-NAM-18K', 35000000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-nam-18k_1775837704.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:15:04', NULL),
(54, 50, 'SKU-MAT-DAY-HEART', 3000000.00, NULL, 50, 'products/variants/var_sku-mat-day-heart_1775837620.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:13:40', NULL),
(55, 51, 'SKU-MAT-DAY-CROSS', 2500000.00, NULL, 50, 'products/variants/var_sku-mat-day-cross_1775837330.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:08:50', NULL),
(56, 52, 'SKU-MAT-DAY-DIAMOND', 15000000.00, NULL, 50, 'products/variants/var_sku-mat-day-diamond_1775837272.jpeg', 1, '2026-04-10 08:38:55', '2026-04-10 09:07:52', NULL),
(57, 53, 'SKU-MAT-DAY-CLOVER', 3500000.00, NULL, 50, 'products/variants/var_sku-mat-day-clover_1775837198.jpeg', 1, '2026-04-10 08:38:55', '2026-04-10 09:06:38', NULL),
(58, 54, 'SKU-MAT-DAY-TY-HUU', 6000000.00, NULL, 50, 'products/variants/var_sku-mat-day-ty-huu_1775836960.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 09:02:40', NULL),
(59, 55, 'SKU-MAT-DAY-LETTER', 2000000.00, NULL, 50, 'products/variants/var_sku-mat-day-letter_1775836884.png', 1, '2026-04-10 08:38:55', '2026-04-10 09:01:24', NULL),
(60, 56, 'SKU-MAT-DAY-EMERALD', 18000000.00, NULL, 50, 'products/variants/var_sku-mat-day-emerald_1775836812.webp', 1, '2026-04-10 08:38:55', '2026-04-10 09:00:12', NULL),
(61, 57, 'SKU-MAT-DAY-BUDDHA', 7000000.00, NULL, 50, 'products/variants/var_sku-mat-day-buddha_1775836750.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:59:10', NULL),
(62, 58, 'SKU-MAT-DAY-JADE', 12000000.00, NULL, 50, 'products/variants/var_sku-mat-day-jade_1775836675.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:57:55', NULL),
(63, 59, 'SKU-MAT-DAY-HO-LY', 4500000.00, NULL, 50, 'products/variants/var_sku-mat-day-ho-ly_1775836620.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:57:00', NULL),
(64, 60, 'SKU-KIENG-CO-BRIDE', 40000000.00, NULL, 49, 'products/variants/var_sku-kieng-co-bride_1775836553.jpg', 1, '2026-04-10 08:38:55', '2026-04-21 07:46:43', NULL),
(65, 61, 'SKU-KIENG-CO-DRAGON-PHOENIX', 55000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-dragon-phoenix_1775836496.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:54:56', NULL),
(66, 62, 'SKU-KIENG-CO-PLAIN-24K', 35000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-plain-24k_1775836366.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:52:46', NULL),
(67, 63, 'SKU-KIENG-CO-HOA-MAI', 42000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-hoa-mai_1775836312.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:51:52', NULL),
(68, 64, 'SKU-KIENG-CO-LARGE', 70000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-large_1775836182.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:49:42', NULL),
(69, 65, 'SKU-KIENG-CO-GEM', 85000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-gem_1775836094.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:48:14', NULL),
(70, 66, 'SKU-KIENG-CO-MODERN', 48000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-modern_1775836010.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:46:50', NULL),
(71, 67, 'SKU-KIENG-CO-SLIM', 30000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-slim_1775835922.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:45:22', NULL),
(72, 68, 'SKU-KIENG-CO-GIFT', 38000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-gift_1775835804.png', 1, '2026-04-10 08:38:55', '2026-04-10 08:43:24', NULL),
(73, 69, 'SKU-KIENG-CO-ITALY', 60000000.00, NULL, 50, 'products/variants/var_sku-kieng-co-italy_1775835743.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:42:23', NULL),
(74, 70, 'SKU-VONG-TAY-BAC-BE-GAI', 500000.00, NULL, 50, 'products/variants/var_sku-vong-tay-bac-be-gai_1775835505.jpg', 1, '2026-04-10 08:38:55', '2026-04-25 00:02:21', NULL),
(75, 71, 'SKU-DAY-CHUYEN-BAC-BE', 600000.00, NULL, 50, 'products/variants/var_sku-day-chuyen-bac-be_1775835402.jpg', 1, '2026-04-10 08:38:55', '2026-04-25 00:02:21', NULL),
(76, 72, 'SKU-BONG-TAI-NU-BE', 1500000.00, NULL, 50, 'products/variants/var_sku-bong-tai-nu-be_1775835291.jpg', 1, '2026-04-10 08:38:55', '2026-04-25 00:02:21', NULL),
(77, 73, 'SKU-LAC-CHAN-BELL', 700000.00, NULL, 50, 'products/variants/var_sku-lac-chan-bell_1775835221.jpg', 1, '2026-04-10 08:38:55', '2026-04-25 00:02:21', NULL),
(78, 74, 'SKU-MAT-DAY-ANIMAL', 800000.00, NULL, 50, 'products/variants/var_sku-mat-day-animal_1775835097.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:31:37', NULL),
(79, 75, 'SKU-NHAN-BE-ADJUSTABLE', 400000.00, NULL, 49, 'products/variants/var_sku-nhan-be-adjustable_1775835031.jpg', 1, '2026-04-10 08:38:55', '2026-04-24 23:03:04', NULL),
(80, 76, 'SKU-SET-MICKEY', 2500000.00, NULL, 50, 'products/variants/var_sku-set-mickey_1775834951.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:29:11', NULL),
(81, 77, 'SKU-LAC-TAY-VANG-BE', 3500000.00, NULL, 50, 'products/variants/var_sku-lac-tay-vang-be_1775834886.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:28:07', NULL),
(82, 78, 'SKU-VONG-CO-PEACE-BE', 1200000.00, NULL, 50, 'products/variants/var_sku-vong-co-peace-be_1775834729.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:25:29', NULL),
(83, 79, 'SKU-BONG-TAI-STAR-BE', 1400000.00, NULL, 50, 'products/variants/var_sku-bong-tai-star-be_1775834587.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:23:07', NULL),
(84, 80, 'SKU-WATCH-ROLEX-DEMO', 250000000.00, NULL, 50, 'products/variants/var_sku-watch-rolex-demo_1775834373.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:19:33', NULL),
(85, 81, 'SKU-WATCH-CARTIER-TANK', 180000000.00, NULL, 50, 'products/variants/var_sku-watch-cartier-tank_1775834311.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:18:31', NULL),
(86, 82, 'SKU-WATCH-OMEGA-SEA', 120000000.00, NULL, 50, 'products/variants/var_sku-watch-omega-sea_1775834239.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:17:19', NULL),
(87, 83, 'SKU-WATCH-LONGINES-ELE', 45000000.00, NULL, 50, 'products/variants/var_sku-watch-longines-ele_1775834132.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:15:32', NULL),
(88, 84, 'SKU-WATCH-TISSOT-GOLD', 35000000.00, NULL, 50, 'products/variants/var_sku-watch-tissot-gold_1775834081.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:14:41', NULL),
(89, 85, 'SKU-WATCH-FEMALE-DIAMOND', 95000000.00, NULL, 50, 'products/variants/var_sku-watch-female-diamond_1775833939.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:12:19', NULL),
(90, 86, 'SKU-WATCH-SEIKO-PRE', 15000000.00, NULL, 50, 'products/variants/var_sku-watch-seiko-pre_1775833819.jpeg', 1, '2026-04-10 08:38:55', '2026-04-10 08:10:19', NULL),
(91, 87, 'SKU-WATCH-ORIENT-STAR', 18000000.00, NULL, 50, 'products/variants/var_sku-watch-orient-star_1775833764.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:09:24', NULL),
(92, 88, 'SKU-WATCH-FC', 55000000.00, NULL, 50, 'products/variants/var_sku-watch-fc_1775833716.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:08:36', NULL),
(93, 89, 'SKU-WATCH-HUBLOT-STYLE', 300000000.00, NULL, 50, 'products/variants/var_sku-watch-hublot-style_1775833642.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:07:22', NULL),
(94, 90, 'SKU-VONG-THACH-ANH', 1500000.00, NULL, 50, 'products/variants/var_sku-vong-thach-anh_1775833546.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:05:46', NULL),
(95, 91, 'SKU-NHAN-TY-HUU', 8000000.00, NULL, 50, 'products/variants/var_sku-nhan-ty-huu_1775833415.jpg', 1, '2026-04-10 08:38:55', '2026-04-24 23:45:28', NULL),
(96, 92, 'SKU-VONG-TRAM-HUONG', 5000000.00, NULL, 50, 'products/variants/var_sku-vong-tram-huong_1775833328.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 08:02:08', NULL),
(97, 93, 'SKU-MAT-DAY-CICADA', 3000000.00, NULL, 50, 'products/variants/var_sku-mat-day-cicada_1775833251.webp', 1, '2026-04-10 08:38:55', '2026-04-10 08:00:51', NULL),
(98, 94, 'SKU-VONG-MAT-HO', 1200000.00, NULL, 50, 'products/variants/var_sku-vong-mat-ho_1775833120.png', 1, '2026-04-10 08:38:55', '2026-04-10 07:58:40', NULL),
(99, 95, 'SKU-LU-THONG-LUCK', 4000000.00, NULL, 50, 'products/variants/var_sku-lu-thong-luck_1775833073.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 07:57:53', NULL),
(100, 96, 'SKU-NHAN-KIM-TIEN-18K', 4500000.00, NULL, 50, 'products/variants/var_sku-nhan-kim-tien-18k_1775833000.webp', 1, '2026-04-10 08:38:55', '2026-04-10 07:56:40', NULL),
(101, 97, 'SKU-VONG-CHI-DO', 2500000.00, NULL, 49, 'products/variants/var_sku-vong-chi-do_1775832924.jfif', 1, '2026-04-10 08:38:55', '2026-05-17 21:06:12', NULL),
(102, 98, 'SKU-MAT-DAY-JADEITE', 20000000.00, NULL, 50, 'products/variants/var_sku-mat-day-jadeite_1775832873.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 07:54:33', NULL),
(103, 99, 'SKU-VONG-RHODOCHROSITE', 3500000.00, NULL, 50, 'products/variants/var_sku-vong-rhodochrosite_1775832788.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 07:53:08', NULL),
(104, 100, 'SKU-SET-WEDDING-DIAMOND', 150000000.00, NULL, 50, 'products/variants/var_sku-set-wedding-diamond_1775832709.jpeg', 1, '2026-04-10 08:38:55', '2026-04-10 07:51:49', NULL),
(105, 101, 'SKU-SET-24K-CLASSIC', 85000000.00, NULL, 50, 'products/variants/var_sku-set-24k-classic_1775832621.webp', 1, '2026-04-10 08:38:55', '2026-04-10 07:50:21', NULL),
(106, 102, 'SKU-SET-SEA-PEARL', 45000000.00, NULL, 49, 'products/variants/var_sku-set-sea-pearl_1775832543.jpg', 1, '2026-04-10 08:38:55', '2026-04-24 06:11:48', NULL),
(107, 103, 'SKU-SET-RUBY-LUX', 95000000.00, NULL, 50, 'products/variants/var_sku-set-ruby-lux_1775832466.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 07:47:46', NULL),
(108, 104, 'SKU-SET-HOA-MAI', 35000000.00, NULL, 50, 'products/variants/var_sku-set-hoa-mai_1775811708.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 02:01:48', NULL),
(109, 105, 'SKU-SET-ITALY-MODERN', 25000000.00, NULL, 50, 'products/variants/var_sku-set-italy-modern_1775811599.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 01:59:59', NULL),
(110, 106, 'SKU-SET-SAPPHIRE-BLUE', 55000000.00, NULL, 50, 'products/variants/var_sku-set-sapphire-blue_1775811531.webp', 1, '2026-04-10 08:38:55', '2026-04-10 01:58:51', NULL),
(111, 107, 'SKU-SET-SILVER-CZ', 5000000.00, NULL, 50, 'products/variants/var_sku-set-silver-cz_1775811471.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 01:57:51', NULL),
(112, 108, 'SKU-SET-BUTTERFLY', 12000000.00, NULL, 50, 'products/variants/var_sku-set-butterfly_1775811341.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 01:55:41', NULL),
(113, 109, 'SKU-SET-DIAMOND-MELEE', 75000000.00, NULL, 50, 'products/variants/var_sku-set-diamond-melee_1775811256.jpg', 1, '2026-04-10 08:38:55', '2026-04-10 01:54:16', NULL),
(141, 53, 'MAT4131-V2', 3500000.00, NULL, 10, 'products/variants/var_mat4131-v2_1775837198.jpg', 0, '2026-04-10 09:06:38', '2026-04-10 09:06:38', NULL),
(142, 53, 'MAT2925-V4', 3500000.00, NULL, 10, 'products/variants/var_mat2925-v4_1775837198.jpg', 0, '2026-04-10 09:06:38', '2026-04-10 09:06:38', NULL),
(143, 50, 'MAT6843-V2', 3000000.00, NULL, 10, 'products/variants/var_mat6843-v2_1775837620.webp', 0, '2026-04-10 09:13:40', '2026-04-10 09:13:40', NULL),
(144, 50, 'MAT3731-V3', 3000000.00, NULL, 10, 'products/variants/var_mat3731-v3_1775837620.webp', 0, '2026-04-10 09:13:40', '2026-04-10 09:13:40', NULL),
(145, 42, 'DAY4105-V2', 9000000.00, NULL, 10, 'products/variants/var_day4105-v2_1775838474.jpg', 0, '2026-04-10 09:27:54', '2026-04-10 09:27:54', NULL),
(146, 20, 'NHAN9131-V2', 15000000.00, NULL, 11, 'products/variants/var_nhan9131-v2_1775840426.png', 0, '2026-04-10 10:00:26', '2026-04-21 06:36:32', NULL),
(147, 29, 'NHAN9707-V2', 21000000.00, NULL, 10, 'products/variants/var_nhan9707-v2_1777094210.jpg', 0, '2026-04-24 22:16:51', '2026-04-24 22:16:51', NULL),
(148, 109, 'SET2274-V2', 75000000.00, NULL, 15, 'products/variants/var_set2274-v2_1777099698.jpg', 0, '2026-04-24 23:48:18', '2026-04-25 00:00:59', NULL),
(501, 10, 'SOLITAIRE-WT18K-N10', 45000000.00, NULL, 15, 'products/variants/var_sku-nhan-kim-cuong-solitaire_1775841210.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(502, 10, 'SOLITAIRE-WT18K-N12', 45000000.00, NULL, 20, 'products/variants/var_sku-nhan-kim-cuong-solitaire_1775841210.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(503, 10, 'SOLITAIRE-RG18K-N10', 46000000.00, NULL, 10, 'products/variants/var_solitaire_rosegold.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(504, 10, 'SOLITAIRE-PLAT-N12', 55000000.00, NULL, 5, 'products/variants/var_solitaire_platinum.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(505, 20, 'HARMONY-WT-10-14', 15000000.00, NULL, 8, 'products/variants/var_harmony_wt.png', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(506, 20, 'HARMONY-RG-12-16', 15500000.00, NULL, 12, 'products/variants/var_harmony_rg.png', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(507, 30, 'BRACELET-18K-Y-16CM', 8000000.00, NULL, 25, 'products/variants/var_sku-lac-tay-vang-18k_1775839341.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(508, 30, 'BRACELET-18K-Y-18CM', 8500000.00, NULL, 20, 'products/variants/var_sku-lac-tay-vang-18k_1775839341.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(509, 30, 'BRACELET-18K-RG-16CM', 8200000.00, NULL, 15, 'products/variants/var_bracelet_rosegold.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(510, 40, 'NECKLACE-24K-45CM', 15000000.00, NULL, 30, 'products/variants/var_sku-day-chuyen-vang-24k_1775838641.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(511, 40, 'NECKLACE-24K-50CM', 16500000.00, NULL, 18, 'products/variants/var_sku-day-chuyen-vang-24k_1775838641.jpg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(512, 100, 'SET-WEDDING-DIA-WT18K', 150000000.00, NULL, 3, 'products/variants/var_sku-set-wedding-diamond_1775832709.jpeg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(513, 100, 'SET-WEDDING-DIA-PLAT', 185000000.00, NULL, 2, 'products/variants/var_set_wedding_plat.jpeg', 0, '2026-04-25 09:23:58', '2026-04-25 09:23:58', NULL),
(514, 11, 'SKU-NHAN-HALO-DIAMOND-V2', 54600000.00, NULL, 10, 'products/thumbnails/prod_nhan-halo-diamond_1775841161.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(515, 12, 'SKU-NHAN-KIM-CUONG-PRINCESS-V2', 39900000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-princess-cut_1775841077.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(516, 13, 'SKU-NHAN-KIM-CUONG-VINTAGE-V2', 43050000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-vintage_1775840991.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(517, 14, 'SKU-NHAN-KIM-CUONG-ETERNITY-V2', 63000000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-eternity_1775840873.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(518, 15, 'SKU-NHAN-KIM-CUONG-MARQUISE-V2', 49350000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-marquise_1775840791.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(519, 16, 'SKU-NHAN-KIM-CUONG-OVAL-V2', 45150000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-oval_1775840737.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(520, 17, 'SKU-NHAN-KIM-CUONG-EMERALD-V2', 57750000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-emerald-cut_1775840681.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(521, 18, 'SKU-NHAN-KIM-CUONG-PEAR-V2', 51450000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-pear-shape_1775840638.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(522, 19, 'SKU-NHAN-KIM-CUONG-CUSHION-V2', 53550000.00, NULL, 10, 'products/thumbnails/prod_nhan-kim-cuong-cushion-cut_1775840489.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(523, 21, 'SKU-NHAN-CUOI-FOREVER-LOVE-V2', 18900000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-forever-love_1775840287.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(524, 22, 'SKU-NHAN-CUOI-DESTINY-V2', 21000000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-destiny_1775840196.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(525, 23, 'SKU-NHAN-CUOI-TRUE-HEART-V2', 12600000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-true-heart_1775840034.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(526, 24, 'SKU-NHAN-CUOI-PURE-GOLD-V2', 26250000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-pure-gold_1775839818.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(527, 25, 'SKU-NHAN-CUOI-DIAMOND-TOUCH-V2', 23100000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-diamond-touch_1775839742.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(528, 26, 'SKU-NHAN-CUOI-INFINITY-V2', 17850000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-infinity_1775839645.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(529, 27, 'SKU-NHAN-CUOI-CLASSIC-PLAIN-V2', 10500000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-classic-plain_1775839586.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(530, 28, 'SKU-NHAN-CUOI-TWO-TONE-V2', 19950000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-two-tone_1775839515.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(531, 29, 'SKU-NHAN-CUOI-ROSE-GOLD-V2', 22050000.00, NULL, 10, 'products/thumbnails/prod_nhan-cuoi-rose-gold_1775839458.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(532, 31, 'SKU-LAC-TAY-BAC-ITALY-V2', 2100000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-bac-italy_1775839293.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(533, 32, 'SKU-LAC-TAY-SAPPHIRE-V2', 12600000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-dinh-da-sapphire_1775839237.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(534, 33, 'SKU-LAC-TAY-CHARM-V2', 5250000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-charm-may-man_1775839185.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(535, 34, 'SKU-LAC-TAY-KIENG-V2', 15750000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-dang-kieng_1775839104.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(536, 35, 'SKU-LAC-TAY-NGOC-TRAI-V2', 7350000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-ngoc-trai_1775839009.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(537, 36, 'SKU-LAC-TAY-RUBY-V2', 18900000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-da-ruby_1775838965.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(538, 37, 'SKU-LAC-TAY-DIAMOND-MELEE-V2', 26250000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-kim-cuong-tam_1775838866.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(539, 38, 'SKU-LAC-TAY-MINIMALIST-V2', 4200000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-tron-thanh-lich_1775838777.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(540, 39, 'SKU-LAC-TAY-BOLD-V2', 21000000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-ban-to-sang-trong_1775838708.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(541, 41, 'SKU-DAY-CHUYEN-VANG-TRANG-V2', 9450000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-vang-trang_1775838524.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(542, 42, 'SKU-DAY-CHUYEN-MAT-XICH-V2', 11550000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-mat-xich_1775838474.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(543, 43, 'SKU-DAY-CHUYEN-SOI-MANH-V2', 4200000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-soi-manh_1775838275.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(544, 44, 'SKU-DAY-CHUYEN-VANG-Y-V2', 13650000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-vang-y_1775838107.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(545, 45, 'SKU-DAY-CHUYEN-GEMSTONE-V2', 21000000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-dinh-da-quy_1775837964.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(546, 46, 'SKU-DAY-CHUYEN-CHOKER-V2', 8925000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-choker-vang_1775837872.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(547, 47, 'SKU-DAY-CHUYEN-LONG-V2', 12600000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-dai-thoi-trang_1775837819.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(548, 48, 'SKU-DAY-CHUYEN-BI-V2', 6300000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-bi-vang_1775837752.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(549, 49, 'SKU-DAY-CHUYEN-NAM-18K-V2', 36750000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-nam-vang-18k_1775837704.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(550, 50, 'SKU-MAT-DAY-HEART-V2', 3150000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-trai-tim_1775837620.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(551, 51, 'SKU-MAT-DAY-CROSS-V2', 2625000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-thanh-gia_1775837330.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(552, 52, 'SKU-MAT-DAY-DIAMOND-V2', 15750000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-kim-cuong_1775837272.jpeg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(553, 53, 'SKU-MAT-DAY-CHUYEN-CO-4-LA-V2', 3675000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-co-4-la_1775837198.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(554, 54, 'SKU-MAT-DAY-TY-HUU-V2', 6300000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-ty-huu_1775836960.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(555, 55, 'SKU-MAT-DAY-LETTER-V2', 2100000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-chu-cai_1775836884.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(556, 56, 'SKU-MAT-DAY-EMERALD-V2', 18900000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-da-emerald_1775836812.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(557, 57, 'SKU-MAT-DAY-BUDDHA-V2', 7350000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-phat-ban-menh_1775836750.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(558, 58, 'SKU-MAT-DAY-JADE-V2', 12600000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-ngoc-bich_1775836675.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(559, 59, 'SKU-MAT-DAY-HO-LY-V2', 4725000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-ho-ly_1775836620.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(560, 60, 'SKU-KIENG-CO-BRIDE-V2', 42000000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-co-dau-truyen-thong_1775836553.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(561, 61, 'SKU-KIENG-CO-DRAGON-PHOENIX-V2', 57750000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-cham-khac-long-phung_1775836496.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(562, 62, 'SKU-KIENG-CO-PLAIN-24K-V2', 36750000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-tron-24k_1775836366.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(563, 63, 'SKU-KIENG-CO-HOA-MAI-V2', 44100000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-hoa-mai_1775836312.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(564, 64, 'SKU-KIENG-CO-LARGE-V2', 73500000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-ban-lon-quy-phai_1775836182.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(565, 65, 'SKU-KIENG-CO-GEM-V2', 89250000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-dinh-da-quy_1775836094.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(566, 66, 'SKU-KIENG-CO-MODERN-V2', 50400000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-cach-dieu-hien-dai_1775836010.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(567, 67, 'SKU-KIENG-CO-SLIM-V2', 31500000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-manh-thanh-thoat_1775835922.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(568, 68, 'SKU-KIENG-CO-GIFT-V2', 39900000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-qua-tang-dinh-hon_1775835804.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(569, 69, 'SKU-KIENG-CO-ITALY-V2', 63000000.00, NULL, 10, 'products/thumbnails/prod_kieng-co-vang-y-cao-cap_1775835743.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(570, 70, 'SKU-VONG-TAY-BAC-BE-GAI-V2', 525000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-bac-be-gai_1775835505.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(571, 71, 'SKU-DAY-CHUYEN-BAC-BE-V2', 630000.00, NULL, 10, 'products/thumbnails/prod_day-chuyen-bac-cho-be_1775835402.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(572, 72, 'SKU-BONG-TAI-NU-BE-V2', 1575000.00, NULL, 10, 'products/thumbnails/prod_bong-tai-nu-be-yeu_1775835291.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(573, 73, 'SKU-LAC-CHAN-BELL-V2', 735000.00, NULL, 10, 'products/thumbnails/prod_lac-chan-bac-co-chuong_1775835221.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(574, 74, 'SKU-MAT-DAY-ANIMAL-V2', 840000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-hinh-thu_1775835097.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(575, 75, 'SKU-NHAN-BE-ADJUSTABLE-V2', 420000.00, NULL, 10, 'products/thumbnails/prod_nhan-tre-em-dieu-chinh-size_1775835031.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(576, 76, 'SKU-SET-MICKEY-V2', 2625000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-mickey_1775834951.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(577, 77, 'SKU-LAC-TAY-VANG-BE-V2', 3675000.00, NULL, 10, 'products/thumbnails/prod_lac-tay-vang-cho-be_1775834886.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(578, 78, 'SKU-VONG-CO-PEACE-BE-V2', 1260000.00, NULL, 10, 'products/thumbnails/prod_vong-co-binh-an_1775834729.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(579, 79, 'SKU-BONG-TAI-STAR-BE-V2', 1470000.00, NULL, 10, 'products/thumbnails/prod_bong-tai-hinh-ngoi-sao_1775834587.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(580, 80, 'SKU-WATCH-ROLEX-DEMO-V2', 262500000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-rolex-demo_1775834373.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(581, 81, 'SKU-WATCH-CARTIER-TANK-V2', 189000000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-cartier-tank_1775834311.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(582, 82, 'SKU-WATCH-OMEGA-SEA-V2', 126000000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-omega-seamaster_1775834239.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(583, 83, 'SKU-WATCH-LONGINES-ELE-V2', 47250000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-longines-elegant_1775834132.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(584, 84, 'SKU-WATCH-TISSOT-GOLD-V2', 36750000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-tissot-gold_1775834081.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(585, 85, 'SKU-WATCH-FEMALE-DIAMOND-V2', 99750000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-nu-dinh-kim-cuong_1775833939.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(586, 86, 'SKU-WATCH-SEIKO-PRE-V2', 15750000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-seiko-presage_1775833819.jpeg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(587, 87, 'SKU-WATCH-ORIENT-STAR-V2', 18900000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-orient-star_1775833764.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(588, 88, 'SKU-WATCH-FC-V2', 57750000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-frederique-constant_1775833716.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(589, 89, 'SKU-WATCH-HUBLOT-STYLE-V2', 315000000.00, NULL, 10, 'products/thumbnails/prod_dong-ho-hublot-style_1775833642.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(590, 90, 'SKU-VONG-THACH-ANH-V2', 1575000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-da-thach-anh_1775833546.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(591, 91, 'SKU-NHAN-TY-HUU-V2', 8400000.00, NULL, 10, 'products/thumbnails/prod_nhan-ty-huu-chieu-tai_1775833415.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(592, 92, 'SKU-VONG-TRAM-HUONG-V2', 5250000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-tram-huong_1775833328.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(593, 93, 'SKU-MAT-DAY-CICADA-V2', 3150000.00, NULL, 9, 'products/thumbnails/prod_mat-day-chuyen-ve-sau_1775833251.webp', 0, '2026-04-25 09:31:56', '2026-05-17 21:06:12', NULL),
(594, 94, 'SKU-VONG-MAT-HO-V2', 1260000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-mat-ho_1775833120.png', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(595, 95, 'SKU-LU-THONG-LUCK-V2', 4200000.00, NULL, 10, 'products/thumbnails/prod_lu-thong-may-man_1775833073.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(596, 96, 'SKU-NHAN-KIM-TIEN-18K-V2', 4725000.00, NULL, 8, 'products/thumbnails/prod_nhan-kim-tien-vang-18k_1775833000.webp', 0, '2026-04-25 09:31:56', '2026-05-17 21:06:12', NULL),
(597, 97, 'SKU-VONG-CHI-DO-V2', 2625000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-chi-do-kim-cuong_1775832924.jfif', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(598, 98, 'SKU-MAT-DAY-JADEITE-V2', 21000000.00, NULL, 10, 'products/thumbnails/prod_mat-day-ngoc-phi-thuy_1775832873.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(599, 99, 'SKU-VONG-RHODOCHROSITE-V2', 3675000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-da-dao-hoa_1775832788.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(600, 101, 'SKU-SET-24K-CLASSIC-V2', 89250000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-vang-24k-co-dien_1775832621.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(601, 102, 'SKU-SET-SEA-PEARL-V2', 47250000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-ngoc-trai-bien_1775832543.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(602, 103, 'SKU-SET-RUBY-LUX-V2', 99750000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-da-ruby-sang-trong_1775832466.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(603, 104, 'SKU-SET-HOA-MAI-V2', 36750000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-hoa-mai-vang_1775811708.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(604, 105, 'SKU-BO-TRANG-SUC-VANG-Y-HIEN-DAI-V2', 26250000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-vang-y-hien-dai_1775811599.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(605, 106, 'SKU-SET-SAPPHIRE-BLUE-V2', 57750000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-da-sapphire-xanh_1775811531.webp', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(606, 107, 'SKU-SET-SILVER-CZ-V2', 5250000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-bac-dinh-da_1775811471.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(607, 108, 'SKU-SET-BUTTERFLY-V2', 12600000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-ho-diep_1775811341.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(608, 109, 'SKU-SET-DIAMOND-MELEE-V2', 78750000.00, NULL, 10, 'products/thumbnails/prod_bo-trang-suc-kim-cuong-tam_1775811256.jpg', 0, '2026-04-25 09:31:56', '2026-04-25 09:31:56', NULL),
(642, 11, 'SKU-NHAN-HALO-DIAMOND-V3', 59800000.00, NULL, 5, 'products/thumbnails/prod_nhan-halo-diamond_1775841161.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(643, 12, 'SKU-NHAN-KIM-CUONG-PRINCESS-V3', 43700000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-princess-cut_1775841077.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(644, 13, 'SKU-NHAN-KIM-CUONG-VINTAGE-V3', 47150000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-vintage_1775840991.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(645, 14, 'SKU-NHAN-KIM-CUONG-ETERNITY-V3', 69000000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-eternity_1775840873.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(646, 15, 'SKU-NHAN-KIM-CUONG-MARQUISE-V3', 54050000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-marquise_1775840791.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(647, 16, 'SKU-NHAN-KIM-CUONG-OVAL-V3', 49450000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-oval_1775840737.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(648, 17, 'SKU-NHAN-KIM-CUONG-EMERALD-V3', 63250000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-emerald-cut_1775840681.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(649, 18, 'SKU-NHAN-KIM-CUONG-PEAR-V3', 56350000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-pear-shape_1775840638.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(650, 19, 'SKU-NHAN-KIM-CUONG-CUSHION-V3', 58650000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-cuong-cushion-cut_1775840489.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(651, 21, 'SKU-NHAN-CUOI-FOREVER-LOVE-V3', 20700000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-forever-love_1775840287.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(652, 22, 'SKU-NHAN-CUOI-DESTINY-V3', 23000000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-destiny_1775840196.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(653, 23, 'SKU-NHAN-CUOI-TRUE-HEART-V3', 13800000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-true-heart_1775840034.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(654, 24, 'SKU-NHAN-CUOI-PURE-GOLD-V3', 28750000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-pure-gold_1775839818.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(655, 25, 'SKU-NHAN-CUOI-DIAMOND-TOUCH-V3', 25300000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-diamond-touch_1775839742.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(656, 26, 'SKU-NHAN-CUOI-INFINITY-V3', 19550000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-infinity_1775839645.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(657, 27, 'SKU-NHAN-CUOI-CLASSIC-PLAIN-V3', 11500000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-classic-plain_1775839586.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(658, 28, 'SKU-NHAN-CUOI-TWO-TONE-V3', 21850000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-two-tone_1775839515.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(659, 29, 'SKU-NHAN-CUOI-ROSE-GOLD-V3', 24150000.00, NULL, 5, 'products/thumbnails/prod_nhan-cuoi-rose-gold_1775839458.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(660, 31, 'SKU-LAC-TAY-BAC-ITALY-V3', 2300000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-bac-italy_1775839293.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(661, 32, 'SKU-LAC-TAY-SAPPHIRE-V3', 13800000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-dinh-da-sapphire_1775839237.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(662, 33, 'SKU-LAC-TAY-CHARM-V3', 5750000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-charm-may-man_1775839185.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(663, 34, 'SKU-LAC-TAY-KIENG-V3', 17250000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-dang-kieng_1775839104.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(664, 35, 'SKU-LAC-TAY-NGOC-TRAI-V3', 8050000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-ngoc-trai_1775839009.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(665, 36, 'SKU-LAC-TAY-RUBY-V3', 20700000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-da-ruby_1775838965.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(666, 37, 'SKU-LAC-TAY-DIAMOND-MELEE-V3', 28750000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-kim-cuong-tam_1775838866.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(667, 38, 'SKU-LAC-TAY-MINIMALIST-V3', 4600000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-tron-thanh-lich_1775838777.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(668, 39, 'SKU-LAC-TAY-BOLD-V3', 23000000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-ban-to-sang-trong_1775838708.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(669, 41, 'SKU-DAY-CHUYEN-VANG-TRANG-V3', 10350000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-vang-trang_1775838524.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(670, 42, 'SKU-DAY-CHUYEN-MAT-XICH-V3', 12650000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-mat-xich_1775838474.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(671, 43, 'SKU-DAY-CHUYEN-SOI-MANH-V3', 4600000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-soi-manh_1775838275.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(672, 44, 'SKU-DAY-CHUYEN-VANG-Y-V3', 14950000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-vang-y_1775838107.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(673, 45, 'SKU-DAY-CHUYEN-GEMSTONE-V3', 23000000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-dinh-da-quy_1775837964.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(674, 46, 'SKU-DAY-CHUYEN-CHOKER-V3', 9775000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-choker-vang_1775837872.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(675, 47, 'SKU-DAY-CHUYEN-LONG-V3', 13800000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-dai-thoi-trang_1775837819.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(676, 48, 'SKU-DAY-CHUYEN-BI-V3', 6900000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-bi-vang_1775837752.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(677, 49, 'SKU-DAY-CHUYEN-NAM-18K-V3', 40250000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-nam-vang-18k_1775837704.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(678, 50, 'SKU-MAT-DAY-HEART-V3', 3450000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-trai-tim_1775837620.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(679, 51, 'SKU-MAT-DAY-CROSS-V3', 2875000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-thanh-gia_1775837330.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(680, 52, 'SKU-MAT-DAY-DIAMOND-V3', 17250000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-kim-cuong_1775837272.jpeg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(681, 53, 'SKU-MAT-DAY-CHUYEN-CO-4-LA-V3', 4025000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-co-4-la_1775837198.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(682, 54, 'SKU-MAT-DAY-TY-HUU-V3', 6900000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-ty-huu_1775836960.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(683, 55, 'SKU-MAT-DAY-LETTER-V3', 2300000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-chu-cai_1775836884.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(684, 56, 'SKU-MAT-DAY-EMERALD-V3', 20700000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-da-emerald_1775836812.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(685, 57, 'SKU-MAT-DAY-BUDDHA-V3', 8050000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-phat-ban-menh_1775836750.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(686, 58, 'SKU-MAT-DAY-JADE-V3', 13800000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-ngoc-bich_1775836675.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(687, 59, 'SKU-MAT-DAY-HO-LY-V3', 5175000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-ho-ly_1775836620.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(688, 60, 'SKU-KIENG-CO-BRIDE-V3', 46000000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-co-dau-truyen-thong_1775836553.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(689, 61, 'SKU-KIENG-CO-DRAGON-PHOENIX-V3', 63250000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-cham-khac-long-phung_1775836496.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(690, 62, 'SKU-KIENG-CO-PLAIN-24K-V3', 40250000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-tron-24k_1775836366.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(691, 63, 'SKU-KIENG-CO-HOA-MAI-V3', 48300000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-hoa-mai_1775836312.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(692, 64, 'SKU-KIENG-CO-LARGE-V3', 80500000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-ban-lon-quy-phai_1775836182.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(693, 65, 'SKU-KIENG-CO-GEM-V3', 97750000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-dinh-da-quy_1775836094.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(694, 66, 'SKU-KIENG-CO-MODERN-V3', 55200000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-cach-dieu-hien-dai_1775836010.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(695, 67, 'SKU-KIENG-CO-SLIM-V3', 34500000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-manh-thanh-thoat_1775835922.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(696, 68, 'SKU-KIENG-CO-GIFT-V3', 43700000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-qua-tang-dinh-hon_1775835804.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(697, 69, 'SKU-KIENG-CO-ITALY-V3', 69000000.00, NULL, 5, 'products/thumbnails/prod_kieng-co-vang-y-cao-cap_1775835743.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(698, 70, 'SKU-VONG-TAY-BAC-BE-GAI-V3', 575000.00, NULL, 5, 'products/thumbnails/prod_vong-tay-bac-be-gai_1775835505.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(699, 71, 'SKU-DAY-CHUYEN-BAC-BE-V3', 690000.00, NULL, 5, 'products/thumbnails/prod_day-chuyen-bac-cho-be_1775835402.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(700, 72, 'SKU-BONG-TAI-NU-BE-V3', 1725000.00, NULL, 5, 'products/thumbnails/prod_bong-tai-nu-be-yeu_1775835291.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(701, 73, 'SKU-LAC-CHAN-BELL-V3', 805000.00, NULL, 5, 'products/thumbnails/prod_lac-chan-bac-co-chuong_1775835221.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(702, 74, 'SKU-MAT-DAY-ANIMAL-V3', 920000.00, NULL, 5, 'products/thumbnails/prod_mat-day-chuyen-hinh-thu_1775835097.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(703, 75, 'SKU-NHAN-BE-ADJUSTABLE-V3', 460000.00, NULL, 5, 'products/thumbnails/prod_nhan-tre-em-dieu-chinh-size_1775835031.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(704, 76, 'SKU-SET-MICKEY-V3', 2875000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-mickey_1775834951.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(705, 77, 'SKU-LAC-TAY-VANG-BE-V3', 4025000.00, NULL, 5, 'products/thumbnails/prod_lac-tay-vang-cho-be_1775834886.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(706, 78, 'SKU-VONG-CO-PEACE-BE-V3', 1380000.00, NULL, 5, 'products/thumbnails/prod_vong-co-binh-an_1775834729.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(707, 79, 'SKU-BONG-TAI-STAR-BE-V3', 1610000.00, NULL, 5, 'products/thumbnails/prod_bong-tai-hinh-ngoi-sao_1775834587.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(708, 80, 'SKU-WATCH-ROLEX-DEMO-V3', 287500000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-rolex-demo_1775834373.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL);
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `price`, `promotional_price`, `stock_quantity`, `image_url`, `is_default`, `created_at`, `updated_at`, `deleted_at`) VALUES
(709, 81, 'SKU-WATCH-CARTIER-TANK-V3', 207000000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-cartier-tank_1775834311.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(710, 82, 'SKU-WATCH-OMEGA-SEA-V3', 138000000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-omega-seamaster_1775834239.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(711, 83, 'SKU-WATCH-LONGINES-ELE-V3', 51750000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-longines-elegant_1775834132.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(712, 84, 'SKU-WATCH-TISSOT-GOLD-V3', 40250000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-tissot-gold_1775834081.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(713, 85, 'SKU-WATCH-FEMALE-DIAMOND-V3', 109250000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-nu-dinh-kim-cuong_1775833939.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(714, 86, 'SKU-WATCH-SEIKO-PRE-V3', 17250000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-seiko-presage_1775833819.jpeg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(715, 87, 'SKU-WATCH-ORIENT-STAR-V3', 20700000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-orient-star_1775833764.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(716, 88, 'SKU-WATCH-FC-V3', 63250000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-frederique-constant_1775833716.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(717, 89, 'SKU-WATCH-HUBLOT-STYLE-V3', 345000000.00, NULL, 5, 'products/thumbnails/prod_dong-ho-hublot-style_1775833642.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(718, 90, 'SKU-VONG-THACH-ANH-V3', 1725000.00, NULL, 5, 'products/thumbnails/prod_vong-tay-da-thach-anh_1775833546.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(719, 91, 'SKU-NHAN-TY-HUU-V3', 9200000.00, NULL, 5, 'products/thumbnails/prod_nhan-ty-huu-chieu-tai_1775833415.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(720, 92, 'SKU-VONG-TRAM-HUONG-V3', 5750000.00, NULL, 5, 'products/thumbnails/prod_vong-tay-tram-huong_1775833328.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(721, 93, 'SKU-MAT-DAY-CICADA-V3', 3450000.00, NULL, 10, 'products/thumbnails/prod_mat-day-chuyen-ve-sau_1775833251.webp', 0, '2026-04-25 09:34:38', '2026-05-17 19:59:42', NULL),
(722, 94, 'SKU-VONG-MAT-HO-V3', 1380000.00, NULL, 5, 'products/thumbnails/prod_vong-tay-mat-ho_1775833120.png', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(723, 95, 'SKU-LU-THONG-LUCK-V3', 4600000.00, NULL, 5, 'products/thumbnails/prod_lu-thong-may-man_1775833073.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(724, 96, 'SKU-NHAN-KIM-TIEN-18K-V3', 5175000.00, NULL, 5, 'products/thumbnails/prod_nhan-kim-tien-vang-18k_1775833000.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(725, 97, 'SKU-VONG-CHI-DO-V3', 2875000.00, NULL, 10, 'products/thumbnails/prod_vong-tay-chi-do-kim-cuong_1775832924.jfif', 0, '2026-04-25 09:34:38', '2026-05-17 19:59:58', NULL),
(726, 98, 'SKU-MAT-DAY-JADEITE-V3', 23000000.00, NULL, 5, 'products/thumbnails/prod_mat-day-ngoc-phi-thuy_1775832873.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(727, 99, 'SKU-VONG-RHODOCHROSITE-V3', 4025000.00, NULL, 5, 'products/thumbnails/prod_vong-tay-da-dao-hoa_1775832788.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(728, 101, 'SKU-SET-24K-CLASSIC-V3', 97750000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-vang-24k-co-dien_1775832621.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(729, 102, 'SKU-SET-SEA-PEARL-V3', 51750000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-ngoc-trai-bien_1775832543.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(730, 103, 'SKU-SET-RUBY-LUX-V3', 109250000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-da-ruby-sang-trong_1775832466.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(731, 104, 'SKU-SET-HOA-MAI-V3', 40250000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-hoa-mai-vang_1775811708.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(732, 105, 'SKU-BO-TRANG-SUC-VANG-Y-HIEN-DAI-V3', 28750000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-vang-y-hien-dai_1775811599.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(733, 106, 'SKU-SET-SAPPHIRE-BLUE-V3', 63250000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-da-sapphire-xanh_1775811531.webp', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(734, 107, 'SKU-SET-SILVER-CZ-V3', 5750000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-bac-dinh-da_1775811471.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(735, 108, 'SKU-SET-BUTTERFLY-V3', 13800000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-ho-diep_1775811341.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL),
(736, 109, 'SKU-SET-DIAMOND-MELEE-V3', 86250000.00, NULL, 5, 'products/thumbnails/prod_bo-trang-suc-kim-cuong-tam_1775811256.jpg', 0, '2026-04-25 09:34:38', '2026-04-25 09:34:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_attributes`
--

CREATE TABLE `product_variant_attributes` (
  `variant_id` bigint UNSIGNED NOT NULL,
  `attribute_value_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variant_attributes`
--

INSERT INTO `product_variant_attributes` (`variant_id`, `attribute_value_id`) VALUES
(46, 9),
(145, 10),
(113, 15),
(57, 16),
(24, 17),
(54, 17),
(141, 17),
(142, 18),
(143, 19),
(144, 20),
(146, 21),
(33, 22),
(147, 23),
(33, 24),
(147, 25),
(148, 26),
(14, 101),
(15, 101),
(16, 101),
(17, 101),
(18, 101),
(19, 101),
(20, 101),
(21, 101),
(22, 101),
(23, 101),
(24, 101),
(25, 101),
(26, 101),
(27, 101),
(28, 101),
(29, 101),
(30, 101),
(31, 101),
(32, 101),
(33, 101),
(74, 101),
(75, 101),
(76, 101),
(77, 101),
(78, 101),
(79, 101),
(80, 101),
(81, 101),
(82, 101),
(83, 101),
(94, 101),
(95, 101),
(96, 101),
(97, 101),
(98, 101),
(99, 101),
(100, 101),
(101, 101),
(102, 101),
(103, 101),
(146, 101),
(147, 101),
(501, 101),
(502, 101),
(503, 101),
(504, 101),
(505, 101),
(506, 101),
(514, 101),
(515, 101),
(516, 101),
(517, 101),
(518, 101),
(519, 101),
(520, 101),
(521, 101),
(522, 101),
(523, 101),
(524, 101),
(525, 101),
(526, 101),
(527, 101),
(528, 101),
(529, 101),
(530, 101),
(531, 101),
(570, 101),
(571, 101),
(572, 101),
(573, 101),
(574, 101),
(575, 101),
(576, 101),
(577, 101),
(578, 101),
(579, 101),
(590, 101),
(591, 101),
(592, 101),
(593, 101),
(594, 101),
(595, 101),
(596, 101),
(597, 101),
(598, 101),
(599, 101),
(146, 102),
(147, 102),
(502, 102),
(504, 102),
(506, 102),
(514, 102),
(515, 102),
(516, 102),
(517, 102),
(518, 102),
(519, 102),
(520, 102),
(521, 102),
(522, 102),
(523, 102),
(524, 102),
(525, 102),
(526, 102),
(527, 102),
(528, 102),
(529, 102),
(530, 102),
(531, 102),
(570, 102),
(571, 102),
(572, 102),
(573, 102),
(574, 102),
(575, 102),
(576, 102),
(577, 102),
(578, 102),
(579, 102),
(590, 102),
(591, 102),
(592, 102),
(593, 102),
(594, 102),
(595, 102),
(596, 102),
(597, 102),
(598, 102),
(599, 102),
(642, 103),
(643, 103),
(644, 103),
(645, 103),
(646, 103),
(647, 103),
(648, 103),
(649, 103),
(650, 103),
(651, 103),
(652, 103),
(653, 103),
(654, 103),
(655, 103),
(656, 103),
(657, 103),
(658, 103),
(659, 103),
(698, 103),
(699, 103),
(700, 103),
(701, 103),
(702, 103),
(703, 103),
(704, 103),
(705, 103),
(706, 103),
(707, 103),
(718, 103),
(719, 103),
(720, 103),
(721, 103),
(722, 103),
(723, 103),
(724, 103),
(725, 103),
(726, 103),
(727, 103),
(14, 105),
(15, 105),
(16, 105),
(17, 105),
(18, 105),
(19, 105),
(20, 105),
(21, 105),
(22, 105),
(23, 105),
(24, 105),
(25, 105),
(26, 105),
(27, 105),
(28, 105),
(29, 105),
(30, 105),
(31, 105),
(32, 105),
(33, 105),
(34, 105),
(35, 105),
(36, 105),
(37, 105),
(38, 105),
(39, 105),
(40, 105),
(41, 105),
(42, 105),
(43, 105),
(44, 105),
(45, 105),
(46, 105),
(47, 105),
(48, 105),
(49, 105),
(50, 105),
(51, 105),
(52, 105),
(53, 105),
(54, 105),
(55, 105),
(56, 105),
(57, 105),
(58, 105),
(59, 105),
(60, 105),
(61, 105),
(62, 105),
(63, 105),
(64, 105),
(65, 105),
(66, 105),
(67, 105),
(68, 105),
(69, 105),
(70, 105),
(71, 105),
(72, 105),
(73, 105),
(74, 105),
(75, 105),
(76, 105),
(77, 105),
(78, 105),
(79, 105),
(80, 105),
(81, 105),
(82, 105),
(83, 105),
(84, 105),
(85, 105),
(86, 105),
(87, 105),
(88, 105),
(89, 105),
(90, 105),
(91, 105),
(92, 105),
(93, 105),
(94, 105),
(95, 105),
(96, 105),
(97, 105),
(98, 105),
(99, 105),
(100, 105),
(101, 105),
(102, 105),
(103, 105),
(104, 105),
(105, 105),
(106, 105),
(107, 105),
(108, 105),
(109, 105),
(110, 105),
(111, 105),
(112, 105),
(113, 105),
(141, 105),
(142, 105),
(143, 105),
(144, 105),
(145, 105),
(146, 105),
(147, 105),
(148, 105),
(501, 105),
(502, 105),
(503, 105),
(504, 105),
(505, 105),
(506, 105),
(507, 105),
(508, 105),
(509, 105),
(510, 105),
(511, 105),
(512, 105),
(513, 105),
(514, 105),
(515, 105),
(516, 105),
(517, 105),
(518, 105),
(519, 105),
(520, 105),
(521, 105),
(522, 105),
(523, 105),
(524, 105),
(525, 105),
(526, 105),
(527, 105),
(528, 105),
(529, 105),
(530, 105),
(531, 105),
(532, 105),
(533, 105),
(534, 105),
(535, 105),
(536, 105),
(537, 105),
(538, 105),
(539, 105),
(540, 105),
(541, 105),
(542, 105),
(543, 105),
(544, 105),
(545, 105),
(546, 105),
(547, 105),
(548, 105),
(549, 105),
(550, 105),
(551, 105),
(552, 105),
(553, 105),
(554, 105),
(555, 105),
(556, 105),
(557, 105),
(558, 105),
(559, 105),
(560, 105),
(561, 105),
(562, 105),
(563, 105),
(564, 105),
(565, 105),
(566, 105),
(567, 105),
(568, 105),
(569, 105),
(570, 105),
(571, 105),
(572, 105),
(573, 105),
(574, 105),
(575, 105),
(576, 105),
(577, 105),
(578, 105),
(579, 105),
(580, 105),
(581, 105),
(582, 105),
(583, 105),
(584, 105),
(585, 105),
(586, 105),
(587, 105),
(588, 105),
(589, 105),
(590, 105),
(591, 105),
(592, 105),
(593, 105),
(594, 105),
(595, 105),
(596, 105),
(597, 105),
(598, 105),
(599, 105),
(600, 105),
(601, 105),
(602, 105),
(603, 105),
(604, 105),
(605, 105),
(606, 105),
(607, 105),
(608, 105),
(141, 106),
(143, 106),
(145, 106),
(146, 106),
(147, 106),
(148, 106),
(502, 106),
(503, 106),
(506, 106),
(508, 106),
(509, 106),
(514, 106),
(515, 106),
(516, 106),
(517, 106),
(518, 106),
(519, 106),
(520, 106),
(521, 106),
(522, 106),
(523, 106),
(524, 106),
(525, 106),
(526, 106),
(527, 106),
(528, 106),
(529, 106),
(530, 106),
(531, 106),
(532, 106),
(533, 106),
(534, 106),
(535, 106),
(536, 106),
(537, 106),
(538, 106),
(539, 106),
(540, 106),
(541, 106),
(542, 106),
(543, 106),
(544, 106),
(545, 106),
(546, 106),
(547, 106),
(548, 106),
(549, 106),
(550, 106),
(551, 106),
(552, 106),
(553, 106),
(554, 106),
(555, 106),
(556, 106),
(557, 106),
(558, 106),
(559, 106),
(560, 106),
(561, 106),
(562, 106),
(563, 106),
(564, 106),
(565, 106),
(566, 106),
(567, 106),
(568, 106),
(569, 106),
(570, 106),
(571, 106),
(572, 106),
(573, 106),
(574, 106),
(575, 106),
(576, 106),
(577, 106),
(578, 106),
(579, 106),
(580, 106),
(581, 106),
(582, 106),
(583, 106),
(584, 106),
(585, 106),
(586, 106),
(587, 106),
(588, 106),
(589, 106),
(590, 106),
(591, 106),
(592, 106),
(593, 106),
(594, 106),
(595, 106),
(596, 106),
(597, 106),
(598, 106),
(599, 106),
(600, 106),
(601, 106),
(602, 106),
(603, 106),
(604, 106),
(605, 106),
(606, 106),
(607, 106),
(608, 106),
(144, 107),
(504, 107),
(513, 107),
(642, 107),
(643, 107),
(644, 107),
(645, 107),
(646, 107),
(647, 107),
(648, 107),
(649, 107),
(650, 107),
(651, 107),
(652, 107),
(653, 107),
(654, 107),
(655, 107),
(656, 107),
(657, 107),
(658, 107),
(659, 107),
(660, 107),
(661, 107),
(662, 107),
(663, 107),
(664, 107),
(665, 107),
(666, 107),
(667, 107),
(668, 107),
(669, 107),
(670, 107),
(671, 107),
(672, 107),
(673, 107),
(674, 107),
(675, 107),
(676, 107),
(677, 107),
(678, 107),
(679, 107),
(680, 107),
(681, 107),
(682, 107),
(683, 107),
(684, 107),
(685, 107),
(686, 107),
(687, 107),
(688, 107),
(689, 107),
(690, 107),
(691, 107),
(692, 107),
(693, 107),
(694, 107),
(695, 107),
(696, 107),
(697, 107),
(698, 107),
(699, 107),
(700, 107),
(701, 107),
(702, 107),
(703, 107),
(704, 107),
(705, 107),
(706, 107),
(707, 107),
(708, 107),
(709, 107),
(710, 107),
(711, 107),
(712, 107),
(713, 107),
(714, 107),
(715, 107),
(716, 107),
(717, 107),
(718, 107),
(719, 107),
(720, 107),
(721, 107),
(722, 107),
(723, 107),
(724, 107),
(725, 107),
(726, 107),
(727, 107),
(728, 107),
(729, 107),
(730, 107),
(731, 107),
(732, 107),
(733, 107),
(734, 107),
(735, 107),
(736, 107),
(34, 108),
(35, 108),
(36, 108),
(37, 108),
(38, 108),
(39, 108),
(40, 108),
(41, 108),
(42, 108),
(43, 108),
(84, 108),
(85, 108),
(86, 108),
(87, 108),
(88, 108),
(89, 108),
(90, 108),
(91, 108),
(92, 108),
(93, 108),
(507, 108),
(508, 108),
(509, 108),
(532, 108),
(533, 108),
(534, 108),
(535, 108),
(536, 108),
(537, 108),
(538, 108),
(539, 108),
(540, 108),
(580, 108),
(581, 108),
(582, 108),
(583, 108),
(584, 108),
(585, 108),
(586, 108),
(587, 108),
(588, 108),
(589, 108),
(660, 108),
(661, 108),
(662, 108),
(663, 108),
(664, 108),
(665, 108),
(666, 108),
(667, 108),
(668, 108),
(708, 108),
(709, 108),
(710, 108),
(711, 108),
(712, 108),
(713, 108),
(714, 108),
(715, 108),
(716, 108),
(717, 108),
(508, 109),
(532, 109),
(533, 109),
(534, 109),
(535, 109),
(536, 109),
(537, 109),
(538, 109),
(539, 109),
(540, 109),
(580, 109),
(581, 109),
(582, 109),
(583, 109),
(584, 109),
(585, 109),
(586, 109),
(587, 109),
(588, 109),
(589, 109),
(510, 110),
(511, 110),
(44, 111),
(45, 111),
(46, 111),
(47, 111),
(48, 111),
(49, 111),
(50, 111),
(51, 111),
(52, 111),
(53, 111),
(54, 111),
(55, 111),
(56, 111),
(57, 111),
(58, 111),
(59, 111),
(60, 111),
(61, 111),
(62, 111),
(63, 111),
(64, 111),
(65, 111),
(66, 111),
(67, 111),
(68, 111),
(69, 111),
(70, 111),
(71, 111),
(72, 111),
(73, 111),
(104, 111),
(105, 111),
(106, 111),
(107, 111),
(108, 111),
(109, 111),
(110, 111),
(111, 111),
(112, 111),
(113, 111),
(141, 111),
(142, 111),
(143, 111),
(144, 111),
(145, 111),
(148, 111),
(510, 111),
(511, 111),
(512, 111),
(513, 111),
(541, 111),
(542, 111),
(543, 111),
(544, 111),
(545, 111),
(546, 111),
(547, 111),
(548, 111),
(549, 111),
(550, 111),
(551, 111),
(552, 111),
(553, 111),
(554, 111),
(555, 111),
(556, 111),
(557, 111),
(558, 111),
(559, 111),
(560, 111),
(561, 111),
(562, 111),
(563, 111),
(564, 111),
(565, 111),
(566, 111),
(567, 111),
(568, 111),
(569, 111),
(600, 111),
(601, 111),
(602, 111),
(603, 111),
(604, 111),
(605, 111),
(606, 111),
(607, 111),
(608, 111),
(669, 111),
(670, 111),
(671, 111),
(672, 111),
(673, 111),
(674, 111),
(675, 111),
(676, 111),
(677, 111),
(678, 111),
(679, 111),
(680, 111),
(681, 111),
(682, 111),
(683, 111),
(684, 111),
(685, 111),
(686, 111),
(687, 111),
(688, 111),
(689, 111),
(690, 111),
(691, 111),
(692, 111),
(693, 111),
(694, 111),
(695, 111),
(696, 111),
(697, 111),
(728, 111),
(729, 111),
(730, 111),
(731, 111),
(732, 111),
(733, 111),
(734, 111),
(735, 111),
(736, 111),
(141, 112),
(143, 112),
(145, 112),
(148, 112),
(511, 112),
(541, 112),
(542, 112),
(543, 112),
(544, 112),
(545, 112),
(546, 112),
(547, 112),
(548, 112),
(549, 112),
(550, 112),
(551, 112),
(552, 112),
(553, 112),
(554, 112),
(555, 112),
(556, 112),
(557, 112),
(558, 112),
(559, 112),
(560, 112),
(561, 112),
(562, 112),
(563, 112),
(564, 112),
(565, 112),
(566, 112),
(567, 112),
(568, 112),
(569, 112),
(600, 112),
(601, 112),
(602, 112),
(603, 112),
(604, 112),
(605, 112),
(606, 112),
(607, 112),
(608, 112);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `combo_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `rating` tinyint NOT NULL COMMENT 'Số sao từ 1 đến 5',
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung đánh giá',
  `images` json DEFAULT NULL COMMENT 'Mảng chứa link ảnh khách up',
  `status` enum('pending','approved','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `admin_reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Phản hồi từ shop',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `combo_id`, `user_id`, `order_id`, `rating`, `comment`, `images`, `status`, `admin_reply`, `created_at`, `updated_at`) VALUES
(2, NULL, 1, 69, 8, 4, 'Combo giá hời, mua tặng bạn gái rất ưng ý. Tuy nhiên giao hàng hơi chậm một chút so với dự kiến.', NULL, 'approved', NULL, '2026-03-28 02:15:00', '2026-03-31 03:42:44'),
(3, NULL, NULL, 73, 53, 5, 'quá đẹp', NULL, 'approved', NULL, '2026-04-23 00:53:06', '2026-04-23 00:53:06'),
(4, 48, NULL, 73, 54, 5, '10 diem', '[\"reviews/9BsHbmqSXxv4TIhe2HCUQosuDxAuQ4AUu8NmMZoD.jpg\"]', 'approved', NULL, '2026-04-23 01:17:44', '2026-04-23 01:17:44'),
(5, NULL, 5, 73, 61, 5, 'TUYỆT. ĐẸP', NULL, 'approved', NULL, '2026-04-24 23:45:39', '2026-04-24 23:45:39'),
(6, 70, NULL, 73, 61, 5, NULL, NULL, 'approved', NULL, '2026-04-24 23:45:39', '2026-04-24 23:45:39');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint NOT NULL,
  `value` varchar(50) NOT NULL,
  `label` varchar(70) NOT NULL,
  `badgeClass` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `level` int NOT NULL DEFAULT '5' COMMENT '1 is highest, 5 is lowest'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `value`, `label`, `badgeClass`, `created_at`, `updated_at`, `deleted_at`, `level`) VALUES
(1, 'admin', 'Quản trị viên (Super Admin)', 'text-bg-danger', '2025-11-19 01:21:33', '2025-11-30 11:38:13', NULL, 1),
(12, 'staff', 'Nhân viên', 'bg-primary', '2025-11-19 01:21:33', '2026-03-11 22:47:20', NULL, 3),
(13, 'blogger', 'Blogger', 'bg-info text-dark', '2025-11-19 01:21:33', '2026-04-24 21:47:59', NULL, 4),
(14, 'protect', 'Bảo vệ', 'bg-warning text-dark', '2025-11-20 03:49:01', '2026-05-15 07:36:54', NULL, 5),
(15, 'qc', 'Kiểm duyệt', 'text-bg-warning', '2025-11-28 07:07:28', '2026-03-11 23:59:16', NULL, 3),
(16, 'manage', 'quản lý', 'bg-danger', '2026-03-12 00:00:48', '2026-03-12 00:00:48', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tier_history`
--

CREATE TABLE `tier_history` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `old_tier_id` bigint UNSIGNED DEFAULT NULL,
  `new_tier_id` bigint UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL COMMENT 'VD: Đạt ngưỡng chi tiêu 50tr, Admin điều chỉnh...',
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tier_history`
--

INSERT INTO `tier_history` (`id`, `user_id`, `old_tier_id`, `new_tier_id`, `reason`, `created_at`) VALUES
(1, 73, NULL, 1, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 46,080,000 VNĐ', '2026-04-23 01:34:44'),
(2, 73, 1, 2, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 80,440,000 VNĐ', '2026-04-23 01:35:16'),
(3, 73, 2, 4, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 128,925,000 VNĐ', '2026-04-23 04:29:31'),
(4, 73, 4, 2, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 128,925,000 VNĐ', '2026-04-23 04:33:51'),
(5, 71, NULL, 1, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 15,000,000 VNĐ', '2026-04-23 05:00:11'),
(6, 69, NULL, 4, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 14,000,000 VNĐ', '2026-04-23 05:18:04'),
(7, 69, 4, 1, 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt 18,900,000 VNĐ', '2026-04-23 05:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `tier_service_usages`
--

CREATE TABLE `tier_service_usages` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `service_type` varchar(100) NOT NULL COMMENT 'VD: Danh bong, Ve sinh...',
  `product_code` varchar(100) DEFAULT NULL COMMENT 'Mã khắc trên trang sức (Bảo mật bước 2)',
  `used_at` datetime NOT NULL COMMENT 'Thời gian sử dụng',
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tier_service_usages`
--

INSERT INTO `tier_service_usages` (`id`, `user_id`, `order_id`, `service_type`, `product_code`, `used_at`, `notes`) VALUES
(1, 73, 56, 'tier_discount', NULL, '2026-04-23 10:06:57', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORABCYEHDF4'),
(2, 73, 57, 'tier_discount', NULL, '2026-04-23 11:32:13', 'Áp dụng giảm 10.00% hạng ttttttt1111111 cho đơn hàng SORAPZNR36WG'),
(3, 73, 58, 'tier_discount', NULL, '2026-04-24 13:11:48', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORAQZDYHQFI'),
(4, 73, 59, 'tier_discount', NULL, '2026-04-25 06:03:04', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORAWUXHJAND'),
(5, 73, 60, 'tier_discount', NULL, '2026-04-25 06:22:24', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORAMV8HUONU'),
(6, 73, 61, 'tier_discount', NULL, '2026-04-25 06:42:29', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORAWUVNV8S4'),
(7, 73, 62, 'tier_discount', NULL, '2026-04-25 06:42:56', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORACB46UZBE'),
(8, 73, 63, 'tier_discount', NULL, '2026-04-25 06:58:30', 'Áp dụng giảm 5.00% hạng Vàng cho đơn hàng SORAPMBOYXSN');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `fullName` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `tier_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Khóa ngoại liên kết tới membership_tiers',
  `accumulated_spent` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tổng tiền đã chi tiêu (Chính thức)',
  `pending_spent` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tổng tiền Đang chờ qua thời hạn đổi trả (Câu hỏi 4)',
  `accumulated_orders` int NOT NULL DEFAULT '0' COMMENT 'Tổng số đơn hàng thành công',
  `is_affiliate` tinyint(1) DEFAULT '0' COMMENT 'Đánh dấu tài khoản đã là đối tác chưa',
  `affiliate_code` varchar(50) DEFAULT NULL COMMENT 'Mã định danh affiliate duy nhất (VD: SORA-VIP-123)',
  `commission_balance` decimal(15,2) DEFAULT '0.00' COMMENT 'Số dư ví hoa hồng hiện tại có thể rút'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `email`, `phone`, `password`, `avatar_url`, `status`, `created_at`, `updated_at`, `deleted_at`, `remember_token`, `email_verified_at`, `birthday`, `gender`, `google_id`, `facebook_id`, `tier_id`, `accumulated_spent`, `pending_spent`, `accumulated_orders`, `is_affiliate`, `affiliate_code`, `commission_balance`) VALUES
(69, 'Nguyễn Văn A', 'Test1@gmail.com', '0345678910', '$2y$12$Vglf.4rPJn7ZiE8R3c/ph.nP4M8rmSIzM4zXL6qAjA44iiCeLVnRK', 'avatars/users/4yJLSGGEhKKrE6DfsyaNG7iV1OblWdaSYZKULLx9.png', 'active', '2026-03-12 06:55:46', '2026-04-23 07:05:28', NULL, NULL, NULL, '2001-02-12', 'Khác', NULL, NULL, 1, 25900000.00, 0.00, 4, 0, NULL, 0.00),
(70, 'hiếu hoàng', 'hieuhtpk04060@gmail.com', '0377975276', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIoYOAc_3ft1LvAncmvZpEEvi4z_B56qPdBF49BDYvv026lnCU=s96-c', 'active', '2026-03-23 20:06:52', '2026-05-19 05:29:59', NULL, NULL, NULL, NULL, NULL, '106247632177692093262', NULL, NULL, 0.00, 0.00, 0, 0, NULL, 0.00),
(71, 'Hiếu Hoàng', 'hieuv12321@gmail.com', NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLR0huCVACXF0eu9h48wKIjiBUHPOaEGVlpOP1tBiVRucDaqkL3=s96-c', 'active', '2026-03-31 05:55:02', '2026-04-23 05:00:11', NULL, NULL, NULL, NULL, NULL, '112089839400290206859', NULL, 1, 15000000.00, 0.00, 1, 0, NULL, 0.00),
(72, 'Lê Thị Mỹ Duyên', 'duyenltmpk04047@gmail.com', NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJIZeavuVcCLehh-BO_p4h9U9bNppiwwPFN7RbW1GwdBz_SGw=s96-c', 'active', '2026-04-10 07:46:11', '2026-04-10 07:46:11', NULL, NULL, NULL, NULL, NULL, '118289419355486494298', NULL, NULL, 0.00, 0.00, 0, 0, NULL, 0.00),
(73, 'hieu', 'issehieu1115@gmail.com', '0345678912', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIN_P0P0Ff0O9yt3pl5xnt7ZWr8qfh4Tm4YFtjBkY_NkFJdOWKY=s96-c', 'active', '2026-04-16 03:17:17', '2026-05-21 01:06:00', NULL, NULL, NULL, '2024-02-04', 'Nam', '114085198581602648273', NULL, 2, 174955000.00, 0.00, 5, 0, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(255) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `customer_name`, `customer_phone`, `shipping_address`, `city`, `district`, `ward`, `is_default`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 69, 'Nguyễn Văn A', '0345678910', '2', 'Tỉnh Cà Mau', 'Thành phố Cà Mau', 'Xã Lý Văn Lâm', 0, '2026-03-12 07:26:15', '2026-03-26 06:11:01', NULL),
(2, 69, 'Test11', '0345678910', 'aa', 'Tỉnh Cà Mau', 'Huyện Cái Nước', 'Thị trấn Cái Nước', 0, '2026-03-12 07:32:40', '2026-03-17 07:31:54', '2026-03-17 07:31:54'),
(3, 69, 'Nguyễn Văn A', '0345678910', 'aaaa', 'Tỉnh Bình Định', 'Thị xã An Nhơn', 'Xã Nhơn Phúc', 1, '2026-03-26 05:48:12', '2026-03-26 06:11:01', NULL),
(4, 73, 'hieu2', '0345678912', '01', 'Thành phố Hồ Chí Minh', 'Quận 1', 'Phường Tân Định', 0, '2026-04-23 06:55:31', '2026-05-19 05:29:43', NULL),
(5, 73, 'hieu2', '0345678912', '4a', 'Tỉnh Bến Tre', 'Thành phố Bến Tre', 'Phường 8', 1, '2026-04-24 22:38:56', '2026-05-19 05:29:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'ID người yêu cầu rút',
  `amount` decimal(15,2) NOT NULL COMMENT 'Số tiền muốn rút',
  `bank_info` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Thông tin nhận tiền: Tên ngân hàng, Số tài khoản, Tên chủ khoản',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Trạng thái xử lý lệnh rút',
  `transaction_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã giao dịch ngân hàng sau khi kế toán chuyển khoản thành công',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_shifts`
--

CREATE TABLE `work_shifts` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên ca (VD: Ca Sáng, Ca Chiều, Hành Chính)',
  `start_time` time NOT NULL COMMENT 'Giờ bắt đầu ca (VD: 08:00:00)',
  `end_time` time NOT NULL COMMENT 'Giờ kết thúc ca (VD: 17:30:00)',
  `late_tolerance` int NOT NULL DEFAULT '0' COMMENT 'Số phút cho phép đi muộn (VD: 15)',
  `is_overnight` tinyint(1) NOT NULL DEFAULT '0',
  `working_days` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `overtime_days` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_shifts`
--

INSERT INTO `work_shifts` (`id`, `name`, `start_time`, `end_time`, `late_tolerance`, `is_overnight`, `working_days`, `created_at`, `updated_at`, `deleted_at`, `overtime_days`) VALUES
(1, 'Hành chính', '08:00:00', '17:30:00', 0, 0, '[false, false, false, false, false, true, false]', '2026-05-20 01:37:23', '2026-05-20 19:05:35', NULL, '[false, false, false, false, false, true, false]'),
(2, 'test', '20:54:00', '03:54:00', 0, 1, '[true, true, true, true, true, false, false]', '2026-05-20 06:54:33', '2026-05-20 20:34:08', NULL, '[true, true, true, true, true, false, false]');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_role` (`role_id`);

--
-- Indexes for table `admin_attendances`
--
ALTER TABLE `admin_attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_attendances_admin_id_attendance_date_index` (`admin_id`,`attendance_date`),
  ADD KEY `admin_attendances_work_shift_id_foreign` (`work_shift_id`);

--
-- Indexes for table `admin_shift_assignments`
--
ALTER TABLE `admin_shift_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_shift_assignments_work_shift_id_foreign` (`work_shift_id`),
  ADD KEY `admin_shift_assignments_admin_id_foreign` (`admin_id`);

--
-- Indexes for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applications_user_status` (`user_id`,`status`);

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attr_values_attr` (`attribute_id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `banners_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_session_id_unique` (`session_id`),
  ADD KEY `carts_user_id_index` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_variant` (`cart_id`,`product_variant_id`),
  ADD KEY `fk_cart_items_variant` (`product_variant_id`),
  ADD KEY `fk_cart_items_combo` (`combo_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_categories_parent` (`parent_id`);

--
-- Indexes for table `chatbot_responses`
--
ALTER TABLE `chatbot_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chatbot_responses_keyword_unique` (`keyword`);

--
-- Indexes for table `combos`
--
ALTER TABLE `combos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `combo_items`
--
ALTER TABLE `combo_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_combo_items_combo` (`combo_id`),
  ADD KEY `fk_combo_items_product` (`product_id`),
  ADD KEY `fk_combo_items_variant` (`product_variant_id`);

--
-- Indexes for table `commission_histories`
--
ALTER TABLE `commission_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_commissions_user_id` (`user_id`),
  ADD KEY `fk_commissions_order_id` (`order_id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `customer_galleries`
--
ALTER TABLE `customer_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `favourites`
--
ALTER TABLE `favourites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fav_user_product_unique` (`user_id`,`product_id`);

--
-- Indexes for table `membership_tiers`
--
ALTER TABLE `membership_tiers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `module_permissions`
--
ALTER TABLE `module_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `module_code` (`module_code`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `news_slug_unique` (`slug`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_orders_affiliate_id` (`affiliate_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `product_variant_id` (`product_variant_id`);

--
-- Indexes for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_products_category` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_images_product` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_variants_product` (`product_id`);

--
-- Indexes for table `product_variant_attributes`
--
ALTER TABLE `product_variant_attributes`
  ADD PRIMARY KEY (`variant_id`,`attribute_value_id`),
  ADD KEY `fk_pva_value` (`attribute_value_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rev_prod_unq` (`user_id`,`product_id`,`order_id`),
  ADD UNIQUE KEY `rev_combo_unq` (`user_id`,`combo_id`,`order_id`),
  ADD KEY `reviews_product_id_foreign` (`product_id`),
  ADD KEY `reviews_combo_id_foreign` (`combo_id`),
  ADD KEY `reviews_order_id_foreign` (`order_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `value` (`value`);

--
-- Indexes for table `tier_history`
--
ALTER TABLE `tier_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tier_service_usages`
--
ALTER TABLE `tier_service_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usage_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affiliate_code` (`affiliate_code`),
  ADD UNIQUE KEY `users_email_unique` (((case when (`deleted_at` is null) then `email` else NULL end))),
  ADD UNIQUE KEY `users_phone_unique` (((case when (`deleted_at` is null) then `phone` else NULL end))),
  ADD KEY `users_index_0` (`deleted_at`),
  ADD KEY `users_tier_id_foreign` (`tier_id`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_addresses_index_5` (`user_id`);

--
-- Indexes for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_withdrawals_user_status` (`user_id`,`status`);

--
-- Indexes for table `work_shifts`
--
ALTER TABLE `work_shifts`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `admin_attendances`
--
ALTER TABLE `admin_attendances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin_shift_assignments`
--
ALTER TABLE `admin_shift_assignments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `chatbot_responses`
--
ALTER TABLE `chatbot_responses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `combos`
--
ALTER TABLE `combos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `combo_items`
--
ALTER TABLE `combo_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `commission_histories`
--
ALTER TABLE `commission_histories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `customer_galleries`
--
ALTER TABLE `customer_galleries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `favourites`
--
ALTER TABLE `favourites`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `membership_tiers`
--
ALTER TABLE `membership_tiers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `module_permissions`
--
ALTER TABLE `module_permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=159;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=219;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=737;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tier_history`
--
ALTER TABLE `tier_history`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tier_service_usages`
--
ALTER TABLE `tier_service_usages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `withdrawals`
--
ALTER TABLE `withdrawals`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_shifts`
--
ALTER TABLE `work_shifts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `FK_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `admin_attendances`
--
ALTER TABLE `admin_attendances`
  ADD CONSTRAINT `admin_attendances_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_attendances_work_shift_id_foreign` FOREIGN KEY (`work_shift_id`) REFERENCES `work_shifts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `admin_shift_assignments`
--
ALTER TABLE `admin_shift_assignments`
  ADD CONSTRAINT `admin_shift_assignments_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_shift_assignments_work_shift_id_foreign` FOREIGN KEY (`work_shift_id`) REFERENCES `work_shifts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  ADD CONSTRAINT `fk_applications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `fk_attr_values_attr` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `banners`
--
ALTER TABLE `banners`
  ADD CONSTRAINT `banners_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_items_combo` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `combo_items`
--
ALTER TABLE `combo_items`
  ADD CONSTRAINT `fk_combo_items_combo` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_combo_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_combo_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `commission_histories`
--
ALTER TABLE `commission_histories`
  ADD CONSTRAINT `fk_commissions_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commissions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `order_status_histories_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variant_attributes`
--
ALTER TABLE `product_variant_attributes`
  ADD CONSTRAINT `fk_pva_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pva_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_combo_id_foreign` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tier_service_usages`
--
ALTER TABLE `tier_service_usages`
  ADD CONSTRAINT `usage_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_tier_id_foreign` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `fk_withdrawals_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
