var CACHE_KEY = 'ges.scouts.names';

export function getCachedName(key) {
  try {
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return c[key] || null;
  } catch(e){ return null; }
}

export function setCachedName(key, name) {
  try {
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    c[key] = name;
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch(e){}
}

function tryGeocode(lat, lon, zoom) {
  return fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=' + zoom, {
    headers: { 'Accept': 'application/json' }
  }).then(function(r){
    if (!r.ok) throw new Error('nominatim ' + r.status);
    return r.json();
  });
}

export function reverseGeocode(lat, lon) {
  // Try city level first, then state, then country. Fall back to coordinates.
  return tryGeocode(lat, lon, 10).then(function(j){
    var a = (j && j.address) || {};
    var city = a.city || a.town || a.village || a.suburb || a.hamlet || a.county;
    var state = a.state || a.region;
    if (city && state) return city + ', ' + state;
    if (city) return city;
    if (state) return state;
    throw new Error('no city');
  }).catch(function(){
    return tryGeocode(lat, lon, 5).then(function(j){
      var a = (j && j.address) || {};
      var state = a.state || a.region;
      var country = a.country;
      if (state && country) return state + ', ' + country;
      if (state) return state;
      if (country) return country;
      throw new Error('no state');
    });
  }).catch(function(){
    // Final fallback: coordinates, which is always honest
    return lat.toFixed(2) + ', ' + lon.toFixed(2);
  });
}

export function getScoutIndex() {
  var store;
  try { store = JSON.parse(localStorage.getItem('ges.scouts.v1') || '{}'); }
  catch(e){ return []; }
  var items = [];
  Object.keys(store).forEach(function(k){
    if (k.indexOf('coord:') !== 0) return;
    var b = store[k] || {};
    var threads = b.threads || [];
    if (threads.length === 0) return;
    var parts = k.slice(6).split(',');
    var lat = parseFloat(parts[0]);
    var lon = parseFloat(parts[1]);
    if (!isFinite(lat) || !isFinite(lon)) return;
    var lastTs = 0;
    threads.forEach(function(t){ if ((t.ts || 0) > lastTs) lastTs = t.ts || 0; });
    items.push({
      key: k,
      coord: k.slice(6),
      lat: lat,
      lon: lon,
      count: threads.length,
      first: (threads[0] && threads[0].text) || '',
      lastTs: lastTs,
      name: getCachedName(k)
    });
  });
  items.sort(function(a, b){ return b.lastTs - a.lastTs; });
  items.forEach(function(it, i){ it.index = i + 1; });
  return items;
}