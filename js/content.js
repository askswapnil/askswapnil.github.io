/* ============================================================
   EDIT ME. Contact details, links, pricing and the Leak Audit logic.
   Anything still in [SQUARE_BRACKETS] is a placeholder: the site shows it
   as a marked placeholder and the matching button explains it is not set.
   Every placeholder is listed in TODO.md.
   Long-form copy (headlines, case files, story) lives in index.html.
   ============================================================ */
window.CONTENT = {
  contact: {
    bookingUrl: 'https://calendar.app.google/bWBkA2vLXRVZgmjm6',
    email: 'askswapnil30@gmail.com',
    linkedin: 'https://in.linkedin.com/in/swapnil-mishra-55837b234'
  },

  // Chapter teasers for the "Up next" pill. Order = order on the page.
  chapters: [
    { id: 'hero', label: 'Hero', next: 'What a tangle really costs' },
    { id: 'cost', label: 'The cost', next: "Four tangles I've already untangled" },
    { id: 'work', label: 'Case files', next: 'How it actually works' },
    { id: 'method', label: 'Method', next: 'The person behind it' },
    { id: 'operator', label: 'The operator', next: 'Find your own tangle in 60 seconds' },
    { id: 'audit', label: 'Leak Audit', next: 'One last thing' },
    { id: 'contact', label: 'Contact', next: 'Your business' }
  ],

  // Persona chips reorder the case files (ids from index.html).
  personas: {
    export: { note: 'Showing export and market-entry work first.', order: ['case-market', 'case-finance', 'case-billing', 'case-erp'] },
    growing: { note: 'Showing ERP and workflow work first.', order: ['case-erp', 'case-billing', 'case-finance', 'case-market'] },
    finance: { note: 'Showing finance and reconciliation work first.', order: ['case-finance', 'case-billing', 'case-erp', 'case-market'] }
  },

  /* ---------- Leak Audit ---------- */
  audit: {
    leaks: {
      entry: { name: 'Double entry', kind: 'Time leak', line: 'The same numbers get typed more than once, by more than one person.' },
      recon: { name: 'Records that do not reconcile', kind: 'Trust leak', line: 'Two sources disagree and someone spends days finding out which is right.' },
      approvals: { name: 'The approval queue', kind: 'Time leak', line: 'Finished work sits waiting for a signature, a stamp or a "looks fine".' },
      reporting: { name: 'Hand-built reporting', kind: 'Time and trust leak', line: 'Every report is rebuilt by hand, so it is late and nobody fully trusts it.' },
      followups: { name: 'Follow-up gaps', kind: 'Revenue leak', line: 'Leads, quotes and dues go quiet because nobody owns the next nudge.' },
      rework: { name: 'The rework loop', kind: 'Time leak', line: 'Things break often enough that redoing them has become part of the job.' }
    },
    // fallback second leak by situation, when only one pile-up is picked
    fallback: { export: 'followups', services: 'reporting', manufacturing: 'entry', gov: 'approvals', other: 'reporting' },
    people: { '1-2': 2, '3-5': 4, '6+': 7 },               // midpoint used in the estimate
    redo: { rarely: 0, monthly: 1, weekly: 4, constantly: 15 }, // rework cycles per month, indicative
    offers: {
      strategy: { name: 'Growth and market-entry strategy', why: 'Your leak starts before the process: in who you sell to and how the pipeline is followed up.' },
      platform: { name: 'Process-to-Platform build', why: 'Your leak is in the workflow itself. Map it, cut the touches, automate the checks.' },
      retainer: { name: 'Growth and automation retainer', why: 'Several small leaks at once. Fix the worst first, then keep the system tuned month by month.' }
    }
  }
};
