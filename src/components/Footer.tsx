import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Clock, Phone, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#30251F] text-[#F6F2EA] border-t border-[#D8C6AE]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-[#D8C6AE]/15">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#D8C6AE] text-[#30251F] flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#F6F2EA] uppercase">
                ATELIER
              </span>
            </div>
            <p className="text-sm text-[#D8C6AE]/80 font-light leading-relaxed">
              Кофейное ателье нового поколения. Селекционное зерно класса Specialty, бережная светлая обжарка и эстетика каждой детали.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#D8C6AE] font-semibold">
              Навигация
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-[#F6F2EA]/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  Полное меню
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Корзина
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Панель администратора
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#D8C6AE] font-semibold">
              Локация и График
            </h4>
            <div className="space-y-3 text-sm text-[#F6F2EA]/80 font-light">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#D8C6AE] mt-1 shrink-0" />
                <span>г. Алматы, пр. Достык, 105<br /><span className="text-xs text-[#D8C6AE]/70">Квартал искусств</span></span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-[#D8C6AE] mt-1 shrink-0" />
                <span>
                  Пн — Пт: 08:00 – 22:00<br />
                  Сб — Вс: 09:00 – 23:00
                </span>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#D8C6AE] font-semibold">
              Контакты
            </h4>
            <div className="space-y-3 text-sm text-[#F6F2EA]/80 font-light">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#D8C6AE] shrink-0" />
                <span>+7 (777) 890-44-22</span>
              </div>
              <div className="pt-2 flex items-center space-x-4">
                <a
                  href="#telegram"
                  className="w-8 h-8 rounded-full border border-[#D8C6AE]/30 flex items-center justify-center text-[#D8C6AE] hover:bg-[#D8C6AE] hover:text-[#30251F] transition-all duration-200"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8C6AE]/60 font-light space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} ATELIER COFFEE. Все права защищены.</p>
          <p className="tracking-wide">Портфолио веб-разработчика • React + Supabase + Tailwind</p>
        </div>
      </div>
    </footer>
  );
};
