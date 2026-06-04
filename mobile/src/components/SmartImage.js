import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';

// Top-level require để Metro bundler nhận đúng static asset
const SORA_PLACEHOLDER = require('../../assets/Sora-placeholder.png');

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

  if (previewSource) {
    return (
      <View style={[{ overflow: 'hidden', backgroundColor: '#fff' }, style]}>
        <Image
          source={previewSource}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          resizeMode={resizeMode}
        />
        <Image
          source={source}
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

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onLoadEnd={onLoadEnd}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({});
