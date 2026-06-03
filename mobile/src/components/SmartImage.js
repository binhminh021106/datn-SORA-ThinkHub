import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';

// Top-level require để Metro bundler nhận đúng static asset
const SORA_PLACEHOLDER = require('../../assets/Sora-placeholder.png');

/**
 * SmartImage – Image wrapper tự động hiện ảnh SORA placeholder khi ảnh gốc lỗi.
 */
export default function SmartImage({ source, style, resizeMode = 'cover', ...rest }) {
  const [hasError, setHasError] = useState(false);
  const hasMissingSource = !source || (typeof source === 'object' && 'uri' in source && !source.uri);

  if (hasError || hasMissingSource) {
    return (
      <View style={[{ overflow: 'hidden' }, style]}>
        <Image
          source={SORA_PLACEHOLDER}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({});
