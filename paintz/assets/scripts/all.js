HTMLCanvasElement.prototype.toBlob=HTMLCanvasElement.prototype.toBlob||HTMLCanvasElement.prototype.msToBlob,HTMLCanvasElement.prototype.toBlob||Object.defineProperty(HTMLCanvasElement.prototype,"toBlob",{value:function(t,o,e){var n=this.toDataURL(o,e).split(",")[1];setTimeout(function(){for(var e=atob(n),a=e.length,l=new Uint8Array(a),p=0;p<a;p++)l[p]=e.charCodeAt(p);t(new Blob([l],{type:o||"image/png"}))})}});
(function(s,t,u){var v=(s.SVGAngle||t.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML"),picker,slide,hueOffset=15,svgNS='http://www.w3.org/2000/svg';var w=['<div class="picker-wrapper">','<div class="picker"></div>','<div class="picker-indicator"></div>','</div>','<div class="slide-wrapper">','<div class="slide"></div>','<div class="slide-indicator"></div>','</div>'].join('');function mousePosition(a){if(s.event&&s.event.contentOverflow!==u){return{x:s.event.offsetX,y:s.event.offsetY}}if(a.offsetX!==u&&a.offsetY!==u){return{x:a.offsetX,y:a.offsetY}}var b=a.target.parentNode.parentNode;return{x:a.layerX-b.offsetLeft,y:a.layerY-b.offsetTop}}function $(a,b,c){a=t.createElementNS(svgNS,a);for(var d in b)a.setAttribute(d,b[d]);if(Object.prototype.toString.call(c)!='[object Array]')c=[c];var i=0,len=(c[0]&&c.length)||0;for(;i<len;i++)a.appendChild(c[i]);return a}if(v=='SVG'){slide=$('svg',{xmlns:'http://www.w3.org/2000/svg',version:'1.1',width:'100%',height:'100%'},[$('defs',{},$('linearGradient',{id:'gradient-hsv',x1:'0%',y1:'100%',x2:'0%',y2:'0%'},[$('stop',{offset:'0%','stop-color':'#FF0000','stop-opacity':'1'}),$('stop',{offset:'13%','stop-color':'#FF00FF','stop-opacity':'1'}),$('stop',{offset:'25%','stop-color':'#8000FF','stop-opacity':'1'}),$('stop',{offset:'38%','stop-color':'#0040FF','stop-opacity':'1'}),$('stop',{offset:'50%','stop-color':'#00FFFF','stop-opacity':'1'}),$('stop',{offset:'63%','stop-color':'#00FF40','stop-opacity':'1'}),$('stop',{offset:'75%','stop-color':'#0BED00','stop-opacity':'1'}),$('stop',{offset:'88%','stop-color':'#FFFF00','stop-opacity':'1'}),$('stop',{offset:'100%','stop-color':'#FF0000','stop-opacity':'1'})])),$('rect',{x:'0',y:'0',width:'100%',height:'100%',fill:'url(#gradient-hsv)'})]);picker=$('svg',{xmlns:'http://www.w3.org/2000/svg',version:'1.1',width:'100%',height:'100%'},[$('defs',{},[$('linearGradient',{id:'gradient-black',x1:'0%',y1:'100%',x2:'0%',y2:'0%'},[$('stop',{offset:'0%','stop-color':'#000000','stop-opacity':'1'}),$('stop',{offset:'100%','stop-color':'#CC9A81','stop-opacity':'0'})]),$('linearGradient',{id:'gradient-white',x1:'0%',y1:'100%',x2:'100%',y2:'100%'},[$('stop',{offset:'0%','stop-color':'#FFFFFF','stop-opacity':'1'}),$('stop',{offset:'100%','stop-color':'#CC9A81','stop-opacity':'0'})])]),$('rect',{x:'0',y:'0',width:'100%',height:'100%',fill:'url(#gradient-white)'}),$('rect',{x:'0',y:'0',width:'100%',height:'100%',fill:'url(#gradient-black)'})])}else if(v=='VML'){slide=['<DIV style="position: relative; width: 100%; height: 100%">','<v:rect style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" stroked="f" filled="t">','<v:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></v:fill>','</v:rect>','</DIV>'].join('');picker=['<DIV style="position: relative; width: 100%; height: 100%">','<v:rect style="position: absolute; left: -1px; top: -1px; width: 101%; height: 101%" stroked="f" filled="t">','<v:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>','</v:rect>','<v:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t">','<v:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>','</v:rect>','</DIV>'].join('');if(!t.namespaces['v'])t.namespaces.add('v','urn:schemas-microsoft-com:vml','#default#VML')}function hsv2rgb(a){var R,G,B,X,C;var h=(a.h%360)/60;C=a.v*a.s;X=C*(1-Math.abs(h%2-1));R=G=B=a.v-C;h=~~h;R+=[C,X,0,0,X,C][h];G+=[X,C,C,X,0,0][h];B+=[0,0,X,C,C,X][h];var r=Math.floor(R*255);var g=Math.floor(G*255);var b=Math.floor(B*255);return{r:r,g:g,b:b,hex:"#"+(16777216|b|(g<<8)|(r<<16)).toString(16).slice(1)}}function rgb2hsv(a){var r=a.r;var g=a.g;var b=a.b;if(a.r>1||a.g>1||a.b>1){r/=255;g/=255;b/=255}var H,S,V,C;V=Math.max(r,g,b);C=V-Math.min(r,g,b);H=(C==0?null:V==r?(g-b)/C+(g<b?6:0):V==g?(b-r)/C+2:(r-g)/C+4);H=(H%6)*60;S=C==0?0:C/V;return{h:H,s:S,v:V}}function slideListener(d,e,f){return function(a){a=a||s.event;var b=mousePosition(a);d.h=b.y/e.offsetHeight*360+hueOffset;d.s=d.v=1;var c=hsv2rgb({h:d.h,s:1,v:1});f.style.backgroundColor=c.hex;d.callback&&d.callback(c.hex,{h:d.h-hueOffset,s:d.s,v:d.v},{r:c.r,g:c.g,b:c.b},u,b)}};function pickerListener(d,e){return function(a){a=a||s.event;var b=mousePosition(a),width=e.offsetWidth,height=e.offsetHeight;d.s=b.x/width;d.v=(height-b.y)/height;var c=hsv2rgb(d);d.callback&&d.callback(c.hex,{h:d.h-hueOffset,s:d.s,v:d.v},{r:c.r,g:c.g,b:c.b},b)}};var x=0;function ColorPicker(f,g,h){if(!(this instanceof ColorPicker))return new ColorPicker(f,g,h);this.h=0;this.s=1;this.v=1;if(!h){var i=f;i.innerHTML=w;this.slideElement=i.getElementsByClassName('slide')[0];this.pickerElement=i.getElementsByClassName('picker')[0];var j=i.getElementsByClassName('slide-indicator')[0];var k=i.getElementsByClassName('picker-indicator')[0];ColorPicker.fixIndicators(j,k);this.callback=function(a,b,c,d,e){ColorPicker.positionIndicators(j,k,e,d);g(a,b,c)}}else{this.callback=h;this.pickerElement=g;this.slideElement=f}if(v=='SVG'){var l=slide.cloneNode(true);var m=picker.cloneNode(true);var n=l.getElementsByTagName('linearGradient')[0];var o=l.getElementsByTagName('rect')[0];n.id='gradient-hsv-'+x;o.setAttribute('fill','url(#'+n.id+')');var p=[m.getElementsByTagName('linearGradient')[0],m.getElementsByTagName('linearGradient')[1]];var q=m.getElementsByTagName('rect');p[0].id='gradient-black-'+x;p[1].id='gradient-white-'+x;q[0].setAttribute('fill','url(#'+p[1].id+')');q[1].setAttribute('fill','url(#'+p[0].id+')');this.slideElement.appendChild(l);this.pickerElement.appendChild(m);x++}else{this.slideElement.innerHTML=slide;this.pickerElement.innerHTML=picker}addEventListener(this.slideElement,'click',slideListener(this,this.slideElement,this.pickerElement));addEventListener(this.pickerElement,'click',pickerListener(this,this.pickerElement));enableDragging(this,this.slideElement,slideListener(this,this.slideElement,this.pickerElement));enableDragging(this,this.pickerElement,pickerListener(this,this.pickerElement))};function addEventListener(a,b,c){if(a.attachEvent){a.attachEvent('on'+b,c)}else if(a.addEventListener){a.addEventListener(b,c,false)}}function enableDragging(b,c,d){var e=false;addEventListener(c,'mousedown',function(a){e=true});addEventListener(c,'mouseup',function(a){e=false});addEventListener(c,'mouseout',function(a){e=false});addEventListener(c,'mousemove',function(a){if(e){d(a)}})}ColorPicker.hsv2rgb=function(a){var b=hsv2rgb(a);delete b.hex;return b};ColorPicker.hsv2hex=function(a){return hsv2rgb(a).hex};ColorPicker.rgb2hsv=rgb2hsv;ColorPicker.rgb2hex=function(a){return hsv2rgb(rgb2hsv(a)).hex};ColorPicker.hex2hsv=function(a){return rgb2hsv(ColorPicker.hex2rgb(a))};ColorPicker.hex2rgb=function(a){return{r:parseInt(a.substr(1,2),16),g:parseInt(a.substr(3,2),16),b:parseInt(a.substr(5,2),16)}};function setColor(a,b,d,e){a.h=b.h%360;a.s=b.s;a.v=b.v;var c=hsv2rgb(a);var f={y:(a.h*a.slideElement.offsetHeight)/360,x:0};var g=a.pickerElement.offsetHeight;var h={x:a.s*a.pickerElement.offsetWidth,y:g-a.v*g};a.pickerElement.style.backgroundColor=hsv2rgb({h:a.h,s:1,v:1}).hex;a.callback&&a.callback(e||c.hex,{h:a.h,s:a.s,v:a.v},d||{r:c.r,g:c.g,b:c.b},h,f);return a};ColorPicker.prototype.setHsv=function(a){return setColor(this,a)};ColorPicker.prototype.setRgb=function(a){return setColor(this,rgb2hsv(a),a)};ColorPicker.prototype.setHex=function(a){return setColor(this,ColorPicker.hex2hsv(a),u,a)};ColorPicker.positionIndicators=function(a,b,c,d){if(c){b.style.left='auto';b.style.right='0px';b.style.top='0px';a.style.top=(c.y-a.offsetHeight/2)+'px'}if(d){b.style.top=(d.y-b.offsetHeight/2)+'px';b.style.left=(d.x-b.offsetWidth/2)+'px'}};ColorPicker.fixIndicators=function(a,b){b.style.pointerEvents='none';a.style.pointerEvents='none'};s.ColorPicker=ColorPicker})(window,window.document);
/*!
 * PEP v0.4.3 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.PointerEventsPolyfill=b()}(this,function(){"use strict";function a(a,b){b=b||Object.create(null);var c=document.createEvent("Event");c.initEvent(a,b.bubbles||!1,b.cancelable||!1);for(var d,e=2;e<m.length;e++)d=m[e],c[d]=b[d]||n[e];c.buttons=b.buttons||0;var f=0;return f=b.pressure&&c.buttons?b.pressure:c.buttons?.5:0,c.x=c.clientX,c.y=c.clientY,c.pointerId=b.pointerId||0,c.width=b.width||0,c.height=b.height||0,c.pressure=f,c.tiltX=b.tiltX||0,c.tiltY=b.tiltY||0,c.twist=b.twist||0,c.tangentialPressure=b.tangentialPressure||0,c.pointerType=b.pointerType||"",c.hwTimestamp=b.hwTimestamp||0,c.isPrimary=b.isPrimary||!1,c}function b(){this.array=[],this.size=0}function c(a,b,c,d){this.addCallback=a.bind(d),this.removeCallback=b.bind(d),this.changedCallback=c.bind(d),A&&(this.observer=new A(this.mutationWatcher.bind(this)))}function d(a){return"body /shadow-deep/ "+e(a)}function e(a){return'[touch-action="'+a+'"]'}function f(a){return"{ -ms-touch-action: "+a+"; touch-action: "+a+"; }"}function g(){if(F){D.forEach(function(a){String(a)===a?(E+=e(a)+f(a)+"\n",G&&(E+=d(a)+f(a)+"\n")):(E+=a.selectors.map(e)+f(a.rule)+"\n",G&&(E+=a.selectors.map(d)+f(a.rule)+"\n"))});var a=document.createElement("style");a.textContent=E,document.head.appendChild(a)}}function h(){if(!window.PointerEvent){if(window.PointerEvent=a,window.navigator.msPointerEnabled){var b=window.navigator.msMaxTouchPoints;Object.defineProperty(window.navigator,"maxTouchPoints",{value:b,enumerable:!0}),u.registerSource("ms",_)}else Object.defineProperty(window.navigator,"maxTouchPoints",{value:0,enumerable:!0}),u.registerSource("mouse",N),void 0!==window.ontouchstart&&u.registerSource("touch",V);u.register(document)}}function i(a){if(!u.pointermap.has(a)){var b=new Error("InvalidPointerId");throw b.name="InvalidPointerId",b}}function j(a){for(var b=a.parentNode;b&&b!==a.ownerDocument;)b=b.parentNode;if(!b){var c=new Error("InvalidStateError");throw c.name="InvalidStateError",c}}function k(a){var b=u.pointermap.get(a);return 0!==b.buttons}function l(){window.Element&&!Element.prototype.setPointerCapture&&Object.defineProperties(Element.prototype,{setPointerCapture:{value:W},releasePointerCapture:{value:X},hasPointerCapture:{value:Y}})}var m=["bubbles","cancelable","view","detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget","pageX","pageY"],n=[!1,!1,null,null,0,0,0,0,!1,!1,!1,!1,0,null,0,0],o=window.Map&&window.Map.prototype.forEach,p=o?Map:b;b.prototype={set:function(a,b){return void 0===b?this["delete"](a):(this.has(a)||this.size++,void(this.array[a]=b))},has:function(a){return void 0!==this.array[a]},"delete":function(a){this.has(a)&&(delete this.array[a],this.size--)},get:function(a){return this.array[a]},clear:function(){this.array.length=0,this.size=0},forEach:function(a,b){return this.array.forEach(function(c,d){a.call(b,c,d,this)},this)}};var q=["bubbles","cancelable","view","detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget","buttons","pointerId","width","height","pressure","tiltX","tiltY","pointerType","hwTimestamp","isPrimary","type","target","currentTarget","which","pageX","pageY","timeStamp"],r=[!1,!1,null,null,0,0,0,0,!1,!1,!1,!1,0,null,0,0,0,0,0,0,0,"",0,!1,"",null,null,0,0,0,0],s={pointerover:1,pointerout:1,pointerenter:1,pointerleave:1},t="undefined"!=typeof SVGElementInstance,u={pointermap:new p,eventMap:Object.create(null),captureInfo:Object.create(null),eventSources:Object.create(null),eventSourceList:[],registerSource:function(a,b){var c=b,d=c.events;d&&(d.forEach(function(a){c[a]&&(this.eventMap[a]=c[a].bind(c))},this),this.eventSources[a]=c,this.eventSourceList.push(c))},register:function(a){for(var b,c=this.eventSourceList.length,d=0;d<c&&(b=this.eventSourceList[d]);d++)b.register.call(b,a)},unregister:function(a){for(var b,c=this.eventSourceList.length,d=0;d<c&&(b=this.eventSourceList[d]);d++)b.unregister.call(b,a)},contains:function(a,b){try{return a.contains(b)}catch(c){return!1}},down:function(a){a.bubbles=!0,this.fireEvent("pointerdown",a)},move:function(a){a.bubbles=!0,this.fireEvent("pointermove",a)},up:function(a){a.bubbles=!0,this.fireEvent("pointerup",a)},enter:function(a){a.bubbles=!1,this.fireEvent("pointerenter",a)},leave:function(a){a.bubbles=!1,this.fireEvent("pointerleave",a)},over:function(a){a.bubbles=!0,this.fireEvent("pointerover",a)},out:function(a){a.bubbles=!0,this.fireEvent("pointerout",a)},cancel:function(a){a.bubbles=!0,this.fireEvent("pointercancel",a)},leaveOut:function(a){this.out(a),this.propagate(a,this.leave,!1)},enterOver:function(a){this.over(a),this.propagate(a,this.enter,!0)},eventHandler:function(a){if(!a._handledByPE){var b=a.type,c=this.eventMap&&this.eventMap[b];c&&c(a),a._handledByPE=!0}},listen:function(a,b){b.forEach(function(b){this.addEvent(a,b)},this)},unlisten:function(a,b){b.forEach(function(b){this.removeEvent(a,b)},this)},addEvent:function(a,b){a.addEventListener(b,this.boundHandler)},removeEvent:function(a,b){a.removeEventListener(b,this.boundHandler)},makeEvent:function(b,c){this.captureInfo[c.pointerId]&&(c.relatedTarget=null);var d=new a(b,c);return c.preventDefault&&(d.preventDefault=c.preventDefault),d._target=d._target||c.target,d},fireEvent:function(a,b){var c=this.makeEvent(a,b);return this.dispatchEvent(c)},cloneEvent:function(a){for(var b,c=Object.create(null),d=0;d<q.length;d++)b=q[d],c[b]=a[b]||r[d],!t||"target"!==b&&"relatedTarget"!==b||c[b]instanceof SVGElementInstance&&(c[b]=c[b].correspondingUseElement);return a.preventDefault&&(c.preventDefault=function(){a.preventDefault()}),c},getTarget:function(a){var b=this.captureInfo[a.pointerId];return b?a._target!==b&&a.type in s?void 0:b:a._target},propagate:function(a,b,c){for(var d=a.target,e=[];d!==document&&!d.contains(a.relatedTarget);)if(e.push(d),d=d.parentNode,!d)return;c&&e.reverse(),e.forEach(function(c){a.target=c,b.call(this,a)},this)},setCapture:function(b,c,d){this.captureInfo[b]&&this.releaseCapture(b,d),this.captureInfo[b]=c,this.implicitRelease=this.releaseCapture.bind(this,b,d),document.addEventListener("pointerup",this.implicitRelease),document.addEventListener("pointercancel",this.implicitRelease);var e=new a("gotpointercapture");e.pointerId=b,e._target=c,d||this.asyncDispatchEvent(e)},releaseCapture:function(b,c){var d=this.captureInfo[b];if(d){this.captureInfo[b]=void 0,document.removeEventListener("pointerup",this.implicitRelease),document.removeEventListener("pointercancel",this.implicitRelease);var e=new a("lostpointercapture");e.pointerId=b,e._target=d,c||this.asyncDispatchEvent(e)}},dispatchEvent:function(a){var b=this.getTarget(a);if(b)return b.dispatchEvent(a)},asyncDispatchEvent:function(a){requestAnimationFrame(this.dispatchEvent.bind(this,a))}};u.boundHandler=u.eventHandler.bind(u);var v={shadow:function(a){if(a)return a.shadowRoot||a.webkitShadowRoot},canTarget:function(a){return a&&Boolean(a.elementFromPoint)},targetingShadow:function(a){var b=this.shadow(a);if(this.canTarget(b))return b},olderShadow:function(a){var b=a.olderShadowRoot;if(!b){var c=a.querySelector("shadow");c&&(b=c.olderShadowRoot)}return b},allShadows:function(a){for(var b=[],c=this.shadow(a);c;)b.push(c),c=this.olderShadow(c);return b},searchRoot:function(a,b,c){if(a){var d,e,f=a.elementFromPoint(b,c);for(e=this.targetingShadow(f);e;){if(d=e.elementFromPoint(b,c)){var g=this.targetingShadow(d);return this.searchRoot(g,b,c)||d}e=this.olderShadow(e)}return f}},owner:function(a){for(var b=a;b.parentNode;)b=b.parentNode;return b.nodeType!==Node.DOCUMENT_NODE&&b.nodeType!==Node.DOCUMENT_FRAGMENT_NODE&&(b=document),b},findTarget:function(a){var b=a.clientX,c=a.clientY,d=this.owner(a.target);return d.elementFromPoint(b,c)||(d=document),this.searchRoot(d,b,c)}},w=Array.prototype.forEach.call.bind(Array.prototype.forEach),x=Array.prototype.map.call.bind(Array.prototype.map),y=Array.prototype.slice.call.bind(Array.prototype.slice),z=Array.prototype.filter.call.bind(Array.prototype.filter),A=window.MutationObserver||window.WebKitMutationObserver,B="[touch-action]",C={subtree:!0,childList:!0,attributes:!0,attributeOldValue:!0,attributeFilter:["touch-action"]};c.prototype={watchSubtree:function(a){this.observer&&v.canTarget(a)&&this.observer.observe(a,C)},enableOnSubtree:function(a){this.watchSubtree(a),a===document&&"complete"!==document.readyState?this.installOnLoad():this.installNewSubtree(a)},installNewSubtree:function(a){w(this.findElements(a),this.addElement,this)},findElements:function(a){return a.querySelectorAll?a.querySelectorAll(B):[]},removeElement:function(a){this.removeCallback(a)},addElement:function(a){this.addCallback(a)},elementChanged:function(a,b){this.changedCallback(a,b)},concatLists:function(a,b){return a.concat(y(b))},installOnLoad:function(){document.addEventListener("readystatechange",function(){"complete"===document.readyState&&this.installNewSubtree(document)}.bind(this))},isElement:function(a){return a.nodeType===Node.ELEMENT_NODE},flattenMutationTree:function(a){var b=x(a,this.findElements,this);return b.push(z(a,this.isElement)),b.reduce(this.concatLists,[])},mutationWatcher:function(a){a.forEach(this.mutationHandler,this)},mutationHandler:function(a){if("childList"===a.type){var b=this.flattenMutationTree(a.addedNodes);b.forEach(this.addElement,this);var c=this.flattenMutationTree(a.removedNodes);c.forEach(this.removeElement,this)}else"attributes"===a.type&&this.elementChanged(a.target,a.oldValue)}};var D=["none","auto","pan-x","pan-y",{rule:"pan-x pan-y",selectors:["pan-x pan-y","pan-y pan-x"]}],E="",F=window.PointerEvent||window.MSPointerEvent,G=!window.ShadowDOMPolyfill&&document.head.createShadowRoot,H=u.pointermap,I=25,J=[1,4,2,8,16],K=!1;try{K=1===new MouseEvent("test",{buttons:1}).buttons}catch(L){}var M,N={POINTER_ID:1,POINTER_TYPE:"mouse",events:["mousedown","mousemove","mouseup","mouseover","mouseout"],register:function(a){u.listen(a,this.events)},unregister:function(a){u.unlisten(a,this.events)},lastTouches:[],isEventSimulatedFromTouch:function(a){for(var b,c=this.lastTouches,d=a.clientX,e=a.clientY,f=0,g=c.length;f<g&&(b=c[f]);f++){var h=Math.abs(d-b.x),i=Math.abs(e-b.y);if(h<=I&&i<=I)return!0}},prepareEvent:function(a){var b=u.cloneEvent(a),c=b.preventDefault;return b.preventDefault=function(){a.preventDefault(),c()},b.pointerId=this.POINTER_ID,b.isPrimary=!0,b.pointerType=this.POINTER_TYPE,b},prepareButtonsForMove:function(a,b){var c=H.get(this.POINTER_ID);0!==b.which&&c?a.buttons=c.buttons:a.buttons=0,b.buttons=a.buttons},mousedown:function(a){if(!this.isEventSimulatedFromTouch(a)){var b=H.get(this.POINTER_ID),c=this.prepareEvent(a);K||(c.buttons=J[c.button],b&&(c.buttons|=b.buttons),a.buttons=c.buttons),H.set(this.POINTER_ID,a),b&&0!==b.buttons?u.move(c):u.down(c)}},mousemove:function(a){if(!this.isEventSimulatedFromTouch(a)){var b=this.prepareEvent(a);K||this.prepareButtonsForMove(b,a),b.button=-1,H.set(this.POINTER_ID,a),u.move(b)}},mouseup:function(a){if(!this.isEventSimulatedFromTouch(a)){var b=H.get(this.POINTER_ID),c=this.prepareEvent(a);if(!K){var d=J[c.button];c.buttons=b?b.buttons&~d:0,a.buttons=c.buttons}H.set(this.POINTER_ID,a),c.buttons&=~J[c.button],0===c.buttons?u.up(c):u.move(c)}},mouseover:function(a){if(!this.isEventSimulatedFromTouch(a)){var b=this.prepareEvent(a);K||this.prepareButtonsForMove(b,a),b.button=-1,H.set(this.POINTER_ID,a),u.enterOver(b)}},mouseout:function(a){if(!this.isEventSimulatedFromTouch(a)){var b=this.prepareEvent(a);K||this.prepareButtonsForMove(b,a),b.button=-1,u.leaveOut(b)}},cancel:function(a){var b=this.prepareEvent(a);u.cancel(b),this.deactivateMouse()},deactivateMouse:function(){H["delete"](this.POINTER_ID)}},O=u.captureInfo,P=v.findTarget.bind(v),Q=v.allShadows.bind(v),R=u.pointermap,S=2500,T=200,U="touch-action",V={events:["touchstart","touchmove","touchend","touchcancel"],register:function(a){M.enableOnSubtree(a)},unregister:function(){},elementAdded:function(a){var b=a.getAttribute(U),c=this.touchActionToScrollType(b);c&&(a._scrollType=c,u.listen(a,this.events),Q(a).forEach(function(a){a._scrollType=c,u.listen(a,this.events)},this))},elementRemoved:function(a){a._scrollType=void 0,u.unlisten(a,this.events),Q(a).forEach(function(a){a._scrollType=void 0,u.unlisten(a,this.events)},this)},elementChanged:function(a,b){var c=a.getAttribute(U),d=this.touchActionToScrollType(c),e=this.touchActionToScrollType(b);d&&e?(a._scrollType=d,Q(a).forEach(function(a){a._scrollType=d},this)):e?this.elementRemoved(a):d&&this.elementAdded(a)},scrollTypes:{EMITTER:"none",XSCROLLER:"pan-x",YSCROLLER:"pan-y",SCROLLER:/^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/},touchActionToScrollType:function(a){var b=a,c=this.scrollTypes;return"none"===b?"none":b===c.XSCROLLER?"X":b===c.YSCROLLER?"Y":c.SCROLLER.exec(b)?"XY":void 0},POINTER_TYPE:"touch",firstTouch:null,isPrimaryTouch:function(a){return this.firstTouch===a.identifier},setPrimaryTouch:function(a){(0===R.size||1===R.size&&R.has(1))&&(this.firstTouch=a.identifier,this.firstXY={X:a.clientX,Y:a.clientY},this.scrolling=!1,this.cancelResetClickCount())},removePrimaryPointer:function(a){a.isPrimary&&(this.firstTouch=null,this.firstXY=null,this.resetClickCount())},clickCount:0,resetId:null,resetClickCount:function(){var a=function(){this.clickCount=0,this.resetId=null}.bind(this);this.resetId=setTimeout(a,T)},cancelResetClickCount:function(){this.resetId&&clearTimeout(this.resetId)},typeToButtons:function(a){var b=0;return"touchstart"!==a&&"touchmove"!==a||(b=1),b},touchToPointer:function(a){var b=this.currentTouchEvent,c=u.cloneEvent(a),d=c.pointerId=a.identifier+2;c.target=O[d]||P(c),c.bubbles=!0,c.cancelable=!0,c.detail=this.clickCount,c.button=0,c.buttons=this.typeToButtons(b.type),c.width=2*(a.radiusX||a.webkitRadiusX||0),c.height=2*(a.radiusY||a.webkitRadiusY||0),c.pressure=a.force||a.webkitForce||.5,c.isPrimary=this.isPrimaryTouch(a),c.pointerType=this.POINTER_TYPE,c.altKey=b.altKey,c.ctrlKey=b.ctrlKey,c.metaKey=b.metaKey,c.shiftKey=b.shiftKey;var e=this;return c.preventDefault=function(){e.scrolling=!1,e.firstXY=null,b.preventDefault()},c},processTouches:function(a,b){var c=a.changedTouches;this.currentTouchEvent=a;for(var d,e=0;e<c.length;e++)d=c[e],b.call(this,this.touchToPointer(d))},shouldScroll:function(a){if(this.firstXY){var b,c=a.currentTarget._scrollType;if("none"===c)b=!1;else if("XY"===c)b=!0;else{var d=a.changedTouches[0],e=c,f="Y"===c?"X":"Y",g=Math.abs(d["client"+e]-this.firstXY[e]),h=Math.abs(d["client"+f]-this.firstXY[f]);b=g>=h}return this.firstXY=null,b}},findTouch:function(a,b){for(var c,d=0,e=a.length;d<e&&(c=a[d]);d++)if(c.identifier===b)return!0},vacuumTouches:function(a){var b=a.touches;if(R.size>=b.length){var c=[];R.forEach(function(a,d){if(1!==d&&!this.findTouch(b,d-2)){var e=a.out;c.push(e)}},this),c.forEach(this.cancelOut,this)}},touchstart:function(a){this.vacuumTouches(a),this.setPrimaryTouch(a.changedTouches[0]),this.dedupSynthMouse(a),this.scrolling||(this.clickCount++,this.processTouches(a,this.overDown))},overDown:function(a){R.set(a.pointerId,{target:a.target,out:a,outTarget:a.target}),u.enterOver(a),u.down(a)},touchmove:function(a){this.scrolling||(this.shouldScroll(a)?(this.scrolling=!0,this.touchcancel(a)):(a.preventDefault(),this.processTouches(a,this.moveOverOut)))},moveOverOut:function(a){var b=a,c=R.get(b.pointerId);if(c){var d=c.out,e=c.outTarget;u.move(b),d&&e!==b.target&&(d.relatedTarget=b.target,b.relatedTarget=e,d.target=e,b.target?(u.leaveOut(d),u.enterOver(b)):(b.target=e,b.relatedTarget=null,this.cancelOut(b))),c.out=b,c.outTarget=b.target}},touchend:function(a){this.dedupSynthMouse(a),this.processTouches(a,this.upOut)},upOut:function(a){this.scrolling||(u.up(a),u.leaveOut(a)),this.cleanUpPointer(a)},touchcancel:function(a){this.processTouches(a,this.cancelOut)},cancelOut:function(a){u.cancel(a),u.leaveOut(a),this.cleanUpPointer(a)},cleanUpPointer:function(a){R["delete"](a.pointerId),this.removePrimaryPointer(a)},dedupSynthMouse:function(a){var b=N.lastTouches,c=a.changedTouches[0];if(this.isPrimaryTouch(c)){var d={x:c.clientX,y:c.clientY};b.push(d);var e=function(a,b){var c=a.indexOf(b);c>-1&&a.splice(c,1)}.bind(null,b,d);setTimeout(e,S)}}};M=new c(V.elementAdded,V.elementRemoved,V.elementChanged,V);var W,X,Y,Z=u.pointermap,$=window.MSPointerEvent&&"number"==typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE,_={events:["MSPointerDown","MSPointerMove","MSPointerUp","MSPointerOut","MSPointerOver","MSPointerCancel","MSGotPointerCapture","MSLostPointerCapture"],register:function(a){u.listen(a,this.events)},unregister:function(a){u.unlisten(a,this.events)},POINTER_TYPES:["","unavailable","touch","pen","mouse"],prepareEvent:function(a){var b=a;return $&&(b=u.cloneEvent(a),b.pointerType=this.POINTER_TYPES[a.pointerType]),b},cleanup:function(a){Z["delete"](a)},MSPointerDown:function(a){Z.set(a.pointerId,a);var b=this.prepareEvent(a);u.down(b)},MSPointerMove:function(a){var b=this.prepareEvent(a);u.move(b)},MSPointerUp:function(a){var b=this.prepareEvent(a);u.up(b),this.cleanup(a.pointerId)},MSPointerOut:function(a){var b=this.prepareEvent(a);u.leaveOut(b)},MSPointerOver:function(a){var b=this.prepareEvent(a);u.enterOver(b)},MSPointerCancel:function(a){var b=this.prepareEvent(a);u.cancel(b),this.cleanup(a.pointerId)},MSLostPointerCapture:function(a){var b=u.makeEvent("lostpointercapture",a);u.dispatchEvent(b)},MSGotPointerCapture:function(a){var b=u.makeEvent("gotpointercapture",a);u.dispatchEvent(b)}},aa=window.navigator;aa.msPointerEnabled?(W=function(a){i(a),j(this),k(a)&&(u.setCapture(a,this,!0),this.msSetPointerCapture(a))},X=function(a){i(a),u.releaseCapture(a,!0),this.msReleasePointerCapture(a)}):(W=function(a){i(a),j(this),k(a)&&u.setCapture(a,this)},X=function(a){i(a),u.releaseCapture(a)}),Y=function(a){return!!u.captureInfo[a]},g(),h(),l();var ba={dispatcher:u,Installer:c,PointerEvent:a,PointerMap:p,targetFinding:v};return ba});
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.ES6Promise=e()}(this,function(){"use strict";function t(t){var e=typeof t;return null!==t&&("object"===e||"function"===e)}function e(t){return"function"==typeof t}function n(t){W=t}function r(t){z=t}function o(){return function(){return process.nextTick(a)}}function i(){return"undefined"!=typeof U?function(){U(a)}:c()}function s(){var t=0,e=new H(a),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function u(){var t=new MessageChannel;return t.port1.onmessage=a,function(){return t.port2.postMessage(0)}}function c(){var t=setTimeout;return function(){return t(a,1)}}function a(){for(var t=0;t<N;t+=2){var e=Q[t],n=Q[t+1];e(n),Q[t]=void 0,Q[t+1]=void 0}N=0}function f(){try{var t=Function("return this")().require("vertx");return U=t.runOnLoop||t.runOnContext,i()}catch(e){return c()}}function l(t,e){var n=this,r=new this.constructor(p);void 0===r[V]&&x(r);var o=n._state;if(o){var i=arguments[o-1];z(function(){return T(o,r,i,n._result)})}else j(n,r,t,e);return r}function h(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(p);return w(n,t),n}function p(){}function v(){return new TypeError("You cannot resolve a promise with itself")}function d(){return new TypeError("A promises callback cannot return that same promise.")}function _(t,e,n,r){try{t.call(e,n,r)}catch(o){return o}}function y(t,e,n){z(function(t){var r=!1,o=_(n,e,function(n){r||(r=!0,e!==n?w(t,n):A(t,n))},function(e){r||(r=!0,S(t,e))},"Settle: "+(t._label||" unknown promise"));!r&&o&&(r=!0,S(t,o))},t)}function m(t,e){e._state===Z?A(t,e._result):e._state===$?S(t,e._result):j(e,void 0,function(e){return w(t,e)},function(e){return S(t,e)})}function b(t,n,r){n.constructor===t.constructor&&r===l&&n.constructor.resolve===h?m(t,n):void 0===r?A(t,n):e(r)?y(t,n,r):A(t,n)}function w(e,n){if(e===n)S(e,v());else if(t(n)){var r=void 0;try{r=n.then}catch(o){return void S(e,o)}b(e,n,r)}else A(e,n)}function g(t){t._onerror&&t._onerror(t._result),E(t)}function A(t,e){t._state===X&&(t._result=e,t._state=Z,0!==t._subscribers.length&&z(E,t))}function S(t,e){t._state===X&&(t._state=$,t._result=e,z(g,t))}function j(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+Z]=n,o[i+$]=r,0===i&&t._state&&z(E,t)}function E(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,o=void 0,i=t._result,s=0;s<e.length;s+=3)r=e[s],o=e[s+n],r?T(n,r,o,i):o(i);t._subscribers.length=0}}function T(t,n,r,o){var i=e(r),s=void 0,u=void 0,c=!0;if(i){try{s=r(o)}catch(a){c=!1,u=a}if(n===s)return void S(n,d())}else s=o;n._state!==X||(i&&c?w(n,s):c===!1?S(n,u):t===Z?A(n,s):t===$&&S(n,s))}function M(t,e){try{e(function(e){w(t,e)},function(e){S(t,e)})}catch(n){S(t,n)}}function P(){return tt++}function x(t){t[V]=tt++,t._state=void 0,t._result=void 0,t._subscribers=[]}function C(){return new Error("Array Methods must be provided an Array")}function O(t){return new et(this,t).promise}function k(t){var e=this;return new e(L(t)?function(n,r){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(n,r)}:function(t,e){return e(new TypeError("You must pass an array to race."))})}function F(t){var e=this,n=new e(p);return S(n,t),n}function Y(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function q(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function D(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;if(n){var r=null;try{r=Object.prototype.toString.call(n.resolve())}catch(e){}if("[object Promise]"===r&&!n.cast)return}t.Promise=nt}var K=void 0;K=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var L=K,N=0,U=void 0,W=void 0,z=function(t,e){Q[N]=t,Q[N+1]=e,N+=2,2===N&&(W?W(a):R())},B="undefined"!=typeof window?window:void 0,G=B||{},H=G.MutationObserver||G.WebKitMutationObserver,I="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),J="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,Q=new Array(1e3),R=void 0;R=I?o():H?s():J?u():void 0===B&&"function"==typeof require?f():c();var V=Math.random().toString(36).substring(2),X=void 0,Z=1,$=2,tt=0,et=function(){function t(t,e){this._instanceConstructor=t,this.promise=new t(p),this.promise[V]||x(this.promise),L(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?A(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&A(this.promise,this._result))):S(this.promise,C())}return t.prototype._enumerate=function(t){for(var e=0;this._state===X&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===h){var o=void 0,i=void 0,s=!1;try{o=t.then}catch(u){s=!0,i=u}if(o===l&&t._state!==X)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===nt){var c=new n(p);s?S(c,i):b(c,t,o),this._willSettleAt(c,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},t.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===X&&(this._remaining--,t===$?S(r,n):this._result[e]=n),0===this._remaining&&A(r,this._result)},t.prototype._willSettleAt=function(t,e){var n=this;j(t,void 0,function(t){return n._settledAt(Z,e,t)},function(t){return n._settledAt($,e,t)})},t}(),nt=function(){function t(e){this[V]=P(),this._result=this._state=void 0,this._subscribers=[],p!==e&&("function"!=typeof e&&Y(),this instanceof t?M(this,e):q())}return t.prototype["catch"]=function(t){return this.then(null,t)},t.prototype["finally"]=function(t){var n=this,r=n.constructor;return e(t)?n.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})}):n.then(t,t)},t}();return nt.prototype.then=l,nt.all=O,nt.race=k,nt.resolve=h,nt.reject=F,nt._setScheduler=n,nt._setAsap=r,nt._asap=z,nt.polyfill=D,nt.Promise=nt,nt.polyfill(),nt});

// Polyfills.
Math.TAU = Math.TAU || (2 * Math.PI);
window.URL = window.webkitURL || window.URL;
Array.from = Array.from || Array.prototype.slice.call.bind(Array.prototype.slice);
HTMLElement.prototype.remove = HTMLElement.prototype.remove || function () {
	this.parentElement ? this.parentElement.removeChild(this) : undefined;
};
Object.values = Object.values || function (obj) {
	var vals = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
			vals.push(obj[key]);
		}
	}
	return vals;
};

// Fake polyfill to prevent older browsers choking on this function.
CanvasRenderingContext2D.prototype.setLineDash = CanvasRenderingContext2D.prototype.setLineDash || function () {};

var Utils = {
	/** @constant {String} Text to append to messages informing a feature is unavailable in the current browser. */
	SUGGESTED_BROWSER_MESSAGE: 'To use this feature, please switch to a supported browser, such as the latest Google Chrome.',
	
	/** {Boolean} Whether the device runs Apple software */
	isApple: (navigator.userAgent.indexOf('Mac') !== -1),
	
	/** {Boolean} Whether the device runs a mobile or similarly limited OS */
	isMobileLike: !!navigator.userAgent.match(/android|ipad|iphone|ipod|mobile/i),
	
	/** {Boolean} Whether the user prefers reduced motion. */
	get prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	},
	
	/**
	 * Alphabetize items without sorting capitalized items before uncapitalized items.
	 * @param {String} a - The first element for comparison
	 * @param {String} b - The second element for comparison
	 * @returns {Number} -1 if a < b, or 1 if a > b
	 */
	caseInsensitiveSort: function (a, b) {
		return (a.toLowerCase() < b.toLowerCase() ? -1 : 1);
	},
	
	/**
	 * Check whether any modifier keys are pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the keys
	 * @returns {Boolean} - Whether any modifier key is pressed
	 */
	checkModifierKeys: function (e) {
		return (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey);
	},
	
	/**
	 * Check whether the Ctrl key, or the Command key on MacOS, is pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the key
	 * @returns {Boalean} - Whether the appropriate key is pressed
	 */
	checkPlatformCtrlOrCmdKey: function (e) {
		// On MacOS and iOS, check Cmd; on other platforms (Windows, Linux), check Ctrl.
		return ((!Utils.isApple && e.ctrlKey) || (Utils.isApple && e.metaKey));
	},
	
	/**
	 * Check whether the Windows key, or the Control key on MacOS, is pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the key
	 * @returns {Boalean} - Whether the appropriate key is pressed
	 */
	checkPlatformMetaOrControlKey: function (e) {
		// On MacOS and iOS, check Control; on other platforms (Windows, Linux), check the Windows/meta key.
		return ((!Utils.isApple && e.metaKey) || (Utils.isApple && e.ctrlKey));
	},
	
	/**
	 * Clear all graphics in a given canvas.
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to clear
	 */
	clearCanvas: function (cxt) {
		cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
	},
	
	/**
	 * Create a copy of an image data object.
	 * @param {ImageData} sourceData - The image data object to copy
	 * @param {CanvasRenderingContext2D} cxt - The rendering context to use to create the copy
	 * @returns {ImageData} The new copy
	 */
	cloneImageData: function (sourceData, cxt) {
		var copyData = cxt.createImageData(sourceData.width, sourceData.height);
		if (copyData.data.set) {
			copyData.data.set(sourceData.data);
		} else {
			// If imageData.data.set is not defined in this browser, manually copy the data.
			for (var i = 0; i < sourceData.data.length; i++) {
				copyData.data[i] = sourceData.data[i];
			}
		}
		return copyData;
	},
	
	/**
	 * @private
	 * Create a path in the canvas using the given points.
	 * @param {CanvasRenderingContext2D} cxt - The canvas context to create the path in
	 * @param {Array<Object>} points - The list of points
	 * @param {Boolean} shouldClose - Whether the path should be closed
	 */
	createPath: function (cxt, points, shouldClose) {
		cxt.beginPath();
		cxt.moveTo(points[0].x, points[0].y);
		points.forEach(function (point) {
			cxt.lineTo(point.x, point.y);
		});
		if (shouldClose) {
			cxt.closePath();
		}
	},
	
	/**
	 * Constrain a value between a minimum and maximum.
	 * @param {Number} value - The value to constrain
	 * @param {Number} min - The minimum value to allow
	 * @param {Number} max - The maximum value to allow
	 * @returns {Number} `value` or the closest number between `min` and `max`
	 */
	constrainValue: function (value, min, max) {
		return Math.max(min, Math.min(max, value));
	},
	
	/**
	 * Get the distance between 2 points.
	 * @param {Number} x1,
	 * @param {Number} y1,
	 * @param {Number} x2,
	 * @param {Number} y2
	 * @returns {Number}
	 */
	distance: function (x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	},
	
	/**
	 * Draw a round end cap for the end of a line (using the current `lineWidth` and `strokeStyle`).
	 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the line is being drawn
	 * @param {Number} x - The x-coordinate of the cap
	 * @param {Number} y - The y-coordinate of the cap
	 */
	drawCap: function (cxt, x, y) {
		cxt.save();
		cxt.fillStyle = cxt.strokeStyle;
		cxt.beginPath();
		cxt.arc(x, y, cxt.lineWidth / 2, 0, Math.TAU, false);
		cxt.fill();
		cxt.restore();
	},
	
	/**
	 * Draw the canvas, color-inverted, to the precanvas.
	 */
	drawCanvasInvertedToPreCanvas: function () {
		cursorCxt.save();
		cursorCxt.canvas.width = cxt.canvas.width;
		cursorCxt.canvas.height = cxt.canvas.height;
		cursorCxt.drawImage(cxt.canvas, 0, 0);
		cursorCxt.globalCompositeOperation = 'difference';
		cursorCxt.fillStyle = 'white'; // Filling with white with “difference” blending mode inverts colors.
		cursorCxt.fillRect(0, 0, cursorCxt.canvas.width, cursorCxt.canvas.height);
		cursorCxt.restore();
		preCxt.drawImage(cursorCanvas, 0, 0);
	},
	
	/**
	 * Load a file.
	 * @param {String} path - The path to the file
	 */
	fetch: function (path) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject('Error ' + xhr.status + ' while attempting to load ' + path);
					}
				}
			};
			xhr.open('GET', path, true);
			xhr.send();
		});
	},
	
	/**
	 * Draw a grid on a canvas with the specified spacing.
	 * @param {Number} size - The size of each grid square, in pixels
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to draw to
	 */
	drawGrid: function (size, cxt) {
		var COLOR_DARK = 'rgba(0, 0, 0, 0.5)',
			COLOR_LIGHT = 'rgba(255, 255, 255, 0.2275)';
		
		cxt.save();
		
		cxt.setLineDash([1, 1]);
		
		// Canvas centers the line on the coordinate, so 0.5px centers a 1px line on the pixel.
		for (var x = 0; x < cxt.canvas.width; x += size) {
			var currentX = Math.floor(x) + 0.5;
			cxt.lineDashOffset = 0;
			cxt.strokeStyle = COLOR_DARK;
			Utils.drawLine(currentX, 0, currentX, cxt.canvas.height, cxt);
			cxt.lineDashOffset = 1;
			cxt.strokeStyle = COLOR_LIGHT;
			Utils.drawLine(currentX, 0, currentX, cxt.canvas.height, cxt);
		}
		
		for (var y = 0.5; y < cxt.canvas.height; y += size) {
			var currentY = Math.floor(y) + 0.5;
			cxt.lineDashOffset = 0;
			cxt.strokeStyle = COLOR_DARK;
			Utils.drawLine(0, currentY, cxt.canvas.width, currentY, cxt);
			cxt.lineDashOffset = 1;
			cxt.strokeStyle = COLOR_LIGHT;
			Utils.drawLine(0, currentY, cxt.canvas.width, currentY, cxt);
		}
		
		cxt.restore();
	},
	
	/**
	 * Draw a line on a canvas between two points.
	 * @param {Number} x1 - The x-coordinate of the start point
	 * @param {Number} y1 - The y-coordinate of the start point
	 * @param {Number} x2 - The x-coordinate of the end point
	 * @param {Number} y2 - The y-coordinate of the end point
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to draw to
	 */
	drawLine: function (x1, y1, x2, y2, cxt) {
		cxt.beginPath();
		cxt.moveTo(x1, y1);
		cxt.lineTo(x2, y2);
		cxt.stroke();
		cxt.closePath();
	},
	
	/**
	 * Get the x-coordinate of a click within the canvas.
	 * @param {Number} pageX - The x-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasX: function (pageX) {
		return pageX - canvasPositioner.offsetLeft;
	},

	/**
	 * Get the y-coordinate of a click within the canvas.
	 * @param {Number} pageY - The y-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasY: function (pageY) {
		return pageY - canvasPositioner.offsetTop;
	},
	
	/**
	 * Convert a CSS color to RGB values.
	 * @param {String} cssColor - The CSS color to parse
	 * @returns {Object} - A map of `r`, `g`, and `b` to their number values
	 */
	colorToRGB: function (cssColor) {
		if (cssColor.charAt(0) === '#') {
			var result = (/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i).exec(cssColor);
			if (result) {
				return {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				};
			}
		}
		return {
			black: {r: 0, g: 0, b: 0},
			blue: {r: 0, g: 0, b: 255},
			brown: {r: 165, g: 42, b: 42},
			cyan: {r: 0, g: 255, b: 255},
			gray: {r: 128, g: 128, b: 128},
			green: {r: 0, g: 128, b: 0},
			indigo : {r: 75, g: 0, b: 130},
			lightblue: {r: 173, g: 216, b: 230},
			lime: {r: 0, g: 255, b: 0},
			magenta: {r: 255, g: 0, b: 255},
			navy: {r: 0, g: 0, b: 128},
			olive: {r: 128, g: 128, b: 0},
			orange: {r: 255, g: 165, b: 0},
			purple: {r: 128, g: 0, b: 128},
			red: {r: 255, g: 0, b: 0},
			teal: {r: 0, g: 128, b: 128},
			violet: {r: 238, g: 130, b: 238},
			white: {r: 255, g: 255, b: 255},
			yellow: {r: 255, g: 255, b: 0}
		}[cssColor];
	},
	
	/**
	 * Check whether a point is inside a rectangle.
	 * @param {Numebr} px - The x-coordinate of the point
	 * @param {Numebr} py - The y-coordinate of the point
	 * @param {Numebr} rx - The x-coordinate of the rectangle's upper-left corner
	 * @param {Numebr} ry - The y-coordinate of the rectangle's upper-left corner
	 * @param {Number} rw - The width of the rectangle
	 * @param {Number} rh - The height of the rectangle
	 * @returns {Boolean} Whether the point is inside the rectangle
	 */
	isPointInRect: function (px, py, rx, ry, rw, rh) {
		if (px > rx && px < (rx + rw) &&
				py > ry && py < (ry + rh)) {
			return true;
		}
		return false;
	},
	
	/**
	 * Read a file to an image.
	 * @param {File} file - The file to read
	 * @returns {Promise} Resolves with an Image when the image has been loaded and read
	 */
	readImage: function (file, isFilePath) {
		return new Promise(function (resolve, reject) {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				reject('Please switch to a browser that supports the file APIs, such as the latest Google Chrome.');
				return;
			}
			if (!file) {
				reject();
				return;
			}
			if (!isFilePath && !file.type.match('image.*')) {
				reject('PaintZ can only open valid image files.');
				return;
			}
			
			if (isFilePath) {
					var image = new Image();
					image.onload = function () {
						resolve(image);
					};
					image.src = file;
			} else {
				var reader = new FileReader();
				reader.onload = function () {
					var image = new Image();
					image.onload = function () {
						resolve(image);
					};
					image.src = reader.result;
				};
				reader.readAsDataURL(file);
			}
		});
	},
	
	/**
	 * A shim for supporting requestAnimationFrame in older browsers.
	 * Based on the one by Paul Irish.
	 */
	raf: (window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		(function (func) {
			setTimeout(func, 1000 / 60);
		})).bind(window)
};

