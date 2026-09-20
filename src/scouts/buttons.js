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
    wrap.style.cssText = [
      'position:fixed',
      'left:20px',
      'bottom:52px',
      'z-index:9998',
      'display:flex',
      'flex-direction:column',
      'gap:6px',
      'align-items:flex-start',
      'font-family:"JetBrains Mono",ui-monospace,Menlo,monospace'
    ].join(';');

    var postBtn = document.createElement('button');
    postBtn.id = 'ges-scouts-post';
    postBtn.textContent = '+ POST SCOUT REPORT';
    postBtn.style.cssText = [
      'background:rgba(12,12,20,0.72)',
      'border:1px solid rgba(0,212,255,0.28)',
      'color:#00d4ff',
      'padding:9px 14px',
      'border-radius:3px',
      'font-family:inherit',
      'font-size:10px',
      'font-weight:500',
      'letter-spacing:1.2px',
      'text-transform:uppercase',
      'cursor:pointer',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'transition:all .18s ease',
      'box-shadow:0 1px 12px rgba(0,0,0,0.4)'
    ].join(';');
    postBtn.addEventListener('mouseenter', function(){
      postBtn.style.borderColor = 'rgba(0,212,255,0.7)';
      postBtn.style.boxShadow = '0 0 16px rgba(0,212,255,0.28)';
      postBtn.style.color = '#7ee7ff';
    });
    postBtn.addEventListener('mouseleave', function(){
      postBtn.style.borderColor = 'rgba(0,212,255,0.28)';
      postBtn.style.boxShadow = '0 1px 12px rgba(0,0,0,0.4)';
      postBtn.style.color = '#00d4ff';
    });
    postBtn.addEventListener('click', function(){ oldFab.click(); });

    var placesBtn = document.createElement('button');
    placesBtn.id = 'ges-scouts-places';
    placesBtn.textContent = '\u25CE SCOUT PLACES (0)';
    placesBtn.style.cssText = [
      'background:rgba(12,12,20,0.72)',
      'border:1px solid rgba(255,255,255,0.08)',
      'color:#c8d0d9',
      'padding:8px 14px',
      'border-radius:3px',
      'font-family:inherit',
      'font-size:10px',
      'font-weight:500',
      'letter-spacing:1.2px',
      'text-transform:uppercase',
      'cursor:pointer',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'transition:all .18s ease',
      'box-shadow:0 1px 12px rgba(0,0,0,0.4)'
    ].join(';');
    placesBtn.addEventListener('mouseenter', function(){
      placesBtn.style.borderColor = 'rgba(255,255,255,0.22)';
      placesBtn.style.color = '#ffffff';
    });
    placesBtn.addEventListener('mouseleave', function(){
      placesBtn.style.borderColor = 'rgba(255,255,255,0.08)';
      placesBtn.style.color = '#c8d0d9';
    });
    placesBtn.addEventListener('click', function(){
      console.log('[Scouts] PLACES button clicked');
      if (window.__gesOpenPlaces) { window.__gesOpenPlaces(); console.log('[Scouts] drawer opened'); }
      else { console.warn('[Scouts] __gesOpenPlaces not defined'); }
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
        placesBtn.textContent = '\u25CE SCOUT PLACES (' + n + ')';
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