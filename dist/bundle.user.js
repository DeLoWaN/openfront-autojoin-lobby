// ==UserScript==
// @name         OpenFront.io Lobby Intel + Discovery
// @namespace    https://openfront.io/
// @version      2.7.1
// @description  Live lobby player list and notify-only lobby discovery with Team criteria filters, shared API calls, and optional alerts.
// @homepageURL  https://github.com/DeLoWaN/openfront-autojoin-lobby
// @downloadURL  https://raw.githubusercontent.com/DeLoWaN/openfront-autojoin-lobby/main/dist/bundle.user.js
// @updateURL    https://raw.githubusercontent.com/DeLoWaN/openfront-autojoin-lobby/main/dist/bundle.user.js
// @author       DeLoVaN + SyntaxMenace + DeepSeek + Claude
// @match        https://openfront.io/
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @license      UNLICENSED
// ==/UserScript==

"use strict";(()=>{var pt=Object.create;var Ee=Object.defineProperty;var gt=Object.getOwnPropertyDescriptor;var mt=Object.getOwnPropertyNames;var bt=Object.getPrototypeOf,ft=Object.prototype.hasOwnProperty;var R=(a,e)=>()=>(e||a((e={exports:{}}).exports,e),e.exports);var ht=(a,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of mt(e))!ft.call(a,o)&&o!==t&&Ee(a,o,{get:()=>e[o],enumerable:!(r=gt(e,o))||r.enumerable});return a};var yt=(a,e,t)=>(t=a!=null?pt(bt(a)):{},ht(e||!a||!a.__esModule?Ee(t,"default",{value:a,enumerable:!0}):t,a));var Ae=R((Ie,le)=>{(function(a,e,t){function r(n){var s=this,d=i();s.next=function(){var c=2091639*s.s0+s.c*23283064365386963e-26;return s.s0=s.s1,s.s1=s.s2,s.s2=c-(s.c=c|0)},s.c=1,s.s0=d(" "),s.s1=d(" "),s.s2=d(" "),s.s0-=d(n),s.s0<0&&(s.s0+=1),s.s1-=d(n),s.s1<0&&(s.s1+=1),s.s2-=d(n),s.s2<0&&(s.s2+=1),d=null}function o(n,s){return s.c=n.c,s.s0=n.s0,s.s1=n.s1,s.s2=n.s2,s}function l(n,s){var d=new r(n),c=s&&s.state,u=d.next;return u.int32=function(){return d.next()*4294967296|0},u.double=function(){return u()+(u()*2097152|0)*11102230246251565e-32},u.quick=u,c&&(typeof c=="object"&&o(c,d),u.state=function(){return o(d,{})}),u}function i(){var n=4022871197,s=function(d){d=String(d);for(var c=0;c<d.length;c++){n+=d.charCodeAt(c);var u=.02519603282416938*n;n=u>>>0,u-=n,u*=n,n=u>>>0,u-=n,n+=u*4294967296}return(n>>>0)*23283064365386963e-26};return s}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.alea=l})(Ie,typeof le=="object"&&le,typeof define=="function"&&define)});var Be=R((Ge,ce)=>{(function(a,e,t){function r(i){var n=this,s="";n.x=0,n.y=0,n.z=0,n.w=0,n.next=function(){var c=n.x^n.x<<11;return n.x=n.y,n.y=n.z,n.z=n.w,n.w^=n.w>>>19^c^c>>>8},i===(i|0)?n.x=i:s+=i;for(var d=0;d<s.length+64;d++)n.x^=s.charCodeAt(d)|0,n.next()}function o(i,n){return n.x=i.x,n.y=i.y,n.z=i.z,n.w=i.w,n}function l(i,n){var s=new r(i),d=n&&n.state,c=function(){return(s.next()>>>0)/4294967296};return c.double=function(){do var u=s.next()>>>11,g=(s.next()>>>0)/4294967296,m=(u+g)/(1<<21);while(m===0);return m},c.int32=s.next,c.quick=c,d&&(typeof d=="object"&&o(d,s),c.state=function(){return o(s,{})}),c}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.xor128=l})(Ge,typeof ce=="object"&&ce,typeof define=="function"&&define)});var ze=R((De,de)=>{(function(a,e,t){function r(i){var n=this,s="";n.next=function(){var c=n.x^n.x>>>2;return n.x=n.y,n.y=n.z,n.z=n.w,n.w=n.v,(n.d=n.d+362437|0)+(n.v=n.v^n.v<<4^(c^c<<1))|0},n.x=0,n.y=0,n.z=0,n.w=0,n.v=0,i===(i|0)?n.x=i:s+=i;for(var d=0;d<s.length+64;d++)n.x^=s.charCodeAt(d)|0,d==s.length&&(n.d=n.x<<10^n.x>>>4),n.next()}function o(i,n){return n.x=i.x,n.y=i.y,n.z=i.z,n.w=i.w,n.v=i.v,n.d=i.d,n}function l(i,n){var s=new r(i),d=n&&n.state,c=function(){return(s.next()>>>0)/4294967296};return c.double=function(){do var u=s.next()>>>11,g=(s.next()>>>0)/4294967296,m=(u+g)/(1<<21);while(m===0);return m},c.int32=s.next,c.quick=c,d&&(typeof d=="object"&&o(d,s),c.state=function(){return o(s,{})}),c}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.xorwow=l})(De,typeof de=="object"&&de,typeof define=="function"&&define)});var Ne=R((Re,ue)=>{(function(a,e,t){function r(i){var n=this;n.next=function(){var d=n.x,c=n.i,u,g,m;return u=d[c],u^=u>>>7,g=u^u<<24,u=d[c+1&7],g^=u^u>>>10,u=d[c+3&7],g^=u^u>>>3,u=d[c+4&7],g^=u^u<<7,u=d[c+7&7],u=u^u<<13,g^=u^u<<9,d[c]=g,n.i=c+1&7,g};function s(d,c){var u,g,m=[];if(c===(c|0))g=m[0]=c;else for(c=""+c,u=0;u<c.length;++u)m[u&7]=m[u&7]<<15^c.charCodeAt(u)+m[u+1&7]<<13;for(;m.length<8;)m.push(0);for(u=0;u<8&&m[u]===0;++u);for(u==8?g=m[7]=-1:g=m[u],d.x=m,d.i=0,u=256;u>0;--u)d.next()}s(n,i)}function o(i,n){return n.x=i.x.slice(),n.i=i.i,n}function l(i,n){i==null&&(i=+new Date);var s=new r(i),d=n&&n.state,c=function(){return(s.next()>>>0)/4294967296};return c.double=function(){do var u=s.next()>>>11,g=(s.next()>>>0)/4294967296,m=(u+g)/(1<<21);while(m===0);return m},c.int32=s.next,c.quick=c,d&&(d.x&&o(d,s),c.state=function(){return o(s,{})}),c}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.xorshift7=l})(Re,typeof ue=="object"&&ue,typeof define=="function"&&define)});var Fe=R((Oe,pe)=>{(function(a,e,t){function r(i){var n=this;n.next=function(){var d=n.w,c=n.X,u=n.i,g,m;return n.w=d=d+1640531527|0,m=c[u+34&127],g=c[u=u+1&127],m^=m<<13,g^=g<<17,m^=m>>>15,g^=g>>>12,m=c[u]=m^g,n.i=u,m+(d^d>>>16)|0};function s(d,c){var u,g,m,h,C,x=[],$=128;for(c===(c|0)?(g=c,c=null):(c=c+"\0",g=0,$=Math.max($,c.length)),m=0,h=-32;h<$;++h)c&&(g^=c.charCodeAt((h+32)%c.length)),h===0&&(C=g),g^=g<<10,g^=g>>>15,g^=g<<4,g^=g>>>13,h>=0&&(C=C+1640531527|0,u=x[h&127]^=g+C,m=u==0?m+1:0);for(m>=128&&(x[(c&&c.length||0)&127]=-1),m=127,h=4*128;h>0;--h)g=x[m+34&127],u=x[m=m+1&127],g^=g<<13,u^=u<<17,g^=g>>>15,u^=u>>>12,x[m]=g^u;d.w=C,d.X=x,d.i=m}s(n,i)}function o(i,n){return n.i=i.i,n.w=i.w,n.X=i.X.slice(),n}function l(i,n){i==null&&(i=+new Date);var s=new r(i),d=n&&n.state,c=function(){return(s.next()>>>0)/4294967296};return c.double=function(){do var u=s.next()>>>11,g=(s.next()>>>0)/4294967296,m=(u+g)/(1<<21);while(m===0);return m},c.int32=s.next,c.quick=c,d&&(d.X&&o(d,s),c.state=function(){return o(s,{})}),c}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.xor4096=l})(Oe,typeof pe=="object"&&pe,typeof define=="function"&&define)});var Ue=R((He,ge)=>{(function(a,e,t){function r(i){var n=this,s="";n.next=function(){var c=n.b,u=n.c,g=n.d,m=n.a;return c=c<<25^c>>>7^u,u=u-g|0,g=g<<24^g>>>8^m,m=m-c|0,n.b=c=c<<20^c>>>12^u,n.c=u=u-g|0,n.d=g<<16^u>>>16^m,n.a=m-c|0},n.a=0,n.b=0,n.c=-1640531527,n.d=1367130551,i===Math.floor(i)?(n.a=i/4294967296|0,n.b=i|0):s+=i;for(var d=0;d<s.length+20;d++)n.b^=s.charCodeAt(d)|0,n.next()}function o(i,n){return n.a=i.a,n.b=i.b,n.c=i.c,n.d=i.d,n}function l(i,n){var s=new r(i),d=n&&n.state,c=function(){return(s.next()>>>0)/4294967296};return c.double=function(){do var u=s.next()>>>11,g=(s.next()>>>0)/4294967296,m=(u+g)/(1<<21);while(m===0);return m},c.int32=s.next,c.quick=c,d&&(typeof d=="object"&&o(d,s),c.state=function(){return o(s,{})}),c}e&&e.exports?e.exports=l:t&&t.amd?t(function(){return l}):this.tychei=l})(He,typeof ge=="object"&&ge,typeof define=="function"&&define)});var _e=R(()=>{});var We=R((qe,ee)=>{(function(a,e,t){var r=256,o=6,l=52,i="random",n=t.pow(r,o),s=t.pow(2,l),d=s*2,c=r-1,u;function g(b,v,T){var w=[];v=v==!0?{entropy:!0}:v||{};var S=x(C(v.entropy?[b,k(e)]:b??$(),3),w),I=new m(w),A=function(){for(var E=I.g(o),B=n,G=0;E<s;)E=(E+G)*r,B*=r,G=I.g(1);for(;E>=d;)E/=2,B/=2,G>>>=1;return(E+G)/B};return A.int32=function(){return I.g(4)|0},A.quick=function(){return I.g(4)/4294967296},A.double=A,x(k(I.S),e),(v.pass||T||function(E,B,G,z){return z&&(z.S&&h(z,I),E.state=function(){return h(I,{})}),G?(t[i]=E,B):E})(A,S,"global"in v?v.global:this==t,v.state)}function m(b){var v,T=b.length,w=this,S=0,I=w.i=w.j=0,A=w.S=[];for(T||(b=[T++]);S<r;)A[S]=S++;for(S=0;S<r;S++)A[S]=A[I=c&I+b[S%T]+(v=A[S])],A[I]=v;(w.g=function(E){for(var B,G=0,z=w.i,_=w.j,N=w.S;E--;)B=N[z=c&z+1],G=G*r+N[c&(N[z]=N[_=c&_+B])+(N[_]=B)];return w.i=z,w.j=_,G})(r)}function h(b,v){return v.i=b.i,v.j=b.j,v.S=b.S.slice(),v}function C(b,v){var T=[],w=typeof b,S;if(v&&w=="object")for(S in b)try{T.push(C(b[S],v-1))}catch{}return T.length?T:w=="string"?b:b+"\0"}function x(b,v){for(var T=b+"",w,S=0;S<T.length;)v[c&S]=c&(w^=v[c&S]*19)+T.charCodeAt(S++);return k(v)}function $(){try{var b;return u&&(b=u.randomBytes)?b=b(r):(b=new Uint8Array(r),(a.crypto||a.msCrypto).getRandomValues(b)),k(b)}catch{var v=a.navigator,T=v&&v.plugins;return[+new Date,a,T,a.screen,k(e)]}}function k(b){return String.fromCharCode.apply(0,b)}if(x(t.random(),e),typeof ee=="object"&&ee.exports){ee.exports=g;try{u=_e()}catch{}}else typeof define=="function"&&define.amd?define(function(){return g}):t["seed"+i]=g})(typeof self<"u"?self:qe,[],Math)});var Ve=R((Qt,je)=>{var vt=Ae(),xt=Be(),wt=ze(),Ct=Ne(),Tt=Fe(),Lt=Ue(),H=We();H.alea=vt;H.xor128=xt;H.xorwow=wt;H.xorshift7=Ct;H.xor4096=Tt;H.tychei=Lt;je.exports=H});var p={bgPrimary:"rgba(10, 14, 22, 0.92)",bgSecondary:"rgba(18, 26, 40, 0.75)",bgHover:"rgba(35, 48, 70, 0.6)",textPrimary:"#e7f1ff",textSecondary:"rgba(231, 241, 255, 0.7)",textMuted:"rgba(231, 241, 255, 0.5)",accent:"rgba(46, 211, 241, 0.95)",accentHover:"rgba(99, 224, 255, 0.95)",accentMuted:"rgba(46, 211, 241, 0.18)",accentAlt:"rgba(99, 110, 255, 0.9)",success:"rgba(20, 220, 170, 0.9)",successSolid:"#38d9a9",warning:"#f2c94c",error:"#ff7d87",highlight:"rgba(88, 211, 255, 0.2)",border:"rgba(120, 140, 180, 0.3)",borderAccent:"rgba(46, 211, 241, 0.55)"},L={display:"'Trebuchet MS', 'Segoe UI', Tahoma, Verdana, sans-serif",body:"'Segoe UI', Tahoma, Verdana, sans-serif",mono:"'Consolas', 'Courier New', monospace"},f={xs:"4px",sm:"8px",md:"12px",lg:"16px",xl:"20px",xxl:"24px"},M={sm:"4px",md:"6px",lg:"8px",xl:"12px"},V={sm:"0 2px 8px rgba(3, 8, 18, 0.35)",md:"0 10px 22px rgba(3, 8, 18, 0.45)",lg:"0 24px 40px rgba(2, 6, 16, 0.55), 0 0 24px rgba(46, 211, 241, 0.08)"},y={fast:"0.12s",normal:"0.2s",slow:"0.3s"};var Q={threadCount:20,lobbyPollingRate:1e3},P={lobbyDiscoverySettings:"OF_LOBBY_DISCOVERY_SETTINGS",playerListPanelPosition:"OF_PLAYER_LIST_PANEL_POSITION",playerListPanelSize:"OF_PLAYER_LIST_PANEL_SIZE",playerListShowOnlyClans:"OF_PLAYER_LIST_SHOW_ONLY_CLANS",playerListCollapseStates:"OF_PLAYER_LIST_COLLAPSE_STATES",playerListRecentTags:"OF_PLAYER_LIST_RECENT_TAGS"},K={panel:9998,panelOverlay:9999,modal:1e4,notification:2e4};function $e(){return`
    /* Body layout wrapper for flexbox */
    #of-game-layout-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
    }
    #of-game-content {
      flex: 1;
      overflow: auto;
      min-width: 0;
    }

    :root {
      --of-hud-accent: ${p.accent};
      --of-hud-accent-soft: ${p.accentMuted};
      --of-hud-accent-alt: ${p.accentAlt};
      --of-hud-border: ${p.border};
      --of-hud-border-strong: ${p.borderAccent};
      --of-hud-bg: ${p.bgPrimary};
      --of-hud-bg-2: ${p.bgSecondary};
      --of-hud-text: ${p.textPrimary};
    }

    @keyframes ofPanelEnter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .of-panel {
      position: fixed;
      background: linear-gradient(145deg, rgba(12, 18, 30, 0.98) 0%, rgba(10, 16, 26, 0.94) 60%, rgba(8, 12, 20, 0.96) 100%);
      border: 1px solid ${p.border};
      border-radius: ${M.lg};
      box-shadow: ${V.lg};
      font-family: ${L.body};
      color: ${p.textPrimary};
      user-select: none;
      z-index: ${K.panel};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: ofPanelEnter ${y.slow} ease;
    }
    .of-panel input[type="checkbox"] { accent-color: ${p.accent}; }
    .of-panel.hidden { display: none; }
    .of-header {
      padding: ${f.md} ${f.lg};
      background: linear-gradient(90deg, rgba(20, 30, 46, 0.85), rgba(12, 18, 30, 0.6));
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      font-size: 0.85em;
      border-bottom: 1px solid ${p.border};
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }
    .of-header-title {
      display: flex;
      align-items: center;
      gap: ${f.sm};
    }
    .of-player-list-title {
      font-size: 1em;
      color: ${p.textPrimary};
    }
    .of-player-list-header {
      position: relative;
    }
    .of-player-list-header::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(46, 211, 241, 0.7), transparent);
      pointer-events: none;
    }
    .discovery-header {
      cursor: pointer;
      gap: ${f.sm};
      padding: ${f.sm} ${f.md};
      font-size: 0.85em;
      position: relative;
    }
    .discovery-header:hover {
      background: ${p.bgHover};
    }
    .discovery-header::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(46, 211, 241, 0.7), transparent);
      pointer-events: none;
    }
    .discovery-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .discovery-title-text {
      color: ${p.textPrimary};
      font-weight: 700;
    }
    .discovery-title-sub {
      font-size: 0.72em;
      color: ${p.textMuted};
      letter-spacing: 0.2em;
    }
    .of-content { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(80,110,160,0.4) transparent; }
    .of-content::-webkit-scrollbar { width: 7px; }
    .of-content::-webkit-scrollbar-thumb { background: rgba(80,110,160,0.4); border-radius: 5px; }
    .of-footer {
      padding: ${f.sm} ${f.lg};
      display: flex;
      justify-content: space-between;
      background: ${p.bgSecondary};
      flex-shrink: 0;
      border-top: 1px solid ${p.border};
    }
    .of-button {
      background: ${p.bgHover};
      border: 1px solid ${p.border};
      color: ${p.textPrimary};
      padding: ${f.sm} ${f.md};
      border-radius: ${M.md};
      cursor: pointer;
      font-size: 0.95em;
      font-weight: 600;
      transition: background ${y.fast}, border-color ${y.fast}, color ${y.fast};
      outline: none;
    }
    .of-button:hover { background: rgba(80,110,160,0.5); border-color: ${p.borderAccent}; }
    .of-button.primary { background: ${p.accent}; color: #04131a; }
    .of-button.primary:hover { background: ${p.accentHover}; }
    .of-input {
      padding: ${f.sm};
      background: rgba(20, 30, 46, 0.7);
      border: 1px solid ${p.border};
      border-radius: ${M.md};
      color: ${p.textPrimary};
      font-size: 0.95em;
      outline: none;
      transition: border ${y.fast};
    }
    .of-input:focus { border-color: ${p.accent}; }
    .of-badge {
      background: ${p.accentMuted};
      border: 1px solid ${p.borderAccent};
      border-radius: ${M.xl};
      padding: 2px 10px;
      font-size: 0.75em;
      color: ${p.textPrimary};
    }
    .of-toggle {
      width: 34px;
      height: 18px;
      border-radius: 11px;
      background: rgba(35, 48, 70, 0.9);
      border: 1px solid ${p.border};
      position: relative;
      transition: background ${y.fast}, border-color ${y.fast};
      cursor: pointer;
    }
    .of-toggle.on { background: ${p.successSolid}; }
    .of-toggle-ball {
      position: absolute; left: 2px; top: 2px; width: 14px; height: 14px;
      border-radius: 50%; background: #fff; transition: left ${y.fast};
    }
    .of-toggle.on .of-toggle-ball { left: 18px; }

    .of-player-list-container {
      width: var(--player-list-width, 320px);
      min-width: 240px;
      max-width: 50vw;
      height: 100vh;
      flex-shrink: 0;
      position: relative;
      background: linear-gradient(180deg, rgba(12, 18, 30, 0.98), rgba(8, 12, 20, 0.95));
      border: 1px solid ${p.border};
      border-left: 1px solid ${p.borderAccent};
      border-radius: 0;
      box-shadow: ${V.lg};
      font-family: ${L.body};
      color: ${p.textPrimary};
      user-select: none;
      z-index: ${K.panel};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      resize: none;
    }
    .of-discovery-slot {
      width: 100%;
      flex-shrink: 0;
    }
    .of-resize-handle {
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, ${p.accent}, rgba(46, 211, 241, 0.1));
      cursor: ew-resize;
      z-index: ${K.panel+1};
      opacity: 0.35;
      transition: opacity ${y.fast}, box-shadow ${y.fast};
    }
    .of-resize-handle:hover {
      opacity: 0.8;
      box-shadow: 0 0 12px rgba(46, 211, 241, 0.4);
    }
    .of-resize-handle.dragging {
      opacity: 1;
    }
    .of-player-list-count { font-size: 0.72em; letter-spacing: 0.12em; font-family: ${L.mono}; }
    .of-player-debug-info { font-size: 0.75em; color: rgba(148, 170, 210, 0.7); padding: 2px 6px; display: none; font-family: ${L.mono}; }

    .of-quick-tag-switch {
      padding: ${f.md} ${f.lg};
      background: rgba(14, 22, 34, 0.75);
      border-bottom: 1px solid ${p.border};
      display: flex;
      align-items: center;
      gap: ${f.sm};
      flex-shrink: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
    }
    .of-quick-tag-switch::-webkit-scrollbar { height: 5px; }
    .of-quick-tag-switch::-webkit-scrollbar-thumb { background: rgba(80,110,160,0.45); border-radius: 4px; }
    .of-quick-tag-label {
      font-size: 0.75em;
      color: ${p.textMuted};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .of-quick-tag-item {
      display: flex;
      align-items: center;
      gap: ${f.xs};
    }
    .of-quick-tag-btn {
      padding: 4px 12px;
      font-size: 0.8em;
      background: rgba(22, 34, 52, 0.9);
      color: ${p.textPrimary};
      border: 1px solid ${p.border};
      border-radius: ${M.md};
      cursor: pointer;
      transition: all ${y.fast};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }
    .of-quick-tag-btn:hover {
      background: ${p.accentMuted};
      border-color: ${p.accent};
    }
    .of-quick-tag-remove {
      width: 16px;
      height: 16px;
      padding: 0;
      font-size: 11px;
      line-height: 1;
      background: rgba(255, 125, 135, 0.15);
      color: ${p.error};
      border: 1px solid rgba(255, 125, 135, 0.6);
      border-radius: 50%;
      cursor: pointer;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background ${y.fast}, border-color ${y.fast}, transform ${y.fast};
    }
    .of-quick-tag-remove:hover {
      background: rgba(255, 117, 117, 0.25);
      border-color: ${p.error};
      transform: scale(1.05);
    }

    .of-clan-checkbox-filter {
      padding: ${f.md} ${f.lg};
      background: rgba(14, 22, 34, 0.75);
      border-bottom: 1px solid ${p.border};
      display: flex;
      align-items: center;
      gap: ${f.sm};
      flex-shrink: 0;
    }
    .of-clan-checkbox-filter input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin: 0;
    }
    .of-clan-checkbox-filter label {
      cursor: pointer;
      color: ${p.textPrimary};
      font-size: 0.85em;
      user-select: none;
      flex: 1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }

    .of-team-group {
      position: relative;
      padding: 12px ${f.md} 6px ${f.md};
    }
    .of-team-group + .of-team-group {
      border-top: 1px dashed rgba(90, 110, 150, 0.35);
    }
    .of-team-group.current-player-team .of-team-band {
      border-left-width: 5px;
      box-shadow: 0 0 12px var(--team-color, ${p.accent});
    }
    .of-team-band {
      position: absolute;
      inset: 0;
      border-left: 3px solid var(--team-color, ${p.accent});
      background: transparent;
      pointer-events: none;
    }
    .of-team-header {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: ${f.xs};
      padding: 4px 10px;
      border-radius: ${M.xl};
      border: 1px solid var(--team-color, ${p.borderAccent});
      background: rgba(10, 16, 28, 0.7);
      font-size: 0.7em;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--team-color, ${p.textPrimary});
      font-family: ${L.display};
      margin-bottom: ${f.xs};
    }
    .of-team-group.current-player-team .of-team-header::before {
      content: "\u25C6";
      color: var(--team-color, ${p.accent});
      font-size: 0.85em;
      margin-right: 2px;
    }
    .of-team-label {
      font-weight: 700;
    }
    .of-team-count {
      color: ${p.textSecondary};
      font-size: 0.85em;
      letter-spacing: 0.1em;
      font-family: ${L.mono};
      margin-left: ${f.xs};
    }

    .of-clan-group {
      margin: 8px ${f.md};
      border: 1px solid rgba(90, 110, 150, 0.35);
      border-radius: ${M.md};
      background: rgba(14, 20, 32, 0.78);
      overflow: hidden;
      box-shadow: 0 10px 18px rgba(2, 6, 16, 0.35);
      --clan-color: ${p.accent};
      --clan-color-soft: rgba(46, 211, 241, 0.14);
      --clan-color-strong: rgba(46, 211, 241, 0.28);
      --clan-color-border: rgba(46, 211, 241, 0.6);
    }
    .of-clan-group.of-clan-group-neutral {
      --clan-color: rgba(150, 165, 190, 0.5);
      --clan-color-soft: rgba(90, 105, 130, 0.2);
      --clan-color-strong: rgba(120, 135, 170, 0.35);
      --clan-color-border: rgba(120, 135, 170, 0.6);
    }
    .of-clan-group-enter {
      animation: clanGroupEnter ${y.slow} cubic-bezier(.27,.82,.48,1.06) forwards;
    }
    @keyframes clanGroupEnter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .of-clan-group-exit {
      animation: clanGroupExit 0.25s cubic-bezier(.51,.01,1,1.01) forwards;
    }
    @keyframes clanGroupExit {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
    .of-clan-group-header {
      padding: calc(${f.sm} - 2px) ${f.md};
      background: linear-gradient(90deg, var(--clan-color-soft), rgba(22, 32, 48, 0.9) 65%);
      border-left: 3px solid var(--clan-color-border);
      cursor: default;
      display: flex;
      align-items: center;
      gap: ${f.sm};
      transition: background ${y.fast}, border-color ${y.fast};
      flex-wrap: wrap;
      font-family: ${L.display};
    }
    .of-clan-group-header:hover {
      background: linear-gradient(90deg, var(--clan-color-strong), rgba(28, 40, 60, 0.95) 65%);
    }
    .of-clan-arrow {
      font-size: 0.8em;
      color: ${p.textSecondary};
      transition: transform ${y.fast};
      width: 16px;
      display: inline-block;
    }
    .of-clan-group.collapsed .of-clan-arrow {
      transform: rotate(-90deg);
    }
    .of-clan-tag {
      font-weight: 700;
      color: ${p.textPrimary};
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-family: ${L.display};
    }
    .of-clan-you-badge {
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      padding: 2px 6px;
      border-radius: ${M.xl};
      border: 1px solid var(--clan-color-border);
      background: var(--clan-color-soft);
      color: ${p.textPrimary};
      font-family: ${L.mono};
    }
    .of-clan-count {
      font-size: 0.75em;
      color: ${p.textPrimary};
      background: var(--clan-color-soft);
      padding: 2px 7px;
      border-radius: ${M.xl};
      border: 1px solid var(--clan-color-border);
      letter-spacing: 0.1em;
      font-family: ${L.mono};
    }
    .of-clan-actions {
      display: flex;
      gap: ${f.xs};
      flex-wrap: wrap;
      align-items: center;
      margin-left: auto;
    }
    .of-clan-stats {
      display: flex;
      gap: ${f.xs};
      font-size: 0.66em;
      color: ${p.textSecondary};
      flex-wrap: wrap;
      font-family: ${L.mono};
      line-height: 1.2;
    }
    .of-clan-stats span {
      white-space: nowrap;
    }
    .of-clan-use-btn {
      padding: 4px 10px;
      font-size: 0.75em;
      background: rgba(46, 211, 241, 0.15);
      color: ${p.textPrimary};
      border: 1px solid ${p.borderAccent};
      border-radius: ${M.sm};
      cursor: pointer;
      transition: all ${y.fast};
      font-weight: 700;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }
    .of-clan-use-btn:hover {
      background: ${p.accent};
      border-color: ${p.accent};
      color: #04131a;
    }
    .of-clan-group-players {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 10px 12px 10px;
      overflow: visible;
      transition: max-height ${y.normal} ease-in-out, opacity ${y.normal} ease-in-out;
      border-top: 1px solid rgba(60, 80, 120, 0.35);
    }
    .of-clan-group.collapsed .of-clan-group-players {
      max-height: 0;
      padding: 0;
      opacity: 0;
      overflow: hidden;
    }
    .of-clan-group-players .of-player-item {
      display: inline-flex;
      padding: 4px 10px;
      border: 1px solid var(--clan-color-border);
      border-radius: ${M.sm};
      background: var(--clan-color-soft);
      cursor: default;
      transition: background ${y.fast}, border-color ${y.fast}, transform ${y.fast};
      font-size: 0.85em;
    }
    .of-clan-group-players .of-player-item:hover {
      background: var(--clan-color-strong);
      border-color: var(--clan-color);
      transform: translateY(-1px);
    }
    .of-solo-players {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 10px 12px 10px;
      border-top: 1px dashed rgba(70, 90, 120, 0.35);
    }
    .of-solo-players .of-player-item {
      display: inline-flex;
      padding: 4px 10px;
      border: 1px solid var(--player-accent-border, rgba(120, 135, 170, 0.5));
      border-radius: ${M.sm};
      background: var(--player-accent-soft, rgba(90, 105, 130, 0.18));
      cursor: default;
      transition: background ${y.fast}, border-color ${y.fast}, transform ${y.fast};
      font-size: 0.85em;
    }
    .of-solo-players .of-player-item:hover {
      background: var(--player-accent-strong, rgba(120, 135, 170, 0.28));
      border-color: var(--player-accent, rgba(150, 165, 190, 0.6));
      transform: translateY(-1px);
    }
    .of-player-list-content { flex: 1; padding: ${f.xs} 0; }
    /* Base player item styles (for untagged players) */
    .of-player-list-content > .of-player-item {
      padding: 6px ${f.md};
      border-bottom: 1px solid rgba(60, 80, 120, 0.35);
      font-size: 0.85em;
      line-height: 1.4;
      position: relative;
      transition: background-color ${y.slow}, border-color ${y.slow};
      cursor: default;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .of-player-list-content > .of-player-item:hover {
      background: rgba(24, 34, 52, 0.7);
      border-bottom-color: rgba(80, 110, 160, 0.5);
    }
    .of-player-item.of-player-item-accent {
      border-left: 3px solid var(--player-accent-border, rgba(120, 135, 170, 0.6));
      background: var(--player-accent-soft, rgba(120, 135, 170, 0.18));
    }
    .of-clan-group-players .of-player-item.of-player-item-clanmate {
      border-left: 4px solid var(--clan-color, ${p.accent});
      background: var(--clan-color);
      box-shadow: 0 0 0 1px var(--clan-color-border) inset, 0 0 12px rgba(46, 211, 241, 0.3);
      color: #fff;
      text-shadow: 0 1px 2px rgba(6, 10, 18, 0.8);
    }
    .of-player-name { color: ${p.textPrimary}; white-space: nowrap; overflow: visible; font-weight: 400; flex: 1; }
    .of-player-highlighted { background: linear-gradient(90deg, ${p.highlight} 40%, rgba(46, 211, 241, 0.05)); border-left: 3px solid ${p.accent}; }
    .of-player-enter { animation: playerEnter ${y.slow} cubic-bezier(.27,.82,.48,1.06) forwards; }
    .of-player-enter-stagger-1 { animation-delay: 30ms; }
    .of-player-enter-stagger-2 { animation-delay: 60ms; }
    .of-player-enter-stagger-3 { animation-delay: 90ms; }
    .of-player-enter-stagger-4 { animation-delay: 120ms; }
    .of-player-enter-highlight { background-color: rgba(110,160,255,0.14) !important; }
    .of-player-exit-highlight { background-color: rgba(220, 70, 90, 0.18); }
    .of-player-exit { animation: playerExit 0.25s cubic-bezier(.51,.01,1,1.01) forwards; }
    @keyframes playerEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes playerExit { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
    .of-player-list-footer { padding: ${f.sm} ${f.lg}; display: flex; justify-content: space-between; background: ${p.bgSecondary}; font-size: 0.95em; flex-shrink: 0; border-top: 1px solid ${p.border}; }
    .of-player-list-button { background: ${p.bgHover}; border: 1px solid ${p.border}; color: ${p.textPrimary}; padding: 6px 13px; border-radius: ${M.md}; cursor: pointer; font-size: 0.9em; font-weight: 600; transition: background ${y.fast}, border-color ${y.fast}; outline: none; }
    .of-player-list-button:hover { background: rgba(80,110,160,0.5); border-color: ${p.borderAccent}; }

    .discovery-panel {
      position: relative;
      width: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      border: none;
      border-bottom: 1px solid ${p.border};
      border-radius: 0;
      box-shadow: none;
      transition: opacity ${y.slow}, transform ${y.slow};
      cursor: default;
    }
    .discovery-panel::after { display: none; }
    .discovery-panel.hidden { display: none; }
    .discovery-body { display: flex; flex-direction: column; }
    .discovery-content { display: flex; flex-direction: column; gap: ${f.sm}; padding: ${f.sm} ${f.md} ${f.md}; }
    .discovery-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: ${f.sm};
      flex-wrap: wrap;
      padding: ${f.sm} ${f.md};
      background: rgba(18, 26, 40, 0.75);
      border: 1px solid ${p.border};
      border-radius: ${M.md};
    }
    .discovery-action-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: ${f.sm};
    }
    .discovery-modes {
      display: flex;
      flex-direction: column;
      gap: ${f.xs};
    }
    .discovery-modes-rail {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px ${f.sm};
      border-radius: ${M.md};
      border: 1px solid ${p.border};
      background: rgba(14, 22, 34, 0.55);
      cursor: pointer;
      transition: background ${y.fast}, border-color ${y.fast};
    }
    .discovery-modes-rail:hover {
      border-color: ${p.borderAccent};
      background: rgba(20, 30, 46, 0.75);
    }
    .discovery-modes-caret {
      color: ${p.textMuted};
      font-size: 0.9em;
      transition: transform ${y.fast}, color ${y.fast};
    }
    .discovery-modes-label {
      font-size: 0.7em;
      color: ${p.textMuted};
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-family: ${L.display};
      margin-right: 2px;
    }
    .discovery-modes-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: ${p.textMuted};
      opacity: 0.7;
    }
    .discovery-modes-body {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      margin-top: 0;
      transition: max-height ${y.slow}, opacity ${y.fast}, margin-top ${y.fast};
    }
    .discovery-modes.is-expanded .discovery-modes-body {
      max-height: 2000px;
      opacity: 1;
      margin-top: ${f.xs};
    }
    .discovery-modes.is-expanded .discovery-modes-caret {
      transform: rotate(90deg);
      color: ${p.textPrimary};
    }
    .discovery-clanmate-button {
      width: 100%;
      background: rgba(22, 34, 52, 0.9);
      border: 1px solid ${p.border};
      color: ${p.textPrimary};
      padding: ${f.sm} ${f.md};
      border-radius: ${M.md};
      font-size: 0.8em;
      font-weight: 700;
      cursor: pointer;
      transition: background ${y.fast}, border-color ${y.fast};
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }
    .discovery-clanmate-button:hover { background: rgba(30, 44, 66, 0.95); border-color: ${p.borderAccent}; }
    .discovery-clanmate-button.armed { background: ${p.accent}; border-color: ${p.accentHover}; color: #04131a; box-shadow: 0 0 12px rgba(46, 211, 241, 0.35); }
    .discovery-clanmate-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .discovery-config-grid { display: flex; flex-direction: column; gap: ${f.sm}; }
    .discovery-config-card { flex: 1 1 auto; min-width: 0; width: 100%; background: rgba(14, 22, 34, 0.7); border: 1px solid ${p.border}; border-radius: ${M.md}; }
    .discovery-mode-inner {
      display: flex;
      flex-direction: column;
      gap: ${f.xs};
      margin-top: ${f.xs};
    }
    .discovery-section {
      display: flex;
      flex-direction: column;
      gap: ${f.xs};
    }
    .discovery-section-title {
      font-size: 0.72em;
      color: ${p.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-family: ${L.display};
      margin-top: ${f.xs};
    }
    .discovery-footer { align-items: center; justify-content: flex-start; gap: ${f.sm}; flex-wrap: wrap; padding: ${f.sm} ${f.md}; background: rgba(14, 22, 34, 0.75); border-top: 1px solid ${p.border}; }
    .discovery-main-button {
      width: auto;
      flex: 1 1 160px;
      padding: ${f.sm} ${f.md};
      border: 1px solid ${p.border};
      border-radius: ${M.md};
      font-size: 0.8em;
      font-weight: 700;
      cursor: pointer;
      transition: all ${y.slow};
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: ${L.display};
    }
    .discovery-main-button.active { background: ${p.accent}; color: #04131a; border-color: ${p.accentHover}; box-shadow: 0 0 14px rgba(46, 211, 241, 0.35); }
    .discovery-main-button.inactive { background: rgba(28, 38, 58, 0.9); color: ${p.textSecondary}; }
    .discovery-mode-config { margin-bottom: ${f.xs}; padding: ${f.sm}; background: rgba(18, 26, 40, 0.8); border-radius: ${M.md}; border: 1px solid rgba(90, 110, 150, 0.35); }
    .mode-checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 6px;
      font-size: 0.8em;
      color: ${p.textPrimary};
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-family: ${L.display};
    }
    .mode-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .player-filter-info { margin-bottom: 4px; padding: 2px 0; }
    .player-filter-info small { color: ${p.textSecondary}; font-size: 0.8em; }
    .capacity-range-wrapper { margin-top: 4px; }
    .capacity-range-visual { position: relative; padding: 8px 0 4px 0; }
    .capacity-track { position: relative; height: 6px; background: rgba(46, 211, 241, 0.2); border-radius: 3px; margin-bottom: ${f.sm}; }
    .team-count-options-centered { display: flex; justify-content: space-between; gap: 10px; margin: ${f.xs} 0; }
    .team-count-column { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; background: rgba(12, 18, 30, 0.6); padding: 5px; border-radius: ${M.sm}; border: 1px solid rgba(90, 110, 150, 0.25); }
    .team-count-column label { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.78em; color: ${p.textPrimary}; white-space: nowrap; user-select: none; }
    .team-count-column input[type="checkbox"] { width: 16px; height: 16px; margin: 0; }
    .select-all-btn { background: rgba(46, 211, 241, 0.15); color: ${p.textPrimary}; border: 1px solid ${p.borderAccent}; border-radius: ${M.sm}; padding: ${f.xs} ${f.sm}; font-size: 0.75em; cursor: pointer; flex: 1; text-align: center; margin: 0 2px; text-transform: uppercase; letter-spacing: 0.1em; font-family: ${L.display}; }
    .select-all-btn:hover { background: rgba(46, 211, 241, 0.25); }
    .team-count-section > div:first-of-type { display: flex; gap: 5px; margin-bottom: ${f.xs}; }
    .team-count-section > label { font-size: 0.8em; color: ${p.textPrimary}; font-weight: 600; margin-bottom: 4px; display: block; text-transform: uppercase; letter-spacing: 0.08em; font-family: ${L.display}; }
    .capacity-labels { display: flex; justify-content: space-between; align-items: center; margin-top: ${f.sm}; }
    .three-times-checkbox { display: flex; align-items: center; gap: ${f.xs}; font-size: 0.78em; color: ${p.textPrimary}; margin: 0 5px; }
    .three-times-checkbox input[type="checkbox"] { width: 15px; height: 15px; }
    .capacity-range-fill { position: absolute; height: 100%; background: rgba(46, 211, 241, 0.5); border-radius: 3px; pointer-events: none; opacity: 0.7; transition: left 0.1s ease, width 0.1s ease; }
    .capacity-slider { position: absolute; width: 100%; height: 6px; top: 0; left: 0; background: transparent; outline: none; -webkit-appearance: none; pointer-events: none; margin: 0; }
    .capacity-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${p.accent}; cursor: pointer; pointer-events: all; border: 2px solid rgba(5, 20, 26, 0.9); box-shadow: ${V.sm}; }
    .capacity-slider-min { z-index: 2; }
    .capacity-slider-max { z-index: 1; }
    .capacity-label-group { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .capacity-label-group label { font-size: 0.8em; color: ${p.textSecondary}; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-family: ${L.display}; }
    .capacity-value { font-size: 0.85em; color: #FFFFFF; font-weight: 600; min-width: 40px; text-align: center; }
    .capacity-inputs-hidden { display: none; }
    .discovery-status { display: flex; align-items: center; gap: 8px; cursor: pointer; white-space: nowrap; flex-wrap: wrap; }
    @keyframes statusPulse {
      0% { box-shadow: 0 0 0 0 rgba(20, 220, 170, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(20, 220, 170, 0); }
      100% { box-shadow: 0 0 0 0 rgba(20, 220, 170, 0); }
    }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: ${p.success}; box-shadow: 0 0 10px rgba(20, 220, 170, 0.4); }
    .status-indicator.active { animation: statusPulse 2s infinite; }
    .status-indicator.inactive { animation: none; box-shadow: none; }
    .status-text { font-size: 0.8em; color: ${p.textPrimary}; text-transform: uppercase; letter-spacing: 0.12em; font-family: ${L.display}; }
    .search-timer { font-size: 0.8em; color: rgba(147, 197, 253, 0.9); font-weight: 500; font-family: ${L.mono}; }
    .discovery-settings { display: flex; align-items: center; gap: ${f.sm}; flex-wrap: wrap; }
    .discovery-toggle-label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.8em; color: ${p.textPrimary}; font-family: ${L.display}; text-transform: uppercase; letter-spacing: 0.08em; }
    .discovery-toggle-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .current-game-info { margin: 6px 0; padding: 6px ${f.sm}; background: rgba(46, 211, 241, 0.1); border-radius: ${M.sm}; font-size: 0.8em; color: rgba(147, 197, 253, 0.9); text-align: center; border: 1px solid rgba(46, 211, 241, 0.25); }
    .current-game-info.not-applicable { background: rgba(100, 100, 100, 0.1); color: ${p.textMuted}; border-color: rgba(100, 100, 100, 0.2); font-style: italic; }
    .game-found-notification {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: linear-gradient(135deg, rgba(12, 20, 32, 0.95) 0%, rgba(10, 16, 28, 0.9) 100%);
      border: 1px solid ${p.borderAccent};
      border-radius: ${M.lg};
      padding: ${f.xl} 30px;
      z-index: ${K.notification};
      color: ${p.textPrimary};
      font-family: ${L.display};
      font-size: 0.9em;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      box-shadow: ${V.md};
      transition: transform ${y.slow}, opacity ${y.slow};
      opacity: 0;
      min-width: 300px;
      max-width: 520px;
    }
    .game-found-notification .notification-title {
      font-size: 1.1em;
    }
    .game-found-notification .notification-detail {
      font-size: 0.85em;
      margin-top: ${f.sm};
      text-transform: none;
      letter-spacing: 0.06em;
      color: ${p.textSecondary};
      font-family: ${L.mono};
    }
    .game-found-notification .notification-hint {
      font-size: 0.7em;
      margin-top: 6px;
      text-transform: none;
      letter-spacing: 0.08em;
      color: ${p.textMuted};
    }
    .game-found-notification.notification-visible { transform: translateX(-50%) translateY(0); opacity: 1; }
    .game-found-notification.notification-dismissing { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    .game-found-notification:hover { background: rgba(16, 26, 40, 0.96); border-color: ${p.accentHover}; box-shadow: 0 0 18px rgba(46, 211, 241, 0.2); }
  `}var J={gameFoundAudio:null,gameStartAudio:null,audioUnlocked:!1,preloadSounds(){try{this.gameFoundAudio=new Audio("https://github.com/DeLoWaN/openfront-autojoin-lobby/raw/refs/heads/main/notification_sounds/new-notification-014-363678.mp3"),this.gameFoundAudio.volume=.5,this.gameFoundAudio.preload="auto",this.gameStartAudio=new Audio("https://github.com/DeLoWaN/openfront-autojoin-lobby/raw/refs/heads/main/notification_sounds/opening-bell-421471.mp3"),this.gameStartAudio.volume=.5,this.gameStartAudio.preload="auto",this.setupAudioUnlock()}catch(a){console.warn("[SoundUtils] Could not preload audio:",a)}},setupAudioUnlock(){let a=()=>{if(this.audioUnlocked)return;let e=[];this.gameFoundAudio&&(this.gameFoundAudio.volume=.01,e.push(this.gameFoundAudio.play().then(()=>{this.gameFoundAudio&&(this.gameFoundAudio.pause(),this.gameFoundAudio.currentTime=0,this.gameFoundAudio.volume=.5)}).catch(()=>{}))),this.gameStartAudio&&(this.gameStartAudio.volume=.01,e.push(this.gameStartAudio.play().then(()=>{this.gameStartAudio&&(this.gameStartAudio.pause(),this.gameStartAudio.currentTime=0,this.gameStartAudio.volume=.5)}).catch(()=>{}))),Promise.all(e).then(()=>{this.audioUnlocked=!0,console.log("[SoundUtils] Audio unlocked successfully"),document.removeEventListener("click",a),document.removeEventListener("keydown",a),document.removeEventListener("touchstart",a)})};document.addEventListener("click",a,{once:!0}),document.addEventListener("keydown",a,{once:!0}),document.addEventListener("touchstart",a,{once:!0})},playGameFoundSound(){this.gameFoundAudio?(console.log("[SoundUtils] Attempting to play game found sound"),this.gameFoundAudio.currentTime=0,this.gameFoundAudio.play().catch(a=>{console.warn("[SoundUtils] Failed to play game found sound:",a)})):console.warn("[SoundUtils] Game found audio not initialized")},playGameStartSound(){this.gameStartAudio?(console.log("[SoundUtils] Attempting to play game start sound"),this.gameStartAudio.currentTime=0,this.gameStartAudio.play().catch(a=>{console.warn("[SoundUtils] Failed to play game start sound:",a)})):console.warn("[SoundUtils] Game start audio not initialized")}};var q={callbacks:[],lastUrl:location.href,initialized:!1,init(){if(this.initialized)return;this.initialized=!0;let a=()=>{location.href!==this.lastUrl&&(this.lastUrl=location.href,this.notify())};window.addEventListener("popstate",a),window.addEventListener("hashchange",a);let e=history.pushState,t=history.replaceState;history.pushState=function(...r){e.apply(history,r),setTimeout(a,0)},history.replaceState=function(...r){t.apply(history,r),setTimeout(a,0)},setInterval(a,200)},subscribe(a){this.callbacks.push(a),this.init()},notify(){this.callbacks.forEach(a=>a(location.href))}};var se={subscribers:[],ws:null,fallbackInterval:null,lastLobbies:[],pollingRate:Q.lobbyPollingRate,wsConnectionAttempts:0,maxWsAttempts:3,reconnectTimeout:null,start(){this.ws||this.fallbackInterval||(console.log("[Bundle] Starting LobbyDataManager with WebSocket"),this.wsConnectionAttempts=0,this.connectWebSocket())},stop(){this.ws&&(this.ws.close(),this.ws=null),this.reconnectTimeout&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null),this.stopFallbackPolling()},subscribe(a){this.subscribers.push(a)},connectWebSocket(){try{let e=`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}/lobbies`;this.ws=new WebSocket(e),this.ws.addEventListener("open",()=>{console.log("[Bundle] WebSocket connected"),this.wsConnectionAttempts=0,this.stopFallbackPolling(),this.reconnectTimeout&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null)}),this.ws.addEventListener("message",t=>{try{let r=JSON.parse(t.data);r.type==="lobbies_update"&&(this.lastLobbies=r.data?.lobbies??[],this.notifySubscribers())}catch(r){console.error("[Bundle] WebSocket parse error:",r)}}),this.ws.addEventListener("close",()=>{console.log("[Bundle] WebSocket disconnected"),this.ws=null,this.wsConnectionAttempts++,this.wsConnectionAttempts>=this.maxWsAttempts?(console.log("[Bundle] Max WebSocket attempts reached, falling back to HTTP"),this.startFallbackPolling()):this.reconnectTimeout=setTimeout(()=>this.connectWebSocket(),3e3)}),this.ws.addEventListener("error",t=>{console.error("[Bundle] WebSocket error:",t)})}catch(a){console.error("[Bundle] WebSocket connection error:",a),this.wsConnectionAttempts++,this.wsConnectionAttempts>=this.maxWsAttempts&&this.startFallbackPolling()}},startFallbackPolling(){this.fallbackInterval||(console.log("[Bundle] Starting HTTP fallback polling"),this.fetchData(),this.fallbackInterval=setInterval(()=>this.fetchData(),this.pollingRate))},stopFallbackPolling(){this.fallbackInterval&&(clearInterval(this.fallbackInterval),this.fallbackInterval=null)},async fetchData(){if(!(location.pathname!=="/"&&!location.pathname.startsWith("/public-lobby")))try{let a=await fetch("/api/public_lobbies");if(a.status===429){console.warn("[Bundle] Rate limited.");return}let e=await a.json();this.lastLobbies=e.lobbies||[],this.notifySubscribers()}catch(a){console.error("[Bundle] API Error:",a),this.lastLobbies=[],this.notifySubscribers()}},notifySubscribers(){this.subscribers.forEach(a=>a(this.lastLobbies))}};var Y={data:null,dataByTag:null,fetching:!1,fetched:!1,async fetch(){if(this.fetched||this.fetching)return this.data||[];this.fetching=!0;let a=async()=>{let e=await fetch("https://api.openfront.io/public/clans/leaderboard");if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()};try{let e=await a();this.data=e.clans||[],this.dataByTag=new Map;for(let t of this.data)this.dataByTag.set(t.clanTag.toLowerCase(),t);this.fetched=!0,console.log("[Bundle] Clan leaderboard cached:",this.data.length,"clans")}catch(e){console.warn("[Bundle] Clan fetch failed, retrying...",e instanceof Error?e.message:String(e)),await new Promise(t=>setTimeout(t,5e3));try{let t=await a();this.data=t.clans||[],this.dataByTag=new Map;for(let r of this.data)this.dataByTag.set(r.clanTag.toLowerCase(),r);this.fetched=!0,console.log("[Bundle] Clan leaderboard cached (retry):",this.data.length,"clans")}catch(t){console.error("[Bundle] Clan leaderboard unavailable:",t instanceof Error?t.message:String(t)),this.data=[],this.dataByTag=new Map,this.fetched=!0}}return this.fetching=!1,this.data||[]},getStats(a){return!this.dataByTag||!a?null:this.dataByTag.get(a.toLowerCase())||null}};var ke={Red:{r:235,g:51,b:51},Blue:{r:41,g:98,b:255},Teal:{r:43,g:212,b:189},Purple:{r:146,g:52,b:234},Yellow:{r:231,g:176,b:8},Orange:{r:249,g:116,b:21},Green:{r:65,g:190,b:82},Bot:{r:209,g:205,b:199},Humans:{r:41,g:98,b:255},Nations:{r:235,g:51,b:51}},Pe=["Red","Blue","Yellow","Green","Purple","Orange","Teal"],W=[{r:163,g:230,b:53},{r:132,g:204,b:22},{r:16,g:185,b:129},{r:52,g:211,b:153},{r:45,g:212,b:191},{r:74,g:222,b:128},{r:110,g:231,b:183},{r:134,g:239,b:172},{r:151,g:255,b:187},{r:186,g:255,b:201},{r:230,g:250,b:210},{r:34,g:197,b:94},{r:67,g:190,b:84},{r:82,g:183,b:136},{r:48,g:178,b:180},{r:230,g:255,b:250},{r:220,g:240,b:250},{r:233,g:213,b:255},{r:204,g:204,b:255},{r:220,g:220,b:255},{r:202,g:225,b:255},{r:147,g:197,b:253},{r:125,g:211,b:252},{r:99,g:202,b:253},{r:56,g:189,b:248},{r:96,g:165,b:250},{r:59,g:130,b:246},{r:79,g:70,b:229},{r:124,g:58,b:237},{r:147,g:51,b:234},{r:179,g:136,b:255},{r:167,g:139,b:250},{r:217,g:70,b:239},{r:168,g:85,b:247},{r:190,g:92,b:251},{r:192,g:132,b:252},{r:240,g:171,b:252},{r:244,g:114,b:182},{r:236,g:72,b:153},{r:220,g:38,b:38},{r:239,g:68,b:68},{r:235,g:75,b:75},{r:245,g:101,b:101},{r:248,g:113,b:113},{r:251,g:113,b:133},{r:253,g:164,b:175},{r:252,g:165,b:165},{r:255,g:204,b:229},{r:250,g:215,b:225},{r:251,g:235,b:245},{r:240,g:240,b:200},{r:250,g:250,b:210},{r:255,g:240,b:200},{r:255,g:223,b:186},{r:252,g:211,b:77},{r:251,g:191,b:36},{r:234,g:179,b:8},{r:202,g:138,b:4},{r:245,g:158,b:11},{r:251,g:146,b:60},{r:249,g:115,b:22},{r:234,g:88,b:12},{r:133,g:77,b:14}],j=[{r:35,g:0,b:0},{r:45,g:0,b:0},{r:55,g:0,b:0},{r:65,g:0,b:0},{r:75,g:0,b:0},{r:85,g:0,b:0},{r:95,g:0,b:0},{r:105,g:0,b:0},{r:115,g:0,b:0},{r:125,g:0,b:0},{r:135,g:0,b:0},{r:145,g:0,b:0},{r:155,g:0,b:0},{r:165,g:0,b:0},{r:175,g:0,b:0},{r:185,g:0,b:0},{r:195,g:0,b:5},{r:205,g:0,b:10},{r:215,g:0,b:15},{r:225,g:0,b:20},{r:235,g:0,b:25},{r:245,g:0,b:30},{r:255,g:0,b:35},{r:255,g:10,b:45},{r:255,g:20,b:55},{r:255,g:30,b:65},{r:255,g:40,b:75},{r:255,g:50,b:85},{r:255,g:60,b:95},{r:255,g:70,b:105},{r:255,g:80,b:115},{r:255,g:90,b:125},{r:255,g:100,b:135},{r:255,g:110,b:145},{r:255,g:120,b:155},{r:255,g:130,b:165},{r:255,g:140,b:175},{r:255,g:150,b:185},{r:255,g:160,b:195},{r:255,g:170,b:205},{r:255,g:180,b:215},{r:255,g:190,b:225},{r:255,g:200,b:235},{r:0,g:45,b:0},{r:0,g:55,b:0},{r:0,g:65,b:0},{r:0,g:75,b:0},{r:0,g:85,b:0},{r:0,g:95,b:0},{r:0,g:105,b:0},{r:0,g:115,b:0},{r:0,g:125,b:0},{r:0,g:135,b:0},{r:0,g:145,b:0},{r:0,g:155,b:0},{r:0,g:165,b:0},{r:0,g:175,b:0},{r:0,g:185,b:0},{r:0,g:195,b:5},{r:0,g:205,b:10},{r:0,g:215,b:15},{r:0,g:225,b:20},{r:0,g:235,b:25},{r:0,g:245,b:30},{r:0,g:255,b:35},{r:10,g:255,b:45},{r:20,g:255,b:55},{r:30,g:255,b:65},{r:40,g:255,b:75},{r:50,g:255,b:85},{r:60,g:255,b:95},{r:70,g:255,b:105},{r:80,g:255,b:115},{r:90,g:255,b:125},{r:100,g:255,b:135},{r:110,g:255,b:145},{r:120,g:255,b:155},{r:130,g:255,b:165},{r:140,g:255,b:175},{r:150,g:255,b:185},{r:160,g:255,b:195},{r:170,g:255,b:205},{r:180,g:255,b:215},{r:190,g:255,b:225},{r:200,g:255,b:235},{r:0,g:0,b:35},{r:0,g:0,b:45},{r:0,g:0,b:55},{r:0,g:0,b:65},{r:0,g:0,b:75},{r:0,g:0,b:85},{r:0,g:0,b:95},{r:0,g:0,b:105},{r:0,g:0,b:115},{r:0,g:0,b:125},{r:0,g:0,b:135},{r:0,g:0,b:145},{r:0,g:0,b:155},{r:0,g:0,b:165},{r:0,g:0,b:175},{r:0,g:0,b:185},{r:5,g:0,b:195},{r:10,g:0,b:205},{r:15,g:0,b:215},{r:20,g:0,b:225},{r:25,g:0,b:235},{r:30,g:0,b:245},{r:35,g:0,b:255},{r:45,g:10,b:255},{r:55,g:20,b:255},{r:65,g:30,b:255},{r:75,g:40,b:255},{r:85,g:50,b:255},{r:95,g:60,b:255},{r:105,g:70,b:255},{r:115,g:80,b:255},{r:125,g:90,b:255},{r:135,g:100,b:255},{r:145,g:110,b:255},{r:155,g:120,b:255},{r:165,g:130,b:255},{r:175,g:140,b:255},{r:185,g:150,b:255},{r:195,g:160,b:255},{r:205,g:170,b:255},{r:215,g:180,b:255},{r:225,g:190,b:255},{r:235,g:200,b:255},{r:35,g:0,b:35},{r:45,g:0,b:45},{r:55,g:0,b:55},{r:65,g:0,b:65},{r:75,g:0,b:75},{r:85,g:0,b:85},{r:95,g:0,b:95},{r:105,g:0,b:105},{r:115,g:0,b:115},{r:125,g:0,b:125},{r:135,g:0,b:135},{r:145,g:0,b:145},{r:155,g:0,b:155},{r:165,g:0,b:165},{r:175,g:0,b:175},{r:185,g:0,b:185},{r:195,g:5,b:195},{r:205,g:10,b:205},{r:215,g:15,b:215},{r:225,g:20,b:225},{r:235,g:25,b:235},{r:245,g:30,b:245},{r:255,g:35,b:255},{r:255,g:45,b:255},{r:255,g:55,b:255},{r:255,g:65,b:255},{r:255,g:75,b:255},{r:255,g:85,b:255},{r:255,g:95,b:255},{r:255,g:105,b:255},{r:255,g:115,b:255},{r:255,g:125,b:255},{r:255,g:135,b:255},{r:255,g:145,b:255},{r:255,g:155,b:255},{r:255,g:165,b:255},{r:255,g:175,b:255},{r:255,g:185,b:255},{r:255,g:195,b:255},{r:255,g:205,b:255},{r:255,g:215,b:255},{r:0,g:35,b:35},{r:0,g:45,b:45},{r:0,g:55,b:55},{r:0,g:65,b:65},{r:0,g:75,b:75},{r:0,g:85,b:85},{r:0,g:95,b:95},{r:0,g:105,b:105},{r:0,g:115,b:115},{r:0,g:125,b:125},{r:0,g:135,b:135},{r:0,g:145,b:145},{r:0,g:155,b:155},{r:0,g:165,b:165},{r:0,g:175,b:175},{r:0,g:185,b:185},{r:5,g:195,b:195},{r:10,g:205,b:205},{r:15,g:215,b:215},{r:20,g:225,b:225},{r:25,g:235,b:235},{r:30,g:245,b:245},{r:35,g:255,b:255},{r:45,g:255,b:255},{r:55,g:255,b:255},{r:65,g:255,b:255},{r:75,g:255,b:255},{r:85,g:255,b:255},{r:95,g:255,b:255},{r:105,g:255,b:255},{r:115,g:255,b:255},{r:125,g:255,b:255},{r:135,g:255,b:255},{r:145,g:255,b:255},{r:155,g:255,b:255},{r:165,g:255,b:255},{r:175,g:255,b:255},{r:185,g:255,b:255},{r:195,g:255,b:255},{r:205,g:255,b:255},{r:215,g:255,b:255},{r:35,g:35,b:0},{r:45,g:45,b:0},{r:55,g:55,b:0},{r:65,g:65,b:0},{r:75,g:75,b:0},{r:85,g:85,b:0},{r:95,g:95,b:0},{r:105,g:105,b:0},{r:115,g:115,b:0},{r:125,g:125,b:0},{r:135,g:135,b:0},{r:145,g:145,b:0},{r:155,g:155,b:0},{r:165,g:165,b:0},{r:175,g:175,b:0},{r:185,g:185,b:0},{r:195,g:195,b:5},{r:205,g:205,b:10},{r:215,g:215,b:15},{r:225,g:225,b:20},{r:235,g:235,b:25},{r:245,g:245,b:30},{r:255,g:255,b:35},{r:255,g:255,b:45},{r:255,g:255,b:55},{r:255,g:255,b:65},{r:255,g:255,b:75},{r:255,g:255,b:85},{r:255,g:255,b:95},{r:255,g:255,b:105},{r:255,g:255,b:115},{r:255,g:255,b:125},{r:255,g:255,b:135},{r:255,g:255,b:145},{r:255,g:255,b:155},{r:255,g:255,b:165},{r:255,g:255,b:175},{r:255,g:255,b:185},{r:255,g:255,b:195},{r:255,g:255,b:205},{r:255,g:255,b:215},{r:215,g:255,b:200},{r:225,g:255,b:175},{r:240,g:250,b:160},{r:245,g:245,b:175},{r:150,g:200,b:255},{r:160,g:215,b:255},{r:170,g:225,b:255},{r:180,g:235,b:250},{r:190,g:245,b:240},{r:210,g:255,b:245},{r:220,g:255,b:255},{r:230,g:250,b:255},{r:240,g:240,b:255},{r:250,g:230,b:255},{r:170,g:190,b:255},{r:180,g:180,b:255},{r:200,g:170,b:255},{r:190,g:140,b:195},{r:195,g:145,b:200},{r:200,g:150,b:205},{r:205,g:155,b:210},{r:210,g:160,b:215},{r:215,g:165,b:220},{r:220,g:170,b:225},{r:225,g:175,b:230},{r:230,g:180,b:235},{r:235,g:185,b:240},{r:240,g:190,b:245},{r:245,g:195,b:250},{r:250,g:200,b:255},{r:255,g:205,b:255},{r:255,g:210,b:255},{r:255,g:210,b:250},{r:255,g:205,b:245},{r:255,g:215,b:245},{r:220,g:160,b:255},{r:235,g:150,b:255},{r:245,g:160,b:240},{r:255,g:170,b:225},{r:255,g:185,b:215},{r:255,g:195,b:235},{r:255,g:200,b:220},{r:255,g:210,b:230},{r:255,g:220,b:235},{r:255,g:220,b:250},{r:255,g:225,b:255},{r:255,g:230,b:245},{r:255,g:235,b:235},{r:255,g:215,b:195},{r:255,g:225,b:180},{r:255,g:230,b:190},{r:255,g:235,b:200},{r:255,g:245,b:210},{r:255,g:240,b:220}];var Z=class{constructor(e,t,r=null,o=200,l=50){this.isDragging=!1;this.startX=0;this.startWidth=0;this.el=e,this.onResize=t,this.storageKey=r,this.minWidth=o,this.maxWidthVw=l,this.handleMouseDown=this._handleMouseDown.bind(this),this.handleMouseMove=this._handleMouseMove.bind(this),this.handleMouseUp=this._handleMouseUp.bind(this),this.handle=this.createHandle(),e.appendChild(this.handle),r&&this.loadWidth()}createHandle(){let e=document.createElement("div");return e.className="of-resize-handle",e.addEventListener("mousedown",this.handleMouseDown),e}loadWidth(){if(!this.storageKey)return;let e=GM_getValue(this.storageKey,null);if(e&&e.width){let t=this.clampWidth(e.width);this.el.style.width=t+"px",this.onResize(t)}}saveWidth(){this.storageKey&&GM_setValue(this.storageKey,{width:this.el.offsetWidth})}clampWidth(e){let t=window.innerWidth*(this.maxWidthVw/100);return Math.max(this.minWidth,Math.min(e,t))}_handleMouseDown(e){e.preventDefault(),e.stopPropagation(),this.isDragging=!0,this.startX=e.clientX,this.startWidth=this.el.offsetWidth,this.handle.classList.add("dragging"),document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("mouseup",this.handleMouseUp)}_handleMouseMove(e){if(!this.isDragging)return;let t=this.startX-e.clientX,r=this.clampWidth(this.startWidth+t);this.el.style.width=r+"px",this.onResize(r)}_handleMouseUp(){this.isDragging&&(this.isDragging=!1,this.handle.classList.remove("dragging"),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp),this.saveWidth())}destroy(){this.handle.removeEventListener("mousedown",this.handleMouseDown),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp),this.handle.parentNode&&this.handle.parentNode.removeChild(this.handle)}};var O={lastActionTime:0,debounceDelay:800,getLobbyButton(){return document.querySelector("public-lobby")?.querySelector("button.group.relative.isolate")},canJoinLobby(){let a=document.querySelector("public-lobby");if(!a)return!1;let e=this.getLobbyButton();return!!(e&&!a.isLobbyHighlighted&&a.lobbies&&a.lobbies.length>0&&!e.disabled&&e.offsetParent!==null)},verifyState(a){let e=document.querySelector("public-lobby");if(!e)return!1;let t=this.getLobbyButton();return!t||t.disabled||t.offsetParent===null?!1:a==="in"?e.isLobbyHighlighted===!0:a==="out"?!!(!e.isLobbyHighlighted&&e.lobbies&&e.lobbies.length>0):!1},tryJoinLobby(){let a=Date.now();if(a-this.lastActionTime<this.debounceDelay)return!1;let e=this.getLobbyButton(),t=document.querySelector("public-lobby");return e&&t&&!t.isLobbyHighlighted&&t.lobbies&&t.lobbies.length>0&&!e.disabled&&e.offsetParent!==null?(this.lastActionTime=a,e.click(),setTimeout(()=>{this.verifyState("in")||console.warn("[LobbyUtils] Join may have failed, state not updated")},100),!0):!1},isOnLobbyPage(){let a=document.getElementById("page-game");if(a&&!a.classList.contains("hidden"))return!1;let e=document.querySelector("canvas");if(e&&e.offsetParent!==null){let l=e.getBoundingClientRect();if(l.width>100&&l.height>100)return!1}let t=document.querySelector("public-lobby");if(t&&t.offsetParent!==null)return!0;if(t&&t.offsetParent===null)return!1;let r=document.getElementById("page-play");if(r&&!r.classList.contains("hidden")&&t)return!0;let o=window.location.pathname.replace(/\/+$/,"")||"/";return o==="/"||o==="/public-lobby"}};var Ye=yt(Ve(),1);function te(a){return`rgb(${a.r},${a.g},${a.b})`}function F(a,e){return`rgba(${a.r},${a.g},${a.b},${e})`}var be=class{constructor(e){this.rng=(0,Ye.default)(String(e))}nextInt(e,t){return Math.floor(this.rng()*(t-e))+e}};function St(a){let e=0;for(let t=0;t<a.length;t++)e=(e<<5)-e+a.charCodeAt(t),e|=0;return Math.abs(e)}function me(a){let e=a/255;return e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4)}function Mt(a){let e=me(a.r),t=me(a.g),r=me(a.b),o=e*.4124+t*.3576+r*.1805,l=e*.2126+t*.7152+r*.0722,i=e*.0193+t*.1192+r*.9505;return{x:o*100,y:l*100,z:i*100}}function Et(a){let o=a.x/95.047,l=a.y/100,i=a.z/108.883,n=6/29,s=n*n*n,d=c=>c>s?Math.cbrt(c):c/(3*n*n)+4/29;return o=d(o),l=d(l),i=d(i),{l:116*l-16,a:500*(o-l),b:200*(l-i)}}function Ke(a){return Et(Mt(a))}function $t(a,e){let{l:t,a:r,b:o}=a,{l,a:i,b:n}=e,s=(t+l)/2,d=Math.sqrt(r*r+o*o),c=Math.sqrt(i*i+n*n),u=(d+c)/2,g=.5*(1-Math.sqrt(Math.pow(u,7)/(Math.pow(u,7)+Math.pow(25,7)))),m=(1+g)*r,h=(1+g)*i,C=Math.sqrt(m*m+o*o),x=Math.sqrt(h*h+n*n),$=(C+x)/2,k=Math.atan2(o,m)*(180/Math.PI),b=Math.atan2(n,h)*(180/Math.PI),v=k<0?k+360:k,T=b<0?b+360:b,w=T-v;Math.abs(w)>180&&(w+=w>0?-360:360);let S=l-t,I=x-C,A=2*Math.sqrt(C*x)*Math.sin(w*Math.PI/360),E=0;C*x===0?E=v+T:Math.abs(v-T)>180?E=(v+T+360)/2:E=(v+T)/2;let B=1-.17*Math.cos((E-30)*Math.PI/180)+.24*Math.cos(2*E*Math.PI/180)+.32*Math.cos((3*E+6)*Math.PI/180)-.2*Math.cos((4*E-63)*Math.PI/180),G=30*Math.exp(-Math.pow((E-275)/25,2)),z=2*Math.sqrt(Math.pow($,7)/(Math.pow($,7)+Math.pow(25,7))),_=1+.015*Math.pow(s-50,2)/Math.sqrt(20+Math.pow(s-50,2)),N=1+.045*$,Le=1+.015*$*B,dt=-Math.sin(2*G*Math.PI/180)*z,ut=1,Se=1,Me=1;return Math.sqrt(Math.pow(S/(_*ut),2)+Math.pow(I/(N*Se),2)+Math.pow(A/(Le*Me),2)+dt*(I/(N*Se))*(A/(Le*Me)))}function kt(a,e){let t=Ke(a),r=1/0;for(let o of e){let l=$t(t,Ke(o));l<r&&(r=l)}return r}function Pt(a,e){let t=-1/0,r=0;for(let o=0;o<a.length;o++){let l=kt(a[o],e);l>t&&(t=l,r=o)}return r}var U=class{constructor(e,t){this.assigned=new Map;this.baseColors=[...e],this.availableColors=[...e],this.fallbackColors=[...e,...t]}reset(){this.availableColors=[...this.baseColors],this.assigned.clear()}assignColor(e){if(this.assigned.has(e))return this.assigned.get(e);this.availableColors.length===0&&(this.availableColors=[...this.fallbackColors]);let t=0;if(this.assigned.size===0||this.assigned.size>50)t=new be(St(e)).nextInt(0,this.availableColors.length);else{let o=Array.from(this.assigned.values());t=Pt(this.availableColors,o)}let r=this.availableColors.splice(t,1)[0];return this.assigned.set(e,r),r}},X=class{constructor(){this.teamAllocator=new U(W,j)}reset(){this.teamAllocator.reset()}getTeamColor(e){let t=ke[e];return t||this.teamAllocator.assignColor(e)}getTeamColorMap(e){let t=new Map;for(let r of e)t.set(r,this.getTeamColor(r));return t}},Zt=new X,en=new U(W,j);var Xe={showPlayerCount:!0,animationsEnabled:!0,debug:!1};function D(a){if(!a)return null;let e=a.trim().match(/\[([a-zA-Z0-9]{2,5})\]/);return e?e[1]??null:null}function Je(a){return a&&a.replace(/^\[([a-zA-Z0-9]{2,5})\]\s?/,"")}function Qe(a,e){let t=null,r=0;for(let o of a){let l=e.get(o)??0;t!==null&&r<=l||(r=l,t=o)}return{team:t,teamSize:r}}function fe(a){if(!a)return null;if(a.playerTeams)return a.playerTeams;let e=a.teamCount??a.teams;return typeof e=="number"?e:null}function ne(a,e,t){if(!a||a.gameMode!=="Team")return[];let r=fe(a);if(r==="Humans Vs Nations")return["Humans","Nations"];let o=r==="Duos"||r==="Trios"||r==="Quads",l=2;if(typeof r=="number")l=Math.max(2,r);else{let i=r==="Duos"?2:r==="Trios"?3:r==="Quads"?4:2,n=a.maxClients??a.maxPlayers??a.maxPlayersPerGame??null,s=n!==null?Math.max(e,n):e;l=Math.max(2,Math.ceil((s+t)/i))}return o?Array.from({length:l},(i,n)=>`Team ${n+1}`):l<8?Pe.slice(0,l):Array.from({length:l},(i,n)=>`Team ${n+1}`)}function It(a,e){return Math.ceil(a/e)}function Ze(a,e,t){if(!e||e.gameMode!=="Team")return new Map;if(fe(e)==="Humans Vs Nations"){let l=new Map;for(let i of a){let n=D(i);n&&l.set(n.toLowerCase(),"Humans")}return l}let{clanTeamMap:o}=et(a,e,t);return o}function et(a,e,t){if(!e||e.gameMode!=="Team")return{teams:[],clanTeamMap:new Map,soloTeamMap:new Map};let r=fe(e),o=ne(e,a.length,t);if(o.length===0)return{teams:[],clanTeamMap:new Map,soloTeamMap:new Map};let l=new Map,i=new Map;if(r==="Humans Vs Nations"){for(let g of a){let m=D(g);m?l.set(m.toLowerCase(),"Humans"):i.set(g,"Humans")}return{teams:o,clanTeamMap:l,soloTeamMap:i}}let n=It(a.length+t,o.length),s=new Map,d=[];for(let g of a){let m=D(g),h={name:g,clan:m};m?(s.has(m)||s.set(m,[]),s.get(m).push(h)):d.push(h)}let c=Array.from(s.entries()).sort((g,m)=>m[1].length-g[1].length),u=new Map;for(let[g,m]of c){let{team:h,teamSize:C}=Qe(o,u);if(!h)continue;l.set(g.toLowerCase(),h);let x=C;for(let $ of m)x<n&&x++;u.set(h,x)}for(let g of d){let{team:m,teamSize:h}=Qe(o,u);m&&(i.set(g.name,m),u.set(m,h+1))}return{teams:o,clanTeamMap:l,soloTeamMap:i}}function tt(a,e,t,r,o){let{teams:l,clanTeamMap:i,soloTeamMap:n}=et(a,r,o);if(l.length===0)return[];let s=new Map;for(let d of l)s.set(d,{team:d,clanGroups:[],soloPlayers:[]});for(let d of e){let c=i.get(d.tag.toLowerCase());c&&s.has(c)&&s.get(c).clanGroups.push(d)}for(let d of t){let c=n.get(d);c&&s.has(c)&&s.get(c).soloPlayers.push(d)}return l.map(d=>s.get(d)).filter(d=>!!d)}function nt(a){if(!a)return null;let e=a.replace(/[^a-zA-Z0-9]/g,"").toLowerCase();return e.length>0?e:null}function rt(a){let e=new Map,t=[];for(let o of a){let l=D(o);if(l){let i=l.toLowerCase();e.has(i)?e.get(i).players.push(o):e.set(i,{tag:l,players:[o]})}else t.push(o)}return{clanGroups:Array.from(e.values()),untaggedPlayers:t}}function At(a){let e=0;for(let t=0;t<a.length;t++)e=(e<<5)-e+a.charCodeAt(t),e|=0;return Math.abs(e)}function at(a){return At(a)%Q.threadCount}async function ot(a,e){try{let t=await fetch(`/w${e}/api/game/${a}`);if(t.headers.get("content-type")?.includes("text/html"))throw new Error("Game started");return await t.json()}catch{return{clients:{}}}}function it(a,e,t,r,o,l){let i=new Set(e),n=new Set,s=new Set;for(let b of e)a.has(b)||n.add(b);for(let b of a)i.has(b)||s.add(b);let d=new Map;for(let b of t)d.set(b.tag.toLowerCase(),new Set(b.players));let c=new Map;for(let b of r)c.set(b.tag.toLowerCase(),new Set(b.players));let u=new Map,g=new Map;for(let[b,v]of c){let T=d.get(b);if(!T)continue;let w=[];for(let S of v)T.has(S)||w.push(S);w.length>0&&u.set(b,w)}for(let[b,v]of d){let T=c.get(b);if(!T)continue;let w=[];for(let S of v)T.has(S)||w.push(S);w.length>0&&g.set(b,w)}let m=[],h=[];for(let b of r)d.has(b.tag.toLowerCase())||m.push(b.tag);for(let b of t)c.has(b.tag.toLowerCase())||h.push(b.tag);let C=new Set(o),x=new Set(l),$=[],k=[];for(let b of l)C.has(b)||$.push(b);for(let b of o)x.has(b)||k.push(b);return{added:n,removed:s,addedByClan:u,removedByClan:g,addedUntagged:$,removedUntagged:k,newClans:m,removedClans:h}}var re=null,he=null,ae=class{constructor(){this.currentPlayers=[];this.clanGroups=[];this.untaggedPlayers=[];this.previousPlayers=new Set;this.previousClanGroups=[];this.previousUntaggedPlayers=[];this.debugSequence=[];this.showOnlyClans=!0;this.recentTags=[];this.usernameCheckInterval=null;this.usernameAttachInterval=null;this.debugKeyHandler=null;this.lastFetchedGameId=null;this.lastFetchTime=0;this.fetchDebounceMs=1500;this.currentPlayerUsername="";this.selectedClanTag=null;this.lobbyConfig=null;this.nationCount=0;this.lastMapKey=null;this.currentGameId=null;this.teamColorAllocator=new X;this.clanColorAllocator=new U(W,j);this.clanColorMap=new Map;this.clanTeamMap=new Map;this.soloPlayerColorAllocator=new U(W,j);this.soloPlayerColorMap=new Map;this.settings={...Xe},this.sleeping=!O.isOnLobbyPage(),this.loadSettings(),this.initUI(),this.initDebugKey(),this.updateSleepState(),q.subscribe(()=>this.updateSleepState()),Y.fetch()}async receiveLobbyUpdate(e){if(this.sleeping)return;if(!e||!e.length){re=he=null,this.lastFetchedGameId=null,this.currentGameId=null,this.lobbyConfig=null,this.nationCount=0,this.lastMapKey=null,this.resetColorAllocators(),this.updateListWithNames([]);return}let t=e[0];if(!t)return;let r=t.gameID;this.currentGameId!==r&&(this.currentGameId=r,this.resetColorAllocators(),this.nationCount=0,this.lastMapKey=null),this.lobbyConfig=t.gameConfig??null,this.lobbyConfig&&this.updateNationCount(this.lobbyConfig);let o=at(r),l=Date.now();if(!(this.lastFetchedGameId===r&&l-this.lastFetchTime<this.fetchDebounceMs)){this.lastFetchedGameId=r,this.lastFetchTime=l,re=r,he=o;try{let i=await ot(r,o),n=Object.values(i.clients||{}).map(s=>s.username);this.updateListWithNames(n)}catch(i){console.warn("[PlayerList] Failed to fetch game data:",i)}}}updateListWithNames(e){this.currentPlayers=e,this.settings.debug&&re!=null&&(this.debugInfo.textContent=`GameID: ${re} | WorkerID: ${he}`);let t=new Set(e),r=this.previousPlayers&&this.previousPlayers.size===t.size&&e.every(c=>this.previousPlayers.has(c)),o=this.lastRenderedShowOnlyClans===this.showOnlyClans,l=this.getActiveClanTag(),i=this.lastRenderedSelectedClanTag===l,n=this.lastRenderedTeamMode===this.isTeamMode();if(r&&o&&i&&n)return;let{clanGroups:s,untaggedPlayers:d}=rt(e);if(this.previousClanGroups=this.clanGroups,this.previousUntaggedPlayers=this.untaggedPlayers,this.clanGroups=s,this.untaggedPlayers=d,this.updateClanColorMaps(),this.renderPlayerList(),this.settings.showPlayerCount){let c=this.header.querySelector(".of-player-list-count");c&&(c.textContent=String(e.length))}this.previousPlayers=t,this.lastRenderedShowOnlyClans=this.showOnlyClans}isTeamMode(){return this.lobbyConfig?.gameMode==="Team"}getSoloPlayerColor(e){if(this.soloPlayerColorMap.has(e))return this.soloPlayerColorMap.get(e);let t=this.soloPlayerColorAllocator.assignColor(e);return this.soloPlayerColorMap.set(e,t),t}getClanColor(e){let t=e.toLowerCase();if(this.clanColorMap.has(t))return this.clanColorMap.get(t);let r=this.clanColorAllocator.assignColor(t);return this.clanColorMap.set(t,r),r}initUI(){this.container=document.createElement("div"),this.container.className="of-panel of-player-list-container";let e=document.getElementById("of-game-layout-wrapper");e?e.appendChild(this.container):(console.warn("[PlayerList] Layout wrapper not found, appending to body"),document.body.appendChild(this.container));let t=document.createElement("div");t.id="of-discovery-slot",t.className="of-discovery-slot",this.container.appendChild(t),this.header=document.createElement("div"),this.header.className="of-header of-player-list-header",this.header.innerHTML=`
      <div class="of-header-title">
        <span class="of-player-list-title">Lobby Intel</span>
        <span class="of-badge of-player-list-count">0</span>
      </div>
    `,this.container.appendChild(this.header),this.debugInfo=document.createElement("div"),this.debugInfo.className="of-player-debug-info",this.header.appendChild(this.debugInfo),this.quickTagSwitch=document.createElement("div"),this.quickTagSwitch.className="of-quick-tag-switch";let r=document.createElement("span");r.className="of-quick-tag-label",r.textContent="Quick tags",this.quickTagSwitch.appendChild(r),this.container.appendChild(this.quickTagSwitch),this.checkboxFilter=document.createElement("div"),this.checkboxFilter.className="of-clan-checkbox-filter";let o=document.createElement("input");o.type="checkbox",o.id="show-only-clans-checkbox",o.checked=this.showOnlyClans,o.addEventListener("change",i=>{if(this.showOnlyClans=i.target.checked,this.saveSettings(),this.renderPlayerList(),this.settings.showPlayerCount){let n=this.header.querySelector(".of-player-list-count");n&&(n.textContent=String(this.currentPlayers.length))}});let l=document.createElement("label");l.htmlFor="show-only-clans-checkbox",l.textContent="Show only players with clan tags",this.checkboxFilter.appendChild(o),this.checkboxFilter.appendChild(l),this.container.appendChild(this.checkboxFilter),this.content=document.createElement("div"),this.content.className="of-content of-player-list-content",this.container.appendChild(this.content),this.resizeHandler=new Z(this.container,i=>{document.documentElement.style.setProperty("--player-list-width",i+"px")},P.playerListPanelSize,200,50),this.applySavedPanelSize(),this.resizeObserver=new ResizeObserver(()=>{if(!O.isOnLobbyPage())return;let i=this.container.offsetWidth,n=this.container.offsetHeight;i<=0||n<=0||GM_setValue(P.playerListPanelSize,{width:i,height:n})}),this.resizeObserver.observe(this.container),this.applySettings(),this.renderQuickTagSwitch(),this.monitorUsernameInput()}monitorUsernameInput(){let e=()=>{let i=document.querySelector("username-input");if(!i)return null;let n=i.querySelector('input[maxlength="5"]'),s=i.querySelector('input:not([maxlength="5"])');return{clanInput:n,nameInput:s,component:i}},t="",r=()=>{let i=e();if(!i)return;let n=i.clanInput?.value||"",s=i.nameInput?.value||"",d=n?`[${n}] ${s}`:s,c=n||D(d);c&&c.length>=2&&this.addRecentTag(c)},o=()=>{let i=e();if(!i)return;let n=i.clanInput?.value||"",s=i.nameInput?.value||"",d=n?`[${n}] ${s}`:s;if(d!==t){t=d,this.currentPlayerUsername=d;let c=D(d);!this.setSelectedClanTag(n||c)&&this.clanGroups.length>0&&this.renderPlayerList()}};o(),this.usernameCheckInterval=setInterval(o,1e3);let l=()=>{let i=e(),n=i?.clanInput,s=i?.nameInput;n&&!n.dataset.ofMonitored&&(n.dataset.ofMonitored="true",n.addEventListener("input",o),n.addEventListener("change",()=>{o(),r()})),s&&!s.dataset.ofMonitored&&(s.dataset.ofMonitored="true",s.addEventListener("input",o),s.addEventListener("change",()=>{o(),r()}))};l(),this.usernameAttachInterval=setInterval(l,5e3)}loadSettings(){let e=GM_getValue(P.playerListShowOnlyClans);e!==void 0&&(e==="true"?this.showOnlyClans=!0:e==="false"?this.showOnlyClans=!1:this.showOnlyClans=!!e);let t=GM_getValue(P.playerListRecentTags);t&&Array.isArray(t)&&(this.recentTags=t)}saveSettings(){GM_setValue(P.playerListShowOnlyClans,this.showOnlyClans)}applyClanTagToNickname(e){this.setSelectedClanTag(e);let t=document.querySelector("username-input");if(!t)return;let r=t.querySelector('input[maxlength="5"]');if(r){let o=e.toUpperCase(),l=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;l&&(l.call(r,o),r.dispatchEvent(new Event("input",{bubbles:!0})),r.dispatchEvent(new Event("change",{bubbles:!0})))}}addRecentTag(e){let t=e.toUpperCase();this.recentTags.includes(t)||(this.recentTags.unshift(t),this.recentTags.length>3&&(this.recentTags=this.recentTags.slice(0,3)),GM_setValue(P.playerListRecentTags,this.recentTags),this.renderQuickTagSwitch())}renderQuickTagSwitch(){this.quickTagSwitch.querySelectorAll(".of-quick-tag-item").forEach(t=>t.remove());for(let t of this.recentTags){let r=document.createElement("div");r.className="of-quick-tag-item";let o=document.createElement("button");o.type="button",o.className="of-quick-tag-btn",o.textContent=t,o.title=`Apply [${t}] to your username`,o.addEventListener("click",()=>{this.applyClanTagToNickname(t)});let l=document.createElement("button");l.type="button",l.className="of-quick-tag-remove",l.textContent="x",l.title="Remove from recent tags",l.setAttribute("aria-label",`Remove ${t} from recent tags`),l.addEventListener("click",i=>{i.stopPropagation(),this.recentTags=this.recentTags.filter(n=>n!==t),GM_setValue(P.playerListRecentTags,this.recentTags),this.renderQuickTagSwitch()}),r.appendChild(o),r.appendChild(l),this.quickTagSwitch.appendChild(r)}}createClanGroupEl(e,t,r,o){let l=document.createElement("div");if(l.className="of-clan-group",l.setAttribute("data-clan-tag",e.toLowerCase()),o?.applyClanColor??!0){let h=this.clanColorMap.get(e.toLowerCase());h&&(l.style.setProperty("--clan-color",te(h)),l.style.setProperty("--clan-color-soft",F(h,.14)),l.style.setProperty("--clan-color-strong",F(h,.28)),l.style.setProperty("--clan-color-border",F(h,.6)))}else l.classList.add("of-clan-group-neutral");o?.isNew&&l.classList.add("of-clan-group-enter");let n=document.createElement("div");n.className="of-clan-group-header";let s="";if(r){let h=r.wins&&r.losses?(r.wins/r.losses).toFixed(2):r.weightedWLRatio?.toFixed(2)||"0.00",C=r.wins?.toLocaleString()||0,x=r.losses?.toLocaleString()||0;s=`
        <span>W ${C}</span>
        <span>\u2022</span>
        <span>L ${x}</span>
        <span>\u2022</span>
        <span>R ${h}</span>
      `}let d=this.getActiveClanTag(),c=!!d&&e.toLowerCase()===d;n.innerHTML=`
      <span class="of-clan-tag">[${e}]</span>
      <span class="of-clan-count">${t.length}</span>
      <div class="of-clan-actions">
        ${s?`<div class="of-clan-stats">${s}</div>`:""}
        <button class="of-clan-use-btn" title="Apply [${e}] to your username">Use tag</button>
      </div>
    `;let u=n.querySelector(".of-clan-use-btn");u&&u.addEventListener("click",h=>{h.stopPropagation(),this.applyClanTagToNickname(e)});let g=document.createElement("div");g.className="of-clan-group-players";let m=o?.newPlayers;for(let h of t){let C=m?m.has(h):!1;g.appendChild(this.createPlayerEl(h,C,!0,void 0,c))}return l.appendChild(n),l.appendChild(g),l}createPlayerEl(e,t=!1,r=!1,o,l=!1){let i=document.createElement("div");i.className="of-player-item",i.setAttribute("data-player-name",e),t&&i.classList.add("of-player-enter"),o&&(i.classList.add("of-player-item-accent"),i.style.setProperty("--player-accent",te(o)),i.style.setProperty("--player-accent-soft",F(o,.16)),i.style.setProperty("--player-accent-strong",F(o,.32)),i.style.setProperty("--player-accent-border",F(o,.7))),l&&i.classList.add("of-player-item-clanmate");let n=document.createElement("span");return n.className="of-player-name",n.textContent=r?Je(e):e,i.appendChild(n),i}normalizeClanTag(e){if(!e)return null;let t=e.trim();return t?t.toLowerCase():null}setSelectedClanTag(e){let t=this.normalizeClanTag(e);return t===this.selectedClanTag?!1:(this.selectedClanTag=t,this.renderPlayerList(),!0)}getActiveClanTag(){return this.selectedClanTag?this.selectedClanTag:this.currentPlayerUsername?this.normalizeClanTag(D(this.currentPlayerUsername)):null}sortClanGroupsWithPlayerFirst(e,t){let r=t??this.getActiveClanTag();if(!r)return e;let o=e.findIndex(l=>l.tag.toLowerCase()===r);return o>0?[e[o],...e.slice(0,o),...e.slice(o+1)]:e}renderPlayerList(){let e=it(this.previousPlayers,this.currentPlayers,this.previousClanGroups,this.clanGroups,this.previousUntaggedPlayers,this.untaggedPlayers),t=this.previousPlayers.size===0,r=this.lastRenderedShowOnlyClans!==this.showOnlyClans,o=this.getActiveClanTag(),l=this.lastRenderedSelectedClanTag!==o,i=this.isTeamMode(),n=this.lastRenderedTeamMode!==i;i?this.renderPlayerListTeamMode(e,o):t||r||l||n?this.renderPlayerListFfaFull():this.renderPlayerListFfaDifferential(e),this.lastRenderedSelectedClanTag=o,this.lastRenderedTeamMode=i}renderPlayerListFfaFull(){this.content.innerHTML="";let e=this.showOnlyClans?this.currentPlayers.filter(t=>D(t)):this.currentPlayers;for(let t of e){let r=D(t),o=r?this.getClanColor(r):this.getSoloPlayerColor(t);this.content.appendChild(this.createPlayerEl(t,!1,!1,o,!1))}}renderPlayerListTeamMode(e,t){this.content.innerHTML="";let r=this.lobbyConfig;if(!r||r.gameMode!=="Team")return;let o=ne(r,this.currentPlayers.length,this.nationCount);if(o.length===0)return;let l=this.teamColorAllocator.getTeamColorMap(o),i=tt(this.currentPlayers,this.clanGroups,this.untaggedPlayers,r,this.nationCount),n=t??this.getActiveClanTag(),s=this.findCurrentTeam(i,n),d=this.orderTeamGroups(i,s),c=new Set(e.newClans.map(g=>g.toLowerCase())),u=new Set(e.addedUntagged);for(let g of d){if(this.showOnlyClans&&g.clanGroups.length===0)continue;let m=document.createElement("div");m.className="of-team-group",m.setAttribute("data-team",g.team),g.team===s&&m.classList.add("current-player-team");let h=l.get(g.team);h&&(m.style.setProperty("--team-color",te(h)),m.style.setProperty("--team-color-soft",F(h,.28)));let C=document.createElement("div");C.className="of-team-band",m.appendChild(C);let x=document.createElement("div");x.className="of-team-header";let $=g.soloPlayers.length+g.clanGroups.reduce((b,v)=>b+v.players.length,0);x.innerHTML=`
        <span class="of-team-label">${g.team}</span>
        <span class="of-team-count">${$}</span>
      `,m.appendChild(x);let k=this.sortClanGroupsWithPlayerFirst(g.clanGroups,n);for(let b of k){let v=Y.getStats(b.tag),T=e.addedByClan.get(b.tag.toLowerCase()),w=this.createClanGroupEl(b.tag,b.players,v,{isNew:c.has(b.tag.toLowerCase()),applyClanColor:!0,newPlayers:T?new Set(T):void 0});m.appendChild(w),w.classList.contains("of-clan-group-enter")&&w.addEventListener("animationend",()=>{w.classList.remove("of-clan-group-enter")},{once:!0})}if(!this.showOnlyClans&&g.soloPlayers.length>0){let b=document.createElement("div");b.className="of-solo-players";for(let v of g.soloPlayers){let T=u.has(v);b.appendChild(this.createPlayerEl(v,T,!1,h))}m.appendChild(b)}this.content.appendChild(m)}}findCurrentTeam(e,t){if(t){for(let o of e)if(o.clanGroups.some(l=>l.tag.toLowerCase()===t))return o.team}let r=this.currentPlayerUsername.trim();if(!r)return null;for(let o of e)if(o.soloPlayers.includes(r))return o.team;return null}orderTeamGroups(e,t){if(!t)return e;let r=e.findIndex(l=>l.team===t);return r<=0?e:[e[r],...e.slice(0,r),...e.slice(r+1)]}renderPlayerListFfaDifferential(e){for(let r of e.removed){let o=this.content.querySelector(`.of-player-item[data-player-name="${CSS.escape(r)}"]`);o&&this.removePlayerWithAnimation(o)}let t=0;for(let r of e.added){let o=D(r);if(this.showOnlyClans&&!o)continue;let l=o?this.getClanColor(o):this.getSoloPlayerColor(r),i=this.createPlayerEl(r,!0,!1,l,!1);t>0&&t<=4&&i.classList.add(`of-player-enter-stagger-${t}`),t++,this.content.appendChild(i),i.addEventListener("animationend",()=>{i.classList.remove("of-player-enter");for(let n=1;n<=4;n++)i.classList.remove(`of-player-enter-stagger-${n}`)},{once:!0})}}resetColorAllocators(){this.teamColorAllocator.reset(),this.clanColorAllocator.reset(),this.clanColorMap.clear(),this.clanTeamMap.clear(),this.soloPlayerColorAllocator.reset(),this.soloPlayerColorMap.clear()}updateClanColorMaps(){if(this.clanColorMap.clear(),this.clanTeamMap.clear(),this.clanGroups.length===0)return;let e=this.lobbyConfig;if(e?.gameMode==="Team"&&e){let o=ne(e,this.currentPlayers.length,this.nationCount),l=this.teamColorAllocator.getTeamColorMap(o),i=Ze(this.currentPlayers,e,this.nationCount);for(let n of this.clanGroups){let s=n.tag.toLowerCase(),d=i.get(s),c=d?l.get(d):void 0;d&&this.clanTeamMap.set(s,d),c&&this.clanColorMap.set(s,c)}return}let r=[...this.clanGroups].map(o=>o.tag.toLowerCase()).sort((o,l)=>o.localeCompare(l));for(let o of r)this.clanColorMap.set(o,this.clanColorAllocator.assignColor(o))}async updateNationCount(e){if(e.disableNations){this.nationCount=0;return}let t=nt(e.gameMap);if(!t){this.nationCount=0;return}if(this.lastMapKey!==t){this.lastMapKey=t;try{let r=await fetch(`/maps/${t}/manifest.json`);if(!r.ok)throw new Error(`Failed to load manifest for ${t}`);let o=await r.json(),l=Array.isArray(o.nations)?o.nations.length:0,i=!!e.publicGameModifiers?.isCompact||e.gameMapSize==="Compact";l===0?this.nationCount=0:i?this.nationCount=Math.max(1,Math.floor(l*.25)):this.nationCount=l}catch(r){console.warn("[PlayerList] Failed to fetch map manifest:",r),this.nationCount=0}this.updateClanColorMaps(),this.renderPlayerList()}}removePlayerWithAnimation(e){e.classList.add("of-player-exit"),e.addEventListener("animationend",()=>{e.remove()},{once:!0})}applySettings(){this.settings.debug&&(this.debugInfo.style.display="block")}applySavedPanelSize(){let e=GM_getValue(P.playerListPanelSize);e&&e.width&&(this.container.style.width=e.width+"px",document.documentElement.style.setProperty("--player-list-width",e.width+"px"))}updateSleepState(){let e=O.isOnLobbyPage();this.sleeping=!e,this.sleeping?this.container.classList.add("hidden"):this.container.classList.remove("hidden")}initDebugKey(){this.debugKeyHandler=e=>{e.ctrlKey&&e.shiftKey&&e.key==="D"&&(this.debugSequence.push("D"),this.debugSequence.length>3&&this.debugSequence.shift(),this.debugSequence.join("")==="DDD"&&(this.settings.debug=!this.settings.debug,this.applySettings(),console.log("[PlayerList] Debug mode:",this.settings.debug),this.debugSequence=[]))},document.addEventListener("keydown",this.debugKeyHandler)}cleanup(){this.usernameCheckInterval&&clearInterval(this.usernameCheckInterval),this.usernameAttachInterval&&clearInterval(this.usernameAttachInterval),this.debugKeyHandler&&document.removeEventListener("keydown",this.debugKeyHandler),this.resizeObserver&&this.resizeObserver.disconnect(),this.resizeHandler&&this.resizeHandler.destroy(),this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container)}};function Gt(a){if(!a)return null;let e=a.toLowerCase().trim();return e==="team"||e==="teams"?"Team":null}function ve(a){return Gt(a.gameConfig?.gameMode)}function ye(a){if(a==="Duos"||a==="Trios"||a==="Quads"||typeof a=="number"&&Number.isFinite(a)&&a>0)return a;if(typeof a=="string"){let e=parseInt(a,10);if(!Number.isNaN(e)&&e>0)return e}return null}function xe(a){let e=a.gameConfig;if(!e||e.playerTeams==="Humans Vs Nations")return null;let t=ye(e.playerTeams);return t!==null?t:ye(e.teamCount??e.teams??null)}function we(a){let e=a.gameConfig;return e?e.maxClients??e.maxPlayers??e.maxPlayersPerGame??a.maxClients??null:null}function Ce(a,e){return!a||!e?null:a==="Duos"?2:a==="Trios"?3:a==="Quads"?4:typeof a=="number"&&a>0?Math.floor(e/a):null}function Te(a){let e=ve(a),t=xe(a),r=we(a);if(e!=="Team")return"Unsupported mode";if(t==="Duos")return"Duos";if(t==="Trios")return"Trios";if(t==="Quads")return"Quads";if(typeof t=="number"&&r!==null){let o=Ce(t,r);return o!==null?`${t} teams (${o} per team)`:`${t} teams`}return"Team"}function st(a){if(!Array.isArray(a))return[];let e=[];for(let t of a){let r=t;(r.gameMode??"").toLowerCase()==="team"&&r.teamCount!=="Humans Vs Nations"&&e.push({gameMode:"Team",teamCount:ye(r.teamCount??null),minPlayers:typeof r.minPlayers=="number"?r.minPlayers:null,maxPlayers:typeof r.maxPlayers=="number"?r.maxPlayers:null})}return e}function lt(a,e){return e?{criteria:st(e.criteria),discoveryEnabled:typeof e.discoveryEnabled=="boolean"?e.discoveryEnabled:!0,soundEnabled:typeof e.soundEnabled=="boolean"?e.soundEnabled:!0,isTeamThreeTimesMinEnabled:typeof e.isTeamThreeTimesMinEnabled=="boolean"?e.isTeamThreeTimesMinEnabled:!1}:{criteria:st(a?.criteria),discoveryEnabled:typeof a?.autoJoinEnabled=="boolean"?a.autoJoinEnabled:!0,soundEnabled:typeof a?.soundEnabled=="boolean"?a.soundEnabled:!0,isTeamThreeTimesMinEnabled:typeof a?.isTeamThreeTimesMinEnabled=="boolean"?a.isTeamThreeTimesMinEnabled:!1}}var oe=class{matchesCriteria(e,t){if(!e||!e.gameConfig||!t||t.length===0||ve(e)!=="Team"||e.gameConfig.playerTeams==="Humans Vs Nations")return!1;let r=we(e),o=xe(e),l=Ce(o,r);for(let i of t)if(i.gameMode==="Team"&&!(i.teamCount!==null&&i.teamCount!==void 0&&i.teamCount!==o)&&!(l!==null&&(i.minPlayers!==null&&l<i.minPlayers||i.maxPlayers!==null&&l>i.maxPlayers)))return!0;return!1}};var ie=class{constructor(){this.discoveryEnabled=!0;this.criteriaList=[];this.searchStartTime=null;this.gameFoundTime=null;this.soundEnabled=!0;this.notifiedLobbies=new Set;this.lastNotifiedGameID=null;this.isTeamThreeTimesMinEnabled=!1;this.sleeping=!1;this.timerInterval=null;this.gameInfoInterval=null;this.notificationTimeout=null;this.engine=new oe,this.loadSettings(),this.createUI(),this.updateSleepState(),q.subscribe(()=>this.updateSleepState())}receiveLobbyUpdate(e){this.processLobbies(e)}migrateSettings(){let e=GM_getValue("autoJoinSettings",null),t=GM_getValue(P.lobbyDiscoverySettings,null),r=lt(e,t);GM_setValue(P.lobbyDiscoverySettings,r)}loadSettings(){this.migrateSettings();let e=GM_getValue(P.lobbyDiscoverySettings,null);e&&(this.criteriaList=e.criteria||[],this.soundEnabled=e.soundEnabled!==void 0?e.soundEnabled:!0,this.discoveryEnabled=e.discoveryEnabled!==void 0?e.discoveryEnabled:!0,this.isTeamThreeTimesMinEnabled=e.isTeamThreeTimesMinEnabled||!1)}saveSettings(){GM_setValue(P.lobbyDiscoverySettings,{criteria:this.criteriaList,discoveryEnabled:this.discoveryEnabled,soundEnabled:this.soundEnabled,isTeamThreeTimesMinEnabled:this.isTeamThreeTimesMinEnabled})}updateSearchTimer(){let e=document.getElementById("discovery-search-timer");if(!e)return;if(!this.discoveryEnabled||this.searchStartTime===null||this.criteriaList.length===0){e.style.display="none",this.gameFoundTime=null;return}if(this.gameFoundTime!==null){let r=Math.floor((this.gameFoundTime-this.searchStartTime)/1e3);e.textContent=`Match found (${Math.floor(r/60)}m ${r%60}s)`,e.style.display="inline";return}let t=Math.floor((Date.now()-this.searchStartTime)/1e3);e.textContent=`Scanning ${Math.floor(t/60)}m ${t%60}s`,e.style.display="inline"}updateCurrentGameInfo(){let e=document.getElementById("discovery-current-game-info");if(!e||!O.isOnLobbyPage()){e&&(e.style.display="none");return}e.style.display="block";let t=document.querySelector("public-lobby");if(!t||!t.lobbies||t.lobbies.length===0){e.textContent="Current game: No game",e.classList.add("not-applicable");return}let r=t.lobbies[0];if(!r||!r.gameConfig){e.textContent="Current game: No game",e.classList.add("not-applicable");return}e.textContent=`Current game: ${Te(r)}`,e.classList.remove("not-applicable")}processLobbies(e){try{if(this.updateCurrentGameInfo(),!this.discoveryEnabled||this.criteriaList.length===0||!O.isOnLobbyPage())return;this.gameFoundTime!==null&&this.lastNotifiedGameID!==null&&(e.length>0?e[0]:null)?.gameID!==this.lastNotifiedGameID&&this.syncSearchTimer({resetStart:!0});for(let t of e)if(this.engine.matchesCriteria(t,this.criteriaList)){this.notifiedLobbies.has(t.gameID)||(this.showGameFoundNotification(t),this.soundEnabled&&J.playGameFoundSound(),this.notifiedLobbies.add(t.gameID),this.gameFoundTime=Date.now(),this.lastNotifiedGameID=t.gameID);return}}catch(t){console.error("[LobbyDiscovery] Error processing lobbies:",t)}}showGameFoundNotification(e){this.dismissNotification();let t=this.createNewNotification(e);document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("notification-visible")}),this.notificationTimeout=setTimeout(()=>{this.dismissNotification(t)},1e4)}createNewNotification(e){let t=document.createElement("div");t.className="game-found-notification";let r=Te(e);return t.innerHTML=`
      <div class="notification-title">Matching Lobby Found</div>
      <div class="notification-detail">${r}</div>
      <div class="notification-hint">Join manually in the game lobby UI</div>
    `,t.addEventListener("click",()=>{this.dismissNotification(t)}),t}dismissNotification(e=null){this.notificationTimeout&&(clearTimeout(this.notificationTimeout),this.notificationTimeout=null);let t=e?[e]:Array.from(document.querySelectorAll(".game-found-notification"));for(let r of t)r.classList.remove("notification-visible"),r.classList.add("notification-dismissing"),setTimeout(()=>{r.parentNode&&r.parentNode.removeChild(r)},300)}stopTimer(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null)}startGameInfoUpdates(){this.stopGameInfoUpdates(),this.updateCurrentGameInfo(),this.gameInfoInterval=setInterval(()=>this.updateCurrentGameInfo(),1e3)}stopGameInfoUpdates(){this.gameInfoInterval&&(clearInterval(this.gameInfoInterval),this.gameInfoInterval=null)}syncSearchTimer(e={}){let{resetStart:t=!1}=e;this.stopTimer(),t&&(this.searchStartTime=null,this.gameFoundTime=null,this.lastNotifiedGameID=null,this.notifiedLobbies.clear()),this.discoveryEnabled&&this.criteriaList.length>0?(this.searchStartTime===null&&(this.searchStartTime=Date.now()),this.timerInterval=setInterval(()=>this.updateSearchTimer(),100)):(this.searchStartTime=null,this.gameFoundTime=null),this.updateSearchTimer()}setDiscoveryEnabled(e,t={}){let{resetTimer:r=!1}=t;this.discoveryEnabled=e,this.saveSettings(),this.updateUI(),this.syncSearchTimer({resetStart:r})}setModesExpanded(e){let t=document.getElementById("discovery-modes");t&&t.classList.toggle("is-expanded",e)}getNumberValue(e){let t=document.getElementById(e);if(!t)return null;let r=parseInt(t.value,10);return Number.isNaN(r)?null:r}getAllTeamCountValues(){let e=[],t=["discovery-team-duos","discovery-team-trios","discovery-team-quads","discovery-team-2","discovery-team-3","discovery-team-4","discovery-team-5","discovery-team-6","discovery-team-7"];for(let r of t){let o=document.getElementById(r);if(o?.checked)if(o.value==="Duos"||o.value==="Trios"||o.value==="Quads")e.push(o.value);else{let l=parseInt(o.value,10);Number.isNaN(l)||e.push(l)}}return e}setAllTeamCounts(e){let t=["discovery-team-duos","discovery-team-trios","discovery-team-quads","discovery-team-2","discovery-team-3","discovery-team-4","discovery-team-5","discovery-team-6","discovery-team-7"];for(let r of t){let o=document.getElementById(r);o&&(o.checked=e)}}buildCriteriaFromUI(){let e=[];if(!document.getElementById("discovery-team")?.checked)return e;let r=this.getAllTeamCountValues();if(r.length===0)return e.push({gameMode:"Team",teamCount:null,minPlayers:this.getNumberValue("discovery-team-min"),maxPlayers:this.getNumberValue("discovery-team-max")}),e;for(let o of r)e.push({gameMode:"Team",teamCount:o,minPlayers:this.getNumberValue("discovery-team-min"),maxPlayers:this.getNumberValue("discovery-team-max")});return e}updateUI(){let e=document.querySelector(".status-text"),t=document.querySelector(".status-indicator");e&&t&&(this.discoveryEnabled?(e.textContent="Discovery Active",t.style.background="#38d9a9",t.classList.add("active"),t.classList.remove("inactive")):(e.textContent="Discovery Paused",t.style.background="#888",t.classList.remove("active"),t.classList.add("inactive")))}loadUIFromSettings(){let e=document.getElementById("discovery-team"),t=document.getElementById("discovery-team-config"),r=this.criteriaList.filter(s=>s.gameMode==="Team"),o=r.length>0;e&&(e.checked=o,t&&(t.style.display=o?"block":"none"));let l=r.map(s=>s.teamCount).filter(s=>s!==null);for(let s of l){let d=null;s==="Duos"?d=document.getElementById("discovery-team-duos"):s==="Trios"?d=document.getElementById("discovery-team-trios"):s==="Quads"?d=document.getElementById("discovery-team-quads"):typeof s=="number"&&(d=document.getElementById(`discovery-team-${s}`)),d&&(d.checked=!0)}let i=r[0];if(i){let s=document.getElementById("discovery-team-min"),d=document.getElementById("discovery-team-max");s&&i.minPlayers!==null&&(s.value=String(i.minPlayers)),d&&i.maxPlayers!==null&&(d.value=String(i.maxPlayers))}let n=document.getElementById("discovery-sound-toggle");n&&(n.checked=this.soundEnabled)}initializeSlider(e,t,r,o,l,i,n){let s=document.getElementById(e),d=document.getElementById(t),c=document.getElementById(r),u=document.getElementById(o);if(!s||!d||!c||!u)return;let g=parseInt(c.value,10),m=parseInt(u.value,10);Number.isNaN(g)||(s.value=String(g)),Number.isNaN(m)||(d.value=String(m));let h=()=>{this.updateSliderRange(e,t,r,o,l,i,n),this.criteriaList=this.buildCriteriaFromUI(),this.saveSettings(),this.syncSearchTimer({resetStart:!0})};s.addEventListener("input",h),d.addEventListener("input",h),this.updateSliderRange(e,t,r,o,l,i,n)}updateSliderRange(e,t,r,o,l,i,n){let s=document.getElementById(e),d=document.getElementById(t),c=document.getElementById(r),u=document.getElementById(o),g=document.getElementById(l),m=document.getElementById(i),h=document.getElementById(n);if(!s||!d||!c||!u)return;let C=parseInt(s.value,10),x=parseInt(d.value,10);if(this.isTeamThreeTimesMinEnabled&&(x=Math.min(parseInt(d.max,10),Math.max(1,3*C)),d.value=String(x)),C>x&&(C=x,s.value=String(C)),c.value=String(C),u.value=String(x),m&&(m.textContent=C===1?"Any":String(C)),h&&(h.textContent=x===parseInt(d.max,10)?"Any":String(x)),g){let $=(C-parseInt(s.min,10))/(parseInt(s.max,10)-parseInt(s.min,10))*100,k=(x-parseInt(s.min,10))/(parseInt(s.max,10)-parseInt(s.min,10))*100;g.style.left=$+"%",g.style.width=k-$+"%"}}setupEventListeners(){document.getElementById("discovery-status")?.addEventListener("click",()=>{this.setDiscoveryEnabled(!this.discoveryEnabled,{resetTimer:!0})});let e=document.getElementById("discovery-modes");e&&(e.addEventListener("mouseenter",()=>this.setModesExpanded(!0)),e.addEventListener("mouseleave",()=>this.setModesExpanded(!1)));let t=document.getElementById("discovery-team");t&&t.addEventListener("change",()=>{let i=document.getElementById("discovery-team-config");i&&(i.style.display=t.checked?"block":"none"),this.criteriaList=this.buildCriteriaFromUI(),this.saveSettings(),this.syncSearchTimer({resetStart:!0})});let r=document.getElementById("discovery-team-three-times");r&&(r.checked=this.isTeamThreeTimesMinEnabled,r.addEventListener("change",()=>{this.isTeamThreeTimesMinEnabled=r.checked,this.saveSettings();let i=document.getElementById("discovery-team-min-slider"),n=document.getElementById("discovery-team-max-slider");if(i&&n){let s=parseInt(i.value,10);n.value=this.isTeamThreeTimesMinEnabled?String(Math.min(50,Math.max(1,3*s))):n.value,this.updateSliderRange("discovery-team-min-slider","discovery-team-max-slider","discovery-team-min","discovery-team-max","discovery-team-range-fill","discovery-team-min-value","discovery-team-max-value")}})),document.getElementById("discovery-team-select-all")?.addEventListener("click",()=>{this.setAllTeamCounts(!0),this.criteriaList=this.buildCriteriaFromUI(),this.saveSettings(),this.syncSearchTimer({resetStart:!0})}),document.getElementById("discovery-team-deselect-all")?.addEventListener("click",()=>{this.setAllTeamCounts(!1),this.criteriaList=this.buildCriteriaFromUI(),this.saveSettings(),this.syncSearchTimer({resetStart:!0})});let o=["discovery-team-2","discovery-team-3","discovery-team-4","discovery-team-5","discovery-team-6","discovery-team-7","discovery-team-duos","discovery-team-trios","discovery-team-quads"];for(let i of o)document.getElementById(i)?.addEventListener("change",()=>{this.criteriaList=this.buildCriteriaFromUI(),this.saveSettings(),this.syncSearchTimer({resetStart:!0})});let l=document.getElementById("discovery-sound-toggle");l&&l.addEventListener("change",()=>{this.soundEnabled=l.checked,this.saveSettings()})}createUI(){if(document.getElementById("openfront-discovery-panel"))return;this.panel=document.createElement("div"),this.panel.id="openfront-discovery-panel",this.panel.className="of-panel discovery-panel",this.panel.innerHTML=`
      <div class="of-header discovery-header">
        <div class="discovery-title">
          <span class="discovery-title-text">Lobby Discovery</span>
          <span class="discovery-title-sub">NOTIFY ONLY</span>
        </div>
      </div>
      <div class="discovery-body">
        <div class="of-content discovery-content">
          <div class="discovery-status-bar">
            <div class="discovery-status" id="discovery-status">
              <span class="status-indicator"></span>
              <span class="status-text">Discovery Active</span>
              <span class="search-timer" id="discovery-search-timer" style="display: none;"></span>
            </div>
            <label class="discovery-toggle-label">
              <input type="checkbox" id="discovery-sound-toggle">
              <span>Sound</span>
            </label>
          </div>
          <div class="discovery-modes" id="discovery-modes">
            <div class="discovery-modes-rail" aria-hidden="true">
              <span class="discovery-modes-caret">\u25B8</span>
              <span class="discovery-modes-label">Filters</span>
              <span class="discovery-modes-dot"></span>
              <span class="discovery-modes-dot"></span>
              <span class="discovery-modes-dot"></span>
            </div>
            <div class="discovery-modes-body">
              <div class="discovery-section">
                <div class="discovery-section-title">Modes</div>
                <div class="discovery-config-grid">
                  <div class="discovery-mode-config discovery-config-card">
                    <label class="mode-checkbox-label"><input type="checkbox" id="discovery-team" name="gameMode" value="Team"><span>Team</span></label>
                    <div class="discovery-mode-inner" id="discovery-team-config" style="display: none;">
                      <div class="team-count-section">
                        <label>Teams (optional):</label>
                        <div>
                          <button type="button" id="discovery-team-select-all" class="select-all-btn">Select All</button>
                          <button type="button" id="discovery-team-deselect-all" class="select-all-btn">Deselect All</button>
                        </div>
                        <div class="team-count-options-centered">
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-duos" value="Duos"> Duos</label>
                            <label><input type="checkbox" id="discovery-team-trios" value="Trios"> Trios</label>
                            <label><input type="checkbox" id="discovery-team-quads" value="Quads"> Quads</label>
                          </div>
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-2" value="2"> 2 teams</label>
                            <label><input type="checkbox" id="discovery-team-3" value="3"> 3 teams</label>
                            <label><input type="checkbox" id="discovery-team-4" value="4"> 4 teams</label>
                          </div>
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-5" value="5"> 5 teams</label>
                            <label><input type="checkbox" id="discovery-team-6" value="6"> 6 teams</label>
                            <label><input type="checkbox" id="discovery-team-7" value="7"> 7 teams</label>
                          </div>
                        </div>
                      </div>
                      <div class="player-filter-info"><small>Filter by players per team:</small></div>
                      <div class="capacity-range-wrapper">
                        <div class="capacity-range-visual">
                          <div class="capacity-track">
                            <div class="capacity-range-fill" id="discovery-team-range-fill"></div>
                            <input type="range" id="discovery-team-min-slider" min="1" max="50" value="1" class="capacity-slider capacity-slider-min">
                            <input type="range" id="discovery-team-max-slider" min="1" max="50" value="50" class="capacity-slider capacity-slider-max">
                          </div>
                          <div class="capacity-labels">
                            <div class="capacity-label-group"><label for="discovery-team-min-slider">Min:</label><span class="capacity-value" id="discovery-team-min-value">1</span></div>
                            <div class="three-times-checkbox"><label for="discovery-team-three-times">3\xD7</label><input type="checkbox" id="discovery-team-three-times"></div>
                            <div class="capacity-label-group"><label for="discovery-team-max-slider">Max:</label><span class="capacity-value" id="discovery-team-max-value">50</span></div>
                          </div>
                        </div>
                        <div class="capacity-inputs-hidden">
                          <input type="number" id="discovery-team-min" min="1" max="50" style="display: none;">
                          <input type="number" id="discovery-team-max" min="1" max="50" style="display: none;">
                        </div>
                      </div>
                      <div class="current-game-info" id="discovery-current-game-info" style="display: none;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;let e=document.getElementById("of-discovery-slot");e?e.appendChild(this.panel):(console.warn("[LobbyDiscovery] Discovery slot not found, appending to body"),document.body.appendChild(this.panel)),this.setupEventListeners(),this.setModesExpanded(!1),this.loadUIFromSettings(),this.initializeSlider("discovery-team-min-slider","discovery-team-max-slider","discovery-team-min","discovery-team-max","discovery-team-range-fill","discovery-team-min-value","discovery-team-max-value"),this.updateUI(),this.syncSearchTimer(),this.startGameInfoUpdates()}updateSleepState(){let e=O.isOnLobbyPage();this.sleeping=!e,this.sleeping?(this.panel.classList.add("hidden"),this.stopTimer(),this.stopGameInfoUpdates()):(this.panel.classList.remove("hidden"),this.syncSearchTimer(),this.startGameInfoUpdates())}cleanup(){this.stopTimer(),this.stopGameInfoUpdates(),this.notificationTimeout&&clearTimeout(this.notificationTimeout),this.panel&&this.panel.parentNode&&this.panel.parentNode.removeChild(this.panel),this.dismissNotification()}};function ct(){if(!document.body){console.warn("[OpenFront Bundle] Body not ready, retrying layout wrapper injection..."),setTimeout(ct,100);return}if(document.getElementById("of-game-layout-wrapper")){console.log("[OpenFront Bundle] Layout wrapper already exists");return}let a=document.body,e=document.createElement("div");e.id="of-game-layout-wrapper";let t=document.createElement("div");for(t.id="of-game-content";a.firstChild;)t.appendChild(a.firstChild);e.appendChild(t),a.appendChild(e);let o=GM_getValue(P.playerListPanelSize)?.width||300;document.documentElement.style.setProperty("--player-list-width",o+"px"),console.log("[OpenFront Bundle] Layout wrapper injected \u2705")}(function(){"use strict";console.log("[OpenFront Bundle] Initializing v2.3.0..."),GM_addStyle($e()),console.log("[OpenFront Bundle] Styles injected \u2705"),ct(),J.preloadSounds(),console.log("[OpenFront Bundle] Sound system initialized \u2705"),q.init(),console.log("[OpenFront Bundle] URL observer initialized \u2705"),se.start(),console.log("[OpenFront Bundle] Lobby data manager started \u2705"),Y.fetch(),console.log("[OpenFront Bundle] Clan leaderboard caching started \u2705");let a=new ae;console.log("[OpenFront Bundle] Player list initialized \u2705");let e=new ie;console.log("[OpenFront Bundle] Lobby discovery initialized \u2705"),se.subscribe(t=>{a.receiveLobbyUpdate(t),e.receiveLobbyUpdate(t)}),console.log("[OpenFront Bundle] Modules subscribed to lobby updates \u2705"),console.log("[OpenFront Bundle] Ready! \u{1F680}")})();})();