/**
 * Create a new ClipboardManager instance and set up its event listeners.
 */
function ClipboardManager() {
	/** {Boolean} Whether the clipboard manager currently intercepts cilpboard events */
	this.enabled = false;
	
	window.addEventListener('paste', this._handlePaste.bind(this), false);
	window.addEventListener('copy', (function (e) {
		if (!this.enabled) {
			return;
		}
		if (!(tools.currentTool instanceof SelectionTool)) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.copy();
	}).bind(this));
	window.addEventListener('cut', (function (e) {
		if (!this.enabled) {
			return;
		}
		if (!(tools.currentTool instanceof SelectionTool)) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.cut();
	}).bind(this));
}

// Define constants.
ClipboardManager.prototype.CLIPBOARD_UNSUPPORTED_MESSAGE = 'Your browser does not support copying or cutting selections from PaintZ.  ' + Utils.SUGGESTED_BROWSER_MESSAGE;
ClipboardManager.prototype.CLIPBOARD_UNAUTHORIZED_MESSAGE = 'PaintZ needs permission to paste from your clipboard.  You may need to go into your browser\'s site settings to grant that permission.';

/**
 * Handle something being pasted to the page.
 * @param {ClipboardEvent} e
 */
ClipboardManager.prototype._handlePaste = function (e) {
	if (!this.enabled) {
		return;
	}
	
	// If no image data was pasted, ignore it.
	if (e.clipboardData.files.length === 0) {
		return;
	}
	
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	Utils.readImage(e.clipboardData.files[0])
		.then(this.paste)
		.catch(function () {
			// Hide the progress spinner if pasting failed.
			progressSpinner.hide();
		});
};

/**
 * Paste whatever image is on the clipboard to the page.
 */
ClipboardManager.prototype.triggerPaste = function () {
	if (!navigator.clipboard || !navigator.clipboard.read) {
		// If the browser does not support the clipboard API, fall back
		// to `document.execCommand`; if that fails, it will return false.
		return document.execCommand('paste');
	}
	
	var that = this;
	navigator.clipboard.read()
		.then(function (clipboardData) {
			if (clipboardData.length === 0 || !clipboardData[0].types.indexOf('image/png') === -1) {
				return;
			}
			
			clipboardData[0].getType('image/png').then(function (imageBlob) {
				var image = new Image();
				image.onload = function () {
					that.paste(image);
					URL.revokeObjectURL(imageBlob);
				};
				image.src = URL.createObjectURL(imageBlob);
			});
		})
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert(that.CLIPBOARD_UNAUTHORIZED_MESSAGE);
			}
		});
	return true;
};

/**
 * Paste an image to the canvas as a new selection.
 * @param {Image} image - The image to use as the contents of the new selection
 */
ClipboardManager.prototype.paste = function (image) {
	// Set up to paste at the top-left corner of the visible canvas.
	var pasteX = Math.floor(window.scrollX / zoomManager.level),
		pasteY = Math.floor(window.scrollY / zoomManager.level),
		pasteRightX = Math.floor(pasteX + image.width),
		pasteBottomY = Math.floor(pasteY + image.height);
	
	// If the canvas is not big enough to fit the pasted image, resize it.
	resizeCanvas(
		Math.max(pasteRightX, settings.get('width')),
		Math.max(pasteBottomY, settings.get('height')),
		'crop');
	
	// Tell the selection tool it just moved to create a selection of the proper size.
	tools.switchTool('selection');
	tools.selection.start({ x: pasteX, y: pasteY });
	tools.selection.end({ x: pasteRightX, y: pasteBottomY });
	
	// Set the selection content to the pasted image.
	Utils.clearCanvas(preCxt);
	preCxt.drawImage(image, pasteX, pasteY);
	tools.selection._selection.content.opaqueData = preCxt.getImageData(pasteX, pasteY, image.width, image.height);
	
	// Mark the selection as transformed so it gets saved no matter what.
	tools.selection._selection.transformed = true;
	
	// Set this to false so there is no selection start cover.
	tools.selection._selection.firstMove = false;
	
	// Apply transparency (and create `_selection.content.data`).
	tools.selection.setTransparentBackground();
	
	// Draw the new selection.
	tools.selection.redrawSelection();
	
	// Hide the progress spinner.
	progressSpinner.hide();
};

/**
 * Copy the image or selection to the clipboard.
 * @param {Blob} imageBlob - A blob of the image data to copy
 */
ClipboardManager.prototype.copy = function (imageBlob) {
	if (!navigator.clipboard || !navigator.clipboard.write) {
		alert(this.CLIPBOARD_UNSUPPORTED);
		return false;
	}
	
	var clipboardItem = new ClipboardItem({ 'image/png': imageBlob });
	
	var that = this;
	navigator.clipboard.write([clipboardItem])
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert(that.CLIPBOARD_UNAUTHORIZED_MESSAGE);
			}
		});
	return true;
};

/**
 * Create a new KeyManager instance and set up its event listeners.
 */
function KeyManager() {
	/** {Boolean} Whether the key manager currently intercepts app keyboard shortcuts */
	this.enabled = false;
	
	window.addEventListener('keydown', this._handleKeyDown.bind(this), false);
	document.getElementById('dialogsContainer')
		.addEventListener('keydown', this._handleDialogKeyDown.bind(this), false);
}

KeyManager.prototype._handleKeyDown = function (e) {
	if (!this.enabled) {
		return;
	}
	
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl,
		noModifiers = !Utils.checkModifierKeys(e);
	
	switch (e.keyCode) {
		case 8: // Backspace
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Backspace => Delete selection
					tools.currentTool.clear();
				}
			}
			break;
		
		case 13: // Enter
			if (ctrlOrCmdOnly) {
				if (tools.currentTool === tools.text) {
					e.preventDefault();
					// Ctrl+Enter => Rasterize text
					tools.currentTool._removeTextElem();
				}
			}
			break;
		
		case 27: // Esc
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Esc => Drop/cancel selection
					tools.currentTool.deactivate();
				} else if (tools.currentTool === tools.polygon) {
					e.preventDefault();
					// Esc => Cancel polygon
					tools.currentTool.clearDraftPolygon();
				} else if (tools.currentTool === tools.text) {
					e.preventDefault();
					// Esc => Cancel text box
					tools.currentTool._textArea.innerHTML = '';
					tools.currentTool._removeTextElem();
				}
			}
			break;
		
		case 33: // PgUp
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+PgUp => Zoom in
				zoomManager.zoomIn();
			}
			break;
		
		case 34: // PgDn
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+PgDn => Zoom out
				zoomManager.zoomOut();
			}
			break;
		
		case 37: // Left arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Left arrow => Nudge selection left
					tools.currentTool.nudge(-1, 0);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Left arrow => Nudge selection 10 left
					tools.currentTool.nudge(-10, 0);
				}
			}
			break;
		
		case 38: // Up arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Up arrow => Nudge selection up
					tools.currentTool.nudge(0, -1);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Up arrow => Nudge selection 10 up
					tools.currentTool.nudge(0, -10);
				}
			}
			break;
		
		case 39: // Right arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Right arrow => Nudge selection right
					tools.currentTool.nudge(1, 0);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Right arrow => Nudge selection 10 right
					tools.currentTool.nudge(10, 0);
				}
			}
			break;
		
		case 40: // Down arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Down arrow => Nudge selection down
					tools.currentTool.nudge(0, 1);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Down arrow => Nudge selection 10 down
					tools.currentTool.nudge(0, 10);
				}
			}
			break;
		
		case 46: // Delete
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Delete => Delete selection
					tools.currentTool.clear();
				}
			}
			break;
		
		case 48: // 0
		case 96: // Numpad 0
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+0 => Zoom 100%
				zoomManager.level = 1;
			}
			break;
		
		case 53: // 5
			if (e.altKey && e.shiftKey && !ctrlOrCmd && !metaOrControl) {
				e.preventDefault();
				// Alt+Shift+5 => Strikethrough
				
				if (settings.get('tool') === 'text') {
					settings.set('strike', !settings.get('strike'));
					toolbar.toolboxes.textToolOptions.strikeToggle.checked = settings.get('strike');
				}
			}
			break;
		
		case 65: // A
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+A => Select all
				
				// Switch to the rectangular selection tool.
				if (tools.currentTool !== tools.selection) {
					tools.switchTool('selection');
				}
				// Select the entire canvas.
				tools.currentTool.selectAll(canvas.width, canvas.height);
			}
			break;
		
		case 66: // B
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+B => Bold
				
				if (settings.get('tool') === 'text') {
					settings.set('bold', !settings.get('bold'));
					toolbar.toolboxes.textToolOptions.boldToggle.checked = settings.get('bold');
				}
			} else if (noModifiers) {
				e.preventDefault();
				// B => Doodle (brush) tool
				tools.switchTool('doodle');
			}
			break;
		
		case 67: // C
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+C => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('C')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// C => Curve tool
				tools.switchTool('curve');
			}
			break;
		
		case 68: // D
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				
				if (tools.currentTool instanceof SelectionTool) {
					// Ctrl+D => Duplicate selection
					tools.currentTool.duplicate();
				}
			}
			break;
		
		case 69: // E
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+E => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('E')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+E => Resize dialog
				dialogs.resize.open();
			} else if (noModifiers) {
				e.preventDefault();
				// E => Eraser tool
				tools.switchTool('eraser');
			}
			break;
		
		case 70: // F
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+F => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('F')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// F => Freeform selection tool
				tools.switchTool('freeformSelection');
			}
			break;
		
		case 71: // G
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+G => Toggle grid
				settings.set('grid', !settings.get('grid'));
			}
			break;
		
		case 72: // H
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+H => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('H')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// H => Pan (hand) tool
				tools.switchTool('pan');
			}
			break;
		
		case 73: // I
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+I => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('I')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				
				if (settings.get('tool') === 'text') {
					// Ctrl+I => Italic (text tool)
					settings.set('italic', !settings.get('italic'));
					toolbar.toolboxes.textToolOptions.italicToggle.checked = settings.get('italic');
				} else {
					// Ctrl+I => Invert colors
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.invertColors();
					} else {
						tools.selection.invertColors();
					}
				}
			}
			if (noModifiers) {
				e.preventDefault();
				// I => Eyedropper (“I-dropper”) tool
				tools.switchTool('eyedropper');
			}
			break;
		
		case 75: // K
			if (noModifiers) {
				e.preventDefault();
				// K => Flood fill (paint bucket) tool
				tools.switchTool('floodFill');
			}
			break;
		
		case 76: // L
			if (noModifiers) {
				e.preventDefault();
				// L => Line tool
				tools.switchTool('line');
			}
			break;
		
		case 78: // N
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Shift+N => Clear canvas (no confirmation)
				// TODO: Make this not access ClearDialog private method.
				dialogs.clear._clear();
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+N => Clear (new image)
				dialogs.clear.open();
			}
			break;
		
		case 79: // O
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+O => Open
				document.getElementById('upload').click();
			} else if (noModifiers) {
				e.preventDefault();
				// O => Oval tool
				tools.switchTool('oval');
			}
			break;
		
		case 80: // P
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+P => Print
				window.print();
			} else if (noModifiers) {
				e.preventDefault();
				// P => Pencil tool
				tools.switchTool('pencil');
			}
			break;
		
		case 82: // R
			if (noModifiers) {
				e.preventDefault();
				// R => Rectangle tool
				tools.switchTool('rect');
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+S => Save
				dialogs.save.open();
			} else if (noModifiers) {
				e.preventDefault();
				// S => Selection tool
				tools.switchTool('selection');
			}
			break;
		
		case 84: // T
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+T => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('T')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// T => Text tool
				tools.switchTool('text');
			}
			break;
		
		case 85: // U
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+U => Underline
				
				if (settings.get('tool') === 'text') {
					settings.set('underline', !settings.get('underline'));
					toolbar.toolboxes.textToolOptions.underlineToggle.checked = settings.get('underline');
				}
			}
			break;
		
		case 86: // V
			if (ctrlOrCmd && e.altKey && !e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+V => Paste from...
				document.getElementById('pasteFrom').click();
			} else if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+V => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('V')) {
					e.preventDefault();
				}
			}
		
		case 88: // X
			if (noModifiers) {
				e.preventDefault();
				// X => Switch fill and line colors
				toolbar.toolboxes.colorPicker.swapSelectedColors();
			}
			break;
		
		case 89: // Y
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+Y => Redo
				undoStack.redo();
			} else if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+Y => Win7 Paint Help button
				if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
					dialogs.help.open();
				}
			}
			break;
		
		case 90: // Z
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Shift+Z => Redo
				undoStack.redo();
			} else if (ctrlOrCmdOnly || (ctrlOrCmd && e.altKey)) {
				e.preventDefault();
				// Ctrl+Z OR Ctrl+Alt+Z => Undo
				undoStack.undo();
			}
			break;
		
		case 112: // F1
			if (noModifiers) {
				e.preventDefault();
				// F1 => Open help dialog
				dialogs.help.open();
			}
			break;
		
		case 122: // F11
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+F11 => Full screen
				toolbar.toolboxes.app.attemptFullScreen();
			}
			break;
		
		case 187: // =/+
		case 107: // Numpad +
			if (ctrlOrCmd && e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+= => Zoom in
				zoomManager.zoomIn();
			}
			break;
		
		case 189: // -/_
		case 109: // Numpad -
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+- => Zoom out
				zoomManager.zoomOut();
			}
			break;
		
		case 191: // //?
			if (e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// ? OR Ctrl+? => Keyboard shortcuts dialog
				dialogs.keyboard.open();
			} else if (ctrlOrCmd && e.altKey && e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+Shift+? => MS Paint access key help dialog
				dialogs.msAccessKeyHelp.open();
			}
			break;
		
		case 219: // [
			if (noModifiers) {
				e.preventDefault();
				
				// [ => Decrease line width
				var lineWidthSelect = document.getElementById('lineWidth');
				if (lineWidthSelect.selectedIndex > 0) {
					settings.set('lineWidth',
						lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex - 1].value);
				}
			}
			break;
		
		case 221: // ]
			if (noModifiers) {
				e.preventDefault();
				
				// ] => Increase line width
				var lineWidthSelect = document.getElementById('lineWidth');
				if (lineWidthSelect.selectedIndex < lineWidthSelect.options.length - 1) {
					settings.set('lineWidth',
						lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex + 1].value);
				}
			}
			break;
	}
};

KeyManager.prototype._handleDialogKeyDown = function (e) {
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl;
	
	switch (e.keyCode) {
		case 78: // N
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				// Ctrl+Shift+N => Prevent new incognito window (Chrome)
				e.preventDefault();
				e.stopPropagation();
			} else if (ctrlOrCmdOnly) {
				// Ctrl+N => Prevent new window
				e.preventDefault();
				e.stopPropagation();
			}
			break;
		
		case 79: // O
			if (ctrlOrCmdOnly) {
				// Ctrl+O => Prevent open file
				e.preventDefault();
				e.stopPropagation();
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				// Ctrl+S => Prevent save page as
				e.preventDefault();
				e.stopPropagation();
			}
			break;
	}
};

function SettingsManager() {
	/** @private {Object} The current settings */
	this._settings = {};
	
	// Load settings from local storage where possible.
	this._loadStoredSettings();
	
	// Set up listener for system theme change.
	var boundSetTheme = this._setTheme.bind(this);
	window.matchMedia('(prefers-color-scheme: dark)').addListener(boundSetTheme);
	window.matchMedia('(prefers-color-scheme: light)').addListener(boundSetTheme);
	window.matchMedia('(prefers-color-scheme: no-preference)').addListener(boundSetTheme);
}

// Define constants.
/** @constant {Object} The default values for all settings */
SettingsManager.prototype.DEFAULTS = {
	// Canvas:
	width: 640,
	height: 480,
	// Toolbar-set options:
	tool: 'doodle',
	lineWidth: 2,
	outlineOption: 'outlineFill',
	lineColor: '#000000',
	fillColor: '#ffffff',
	transparentSelection: false,
	fontFamily: 'sans-serif',
	fontSize: 16,
	bold: false,
	italic: false,
	underline: false,
	strike: false,
	textFill: false,
	// Settings:
	theme: 'default',
	systemThemeOverride: true,
	colorPalette: 'material',
	grid: false,
	ghostDraw: false,
	antiAlias: true,
	maxUndoStackDepth: 50,
	// Other:
	firstRunDone: false,
	saveCount: 0
};
/** @constant {String} The prefix to add to stored setting keys in local storage */
SettingsManager.prototype.LOCAL_STORAGE_PREFIX = 'paintz_';
/** @constant {Object<String,String>} The primary color associated with each interface theme */
SettingsManager.prototype.THEME_COLORS = {
	default: '#3f51b5',
	dark: '#212121',
	light: '#f5f5f5'
};
/** @constant {Number} The maximum number of file saves to count. */
SettingsManager.prototype.MAX_SAVE_COUNT = 502;

/**
 * Set settings based on local storage, falling back to defaults where necessary.
 */
SettingsManager.prototype._loadStoredSettings = function () {
	for (var setting in this.DEFAULTS) {
		// Attempt to load settings from local storage.
		// Some browsers will throw an error if this is attempted in a private browsing session.
		try {
			var storedValue = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + setting);
			if (storedValue !== null) {
				// Parse stored values to their intended types.
				var correctedValue = this._toExpectedType(setting, storedValue);
				this.set(setting, correctedValue);
				continue;
			}
		} catch (err) {}
		
		this.set(setting, this.DEFAULTS[setting]);
	}
};

/**
 * Convert a setting value to its expected type.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value for the setting
 * @returns {Object} The value as the expected type for the setting
 */
SettingsManager.prototype._toExpectedType = function (setting, value) {
	switch (typeof(this.DEFAULTS[setting])) {
		case 'boolean':
			return !!value;
		case 'number':
			return parseFloat(value);
		default:
			return value;
	}
};

/**
 * Update the UI to reflect a setting change.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value to save for the setting
 */
SettingsManager.prototype._implementSettingChange = function (setting, value) {
	switch (setting) {
		case 'width':
			if (canvas.width !== value) {
				canvas.width = value;
			}
			if (preCanvas.width !== value) {
				preCanvas.width = value;
			}
			canvasPositioner.style.width = (value * zoomManager.level) + 'px';
			gridCanvas.width = (value * zoomManager.level);
			if (this.get('grid')) {
				zoomManager.drawGrid();
			}
			if (toolbar.toolboxes) {
				toolbar.toolboxes.dimensions.updateResolution();
			}
			break;
		case 'height':
			if (canvas.height !== value) {
				canvas.height = value;
			}
			if (preCanvas.height !== value) {
				preCanvas.height = value;
			}
			canvasPositioner.style.height = (value * zoomManager.level) + 'px';
			gridCanvas.height = (value * zoomManager.level);
			if (this.get('grid')) {
				zoomManager.drawGrid();
			}
			if (toolbar.toolboxes) {
				toolbar.toolboxes.dimensions.updateResolution();
			}
			break;
		case 'lineWidth':
			// Some tools' cursors change with the line width, so reactivate the tool.
			if (tools && tools.currentTool) {
				tools.currentTool.activate();
				if (tools.currentTool instanceof DrawingTool) {
					// This private property access will be swapped out when the settings manager gets overhauled in v4.0.
					tools.currentTool._updateFromDrawingSettings();
					tools.currentTool._canvasDirty = true;
					tools.currentTool.update();
				}
			}
			break;
		case 'lineColor':
			if (toolbar && toolbar.toolboxes && toolbar.toolboxes.colorPicker) {
				toolbar.toolboxes.colorPicker.colorIndicator.style.borderColor = value;
			}
			if (tools && tools.currentTool && tools.currentTool instanceof DrawingTool) {
				// This private property access will be swapped out when the settings manager gets overhauled in v4.0.
				tools.currentTool._updateFromDrawingSettings();
				tools.currentTool._canvasDirty = true;
				tools.currentTool.update();
			}
			break;
		case 'fillColor':
		case 'transparentSelection':
			if (toolbar && toolbar.toolboxes && toolbar.toolboxes.colorPicker) {
				toolbar.toolboxes.colorPicker.colorIndicator.style.backgroundColor = value;
			}
			if (tools && tools.currentTool) {
				if (tools.currentTool instanceof DrawingTool) {
					// This private property access will be swapped out when the settings manager gets overhauled in v4.0.
					tools.currentTool._updateFromDrawingSettings();
					tools.currentTool._canvasDirty = true;
					tools.currentTool.update();
				} else if (tools.currentTool.setTransparentBackground) {
					tools.currentTool.setTransparentBackground();
					tools.currentTool.redrawSelection();
				}
			}
			break;
		case 'outlineOption':
			if (tools && tools.currentTool && tools.currentTool === tools.polygon) {
				// This private property access will be swapped out when the settings manager gets overhauled in v4.0.
				tools.currentTool._updateFromDrawingSettings();
				tools.currentTool._canvasDirty = true;
				tools.currentTool.update();
			}
			break;
		case 'fontFamily':
		case 'fontSize':
		case 'bold':
		case 'italic':
		case 'underline':
		case 'strike':
		case 'textFill':
			if (tools && tools.currentTool && tools.currentTool.updateTextElem) {
				tools.currentTool.updateTextElem();
			}
			break;
		case 'theme':
		case 'systemThemeOverride':
			this._setTheme();
			break;
		case 'grid':
			if (value) {
				zoomManager.drawGrid();
			} else {
				Utils.clearCanvas(gridCxt);
			}
			break;
		case 'ghostDraw':
			preCanvas.classList[value ? 'add' : 'remove']('ghost');
			break;
		case 'maxUndoStackDepth':
			undoStack.pruneToLimit();
			break;
	}
};

/**
 * Set the interface theme.
 */
SettingsManager.prototype._setTheme = function () {
	var theme = this.get('theme');
	
	if (this.get('systemThemeOverride')) {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		} else if (window.matchMedia('(prefers-color-scheme: light)').matches && theme === 'dark') {
			// If the theme is 'default' or 'light', leave it as is; only override if it is 'dark'.
			theme = 'default';
		}
	}
	
	document.getElementById('themeStyleLink').href = 'styles/themes/' + theme + '.css';
	document.querySelector('meta[name="msapplication-navbutton-color"]').content =
		document.querySelector('meta[name="theme-color"]').content = this.THEME_COLORS[theme];
};

