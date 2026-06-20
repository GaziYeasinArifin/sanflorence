/* ============================================================
   SanFlorence — shared behavior: mobile menu + FAQ accordion
   ============================================================ */
(function () {
  // ---- mobile menu ----
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('navMenu');
  if (burger && menu) {
    function setMenu(open) {
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
    }
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
    // close when a link is tapped
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
    });
    // close if resized up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && menu.classList.contains('open')) setMenu(false);
    });
  }

  // ---- FAQ accordion ----
  var items = document.querySelectorAll('.faq-item');
  Array.prototype.forEach.call(items, function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close others for a clean single-open accordion
      Array.prototype.forEach.call(items, function (other) {
        other.classList.remove('open');
        var oq = other.querySelector('.faq-q');
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- contact form (opens a pre-filled email — no backend needed) ----
  var cform = document.getElementById('contactForm');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
      var name = val('cf-name'), email = val('cf-email'), company = val('cf-company');
      var topicEl = document.getElementById('cf-topic');
      var topic = topicEl ? topicEl.value : 'General enquiry';
      var message = val('cf-message');
      var status = document.getElementById('cf-status');
      if (!name || !email || !message) {
        if (status) status.textContent = 'Please add your name, email, and a message.';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) status.textContent = 'Please enter a valid email address.';
        return;
      }
      var subject = '[SanFlorence] ' + topic + ' — ' + name;
      var lines = ['Name: ' + name, 'Email: ' + email];
      if (company) lines.push('Company: ' + company);
      lines.push('Topic: ' + topic, '', message);
      window.location.href = 'mailto:hisanflorence@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      if (status) status.textContent = 'Opening your email app to send…';
    });
  }
})();
