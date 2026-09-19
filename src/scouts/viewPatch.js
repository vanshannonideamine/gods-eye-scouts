// src/scouts/viewPatch.js
(function(){
  if(window.__gesViewPatchV2)return;
  window.__gesViewPatchV2=true;
  function parseReadout(text){
    if(!text)return null;
    var dms=text.match(/(\d{1,3})°\s*(\d{1,2})'\s*([\d.]+)"?\s*([NS])[^\d\-]+(\d{1,3})°\s*(\d{1,2})'\s*([\d.]+)"?\s*([EW])/);
    if(dms){
      var lat=parseInt(dms[1],10)+parseInt(dms[2],10)/60+parseFloat(dms[3])/3600;
      var lon=parseInt(dms[5],10)+parseInt(dms[6],10)/60+parseFloat(dms[7])/3600;
      if(dms[4]==='S')lat=-lat;
      if(dms[8]==='W')lon=-lon;
      return lat.toFixed(4)+','+lon.toFixed(4);
    }
    var dd=text.match(/(-?\d{1,3}\.\d{3,})[^\d\-]+(-?\d{1,3}\.\d{3,})/);
    if(dd)return parseFloat(dd[1]).toFixed(4)+','+parseFloat(dd[2]).toFixed(4);
    return null;
  }
  function scanForCoords(){
    var nodes=document.querySelectorAll('body *');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.children.length>3)continue;
      if(!n.textContent)continue;
      if(n.textContent.length>200)continue;
      if(n.id&&n.id.indexOf('ges-scouts')===0)continue;
      if(n.closest&&n.closest('#ges-scouts-panel'))continue;
      var c=parseReadout(n.textContent);
      if(c)return c;
    }
    return null;
  }
  function tryPatch(){
    var panel=document.getElementById('ges-scouts-panel');
    if(!panel)return false;
    var row=panel.querySelector('.coord');
    if(!row)return false;
    var oldBtn=row.querySelector('button');
    if(!oldBtn)return false;
    if(oldBtn.dataset.patched==='v2')return true;
    var fresh=oldBtn.cloneNode(false);
    fresh.className=oldBtn.className;
    fresh.textContent='USE VIEW';
    fresh.dataset.patched='v2';
    fresh.addEventListener('click',function(){
      var c=scanForCoords();
      if(!c){
        var dump=[];
        var all=document.querySelectorAll('body *');
        for(var k=0;k<all.length&&dump.length<10;k++){
          var t=all[k].textContent;
          if(t&&/\d+°/.test(t)&&t.length<100&&all[k].children.length<3)dump.push(t.trim().slice(0,80));
        }
        console.warn('Scouts: coord scan failed. Candidates:',dump);
        alert('Could not find a coordinate on screen. Pan/zoom the globe once, then try again.\n\nConsole shows candidate text elements.');
        return;
      }
      var input=row.querySelector('input');
      input.value=c;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    });
    oldBtn.parentNode.replaceChild(fresh,oldBtn);
    return true;
  }
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    if(tryPatch()||tries>150)clearInterval(iv);
  },200);
})();