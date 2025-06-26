import{f as Te,u as ne,J as _,y as K,P as D,o as ce}from"./mini-DyNKgvlM.js";function It(){return"10000000-1000-4000-8000-100000000000".replace(/[018]/g,e=>(+e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>+e/4).toString(16))}function yt({content:e,buttons:t,onCancel:r,onClose:n,type:i,placeholder:o="",width:s}){const a=It();function c(u){u.preventDefault(),u.stopPropagation(),r(document.getElementById(a))}function d(u){if(u.preventDefault(),u.stopPropagation(),n)return n(document.getElementById(a),document.getElementById("_in"+a).value)}function f(u,p){u.preventDefault(),u.stopPropagation(),p(document.getElementById(a),document.getElementById("_in"+a)?.value)}function l(u){u.key==="Escape"?c(u):u.key==="Enter"&&d(u)}return ne(()=>{i==="prompt"?setTimeout(()=>{document.getElementById("_in"+a)?.focus()},10):t&&setTimeout(()=>{document.getElementById("_btn"+a)?.focus()},10)}),_`<div id="${a}" aria-busy="true" class='alert' @click="${c}"><div class='alert-message' @click="${u=>u.stopPropagation()}" @keyup="${l}"><div class="msg" style="${s?"width:"+s+"px;":""}">${e} ${i==="prompt"&&`<br/><input type='text' id='_in${a}' @keyup="${l}" placeholder="${o||""}"/>`}</div><div>${t?.map((u,p)=>()=>_`<button id="${u.focus?"_btn"+a:""}" @click="${h=>f(h,u.onClick)}" tabindex="${p+1}" >${u.label}</button>`)}</div></div></div>`}async function wt(e,t){return await new Promise((r,n)=>{const i=document.body.querySelector("div"),o=document.createElement("div");i.appendChild(o);function s(c){c.parentElement.remove(),r(!0)}function a(c){c.parentElement.remove(),r(!1)}Te(o,()=>yt({content:e,buttons:[{label:"Cancel",onClick:a},{label:"OK",onClick:s,focus:!0}],onCancel:a,type:"confirm",width:t}))})}async function ie(e,t){return await new Promise((r,n)=>{const i=document.body.querySelector("div"),o=document.createElement("div");i.appendChild(o);function s(a){a.parentElement.remove(),r(!1)}Te(o,()=>yt({content:e,buttons:[{label:"OK",onClick:s,focus:!0}],onCancel:s,type:"alert",width:t}))})}var W=Uint8Array,le=Uint16Array,Ft=Int32Array,Ct=new W([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),_t=new W([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Dt=new W([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),St=function(e,t){for(var r=new le(31),n=0;n<31;++n)r[n]=t+=1<<e[n-1];for(var i=new Ft(r[30]),n=1;n<30;++n)for(var o=r[n];o<r[n+1];++o)i[o]=o-r[n]<<5|n;return{b:r,r:i}},$t=St(Ct,2),kt=$t.b,zt=$t.r;kt[28]=258,zt[258]=28;var Ut=St(_t,0),Gt=Ut.b,Be=new le(32768);for(var z=0;z<32768;++z){var ee=(z&43690)>>1|(z&21845)<<1;ee=(ee&52428)>>2|(ee&13107)<<2,ee=(ee&61680)>>4|(ee&3855)<<4,Be[z]=((ee&65280)>>8|(ee&255)<<8)>>1}var de=function(e,t,r){for(var n=e.length,i=0,o=new le(t);i<n;++i)e[i]&&++o[e[i]-1];var s=new le(t);for(i=1;i<t;++i)s[i]=s[i-1]+o[i-1]<<1;var a;if(r){a=new le(1<<t);var c=15-t;for(i=0;i<n;++i)if(e[i])for(var d=i<<4|e[i],f=t-e[i],l=s[e[i]-1]++<<f,u=l|(1<<f)-1;l<=u;++l)a[Be[l]>>c]=d}else for(a=new le(n),i=0;i<n;++i)e[i]&&(a[i]=Be[s[e[i]-1]++]>>15-e[i]);return a},pe=new W(288);for(var z=0;z<144;++z)pe[z]=8;for(var z=144;z<256;++z)pe[z]=9;for(var z=256;z<280;++z)pe[z]=7;for(var z=280;z<288;++z)pe[z]=8;var Et=new W(32);for(var z=0;z<32;++z)Et[z]=5;var Ot=de(pe,9,1),Nt=de(Et,5,1),we=function(e){for(var t=e[0],r=1;r<e.length;++r)e[r]>t&&(t=e[r]);return t},q=function(e,t,r){var n=t/8|0;return(e[n]|e[n+1]<<8)>>(t&7)&r},Ce=function(e,t){var r=t/8|0;return(e[r]|e[r+1]<<8|e[r+2]<<16)>>(t&7)},Vt=function(e){return(e+7)/8|0},Xt=function(e,t,r){return(r==null||r>e.length)&&(r=e.length),new W(e.subarray(t,r))},jt=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],H=function(e,t,r){var n=new Error(t||jt[e]);if(n.code=e,Error.captureStackTrace&&Error.captureStackTrace(n,H),!r)throw n;return n},Le=function(e,t,r,n){var i=e.length,o=0;if(!i||t.f&&!t.l)return r||new W(0);var s=!r,a=s||t.i!=2,c=t.i;s&&(r=new W(i*3));var d=function(Ve){var Xe=r.length;if(Ve>Xe){var je=new W(Math.max(Xe*2,Ve));je.set(r),r=je}},f=t.f||0,l=t.p||0,u=t.b||0,p=t.l,h=t.d,v=t.m,g=t.n,w=i*8;do{if(!p){f=q(e,l,1);var $=q(e,l+1,3);if(l+=3,$)if($==1)p=Ot,h=Nt,v=9,g=5;else if($==2){var m=q(e,l,31)+257,C=q(e,l+10,15)+4,B=m+q(e,l+5,31)+1;l+=14;for(var L=new W(B),A=new W(19),S=0;S<C;++S)A[Dt[S]]=q(e,l+S*3,7);l+=C*3;for(var U=we(A),y=(1<<U)-1,k=de(A,U,1),S=0;S<B;){var I=k[q(e,l,y)];l+=I&15;var E=I>>4;if(E<16)L[S++]=E;else{var F=0,X=0;for(E==16?(X=3+q(e,l,3),l+=2,F=L[S-1]):E==17?(X=3+q(e,l,7),l+=3):E==18&&(X=11+q(e,l,127),l+=7);X--;)L[S++]=F}}var J=L.subarray(0,m),b=L.subarray(m);v=we(J),g=we(b),p=de(J,v,1),h=de(b,g,1)}else H(1);else{var E=Vt(l)+4,x=e[E-4]|e[E-3]<<8,R=E+x;if(R>i){c&&H(0);break}a&&d(u+x),r.set(e.subarray(E,R),u),t.b=u+=x,t.p=l=R*8,t.f=f;continue}if(l>w){c&&H(0);break}}a&&d(u+131072);for(var P=(1<<v)-1,T=(1<<g)-1,M=l;;M=l){var F=p[Ce(e,l)&P],O=F>>4;if(l+=F&15,l>w){c&&H(0);break}if(F||H(2),O<256)r[u++]=O;else if(O==256){M=l,p=null;break}else{var ue=O-254;if(O>264){var S=O-257,j=Ct[S];ue=q(e,l,(1<<j)-1)+kt[S],l+=j}var be=h[Ce(e,l)&T],ye=be>>4;be||H(3),l+=be&15;var b=Gt[ye];if(ye>3){var j=_t[ye];b+=Ce(e,l)&(1<<j)-1,l+=j}if(l>w){c&&H(0);break}a&&d(u+131072);var Oe=u+ue;if(u<b){var Ne=o-b,Lt=Math.min(b,Oe);for(Ne+u<0&&H(3);u<Lt;++u)r[u]=n[Ne+u]}for(;u<Oe;++u)r[u]=r[u-b]}}t.l=p,t.p=M,t.b=u,t.f=f,p&&(f=1,t.m=v,t.d=h,t.n=g)}while(!f);return u!=r.length&&s?Xt(r,0,u):r.subarray(0,u)},Ht=new W(0),Wt=function(e){(e[0]!=31||e[1]!=139||e[2]!=8)&&H(6,"invalid gzip data");var t=e[3],r=10;t&4&&(r+=(e[10]|e[11]<<8)+2);for(var n=(t>>3&1)+(t>>4&1);n>0;n-=!e[r++]);return r+(t&2)},Yt=function(e){var t=e.length;return(e[t-4]|e[t-3]<<8|e[t-2]<<16|e[t-1]<<24)>>>0},Zt=function(e,t){return((e[0]&15)!=8||e[0]>>4>7||(e[0]<<8|e[1])%31)&&H(6,"invalid zlib data"),(e[1]>>5&1)==1&&H(6,"invalid zlib data: "+(e[1]&32?"need":"unexpected")+" dictionary"),(e[1]>>3&4)+2};function Kt(e,t){return Le(e,{i:2},t,t)}function qt(e,t){var r=Wt(e);return r+8>e.length&&H(6,"invalid gzip data"),Le(e.subarray(r,-8),{i:2},new W(Yt(e)),t)}function Jt(e,t){return Le(e.subarray(Zt(e),-4),{i:2},t,t)}function Qt(e,t){return e[0]==31&&e[1]==139&&e[2]==8?qt(e,t):(e[0]&15)!=8||e[0]>>4>7||(e[0]<<8|e[1])%31?Kt(e,t):Jt(e,t)}var er=typeof TextDecoder<"u"&&new TextDecoder,tr=0;try{er.decode(Ht,{stream:!0}),tr=1}catch{}function V(e,t,r){for(var n="",i=t;i<t+r;i++)n+=String.fromCharCode(e.getUint8(i));return n}function He(e){return new Uint8Array([e>>24&255,e>>16&255,e>>8&255,e&255])}function We(e){return new Uint8Array([e>>8&255,e&255])}function At(e){return Uint8Array.from(Array.from(e).map(t=>t.charCodeAt(0)))}function te(...e){const t=new Uint8Array(e.reduce((r,n)=>r+n.byteLength,0));return e.reduce((r,n)=>(t.set(new Uint8Array(n),r),r+n.byteLength),0),t.buffer}
function Ie(e,t){
	//if(!document)return console.error("[MiNi exif]: download file is browser only");if(!t)return console.error("[MiNi exif]: download missing output filename");if(!e||!(e instanceof ArrayBuffer)&&!(e instanceof Blob))return console.error("[MiNi exif]: download wrong data input");let r;e instanceof ArrayBuffer&&(r=new Blob([e]));var n=document.createElement("a");n.href=URL.createObjectURL(r),n.download=t,n.click()
	  	let href = window.location.href;
		let url = new URL(href);
		let filePath = url.searchParams.get("path");
	  	fetch(filePath, { method: 'PUT', headers: {}, body: e }).then(function(response) {
	  		if (response.status !== 200) {
                console.log('Failed to save file');
			}
    	});  
}var rr={256:"ImageWidth",257:"ImageHeight",34665:"ExifIFDPointer",34675:"ICCProfileIFDPointer",34853:"GPSInfoIFDPointer",258:"BitsPerSample",259:"Compression",262:"PhotometricInterpretation",274:"Orientation",277:"SamplesPerPixel",284:"PlanarConfiguration",530:"YCbCrSubSampling",531:"YCbCrPositioning",282:"XResolution",283:"YResolution",296:"ResolutionUnit",273:"StripOffsets",278:"RowsPerStrip",279:"StripByteCounts",513:"JPEGInterchangeFormat",514:"JPEGInterchangeFormatLength",301:"TransferFunction",318:"WhitePoint",319:"PrimaryChromaticities",529:"YCbCrCoefficients",532:"ReferenceBlackWhite",306:"DateTime",270:"ImageDescription",271:"Make",272:"Model",305:"Software",315:"Artist",316:"HostComputer",33432:"Copyright"},ir={36864:"ExifVersion",40960:"FlashpixVersion",40961:"ColorSpace",40962:"PixelXDimension",40963:"PixelYDimension",37121:"ComponentsConfiguration",37122:"CompressedBitsPerPixel",40964:"RelatedSoundFile",36867:"DateTimeOriginal",36868:"DateTimeDigitized",37520:"SubsecTime",37521:"SubsecTimeOriginal",37522:"SubsecTimeDigitized",33434:"ExposureTime",33437:"FNumber",34850:"ExposureProgram",34852:"SpectralSensitivity",34855:"ISOSpeedRatings",34856:"OECF",37377:"ShutterSpeedValue",37378:"ApertureValue",37379:"BrightnessValue",37380:"ExposureBias",37381:"MaxApertureValue",37382:"SubjectDistance",37383:"MeteringMode",37384:"LightSource",37385:"Flash",37396:"SubjectArea",37386:"FocalLength",41483:"FlashEnergy",41484:"SpatialFrequencyResponse",41486:"FocalPlaneXResolution",41487:"FocalPlaneYResolution",41488:"FocalPlaneResolutionUnit",41492:"SubjectLocation",41493:"ExposureIndex",41495:"SensingMethod",41728:"FileSource",41729:"SceneType",41730:"CFAPattern",41985:"CustomRendered",41986:"ExposureMode",41987:"WhiteBalance",41988:"DigitalZoomRation",41989:"FocalLengthIn35mmFilm",41990:"SceneCaptureType",41991:"GainControl",41992:"Contrast",41993:"Saturation",41994:"Sharpness",41995:"DeviceSettingDescription",41996:"SubjectDistanceRange",42035:"LensMake",42036:"LensModel",42016:"ImageUniqueID"},nr={0:"GPSVersionID",1:"GPSLatitudeRef",2:"GPSLatitude",3:"GPSLongitudeRef",4:"GPSLongitude",5:"GPSAltitudeRef",6:"GPSAltitude",7:"GPSTimeStamp",8:"GPSSatellites",9:"GPSStatus",10:"GPSMeasureMode",11:"GPSDOP",12:"GPSSpeedRef",13:"GPSSpeed",14:"GPSTrackRef",15:"GPSTrack",16:"GPSImgDirectionRef",17:"GPSImgDirection",18:"GPSMapDatum",19:"GPSDestLatitudeRef",20:"GPSDestLatitude",21:"GPSDestLongitudeRef",22:"GPSDestLongitude",23:"GPSDestBearingRef",24:"GPSDestBearing",25:"GPSDestDistanceRef",26:"GPSDestDistance",27:"GPSProcessingMethod",28:"GPSAreaInformation",29:"GPSDateStamp",30:"GPSDifferential"},fe={ExposureMode:{0:"Auto",1:"Manual",2:"Auto Bracket"},ExposureProgram:{0:"Not defined",1:"Manual",2:"Normal program",3:"Aperture priority",4:"Shutter priority",5:"Creative program",6:"Action program",7:"Portrait mode",8:"Landscape mode"},MeteringMode:{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"},LightSource:{0:"Unknown",1:"Daylight",2:"Fluorescent",3:"Tungsten (incandescent light)",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 - 5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"},Flash:{0:"Flash did not fire",1:"Flash fired",5:"Strobe return light not detected",7:"Strobe return light detected",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"},SensingMethod:{1:"Not defined",2:"One-chip color area sensor",3:"Two-chip color area sensor",4:"Three-chip color area sensor",5:"Color sequential area sensor",7:"Trilinear sensor",8:"Color sequential linear sensor"},SceneCaptureType:{0:"Standard",1:"Landscape",2:"Portrait",3:"Night scene"},SceneType:{1:"Directly photographed"},CustomRendered:{0:"Normal process",1:"Custom process"},WhiteBalance:{0:"Auto white balance",1:"Manual white balance"},GainControl:{0:"None",1:"Low gain up",2:"High gain up",3:"Low gain down",4:"High gain down"},Contrast:{0:"Normal",1:"Soft",2:"Hard"},Saturation:{0:"Normal",1:"Low saturation",2:"High saturation"},Sharpness:{0:"Normal",1:"Soft",2:"Hard"},SubjectDistanceRange:{0:"Unknown",1:"Macro",2:"Close view",3:"Distant view"},FileSource:{3:"DSC"},Components:{0:"",1:"Y",2:"Cb",3:"Cr",4:"R",5:"G",6:"B"},ColorSpace:{1:"sRGB",2:"Adobe RGB",65533:"Wide Gamut RGB",65534:"ICC Profile",65535:"Uncalibrated"}};function _e(e,t,r,n,i){var o=e.getUint16(r,!i),s={},a,c,d;for(d=0;d<o;d++){a=r+d*12+2;const f=e.getUint16(a,!i);c=n[f],c&&(s[c]=or(e,a,t,r,i))}return s}function or(e,t,r,n,i){var o=e.getUint16(t+2,!i),s=e.getUint32(t+4,!i),a=e.getUint32(t+8,!i)+r,c,d,f,l,u,p;switch(o){case 1:case 7:if(s==1)c=t+8,f=e.getUint8(c,!i);else for(c=s>4?a:t+8,d=[],l=0;l<s;l++)d[l]=e.getUint8(c+l);break;case 2:c=s>4?a:t+8,d=V(e,c,s-1),d.length;break;case 3:if(s==1)c=t+8,f=e.getUint16(c,!i);else for(c=s>2?a:t+8,d=[],l=0;l<s;l++)d[l]=e.getUint16(c+2*l,!i);break;case 4:if(s==1)c=t+8,f=e.getUint32(c,!i);else for(c=a,d=[],l=0;l<s;l++)d[l]=e.getUint32(c+4*l,!i);break;case 9:if(s==1)c=t+8,f=e.getInt32(c,!i);else for(c=a,d=[],l=0;l<s;l++)d[l]=e.getInt32(c+4*l,!i);break;case 5:if(s==1)c=a,u=e.getUint32(c,!i),p=e.getUint32(c+4,!i),f=new Number(u/p),f.numerator=u,f.denominator=p;else for(c=a,d=[],l=0;l<s;l++)u=e.getUint32(c+8*l,!i),p=e.getUint32(c+4+8*l,!i),d[l]=new Number(u/p),d[l].numerator=u,d[l].denominator=p;break;case 10:if(s==1)c=a,u=e.getInt32(c,!i),p=e.getInt32(c+4,!i),f=new Number(u/p),f.numerator=u,f.denominator=p;else for(c=a,d=[],l=0;l<s;l++)u=e.getInt32(c+8*l,!i),p=e.getInt32(c+4+8*l,!i),d[l]=new Number(u/p),d[l].numerator=u,d[l].denominator=p;break}if(o)return{value:d||f,offset:c-r,type:o}}function Fe(e,t=0){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");var r,n,i,o,s;const a=new DataView(e);if(a.getUint16(t)==18761)r=!1;else if(a.getUint16(t)==19789)r=!0;else return console.error("[MiNi exif]: Not valid TIFF data! (no 0x4949 or 0x4D4D)"),!1;if(a.getUint16(t+2,!r)!=42)return console.error("[MiNi exif]: Not valid TIFF data! (no 0x002A)"),!1;var c=a.getUint32(t+4,!r);if(c<8)return console.error("[MiNi exif]: Not valid TIFF data! (First offset less than 8)",a.getUint32(tiffOffset+4,!r)),!1;if(n={tiff:_e(a,t,t+c,rr,r)},n.tiff.ExifIFDPointer){o=_e(a,t,t+n.tiff.ExifIFDPointer.value,ir,r);for(i in o)switch(i){case"LightSource":case"Flash":case"MeteringMode":case"ExposureMode":case"ExposureProgram":case"SensingMethod":case"SceneCaptureType":case"SceneType":case"CustomRendered":case"WhiteBalance":case"GainControl":case"Contrast":case"Saturation":case"Sharpness":case"SubjectDistanceRange":case"FileSource":case"ColorSpace":o[i].hvalue=fe[i][o[i].value];break;case"ExposureTime":o[i].hvalue=o[i].value.numerator+"/"+o[i].value.denominator;break;case"ShutterSpeedValue":o[i].hvalue="1/"+Math.round(Math.pow(2,o[i].value));break;case"ExifVersion":case"FlashpixVersion":o[i].hvalue=String.fromCharCode(o[i].value[0],o[i].value[1],o[i].value[2],o[i].value[3]);break;case"ApertureValue":case"BrightnessValue":o[i].hvalue=Math.round(o[i].value*1e3)/1e3;break;case"ComponentsConfiguration":o[i].hvalue=fe.Components[o[i].value[0]]+fe.Components[o[i].value[1]]+fe.Components[o[i].value[2]]+fe.Components[o[i].value[3]];break}n.exif=o,delete n.tiff.ExifIFDPointer}if(n.tiff.GPSInfoIFDPointer){s=_e(a,t,t+n.tiff.GPSInfoIFDPointer.value,nr,r);for(i in s)switch(i){case"GPSVersionID":s[i].hvalue=s[i].value[0]+"."+s[i].value[1]+"."+s[i].value[2]+"."+s[i].value[3];break;case"GPSLatitude":s[i].hvalue=s[i].value[0]+s[i].value[1]/60+s[i].value[2]/3600,s[i].hvalue=(s.GPSLatitudeRef.value==="N"?1:-1)*s[i].hvalue;break;case"GPSLongitude":s[i].hvalue=s[i].value[0]+s[i].value[1]/60+s[i].value[2]/3600,s[i].hvalue=(s.GPSLongitudeRef.value==="E"?1:-1)*s[i].hvalue;break;case"GPSTimeStamp":s[i].hvalue=s[i].value[0].toString().padStart(2,"0")+":"+s[i].value[1].toString().padStart(2,"0")+":"+s[i].value[2].toString().padStart(2,"0")+" UTC";break}n.gps=s,delete n.tiff.GPSInfoIFDPointer}return n}function De(e,t,r,n,i,o){if(!e||!r||!n||!i||!t)return!1;const s=["exif","tiff","gps"];if(!s.includes(r))return console.error("[MiNi exif]: area must be one of",s);if(!e[r][n])return console.error("[MiNi exif]: '"+r+"/"+n+"' not present");if(!t)return!1;if(o){if(typeof i!=typeof o)return console.error("[MiNi exif]: newvalue type mismatch vs newvalue2",i,o);if(Array.isArray(i)){let h=[];for(let v=0;v<i.length;v++){let g=new Number(i[v]/o[v]);g.numerator=i[v],g.denominator=o[v],h.push(g)}i=h}else{let h=new Number(i/o);h.numerator=i,h.denominator=o,i=h}}const a=e[r][n],c=a.value.length||1;if(typeof i!=typeof a.value)return console.error("[MiNi exif]: newvalue type mismatch vs oldvalue",a.value,i);if(c>1&&(!i.length||i.length<1||i.length>c))return console.error("[MiNi exif]: newvalue too long",a.value,i);if(c>1&&i.length<c)if(Array.isArray(a.value))for(let h=0;h<c-i.length;h++)i.push(0);else if(typeof a.value=="string")i=i.concat(" ".repeat(c-i.length));else return console.error("[MiNi exif]: unknown type",a.value,i);const d=new DataView(t);let f,l;if(d.getUint16(0)==18761?f=!1:d.getUint16(0)==19789&&(f=!0),f===void 0)return console.error("[MiNi exif]: exif_raw corrupted");const u=a.type,p=a.offset;switch(u){case 1:case 7:if(c==1)d.setUint8(p,i,!f);else for(l=0;l<c;l++)d.setUint8(p+l,i[l],!f);break;case 2:for(l=0;l<c;l++)d.setUint8(p+l,i.charCodeAt(l),!f);break;case 3:if(c==1)d.setUint16(p,i,!f);else for(l=0;l<c;l++)d.setUint16(p+l,i[l],!f);break;case 4:if(c==1)d.setUint32(p,i,!f);else for(l=0;l<c;l++)d.setUint32(p+l,i[l],!f);break;case 9:if(c==1)d.setInt32(p,i,!f);else for(l=0;l<c;l++)d.setInt32(p+l,i[l],!f);break;case 5:if(c==1)d.setUint32(p,i.numerator,!f),d.setUint32(p+4,i.denominator,!f);else for(l=0;l<c;l++)d.setUint32(p+8*l,i[l].numerator,!f),d.setUint32(p+4+8*l,i[l].denominator,!f);break;case 10:if(c==1)d.setInt32(p,i.numerator,!f),d.setInt32(p+4,i.denominator,!f);else for(l=0;l<c;l++)d.setInt32(p+8*l,i[l].numerator,!f),d.setInt32(p+4+8*l,i[l].denominator,!f);break}return t}function ze(e,t=0){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");const r=new DataView(e);if(r.getUint32(t+36)!==1633907568)return console.error("[MiNi exif]: ICC missing valid signature");const n=V(r,t+16,4),i=r.getUint32(t+128);let o=t+128+4,s={ColorSpace:n};for(let a=0;a<i;a++){let c=V(r,o,4),d=r.getUint32(o+4),f=r.getUint32(o+8);if(c==="desc"){c="ColorProfile";const l=V(r,t+d,4);let u=[];if(l==="mluc"){const p=r.getUint32(t+d+8);if(r.getUint32(t+d+12)!==12)return console.error("[MiNi exif]: ICC with invalid mluc");const h=t+d+16;for(let v=0;v<p;v++){const g=r.getUint32(h+v*12+4),w=r.getUint32(h+v*12+8);u.push(V(r,t+d+w,g).replaceAll("\0",""))}d+=28}else l==="desc"&&(f=r.getUint32(t+d+8),u.push(V(r,t+d+12,f).replaceAll("\0","")));s[c]=u}o+=12}return s}function xe(e){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");const t=e.byteLength,r=new DataView(e);if(r.getUint16(0)!==65496)return console.error("[MiNi exif]: data is not JPG");const n=65498;let i=[],o=null,s=2;for(i.push({marker:"0xFFD8",data:e.slice(0,2)});o!=n;){let a=s;o=r.getUint16(a);const c=r.getUint16(a+2),d=o.toString(16).toUpperCase().padStart(6,"0x");o!=n?i.push({marker:d,data:e.slice(s,s+2+c)}):i.push({marker:d,data:e.slice(s,t)}),s+=2+c}return i}function ar(e){const t=xe(e);let r,n;const i=t.filter(s=>s.marker==="0xFFE1");i?.length&&i.forEach(s=>{String.fromCharCode(...new Uint8Array(s.data.slice(4,8)))==="Exif"?r=s:n=s});const o=lr(e,t);return{exif:r?.data,icc:o?.data,xml:n?.data}}function lr(e,t){const r="ICC_PROFILE\0";t||(t=xe(e));const n=t.find(i=>i.marker==="0xFFE2");return n?String.fromCharCode(...new Uint8Array(n.data.slice(4,16)))!==r?(console.error("[MiNi exif]: ICC_PROFILE missing"),null):n:null}function sr(e){if(!e)return console.error("[MiNi exif]: please load file first");const t=xe(e).filter(r=>r.marker!=="0xFFE1");return te(...t.map(r=>r.data))}function cr(e){const t=We(65505).buffer,r=We(e.byteLength+8).buffer,n=At("Exif\0\0").buffer;return te(t,r,n,e)}function Ye(e,t){if(!e)return console.error("[MiNi exif]: please load file first");if(!t)return console.error("[MiNi exif]: exif data missing");const r=xe(e).filter(i=>i.marker!=="0xFFE1"),n=cr(t);return te(r[0].data,n,...r.slice(1).map(i=>i.data))}function ur(e){let t=e,r,n,i,o,s;function a(){if(t){const{exif:c,icc:d,xml:f}=ar(t);r=c,n=d,i=f}if(r?(o=Fe(r,10),s=r.slice(10)):(o=null,s=null),n&&(o={...o,icc:ze(n,18)}),i){const c=new TextDecoder().decode(i.slice(4));o={...o,xml:c}}}return a(),{load:c=>{t=c,a()},remove:()=>(t=sr(t),a(),t),read:()=>({...o,format:"JPG"}),extract:()=>s,image:()=>t,replace:c=>(t=Ye(t,c),a(),t),download:c=>Ie(t,c),patch:c=>{function d(f){if(f instanceof Object){const{area:l,field:u,value:p,value2:h}=f;if(!l||!u||p===void 0)return console.error("[MiNi exif]: patch missing input",l,u,p);s=De(o,s,l,u,p,h)}else return console.error("[MiNi exif]: patch wrong input",f)}if(!o)return console.error("[MiNi exif]: no exif data");c instanceof Array?c.forEach(f=>d(f)):c instanceof Object&&d(c),t=Ye(t,s),a()}}}let ge;function fr(e){if(!ge){ge=new Uint32Array(256);for(let i=0;i<256;i++){let o=i;for(let s=0;s<8;s++)o&1?o=3988292384^o>>>1:o=o>>>1;ge[i]=o}}for(var t=-1,r=new Uint8Array(e),n=0;n<e.byteLength;n++)t=t>>>8^ge[(t^r[n])&255];return(t^-1)>>>0}function dr(e,t,r){const n=e.getUint32(t),i=V(e,t+4,4),o=t+8,s=e.getUint32(t+8+n),a=r.slice(t,t+12+n);return{len:n,type:i,data:a,dataoffset:o,crc:s}}function Ue(e){return e.data.slice(8,-4)}function pr(e,t){const r=e.byteLength,n=He(e.byteLength).buffer,i=At(t).buffer;let o=te(n,i,e);const s=fr(o.slice(4)),a=He(s).buffer;return o=te(o,a),{len:r,type:t,data:o,crc:s}}function ve(e){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");const t=e.byteLength,r=new DataView(e);if(r.getUint32(0)!==2303741511||r.getUint32(4)!==218765834)return console.error("[MiNi exif]: data is not PNG");let n=8,i=[{len:8,type:"",data:e.slice(0,8),dataoffset:0,crc:0}];for(;n<t;){const o=dr(r,n,e);i.push(o),n+=12+o.len}return i}function vr(e){const t=ve(e);let r=t.find(o=>o.type==="eXIf");r&&(r=Ue(r));let n=gr(e,t);if(n){let o=!0,s=0,a=new Uint8Array(n);for(;o!==0;)o=a[s++];s++,a=a.slice(s),n=Qt(new Uint8Array(a))?.buffer}let i=hr(e,t);return{exif:r,icc:n,xml:i}}function hr(e,t){t||(t=ve(e));let r=null;const n=t.filter(i=>i.type==="iTXt");return n?.length&&n.forEach(i=>{const o=Ue(i);String.fromCharCode(...new Uint8Array(o.slice(0,3)))==="XML"&&(r=o)}),r}function gr(e,t){t||(t=ve(e));const r=t.find(n=>n.type==="iCCP");return r?Ue(r):null}function mr(e){if(!e)return console.error("[MiNi exif]: please load file first");const t=ve(e).filter(r=>r.type!=="eXIf"&&r.type!=="iTXt");return te(...t.map(r=>r.data))}function Ze(e,t){if(!e)return console.error("[MiNi exif]: please load file first");if(!t)return console.error("[MiNi exif]: exif data missing");const r=ve(e).filter(i=>i.type!=="eXIf"&&i.type!=="iTXt"),n=pr(t,"eXIf");return te(...r.slice(0,2).map(i=>i.data),n.data,...r.slice(2).map(i=>i.data))}function xr(e){let t=e,r,n,i,o,s;function a(){if(t){const{exif:c,icc:d,xml:f}=vr(t);r=c,n=d,i=f}if(r?(o=Fe(r,0),s=r.slice(0)):(o=null,s=null),n&&(o={...o,icc:ze(n,0)}),i){const c=new TextDecoder().decode(i);o={...o,xml:c}}}return a(),{load:c=>{t=c,a()},remove:()=>(t=mr(t),a(),t),read:()=>({...o,format:"PNG"}),extract:()=>s,image:()=>t,replace:c=>(t=Ze(t,c),a(),t),download:c=>Ie(t,c),patch:c=>{function d(f){if(f instanceof Object){const{area:l,field:u,value:p,value2:h}=f;if(!l||!u||p===void 0)return console.error("[MiNi exif]: patch input missing",l,u,p);s=De(o,s,l,u,p,h)}else return console.error("[MiNi exif]: patch input wrong",f)}if(!o)return console.error("[MiNi exif]: no exif data");c instanceof Array?c.forEach(f=>d(f)):c instanceof Object&&d(c),t=Ze(t,s),a()}}}function br(e,t){const r=e.getUint32(t);return r===0?{length:e.byteLength-t,contentOffset:t+4+4}:r===1&&e.getUint32(t+8)===0?{length:e.getUint32(t+12),contentOffset:t+4+4+8}:{length:r,contentOffset:t+4+4}}function yr(e,t){const{length:r,contentOffset:n}=br(e,t);return r<8?void 0:{type:e.getUint32(t+4),length:r,str:V(e,t+4,4),contentOffset:n}}function Ke(e,t){let r={},n=t.length-8,i=t.contentOffset;for(;n>0;){const o=V(e,i+4,4),s=e.getUint32(i);r[o]={length:s,str:o,contentOffset:i+8},i+=s,n-=s}return r}function wr(e){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");e.byteLength;const t=new DataView(e);if(t.getUint32(4)!==1718909296&&t.getUint32(8)!==1751476579||t.getUint32(4)!==1718909296&&t.getUint32(8)!==1635150182)return console.error("[MiNi exif]: data is not HEIC/AVIF");let r={};t.getUint32(8)===1751476579?r={_format:"HEIC"}:r={_format:"AVIF"};let n=0,i,o,s={},a={};for(;n+4+4<=t.byteLength;){const c=yr(t,n);if(c===void 0)break;if(c.str==="meta"){n+=12;continue}if(c.str==="iinf"){let d=t.getUint32(c.contentOffset+2),f=c.contentOffset+8+2;for(let l=0;l<d;l++)if(t.getUint32(f+12)===1165519206?i=t.getUint32(f+8):t.getUint32(f+12)===1835625829&&(o=t.getUint32(f+8)),l+1<d)for(f+=16;t.getUint32(f)!==1768842853&&f<2e4;)f++}else if(c.str==="iloc"){t.getUint32(c.contentOffset+2);const d=t.getUint16(c.contentOffset+6),f=(c.length-16)/d,l=c.contentOffset+8;for(let u=0;u<d;u++)if(f===16){const p=t.getUint32(l+u*f),h=t.getUint32(l+u*f+8),v=t.getUint32(l+u*f+12);a[p]={id:p,off:h,size:v,type:"heic"}}else if(f===18){const p=t.getUint32(l+u*f);let h=t.getUint32(l+u*f+4);h||(h=t.getUint32(l+u*f+10));const v=t.getUint32(l+u*f+14);a[p]={id:p,off:h,size:v,type:"avif"}}else console.error("[MiNi exif]: unknown iloc block length",f)}else if(c.str==="iprp"){const d=Ke(t,c);if(d.ipco){const f=Ke(t,d.ipco);if(f.colr){const l=V(t,f.colr.contentOffset,4);if(l==="prof"||l==="rICC"){const u=f.colr.contentOffset+4;s={offset:u,data:e.slice(u,u+f.colr.length-8)}}}}}n+=c.length}if(i&&a[i]){const{off:c,size:d,type:f}=a[i];if(f==="heic"){const l=t.getUint32(c),u=e.slice(c+4+l,c+4+l+d-4-l);r.exif={data:u,offset:c+4+l}}else if(f==="avif"){const l=t.getUint32(c),u=e.slice(c+4+l,c+4+l+d-4-l);r.exif={data:u,offset:c+4+l}}}if(o&&a[o]){const{off:c,size:d,type:f}=a[o];if(f==="heic"){const l=e.slice(c,c+d);r.xml={data:l,offset:c}}else if(f==="avif"){const l=e.slice(c,c+d);r.xml={data:l,offset:c}}}return r.icc=s,r}function qe(e,t,r){if(!e)return console.error("[MiNi exif]: please load file first");if(!t)return console.error("[MiNi exif]: exif data missing");const n=r.offset,i=r.data.byteLength;return te(e.slice(0,n),t,e.slice(n+i))}function Cr(e){let t=e,r,n,i,o,s;function a(){if(t){const{exif:d,icc:f,xml:l,_format:u}=wr(t);n=d,i=f,o=l,r=u}c()}function c(){if(n?.data?(s=Fe(n.data,0),s={...s,format:r}):s=null,i?.data&&(s={...s,icc:ze(i.data,0)}),o){const d=new TextDecoder().decode(o.data);s={...s,xml:d}}}return a(),{load:d=>{t=d,a()},read:()=>s,extract:()=>n.data,image:()=>t,download:d=>Ie(t,d),replace:d=>d.byteLength!==n.data.byteLength?console.error("[MiNi exif]: new exif length must be "+n.data.byteLength+" bytes"):(t=qe(t,d,n),a(),t),patch:d=>{function f(l){if(l instanceof Object){const{area:u,field:p,value:h,value2:v}=l;if(!u||!p||h===void 0)return console.error("[MiNi exif]: patch missing input",u,p,h);n.data=De(s,n.data,u,p,h,v)}else return console.error("[MiNi exif]: patch wrong input",l)}if(!s)return console.error("[MiNi exif]: no exif data");d instanceof Array?d.forEach(l=>f(l)):d instanceof Object&&f(d),t=qe(t,n.data,n),a()}}}function _r(e,t){const r=e.getUint32(t);return r===0?{length:e.byteLength-t,contentOffset:t+4+4}:r===1&&e.getUint32(t+8)===0?{length:e.getUint32(t+12),contentOffset:t+4+4+8}:{length:r,contentOffset:t+4+4}}function Sr(e,t){const{length:r,contentOffset:n}=_r(e,t);return r<8?void 0:{type:e.getUint32(t+4),length:r,str:V(e,t+4,4),contentOffset:n}}function Je(e,t){let r={},n=t.length-8,i=t.contentOffset;for(;n>0;){const o=V(e,i+4,4),s=e.getUint32(i);r[o]={length:s,str:o,contentOffset:i+8},i+=s,n-=s}return r}function $r(e){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");e.byteLength;const t=new DataView(e);if(!(t.getUint32(4)===1718909296&&t.getUint32(8)===1903435808))return console.error("[MiNi exif]: data is not QuickTime");let r=0,n=[],i=[];for(;r+4+4<=t.byteLength;){const s=Sr(t,r);if(s===void 0)break;if(s.str==="meta"){r+=12;continue}if(s.str==="moov"){const a=Je(t,s);if(a.meta){const c=Je(t,a.meta);let d;if(c.keys){let f=c.keys.contentOffset;c.length,d=t.getUint32(f+4),f=f+8;for(let l=0;l<d;l++){const u=t.getUint32(f);if(t.getUint32(f+4)!==1835299937)continue;const p=V(t,f+8,u-8);n.push(p),f+=u}n=n.map(l=>l.replace("com.apple.quicktime.",""))}if(c.ilst){let f=c.ilst.contentOffset;for(let l=0;l<d;l++){const u=t.getUint32(f),p=t.getUint32(f+8);if(t.getUint32(f+12)!==1684108385)continue;const h=V(t,f+16+8,p-8-8);i.push({value:h,offset:f+16+8,type:2}),f+=u}}}}r+=s.length}let o={};if(n.length&&i.length){let s=n.reduce((a,c,d)=>(a[c]=i[d],a),{});if(o.meta=s,o.meta["location.ISO6709"]){const a=o.meta["location.ISO6709"].value;o.gps={GPSLatitude:{value:parseFloat(a)},GPSLongitude:{value:parseFloat(a.slice(8))},GPSAltitude:{value:parseFloat(a.slice(17))}}}}return o}function Bt(e,t=!1){if(!(e instanceof ArrayBuffer))return console.error("[MiNi exif]: input must be an ArrayBuffer");const r=new DataView(e);if(r.getUint16(0)===65496)return ur(e);if(r.getUint32(0)===2303741511&&r.getUint32(4)===218765834)return xr(e);if(r.getUint32(4)===1718909296&&(r.getUint32(8)===1751476579||r.getUint32(8)===1635150182))return Cr(e);if(t||r.getUint32(4)===1718909296&&r.getUint32(8)===1903435808)return $r(e);console.error("[MiNi exif]: unknown format")}function kr(e,t){const{gl:r,img:n}=e;t=t||{translateX:0,translateY:0,angle:0,scale:0,flipv:0,fliph:0};let{translateX:i,translateY:o,angle:s,scale:a,flipv:c,fliph:d}=t;a+=1;let f=[a,a];const l=[Math.round(r.canvas.width*i*100)/100,Math.round(r.canvas.height*o*100)/100],u=`#version 300 es
        in vec2 vertex;
        uniform mat3 matrix;
        out vec2 texCoord;
        void main() {
          texCoord = vertex;
          gl_Position = vec4((matrix * vec3(vertex, 1)).xy, 0, 1);
        }
      `,p=`#version 300 es
        precision highp float;
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;   
        void main() {
          outColor = texture(_texture, vec2(texCoord.x, texCoord.y));
        }
      `;if(r.canvas.width===e.height){const E=n.width/n.height;f[0]*=E,f[1]/=E}const h=N.projection(r.canvas.width,r.canvas.height),v=N.translation(l[0],l[1]),g=N.rotation(-s*Math.PI/180),w=N.scaling(f[0]*(-d||1),f[1]*(-c||1));let $=[1,0,0,0,1,0,0,0,1];$=N.multiply($,h),$=N.multiply($,v),$=N.multiply($,N.translation(r.canvas.width/2,r.canvas.height/2)),$=N.multiply($,g),$=N.multiply($,w),$=N.multiply($,N.translation(-r.canvas.width/2,-r.canvas.height/2)),$=N.multiply($,N.scaling(r.canvas.width,r.canvas.height)),e._.$matrix=e._.$matrix||new G(r,u,p),e.runFilter(e._.$matrix,{matrix:$})}var N={projection:function(e,t){return[2/e,0,0,0,2/t,0,-1,-1,1]},translation:function(e,t){return[1,0,0,0,1,0,e,t,1]},rotation:function(e){var t=Math.cos(e),r=Math.sin(e);return[t,-r,0,r,t,0,0,0,1]},scaling:function(e,t){return[e,0,0,0,t,0,0,0,1]},multiply:function(e,t){var r=e[0],n=e[0*3+1],i=e[0*3+2],o=e[1*3+0],s=e[1*3+1],a=e[1*3+2],c=e[2*3+0],d=e[2*3+1],f=e[2*3+2],l=t[0*3+0],u=t[0*3+1],p=t[0*3+2],h=t[1*3+0],v=t[1*3+1],g=t[1*3+2],w=t[2*3+0],$=t[2*3+1],E=t[2*3+2];return[l*r+u*o+p*c,l*n+u*s+p*d,l*i+u*a+p*f,h*r+v*o+g*c,h*n+v*s+g*d,h*i+v*a+g*f,w*r+$*o+E*c,w*n+$*s+E*d,w*i+$*a+E*f]}};function Er(e,t,r){const{gl:n}=e;r+=1;const i=`
    vec3 fromLinear(vec3 linearRGB) {
        bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
        vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
        vec3 lower = linearRGB.rgb * vec3(12.92);
        return vec3(mix(higher, lower, cutoff));
    }
    vec3 toLinear(vec3 sRGB) {
        bvec3 cutoff = lessThan(sRGB.rgb, vec3(0.04045));
        vec3 higher = pow((sRGB.rgb + vec3(0.055))/vec3(1.055), vec3(2.4));
        vec3 lower = sRGB.rgb/vec3(12.92);
        return vec3(mix(higher, lower, cutoff));
    }`;if(t.type==="1"){const o=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D map;
        uniform float filterStrength;

        ${i}

        vec4 lut(vec4 color) {
          vec3 texel = color.rgb;
          texel = fromLinear(texel);
          float size = 33.0;
          float sliceSize = 1.0 / size;
          float slicePixelSize = sliceSize / size;
          float sliceInnerSize = slicePixelSize * (size - 1.0);
          float xOffset = 0.5 * sliceSize + texel.x * (1.0 - sliceSize);
          float yOffset = 0.5 * slicePixelSize + texel.y * sliceInnerSize;
          float zOffset = texel.z * (size - 1.0);
          float zSlice0 = floor(zOffset);
          float zSlice1 = zSlice0 + 1.0;
          float s0 = yOffset + (zSlice0 * sliceSize);
          float s1 = yOffset + (zSlice1 * sliceSize);
          vec4 slice0Color = texture(map, vec2(xOffset, s0));
          vec4 slice1Color = texture(map, vec2(xOffset, s1));
          texel =  mix(slice0Color, slice1Color, zOffset - zSlice0).rgb;
          texel = toLinear(texel);
          return vec4(texel, color.a);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          outColor = color * (1.0 - filterStrength) + lut(color) * filterStrength;
        }
    `;e._.$insta1=e._.$insta1||new G(n,null,o),e._.$instatxt1=e._.$instatxt1||new Z(n),e._.$instatxt1.loadImage(t.map1,n.RGBA),e._.$instatxt1.use(1),e.runFilter(e._.$insta1,{filterStrength:r??1,map:{unit:1}})}else if(t.type==="2"){const o=`#version 300 es
        precision highp float;
        precision highp int;
        
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D map;
        uniform sampler2D map2;
        uniform float filterStrength;

        ${i}

        vec4 lut(vec4 color) {
          vec3 texel = color.rgb;
          texel = fromLinear(texel);
          texel.r = texture(map, vec2(texel.r, 0.5)).r;
          texel.g = texture(map, vec2(texel.g, 0.5)).g;
          texel.b = texture(map, vec2(texel.b, 0.5)).b;
          float luma = dot(vec3(0.2126, 0.7152, 0.0722), texel);
          float shadowCoeff = 0.35 * max(0.0, 1.0 - luma);
          texel = mix(texel, max(vec3(0.0), 2.0 * texel - 1.0), shadowCoeff);
          texel = mix(texel, vec3(luma), -0.3);
          texel.r = texture(map2, vec2(texel.r, 0.5)).r;
          texel.g = texture(map2, vec2(texel.g, 0.5)).g;
          texel.b = texture(map2, vec2(texel.b, 0.5)).b;
          texel = toLinear(texel);
          return vec4(texel, color.a);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          color = color * (1.0 - filterStrength) + lut(color) * filterStrength;
          outColor = color;
        }
    `;e._.$insta2=e._.$insta2||new G(n,null,o),e._.$instatxt1=e._.$instatxt1||new Z(n),e._.$instatxt2=e._.$instatxt2||new Z(n),e._.$instatxt1.loadImage(t.map1,n.RGBA),e._.$instatxt2.loadImage(t.map2,n.RGBA),e._.$instatxt1.use(1),e._.$instatxt2.use(2),e.runFilter(e._.$insta2,{filterStrength:r??1,map:{unit:1},map2:{unit:2}})}else if(t.type==="3"){const o=`#version 300 es
        precision highp float;
        precision highp int;
        
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D map;
        uniform sampler2D mapLgg;
        uniform float filterStrength;

        ${i}

        vec4 lut(vec4 color) {
          vec3 texel = color.rgb;
          texel = fromLinear(texel);
          texel = min(texel * 1.1343, vec3(1.0));
          texel.r = texture(map, vec2(texel.r, 0.5)).r;
          texel.g = texture(map, vec2(texel.g, 0.5)).g;
          texel.b = texture(map, vec2(texel.b, 0.5)).b;
          vec3 shadowColor = vec3(0.956862, 0.0, 0.83529);
          float luma = dot(vec3(0.309, 0.609, 0.082), texel);
          vec3 shadowBlend = 2.0 * shadowColor * texel;
          float shadowAmount = 0.6 * max(0.0, (1.0 - 4.0 * luma));
          texel = mix(texel, shadowBlend, shadowAmount);
          vec3 lgg;
          lgg.r = texture(mapLgg, vec2(texel.r, 0.5)).r;
          lgg.g = texture(mapLgg, vec2(texel.g, 0.5)).g;
          lgg.b = texture(mapLgg, vec2(texel.b, 0.5)).b;
          texel = mix(texel, lgg, min(1.0, 0.8 + luma));
          texel = toLinear(texel);
          return vec4(texel, color.a);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          outColor = color * (1.0 - filterStrength) + lut(color) * filterStrength;
        }
    `;e._.$insta3=e._.$insta3||new G(n,null,o),e._.$instatxt1=e._.$instatxt1||new Z(n,0,0,n.RGBA,n.UNSIGNED_BYTE),e._.$instatxt1.loadImage(t.map1,n.RGBA),e._.$instatxt2=e._.$instatxt2||new Z(n,0,0,n.RGBA,n.UNSIGNED_BYTE),e._.$instatxt2.loadImage(t.map2,n.RGBA),e._.$instatxt1.use(1),e._.$instatxt2.use(2),e.runFilter(e._.$insta3,{filterStrength:r??1,map:{unit:1},mapLgg:{unit:2}})}else if(t.type==="4"){const o=`#version 300 es
        precision highp float;
        precision highp int;
        
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D map;
        uniform sampler2D map2;
        uniform float filterStrength;

        ${i}

        vec4 lut(vec4 color) {
          vec3 texel = color.rgb;
          texel = fromLinear(texel);
          texel.r = texture(map, vec2(texel.r, 0.5)).r;
          texel.g = texture(map, vec2(texel.g, 0.5)).g;
          texel.b = texture(map, vec2(texel.b, 0.5)).b;
          vec3 desat = vec3(dot(vec3(0.7, 0.2, 0.1), texel));
          texel = mix(texel, desat, 0.79);
          texel = vec3(min(1.0, 1.2 * dot(vec3(0.2, 0.7, 0.1), texel)));
          texel.r = texture(map2, vec2(texel.r, 0.5)).r;
          texel.g = texture(map2, vec2(texel.g, 0.5)).g;
          texel.b = texture(map2, vec2(texel.b, 0.5)).b;
          texel = toLinear(texel);
          return vec4(texel, color.a);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          outColor = color * (1.0 - filterStrength) + lut(color) * filterStrength;
        }
    `;e._.$insta4=e._.$insta4||new G(n,null,o),e._.$instatxt1=e._.$instatxt1||new Z(n,0,0,n.RGBA,n.UNSIGNED_BYTE),e._.$instatxt1.loadImage(t.map1,n.RGBA),e._.$instatxt2=e._.$instatxt2||new Z(n,0,0,n.RGBA,n.UNSIGNED_BYTE),e._.$instatxt2.loadImage(t.map2,n.RGBA),e._.$instatxt1.use(1),e._.$instatxt2.use(2),e.runFilter(e._.$insta4,{filterStrength:r??1,map:{unit:1},map2:{unit:2}})}else if(t.type==="MTX"){const o=`#version 300 es
        precision highp float;
        precision highp int;
        
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform float filterStrength;
        uniform mat4 uColorMatrix;
        uniform vec4 uColorOffset;

        vec4 applyColorMatrix(vec4 c, mat4 m, vec4 o) {
            vec4 res = (c * m) + (o * c.a);
            res = clamp(res, 0.0, 1.0);
            return res;
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          color = applyColorMatrix(color, uColorMatrix, uColorOffset);
          outColor = color;
        }
    `;let s={identity:[[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0]],polaroid:[[1+.438*r,-.062*r,-.062*r,0,0],[-.122*r,1+.378*r,-.122*r,0,0],[-.016*r,-.016*r,1+.483*r,0,0],[0,0,0,1,0]],kodachrome:[[(1+.1285582396593525*r)*((r/2+1)/2+.5),-.3967382283601348*r,-.03992559172921793*r,0,.06372958762196503*r],[-.16404339962244616*r,(1+.0835251566291304*r)*((r/2+1)/2+.5),-.05498805115633132*r,0,.024732407896706204*r],[-.16786010706155763*r,-.5603416277695248*r,(1+.6014850761964943*r)*((r/2+1)/2+.5),0,.03562982807460946*r],[0,0,0,1,0]],browni:[[(1-.4002976502*r)*((r/1.5+1)/2+.5),.34553243048391263*r,-.2708298674538042*r,0,.09486385711201746*r],[-.037703249837783157*r,(1-.1390422412*r)*((r/1.5+1)/2+.5),.15059552388459913*r,0,-.07393682996638255*r],[.24113635128153335*r,-.07441037908422492*r,(1-.5502781794*r)*((r/1.5+1)/2+.5),0,-.015124150555182566*r],[0,0,0,1,0]],vintage:[[(1-.3720654364*r)*((r/1.5+1)/2+.5),.3202183420819367*r,-.03965408211312453*r,0,.009651285835294123*r],[.02578397704808868*r,(1-.3558811356*r)*((r/1.5+1)/2+.5),.03259127616149294*r,0,.007462829176470591*r],[.0466055556782719*r,-.0851232987247891*r,(1-.4758351981*r)*((r/1.5+1)/2+.5),0,.005159190588235296*r],[0,0,0,1,0]]},a=s.identity,c=[0,0,0,0];r&&(a=Ar(a,s[t.mtx],4)),r&&(c=[0,1,2,3].map(l=>c[l]+s[t.mtx][l][4])),e._.$insta5=e._.$insta5||new G(n,null,o);const d=a.flat(),f=c;e.runFilter(e._.$insta5,{uColorMatrix:d,uColorOffset:f})}}function Ar(e,t,r=3){let n=[];for(var i=0;i<r;i++){n.push([]);for(var o=0;o<r;o++){n[i].push(0);for(var s=0;s<r;s++)e[i]&&t[s]&&(n[i][o]+=e[i][s]*t[s][o])}}return n}function Ge(e){var t=e.length;this.xa=[],this.ya=[],this.u=[],this.y2=[],e.sort(function(a,c){return a[0]-c[0]});for(var r=0;r<t;r++)this.xa.push(e[r][0]),this.ya.push(e[r][1]);this.u[0]=0,this.y2[0]=0;for(var r=1;r<t-1;++r){var n=this.xa[r+1]-this.xa[r-1],i=(this.xa[r]-this.xa[r-1])/n,o=i*this.y2[r-1]+2;this.y2[r]=(i-1)/o;var s=(this.ya[r+1]-this.ya[r])/(this.xa[r+1]-this.xa[r])-(this.ya[r]-this.ya[r-1])/(this.xa[r]-this.xa[r-1]);this.u[r]=(6*s/n-i*this.u[r-1])/o}this.y2[t-1]=0;for(var r=t-2;r>=0;--r)this.y2[r]=this.y2[r]*this.y2[r+1]+this.u[r]}Ge.prototype.at=function(e){for(var t=this.ya.length,r=0,n=t-1;n-r>1;){var i=n+r>>1;this.xa[i]>e?n=i:r=i}var o=this.xa[n]-this.xa[r],s=(this.xa[n]-e)/o,a=(e-this.xa[r])/o;return s*this.ya[r]+a*this.ya[n]+((s*s*s-s)*this.y2[r]+(a*a*a-a)*this.y2[n])*(o*o)/6};function Se(e){for(var t=new Ge(e),r=[],n=0;n<256;n++)r.push(Br(0,Math.floor(t.at(n/255)*256),255));return r}function Br(e,t,r){return Math.max(e,Math.min(t,r))}function Pr(e,t){if(t.every(c=>c===null))return;t[0]||(t[0]=[[0,0],[1,1]]);let r=t[1]||t[0],n=t[2]||t[0],i=t[3]||t[0];if(r=Se(r),n=Se(n),i=Se(i),r.length!==256||n.length!==256||i.length!==256)return console.error("curves: input unknown");for(var t=[],o=0;o<256;o++)t.splice(t.length,0,r[o],n[o],i[o],255);const s=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D curvemap;

        void main() {
            vec4 color = texture(_texture, texCoord);
            color.r = texture(curvemap, vec2(color.r)).r;
            color.g = texture(curvemap, vec2(color.g)).g;
            color.b = texture(curvemap, vec2(color.b)).b;
            outColor = color;
        }
      `,{gl:a}=e;e._.$curvestexture=e._.$curvestexture||new Z(a),e._.$curvestexture.initFromBytes(256,1,t,a.RGBA),e._.$curvestexture.use(2),e._.$curves=e._.$curves||new G(a,null,s),e.runFilter(e._.$curves,{curvemap:{unit:2}})}function Mr(e,t,r,n){const i=`#version 300 es
            precision highp float;

            in vec2 texCoord;
            uniform sampler2D _texture;
            uniform vec2 uResolution;
            uniform mat3 matrix;
            uniform bool useTextureSpace;
            out vec4 outColor;

            void main() {
                vec2 coord = texCoord * uResolution;
                if (useTextureSpace) coord = coord / uResolution * 2.0 - 1.0;
                vec3 warp = matrix * vec3(coord, 1.0);
                coord = warp.xy / warp.z;
                if (useTextureSpace) coord = (coord * 0.5 + 0.5) * uResolution;
                vec4 color = texture(_texture, coord / uResolution);
                vec2 clampedCoord = clamp(coord, vec2(0.0), uResolution);
                if (coord != clampedCoord) {
                    //color.a *= max(0.0, 1.0 - length(coord - clampedCoord));
                    color.a = 0.;
                }
                outColor = color;
            }
          `,{gl:o,img:s}=e;if(e._.$warp=e._.$warp||new G(o,null,i),t=Array.prototype.concat.apply([],t),t.length==4)t=[t[0],t[1],0,t[2],t[3],0,0,0,1];else if(t.length!=9)throw"can only warp with 2x2 or 3x3 matrix";const a=[o.canvas.width,o.canvas.height];e.runFilter(e._.$warp,{matrix:r?Pt(t):t,uResolution:a,useTextureSpace:n|0})}function Rr(e,t,r,n,i){t=t.flat(),r=r.flat();var o=Qe.apply(null,r),s=Qe.apply(null,t),a=Tr(Pt(o),s);return Mr(e,a,n,i)}function Qe(e,t,r,n,i,o,s,a){var c=r-i,d=n-o,f=s-i,l=a-o,u=e-r+i-s,p=t-n+o-a,h=c*l-f*d,v=(u*l-f*p)/h,g=(c*p-u*d)/h;return[r-e+v*r,n-t+v*n,v,s-e+g*s,a-t+g*a,g,e,t,1]}function Pt(e){var t=e[0],r=e[1],n=e[2],i=e[3],o=e[4],s=e[5],a=e[6],c=e[7],d=e[8],f=t*o*d-t*s*c-r*i*d+r*s*a+n*i*c-n*o*a;return[(o*d-s*c)/f,(n*c-r*d)/f,(r*s-n*o)/f,(s*a-i*d)/f,(t*d-n*a)/f,(n*i-t*s)/f,(i*c-o*a)/f,(r*a-t*c)/f,(t*o-r*i)/f]}function Tr(e,t){return[e[0]*t[0]+e[1]*t[3]+e[2]*t[6],e[0]*t[1]+e[1]*t[4]+e[2]*t[7],e[0]*t[2]+e[1]*t[5]+e[2]*t[8],e[3]*t[0]+e[4]*t[3]+e[5]*t[6],e[3]*t[1]+e[4]*t[4]+e[5]*t[7],e[3]*t[2]+e[4]*t[5]+e[5]*t[8],e[6]*t[0]+e[7]*t[3]+e[8]*t[6],e[6]*t[1]+e[7]*t[4]+e[8]*t[7],e[6]*t[2]+e[7]*t[5]+e[8]*t[8]]}function Lr(e,t,r){const{gl:n}=e,i=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform sampler2D map;
        uniform float filterStrength;

        vec4 fromLinear(vec4 linearRGB) {
            bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
            vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
            vec3 lower = linearRGB.rgb * vec3(12.92);
            return vec4(mix(higher, lower, cutoff), linearRGB.a);
        }
        vec4 toLinear(vec4 sRGB) {
            bvec3 cutoff = lessThan(sRGB.rgb, vec3(0.04045));
            vec3 higher = pow((sRGB.rgb + vec3(0.055))/vec3(1.055), vec3(2.4));
            vec3 lower = sRGB.rgb/vec3(12.92);
            return vec4(mix(higher, lower, cutoff), sRGB.a);
        }

        void main(){
          vec4 color = texture(_texture, texCoord);
          vec4 texc = texture(map, texCoord);
          color = toLinear(color);
          texc = toLinear(texc);
          color = mix(color, texc, filterStrength);
          color = fromLinear(color);
          outColor = color;
        }`;e._.$blend=e._.$blend||new G(n,null,i),e._.$blendtxt=e._.$blendtxt||new Z(n),e._.$blendtxt.loadImage(t),e._.$blendtxt.use(1),e.runFilter(e._.$blend,{filterStrength:r??1,map:{unit:1}})}function Ir(e,t){const r=`#version 300 es
        //Bokeh disc. by David Hoskins.
        //https://www.shadertoy.com/view/4d2Xzw
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform float bokehstrength;
        uniform float bokehlensin;
        uniform float bokehlensout;
        uniform float centerX;
        uniform float centerY;

        #define GOLDEN_ANGLE 2.39996323
        #define ITERATIONS 512
        const mat2 rot = mat2(cos(GOLDEN_ANGLE), sin(GOLDEN_ANGLE), -sin(GOLDEN_ANGLE), cos(GOLDEN_ANGLE));
        vec3 Bokeh(sampler2D tex, vec2 uv, float radius)
        {
          vec3 acc = vec3(0), div = acc;
            float r = 1.;
            vec2 vangle = vec2(0.0,radius*.01 / sqrt(float(ITERATIONS)));
            
          for (int j = 0; j < ITERATIONS; j++)
            {  
                // the approx increase in the scale of sqrt(0, 1, 2, 3...)
                r += 1. / r;
              vangle = rot * vangle;
                vec3 col = texture(tex, uv + (r-1.) * vangle).xyz; /// ... Sample the image
                //col = col * col *1.8; // ... Contrast it for better highlights - leave this out elsewhere.
            vec3 bokeh = pow(col, vec3(4));
            acc += col * bokeh;
            div += bokeh;
          }
          return acc / div;
        }


        void main() {
            vec4 color = texture(_texture, texCoord);
            vec4 bcolor = vec4(Bokeh(_texture, texCoord, bokehstrength), 1.);
    
            //vignette used to control alpha
            //to blur inside circle smoothstep(lensin, lensout, dist)
            //to blur outside circle smoothstep(lensout, lensin, dist)
            float dist = distance(texCoord.xy, vec2(centerX,centerY));
            float vigfin = pow(1.-smoothstep(max(0.001,bokehlensout), bokehlensin, dist),2.);

            outColor = mix( color, bcolor, vigfin);
        }
      `,{gl:n}=e;let{bokehstrength:i=.5,bokehlensin:o=0,bokehlensout:s=.5,centerX:a=0,centerY:c=0}=t||{};e._.$lensblur=e._.$lensblur||new G(n,null,r),e.runFilter(e._.$lensblur,{bokehstrength:i,bokehlensin:o,bokehlensout:s,centerX:a,centerY:c})}function Fr(e,t){const r=`#version 300 es
        //https://www.shadertoy.com/view/XdfGDH
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform vec2 uResolution;
        uniform float gaussianstrength;
        uniform float gaussianlensin;
        uniform float gaussianlensout;
        uniform float centerX;
        uniform float centerY;

        float normpdf(in float x, in float sigma)
        {
          return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
        }

        void main() {
            vec4 color = texture(_texture, texCoord);

            //declare stuff
            const int mSize = 11;
            const int kSize = (mSize-1)/2;
            float kernel[mSize];
            vec3 final_colour = vec3(0.0);
            
            //create the 1-D kernel
            float sigma = 7.0*gaussianstrength;
            float Z = 0.0;
            for (int j = 0; j <= kSize; ++j)
            {
              kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);
            }
            
            //get the normalization factor (as the gaussian has been clamped)
            for (int j = 0; j < mSize; ++j)
            {
              Z += kernel[j];
            }
            
            //read out the texels
            for (int i=-kSize; i <= kSize; ++i)
            {
              for (int j=-kSize; j <= kSize; ++j)
              {
                final_colour += kernel[kSize+j]*kernel[kSize+i]*texture(_texture, (texCoord.xy+vec2(float(i),float(j))/uResolution)).rgb;
              }
            }
            
            //vignette used to control alpha
            //to blur inside circle smoothstep(lensin, lensout, dist)
            //to blur outside circle smoothstep(lensout, lensin, dist)
            float dist = distance(texCoord.xy, vec2(centerX,centerY));
            float vigfin = pow(1.-smoothstep(max(0.001,gaussianlensout), gaussianlensin, dist),2.);

            outColor = mix( color, vec4(final_colour/(Z*Z), 1.0), vigfin);
        }
      `,{gl:n}=e;let{gaussianstrength:i=.5,gaussianlensin:o=0,gaussianlensout:s=.5,centerX:a=0,centerY:c=0}=t||{};const d=[n.canvas.width,n.canvas.height];e._.$gaussianblur=e._.$gaussianblur||new G(n,null,r),e.runFilter(e._.$gaussianblur,{gaussianstrength:i,gaussianlensin:o,gaussianlensout:s,centerX:a,centerY:c,uResolution:d})}function Dr(e,t){const r=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform vec2 uTextureSize;
        uniform mat4 uColorMatrix;
        uniform vec4 uColorOffset;
        uniform float uClarityKernel[9];
        uniform float uClarityKernelWeight;
        uniform float uColorGamma;
        uniform float uVibrance;
        uniform float uColorVignette;
        uniform vec2 uVignettePos;
        uniform float vibrance;

        vec4 applyGamma(vec4 c, float g) {
            c.r = pow(c.r, g);
            c.g = pow(c.g, g);
            c.b = pow(c.b, g);
            return c;
        }
        vec4 applyVibrance(vec4 c, float v){
          float max = max(c.r, max(c.g, c.b));
          float avg = (c.r + c.g + c.b) / 3.0;
          float amt = (abs(max - avg) * 2.0) * -v;
          c.r += max != c.r ? (max - c.r) * amt : 0.00;
          c.g += max != c.g ? (max - c.g) * amt : 0.00;
          c.b += max != c.b ? (max - c.b) * amt : 0.00;
          return c;
        }
        vec4 applyColorMatrix(vec4 c, mat4 m, vec4 o) {
            vec4 res = (c * m) + (o * c.a);
            res = clamp(res, 0.0, 1.0);
            return res;
        }
        vec4 applyConvolutionMatrix(vec4 c, float k0, float k1, float k2, float k3, float k4, float k5, float k6, float k7, float k8, float w) {
          vec2 pixel = vec2(1) / uTextureSize;
          vec4 colorSum = texture(_texture, texCoord - pixel) * k0 + texture(_texture, texCoord + pixel * vec2(0.0, -1.0)) * k1 + texture(_texture, texCoord + pixel * vec2(1.0, -1.0)) * k2 + texture(_texture, texCoord + pixel * vec2(-1.0, 0.0)) * k3 + texture(_texture, texCoord) * k4 + texture(_texture, texCoord + pixel * vec2(1.0, 0.0)) * k5 + texture(_texture, texCoord + pixel * vec2(-1.0, 1.0)) * k6 + texture(_texture, texCoord + pixel * vec2(0.0, 1.0)) * k7 + texture(_texture, texCoord + pixel) * k8;
          vec4 color = vec4(clamp((colorSum / w), 0.0, 1.0).rgb, c.a);
          return color;
        }

        vec4 applyVignette2(vec4 c, vec2 pos, float v, vec2 upos){
          #define inner .20
          #define outer 1.1
          #define curvature .65
          vec2 curve = pow(abs(pos),vec2(1./curvature));
          float edge = pow(length(curve),curvature);
          float scale = 1.-abs(upos.x);
          float vignette = 1.-v*smoothstep(inner*scale,outer*scale,edge);
          vec4 color = vec4(c.rgb *= vignette , c.a);
          return color;
        }

        vec4 vignette3(vec4 c, vec2 pos, float radius)
        {
            float ambientlight = 0.14;
            float circle = length(pos) - radius;
            float v = 1.0 - smoothstep(0.0, 0.4f, circle) + ambientlight;
            return vec4(c.rgb*v,c.a);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          if (uClarityKernelWeight != -1.0) { 
            color = applyConvolutionMatrix(color, uClarityKernel[0], uClarityKernel[1], uClarityKernel[2], uClarityKernel[3], uClarityKernel[4], uClarityKernel[5], uClarityKernel[6], uClarityKernel[7], uClarityKernel[8], uClarityKernelWeight); 
          } 
          color = applyGamma(color, uColorGamma);
          color = applyVibrance(color, uVibrance);
          color = applyColorMatrix(color, uColorMatrix, uColorOffset);
          if (uColorVignette != 0.0) {
            vec2 pos = texCoord.xy*2.-1. - uVignettePos;
            //color = vignette3(color, pos, uColorVignette);
            color = applyVignette2(color, pos, uColorVignette, uVignettePos);
          }
          outColor = color;
        }
      `,{gl:n}=e;let i=[0,0],{brightness:o=0,contrast:s=0,saturation:a=0,exposure:c=0,temperature:d=0,gamma:f=0,clarity:l=0,vibrance:u=0,vignette:p=0,tint:h=0,sepia:v=0}=t;o=o/4,s=(s+1)/2+.5,a=a+1,c=((c>0?c*3:c*1.5)+1)/2+.5,f+=1,d*=2,h*=2;let g={brightness:[[1,0,0,0,o],[0,1,0,0,o],[0,0,1,0,o],[0,0,0,1,0]],contrast:[[s,0,0,0,.5*(1-s)],[0,s,0,0,.5*(1-s)],[0,0,s,0,.5*(1-s)],[0,0,0,1,0]],saturation:[[.213+.787*a,.715-.715*a,.072-.072*a,0,0],[.213-.213*a,.715+.285*a,.072-.072*a,0,0],[.213-.213*a,.715-.715*a,.072+.928*a,0,0],[0,0,0,1,0]],exposure:[[c,0,0,0,0],[0,c,0,0,0],[0,0,c,0,0],[0,0,0,1,0]],temperature:d>0?[[1+.1*d,0,0,0,0],[0,1,0,0,0],[0,0,1+.1*-d,0,0],[0,0,0,1,0]]:[[1+.15*d,0,0,0,0],[0,1+.05*d,0,0,0],[0,0,1+.15*-d,0,0],[0,0,0,1,0]],tint:[[1,0,0,0,0],[0,1+.1*h,0,0,0],[0,0,1,0,0],[0,0,0,1,0]],sepia:[[1-.607*v,.769*v,.189*v,0,0],[.349*v,1-.314*v,.168*v,0,0],[.272*v,.534*v,1-.869*v,0,0],[0,0,0,1,0]],identity:[[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0]]},w=g.identity,$=[0,0,0,0];w=re(w,g.brightness,4),$=[0,1,2,3].map(y=>$[y]+g.brightness[y][4]),w=re(w,g.contrast,4),$=[0,1,2,3].map(y=>$[y]+g.contrast[y][4]),w=re(w,g.saturation,4),w=re(w,g.exposure,4),w=re(w,g.temperature,4),w=re(w,g.tint,4),w=re(w,g.sepia,4);let E=l>=0?[0,-1*l,0,-1*l,1+4*l,-1*l,0,-1*l,0]:[-1*l,-2*l,-1*l,-2*l,1+-3*l,-2*l,-1*l,-2*l,-1*l],x=E.reduce((y,k)=>y+k,0);x=x<=0?1:x,E=[E];const R=w.flat(),m=$,C=[n.canvas.width,n.canvas.height],B=u,L=p,A=E,S=x,U=i;e._.$adj=e._.$adj||new G(n,null,r),e.runFilter(e._.$adj,{uColorMatrix:R,uColorOffset:m,uColorGamma:1/f,uClarityKernel:A,uClarityKernelWeight:S,uTextureSize:C,uVibrance:B,uColorVignette:L,uVignettePos:U})}function zr(e,t,r){const n=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform float shadows;
        uniform float highlights;

        const mediump vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

        void main() {
          vec4 color = texture(_texture, texCoord);

          float luminance = dot(color.rgb, luminanceWeighting);
          float shadow = clamp((pow(luminance, 1.0/shadows) + (-0.76)*pow(luminance, 2.0/shadows)) - luminance, 0.0, 1.0);
          float highlight = clamp((1.0 - (pow(1.0-luminance, 1.0/(2.0-highlights)) + (-0.8)*pow(1.0-luminance, 2.0/(2.0-highlights)))) - luminance, -1.0, 0.0);
          vec3 result = vec3(0.0, 0.0, 0.0) + (luminance + shadow + highlight) * ((color.rgb - vec3(0.0, 0.0, 0.0))/luminance );

          // blend toward white if highlights is more than 1
          float contrastedLuminance = ((luminance - 0.5) * 1.5) + 0.5;
          float whiteInterp = contrastedLuminance*contrastedLuminance*contrastedLuminance;
          float whiteTarget = clamp(highlights, 0.0, 2.0) - 1.0;
          result = mix(result, vec3(1.0), whiteInterp*whiteTarget);

          // blend toward black if shadows is less than 1
          float invContrastedLuminance = 1.0 - contrastedLuminance;
          float blackInterp = invContrastedLuminance*invContrastedLuminance*invContrastedLuminance;
          float blackTarget = 1.0 - clamp(shadows, 0.0, 1.0);
          result = mix(result, vec3(0.0), blackInterp*blackTarget);

          outColor = vec4(result, color.a);
        }
  `,{gl:i}=e;e._.$sg=e._.$sg||new G(i,null,n),e.runFilter(e._.$sg,{highlights:t+1,shadows:r/2+1})}function Ur(e,t){const r=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform vec2 uResolution;
        uniform float filterStrength;


        vec4 BlurColor (in vec2 Coord, in sampler2D Tex, in float MipBias)
        {
            vec2 TexelSize = MipBias/uResolution.xy;
            vec4  Color = texture(Tex, Coord, MipBias);
            Color += texture(Tex, Coord + vec2(TexelSize.x,0.0), MipBias);      
            Color += texture(Tex, Coord + vec2(-TexelSize.x,0.0), MipBias);     
            Color += texture(Tex, Coord + vec2(0.0,TexelSize.y), MipBias);      
            Color += texture(Tex, Coord + vec2(0.0,-TexelSize.y), MipBias);     
            Color += texture(Tex, Coord + vec2(TexelSize.x,TexelSize.y), MipBias);      
            Color += texture(Tex, Coord + vec2(-TexelSize.x,TexelSize.y), MipBias);     
            Color += texture(Tex, Coord + vec2(TexelSize.x,-TexelSize.y), MipBias);     
            Color += texture(Tex, Coord + vec2(-TexelSize.x,-TexelSize.y), MipBias);    
            return Color/9.0;
        }

        void main() {
          float Threshold = 0.4;
          float Intensity = filterStrength*1.0;
          float BlurSize = 3.0 * Intensity;

          vec4 color = texture(_texture, texCoord);
          vec4 Highlight = clamp(BlurColor(texCoord.xy, _texture, BlurSize)-Threshold,0.0,1.0)*1.0/(1.0-Threshold);
          outColor = 1.0-(1.0-color)*(1.0-Highlight*Intensity); //Screen Blend Mode
        }
  `,{gl:n}=e,i=[n.canvas.width,n.canvas.height];e._.$bloom=e._.$bloom||new G(n,null,r),e.runFilter(e._.$bloom,{filterStrength:t,uResolution:i})}function Gr(e,t){const r=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        uniform vec2 uResolution;
        uniform float filterStrength;

        #define SIGMA 10.0
        #define BSIGMA 0.1
        #define MSIZE 15

        float normpdf(in float x, in float sigma)
        {
          return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
        }

        float normpdf3(in vec3 v, in float sigma)
        {
          return 0.39894*exp(-0.5*dot(v,v)/(sigma*sigma))/sigma;
        }

        vec4 applyFilter(vec4 c, sampler2D _texture, vec2 texCoord) {

          const int kSize = (MSIZE-1)/2;
          float kernel[MSIZE] = float[MSIZE](0.031225216, 0.033322271, 0.035206333, 0.036826804, 0.038138565, 0.039104044, 0.039695028, 0.039894000, 0.039695028, 0.039104044, 0.038138565, 0.036826804, 0.035206333, 0.033322271, 0.031225216);
          vec3 final_colour = vec3(0.0);
          
          vec3 cc;
          float factor;
          float Z = 0.0;
          float bZ = 1.0/normpdf(0.0, BSIGMA);
          for (int i=-kSize; i <= kSize; ++i)
          {
            for (int j=-kSize; j <= kSize; ++j)
            {
              cc = texture(_texture, (texCoord.xy+vec2(float(i),float(j))/uResolution)).rgb;
              factor = normpdf3(cc-c.rgb, BSIGMA)*bZ*kernel[kSize+j]*kernel[kSize+i];
              Z += factor;
              final_colour += factor*cc;
            }
          }
          
          return vec4(final_colour/Z, 1.0);
        }

        void main() {
          vec4 color = texture(_texture, texCoord);
          color = color * (1.0 - filterStrength) + applyFilter(color, _texture, texCoord) * filterStrength;
          outColor = color;
        }
  `,{gl:n}=e,i=[n.canvas.width,n.canvas.height];e._.$noise=e._.$noise||new G(n,null,r),e.runFilter(e._.$noise,{filterStrength:t,uResolution:i})}function re(e,t,r=3){let n=[];for(var i=0;i<r;i++){n.push([]);for(var o=0;o<r;o++){n[i].push(0);for(var s=0;s<r;s++)e[i]&&t[s]&&(n[i][o]+=e[i][s]*t[s][o])}}return n}const et=Object.freeze(Object.defineProperty({__proto__:null,filterAdjustments:Dr,filterBlend:Lr,filterBloom:Ur,filterBlurBokeh:Ir,filterBlurGaussian:Fr,filterCurves:Pr,filterHighlightsShadows:zr,filterInsta:Er,filterMatrix:kr,filterNoise:Gr,filterPerspective:Rr},Symbol.toStringTag,{value:"Module"}));function Or(e,t,r){let n=e.getContext("webgl2",{antialias:!1,premultipliedAlpha:!0});if(!n)return console.error("webgl2 not supported!");r==="display-p3"?(n.drawingBufferColorSpace="display-p3",n.unpackColorSpace="display-p3"):(n.drawingBufferColorSpace="srgb",n.unpackColorSpace="srgb");const i={width:0,height:0,gl:n,img:t,destroy:l,loadImage:h,paintCanvas:v,crop:R,resetCrop:m,resize:w,resetResize:$,captureImage:C,readPixels:B,runFilter:p,setupFiltersTextures:f,_:{}};n.canvas.width=i.width=t.width,n.canvas.height=i.height=t.height;const o=new Z(n);o.loadImage(t);const s=new G(n),a=new G(n,null,Nr);let c,d=0;function f(){c?.length&&c.forEach(S=>S.destroy()),c=[];for(var A=0;A<2;++A){const S=new Z(n,n.canvas.width,n.canvas.height);c.push(S)}}f();function l(){c?.length&&c.forEach(A=>A.destroy()),E&&E.destroy(),o.destroy(),delete i.img_cropped}let u;function p(A,S){S&&A.uniforms(S),u&&u.use(),c[d%2].drawTo(),A.drawRect(),u=c[d%2],d++}function h(){E?u=E:u=o,p(s,null)}function v(){u&&u.use(),n.bindFramebuffer(n.FRAMEBUFFER,null),a.drawRect()}let g={width:0,height:0};function w(A,S){n.canvas.width=i.width=g.width=A,n.canvas.height=i.height=g.height=S,f()}function $(){g.width&&(g.width=g.height=0,n.canvas.width=i.width=x.width||t.width,n.canvas.height=i.height=x.height||t.height,f())}let E,x={width:0,height:0};function R({left:A,top:S,width:U,height:y}){const k=U*y*4,I=new Uint8Array(k);p(s,{}),n.readPixels(A,S,U,y,n.RGBA,n.UNSIGNED_BYTE,I);const F=n.unpackColorSpace,X=new ImageData(new Uint8ClampedArray(I.buffer),U,y,{colorSpace:F});E=new Z(n),E.loadImage(X),n.canvas.width=i.width=x.width=U,n.canvas.height=i.height=x.height=y,f(),i.img_cropped=tt(X,F)}function m(){E&&(E.destroy(),E=null,x.width=x.height=0,n.canvas.width=i.width=g.width||t.width,n.canvas.height=i.height=g.height||t.height,delete i.img_cropped,f())}function C(A,S){p(s,{});const{width:U,height:y}=n.canvas,k=U*y*4,I=new Uint8Array(k);n.readPixels(0,0,U,y,n.RGBA,n.UNSIGNED_BYTE,I);const F=n.unpackColorSpace,X=new ImageData(new Uint8ClampedArray(I.buffer),U,y,{colorSpace:F});return tt(X,F,A,S)}function B(){p(s,{});const{width:A,height:S}=n.canvas,U=A*S*4,y=new Uint8Array(U);return n.readPixels(0,0,A,S,n.RGBA,n.UNSIGNED_BYTE,y),y}function L(A){return function(...S){A(i,...S)}}return Object.keys(et).forEach(A=>i[A]=L(et[A])),i}const Nr=`#version 300 es
        precision highp float;
        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;

        vec4 fromLinear(vec4 linearRGB) {
            bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
            vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
            vec3 lower = linearRGB.rgb * vec3(12.92);
            return vec4(mix(higher, lower, cutoff), linearRGB.a);
        }

        void main() {
            vec4 color = texture(_texture, vec2(texCoord.x, 1.0 - texCoord.y));
            //outColor = color;
            outColor = fromLinear(color);
        }`;function G(e,t,r){const n=`#version 300 es
        in vec2 vertex;
        out vec2 texCoord;

        void main() {
          texCoord = vertex;
          gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);
        }
      `,i=`#version 300 es
        precision highp float;

        in vec2 texCoord;
        uniform sampler2D _texture;
        out vec4 outColor;   

        void main() {
          outColor = texture(_texture, texCoord);
        }
      `,o=e.createProgram();let s;e.attachShader(o,d(e,e.VERTEX_SHADER,t||n)),e.attachShader(o,d(e,e.FRAGMENT_SHADER,r||i)),e.linkProgram(o);function a(f=!0,l,u,p,h){const v=e.getParameter(e.VIEWPORT);l=l!==void 0?(l-v[0])/v[2]:0,u=u!==void 0?(u-v[1])/v[3]:0,p=p!==void 0?(p-v[0])/v[2]:1,h=h!==void 0?(h-v[1])/v[3]:1,e.useProgram(o),e.vertexBuffer=e.vertexBuffer||e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,e.vertexBuffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array([l,u,l,h,p,u,p,h]),e.STATIC_DRAW),s||(s=e.getAttribLocation(o,"vertex"),e.enableVertexAttribArray(s)),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),f&&(e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT|e.GL_DEPTH_BUFFER_BIT)),e.drawArrays(e.TRIANGLE_STRIP,0,4)}function c(f={}){e.useProgram(o);for(let l in f){const u=e.getUniformLocation(o,l);if(u===null)continue;let p=f[l];if(Array.isArray(p))switch(p.length){case 1:{Array.isArray(p[0])&&(p=p[0]),e.uniform1fv(u,new Float32Array(p));break}case 2:e.uniform2fv(u,new Float32Array(p));break;case 3:e.uniform3fv(u,new Float32Array(p));break;case 4:e.uniform4fv(u,new Float32Array(p));break;case 9:e.uniformMatrix3fv(u,!1,new Float32Array(p));break;case 16:e.uniformMatrix4fv(u,!1,new Float32Array(p));break;default:throw`dont't know how to load uniform "`+l+'" of length '+p.length}else if(p?.unit)e.uniform1i(u,p.unit);else if(typeof p=="number")e.uniform1f(u,p);else throw'attempted to set uniform "'+l+'" to invalid value '+(p||"undefined").toString()}}function d(f,l,u){var p=f.createShader(l);if(f.shaderSource(p,u),f.compileShader(p),!f.getShaderParameter(p,f.COMPILE_STATUS))throw"compile error: "+f.getShaderInfoLog(p);return p}return{drawRect:a,uniforms:c}}function Z(e,t,r){let n=t,i=r,o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const s=e.SRGB8_ALPHA8;t&&r&&e.texImage2D(e.TEXTURE_2D,0,s,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null);function a(u=0){if(!o)return console.error("texture has been destroyed");e.activeTexture(e.TEXTURE0+u),e.bindTexture(e.TEXTURE_2D,o)}function c(){e.deleteTexture(o),o=null}function d(){if(!o)return console.error("texture has been destroyed");if(e.framebuffer=e.framebuffer||e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,e.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("incomplete framebuffer");e.viewport(0,0,n,i)}function f(u,p){if(!o)return console.error("texture has been destroyed");n=u.width,i=u.height,e.bindTexture(e.TEXTURE_2D,o);let h=p||e.SRGB8_ALPHA8;e.texImage2D(e.TEXTURE_2D,0,h,e.RGBA,e.UNSIGNED_BYTE,u)}function l(u,p,h,v){n=u,i=p,e.bindTexture(e.TEXTURE_2D,o);let g=v||e.SRGB8_ALPHA8;e.texImage2D(e.TEXTURE_2D,0,g,u,p,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(h))}return{use:a,destroy:c,drawTo:d,loadImage:f,initFromBytes:l}}function tt(e,t,r,n){const i=document.createElement("canvas");var o=i.getContext("2d",{colorSpace:t});i.width=e.width,i.height=e.height,o.putImageData(e,0,0);var s=new Image;return s.src=i.toDataURL(r,n),s}const rt="./assets/icon-BgvqB1Sr.png",it="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAXVBMVEVHcEz////19fb////////////////7+/z////8/f3///////////////8kKS////8AAAYQFx4cISgCCxXp6eo8QEWTlZimqKq4ubrb3N3Oz9BjZmlsb3J5fH9SV1ti3zuCAAAADnRSTlMAjOkVW5+z7zfPDGEUCtxuPFoAAAFVSURBVCiRdZPbksIgDIapOlJ0hSScofj+j7mBVmud3Vx0MnyTP8cKsdltnpQ0Rqppvomjne/KlbA8n0ssTt3Pn2y+5ugBLKIF8Clf551dZPKAejNkLC87i/hGA1N80ZkZWUsv1H2Mcij/XBMStoVTAoxPa0iUrj9dNHsONMa1GmIMtTljONRnFn6oBBq1OZgmDUk9xOw8aoIjBNL4dLOYCnu2HmG1XFaehIrQnSPMXDtEJeRiNXrzZZzKNinME1n/i8n+WM0K/4rssMsSuSNzRENWBdDc1BGm/sYFcStaW38IXVsv0xiCJ1jKzgq3yXXwEB7caM0NfAuj2Rya7/tj1QcPvmgIRvM+RnDBsbx18H1lFoqpPsiRb+lxhOvKxHwKsPcyIGE4bWd0YepDTO9IsuG0H9GJlaG6FVqgtLN+miXAssJqQ/k8zXHUeUub89dR//M7/AKcSin3jX0wmQAAAABJRU5ErkJggg==",Vr='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M43 21v23.873h-8.604V35L20 50l14.396 15v-9.877H43V79h4.5V21H43zm9.5 0v58H57V55.125h8.605v9.873L80 50L65.605 35.004v9.869H57V21h-4.5z"></path></g></svg>',Xr=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\r
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C12 5.44772 11.5523 5 11 5C10.4477 5 10 5.44772 10 6V16C10 16.5523 10.4477 17 11 17C11.5523 17 12 16.5523 12 16V6ZM9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9V16C7 16.5523 7.44772 17 8 17C8.55228 17 9 16.5523 9 16V9ZM15 9C15 8.44772 14.5523 8 14 8C13.4477 8 13 8.44772 13 9V16C13 16.5523 13.4477 17 14 17C14.5523 17 15 16.5523 15 16V9ZM18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13V16C16 16.5523 16.4477 17 17 17C17.5523 17 18 16.5523 18 16V13ZM6 15C6 14.4477 5.55228 14 5 14C4.44772 14 4 14.4477 4 15V16C4 16.5523 4.44772 17 5 17C5.55228 17 6 16.5523 6 16V15ZM21 15C21 14.4477 20.5523 14 20 14C19.4477 14 19 14.4477 19 15V16C19 16.5523 19.4477 17 20 17C20.5523 17 21 16.5523 21 16V15ZM4 18C3.44772 18 3 18.4477 3 19C3 19.5523 3.44772 20 4 20H21C21.5523 20 22 19.5523 22 19C22 18.4477 21.5523 18 21 18H4Z"/>\r
</svg>`,jr=`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">\r
  <path d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z"/>\r
</svg>`;function Pe({el:e,onStart:t,onMove:r,onEnd:n,onZoom:i,onPinch:o,disableleave:s=!1}){const a=[];let c=0,d,f,l=!0;const u=x=>{a.push(x),t&&t({el:e,ev:x}),d=x.clientX,f=x.clientY,l=!0},p=x=>{if(!a.length)return;const R=a.findIndex(m=>m.pointerId===x.pointerId);a.splice(R,1),n&&n({el:e,ev:x})},h=x=>{if(!a.length)return;const R=a.findIndex(m=>m.pointerId===x.pointerId);if(a[R]=x,a.length===1)r&&r({el:e,ev:x,x:x.clientX-d,y:x.clientY-f}),d=x.clientX,f=x.clientY;else if(a.length===2){const m=Math.abs(a[0].x-a[1].x);if(c>0){let C=m-c;l&&(l=!1,C*=-1),x.preventDefault(),o&&o({el:e,ev0:a[0],ev1:a[1],diff:C})}c=m}},v=x=>{x.touches.length===2&&x.preventDefault()},g=x=>{u(x)},w=x=>h(x),$=x=>{p(x)},E=x=>i&&i({el:e,ev:x,zoom:x.deltaY/100});return e.addEventListener("pointerdown",g),e.addEventListener("pointermove",w),e.addEventListener("pointerup",$),s||(e.addEventListener("pointercancel",$),e.addEventListener("pointerout",$)),e.addEventListener("pointerleave",$),e.addEventListener("touchstart",v),i&&e.addEventListener("wheel",E,{passive:!1}),()=>{e.removeEventListener("pointerdown",g),e.removeEventListener("pointermove",w),e.removeEventListener("pointerup",$),s||(e.removeEventListener("pointercancel",$),e.removeEventListener("pointerout",$)),e.removeEventListener("pointerleave",$),e.removeEventListener("touchstart",v),i&&e.removeEventListener("wheel",E)}}function nt(e,t,r,n,i,o){e.style.transformOrigin||(e.style.transformOrigin="0 0");let s=e.style.transform.match(/translate\((.*?)\)/)?.[1].split(",").map(f=>parseFloat(f))||[0,0],a=e.style.transform.match(/scale\((.*?)\)/)?.[1].split(",").map(f=>parseFloat(f))[0]||1;var c={x:0,y:0},d={x:0,y:0};d.x=t.x-e.parentElement.offsetLeft,d.y=t.y-e.parentElement.offsetTop,r=Math.max(-1,Math.min(1,r/10)),r&&(c.x=(d.x-s[0])/a,c.y=(d.y-s[1])/a,a+=r*n*a,a=Math.max(i,Math.min(o,a)),s[0]=-c.x*a+d.x,s[1]=-c.y*a+d.y,e.style.transform="translate("+s[0]+"px,"+s[1]+"px) scale("+a+","+a+")")}function ot(e,t){const r=Pe({el:t,onMove:i=>{const o=document.elementFromPoint(i.ev.pageX,i.ev.pageY);if(o===e||o===t)return;const s=i.el.style.transform.match(/translate\((.*?)\)/)?.[1].split(",").map(c=>parseFloat(c))||[0,0],a=i.el.parentElement.style.transform.match(/scale\((.*?)\)/)?.[1].split(",").map(c=>parseFloat(c))[0]||1;s[0]+=i.x/a,s[1]+=i.y/a,i.el.style.transform=`translate(${s[0]}px,${s[1]}px)`}}),n=Pe({el:e,onZoom:i=>{const o=i.ev;o.preventDefault();const s={x:o.pageX,y:o.pageY},a=document.elementFromPoint(s.x,s.y);if(!(a===e||a===t)){var c=o.wheelDelta||o.detail;nt(i.el,s,c,.06,.9,8)}},onPinch:i=>{const o=i.ev0,s=i.ev1,a={x:(o.pageX+s.pageX)/2,y:(o.pageY+s.pageY)/2},c=document.elementFromPoint(a.x,a.y);if(!(c===e||c===t)){var d=i.diff;nt(i.el,a,d,.05*2,.9,8)}}});return()=>{r(),n()}}const $e=new Map;function he(e,t,r=100){if(!$e.has(e)){const n=setTimeout(()=>{t(),$e.delete(e)},r);$e.set(e,n)}}async function Mt(e){let t=document.createElement("input");try{t.setAttribute("hidden",""),t.type="file",t.value=null,e&&(t.accept=e),document.body.appendChild(t);const r=await new Promise(i=>{t.onchange=i,t.oncancel=i,t.click()});if(t.remove(),r.type==="cancel")return;const n=r.target.files[0];return n||await ie("Unsupported file format!")}catch(r){await ie("Error opening file"),console.error(r)}}function Hr(e,t){if(!e||!t)return console.error("download missing inputs");try{var r=document.createElement("a");r.href=URL.createObjectURL(e),r.download=t,r.click()}catch(n){console.error(n)}}async function Me(e,t=null){try{if(!e)return;const r=new FileReader;await new Promise(d=>r.onload=d,r.readAsArrayBuffer(e));const{name:n,size:i,type:o,lastModified:s}=e,a=new Blob([r.result],{type:o}),c=new Image;c.src=URL.createObjectURL(a),await c.decode(),t&&t(r.result,{name:n,size:i,type:o,lastModified:s},c)}catch(r){console.error(r),await ie("Unknown format")}}function Wr(e){var t=-1,r=[" kB"," MB"," GB"," TB","PB","EB","ZB","YB"];do e/=1024,t++;while(e>1024);return Math.max(e,.1).toFixed(1)+r[t]}const Yr=async(e,t)=>{const r={files:[new File([t],e,{type:t.type})]};try{if(!navigator.canShare||!navigator.canShare(r))throw new Error("Can't share data.");await navigator.share(r)}catch(n){n.message!=="Share canceled"&&console.error(n.name,">",n.message)}};function Zr(e){const t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",r=t==="dark"?"light":"dark",n=K("thememode").value;n==="auto"?(root.classList.add(r),root.classList.remove(t),K("thememode").value=r):n===r?(root.classList.add(t),root.classList.remove(r),K("thememode").value=t):!e&&n===t?(root.classList.remove(r),root.classList.remove(t),K("thememode").value="auto"):e&&n===t&&(root.classList.add(r),root.classList.remove(n),K("thememode").value=r)}function Kr(e="auto",t=!1){K("thememode")||K("thememode",D(e)),e&&root.classList.add(e);const r={auto:"✻",dark:"☾",light:"✺"};return _`<div><a style="rotate:-90deg" :title="${()=>K("thememode").value}" @click="${()=>Zr(t)}">${()=>r[K("thememode").value]}</a></div>`}var ke=/iPhone/i,at=/iPod/i,lt=/iPad/i,st=/\biOS-universal(?:.+)Mac\b/i,Ee=/\bAndroid(?:.+)Mobile\b/i,ct=/Android/i,ae=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,me=/Silk/i,Q=/Windows Phone/i,ut=/\bWindows(?:.+)ARM\b/i,ft=/BlackBerry/i,dt=/BB10/i,pt=/Opera Mini/i,vt=/\b(CriOS|Chrome)(?:.+)Mobile/i,ht=/Mobile(?:.+)Firefox\b/i,gt=function(e){return typeof e<"u"&&e.platform==="MacIntel"&&typeof e.maxTouchPoints=="number"&&e.maxTouchPoints>1&&typeof MSStream>"u"};function qr(e){return function(t){return t.test(e)}}function Rt(e){var t={userAgent:"",platform:"",maxTouchPoints:0};!e&&typeof navigator<"u"?t={userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints||0}:typeof e=="string"?t.userAgent=e:e&&e.userAgent&&(t={userAgent:e.userAgent,platform:e.platform,maxTouchPoints:e.maxTouchPoints||0});var r=t.userAgent,n=r.split("[FBAN");typeof n[1]<"u"&&(r=n[0]),n=r.split("Twitter"),typeof n[1]<"u"&&(r=n[0]);var i=qr(r),o={apple:{phone:i(ke)&&!i(Q),ipod:i(at),tablet:!i(ke)&&(i(lt)||gt(t))&&!i(Q),universal:i(st),device:(i(ke)||i(at)||i(lt)||i(st)||gt(t))&&!i(Q)},amazon:{phone:i(ae),tablet:!i(ae)&&i(me),device:i(ae)||i(me)},android:{phone:!i(Q)&&i(ae)||!i(Q)&&i(Ee),tablet:!i(Q)&&!i(ae)&&!i(Ee)&&(i(me)||i(ct)),device:!i(Q)&&(i(ae)||i(me)||i(Ee)||i(ct))||i(/\bokhttp\b/i)},windows:{phone:i(Q),tablet:i(ut),device:i(Q)||i(ut)},other:{blackberry:i(ft),blackberry10:i(dt),opera:i(pt),firefox:i(ht),chrome:i(vt),device:i(ft)||i(dt)||i(pt)||i(ht)||i(vt)},any:!1,phone:!1,tablet:!1};return o.any=o.apple.device||o.android.device||o.windows.device||o.other.device,o.phone=o.apple.phone||o.android.phone||o.windows.phone,o.tablet=o.apple.tablet||o.android.tablet||o.windows.tablet,o}function Jr(e=null){if(Rt(window.navigator).apple.phone)return _`<div></div>`;async function r(){document.fullscreenElement?document.exitFullscreen&&await document.exitFullscreen():await document.documentElement.requestFullscreen()}function n(i){document.fullscreenElement?e&&e(!0):e&&e(!1)}return e&&document.addEventListener("fullscreenchange",n),_`<div><a @click="${r}">\u26F6</a></div>`}function Qr(e){return new Worker("./histogram_worker-ogrrdkqj.js",{name:e?.name})}function ei(e,t){let r;ne(()=>{c(),t&&t(d),r&&r(),r=Pe({el:histo,onMove:({ev:f,x:l,y:u,el:p})=>{f.stopPropagation();const h=p.style.transform.match(/translate\((.*?)\)/)?.[1].split(",").map(g=>parseFloat(g))||[0,0],v=1;h[0]+=l/v,h[1]+=u/v,p.style.transform=`translate(${h[0]}px,${h[1]}px)`}})}),ce(()=>{s.terminate(),r()});let n,i,o,s,a=!1;async function c(){try{n=new OffscreenCanvas(10,10),n.width=350,i=n.getContext("2d",{colorSpace:e,willReadFrequently:!0}),o=document.getElementById("histogram").getContext("2d"),s=new Qr,s.onmessage=async f=>{f.data.bitmap?(o.clearRect(0,0,o.canvas.width,o.canvas.height),o.drawImage(f.data.bitmap,0,0),a=!1):console.log(f.data)},s.onerror=f=>{throw console.error(`Worker error: ${f.message}`),f},s.postMessage({init:!0,width:o.canvas.width,height:o.canvas.height})}catch(f){console.error(f)}}async function d(){if(s&&!a){a=!0,n.height=n.width/(canvas.width/canvas.height),i.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,n.width,n.height);const f=i?.getImageData(0,0,i.canvas.width,i.canvas.height).data;s.postMessage({pixels:f})}}return _`<div id="histo" style="position:absolute;left:10px;width:260px;height:100px;background-color:grey;padding:5px;cursor:pointer"><div style="position:absolute;color:grey;right:40px;font-size:80%">${e}</div><canvas id="histogram" width="256" height="150" style="width:100%;height:100%;background-color:#121212"></canvas></div>`}function ti(e){let t;return ne(async()=>{t=new maplibregl.Map({container:"map",style:"./style.json",center:e,zoom:9}),new maplibregl.Marker().setLngLat(e).addTo(t)}),ce(()=>{t?.remove()}),_`<style>#map{height:180px;width:180px;color:#000;border-radius:15px;margin:10px auto}</style><style>.maplibregl-ctrl-attrib{display:none}</style><div id="map"></div>`}function ri(e,t,r){const n=t.crop;t.trs;const i=D(!0);ne(()=>{E(n.currentcrop),crop.addEventListener("pointerdown",w)}),ce(()=>{crop.removeEventListener("pointerdown",w)});let o=!1,s,a,c,d,f,l,u;const p=50,h=100;function v(m){o=!1,crop.releasePointerCapture(m.pointerId),crop.removeEventListener("pointermove",$),crop.removeEventListener("pointerup",v),g(),n.currentcrop=u,r&&r(u)}function g(){u=croprect.getBoundingClientRect();const{offsetTop:m,offsetLeft:C,offsetHeight:B,offsetWidth:L}=croprect;u={...JSON.parse(JSON.stringify(u)),offsetTop:m,offsetLeft:C,offsetHeight:B,offsetWidth:L},u.offsetBottom=l.height-m-B,u.offsetRight=l.width-C-L}function w(m){o=!0,crop.setPointerCapture(m.pointerId),crop.addEventListener("pointermove",$),crop.addEventListener("pointerup",v),n.ar?(croprect.style.aspectRatio=n.ar,i.value=!1):(croprect.style.aspectRatio="",i.value=!0),s={x:m.x,y:m.y},l=crop.getBoundingClientRect(),g();const C=B=>B>=0&&B<=p;a=C(s.x-u.left+10),c=C(u.right-s.x+10),d=C(s.y-u.top+10),f=C(u.bottom-s.y+10),croprect.style.top=croprect.offsetTop+"px",croprect.style.bottom=l.height-croprect.offsetTop-croprect.offsetHeight+"px",croprect.style.left=croprect.offsetLeft+"px",croprect.style.right=l.width-croprect.offsetLeft-croprect.offsetWidth+"px"}function $(m){if(o){let S=function(U,y,k){return Math.max(U,Math.min(y,k))},C=m.x-s.x,B=m.y-s.y,L=croprect.style.aspectRatio;const A=L.split("/")[0]/L.split("/")[1];d&&(L?(c||a)&&(croprect.style.top="auto",croprect.style.bottom=l.height-croprect.offsetTop-croprect.offsetHeight+"px"):croprect.style.top=S(0,u.offsetTop+B,u.offsetTop+u.offsetHeight-h)+"px"),f&&(L?(c||a)&&(croprect.style.top=croprect.offsetTop+"px",croprect.style.bottom="auto"):croprect.style.bottom=S(0,u.offsetBottom-B,u.offsetBottom+u.offsetHeight-h)+"px"),a&&(L?d?croprect.style.left=S(Math.max(0,l.width-u.offsetRight-(u.offsetTop+u.offsetHeight)*A),u.offsetLeft+C,u.offsetLeft+u.offsetWidth-h)+"px":croprect.style.left=S(Math.max(0,l.width-u.offsetRight-(l.height-u.offsetTop)*A),u.offsetLeft+C,u.offsetLeft+u.offsetWidth-h)+"px":croprect.style.left=S(0,u.offsetLeft+C,u.offsetLeft+u.offsetWidth-h)+"px"),c&&(L?d?croprect.style.right=S(Math.max(0,l.width-u.offsetLeft-(u.offsetTop+u.offsetHeight)*A),u.offsetRight-C,u.offsetRight+u.offsetWidth-h)+"px":croprect.style.right=S(Math.max(0,l.width-u.offsetLeft-(l.height-u.offsetTop)*A),u.offsetRight-C,u.offsetRight+u.offsetWidth-h)+"px":croprect.style.right=S(0,u.offsetRight-C,u.offsetRight+u.offsetWidth-h)+"px"),!d&&!f&&!a&&!c&&(croprect.style.top=S(0,u.offsetTop+B,l.height-u.offsetHeight)+"px",croprect.style.bottom=S(0,u.offsetBottom-B,l.height-u.offsetHeight)+"px",croprect.style.left=S(0,u.offsetLeft+C,l.width-u.offsetWidth)+"px",croprect.style.right=S(0,u.offsetRight-C,l.width-u.offsetWidth)+"px")}}function E(m){const C=document.getElementById("crop");if(C.style.width=Math.round(e.offsetWidth)+"px",C.style.height=Math.round(e.offsetHeight)+"px",n.ar?croprect.style.aspectRatio=n.ar:croprect.style.aspectRatio="",!m)croprect.style.inset="0",n.currentcrop=0;else{const B=m;croprect.style.inset=`${B.offsetTop}px ${B.offsetRight}px ${B.offsetBottom}px ${B.offsetLeft}px`}r&&r(m||0)}let x=0;function R(m){if(m.preventDefault(),x&&Date.now()-x<200)return E();x=Date.now()}return _`
      <div id="crop" @dblclick="${()=>E()}" @click="${R}" style="width:${e?.offsetWidth}px;height:${e?.offsetHeight}px">
       <div id="croprect" style="inset:0;">
          <div class="cropcorner" id="top_left" ></div>
          <div class="cropcorner" id="top_right" ></div>
          <div class="cropcorner" id="bottom_left" ></div>
          <div class="cropcorner" id="bottom_right" ></div>
          ${()=>i.value&&_`
            <div class="cropcorner" id="left" ></div>
            <div class="cropcorner" id="right" ></div>
            <div class="cropcorner" id="top" ></div>
            <div class="cropcorner" id="bottom" ></div>
          `}
        </div>
      </div>
  `}function ii(e,t,r,n,i){ne(()=>{o(n),splitview_container.addEventListener("pointerdown",c)}),ce(()=>{splitview_container.removeEventListener("pointerdown",c)});function o(l){l||(n=.5),splitview.src=e.src,splitview.width=e.width,splitview.height=e.height,splitview_container.style.width=t,splitview_container.style.height=r,splitview_container.style.aspectRatio="auto "+e.width+"/"+e.height,splitview.style.clipPath=`inset(0px ${(1-n)*100}% 0px 0px)`,splitview_bar.style.left=`calc(${n*100}% - 5px)`}let s=!1,a;function c(l){s=!0,splitview_container.setPointerCapture(l.pointerId),splitview_container.addEventListener("pointermove",f),splitview_container.addEventListener("pointerup",d),a=l.clientX}function d(l){s=!1,splitview_container.releasePointerCapture(l.pointerId),splitview_container.removeEventListener("pointermove",f),splitview_container.removeEventListener("pointerup",d),i&&i(n)}function f(l){if(s){l.preventDefault(),l.stopPropagation();const u=1/splitview_container.clientWidth,p=zoomable.style.transform.match(/scale\((.*?)\)/)?.[1].split(",").map(h=>parseFloat(h))[0]||1;n+=(l.clientX-a)*u/p,a=l.clientX,n=Math.max(.1,Math.min(.9,n)),splitview.style.clipPath=`inset(0px ${(1-n)*100}% 0px 0px)`,splitview_bar.style.left=`calc(${n*100}% - 5px)`}}return _`<div id="splitview_container"><img id="splitview"><div id="splitview_bar"></div></div>`}function Re(e,t,r,n){async function i(){try{const c=await Mt(t);if(!c)return;r(c)}catch(c){console.error(c)}}function o(c){c.preventDefault();const d=c.target;d.style.borderColor="";let f;if(c.dataTransfer.items){const l=c.dataTransfer.items[0];if(!l.type.match("^"+t.split(",").map(u=>"^"+u).join("|")))return ie("unknown format");f=l.getAsFile()}else f=c.dataTransfer.files[0];r(f)}function s(c){c.preventDefault();const d=c.target;d.style.borderColor||(d.style.borderColor="darkorange")}function a(c){c.preventDefault();const d=c.target;d.style.borderColor&&(d.style.borderColor="")}return _`<button id="clickdrop_btn" @click="${i}" @drop="${o}" @dragover="${s}" @dragleave="${a}" style="display:none">${e}</button>`}async function ni(e){return e.split(",")[0].match(/:(.*?);/)[1],fetch(e).then(function(r){return r.arrayBuffer()})}async function oi(e,t,r,n){
  const i=e.value,o=i.file.name,s=D(o.split(".")[0]),a=D("jpeg"),c=D("1.0");function d(l){a.value=l.target.value}if(await wt(()=>_`<div style="margin:10px 0"><div style="height:38px">${"Save "}image</div><div style="display:flex;flex-direction:column;font-size:14px"><div><input style="width:225px;font-size:14px" type="text" :value="${()=>s.value}" @change="${l=>s.value=l.target.value}" disabled="true"> <select style="display:none" @change="${d}"><option value="jpeg" selected="selected">jpeg</option><option value="png">png</option></select></div><div style="height:60px;display:flex;justify-content:space-between;align-items:center">${()=>a.value==="jpeg"&&_`<div style="display:flex;align-items:center"><label style="color:gray;margin-right:10px">Quality</label> <input type="range" min="0.1" max="1.0" step="0.1" :value="${()=>c.value}" @input="${l=>c.value=l.target.value}"> <span style="width:30px;text-align:right">${()=>c.value.padEnd(3,".0")}</span></div>`}</div></div></div>`)){const l=t.extract();let p=r.captureImage("image/"+a.value,a.value==="jpeg"&&parseFloat(c.value)).src;const h=await ni(p),v=Bt(h);l&&(v.replace(l),i?.tiff?.Orientation&&v.patch({area:"tiff",field:"Orientation",value:1})),s.value=o,n?n(o,new Blob([v.image()]),a._value):Rt(window.navigator).any?Yr(s.value,new Blob([v.image()])):v.download(s.value)}}const ai=`<svg style="width:60%;" viewBox="0 0 256 256"  xmlns="http://www.w3.org/2000/svg">
<rect x="54.8183" y="90.0903" width="120.743" height="120.743" rx="14.2449"  stroke-width="17.6366" fill="transparent"/>
<path d="M221.004 115.176L221.004 89.1424C221.004 63.8095 200.046 43.2732 174.193 43.2732L149.101 43.2732" stroke-width="17.6366" stroke-linecap="round" fill="transparent"/>
<path d="M131.428 47.5313C128.678 45.3586 128.678 41.1878 131.428 39.0151L155.912 19.671C159.471 16.8597 164.703 19.3941 164.703 23.929L164.703 62.6174C164.703 67.1523 159.471 69.6868 155.912 66.8755L131.428 47.5313Z" />
</svg>`,mt=`<svg style="width:60%;" viewBox="0 0 256 256"  xmlns="http://www.w3.org/2000/svg">
<path d="M40.2407 220.5L102.5 112.324L102.5 220.5H40.2407Z"  stroke-width="13" stroke-linejoin="round" fill="transparent"/>
<path d="M211.759 220.5L149.5 112.324L149.5 220.5H211.759Z"  stroke-width="13" stroke-linejoin="round" fill="transparent"/>
<line x1="78" y1="59.5" x2="174" y2="59.5"  stroke-width="13"/>
<path d="M45.3896 63.5218C42.6395 61.3491 42.6395 57.1783 45.3896 55.0056L69.8741 35.6614C73.4324 32.8501 78.6648 35.3846 78.6648 39.9195L78.6648 78.6079C78.6648 83.1428 73.4324 85.6773 69.8741 82.8659L45.3896 63.5218Z" />
<path d="M207.163 55.0056C209.913 57.1783 209.913 61.349 207.163 63.5217L182.679 82.8659C179.12 85.6772 173.888 83.1428 173.888 78.6078L173.888 39.9195C173.888 35.3846 179.12 32.8501 182.679 35.6614L207.163 55.0056Z" />
</svg>`,li='<svg style="width:50%;" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g stroke-width="0"></g><g  stroke-linecap="round" stroke-linejoin="round"></g><g ><path d="M 5.4648 42.5781 C 7.5272 42.5781 9.3085 41.3594 10.1757 39.6016 L 45.4724 49.9609 C 46.0820 52.2109 48.1211 53.875 50.5585 53.875 C 53.4179 53.875 55.7852 51.5313 55.7852 48.6484 C 55.7852 46.4687 54.4489 44.5937 52.5505 43.7969 L 51.5665 20.2422 C 53.5820 19.5156 55.0350 17.5703 55.0350 15.2969 C 55.0350 12.4140 52.6681 10.0703 49.8083 10.0703 C 47.9099 10.0703 46.2227 11.1016 45.3083 12.625 L 25.7851 7.2578 C 25.7851 4.4922 23.4179 2.1250 20.5585 2.1250 C 17.6757 2.1250 15.3085 4.4922 15.3085 7.3750 C 15.3085 8.9219 15.9882 10.3281 17.0897 11.2891 L 6.2148 32.1484 C 5.9804 32.1016 5.7226 32.1016 5.4648 32.1016 C 2.5819 32.1016 .2148 34.4453 .2148 37.3281 C .2148 40.2109 2.5819 42.5781 5.4648 42.5781 Z M 20.5585 12.625 C 22.2694 12.625 23.8163 11.7578 24.7772 10.4453 L 44.5820 15.9062 C 44.8398 17.9922 46.3163 19.7266 48.2852 20.3125 L 49.1056 43.5859 C 47.5585 44.0547 46.2928 45.2031 45.6836 46.6797 L 10.5976 36.3672 C 10.4101 35.3828 9.9413 34.4687 9.2851 33.7656 L 20.1601 12.6016 C 20.2772 12.6016 20.4179 12.625 20.5585 12.625 Z"></path></g></svg>';function Tt(e,t,r,n){let o=t.slice(0);const{top:s,left:a}=e.getBoundingClientRect();let c=e.offsetWidth,d=e.offsetHeight,f,l=!1,u;ne(()=>{mousecontainer.addEventListener("pointerdown",g),f=mousecanvas.getContext("2d"),$()}),ce(()=>{mousecontainer.removeEventListener("pointerdown",g)});function p(x,R,m){return Math.max(x,Math.min(m,R))}function h(x){var R=p(0,x.offsetX/c,1),m=p(0,x.offsetY/d,1);o[u]=[R,m]}function v(x){l=!1,u=void 0,mousecontainer.releasePointerCapture(x.pointerId),mousecontainer.removeEventListener("pointermove",w),mousecontainer.removeEventListener("pointerup",v)}function g(x){l=!0;const R=document.elementFromPoint(x.x,x.y);R.id.startsWith("mouse")&&(u=parseInt(R.id.replace("mouse",""))),mousecontainer.setPointerCapture(x.pointerId),mousecontainer.addEventListener("pointermove",w),mousecontainer.addEventListener("pointerup",v);const{left:m,top:C}=R.getBoundingClientRect();h(x)}function w(x){l&&u!==void 0&&(h(x),he("mouse",()=>$(),20))}function $(){document.getElementById("mouse0")&&(o.forEach((x,R)=>{const m=document.getElementById("mouse"+R),C=x[0]*c-m.offsetWidth/2+"px",B=x[1]*d-m.offsetHeight/2+"px";m.style.left!==C&&(m.style.left=C),m.style.top!==B&&(m.style.top=B)}),r&&r(o,f))}function E(){n?o=n(o):o=t.slice(0),$()}return _`
      <style>
        #mousecontainer{position: fixed;top:${s}px;left:${a}px;width:${c}px;height:${d}px;}
        #mousecanvas{overflow:hidden;border:0px solid white;}
        .point{position:absolute;width: ${45}px;height: ${45}px;background-color:white; border-radius: 50%;cursor:pointer;border: 15px solid transparent;background-clip: padding-box;box-sizing: border-box;}
      </style>
      <div id="mousecontainer" @dblclick="${E}">
        <canvas id="mousecanvas" width="${c}" height="${d}"></canvas>
        ${o?.map((x,R)=>_`
            <div id="mouse${R}" style="left:${x[0]*c-45/2}px;top:${x[1]*d-45/2}px;" class="point" ></div>
          `)}
      </div>
  `}function si(e,t,r){let n=[[.25,.25],[.75,.25],[.75,.75],[.25,.75]],i=t?.quad||n,o=!0;function s(c,d){d.clearRect(0,0,mousecanvas.width,mousecanvas.height),d.lineWidth=3,d.strokeStyle="red",d.beginPath();for(var f=0;f<4;f++){const l=c[f][0]*mousecanvas.width,u=c[f][1]*mousecanvas.height;d.lineTo(l,u)}d.closePath(),d.stroke(),o?o=!1:t.modified||(t.modified=!0),t.quad=c,r&&r()}function a(c){return t.modified=!1,n}return _`<style>#mousecanvas{background-image:repeating-linear-gradient(#ccc 0 1px,transparent 1px 100%),repeating-linear-gradient(90deg,#ccc 0 1px,transparent 1px 100%);background-size:9.99% 9.99%}</style>${Tt(e,i,s,a)}`}function oe(e,t,r,n,i,o,s){function a(){n[e]?.$skip||o&&o(e)}function c(d){d.preventDefault(),d.stopPropagation();const f=document.getElementById("btn_skip_"+e),l=document.getElementById(e),u=document.getElementById(e+"_content");n[e].$skip?(n[e].$skip=!1,f?.removeAttribute("disabled"),l?.removeAttribute("skipped"),u?.classList.remove("skip"),l.style.opacity="",i(!0)):(n[e].$skip=!0,f?.setAttribute("disabled",!0),l?.setAttribute("skipped",!0),u?.classList.add("skip"),i(!1))}return _`<div class="section" id="${e}" :style="${()=>r.value===e&&`height:${t}px;`}" :selected="${()=>r.value===e}" @click="${d=>{d.stopPropagation(),r.value=e}}"><div class="section_header">${!!i&&_`<a id="btn_skip_${e}" class="section_skip" @click="${c}" title="toggle">\u2609</a>`} <b class="section_label">${e}</b> ${!!o&&_`<a id="btn_reset_${e}" class="reset_btn" @click="${a}" disabled="disabled" title="reset">\u00D8</a>`}</div>${()=>r.value===e&&_`<div id="${e}_content" class="section_content ${n[e]?.$skip?"skip":""}" @click="${d=>d.stopPropagation()}"><div class="section_scroll"><hr><button class="close_btn" @click="${()=>r.value=""}">X</button> ${s}</div></div>`}</div>`}function ci(e,t,r,n,i){let o,s;D(()=>{e.value==="composition"?(o=n(),o.resetCrop(),p[1]=o.gl.canvas.width/o.gl.canvas.height,p[2]=1/p[1],v(),r(),s=e.value):s==="composition"&&(m(),s=void 0,a())},{effect:!0});async function a(){const y=t;if(!croprect)return;crop.style.display="";const k=canvas.width/crop.offsetWidth;y.crop.glcrop={left:Math.round(croprect.offsetLeft*k),top:Math.round(croprect.offsetTop*k),width:Math.round(croprect.offsetWidth*k),height:Math.round(croprect.offsetHeight*k)},r(),i()}function c(){if(!document.getElementById("croprect"))return;Object.keys(t.crop).forEach(F=>{t.crop[F]=0}),h(0),v(),Object.keys(t.trs).forEach(F=>{t.trs[F]=0,$("trs_"+F)}),Object.keys(t.perspective).forEach(F=>{t.perspective[F]=0});const k=document.getElementById("fliph"),I=document.getElementById("flipv");k.removeAttribute("selected"),I.removeAttribute("selected"),m(),d(),A(),l(),r()}function d(y){const k=document.getElementById("crop"),I=document.getElementById("croprect");k.style.width=Math.round(canvas.getBoundingClientRect().width)+"px",k.style.height=Math.round(canvas.getBoundingClientRect().height)+"px",t.crop.ar&&(I.style.aspectRatio=t.crop.ar),I.style.inset="0",t.crop.currentcrop=0}function f(y){y==="v"?(t.trs.flipv=!t.trs.flipv,t.trs.flipv?flipv.setAttribute("selected",!0):flipv.removeAttribute("selected")):(t.trs.fliph=!t.trs.fliph,t.trs.fliph?fliph.setAttribute("selected",!0):fliph.removeAttribute("selected")),l(),r()}function l(){Object.values(t.trs).reduce((k,I)=>k+=I,0)===0&&Object.values(t.crop).reduce((k,I)=>k+=I,0)===0&&t.perspective.modified==0&&t.resizer.width===0?btn_reset_composition.setAttribute("disabled",!0):btn_reset_composition.removeAttribute("disabled")}const u=["free","pic","1:pic","1:1","4:3","16:9","3:4","9:16"];let p=[0,0,0,1,4/3,16/9,3/4,9/16];function h(y){m(),t.crop.arindex=y,t.crop.ar=p[y],croprect&&(croprect.style.aspectRatio=p[y]);const k=document.getElementById("aspects");k&&(k.querySelector("[selected]")?.removeAttribute("selected"),k.querySelector("#ar_"+y)?.setAttribute("selected",!0)),l()}function v(){const{width:y,height:k}=o;t.crop.canvas_angle%180?(o.gl.canvas.width=k,o.gl.canvas.height=y):(o.gl.canvas.width=y,o.gl.canvas.height=k),o.setupFiltersTextures(),i()}function g(y){t.crop.canvas_angle=(t.crop.canvas_angle+y)%360,v(),crop.style.width=Math.round(canvas.getBoundingClientRect().width)+"px",crop.style.height=Math.round(canvas.getBoundingClientRect().height)+"px",croprect.style.inset="0",m(),l(),r()}function w(y){const k=y.target.value,I=this.id.split("_");if(t[I[0]][I[1]]=parseFloat(k),I.length===3?this.nextElementSibling.value=k:this.previousElementSibling.value=k,I[1]==="angle"){const F=parseFloat(Math.abs(k))*Math.PI/180,X=canvas.width*Math.cos(F)+canvas.height*Math.sin(F),J=canvas.width*Math.sin(F)+canvas.height*Math.cos(F),b=Math.max(X/canvas.width-1,J/canvas.height-1);t.trs.scale=b,l()}r()}function $(y){const k=document.getElementById(y);if(!k)return;const I=y.split("_");k.value=t[I[0]][I[1]],k.previousElementSibling.value=k.value}function E(){if(!this)return;const y=this.id.split("_");t[y[0]][y[1]]=0,$(this.id),y[1]==="angle"&&(t.trs.scale=0),l(),r()}let x=D(!1);async function R(){x.value=t.perspective,crop.style.display="none"}function m(){const y=document.getElementById("crop");y&&(y.style.display=""),x.value=!1}function C(){x.value?m():R()}const B=D(100);function L(y,k){resize_width.value=t.resizer.width=y,resize_height.value=t.resizer.height=k,o.resize(y,k),B.value=Math.round(y/o.img.width*1e3)/10,v(),d(),l(),r()}function A(){o.resetResize(),t.resizer.width=0,t.resizer.height=0,resize_width.value=o.width,resize_height.value=o.height,B.value=100}function S(){const y=p[1],k=Math.max(100,this.value),I=Math.floor(k/y);L(k,I)}function U(){const y=p[1],k=Math.max(100,this.value),I=Math.floor(k*y);L(I,k)}return _`${oe("composition",235,e,t,null,c,()=>_`<style>.crop_btn{width:38px;color:#fff;padding:0;margin:2px;border-radius:50%;fill:white;stroke:white;font-size:12px}.close_btn{display:none!important}</style><button class="done_btn" @click="${()=>e.value=""}">done</button><div style="display:flex;justify-content:flex-end;color:grey;margin-right:3px"><div style="flex:1;align-content:center;text-align:left"><span>rotation </span><input id="trs_angle_" style="width:75px" type="number" class="rangenumb" step="0.25" min="-45" max="45" value="${t.trs.angle}" @input="${w}"> <input id="trs_angle" type="range" value="${t.trs.angle}" min="-45" max="45" step="0.25" @input="${w}" @dblclick="${E}"></div><button id="fliph" class="crop_btn" title="flip x" selected="${!!t.trs.fliph}" @click="${()=>f("h")}">${mt}</button> <button id="flipv" class="crop_btn" title="flip y" selected="${!!t.trs.flipv}" @click="${()=>f("v")}" style="rotate:270deg">${mt}</button> <button class="crop_btn" title="rotate left" @click="${()=>g(-90)}">${ai}</button> <button class="crop_btn" title="perspective" :selected="${()=>!!x.value}" @click="${C}">${li}</button></div><hr><div style="text-align:left;color:gray">crop ratio</div><div style="text-align:left" id="aspects">${u.map((y,k)=>_`<button id="ar_${k}" @click="${()=>h(k)}" class="crop_btn" selected="${k===t.crop.arindex}" @dblclick="${d}">${y}</button>`)}</div><hr><div style="text-align:left;color:gray">image size</div><div style="display:flex;justify-content:space-around;align-items:center"><div style="width:100px;text-align:left;color:gray">(${()=>B.value+"%"})</div><input id="resize_width" type="number" value="${canvas.width}" style="text-align:center;width:90px" @change="${S}"> x <input id="resize_height" type="number" value="${canvas.height}" style="text-align:center;width:90px" @change="${U}"></div>${()=>x.value&&_`${si(canvas,x.value,()=>{l(),r()})}`}`)}`}function ui(e,t,r){const n={lights:190,colors:150,effects:105};D(()=>{e.value===null&&["lights","colors","effects"].forEach(u=>a(u))},{effect:!0});function i(u){return Object.values(t[u]).reduce((p,h)=>p+=h,0)===0}function o(u){for(const p of Object.keys(t[u]))t[u][p]=0,f(u+"_"+p)}function s(u){o(u),r(),a(u)}function a(u){const p=document.getElementById("btn_reset_"+u);p&&(i(u)?p.setAttribute("disabled",!0):p.removeAttribute("disabled"))}function c(u){he("param",()=>d.call(this,u),30)}function d(u){const p=u.target.value,h=this.id.split("_");t[h[0]][h[1]]=parseFloat(p),f(this.id),r(),a(h[0])}function f(u){const p=document.getElementById(u);if(!p)return;const h=u.split("_");p.value=t[h[0]][h[1]],h.length===3?p.previousElementSibling.value=p.value:p.nextElementSibling.value=p.value}function l(){if(!this)return;const u=this.id.split("_");t[u[0]][u[1]]=0,f(this.id),r(),a(u[0])}return _`${["lights","colors","effects"].map(u=>_`${oe(u,n[u],e,t,r,s,()=>_`${Object.keys(t[u]).filter(p=>!p.startsWith("$")).map(p=>_`/* RANGE INPUTS */<div style="display:flex;justify-content:space-around;align-items:center"><div class="rangelabel">${p}</div><input id="${u+"_"+p}" type="range" style="width:130px" value="${t[u][p]}" min="-1" max="1" step="0.01" @input="${c}" @dblclick="${l}"> <input id="${u+"_"+p+"_"}" type="number" class="rangenumb" value="${t[u][p]}" min="-1" max="1" step="0.01" @input="${c}"></div>`)}`)}`)}`}function fi(e,t){const i=D(e?.numpoints||5);let o=e?.space||0,s=e?.curvepoints||new Array(4).fill(null),a=new Array(4);s.forEach((m,C)=>{m?a[C]=!0:a[C]=null});function c(m){s[m]=[];for(let C=0;C<i._value;C++){const B=C/(i._value-1);s[m].push([B,B])}a[m]=null}function d(){c(o),R()}s[o]?.length||c(o);let f,l,u;ne(()=>{curvecontainer.addEventListener("pointerdown",w),f=curvescanvas.offsetWidth,l=curvescanvas.offsetHeight,u=curvescanvas.getContext("2d"),p("space"+o),e.resetFn=()=>{e.space=0,e.curvepoints=null,o=0,s=new Array(4).fill(null),p("space"+o)}}),ce(()=>{curvecontainer.removeEventListener("pointerdown",w)});function p(m){m=typeof m=="string"?m:this?.id;const C=document.getElementById(m);C&&(cccolors.getElementsByClassName("selected")[0]?.classList.remove("selected"),C.classList.add("selected"),o=parseInt(m.replace("space","")),e.space=o,s[o]||c(o),R())}let h=!1,v;function g(m){h=!1,curvecontainer.releasePointerCapture(m.pointerId),curvecontainer.removeEventListener("pointermove",x),curvecontainer.removeEventListener("pointerup",g),v=void 0}function w(m){h=!0,curvecontainer.setPointerCapture(m.pointerId),curvecontainer.addEventListener("pointermove",x),curvecontainer.addEventListener("pointerup",g),f=curvescanvas.offsetWidth,l=curvescanvas.offsetHeight;const C=document.elementFromPoint(m.x,m.y);C.id.startsWith("pt")&&(v=parseInt(C.id.replace("pt",""))),a[o]=!0,E(m)}function $(m,C,B){return Math.max(m,Math.min(B,C))}function E(m){const C=v?s[o][v-1][0]+.1:0,B=v<i._value-1?s[o][v+1][0]-.1:1;var L=$(C,m.offsetX/f,B),A=$(0,1-m.offsetY/l,1);s[o][v]=[L,A]}function x(m){h&&v!==void 0&&(E(m),he("curve",()=>R(),20))}function R(){if(!s?.[o])return;s[o].forEach((S,U)=>{const y=document.getElementById("pt"+U);y.style.left=S[0]*f-45/2+"px",y.style.bottom=S[1]*l-45/2+"px"});const m=s[o].map(S=>S[0]),C=s[o].map(S=>S[1]),B=new Ge(s[o]);let L;u.clearRect(0,0,256,256),u.lineWidth=4,u.strokeStyle="#4B4947",u.beginPath();for(var A=0;A<256;A++)A<m[0]*256?L=C[0]:A>m[m.length-1]*256?L=C[C.length-1]:L=$(0,B.at(A/255),1),u.lineTo(A,(1-L)*256);u.stroke(),u.fillStyle="white",t&&t(s,a)}return _`
      <style>
        #curvecontainer{position: relative;width:200px;height: 120px;margin:auto;background-image: radial-gradient(#5b5b5b 1px, transparent 0);background-size: 10% 10%;border-radius: 10px;border: 1px solid #5b5b5b;}
        #curvescanvas{width:inherit;height: inherit;overflow:hidden;border:0px solid white;}
        .point{position:absolute;background-color: white; width: ${45}px;height: ${45}px; border-radius: 50%;cursor:pointer;border: 17px solid transparent;background-clip: padding-box;box-sizing: border-box;}
      </style>
      <div id="cccolors" style="display:flex;flex-direction:row; max-width:275px;">
        <div style="width:60px;">
          <button id="space0" @click="${p}" class="clrspace selected" style="border-color:white;" title="all colors"></button>
          <button id="space1" @click="${p}" class="clrspace" style="border-color:#c13119;" title="red"></button>
          <button id="space2" @click="${p}" class="clrspace" style="border-color:#0c9427;" title="green"></button>
          <button id="space3" @click="${p}" class="clrspace" style="border-color:#1e73be;" title="blue"></button>
        </div>
        <div id="curvecontainer" @dblclick="${d}">
          <canvas id="curvescanvas" width=${256} height=${256}></canvas>
          ${()=>i.value&&s[o]?.map((m,C)=>_`
              <div id="pt${C}" class="point"></div>
            `)}
        </div>
      </div>
  `}function di(e,t,r){let n=t.curve,i={space:0,numpoints:5,curvepoints:t.curve?.curvepoints||null,modifiedflag:null,resetFn:null};D(()=>{e.value===null&&t.curve?.curvepoints&&(n=t.curve,o(n.curvepoints,[!0,!0,!0,!0]))},{effect:!0});function o(c,d){i.curvepoints=d.map((f,l)=>f&&c[l]),i.curvepoints.reduce((f,l)=>f+=l,0)===0?n.curvepoints=0:n.curvepoints=i.curvepoints,a(),r()}function s(){i.resetFn&&i.resetFn()}function a(){document.getElementById("btn_reset_curve")&&(i?.curvepoints?.reduce((d,f)=>d+=f,0)===0?btn_reset_curve?.setAttribute("disabled",!0):btn_reset_curve?.removeAttribute("disabled"))}return _`${oe("curve",190,e,t,r,s,()=>_`<div class="cc_container">${()=>fi(i,o)}</div>`)}`}const pi=function(){const t=typeof document<"u"&&document.createElement("link").relList;return t&&t.supports&&t.supports("modulepreload")?"modulepreload":"preload"}(),vi=function(e){return"/"+e},xt={},Y=function(t,r,n){let i=Promise.resolve();if(r&&r.length>0){let s=function(d){return Promise.all(d.map(f=>Promise.resolve(f).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");i=s(r.map(d=>{if(d=vi(d),d in xt)return;xt[d]=!0;const f=d.endsWith(".css"),l=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const u=document.createElement("link");if(u.rel=f?"stylesheet":pi,f||(u.as="script"),u.crossOrigin="",u.href=d,c&&u.setAttribute("nonce",c),document.head.appendChild(u),f)return new Promise((p,h)=>{u.addEventListener("load",p),u.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${d}`)))})}))}function o(s){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=s,window.dispatchEvent(a),!a.defaultPrevented)throw s}return i.then(s=>{for(const a of s||[])a.status==="rejected"&&o(a.reason);return t().catch(o)})},hi='<svg xml:space="preserve" viewBox="0 0 100 100" y="0" x="0" xmlns="http://www.w3.org/2000/svg" id="圖層_1" version="1.1" style="margin: initial; display: block; shape-rendering: auto; background: transparent;" preserveAspectRatio="xMidYMid"><g class="ldl-scale" style="transform-origin: 50% 50%; transform: rotate(0deg) scale(0.8, 0.8);"><g class="ldl-ani" style="transform-box: view-box; opacity: 1; transform-origin: 50px 50px; transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); animation: 1s linear 0s infinite normal forwards running animate;"><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M89.982 48.757h-.002a40.04 40.04 0 0 0-2.246-12.003l-.125-.332a40.721 40.721 0 0 0-.574-1.517l-.334-.774a33.907 33.907 0 0 0-.487-1.112l-.078-.168c-.166-.355-.344-.705-.531-1.075l-.187-.367c-.13-.249-.266-.495-.404-.744l-1.44-2.406a38.537 38.537 0 0 0-.666-1.001l-1.74-2.292L59.423 62.63h28.506l.406-1.328c.048-.151.095-.303.137-.451a40.634 40.634 0 0 0 .717-2.97 36.2 36.2 0 0 0 .187-.96c.112-.631.202-1.266.284-1.905l.042-.314c.029-.208.057-.415.077-.619.107-1.026.174-1.96.201-2.843l.02-1.137-.018-1.346z"  ></path></g></g><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M58.024 89.163l1.838-.429c.358-.091.714-.187 1.073-.288.58-.165 1.156-.346 1.728-.536l.178-.059c.285-.094.569-.189.847-.29.607-.22 1.204-.463 1.797-.711l.27-.11c.199-.081.398-.161.598-.251a41.757 41.757 0 0 0 2.686-1.315l.21-.115c.214-.116.404-.225.584-.331l1.229-.729a40.14 40.14 0 0 0 4.94-3.618 40.837 40.837 0 0 0 2.129-1.971l.121-.113a40.584 40.584 0 0 0 4.588-5.474l.121-.175c.208-.303.411-.61.688-1.037l2.006-3.501c.161-.315.324-.641.412-.844l1.029-2.795H43.77l14.254 24.692z"  ></path></g></g><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M20.094 76.527l.955 1.023c.106.115.21.229.318.341a41.011 41.011 0 0 0 2.12 2.022l.196.174c.208.186.418.37.631.549.49.412.995.806 1.503 1.192l.244.19c.169.131.337.263.51.388A40.702 40.702 0 0 0 28.934 84l1.219.724c.187.11.376.219.584.334l.337.178c.759.407 1.536.776 2.445 1.194.106.054.213.107.311.149a39.841 39.841 0 0 0 8.692 2.698l.157.032c.622.115 1.244.217 1.859.303l.564.066c.501.063 1.002.125 1.499.168l.183.017c.391.03.78.054 1.269.08l.359.017c.272.011.542.018.91.024l.697.009.854-.014c.246-.005.495-.011.736-.021l.432-.02c.391-.021.78-.045 1.321-.088l2.649-.483L34.347 51.84 20.094 76.527zm26.815 11.795v.002-.002z"  ></path></g></g><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M79.906 23.463l-.961-1.029a13.335 13.335 0 0 0-.326-.349 39.14 39.14 0 0 0-2.12-2.021l-.116-.103c-.228-.202-.454-.404-.685-.598a38.415 38.415 0 0 0-1.539-1.219l-.234-.183c-.16-.125-.32-.249-.489-.373a40.813 40.813 0 0 0-2.371-1.601l-2.148-1.239a40.129 40.129 0 0 0-11.527-4.055 39.84 39.84 0 0 0-3.868-.537 1.465 1.465 0 0 0-.22-.023l-2.452-.123-.05 1.115-.127-1.118-1.544.003c-.246.005-.494.011-.75.021l-.424.021a37.51 37.51 0 0 0-1.174.077l-2.908.296 21.78 37.725 14.253-24.687z"  ></path></g></g><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M41.974 10.828l-1.372.32c-.157.035-.314.069-.468.109a41.654 41.654 0 0 0-2.807.826l-.161.054a42.89 42.89 0 0 0-.85.291c-.613.222-1.221.468-1.819.718l-.263.107c-.195.08-.389.158-.581.244-.936.417-1.776.827-2.576 1.254l-2.137 1.235c-3.491 2.154-6.615 4.828-9.369 8.043-.285.334-.561.667-.844 1.022l-.214.276a36.63 36.63 0 0 0-.7.918l-.308.427c-.198.278-.386.54-.605.866l-1.832 2.984-.127.228c-.103.184-.204.37-.312.575l-.254.489c-.172.341-.343.682-.507 1.026l-1.207 2.676H56.23L41.974 10.828z"  ></path></g></g><g class="ldl-layer"><g class="ldl-ani" style="transform-box: view-box;"><path fill="inherit" d="M12.071 37.361l-.404 1.322c-.048.155-.097.309-.139.457a39.505 39.505 0 0 0-.691 2.848l-.038.18c-.062.302-.124.604-.175.903a40.32 40.32 0 0 0-.284 1.906l-.042.309c-.029.208-.057.417-.077.62a38.802 38.802 0 0 0-.201 2.854l-.014.376c-.006.234-.006.441-.006.649l.02 1.444c.13 4.087.884 8.123 2.247 12.01l.137.37c.18.492.361.984.554 1.459l.281.653c.177.421.355.841.545 1.245l.08.172c.166.35.34.697.513 1.037l1.401 2.514c.136.226.273.454.432.705l.217.335c.216.331.43.661.663.993l1.678 2.412 21.81-37.774H12.071z"  ></path></g></g></g></g></svg>',Ae=[{type:"1",label:"aden",map1:async()=>Y(()=>import("./LUT_aden-BPNt8S6X.js"),[])},{type:"1",label:"crema",map1:async()=>Y(()=>import("./LUT_crema-Dr3xVYGh.js"),[])},{type:"2",label:"clarendon",map1:async()=>Y(()=>import("./LUT_clarendon1-UtcH-ItH.js"),[]),map2:async()=>Y(()=>import("./LUT_clarendon2-gqIK7yZD.js"),[])},{type:"3",label:"gingham",map1:async()=>Y(()=>import("./LUT_gingham1-XYBL9yCV.js"),[]),map2:async()=>Y(()=>import("./LUT_gingham_lgg-DKTq37Dx.js"),[])},{type:"1",label:"juno",map1:async()=>Y(()=>import("./LUT_juno-DAFSouMR.js"),[])},{type:"1",label:"lark",map1:async()=>Y(()=>import("./LUT_lark-CFq9A7h3.js"),[])},{type:"1",label:"ludwig",map1:async()=>Y(()=>import("./LUT_ludwig-B3y7u7o6.js"),[])},{type:"4",label:"moon",map1:async()=>Y(()=>import("./LUT_moon1-GzydTKI3.js"),[]),map2:async()=>Y(()=>import("./LUT_moon2-eVwlvPIO.js"),[])},{type:"1",label:"reyes",map1:async()=>Y(()=>import("./LUT_reyes-BfSRwpFg.js"),[])},{type:"MTX",label:"polaroid",mtx:"polaroid"},{type:"MTX",label:"kodak",mtx:"kodachrome"},{type:"MTX",label:"browni",mtx:"browni"},{type:"MTX",label:"vintage",mtx:"vintage"}];async function bt(e){const t=new Image;return t.src=e,await t.decode(),t}function gi(e,t,r){const n=t.filters;let i=D(!1);D(async()=>{if(e.value===null&&t.filters?.label){const c=Ae.findIndex(d=>d.label===t.filters.label);s(c)}},{effect:!0});async function o(c){const d=document.getElementById("loader");d&&setTimeout(()=>d.style.display="",20);const f=Ae[parseInt(c)];f.map1&&typeof f.map1=="function"&&(f.map1=await bt((await f.map1()).default)),f.map2&&typeof f.map2=="function"&&(f.map2=await bt((await f.map2()).default));const{type:l,mtx:u,map1:p,map2:h,label:v}=f;n.opt={type:l,mtx:u,map1:p,map2:h,label:v},d&&(d.style.display="none")}async function s(c){i.value!==c?(i.value=c,btn_reset_filters?.removeAttribute("disabled"),await o(c),r()):a()}function a(){btn_reset_filters?.setAttribute("disabled",!0),i.value=!1,n.opt=0,r()}return _`<style>.btn_insta{width:70px;color:light-dark(white,#fff);font-size:12px}</style><style>@keyframes animate{0.00%{animation-timing-function:cubic-bezier(0.51,0.03,0.89,0.56);transform:translate(0,0) rotate(0deg) scale(1,1) skew(0deg,0deg);opacity:1}52.00%{animation-timing-function:cubic-bezier(0.17,0.39,0.55,0.91);transform:translate(0,0) rotate(211.13deg)}100.00%{animation-timing-function:cubic-bezier(0.17,0.39,0.55,0.91);transform:translate(0,0) rotate(360deg)}}</style>${oe("filters",235,e,t,r,a,()=>_`<div id="loader" style="width:23px;fill:orange;display:none;position:absolute;top:-30px">${hi}</div>${Ae.map((c,d)=>_`<button class="btn_insta" @click="${()=>s(d)}" :selected="${()=>i.value===d}">${c.label}</button>`)}`)}`}function mi(e,t,r){const n=t.blender,i=D(!n.blendmap),o=D("");function s(){n.$skip||(n.blendmap=0,n.blendmix=.5,l("blender_blendmix"),i.value=!0,o.value="",r&&r(),c("blender"))}function a(p,h,v){v&&(v.filename=h?.name,n.blendmap=v,o.value=h?.name,n.blendmix=.5,i.value=!1,r&&r(),c("blender"))}function c(p){const h=document.getElementById("btn_reset_"+p);n.blendmap===0?h&&h.setAttribute("disabled",!0):h&&h.removeAttribute("disabled")}function d(p){he("param",()=>f.call(this,p),30)}function f(p){const h=p.target.value,v=this.id.split("_");n[v[1]]=parseFloat(h),l(this.id),r(),c(v[0])}function l(p){const h=document.getElementById(p);if(!h)return;const v=p.split("_");h.value=n[v[1]],v.length===3?h.previousElementSibling.value=h.value:h.nextElementSibling.value=h.value}function u(){if(!this)return;const p=this.id.split("_");n[p[1]]=.5,l(this.id),r(),c(p[0])}return _`${oe("blender",100,e,t,r,s,_`<div>${()=>o.value?_`<input type="text" :value="${()=>o.value}" disabled="disabled" style="width:90%;margin-bottom:10px;padding-right:20px"> /* RANGE INPUT */<div style="display:flex;justify-content:space-around;align-items:center"><div class="rangelabel">blend mix</div><input id="blender_blendmix" style="width:130px" type="range" value="${n.blendmix}" min="0" max="1" step="0.01" @input="${d}" @dblclick="${u}" :disabled="${()=>i.value}"> <input id="blender_blendmix_" type="number" class="rangenumb" step="0.01" min="0" max="1" value="${n.blendmix}" @input="${d}" :disabled="${()=>i.value}"></div>`:_`${Re("click or drop<br> to blend file","image/*",p=>Me(p,a),"width:90%; height:50px;")}`}</div>`)}`}function xi(e,t,r){const n={bokehstrength:0,bokehlensout:.5,gaussianstrength:0,centerX:.5,centerY:.5};s("blur")||a("blur");const i=D(!1);D(()=>{e.value==="blur"?(i.value=[[t.blur.centerX,t.blur.centerY]],se()):(i.value=!1,e.value===null&&d("blur"))},{effect:!0});function o(v){t.blur.centerX=v[0][0],t.blur.centerY=v[0][1],r()}function s(v){for(const g of Object.keys(n))if(!(g in t[v])||t[v][g]!==n[g])return!1;return!0}function a(v){for(const g of Object.keys(n))t[v][g]!==n[g]&&(t[v][g]=n[g],p(v+"_"+g))}function c(v){a(v),r(),d(v),i.value=!1,i.value=[[t.blur.centerX,t.blur.centerY]]}function d(v){const g=document.getElementById("btn_reset_"+v);g&&(s(v)?g.setAttribute("disabled",!0):g.removeAttribute("disabled"))}function f(v){v&&se(),r()}function l(v){he("param",()=>u.call(this,v),30)}function u(v){const g=v.target.value,w=this.id.split("_");t[w[0]][w[1]]=parseFloat(g),p(this.id),r(),d(w[0])}function p(v){const g=document.getElementById(v);if(!g)return;const w=v.split("_");g.value=t[w[0]][w[1]],w.length===3?g.previousElementSibling.value=g.value:g.nextElementSibling.value=g.value}function h(){if(!this)return;const v=this.id.split("_");t[v[0]][v[1]]=0,p(this.id),r(),d(v[0])}return _`${oe("blur",125,e,t,f,c,()=>_`/* mouse canvas */<style>.point{background-color:red!important;border:2px solid #ff8c00}</style>${()=>i.value&&Tt(canvas,i.value,o)} ${["bokehstrength","gaussianstrength","bokehlensout"].filter(v=>!v.startsWith("$")).map((v,g)=>_`/* RANGE INPUTS */<div style="display:flex;justify-content:space-around;align-items:center"><div class="rangelabel">${["bokeh strength","gauss strength","cirble radius"][g]}</div><input id="${"blur_"+v}" type="range" style="width:130px" value="${t.blur[v]}" min="0" max="1" step="0.01" @input="${l}" @dblclick="${h}"> <input id="${"blur_"+v+"_"}" type="number" class="rangenumb" value="${t.blur[v]}" min="0" max="1" step="0.01" @input="${l}"></div>`)}<div style="text-align:left;color:gray"><i>(center red dot)</i></div>`)}`}function bi(e,t,r){let n=!0;D(()=>{if(e.value==="recipes"){const a=i();Object.keys(a).length?n=!1:n=!0}},{effect:!0});function i(){const a={};return["colors","curve","lights","effects"].forEach(c=>{const d=Object.keys(t[c]).reduce((f,l)=>(t[c][l]&&(f[l]=t[c][l]),f),{});Object.keys(d).length&&(a[c]=d)}),(t.blur.bokehstrength||t.blur.gaussianstrength)&&(a.blur=t.blur),t.filters?.opt?.label&&(a.filters=t.filters.opt.label),a}async function o(){const a=i();if(!Object.keys(a).length)return;const c=D("recipe_"+new Date().toISOString().split("T")[0]+".json");if(!await wt(()=>_`<div style="margin:10px 0"><div style="height:38px">Download recipe</div><div style="display:flex;flex-direction:column;font-size:14px"><div><input style="width:225px;font-size:14px" type="text" :value="${()=>c.value}" @change="${u=>c.value=u.target.value}"></div></div></div>`))return;const f=new TextEncoder().encode(JSON.stringify(a)),l=new Blob([f],{type:"application/json;charset=utf-8"});Hr(l,c.value)}async function s(){const a=await Mt("application/json");if(!a)return;const c=new FileReader;await new Promise(f=>c.onload=f,c.readAsText(a));const d=JSON.parse(c.result);["colors","curve","lights","effects","blur"].forEach(f=>{d[f]&&(t[f]={...t[f],...d[f]})}),d.filters&&(t.filters.label=d.filters),e.value=null,r()}return _`${oe("recipes",125,e,t,null,null,()=>_`<div><button @click="${s}">load</button> <button id="save_btn" @click="${o}" disabled="${n}">save</button></div><div><small>will save: <i>lights, colors, effects, curve, filters and blur</i></small></div>`)}`}const yi={appname:"MiNi PhotoEditor"};function se(){const e=document.getElementById("canvas"),t=document.getElementById("editor"),r=e.width/e.height;t.offsetWidth/r>t.offsetHeight?(e.style.height="99%",e.style.width=""):(e.style.width="99%",e.style.height=""),zoomable.style.transform="",pannable.style.transform=""}function wi(e=!1){K(yi);let t=!0;e?.sample===!1&&(t=!1);let r,n,i;const o=D(!1),s=D();let a={trs:{translateX:0,translateY:0,angle:0,scale:0,flipv:0,fliph:0},crop:{currentcrop:0,glcrop:0,canvas_angle:0,ar:0,arindex:0},lights:{brightness:0,exposure:0,gamma:0,contrast:0,shadows:0,highlights:0,bloom:0},colors:{temperature:0,tint:0,vibrance:0,saturation:0,sepia:0},effects:{clarity:0,noise:0,vignette:0},curve:{curvepoints:0},filters:{opt:0,mix:0},perspective:{quad:0,modified:0},perspective2:{before:0,after:0,modified:0},blender:{blendmap:0,blendmix:.5},resizer:{width:0,height:0},blur:{bokehstrength:0,bokehlensout:.5,gaussianstrength:0,gaussianlensout:.5,centerX:.5,centerY:.5}};async function c(b,P){if(b)try{let T,M,O,ue={name:P};if(typeof b=="string"&&b.startsWith("http")){const j=await fetch(b);if(j.status!==200)return console.error(await j.json());T=await j.arrayBuffer()}else if(b instanceof Image){const j=await fetch(b.src);if(j.error)return console.error(j.error);T=await j.arrayBuffer(),O=b}else if(b instanceof ArrayBuffer)T=b;else if(b instanceof Blob)M=b,T=await b.arrayBuffer();else return console.error("Unknown data type");ue.size=T.byteLength,M||(M=new Blob([T])),O||(O=new Image,O.src=URL.createObjectURL(M),await O.decode()),d(T,ue,O)}catch(T){console.error(T),await ie(`<div style="margin:10px;text-wrap: auto;">${T}</div>`),history.back()}}e?.data&&c(e.data,e.name);async function d(b,P,T){o._value&&f();try{r=await Bt(b)}catch(O){console.error(O)}let M=r?.read();M||(M={}),M.xml&&(M.xml=M.xml.slice(M.xml.indexOf("<")).replace(/ +(?= )/g,"").replace(/\r\n|\n|\r/gm,"")),M.file={...P,hsize:Wr(P.size),width:T?.width||T?.videoWidth||"-",height:T?.height||T?.videoHeight||"-"},M.img=T,M.colorspace=M.icc?.ColorProfile?.[0].includes("P3")?"display-p3":"srgb",console.log("metadata",{...M}),o.value=M}function f(){w.value=null,A(),k(),S=.5;for(const b in a)for(const P in a[b])a[b][P]=0}D(()=>{if(s.value){const b=o._value;try{n&&n.destroy(),n=Or(document.getElementById("canvas"),b.img,b.colorspace),i&&i(),i=ot(zoomable,pannable),l(),se()}catch(P){console.error(P)}}},{effect:!0});async function l(){if(n.loadImage(),a.perspective2.after){let P=a.perspective2.before.map(M=>[M[0]*canvas.width,M[1]*canvas.height]),T=a.perspective2.after.map(M=>[M[0]*canvas.width,M[1]*canvas.height]);n.filterPerspective(P,T,!1,!1)}if((E||a.crop.glcrop)&&(a.trs.angle+=a.crop.canvas_angle,n.filterMatrix(a.trs),a.trs.angle-=a.crop.canvas_angle,a.perspective.quad)){let P=[[.25,.25],[.75,.25],[.75,.75],[.25,.75]];P=P.map(M=>[M[0]*canvas.width,M[1]*canvas.height]);let T=a.perspective.quad.map(M=>[M[0]*canvas.width,M[1]*canvas.height]);n.filterPerspective(P,T,!1,!1)}if(a.crop.glcrop)return n.crop(a.crop.glcrop),a.crop.glcrop=0,l();!a.blender.$skip&&a.blender.blendmap&&n.filterBlend(a.blender.blendmap,a.blender.blendmix);let b={};a.lights.$skip||(b={...b,...a.lights}),a.colors.$skip||(b={...b,...a.colors}),a.effects.$skip||(b={...b,...a.effects}),n.filterAdjustments({...b}),b.bloom&&n.filterBloom(b.bloom),b.noise&&n.filterNoise(b.noise),(b.shadows||b.highlights)&&n.filterHighlightsShadows(b.highlights||0,-b.shadows||0),!a.curve.$skip&&a.curve.curvepoints&&n.filterCurves(a.curve.curvepoints),!a.filters.$skip&&a.filters.opt&&n.filterInsta(a.filters.opt,a.filters.mix),!a.blur.$skip&&a.blur.bokehstrength&&n.filterBlurBokeh(a.blur),!a.blur.$skip&&a.blur.gaussianstrength&&(a.blur.gaussianlensout=a.blur.bokehlensout,n.filterBlurGaussian(a.blur)),n.paintCanvas(),C&&C()}function u(b){b?.preventDefault(),se()}let p=0;function h(b){if(b.preventDefault(),p&&Date.now()-p<200)return u(b);p=Date.now()}function v(b){b.preventDefault(),w.value=""}async function g(b){b?.stopPropagation();const P=o.value;await ie(()=>_`<div style="text-align:left;font-size:12px;max-height:50vh;overflow:auto"><div class="section">FILE</div><div>name: ${P.file.name}</div><div>size: ${P.file.width} x ${P.file.height} (${P.file.hsize})</div><div>date: ${P.exif?.DateTimeOriginal?.value||new Date(P.file.lastModified).toLocaleString("en-UK")}</div><div>prof: ${P.colorspace}</div>${P.tiff&&_`<div class="section">TIFF</div>`} ${P.tiff&&Object.entries(P.tiff).sort((T,M)=>T[0]?.toString().localeCompare(M[0]?.toString())).map(T=>_`<div>${T[0]}: ${T[1].hvalue||T[1].value}</div>`)} ${P.gps&&_`<div class="section">GPS</div>`} ${()=>P.gps&&ti([P.gps.GPSLongitude.hvalue,P.gps.GPSLatitude.hvalue])} ${P.exif&&_`<div class="section">EXIF</div>`} ${P.exif&&Object.entries(P.exif).sort((T,M)=>T[0]?.toString().localeCompare(M[0]?.toString())).map(T=>_`<div>${T[0]}: ${T[1].hvalue||T[1].value}</div>`)}</div>`,400)}const w=D();let $=null;D(()=>{w.value==="composition"?x():$==="composition"&&R(),$=w.value},{effect:!0});let E=!1;function x(){k(),A(),se(),E=!0,btn_info.setAttribute("disabled",!0),btn_histo.setAttribute("disabled",!0),btn_split.setAttribute("disabled",!0),i&&i()}function R(){E=!1,btn_info.removeAttribute("disabled"),btn_histo.removeAttribute("disabled"),btn_split.removeAttribute("disabled"),i=ot(zoomable,pannable)}function m(){Object.values(a.trs).reduce((b,P)=>b+=P,0)===0&&Object.values(a.crop).reduce((b,P)=>b+=P,0)===0&&a.perspective.modified==0&&a.resizer.width===0?btn_reset_composition.setAttribute("disabled",!0):btn_reset_composition.removeAttribute("disabled")}let C;const B=D(!1);function L(b){b?.stopPropagation(),!E&&(B.value?B.value=!1:B.value=!0)}function A(){B.value=!1}let S,U;const y=D(!1);function k(){y.value=!1}
  function initApp() {
  	 	let href = window.location.href;
		let url = new URL(href);
		let filePath = url.searchParams.get("path");
		let filename = filePath.substring(filePath.lastIndexOf('/') + 1);
		let isPathWritable = url.searchParams.get("isPathWritable") == 'true';
		if (!isPathWritable) {
            console.log('File not writable!');
			return;
		}
		fetch(filePath, { method: 'GET' }).then(function(response) {
      		if (response.status === 200) {
				response.arrayBuffer().then(function(imageAB) {
  					console.log('running!'); 
  					setTimeout(() => {
  						const elements = document.getElementsByClassName("welcome-screen");
    					while(elements.length > 0){
        					elements[0].parentNode.removeChild(elements[0]);
        				}
			        	c(imageAB,filename);
			        }, 1000);
    			});
      		}
		});	
  	return true;
  }
  function I(b){b?.stopPropagation(),!E&&(y._value?y.value=!1:(U=n.img_cropped||n.img,y.value=!0))}function F(b){S=b}async function X(){await ie(b=>_`<div style="position:relative;height:250px;overflow:auto"><img id="snail.jpg" @click="${J}" style="cursor:pointer;position:absolute;top:50px;left:20px;border-radius:10px" src="./samples/snail-8577681_1280.jpg" title="jpg" width="130"> <img id="seagull.png" @click="${J}" style="cursor:pointer;position:absolute;top:50px;left:160px;border-radius:10px" src="./samples/seagull-8547189_1280.png" title="png" width="150"> <img id="water.jpg" @click="${J}" style="cursor:pointer;position:absolute;top:145px;left:160px;border-radius:10px" src="./samples/water-8100724_1280.jpg" title="jpg" width="150"> <img id="perspective.jpg" @click="${J}" style="cursor:pointer;position:absolute;top:50px;left:320px;border-radius:10px" src="./samples/perspective2.jpg" title="jpg" width="137"></div>`,460)}function J(){c(this.src,this.id),root.lastElementChild.remove()}return _`<div class="minieditor"><div class="app">/******** LOADING PAGE ********/ 
  ${()=>initApp()&&_`<div class="welcome-screen" style="justify-content:center">
  <img src="${rt}" width="130" alt="logo"><h1>${K("appname")}</h1>
  <div style="font-size:13px;color:gray;margin-top:20px">
  <i>100% private and offline!<br>100% free and opensource 
  <a style="font-size:10px" href="https://github.com/xdadda/mini-photo-editor" target="_blank">
  <img src="${it}" style="width:15px"></a></i></div></div>`}
  /******** IMGEDITOR PAGE ********/ ${()=>o.value&&_`${e?'<div class="header" style="backdrop-filter: unset;"></div>':_`<div class="header"><div class="banner"><img src="${rt}" width="30" alt="logo"> ${K("appname")}</div><div></div><div style="display:flex"><div class="btn_fullscreen">${()=>Jr(null)}</div><div class="btn_theme">${()=>Kr("dark",!0)}</div></div></div>`}<div class="main"><div class="container"><div id="editor" class="editor"><div id="zoomable" @dblclick="${u}" @click="${h}"><div id="pannable">/******** PAINT CANVAS *******/<canvas :ref="${s}" id="canvas" class="checkered"></canvas>/******** SPLIT VIEW *******/ ${()=>y.value&&ii(U,canvas.style.width,canvas.style.height,S,F)} /******** CROP CANVAS *******/ ${()=>w.value==="composition"&&ri(canvas,a,m)}</div></div></div><div class="sidebar" @click="${v}"><div class="menubuttons"><div style="display:flex;align-items:center;justify-content:center">${!e?.data&&_`${Re("open","image/*",b=>Me(b,d),"width:105px;height:30px;")}`} ${!!e?.data&&_`<button style="width:105px;height:30px" @click="${()=>e.cb()}">cancel</button>`} <button style="width:105px;height:30px" id="btn_download" @click="${()=>{w.value="",oi(o,r,n,e?.cb||null)}}">${"save"}</button></div><div style="display:flex;align-items:center;justify-content:center"><button style="width:70px;height:30px;fill:white" id="btn_info" @click="${g}" title="file info"><div style="scale:0.35;margin-top:-15px">${jr}</div></button> <button style="width:70px;height:30px;fill:white" id="btn_histo" @click="${L}" :selected="${()=>B.value}" tile="histogram"><div style="scale:0.4;margin-top:-15px">${Xr}</div></button> <button style="width:70px;height:30px;fill:white" id="btn_split" @click="${I}" :selected="${()=>y.value}" tile="splitview"><div style="scale:0.5;margin-top:-15px">${Vr}</div></button></div></div><div class="menusections">/******** COMPOSITION *******/ ${ci(w,a,l,()=>n,se)} /******** PERSPECTIVE *******/ /******** ADJUSTMENTS *******/ ${ui(w,a,l)} /******** COLOR CURVE *******/ ${di(w,a,l)} /******** FILTERS *******/ ${gi(w,a,l)} /******** BLENDER *******/ ${mi(w,a,l)} /******** BLUR *******/ ${xi(w,a,l)} /******** RECIPES *******/ ${bi(w,a,l)}</div></div></div>/******** HISTOGRAM *******/ ${()=>B.value&&ei(o._value.colorspace,b=>{C=b,l()})}</div>`}<div class="footer"><a style="margin-right:10px;font-size:10px" href="https://github.com/xdadda/mini-photo-editor" target="_blank"><img src="${it}" style="width:15px"></a></div></div></div>`}await Te(document.getElementById("root"),wi);
