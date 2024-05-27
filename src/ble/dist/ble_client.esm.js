var Le=Object.defineProperty;var R=(s,e)=>()=>(s&&(e=s(s=0)),e);var Pe=(s,e)=>{for(var t in e)Le(s,t,{get:e[t],enumerable:!0})};var Se,Ue,ue,Je,Xe,B,U,Te,qe,_e,O,M,Ze,F,ce,le,X,et,Re,Ve,Ne,Me,Z,tt,j=R(()=>{Se=s=>{let e=new Map;e.set("web",{name:"web"});let t=s.CapacitorPlatforms||{currentPlatform:{name:"web"},platforms:e},i=(r,a)=>{t.platforms.set(r,a)},n=r=>{t.platforms.has(r)&&(t.currentPlatform=t.platforms.get(r))};return t.addPlatform=i,t.setPlatform=n,t},Ue=s=>s.CapacitorPlatforms=Se(s),ue=Ue(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Je=ue.addPlatform,Xe=ue.setPlatform;(function(s){s.Unimplemented="UNIMPLEMENTED",s.Unavailable="UNAVAILABLE"})(B||(B={}));U=class extends Error{constructor(e,t,i){super(e),this.message=e,this.code=t,this.data=i}},Te=s=>{var e,t;return s?.androidBridge?"android":!((t=(e=s?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},qe=s=>{var e,t,i,n,r;let a=s.CapacitorCustomPlatform||null,o=s.Capacitor||{},l=o.Plugins=o.Plugins||{},c=s.CapacitorPlatforms,u=()=>a!==null?a.name:Te(s),v=((e=c?.currentPlatform)===null||e===void 0?void 0:e.getPlatform)||u,d=()=>v()!=="web",f=((t=c?.currentPlatform)===null||t===void 0?void 0:t.isNativePlatform)||d,w=m=>{let p=G.get(m);return!!(p?.platforms.has(v())||T(m))},g=((i=c?.currentPlatform)===null||i===void 0?void 0:i.isPluginAvailable)||w,H=m=>{var p;return(p=o.PluginHeaders)===null||p===void 0?void 0:p.find(C=>C.name===m)},T=((n=c?.currentPlatform)===null||n===void 0?void 0:n.getPluginHeader)||H,be=m=>s.console.error(m),pe=(m,p,C)=>Promise.reject(`${C} does not have an implementation of "${p}".`),G=new Map,ye=(m,p={})=>{let C=G.get(m);if(C)return console.warn(`Capacitor plugin "${m}" already registered. Cannot register plugins twice.`),C.proxy;let I=v(),k=T(m),E,xe=async()=>(!E&&I in p?E=typeof p[I]=="function"?E=await p[I]():E=p[I]:a!==null&&!E&&"web"in p&&(E=typeof p.web=="function"?E=await p.web():E=p.web),E),Ae=(y,D)=>{var A,L;if(k){let P=k?.methods.find(x=>D===x.name);if(P)return P.rtype==="promise"?x=>o.nativePromise(m,D.toString(),x):(x,q)=>o.nativeCallback(m,D.toString(),x,q);if(y)return(A=y[D])===null||A===void 0?void 0:A.bind(y)}else{if(y)return(L=y[D])===null||L===void 0?void 0:L.bind(y);throw new U(`"${m}" plugin is not implemented on ${I}`,B.Unimplemented)}},Y=y=>{let D,A=(...L)=>{let P=xe().then(x=>{let q=Ae(x,y);if(q){let _=q(...L);return D=_?.remove,_}else throw new U(`"${m}.${y}()" is not implemented on ${I}`,B.Unimplemented)});return y==="addListener"&&(P.remove=async()=>D()),P};return A.toString=()=>`${y.toString()}() { [capacitor code] }`,Object.defineProperty(A,"name",{value:y,writable:!1,configurable:!1}),A},ne=Y("addListener"),re=Y("removeListener"),Ee=(y,D)=>{let A=ne({eventName:y},D),L=async()=>{let x=await A;re({eventName:y,callbackId:x},D)},P=new Promise(x=>A.then(()=>x({remove:L})));return P.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await L()},P},K=new Proxy({},{get(y,D){switch(D){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return k?Ee:ne;case"removeListener":return re;default:return Y(D)}}});return l[m]=K,G.set(m,{name:m,proxy:K,platforms:new Set([...Object.keys(p),...k?[I]:[]])}),K},De=((r=c?.currentPlatform)===null||r===void 0?void 0:r.registerPlugin)||ye;return o.convertFileSrc||(o.convertFileSrc=m=>m),o.getPlatform=v,o.handleError=be,o.isNativePlatform=f,o.isPluginAvailable=g,o.pluginMethodNoop=pe,o.registerPlugin=De,o.Exception=U,o.DEBUG=!!o.DEBUG,o.isLoggingEnabled=!!o.isLoggingEnabled,o.platform=o.getPlatform(),o.isNative=o.isNativePlatform(),o},_e=s=>s.Capacitor=qe(s),O=_e(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),M=O.registerPlugin,Ze=O.Plugins,F=class{constructor(e){this.listeners={},this.retainedEventArguments={},this.windowListeners={},e&&(console.warn(`Capacitor WebPlugin "${e.name}" config object was deprecated in v3 and will be removed in v4.`),this.config=e)}addListener(e,t){let i=!1;this.listeners[e]||(this.listeners[e]=[],i=!0),this.listeners[e].push(t);let r=this.windowListeners[e];r&&!r.registered&&this.addWindowListener(r),i&&this.sendRetainedArgumentsForEvent(e);let a=async()=>this.removeListener(e,t);return Promise.resolve({remove:a})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,i){let n=this.listeners[e];if(!n){if(i){let r=this.retainedEventArguments[e];r||(r=[]),r.push(t),this.retainedEventArguments[e]=r}return}n.forEach(r=>r(t))}hasListeners(e){return!!this.listeners[e].length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:i=>{this.notifyListeners(t,i)}}}unimplemented(e="not implemented"){return new O.Exception(e,B.Unimplemented)}unavailable(e="not available"){return new O.Exception(e,B.Unavailable)}async removeListener(e,t){let i=this.listeners[e];if(!i)return;let n=i.indexOf(t);this.listeners[e].splice(n,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(i=>{this.notifyListeners(e,i)}))}},ce=s=>encodeURIComponent(s).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),le=s=>s.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),X=class extends F{async getCookies(){let e=document.cookie,t={};return e.split(";").forEach(i=>{if(i.length<=0)return;let[n,r]=i.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");n=le(n).trim(),r=le(r).trim(),t[n]=r}),t}async setCookie(e){try{let t=ce(e.key),i=ce(e.value),n=`; expires=${(e.expires||"").replace("expires=","")}`,r=(e.path||"/").replace("path=",""),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${i||""}${n}; path=${r}; ${a};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},et=M("CapacitorCookies",{web:()=>new X}),Re=async s=>new Promise((e,t)=>{let i=new FileReader;i.onload=()=>{let n=i.result;e(n.indexOf(",")>=0?n.split(",")[1]:n)},i.onerror=n=>t(n),i.readAsDataURL(s)}),Ve=(s={})=>{let e=Object.keys(s);return Object.keys(s).map(n=>n.toLocaleLowerCase()).reduce((n,r,a)=>(n[r]=s[e[a]],n),{})},Ne=(s,e=!0)=>s?Object.entries(s).reduce((i,n)=>{let[r,a]=n,o,l;return Array.isArray(a)?(l="",a.forEach(c=>{o=e?encodeURIComponent(c):c,l+=`${r}=${o}&`}),l.slice(0,-1)):(o=e?encodeURIComponent(a):a,l=`${r}=${o}`),`${i}&${l}`},"").substr(1):null,Me=(s,e={})=>{let t=Object.assign({method:s.method||"GET",headers:s.headers},e),n=Ve(s.headers)["content-type"]||"";if(typeof s.data=="string")t.body=s.data;else if(n.includes("application/x-www-form-urlencoded")){let r=new URLSearchParams;for(let[a,o]of Object.entries(s.data||{}))r.set(a,o);t.body=r.toString()}else if(n.includes("multipart/form-data")||s.data instanceof FormData){let r=new FormData;if(s.data instanceof FormData)s.data.forEach((o,l)=>{r.append(l,o)});else for(let o of Object.keys(s.data))r.append(o,s.data[o]);t.body=r;let a=new Headers(t.headers);a.delete("content-type"),t.headers=a}else(n.includes("application/json")||typeof s.data=="object")&&(t.body=JSON.stringify(s.data));return t},Z=class extends F{async request(e){let t=Me(e,e.webFetchExtra),i=Ne(e.params,e.shouldEncodeUrlParams),n=i?`${e.url}?${i}`:e.url,r=await fetch(n,t),a=r.headers.get("content-type")||"",{responseType:o="text"}=r.ok?e:{};a.includes("application/json")&&(o="json");let l,c;switch(o){case"arraybuffer":case"blob":c=await r.blob(),l=await Re(c);break;case"json":l=await r.json();break;case"document":case"text":default:l=await r.text()}let u={};return r.headers.forEach((v,d)=>{u[d]=v}),{data:l,headers:u,status:r.status,url:r.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}},tt=M("CapacitorHttp",{web:()=>new Z})});function je(s){return new DataView(Uint8Array.from(s).buffer)}function $e(s){return Array.from(new Uint8Array(s.buffer,s.byteOffset,s.byteLength))}function We(s){return`0000${s.toString(16).padStart(4,"0")}-0000-1000-8000-00805f9b34fb`}function S(s){let e=s.trim().split(" ").filter(t=>t!=="").map(t=>parseInt(t,16));return je(e)}function $(s){return $e(s).map(e=>{let t=e.toString(16);return t.length==1&&(t="0"+t),t}).join(" ")}function de(s){if(typeof s=="string")return s;if(typeof s=="number")return We(s);throw new Error("Invalid UUID")}function ee(s){let e={};if(s)return s.forEach((t,i)=>{e[i.toString()]=t}),e}var W=R(()=>{});async function fe(s,e,t){let i;return Promise.race([s,new Promise((n,r)=>{i=setTimeout(()=>r(t),e)})]).finally(()=>clearTimeout(i))}var he=R(()=>{});var ve={};Pe(ve,{BluetoothLeWeb:()=>te});var te,we=R(()=>{j();W();he();te=class extends F{constructor(){super(...arguments),this.deviceMap=new Map,this.discoveredDevices=new Map,this.scan=null,this.DEFAULT_CONNECTION_TIMEOUT=1e4,this.onAdvertisementReceivedCallback=this.onAdvertisementReceived.bind(this),this.onDisconnectedCallback=this.onDisconnected.bind(this),this.onCharacteristicValueChangedCallback=this.onCharacteristicValueChanged.bind(this)}async initialize(){if(typeof navigator>"u"||!navigator.bluetooth)throw this.unavailable("Web Bluetooth API not available in this browser.");if(!await navigator.bluetooth.getAvailability())throw this.unavailable("No Bluetooth radio available.")}async isEnabled(){return{value:!0}}async requestEnable(){throw this.unavailable("requestEnable is not available on web.")}async enable(){throw this.unavailable("enable is not available on web.")}async disable(){throw this.unavailable("disable is not available on web.")}async startEnabledNotifications(){}async stopEnabledNotifications(){}async isLocationEnabled(){throw this.unavailable("isLocationEnabled is not available on web.")}async openLocationSettings(){throw this.unavailable("openLocationSettings is not available on web.")}async openBluetoothSettings(){throw this.unavailable("openBluetoothSettings is not available on web.")}async openAppSettings(){throw this.unavailable("openAppSettings is not available on web.")}async setDisplayStrings(){}async requestDevice(e){let t=this.getFilters(e),i=await navigator.bluetooth.requestDevice({filters:t.length?t:void 0,optionalServices:e?.optionalServices,acceptAllDevices:t.length===0});return this.deviceMap.set(i.id,i),this.getBleDevice(i)}async requestLEScan(e){this.requestBleDeviceOptions=e;let t=this.getFilters(e);await this.stopLEScan(),this.discoveredDevices=new Map,navigator.bluetooth.removeEventListener("advertisementreceived",this.onAdvertisementReceivedCallback),navigator.bluetooth.addEventListener("advertisementreceived",this.onAdvertisementReceivedCallback),this.scan=await navigator.bluetooth.requestLEScan({filters:t.length?t:void 0,acceptAllAdvertisements:t.length===0,keepRepeatedDevices:e?.allowDuplicates})}onAdvertisementReceived(e){var t,i;let n=e.device.id;if(this.deviceMap.set(n,e.device),!this.discoveredDevices.has(n)||!((t=this.requestBleDeviceOptions)===null||t===void 0)&&t.allowDuplicates){this.discoveredDevices.set(n,!0);let a=this.getBleDevice(e.device),o={device:a,localName:a.name,rssi:e.rssi,txPower:e.txPower,manufacturerData:ee(e.manufacturerData),serviceData:ee(e.serviceData),uuids:(i=e.uuids)===null||i===void 0?void 0:i.map(de)};this.notifyListeners("onScanResult",o)}}async stopLEScan(){var e;!((e=this.scan)===null||e===void 0)&&e.active&&this.scan.stop(),this.scan=null}async getDevices(e){return{devices:(await navigator.bluetooth.getDevices()).filter(n=>e.deviceIds.includes(n.id)).map(n=>(this.deviceMap.set(n.id,n),this.getBleDevice(n)))}}async getConnectedDevices(e){return{devices:(await navigator.bluetooth.getDevices()).filter(n=>{var r;return(r=n.gatt)===null||r===void 0?void 0:r.connected}).map(n=>(this.deviceMap.set(n.id,n),this.getBleDevice(n)))}}async connect(e){var t,i;let n=this.getDeviceFromMap(e.deviceId);n.removeEventListener("gattserverdisconnected",this.onDisconnectedCallback),n.addEventListener("gattserverdisconnected",this.onDisconnectedCallback);let r=Symbol();if(n.gatt===void 0)throw new Error("No gatt server available.");try{let a=(t=e.timeout)!==null&&t!==void 0?t:this.DEFAULT_CONNECTION_TIMEOUT;await fe(n.gatt.connect(),a,r)}catch(a){throw await((i=n.gatt)===null||i===void 0?void 0:i.disconnect()),a===r?new Error("Connection timeout"):a}}onDisconnected(e){let i=`disconnected|${e.target.id}`;this.notifyListeners(i,null)}async createBond(e){throw this.unavailable("createBond is not available on web.")}async isBonded(e){throw this.unavailable("isBonded is not available on web.")}async disconnect(e){var t;(t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0||t.disconnect()}async getServices(e){var t,i;let n=(i=await((t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0?void 0:t.getPrimaryServices()))!==null&&i!==void 0?i:[],r=[];for(let a of n){let o=await a.getCharacteristics(),l=[];for(let c of o)l.push({uuid:c.uuid,properties:this.getProperties(c),descriptors:await this.getDescriptors(c)});r.push({uuid:a.uuid,characteristics:l})}return{services:r}}async getDescriptors(e){try{return(await e.getDescriptors()).map(i=>({uuid:i.uuid}))}catch{return[]}}getProperties(e){return{broadcast:e.properties.broadcast,read:e.properties.read,writeWithoutResponse:e.properties.writeWithoutResponse,write:e.properties.write,notify:e.properties.notify,indicate:e.properties.indicate,authenticatedSignedWrites:e.properties.authenticatedSignedWrites,reliableWrite:e.properties.reliableWrite,writableAuxiliaries:e.properties.writableAuxiliaries}}async getCharacteristic(e){var t;let i=await((t=this.getDeviceFromMap(e.deviceId).gatt)===null||t===void 0?void 0:t.getPrimaryService(e?.service));return i?.getCharacteristic(e?.characteristic)}async getDescriptor(e){let t=await this.getCharacteristic(e);return t?.getDescriptor(e?.descriptor)}async discoverServices(e){throw this.unavailable("discoverServices is not available on web.")}async getMtu(e){throw this.unavailable("getMtu is not available on web.")}async requestConnectionPriority(e){throw this.unavailable("requestConnectionPriority is not available on web.")}async readRssi(e){throw this.unavailable("readRssi is not available on web.")}async read(e){let t=await this.getCharacteristic(e);return{value:await t?.readValue()}}async write(e){let t=await this.getCharacteristic(e),i;typeof e.value=="string"?i=S(e.value):i=e.value,await t?.writeValueWithResponse(i)}async writeWithoutResponse(e){let t=await this.getCharacteristic(e),i;typeof e.value=="string"?i=S(e.value):i=e.value,await t?.writeValueWithoutResponse(i)}async readDescriptor(e){let t=await this.getDescriptor(e);return{value:await t?.readValue()}}async writeDescriptor(e){let t=await this.getDescriptor(e),i;typeof e.value=="string"?i=S(e.value):i=e.value,await t?.writeValue(i)}async startNotifications(e){let t=await this.getCharacteristic(e);t?.removeEventListener("characteristicvaluechanged",this.onCharacteristicValueChangedCallback),t?.addEventListener("characteristicvaluechanged",this.onCharacteristicValueChangedCallback),await t?.startNotifications()}onCharacteristicValueChanged(e){var t,i;let n=e.target,r=`notification|${(t=n.service)===null||t===void 0?void 0:t.device.id}|${(i=n.service)===null||i===void 0?void 0:i.uuid}|${n.uuid}`;this.notifyListeners(r,{value:n.value})}async stopNotifications(e){let t=await this.getCharacteristic(e);await t?.stopNotifications()}getFilters(e){var t;let i=[];for(let n of(t=e?.services)!==null&&t!==void 0?t:[])i.push({services:[n],name:e?.name,namePrefix:e?.namePrefix});return(e?.name||e?.namePrefix)&&i.length===0&&i.push({name:e.name,namePrefix:e.namePrefix}),i}getDeviceFromMap(e){let t=this.deviceMap.get(e);if(t===void 0)throw new Error('Device not found. Call "requestDevice", "requestLEScan" or "getDevices" first.');return t}getBleDevice(e){var t;return{deviceId:e.id,name:(t=e.name)!==null&&t!==void 0?t:void 0}}}});var V=class s{constructor(){this.recursivelyAssign=(e,t)=>{for(let i in t)typeof t[i]=="object"?typeof e[i]=="object"?this.recursivelyAssign(e[i],t[i]):e[i]=this.recursivelyAssign({},t[i]):e[i]=t[i];return e}}static autoscale(e,t=0,i=1,n=!1,r,a,o){if(e?.length===0)return e;let l=a||Math.max(...e),c=r||Math.min(...e),u=1/i,v=1;if(n){let d=Math.max(Math.abs(c),Math.abs(l));return d!==0&&(v=u/d),e.map(f=>(o&&(f<c&&(f=c),f>l&&(f=l)),f*v+(u*(t+1)*2-1-u)))}else return l===c?l!==0?v=u/l:c!==0&&(v=u/Math.abs(c)):v=u/(l-c),e.map(d=>(o&&(d<c&&(d=c),d>l&&(d=l)),2*((d-c)*v-1/(2*i))+(u*(t+1)*2-1-u)))}static genTimestamps(e,t){let i=Date.now(),n=[i-e*1e3/t,i];return s.upsample(n,e)}static absmax(e){return Math.max(Math.abs(Math.min(...e)),Math.max(...e))}static downsample(e,t,i=1){if(e.length>t){let n=new Array(t),r=e.length/t,a=e.length-1,o=0,l=0;for(let c=r;c<e.length;c+=r){let u=Math.round(c);u>a&&(u=a);for(let v=o;v<u;v++)n[l]+=e[v];n[l]/=(u-o)*i,l++,o=u}return n}else return e}static upsample(e,t,i=1){var n=function(d,f,w){return(d+(f-d)*w)*i},r=new Array(t),a=(e.length-1)/(t-1);r[0]=e[0];for(var o=1;o<t-1;o++){var l=o*a,c=Math.floor(l),u=Math.ceil(l),v=l-c;r[o]=n(e[c],e[u],v)}return r[t-1]=e[e.length-1],r}static interpolate(e,t,i=1){return e.length>t?s.downsample(e,t,i):e.length<t?s.upsample(e,t,i):e}static HSLToRGB(e,t,i,n=255){t/=100,i/=100;let r=(1-Math.abs(2*i-1))*t,a=r*(1-Math.abs(e/60%2-1)),o=i-r/2,l=0,c=0,u=0;return 0<=e&&e<60?(l=r,c=a,u=0):60<=e&&e<120?(l=a,c=r,u=0):120<=e&&e<180?(l=0,c=r,u=a):180<=e&&e<240?(l=0,c=a,u=r):240<=e&&e<300?(l=a,c=0,u=r):300<=e&&e<360&&(l=r,c=0,u=a),l=(l+o)*n,c=(c+o)*n,u=(u+o)*n,[l,c,u]}static circularBuffer(e,t){if(t.length<e.length){let i=e.slice(t.length),n=e.length;e.splice(0,n,...i,...t)}else if(t.length>e.length){let i=e.length;e.splice(0,i,t.slice(i-t.length))}else e.splice(0,e.length,...t);return e}static reformatData(e,t){if(Array.isArray(e)){if(Array.isArray(e[0])){let i={};if(e.forEach((n,r)=>{i[r]=n}),e=i,isNaN(e[0][0]))return}else if(t){if(e={[t]:e},isNaN(e[t][0]))return}else if(e={0:e},isNaN(e[0][0]))return}else if(typeof e=="object"){for(let i in e)if(typeof e[i]=="number"?e[i]=[e[i]]:e[i]?.values&&typeof e[i].values=="number"&&(e[i].values=[e[i].values]),isNaN(e[i][0]))return}else if(typeof e=="string"){let i;if(e.includes(`\r
`)){let n=e.split(`\r
`);e={},n.forEach((r,a)=>{r.includes("	")?i=r.split("	"):r.includes(",")?i=r.split(","):r.includes("|")&&(i=r.split("|")),Array.isArray(i)&&i.forEach((o,l)=>{if(o.includes(":")){let[c,u]=o.split(":"),v=parseFloat(u);if(v)e[c]=[v];else return}else{let c=parseFloat(o);if(c)e[l]=[c];else return}})})}else e.includes("	")?i=e.split("	"):e.includes(",")?i=e.split(","):e.includes("|")&&(i=e.split("|"));e={},Array.isArray(i)&&i.forEach((n,r)=>{if(n.includes(":")){let[a,o]=n.split(":"),l=parseFloat(o);if(l)e[a]=[l];else return}else{let a=parseFloat(n);if(a)e[r]=[a];else return}})}else typeof e=="number"&&(t?e={[t]:[e]}:e={0:[e]});return e}static padTime(e,t,i,n){let r=(e[0]-t)/i/n;return[...new Array(n-e.length).map((o,l)=>t+r*(l+1)),...e]}static interpolateForTime(e,t,i){return s.interpolate(e,Math.ceil(i*t))}static{this.bufferValues=(e,t,i,n)=>{if(!Array.isArray(i)&&typeof i=="object"&&(i=Object.keys(i)),!n){let a=Object.keys(e);i?n=new Float32Array(a.length*i.length):typeof e[a[0]][t]=="object"?(i=Object.keys(e[a[0]][t]),n=new Float32Array(a.length*i.length)):n=new Float32Array(a.length)}let r=0;for(let a in e)if(e[a][t])if(i)for(let o=0;o<i.length;o++)n[r]=e[a][t][i[o]],r++;else n[r]=e[a][t],r++;return n}}isTypedArray(e){return ArrayBuffer.isView(e)&&Object.prototype.toString.call(e)!=="[object DataView]"}spliceTypedArray(e,t,i){let n=e.subarray(0,t),r;i&&(r=e.subarray(i+1));let a;return(n.length>0||r?.length>0)&&(a=new e.constructor(n.length+r.length)),n.length>0&&a.set(n),r&&r.length>0&&a.set(r,n.length),a}};var Oe=/^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/,Ie=/([1-9]\d*)?([xcbB?hHiIfdsp])/g,Q=(s,e,t)=>String.fromCharCode(...new Uint8Array(s.buffer,s.byteOffset+e,t)),J=(s,e,t,i)=>new Uint8Array(s.buffer,s.byteOffset+e,t).set(i.split("").map(n=>n.charCodeAt(0))),Ce=(s,e,t)=>Q(s,e+1,Math.min(s.getUint8(e),t-1)),ke=(s,e,t,i)=>{s.setUint8(e,i.length),J(s,e+1,t-1,i)},Be=s=>({x:e=>[1,e,0],c:e=>[e,1,t=>({u:i=>Q(i,t,1),p:(i,n)=>J(i,t,1,n)})],"?":e=>[e,1,t=>({u:i=>!!i.getUint8(t),p:(i,n)=>i.setUint8(t,n)})],b:e=>[e,1,t=>({u:i=>i.getInt8(t),p:(i,n)=>i.setInt8(t,n)})],B:e=>[e,1,t=>({u:i=>i.getUint8(t),p:(i,n)=>i.setUint8(t,n)})],h:e=>[e,2,t=>({u:i=>i.getInt16(t,s),p:(i,n)=>i.setInt16(t,n,s)})],H:e=>[e,2,t=>({u:i=>i.getUint16(t,s),p:(i,n)=>i.setUint16(t,n,s)})],i:e=>[e,4,t=>({u:i=>i.getInt32(t,s),p:(i,n)=>i.setInt32(t,n,s)})],I:e=>[e,4,t=>({u:i=>i.getUint32(t,s),p:(i,n)=>i.setUint32(t,n,s)})],f:e=>[e,4,t=>({u:i=>i.getFloat32(t,s),p:(i,n)=>i.setFloat32(t,n,s)})],d:e=>[e,8,t=>({u:i=>i.getFloat64(t,s),p:(i,n)=>i.setFloat64(t,n,s)})],s:e=>[1,e,t=>({u:i=>Q(i,t,e),p:(i,n)=>J(i,t,e,n.slice(0,e))})],p:e=>[1,e,t=>({u:i=>Ce(i,t,e),p:(i,n)=>ke(i,t,e,n.slice(0,e-1))})]}),se=new RangeError("Structure larger than remaining buffer"),Fe=new RangeError("Not enough values for structure"),N=class s extends V{static{this.codes={"\\n":10,"\\r":13,"\\t":9,"\\s":32,"\\b":8,"\\f":12,"\\":92}}static toDataView(e){if(!(e instanceof DataView))if(typeof e=="string"&&parseInt(e)&&(e=parseInt(e)),typeof e=="string"){let t=new TextEncoder,i={};for(let r in s.codes)for(;e.indexOf(r)>-1;){let a=e.indexOf(r);e=e.replace(r,""),i[a]=r}let n=Array.from(t.encode(e));for(let r in i)n.splice(parseInt(r),0,s.codes[i[r]]);e=new DataView(new Uint8Array(n).buffer)}else if(typeof e=="number"){let t=e;e<256?(e=new DataView(new ArrayBuffer(1)),e.setUint8(0,t)):e<65536?(e=new DataView(new ArrayBuffer(2)),e.setInt16(0,t)):(e=new DataView(new ArrayBuffer(4)),e.setUint32(0,t))}else e instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&e instanceof SharedArrayBuffer?e=new DataView(e):Array.isArray(e)?e=new DataView(Uint8Array.from(e).buffer):typeof e=="object"&&(e=new TextEncoder().encode(JSON.stringify(e)));return e}static searchBuffer(e,t,i){for(var n=t,r=e,a=s.boyerMoore(n),o=a.byteLength,l=[],c=a(r);c!==-1&&(l.push(c),!(i&&l.length>=i));c=a(r,c+o));return l}static bytesToInt16(e,t){let i=(255&e)<<8|255&t;return(i&32768)>0?i|=4294901760:i&=65535,i}static bytesToUInt16(e,t){return e*256+t}static Uint16ToBytes(e){return[e&255,e>>8&255]}static bytesToInt24(e,t,i){let n=(255&e)<<16|(255&t)<<8|255&i;return(n&8388608)>0?n|=4278190080:n&=16777215,n}static bytesToUInt24(e,t,i){return e*65536+t*256+i}static Uint24ToBytes(e){return[e&255,e>>8&255,e>>16&255]}static bytesToInt32(e,t,i,n){let r=(255&e)<<24|(255&t)<<16|(255&i)<<8|255&n;return(r&2147483648)>0?r|=0:r&=4294967295,r}static bytesToUInt32(e,t,i,n){return e*16777216+t*65536+i*256+n}static Uint32ToBytes(e){return[e&255,e>>8&255,e>>16&255,e>>24&255]}static get2sCompliment(e,t){return e>4294967296?null:e<<32-t>>32-t}static getSignedInt(...e){let t=0;function i(n){for(var r=0,a=!0;n--;)if(a){let o=e[t++];r+=o&127,o&128&&(r-=128),a=!1}else r*=256,r+=e[t++];return r}return i(e.length)}static asUint8Array(e){if(e instanceof Uint8Array)return e;if(typeof e=="string"){for(var t=new Uint8Array(e.length),i=0;i<e.length;i++){var n=e.charCodeAt(i);if(n>127)throw new TypeError("Only ASCII patterns are supported");t[i]=n}return t}else return new Uint8Array(e)}static boyerMoore(e){let t=new Uint8Array(e),i=t.length;if(i===0)throw new TypeError("patternBuffer must be at least 1 byte long");let n=256,r=new Int32Array(n).fill(-1);for(let o=0;o<i;o++)r[t[o]]=o;let a=(o,l=0,c=o.byteLength)=>{let u=o instanceof Uint8Array?o:new Uint8Array(o),v=c-i,d=i-1;for(let f=l;f<=v;){let w=0;for(let g=d;g>=0;g--)if(t[g]!==u[f+g]){w=Math.max(1,g-r[u[f+g]]);break}if(w===0)return f;f+=w}return-1};return a.byteLength=i,a}static struct(e){let t=[],i=0,n=Oe.exec(e);if(!n)throw new RangeError("Invalid format string");let r=Be(n[1]==="<"),a=(d,f)=>r[f](d?parseInt(d,10):1);for(;n=Ie.exec(e);)((d,f,w)=>{for(let g=0;g<d;++g,i+=f)w&&t.push(w(i))})(...a(...n.slice(1)));let o=(d,f)=>{if(d.byteLength<(f|0)+i)throw se;let w=new DataView(d,f|0);return t.map(g=>g.u(w))},l=(d,f,...w)=>{if(w.length<t.length)throw Fe;if(d.byteLength<f+i)throw se;let g=new DataView(d,f);new Uint8Array(d,f,i).fill(0),t.forEach((H,T)=>H.p(g,w[T]))},c=(...d)=>{let f=new ArrayBuffer(i);return l(f,0,...d),f},u=d=>o(d,0);function*v(d){for(let f=0;f+i<=d.byteLength;f+=i)yield o(d,f)}return Object.freeze({unpack:u,pack:c,unpack_from:o,pack_into:l,iter_unpack:v,format:e,size:i})}};var ae;(function(s){s[s.SCAN_MODE_LOW_POWER=0]="SCAN_MODE_LOW_POWER",s[s.SCAN_MODE_BALANCED=1]="SCAN_MODE_BALANCED",s[s.SCAN_MODE_LOW_LATENCY=2]="SCAN_MODE_LOW_LATENCY"})(ae||(ae={}));var oe;(function(s){s[s.CONNECTION_PRIORITY_BALANCED=0]="CONNECTION_PRIORITY_BALANCED",s[s.CONNECTION_PRIORITY_HIGH=1]="CONNECTION_PRIORITY_HIGH",s[s.CONNECTION_PRIORITY_LOW_POWER=2]="CONNECTION_PRIORITY_LOW_POWER"})(oe||(oe={}));j();W();j();var h=M("BluetoothLe",{web:()=>Promise.resolve().then(()=>(we(),ve)).then(s=>new s.BluetoothLeWeb)});var ze=()=>{let s=Promise.resolve();return e=>new Promise((t,i)=>{s=s.then(()=>e()).then(t).catch(i)})};function z(s){return s?ze():e=>e()}function b(s){if(typeof s!="string")throw new Error(`Invalid UUID type ${typeof s}. Expected string.`);if(s=s.toLowerCase(),!(s.search(/^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/)>=0))throw new Error(`Invalid UUID format ${s}. Expected 128 bit string (e.g. "0000180d-0000-1000-8000-00805f9b34fb").`);return s}var ie=class{constructor(){this.scanListener=null,this.eventListeners=new Map,this.queue=z(!0)}enableQueue(){this.queue=z(!0)}disableQueue(){this.queue=z(!1)}async initialize(e){await this.queue(async()=>{await h.initialize(e)})}async isEnabled(){return await this.queue(async()=>(await h.isEnabled()).value)}async requestEnable(){await this.queue(async()=>{await h.requestEnable()})}async enable(){await this.queue(async()=>{await h.enable()})}async disable(){await this.queue(async()=>{await h.disable()})}async startEnabledNotifications(e){await this.queue(async()=>{var t;let i="onEnabledChanged";await((t=this.eventListeners.get(i))===null||t===void 0?void 0:t.remove());let n=await h.addListener(i,r=>{e(r.value)});this.eventListeners.set(i,n),await h.startEnabledNotifications()})}async stopEnabledNotifications(){await this.queue(async()=>{var e;let t="onEnabledChanged";await((e=this.eventListeners.get(t))===null||e===void 0?void 0:e.remove()),this.eventListeners.delete(t),await h.stopEnabledNotifications()})}async isLocationEnabled(){return await this.queue(async()=>(await h.isLocationEnabled()).value)}async openLocationSettings(){await this.queue(async()=>{await h.openLocationSettings()})}async openBluetoothSettings(){await this.queue(async()=>{await h.openBluetoothSettings()})}async openAppSettings(){await this.queue(async()=>{await h.openAppSettings()})}async setDisplayStrings(e){await this.queue(async()=>{await h.setDisplayStrings(e)})}async requestDevice(e){return e=e?this.validateRequestBleDeviceOptions(e):void 0,await this.queue(async()=>await h.requestDevice(e))}async requestLEScan(e,t){e=this.validateRequestBleDeviceOptions(e),await this.queue(async()=>{var i;await((i=this.scanListener)===null||i===void 0?void 0:i.remove()),this.scanListener=await h.addListener("onScanResult",n=>{let r=Object.assign(Object.assign({},n),{manufacturerData:this.convertObject(n.manufacturerData),serviceData:this.convertObject(n.serviceData),rawAdvertisement:n.rawAdvertisement?this.convertValue(n.rawAdvertisement):void 0});t(r)}),await h.requestLEScan(e)})}async stopLEScan(){await this.queue(async()=>{var e;await((e=this.scanListener)===null||e===void 0?void 0:e.remove()),this.scanListener=null,await h.stopLEScan()})}async getDevices(e){if(!Array.isArray(e))throw new Error("deviceIds must be an array");return this.queue(async()=>(await h.getDevices({deviceIds:e})).devices)}async getConnectedDevices(e){if(!Array.isArray(e))throw new Error("services must be an array");return e=e.map(b),this.queue(async()=>(await h.getConnectedDevices({services:e})).devices)}async connect(e,t,i){await this.queue(async()=>{var n;if(t){let r=`disconnected|${e}`;await((n=this.eventListeners.get(r))===null||n===void 0?void 0:n.remove());let a=await h.addListener(r,()=>{t(e)});this.eventListeners.set(r,a)}await h.connect(Object.assign({deviceId:e},i))})}async createBond(e,t){await this.queue(async()=>{await h.createBond(Object.assign({deviceId:e},t))})}async isBonded(e){return await this.queue(async()=>(await h.isBonded({deviceId:e})).value)}async disconnect(e){await this.queue(async()=>{await h.disconnect({deviceId:e})})}async getServices(e){return await this.queue(async()=>(await h.getServices({deviceId:e})).services)}async discoverServices(e){await this.queue(async()=>{await h.discoverServices({deviceId:e})})}async getMtu(e){return await this.queue(async()=>(await h.getMtu({deviceId:e})).value)}async requestConnectionPriority(e,t){await this.queue(async()=>{await h.requestConnectionPriority({deviceId:e,connectionPriority:t})})}async readRssi(e){return await this.queue(async()=>{let i=await h.readRssi({deviceId:e});return parseFloat(i.value)})}async read(e,t,i,n){return t=b(t),i=b(i),await this.queue(async()=>{let a=await h.read(Object.assign({deviceId:e,service:t,characteristic:i},n));return this.convertValue(a.value)})}async write(e,t,i,n,r){return t=b(t),i=b(i),this.queue(async()=>{if(!n?.buffer)throw new Error("Invalid data.");let a=n;O.getPlatform()!=="web"&&(a=$(n)),await h.write(Object.assign({deviceId:e,service:t,characteristic:i,value:a},r))})}async writeWithoutResponse(e,t,i,n,r){t=b(t),i=b(i),await this.queue(async()=>{if(!n?.buffer)throw new Error("Invalid data.");let a=n;O.getPlatform()!=="web"&&(a=$(n)),await h.writeWithoutResponse(Object.assign({deviceId:e,service:t,characteristic:i,value:a},r))})}async readDescriptor(e,t,i,n,r){return t=b(t),i=b(i),n=b(n),await this.queue(async()=>{let o=await h.readDescriptor(Object.assign({deviceId:e,service:t,characteristic:i,descriptor:n},r));return this.convertValue(o.value)})}async writeDescriptor(e,t,i,n,r,a){return t=b(t),i=b(i),n=b(n),this.queue(async()=>{if(!r?.buffer)throw new Error("Invalid data.");let o=r;O.getPlatform()!=="web"&&(o=$(r)),await h.writeDescriptor(Object.assign({deviceId:e,service:t,characteristic:i,descriptor:n,value:o},a))})}async startNotifications(e,t,i,n){t=b(t),i=b(i),await this.queue(async()=>{var r;let a=`notification|${e}|${t}|${i}`;await((r=this.eventListeners.get(a))===null||r===void 0?void 0:r.remove());let o=await h.addListener(a,l=>{n(this.convertValue(l?.value))});this.eventListeners.set(a,o),await h.startNotifications({deviceId:e,service:t,characteristic:i})})}async stopNotifications(e,t,i){t=b(t),i=b(i),await this.queue(async()=>{var n;let r=`notification|${e}|${t}|${i}`;await((n=this.eventListeners.get(r))===null||n===void 0?void 0:n.remove()),this.eventListeners.delete(r),await h.stopNotifications({deviceId:e,service:t,characteristic:i})})}validateRequestBleDeviceOptions(e){return e.services&&(e.services=e.services.map(b)),e.optionalServices&&(e.optionalServices=e.optionalServices.map(b)),e}convertValue(e){return typeof e=="string"?S(e):e===void 0?new DataView(new ArrayBuffer(0)):e}convertObject(e){if(e===void 0)return;let t={};for(let i of Object.keys(e))t[i]=this.convertValue(e[i]);return t}},ge=new ie;W();var me=class s extends N{constructor(t,i){super();this.client=ge;this.devices={};this.location=!1;this.initialized=!1;this.setupDevice=(t,i)=>new Promise(async(n,r)=>{this.devices[t.deviceId]={device:t,deviceId:t.deviceId,...i},await this.client.connect(t.deviceId,a=>{this.devices[t.deviceId]?.ondisconnect&&this.devices[t.deviceId].ondisconnect(a)},i?.connectOptions).then(async()=>{let a=await this.getServices(t.deviceId);for(let o in i?.services){i?.services[o].UUID&&(o=i?.services[o].UUID);let l=a.find(c=>{if(c.uuid===o)return!0});if(l)for(let c in i.services[o]){if(i.services[o][c].characteristic&&(c=i.services[o][c].characteristic),!l.characteristics.find(v=>{if(v.uuid===c)return!0}))continue;let u=i.services[o][c];u.write&&await this.write(t,o,c,u.write,u.writeCallback,u.chunkSize,u.writeOptions),u.read&&await this.read(t,o,c,u.readCallback,u.readOptions),u.notify&&u.notifyCallback&&(await this.subscribe(t,o,c,u.notifyCallback),u.notifying=!0)}}}).catch(r),n(this.devices[t.deviceId])});this.triangulate=(t,i=1500,n=60)=>new Promise((r,a)=>{if("Accelerometer"in globalThis){if(typeof globalThis.Accelerometer=="function"){let o=new globalThis.Accelerometer({frequency:n}),l=performance.now(),c=l,u={samples:[],vector:{}},v=()=>{if(c-l<i)this.readRssi(t).then(d=>{let f=o.x,w=o.y,g=o.z;c=performance.now(),u.samples.push({x:f,y:w,z:g,rssi:d,timestamp:c})});else{let d={x:0,y:0,z:0,rssiAvg:0};u.samples.forEach(f=>{}),o.removeEventListener("reading",v)}};o.addEventListener("reading",v)}}else a(new Error("No Accelerometer API detected"))});i&&(this.location=i),t&&this.setup(t)}setup(t,i=this.location){let n=[];if(t)for(let a in t.services)t.services[a].UUID&&(a=t.services[a].UUID),n.push(a);let r={};return i||(r.androidNeverForLocation=!1),new Promise(async(a,o)=>{if(this.initialized||(await this.client.initialize(r),this.initialized=!0),t?.deviceId)a(await this.reconnect(t.deviceId));else if(t){let l=Array.from(Object.keys(t.services)),c={};this.isMobile()||(c.optionalServices=l),t.name&&(c.name=t.name),t.namePrefix&&(c.namePrefix=t.namePrefix),this.client.requestDevice(c).then(u=>{a(this.setupDevice(u,t))}).catch(o)}else this.client.requestDevice().then(l=>{a(this.setupDevice(l,t))}).catch(o)})}initialize(t){return new Promise((i,n)=>{this.client.initialize(t).then(()=>{i(!0)}).catch(n)})}requestDevice(t,i){return new Promise((n,r)=>{this.client.requestDevice(t).then(a=>{this.devices[a.deviceId]={device:a,deviceId:a.deviceId,...i},n(a)}).catch(r)})}getServices(t){return this.client.getServices(t)}connect(t,i){return new Promise((n,r)=>{this.client.connect(t.deviceId,a=>{i?.ondisconnect&&i.ondisconnect(a)},i?.connectOptions).then(a=>{n(t)}).catch(r)})}reconnect(t,i){return new Promise((n,r)=>{let a=i;this.devices[t]&&(a=Object.assign(Object.assign({},this.devices[t]),a)),a?.deviceId&&delete a.deviceId,this.client.getDevices([t]).then(o=>{this.setupDevice(o[0],a).then(l=>{n(l)})}).catch(r)})}disconnect(t){if(typeof t=="object"&&t?.deviceId&&(t=t.deviceId),typeof t=="string"){let i=this.devices[t];return i.beforedisconnect&&i.beforedisconnect(this,i),delete this.devices[t],this.client.disconnect(t)}}write(t,i,n,r,a,o,l){return typeof t=="object"&&(t=t.deviceId),o?new Promise(async(c,u)=>{let v=s.toDataView(r),d=v.buffer.byteLength;for(let f=0;f<d;f+=o){let w=f+o;w>d&&(w=d);let g=new DataView(v.buffer.slice(f,w));a?await this.client.write(t,i,n,g).then(a):await this.client.writeWithoutResponse(t,i,n,g,l)}c(void 0)}):a?this.client.write(t,i,n,s.toDataView(r)).then(a):this.client.writeWithoutResponse(t,i,n,s.toDataView(r),l)}read(t,i,n,r,a){return typeof t=="object"&&(t=t.deviceId),r?this.client.read(t,i,n,a).then(r):this.client.read(t,i,n,a)}subscribe(t,i,n,r){return typeof t=="object"&&(t=t.deviceId),this.client.startNotifications(t,i,n,r)}unsubscribe(t,i,n){return typeof t=="object"&&(t=t.deviceId),this.client.stopNotifications(t,i,n)}scan(t,i){return this.client.requestLEScan(t,i)}stopScanning(){return this.client.stopLEScan()}readDescriptor(t,i,n,r,a){return this.client.readDescriptor(t.deviceId,i,n,r,a)}writeDescriptor(t,i,n,r,a,o){return this.client.writeDescriptor(t.deviceId,i,n,r,s.toDataView(a),o)}readRssi(t){return this.client.readRssi(t.deviceId)}isMobile(){let t=!1;return function(i){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(i)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(i.substr(0,4)))&&(t=!0)}(navigator.userAgent||navigator.vendor||window.opera),t}isAndroid(){return navigator.userAgent.toLowerCase().indexOf("android")>-1}async distance(t,i,n,r,a){let o=await this.readRssi(t);if(o==0)return;let l=o/i;return l<1?Math.pow(l,10):n*Math.pow(l,r)+a}async distanceFromPhone(t,i,n){let r,a,o;return n&&(n==="nexus5"?(r=.42093,a=6.9476,o=.54992):n==="motoX"?(r=.9401940951,a=6.170094565,o=0):n==="iphone5"&&(r=.89976,a=7.7095,o=.111)),await this.distance(t,i,r,a,o)}};export{me as BLEClient};
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
