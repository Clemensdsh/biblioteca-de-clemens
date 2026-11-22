import { readFile, writeFile, mkdir, access, readdir } from 'node:fs/promises';
const root = new URL('.', import.meta.url), out = new URL('out/', root);
const path = (s) => new URL(s, out);
const exists = async p => access(p).then(()=>true,()=>false);
const input = JSON.parse(await readFile(new URL('gap-dates.json',root),'utf8'));
await mkdir(path('raw/'),{recursive:true}); await mkdir(path('text/'),{recursive:true});
const entity = s => s.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m,e)=> {let n=e[0]==='#'?(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10)):null; return n?String.fromCodePoint(n):({nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’',middot:'·',dagger:'†',hellip:'…',mdash:'—',ndash:'–',bull:'•',times:'×',copy:'©'})[e]??m;});
const clean = s => entity(s.replace(/<[^>]*>/g,'')).replace(/\u00a0/g,' ').trim();
function article(html) { let start=html.search(/<div\s+class=["']article-content["']/i); if(start<0)return ''; let re=/<\/?div\b[^>]*>/gi;re.lastIndex=start;let depth=0,m;while((m=re.exec(html))){if(/^<\/div/i.test(m[0]))depth--;else depth++;if(depth===0)return html.slice(html.indexOf('>',start)+1,m.index)}return ''; }
function parse(html,date,stype,url) {
 let a=article(html);if(!a)throw Error('未发现 article-content');
 a=a.replace(/<div\b[^>]*class=["'][^"']*card-music[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,'');
 let title=clean((a.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)||[])[1]||'');
 let sections=[], current=null, office='', reading='', variant=1, pending=false, uncertain=[], psalmParent=null;
 let tokens=a.match(/<h3\b[^>]*>[\s\S]*?<\/h3>|<p\b[^>]*>[\s\S]*?<\/p>|<table\b[\s\S]*?<\/table>/gi)||[];
 const labelPattern=/^(?:诵读[一二三]|对答咏|短对答咏|短答唱|简短读经|短读经|赞美诗|圣咏吟唱|圣咏|圣歌|序经|对经[一二三四五]?|赞主曲对经|谢主曲对经|赞主曲|谢主曲|西默盎赞主曲|祷词|祷 词|祈求|集祷经|结束祷词|结束词|赞主诗|天主经|结尾|结束经|日间祈祷|午前|午时|午后|午前对经|午时对经|午后对经|圣母经|圣母对经|读经|福音|信经|赞美经|降福词|壹|贰|叁|肆|伍|陆|母后万福|天上母后|救主之母|第一式|第二式|万福，天上母后|圣咏[0-9]+)$/;
 function add(label, extra={}) { current={label,variant:1,...extra,lines:[]}; if(office)current.office=office;sections.push(current); }
 for (let token of tokens) {
  if(/^<h3/i.test(token)){office=clean(token);reading='';variant=1;current=null;psalmParent=null;continue}
  if(/^<table/i.test(token)){uncertain.push('表格'); add('表格');current.lines.push(clean(token));continue}
  let inner=token.replace(/^<p\b[^>]*>/i,'').replace(/<\/p>$/i,'');
  let lead=inner.match(/^\s*(?:(?:<span|<em)\b[^>]*>\s*)*<strong\b[^>]*>([\s\S]*?)<\/strong>/i);
  let bold=lead?clean(lead[1].replace(/<br\s*\/?\s*>/gi,'\n')):''; let chunks=bold.split(/\s*\n\s*/); let lab=(chunks[0]||'').replace(/[：:]$/,'').trim();
  if(lab==='或') { if(reading){variant++;add(reading,{variant,or:true});pending=true;} else if(current){let previous=current;add(previous.label,{variant:(previous.variant||1)+1,or:true});uncertain.push('非诵读备选需复核');} else {add('或',{or:true});uncertain.push('未关联的或');} inner=inner.slice(lead[0].length); }
  else if(labelPattern.test(lab)) {if(/^对经/.test(lab) && current && /^(?:圣咏|圣歌|序经)$/.test(current.label)) psalmParent={label:current.label,ref:current.ref,heading:current.heading}; else if(!/^对经/.test(lab) && !/^(?:圣咏|圣歌|序经)$/.test(lab)) psalmParent=null; let extra={}; if(/^诵读[一二三]$/.test(lab)){reading=lab;variant=1;extra.variant=variant;pending=true} else if(lab==='对答咏'&&reading){extra.after=reading;extra.variant=variant} else {reading='';variant=1} add(lab,extra); inner=inner.slice(lead[0].length); if(chunks.length>1) inner=chunks.slice(1).join('<br>')+inner;}
  else {if(current && /^对经/.test(current.label) && psalmParent) add(psalmParent.label,{...(psalmParent.ref?{ref:psalmParent.ref}:{}),...(psalmParent.heading?{heading:psalmParent.heading}:{})}); if(bold && !/^(领|答|应)[：:]/.test(bold))uncertain.push('未识别的小标题：'+bold.split('\n')[0]);if(!current){add('无标题');uncertain.push('含无小标题正文')}}
  let bits=inner.split(/<br\s*\/?\s*>/i).map(clean).filter(Boolean);
  if(pending && bits.length){current.ref=bits.shift();if(bits.length)current.heading=bits.shift();pending=false;}
  else if(/^(?:圣咏|圣歌|简短读经|短读经|读经)$/.test(current.label) && lead && labelPattern.test(lab) && bits.length){let m=bits[0].match(/^([\u4e00-\u9fff]{0,5}\s*\d+(?::[0-9,;，.\-– ]+)?)(?:\s+(.+))?$/);if(m){current.ref=m[1].trim();if(m[2])current.heading=m[2];bits.shift()}}
  else if(current.label==='对答咏' && bits.length && !current.ref && !/^(领|答)[：:]/.test(bits[0])) current.ref=bits.shift();
  if(bits.length)current.lines.push(bits.join('\n'));
 }
 if(/<table\b/i.test(a)&&!uncertain.includes('表格'))uncertain.push('表格');
 if(!sections.length)throw Error('未识别任何正文段落');
 return {date,stype,url,title,sections, ...(uncertain.length?{warnings:[...new Set(uncertain)]}:{})};
}
let entries=[];if(await exists(path('index.json')))try{entries=JSON.parse(await readFile(path('index.json'),'utf8'))}catch{}
const save=async()=>writeFile(path('index.json'),JSON.stringify(entries,null,2)+'\n');
let last=0;
async function request(url){for(let attempt=0;attempt<3;attempt++){let delay=Math.max(0,1550-(Date.now()-last));if(delay)await new Promise(r=>setTimeout(r,delay)); try{let r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; personal-research)'},signal:AbortSignal.timeout(30000)});let body=await r.text();last=Date.now();if(r.status===403||r.status===429||/captcha|验证码/i.test(body))return {status:r.status,body,blocked:true};if(r.status>=500&&attempt<2)continue;return {status:r.status,body};}catch(e){last=Date.now();if(attempt===2)return {status:null,error:String(e)}}}}
let main=[...new Set(input.mainDates)], shift=[...new Set(input.shiftCheckDates)].filter(d=>!main.includes(d));
let jobs=[...main.flatMap(d=>['let','lod','ves'].map(s=>[d,s])),...shift.flatMap(d=>['let','lod','ves'].map(s=>[d,s]))];
if(process.argv.includes('--extra')) { let kinds=new Set(['PSALMODIA','LECTIO','HYMNUS','RESPONSORIUM BREVE']); let dates=[...new Set(input.celebrations.filter(c=>c.kinds.some(k=>kinds.has(k))).map(c=>c.date))]; jobs=dates.flatMap(d=>['med','comp'].map(s=>[d,s])); }
if(process.argv.includes('--reparse')) jobs=(await readdir(path('raw/'))).filter(n=>/^\d{4}-\d\d-\d\d-[a-z]+\.html$/.test(n)).map(n=>[n.slice(0,10),n.slice(11,-5)]);
if(process.argv.includes('--offline')) jobs=[['2026-07-03','let'],['2026-07-25','let'],['2026-07-25','lod'],['2026-07-25','ves'],['2026-07-25','med'],['2026-07-25','comp']];
for(const [date,stype] of jobs){let key=`${date}-${stype}`,raw=path(`raw/${key}.html`),txt=path(`text/${key}.json`),url=`https://www.wanyouzhenyuan.cn/index.php?m=daily&stype=${stype}&date=${date}`,status=200,error=null,blocked=false;
 let html;if(await exists(raw)) html=await readFile(raw,'utf8');else {let r=await request(url);status=r.status;error=r.error||(!r.status||r.status<200||r.status>=300?`HTTP ${r.status}`:null);blocked=r.blocked;if(!error&&!blocked){html=r.body;await writeFile(raw,html)}}
 let parsed;if(html){try{if(!process.argv.includes('--reparse') && await exists(txt))parsed=JSON.parse(await readFile(txt,'utf8'));else{parsed=parse(html,date,stype,url);await writeFile(txt,JSON.stringify(parsed,null,2)+'\n')}}catch(e){error=String(e)}}
 let item={date,stype,status,labels:parsed?.sections.map(s=>s.label)||[],error:!!error||blocked,...(error?{message:error}:{}),...(blocked?{message:'403/429 或验证码，停止抓取'}:{}),...(parsed?.warnings?{warnings:parsed.warnings}:{})};entries=entries.filter(e=>e.date!==date||e.stype!==stype);entries.push(item);await save();console.log(key,status,error|| (blocked?'BLOCKED':`sections=${item.labels.length}`));if(blocked)break;
}


