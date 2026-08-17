import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import { FaSearch, FaShoppingCart, FaUserCircle, FaHome, FaList, FaTag, FaHeart, FaNewspaper, FaLeaf, FaRecycle, FaCertificate, FaTachometerAlt, FaBars, FaTimes, FaPhoneAlt } from 'react-icons/fa';
import avidLogo from './assets/logo-avid.png';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';
import { useRef } from 'react';

// --- کامپوننت نمایش پیام (Toast) ---
// --- کامپوننت نمایش پیام (Toast) ---
const Toast = () => {
  const { toastMessage } = useCart();
  
  if (!toastMessage) return null;

  return (
    <div className="toast-notification">
      <span>خرید در سبدته 🔥</span>
      <Link to="/cart" className="toast-cart-btn">مشاهده سبد</Link>
    </div>
  );
};

// --- نوار بالا (Navbar) ---
// --- نوار بالا (Navbar) ---
const Navbar = () => {
  const { cart } = useCart();
  const { authTokens, logoutUser } = useAuth();
  const [userName, setUserName] = useState('');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // استیت‌های جستجوی زنده
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (authTokens) {
      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      }).then(res => {
        const name = `${res.data.first_name} ${res.data.last_name}`.trim();
        setUserName(name || res.data.username);
      }).catch(err => console.log(err));
    } else {
      setUserName('');
    }
  }, [authTokens]);

  // تابع جستجوی زنده
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3) {
      axios.get(`http://127.0.0.1:8000/api/products/?search=${query}`)
        .then(res => setSearchResults(res.data.results.slice(0, 5))) // فقط ۵ نتیجه اول
        .catch(err => console.log(err));
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchResults([]);
    window.location.href = `/search?q=${searchQuery}`;
  };

  return (
    <>
    <nav className="navbar">
      <div className="nav-logo"><Link to="/"><img src={avidLogo} alt="آوید" /></Link></div>

      <div className="nav-links">
        <Link to="/products"><FaList /> محصولات</Link>
        <Link to="/categories"><FaTag /> دسته‌بندی‌ها</Link>
        <Link to="/matik"><FaNewspaper /> ماتیک وبلاگ</Link>
        {authTokens && <Link to="/wishlist"><FaHeart /> علاقه‌مندی‌ها</Link>}
        <Link to="/contact"><FaPhoneAlt /> تماس با ما</Link>
        <Link to="/admin-dashboard">داشبورد ادمین</Link>
      </div>

      <div className="nav-left">
        
        {/* آیکون جستجو (با کلیک باز/بسته می‌شود) - فقط دسکتاپ */}
        <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="search-toggle-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="جستجو"
          >
            <FaSearch />
          </button>

          {isSearchOpen && (
            <form className="search-box" onSubmit={handleSubmit}>
              <input
                type="text"
                autoFocus
                placeholder="جستجوی محصول..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          )}
          
          {/* لیست کشویی نتایج جستجو */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(p => (
                <Link 
                  to={`/product/${p.id}`} 
                  key={p.id} 
                  className="search-item"
                  onClick={() => { setSearchResults([]); setSearchQuery(''); setIsSearchOpen(false); }}
                >
                  <img src={p.image_url || 'https://via.placeholder.com/50'} alt={p.name} />
                  <div className="search-item-info">
                    <span>{p.name}</span>
                    <small>{Number(p.discounted_price || p.price).toLocaleString()} تومان</small>
                  </div>
                </Link>
              ))}
              <button className="see-all-btn" onClick={handleSubmit}>
                مشاهده همه نتایج برای "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        <Link to="/cart" className="cart-icon"><FaShoppingCart /> <span className="cart-badge">{totalItems}</span></Link>
        
        {/* دکمه اکانت - فقط دسکتاپ (در موبایل داخل منوی کشویی است) */}
        {authTokens ? (
          <div className="user-menu">
            <Link to="/profile" className="account-btn">
              <FaUserCircle />
              {userName && <span className="account-name">{userName}</span>}
            </Link>
            <button onClick={logoutUser} className="logout-btn">خروج</button>
          </div>
        ) : (
          <Link to="/login" className="user-icon"><FaUserCircle /></Link>
        )}

        {/* دکمه منوی همبرگری (فقط موبایل) */}
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="منو"
        >
          <FaBars />
        </button>
      </div>
    </nav>

    {/* پس‌زمینه تیره پشت منوی کشویی موبایل - بیرون از nav چون backdrop-filter روی nav باعث می‌شد fixed درست کار نکند */}
    {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

    {/* منوی کشویی موبایل (از سمت راست باز می‌شود) */}
    <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
      <div className="mobile-drawer-header">
        <button className="mobile-drawer-close" onClick={() => setIsMenuOpen(false)} aria-label="بستن منو">
          <FaTimes />
        </button>
        <img src={avidLogo} alt="آوید" className="mobile-drawer-logo" />
      </div>

      {/* جستجو داخل منوی موبایل */}
      <form className="mobile-drawer-search" onSubmit={(e) => { handleSubmit(e); setIsMenuOpen(false); }}>
        <FaSearch />
        <input
          type="text"
          placeholder="جستجوی محصول..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </form>

      <nav className="mobile-drawer-links">
        <Link to="/" onClick={() => setIsMenuOpen(false)}><FaHome /> صفحه اصلی</Link>
        <Link to="/products" onClick={() => setIsMenuOpen(false)}><FaList /> محصولات</Link>
        <Link to="/categories" onClick={() => setIsMenuOpen(false)}><FaTag /> دسته‌بندی‌ها</Link>
        <Link to="/matik" onClick={() => setIsMenuOpen(false)}><FaNewspaper /> ماتیک وبلاگ</Link>
        {authTokens && <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}><FaHeart /> علاقه‌مندی‌ها</Link>}
        <Link to="/contact" onClick={() => setIsMenuOpen(false)}><FaPhoneAlt /> تماس با ما</Link>
        <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)}><FaTachometerAlt /> داشبورد ادمین</Link>
      </nav>

      <div className="mobile-drawer-account">
        {authTokens ? (
          <>
            <Link to="/profile" className="mobile-drawer-account-link" onClick={() => setIsMenuOpen(false)}>
              <FaUserCircle />
              <span>{userName || 'پروفایل من'}</span>
            </Link>
            <button onClick={() => { logoutUser(); setIsMenuOpen(false); }} className="logout-btn mobile-logout-btn">خروج</button>
          </>
        ) : (
          <Link to="/login" className="mobile-drawer-account-link" onClick={() => setIsMenuOpen(false)}>
            <FaUserCircle />
            <span>ورود / ثبت‌نام</span>
          </Link>
        )}
      </div>
    </div>
    </>
  );
};
// --- بنر تخفیف تابستانی با شمارنده معکوس ---


