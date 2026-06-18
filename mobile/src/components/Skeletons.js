import React from 'react';
import { StyleSheet, View } from 'react-native';

export const SkeletonLine = ({ style }) => (
  <View style={[styles.line, style]} />
);

export const CategorySkeleton = ({ size = 64, textWidth = 54, style }) => (
  <View style={[styles.categoryItem, style]}>
    <View
      style={[
        styles.categoryCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
    <SkeletonLine style={[styles.categoryText, { width: textWidth }]} />
  </View>
);

export const ProductCardSkeleton = ({ width = 165, style }) => (
  <View style={[styles.productCard, { width }, style]}>
    <View style={styles.productImage} />
    <View style={styles.productBody}>
      <SkeletonLine style={styles.lineShort} />
      <SkeletonLine style={styles.lineFull} />
      <SkeletonLine style={styles.lineMedium} />
      <View style={styles.productFooter}>
        <View style={styles.price} />
        <View style={styles.iconCircle} />
      </View>
    </View>
  </View>
);

export const BannerSkeleton = ({ width, height }) => (
  <View style={[styles.banner, { width, height }]}>
    <View style={styles.bannerLabel} />
    <View style={styles.bannerTitle} />
    <View style={styles.bannerButton} />
  </View>
);

export const SkeletonDot = ({ style }) => (
  <View style={[styles.dot, style]} />
);

export const CouponSkeleton = ({ style }) => (
  <View style={[styles.couponCard, style]}>
    <View style={styles.couponInner}>
      <View style={styles.couponTop}>
        <SkeletonLine style={styles.lineMedium} />
        <View style={styles.couponValue} />
      </View>
      <View style={styles.couponBottom}>
        <SkeletonLine style={styles.lineShort} />
        <View style={styles.skeletonButton} />
      </View>
    </View>
  </View>
);

export const ComboSkeleton = ({ width, style }) => (
  <View style={[styles.comboCard, { width }, style]}>
    <View style={styles.comboImage} />
    <View style={styles.comboBody}>
      <SkeletonLine style={styles.lineTiny} />
      <SkeletonLine style={styles.lineFull} />
      <SkeletonLine style={styles.lineMedium} />
      <View style={styles.skeletonButton} />
    </View>
  </View>
);

export const NewsCardSkeleton = ({ style }) => (
  <View style={[styles.newsCard, style]}>
    <View style={styles.newsImage} />
    <View style={styles.newsBody}>
      <SkeletonLine style={styles.lineTiny} />
      <SkeletonLine style={styles.lineFull} />
      <SkeletonLine style={styles.lineMedium} />
      <SkeletonLine style={styles.lineShort} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  line: {
    height: 9,
    borderRadius: 5,
    backgroundColor: '#eee5d8',
  },
  lineTiny: {
    width: '34%',
  },
  lineShort: {
    width: '46%',
  },
  lineMedium: {
    width: '64%',
  },
  lineFull: {
    width: '88%',
    height: 11,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryCircle: {
    backgroundColor: '#f0e8dc',
    borderWidth: 2,
    borderColor: '#ead9bf',
    marginBottom: 7,
  },
  categoryText: {
    height: 9,
  },
  productCard: {
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0e4cf',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f1ebe2',
  },
  productBody: {
    paddingHorizontal: 10,
    paddingVertical: 11,
    gap: 8,
  },
  productFooter: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    width: '55%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ead9bf',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f2e8db',
  },
  banner: {
    backgroundColor: '#efe7db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLabel: {
    width: 120,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e7ce7d',
    opacity: 0.65,
    marginBottom: 16,
  },
  bannerTitle: {
    width: '58%',
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e1d6c8',
    marginBottom: 18,
  },
  bannerButton: {
    width: 150,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e7ce7d',
    backgroundColor: '#f7f0df',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0d5c5',
    marginHorizontal: 4,
  },
  couponCard: {
    width: 250,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7ce7d',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  couponInner: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(231, 206, 125, 0.05)',
  },
  couponTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponValue: {
    width: 72,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ead9bf',
  },
  couponBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonButton: {
    width: 90,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ead9bf',
  },
  comboCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0e4cf',
    marginBottom: 10,
  },
  comboImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1ebe2',
  },
  comboBody: {
    padding: 14,
    gap: 9,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  newsImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f1ebe2',
  },
  newsBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
});
