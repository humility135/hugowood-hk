import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { useSiteStore, Section } from '../lib/store';
import { ArrowRight, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'shield': <Shield className="w-8 h-8 text-blue-900" />,
  'truck': <Truck className="w-8 h-8 text-blue-900" />,
  'refresh-cw': <RefreshCw className="w-8 h-8 text-blue-900" />
};

const Home = () => {
  const { sections, updateSection } = useSiteStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Migration: Fix default title
  useEffect(() => {
    const trendingSection = sections.find(s => s.id === 'trending');
    if (trendingSection && trendingSection.title === '本週熱門') {
        updateSection('trending', { title: 'HOT SALE' });
    }
  }, []); // Run once on mount to avoid infinite loops if sections changes trigger re-runs


  // Get Hero Section
  const heroSection = sections.find(s => s.type === 'hero' && s.isVisible);
  const slides = heroSection?.content.slides || [];

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    const nextImage = slides[nextIndex]?.image;
    if (!nextImage) return;
    const img = new Image();
    img.src = nextImage;
  }, [currentSlide, slides]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const homepageSelect = 'id,name,description,price,sale_price,images,sizes,colors,stock_quantity,category,series,created_at,updated_at';

        const [trendingRes, newRes] = await Promise.all([
          supabase
            .from('products')
            .select(homepageSelect)
            .eq('is_deleted', false)
            .not('sale_price', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(4)
            .abortSignal(controller.signal),
          supabase
            .from('products')
            .select(homepageSelect)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(4)
            .abortSignal(controller.signal),
        ]);

        if (!trendingRes.error) setProducts(trendingRes.data || []);
        if (!newRes.error) setNewArrivals(newRes.data || []);

      } catch (error: any) {
        if (
          error.name === 'AbortError' || 
          error.message?.includes('AbortError') ||
          error.message?.includes('aborted')
        ) {
          // Request aborted, do nothing
        } else {
          console.error('Error fetching products:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  const renderHero = () => {
    if (!heroSection || slides.length === 0) return null;
    const slide = slides[currentSlide];
    
    return (
      <section className="bg-black text-white rounded-2xl overflow-hidden relative h-[600px] flex items-center group">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 opacity-90"></div>
        
        <img
          src={slide.image}
          alt={`Hero Background ${currentSlide + 1}`}
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
          loading="eager"
          decoding="async"
        />

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-r-lg backdrop-blur-sm transition-all z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-l-lg backdrop-blur-sm transition-all z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-20 px-8 md:px-16 max-w-3xl">
          <span className="text-orange-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block animate-fade-in-up">
            {slide.subtitle}
          </span>
          <h1 
            className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight min-h-[160px] md:min-h-[220px] transition-all duration-500"
            dangerouslySetInnerHTML={{ __html: slide.title }}
          >
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-300 font-light max-w-xl leading-relaxed border-l-4 border-orange-500 pl-6 min-h-[80px]">
            {slide.description.split('\n').map((line: string, i: number) => (
                <React.Fragment key={i}>
                    {line}
                    <br />
                </React.Fragment>
            ))}
          </p>
          <div className="flex space-x-4 mb-8">
            <Link
                to={slide.link}
                className="inline-block bg-white text-black font-bold py-4 px-10 rounded-full transition-all transform hover:bg-gray-200 hover:scale-105 hover:shadow-lg"
            >
                立即選購
            </Link>
            <Link
                to="/about"
                className="inline-block border border-white/30 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full transition-all hover:bg-white/10"
            >
                了解品牌
            </Link>
          </div>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-8 md:left-16 flex space-x-2">
            {slides.map((_: any, index: number) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-orange-500' : 'w-4 bg-gray-600 hover:bg-gray-400'}`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderProductsGrid = (section: Section) => {
    const isNewArrivals = section.content.source === 'new_arrivals';
    const displayProducts = isNewArrivals ? newArrivals : products;
    const link = isNewArrivals ? "/products?sort=newest" : "/products?sort=trending";

    return (
      <section>
        <div className="flex flex-col items-center mb-10 relative">
            <h2 className="text-4xl font-black tracking-wider text-gray-900 mb-2 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>{section.title}</h2>
            <div className="w-16 h-1 bg-gray-900 mb-6"></div>
            <Link to={link} className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 font-bold tracking-widest uppercase hidden md:block">
                View All &rarr;
            </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderFeatures = (section: Section) => {
    return (
      <section className="bg-gray-100 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {section.content.items.map((item: any) => (
                  <div key={item.id}>
                      <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                          {ICON_MAP[item.icon] || <Shield className="w-8 h-8 text-blue-900" />}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                  </div>
              ))}
          </div>
      </section>
    );
  };

  return (
    <div className="space-y-12">
      {sections.filter(s => s.isVisible).map(section => {
        if (section.type === 'hero') return <React.Fragment key={section.id}>{renderHero()}</React.Fragment>;
        if (section.type === 'products-grid') return <React.Fragment key={section.id}>{renderProductsGrid(section)}</React.Fragment>;
        if (section.type === 'features') return <React.Fragment key={section.id}>{renderFeatures(section)}</React.Fragment>;
        return null;
      })}
    </div>
  );
};

export default Home;