/**
 * Get a setting.
 * @param {String} setting - The name of the setting
 */
SettingsManager.prototype.get = function (setting) {
	var value = this._settings[setting];
	if (typeof(value) !== 'undefined') {
		return this._toExpectedType(setting, value);
	}
	return this.DEFAULTS[setting];
};

/**
 * Save a setting.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value to save for the setting
 */
SettingsManager.prototype.set = function (setting, value) {
	var correctedValue = this._toExpectedType(setting, value);
	this._settings[setting] = correctedValue;
	this._implementSettingChange(setting, correctedValue);
	
	// Attempt to save the setting to local storage.
	// Some browsers will throw an error if this is attempted in a private browsing session.
	try {
		if (typeof(this.DEFAULTS[setting]) === 'boolean') {
			// Convert boolean values to truey/falsey string values for local storage.
			// Other values should coerce to strings fine.
			correctedValue = correctedValue ? 'true' : '';
		}
		localStorage.setItem(this.LOCAL_STORAGE_PREFIX + setting, correctedValue);
	} catch (err) {}
};
var undoStack = {
	_undoStack: [],
	_redoStack: [],
	_currentState: undefined,
	changedSinceSave: false,
	
	/** @returns {Boolean} Whether there is an available redo state */
	get canRedo() {
		return this._redoStack.length > 0;
	},
	
	/** @returns {Boolean} Whether there is an available undo state */
	get canUndo() {
		return this._undoStack.length > 0;
	},
	
	/**
	 * Apply an image state.
	 * @param {Object} state - The state to apply.
	 */
	_applyState: function (state) {
		this._currentState = state;
		
		settings.set('width', state.width);
		settings.set('height', state.height);
		cxt.drawImage(state.image, 0, 0);
		
		// Save the state to session storage in case the page gets reloaded.
		try {
			sessionStorage.lastState = state.image.src;
		} catch (err) {
			// If the image is too large to store, there is not much that can be done.
			console.warn('The latest state was too large to store in session storage.');
		}
	},
	
	/**
	 * Disable buttons for empty stacks.
	 */
	_updateUI: function () {
		// Update the redo button.
		toolbar.toolboxes.image.redoBtn.disabled = !this.canRedo;
		
		// Update the undo button.
		toolbar.toolboxes.image.undoBtn.disabled = !this.canUndo;
	},
	
	/**
	 * Add the current state to the undo stack.
	 */
	addState: function () {
		// Add the last state to the undo stack.
		if (this._currentState) {
			this._undoStack.push(this._currentState);
			this.pruneToLimit();
		}
		// Save the current state.
		var image = new Image();
		image.src = canvas.toDataURL();
		this._currentState = {
			image: image,
			width: canvas.width,
			height: canvas.height
		};
		
		// Save the state to session storage in case the page gets reloaded.
		try {
			sessionStorage.lastState = image.src;
		} catch (err) {
			// If the image is too large to store, there is not much that can be done.
			console.warn('The latest state was too large to store in session storage.');
		}
		
		// Clear the redo stack.
		this._redoStack = [];
		
		this.changedSinceSave = true;
		this._updateUI();
	},
	
	/**
	 * Prune the undo stack down to the limit.
	 */
	pruneToLimit: function () {
		if (this._undoStack.length === 0 || this._undoStack.length <= settings.get('maxUndoStackDepth')) {
			// Abort if the undo stack is empty or otherwise under the limit.
			// Need to short-circuit the settings check on initial load because `settings` does not exist yet.
			return;
		}
		var amountExceededBy = this._undoStack.length - settings.get('maxUndoStackDepth');
		this._undoStack.splice(0, amountExceededBy);
	},
	
	/**
	 * Clear the undo and redo stacks.
	 */
	clear: function () {
		this._undoStack = [];
		this._redoStack = [];
		this._currentState = undefined;
		this.addState();
		this.changedSinceSave = false;
		this._updateUI();
	},
	
	/**
	 * Return to the last state in the redo stack.
	 */
	redo: function () {
		// Quit if the redo stack is empty.
		if (!this.canRedo) {
			this._updateUI();
			return;
		}
		
		// Warn the current tool of impending changes.
		tools.currentTool.deactivate();
		
		// Add the current state to the undo stack and restore the last state from
		// the redo stack.
		var restoreState = this._redoStack.pop();
		this._undoStack.push(this._currentState);
		this.pruneToLimit();
		this._applyState(restoreState);
		
		this.changedSinceSave = true;
		this._updateUI();
		
		// Reactivate the current tool.
		tools.currentTool.activate();
	},
	
	/**
	 * Revert to the last state in the undo stack.
	 */
	undo: function () {
		// Quit if the undo stack is empty.
		if (!this.canUndo) {
			this._updateUI();
			return;
		}
		
		// Warn the current tool of impending changes.
		tools.currentTool.deactivate();
		
		// Add the current state to the redo stack and restore the last state from
		// the undo stack.
		var restoreState = this._undoStack.pop();
		this._redoStack.push(this._currentState);
		this._applyState(restoreState);
		
		this.changedSinceSave = true;
		this._updateUI();
		
		// Reactivate the current tool.
		tools.currentTool.activate();
	}
};
/**
 * Create a new ZoomManager instance and set up its event listeners.
 */
function ZoomManager() {
	/** @private {Number} The actual zoom level, with 1 being actual size */
	this._zoomLevel = 1;
	
	// Set up scroll event listeners for different browsers.
	document.body.addEventListener('wheel', this._handleScroll.bind(this), { passive: false });
}

/** @constant {Array<Number>} The zoom levels for the slider to snap to */
ZoomManager.prototype.ZOOM_LEVELS = [
	25,
	50,
	75,
	100,
	200,
	400,
	800
];

/** @constant {Object<Number, Number>} The grid sizes for zoom levels */
ZoomManager.prototype.GRID_SIZES = {
//	zoom level : grid size
	25:  50,
	50:  20,
	100: 10,
	200: 5,
	400: 1
};

Object.defineProperties(ZoomManager.prototype, {
	level: {
		get: function () {
			return this._zoomLevel;
		},
		set: function (newLevel) {
			// Round it to the hundredths.
			newLevel = Math.round(newLevel * 100) / 100;
			if (isNaN(newLevel) || newLevel < 0.01 || newLevel > 9.99) {
				return;
			}
			
			// Set the new value.
			this._zoomLevel = newLevel;
			
			// Update the zoom UI.
			toolbar.toolboxes.zoom.percent.value = this.levelPercent;
			toolbar.toolboxes.zoom.slider.value = this._nearestZoomLevel(this.levelPercent);
			
			// Resize the canvases accordingly.
			canvas.style.WebkitTransform =
				canvas.style.MozTransform =
				canvas.style.MsTransform =
				canvas.style.OTransform =
				canvas.style.transform =
				preCanvas.style.WebkitTransform =
				preCanvas.style.MozTransform =
				preCanvas.style.MsTransform =
				preCanvas.style.OTransform =
				preCanvas.style.transform = 'scale(' + this._zoomLevel + ')';
			canvasPositioner.style.width = (settings.get('width') * this._zoomLevel) + 'px';
			canvasPositioner.style.height = (settings.get('height') * this._zoomLevel) + 'px';
			gridCanvas.width = settings.get('width') * this._zoomLevel;
			gridCanvas.height = settings.get('height') * this._zoomLevel;
			
			// Allow the tool to update its cursor.
			tools.currentTool.activate();
			
			// Update the gridlines if enabled.
			if (settings.get('grid')) {
				this.drawGrid();
			}
		}
	},
	levelPercent: {
		get: function () {
			return Math.round(this._zoomLevel * 100);
		},
		set: function (newPercent) {
			newPercent = Math.round(newPercent);
			if (isNaN(newPercent) || newPercent < 1 || newPercent > 999) {
				return;
			}
			this.level = newPercent / 100;
		}
	}
});

/**
 * Handle the mouse wheel being scrolled or a touchpad gesture registering as a mouse wheel event.
 * @param {WheelEvent|Event} ev
 */
ZoomManager.prototype._handleScroll = function (ev) {
	if (!Utils.checkPlatformCtrlOrCmdKey(ev) || ev.shiftKey || Utils.checkPlatformMetaOrControlKey(ev)) {
		// Only handle Ctrl+scroll or Ctrl+Alt+scroll.
		// ToolbarManager handles stopping propagation of scroll events on the toolbars,
		// and app initialization currently stops propagation on the dialogs container.
		return;
	}
	ev.preventDefault();
	ev.stopPropagation();
	
	var WHEEL_NOTCH_DELTA = 100, // Rough scroll delta per mouse wheel notch; across browsers.
		scrollY = ev.deltaY || ev.wheelDeltaY || ev.wheelDelta || 0,
		zoomAmount = scrollY / -WHEEL_NOTCH_DELTA; // Will be rounded to hundredths when set.
	
	// If the browser is treating 1 wheel notch as a larger delta, constrain to increments of 100.
	zoomAmount = Utils.constrainValue(zoomAmount, -1, 1);
	
	if ((zoomAmount < 0 && this.level < 1.25) || (zoomAmount > 0 && this.level < 1)) {
		// Zoom in 25% increments instead of 100% increments when going
		// down to under 100% or increasing from under 100%.
		zoomAmount *= 0.25;
	}
	
	this.level += zoomAmount;
	this.level = Math.min(this.level, 8); // Do not mousewheel zoom past 800%.
};

/**
 * @private
 * Find the nearest zoom level to the given percentage.
 * @param {Number} percent - The specified zoom percentage
 * @returns {Number} The nearest zoom level index
 */
ZoomManager.prototype._nearestZoomLevel = function (percent) {
	var i = 0;
	for (i = 0; i < this.ZOOM_LEVELS.length - 1; i++) {
		if (percent < (this.ZOOM_LEVELS[i] + this.ZOOM_LEVELS[i + 1]) / 2) {
			return i;
		}
	}
	return i;
};

/**
 * Zoom in to the next level on the slider.
 */
ZoomManager.prototype.zoomIn = function () {
	toolbar.toolboxes.zoom.slider.stepUp();
	toolbar.toolboxes.zoom.slider.oninput();
};

/**
 * Zoom out to the next level on the slider.
 */
ZoomManager.prototype.zoomOut = function () {
	toolbar.toolboxes.zoom.slider.stepDown();
	toolbar.toolboxes.zoom.slider.oninput();
};

/**
 * Draw gridlines for the current zoom level, if enabled.
 */
ZoomManager.prototype.drawGrid = function () {
	// Get the grid size for the current zoom level.
	var baseGridSize = 0;
	for (var level in this.GRID_SIZES) {
		if (baseGridSize && this.levelPercent < level) {
			// Stop one level down.
			break;
		}
		baseGridSize = this.GRID_SIZES[level];
	}
	
	// Adjust the spacing to match the actual canvas.
	var gridSize = baseGridSize * this._zoomLevel;
	
	Utils.clearCanvas(gridCxt);
	Utils.drawGrid(gridSize, gridCxt);
};

/**
 * @class
 * Create a new ProgressSpinner instance.
 */
function ProgressSpinner() {
	this._element = document.createElement('progress');
	this._element.className = 'circular';
	
	this._container = document.createElement('div');
	this._container.id = 'progressContainer';
	this._container.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
	
	this._container.appendChild(this._element);
	document.body.appendChild(this._container);
}

/**
 * Show the progress spinner.
 */
ProgressSpinner.prototype.show = function () {
	this._container.style.display = 'block';
	this._container.classList.add('visible');
};

/**
 * Hide the progress spinner.
 */
ProgressSpinner.prototype.hide = function () {
	this._container.classList.remove('visible');
	setTimeout((function () {
		this._container.style.display = 'none';
	}).bind(this), (Utils.prefersReducedMotion ? 1 : Dialog.prototype.TRANSITION_DURATION));
};

/**
 * @class
 * Create a new Dialog instance.  A dialog is a box that displays over the rest of the page and must be closed to interact with the rest of the page.
 * @param {String} contentFileName - The name of the HTML partial file with the dialog's contents
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function Dialog(contentFileName, trigger) {
	this._boundClose = this.close.bind(this);
	
	/** @private {HTMLFormElement} The container for dialog's content */
	this._element = document.createElement('form');
	this._element.className = this.CSS_CLASSES;
	if (this.WIDTH) {
		this._element.style.width = this.WIDTH;
	}
	if (this.MAX_WIDTH) {
		this._element.style.maxWidth = this.MAX_WIDTH;
	}
	this._element.addEventListener('submit', this._boundClose);
	this._element.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
	
	/** {HTMLElement} The element that should contain the dialog and handle positioning it on the page */
	this._dialogContainer = document.getElementById('dialogsContainer');
	
	/** {HTMLElement} The button that triggers the dialog, if any */
	this.trigger = trigger;
	
	// Fetch the dialog content, then set up the dialog.
	this.loadPromise =
		Utils.fetch(this.PARTIALS_DIR + contentFileName + '.html')
			.then(this._setUp.bind(this));
}

// Define constants.
/** @constant {String} The path and prefix for dialog partials */
Dialog.prototype.PARTIALS_DIR = 'partials/dialogs/';
/** @constant {String} The CSS classes for the dialog container element */
Dialog.prototype.CSS_CLASSES = 'dialog card z3';
/** @constant {String} The width of the dialog, as a CSS value */
Dialog.prototype.WIDTH;
/** @constant {String} The maximum width of the dialog, as a CSS value */
Dialog.prototype.MAX_WIDTH;
/** @constant {Number} The duration of the dialog open/close transition, in milliseconds */
Dialog.prototype.TRANSITION_DURATION = 200;

/**
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
Dialog.prototype._setUp = function (contents) {
	this._element.innerHTML = contents;
	
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		this._element.innerHTML = this._element.innerHTML
			.replace(/Ctrl\+/g, '&#x2318;')
			.replace(/\<kbd>Ctrl\<\/kbd>/g, '<kbd>&#x2318;</kbd>')
			.replace(/Alt\+/g, '&#x2325;')
			.replace(/\<kbd>Alt\<\/kbd>/g, '<kbd>&#x2325;</kbd>')
			.replace(/Shift\+/g, '&#x21e7;')
			.replace(/\<kbd>Shift\<\/kbd>/g, '<kbd>&#x21e7;</kbd>');
	}
	
	// Set up all close buttons.
	Array.from(this._element.querySelectorAll('.closeButton')).forEach(function (closeButton) {
		closeButton.onclick = this.close.bind(this);
	}, this);
	
	// Make the dialog close when Esc is pressed.
	this._element.addEventListener('keydown', (function (e) {
		if (e.keyCode === 27) {
			e.preventDefault();
			this.close();
		}
	}).bind(this), false);
};

/**
 * @private
 * Set the dialog's transform origin so it appears to open from its trigger button.
 */
Dialog.prototype._setTransformOrigin = function () {
	// If there is no trigger element, do nothing.
	if (typeof this.trigger === 'undefined') {
		return;
	}
	
	// Calculate the new transform origin.
	var originX = (this.trigger.offsetLeft - toolbar.scrollLeft - this._element.offsetLeft),
		originY = (this.trigger.offsetTop - this._element.offsetTop);
	
	// Set the transform origin.
	this._element.style.WebkitTransformOrigin =
		this._element.style.MozTransformOrigin =
		this._element.style.MsTransformOrigin =
		this._element.style.OTransformOrigin =
		this._element.style.transformOrigin = originX + 'px ' + originY + 'px';
	
	// Force a reflow.
	this._element.offsetLeft;
};

/**
 * Focus the first appropriate element in the dialog.
 */
Dialog.prototype.focus = function () {
	var firstInput = this._element.querySelector('input, select, textarea');
	if (firstInput) {
		// Focus the first form input element in the dialog.
		firstInput.focus();
	} else {
		// If there are no input elements, focus the submit button.
		var submitButton = this._element.querySelector('button[type=\"submit\"]')
		if (submitButton) {
			submitButton.focus();
		}
	}
};

/**
 * Open the dialog.
 */
Dialog.prototype.open = function () {
	// Disable app keyboard shortcuts and clipboard interceptions.
	keyManager.enabled = false;
	clipboard.enabled = false;
	
	// Show the dialog and dialog container.
	this._dialogContainer.style.display = 'block';
	this._dialogContainer.appendChild(this._element);
	this._setTransformOrigin();
	
	// Make selecting outside the dialog close the dialog.
	this._dialogContainer.addEventListener('pointerdown', this._boundClose);
	
	Utils.raf((function () {
		Utils.raf(this._finishOpen.bind(this));
	}).bind(this));
};

/**
 * @private
 * Finish opening the dialog on the next frame.
 */
Dialog.prototype._finishOpen = function () {
	this._dialogContainer.classList.add('visible');
	this._element.classList.add('open');
	this.focus();
};

/**
 * Close the dialog.
 * @param {Event} [e] - The event that triggered the close, if any.
 * @returns {Promise} Resolves when the dialog has closed
 */
Dialog.prototype.close = function (e) {
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	var that = this;
	return new Promise(function (resolve, reject) {
		// Remove the listener that makes selecting outside the dialog close the dialog.
		that._dialogContainer.removeEventListener('pointerdown', that._boundClose);
		
		that._setTransformOrigin();
		that._element.classList.remove('open');
		that._dialogContainer.classList.remove('visible');
		// After the closing animation has completed, hide the dialog box element completely.
		setTimeout(function () {
			that._finishClose();
			resolve();
		}, (Utils.prefersReducedMotion ? 1 : that.TRANSITION_DURATION));
	});
};

/**
 * @private
 * Finish closing the dialog after the closing animation.
 */
Dialog.prototype._finishClose = function () {
	// Hide the dialog and dialog container.
	this._element.remove();
	this._dialogContainer.style.display = 'none';
	// Re-enable app keyboard shortcuts and clipboard interception.
	keyManager.enabled = true;
	clipboard.enabled = true;
};
/**
 * @class
 * Create a new BottomSheetDialog instance.
 * @param {String} contentFileName - The name of the HTML partial file with the dialog's contents
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function BottomSheetDialog(contentFileName, trigger) {
	Dialog.call(this, contentFileName, trigger);
	
	this._dialogContainer = document.getElementById('bottomSheetsContainer');
}
// Extend Dialog.
BottomSheetDialog.prototype = Object.create(Dialog.prototype);
BottomSheetDialog.prototype.constructor = BottomSheetDialog;

// Define constants.
/** @constant {Number} How long to wait when closing on a delay, in milliseconds */
BottomSheetDialog.prototype.CLOSE_DELAY = 1000;
/** @constant {Number} The amount to rewind the save count if the user decides to delay the prompt */
BottomSheetDialog.prototype.SAVE_COUNT_REWIND_AMOUNT = 10;
/** @override @constant {String} The width of the dialog, as a CSS value */
BottomSheetDialog.prototype.WIDTH = '412px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
BottomSheetDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Set up later buttons.
	Array.from(this._element.querySelectorAll('.postponeButton')).forEach(function (postponeButton) {
		postponeButton.onclick = this._postpone.bind(this);
	}, this);
};

/**
 * Handle the “Later” button being clicked.
 */
BottomSheetDialog.prototype._postpone = function () {
	var	saveCount = settings.get('saveCount');
	
	settings.set('saveCount', saveCount - this.SAVE_COUNT_REWIND_AMOUNT);
	
	this.close();
};

/**
 * Close the dialog after the link is clicked.
 */
BottomSheetDialog.prototype._closeAfterDelay = function () {
	setTimeout(this.close.bind(this), this.CLOSE_DELAY);
};

/**
 * @class
 * Create a new AboutDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function AboutDialog(trigger) {
	Dialog.call(this, 'about', trigger);
}
// Extend Dialog.
AboutDialog.prototype = Object.create(Dialog.prototype);
AboutDialog.prototype.constructor = AboutDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
AboutDialog.prototype.WIDTH = '520px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
AboutDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	this._initCWSLinks();
};

/**
 * @private
 * Set the correct Chrome Web Store link to appear depending on the user's browser and whether the app is installed.
 */
AboutDialog.prototype._initCWSLinks = function () {
	if ((!window.chrome || !chrome.webstore) || (window.chrome && chrome.app && chrome.app.isInstalled)) {
		// If this is not Chrome or the CWS app is already installed, do not ask the user to install.
		return;
	}
	
	var installLink = this._element.querySelector('#cwsInstallLink'),
		feedbackLink = this._element.querySelector('#cwsFeedbackLink');
	
	// Switch which link's row is visible.
	feedbackLink.parentElement.style.display = 'none';
	installLink.parentElement.style.removeProperty('display');
	
	// Enable inline installation if the user's browser supports it.
	if (chrome.webstore.install) {
		installLink.onclick = function (e) {
			e.preventDefault();
			var cwsURL = document.querySelector('link[rel=\"chrome-webstore-item\"]').href;
			chrome.webstore.install(cwsURL, function () {
				// Change links on successful installation.
				installLink.parentElement.style.display = 'none';
				feedbackLink.parentElement.style.removeProperty('display');
			}, function (err) {
				// If triggering installation fails, just open the CWS page if Chrome did not already do so.
				if (err.indexOf('The user will be redirected to the Chrome Web Store') === -1) {
					window.open(e.target.href, '_blank');
				}
			});
		};
	}
};
/**
 * @class
 * Create a new AutoRestoreDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function AutoRestoreDialog(trigger) {
	BottomSheetDialog.call(this, 'auto_restore', trigger);
	this._element.id = 'autoRestoreDialog';
	this._autoHideTimeout;
}
// Extend BottomSheetDialog.
AutoRestoreDialog.prototype = Object.create(BottomSheetDialog.prototype);
AutoRestoreDialog.prototype.constructor = AutoRestoreDialog;

// Define constants.
/** @constant {Number} The time after which to automatically close the message, in milliseconds */
AutoRestoreDialog.prototype.AUTO_HIDE_DELAY = 5000;

/**
 * @override
 * Open the dialog and prepare it to auto-close.
 */
AutoRestoreDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._autoHideTimeout = setTimeout(this.close.bind(this), this.AUTO_HIDE_DELAY);
};

/**
 * @override
 * Close the dialog and clear the auto-close timeout.
 * @param {Event} [ev] - The event that triggered the close, if any.
 * @returns {Promise} Resolves when the dialog has closed
 */
AutoRestoreDialog.prototype.close = function (ev) {
	clearTimeout(this._autoHideTimeout);
	return Dialog.prototype.close.call(this, ev);
};
/**
 * @class
 * Create a new ClearDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ClearDialog(trigger) {
	Dialog.call(this, 'clear', trigger);
	this._element.addEventListener('submit', this._clear.bind(this));
}
// Extend Dialog.
ClearDialog.prototype = Object.create(Dialog.prototype);
ClearDialog.prototype.constructor = ClearDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ClearDialog.prototype.WIDTH = '384px';

/**
 * @private
 * Save the selected settings.
 */
ClearDialog.prototype._clear = function () {
	// Deactivate and reactivate the current tool in case it is being used.
	tools.currentTool.deactivate();
	tools.currentTool.activate();
	
	// Animate clearing the canvas.
	var CENTER_X = 0,
		CENTER_Y = -224,
		MAX_RADIUS = Math.max(canvas.width, canvas.height) * 2,
		STEP = Math.floor(MAX_RADIUS / 16),
		radius = 224;
	
	if (Utils.prefersReducedMotion) {
		// Skip the animation if the user prefers reduced motion.
		radius = MAX_RADIUS;
	}
	
	function expandClearCircle() {
		radius += STEP;
		
		cxt.fillStyle = settings.get('fillColor');
		cxt.beginPath();
		cxt.arc(CENTER_X, CENTER_Y, radius, 0, Math.TAU);
		cxt.closePath();
		cxt.fill();
		
		if (radius < MAX_RADIUS) {
			Utils.raf(expandClearCircle);
		} else {
			// Finish clearing and add the change to the undo stack.
			resetCanvas();
			undoStack.addState();
		}
	}
	Utils.raf(expandClearCircle);
	document.title = DEFAULT_TITLE + PAGE_TITLE_SUFFIX;
};

/**
 * @class
 * Create a new ColorPickerDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ColorPickerDialog(trigger) {
	Dialog.call(this, 'color_picker', trigger);
	
	this.colorPickers;
	
	this._element.id = 'colorPickerDialog';
	this._element.addEventListener('submit', this._saveNewColors.bind(this));
}
// Extend Dialog.
ColorPickerDialog.prototype = Object.create(Dialog.prototype);
ColorPickerDialog.prototype.constructor = ColorPickerDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ColorPickerDialog.prototype.WIDTH = '640px';
/** @constant {String} The maximum width of the dialog, as a CSS value */
ColorPickerDialog.prototype.MAX_WIDTH = 'none';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ColorPickerDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this.colorPickers = {
		line: new ColorPicker(
			this._element.querySelector('#lineColorSlider'),
			this._element.querySelector('#lineColorPicker'),
			(function (hex, hsv, rgb, pickerCoords) {
				this._updateColorFields('line', hex, hsv, rgb, pickerCoords);
			}).bind(this)
		),
		fill: new ColorPicker(
			this._element.querySelector('#fillColorSlider'),
			this._element.querySelector('#fillColorPicker'),
			(function (hex, hsv, rgb, pickerCoords) {
				this._updateColorFields('fill', hex, hsv, rgb, pickerCoords);
			}).bind(this)
		)
	};
	
	this._element.lineColorHex.oninput =
		this._element.fillColorHex.oninput = this._updateHex.bind(this);
	this._element.lineColorHue.oninput =
		this._element.lineColorSaturation.oninput =
		this._element.lineColorLightness.oninput =
		this._element.fillColorHue.oninput =
		this._element.fillColorSaturation.oninput =
		this._element.fillColorLightness.oninput = this._updateHSL.bind(this);
	this._element.lineColorRed.oninput =
		this._element.lineColorGreen.oninput =
		this._element.lineColorBlue.oninput =
		this._element.fillColorRed.oninput =
		this._element.fillColorGreen.oninput =
		this._element.fillColorBlue.oninput = this._updateRGB.bind(this);
	
	this._element.querySelector('#colorSwapButton').addEventListener('click', this._swapColors.bind(this), false);
};

/**
 * @override
 * Open the dialog.
 */
ColorPickerDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._showCurrentColors();
};

/**
 * @private
 * Update the setting options to show the current saved settings.
 */
ColorPickerDialog.prototype._showCurrentColors = function () {
	this.colorPickers.line.setHex(settings.get('lineColor'));
	this._element.lineColorHex.value = settings.get('lineColor');
	this.colorPickers.fill.setHex(settings.get('fillColor'));
	this._element.fillColorHex.value = settings.get('fillColor');
};

/**
 * @private
 * Swap the line and fill colors.
 */
ColorPickerDialog.prototype._swapColors = function () {
	var oldLine = this._element['lineColorHex'].value,
		oldFill = this._element['fillColorHex'].value;
	this.colorPickers.line.setHex(oldFill);
	this.colorPickers.fill.setHex(oldLine);
};

ColorPickerDialog.prototype._updateHex = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var hex = this._element[type + 'ColorHex'].value;
	// Quit if anything but a valid hex code was entered.
	if (!hex.match(/#[0-9A-Fa-f]{6}/)) {
		return;
	}
	this.colorPickers[type].setHex(hex);
};
ColorPickerDialog.prototype._updateHSL = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var h = this._element[type + 'ColorHue'].value || 0;
	h = Utils.constrainValue(h, 0, 360);
	var s = (this._element[type + 'ColorSaturation'].value || 0) / 100;
	s = Utils.constrainValue(s, 0, 100);
	var l = (this._element[type + 'ColorLightness'].value || 0) / 100;
	l = Utils.constrainValue(l, 0, 100);
	this.colorPickers[type].setHsv({h: h, s: s, v: l});
};
ColorPickerDialog.prototype._updateRGB = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var r = this._element[type + 'ColorRed'].value || 0;
	r = Utils.constrainValue(r, 0, 255);
	var g = this._element[type + 'ColorGreen'].value || 0;
	g = Utils.constrainValue(g, 0, 255);
	var b = this._element[type + 'ColorBlue'].value || 0;
	b = Utils.constrainValue(b, 0, 255);
	this.colorPickers[type].setRgb({r: r, g: g, b: b});
};
ColorPickerDialog.prototype._updateColorFields = function (type, hex, hsv, rgb, pickerCoords) {
	hsv.h = Utils.constrainValue(hsv.h, 0, 360);
	hsv.s = Utils.constrainValue(hsv.s, 0, 100);
	hsv.v = Utils.constrainValue(hsv.v, 0, 100);
	rgb.r = Utils.constrainValue(rgb.r, 0, 255);
	rgb.g = Utils.constrainValue(rgb.g, 0, 255);
	rgb.b = Utils.constrainValue(rgb.b, 0, 255);
	hex = ColorPicker.rgb2hex(rgb);
	if (pickerCoords) {
		var pickerIndicator = this.colorPickers[type].pickerElement.getElementsByClassName('picker-indicator')[0];
		pickerIndicator.style.left = (hsv.s * 100) + '%';
		pickerIndicator.style.top = (100 - hsv.v * 100) + '%';
	}
	var sliderIndicator = this.colorPickers[type].slideElement.getElementsByClassName('slide-indicator')[0];
	sliderIndicator.style.top = (hsv.h / 360 * 100) + '%';

	this._element.querySelector('#' + type + 'ColorSample').style.backgroundColor = hex;
	this._element[type + 'ColorHex'].value = hex;
	this._element[type + 'ColorHue'].value = Math.floor(hsv.h);
	this._element[type + 'ColorSaturation'].value = Math.floor(hsv.s * 100);
	this._element[type + 'ColorLightness'].value = Math.floor(hsv.v * 100);
	this._element[type + 'ColorRed'].value = rgb.r;
	this._element[type + 'ColorGreen'].value = rgb.g;
	this._element[type + 'ColorBlue'].value = rgb.b;
};

ColorPickerDialog.prototype._saveNewColors = function () {
	var colorIndicator = document.getElementById('colors');
	if (this._element.lineColorHex.value !== '') {
		settings.set('lineColor', this._element.lineColorHex.value);
	}
	if (this._element.fillColorHex.value !== '') {
		settings.set('fillColor', this._element.fillColorHex.value);
	}
};
/**
 * @class
 * Create a new CoffeeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function CoffeeDialog(trigger) {
	BottomSheetDialog.call(this, 'coffee', trigger);
}
// Extend Dialog.
CoffeeDialog.prototype = Object.create(BottomSheetDialog.prototype);
CoffeeDialog.prototype.constructor = CoffeeDialog;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
CoffeeDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#coffeeLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};
/**
 * @class
 * Create a new HelpDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function HelpDialog(trigger) {
	Dialog.call(this, 'help', trigger);
	this._element.id = 'helpDialog';
}
// Extend Dialog.
HelpDialog.prototype = Object.create(Dialog.prototype);
HelpDialog.prototype.constructor = HelpDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
HelpDialog.prototype.WIDTH = '656px';

/**
 * @class
 * Create a new InstallDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function InstallDialog(trigger) {
	BottomSheetDialog.call(this, 'install', trigger);
	
	window.addEventListener('beforeinstallprompt', (function (e) {
		e.preventDefault();
		this.deferredInstall = e;
	}).bind(this));
}
// Extend Dialog.
InstallDialog.prototype = Object.create(BottomSheetDialog.prototype);
InstallDialog.prototype.constructor = InstallDialog;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
InstallDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._cta = this._element.querySelector('.callToAction');
	this._submitLink = this._element.querySelector('.submitLink');
	this._icon = this._element.querySelector('svg use');
	
	if (this.deferredInstall) {
		this._changeToPWAInstallPrompt();
	} else if (Utils.isMobileLike) {
		this._cta.innerHTML = 'add PaintZ to your home screen';
		this._submitLink.href = 'https://www.howtogeek.com/196087/how-to-add-websites-to-the-home-screen-on-any-smartphone-or-tablet/';
	} else if (navigator.userAgent.match(/chrome/i)) {
		/*this._cta.innerHTML = 'install PaintZ from the Chrome Web Store';
		this._submitLink.innerHTML = 'Install';
		this._submitLink.href = 'https://chrome.google.com/webstore/detail/gdjcnhanmagpjdpilaehedkchegnkdoj';
		var iconURL = 'images/icons/cws.svg#icon';
		this._icon.setAttribute('href',       iconURL);
		this._icon.setAttribute('xlink:href', iconURL);*/
	}
	
	this._submitLink.addEventListener('click', this._closeAfterDelay.bind(this), false);
};	

/**
 * @override
 * Open the dialog if the app is not already installed.
 */
InstallDialog.prototype.open = function () {
	// Do not open if already running as an “app”.
	var runningStandalone = window.matchMedia('(display-mode: standalone)').matches,
		installedAsChromeApp = (window.chrome && chrome.app && chrome.app.isInstalled);
	if (runningStandalone || installedAsChromeApp) {
		return;
	}
	
	// Update the CTA if there has been a deferred install since the dialog was created.
	if (this.deferredInstall) {
		this._changeToPWAInstallPrompt();
	}
	
	BottomSheetDialog.prototype.open.call(this);
};

/**
 * @private
 * Replace the prompt with a PWA installation trigger.
 */
