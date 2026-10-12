import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Sparkles, Award, Clock, MapPin, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const products = await apiService.getProducts();
        const featured = products.filter((p) => p.featured).slice(0, 4);
        setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-[#1A1412] text-[#F6F2EA] overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85"
            alt="Atelier Coffee Ambience"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#1A1412]/60 to-[#1A1412]"></div>
          <div className="absolute inset-0 bg-linear-to-b from-[#1A1412]/40 via-transparent to-[#F6F2EA]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#D8C6AE]/40 bg-[#30251F]/60 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-[#D8C6AE]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#D8C6AE] font-medium">
              Specialty Coffee & Bakery
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#F6F2EA] leading-[1.08] mb-8">
            Кофе. Вкус момента.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#F6F2EA]/80 font-light leading-relaxed mb-10">
            Мы отбираем микролоты арабики со всего мира, обжариваем их на ростере Loring и создаём напитки, раскрывающие подлинную чистоту каждого терруара.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-[#D8C6AE] text-[#30251F] font-semibold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Наше меню</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/menu?category=coffee"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#F6F2EA]/40 text-[#F6F2EA] font-medium text-xs uppercase tracking-[0.2em] rounded-full hover:bg-[#F6F2EA]/10 hover:border-[#F6F2EA] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Заказать кофе</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. POPULAR / FEATURED DRINKS */}
      <section className="py-24 bg-[#F6F2EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#D8C6AE]/30 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#7E7066] font-medium block mb-2">
                Селекция месяца
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#30251F]">
                Популярные напитки & десерты
              </h2>
            </div>
            <Link
              to="/menu"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30251F] hover:text-[#7E7066] transition-colors"
            >
              <span>Смотреть всё меню</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-stone-200/60 animate-pulse rounded-2xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. PHILOSOPHY & ABOUT STORY */}
      <section id="about" className="py-24 bg-white border-y border-[#D8C6AE]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual Mosaic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
                  alt="Specialty Roasting"
                  className="rounded-2xl object-cover w-full h-64 shadow-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80"
                  alt="Barista at work"
                  className="rounded-2xl object-cover w-full h-80 shadow-md"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
                  alt="Cafe atmosphere"
                  className="rounded-2xl object-cover w-full h-80 shadow-md"
                />
                <div className="bg-[#F6F2EA] rounded-2xl p-6 border border-[#D8C6AE]/40 flex flex-col justify-center">
                  <span className="font-serif text-4xl text-[#30251F] font-bold">100%</span>
                  <span className="text-xs uppercase tracking-widest text-[#7E7066] mt-2">
                    Арабика класса Specialty с оценкой Q-Grader 85+
                  </span>
                </div>
              </div>
            </div>

            {/* Story text */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.25em] text-[#7E7066] font-semibold">
                <Coffee className="w-4 h-4 text-[#D8C6AE]" />
                <span>Философия Atelier Coffee</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-[#30251F] leading-tight">
                Искусство в каждой чашке, рождённое страстью к совершенству.
              </h2>

              <p className="text-stone-600 font-light leading-relaxed">
                В ATELIER мы относимся к кофе не как к быстрому стимулятору, а как к тонкому гастрономическому опыту. Мы лично знаем фермеров из Эфиопии, Колумбии и Панамы, привозим зерно свежих урожаев и калибруем воду по строжайшим минеральным стандартам SCA.
              </p>

              <p className="text-stone-600 font-light leading-relaxed">
                Наше пространство создано для неспешных встреч, творческой концентрации и наслаждения моментом в самом сердце города.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-[#D8C6AE] pl-4">
                  <h4 className="font-serif text-lg font-semibold text-[#30251F]">
                    Собственный ростери
                  </h4>
                  <p className="text-xs text-[#7E7066] mt-1 font-light">
                    Обжариваем небольшими батчами каждые 3 дня для сохранения пика аромата.
                  </p>
                </div>
                <div className="border-l-2 border-[#D8C6AE] pl-4">
                  <h4 className="font-serif text-lg font-semibold text-[#30251F]">
                    Ремесленная пекарня
                  </h4>
                  <p className="text-xs text-[#7E7066] mt-1 font-light">
                    Слоёная выпечка на новозеландском масле и десерты без искусственных добавок.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY ADVANTAGES */}
      <section className="py-20 bg-[#F6F2EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#D8C6AE]/30 hover:border-[#30251F]/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F6F2EA] text-[#30251F] flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#30251F] mb-3">Премиальные ингредиенты</h3>
              <p className="text-xs sm:text-sm text-[#7E7066] font-light leading-relaxed">
                Органическое фермерское молоко, японская церемониальная матча и натуральные бобы ванили с острова Мадагаскар.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#D8C6AE]/30 hover:border-[#30251F]/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F6F2EA] text-[#30251F] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#30251F] mb-3">Экспресс-выдача & заказ</h3>
              <p className="text-xs sm:text-sm text-[#7E7066] font-light leading-relaxed">
                Сделайте заказ на сайте к нужному времени: заберите без очереди или оформите бережную доставку курьером.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#D8C6AE]/30 hover:border-[#30251F]/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F6F2EA] text-[#30251F] flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#30251F] mb-3">Атмосфера вдохновения</h3>
              <p className="text-xs sm:text-sm text-[#7E7066] font-light leading-relaxed">
                Интерьер в стиле тёплого минимализма, акустика, джазовый плейлист и уютные посадочные места у панорамных окон.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCATION & HOURS BANNER */}
      <section id="contacts" className="py-24 bg-[#30251F] text-[#F6F2EA] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#D8C6AE] font-semibold block mb-3">
                Ждём вас в гости
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6">
                Готовим кофе каждый день с раннего утра
              </h2>
              <p className="text-stone-300 font-light leading-relaxed mb-8">
                Загляните за утренним флэт уайтом или проведите спокойный вечер за фильтр-кофе и свежей выпечкой.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#D8C6AE]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white text-sm">Адрес кофейни</h5>
                    <p className="text-xs text-stone-300 font-light">г. Алматы, пр. Достык, 105 (Квартал искусств)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#D8C6AE]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white text-sm">Часы работы</h5>
                    <p className="text-xs text-stone-300 font-light">Пн–Пт: 08:00 – 22:00 | Сб–Вс: 09:00 – 23:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-[#D8C6AE]/20 shadow-2xl h-80 sm:h-96">
              <img
                src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1000&q=80"
                alt="Интерьер кофейни Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <span className="text-sm font-light text-white/90">
                  Уютная терраса и панорамный вид на горы
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
