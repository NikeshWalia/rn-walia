/* =====================================================================
   Property Requirement Builder (enquiry wizard)
   Organises an enquiry in the browser. It does NOT value property,
   give opinions, or send anything by itself.
   ===================================================================== */
(function () {
  "use strict";

  var R = window.RNW;
  var root = document.getElementById("wizard");
  if (!R || !root) return;

  var C = R.config, esc = R.esc;
  var STORE_KEY = "rnw-enquiry-draft";
  var ss = R.store("sessionStorage");

  var services = R.liveServices().concat([R.OTHER]);
  var areas = ((C.serviceArea || {}).areas || []).filter(R.isLive).map(function (a) { return a.name; });
  var ELSEWHERE = "Elsewhere nearby";

  var state = {
    service: "", propertyType: "", area: "", areaOther: "", locality: "",
    purpose: "", timeframe: "", description: "", docs: [],
    name: "", method: "", phone: "", email: "", bestTime: ""
  };
  try {
    var saved = ss && JSON.parse(ss.getItem(STORE_KEY) || "null");
    if (saved) Object.keys(state).forEach(function (k) { if (saved[k] != null) state[k] = saved[k]; });
  } catch (e) { /* ignore */ }

  var qs = new URLSearchParams(location.search).get("service");
  if (qs && services.some(function (s) { return s.id === qs; }) && qs !== state.service) {
    state.service = qs;
    state.purpose = "";
  }

  var current = 0;
  var fromReview = false;

  function save() { try { ss && ss.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function serviceObj() { return services.filter(function (s) { return s.id === state.service; })[0]; }
  function purposes() {
    var p = C.purposes || {};
    return p[state.service] || p.other || ["Other"];
  }

  /* ---------- Field builders ---------- */
  function radios(name, options, value, opts) {
    opts = opts || {};
    return '<div class="' + (opts.grid ? "choice-grid" : "choice-list") + '" role="radiogroup" aria-labelledby="' + name + '-legend" aria-describedby="' + name + '-err">' +
      options.map(function (o) {
        var val = typeof o === "string" ? o : o.value;
        var label = typeof o === "string" ? o : o.label;
        return '<label class="choice"><input type="radio" name="' + name + '" value="' + esc(val) + '"' + (val === value ? " checked" : "") + ">" +
          '<span class="choice-face">' + '<span class="label">' + esc(label) + (o.badge || "") + (o.sub ? '<span class="sub">' + esc(o.sub) + "</span>" : "") + '</span><span class="tick"></span></span></label>';
      }).join("") + "</div>" +
      '<div id="' + name + '-err" class="wiz-error" aria-live="polite"></div>';
  }
  function checks(name, options, values) {
    return '<div class="choice-grid">' + options.map(function (o) {
      return '<label class="choice"><input type="checkbox" name="' + name + '" value="' + esc(o) + '"' + (values.indexOf(o) > -1 ? " checked" : "") + '><span class="choice-face"><span class="label">' + esc(o) + '</span><span class="tick"></span></span></label>';
    }).join("") + "</div>";
  }
  function input(id, label, value, o) {
    o = o || {};
    var hint = o.hint ? '<p class="hint" id="' + id + '-hint">' + esc(o.hint) + "</p>" : "";
    var common = ' id="' + id + '" name="' + id + '"' + (o.hint ? ' aria-describedby="' + id + '-hint" data-hint-id="' + id + '-hint"' : "") + (o.attrs || "");
    var ctrl = o.textarea
      ? '<textarea class="textarea"' + common + ' rows="6">' + esc(value) + "</textarea>"
      : '<input class="input" type="' + (o.type || "text") + '"' + common + ' value="' + esc(value) + '">';
    return '<div class="field"><label for="' + id + '">' + esc(label) + (o.optional ? ' <span class="opt">(optional)</span>' : "") + "</label>" + hint + ctrl + "</div>";
  }
  function head(q, sub, name) {
    return '<legend id="' + (name || "q") + '-legend"><span class="q">' + esc(q) + "</span></legend>" + (sub ? '<p class="q-sub">' + esc(sub) + "</p>" : "");
  }

  /* ---------- Steps ---------- */
  var STEPS = [
    {
      title: "Type of assistance",
      render: function () {
        return head("What type of assistance do you need?", "Choose the closest match. If you're not sure, choose the last option.", "service") +
          radios("service", services.map(function (s) { return { value: s.id, label: s.title, badge: R.pendingBadge(s) }; }), state.service);
      },
      validate: function () { return state.service ? "" : "Please choose the type of assistance you need."; },
      errTarget: "service"
    },
    {
      title: "Property type",
      render: function () {
        return head("What is the property or project type?", "", "propertyType") +
          radios("propertyType", C.propertyTypes || [], state.propertyType, { grid: true });
      },
      validate: function () { return state.propertyType ? "" : "Please choose a property type."; },
      errTarget: "propertyType"
    },
    {
      title: "Location",
      render: function () {
        return head("Where is the property located?", "A general location is enough. Please don't share a full address at this stage.", "area") +
          radios("area", areas.concat([ELSEWHERE]), state.area, { grid: true }) +
          '<div data-area-other' + (state.area === ELSEWHERE ? "" : " hidden") + ">" + input("areaOther", "Which town or area?", state.areaOther) + "</div>" +
          input("locality", "Sector, village or locality", state.locality, { optional: true, hint: "For example: Sector 12. This helps the office understand the general location." });
      },
      validate: function () {
        if (!state.area) return "Please choose where the property is located.";
        if (state.area === ELSEWHERE && !state.areaOther.trim()) return { field: "areaOther", msg: "Please tell us the town or area." };
        return "";
      },
      errTarget: "area"
    },
    {
      title: "Purpose",
      render: function () {
        return head("What is the general purpose of your enquiry?", "", "purpose") +
          radios("purpose", purposes(), state.purpose) +
          '<div class="field" style="margin-top:1.5rem"><label for="timeframe">Is there a timeline? <span class="opt">(optional)</span></label>' +
          '<select class="select" id="timeframe" name="timeframe"><option value="">Choose…</option>' +
          (C.timeframes || []).map(function (t) { return "<option" + (t === state.timeframe ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") +
          "</select></div>";
      },
      validate: function () { return state.purpose ? "" : "Please choose the purpose of your enquiry."; },
      errTarget: "purpose"
    },
    {
      title: "Details",
      render: function () {
        return head("What would you like to share about your requirement?", "Describe it in your own words. A few sentences is plenty.", "description") +
          input("description", "Your requirement", state.description, { textarea: true, hint: "For example: what you are planning, the size of the plot or building, and what you would like help with." }) +
          '<p class="label" style="font-weight:500;margin:1.5rem 0 .6rem">Which of these do you already have? <span class="opt">(optional)</span></p>' +
          checks("docs", C.documentsAvailable || [], state.docs) +
          '<p class="privacy-note">Please do not include identity numbers, bank details, or copies of documents in this form. If documents are needed, the office will tell you which ones and how to share them.</p>';
      },
      validate: function () { return state.description.trim().length >= 20 ? "" : { field: "description", msg: "Please describe your requirement in a little more detail (at least 20 characters)." }; }
    },
    {
      title: "Contact preference",
      render: function () {
        var needPhone = state.method === "Phone call" || state.method === "WhatsApp";
        return head("How would you prefer the office to contact you?", "", "contact") +
          input("name", "Your name", state.name, { attrs: ' autocomplete="name"' }) +
          '<p class="label" id="method-legend" style="font-weight:500;margin:.25rem 0 .6rem">Preferred way to be contacted</p>' +
          radios("method", ["Phone call", "WhatsApp", "Email", "I will visit the office"], state.method, { grid: true }) +
          '<div class="field-row">' +
            '<div data-phone' + (needPhone ? "" : " hidden") + ">" + input("phone", "Phone number", state.phone, { type: "tel", attrs: ' autocomplete="tel" inputmode="tel"' }) + "</div>" +
            '<div data-email' + (state.method === "Email" ? "" : " hidden") + ">" + input("email", "Email address", state.email, { type: "email", attrs: ' autocomplete="email"' }) + "</div>" +
          "</div>" +
          input("bestTime", "Best time to reach you", state.bestTime, { optional: true });
      },
      validate: function () {
        if (!state.name.trim()) return { field: "name", msg: "Please enter your name." };
        if (!state.method) return { radio: "method", msg: "Please choose how you would like to be contacted." };
        if ((state.method === "Phone call" || state.method === "WhatsApp")) {
          if (!state.phone.trim()) return { field: "phone", msg: "Please enter a phone number." };
          if (!R.PHONE_RE.test(state.phone.trim())) return { field: "phone", msg: "Please enter a valid phone number, e.g. 98765 43210." };
        }
        if (state.method === "Email") {
          if (!state.email.trim()) return { field: "email", msg: "Please enter an email address." };
          if (!R.EMAIL_RE.test(state.email.trim())) return { field: "email", msg: "Please enter a valid email address." };
        }
        return "";
      }
    },
    {
      title: "Review",
      render: function () {
        var rows = summaryRows();
        var stepFor = [0, 1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5];
        return head("Review your enquiry", "Check your answers. You can edit anything before preparing the summary.", "review") +
          '<dl class="review">' + rows.map(function (r, i) {
            if (!R.filled(r[1])) return "";
            return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + '</dd><button type="button" class="edit" data-edit="' + stepFor[i] + '">Edit<span class="visually-hidden"> ' + esc(r[0]) + "</span></button></div>";
          }).join("") + "</dl>" +
          '<p class="privacy-note">Preparing the summary does not send it. You will then choose how to share it with the office.</p>';
      },
      validate: function () { return ""; }
    }
  ];

  function summaryRows() {
    var s = serviceObj();
    var loc = state.area === ELSEWHERE ? state.areaOther : state.area;
    if (state.locality.trim()) loc = state.locality.trim() + ", " + loc;
    return [
      ["Help needed", s ? s.title : ""],
      ["Property type", state.propertyType],
      ["Location", loc],
      ["Purpose", state.purpose],
      ["Timeline", state.timeframe],
      ["Requirement", state.description],
      ["Documents available", state.docs.join(", ")],
      ["Name", state.name],
      ["Preferred contact", state.method],
      ["Phone", state.method === "Phone call" || state.method === "WhatsApp" ? state.phone : ""],
      ["Email", state.method === "Email" ? state.email : ""],
      ["Best time to reach", state.bestTime]
    ];
  }

  /* ---------- Rendering ---------- */
  var form = root.querySelector("form");
  var stepHost = root.querySelector("[data-step-host]");
  var prevBtn = root.querySelector("[data-prev]");
  var nextBtn = root.querySelector("[data-next]");
  var bar = root.querySelector(".wiz-bar span");  // optional
  var counter = root.querySelector("[data-counter]");
  var stepName = root.querySelector("[data-step-name]");
  var rail = root.querySelector(".wiz-steps");
  var done = root.querySelector("[data-done]");
  var navEl = root.querySelector(".wiz-nav");

  rail.innerHTML = STEPS.map(function (s, i) {
    return '<li><span class="n">' + (i + 1) + '</span><span class="t">' + esc(s.title) + "</span></li>";
  }).join("");

  function render(focus) {
    var step = STEPS[current];
    stepHost.innerHTML = '<fieldset class="wiz-step is-entering" tabindex="-1">' + step.render() + "</fieldset>";
    prevBtn.hidden = current === 0;
    var last = current === STEPS.length - 1;
    nextBtn.innerHTML = (last ? "Prepare enquiry summary" : (fromReview ? "Return to review" : "Next")) + " " + R.ARROW;
    var pct = Math.round((current / (STEPS.length - 1)) * 100);
    if (bar) bar.style.width = pct + "%";
    counter.textContent = "Step " + (current + 1) + " of " + STEPS.length;
    stepName.textContent = step.title;
    Array.prototype.forEach.call(rail.children, function (li, i) {
      li.classList.toggle("is-done", i < current);
      li.classList.toggle("is-current", i === current);
      if (i === current) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    if (focus) {
      var fs = stepHost.querySelector("fieldset");
      fs.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) {
        root.scrollIntoView({ behavior: R.reducedMotion ? "auto" : "smooth", block: "start" });
      }
    }
  }

  function readField(t) {
    if (!t.name) return;
    if (t.name === "docs") {
      state.docs = Array.prototype.filter.call(form.querySelectorAll('input[name="docs"]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
    } else if (t.name in state) {
      if (t.name === "service" && state.service !== t.value) state.purpose = "";
      state[t.name] = t.value;
    }
    if (t.name === "area") {
      var other = form.querySelector("[data-area-other]");
      if (other) other.hidden = t.value !== ELSEWHERE;
    }
    if (t.name === "method") {
      var p = form.querySelector("[data-phone]"), e = form.querySelector("[data-email]");
      if (p) p.hidden = !(t.value === "Phone call" || t.value === "WhatsApp");
      if (e) e.hidden = t.value !== "Email";
    }
    if (t.type === "radio") {
      var err = document.getElementById(t.name + "-err");
      if (err) err.innerHTML = "";
    }
    if (t.getAttribute("aria-invalid")) R.setError(t, "");
    save();
  }
  form.addEventListener("input", function (e) { readField(e.target); });
  form.addEventListener("change", function (e) { readField(e.target); });

  function showError(res, step) {
    if (!res) return false;
    if (typeof res === "string") res = { radio: step.errTarget, msg: res };
    if (res.field) {
      var f = document.getElementById(res.field);
      R.setError(f, res.msg);
      f.focus();
    } else if (res.radio) {
      var box = document.getElementById(res.radio + "-err");
      box.innerHTML = '<p class="error-msg">' + esc(res.msg) + "</p>";
      var first = form.querySelector('input[name="' + res.radio + '"]');
      if (first) first.focus();
    }
    return true;
  }

  function next() {
    var step = STEPS[current];
    if (showError(step.validate(), step)) return;
    if (current === STEPS.length - 1) return finish();
    if (fromReview) { fromReview = false; current = STEPS.length - 1; }
    else current++;
    render(true);
  }
  function prev() {
    if (current === 0) return;
    fromReview = false;
    current--;
    render(true);
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); next(); });
  prevBtn.addEventListener("click", prev);
  stepHost.addEventListener("click", function (e) {
    var ed = e.target.closest("[data-edit]");
    if (!ed) return;
    current = +ed.getAttribute("data-edit");
    fromReview = true;
    render(true);
  });
  // Enter on a radio/checkbox should not jump ahead unexpectedly in textareas
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "TEXTAREA") e.stopPropagation();
  });

  function finish() {
    var text = R.buildMessage(summaryRows());
    var s = serviceObj();
    form.hidden = true;
    Array.prototype.forEach.call(rail.children, function (li) { li.classList.add("is-done"); li.classList.remove("is-current"); });
    done.hidden = false;
    done.innerHTML =
      '<div class="wiz-done">' +
        '<h2 class="t-l" tabindex="-1" style="margin-bottom:1rem;outline:none">Your enquiry summary is ready</h2>' +
        '<p class="muted">It has <strong>not</strong> been sent. Review it below, then choose how to share it with the office.</p>' +
        '<div data-output></div>' +
        '<div class="btn-row" style="margin-top:1.5rem"><button type="button" class="btn btn-quiet" data-back>Edit answers</button><button type="button" class="btn btn-quiet" data-reset>Start a new enquiry</button></div>' +
      "</div>";
    R.renderOutput(done.querySelector("[data-output]"), text, "Enquiry: " + (s ? s.title : "Website enquiry"));
    done.querySelector("h2").focus();
    done.querySelector("[data-back]").addEventListener("click", function () {
      done.hidden = true; form.hidden = false; root.querySelector(".wiz-progress").hidden = false;
      current = STEPS.length - 1; render(true);
    });
    done.querySelector("[data-reset]").addEventListener("click", function () {
      Object.keys(state).forEach(function (k) { state[k] = Array.isArray(state[k]) ? [] : ""; });
      try { ss && ss.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
      done.hidden = true; form.hidden = false; root.querySelector(".wiz-progress").hidden = false;
      current = 0; fromReview = false; render(true);
    });
  }

  navEl.hidden = false;
  render(false);
})();
