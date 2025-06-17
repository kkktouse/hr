let data = [];
let activeTab = 0;

fetch('messages.json')
  .then(res => res.json())
  .then(json => {
    data = json.map(transformObject);
    renderSidebar();
    renderMain(0);
  });

function transformObject(obj) {
  // Категорія з categories
  if (obj.categories) {
    const items = [];
    Object.entries(obj.categories).forEach(([situation, arr]) => {
      if (arr.length === 2) {
        items.push({ title: situation, ukr: adaptToTelegram(arr[0]), en: adaptToTelegram(arr[1]) });
      }
    });
    return { tab: obj.tab, items };
  }
  // FAQ (Питання)
  if (obj.items && obj.items.length && obj.items.every(el => "Питання" in el)) {
    const items = obj.items.map(el => ({
      title: el["Питання"] || '',
      ukr: adaptToTelegram(el["Відповідь укр"] || ''),
      en: adaptToTelegram(el["Відповідь англ"] || '')
    }));
    return { tab: obj.tab, items };
  }
  // Обов'язки (Позиція)
  if (obj.items && obj.items.length && obj.items.every(el => "Позиція" in el)) {
    const items = obj.items.map(el => ({
      title: el["Позиція"] || '',
      ukr: adaptToTelegram(el["Укр повідомлення"] || ''),
      en: adaptToTelegram(el["Англ повідомлення"] || '')
    }));
    return { tab: obj.tab, items };
  }
  // Інші категорії (items)
  const items = (obj.items || []).map(el => ({
    title: el["Ситуація"] || '',
    ukr: adaptToTelegram(el["Укр повідомлення"] || ''),
    en: adaptToTelegram(el["Англ повідомлення"] || '')
  }));
  return { tab: obj.tab, items };
}

// Основна функція адаптації для Telegram
function adaptToTelegram(text) {
  if (!text) return '';
  // Важливо: зберігаємо подвійні зірочки для Telegram (жирний), списки → тире
  return text
    .replace(/\*\*(.+?)\*\*/g, '**$1**') // залишаємо подвійні зірочки для жирного в TG
    .replace(/^[-•]\s?/gm, '— ')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/• /g, '— ')
    .replace(/  +/g, ' ')
    .trim();
}

// Рендер бокового меню
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '';
  data.forEach((tab, idx) => {
    const btn = document.createElement('button');
    btn.textContent = tab.tab;
    btn.className = 'sidebar-btn' + (idx === activeTab ? ' active' : '');
    btn.addEventListener('click', () => {
      activeTab = idx;
      renderSidebar();
      renderMain(idx);
    });
    sidebar.appendChild(btn);
  });
}

// Рендер основного блоку
function renderMain(tabIdx) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const tab = data[tabIdx];
  tab.items.forEach(item => {
    const block = document.createElement('div');
    block.className = 'item-block';

    // Заголовок (ситуація/позиція/питання)
    if (item.title) {
      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = item.title;
      block.appendChild(title);
    }

    // Блок повідомлень (укр/англ)
    const row = document.createElement('div');
    row.className = 'message-row';

    if (item.ukr) {
      const btnUkr = document.createElement('button');
      btnUkr.className = 'message-btn tg-ua';
      btnUkr.type = 'button';
      btnUkr.innerHTML = formatMessageForHtml(item.ukr);
      btnUkr.onclick = () => copyToClipboard(item.ukr);
      row.appendChild(btnUkr);
    }
    if (item.en) {
      const btnEn = document.createElement('button');
      btnEn.className = 'message-btn tg-en';
      btnEn.type = 'button';
      btnEn.innerHTML = formatMessageForHtml(item.en);
      btnEn.onclick = () => copyToClipboard(item.en);
      row.appendChild(btnEn);
    }
    block.appendChild(row);
    main.appendChild(block);
  });
}

// Форматування для перегляду в браузері (відображає перенос рядків та жирний)
function formatMessageForHtml(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*([^\*]+)\*\*/g, '<b>$1</b>'); // в TG залишиться **жирний**, у браузері — жирний
}

// Копіювання у clipboard (залишає подвійні зірочки для Telegram!)
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}
