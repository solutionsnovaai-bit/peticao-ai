/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// --- Types ---
interface Plan {
  key: 'elite' | 'base';
  label: string;
  name: string;
  price: string;
  value: number;
  display: string;
}

const PLANS: Record<string, Plan> = {
  elite: {
    key: 'elite',
    label: 'ACESSO ELITE — 12 MESES',
    name: 'PETIÇÃO.AI ELITE — 12 MESES',
    price: 'R$ 1.497',
    value: 1497,
    display: 'R$ 1.497,00',
  },
  base: {
    key: 'base',
    label: 'ACESSO PADRÃO — 6 MESES',
    name: 'PETIÇÃO.AI — 6 MESES',
    price: 'R$ 897',
    value: 897,
    display: 'R$ 897,00',
  },
};

// --- Components ---

const VFXCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(hover:none),(max-width:768px)').matches;
    let width: number, height: number, grid: number, cols: number, rows: number;
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };
    let lastX = 0, lastY = 0, scrollY = 0, time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      grid = isMobile ? 75 : 58;
      cols = Math.ceil(width / grid) + 2;
      rows = Math.ceil(height / grid) + 2;
    };

    const onMouseMove = (e: MouseEvent) => {
      pointer.vx = e.clientX - lastX;
      pointer.vy = e.clientY - lastY;
      lastX = pointer.x = e.clientX;
      lastY = pointer.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      pointer.vx = t.clientX - lastX;
      pointer.vy = t.clientY - lastY;
      lastX = pointer.x = t.clientX;
      lastY = pointer.y = t.clientY;
    };

    const onTouchEnd = () => {
      setTimeout(() => {
        pointer.x = -9999;
        pointer.y = -9999;
      }, 600);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('resize', resize);
    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove);
    } else {
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    window.addEventListener('scroll', onScroll);

    resize();

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const speed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);
      const scrollFactor = scrollY * 0.002;
      const influence = isMobile ? 180 : 280;

      for (let xi = 0; xi < cols; xi++) {
        for (let yi = 0; yi < rows; yi++) {
          const bx = xi * grid;
          const by = yi * grid;
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) || 1;

          const f = Math.max(0, 1 - dist / influence);
          const amp = 6 * f * (1 + speed * 0.03);
          const wave = Math.sin(xi * 0.4 + time * 0.8 + scrollFactor) * Math.cos(yi * 0.4 + time * 0.6 + scrollFactor) * 3;
          
          const px = bx + wave - (dx / dist) * amp;
          const py = by + wave * 0.5 - (dy / dist) * amp;
          
          const alpha = Math.min(1, lerp(0.035, 0.22, f) + 0.025 + Math.sin(time + xi + yi) * 0.012);
          
          ctx.beginPath();
          ctx.arc(px, py, lerp(0.55, 1.9, f), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 169, 110, ${alpha})`;
          ctx.fill();
        }
      }

      if (!isMobile) {
        for (let xi = 0; xi < cols - 1; xi++) {
          for (let yi = 0; yi < rows - 1; yi++) {
            const bx = xi * grid;
            const by = yi * grid;
            const dx = bx - pointer.x;
            const dy = by - pointer.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) || 1;
            
            const f = Math.max(0, 1 - dist / 240);
            if (f < 0.12) continue;

            const amp = 6 * f * (1 + speed * 0.03);
            const wave = Math.sin(xi * 0.4 + time * 0.8 + scrollFactor) * Math.cos(yi * 0.4 + time * 0.6 + scrollFactor) * 3;
            const px = bx + wave - (dx / dist) * amp;
            const py = by + wave * 0.5 - (dy / dist) * amp;

            const bx2 = (xi + 1) * grid;
            const dx2 = bx2 - pointer.x;
            const distSq2 = dx2 * dx2 + dy * dy;
            const dist2 = Math.sqrt(distSq2) || 1;
            const f2 = Math.max(0, 1 - dist2 / 240);
            const amp2 = 6 * f2 * (1 + speed * 0.03);
            const wave2 = Math.sin((xi + 1) * 0.4 + time * 0.8 + scrollFactor) * Math.cos(yi * 0.4 + time * 0.6 + scrollFactor) * 3;
            const px2 = bx2 + wave2 - (dx2 / dist2) * amp2;
            const py2 = by + wave2 * 0.5 - (dy / dist2) * amp2;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px2, py2);
            ctx.strokeStyle = `rgba(201, 169, 110, ${f * 0.13})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      time += isMobile ? 0.007 : 0.011;
      pointer.vx *= 0.84;
      pointer.vy *= 0.84;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="vfx-canvas" ref={canvasRef} />;
};

