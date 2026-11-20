// 核对 lines.json 注释里「思高本作「……」」的引文是否逐字出自 sigao-epub-ot.json；用法：node scripts/officium1962/ot-canticles-quotes.mjs（应报 bad quotes 0）
import fs from 'node:fs';
const ep=JSON.parse(fs.readFileSync('resources/officium1962-ot-canticles/sigao-epub-ot.json','utf8'));
const punct=/[\s，。、；：！？「」『』“”（）()·…—\-,.;:!?]/g;
const strip=s=>s.replace(punct,'');
let big='';for(const b of Object.values(ep))for(const c of Object.values(b))for(const v of Object.values(c))big+=v;
const bigS=strip(big);
const lines=JSON.parse(fs.readFileSync('resources/officium1962-ot-canticles/lines.json','utf8'));
let bad=0;
for(const e of lines)for(const n of e.notes||[]){for(const m of n.matchAll(/思高本作「([^」]+)」/g)){const q=m[1];const parts=q.split(/……|…/).map(strip).filter(Boolean);if(!parts.every(p=>bigS.includes(p))){bad++;console.log('#'+e.id,e.ref,'「'+q+'」');}}}
console.log('bad quotes',bad);

