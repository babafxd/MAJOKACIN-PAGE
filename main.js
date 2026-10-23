import './style.css';
import { mountScene } from './scenes.js';

function initApp() {
  // 1. Montar escena 3D interactiva de Mimo
  mountScene('mimo');

  // 2. Filtro interactivo de categorías de productos
  const filterButtons = document.querySelectorAll('.filter-pill');
  const productCards = document.querySelectorAll('.product-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Actualizar estado visual de los botones de filtro
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filtrar tarjetas con animación suave
      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // 3. Carrito y Notificación Toast Flotante
  let cartCount = 0;
  const cartBadge = document.getElementById('cartBadge');
  const floatingCartBadge = document.getElementById('floatingCartBadge');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function updateCartBadge(additionalCount = 1) {
    cartCount += additionalCount;
    [cartBadge, floatingCartBadge].forEach(badge => {
      if (badge) {
        badge.textContent = cartCount;
        badge.style.transform = 'scale(1.35)';
        setTimeout(() => {
          badge.style.transform = 'scale(1)';
        }, 220);
      }
    });
  }

  // Botón directo "Añadir a la bolsa" en las tarjetas
  const addCartButtons = document.querySelectorAll('.btn-add-cart');
  addCartButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation(); // Evitar abrir el modal si solo se desea comprar rápido
      const productName = button.getAttribute('data-name') || 'Producto';
      updateCartBadge(1);
      showToast(`✨ «${productName}» añadido a tu bolsa.`);
    });
  });

  // 4. Modal de Detalle de Producto con Galería de Imágenes
  const productModal = document.getElementById('productModal');
  const btnCloseProductModal = document.getElementById('btnCloseProductModal');
  const productModalBackdrop = document.getElementById('productModalBackdrop');
  const modalMainImg = document.getElementById('modalMainImg');
  const modalThumbsRow = document.getElementById('modalThumbsRow');
  const modalProductBadge = document.getElementById('modalProductBadge');
  const modalProductCategory = document.getElementById('modalProductCategory');
  const modalProductRating = document.getElementById('modalProductRating');
  const modalProductName = document.getElementById('modalProductName');
  const modalProductPrice = document.getElementById('modalProductPrice');
  const modalProductOriginalPrice = document.getElementById('modalProductOriginalPrice');
  const modalProductDiscount = document.getElementById('modalProductDiscount');
  const modalProductDesc = document.getElementById('modalProductDesc');
  const modalProductUsage = document.getElementById('modalProductUsage');
  const modalProductSkinType = document.getElementById('modalProductSkinType');
  const modalSizePills = document.getElementById('modalSizePills');
  const modalQtyDisplay = document.getElementById('modalQtyDisplay');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const btnModalAddBag = document.getElementById('btnModalAddBag');
  const modalAddPrice = document.getElementById('modalAddPrice');

  let currentModalProduct = null;
  let currentQty = 1;
  let currentUnitPrice = 34.00;

  function updateModalTotalPrice() {
    const total = (currentUnitPrice * currentQty).toFixed(2);
    if (modalAddPrice) modalAddPrice.textContent = `$${total}`;
  }

  function openProductModal(card) {
    if (!productModal || !card) return;

    currentModalProduct = {
      name: card.getAttribute('data-name') || '',
      category: card.getAttribute('data-category-label') || '',
      price: parseFloat(card.getAttribute('data-price') || '34.00'),
      originalPrice: parseFloat(card.getAttribute('data-original-price') || '45.00'),
      rating: card.getAttribute('data-rating') || '',
      badge: card.getAttribute('data-badge') || '',
      images: (card.getAttribute('data-images') || '').split('|'),
      desc: card.getAttribute('data-desc') || '',
      usage: card.getAttribute('data-usage') || '',
      skintype: card.getAttribute('data-skintype') || '',
      sizes: (card.getAttribute('data-sizes') || '').split('|')
    };

    currentQty = 1;
    currentUnitPrice = currentModalProduct.price;
    if (modalQtyDisplay) modalQtyDisplay.textContent = currentQty;

    // Llenar información textual
    if (modalProductName) modalProductName.textContent = currentModalProduct.name;
    if (modalProductCategory) modalProductCategory.textContent = currentModalProduct.category;
    if (modalProductRating) modalProductRating.textContent = currentModalProduct.rating;
    if (modalProductBadge) modalProductBadge.textContent = currentModalProduct.badge;
    if (modalProductPrice) modalProductPrice.textContent = `$${currentModalProduct.price.toFixed(2)}`;
    if (modalProductOriginalPrice) modalProductOriginalPrice.textContent = `$${currentModalProduct.originalPrice.toFixed(2)}`;

    // Calcular descuento porcentual
    if (modalProductDiscount && currentModalProduct.originalPrice > currentModalProduct.price) {
      const discount = Math.round(((currentModalProduct.originalPrice - currentModalProduct.price) / currentModalProduct.originalPrice) * 100);
      modalProductDiscount.textContent = `-${discount}%`;
      modalProductDiscount.style.display = 'inline-block';
    } else if (modalProductDiscount) {
      modalProductDiscount.style.display = 'none';
    }

    if (modalProductDesc) modalProductDesc.textContent = currentModalProduct.desc;
    if (modalProductUsage) modalProductUsage.textContent = currentModalProduct.usage;
    if (modalProductSkinType) modalProductSkinType.textContent = currentModalProduct.skintype;

    // Llenar galería de imágenes
    const images = currentModalProduct.images;
    if (images.length > 0 && modalMainImg) {
      modalMainImg.src = images[0];
    }

    if (modalThumbsRow) {
      modalThumbsRow.innerHTML = '';
      images.forEach((imgUrl, index) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = `modal-thumb-btn ${index === 0 ? 'active' : ''}`;
        thumbBtn.setAttribute('aria-label', `Ver imagen ${index + 1}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = imgUrl;
        thumbImg.alt = `${currentModalProduct.name} vista ${index + 1}`;
        thumbBtn.appendChild(thumbImg);

        thumbBtn.addEventListener('click', () => {
          modalThumbsRow.querySelectorAll('.modal-thumb-btn').forEach(b => b.classList.remove('active'));
          thumbBtn.classList.add('active');
          if (modalMainImg) {
            modalMainImg.style.opacity = '0.5';
            setTimeout(() => {
              modalMainImg.src = imgUrl;
              modalMainImg.style.opacity = '1';
            }, 120);
          }
        });

        modalThumbsRow.appendChild(thumbBtn);
      });
    }

    // Llenar selector de presentaciones/tamaños
    if (modalSizePills) {
      modalSizePills.innerHTML = '';
      currentModalProduct.sizes.forEach((sizeText, i) => {
        if (!sizeText) return;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `size-pill ${i === 0 ? 'active' : ''}`;
        pill.textContent = sizeText;

        pill.addEventListener('click', () => {
          modalSizePills.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        });

        modalSizePills.appendChild(pill);
      });
    }

    updateModalTotalPrice();

    // Mostrar modal
    productModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // Eventos de stepper de cantidad
  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        if (modalQtyDisplay) modalQtyDisplay.textContent = currentQty;
        updateModalTotalPrice();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      if (currentQty < 20) {
        currentQty++;
        if (modalQtyDisplay) modalQtyDisplay.textContent = currentQty;
        updateModalTotalPrice();
      }
    });
  }

  // Botón "Añadir a la bolsa" dentro del modal
  if (btnModalAddBag) {
    btnModalAddBag.addEventListener('click', () => {
      if (!currentModalProduct) return;
      updateCartBadge(currentQty);
      showToast(`✨ ${currentQty}x «${currentModalProduct.name}» añadido a tu bolsa.`);
      closeProductModal();
    });
  }

  // Asignar clic en cada tarjeta de producto para abrir modal
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      openProductModal(card);
    });

    const quickViewBtn = card.querySelector('.btn-quick-view');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', e => {
        e.stopPropagation();
        openProductModal(card);
      });
    }
  });

  if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
  if (productModalBackdrop) productModalBackdrop.addEventListener('click', closeProductModal);

  // 5. Modal de Novedades (Videos & Tips)
  const videoModal = document.getElementById('videoModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const modalVideoPoster = document.getElementById('modalVideoPoster');
  const modalVideoCategory = document.getElementById('modalVideoCategory');
  const modalVideoDuration = document.getElementById('modalVideoDuration');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoDesc = document.getElementById('modalVideoDesc');
  const modalTipsList = document.getElementById('modalTipsList');
  const playerPlayBtn = document.getElementById('playerPlayBtn');
  const timelineProgress = document.getElementById('timelineProgress');
  const totalTimeEl = document.getElementById('totalTime');
  const currentTimeEl = document.getElementById('currentTime');

  let isPlaying = false;
  let playbackTimer = null;
  let currentProgressPercent = 30;

  function openVideoModal(card) {
    if (!videoModal || !card) return;

    const title = card.getAttribute('data-title') || '';
    const tag = card.getAttribute('data-tag') || '';
    const duration = card.getAttribute('data-duration') || '2:30 min';
    const desc = card.getAttribute('data-desc') || '';
    const tipsRaw = card.getAttribute('data-tips') || '';
    const imgEl = card.querySelector('.video-thumb');
    const imgSrc = imgEl ? imgEl.src : '';

    if (modalVideoTitle) modalVideoTitle.textContent = title;
    if (modalVideoCategory) modalVideoCategory.textContent = tag;
    if (modalVideoDuration) modalVideoDuration.textContent = duration;
    if (totalTimeEl) totalTimeEl.textContent = duration.replace(' min', '');
    if (modalVideoDesc) modalVideoDesc.textContent = desc;
    if (modalVideoPoster) modalVideoPoster.src = imgSrc;

    // Renderizar lista de tips
    if (modalTipsList) {
      modalTipsList.innerHTML = '';
      if (tipsRaw) {
        const tips = tipsRaw.split('|');
        tips.forEach(tip => {
          const li = document.createElement('li');
          li.textContent = tip;
          modalTipsList.appendChild(li);
        });
      }
    }

    // Resetear reproductor simulado
    isPlaying = true;
    currentProgressPercent = 20;
    updatePlayBtnState();
    startProgressSimulation();

    // Mostrar modal
    videoModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    stopProgressSimulation();
  }

  function updatePlayBtnState() {
    if (!playerPlayBtn) return;
    playerPlayBtn.innerHTML = isPlaying
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  }

  function startProgressSimulation() {
    stopProgressSimulation();
    playbackTimer = setInterval(() => {
      if (!isPlaying) return;
      currentProgressPercent += 0.8;
      if (currentProgressPercent >= 100) {
        currentProgressPercent = 0;
      }
      if (timelineProgress) {
        timelineProgress.style.width = `${currentProgressPercent}%`;
      }
      if (currentTimeEl) {
        const totalSeconds = 160;
        const currentSec = Math.floor((currentProgressPercent / 100) * totalSeconds);
        const mins = Math.floor(currentSec / 60);
        const secs = currentSec % 60;
        currentTimeEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 300);
  }

  function stopProgressSimulation() {
    if (playbackTimer) {
      clearInterval(playbackTimer);
      playbackTimer = null;
    }
  }

  if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updatePlayBtnState();
    });
  }

  // Asignar eventos de apertura de modal a las tarjetas de video
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    const playTrigger = card.querySelector('.btn-play-trigger');
    const viewBtn = card.querySelector('.btn-view-video');

    if (playTrigger) {
      playTrigger.addEventListener('click', e => {
        e.stopPropagation();
        openVideoModal(card);
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', e => {
        e.stopPropagation();
        openVideoModal(card);
      });
    }

    card.addEventListener('click', () => {
      openVideoModal(card);
    });
  });

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeVideoModal);
  if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);

  // Cerrar con Escape cualquiera de los modales abiertos
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (productModal && !productModal.hasAttribute('hidden')) {
        closeProductModal();
      }
      if (videoModal && !videoModal.hasAttribute('hidden')) {
        closeVideoModal();
      }
    }
  });

  // Cerrar modal de video al hacer clic en el enlace interno de recomendados
  const btnModalCta = document.getElementById('btnModalCta');
  if (btnModalCta) {
    btnModalCta.addEventListener('click', () => {
      closeVideoModal();
    });
  }

  // 6. Formulario de Contacto Interactivo
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');
      const consentInput = document.getElementById('contactConsent');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      const consent = consentInput ? consentInput.checked : false;

      // Validación básica
      if (!name || !email || !message) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Por favor completa todos los campos requeridos.';
        return;
      }

      if (!consent) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Por favor acepta la casilla de consentimiento para continuar.';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Por favor ingresa un correo electrónico válido.';
        return;
      }

      // Éxito
      formFeedback.className = 'form-feedback success';
      formFeedback.innerHTML = `¡Gracias, <strong>${name}</strong>! Hemos recibido tu consulta con cariño. Una especialista de <em>Majokacin</em> te responderá a <strong>${email}</strong> en menos de 24 horas.`;

      contactForm.reset();
      showToast('💌 Mensaje enviado con éxito a Majokacin.');
    });
  }

  // 7. Navegación Flotante Elegante, ScrollSpy y Volver Arriba
  const floatingNav = document.getElementById('floatingNav');
  const floatingMenuToggle = document.getElementById('floatingMenuToggle');
  const floatingDrawer = document.getElementById('floatingDrawer');
  const btnBackToTop = document.getElementById('btnBackToTop');

  // Toggle menú móvil desplegable
  if (floatingMenuToggle && floatingDrawer) {
    floatingMenuToggle.addEventListener('click', () => {
      const isOpen = floatingDrawer.classList.toggle('is-open');
      floatingMenuToggle.classList.toggle('is-open', isOpen);
      floatingMenuToggle.setAttribute('aria-expanded', String(isOpen));
      floatingDrawer.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  // Cerrar menú al hacer clic en cualquier enlace del drawer
  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (floatingDrawer && floatingMenuToggle) {
        floatingDrawer.classList.remove('is-open');
        floatingMenuToggle.classList.remove('is-open');
        floatingMenuToggle.setAttribute('aria-expanded', 'false');
        floatingDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // ScrollSpy: Detección elegante de sección activa
  const trackedSections = [
    { id: 'hero', element: document.getElementById('hero') },
    { id: 'productos', element: document.getElementById('productos') },
    { id: 'catalogos', element: document.getElementById('catalogos') },
    { id: 'novedades', element: document.getElementById('novedades') },
    { id: 'contacto', element: document.getElementById('contacto') }
  ].filter(item => item.element !== null);

  const floatingLinks = document.querySelectorAll('.floating-link');

  function updateActiveNav(activeId) {
    floatingLinks.forEach(link => {
      const target = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
      if (target === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    drawerLinks.forEach(link => {
      const target = link.getAttribute('href')?.replace('#', '');
      if (target === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Control suave al hacer scroll
  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;

        // Mostrar / ocultar barra flotante
        if (floatingNav) {
          if (scrollY > 140) {
            floatingNav.classList.add('is-visible');
          } else {
            floatingNav.classList.remove('is-visible');
            if (floatingDrawer && floatingMenuToggle) {
              floatingDrawer.classList.remove('is-open');
              floatingMenuToggle.classList.remove('is-open');
              floatingMenuToggle.setAttribute('aria-expanded', 'false');
              floatingDrawer.setAttribute('aria-hidden', 'true');
            }
          }
        }

        // Mostrar / ocultar botón "Volver arriba"
        if (btnBackToTop) {
          if (scrollY > 380) {
            btnBackToTop.classList.add('is-visible');
          } else {
            btnBackToTop.classList.remove('is-visible');
          }
        }

        // Detectar sección visible para ScrollSpy
        const scrollPosition = scrollY + 160;
        let currentSectionId = '';
        for (let i = trackedSections.length - 1; i >= 0; i--) {
          const item = trackedSections[i];
          if (item.element.offsetTop <= scrollPosition) {
            currentSectionId = item.id;
            break;
          }
        }
        if (currentSectionId) {
          updateActiveNav(currentSectionId);
        }

        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  // Botón Volver arriba con transición suave
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 8. Transiciones de Entrada Relajantes (Scroll Reveal)
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll(
    '.section-header, .novedades-intro, .product-card, .catalogo-card, .video-card, .contact-card, .contact-info, .relax-zen-divider'
  );

  if (!isReducedMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-animate');

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      if (el.classList.contains('product-card') || el.classList.contains('catalogo-card') || el.classList.contains('video-card')) {
        el.style.transitionDelay = `${(index % 4) * 0.08}s`;
      }
      revealObserver.observe(el);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
