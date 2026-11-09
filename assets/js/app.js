/* =====================================================================
   R.N. Walia / site scripts
   Reads window.SITE_CONFIG (assets/js/config.js). No dependencies.
   ===================================================================== */
(function () {
  "use strict";

  var C = window.SITE_CONFIG || {};
  var doc = document;
  var page = doc.body.getAttribute("data-page") || "";

  /* ---------- Utilities ---------- */
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o && o[k] != null ? o[k] : undefined; }, C);
  }
  function filled(v) { return typeof v === "string" ? v.trim() !== "" : !!v; }
  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  function pad2(n) { return String(n).padStart(2, "0"); }
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ARROW = '<span class="arr" aria-hidden="true">→</span>';

  /* ---------- Preview mode (development only) ---------- */
  var devHost = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var preview = false;
  if (devHost) {
    var params = new URLSearchParams(location.search);
    var ss = store("sessionStorage");
    if (params.has("preview")) {
      preview = params.get("preview") !== "0";
      try { ss && ss.setItem("rnw-preview", preview ? "1" : "0"); } catch (e) { /* ignore */ }
    } else {
      try { preview = !!ss && ss.getItem("rnw-preview") === "1"; } catch (e) { /* ignore */ }
    }
  }
  function isLive(item) { return !item || item.status !== "pending" || preview; }
  function pendingBadge(item) { return item && item.status === "pending" ? '<span class="badge-pending">Pending</span>' : ""; }

  /* ---------- Contact helpers ---------- */
  var contact = C.contact || {};
  var office = C.office || {};
  var has = { phone: filled(contact.phone), whatsapp: filled(contact.whatsapp), email: filled(contact.email) };
  has.any = has.phone || has.whatsapp || has.email;

  var links = {
    phone: has.phone ? "tel:" + contact.phone.replace(/[^\d+]/g, "") : "",
    whatsapp: has.whatsapp ? "https://wa.me/" + contact.whatsapp.replace(/\D/g, "") : "",
    email: has.email ? "mailto:" + contact.email.trim() : "",
    directions: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(office.mapQuery || ""),
    mapEmbed: "https://www.google.com/maps?q=" + encodeURIComponent(office.mapQuery || "") + "&output=embed"
  };
  function contactLabel(kind) {
    if (kind === "phone") return contact.phoneDisplay || contact.phone;
    if (kind === "whatsapp") return contact.phoneDisplay || "WhatsApp";
    if (kind === "email") return contact.email;
    return "";
  }
  var hours = (C.hours || []).filter(function (h) { return filled(h.time); });
  function hoursText() {
    return hours.map(function (h) { return (filled(h.days) ? h.days + ", " : "") + h.time; }).join("; ");
  }

  function liveServices() { return (C.services || []).filter(isLive); }

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }

  /* ---------- Clipboard & download ---------- */
  function copyText(text) {
    function fallback() {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
    }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(fallback);
    return fallback();
  }
  function downloadText(text, filename) {
    var url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    var a = doc.createElement("a");
    a.href = url;
    a.download = filename;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- Enquiry message builder ---------- */
  function buildMessage(rows) {
    var b = C.business || {};
    var date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    var lines = [
      "ENQUIRY FOR " + (b.displayName || "").toUpperCase() + ", " + (b.designation || "").toUpperCase(),
      "Prepared on " + date + " using the website enquiry form",
      ""
    ];
    rows.forEach(function (r) {
      if (!filled(r[1])) return;
      lines.push(r[0] + ":");
      lines.push(String(r[1]).trim());
      lines.push("");
    });
    return lines.join("\n").trim() + "\n";
  }

  /* Renders a prepared (NOT sent) message with honest delivery options. */
  function renderOutput(container, text, subject) {
    var subj = subject || "Enquiry via website";
    var opts = ['<button type="button" class="btn" data-act="copy">Copy summary ' + ARROW + "</button>"];
    if (has.whatsapp) opts.push('<a class="btn btn-line" target="_blank" rel="noopener" href="' + esc(links.whatsapp + "?text=" + encodeURIComponent(text)) + '">Open in WhatsApp ' + ARROW + "</a>");
    if (has.email) opts.push('<a class="btn btn-line" href="' + esc(links.email + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(text)) + '">Open in your email app ' + ARROW + "</a>");
    opts.push('<button type="button" class="btn btn-quiet" data-act="download">Download as text file</button>');
    opts.push('<button type="button" class="btn btn-quiet" data-act="print">Print</button>');

    var how = has.email || has.whatsapp
      ? "Nothing has been sent yet. This summary was prepared in your browser only. Choose an option below to send it yourself. WhatsApp or your email app will open with the message filled in, ready to review and send."
      : "Nothing has been sent yet. This summary was prepared in your browser only. Copy, download or print it, and bring it with you when you visit the office at " + (office.name || "the office") + ".";

    container.innerHTML =
      '<div class="output" tabindex="-1">' +
        '<div class="output-head"><strong>Your enquiry summary</strong><span class="pill">Not sent</span></div>' +
        '<div class="status-note" role="status"><p>' + esc(how) + "</p></div>" +
        "<pre>" + esc(text) + "</pre>" +
        '<div class="output-actions">' + opts.join("") + "</div>" +
      "</div>";
    container.hidden = false;
    var out = $(".output", container);
    out.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "copy") copyText(text).then(function () { toast("Summary copied"); }, function () { toast("Couldn't copy automatically. Please select the text and copy it"); });
      else if (act === "download") downloadText(text, "enquiry-rn-walia.txt");
      else if (act === "print") window.print();
    });
    return out;
  }

  /* ---------- Form validation helpers ---------- */
  function setError(field, msg) {
    var wrap = field.closest(".field") || field.parentNode;
    var id = (field.id || field.name) + "-error";
    var err = wrap.querySelector(".error-msg");
    if (msg) {
      wrap.classList.add("has-error");
      if (!err) {
        err = doc.createElement("p");
        err.className = "error-msg";
        err.id = id;
        wrap.appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", ((field.getAttribute("data-hint-id") || "") + " " + id).trim());
    } else {
      wrap.classList.remove("has-error");
      if (err) err.remove();
      field.removeAttribute("aria-invalid");
      if (field.getAttribute("data-hint-id")) field.setAttribute("aria-describedby", field.getAttribute("data-hint-id"));
      else field.removeAttribute("aria-describedby");
    }
  }
  var PHONE_RE = /^[+()\-\s\d]{8,20}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Bind config values into the page ---------- */
  function applyBindings() {
    $all("[data-bind]").forEach(function (el) {
      var v = get(el.getAttribute("data-bind"));
      if (filled(v)) el.textContent = v;
    });
    $all("[data-contact]").forEach(function (el) {
      var kind = el.getAttribute("data-contact");
      if (kind === "directions") { el.href = links.directions; return; }
      if (!has[kind]) { el.hidden = true; return; }
      el.href = links[kind];
      if (kind === "whatsapp") { el.target = "_blank"; el.rel = "noopener"; }
      var t = el.querySelector("[data-contact-text]");
      if (t) t.textContent = contactLabel(kind);
      el.hidden = false;
    });
    $all("[data-requires-contact]").forEach(function (el) { el.hidden = !has.any; });
    $all("[data-requires-phone]").forEach(function (el) { el.hidden = !has.phone; });
    $all("[data-requires-email]").forEach(function (el) { el.hidden = !has.email; });
    $all("[data-requires-no-contact]").forEach(function (el) { el.hidden = has.any; });
    $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    $all("[data-hours-text]").forEach(function (el) { el.textContent = hoursText(); });
    $all("[data-requires-hours]").forEach(function (el) { el.hidden = !hours.length; });
    $all("[data-hours]").forEach(function (el) {
      if (!hours.length) { el.hidden = true; return; }
      var list = el.querySelector("ul") || el;
      list.innerHTML = hours.map(function (h) { return "<li><span>" + esc(h.days || "Hours") + "</span><span>" + esc(h.time) + "</span></li>"; }).join("");
      el.hidden = false;
    });

    var social = (C.social || []).filter(function (s) { return filled(s.url) && filled(s.label); });
    $all("[data-social]").forEach(function (el) {
      if (!social.length) { el.hidden = true; return; }
      var list = el.querySelector("ul") || el;
      list.innerHTML = social.map(function (s) { return '<li><a class="inline-link" href="' + esc(s.url) + '" rel="noopener" target="_blank">' + esc(s.label) + "</a></li>"; }).join("");
      el.hidden = false;
    });

    var projects = (C.projects || []).filter(function (p) { return !p.sample || preview; });
    $all("[data-portfolio-link]").forEach(function (el) { el.hidden = projects.length === 0; });

    // If tools/set-site-url.mjs has not been run yet, keep the canonical link valid.
    var canon = $('link[rel="canonical"]');
    if (canon && canon.getAttribute("href").indexOf("__SITE_URL__") > -1) {
      var base = (C.site || {}).url;
      canon.setAttribute("href", filled(base)
        ? canon.getAttribute("href").replace("__SITE_URL__", base.replace(/\/?$/, "/"))
        : location.href.split(/[?#]/)[0]);
    }

    if (preview) {
      var bar = $("#preview-bar");
      if (bar) {
        bar.innerHTML = "Development preview: items marked <strong>Pending</strong> and sample portfolio entries are hidden on the live website. <a href=\"?preview=0\">Exit preview</a>";
        bar.hidden = false;
      }
    }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var header = $("#site-header");
    var toggle = $(".nav-toggle");
    var menu = $("#nav-menu");
    $all(".nav-list a").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
    });
    if (toggle && menu) {
      var setOpen = function (open, viaKeyboard) {
        doc.documentElement.classList.toggle("nav-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
        if (open && viaKeyboard) { var first = menu.querySelector("a"); if (first) setTimeout(function () { first.focus(); }, 50); }
      };
      toggle.addEventListener("click", function (e) { setOpen(toggle.getAttribute("aria-expanded") !== "true", e.detail === 0); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      doc.addEventListener("keydown", function (e) {
        if (toggle.getAttribute("aria-expanded") !== "true") return;
        if (e.key === "Escape") { setOpen(false); toggle.focus(); }
        if (e.key === "Tab") {
          var items = [toggle].concat($all("a:not([hidden]), button", menu).filter(function (x) { return x.offsetParent !== null; }));
          var i = items.indexOf(doc.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
          else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
        }
      });
      window.addEventListener("resize", function () { if (window.innerWidth >= 960 && toggle.getAttribute("aria-expanded") === "true") setOpen(false); });
    }
    var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal animations ---------- */
  function initReveal() {
    var targets = $all(".reveal, .steps");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Home: service index ---------- */
  function renderServiceIndex() {
    var wrap = $("#service-index");
    if (!wrap) return;
    wrap.innerHTML = liveServices().map(function (s, i) {
      return '<li class="reveal" style="--i:' + i + '"><a class="row" href="services.html#' + esc(s.id) + '">' +
        '<span class="row-n">' + pad2(i + 1) + "</span>" +
        '<span class="row-t">' + esc(s.title) + pendingBadge(s) + "</span>" +
        '<p class="row-d">' + esc(s.short) + "</p>" +
        '<span class="row-a" aria-hidden="true">→</span></a></li>';
    }).join("");
  }

  /* ---------- Home: "How can we help?" ---------- */
  var OTHER = {
    id: "other",
    title: "Something else, or I'm not sure",
    discovery: {
      explain: "Not every building or property question fits neatly into a category. If you are unsure which kind of help you need, a short description of your situation is the best place to start.",
      bring: ["A few lines about your situation", "Where the property is", "Any documents you already have"],
      next: "Describe your requirement in your own words. The office can then suggest whether and how it can help."
    }
  };

  function renderDiscovery() {
    var root = $("#discover");
    if (!root) return;
    var opts = liveServices().concat([OTHER]);
    var chips = $(".chips", root);
    var panel = $(".guide-panel", root);
    chips.innerHTML = opts.map(function (s) {
      return '<label class="chip"><input type="radio" name="discover" value="' + esc(s.id) + '"><span>' + esc(s.title) + pendingBadge(s) + "</span></label>";
    }).join("");

    function show(id) {
      var s = opts.filter(function (o) { return o.id === id; })[0];
      if (!s) return;
      var d = s.discovery || {};
      panel.innerHTML =
        '<div class="guide-cols">' +
          "<div><h3>" + esc(s.title) + "</h3><p>" + esc(d.explain) + "</p>" +
            '<div class="btn-row" style="margin-top:1.75rem"><a class="btn" href="enquiry.html?service=' + encodeURIComponent(s.id) + '">Begin an enquiry ' + ARROW + "</a></div>" +
            (s.id !== "other" ? '<p style="margin-top:1.25rem"><a class="link" href="services.html#' + esc(s.id) + '">More about this service ' + ARROW + "</a></p>" : "") +
          "</div>" +
          '<div><h4>Helpful to have ready</h4><ul class="dash-list">' + (d.bring || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul></div>" +
          "<div><h4>Suggested next step</h4><p>" + esc(d.next) + "</p></div>" +
        "</div>";
      panel.classList.remove("is-swapping");
      void panel.offsetWidth;
      panel.classList.add("is-swapping");
    }
    chips.addEventListener("change", function (e) { if (e.target.name === "discover") show(e.target.value); });
    var first = chips.querySelector("input");
    if (first) { first.checked = true; show(first.value); panel.classList.remove("is-swapping"); }
  }

  /* ---------- Services page ---------- */
  function renderServicesPage() {
    var wrap = $("#services-list");
    if (!wrap) return;
    var list = liveServices();
    var jump = $("#svc-jump");
    function li(arr, cls) { return '<ul class="' + (cls || "dash-list") + '">' + (arr || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }

    wrap.innerHTML = list.map(function (s, i) {
      return '<article class="svc" id="' + esc(s.id) + '" aria-labelledby="' + esc(s.id) + '-title"><div class="svc-layout">' +
        '<header class="svc-side"><span class="row-n">' + pad2(i + 1) + " / " + pad2(list.length) + "</span>" +
        '<h2 id="' + esc(s.id) + '-title">' + esc(s.title) + pendingBadge(s) + "</h2></header>" +
        '<div class="svc-body">' +
          '<p class="svc-plain">' + esc(s.plain) + "</p>" +
          '<div class="svc-blocks">' +
            '<section class="svc-block"><h3>Who might need it</h3>' + li(s.who) + "</section>" +
            '<section class="svc-block"><h3>What it usually involves</h3>' + li(s.involves, "n-list") + "</section>" +
            '<section class="svc-block"><h3>Information you may be asked for</h3>' + li(s.documents) + "</section>" +
            '<section class="svc-block"><h3>Good questions to ask before starting</h3>' + li(s.questions) + "</section>" +
          "</div>" +
          (s.note ? '<p class="svc-note">' + esc(s.note) + "</p>" : "") +
          '<div class="svc-cta"><a class="btn" href="enquiry.html?service=' + encodeURIComponent(s.id) + '">Enquire about this service ' + ARROW + "</a>" +
          '<a class="link" href="contact.html">Contact details</a></div>' +
        "</div>" +
      "</div></article>";
    }).join("");

    if (jump) jump.innerHTML = list.map(function (s) { return '<a href="#' + esc(s.id) + '">' + esc(s.title) + "</a>"; }).join("");

    if (jump && "IntersectionObserver" in window) {
      var jl = $all("a", jump);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          jl.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      $all(".svc", wrap).forEach(function (s) { io.observe(s); });
    }
    if (location.hash) {
      var target = doc.getElementById(location.hash.slice(1));
      if (target) setTimeout(function () { target.scrollIntoView(); }, 50);
    }
  }

  /* ---------- Service areas ---------- */
  function renderAreas() {
    var areas = ((C.serviceArea || {}).areas || []).filter(isLive);
    $all("[data-area-list]").forEach(function (el) {
      el.innerHTML = areas.map(function (a, i) {
        return '<li class="' + (i === 0 ? "is-office" : "") + '"><span>' + esc(a.name) + pendingBadge(a) + "</span>" + (a.note ? "<small>" + esc(a.note) + "</small>" : "") + "</li>";
      }).join("") + "<li><span>Surrounding areas</span></li>";
    });
  }

  /* ---------- About page ---------- */
  function renderAbout() {
    var facts = $("#about-facts");
    if (!facts) return;
    var b = C.business || {};
    var about = C.about || {};
    var rows = [
      ["Name", b.displayName],
      ["Designation", b.designation],
      ["Office", (office.street ? office.street + ", " : "") + office.locality + ", " + office.region],
      ["Areas served", (C.serviceArea || {}).summary]
    ];
    if (filled(b.fullName)) rows.splice(1, 0, ["Full name", b.fullName]);
    if (hours.length) rows.push(["Office hours", hoursText()]);
    (about.credentials || []).forEach(function (c) {
      if (c.status === "confirmed" && filled(c.value)) rows.push([c.label, c.value]);
      else if (preview) rows.push([c.label, '<span class="badge-pending" style="margin:0">Pending</span> <span class="muted small">' + (filled(c.value) ? esc(c.value) : "awaiting confirmation") + "</span>", true]);
    });
    facts.innerHTML = rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + (r[2] ? r[1] : esc(r[1])) + "</dd></div>"; }).join("");

    var frame = $("#portrait");
    if (frame && filled(about.portrait)) {
      frame.innerHTML = '<img src="' + esc(about.portrait) + '" alt="' + esc(about.portraitAlt) + '" width="800" height="1000" loading="lazy"><figcaption>' + esc(b.displayName) + ", " + esc(b.designation) + "</figcaption>";
    }
    var officeFig = $("#office-photo");
    if (officeFig && filled(about.officePhoto)) {
      officeFig.innerHTML = '<img src="' + esc(about.officePhoto) + '" alt="' + esc(about.officePhotoAlt) + '" loading="lazy">';
      officeFig.hidden = false;
    }
  }

  /* ---------- Contact page: map (click to load) ---------- */
  function initMap() {
    var btn = $("#load-map");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var frame = $("#map-frame");
      var iframe = doc.createElement("iframe");
      iframe.src = links.mapEmbed;
      iframe.title = "Google Map showing " + (office.name || "the office location");
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  }

  /* ---------- Contact page: short enquiry form ---------- */
  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;
    var sel = form.querySelector("#cf-service");
    sel.innerHTML = '<option value="">Choose one…</option>' + liveServices().map(function (s) {
      return "<option>" + esc(s.title) + "</option>";
    }).join("") + "<option>Something else / not sure</option>";
    var out = $("#contact-output");
    var status = $("#contact-status");
    var endpoint = ((C.form || {}).endpoint || "").trim();
    var submit = form.querySelector("[type=submit]");
    var submitLabel = endpoint ? "Send enquiry" : "Prepare my enquiry";
    submit.innerHTML = submitLabel + " " + ARROW;

    function validate() {
      var ok = true;
      var el = form.elements;
      if (!el.name.value.trim()) { setError(el.name, "Please enter your name."); ok = false; } else setError(el.name, "");
      var r = el.reach.value.trim();
      if (!r) { setError(el.reach, "Please give a phone number or email address so the office can reply."); ok = false; }
      else if (!PHONE_RE.test(r) && !EMAIL_RE.test(r)) { setError(el.reach, "Please enter a valid phone number or email address."); ok = false; }
      else setError(el.reach, "");
      if (!el.service.value) { setError(el.service, "Please choose the kind of help you need."); ok = false; } else setError(el.service, "");
      if (el.message.value.trim().length < 15) { setError(el.message, "Please describe your requirement in a sentence or two (at least 15 characters)."); ok = false; } else setError(el.message, "");
      if (!ok) { var f = form.querySelector("[aria-invalid='true']"); if (f) f.focus(); }
      return ok;
    }

    form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid")) setError(e.target, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.hidden = true;
      if (!validate()) return;
      var el = form.elements;
      var text = buildMessage([
        ["Name", el.name.value],
        ["How to reach me", el.reach.value],
        ["Help needed", el.service.value],
        ["Requirement", el.message.value]
      ]);
      if (endpoint && /^https:\/\//.test(endpoint)) {
        submit.disabled = true;
        submit.textContent = "Sending…";
        var fd = new FormData(form);
        fd.append("_subject", "Website enquiry: " + el.service.value);
        fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            form.reset();
            out.hidden = true;
            status.className = "form-status";
            status.textContent = "Thank you. Your enquiry has been sent to the office.";
            status.hidden = false;
            status.focus();
          })
          .catch(function () {
            status.className = "form-status err";
            status.textContent = "Sorry, the enquiry could not be sent just now. Your summary is shown below so you can send it another way.";
            status.hidden = false;
            renderOutput(out, text, "Website enquiry: " + el.service.value).focus();
          })
          .then(function () { submit.disabled = false; submit.innerHTML = submitLabel + " " + ARROW; });
      } else {
        renderOutput(out, text, "Website enquiry: " + el.service.value).focus();
      }
    });
  }

  /* ---------- Portfolio ---------- */
  function renderPortfolio() {
    var wrap = $("#projects");
    if (!wrap) return;
    var list = (C.projects || []).filter(function (p) { return !p.sample || preview; });
    var empty = $("#portfolio-empty");
    if (!list.length) { wrap.hidden = true; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    var ph = '<svg class="ph" viewBox="0 0 400 300" aria-hidden="true"><path d="M0 0L400 300M400 0L0 300"/></svg>';
    wrap.innerHTML = list.map(function (p, i) {
      var img = (p.images || [])[0];
      var media = img
        ? '<button type="button" data-lightbox="' + i + '" aria-label="View larger image: ' + esc(img.alt || p.title) + '"><img src="' + esc(img.src) + '" alt="' + esc(img.alt || "") + '" loading="lazy"></button>'
        : ph;
      var meta = [p.category, p.location, p.role, p.status].filter(filled).map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("");
      return '<article class="project reveal" style="--i:' + i + '"><div class="project-media">' + media + "</div>" +
        '<div class="project-body">' + (p.sample ? '<span class="badge-pending" style="margin:0 0 .75rem">Sample · preview only</span>' : "") +
        "<h2>" + esc(p.title) + '</h2><div class="project-meta">' + meta + '</div><p class="muted">' + esc(p.description) + "</p></div></article>";
    }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lightbox]");
      if (!b) return;
      var p = list[+b.getAttribute("data-lightbox")];
      openLightbox(p.images[0], p.title, b);
    });
  }
  function openLightbox(img, caption, opener) {
    var box = doc.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", caption);
    box.innerHTML = '<button type="button" class="btn lightbox-close">Close</button><figure style="margin:0"><img src="' + esc(img.src) + '" alt="' + esc(img.alt || "") + '"><figcaption>' + esc(caption) + "</figcaption></figure>";
    function close() { box.remove(); doc.removeEventListener("keydown", onKey); if (opener) opener.focus(); }
    function onKey(e) { if (e.key === "Escape") close(); else if (e.key === "Tab") { e.preventDefault(); box.querySelector("button").focus(); } }
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".lightbox-close")) close(); });
    doc.addEventListener("keydown", onKey);
    doc.body.appendChild(box);
    box.querySelector("button").focus();
  }

  /* ---------- Mobile contact dock ---------- */
  function initDock() {
    if (!doc.body.hasAttribute("data-dock")) return;
    var svg = {
      call: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></svg>',
      wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-3.6A8 8 0 1 1 8 19z"/></svg>',
      dir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>'
    };
    var items = [];
    if (has.phone) items.push('<a href="' + links.phone + '">' + svg.call + "Call</a>");
    if (has.whatsapp) items.push('<a href="' + links.whatsapp + '" target="_blank" rel="noopener">' + svg.wa + "WhatsApp</a>");
    if (!has.phone && !has.whatsapp) items.push('<a href="' + links.directions + '" target="_blank" rel="noopener">' + svg.dir + "Directions</a>");
    items.push('<a href="enquiry.html">Enquire →</a>');
    var dock = doc.createElement("nav");
    dock.className = "mobile-dock";
    dock.setAttribute("aria-label", "Quick contact");
    dock.innerHTML = items.join("");
    doc.body.appendChild(dock);
    var mq = window.matchMedia("(max-width: 959px)");
    function update() {
      dock.classList.toggle("is-visible", mq.matches && window.scrollY > 420);
      doc.documentElement.style.setProperty("--dock-h", mq.matches ? "56px" : "0px");
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Structured data (verified details only) ---------- */
  function injectStructuredData() {
    if (page !== "home" && page !== "contact") return;
    var b = C.business || {};
    var data = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: b.displayName + ", " + b.designation,
      description: b.summary,
      address: {
        "@type": "PostalAddress",
        streetAddress: office.street,
        addressLocality: office.locality,
        addressRegion: office.region,
        postalCode: office.postalCode,
        addressCountry: office.country
      },
      areaServed: ((C.serviceArea || {}).areas || []).filter(function (a) { return a.status !== "pending"; }).map(function (a) {
        return { "@type": "Place", name: a.name + ", " + office.region };
      }),
      hasMap: links.directions
    };
    var siteUrl = (C.site || {}).url;
    if (filled(siteUrl)) { data.url = siteUrl; data.image = siteUrl.replace(/\/?$/, "/") + "assets/img/og-image.png"; }
    if (has.phone) data.telephone = contact.phone;
    if (has.email) data.email = contact.email;
    var s = doc.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    doc.head.appendChild(s);
  }

  /* ---------- Public helpers for wizard.js ---------- */
  window.RNW = {
    config: C, preview: preview, has: has, links: links, esc: esc, filled: filled, ARROW: ARROW,
    liveServices: liveServices, OTHER: OTHER, pendingBadge: pendingBadge, isLive: isLive,
    buildMessage: buildMessage, renderOutput: renderOutput, setError: setError,
    PHONE_RE: PHONE_RE, EMAIL_RE: EMAIL_RE, toast: toast, store: store, reducedMotion: reducedMotion
  };

  /* ---------- Boot ---------- */
  applyBindings();
  initNav();
  renderServiceIndex();
  renderDiscovery();
  renderServicesPage();
  renderAreas();
  renderAbout();
  initMap();
  initContactForm();
  renderPortfolio();
  initDock();
  injectStructuredData();
  initReveal();
})();
