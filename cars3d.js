/* Street Atlas: original low-poly 3D cars, built from code (no model files, no licences).
   Needs three.js r128. Cars3D.init(THREE) returns an API, or null when WebGL is not available.
   Car axes: length along z (front = +z), width along x, up = y, metres. */
(function (root) {
  'use strict';

  /* Station = [z, halfWidth, yBottom, yTop, squareness]. Squareness 2 = ellipse, 3 = soft box, 5 = boxy. */
  var SPECS = {
    c5: {
      // Long hood, short tail, fastback glass, targa roof panel, round quad tail lights, fixed sloped headlights.
      body: [[-2.28, .50, .52, .78, 3], [-2.20, .78, .38, .90, 3.2], [-1.90, .90, .30, .98, 3.2], [-1.20, .93, .26, .96, 3.2], [-0.60, .90, .26, .90, 3.2],
             [0.30, .90, .26, .84, 3], [1.00, .93, .26, .80, 3], [1.70, .86, .28, .68, 3], [2.10, .74, .30, .56, 3], [2.28, .50, .34, .46, 3]],
      cabin: [[-1.40, .44, .88, .94, 3], [-1.00, .66, .86, 1.10, 3.4], [-0.40, .70, .84, 1.19, 3.4], [0.20, .70, .82, 1.19, 3.4], [0.60, .66, .80, 1.04, 3], [0.98, .60, .80, .86, 3]],
      wheels: { f: 1.43, r: -1.22, rad: .33, w: .28, x: .80 },
      parts: [
        { t: 'b', m: 'dark', s: [1.12, .035, 1.0], p: [0, 1.195, -.18] },
        { t: 'b', m: 'light', s: [.34, .08, .22], p: [.66, .58, 1.86], mir: 1, ry: .35 },
        { t: 'b', m: 'dark', s: [.9, .09, .06], p: [0, .38, 2.26] },
        { t: 'c', m: 'red', r: .1, l: .05, ax: 'z', p: [.28, .66, -2.22], mir: 1 }, { t: 'c', m: 'red', r: .1, l: .05, ax: 'z', p: [.58, .66, -2.19], mir: 1 },
        { t: 'b', m: 'dark', s: [.34, .05, .5], p: [.36, .86, 1.2], mir: 1 },
        { t: 'b', m: 'chrome', s: [.1, .08, .1], p: [.42, .30, -2.22], mir: 1 },
        { t: 'b', m: 'paint', s: [.12, .09, .2], p: [.74, .9, .72], mir: 1 }
      ]
    },
    gt40: {
      // Very low, wide, bubble cabin with door cut-outs into the roof, white stripes, roundel, tall tail.
      body: [[-2.10, .45, .40, .80, 3], [-2.02, .72, .30, .86, 3.2], [-1.60, .86, .26, .92, 3.2], [-1.00, .89, .25, .90, 3.2], [-0.20, .89, .25, .78, 3],
             [0.60, .88, .25, .62, 3], [1.30, .84, .26, .52, 3], [1.80, .72, .28, .44, 3], [2.05, .50, .30, .38, 3], [2.10, .30, .32, .34, 3]],
      cabin: [[-1.00, .50, .80, .88, 3], [-0.60, .70, .78, 1.00, 3.4], [-0.10, .74, .74, 1.03, 3.4], [0.40, .70, .66, 1.00, 3], [0.85, .62, .58, .80, 3], [1.05, .58, .55, .62, 3]],
      stripes: [{ off: 0, w: .13 }, { off: .26, w: .07 }, { off: -.26, w: .07 }],
      wheels: { f: 1.30, r: -1.20, rad: .31, w: .32, x: .80 },
      parts: [
        { t: 'b', m: 'glass', s: [.2, .02, .66], p: [.52, 1.0, -.15], mir: 1, rz: .18 },
        { t: 'c', m: 'white', r: .21, l: .012, ax: 'y', p: [0, .56, 1.12] },
        { t: 'b', m: 'black', s: [.05, .014, .22], p: [0, .57, 1.12] },
        { t: 'b', m: 'light', s: [.26, .05, .16], p: [.58, .40, 2.00], mir: 1 },
        { t: 'b', m: 'red', s: [.36, .06, .05], p: [.5, .7, -2.08], mir: 1 },
        { t: 'b', m: 'dark', s: [.9, .02, .5], p: [0, .915, -1.45] },
        { t: 'b', m: 'chrome', s: [.07, .07, .26], p: [.34, .34, -2.1], mir: 1 }
      ]
    },
    hatch: {
      body: [[-1.85, .70, .35, .85, 4], [-1.75, .80, .30, .95, 4], [-1.20, .82, .30, .95, 4], [0.80, .82, .30, .90, 4], [1.40, .80, .30, .82, 4], [1.80, .70, .32, .68, 4], [1.85, .55, .34, .60, 4]],
      cabin: [[-1.75, .68, .90, 1.20, 4], [-1.65, .74, .90, 1.45, 4.5], [-0.30, .74, .88, 1.52, 4.5], [0.50, .72, .85, 1.42, 4.2], [1.00, .66, .82, .95, 4]],
      wheels: { f: 1.12, r: -1.08, rad: .29, w: .22, x: .72 },
      parts: [
        { t: 'b', m: 'paint', s: [1.2, .03, 1.1], p: [0, 1.52, -.35] },
        { t: 'c', m: 'light', r: .13, l: .04, ax: 'z', p: [.55, .66, 1.84], mir: 1 },
        { t: 'b', m: 'red', s: [.22, .2, .04], p: [.58, .78, -1.86], mir: 1 },
        { t: 'b', m: 'dark', s: [.7, .1, .04], p: [0, .46, 1.86] }
      ]
    },
    pickup: {
      body: [[-2.60, .85, .45, 1.00, 5], [-2.50, .96, .40, 1.05, 5], [-1.00, .97, .40, 1.05, 5], [-0.30, .97, .40, 1.05, 5], [0.20, .97, .40, 1.00, 4],
             [0.90, .97, .40, .98, 4], [1.90, .93, .42, .92, 4], [2.45, .85, .45, .80, 4], [2.60, .70, .50, .74, 4]],
      cabin: [[-0.35, .82, .95, 1.45, 5], [-0.25, .84, .95, 1.80, 5], [0.40, .84, .95, 1.85, 5], [0.90, .80, .90, 1.55, 4], [1.25, .78, .90, 1.00, 4]],
      wheels: { f: 1.65, r: -1.55, rad: .45, w: .3, x: .83 },
      parts: [
        { t: 'b', m: 'dark', s: [1.5, .04, 2.0], p: [0, 1.06, -1.5] },
        { t: 'b', m: 'black', s: [1.5, .03, .05], p: [0, 1.09, -1.0] }, { t: 'b', m: 'black', s: [1.5, .03, .05], p: [0, 1.09, -1.5] }, { t: 'b', m: 'black', s: [1.5, .03, .05], p: [0, 1.09, -2.0] },
        { t: 'b', m: 'chrome', s: [1.8, .12, .1], p: [0, .5, 2.6] },
        { t: 'b', m: 'light', s: [.3, .12, .06], p: [.65, .8, 2.56], mir: 1 },
        { t: 'b', m: 'red', s: [.18, .2, .05], p: [.9, .85, -2.58], mir: 1 },
        { t: 'b', m: 'dark', s: [.8, .22, .04], p: [0, .68, 2.62] }
      ]
    },
    roadster: {
      // Open two-seater with a long hood and swept fenders.
      body: [[-2.00, .50, .45, .85, 3], [-1.90, .72, .35, .95, 3], [-1.30, .80, .32, .95, 3], [-0.70, .78, .32, .80, 3], [-0.20, .74, .32, .72, 3],
             [0.40, .76, .32, .76, 3], [1.00, .82, .32, .88, 3], [1.60, .78, .33, .86, 3], [1.95, .62, .34, .74, 3]],
      cabin: null,
      wheels: { f: 1.20, r: -1.15, rad: .32, w: .24, x: .73 },
      parts: [
        { t: 'b', m: 'dark', s: [1.12, .05, 1.3], p: [0, .76, -.55] },
        { t: 'b', m: 'tan', s: [.4, .08, .5], p: [.3, .8, -.8], mir: 1 },
        { t: 'b', m: 'glass', s: [1.3, .3, .03], p: [0, .92, .2], rx: -.45 },
        { t: 'b', m: 'chrome', s: [.7, .22, .05], p: [0, .62, 1.97] },
        { t: 'c', m: 'chrome', r: .12, l: .07, ax: 'z', p: [.58, .98, 1.5], mir: 1 },
        { t: 'b', m: 'red', s: [.18, .12, .04], p: [.6, .7, -1.98], mir: 1 }
      ]
    },
    muscle: {
      body: [[-2.40, .70, .42, .98, 3.4], [-2.30, .90, .36, 1.05, 3.4], [-1.60, .94, .34, 1.08, 3.4], [-0.80, .94, .34, 1.00, 3.4], [0.00, .94, .34, .98, 3.4],
             [0.90, .94, .34, .96, 3.4], [1.80, .92, .35, .98, 3.4], [2.30, .84, .36, .92, 3.4], [2.40, .70, .40, .86, 3.4]],
      cabin: [[-1.30, .66, .98, 1.15, 3.4], [-0.90, .74, .96, 1.28, 3.6], [-0.20, .76, .95, 1.30, 3.6], [0.40, .72, .95, 1.20, 3.4], [0.75, .66, .95, 1.00, 3.2]],
      stripes: [{ off: .2, w: .08 }, { off: -.2, w: .08 }],
      wheels: { f: 1.45, r: -1.4, rad: .35, w: .3, x: .8 },
      parts: [
        { t: 'b', m: 'dark', s: [.5, .09, .7], p: [0, 1.0, 1.35] },
        { t: 'b', m: 'light', s: [.34, .12, .05], p: [.62, .68, 2.36], mir: 1 },
        { t: 'b', m: 'chrome', s: [1.1, .1, .06], p: [0, .46, 2.4] },
        { t: 'b', m: 'red', s: [.5, .14, .04], p: [.45, .82, -2.32], mir: 1 },
        { t: 'b', m: 'chrome', s: [.09, .07, .24], p: [.5, .38, -2.4], mir: 1 }
      ]
    },
    rally: {
      body: [[-2.00, .72, .38, .90, 4], [-1.90, .86, .32, .98, 4], [-1.20, .90, .30, .98, 4], [1.00, .90, .30, .92, 4], [1.60, .88, .30, .84, 4], [1.95, .70, .33, .70, 4]],
      cabin: [[-1.50, .70, .92, 1.28, 4], [-1.30, .78, .90, 1.45, 4.5], [-0.30, .78, .88, 1.50, 4.5], [0.50, .74, .85, 1.40, 4.2], [0.95, .68, .82, .95, 4]],
      stripes: [{ off: 0, w: .22 }],
      wheels: { f: 1.20, r: -1.15, rad: .33, w: .3, x: .78 },
      parts: [
        { t: 'b', m: 'black', s: [1.7, .05, .4], p: [0, 1.62, -2.05] },
        { t: 'b', m: 'black', s: [.05, .5, .3], p: [.7, 1.34, -2.0], mir: 1 },
        { t: 'b', m: 'dark', s: [.4, .1, .5], p: [0, 1.55, -.2] },
        { t: 'c', m: 'light', r: .09, l: .06, ax: 'z', p: [.15, .95, 1.78], mir: 1 }, { t: 'c', m: 'light', r: .09, l: .06, ax: 'z', p: [.42, .93, 1.74], mir: 1 },
        { t: 'b', m: 'red', s: [.2, .16, .04], p: [.62, .8, -2.0], mir: 1 },
        { t: 'b', m: 'dark', s: [1.2, .12, .05], p: [0, .46, 1.96] }
      ]
    },
    wedge: {
      // Cab-forward wedge: razor nose, tall engine deck, big rear wing.
      body: [[-2.20, .60, .36, .92, 3], [-2.12, .90, .30, 1.00, 3], [-1.50, .98, .26, 1.00, 3], [-0.60, .98, .26, .95, 3], [0.20, .96, .26, .80, 3],
             [1.00, .92, .26, .62, 3], [1.70, .84, .27, .50, 3], [2.10, .62, .29, .42, 3], [2.20, .40, .30, .38, 3]],
      cabin: [[-0.90, .55, .85, .98, 3], [-0.40, .74, .82, 1.08, 3.4], [0.20, .78, .78, 1.08, 3.4], [0.80, .72, .66, .95, 3], [1.30, .62, .55, .66, 3]],
      stripes: [{ off: 0, w: .1 }],
      wheels: { f: 1.35, r: -1.3, rad: .34, w: .36, x: .84 },
      parts: [
        { t: 'b', m: 'black', s: [1.75, .045, .36], p: [0, 1.22, -2.1] },
        { t: 'b', m: 'black', s: [.05, .22, .2], p: [.55, 1.1, -2.05], mir: 1 },
        { t: 'b', m: 'dark', s: [1.1, .02, .12], p: [0, 1.012, -1.8] }, { t: 'b', m: 'dark', s: [1.1, .02, .12], p: [0, 1.012, -1.55] },
        { t: 'b', m: 'dark', s: [1.1, .02, .12], p: [0, 1.012, -1.3] }, { t: 'b', m: 'dark', s: [1.1, .02, .12], p: [0, 1.012, -1.05] },
        { t: 'b', m: 'light', s: [.34, .03, .22], p: [.62, .5, 1.72], mir: 1 },
        { t: 'b', m: 'red', s: [.6, .06, .04], p: [.4, .82, -2.14], mir: 1 },
        { t: 'b', m: 'dark', s: [.12, .24, .6], p: [.97, .5, -.9], mir: 1 }
      ]
    }
  };

  function init(THREE) {
    var glr;
    try {
      var cv = document.createElement('canvas');
      glr = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (e) { return null; }
    if (!glr || !glr.getContext()) return null;
    glr.setPixelRatio(1);

    var matCache = {};
    function mat(name, paint, accent) {
      var key = name + (name === 'paint' ? paint : name === 'accent' ? accent : '');
      if (matCache[key]) return matCache[key];
      var m;
      var P = function (c, sh, sp, em) { return new THREE.MeshPhongMaterial({ color: c, shininess: sh, specular: sp || 0x222222, emissive: em || 0x000000 }); };
      if (name === 'paint') m = P(new THREE.Color(paint), 70, 0x2a2a2a);
      else if (name === 'accent') m = P(new THREE.Color(accent), 60, 0x333333);
      else if (name === 'glass') m = P(0x0e141b, 140, 0xaabbcc);
      else if (name === 'dark') m = P(0x16161a, 20, 0x111111);
      else if (name === 'black') m = P(0x0b0b0d, 30, 0x222222);
      else if (name === 'chrome') m = P(0xd7dbe0, 140, 0xffffff);
      else if (name === 'red') m = P(0xc41414, 60, 0x555555, 0x420000);
      else if (name === 'light') m = P(0xfff1c2, 90, 0xffffff, 0x4a3d10);
      else if (name === 'white') m = P(0xf4f4f0, 50, 0x333333);
      else if (name === 'tan') m = P(0x8a5a2b, 20, 0x111111);
      else if (name === 'tyre') m = P(0x111113, 10, 0x080808);
      else if (name === 'rim') m = P(0xc2c6cc, 120, 0xffffff);
      else m = P(0x888888, 30);
      matCache[key] = m; return m;
    }

    function sgn(v) { return v < 0 ? -1 : 1; }

    // Loft a smooth body through a list of cross-sections.
    function loft(st, material, N) {
      N = N || 36;
      var pos = [], idx = [], i, k;
      for (i = 0; i < st.length; i++) {
        var s = st[i], cy = (s[2] + s[3]) / 2, hh = (s[3] - s[2]) / 2, e = 2 / s[4];
        for (k = 0; k < N; k++) {
          var a = k / N * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
          pos.push((s.cx || 0) + s[1] * sgn(c) * Math.pow(Math.abs(c), e), cy + hh * sgn(sn) * Math.pow(Math.abs(sn), e), s[0]);
        }
      }
      for (i = 0; i < st.length - 1; i++) {
        for (k = 0; k < N; k++) {
          var a0 = i * N + k, b0 = i * N + (k + 1) % N, c0 = (i + 1) * N + k, d0 = (i + 1) * N + (k + 1) % N;
          idx.push(a0, b0, c0, b0, d0, c0);
        }
      }
      var f = st[0], l = st[st.length - 1];
      var ci = pos.length / 3; pos.push(f.cx || 0, (f[2] + f[3]) / 2, f[0]);
      var cj = pos.length / 3; pos.push(l.cx || 0, (l[2] + l[3]) / 2, l[0]);
      for (k = 0; k < N; k++) {
        idx.push(ci, k, (k + 1) % N);
        idx.push(cj, (st.length - 1) * N + (k + 1) % N, (st.length - 1) * N + k);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      return new THREE.Mesh(g, material);
    }

    function luminance(hex) {
      var c = new THREE.Color(hex); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    }

    var shadowTex = null;
    function shadow() {
      if (!shadowTex) {
        var c = document.createElement('canvas'); c.width = c.height = 128;
        var x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 8, 64, 64, 62);
        g.addColorStop(0, 'rgba(0,0,0,.62)'); g.addColorStop(.6, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, 128, 128);
        shadowTex = new THREE.CanvasTexture(c);
      }
      var m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.9), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = .01; return m;
    }

    function build(id, color) {
      var spec = SPECS[id] || SPECS.c5, grp = new THREE.Group();
      var paint = mat('paint', color), accentHex = luminance(color) > .55 ? '#202226' : '#f2f2ee', accent = mat('accent', null, accentHex);
      var parts = [];
      function add(m) { grp.add(m); return m; }
      add(loft(spec.body, paint));
      if (spec.cabin) add(loft(spec.cabin, mat('glass')));
      // Stripes: thin lofts that sit on top of the body and roof.
      (spec.stripes || []).forEach(function (sp) {
        [spec.body, spec.cabin].forEach(function (list) {
          if (!list) return;
          var st = list.map(function (s) { var cy = s[3]; var o = [s[0], sp.w / 2, cy - .04, cy + .006, 6]; o.cx = sp.off; return o; });
          add(loft(st, accent));
        });
      });
      // Wheels
      var w = spec.wheels;
      [[w.f, 1], [w.f, -1], [w.r, 1], [w.r, -1]].forEach(function (a) {
        var tyre = new THREE.Mesh(new THREE.CylinderGeometry(w.rad, w.rad, w.w, 20), mat('tyre'));
        tyre.rotation.z = Math.PI / 2; tyre.position.set(a[1] * w.x, w.rad, a[0]); add(tyre);
        var rim = new THREE.Mesh(new THREE.CylinderGeometry(w.rad * .62, w.rad * .62, w.w + .02, 14), mat('rim'));
        rim.rotation.z = Math.PI / 2; rim.position.copy(tyre.position); add(rim);
      });
      // Details
      spec.parts.forEach(function (p) {
        function one(sx) {
          var geo = p.t === 'c'
            ? new THREE.CylinderGeometry(p.r, p.r, p.l, 16)
            : new THREE.BoxGeometry(p.s[0], p.s[1], p.s[2]);
          var m = new THREE.Mesh(geo, mat(p.m));
          if (p.t === 'c') { if (p.ax === 'z') m.rotation.x = Math.PI / 2; }
          m.position.set(p.p[0] * sx, p.p[1], p.p[2]);
          if (p.rx) m.rotation.x += p.rx;
          if (p.ry) m.rotation.y += p.ry * sx;
          if (p.rz) m.rotation.z += p.rz * sx;
          add(m);
        }
        one(1); if (p.mir) one(-1);
      });
      grp.add(shadow());
      return grp;
    }

    function lights(scene) {
      scene.add(new THREE.HemisphereLight(0xffffff, 0x445066, .75));
      var d = new THREE.DirectionalLight(0xffffff, .8); d.position.set(-3, 6, 4); scene.add(d);
      var d2 = new THREE.DirectionalLight(0xbfd0ff, .35); d2.position.set(4, 3, -4); scene.add(d2);
    }

    function shoot(scene, cam, w, h) {
      glr.setSize(w, h, false); glr.setClearColor(0x000000, 0);
      glr.render(scene, cam);
      return glr.domElement.toDataURL('image/png');
    }

    var cache = {};
    function sprite(id, color) {
      var key = 's|' + id + '|' + color; if (cache[key]) return cache[key];
      var scene = new THREE.Scene(); lights(scene); scene.add(build(id, color));
      var cam = new THREE.OrthographicCamera(-1.4, 1.4, 2.8, -2.8, .1, 30);
      cam.up.set(0, 0, 1); cam.position.set(0, 12, 0); cam.lookAt(0, 0, 0);
      return (cache[key] = shoot(scene, cam, 104, 208));
    }
    function thumb(id, color) {
      var key = 't|' + id + '|' + color; if (cache[key]) return cache[key];
      var scene = new THREE.Scene(); lights(scene); scene.add(build(id, color));
      var cam = new THREE.PerspectiveCamera(21, 1.6, .1, 60);
      cam.position.set(-5.6, 2.8, 6.9); cam.lookAt(0, .55, 0);
      return (cache[key] = shoot(scene, cam, 240, 150));
    }

    // Live turntable for the garage.
    function Showroom(w, h) {
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      var r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      r.setPixelRatio(1); r.setSize(w, h, false); r.setClearColor(0x000000, 0);
      var scene = new THREE.Scene(); lights(scene);
      var cam = new THREE.PerspectiveCamera(26, w / h, .1, 60);
      cam.position.set(0, 2.9, 8.4); cam.lookAt(0, .55, 0);
      var spin = new THREE.Group(); scene.add(spin);
      var cur = null, ang = -.6, raf = 0, last = 0;
      function frame(t) {
        raf = 0;
        if (!cv.isConnected) return;
        if (!document.hidden) {
          var dt = last ? Math.min(.1, (t - last) / 1000) : 0; last = t;
          if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) ang += dt * .6;
          spin.rotation.y = ang; r.render(scene, cam);
        }
        raf = requestAnimationFrame(frame);
      }
      return {
        canvas: cv,
        set: function (id, color) {
          var key = id + '|' + color;
          if (cur === key) return; cur = key;
          while (spin.children.length) spin.remove(spin.children[0]);
          spin.add(build(id, color));
          spin.rotation.y = ang; r.render(scene, cam);
        },
        start: function () { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
        renderOnce: function () { r.render(scene, cam); },
        setAngle: function (a) { ang = a; spin.rotation.y = a; r.render(scene, cam); }
      };
    }

    return { sprite: sprite, thumb: thumb, Showroom: Showroom, ids: Object.keys(SPECS) };
  }

  root.Cars3D = { init: init };
})(typeof window !== 'undefined' ? window : this);