InstallDialog.prototype._changeToPWAInstallPrompt = function () {
	this._cta.innerHTML = 'install PaintZ as an app';
	this._submitLink.innerHTML = 'Install';
	this._submitLink.href = '#';
	this._submitLink.addEventListener('click', (function (e) {
		e.preventDefault();
		this.deferredInstall.prompt();
	}).bind(this));
	/*var iconURL = 'images/icons/install_' + (Utils.isMobileLike ? 'mobile' : 'desktop') + '.svg#icon';
	this._icon.setAttribute('href',       iconURL);
	this._icon.setAttribute('xlink:href', iconURL);*/
};
/**
 * @class
 * Create a new KeyboardDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function KeyboardDialog(trigger) {
	Dialog.call(this, 'keyboard', trigger);
	this._element.id = 'keyboardDialog';
}
// Extend Dialog.
KeyboardDialog.prototype = Object.create(Dialog.prototype);
KeyboardDialog.prototype.constructor = KeyboardDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
KeyboardDialog.prototype.WIDTH = '560px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
KeyboardDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Hide shortcuts that only work when running as a standalone app
	// if running in a browser window or old enough browser that the
	// check is not supported.
	// (TODO: In v4.0, when support for browsers that do not support
	// the display-mode media query is phased out, move this all to CSS.)
	if (!window.matchMedia || window.matchMedia('(display-mode: browser)').matches) {
		Array.from(this._element.querySelectorAll('.standaloneOnly')).forEach(function (elem) {
			elem.style.display = 'none';
		})
	}
};
/**
 * @class
 * Create a new MSAccessKeyDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function MSAccessKeyDialog(trigger) {
	Dialog.call(this, 'ms_access_key', trigger);
	
	this._keySequencePosition = undefined;
	this._keySequenceDisplay;
}
// Extend Dialog.
MSAccessKeyDialog.prototype = Object.create(Dialog.prototype);
MSAccessKeyDialog.prototype.constructor = MSAccessKeyDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
MSAccessKeyDialog.prototype.WIDTH = '296px';
/** @constant {Object} Maps of key sequences to actions */
MSAccessKeyDialog.prototype.KEY_SEQUENCES = {
	'F': { // File menu...
		'N': function () { dialogs.clear.open(); }, // New (clear)
		'O': function () { document.getElementById('upload').click(); }, // Open...
		'S': function () { dialogs.save.open(); }, // Save
		'A': function () { dialogs.save.open(); }, // Save As...
		'C': function () {
			alert('\u201cFrom Scanner or Camera...\u201d is not currently supported in PaintZ.'); },
		'V': function () { window.print(); }, // Print Preview
		'U': function () {
			alert('\u201cPage Setup...\u201d is not currently supported in PaintZ.'); },
		'P': function () { window.print(); }, // Print...
		'E': function () {
			dialogs.save._createDownloadURL().then(dialogs.save._boundHandleShare); }, // Send...
		'B': function () {
			alert('\u201cSet As Background (Tiled)\u201d is not currently supported in PaintZ.'); },
		'K': function () {
			alert('\u201cSet As Background (Centered)\u201d is not currently supported in PaintZ.'); },
		'X': function () { window.close(); }, // Exit
		// Win7 File menu...
		'R': { // Print submenu...
			'P': function () { window.print(); }, // Print
			'S': function () {
				alert('\u201cPage setup\u201d is not currently supported in PaintZ.'); },
			'V': function () { window.print(); } // Print preview
		},
		'M': function () {
			alert('\u201cFrom scanner or camera\u201d is not currently supported in PaintZ.'); },
		'D': function () {
			dialogs.save._createDownloadURL().then(dialogs.save._boundHandleShare); }, // Send in email
		'T': function () { dialogs.about.open(); } // About Paint
	},
	'E': { // Edit menu...
		'U': function () { undoStack.undo(); }, // Undo
		'R': function () { undoStack.redo(); }, // Repeat
		'T': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cut(); } }, // Cut
		'C': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.copy(); } }, // Copy
		'P': function () { if (!clipboard.triggerPaste()) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.'); } }, // Paste
		'L': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.clear(); } }, // Clear Selection
		'A': function () {
			// Select All
			if (tools.currentTool !== tools.selection) {
				tools.switchTool('selection');
			}
			tools.currentTool.selectAll(canvas.width, canvas.height);
		},
		'O': function () {
			alert('\u201cCopy To...\u201d is not currently supported in PaintZ.'); },
		'F': function () { document.getElementById('pasteFrom').click(); } // Paste From
	},
	'V': { // View menu...
		'T': function () {
			alert('\u201cShow/Hide Tool Box\u201d is not currently supported in PaintZ.'); },
		'C': function () {
			alert('\u201cShow/Hide Color Box\u201d is not currently supported in PaintZ.'); },
		'S': function () {
			alert('\u201cShow/Hide Status Bar\u201d is not currently supported in PaintZ.'); }, 
		'E': function () { if (tools.currentTool !== tools.text) { tools.switchTool('text'); } }, // Text Toolbar
		'V': function () { toolbar.toolboxes.app.attemptFullScreen(); }, // View Bitmap
		'Z': { // Zoom submenu...
			'N': function () { zoomManager.level = 1; }, // Normal Size
			'L': function () { zoomManager.level = 4; }, // Large Size
			'U': function () { toolbar.toolboxes.zoom.percent.focus(); }, // Custom...
			'G': function () { settings.set('grid', !settings.get('grid')); }, // Show Grid
			'H': function () {
				alert('\u201cShow Thumbnail\u201d is not currently supported in PaintZ.'); }, 
		},
		// Win7 View tab...
		'I': function () { zoomManager.zoomIn(); }, // Zoom in
		'O': function () { zoomManager.zoomOut(); }, // Zoom out
		'M': function () { zoomManager.level = 1; }, // 100%
		'R': function () {
				alert('\u201cShow/Hide Rulers\u201d is not currently supported in PaintZ.'); },
		'G': function () { settings.set('grid', !settings.get('grid')); }, // Gridlines
		'F': function () { toolbar.toolboxes.app.attemptFullScreen(); } // Full screen
	},
	'I': { // Image menu...
		'F': function () {
			// Flip/Rotate...
			if (!(tools.currentTool instanceof SelectionTool)) {
				tools.switchTool('selection');
			}
		},
		'S': function () {
				alert('\u201cStretch/Skew\u201d is not currently supported in PaintZ.'); },
		'I': function () {
			// Invert Colors
			if (tools.currentTool instanceof SelectionTool) {
				tools.currentTool.invertColors();
			} else {
				tools.selection.invertColors();
			}
		},
		'A': function () { dialogs.resize.open(); }, // Attributes...
		'C': function () { dialogs.clear._clear(); }, // Clear Image
		'D': function () {
			// Draw Opaque
			if (tools.currentTool instanceof SelectionTool) {
				settings.set('transparentSelection', !settings.get('transparentSelection'));
				toolbar.toolboxes.selectToolOptions.transparentSelectionOff.checked = !settings.get('transparentSelection');
				toolbar.toolboxes.selectToolOptions.transparentSelectionOn.checked = settings.get('transparentSelection');
			} else if (tools.currentTool === tools.text) {
				settings.set('textFill', !settings.get('textFill'));
				toolbar.toolboxes.textToolOptions.textFillOff.checked = !settings.get('textFill');
				toolbar.toolboxes.textToolOptions.textFillOn.checked = settings.get('textFill');
			}
		}
	},
	'C': { // Colors menu...
		'E': function () { dialogs.colorPicker.open(); } // Edit colors...
	},
	'H': { // Help menu...
		'H': function () { dialogs.help.open(); }, // Help Topics
		'A': function () { dialogs.about.open(); }, // About Paint,
		// Win7 Home tab...
		'V': { // Paste menu...
			'P': function () { if (!clipboard.triggerPaste()) {
				alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.'); } }, // Paste
			'F': function () { document.getElementById('pasteFrom').click(); }, // Paste from
		},
		'X': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cut(); } }, // Cut
		'C': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.copy(); } }, // Copy
		'S': { // First part of SE, SH, or SZ
			'E': { // Select menu...
				'R': function () { tools.switchTool('selection'); }, // Rectangular selection
				'F': function () { tools.switchTool('freeformSelection'); }, // Free-form selection
				'A': function () {
					// Select all
					if (tools.currentTool !== tools.selection) {
						tools.switchTool('selection');
					}
					tools.currentTool.selectAll(canvas.width, canvas.height);
				},
				'I': function () {
					alert('\u201cInvert selection\u201d is not currently supported in PaintZ.'); },
				'D': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.clear(); } }, // Delete
				'T': function () {
					// Transparent selection
					if (tools.currentTool instanceof SelectionTool) {
						settings.set('transparentSelection', !settings.get('transparentSelection'));
						toolbar.toolboxes.selectToolOptions.transparentSelectionOff.checked = !settings.get('transparentSelection');
						toolbar.toolboxes.selectToolOptions.transparentSelectionOn.checked = settings.get('transparentSelection');
					} else if (tools.currentTool === tools.text) {
						settings.set('textFill', !settings.get('textFill'));
						toolbar.toolboxes.textToolOptions.textFillOff.checked = !settings.get('textFill');
						toolbar.toolboxes.textToolOptions.textFillOn.checked = settings.get('textFill');
					}
				}
			},
			'H': function () { tools.switchTool('line'); }, // Shapes
			'Z': function () {
				// Size
				if (toolbar.currentToolOptionsToolbox === toolbar.toolboxes.drawToolOptions) {
					toolbar.toolboxes.drawToolOptions.lineWidthSelect.focus();
				}
			}
		},
		'R': { // First part of RP, RE, or RO
			'P': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cropToSelection(); } }, // Crop
			'E': function () { dialogs.resize.open(); }, // Resize
			'O': { // Rotate menu...
				'R': function () {
					// Rotate right 90°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(true);
					} else {
						tools.selection.rotate(true);
					}
				},
				'L': function () {
					// Rotate left 90°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(false);
					} else {
						tools.selection.rotate(false);
					}
				},
				'T': function () {
					// Rotate 180°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(true);
						tools.currentTool.rotate(true);
					} else {
						tools.selection.rotate(true);
						tools.selection.rotate(true);
					}
				},
				'V': function () {
					// Flip vertical
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.flip(true);
					} else {
						tools.selection.flip(true);
					}
				},
				'H': function () {
					// Flip horizontal
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.flip(false);
					} else {
						tools.selection.flip(false);
					}
				}
			}
		},
		'P': function () { tools.switchTool('pencil'); }, // Pencil
		'K': function () { tools.switchTool('floodFill'); }, // Fill with color
		'T': function () { tools.switchTool('text'); }, // 
		'E': { // First part of ER or EC
			'R': function () { tools.switchTool('eraser'); }, // Eraser
			'C': function () { dialogs.colorPicker.open(); } // Edit colors
		},
		'D': function () { tools.switchTool('eyedropper'); }, // Color picker
		'M': function () {
			alert('\u201cMagnifier\u201d is not currently supported in PaintZ.'); },
		'B': function () { tools.switchTool('doodle'); }, // Brushes
		'O': function () {
			// Outline
			if (tools.currentTool instanceof ShapeTool) {
				var outlineOption = ({
					'outlineOnly': 'fillOnly',
					'fillOnly': 'outlineFill',
					'outlineFill': 'fillOnly'
				})[settings.get('outlineOption')];
				toolbar.toolboxes.drawToolOptions.outlineOptions.outlineOption.value = outlineOption;
				settings.set('outlineOption', outlineOption);
			}
		},
		'I': function () {
			// Fill
			if (tools.currentTool instanceof ShapeTool) {
				var outlineOption = ({
					'outlineOnly': 'outlineFill',
					'fillOnly': 'outlineOnly',
					'outlineFill': 'outlineOnly'
				})[settings.get('outlineOption')];
				toolbar.toolboxes.drawToolOptions.outlineOptions.outlineOption.value = outlineOption;
				settings.set('outlineOption', outlineOption);
			}
		}
	},
	'T': { // Win7 Text tab...
		'P': function () { document.execCommand('paste'); }, // Paste (text)
		'X': function () { document.execCommand('cut'); }, // Cut (text)
		'C': function () { document.execCommand('copy'); }, // Copy (text)
		'F': { // First part of FF, FS, FB, FI, FU, or FX
			'F': function () { if (tools.currentTool === tools.text) {
				toolbar.toolboxes.textToolOptions.fontFamilySelect.focus(); } }, // Font family
			'S': function () { if (tools.currentTool === tools.text) {
				toolbar.toolboxes.textToolOptions.fontSizeSelect.focus(); } }, // Font size
			'B': function () {
				// Bold
				if (tools.currentTool === tools.text) {
					settings.set('bold', !settings.get('bold'));
					toolbar.toolboxes.textToolOptions.boldToggle.checked = settings.get('bold');
				}
			},
			'I': function () {
				// Italic
				if (tools.currentTool === tools.text) {
					settings.set('italic', !settings.get('italic'));
					toolbar.toolboxes.textToolOptions.italicToggle.checked = settings.get('italic');
				}
			},
			'U': function () {
				// Underline
				if (tools.currentTool === tools.text) {
					settings.set('underline', !settings.get('underline'));
					toolbar.toolboxes.textToolOptions.underlineToggle.checked = settings.get('underline');
				}
			},
			'X': function () {
				// Strikethrough
				if (tools.currentTool === tools.text) {
					settings.set('strike', !settings.get('strike'));
					toolbar.toolboxes.textToolOptions.strikeToggle.checked = settings.get('strike');
				}
			}
		},
		'O': function () {
			// Opaque background
			if (tools.currentTool === tools.text) {
				settings.set('textFill', true);
				toolbar.toolboxes.textToolOptions.textFillOn.checked = true;
				toolbar.toolboxes.textToolOptions.textFillOff.checked = false;
			}
		},
		'T': function () {
			// Transparent background
			if (tools.currentTool === tools.text) {
				settings.set('textFill', false);
				toolbar.toolboxes.textToolOptions.textFillOn.checked = false;
				toolbar.toolboxes.textToolOptions.textFillOff.checked = true;
			}
		},
		'E': { // First part of EC
			'C': function () { dialogs.colorPicker.open(); } // Edit colors
		}
	}
};

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
MSAccessKeyDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.tabIndex = -1;
	this._element.style.outline = 'none';
	
	this._keySequenceDisplay = this._element.querySelector('#keySequence');
	
	// Add event listener to handle additional keys in the sequence.
	this._element.addEventListener('keydown', this._handleKeyDown.bind(this), false);
};

/**
 * @override
 * Open the dialog and note the first key in the sequence.
 * @param {String} firstKey - The key pressed (with Alt) to open the dialog
 * @returns {Boolean} If the dialog was opened validly
 */
MSAccessKeyDialog.prototype.open = function (firstKey) {
	if (!window.matchMedia || !window.matchMedia('(display-mode: standalone)').matches) {
		// Only allow access key overrides in standalone windows.
		return false;
	}
	
	Dialog.prototype.open.call(this);
	
	this._keySequencePosition = this.KEY_SEQUENCES[firstKey];
	if (!this._keySequencePosition) {
		// Prevent the dialog being opened with an invalid start of sequence.
		this.close();
		return false;
	}
	
	this._keySequenceDisplay.innerHTML = '<kbd>Alt</kbd>+<kbd>' + firstKey + '</kbd>';
	return true;
};

/**
 * @override
 * Focus the dialog itself instead of searching for a child to focus.
 */
MSAccessKeyDialog.prototype.focus = function () {
	this._element.focus();
};

/**
 * @override
 * Close the dialog and clear any key sequence position.
 * @param {Event} [e] - The event that triggered the close, if any.
 * @returns {Promise} Resolves when the dialog has closed
 */
MSAccessKeyDialog.prototype.close = function (e) {
	this._keySequencePosition = undefined;
	
	return Dialog.prototype.close.call(this, e);
};

/**
 * @private
 * Handle keyboard shortcuts with the dialog active.
 * @param {KeyboardEvent} e
 */
MSAccessKeyDialog.prototype._handleKeyDown = function (e) {
	var instantAbort =
			(!this._keySequencePosition ||
			e.ctrlKey || e.metaKey ||
			e.keyCode < 65 || e.keyCode > 90);
	if (instantAbort) {
		// Abort if other modifier keys are added or the pressed key is not a letter.
		if (e.keyCode !== 27) {
			// The default dialog behavior handles closing on Esc.
			this.close();
		}
		return;
	}
	
	var keyLetter = String.fromCharCode(e.keyCode),
		nextInSequence = this._keySequencePosition[keyLetter];
	
	if (!nextInSequence) {
		this.close();
		return;
	}
	
	e.preventDefault();
	
	this._keySequenceDisplay.innerHTML += ', <kbd>' + keyLetter + '</kbd>';
	
	if (typeof(nextInSequence) === 'object') {
		// If it led to another object, that is now the position in the sequence.
		this._keySequencePosition = nextInSequence;
	} else if (typeof(nextInSequence) === 'function') {
		// If it led to the function, that is the end of the sequence.
		this.close()
			.then(nextInSequence);
	}
};
/**
 * @class
 * Create a new MSAccessKeyHelpDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function MSAccessKeyHelpDialog(trigger) {
	Dialog.call(this, 'ms_access_key_help', trigger);
}
// Extend Dialog.
MSAccessKeyHelpDialog.prototype = Object.create(Dialog.prototype);
MSAccessKeyHelpDialog.prototype.constructor = MSAccessKeyHelpDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
MSAccessKeyHelpDialog.prototype.WIDTH = '544px';
/**
 * @class
 * Create a new PatreonDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function PatreonDialog(trigger) {
	BottomSheetDialog.call(this, 'patreon', trigger);
}
// Extend Dialog.
PatreonDialog.prototype = Object.create(BottomSheetDialog.prototype);
PatreonDialog.prototype.constructor = PatreonDialog;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
PatreonDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#patreonLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};
/**
 * @class
 * Create a new RateDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function RateDialog(trigger) {
	BottomSheetDialog.call(this, 'rate', trigger);
}
// Extend Dialog.
RateDialog.prototype = Object.create(BottomSheetDialog.prototype);
RateDialog.prototype.constructor = RateDialog;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
RateDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#cwsLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};

/**
 * @override
 * Open the dialog if the user is in Chrome.
 */
RateDialog.prototype.open = function () {
	if (!navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/mobile/i)) {
		return;
	}
	
	BottomSheetDialog.prototype.open.call(this);
};

/**
 * @class
 * Create a new ResizeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ResizeDialog(trigger) {
	Dialog.call(this, 'resize', trigger);
}
// Extend Dialog.
ResizeDialog.prototype = Object.create(Dialog.prototype);
ResizeDialog.prototype.constructor = ResizeDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ResizeDialog.prototype.WIDTH = '320px';
/** @constant {Number} The minimum canvas width/height */
ResizeDialog.prototype.MIN_SIZE = 1,
/** @constant {Number} The maximum canvas width/height */
ResizeDialog.prototype.MAX_SIZE = 99999;
/** @constant {Number} The minimum resize percentage */
ResizeDialog.prototype.MIN_PERCENTAGE = 1;
/** @constant {Number} The maximum resize percentage */
ResizeDialog.prototype.MAX_PERCENTAGE = 500;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ResizeDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.width.addEventListener('input', this._handleDimensionChange.bind(this), false);
	this._element.height.addEventListener('input', this._handleDimensionChange.bind(this), false);
	this._element.units.addEventListener('change', this._handleUnitChange.bind(this), false);
	this._element.maintainAspectRatio.addEventListener(
		'change', this._handleMaintainAspectRatioChange.bind(this), false);
	this._element.addEventListener('submit', this._saveNewSize.bind(this), false);
};

/**
 * @override
 * Open the dialog.
 */
ResizeDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._handleUnitChange();
};

/**
 * @private
 * Update the setting options to show the current saved size.
 */
ResizeDialog.prototype._showCurrentSize = function () {
	this._element.width.value = settings.get('width');
	this._element.height.value = settings.get('height');
};

/**
 * @private
 * Update the input fields when the units are changed.
 */
ResizeDialog.prototype._handleUnitChange = function () {
	switch (this._element.units.value) {
		case 'percentage':
			this._element.width.min =
				this._element.height.min = this.MIN_PERCENTAGE;
			this._element.width.max =
				this._element.height.max = this.MAX_PERCENTAGE;
			this._element.width.value = 100;
			this._element.height.value = 100;
			break;
		case 'pixels':
			this._element.width.min =
				this._element.height.min = this.MIN_SIZE;
			this._element.width.max =
				this._element.height.max = this.MAX_SIZE;
			this._showCurrentSize();
			break;
	}
};

/**
 * @private
 * Handle the width field being changed.
 * @param {Event} e
 */
ResizeDialog.prototype._handleDimensionChange = function (e) {
	if (!this._element.maintainAspectRatio.checked) {
		return;
	}
	
	var changedDimension = (e.target === this._element.width ? 'width' : 'height'),
		otherDimension = (changedDimension === 'width' ? 'height' : 'width'),
		otherInput = this._element[otherDimension];
	
	var intValue = parseInt(e.target.value);
	if (isNaN(intValue)) {
		return;
	}
	intValue = Math.max(this.MIN_SIZE, intValue);
	e.target.value = intValue;
	switch (this._element.units.value) {
		case 'percentage':
			otherInput.value = intValue;
			break;
		case 'pixels':
			otherInput.value =
				Math.round(intValue / settings.get(changedDimension) * settings.get(otherDimension));
			break;
	}
};

/**
 * @private
 * Handle the option to maintain aspect ratio being toggled.
 */
ResizeDialog.prototype._handleMaintainAspectRatioChange = function () {
	if (!this._element.maintainAspectRatio.checked) {
		return;
	}
	
	var widthInt = parseInt(this._element.width.value),
		heightInt = parseInt(this._element.height.value),
		currentWidth = (this._element.units.value === 'percentage' ? 100 : settings.get('width')),
		currentHeight = (this._element.units.value === 'percentage' ? 100 : settings.get('height'));
	
	if (widthInt !== currentWidth) {
		this._handleDimensionChange({ target: this._element.width });
	} else if (heightInt !== currentHeight) {
		this._handleDimensionChange({ target: this._element.height });
	}
};

/**
 * @private
 * Update the canvases and save the selected size.
 */
ResizeDialog.prototype._saveNewSize = function () {
	// Fetch the values from the form.
	var newWidth = parseInt(this._element.width.value),
		newHeight = parseInt(this._element.height.value),
		units = this._element.units.value,
		mode = this._element.resizeMode.value;
	
	switch (units) {
		case 'percentage':
			newWidth = settings.get('width') * 0.01 * Utils.constrainValue(newWidth, this.MIN_PERCENTAGE, this.MAX_PERCENTAGE);
			newHeight = settings.get('height') * 0.01 * Utils.constrainValue(newHeight, this.MIN_PERCENTAGE, this.MAX_PERCENTAGE);
			break;
		case 'pixels':
			newWidth = Utils.constrainValue(newWidth, this.MIN_SIZE, this.MAX_SIZE);
			newHeight = Utils.constrainValue(newHeight, this.MIN_SIZE, this.MAX_SIZE);
			break;
	}
	
	newWidth = Math.max(1, Math.round(newWidth));
	newHeight = Math.max(1, Math.round(newHeight));
	
	// Validate the user's input.
	if (!newWidth || !newHeight || isNaN(newWidth) || isNaN(newHeight)) {
		alert('Please enter valid dimensions.');
		return;
	}
	
	// Resize the canvas.
	resizeCanvas(newWidth, newHeight, mode);

	// Add the change to the undo stack.
	undoStack.addState();
};
/**
 * @class
 * Create a new SaveDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SaveDialog(trigger) {
	Dialog.call(this, 'save', trigger);
	this._element.id = 'saveDialog';
	this._progressSpinner;
	this._downloadLink;
	this._shareButton;
	this._blob;
	this._boundHandleShare = this._handleShare.bind(this);
}
// Extend Dialog.
SaveDialog.prototype = Object.create(Dialog.prototype);
SaveDialog.prototype.constructor = SaveDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SaveDialog.prototype.WIDTH = '384px';
/** @constant {String} The message for browsers that do not support sharing files */
SaveDialog.prototype.SHARE_UNSUPPORTED_MESSAGE = 'Your browser or system does not support sharing from PaintZ.  ' + Utils.SUGGESTED_BROWSER_MESSAGE;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
SaveDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.fileName.onchange =
		this._element.fileType.onchange =
		this._element.fileType.oninput = this._updateFileExtension.bind(this);
	
	this._progressSpinner = this._element.querySelector('progress');
	/*
	this._shareButton = this._element.querySelector('#shareButton');
	this._shareButton.onclick = this._boundHandleShare;
	this._shareButton.disabled = true;
	this._shareButton.title = this.SHARE_UNSUPPORTED_MESSAGE;
	*/
	this._downloadLink = this._element.querySelector('#downloadLink');
	this._downloadLink.onclick = this._handleSave.bind(this);
	this._element.onsubmit = (function () {
		this._downloadLink.click();
	}).bind(this);
	
	this._element.classList.add('loading');
};

/**
 * @override
 * Open the dialog.
 */
SaveDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	
	// Export the canvas content to an image to be saved.
	this._createDownloadURL();
};

/**
 * @private
 * Create a new blob URL, and set it as the download URL when done.
 * @returns {Promise} Resolves when the blob has been created and the download URL set
 */
SaveDialog.prototype._createDownloadURL = function () {
	var that = this;
	return new Promise(function (resolve, reject) {
		that._element.classList.add('loading');
		
		var blob = canvas.toBlob(function (blob) {
			that._setDownloadURL(blob);
			resolve();
		}, that._downloadLink.type || 'image/png');
		if (blob instanceof Blob) {
			// Fallback for browsers in which toBlob is synchronous and returns a Blob.
			that._setDownloadURL(blob);
			resolve();
		}
	});
};

/**
 * @private
 * Set the download URL using the blob from the canvas.
 * @param {Blob} blob - The image blob from the canvas
 */
SaveDialog.prototype._setDownloadURL = function (blob) {
	// Remove any old blob URL.
	//URL.revokeObjectURL(this._downloadLink.href);
	
	// Save the new blob in case it needs to be shared or saved with `msSaveBlob`.
	this._blob = blob;
	/*
	// Create a new URL to save.
	var url = URL.createObjectURL(blob);
	this._downloadLink.href = url;
	
	// If the web share API is supported, create a file to test whether it can be shared.
	if (navigator.canShare) {
		var file = new File([blob], this._element.fileName.value, { type: blob.type });
		if (!navigator.canShare({ files: [file] })) {
			this._shareButton.disabled = true;
			this._shareButton.title = this.SHARE_UNSUPPORTED_MESSAGE;
		} else {
			this._shareButton.disabled = false;
			this._shareButton.title = '';
		}
	}*/
	
	this._element.classList.remove('loading');
};

/**
 * @private
 * Update the file extension in the file name to match the selection in the menu.
 */
SaveDialog.prototype._updateFileExtension = function () {
	// Update file name.
	var newName = this._matchExtensionToMIMEType(this._element.fileName.value, this._element.fileType.value);
	this._element.fileName.value = newName;
	this._downloadLink.download = newName;
	if (this._element.fileType.value !== this._downloadLink.type) {
		this._downloadLink.type = this._element.fileType.value;
		this._createDownloadURL();
	}
};

/**
 * @private
 * Fix the extension on a file name to match a MIME type.
 * @param {String} name - The file name to fix
 * @param {String} type - The MIME type to match (image/jpeg or image/png)
 * @returns {String} - The modified file name
 */
SaveDialog.prototype._matchExtensionToMIMEType = function (name, type) {
	name = name.trim();
	
	if (type === 'image/png' && !PNG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.png');
		} else {
			return name + '.png';
		}
	} else if (type === 'image/jpeg' && !JPEG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.jpg');
		} else {
			return name + '.jpg';
		}
	}
	return name;
};

/**
 * @private
 * Handle the save button being clicked.
 * @param {MouseEvent} e
 */
SaveDialog.prototype._handleSave = function (e) {
	/*if (navigator.msSaveBlob) {
		e.preventDefault();
		navigator.msSaveBlob(this._blob,
			this._downloadLink.download || this._downloadLink.getAttribute('download'));
	}*/
	let href = window.location.href
	let url = new URL(href);
	let filePath = url.searchParams.get("path");
	
	let isFileWritable = url.searchParams.get("isFileWritable") == 'true';
	let folder = filePath.substring(0, filePath.lastIndexOf('/') + 1);
	let fullPathWithFilename = folder + this._downloadLink.download;
	if (!isFileWritable) {
		document.getElementById("status").innerText = " File access is read only";	
	} else {
		document.getElementById("status").innerText = " Saving file...";
		var headers = {};
		this._blob.arrayBuffer().then(data => {
  			fetch(fullPathWithFilename, { method: 'PUT', headers: headers, body: data })
    		.then(function(response) {
          		if (response.status != 200) {
					document.getElementById("status").innerText = " Unable to save file";
      				console.log('unable to save image:' + response.status);
      			} else {
					document.getElementById("status").innerText = " File saved";
					setTimeout(() => document.getElementById("status").innerText = "", 1000);
      			}
    		}); 
    	});
    }
	document.title = this._downloadLink.download + PAGE_TITLE_SUFFIX;
	// Web app cannot confirm the user went through with the download, but assume xe did.
	undoStack.changedSinceSave = false;
	// Increment save count.
	var saveCount = settings.get('saveCount');
	settings.set('saveCount', Math.min(saveCount + 1, settings.MAX_SAVE_COUNT));
	checkSaveCountMilestone();
	// Close the dialog.
	this.close();
};

/**
 * @private
 * Handle the share button being clicked.
 * @param {MouseEvent} e
 */
SaveDialog.prototype._handleShare = function (e) {
	if (!navigator.canShare) {
		alert(this.SHARE_UNSUPPORTED_MESSAGE);
		return;
	}
	
	var file = new File([this._blob], this._element.fileName.value, { type: this._blob.type });
	
	if (!navigator.canShare({ files: [file] })) {
		alert(this.SHARE_UNSUPPORTED_MESSAGE);
		return;
	}
	
	navigator.share({
		files: [file],
		title: this._element.fileName.value
	}).then((function () {
		this.close();
	}).bind(this));
};

/**
 * @class
 * Create a new SettingsDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SettingsDialog(trigger) {
	Dialog.call(this, 'settings', trigger);
	this._element.id = 'settingsDialog';
	this._element.addEventListener('submit', this._saveNewSettings.bind(this));
}
// Extend Dialog.
SettingsDialog.prototype = Object.create(Dialog.prototype);
SettingsDialog.prototype.constructor = SettingsDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SettingsDialog.prototype.WIDTH = '384px';

/**
 * @override
 * Open the dialog.
 */
SettingsDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._showCurrentSettings();
};

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
SettingsDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Only show the system theme override option if the browser supports it.
	if (!window.matchMedia('(prefers-color-scheme)').matches) {
		// input → label → li
		this._element.systemThemeOverride.parentElement.parentElement.style.display = 'none';
	}
	
	this._element.querySelector('#resetButton').addEventListener('click', this._resetSettings.bind(this), false);
};

/**
 * @private
 * Update the setting options to show the current saved settings.
 */
SettingsDialog.prototype._showCurrentSettings = function () {
	this._element.theme.value = settings.get('theme');
	this._element.systemThemeOverride.checked = settings.get('systemThemeOverride');
	this._element.colorPalette.value = settings.get('colorPalette');
	this._element.grid.checked = settings.get('grid');
	this._element.ghostDraw.checked = settings.get('ghostDraw');
	this._element.antiAlias.checked = settings.get('antiAlias');
	this._element.maxUndoStackDepth.value = settings.get('maxUndoStackDepth');
};

/**
 * @private
 * Save the selected settings.
 */
SettingsDialog.prototype._saveNewSettings = function () {
	settings.set('theme', this._element.theme.value);
	settings.set('systemThemeOverride', this._element.systemThemeOverride.checked);
	
	settings.set('colorPalette', this._element.colorPalette.value);
	toolbar.toolboxes.colorPicker.setColorPalette(this._element.colorPalette.value);
	
	settings.set('grid', this._element.grid.checked);
	
	settings.set('ghostDraw', this._element.ghostDraw.checked);
	
	settings.set('antiAlias', this._element.antiAlias.checked);
	
	if (!isNaN(parseInt(this._element.maxUndoStackDepth.value))) {
		settings.set('maxUndoStackDepth', this._element.maxUndoStackDepth.value);
	}
};

/**
 * @private
 * Reset all settings.
 */
SettingsDialog.prototype._resetSettings = function () {
	if (!confirm('Reset all settings to defaults?  This cannot be undone.')) {
		return;
	}
	this._element.theme.value = settings.DEFAULTS.theme;
	this._element.systemThemeOverride.checked = settings.DEFAULTS.theme;
	this._element.colorPalette.value = settings.DEFAULTS.colorPalette;
	this._element.grid.checked = settings.DEFAULTS.grid;
	this._element.ghostDraw.checked = settings.DEFAULTS.ghostDraw;
	this._element.antiAlias.checked = settings.DEFAULTS.antiAlias;
	this._element.maxUndoStackDepth.value = settings.DEFAULTS.maxUndoStackDepth;
	this._saveNewSettings();
	this.close();
};
/**
 * @class
 * Create a new WelcomeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function WelcomeDialog(trigger) {
	Dialog.call(this, 'welcome', trigger);
}
// Extend Dialog.
WelcomeDialog.prototype = Object.create(Dialog.prototype);
WelcomeDialog.prototype.constructor = WelcomeDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
WelcomeDialog.prototype.WIDTH = '512px';
/**
 * @class
 * Create a new Toolbox instance.  A toolbox is a section on the toolbar with buttons or other controls.
 * @param {String} contentFileName - The name of the HTML partial file with the toolbox's contents
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function Toolbox(contentFileName, toolbar) {
	/** @private {HTMLDivElement} The container for toolbox's content */
	this._element = document.createElement('div');
	this._element.className = this.CSS_CLASS;
	
	// Add the toolbox to the toolbar.
	if (toolbar) {
		toolbar.appendChild(this._element);
	}
	
	// Fetch the toolbox content, then set up the toolbox.
	this.loadPromise =
		Utils.fetch(this.PARTIALS_DIR + contentFileName + '.html')
			.then(this._setUp.bind(this));
}

// Define constants.
/** @constant {String} The path and prefix for toolbox partials */
Toolbox.prototype.PARTIALS_DIR = 'partials/toolbar/';
/** @constant {String} The CSS class for the toolbox container element */
Toolbox.prototype.CSS_CLASS = 'toolbox';

/**
 * @private
 * Populate the toolbox with its contents and add it to the toolbar.
 * @param {String} contents - The HTML contents of the dialog
 */
Toolbox.prototype._setUp = function (contents) {
	this._element.innerHTML = contents;
	
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		this._element.innerHTML = this._element.innerHTML.replace(/Ctrl\+/g, '&#x2318;').replace(/Alt\+/g, '&#x2325;').replace(/Shift\+/g, '&#x21e7;');
	}
};

/**
 * Hide the toolbox from the toolbar.
 */
Toolbox.prototype.hide = function () {
	this._element.style.display = 'none';
};

/**
 * Un-hide the toolbox.
 */
Toolbox.prototype.show = function () {
	this._element.style.removeProperty('display');
};

/**
 * @class
 * Create a new AppToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function AppToolbox(toolbar) {
	Toolbox.call(this, 'app', toolbar);
	
	// Create relevant dialogs.
	dialogs.settings = new SettingsDialog();
	dialogs.help = new HelpDialog();
	dialogs.about = new AboutDialog();
}
// Extend Toolbox.
AppToolbox.prototype = Object.create(Toolbox.prototype);
AppToolbox.prototype.constructor = AppToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
AppToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Full screen button.
	var fullScreenBtn = this._element.querySelector('#fullScreenBtn');
	fullScreenBtn.addEventListener('click', this.attemptFullScreen, false);
	
	// Settings button and dialog.
	var settingsBtn = this._element.querySelector('#settingsBtn');
	dialogs.settings.trigger = settingsBtn;
	settingsBtn.addEventListener('click', dialogs.settings.open.bind(dialogs.settings), false);
	
	// Help button and dialog.
	var helpBtn = this._element.querySelector('#helpBtn');
	dialogs.help.trigger = helpBtn;
	helpBtn.addEventListener('click', dialogs.help.open.bind(dialogs.help), false);

	// About button and dialog.
	var aboutBtn = this._element.querySelector('#aboutBtn');
	dialogs.about.trigger = aboutBtn;
	aboutBtn.addEventListener('click', dialogs.about.open.bind(dialogs.about), false);
};

/**
 * Attempt to full-screen the canvas with various browsers' commands.
 */
AppToolbox.prototype.attemptFullScreen = function () {
	if (canvas.requestFullscreen) {
		canvas.requestFullscreen();
	} else if (canvas.webkitRequestFullscreen) {
		canvas.webkitRequestFullscreen();
	} else if (canvas.mozRequestFullScreen) {
		canvas.mozRequestFullScreen();
	} else if (canvas.msRequestFullscreen) {
		canvas.msRequestFullscreen();
	} else {
		alert('Your browser or system does not support full screen mode.');
	}
};

/**
 * @class
 * Create a new ColorPickerToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function ColorPickerToolbox(toolbar) {
	Toolbox.call(this, 'color_picker', toolbar);
	this._element.id = 'colorPicker';
	
	/** {HTMLButtonElement} The color indicator that opens the color picker dialog when clicked. */
	this.colorIndicator;
	
	// Create the color indicator and add it before the toolbox itself.
	this._createColorIndicator();
	document.getElementById('toolbar').insertBefore(this.colorIndicator, this._element);
	
	// Create color picker dialog.
	dialogs.colorPicker = new ColorPickerDialog();
}
// Extend Toolbox.
ColorPickerToolbox.prototype = Object.create(Toolbox.prototype);
ColorPickerToolbox.prototype.constructor = ColorPickerToolbox;

// Define constants.
/** @constant {Object<String,Array<String>>} The colors for each palette */
ColorPickerToolbox.prototype.COLOR_PALETTES = {
	material: [
		'#000000', // Black
		'#795548', // Brown
		'#f44336', // Red
		'#ff9800', // Orange
		'#ffeb3b', // Yellow
		'#76ff03', // Light green
		
		'#ffffff', // White
		'#9e9e9e', // Gray
		'#4caf50', // Dark green
		'#80d8ff', // Light blue
		'#2962ff', // Dark blue
		'#9c27b0'  // Purple
	],
	classic: [
		'#000000', // Black
		'#783b00', // Brown
		'#ff0000', // Red
		'#ff00ff', // Pink
		'#ffff00', // Yellow
		'#00ff00', // Light green
		
		'#ffffff', // White
		'#787878', // Gray
		'#008100', // Dark green
		'#00ffff', // Light blue
		'#0000ff', // Dark blue
		'#810081'  // Purple
	],
	win7: [
		'#000000', // Black
		'#b97a57', // Brown
		'#ed1c24', // Red
		'#ff7f27', // Orange
		'#fff200', // Yellow
		'#b5e61d', // Light green
		
		'#ffffff', // White
		'#7f7f7f', // Gray
		'#21b14c', // Dark green
		'#00a1e8', // Light blue
		'#3f48cc', // Dark blue
		'#a349a4'  // Purple
	]
};

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ColorPickerToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up the color picker dialog.
	dialogs.colorPicker.trigger = this.colorIndicator;
	this.colorIndicator.addEventListener('click', dialogs.colorPicker.open.bind(dialogs.colorPicker), false);
	this.colorIndicator.addEventListener('contextmenu', (function (e) {
		e.preventDefault();
		this.swapSelectedColors();
	}).bind(this), false);
	
	// Set up the event listener for the Pac-Man easter egg.
	this._element.querySelector('#colorPicker button[data-value=\"#ffeb3b\"]')
		.addEventListener('click', this._handlePacManButtonClick.bind(this), false);
	
	// Set up the toolbar color picker.
	var colorButtons = Array.from(this._element.getElementsByTagName('button')),
		boundColorButtonClickHandler = this._handleColorButtonClick.bind(this);
	colorButtons.forEach(function (colorButton) {
		colorButton.addEventListener('click', boundColorButtonClickHandler, false);
		colorButton.addEventListener('contextmenu', function (e) {
			e.isContextMenuEvent = true;
			boundColorButtonClickHandler(e);
		}, false);
	});
	this.setColorPalette(settings.get('colorPalette'));
};

