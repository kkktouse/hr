// Завантаження і відображення категорій/повідомлень
let data = [];
let activeTab = 0;

fetch('messages.json')
  .then(res => res.json())
  .then(json => {
    data = json.map(transformObject); // Стандартизуємо всі категорії в один формат
    renderSidebar();
    renderMain(0);
  });

// Перетворюємо дані до єдиного формату: tab, items[{ Ситуація/Питання/Позиція, Укр повідомлення, Англ повідомлення }]
function transformObject(obj) {
  if (obj.items) return obj;
  // Якщо є categories (наприклад, перший об'єкт)
  if (obj.categories) {
    const items = [];
    Object.entries(obj.categories).forEach(([situation, arr]) => {
      if (arr.length === 2) { // [ukr, en]
        items.push({
          "Ситуація": situation,
          "Укр повідомлення": arr[0],
          "Англ повідомлення": arr[1]
        });
      }
    });
    return { tab: obj.tab, items };
  }
  // Для FAQ — трохи інші ключі
  if (obj.tab === "FAQ") {
    const items = (obj.items || []).map(el => ({
      "Ситуація": el["Питання"],
      "Укр повідомлення": el["Відповідь укр"],
      "Англ повідомлення": el["Відповідь англ"]
    }));
    return { tab: obj.tab, items };
  }
  // Для "Обов'язки..." — трохи інші ключі
  if (obj.tab && Array.isArray(obj.items) && obj.items[0]?.Позиція) {
    const items = obj.items.map(el => ({
      "Ситуація": el["Позиція"],
      "Укр повідомлення": el["Укр повідомлення"],
      "Англ повідомлення": el["Англ повідомлення"]
    }));
    return { tab: obj.tab, items };
  }
  return obj;
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

    // Назва ситуації/питання
    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = item["Ситуація"] || '';
    block.appendChild(title);

    // Блоки для повідомлень
    const row = document.createElement('div');
    row.className = 'message-row';

    if (item["Укр повідомлення"]) {
      const btnUkr = document.createElement('button');
      btnUkr.className = 'message-btn';
      btnUkr.type = 'button';
      btnUkr.innerHTML = item["Укр повідомлення"];
      btnUkr.onclick = () => navigator.clipboard.writeText(item["Укр повідомлення"]);
      row.appendChild(btnUkr);
    }
    if (item["Англ повідомлення"]) {
      const btnEn = document.createElement('button');
      btnEn.className = 'message-btn';
      btnEn.type = 'button';
      btnEn.innerHTML = item["Англ повідомлення"];
      btnEn.onclick = () => navigator.clipboard.writeText(item["Англ повідомлення"]);
      row.appendChild(btnEn);
    }
    block.appendChild(row);
    main.appendChild(block);
  });
}
