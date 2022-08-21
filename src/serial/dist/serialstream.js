(()=>{var P=Object.defineProperty;var B=(f,t)=>{for(var e in t)P(f,e,{get:t[e],enumerable:!0})};var x={};B(x,{WebSerial:()=>d});var D=/^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/,V=/([1-9]\d*)?([xcbB?hHiIfdsp])/g,k=(f,t,e)=>String.fromCharCode(...new Uint8Array(f.buffer,f.byteOffset+t,e)),T=(f,t,e,r)=>new Uint8Array(f.buffer,f.byteOffset+t,e).set(r.split("").map(n=>n.charCodeAt(0))),C=(f,t,e)=>k(f,t+1,Math.min(f.getUint8(t),e-1)),O=(f,t,e,r)=>{f.setUint8(t,r.length),T(f,t+1,e-1,r)},L=f=>({x:t=>[1,t,0],c:t=>[t,1,e=>({u:r=>k(r,e,1),p:(r,n)=>T(r,e,1,n)})],"?":t=>[t,1,e=>({u:r=>Boolean(r.getUint8(e)),p:(r,n)=>r.setUint8(e,n)})],b:t=>[t,1,e=>({u:r=>r.getInt8(e),p:(r,n)=>r.setInt8(e,n)})],B:t=>[t,1,e=>({u:r=>r.getUint8(e),p:(r,n)=>r.setUint8(e,n)})],h:t=>[t,2,e=>({u:r=>r.getInt16(e,f),p:(r,n)=>r.setInt16(e,n,f)})],H:t=>[t,2,e=>({u:r=>r.getUint16(e,f),p:(r,n)=>r.setUint16(e,n,f)})],i:t=>[t,4,e=>({u:r=>r.getInt32(e,f),p:(r,n)=>r.setInt32(e,n,f)})],I:t=>[t,4,e=>({u:r=>r.getUint32(e,f),p:(r,n)=>r.setUint32(e,n,f)})],f:t=>[t,4,e=>({u:r=>r.getFloat32(e,f),p:(r,n)=>r.setFloat32(e,n,f)})],d:t=>[t,8,e=>({u:r=>r.getFloat64(e,f),p:(r,n)=>r.setFloat64(e,n,f)})],s:t=>[1,t,e=>({u:r=>k(r,e,t),p:(r,n)=>T(r,e,t,n.slice(0,t))})],p:t=>[1,t,e=>({u:r=>C(r,e,t),p:(r,n)=>O(r,e,t,n.slice(0,t-1))})]}),U=new RangeError("Structure larger than remaining buffer"),R=new RangeError("Not enough values for structure"),m=class{static toDataView(t){if(!(t instanceof DataView))if(typeof t=="string"&&parseInt(t)&&(t=parseInt(t)),typeof t=="string"){let e=new TextEncoder,r={};for(let a in m.codes)for(;t.indexOf(a)>-1;){let i=t.indexOf(a);t=t.replace(a,""),r[i]=a}let n=Array.from(e.encode(t));for(let a in r)n.splice(parseInt(a),0,m.codes[r[a]]);t=new DataView(new Uint8Array(n).buffer)}else if(typeof t=="number"){let e=t;t<256?(t=new DataView(new ArrayBuffer(1)),t.setUint8(0,e)):t<65536?(t=new DataView(new ArrayBuffer(2)),t.setInt16(0,e)):(t=new DataView(new ArrayBuffer(4)),t.setUint32(0,e))}else t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer?t=new DataView(t):Array.isArray(t)?t=new DataView(Uint8Array.from(t).buffer):typeof t=="object"&&(t=new TextEncoder().encode(JSON.stringify(t)));return t}static searchBuffer(t,e,r){for(var n=e,a=t,i=m.boyerMoore(n),s=i.byteLength,l=[],c=i(a);c!==-1&&(l.push(c),!(r&&l.length>=r));c=i(a,c+s));return l}static bytesToInt16(t,e){let r=(255&t)<<8|255&e;return(r&32768)>0?r|=4294901760:r&=65535,r}static bytesToUInt16(t,e){return t*256+e}static Uint16ToBytes(t){return[t&255,t>>8&255]}static bytesToInt24(t,e,r){let n=(255&t)<<16|(255&e)<<8|255&r;return(n&8388608)>0?n|=4278190080:n&=16777215,n}static bytesToUInt24(t,e,r){return t*65536+e*256+r}static Uint24ToBytes(t){return[t&255,t>>8&255,t>>16&255]}static bytesToInt32(t,e,r,n){let a=(255&t)<<24|(255&e)<<16|(255&r)<<8|255&n;return(a&2147483648)>0?a|=0:a&=4294967295,a}static bytesToUInt32(t,e,r,n){return t*16777216+e*65536+r*256+n}static Uint32ToBytes(t){return[t&255,t>>8&255,t>>16&255,t>>24&255]}static get2sCompliment(t,e){return t>4294967296?null:t<<32-e>>32-e}static getSignedInt(...t){let e=0;function r(n){for(var a=0,i=!0;n--;)if(i){let s=t[e++];a+=s&127,s&128&&(a-=128),i=!1}else a*=256,a+=t[e++];return a}return r(t.length)}static asUint8Array(t){if(t instanceof Uint8Array)return t;if(typeof t=="string"){for(var e=new Uint8Array(t.length),r=0;r<t.length;r++){var n=t.charCodeAt(r);if(n>127)throw new TypeError("Only ASCII patterns are supported");e[r]=n}return e}else return new Uint8Array(t)}static boyerMoore(t){var e=m.asUint8Array(t),r=e.length;if(r===0)throw new TypeError("patternBuffer must be at least 1 byte long");for(var n=256,a=new Int32Array(n),i=0;i<n;i++)a[i]=-1;for(var s=0;s<r;s++)a[e[s]]=s;var l=(c,h,b)=>{var o=m.asUint8Array(c);h===void 0&&(h=0),b===void 0&&(b=o.length);for(var u=e,y=a,g=b-u.length,I=u.length-1,S,F=h;F<=g;F+=S){S=0;for(var p=I;p>=0;p--){var A=o[F+p];if(u[p]!==A){S=Math.max(1,p-y[A]);break}}if(S===0)return F}return-1};return l.byteLength=e.byteLength,l}static struct(t){let e=[],r=0,n=D.exec(t);if(!n)throw new RangeError("Invalid format string");let a=L(n[1]==="<"),i=(o,u)=>a[u](o?parseInt(o,10):1);for(;n=V.exec(t);)((o,u,y)=>{for(let g=0;g<o;++g,r+=u)y&&e.push(y(r))})(...i(...n.slice(1)));let s=(o,u)=>{if(o.byteLength<(u|0)+r)throw U;let y=new DataView(o,u|0);return e.map(g=>g.u(y))},l=(o,u,...y)=>{if(y.length<e.length)throw R;if(o.byteLength<u+r)throw U;let g=new DataView(o,u);new Uint8Array(o,u,r).fill(0),e.forEach((I,S)=>I.p(g,y[S]))},c=(...o)=>{let u=new ArrayBuffer(r);return l(u,0,...o),u},h=o=>s(o,0);function*b(o){for(let u=0;u+r<=o.byteLength;u+=r)yield s(o,u)}return Object.freeze({unpack:h,pack:c,unpack_from:s,pack_into:l,iter_unpack:b,format:t,size:r})}},w=m;w.codes={"\\n":10,"\\r":13,"\\t":9,"\\s":32,"\\b":8,"\\f":12,"\\":92};var d=class extends w{constructor(){super(...arguments);this.streams={};this.createStream=e=>{let r={_id:e._id?e._id:`stream${Math.floor(Math.random()*1e15)}`,info:e.port.getInfo(),running:!1,...e};return e.port?.readable&&(e.transforms?r.reader=d.setStreamTransforms(e.port.readable,e.transforms).getReader():r.reader=e.port.readable.getReader()),this.streams[r._id]=r,r}}getPorts(){return navigator.serial.getPorts()}requestPort(e,r){let n={};return e&&(n.usbVendorId=e),r&&(n.usbProductId=r),n.usbVendorId?navigator.serial.requestPort({filters:[n]}):navigator.serial.requestPort()}openPort(e,r){return r&&(r=Object.assign({},r)),r?.ondisconnect&&(e.ondisconnect=r.ondisconnect,delete r.ondisconnect),e.open(r).then(()=>{r?.onconnect&&r.onconnect(e)})}async readWithTimeout(e,r){let n=e.readable.getReader(),a=setTimeout(()=>{n.releaseLock()},r),i=await n.read();return clearTimeout(a),n.releaseLock(),i}async writePort(e,r){let n=e.writable.getWriter();return await n.write(d.toDataView(r)),n.releaseLock(),!0}getSignals(e){return e.getSignals()}setSignals(e,r){return e.setSignals(r)}readStream(e){if(e.reader&&!e.running){let r=e.reader;e.buffering&&(typeof e.buffering!="object"&&(e.buffering={}),e.buffering.buffer||(e.buffering.buffer=[]),e.buffering.searchBytes||(e.buffering.searchBytes=new Uint8Array([13,10])));let n=()=>{if(e.port.readable&&e.running)r.read().then(a=>{if(a.done)r.releaseLock();else{if(e.buffering){e.buffering.buffer.push(...a.value);let s=e.buffering.searchBytes,l=e.buffering.buffer,c=d.boyerMoore(s),h=c.byteLength,b=-1;for(var i=c(l);i!==-1;i=c(l,i+h))!e.buffering.locked&&!("lockIdx"in e.buffering)?e.buffering.lockIdx=i:(b=i,b>=0&&(e.buffering.locked?b>0&&e.ondata(new Uint8Array(e.buffering.buffer.splice(e.buffering.searchBytes.length,b))):(e.ondata(new Uint8Array(e.buffering.buffer.splice(e.buffering.lockIdx+e.buffering.searchBytes.length,b+e.buffering.searchBytes.length))),e.buffering.buffer.splice(0,e.buffering.searchBytes.length),e.buffering.locked=!0)))}else e.ondata(a.value);setTimeout(()=>{n()},e.frequency)}});else if(!e.running&&e.port.readable)try{r.releaseLock()}catch(a){console.error(a)}};return e.running=!0,n(),e}}writeStream(e,r){if(typeof e=="string"&&(e=this.streams[e]),e.port.writable){let n=e.port.writable.getWriter();return n.write(d.toDataView(r)),n.releaseLock(),!0}}closeStream(e,r){return typeof e=="string"&&(e=this.streams[e]),e.running=!1,new Promise((n,a)=>{setTimeout(async()=>{if(e.port.readable&&e.reader)try{e.reader.releaseLock();try{await e.reader.cancel()}catch{}}catch(i){console.error(i)}try{await e.port.close().then(()=>{r&&r(this.streams[e._id])})}catch(i){a(i)}delete this.streams[e._id],n(!0)},300)})}static setStreamTransforms(e,r){let n=[];Object.keys(r).forEach(i=>{let s=r[i];if(s instanceof TransformStream)n.push(s);else{s.start||(s.start=function(){}),s.flush||(s.flush=function(){});let l=new TransformStream({start:s.start,transform:s.transform,flush:s.flush},s.writableStrategy,s.readableStrategy);n.push(l)}});let a=e;return n.forEach(i=>{a=a.pipeThrough(i)}),a}};["WebSerial"].forEach(f=>{x[f]&&(globalThis[f]=x[f])});})();
