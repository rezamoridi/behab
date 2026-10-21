// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import DashboardPreview from "../features/dashboard/DashboardPreview";
import {
  Map,
  Sprout,
  Users,
  Droplets,
  ArrowLeft,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Flower2,
  Activity,
  CloudSun,
  Truck,
  Store,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ── تنظیمات اسلایدر با حرکت مداوم و نرم ──
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      direction: "rtl",
      dragFree: true,
    },
    [
      AutoScroll({
        speed: 1,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ]
  );

  // ✅ اطمینان از شروع حرکت خودکار پس از mount
  useEffect(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins()?.autoScroll;
    if (autoScroll && !autoScroll.isPlaying()) {
      autoScroll.play();
    }
  }, [emblaApi]);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ✅ لیست گسترده‌ی ویژگی‌ها (۱۰ آیتم)
  const features = [
    {
      title: "نقشه و ژئوانفورماتیک",
      desc: "ترسیم دقیق پلی‌گون زمین‌ها روی نقشه ماهواره‌ای، محاسبه خودکار مساحت و جلوگیری از همپوشانی.",
      icon: Map,
      color: "primary",
    },
    {
      title: "مدیریت منابع آبی",
      desc: "محاسبه هوشمند نیاز آبی بر اساس نوع محصول، مساحت زمین و نوع سیستم آبیاری.",
      icon: Droplets,
      color: "sky",
    },
    {
      title: "پرونده کشاورزان",
      desc: "مدیریت متمرکز اطلاعات کشاورزان، سوابق کشت، پیامک دعوت و احراز هویت از طریق OTP.",
      icon: Users,
      color: "amber",
    },
    {
      title: "نهاده‌ها و محصولات",
      desc: "مدیریت جامع کود، سم و بذر مصرفی هر زمین، به همراه محاسبه دقیق هزینه‌های تمام‌شده.",
      icon: Sprout,
      color: "violet",
    },
    {
      title: "پایش محصول",
      desc: "ثبت دقیق دوره‌های کشت و کار، تاریخ کاشت و برداشت، و بررسی سلامت محصول در طول فصل.",
      icon: Flower2,
      color: "rose",
    },
    {
      title: "تحلیل و گزارش‌گیری",
      desc: "داشبوردهای تحلیلی جامع برای مشاهده روند مصرف نهاده‌ها و تحلیل بازدهی زمین‌ها.",
      icon: Activity,
      color: "indigo",
    },
    {
      title: "هواشناسی هوشمند",
      desc: "اتصال به داده‌های جوی و پیش‌بینی آب‌وهوا برای برنامه‌ریزی بهتر آبیاری و کاشت.",
      icon: CloudSun,
      color: "orange",
    },
    {
      title: "مدیریت ماشین‌آلات",
      desc: "ثبت ساعات کارکرد ماشین‌آلات کشاورزی و مدیریت هزینه‌های نگهداری و تعمیرات.",
      icon: Truck,
      color: "teal",
    },
    {
      title: "بازار فروش محصول",
      desc: "ثبت قیمت محصولات، مدیریت فروش و ارتباط مستقیم با خریداران در بستر سامانه.",
      icon: Store,
      color: "fuchsia",
    },
    {
      title: "مدیریت تعاونی‌ها",
      desc: "امکان اتصال کشاورزان به تعاونی‌ها و مدیریت متمرکز منابع و تجهیزات مشترک.",
      icon: Building2,
      color: "cyan",
    },
  ];

  const colorMap = {
    primary: { bg: "bg-primary-100", text: "text-primary-600", hoverBg: "group-hover:bg-primary-600" },
    sky: { bg: "bg-sky-100", text: "text-sky-600", hoverBg: "group-hover:bg-sky-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", hoverBg: "group-hover:bg-amber-600" },
    violet: { bg: "bg-violet-100", text: "text-violet-600", hoverBg: "group-hover:bg-violet-600" },
    rose: { bg: "bg-rose-100", text: "text-rose-600", hoverBg: "group-hover:bg-rose-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", hoverBg: "group-hover:bg-indigo-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", hoverBg: "group-hover:bg-orange-600" },
    teal: { bg: "bg-teal-100", text: "text-teal-600", hoverBg: "group-hover:bg-teal-600" },
    fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-600", hoverBg: "group-hover:bg-fuchsia-600" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600", hoverBg: "group-hover:bg-cyan-600" },
  };

  return (
    <div
      className="landing-page min-h-screen w-full bg-slate-50 font-vazir selection:bg-primary-500 selection:text-white"
      dir="rtl"
    >
      {/* ═══════════════════════════════════════════════ */}
      {/* Header / Navbar                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/android-chrome-512x512.png"
              alt="آب خوان"
              className="w-8 h-8 rounded-lg shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-xl font-bold bg-gradient-to-l from-primary-700 to-primary-500 bg-clip-text text-transparent">
              آب خوان
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors cursor-pointer"
            >
              ویژگی‌ها
            </button>
            <button
              onClick={() => scrollToSection("dashboard-preview")}
              className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors cursor-pointer"
            >
              پیش‌نمایش
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors cursor-pointer"
            >
              نحوه کارکرد
            </button>
          </div>

          <button
            onClick={handleLoginClick}
            className="
              flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl
              bg-primary-600 hover:bg-primary-700
              text-white text-xs sm:text-sm font-bold shadow-md shadow-primary-600/20
              transition-all duration-200 active:scale-95
            "
          >
            {isAuthenticated ? "داشبورد" : "ورود به سیستم"}
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════ */}
      {/* Hero Section                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-slate-50 to-slate-50"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary-200/30 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="text-center md:text-center lg:text-right lg:col-span-6 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-[10px] sm:text-xs font-semibold mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                سامانه هوشمند مدیریت کشاورزی
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
                مدیریت یکپارچه‌ی{" "}
                <span className="bg-gradient-to-l from-primary-600 to-emerald-400 bg-clip-text text-transparent">
                  زمین و آب
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                پلتفرم جامع برای ثبت و مدیریت اراضی کشاورزی، پرونده کشاورزان،
                محاسبه دقیق نیاز آبی و مدیریت نهاده‌ها با بهره‌گیری از نقشه
                ماهواره‌ای و سیستم‌های نوین.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={handleLoginClick}
                  className="
                    w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl
                    bg-primary-600 hover:bg-primary-700
                    text-white text-sm sm:text-base font-bold 
                    shadow-xl shadow-primary-600/30 hover:shadow-primary-600/40
                    transition-all duration-300 active:scale-95
                  "
                >
                  شروع کنید
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollToSection("dashboard-preview")}
                  className="
                    w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl
                    bg-white border-2 border-slate-200 hover:border-primary-200 hover:bg-primary-50/50
                    text-slate-700 text-sm sm:text-base font-bold 
                    transition-all duration-300
                  "
                >
                  پیش‌نمایش داشبورد
                </button>
              </div>
            </div>

            {/* Hero Image / Map Simulation */}
            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 relative animate-fadeInUp animate-delay-2 flex flex-col items-center">
              <div className="relative w-full max-w-lg lg:max-w-none">
                <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 30% 50%, rgba(34,197,94,0.20) 0%, transparent 65%),
                        linear-gradient(rgba(34,197,94,0.18) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,197,94,0.18) 1px, transparent 1px)
                      `,
                      backgroundSize: "100% 100%, 32px 32px, 32px 32px",
                    }}
                    aria-hidden="true"
                  ></div>
                  <div className="relative z-10 w-[90%] h-[90%] sm:w-[85%] sm:h-[85%] bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
                    <div className="h-8 sm:h-10 border-b border-slate-100 flex items-center px-3 sm:px-4 gap-2 bg-slate-50/50">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <div className="h-3 sm:h-4 w-24 sm:w-32 bg-slate-200 rounded-md mx-auto"></div>
                    </div>
                    <div className="flex-1 flex p-2 sm:p-3 gap-2 sm:gap-3">
                      <div className="w-1/4 hidden sm:flex flex-col gap-2">
                        <div className="h-8 bg-primary-50 rounded-lg border border-primary-100"></div>
                        <div className="h-8 bg-slate-50 rounded-lg"></div>
                        <div className="h-8 bg-slate-50 rounded-lg"></div>
                      </div>
                      <div className="flex-1 bg-emerald-50/50 rounded-lg border border-emerald-100 relative overflow-hidden flex items-center justify-center">
                        <div className="w-24 h-16 sm:w-32 sm:h-24 bg-primary-500/20 border-2 border-primary-500 rotate-12 transform rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                          <Map
                            size={24}
                            className="text-primary-600 sm:w-8 sm:h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="
                  relative mt-4 mx-auto w-full max-w-xs
                  sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0 sm:mx-0 sm:w-auto sm:max-w-none
                  bg-white p-3 rounded-2xl shadow-xl border border-slate-100 
                  flex items-center gap-3 z-20 justify-center sm:justify-start
                  animate-bounce
                "
                  style={{ animationDuration: "3s" }}
                >
                  <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">
                      نیاز آبی محاسبه شد
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      ۱۲,۵۰۰ m³
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ✅ Dashboard Preview Section                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section
        id="dashboard-preview"
        className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-[10px] sm:text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              پیش‌نمایش تعاملی
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">
              نگاهی به داشبورد هوشمند
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600">
              مدیریت متمرکز تمام داده‌های کشاورزی با نمودارهای تحلیلی و گزارش‌های دقیق.
            </p>
          </div>

          <DashboardPreview />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* Features Section (Continuous Slider)            */}
      {/* ═══════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-16 md:py-24 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">
              همه چیز برای مدیریت هوشمند مزارع
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600">
              ابزارهای حرفه‌ای طراحی شده برای دهیاران، مدیران منطقه و کشاورزان
              برای مدیریت بهتر و دقیق‌تر منابع.
            </p>
          </div>

          <div className="relative">
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing py-4 embla-fade-edges"
              ref={emblaRef}
            >
              <div className="flex -ml-4 touch-pan-y">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const colors = colorMap[feature.color] || colorMap.primary;

                  return (
                    <div
                      key={index}
                      className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] min-w-0 pl-4"
                    >
                      <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group h-full">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 ${colors.hoverBg} group-hover:text-white transition-all duration-300`}
                        >
                          <Icon size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* How It Works Section                            */}
      {/* ═══════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-16 md:py-24 bg-slate-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">
              در سه قدم ساده شروع کنید
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600">
              فرآیند ثبت و مدیریت زمین‌ها در سریع‌ترین زمان ممکن.
            </p>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-8 relative">
            <div className="hidden md:block absolute top-[32px] left-[16%] right-[16%] h-0.5 bg-slate-200 z-0"></div>

            <div className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center text-lg md:text-xl font-bold text-primary-600 md:mb-6 flex-shrink-0">
                ۱
              </div>
              <div className="text-right md:text-center">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 md:mb-2">
                  ایجاد حساب کاربری
                </h3>
                <p className="text-xs md:text-sm text-slate-600">
                  با نام کاربری و رمز عبور وارد سامانه شوید.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center text-lg md:text-xl font-bold text-primary-600 md:mb-6 flex-shrink-0">
                ۲
              </div>
              <div className="text-right md:text-center">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 md:mb-2">
                  ثبت زمین و کشاورز
                </h3>
                <p className="text-xs md:text-sm text-slate-600">
                  موقعیت زمین را روی نقشه رسم کرده و اطلاعات کشاورز را ثبت کنید.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center text-lg md:text-xl font-bold text-primary-600 md:mb-6 flex-shrink-0">
                ۳
              </div>
              <div className="text-right md:text-center">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 md:mb-2">
                  مدیریت و گزارش‌گیری
                </h3>
                <p className="text-xs md:text-sm text-slate-600">
                  نهاده‌ها را ثبت کرده و از داشبورد تحلیلی استفاده کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* CTA Section                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="absolute left-0 top-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-6">
            آماده‌ی مدیریت هوشمند اراضی هستید؟
          </h2>
          <p className="text-primary-100 text-sm sm:text-base md:text-lg mb-6 md:mb-10">
            همین حالا وارد سامانه شوید و مدیریت زمین‌های خود را متحول کنید.
          </p>
          <button
            onClick={handleLoginClick}
            className="
              inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl
              bg-white text-primary-900 text-sm sm:text-lg font-bold
              shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105
              transition-all duration-300 active:scale-95
            "
          >
            {isAuthenticated ? "رفتن به داشبورد" : "ورود به سامانه"}
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* Footer                                          */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200 pt-12 md:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <img
                  src="/android-chrome-512x512.png"
                  alt="آب خوان"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg grayscale opacity-80"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="text-lg md:text-xl font-bold text-slate-800">
                  آب خوان
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm">
                سامانه جامع مدیریت آب و اراضی کشاورزی، با هدف ارائه راهکارهای
                نوین برای بهینه‌سازی مصرف منابع و افزایش بهره‌وری در بخش
                کشاورزی.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 md:mb-4">
                دسترسی سریع
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-500">
                <li>
                  <button
                    onClick={() => scrollToSection("dashboard-preview")}
                    className="hover:text-primary-600 transition-colors"
                  >
                    پیش‌نمایش
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-primary-600 transition-colors"
                  >
                    ویژگی‌ها
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="hover:text-primary-600 transition-colors"
                  >
                    نحوه کارکرد
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="hover:text-primary-600 transition-colors"
                  >
                    ورود به سیستم
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 md:mb-4">
                تماس با ما
              </h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                  <span>خرم‌آباد، لرستان</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 flex-shrink-0" />
                  <span dir="ltr">۰۶۶-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400 flex-shrink-0" />
                  <span dir="ltr">info@abkhan.ir</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] md:text-sm text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} سامانه مدیریت کشاورزی آب خوان. کلیه
              حقوق محفوظ است.
            </p>
            <div className="flex gap-4 text-[10px] md:text-sm text-slate-400">
              <a href="#" className="hover:text-primary-600 transition-colors">
                قوانین و مقررات
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                حریم خصوصی
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;