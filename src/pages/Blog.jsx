import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Clock, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';

const placeholderPosts = [
  {
    id: 'placeholder-1',
    slug: 'kak-otkryt-zivnost',
    category: 'Živnosť',
    title: 'Как открыть živnosť в Словакии: пошаговая инструкция',
    excerpt: 'Полное руководство для тех, кто только приехал и хочет начать работать на себя.',
    reading_time: 8,
    created_date: '2025-03-15',
  },
  {
    id: 'placeholder-2',
    slug: 'nalogi-dlya-zivnostnikov',
    category: 'Налоги',
    title: 'Налоги для živnostník: что, когда и сколько платить',
    excerpt: 'Разбираемся в daň z príjmov, DPH, odvody в poisťovne — простыми словами.',
    reading_time: 12,
    created_date: '2025-02-20',
  },
  {
    id: 'placeholder-3',
    slug: 'pausalne-vydavky-vs-sro',
    category: 'Лайфхаки',
    title: 'Paušálne výdavky или s.r.o.? Что выгоднее в 2025',
    excerpt: 'Считаем на конкретных примерах — когда стоит переходить на фирму.',
    reading_time: 10,
    created_date: '2025-01-10',
  },
];

const categoryColors = {
  'Živnosť': 'bg-primary/10 text-primary',
  'Налоги': 'bg-secondary/10 text-secondary',
  'Лайфхаки': 'bg-green-500/10 text-green-500',
  'Бизнес': 'bg-amber-500/10 text-amber-500',
};

const ALL_CATEGORIES = ['Все', 'Налоги', 'Živnosť', 'Лайфхаки', 'Бизнес'];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50)
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  const displayPosts = posts.length > 0 ? posts : placeholderPosts;

  const filtered = displayPosts.filter((p) => {
    const matchCat = activeCategory === 'Все' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-black mb-4">
                <span className="gradient-text">Полезное</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Статьи о налогах, бизнесе и жизни предпринимателя в Словакии
              </p>
            </div>
          </AnimatedSection>

          {/* Search + Filters */}
          <AnimatedSection delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по статьям..."
                  className="w-full pl-9 pr-4 h-10 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Posts grid */}
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">Статьи не найдены</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 80}>
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <div className="glass rounded-2xl overflow-hidden h-full hover:border-primary/30 transition-all duration-500 hover:glow-blue">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-4xl">
                        {post.image_url
                          ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          : ['📋', '📊', '💡', '📝', '🏢', '💼'][i % 6]
                        }
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-muted text-muted-foreground'}`}>
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {post.reading_time || 5} мин
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary gap-2 group-hover:gap-3 transition-all">
                          Читать →
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}