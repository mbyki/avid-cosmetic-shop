import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import {
  FaSearch,
  FaShoppingCart,
  FaUserCircle,
  FaHome,
  FaList,
  FaTag,
  FaHeart,
  FaNewspaper,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaShieldAlt,
  FaTruck,
  FaCreditCard,
  FaHeadset,
  FaTrashAlt,
  FaShoppingBag,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaInstagram,
  FaQuestionCircle,
  FaClock
} from 'react-icons/fa';
import avidLogo from './assets/logo-avid.png';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';
import { useRef } from 'react';

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

  // دریافت اطلاعات کاربر
  useEffect(() => {
    if (authTokens) {
      axios.get(
        'http://127.0.0.1:8000/api/profile/',
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`
          }
        }
      )
      .then(res => {
        const name =
          `${res.data.first_name} ${res.data.last_name}`.trim();

        setUserName(name || res.data.username);
      })
      .catch(err => console.log(err));

    } else {
      setUserName('');
    }
  }, [authTokens]);

  // جستجوی زنده
  const handleSearchChange = (e) => {
    const query = e.target.value;

    setSearchQuery(query);

    if (query.length >= 3) {
      axios.get(
        `http://127.0.0.1:8000/api/products/?search=${query}`
      )
      .then(res => {
        setSearchResults(
          res.data.results.slice(0, 5)
        );
      })
      .catch(err => console.log(err));

    } else {
      setSearchResults([]);
    }
  };

  // ارسال جستجو
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    setSearchResults([]);
    setIsSearchOpen(false);
    setIsMenuOpen(false);

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <header className="avid-header">

        {/* ردیف اصلی هدر */}
        <div className="avid-header-main">

          {/* گروه سمت راست: همبرگر + لوگو */}
          <div className="avid-header-right">
            <button
              type="button"
              className="avid-mobile-menu-button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="منو"
            >
              <FaBars />
            </button>

            <div className="avid-header-logo">
              <Link to="/">
                <img src={avidLogo} alt="آوید" />
              </Link>
            </div>
          </div>

          {/* سرچ دسکتاپ */}
          <div className="avid-header-search">
            <div className={`avid-search-wrapper ${isSearchOpen ? 'open' : ''}`}>
              <form className="avid-search-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="جستجوی محصول، برند..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchOpen(true)}
                />
                <button type="submit" aria-label="جستجو">
                  <FaSearch />
                </button>
              </form>

              {isSearchOpen && searchResults.length > 0 && (
                <div className="avid-search-dropdown">
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="avid-search-item"
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                    >
                      <img
                        src={product.image_url || 'https://via.placeholder.com/50'}
                        alt={product.name}
                      />
                      <div className="avid-search-item-info">
                        <span>{product.name}</span>
                        <small>
                          {Number(product.discounted_price || product.price).toLocaleString()}{' '}تومان
                        </small>
                      </div>
                    </Link>
                  ))}

                  <button
                    type="button"
                    className="avid-see-all-btn"
                    onClick={handleSubmit}
                  >
                    مشاهده همه نتایج برای {' "'}{searchQuery}{'"'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* گروه سمت چپ: سبد خرید + ورود / ثبت نام */}
          <div className="avid-header-actions">
            <Link to="/cart" className="avid-cart-button" aria-label="سبد خرید">
              <FaShoppingCart />
              {totalItems > 0 && (
                <span className="avid-cart-badge">{totalItems}</span>
              )}
            </Link>

            {authTokens ? (
              <div className="avid-auth-wrapper">
                <Link to="/profile" className="avid-account-button">
                  <FaUserCircle />
                  <span>{userName || 'حساب کاربری'}</span>
                </Link>

                <button
                  type="button"
                  onClick={logoutUser}
                  className="avid-logout-button"
                >
                  خروج
                </button>
              </div>
            ) : (
              <Link to="/login" className="avid-account-button">
                <FaUserCircle />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}
          </div>
        </div>

        {/* منوی دسکتاپ */}
        <nav className="avid-desktop-navigation">
          <div className="avid-navigation-inner">
            <Link to="/">
              <FaHome />
              صفحه اصلی
            </Link>

            <Link to="/products">
              <FaList />
              محصولات
            </Link>

            <Link to="/categories">
              <FaTag />
              دسته‌بندی‌ها
            </Link>

            <Link to="/matik">
              <FaNewspaper />
              ماتیک وبلاگ
            </Link>

            {authTokens && (
              <Link to="/wishlist">
                <FaHeart />
                علاقه‌مندی‌ها
              </Link>
            )}

            <Link to="/contact">
              <FaPhoneAlt />
              تماس با ما
            </Link>

            <Link to="/faq">
              <FaQuestionCircle />
              سوالات متداول
            </Link>

            <Link to="/admin-dashboard">
              <FaTachometerAlt />
              داشبورد ادمین
            </Link>
          </div>
        </nav>
      </header>

      {/* پس‌زمینه منوی موبایل */}
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* منوی موبایل */}
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="بستن منو"
          >
            <FaTimes />
          </button>

          <img src={avidLogo} alt="آوید" className="mobile-drawer-logo" />
        </div>

        <form
          className="mobile-drawer-search"
          onSubmit={(e) => {
            handleSubmit(e);
            setIsMenuOpen(false);
          }}
        >
          <button type="submit" className="mobile-search-submit" aria-label="جستجو">
            <FaSearch />
          </button>

          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>

        <nav className="mobile-drawer-links">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <FaHome />
            صفحه اصلی
          </Link>

          <Link to="/products" onClick={() => setIsMenuOpen(false)}>
            <FaList />
            محصولات
          </Link>

          <Link to="/categories" onClick={() => setIsMenuOpen(false)}>
            <FaTag />
            دسته‌بندی‌ها
          </Link>

          <Link to="/matik" onClick={() => setIsMenuOpen(false)}>
            <FaNewspaper />
            ماتیک وبلاگ
          </Link>

          {authTokens && (
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
              <FaHeart />
              علاقه‌مندی‌ها
            </Link>
          )}

          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
            <FaPhoneAlt />
            تماس با ما
          </Link>

          <Link to="/faq" onClick={() => setIsMenuOpen(false)}>
            <FaQuestionCircle />
            سوالات متداول
          </Link>

          <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)}>
            <FaTachometerAlt />
            داشبورد ادمین
          </Link>
        </nav>

        <div className="mobile-drawer-account">
          {authTokens ? (
            <>
              <Link
                to="/profile"
                className="mobile-drawer-account-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserCircle />
                <span>{userName || 'پروفایل من'}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setIsMenuOpen(false);
                }}
                className="logout-btn mobile-logout-btn"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mobile-drawer-account-link"
              onClick={() => setIsMenuOpen(false)}
            >
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
    <Link to="/summer-sale" className="summer-banner-link">
      <div className="summer-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h2>☀️تا ۹۰٪ تخفیف در سامرتایم آوید☀️</h2>
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
            opacity: current === index ? 1 : 0,
            zIndex: current === index ? 2 : 1
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
      setArticles(res.data.slice(0, 5));
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
      <h2 className="category-bar-title">💄دسته بندی محصولات</h2>
      <div className="category-bar-grid categories-page-grid">
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

