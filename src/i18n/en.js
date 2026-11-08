const en = {
  meta: {
    title: 'Evgenii Ponomarev | Business Controller, automation and AI agents',
    description:
      'Business Controller in Bratislava. I automate finance processes in Python and VBA and build apps with AI agents.',
  },
  skipLink: 'Skip to content',
  nav: {
    about: 'About',
    projects: 'Projects',
    tools: 'Calculators',
    contact: 'Contact',
    menu: 'Open menu',
    close: 'Close menu',
    home: 'Home',
  },
  languages: { label: 'Language', sk: 'Slovenčina', en: 'English' },
  hero: {
    role: 'Business Controller at Timac Agro Slovakia, Bratislava',
    headline: 'I automate finance processes and build tools with AI agents.',
    lead:
      'I run controlling for two entities {cz}{sk}. I automate recurring Excel work with Python, VBA and various AI tools, and in my free time I build my own apps. I believe the future belongs to AI automation and AI agents, and that is where I want to work.',
    primaryCta: 'See projects',
    secondaryCta: 'Write to me',
    facts: [
      { value: '8', label: 'processes moved from manual Excel to Python and VBA in 5 months' },
      { value: '~40 h', label: 'of manual work saved per month' },
      { value: '2', label: 'AI apps I built myself: AgroŠtít and CherryPicker' },
    ],
    status: 'Open to roles in AI automation',
    chips: ['AI automation', 'AI agents', 'AI in finance'],
    stackLabel: 'Tools I work with',
    stack: ['Python', 'Claude Code', 'MCP', 'TypeScript', 'React Native', 'FastAPI', 'pandas', 'VBA', 'SAP Business One', 'Power BI', 'Power Query', 'whisper.cpp'],
    photoAlt: 'Evgenii Ponomarev',
    photoPlaceholder: 'Photo coming soon',
  },
  about: {
    title: 'About',
    paragraphs: [
      'Since May 2026 I have been Business Controller at Timac Agro Slovakia, part of Groupe Roullier {fr}. I handle month-end closes and group reporting for the Czech {cz} and the Slovak {sk} entities, and help the CFO get a clearer view of how the business runs.',
      'I started by automating my own work, then built tools for colleagues in logistics, HR and office administration. Every tool is easy to use, properly documented and verifiable: its output has to reconcile to a control total with zero difference.',
      'Before that I worked in finance at Deutsche Telekom Cloud Services and Arval Slovakia, built pricing models for the staffing company ATALIS, and co-founded Coffee Corner, a network of self-service coffee stations, where I owned the P&L and cash flow.',
    ],
    principlesTitle: 'How I work with AI',
    principles: [
      { title: 'Human in the loop', text: 'Where money, customers or personal data are involved, a person always has the final say. AI drafts e-mails and payments for approval, it does not send them.' },
      { title: 'People first, then code', text: 'I start by talking to the people who do the work and fit the tool to their process, not the other way round.' },
      { title: 'Verifiable results', text: 'Control totals, golden tests and evals instead of a feeling that it looks right.' },
      { title: 'Data protection', text: 'I send only the data that is needed, mask personal data and transcribe speech locally where possible.' },
      { title: 'Test before go-live', text: 'A new tool runs in test mode or in parallel with the old process first.' },
    ],
    timelineTitle: 'Experience',
    timeline: [
      { period: '2026 – now', role: 'Business Controller (SK and CZ)', org: 'Timac Agro Slovakia, Groupe Roullier', current: true },
      { period: '2025', role: 'Pricing models for staffing deals', org: 'ATALIS, contractor' },
      { period: '2024 – 2026', role: 'Financial data analyst', org: 'Deutsche Telekom Cloud Services' },
      { period: '2023 – 2025', role: 'Co-founder, finance and P&L', org: 'Coffee Corner, self-service coffee stations' },
      { period: '2023', role: 'Accountant assistant, receivables', org: 'Arval Slovakia' },
    ],
    factsTitle: 'In short',
    facts: [
      { term: 'Based in', value: 'Bratislava, Slovakia' },
      { term: 'Languages', value: 'Slovak C2, English C1, Russian (native)' },
      { term: 'Studies', value: 'MSc Financial Management, Comenius University (2027)' },
      { term: 'Tools', value: 'Python, TypeScript, VBA, SQL, Claude Code, MCP, SAP Business One, Power BI' },
      {
        term: "Master's thesis",
        value:
          'Application of Accounting Fraud Detection Models in the Energy Sector. In Python I calculate the Beneish M-Score, Altman Z-Score and Dechow F-Score for a sample of energy companies.',
        wide: true,
      },
    ],
    certificatesTitle: 'Certifications',
    certificates: [
      { logo: 'microsoft', name: 'Microsoft Azure AI Essentials Professional Certificate', issuer: 'Microsoft and LinkedIn', date: 'November 2026' },
      { logo: 'anaconda', name: 'Machine Learning with Python Professional Certificate', issuer: 'Anaconda and LinkedIn', date: 'November 2026' },
    ],
    credential: 'Show credential',
    cv: 'LinkedIn profile',
  },
  projects: {
    title: 'Projects',
    intro: 'Outside work I build my own apps in React Native, write TypeScript and Python, and use AI agents throughout development. Here are two of them, plus the tools that run in my day job every week.',
    agrostit: {
      name: 'AgroŠtít',
      tagline:
        'A mobile app that uses AI to check a suspicious invoice, text message, e-mail or phone call. It is made for farmers and older people in Czechia and Slovakia.',
      status: 'iOS and Android in closed testing. Entered in the AI výzva pro Česko 2026 competition.',
      points: [
        'Expo / React Native in TypeScript with a FastAPI backend. Claude returns a risk level, the warning signs it found, quoted, and what to do next.',
        'Personal data is masked before anything is sent. Outputs follow a JSON Schema, companies are checked against the Czech VAT registry and ARES, and inputs are screened for prompt injection.',
        'Quality is guarded by evals with an LLM judge and automated tests. Speech-to-text runs on a self-hosted whisper.cpp, the backend on an EU VPS.',
      ],
      videoLabel: 'Demo video, 3 minutes',
      videoPlay: 'Play the AgroŠtít demo video',
      videoTitle: 'AgroŠtít demo',
      siteLink: 'AgroŠtít project website',
      stats: [
        { value: '55', label: 'eval cases' },
        { value: '~5,000', label: 'automated tests' },
        { value: '4', label: 'input types: invoice, text, e-mail, call' },
      ],
      sceneAlt: 'AgroŠtít on a phone at a kitchen table next to an invoice',
      shotsAlt: ['Home screen: check a message', 'Check result with warning signs'],
    },
    cherrypicker: {
      name: 'CherryPicker',
      tagline:
        'A week of dinners planned from the promo leaflets of Lidl, Kaufland, Tesco and Billa.',
      status: 'iOS on the App Store, Android in closed testing, web app.',
      points: [
        'A Python pipeline (pdfplumber, pydantic) pulls promotions out of PDF leaflets and matches products to recipes using rules and cached LLM decisions.',
        'An Expo / React Native app for iOS, Android and the web. Basket maths lives in both Python and TypeScript, and a golden test keeps them equal to the cent.',
        'An MCP server with six read-only tools so AI agents can use the planner. A 15-case tool-selection eval catches problems and bugs in how agents use it.',
      ],
      stats: [
        { value: '5,800+', label: 'promotions from leaflets' },
        { value: '4', label: 'grocery chains' },
        { value: '1,680', label: 'weekly plans precomputed' },
      ],
      storeLink: 'CherryPicker on the App Store',
      sceneAlt: 'CherryPicker on a phone next to promo leaflets and vegetables',
      shotsAlt: ['Weekly meal plan from promotions', 'Shopping list by store'],
    },
    automation: {
      name: 'Finance process automation',
      tagline:
        'Python and VBA tools that my colleagues and I use at Timac Agro. Figures come from my work there since May 2026.',
      columns: { process: 'Process', before: 'Before', after: 'Now' },
      rows: [
        { process: '“E-reminders”: a Python pipeline that checks, generates and sends payment reminders to customers', before: '4–5 h a week', after: '~15 min', ratio: 0.06 },
        { process: 'VBA macro that calculates sales team commissions in two countries (~40 reps)', before: '1–1.5 days', after: '3–4 h', ratio: 0.33 },
        { process: 'Pipeline that checks business trips for HR, analysing 4,700+ GPS trips', before: '1 day a month', after: '1 click', ratio: 0.03 },
        { process: 'Credit controlling', before: '2 h per cycle', after: '20 min', ratio: 0.17 },
        { process: 'Work procedures (SOPs) from recordings: local speech-to-text and an LLM draft', before: '5–8 h each', after: '0.5–1 h', ratio: 0.12 },
        { process: 'Automated comparison and check of sales visits: CRM against GPS', before: '53 unexplained', after: '21', ratio: 0.4 },
      ],
      stack: 'Python (pandas, python-docx), VBA, Power Query, SAP Business One, an LLM review agent',
    },
  },
  tools: {
    title: 'Calculators',
    intro: 'Four calculators for self-employed people in Slovakia. Everything is calculated in your browser.',
    open: 'Open calculator',
    all: 'All calculators',
    pageTitle: 'Calculators for the self-employed in Slovakia',
    pageDescription:
      'SZČO tax and contributions, živnosť vs s.r.o. vs employment, an invoice generator and late-filing penalties.',
    loading: 'Loading calculator…',
    breadcrumb: 'Breadcrumb',
  },
  contact: {
    title: 'Let’s talk',
    intro: 'If you would like to talk about a role or one of the projects, write to me.',
    channels: { email: 'E-mail', linkedin: 'LinkedIn', phone: 'Phone and WhatsApp' },
    form: {
      name: 'Name',
      email: 'E-mail',
      message: 'Message',
      consentBefore: 'I agree to my data being processed under the ',
      consentLink: 'privacy policy',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Thank you, your message is on its way. I will reply by e-mail.',
      failure: 'The message could not be sent. Please write to me directly at',
      errors: {
        name: 'Enter at least 2 characters.',
        email: 'Check the e-mail address.',
        message: 'Write at least 10 characters.',
        consent: 'I can only send the message with your consent.',
      },
      subject: 'Message from epfinance.sk from',
    },
  },
  footer: {
    privacy: 'Privacy',
  },
  privacy: {
    title: 'Privacy',
    updated: 'Updated 2 November 2026',
    sections: [
      {
        heading: 'Who processes your data',
        body: 'epfinance.sk is run by Evgenii Ponomarev, Bratislava. Contact: e.ponomarev2003@gmail.com.',
      },
      {
        heading: 'Contact form',
        body: 'Your name, e-mail and message are sent to my e-mail through the Web3Forms service. I use them only to reply and keep them for as long as our conversation lasts. The legal basis is your consent, which you can withdraw at any time by e-mail.',
      },
      {
        heading: 'Analytics',
        body: 'The site uses Vercel Web Analytics. It counts visits in aggregate, sets no cookies and does not store IP addresses.',
      },
      {
        heading: 'Calculators and video',
        body: 'The calculators run in your browser. The invoice generator keeps supplier details only in your browser storage (localStorage). The video thumbnail loads from YouTube servers; the video itself starts only after you click, via youtube-nocookie.com.',
      },
      {
        heading: 'Your rights',
        body: 'You have the right to access, correct and erase your data and to restrict its processing. You can complain to the Slovak Office for Personal Data Protection.',
      },
    ],
  },
  notFound: {
    title: 'Page not found',
    body: 'This address does not exist or has moved.',
    back: 'Back to home',
  },
  error: {
    title: 'Something went wrong',
    body: 'The page could not be shown. Please try again.',
    retry: 'Try again',
  },
};

export default en;