const CheckoutModal = ({ isOpen, onClose, planKey }: { isOpen: boolean; onClose: () => void; planKey: string }) => {
  const [tab, setTab] = useState<'pix' | 'card'>('pix');
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    cpf: '',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const plan = PLANS[planKey] || PLANS.elite;

  const handleCopyPix = () => {
    const key = 'peticao.ai@novaiasolutions.com.br';
    navigator.clipboard.writeText(key).then(() => {
      const btn = document.getElementById('pixCopyBtn');
      if (btn) {
        btn.textContent = '✓ COPIADO';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'COPIAR';
          btn.classList.remove('copied');
        }, 2200);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let val = value;

    if (id === 'cardNumber') {
      val = value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
    } else if (id === 'cardExpiry') {
      val = value.replace(/\D/g, '').substring(0, 4);
      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
    } else if (id === 'cardCpf') {
      val = value.replace(/\D/g, '').substring(0, 11);
      if (val.length > 9) val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if (val.length > 6) val = val.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      else if (val.length > 3) val = val.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (id === 'cardCvv') {
      val = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [id.replace('card', '').toLowerCase()]: val }));
    setErrors(prev => ({ ...prev, [id]: false }));
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (formData.name.trim().length < 2) newErrors.cardName = true;
    if (formData.number.replace(/\s/g, '').length !== 16) newErrors.cardNumber = true;
    if (formData.expiry.length !== 5) newErrors.cardExpiry = true;
    if (formData.cvv.length < 3) newErrors.cardCvv = true;
    if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cardCpf = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (tab === 'card' && !validate()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A96E', '#F0C97A', '#ffffff', '#4ade80', '#00F5FF', '#FF2D55'],
      });
    }, 2000);
  };

  const monthlyValue = (plan.value / installments).toFixed(2).replace('.', ',');

  return (
    <div className={`checkout-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="checkout-modal">
        <div className="co-header">
          <div>
            <div className="co-plan-label">PLANO SELECIONADO</div>
            <div className="co-plan-name">{plan.name}</div>
            <div className="co-plan-price">{plan.price}</div>
          </div>
          <button className="co-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="co-body">
          {!isSuccess ? (
            <>
              <div className="pay-tabs">
                <button className={`pay-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}>
                  <span className="pay-tab-icon">⚡</span>PIX
                </button>
                <button className={`pay-tab ${tab === 'card' ? 'active' : ''}`} onClick={() => setTab('card')}>
                  <span className="pay-tab-icon">💳</span>CARTÃO
                </button>
              </div>

              {tab === 'pix' ? (
                <div className="pix-panel">
                  <div className="pix-amount-display"><span>VALOR A PAGAR</span>{plan.display}</div>
                  <div className="pix-qr">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="38" height="38" stroke="#C9A96E" stroke-width="3.5" fill="none"/>
                      <rect x="13" y="13" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                      <rect x="57" y="5" width="38" height="38" stroke="#C9A96E" stroke-width="3.5" fill="none"/>
                      <rect x="65" y="13" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                      <rect x="5" y="57" width="38" height="38" stroke="#C9A96E" stroke-width="3.5" fill="none"/>
                      <rect x="13" y="65" width="22" height="22" fill="#C9A96E" opacity=".55"/>
                      <rect x="57" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="67" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="77" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="87" y="57" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                      <rect x="57" y="67" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="77" y="67" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                      <rect x="57" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="67" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="87" y="77" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                      <rect x="57" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="77" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/><rect x="87" y="87" width="6" height="6" fill="#C9A96E" opacity=".7"/>
                    </svg>
                  </div>
                  <div className="pix-key-box" onClick={handleCopyPix}>
                    <div style={{ flex: 1 }}>
                      <span className="pix-key-label">Chave PIX (E-mail)</span>
                      <span className="pix-key-text">peticao.ai@novaiasolutions.com.br</span>
                    </div>
                    <button className="pix-copy-btn" id="pixCopyBtn">COPIAR</button>
                  </div>
                  <div className="pix-steps">
                    <div className="pix-step"><span className="pix-step-n">①</span><span>Abra o app do seu banco e acesse a área Pix</span></div>
                    <div className="pix-step"><span className="pix-step-n">②</span><span>Escaneie o QR Code ou cole a chave acima</span></div>
                    <div className="pix-step"><span className="pix-step-n">③</span><span>Confirme o valor de <strong>{plan.display}</strong></span></div>
                    <div className="pix-step"><span className="pix-step-n">④</span><span>Clique em <strong>"Já fiz o pagamento"</strong> abaixo</span></div>
                  </div>
                  <button className="pix-confirm-btn" onClick={handleSubmit}>✓ JÁ FIZ O PAGAMENTO</button>
                </div>
              ) : (
                <div className="card-panel">
                  <div className="co-form-row">
                    <label className="co-label">NOME NO CARTÃO</label>
                    <input type="text" className={`co-input ${errors.cardName ? 'error' : ''}`} id="cardName" value={formData.name} onChange={handleInputChange} placeholder="Como aparece no cartão" />
                  </div>
                  <div className="co-form-row">
                    <label className="co-label">NÚMERO DO CARTÃO</label>
                    <input type="text" className={`co-input ${errors.cardNumber ? 'error' : ''}`} id="cardNumber" value={formData.number} onChange={handleInputChange} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="co-form-row two">
                    <div>
                      <label className="co-label">VALIDADE</label>
                      <input type="text" className={`co-input ${errors.cardExpiry ? 'error' : ''}`} id="cardExpiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/AA" />
                    </div>
                    <div>
                      <label className="co-label">CVV</label>
                      <input type="text" className={`co-input ${errors.cardCvv ? 'error' : ''}`} id="cardCvv" value={formData.cvv} onChange={handleInputChange} placeholder="123" />
                    </div>
                  </div>
                  <div className="co-form-row">
                    <label className="co-label">CPF DO TITULAR</label>
                    <input type="text" className={`co-input ${errors.cardCpf ? 'error' : ''}`} id="cardCpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                  </div>
                  <span className="installments-label">PARCELAMENTO — 12X SEM JUROS</span>
                  <div className="installments-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(x => (
                      <button key={x} className={`inst-btn ${installments === x ? 'selected' : ''}`} onClick={() => setInstallments(x)}>
                        <span className="inst-x">{x}x</span>
                        <span className="inst-val">sem juros</span>
                      </button>
                    ))}
                  </div>
                  <button className="co-submit" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? (
                      <><span className="pdots"><i></i><i></i><i></i></span> PROCESSANDO</>
                    ) : (
                      installments === 1 ? `🔒 PAGAR ${plan.display}` : `🔒 PAGAR ${installments}x DE R$ ${(plan.value / installments).toFixed(2).replace('.', ',')} SEM JUROS`
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="co-success">
              <div className="co-check-wrap">
                <div className="co-ring"></div>
                <svg viewBox="0 0 40 40"><path d="M8 21 L17 30 L32 13"/></svg>
              </div>
              <h3>PAGAMENTO <em>CONFIRMADO!</em></h3>
              <div className="co-success-plan">{plan.label}</div>
              <p className="co-success-body">
                Seu acesso ao <strong>{plan.name}</strong> foi processado com sucesso.<br /><br />
                Nossa equipe entrará em contato via WhatsApp em até <strong>30 minutos</strong> para concluir o setup do seu sistema.
              </p>
              <div className="co-success-badge">📱 &nbsp;AGUARDE CONTATO VIA WHATSAPP</div>
              <button className="co-success-close" onClick={onClose}>FECHAR ESTA JANELA</button>
            </div>
          )}
          <div className="co-footer-note">🔒 PAGAMENTO 100% SEGURO · SSL · LGPD</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'elite' | 'base'>('elite');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openCheckout = (plan: 'elite' | 'base') => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width:768px)').matches;
      
      // Hero Animations
      const heroTl = gsap.timeline({ delay: 0.15 });
      const heroHeadline = new SplitType('.hero-headline .word', { types: 'chars' });
      
      if (heroHeadline.chars) {
        heroTl.from(heroHeadline.chars, {
          opacity: 0,
          y: isMobile ? 36 : 70,
          rotateX: -18,
          stagger: 0.032,
          duration: 0.58,
          ease: 'power4.out'
        }, 0);

        if (!isMobile) {
          const glitchLoop = () => {
            gsap.timeline()
              .to(heroHeadline.chars, { scaleY: 1.07, skewX: 1, duration: 0.05, stagger: { each: 0.01, from: 'random' }, ease: 'none' })
              .to(heroHeadline.chars, { scaleY: 1, skewX: 0, duration: 0.09, stagger: { each: 0.01, from: 'random' }, ease: 'elastic.out(1, 0.5)' })
              .to(heroHeadline.chars, { x: () => (Math.random() - 0.5) * 4, duration: 0.04, stagger: { each: 0.008, from: 'random' } })
              .to(heroHeadline.chars, { x: 0, duration: 0.14, ease: 'power2.out' });
            
            gsap.delayedCall(2.7 + Math.random() * 0.7, glitchLoop);
          };
          gsap.delayedCall(1.8, glitchLoop);
        }
      }

      heroTl.from('.hero-eyebrow', { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out' }, 0.08)
        .from('.urgency-bar', { opacity: 0, y: 14, duration: 0.55, ease: 'power3.out' }, 0.22)
        .from('.hero-sub', { opacity: 0, y: 18, duration: 0.65, ease: 'power3.out' }, 0.7)
        .from('.hero-cta-row', { opacity: 0, y: 14, duration: 0.65, ease: 'power3.out' }, 0.88);

      // Section Headers
      ['.pain-headline .inner', '.solution-stmt .big .inner', '.final-cta h2 .inner'].forEach(selector => {
        const split = new SplitType(selector, { types: 'chars' });
        if (split.chars) {
          gsap.from(split.chars, {
            scrollTrigger: { trigger: selector, start: 'top 85%', once: true },
            opacity: 0,
            y: 40,
            rotateX: -14,
            stagger: 0.025,
            duration: 0.5,
            ease: 'power4.out'
          });
        }
      });

      const painStatement = new SplitType('.pain-statement', { types: 'lines' });
      if (painStatement.lines) {
        gsap.from(painStatement.lines, {
          scrollTrigger: { trigger: '.pain-statement', start: 'top 90%', once: true },
          opacity: 0,
          y: 30,
          stagger: 0.14,
          duration: 0.65,
          ease: 'power3.out'
        });
      }

      // General Fade-ins
      document.querySelectorAll('.stats-row, .features-grid, .cards-wrap, .guarantee-row, .testimonials-grid, .social-numbers, .trust-bar, .final-cta-sub, .pain-eyebrow, .pain-grid').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          opacity: 0,
          y: 28,
          duration: 0.8,
          delay: (i % 3) * 0.06,
          ease: 'power3.out'
        });
      });

      // Counter Animations
      document.querySelectorAll('.stat-number, .sn-number').forEach(el => {
        const target = parseInt((el as HTMLElement).dataset.target || '0', 10);
        const suffix = (el as HTMLElement).dataset.suffix || '';
        const obj = { v: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          v: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
        });
      });

      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-grid', start: 'top 88%', once: true },
        opacity: 0,
        y: 26,
        stagger: 0.09,
        duration: 0.6,
        ease: 'power3.out'
      });

      gsap.from('.plan-card', {
        scrollTrigger: { trigger: '.cards-wrap', start: 'top 88%', once: true },
        opacity: 0,
        y: 44,
        stagger: 0.16,
        duration: 0.75,
        ease: 'power4.out'
      });

      gsap.to('.plan-card.elite', {
        boxShadow: '0 0 60px rgba(201,169,110,0.18), 0 0 120px rgba(201,169,110,0.07)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.from('.testimonial-card', {
        scrollTrigger: { trigger: '.testimonials-grid', start: 'top 90%', once: true },
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      gsap.from('.pain-card', {
        scrollTrigger: { trigger: '.pain-grid', start: 'top 88%', once: true },
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-wrap">
      <VFXCanvas />

      {/* NAV */}
      <nav>
        <div className="nav-logo">PETIÇÃO<span>.AI</span></div>
        <div className="nav-status"><div className="status-dot"></div><span>VAGAS LIMITADAS</span></div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <p className="hero-eyebrow">// NOVA AI SOLUTIONS — INTELIGÊNCIA JURÍDICA</p>
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
          <button onClick={() => openCheckout('elite')} className="btn-primary">→ VER PLANOS DE ACESSO</button>
          <button onClick={() => document.getElementById('pain')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost">POR QUE ISSO IMPORTA ↓</button>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item">PETIÇÕES AUTOMATIZADAS <span>✦</span></span>
              <span className="ticker-item">INTELIGÊNCIA JURÍDICA <span>✦</span></span>
              <span className="ticker-item">DOMÍNIO ABSOLUTO <span>✦</span></span>
              <span className="ticker-item">NEWSLETTER AUTOMATION <span>✦</span></span>
              <span className="ticker-item">GPT-4 JURÍDICO <span>✦</span></span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-cell"><div className="stat-number" data-target="87" data-suffix="%">0%</div><div className="stat-label">Redução no Tempo de Petição</div></div>
        <div className="stat-cell"><div className="stat-number" data-target="3" data-suffix="X">0X</div><div className="stat-label">Mais Casos por Mês</div></div>
        <div className="stat-cell"><div className="stat-number" data-target="24" data-suffix="h">0h</div><div className="stat-label">Setup Completo e Ativo</div></div>
        <div className="stat-cell"><div className="stat-number" data-target="100" data-suffix="%">0%</div><div className="stat-label">Personalizado para Sua Área</div></div>
      </div>

      {/* PAIN */}
      <section className="pain-section" id="pain">
        <p className="pain-eyebrow">// O PROBLEMA QUE NINGUÉM FALA</p>
        <h2 className="pain-headline">
          <span className="line-wrap"><span className="inner">VOCÊ <span className="gold">FORMOU</span></span></span>
          <span className="line-wrap"><span className="inner">PRA <span style={{ color: 'var(--red)' }}>ADVOGAR.</span></span></span>
          <span className="line-wrap"><span className="inner">NÃO PRA</span></span>
          <span className="line-wrap"><span className="inner">DATILOGRAR.</span></span>
        </h2>
        <div className="pain-grid">
          <div className="pain-card"><span className="pain-icon">⏰</span><div className="pain-title">HORAS PERDIDAS POR PETIÇÃO</div><p className="pain-desc">Cada petição consome de 2 a 6 horas do seu tempo. Multiplique por 20 casos ativos. Você passa mais tempo digitando do que estrategizando.</p><div className="pain-num">01</div></div>
          <div className="pain-card"><span className="pain-icon">💸</span><div class="pain-title">RECEITA TRAVADA NO TETO</div><p class="pain-desc">Sem automação, você tem um limite físico de casos. Mais clientes = mais estresse. O escritório cresce só se você contratar mais gente.</p><div class="pain-num">02</div></div>
          <div className="pain-card"><span class="pain-icon">😤</span><div class="pain-title">CONCORRÊNCIA USANDO IA</div><p class="pain-desc">Enquanto você digita, os escritórios que adotaram automação já entregaram 5 petições. O mercado não espera os que resistem à tecnologia.</p><div class="pain-num">03</div></div>
          <div className="pain-card"><span class="pain-icon">🔁</span><div class="pain-title">TRABALHO REPETITIVO SEM FIM</div><p class="pain-desc">A mesma estrutura, os mesmos campos, as mesmas cláusulas — todo dia, todo caso. Seu talento jurídico desperdiçado em trabalho mecânico.</p><div class="pain-num">04</div></div>
        </div>
        <p className="pain-statement"><span className="gold">"A justiça é cega,</span><br />mas o mercado não perdoa<br /><span className="gold">os lentos."</span></p>
      </section>

      {/* SOLUTION */}
      <div className="solution-stmt">
        <p className="big">
          <span className="line-wrap"><span className="inner">APRESENTAMOS</span></span>
          <span className="line-wrap"><span className="inner gold">A SOLUÇÃO.</span></span>
        </p>
        <p>Três passos. Zero código. Setup em 24 horas. Petições automáticas para sempre.</p>
      </div>

      <section className="sect" id="features">
        <div className="section-label">// COMO FUNCIONA</div>
        <div className="features-grid">
          <div className="feature-card"><span className="feature-icon">🎙️</span><div className="feature-title">ENTREVISTA INTELIGENTE</div><p className="feature-desc">O cliente responde perguntas via WhatsApp ou formulário. A IA processa tudo automaticamente, sem precisar de você presente.</p><div className="feature-num">01</div></div>
          <div className="feature-card"><span className="feature-icon">⚡</span><div className="feature-title">GERAÇÃO AUTOMÁTICA</div><p className="feature-desc">GPT-4 treinado no seu estilo jurídico transforma as respostas em petição inicial estruturada, com EMENTA, fundamentação e pedidos.</p><div className="feature-num">02</div></div>
          <div className="feature-card"><span className="feature-icon">📄</span><div className="feature-title">DOCUMENTO NO SEU EMAIL</div><p className="feature-desc">A petição chega em .docx diretamente no seu Gmail, pronta para revisão e protocolo. Tudo automatizado.</p><div className="feature-num">03</div></div>
          <div className="feature-card"><span className="feature-icon">🔄</span><div className="feature-title">MELHORIA CONTÍNUA</div><p className="feature-desc">O sistema aprende com seus feedbacks. Com o tempo, as petições ficam mais alinhadas com seu estilo e área de atuação.</p><div className="feature-num">04</div></div>
          <div className="feature-card"><span className="feature-icon">📱</span><div className="feature-title">100% REMOTO</div><p className="feature-desc">Gerencie tudo pelo celular. Acompanhe cada petição gerada, revise e aprove sem precisar estar no escritório.</p><div className="feature-num">05</div></div>
          <div className="feature-card"><span className="feature-icon">🔒</span><div className="feature-title">SEGURANÇA TOTAL</div><p className="feature-desc">Dados com criptografia de ponta. Compliance total com LGPD. Seus clientes e casos ficam 100% seguros.</p><div className="feature-num">06</div></div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="sect">
        <div className="section-label">// ADVOGADOS QUE JÁ DOMINAM</div>
        <div className="social-numbers">
          <div className="sn-cell"><div className="sn-number" data-target="147" data-suffix="">0</div><div className="sn-label">Advogados Ativos</div></div>
          <div className="sn-cell"><div className="sn-number" data-target="12" data-suffix="k+">0k+</div><div className="sn-label">Petições Geradas</div></div>
          <div className="sn-cell"><div className="sn-number" data-target="97" data-suffix="%">0%</div><div className="sn-label">Taxa de Aprovação</div></div>
        </div>
        <div className="testimonials-grid">
          {[
            { initial: 'KM', name: 'Dr. Kleber M.', role: 'Direito Trabalhista · OAB/SP', text: '"Reduzi o tempo de elaboração de petições em mais de 80%. Consigo atender o dobro de clientes sem contratar mais ninguém."' },
            { initial: 'AS', name: 'Dra. Amanda S.', role: 'Direito Civil · OAB/RJ', text: '"A automação de newsletter me trouxe 12 novos clientes no primeiro mês. O investimento se pagou na primeira semana."' },
            { initial: 'RC', name: 'Dr. Ricardo C.', role: 'Direito Empresarial · OAB/MG', text: '"Parecia ficção científica. Agora é realidade no meu escritório. A IA gera petições de altíssima qualidade, no meu estilo."' }
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="quote-mark" aria-hidden="true">"</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initial}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="trust-bar">
          {['OAB/SP', 'OAB/RJ', 'OAB/MG', 'OAB/PR', 'OAB/RS', 'OAB/SC', 'OAB/BA', 'OAB/GO'].map(oab => (
            <span key={oab} className="trust-item">{oab}</span>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <div className="pricing-section" id="pricing">
        <div className="section-label" style={{ maxWidth: '880px', margin: '0 auto 22px' }}>// ESCOLHA SEU PLANO</div>
        <h2>ACESSO <span className="gold">TOTAL.</span><br />RESULTADO <span className="gold">REAL.</span></h2>
        <p className="sub">Sem contrato. Sem surpresas. Sem desculpa para continuar lento.</p>

        <div className="cards-wrap">
          <div className="plan-card elite">
            <div className="savings-badge">⚡ MELHOR VALOR — ECONOMIZE R$ 297</div>
            <div className="plan-badge badge-elite">★ ACESSO ELITE</div>
            <div className="plan-name">12 MESES</div>
            <div className="plan-price">R$ 1.497</div>
            <div className="plan-price-label">pagamento único · 12 meses de acesso total</div>
            <div className="bonus-box">
              <div className="bonus-label">🎁 BÔNUS EXCLUSIVO INCLUSO</div>
              <div className="bonus-value">+ R$ 1.500,00</div>
              <div className="bonus-desc">Automação de Newsletter Jurídica completa — captação de leads + envio automático.<br /><strong style={{ color: 'var(--gold)' }}>Valor real: R$ 1.500 — GRÁTIS no plano 12M.</strong></div>
            </div>
            <div className="comparison-row highlight"><span>Valor total dos serviços:</span><span>R$ 2.997,00</span></div>
            <div className="comparison-row"><span>Você paga apenas:</span><span style={{ color: 'var(--white)' }}>R$ 1.497,00</span></div>
            <div className="comparison-row highlight"><span>Sua economia:</span><span>R$ 1.500,00</span></div>
            <ul className="plan-features-list" style={{ marginTop: '18px' }}>
              <li><span className="check">✓</span>Automação de Petições Iniciais</li>
              <li><span className="check">✓</span><strong style={{ color: 'var(--gold)' }}>Newsletter Jurídica Automatizada (R$ 1.500)</strong></li>
              <li><span className="check">✓</span>12 meses de acesso completo</li>
              <li><span className="check">✓</span>Atualizações prioritárias</li>
              <li><span className="check">✓</span>Suporte VIP dedicado</li>
              <li><span className="check">✓</span>Relatórios mensais de performance</li>
            </ul>
            <button className="plan-cta cta-elite" onClick={() => openCheckout('elite')}>GARANTIR PLANO ELITE AGORA →</button>
          </div>

          <div className="plan-card">
            <div className="plan-badge badge-base">// ACESSO PADRÃO</div>
            <div className="plan-name">6 MESES</div>
            <div className="plan-price">R$ 897</div>
            <div className="plan-price-label">pagamento único · 6 meses de acesso</div>
            <ul className="plan-features-list" style={{ marginTop: '22px' }}>
              <li><span className="check">✓</span>Automação de Petições Iniciais</li>
              <li><span className="check">✓</span>GPT-4 treinado na sua área</li>
              <li><span className="check">✓</span>Geração de .docx automática</li>
              <li><span className="check">✓</span>Suporte via WhatsApp</li>
              <li><span className="check">✓</span>Atualizações incluídas</li>
            </ul>
            <button className="plan-cta cta-base" onClick={() => openCheckout('base')}>COMEÇAR COM 6 MESES →</button>
          </div>
        </div>

        <div className="guarantee-row">
          <div className="guarantee-icon">🛡️</div>
          <div style={{ textAlign: 'left' }}>
            <div className="guarantee-title">Garantia de Satisfação</div>
            <div className="guarantee-sub">Se nos primeiros 7 dias você não estiver satisfeito, devolvemos 100% do valor. Sem burocracia.</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="sect">
        <div className="section-label">// PERGUNTAS FREQUENTES</div>
        {[
          { q: 'O sistema funciona para qualquer área do direito?', a: 'Sim. A IA é treinada especificamente na sua área durante o setup. Trabalhista, civil, empresarial, família — qualquer especialidade.' },
          { q: 'Preciso saber programar para usar?', a: 'Absolutamente não. Cuidamos de todo o setup técnico. Você só usa o WhatsApp e o Gmail normalmente — o sistema roda nos bastidores.' },
          { q: 'Como funciona a Automação de Newsletter (bônus do plano 12M)?', a: 'Configuramos captação de leads + envio automático de newsletters jurídicas periódicas — posicionando você como referência na sua área e gerando clientes passivamente.' },
          { q: 'Quanto tempo leva para tudo funcionar?', a: 'Setup completo em até 24-48h após confirmação do pagamento. Você começa a gerar petições automatizadas no mesmo dia.' },
          { q: 'Qual a diferença real entre o plano 6 e 12 meses?', a: 'Além do dobro do tempo, o plano 12M inclui a Automação de Newsletter (R$ 1.500) grátis, suporte VIP e relatórios mensais. Custo por mês bem menor.' },
          { q: 'Consigo parcelar no cartão de crédito?', a: 'Sim. Parcelamos em até 12x sem juros no cartão de crédito. Você escolhe no momento do checkout.' }
        ].map((item, i) => (
          <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-question">
              <span>{item.q}</span>
              <span className="faq-icon">{openFaq === i ? '✕' : '+'}</span>
            </div>
            <div className="faq-answer">{item.a}</div>
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <div className="final-cta" id="contact">
        <div className="final-cta-bg"></div>
        <h2>
          <span className="line-wrap"><span className="inner"><span className="gold">CHEGA</span></span></span>
          <span className="line-wrap"><span className="inner">DE SER</span></span>
          <span className="line-wrap"><span className="inner"><span className="gold">LENTO.</span></span></span>
        </h2>
        <p className="final-cta-sub">O mercado jurídico está se transformando agora. Os advogados que adotarem IA primeiro vão dominar os próximos 10 anos.</p>
        <button className="btn-primary" onClick={() => openCheckout('elite')}>⚡ GARANTIR PLANO ELITE — R$ 1.497</button>
        <p className="final-note">VAGAS LIMITADAS · SETUP EM 24H · BÔNUS R$ 1.500 INCLUSO</p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">PETIÇÃO.AI</div>
        <div className="footer-copy">© 2025 Nova AI Solutions · Todos os direitos reservados<br />Desenvolvido para advogados brasileiros</div>
      </footer>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} planKey={selectedPlan} />
    </div>
  );
}
