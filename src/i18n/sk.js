const sk = {
  meta: {
    title: 'Evgenii Ponomarev | Business Controller, automatizácia a AI agenti',
    description:
      'Business Controller v Bratislave. Automatizujem finančné procesy v Pythone a VBA a staviam aplikácie s AI agentmi.',
  },
  skipLink: 'Preskočiť na obsah',
  nav: {
    about: 'O mne',
    projects: 'Projekty',
    tools: 'Kalkulačky',
    contact: 'Kontakt',
    menu: 'Otvoriť menu',
    close: 'Zavrieť menu',
    home: 'Na úvod',
  },
  languages: { label: 'Jazyk', sk: 'Slovenčina', en: 'English' },
  hero: {
    role: 'Business Controller v Timac Agro Slovakia, Bratislava',
    headline: 'Automatizujem finančné procesy a staviam nástroje s AI agentmi.',
    lead:
      'Mám na starosti controlling pre dve entity {cz}{sk}. Opakovanú prácu v Exceli automatizujem v Pythone, VBA a pomocou rôznych AI nástrojov. Vo voľnom čase vyvíjam vlastné aplikácie. Som presvedčený, že budúcnosť patrí AI automatizácii a AI agentom, a práve na nich chcem pracovať.',
    primaryCta: 'Pozrieť projekty',
    secondaryCta: 'Napísať mi',
    facts: [
      { value: '8', label: 'procesov z ručného Excelu do Pythonu a VBA za 5 mesiacov' },
      { value: '~40 h', label: 'ručnej práce mesačne ušetrených' },
      { value: '2', label: 'vlastné aplikácie s AI: AgroŠtít a CherryPicker' },
    ],
    status: 'Otvorený novým výzvam v AI automatizácii',
    chips: ['AI automatizácia', 'AI agenti', 'AI vo financiách'],
    stackLabel: 'Technológie, s ktorými pracujem',
    stack: ['Python', 'Claude Code', 'MCP', 'TypeScript', 'React Native', 'FastAPI', 'pandas', 'VBA', 'SAP Business One', 'Power BI', 'Power Query', 'whisper.cpp'],
    photoAlt: 'Evgenii Ponomarev',
    photoPlaceholder: 'Fotka bude doplnená',
  },
  about: {
    title: 'O mne',
    paragraphs: [
      'Od mája 2026 pracujem ako Business Controller v Timac Agro Slovakia (Groupe Roullier {fr}). Robím mesačné uzávierky a reporting pre skupinu za českú {cz} aj slovenskú {sk} spoločnosti a pomáham CFO mať lepší prehľad o prevádzke firmy.',
      'Najprv som automatizoval vlastnú prácu, potom nástroje pre kolegov z logistiky, HR a administratívy. Každý nástroj je jednoduchý na používanie, riadne zdokumentovaný a overiteľný: výsledok musí sedieť s kontrolným súčtom na nulový rozdiel.',
      'Predtým som pracoval vo financiách v Deutsche Telekom Cloud Services a v Arval Slovakia, robil cenové modely pre personálnu agentúru ATALIS a spoluzakladal sieť samoobslužných kávových staníc Coffee Corner, kde som mal na starosti P&L a cash flow.',
    ],
    principlesTitle: 'Ako pracujem s AI',
    principles: [
      { title: 'Človek v slučke (human-in-the-loop)', text: 'Kde ide o peniaze, zákazníkov alebo osobné údaje, posledné slovo má vždy človek. E-maily a platby AI len pripraví na schválenie.' },
      { title: 'Najprv ľudia, potom kód', text: 'Začínam rozhovorom s tými, ktorí prácu robia, a nástroj staviam podľa ich procesu, nie naopak.' },
      { title: 'Overiteľné výsledky', text: 'Kontrolné súčty, golden testy a evaly namiesto pocitu, že to vyzerá dobre.' },
      { title: 'Ochrana dát', text: 'Posielam len nevyhnutné údaje, osobné údaje maskujem a reč prepisujem lokálne, kde sa dá.' },
      { title: 'Test pred ostrou prevádzkou', text: 'Nový nástroj beží najprv v testovacom režime alebo súbežne so starým postupom.' },
    ],
    timelineTitle: 'Profesionálne skúsenosti',
    timeline: [
      { period: '2026 – teraz', role: 'Business Controller (SK a CZ)', org: 'Timac Agro Slovakia, skupina Roullier', current: true },
      { period: '2025', role: 'Cenové modely pre personálne zákazky', org: 'ATALIS, externe' },
      { period: '2024 – 2026', role: 'Finančný a dátový analytik', org: 'Deutsche Telekom Cloud Services' },
      { period: '2023 – 2025', role: 'Spoluzakladateľ, financie a P&L', org: 'Coffee Corner, samoobslužné kávové stanice' },
      { period: '2023', role: 'Asistent účtovníka, pohľadávky', org: 'Arval Slovakia' },
    ],
    factsTitle: 'V skratke',
    facts: [
      { term: 'Mesto', value: 'Bratislava' },
      { term: 'Jazyky', value: 'slovenčina C2, angličtina C1, ruština (materinský jazyk)' },
      { term: 'Štúdium', value: 'Finančný manažment, Fakulta managementu UK (Mgr., 2027)' },
      { term: 'Nástroje', value: 'Python, TypeScript, VBA, SQL, Claude Code, MCP, SAP Business One, Power BI' },
    ],
    cv: 'LinkedIn profil',
  },
  projects: {
    title: 'Projekty',
    intro:
      'Mimo práce vyvíjam vlastné aplikácie v React Native, píšem v TypeScripte a Pythone a pri vývoji naplno využívam AI agentov. Tu sú dve z nich a nástroje, ktoré každý týždeň bežia v mojej práci.',
    agrostit: {
      name: 'AgroŠtít',
      tagline:
        'Mobilná aplikácia, ktorá s pomocou AI preverí podozrivú faktúru, SMS, e-mail alebo telefonát. Je pre farmárov a seniorov v Česku a na Slovensku.',
      status: 'iOS a Android v uzavretom testovaní. Prihlásená do súťaže AI výzva pro Česko 2026.',
      points: [
        'Expo / React Native v TypeScripte a backend vo FastAPI. Claude vráti mieru rizika, citované varovné znaky a čo robiť ďalej.',
        'Osobné údaje sa pred odoslaním maskujú. Výstupy idú cez JSON Schema, firmy sa overujú v registri DPH (MFČR) a v ARES, vstupy sa kontrolujú na prompt injection.',
        'Kvalitu strážia evaly s LLM ako hodnotiteľom a automatické testy. Prepis reči beží na vlastnom whisper.cpp, backend na VPS v EÚ.',
      ],
      videoLabel: 'Demo video, 3 minúty',
      videoPlay: 'Prehrať demo video AgroŠtít',
      videoTitle: 'AgroŠtít: demo',
      siteLink: 'Web projektu AgroŠtít',
      stats: [
        { value: '55', label: 'eval scenárov' },
        { value: '~5 000', label: 'automatických testov' },
        { value: '4', label: 'typy vstupov: faktúra, SMS, e-mail, hovor' },
      ],
      sceneAlt: 'AgroŠtít v telefóne na kuchynskom stole vedľa faktúry',
      shotsAlt: ['Úvodná obrazovka: overiť správu', 'Výsledok kontroly s varovnými znakmi'],
    },
    cherrypicker: {
      name: 'CherryPicker',
      tagline:
        'Plán večerí na celý týždeň zostavený z akciových letákov Lidl, Kaufland, Tesco a Billa.',
      status: 'iOS v App Store, Android v uzavretom testovaní, webová verzia.',
      points: [
        'Pipeline v Pythone (pdfplumber, pydantic) vytiahne akcie z PDF letákov a priradí produkty k receptom podľa pravidiel a uložených rozhodnutí LLM.',
        'Aplikácia v Expo / React Native pre iOS, Android aj web. Výpočet košíka je v Pythone aj v TypeScripte a oba stráži golden test s presnosťou na cent.',
        'MCP server so šiestimi nástrojmi na čítanie, cez ktorý môžu plánovač používať AI agenti. Eval výberu nástrojov (15 prípadov) zachytáva problémy a chyby v práci agentov.',
      ],
      stats: [
        { value: '5 800+', label: 'akcií z letákov' },
        { value: '4', label: 'obchodné reťazce' },
        { value: '1 680', label: 'predpočítaných týždenných plánov' },
      ],
      storeLink: 'CherryPicker v App Store',
      sceneAlt: 'CherryPicker v telefóne vedľa akciových letákov a zeleniny',
      shotsAlt: ['Jedálniček na týždeň z akcií', 'Nákupný zoznam podľa obchodov'],
    },
    automation: {
      name: 'Automatizácia finančných procesov',
      tagline:
        'Nástroje v Pythone a VBA, ktoré používam ja a moji kolegovia v Timac Agro. Údaje pochádzajú z mojej práce od mája 2026.',
      columns: { process: 'Proces', before: 'Predtým', after: 'Teraz' },
      rows: [
        { process: '„E-upomienky“: pipeline v Pythone na kontrolu, generovanie a odoslanie upomienok zákazníkom', before: '4–5 h týždenne', after: '~15 min', ratio: 0.06 },
        { process: 'VBA makro na výpočet provízií obchodného tímu v dvoch krajinách (~40 obchodníkov)', before: '1–1,5 dňa', after: '3–4 h', ratio: 0.33 },
        { process: 'Pipeline na kontrolu služobných jázd pre HR, analýza 4 700+ jázd z GPS', before: '1 deň mesačne', after: '1 klik', ratio: 0.03 },
        { process: 'Credit controlling', before: '2 h za cyklus', after: '20 min', ratio: 0.17 },
        { process: 'Pracovné postupy (SOP) z nahrávok: lokálny prepis reči a návrh textu cez LLM', before: '5–8 h na návod', after: '0,5–1 h', ratio: 0.12 },
        { process: 'Automatizované porovnanie a kontrola návštev obchodníkov: CRM oproti GPS', before: '53 nevysvetlených', after: '21', ratio: 0.4 },
      ],
      stack: 'Python (pandas, python-docx), VBA, Power Query, SAP Business One, LLM agent na revíziu',
    },
  },
  tools: {
    title: 'Kalkulačky',
    intro: 'Štyri kalkulačky pre živnostníkov na Slovensku. Všetko sa počíta vo vašom prehliadači.',
    open: 'Otvoriť kalkulačku',
    all: 'Všetky kalkulačky',
    pageTitle: 'Kalkulačky pre živnostníkov',
    pageDescription:
      'Dane a odvody SZČO, porovnanie živnosti, s.r.o. a TPP, generátor faktúr a pokuty za zmeškané termíny.',
    loading: 'Načítavam kalkulačku…',
    breadcrumb: 'Navigácia',
  },
  contact: {
    title: 'Porozprávajme sa',
    intro: 'Ak sa chcete porozprávať o pozícii alebo o niektorom z projektov, napíšte mi.',
    channels: { email: 'E-mail', linkedin: 'LinkedIn', phone: 'Telefón a WhatsApp' },
    form: {
      name: 'Meno',
      email: 'E-mail',
      message: 'Správa',
      consentBefore: 'Súhlasím so spracovaním údajov podľa ',
      consentLink: 'zásad ochrany súkromia',
      submit: 'Odoslať správu',
      sending: 'Odosielam…',
      success: 'Ďakujem, správa odišla. Odpoviem e-mailom.',
      failure: 'Správu sa nepodarilo odoslať. Napíšte mi priamo na',
      errors: {
        name: 'Zadajte aspoň 2 znaky.',
        email: 'Skontrolujte e-mailovú adresu.',
        message: 'Napíšte aspoň 10 znakov.',
        consent: 'Bez súhlasu správu neodošlem.',
      },
      subject: 'Správa z epfinance.sk od',
    },
  },
  footer: {
    privacy: 'Ochrana súkromia',
  },
  privacy: {
    title: 'Ochrana súkromia',
    updated: 'Aktualizované 2. novembra 2026',
    sections: [
      {
        heading: 'Kto spracúva údaje',
        body: 'Prevádzkovateľom stránky epfinance.sk je Evgenii Ponomarev, Bratislava. Kontakt: e.ponomarev2003@gmail.com.',
      },
      {
        heading: 'Kontaktný formulár',
        body: 'Meno, e-mail a text správy sa cez službu Web3Forms pošlú na môj e-mail. Použijem ich len na odpoveď a nechávam si ich, kým trvá naša komunikácia. Právnym základom je váš súhlas, ktorý môžete kedykoľvek odvolať e-mailom.',
      },
      {
        heading: 'Analytika',
        body: 'Stránka používa Vercel Web Analytics. Meria návštevnosť súhrnne, nepoužíva cookies a neukladá IP adresy.',
      },
      {
        heading: 'Kalkulačky a video',
        body: 'Kalkulačky počítajú v prehliadači. Generátor faktúr si údaje dodávateľa ukladá len do úložiska vášho prehliadača (localStorage). Náhľad videa sa načítava zo servera YouTube, samotné video sa spustí až po kliknutí cez youtube-nocookie.com.',
      },
      {
        heading: 'Vaše práva',
        body: 'Máte právo na prístup k údajom, ich opravu, vymazanie a obmedzenie spracúvania. Sťažnosť môžete podať na Úrad na ochranu osobných údajov SR.',
      },
    ],
  },
  notFound: {
    title: 'Stránka sa nenašla',
    body: 'Táto adresa neexistuje alebo sa presunula.',
    back: 'Späť na úvod',
  },
  error: {
    title: 'Niečo sa pokazilo',
    body: 'Stránku sa nepodarilo zobraziť. Skúste to znova.',
    retry: 'Skúsiť znova',
  },
};

export default sk;
