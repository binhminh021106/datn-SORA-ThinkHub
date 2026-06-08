const toFiniteNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getServerReviewCount = (product) => {
  if (!product) return 0;

  const candidates = [
    product.reviews_count,
    product.review_count,
    product.total_reviews,
    product.reviewsCount,
  ];

  const count = candidates
    .map(toFiniteNumber)
    .find((value) => value > 0);

  return count || 0;
};

export const getProductReviewStats = (product) => {
  if (!product) {
    return { count: 0, average: 0 };
  }

  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const localReviewCount = reviews.length;
  const serverReviewCount = getServerReviewCount(product);
  const count = serverReviewCount > 0 ? serverReviewCount : localReviewCount;

  if (count <= 0) {
    return { count: 0, average: 0 };
  }

  if (localReviewCount > 0 && (!serverReviewCount || localReviewCount >= serverReviewCount)) {
    const totalRating = reviews.reduce((sum, review) => sum + toFiniteNumber(review.rating), 0);
    return {
      count,
      average: Math.min(Math.max(totalRating / localReviewCount, 0), 5),
    };
  }

  const average = [
    product.reviews_avg_rating,
    product.rating_avg,
    product.rating_average,
    product.average_rating,
    product.rating,
  ]
    .map(toFiniteNumber)
    .find((value) => value > 0);

  if (average > 0) {
    return {
      count,
      average: Math.min(Math.max(average, 0), 5),
    };
  }

  if (localReviewCount > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + toFiniteNumber(review.rating), 0);
    return {
      count,
      average: Math.min(Math.max(totalRating / localReviewCount, 0), 5),
    };
  }

  return {
    count,
    average: 0,
  };
};
