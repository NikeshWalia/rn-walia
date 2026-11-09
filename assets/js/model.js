/* Massing model
   A small orthographic renderer for a card-and-balsa study model. Shadows are
   cast from the sun's current position over Panchkula; visitors can drag to
   turn the model, or use the arrow keys when it has focus. */
(function () {
  "use strict";

  var holders = document.querySelectorAll("[data-model]");
  if (!holders.length) return;

  var LAT = 30.69, LON = 76.86, RAD = Math.PI / 180;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sun position (NOAA approximation) ---------- */
  function sunPosition(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 0);
    var day = Math.floor((date.getTime() - start) / 864e5);
    var hrs = date.getUTCHours() + date.getUTCMinutes() / 60;
    var g = 2 * Math.PI / 365 * (day - 1 + (hrs - 12) / 24);
    var eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var ha = ((hrs * 60 + eqt + 4 * LON) / 4 - 180) * RAD;
    var lat = LAT * RAD;
    var cosZ = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
    var elev = 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / RAD;
    var azS = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) / RAD;
    return { elev: elev, az: (azS + 180 + 360) % 360 }; // azimuth from north, clockwise
  }
  function compass(az) {
    return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(az / 45) % 8];
  }

  /* ---------- Scene (metres; x east, y up, z south) ---------- */
  var MAT = {
    plate: [220, 215, 204], card: [246, 243, 236], slab: [236, 231, 221], dark: [206, 200, 189],
    glass: [160, 170, 175], timber: [216, 196, 160], wall: [238, 234, 225], path: [231, 226, 216]
  };
  function box(x0, x1, y0, y1, z0, z1, mat, face) { return { kind: "box", b: [x0, x1, y0, y1, z0, z1], mat: mat, face: face }; }

  var items = [
    box(-6.4, 4.4, 0, 0.45, -3.9, 3.9, "dark"),
    box(-6, 4, 0.45, 3.6, -3.5, 3.5, "card"),
    box(-7, 5.5, 3.6, 6.9, -4, 3.2, "card"),
    box(-7.4, 5.9, 6.9, 7.25, -4.4, 3.6, "slab"),
    box(1.6, 4.6, 7.25, 9.4, -2.6, 0.6, "card"),
    box(-5.2, -0.6, 0.9, 3.2, 3.5, 3.56, "glass", [0, 0, 1]),
    box(0.6, 1.8, 0.45, 3.0, 3.5, 3.56, "dark", [0, 0, 1]),
    box(0.6, 5.0, 4.2, 6.4, 3.2, 3.26, "glass", [0, 0, 1]),
    box(4, 4.06, 1.0, 3.0, -2.5, 1.5, "glass", [1, 0, 0]),
    box(-7.06, -7, 4.3, 6.2, -3, 1.5, "glass", [-1, 0, 0]),
    box(-1.2, 2.8, 4.4, 6.2, -4.06, -4, "glass", [0, 0, -1]),
    // car porch
    box(4, 9, 3.0, 3.2, -1, 3.4, "slab"),
    box(8.6, 8.85, 0, 3.0, 3.0, 3.25, "card"),
    box(8.6, 8.85, 0, 3.0, -0.9, -0.65, "card")
  ];
  // balsa sun-shading fins on the first floor
  for (var fx = -6.6; fx < -0.7; fx += 0.55) items.push(box(fx, fx + 0.14, 3.7, 6.8, 3.2, 3.75, "timber"));
  // boundary walls, split so painter's ordering stays correct
  items.push(box(-10.6, -2.5, 0, 1.1, 6.6, 6.85, "wall"), box(1.5, 10.6, 0, 1.1, 6.6, 6.85, "wall"));
  items.push(box(-10.6, 10.6, 0, 1.1, -7.6, -7.35, "wall"));
  [[-7.35, -2.5], [-2.5, 2.5], [2.5, 6.6]].forEach(function (s) {
    items.push(box(10.35, 10.6, 0, 1.1, s[0], s[1], "wall"), box(-10.6, -10.35, 0, 1.1, s[0], s[1], "wall"));
  });
  // foam trees on balsa trunks
  [[-8.3, 2.7, 4.2, 1.55], [8.1, 2.5, -5.1, 1.35], [-8.6, 2.2, -5.2, 1.15]].forEach(function (t) {
    items.push(box(t[0] - 0.07, t[0] + 0.07, 0, t[1] - t[3] * 0.5, t[2] - 0.07, t[2] + 0.07, "timber"));
    items.push({ kind: "sphere", c: [t[0], t[1], t[2]], r: t[3], mat: "card" });
  });
  var flats = [[2.2, 5.0, 3.9, 6.6], [-1.0, 2.0, 3.9, 6.6]]; // drive and front path, drawn on the plate
  var PLATE = [-11, 11, -8, 8];

  var FACES = [
    { n: [1, 0, 0], v: [[1, 2, 4], [1, 3, 4], [1, 3, 5], [1, 2, 5]] },
    { n: [-1, 0, 0], v: [[0, 2, 4], [0, 2, 5], [0, 3, 5], [0, 3, 4]] },
    { n: [0, 1, 0], v: [[0, 3, 4], [0, 3, 5], [1, 3, 5], [1, 3, 4]] },
    { n: [0, -1, 0], v: [[0, 2, 4], [1, 2, 4], [1, 2, 5], [0, 2, 5]] },
    { n: [0, 0, 1], v: [[0, 2, 5], [1, 2, 5], [1, 3, 5], [0, 3, 5]] },
    { n: [0, 0, -1], v: [[0, 2, 4], [0, 3, 4], [1, 3, 4], [1, 2, 4]] }
  ];

  function hull(pts) {
    pts.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }

  Array.prototype.forEach.call(holders, function (holder) {
    var canvas = holder.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var fig = holder.closest("figure");
    var readout = fig && fig.querySelector("[data-sun-readout]");
    var hint = fig && fig.querySelector("[data-model-hint]");
    if (hint && window.matchMedia("(pointer: coarse)").matches) hint.textContent = "Drag sideways to rotate";

    var yaw = 32, pitch = 30, w = 0, h = 0, dpr = 1;
    var L = [0, 1, 0], night = false, lowSun = 0;
    var dragging = false, lastX = 0, lastY = 0, idleAt = 0, visible = true, lastT = 0;

    function updateSun() {
      var now = new Date();
      var s = sunPosition(now);
      var elev = s.elev, az = s.az;
      night = elev < 2;
      if (night) { elev = 32; az = 235; }
      var e = elev * RAD, a = az * RAD;
      L = [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
      lowSun = Math.max(0, Math.min(1, (20 - elev) / 18));
      if (readout) {
        var t = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
        readout.innerHTML = night
          ? "<strong>After sunset in Panchkula.</strong> Shown in late afternoon light."
          : "<strong>Shadows for " + t + " in Panchkula.</strong> Sun " + Math.round(s.elev) + "° high, from the " + compass(s.az) + ".";
      }
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = holder.clientWidth; h = holder.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      draw();
    }

    function draw() {
      if (!w || !h) return;
      var cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), cp = Math.cos(pitch * RAD), sp = Math.sin(pitch * RAD);
      var scale = Math.min(w / 28.5, h / (27.5 * sp + 10.5 * cp));
      var ox = w / 2, oy = h * 0.5 + 2.2 * scale * cp;
      function rot(x, z) { return [x * cy - z * sy, x * sy + z * cy]; }
      function P(x, y, z) { var r = rot(x, z); return [ox + r[0] * scale, oy - (y * cp - r[1] * sp) * scale]; }
      function depth(x, y, z) { return rot(x, z)[1] * cp + y * sp; }
      function viewDot(n) { var r = rot(n[0], n[2]); return r[1] * cp + n[1] * sp; }
      function shade(mat, n) {
        var c = MAT[mat], d = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        var k = (night ? 0.7 : 0.66) + 0.34 * d;
        var warm = lowSun * d * 0.08;
        return "rgb(" + Math.min(255, Math.round(c[0] * k * (1 + warm))) + "," + Math.round(c[1] * k) + "," + Math.round(c[2] * k * (1 - warm)) + ")";
      }
      function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";

      // base plate
      var plate = box(PLATE[0], PLATE[1], -0.6, 0, PLATE[2], PLATE[3], "plate");
      drawBox(plate);
      var top = [P(PLATE[0], 0, PLATE[2]), P(PLATE[0], 0, PLATE[3]), P(PLATE[1], 0, PLATE[3]), P(PLATE[1], 0, PLATE[2])];
      ctx.save();
      poly(top); ctx.clip();
      flats.forEach(function (f) { poly([P(f[0], 0, f[2]), P(f[0], 0, f[3]), P(f[1], 0, f[3]), P(f[1], 0, f[2])]); ctx.fillStyle = "rgb(" + MAT.path.join(",") + ")"; ctx.fill(); });

      // cast shadows onto the plate
      ctx.beginPath();
      items.forEach(function (it) {
        var pts = [];
        function cast(x, y, z) { var t = y / L[1]; pts.push(P(x - L[0] * t, 0, z - L[2] * t)); }
        if (it.kind === "box") {
          var b = it.b;
          for (var i = 0; i < 8; i++) cast(b[i & 1], b[2 + ((i >> 1) & 1)], b[4 + ((i >> 2) & 1)]);
        } else {
          for (var k = 0; k < 20; k++) { var a = k / 20 * Math.PI * 2; for (var j = -1; j <= 1; j += 2) cast(it.c[0] + Math.cos(a) * it.r, it.c[1] + j * 0.6 * it.r, it.c[2] + Math.sin(a) * it.r); }
        }
        var hp = hull(pts);
        ctx.moveTo(hp[0][0], hp[0][1]);
        for (var m = 1; m < hp.length; m++) ctx.lineTo(hp[m][0], hp[m][1]);
        ctx.closePath();
      });
      ctx.fillStyle = night ? "rgba(40,36,30,0.14)" : "rgba(52,42,28," + (0.27 - lowSun * 0.06).toFixed(3) + ")";
      ctx.fill("nonzero");
      ctx.restore();

      // model, back to front
      var order = items.map(function (it) {
        var c = it.kind === "box" ? [(it.b[0] + it.b[1]) / 2, (it.b[2] + it.b[3]) / 2, (it.b[4] + it.b[5]) / 2] : it.c;
        return { it: it, d: depth(c[0], c[1], c[2]) };
      }).sort(function (a, b) { return a.d - b.d; });
      order.forEach(function (o) { if (o.it.kind === "box") drawBox(o.it); else drawSphere(o.it); });

      drawNorth();
      drawScaleBar();

      function drawBox(it) {
        if (it.face && viewDot(it.face) <= 0.02) return;
        var b = it.b;
        FACES.forEach(function (f) {
          if (viewDot(f.n) <= 0) return;
          poly(f.v.map(function (v) { return P(b[v[0]], b[v[1]], b[v[2]]); }));
          ctx.fillStyle = shade(it.mat, f.n);
          ctx.fill();
          ctx.strokeStyle = "rgba(36,32,26,0.32)";
          ctx.lineWidth = 0.75;
          ctx.stroke();
        });
      }
      function drawSphere(it) {
        var c = P(it.c[0], it.c[1], it.c[2]), r = it.r * scale;
        var lr = rot(L[0], L[2]);
        var lx = c[0] + lr[0] * r * 0.45, ly = c[1] - (L[1] * cp - lr[1] * sp) * r * 0.45;
        var g = ctx.createRadialGradient(lx, ly, r * 0.1, c[0], c[1], r);
        g.addColorStop(0, "#fbfaf6"); g.addColorStop(0.7, "#e8e3d8"); g.addColorStop(1, "#cfc8ba");
        ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = "rgba(36,32,26,0.22)"; ctx.lineWidth = 0.75; ctx.stroke();
      }
      function drawNorth() {
        var o = P(0, 0, 0), n = P(0, 0, -1);
        var dx = n[0] - o[0], dy = n[1] - o[1], len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;
        var cx = w - 30, cyy = 30, R = 13;
        ctx.save();
        ctx.strokeStyle = "rgba(20,20,20,0.55)"; ctx.fillStyle = "rgba(20,20,20,0.8)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cyy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + dx * R, cyy + dy * R);
        ctx.lineTo(cx - dy * 4.5 - dx * 5, cyy + dx * 4.5 - dy * 5);
        ctx.lineTo(cx + dy * 4.5 - dx * 5, cyy - dx * 4.5 - dy * 5);
        ctx.closePath(); ctx.fill();
        ctx.font = "500 10px Archivo, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("N", cx + dx * (R + 9), cyy + dy * (R + 9));
        ctx.restore();
      }
      function drawScaleBar() {
        var x0 = 16, y0 = h - 18, m = scale;
        ctx.save();
        ctx.strokeStyle = "rgba(20,20,20,0.6)"; ctx.fillStyle = "rgba(20,20,20,0.65)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 10 * m, y0);
        [0, 5, 10].forEach(function (v) { ctx.moveTo(x0 + v * m, y0 - 4); ctx.lineTo(x0 + v * m, y0 + 1); });
        ctx.stroke();
        ctx.fillRect(x0, y0 - 2.5, 5 * m, 2.5);
        ctx.font = "10px Archivo, Arial, sans-serif"; ctx.textBaseline = "bottom";
        ctx.fillText("0", x0 - 2, y0 - 6); ctx.fillText("5", x0 + 5 * m - 3, y0 - 6); ctx.fillText("10 m", x0 + 10 * m - 3, y0 - 6);
        ctx.restore();
      }
    }

    /* ---------- Interaction ---------- */
    holder.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      holder.classList.add("is-dragging");
      if (e.pointerType === "mouse") holder.setPointerCapture(e.pointerId);
    });
    holder.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.45;
      if (e.pointerType === "mouse") pitch = Math.max(16, Math.min(58, pitch + (e.clientY - lastY) * 0.25));
      lastX = e.clientX; lastY = e.clientY;
      idleAt = performance.now();
      draw();
    });
    function end() { dragging = false; holder.classList.remove("is-dragging"); idleAt = performance.now(); }
    holder.addEventListener("pointerup", end);
    holder.addEventListener("pointercancel", end);
    holder.addEventListener("lostpointercapture", end);
    canvas.addEventListener("keydown", function (e) {
      var k = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
      if (!k) return;
      e.preventDefault();
      yaw += k[0]; pitch = Math.max(16, Math.min(58, pitch + k[1]));
      idleAt = performance.now();
      draw();
    });

    /* Slow turntable while idle and on screen */
    function tick(t) {
      var dt = Math.min(64, t - (lastT || t));
      lastT = t;
      if (!dragging && visible && t - idleAt > 3500) { yaw += dt * 0.004; draw(); }
      requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(holder);
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(holder);
    else window.addEventListener("resize", resize);

    updateSun();
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    setInterval(function () { updateSun(); draw(); }, 60000);
    if (!reduced) requestAnimationFrame(tick);
  });
})();
