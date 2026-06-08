import { Image } from 'react-native';

export const prefetchImageUrls = (urls = []) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  uniqueUrls.forEach((url) => {
    Image.prefetch(url).catch(() => {});
  });
};
