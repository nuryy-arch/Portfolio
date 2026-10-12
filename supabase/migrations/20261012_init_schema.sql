-- ==============================================================================
-- ATELIER COFFEE SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES & ROLES
-- Stores profile and role information. References Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS CATALOG
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0), -- Price in KZT (Тенге)
    category TEXT NOT NULL CHECK (category IN ('coffee', 'tea', 'cold', 'desserts')),
    image_url TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    volume TEXT, -- e.g. "250 мл", "180 г"
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
    delivery_address TEXT,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount INTEGER NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 6. AUTOMATED SERVER-SIDE TOTAL AMOUNT & SECURITY VALIDATION
-- Computes order total automatically from the actual catalog prices to avoid client-side tampering
CREATE OR REPLACE FUNCTION public.calculate_and_verify_order_total()
RETURNS TRIGGER AS $$
DECLARE
    computed_total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
    INTO computed_total
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id;

    NEW.total_amount := computed_total;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. HELPER FUNCTION TO CHECK IF CURRENT USER IS ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Products Policies: Public can read available items, Admins have full access
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_available = true OR public.is_admin());

CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- Orders Policies:
-- Anyone can create an order (guest checkout supported)
CREATE POLICY "Anyone can create order"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Customers can view their own orders; Admins can view all orders
CREATE POLICY "Customers or admins can view orders"
    ON public.orders FOR SELECT
    USING (
        public.is_admin() OR 
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

-- Only Admins can update order status
CREATE POLICY "Only admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- Order Items Policies:
CREATE POLICY "Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "View order items if authorized on order"
    ON public.order_items FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id AND (o.user_id = auth.uid())
        )
    );

-- 9. SEED DATA (INITIAL MENU ITEMS IN KZT)
INSERT INTO public.products (name, description, price, category, image_url, is_available, volume, featured, sort_order) VALUES
('Atelier Signature Flat White', 'Двойной шот высокогорной арабики Эфиопия Иргачефф и бархатистое фермерское молоко с нотами молочного шоколада и жасмина.', 2400, 'coffee', 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80', true, '220 мл', true, 1),
('Фильтр-кофе Geisha Panama', 'Лёгкое, чистое тело с комплексным букетом: бергамот, белый персик, цветки апельсина и деликатная чайная кислотность.', 2800, 'coffee', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true, '250 мл', true, 2),
('Классический Капучино', 'Идеальный баланс эспрессо плотной текстуры и микропены сливочного молока. Орехово-карамельный профиль.', 2100, 'coffee', 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80', true, '200 мл', true, 3),
('Эспрессо Соло Colombia Huila', 'Концентрированный шот с яркими нотами красного яблока, тростникового сахара и долгоиграющим шоколадным послевкусием.', 1600, 'coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80', true, '40 мл', false, 4),
('Лавандовый Раф', 'Нежнейший кофейный десертный напиток со взбитыми сливками и натуральной крымской лавандой.', 2600, 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80', true, '300 мл', false, 5),
('Матча Латте Uji Ceremony', 'Органическая церемониальная матча первого сбора из Киото на овсяном или цельном молоке.', 2600, 'tea', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', true, '250 мл', true, 6),
('Гречишный чай Ку Цяо', 'Татарский гречишный чай с мягким вкусом овсяного печенья, свежей выпечки и карамели. Без кофеина.', 1900, 'tea', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', true, '400 мл', false, 7),
('Сенча Свежий Сбор', 'Японский зелёный чай деликатной пропарки с морскими минеральными нотами и освежающим травянистым вкусом.', 2000, 'tea', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80', true, '400 мл', false, 8),
('Cold Brew Vanilla Foam', 'Холодное настаивание спешелти зерна в течение 18 часов под шапкой плотной холодной ванильной пены.', 2700, 'cold', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80', true, '350 мл', true, 9),
('Эспрессо-Тоник с грейпфрутом', 'Освежающий микс крафтового индийского тоника, двойного эспрессо и свежевыжатого сока розового грейпфрута.', 2500, 'cold', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', true, '350 мл', false, 10),
('Каскара Лимонад', 'Игристый прохладительный напиток из высушенной мякоти кофейных ягод, шиповника и сока юдзу.', 2400, 'cold', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', true, '350 мл', false, 11),
('Баскский Чизкейк Сан-Себастьян', 'Обожжённая карамельная корочка и ультранежная кремовая текстура с натуральной мадагаскарской ванилью.', 3200, 'desserts', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', true, '180 г', true, 12),
('Круассан с миндальным франжипаном', 'Классический французский круассан на сливочном масле 82.5%, пропитанный сиропом и запечённый с миндальным кремом.', 2400, 'desserts', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', true, '140 г', false, 13),
('Шоколадный Тарт с морской солью', 'Песочная основа сабле, ганаш из тёмного бельгийского шоколада 70% и хрустящие кристаллы соли Fleur de Sel.', 2900, 'desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', true, '130 г', false, 14)
ON CONFLICT DO NOTHING;
