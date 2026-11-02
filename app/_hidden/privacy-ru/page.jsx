import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Политика конфиденциальности',
  description:
    'Какие данные мы собираем на epfinance.sk, как обрабатываем и какие у тебя есть права по GDPR.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const CONTROLLER_NAME = 'Evgenii Ponomarev (Евгений Пономарёв)';
// TODO: вписать реальный IČO после получения выписки из живности
const CONTROLLER_ICO = '__IČO__';
const CONTROLLER_ADDRESS = 'Bratislava, Slovenská republika';
const CONTROLLER_EMAIL = 'ponomarev.businessonly@gmail.com';
const CONTROLLER_PHONE = '+421 910 650 045';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Политика конфиденциальности</h1>

          <p className="text-sm text-muted-foreground">
            Действует с 17 апреля 2026 года. Последнее обновление: 17 апреля 2026.
          </p>

          <h2>1. Кто обрабатывает твои данные</h2>
          <p>
            <strong>Контролёр данных:</strong> {CONTROLLER_NAME}, SZČO<br />
            IČO: {CONTROLLER_ICO}<br />
            Адрес: {CONTROLLER_ADDRESS}<br />
            Email: <a href={`mailto:${CONTROLLER_EMAIL}`}>{CONTROLLER_EMAIL}</a><br />
            WhatsApp / телефон: {CONTROLLER_PHONE}
          </p>

          <h2>2. Какие данные мы собираем</h2>
          <h3>Контактная форма</h3>
          <p>Когда ты заполняешь форму на странице «Контакты», мы получаем:</p>
          <ul>
            <li>имя</li>
            <li>email</li>
            <li>текст сообщения</li>
          </ul>
          <p>
            Эти данные нужны исключительно для того, чтобы с тобой связаться и ответить
            на запрос. Мы не используем их для рассылок и не передаём третьим лицам сверх
            процессоров, перечисленных ниже.
          </p>

          <h3>Аналитика посещений</h3>
          <p>
            Мы используем <strong>Vercel Analytics</strong> — обезличенную статистику
            посещений: страны, устройства, источники трафика, популярность страниц.
            Vercel Analytics <strong>не использует cookies</strong> и не создаёт
            постоянных идентификаторов пользователя. Идентификация конкретного человека
            технически невозможна.
          </p>

          <h3>Технические данные</h3>
          <p>
            Хостинг (Vercel) автоматически фиксирует логи запросов: IP-адрес, время
            запроса, браузер. Эти данные нужны для безопасности и защиты от атак,
            хранятся ограниченный срок и не используются для маркетинга.
          </p>

          <h2>3. Кому передаются данные (процессоры)</h2>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> (США) — хостинг сайта и Vercel Analytics.
              Передача данных за пределы ЕС защищена Standard Contractual Clauses.
            </li>
            <li>
              <strong>Web3Forms</strong> (Mantle Inc., Германия / EU) — обработка
              отправки контактной формы. Сообщение пересылается на email
              контролёра.
            </li>
            <li>
              <strong>Google LLC</strong> — шрифты Inter и JetBrains Mono. Шрифты
              загружаются с серверов Vercel (self-hosted через next/font), браузер
              <em> не делает</em> прямых запросов к Google.
            </li>
          </ul>

          <h2>4. Cookies</h2>
          <p>
            Сайт <strong>не использует cookies для аналитики или рекламы</strong>.
            Единственное локальное хранилище браузера — настройка тёмной/светлой темы
            (ключ <code>ep-theme</code> в localStorage). Эта настройка хранится только у
            тебя на устройстве, никуда не передаётся, поэтому баннер согласия не нужен.
          </p>

          <h2>5. Правовые основания обработки</h2>
          <ul>
            <li>
              <strong>Контактная форма</strong> — твоё согласие в момент нажатия кнопки
              «Отправить» (статья 6(1)(a) GDPR).
            </li>
            <li>
              <strong>Vercel Analytics</strong> — законный интерес (статья 6(1)(f) GDPR):
              улучшение качества сервиса. Поскольку данные обезличены, риск для
              приватности минимальный.
            </li>
            <li>
              <strong>Технические логи</strong> — законный интерес: безопасность сервиса.
            </li>
          </ul>

          <h2>6. Срок хранения</h2>
          <ul>
            <li>Сообщения формы — до 12 месяцев или до твоего запроса на удаление.</li>
            <li>Аналитика — агрегированно, без персональных идентификаторов.</li>
            <li>Логи хостинга — стандартный срок Vercel (около 30 дней).</li>
          </ul>

          <h2>7. Твои права (GDPR)</h2>
          <p>В любой момент ты можешь:</p>
          <ul>
            <li>получить копию своих данных (право доступа);</li>
            <li>исправить неточные данные;</li>
            <li>удалить данные («право на забвение»);</li>
            <li>перенести данные в другое место;</li>
            <li>отозвать согласие.</li>
          </ul>
          <p>
            Запросы — на email{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`}>{CONTROLLER_EMAIL}</a>. Отвечу в
            течение 30 дней.
          </p>

          <h2>8. Жалобы</h2>
          <p>
            Если считаешь, что обработка данных нарушает твои права, можно подать жалобу
            в надзорный орган Словакии:{' '}
            <a
              href="https://dataprotection.gov.sk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Úrad na ochranu osobných údajov SR
            </a>
            .
          </p>

          <hr />

          <h2>Príloha: slovenská verzia (skrátená)</h2>
          <p>
            <strong>Prevádzkovateľ:</strong> {CONTROLLER_NAME}, SZČO, IČO:{' '}
            {CONTROLLER_ICO}, {CONTROLLER_ADDRESS}. Kontakt:{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`}>{CONTROLLER_EMAIL}</a>.
          </p>
          <p>
            <strong>Aké údaje spracúvame:</strong> Cez kontaktný formulár získavame meno,
            e-mail a obsah správy. Cez Vercel Analytics zbierame anonymnú návštevnosť
            (bez cookies a bez identifikácie používateľa). Hosting automaticky uchováva
            technické logy.
          </p>
          <p>
            <strong>Spracovatelia:</strong> Vercel Inc. (USA, SCC), Web3Forms (Nemecko /
            EÚ), Google LLC (písma cez self-hosted next/font).
          </p>
          <p>
            <strong>Cookies:</strong> Stránka nepoužíva žiadne cookies pre analytiku ani
            reklamu. Iba lokálne nastavenie tmavého/svetlého režimu (localStorage).
          </p>
          <p>
            <strong>Tvoje práva (GDPR):</strong> právo na prístup, opravu, vymazanie,
            prenosnosť a odvolanie súhlasu. Žiadosti pošli na{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`}>{CONTROLLER_EMAIL}</a>.
          </p>
          <p>
            <strong>Sťažnosti:</strong>{' '}
            <a
              href="https://dataprotection.gov.sk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Úrad na ochranu osobných údajov SR
            </a>
            .
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            Если у тебя есть вопросы по этой политике —{' '}
            <Link href="/#contact">напиши мне</Link>.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
