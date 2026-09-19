import * as Cesium from 'cesium';
(function(){
  if (window.__gesCesiumHooked) return;
  window.__gesCesiumHooked = true;
  function hookProto(ctor, name) {
    try {
      if (!ctor || !ctor.prototype) { console.warn('[Scouts] no ctor ' + name); return; }
      var orig = ctor.prototype.render;
      if (typeof orig !== 'function') { console.warn('[Scouts] no render on ' + name); return; }
      ctor.prototype.render = function() {
        if (!window.__cesiumViewer) {
          window.__cesiumViewer = this;
          console.log('[Scouts] CAPTURED viewer via ' + name + '.prototype.render');
        }
        return orig.apply(this, arguments);
      };
      console.log('[Scouts] hooked ' + name + '.prototype.render');
    } catch(e) { console.warn('[Scouts] hook failed for ' + name, e); }
  }
  hookProto(Cesium.Viewer, 'Viewer');
  hookProto(Cesium.CesiumWidget, 'CesiumWidget');
})();