/**
 * @private
 * Create the color indicator.
 */
ColorPickerToolbox.prototype._createColorIndicator = function () {
	this.colorIndicator = document.createElement('button');
	this.colorIndicator.title = 'Selected colors (click for advanced picker)';
	this.colorIndicator.id = 'colors';
	this.colorIndicator.className = 'z1';
	this.colorIndicator.style.borderColor = settings.get('lineColor');
	this.colorIndicator.style.backgroundColor = settings.get('fillColor');
};

/**
 * Change the displayed colors to a different set.
 * @param {String} paletteName - The identifier for the color set
 */
ColorPickerToolbox.prototype.setColorPalette = function (paletteName) {
	var colorButtons = this._element.getElementsByTagName('button');
	this.COLOR_PALETTES[paletteName].forEach(function (color, i) {
		colorButtons[i].dataset.value = color;
	}, this);
};

/**
 * Swap the line and fill colors.
 */
ColorPickerToolbox.prototype.swapSelectedColors = function () {
	// Swap the stored colors.
	var oldLine = settings.get('lineColor'),
		oldFill = settings.get('fillColor');
	settings.set('lineColor', oldFill);
	settings.set('fillColor', oldLine);
	
	// Some tools' cursors change with colors, so reactivate the current tool.
	tools.currentTool.activate();
};

/**
 * @private
 * Change the color when a button is clicked.
 * @param {MouseEvent} e
 */
ColorPickerToolbox.prototype._handleColorButtonClick = function (e) {
	// Ignore it if any modifier keys were pressed.
	if (Utils.checkModifierKeys(e)) {
		return;
	}
	
	if (e.button === 0 && !e.isContextMenuEvent) {
		e.preventDefault();
		e.stopPropagation();
		
		// If the left mouse button was used, set the line color.
		settings.set('lineColor', e.target.dataset.value);
		
		// Some tools' cursors change with the line color, so reactivate the cursor.
		tools.currentTool.activate();
	} else if (e.button === 2 || e.isContextMenuEvent) {
		e.preventDefault();
		e.stopPropagation();
		
		// If the right mouse button was used, set the fill color.
		settings.set('fillColor', e.target.dataset.value);
		
		// Some tools' cursors change with the fill color, so reactivate the cursor.
		tools.currentTool.activate();
	}
};

/**
 * @private
 * Start or stop the Pac-Man easter egg when the button is Ctrl+Shift+clicked.
 * @param {MouseEvent} e
 */
ColorPickerToolbox.prototype._handlePacManButtonClick = function (e) {
	// Ignore if the button was not Ctrl+Shift+clicked or the meta key was pressed.
	if (!Utils.checkPlatformCtrlOrCmdKey(e) || !e.shiftKey || Utils.checkPlatformMetaOrControlKey(e)) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	if (!window.pacMan) {
		// If Pac-Man has not been started, create and start a new Pac-Man.
		window.pacMan = new PacMan(canvas, e.target.dataset.value);
		window.pacMan.start();
		// Update the button to show the easter egg has been activated.
		e.target.className = 'pacman';
	} else {
		// If Pac-Man is running, delete Pac-Man.
		window.pacMan.stop();
		delete window.pacMan;
		e.target.classList.remove('pacman');
	}
};

/**
 * @class
 * Create a new DimensionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function DimensionsToolbox(toolbar) {
	Toolbox.call(this, 'dimensions', toolbar);
	
	/** @private {HTMLSpanElement} The resolution display */
	this._resolution;
	/** @private {HTMLSpanElement} The pointer coordinates display */
	this._pointerCoords;
	
	this._element.id = 'dimensionsToolbox';
}
// Extend Toolbox.
DimensionsToolbox.prototype = Object.create(Toolbox.prototype);
DimensionsToolbox.prototype.constructor = DimensionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
DimensionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Clear button and dialog.
	var resolutionBtn = this._element.querySelector('#resolutionBtn');
	resolutionBtn.addEventListener('click', dialogs.resize.open.bind(dialogs.resize), false);
	
	this._resolution = resolutionBtn.querySelector('span');
	this.updateResolution();
	
	this._pointerCoords = this._element.querySelector('#pointerCoords');
};

/**
 * Update the displayed resolution to reflect the current settings.
 */
DimensionsToolbox.prototype.updateResolution = function () {
	this._resolution.innerHTML = settings.get('width') + ' &times; ' + settings.get('height') + 'px';
};

/**
 * Update the displayed pointer coordinates, or hide them if the pointer is outside the canvas.
 * @param {Number} pointerX - The pointer's current x-coordinate
 * @param {Number} pointerY - The pointer's current y-coordinate
 */
DimensionsToolbox.prototype.updatePointerCoords = function (pointerX, pointerY) {
	// Confirm the pointer coordinates are in the canvas.
	var xInCanvas = (pointerX === Utils.constrainValue(pointerX, 0, canvas.width - 1)),
		yInCanvas = (pointerY === Utils.constrainValue(pointerY, 0, canvas.height - 1));
	
	if (!this._pointerCoords) {
		// If something tries to update the pointer coordinates before the HTML has been parsed, abort.
		return;
	}
	
	if (!xInCanvas || !yInCanvas) {
		// If the cursor is outside the canvas, clear the coordinates display.
		this._pointerCoords.innerHTML = '';
		return;
	}
	
	this._pointerCoords.innerHTML = pointerX + ', ' + pointerY + 'px';
};

/**
 * @class
 * Create a new DrawToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function DrawToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'draw_tool_options', toolbar);
}
// Extend Toolbox.
DrawToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
DrawToolOptionsToolbox.prototype.constructor = DrawToolOptionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
DrawToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	this.lineWidthSelect = this._element.querySelector('#lineWidth');
	this.lineWidthSelect.value = settings.get('lineWidth');
	this.lineWidthSelect.addEventListener('change', function (e) {
		settings.set('lineWidth', e.target.value);
	}, false);
	
	this.outlineOptions = this._element.querySelector('#outlineOptions');
	this.outlineOptions.outlineOption.value = settings.get('outlineOption');
	this.outlineOptions.addEventListener('change', function (e) {
		settings.set('outlineOption', e.target.value);
	}, false);
};

/**
 * Disable outline options and set to fill only.
 * @param {Boolean} [enableLineWidth] - Whether to enable the line width selector; defaults to false
 */
DrawToolOptionsToolbox.prototype.enableFillOnly = function (enableLineWidth) {
	if (typeof(enableLineWidth) === 'undefined') {
		enableLineWidth = false;
	}
	this.lineWidthSelect.disabled = !enableLineWidth;
	
	this.outlineOptions.outlineOnly.disabled = true;
	this.outlineOptions.fillOnly.disabled = false;
	this.outlineOptions.outlineFill.disabled = true;
	this.outlineOptions.outlineOption.value = 'fillOnly';
};

/**
 * Disable fill options and set to outline only.
 * @param {Boolean} [enableLineWidth] - Whether to enable the line width selector; defaults to true
 */
DrawToolOptionsToolbox.prototype.enableOutlineOnly = function (enableLineWidth) {
	if (typeof(enableLineWidth) === 'undefined') {
		enableLineWidth = true;
	}
	this.lineWidthSelect.disabled = !enableLineWidth;
	
	this.outlineOptions.outlineOnly.disabled = false;
	this.outlineOptions.fillOnly.disabled = true;
	this.outlineOptions.outlineFill.disabled = true;
	this.outlineOptions.outlineOption.value = 'outlineOnly';
};

/**
 * Enable outline and fill options.
 */
DrawToolOptionsToolbox.prototype.enableOutlineAndFill = function () {
	this.lineWidthSelect.disabled = false;
	
	this.outlineOptions.outlineOnly.disabled = false;
	this.outlineOptions.fillOnly.disabled = false;
	this.outlineOptions.outlineFill.disabled = false;
	this.outlineOptions.outlineOption.value = settings.get('outlineOption');
};

/**
 * Create a new FloatingSelectionToolbar instance.
 */
function FloatingSelectionToolbar() {
	Toolbox.call(this, 'floating_selection_toolbar');
	
	this._element.setAttribute('role', 'toolbar');
	
	this._x = 0;
	this._y = 0;
	
	// Hide by default.
	this.hide();
}
// Extend Toolbox.
FloatingSelectionToolbar.prototype = Object.create(Toolbox.prototype);
FloatingSelectionToolbar.prototype.constructor = FloatingSelectionToolbar;

// Define constants.
/** @constant {String} The CSS classes for the container element */
FloatingSelectionToolbar.prototype.CSS_CLASS = 'floatingToolbar card z1';

Object.defineProperties(FloatingSelectionToolbar.prototype, {
	x: {
		get: function () {
			return this._x;
		},
		set: function (value) {
			this._x = value;
			this._updatePosition();
		}
	},
	y: {
		get: function () {
			return this._y;
		},
		set: function (value) {
			this._y = value;
			this._updatePosition();
		}
	}
});

/**
 * @override
 * @private
 * Populate the toolbox with its contents and add it to the toolbar.
 * @param {String} contents - The HTML contents of the dialog
 */
FloatingSelectionToolbar.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up buttons.
	var deselectBtn = this._element.querySelector('#deselectBtn');
	deselectBtn.addEventListener('click', function () {
		tools.currentTool.deactivate();
	}, false);
	
	var deleteBtn = this._element.querySelector('#deleteBtn');
	deleteBtn.addEventListener('click', function () {
		tools.currentTool.clear();
	}, false);
	
	var cutBtn = this._element.querySelector('#cutBtn');
	cutBtn.addEventListener('click', function () {
		tools.currentTool.cut();
	}, false);
	
	var copyBtn = this._element.querySelector('#copyBtn');
	copyBtn.addEventListener('click', function () {
		tools.currentTool.copy();
	}, false);
	
	var duplicateBtn = this._element.querySelector('#duplicateBtn');
	duplicateBtn.addEventListener('click', function () {
		tools.currentTool.duplicate();
	}, false);
	
	var cropBtn = this._element.querySelector('#cropBtn');
	cropBtn.addEventListener('click', function () {
		tools.currentTool.cropToSelection();
	}, false);
	
	if (!navigator.clipboard || !navigator.clipboard.write) {
		cutBtn.disabled =
			copyBtn.disabled = true;
		cutBtn.title =
			copyBtn.title = ClipboardManager.prototype.CLIPBOARD_UNSUPPORTED_MESSAGE;
	}
};

/**
 * @private
 * Update the toolbar's position to match the set x- and y-values.
 */
FloatingSelectionToolbar.prototype._updatePosition = function () {
	this._element.style.WebkitTransform =
		this._element.style.MozTransform =
		this._element.style.MsTransform =
		this._element.style.OTransform =
		this._element.style.transform = 'translate(' + this._x + 'px, ' + this._y + 'px)';
};

/**
 * @override
 * Add and show the toolbar on the page.
 */
FloatingSelectionToolbar.prototype.show = function () {
	canvasPositioner.appendChild(this._element);
};

/**
 * @override
 * Remove the toolbar from the page.
 */
FloatingSelectionToolbar.prototype.hide = function () {
	if (this._element.parentElement) {
		this._element.parentElement.removeChild(this._element);
	}
};

/**
 * @class
 * Create a new ImageToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function ImageToolbox(parentToolbar) {
	Toolbox.call(this, 'image', parentToolbar);
	
	// Expose the undo and redo buttons so the history manager can enable/disable them.
	/** {HTMLButtonElement} The redo button */
	this.redoBtn;
	/** {HTMLButtonElement} The undo button */
	this.undoBtn;
	
	// Create relevant dialogs.
	dialogs.clear = new ClearDialog();
	dialogs.save = new SaveDialog();
	dialogs.resize = new ResizeDialog();
}
// Extend Toolbox.
ImageToolbox.prototype = Object.create(Toolbox.prototype);
ImageToolbox.prototype.constructor = ImageToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ImageToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Clear button and dialog.
	var clearBtn = this._element.querySelector('#clearBtn');
	dialogs.clear.trigger = clearBtn;
	clearBtn.addEventListener('click', dialogs.clear.open.bind(dialogs.clear), false);
	
	// Save as button and dialog.
	var saveBtn = this._element.querySelector('#saveBtn');
	dialogs.save.trigger = saveBtn;
	saveBtn.addEventListener('click', dialogs.save.open.bind(dialogs.save), false);
	
	// Uploader.
	var uploadInput = this._element.querySelector('#upload');
	uploadInput.addEventListener('change', this._handleFileUpload.bind(this), false);
	// Open button.
	var openBtn = this._element.querySelector('#openBtn');
	openBtn.addEventListener('click', function (e) {
		uploadInput.click();
	}, false);
	
	// Print button.
	var printBtn = this._element.querySelector('#printBtn');
	printBtn.addEventListener('click', function (e) {
		window.print();
	}, false);
	
	// Undo and redo buttons.
	this.undoBtn = this._element.querySelector('#undoBtn');
	this.redoBtn = this._element.querySelector('#redoBtn');
	this.undoBtn.addEventListener('click', undoStack.undo.bind(undoStack), false);
	this.redoBtn.addEventListener('click', undoStack.redo.bind(undoStack), false);
	
	// Resize button and dialog.
	var resizeBtn = this._element.querySelector('#resizeBtn');
	dialogs.resize.trigger = resizeBtn;
	resizeBtn.addEventListener('click', dialogs.resize.open.bind(dialogs.resize), false);
	
	
	var pasteBtn = this._element.querySelector('#pasteBtn'),
		pasteFromInput = this._element.querySelector('#pasteFrom');
	pasteFromInput.addEventListener('change', function (e) {
		var file = e.target.files[0];
		Utils.readImage(file).then(function (image) {
			clipboard.paste(image);
			// Clear the input so it registers as changed if the next
			// selected has the same file name as the last.
			e.target.value = null;
		});
	}, false);
	pasteBtn.addEventListener('click', function (e) {
		e.preventDefault();
		if (e.altKey || Utils.checkPlatformMetaOrControlKey(e)) {
			// “Paste from” if alt-clicked or Control-clicked on Mac.
			pasteFromInput.click();
			return;
		}
		if (!clipboard.triggerPaste()) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.');
		}
	}, false);
	pasteBtn.addEventListener('contextmenu', function (e) {
		e.preventDefault();
		pasteFromInput.click();
	}, false);
};

/**
 * @private
 * Load a new image through the file uploader.
 * @param {Event} e
 */
ImageToolbox.prototype._handleFileUpload = function (e) {
	var file = e.target.files[0];
	openImage(file);
	// Clear the input so it registers as changed if the next
	// selected has the same file name as the last.
	e.target.value = null;
};
/**
 * @class
 * Create a new NoToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function NoToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'no_tool_options', toolbar);
}
// Extend Toolbox.
NoToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
NoToolOptionsToolbox.prototype.constructor = NoToolOptionsToolbox;

/**
 * @class
 * Create a new SelectionToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function SelectionToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'select_tool_options', toolbar);
	
	this._element.id = 'selectOptions';
	
	this.transparentSelectionOff;
	this.transparentSelectionOn;
}
// Extend Toolbox.
SelectionToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
SelectionToolOptionsToolbox.prototype.constructor = SelectionToolOptionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
SelectionToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var selectAllBtn = this._element.querySelector('#selectAllBtn');
	selectAllBtn.addEventListener('click', function () {
		// Switch to the rectangular selection tool.
		if (tools.currentTool !== tools.selection) {
			tools.switchTool('selection');
		}
		// Select the entire canvas.
		tools.currentTool.selectAll(canvas.width, canvas.height);
	}, false);
	
	var rotCCWBtn = this._element.querySelector('#rotCCWBtn');
	rotCCWBtn.addEventListener('click', function () {
		tools.currentTool.rotate(false);
	}, false);
	
	var rotCWBtn = this._element.querySelector('#rotCWBtn');
	rotCWBtn.addEventListener('click', function () {
		tools.currentTool.rotate(true);
	}, false);
	
	var flipHorizBtn = this._element.querySelector('#flipHorizBtn');
	flipHorizBtn.addEventListener('click', function () {
		tools.currentTool.flip(false);
	}, false);
	
	var flipVertBtn = this._element.querySelector('#flipVertBtn');
	flipVertBtn.addEventListener('click', function () {
		tools.currentTool.flip(true);
	}, false);
	
	var invertColorsBtn = this._element.querySelector('#invertColorsBtn');
	invertColorsBtn.addEventListener('click', function () {
		tools.currentTool.invertColors();
	}, false);
	
	this.transparentSelectionOn = this._element.querySelector('#transparentSelectionOn');
	this.transparentSelectionOn.checked = settings.get('transparentSelection');
	this.transparentSelectionOn.addEventListener('change', function() {
		if (this.checked) {
			settings.set('transparentSelection', true);
		}
	});
	
	this.transparentSelectionOff = this._element.querySelector('#transparentSelectionOff');
	this.transparentSelectionOff.checked = !settings.get('transparentSelection');
	this.transparentSelectionOff.addEventListener('change', function() {
		if (this.checked) {
			settings.set('transparentSelection', false);
		}
	});
};
/**
 * @class
 * Create a new TextToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function TextToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'text_tool_options', toolbar);
	
	this.boldToggle;
	this.italicToggle;
	this.underlineToggle;
	this.strikeToggle;
	this.textFillOff;
	this.textFillOn;
}
// Extend Toolbox.
TextToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
TextToolOptionsToolbox.prototype.constructor = TextToolOptionsToolbox;

// Define constants.
/** {String} The value of the font family menu option to request access to local fonts (which should not overlap with any font name) */
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_VALUE = 'paintz-request-local-font-access';
/** {String} The text to show on the menu option to request access to local fonts */
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_TEXT = 'Show more fonts...';
/** {String} Message to show when the user denies local font access */
TextToolOptionsToolbox.prototype.FONT_ACCESS_UNAUTHORIZED_MESSAGE = 'PaintZ needs permission to show all your fonts.  You may need to go into your browser\'s site settings to grant that permission.';
/** {Array<Object>} The base font types to always show */
TextToolOptionsToolbox.prototype.BASE_FONTS = [
	{ name: 'Sans-serif', css: 'sans-serif' },
	{ name: 'Serif',      css: 'serif' },
	{ name: 'Monospace',  css: 'monospace' }
];
/** {Array<Object>} The “web safe” fonts to show by default on desktop browsers */
TextToolOptionsToolbox.prototype.DESKTOP_FONTS = [
	{ name: 'Arial',           css: '\'Arial\', sans-serif'                                     },
	{ name: 'Arial Black',     css: '\'Arial Black\', sans-serif'                               },
	{ name: 'Comic Sans MS',   css: '\'Comic Sans MS\', \'Comic Sans\', sans-serif'             },
	{ name: 'Courier New',     css: '\'Courier New\', \'Courier\', monospace'                   },
	{ name: 'Georgia',         css: '\'Georgia\', serif'                                        },
	{ name: 'Impact',          css: '\'Impact\', \'Charcoal\', sans-serif'                      },
	{ name: 'Roboto',          css: '\'Roboto\', \'Helvetica Neue\', \'Helvetica\', sans-serif' },
	{ name: 'Times New Roman', css: '\'Times New Roman\', \'Times\', serif'                     },
	{ name: 'Verdana',         css: '\'Verdana\', \'Geneva\', sans-serif'                       }
];

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
TextToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	this._setUpFontFamilyMenu();
	
	this.fontSizeSelect = this._element.querySelector('#fontSizeSelect');
	this.fontSizeSelect.value = settings.get('fontSize');
	this.fontSizeSelect.addEventListener('change', function (e) {
		settings.set('fontSize', e.target.value);
	}, false);
	
	this.textFillOn = this._element.querySelector('#textFillOn');
	this.textFillOn.checked = settings.get('textFill');
	this.textFillOn.addEventListener('change', function (e) {
		if (this.checked) {
			settings.set('textFill', true);
		}
	}, false);
	
	this.textFillOff = this._element.querySelector('#textFillOff');
	this.textFillOff.checked = !settings.get('textFill');
	this.textFillOff.addEventListener('change', function (e) {
		if (this.checked) {
			settings.set('textFill', false);
		}
	}, false);
	
	this.boldToggle = this._element.querySelector('#boldToggle');
	this.boldToggle.checked = settings.get('bold');
	this.boldToggle.addEventListener('change', function (e) {
		settings.set('bold', e.target.checked);
	}, false);
	
	this.italicToggle = this._element.querySelector('#italicToggle');
	this.italicToggle.checked = settings.get('italic');
	this.italicToggle.addEventListener('change', function (e) {
		settings.set('italic', e.target.checked);
	}, false);
	
	this.underlineToggle = this._element.querySelector('#underlineToggle');
	this.underlineToggle.checked = settings.get('underline');
	this.underlineToggle.addEventListener('change', function (e) {
		settings.set('underline', e.target.checked);
	}, false);
	
	this.strikeToggle = this._element.querySelector('#strikeToggle');
	this.strikeToggle.checked = settings.get('strike');
	this.strikeToggle.addEventListener('change', function (e) {
		settings.set('strike', e.target.checked);
	}, false);
};

/**
 * @private
 * Set up the font family menu's options and listeners.
 */
TextToolOptionsToolbox.prototype._setUpFontFamilyMenu = function () {
	this.fontFamilySelect = this._element.querySelector('#fontFamilySelect');
	
	var that = this;
	this._populateFonts(this.fontFamilySelect)
		.then(function () {
			// Try to set the menu to the last selected font.
			that.fontFamilySelect.value = settings.get('fontFamily');
			
			// If the last selected font is no longer available, default to the first on the list.
			if (that.fontFamilySelect.selectedIndex === -1) {
				that.fontFamilySelect.selectedIndex = 0;
				settings.set('fontFamily', that.fontFamilySelect.value);
			}
			
			that.fontFamilySelect.addEventListener('change', function (e) {
				if (e.target.value === that.REQUEST_FONT_ACCESS_OPTION_VALUE) {
					// If the option to add local fonts was selected, attempt to load them.
					/*that._populateLocalFonts(that.fontFamilySelect, true)
						// If granted, switch the selected option to the first
						// local font (after the base fonts and the divider).
						.then(function () {
							that.fontFamilySelect.selectedIndex = that.BASE_FONTS.length + 1;
						})
						// If denied, show a message and switch the selected
						// option back to the last selected font family.
						.catch(function (err) {
							that.fontFamilySelect.value = settings.get('fontFamily');
							alert(that.FONT_ACCESS_UNAUTHORIZED_MESSAGE);
						});*/
					that.fontFamilySelect.value = settings.get('fontFamily');
					return;
				}
				settings.set('fontFamily', e.target.value);
			}, false);
		});
};

/**
 * @private
 * Populate the font family menu with all fonts known to be safely accessible.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @returns {Promise} Resolves when fonts have been loaded or rejects if loading failed
 */
TextToolOptionsToolbox.prototype._populateFonts = function (fontFamilySelect) {
	var that = this;
	
	if (false) {//window.queryLocalFonts) {
		return this._populateLocalFonts(fontFamilySelect)
			.catch(function (err) {
				console.warn('Could not load local fonts:', err);
				// If fetching local fonts failed, list “web safe” fonts and
				// add an option for the user to manually request local fonts.
				that._populateKnownFonts(fontFamilySelect);
				that._addDividerToMenu(fontFamilySelect);
				var requestAccessOption = document.createElement('option');
				requestAccessOption.value = that.REQUEST_FONT_ACCESS_OPTION_VALUE;
				requestAccessOption.textContent = that.REQUEST_FONT_ACCESS_OPTION_TEXT;
				fontFamilySelect.appendChild(requestAccessOption);
			});
	}
	
	
	// If the local font access API is not available, just show “web safe” fonts.
	this._populateKnownFonts(fontFamilySelect);
	return Promise.resolve();
};

/**
 * @private
 * Load available local font families into the font family menu.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @param {Boolean} userRequested - Whether the attempt to load local fonts is in response to a user request
 * @returns {Promise} Resolves when fonts have been loaded or rejects if loading failed
 */
TextToolOptionsToolbox.prototype._populateLocalFonts = function (fontFamilySelect, userRequested) {
	if (userRequested) {
		progressSpinner.show();
	}
	
	var that = this;
	return window.queryLocalFonts()
		.then(function (fonts) {
			if (!fonts || fonts.length === 0) {
				// Chrome 103's version of the local font access API returns an empty
				// array instead when permission is denied.  Manually throw instead.
				throw new Error();
			}
			
			var fontFamilies = fonts.map(function (font) { return font.family; }),
				// Use Set to automatically remove duplicates.
				uniqueFontFamilies = Array.from(new Set(fontFamilies))
					.sort(Utils.caseInsensitiveSort);
			
			fontFamilySelect.innerHTML = '';
			that._addFontsToMenu(fontFamilySelect, that.BASE_FONTS);
			that._addDividerToMenu(fontFamilySelect);
			
			// Add each unique font family to the menu.
			uniqueFontFamilies.forEach(function (family) {
				var newOption = document.createElement('option');
				newOption.value = '\'' + family + '\'';
				newOption.style.fontFamily = '\'' + family + '\'';
				newOption.textContent = family;
				fontFamilySelect.appendChild(newOption);
			});
		})
		.finally(function () {
			if (userRequested) {
				progressSpinner.hide();
			}
		});
};

/**
 * @private
 * Load all known lists of font families into the font family menu that are appropriate for the device.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 */
TextToolOptionsToolbox.prototype._populateKnownFonts = function (fontFamilySelect) {
	this._addFontsToMenu(fontFamilySelect, this.BASE_FONTS);
	if (!Utils.isMobileLike) {
		this._addDividerToMenu(fontFamilySelect);
		this._addFontsToMenu(fontFamilySelect, this.DESKTOP_FONTS);
	}
};
/**
 * @private
 * Load known lists of font families into the font family menu.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @param {Array<Object>} fonts - The list of fonts to add
 */
TextToolOptionsToolbox.prototype._addFontsToMenu = function (fontFamilySelect, fonts) {
	fonts.forEach(function (font) {
		var newOption = document.createElement('option');
		newOption.value = font.css;
		newOption.style.fontFamily = font.css;
		newOption.textContent = font.name;
		fontFamilySelect.appendChild(newOption);
	});
};

/**
 * @private
 * Add a divider row to a <select> menu.
 * @param {HTMLSelectElement} selectMenu - The drop-down menu to add the divider to
 */
TextToolOptionsToolbox.prototype._addDividerToMenu = function (selectMenu) {
	var divider = document.createElement('option');
		divider.disabled = true;
	selectMenu.appendChild(divider);
};
/**
 * @class
 * Create a new ToolsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function ToolsToolbox(toolbar) {
	Toolbox.call(this, 'tools', toolbar);
}
// Extend Toolbox.
ToolsToolbox.prototype = Object.create(Toolbox.prototype);
ToolsToolbox.prototype.constructor = ToolsToolbox;

// Define constants.
/** @constant {String} The message for browsers that do not support the canvas rounded rectangle function */
ToolsToolbox.prototype.ROUNDED_RECTANGLE_UNSUPPORTED_MESSAGE = 'Your browser does not support the rounded rectangle tool.  ' + Utils.SUGGESTED_BROWSER_MESSAGE;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ToolsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var toolsForm = this._element.querySelector('#tools');
	toolsForm.tool.value = settings.get('tool');
	toolsForm.addEventListener('change', function (e) {
		// Switch to the newly-selected tool.
		tools.switchTool(e.target.value);
	}, false);
	
	if (!CanvasRenderingContext2D.prototype.roundRect) {
		this._element.querySelector('[for="roundRectTool"]').title = this.ROUNDED_RECTANGLE_UNSUPPORTED_MESSAGE;
	} else {
		// If `roundRect` is supported, enable the rounded rectangle tool.
		this._element.querySelector('#roundRectTool').disabled = false;
	}
};
/**
 * @class
 * Create a new ZoomToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function ZoomToolbox(toolbar) {
	Toolbox.call(this, 'zoom', toolbar);
	
	// Expose these fields they can be updated by the zoom manager.
	/** {HTMLInputElement} The input field that shows the current zoom percent */
	this.percent;
	/** {HTMLInputElement} The slider that allows the zoom level to be adjusted */
	this.slider;
	
	this._element.id = 'zoomToolbox';
}
// Extend Toolbox.
ZoomToolbox.prototype = Object.create(Toolbox.prototype);
ZoomToolbox.prototype.constructor = ZoomToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ZoomToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up percent field.
	this.percent = this._element.querySelector('#zoomPercent');
	this.percent.value = zoomManager.levelPercent;
	this.percent.oninput = function (e) {
		zoomManager.levelPercent = parseInt(this.value);
	};
	this.percent.onkeydown = function (e) {
		// Prevent text field keyboard shortcuts being overridden by global shortcuts while typing.
		if (e.currentTarget !== document.activeElement) {
			return;
		}
		var keysToIntercept = [8, 27, 37, 38, 39, 40, 46, 65, 67, 88, 89, 90, 191, 219, 221];
		// Backspace, Esc, Left, Up, Right, Down, Delete, A, C, X, Y, Z, /, [, ]
		if (keysToIntercept.indexOf(e.keyCode) !== -1) {
			e.stopPropagation();
		}
	};
	
	// Set up slider.
	this.slider = this._element.querySelector('#zoomSlider');
	this.slider.min = 0;
	this.slider.max = zoomManager.ZOOM_LEVELS.length - 1;
	this.slider.oninput = function () {
		zoomManager.levelPercent = zoomManager.ZOOM_LEVELS[this.value];
	};
	
	// Set up buttons.
	var zoomOutBtn = this._element.querySelector('#zoomOutBtn');
	zoomOutBtn.onclick = zoomManager.zoomOut.bind(zoomManager);
	var zoomInBtn = this._element.querySelector('#zoomInBtn');
	zoomInBtn.onclick = zoomManager.zoomIn.bind(zoomManager);
};

/**
 * @class
 * Create a new ToolbarManager instance.
 */
function ToolbarManager() {
	/** @private {HTMLDivElement} The element for the main toolbar */
	this._mainToolbar = document.getElementById('toolbar');
	/** @private {HTMLDivElement} The element for the bottom bar */
	this._bottomBar = document.getElementById('bottomBar');
	
	/** {Object<String,Toolbox>} All the toolboxes on the toolbar */
	this.toolboxes = {};
	
	// Create and add the main toolbar toolboxes and dividers.
	this.toolboxes.image = new ImageToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.tools = new ToolsToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.noToolOptions = new NoToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.drawToolOptions = new DrawToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.selectToolOptions = new SelectionToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.textToolOptions = new TextToolOptionsToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.colorPicker = new ColorPickerToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.app = new AppToolbox(this._mainToolbar);
	
	// Create and add the bottom bar toolboxes and dividers.
	this.toolboxes.dimensions = new DimensionsToolbox(this._bottomBar);
	this.toolboxes.zoom = new ZoomToolbox(this._bottomBar);
	
	// Create the floating selection toolbar.
	this.toolboxes.floatingSelectionToolbar = new FloatingSelectionToolbar();
	
	// Hide the extra tool options toolboxes.
	this.toolboxes.noToolOptions.hide();
	this.toolboxes.drawToolOptions.hide();
	this.toolboxes.selectToolOptions.hide();
	this.toolboxes.textToolOptions.hide();
	
	/** {Toolbox} The currently shown tool options toolbox */
	this.currentToolOptionsToolbox = this.toolboxes.drawToolOptions;
	
	// Set up scroll event listeners for different browsers.
	this._mainToolbar.addEventListener('wheel', this._handleScroll.bind(this), false);
	this._bottomBar.addEventListener('wheel', function (ev) { ev.stopPropagation(); }, false);
	
	var toolboxLoadPromises =
		Object.values(this.toolboxes)
		.map(function (toolbox) { return toolbox.loadPromise; });
	/** {Promise} Resolves when all toolboxes have loaded */
	this.loadPromise = Promise.all(toolboxLoadPromises);
}

Object.defineProperties(ToolbarManager.prototype, {
	scrollLeft: {
		get: function () {
			return this._mainToolbar.scrollLeft;
		}
	}
});

/**
 * @private
 * Add a divider to the toolbar.
 * @param {HTMLElement} toolbar - The toolbar element to ad the divider to
 */
ToolbarManager.prototype._addDivider = function (toolbar) {
	var divider = document.createElement('span');
	divider.className = 'divider';
	toolbar.appendChild(divider);
};

/**
 * @private
 * Handle the user scrolling the toolbar and convert vertical scrolling to horizontal scrolling if need be.
 * @param {WheelEvent|Event} ev
 */
ToolbarManager.prototype._handleScroll = function (ev) {
	ev.stopPropagation();
	if (Utils.checkModifierKeys(ev)) {
		// Do not intercept if combined with a modifier key.
		return;
	}
	var scrollX = ev.deltaX || ev.wheelDeltaX || 0,
		scrollY = ev.deltaY || ev.wheelDeltaY || ev.wheelDelta || 0;
		
	if (Math.abs(scrollY) > Math.abs(scrollX)) {
		// If there is primarily or exclusively vertical scrolling,
		// intercept and map it to horizontal scrolling.
		ev.preventDefault();
		this._mainToolbar.scrollLeft += scrollY;
	}
};

/**
 * Switch which tool options toolbox is shown.
 * @param {Toolbox} toolbox - Which toolbox to show (if none, defaults to the no tool options toolbox)
 */
ToolbarManager.prototype.switchToolOptionsToolbox = function (toolbox) {
	if (this.currentToolOptionsToolbox) {
		this.currentToolOptionsToolbox.hide();
	}
	toolbox = (toolbox || this.toolboxes.noToolOptions);
	toolbox.show();
	this.currentToolOptionsToolbox = toolbox;
};
/**
 * Create a new FloatingRegion instance.
 */
function FloatingRegion() {
	this._x =
		this._y =
		this._width =
		this._height = 0;
	this._interactable = true;
	this._showHandles = true;
	
	this.drag;
	
	this.element = document.createElement('div');
	this.element.className = 'floatingRegion';
	this.element.setAttribute('touch-action', 'none');
	
	this._addDragHandles();
	
	// Use the pointer handlers for tools when the region gets moved or resized.
	this.element.addEventListener('pointerdown', this.handleDragStart.bind(this), false);
}

// Define constants.
/** @constant {Number} How far outside the region it can be clicked to drag, in pixels */
FloatingRegion.prototype.GRABBABLE_MARGIN = 24;
/** @constant {Number} How much to enlarge the outline around its contents (0 = on the outer ring of pixels) */
FloatingRegion.prototype.PADDING = 1;

