import './style.css';

// Flag de configuración: 'true' para activar Mimo (Three.js), 'false' para máxima velocidad
const MIMO_ENABLED = import.meta.env.VITE_MIMO_ENABLED === 'true';

async function initApp() {
  // 1. Control de Mimo 3D según flag de configuración
  if (MIMO_ENABLED) {
    document.body.classList.remove('mimo-off');
    try {
      const { mountScene } = await import('./scenes.js');
      mountScene('mimo');
    } catch (err) {
      console.warn('No se pudo cargar la escena 3D:', err);
    }
  } else {
    document.body.classList.add('mimo-off');
    const hero = document.getElementById('hero');
    if (hero) hero.classList.remove('mimo');
    const visual = document.getElementById('visual');
    if (visual) visual.style.display = 'none';
  }

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

  // 3. Sistema Completo de Carrito y Bolsa de Compras con Persistencia
  const CART_STORAGE_KEY = 'majokacin_cart_items_v1';
  let cart = [];

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('No se pudo restaurar el carrito desde localStorage:', err);
    cart = [];
  }

  const cartBadge = document.getElementById('cartBadge');
  const floatingCartBadge = document.getElementById('floatingCartBadge');
  const headerCartBtn = document.getElementById('headerCartBtn');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  // Elementos del Modal de Bolsa de Compras
  const cartModal = document.getElementById('cartModal');
  const btnCloseCartModal = document.getElementById('btnCloseCartModal');
  const cartModalBackdrop = document.getElementById('cartModalBackdrop');
  const cartModalTitle = document.getElementById('cartModalTitle');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const btnEmptyShop = document.getElementById('btnEmptyShop');
  const btnCartContinue = document.getElementById('btnCartContinue');
  const btnCartWhatsApp = document.getElementById('btnCartWhatsApp');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function getCartTotalCount() {
    return cart.reduce((total, item) => total + (item.qty || 0), 0);
  }

  function getCartTotalPrice() {
    return cart.reduce((total, item) => total + (item.price * (item.qty || 1)), 0);
  }

  function updateCartBadges() {
    const count = getCartTotalCount();
    [cartBadge, floatingCartBadge].forEach(badge => {
      if (badge) {
        badge.textContent = count;
        badge.style.transform = 'scale(1.35)';
        setTimeout(() => {
          badge.style.transform = 'scale(1)';
        }, 220);
      }
    });
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('Error al guardar en localStorage:', err);
    }
    updateCartBadges();
  }

  function addItemToCart(itemData, qty = 1) {
    const existingIndex = cart.findIndex(i => i.name === itemData.name);
    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        name: itemData.name,
        price: itemData.price,
        image: itemData.image || '',
        category: itemData.category || '',
        qty: qty
      });
    }
    saveCart();
    showToast(`✨ ${qty > 1 ? qty + 'x ' : ''}«${itemData.name}» añadido a tu bolsa.`);
    if (cartModal && !cartModal.hasAttribute('hidden')) {
      renderCartModal();
    }
  }

  function updateItemQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    renderCartModal();
  }

  function removeItemFromCart(index) {
    if (!cart[index]) return;
    const removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    renderCartModal();
    showToast(`🗑️ «${removedName}» eliminado de tu bolsa.`);
  }

  // Renderizado dinámico del modal de bolsa
  function renderCartModal() {
    const totalCount = getCartTotalCount();
    const totalPrice = getCartTotalPrice();

    // Título según requerimiento: BOLSA DE COMPRAS ( # artículos)
    if (cartModalTitle) {
      const label = totalCount === 1 ? '1 artículo' : `${totalCount} artículos`;
      cartModalTitle.textContent = `BOLSA DE COMPRAS (${label})`;
    }

    // Precio total según requerimiento: formato 0.00 S/.
    if (cartTotalAmount) {
      cartTotalAmount.textContent = `${totalPrice.toFixed(2)} S/.`;
    }

    // Estado vacío o listado
    if (cart.length === 0) {
      if (cartEmptyState) cartEmptyState.style.display = 'flex';
      if (cartItemsList) cartItemsList.style.display = 'none';
      if (btnCartWhatsApp) {
        btnCartWhatsApp.disabled = true;
      }
    } else {
      if (cartEmptyState) cartEmptyState.style.display = 'none';
      if (cartItemsList) {
        cartItemsList.style.display = 'flex';
        cartItemsList.innerHTML = '';

        cart.forEach((item, index) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.innerHTML = `
            <img src="${item.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80'}" alt="${item.name}" class="cart-item-img" loading="lazy" />
            <div class="cart-item-details">
              <div class="cart-item-header">
                <h4 class="cart-item-name">${item.name}</h4>
                <button type="button" class="btn-remove-item" data-index="${index}" aria-label="Eliminar ${item.name} de la bolsa">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div class="cart-item-pricing">
                <span class="cart-item-unit-price">S/ ${item.price.toFixed(2)} c/u</span>
              </div>
              <div class="cart-item-footer">
                <div class="cart-qty-stepper" aria-label="Selector de cantidad para ${item.name}">
                  <button type="button" class="btn-cart-qty btn-cart-minus" data-index="${index}" aria-label="Restar una unidad">−</button>
                  <span class="cart-qty-value">${item.qty}</span>
                  <button type="button" class="btn-cart-qty btn-cart-plus" data-index="${index}" aria-label="Sumar una unidad">+</button>
                </div>
                <div class="cart-item-subtotal">
                  <span class="cart-subtotal-label">Subtotal:</span>
                  <span class="cart-subtotal-val">S/ ${(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `;
          cartItemsList.appendChild(itemEl);
        });

        // Eventos en los controles de cada artículo
        cartItemsList.querySelectorAll('.btn-cart-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            updateItemQuantity(idx, -1);
          });
        });

        cartItemsList.querySelectorAll('.btn-cart-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            updateItemQuantity(idx, 1);
          });
        });

        cartItemsList.querySelectorAll('.btn-remove-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            removeItemFromCart(idx);
          });
        });
      }

      if (btnCartWhatsApp) {
        btnCartWhatsApp.disabled = false;
      }
    }
  }

  function openCartModal() {
    if (!cartModal) return;
    renderCartModal();
    cartModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCartModal() {
    if (!cartModal) return;
    cartModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function continueShopping() {
    closeCartModal();
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Generación del mensaje WhatsApp con formato cálido, íntimo y altamente efectivo
  function buildWhatsAppMessage() {
    if (cart.length === 0) return '';

    const lines = cart.map(item => {
      const unitLabel = item.qty === 1 ? '1 unidad' : `${item.qty} unidades`;
      const subtotalFormatted = (item.price * item.qty).toFixed(2);
      return `${unitLabel} x ${item.name} - S/ ${subtotalFormatted}`;
    });

    const total = getCartTotalPrice().toFixed(2);

    return [
      'Hola,',
      'Estos son los productos del catálogo majokacin que me gustaría solicitar:',
      '',
      ...lines,
      '',
      `Monto total aproximado: S/ ${total}`,
      '',
      '¿Me confirmas si puedes realizar el pedido?',
      'Muchas gracias'
    ].join('\n');
  }

  function sendCartToWhatsApp() {
    if (cart.length === 0) {
      showToast('🌸 Tu bolsa está vacía. Selecciona un producto para consultar.');
      return;
    }
    const message = buildWhatsAppMessage();
    const phone = '51918346202';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  // Escuchadores de apertura de la bolsa de compras
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', e => {
      e.preventDefault();
      openCartModal();
    });
  }

  if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', e => {
      e.preventDefault();
      openCartModal();
    });
  }

  if (btnCloseCartModal) btnCloseCartModal.addEventListener('click', closeCartModal);
  if (cartModalBackdrop) cartModalBackdrop.addEventListener('click', closeCartModal);
  if (btnCartContinue) btnCartContinue.addEventListener('click', continueShopping);
  if (btnEmptyShop) btnEmptyShop.addEventListener('click', continueShopping);
  if (btnCartWhatsApp) btnCartWhatsApp.addEventListener('click', sendCartToWhatsApp);

  // Inicializar badges desde datos guardados
  updateCartBadges();

  // Botón directo "Añadir a la bolsa" en las tarjetas
  const addCartButtons = document.querySelectorAll('.btn-add-cart');
  addCartButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const card = button.closest('.product-card');
      const name = button.getAttribute('data-name') || card?.getAttribute('data-name') || 'Producto';
      const price = parseFloat(button.getAttribute('data-price') || card?.getAttribute('data-price') || '34.00');
      const image = card?.querySelector('.product-img')?.src || '';
      const category = card?.getAttribute('data-category-label') || '';

      addItemToCart({ name, price, image, category }, 1);
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
    if (modalAddPrice) modalAddPrice.textContent = `S/ ${total}`;
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
    if (modalProductPrice) modalProductPrice.textContent = `S/ ${currentModalProduct.price.toFixed(2)}`;
    if (modalProductOriginalPrice) modalProductOriginalPrice.textContent = `S/ ${currentModalProduct.originalPrice.toFixed(2)}`;

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
      const mainImg = currentModalProduct.images && currentModalProduct.images.length > 0
        ? currentModalProduct.images[0]
        : '';
      addItemToCart({
        name: currentModalProduct.name,
        price: currentModalProduct.price,
        image: mainImg,
        category: currentModalProduct.category
      }, currentQty);
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
      if (cartModal && !cartModal.hasAttribute('hidden')) {
        closeCartModal();
      }
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
