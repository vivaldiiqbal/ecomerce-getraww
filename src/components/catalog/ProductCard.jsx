import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { getImageUrl } from '../../services/api';
import { Heart, Eye } from 'lucide-react';

export const ProductCard = React.memo(({ product }) => {
  const {
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setQuickViewProduct
  } = useShop();

  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlist?.includes(product?.id);
  const hasDiscount = product?.discount !== null;

  // Image Fallback Placeholder SVG
  const fallbackImg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f3f3f3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23999999'>GETRAW®</text></svg>";

  const currentImage = imgError ? fallbackImg : getImageUrl(isHovered && product?.hoverImage ? product.hoverImage : product?.image);

  return (
    <div
      className="product-card group flex flex-col justify-between h-full bg-white border border-transparent hover:border-neutral-200 transition-all duration-300 rounded-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Product Image Container */}
        <div
          className="relative bg-[#f8f8f8] w-full aspect-square overflow-hidden flex items-center justify-center p-3 cursor-pointer select-none"
          onClick={() => setQuickViewProduct(product)}
        >
          {/* Black Square 50% Discount Badge Top Right */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-black text-white text-[11px] font-black px-2 py-0.5 uppercase z-10 tracking-wider">
              {product?.discount || '50%'}
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product?.id);
            }}
            className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-xs"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black text-black group-hover:text-white' : ''}`} />
          </button>

          {/* Main Product Image with Error Fallback */}
          <img
            src={currentImage}
            alt={product?.title || 'Product Image'}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Quick View Button Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-10">
            <button
              onClick={() => setQuickViewProduct(product)}
              className="bg-white text-black px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Details with Light Grey Background Highlight on Hover */}
        <div className="pt-3.5 pb-2 px-2 flex flex-col transition-colors group-hover:bg-neutral-100">
          <h3
            onClick={() => setQuickViewProduct(product)}
            className="text-xs sm:text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2 hover:underline cursor-pointer min-h-[36px]"
          >
            {product?.title}
          </h3>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
              {formatPrice(product?.finalPrice ?? product?.price ?? 0)}
            </span>
            {(product?.originalPrice !== undefined || (product?.price && product?.price !== product?.finalPrice)) && (
              <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
                {formatPrice(product?.originalPrice ?? product?.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Size Chips */}
      <div className="pt-2 px-2 pb-2 border-t border-neutral-100 group-hover:bg-neutral-100 transition-colors">
        <div className="flex flex-wrap gap-1">
          {product?.sizes?.map(sz => (
            <button
              key={sz}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, sz, 1);
              }}
              className="px-2 py-0.5 border border-neutral-300 text-[10px] font-semibold text-neutral-800 hover:border-black hover:bg-black hover:text-white transition-colors bg-white"
              title={`Tambah Ukuran ${sz} ke Kantong`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
