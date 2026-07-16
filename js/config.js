window.EVENT_CONFIG = {
  name: 'LPT 9',
  editionLabel: '9th Ever Laksh Poker Tournament',
  dateDisplay: 'Sunday July 19th 3:00pm',

  // Registration settings
  registrationDeadline: '2026-07-18T23:59:00', // Local time: July 18, 2026 11:59 PM
  maxSpots: 20,

  // Fee options shown in the select dropdown
  fees: [
    { value: '60', label: '$60 Registration', amount: 60 },
    { value: '80', label: '$80 Registration + re-buy', amount: 80 }
  ],

  // Payment details
  paymentEmail: 'lakshman.chelliah@gmail.com',
  referencePrefix: 'LPT 9',

  // Invitee-facing event info (rendered into #event-details)
  eventDetails: {
    inviteTitle: 'Invites & Plus-Ones Only',
    inviteRule: "Plus-ones can’t bring plus-ones unless they’ve attended LPT before.",
    entry: '$60 entry (food & drinks included)',
    rebuy: 'Optional $20 rebuy if out before final table',
    buyinSummary: 'Total: $60 or $80',
    format: 'Elimination style',
    bounty: '$20 knock-out for every player you eliminate',
    payouts: [
      { place: '1st', pct: '65%' },
      { place: '2nd', pct: '20%' },
      { place: '3rd', pct: '15%' }
    ],
    socialProof: 'LPT 4 (16 players): $338 / $104 / $78 + $280 in knock-out bonuses',
    note: 'First come, first serve. Hosted about every 2 months.'
  },

  // Script endpoint (kept here so it can be changed with future events if needed)
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzOMjf8VX2qoPcAaRX_dNjA1qrz47baiNDzeLAJlelRpxCdX2tpS6nsvlVLgSnPdgAk1A/exec'
};