Object.defineProperties(FloatingRegion.prototype, {
	x: {
		get: function () {
			return this._x;
		},
		set: function (value) {
			this._x = Math.round(value);
			this._updateTransform();
		}
	},
	y: {
		get: function () {
			return this._y;
		},
		set: function (value) {
			this._y = Math.round(value);
			this._updateTransform();
		}
	},
	width: {
		get: function () {
			return this._width;
		},
		set: function (value) {
			this._width = Math.round(value);
			var zoomedWidth = Math.ceil(zoomManager.level * this._width);
			zoomedWidth += (2 * this.PADDING);
			this.element.style.width = zoomedWidth + 'px';
		}
	},
	height: {
		get: function () {
			return this._height;
		},
		set: function (value) {
			this._height = Math.round(value);
			var zoomedHeight = Math.ceil(zoomManager.level * this._height);
			zoomedHeight += (2 * this.PADDING);
			this.element.style.height = zoomedHeight + 'px';
		}
	},
	interactable: {
		get: function () {
			return this._interactable;
		},
		set: function (value) {
			if (value) {
				this.element.style.removeProperty('pointer-events');
			} else {
				this.element.style.pointerEvents = 'none';
			}
			this._interactable = value;
		}
	},
	showHandles: {
		get: function () {
			return this._showHandles;
		},
		set: function (value) {
			// For browsers that do not support calling `classList.toggle` with a boolean.
			this.element.classList[value ? 'remove' : 'add']('hideHandles');
			this._showHandles = value;
		}
	}
});

/**
 * @private
 * Create and append drag handle elements for the draggable region.
 */
FloatingRegion.prototype._addDragHandles = function () {
	var boundHandleDragStart = this.handleDragStart.bind(this);
	
	['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(function (direction) {
		var dragHandle = document.createElement('button');
		dragHandle.className = 'resizeHandle resize' + direction.toUpperCase();
		dragHandle.dataset.direction = direction;
		dragHandle.addEventListener('pointerdown', boundHandleDragStart, false);
		this.element.appendChild(dragHandle);
	}, this);
};

/**
 * @private
 * Update the region's CSS translation to the current x- and y-values.
 */
FloatingRegion.prototype._updateTransform = function () {
	var zoomedX = Math.floor(zoomManager.level * this._x),
		zoomedY = Math.floor(zoomManager.level * this._y);
	zoomedX -= this.PADDING;
	zoomedY -= this.PADDING;
	this.element.style.WebkitTransform =
		this.element.style.MozTransform =
		this.element.style.MsTransform =
		this.element.style.OTransform =
		this.element.style.transform = 'translate(' + zoomedX + 'px, ' + zoomedY + 'px)';
};

/**
 * @private
 * Handle starting to drag the region or a resize handle.
 * @param {PointerEvent} ev
 */
FloatingRegion.prototype.handleDragStart = function (ev) {
	this.drag = {
		initial: {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		},
		pointerStart: {
			x: Math.round(Utils.getCanvasX(ev.pageX) / zoomManager.level),
			y: Math.round(Utils.getCanvasY(ev.pageY) / zoomManager.level),
		},
		// If the drag was started on a resize handle, get the direction;
		// otherwise, the entire region is being dragged.
		type: ev.currentTarget.dataset.direction || 'move'
	};
	if (ev.currentTarget.dataset.direction) {
		this.element.style.cursor = ev.currentTarget.dataset.direction + '-resize';
	} else {
		this.element.style.removeProperty('cursor');
	}
	tools._boundPointerDownHandler(ev);
};

/**
 * @private
 * Handle a dragged resize handle being moved.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FloatingRegion.prototype.handleDragMove = function (pointerState) {
	if (!this.drag) {
		return;
	}
	var pointerDelta = {
		x: pointerState.x - this.drag.pointerStart.x,
		y: pointerState.y - this.drag.pointerStart.y
	};
	
	// Handle dragging to move the entire selection.
	if (this.drag.type === 'move') {
		this.x = Utils.constrainValue(
			this.drag.initial.x + pointerDelta.x,
			-this.drag.initial.width,
			canvas.width);
		this.y = Utils.constrainValue(
			this.drag.initial.y + pointerDelta.y,
			-this.drag.initial.height,
			canvas.height);
		return;
	}
	
	// Handle horizontal resizing.
	switch (this.drag.type) {
		case 'ne':
		case 'e':
		case 'se':
			pointerDelta.x = Math.max(pointerDelta.x, -this.drag.initial.width + 1);
			this.width = this.drag.initial.width + pointerDelta.x;
			break;
		case 'nw':
		case 'w':
		case 'sw':
			pointerDelta.x = Math.min(pointerDelta.x, this.drag.initial.width - 1);
			this.x = this.drag.initial.x + pointerDelta.x;
			this.width = this.drag.initial.width - pointerDelta.x;
			break;
	}
	// Handle vertical resizing.
	switch (this.drag.type) {
		case 'nw':
		case 'n':
		case 'ne':
			pointerDelta.y = Math.min(pointerDelta.y, this.drag.initial.height - 1);
			this.y = this.drag.initial.y + pointerDelta.y;
			this.height = this.drag.initial.height - pointerDelta.y;
			break;
		case 'se':
		case 's':
		case 'sw':
			pointerDelta.y = Math.max(pointerDelta.y, -this.drag.initial.height + 1);
			this.height = this.drag.initial.height + pointerDelta.y;
			break;
	}
};

/**
 * @private
 * Handle a dragged resize handle being released.
 */
FloatingRegion.prototype.handleDragEnd = function () {
	if (!this.drag) {
		return;
	}
	delete this.drag;
	this.element.style.removeProperty('cursor');
};

/**
 * Show the floating region if it has been hidden.
 */
FloatingRegion.prototype.show = function () {
	this.element.style.removeProperty('visibility');
};

/**
 * Hide the floating region.
 */
FloatingRegion.prototype.hide = function () {
	this.element.style.visibility = 'hidden';
};

/**
 * Append the floating region element to the body.
 */
FloatingRegion.prototype.addToDOM = function () {
	if (!canvasPositioner.contains(this.element)) {
		canvasPositioner.appendChild(this.element);
	}
	this.show();
};

/**
 * Append the floating region element to the body.
 */
FloatingRegion.prototype.removeFromDOM = function () {
	// End any ongoing drag if in progress.
	this.handleDragEnd();
	if (canvasPositioner.contains(this.element)) {
		try {
			// Wrapping in a try block because sometimes contains incorrectly returns true for the text tool.
			canvasPositioner.removeChild(this.element);
		} catch (err) {}
	}
};

/**
 * Create a new abstract Tool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function Tool(cxt, preCxt) {
	/** @private {CanvasRenderingContext2D} The context for the main canvas */
	this._cxt = cxt;
	/** @private {CanvasRenderingContext2D} The context for the precanvas */
	this._preCxt = preCxt;
	/** @private {Boolean} Whether the canvas needs to be redrawn */
	this._canvasDirty = false;
}

/**
 * Undo anti-aliasing.
 * @param {Object} [color] - The color every pixel on the canvas should be
 */
Tool.prototype._deAntiAlias = function (color) {
	var imageData = this._preCxt.getImageData(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
	for (var i = 3; i < imageData.data.length; i += 4) {
		if (imageData.data[i] >= 128) {
			// Set > 50% opaque pixels to be fully opaque.
			imageData.data[i] = 255;
			
			// If a color was specified, ensure each pixel matches that color.
			if (color) {
				imageData.data[i - 3] = color.r;
				imageData.data[i - 2] = color.g;
				imageData.data[i - 1] = color.b;
			}
		} else {
			// Reset < 50% opaque pixels to transparent black.
			imageData.data[i] =
				imageData.data[i - 3] =
				imageData.data[i - 2] =
				imageData.data[i - 1] = 0;
		}
	}
	this._preCxt.putImageData(imageData, 0, 0);
};

/**
 * Round/truncate pointer coordinates down to integers.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype._floorPointerState = function (pointerState) {
	pointerState.x = Math.floor(pointerState.x);
	pointerState.y = Math.floor(pointerState.y);
};

/**
 * Round pointer coordinates to nearest integers.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype._roundPointerState = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
};

/**
 * Handle the tool becoming the active tool.
 */
Tool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'default';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype.start = function (pointerState) {
};

/**
 * Handle movement of the pointer that activated the tool.
 * @param {Object} pointerState - The pointer coordinates
 */
Tool.prototype.move = function (pointerState) {
};

/**
 * Update the canvas if necessary.
 */
Tool.prototype.update = function () {
};

/**
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
Tool.prototype.end = function (pointerState) {
};

/**
 * Handle the tool no longer being the active tool.
 */
Tool.prototype.deactivate = function () {
	this._canvasDirty = false;
};

/**
 * Create a new abstract DrawingTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DrawingTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	
	/** @private {String} The CSS color for the current line/primary color */
	this._lineColor;
	/** @private {String} The CSS color for the current fill/secondary color */
	this._fillColor;
	/** @private {Boolean} Whether the last user input indicated to swap line and fill colors */
	this._swapLineAndFill = false;
}
// Extend Tool.
DrawingTool.prototype = Object.create(Tool.prototype);
DrawingTool.prototype.constructor = DrawingTool;

/**
 * @override
 * Handle the drawing tool becoming the active tool.
 */
DrawingTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.drawToolOptions);
};

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DrawingTool.prototype.start = function (pointerState) {
	this._swapLineAndFill = (pointerState.button === 2);
	this._updateFromDrawingSettings();
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
};

/**
 * @override
 * Handle movement of the pointer that activated the tool.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DrawingTool.prototype.move = function (pointerState) {
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
};

/**
 * @override
 * Update the canvas if necessary.
 */
DrawingTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
	
	this._prepareCanvas();
};

/**
 * @override
 * Finish the shape when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
DrawingTool.prototype.end = function (pointerState) {
	// Draw the drawing to the main canvas.
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	// Erase the preview.
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};

/**
 * @private
 * Update the line and fill colors and line width for the tool based on the current settings.
 */
DrawingTool.prototype._updateFromDrawingSettings = function () {
	this._lineColor = (this._swapLineAndFill ? settings.get('fillColor') : settings.get('lineColor'));
	this._fillColor = (this._swapLineAndFill ? settings.get('lineColor') : settings.get('fillColor'));
	this._lineWidth = settings.get('lineWidth');
};

/**
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
DrawingTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.strokeStyle = this._lineColor;
	this._preCxt.fillStyle = this._fillColor;
};

/**
 * Create a new abstract ShapeTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function ShapeTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
ShapeTool.prototype = Object.create(DrawingTool.prototype);
ShapeTool.prototype.constructor = ShapeTool;


/**
 * @override
 * Handle the tool becoming the active tool.
 */
ShapeTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineAndFill();
	});
};

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
ShapeTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
};

/**
 * @private
 * Stroke and fill the current path, de-anti-alised depending on the current setting.
 */
ShapeTool.prototype._drawCurrentPath = function () {
	// Draw the stroke first.
	this._preCxt.stroke();
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	// Change the composite operation to ensure the filled region does not affect the de-anti-aliased outline.
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fill();
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (settings.get('outlineOption') === 'fillOnly' && !settings.get('antiAlias')) {
		// If there was no stroke, de-anti-alias the fill.
		this._deAntiAlias();
	}
};

/**
 * @override
 * @private
 * Update the drawing properties as well as whether the line or fill should be transparent based on the current settings.
 */
ShapeTool.prototype._updateFromDrawingSettings = function () {
	DrawingTool.prototype._updateFromDrawingSettings.call(this);
	
	if (settings.get('outlineOption') === 'fillOnly') {
		this._lineColor = 'transparent';
	} else if (settings.get('outlineOption') === 'outlineOnly') {
		this._fillColor = 'transparent';
	}
};

/**
 * Create a new PencilTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function PencilTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._points;
	/** {Number} The index of the point drawn to the canvas */
	this._lastPointIndex;
}
// Extend DrawingTool.
PencilTool.prototype = Object.create(DrawingTool.prototype);
PencilTool.prototype.constructor = PencilTool;

/**
 * @private
 * Draw a point to the canvas.
 * @param {Number} x - The x-coordinate of the point
 * @param {Number} y - The y-coordinate of the point
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
PencilTool.prototype._drawPoint = function (x, y, cxt) {
	cxt.fillRect(x, y, 1, 1);
};
	
/**
 * @private
 * Draw a straight line.
 * @param {Number} x1 - The x-coordinate of the start point
 * @param {Number} y1 - The y-coordinate of the start point
 * @param {Number} x2 - The x-coordinate of the end point
 * @param {Number} y2 - The y-coordinate of the end point
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
PencilTool.prototype._drawLine = function (x1, y1, x2, y2, cxt) {
	var dx = Math.abs(x2 - x1), /** Line's change in x */
		dy = -Math.abs(y2 - y1), /** Line's change in y */
		sx = x1 < x2 ? 1 : -1, /** Sign of the change in x */
		sy = y1 < y2 ? 1 : -1, /** Sign of the change in y */
		err = dx + dy, /** Error increment */
		e2; /** 2 * error increment */
	
	while (x1 !== x2 || y1 !== y2) {
		e2 = 2 * err;
		
		// x-step
		if (e2 >= dy) {
			err += dy;
			x1 += sx;
		}
		// y-step
		if (e2 <= dx) {
			err += dx;
			y1 += sy;
		}
		
		this._drawPoint(x1, y1, cxt);
	}
};


/**
 * @override
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
PencilTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	// Set the fill style to be the line color because drawPoint uses fillRect.
	this._preCxt.fillStyle = this._lineColor;
};

/**
 * @override
 * Handle the pencil tool becoming the active tool.
 */
PencilTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/pencil.cur), crosshair';
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly(false);
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PencilTool.prototype.start = function (pointerState) {
	this._floorPointerState(pointerState);
	
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y
		}
	];
	
	this._lastPointIndex = 0;
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the doodle when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.move = function (pointerState) {
	this._floorPointerState(pointerState);
	
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._points.push({
		x: pointerState.x,
		y: pointerState.y
	});
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
PencilTool.prototype.update = function () {
	if (!this._canvasDirty|| !this._points) {
		return;
	}
	// For performance, the pencil tool does not clear the canvas every frame;
	// it just adds on the new segments in the current operation.  This may
	// need to be changed if a future version of PaintZ has something other
	// than the current tool drawing to the pre-canvas every frame.
	this._prepareCanvas();
	
	// Draw a dot at the start of the doodle.
	this._drawPoint(this._points[0].x, this._points[0].y, this._preCxt);
	
	// Draw the whole shape.
	for (var i = this._lastPointIndex || 1; i < this._points.length; i++) {
		this._drawLine(
			this._points[i - 1].x,
			this._points[i - 1].y,
			this._points[i].x,
			this._points[i].y,
			this._preCxt);
	}
	
	this._lastPointIndex = this._points.length - 1;
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the list of points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.apply(this, arguments);
	delete this._points;
};

/**
 * Create a new DoodleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DoodleTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
DoodleTool.prototype = Object.create(DrawingTool.prototype);
DoodleTool.prototype.constructor = DoodleTool;

// Define constants.
/** {Number} The maximum allowed width/height for the cursor, in pixels */
DoodleTool.MAX_CURSOR_SIZE = 128;
/** {Number} The maximum brush size at which crosshairs are needed */
DoodleTool.MAX_CROSSHAIR_SIZE = 16
/** {Number} The length of the crosshair lines, in pixels */
DoodleTool.CROSSHAIR_LENGTH = 12;
/** {Number} The offset of the crosshairs from the outside of the brush, in pixels */
DoodleTool.CROSSHAIR_OFFSET = 4;

/**
 * @override
 * Handle the doodle tool becoming the active tool.
 */
DoodleTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = DoodleTool.getCursorCSS();
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DoodleTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y
		}
	];
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the doodle when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
DoodleTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._points.push({
		x: pointerState.x,
		y: pointerState.y
	});
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
DoodleTool.prototype.update = function () {
	if (!this._canvasDirty|| !this._points) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	
	// Force round end caps on the path.
	Utils.drawCap(this._preCxt, this._points[0].x, this._points[0].y);
	Utils.drawCap(this._preCxt, this._points[this._points.length - 1].x, this._points[this._points.length - 1].y);
	
	// Draw the shape.
	Utils.createPath(this._preCxt, this._points);
	this._preCxt.stroke();
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the list of points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
DoodleTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.apply(this, arguments);
	delete this._points;
};

/**
 * @static
 * Return the CSS value for the doodle tool cursor.
 * @returns {String}
 */
DoodleTool.getCursorCSS = function () {
	var size = (parseInt(settings.get('lineWidth')) + 1) * zoomManager.level,
		halfCanvasSize = size / 2;
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > DoodleTool.MAX_CURSOR_SIZE * Math.sqrt(2)) {
		return 'crosshair';
	}
	
	// Set the cursor size.
	cursorCanvas.width =
		cursorCanvas.height = size;
	
	cursorCxt.save();
	cursorCxt.lineWidth = 1;
	
	// Draw crosshairs around the circle if it is small enough.
	if (size < DoodleTool.MAX_CROSSHAIR_SIZE) {
		// Increase the canvas size to make room for the crosshairs.
		cursorCanvas.width =
			cursorCanvas.height = cursorCanvas.width + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH;
		halfCanvasSize = cursorCanvas.width / 2;
		
		// Draw the crosshairs.
		cursorCxt.translate(halfCanvasSize, halfCanvasSize);
		cursorCxt.beginPath();
		// Right
		cursorCxt.moveTo( size / 2 + DoodleTool.CROSSHAIR_OFFSET,                               0);
		cursorCxt.lineTo( size / 2 + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH, 0);
		// Left
		cursorCxt.moveTo(-size / 2 - DoodleTool.CROSSHAIR_OFFSET,                               0);
		cursorCxt.lineTo(-size / 2 - DoodleTool.CROSSHAIR_OFFSET - DoodleTool.CROSSHAIR_LENGTH, 0);
		// Top
		cursorCxt.moveTo(0,  size / 2 + DoodleTool.CROSSHAIR_OFFSET);
		cursorCxt.lineTo(0,  size / 2 + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH);
		// Bottom
		cursorCxt.moveTo(0, -size / 2 - DoodleTool.CROSSHAIR_OFFSET);
		cursorCxt.lineTo(0, -size / 2 - DoodleTool.CROSSHAIR_OFFSET - DoodleTool.CROSSHAIR_LENGTH);
		cursorCxt.translate(-halfCanvasSize, -halfCanvasSize);
		
		cursorCxt.setLineDash([]);
		cursorCxt.strokeStyle = 'white';
		cursorCxt.stroke();
		cursorCxt.setLineDash([1, 1]);
		cursorCxt.strokeStyle = 'black';
		cursorCxt.stroke();
		
		cursorCxt.closePath();
	}
	
	cursorCxt.beginPath();
	cursorCxt.arc(
		halfCanvasSize, halfCanvasSize,
		size / 2,
		0, Math.TAU, false
	);
	cursorCxt.closePath();
	
	cursorCxt.setLineDash([]);
	cursorCxt.strokeStyle = 'white';
	cursorCxt.stroke();
	cursorCxt.setLineDash([2, 2]);
	cursorCxt.strokeStyle = 'black';
	cursorCxt.stroke();
	
	cursorCxt.restore();
	
	var cursorDataURL = cursorCanvas.toDataURL();

	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', crosshair'; // Fallback

	return cursorCSS;
};

/**
 * Create a new AirbrushTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function AirbrushTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._lastPoint;
}
// Extend DrawingTool.
AirbrushTool.prototype = Object.create(DrawingTool.prototype);
AirbrushTool.prototype.constructor = AirbrushTool;
	
/**
 * @private
 * Draw a point within a given circle.
 * @param {Number} centerX - The x-coordinate of the center of the region
 * @param {Number} centerY - The y-coordinate of the center of the region
 * @param {Number} radius - The radius of the region
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
AirbrushTool.prototype._drawPointInRegion = function (centerX, centerY, radius, cxt) {
	var angle = Math.random() * Math.TAU,
		pointRad = Math.random() * radius,
		offsetX = pointRad * Math.cos(angle),
		offsetY = pointRad * Math.sin(angle),
		pointX = Math.round(centerX + offsetX),
		pointY = Math.round(centerY + offsetY);
	
	PencilTool.prototype._drawPoint.call(this, pointX, pointY, cxt);
};

/**
 * @override
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
AirbrushTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	// Set the fill style to be the line color because drawPoint uses fillRect.
	this._preCxt.fillStyle = this._lineColor;
};

/**
 * @override
 * Handle the pencil tool becoming the active tool.
 */
AirbrushTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/airbrush.cur), crosshair';
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly(true);
	});
};

/**
 * @override
 * Handle a spray being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
AirbrushTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	this.move(pointerState);
};

/**
 * @override
 * Update the spray center when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
AirbrushTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._lastPoint = {
		x: pointerState.x,
		y: pointerState.y
	};
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
AirbrushTool.prototype.update = function () {
	if (!this._canvasDirty || !this._lastPoint) {
		return;
	}
	// The airbrush tool does not clear the canvas every frame;
	// it just adds on the new points in the current operation.  This may
	// need to be changed if a future version of PaintZ has something other
	// than the current tool drawing to the pre-canvas every frame.
	this._prepareCanvas();
	
	var pointCount = Math.floor((2/3) * this._lineWidth);
	
	for (var i = 0; i < pointCount; i++) {
		this._drawPointInRegion(this._lastPoint.x, this._lastPoint.y, this._lineWidth, this._preCxt);
	}
};

/**
 * @override
 * Stop spraying when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
AirbrushTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.call(this, pointerState);
	
	this._lastPoint = undefined;
	this._canvasDirty = false;
}

/**
 * Create a new LineTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function LineTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extends DrawingTool.
LineTool.prototype = Object.create(DrawingTool.prototype);
LineTool.prototype.constructor = LineTool;

/**
 * @override
 * Handle the line tool becoming the active tool.
 */
LineTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a line being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
LineTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
	this.endX =
		this.endY = undefined;
};

/**
 * @override
 * Update the line when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
LineTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this.endX = pointerState.x;
	this.endY = pointerState.y;
	
	// Snap to tau/8 angles when shift key held.
	if (pointerState.shiftKey) {
		var deltaY = this.endY - this.startY,
			deltaX = this.endX - this.startX,
			angle = Math.atan2(deltaY, deltaX),
			increment = 0.125 * Math.TAU,
			snappedAngle = Math.round(angle / increment) * increment,
			length = snappedAngle % (2 * increment) === 0 ?
				Math.max(Math.abs(deltaY), Math.abs(deltaX)) :
				Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		
		this.endX = this.startX + (length * Math.cos(snappedAngle));
		this.endY = this.startY + (length * Math.sin(snappedAngle)) ;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
LineTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	Utils.drawLine(this.startX, this.startY, this.endX, this.endY, this._preCxt);
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
}

/**
 * Create a new CurveTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function CurveTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this.startX;
	this.startY;
	this.endX;
	this.endY;
	this.point1X;
	this.point1Y;
	this.point2X;
	this.point2Y;
	this._state = this.STATE_NOT_STARTED;
}
// Extend CurveTool.
CurveTool.prototype = Object.create(DrawingTool.prototype);
CurveTool.prototype.constructor = CurveTool;

// Define constants.
CurveTool.prototype.STATE_NOT_STARTED = 0;
CurveTool.prototype.STATE_PLACING_END_POINT = 1;
CurveTool.prototype.STATE_PLACING_CONTROL_POINT1 = 2;
CurveTool.prototype.STATE_PLACING_CONTROL_POINT2 = 3;

/**
 * @override
 * Handle the curve tool becoming the active tool.
 */
CurveTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this, arguments);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a curve being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
CurveTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (this._state === this.STATE_NOT_STARTED) {
		this.startX = pointerState.x;
		this.startY = pointerState.y;
		this.endX =
			this.endY =
			this.point1X =
			this.point1Y =
			this.point2X =
			this.point2Y = undefined;
	}
	this._state++;
	this.move(pointerState);
};

/**
 * @override
 * Update the curve when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	switch (this._state) {
		case this.STATE_PLACING_END_POINT:
			LineTool.prototype.move.apply(this, arguments);
			break;
		case this.STATE_PLACING_CONTROL_POINT1:
			this.point1X = pointerState.x;
			this.point1Y = pointerState.y;
			break;
		case this.STATE_PLACING_CONTROL_POINT2:
			this.point2X = pointerState.x;
			this.point2Y = pointerState.y;
			break;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
CurveTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	if (this._state === this.STATE_PLACING_END_POINT) {
		Utils.drawLine(this.startX, this.startY, this.endX, this.endY, this._preCxt);
		
	} else if (this._state > this.STATE_PLACING_END_POINT) {
		this._preCxt.beginPath();
		this._preCxt.moveTo(this.startX, this.startY);
		this._preCxt.bezierCurveTo(
			this.point1X,
			this.point1Y,
			(typeof this.point2X !== 'undefined' ? this.point2X : this.point1X),
			(typeof this.point2Y !== 'undefined' ? this.point2Y : this.point1Y),
			this.endX,
			this.endY);
		this._preCxt.stroke();
	}
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
};

/**
 * @override
 * Process when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.end = function (pointerState) {
	if (this._state === this.STATE_PLACING_END_POINT) {
		if (Math.round(this.endX) === Math.round(this.startX) &&
				Math.round(this.endY) === Math.round(this.startY)) {
			// Abort if the starting line has a length less than 1.
			Utils.clearCanvas(this._preCxt);
			this._state = this.STATE_NOT_STARTED;
			return;
		}
		
	} else if (this._state === this.STATE_PLACING_CONTROL_POINT2) {
		this._finalizeCurve();
	}
};

/**
 * @override
 * Save the curve if the tool is deactivated before both control points have been set.
 */
CurveTool.prototype.deactivate = function () {
	if (this._state !== this.STATE_NOT_STARTED) {
		this._finalizeCurve();
	}
};

/**
 * @private
 * Draw the final curve and reset the tool's state.
 */
CurveTool.prototype._finalizeCurve = function () {
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
	this._state = this.STATE_NOT_STARTED;
};

