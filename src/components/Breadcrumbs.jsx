import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Визуальные breadcrumbs. JSON-LD BreadcrumbList рендерится отдельно
 * на уровне страницы — здесь только UI.
 *
 * Props:
 *   items: [{ name: string, href?: string }]
 *     Последний элемент (без href) — текущая страница, не ссылка.
 *   homeIcon?: boolean — показать иконку дома вместо слова «Главная».
 */
export default function Breadcrumbs({ items, homeIcon = true }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Хлебные крошки" className="mb-6">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isFirst = i === 0;
          const content =
            isFirst && homeIcon ? (
              <>
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">{item.name}</span>
              </>
            ) : (
              item.name
            );

          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 truncate ${
                    isLast ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {content}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 flex-shrink-0 opacity-50"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
