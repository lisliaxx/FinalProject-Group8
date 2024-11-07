import React, { createContext, useState, useContext } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});

  const addReview = (cafeId, review) => {
    setReviews(prevReviews => ({
      ...prevReviews,
      [cafeId]: [...(prevReviews[cafeId] || []), review]
    }));
  };

  const getReviewsByCafeId = (cafeId) => {
    return reviews[cafeId] || [];
  };

  return (
    <ReviewContext.Provider value={{ addReview, getReviewsByCafeId }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};