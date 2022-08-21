(()=>{var Ce=Object.create;var te=Object.defineProperty;var _e=Object.getOwnPropertyDescriptor;var Fe=Object.getOwnPropertyNames;var Se=Object.getPrototypeOf,Oe=Object.prototype.hasOwnProperty;var z=(r,e)=>()=>(r&&(e=r(r=0)),e);var Ue=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports),ue=(r,e)=>{for(var t in e)te(r,t,{get:e[t],enumerable:!0})},Te=(r,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Fe(e))!Oe.call(r,n)&&n!==t&&te(r,n,{get:()=>e[n],enumerable:!(i=_e(e,n))||i.enumerable});return r};var Ve=(r,e,t)=>(t=r!=null?Ce(Se(r)):{},Te(e||!r||!r.__esModule?te(t,"default",{value:r,enumerable:!0}):t,r));var $e,ze,he,nt,rt,k,M,He,je,Ge,A,ve,st,H,j=z(()=>{$e=r=>{let e=new Map;e.set("web",{name:"web"});let t=r.CapacitorPlatforms||{currentPlatform:{name:"web"},platforms:e},i=(s,a)=>{t.platforms.set(s,a)},n=s=>{t.platforms.has(s)&&(t.currentPlatform=t.platforms.get(s))};return t.addPlatform=i,t.setPlatform=n,t},ze=r=>r.CapacitorPlatforms=$e(r),he=ze(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),nt=he.addPlatform,rt=he.setPlatform;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(k||(k={}));M=class extends Error{constructor(e,t){super(e),this.message=e,this.code=t}},He=r=>{var e,t;return r?.androidBridge?"android":!((t=(e=r?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},je=r=>{var e,t,i,n,s;let a=r.CapacitorCustomPlatform||null,o=r.Capacitor||{},c=o.Plugins=o.Plugins||{},l=r.CapacitorPlatforms,h=()=>a!==null?a.name:He(r),w=((e=l?.currentPlatform)===null||e===void 0?void 0:e.getPlatform)||h,d=()=>w()!=="web",f=((t=l?.currentPlatform)===null||t===void 0?void 0:t.isNativePlatform)||d,y=v=>{let g=U.get(v);return!!(g?.platforms.has(w())||L(v))},D=((i=l?.currentPlatform)===null||i===void 0?void 0:i.isPluginAvailable)||y,R=v=>{var g;return(g=o.PluginHeaders)===null||g===void 0?void 0:g.find(T=>T.name===v)},L=((n=l?.currentPlatform)===null||n===void 0?void 0:n.getPluginHeader)||R,O=v=>r.console.error(v),C=(v,g,T)=>Promise.reject(`${T} does not have an implementation of "${g}".`),U=new Map,Le=(v,g={})=>{let T=U.get(v);if(T)return console.warn(`Capacitor plugin "${v}" already registered. Cannot register plugins twice.`),T.proxy;let _=w(),V=L(v),E,Be=async()=>(!E&&_ in g?E=typeof g[_]=="function"?E=await g[_]():E=g[_]:a!==null&&!E&&"web"in g&&(E=typeof g.web=="function"?E=await g.web():E=g.web),E),Ie=(b,m)=>{var P,B;if(V){let I=V?.methods.find(x=>m===x.name);if(I)return I.rtype==="promise"?x=>o.nativePromise(v,m.toString(),x):(x,W)=>o.nativeCallback(v,m.toString(),x,W);if(b)return(P=b[m])===null||P===void 0?void 0:P.bind(b)}else{if(b)return(B=b[m])===null||B===void 0?void 0:B.bind(b);throw new M(`"${v}" plugin is not implemented on ${_}`,k.Unimplemented)}},Z=b=>{let m,P=(...B)=>{let I=Be().then(x=>{let W=Ie(x,b);if(W){let $=W(...B);return m=$?.remove,$}else throw new M(`"${v}.${b}()" is not implemented on ${_}`,k.Unimplemented)});return b==="addListener"&&(I.remove=async()=>m()),I};return P.toString=()=>`${b.toString()}() { [capacitor code] }`,Object.defineProperty(P,"name",{value:b,writable:!1,configurable:!1}),P},ce=Z("addListener"),le=Z("removeListener"),Ae=(b,m)=>{let P=ce({eventName:b},m),B=async()=>{let x=await P;le({eventName:b,callbackId:x},m)},I=new Promise(x=>P.then(()=>x({remove:B})));return I.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await B()},I},ee=new Proxy({},{get(b,m){switch(m){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return V?Ae:ce;case"removeListener":return le;default:return Z(m)}}});return c[v]=ee,U.set(v,{name:v,proxy:ee,platforms:new Set([...Object.keys(g),...V?[_]:[]])}),ee},Ee=((s=l?.currentPlatform)===null||s===void 0?void 0:s.registerPlugin)||Le;return o.convertFileSrc||(o.convertFileSrc=v=>v),o.getPlatform=w,o.handleError=O,o.isNativePlatform=f,o.isPluginAvailable=D,o.pluginMethodNoop=C,o.registerPlugin=Ee,o.Exception=M,o.DEBUG=!!o.DEBUG,o.isLoggingEnabled=!!o.isLoggingEnabled,o.platform=o.getPlatform(),o.isNative=o.isNativePlatform(),o},Ge=r=>r.Capacitor=je(r),A=Ge(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),ve=A.registerPlugin,st=A.Plugins,H=class{constructor(e){this.listeners={},this.windowListeners={},e&&(console.warn(`Capacitor WebPlugin "${e.name}" config object was deprecated in v3 and will be removed in v4.`),this.config=e)}addListener(e,t){this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t);let n=this.windowListeners[e];n&&!n.registered&&this.addWindowListener(n);let s=async()=>this.removeListener(e,t),a=Promise.resolve({remove:s});return Object.defineProperty(a,"remove",{value:async()=>{console.warn("Using addListener() without 'await' is deprecated."),await s()}}),a}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t){let i=this.listeners[e];i&&i.forEach(n=>n(t))}hasListeners(e){return!!this.listeners[e].length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:i=>{this.notifyListeners(t,i)}}}unimplemented(e="not implemented"){return new A.Exception(e,k.Unimplemented)}unavailable(e="not available"){return new A.Exception(e,k.Unavailable)}async removeListener(e,t){let i=this.listeners[e];if(!i)return;let n=i.indexOf(t);this.listeners[e].splice(n,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){!e||(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}}});function Qe(r){return new DataView(Uint8Array.from(r).buffer)}function Je(r){return Array.from(new Uint8Array(r.buffer))}function Xe(r){return`0000${r.toString(16).padStart(4,"0")}-0000-1000-8000-00805f9b34fb`}function q(r){let e=r.trim().split(" ").filter(t=>t!=="").map(t=>parseInt(t,16));return Qe(e)}function G(r){return Je(r).map(e=>{let t=e.toString(16);return t.length==1&&(t="0"+t),t}).join(" ")}function we(r){if(typeof r=="string")return r;if(typeof r=="number")return Xe(r);throw new Error("Invalid UUID")}function re(r){let e={};if(!!r)return r.forEach((t,i)=>{e[i.toString()]=t}),e}var Q=z(()=>{});async function ge(r,e,t){let i;return Promise.race([r,new Promise((n,s)=>{i=setTimeout(()=>s(t),e)})]).finally(()=>clearTimeout(i))}var pe=z(()=>{});var be={};ue(be,{BluetoothLeWeb:()=>se});var se,me=z(()=>{j();Q();pe();se=class extends H{constructor(){super(...arguments),this.deviceMap=new Map,this.discoveredDevices=new Map,this.scan=null,this.DEFAULT_CONNECTION_TIMEOUT=1e4,this.onAdvertisementReceivedCallback=this.onAdvertisementReceived.bind(this),this.onDisconnectedCallback=this.onDisconnected.bind(this),this.onCharacteristicValueChangedCallback=this.onCharacteristicValueChanged.bind(this)}async initialize(){if(typeof navigator>"u"||!navigator.bluetooth)throw this.unavailable("Web Bluetooth API not available in this browser.");if(!await navigator.bluetooth.getAvailability())throw this.unavailable("No Bluetooth radio available.")}async isEnabled(){return{value:!0}}async enable(){throw this.unavailable("enable is not available on web.")}async disable(){throw this.unavailable("disable is not available on web.")}async startEnabledNotifications(){}async stopEnabledNotifications(){}async isLocationEnabled(){throw this.unavailable("isLocationEnabled is not available on web.")}async openLocationSettings(){throw this.unavailable("openLocationSettings is not available on web.")}async openBluetoothSettings(){throw this.unavailable("openBluetoothSettings is not available on web.")}async openAppSettings(){throw this.unavailable("openAppSettings is not available on web.")}async setDisplayStrings(){}async requestDevice(e){let t=this.getFilters(e),i=await navigator.bluetooth.requestDevice({filters:t.length?t:void 0,optionalServices:e?.optionalServices,acceptAllDevices:t.length===0});return this.deviceMap.set(i.id,i),this.getBleDevice(i)}async requestLEScan(e){this.requestBleDeviceOptions=e;let t=this.getFilters(e);await this.stopLEScan(),this.discoveredDevices=new Map,navigator.bluetooth.removeEventListener("advertisementreceived",this.onAdvertisementReceivedCallback),navigator.bluetooth.addEventListener("advertisementreceived",this.onAdvertisementReceivedCallback),this.scan=await navigator.bluetooth.requestLEScan({filters:t.length?t:void 0,acceptAllAdvertisements:t.length===0,keepRepeatedDevices:e?.allowDuplicates})}onAdvertisementReceived(e){var t,i;let n=e.device.id;if(this.deviceMap.set(n,e.device),!this.discoveredDevices.has(n)||((t=this.requestBleDeviceOptions)===null||t===void 0?void 0:t.allowDuplicates)){this.discoveredDevices.set(n,!0);let a=this.getBleDevice(e.device),o={device:a,localName:a.name,rssi:e.rssi,txPower:e.txPower,manufacturerData:re(e.manufacturerData),serviceData:re(e.serviceData),uuids:(i=e.uuids)===null||i===void 0?void 0:i.map(we)};this.notifyListeners("onScanResult",o)}}async stopLEScan(){var e;!((e=this.scan)===null||e===void 0)&&e.active&&this.scan.stop(),this.scan=null}async getDevices(e){return{devices:(await navigator.bluetooth.getDevices()).map(n=>(this.deviceMap.set(n.id,n),this.getBleDevice(n)))}}async getConnectedDevices(e){return{devices:(await navigator.bluetooth.getDevices()).filter(n=>{var s;return(s=n.gatt)===null||s===void 0?void 0:s.connected}).map(n=>(this.deviceMap.set(n.id,n),this.getBleDevice(n)))}}async connect(e){var t,i;let n=this.getDeviceFromMap(e.deviceId);n.removeEventListener("gattserverdisconnected",this.onDisconnectedCallback),n.addEventListener("gattserverdisconnected",this.onDisconnectedCallback);let s=Symbol();if(n.gatt===void 0)throw new Error("No gatt server available.");try{let a=(t=e.timeout)!==null&&t!==void 0?t:this.DEFAULT_CONNECTION_TIMEOUT;await ge(n.gatt.connect(),a,s)}catch(a){throw await((i=n.gatt)===null||i===void 0?void 0:i.disconnect()),a===s?new Error("Connection timeout"):a}}onDisconnected(e){let i=`disconnected|${e.target.id}`;this.notifyListeners(i,null)}async createBond(e){throw this.unavailable("createBond is not available on web.")}async isBonded(e){throw this.unavailable("isBonded is not available on web.")}async disconnect(e){var t;(t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0||t.disconnect()}async getServices(e){var t,i;let n=(i=await((t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0?void 0:t.getPrimaryServices()))!==null&&i!==void 0?i:[],s=[];for(let a of n){let o=await a.getCharacteristics(),c=[];for(let l of o)c.push({uuid:l.uuid,properties:this.getProperties(l),descriptors:await this.getDescriptors(l)});s.push({uuid:a.uuid,characteristics:c})}return{services:s}}async getDescriptors(e){try{return(await e.getDescriptors()).map(i=>({uuid:i.uuid}))}catch{return[]}}getProperties(e){return{broadcast:e.properties.broadcast,read:e.properties.read,writeWithoutResponse:e.properties.writeWithoutResponse,write:e.properties.write,notify:e.properties.notify,indicate:e.properties.indicate,authenticatedSignedWrites:e.properties.authenticatedSignedWrites,reliableWrite:e.properties.reliableWrite,writableAuxiliaries:e.properties.writableAuxiliaries}}async getCharacteristic(e){var t;let i=await((t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0?void 0:t.getPrimaryService(e?.service));return i?.getCharacteristic(e?.characteristic)}async getDescriptor(e){let t=await this.getCharacteristic(e);return t?.getDescriptor(e?.descriptor)}async readRssi(e){throw this.unavailable("readRssi is not available on web.")}async read(e){let t=await this.getCharacteristic(e);return{value:await t?.readValue()}}async write(e){let t=await this.getCharacteristic(e),i;typeof e.value=="string"?i=q(e.value):i=e.value,await t?.writeValueWithResponse(i)}async writeWithoutResponse(e){let t=await this.getCharacteristic(e),i;typeof e.value=="string"?i=q(e.value):i=e.value,await t?.writeValueWithoutResponse(i)}async readDescriptor(e){let t=await this.getDescriptor(e);return{value:await t?.readValue()}}async writeDescriptor(e){let t=await this.getDescriptor(e),i;typeof e.value=="string"?i=q(e.value):i=e.value,await t?.writeValue(i)}async startNotifications(e){let t=await this.getCharacteristic(e);t?.removeEventListener("characteristicvaluechanged",this.onCharacteristicValueChangedCallback),t?.addEventListener("characteristicvaluechanged",this.onCharacteristicValueChangedCallback),await t?.startNotifications()}onCharacteristicValueChanged(e){var t,i;let n=e.target,s=`notification|${(t=n.service)===null||t===void 0?void 0:t.device.id}|${(i=n.service)===null||i===void 0?void 0:i.uuid}|${n.uuid}`;this.notifyListeners(s,{value:n.value})}async stopNotifications(e){let t=await this.getCharacteristic(e);await t?.stopNotifications()}getFilters(e){var t;let i=[];for(let n of(t=e?.services)!==null&&t!==void 0?t:[])i.push({services:[n],name:e?.name,namePrefix:e?.namePrefix});return(e?.name||e?.namePrefix)&&i.length===0&&i.push({name:e.name,namePrefix:e.namePrefix}),i}getDeviceFromMap(e){let t=this.deviceMap.get(e);if(t===void 0)throw new Error('Device not found. Call "requestDevice", "requestLEScan" or "getDevices" first.');return t}getBleDevice(e){var t;return{deviceId:e.id,name:(t=e.name)!==null&&t!==void 0?t:void 0,uuids:e.uuids}}}});var De=Ue((vt,X)=>{"use strict";function ye(r){var e=new ae,t=r|0;function i(c,l,h){return(t|0)!==0?(t=(t|0)-1,new Promise(function(w){w(c.apply(l,h))}).then(s,a)):new Promise(function(w){e.push(new Ze(w,c,l,h))}).then(n)}function n(c){try{return Promise.resolve(c.fn.apply(c.self,c.args)).then(s,a)}catch(l){a(l)}}function s(c){return o(),c}function a(c){throw o(),c}function o(){var c=e.shift();c?c.resolve(c):t=(t|0)+1}return i}function Ye(r,e){let t=ye(r|0);return function(){for(var i=new Array(arguments.length),n=0;n<arguments.length;n++)i[n]=arguments[n];return t(e,this,i)}}function Ke(r){let e=ye(r|0);return function(t){if(typeof t!="function")throw new TypeError("Expected throat fn to be a function but got "+typeof t);for(var i=new Array(arguments.length-1),n=1;n<arguments.length;n++)i[n-1]=arguments[n];return e(t,this,i)}}X.exports=function(e,t){if(typeof e=="function"){var i=t;t=e,e=i}if(typeof e!="number")throw new TypeError("Expected throat size to be a number but got "+typeof e);if(t!==void 0&&typeof t!="function")throw new TypeError("Expected throat fn to be a function but got "+typeof t);return typeof t=="function"?Ye(e|0,t):Ke(e|0)};X.exports.default=X.exports;function Ze(r,e,t,i){this.resolve=r,this.fn=e,this.self=t||null,this.args=i}var J=64;function ae(){this._s1=[],this._s2=[],this._shiftBlock=this._pushBlock=new Array(J),this._pushIndex=0,this._shiftIndex=0}ae.prototype.push=function(r){this._pushIndex===J&&(this._pushIndex=0,this._s1[this._s1.length]=this._pushBlock=new Array(J)),this._pushBlock[this._pushIndex++]=r};ae.prototype.shift=function(){if(this._shiftIndex===J){this._shiftIndex=0;var r=this._s2;if(r.length===0){var e=this._s1;if(e.length===0)return;this._s1=r,r=this._s2=e.reverse()}this._shiftBlock=r.pop()}if(!(this._pushBlock===this._shiftBlock&&this._pushIndex===this._shiftIndex)){var t=this._shiftBlock[this._shiftIndex];return this._shiftBlock[this._shiftIndex++]=null,t}}});var K={};ue(K,{BLEClient:()=>S});var ke=/^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/,qe=/([1-9]\d*)?([xcbB?hHiIfdsp])/g,ie=(r,e,t)=>String.fromCharCode(...new Uint8Array(r.buffer,r.byteOffset+e,t)),ne=(r,e,t,i)=>new Uint8Array(r.buffer,r.byteOffset+e,t).set(i.split("").map(n=>n.charCodeAt(0))),Re=(r,e,t)=>ie(r,e+1,Math.min(r.getUint8(e),t-1)),Ne=(r,e,t,i)=>{r.setUint8(e,i.length),ne(r,e+1,t-1,i)},Me=r=>({x:e=>[1,e,0],c:e=>[e,1,t=>({u:i=>ie(i,t,1),p:(i,n)=>ne(i,t,1,n)})],"?":e=>[e,1,t=>({u:i=>Boolean(i.getUint8(t)),p:(i,n)=>i.setUint8(t,n)})],b:e=>[e,1,t=>({u:i=>i.getInt8(t),p:(i,n)=>i.setInt8(t,n)})],B:e=>[e,1,t=>({u:i=>i.getUint8(t),p:(i,n)=>i.setUint8(t,n)})],h:e=>[e,2,t=>({u:i=>i.getInt16(t,r),p:(i,n)=>i.setInt16(t,n,r)})],H:e=>[e,2,t=>({u:i=>i.getUint16(t,r),p:(i,n)=>i.setUint16(t,n,r)})],i:e=>[e,4,t=>({u:i=>i.getInt32(t,r),p:(i,n)=>i.setInt32(t,n,r)})],I:e=>[e,4,t=>({u:i=>i.getUint32(t,r),p:(i,n)=>i.setUint32(t,n,r)})],f:e=>[e,4,t=>({u:i=>i.getFloat32(t,r),p:(i,n)=>i.setFloat32(t,n,r)})],d:e=>[e,8,t=>({u:i=>i.getFloat64(t,r),p:(i,n)=>i.setFloat64(t,n,r)})],s:e=>[1,e,t=>({u:i=>ie(i,t,e),p:(i,n)=>ne(i,t,e,n.slice(0,e))})],p:e=>[1,e,t=>({u:i=>Re(i,t,e),p:(i,n)=>Ne(i,t,e,n.slice(0,e-1))})]}),de=new RangeError("Structure larger than remaining buffer"),We=new RangeError("Not enough values for structure"),F=class{static toDataView(e){if(!(e instanceof DataView))if(typeof e=="string"&&parseInt(e)&&(e=parseInt(e)),typeof e=="string"){let t=new TextEncoder,i={};for(let s in F.codes)for(;e.indexOf(s)>-1;){let a=e.indexOf(s);e=e.replace(s,""),i[a]=s}let n=Array.from(t.encode(e));for(let s in i)n.splice(parseInt(s),0,F.codes[i[s]]);e=new DataView(new Uint8Array(n).buffer)}else if(typeof e=="number"){let t=e;e<256?(e=new DataView(new ArrayBuffer(1)),e.setUint8(0,t)):e<65536?(e=new DataView(new ArrayBuffer(2)),e.setInt16(0,t)):(e=new DataView(new ArrayBuffer(4)),e.setUint32(0,t))}else e instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&e instanceof SharedArrayBuffer?e=new DataView(e):Array.isArray(e)?e=new DataView(Uint8Array.from(e).buffer):typeof e=="object"&&(e=new TextEncoder().encode(JSON.stringify(e)));return e}static searchBuffer(e,t,i){for(var n=t,s=e,a=F.boyerMoore(n),o=a.byteLength,c=[],l=a(s);l!==-1&&(c.push(l),!(i&&c.length>=i));l=a(s,l+o));return c}static bytesToInt16(e,t){let i=(255&e)<<8|255&t;return(i&32768)>0?i|=4294901760:i&=65535,i}static bytesToUInt16(e,t){return e*256+t}static Uint16ToBytes(e){return[e&255,e>>8&255]}static bytesToInt24(e,t,i){let n=(255&e)<<16|(255&t)<<8|255&i;return(n&8388608)>0?n|=4278190080:n&=16777215,n}static bytesToUInt24(e,t,i){return e*65536+t*256+i}static Uint24ToBytes(e){return[e&255,e>>8&255,e>>16&255]}static bytesToInt32(e,t,i,n){let s=(255&e)<<24|(255&t)<<16|(255&i)<<8|255&n;return(s&2147483648)>0?s|=0:s&=4294967295,s}static bytesToUInt32(e,t,i,n){return e*16777216+t*65536+i*256+n}static Uint32ToBytes(e){return[e&255,e>>8&255,e>>16&255,e>>24&255]}static get2sCompliment(e,t){return e>4294967296?null:e<<32-t>>32-t}static getSignedInt(...e){let t=0;function i(n){for(var s=0,a=!0;n--;)if(a){let o=e[t++];s+=o&127,o&128&&(s-=128),a=!1}else s*=256,s+=e[t++];return s}return i(e.length)}static asUint8Array(e){if(e instanceof Uint8Array)return e;if(typeof e=="string"){for(var t=new Uint8Array(e.length),i=0;i<e.length;i++){var n=e.charCodeAt(i);if(n>127)throw new TypeError("Only ASCII patterns are supported");t[i]=n}return t}else return new Uint8Array(e)}static boyerMoore(e){var t=F.asUint8Array(e),i=t.length;if(i===0)throw new TypeError("patternBuffer must be at least 1 byte long");for(var n=256,s=new Int32Array(n),a=0;a<n;a++)s[a]=-1;for(var o=0;o<i;o++)s[t[o]]=o;var c=(l,h,w)=>{var d=F.asUint8Array(l);h===void 0&&(h=0),w===void 0&&(w=d.length);for(var f=t,y=s,D=w-f.length,R=f.length-1,L,O=h;O<=D;O+=L){L=0;for(var C=R;C>=0;C--){var U=d[O+C];if(f[C]!==U){L=Math.max(1,C-y[U]);break}}if(L===0)return O}return-1};return c.byteLength=t.byteLength,c}static struct(e){let t=[],i=0,n=ke.exec(e);if(!n)throw new RangeError("Invalid format string");let s=Me(n[1]==="<"),a=(d,f)=>s[f](d?parseInt(d,10):1);for(;n=qe.exec(e);)((d,f,y)=>{for(let D=0;D<d;++D,i+=f)y&&t.push(y(i))})(...a(...n.slice(1)));let o=(d,f)=>{if(d.byteLength<(f|0)+i)throw de;let y=new DataView(d,f|0);return t.map(D=>D.u(y))},c=(d,f,...y)=>{if(y.length<t.length)throw We;if(d.byteLength<f+i)throw de;let D=new DataView(d,f);new Uint8Array(d,f,i).fill(0),t.forEach((R,L)=>R.p(D,y[L]))},l=(...d)=>{let f=new ArrayBuffer(i);return c(f,0,...d),f},h=d=>o(d,0);function*w(d){for(let f=0;f+i<=d.byteLength;f+=i)yield o(d,f)}return Object.freeze({unpack:h,pack:l,unpack_from:o,pack_into:c,iter_unpack:w,format:e,size:i})}},N=F;N.codes={"\\n":10,"\\r":13,"\\t":9,"\\s":32,"\\b":8,"\\f":12,"\\":92};var fe;(function(r){r[r.SCAN_MODE_LOW_POWER=0]="SCAN_MODE_LOW_POWER",r[r.SCAN_MODE_BALANCED=1]="SCAN_MODE_BALANCED",r[r.SCAN_MODE_LOW_LATENCY=2]="SCAN_MODE_LOW_LATENCY"})(fe||(fe={}));j();Q();j();var u=ve("BluetoothLe",{web:()=>Promise.resolve().then(()=>(me(),be)).then(r=>new r.BluetoothLeWeb)});var xe=Ve(De());function Y(r){return r?(0,xe.default)(1):e=>e()}function p(r){if(typeof r!="string")throw new Error(`Invalid UUID type ${typeof r}. Expected string.`);if(r=r.toLowerCase(),!(r.search(/^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/)>=0))throw new Error(`Invalid UUID format ${r}. Expected 128 bit string (e.g. "0000180d-0000-1000-8000-00805f9b34fb").`);return r}var oe=class{constructor(){this.scanListener=null,this.eventListeners=new Map,this.queue=Y(!0)}enableQueue(){this.queue=Y(!0)}disableQueue(){this.queue=Y(!1)}async initialize(e){await this.queue(async()=>{await u.initialize(e)})}async getEnabled(){return this.isEnabled()}async isEnabled(){return await this.queue(async()=>(await u.isEnabled()).value)}async enable(){await this.queue(async()=>{await u.enable()})}async disable(){await this.queue(async()=>{await u.disable()})}async startEnabledNotifications(e){await this.queue(async()=>{var t;let i="onEnabledChanged";await((t=this.eventListeners.get(i))===null||t===void 0?void 0:t.remove());let n=await u.addListener(i,s=>{e(s.value)});this.eventListeners.set(i,n),await u.startEnabledNotifications()})}async stopEnabledNotifications(){await this.queue(async()=>{var e;let t="onEnabledChanged";await((e=this.eventListeners.get(t))===null||e===void 0?void 0:e.remove()),this.eventListeners.delete(t),await u.stopEnabledNotifications()})}async isLocationEnabled(){return await this.queue(async()=>(await u.isLocationEnabled()).value)}async openLocationSettings(){await this.queue(async()=>{await u.openLocationSettings()})}async openBluetoothSettings(){await this.queue(async()=>{await u.openBluetoothSettings()})}async openAppSettings(){await this.queue(async()=>{await u.openAppSettings()})}async setDisplayStrings(e){await this.queue(async()=>{await u.setDisplayStrings(e)})}async requestDevice(e){return await this.queue(async()=>await u.requestDevice(e))}async requestLEScan(e,t){await this.queue(async()=>{var i;await((i=this.scanListener)===null||i===void 0?void 0:i.remove()),this.scanListener=await u.addListener("onScanResult",n=>{let s=Object.assign(Object.assign({},n),{manufacturerData:this.convertObject(n.manufacturerData),serviceData:this.convertObject(n.serviceData),rawAdvertisement:n.rawAdvertisement?this.convertValue(n.rawAdvertisement):void 0});t(s)}),await u.requestLEScan(e)})}async stopLEScan(){await this.queue(async()=>{var e;await((e=this.scanListener)===null||e===void 0?void 0:e.remove()),this.scanListener=null,await u.stopLEScan()})}async getDevices(e){return this.queue(async()=>(await u.getDevices({deviceIds:e})).devices)}async getConnectedDevices(e){return this.queue(async()=>(await u.getConnectedDevices({services:e})).devices)}async connect(e,t,i){await this.queue(async()=>{var n;if(t){let s=`disconnected|${e}`;await((n=this.eventListeners.get(s))===null||n===void 0?void 0:n.remove());let a=await u.addListener(s,()=>{t(e)});this.eventListeners.set(s,a)}await u.connect(Object.assign({deviceId:e},i))})}async createBond(e){await this.queue(async()=>{await u.createBond({deviceId:e})})}async isBonded(e){return await this.queue(async()=>(await u.isBonded({deviceId:e})).value)}async disconnect(e){await this.queue(async()=>{await u.disconnect({deviceId:e})})}async getServices(e){return await this.queue(async()=>(await u.getServices({deviceId:e})).services)}async readRssi(e){return await this.queue(async()=>{let i=await u.readRssi({deviceId:e});return parseFloat(i.value)})}async read(e,t,i,n){return t=p(t),i=p(i),await this.queue(async()=>{let a=await u.read(Object.assign({deviceId:e,service:t,characteristic:i},n));return this.convertValue(a.value)})}async write(e,t,i,n,s){return t=p(t),i=p(i),this.queue(async()=>{if(!n?.buffer)throw new Error("Invalid data.");let a=n;A.getPlatform()!=="web"&&(a=G(n)),await u.write(Object.assign({deviceId:e,service:t,characteristic:i,value:a},s))})}async writeWithoutResponse(e,t,i,n,s){t=p(t),i=p(i),await this.queue(async()=>{if(!n?.buffer)throw new Error("Invalid data.");let a=n;A.getPlatform()!=="web"&&(a=G(n)),await u.writeWithoutResponse(Object.assign({deviceId:e,service:t,characteristic:i,value:a},s))})}async readDescriptor(e,t,i,n,s){return t=p(t),i=p(i),n=p(n),await this.queue(async()=>{let o=await u.readDescriptor(Object.assign({deviceId:e,service:t,characteristic:i,descriptor:n},s));return this.convertValue(o.value)})}async writeDescriptor(e,t,i,n,s,a){return t=p(t),i=p(i),n=p(n),this.queue(async()=>{if(!s?.buffer)throw new Error("Invalid data.");let o=s;A.getPlatform()!=="web"&&(o=G(s)),await u.writeDescriptor(Object.assign({deviceId:e,service:t,characteristic:i,descriptor:n,value:o},a))})}async startNotifications(e,t,i,n){t=p(t),i=p(i),await this.queue(async()=>{var s;let a=`notification|${e}|${t}|${i}`;await((s=this.eventListeners.get(a))===null||s===void 0?void 0:s.remove());let o=await u.addListener(a,c=>{n(this.convertValue(c?.value))});this.eventListeners.set(a,o),await u.startNotifications({deviceId:e,service:t,characteristic:i})})}async stopNotifications(e,t,i){t=p(t),i=p(i),await this.queue(async()=>{var n;let s=`notification|${e}|${t}|${i}`;await((n=this.eventListeners.get(s))===null||n===void 0?void 0:n.remove()),this.eventListeners.delete(s),await u.stopNotifications({deviceId:e,service:t,characteristic:i})})}convertValue(e){return typeof e=="string"?q(e):e===void 0?new DataView(new ArrayBuffer(0)):e}convertObject(e){if(e===void 0)return;let t={};for(let i of Object.keys(e))t[i]=this.convertValue(e[i]);return t}},Pe=new oe;Q();var S=class extends N{constructor(t,i){super();this.client=Pe;this.devices={};this.location=!1;this.initialized=!1;this.setupDevice=(t,i)=>new Promise(async(n,s)=>{this.devices[t.deviceId]={device:t,deviceId:t.deviceId,...i},this.client.connect(t.deviceId,a=>{this.devices[t.deviceId]?.ondisconnect&&this.devices[t.deviceId].ondisconnect(a)},i?.connectOptions).then(async()=>{let a=await this.getServices(t.deviceId);for(let o in i?.services){let c=a.find(l=>{if(l.uuid===o)return!0});if(c)for(let l in i.services[o]){if(!c.characteristics.find(w=>{if(w.uuid===l)return!0}))continue;let h=i.services[o][l];h.write&&await this.write(t,o,l,h.write,h.writeCallback,h.writeOptions),h.read&&await this.read(t,o,l,h.readCallback,h.readOptions),h.notify&&h.notifyCallback&&(await this.subscribe(t,o,l,h.notifyCallback),h.notifying=!0)}}}).catch(s),n(this.devices[t.deviceId])});this.triangulate=(t,i=1500,n=60)=>new Promise((s,a)=>{if("Accelerometer"in globalThis){if(typeof globalThis.Accelerometer=="function"){let o=new globalThis.Accelerometer({frequency:n}),c=performance.now(),l=c,h={samples:[],vector:{}},w=()=>{if(l-c<i)this.readRssi(t).then(d=>{let f=o.x,y=o.y,D=o.z;l=performance.now(),h.samples.push({x:f,y,z:D,rssi:d,timestamp:l})});else{let d={x:0,y:0,z:0,rssiAvg:0};h.samples.forEach(f=>{}),o.removeEventListener("reading",w)}};o.addEventListener("reading",w)}}else a(new Error("No Accelerometer API detected"))});i&&(this.location=i),t&&this.setup(t)}setup(t,i=this.location){let n=[];if(t)for(let a in t.services)n.push(a);let s={};return i||(s.androidNeverForLocation=!1),new Promise(async(a,o)=>{if(this.initialized||(await this.client.initialize(s),this.initialized=!0),t?.deviceId)this.reconnect(t.deviceId).then(c=>{a(this.setupDevice(c,t))}).catch(o);else if(t){let c={filters:[{services:n}],optionalServices:n};t?.namePrefix&&c.filters.push({namePrefix:t.namePrefix}),this.client.requestDevice(c).then(l=>{a(this.setupDevice(l,t))}).catch(o)}else this.client.requestDevice().then(c=>{a(this.setupDevice(c,t))}).catch(o)})}initialize(t){return new Promise((i,n)=>{this.client.initialize(t).then(()=>{i(!0)}).catch(n)})}requestDevice(t,i){return new Promise((n,s)=>{this.client.requestDevice(t).then(a=>{this.devices[a.deviceId]={device:a,deviceId:a.deviceId,...i},n(a)}).catch(s)})}getServices(t){return this.client.getServices(t)}connect(t,i){return new Promise((n,s)=>{this.client.connect(t.deviceId,a=>{i?.ondisconnect&&i.ondisconnect(a)},i?.connectOptions).then(a=>{n(t)}).catch(s)})}reconnect(t){return new Promise((i,n)=>{this.client.getDevices([t]).then(s=>{i(s[0])}).catch(n)})}disconnect(t){return typeof t=="object"&&(t=t.deviceId),delete this.devices[t],this.client.disconnect(t)}write(t,i,n,s,a,o){return typeof t=="object"&&(t=t.deviceId),a?this.client.write(t,i,n,S.toDataView(s)).then(a):this.client.writeWithoutResponse(t,i,n,S.toDataView(s),o)}read(t,i,n,s,a){return typeof t=="object"&&(t=t.deviceId),s?this.client.read(t,i,n,a).then(s):this.client.read(t,i,n,a)}subscribe(t,i,n,s){return typeof t=="object"&&(t=t.deviceId),this.client.startNotifications(t,i,n,s)}unsubscribe(t,i,n){return typeof t=="object"&&(t=t.deviceId),this.client.stopNotifications(t,i,n)}scan(t,i){return this.client.requestLEScan(t,i)}stopScanning(){return this.client.stopLEScan()}readDescriptor(t,i,n,s,a){return this.client.readDescriptor(t.deviceId,i,n,s,a)}writeDescriptor(t,i,n,s,a,o){return this.client.writeDescriptor(t.deviceId,i,n,s,S.toDataView(a),o)}readRssi(t){return this.client.readRssi(t.deviceId)}async distance(t,i,n,s,a){let o=await this.readRssi(t);if(o==0)return;let c=o/i;return c<1?Math.pow(c,10):n*Math.pow(c,s)+a}async distanceFromPhone(t,i,n){let s,a,o;return n&&(n==="nexus5"?(s=.42093,a=6.9476,o=.54992):n==="motoX"?(s=.9401940951,a=6.170094565,o=0):n==="iphone5"&&(s=.89976,a=7.7095,o=.111)),await this.distance(t,i,s,a,o)}};["BLEClient"].forEach(r=>{K[r]&&(globalThis[r]=K[r])});})();
/*! Capacitor: https://capacitorjs.com/ - MIT License */
