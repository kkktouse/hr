// Завантаження і відображення категорій/повідомлень
let data = [];
let activeTab = 0;

fetch('messages.json')
  .then(res => res.json())
  .then(json => {
    data = json.map(transformObject);
    renderSidebar();
    renderMain(0);
  });

// Формуємо масив items у уніфікованому вигляді з полями: title (заголовок), ukr, en
function transformObject(obj) {
  // Для категорії з categories
  if (obj.categories) {
    const items = [];
    Object.entries(obj.categories).forEach(([situation, arr]) => {
      if (arr.length === 2) {
        items.push({ title: situation, ukr: arr[0], en: arr[1] });
      }
    });
    return { tab: obj.tab, items };
  }
  // FAQ: Питання, Відповідь укр, Відповідь англ
  if (obj.tab === "FAQ") {
    const items = (obj.items || []).map(el => ({
      title: el["Питання"] || '',
      ukr: el["Відповідь укр"] || '',
      en: el["Відповідь англ"] || ''
    }));
    return { tab: obj.tab, items };
  }
  // Обов'язки: Позиція, Укр повідомлення, Англ повідомлення
  if (obj.tab && Array.isArray(obj.items) && obj.items[0]?.Позиція) {
    const items = obj.items.map(el => ({
      title: el["Позиція"] || '',
      ukr: el["Укр повідомлення"] || '',
      en: el["Англ повідомлення"] || ''
    }));
    return { tab: obj.tab, items };
  }
  // Інші категорії: Ситуація, Укр повідомлення, Англ повідомлення
  const items = (obj.items || []).map(el => ({
    title: el["Ситуація"] || '',
    ukr: el["Укр повідомлення"] || '',
    en: el["Англ повідомлення"] || ''
  }));
  return { tab: obj.tab, items };
}

// Відображення бокового меню
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

// Відображення центральної панелі
function renderMain(tabIdx) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const tab = data[tabIdx];
  tab.items.forEach(item => {
    const block = document.createElement('div');
    block.className = 'item-block';

    // Заголовок (питання/позиція/ситуація)
    if (item.title) {
      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = item.title;
      block.appendChild(title);
    }

    // Блоки для повідомлень
    const row = document.createElement('div');
    row.className = 'message-row';

    if (item.ukr) {
      const btnUkr = document.createElement('button');
      btnUkr.className = 'message-btn';
      btnUkr.type = 'button';
      btnUkr.innerHTML = item.ukr;
      btnUkr.onclick = () => navigator.clipboard.writeText(item.ukr);
      row.appendChild(btnUkr);
    }
    if (item.en) {
      const btnEn = document.createElement('button');
      btnEn.className = 'message-btn';
      btnEn.type = 'button';
      btnEn.innerHTML = item.en;
      btnEn.onclick = () => navigator.clipboard.writeText(item.en);
      row.appendChild(btnEn);
    }
    block.appendChild(row);
    main.appendChild(block);
  });
}
