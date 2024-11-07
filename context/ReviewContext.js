import React, { createContext, useState, useContext } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  // Store reviews as an object with cafeId as keys
  const [reviews, setReviews] = useState({});

  const addReview = (cafeId, review) => {
    if (!cafeId) return; 

    setReviews(prevReviews => ({
      ...prevReviews,
      [cafeId]: [...(prevReviews[cafeId] || []), review]
    }));
  };

  const getReviewsByCafeId = (cafeId) => {
    if (!cafeId) return []; 
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