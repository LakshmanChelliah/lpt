const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOMjf8VX2qoPcAaRX_dNjA1qrz47baiNDzeLAJlelRpxCdX2tpS6nsvlVLgSnPdgAk1A/exec';
const REGISTRATION_DEADLINE = new Date('2026-01-24T21:00:00');
const MAX_SPOTS = 20;

document.addEventListener('DOMContentLoaded', () => {
  const countdownEl = document.getElementById('countdown');
  const form = document.getElementById('registration-form');
  const submitBtn = form.querySelector('button[type="submit"]');

    // -------- TAB SWITCHING --------
    document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b =>
        b.classList.remove('active')
        );
        btn.classList.add('active');

        document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
        });

        document.getElementById(target).style.display = 'block';
    });
    });

  // ---------------- SPOTS REMAINING ----------------
  async function updateSpotsRemaining() {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=count`);
      const data = await res.json();

      const remaining = MAX_SPOTS - data.count;
      const spotsEl = document.getElementById('spots-count');

      if (remaining <= 0) {
        spotsEl.innerText = 'SOLD OUT';
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sold Out';

        form.querySelectorAll('input, select').forEach(el => {
          el.disabled = true;
        });
      } else {
        spotsEl.innerText = remaining;
      }
    } catch (err) {
      document.getElementById('spots-count').innerText = '—';
    }
  }

  updateSpotsRemaining();

  // ---------------- COUNTDOWN TIMER ----------------
  function updateCountdown() {
    const now = new Date();
    const diff = REGISTRATION_DEADLINE - now;

    if (diff <= 0) {
      countdownEl.innerText = 'REGISTRATION CLOSED';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Registration Closed';

      form.querySelectorAll('input, select').forEach(el => {
        el.disabled = true;
      });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEl.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (diff < 1000 * 60 * 60 * 3) {
      document.getElementById('registration-timer').style.color = 'darkred';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------------- FORM SUBMIT ----------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const spotsLeft = parseInt(
      document.getElementById('spots-count').innerText,
      10
    );

    if (isNaN(spotsLeft) || spotsLeft <= 0) {
      alert('Registration is sold out.');
      return;
    }

    if (new Date() > REGISTRATION_DEADLINE) {
      alert('Registration is closed.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const fee = document.getElementById('fee').value;
    const referral = document.getElementById('referral').value || '';
    const amount = fee === '80' ? 80 : 60;

    const reference = `LPT 6 – ${name}`;

    const payload = new URLSearchParams({
      Name: name,
      Email: email,
      Phone: phone,
      Fee: fee,
      Amount: amount,
      Referral: referral
    });

    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: payload
    });

    document.getElementById('registration').style.display = 'none';
    document.getElementById('pay-amount').innerText = `$${amount}`;
    document.getElementById('pay-ref').innerText = reference;

    const payment = document.getElementById('payment-screen');
    payment.style.display = 'block';
    payment.style.visibility = 'visible';
  });
});

function copyText(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text);
  alert('Copied');
}

