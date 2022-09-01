(()=>{var P=Object.defineProperty;var M=(c,e)=>{for(var r in e)P(c,r,{get:e[r],enumerable:!0})};var I={};M(I,{WebSerial:()=>m});var S=class{constructor(){this.recursivelyAssign=(e,r)=>{for(let t in r)typeof r[t]=="object"?typeof e[t]=="object"?this.recursivelyAssign(e[t],r[t]):e[t]=this.recursivelyAssign({},r[t]):e[t]=r[t];return e}}static autoscale(e,r=0,t=1,n=!1,i,a,s){if(e?.length===0)return e;let f=a||Math.max(...e),l=i||Math.min(...e),o=1/t,b=1;if(n){let u=Math.max(Math.abs(l),Math.abs(f));return u!==0&&(b=o/u),e.map(g=>(s&&(g<l&&(g=l),g>f&&(g=f)),g*b+(o*(r+1)*2-1-o)))}else return f===l?f!==0?b=o/f:l!==0&&(b=o/Math.abs(l)):b=o/(f-l),e.map(u=>(s&&(u<l&&(u=l),u>f&&(u=f)),2*((u-l)*b-1/(2*t))+(o*(r+1)*2-1-o)))}static genTimestamps(e,r){let t=Date.now(),n=[t-e*1e3/r,t];return S.upsample(n,e)}static absmax(e){return Math.max(Math.abs(Math.min(...e)),Math.max(...e))}static downsample(e,r,t=1){if(e.length>r){let n=new Array(r),i=e.length/r,a=e.length-1,s=0,f=0;for(let l=i;l<e.length;l+=i){let o=Math.round(l);o>a&&(o=a);for(let b=s;b<o;b++)n[f]+=e[b];n[f]/=(o-s)*t,f++,s=o}return n}else return e}static upsample(e,r,t=1){var n=function(u,g,y){return(u+(g-u)*y)*t},i=new Array(r),a=(e.length-1)/(r-1);i[0]=e[0];for(var s=1;s<r-1;s++){var f=s*a,l=Math.floor(f),o=Math.ceil(f),b=f-l;i[s]=n(e[l],e[o],b)}return i[r-1]=e[e.length-1],i}static interpolate(e,r,t=1){return e.length>r?S.downsample(e,r,t):e.length<r?S.upsample(e,r,t):e}static HSLToRGB(e,r,t,n=255){r/=100,t/=100;let i=(1-Math.abs(2*t-1))*r,a=i*(1-Math.abs(e/60%2-1)),s=t-i/2,f=0,l=0,o=0;return 0<=e&&e<60?(f=i,l=a,o=0):60<=e&&e<120?(f=a,l=i,o=0):120<=e&&e<180?(f=0,l=i,o=a):180<=e&&e<240?(f=0,l=a,o=i):240<=e&&e<300?(f=a,l=0,o=i):300<=e&&e<360&&(f=i,l=0,o=a),f=(f+s)*n,l=(l+s)*n,o=(o+s)*n,[f,l,o]}static circularBuffer(e,r){if(r.length<e.length){let t=e.slice(r.length),n=e.length;e.splice(0,n,...t,...r)}else if(r.length>e.length){let t=e.length;e.splice(0,t,r.slice(t-r.length))}else e.splice(0,e.length,...r);return e}static reformatData(e,r){if(Array.isArray(e)){if(Array.isArray(e[0])){let t={};if(e.forEach((n,i)=>{t[i]=n}),e=t,isNaN(e[0][0]))return}else if(r){if(e={[r]:e},isNaN(e[r][0]))return}else if(e={0:e},isNaN(e[0][0]))return}else if(typeof e=="object"){for(let t in e)if(typeof e[t]=="number"?e[t]=[e[t]]:e[t]?.values&&typeof e[t].values=="number"&&(e[t].values=[e[t].values]),isNaN(e[t][0]))return}else if(typeof e=="string"){let t;if(e.includes(`\r
`)){let n=e.split(`\r
`);e={},n.forEach((i,a)=>{i.includes("	")?t=i.split("	"):i.includes(",")?t=i.split(","):i.includes("|")&&(t=i.split("|")),t.forEach((s,f)=>{if(s.includes(":")){let[l,o]=s.split(":"),b=parseFloat(o);if(b)e[l]=[b];else return}else{let l=parseFloat(s);if(l)e[f]=[l];else return}})})}else e.includes("	")?t=e.split("	"):e.includes(",")?t=e.split(","):e.includes("|")&&(t=e.split("|"));e={},t&&t.forEach((n,i)=>{if(n.includes(":")){let[a,s]=n.split(":"),f=parseFloat(s);if(f)e[a]=[f];else return}else{let a=parseFloat(n);if(a)e[i]=[a];else return}})}else typeof e=="number"&&(r?e={[r]:[e]}:e={0:[e]});return e}static padTime(e,r,t,n){let i=(e[0]-r)/t/n;return[...new Array(n-e.length).map((s,f)=>r+i*(f+1)),...e]}static interpolateForTime(e,r,t){return S.interpolate(e,Math.ceil(t*r))}isTypedArray(e){return ArrayBuffer.isView(e)&&Object.prototype.toString.call(e)!=="[object DataView]"}spliceTypedArray(e,r,t){let n=e.subarray(0,r),i;t&&(i=e.subarray(t+1));let a;return(n.length>0||i?.length>0)&&(a=new e.constructor(n.length+i.length)),n.length>0&&a.set(n),i&&i.length>0&&a.set(i,n.length),a}},x=S;x.bufferValues=(e,r,t,n)=>{if(!Array.isArray(t)&&typeof t=="object"&&(t=Object.keys(t)),!n){let a=Object.keys(e);t?n=new Float32Array(a.length*t.length):typeof e[a[0]][r]=="object"?(t=Object.keys(e[a[0]][r]),n=new Float32Array(a.length*t.length)):n=new Float32Array(a.length)}let i=0;for(let a in e)if(e[a][r])if(t)for(let s=0;s<t.length;s++)n[i]=e[a][r][t[s]],i++;else n[i]=e[a][r],i++;return n};var V=/^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/,v=/([1-9]\d*)?([xcbB?hHiIfdsp])/g,k=(c,e,r)=>String.fromCharCode(...new Uint8Array(c.buffer,c.byteOffset+e,r)),U=(c,e,r,t)=>new Uint8Array(c.buffer,c.byteOffset+e,r).set(t.split("").map(n=>n.charCodeAt(0))),O=(c,e,r)=>k(c,e+1,Math.min(c.getUint8(e),r-1)),L=(c,e,r,t)=>{c.setUint8(e,t.length),U(c,e+1,r-1,t)},R=c=>({x:e=>[1,e,0],c:e=>[e,1,r=>({u:t=>k(t,r,1),p:(t,n)=>U(t,r,1,n)})],"?":e=>[e,1,r=>({u:t=>Boolean(t.getUint8(r)),p:(t,n)=>t.setUint8(r,n)})],b:e=>[e,1,r=>({u:t=>t.getInt8(r),p:(t,n)=>t.setInt8(r,n)})],B:e=>[e,1,r=>({u:t=>t.getUint8(r),p:(t,n)=>t.setUint8(r,n)})],h:e=>[e,2,r=>({u:t=>t.getInt16(r,c),p:(t,n)=>t.setInt16(r,n,c)})],H:e=>[e,2,r=>({u:t=>t.getUint16(r,c),p:(t,n)=>t.setUint16(r,n,c)})],i:e=>[e,4,r=>({u:t=>t.getInt32(r,c),p:(t,n)=>t.setInt32(r,n,c)})],I:e=>[e,4,r=>({u:t=>t.getUint32(r,c),p:(t,n)=>t.setUint32(r,n,c)})],f:e=>[e,4,r=>({u:t=>t.getFloat32(r,c),p:(t,n)=>t.setFloat32(r,n,c)})],d:e=>[e,8,r=>({u:t=>t.getFloat64(r,c),p:(t,n)=>t.setFloat64(r,n,c)})],s:e=>[1,e,r=>({u:t=>k(t,r,e),p:(t,n)=>U(t,r,e,n.slice(0,e))})],p:e=>[1,e,r=>({u:t=>O(t,r,e),p:(t,n)=>L(t,r,e,n.slice(0,e-1))})]}),D=new RangeError("Structure larger than remaining buffer"),C=new RangeError("Not enough values for structure"),p=class extends x{static toDataView(e){if(!(e instanceof DataView))if(typeof e=="string"&&parseInt(e)&&(e=parseInt(e)),typeof e=="string"){let r=new TextEncoder,t={};for(let i in p.codes)for(;e.indexOf(i)>-1;){let a=e.indexOf(i);e=e.replace(i,""),t[a]=i}let n=Array.from(r.encode(e));for(let i in t)n.splice(parseInt(i),0,p.codes[t[i]]);e=new DataView(new Uint8Array(n).buffer)}else if(typeof e=="number"){let r=e;e<256?(e=new DataView(new ArrayBuffer(1)),e.setUint8(0,r)):e<65536?(e=new DataView(new ArrayBuffer(2)),e.setInt16(0,r)):(e=new DataView(new ArrayBuffer(4)),e.setUint32(0,r))}else e instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&e instanceof SharedArrayBuffer?e=new DataView(e):Array.isArray(e)?e=new DataView(Uint8Array.from(e).buffer):typeof e=="object"&&(e=new TextEncoder().encode(JSON.stringify(e)));return e}static searchBuffer(e,r,t){for(var n=r,i=e,a=p.boyerMoore(n),s=a.byteLength,f=[],l=a(i);l!==-1&&(f.push(l),!(t&&f.length>=t));l=a(i,l+s));return f}static absmax(e){return Math.max(Math.abs(Math.min(...e)),Math.max(...e))}static bytesToInt16(e,r){let t=(255&e)<<8|255&r;return(t&32768)>0?t|=4294901760:t&=65535,t}static bytesToUInt16(e,r){return e*256+r}static Uint16ToBytes(e){return[e&255,e>>8&255]}static bytesToInt24(e,r,t){let n=(255&e)<<16|(255&r)<<8|255&t;return(n&8388608)>0?n|=4278190080:n&=16777215,n}static bytesToUInt24(e,r,t){return e*65536+r*256+t}static Uint24ToBytes(e){return[e&255,e>>8&255,e>>16&255]}static bytesToInt32(e,r,t,n){let i=(255&e)<<24|(255&r)<<16|(255&t)<<8|255&n;return(i&2147483648)>0?i|=0:i&=4294967295,i}static bytesToUInt32(e,r,t,n){return e*16777216+r*65536+t*256+n}static Uint32ToBytes(e){return[e&255,e>>8&255,e>>16&255,e>>24&255]}static get2sCompliment(e,r){return e>4294967296?null:e<<32-r>>32-r}static getSignedInt(...e){let r=0;function t(n){for(var i=0,a=!0;n--;)if(a){let s=e[r++];i+=s&127,s&128&&(i-=128),a=!1}else i*=256,i+=e[r++];return i}return t(e.length)}static asUint8Array(e){if(e instanceof Uint8Array)return e;if(typeof e=="string"){for(var r=new Uint8Array(e.length),t=0;t<e.length;t++){var n=e.charCodeAt(t);if(n>127)throw new TypeError("Only ASCII patterns are supported");r[t]=n}return r}else return new Uint8Array(e)}static boyerMoore(e){var r=p.asUint8Array(e),t=r.length;if(t===0)throw new TypeError("patternBuffer must be at least 1 byte long");for(var n=256,i=new Int32Array(n),a=0;a<n;a++)i[a]=-1;for(var s=0;s<t;s++)i[r[s]]=s;var f=(l,o,b)=>{var u=p.asUint8Array(l);o===void 0&&(o=0),b===void 0&&(b=u.length);for(var g=r,y=i,h=b-g.length,T=g.length-1,d,A=o;A<=h;A+=d){d=0;for(var w=T;w>=0;w--){var B=u[A+w];if(g[w]!==B){d=Math.max(1,w-y[B]);break}}if(d===0)return A}return-1};return f.byteLength=r.byteLength,f}static struct(e){let r=[],t=0,n=V.exec(e);if(!n)throw new RangeError("Invalid format string");let i=R(n[1]==="<"),a=(u,g)=>i[g](u?parseInt(u,10):1);for(;n=v.exec(e);)((u,g,y)=>{for(let h=0;h<u;++h,t+=g)y&&r.push(y(t))})(...a(...n.slice(1)));let s=(u,g)=>{if(u.byteLength<(g|0)+t)throw D;let y=new DataView(u,g|0);return r.map(h=>h.u(y))},f=(u,g,...y)=>{if(y.length<r.length)throw C;if(u.byteLength<g+t)throw D;let h=new DataView(u,g);new Uint8Array(u,g,t).fill(0),r.forEach((T,d)=>T.p(h,y[d]))},l=(...u)=>{let g=new ArrayBuffer(t);return f(g,0,...u),g},o=u=>s(u,0);function*b(u){for(let g=0;g+t<=u.byteLength;g+=t)yield s(u,g)}return Object.freeze({unpack:o,pack:l,unpack_from:s,pack_into:f,iter_unpack:b,format:e,size:t})}},F=p;F.codes={"\\n":10,"\\r":13,"\\t":9,"\\s":32,"\\b":8,"\\f":12,"\\":92};var m=class extends F{constructor(){super(...arguments);this.streams={};this.createStream=r=>{let t={_id:r._id?r._id:`stream${Math.floor(Math.random()*1e15)}`,info:r.port.getInfo(),running:!1,...r};return r.port?.readable&&(r.transforms?t.reader=m.setStreamTransforms(r.port.readable,r.transforms).getReader():t.reader=r.port.readable.getReader()),this.streams[t._id]=t,t}}getPorts(){return navigator.serial.getPorts()}requestPort(r,t){let n={};return r&&(n.usbVendorId=r),t&&(n.usbProductId=t),n.usbVendorId?navigator.serial.requestPort({filters:[n]}):navigator.serial.requestPort()}openPort(r,t){return t&&(t=Object.assign({},t)),t?.ondisconnect&&(r.ondisconnect=t.ondisconnect,delete t.ondisconnect),r.open(t).then(()=>{t?.onconnect&&t.onconnect(r)})}async readWithTimeout(r,t){let n=r.readable.getReader(),i=setTimeout(()=>{n.releaseLock()},t),a=await n.read();return clearTimeout(i),n.releaseLock(),a}async writePort(r,t){let n=r.writable.getWriter();return await n.write(m.toDataView(t)),n.releaseLock(),!0}getSignals(r){return r.getSignals()}setSignals(r,t){return r.setSignals(t)}readStream(r){if(r.reader&&!r.running){let t=r.reader;r.buffering&&(typeof r.buffering!="object"&&(r.buffering={}),r.buffering.buffer||(r.buffering.buffer=[]),r.buffering.searchBytes||(r.buffering.searchBytes=new Uint8Array([13,10])));let n=()=>{if(r.port.readable&&r.running)t.read().then(i=>{if(i.done)t.releaseLock();else{if(r.buffering){r.buffering.buffer.push(...i.value);let s=r.buffering.searchBytes,f=r.buffering.buffer,l=m.boyerMoore(s),o=l.byteLength,b=-1;for(var a=l(f);a!==-1;a=l(f,a+o))!r.buffering.locked&&!("lockIdx"in r.buffering)?r.buffering.lockIdx=a:(b=a,b>=0&&(r.buffering.locked?b>0&&r.ondata(new Uint8Array(r.buffering.buffer.splice(r.buffering.searchBytes.length,b))):(r.ondata(new Uint8Array(r.buffering.buffer.splice(r.buffering.lockIdx+r.buffering.searchBytes.length,b+r.buffering.searchBytes.length))),r.buffering.buffer.splice(0,r.buffering.searchBytes.length),r.buffering.locked=!0)))}else r.ondata(i.value);setTimeout(()=>{n()},r.frequency)}});else if(!r.running&&r.port.readable)try{t.releaseLock()}catch(i){console.error(i)}};return r.running=!0,n(),r}}writeStream(r,t){if(typeof r=="string"&&(r=this.streams[r]),r.port.writable){let n=r.port.writable.getWriter();return n.write(m.toDataView(t)),n.releaseLock(),!0}}closeStream(r,t){return typeof r=="string"&&(r=this.streams[r]),r.running=!1,new Promise((n,i)=>{setTimeout(async()=>{if(r.port.readable&&r.reader)try{r.reader.releaseLock();try{await r.reader.cancel()}catch{}}catch(a){console.error(a)}try{await r.port.close().then(()=>{t&&t(this.streams[r._id])})}catch(a){i(a)}delete this.streams[r._id],n(!0)},300)})}static setStreamTransforms(r,t){let n=[];Object.keys(t).forEach(a=>{let s=t[a];if(s instanceof TransformStream)n.push(s);else{s.start||(s.start=function(){}),s.flush||(s.flush=function(){});let f=new TransformStream({start:s.start,transform:s.transform,flush:s.flush},s.writableStrategy,s.readableStrategy);n.push(f)}});let i=r;return n.forEach(a=>{i=i.pipeThrough(a)}),i}};["WebSerial"].forEach(c=>{I[c]&&(globalThis[c]=I[c])});})();
