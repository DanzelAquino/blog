import React from 'react';

const SkeletonBlogCard: React.FC = () => {
  return (
    <div className="blog-card blog-card-skeleton">
      <div className="blog-card-image skeleton-image"></div>
      <div className="blog-card-content-wrapper">
        <div className="skeleton-title"></div>
        <div className="skeleton-content"></div>
        <div className="skeleton-content"></div>
        <div className="skeleton-content"></div>
        <div className="skeleton-footer"></div>
      </div>
    </div>
  );
};

export default SkeletonBlogCard;