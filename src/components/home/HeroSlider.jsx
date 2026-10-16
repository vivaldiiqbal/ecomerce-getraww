import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSlider = () => {
  const { setFilters } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = React.useMemo(() => [
    {
      id: 1,
      title: "GETRAW 90s Banner",
      image: "/banner1.png",
      action: () => setFilters(prev => ({ ...prev, categories: ['Tees'], productType: 'all', searchQuery: '' }))
    },
    {
      id: 2,
      title: "GETRAW Forever FTP Banner",
      image: "/banner2.png",
      action: () => setFilters(prev => ({ ...prev, productType: 'all', searchQuery: '' }))
    },
    {
      id: 3,
      title: "GETRAW Graffiti Banner",
      image: "/banner3.png",
      action: () => setFilters(prev => ({ ...prev, productType: 'discount', searchQuery: '' }))
    }
  ], [setFilters]);

  const scrollToCatalog = React.useCallback(() => {
    document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, slides.length]);

  const handleManualSlide = React.useCallback((newIndex) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentSlide(newIndex);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-black text-white border-b border-neutral-800 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[50vh] sm:h-[65vh] md:h-[75vh] flex items-center justify-center bg-black">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            onClick={() => {
              slide.action();
              scrollToCatalog();
            }}
            className={`carousel-slide absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out flex items-center justify-center p-4 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-contain max-h-full transition-transform duration-500 ease-out hover:scale-[1.01]"
            />
          </div>
        ))}

        {/* Manual Arrow Controls */}
        <button
          onClick={() => handleManualSlide((currentSlide - 1 + slides.length) % slides.length)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 border border-neutral-700 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all shadow-lg rounded-full"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleManualSlide((currentSlide + 1) % slides.length)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 border border-neutral-700 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all shadow-lg rounded-full"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-neutral-800">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleManualSlide(i)}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === currentSlide ? 'w-8 bg-red-600' : 'w-2 bg-neutral-500 hover:bg-white'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
