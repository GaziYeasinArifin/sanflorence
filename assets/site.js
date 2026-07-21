/* ============================================================
   SanFlorence — shared behavior: mobile menu + FAQ accordion
   ============================================================ */

// ---- tab-visibility title swap ----
(function () {
  var real = document.title;
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? "\u{1F440} Where’d you go?" : real;
  });
})();

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
      window.location.href = 'mailto:hello@sanflorence.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      if (status) status.textContent = 'Opening your email app to send…';
    });
  }

  // ---- waitlist -> Google Sheet via Apps Script --------------------------------
  // Binds EVERY form[data-waitlist] on the page: waitlist.html has one, index.html's
  // modal has another. Never bind by id — site.js loads on both pages.
  // ---- "already signed up" flag -----------------------------------------------
  // Read by the 10s waitlist popup in index.html's inline controller, which uses
  // this EXACT key. Change one, change both. Written here rather than by calling
  // into that controller because site.js also runs on waitlist.html, where the
  // controller does not exist — and a signup there must suppress the homepage
  // popup too. Only ever set on a CONFIRMED success; the opaque/unreadable/server
  // paths never claim success, so they never write it either.
  var SF_WL_SIGNED_UP_KEY = 'sf.waitlist.signedup.v1';
  function sfMarkSignedUp() {
    try { window.localStorage.setItem(SF_WL_SIGNED_UP_KEY, String(Date.now())); return; } catch (e) {}
    try { window.sessionStorage.setItem(SF_WL_SIGNED_UP_KEY, String(Date.now())); } catch (e) {}
  }

  var WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjPb5Hg1gm-YQWzpGFdLZaBTRNmjJgyImlwmbzU4mcbqPo5Tz4v92pOn6RzBqSW5NL/exec';

  Array.prototype.forEach.call(document.querySelectorAll('form[data-waitlist]'), function (form) {
    if (!window.fetch) return;                       // no fetch: leave the form inert rather than lying
    var statusEl = form.querySelector('.form-status');
    var btn      = form.querySelector('button[type="submit"]');
    var readyAt  = Date.now();
    var busy     = false;

    function say(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }
    function val(name) { var el = form.elements[name]; return el && el.value ? el.value : ''; }
    function uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'sf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }
    function unlock(label) {
      busy = false;
      if (btn) { btn.disabled = false; if (label) btn.textContent = label; }
    }

    // Attempt 1 is a real CORS request. URLSearchParams makes fetch send
    // Content-Type: application/x-www-form-urlencoded, which is CORS-safelisted, so NO
    // preflight fires — critical, because Apps Script has no doOptions() and can never
    // answer one. The 302 to script.googleusercontent.com is followed transparently and
    // that response carries Access-Control-Allow-Origin: *, so the JSON is readable.
    // If the read is blocked anyway, attempt 2 re-sends with mode:'no-cors' — opaque,
    // but delivered. Same submission_id both times, so the server de-dupes.
    function send(body) {
      return fetch(WAITLIST_ENDPOINT, { method: 'POST', body: body })
        .then(function (r) { return r.text().then(function (t) { return { status: r.status, text: t }; }); })
        .then(function (res) {
          var data = null;
          try { data = JSON.parse(res.text); } catch (e) {}
          if (data && typeof data.ok === 'boolean') return { confirmed: true, data: data };
          return { confirmed: false, reason: res.status >= 500 ? 'server' : 'unreadable' };
        })
        .catch(function () {
          return fetch(WAITLIST_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body })
            .then(function () { return { confirmed: false, reason: 'opaque' }; })
            .catch(function () { return { confirmed: false, reason: 'offline' }; });
        });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (busy) return;

      var email = val('email').trim().toLowerCase();
      var insta = val('instagram').trim().replace(/^@+/, '');

      if (!email) { say("We'll need an email address to reach you.", 'err'); if (form.elements.email) form.elements.email.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        say("That email doesn't look quite right — mind checking it?", 'err');
        if (form.elements.email) form.elements.email.focus();
        return;
      }

      var body = new URLSearchParams();
      body.set('email', email);
      body.set('instagram', insta);
      body.set('source', location.pathname);          // pathname only — never a query string
      body.set('submission_id', uuid());              // idempotency key, reused across the retry
      body.set('website', val('website'));            // honeypot: must arrive empty
      body.set('elapsed', String(Date.now() - readyAt));

      busy = true;
      if (btn) btn.disabled = true;
      say('Sending…');

      send(body).then(function (r) {
        if (r.confirmed && r.data.ok && r.data.duplicate) {
          sfMarkSignedUp();                           // they are on the list: never popup at them again
          say("You're already on the list — nothing more to do.", 'ok');
          if (btn) btn.textContent = 'Already signed up';
          return;                                     // stays disabled: confirmed
        }
        if (r.confirmed && r.data.ok) {
          sfMarkSignedUp();                           // they are on the list: never popup at them again
          say("You're in — and your name's in the hat. We'll write when there's a new app to show you, or a winner to announce.", 'ok');
          if (btn) btn.textContent = 'Signed up';
          return;                                     // stays disabled: confirmed
        }
        if (r.confirmed && !r.data.ok) {
          var msgs = {
            email:     'That email address was rejected — please check it.',
            instagram: "That doesn't look like an Instagram handle — just the username is fine.",
            busy:      'We were briefly busy. Please try again.'
          };
          say(msgs[r.data.error] || 'Something went wrong on our end. Please try again.', 'err');
          unlock('Join the waitlist');
          return;
        }
        if (r.reason === 'offline') {
          say('That didn’t go through. Try again in a moment, or email hello@sanflorence.com.', 'err');
          unlock('Try again');
          return;
        }
        // 'opaque' | 'unreadable' | 'server': sent, but NOT confirmed. Never claim success here.
        say('Thanks — your details are on their way. This browser blocked the confirmation, ' +
            'so if you don’t hear from us, email hello@sanflorence.com.', 'warn');
        unlock('Send again');
      });
    });
  });
})();
