import { GraduationCap, Globe, MapPin } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const stats = [
  { icon: GraduationCap, label: 'Магистр финансов, UK BA', emoji: '🎓' },
  { icon: Globe, label: 'RU / SK / EN', emoji: '🌍' },
  { icon: MapPin, label: 'Братислава', emoji: '📍' },
];

export default function About({ photoUrl }) {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo */}
          <AnimatedSection>
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="aspect-square rounded-3xl overflow-hidden glow-blue">
                <img
                  src={photoUrl}
                  alt="Евгений Пономарёв — финансовый консультант"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl -z-10 blur-sm" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl -z-10 blur-sm" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <div className="space-y-6">
            <AnimatedSection>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                Привет, я Евгений 👋
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Финансист, выпускник Univerzity Komenského, с опытом работы как в корпорациях (Deutsche Telekom, Arval Slovakia), так и в стартапах.
                Прошёл через весь процесс сам — от регистрации первой živnosťi до daňového priznania. 
                Теперь помогаю другим не наступать на те же грабли.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="flex flex-wrap gap-3 pt-2">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="glass rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium"
                  >
                    <span>{s.emoji}</span>
                    {s.label}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}