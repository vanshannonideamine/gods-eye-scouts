import './places.js';

console.log('[Scouts] buttons.js loaded');

(function(){
  if (window.__gesButtonsInstalled) return;
  window.__gesButtonsInstalled = true;

  function install(){
    var oldFab = document.getElementById('ges-scouts-fab');
    if (!oldFab) { setTimeout(install, 300); return; }
    oldFab.style.display = 'none';

    var wrap = document.createElement('div');
    wrap.id = 'ges-scouts-pills';
    wrap.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:9998;display:flex;flex-direction:column;gap:8px;align-items:flex-end;font-family:-apple-system,system-ui,sans-serif';

    var postBtn = document.createElement('button');
    postBtn.id = 'ges-scouts-post';
    postBtn.textContent = '\u2295  POST SCOUT REPORT';
    postBtn.style.cssText = 'background:#0f141b;border:2px solid #ff9500;color:#ff9500;padding:12px 20px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:.5px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.6);text-transform:uppercase;font-family:inherit';
    postBtn.addEventListener('click', function(){ oldFab.click(); });

    var placesBtn = document.createElement('button');
    placesBtn.id = 'ges-scouts-places';
    placesBtn.textContent = '\u25CE  SCOUT PLACES (0)';
    placesBtn.style.cssText = 'background:#0f141b;border:2px solid #4ea1ff;color:#4ea1ff;padding:10px 20px;border-radius:6px;font-size:12px;font-weight:600;letter-spacing:.5px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.6);text-transform:uppercase;font-family:inherit';
    placesBtn.addEventListener('click', function(){
      if (window.__gesOpenPlaces) window.__gesOpenPlaces();
    });

    function updateCount(){
      try {
        var store = JSON.parse(localStorage.getItem('ges.scouts.v1') || '{}');
        var n = 0;
        Object.keys(store).forEach(function(k){
          if (k.indexOf('coord:') !== 0) return;
          var b = store[k] || {};
          if ((b.threads || []).length > 0) n++;
        });
        placesBtn.textContent = '\u25CE  SCOUT PLACES (' + n + ')';
      } catch(e){}
    }
    updateCount();
    setInterval(updateCount, 2000);

    wrap.appendChild(postBtn);
    wrap.appendChild(placesBtn);
    document.body.appendChild(wrap);
    console.log('[Scouts] labeled pills installed');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();