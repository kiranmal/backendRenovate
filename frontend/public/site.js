document.addEventListener('DOMContentLoaded', function(){
  const reveals = document.querySelectorAll('.reveal');
  const quoteForm = document.getElementById('quoteForm');

  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    reveals.forEach(el => io.observe(el));
  }

  // Determine API base URL
  var API_BASE = (window.__ADM_API__ || '');
  if (!API_BASE) {
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') {
      API_BASE = 'http://localhost:5000/api';
    } else if (h.endsWith('vercel.app')) {
      API_BASE = 'https://renovate-max2max-inc.onrender.com/api';
    } else {
      API_BASE = location.origin + '/api'; // self-hosted — same domain
    }
  }

  if (quoteForm){
    quoteForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var f = quoteForm;
      var name = f.name.value.trim();
      var phone = f.phone.value.trim();
      var email = f.email.value.trim();
      var type = f.type.value;
      var details = f.details.value.trim();
      if(!name || !phone){ alert('Please enter your name and phone number.'); return; }

      var btn = f.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'SENDING...'; }

      try {
        var res = await fetch(API_BASE + '/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, phone: phone, email: email, type: type, details: details })
        });
        var data = await res.json();
        if (res.ok && data.success) {
          alert('Thank you! Your inquiry has been received. We will contact you soon.');
          quoteForm.reset();
        } else {
          throw new Error(data.message || 'Something went wrong');
        }
      } catch (err) {
        // Fallback to mailto if API fails
        var body = 'Name: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email + '\nProject Type: ' + type + '\nProject Details: ' + details;
        window.location.href = 'mailto:Renovatemax2max@gmail.com?subject=Quote Request&body=' + encodeURIComponent(body);
        quoteForm.reset();
      }

      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    });
  }
});