// --- اسلایدر محصولات خودکار ---
const AutoProductSlider = ({ title, products, addToCart }) => {
  const sliderRef = useRef(null);
  const { authTokens } = useAuth();
  const [localProducts, setLocalProducts] = useState(products);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const firstCard = sliderRef.current.querySelector('.slider-card');
        const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 310;

        if (Math.abs(scrollLeft) + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [localProducts]);

  if (!localProducts || localProducts.length === 0) return null;

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
      setLocalProducts(localProducts.map(p => p.id === product.id ? { ...p, is_in_wishlist: !p.is_in_wishlist } : p));
    } catch (err) {
      alert("خطا در تغییر وضعیت علاقه‌مندی.");
    }
  };

  const handleAdd = (product) => {
    const productForCart = { ...product, price: product.discounted_price || product.price, original_price: product.price };
    addToCart(productForCart);
  };

  return (
    <div className="summer-slider-section">
      <h2 className="section-title">{title}</h2>
      <div className="products-slider" ref={sliderRef}>
        {localProducts.map(product => (
          <ProductCard key={product.id} product={product} onAdd={handleAdd} onToggleWishlist={toggleWishlist} sliderCard />
        ))}
      </div>
    </div>
  );
};

// --- بخش "چرا آوید" (چهار ویژگی) ---
const WhyAvid = () => {
  return (
    <section className="why-avid">
      <div className="why-avid-item">
        <span className="why-avid-icon">
          <FaShieldAlt />
        </span>
        <div className="why-avid-content">
          <h3>ضمانت اصالت</h3>
          <p>تمام کالاها اورجینال</p>
        </div>
      </div>

      <div className="why-avid-item">
        <span className="why-avid-icon">
          <FaTruck />
        </span>
        <div className="why-avid-content">
          <h3>ارسال سریع</h3>
          <p>به سراسر کشور</p>
        </div>
      </div>

      <div className="why-avid-item">
        <span className="why-avid-icon">
          <FaCreditCard />
        </span>
        <div className="why-avid-content">
          <h3>پرداخت امن</h3>
          <p>کارت به کارت مطمئن</p>
        </div>
      </div>

      <div className="why-avid-item">
        <span className="why-avid-icon">
          <FaHeadset />
        </span>
        <div className="why-avid-content">
          <h3>پشتیبانی</h3>
          <p>مشاوره رایگان خرید</p>
        </div>
      </div>
    </section>
  );
};

