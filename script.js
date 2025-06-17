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
  // 1. categories (перша категорія)
  if (obj.categories) {
    const items = [];
    Object.entries(obj.categories).forEach(([situation, arr]) => {
      if (arr.length === 2) {
        items.push({ title: situation, ukr: adaptToTelegram(arr[0]), en: adaptToTelegram(arr[1]) });
      }
    });
    return { tab: obj.tab, items };
  }
  // 2. FAQ (Питання)
  if (obj.items && obj.items.length && obj.items.every(el => "Питання" in el)) {
    const items = obj.items.map(el => ({
      title: el["Питання"] || '',
      ukr: adaptToTelegram(el["Відповідь укр"] || ''),
      en: adaptToTelegram(el["Відповідь англ"] || '')
    }));
    return { tab: obj.tab, items };
  }
  // 3. Обов'язки (Позиція)
  if (obj.items && obj.items.length && obj.items.every(el => "Позиція" in el)) {
    const items = obj.items.map(el => ({
      title: el["Позиція"] || '',
      ukr: adaptToTelegram(el["Укр повідомлення"] || ''),
      en: adaptToTelegram(el["Англ повідомлення"] || '')
    }));
    return { tab: obj.tab, items };
  }
  // 4. Інші категорії (items)
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
  // Заміна **жирного** → *курсив* для TG, булети, відступи для Telegram
  return text
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^[-•]\s?/gm, '— ')
    .replace(/\n{2,}/g, '\n\n')        // подвійні переноси як і в TG
    .replace(/\n/g, '\n')              // одинарний перенос — для TG це ок
    .replace(/ {2,}/g, ' ')
    .replace(/• /g, '— ')
    .replace(/  +/g, ' ')
    .trim();
}

// Бокове меню
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

// Відображення повідомлень
function renderMain(tabIdx) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const tab = data[tabIdx];
  tab.items.forEach(item => {
    const block = document.createElement('div');
    block.className = 'item-block';

    // Додаємо заголовок (назва ситуації/позиції/питання)
    if (item.title) {
      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = item.title;
      block.appendChild(title);
    }

    // Рядок із кнопками/блоками повідомлень
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

// Форматуємо для браузерного перегляду (залишаємо переноси для читабельності)
function formatMessageForHtml(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*([^\*]+)\*/g, '<b>$1</b>'); // виділяємо жирним для візуалу
}

// Копіювання для Telegram (копіюється plain text)
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}
