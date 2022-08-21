var U=/^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/,P=/([1-9]\d*)?([xcbB?hHiIfdsp])/g,I=(s,t,e)=>String.fromCharCode(...new Uint8Array(s.buffer,s.byteOffset+t,e)),k=(s,t,e,r)=>new Uint8Array(s.buffer,s.byteOffset+t,e).set(r.split("").map(n=>n.charCodeAt(0))),B=(s,t,e)=>I(s,t+1,Math.min(s.getUint8(t),e-1)),D=(s,t,e,r)=>{s.setUint8(t,r.length),k(s,t+1,e-1,r)},V=s=>({x:t=>[1,t,0],c:t=>[t,1,e=>({u:r=>I(r,e,1),p:(r,n)=>k(r,e,1,n)})],"?":t=>[t,1,e=>({u:r=>Boolean(r.getUint8(e)),p:(r,n)=>r.setUint8(e,n)})],b:t=>[t,1,e=>({u:r=>r.getInt8(e),p:(r,n)=>r.setInt8(e,n)})],B:t=>[t,1,e=>({u:r=>r.getUint8(e),p:(r,n)=>r.setUint8(e,n)})],h:t=>[t,2,e=>({u:r=>r.getInt16(e,s),p:(r,n)=>r.setInt16(e,n,s)})],H:t=>[t,2,e=>({u:r=>r.getUint16(e,s),p:(r,n)=>r.setUint16(e,n,s)})],i:t=>[t,4,e=>({u:r=>r.getInt32(e,s),p:(r,n)=>r.setInt32(e,n,s)})],I:t=>[t,4,e=>({u:r=>r.getUint32(e,s),p:(r,n)=>r.setUint32(e,n,s)})],f:t=>[t,4,e=>({u:r=>r.getFloat32(e,s),p:(r,n)=>r.setFloat32(e,n,s)})],d:t=>[t,8,e=>({u:r=>r.getFloat64(e,s),p:(r,n)=>r.setFloat64(e,n,s)})],s:t=>[1,t,e=>({u:r=>I(r,e,t),p:(r,n)=>k(r,e,t,n.slice(0,t))})],p:t=>[1,t,e=>({u:r=>B(r,e,t),p:(r,n)=>D(r,e,t,n.slice(0,t-1))})]}),A=new RangeError("Structure larger than remaining buffer"),C=new RangeError("Not enough values for structure"),h=class{static toDataView(t){if(!(t instanceof DataView))if(typeof t=="string"&&parseInt(t)&&(t=parseInt(t)),typeof t=="string"){let e=new TextEncoder,r={};for(let a in h.codes)for(;t.indexOf(a)>-1;){let i=t.indexOf(a);t=t.replace(a,""),r[i]=a}let n=Array.from(e.encode(t));for(let a in r)n.splice(parseInt(a),0,h.codes[r[a]]);t=new DataView(new Uint8Array(n).buffer)}else if(typeof t=="number"){let e=t;t<256?(t=new DataView(new ArrayBuffer(1)),t.setUint8(0,e)):t<65536?(t=new DataView(new ArrayBuffer(2)),t.setInt16(0,e)):(t=new DataView(new ArrayBuffer(4)),t.setUint32(0,e))}else t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer?t=new DataView(t):Array.isArray(t)?t=new DataView(Uint8Array.from(t).buffer):typeof t=="object"&&(t=new TextEncoder().encode(JSON.stringify(t)));return t}static searchBuffer(t,e,r){for(var n=e,a=t,i=h.boyerMoore(n),f=i.byteLength,l=[],c=i(a);c!==-1&&(l.push(c),!(r&&l.length>=r));c=i(a,c+f));return l}static bytesToInt16(t,e){let r=(255&t)<<8|255&e;return(r&32768)>0?r|=4294901760:r&=65535,r}static bytesToUInt16(t,e){return t*256+e}static Uint16ToBytes(t){return[t&255,t>>8&255]}static bytesToInt24(t,e,r){let n=(255&t)<<16|(255&e)<<8|255&r;return(n&8388608)>0?n|=4278190080:n&=16777215,n}static bytesToUInt24(t,e,r){return t*65536+e*256+r}static Uint24ToBytes(t){return[t&255,t>>8&255,t>>16&255]}static bytesToInt32(t,e,r,n){let a=(255&t)<<24|(255&e)<<16|(255&r)<<8|255&n;return(a&2147483648)>0?a|=0:a&=4294967295,a}static bytesToUInt32(t,e,r,n){return t*16777216+e*65536+r*256+n}static Uint32ToBytes(t){return[t&255,t>>8&255,t>>16&255,t>>24&255]}static get2sCompliment(t,e){return t>4294967296?null:t<<32-e>>32-e}static getSignedInt(...t){let e=0;function r(n){for(var a=0,i=!0;n--;)if(i){let f=t[e++];a+=f&127,f&128&&(a-=128),i=!1}else a*=256,a+=t[e++];return a}return r(t.length)}static asUint8Array(t){if(t instanceof Uint8Array)return t;if(typeof t=="string"){for(var e=new Uint8Array(t.length),r=0;r<t.length;r++){var n=t.charCodeAt(r);if(n>127)throw new TypeError("Only ASCII patterns are supported");e[r]=n}return e}else return new Uint8Array(t)}static boyerMoore(t){var e=h.asUint8Array(t),r=e.length;if(r===0)throw new TypeError("patternBuffer must be at least 1 byte long");for(var n=256,a=new Int32Array(n),i=0;i<n;i++)a[i]=-1;for(var f=0;f<r;f++)a[e[f]]=f;var l=(c,d,y)=>{var o=h.asUint8Array(c);d===void 0&&(d=0),y===void 0&&(y=o.length);for(var u=e,b=a,g=y-u.length,x=u.length-1,S,F=d;F<=g;F+=S){S=0;for(var p=x;p>=0;p--){var T=o[F+p];if(u[p]!==T){S=Math.max(1,p-b[T]);break}}if(S===0)return F}return-1};return l.byteLength=e.byteLength,l}static struct(t){let e=[],r=0,n=U.exec(t);if(!n)throw new RangeError("Invalid format string");let a=V(n[1]==="<"),i=(o,u)=>a[u](o?parseInt(o,10):1);for(;n=P.exec(t);)((o,u,b)=>{for(let g=0;g<o;++g,r+=u)b&&e.push(b(r))})(...i(...n.slice(1)));let f=(o,u)=>{if(o.byteLength<(u|0)+r)throw A;let b=new DataView(o,u|0);return e.map(g=>g.u(b))},l=(o,u,...b)=>{if(b.length<e.length)throw C;if(o.byteLength<u+r)throw A;let g=new DataView(o,u);new Uint8Array(o,u,r).fill(0),e.forEach((x,S)=>x.p(g,b[S]))},c=(...o)=>{let u=new ArrayBuffer(r);return l(u,0,...o),u},d=o=>f(o,0);function*y(o){for(let u=0;u+r<=o.byteLength;u+=r)yield f(o,u)}return Object.freeze({unpack:d,pack:c,unpack_from:f,pack_into:l,iter_unpack:y,format:t,size:r})}},w=h;w.codes={"\\n":10,"\\r":13,"\\t":9,"\\s":32,"\\b":8,"\\f":12,"\\":92};var m=class extends w{constructor(){super(...arguments);this.streams={};this.createStream=e=>{let r={_id:e._id?e._id:`stream${Math.floor(Math.random()*1e15)}`,info:e.port.getInfo(),running:!1,...e};return e.port?.readable&&(e.transforms?r.reader=m.setStreamTransforms(e.port.readable,e.transforms).getReader():r.reader=e.port.readable.getReader()),this.streams[r._id]=r,r}}getPorts(){return navigator.serial.getPorts()}requestPort(e,r){let n={};return e&&(n.usbVendorId=e),r&&(n.usbProductId=r),n.usbVendorId?navigator.serial.requestPort({filters:[n]}):navigator.serial.requestPort()}openPort(e,r){return r&&(r=Object.assign({},r)),r?.ondisconnect&&(e.ondisconnect=r.ondisconnect,delete r.ondisconnect),e.open(r).then(()=>{r?.onconnect&&r.onconnect(e)})}async readWithTimeout(e,r){let n=e.readable.getReader(),a=setTimeout(()=>{n.releaseLock()},r),i=await n.read();return clearTimeout(a),n.releaseLock(),i}async writePort(e,r){let n=e.writable.getWriter();return await n.write(m.toDataView(r)),n.releaseLock(),!0}getSignals(e){return e.getSignals()}setSignals(e,r){return e.setSignals(r)}readStream(e){if(e.reader&&!e.running){let r=e.reader;e.buffering&&(typeof e.buffering!="object"&&(e.buffering={}),e.buffering.buffer||(e.buffering.buffer=[]),e.buffering.searchBytes||(e.buffering.searchBytes=new Uint8Array([13,10])));let n=()=>{if(e.port.readable&&e.running)r.read().then(a=>{if(a.done)r.releaseLock();else{if(e.buffering){e.buffering.buffer.push(...a.value);let f=e.buffering.searchBytes,l=e.buffering.buffer,c=m.boyerMoore(f),d=c.byteLength,y=-1;for(var i=c(l);i!==-1;i=c(l,i+d))!e.buffering.locked&&!("lockIdx"in e.buffering)?e.buffering.lockIdx=i:(y=i,y>=0&&(e.buffering.locked?y>0&&e.ondata(new Uint8Array(e.buffering.buffer.splice(e.buffering.searchBytes.length,y))):(e.ondata(new Uint8Array(e.buffering.buffer.splice(e.buffering.lockIdx+e.buffering.searchBytes.length,y+e.buffering.searchBytes.length))),e.buffering.buffer.splice(0,e.buffering.searchBytes.length),e.buffering.locked=!0)))}else e.ondata(a.value);setTimeout(()=>{n()},e.frequency)}});else if(!e.running&&e.port.readable)try{r.releaseLock()}catch(a){console.error(a)}};return e.running=!0,n(),e}}writeStream(e,r){if(typeof e=="string"&&(e=this.streams[e]),e.port.writable){let n=e.port.writable.getWriter();return n.write(m.toDataView(r)),n.releaseLock(),!0}}closeStream(e,r){return typeof e=="string"&&(e=this.streams[e]),e.running=!1,new Promise((n,a)=>{setTimeout(async()=>{if(e.port.readable&&e.reader)try{e.reader.releaseLock();try{await e.reader.cancel()}catch{}}catch(i){console.error(i)}try{await e.port.close().then(()=>{r&&r(this.streams[e._id])})}catch(i){a(i)}delete this.streams[e._id],n(!0)},300)})}static setStreamTransforms(e,r){let n=[];Object.keys(r).forEach(i=>{let f=r[i];if(f instanceof TransformStream)n.push(f);else{f.start||(f.start=function(){}),f.flush||(f.flush=function(){});let l=new TransformStream({start:f.start,transform:f.transform,flush:f.flush},f.writableStrategy,f.readableStrategy);n.push(l)}});let a=e;return n.forEach(i=>{a=a.pipeThrough(i)}),a}};export{m as WebSerial};
