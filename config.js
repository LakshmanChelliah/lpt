window.EVENT_CONFIG = {
  name: 'LPT 9',
  editionLabel: '9th Ever Laksh Poker Tournament Registration',
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

  // Script endpoint (kept here so it can be changed with future events if needed)
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzOMjf8VX2qoPcAaRX_dNjA1qrz47baiNDzeLAJlelRpxCdX2tpS6nsvlVLgSnPdgAk1A/exec'
};