/**
 * Create a new PolygonTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function PolygonTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
	
	this._points;
}
// Extend ShapeTool.
PolygonTool.prototype = Object.create(ShapeTool.prototype);
PolygonTool.prototype.constructor = PolygonTool;

// Define constants.
/** {Number} How far a point can be from the first point to be treated as intended to close the polygon, in pixels */
PolygonTool.prototype.CLOSE_PATH_THERSHOLD = 5; // Approximated from classic MS Paint at 1px line width.

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PolygonTool.prototype.start = function (pointerState) {
	ShapeTool.prototype.start.apply(this, arguments);
	
	if (!this._points) {
		// If starting a new polygon, set the starting point and the current moving point to the pointer position.
		this._points = [
			{
				x: pointerState.x,
				y: pointerState.y
			}, {
				x: pointerState.x,
				y: pointerState.y
			}
		];
	} else {
		this._points.push({
			x: pointerState.x,
			y: pointerState.y
		});
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the polygon when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
PolygonTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	// Update the last point in the polygon to the pointer position.
	this._points[this._points.length - 1] = {
		x: pointerState.x,
		y: pointerState.y
	};
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
PolygonTool.prototype.update = function () {
	if (!this._canvasDirty || !this._points) {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	
	if (settings.get('outlineOption') === 'fillOnly' && this._points.length === 2) {
		// If no outline, draw the first stroke as a 1px line.
		this._drawFirstLine();
		this._canvasDirty = false;
		return;
	}
	
	// Force round end caps on the path.
	Utils.drawCap(this._preCxt, this._points[0].x, this._points[0].y);
	Utils.drawCap(this._preCxt, this._points[this._points.length - 1].x, this._points[this._points.length - 1].y);
	
	// Draw the polygon up to the last point.
	Utils.createPath(this._preCxt, this._points);
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
PolygonTool.prototype.end = function (pointerState) {
	var distanceFromStart = Utils.distance(this._points[0].x, this._points[0].y, pointerState.x, pointerState.y);
	if (distanceFromStart < this.CLOSE_PATH_THERSHOLD) {
		this.finalizePolygon();
	}
};

/**
 * @override
 * If the polygon tool gets deactivated, close the current polygon and clean up.
 */
PolygonTool.prototype.deactivate = function () {
	this.finalizePolygon();
};

/**
 * Delete the current list of polygon vertices and clear the precanvas.
 */
PolygonTool.prototype.clearDraftPolygon = function () {
	delete this._points;
	Utils.clearCanvas(this._preCxt);
};

/**
 * Close and draw the final polygon.
 */
PolygonTool.prototype.finalizePolygon = function () {
	if (!this._points || this._points.length < 3) {
		this.clearDraftPolygon();
		return;
	}
	
	// Erase the last (unclosed) preview from the precanvas before redrawing.
	Utils.clearCanvas(this._preCxt);
	
	// Draw the entire polygon, closed.
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	Utils.createPath(this._preCxt, this._points, true);
	this._drawCurrentPath();
	
	// Draw it to the canvas and reset the tool.
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	this.clearDraftPolygon();
	undoStack.addState();
};

/**
 * @private
 * Draw a line between the first 2 points in the inverse of the colors below it.
 */
PolygonTool.prototype._drawFirstLine = function () {
	// Draw a line between the first 2 points.
	this._preCxt.save();
	this._preCxt.lineWidth = 1;
	this._preCxt.strokeStyle = '#000000';
	this._preCxt.beginPath();
	this._preCxt.moveTo(this._points[0].x, this._points[0].y);
	this._preCxt.lineTo(this._points[1].x, this._points[1].y);
	this._preCxt.stroke();
	// Fill in the line with the color-inverted drawing.
	this._preCxt.globalCompositeOperation = 'source-in';
	Utils.drawCanvasInvertedToPreCanvas(cxt, cursorCxt);
	this._preCxt.restore();
};

/**
 * Create a new RectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RectangleTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
	
	this.x;
	this.y;
	this.width;
	this.height;
}
// Extend ShapeTool;
RectangleTool.prototype = Object.create(ShapeTool.prototype);
RectangleTool.prototype.constructor = RectangleTool;

/**
 * @override
 * Update the rectangle's preview when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	this.x = Math.min(pointerState.x, this.startX);
	this.y = Math.min(pointerState.y, this.startY);
	this.width = Math.abs(pointerState.x - this.startX);
	this.height = Math.abs(pointerState.y - this.startY);
	
	// Perfect square when shift key held.
	if (pointerState.shiftKey) {
		if (this.width < this.height) {
			this.height = this.width;
			if (this.y === pointerState.y) {
				this.y = this.startY - this.height;
			}
		} else {
			this.width = this.height;
			if (this.x === pointerState.x) {
				this.x = this.startX - this.width;
			}
		}
	}
	
	// Draw from center when ctrl key held.
	if (pointerState.ctrlKey) {
		this.x = this.startX - this.width;
		this.y = this.startY - this.height;
		this.width *= 2;
		this.height *= 2;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
RectangleTool.prototype.update = function () {
	if (!this._canvasDirty && typeof this.x !== 'undefined') {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	this._preCxt.beginPath();
	this._preCxt.rect(this.x, this.y, this.width, this.height);
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.end = function (pointerState) {
	ShapeTool.prototype.end.apply(this, arguments);
	
	this.x =
		this.y =
		this.width =
		this.height = undefined;
};
/**
 * Create a new RoundedRectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RoundedRectangleTool(cxt, preCxt) {
	RectangleTool.apply(this, arguments);
}
// Extend RectangleTool;
RoundedRectangleTool.prototype = Object.create(RectangleTool.prototype);
RoundedRectangleTool.prototype.constructor = RoundedRectangleTool;

// Define constants.
/** @constant {Number} The corner radius for rounded rectangles, in pixels */
RoundedRectangleTool.prototype.MIN_CORNER_RADIUS = 8;
// Like MS Paint, there is no UI to change this.
//  6 ≈ Classic Paint top-left corner (≈ 8 in Photoshop)
//  8 ≈ Classic Paint bottom-right corner (≈ 12 in Photoshop)
// 16 ≈ Win7 Paint all corners (≈ 18 in Photoshop)
// Unlike MS Paint, the maximum line width is much higher, so the
// radius will increase when the line width exceeds this.

/**
 * @override
 * Update the canvas if necessary.
 */
RoundedRectangleTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	this._preCxt.beginPath();
	this._preCxt.roundRect(this.x, this.y, this.width, this.height, Math.max(this.MIN_CORNER_RADIUS, this._lineWidth));
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * Create a new OvalTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function OvalTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
	
	this.centerX;
	this.centerY;
	this.radX;
	this.radY;
}
// Extend ShapeTool.
OvalTool.prototype = Object.create(ShapeTool.prototype);
OvalTool.prototype.constructor = OvalTool;

/**
 * @override
 * Update the oval's preview as it is being drawn.
 * @param {Object} pointerState - The pointer coordinates
 */
OvalTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	// Draw from center when ctrl key held.
	if (pointerState.ctrlKey) {
		this.centerX = this.startX;
		this.centerY = this.startY;
		this.radX = pointerState.x - this.startX;
		this.radY = pointerState.y - this.startY;
	} else {
		this.centerX = (this.startX + pointerState.x) / 2;
		this.centerY = (this.startY + pointerState.y) / 2;
		this.radX = (pointerState.x - this.startX) / 2;
		this.radY = (pointerState.y - this.startY) / 2;
	}
	
	// Perfect circle when shift key held.
	if (pointerState.shiftKey) {
		if (Math.abs(this.radX) < Math.abs(this.radY)) {
			this.radY = Math.sign(this.radY) * -Math.abs(this.radX);
			if (!pointerState.ctrlKey) {
				this.centerY = this.startY - this.radY;
			}
		} else {
			this.radX = Math.sign(this.radX) * Math.abs(this.radY);
			if (!pointerState.ctrlKey) {
				this.centerX = this.startX + this.radX;
			}
		}
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
OvalTool.prototype.update = function () {
	if (!this._canvasDirty && typeof this.centerX !== 'undefined') {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Prepare the new preview.
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.fillStyle = this.fillColor;
	this._preCxt.save(); // Save the drawing context's state.
	this._preCxt.beginPath();
	this._preCxt.translate(this.centerX - this.radX, this.centerY - this.radY);
	this._preCxt.scale(this.radX, this.radY);
	this._preCxt.arc(1, 1, 1, 0, Math.TAU, false);
	this._preCxt.restore(); // Restore the context to its original state.
	
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
OvalTool.prototype.end = function (pointerState) {
	ShapeTool.prototype.end.apply(this, arguments);
	
	this.centerX =
		this.centerY =
		this.radX =
		this.radY = undefined;
};

/**
 * Create a new EraserTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function EraserTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._points;
}
// Extend DrawingTool.
EraserTool.prototype = Object.create(DrawingTool.prototype);
EraserTool.prototype.constructor = EraserTool;

/**
 * @override
 * Handle the doodle tool becoming the active tool.
 */
EraserTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = EraserTool.getCursorCSS();
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableFillOnly(true);
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
EraserTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y,
			lineWidth: this._lineWidth
		}
	];
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the erased area as it is being drawn.
 * @param {Object} pointerState - The pointer coordinates
 */
EraserTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._points.push({
		x: pointerState.x,
		y: pointerState.y,
		lineWidth: this._lineWidth
	});
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
EraserTool.prototype.update = function () {
	if (!this._canvasDirty || !this._points) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	this._preCxt.fillStyle = this._fillColor;
	
	for (var i = 0; i < this._points.length; i++) {
		// Draw the current position.
		this._preCxt.fillRect(
			this._points[i].x - this._points[i].lineWidth / 2,
			this._points[i].y - this._points[i].lineWidth / 2,
			this._points[i].lineWidth,
			this._points[i].lineWidth);
		
		if (i === 0) {
			continue;
		}
		
		// Connect to previous position.
		this._preCxt.beginPath();
		// Connect top-left corners.
		this._preCxt.moveTo(this._points[i].x - this._points[i].lineWidth / 2, this._points[i].y - this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x - this._points[i - 1].lineWidth / 2, this._points[i - 1].y - this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect top-right corners.
		this._preCxt.moveTo(this._points[i].x + this._points[i].lineWidth / 2, this._points[i].y - this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x + this._points[i - 1].lineWidth / 2, this._points[i - 1].y - this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect bottom-right corners.
		this._preCxt.moveTo(this._points[i].x + this._points[i].lineWidth / 2, this._points[i].y + this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x + this._points[i - 1].lineWidth / 2, this._points[i - 1].y + this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect bottom-left corners.
		this._preCxt.moveTo(this._points[i].x - this._points[i].lineWidth / 2, this._points[i].y + this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x - this._points[i - 1].lineWidth / 2, this._points[i - 1].y + this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		this._preCxt.closePath();
		this._preCxt.fill();
	}
	
	// The eraser is always pixel-perfect regardless of the anti-alias setting.
	this._deAntiAlias(Utils.colorToRGB(this._fillColor));
	
	this._canvasDirty = false;
};
/**
 * @override
 * Clear the list of points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
EraserTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.apply(this, arguments);
	delete this._points;
};

/**
 * @static
 * Return the CSS value for the eraser tool cursor.
 * @returns {String}
 */
EraserTool.getCursorCSS = function () {
	var size = parseInt(settings.get('lineWidth')) * zoomManager.level + 2;
	
	// Set the cursor size, capped at 128px.
	cursorCanvas.width = cursorCanvas.height = Math.min(128, size);
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > 128) {
		return 'crosshair';
	}
	
	cursorCxt.lineWidth = 1;
	cursorCxt.strokeStyle = 'black';
	cursorCxt.fillStyle = settings.get('fillColor');
	cursorCxt.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);
	cursorCxt.strokeRect(0, 0, cursorCanvas.width, cursorCanvas.height);
	
	var cursorDataURL = cursorCanvas.toDataURL();
	
	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', default'; // Fallback
	
	return cursorCSS;
};

/**
 * Create a new FloodFillTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function FloodFillTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend FloodFillTool.
FloodFillTool.prototype = Object.create(Tool.prototype);
FloodFillTool.prototype.constructor = FloodFillTool;

/**
 * @private
 * Fill the canvas, starting at (startX,startY).
 * @param {Number} startX - The x-coordinate of the fill's starting point
 * @param {Number} startY - The y-coordinate of the fill's starting point
 */
FloodFillTool.prototype._fill = function (startX, startY) {
	if (this._filling) {
		return;
	}
	
	this._filling = true;
	progressSpinner.show();
	
	// Get the pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the starting position and add it to the stack.
	var pixelPos = (startY * this._imageData.width + startX) * 4,
		pixelStack = [[startX, startY]];
	// Get the color of the clicked pixel.
	this._startColor = {
		r: this._imageData.data[pixelPos],
		g: this._imageData.data[pixelPos + 1],
		b: this._imageData.data[pixelPos + 2]
	};
	
	// Quit if the clicked pixel is already the correct color.
	if (this._fillColor.r === this._startColor.r &&
			this._fillColor.g === this._startColor.g &&
			this._fillColor.b === this._startColor.b) {
		this._filling = false;
		progressSpinner.hide();
		return;
	}
	
	while (pixelStack.length > 0) {
		var pos = pixelStack.pop(),
			x = pos[0],
			y = pos[1];
		
		pixelPos = (y * this._imageData.width + x) * 4;
		while (y-- >= 0 && this._checkColorMatch(pixelPos)) {
			pixelPos -= this._imageData.width * 4;
		}
		pixelPos += this._imageData.width * 4;
		y++;
		
		var rightPixel = false,
			leftPixel = false;
		while (y++ < this._imageData.height - 1 && this._checkColorMatch(pixelPos)) {
			this._colorPixel(pixelPos);
			if (x > 0) {
				if (this._checkColorMatch(pixelPos - 4)) {
					if (!leftPixel) {
						pixelStack.push([x - 1, y]);
						leftPixel = true;
					}
				} else {
					leftPixel = false;
				}
			}
			if (x < this._imageData.width - 1) {
				if (this._checkColorMatch(pixelPos + 4)) {
					if (!rightPixel) {
						pixelStack.push([x + 1, y]);
						rightPixel = true;
					}
				} else {
					rightPixel = false;
				}
			}
			pixelPos += canvas.width * 4;
		}
	}
	
	this._cxt.putImageData(this._imageData, 0, 0);
	
	this._filling = false;
	progressSpinner.hide();
};

/**
 * @private
 * Check whether the pixel at a given position as the same color as the first pixel clicked.
 * @param {Number} pixelPos - The index of the pixel to be checked in the image data array
 * @returns {Boolean}
 */
FloodFillTool.prototype._checkColorMatch = function (pixelPos) {
	var r = this._imageData.data[pixelPos],
		g = this._imageData.data[pixelPos + 1],
		b = this._imageData.data[pixelPos + 2];

	if (r === this._startColor.r &&
			g === this._startColor.g &&
			b === this._startColor.b) {
		return true;
	}
	return false;
};

/**
 * @private
 * Change the color of a given pixel to the filling color.
 * @param {Number} pixelPos - The index of the pixel to be colored in the image data array
 */
FloodFillTool.prototype._colorPixel = function (pixelPos) {
	this._imageData.data[pixelPos] = this._fillColor.r;
	this._imageData.data[pixelPos + 1] = this._fillColor.g;
	this._imageData.data[pixelPos + 2] = this._fillColor.b;
};

/**
 * @override
 * Handle the flood fill tool becoming the active tool.
 */
FloodFillTool.prototype.activate = function () {
	this._filling = false;
	this._imageData = [];
	this._startColor = {};
	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/paint_bucket.cur), default';
	
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.drawToolOptions);
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableFillOnly();
	});
};

/**
 * @override
 * Handle the flood fill being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FloodFillTool.prototype.start = function (pointerState) {
	if (pointerState.button !== 2) {
		this._fillColor = Utils.colorToRGB(settings.get('lineColor'));
	} else {
		this._fillColor = Utils.colorToRGB(settings.get('fillColor'));
	}
	
	this._fill(Math.floor(pointerState.x), Math.floor(pointerState.y));
	undoStack.addState();
};

/**
 * Create a new EyedropperTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function EyedropperTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend Tool.
EyedropperTool.prototype = Object.create(Tool.prototype);
EyedropperTool.prototype.constructor = EyedropperTool;

/**
 * @override
 * Handle the eyedropper tool becoming the active tool.
 */
EyedropperTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'url(images/cursors/eyedropper.cur), default';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
EyedropperTool.prototype.start = function (pointerState) {
	this._button = pointerState.button;
	this.move(pointerState);
};

/**
 * @override
 * Collect the color under the cursor as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
EyedropperTool.prototype.move = function (pointerState) {
	// Get the image's pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the cursor position and add it to the stack.
	this._floorPointerState(pointerState);
	var pixelPos = (pointerState.y * this._imageData.width + pointerState.x) * 4;
	// Get the color of the clicked pixel.
	var color = ColorPicker.rgb2hex({
		r: this._imageData.data[pixelPos],
		g: this._imageData.data[pixelPos + 1],
		b: this._imageData.data[pixelPos + 2]
	});
	
	// Update the line or fill color with the user's selection.
	if (this._button === 0) {
		settings.set('lineColor', color);
		document.getElementById('colors').style.borderColor = color;
	} else if (this._button === 2) {
		settings.set('fillColor', color);
		document.getElementById('colors').style.backgroundColor = color;
	}
};

/**
 * Create a new SelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function SelectionTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	this._outline = new FloatingRegion();
	
	this._toolbar = toolbar.toolboxes.floatingSelectionToolbar;
}
// Extend Tool.
SelectionTool.prototype = Object.create(Tool.prototype);
SelectionTool.prototype.constructor = SelectionTool;

// Define constants.
/** @constant {Number} The minimum x-coordinate for the floating selection toolbar, relative to the canvas */
SelectionTool.prototype.TOOLBAR_MIN_X = -8;
/** @constant {Number} The minimum y-coordinate for the floating selection toolbar, relative to the canvas */
SelectionTool.prototype.TOOLBAR_MIN_Y = -68;
/** @constant {Number} The x-offset of the floating selection toolbar from the selection's left side */
SelectionTool.prototype.TOOLBAR_OFFSET_X = 8;
/** @constant {Number} The y-offset of the floating selection toolbar from the selection's top side */
SelectionTool.prototype.TOOLBAR_OFFSET_Y = -68;

/**
 * @override
 * Handle the selection tool becoming the active tool.
 */
SelectionTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	// Update the outline in case the existing tool is being reactivated.
	this._updateSelectionUI();
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.selectToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
SelectionTool.prototype.start = function (pointerState) {
	this._roundPointerState(pointerState);
	
	// Hide the selection toolbar while creating/moving.
	this._toolbar.hide();
	
	if (this._outline.drag) {
		// If the selection is being dragged, handle that.
		if (pointerState.ctrlKey) {
			// If the Ctrl key is pressed, save a copy of the selection.
			this._saveSelection();
			this._selection.firstMove = false;
		}
		if (this._outline.drag.type === 'move') {
			// Hide the outline while moving.
			this._outline.hide();
			this._preCxt.canvas.style.cursor = 'move';
		} else {
			this._preCxt.canvas.style.cursor = this._outline.drag.type + '-resize';
		}
	} else {
		// Otherwise, save any existing selection...
		this._saveSelection();
		// ...and start a new selection.
		this._selection = {
			pointerStart: {
				x: pointerState.x,
				y: pointerState.y
			},
			initial: {
				x: pointerState.x,
				y: pointerState.y,
				width: 0,
				height: 0
			},
			content: {},
			// The fill color should remain the same for this selection even if the PaintZ fill color changes.
			fillColor: settings.get('fillColor'),
			firstMove: true,
			transformed: false
		};
		// Hide resize handles while creating.
		this._outline.interactable =
			this._outline.showHandles = false;
		this._outline.x = pointerState.x;
		this._outline.y = pointerState.y;
		this._outline.width = 0;
		this._outline.height = 0;
		this._outline.addToDOM();
	}
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	
	this._roundPointerState(pointerState);
	
	if (this._outline.drag) {
		this._outline.handleDragMove(pointerState);
		if (this._outline.drag.type === 'move') {
			this._updateSelectionContentToOutline();
			this._canvasDirty = true;
		}
	} else {
		// If nothing is being dragged, this is a new selection.
		// Limit the region to the canvas.
		pointerState.x = Utils.constrainValue(pointerState.x, 0, this._cxt.canvas.width);
		pointerState.y = Utils.constrainValue(pointerState.y, 0, this._cxt.canvas.height);
		
		this._selection.initial.width = pointerState.x - this._selection.pointerStart.x;
		this._selection.initial.height = pointerState.y - this._selection.pointerStart.y;
		
		// Keep x and y at the top-left corner of the selection.
		if (this._selection.initial.width < 0) {
			this._selection.initial.x = this._selection.pointerStart.x + this._selection.initial.width;
			this._selection.initial.width = Math.abs(this._selection.initial.width);
		}
		if (this._selection.initial.height < 0) {
			this._selection.initial.y = this._selection.pointerStart.y + this._selection.initial.height;
			this._selection.initial.height = Math.abs(this._selection.initial.height);
		}
		
		// Perfect square when shift key held.
		if (pointerState.shiftKey) {
			if (this._selection.initial.width < this._selection.initial.height) {
				this._selection.initial.height = this._selection.initial.width;
				if (this._selection.initial.y === pointerState.y) {
					this._selection.initial.y = this._selection.pointerStart.y - this._selection.initial.height;
				}
			} else {
				this._selection.initial.width = this._selection.initial.height;
				if (this._selection.initial.x === pointerState.x) {
					this._selection.initial.x = this._selection.pointerStart.x - this._selection.initial.width;
				}
			}
		}
		
		this._outline.x = this._selection.initial.x;
		this._outline.y = this._selection.initial.y;
		this._outline.width = this._selection.initial.width;
		this._outline.height = this._selection.initial.height;
	}
};

/**
 * @override
 * Update the canvas if necessary.
 */
SelectionTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	if (!this._selection) {
		return;
	}
	
	this.redrawSelection();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.end = function (pointerState) {
	
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	if (!this._selection) {
		return;
	}
	
	this._roundPointerState(pointerState);
	
	this.move(pointerState);
	
	if (this._outline.drag) {
		// If there is outline drag data, tell the floating region to
		// finish, and then update the image data.
		this._outline.handleDragEnd();
		this._updateSelectionContentToOutline();
		this._outline.show();
	} else {
		// Otherwise, a new selection was created.
		
		if (this._selection.initial.width === 0 || this._selection.initial.height === 0) {
			// If either dimension is zero, the selection is invalid.
			this.deselectAll();
			return;
		}
		
		// Set the current content dimensions to the initial dimensions.
		this._selection.content.x = this._selection.initial.x;
		this._selection.content.y = this._selection.initial.y;
		this._selection.content.width = this._selection.initial.width;
		this._selection.content.height = this._selection.initial.height;
		
		// Save the selected content in case the user moves it.
		this._selection.content.opaqueData = this._cxt.getImageData(
			this._selection.content.x, this._selection.content.y,
			this._selection.content.width, this._selection.content.height);
		
		// Make the selection transparent if the setting is enabled.
		// This creates `this._selection.content.data` whether or not transparency is enabled.
		this.setTransparentBackground();
		
		delete this._selection.pointerStart;
		
		// Show resize handles once done creating.
		this._outline.interactable =
			this._outline.showHandles = true;
	}
	
	// Redraw the selection one last time.
	this.redrawSelection();
	
	if (this._selection) {
		// Show selection toolbar once done creating/moving if there is an active selection.
		this._toolbar.show();
	}
};

/**
 * @override
 * Clean up when the selection tool is no longer the active tool.
 */
SelectionTool.prototype.deactivate = function () {
	this._saveSelection();
	this.deselectAll();
};


/**
 * Delete the currently selected content.
 */
SelectionTool.prototype.clear = function () {
	// Quit if there is no selection to erase.
	if (!this._selection) {
		return;
	}
	
	// Draw the selection start cover to the main canvas if this is not a duplicate.
	if (this._selection.firstMove) {
		Utils.clearCanvas(this._preCxt);
		this._drawSelectionStartCover();
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	}
	
	this.deselectAll();
	
	undoStack.addState();
};

/**
 * Copy the current selection to the clipboard.
 * @returns {Promise} Resolves when the selection has been copied, rejects if the selection is unable to copy
 */
SelectionTool.prototype.copy = function () {
	// Quit if there is no selection to copy.
	if (!this._selection) {
		return;
	}
	
	return new Promise((function (resolve, reject) {
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.content.width;
		cursorCanvas.height = this._selection.content.height;
		cursorCxt.putImageData(this._selection.content.opaqueData, 0, 0);
		
		cursorCanvas.toBlob(function (blob) {
			var copySuccess = clipboard.copy(blob);
			if (copySuccess) {
				resolve();
			} else {
				reject();
			}
		}, 'image/png');
	}).bind(this));
};

/**
 * Copy and erase the current selection.
 */
SelectionTool.prototype.cut = function () {
	// Quit if there is no selection to cut.
	if (!this._selection) {
		return;
	}
	
	this.copy()
		.then((function () {
			this.clear();
		}).bind(this));
};

/**
 * Drop the current selection and create a duplicate at (0,0).
 */
SelectionTool.prototype.duplicate = function () {
	// Quit if there is no selection to duplicate.
	if (!this._selection) {
		return;
	}
	
	// Stamp the selection at its current location.
	this._saveSelection();
	
	// There is no starting region to cover.
	this._selection.firstMove = false;
	
	// Move the selection to (the top-left corner of the visible canvas).
	this._selection.content.x = Math.floor(window.scrollX / zoomManager.level);
	this._selection.content.y = Math.floor(window.scrollY / zoomManager.level);
	this._drawSelectionContent();
	this._updateSelectionUI();
};

/**
 * Select the entire canvas.
 * @param {Number} width - The width of the canvas
 * @param {Number} height - The height of the canvas
 */
SelectionTool.prototype.selectAll = function (width, height) {
	this.start({x: 0, y: 0});
	this.move({x: width, y: height});
	this.end({x: width, y: height});
	this._updateSelectionUI();
};

/**
 * Deselect whatever is currently selected.
 */
SelectionTool.prototype.deselectAll = function () {
	if (this._selection) {
		delete this._selection;
	}
	Utils.clearCanvas(this._preCxt);
	this._toolbar.hide();
	this._outline.removeFromDOM();
};

/**
 * Crop the image to only contain the current selection.
 */
SelectionTool.prototype.cropToSelection = function () {
	if (!this._selection) {
		// If there is no selection to crop to, then just quit.
		return;
	}
	
	// Resize the main canvas to the selection size and draw the selection to it.
	settings.set('width', this._selection.content.width);
	settings.set('height', this._selection.content.height);
	this._cxt.putImageData(this._selection.content.data, 0, 0);
	
	// Fill in any empty pixels with the background color.
	this._cxt.save();
	this._cxt.globalCompositeOperation = 'destination-over';
	this._cxt.fillStyle = this._selection.fillColor;
	this._cxt.fillRect(0, 0, this._selection.content.width, this._selection.content.height);
	this._cxt.restore();
	
	// Save the new state.
	undoStack.addState();
	
	// Clear the selection.
	this.deselectAll();
};

/**
 * Invert the colors of the selection.  If there is no selection, invert the colors of the entire canvas.
 */
SelectionTool.prototype.invertColors = function () {
	if (this._selection) {
		this._preCxt.save();
		cursorCxt.save();
		
		// Copy the selection content to the cursor canvas because you
		// cannot put image data with composite modes.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.content.width;
		cursorCanvas.height = this._selection.content.height;
		cursorCxt.putImageData(this._selection.content.opaqueData, 0, 0);
		
		// Invert the selection on the pre-canvas.
		this._preCxt.putImageData(
			this._selection.content.opaqueData,
			this._selection.content.x,
			this._selection.content.y);
		this._preCxt.globalCompositeOperation = 'difference';
		this._preCxt.fillStyle = '#ffffff';
		this._preCxt.fillRect(
			this._selection.content.x, this._selection.content.y,
			this._selection.content.width, this._selection.content.height);
		
		// Re-mask to the shape of the selection.
		this._preCxt.globalCompositeOperation = 'destination-in';
		this._preCxt.drawImage(
			cursorCanvas,
			this._selection.content.x,
			this._selection.content.y);
		
		// Set the re-masked image data as the selection content.
		this._selection.content.opaqueData = this._preCxt.getImageData(
			this._selection.content.x, this._selection.content.y,
			this._selection.content.width, this._selection.content.height);
		
		// Reapply background color transparency on the new colors.
		this.setTransparentBackground();
		
		// Redraw now that transparency has been reapplied.
		this.redrawSelection();
		
		// Note the selection was altered.
		this._selection.transformed = true;
		
		// Restore canvas states.
		this._preCxt.restore();
		cursorCxt.restore();
	} else {
		// Invert the whole canvas.
		this._cxt.save();
		this._cxt.globalCompositeOperation = 'difference';
		this._cxt.fillStyle = '#ffffff';
		this._cxt.fillRect(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
		this._cxt.restore();
		
		// Save the new state.
		undoStack.addState();
	}
};

/**
 * Flip the selection over its center.  If there is no selection, flip the entire canvas.
 * @param {Boolean} vertical - True if vertical, false if horizontal
 */
SelectionTool.prototype.flip = function (vertical) {
	if (this._selection) {
		// Copy the selection to the cursor canvas.
		// The data needs to be put in a canvas because putImageData ignores transformations.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.content.width;
		cursorCanvas.height = this._selection.content.height;
		cursorCxt.putImageData(this._selection.content.opaqueData, 0, 0);
		
		// Flip the pre-canvas and draw the selection to it.
		Utils.clearCanvas(this._preCxt);
		this._preCxt.save();
		this._preCxt.translate(
			vertical ? 0 : this._selection.content.width,
			vertical ? this._selection.content.height : 0);
		this._preCxt.scale(
			vertical ? 1 : -1,
			vertical ? -1 : 1);
		this._preCxt.drawImage(cursorCanvas, 0, 0);
		this._preCxt.restore();
		
		// Save that as the new selection.
		this._selection.content.opaqueData = this._preCxt.getImageData(
			0, 0,
			this._selection.content.width, this._selection.content.height);
		
		// Reapply transparency.
		this.setTransparentBackground();
		
		// Note the selection was flipped.
		this._selection.transformed = true;
		
		// Put the updated selection back in place.
		this.redrawSelection();
		
	} else {
		// If there is no selection, flip the main canvas, and draw it to itself.
		this._cxt.save();
		this._cxt.translate(
			vertical ? 0 : this._cxt.canvas.width,
			vertical ? this._cxt.canvas.height : 0);
		this._cxt.scale(
			vertical ? 1 : -1,
			vertical ? -1 : 1);
		this._cxt.drawImage(this._cxt.canvas, 0, 0);
		this._cxt.restore();
		// Save the flipped image as a new undo state.
		undoStack.addState();
	}
};

/**
 * Rotate the selection about its center.  If there is no selection, rotate the entire canvas.
 * @param {Boolean} clockwise - True if clockwise, false if counterclockwise
 */
SelectionTool.prototype.rotate = function (clockwise) {
	if (this._selection) {
		// Copy the selection to the cursor canvas.
		// The data needs to be put in a canvas because putImageData ignores transformations.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.content.width;
		cursorCanvas.height = this._selection.content.height;
		cursorCxt.putImageData(this._selection.content.opaqueData, 0, 0);
		
		// Rotate the pre-canvas and draw the selection to it.
		this._preCxt.canvas.width =
			this._preCxt.canvas.height = Math.max(this._selection.content.width, this._selection.content.height);
		this._preCxt.save();
		this._preCxt.translate(
			this._selection.content.height / 2,
			this._selection.content.width / 2);
		this._preCxt.rotate(
			(clockwise ? 0.25 : -0.25) * Math.TAU);
		this._preCxt.drawImage(
			cursorCanvas,
			-this._selection.content.width / 2,
			-this._selection.content.height / 2);
		this._preCxt.restore();
		
		// Save that as the new selection.
		this._selection.content.opaqueData = this._preCxt.getImageData(
			0, 0,
			this._selection.content.height, this._selection.content.width);
		
		// Reapply transparency.
		this.setTransparentBackground();
		
		// Update the selection's width and height, and note that the selection was flipped.
		var oldSelectionWidth = this._selection.content.width;
		this._selection.content.width = this._selection.content.height;
		this._selection.content.height = oldSelectionWidth;
		this._selection.transformed = true;
		
		// Put the updated selection back in place.
		this._preCxt.canvas.width = this._cxt.canvas.width;
		this._preCxt.canvas.height = this._cxt.canvas.height;
		
		// Redraw.
		this.redrawSelection();
		
	} else {
		// If there is no selection, rotate the entire canvas.
		this._preCxt.canvas.width =
			this._preCxt.canvas.height = Math.max(this._cxt.canvas.width, this._cxt.canvas.height);
		this._preCxt.save();
		this._preCxt.translate(
			this._cxt.canvas.height / 2,
			this._cxt.canvas.width / 2);
		this._preCxt.rotate(
			(clockwise ? 0.25 : -0.25) * Math.TAU);
		this._preCxt.drawImage(
			this._cxt.canvas,
			-this._cxt.canvas.width / 2,
			-this._cxt.canvas.height / 2);
		this._preCxt.restore();
		
		// Update the canvas's width and height.
		var oldCanvasWidth = this._cxt.canvas.width,
			oldCanvasHeight = this._cxt.canvas.height;
		this._cxt.canvas.width = oldCanvasHeight;
		this._cxt.canvas.height = oldCanvasWidth;
		
		// Draw the rotated image and save it as a new undo state.
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
		undoStack.addState();
		
		// Save the new width and height.
		settings.set('width', oldCanvasHeight);
		settings.set('height', oldCanvasWidth);
		
		// Clear the precanvas.
		Utils.clearCanvas(preCxt);
	}
};

/**
 * Move the selection by the amount.  Ignore the nudge if the selection is being dragged.
 * @param {Number} deltaX - The amount to nudge the selection horizontally
 * @param {Number} deltaY - The amount to nudge the selection vertically
 */
SelectionTool.prototype.nudge = function (deltaX, deltaY) {
	if (!this._selection || this._outline.drag) {
		// Quit if there is no selection, or if it is currently being dragged.
		return;
	}
	
	this._selection.content.x = Utils.constrainValue(
		Math.round(this._selection.content.x + deltaX),
		-this._selection.content.width,
		this._cxt.canvas.width);
	this._selection.content.y = Utils.constrainValue(
		Math.round(this._selection.content.y + deltaY),
		-this._selection.content.height,
		this._cxt.canvas.height);
	
	this.redrawSelection();
};

/**
 * Set whether the background color in the selection should be transparent.
 */
SelectionTool.prototype.setTransparentBackground = function () {
	if (!this._selection) {
		return;
	}
	
	var transparencyOn = settings.get('transparentSelection'),
		selectionImageData = Utils.cloneImageData(this._selection.content.opaqueData, this._preCxt),
		selectionData = selectionImageData.data;
	
	if (transparencyOn) {
		var bgColor = Utils.colorToRGB(settings.get('fillColor'));
		
		// Check every pixel in the selection.
		for (var i = 0; i < selectionData.length; i += 4) {
			// Check whether the current pixel matches the current background color.
			var colorMatch = (selectionData[i] === bgColor.r &&
					selectionData[i + 1] === bgColor.g &&
					selectionData[i + 2] === bgColor.b);
			
			if (colorMatch) {
				selectionData[i + 3] = 0;
			}
		}
	}
	
	// Save the modified (or unmodified) content as the current content and redraw it.
	this._selection.content.data = selectionImageData;
	this._canvasDirty = true;
};

/**
 * @private
 * Redraw the selection and its outline with its current state.
 */
SelectionTool.prototype.redrawSelection = function () {
	Utils.clearCanvas(this._preCxt);
	this._drawSelectionContent();
	this._updateSelectionUI();
};

/**
 * @private
 * Update the outline element.
 */
SelectionTool.prototype._updateSelectionUI = function () {
	if (!this._selection) {
		return;
	}
	
	var zoomedX = Math.floor(zoomManager.level * this._selection.content.x),
		zoomedY = Math.floor(zoomManager.level * this._selection.content.y);
	
	this._toolbar.x = Math.max(this.TOOLBAR_MIN_X, zoomedX + this.TOOLBAR_OFFSET_X);
	this._toolbar.y = Math.max(this.TOOLBAR_MIN_Y, zoomedY + this.TOOLBAR_OFFSET_Y);
	
	this._outline.x = this._selection.content.x;
	this._outline.y = this._selection.content.y;
	this._outline.width = this._selection.content.width;
	this._outline.height = this._selection.content.height;
};

/**
 * @private
 * Update the selection to the position and size of the floating region.
 */
SelectionTool.prototype._updateSelectionContentToOutline = function () {
	var wasResized = (this._selection.content.width !== this._outline.width ||
			this._selection.content.height !== this._outline.height)
	if (wasResized) {
		this._resizeSelectionContentToOutline();
		// If it was resized, note it was transformed—even if it is returned
		// to its initial size, it could have lost data (consistent with MS Paint).
		this._selection.transformed = true;
	}
	
	this._selection.content.x = this._outline.x;
	this._selection.content.y = this._outline.y;
	this._selection.content.width = this._outline.width;
	this._selection.content.height = this._outline.height;
};

/**
 * @private
 * Scale the selection image data to the size of the floating region.
 */
SelectionTool.prototype._resizeSelectionContentToOutline = function () {
	// Draw the current selection content to the off-screen canvas.
	cursorCanvas.width = this._selection.content.width;
	cursorCanvas.height = this._selection.content.height;
	cursorCxt.putImageData(this._selection.content.opaqueData, 0, 0);
	
	// Draw it back to the precanvas, resized.
	Utils.clearCanvas(this._preCxt);
	this._preCxt.drawImage(
		cursorCanvas,
		this._outline.x, this._outline.y,
		this._outline.width, this._outline.height);
	
	// Save that as the new selection.
	this._selection.content.opaqueData = this._preCxt.getImageData(
		this._outline.x, this._outline.y,
		this._outline.width, this._outline.height);
	
	// Reapply transparency.
	this.setTransparentBackground();
};

/**
 * @private
 * Draw the selected content in its new location and the background color over its former location.
 */
SelectionTool.prototype._drawSelectionContent = function () {
	if (!this._selection || !this._selection.content.data) {
		return;
	}
	
	this._preCxt.putImageData(
		this._selection.content.data,
		this._selection.content.x,
		this._selection.content.y);
	if (this._selection.firstMove) {
		// If this is not a duplicate, draw the background color over where the selection was taken from.
		this._preCxt.save();
		this._preCxt.globalCompositeOperation = 'destination-over';
		this._drawSelectionStartCover();
		this._preCxt.restore();
	}
};

/**
 * @private
 * Draw the background color over the selection's starting location.
 */
SelectionTool.prototype._drawSelectionStartCover = function () {
	this._preCxt.fillStyle = this._selection.fillColor;
	this._preCxt.fillRect(
		this._selection.initial.x, this._selection.initial.y,
		this._selection.initial.width, this._selection.initial.height);
};

/**
 * @private
 * Save the selection to the canvas if it was moved.
 */
SelectionTool.prototype._saveSelection = function () {
	Utils.clearCanvas(this._preCxt);
	
	var selectionExistsAndWasTransformed = (
		this._selection &&
		this._selection.content.data && (
			this._selection.transformed ||
			this._selection.content.x !== this._selection.initial.x ||
			this._selection.content.y !== this._selection.initial.y));
	if (!selectionExistsAndWasTransformed) {
		// If there is no selection or the selection was never
		// transformed, there is no need to save.
		return;
	}
	
	this._drawSelectionContent();
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};

/**
 * Create a new FreeformSelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function FreeformSelectionTool(cxt, preCxt) {
	SelectionTool.call(this, cxt, preCxt);
}
// Extend SelectionTool.
FreeformSelectionTool.prototype = Object.create(SelectionTool.prototype);
FreeformSelectionTool.prototype.constructor = FreeformSelectionTool;

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FreeformSelectionTool.prototype.start = function (pointerState) {
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.start.call(this, pointerState);
		return;
	}
	
	// If nothing is being dragged, start a new selection.
	
	this._roundPointerState(pointerState);
	
	// Hide the selection toolbar while creating.
	this._toolbar.hide();
	
	// Save any existing selection...
	this._saveSelection();
	// ...and start the new selection.
	this._selection = {
		minX: pointerState.x,
		minY: pointerState.y,
		maxX: pointerState.x,
		maxY: pointerState.y,
		points: [
			{
				x: pointerState.x,
				y: pointerState.y
			}
		],
		initial: {},
		content: {},
		// The fill color should remain the same for this selection even if the PaintZ fill color changes.
		fillColor: settings.get('fillColor'),
		firstMove: true,
		transformed: false
	};
};

/**
 * @override
 * Update the selection region the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.move.call(this, pointerState);
		return;
	}
	
	// If nothing is being dragged, this is a new selection.
	
	this._roundPointerState(pointerState);
	
	// Limit the region to the canvas.
	pointerState.x = Utils.constrainValue(pointerState.x, 0, this._cxt.canvas.width);
	pointerState.y = Utils.constrainValue(pointerState.y, 0, this._cxt.canvas.height);
	
	this._selection.points.push({
		x: pointerState.x,
		y: pointerState.y
	});
	
	if (pointerState.x < this._selection.minX) {
		this._selection.minX = pointerState.x;
	}
	if (pointerState.y < this._selection.minY) {
		this._selection.minY = pointerState.y;
	}
	if (pointerState.x > this._selection.maxX) {
		this._selection.maxX = pointerState.x;
	}
	if (pointerState.y > this._selection.maxY) {
		this._selection.maxY = pointerState.y;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
FreeformSelectionTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.update.call(this);
		return;
	}
	
	// If nothing is being dragged, this is a new selection.
	
	this._preCxt.save();
	// Draw the outline.
	this._preCxt.lineWidth = 1;
	this._preCxt.lineJoin = 'round';
	Utils.createPath(this._preCxt, this._selection.points);
	this._preCxt.stroke();
	
	// Fill in the line with the color-inverted drawing.
	this._preCxt.globalCompositeOperation = 'source-in';
	Utils.drawCanvasInvertedToPreCanvas();
	
	this._preCxt.restore();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.end = function (pointerState) {
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.end.call(this, pointerState);
		return;
	}
	
	// If nothing was being dragged, a new selection was created.
	
	this._roundPointerState(pointerState);
	
	this.move(pointerState);
	
	if (this._selection.points.length < 3) {
		// If there are < 3 points, the selection is invalid.
		this.deselectAll();
		return;
	}
	
	// Update the coordinates to the top-left corner of the selection region.
	this._selection.initial.x =
		this._selection.content.x = this._selection.minX;
	this._selection.initial.y =
		this._selection.content.y = this._selection.minY;
	this._selection.initial.width =
		this._selection.content.width = this._selection.maxX - this._selection.minX;
	this._selection.initial.height = 
		this._selection.content.height = this._selection.maxY - this._selection.minY;
	
	if (this._selection.content.width === 0 || this._selection.content.height === 0) {
		// If either dimension of the bounding box is zero, the selection is invalid.
		this.deselectAll();
		return;
	}
	
	// Get the image data within the selections bounding rectangle.
	var unmaskedSelectionContent = this._cxt.getImageData(
		this._selection.content.x, this._selection.content.y,
		this._selection.content.width, this._selection.content.height);
	
	// Save the selected content using the selection start cover function to cut it to the freeform shape.
	this._selection.content.opaqueData = this._maskToSelectionPath(unmaskedSelectionContent);
	
	// Make the selection transparent if the setting is enabled.
	// This creates `this._selection.content.data` whether or not transparency is enabled.
	this.setTransparentBackground();
	
	// Redraw the selection one last time.
	this.redrawSelection();
	
	// Add the outline.
	this._updateSelectionUI();
	this._outline.addToDOM();
	
	// Show resize handles and selection toolbar once done creating.
	this._toolbar.show();
};

/**
 * @override
 * @private
 * Draw the background color over the selection's starting location.
 */
FreeformSelectionTool.prototype._drawSelectionStartCover = function () {
	this._preCxt.fillStyle = this._selection.fillColor;
	Utils.createPath(this._preCxt, this._selection.points, true);
	this._preCxt.fill();
};

/**
 * @private
 * Create the masked version of the selection content using the saved selection path.
 * @param {ImageData} imageData - The image data to mask
 * @returns {ImageData} The image data masked to the selection region
 */
FreeformSelectionTool.prototype._maskToSelectionPath = function (imageData) {
	Utils.clearCanvas(this._preCxt);
	this._preCxt.save();
	// Put the unmasked image data in the canvas.
	this._preCxt.putImageData(imageData, this._selection.initial.x, this._selection.initial.y);
	// Draw the selection shape with destination-in mode to remove all image data outside it.
	this._preCxt.globalCompositeOperation = 'destination-in';
	this._drawSelectionStartCover();
	this._preCxt.restore();
	
	// Grab the selection region from the canvas now that it has been masked.
	return this._preCxt.getImageData(
		this._selection.initial.x, this._selection.initial.y,
		this._selection.content.width, this._selection.content.height);
}
/**
 * Create a new TextTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function TextTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	
	this._textBoxActive = false;
	
	// Initialize text box element.
	this._outline = new FloatingRegion();
	this._textArea = document.createElement('p');
	this._textArea.contentEditable = true;
	this._textArea.className = 'textArea';
	this._textArea.style.lineHeight = this.LINE_HEIGHT;
	this._textArea.style.padding = this.PADDING + 'px';
	this._outline.element.appendChild(this._textArea);
	
	// Prevent selecting text moving the text box.
	this._textArea.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
	// Prevent the element scrolling if it overflows.
	this._textArea.addEventListener('scroll', function () { this.scrollTop = 0; });
	
	this._textArea.addEventListener('keydown', this._handleKeyDown.bind(this), false);
}
// Extend Tool.
TextTool.prototype = Object.create(Tool.prototype);
TextTool.prototype.constructor = TextTool;

// Define constants.
/** @constant {Number} The minimum viable text box width/height */
TextTool.prototype.MIN_SIZE = 7;
/** @constant {Number} The padding on the text box */
TextTool.prototype.PADDING = 4;
/** @constant {Number} The line height of the text box */
TextTool.prototype.LINE_HEIGHT = 1;

/**
 * @override
 * Handle the selection tool becoming the active tool.
 */
TextTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.textToolOptions);
	this.updateTextElem();
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
TextTool.prototype.start = function (pointerState) {
	this._roundPointerState(pointerState);
	
	if (this._outline.drag) {
		// If the text box is being dragged, handle that.
		if (this._outline.drag.type === 'move') {
			this._preCxt.canvas.style.cursor =
				this._textArea.style.cursor = 'move';
		} else {
			this._preCxt.canvas.style.cursor =
				this._textArea.style.cursor = this._outline.drag.type + '-resize';
		}
	} else {
		// Otherwise, save any existing text...
		this._saveText();
		// ...and start a new text box.
		this._pointerStart = {
			x: pointerState.x,
			y: pointerState.y
		};
		this._textArea.innerHTML = '';
		// Hide resize handles while creating.
		this._outline.interactable =
			this._outline.showHandles = false;
		this._outline.x = pointerState.x;
		this._outline.y = pointerState.y;
		this._outline.width = 0;
		this._outline.height = 0;
		this.updateTextElem();
		this._outline.addToDOM();
		this._textBoxActive = true;
	}
	
	// Strip formatting on paste, if possible.
	this._pasting = false;
	var that = this;
	this._textArea.addEventListener('paste', function (e) {
		// Prevent recursion.
		if (!that._pasting) {
			if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				var pastedText = e.originalEvent.clipboardData.getData('text/plain');
				document.execCommand('insertText', false, pastedText);
			} else if (e.clipboardData && e.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				var pastedText = e.clipboardData.getData('text/plain');
				document.execCommand('insertText', false, pastedText);
			} else if (window.clipboardData && window.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				window.document.execCommand('ms-pasteTextOnly', false);
			}
		}
		that.pasting = false;
	}, false);
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
TextTool.prototype.move = function (pointerState) {
	if (!this._textBoxActive) {
		return;
	}
	
	this._roundPointerState(pointerState);
	
	Utils.clearCanvas(this._preCxt);
	
	if (this._outline.drag) {
		this._outline.handleDragMove(pointerState);
	} else {
		// If nothing is being dragged, this is a new text box.
		// Limit the box to the canvas.
		pointerState.x = Math.max(0, Math.min(this._cxt.canvas.width, pointerState.x));
		pointerState.y = Math.max(0, Math.min(this._cxt.canvas.height, pointerState.y));
		
		this._outline.width = pointerState.x - this._pointerStart.x;
		this._outline.height = pointerState.y - this._pointerStart.y;
		
		// Keep x and y at the top-left corner.
		if (this._outline.width < 0) {
			this._outline.x = this._pointerStart.x + this._outline.width;
			this._outline.width = Math.abs(this._outline.width);
		}
		if (this._outline.height < 0) {
			this._outline.y = this._pointerStart.y + this._outline.height;
			this._outline.height = Math.abs(this._outline.height);
		}
		
		// Perfect square when shift key held.
		if (pointerState.shiftKey) {
			if (this._outline.width < this._outline.height) {
				this._outline.height = this._outline.width;
				if (this._outline.y === pointerState.y) {
					this._outline.y = this._pointerStart.y - this._outline.height;
				}
			} else {
				this._outline.width = this._outline.height;
				if (this._outline.x === pointerState.x) {
					this._outline.x = this._pointerStart.x - this._outline.width;
				}
			}
		}
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
TextTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	this.updateTextElem();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
TextTool.prototype.end = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	this.move(pointerState);
	
	this._textArea.style.removeProperty('cursor');
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	if (this._outline.drag) {
		// If there is outline drag data, tell the floating region to finish.
		this._outline.handleDragEnd(pointerState);
	} else {
		// Otherwise, a new text box was created.
		
		if (this._outline.width < this.MIN_SIZE || this._outline.height < this.MIN_SIZE) {
			// If either dimension is zero, the region is invalid.
			this._removeTextElem();
			return;
		}
		
		delete this._pointerStart;
		
		// Show resize handles once done creating.
		this._outline.interactable =
			this._outline.showHandles = true;
		
		// Focus the text box.
		this._textArea.focus();
	}
};

/**
 * @override
 * Clean up when the text tool is no longer the active tool.
 */
TextTool.prototype.deactivate = function () {
	this._removeTextElem();
};

/**
 * @private
 * Generate the CSS background value based on the saved options.
 */
TextTool.prototype._getBackgroundValue = function () {
	return (settings.get('textFill') ? settings.get('fillColor') : 'transparent');
};

/**
 * @private
 * Generate the CSS font value based on the saved options.
 */
TextTool.prototype._getFontValue = function () {
	return (settings.get('italic') ? 'italic ' : '') +
		(settings.get('bold') ? 'bold ' : '') +
		settings.get('fontSize') + 'pt ' +
		settings.get('fontFamily');
};

/**
 * @private
 * Generate the CSS text-decoration value based on the saved options.
 */
TextTool.prototype._getTextDecorationValue = function () {
	return (settings.get('underline') ? 'underline ' : '') +
		(settings.get('strike') ? 'line-through ' : '');
};

/**
 * Update the text box element with the correct size and other properties.
 */
TextTool.prototype.updateTextElem = function () {
	if (!this._textBoxActive) {
		return;
	}
	
	// Tell the outline to recompute its dimensions.
	this._outline.x = this._outline.x;
	this._outline.y = this._outline.y;
	this._outline.width = this._outline.width;
	this._outline.height = this._outline.height;
	
	this._outline.element.style.background = this._getBackgroundValue();
	this._textArea.style.width = this._outline.width + 'px';
	this._textArea.style.height = this._outline.height + 'px';
	this._textArea.style.WebkitTransform = 'scale(' + zoomManager.level + ')';
	this._textArea.style.MozTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.MsTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.OTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.transform =       'scale(' + zoomManager.level + ')';
	this._textArea.style.color = settings.get('lineColor');
	this._textArea.style.font = this._getFontValue();
	this._textArea.style.textDecoration = this._getTextDecorationValue();
};

/**
 * @private
 * Remove the text box element.
 */
TextTool.prototype._removeTextElem = function () {
	// Save any existing text.
	this._saveText().then((function () {
		// Remove the text region and element.
		this._textBoxActive = false;
		this._outline.removeFromDOM();
	}).bind(this));
};

/**
 * @private
 * Save the text to the canvas.
 * @returns {Promise<Boolean>} Resolves with whether the text was saved.
 */
TextTool.prototype._saveText = function () {
	return new Promise((function (resolve, reject) {
		if (!this._textBoxActive || this._textArea.innerHTML === '') {
			resolve(false);
			return;
		}
		
		var svgData = '<svg xmlns="http://www.w3.org/2000/svg" '+
			'width="' + this._outline.width + 'px" height="' + this._outline.height + 'px">' +
				'<foreignObject width="100%" height="100%">' +
					'<p xmlns="http://www.w3.org/1999/xhtml" style="' +
							'margin: 0; ' +
							'overflow: visible; ' +
							'word-break: break-word; ' +
							'box-sizing: border-box; ' +
							'line-height: ' + this.LINE_HEIGHT + '; ' +
							'padding: ' + this.PADDING + 'px; ' +
							'width: ' + this._outline.width + 'px; ' +
							'height: ' + this._outline.height + 'px; ' +
							'background: ' + this._getBackgroundValue() + '; ' +
							'font: ' + this._getFontValue() + '; ' +
							'text-decoration: ' + this._getTextDecorationValue() + '; ' +
							'color: ' + settings.get('lineColor') + ';">' +
						this._textArea.innerHTML +
					'</p>' +
				'</foreignObject>' +
			'</svg>';
		svgData = svgData.replace(/<br>/g, '<br />'); // XML requires self-closing tags be closed, but HTML5 does not.
		svgData = svgData.replace(/&nbsp;/g, '&#xa0;'); // HTML non-breaking space entity is not defined in XML, so reference the char code directly.
		svgData = svgData.replace(/#/g, '%23'); // Escape hash for data URL.
		
		var svgImage = new Image(),
			svgURL = 'data:image/svg+xml,' + svgData;
			//svgBlob = new Blob([svgData], {type: 'image/svg+xml'}),
			//svgURL = URL.createObjectURL(svgBlob);
		
		// Prevent the canvas becoming “tainted”.
		svgImage.crossOrigin = 'anonymous';
		
		// Save coordinates since the text region can be deleted by _removeTextElem before the image loads.
		var textX = this._outline.x,
			textY = this._outline.y;
		
		svgImage.onload = (function () {
			// Draw the text image to the canvas.
			this._cxt.drawImage(svgImage, textX, textY);
			// Revoke the temporary blob URL.
			//URL.revokeObjectURL(svgURL);
			// Clean up.
			Utils.clearCanvas(this._preCxt);
			undoStack.addState();
			
			resolve(true);
		}).bind(this);
		
		svgImage.src = svgURL;
	}).bind(this));
};

/**
 * @private
 * Handle keyboard shortcuts within the text box.
 * @param {KeyboardEvent} e
 */
TextTool.prototype._handleKeyDown = function (e) {
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl,
		noModifiers = !Utils.checkModifierKeys(e);
	
	e.stopPropagation();
	
	switch (e.keyCode) {
		case 13: // Enter
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+Enter => Rasterize text
				
				this._removeTextElem();
			}
			break;
		
		case 27: // Esc
			if (noModifiers) {
				e.preventDefault();
				// Esc => Cancel text box
				
				// Clear the text box, then remove it.
				this._textArea.innerHTML = '';
				this._removeTextElem();
			}
			break;
		
		case 48: // 0
		case 96: // Numpad 0
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+0 => Zoom 100%
				zoomManager.level = 1;
			}
			break;
		
		case 53: // 5
			if (e.altKey && e.shiftKey && !ctrlOrCmd && !metaOrControl) {
				e.preventDefault();
				// Alt+Shift+5 => Strikethrough
				
				settings.set('strike', !settings.get('strike'));
				toolbar.toolboxes.textToolOptions.strikeToggle.checked = settings.get('strike');
			}
			break;
		
		case 66: // B
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+B => Bold
				
				settings.set('bold', !settings.get('bold'));
				toolbar.toolboxes.textToolOptions.boldToggle.checked = settings.get('bold');
			}
			break;
		
		case 67: // C
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+C => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('C')) {
					e.preventDefault();
				}
			}
			break;
		
		case 69: // E
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+E => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('E')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+E => Resize dialog
				dialogs.resize.open();
			}
			break;
		
		case 70: // F
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+F => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('F')) {
					e.preventDefault();
				}
			}
			break;
		
		case 72: // H
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+H => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('H')) {
					e.preventDefault();
				}
			}
			break;
		
		case 73: // I
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+I => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('I')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+I => Italic
				
				settings.set('italic', !settings.get('italic'));
				toolbar.toolboxes.textToolOptions.italicToggle.checked = settings.get('italic');
			}
			break;
		
		case 78: // N
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Shift+N => Clear canvas (no confirmation)
				// TODO: Make this not access ClearDialog private method.
				dialogs.clear._clear();
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+N => Clear (new image)
				dialogs.clear.open();
			}
			break;
		
		case 79: // O
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+O => Open
				document.getElementById('upload').click();
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				// Ctrl+S => Prevent saving while editing text
				e.preventDefault();
			}
			break;
		
		case 84: // T
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+T => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('T')) {
					e.preventDefault();
				}
			}
			break;
		
		case 85: // U
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+U => Underline
				
				settings.set('underline', !settings.get('underline'));
				toolbar.toolboxes.textToolOptions.underlineToggle.checked = settings.get('underline');
			}
			break;
		
		case 86: // V
			if (ctrlOrCmd && e.altKey && !e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+V => Paste from...
				document.getElementById('pasteFrom').click();
			} else if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+V => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('V')) {
					e.preventDefault();
				}
			}
			break;
		
		case 89: // Y
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+Y => Win7 Paint Help button
				if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
					dialogs.help.open();
				}
			}
			break;
		
		case 112: // F1
			if (noModifiers) {
				e.preventDefault();
				// F1 => Open help dialog
				dialogs.help.open();
			}
			break;
		
		case 122: // F11
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+F11 => Full screen
				toolbar.toolboxes.app.attemptFullScreen();
			}
			break;
		
		case 187: // =/+
		case 107: // Numpad +
			if (ctrlOrCmd && e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+= => Zoom in
				zoomManager.zoomIn();
			}
			break;
		
		case 189: // -/_
		case 109: // Numpad -
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+- => Zoom out
				zoomManager.zoomOut();
			}
			break;
		
		case 191: // //?
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+? => Keyboard shortcuts dialog
				dialogs.keyboard.open();
			} else if (ctrlOrCmd && e.altKey && e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+Shift+? => MS Paint access key help dialog
				dialogs.msAccessKeyHelp.open();
			}
			break;
	}
};

