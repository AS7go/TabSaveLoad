// 1. СОХРАНЕНИЕ ВКЛАДОК В ФАЙЛ
document.getElementById('saveBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  try {
    // Получаем все вкладки текущего окна
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    let content = "Менеджер вкладок — Список сохраненных ссылок\n";
    content += "========================================\n\n";
    
    tabs.forEach(tab => {
      // Сохраняем заголовок и URL в читаемом формате
      content += `Заголовок: ${tab.title}\n`;
      content += `URL: ${tab.url}\n`;
      content += "----------------------------------------\n";
    });
    
    // Создаем файл в памяти браузера
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Генерируем имя файла с текущей датой и временем
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    const filename = `tabs_${dateStr}_${timeStr}.txt`;
    
    // Создаем виртуальную ссылку для скачивания (вызывает системное окно сохранения)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    statusDiv.style.color = '#2e7d32';
    statusDiv.innerText = `✅ Сохранено вкладок: ${tabs.length}`;
  } catch (e) {
    statusDiv.style.color = '#c62828';
    statusDiv.innerText = `❌ Ошибка сохранения`;
    console.log(e);
  }
});

// 2. ЗАГРУЗКА ВКЛАДОК ИЗ ФАЙЛА
document.getElementById('loadBtn').addEventListener('click', () => {
  // Программно кликаем по скрытому выбору файлов
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const statusDiv = document.getElementById('status');
  
  if (!file) return;

  try {
    const text = await file.text();
    
    // Ищем все строки, начинающиеся с "URL: " с помощью регулярного выражения
    const urlMatches = text.match(/^URL:\s*(.+)$/gm);
    
    if (!urlMatches || urlMatches.length === 0) {
      statusDiv.style.color = '#c62828';
      statusDiv.innerText = `❌ Файл не содержит ссылок`;
      return;
    }

    let openedCount = 0;
    
    // Открываем каждую найденную ссылку в новой вкладке текущего окна
    for (let match of urlMatches) {
      const url = match.replace(/^URL:\s*/, '').trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await chrome.tabs.create({ url: url, active: false });
        openedCount++;
      }
    }
    
    statusDiv.style.color = '#2e7d32';
    statusDiv.innerText = `✅ Открыто вкладок: ${openedCount}`;
  } catch (e) {
    statusDiv.style.color = '#c62828';
    statusDiv.innerText = `❌ Ошибка чтения файла`;
    console.log(e);
  }
});