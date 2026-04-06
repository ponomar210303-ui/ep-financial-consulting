import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

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

export default function BlogSection({ posts = [], blogImages = [] }) {
  const displayPosts = posts.length > 0 ? posts.slice(0, 3) : placeholderPosts;

  return (
    <section id="blog" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="gradient-text">Полезное</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Статьи о налогах, бизнесе и жизни предпринимателя в Словакии
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayPosts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 100}>
              <Link to={`/blog/${post.slug}`} className="group block h-full">
                <div className="glass rounded-2xl overflow-hidden h-full hover:border-primary/30 transition-all duration-500 hover:glow-blue">
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    {blogImages[i] ? (
                      <img
                        src={blogImages[i]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {['📋', '📊', '💡'][i]}
                      </div>
                    )}
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
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary gap-2 group-hover:gap-3 transition-all">
                      Читать
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}