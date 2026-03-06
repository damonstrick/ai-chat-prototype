(function () {
  'use strict';

  var DEMO_PROMPT = 'How much does it cost to have a baby at UCLA?';

  var chatContainer = document.getElementById('chatContainer');
  var chatWelcome = document.getElementById('chatWelcome');
  var chatWelcomeAnthropic = document.getElementById('chatWelcomeAnthropic');
  var inputField = document.getElementById('inputField');
  var inputFieldAnthropic = document.getElementById('inputFieldAnthropic');
  var inputSuggestion = document.getElementById('inputSuggestion');
  var drawerOverlay = document.getElementById('drawerOverlay');
  var drawerPanel = document.getElementById('drawerPanel') || (drawerOverlay && drawerOverlay.querySelector('.drawer-panel'));
  var drawerClose = document.getElementById('drawerClose');
  var drawerBodyCards = document.getElementById('drawerBodyCards');
  var drawerLoading = document.getElementById('drawerLoading');
  var drawerLoadingVideo = document.getElementById('drawerLoadingVideo');
  var drawerApplyBtn = document.getElementById('drawerApplyBtn');
  var drawerCancelBtn = document.getElementById('drawerCancelBtn');
  var drawerConfirmEstimateBtn = document.getElementById('drawerConfirmEstimateBtn');
  var drawerBenefitsBreakdown = document.getElementById('drawerBenefitsBreakdown');
  var drawerBenefitsBreakdownToggle = document.getElementById('drawerBenefitsBreakdownToggle');
  var headerMenuBtn = document.getElementById('headerMenuBtn');
  var navMenuOverlay = document.getElementById('navMenuOverlay');
  var navMenuClose = document.getElementById('navMenuClose');

  var lastFocusedBeforeDrawer = null;
  var AUDIO_ICON = 'assets/audio-icon.png';
  var SEND_ICON = 'assets/send-icon.png';

  function isAnthropicFlow() {
    return phoneFrame && phoneFrame.classList.contains('flow-anthropic');
  }

  function getActiveInputField() {
    return isAnthropicFlow() && inputFieldAnthropic ? inputFieldAnthropic : inputField;
  }

  function getActiveSubmitBtn() {
    return isAnthropicFlow() ? document.getElementById('submitIconBtnAnthropic') : document.getElementById('submitIconBtn');
  }

  function updateSubmitIcon() {
    var btn = getActiveSubmitBtn();
    var field = getActiveInputField();
    var submitImg = btn && btn.querySelector('.input-btn-icon-img');
    if (!submitImg || !field) return;
    var hasText = (field.value || '').trim().length > 0;
    submitImg.src = hasText ? SEND_ICON : AUDIO_ICON;
  }

  function resizeInput() {
    var field = getActiveInputField();
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = Math.max(24, field.scrollHeight) + 'px';
  }

  function updateSuggestionVisibility() {
    if (!inputSuggestion) return;
    var field = getActiveInputField();
    var val = (field && field.value || '').trim();
    var hasMessages = chatContainer && chatContainer.querySelectorAll('.message').length > 0;
    var flow = document.body.getAttribute('data-flow');
    var isFlow1 = flow === 'generic-1';
    var isFlow2 = flow === 'generic-2';
    var show = val.length === 0 && (!isAnthropicFlow() || !hasMessages) && !isFlow1 && !isFlow2;
    inputSuggestion.classList.toggle('is-hidden', !show);
  }

  var autocompleteBubbleFlow1 = document.getElementById('autocompleteBubbleFlow1');
  var autocompleteBubbleFlow1Second = document.getElementById('autocompleteBubbleFlow1Second');
  var autocompleteBubbleFlow1Third = document.getElementById('autocompleteBubbleFlow1Third');
  var autocompleteBubbleFlow1Fourth = document.getElementById('autocompleteBubbleFlow1Fourth');
  function updateAutocompleteBubbleVisibility() {
    var flow = document.body.getAttribute('data-flow');
    var field = getActiveInputField();
    var val = (field && field.value || '').trim();
    var messages = chatContainer ? chatContainer.querySelectorAll('.message') : [];
    var userCount = chatContainer ? chatContainer.querySelectorAll('.message.user').length : 0;
    var assistantCount = chatContainer ? chatContainer.querySelectorAll('.message.assistant').length : 0;
    var hasMessages = messages.length > 0;
    var exactlyOneExchange = userCount === 1 && assistantCount === 1;
    var exactlyTwoExchanges = userCount === 2 && assistantCount === 2;
    var exactlyThreeExchanges = userCount === 3 && assistantCount === 3;
    if (autocompleteBubbleFlow1) {
      var showFirst = flow === 'generic-1' && val.length === 0 && !hasMessages;
      autocompleteBubbleFlow1.classList.toggle('is-hidden', !showFirst);
    }
    if (autocompleteBubbleFlow1Second) {
      var showSecond = flow === 'generic-1' && val.length === 0 && exactlyOneExchange;
      autocompleteBubbleFlow1Second.classList.toggle('is-visible', showSecond);
      autocompleteBubbleFlow1Second.classList.toggle('is-hidden', !showSecond);
    }
    if (autocompleteBubbleFlow1Third) {
      var showThird = flow === 'generic-1' && val.length === 0 && exactlyTwoExchanges;
      autocompleteBubbleFlow1Third.classList.toggle('is-visible', showThird);
      autocompleteBubbleFlow1Third.classList.toggle('is-hidden', !showThird);
    }
    if (autocompleteBubbleFlow1Fourth) {
      var showFourth = flow === 'generic-1' && val.length === 0 && exactlyThreeExchanges;
      autocompleteBubbleFlow1Fourth.classList.toggle('is-visible', showFourth);
      autocompleteBubbleFlow1Fourth.classList.toggle('is-hidden', !showFourth);
    }
    var autocompleteBubbleFlow2 = document.getElementById('autocompleteBubbleFlow2');
    if (autocompleteBubbleFlow2) {
      var showFlow2 = flow === 'generic-2' && val.length === 0 && !hasMessages;
      autocompleteBubbleFlow2.classList.toggle('is-visible', showFlow2);
      autocompleteBubbleFlow2.classList.toggle('is-hidden', !showFlow2);
    }
    var autocompleteBubbleFlow2Second = document.getElementById('autocompleteBubbleFlow2Second');
    if (autocompleteBubbleFlow2Second) {
      var showFlow2Second = flow === 'generic-2' && val.length === 0 && exactlyOneExchange;
      autocompleteBubbleFlow2Second.classList.toggle('is-visible', showFlow2Second);
      autocompleteBubbleFlow2Second.classList.toggle('is-hidden', !showFlow2Second);
    }
  }

  function updateWelcomeVisibility() {
    var welcomeEl = isAnthropicFlow() ? chatWelcomeAnthropic : chatWelcome;
    if (!welcomeEl) return;
    var field = getActiveInputField();
    var hasInput = (field && field.value || '').trim().length > 0;
    var hasMessages = chatContainer.querySelectorAll('.message').length > 0;
    welcomeEl.classList.toggle('is-faded', hasInput || hasMessages);
    welcomeEl.setAttribute('aria-hidden', hasInput || hasMessages ? 'true' : 'false');
  }

  function bindInputEvents(field) {
    if (!field) return;
    field.addEventListener('input', function () {
      resizeInput();
      updateSuggestionVisibility();
      updateAutocompleteBubbleVisibility();
      updateSubmitIcon();
      updateWelcomeVisibility();
    });
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  bindInputEvents(inputField);
  bindInputEvents(inputFieldAnthropic);

  if (inputSuggestion) {
    inputSuggestion.addEventListener('click', function () {
      var field = getActiveInputField();
      if (field) {
        field.value = DEMO_PROMPT;
        resizeInput();
        updateSuggestionVisibility();
        updateSubmitIcon();
        updateWelcomeVisibility();
        field.focus();
      }
    });
    inputSuggestion.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputSuggestion.click();
      }
    });
  }
  function bindAutocompleteBubble(bubbleEl) {
    if (!bubbleEl) return;
    bubbleEl.addEventListener('click', function () {
      var field = getActiveInputField();
      var text = this.getAttribute('data-suggestion') || this.textContent.trim();
      if (field) {
        field.value = text;
        resizeInput();
        updateSuggestionVisibility();
        updateAutocompleteBubbleVisibility();
        updateSubmitIcon();
        updateWelcomeVisibility();
        field.focus();
      }
    });
    bubbleEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bubbleEl.click();
      }
    });
  }
  if (autocompleteBubbleFlow1) bindAutocompleteBubble(autocompleteBubbleFlow1);
  if (autocompleteBubbleFlow1Second) bindAutocompleteBubble(autocompleteBubbleFlow1Second);
  if (autocompleteBubbleFlow1Third) bindAutocompleteBubble(autocompleteBubbleFlow1Third);
  if (autocompleteBubbleFlow1Fourth) bindAutocompleteBubble(autocompleteBubbleFlow1Fourth);
  var autocompleteBubbleFlow2 = document.getElementById('autocompleteBubbleFlow2');
  if (autocompleteBubbleFlow2) bindAutocompleteBubble(autocompleteBubbleFlow2);
  var autocompleteBubbleFlow2Second = document.getElementById('autocompleteBubbleFlow2Second');
  if (autocompleteBubbleFlow2Second) bindAutocompleteBubble(autocompleteBubbleFlow2Second);
  if (inputSuggestion) updateSuggestionVisibility();
  if (autocompleteBubbleFlow1) updateAutocompleteBubbleVisibility();
  if (autocompleteBubbleFlow1Second) updateAutocompleteBubbleVisibility();
  if (autocompleteBubbleFlow1Third) updateAutocompleteBubbleVisibility();
  if (autocompleteBubbleFlow1Fourth) updateAutocompleteBubbleVisibility();

  function openNavMenu() {
    if (navMenuOverlay) {
      navMenuOverlay.classList.add('is-open');
      navMenuOverlay.setAttribute('aria-hidden', 'false');
      if (navMenuClose) navMenuClose.focus();
    }
  }
  function closeNavMenu() {
    if (navMenuOverlay) {
      navMenuOverlay.classList.remove('is-open');
      navMenuOverlay.setAttribute('aria-hidden', 'true');
    }
  }
  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', function () {
      openNavMenu();
    });
  }
  var headerMenuBtnAnthropic = document.getElementById('headerMenuBtnAnthropic');
  if (headerMenuBtnAnthropic) {
    headerMenuBtnAnthropic.addEventListener('click', function () {
      openNavMenu();
    });
  }
  if (navMenuClose) {
    navMenuClose.addEventListener('click', closeNavMenu);
  }
  if (navMenuOverlay) {
    navMenuOverlay.addEventListener('click', function (e) {
      if (e.target === navMenuOverlay) closeNavMenu();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenuOverlay && navMenuOverlay.classList.contains('is-open')) {
      closeNavMenu();
    }
  });

  var VALID_FLOWS = ['openai-1', 'openai-2', 'openai-3', 'anthropic-1', 'anthropic-2', 'anthropic-3', 'counsel-1', 'counsel-2', 'counsel-3', 'generic-1', 'generic-2', 'generic-3'];
  var DEFAULT_FLOW = 'generic-1';

  function getFlowFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var flow = params.get('flow');
    return flow && VALID_FLOWS.indexOf(flow) !== -1 ? flow : DEFAULT_FLOW;
  }

  var phoneFrame = document.getElementById('phoneFrame');

  function setFlowClass(flowId) {
    if (!phoneFrame) return;
    var prefix = flowId ? flowId.split('-')[0] : 'generic';
    var wasAnthropic = phoneFrame.classList.contains('flow-anthropic');
    var isAnthropic = prefix === 'anthropic';
    if (wasAnthropic !== isAnthropic && inputField && inputFieldAnthropic) {
      var v = (isAnthropic ? inputField : inputFieldAnthropic).value;
      (isAnthropic ? inputFieldAnthropic : inputField).value = v;
    }
    ['generic', 'anthropic', 'openai', 'counsel'].forEach(function (name) {
      phoneFrame.classList.toggle('flow-' + name, name === prefix);
    });
    document.body.setAttribute('data-flow', flowId || '');
    document.body.classList.toggle('flow-anthropic', isAnthropic);
    var headerGeneric = document.querySelector('.header-generic');
    var headerAnthropic = document.querySelector('.header-anthropic');
    if (headerGeneric) headerGeneric.setAttribute('aria-hidden', prefix === 'anthropic' ? 'true' : 'false');
    if (headerAnthropic) headerAnthropic.setAttribute('aria-hidden', prefix === 'anthropic' ? 'false' : 'true');
    var rowGeneric = document.getElementById('inputRow');
    var rowAnthropic = document.getElementById('inputRowAnthropic');
    if (rowAnthropic) rowAnthropic.setAttribute('aria-hidden', prefix !== 'anthropic' ? 'true' : 'false');
    if (chatWelcome) chatWelcome.setAttribute('aria-hidden', isAnthropic ? 'true' : 'false');
    if (chatWelcomeAnthropic) chatWelcomeAnthropic.setAttribute('aria-hidden', !isAnthropic ? 'true' : 'false');
    updateSubmitIcon();
    updateSuggestionVisibility();
    updateAutocompleteBubbleVisibility();
    updateWelcomeVisibility();
    var field = getActiveInputField();
    if (field) resizeInput();
  }

  function setActiveFlow(flowId) {
    document.querySelectorAll('.nav-menu-item').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-flow') === flowId);
    });
    setFlowClass(flowId);
  }

  function updateUrlForFlow(flowId) {
    var url = new URL(window.location.href);
    url.searchParams.set('flow', flowId);
    window.history.replaceState({ flow: flowId }, '', url.toString());
  }

  function initFlowFromUrl() {
    var flow = getFlowFromUrl();
    setActiveFlow(flow);
    updateUrlForFlow(flow);
  }

  initFlowFromUrl();
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.flow) setActiveFlow(e.state.flow);
    else initFlowFromUrl();
  });

  document.querySelectorAll('.nav-menu-item').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var flowId = this.getAttribute('data-flow');
      if (!flowId) return;
      if (this.classList.contains('is-active')) {
        closeNavMenu();
        return;
      }
      setActiveFlow(flowId);
      updateUrlForFlow(flowId);
      closeNavMenu();
    });
  });

  function createUserBubble(text) {
    var wrap = document.createElement('div');
    wrap.className = 'message user';
    wrap.innerHTML = '<div class="bubble user"><span class="user-text"></span></div>';
    wrap.querySelector('.user-text').textContent = text;
    return wrap;
  }

  function createProviderCard() {
    var card = document.createElement('div');
    card.className = 'provider-card';
    card.innerHTML =
      '<div class="provider-card-section">' +
        '<div class="provider-card-header">' +
          '<span class="provider-card-title">UCLA Health - Santa Monica Medical Ce...</span>' +
          '<span class="provider-card-rating">4.8<span class="star">★</span></span>' +
        '</div>' +
        '<div class="provider-card-category">Labor & Delivery</div>' +
        '<div class="provider-card-meta">' +
          '<span class="provider-card-pill">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
            'Cigna' +
          '</span>' +
          '<div class="provider-cost-block">' +
            '<span class="provider-cost-label">Start at*</span>' +
            '<span class="provider-cost-value">$3,896</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<hr class="provider-card-divider">' +
      '<div class="provider-card-section">' +
        '<div class="provider-doctor">' +
          '<div class="provider-doctor-avatar" style="background-image:url(\'doc-avatar.png\');"></div>' +
          '<div>' +
            '<div class="provider-doctor-name">Dr. Emily Nguyen, MD, FACOG</div>' +
            '<div class="provider-doctor-spec">Obstetrics & Gynecology</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<hr class="provider-card-divider">' +
      '<div class="provider-card-section">' +
        '<button type="button" class="btn-primary">Personalize Estimate</button>' +
        '<div class="provider-disclaimer">Prices are estimates until confirmed via Turquoise Health.</div>' +
      '</div>';
    return card;
  }

  var aiResponseParts = [
    { type: 'text', content: 'The total cost of a vaginal birth at UCLA Health in Santa Monica with Dr. Nguyen can be from $6,000 to $17,000 with your Cigna plan. But because you have insurance coverage, your out-of-pocket costs will be closer to ' },
    { type: 'bold', content: '$2,000-$6,000' },
    { type: 'text', content: '.\n\nLet me know if the following has changed and I can update your estimate. Also, if you\'d like to see the cost of a Cesarean delivery, I can calculate that for you too.\n\n' },
    { type: 'bullets', items: ['Your insurance plan', "The type of birth you're hoping to have (vaginal or cesarean)", 'If your preferred provider has changed at UCLA'] },
    { type: 'text', content: '\n\nClick on ' },
    { type: 'bold', content: 'personalize estimate' },
    { type: 'text', content: ' to enter your insurance details on Turquoise. I can also show you other providers near UCLA if you\'d like to compare costs — just let me know!' },
    { type: 'card' },
    { type: 'sources' }
  ];

  var kneeResponseParts = [
    { type: 'text', content: 'Here are some providers in San Francisco with the highest ratings for knee-related surgeries. I can help you narrow down this further if you can share the following:\n\n' },
    { type: 'bullets', items: [
      "The type of surgery you need - if you aren't sure you can tell me what might have happened or upload notes from your doctor so I can find the right provider for you",
      'Preferences for your provider (location, ratings, years of experience)'
    ]},
    { type: 'provider_carousel' },
    { type: 'sources_pill' }
  ];

  var ACL_PROMPT_SUBSTRING = 'tore my ACL';
  var aclResponseParts = [
    { type: 'text', content: "Got it! For an ACL tear, an Arthroscopic Knee Repair is typically the procedure you'll need. However, the type of surgery you'll ultimately need may change depending on the outcome of a provider consult.\n\nHere are the highest rated providers near you in San Francisco that you can visit for an initial consult. If you want a price estimate for these providers let me know the following:\n\n" },
    { type: 'bullets', items: [
      'Your insurance provider',
      'Full name (first & last)',
      'Member ID',
      'Date of Birth'
    ]},
    { type: 'map_component' },
    { type: 'sources_pill' }
  ];

  function isInsuranceDetailsPrompt(text) {
    var t = (text || '').trim();
    return (t.indexOf('Cigna') !== -1 && (t.indexOf('Meredith') !== -1 || t.indexOf('11000362778') !== -1 || t.indexOf('01/01/1980') !== -1));
  }
  var insuranceResponseParts = [
    { type: 'text', content: "Great! I've updated the map with estimates for the initial consult tailored to your benefit.  " },
    { type: 'bold', content: "You have a $50 co-pay to see a specialist for the initial consult." },
    { type: 'text', content: "\n\nThe cost of the actual procedure will vary based on the outcome of the consult. Would you like to see a estimate for the procedure as well? I can give you a range depending on the complexity of the procedure you'll need. Just let me know!\n\n" },
    { type: 'map_component_price' },
    { type: 'sources_pill' }
  ];

  function isPostStreetEstimatePrompt(text) {
    var t = (text || '').trim().toLowerCase();
    return (t.indexOf('post street') !== -1 && (t.indexOf('estimate') !== -1 || t.indexOf('procedure') !== -1 || t.indexOf('learning more') !== -1 || t.indexOf('learn more') !== -1));
  }
  var postStreetEstimateResponseParts = [
    { type: 'text', content: 'For Post Street Surgery Center LLC, your total costs may look like:\n\n' },
    { type: 'bullets', items: [
      '$50 for the initial consult',
      { text: 'you have a $50 co-pay to see a specialist', sub: true },
      '$1,243 - $1,563 for the procedure',
      { text: '$1,243 for low complexity', sub: true },
      { text: '$1,563 for high complexity', sub: true },
      { text: 'the procedure will be applied to your remaining deductible and then trigger your co-insurance benefit', sub: true }
    ]},
    { type: 'text', content: '\n\nFor your initial consult, you should plan to pay up to $50 after your benefits have been applied.\n\n' },
    { type: 'text', content: "This provider enables patients to lock in an estimate ahead of their visit. This guarantees you will not pay more than the estimate above for the consult. Let me know if you'd like to learn more!\n\n" },
    { type: 'provider_cta_card' },
    { type: 'sources_pill' }
  ];

  function isXrayPrompt(text) {
    var t = (text || '').trim().toLowerCase();
    return (t.indexOf('x-ray') !== -1 || t.indexOf('xray') !== -1) && (t.indexOf('hand') !== -1 || t.indexOf('records') !== -1 || t.indexOf('cost') !== -1 || t.indexOf('doctor') !== -1);
  }
  function isDenverRadiologyFollowUpPrompt(text) {
    var t = (text || '').trim().toLowerCase();
    return t.indexOf('denver radiology') !== -1 && (t.indexOf('interested') !== -1 || t.indexOf('interested in') !== -1);
  }
  var xrayResponseParts = [
    { type: 'file_attachment', fileName: 'chris.s-medicalrecords-2026', fileExt: '.txt' },
    { type: 'text', content: "I see Dr. Perry's recommendation for an x-ray from your virtual visit last week. You reported swelling and tenderness in your right hand after a fall.\n\nHere are some providers near you in Denver that accept your Aetna insurance plan. Let me know if your insurance details have changed or if there's a specific provider you're interested in!\n\n" },
    { type: 'map_component_xray' },
    { type: 'sources_pill' }
  ];
  var xrayFollowUpResponseParts = [
    { type: 'text', content: "Great! This provider allows you to book your appointment and pay ahead of your visit to save time later, or you can lock in your price to guarantee that you'll not pay more than the estimate you're shown. Click below to learn more.\n\n" },
    { type: 'provider_cta_card_xray' },
    { type: 'sources_pill' }
  ];
  function getAiResponseParts(userText) {
    var flow = document.body.getAttribute('data-flow');
    var text = (userText || '').trim();
    if (flow === 'generic-2') {
      if (isDenverRadiologyFollowUpPrompt(text)) return xrayFollowUpResponseParts;
      if (isXrayPrompt(text)) return xrayResponseParts;
      return aiResponseParts;
    }
    if (flow !== 'generic-1') return aiResponseParts;
    if (isInsuranceDetailsPrompt(text)) return insuranceResponseParts;
    if (text.indexOf(ACL_PROMPT_SUBSTRING) !== -1) return aclResponseParts;
    if (isPostStreetEstimatePrompt(text)) return postStreetEstimateResponseParts;
    return kneeResponseParts;
  }

  var KNEE_PROVIDERS = [
    { name: 'Post Street Surgery Center LLC', rating: '4.8', procedure: 'Arthroscopic - Knee Repair' },
    { name: 'San Francisco Surgery Center', rating: '4.8', procedure: 'Arthroscopic - Knee Repair' },
    { name: 'Presidio Surgery Center', rating: '4.8', procedure: 'Arthroscopic - Knee Repair' },
    { name: 'UCSF Health Saint Francis Hospital', rating: '4.8', procedure: 'Arthroscopic - Knee Repair' },
    { name: 'California Pacific Medical Center - Van Ness Campus', rating: '4.8', procedure: 'Arthroscopic - Knee Repair' }
  ];

  function moveMapComponentIntoBubble(bubble) {
    var mapWrap = document.getElementById('genericMapComponentWrap');
    if (!mapWrap || !bubble) return;
    bubble.appendChild(mapWrap);
  }

  function moveMapComponentPriceIntoBubble(bubble) {
    var mapWrap = document.getElementById('genericMapComponentWrapPrice');
    if (!mapWrap || !bubble) return;
    bubble.appendChild(mapWrap);
    bindPriceMapSync(mapWrap);
  }

  function moveMapComponentXrayIntoBubble(bubble) {
    var mapWrap = document.getElementById('genericMapComponentWrapXray');
    if (!mapWrap || !bubble) return;
    mapWrap.removeAttribute('aria-hidden');
    bubble.appendChild(mapWrap);
    bindPriceMapSync(mapWrap);
  }

  function createFileAttachmentChip(fileName, fileExt) {
    var wrap = document.createElement('div');
    wrap.className = 'xray-file-attachment';
    wrap.innerHTML =
      '<span class="xray-file-attachment-icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
      '</span>' +
      '<div class="xray-file-attachment-text">' +
        '<span class="xray-file-attachment-name">' + (fileName || '') + '</span>' +
        '<span class="xray-file-attachment-ext">' + (fileExt || '') + '</span>' +
      '</div>';
    return wrap;
  }

  function bindPriceMapSync(mapWrap) {
    var cardsContainer = mapWrap && mapWrap.querySelector('.generic-map-cards');
    var pillsContainer = mapWrap && mapWrap.querySelector('.generic-map-pills');
    if (!cardsContainer || !pillsContainer) return;
    function getCenteredCardIndex() {
      var scrollCenter = cardsContainer.scrollLeft + cardsContainer.clientWidth / 2;
      var cards = cardsContainer.querySelectorAll('.generic-map-card');
      var centeredIndex = 0;
      var minDist = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var cardCenter = card.offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(cardCenter - scrollCenter);
        if (dist < minDist) {
          minDist = dist;
          centeredIndex = i;
        }
      }
      return centeredIndex;
    }
    function updatePills() {
      var centeredIndex = getCenteredCardIndex();
      var pills = pillsContainer.querySelectorAll('.generic-map-pill');
      for (var j = 0; j < pills.length; j++) {
        pills[j].classList.toggle('is-selected', j === centeredIndex);
      }
    }
    cardsContainer.addEventListener('scroll', updatePills);
    updatePills();
  }

  function createKneeProviderCarousel() {
    var wrap = document.createElement('div');
    wrap.className = 'knee-provider-carousel';
    var row = document.createElement('div');
    row.className = 'knee-provider-cards';
    KNEE_PROVIDERS.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'knee-provider-card';
      card.innerHTML =
        '<div class="knee-provider-card-inner">' +
          '<div class="knee-provider-card-head">' +
            '<p class="knee-provider-card-title"></p>' +
            '<div class="knee-provider-card-rating"><span class="rating-value"></span> <span class="star">★</span></div>' +
          '</div>' +
          '<p class="knee-provider-card-procedure"></p>' +
        '</div>';
      card.querySelector('.knee-provider-card-title').textContent = p.name;
      card.querySelector('.rating-value').textContent = p.rating;
      card.querySelector('.knee-provider-card-procedure').textContent = p.procedure;
      row.appendChild(card);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function createLockPriceCard() {
    var wrap = document.createElement('div');
    wrap.className = 'lock-price-card-wrap';
    wrap.innerHTML =
      '<div class="generic-map-card">' +
        '<div class="generic-map-card-top">' +
          '<div class="generic-map-card-head">' +
            '<p class="generic-map-card-title">Post Street Surgery Center LLC</p>' +
            '<div class="generic-map-card-rating">4.8 <span class="star">★</span></div>' +
          '</div>' +
          '<p class="generic-map-card-service">Consult for Arthroscopic - Knee Repair</p>' +
        '</div>' +
        '<div class="generic-map-card-bottom">' +
          '<span class="generic-map-card-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Cigna</span>' +
          '<div class="generic-map-card-price">' +
            '<span class="generic-map-card-price-label">With benefits applied*</span>' +
            '<span class="generic-map-card-price-value">$50</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lock-price-card-actions">' +
        '<button type="button" class="lock-price-card-btn">Lock Price</button>' +
        '<p class="lock-price-card-disclaimer">Prices are estimates until confirmed via Turquoise Health.</p>' +
      '</div>';
    var btn = wrap.querySelector('.lock-price-card-btn');
    if (btn && typeof openDrawerForLockPrice === 'function') {
      btn.addEventListener('click', openDrawerForLockPrice);
    }
    return wrap;
  }

  function createDenverRadiologyCard() {
    var wrap = document.createElement('div');
    wrap.className = 'lock-price-card-wrap';
    wrap.innerHTML =
      '<div class="generic-map-card">' +
        '<div class="generic-map-card-top">' +
          '<div class="generic-map-card-head">' +
            '<p class="generic-map-card-title">Denver Radiology &amp; Imaging Center</p>' +
            '<div class="generic-map-card-rating">4.8 <span class="star">★</span></div>' +
          '</div>' +
          '<p class="generic-map-card-service">X-Ray</p>' +
        '</div>' +
        '<div class="generic-map-card-bottom">' +
          '<span class="generic-map-card-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Aetna</span>' +
          '<div class="generic-map-card-price">' +
            '<span class="generic-map-card-price-label">With benefits*</span>' +
            '<span class="generic-map-card-price-value">$50</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lock-price-card-actions">' +
        '<button type="button" class="lock-price-card-btn">Learn more</button>' +
        '<p class="lock-price-card-disclaimer">Prices are estimates until confirmed via Turquoise Health.</p>' +
      '</div>';
    var btn = wrap.querySelector('.lock-price-card-btn');
    if (btn && typeof openDrawerForXray === 'function') {
      btn.addEventListener('click', openDrawerForXray);
    }
    return wrap;
  }

  function createAssistantLoading() {
    var wrap = document.createElement('div');
    wrap.className = 'message assistant';
    wrap.innerHTML =
      '<div class="bubble assistant">' +
        '<div class="loading-text">Fetching data from Turquoise Health<span class="loading-ellipsis"><span>.</span><span>.</span><span>.</span></span></div>' +
      '</div>';
    return wrap;
  }

  function createSourcesBlock() {
    var wrap = document.createElement('div');
    wrap.className = 'sources-block';
    wrap.innerHTML =
      '<a href="#" class="sources-link">Turquoise Health &gt;</a>' +
      '<div class="sources-desc">Healthcare data and technology company focused on price transparency and healthcare cost information.</div>' +
      '<div class="sources-row">' +
        '<div class="sources-pill">' +
          '<span class="sources-pill-text">Sources</span>' +
          '<div class="sources-pill-icons">' +
            '<span class="sources-pill-icon" aria-hidden="true"><img src="assets/sources-add-icon.png" alt="" class="sources-pill-icon-img"></span>' +
            '<span class="sources-pill-icon" aria-hidden="true"><img src="assets/google-icon.png" alt="" class="sources-pill-icon-img"></span>' +
          '</div>' +
        '</div>' +
      '</div>';
    return wrap;
  }

  function createSourcesPillOnly() {
    var row = document.createElement('div');
    row.className = 'sources-row';
    row.innerHTML =
      '<div class="sources-pill">' +
        '<span class="sources-pill-text">Sources</span>' +
        '<div class="sources-pill-icons">' +
          '<span class="sources-pill-icon" aria-hidden="true"><img src="assets/sources-add-icon.png" alt="" class="sources-pill-icon-img"></span>' +
          '<span class="sources-pill-icon" aria-hidden="true"><img src="assets/google-icon.png" alt="" class="sources-pill-icon-img"></span>' +
        '</div>' +
      '</div>';
    return row;
  }

  function buildAssistantBubbleContent() {
    var bubble = document.createElement('div');
    bubble.className = 'bubble assistant';
    var p1 = document.createElement('p');
    p1.appendChild(document.createTextNode('The total cost of a vaginal birth at UCLA Health in Santa Monica with Dr. Nguyen can be from $6,000 to $17,000 with your Cigna plan. But because you have insurance coverage, your out-of-pocket costs will be closer to '));
    var strong1 = document.createElement('strong');
    strong1.textContent = '$2,000-$6,000';
    p1.appendChild(strong1);
    p1.appendChild(document.createTextNode('.'));
    bubble.appendChild(p1);
    var p2 = document.createElement('p');
    p2.textContent = "Let me know if the following has changed and I can update your estimate. Also, if you'd like to see the cost of a Cesarean delivery, I can calculate that for you too.";
    bubble.appendChild(p2);
    var ul = document.createElement('ul');
    ['Your insurance plan', "The type of birth you're hoping to have (vaginal or cesarean)", 'If your preferred provider has changed at UCLA'].forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    bubble.appendChild(ul);
    var p3 = document.createElement('p');
    p3.appendChild(document.createTextNode('Click on '));
    var strong2 = document.createElement('strong');
    strong2.textContent = 'personalize estimate';
    p3.appendChild(strong2);
    p3.appendChild(document.createTextNode(' to enter your insurance details on Turquoise. I can also show you other providers near UCLA if you\'d like to compare costs — just let me know!'));
    bubble.appendChild(p3);
    bubble.appendChild(createProviderCard());
    bubble.appendChild(createSourcesBlock());
    return bubble;
  }

  function streamResponseIntoBubble(bubble, parts) {
    var responseParts = parts || aiResponseParts;
    var partIndex = 0;
    var wordIndex = 0;
    var currentWords = [];

    function streamNext() {
      if (partIndex >= responseParts.length) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        updateAutocompleteBubbleVisibility();
        return;
      }
      var part = responseParts[partIndex];
      if (part.type === 'text' || part.type === 'bold') {
        if (wordIndex === 0) currentWords = part.content.split(/(\s+)/);
        if (wordIndex < currentWords.length) {
          var word = currentWords[wordIndex];
          if (word === '\n\n') {
            bubble.appendChild(document.createElement('br'));
            bubble.appendChild(document.createElement('br'));
          } else if (word === '\n') {
            bubble.appendChild(document.createElement('br'));
          } else {
            var el = document.createElement(part.type === 'bold' ? 'strong' : 'span');
            el.appendChild(document.createTextNode(word));
            bubble.appendChild(el);
          }
          wordIndex++;
          chatContainer.scrollTop = chatContainer.scrollHeight;
          setTimeout(streamNext, 18);
        } else {
          partIndex++;
          wordIndex = 0;
          setTimeout(streamNext, 8);
        }
      } else if (part.type === 'bullets') {
        var ul = document.createElement('ul');
        part.items.forEach(function (item) {
          var li = document.createElement('li');
          var itemText = typeof item === 'string' ? item : item.text;
          var isSub = typeof item === 'object' && item.sub;
          li.textContent = itemText;
          if (isSub) li.classList.add('sub-bullet');
          ul.appendChild(li);
        });
        bubble.appendChild(ul);
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'card') {
        bubble.appendChild(createProviderCard());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'sources') {
        bubble.appendChild(createSourcesBlock());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'provider_carousel') {
        bubble.appendChild(createKneeProviderCarousel());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'sources_pill') {
        bubble.appendChild(createSourcesPillOnly());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'map_component') {
        moveMapComponentIntoBubble(bubble);
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'map_component_price') {
        moveMapComponentPriceIntoBubble(bubble);
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'file_attachment') {
        var chip = createFileAttachmentChip(part.fileName, part.fileExt);
        bubble.appendChild(chip);
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'map_component_xray') {
        moveMapComponentXrayIntoBubble(bubble);
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'provider_cta_card') {
        bubble.appendChild(createLockPriceCard());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      } else if (part.type === 'provider_cta_card_xray') {
        bubble.appendChild(createDenverRadiologyCard());
        partIndex++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(streamNext, 12);
      }
    }
    streamNext();
  }

  function sendMessage() {
    var field = getActiveInputField();
    var text = (field && field.value || '').trim();
    if (!text) return;

    var userWrap = createUserBubble(text);
    chatContainer.appendChild(userWrap);
    if (field) field.value = '';
    resizeInput();
    updateSuggestionVisibility();
    updateAutocompleteBubbleVisibility();
    updateSubmitIcon();
    updateWelcomeVisibility();
    chatContainer.scrollTop = chatContainer.scrollHeight;

    var responseParts = getAiResponseParts(text);
    setTimeout(function () {
      var loadingMsg = createAssistantLoading();
      chatContainer.appendChild(loadingMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      setTimeout(function () {
        loadingMsg.remove();
        var aiWrap = document.createElement('div');
        aiWrap.className = 'message assistant';
        var bubble = document.createElement('div');
        bubble.className = 'bubble assistant';
        aiWrap.appendChild(bubble);
        chatContainer.appendChild(aiWrap);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        streamResponseIntoBubble(bubble, responseParts);
      }, 600);
    }, 500);
  }

  var submitIconBtn = document.getElementById('submitIconBtn');
  if (submitIconBtn) submitIconBtn.addEventListener('click', sendMessage);
  var submitIconBtnAnthropic = document.getElementById('submitIconBtnAnthropic');
  if (submitIconBtnAnthropic) submitIconBtnAnthropic.addEventListener('click', sendMessage);
  updateSubmitIcon();

  function restoreCostShareBodyIntoResultCard() {
    var costShareBody = document.getElementById('drawerResultCostShareBody');
    var wrapper = document.getElementById('drawerXrayBenefitsCard');
    var resultCard = document.getElementById('drawerResultCard');
    if (wrapper && costShareBody && costShareBody.parentNode === wrapper && resultCard) {
      var insertBefore = resultCard.querySelector('.drawer-card-divider') || resultCard.querySelector('.drawer-card-result-facility');
      if (insertBefore) resultCard.insertBefore(costShareBody, insertBefore);
      wrapper.remove();
    }
  }

  function setDrawerContentBaby() {
    restoreCostShareBodyIntoResultCard();
    var resultCard = document.getElementById('drawerResultCard');
    if (resultCard) {
      var titleEl = resultCard.querySelector('.drawer-card-result-title');
      if (titleEl) {
        titleEl.innerHTML = '<span class="drawer-card-result-title-line">Labor &amp; Delivery</span><span class="drawer-card-result-title-line drawer-card-result-title-suffix">(Vaginal)</span>';
      }
      var metaEl = resultCard.querySelector('.drawer-card-result-meta');
      if (metaEl && metaEl.firstChild && metaEl.firstChild.nodeType === 3) metaEl.firstChild.textContent = 'SSP OB001';
      var priceLabel = resultCard.querySelector('.drawer-card-result-price-label');
      if (priceLabel) priceLabel.textContent = 'Total you pay';
      var priceEl = resultCard.querySelector('.drawer-card-result-price');
      if (priceEl) priceEl.textContent = '$3,869';
      var facilityEl = resultCard.querySelector('.drawer-card-facility-name');
      if (facilityEl) facilityEl.textContent = 'UCLA Health - Santa Monica Medical Center';
    }
    var benefitsCard = document.getElementById('drawerBenefitsCard');
    if (benefitsCard) {
      var negotiatedEl = benefitsCard.querySelector('.drawer-benefits-negotiated-value');
      if (negotiatedEl) negotiatedEl.textContent = '$17,340';
      var rows = benefitsCard.querySelectorAll('.drawer-benefits-row-value');
      if (rows.length >= 2) { rows[0].textContent = '$3,869'; rows[1].textContent = '-$13,471'; }
      var breakdownRows = benefitsCard.querySelectorAll('.drawer-benefits-breakdown-row');
      if (breakdownRows.length >= 3) {
        var labels = ['Deductible', 'Out-of-pocket max remaining', 'Your co-insurance'];
        var vals = ['Met', '$500', '$3,869'];
        for (var i = 0; i < 3 && i < breakdownRows.length; i++) {
          var lab = breakdownRows[i].querySelector('.drawer-benefits-breakdown-label');
          var val = breakdownRows[i].querySelector('.drawer-benefits-breakdown-val');
          if (lab) lab.textContent = labels[i];
          if (val) val.textContent = vals[i];
        }
      }
      var noteEl = benefitsCard.querySelector('.drawer-benefits-note');
      if (noteEl) noteEl.textContent = "Since you've already met your deductible and are close to your out-of-pocket max, you only pay the remaining amount based on your co-insurance.";
    }
    var costCard = document.getElementById('drawerCostBreakdownCard');
    if (costCard) {
      var proHeader = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"]');
      if (proHeader) proHeader.style.display = '';
      var totalEl = costCard.querySelector('.drawer-cost-breakdown-total-amount');
      if (totalEl) totalEl.textContent = '$17,340';
      var facilityCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="facility"] .drawer-cost-breakdown-section-count');
      if (facilityCount) facilityCount.textContent = '8 Fees';
      var proCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"] .drawer-cost-breakdown-section-count');
      if (proCount) proCount.textContent = '3 Fees';
      var proTitle = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"] .drawer-cost-breakdown-section-title');
      if (proTitle) proTitle.textContent = 'Professional Fees';
      var facilityBody = document.getElementById('drawerCostBreakdownFacility');
      if (facilityBody) {
        facilityBody.innerHTML =
          '<div class="drawer-cost-breakdown-item">Delivery – Vaginal</div>' +
          '<div class="drawer-cost-breakdown-item">Pharmacy – General</div>' +
          '<div class="drawer-cost-breakdown-item">Laboratory – General</div>' +
          '<div class="drawer-cost-breakdown-item">Laboratory – Hematology</div>' +
          '<div class="drawer-cost-breakdown-item">Laboratory – Chemistry</div>' +
          '<div class="drawer-cost-breakdown-item">Labor Room/Delivery – General</div>' +
          '<div class="drawer-cost-breakdown-item">Labor Room/Delivery – Delivery</div>' +
          '<div class="drawer-cost-breakdown-item">Laboratory – Immunology</div>';
      }
      var proBody = document.getElementById('drawerCostBreakdownProfessional');
      if (proBody) {
        proBody.innerHTML =
          '<div class="drawer-cost-breakdown-item">Obstetrician – Labor &amp; Delivery</div>' +
          '<div class="drawer-cost-breakdown-item">Anesthesiologist – Epidural</div>' +
          '<div class="drawer-cost-breakdown-item">Pediatrician – Newborn Care</div>';
      }
      var disclaimer = costCard.querySelector('.drawer-cost-breakdown-disclaimer');
      if (disclaimer) disclaimer.textContent = "This estimate includes services commonly performed during this treatment. Facility fees cover hospital/facility charges; professional fees are paid to physicians and specialists.";
      var caseRateEl = costCard.querySelector('.drawer-cost-breakdown-case-rate');
      if (caseRateEl) caseRateEl.textContent = 'Case Rate';
    }
    var costShareBody = document.getElementById('drawerResultCostShareBody');
    if (costShareBody) costShareBody.setAttribute('aria-hidden', 'true');
    var lockDetailCard = document.getElementById('drawerLockPriceDetailCard');
    if (lockDetailCard) lockDetailCard.setAttribute('aria-hidden', 'true');
    var lockDoctorCard = document.getElementById('drawerLockPriceDoctorCard');
    if (lockDoctorCard) lockDoctorCard.setAttribute('aria-hidden', 'true');
    var dateTimeCard = document.getElementById('drawerDateTimeCard');
    if (dateTimeCard) dateTimeCard.setAttribute('aria-hidden', 'true');
  }

  function setDrawerContentKneeLockPrice() {
    restoreCostShareBodyIntoResultCard();
    var resultCard = document.getElementById('drawerResultCard');
    if (resultCard) {
      var titleEl = resultCard.querySelector('.drawer-card-result-title');
      if (titleEl) {
        titleEl.innerHTML = '<span class="drawer-card-result-title-line">Consult for Arthroscopic - Knee Repair</span>';
      }
      var metaEl = resultCard.querySelector('.drawer-card-result-meta');
      if (metaEl && metaEl.firstChild && metaEl.firstChild.nodeType === 3) {
        metaEl.firstChild.textContent = 'SSP MS006';
      }
      var priceLabel = resultCard.querySelector('.drawer-card-result-price-label');
      if (priceLabel) priceLabel.textContent = 'Total you pay';
      var priceEl = resultCard.querySelector('.drawer-card-result-price');
      if (priceEl) priceEl.textContent = '$50';
      var facilityEl = resultCard.querySelector('.drawer-card-facility-name');
      if (facilityEl) facilityEl.textContent = 'Post Street Surgery Center LLC';
    }
    var benefitsCard = document.getElementById('drawerBenefitsCard');
    if (benefitsCard) {
      var negotiatedEl = benefitsCard.querySelector('.drawer-benefits-negotiated-value');
      if (negotiatedEl) negotiatedEl.textContent = '$3,602';
      var rows = benefitsCard.querySelectorAll('.drawer-benefits-row-value');
      if (rows.length >= 2) { rows[0].textContent = '$1,293'; rows[1].textContent = '-$2,309'; }
      var breakdownRows = benefitsCard.querySelectorAll('.drawer-benefits-breakdown-row');
      if (breakdownRows.length >= 3) {
        var labels = ['Deductible remaining', 'Out-of-pocket max remaining', 'Your co-insurance'];
        var vals = ['$0', '$1,500', '$1,243'];
        for (var j = 0; j < 3 && j < breakdownRows.length; j++) {
          var lab = breakdownRows[j].querySelector('.drawer-benefits-breakdown-label');
          var val = breakdownRows[j].querySelector('.drawer-benefits-breakdown-val');
          if (lab) lab.textContent = labels[j];
          if (val) val.textContent = vals[j];
        }
      }
      var noteEl = benefitsCard.querySelector('.drawer-benefits-note');
      if (noteEl) noteEl.textContent = "This provider enables you to lock in an estimate for an arthroscopic knee repair. This guarantees you'll not pay more than this estimate for this service.";
    }
    var costCard = document.getElementById('drawerCostBreakdownCard');
    if (costCard) {
      var proHeader = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"]');
      if (proHeader) proHeader.style.display = '';
      var totalEl = costCard.querySelector('.drawer-cost-breakdown-total-amount');
      if (totalEl) totalEl.textContent = '$2,921';
      var facilityCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="facility"] .drawer-cost-breakdown-section-count');
      if (facilityCount) facilityCount.textContent = '13 Fees';
      var proCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"] .drawer-cost-breakdown-section-count');
      if (proCount) proCount.textContent = '1 Fee';
      var proTitle = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"] .drawer-cost-breakdown-section-title');
      if (proTitle) proTitle.textContent = 'Professional Fee';
      var facilityBody = document.getElementById('drawerCostBreakdownFacility');
      if (facilityBody) {
        facilityBody.innerHTML =
          '<div class="drawer-cost-breakdown-item">Knee Repair - Arthroscopic</div>' +
          '<div class="drawer-cost-breakdown-item">Recovery Room - General</div>' +
          '<div class="drawer-cost-breakdown-item">Operating Room Services - General</div>' +
          '<div class="drawer-cost-breakdown-item">Pharmacy (Also see 063X, an extension of 250X) - General</div>' +
          '<div class="drawer-cost-breakdown-item">Anesthesia - General</div>' +
          '<div class="drawer-cost-breakdown-item">Pharmacy - Extension of 025X - Drugs requiring detailed coding</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection of fentanyl citrate, 0.1mg</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection of ondansetron hydrochloride, 1mg</div>' +
          '<div class="drawer-cost-breakdown-item">Medical/Surgical Supplies and Devices (Also see 062X, an extension of 027X) - Sterile</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection of 10mg propofol</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection of 1mg dexamethasone sodium phosphate</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection cefazolin sodium, 500mg</div>' +
          '<div class="drawer-cost-breakdown-item">Intramuscular injection of 1mg midazolam hydrochloride</div>';
      }
      var proBody = document.getElementById('drawerCostBreakdownProfessional');
      if (proBody) {
        proBody.innerHTML =
          '<div class="drawer-cost-breakdown-item">Knee Repair - Arthroscopic</div>';
      }
      var disclaimer = costCard.querySelector('.drawer-cost-breakdown-disclaimer');
      if (disclaimer) disclaimer.textContent = "This estimate includes services commonly performed during this treatment. We include these services to give you the most accurate estimate possible.";
      var caseRateEl = costCard.querySelector('.drawer-cost-breakdown-case-rate');
      if (caseRateEl) caseRateEl.textContent = 'Case Rate';
    }
    var dateTimeCard = document.getElementById('drawerDateTimeCard');
    if (dateTimeCard) dateTimeCard.setAttribute('aria-hidden', 'true');
    var lockDetailCard = document.getElementById('drawerLockPriceDetailCard');
    if (lockDetailCard) {
      lockDetailCard.setAttribute('aria-hidden', 'false');
      var tabPriceLock = document.getElementById('drawerLockDetailTabPriceLock');
      var tabOther = document.getElementById('drawerLockDetailTabOther');
      var panelPriceLock = document.getElementById('drawerLockDetailPanelPriceLock');
      var panelOther = document.getElementById('drawerLockDetailPanelOther');
      if (tabPriceLock && tabOther && panelPriceLock && panelOther) {
        tabPriceLock.classList.add('is-selected');
        tabPriceLock.setAttribute('aria-selected', 'true');
        tabOther.classList.remove('is-selected');
        tabOther.setAttribute('aria-selected', 'false');
        panelPriceLock.classList.add('is-active');
        panelPriceLock.setAttribute('aria-hidden', 'false');
        panelOther.classList.remove('is-active');
        panelOther.setAttribute('aria-hidden', 'true');
      }
    }
    var lockDoctorCard = document.getElementById('drawerLockPriceDoctorCard');
    if (lockDoctorCard) lockDoctorCard.setAttribute('aria-hidden', 'false');
    var costShareBody = document.getElementById('drawerResultCostShareBody');
    if (costShareBody) {
      costShareBody.setAttribute('aria-hidden', 'false');
      var deductibleEl = costShareBody.querySelector('[data-key="deductible"]');
      var oopEl = costShareBody.querySelector('[data-key="oop"]');
      var copayEl = costShareBody.querySelector('[data-key="copay"]');
      if (deductibleEl) deductibleEl.textContent = '$473';
      if (oopEl) oopEl.textContent = '$1,500';
      if (copayEl) copayEl.textContent = '$50';
    }
  }

  function setDrawerContentXray() {
    var resultCard = document.getElementById('drawerResultCard');
    var costShareBody = document.getElementById('drawerResultCostShareBody');
    var drawerBodyCards = document.getElementById('drawerBodyCards');
    if (costShareBody && resultCard && drawerBodyCards && costShareBody.parentNode === resultCard) {
      var xrayBenefitsWrapper = document.createElement('div');
      xrayBenefitsWrapper.className = 'drawer-card drawer-card--xray-benefits';
      xrayBenefitsWrapper.setAttribute('id', 'drawerXrayBenefitsCard');
      resultCard.parentNode.insertBefore(xrayBenefitsWrapper, resultCard.nextSibling);
      xrayBenefitsWrapper.appendChild(costShareBody);
    }
    if (resultCard) {
      var titleEl = resultCard.querySelector('.drawer-card-result-title');
      if (titleEl) titleEl.innerHTML = '<span class="drawer-card-result-title-line">X-Ray</span>';
      var metaEl = resultCard.querySelector('.drawer-card-result-meta');
      if (metaEl && metaEl.firstChild && metaEl.firstChild.nodeType === 3) metaEl.firstChild.textContent = 'RA000';
      var priceLabel = resultCard.querySelector('.drawer-card-result-price-label');
      if (priceLabel) priceLabel.textContent = 'Total you pay';
      var priceEl = resultCard.querySelector('.drawer-card-result-price');
      if (priceEl) priceEl.textContent = '$50';
      var facilityEl = resultCard.querySelector('.drawer-card-facility-name');
      if (facilityEl) facilityEl.textContent = 'Denver Radiology & Imaging Center';
      var addressEl = resultCard.querySelector('.drawer-card-result-address');
      if (addressEl) {
        var pin = addressEl.querySelector('.drawer-card-result-pin');
        addressEl.innerHTML = '';
        if (pin) addressEl.appendChild(pin);
        addressEl.appendChild(document.createTextNode(' 1111 E McDowell Rd, Denver, CO 85006'));
      }
    }
    var costShareBody = document.getElementById('drawerResultCostShareBody');
    if (costShareBody) {
      costShareBody.setAttribute('aria-hidden', 'false');
      var planEl = costShareBody.querySelector('.drawer-result-cost-share-cigna-plan');
      if (planEl) planEl.textContent = 'Aetna';
      var memberEl = costShareBody.querySelector('.drawer-result-cost-share-calc-member');
      if (memberEl) memberEl.textContent = 'Member ID: 1110002234';
      var titleEl = costShareBody.querySelector('.drawer-result-cost-share-calc-title');
      if (titleEl) titleEl.textContent = 'Your benefits breakdown';
      var xrayMain = document.getElementById('drawerResultCostShareXrayMain');
      if (xrayMain) xrayMain.setAttribute('aria-hidden', 'false');
      var negotiatedVal = document.getElementById('drawerXrayNegotiatedValue');
      if (negotiatedVal) negotiatedVal.textContent = '$171';
      var youPayVal = document.getElementById('drawerXrayYouPayValue');
      if (youPayVal) youPayVal.textContent = '$50';
      var insuranceVal = document.getElementById('drawerXrayInsuranceValue');
      if (insuranceVal) insuranceVal.textContent = '-$121';
      var calcEl = costShareBody.querySelector('.drawer-result-cost-share-calc');
      var calcToggle = document.getElementById('drawerResultCostShareBreakdownToggle');
      if (calcEl) calcEl.classList.add('is-collapsed');
      if (calcToggle) {
        calcToggle.setAttribute('aria-expanded', 'false');
        calcToggle.setAttribute('aria-label', 'Your benefits breakdown, collapsed. Click to expand.');
      }
    }
    var costCard = document.getElementById('drawerCostBreakdownCard');
    if (costCard) {
      var totalEl = costCard.querySelector('.drawer-cost-breakdown-total-amount');
      if (totalEl) totalEl.textContent = '$171';
      var caseRateEl = costCard.querySelector('.drawer-cost-breakdown-case-rate');
      if (caseRateEl) caseRateEl.textContent = 'Total Negotiated Rate';
      var facilityCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="facility"] .drawer-cost-breakdown-section-count');
      if (facilityCount) facilityCount.textContent = '2 Fees';
      var proCount = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"] .drawer-cost-breakdown-section-count');
      if (proCount) proCount.textContent = '1 Fees';
      var proHeader = costCard.querySelector('.drawer-cost-breakdown-section-header[data-section="professional"]');
      if (proHeader) proHeader.style.display = '';
      var facilityBody = document.getElementById('drawerCostBreakdownFacility');
      if (facilityBody) {
        facilityBody.innerHTML =
          '<div class="drawer-cost-breakdown-item">X-ray</div>' +
          '<div class="drawer-cost-breakdown-item">Radiology Diagnostic - General</div>';
      }
      var proBody = document.getElementById('drawerCostBreakdownProfessional');
      if (proBody) {
        proBody.innerHTML = '<div class="drawer-cost-breakdown-item">X-ray</div>';
      }
      var disclaimer = costCard.querySelector('.drawer-cost-breakdown-disclaimer');
      if (disclaimer) disclaimer.textContent = "This estimate includes services commonly performed during this treatment. Facility fees cover hospital/facility charges; professional fees are paid to physicians and specialist.";
    }
    var lockDetailCard = document.getElementById('drawerLockPriceDetailCard');
    if (lockDetailCard) lockDetailCard.setAttribute('aria-hidden', 'true');
    var lockDoctorCard = document.getElementById('drawerLockPriceDoctorCard');
    if (lockDoctorCard) lockDoctorCard.setAttribute('aria-hidden', 'true');
    var dateTimeCard = document.getElementById('drawerDateTimeCard');
    if (dateTimeCard) dateTimeCard.setAttribute('aria-hidden', 'false');
  }

  function openDrawerForXray() {
    setDrawerContentXray();
    drawerOverlay.classList.add('drawer-after-loading', 'drawer-xray-mode');
    lastFocusedBeforeDrawer = document.activeElement;
    drawerOverlay.classList.add('is-open');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    if (drawerClose) drawerClose.focus();
    document.addEventListener('keydown', handleDrawerKeydown);
  }

  function openDrawer() {
    setDrawerContentBaby();
    lastFocusedBeforeDrawer = document.activeElement;
    drawerOverlay.classList.add('is-open');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    var cardVideo = document.getElementById('drawerCardVideo');
    if (cardVideo) {
      cardVideo.playsInline = true;
      cardVideo.muted = true;
      cardVideo.load();
      var p = cardVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
    if (drawerClose) {
      drawerClose.focus();
    }
    document.addEventListener('keydown', handleDrawerKeydown);
  }

  function openDrawerForLockPrice() {
    setDrawerContentKneeLockPrice();
    drawerOverlay.classList.add('drawer-after-loading', 'drawer-lock-price-mode');
    lastFocusedBeforeDrawer = document.activeElement;
    drawerOverlay.classList.add('is-open');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    if (drawerClose) drawerClose.focus();
    document.addEventListener('keydown', handleDrawerKeydown);
  }

  function closeDrawer() {
    if (drawerOverlay.classList.contains('drawer-xray-mode')) {
      restoreCostShareBodyIntoResultCard();
    }
    drawerOverlay.classList.remove('is-open', 'drawer-after-loading', 'drawer-showing-success', 'drawer-lock-price-mode', 'drawer-xray-mode');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    drawerPanel.classList.remove('is-loading');
    if (drawerBodyCards) drawerBodyCards.classList.remove('is-hidden');
    if (drawerLoading) {
      drawerLoading.classList.remove('is-visible');
      drawerLoading.setAttribute('hidden', '');
      if (drawerLoadingVideo) drawerLoadingVideo.pause();
    }
    document.removeEventListener('keydown', handleDrawerKeydown);
    if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === 'function') {
      lastFocusedBeforeDrawer.focus();
    }
  }

  function handleDrawerKeydown(e) {
    if (e.key === 'Escape' && drawerOverlay.classList.contains('is-open')) {
      e.preventDefault();
      closeDrawer();
    }
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  drawerOverlay.addEventListener('click', function (e) {
    if (e.target === drawerOverlay) closeDrawer();
  });

  if (drawerApplyBtn) {
    drawerApplyBtn.addEventListener('click', function () {
      if (!drawerLoading || !drawerBodyCards) return;
      drawerBodyCards.classList.add('is-hidden');
      if (drawerPanel) drawerPanel.classList.add('is-loading');
      drawerLoading.classList.add('is-visible');
      drawerLoading.removeAttribute('hidden');
      var progress = drawerLoading.querySelector('.drawer-loading-progress');
      if (progress) progress.classList.add('is-expanded');
      if (drawerLoadingVideo) {
        var p = drawerLoadingVideo.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
      setTimeout(function () {
        if (drawerPanel) drawerPanel.classList.remove('is-loading');
        drawerLoading.classList.remove('is-visible');
        drawerLoading.setAttribute('hidden', '');
        if (progress) progress.classList.remove('is-expanded');
        if (drawerLoadingVideo) drawerLoadingVideo.pause();
        drawerBodyCards.classList.remove('is-hidden');
        drawerOverlay.classList.add('drawer-after-loading');
      }, 3000);
    });
  }

  if (drawerCancelBtn) {
    drawerCancelBtn.addEventListener('click', closeDrawer);
  }

  function getEstimateSummaryFromDrawer() {
    var resultCard = document.getElementById('drawerResultCard');
    if (!resultCard) return { procedure: 'your procedure', totalPay: '', facility: '' };
    var titleEl = resultCard.querySelector('.drawer-card-result-title');
    var procedure = titleEl ? (titleEl.textContent || '').trim().replace(/\s+/g, ' ') || 'your procedure' : 'your procedure';
    var priceEl = resultCard.querySelector('.drawer-card-result-price');
    var totalPay = priceEl ? (priceEl.textContent || '').trim() : '';
    var facilityEl = resultCard.querySelector('.drawer-card-facility-name');
    var facility = facilityEl ? (facilityEl.textContent || '').trim() : '';
    return { procedure: procedure, totalPay: totalPay, facility: facility };
  }

  function appendCongratsMessage(summary) {
    var procedure = summary.procedure || 'your procedure';
    var totalPay = summary.totalPay || '';
    var facility = summary.facility || '';
    var aiWrap = document.createElement('div');
    aiWrap.className = 'message assistant';
    var bubble = document.createElement('div');
    bubble.className = 'bubble assistant';
    var p1 = document.createElement('p');
    p1.textContent = "Congratulations on getting your estimate! We're glad we could help you understand your costs.";
    bubble.appendChild(p1);
    var p2 = document.createElement('p');
    p2.textContent = "Wishing you the best with your procedure!";
    bubble.appendChild(p2);
    var p3 = document.createElement('p');
    p3.textContent = "Here's a quick summary of what you confirmed:";
    bubble.appendChild(p3);
    var ul = document.createElement('ul');
    var li1 = document.createElement('li');
    li1.textContent = 'Procedure: ' + procedure;
    ul.appendChild(li1);
    if (totalPay) {
      var li2 = document.createElement('li');
      li2.textContent = 'Total you pay: ' + totalPay;
      ul.appendChild(li2);
    }
    if (facility) {
      var li3 = document.createElement('li');
      li3.textContent = 'Facility: ' + facility;
      ul.appendChild(li3);
    }
    bubble.appendChild(ul);
    var p4 = document.createElement('p');
    p4.textContent = "Want help comparing this with other hospitals nearby, or exploring payment plans and financial assistance options?";
    bubble.appendChild(p4);
    aiWrap.appendChild(bubble);
    chatContainer.appendChild(aiWrap);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  if (drawerConfirmEstimateBtn) {
    drawerConfirmEstimateBtn.addEventListener('click', function () {
      var summary = getEstimateSummaryFromDrawer();
      drawerOverlay.classList.add('drawer-showing-success');
      setTimeout(function () {
        drawerOverlay.classList.remove('drawer-showing-success');
        closeDrawer();
        var loadingMsg = createAssistantLoading();
        chatContainer.appendChild(loadingMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(function () {
          loadingMsg.remove();
          appendCongratsMessage(summary);
        }, 1000);
      }, 1800);
    });
  }

  if (drawerBenefitsBreakdownToggle && drawerBenefitsBreakdown) {
    drawerBenefitsBreakdownToggle.addEventListener('click', function () {
      var isCollapsed = drawerBenefitsBreakdown.classList.toggle('is-collapsed');
      drawerBenefitsBreakdownToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      drawerBenefitsBreakdownToggle.setAttribute('aria-label', isCollapsed ? 'Your benefits breakdown, collapsed. Click to expand.' : 'Your benefits breakdown, expanded. Click to collapse.');
    });
  }
  var drawerResultCostShareBreakdownToggle = document.getElementById('drawerResultCostShareBreakdownToggle');
  if (drawerResultCostShareBreakdownToggle) {
    var costShareCalc = drawerResultCostShareBreakdownToggle.closest('.drawer-result-cost-share-calc');
    if (costShareCalc) {
      drawerResultCostShareBreakdownToggle.addEventListener('click', function () {
        var isCollapsed = costShareCalc.classList.toggle('is-collapsed');
        drawerResultCostShareBreakdownToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });
    }
  }

  document.querySelectorAll('.drawer-cost-breakdown-section-header').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  /* Flow 2: Select a Date & Time – time slot selection */
  var dateTimeCard = document.getElementById('drawerDateTimeCard');
  if (dateTimeCard) {
    dateTimeCard.addEventListener('click', function (e) {
      var slot = e.target.closest('.drawer-date-time-slot');
      if (!slot) return;
      var group = slot.closest('.drawer-date-time-group');
      if (group) {
        group.querySelectorAll('.drawer-date-time-slot').forEach(function (s) {
          s.classList.remove('is-selected');
        });
        slot.classList.add('is-selected');
      }
    });
  }

  /* Lock price detail card: switch between Price Lock and Other Estimates tabs */
  var lockDetailCard = document.getElementById('drawerLockPriceDetailCard');
  if (lockDetailCard) {
    var lockDetailTabs = lockDetailCard.querySelectorAll('.drawer-lock-detail-tab');
    var lockDetailPanels = lockDetailCard.querySelectorAll('.drawer-lock-detail-panel');
    lockDetailTabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        lockDetailTabs.forEach(function (t) {
          t.classList.remove('is-selected');
          t.setAttribute('aria-selected', 'false');
        });
        lockDetailPanels.forEach(function (p) {
          p.classList.remove('is-active');
          p.setAttribute('aria-hidden', 'true');
        });
        tab.classList.add('is-selected');
        tab.setAttribute('aria-selected', 'true');
        if (lockDetailPanels[index]) {
          lockDetailPanels[index].classList.add('is-active');
          lockDetailPanels[index].setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-primary') && e.target.id !== 'drawerApplyBtn' && e.target.id !== 'drawerConfirmEstimateBtn') {
      e.preventDefault();
      openDrawer();
    }
  });

  /* Map carousel: sync selected price pill with the centered card */
  (function () {
    var cardsContainer = document.querySelector('#genericMapComponentWrap .generic-map-cards');
    var pillsContainer = document.querySelector('#genericMapComponentWrap .generic-map-pills');
    if (!cardsContainer || !pillsContainer) return;

    function getCenteredCard() {
      var scrollCenter = cardsContainer.scrollLeft + cardsContainer.clientWidth / 2;
      var cards = cardsContainer.querySelectorAll('.generic-map-card');
      var centered = null;
      var minDist = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var cardCenter = card.offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(cardCenter - scrollCenter);
        if (dist < minDist) {
          minDist = dist;
          centered = card;
        }
      }
      return centered;
    }

    function updateMapPillFromCarousel() {
      var centeredCard = getCenteredCard();
      var cards = cardsContainer.querySelectorAll('.generic-map-card');
      var pills = pillsContainer.querySelectorAll('.generic-map-pill');
      var centeredIndex = -1;
      if (centeredCard && cards.length) {
        for (var c = 0; c < cards.length; c++) {
          if (cards[c] === centeredCard) {
            centeredIndex = c;
            break;
          }
        }
      }
      for (var j = 0; j < pills.length; j++) {
        pills[j].classList.toggle('is-selected', j === centeredIndex);
      }
    }

    cardsContainer.addEventListener('scroll', updateMapPillFromCarousel);
    updateMapPillFromCarousel();
  })();
})();

/* Map screenshot fallback when assets/sf-map.png is missing */
(function () {
  var img = document.getElementById('mapScreenshotImg');
  if (!img) return;
  img.addEventListener('error', function mapImgFallback() {
    img.removeEventListener('error', mapImgFallback);
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">' +
      '<rect fill="#e8eaed" width="800" height="800"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="28">Map of San Francisco</text>' +
      '</svg>'
    );
  });
})();