// --- صفحه اصلی (Home) ---
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

      <AutoProductSlider title="🔥 پرفروش‌ترین‌های آوید" products={bestSellers} addToCart={addToCart} />

      <AutoProductSlider title="☀️ پیشنهادهای داغ سامرتایم" products={summerProducts} addToCart={addToCart} />

      <HomeArticlesSlider />
    </>
  );
};

// --- کارت محصول (مشترک) ---
const ProductCard = ({ product, onAdd, onToggleWishlist, sliderCard = false }) => {
  return (
    <div className={`product-card${sliderCard ? ' slider-card' : ''}`}>
      <div className="product-card-media">
        <Link to={`/product/${product.id}`}>
          <div className="product-image">
            <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} />
            {product.is_summer_sale && <span className="discount-badge">{product.discount_percent}٪ تخفیف</span>}
          </div>
        </Link>
        {onToggleWishlist && (
          <button
            className={`wishlist-btn-float ${product.is_in_wishlist ? 'active' : ''}`}
            onClick={() => onToggleWishlist(product)}
            aria-label="افزودن به علاقه‌مندی‌ها"
          >
            <FaHeart />
          </button>
        )}
      </div>

      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-info">
          <h2>{product.name}</h2>
          <span className="product-card-category">{product.category_name || 'عمومی'}</span>
          <p className="product-desc">{product.description}</p>
        </div>
      </Link>

      {product.stock > 0 && product.stock <= 3 && (
        <div className="low-stock-text">تنها {product.stock} عدد باقی مانده</div>
      )}

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
          <button className="buy-btn" onClick={() => onAdd(product)}>افزودن به سبد</button>
        )}
      </div>
    </div>
  );
};

// --- صفحه سامرتخفیف ---
const SummerSalePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
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
        <p>محصولات منتخب تا ۹۰٪ تخفیف ویژه تابستان</p>
      </div>
      <ProductGrid products={products} title="محصولات تخفیف‌خورده" />
    </div>
  );
};

// --- لیست همه محصولات ---
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { authTokens } = useAuth();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || '';

  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setCurrentPage(1);
  }, [searchParams]);

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

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="products-page-wrapper">

      <div className="products-page-heading">
        <h1>همه محصولات</h1>
        <span>{products.length} محصول</span>
      </div>

      <div className="products-layout">

        <aside className="products-filter-sidebar">

          <div className="products-filter-header">
            <h2>فیلترها</h2>
          </div>

          <div className="products-filter-section">
            <h3>دسته‌بندی</h3>
            <div className="filter-control">
              <select value={category} onChange={handleFilterChange(setCategory)}>
                <option value="">همه محصولات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="products-filter-section">
            <h3>محدوده قیمت</h3>
            <div className="price-filter-fields">
              <div className="price-filter-field">
                <label>از</label>
                <input
                  type="number"
                  placeholder="مثلاً 100000"
                  value={minPrice}
                  onChange={handleFilterChange(setMinPrice)}
                />
              </div>

              <div className="price-filter-field">
                <label>تا</label>
                <input
                  type="number"
                  placeholder="مثلاً 500000"
                  value={maxPrice}
                  onChange={handleFilterChange(setMaxPrice)}
                />
              </div>
            </div>
          </div>

        </aside>

        <main className="products-results">

          <div className="products-sort-bar">
            <span className="products-count">{products.length} محصول</span>

            <div className="sort-control">
              <label>مرتب‌سازی:</label>
              <select value={sort} onChange={handleFilterChange(setSort)}>
                <option value="">پیش‌فرض</option>
                <option value="newest">جدیدترین</option>
                <option value="cheap">ارزان‌ترین</option>
                <option value="expensive">گران‌ترین</option>
              </select>
            </div>
          </div>

          <ProductGrid products={products} title="" />

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

        </main>

      </div>

    </div>
  );
};

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
      setProducts(res.data.results);
    });
  }, [query, authTokens]);

  return <ProductGrid products={products} title={`نتایج جستجو برای: ${query}`} />;
};