// --- بنر تخفیف تابستانی با شمارنده معکوس ---
const SummerBanner = () => {
  const calculateTimeLeft = () => {
    const year = new Date().getFullYear();
    const difference = +new Date(`09/21/${year}`) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        روز: Math.floor(difference / (1000 * 60 * 60 * 24)),
        ساعت: Math.floor((difference / (1000 * 60 * 60)) % 24),
        دقیقه: Math.floor((difference / 1000 / 60) % 60),
        ثانیه: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      timerComponents.push(<span key={interval}>پایان یافت!</span>);
      return;
    }
    timerComponents.push(
      <div key={interval} className="timer-box">
        <span className="timer-value">{timeLeft[interval]}</span>
        <span className="timer-label">{interval}</span>
      </div>
    );
  });

  return (
    // تبدیل بنر به لینک
    <Link to="/summer-sale" className="summer-banner-link">
      <div className="summer-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h2>☀️ ۲۵٪ تخفیف در سامرتایم آوید ☀️</h2>
          <p>تنها فرصت باقیمانده تا پایان پیشنهاد ویژه تابستانه:</p>
          <div className="countdown-timer">
            {timerComponents.length ? timerComponents : <span>پیشنهاد به پایان رسید!</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};


// --- اسلایدر مدل‌های آرایشی (روش محوشونده) ---
const ModelsSlider = () => {
  const images = [
    "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/6980870/pexels-photo-6980870.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ];
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="models-slider-container">
      {images.map((img, index) => (
        <div 
          key={index} 
          className="model-slide"
          style={{
            opacity: current === index ? 1 : 0, // این خط عکس را نشان می‌دهد یا مخفی می‌کند
            zIndex: current === index ? 2 : 1   // عکس فعلی را می‌آورد رو
          }}
        >
          <img src={img} alt={`مدل آرایشی ${index + 1}`} />
          <div className="slide-overlay">
            <h3>درخشش تو با آوید</h3>
            <p>جدیدترین ترندهای آرایشی زنانه</p>
          </div>
        </div>
      ))}
      
      <div className="slider-dots">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={current === index ? 'dot active' : 'dot'} 
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};
// --- اسلایدر مقالات در صفحه اصلی ---
const HomeArticlesSlider = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/articles/').then(res => {
      setArticles(res.data.slice(0, 5)); // فقط ۵ مقاله اول
    });
  }, []);

  if (articles.length === 0) return null;

  return (
    <div className="home-articles-section">
      <h2 className="section-title">📝 در ماتیک بخوانید</h2>
      <div className="articles-slider">
        {articles.map(art => (
          <Link to={`/matik/${art.id}`} key={art.id} className="article-card slider-article">
            <div className="article-image">
              <img src={art.image_url || 'https://via.placeholder.com/400x250'} alt={art.title} />
            </div>
            <div className="article-info">
              <h3>{art.title}</h3>
              <p>{art.short_desc}</p>
              <span className="read-more-link">ادامه مطلب ←</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- نوار دسته‌بندی‌ها در صفحه اصلی ---
const CategoryBar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/').then(res => setCategories(res.data));
  }, []);

  return (
    <div className="category-bar-container">
      <h2 className="category-bar-title">دسته‌بندی محصولات</h2>
      <div className="category-bar-grid">
        {categories.map(cat => (
          <Link
            to={`/products?category=${cat.id}`}
            key={cat.id}
            className="category-bar-card"
            style={{ backgroundImage: `url(${cat.image_url || 'https://via.placeholder.com/500'})` }}
          >
            <span className="category-bar-card-label">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- صفحه اصلی (Home) ---

// --- اسلایدر محصولات خودکار ---
const AutoProductSlider = ({ title, products, addToCart }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const firstCard = sliderRef.current.querySelector('.slider-card');
        const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 310;

        // در سایت‌های راست‌چین، اسکرول به سمت چپ با اعداد منفی کار می‌کند
        // اگر به انتهای اسلایدر رسید، بر گرد به اول
        if (Math.abs(scrollLeft) + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // حرکت به سمت چپ (عدد منفی)
          sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      }
    },2000); // هر 2ثانیه

    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  const handleAdd = (product) => {
    const productForCart = { ...product, price: product.discounted_price || product.price };
    addToCart(productForCart);
  };

  return (
    <div className="summer-slider-section">
      <h2 className="section-title">{title}</h2>
      <div className="products-slider" ref={sliderRef}>
        {products.map(product => (
          <div key={product.id} className="product-card slider-card">
            <Link to={`/product/${product.id}`}>
              <div className="product-image">
                <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} />
                {product.is_summer_sale && <span className="discount-badge">{product.discount_percent}٪ تخفیف</span>}
              </div>
              <div className="product-info">
                <span className="badge">{product.category_name || 'عمومی'}</span>
                <h2>{product.name}</h2>
                <div className="price-container">
                  {product.discounted_price ? (
                    <>
                      <span className="original-price">{Number(product.price).toLocaleString()} تومان</span>
                      <span className="discount-price">{Number(product.discounted_price).toLocaleString()} تومان</span>
                    </>
                  ) : (
                    <span className="price">{Number(product.price).toLocaleString()} تومان</span>
                  )}
                </div>
              </div>
            </Link>
            {product.stock === 0 ? (
              <button className="out-of-stock-btn" disabled>ناموجود</button>
            ) : (
              <button className="buy-btn" onClick={() => handleAdd(product)}>افزودن به سبد</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
// --- صفحه اصلی (Home) ---

// --- صفحه اصلی (Home) ---
// --- بخش کوچک "چرا آوید" (سه ویژگی، مطابق تصویر مرجع) ---
const WhyAvid = () => {
  return (
    <div className="why-avid">
      <div className="why-avid-item">
        <span className="why-avid-icon"><FaLeaf /></span>
        <span>مواد اولیه پاک</span>
      </div>
      <div className="why-avid-item">
        <span className="why-avid-icon"><FaRecycle /></span>
        <span>بسته‌بندی بازیافتی</span>
      </div>
      <div className="why-avid-item">
        <span className="why-avid-icon"><FaCertificate /></span>
        <span>تایید شده توسط متخصص پوست</span>
      </div>
    </div>
  );
};

const Home = () => {
  const [summerProducts, setSummerProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/?summer=true')
      .then(res => setSummerProducts(res.data.results))
      .catch(err => console.log(err));

    axios.get('http://127.0.0.1:8000/api/products/?ordering=best_seller')
      .then(res => setBestSellers(res.data.results.slice(0, 8)))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <SummerBanner />

      <div className="hero-flex">
        <div className="hero-section">
          <h1>زیبایی واقعی با آوید</h1>
          <p>بهترین برندهای لوازم آرایشی و مراقبت از پوست، با ترکیبی از طبیعت و علم</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-shop">شروع خرید</Link>
            <Link to="/register" className="btn-register">
              <span className="register-title">ثبت‌نام کنید</span>
              <span className="register-sub">۱۰٪ تخفیف اولین خرید</span>
            </Link>
          </div>
        </div>
        <ModelsSlider />
      </div>

      <WhyAvid />

      <CategoryBar />

      {/* اسلایدر پرفروش‌ترین‌ها (خودکار) */}
      <AutoProductSlider title="🔥 پرفروش‌ترین‌های آوید" products={bestSellers} addToCart={addToCart} />

      {/* اسلایدر سامرتایم (خودکار) */}
      <AutoProductSlider title="☀️ پیشنهادهای داغ سامرتایم" products={summerProducts} addToCart={addToCart} />

      <HomeArticlesSlider />
    </>
  );
};

// --- صفحه جدید سامرتخفیف ---
const SummerSalePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // دریافت فقط محصولاتی که تیک سامرتخفیف خورده‌اند
    axios.get('http://127.0.0.1:8000/api/products/?summer=true')
      .then(res => setProducts(res.data.results))
      .catch(err => console.log(err));
  }, []);

  if (products.length === 0) {
    return <div className="simple-page"><h1>سامرتخفیف آوید ☀️</h1><p>هنوز محصولی برای سامرتخفیف ثبت نشده است. از پنل ادمین چند محصول را اضافه کنید.</p></div>;
  }

  return (
    <div className="summer-sale-page">
      <div className="sale-header">
        <h1>به سامرتخفیف آوید خوش آمدید! ☀️🏖️</h1>
        <p>محصولات منتخب با ۲۵٪ تخفیف ویژه تابستان</p>
      </div>
      <ProductGrid products={products} title="محصولات تخفیف‌خورده" />
    </div>
  );
};

// --- لیست همه محصولات ---
// --- لیست همه محصولات ---
// --- لیست همه محصولات ---
// --- لیست همه محصولات ---
// --- لیست همه محصولات ---
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { authTokens } = useAuth();
  const [searchParams] = useSearchParams();
  
  // خواندن دسته‌بندی از URL (اگر کاربر از صفحه دسته‌بندی‌ها آمده باشد)
  const initialCategory = searchParams.get('category') || '';
  
  // استیت‌های فیلترها
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // استیت‌های صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // گرفتن دسته‌بندی‌ها برای منوی کشویی
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/').then(res => setCategories(res.data));
  }, []);

  // آپدیت استیت category اگر URL تغییر کرد (مثلا کاربر روی دسته دیگری کلیک کرد)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setCurrentPage(1);
  }, [searchParams]);

  // گرفتن محصولات با توجه به فیلترها و صفحه
  useEffect(() => {
    let url = 'http://127.0.0.1:8000/api/products/?';
    if (category) url += `category=${category}&`;
    if (sort) url += `ordering=${sort}&`;
    if (minPrice) url += `min_price=${minPrice}&`;
    if (maxPrice) url += `max_price=${maxPrice}&`;
    url += `page=${currentPage}`;

    axios.get(url, {
      headers: authTokens ? { Authorization: `Bearer ${authTokens.access}` } : {}
    }).then(res => {
      setProducts(res.data.results);
      const count = res.data.count;
      setTotalPages(Math.ceil(count / 8));
    });
  }, [category, sort, minPrice, maxPrice, currentPage, authTokens]);

  // اگر فیلترها تغییر کردند، به صفحه اول برگرد
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="products-page-wrapper">
      {/* نوار فیلترها */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>دسته‌بندی:</label>
          <select value={category} onChange={handleFilterChange(setCategory)}>
            <option value="">همه</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        
        <div className="filter-group">
          <label>مرتب‌سازی:</label>
          <select value={sort} onChange={handleFilterChange(setSort)}>
            <option value="">پیش‌فرض</option>
            <option value="newest">جدیدترین</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
          </select>
        </div>

        <div className="filter-group">
          <label>قیمت از:</label>
          <input type="number" placeholder="مثلا 100000" value={minPrice} onChange={handleFilterChange(setMinPrice)} />
        </div>

        <div className="filter-group">
          <label>تا:</label>
          <input type="number" placeholder="مثلا 500000" value={maxPrice} onChange={handleFilterChange(setMaxPrice)} />
        </div>
      </div>

      <ProductGrid products={products} title="همه محصولات" />

      {/* دکمه‌های صفحه‌بندی */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
          >
            قبلی
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button 
              key={index} 
              className={currentPage === index + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
};

// --- نتیجه جستجو ---
// --- نتیجه جستجو ---
const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const { authTokens } = useAuth();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/?search=${query}`, {
      headers: authTokens ? { Authorization: `Bearer ${authTokens.access}` } : {}
    }).then(res => {
      setProducts(res.data.results); // اینجا تغییر کرد: results اضافه شد
    });
  }, [query, authTokens]);
  
  return <ProductGrid products={products} title={`نتایج جستجو برای: ${query}`} />;
};
// --- صفحه جزئیات محصول ---

// --- صفحه جزئیات محصول ---
// --- صفحه جزئیات محصول ---
// --- صفحه جزئیات محصول ---
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const { addToCart, cart, incrementQty, decrementQty } = useCart(); // cart و توابع کم و زیاد کردن اضافه شد
  const { authTokens } = useAuth();
  
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`).then(res => setProduct(res.data));
  }, [id]);
  
  if (!product) return <div className="loading">در حال بارگذاری...</div>;
  
  // پیدا کردن محصول در سبد خرید (اگر هست)
  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    const productForCart = { ...product, price: product.discounted_price || product.price };
    addToCart(productForCart);
  };

  const toggleWishlist = async () => {
    if (!authTokens) {
      alert("برای افزودن به علاقه‌مندی‌ها ابتدا باید وارد شوید.");
      return;
    }
    try {
      if (product.is_in_wishlist) {
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${product.id}/`, {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
        setProduct({ ...product, is_in_wishlist: false });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/wishlist/${product.id}/`, {}, {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
        setProduct({ ...product, is_in_wishlist: true });
      }
    } catch (err) {
      alert("خطا در تغییر وضعیت علاقه‌مندی.");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await axios.post(`http://127.0.0.1:8000/api/products/${id}/reviews/`, 
        { body: reviewBody },
        { headers: { Authorization: `Bearer ${authTokens.access}` } }
      );
      setReviewBody('');
      alert("نظر شما با موفقیت ثبت شد! پس از تایید مدیر سایت، در صفحه محصول نمایش داده خواهد شد.");
    } catch (err) {
      setReviewError("خطا در ثبت نظر. مطمئن شوید که لاگین کرده‌اید.");
    }
  };

  const handleVote = async (review, type) => {
    let likedReviews = JSON.parse(localStorage.getItem('avid_liked') || '[]');
    let dislikedReviews = JSON.parse(localStorage.getItem('avid_disliked') || '[]');
    let isLiked = likedReviews.includes(review.id);
    let isDisliked = dislikedReviews.includes(review.id);
    
    let newLikes = review.likes || 0;
    let newDislikes = review.dislikes || 0;
    let newLikedArr = [...likedReviews];
    let newDislikedArr = [...dislikedReviews];

    try {
      if (type === 'like') {
        if (isLiked) {
          newLikes -= 1;
          newLikedArr = newLikedArr.filter(rid => rid !== review.id);
          await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/like/`, { action: 'remove' });
        } else {
          newLikes += 1;
          newLikedArr.push(review.id);
          if (isDisliked) {
            newDislikes -= 1;
            newDislikedArr = newDislikedArr.filter(rid => rid !== review.id);
            await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/dislike/`, { action: 'remove' });
          }
          await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/like/`, { action: 'add' });
        }
      } else {
        if (isDisliked) {
          newDislikes -= 1;
          newDislikedArr = newDislikedArr.filter(rid => rid !== review.id);
          await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/dislike/`, { action: 'remove' });
        } else {
          newDislikes += 1;
          newDislikedArr.push(review.id);
          if (isLiked) {
            newLikes -= 1;
            newLikedArr = newLikedArr.filter(rid => rid !== review.id);
            await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/like/`, { action: 'remove' });
          }
          await axios.post(`http://127.0.0.1:8000/api/reviews/${review.id}/dislike/`, { action: 'add' });
        }
      }

      localStorage.setItem('avid_liked', JSON.stringify(newLikedArr));
      localStorage.setItem('avid_disliked', JSON.stringify(newDislikedArr));

      const updatedReviews = product.reviews.map(r => 
        r.id === review.id ? { ...r, likes: newLikes, dislikes: newDislikes } : r
      );
      setProduct({ ...product, reviews: updatedReviews });

    } catch(e) {
      alert("خطا در ثبت رأی.");
    }
  };

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-container">
        <div className="detail-image">
          <img src={product.image_url || 'https://via.placeholder.com/500'} alt={product.name} />
        </div>
        <div className="detail-info">
          <span className="badge">{product.category_name || 'عمومی'}</span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          
          <div className="detail-price-container">
            {product.discounted_price ? (
              <>
                <span className="original-price-detail">{Number(product.price).toLocaleString()} تومان</span>
                <span className="detail-price discount-price-detail">{Number(product.discounted_price).toLocaleString()} تومان</span>
                <span className="save-badge">{product.discount_percent}٪ تخفیف سامرتایم</span>
              </>
            ) : (
              <span className="detail-price">{Number(product.price).toLocaleString()} تومان</span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 3 && (
            <div className="low-stock-warning-detail">
              <span>  تنها {product.stock} عدد از این محصول در انبار باقی مانده است!</span>
            </div>
          )}

          {product.stock === 0 ? (
            <button className="out-of-stock-btn" disabled>ناموجود در انبار</button>
          ) : (
            <div className="detail-actions">
              {/* --- این بخش تغییر کرد: تبدیل به تعداد اگر در سبد باشد --- */}
              {isInCart ? (
                <div className="detail-qty-controller">
                  <button onClick={() => decrementQty(product.id)}>-</button>
                  <span>{currentQty}</span>
                  <button 
                    onClick={() => incrementQty(product.id)}
                    disabled={currentQty >= product.stock} // اگر به موجودی انبار رسید، + غیرفعال شود
                  >+</button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleAddToCart}>افزودن به سبد خرید</button>
              )}

              <button 
                className={`wishlist-btn-large ${product.is_in_wishlist ? 'active' : ''}`} 
                onClick={toggleWishlist}
              >
                <FaHeart /> {product.is_in_wishlist ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی'}
              </button>
            </div>
          )}
          <Link to="/products" className="back-btn">بازگشت به همه محصولات</Link>
        </div>
      </div>
      
      <div className="reviews-section">
        <h2>نظرات کاربران ({product.reviews?.length || 0})</h2>
        
        {authTokens ? (
          <form className="review-form" onSubmit={submitReview}>
            <h3>نظر شما راجعه به این محصول چیست؟</h3>
            {reviewError && <div className="auth-message error" style={{marginBottom: '15px'}}>{reviewError}</div>}
            <textarea placeholder="متن نظر خود را اینجا بنویسید..." value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} required rows="4"></textarea>
            <button type="submit" className="btn-primary">ثبت نظر</button>
          </form>
        ) : (
          <div className="review-form" style={{textAlign: 'center'}}>
            <p>برای ثبت نظر ابتدا باید <Link to="/login" style={{color: 'var(--active-color)', fontWeight: 'bold'}}>وارد حساب خود شوید</Link>.</p>
          </div>
        )}

        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map(review => {
              let likedReviews = JSON.parse(localStorage.getItem('avid_liked') || '[]');
              let dislikedReviews = JSON.parse(localStorage.getItem('avid_disliked') || '[]');
              return (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="author-wrapper">
                    <span className="review-author">{review.name || 'کاربر'}</span>
                    {review.is_buyer && <span className="buyer-badge">خریدار</span>}
                  </div>
                  {review.created_at && (
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  )}
                </div>
                <p className="review-body">{review.body}</p>
                
                <div className="review-actions">
                  <button 
                    className={`review-like-btn ${likedReviews.includes(review.id) ? 'active' : ''}`}
                    onClick={() => handleVote(review, 'like')}
                  >
                    👍 {review.likes || 0}
                  </button>
                  <button 
                    className={`review-dislike-btn ${dislikedReviews.includes(review.id) ? 'active' : ''}`}
                    onClick={() => handleVote(review, 'dislike')}
                  >
                    👎 {review.dislikes || 0}
                  </button>
                </div>

                {review.admin_reply && (
                  <div className="admin-reply-box">
                    <span className="admin-badge">پاسخ فروشگاه آوید:</span>
                    <p>{review.admin_reply}</p>
                  </div>
                )}
              </div>
              )
            })
          ) : (
            <p className="no-reviews">هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!</p>
          )}
        </div>
      </div>
    </div>
  );
};
// --- دسته‌بندی‌ها ---
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/').then(res => setCategories(res.data));
  }, []);
  return (
    <div className="categories-container">
      <h1>دسته‌بندی محصولات</h1>
      <div className="categories-grid">
        {categories.map(cat => (
          <Link 
            to={`/products?category=${cat.id}`} 
            key={cat.id} 
            className="category-card"
            style={{ backgroundImage: `url(${cat.image_url || 'https://via.placeholder.com/500'})` }}
          >
            <span className="category-name-overlay">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- سبد خرید (Cart) ---
const Cart = () => {
  const { cart, incrementQty, decrementQty, removeFromCart } = useCart();
  // محاسبه جمع کل مبلغ (قیمت ضربدر تعداد)
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  
  if (cart.length === 0) return <div className="empty-page"><h2>سبد خرید شما خالی است</h2><Link to="/products" className="btn-primary">رفتن به خرید</Link></div>;
  
  return (
    <div className="cart-container">
      <h1>سبد خرید شما</h1>
      {cart.map((item) => (
        <div key={item.id} className="cart-item">
          <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} />
          <div className="cart-item-info">
            <h3>{item.name}</h3>
            <p>قیمت واحد: {Number(item.price).toLocaleString()} تومان</p>
          </div>
          
          <div className="quantity-controller">
            <button 
              onClick={() => incrementQty(item.id)} 
              className="qty-btn"
              disabled={item.stock && item.quantity >= item.stock}
            >+</button>
            <span className="qty-value">{item.quantity}</span>
            <button onClick={() => decrementQty(item.id)} className="qty-btn">-</button>
          </div>
          
          <div className="cart-item-actions">
            <p className="item-total-price">{(Number(item.price) * item.quantity).toLocaleString()} تومان</p>
            <button onClick={() => removeFromCart(item.id)} className="btn-danger btn-sm">حذف کالا</button>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <h2>مبلغ کل سبد: {total.toLocaleString()} تومان</h2>
        <Link to="/checkout" className="btn-primary">ادامه فرآیند خرید</Link>
      </div>
    </div>
  );
};

// --- صفحات دیگر (اسکلت) ---
// --- صفحه تسویه حساب (Checkout) ---
// --- صفحه تسویه حساب (Checkout) ---
// --- صفحه تسویه حساب (Checkout) ---
// --- صفحه تسویه حساب (Checkout) ---
const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { authTokens } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  
  // استیت‌های کد تخفیف
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');

  // --- این بخش اضافه شد: خواندن اطلاعات از پروفایل ---
  useEffect(() => {
    if (authTokens) {
      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      }).then(res => {
        setFormData({
          full_name: `${res.data.first_name} ${res.data.last_name}`.trim(),
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      }).catch(err => console.log(err));
    }
  }, [authTokens]);

  if (!authTokens) {
    return <div className="empty-page"><h2>برای ثبت سفارش باید وارد حساب خود شوید</h2><Link to="/login" className="btn-primary">ورود به حساب</Link></div>;
  }

  const rawTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discountAmount = rawTotal * (discountPercent / 100);
  const finalTotal = rawTotal - discountAmount;

  const applyCoupon = async () => {
    setCouponError(''); setCouponMsg('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/coupons/verify/', 
        { code: couponCode },
        { headers: { Authorization: `Bearer ${authTokens.access}` } }
      );
      setDiscountPercent(res.data.discount_percent);
      setCouponMsg(res.data.message);
    } catch (err) {
      setDiscountPercent(0);
      setCouponError(err.response?.data?.error || "خطا در بررسی کد.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/orders/', {
        ...formData,
        items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        coupon_code: discountPercent > 0 ? couponCode : null // ارسال کد تخفیف اگر اعمال شده باشد
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      clearCart();
      // به جای alert، یک پیام شیک‌تر می‌گذاریم و بعد از ۲ ثانیه ریدایرکت می‌کنیم
      alert("سفارش شما با موفقیت ثبت شد! اطلاعات شما برای خریدهای بعدی ذخیره شد.");
      navigate('/');
    } catch (err) {
      // نمایش ارور دقیق از بک‌اند (مثلا ارور کد تخفیف اولین خرید)
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("خطا در ثبت سفارش. ممکن است موجودی برخی محصولات کافی نباشد.");
      }
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return <div className="empty-page"><h2>سبد خرید شما خالی است!</h2><Link to="/products" className="btn-primary">رفتن به خرید</Link></div>;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-form-container">
        <h1>تکمیل خرید و اطلاعات ارسال</h1>
        
        {/* پیام راهنما اضافه شد */}
        <p className="checkout-note">ℹ️ اطلاعات زیر به صورت خودکار از پروفایل شما خوانده شده است. در صورت نیاز می‌توانید در <Link to="/profile" style={{color: 'var(--active-color)'}}>صفحه پروفایل</Link> آن را ویرایش کنید.</p>
        
        <form className="auth-form checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نام و نام خانوادگی:</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="مثلا: محمد محمدی" />
          </div>
          <div className="form-group">
            <label>شماره تماس:</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="09123456789" />
          </div>
          <div className="form-group">
            <label>آدرس کامل پستی:</label>
            <textarea required rows="4" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="استان، شهر، خیابان، پلاک و کد پستی"></textarea>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>{loading ? 'در حال ثبت...' : 'ثبت نهایی سفارش'}</button>
        </form>
      </div>
      
      <div className="checkout-summary">
        <h2>خلاصه سفارش</h2>
        
        {/* باکس کد تخفیف */}
        <div className="coupon-box">
          <input type="text" placeholder="کد تخفیف دارید؟" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          <button onClick={applyCoupon} className="btn-primary btn-sm">اعمال</button>
        </div>
        {couponMsg && <p className="coupon-success">{couponMsg}</p>}
        {couponError && <p className="coupon-error">{couponError}</p>}

        <div className="summary-items">
          {cart.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} ({item.quantity} عدد)</span>
              <span>{(Number(item.price) * item.quantity).toLocaleString()} ت</span>
            </div>
          ))}
        </div>
        
        <div className="summary-prices">
          <div className="price-row">
            <span>جمع کل:</span>
            <span>{rawTotal.toLocaleString()} تومان</span>
          </div>
          {discountPercent > 0 && (
            <div className="price-row discount">
              <span>تخفیف ({discountPercent}٪):</span>
              <span>- {discountAmount.toLocaleString()} تومان</span>
            </div>
          )}
          <div className="summary-total">
            <span>مبلغ قابل پرداخت:</span>
            <span className="total-price">{finalTotal.toLocaleString()} تومان</span>
          </div>
        </div>
        <p className="summary-note">* این یک پروژه دمو است و درگاه پرداخت واقعی متصل نیست. مبلغ هنگام تحویل دریافت می‌شود.</p>
      </div>
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate(); // برای انتقال به صفحه دیگر بعد از ورود

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser(username, password);
    if (result.success) {
      navigate('/'); // بعد از ورود موفق، به صفحه اصلی برو
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>ورود به فروشگاه آوید</h2>
        <p className="auth-subtitle">خوش آمدید! لطفاً وارد حساب خود شوید.</p>
        
        {errorMsg && <div className="auth-message error">{errorMsg}</div>}

        <div className="form-group">
          <label>نام کاربری:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="نام کاربری خود را وارد کنید" />
        </div>

        <div className="form-group">
          <label>رمز عبور:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="رمز عبور خود را وارد کنید" />
        </div>

        <button type="submit" className="btn-primary auth-btn">ورود</button>
        
        <p className="auth-switch">
          حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
        </p>
      </form>
    </div>
  );
};
// --- صفحه ثبت‌نام (Register) ---
// --- صفحه ثبت‌نام (Register) ---
// --- صفحه ثبت‌نام (Register) ---
const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', formData);
      
      // لاگین خودکار بعد از ثبت نام
      const loginResult = await loginUser(formData.username, formData.password);
      if (loginResult.success) {
        navigate('/');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        // گرفتن ارورهای دقیق از بک‌اند (مثلا ارور تکراری بودن ایمیل)
        setErrors(err.response.data);
      } else {
        setErrors({ general: "خطا در ثبت نام. دوباره تلاش کنید." });
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>ثبت‌نام در فروشگاه آوید</h2>
        <p className="auth-subtitle">برای دریافت 10% تخفیف اولین خرید، عضو شوید!</p>
        
        {errors.general && <div className="auth-message error">{errors.general}</div>}
        {isSuccess && <div className="auth-message success">ثبت نام موفق بود! لطفاً وارد شوید.</div>}

        <div className="form-group">
          <label>نام کاربری:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="مثلا: mohamad123" />
          {errors.username && <span className="field-error">{errors.username[0]}</span>}
        </div>
        
        <div className="form-group">
          <label>ایمیل:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" />
          {errors.email && <span className="field-error">{errors.email[0]}</span>}
        </div>

        <div className="form-group">
          <label>شماره تماس:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="09123456789" />
          {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
        </div>

        <div className="form-group">
          <label>رمز عبور:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="یک رمز قوی وارد کنید" />
          {errors.password && <span className="field-error">{errors.password[0]}</span>}
        </div>
        
        <button type="submit" className="btn-primary auth-btn">ثبت‌نام کنید</button>
        
        <p className="auth-switch">قبلاً حساب کاربری دارید؟ <Link to="/login">وارد شوید</Link></p>
      </form>
    </div>
  );
};

// --- صفحه پروفایل کاربری ---
// --- صفحه پروفایل کاربری ---
const Profile = () => {
  const { authTokens, logoutUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (!authTokens) { setLoading(false); return; }
    axios.get('http://127.0.0.1:8000/api/profile/', {
      headers: { Authorization: `Bearer ${authTokens.access}` }
    }).then(res => {
      setUserInfo(res.data);
      setEditData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, [authTokens]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://127.0.0.1:8000/api/profile/', editData, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setUserInfo(res.data);
      alert("اطلاعات با موفقیت ذخیره شد!");
    } catch (err) {
      alert("خطا در بروزرسانی اطلاعات.");
    }
  };

  if (!authTokens) {
    return <div className="empty-page"><h2>برای دیدن پروفایل باید وارد شوید</h2><Link to="/login" className="btn-primary">ورود</Link></div>;
  }

  if (loading) return <div className="loading">در حال بارگذاری...</div>;
  if (!userInfo) return null;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>اطلاعات حساب کاربری</h2>
        <div className="profile-header">
          <div className="avatar">{userInfo.username.charAt(0).toUpperCase()}</div>
          <h3>{userInfo.first_name} {userInfo.last_name} ({userInfo.username})</h3>
        </div>
        
        <form className="auth-form" onSubmit={handleUpdate}>
          <div className="form-group">
            <label>نام:</label>
            <input type="text" value={editData.first_name} onChange={(e) => setEditData({...editData, first_name: e.target.value})} placeholder="نام خود را وارد کنید" />
          </div>
          <div className="form-group">
            <label>نام خانوادگی:</label>
            <input type="text" value={editData.last_name} onChange={(e) => setEditData({...editData, last_name: e.target.value})} placeholder="نام خانوادگی" />
          </div>
          <div className="form-group">
            <label>ایمیل:</label>
            <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} placeholder="ایمیل" />
          </div>
          
          {/* فیلدهای شماره تماس و آدرس */}
          <div className="form-group">
            <label>شماره تماس:</label>
            <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} placeholder="09123456789" />
          </div>
          <div className="form-group">
            <label>آدرس پستی:</label>
            <textarea rows="3" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} placeholder="استان، شهر، خیابان، پلاک و کد پستی"></textarea>
          </div>
          
          <button type="submit" className="btn-primary">ذخیره تغییرات</button>
          <button onClick={logoutUser} className="btn-danger" style={{marginTop: '10px', width: '100%'}}>خروج از حساب</button>
        </form>
      </div>

      <div className="orders-card">
        <h2>تاریخچه سفارشات</h2>
        {userInfo.orders && userInfo.orders.length > 0 ? (
          userInfo.orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <span className="order-id">شماره سفارش: #{order.id}</span>
                <span className="order-date">{new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                <span className={`order-status status-${order.status}`}>{order.status_display}</span>
              </div>
              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-product-row">
                    <span>{item.product_name}</span>
                    <span>{item.quantity} عدد</span>
                    <span>{Number(item.price).toLocaleString()} ت</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                مبلغ کل: {Number(order.total_price).toLocaleString()} تومان
              </div>
            </div>
          ))
        ) : (
          <p className="no-reviews">شما هنوز سفارشی ثبت نکرده‌اید.</p>
        )}
      </div>
    </div>
  );
};
const Orders = () => <div className="simple-page"><h1>سفارش‌های من</h1><p>لیست سفارش‌ها در اینجا قرار می‌گیرد.</p></div>;

