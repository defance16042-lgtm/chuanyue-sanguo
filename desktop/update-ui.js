(() => {
  const box = document.getElementById('update-status');
  const label = document.getElementById('update-message');
  const progress = document.getElementById('update-progress');
  const install = document.getElementById('update-install');
  if (!box || !label || !window.desktopApp?.onUpdateStatus) return;

  let hideTimer = 0;
  const hideLater = (delay) => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { box.hidden = true; }, delay);
  };

  window.desktopApp.onUpdateStatus((event) => {
    if (!event || typeof event.status !== 'string') return;
    box.hidden = false;
    label.textContent = event.message || '';
    progress.hidden = event.status !== 'downloading';
    if (!progress.hidden) progress.value = Math.max(0, Math.min(100, Number(event.percent) || 0));
    install.hidden = event.status !== 'downloaded';

    if (event.status === 'current') hideLater(3500);
    else if (event.status === 'error') hideLater(8000);
    else clearTimeout(hideTimer);
  });

  install.addEventListener('click', () => window.desktopApp.installUpdate());
})();
