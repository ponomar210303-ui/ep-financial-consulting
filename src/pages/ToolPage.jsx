import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import tools from '../config/tools';
import SEO from '../components/SEO';
import TaxCalcSZCO from '../components/tools/TaxCalcSZCO';
import ZivnostComparison from '../components/tools/ZivnostComparison';
import InvoiceGenerator from '../components/tools/InvoiceGenerator';
import PenaltyCalc from '../components/tools/PenaltyCalc';

const componentMap = {
  'tax-calc': TaxCalcSZCO,
  'comparison': ZivnostComparison,
  'invoice': InvoiceGenerator,
  'penalty': PenaltyCalc,
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) return <Navigate to="/tools" replace />;

  const ToolComponent = componentMap[slug];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${tool.title} — EP. Финансовый консалтинг`}
        description={tool.desc}
        url={`/tools/${tool.slug}`}
      />
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Все инструменты
            </Link>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 text-2xl`}>
                {tool.emoji}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">{tool.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <ToolComponent />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
