import React, { createContext, useState, useContext } from 'react';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState({}); 
  const addReview = (cafeId, review) => {
    setReviews(prevReviews => ({
      ...prevReviews,
      [cafeId]: [review, ...(prevReviews[cafeId] || [])]
    }));
  };

  const getReviewsByCafeId = (cafeId) => {
    return reviews[cafeId] || [];
  };

  const value = {
    addReview,
    getReviewsByCafeId
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};