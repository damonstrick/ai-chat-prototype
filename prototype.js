(function () {
  'use strict';

  var DEMO_PROMPT = 'How much does it cost to have a baby at UCLA?';

  var chatContainer = document.getElementById('chatContainer');
  var chatWelcome = document.getElementById('chatWelcome');
  var inputField = document.getElementById('inputField');
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

  var lastFocusedBeforeDrawer = null;
  var AUDIO_ICON = 'assets/audio-icon.png';
  var SEND_ICON = 'assets/send-icon.png';

  function updateSubmitIcon() {
    var submitImg = submitIconBtn && submitIconBtn.querySelector('.input-btn-icon-img');
    if (!submitImg) return;
    var hasText = (inputField.value || '').trim().length > 0;
    submitImg.src = hasText ? SEND_ICON : AUDIO_ICON;
  }

  function resizeInput() {
    inputField.style.height = 'auto';
    inputField.style.height = Math.max(24, inputField.scrollHeight) + 'px';
  }

  function updateSuggestionVisibility() {
    if (!inputSuggestion) return;
    var val = (inputField.value || '').trim();
    var show = val.length === 0;
    inputSuggestion.classList.toggle('is-hidden', !show);
  }

  function updateWelcomeVisibility() {
    if (!chatWelcome) return;
    var hasInput = (inputField.value || '').trim().length > 0;
    var hasMessages = chatContainer.querySelectorAll('.message').length > 0;
    chatWelcome.classList.toggle('is-faded', hasInput || hasMessages);
    chatWelcome.setAttribute('aria-hidden', hasInput || hasMessages ? 'true' : 'false');
  }

  inputField.addEventListener('input', function () {
    resizeInput();
    updateSuggestionVisibility();
    updateSubmitIcon();
    updateWelcomeVisibility();
  });
  inputField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  if (inputSuggestion) {
    inputSuggestion.addEventListener('click', function () {
      inputField.value = DEMO_PROMPT;
      resizeInput();
      updateSuggestionVisibility();
      updateSubmitIcon();
      updateWelcomeVisibility();
      inputField.focus();
    });
    inputSuggestion.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputSuggestion.click();
      }
    });
  }
  if (inputSuggestion) updateSuggestionVisibility();

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

  function streamResponseIntoBubble(bubble) {
    var partIndex = 0;
    var wordIndex = 0;
    var currentWords = [];

    function streamNext() {
      if (partIndex >= aiResponseParts.length) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return;
      }
      var part = aiResponseParts[partIndex];
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
          li.textContent = item;
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
      }
    }
    streamNext();
  }

  function sendMessage() {
    var text = (inputField.value || '').trim();
    if (!text) return;

    var userWrap = createUserBubble(text);
    chatContainer.appendChild(userWrap);
    inputField.value = '';
    resizeInput();
    updateSuggestionVisibility();
    updateSubmitIcon();
    updateWelcomeVisibility();
    chatContainer.scrollTop = chatContainer.scrollHeight;

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
        streamResponseIntoBubble(bubble);
      }, 600);
    }, 500);
  }

  var submitIconBtn = document.getElementById('submitIconBtn');
  if (submitIconBtn) {
    submitIconBtn.addEventListener('click', sendMessage);
    updateSubmitIcon();
  }

  function openDrawer() {
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

  function closeDrawer() {
    drawerOverlay.classList.remove('is-open', 'drawer-after-loading', 'drawer-showing-success');
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
    p2.textContent = "Wishing you the best with your procedure — take care!";
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

  document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-primary') && e.target.id !== 'drawerApplyBtn' && e.target.id !== 'drawerConfirmEstimateBtn') {
      e.preventDefault();
      openDrawer();
    }
  });
})();
