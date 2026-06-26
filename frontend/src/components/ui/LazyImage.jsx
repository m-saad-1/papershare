import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage Component
 *
 * A performant image component with:
 * - Intersection Observer for lazy loading
 * - Skeleton/blur placeholder states
 * - Aspect ratio support
 * - Error fallback handling
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} aspectRatio - 'auto' | 'square' | '16/9' | '4/3' | '3/2' | 'paper'
 * @param {React.ReactNode} fallback - Fallback component when image fails to load
 * @param {string} placeholder - 'blur' | 'skeleton'
 * @param {string} objectFit - 'cover' | 'contain' | 'fill'
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  aspectRatio = 'auto',
  fallback = null,
  placeholder = 'skeleton',
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectClasses = {
    'auto': '',
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    'paper': 'aspect-[8.5/11]',
    'thumbnail': 'aspect-[4/3]',
  };

  const objectFitClasses = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
  };

  // Return fallback if image failed to load
  if (hasError && fallback) {
    return fallback;
  }

  // Default error state
  if (hasError && !fallback) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${aspectClasses[aspectRatio]} ${className}`}
      >
        <div className="text-gray-400 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 ${
            placeholder === 'skeleton'
              ? 'bg-gray-200 animate-pulse'
              : 'bg-gray-100'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Image */}
      {isInView && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full ${objectFitClasses[objectFit]} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

/**
 * Avatar variant of LazyImage for user profile pictures
 */
export const LazyAvatar = ({
  src,
  alt = '',
  size = 'md',
  className = '',
  fallbackInitial = '',
}) => {
  const sizeClasses = {
    'xs': 'w-6 h-6 text-xs',
    'sm': 'w-8 h-8 text-sm',
    'md': 'w-10 h-10 text-base',
    'lg': 'w-12 h-12 text-lg',
    'xl': 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const fallback = (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium ${className}`}
    >
      {fallbackInitial || (
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );

  if (!src) {
    return fallback;
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={`${sizeClasses[size]} rounded-full ${className}`}
      fallback={fallback}
      objectFit="cover"
    />
  );
};

export default LazyImage;
