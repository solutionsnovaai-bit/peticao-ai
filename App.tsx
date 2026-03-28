import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // ============================================================
    // CANVAS VFX
    // ============================================================
    let vfxRAF: number;
    (function(){
      const cv = document.getElementById('vfx-canvas') as HTMLCanvasElement;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const mob = window.matchMedia('(hover:none),(max-width:768px)').matches;
      let W: number, H: number, GRID: number, cols: number, rows: number;
      const pt = {x:-9999, y:-9999, vx:0, vy:0};
      let lx=0, ly=0, sy=0, ti=0;
      
      function resize(){
        W = cv.width = window.innerWidth;
        H = cv.height = window.innerHeight;
        GRID = mob ? 75 : 58;
        cols = Math.ceil(W/GRID) + 2;
        rows = Math.ceil(H/GRID) + 2;
      }
      window.addEventListener('resize', resize, {passive:true});
      resize();
      
      if(!mob){
        window.addEventListener('mousemove', e => {
          pt.vx = e.clientX - lx;
          pt.vy = e.clientY - ly;
          lx = pt.x = e.clientX;
          ly = pt.y = e.clientY;
        }, {passive:true});
      } else {
        window.addEventListener('touchmove', e => {
          const t = e.touches[0];
          pt.vx = t.clientX - lx;
          pt.vy = t.clientY - ly;
          lx = pt.x = t.clientX;
          ly = pt.y = t.clientY;
        }, {passive:true});
        window.addEventListener('touchend', () => {
          setTimeout(() => { pt.x = -9999; pt.y = -9999; }, 600);
        }, {passive:true});
      }
      
      window.addEventListener('scroll', () => { sy = window.scrollY; }, {passive:true});
      
      const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
      
      function draw(){
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        const spd = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy), scr = sy * .002, INFL = mob ? 180 : 280;
        for(let xi=0; xi<cols; xi++){
          for(let yi=0; yi<rows; yi++){
            const bx = xi * GRID, by = yi * GRID, dx = bx - pt.x, dy = by - pt.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = Math.max(0, 1 - d / INFL), amp = 6 * f * (1 + spd * .03);
            const wv = Math.sin(xi * .4 + ti * .8 + scr) * Math.cos(yi * .4 + ti * .6 + scr) * 3;
            const px = bx + wv - (dx / d) * amp, py = by + wv * .5 - (dy / d) * amp;
            const al = Math.min(1, lerp(.035, .22, f) + .025 + Math.sin(ti + xi + yi) * .012);
            ctx.beginPath(); ctx.arc(px, py, lerp(.55, 1.9, f), 0, 6.283);
            ctx.fillStyle = `rgba(201, 169, 110, ${al})`; ctx.fill();
          }
        }
        if(!mob){
          for(let xi=0; xi<cols-1; xi++){
            for(let yi=0; yi<rows-1; yi++){
              const bx = xi * GRID, by = yi * GRID, dx = bx - pt.x, dy = by - pt.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
              const f = Math.max(0, 1 - d / 240); if(f < .12) continue;
              const amp = 6 * f * (1 + spd * .03), wv = Math.sin(xi * .4 + ti * .8 + scr) * Math.cos(yi * .4 + ti * .6 + scr) * 3;
              const px = bx + wv - (dx / d) * amp, py = by + wv * .5 - (dy / d) * amp;
              const bx2 = (xi + 1) * GRID, dx2 = bx2 - pt.x, d2 = Math.sqrt(dx2 * dx2 + dy * dy) || 1;
              const f2 = Math.max(0, 1 - d2 / 240), amp2 = 6 * f2 * (1 + spd * .03);
              const wv2 = Math.sin((xi + 1) * .4 + ti * .8 + scr) * Math.cos(yi * .4 + ti * .6 + scr) * 3;
              const px2 = bx2 + wv2 - (dx2 / d2) * amp2, py2 = by + wv2 * .5 - (dy / d2) * amp2;
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px2, py2);
              ctx.strokeStyle = `rgba(201, 169, 110, ${f * .13})`; ctx.lineWidth = .5; ctx.stroke();
            }
          }
        }
        ti += mob ? .007 : .011; pt.vx *= .84; pt.vy *= .84;
        vfxRAF = requestAnimationFrame(draw);
      }
      draw();
    })();

    // ============================================================
    // GSAP
    // ============================================================
    const ctx = gsap.context(() => {
      const mob = window.matchMedia('(max-width:768px)').matches;
      const tl = gsap.timeline({delay: .15});
      
      // Hero Animation
      const heroHeadline = document.querySelector('.hero-headline');
      if(heroHeadline){
        const sp = new SplitType('.hero-headline .word', {types: 'chars'});
        if(sp.chars && sp.chars.length){
          gsap.set(sp.chars, {opacity: 1}); // Ensure visible before animation
          tl.fromTo(sp.chars, 
            {opacity: 0, y: mob ? 36 : 70, rotateX: -18},
            {opacity: 1, y: 0, rotateX: 0, stagger: .032, duration: .58, ease: 'power4.out', onComplete: () => {
              document.querySelectorAll('.glitch-text').forEach(el => el.classList.add('active'));
            }}, 0);
          if(!mob){
            const gloop = () => {
              gsap.timeline()
                .to(sp.chars, {scaleY: 1.07, skewX: 1, duration: .05, stagger: {each: .01, from: 'random'}, ease: 'none'})
                .to(sp.chars, {scaleY: 1, skewX: 0, duration: .09, stagger: {each: .01, from: 'random'}, ease: 'elastic.out(1,.5)'})
                .to(sp.chars, {x: () => (Math.random() - .5) * 4, duration: .04, stagger: {each: .008, from: 'random'}})
                .to(sp.chars, {x: 0, duration: .14, ease: 'power2.out'});
              setTimeout(gloop, 2700 + Math.random() * 700);
            };
            setTimeout(gloop, 1800);
          }
        }
      }

      // Other SplitType Animations
      const solutionStmt = document.querySelector('.solution-stmt');
      if(solutionStmt){
        const s = new SplitType('.solution-stmt .big .inner:first-child', {types: 'chars'});
        if(s.chars) gsap.from(s.chars, {scrollTrigger: {trigger: '.solution-stmt', start: 'top 85%', once: true}, opacity: 0, y: 40, rotateX: -14, stagger: .025, duration: .5, ease: 'power4.out'});
      }

      const finalCta = document.querySelector('.final-cta');
      if(finalCta){
        const s = new SplitType('.final-cta h2 .inner', {types: 'chars'});
        if(s.chars) gsap.from(s.chars, {scrollTrigger: {trigger: '.final-cta', start: 'top 85%', once: true}, opacity: 0, y: 50, rotateX: -18, stagger: .03, duration: .55, ease: 'power4.out'});
      }

      const painStatement = document.querySelector('.pain-statement');
      if(painStatement){
        const s = new SplitType('.pain-statement .gold', {types: 'chars'});
        if(s.chars) gsap.from(s.chars, {scrollTrigger: {trigger: '.pain-statement', start: 'top 90%', once: true}, opacity: 0, y: 30, stagger: .08, duration: .5, ease: 'power3.out'});
      }

      tl.from('.hero-eyebrow', {opacity: 0, y: 16, duration: .6, ease: 'power3.out'}, .08)
        .from('.urgency-bar', {opacity: 0, y: 14, duration: .55, ease: 'power3.out'}, .22)
        .from('.hero-sub', {opacity: 0, y: 18, duration: .65, ease: 'power3.out'}, .7)
        .from('.hero-cta-row', {opacity: 0, y: 14, duration: .65, ease: 'power3.out'}, .88);
      
      document.querySelectorAll('.features-grid,.cards-wrap,.guarantee-row,.testimonials-grid,.final-cta-sub,.pain-eyebrow,.pain-grid').forEach((el, i) => {
        gsap.from(el, {scrollTrigger: {trigger: el, start: 'top 92%', once: true}, opacity: 0, y: 28, duration: .8, delay: (i % 3) * .06, ease: 'power3.out'});
      });
      
      document.querySelectorAll('.stat-number').forEach(el => {
        const t = parseInt((el as HTMLElement).dataset.target || '0', 10), s = (el as HTMLElement).dataset.suffix || '';
        if(isNaN(t)) return;
        const o = {v: 0};
        gsap.to(o, {scrollTrigger: {trigger: el, start: 'top 90%', once: true}, v: t, duration: 1.4, ease: 'power2.out', onUpdate() { el.textContent = Math.round(o.v) + s; }});
      });
      
      gsap.from('.feature-card', {scrollTrigger: {trigger: '.features-grid', start: 'top 88%', once: true}, opacity: 0, y: 26, stagger: .09, duration: .6, ease: 'power3.out'});
      gsap.from('.plan-card', {scrollTrigger: {trigger: '.cards-wrap', start: 'top 88%', once: true}, opacity: 0, y: 44, stagger: .16, duration: .75, ease: 'power4.out'});
      gsap.to('.plan-card.elite', {boxShadow: '0 0 60px rgba(201,169,110,.18),0 0 120px rgba(201,169,110,.07)', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.from('.testimonial-card', {scrollTrigger: {trigger: '.testimonials-grid', start: 'top 90%', once: true}, opacity: 0, y: 24, stagger: .1, duration: .7, ease: 'power3.out'});
      gsap.from('.pain-card', {scrollTrigger: {trigger: '.pain-grid', start: 'top 88%', once: true}, opacity: 0, y: 28, stagger: .1, duration: .65, ease: 'power3.out'});
    });

    // ============================================================
    // TYPEWRITER
    // ============================================================
    let twTimeout: any;
    (function(){
      const el = document.getElementById('typewriter-word');
      if(!el) return;
      const words = ['DATILOGRAR.', 'DIGITAR.', 'COPIAR E COLAR.', 'REPETIR.'];
      let wi = 0, ci = 0, del = false;
      el.innerHTML = '<span class="tw-cursor">▌</span>';
      function tw(){
        const w = words[wi];
        if(!del){
          ci++;
          el.textContent = w.slice(0, ci);
          if(ci === w.length){ del = true; twTimeout = setTimeout(tw, 1800); return; }
        } else {
          ci--;
          el.textContent = w.slice(0, ci);
          if(ci === 0){ del = false; wi = (wi + 1) % words.length; twTimeout = setTimeout(tw, 300); return; }
        }
        twTimeout = setTimeout(tw, del ? 45 : 90);
      }
      twTimeout = setTimeout(tw, 600);
    })();

    // ============================================================
    // FAQ
    // ============================================================
    (window as any).toggleFaq = (el: HTMLElement) => {
      const was = el.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if(!was) el.classList.add('open');
    };

    // ============================================================
    // SMOOTH SCROLL
    // ============================================================
    const handleSmoothScroll = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const tgt = document.querySelector(a.getAttribute('href') || '');
      if(!tgt) return;
      e.preventDefault();
      window.scrollTo({top: tgt.getBoundingClientRect().top + window.scrollY - 68, behavior: 'smooth'});
    };
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', handleSmoothScroll));

    // ============================================================
    // CHECKOUT
    // ============================================================
    const plans: any = {
      elite: {label: 'ACESSO ELITE — 12 MESES', name: 'PETIÇÃO.AI — ACESSO ELITE', price: 'R$ 2.397', value: 2397, display: 'R$ 2.397,00'},
    };
    let currentPlan = 'elite', selInst = 1;

    function buildInstallments(val: number){
      const grid = document.getElementById('installmentsGrid');
      if(!grid) return;
      let h = '';
      for(let x = 1; x <= 12; x++){
        const monthly = (val / x).toFixed(2).replace('.', ',');
        const sel = x === selInst ? ' selected' : '';
        h += `<button class="inst-btn${sel}" data-inst="${x}"><span class="inst-x">${x}x</span><span class="inst-val">sem juros</span></button>`;
      }
      grid.innerHTML = h;
      grid.querySelectorAll('.inst-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const x = parseInt((btn as HTMLElement).dataset.inst || '1', 10);
          selectInstall(x);
        });
      });
    }

    function selectInstall(x: number){
      selInst = x;
      buildInstallments(plans[currentPlan].value);
      updateSubmit();
    }

    function updateSubmit(){
      const btn = document.getElementById('coSubmitBtn');
      if(!btn) return;
      const p = plans[currentPlan], x = selInst;
      const m = (p.value / x).toFixed(2).replace('.', ',');
      btn.textContent = x === 1 ? `🔒 PAGAR ${p.display}` : `🔒 PAGAR ${x}x DE R$ ${m} SEM JUROS`;
    }

    (window as any).openCheckout = (key: string) => {
      currentPlan = key; selInst = 1;
      const p = plans[key];
      const coPlanLabel = document.getElementById('coPlanLabel');
      const coPlanName = document.getElementById('coPlanName');
      const coPlanPrice = document.getElementById('coPlanPrice');
      const pixAmountText = document.getElementById('pixAmountText');
      const pixStepValor = document.getElementById('pixStepValor');
      if(coPlanLabel) coPlanLabel.textContent = p.label;
      if(coPlanName) coPlanName.textContent = p.name;
      if(coPlanPrice) coPlanPrice.textContent = p.price;
      if(pixAmountText) pixAmountText.textContent = p.display;
      if(pixStepValor) pixStepValor.textContent = p.display;
      buildInstallments(p.value);
      switchTab('pix');
      updateSubmit();
      const overlay = document.getElementById('checkoutOverlay');
      const modal = document.getElementById('checkoutModal');
      if(overlay) overlay.classList.add('active');
      if(modal) gsap.fromTo(modal, {y: 40, opacity: 0, scale: .95}, {y: 0, opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.2)'});
      document.body.style.overflow = 'hidden';
    };

    (window as any).closeCheckout = () => {
      const overlay = document.getElementById('checkoutOverlay');
      if(overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
      stopConfetti();
    };

    const overlay = document.getElementById('checkoutOverlay');
    if(overlay) overlay.addEventListener('click', function(e){ if(e.target === this) (window as any).closeCheckout(); });
    const coCloseBtn = document.getElementById('coCloseBtn');
    if(coCloseBtn) coCloseBtn.addEventListener('click', (window as any).closeCheckout);
    const handleEsc = (e: KeyboardEvent) => { if(e.key === 'Escape') (window as any).closeCheckout(); };
    document.addEventListener('keydown', handleEsc);

    function switchTab(tab: string){
      const pp = document.getElementById('pixPanel'), cp = document.getElementById('cardPanel');
      const tp = document.getElementById('tabPix'), tc = document.getElementById('tabCard');
      if(!pp || !cp || !tp || !tc) return;
      if(tab === 'pix'){ pp.style.display = ''; cp.style.display = 'none'; tp.classList.add('active'); tc.classList.remove('active'); }
      else { pp.style.display = 'none'; cp.style.display = ''; tc.classList.add('active'); tp.classList.remove('active'); }
    }
    (window as any).switchTab = switchTab;

    // PIX
    const pixKeyBox = document.getElementById('pixKeyBox');
    const pixCopyBtn = document.getElementById('pixCopyBtn');
    const doCopy = () => {
      const keyEl = document.getElementById('pixKey');
      if(!keyEl || !pixCopyBtn) return;
      const key = keyEl.textContent?.trim() || '';
      const ok = () => {
        pixCopyBtn.textContent = '✓ COPIADO';
        pixCopyBtn.classList.add('copied');
        setTimeout(() => { pixCopyBtn.textContent = 'COPIAR'; pixCopyBtn.classList.remove('copied'); }, 2200);
      };
      if(navigator.clipboard){ navigator.clipboard.writeText(key).then(ok).catch(() => fb(key, ok)); } else fb(key, ok);
    };
    function fb(t: string, cb: () => void){
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta); cb();
    }
    if(pixKeyBox) pixKeyBox.addEventListener('click', doCopy);
    if(pixCopyBtn) pixCopyBtn.addEventListener('click', e => { e.stopPropagation(); doCopy(); });

    // CARD FORMATTING
    const cardName = document.getElementById('cardName') as HTMLInputElement;
    const cardNumber = document.getElementById('cardNumber') as HTMLInputElement;
    const cardExpiry = document.getElementById('cardExpiry') as HTMLInputElement;
    const cardCvv = document.getElementById('cardCvv') as HTMLInputElement;
    const cardCpf = document.getElementById('cardCpf') as HTMLInputElement;

    if(cardNumber) cardNumber.oninput = () => { let v = cardNumber.value.replace(/\D/g, '').substring(0, 16); cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim(); };
    if(cardExpiry) cardExpiry.oninput = () => { let v = cardExpiry.value.replace(/\D/g, '').substring(0, 4); if(v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2); cardExpiry.value = v; };
    if(cardCpf) cardCpf.oninput = () => {
      let v = cardCpf.value.replace(/\D/g, '').substring(0, 11);
      if(v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if(v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      else if(v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2');
      cardCpf.value = v;
    };

    (window as any).submitCard = () => {
      const fields = [
        {el: cardName, ok: () => cardName.value.trim().length > 1},
        {el: cardNumber, ok: () => cardNumber.value.replace(/\s/g, '').length === 16},
        {el: cardExpiry, ok: () => cardExpiry.value.length === 5},
        {el: cardCvv, ok: () => cardCvv.value.length >= 3},
        {el: cardCpf, ok: () => cardCpf.value.replace(/\D/g, '').length === 11}
      ];
      let valid = true;
      fields.forEach(f => { f.el.classList.remove('error'); if(!f.ok()){ f.el.classList.add('error'); valid = false; } });
      if(!valid){
        const first = document.querySelector('.co-input.error');
        if(first) first.scrollIntoView({behavior: 'smooth', block: 'center'});
        return;
      }
      const btn = document.getElementById('coSubmitBtn') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<span class="pdots"><i></i><i></i><i></i></span> PROCESSANDO';
      setTimeout((window as any).showSuccess, 2200);
    };

    (window as any).showSuccess = () => {
      const p = plans[currentPlan];
      const modal = document.getElementById('checkoutModal');
      const body = document.getElementById('coBody');
      if(!modal || !body) return;
      modal.scrollTop = 0;
      body.style.transition = 'opacity .28s,transform .28s';
      body.style.opacity = '0'; body.style.transform = 'translateY(10px)';
      setTimeout(() => {
        body.innerHTML = `
    <div class="co-success">
      <div class="co-check-wrap">
        <div class="co-ring"></div>
        <svg viewBox="0 0 40 40"><path d="M8 21 L17 30 L32 13"/></svg>
      </div>
      <h3>PAGAMENTO <em>CONFIRMADO!</em></h3>
      <div class="co-success-plan">${p.label}</div>
      <p class="co-success-body">
        Seu acesso ao <strong>${p.name}</strong> foi processado com sucesso.<br><br>
        Nossa equipe entrará em contato via WhatsApp em até <strong>30 minutos</strong> para concluir o setup do seu sistema.
      </p>
      <div class="co-success-badge">📱 &nbsp;AGUARDE CONTATO VIA WHATSAPP</div>
      <button class="co-success-close" onclick="closeCheckout()">FECHAR ESTA JANELA</button>
    </div>`;
        body.style.opacity = '1'; body.style.transform = 'translateY(0)';
        startConfetti();
      }, 290);
    };

    // CONFETTI
    let cRAF: number | null = null;
    const COLS = ['#C9A96E', '#F0C97A', '#ffffff', '#4ade80', '#00F5FF', '#FF2D55', '#f97316'];

    function startConfetti(){
      const cv = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      if(!cv) return;
      cv.width = window.innerWidth; cv.height = window.innerHeight;
      cv.classList.add('active');
      const ctx = cv.getContext('2d');
      if(!ctx) return;
      const pieces: any[] = [];
      for(let i = 0; i < 150; i++){
        pieces.push({
          x: Math.random() * cv.width, y: -10 - Math.random() * 220,
          w: 5 + Math.random() * 9, h: 3 + Math.random() * 5,
          r: Math.random() * Math.PI * 2, rv: (Math.random() - .5) * .17,
          vx: (Math.random() - .5) * 3.8, vy: 2.8 + Math.random() * 3.8,
          c: COLS[Math.floor(Math.random() * COLS.length)], op: 1
        });
      }
      let frame = 0;
      const tick = () => {
        ctx.clearRect(0, 0, cv.width, cv.height);
        let alive = false;
        pieces.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.r += p.rv; p.vy += .055;
          if(frame > 110) p.op = Math.max(0, p.op - .013);
          if(p.y < cv.height + 20 && p.op > 0) alive = true;
          ctx.save(); ctx.globalAlpha = p.op;
          ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if(alive && frame < 340){ cRAF = requestAnimationFrame(tick); } else stopConfetti();
      };
      tick();
    }

    function stopConfetti(){
      const cv = document.getElementById('confetti-canvas');
      if(cv) cv.classList.remove('active');
      if(cRAF) cancelAnimationFrame(cRAF);
    }

    // CLEANUP
    return () => {
      cancelAnimationFrame(vfxRAF);
      if(cRAF) cancelAnimationFrame(cRAF);
      clearTimeout(twTimeout);
      ctx.revert();
      document.removeEventListener('keydown', handleEsc);
      document.querySelectorAll('a[href^="#"]').forEach(a => a.removeEventListener('click', handleSmoothScroll));
    };
  }, []);

  return (
    <div className="page-wrap">
      <canvas id="vfx-canvas"></canvas>
      <canvas id="confetti-canvas"></canvas>

      {/* NAV */}
      <nav>
        <div className="nav-logo">PETIÇÃO<span>.AI</span></div>
        <div className="nav-links">
          <a href="#pricing" className="nav-link">PLANOS</a>
          <a href="#features" className="nav-link">RECURSOS</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <div className="nav-status"><div className="status-dot"></div><span>VAGAS LIMITADAS</span></div>
      </nav>

      {/* DOBRA 1 — PROMESSA */}
      <section className="hero">
        <p className="hero-eyebrow" style={{fontSize: 'clamp(.5rem,2.2vw,.68rem)', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '22px'}}>
          // NOVA AI SOLUTIONS — INTELIGÊNCIA JURÍDICA
        </p>
        <div className="urgency-bar">
          <span className="urgency-label">VAGAS DESTA VERSÃO</span>
          <div className="urgency-track"><div className="urgency-fill"></div></div>
          <span className="urgency-count">73% OCUPADO</span>
        </div>
        <h1 className="hero-headline">
          <span className="line"><span className="word">PETIÇÕES</span></span>
          <span className="line"><span className="word glitch-text gold" data-text="GERADAS">GERADAS</span></span>
          <span className="line"><span className="word">POR IA.</span></span>
        </h1>
        <p className="hero-sub">Tecnologia que transforma entrevistas com clientes em petições iniciais completas. Pare de perder horas em burocracia. Comece a dominar o mercado.</p>
        <div className="hero-cta-row">
          <a href="#pricing" className="btn-primary">→ VER PLANOS DE ACESSO</a>
          <a href="#pain" className="btn-ghost">POR QUE ISSO IMPORTA ↓</a>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track" aria-hidden="true">
          <span className="ticker-item">PETIÇÕES AUTOMATIZADAS <span>✦</span></span>
          <span className="ticker-item">INTELIGÊNCIA JURÍDICA <span>✦</span></span>
          <span className="ticker-item">DOMÍNIO ABSOLUTO <span>✦</span></span>
          <span className="ticker-item">NEWSLETTER JURÍDICA <span>✦</span></span>
          <span className="ticker-item">IA TREINADA NA SUA ÁREA <span>✦</span></span>
          <span className="ticker-item">AUTORIDADE NO LINKEDIN <span>✦</span></span>
          <span className="ticker-item">PETIÇÕES AUTOMATIZADAS <span>✦</span></span>
          <span className="ticker-item">INTELIGÊNCIA JURÍDICA <span>✦</span></span>
          <span className="ticker-item">DOMÍNIO ABSOLUTO <span>✦</span></span>
          <span className="ticker-item">NEWSLETTER JURÍDICA <span>✦</span></span>
          <span className="ticker-item">IA TREINADA NA SUA ÁREA <span>✦</span></span>
          <span className="ticker-item">AUTORIDADE NO LINKEDIN <span>✦</span></span>
        </div>
      </div>

      {/* DOBRA 2 — DOR */}
      <section className="pain-section" id="pain">
        <p className="pain-eyebrow">// O PROBLEMA QUE NINGUÉM FALA</p>
        <h2 className="pain-headline">
          <span className="line-wrap"><span className="inner">VOCÊ <span className="gold">FORMOU</span></span></span>
          <span className="line-wrap"><span className="inner">PRA <span className="glitch-b" data-text="ADVOGAR." style={{color: 'var(--red)'}}>ADVOGAR.</span></span></span>
          <span className="line-wrap"><span className="inner">NÃO PRA</span></span>
          <span className="line-wrap"><span className="inner"><span id="typewriter-word" style={{color: 'var(--gold-dim)'}}>DATILOGRAR.</span></span></span>
        </h2>
        <div className="pain-grid">
          <div className="pain-card"><span className="pain-icon">⏰</span><div className="pain-title">HORAS PERDIDAS POR PETIÇÃO</div><p className="pain-desc">Cada petição consome de 2 a 6 horas do seu tempo. Multiplique por 20 casos ativos. Você passa mais tempo digitando do que estrategizando.</p><div className="pain-num">01</div></div>
          <div className="pain-card"><span className="pain-icon">💸</span><div className="pain-title">RECEITA TRAVADA NO TETO</div><p className="pain-desc">Sem automação, você tem um limite físico de casos. Mais clientes = mais estresse. O escritório cresce só se você contratar mais gente.</p><div className="pain-num">02</div></div>
          <div className="pain-card"><span className="pain-icon">😤</span><div className="pain-title">CONCORRÊNCIA USANDO IA</div><p className="pain-desc">Enquanto você digita, os escritórios que adotaram automação já entregaram 5 petições. O mercado não espera os que resistem à tecnologia.</p><div className="pain-num">03</div></div>
          <div className="pain-card"><span className="pain-icon">🔁</span><div className="pain-title">TRABALHO REPETITIVO SEM FIM</div><p className="pain-desc">A mesma estrutura, os mesmos campos, as mesmas cláusulas — todo dia, todo caso. Seu talento jurídico desperdiçado em trabalho mecânico.</p><div className="pain-num">04</div></div>
        </div>
        <p className="pain-statement"><span className="gold">"A justiça é cega,</span><br />mas o mercado não perdoa<br /><span className="glitch-b gold" data-text="os lentos.">os lentos."</span></p>
      </section>

      {/* DOBRA 3 — SOLUÇÃO */}
      <div className="solution-stmt">
        <p className="big">
          <span className="line-wrap"><span className="inner">APRESENTAMOS</span></span>
          <span className="line-wrap"><span className="inner glitch-c gold" data-text="A SOLUÇÃO.">A SOLUÇÃO.</span></span>
        </p>
        <p>Três passos. Zero código. Setup em 24 horas. Petições automáticas para sempre.</p>
      </div>

      <section className="sect" id="features">
        <div className="section-label">// COMO FUNCIONA</div>
        <div className="features-grid">
          <div className="feature-card"><span className="feature-icon">🎙️</span><div className="feature-title">ENTREVISTA INTELIGENTE</div><p className="feature-desc">O cliente responde perguntas via WhatsApp ou formulário. A IA processa tudo automaticamente, sem precisar de você presente.</p><div className="feature-num">01</div></div>
          <div className="feature-card"><span className="feature-icon">⚡</span><div className="feature-title">GERAÇÃO AUTOMÁTICA</div><p className="feature-desc">IA treinada no seu estilo jurídico transforma as respostas em petição inicial estruturada, com EMENTA, fundamentação e pedidos.</p><div className="feature-num">02</div></div>
          <div className="feature-card"><span className="feature-icon">📄</span><div className="feature-title">DOCUMENTO NO SEU EMAIL</div><p className="feature-desc">A petição chega em .docx diretamente no seu Gmail, pronta para revisão e protocolo. Tudo automatizado.</p><div className="feature-num">03</div></div>
          <div className="feature-card"><span className="feature-icon">🔄</span><div className="feature-title">MELHORIA CONTÍNUA</div><p className="feature-desc">O sistema aprende com seus feedbacks. Com o tempo, as petições ficam mais alinhadas com seu estilo e área de atuação.</p><div className="feature-num">04</div></div>
          <div className="feature-card"><span className="feature-icon">📱</span><div className="feature-title">100% REMOTO</div><p className="feature-desc">Gerencie tudo pelo celular. Acompanhe cada petição gerada, revise e aprove sem precisar estar no escritório.</p><div className="feature-num">05</div></div>
          <div className="feature-card"><span className="feature-icon">🔒</span><div className="feature-title">SEGURANÇA TOTAL</div><p className="feature-desc">Dados com criptografia de ponta. Compliance total com LGPD. Seus clientes e casos ficam 100% seguros.</p><div className="feature-num">06</div></div>
        </div>
      </section>

      {/* DOBRA 5 — PREÇO + BÔNUS */}
      <section className="pricing-section" id="pricing">
        <div className="section-label" style={{maxWidth: '880px', margin: '0 auto 22px'}}>// ACESSO ELITE</div>
        <h2>ACESSO <span className="gold">TOTAL.</span><br />RESULTADO <span className="gold">REAL.</span></h2>
        <p className="sub">Uma oferta. Sem enrolação. Sem mensalidade surpresa.</p>

        <div className="cards-wrap">
          {/* ELITE 12M ÚNICO */}
          <div className="plan-card elite" style={{borderLeft: 'none', borderTop: '2px solid var(--gold)'}}>
            <div className="savings-badge">⚡ VAGAS LIMITADAS — OFERTA DE LANÇAMENTO</div>
            <div className="plan-badge badge-elite">★ ACESSO ELITE — 12 MESES</div>
            <div className="plan-name">PETIÇÃO.AI</div>
            <div className="plan-price">R$ 2.397</div>
            <div className="plan-price-label">ou 12x de R$ 197 · pagamento único · 12 meses de acesso</div>
            <div className="bonus-box">
              <div className="bonus-label">🎁 BÔNUS EXCLUSIVOS INCLUSOS</div>
              <div className="bonus-value">+ R$ 2.000,00 em valor</div>
              <div className="bonus-desc">
                <strong style={{color: 'var(--gold)'}}>✓ Newsletter Jurídica Automatizada para LinkedIn</strong><br />
                A IA seleciona os temas mais quentes do mercado jurídico. Você escolhe, ela publica. Autoridade no piloto automático.<br /><br />
                <strong style={{color: 'var(--gold)'}}>✓ Assistente Jurídico Personalizado</strong><br />
                IA treinada na sua área de atuação. Pesquisa jurisprudência, sugere teses, responde dúvidas.
              </div>
            </div>
            <div className="comparison-row highlight"><span>Valor total dos serviços:</span><span>R$ 4.397,00</span></div>
            <div className="comparison-row"><span>Você paga apenas:</span><span style={{color: 'var(--white)'}}>R$ 2.397,00</span></div>
            <div className="comparison-row highlight"><span>Sua economia:</span><span>R$ 2.000,00</span></div>
            <ul className="plan-features-list" style={{marginTop: '18px'}}>
              <li><span className="check">✓</span>Portal de Petições com a sua marca (setup em 24h)</li>
              <li><span className="check">✓</span>Geração automática de Petições Iniciais por IA</li>
              <li><span className="check">✓</span><strong style={{color: 'var(--gold)'}}>Newsletter Jurídica Automatizada para LinkedIn</strong></li>
              <li><span className="check">✓</span><strong style={{color: 'var(--gold)'}}>Assistente Jurídico Personalizado</strong></li>
              <li><span className="check">✓</span>Suporte via WhatsApp</li>
              <li><span className="check">✓</span>Onboarding guiado — você não configura nada</li>
              <li><span className="check">✓</span>Atualizações incluídas durante o período</li>
            </ul>
            <button className="plan-cta cta-elite" onClick={() => (window as any).openCheckout('elite')}>GARANTIR ACESSO ELITE AGORA →</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sect">
        <div className="section-label">// PERGUNTAS FREQUENTES</div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>O sistema funciona para qualquer área do direito?</span><span className="faq-icon">+</span></div><div className="faq-answer">Sim. A IA é configurada especificamente para a sua área durante o setup. Trabalhista, civil, empresarial, família, previdenciário — qualquer especialidade. O sistema aprende o seu estilo e a linguagem da sua área.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Preciso saber programar ou instalar alguma coisa?</span><span className="faq-icon">+</span></div><div className="faq-answer">Absolutamente não. Cuidamos de todo o setup técnico em até 24h após a confirmação do acesso. Você recebe seu portal pronto, com sua marca. Só usa normalmente pelo celular ou computador.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Como funciona a Newsletter Jurídica para LinkedIn?</span><span className="faq-icon">+</span></div><div className="faq-answer">A IA seleciona semanalmente os temas jurídicos mais relevantes do mercado. Você acessa seu portal, escolhe o tema que quer publicar, clica em gerar — e o post vai direto para o seu LinkedIn. Zero esforço, autoridade máxima.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>O que é o Assistente Jurídico Personalizado?</span><span className="faq-icon">+</span></div><div className="faq-answer">É uma IA treinada especificamente na sua área de atuação. Você pode perguntar sobre jurisprudência, pedir sugestão de teses, tirar dúvidas sobre legislação e muito mais — como ter um assistente jurídico disponível 24h por dia.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Meus dados e os dados dos meus clientes ficam seguros?</span><span className="faq-icon">+</span></div><div className="faq-answer">Sim. Todo o sistema opera com criptografia de ponta e está em conformidade com a LGPD. Seus casos e dados dos clientes não são compartilhados com terceiros.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Quanto tempo leva para receber meu acesso após a compra?</span><span className="faq-icon">+</span></div><div className="faq-answer">Após a confirmação do pagamento, nossa equipe entra em contato via WhatsApp em até 30 minutos. O setup completo do seu portal personalizado é concluído em até 24 horas.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Quanto tempo leva para tudo funcionar?</span><span className="faq-icon">+</span></div><div className="faq-answer">Setup completo em até 24-48h após confirmação do pagamento. Você começa a gerar petições automatizadas no mesmo dia.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Qual a diferença real entre o plano 6 e 12 meses?</span><span className="faq-icon">+</span></div><div className="faq-answer">Além do dobro do tempo, o plano 12M inclui a Automação de Newsletter (R$ 1.500) grátis, suporte VIP e relatórios mensais. Custo por mês bem menor.</div></div>
        <div className="faq-item" onClick={(e) => (window as any).toggleFaq(e.currentTarget)}><div className="faq-question"><span>Consigo parcelar no cartão de crédito?</span><span className="faq-icon">+</span></div><div className="faq-answer">Sim. Parcelamos em até 12x sem juros no cartão de crédito. Você escolhe no momento do checkout.</div></div>
      </section>

      {/* FINAL CTA */}
      <div className="final-cta" id="contact">
        <div className="final-cta-bg"></div>
        <h2>
          <span className="line-wrap"><span className="inner"><span className="glitch-c gold" data-text="CHEGA">CHEGA</span></span></span>
          <span className="line-wrap"><span className="inner">DE SER</span></span>
          <span className="line-wrap"><span className="inner"><span className="glitch-b gold" data-text="LENTO.">LENTO.</span></span></span>
        </h2>
        <p className="final-cta-sub">O mercado jurídico está se transformando agora. Os advogados que adotarem IA primeiro vão dominar os próximos 10 anos.</p>
        <button className="btn-primary" onClick={() => (window as any).openCheckout('elite')} style={{display: 'flex', maxWidth: '480px', margin: '0 auto'}}>⚡ GARANTIR ACESSO ELITE — R$ 2.397</button>
        <p className="final-note">VAGAS LIMITADAS · SETUP EM 24H · 12X DE R$ 197 SEM JUROS</p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">PETIÇÃO.AI</div>
        <div className="footer-copy">© 2026 Nova AI Solutions · Todos os direitos reservados<br />Desenvolvido para advogados brasileiros</div>
      </footer>

      {/* CHECKOUT MODAL */}
      <div className="checkout-overlay" id="checkoutOverlay">
        <div className="checkout-modal" id="checkoutModal">
          <div className="co-header">
            <div>
              <div className="co-plan-label" id="coPlanLabel">PLANO SELECIONADO</div>
              <div className="co-plan-name" id="coPlanName">PETIÇÃO.AI — ACESSO ELITE</div>
              <div className="co-plan-price" id="coPlanPrice">R$ 2.397</div>
            </div>
            <button className="co-close" id="coCloseBtn" aria-label="Fechar">✕</button>
          </div>
          <div className="co-body" id="coBody">
            <div className="pay-tabs">
              <button className="pay-tab active" id="tabPix" onClick={() => (window as any).switchTab('pix')}><span className="pay-tab-icon">⚡</span>PIX</button>
              <button className="pay-tab" id="tabCard" onClick={() => (window as any).switchTab('card')}><span className="pay-tab-icon">💳</span>CARTÃO</button>
            </div>

            {/* PIX PANEL */}
            <div id="pixPanel" className="pix-panel">
              <div className="pix-amount-display"><span>VALOR A PAGAR</span><span id="pixAmountText">R$ 2.397,00</span></div>
              <div className="pix-qr">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="38" height="38" stroke="#C9A96E" strokeWidth="3.5" fill="none"/>
                  <rect x="13" y="13" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                  <rect x="57" y="5" width="38" height="38" stroke="#C9A96E" strokeWidth="3.5" fill="none"/>
                  <rect x="65" y="13" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                  <rect x="5" y="57" width="38" height="38" stroke="#C9A96E" strokeWidth="3.5" fill="none"/>
                  <rect x="13" y="65" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                  <rect x="57" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="67" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="77" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="87" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="57" y="67" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="77" y="67" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="57" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="67" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="87" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="57" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="77" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                  <rect x="87" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                </svg>
              </div>
              <div className="pix-key-box" id="pixKeyBox" role="button" tabIndex={0}>
                <div style={{flex: 1}}>
                  <span className="pix-key-label">Chave PIX (E-mail)</span>
                  <span className="pix-key-text" id="pixKey">solutions.nova.ai@gmail.com</span>
                </div>
                <button className="pix-copy-btn" id="pixCopyBtn">COPIAR</button>
              </div>
              <div className="pix-steps">
                <div className="pix-step"><span className="pix-step-n">①</span><span>Abra o app do seu banco e acesse a área Pix</span></div>
                <div className="pix-step"><span className="pix-step-n">②</span><span>Escaneie o QR Code ou cole a chave acima</span></div>
                <div className="pix-step"><span className="pix-step-n">③</span><span>Confirme o valor de <strong id="pixStepValor">R$ 2.397,00</strong></span></div>
                <div className="pix-step"><span className="pix-step-n">④</span><span>Clique em <strong>"Já fiz o pagamento"</strong> abaixo</span></div>
              </div>
              <button className="pix-confirm-btn" onClick={() => (window as any).showSuccess()}>✓ JÁ FIZ O PAGAMENTO</button>
            </div>

            {/* CARD PANEL */}
            <div id="cardPanel" className="card-panel" style={{display: 'none'}}>
              <div className="co-form-row">
                <label className="co-label" htmlFor="cardName">NOME NO CARTÃO</label>
                <input type="text" className="co-input" id="cardName" placeholder="Como aparece no cartão" autoComplete="cc-name" spellCheck="false" />
              </div>
              <div className="co-form-row">
                <label className="co-label" htmlFor="cardNumber">NÚMERO DO CARTÃO</label>
                <input type="text" className="co-input" id="cardNumber" placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" autoComplete="cc-number" />
              </div>
              <div className="co-form-row two">
                <div>
                  <label className="co-label" htmlFor="cardExpiry">VALIDADE</label>
                  <input type="text" className="co-input" id="cardExpiry" placeholder="MM/AA" maxLength={5} inputMode="numeric" autoComplete="cc-exp" />
                </div>
                <div>
                  <label className="co-label" htmlFor="cardCvv">CVV</label>
                  <input type="text" className="co-input" id="cardCvv" placeholder="123" maxLength={4} inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </div>
              <div className="co-form-row">
                <label className="co-label" htmlFor="cardCpf">CPF DO TITULAR</label>
                <input type="text" className="co-input" id="cardCpf" placeholder="000.000.000-00" maxLength={14} inputMode="numeric" />
              </div>
              <span className="installments-label">PARCELAMENTO — 12X SEM JUROS</span>
              <div className="installments-grid" id="installmentsGrid"></div>
              <button className="co-submit" id="coSubmitBtn" onClick={() => (window as any).submitCard()}>🔒 PAGAR AGORA</button>
            </div>

            <div className="co-footer-note">🔒 PAGAMENTO 100% SEGURO · SSL · LGPD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
