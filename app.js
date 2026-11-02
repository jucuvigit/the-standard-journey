/* ============================================================
   The Standard Journey — app.js
   Canvas cinematográfico + interactividad + i18n ES/EN
   Sin dependencias externas.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Modelo de datos
     Capacidad útil estimada: 51 kWh (60 kWh brutos, LFP)
     --------------------------------------------------------- */
  const USABLE = 51; // kWh aprovechables
  const DEG_ASYM = 12; // % de pérdida máxima asíntota
  const DEG_TAU = 120000; // km para alcanzar ~63 % de esa pérdida

  // Consumo base (kWh/100 km) según velocidad, sin climatización, 20 °C
  const SPEED_CURVE = [
    [50, 12.0], [80, 14.2], [90, 14.8], [100, 15.3],
    [110, 15.8], [120, 16.4], [130, 18.5], [140, 20.4], [150, 22.6]
  ];

  const HVAC = {
    heat: { power: 2.2, label: "heating" },
    ac: { power: 1.5, label: "ac" },
    seats: { power: 0.2, label: "seats" },
    off: { power: 0, label: "off" }
  };

  const COMPARE = {
    mixed: { standard: 370, lr: 480, perf: 430 },
    city: { standard: 425, lr: 530, perf: 480 },
    highway: { standard: 311, lr: 400, perf: 350 },
    winter: { standard: 280, lr: 330, perf: 300 }
  };

  /* ---------------------------------------------------------
     i18n
     --------------------------------------------------------- */
  const I18N = {
    es: {
      "nav.city": "Ciudad", "nav.highway": "Autopista", "nav.winter": "Invierno",
      "nav.summer": "Verano", "nav.hvac": "Consumos", "nav.degradation": "Batería",
      "nav.planner": "Calculadora", "nav.compare": "Comparativa",

      "hero.eyebrow": "Experiencia interactiva · RWD · LFP 60 kWh",
      "hero.sub": "La autonomía real, contada kilómetro a kilómetro. Conduce, cambia el clima y descubre cuánto gasta de verdad.",
      "hero.begin": "Comenzar el viaje",
      "hero.planner": "Calcular mi ruta",
      "hero.kpi.battery": "Batería LFP",
      "hero.kpi.city": "Autonomía ciudad",
      "hero.kpi.highway": "Autonomía 120 km/h",
      "hero.kpi.charge": "Carga DC máx.",

      "city.eyebrow": "Escena 01 · Urbano",
      "city.title": "Ciudad, día perfecto",
      "city.sub": "20 °C, tráfico fluido, 50 km/h. La frenada regenerativa convierte cada frenazo en kilómetros.",
      "city.cons": "Consumo real", "city.range": "Autonomía", "city.regen": "Recuperación",
      "city.regenUnit": "% energía recuperada",
      "city.note": "En ciudad el Standard brilla: pocas pérdidas aerodinámicas y mucha energía recuperada. Es su terreno natural.",

      "hw.eyebrow": "Escena 02 · Autopista",
      "hw.title": "Aerodinámica al límite",
      "hw.sub": "Mueve el control y observa cómo cambia el consumo en tiempo real.",
      "hw.speedLabel": "Velocidad de crucero", "hw.cons": "Consumo estimado",
      "hw.range": "Autonomía", "hw.time": "Tiempo hasta vacío",
      "hw.note": "Regla rápida: cada 10 km/h por encima de 120 cuesta unos 25 km de autonomía.",

      "winter.eyebrow": "Escena 03 · Invierno",
      "winter.title": "Sierra de Guadarrama, −5 °C",
      "winter.sub": "La bomba de calor es la protagonista. Prueba las dos estrategias y compara.",
      "winter.mode.heat": "Calefacción cabina",
      "winter.mode.seats": "Solo asientos + volante",
      "winter.mode.pre": "Precondicionado enchufado",
      "winter.power": "Potencia de climatización", "winter.range": "Autonomía resultante",
      "winter.loss": "Pérdida vs. sin clima",
      "winter.note": "Los asientos y el volante calefactables consumen ~20 veces menos que calentar todo el habitáculo. Con abrigo, es la jugada maestra.",

      "summer.eyebrow": "Escena 04 · Verano",
      "summer.title": "Costa del Sol, 38 °C",
      "summer.sub": "El aire acondicionado es mucho más barato que la calefacción. Aquí los números lo demuestran.",
      "summer.power": "Potencia A/C", "summer.range": "Autonomía",
      "summer.compare": "Vs. calefacción", "summer.compareUnit": "de gasto",
      "summer.note": "Truco: ventila con las ventanillas 30 segundos antes de arrancar el A/C. El coche se enfría igual y la batería sufre menos.",

      "hvac.eyebrow": "Los números",
      "hvac.title": "Cuánto gasta cada cosa",
      "hvac.sub": "Potencia media, consumo y efecto sobre la autonomía a 120 km/h.",
      "hvac.heating": "Calefacción cabina (bomba de calor)",
      "hvac.ac": "Aire acondicionado",
      "hvac.defrost": "Desempañado máximo",
      "hvac.seats": "2 asientos calefactables",
      "hvac.wheel": "Volante calefactable",
      "hvac.howTitle": "Cómo se calcula",
      "hvac.how": "Consumo extra (kWh/100 km) = potencia (kW) ÷ velocidad (km/h) × 100. Por eso el mismo aparato gasta más en ciudad que en autopista.",
      "hvac.tipTitle": "El truco que más ahorra",
      "hvac.tip": "Precondicionar enchufado 20 minutos antes de salir: la cabina y la batería se calientan con energía de la red, no de la batería. Recuperas 15–25 km de autonomía.",

      "deg.eyebrow": "El tiempo pasa",
      "deg.title": "La vida de la batería LFP",
      "deg.sub": "Arrastra los kilómetros y observa cómo envejece. Garantía Tesla: 70 % a los 8 años o 160.000 km.",
      "deg.kmLabel": "Kilómetros recorridos",
      "deg.health": "Salud", "deg.capacity": "Capacidad",
      "deg.range": "Autonomía mixta", "deg.winter": "Autonomía invierno",

      "plan.eyebrow": "Herramienta",
      "plan.title": "Calculadora de viaje",
      "plan.sub": "Introduce distancia y condiciones. Te digo consumo, paradas y tiempo total.",
      "plan.distance": "Distancia del viaje (km)",
      "plan.temp": "Temperatura (°C)",
      "plan.speed": "Velocidad media (km/h)",
      "plan.climate": "Climatización",
      "plan.climate.off": "Apagada", "plan.climate.ac": "Aire acondicionado",
      "plan.climate.heat": "Calefacción", "plan.climate.seats": "Asientos + volante",
      "plan.wheels": "Llantas", "plan.wheels.18": "18″ Aero", "plan.wheels.19": "19″",
      "plan.soc": "Carga inicial (%)", "plan.carKm": "Km del coche",
      "plan.calc": "Calcular",
      "plan.empty": "Rellena los datos y pulsa «Calcular».",
      "plan.r.cons": "Consumo estimado", "plan.r.range": "Autonomía con tu carga",
      "plan.r.stops": "Paradas de carga", "plan.r.charge": "Tiempo cargando",
      "plan.r.time": "Tiempo total", "plan.r.needed": "Energía necesaria",
      "plan.ok": "Llegas sin parar. Buen viaje.",
      "plan.warn": "Necesitas parar a cargar. Planifica con margen.",
      "plan.impossible": "Ese trayecto no es viable ni con paradas: divide el viaje.",

      "cmp.eyebrow": "Tres caminos",
      "cmp.title": "Standard, Long Range y Performance",
      "cmp.mode.mixed": "Mixto", "cmp.mode.city": "Ciudad",
      "cmp.mode.highway": "Autopista", "cmp.mode.winter": "Invierno",
      "cmp.tag.value": "Mejor valor",
      "cmp.std": "Standard RWD", "cmp.lr": "Long Range AWD", "cmp.perf": "Performance AWD",
      "cmp.battery": "Batería", "cmp.power": "Potencia", "cmp.accel": "0–100", "cmp.charge": "Carga DC",
      "cmp.note": "Estimaciones propias a partir de consumos reales publicados. El NMC aguanta mejor el frío; el LFP envejece más despacio y admite carga al 100 % a diario.",

      "footer.copy": "Proyecto divulgativo no oficial. Datos de EVKX, AutoEdgeView, Go-Electra, Tesla y foros de usuarios."
    },

    en: {
      "nav.city": "City", "nav.highway": "Highway", "nav.winter": "Winter",
      "nav.summer": "Summer", "nav.hvac": "Consumption", "nav.degradation": "Battery",
      "nav.planner": "Calculator", "nav.compare": "Compare",

      "hero.eyebrow": "Interactive experience · RWD · LFP 60 kWh",
      "hero.sub": "Real-world range, told kilometre by kilometre. Drive, change the weather and see what it really costs.",
      "hero.begin": "Start the journey",
      "hero.planner": "Plan my trip",
      "hero.kpi.battery": "LFP battery",
      "hero.kpi.city": "City range",
      "hero.kpi.highway": "Range at 120 km/h",
      "hero.kpi.charge": "Max DC charge",

      "city.eyebrow": "Scene 01 · Urban",
      "city.title": "City, perfect day",
      "city.sub": "20 °C, light traffic, 50 km/h. Regenerative braking turns every stop into kilometres.",
      "city.cons": "Real consumption", "city.range": "Range", "city.regen": "Recovery",
      "city.regenUnit": "% energy recovered",
      "city.note": "The city is where the Standard shines: low aero losses and plenty of recovered energy. Its natural habitat.",

      "hw.eyebrow": "Scene 02 · Highway",
      "hw.title": "Aerodynamics at the limit",
      "hw.sub": "Move the slider and watch consumption change in real time.",
      "hw.speedLabel": "Cruise speed", "hw.cons": "Estimated consumption",
      "hw.range": "Range", "hw.time": "Time to empty",
      "hw.note": "Quick rule: every 10 km/h above 120 costs about 25 km of range.",

      "winter.eyebrow": "Scene 03 · Winter",
      "winter.title": "Guadarrama, −5 °C",
      "winter.sub": "The heat pump is the star. Try both strategies and compare.",
      "winter.mode.heat": "Cabin heating",
      "winter.mode.seats": "Seats + wheel only",
      "winter.mode.pre": "Preconditioned while plugged in",
      "winter.power": "Climate power", "winter.range": "Resulting range",
      "winter.loss": "Loss vs. no climate",
      "winter.note": "Heated seats and steering wheel use ~20× less than heating the whole cabin. With a coat, it's the master move.",

      "summer.eyebrow": "Scene 04 · Summer",
      "summer.title": "Costa del Sol, 38 °C",
      "summer.sub": "Air conditioning is far cheaper than heating. The numbers prove it.",
      "summer.power": "A/C power", "summer.range": "Range",
      "summer.compare": "Vs. heating", "summer.compareUnit": "of draw",
      "summer.note": "Trick: vent with the windows for 30 seconds before starting the A/C. Same comfort, less battery strain.",

      "hvac.eyebrow": "The numbers",
      "hvac.title": "What each system costs",
      "hvac.sub": "Average power, consumption and range impact at 120 km/h.",
      "hvac.heating": "Cabin heating (heat pump)",
      "hvac.ac": "Air conditioning",
      "hvac.defrost": "Max defrost",
      "hvac.seats": "2 heated seats",
      "hvac.wheel": "Heated steering wheel",
      "hvac.howTitle": "How it's calculated",
      "hvac.how": "Extra consumption (kWh/100 km) = power (kW) ÷ speed (km/h) × 100. That's why the same device costs more in the city than on the highway.",
      "hvac.tipTitle": "The biggest saver",
      "hvac.tip": "Precondition for 20 minutes while plugged in: cabin and battery warm up on grid power, not battery power. You get 15–25 km back.",

      "deg.eyebrow": "Time passes",
      "deg.title": "The life of the LFP battery",
      "deg.sub": "Drag the kilometres and watch it age. Tesla warranty: 70 % at 8 years or 160,000 km.",
      "deg.kmLabel": "Kilometres driven",
      "deg.health": "Health", "deg.capacity": "Capacity",
      "deg.range": "Mixed range", "deg.winter": "Winter range",

      "plan.eyebrow": "Tool",
      "plan.title": "Trip calculator",
      "plan.sub": "Enter distance and conditions. I'll give you consumption, stops and total time.",
      "plan.distance": "Trip distance (km)",
      "plan.temp": "Temperature (°C)",
      "plan.speed": "Average speed (km/h)",
      "plan.climate": "Climate control",
      "plan.climate.off": "Off", "plan.climate.ac": "Air conditioning",
      "plan.climate.heat": "Heating", "plan.climate.seats": "Seats + wheel",
      "plan.wheels": "Wheels", "plan.wheels.18": "18″ Aero", "plan.wheels.19": "19″",
      "plan.soc": "Starting charge (%)", "plan.carKm": "Car kilometres",
      "plan.calc": "Calculate",
      "plan.empty": "Fill in the data and press “Calculate”.",
      "plan.r.cons": "Estimated consumption", "plan.r.range": "Range with your charge",
      "plan.r.stops": "Charging stops", "plan.r.charge": "Charging time",
      "plan.r.time": "Total time", "plan.r.needed": "Energy needed",
      "plan.ok": "You arrive without stopping. Have a good trip.",
      "plan.warn": "You'll need to charge. Plan with margin.",
      "plan.impossible": "That trip isn't viable even with stops: split it up.",

      "cmp.eyebrow": "Three paths",
      "cmp.title": "Standard, Long Range and Performance",
      "cmp.mode.mixed": "Mixed", "cmp.mode.city": "City",
      "cmp.mode.highway": "Highway", "cmp.mode.winter": "Winter",
      "cmp.tag.value": "Best value",
      "cmp.std": "Standard RWD", "cmp.lr": "Long Range AWD", "cmp.perf": "Performance AWD",
      "cmp.battery": "Battery", "cmp.power": "Power", "cmp.accel": "0–100", "cmp.charge": "DC charge",
      "cmp.note": "Own estimates based on published real-world consumption. NMC handles cold better; LFP ages slower and takes a daily 100 % charge.",

      "footer.copy": "Unofficial educational project. Data from EVKX, AutoEdgeView, Go-Electra, Tesla and user forums."
    }
  };

  let lang = "es";

  const nf = (n, dec) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
  }).format(n);

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    $$("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = I18N[lang][key];
      if (typeof val === "string") el.textContent = val;
    });
    const btn = $("#langBtn");
    if (btn) $("[data-lang-label]", btn).textContent = next === "es" ? "ES" : "EN";

    // reformatear contadores ya animados al idioma nuevo
    $$("[data-count]").forEach(function (el) {
      if (el.dataset && el.dataset.done) {
        const v = parseFloat(el.getAttribute("data-count"));
        const d = parseInt(el.getAttribute("data-decimals") || "0", 10);
        if (!isNaN(v)) el.textContent = nf(v, d);
      }
    });

    renderHighway();
    renderWinter(currentWinter);
    renderDegradation();
    renderCompare(currentMode);
    if (lastPlan) renderPlan(lastPlan);
  }

  /* ---------------------------------------------------------
     Utilidades numéricas
     --------------------------------------------------------- */
  function consumeAt(speed) {
    const c = SPEED_CURVE;
    if (speed <= c[0][0]) return c[0][1];
    if (speed >= c[c.length - 1][0]) return c[c.length - 1][1];
    for (let i = 1; i < c.length; i++) {
      if (speed <= c[i][0]) {
        const t = (speed - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
        return c[i - 1][1] + t * (c[i][1] - c[i - 1][1]);
      }
    }
    return c[c.length - 1][1];
  }

  const rangeFrom = (cons, kwh) => (kwh / cons) * 100;

  function healthAt(km) {
    return 100 - DEG_ASYM * (1 - Math.exp(-km / DEG_TAU));
  }

  function climateExtra(mode, speedKph) {
    const p = (HVAC[mode] || HVAC.off).power;
    return (p / Math.max(speedKph, 30)) * 100;
  }

  /* ---------------------------------------------------------
     Contadores animados
     --------------------------------------------------------- */
  const counted = new WeakSet();
  function animateCount(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const target = parseFloat(el.getAttribute("data-count"));
    const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;
    const dur = 1100;
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = nf(target * eased, dec);
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = nf(target, dec); el.dataset.done = "1"; }
    })(t0);
  }

  /* ---------------------------------------------------------
     Canvas: escena de carretera en perspectiva
     --------------------------------------------------------- */
  const scenes = [];

  function makeScene(canvas, cfg) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const scene = {
      canvas: canvas, ctx: ctx, cfg: cfg,
      visible: false, w: 0, h: 0, dpr: 1,
      speed: cfg.speed || 120,
      t: 0, last: 0,
      dashes: [], chevrons: [], particles: [], buildings: [],
      raf: null
    };
    resizeScene(scene);
    return scene;
  }

  function resizeScene(s) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = s.canvas.getBoundingClientRect();
    s.dpr = dpr;
    s.w = Math.max(rect.width, 320);
    s.h = Math.max(rect.height, 320);
    s.canvas.width = Math.round(s.w * dpr);
    s.canvas.height = Math.round(s.h * dpr);
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildProps(s);
  }

  function buildProps(s) {
    const w = s.w, h = s.h;
    s.dashes = [];
    for (let i = 0; i < 26; i++) s.dashes.push({ z: 1 + i * 1.55 });
    s.chevrons = [];
    for (let i = 0; i < 12; i++) s.chevrons.push({ z: 1.2 + i * 3.1 });
    s.particles = [];
    const pcount = s.cfg.mode === "snow" ? 130 : s.cfg.mode === "heat" ? 60 : 0;
    for (let i = 0; i < pcount; i++) {
      s.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 24,
        vy: 26 + Math.random() * 70,
        a: 0.25 + Math.random() * 0.6
      });
    }
    s.buildings = [];
    if (s.cfg.skyline) {
      let x = -60;
      while (x < w + 120) {
        const bw = 26 + Math.random() * 62;
        const bh = h * (0.05 + Math.random() * 0.16);
        s.buildings.push({ x: x, w: bw, h: bh, lit: Math.random() });
        x += bw + 6 + Math.random() * 18;
      }
    }
  }

  const PALETTE = {
    night: {
      skyTop: "#080a10", skyBot: "#131a29", road: "#14161d", roadEdge: "#22262f",
      line: "#d8dbe2", glow: "#e31937", mountain: "#0d121c", hud: "rgba(255,255,255,.55)"
    },
    city: {
      skyTop: "#0a0d16", skyBot: "#1d2436", road: "#15171e", roadEdge: "#242832",
      line: "#d8dbe2", glow: "#ff6a3d", mountain: "#111725", hud: "rgba(255,255,255,.55)"
    },
    snow: {
      skyTop: "#0b1220", skyBot: "#2a3a52", road: "#1b1f28", roadEdge: "#2b3240",
      line: "#eef2f8", glow: "#7fd4ff", mountain: "#20304a", hud: "rgba(255,255,255,.7)"
    },
    heat: {
      skyTop: "#1a0d08", skyBot: "#48210f", road: "#191519", roadEdge: "#2c2429",
      line: "#ffe3bd", glow: "#ff8a3d", mountain: "#3a1d10", hud: "rgba(255,255,255,.7)"
    }
  };

  function drawScene(s, dt) {
    const ctx = s.ctx, w = s.w, h = s.h;
    const cfg = s.cfg;
    const pal = PALETTE[cfg.mode] || PALETTE.night;
    const horizon = h * (cfg.horizon || 0.52);
    s.t += dt;

    // movimiento de props
    const flow = (s.speed / 3.6) * dt * (cfg.scale || 1);
    s.dashes.forEach(function (d) {
      d.z -= flow * 0.55;
      if (d.z < 0.7) d.z += 26 * 1.55;
    });
    s.chevrons.forEach(function (c) {
      c.z -= flow * 0.55;
      if (c.z < 0.9) c.z += 12 * 3.1;
    });

    // cielo
    const sky = ctx.createLinearGradient(0, 0, 0, horizon * 1.15);
    sky.addColorStop(0, pal.skyTop);
    sky.addColorStop(1, pal.skyBot);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon * 1.15);

    // sol / luna / resplandor
    const glowX = w * (cfg.glowX || 0.5);
    const glowY = horizon * (cfg.glowY || 0.72);
    const rg = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(w, h) * 0.42);
    rg.addColorStop(0, cfg.mode === "heat" ? "rgba(255,150,70,.38)" : cfg.mode === "snow" ? "rgba(130,200,255,.22)" : "rgba(227,25,55,.22)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, horizon * 1.4);

    // montañas / skyline
    if (cfg.skyline) {
      ctx.fillStyle = cfg.mode === "heat" ? "#2a1409" : "#0d121c";
      s.buildings.forEach(function (b) {
        ctx.fillRect(b.x, horizon - b.h, b.w, b.h);
        if (b.lit > 0.55) {
          ctx.fillStyle = cfg.mode === "heat" ? "rgba(255,190,120,.20)" : "rgba(150,190,255,.16)";
          for (let wy = horizon - b.h + 8; wy < horizon - 6; wy += 12) {
            for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 10) {
              if ((wx * 7 + wy * 13) % 5 === 0) ctx.fillRect(wx, wy, 4, 5);
            }
          }
          ctx.fillStyle = cfg.mode === "heat" ? "#2a1409" : "#0d121c";
        }
      });
    } else {
      // cordillera
      ctx.fillStyle = pal.mountain;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      const peaks = 7;
      for (let i = 0; i <= peaks; i++) {
        const px = (w / peaks) * i;
        const py = horizon - (i % 2 === 0 ? h * 0.10 : h * 0.055) * (0.7 + ((i * 37) % 10) / 18);
        ctx.lineTo(px, py);
        ctx.lineTo(px + w / peaks / 2, horizon - h * 0.02);
      }
      ctx.lineTo(w, horizon);
      ctx.closePath();
      ctx.fill();
    }

    // suelo
    ctx.fillStyle = pal.road;
    ctx.fillRect(0, horizon, w, h - horizon);

    // carretera en perspectiva
    const bottomW = w * 0.95;
    const topW = w * 0.045;
    const cx = w * (cfg.roadX || 0.5);
    const yBottom = h + 10;
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, horizon);
    ctx.lineTo(cx + topW / 2, horizon);
    ctx.lineTo(cx + bottomW / 2, yBottom);
    ctx.lineTo(cx - bottomW / 2, yBottom);
    ctx.closePath();
    const roadGrad = ctx.createLinearGradient(0, horizon, 0, h);
    roadGrad.addColorStop(0, pal.road);
    roadGrad.addColorStop(1, cfg.mode === "snow" ? "#242a35" : "#101218");
    ctx.fillStyle = roadGrad;
    ctx.fill();

    // bordes
    ctx.strokeStyle = pal.roadEdge;
    ctx.lineWidth = Math.max(1, w * 0.004);
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, horizon); ctx.lineTo(cx - bottomW / 2, yBottom);
    ctx.moveTo(cx + topW / 2, horizon); ctx.lineTo(cx + bottomW / 2, yBottom);
    ctx.stroke();

    // líneas discontinuas
    s.dashes.forEach(function (d) {
      const p = 1 / d.z;
      const y = horizon + (yBottom - horizon) * p;
      const halfW = (bottomW / 2) * p;
      const lw = Math.max(1.1, 10 * p);
      const len = Math.max(4, 60 * p);
      const alpha = Math.min(1, p * 3.4);
      if (y > h + 20) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pal.line;
      ctx.fillRect(cx - lw / 2, y - len, lw, len);
      ctx.globalAlpha = 1;
    });

    // flechas laterales
    s.chevrons.forEach(function (c) {
      const p = 1 / (c.z * 0.9);
      const y = horizon + (yBottom - horizon) * p;
      const halfW = (bottomW / 2) * p;
      const size = Math.max(5, 58 * p);
      if (y > h + 30) return;
      ctx.globalAlpha = Math.min(0.85, p * 2.6);
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = Math.max(1.2, size * 0.14);
      [-1, 1].forEach(function (side) {
        const x = cx + side * (halfW + size * 0.55);
        ctx.beginPath();
        ctx.moveTo(x - side * size * 0.34, y - size * 0.5);
        ctx.lineTo(x + side * size * 0.18, y);
        ctx.lineTo(x - side * size * 0.34, y + size * 0.5);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    });

    // partículas
    if (cfg.mode === "snow" || cfg.mode === "heat") {
      s.particles.forEach(function (p) {
        p.x += p.vx * dt;
        p.y += p.vy * dt * (cfg.mode === "heat" ? -0.55 : 1);
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = cfg.mode === "snow" ? "#ffffff" : "#ffb066";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // coche
    drawCar(ctx, s, cx, h, dt);

    // viñeta
    const vg = ctx.createRadialGradient(cx, h * 0.55, h * 0.2, cx, h * 0.55, h * 0.95);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  function drawCar(ctx, s, cx, h, dt) {
    if (s.cfg.hideCarOnNarrow && s.w < 760) return;
    const carW = Math.min(s.w * (s.cfg.carScale || 0.42), 430);
    const carH = carW * 0.46;
    const x = s.w * (s.cfg.carX || 0.5);
    const y = h - carH * 0.34 + Math.sin(s.t * 2.4) * Math.min(2.2, s.speed / 90);
    const bodyTop = y - carH;
    const pal = s.cfg.carColor || "#171a22";

    ctx.save();

    // sombra
    const sh = ctx.createRadialGradient(x, y + 10, 6, x, y + 10, carW * 0.55);
    sh.addColorStop(0, "rgba(0,0,0,.55)");
    sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, carW * 0.55, carH * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();

    // carrocería (vista trasera)
    const r = carW * 0.10;
    ctx.fillStyle = pal;
    roundRect(ctx, x - carW / 2, bodyTop + carH * 0.28, carW, carH * 0.72, r);
    ctx.fill();

    // techo / luna
    const gl = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + carH * 0.34);
    gl.addColorStop(0, s.cfg.mode === "heat" ? "#2b1a12" : "#0f1622");
    gl.addColorStop(1, s.cfg.mode === "heat" ? "#3d2a1c" : "#1b2433");
    ctx.fillStyle = gl;
    roundRect(ctx, x - carW * 0.34, bodyTop + carH * 0.06, carW * 0.68, carH * 0.26, r * 0.7);
    ctx.fill();

    // franja roja (modelo)
    ctx.fillStyle = "#e31937";
    ctx.fillRect(x - carW / 2 + 4, bodyTop + carH * 0.40, carW - 8, Math.max(2, carH * 0.022));

    // pilotos traseros
    const lightW = carW * 0.20;
    const lightH = Math.max(4, carH * 0.055);
    const ly = bodyTop + carH * 0.52;
    [-1, 1].forEach(function (side) {
      const lx = x + side * (carW * 0.345) - lightW / 2;
      const lg = ctx.createLinearGradient(lx, ly, lx + lightW, ly);
      lg.addColorStop(0, "#ff2a44");
      lg.addColorStop(1, "#8d0b1c");
      ctx.fillStyle = lg;
      roundRect(ctx, lx, ly, lightW, lightH, lightH / 2);
      ctx.fill();
      // glow
      const gg = ctx.createRadialGradient(lx + lightW / 2, ly + lightH / 2, 0, lx + lightW / 2, ly + lightH / 2, carW * 0.22);
      gg.addColorStop(0, "rgba(255,40,70,.45)");
      gg.addColorStop(1, "rgba(255,40,70,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(lx - carW * 0.2, ly - carH * 0.12, carW * 0.5, carH * 0.3);
    });

    // matrícula
    ctx.fillStyle = "rgba(255,255,255,.12)";
    roundRect(ctx, x - carW * 0.09, bodyTop + carH * 0.68, carW * 0.18, carH * 0.075, 3);
    ctx.fill();

    // ruedas (asoma)
    ctx.fillStyle = "#07080b";
    [-1, 1].forEach(function (side) {
      ctx.fillRect(x + side * carW * 0.40 - carW * 0.05, y - carH * 0.06, carW * 0.10, carH * 0.16);
    });

    // estela de velocidad
    const speedNorm = Math.min(s.speed / 150, 1);
    if (speedNorm > 0.35) {
      ctx.strokeStyle = "rgba(255,255,255," + (0.05 + speedNorm * 0.12) + ")";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 14; i++) {
        const sx = x + (Math.random() - 0.5) * carW * 1.5;
        const sy = y + (Math.random() - 0.5) * carH * 0.5;
        const len = 20 + Math.random() * 70 * speedNorm;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + len);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /* ---------------------------------------------------------
     Bucle de animación
     --------------------------------------------------------- */
  let lastFrame = 0;
  function loop(now) {
    const dt = Math.min((now - lastFrame) / 1000 || 0, 0.05);
    lastFrame = now;
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (s.visible) drawScene(s, dt);
    }
    requestAnimationFrame(loop);
  }

  function registerScene(scene) {
    if (!scene) return;
    scenes.push(scene);
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        scene.visible = e.isIntersecting;
      });
    }, { threshold: 0.02 });
    io.observe(scene.canvas);
  }

  /* ---------------------------------------------------------
     Interacciones
     --------------------------------------------------------- */
  let currentWinter = "heat";
  let currentMode = "mixed";
  let lastPlan = null;

  function renderHighway() {
    const input = $("#speed");
    if (!input) return;
    const v = parseInt(input.value, 10);
    const cons = consumeAt(v);
    const range = rangeFrom(cons, USABLE);
    const hours = range / v;

    $("#speedOut").textContent = v + " km/h";
    $("#hwCons").textContent = nf(cons, 1);
    $("#hwRange").textContent = nf(Math.round(range), 0);
    $("#hwTime").textContent = nf(hours, 1);
    const hw = scenes.filter(function (s) { return s.canvas && s.canvas.id === "cv-highway"; })[0];
    if (hw) hw.speed = v;
  }

  function renderWinter(mode) {
    currentWinter = mode;
    const speed = 120;
    const coldPenalty = 1.12; // batería fría
    const base = consumeAt(speed) * coldPenalty;
    const noClimate = rangeFrom(base, USABLE);

    let cons, power;
    if (mode === "heat") {
      power = HVAC.heat.power;
      cons = base + climateExtra("heat", speed);
    } else if (mode === "seats") {
      power = HVAC.seats.power;
      cons = base + climateExtra("seats", speed);
    } else { // preconditioned
      power = HVAC.heat.power;
      cons = consumeAt(speed) + climateExtra("heat", speed); // batería ya a temperatura
    }
    const range = rangeFrom(cons, USABLE);
    const loss = Math.max(0, Math.round(noClimate - range));

    $("#wPower").textContent = nf(power, 2);
    $("#wRange").textContent = nf(Math.round(range), 0);
    $("#wLoss").textContent = nf(loss, 0);
  }

  function renderDegradation() {
    const input = $("#km");
    if (!input) return;
    const km = parseInt(input.value, 10);
    const health = healthAt(km);
    const cap = USABLE * health / 100;

    $("#kmOut").textContent = nf(km, 0) + " km";
    $("#degHealth").textContent = nf(health, 1);
    $("#degCap").textContent = nf(cap, 1);
    $("#degRange").textContent = nf(Math.round(425 * health / 100), 0);
    $("#degWinter").textContent = nf(Math.round(280 * health / 100), 0);
    $("#battPct").textContent = nf(health, 0) + " %";

    const cellsEl = $("#cells");
    if (cellsEl && !cellsEl.childElementCount) {
      for (let i = 0; i < 24; i++) cellsEl.appendChild(document.createElement("i"));
    }
    if (cellsEl) {
      const on = Math.round(24 * health / 100);
      Array.prototype.forEach.call(cellsEl.children, function (cell, i) {
        cell.className = i < on ? (health < 75 ? "warn" : "on") : (health < 60 ? "bad" : "");
      });
    }
  }

  function renderCompare(mode) {
    currentMode = mode;
    const data = COMPARE[mode];
    $$("[data-cmp]").forEach(function (el) {
      const key = el.getAttribute("data-cmp");
      el.textContent = nf(data[key], 0);
    });
  }

  function renderPlan(plan) {
    const out = $("#planResult");
    if (!out) return;
    const rows = [
      ["plan.r.cons", nf(plan.cons, 1) + " kWh/100 km"],
      ["plan.r.range", nf(Math.round(plan.range), 0) + " km"],
      ["plan.r.needed", nf(plan.energy, 1) + " kWh"],
      ["plan.r.stops", nf(plan.stops, 0)],
      ["plan.r.charge", nf(Math.round(plan.chargeMin), 0) + " min"],
      ["plan.r.time", nf(plan.totalH, 1) + " h"]
    ];

    let html = '<p class="result__big">' + nf(Math.round(plan.range), 0) + " km</p>";
    html += '<p class="result__hint">' + I18N[lang]["plan.r.range"] + "</p>";
    html += "<dl style='margin:16px 0 0'>";
    rows.forEach(function (r) {
      html += '<div class="result__row"><dt>' + I18N[lang][r[0]] + "</dt><dd>" + r[1] + "</dd></div>";
    });
    html += "</dl>";
    html += '<p class="' + (plan.feasible ? "result__ok" : "result__warn") + '">' +
      I18N[lang][plan.feasible ? "plan.ok" : "plan.warn"] + "</p>";
    out.innerHTML = html;
  }

  function calcPlan(e) {
    if (e) e.preventDefault();
    const dist = parseFloat($("#dist").value) || 0;
    const temp = parseFloat($("#temp").value) || 20;
    const avg = parseFloat($("#avgSpeed").value) || 110;
    const climate = $("#climate").value;
    const wheels = $("#wheels").value;
    const soc = Math.min(Math.max(parseFloat($("#soc").value) || 90, 5), 100);
    const carKm = parseFloat($("#carKm").value) || 0;

    const health = healthAt(carKm) / 100;
    const usable = USABLE * health;

    let cons = consumeAt(avg) + climateExtra(climate, avg);

    // temperatura
    if (temp < 10) cons *= 1 + Math.min(0.22, (10 - temp) * 0.012);
    if (temp > 28) cons *= 1 + Math.min(0.10, (temp - 28) * 0.006);

    // llantas
    if (wheels === "19") cons *= 1.055;

    const range = rangeFrom(cons, usable);
    const available = range * (soc / 100);
    const energy = dist * cons / 100;

    let stops = 0, chargeMin = 0, feasible = true;
    if (dist > available) {
      const legMax = range * 0.78; // margen de seguridad
      let remaining = dist - available;
      if (legMax <= 5 || available < 20) {
        feasible = false;
      } else {
        stops = Math.ceil(remaining / legMax);
        chargeMin = stops * 25; // 10→80 % en ~25 min a 170 kW
        if (stops > 12) feasible = false;
      }
    }

    const totalH = (dist / avg) + chargeMin / 60;
    lastPlan = {
      cons: cons, range: range, energy: energy, stops: stops,
      chargeMin: chargeMin, totalH: totalH, feasible: feasible
    };
    renderPlan(lastPlan);
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  function initReveal() {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          $$("[data-count]", e.target).forEach(animateCount);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16 });

    $$(".reveal").forEach(function (el) { io.observe(el); });
    // contadores del hero inmediatos
    $$("#hero [data-count]").forEach(animateCount);
  }

  /* ---------------------------------------------------------
     Scroll: progreso + nav activa
     --------------------------------------------------------- */
  function initScrollUi() {
    const bar = $("#progress span");
    const links = $$(".nav__links a");
    const sections = $$("main section[id]");

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = p + "%";

      let activeId = sections.length ? sections[0].id : "";
      const y = window.scrollY + window.innerHeight * 0.35;
      sections.forEach(function (s) {
        if (s.offsetTop <= y) activeId = s.id;
      });
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + activeId);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      scenes.forEach(resizeScene);
      onScroll();
    });
    onScroll();
  }

  /* ---------------------------------------------------------
     Barras de consumo
     --------------------------------------------------------- */
  function initBars() {
    const bars = $$("#hvacBars .bar");
    if (!bars.length) return;
    const maxKw = Math.max.apply(null, bars.map(function (b) { return parseFloat(b.getAttribute("data-kw")); }));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        bars.forEach(function (b) {
          const kw = parseFloat(b.getAttribute("data-kw"));
          const pct = Math.max(2.5, (kw / maxKw) * 100);
          const fill = $(".bar__fill", b);
          if (fill) fill.style.width = pct + "%";
        });
        io.disconnect();
      });
    }, { threshold: 0.3 });
    io.observe($("#hvacBars"));
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    // i18n
    const langBtn = $("#langBtn");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        applyLang(lang === "es" ? "en" : "es");
      });
    }

    // escenas canvas
    registerScene(makeScene($("#cv-hero"), {
      mode: "night", speed: 110, skyline: true, glowX: 0.72, glowY: 0.78, horizon: 0.58,
      roadX: 0.72, carX: 0.72, carScale: 0.34, hideCarOnNarrow: true
    }));
    registerScene(makeScene($("#cv-city"), {
      mode: "city", speed: 50, skyline: true, glowX: 0.72, glowY: 0.66, horizon: 0.54
    }));
    registerScene(makeScene($("#cv-highway"), {
      mode: "night", speed: 120, skyline: false, glowX: 0.5, glowY: 0.7, horizon: 0.5
    }));
    registerScene(makeScene($("#cv-winter"), {
      mode: "snow", speed: 100, skyline: false, glowX: 0.35, glowY: 0.64, horizon: 0.5
    }));
    registerScene(makeScene($("#cv-summer"), {
      mode: "heat", speed: 105, skyline: true, glowX: 0.6, glowY: 0.62, horizon: 0.54
    }));

    // controles
    const speed = $("#speed");
    if (speed) speed.addEventListener("input", renderHighway);

    const km = $("#km");
    if (km) km.addEventListener("input", renderDegradation);

    $$("[data-winter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("[data-winter]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        renderWinter(btn.getAttribute("data-winter"));
      });
    });

    $$("[data-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("[data-mode]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        renderCompare(btn.getAttribute("data-mode"));
      });
    });

    const form = $("#planForm");
    if (form) form.addEventListener("submit", calcPlan);

    initReveal();
    initScrollUi();
    initBars();

    renderHighway();
    renderWinter("heat");
    renderDegradation();
    renderCompare("mixed");
    calcPlan();

    requestAnimationFrame(function (t) { lastFrame = t; loop(t); });

    window.addEventListener("load", function () {
      scenes.forEach(resizeScene);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
