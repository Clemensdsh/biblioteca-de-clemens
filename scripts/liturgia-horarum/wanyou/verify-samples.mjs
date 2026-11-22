import {readFile} from 'node:fs/promises';
const norm=s=>s.replace(/\s/g,'');
const decode=s=>s.replace(/<br\s*\/?\s*>/gi,'').replace(/<[^>]*>/g,'').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1]==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10)):({nbsp:' ',amp:'&',ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’',middot:'·',dagger:'†',hellip:'…',mdash:'—',ndash:'–',quot:'"'})[e]??m);
for(const date of ['2026-07-03','2026-07-25']){
 const html=await readFile(`out/raw/${date}-let.html`,'utf8'), parsed=JSON.parse(await readFile(`out/text/${date}-let.json`,'utf8'));
 const a=html.slice(html.indexOf('<div class="article-content">'),html.indexOf('</div>\n                        <hr/>'));
 let paragraphs=[...a.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)].map(x=>x[0]);let actual=[], active=false;
 for(let p of paragraphs){let b=(p.match(/^<p\b[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>/i)||[])[1];let label=b?decode(b).trim():''; if(/^(诵读[一二]|或：)$/.test(label)){active=true;continue}if(/^对答咏/.test(label)){active=true;p=p.replace(/^(<p\b[^>]*>\s*<strong[^>]*>)对答咏(?:<br\s*\/?>)?/i,'$1'); if(!/^(<p\b[^>]*>\s*<strong[^>]*>\s*领)/i.test(p)) p=p.replace(/^(<p\b[^>]*>\s*<strong[^>]*>\s*<\/strong>)[\s\S]*?<br\s*\/?>/i,'$1');actual.push(norm(decode(p)));continue}if(b && !/^(领：|答：)/.test(label)){active=false}if(active)actual.push(norm(decode(p)))}
 let result=norm(parsed.sections.filter(s=>/^诵读[一二]$|^对答咏$/.test(s.label)).flatMap(s=>s.lines).join(''));let expected=actual.join('');console.log(date,'body equality',result===expected, 'expected',expected.length,'actual',result.length);if(result!==expected){let i=0;while(i<result.length&&result[i]===expected[i])i++;console.log('first difference',i,expected.slice(i,i+80),result.slice(i,i+80));process.exitCode=1}
}
