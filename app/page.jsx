// Phase 1 smoke test. Real landing page lands in Phase 2.
export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8 font-inter">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Next.js scaffold
        </p>
        <h1 className="text-3xl font-bold">EP. — миграция в процессе</h1>
        <p className="text-muted-foreground">
          App Router поднят. Живой сайт продолжает работать на Vite до Phase 4.
        </p>
        <p className="text-sm font-mono text-muted-foreground">
          font-inter + font-mono via next/font
        </p>
      </div>
    </main>
  );
}