/**
 * Create a new PanTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function PanTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend Tool.
PanTool.prototype = Object.create(Tool.prototype);
PanTool.prototype.constructor = PanTool;

/**
 * @override
 * Handle the pan tool becoming the active tool.
 */
PanTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'move';
	this._preCxt.canvas.style.cursor = '-webkit-grab';
	this._preCxt.canvas.style.cursor =    '-moz-grab';
	this._preCxt.canvas.style.cursor =         'grab';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PanTool.prototype.start = function (pointerState) {
	this._startX = pointerState.windowX;
	this._startY = pointerState.windowY;
	this._startScrollX = window.scrollX;
	this._startScrollY = window.scrollY;
	
	// Switch to the grabbing cursor.
	this._preCxt.canvas.style.cursor = '-webkit-grabbing';
	this._preCxt.canvas.style.cursor = '-moz-grabbing';
	this._preCxt.canvas.style.cursor = 'grabbing';
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.move = function (pointerState) {
	var scrollX = this._startScrollX + (this._startX - pointerState.windowX),
		scrollY = this._startScrollY + (this._startY - pointerState.windowY);
	window.scrollTo(scrollX, scrollY);
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.end = function (pointerState) {
	// Move to the final pointer position before stopping.
	this.move(pointerState);
	
	// Reset to the non-grabbing cursor.
	this._preCxt.canvas.style.cursor = '-webkit-grab';
	this._preCxt.canvas.style.cursor = '-moz-grab';
	this._preCxt.canvas.style.cursor = 'grab';
};

/**
 * Create a new ToolManager instance and set up its event listeners.
 */
function ToolManager() {
	this.pencil = new PencilTool(cxt, preCxt);
	this.doodle = new DoodleTool(cxt, preCxt);
	this.airbrush = new AirbrushTool(cxt, preCxt);
	this.line = new LineTool(cxt, preCxt);
	this.curve = new CurveTool(cxt, preCxt);
	this.rect = new RectangleTool(cxt, preCxt);
	this.roundRect = new RoundedRectangleTool(cxt, preCxt);
	this.oval = new OvalTool(cxt, preCxt);
	this.polygon = new PolygonTool(cxt, preCxt);
	this.eraser = new EraserTool(cxt, preCxt);
	this.floodFill = new FloodFillTool(cxt, preCxt);
	this.eyedropper = new EyedropperTool(cxt, preCxt);
	this.selection = new SelectionTool(cxt, preCxt);
	this.freeformSelection = new FreeformSelectionTool(cxt, preCxt);
	this.text = new TextTool(cxt,preCxt);
	this.pan = new PanTool(cxt, preCxt);
	
	// Prevent normal mouse click behaviors on the canvas.
	preCanvas.addEventListener('click',       function (e) { e.preventDefault(); }, false);
	preCanvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
	
	// Set up the event listeners.
	this._boundPointerDownHandler = this._handlePointerDown.bind(this);
	this._boundPointerMoveHandler = this._handlePointerMove.bind(this);
	this._boundPointerUpHandler = this._handlePointerUp.bind(this);
	this._boundUpdate = this._update.bind(this);
	preCanvas.addEventListener('pointerdown', this._boundPointerDownHandler, false);
	document.addEventListener('pointermove', this._boundPointerMoveHandler, false);
	document.addEventListener('pointerup', this._boundPointerUpHandler, false);
	document.addEventListener('pointerleave', this._boundPointerUpHandler, false);
	preCanvas.addEventListener('dblclick', this._handleDoubleClick.bind(this), false);
	Utils.raf(this._boundUpdate);
	
	this._state = this.STATE_INACTIVE;
	
	this.currentTool = this[settings.get('tool')];
	this.currentTool.activate();
}

// Define constants.
ToolManager.prototype.STATE_INACTIVE = 0;
ToolManager.prototype.STATE_ACTIVE = 1;


/**
 * Switch to the specified tool.
 * @param {String} toolName - The name of the tool to switch to
 */
ToolManager.prototype.switchTool = function (toolName) {
	// Deactivate the current tool.
	this.currentTool.deactivate();
	// Clear the preview canvas.
	Utils.clearCanvas(preCxt);
	// Set and activate the newly-selected tool.
	settings.set('tool', toolName);
	this.currentTool = this[toolName];
	this.currentTool.activate();
	// Update the toolbar.
	document.getElementById('tools').tool.value = toolName;
};

/**
 * @private
 * Start drawing with the current tool.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerDown = function (e) {
	// Do not start if already drawing.
	if (this._state !== this.STATE_INACTIVE) {
		return;
	}
	
	// Quit if the left or right mouse button was not the button used.
	// (A touch is treated as a left mouse button.)
	if (e.button !== 0 && e.button !== 2) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// If something other than the canvas is focused, unfocus it to make
	// it seem as though focus has moved to the canvas.  (Do not actually
	// focus the canvas because that can scroll the window.)
	if (document.activeElement !== preCanvas) {
		document.activeElement.blur();
	}
	
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level;
	
	// Initialize the new shape.
	this.currentTool.start({
		button: e.button,
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
	
	// Set the state to continue drawing.
	this._state = this.STATE_ACTIVE;
};

/**
 * @private
 * Have the tool update in response to the pointer moving.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerMove = function (e) {
	// Update the pointer coordinates in the bottom bar.
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level,
		intX = Math.floor(adjustedX),
		intY = Math.floor(adjustedY);
	
	toolbar.toolboxes.dimensions.updatePointerCoords(intX, intY);
	
	// Do not continue drawing if not started.
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// Update the tool.
	this.currentTool.move({
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
};

/**
 * @private
 * Complete the current task and stop drawing.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerUp = function (e) {
	// Do not end if not started.
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level;
	
	// Complete the task.
	this.currentTool.end({
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
	
	// Set the state to ready to start the next drawing.
	this._state = this.STATE_INACTIVE;
};

/**
 * @private
 * Handle double-clicking the canvas for tools that respond to it.
 * @param {MouseEvent} e
 */
ToolManager.prototype._handleDoubleClick = function (e) {
	if (this.currentTool === this.polygon) {
		e.preventDefault();
		this.currentTool.finalizePolygon();
	}
};

/**
 * @private
 * Have the current tool update the canvas if necessary.
 */
ToolManager.prototype._update = function () {
	if (this._state === this.STATE_ACTIVE) {
		this.currentTool.update();
	}
	
	Utils.raf(this._boundUpdate);
};

/**
 * Create a new PacMan instance.
 * @param {HTMLCanvasElement} canvas - The canvas on which Pac-Man is to be drawn
 * @param {String} color - The CSS color Pac-Man should be
 * @param {Number} x - The x-coordinate at which Pac-Man should start
 * @param {Number} y - The y-coordinate at which Pac-Man should start
 */
function PacMan(canvas, color, x, y) {
	this._started = false;
	
	this._canvas = canvas;
	this._cxt = canvas.getContext('2d');
	this._color = color;
	this.x = x || Math.floor(canvas.width * 0.2);
	this.y = y || Math.floor(canvas.height * 0.2);
	this.heading = PacMan.HEADINGS.RIGHT;
	
	this._startSound = null;//document.getElementById('pacManStartSound');
	
	this._mouthSize = 0;
	this._mouthOpening = true;
	
	this._boundKeyHandler = this._handleKeyDown.bind(this);
	this._boundUpdate = this._update.bind(this);
}
// Constants.
PacMan.RADIUS = 30;
PacMan.HITBOX_PADDING = 3;
PacMan.SPEED = 2;
PacMan.MOUTH_SPEED = Math.TAU / 32;
PacMan.MAX_MOUTH_SIZE = Math.TAU / 8;
PacMan.START_SOUND_LENGTH = 4000; // In milliseconds.
PacMan.HEADINGS = {
	RIGHT: 0,
	DOWN: 0.25 * Math.TAU,
	LEFT: 0.5 * Math.TAU,
	UP: 0.75 * Math.TAU
};
PacMan.KEYS = {
	LEFT: [37, 65], // Left, A
	UP: [38, 87, 188], // Up, W, comma
	RIGHT: [39, 68, 69], // Right, D, E
	DOWN: [40, 79, 83] // Down, O, S
};


/**
 * Play the starting sound and start Pac-Man after it plays.
 */
PacMan.prototype.start = function () {
	// Do not start this Pac-Man if it has already started.
	if (this._started) {
		return;
	}
	// Draw Pac-Man, but do not start him moving yet.
	this._draw();
	// Play the start sound.
	if (this._startSound && this._startSound.play) {
		this._startSound.currentTime = 0;
		this._startSound.play();
	}
	// NOW set Pac-Man to have started.
	this._started = true;
	// Enable key inputs.
	window.addEventListener('keydown', this._boundKeyHandler, false);
	// Start moving after the sound finishes.
	setTimeout(this._boundUpdate, PacMan.START_SOUND_LENGTH);
};

/**
 * Stop and hide Pac-Man.
 */
PacMan.prototype.stop = function () {
	// Disable key inputs.
	window.removeEventListener('keydown', this._boundKeyHandler, false);
	// Erase Pac-Man.
	this._erase();
	// Stop the start sound if it is playing.
	this._startSound.pause();
	// Stop the game.
	this._started = false;
}

/**
 * Check whether there is a wall in front of Pac-Man.
 * @returns {Boolean}
 */
PacMan.prototype._isBlocked = function () {
	var imageData = this._cxt.getImageData(
		this.x - (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1),
		this.y - (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1),
		(2 * (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1)),
		(2 * (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1))
	);
	
	var lineColor = settings.get('lineColor');
	var wallColor = {
		r: parseInt(lineColor.substr(1, 2), 16),
		g: parseInt(lineColor.substr(3, 2), 16),
		b: parseInt(lineColor.substr(5, 2), 16)
	};

	this._cxt.fillStyle = settings.get('fillColor');
	this._cxt.fillRect(this.x - 1, this.y - 1, 3, 3);

	// Loop over the arc in front of Pac-Man checking for the wall color.
	for (var i = Math.TAU / 16; i < Math.TAU * 7 / 16; i += 1 / 60) {
		var x = Math.round((PacMan.RADIUS + PacMan.HITBOX_PADDING) * Math.sin(i + this.heading));
		var y = -Math.round((PacMan.RADIUS + PacMan.HITBOX_PADDING) * Math.cos(i + this.heading));

		var col = x + (imageData.width / 2);
		var row = y + (imageData.height / 2);

		var color = {
			r: imageData.data[((row * imageData.width * 4) + (col * 4))],
			g: imageData.data[((row * imageData.width * 4) + (col * 4)) + 1],
			b: imageData.data[((row * imageData.width * 4) + (col * 4)) + 2],
			a: imageData.data[((row * imageData.width * 4) + (col * 4)) + 3]
		};

		// Draw Pac-Man's hitbox (hitarc?) for debugging.
		/*this._cxt.fillStyle = '#00cc00';
		this._cxt.fillRect(this.x + x - 0.1, this.y + y - 0.1, 0.2, 0.2);*/

		if (color.r === wallColor.r &&
				color.g === wallColor.g &&
				color.b === wallColor.b &&
				color.a === 255) {
			return true;
		}
	}

	return false;
};

/**
 * Draw Pac-Man to the canvas.
 */
PacMan.prototype._draw = function () {
	this._cxt.fillStyle = this._color;
	this._cxt.beginPath();
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, 0.25 * Math.TAU + this.heading, 0.75 * Math.TAU + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, this._mouthSize + this.heading, 0.25 * Math.TAU + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, 0.75 * Math.TAU + this.heading, Math.TAU - this._mouthSize + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
};

/**
 * Cover Pac-Man with the current fill color, effectively erasing him
 * and “eating” everything under him.
 */
PacMan.prototype._erase = function () {
	this._cxt.fillStyle = settings.get('fillColor');
	this._cxt.beginPath();
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, 0.25 * Math.TAU + this.heading, 0.75 * Math.TAU + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, this._mouthSize + this.heading, 0.25 * Math.TAU + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, 0.75 * Math.TAU + this.heading, Math.TAU - this._mouthSize + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
};

/**
 * Handle a key being pressed for Pac-Man.
 * @param {KeyboardEvent} ev
 */
PacMan.prototype._handleKeyDown = function (ev) {
	if (PacMan.KEYS.UP.indexOf(ev.keyCode) !== -1) {
		ev.preventDefault();
		this.heading = PacMan.HEADINGS.UP;
	} else if (PacMan.KEYS.RIGHT.indexOf(ev.keyCode) !== -1) {
		ev.preventDefault();
		this.heading = PacMan.HEADINGS.RIGHT;
	} else if (PacMan.KEYS.DOWN.indexOf(ev.keyCode) !== -1) {
		ev.preventDefault();
		this.heading = PacMan.HEADINGS.DOWN;
	} else if (PacMan.KEYS.LEFT.indexOf(ev.keyCode) !== -1) {
		ev.preventDefault();
		this.heading = PacMan.HEADINGS.LEFT;
	}
};

PacMan.prototype._update = function () {
	// If this Pac-Man is supposed to be running, loop.
	if (this._started) {
		Utils.raf(this._boundUpdate);
	} else {
		return;
	}

	// “Eat” everything under Pac-Man.
	this._erase();

	// Move Pac-Man.
	if (!this._isBlocked()) {
		switch (this.heading) {
			case PacMan.HEADINGS.UP:
				this.y -= PacMan.SPEED;
				break;
			case PacMan.HEADINGS.RIGHT:
				this.x += PacMan.SPEED;
				break;
			case PacMan.HEADINGS.DOWN:
				this.y += PacMan.SPEED;
				break;
			case PacMan.HEADINGS.LEFT:
				this.x -= PacMan.SPEED;
				break;
		}
	}
	// Animate Pac-Man's mouth.
	this._mouthSize += PacMan.MOUTH_SPEED * (this._mouthOpening ? 1 : -1);
	if (this._mouthOpening && this._mouthSize > PacMan.MAX_MOUTH_SIZE) {
		this._mouthSize = PacMan.MAX_MOUTH_SIZE;
		this._mouthOpening = false;
	} else if (!this._mouthOpening && this._mouthSize < 0) {
		this._mouthSize = 0;
		this._mouthOpening = true;
	}

	// Screen wrap.
	if (this.x < -PacMan.RADIUS) {
		this.x = canvas.width + PacMan.RADIUS;
	} else if (this.x > canvas.width + PacMan.RADIUS) {
		this.x = -PacMan.RADIUS;
	} else if (this.y < -PacMan.RADIUS) {
		this.y = canvas.height + PacMan.RADIUS;
	} else if (this.y > canvas.height + PacMan.RADIUS) {
		this.y = -PacMan.RADIUS;
	}

	// Draw Pac-Man.
	this._draw();
};

// Constants.
var PNG_REGEX = (/.+\.png$/i),
	JPEG_REGEX = (/.+\.(jpg|jpeg|jpe|jif|jfif|jfi)$/i),
	FILE_EXT_REGEX = (/\.[a-z0-9]{0,4}$/i),
	DEFAULT_TITLE = 'untitled.png',
	PAGE_TITLE_SUFFIX = ' - PaintZ';

var canvasPositioner,
	canvas,
	preCanvas,
	gridCanvas,
	cursorCanvas,
	cxt,
	preCxt,
	gridCxt,
	cursorCxt,
	keyManager,
	tools,
	zoomManager,
	settings,
	clipboard,
	dialogs = {},
	toolbar = {},
	progressSpinner;

/**
 * Get the canvases and their drawing contexts, and set up event listeners.
 */
function initCanvas() {
	// Get the canvas container.
	canvasPositioner = document.getElementById('canvasPositioner');
	// Get the real canvas.
	canvas = document.getElementById('canvas');
	cxt = canvas.getContext('2d');
	// Get the preview canvas.
	preCanvas = document.getElementById('preCanvas');
	preCxt = preCanvas.getContext('2d');
	// Get the grid canvas.
	gridCanvas = document.getElementById('gridCanvas');
	gridCxt = gridCanvas.getContext('2d');
	// Get the cursor canvas.
	cursorCanvas = document.getElementById('cursorCanvas');
	cursorCxt = cursorCanvas.getContext('2d');
	
	cxt.lineCap = 'round';
	preCxt.lineCap = 'round';
}

/**
 * Set up the canvases with their initial contents.
 */
function initCanvasContents() {
	resetCanvas();
	/*
	// If there is a saved state in session storage, restore it.
	if (sessionStorage.lastState) {
		var image = new Image();
		image.onload = function () {
			settings.set('width', image.width);
			settings.set('height', image.height);
			cxt.drawImage(image, 0, 0);
			undoStack.clear();
		};
		image.src = sessionStorage.lastState;
		dialogs.autoRestore.open();
	}
	
	// If a shared file was received by the service worker, open it.
	if (window.sharedFile) {
		openImage(sharedFile);
		delete window.sharedFile;
	}
	
	// If the browser supports queuing files to open with the app.
	// There should be nothing in session storage on launch, but this
	// should overwrite that regardless.
	if (window.launchQueue) {
		launchQueue.setConsumer(function (launchParams) {
			if (!launchParams.files.length) {
				return;
			}
			// Open the first file in the queue.
			launchParams.files[0].getFile().then(function (file) {
				openImage(file);
			});
		});
	}*/
}

/**
 * Resize the canvas to new dimensions while preserving the contents.
 * @param {Number} newWidth - The new canvas width
 * @param {Number} newHeight - The new canvas height
 * @param {String} mode - Either 'scale' to stretch the canvas to the new dimensions or 'crop' to leave the existing content as is
 */
function resizeCanvas(newWidth, newHeight, mode) {
	// Tell the current tool to finish.
	tools.currentTool.deactivate();
	
	// Back up the canvas contents to the pre-canvas since resizing clears the canvas.
	preCxt.drawImage(canvas, 0, 0);
	// Resize the canvas.
	canvas.width = newWidth;
	canvas.height = newHeight;
	// Fill any blank space with the fill color.
	resetCanvas();
	// Stretch or place the old canvas contents to the resized canvas.
	if (mode === 'scale') {
		cxt.drawImage(preCanvas, 0, 0, newWidth, newHeight);
	} else {
		cxt.drawImage(preCanvas, 0, 0);
	}
	// Update the pre-canvas's size.
	preCanvas.width = newWidth;
	preCanvas.height = newHeight;
	
	// Save the new dimensions.
	settings.set('width', newWidth);
	settings.set('height', newHeight);
	
	// Reactivate the current tool.
	tools.currentTool.activate();
}

/**
 * Overwrite the canvas with the current fill color.
 */
function resetCanvas() {
	cxt.fillStyle = settings.get('fillColor');
	cxt.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Open an image to replace the current one.
 * @param {File} file - The file containing the new image
 */
function openImage(file, isFilePath) {
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	// Deactivate and reactivate the current tool in case it is being used.
	tools.currentTool.deactivate();
	tools.currentTool.activate();
	//setTimeout(() => {
	Utils.readImage(file, isFilePath).then(function (image) {
		// There is no need to clear the canvas.  Resizing the canvas will do that.
		canvas.width =
			preCanvas.width = image.width;
		canvas.height =
			preCanvas.height = image.height;
			settings.set('width', image.width);
			settings.set('height', image.height);
		cxt.fillStyle = 'white';
		cxt.fillRect(0, 0, canvas.width, canvas.height);
		cxt.drawImage(image, 0, 0);
		
		// Set the file type and name.
		// TODO: Make this not access SaveDialog private properties.
		var fileName = isFilePath ? file.substring(file.lastIndexOf('/') + 1): file.name;
		if (JPEG_REGEX.test(fileName)) {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/jpeg';
		} else {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/png';
			fileName = fileName.replace(FILE_EXT_REGEX, '.png');
		}
		dialogs.save._element.fileName.value =
			dialogs.save._downloadLink.download = fileName;
		document.title = fileName + PAGE_TITLE_SUFFIX;
		
		// Clear the undo and redo stacks.
		undoStack.clear();
		
		// Hide the progress spinner.
		progressSpinner.hide();
	}).catch(function (errorMessage) {
		if (!!errorMessage) {
			alert(errorMessage);
		}
		// Hide the progress spinner.
		progressSpinner.hide();
	});
	//}, 2000);
}

/**
 * Set up events for opening images via drag-and-drop.
 */
function initDragDrop() {
	window.addEventListener('dragenter', function (e) { e.preventDefault(); }, false);
	window.addEventListener('dragleave', function (e) { e.preventDefault(); }, false);
	window.addEventListener('dragover', function (e) { e.preventDefault(); }, false);
	window.addEventListener('drop', function (e) {
		e.preventDefault();
		var file = e.dataTransfer.files[0];
		openImage(file);
	}, false);
}

/**
 * Check whether it is a milestone for a pop-up suggestion.
 */
function checkSaveCountMilestone() {
	var DIALOG_OPEN_DELAY = 2000; // Milliseconds
	var MILESTONES = {
		'10': 'install',
		'50': 'coffee',
		'100': 'rate',
		'500': 'patreon'
	};
	
	var saveCount = settings.get('saveCount');
	
	if (saveCount in MILESTONES) {
		setTimeout(function() {
			dialogs[MILESTONES[saveCount]].open();
		}, DIALOG_OPEN_DELAY);
	}
}

window.addEventListener('load', function () {
	// Initialize dialogs not bound to specific buttons.
	dialogs.msAccessKey = new MSAccessKeyDialog();
	dialogs.msAccessKeyHelp = new MSAccessKeyHelpDialog();
	dialogs.autoRestore = new AutoRestoreDialog();
	dialogs.coffee = new CoffeeDialog();
	dialogs.install = new InstallDialog();
	dialogs.keyboard = new KeyboardDialog();
	dialogs.rate = new RateDialog();
	dialogs.patreon = new PatreonDialog();
	// Contain mouse wheel events within the dialogs container.
	document.getElementById('dialogsContainer')
		.addEventListener('wheel', function (ev) { ev.stopPropagation(); }, false);
	document.getElementById('bottomSheetsContainer')
		.addEventListener('wheel', function (ev) { ev.stopPropagation(); }, false);
	
	// Initialize everything.
	initCanvas();
	keyManager = new KeyManager();
	zoomManager = new ZoomManager();
	settings = new SettingsManager();
	clipboard = new ClipboardManager();
	toolbar = new ToolbarManager();
	tools = new ToolManager();
	progressSpinner = new ProgressSpinner();
	initDragDrop();
	
	// Wait for all the toolbar and dialog content to load.
	var dialogLoadPromises = Object.values(dialogs).map(function (dialog) { return dialog.loadPromise; }),
		masterLoadPromise = Promise.all([toolbar.loadPromise, dialogLoadPromises]);
	
	masterLoadPromise
		.then(postLoadInit)
		.catch(function (err) {
			var errorDisplay = document.createElement('p'),
				errorMessage = document.createElement('span');
			errorDisplay.innerHTML = 'Oops, something went wrong!  Maybe try again later?<br /><br />If this keeps happening, you can tell the developer: ';
			errorMessage.style.display = 'inline-block';
			errorMessage.innerText += '\u201c' + err + '\u201d';
			errorDisplay.appendChild(errorMessage);
			
			var splashScreen = document.getElementById('splashScreen');
			splashScreen.removeChild(splashScreen.querySelector('progress'));
			splashScreen.appendChild(errorDisplay);
		});
}, false);

function postLoadInit() {
	// Put in the initial canvas contents.
	initCanvasContents();
	
	// Save the initial state.
	undoStack.addState();
	
	// Enable keyboard shortcuts.
	keyManager.enabled = true;
	
	// Enable clipboard actions.
	clipboard.enabled = true;
	
	// Set the title once everything else is ready.
	document.title = DEFAULT_TITLE + PAGE_TITLE_SUFFIX;
	
	// Hide the splash screen.
	document.body.removeChild(document.getElementById('splashScreen'));
	
	// Prevent closing with unsaved changes.
	undoStack.changedSinceSave = false;
	window.onbeforeunload = function () {
		if (undoStack.changedSinceSave) {
			return 'It looks like you have unsaved changes.';
		}
	};
	
	if (settings.get('firstRunDone')) {
		// Only show the welcome dialog if this is the user's first time using PaintZ (in this browser).
		return;
	}
	
	var welcomeDialog = new WelcomeDialog(document.getElementById('helpBtn'));
	welcomeDialog.loadPromise.then(function () {
		welcomeDialog.open();
		settings.set('firstRunDone', true);
	});
}

