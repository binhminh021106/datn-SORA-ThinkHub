import { Image } from 'react-native';

const loadedUrls = new Set();
const prefetchedUrls = new Set();
const inFlightUrls = new Set();
const PREFETCH_CONCURRENCY = 4;

export const markImageUrlLoaded = (url) => {
  if (url) {
    loadedUrls.add(url);
    prefetchedUrls.add(url);
  }
};

export const isImageUrlLoaded = (url) => !!url && loadedUrls.has(url);

export const prefetchImageUrls = (urls = []) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))]
    .filter((url) => !loadedUrls.has(url) && !prefetchedUrls.has(url) && !inFlightUrls.has(url));

  uniqueUrls.forEach((url) => {
    prefetchedUrls.add(url);
    inFlightUrls.add(url);
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