// --- صفحه جزئیات محصول ---
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const { addToCart, cart, incrementQty, decrementQty } = useCart();
  const { authTokens } = useAuth();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="loading">در حال بارگذاری...</div>;

  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    const productForCart = { ...product, price: product.discounted_price || product.price, original_price: product.price };
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

    } catch (e) {
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
          <h1>{product.name}</h1>
          <span className="badge">{product.category_name || 'عمومی'}</span>
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
              {isInCart ? (
                <div className="detail-qty-controller">
                  <button onClick={() => decrementQty(product.id)}>-</button>
                  <span>{currentQty}</span>
                  <button
                    onClick={() => incrementQty(product.id)}
                    disabled={currentQty >= product.stock}
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
            {reviewError && <div className="auth-message error" style={{ marginBottom: '15px' }}>{reviewError}</div>}
            <textarea placeholder="متن نظر خود را اینجا بنویسید..." value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} required rows="4"></textarea>
            <button type="submit" className="btn-primary">ثبت نظر</button>
          </form>
        ) : (
          <div className="review-form" style={{ textAlign: 'center' }}>
            <p>برای ثبت نظر ابتدا باید <Link to="/login" style={{ color: 'var(--active-color)', fontWeight: 'bold' }}>وارد حساب خود شوید</Link>.</p>
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
// --- صفحه دسته‌بندی‌ها ---
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="categories-page">

      <h1 className="section-title">دسته‌بندی‌ها</h1>

      <div className="category-bar-grid">
        {categories.map(cat => (
          <Link
            to={`/products?category=${cat.id}`}
            key={cat.id}
            className="category-bar-card"
            style={{
              backgroundImage: `url(${
                cat.image_url || 'https://via.placeholder.com/500'
              })`
            }}
          >
            <span className="category-bar-card-label">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
};

// --- سبد خرید (Cart) ---
const Cart = () => {
  const { cart, incrementQty, decrementQty, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.original_price || item.price) * item.quantity), 0);
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discountAmount = subtotal - total;

  if (cart.length === 0) {
  return (
    <div className="cart-empty">
      <div className="cart-empty-icon"><FaShoppingCart /></div>
      <h2>سبد خرید شما خالی است</h2>
      <p>هنوز محصولی به سبد خریدتون اضافه نکردید</p>
      <Link to="/products" className="btn-primary cart-empty-btn">
        <FaShoppingBag /> رفتن به خرید
      </Link>
    </div>
  );
}

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">سبد خرید</h1>
      <div className="cart-page-layout">

        <div className="cart-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <button onClick={() => removeFromCart(item.id)} className="cart-remove-btn" aria-label="حذف کالا">
                <FaTrashAlt />
              </button>

              <div className="cart-item-media">
                <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} />
              </div>

              <div className="cart-item-body">
                <h3 className="cart-item-name">{item.name}</h3>
                {item.category_name && <span className="cart-item-category">{item.category_name}</span>}

                <div className="cart-item-price-row">
                  {item.original_price && Number(item.original_price) > Number(item.price) && (
                    <span className="cart-item-price-old">{Number(item.original_price).toLocaleString()} تومان</span>
                  )}
                  <span className="cart-item-price">{Number(item.price).toLocaleString()} تومان</span>
                </div>

                <div className="cart-item-qty">
                  <button onClick={() => decrementQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => incrementQty(item.id)} disabled={item.stock && item.quantity >= item.stock}>+</button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/products" className="cart-continue-link">→ ادامه خرید</Link>
        </div>

        <div className="cart-summary-card">
          <h2>خلاصه سفارش</h2>

          <div className="cart-summary-row">
            <span>جمع کالاها</span>
            <span>{subtotal.toLocaleString()} تومان</span>
          </div>

          {discountAmount > 0 && (
            <div className="cart-summary-row cart-summary-discount">
              <span>تخفیف</span>
              <span>- {discountAmount.toLocaleString()} تومان</span>
            </div>
          )}

          <div className="cart-summary-total">
            <span>مبلغ قابل پرداخت</span>
            <span>{total.toLocaleString()} تومان</span>
          </div>

          <p className="cart-summary-note">هزینه ارسال در مرحله بعد محاسبه می‌شود.</p>

          <Link to="/checkout" className="btn-primary cart-checkout-btn">تکمیل خرید</Link>
        </div>

      </div>
    </div>
  );
};

