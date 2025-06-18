let data = [];
let activeTab = 0;

fetch('messages.json')
  .then(res => res.json())
  .then(json => {
    data = json.map(transformObject);
    renderSidebar();
    renderMain(0);
  });

// Універсальна функція для парсингу будь-яких вкладок
function transformObject(obj) {
  // Вкладка-повідомлення (з categories)
  if (obj.categories) {
    const items = [];
    Object.entries(obj.categories).forEach(([title, arr]) => {
      if (arr.length === 2) {
        items.push({ title, ukr: arr[0], en: arr[1] });
      }
    });
    return { tab: obj.tab, items };
  }
  // Вкладка FAQ
  if (obj.tab === "FAQ") {
    const items = (obj.items || []).map(el => ({
      title: el["Питання"] || '',
      ukr: el["Відповідь укр"] || '',
      en: el["Відповідь англ"] || ''
    }));
    return { tab: obj.tab, items };
  }
  // Вкладка "Обов'язки на різних позиціях"
  if (obj.tab && Array.isArray(obj.items) && obj.items[0]?.Позиція) {
    const items = obj.items.map(el => ({
      title: el["Позиція"] || '',
      ukr: el["Укр повідомлення"] || '',
      en: el["Англ повідомлення"] || ''
    }));
    return { tab: obj.tab, items };
  }
  // Вкладка Промпти для чату GPT (будь-яке ім'я вкладки)
  if (
    obj.tab === "Промпти для чату GPT" ||
    obj.tab === "GPT Chat Prompts"
  ) {
    const items = (obj.items || []).map(el => ({
      name: el["Назва"] || el["Name"] || '',
      prompt: el["Промпт"] || el["Prompt"] || ''
    }));
    return { tab: obj.tab, items };
  }
  // Інші (fallback)
  const items = (obj.items || []).map(el => ({
    title: el["Ситуація"] || '',
    ukr: el["Укр повідомлення"] || '',
    en: el["Англ повідомлення"] || ''
  }));
  return { tab: obj.tab, items };
}

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

function renderMain(tabIdx) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const tab = data[tabIdx];

  // Відображення вкладки GPT промптів
  if (tab.tab === "Промпти для чату GPT" || tab.tab === "GPT Chat Prompts") {
    tab.items.forEach(item => {
      const block = document.createElement('div');
      block.className = 'item-block';

      if (item.name) {
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = item.name;
        block.appendChild(title);
      }
      if (item.prompt) {
        const btnPrompt = document.createElement('button');
        btnPrompt.className = 'message-btn';
        btnPrompt.type = 'button';
        btnPrompt.textContent = item.prompt;
        btnPrompt.onclick = () => navigator.clipboard.writeText(item.prompt);
        block.appendChild(btnPrompt);
      }
      main.appendChild(block);
    });
    return;
  }

  // Відображення інших вкладок
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
    // Блоки повідомлень (укр, англ)
    const row = document.createElement('div');
    row.className = 'message-row';

    if (item.ukr) {
      const btnUkr = document.createElement('button');
      btnUkr.className = 'message-btn';
      btnUkr.type = 'button';
      btnUkr.textContent = item.ukr;
      btnUkr.onclick = () => navigator.clipboard.writeText(item.ukr);
      row.appendChild(btnUkr);
    }
    if (item.en) {
      const btnEn = document.createElement('button');
      btnEn.className = 'message-btn';
      btnEn.type = 'button';
      btnEn.textContent = item.en;
      btnEn.onclick = () => navigator.clipboard.writeText(item.en);
      row.appendChild(btnEn);
    }
    block.appendChild(row);
    main.appendChild(block);
  });
}
