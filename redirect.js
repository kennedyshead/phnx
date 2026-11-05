(() => {
  const target = new URL('https://phnx.botwork.se/');
  target.search = window.location.search;
  target.hash = window.location.hash;
  const link = document.getElementById('destination');
  if (link) link.href = target.href;
  window.location.replace(target.href);
})();
