import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const placeholderArticles = {
  'kak-otkryt-zivnost': {
    title: 'Как открыть živnosť в Словакии: пошаговая инструкция',
    category: 'Živnosť',
    reading_time: 8,
    created_date: '2025-03-15',
    body: `# Как открыть živnosť в Словакии

Живность (živnosť) — это самая популярная форма предпринимательства в Словакии. По сути, это аналог ИП в России. Давайте разберёмся, как её открыть.

## Шаг 1: Подготовка документов

Вам понадобится:
- Действующий вид на жительство
- Адрес регистрации в Словакии
- Выбранные коды деятельности (ŠKVN)

## Шаг 2: Выбор кодов деятельности

Это один из самых важных шагов. Коды определяют, чем вы можете заниматься. Существуют:
- **Voľné živnosti** — свободные, не требуют образования
- **Remeselné živnosti** — ремесленные, нужно подтверждение квалификации
- **Viazané živnosti** — связанные, нужна лицензия

## Шаг 3: Регистрация

Подать заявление можно на любом Okresnom úrade (районном управлении). Регистрация занимает 3-5 рабочих дней.

## Шаг 4: Регистрация в страховых

После получения IČO вас автоматически зарегистрируют в Sociálnej poisťovni. В zdravotnej poisťovni нужно зарегистрироваться самостоятельно.

## Стоимость

Регистрация одной voľnej živnosti — бесплатно при электронной подаче. При личной подаче — 5€ за каждый код.

---

Нужна помощь с открытием? [Запишитесь на бесплатную консультацию](#).`,
  },
  'nalogi-dlya-zivnostnikov': {
    title: 'Налоги для živnostník: что, когда и сколько платить',
    category: 'Налоги',
    reading_time: 12,
    created_date: '2025-02-20',
    body: `# Налоги для živnostník в Словакии

Разбираемся в системе налогов и взносов для живностников в Словакии. Спойлер: это проще, чем кажется.

## Daň z príjmov (Подоходный налог)

Ставки на 2025 год:
- **15%** — если ваш доход до 49 790€ в год
- **25%** — на доход свыше этой суммы

## Paušálne výdavky (Паушальные расходы)

Это лучший друг živnostník'а. Вместо учёта реальных расходов можно списать **60% от дохода** (до 20 000€ в год).

## Odvody (Страховые взносы)

### Zdravotné poistenie
- Минимум: ~91€/мес в 2025

### Sociálne poistenie
- Первый год — **не платите** (если доход за первый год ниже порога)
- Со второго года: минимум ~216€/мес

## DPH (НДС)

Регистрация обязательна при обороте выше 49 790€ за 12 месяцев. Ставка — 23%.

## Когда подавать декларацию

- **Daňové priznanie** — до 31 марта (можно продлить до 30 июня)
- **Prehľad o zrazkovej dani** — ежемесячно, если есть сотрудники

---

Запутались? Это нормально. Напишите мне — разберёмся вместе.`,
  },
  'pausalne-vydavky-vs-sro': {
    title: 'Paušálne výdavky или s.r.o.? Что выгоднее в 2025',
    category: 'Лайфхаки',
    reading_time: 10,
    created_date: '2025-01-10',
    body: `# Živnosť с paušálne výdavky vs. s.r.o.

Один из самых частых вопросов, которые мне задают: "Когда мне переходить на s.r.o.?" Давайте считать.

## Живность с паушальными расходами

**Плюсы:**
- Простой учёт (jednoduché účtovníctvo)
- 60% паушальные расходы
- Меньше бюрократии

**Минусы:**
- Неограниченная ответственность
- Выше страховые взносы при росте дохода

## S.r.o. (ООО)

**Плюсы:**
- Ограниченная ответственность
- Оптимизация налогов через зарплату + дивиденды
- Более серьёзный имидж

**Минусы:**
- Podvojné účtovníctvo (двойная бухгалтерия)
- Дороже в обслуживании
- Больше отчётности

## Когда переходить?

Простое правило: если ваш **чистый доход превышает 40 000€ в год**, начинайте считать s.r.o.

Но каждая ситуация уникальна. Нужно учитывать:
- Тип деятельности
- Планы по росту
- Нужны ли сотрудники
- Работаете ли вы с крупными клиентами

---

Хотите точный расчёт для вашей ситуации? Давайте обсудим на бесплатной консультации.`,
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      // Try to load from DB first
      const posts = await base44.entities.BlogPost.filter({ slug, published: true });
      if (posts.length > 0) {
        setPost(posts[0]);
      } else if (placeholderArticles[slug]) {
        setPost(placeholderArticles[slug]);
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground text-lg">Статья не найдена</p>
        <Link to="/" className="text-primary font-semibold hover:underline">
          ← На главную
        </Link>
      </div>
    );
  }

  const date = post.created_date
    ? new Date(post.created_date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/#blog';
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к блогу
        </Link>

        {/* Category */}
        <div className="mb-4">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-5 text-sm text-muted-foreground mb-12 pb-8 border-b border-border/30">
          {date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.reading_time || 5} мин чтения
          </div>
        </div>

        {/* Article body */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/#blog';
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Все статьи
          </Link>
        </div>
      </article>
    </div>
  );
}