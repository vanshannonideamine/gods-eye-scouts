import * as Cesium from 'cesium';
import { getScoutIndex } from './names.js';

console.log('[Scouts] markers.js loaded');

(function () {
  if (window.__gesMarkersInstalled) return;
  window.__gesMarkersInstalled = true;

  function getViewer() {
    var v = window.__cesiumViewer;
    if (!v) return null;
    try { if (v.isDestroyed && v.isDestroyed()) return null; } catch(e){ return null; }
    return v;
  }

  var ds = null;
  function ensureDS(viewer) {
    if (ds) {
      try { if (!ds.isDestroyed || !ds.isDestroyed()) return ds; } catch(e){}
    }
    ds = new Cesium.CustomDataSource('ges-scouts-markers');
    viewer.dataSources.add(ds);
    return ds;
  }

  function refresh() {
    var viewer = getViewer();
    if (!viewer) return;
    var source = ensureDS(viewer);
    source.entities.removeAll();
    var items = getScoutIndex();
    items.forEach(function(it){
      var ent = source.entities.add({
        id: 'ges-scout-' + it.coord,
        position: Cesium.Cartesian3.fromDegrees(it.lon, it.lat, 0),
        point: {
          pixelSize: 26,
          color: Cesium.Color.fromCssColorString('#ff9500'),
          outlineColor: Cesium.Color.fromCssColorString('#0a0e14'),
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: String(it.index),
          font: 'bold 14px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        properties: { gesCoord: it.coord }
      });
      ent._gesScout = it;
    });
    window.__gesScoutCount = items.length;
  }

  function pulseMarker(coord) {
    var viewer = getViewer();
    if (!viewer) return;
    var ent = viewer.entities.getById('ges-scout-' + coord);
    if (!ent || !ent.point) return;
    var original = ent.point.pixelSize.getValue(Cesium.JulianDate.now());
    ent.point.pixelSize = 44;
    setTimeout(function(){ if (ent.point) ent.point.pixelSize = original; }, 700);
  }
  window.__gesPulseMarker = pulseMarker;

  function installClickHandler() {
    var viewer = getViewer();
    if (!viewer || window.__gesMarkerClickInstalled) return;
    window.__gesMarkerClickInstalled = true;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function(movement){
      var picked = viewer.scene.pick(movement.position);
      if (!Cesium.defined(picked) || !picked.id) return;
      var ent = picked.id;
      if (!ent.properties || !ent.properties.gesCoord) return;
      var coord = ent.properties.gesCoord.getValue();
      if (!coord) return;
      if (window.__gesOpenPlaces) window.__gesOpenPlaces(coord);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (getViewer()) {
      clearInterval(iv);
      refresh();
      installClickHandler();
      var origSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        origSet.apply(this, arguments);
        if (k === 'ges.scouts.v1') setTimeout(refresh, 200);
      };
      setInterval(refresh, 4000);
      return;
    }
    if (tries > 60) { clearInterval(iv); console.warn('[Scouts] no viewer'); }
  }, 500);

  console.log('[Scouts] markers module ready');
})();