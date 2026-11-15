/* ============================================================================
   ALL the words, links and numbers on the site live in this one file.
   Edit here, save, refresh. Nothing else needs to change.

   Small codes you can use inside any text:
     {co}        the visitor's company name (styled)
     _like this_ words in the italic accent style

   Things Swapnil must confirm are marked  // CONFIRM  and listed in TODO.md
   ============================================================================ */
window.SM_CONTENT = {

  links: {
    booking: 'https://calendar.app.google/bWBkA2vLXRVZgmjm6',
    email: 'askswapnil30@gmail.com',
    linkedin: 'https://in.linkedin.com/in/swapnil-mishra-55837b234'
  },

  /* shown when a visitor skips the name box */
  sampleName: 'Your Company',

  cred: {
    short: 'MBA, IIM Nagpur, 2026',
    line: 'MBA, Indian Institute of Management Nagpur, 2026. One of India’s top business schools.',
    note: 'The crest is shown only as his degree. IIM Nagpur has no part in this site.'
  },

  cta: {
    call: 'Book a 20-minute call',
    callShort: 'Book a call',
    look: 'Request my free first look',
    plan: 'Get my one-page plan'
  },

  hero: {
    eyebrow: 'Start here',
    title: 'What’s _your company_ called?',
    label: 'Your company name',
    placeholder: 'Lotus Bakery',
    help: 'Type it. Press Enter. Watch it get built.',
    skip: 'Skip, show me a sample',
    empty: 'Type a name first, or skip to see a sample.',
    builtEyebrow: 'Built for you',
    builtTitle: '{co}, built.',
    builtSub: 'This is your company as a building. Every floor is something I build for you, so you can stop chasing and start running it. Step inside.',
    builtCta: 'Walk through your building',
    rename: 'Change the name',
    colour: 'Pick your colour',
    announce: 'Done. The page is now built for {name}.',
    privacy: 'Nothing you type leaves your browser.'
  },

  /* ---------------- the five floors ---------------- */
  floorsIntro: {
    eyebrow: 'Your building',
    title: 'Five floors. Take the ones you need.',
    sub: 'Each floor is one thing I build. Look inside, then press the button on the floors you want. They go into your one-page plan.',
    sampleNote: 'You are looking at a sample. Type your company name at the top and every screen below becomes yours.',
    madeFor: 'Made for {co}, a moment ago',
    madeNote: 'These are sketches with your name dropped in, to show the kind of thing you get.',
    real: 'Real work, as delivered',
    pick: 'Add this floor to my plan',
    picked: 'In your plan',
    swipe: 'Swipe to see more',
    zoom: 'Look closer'
  },

  floors: [
    {
      id: 'ground', code: 'G', name: 'Ground floor',
      short: 'Your look and your website', title: 'Your look and your website',
      pain: 'People decide in three seconds. What do they see when they find you?',
      promise: 'A name people remember, a look that fits, and a website that brings customers to your door.',
      get: ['A logo and simple brand rules', 'Cards, letterheads and packs', 'A fast website that sells for you', 'Posts and reels, ready to go out'],
      mocks: ['cards', 'sign', 'web', 'social'],
      work: [
        { name: 'Aphelion Cyber', what: 'A 49-page website for a cyber-security company, made to feel like a film. Plus the brochure.',
          shots: [
            { src: 'aphelion-home', w: 1280, h: 738, frame: 'browser', alt: 'Aphelion Cyber home page: a dark room that glows from the centre.' },
            { src: 'aphelion-mobile', w: 640, h: 894, frame: 'phone', alt: 'Aphelion Cyber on a phone. Headline: Cybersecurity without the alarm.' },
            { src: 'aphelion-brochure', w: 760, h: 1076, frame: 'page', alt: 'Cover of the Aphelion Cyber brochure.' },
            { src: 'aphelion-redteam', w: 1280, h: 738, frame: 'browser', alt: 'An inner page of the Aphelion Cyber site about testing a company\u2019s defenders.' },
            { src: 'aphelion-map', w: 1280, h: 800, frame: 'browser', alt: 'A page of the Aphelion Cyber site that maps every service on one screen.' }
          ] },
        { name: 'Touro Auto', what: 'A whole brand for a mobile mechanic: logo, brand rules, stationery, catalogue, Instagram kit, website and the client presentation.',
          shots: [
            { src: 'touro-logo', w: 936, h: 596, frame: 'plain', alt: 'The Touro Auto logo: a bull’s head drawn into the line of a car, in gold on black.' },
            { src: 'touro-site', w: 1280, h: 800, frame: 'browser', alt: 'Touro Auto website: The mechanic that comes to you.' },
            { src: 'touro-social', w: 1300, h: 870, frame: 'plain', alt: 'Six Instagram posts from the Touro Auto launch kit.' },
            { src: 'touro-parts', w: 960, h: 508, frame: 'plain', alt: 'A slide from the Touro Auto presentation: One brand. Six finished parts.' }
          ] },
        { name: 'Kaya Foods', what: 'A food brand made ready for UK shops: the brand, the packs, the online shop and the social kit.',
          shots: [
            { src: 'kaya-board', w: 1400, h: 752, frame: 'plain', alt: 'The Kaya Foods brand board: logo, colours, type, food photos and packs.' },
            { src: 'kaya-packs', w: 1200, h: 905, frame: 'plain', alt: 'Two Kaya Foods packs: basmati rice and toor dal.' },
            { src: 'kaya-home', w: 1280, h: 656, frame: 'browser', alt: 'Kaya Foods online shop home page: Graded, not just packed.' },
            { src: 'kaya-ig', w: 900, h: 1196, frame: 'plain', alt: 'The Kaya Foods Instagram grid.' }
          ] },
        { name: 'Acer Plaza stores, Bhuyangdev and Prahladnagar', what: 'Store websites, store photos and the social reels for two laptop stores.',
          shots: [
            { src: 'stores-interior', w: 1170, h: 1020, frame: 'plain', alt: 'Inside the store: a long wall of laptops under bright lights.' },
            { reel: 'phone-tour', w: 360, h: 580, frame: 'phone', alt: 'A reel walking through the Bhuyangdev store.' },
            { src: 'stores-site', w: 1280, h: 655, frame: 'browser', alt: 'A section of the store website showing the displays you can try.' }
          ] },
        { name: 'Synexia Tradelink', what: 'The brand kit for an export firm: logos, a block-print pattern, cards and tags.',
          shots: [
            { src: 'synexia-kit', w: 1300, h: 851, frame: 'plain', alt: 'Synexia Tradelink card, tag, round mark and block-print pattern.' },
            { src: 'synexia-banner', w: 1300, h: 325, frame: 'plain', alt: 'The Synexia Tradelink banner on its lotus pattern.' }
          ] },
        { name: 'GP OverSeas', what: 'Website direction and product pictures for a paper, tags and gift-wrap supplier.',
          shots: [
            { src: 'gp-home', w: 1280, h: 800, frame: 'browser', alt: 'GP OverSeas home page idea: Colour, paper and tags for Europe’s shelves.' },
            { src: 'gp-range', w: 1280, h: 800, frame: 'browser', alt: 'GP OverSeas range page for gift wrap and tissue.' }
          ] }
      ],
      plan: { step: 'Your look: a logo, your colours and simple brand rules. Then a website with your real words and pictures.',
        get: ['A logo and a small brand guide', 'Cards, letterhead and social templates', 'A fast website you can update yourself'] }
    },
    {
      id: 'sales', code: '1', name: 'First floor',
      short: 'Customers and sales', title: 'Customers and sales',
      pain: 'Leads in your phone. Follow-ups in your head. Quotes in a folder somewhere.',
      promise: 'Every lead in one place, a catalogue that sells while you sleep, and a clear way into a new country.',
      get: ['One list of every lead, with the next step', 'Catalogues buyers keep on their desk', 'First messages that sound like a person', 'A step-by-step way into a new country'],
      mocks: ['board', 'catalogue', 'mail', 'market'],
      cv: 'Swapnil started in sales. In one earlier job his outreach ideas lifted reply rates by 40% and opened 100+ conversations.', // CONFIRM wording (from the CV)
      work: [
        { name: 'Kaya Foods', what: 'The selling tools for the UK launch: a trade catalogue, a shop playbook, a social playbook, and the label and allergen pack.',
          shots: [
            { src: 'kaya-catalogues', w: 1300, h: 660, frame: 'plain', alt: 'Three Kaya Foods covers: trade catalogue, shop playbook and social playbook.' },
            { src: 'kaya-label', w: 1000, h: 575, frame: 'plain', alt: 'The front and back of a Kaya Foods pouch, marked up for the printer.' }
          ] },
        { name: 'Touro Auto', what: 'A services catalogue, in print and on screen.',
          shots: [
            { src: 'touro-catalogue', w: 1200, h: 765, frame: 'plain', alt: 'The Touro Auto catalogue: cover and a page that explains how it works.' },
            { src: 'touro-card', w: 900, h: 550, frame: 'plain', alt: 'The Touro Auto business card, logo side.' }
          ] },
        { name: 'GP OverSeas', what: 'Product pictures and a catalogue of hundreds of lines, sorted so a buyer can find things.',
          shots: [
            { src: 'gp-tags', w: 1000, h: 403, frame: 'plain', alt: 'A fan of coloured paper tags from the GP OverSeas range.' }
          ] }
      ],
      plan: { step: 'One list for every lead, with the next step written on each. Then the catalogue and the first messages.',
        get: ['A sales board your team opens every morning', 'A catalogue or deck buyers can keep', 'First messages, written and ready to send'] }
    },
    {
      id: 'money', code: '2', name: 'Second floor',
      short: 'See your money', title: 'See your money',
      pain: 'How much came in this week? Who still owes you? You should not have to wait for month-end to know.',
      promise: 'One screen with all your numbers, fresh every morning. It reads your accounts. It never changes them.',
      get: ['One screen with all your numbers', 'Who owes you, and for how long', 'Reports that build themselves', 'A message on your phone when something looks wrong'],
      mocks: ['numbers', 'chat', 'checks'],
      builtNote: { name: 'Tally Live', what: 'Built by Swapnil. It reads a company’s accounting books and shows them on one screen, in a phone chat and in daily checks. It only reads. It never changes the books. The screens here are redrawn with made-up numbers.' },
      work: [],
      plan: { step: 'One screen with all your numbers, reading straight from your accounts.',
        get: ['Money in, money out and cash, fresh each morning', 'A list of who owes you and for how long', 'Automatic checks that flag odd entries'] }
    },
    {
      id: 'work', code: '3', name: 'Third floor',
      short: 'Work that does itself', title: 'Work that does itself',
      pain: 'The same spreadsheet. The same approvals. The same report. Every single month.',
      promise: 'One app that runs your company. Approvals in a tap. Reports that write themselves.',
      get: ['One app in place of ten spreadsheets', 'Approvals on your phone', 'Reports and letters made for you', 'AI helpers for the boring parts'],
      mocks: ['app', 'steps', 'sheet', 'helpers'],
      builtNote: { name: 'Armee ERP', what: 'Designed by Swapnil: one app that runs a company with many branches. People, leave, travel and approvals in one place. The screen here is redrawn with made-up data.' },
      work: [],
      plan: { step: 'The one job that eats the most hours gets its own small app.',
        get: ['One app in place of scattered spreadsheets', 'Approvals in a tap', 'Reports and letters that build themselves'] }
    },
    {
      id: 'roof', code: 'R', name: 'The roof',
      short: 'Where to go next', title: 'Where to go next',
      pain: 'A new product? A new city? A new country? Guessing is expensive.',
      promise: 'A clear plan before you spend: where to go, what it takes, and what to do first.',
      get: ['A growth plan you can act on', 'A plan to enter a new market', 'A project report for a bank or partner', 'A simple roadmap for an online store'],
      mocks: ['cover', 'road'],
      work: [
        { name: 'Angur Pulses', what: 'A plan to enter the UK and Europe, with the decks to present it. Covers only. The numbers stay private.',
          shots: [
            { src: 'angur-covers', w: 1080, h: 1232, frame: 'plain', alt: 'Two Angur Pulses deck covers: Growing Angur in the UK, and Building Angur’s United Kingdom business.' }
          ] },
        { name: 'A project report for a panel-making unit', what: 'Twenty pages a bank or partner can read. Title and layout only. Every figure is blurred.',
          shots: [
            { src: 'panel-report', w: 1300, h: 772, frame: 'plain', alt: 'Three pages of a project report with the text blurred, title showing.' }
          ] }
      ],
      plan: { step: 'A clear plan for the next move: a new product, a new city or a new country.',
        get: ['A growth plan with the steps in order', 'A new-market plan: rules, partners, first buyers', 'A project report you can hand to a bank or partner'] }
    }
  ],

  /* ---------------- words inside the sketches ---------------- */
  mock: {
    cards: { title: 'Business cards', role: 'Founder', line: 'Good to meet you.' },
    sign: { title: 'Shop sign', open: 'Open' },
    web: { title: 'Website', nav: ['Shop', 'About', 'Contact'], head: 'Hello from {co}.', sub: 'See what we make, and how to reach us.', btn: 'Get in touch' },
    social: { title: 'Social posts', a: 'Now open', b: 'Made with care.', c: 'New this week' },
    board: { title: 'Sales board', cols: ['New', 'Talking', 'Quote sent', 'Won'],
      cards: [['Harbour Café', 'Call on Tuesday'], ['Northside Dental', 'Send samples'], ['Oak Street Gym', 'Waiting for reply'], ['Bright & Co', 'Meet on Friday'], ['Pine Hotel', 'Second call'], ['Maple School', 'Quote sent Monday'], ['Riverside Clinic', 'Chase on Thursday'], ['Corner Bookshop', 'Order placed']] },
    catalogue: { title: 'Catalogue', line: 'Product catalogue', year: '2026 / 27' },
    mail: { title: 'First message', to: 'To', toName: 'Maya, Harbour Café', subject: 'A small idea for your second branch',
      body: ['Hi Maya,', 'Congratulations on the new branch. We helped a café like yours get ready for opening week.', 'Could I send you three samples?'], sign: 'Team {co}' },
    market: { title: 'New country', head: '{co} goes abroad', list: ['The rules and the labels', 'Who to sell through', 'The first 20 buyers to call', 'What to send first'] },
    numbers: { title: 'One screen with all your numbers', today: 'Today', sample: 'Sample numbers',
      tiles: [['Money in, this month', 48200, 'up'], ['Money out, this month', 31750, 'flat'], ['In the bank today', 18400, 'up'], ['Owed to you', 9650, 'late']],
      owed: 'Who owes you', rows: [['Harbour Café', 4200, '41 days'], ['Pine Hotel', 3100, '18 days'], ['Maple School', 2350, '6 days']] },
    chat: { title: 'Ask on your phone', name: '{co} numbers',
      lines: [['me', 'Cash today?'], ['bot', 'In the bank: {a}. Two payments landed this morning.'], ['me', 'Who is late?'], ['bot', 'Three customers. The oldest is 41 days. Shall I draft the reminders?']], cash: 18400 },
    checks: { title: 'This morning’s checks', ok: ['The bank matches the books', 'No invoice entered twice', 'Every sale has a customer'], warn: ['Two bills are due this week', 'One payment is larger than usual'] },
    app: { title: 'One app that runs your company', nav: ['People', 'Leave', 'Travel', 'Bills', 'Stock'], wait: 'Waiting for you',
      items: [['Leave request', 'Two days next week, site engineer'], ['Travel claim', 'Client visit, sales lead'], ['Purchase order', 'Printer paper, front office']], yes: 'Approve', no: 'Not now' },
    steps: { title: 'From 15 steps to 3', before: 'Before: about 15 steps for every bill', after: 'The new design: 3',
      three: ['One upload', 'One approval', 'One sign-off'],
      note: 'A state government billing system. Designed to cut about 15 manual steps per bill to 3. This is the design target, not a result yet.' },
    sheet: { title: 'Paper in, spreadsheet out', a: 'A pile of PDFs', b: 'One clean spreadsheet', note: 'Also built: reports that write themselves, and a tool that signs and stamps a whole batch of letters in one go.' },
    helpers: { title: 'AI helpers', head: 'Each job goes to the AI that does it best.', list: [['Finder', 'Looks things up'], ['Writer', 'Drafts the reply'], ['Checker', 'Reads it twice']],
      note: 'Set up for real jobs: a sales helper that drafts first messages, and a co-founder brief that knows the business.' },
    cover: { title: 'Growth plan', line: 'Where to go next', sub: 'Growth plan' },
    road: { title: 'A store’s road to profit', stops: ['Know what each product earns', 'Drop what loses money', 'Push the winners', 'Add the next place to sell'],
      note: 'The idea behind a profit and growth roadmap for an online store. No numbers shown.' } // CONFIRM: Axis Trading may be named?
  },

  /* ---------------- the one-page plan ---------------- */
  plan: {
    eyebrow: 'Your one-page plan',
    title: 'Six small questions. One clear page.',
    sub: 'Answer what you can and skip the rest. You get a one-page plan for {co}: what gets built first, what comes next, and what you end up with.',
    floorsLabel: 'Floors in your plan',
    floorsEmpty: 'No floors picked yet. That is fine. I will suggest some from your answers.',
    start: 'Start',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    make: 'Make my plan',
    of: 'of',
    questions: [
      { id: 'does', type: 'text', q: 'What does {co} do?', hint: 'One line is plenty.', ph: 'We bake and deliver cakes' },
      { id: 'buyers', type: 'one', q: 'Who buys from you?', options: ['People', 'Other companies', 'Both', 'Government'] },
      { id: 'pile', type: 'many', q: 'Where does the work pile up?', hint: 'Pick as many as you like.',
        options: [
          { label: 'Finding customers', score: { sales: 2, ground: 1 } },
          { label: 'Following up', score: { sales: 2 } },
          { label: 'Invoices and payments', score: { money: 2 } },
          { label: 'Reports', score: { money: 1, work: 1 } },
          { label: 'Stock and orders', score: { work: 2 } },
          { label: 'Approvals', score: { work: 2 } },
          { label: 'Deciding what is next', score: { roof: 2 } }
        ] },
      { id: 'people', type: 'one', q: 'How many people are involved?', options: ['Just me', '2 to 10', '11 to 50', '51 to 200', 'More than 200'] },
      { id: 'hurts', type: 'text', q: 'What hurts most right now?', hint: 'Say it the way you would say it to a friend.', ph: 'I never know who has paid' },
      { id: 'country', type: 'text', q: 'Which country do you sell in?', ph: 'United Kingdom' }
    ],
    paper: {
      kicker: 'One-page plan',
      by: 'Drawn up with Swapnil Mishra',
      told: 'What you told me',
      does: '{co} does this:',
      buyers: 'Who buys:',
      pile: 'Where the work piles up:',
      people: 'People involved:',
      hurts: 'What hurts most:',
      country: 'Where you sell:',
      none: 'Not said yet',
      floors: 'The floors in this plan',
      suggested: 'You did not pick any floors, so these are my suggestions from your answers.',
      order: 'What gets built, in order',
      zero: 'Before anything',
      zeroText: 'The free first look. I go through how {co} runs today and tell you what I would fix first.',
      phases: ['First', 'Then', 'After that'],
      why: 'We build from the ground up, unless something hurts more. Then that goes first.',
      get: 'What you end up with',
      honest: 'No prices on this page, and no dates. Both depend on what the first look finds. We settle them on the call.',
      foot: 'askswapnil.github.io'
    },
    actions: { send: 'Send me this plan', print: 'Print or save as PDF', again: 'Change my answers' },
    mail: { subject: 'One-page plan for {name}', hello: 'Hi Swapnil,', intro: 'Here is the one-page plan I made on your site. Could you take a first look?', bye: 'Thanks' }
  },

  /* ---------------- the reels wall ---------------- */
  reels: {
    eyebrow: 'Real reels',
    title: 'Made to stop a thumb.',
    sub: 'Reels made for the Acer Plaza stores in Bhuyangdev and Prahladnagar. Playing here without sound, cut short.',
    note: 'Product names and logos in the footage belong to their owners. Showing them here does not mean they back this site.',
    rows: [
      ['store-wall', 'spiral', 'store-zone', 'gaming', 'light', 'laptop-wall', 'opening'],
      ['desk', 'store-aisle', 'showcase', 'machine', 'store-shelf', 'screen-colour', 'fans']
    ],
    wide: ['spiral', 'light', 'machine', 'desk']
  },

  /* ---------------- what happens after we talk ---------------- */
  timeline: {
    eyebrow: 'What happens after we talk',
    title: 'Drag through the first 90 days.',
    label: 'The typical shape. We confirm yours on the call.',
    sliderLabel: 'Day',
    stuck: 'Stuck',
    sorted: 'Sorted',
    max: 90, // CONFIRM all day numbers below
    marks: [
      { day: 1, title: 'The first look', text: 'I sit with how your company runs today: the sheets, the messages, the numbers. You get a short list of what to fix first.' },
      { day: 30, title: 'The first thing is live', text: 'One real piece is in your hands and in daily use. Usually it is the one that hurt the most.' },
      { day: 90, title: 'It runs without you chasing', text: 'The daily work no longer waits for you. Your team knows how to use it, and you see everything in one place.' }
    ],
    things: [
      { label: 'A list of what to fix', day: 3 },
      { label: 'Your numbers on one screen', day: 21 },
      { label: 'Follow-ups', day: 30 },
      { label: 'The monthly report', day: 42 },
      { label: 'Approvals', day: 55 },
      { label: 'Your website', day: 64 },
      { label: 'The team knows how', day: 78 },
      { label: 'You, on a Sunday', day: 90 }
    ]
  },

  /* ---------------- don't hire me if ---------------- */
  dont: {
    title: 'Don’t hire me if…',
    items: [
      ['You want the cheapest option.', 'I am not it. I would rather build it once and build it right.'],
      ['You won’t show me your real numbers.', 'I can’t fix what I can’t see.'],
      ['You want a magic button.', 'There is thinking involved. Mostly mine. A little of yours.'],
      ['You want it done without one question.', 'I will ask a lot of them. That is how it ends up fitting you.'],
      ['You want a thick report for a drawer.', 'I build things you open on Monday morning.']
    ],
    end: 'Still here? Good. Let’s talk.'
  },

  /* ---------------- the free first look ---------------- */
  freeLook: {
    slotsThisWeek: null, // CONFIRM. null = "Limited free first looks each week." A number = "N free first looks left this week". 0 = line hidden, call offered instead.
    eyebrow: 'The free first look',
    title: 'Tell me one problem. I’ll take a first look, free.',
    sub: 'I look at how {co} runs today and tell you, in plain words, what I would fix first. No bill. No pressure.',
    limited: 'Limited free first looks each week.',
    left: '{n} free first looks left this week.',
    leftOne: '1 free first look left this week.',
    full: 'This week’s free first looks are taken. Book a 20-minute call and we start there.',
    fields: { name: 'Your name', company: 'Company', problem: 'The problem, in one line', reach: 'How to reach you', reachPh: 'Email works best' },
    send: 'Request my free first look',
    or: 'or',
    how: 'This opens your own email with the message written. Nothing is sent until you press send, and this site keeps nothing.',
    need: 'Please fill this in.',
    mail: { subject: 'Free first look for {company}', hello: 'Hi Swapnil,', ask: 'Could you take a free first look at this?', problem: 'The problem:', reach: 'Reach me at:', bye: 'Thanks' }
  },

  /* ---------------- closing ---------------- */
  close: {
    eyebrow: 'Lights on',
    title: '{co} is ready when you are.',
    sub: 'One short call, or one line about your problem. That is all it takes to start.',
    who: 'Built by Swapnil Mishra',
    about: 'Swapnil began in sales, so he knows what it takes to win a customer. Now he builds the whole company around that: the look, the selling, the numbers and the apps.',
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    foot: 'No trackers. No cookies. Nothing you typed was sent anywhere.',
    copyright: '© 2026 Swapnil Mishra'
  },

  dock: { plan: 'My plan', floors: 'floors', floor: 'floor' }
};
