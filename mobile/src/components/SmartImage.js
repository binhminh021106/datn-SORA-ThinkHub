import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';

// Top-level require để Metro bundler nhận đúng static asset
const SORA_PLACEHOLDER = require('../../assets/Sora-placeholder.png');

const withImageCache = (imageSource) => {
  if (imageSource && typeof imageSource === 'object' && 'uri' in imageSource && imageSource.uri) {
    return { ...imageSource, cache: imageSource.cache || 'force-cache' };
  }
  return imageSource;
};

/**
 * SmartImage – Image wrapper tự động hiện ảnh SORA placeholder khi ảnh gốc lỗi.
 */
export default function SmartImage({ source, previewSource, style, resizeMode = 'cover', onLoadEnd, ...rest }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasMissingSource = !source || (typeof source === 'object' && 'uri' in source && !source.uri);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [source?.uri]);

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
    <View style={[{ overflow: 'hidden', backgroundColor: '#fff' }, style]}>
      <Image
        source={withImageCache(previewSource) || SORA_PLACEHOLDER}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode={resizeMode}
      />
      <Image
        source={withImageCache(source)}
        style={[
          StyleSheet.absoluteFill,
          { width: '100%', height: '100%', opacity: isLoaded ? 1 : 0 },
        ]}
        resizeMode={resizeMode}
        onLoadEnd={(event) => {
          setIsLoaded(true);
          onLoadEnd?.(event);
        }}
        onError={() => setHasError(true)}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
