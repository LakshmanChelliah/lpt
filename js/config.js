window.EVENT_CONFIG = {
  name: 'LPT 10',
  editionLabel: '10th Ever Laksh Poker Tournament',
  dateDisplay: 'Saturday September 26th 7:00pm',

  // Registration settings
  registrationDeadline: '2026-09-25T23:59:00', // Local time: September 25, 2026 11:59 PM
  maxSpots: 20,

  // Single buy-in. There is no rebuy for this event.
  fees: [
    {
      value: '60',
      label: '$60 Registration',
      amount: 60,
      notice: '$60 registration. No rebuy this event.'
    }
  ],

  // Payment details
  paymentEmail: 'lakshman.chelliah@gmail.com',
  referencePrefix: 'LPT 10',

  // Invitee-facing event info (rendered into #event-details)
  eventDetails: {
    inviteTitle: 'Invites & Plus-Ones Only',
    inviteRule: "Plus-ones can’t bring plus-ones unless they’ve attended LPT before.",
    entry: '$60 entry (food & drinks included)',
    rebuy: 'No rebuy this event.',
    buyinSummary: '',
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
