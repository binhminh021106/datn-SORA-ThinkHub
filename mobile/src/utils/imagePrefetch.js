import { Image } from 'react-native';

const loadedUrls = new Set();
const prefetchedUrls = new Set();
const inFlightUrls = new Set();
const PREFETCH_CONCURRENCY = 4;
const MAX_TRACKED_IMAGE_URLS = 300;

const rememberUrl = (url, targetSet) => {
  if (!url) return;

  if (targetSet.has(url)) {
    targetSet.delete(url);
  }

  targetSet.add(url);

  while (targetSet.size > MAX_TRACKED_IMAGE_URLS) {
    const oldestUrl = targetSet.values().next().value;
    targetSet.delete(oldestUrl);
    loadedUrls.delete(oldestUrl);
    prefetchedUrls.delete(oldestUrl);
    inFlightUrls.delete(oldestUrl);
  }
};

export const markImageUrlLoaded = (url) => {
  if (url) {
    rememberUrl(url, loadedUrls);
    rememberUrl(url, prefetchedUrls);
  }
};

export const isImageUrlLoaded = (url) => !!url && loadedUrls.has(url);

export const prefetchImageUrls = (urls = []) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))]
    .filter((url) => !loadedUrls.has(url) && !prefetchedUrls.has(url) && !inFlightUrls.has(url));

  uniqueUrls.forEach((url) => {
    rememberUrl(url, prefetchedUrls);
    rememberUrl(url, inFlightUrls);
  });

  for (let index = 0; index < uniqueUrls.length; index += PREFETCH_CONCURRENCY) {
    const chunk = uniqueUrls.slice(index, index + PREFETCH_CONCURRENCY);
    setTimeout(() => {
      chunk.forEach((url) => {
        Image.prefetch(url)
          .then((isPrefetched) => {
            if (isPrefetched) {
              markImageUrlLoaded(url);
            } else {
              prefetchedUrls.delete(url);
            }
          })
          .catch(() => {
            prefetchedUrls.delete(url);
          })
          .finally(() => {
            inFlightUrls.delete(url);
          });
      });
    }, index * 80);
  }
};
