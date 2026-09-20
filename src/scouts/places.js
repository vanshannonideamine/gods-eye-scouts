import * as Cesium from 'cesium';
import { getScoutIndex, reverseGeocode, setCachedName } from './names.js';

console.log('[Scouts] places.js loaded');

(function(){
  if (window.__gesPlacesInstalled) return;
  window.__gesPlacesInstalled = true;

  var geocodeQueue = [];
  var geocoding = false;

  function processQueue() {
    if (geocoding || geocodeQueue.length === 0) return;
    geocoding = true;
    var item = geocodeQueue.shift();
    reverseGeocode(item.lat, item.lon).then(function(name){
      if (name) setCachedName(item.key, name);
      geocoding = false;
      render();
      processQueue();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function humanTimeAgo(ts) {
    if (!ts) return '';
    var d = Date.now() - ts;
    var m = Math.floor(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var dy = Math.floor(h / 24);
    if (dy < 30) return dy + 'd ago';
    var mo = Math.floor(dy / 30);
    if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function render() {
    var el = document.getElementById('ges-places-list');
    if (!el) return;
    var items = getScoutIndex();
    if (!items.length) {
      el.innerHTML = '<div style="padding:32px 16px;text-align:center;color:#5c6675;font-size:12px;line-height:1.6">No scout reports yet.<br><br>Click <b style="color:#ff9500">POST SCOUT REPORT</b> below to add your first one.</div>';
      return;
    }
    var pending = false;

    // Compute proximity cluster size for each item (reports within 5km)
    items.forEach(function(it){
      it.nearby = items.filter(function(o){
        return o !== it && haversineKm(it.lat, it.lon, o.lat, o.lon) < 5;
      }).length;
    });

    el.innerHTML = items.map(function(it){
      var name = it.name;
      var sub;
      if (name) {
        sub = '<div style="font-size:13px;font-weight:600;color:#e6edf3;margin-bottom:2px">' + esc(name) + '</div>';
      } else {
        geocodeQueue.push(it);
        pending = true;
        sub = '<div style="font-size:13px;font-weight:600;color:#8b95a3;margin-bottom:2px">Locating\u2026</div>';
      }
      var preview = it.first ? esc(it.first.slice(0, 60)) + (it.first.length > 60 ? '\u2026' : '') : '';

      // Context line: reports, recency, proximity cluster
      var ctx = it.count + ' report' + (it.count === 1 ? '' : 's');
      if (it.lastTs) ctx += ' \u00B7 ' + humanTimeAgo(it.lastTs);
      if (it.nearby > 0) ctx += ' \u00B7 ' + it.nearby + ' nearby';

      return '<div class="ges-place" data-coord="' + it.coord + '" style="padding:12px 16px;border-bottom:1px solid #232b36;cursor:pointer;transition:background .12s">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:#ff9500;color:#0a0e14;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center">' + it.index + '</div>' +
          '<div style="flex:1;min-width:0">' +
            sub +
            '<div style="font-size:11px;color:#8b95a3">' + esc(ctx) + '</div>' +
            (preview ? '<div style="font-size:11px;color:#5c6675;margin-top:3px;font-style:italic">"' + preview + '"</div>' : '') +
          '</div>' +
          '<div style="flex-shrink:0;color:#ff9500;font-size:11px;font-weight:600;align-self:center">VIEW \u2192</div>' +
        '</div>' +
      '</div>';
    }).join('');
    if (pending) processQueue();

    Array.prototype.forEach.call(el.querySelectorAll('.ges-place'), function(row){
      row.addEventListener('mouseenter', function(){ row.style.background = '#151b24'; });
      row.addEventListener('mouseleave', function(){ row.style.background = 'transparent'; });
      row.addEventListener('click', function(){
        var coord = row.dataset.coord;
        var parts = coord.split(',');
        var lat = parseFloat(parts[0]);
        var lon = parseFloat(parts[1]);
        if (!isFinite(lat) || !isFinite(lon)) return;
        var viewer = window.__cesiumViewer;
        if (viewer) {
          try { viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat, 50000), duration: 1.8 }); }
          catch(e){}
        }
        if (window.__gesPulseMarker) window.__gesPulseMarker(coord);
      });
    });
  }

  function showHelp() {
    var existing = document.getElementById('ges-places-help');
    if (existing) { existing.remove(); return; }
    var h = document.createElement('div');
    h.id = 'ges-places-help';
    h.style.cssText = 'position:absolute;top:56px;right:16px;left:16px;background:#151b24;border:1px solid #2d3845;border-radius:6px;padding:14px 16px;font-size:12px;line-height:1.6;color:#8b95a3;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.6)';
    h.innerHTML =
      '<div style="font-weight:600;color:#e6edf3;margin-bottom:6px">What is a Scout Place?</div>' +
      'Each numbered item is a location where someone posted a scout report. The number matches the marker on the globe.<br><br>' +
      'The line under each name shows: number of reports, how recent the latest one is, and how many other scout reports are nearby (within 5km).<br><br>' +
      '<span style="color:#ff9500">VIEW \u2192</span> flies the camera to that location.';
    document.getElementById('ges-places-drawer').appendChild(h);
  }

  function build() {
    var d = document.createElement('div');
    d.id = 'ges-places-drawer';
    d.style.cssText = 'position:fixed;right:0;top:0;bottom:0;width:360px;max-width:88vw;background:#0f141b;border-left:1px solid #232b36;z-index:9997;transform:translateX(100%);transition:transform .25s;display:flex;flex-direction:column;font-family:-apple-system,system-ui,sans-serif;color:#e6edf3;box-shadow:-8px 0 40px rgba(0,0,0,.6);position:fixed';
    d.innerHTML =
      '<div style="padding:14px 16px;border-bottom:1px solid #232b36;display:flex;align-items:center;gap:10px;position:relative">' +
        '<div style="width:20px;height:20px;border-radius:50%;border:2px solid #4ea1ff;position:relative"></div>' +
        '<div style="font-weight:600;letter-spacing:.3px">Scout Places</div>' +
        '<button id="ges-places-help-btn" style="margin-left:auto;background:transparent;color:#8b95a3;border:1px solid #232b36;border-radius:4px;width:24px;height:24px;font-size:12px;cursor:pointer;font-family:inherit;font-weight:700">?</button>' +
        '<button id="ges-places-close" style="background:transparent;color:#8b95a3;border:1px solid #232b36;border-radius:4px;padding:4px 8px;font-size:11px;cursor:pointer;font-family:inherit">CLOSE</button>' +
      '</div>' +
      '<div id="ges-places-list" style="flex:1;overflow-y:auto"></div>';
    document.body.appendChild(d);
    document.getElementById('ges-places-close').addEventListener('click', function(){
      d.style.transform = 'translateX(100%)';
      var h = document.getElementById('ges-places-help');
      if (h) h.remove();
    });
    document.getElementById('ges-places-help-btn').addEventListener('click', showHelp);
    return d;
  }

  window.__gesOpenPlaces = function(highlightCoord) {
    var d = document.getElementById('ges-places-drawer') || build();
    render();
    d.style.transform = 'translateX(0)';
    if (highlightCoord) {
      setTimeout(function(){
        var list = document.getElementById('ges-places-list');
        if (!list) return;
        Array.prototype.forEach.call(list.querySelectorAll('.ges-place'), function(row){
          if (row.dataset.coord === highlightCoord) {
            row.style.background = '#1a222c';
            row.scrollIntoView({ block: 'center', behavior: 'smooth' });
            setTimeout(function(){ row.style.background = 'transparent'; }, 2500);
          }
        });
      }, 150);
    }
  };

  var origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function(k, v){
    origSet.apply(this, arguments);
    if (k === 'ges.scouts.v1') setTimeout(render, 200);
  };
})();