// --- صفحه تسویه حساب (Checkout) ---
const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { authTokens } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');

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
        coupon_code: discountPercent > 0 ? couponCode : null
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      clearCart();
      alert("سفارش شما با موفقیت ثبت شد! اطلاعات شما برای خریدهای بعدی ذخیره شد.");
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("خطا در ثبت سفارش. ممکن است موجودی برخی محصولات کافی نباشد.");
      }
    }
    setLoading(false);
  };

  if (cart.length === 0) {
  return (
    <div className="cart-empty">
      <div className="cart-empty-icon"><FaShoppingCart /></div>
      <h2>سبد خرید شما خالی است</h2>
      <p>هنوز محصولی به سبد خریدتون اضافه نکردید</p>
      <Link to="/products" className="btn-primary cart-empty-btn">
        <FaShoppingBag /> رفتن به خرید
      </Link>
    </div>
  );
}

  return (
    <div className="checkout-container">
      <div className="checkout-form-container">
        <h1>تکمیل خرید و اطلاعات ارسال</h1>

        <p className="checkout-note">ℹ️ اطلاعات زیر به صورت خودکار از پروفایل شما خوانده شده است. در صورت نیاز می‌توانید در <Link to="/profile" style={{ color: 'var(--active-color)' }}>صفحه پروفایل</Link> آن را ویرایش کنید.</p>

        <form className="auth-form checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نام و نام خانوادگی:</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="مثلا: محمد محمدی" />
          </div>
          <div className="form-group">
            <label>شماره تماس:</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="09123456789" />
          </div>
          <div className="form-group">
            <label>آدرس کامل پستی:</label>
            <textarea required rows="4" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="استان، شهر، خیابان، پلاک و کد پستی"></textarea>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>{loading ? 'در حال ثبت...' : 'ثبت نهایی سفارش'}</button>
        </form>
      </div>

      <div className="checkout-summary">
        <h2>خلاصه سفارش</h2>

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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser(username, password);
    if (result.success) {
      navigate('/');
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

      const loginResult = await loginUser(formData.username, formData.password);
      if (loginResult.success) {
        navigate('/');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
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
const Profile = () => {
  const { authTokens, logoutUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ first_name: '', last_name: '', username: '', email: '', phone: '', address: '' });
  const [activeTab, setActiveTab] = useState('profile'); // پیش‌فرض: تب پروفایل

  useEffect(() => {
    if (!authTokens) { setLoading(false); return; }
    axios.get('http://127.0.0.1:8000/api/profile/', {
      headers: { Authorization: `Bearer ${authTokens.access}` }
    }).then(res => {
      setUserInfo(res.data);
      setEditData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        username: res.data.username || '',
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
  if (!userInfo) return <div className="empty-page"><h2>مشکلی در دریافت اطلاعات پیش آمد</h2><Link to="/login" className="btn-primary">ورود دوباره</Link></div>;

  return (
    <div className="account-page">
      <div className="account-layout">

        <aside className="account-sidebar">
          <div className="account-sidebar-header">
            <div className="avatar">{userInfo.username.charAt(0).toUpperCase()}</div>
            <div className="account-sidebar-header-text">
              <span className="account-sidebar-label">حساب کاربری</span>
              <span className="account-sidebar-name">{userInfo.first_name} {userInfo.last_name}</span>
            </div>
          </div>

          <nav className="account-menu">
            <button
              className={`account-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUserCircle /> پروفایل
            </button>
            <button
              className={`account-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaShoppingBag /> سفارش‌ها
            </button>
            <button
              className="account-menu-item account-menu-logout"
              onClick={logoutUser}
            >
              <FaSignOutAlt /> خروج
            </button>
          </nav>
        </aside>

        <div className="account-main">
          <div className="account-welcome">
            <h1>سلام {userInfo.first_name || userInfo.username} 👋</h1>
            <p>به حساب کاربری فروشگاه آوید خوش آمدید.</p>
          </div>

          {activeTab === 'profile' ? (
            <div className="account-card">
              <h2>اطلاعات حساب کاربری</h2>
              <form className="account-form" onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>نام:</label>
                  <input type="text" value={editData.first_name} onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} placeholder="نام خود را وارد کنید" />
                </div>
                <div className="form-group">
                  <label>نام خانوادگی:</label>
                  <input type="text" value={editData.last_name} onChange={(e) => setEditData({ ...editData, last_name: e.target.value })} placeholder="نام خانوادگی" />
                </div>
                <div className="form-group">
                  <label>نام کاربری:</label>
                  <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} placeholder="نام کاربری" />
                </div>
                <div className="form-group">
                  <label>ایمیل:</label>
                  <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="ایمیل" />
                </div>
                <div className="form-group">
                  <label>شماره تماس:</label>
                  <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="09123456789" />
                </div>
                <div className="form-group">
                  <label>آدرس پستی:</label>
                  <textarea rows="3" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="استان، شهر، خیابان، پلاک و کد پستی"></textarea>
                </div>
                <button type="submit" className="btn-primary">ذخیره تغییرات</button>
              </form>
            </div>
          ) : (
            <div className="account-card">
              <h2>سفارش‌های من</h2>
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
          )}
        </div>

      </div>
    </div>
  );
};
const Orders = () => <div className="simple-page"><h1>سفارش‌های من</h1><p>لیست سفارش‌ها در اینجا قرار می‌گیرد.</p></div>;

const AdminDashboard = () => (
  <div className="simple-page admin-panel">
    <h1>داشبورد مدیریت فروشگاه آوید</h1>
    <p>برای مدیریت محصولات، دسته‌بندی‌ها، سفارش‌ها و کاربران، از طریق پنل قدرتمند زیر اقدام کنید:</p>
    <a href="http://127.0.0.1:8000/admin" target="_blank" rel="noreferrer" className="btn-primary">ورود به پنل مدیریت (Django Admin)</a>
  </div>
);

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
      setLocalProducts(localProducts.map(p => p.id === product.id ? { ...p, is_in_wishlist: !p.is_in_wishlist } : p));
    } catch (err) {
      alert("خطا در تغییر وضعیت علاقه‌مندی.");
    }
  };

  const handleAdd = (product) => {
    const productForCart = { ...product, price: product.discounted_price || product.price, original_price: product.price };
    addToCart(productForCart);
  };

  return (
    <div className="products-section">
      <h1 className="section-title">{title}</h1>
      <div className="products-grid">
        {localProducts.map(product => (
          <ProductCard key={product.id} product={product} onAdd={handleAdd} onToggleWishlist={toggleWishlist} />
        ))}
      </div>
    </div>
  );
};

// --- صفحه علاقه‌مندی‌ها ---
const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useAuth();

  useEffect(() => {
    if (authTokens) {
      axios.get('http://127.0.0.1:8000/api/wishlist/items/', {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      })
        .then(res => {
          setProducts(res.data);
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
  if (products.length === 0) return (
    <div className="cart-empty">
      <div className="cart-empty-icon"><FaHeart /></div>
      <h2>لیست علاقه‌مندی‌های شما خالی است</h2>
      <p>هنوز محصولی به علاقه‌مندی‌هاتون اضافه نکردید</p>
      <Link to="/products" className="btn-primary cart-empty-btn">
        <FaShoppingBag /> رفتن به فروشگاه
      </Link>
    </div>
  );

  return <ProductGrid products={products} title="علاقه‌مندی‌های من" />;
};

// --- صفحه تماس با ما ---


const ContactPage = () => {
  return (
    <div className="contact-page-v2">
      <div className="contact-hero">
        <h1>بیا با <span>آوید</span> در ارتباط باشیم</h1>
        <p>سوالی داری، پیشنهادی داری یا می‌خوای همکاری کنیم؟ از هر کدوم از راه‌های زیر که راحت‌تری، بهمون پیام بده.</p>
      </div>

      <div className="contact-cards-grid">
        <a href="https://instagram.com/avid_cosmetics" target="_blank" rel="noreferrer" className="contact-info-card">
          <span className="contact-info-icon"><FaInstagram /></span>
          <div className="contact-info-text">
            <h3>اینستاگرام</h3>
            <p dir="ltr">avid_cosmetics</p>
          </div>
        </a>

        <a href="mailto:avidcosmetics@gmail.com" className="contact-info-card">
          <span className="contact-info-icon"><FaEnvelope /></span>
          <div className="contact-info-text">
            <h3>ایمیل</h3>
            <p dir="ltr">avidcosmetics@gmail.com</p>
          </div>
        </a>

        <a href="tel:09152225402" className="contact-info-card">
          <span className="contact-info-icon"><FaPhoneAlt /></span>
          <div className="contact-info-text">
            <h3>تماس تلفنی</h3>
            <p dir="ltr">09152225402</p>
          </div>
        </a>
      </div>

      <div className="contact-branches-card">
        <div className="branch-block">
          <span className="branch-icon"><FaMapMarkerAlt /></span>
          <div className="branch-text">
            <h4>شعبه 1</h4>
            <p>مشهد، بلوار مجیدیه، بلوار محمدیه، نبش محمدیه 6</p>
          </div>
        </div>

        <div className="branch-divider"></div>

        <div className="branch-block">
          <span className="branch-icon"><FaMapMarkerAlt /></span>
          <div className="branch-text">
            <h4>شعبه 2</h4>
            <p>مشهد، بلوار فلاحی، فلاحی 1</p>
          </div>
        </div>

        <div className="branch-divider"></div>

        <div className="branch-block">
          <span className="branch-icon"><FaClock /></span>
          <div className="branch-text">
            <h4>ساعات کاری</h4>
            <p>شنبه تا پنجشنبه، 9 الی 21</p>
          </div>
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

// --- چیدمان اصلی (Routes + هدر + فوتر) ---
const AppLayout = () => {
  const location = useLocation();

  // صفحه ورود/ثبت‌نام: هم فوتر مخفی می‌شود، هم content-wrapper از حالت
  // محدود (max-width/margin/padding) خارج می‌شود تا پس‌زمینه‌اش لبه‌به‌لبه شود
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const hideFooter = isAuthPage;

  return (
    <div className="app-container">
      <Navbar />

      <div className={`content-wrapper${isAuthPage ? ' content-wrapper-full' : ''}`}>
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

      {!hideFooter && (
        <footer className="footer">
          <div className="footer-grid">

            <div className="footer-col footer-brand-col">
              <h3 className="footer-brand">آوید <span>Avid</span></h3>
              <p className="footer-about">فروشگاه آنلاین لوازم آرایشی و بهداشتی با تضمین اصالت کالا و ارسال سریع به سراسر کشور.</p>
            </div>

            <div className="footer-col">
              <h4>دسترسی سریع</h4>
              <ul className="footer-links">
                <li><Link to="/products"><FaList /> همه محصولات</Link></li>
                <li><Link to="/categories"><FaTag /> دسته‌بندی‌ها</Link></li>
                <li><Link to="/summer-sale"><FaHeadset />‌تخفیفات تابستانه</Link></li>
                <li><Link to="/cart"><FaShoppingCart /> سبد خرید</Link></li>
                <li><Link to="/login"><FaUserCircle /> ورود / ثبت‌نام</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>شعبه‌های آوید</h4>
              <ul className="footer-branches">
                <li>
                  <FaMapMarkerAlt />
                  <div>
                    <strong>شعبه ۱</strong>
                    <span>مشهد، بلوار مجیدیه، بلوار محمدیه، نبش محمدیه ۶</span>
                  </div>
                </li>
                <li>
                  <FaMapMarkerAlt />
                  <div>
                    <strong>شعبه ۲</strong>
                    <span>مشهد، بلوار فلاحی، فلاحی ۱</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>ارتباط با ما</h4>
              <ul className="footer-contact">
                <li><FaPhoneAlt /> <a href="tel:09152225402">۰۹۱۵۲۲۲۵۴۰۲</a></li>
                <li><FaEnvelope /> <a href="mailto:avidcosmetics@gmail.com">avidcosmetics@gmail.com</a></li>
                <li><FaClock /> شنبه تا پنجشنبه، ۹ تا ۲۱</li>
              </ul>
            </div>

          </div>

          <div className="footer-bottom">
            <p>تمامی حقوق برای فروشگاه لوازم آرایشی آوید محفوظ است &copy; 2026</p>
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