// --- داشبورد ادمین (لینک به پنل جنگو) ---
const AdminDashboard = () => (
  <div className="simple-page admin-panel">
    <h1>داشبورد مدیریت فروشگاه آوید</h1>
    <p>برای مدیریت محصولات، دسته‌بندی‌ها، سفارش‌ها و کاربران، از طریق پنل قدرتمند زیر اقدام کنید:</p>
    <a href="http://127.0.0.1:8000/admin" target="_blank" rel="noreferrer" className="btn-primary">ورود به پنل مدیریت (Django Admin)</a>
  </div>
);

// --- گرید نمایش محصولات (کامپوننت مشترک) ---
// --- گرید نمایش محصولات (کامپوننت مشترک) ---
// --- گرید نمایش محصولات (کامپوننت مشترک) ---
const ProductGrid = ({ products, title }) => {
  const { addToCart } = useCart();
  const { authTokens } = useAuth();
  const [localProducts, setLocalProducts] = useState(products);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const toggleWishlist = async (product) => {
    if (!authTokens) {
      alert("برای افزودن به علاقه‌مندی‌ها ابتدا باید وارد شوید.");
      return;
    }
    try {
      if (product.is_in_wishlist) {
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${product.id}/`, {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/wishlist/${product.id}/`, {}, {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
      }
      // آپدیت state برای تغییر رنگ قلب
      setLocalProducts(localProducts.map(p => p.id === product.id ? { ...p, is_in_wishlist: !p.is_in_wishlist } : p));
    } catch (err) {
      alert("خطا در تغییر وضعیت علاقه‌مندی.");
    }
  };

  const handleAdd = (product) => {
    const productForCart = { ...product, price: product.discounted_price || product.price };
    addToCart(productForCart);
  };

  return (
    <div className="products-section">
      <h1 className="section-title">{title}</h1>
      <div className="products-grid">
        {localProducts.map(product => (
          <div key={product.id} className="product-card">

            {/* عکس محصول + نشان‌های روی عکس (تخفیف / موجودی کم / علاقه‌مندی) */}
            <div className="product-card-media">
              <Link to={`/product/${product.id}`}>
                <div className="product-image">
                  <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} />
                  {product.is_summer_sale && <span className="discount-badge">{product.discount_percent}٪ تخفیف</span>}
                  {product.stock > 0 && product.stock <= 3 && (
                    <span className="low-stock-badge">تنها {product.stock} عدد باقی مانده</span>
                  )}
                </div>
              </Link>
              <button
                className={`wishlist-btn-float ${product.is_in_wishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="افزودن به علاقه‌مندی‌ها"
              >
                <FaHeart />
              </button>
            </div>

            {/* عنوان و توضیح کوتاه */}
            <Link to={`/product/${product.id}`} className="product-card-link">
              <div className="product-info">
                <h2>{product.name}</h2>
                <p className="product-desc">{product.description}</p>
              </div>
            </Link>

            {/* قیمت و دکمه افزودن به سبد، همیشه ردیف پایین کارت */}
            <div className="product-card-footer">
              <div className="price-container">
                {product.discounted_price ? (
                  <>
                    <span className="original-price">{Number(product.price).toLocaleString()} تومان</span>
                    <span className="discount-price">{Number(product.discounted_price).toLocaleString()} تومان</span>
                  </>
                ) : (
                  <span className="price">{Number(product.price).toLocaleString()} تومان</span>
                )}
              </div>
              {product.stock === 0 ? (
                <button className="out-of-stock-btn" disabled>ناموجود</button>
              ) : (
                <button className="buy-btn" onClick={() => handleAdd(product)}>افزودن به سبد</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- صفحه علاقه‌مندی‌ها ---
// --- صفحه علاقه‌مندی‌ها ---
// --- صفحه علاقه‌مندی‌ها ---
const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useAuth();

  useEffect(() => {
    if (authTokens) {
      // استفاده از API اختصاصی علاقه‌مندی‌ها
      axios.get('http://127.0.0.1:8000/api/wishlist/items/', {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      })
        .then(res => {
          setProducts(res.data); // الان مستقیماً لیست محصولات است
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [authTokens]);

  if (!authTokens) return <div className="empty-page"><h2>برای دیدن علاقه‌مندی‌ها باید وارد شوید</h2><Link to="/login" className="btn-primary">ورود</Link></div>;
  if (loading) return <div className="loading">در حال بارگذاری...</div>;
  if (products.length === 0) return <div className="empty-page"><h2>لیست علاقه‌مندی‌های شما خالی است</h2><Link to="/products" className="btn-primary">رفتن به خرید</Link></div>;

  return <ProductGrid products={products} title="علاقه‌مندی‌های من" />;
};

// --- صفحه تماس با ما ---
const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1 className="section-title">تماس با ما</h1>
      <div className="contact-page-grid">
        <div className="contact-page-info">
          <ul className="contact-info">
            <li>📍 آدرس: تهران، خیابان ولیعصر، برج آرایشی آوید، طبقه ۴</li>
            <li>📞 تلفن تماس: ۰۲۱-۱۲۳۴۵۶۷۸</li>
            <li>📱 موبایل: ۰۹۱۲-۹۸۷۶۵۴۳</li>
            <li>✉️ ایمیل: info@avid-shop.ir</li>
            <li>⏰ ساعات کاری: شنبه تا پنجشنبه ۹ تا ۲۱</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- صفحه سوالات متداول (FAQ) ---
const FAQ = () => {
  const faqs = [
    { q: "آیا محصولات فروشگاه آوید اصل هستند؟", a: "بله، ما در فروشگاه آوید تضمین می‌کنیم که تمامی محصولات مستقیماً از واردکنندگان معتبر تهیه شده و ۱۰۰٪ اورجینال هستند." },
    { q: "زمان ارسال سفارش‌ها چقدر است؟", a: "سفارش‌های شما پس از تایید نهایی، حداکثر ظرف ۱ تا ۳ روز کاری در تهران و ۲ تا ۵ روز کاری در سایر شهرستان‌ها به دست شما خواهد رسید." },
    { q: "هزینه ارسال محصولات چگونه محاسبه می‌شود؟", a: "برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال در سراسر کشور رایگان است. برای سفارش‌های کمتر، هزینه پست بر اساس وزن بسته محاسبه می‌شود." },
    { q: "آیا بسته‌بندی محصولات discreat (محرمانه) است؟", a: "بله، ما به حریم خصوصی مشتریان احترام می‌گذاریم. تمامی سفارش‌ها در بسته‌بندی‌های کاملاً مستحکم و بدون درج نام برند روی بیرون بسته ارسال می‌شوند." },
    { q: "اگر محصول مشکلی داشت، چگونه می‌توانم مرجوع کنم؟", a: "شما تا ۷ روز پس از دریافت کالا فرصت دارید در صورت وجود هرگونه مشکل (فیزیکی یا مغایرت)، درخواست مرجوعی ثبت کنید. پس از تایید پشتیبانی، مبلغ به حساب شما بازگردانده می‌شود." },
    { q: "آیا امکان پرداخت در محل (کارتخوان) وجود دارد؟", a: "در حال حاضر در شهر تهران امکان پرداخت در محل (فقط برای سفارش‌اتوبار) فراهم است. برای سایر شهرستان‌ها باید پیش از ارسال، مبلغ را به صورت آنلاین پرداخت کنید." }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq-container">
      <h1>سوالات متداول</h1>
      <p className="faq-subtitle">پاسخ به پرتکرارترین سوالات شما درباره خرید از فروشگاه آوید</p>
      
      <div className="faq-list">
        {faqs.map((item, index) => (
          <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              <span>{item.q}</span>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </div>
            <div className="faq-answer">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- صفحه لیست مقالات (ماتیک) ---
const MatikPage = () => {
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/articles/').then(res => setArticles(res.data));
  }, []);

  return (
    <div className="products-section">
      <h1 className="section-title">ماتیک | مجله زیبایی آوید</h1>
      <div className="articles-grid">
        {articles.map(art => (
          <Link to={`/matik/${art.id}`} key={art.id} className="article-card">
            <div className="article-image">
              <img src={art.image_url || 'https://via.placeholder.com/400x250'} alt={art.title} />
            </div>
            <div className="article-info">
              <h2>{art.title}</h2>
              <p>{art.short_desc}</p>
              <span className="article-date">{new Date(art.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- صفحه خواندن مقاله ---
const MatikDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/articles/${id}/`).then(res => setArticle(res.data));
  }, [id]);

  if (!article) return <div className="loading">در حال بارگذاری مقاله...</div>;

  return (
    <div className="article-detail-container">
      <h1>{article.title}</h1>
      <div className="article-detail-image">
        <img src={article.image_url || 'https://via.placeholder.com/800x400'} alt={article.title} />
      </div>
      <div className="article-body">{article.body}</div>
      <Link to="/matik" className="back-btn">بازگشت به مقالات</Link>
    </div>
  );
};
// --- ساختار اصلی ---
// --- چیدمان اصلی (برای دسترسی به مسیر فعلی و مخفی کردن فوتر در صفحه ورود) ---
const AppLayout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/login';

  return (
    <div className="app-container">
      <Navbar />
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/summer-sale" element={<SummerSalePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/matik" element={<MatikPage />} />
          <Route path="/matik/:id" element={<MatikDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>

      {/* فوتر جدید با اطلاعات تماس (در صفحه ورود نمایش داده نمی‌شود) */}
      {!hideFooter && (
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col">
              <h3>آوید <span>Av</span></h3>
              <p>فروشگاه آنلاین لوازم آرایشی و بهداشتی با تضمین اصالت کالا و ارسال سریع به سراسر کشور.</p>
            </div>
            <div className="footer-col">
              <h4>دسترسی سریع</h4>
              <ul>
                <li><Link to="/products">همه محصولات</Link></li>
                <li><Link to="/summer-sale">تخفیف‌های تابستانه</Link></li>
                <li><Link to="/cart">سبد خرید</Link></li>
                <li><Link to="/login">ورود / ثبت‌نام</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>ارتباط با ما</h4>
              <ul className="contact-info">
                <li>📍 آدرس: تهران، خیابان ولیعصر، برج آرایشی آوید، طبقه ۴</li>
                <li>📞 تلفن تماس: ۰۲۱-۱۲۳۴۵۶۷۸</li>
                <li>📱 موبایل: ۰۹۱۲-۹۸۷۶۵۴۳</li>
                <li>✉️ ایمیل: info@avid-shop.ir</li>
                <li>⏰ ساعات کاری: شنبه تا پنجشنبه ۹ تا ۲۱</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>تمامی حقوق برای فروشگاه لوازم آرایشی آوید محفوظ است &copy; 2024</p>
          </div>
        </footer>
      )}
      <Toast />
    </div>
  );
};

function App() {
  return (
  <AuthProvider>
    <CartProvider>
      <Router>
        <AppLayout />
      </Router>
    </CartProvider>
  </AuthProvider>
  );
}
export default App;