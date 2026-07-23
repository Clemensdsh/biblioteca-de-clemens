import{$ as e,Bt as t,C as n,G as r,H as i,In as a,K as o,Kt as s,M as c,Pt as l,Q as u,U as d,W as f,Wn as p,Xn as m,Xt as h,br as g,er as _,mn as v,tt as y,wr as b,x,xn as S,y as C,yn as w}from"./framework.-xTZ69yZ.js";import"./chunks/vue-i18n.DV39TuFM.js";import{_ as T,d as E,f as D,g as O,h as k,m as A,p as j}from"./index.BysrbJWy.js";function M(e,t){let n=L(t),r=RegExp(`^##\\s+${ae(n)}\\s*$`,`m`).exec(e);if(!r)return null;let i=r.index,a=e.slice(i+r[0].length).search(/\r?\n---\s*\r?\n\s*##\s+/),o=a>=0?i+r[0].length+a:e.length;return ee(e.slice(i,o))}function ee(e){let t=e.replace(/^---[\s\S]*?---\s*/,``).split(/\r?\n/),n=t.find(e=>/^##\s+/.test(e))?.replace(/^##\s+/,``).trim()||``,r=(t.find(e=>/\*\*Die\s+/i.test(e))||``).match(/\*\*([^*]+)\*\*\s*·\s*(.+)$/),i=[],a=t.findIndex(e=>/^###\s+.*校注/.test(e)),o=a>=0?t.slice(0,a):t,s=null;for(let e of o){let t=e.match(/^\*\*(\d+)(\\?\*)?\\?\.\*\*\s*(.*)$/);if(t){s={number:Number(t[1]),starred:!!t[2],text:I(t[3])},i.push(s);continue}s&&e.trim()&&(s.text=I(`${s.text} ${e}`))}let c=a>=0?t.slice(a).join(`
`).trim():``;return{date_roman:r?`${I(r[1])} · ${I(r[2])}`:``,date_chinese:n,entries:i,content_html:N(te(o).join(`
`)),notes_html:c?N(c):void 0}}function te(e){let t=e.findIndex(e=>/^月龄表/.test(e.trim()));return t>=0?e.slice(t):e}function N(e){return e.split(/\r?\n/).map(e=>e.trim()).filter(Boolean).map(ne).join(`
`)}function ne(e){let t=e.match(/^#{2,3}\s+(.+)$/);if(t)return`<h3>${P(t[1])}</h3>`;let n=e.match(/^\*\*Die\s+([^*]+)\*\*\s*·\s*(.+)$/);if(n)return`<p class="raw-date"><strong>Die ${F(n[1])}</strong> · ${P(n[2])}</p>`;let r=e.match(/^\*\*(\d+)(\\?\*)?\\?\.\*\*\s*(.+)$/);if(r)return`<p class="raw-entry"><span class="raw-number">${`${r[1]}${r[2]?`*`:``}.`}</span> ${P(r[3])}</p>`;let i=e.match(/^(\d+)\\?\.\s+(.+)$/);if(i)return`<p class="raw-note"><span class="raw-number">${i[1]}.</span> ${P(i[2])}</p>`;if(/^月龄表（\*Luna\*）：$/.test(e))return`<p class="raw-luna-title">月龄表（Luna）：</p>`;let a=e.match(/^>\s*(.+)$/);return a?`<p class="raw-luna">${P(a[1])}</p>`:`<p>${P(e)}</p>`}function P(e){return F(e.replace(/\\\*/g,``).replace(/\\\./g,``)).replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`).replace(/\*([^*]+)\*/g,`<em>$1</em>`).replace(/\uE000/g,`*`).replace(/\uE001/g,`.`)}function F(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function I(e){return e.replace(/\\([.*])/g,`$1`).replace(/\*\*([^*]+)\*\*/g,`$1`).replace(/\*([^*]+)\*/g,`$1`).replace(/`([^`]+)`/g,`$1`).replace(/\s+/g,` `).trim()}function L(e){let[t,n]=e.split(`-`).map(Number);return`${re(t)}月${ie(n)}日`}function re(e){return[``,`一`,`二`,`三`,`四`,`五`,`六`,`七`,`八`,`九`,`十`,`十一`,`十二`][e]||String(e)}function ie(e){return`.一.二.三.四.五.六.七.八.九.十.十一.十二.十三.十四.十五.十六.十七.十八.十九.二十.二十一.二十二.二十三.二十四.二十五.二十六.二十七.二十八.二十九.三十.三十一`.split(`.`)[e]||String(e)}function ae(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function oe(e){return{readings:se(e),prayers:ue(e)}}function se(e){let t=R(e,`## 短读经`,`## 祷词`),n=[...t.matchAll(/^\*\*(\d+)\\?\.\*\*\s*(?:\*([^*]+)\*)?\s*(?:（([^）]+)）)?/gm)],r=[];for(let e=0;e<n.length;e++){let i=n[e],a=n[e+1],o=Number(i[1]),s=I(i[2]||`短读经 ${o}`),c=i[3]||``,l=(i.index||0)+i[0].length,u=a?.index??t.length,d=ce(t.slice(l,u).trim(),c),f=pe(o);for(let e=0;e<d.length;e++){let t=d[e];r.push({id:o,title:`${s}${t.citation?`（${t.citation}）`:``}`,occasion:f,text:t.text})}}return r}function ce(e,t){return e.split(/\n(?=或：)/).map((e,n)=>{let r=e.match(/^或：(?:（([^）]+)）)?/);return{citation:n===0?t:r?.[1]||t,text:le(e.replace(/^或：(?:（[^）]+）)?\s*/,``))}}).filter(e=>e.text)}function le(e){return I(e.replace(/^#{1,6}\s+.+$/gm,``).replace(/^>\s*上主的圣言。?\s*$/gm,``).replace(/^>\s*感谢天主。?\s*$/gm,``).replace(/^上主的圣言。?\s*$/gm,``).replace(/^℟\.\s*感谢天主。?\s*$/gm,``).replace(/^感谢天主。?\s*$/gm,``).replace(/^\s*(?:十二月|一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月)[^\n]+：\s*$/gm,``).replace(/^圣诞节八日庆期内主日：\s*$/gm,``))}function ue(e){let t=R(e,`## 祷词`,`## 殉道圣人录咏唱调式`),n=/^\*\*(\d+)\\?\.\*\*\s*(.+?)(?=^\*\*\d+\\?\.\*\*|\n>\s*\[\^|$)/gms,r=[];for(let e of t.matchAll(n))r.push({id:Number(e[1]),title:`第${fe(Number(e[1]))}式`,text:I(e[2])});let i=t.split(`或任选以下祷词之一：`)[0]?.replace(/^##\s+祷词/m,``).replace(/在诵读殉道圣人录[\s\S]*?程式：/,``).trim();return i&&r.unshift({id:0,title:``,text:de(I(i))}),r}function de(e){return e.endsWith(`阿们。`)?e:`${e}阿们。`}function fe(e){let t=[``,`一`,`二`,`三`,`四`,`五`,`六`,`七`,`八`,`九`];if(e<=10)return e===10?`十`:t[e];if(e<20)return`十${t[e-10]}`;let n=Math.floor(e/10),r=e%10;return`${t[n]}十${t[r]}`}function R(e,t,n){let r=e.indexOf(t);if(r<0)return``;let i=e.indexOf(n,r+t.length);return e.slice(r+t.length,i>=0?i:e.length)}function pe(e){return e===1?`advent`:e===2||e===3?`christmas`:e===4?`12-26`:e===5?`12-27`:e===6?`12-28`:e===7?`holy-family`:e===8?`epiphany-eve`:e===9?`epiphany`:e===10?`lent`:e===11?`palm-sunday`:e===12?`holy-triduum`:e===13||e===14?`easter`:e===15?`ascension`:e===16?`pentecost`:e===17?`trinity-sunday`:e===18?`corpus-christi`:e===19?`sacred-heart`:e===20?`christ-king`:e===21?`ordinary`:`reading-${e}`}function z(e){return[String(e.year).padStart(4,`0`),String(e.month).padStart(2,`0`),String(e.day).padStart(2,`0`)].join(`-`)}function B(e){return{year:e.getFullYear(),month:e.getMonth()+1,day:e.getDate()}}function V(e,t){let n=new Date(e.year,e.month-1,e.day);return n.setDate(n.getDate()+t),B(n)}function H(e){return new Date(e.year,e.month-1,e.day).getDay()}function U(e){return`${String(e.month).padStart(2,`0`)}-${String(e.day).padStart(2,`0`)}`}function W(e,t){let n=new Date(e.year,e.month-1,e.day).getTime(),r=new Date(t.year,t.month-1,t.day).getTime();return Math.round((n-r)/864e5)}function G(e){let t=e%19,n=Math.floor(e/100),r=e%100,i=Math.floor(n/4),a=n%4,o=Math.floor((n+8)/25),s=Math.floor((n-o+1)/3),c=(19*t+n-i-s+15)%30,l=Math.floor(r/4),u=r%4,d=(32+2*a+2*l-c-u)%7,f=Math.floor((t+11*c+22*d)/451);return{year:e,month:Math.floor((c+d-7*f+114)/31),day:(c+d-7*f+114)%31+1}}var me={opening:[{id:`opening.deus-in-adiutorium.verse`,type:`verse`,latin:`℣. Deus, in adiutórium meum inténde.`,chinese:`天主，求你快来拯救我；`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`opening.deus-in-adiutorium.response`,type:`response`,latin:`℟. Dómine, ad adiuvándum me festína.`,chinese:`上主，求你速来扶助我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`common.gloria-patri`,type:`verse`,latin:`℣. Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.`,chinese:`愿光荣归于父、及子、及圣神。
起初如何，今日亦然，直到永远。阿们。`,translationStatus:`existing-project-translation`,sourceRefs:[]},{id:`common.alleluia`,type:`verse`,latin:`Allelúia.`,chinese:`阿肋路亚。`,translationStatus:`existing-project-translation`,sourceRefs:[]},{id:`common.laus-tibi`,type:`verse`,latin:`Laus tibi, Dómine, Rex ætérnæ glóriæ.`,chinese:`上主，永恒光荣的君王，赞美归于你。`,translationStatus:`temporary-translation`,sourceRefs:[]}],hymn:[{id:`hymn.iam-lucis.stanza-1`,type:`hymn-stanza`,latin:`Iam lucis orto sídere,
Deum precémur súpplices,
Ut in diúrnis áctibus
Nos servet a nocéntibus.`,chinese:`晨光已升起时，虔诚向主祈求
在此白日行事，护我免受邪害`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`hymn.iam-lucis.stanza-2`,type:`hymn-stanza`,latin:`Linguam refrénans témperet,
Ne litis horror ínsonet:
Visum fovéndo cóntegat,
Ne vanitátes háuriat.`,chinese:`求主节制我舌，勿使争讼声起
慈爱遮护双目，莫让虚妄入心`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`hymn.iam-lucis.stanza-3`,type:`hymn-stanza`,latin:`Sint pura cordis íntima,
Absístat et vecórdia;
Carnis terat supérbiam
Potus cibíque párcitas.`,chinese:`使我内心洁净，愚妄迷情远离
节制饮食诸欲，克胜肉身骄傲`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`hymn.iam-lucis.stanza-4`,type:`hymn-stanza`,latin:`Ut, cum dies abscésserit,
Noctémque sors redúxerit,
Mundi per abstinéntiam
Ipsi canámus glóriam.`,chinese:`白日终将消逝，黑夜复又归来
因克己而自制，向主歌唱光荣`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`hymn.iam-lucis.doxology`,type:`hymn-stanza`,latin:`Deo Patri sit glória,
Eiúsque soli Fílio,
Cum Spíritu Paráclito,
Nunc et per omne sǽculum.
Amen.`,chinese:`愿光荣归圣父，及其唯一圣子
并归护慰之神，自今直到永远
阿们`,translationStatus:`temporary-translation`,sourceRefs:[]}],doxologies:{},quicumque:[{id:`quicumque.1`,type:`psalm-verse`,latin:`Quicúmque vult salvus esse, * ante ómnia opus est, ut téneat cathólicam fidem:`,chinese:`不拘谁愿意得救，必须首先坚持公教会的信仰；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`1`}]},{id:`quicumque.2`,type:`psalm-verse`,latin:`Quam nisi quisque íntegram inviolatámque serváverit, * absque dúbio in ætérnum períbit.`,chinese:`除非谁完整地及不错误地坚信此信仰，无疑地永远丧亡。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`2`}]},{id:`quicumque.3`,type:`psalm-verse`,latin:`Fides autem cathólica hæc est: * ut unum Deum in Trinitáte, et Trinitátem in unitáte venerémur.`,chinese:`公教的信仰如下：我们在三位内恭敬一个天主，及在一体内恭敬三位；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`3`}]},{id:`quicumque.4`,type:`psalm-verse`,latin:`Neque confundéntes persónas, * neque substántiam separántes.`,chinese:`三个位格既不混淆，在实体上也不分离；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`4`}]},{id:`quicumque.5`,type:`psalm-verse`,latin:`Alia est enim persóna Patris, ália Fílii, * ália Spíritus Sancti:`,chinese:`父是一个位格，子是另一个位格，圣神是另一个位格；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`5`}]},{id:`quicumque.6`,type:`psalm-verse`,latin:`Sed Patris, et Fílii, et Spíritus Sancti una est divínitas, * æquális glória, coætérna majéstas.`,chinese:`但父、子及圣神是一个天主，同等的光荣，永远同存的尊威。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`6`}]},{id:`quicumque.7`,type:`psalm-verse`,latin:`Qualis Pater, talis Fílius, * talis Spíritus Sanctus.`,chinese:`父如何，子就如何，圣神也如何。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`7`}]},{id:`quicumque.8`,type:`psalm-verse`,latin:`Increátus Pater, increátus Fílius, * increátus Spíritus Sanctus.`,chinese:`父是非受造的，子是非受造的，圣神是非受造的。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`8`}]},{id:`quicumque.9`,type:`psalm-verse`,latin:`Imménsus Pater, imménsus Fílius, * imménsus Spíritus Sanctus.`,chinese:`父是无限的，子是无限的，圣神是无限的。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`9`}]},{id:`quicumque.10`,type:`psalm-verse`,latin:`Ætérnus Pater, ætérnus Fílius, * ætérnus Spíritus Sanctus.`,chinese:`父是永远的，子是永远的，圣神是永远的。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`10`}]},{id:`quicumque.11`,type:`psalm-verse`,latin:`Et tamen non tres ætérni, * sed unus ætérnus.`,chinese:`但不是三个永远者，而是一个永远者。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`11`}]},{id:`quicumque.12`,type:`psalm-verse`,latin:`Sicut non tres increáti, nec tres imménsi, * sed unus increátus, et unus imménsus.`,chinese:`正如不是三个非受造者，也不是三个无限者，而是一个非受造者及一个无限者。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`12`}]},{id:`quicumque.13`,type:`psalm-verse`,latin:`Simíliter omnípotens Pater, omnípotens Fílius, * omnípotens Spíritus Sanctus.`,chinese:`相似地，父是全能的，子是全能的，圣神是全能的；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`13`}]},{id:`quicumque.14`,type:`psalm-verse`,latin:`Et tamen non tres omnipoténtes, * sed unus omnípotens.`,chinese:`但不是三个全能者，而是一个全能者。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`14`}]},{id:`quicumque.15`,type:`psalm-verse`,latin:`Ita Deus Pater, Deus Fílius, * Deus Spíritus Sanctus.`,chinese:`如此，父是天主，子是天主，圣神是天主；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`15`}]},{id:`quicumque.16`,type:`psalm-verse`,latin:`Et tamen non tres Dii, * sed unus est Deus.`,chinese:`但不是三个天主，而是一个天主。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`16`}]},{id:`quicumque.17`,type:`psalm-verse`,latin:`Ita Dóminus Pater, Dóminus Fílius, * Dóminus Spíritus Sanctus.`,chinese:`如此，父是主，子是主，圣神是主；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`17`}]},{id:`quicumque.18`,type:`psalm-verse`,latin:`Et tamen non tres Dómini, * sed unus est Dóminus.`,chinese:`但不是三个主，而是一个主。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`18`}]},{id:`quicumque.19`,type:`psalm-verse`,latin:`Quia, sicut singillátim unamquámque persónam Deum ac Dóminum confitéri christiána veritáte compéllimur: * ita tres Deos aut Dóminos dícere cathólica religióne prohibémur.`,chinese:`因为，正如基督徒真理命令我们信，从独特性而言，每一位是天主及主；如此，公教会禁止我们说有三个天主，或三个主。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`19`}]},{id:`quicumque.20`,type:`psalm-verse`,latin:`Pater a nullo est factus: * nec creátus, nec génitus.`,chinese:`父不是由别的存有物造成的、受造的、或被生的；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`20`}]},{id:`quicumque.21`,type:`psalm-verse`,latin:`Fílius a Patre solo est: * non factus, nec creátus, sed génitus.`,chinese:`子只是由父而存在的，不是由别的存有物造成的或受造的，而是受生的；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`21`}]},{id:`quicumque.22`,type:`psalm-verse`,latin:`Spíritus Sanctus a Patre et Fílio: * non factus, nec creátus, nec génitus, sed procédens.`,chinese:`圣神不是由别的存有物造成的或受造的，也不是受生的，而是由父及子而发的。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`22`}]},{id:`quicumque.23`,type:`psalm-verse`,latin:`Unus ergo Pater, non tres Patres: unus Fílius, non tres Fílii: * unus Spíritus Sanctus, non tres Spíritus Sancti.`,chinese:`所以，一个父，不是三个父；一个子，不是三个子；一个圣神，不是三个圣神。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`23`}]},{id:`quicumque.24`,type:`psalm-verse`,latin:`Et in hac Trinitáte nihil prius aut postérius, nihil majus aut minus: * sed totæ tres persónæ coætérnæ sibi sunt et coæquáles.`,chinese:`而且，在这圣三内，无先无后，无大无小；反而三位彼此永远同存及同等。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`24`}]},{id:`quicumque.25`,type:`psalm-verse`,latin:`Ita ut per ómnia, sicut iam supra dictum est, * et únitas in Trinitáte, et Trínitas in unitáte veneránda sit.`,chinese:`如此，在一切中，一如上述的，应当尊敬在三位中的一体及在一体中的三位。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`25`}]},{id:`quicumque.26`,type:`psalm-verse`,latin:`Qui vult ergo salvus esse, * ita de Trinitáte séntiat.`,chinese:`所以谁愿意得救，应该认同此圣三的教义。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`26`}]},{id:`quicumque.27`,type:`psalm-verse`,latin:`Sed necessárium est ad ætérnam salútem, * ut Incarnatiónem quoque Dómini nostri Iesu Christi fidéliter credat.`,chinese:`不过，为了永远的救恩，一定也要忠信地信我们的主耶稣基督的降生。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`27`}]},{id:`quicumque.28`,type:`psalm-verse`,latin:`Est ergo fides recta ut credámus et confiteámur, * quia Dóminus noster Iesus Christus, Dei Fílius, Deus et homo est.`,chinese:`真正的信仰要我们信及承认：我们的主耶稣基督、天主子，是天主，同样又是人；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`28`}]},{id:`quicumque.29`,type:`psalm-verse`,latin:`Deus est ex substántia Patris ante sǽcula génitus: * et homo est ex substántia matris in sǽculo natus.`,chinese:`祂是天主，在万世之前由父的实体所生；祂又是人，在时间内由母亲的实体所生；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`29`}]},{id:`quicumque.30`,type:`psalm-verse`,latin:`Perféctus Deus, perféctus homo: * ex ánima rationáli et humána carne subsístens.`,chinese:`祂是完全的天主、完全的人，藉着理性的灵魂及人的血肉而存在；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`30`}]},{id:`quicumque.31`,type:`psalm-verse`,latin:`Æquális Patri secúndum divinitátem: * minor Patre secúndum humanitátem.`,chinese:`按天主性而言，祂与父同等；按人性而言，祂比父小。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`31`}]},{id:`quicumque.32`,type:`psalm-verse`,latin:`Qui licet Deus sit et homo, * non duo tamen, sed unus est Christus.`,chinese:`虽然祂是天主又是人，但不是两个，而是一个基督；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`32`}]},{id:`quicumque.33`,type:`psalm-verse`,latin:`Unus autem non conversióne divinitátis in carnem, * sed assumptióne humanitátis in Deum.`,chinese:`不过，祂是一个，不是因为祂的天主性变成血肉，而是因为祂将人性取到天主内；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`33`}]},{id:`quicumque.34`,type:`psalm-verse`,latin:`Unus omníno, non confusióne substántiæ, * sed unitáte persónæ.`,chinese:`祂是完全的一个，不是因为实体混淆，而是因为位格的统一。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`34`}]},{id:`quicumque.35`,type:`psalm-verse`,latin:`Nam sicut ánima rationális et caro unus est homo: * ita Deus et homo unus est Christus.`,chinese:`正如理性的灵魂与血肉是一个人，如此，天主与人是一个基督。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`35`}]},{id:`quicumque.36`,type:`psalm-verse`,latin:`Qui passus est pro salúte nostra: descéndit ad ínferos: * tértia die resurréxit a mórtuis.`,chinese:`祂为了我们的救恩受难，下降冥府，第三日从死者中复活；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`36`}]},{id:`quicumque.37`,type:`psalm-verse`,latin:`Ascéndit ad cælos, sedet ad déxteram Dei Patris omnipoténtis: * inde ventúrus est iudicáre vivos et mórtuos.`,chinese:`祂升了天，坐在全能天主父的右边，将从那里来临审判生者及死者。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`37`}]},{id:`quicumque.38`,type:`psalm-verse`,latin:`Ad cujus advéntum omnes hómines resúrgere habent cum corpóribus suis; * et redditúri sunt de factis própriis ratiónem.`,chinese:`在祂来临时，众人该在自己的身体内复活，且对自己的行为要交账；`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`38`}]},{id:`quicumque.39`,type:`psalm-verse`,latin:`Et qui bona egérunt, ibunt in vitam ætérnam: * qui vero mala, in ignem ætérnum.`,chinese:`那些行过善的人将入永生，那些行过恶的人则将入永火。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`39`}]},{id:`quicumque.40`,type:`psalm-verse`,latin:`Hæc est fides cathólica, * quam nisi quisque fidéliter firmitérque credíderit, salvus esse non póterit.`,chinese:`这是公教会的信仰：除非人忠信地并坚强地相信，否则将不能得救。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt`,section:`40`}]}],capitulum:{id:`capitulum.regi`,type:`reading`,latin:`Regi sæculórum immortáli et invisíbili, soli Deo honor et glória in sǽcula sæculórum. Amen.`,chinese:`愿尊崇和光荣归于万世的君王，不死不灭、无形的惟一天主，于无穷世之世！阿们。`,translationStatus:`temporary-translation`,sourceRefs:[]},responsory:{ordinary:[{id:`responsory.ordinary.1`,type:`response`,latin:`℟. Christe, Fili Dei vivi, * miserére nobis.`,chinese:`基督，永生天主之子，求你垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.ordinary.2`,type:`verse`,latin:`℣. Qui sedes ad déxteram Patris.`,chinese:`坐在圣父之右者。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.ordinary.3`,type:`response`,latin:`℟. Miserére nobis.`,chinese:`垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.ordinary.4`,type:`verse`,latin:`℣. Glória Patri, et Fílio, * et Spirítui Sancto.`,chinese:`愿光荣归于父、及子、及圣神。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.ordinary.5`,type:`response`,latin:`℟. Christe, Fili Dei vivi, * miserére nobis.`,chinese:`基督，永生天主之子，求你垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]}],passion:[{id:`responsory.christe`,type:`response`,latin:`℟. Christe, Fili Dei vivi, miserére nobis.`,chinese:`基督，永生天主之子，求你垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.qui-sedes`,type:`verse`,latin:`℣. Qui sedes ad déxteram Patris.`,chinese:`坐在圣父之右者。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.christe.repeat`,type:`response`,latin:`℟. Christe, Fili Dei vivi, miserére nobis.`,chinese:`基督，永生天主之子，求你垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]}],paschal:[{id:`responsory.paschal.1`,type:`response`,latin:`℟. Christe, Fili Dei vivi, miserére nobis, allelúia, allelúia.`,chinese:`基督，永生天主之子，求你垂怜我们，阿肋路亚，阿肋路亚。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.qui-surrexisti`,type:`verse`,latin:`℣. Qui surrexísti a mórtuis, allelúia.`,chinese:`从死者中复活者，阿肋路亚。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.paschal.2`,type:`response`,latin:`℟. Miserére nobis, allelúia, allelúia.`,chinese:`垂怜我们，阿肋路亚，阿肋路亚。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.paschal.gloria`,type:`verse`,latin:`℣. Glória Patri, et Fílio, et Spirítui Sancto.`,chinese:`愿光荣归于父、及子、及圣神。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.paschal.3`,type:`response`,latin:`℟. Christe, Fili Dei vivi, miserére nobis, allelúia, allelúia.`,chinese:`基督，永生天主之子，求你垂怜我们，阿肋路亚，阿肋路亚。`,translationStatus:`temporary-translation`,sourceRefs:[]}],versum:[{id:`responsory.exsurge`,type:`verse`,latin:`℣. Exsúrge, Christe, ádiuva nos.`,chinese:`基督，求你兴起，援助我们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`responsory.libera`,type:`response`,latin:`℟. Et líbera nos propter nomen tuum.`,chinese:`为了你的圣名，求你解救我们。`,translationStatus:`temporary-translation`,sourceRefs:[]}],properVerses:{ordinary:{id:`responsory.proper.ordinary`,type:`verse`,latin:`℣. Qui sedes ad déxteram Patris.`,chinese:`坐在圣父之右者。`,translationStatus:`temporary-translation`,sourceRefs:[]},adv:{id:`responsory.proper.adv`,type:`verse`,latin:`℣. Qui ventúrus es in mundum.`,chinese:`即将来临于世者。`,translationStatus:`temporary-translation`,sourceRefs:[]},nat:{id:`responsory.proper.nat`,type:`verse`,latin:`℣. Qui natus es de María Vírgine.`,chinese:`由童贞玛利亚所生者。`,translationStatus:`temporary-translation`,sourceRefs:[]},epi:{id:`responsory.proper.epi`,type:`verse`,latin:`℣. Qui apparuísti hódie.`,chinese:`今日显现者。`,translationStatus:`temporary-translation`,sourceRefs:[]},pasch:{id:`responsory.proper.pasch`,type:`verse`,latin:`℣. Qui surrexísti a mórtuis.`,chinese:`从死者中复活者。`,translationStatus:`temporary-translation`,sourceRefs:[]},asc:{id:`responsory.proper.asc`,type:`verse`,latin:`℣. Qui scandis super sídera.`,chinese:`升于星辰之上者。`,translationStatus:`temporary-translation`,sourceRefs:[]},pent:{id:`responsory.proper.pent`,type:`verse`,latin:`℣. Qui sedes ad déxteram Patris.`,chinese:`坐在圣父之右者。`,translationStatus:`temporary-translation`,sourceRefs:[]},corp:{id:`responsory.proper.corp`,type:`verse`,latin:`℣. Qui natus est de María Vírgine.`,chinese:`由童贞玛利亚所生者。`,translationStatus:`temporary-translation`,sourceRefs:[]},heart:{id:`responsory.proper.heart`,type:`verse`,latin:`℣. Qui corde fundis grátiam.`,chinese:`从圣心倾注恩宠者。`,translationStatus:`temporary-translation`,sourceRefs:[]}}},collect:{id:`collect.domine-deus`,type:`prayer`,latin:`Dómine Deus omnípotens, qui ad princípium huius diéi nos perveníre fecísti: tua nos hódie salva virtúte; ut in hac die ad nullum declinémus peccátum, sed semper ad tuam iustítiam faciéndam nostra procédant elóquia, dirigántur cogitatiónes et ópera. Per Christum Dóminum nostrum. Amen.`,chinese:`上主、全能的天主，你使我们得以迎来这一天的开始；求你今天以你的大能护佑我们，使我们在这一天不陷于任何罪恶；使我们的言语常以履行你的正义为依归，并使我们的思想和行为都蒙你引导。以上所求，是靠我们的主基督。阿们。`,translationStatus:`temporary-translation`,sourceRefs:[]},pretiosa:[{id:`martyrology.pretiosa.verse`,type:`verse`,latin:`℣. Pretiósa in conspéctu Dómini.`,chinese:`在上主台前何其珍贵的，`,translationStatus:`existing-project-translation`,sourceRefs:[]},{id:`martyrology.pretiosa.response`,type:`response`,latin:`℟. Mors Sanctórum eius.`,chinese:`是祂圣徒们的死亡。`,translationStatus:`existing-project-translation`,sourceRefs:[]},{id:`martyrology.sancta-maria`,type:`prayer`,latin:`Sancta María et omnes Sancti intercédant pro nobis ad Dóminum, ut nos mereámur ab eo adiuvári et salvári, qui vivit et regnat in sǽcula sæculórum. Amen.`,chinese:`愿圣母玛利亚和诸圣在上主台前为我们转求，使我们堪当蒙他助佑和拯救；他永生永王，世世无穷。阿们。`,translationStatus:`temporary-translation`,sourceRefs:[]}],chapter:[{id:`chapter.deus-in-adiutorium.1`,type:`verse`,latin:`℣. Deus, in adiutórium meum inténde.`,chinese:`天主，求你快来拯救我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.deus-in-adiutorium.1.response`,type:`response`,latin:`℟. Dómine, ad adiuvándum me festína.`,chinese:`上主，求你速来扶助我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.deus-in-adiutorium.2`,type:`verse`,latin:`℣. Deus, in adiutórium meum inténde.`,chinese:`天主，求你快来拯救我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.deus-in-adiutorium.2.response`,type:`response`,latin:`℟. Dómine, ad adiuvándum me festína.`,chinese:`上主，求你速来扶助我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.deus-in-adiutorium.3`,type:`verse`,latin:`℣. Deus, in adiutórium meum inténde.`,chinese:`天主，求你快来拯救我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.deus-in-adiutorium.3.response`,type:`response`,latin:`℟. Dómine, ad adiuvándum me festína.`,chinese:`上主，求你速来扶助我。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.gloria-patri`,type:`verse`,latin:`℣. Glória Patri, et Fílio, et Spirítui Sancto.`,chinese:`愿光荣归于父、及子、及圣神。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.sicut-erat`,type:`response`,latin:`℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen. Allelúia.`,chinese:`起初如何，今日亦然，直到永远。阿们。阿肋路亚。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.kyrie`,type:`verse`,latin:`Kýrie, eléison. Christe, eléison. Kýrie, eléison.`,chinese:`上主，求你垂怜。基督，求你垂怜。上主，求你垂怜。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.pater-secret`,type:`prayer`,latin:`Pater noster, qui es in cælis, sanctificétur nomen tuum. Advéniat regnum tuum. Fiat volúntas tua, sicut in cælo et in terra. Panem nostrum cotidiánum da nobis hódie. Et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris.`,chinese:`我们的天父，愿你的名受显扬，愿你的国来临，愿你的旨意奉行在人间，如同在天上。求你今天赏给我们日用的食粮；求你宽恕我们的罪过，如同我们宽恕别人一样。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.et-ne-nos`,type:`verse`,latin:`℣. Et ne nos indúcas in tentatiónem.`,chinese:`不要让我们陷于诱惑；`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.sed-libera`,type:`response`,latin:`℟. Sed líbera nos a malo.`,chinese:`但救我们免于凶恶。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.respice`,type:`verse`,latin:`℣. Réspice in servos tuos, Dómine, et in ópera tua, et dírige fílios eórum.`,chinese:`上主，求你垂顾你的仆人和你的化工，并引导他们的子孙。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.respice.response`,type:`response`,latin:`℟. Et sit splendor Dómini Dei nostri super nos, et ópera mánuum nostrárum dírige super nos, et opus mánuum nostrárum dírige.`,chinese:`愿上主、我们的天主，以他的光辉照临我们；求你促使我们双手所作的工作顺利成功，求你促使我们双手所作的工作顺利成功。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`chapter.dirigere`,type:`prayer`,latin:`Dirígere et sanctificáre, régere et gubernáre dignáre, Dómine Deus, Rex cæli et terræ, hódie corda et córpora nostra, sensus, sermónes et actus nostros in lege tua, et in opéribus mandatórum tuórum: ut hic et in ætérnum, te auxiliánte, salvi et líberi esse mereámur, Salvátor mundi: qui vivis et regnas in sǽcula sæculórum. Amen.`,chinese:`上主天主、天地的君王、世界的救主，求你垂允，今天引导并圣化、统御并治理我们的心灵和身体、感官、言语和行为，使这一切遵循你的法律，实行你的诫命；赖你的助佑，使我们今世及永世堪当得救，获享自由。你永生永王，世世无穷。阿们。`,translationStatus:`temporary-translation`,sourceRefs:[]}],lectioFormulae:{privateBlessing:{id:`lectio.iube-domine`,type:`verse`,latin:`Iube, Dómine, benedícere.`,chinese:`上主，求你降福。`,translationStatus:`temporary-translation`,sourceRefs:[]},choirBlessing:{id:`lectio.iube-domne`,type:`verse`,latin:`Iube, domne, benedícere.`,chinese:`请神父祝福。`,translationStatus:`temporary-translation`,sourceRefs:[]},conclusion:[{id:`lectio.tu-autem`,type:`verse`,latin:`℣. Tu autem, Dómine, miserére nobis.`,chinese:`上主，求你垂怜我们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`common.deo-gratias`,type:`response`,latin:`℟. Deo grátias.`,chinese:`感谢天主。`,translationStatus:`existing-project-translation`,sourceRefs:[]}]},ending:[{id:`ending.adjutorium`,type:`verse`,latin:`℣. Adiutórium nostrum in nómine Dómini.`,chinese:`上主的圣名，是我们的助佑。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`ending.qui-fecit`,type:`response`,latin:`℟. Qui fecit cælum et terram.`,chinese:`因他创造了天地。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`ending.benedicite`,type:`verse`,latin:`℣. Benedicite.`,chinese:`请［降福我们］。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`ending.deus`,type:`response`,latin:`℟. Deus.`,chinese:`［愿］天主［降福我们］。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`ending.dominus-nos`,type:`prayer`,latin:`Dóminus nos benedícat, et ab omni malo deféndat, et ad vitam perdúcat ætérnam.`,chinese:`愿上主降福我们，保护我们免于一切凶恶，引领我们到达永生。阿们。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`ending.fidelium`,type:`verse`,latin:`℣. Fidélium ánimæ per misericórdiam Dei requiéscant in pace.`,chinese:`凡诸信者灵魂，赖天主仁慈，息止安所。`,translationStatus:`temporary-translation`,sourceRefs:[]},{id:`common.amen`,type:`response`,latin:`℟. Amen.`,chinese:`阿们。`,translationStatus:`existing-project-translation`,sourceRefs:[]}]},he={"Per Annum":{id:`lectio.per-annum`,type:`reading`,latin:`℣. Dóminus autem dírigat corda et córpora nostra in caritáte Dei et patiéntia Christi.`,chinese:`愿主指引我们的心神和身体，使我们爱天主，并学习基督的坚忍。`,translationStatus:`existing-project-translation`,sourceRefs:[]},Adv:{id:`lectio.adv`,type:`reading`,latin:`℣. Dómine, miserére nostri: te enim exspectávimus: esto brácchium nostrum in mane, et salus nostra in témpore tribulatiónis.`,chinese:`上主，求你怜悯我们，因为我们仰望你；求你每日清晨作我们的臂膊，在患难时期作我们的救援。`,translationStatus:`temporary-translation`,sourceRefs:[]},Nat:{id:`lectio.nat`,type:`reading`,latin:`℣. Ipsi períbunt, tu autem permanébis; et omnes sicut vestiméntum veteráscent: et velut amíctum mutábis eos, et mutabúntur: tu autem idem ipse es, et anni tui non defícient.`,chinese:`诸天必要灭亡，你却永存；万物都要像衣服一样陈旧；你要把它们像外衣一样更换，它们就要改变；可是你仍是同一位，你的岁月永无穷尽。`,translationStatus:`temporary-translation`,sourceRefs:[]},Epi:{id:`lectio.epi`,type:`reading`,latin:`℣. Omnes de Saba vénient, aurum et thus deferéntes, et laudem Dómino annuntiántes.`,chinese:`众人都要由舍巴前来，携带黄金和乳香，传扬对上主的赞颂。`,translationStatus:`temporary-translation`,sourceRefs:[]},Asc:{id:`lectio.asc`,type:`reading`,latin:`℣. Viri Galilǽi, quid statis aspiciéntes in cælum? Hic Iesus, qui assúmptus est a vobis in cælum, sic véniet, quemádmodum vidístis eum eúntem in cælum.`,chinese:`加里肋亚人，你们为什么站着望天？这位离开你们、被接到天上去的耶稣，你们看见他怎样升了天，也要怎样降来。`,translationStatus:`temporary-translation`,sourceRefs:[]},Quad:{id:`lectio.quad`,type:`reading`,latin:`℣. Quǽrite Dóminum dum inveníri potest: invocáte eum, dum prope est.`,chinese:`趁上主可找到的时候寻找他；趁他临近的时候呼求他。`,translationStatus:`temporary-translation`,sourceRefs:[]},Quad5:{id:`lectio.quad5`,type:`reading`,latin:`℣. Fáciem meam non avérti ab increpántibus, et conspuéntibus in me. Dóminus Deus auxiliátor meus, et ídeo non sum confúsus.`,chinese:`我没有转面躲避斥责我和唾污我的人。上主天主是我的助佑，因此我不至蒙羞。`,translationStatus:`temporary-translation`,sourceRefs:[]},Pasch:{id:`lectio.pasch`,type:`reading`,latin:`℣. Si consurrexístis cum Christo, quæ sursum sunt quǽrite, ubi Christus est in déxtera Dei sedens: quæ sursum sunt sápite, non quæ super terram.`,chinese:`你们既然与基督一同复活，就该寻求天上的事，那里有基督坐在天主右边；你们该思念天上的事，不该思念地上的事。`,translationStatus:`temporary-translation`,sourceRefs:[]},Pent:{id:`lectio.pent`,type:`reading`,latin:`℣. Iudǽi quoque, et Prosélyti, Cretes, et Arabes: audívimus eos loquéntes nostris linguis magnália Dei.`,chinese:`犹太人和归依犹太教的人、克里特人和阿剌伯人，我们都听见他们用我们的语言讲论天主的奇事。`,translationStatus:`temporary-translation`,sourceRefs:[]}},ge={generatedAt:`2026-07-17`,upstreamRepository:`https://github.com/DivinumOfficium/divinum-officium`,upstreamCommit:`7357486cedf0bd65298bb9da4760f7e4c40ea882`,license:`MIT`,sourceFiles:[`web/www/horas/Latin/Psalterium/Special/Prima Special.txt`,`web/www/horas/Latin/Psalterium/Common/Prayers.txt`,`web/www/horas/Latin/Psalterium/Common/Rubricae.txt`,`web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt`,`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`],generatedFiles:[`public/data/prima1962/manifest.json`,`public/data/prima1962/fixed-texts.json`,`public/data/prima1962/psalmody.json`,`public/data/prima1962/psalms-latin.json`,`public/data/prima1962/psalms-chinese.json`,`public/data/prima1962/lectio-brevis.json`,`public/data/prima1962/translation-status.json`,`resources/texts/prima1962-antiphons-bilingual.txt`,`resources/texts/prima1962-responsory-verses-bilingual.txt`,`resources/texts/prima1962-lectio-brevis-bilingual.txt`,`resources/texts/prima1962-variable-texts-bilingual.txt`,`docs/prima1962-psalm-alignment-report.md`],normalized:[`J/I spelling in selected displayed Latin`,`adjutorium to adiutorium`,`Jam to Iam`,`Sigaō psalm text converted from Traditional to Simplified Chinese with OpenCC`,`Psalm superscriptions removed where they are not present in the Latin office text`],notImported:[`web/www/horas/Latin/Martyrologium1960/`]},_e={Dominica:{antiphon:`Allelúja, * confitémini Dómino, quóniam in sǽculum misericórdia eius, allelúja, allelúja.`,antiphonChinese:`阿肋路亚，请赞颂上主，因为他的慈爱永远常存，阿肋路亚，阿肋路亚。`,psalms:[`117`,`118(1-16)`,`118(17-32)`]},"Feria II":{antiphon:`Ínnocens mánibus * et mundo corde ascéndet in montem Dómini.`,antiphonChinese:`手洁心清的人，必登上上主的圣山。`,psalms:[`23`,`18(2-'7b')`,`18(8-'15b')`]},"Feria III":{antiphon:`Deus meus * in te confído non erubéscam.`,antiphonChinese:`我的天主，我信赖你，决不蒙羞。`,psalms:[`24(1-7)`,`24(8-14)`,`24(15-22)`]},"Feria IV":{antiphon:`Misericórdia tua, * Dómine, ante óculos meos: et complácui in veritáte tua.`,antiphonChinese:`上主，你的慈爱常在我眼前；我常遵照你的真理而行。`,psalms:[`25`,`51`,`52`]},"Feria V":{antiphon:`In loco páscuæ * ibi Dóminus me collocávit.`,antiphonChinese:`上主使我安卧在青草地上。`,psalms:[`22`,`71(2-8)`,`71(9-19)`]},"Feria VI":{antiphon:`Ne discédas a me, * Dómine: quóniam tribulátio próxima est: quóniam non est qui ádjuvet.`,antiphonChinese:`上主，求你不要远离我；因为患难已经临近，无人前来扶助。`,psalms:[`21(2-12)`,`21(13-23)`,`21(24-32)`]},Sabbato:{antiphon:`Exaltáre, Dómine, * qui júdicas terram: redde retributiónem supérbis.`,antiphonChinese:`审判大地的上主，求你奋起；向骄傲者施以报应。`,psalms:[`93(1-11)`,`93(12-23)`,`107`]},seasonalAntiphons:JSON.parse(`{"Adv1":[{"id":"Adv1.1","latin":"In illa die * stillábunt montes dulcédinem, et colles fluent lac et mel, allelúja.","chinese":"在那一天，山岳要滴下甘饴，丘陵要流出奶与蜜，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv1]"}]},{"id":"Adv1.2","latin":"Jucundáre, * fília Sion, et exsúlta satis, fília Jerúsalem, allelúja.","chinese":"熙雍女子，你要欢乐；耶路撒冷女子，你要踊跃欢欣，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv1]"}]},{"id":"Adv1.3","latin":"Ecce Dóminus véniet, * et omnes Sancti eius cum eo: et erit in die illa lux magna, allelúja.","chinese":"看，上主要来临，他的众圣者也同他一起；那一日必有大光，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv1]"}]},{"id":"Adv1.4","latin":"Omnes sitiéntes, * veníte ad aquas: quærite Dóminum, dum inveníri potest, allelúja.","chinese":"凡口渴的，请到水边来；趁上主可寻时寻找他，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv1]"}]},{"id":"Adv1.5","latin":"Ecce véniet * Prophéta magnus, et ipse renovábit Jerúsalem, allelúja.","chinese":"看，一位伟大的先知要来，他要更新耶路撒冷，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv1]"}]}],"Adv2":[{"id":"Adv2.1","latin":"Ecce in núbibus cæli * Dóminus véniet cum potestáte magna, allelúja.","chinese":"看，上主要乘天上的云彩而来，带着大能，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv2]"}]},{"id":"Adv2.2","latin":"Urbs fortitúdinis * nostræ Sion, Salvátor ponétur in ea murus et antemurále: aperíte portas, quia nobíscum Deus, allelúja.","chinese":"熙雍是我们的坚城；救主将在其中作城墙和外郭。请打开城门，因为天主与我们同在，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv2]"}]},{"id":"Adv2.3","latin":"Ecce apparébit * Dóminus, et non mentiétur: si moram fécerit, exspécta eum, quia véniet, et non tardábit, allelúja.","chinese":"看，上主要显现，决不虚言；若他迟延，仍要等待，因为他必要来，决不迟延，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv2]"}]},{"id":"Adv2.4","latin":"Montes et colles * cantábunt coram Deo laudem, et ómnia ligna silvárum plaudent mánibus: quóniam véniet Dominátor Dóminus in regnum ætérnum, allelúja, allelúja.","chinese":"山岳丘陵要在天主面前高唱赞歌，林中一切树木都要鼓掌；因为主宰上主要来，永远为王，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv2]"}]},{"id":"Adv2.5","latin":"Ecce Dóminus * noster cum virtúte véniet, et illuminábit óculos servórum suórum, allelúja.","chinese":"看，我们的上主要带着德能来临，照明他仆人的眼目，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv2]"}]}],"Adv3":[{"id":"Adv3.1","latin":"Véniet Dóminus, * et non tardábit, et illuminábit abscóndita tenebrárum, et manifestábit se ad omnes gentes, allelúja.","chinese":"上主要来临，决不迟延；他要照明黑暗中的隐秘，向万民显示自己，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv3]"}]},{"id":"Adv3.2","latin":"Jerúsalem, gaude * gáudio magno, quia véniet tibi Salvátor, allelúja.","chinese":"耶路撒冷，你要大大欢乐，因为你的救主要来到你这里，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv3]"}]},{"id":"Adv3.3","latin":"Dabo in Sion * salútem, et in Jerúsalem glóriam meam, allelúja.","chinese":"我要在熙雍赐下救恩，在耶路撒冷彰显我的光荣，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv3]"}]},{"id":"Adv3.4","latin":"Montes et omnes colles * humiliabúntur: et erunt prava in dirécta, et áspera in vias planas: veni, Dómine, et noli tardáre, allelúja.","chinese":"山岳和一切丘陵都要降低，弯曲的要变为正直，崎岖的要成为平路；上主，求你来，不要迟延，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv3]"}]},{"id":"Adv3.5","latin":"Juste et pie * vivámus, exspectántes beátam spem, et advéntum Dómini.","chinese":"愿我们正义、虔敬地生活，期待所希望的幸福和上主的来临。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv3]"}]}],"Adv4":[{"id":"Adv4.1","latin":"Cánite tuba * in Sion, quia prope est dies Dómini: ecce véniet ad salvándum nos, allelúja, allelúja.","chinese":"请在熙雍吹响号角，因为上主的日子临近；看，他要来拯救我们，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv4]"}]},{"id":"Adv4.2","latin":"Ecce véniet * desiderátus cunctis Géntibus: et replébitur glória domus Dómini, allelúja.","chinese":"看，万民所期待者要来临；上主的殿宇将充满光荣，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv4]"}]},{"id":"Adv4.3","latin":"Erunt prava * in dirécta, et áspera in vias planas: veni, Dómine, et noli tardáre, allelúja.","chinese":"弯曲的要变为正直，崎岖的要成为平路；上主，求你来，不要迟延，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv4]"}]},{"id":"Adv4.4","latin":"Dóminus véniet, * occúrrite illi, dicéntes: Magnum princípium, et regni eius non erit finis: Deus, Fortis, Dominátor, Princeps pacis, allelúja, allelúja.","chinese":"上主要来临；请前去迎接他，说：他的王权何其伟大，他的王国没有终结；他是天主、强有力者、主宰、和平之王，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv4]"}]},{"id":"Adv4.5","latin":"Omnípotens Sermo tuus, * Dómine, a regálibus sédibus véniet, allelúja.","chinese":"上主，你全能的圣言要从王座降临，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv4]"}]}],"Adv42":[{"id":"Adv42.1","latin":"Ecce, véniet * Dóminus princeps regum terræ: beáti, qui paráti sunt occúrrere illi.","chinese":"看，上主要来，他是地上列王的元首；准备好迎接他的人是有福的。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv42]"}]},{"id":"Adv42.2","latin":"Cum vénerit * Fílius hóminis, putas, invéniet fidem super terram?","chinese":"人子来临时，能在世上找到信德吗？","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv42]"}]},{"id":"Adv42.3","latin":"Ecce, iam venit * plenitúdo témporis, in quo misit Deus Fílium suum in terras.","chinese":"看，时期一满，天主就派遣了自己的圣子来到世上。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv42]"}]},{"id":"Adv42.4","latin":"Hauriétis aquas * in gáudio de fóntibus Salvatóris.","chinese":"你们要欢欣地从救主的泉源汲水。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv42]"}]},{"id":"Adv42.5","latin":"Egrediétur * Dóminus de loco sancto suo: véniet, ut salvet pópulum suum.","chinese":"上主要从他的圣所出来；他要来拯救自己的子民。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv42]"}]}],"Adv43":[{"id":"Adv43.1","latin":"Roráte, cæli, désuper, * et nubes pluant justum: aperiátur terra, et gérminet Salvatórem.","chinese":"诸天，请由上降下甘露；云彩，请降下义者；愿大地开启，萌生救主。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv43]"}]},{"id":"Adv43.2","latin":"Emítte Agnum, Dómine, * Dominatórem terræ, de Petra desérti, ad montem fíliæ Sion.","chinese":"上主，请从旷野磐石派遣羔羊，作大地的主宰，到熙雍女子的山上。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv43]"}]},{"id":"Adv43.3","latin":"Ut cognoscámus, Dómine, * in terra viam tuam, in ómnibus géntibus salutáre tuum.","chinese":"上主，愿我们在世上认识你的道路，也在万民中认识你的救恩。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv43]"}]},{"id":"Adv43.4","latin":"Da mercédem, Dómine, * sustinéntibus te, ut prophétæ tui fidéles inveniántur.","chinese":"上主，求你赐报酬给期待你的人，使你的先知显为忠信。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv43]"}]},{"id":"Adv43.5","latin":"Lex per Móysen data est; * grátia et véritas per Iesum Christum facta est.","chinese":"法律是藉梅瑟传授的；恩宠和真理却是由耶稣基督而来的。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv43]"}]}],"Adv44":[{"id":"Adv44.1","latin":"Prophétæ prædicavérunt * nasci Salvatórem de Vírgine María.","chinese":"先知们预言救主要由童贞玛利亚诞生。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv44]"}]},{"id":"Adv44.2","latin":"Spíritus * Dómini super me, evangelizáre paupéribus misit me.","chinese":"上主的神临于我身上；他派遣我向贫苦者传报喜讯。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv44]"}]},{"id":"Adv44.3","latin":"Propter Sion * non tacébo, donec egrediátur ut splendor justus eius.","chinese":"为了熙雍，我决不缄默，直到她的义者如光辉出现。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv44]"}]},{"id":"Adv44.4","latin":"Ecce, véniet Dóminus, * ut sédeat cum princípibus, et sólium glóriæ ténuit.","chinese":"看，上主要来，与首领同坐，并执掌光荣的宝座。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv44]"}]},{"id":"Adv44.5","latin":"Annuntiáte * pópulis, et dícite: Ecce, Deus Salvátor noster véniet.","chinese":"请向万民宣告说：看，我们的救主天主要来临。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv44]"}]}],"Adv45":[{"id":"Adv45.1","latin":"De Sion * véniet Dóminus omnípotens, ut salvum fáciat pópulum suum.","chinese":"全能的上主要由熙雍而来，拯救自己的子民。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv45]"}]},{"id":"Adv45.2","latin":"Convértere, Dómine, * aliquántulum, et ne tardes veníre ad servos tuos.","chinese":"上主，求你稍稍转向我们，不要迟延，快来到你的仆人中间。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv45]"}]},{"id":"Adv45.3","latin":"De Sion * véniet, qui regnatúrus est Dóminus, Emmánuel magnum nomen eius.","chinese":"那将要为王的上主要由熙雍而来，他伟大的名号是厄玛奴耳。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv45]"}]},{"id":"Adv45.4","latin":"Ecce Deus meus, * et honorábo eum: Deus patris mei, et exaltábo eum.","chinese":"看，这是我的天主，我要尊崇他；这是我父亲的天主，我要颂扬他。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv45]"}]},{"id":"Adv45.5","latin":"Dóminus * légifer noster, Dóminus Rex noster, ipse véniet, et salvábit nos.","chinese":"上主是我们的立法者，上主是我们的君王；他要来拯救我们。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv45]"}]}],"Adv46":[{"id":"Adv46.1","latin":"Constántes estóte, * vidébitis auxílium Dómini super vos.","chinese":"你们要坚定不移，必要看见上主施于你们的助佑。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv46]"}]},{"id":"Adv46.2","latin":"Ad te, Dómine, * levávi ánimam meam: veni, et éripe me, Dómine, ad te confúgi.","chinese":"上主，我向你举起我的心灵；上主，求你来解救我，我投奔于你。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv46]"}]},{"id":"Adv46.3","latin":"Veni, Dómine, * et noli tardáre: reláxa facínora plebi tuæ Israël.","chinese":"上主，求你来，不要迟延；求你赦免你以色列子民的罪行。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv46]"}]},{"id":"Adv46.4","latin":"Deus a Líbano véniet, * et splendor eius sicut lumen erit.","chinese":"天主要由黎巴嫩而来，他的光辉将如光明。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv46]"}]},{"id":"Adv46.5","latin":"Ego autem * ad Dóminum aspíciam, et exspectábo Deum, Salvatórem meum.","chinese":"至于我，我要仰望上主，期待天主、我的救主。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv46]"}]}],"Adv47":[{"id":"Adv47.1","latin":"Intuémini, * quam sit gloriósus iste, qui ingréditur ad salvándos pópulos.","chinese":"请注视：这位前来拯救万民者何等光荣。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv47]"}]},{"id":"Adv47.2","latin":"Multiplicábitur * eius impérium, et pacis non erit finis.","chinese":"他的王权必要扩展，和平永无终结。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv47]"}]},{"id":"Adv47.3","latin":"Ego Dóminus * prope feci justítiam meam, non elongábitur, et salus mea non morábitur.","chinese":"我是上主；我使我的正义临近，决不远离，我的救恩决不迟延。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv47]"}]},{"id":"Adv47.4","latin":"Exspectétur, * sicut plúvia, elóquium Dómini: et descéndat, sicut ros, super nos Deus noster.","chinese":"愿人期待上主的话语，如期待时雨；愿我们的天主如甘露降临于我们。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv47]"}]},{"id":"Adv47.5","latin":"Parátus esto, * Israël, in occúrsum Dómini, quóniam venit.","chinese":"以色列，请准备迎接上主，因为他即将来临。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Adv47]"}]}],"Quad":[{"id":"Quad.1","latin":"Vivo ego * dicit Dóminus: nolo mortem peccatóris, sed ut magis convertátur et vivat.","chinese":"我指着我的生命起誓，上主说：我不愿罪人死亡，却愿他回头而生活。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad]"}]},{"id":"Quad.2","latin":"Advenérunt nobis * dies pœniténtiæ ad rediménda peccáta, ad salvándas ánimas.","chinese":"补赎的日子已经来到，为赎罪过，为拯救灵魂。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad]"}]},{"id":"Quad.3","latin":"Commendémus nosmetípsos * in multa patiéntia, in jejúniis multis, per arma justítiæ.","chinese":"让我们以极大的忍耐、屡次禁食，并以正义的武器，表明自己。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad]"}]},{"id":"Quad.4","latin":"Per arma justítiæ * virtútis Dei commendémus nosmetípsos in multa patiéntia.","chinese":"让我们藉天主的德能和正义的武器，以极大的忍耐表明自己。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad]"}]}],"Quad5":[{"id":"Quad5_.1","latin":"Líbera me, Dómine, * et pone me juxta te: et cujúsvis manus pugnet contra me.","chinese":"上主，求你解救我，把我安置在你身旁；任谁出手攻击我，也无妨。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad5_]"}]},{"id":"Quad5_.2","latin":"Iudicásti, Dómine, * causam ánimæ meæ, defénsor vitæ meæ, Dómine, Deus meus.","chinese":"上主、我的天主，你为我伸了冤；你是我生命的护卫。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad5_]"}]},{"id":"Quad5_.3","latin":"Pópule meus, * quid feci tibi? aut quid moléstus fui? Respónde mihi.","chinese":"我的子民，我对你做了什么？我在什么事上烦扰了你？请回答我。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad5_]"}]},{"id":"Quad5_.4","latin":"Numquid rédditur * pro bono malum, quia fodérunt fóveam ánimæ meæ.","chinese":"难道竟以恶报善吗？他们竟为我的性命挖掘陷阱。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Quad5_]"}]}],"Pasch":[{"id":"Pasch.1","latin":"Allelúja, * allelúja, allelúja.","chinese":"阿肋路亚，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Pasch]"}]},{"id":"Pasch.2","latin":"Allelúja, * allelúja, allelúja.","chinese":"阿肋路亚，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Pasch]"}]},{"id":"Pasch.3","latin":"Allelúja, * allelúja, allelúja.","chinese":"阿肋路亚，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Pasch]"}]},{"id":"Pasch.4","latin":"Allelúja, * allelúja, allelúja.","chinese":"阿肋路亚，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Pasch]"}]},{"id":"Pasch.5","latin":"Allelúja, * allelúja, allelúja.","chinese":"阿肋路亚，阿肋路亚，阿肋路亚。","translationStatus":"temporary-translation","sourceRefs":[{"file":"Psalmi minor [Pasch]"}]}]}`),properPrimaAntiphons:{"Tempora/Quadp1-0":{id:`Tempora/Quadp1-0`,latin:`Conventióne autem * facta cum operáriis ex denário diúrno, misit eos in víneam suam.`,chinese:`他同工人议定每天一德纳，就派他们到自己的葡萄园里去。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quadp1-0.txt`}]},"Tempora/Quadp2-0":{id:`Tempora/Quadp2-0`,latin:`Semen cécidit * in terram bonam, et áttulit fructum in patiéntia.`,chinese:`种子落在好地里，并以坚忍结出果实。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quadp2-0.txt`}]},"Tempora/Quadp3-0":{id:`Tempora/Quadp3-0`,latin:`Iter faciénte * Iesu, dum appropinquáret Jericho, cæcus clamábat ad eum, ut lumen recípere mererétur.`,chinese:`耶稣在路上，将近耶里哥时，一个瞎子向他呼喊，求能重见光明。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quadp3-0.txt`}]},"Tempora/Quad1-0":{id:`Tempora/Quad1-0`,latin:`Iesus autem * cum jejunásset quadragínta diébus et quadragínta nóctibus, póstea esúriit.`,chinese:`耶稣禁食了四十天四十夜以后，就饿了。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad1-0.txt`}]},"Tempora/Quad2-0":{id:`Tempora/Quad2-0`,latin:`Dómine, * bonum est nos hic esse: si vis, faciámus hic tria tabernácula; tibi unum, Móysi unum, et Elíæ unum.`,chinese:`主，我们在这里真好；你若愿意，我们就在这里搭三个帐棚：一个为你，一个为梅瑟，一个为厄里亚。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad2-0.txt`}]},"Tempora/Quad3-0":{id:`Tempora/Quad3-0`,latin:`Et cum ejecísset Iesus * dæmónium, locútus est mutus, et admirátæ sunt turbæ.`,chinese:`耶稣驱逐魔鬼以后，哑巴便说了话，群众都惊奇不已。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad3-0.txt`}]},"Tempora/Quad4-0":{id:`Tempora/Quad4-0`,latin:`Accépit ergo * Iesus panes, et, cum grátias egísset, distríbuit discumbéntibus.`,chinese:`于是耶稣拿起饼，祝谢后，分给坐席的人。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad4-0.txt`}]},"Tempora/Quad5-0":{id:`Tempora/Quad5-0`,latin:`Ego dæmónium non hábeo, * sed honorífico Patrem meum, dicit Dóminus.`,chinese:`上主说：我没有附魔；我却尊敬我的父。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad5-0.txt`}]},"Tempora/Quad6-0":{id:`Tempora/Quad6-0`,latin:`Púeri Hebræórum * tolléntes ramos olivárum, obviavérunt Dómino clamántes et dicéntes: Hosánna in excélsis.`,chinese:`希伯来儿童拿着橄榄枝，前去迎接上主，呼喊说：贺三纳于至高之天。`,translationStatus:`temporary-translation`,sourceRefs:[{file:`Tempora/Quad6-0.txt`}]}}},ve={22:[{id:`psalm.22.1`,verse:1,latin:`Dóminus regit me, et nihil mihi déerit: * in loco páscuæ ibi me collocávit.`,chinese:`上主是我的牧者， 我实在一无所缺。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:1`}]},{id:`psalm.22.2`,verse:2,latin:`Super aquam refectiónis educávit me: * ánimam meam convértit.`,chinese:`他使我卧在青绿的草场， 又领我走近幽静的水旁，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:2`}]},{id:`psalm.22.3`,verse:3,latin:`Dedúxit me super sémitas justítiæ, * propter nomen suum.`,chinese:`还使我的心灵得到舒畅。 他为了自己名号的原由， 领我踏上了正义的坦途。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:3`}]},{id:`psalm.22.4`,verse:4,latin:`Nam, et si ambulávero in médio umbræ mortis, non timébo mala: * quóniam tu mecum es.`,chinese:`纵使我应走过阴森的幽谷， 我不怕凶险，因你与我同在。 你的牧杖和短棒， 是我的安慰舒畅。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:4`}]},{id:`psalm.22.4`,verse:4,latin:`Virga tua, et báculus tuus: * ipsa me consoláta sunt.`,chinese:`纵使我应走过阴森的幽谷， 我不怕凶险，因你与我同在。 你的牧杖和短棒， 是我的安慰舒畅。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:4`}]},{id:`psalm.22.5`,verse:5,latin:`Parásti in conspéctu meo mensam, * advérsus eos, qui tríbulant me.`,chinese:`在我对头面前，你为我摆设了筵席 在我的头上傅油，使我的杯爵满溢。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:5`}]},{id:`psalm.22.5`,verse:5,latin:`Impinguásti in óleo caput meum: * et calix meus inébrians quam præclárus est!`,chinese:`在我对头面前，你为我摆设了筵席 在我的头上傅油，使我的杯爵满溢。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:5`}]},{id:`psalm.22.6`,verse:6,latin:`Et misericórdia tua subsequétur me * ómnibus diébus vitæ meæ:`,chinese:`在我一生岁月里，幸福与慈爱常随不离 我将住在上主的殿里，直至悠远的时日。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:6`}]},{id:`psalm.22.6`,verse:6,latin:`Et ut inhábitem in domo Dómini, * in longitúdinem diérum.`,chinese:`在我一生岁月里，幸福与慈爱常随不离 我将住在上主的殿里，直至悠远的时日。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm22.txt`,section:`22:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 22:6`}]}],23:[{id:`psalm.23.1`,verse:1,latin:`Dómini est terra, et plenitúdo eius: * orbis terrárum, et univérsi qui hábitant in eo.`,chinese:`大地和其中的万物，属于上主， 世界和其间的居民，属于上主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:1`}]},{id:`psalm.23.2`,verse:2,latin:`Quia ipse super mária fundávit eum: * et super flúmina præparávit eum.`,chinese:`是他在海洋上奠定了大地， 是他在江河上建立了全世。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:2`}]},{id:`psalm.23.3`,verse:3,latin:`Quis ascéndet in montem Dómini? * aut quis stabit in loco sancto eius?`,chinese:`谁能登上上主的圣山？ 谁能居留在他的圣殿？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:3`}]},{id:`psalm.23.4`,verse:4,latin:`Ínnocens mánibus et mundo corde, * qui non accépit in vano ánimam suam, nec jurávit in dolo próximo suo.`,chinese:`是那手洁心清，不慕虚幻的人， 是那不发假誓，不行欺骗的人。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:4`}]},{id:`psalm.23.5`,verse:5,latin:`Hic accípiet benedictiónem a Dómino: * et misericórdiam a Deo, salutári suo.`,chinese:`他必获得上主的祝福 和拯救者天主的报酬。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:5`}]},{id:`psalm.23.6`,verse:6,latin:`Hæc est generátio quæréntium eum, * quæréntium fáciem Dei Iacob.`,chinese:`这样的人是寻求上主的苗裔， 追求雅各伯天主仪容的子息。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:6`}]},{id:`psalm.23.7`,verse:7,latin:`Attóllite portas, príncipes, vestras, et elevámini, portæ æternáles: * et introíbit Rex glóriæ.`,chinese:`城门，请提高你们的门楣， 古老的门户，请加大门扉， 则 因为要欢迎光荣的君王。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:7`}]},{id:`psalm.23.8`,verse:8,latin:`Quis est iste Rex glóriæ? * Dóminus fortis et potens: Dóminus potens in prǽlio.`,chinese:`谁是这位光荣的君主？ 就是英勇大能的上主， 是那有力作战的天主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:8`}]},{id:`psalm.23.9`,verse:9,latin:`Attóllite portas, príncipes, vestras, et elevámini, portæ æternáles: * et introíbit Rex glóriæ.`,chinese:`城门，请提高你们的门楣， 古老的门户，请加大门扉， 因为要欢迎光荣的君主，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:9`}]},{id:`psalm.23.10`,verse:10,latin:`Quis est iste Rex glóriæ? * Dóminus virtútum ipse est Rex glóriæ.`,chinese:`谁是这位光荣的君主？ 其实这位光荣的君主， 就是万军之军的上主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm23.txt`,section:`23:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 23:10`}]}],25:[{id:`psalm.25.1`,verse:1,latin:`Júdica me, Dómine, quóniam ego in innocéntia mea ingréssus sum: * et in Dómino sperans non infirmábor.`,chinese:`上主，求你替我主持正义，因我行动无辜， 我曾毫不犹豫地全心依赖了上主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:1`}]},{id:`psalm.25.2`,verse:2,latin:`Proba me, Dómine, et tenta me: * ure renes meos et cor meum.`,chinese:`上主，你尽管对我试验，对我查考， 你尽管对我的五内和心脏探讨`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:2`}]},{id:`psalm.25.3`,verse:3,latin:`Quóniam misericórdia tua ante óculos meos est: * et complácui in veritáte tua.`,chinese:`原来你的慈爱常摆在我眼前， 我常遵照你的真理行走盘桓。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:3`}]},{id:`psalm.25.4`,verse:4,latin:`Non sedi cum concílio vanitátis: * et cum iníqua geréntibus non introíbo.`,chinese:`我决不与虚伪的人同坐， 也决不与欺诈的人合作`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:4`}]},{id:`psalm.25.5`,verse:5,latin:`Odívi ecclésiam malignántium: * et cum ímpiis non sedébo.`,chinese:`我常痛恨败类的集会， 我也决不与恶人同席。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:5`}]},{id:`psalm.25.6`,verse:6,latin:`Lavábo inter innocéntes manus meas: * et circúmdabo altáre tuum, Dómine:`,chinese:`上主我要洗手表明无罪， 我要走在你的祭坛周围，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:6`}]},{id:`psalm.25.7`,verse:7,latin:`Ut áudiam vocem laudis, * et enárrem univérsa mirabília tua.`,chinese:`为能高声向你称扬赞颂， 传述你的一切奇妙化工。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:7`}]},{id:`psalm.25.8`,verse:8,latin:`Dómine, diléxi decórem domus tuæ, * et locum habitatiónis glóriæ tuæ.`,chinese:`上主，我喜爱你所住的殿堂， 就是你那荣耀寄居的地方。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:8`}]},{id:`psalm.25.9`,verse:9,latin:`Ne perdas cum ímpiis, Deus, ánimam meam, * et cum viris sánguinum vitam meam:`,chinese:`求你不要把我的灵魂，和罪人们一起收去 求你不要把我的生命，与流血者一起产除。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:9`}]},{id:`psalm.25.10`,verse:10,latin:`In quorum mánibus iniquitátes sunt: * déxtera eórum repléta est munéribus.`,chinese:`因为他们的手中尽是罪污， 他们的右手满是贿赂`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:10`}]},{id:`psalm.25.11`,verse:11,latin:`Ego autem in innocéntia mea ingréssus sum: * rédime me, et miserére mei.`,chinese:`我却一向行动无辜， 求你救我，求你怜恤。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:11`}]},{id:`psalm.25.12`,verse:12,latin:`Pes meus stetit in dirécto: * in ecclésiis benedícam te, Dómine.`,chinese:`我的脚站立于平坦大路， 在集会中我要赞颂上主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm25.txt`,section:`25:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 25:12`}]}],51:[{id:`psalm.51.3`,verse:3,latin:`Quid gloriáris in malítia, * qui potens es in iniquitáte?`,chinese:`你这以作恶多端为能事的人！ 你为什么竟以犯罪为荣为幸？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:3`}]},{id:`psalm.51.4`,verse:4,latin:`Tota die injustítiam cogitávit lingua tua: * sicut novácula acúta fecísti dolum.`,chinese:`你这欺诈的人，你时时怀念邪恶， 你的舌头正如一把锐利的剃刀。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:4`}]},{id:`psalm.51.5`,verse:5,latin:`Dilexísti malítiam super benignitátem: * iniquitátem magis quam loqui æquitátem.`,chinese:`你爱作恶超过行善， 你爱说谎超过真言。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:5`}]},{id:`psalm.51.6`,verse:6,latin:`Dilexísti ómnia verba præcipitatiónis, * lingua dolósa.`,chinese:`你这欺诈虚伪的舌头， 凡伤人的话你都羡慕。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:6`}]},{id:`psalm.51.7`,verse:7,latin:`Proptérea Deus déstruet te in finem, * evéllet te, et emigrábit te de tabernáculo tuo: et radícem tuam de terra vivéntium.`,chinese:`为此，天主必要消灭你，把你永远废去， 要从帐幕中拔去你，由人间将你根除。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:7`}]},{id:`psalm.51.8`,verse:8,latin:`Vidébunt justi, et timébunt, et super eum ridébunt, et dicent: * Ecce homo, qui non pósuit Deum adiutórem suum:`,chinese:`义人见了必然害怕要对他冷嘲热笑说`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:8`}]},{id:`psalm.51.9`,verse:9,latin:`Sed sperávit in multitúdine divitiárum suárum: * et præváluit in vanitáte sua.`,chinese:`「请看，这便是那不以天主作自己保障的人，他只依恃自己的财富，以邪恶而夸胜。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:9`}]},{id:`psalm.51.10`,verse:10,latin:`Ego autem, sicut olíva fructífera in domo Dei, * sperávi in misericórdia Dei in ætérnum: et in sǽculum sǽculi.`,chinese:`我却好像天主殿中的茂盛橄榄树，全心信赖天主的慈爱，一直到永久。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:10`}]},{id:`psalm.51.11`,verse:11,latin:`Confitébor tibi in sǽculum, quia fecísti: * et exspectábo nomen tuum, quóniam bonum est in conspéctu sanctórum tuórum.`,chinese:`上主，因你行了此事，我要永远向你称颂，我要在你圣徒面前，赞扬你美善的圣名。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm51.txt`,section:`51:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 51:11`}]}],52:[{id:`psalm.52.1`,verse:1,latin:`Dixit insípiens in corde suo: * Non est Deus.`,chinese:`愚妄的人心中说：「没有天主」，他们都丧尽天良，恣意作恶。行善的人实在找不到一个。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:1`}]},{id:`psalm.52.2`,verse:2,latin:`Corrúpti sunt, et abominábiles facti sunt in iniquitátibus: * non est qui fáciat bonum.`,chinese:`愚妄的人心中说：「没有天主」，他们都丧尽天良，恣意作恶。行善的人实在找不到一个。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:2`}]},{id:`psalm.52.3`,verse:3,latin:`Deus de cælo prospéxit super fílios hóminum: * ut vídeat si est intéllegens, aut requírens Deum.`,chinese:`天主由高天俯视世人的子孙，察看有无寻觅天主的明智人，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:3`}]},{id:`psalm.52.4`,verse:4,latin:`Omnes declinavérunt, simul inútiles facti sunt: * non est qui fáciat bonum, non est usque ad unum.`,chinese:`人人都离弃了正道，趋向邪恶，没有一人行善，实在没有一个。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:4`}]},{id:`psalm.52.5`,verse:5,latin:`Nonne scient omnes qui operántur iniquitátem, * qui dévorant plebem meam ut cibum panis?`,chinese:`那些作奸犯科的人，吞我民如食馒头；总不呼号天主的人，岂不是愚蠢糊涂？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:5`}]},{id:`psalm.52.6`,verse:6,latin:`Deum non invocavérunt: * illic trepidavérunt timóre, ubi non erat timor.`,chinese:`在不应惊慌之处，他们反倒惊惶发呆，因为天主分散了那围攻你者的骨骸，他们必将蒙羞，因天主已把他们弃舍。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:6`}]},{id:`psalm.52.6`,verse:6,latin:`Quóniam Deus dissipávit ossa eórum qui homínibus placent: * confúsi sunt, quóniam Deus sprevit eos.`,chinese:`在不应惊慌之处，他们反倒惊惶发呆，因为天主分散了那围攻你者的骨骸，他们必将蒙羞，因天主已把他们弃舍。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:6`}]},{id:`psalm.52.7`,verse:7,latin:`Quis dabit ex Sion salutáre Israël? * cum convérterit Deus captivitátem plebis suæ, exsultábit Iacob, et lætábitur Israël.`,chinese:`惟愿以色列人的救援来自圣熙雍！一旦天主将自己民族的命运变更，雅各伯必将喜庆，以色列必将欢腾。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm52.txt`,section:`52:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 52:7`}]}],107:[{id:`psalm.107.2`,verse:2,latin:`Parátum cor meum, Deus, parátum cor meum: * cantábo, et psallam in glória mea.`,chinese:`天主，我的心已准备妥当， 我的心已准备妥当， 我愿意去歌弹咏唱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:2`}]},{id:`psalm.107.3`,verse:3,latin:`Exsúrge, glória mea, exsúrge, psaltérium et cíthara: * exsúrgam dilúculo.`,chinese:`我的灵魂，你要醒起来！ 七弦和竖琴，要奏起来！ 我还要把曙光唤起来。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:3`}]},{id:`psalm.107.4`,verse:4,latin:`Confitébor tibi in pópulis, Dómine: * et psallam tibi in natiónibus.`,chinese:`上主，我要在万民中赞美你， 上主，我要在列邦中歌颂你。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:4`}]},{id:`psalm.107.5`,verse:5,latin:`Quia magna est super cælos misericórdia tua: * et usque ad nubes véritas tua:`,chinese:`因为你的大爱高越诸天， 你的忠信直达霄汉。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:5`}]},{id:`psalm.107.6`,verse:6,latin:`Exaltáre super cælos, Deus, et super omnem terram glória tua: * ut liberéntur dilécti tui.`,chinese:`天主，愿你在天上备受举扬， 愿你在地上彰显荣光，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:6`}]},{id:`psalm.107.7`,verse:7,latin:`Salvum fac déxtera tua, et exáudi me: * Deus locútus est in sancto suo:`,chinese:`为叫你所爱的人获得救恩， 求你以右手协助，垂允我们。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:7`}]},{id:`psalm.107.8`,verse:8,latin:`Exsultábo, et dívidam Síchimam, * et convállem tabernaculórum dimétiar.`,chinese:`天主在自己的圣所说： 「我要凯旋，将舍根分疆， 将稣苛特的平原测量。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:8`}]},{id:`psalm.107.9`,verse:9,latin:`Meus est Gálaad, et meus est Manásses: * et Éphraim suscéptio cápitis mei.`,chinese:`基肋阿得地属于我， 默纳协地也属于我， 我的头盔就是厄法辣因， 犹大成为我手中的权棍。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:9`}]},{id:`psalm.107.10`,verse:10,latin:`Iuda rex meus: * Moab lebes spei meæ.`,chinese:`摩阿布是我的沐浴池， 我向厄东投我的鞋只， 我还要战胜培肋舍特。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:10`}]},{id:`psalm.107.10`,verse:10,latin:`In Idumǽam exténdam calceaméntum meum: * mihi alienígenæ amíci facti sunt.`,chinese:`摩阿布是我的沐浴池， 我向厄东投我的鞋只， 我还要战胜培肋舍特。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:10`}]},{id:`psalm.107.11`,verse:11,latin:`Quis dedúcet me in civitátem munítam? * quis dedúcet me usque in Idumǽam?`,chinese:`谁领引我进入坚城， 谁领导我走进厄东？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:11`}]},{id:`psalm.107.12`,verse:12,latin:`Nonne tu, Deus, qui repulísti nos, * et non exíbis, Deus, in virtútibus nostris?`,chinese:`天主，莫非你已将我们抛弃， 天主，难道不率领我军出击？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:12`}]},{id:`psalm.107.13`,verse:13,latin:`Da nobis auxílium de tribulatióne: * quia vana salus hóminis.`,chinese:`求你援助我们抵抗仇雠， 因为人的援助尽属虚无。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:13`}]},{id:`psalm.107.14`,verse:14,latin:`In Deo faciémus virtútem: * et ipse ad níhilum dedúcet inimícos nostros.`,chinese:`我们倚靠天主，奋勇行事。 他必要踏践我们的仇敌。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm107.txt`,section:`107:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 107:14`}]}],117:[{id:`psalm.117.1`,verse:1,latin:`Confitémini Dómino quóniam bonus: * quóniam in sǽculum misericórdia eius.`,chinese:`请你们向上主赞颂， 因为他是美善宽仁， 他的仁慈永远常存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:1`}]},{id:`psalm.117.2`,verse:2,latin:`Dicat nunc Israël quóniam bonus: * quóniam in sǽculum misericórdia eius.`,chinese:`愿以色列家赞美说： 他的仁慈永远常存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:2`}]},{id:`psalm.117.3`,verse:3,latin:`Dicat nunc domus Aaron: * quóniam in sǽculum misericórdia eius.`,chinese:`愿亚郎的家赞美说： 他的仁慈永远常存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:3`}]},{id:`psalm.117.4`,verse:4,latin:`Dicant nunc qui timent Dóminum: * quóniam in sǽculum misericórdia eius.`,chinese:`愿敬畏主者赞美说： 他的仁慈永远常存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:4`}]},{id:`psalm.117.5`,verse:5,latin:`De tribulatióne invocávi Dóminum: * et exaudívit me in latitúdine Dóminus.`,chinese:`我在急难中呼求上主， 他即垂允我，将我救出。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:5`}]},{id:`psalm.117.6`,verse:6,latin:`Dóminus mihi adiútor: * non timébo quid fáciat mihi homo.`,chinese:`上主偕同我，我不怕什么， 世人对待我，究竟能如何？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:6`}]},{id:`psalm.117.7`,verse:7,latin:`Dóminus mihi adiútor: * et ego despíciam inimícos meos.`,chinese:`上主偕同我，作我的助佑， 我必看见我的仇人受辱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:7`}]},{id:`psalm.117.8`,verse:8,latin:`Bonum est confídere in Dómino, * quam confídere in hómine:`,chinese:`投奔到上主的怀抱， 远远胜过信赖同伙。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:8`}]},{id:`psalm.117.9`,verse:9,latin:`Bonum est speráre in Dómino, * quam speráre in princípibus.`,chinese:`投奔到上主的怀抱， 远远胜过信赖官僚。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:9`}]},{id:`psalm.117.10`,verse:10,latin:`Omnes gentes circuiérunt me: * et in nómine Dómini quia ultus sum in eos.`,chinese:`万民虽然齐来将我围困， 奉上主名我将他们灭尽。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:10`}]},{id:`psalm.117.11`,verse:11,latin:`Circumdántes circumdedérunt me: * et in nómine Dómini quia ultus sum in eos.`,chinese:`他们从各处来将我围困， 奉上主名我将他们灭尽。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:11`}]},{id:`psalm.117.12`,verse:12,latin:`Circumdedérunt me sicut apes, † et exarsérunt sicut ignis in spinis: * et in nómine Dómini quia ultus sum in eos.`,chinese:`虽然如同黄蜂将我围困， 又好像烈火把荆棘烧焚， 奉上主名我将他们灭尽。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:12`}]},{id:`psalm.117.13`,verse:13,latin:`Impúlsus evérsus sum ut cáderem: * et Dóminus suscépit me.`,chinese:`人虽推撞我，叫我跌倒， 然而上主却扶持了我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:13`}]},{id:`psalm.117.14`,verse:14,latin:`Fortitúdo mea, et laus mea Dóminus: * et factus est mihi in salútem.`,chinese:`上主是我的力量与勇敢， 他也始终作了我的救援。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:14`}]},{id:`psalm.117.15`,verse:15,latin:`Vox exsultatiónis, et salútis * in tabernáculis justórum.`,chinese:`在义人居住的帐幕中， 响起了胜利的欢呼声： 上主的右手大显威能，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:15`}]},{id:`psalm.117.16`,verse:16,latin:`Déxtera Dómini fecit virtútem: † déxtera Dómini exaltávit me, * déxtera Dómini fecit virtútem.`,chinese:`上主的右手将我举擎， 上主的右手大显威能。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:16`}]},{id:`psalm.117.17`,verse:17,latin:`Non móriar, sed vivam: * et narrábo ópera Dómini.`,chinese:`我不至于死，必要生存， 我要宣扬上主的工程。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:17`}]},{id:`psalm.117.18`,verse:18,latin:`Castígans castigávit me Dóminus: * et morti non trádidit me.`,chinese:`上主惩罚我虽严厉非常， 但却没有把我交于死亡。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:18`}]},{id:`psalm.117.19`,verse:19,latin:`Aperíte mihi portas justítiæ, † ingréssus in eas confitébor Dómino: * (20) hæc porta Dómini, justi intrábunt in eam.`,chinese:`请给我敞开正义的门， 我要进去向上主谢恩`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:19`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:19`}]},{id:`psalm.117.21`,verse:21,latin:`Confitébor tibi quóniam exaudísti me: * et factus es mihi in salútem.`,chinese:`我感谢你，因为你应允了我， 你也将你的救恩赐给了我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:21`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:21`}]},{id:`psalm.117.22`,verse:22,latin:`Lápidem, quem reprobavérunt ædificántes: * hic factus est in caput ánguli.`,chinese:`匠人弃而不用的废石， 反而成了屋角的基石`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:22`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:22`}]},{id:`psalm.117.23`,verse:23,latin:`A Dómino factum est istud: * et est mirábile in óculis nostris.`,chinese:`那是上主的所行所为， 在我们眼中神妙莫测。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:23`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:23`}]},{id:`psalm.117.24`,verse:24,latin:`Hæc est dies, quam fecit Dóminus: * exsultémus, et lætémur in ea.`,chinese:`这是上主所安排的一天， 我们应该为此鼓舞喜欢。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:24`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:24`}]},{id:`psalm.117.25`,verse:25,latin:`O Dómine, salvum me fac, † o Dómine, bene prosperáre: * (26a) benedíctus qui venit in nómine Dómini.`,chinese:`上主！我们求你救助， 上主！我们求你赐福。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:25`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:25`}]},{id:`psalm.117.29`,verse:29,latin:`Confitémini Dómino quóniam bonus: * quóniam in sǽculum misericórdia eius.`,chinese:`请你们向上主赞颂， 因为他是美善宽仁， 他的仁慈永远常存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm117.txt`,section:`117:29`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 117:29`}]}],"118(1-16)":[{id:`psalm.118.1`,verse:1,latin:`(Aleph) Beáti immaculáti in via: * qui ámbulant in lege Dómini.`,chinese:`品行完备而遵行上主法律的， 像这样的人才算是真有福的。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:1`}]},{id:`psalm.118.2`,verse:2,latin:`Beáti, qui scrutántur testimónia eius: * in toto corde exquírunt eum.`,chinese:`遵守上主诫命全心寻求他的， 像这样的人才算是真有福的。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:2`}]},{id:`psalm.118.3`,verse:3,latin:`Non enim qui operántur iniquitátem, * in viis eius ambulavérunt.`,chinese:`他们总不为非作恶， 只按他的道路生活。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:3`}]},{id:`psalm.118.4`,verse:4,latin:`Tu mandásti * mandáta tua custodíri nimis.`,chinese:`你颁发了你的命令， 叫他们严格去遵行。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:4`}]},{id:`psalm.118.5`,verse:5,latin:`Útinam dirigántur viæ meæ, * ad custodiéndas justificatiónes tuas!`,chinese:`愿我的行径坚定， 为遵守你的章程！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:5`}]},{id:`psalm.118.6`,verse:6,latin:`Tunc non confúndar, * cum perspéxero in ómnibus mandátis tuis.`,chinese:`我若重视你的每条诫律， 我就绝对不会蒙羞受辱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:6`}]},{id:`psalm.118.7`,verse:7,latin:`Confitébor tibi in directióne cordis: * in eo quod dídici iudícia justítiæ tuæ.`,chinese:`我一学习你正义的判词， 就以至诚的心灵颂谢你。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:7`}]},{id:`psalm.118.8`,verse:8,latin:`Justificatiónes tuas custódiam: * non me derelínquas usquequáque.`,chinese:`我要遵守你的规矩， 不要将我完全弃去！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:8`}]},{id:`psalm.118.9`,verse:9,latin:`(Beth) In quo córrigit adolescéntior viam suam? * In custodiéndo sermónes tuos.`,chinese:`青年怎样才能守身如玉？ 那就只有遵从你的言语。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:9`}]},{id:`psalm.118.10`,verse:10,latin:`In toto corde meo exquisívi te: * ne repéllas me a mandátis tuis.`,chinese:`我要用我整个的心寻觅你， 不要让我错行了你的谕旨！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:10`}]},{id:`psalm.118.11`,verse:11,latin:`In corde meo abscóndi elóquia tua: * ut non peccem tibi.`,chinese:`我将你的话藏在我的心里， 免得我去犯罪而获罪于你。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:11`}]},{id:`psalm.118.12`,verse:12,latin:`Benedíctus es, Dómine: * doce me justificatiónes tuas.`,chinese:`上主，你理应受赞颂， 教训我守你的诫命。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:12`}]},{id:`psalm.118.13`,verse:13,latin:`In lábiis meis, * pronuntiávi ómnia iudícia oris tui.`,chinese:`你口所授的一切法度， 我要以我的唇舌叙述。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:13`}]},{id:`psalm.118.14`,verse:14,latin:`In via testimoniórum tuórum delectátus sum, * sicut in ómnibus divítiis.`,chinese:`我喜爱你约法的道路， 就如喜爱一切的财富。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:14`}]},{id:`psalm.118.15`,verse:15,latin:`In mandátis tuis exercébor: * et considerábo vias tuas.`,chinese:`我要默想你的法度， 也要沉思你的道路。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:15`}]},{id:`psalm.118.16`,verse:16,latin:`In justificatiónibus tuis meditábor: * non oblivíscar sermónes tuos.`,chinese:`我以你的章程作喜欢， 我永不忘却你的圣言。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:16`}]}],"118(17-32)":[{id:`psalm.118.17`,verse:17,latin:`(Ghimel) Retríbue servo tuo, vivífica me: * et custódiam sermónes tuos:`,chinese:`请恩待你的仆人我得以生存， 这样使我能够服从你的纶音。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:17`}]},{id:`psalm.118.18`,verse:18,latin:`Revéla óculos meos: * et considerábo mirabília de lege tua.`,chinese:`求你开明我的眼睛， 透视你法律的奇能。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:18`}]},{id:`psalm.118.19`,verse:19,latin:`Íncola ego sum in terra: * non abscóndas a me mandáta tua.`,chinese:`我原是寄居尘世的旅客， 不要向我隐瞒你的规则。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:19`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:19`}]},{id:`psalm.118.20`,verse:20,latin:`Concupívit ánima mea desideráre justificatiónes tuas, * in omni témpore.`,chinese:`我因常常渴慕你的谕令， 我的灵魂便为此而成病。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:20`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:20`}]},{id:`psalm.118.21`,verse:21,latin:`Increpásti supérbos: * maledícti qui declínant a mandátis tuis.`,chinese:`你已经怒责了骄傲横蛮的人， 背弃你诫命的，是可咒诅的人。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:21`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:21`}]},{id:`psalm.118.22`,verse:22,latin:`Aufer a me oppróbrium, et contémptum: * quia testimónia tua exquisívi.`,chinese:`请除去我所受的凌辱与轻谩， 因为我已经遵守了你的规范。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:22`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:22`}]},{id:`psalm.118.23`,verse:23,latin:`Étenim sedérunt príncipes, et advérsum me loquebántur: * servus autem tuus exercebátur in justificatiónibus tuis.`,chinese:`判官虽为反对我而开庭， 你仆人仍默思你的章程。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:23`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:23`}]},{id:`psalm.118.24`,verse:24,latin:`Nam et testimónia tua meditátio mea est: * et consílium meum justificatiónes tuæ.`,chinese:`因为你的诫命是我的欢喜， 你的典章是我的谋士。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:24`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:24`}]},{id:`psalm.118.25`,verse:25,latin:`(Daleth) Adhǽsit paviménto ánima mea: * vivífica me secúndum verbum tuum.`,chinese:`我的灵魂虽已辗转于灰尘， 求你照你的诺言使我生存。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:25`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:25`}]},{id:`psalm.118.26`,verse:26,latin:`Vias meas enuntiávi, et exaudísti me: * doce me justificatiónes tuas.`,chinese:`我陈明我的行径，你便垂听了我， 今再恳求你用你的章程教训我`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:26`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:26`}]},{id:`psalm.118.27`,verse:27,latin:`Viam justificatiónum tuárum ínstrue me: * et exercébor in mirabílibus tuis.`,chinese:`请指给我你约法的路径， 我要沉思你的奇妙工程。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:27`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:27`}]},{id:`psalm.118.28`,verse:28,latin:`Dormitávit ánima mea præ tǽdio: * confírma me in verbis tuis.`,chinese:`我的灵魂因忧伤而滴滴流泪， 请照你的诺言使我奋昂兴起。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:28`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:28`}]},{id:`psalm.118.29`,verse:29,latin:`Viam iniquitátis ámove a me: * et de lege tua miserére mei.`,chinese:`求你不要使我走错误的道路， 求你恩赐我常遵守你的法度。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:29`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:29`}]},{id:`psalm.118.30`,verse:30,latin:`Viam veritátis elégi: * iudícia tua non sum oblítus.`,chinese:`我选定了真理的途径， 我矢志服从你的谕令。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:30`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:30`}]},{id:`psalm.118.31`,verse:31,latin:`Adhǽsi testimóniis tuis, Dómine: * noli me confúndere.`,chinese:`我时常依恋着你的法度， 上主，不要叫我蒙受羞辱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:31`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:31`}]},{id:`psalm.118.32`,verse:32,latin:`Viam mandatórum tuórum cucúrri, * cum dilatásti cor meum.`,chinese:`我必奔赴你诫命的路程， 因为你舒展了我的心灵。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm118.txt`,section:`118:32`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 118:32`}]}],"18(2-'7b')":[{id:`psalm.18.2`,verse:2,latin:`Cæli enárrant glóriam Dei: * et ópera mánuum eius annúntiat firmaméntum.`,chinese:`高天陈述天主的光荣， 穹苍宣扬他手的化工`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:2`}]},{id:`psalm.18.3`,verse:3,latin:`Dies diéi erúctat verbum, * et nox nocti índicat sciéntiam.`,chinese:`日与日侃侃而谈， 夜与夜知识相传。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:3`}]},{id:`psalm.18.4`,verse:4,latin:`Non sunt loquélæ, neque sermónes, * quorum non audiántur voces eórum.`,chinese:`不是语，也不是言， 是听不到的语言`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:4`}]},{id:`psalm.18.5`,verse:5,latin:`In omnem terram exívit sonus eórum: * et in fines orbis terræ verba eórum.`,chinese:`它们的声音传遍普世， 它们的言语达于地极。 天主在天为太阳设置了帷帐，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:5`}]}],"18(8-'15b')":[{id:`psalm.18.8`,verse:8,latin:`Lex Dómini immaculáta, convértens ánimas: * testimónium Dómini fidéle, sapiéntiam præstans párvulis.`,chinese:`上主的法律是完善的，能畅快人灵； 上主的约章是忠诚的，能开启愚蒙`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:8`}]},{id:`psalm.18.9`,verse:9,latin:`Justítiæ Dómini rectæ, lætificántes corda: * præcéptum Dómini lúcidum, illúminans óculos.`,chinese:`上主的规诫是正直的，能悦乐心情 上主的命令是光明的，能烛照眼睛`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:9`}]},{id:`psalm.18.10`,verse:10,latin:`Timor Dómini sanctus, pérmanens in sǽculum sǽculi: * iudícia Dómini vera, justificáta in semetípsa.`,chinese:`上主的训诲是纯洁的，永远常存 上主的判断是真实的，无不公允`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:10`}]},{id:`psalm.18.11`,verse:11,latin:`Desiderabília super aurum et lápidem pretiósum multum: * et dulcióra super mel et favum.`,chinese:`比黄金，比极纯的黄金更可爱恋 比蜂蜜，比蜂巢的流汁更要甘甜。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:11`}]},{id:`psalm.18.12`,verse:12,latin:`Étenim servus tuus custódit ea, * in custodiéndis illis retribútio multa.`,chinese:`你仆人虽留心这一切， 竭尽全力遵守这一切，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:12`}]},{id:`psalm.18.13`,verse:13,latin:`Delícta quis intéllegit? † ab occúltis meis munda me: * (14a) et ab aliénis parce servo tuo.`,chinese:`但谁能认出自己的一切过犯？ 求你赦免我未觉察到的罪愆。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm18.txt`,section:`18:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 18:13`}]}],"24(1-7)":[{id:`psalm.24.1`,verse:1,latin:`Ad te, Dómine, levávi ánimam meam: * Deus meus, in te confído, non erubéscam.`,chinese:`上主，我向你把我的心举起，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:1`}]},{id:`psalm.24.3`,verse:3,latin:`Neque irrídeant me inimíci mei: * étenim univérsi, qui sústinent te, non confundéntur.`,chinese:`凡期望你的人决不会蒙羞，惟冒昧失信的人才会受辱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:3`}]},{id:`psalm.24.4`,verse:4,latin:`Confundántur omnes iníqua agéntes * supervácue.`,chinese:`上主，求你使我认识你的法度，并求你教训我履行你的道路。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:4`}]},{id:`psalm.24.4`,verse:4,latin:`Vias tuas, Dómine, demónstra mihi: * et sémitas tuas édoce me.`,chinese:`上主，求你使我认识你的法度，并求你教训我履行你的道路。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:4`}]},{id:`psalm.24.5`,verse:5,latin:`Dírige me in veritáte tua, et doce me: * quia tu es, Deus, salvátor meus, et te sustínui tota die.`,chinese:`还求你教训我；引我进入真理之路， 我终日仰望你，因你是救我的天主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:5`}]},{id:`psalm.24.6`,verse:6,latin:`Reminíscere miseratiónum tuárum, Dómine, * et misericordiárum tuárum, quæ a sǽculo sunt.`,chinese:`上主，求你忆及你的仁慈和恩爱， 因为它们由瓦古以来就常存在。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:6`}]},{id:`psalm.24.7`,verse:7,latin:`Delícta juventútis meæ, * et ignorántias meas ne memíneris.`,chinese:`我青春的罪愆和过犯，求你不要追念 上主，求你记念我，照你的仁慈和良善。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:7`}]},{id:`psalm.24.7`,verse:7,latin:`Secúndum misericórdiam tuam meménto mei tu: * propter bonitátem tuam, Dómine.`,chinese:`我青春的罪愆和过犯，求你不要追念 上主，求你记念我，照你的仁慈和良善。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:7`}]}],"24(8-14)":[{id:`psalm.24.8`,verse:8,latin:`Dulcis et rectus Dóminus: * propter hoc legem dabit delinquéntibus in via.`,chinese:`因为上主仁慈又正直， 常领迷途者归回正路，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:8`}]},{id:`psalm.24.9`,verse:9,latin:`Díriget mansuétos in iudício: * docébit mites vias suas.`,chinese:`引导谦卑者遵守正义， 教导善良者走入正途。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:9`}]},{id:`psalm.24.10`,verse:10,latin:`Univérsæ viæ Dómini, misericórdia et véritas, * requiréntibus testaméntum eius et testimónia eius.`,chinese:`对待持守上主的盟约和诫命的人， 上主的一切行径常是慈爱和忠诚。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:10`}]},{id:`psalm.24.11`,verse:11,latin:`Propter nomen tuum, Dómine, propitiáberis peccáto meo: * multum est enim.`,chinese:`上主，为了你圣名的原故， 求你赦免我重大的愆尤。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:11`}]},{id:`psalm.24.12`,verse:12,latin:`Quis est homo qui timet Dóminum? * legem státuit ei in via, quam elégit.`,chinese:`不论是谁，只要他敬畏上主， 上主必指示他应选的道路，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:12`}]},{id:`psalm.24.13`,verse:13,latin:`Ánima eius in bonis demorábitur: * et semen eius hereditábit terram.`,chinese:`他的心灵必要安享幸福， 他的后裔必能继承领土。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:13`}]},{id:`psalm.24.14`,verse:14,latin:`Firmaméntum est Dóminus timéntibus eum: * et testaméntum ipsíus ut manifestétur illis.`,chinese:`上主亲近敬畏自己的人民， 也使他们认识自己的誓盟。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:14`}]}],"24(15-22)":[{id:`psalm.24.15`,verse:15,latin:`Óculi mei semper ad Dóminum: * quóniam ipse evéllet de láqueo pedes meos.`,chinese:`我的眼睛不断地向上主瞻仰， 因为他使我的双脚脱离罗网。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:15`}]},{id:`psalm.24.16`,verse:16,latin:`Réspice in me, et miserére mei: * quia únicus et pauper sum ego.`,chinese:`求你回顾，求你怜悯， 因为我是孤苦伶仃。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:16`}]},{id:`psalm.24.17`,verse:17,latin:`Tribulatiónes cordis mei multiplicátæ sunt: * de necessitátibus meis érue me.`,chinese:`求你减轻我心的苦难， 救拔我脱离我的忧患`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:17`}]},{id:`psalm.24.18`,verse:18,latin:`Vide humilitátem meam, et labórem meum: * et dimítte univérsa delícta mea.`,chinese:`垂视我的劳苦和可怜， 赦免我犯的一切罪愆。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:18`}]},{id:`psalm.24.19`,verse:19,latin:`Réspice inimícos meos quóniam multiplicáti sunt, * et ódio iníquo odérunt me.`,chinese:`请看我的仇敌如何众多， 他们都凶狠地痛恨着我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:19`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:19`}]},{id:`psalm.24.20`,verse:20,latin:`Custódi ánimam meam, et érue me: * non erubéscam quóniam sperávi in te.`,chinese:`求你保护我的生命，向我施救， 别叫我因投奔你而蒙受羞辱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:20`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:20`}]},{id:`psalm.24.21`,verse:21,latin:`Innocéntes et recti adhæsérunt mihi: * quia sustínui te.`,chinese:`愿清白和正直护卫我！ 上主，因我唯有仰望你。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:21`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:21`}]},{id:`psalm.24.22`,verse:22,latin:`Líbera, Deus, Israël, * ex ómnibus tribulatiónibus suis.`,chinese:`天主，求你拯救以色列， 使他脱离一切的祸灾。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm24.txt`,section:`24:22`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 24:22`}]}],"71(2-8)":[{id:`psalm.71.2`,verse:2,latin:`Deus, iudícium tuum regi da: * et justítiam tuam fílio regis:`,chinese:`使他照正义统治你的百姓，使他按公道管理你的平民。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:2`}]},{id:`psalm.71.2`,verse:2,latin:`Iudicáre pópulum tuum in justítia, * et páuperes tuos in iudício.`,chinese:`使他照正义统治你的百姓，使他按公道管理你的平民。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:2`}]},{id:`psalm.71.3`,verse:3,latin:`Suscípiant montes pacem pópulo: * et colles justítiam.`,chinese:`愿高山给人民带来和平；愿丘岭为百姓送来公正！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:3`}]},{id:`psalm.71.4`,verse:4,latin:`Iudicábit páuperes pópuli, et salvos fáciet fílios páuperum: * et humiliábit calumniatórem.`,chinese:`他必卫护百姓中的穷人，救助穷苦人的子孙，蹂躏欺压人的暴民。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:4`}]},{id:`psalm.71.5`,verse:5,latin:`Et permanébit cum sole, et ante lunam, * in generatióne et generatiónem.`,chinese:`他将与日月共存，世世代代无穷尽。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:5`}]},{id:`psalm.71.6`,verse:6,latin:`Descéndet sicut plúvia in vellus: * et sicut stillicídia stillántia super terram.`,chinese:`他降临如落在草原上的喜雨，又如润泽田地的甘露。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:6`}]},{id:`psalm.71.7`,verse:7,latin:`Oriétur in diébus eius justítia, et abundántia pacis: * donec auferátur luna.`,chinese:`在他的岁月中，正义必要兴盛，到处国泰民安，直至月亮失明。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:7`}]},{id:`psalm.71.8`,verse:8,latin:`Et dominábitur a mari usque ad mare: * et a flúmine usque ad términos orbis terrárum.`,chinese:`他将统治大地，从这海到那海，由大河的流域，至地极的边界。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:8`}]}],"71(9-19)":[{id:`psalm.71.9`,verse:9,latin:`Coram illo prócident Æthíopes: * et inimíci eius terram lingent.`,chinese:`他的仇敌将向他屈膝跪拜，和他作对的人要舌舔尘埃。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:9`}]},{id:`psalm.71.10`,verse:10,latin:`Reges Tharsis, et ínsulæ múnera ófferent: * reges Árabum et Saba dona addúcent.`,chinese:`塔尔史士和群岛的众王将献上礼品，舍巴和色巴的君王，也都要前来进贡。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:10`}]},{id:`psalm.71.11`,verse:11,latin:`Et adorábunt eum omnes reges terræ: * omnes gentes sérvient ei:`,chinese:`众王都要崇拜他，万民都要事奉他。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:11`}]},{id:`psalm.71.12`,verse:12,latin:`Quia liberábit páuperem a poténte: * et páuperem, cui non erat adiútor.`,chinese:`他必拯救哀号的贫民， 他必扶持无援的穷人。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:12`}]},{id:`psalm.71.13`,verse:13,latin:`Parcet páuperi et ínopi: * et ánimas páuperum salvas fáciet.`,chinese:`他将怜恤不幸和贫乏的群众， 并要救护穷苦贫病者的生命。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:13`}]},{id:`psalm.71.14`,verse:14,latin:`Ex usúris et iniquitáte rédimet ánimas eórum: * et honorábile nomen eórum coram illo.`,chinese:`他要救他们脱离残暴与压迫， 他们的血在他眼中珍贵无比。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:14`}]},{id:`psalm.71.15`,verse:15,latin:`Et vivet, et dábitur ei de auro Arábiæ, et adorábunt de ipso semper: * tota die benedícent ei.`,chinese:`愿他常存！愿人们向他奉献舍巴黄金， 愿人们时常为他祈祷，不断为他求恩！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:15`}]},{id:`psalm.71.16`,verse:16,latin:`Et erit firmaméntum in terra in summis móntium, superextollétur super Líbanum fructus eius: * et florébunt de civitáte sicut fænum terræ.`,chinese:`田地里所出产的五谷百果必将丰盈， 山岭上的收成也要富饶有如黎巴嫩， 城市的人必要昌盛有如地上的草茵。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:16`}]},{id:`psalm.71.17`,verse:17,latin:`Sit nomen eius benedíctum in sǽcula: * ante solem pérmanet nomen eius.`,chinese:`他的名号常存，永受赞扬， 他的名号永留，与日争光。 万邦要因他而得福， 万民要称他为有福。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:17`}]},{id:`psalm.71.17`,verse:17,latin:`Et benedicéntur in ipso omnes tribus terræ: * omnes gentes magnificábunt eum.`,chinese:`他的名号常存，永受赞扬， 他的名号永留，与日争光。 万邦要因他而得福， 万民要称他为有福。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:17`}]},{id:`psalm.71.18`,verse:18,latin:`Benedíctus Dóminus, Deus Israël, * qui facit mirabília solus:`,chinese:`愿上主天主，以色列的天主享受赞颂， 因为只有他独自作出了奇妙的化工。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:18`}]},{id:`psalm.71.19`,verse:19,latin:`Et benedíctum nomen majestátis eius in ætérnum: * et replébitur majestáte eius omnis terra: fiat, fiat.`,chinese:`愿他光荣的名号永受赞美， 愿他的荣耀充满整个大地！ 阿们！阿们！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm71.txt`,section:`71:19`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 71:19`}]}],"21(2-12)":[{id:`psalm.21.2`,verse:2,latin:`Deus, Deus meus, réspice in me: quare me dereliquísti? * longe a salúte mea verba delictórum meórum.`,chinese:`我的天主，我的天主，你为什么舍弃了我？你又为什么远离我的恳求，和我的哀号。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:2`}]},{id:`psalm.21.3`,verse:3,latin:`Deus meus, clamábo per diem, et non exáudies: * et nocte, et non ad insipiéntiam mihi.`,chinese:`我的天主，我白天呼号，你不应允；我黑夜哀祷，你仍默静。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:3`}]},{id:`psalm.21.4`,verse:4,latin:`Tu autem in sancto hábitas, * laus Israël.`,chinese:`但是你居于圣所，作以色列的荣耀！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:4`}]},{id:`psalm.21.5`,verse:5,latin:`In te speravérunt patres nostri: * speravérunt, et liberásti eos.`,chinese:`我们的先祖曾经依赖了你，你救起他们，因他们依赖你`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:5`}]},{id:`psalm.21.6`,verse:6,latin:`Ad te clamavérunt, et salvi facti sunt: * in te speravérunt, et non sunt confúsi.`,chinese:`他们呼号了你，便得到救赎， 他们信赖了你，而从未蒙羞。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:6`}]},{id:`psalm.21.7`,verse:7,latin:`Ego autem sum vermis, et non homo: * oppróbrium hóminum, et abjéctio plebis.`,chinese:`至于我，成了微虫，失掉了人形 是人类的耻辱，受百姓的欺凌。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:7`}]},{id:`psalm.21.8`,verse:8,latin:`Omnes vidéntes me, derisérunt me: * locúti sunt lábiis, et movérunt caput.`,chinese:`凡看见我的人都戏笑我， 他们都撇着嘴摇着头说`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:8`}]},{id:`psalm.21.9`,verse:9,latin:`Sperávit in Dómino, erípiat eum: * salvum fáciat eum, quóniam vult eum.`,chinese:`「他既信赖上主，上主就应救他 上主既喜爱他，也就该拯救他。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:9`}]},{id:`psalm.21.10`,verse:10,latin:`Quóniam tu es, qui extraxísti me de ventre: * spes mea ab ubéribus matris meæ. In te projéctus sum ex útero:`,chinese:`是你使我由母腹中出生， 使我在母怀里享受安宁。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:10`}]},{id:`psalm.21.11`,verse:11,latin:`De ventre matris meæ Deus meus es tu, * ne discésseris a me:`,chinese:`我一离开母胎，就已交托于你， 尚在母怀时，你已是我的天主。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:11`}]},{id:`psalm.21.12`,verse:12,latin:`Quóniam tribulátio próxima est: * quóniam non est qui ádjuvet.`,chinese:`因为大难临头，求你不要远离我， 求你来近，因为无人肯来扶助我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:12`}]}],"21(13-23)":[{id:`psalm.21.13`,verse:13,latin:`Circumdedérunt me vítuli multi: * tauri pingues obsedérunt me.`,chinese:`成群的公牛围绕着我， 巴商的雄牛包围着我`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:13`}]},{id:`psalm.21.14`,verse:14,latin:`Aperuérunt super me os suum, * sicut leo rápiens et rúgiens.`,chinese:`都向我张开自己的嘴， 活像怒吼掠食的狮子。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:14`}]},{id:`psalm.21.15`,verse:15,latin:`Sicut aqua effúsus sum: * et dispérsa sunt ómnia ossa mea.`,chinese:`我好像倾泻的水一般， 我全身骨骸都已脱散 我的心好像是蜡， 在我内脏中溶化。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:15`}]},{id:`psalm.21.15`,verse:15,latin:`Factum est cor meum tamquam cera liquéscens * in médio ventris mei.`,chinese:`我好像倾泻的水一般， 我全身骨骸都已脱散 我的心好像是蜡， 在我内脏中溶化。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:15`}]},{id:`psalm.21.16`,verse:16,latin:`Áruit tamquam testa virtus mea, et lingua mea adhǽsit fáucibus meis: * et in púlverem mortis deduxísti me.`,chinese:`我的上腭枯干得像瓦片， 我的舌头贴在咽喉上面 你竟使我于死灰中辗转。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:16`}]},{id:`psalm.21.17`,verse:17,latin:`Quóniam circumdedérunt me canes multi: * concílium malignántium obsédit me.`,chinese:`恶犬成群地围困着我， 歹徒成伙地环绕着我 他们穿透了我的手脚，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:17`}]},{id:`psalm.21.17`,verse:17,latin:`Fodérunt manus meas et pedes meos: * dinumeravérunt ómnia ossa mea.`,chinese:`恶犬成群地围困着我， 歹徒成伙地环绕着我 他们穿透了我的手脚，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:17`}]},{id:`psalm.21.18`,verse:18,latin:`Ipsi vero consideravérunt et inspexérunt me: * divisérunt sibi vestiménta mea, et super vestem meam misérunt sortem.`,chinese:`我竟能数清我的骨骼 他们却冷眼观望着我，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:18`}]},{id:`psalm.21.20`,verse:20,latin:`Tu autem, Dómine, ne elongáveris auxílium tuum a me: * ad defensiónem meam cónspice.`,chinese:`上主！请不要远离我， 我的勇力，速来助我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:20`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:20`}]},{id:`psalm.21.21`,verse:21,latin:`Érue a frámea, Deus, ánimam meam: * et de manu canis únicam meam:`,chinese:`求你由刀剑下抢救我的灵魂， 由恶犬的爪牙拯救我的生命`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:21`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:21`}]},{id:`psalm.21.22`,verse:22,latin:`Salva me ex ore leónis: * et a córnibus unicórnium humilitátem meam.`,chinese:`求你从狮子的血口救我脱身， 由野牛角下救出我这苦命人。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:22`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:22`}]},{id:`psalm.21.23`,verse:23,latin:`Narrábo nomen tuum frátribus meis: * in médio ecclésiæ laudábo te.`,chinese:`我要向我的弟兄，宣扬你的圣名， 在盛大的集会中，向你赞美歌颂`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:23`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:23`}]}],"21(24-32)":[{id:`psalm.21.24`,verse:24,latin:`Qui timétis Dóminum, laudáte eum: * univérsum semen Iacob, glorificáte eum.`,chinese:`「你们敬畏上主的人，请赞美上主， 雅各伯所有的后裔，请光荣上主， 以色列的一切子孙，请敬畏上主！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:24`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:24`}]},{id:`psalm.21.25`,verse:25,latin:`Tímeat eum omne semen Israël: * quóniam non sprevit, neque despéxit deprecatiónem páuperis:`,chinese:`因他没有轻看或蔑视卑贱人的苦痛， 也没有向他掩起自己的面孔， 他一呼号上主，上主即予俯听。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:25`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:25`}]},{id:`psalm.21.25`,verse:25,latin:`Nec avértit fáciem suam a me: * et cum clamárem ad eum, exaudívit me.`,chinese:`因他没有轻看或蔑视卑贱人的苦痛， 也没有向他掩起自己的面孔， 他一呼号上主，上主即予俯听。」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:25`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:25`}]},{id:`psalm.21.26`,verse:26,latin:`Apud te laus mea in ecclésia magna: * vota mea reddam in conspéctu timéntium eum.`,chinese:`我在盛大的集会中要向他颂赞， 我在敬畏他的人前还我的誓愿。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:26`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:26`}]},{id:`psalm.21.27`,verse:27,latin:`Edent páuperes, et saturabúntur: et laudábunt Dóminum qui requírunt eum: * vivent corda eórum in sǽculum sǽculi.`,chinese:`贫困的人必将食而饱饫， 寻求上主的人必赞颂主 愿他们的心灵生存永久！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:27`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:27`}]},{id:`psalm.21.28`,verse:28,latin:`Reminiscéntur et converténtur ad Dóminum * univérsi fines terræ:`,chinese:`整个大地将醒觉而归顺上主， 天下万民将在他前屈膝叩首`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:28`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:28`}]},{id:`psalm.21.28`,verse:28,latin:`Et adorábunt in conspéctu eius * univérsæ famíliæ géntium.`,chinese:`整个大地将醒觉而归顺上主， 天下万民将在他前屈膝叩首`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:28`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:28`}]},{id:`psalm.21.29`,verse:29,latin:`Quóniam Dómini est regnum: * et ipse dominábitur géntium.`,chinese:`因为惟有上主得享王权， 惟有他将万民宰治掌管。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:29`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:29`}]},{id:`psalm.21.30`,verse:30,latin:`Manducavérunt et adoravérunt omnes pingues terræ: * in conspéctu eius cadent omnes qui descéndunt in terram.`,chinese:`凡安眠于黄泉的人都应朝拜他， 凡返回于灰土的人都要叩拜他。 我的灵魂存在生活只是为了他，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:30`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:30`}]},{id:`psalm.21.31`,verse:31,latin:`Et ánima mea illi vivet: * et semen meum sérviet ipsi.`,chinese:`我的后裔将要事奉上主， 向未来的世代传述我主，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:31`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:31`}]},{id:`psalm.21.32`,verse:32,latin:`Annuntiábitur Dómino generátio ventúra: * et annuntiábunt cæli justítiam eius pópulo qui nascétur, quem fecit Dóminus.`,chinese:`向下代人，传扬他的正义说： 「这全是上主的所作所为！」`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm21.txt`,section:`21:32`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 21:32`}]}],"93(1-11)":[{id:`psalm.93.1`,verse:1,latin:`Deus ultiónum Dóminus: * Deus ultiónum líbere egit.`,chinese:`上主，你是伸冤的天主，伸冤的天主，求你显出！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:1`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:1`}]},{id:`psalm.93.2`,verse:2,latin:`Exaltáre, qui júdicas terram: * redde retributiónem supérbis.`,chinese:`审判大地的天主，请你起来！给骄傲人施以应得的祸灾！`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:2`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:2`}]},{id:`psalm.93.3`,verse:3,latin:`Úsquequo peccatóres, Dómine, * úsquequo peccatóres gloriabúntur:`,chinese:`上主，恶人洋洋得意，要到何时？歹徒沾沾自喜，要到何时？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:3`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:3`}]},{id:`psalm.93.4`,verse:4,latin:`Effabúntur, et loquéntur iniquitátem: * loquéntur omnes, qui operántur injustítiam?`,chinese:`他们大言不惭，要到何时？ 作恶的人自夸，要到何时？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:4`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:4`}]},{id:`psalm.93.5`,verse:5,latin:`Pópulum tuum, Dómine, humiliavérunt: * et hereditátem tuam vexavérunt.`,chinese:`上主，他们蹂躏你的百姓， 他们磨难你的子民，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:5`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:5`}]},{id:`psalm.93.6`,verse:6,latin:`Víduam, et ádvenam interfecérunt: * et pupíllos occidérunt.`,chinese:`屠杀寡妇与旅客， 将孤儿置于死地，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:6`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:6`}]},{id:`psalm.93.7`,verse:7,latin:`Et dixérunt: Non vidébit Dóminus, * nec intélleget Deus Iacob.`,chinese:`他们还说：上主看不见， 雅各伯的天主决不管。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:7`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:7`}]},{id:`psalm.93.8`,verse:8,latin:`Intellégite, insipiéntes in pópulo: * et stulti, aliquándo sápite.`,chinese:`民间的愚昧者！你们应该知悉， 糊涂的人！你们何时才能明白？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:8`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:8`}]},{id:`psalm.93.9`,verse:9,latin:`Qui plantávit aurem, non áudiet? * aut qui finxit óculum, non consíderat?`,chinese:`装置耳朵的，难道自己已听不着， 制造眼睛的，难道自己看不到？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:9`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:9`}]},{id:`psalm.93.10`,verse:10,latin:`Qui córripit gentes, non árguet: * qui docet hóminem sciéntiam?`,chinese:`训戒万民者，难道自己不惩治， 教导人类者，难道自己无知识？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:10`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:10`}]},{id:`psalm.93.11`,verse:11,latin:`Dóminus scit cogitatiónes hóminum, * quóniam vanæ sunt.`,chinese:`上主认透人的思念， 原来都是虚幻。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:11`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:11`}]}],"93(12-23)":[{id:`psalm.93.12`,verse:12,latin:`Beátus homo, quem tu erudíeris, Dómine: * et de lege tua docúeris eum,`,chinese:`上主，那些受你教训的人， 守你法律者是有福的人，`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:12`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:12`}]},{id:`psalm.93.13`,verse:13,latin:`Ut mítiges ei a diébus malis: * donec fodiátur peccatóri fóvea.`,chinese:`你叫他在患难时获享安稳， 直到给恶人们掘下了陷阱。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:13`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:13`}]},{id:`psalm.93.14`,verse:14,latin:`Quia non repéllet Dóminus plebem suam: * et hereditátem suam non derelínquet.`,chinese:`因为上主不拒绝自己的百姓， 上主不遗弃自己的人民。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:14`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:14`}]},{id:`psalm.93.15`,verse:15,latin:`Quoadúsque justítia convertátur in iudícium: * et qui juxta illam omnes qui recto sunt corde.`,chinese:`原来公理必归正义的人士， 心地正直的人，必追求公理。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:15`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:15`}]},{id:`psalm.93.16`,verse:16,latin:`Quis consúrget mihi advérsus malignántes? * aut quis stabit mecum advérsus operántes iniquitátem?`,chinese:`谁肯奋起替我攻打行凶的人 谁肯站起替我抵抗作恶的人？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:16`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:16`}]},{id:`psalm.93.17`,verse:17,latin:`Nisi quia Dóminus adiúvit me: * paulo minus habitásset in inférno ánima mea.`,chinese:`若不是上主扶助我， 我的灵魂已归冥所。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:17`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:17`}]},{id:`psalm.93.18`,verse:18,latin:`Si dicébam: Motus est pes meus: * misericórdia tua, Dómine, adiuvábat me.`,chinese:`我正在想说：我的脚步快要滑倒。 上主，你就以你的仁爱来扶助我。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:18`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:18`}]},{id:`psalm.93.19`,verse:19,latin:`Secúndum multitúdinem dolórum meórum in corde meo: * consolatiónes tuæ lætificavérunt ánimam meam.`,chinese:`忧愁焦思虽然齐集我的心神， 你的安慰却舒畅了我的灵魂。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:19`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:19`}]},{id:`psalm.93.20`,verse:20,latin:`Numquid adhǽret tibi sedes iniquitátis: * qui fingis labórem in præcépto?`,chinese:`若有人冒充法律，制造苦恼， 不义的法庭，岂能与你相好？`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:20`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:20`}]},{id:`psalm.93.21`,verse:21,latin:`Captábunt in ánimam justi: * et sánguinem innocéntem condemnábunt.`,chinese:`他们残害义人的性命，判决无辜人的流血刑。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:21`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:21`}]},{id:`psalm.93.22`,verse:22,latin:`Et factus est mihi Dóminus in refúgium: * et Deus meus in adiutórium spei meæ.`,chinese:`然而上主必定作我的堡垒，我的天主作我避难的磐石。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:22`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:22`}]},{id:`psalm.93.23`,verse:23,latin:`Et reddet illis iniquitátem ipsórum: et in malítia eórum dispérdet eos: * dispérdet illos Dóminus, Deus noster.`,chinese:`他必以他们的罪过来报复他们 必要用他们的凶恶来消灭他们， 上主我们的天主必要消灭他们。`,translationStatus:`verified-source-translation`,sourceRefs:[{file:`web/www/horas/Latin/Psalterium/Psalmorum/Psalm93.txt`,section:`93:23`},{file:`resources/texts/思高圣咏集_武加大编号_逐节纯文本.txt`,section:`圣咏 93:23`}]}]},ye=class{async getDay(e){return be(e)}};function be(e){let t=W(e,G(e.year)),n=U(e),r={year:e.year,month:12,day:25},i=xe(e.year);return t===-3?K(e,`Sacred Triduum`,`I classis`,`triduum`,`Feria Quinta in Cena Domini`):t===-2?K(e,`Sacred Triduum`,`I classis`,`triduum`,`Feria Sexta in Passione et Morte Domini`):t===-1?K(e,`Sacred Triduum`,`I classis`,`triduum`,`Sabbato Sancto`):t===0?K(e,`Easter`,`I classis`,`easter`,`Dominica Resurrectionis`):t>=1&&t<=6?K(e,`Easter Octave`,`I classis`,`easter`,`infra Octavam Paschae`):t>=7&&t<=38?K(e,`Eastertide`,`I-III classis`,`easter`,`Tempus Paschale`):t===39?K(e,`Ascension`,`I classis`,`ascension`,`Ascensio Domini`):t>=40&&t<=48?K(e,`Ascensiontide`,`I-III classis`,`ascension`,`Tempus Ascensionis`):t===49?K(e,`Pentecost`,`I classis`,`pentecost`,`Dominica Pentecostes`):t>=50&&t<=55?K(e,`Pentecost Octave`,`I classis`,`pentecost`,`infra Octavam Pentecostes`):t===56?K(e,`Trinity Sunday`,`I classis`,`trinity`,`Sanctissima Trinitas`):t===60?K(e,`Corpus Christi`,`I classis`,`corpus`,`Corpus Christi`):t===68?K(e,`Sacred Heart`,`I classis`,`heart`,`Sacratissimum Cor Iesu`):t===-46?K(e,`Lent`,`I classis`,`ash-wednesday`,`Feria IV Cinerum`):t>=-45&&t<=-43?K(e,`Lent`,`Feria privilegiata`,`after-ashes`,`Feriae post Cineres`):t>=-14&&t<=-8?K(e,`Passiontide`,`I-II classis`,`passion`,`Tempus Passionis`):t>=-7&&t<=-4?K(e,`Holy Week`,`I classis`,`holy-week`,`Hebdomada Sancta`):t>=-42&&t<=-15?K(e,`Lent`,`III classis`,`lent`,`Tempus Quadragesimae`):t>=-63&&t<=-47?K(e,`Septuagesima`,`II-III classis`,`septuagesima`,`Tempus Septuagesimae`):n===`11-02`?K(e,`All Souls`,`I classis`,`all-souls`,`Commemoratio omnium Fidelium Defunctorum`):n===`12-25`?K(e,`Christmas`,`I classis`,`christmas`,`Nativitas Domini`):n===`01-01`?K(e,`Christmas`,`I classis`,`christmas`,`In Octava Nativitatis Domini`):n===`01-06`?K(e,`Epiphany`,`I classis`,`epiphany`,`Epiphania Domini`):q(e,i)>=0&&q(e,r)<0?K(e,`Advent`,`I-III classis`,`advent`,`Tempus Adventus`):n>=`12-25`||n<=`01-13`?K(e,`Christmas`,`II-III classis`,`christmas`,`Tempus Nativitatis`):K(e,`Per Annum`,`Feria or Sunday`,`per-annum`,`Tempus per annum`)}function K(e,t,n,r,i){return{date:z(e),season:t,rank:n,celebration:i,temporalKey:r}}function xe(e){return V(V({year:e,month:12,day:25},-((new Date(e,11,25).getDay()||7)-1)-1),-21)}function q(e,t){return new Date(e.year,e.month-1,e.day).getTime()-new Date(t.year,t.month-1,t.day).getTime()}var J;async function Se(e,t=new ye){let{fixedTexts:n,lectioBrevis:r,manifest:i,psalmody:a,psalmsLatin:o}=await Ce(),s=await t.getDay(e),c=z(e),l=z(V(e,1)),u=s.temporalKey||`per-annum`,d=we(e,u),f=a[d],p=Te(e,u,a),m=Ne(e)?`laus-tibi`:`alleluia`,h=Pe(u),g=Fe(e,u),_=Be(e,u,s.rank),v=[{file:`public/data/prima1962/manifest.json`,section:i.upstreamCommit},{file:`web/www/horas/Latin/Psalterium/Special/Prima Special.txt`},{file:`web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt`}],y=X({id:p?.id?`antiphon.${p.id}`:`antiphon.${d}`,type:`verse`,latin:p?.latin||f.antiphon,chinese:p?.chinese||(`antiphonChinese`in f?String(f.antiphonChinese||``):``),translationStatus:p?.chinese||`antiphonChinese`in f&&f.antiphonChinese?`temporary-translation`:`missing`,sourceRefs:p?.sourceRefs||[]},p?.sourceRefs?.[0]?.file||`web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt`,p?p.id:`Prima ${d}`),b=f.psalms.map(e=>({number:e.replace(/\(.+\)/,``),verses:e.match(/\((.+)\)/)?.[1],text:(o[e]||[]).map(t=>X({...t,type:`psalm-verse`},t.sourceRefs?.[0]?.file||`Psalm ${e}`))})),x=je(e,u),S=Ie(h,n,u),C=[...n.opening.filter(e=>e.id!==(m===`alleluia`?`common.laus-tibi`:`common.alleluia`)),Z(`prima.psalmody.heading`,`Psalmody`,`圣咏吟唱`),y,...b.flatMap(e=>e.text),y,Z(`prima.capitulum.heading`,`Capitulum`,`短章`),n.capitulum,...n.responsory.versum,Z(`prima.responsory.heading`,`Responsorium breve`,`短答唱咏`),...S,Z(`prima.collect.heading`,`Oratio`,`祷词`),n.collect,Z(`prima.pretiosa.heading`,`Pretiosa`,`Pretiosa`),...n.pretiosa,Z(`prima.chapter.heading`,`Officium Capituli`,`会院小课`),...n.chapter,Z(`prima.lectio.heading`,`Lectio brevis`,`短读经`),n.lectioFormulae.privateBlessing,r[g],...n.lectioFormulae.conclusion,Z(`prima.ending.heading`,`Conclusio`,`结尾`),...n.ending];return{officeDate:c,martyrologyDate:l,officeTitle:`Prima (${s.celebration||s.season})`,officeRank:s.rank,temporalKey:u,sanctoralKey:s.sanctoralKey,openingAcclamation:m,hymn:n.hymn,psalmGloriaOmitted:Me(u),antiphon:y,psalms:b,includeQuicumque:x,quicumque:x?n.quicumque:void 0,capitulum:n.capitulum,responsory:{mode:h,properVerse:S.find(e=>e.type===`verse`)||S[0],properResponse:S.find(e=>e.type===`response`)||S[0],blocks:S},collect:n.collect,lectioBrevis:r[g],martyrologyOmitted:Ae(u),sourceRefs:v,warnings:_,blocks:C}}async function Ce(){return typeof window>`u`||typeof fetch>`u`?{fixedTexts:me,lectioBrevis:he,manifest:ge,psalmody:_e,psalmsLatin:ve}:(J||=Promise.all([Y(`/data/prima1962/fixed-texts.json`),Y(`/data/prima1962/lectio-brevis.json`),Y(`/data/prima1962/manifest.json`),Y(`/data/prima1962/psalmody.json`),Y(`/data/prima1962/psalms-latin.json`)]).then(([e,t,n,r,i])=>({fixedTexts:e,lectioBrevis:t,manifest:n,psalmody:r,psalmsLatin:i})),J)}async function Y(e){let t=await fetch(`${e}?v=${Date.now()}`,{cache:`no-store`});if(!t.ok)throw Error(`Unable to load Prima 1962 data: ${e}`);return t.json()}function we(e,t){return t===`triduum`?`Dominica`:[`Dominica`,`Feria II`,`Feria III`,`Feria IV`,`Feria V`,`Feria VI`,`Sabbato`][H(e)]}function Te(e,t,n){let r=De(e),i=r?n.properPrimaAntiphons?.[r]:void 0;if(i)return i;let a=Ee(e,t);if(!a)return;let o=n.seasonalAntiphons?.[a];if(o?.length)return o[0]}function Ee(e,t){if(t===`advent`)return e.month===12&&e.day>=17&&e.day<=23&&H(e)>0?`Adv4${H(e)+1}`:`Adv${Oe(e)}`;if(t===`lent`)return`Quad`;if(t===`passion`||t===`holy-week`)return`Quad5`;if([`easter`,`ascension`,`pentecost`].includes(t))return`Pasch`}function De(e){return H(e)===0?{[-63]:`Tempora/Quadp1-0`,[-56]:`Tempora/Quadp2-0`,[-49]:`Tempora/Quadp3-0`,[-42]:`Tempora/Quad1-0`,[-35]:`Tempora/Quad2-0`,[-28]:`Tempora/Quad3-0`,[-21]:`Tempora/Quad4-0`,[-14]:`Tempora/Quad5-0`,[-7]:`Tempora/Quad6-0`}[W(e,G(e.year))]:void 0}function Oe(e){let t=ke(e.year);return Math.max(1,Math.min(4,Math.floor(W(e,t)/7)+1))}function ke(e){return V(V({year:e,month:12,day:25},-((new Date(e,11,25).getDay()||7)-1)-1),-21)}function Ae(e){return e===`triduum`}function je(e,t){return t===`trinity`}function Me(e){return e===`triduum`}function Ne(e){let t=W(e,G(e.year));return t>=-63&&t<0}function Pe(e){return e===`passion`||e===`holy-week`||e===`triduum`?`passion`:[`easter`,`ascension`,`pentecost`].includes(e)?`paschal`:`ordinary`}function Fe(e,t){return t===`advent`?`Adv`:t===`christmas`?`Nat`:t===`epiphany`?`Epi`:t===`ascension`?`Asc`:t===`lent`?`Quad`:t===`passion`||t===`holy-week`?`Quad5`:t===`easter`?`Pasch`:t===`pentecost`?`Pent`:t===`triduum`||t===`holy-week`?`Quad5`:`Per Annum`}function Ie(e,t,n){let r=Re(n,t);return Le(e===`passion`?t.responsory.passion:e===`paschal`?t.responsory.paschal:t.responsory.ordinary,r)}function Le(e,t){return e.map(e=>{if([`responsory.ordinary.2`,`responsory.qui-sedes`,`responsory.qui-surrexisti`].includes(e.id)){let n=/allelúia/i.test(e.latin)&&!/allelúia/i.test(t.latin);return{...t,latin:n?`${t.latin.replace(/\.$/,``)}, allelúia.`:t.latin,chinese:n?`${t.chinese.replace(/。$/,``)}，阿肋路亚。`:t.chinese}}return e})}function Re(e,t){let n=t.responsory.properVerses||{};return n[ze(e)]||n.ordinary||t.responsory.ordinary[1]}function ze(e){return e===`advent`?`adv`:e===`christmas`?`nat`:e===`epiphany`?`epi`:e===`easter`?`pasch`:e===`ascension`?`asc`:e===`pentecost`?`pent`:e===`corpus`?`corp`:e===`heart`?`heart`:`ordinary`}function Be(e,t,n){let r=[],i=U(e);return[`triduum`,`all-souls`].includes(t)&&r.push(`此日 Prima 结构含特殊规则；当前 resolver 标示省略或警告，未声称完整复刻全部红字。`),/I classis/.test(n)&&r.push(`一等庆节的专用对经、圣咏和荣颂变化需用 Divinum Officium oracle 继续逐日校验；当前版本采用罗马礼 1960 小时辰通用表。`),(i===`02-29`||i===`02-28`||i===`03-01`)&&r.push(`闰年二月底日期已用本地日期计算避免 UTC 跨日；专有圣人日课转移规则仍需人工校验。`),r}function X(e,t,n){return{...e,sourceRefs:e.sourceRefs?.length?e.sourceRefs:[{file:t,section:n}]}}function Z(e,t,n){return{id:e,type:`heading`,latin:t,chinese:n,translationStatus:`existing-project-translation`,sourceRefs:[]}}async function Ve(e){let t=await He(e,5e3);if(!t.ok)throw Error(`无法加载 ${e}`);if(!(t.headers.get(`content-type`)||``).includes(`application/json`))throw Error(`无法加载 ${e}：返回的不是 JSON`);return t.json()}async function He(e,t){let n=new AbortController,r=setTimeout(()=>n.abort(),t);try{return await fetch(e,{signal:n.signal})}finally{clearTimeout(r)}}function Ue(e,t){let n=oe(e),r=p(!0),a=p(``),o=p(`computus`),s=p(new Date),c=p(j(s.value)),l=i(()=>E(s.value,1)),u=i(()=>A(l.value)),d=p(null),f=p(null),m=p(!1),h=p([]),g=p([]),_=p(null),v=i(()=>new Intl.DateTimeFormat(`zh-CN`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}).format(l.value));async function y(){r.value=!0,a.value=``,d.value=null,f.value=null,m.value=!1,h.value=[],g.value=[],_.value=null;try{let[r,i]=await Promise.all([Promise.resolve(M(e,u.value)),Ve(`/data/martyrology/movable-feasts.json`)]);if(d.value=r,t.value===`prima1962`){_.value=await Se(B(s.value));let e=D(l.value,{});f.value=i.find(t=>t.id===e)||null,m.value=e===`holy-triduum`,h.value=n.readings,g.value=n.prayers;return}let{data:a,source:c}=await k(l.value);o.value=c;let p=D(l.value,a);f.value=i.find(e=>e.id===p)||null,m.value=p===`holy-triduum`;let v=T(n.readings,l.value,a?.season);h.value=v.length?v:n.readings,g.value=n.prayers}catch(e){a.value=e instanceof Error?e.message:String(e)}finally{r.value=!1}}function b(){return s.value=O(c.value),y()}return{loading:r,error:a,apiSource:o,readingDate:s,selectedDateValue:c,targetDate:l,targetKey:u,targetChineseDate:v,fixedDay:d,movableFeast:f,omitted:m,readings:h,prayers:g,primaResolution:_,loadForTargetDate:y,syncSelectedDate:b}}function Q(e){let t=p(0),n=p(0),r=i(()=>e.value[t.value]);function a(){t.value=0}function o(){e.value.length&&(t.value=(t.value-1+e.value.length)%e.value.length)}function s(){e.value.length&&(t.value=(t.value+1)%e.value.length)}function c(e){n.value=e.touches[0]?.clientX||0}function l(e){let t=(e.changedTouches[0]?.clientX||0)-n.value;Math.abs(t)<40||(t>0?o():s())}return{selectedIndex:t,currentItem:r,reset:a,previous:o,next:s,onSwipeStart:c,onSwipeEnd:l}}var We={key:0},Ge={key:1,class:`roman-date`},Ke={key:2},qe={key:3,class:`missing-data`},Je={key:0},Ye=[`innerHTML`],Xe=[`innerHTML`],Ze=y({__name:`MartyrologyReadingBody`,props:{fixedDay:{},movableFeast:{},omitted:{type:Boolean},targetKey:{},title:{},embedded:{type:Boolean}},setup(e){return(n,i)=>(t(),o(c,null,[(t(),f(h(e.embedded?`div`:`section`),{class:g([`date-announcement`,e.embedded?``:`martyrology-panel`])},{default:w(()=>[e.embedded?r(`v-if`,!0):(t(),o(`h2`,We,b(e.title||`日期宣报`),1)),e.fixedDay?(t(),o(`p`,Ge,b(e.fixedDay.date_roman),1)):r(`v-if`,!0),e.fixedDay?(t(),o(`p`,Ke,b(e.fixedDay.date_chinese),1)):(t(),o(`p`,qe,` 尚未在 pages/martyrologium-translation/index.md 中找到 `+b(e.targetKey)+` 的日期段落。请确认总文件内存在类似“## `+b(_(L)(e.targetKey))+`”的标题。 `,1))]),_:1},8,[`class`])),e.movableFeast?(t(),f(h(e.embedded?`div`:`section`),{key:0,class:g([`movable-feast`,e.embedded?``:`martyrology-panel`])},{default:w(()=>[(t(),f(h(e.embedded?`h3`:`h2`),null,{default:w(()=>[u(b(e.movableFeast.name),1)]),_:1})),d(`p`,null,b(e.movableFeast.text),1)]),_:1},8,[`class`])):r(`v-if`,!0),e.omitted?(t(),f(h(e.embedded?`div`:`section`),{key:1,class:g([`martyrology-warning`,e.embedded?``:`martyrology-panel`])},{default:w(()=>[...i[0]||=[u(` 殉道圣人录之诵读从略。 `,-1)]]),_:1},8,[`class`])):(t(),o(c,{key:2},[e.fixedDay?(t(),f(h(e.embedded?`div`:`section`),{key:0,class:g([`martyrology-reading-content`,e.embedded?``:`martyrology-panel`])},{default:w(()=>[e.embedded?r(`v-if`,!0):(t(),o(`h2`,Je,` 固定赞辞 `)),i[1]||=d(`p`,{class:`inline-help`},` 编号旁带星号（*）的圣人或真福，通常只在获准敬礼该圣人或真福的教区、地区或修会团体内诵读。 `,-1),d(`div`,{class:`raw-martyrology`,innerHTML:e.fixedDay.content_html},null,8,Ye)]),_:1},8,[`class`])):r(`v-if`,!0),e.fixedDay?.notes_html?(t(),f(h(e.embedded?`div`:`section`),{key:1,class:g([`notes`,e.embedded?``:`martyrology-panel`])},{default:w(()=>[i[3]||=d(`p`,{class:`notes-intro`},` 以下校注仅供阅读参考，诵念殉道圣人录时不念。 `,-1),d(`details`,null,[i[2]||=d(`summary`,null,`校注`,-1),d(`div`,{class:`raw-martyrology`,innerHTML:e.fixedDay.notes_html},null,8,Xe)])]),_:1},8,[`class`])):r(`v-if`,!0)],64))],64))}}),Qe={class:`martyrology-panel`},$e={key:1,class:`missing-data`},et={key:2,class:`choice-dots`},tt=[`aria-label`,`onClick`],nt={class:`martyrology-panel`},rt={key:0},it={key:1,class:`missing-data`},at={key:2,class:`choice-dots`},ot=[`aria-label`,`onClick`],st=y({__name:`MartyrologyCurrentRite`,props:{fixedDay:{},movableFeast:{},omitted:{type:Boolean},targetKey:{},readings:{},prayers:{}},setup(n){let i=n,a=Q(m(i,`readings`)),l=Q(m(i,`prayers`)),{selectedIndex:f,currentItem:p,previous:h,next:y,onSwipeStart:x,onSwipeEnd:S,reset:C}=a,{selectedIndex:w,currentItem:T,previous:E,next:D,onSwipeStart:O,onSwipeEnd:k,reset:A}=l;return v(()=>i.readings,()=>C()),v(()=>i.prayers,()=>A()),(i,a)=>(t(),o(c,null,[e(Ze,{"fixed-day":n.fixedDay,"movable-feast":n.movableFeast,omitted:n.omitted,"target-key":n.targetKey},null,8,[`fixed-day`,`movable-feast`,`omitted`,`target-key`]),n.omitted?r(`v-if`,!0):(t(),o(c,{key:0},[a[12]||=d(`section`,{class:`martyrology-panel versicle`},[d(`h2`,null,`短对答咏`),d(`p`,null,[d(`strong`,null,`领：`),u(`在上主台前何其珍贵的，`)]),d(`p`,{class:`response`},[d(`strong`,null,`应：`),u(`是祂圣徒们的死亡。`)]),d(`p`,{class:`inline-help`},` 若在日间小时辰中诵读，短对答咏后可直接以“请赞美上主”及惯常答句结束；若在晨祷中或时辰礼仪外诵读，则继续短读经、祷词与结束词。 `)],-1),d(`section`,Qe,[a[10]||=d(`h2`,null,`短读经`,-1),_(p)?(t(),o(`div`,{key:0,class:`choice-card`,onTouchstart:a[2]||=(...e)=>_(x)&&_(x)(...e),onTouchend:a[3]||=(...e)=>_(S)&&_(S)(...e)},[n.readings.length>1?(t(),o(`button`,{key:0,type:`button`,class:`choice-arrow left`,"aria-label":`上一篇短读经`,onClick:a[0]||=(...e)=>_(h)&&_(h)(...e)},` ‹ `)):r(`v-if`,!0),d(`article`,null,[d(`h3`,null,b(_(p).title),1),d(`p`,null,b(_(p).text),1),a[8]||=d(`p`,{class:`acclamation`},[d(`strong`,null,`领：`),u(`上主的圣言。`)],-1),a[9]||=d(`p`,{class:`response`},[d(`strong`,null,`应：`),u(`感谢天主。`)],-1)]),n.readings.length>1?(t(),o(`button`,{key:1,type:`button`,class:`choice-arrow right`,"aria-label":`下一篇短读经`,onClick:a[1]||=(...e)=>_(y)&&_(y)(...e)},` › `)):r(`v-if`,!0)],32)):(t(),o(`p`,$e,` 尚未从 pages/martyrologium-translation/index.md 解析到短读经。 `)),n.readings.length>1?(t(),o(`div`,et,[(t(!0),o(c,null,s(n.readings,(e,n)=>(t(),o(`button`,{key:n,type:`button`,class:g({active:n===_(f)}),"aria-label":`切换到第 ${n+1} 篇短读经`,onClick:e=>f.value=n},null,10,tt))),128))])):r(`v-if`,!0)]),d(`section`,nt,[a[11]||=d(`h2`,null,`祷词`,-1),_(T)?(t(),o(`div`,{key:0,class:`choice-card`,onTouchstart:a[6]||=(...e)=>_(O)&&_(O)(...e),onTouchend:a[7]||=(...e)=>_(k)&&_(k)(...e)},[n.prayers.length>1?(t(),o(`button`,{key:0,type:`button`,class:`choice-arrow left`,"aria-label":`上一篇祷词`,onClick:a[4]||=(...e)=>_(E)&&_(E)(...e)},` ‹ `)):r(`v-if`,!0),d(`article`,null,[_(T).title?(t(),o(`h3`,rt,b(_(T).title),1)):r(`v-if`,!0),d(`p`,null,b(_(T).text),1)]),n.prayers.length>1?(t(),o(`button`,{key:1,type:`button`,class:`choice-arrow right`,"aria-label":`下一篇祷词`,onClick:a[5]||=(...e)=>_(D)&&_(D)(...e)},` › `)):r(`v-if`,!0)],32)):(t(),o(`p`,it,` 尚未从 pages/martyrologium-translation/index.md 解析到祷词。 `)),n.prayers.length>1?(t(),o(`div`,at,[(t(!0),o(c,null,s(n.prayers,(e,n)=>(t(),o(`button`,{key:n,type:`button`,class:g({active:n===_(w)}),"aria-label":`切换到第 ${n+1} 篇祷词`,onClick:e=>w.value=n},null,10,ot))),128))])):r(`v-if`,!0)]),a[13]||=d(`section`,{class:`martyrology-panel blessing`},[d(`h2`,null,`结束词`),d(`p`,null,`愿全能的天主降福我们，保护我们免于灾祸，引领我们到达永生。`),d(`p`,null,`凡诸信者灵魂，赖天主仁慈，息止安所。`),d(`p`,{class:`response`},[d(`strong`,null,`应：`),u(`阿们。`)]),d(`p`,null,[d(`strong`,null,`领：`),u(`祝大家平安。`)]),d(`p`,{class:`response`},[d(`strong`,null,`应：`),u(`感谢天主。`)])],-1)],64))],64))}}),ct={class:`latin`},lt={key:0,class:`marker`},ut={key:1,class:`marker`},dt={key:0,class:`chinese`},ft={key:0,class:`marker`},pt={key:1,class:`marker`},$=y({__name:`BilingualLiturgicalBlock`,props:{block:{},bilingual:{type:Boolean}},setup(e){let n=e;function i(e){return e.replace(/^℣\.\s*|^℟\.\s*/,``)}function a(e){return n.block.type===`verse`?e.replace(/^领：\s*/,``):n.block.type===`response`?e.replace(/^答：\s*|^应：\s*|^众：\s*/,``):e}return(n,s)=>(t(),o(`div`,{class:g([`bilingual-block`,[`block-${e.block.type}`,{"single-column":e.bilingual===!1}]])},[d(`div`,ct,[e.block.type===`verse`?(t(),o(`span`,lt,`℣.`)):e.block.type===`response`?(t(),o(`span`,ut,`℟.`)):r(`v-if`,!0),d(`span`,null,b(i(e.block.latin)),1)]),e.bilingual===!1?r(`v-if`,!0):(t(),o(`div`,dt,[e.block.type===`verse`?(t(),o(`span`,ft,`领：`)):e.block.type===`response`?(t(),o(`span`,pt,`众：`)):r(`v-if`,!0),d(`span`,null,b(e.block.chinese?a(e.block.chinese):`（中文暂缺）`),1)]))],2))}}),mt={class:`bilingual-psalm`},ht=y({__name:`BilingualPsalm`,props:{title:{},number:{},verses:{},text:{},bilingual:{type:Boolean},omitGloria:{type:Boolean}},setup(e){function n(e,t){if(!e)return`圣咏`;let n=`圣咏${i(Number(e))}`;return t?`${n}（${a(t)}节）`:n}function i(e){let t=[`零`,`一`,`二`,`三`,`四`,`五`,`六`,`七`,`八`,`九`];if(e<=10)return e===10?`十`:t[e];if(e<20)return`十${t[e-10]}`;if(e<100){let n=Math.floor(e/10),r=e%10;return`${t[n]}十${r?t[r]:``}`}let n=Math.floor(e/100),r=e%100;return r?r<10?`${t[n]}百零${t[r]}`:r<20?`${t[n]}百一十${r>10?t[r-10]:``}`:`${t[n]}百${i(r)}`:`${t[n]}百`}function a(e){return e.replace(/'/g,``).replace(/[a-z]/gi,``).replace(`-`,`—`)}function l(e){return e?` (${a(e)})`:``}return(i,a)=>(t(),o(`section`,mt,[d(`h4`,null,b(n(e.number,e.verses))+` / `+b(e.title)+b(l(e.verses)),1),(t(!0),o(c,null,s(e.text,n=>(t(),f($,{key:n.id,block:n,bilingual:e.bilingual},null,8,[`block`,`bilingual`]))),128)),e.omitGloria?r(`v-if`,!0):(t(),f($,{key:0,block:{id:`${e.title}.gloria`,type:`verse`,latin:`℣. Glória Patri, et Fílio, et Spirítui Sancto.`,chinese:`愿光荣归于父、及子、及圣神。`,translationStatus:`existing-project-translation`,sourceRefs:[]},bilingual:e.bilingual},null,8,[`block`,`bilingual`])),e.omitGloria?r(`v-if`,!0):(t(),f($,{key:1,block:{id:`${e.title}.sicut`,type:`response`,latin:`℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.`,chinese:`起初如何，今日亦然，直到永远。阿们。`,translationStatus:`existing-project-translation`,sourceRefs:[]},bilingual:e.bilingual},null,8,[`block`,`bilingual`]))]))}}),gt={key:0,class:`martyrology-panel`},_t={key:0,class:`martyrology-panel`},vt={open:``},yt={class:`martyrology-panel prima-office`},bt={class:`inline-help`},xt={key:1,class:`martyrology-panel prima-office`,id:`incipit`},St={key:2,class:`martyrology-panel prima-office`,id:`hymnus`},Ct={class:`martyrology-panel prima-office`,id:`psalmi`},wt={key:2,class:`quicumque-notice`},Tt={key:3,class:`martyrology-panel prima-office`,id:`capitulum-responsorium-versus`},Et={key:4,class:`martyrology-panel prima-office`,id:`oratio`},Dt={key:5,class:`martyrology-panel prima-office`,id:`oratio`},Ot={key:6,class:`martyrology-panel prima-office`,id:`martyrologium`},kt={key:7,class:`martyrology-panel prima-office`,id:`officium-capituli`},At={key:8,class:`martyrology-panel prima-office`,id:`lectio-brevis`},jt={class:`prima-inline-option`},Mt={key:9,class:`martyrology-panel prima-office`,id:`conclusio`},Nt={key:0},Pt=y({__name:`MartyrologyPrima1962`,props:{resolution:{},fixedDay:{},movableFeast:{},omitted:{type:Boolean},targetKey:{},bilingual:{type:Boolean}},setup(n){let a=n,l=p(!1),m=i(()=>{if(!a.resolution)return[];let e=a.resolution.blocks.find(e=>e.id===`common.${a.resolution?.openingAcclamation}`);return[...a.resolution.blocks.filter(e=>e.id.startsWith(`opening.`)),v(`opening.gloria-patri`,`verse`,`℣. Glória Patri, et Fílio, et Spirítui Sancto.`,`愿光荣归于父、及子、及圣神。`),v(`opening.sicut-erat`,`response`,`℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.`,`起初如何，今日亦然，直到永远。阿们。`),...e?[{...e,type:`prayer`}]:[]]}),h=i(()=>a.resolution?.blocks.filter(e=>e.id.startsWith(`chapter.`))||[]),g=i(()=>a.resolution?.temporalKey===`triduum`),_=i(()=>{let e=new Set;return(a.resolution?.hymn||[]).filter(t=>e.has(t.id)?!1:(e.add(t.id),!0))});function v(e,t,n,r){return{id:e,type:t,latin:n,chinese:r,translationStatus:`temporary-translation`,sourceRefs:[]}}function y(e){let t=e.lectioBrevis.id.replace(`lectio.`,``);return`8. 短读经〔${{"per-annum":`常年`,adv:`将临期`,nat:`圣诞期`,epi:`主显期`,asc:`耶稣升天后`,quad:`四旬期`,quad5:`苦难期`,pasch:`复活期`,pent:`圣神降临期`}[t]||`本日`}〕 / Lectio brevis {${{"per-annum":`Per Annum`,adv:`Adventus`,nat:`Nativitas`,epi:`Epiphania`,asc:`Tempus Ascensionis`,quad:`Quadragesima`,quad5:`Tempus Passionis`,pasch:`Tempus Paschale`,pent:`Tempus Pentecostes`}[t]||t}}`}let x=i(()=>{if(!a.resolution)return[];let e=a.resolution.officeTitle.includes(`Cena Domini`);return[v(`triduum.christus-factus`,`verse`,e?`℣. Christus factus est pro nobis obédiens usque ad mortem.`:`℣. Christus factus est pro nobis obédiens usque ad mortem, mortem autem crucis.`,e?`领：基督为了我们，服从至死。`:`领：基督为了我们，服从至死，且死在十字架上。`),v(`triduum.pater-rubric`,`notice`,`Pater noster dicitur secreto.`,`天主经默念。`),v(`triduum.respice`,`prayer`,`Réspice, quǽsumus, Dómine, super hanc famíliam tuam, pro qua Dóminus noster Iesus Christus non dubitávit mánibus tradi nocéntium, et crucis subíre torméntum.`,`上主，求你垂顾你的家庭；我们的主耶稣基督为了她，甘愿被交在恶人手中，并承受十字架的苦刑。`)]});return(i,a)=>(t(),o(c,null,[a[22]||=d(`section`,{class:`martyrology-panel prima-notice`},[d(`h2`,null,`混合礼文 / Forma mixta`),d(`p`,null,` 本页采用1962年《罗马日课经》第一时辰经的结构及1960年规程，并配用本站现有的新礼《罗马殉道录》文本；并非1962年礼书的完整原样复刻。 `)],-1),n.resolution?(t(),o(c,{key:1},[n.resolution.warnings.length?(t(),o(`section`,_t,[d(`details`,vt,[a[1]||=d(`summary`,null,`Resolver warning`,-1),(t(!0),o(c,null,s(n.resolution.warnings,e=>(t(),o(`p`,{key:e,class:`inline-help`},b(e),1))),128))])])):r(`v-if`,!0),d(`section`,yt,[a[2]||=d(`h2`,null,`第一时辰经 / Ad Primam`,-1),d(`p`,bt,` 日期：`+b(n.resolution.officeDate)+`；等级：`+b(n.resolution.officeRank)+`；圣人录宣报：`+b(n.resolution.martyrologyDate),1)]),g.value?r(`v-if`,!0):(t(),o(`section`,xt,[a[3]||=d(`h2`,null,`1. 开端词`,-1),(t(!0),o(c,null,s(m.value,e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])),g.value?r(`v-if`,!0):(t(),o(`section`,St,[a[4]||=d(`h2`,null,`2. 赞美诗 / Hymnus`,-1),(t(!0),o(c,null,s(_.value,e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])),d(`section`,Ct,[a[7]||=d(`h2`,null,`3. 圣咏〔依本日圣咏集〕 / Psalmi {ex Psalterio secundum diem}`,-1),g.value?r(`v-if`,!0):(t(),o(c,{key:0},[a[5]||=d(`h3`,null,`对经 / Antiphona`,-1),e($,{block:n.resolution.antiphon,bilingual:n.bilingual},null,8,[`block`,`bilingual`])],64)),(t(!0),o(c,null,s(n.resolution.psalms,e=>(t(),f(ht,{key:`${e.number}:${e.verses||``}`,title:`Psalmus ${e.number}`,number:e.number,verses:e.verses,text:e.text,bilingual:n.bilingual,"omit-gloria":n.resolution.psalmGloriaOmitted},null,8,[`title`,`number`,`verses`,`text`,`bilingual`,`omit-gloria`]))),128)),g.value?r(`v-if`,!0):(t(),f($,{key:1,block:{...n.resolution.antiphon,latin:`Ant. ${n.resolution.antiphon.latin}`},bilingual:n.bilingual},null,8,[`block`,`bilingual`])),n.resolution.includeQuicumque&&n.resolution.quicumque?(t(),o(`section`,wt,[a[6]||=d(`h3`,null,`不拘谁信经 / Symbolum Quicumque`,-1),(t(!0),o(c,null,s(n.resolution.quicumque,e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])):r(`v-if`,!0)]),g.value?r(`v-if`,!0):(t(),o(`section`,Tt,[a[8]||=d(`h2`,null,`4. 短章、短答咏与短句〔依本日圣咏集〕 / Capitulum Responsorium Versus {ex Psalterio secundum diem}`,-1),a[9]||=d(`h3`,null,`短章 / Capitulum`,-1),a[10]||=d(`p`,{class:`inline-help`},`1 Tim 1,17`,-1),e($,{block:n.resolution.capitulum,bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`capitulum.deo-gratias`,`response`,`℟. Deo grátias.`,`感谢天主。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),a[11]||=d(`h3`,null,`短答咏 / Responsorium breve`,-1),(t(!0),o(c,null,s(n.resolution.responsory.blocks,e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128)),a[12]||=d(`h3`,null,`短句 / Versus`,-1),(t(!0),o(c,null,s(n.resolution.blocks.filter(e=>e.id===`responsory.exsurge`||e.id===`responsory.libera`),e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])),g.value?(t(),o(`section`,Et,[a[13]||=d(`h2`,null,`5. 祷词 / Oratio`,-1),(t(!0),o(c,null,s(x.value,e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])):(t(),o(`section`,Dt,[a[14]||=d(`h2`,null,`5. 祷词 / Oratio`,-1),e($,{block:v(`oratio.domine-exaudi.1`,`verse`,`℣. Dómine, exáudi oratiónem meam.`,`上主，求你俯听我的祈祷。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.clamor.1`,`response`,`℟. Et clamor meus ad te véniat.`,`愿我的呼声上达于你。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.oremus`,`prayer`,`Orémus.`,`请大家祈祷。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:n.resolution.collect,bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.domine-exaudi.2`,`verse`,`℣. Dómine, exáudi oratiónem meam.`,`上主，求你俯听我的祈祷。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.clamor.2`,`response`,`℟. Et clamor meus ad te véniat.`,`愿我的呼声上达于你。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.benedicamus`,`verse`,`℣. Benedicámus Dómino.`,`请赞美上主。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`oratio.deo-gratias`,`response`,`℟. Deo grátias.`,`感谢天主。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`])])),g.value?r(`v-if`,!0):(t(),o(`section`,Ot,[a[15]||=d(`h2`,null,`6. 《罗马殉道录》（预读翌日） / Martyrologium {anticipatur}`,-1),e(Ze,{embedded:``,"fixed-day":n.fixedDay,"movable-feast":n.movableFeast,omitted:n.omitted||n.resolution.martyrologyOmitted,"target-key":n.targetKey},null,8,[`fixed-day`,`movable-feast`,`omitted`,`target-key`]),e($,{block:v(`martyrology.et-alibi`,`verse`,`℣. Et álibi aliórum plurimórum sanctórum Mártyrum et Confessórum, atque sanctárum Vírginum.`,`在其他地方，还有许多圣殉道者、精修者及圣童贞女。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`martyrology.deo-gratias`,`response`,`℟. Deo grátias.`,`感谢天主。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),a[16]||=d(`span`,{id:`pretiosa`,class:`hidden-anchor`},null,-1),(t(!0),o(c,null,s(n.resolution.blocks.filter(e=>e.id.startsWith(`martyrology.`)),e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])),g.value?r(`v-if`,!0):(t(),o(`section`,kt,[a[17]||=d(`h2`,null,`7. 会院日课 / De Officio Capituli`,-1),(t(!0),o(c,null,s(h.value.slice(0,8),e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128)),e($,{block:h.value.find(e=>e.id===`chapter.kyrie`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`chapter.pater-rubric`,`notice`,`Pater noster dicitur secreto usque ad “Et ne nos indúcas in tentatiónem”.`,`天主经默念，直到“不要让我们陷于诱惑”。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:h.value.find(e=>e.id===`chapter.pater-secret`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),(t(!0),o(c,null,s(h.value.filter(e=>[`chapter.et-ne-nos`,`chapter.sed-libera`,`chapter.respice`,`chapter.respice.response`].includes(e.id)),e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128)),e($,{block:v(`chapter.gloria-short`,`verse`,`℣. Glória Patri, et Fílio, et Spirítui Sancto.`,`愿光荣归于父、及子、及圣神。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:v(`chapter.oremus`,`prayer`,`Orémus.`,`请大家祈祷。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),e($,{block:h.value.find(e=>e.id===`chapter.dirigere`),bilingual:n.bilingual},null,8,[`block`,`bilingual`])])),g.value?r(`v-if`,!0):(t(),o(`section`,At,[d(`h2`,null,b(y(n.resolution)),1),d(`label`,jt,[S(d(`input`,{"onUpdate:modelValue":a[0]||=e=>l.value=e,type:`checkbox`},null,512),[[C,l.value]]),a[18]||=u(` 有神父主礼 `,-1)]),e($,{block:l.value?v(`lectio.iube-domne`,`verse`,`Iube, domne, benedícere.`,`请神父祝福。`):v(`lectio.iube-domine`,`verse`,`Iube, Dómine, benedícere.`,`上主，求你降福。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),a[19]||=d(`h3`,null,`降福 / Benedictio`,-1),e($,{block:v(`lectio.benedictio`,`prayer`,`Dies et actus nostros in sua pace dispónat Dóminus omnípotens. Amen.`,`愿全能的上主安排我们的时日和行为，使之安处于他的平安中。阿们。`),bilingual:n.bilingual},null,8,[`block`,`bilingual`]),a[20]||=d(`p`,{class:`inline-help`},`2 Thess 3:5`,-1),e($,{block:n.resolution.lectioBrevis,bilingual:n.bilingual},null,8,[`block`,`bilingual`]),(t(!0),o(c,null,s(n.resolution.blocks.filter(e=>e.id===`lectio.tu-autem`||e.id===`common.deo-gratias`),e=>(t(),f($,{key:e.id,block:e,bilingual:n.bilingual},null,8,[`block`,`bilingual`]))),128))])),g.value?r(`v-if`,!0):(t(),o(`section`,Mt,[a[21]||=d(`h2`,null,`9. 结束词 / Conclusio`,-1),(t(!0),o(c,null,s(n.resolution.blocks.filter(e=>e.id.startsWith(`ending.`)||e.id===`common.amen`),i=>(t(),o(c,{key:i.id},[i.id===`ending.dominus-nos`?(t(),o(`h3`,Nt,`降福 / Benedictio`)):r(`v-if`,!0),e($,{block:i,bilingual:n.bilingual},null,8,[`block`,`bilingual`])],64))),128))]))],64)):(t(),o(`section`,gt,` 正在解析 Prima…… `))],64))}}),Ft=`---
title: "圣人录译稿"
date: 2026-07-15
---

# 罗马殉道圣人录（中文译本）

## 翻译总则

**底本**：拉丁文 *Martyrologium Romanum, editio typica altera*（2004）。参校本：西班牙语官方译本。编号从拉丁版。

**人名本土化原则**：圣人名按时代与本土语言音译。古代及中世纪圣人（如高卢、罗马诸圣）从教会拉丁语；近世圣人从其本土语言（如十六世纪英国殉道者从英语，十七世纪法国传教士从法语，二十世纪意大利、波兰真福从意、波语）。凡万有真原或其他中文天主教权威来源已有定例者（如若望、多默、安多尼、加大利纳等教名）从其定例。首见处附本土语言原名。凡遇中国相关圣人，据香港教区档案处"120位中华殉道圣人"名录核实中文教名。

**拉丁语名词尾 *-us* 之处理**：天主教中文圣名历来经由教会拉丁语（意大利式发音）传入，拉丁名词尾 *-us* 在口语中自然弱化为 *-o*。本译对无既有定例之人名从此惯例：*-us* → *-o*（如 Lauriánus → 劳里亚诺），*-ius* → *-io*（如 Floréntius → 弗洛伦齐奥），*-cus* → *-co*（如 Udalrícus → 乌达利科）。已固化之专用后缀从定例：*-tinus* → 定（瓦伦定），*-sius* → 削（亚大纳削），*-tius* → 爵（依纳爵）。裸 *-us* 不单独出字为"乌斯"。

**地名**：古代行省名保留拉丁形式并注今名（如"路西塔尼亚（葡萄牙）"）。现今仍存之城市用今日通行中文名（如"佛罗伦萨""约克"）。

**星号条目（\\*）**：拉丁原文中带星号者，为地方教会或修会专属纪念，非通用罗马历必行。

**年代**：拉丁文多不标注年代，本译参照西语版及通行史料补入，置于条目末尾括号中。"世纪"标注（如"五世纪"）系概估。

**称号**：拉丁文 *regína* 兼有女王（queen regnant）与王后（queen consort）之义，翻译时据史实判断。非天主教人物之人名从世俗通行译法（如英国女王伊丽莎白一世，不用天主教教名"依撒伯尔"）。

**中国籍圣人姓名格式**：按香港教区档案处惯例，圣名（教名）置于中文姓名之后（如"圣陈金婕德兰"而非"圣德兰陈金婕"）。

**术语对照**：殉道 *martyr*、司铎 *presbyter*、主教 *episcopus*、隐修士 *eremita*、女院长 *abbatissa*、童贞 *virgo*、平信徒 *laicus*、善终 *transitus*、安放圣髑 *depositio*、赞辞 *elogium*。

**关于"赞辞"（*elogium*）一词**：殉道圣人录中每位圣人或真福的简短礼仪性纪传，拉丁文称 *elogium*（复数 *elogia*），该词源于古罗马墓志铭及碑文赞语的传统。此术语在中文天主教文献中无既有译名，因《罗马殉道圣人录》此前从未被译为中文。本译取"赞辞"一词，兼顾其纪传功能与礼仪赞颂色彩。

**罗马历日期**：每日条目首行的拉丁文日期采用古罗马历法。罗马人不按顺序数日期，而是从每月三个固定基准日倒数：初一（Kalendae）、初五或初七（Nonae，三、五、七、十月为初七，余月为初五）、十三或十五日（Idus，三、五、七、十月为十五日，余月为十三日）。日期表述为"某基准日前第几日"，含当日在内。换算方法：用基准日的日期减去序数再加一。例如七月的 Nonae 为初七，"Quarto Nonas iúlii"即"初七前第四日"，7−4+1=4，即七月四日。本译文已将各日的罗马历日期直接换算为中文。

**月龄表（Luna）**：每日条目所附之字母-数字对照表为月龄推算工具，详见总论后"论自由选择举行的月龄宣报"一章。

---

# 罗马殉道圣人录

依梵蒂冈第二届大公会议法令审订
以教宗若望·保禄二世之权威颁布

**第二版**

梵蒂冈出版社
主历二〇〇四年

---

Editio typica 2001
Editio altera 2004

© «Copyright» apud Administrationem Patrimonii Sedis Apostolicae in Civitate Vaticana 2004.

Venditio operis fit cura Librariae Editricis Vaticanae (Libreria Editrice Vaticana, Città del Vaticano)

---

## 礼仪及圣事部法令

案号 551/00/L

教会自太古以来，即在新旧二约之诸圣中庆祝基督的逾越胜利，欢然宣认信友在吾主耶稣基督救世者奥体之共融内彼此相通。

历代以来，教会以各种方式保存了诸圣的名字及事迹之记忆。因此，奉教宗额我略十三世之命于一五八四年初版刊行、按新历法及教会历史之真实予以修订的《罗马殉道圣人录》，此后历经多位罗马教宗之命令，屡次审订、修正及增补，直至一九六〇年。

然而，此书源自最古老的拉丁殉道圣人录，即所谓《热罗尼莫殉道圣人录》（Martyrologium Hieronymianum）。该书乃汇合罗马、非洲及叙利亚诸历法而成，此后又逐渐增入其他地区众多圣人之名字，但其间亦不免多有重出、混淆及其他谬误。

按梵蒂冈第二届大公会议关于神圣礼仪之宪章《礼仪宪章》（Sacrosanctum Concilium）之规定，为使"圣人之受难事迹或行传合乎历史之可信"（第九十二条丙款），实有必要将殉道圣人录所载之圣人名字及其赞辞，依历史学科之准则加以审核，较前更为审慎地处理。此外，凡经教会认可而享有公开敬礼之圣人及真福，不论其敬礼系自古相沿（即使仅属地方性者），抑或系一九六〇年以来之隆重宣告所确立者，亦须一并收录。

此项浩大而艰巨的工程，历经长期编纂，现已完成。值此第三个千年之初，得以面世，每日向信友提示诸圣之名字与榜样。

为此，教宗若望·保禄二世以宗座权威批准本版《罗马殉道圣人录》。礼仪及圣事部现予颁布，并声明此书为标准版本。本版以拉丁文编纂，自公布之日起即行生效。

任何与此相抵触之规定，概不能阻止其效力。

发自礼仪及圣事部
二〇〇一年六月二十九日
圣伯多禄及圣保禄宗徒瞻礼

部　长　豪尔赫·A·梅迪纳·埃斯特维斯枢机
秘书长　方济各·比约·坦布里诺总主教

## 礼仪及圣事部法令

案号 1140/04/L

全能天主圣父的仁慈世世代代使福音真理之言在普世丰沛结实，使救恩的伟大计划在基督内达至圆满。天主赐予基督信友敬礼诸圣人功绩的恩典，以增多代祷者，将人们所渴望的主之宽赦丰厚地施与世人。至圣圣三之爱的这些奇妙化工，教会在敬礼圣人时不懈地尊崇并宣扬，朝拜在众圣中显示奇妙、独一神圣的天主自身；因为主在世上赐给了他们各种不同的恩宠，在天上则赐予同一光荣的赏报。

天主子民对圣人虔敬的卓越标记，就是近年来依梵蒂冈第二届大公会议之法令而审订的《罗马殉道圣人录》，其标准版本于二〇〇一年六月二十九日颁布。此后不久，鉴于礼仪革新在实际使用中的需要，并接受了致力于这项浩大艰巨工程之研究者的专门建议，认为有必要作若干修正，以使文本更加丰富明晰。

因此，不少经教宗若望·保禄二世擢升为真福或圣品的天主之仆已收入本版，以便即时以相应之赞辞于其庆日予以纪念。另有若干变更涉及先前版本中遗漏或在历史考据上尚存疑义的圣人。此外还有拉丁文文字及正字法方面的细微修订。

为此，礼仪及圣事部凭教宗若望·保禄二世所授予的特别权限，现予颁布本《罗马殉道圣人录》第二版，并声明此版为"标准版本"。各主教团有责任将本版所载之文本译为各地方语言，并呈报本部审核批准。

任何与此相抵触之规定，概不能阻止其效力。

发自礼仪及圣事部
二〇〇四年六月二十九日
圣伯多禄及圣保禄宗徒瞻礼

部　长　方济各·阿林泽枢机
秘书长　多明我·索伦蒂诺总主教

---

## 总论

### 一、论救恩计划中的圣德

*论人类成圣的普世圣召*

**1.** 天主圣父愿意一切按照祂的肖像所造的人（参创一26-27）得救，并认识真理（参弟前二4）；而主耶稣基督就是人归向父的道路（参若十四6）。因此，所有人，首先是基督信友，无论其身份地位如何，都蒙召走向基督徒生活的圆满和爱德的完善；这种圣德在世俗社会中也促进更合乎人性的生活方式。<sup>1</sup>

**2.** 更有甚者，天主圣父在基督内重建一切（参弗一10），显示了祂的旨意，即人的成圣（参得前四3）。这种成圣借着基督、偕同基督并在基督内，<sup>2</sup>日益增长，以彰显三位一体且不可分之天主更大的光荣，并使教会的圣德在信友生活中愈加丰饶。<sup>3</sup>

**3.** 天主自身既是圣的（参伯前一16），为使众人在基督耶稣内合而为一，便将他们从黑暗的权势中救出，迁入祂爱子的国度（参若十一51-52），并以自己的圣德和圣神的德能使他们与祂结合，好为赞颂祂恩宠的光荣（参弗一6.12）。

*论基督奥迹中的圣德*

**4.** 主耶稣基督，天主之子，师傅与典范，偕父及圣神被称颂为"唯一的圣者"，<sup>4</sup>是一切圣德的泉源和诸德的根基。祂既是圣德的创始者和完成者，便向每一位门徒宣讲了生活的圣德："你们应当是成全的，如同你们的天父是成全的一样"（玛五48）。<sup>5</sup>在父的奥迹，也就是基督本身内，圣神在洗礼中坚固信友，并推动他们走向既定的战斗，好在诸圣的共融中获得永不凋谢的光荣冠冕（参弟后四7-8；格前九25；默二10）。<sup>6</sup>信友们在基督耶稣内，遵循祂的告诫："谁若愿意跟随我，该弃绝自己，背着自己的十字架来跟随我"（玛十六24；参谷八34；若十二26），努力效法救主，以便在信、望、爱三德的支撑下，借着已在基督内生活的弟兄们，找到完成救恩奥迹的途径，受他们卓越榜样的激励，并永远托付于他们虔诚的代祷之中。<sup>7</sup>

*论教会生活中的圣德*

**5.** 天主圣父以诸圣人奇妙的宣信，不断以新的活力使祂的教会丰产，并向信友提供祂眷爱最确切的凭证。<sup>8</sup>

基督也爱教会如同自己的净配，为她舍弃了自己，使她圣化（参弗五25-26），又将她与自己结合为一体，以圣德之恩充满了她，为光荣天主。<sup>9</sup>

圣神赋予基督同一奥体以生命，使之从基督自身领受圣德，偕同基督彰显真理与生命之国、圣德与恩宠之国、正义、仁爱与和平之国；<sup>10</sup>在基督内，所有信友脱离败坏的奴役，进入天主子女光荣的自由（参罗八21）。

**6.** 因此，教会既是圣的，同时又需要不断净化；<sup>11</sup>然而众人都在基督内蒙召进入教会，因着全能天主的恩宠，在其中享有诸圣的交往，直至他们在基督内光荣的共融于末世圆满完成。教会本身，圣人之母，时刻殷切关怀，使信友培育成圣的圣召并达至圣德。尤其在当今新福传的形势下，极为重要的是将整个牧灵道路置于圣德之上，而这种圣德不应被理解为仅属少数人的非凡之路，而应成为全体信友走向基督徒生活之圆满和爱德之完善的意向。<sup>12</sup>

> **第一章脚注**
> <sup>1</sup> 参见梵二《教会宪章》(*Lumen gentium*), 40。
> <sup>2</sup> 参见《罗马弥撒经书》，感恩经荣颂词。
> <sup>3</sup> 参见梵二《教会宪章》(*Lumen gentium*), 47。
> <sup>4</sup> 参见《罗马弥撒经书》，《光荣颂》。
> <sup>5</sup> 参见梵二《教会宪章》(*Lumen gentium*), 40; 奥利振,《罗马书注释》7, 7 (PG 14, 1122B); 伪玛加略,《论祈祷》11 (PG 34, 861AB); 圣多玛斯·阿奎那,《神学大全》II-II, 9, 184, a. 3。
> <sup>6</sup> 参见《罗马弥撒经书》，圣人颂谢词一。
> <sup>7</sup> 参见《罗马弥撒经书》，圣人颂谢词二。
> <sup>8</sup> 同上。
> <sup>9</sup> 参见梵二《教会宪章》(*Lumen gentium*), 39。
> <sup>10</sup> 参见《罗马弥撒经书》，基督普世君王颂谢词。
> <sup>11</sup> 参见《罗马弥撒经书》，弥撒常典：信经; 梵二《教会宪章》(*Lumen gentium*), 8。
> <sup>12</sup> 参见若望·保禄二世，宗座牧函《新千年的开始》(*Novo Millennio ineunte*), 2001年1月6日, 30: AAS 93 (2001) p. 267。

### 二、论圣人的纪念或敬礼

*论圣人生活中对基督生活的纪念*

**7.** 至仁慈的天父，藉祂钟爱的那位既是人类的创造者、也是最慈善的革新者的儿子，在圣神的助佑下，以圣人的言行为每位信友提供榜样，以圣人的共融赐予交往，以圣人的代祷给予援助。<sup>13</sup> <sup>14</sup>

**8.** 教会在圣人身上宣认至圣圣三的奇妙作为：他们在世上展现救主活生生的临在和教会真正的本质，向世人揭示天主圣德的肖像：圣人的事迹正是由此涌流而出的，这些事迹同时也是基督奇妙化工的彰显。<sup>15</sup>

**9.** 教会生活中一切圣人的礼仪纪念，就其本质而言，都指向基督并终结于基督，祂是"众圣之冕"；<sup>16</sup>并借着基督，在圣神的陪伴下，归向天父，那诸圣中的奇妙者，并在他们身上受到光荣（参得后一10）。

**10.** 圣人的生活，在时间的流逝中，宛如基督生活的延续和纪念，在今世放射光芒，显示复活的光荣；他们在天上的光荣中，如同星星各有不同的光辉（参格前十五40-41），被提示给信友们："一切都会过去，圣人的光荣在基督内永存；祂更新万物，而祂自身永恒不变。"<sup>19</sup>

**11.** 因此，对圣人的礼仪纪念的建立，不仅是为了将他们的榜样提供给信友效法，更是为了在圣神内加强整个教会的合一（参弗四1-6）。正如旅途中信友之间的基督徒交往使我们更接近基督，同样，与圣人的交往也使我们与基督结合，因为一切恩宠和天主子民的生命都从祂如同从泉源和首领中涌流而出。<sup>20</sup>

**12.** 正因如此，圣人从此世过渡到永恒交往的日子，以基督的生活，即祂的逾越奥迹，为依托，这一天理所当然地被称为他们的"诞辰"（dies natalis），按惯例在神圣礼仪中予以纪念。

*论圣人的敬礼*

**13.** 旅途中的教会自初期就庆祝基督的宗徒和殉道者，他们以自身的流血，效法在十字架上受苦的救主，在复活的希望中给出了信仰和爱德的最高见证（参默二十二14）。<sup>21</sup>

**14.** 此后，圣人便按照教会真正的传统受到敬礼。教会以特殊的孝爱，将终身童贞、天主之母荣福玛利亚推荐给信友的敬礼，因为基督立了她为众人之母；同时也推动对其他圣人的真实而正当的敬礼。<sup>22</sup>

**15.** 只有经教会权威列入圣人或真福品的天主之仆，方可受到公开敬礼。<sup>23</sup>他们经过鉴定的圣髑和圣像均应受到尊敬，<sup>24</sup>因为教会中对圣人的敬礼宣扬的是基督在其仆人身上的奇妙化工，并向信友提供可资效法的榜样。<sup>25</sup>

**16.** 关于总领天使圣弥额尔、圣加俾额尔及圣辣法厄尔，护守天使以及无数侍立在全能天主面前、日夜服务祂、不断瞻仰天主光荣之圣容的天使（他们的名字唯有天主知晓），对他们只应给予礼仪书籍或教会真正传统所认可的敬礼。

*论在礼仪中实践的诸圣相通*

**17.** 在神圣礼仪中，整个教会以同心同德的欢欣共同赞颂天主的威严。<sup>27</sup>因为凡属于基督并拥有祂圣神的人，都在同一教会内汇聚并彼此联结（参弗四16）。

**18.** 由此可知，天上诸圣与基督结合更为亲密，更坚固地巩固整个教会的圣德，使教会在世上对天主的敬礼更加高贵，并以多种方式促进教会更大的建设。<sup>28</sup>效法他们的信友，在追随基督足迹奔赴天父的旅途中，时刻努力互相帮助。他们瞻仰圣人在基督内的生活，也寻求光明以探究天主的奥迹。因为在圣人的生活中（他们虽与我们同具人性，却更完美地转化为基督的肖像，参格后三18），天主向世人生动地显示了祂的面容和临在。在他们身上，天主亲自向我们说话，给予我们祂国度的标记。特别是在那些蒙受圣神特殊恩赐的圣人身上，不仅生活的卓越，而且学说的超群也大放异彩。但这不应仅从神学学问的角度来理解，也应从那种"爱的知识"来理解，那是由圣神的光照而来，通过体验天主的奥迹而获得的。<sup>30</sup>

**19.** 借着圣人在基督（永恒的至高司祭，参希三1；四14；五10；七26；九11；天主与人之间的唯一中保，参弟前二5）内的代祷，教会的共融在举行礼仪时日益增长。这一点尤其体现在感恩祭的庆典中：在举行感恩祭时，以感谢的特殊方式，整个教会与天上诸圣相通，纪念并敬礼所有圣人；<sup>31</sup>也体现在时辰颂祷的庆典中，在其中借着圣人对至圣圣三的赞颂永不止息。

> **第二章脚注**
> <sup>13</sup> 参见《罗马弥撒经书》，通用颂谢词三。
> <sup>14</sup> 参见《罗马弥撒经书》，圣人颂谢词一。
> <sup>15</sup> 参见梵二《礼仪宪章》(*Sacrosanctum Concilium*), 111。
> <sup>16</sup> 参见《时辰颂祷》，诸圣节祷词。
> <sup>17</sup> 参见梵二《教会宪章》(*Lumen gentium*), 50。
> <sup>18</sup> 参见若望·保禄二世，宗座牧函《主的日子》(*Dies Domini*), 1998年5月31日, 78: AAS 90 (1998) p. 761。
> <sup>19</sup> 参见圣保利诺·诺拉,《诗歌集》XIV, 3-4: CSEL 30, 67。
> <sup>20</sup> 参见庇护十二世，通谕《天主中保》(*Mediator Dei*): AAS 39 (1947) pp. 581-582。
> <sup>21</sup> 参见梵二《教会宪章》(*Lumen gentium*), 50。
> <sup>22</sup> 参见梵二《礼仪宪章》(*Sacrosanctum Concilium*), 111。
> <sup>23</sup> 参见《天主教法典》, can. 1186。
> <sup>24</sup> 同上, can. 1187。
> <sup>25</sup> 参见梵二《礼仪宪章》(*Sacrosanctum Concilium*), 111; 另参见《天主教法典》, cann. 1188-1190。
> <sup>26</sup> 参见《罗马弥撒经书》，感恩经第四式颂谢词。
> <sup>27</sup> 参见《罗马弥撒经书》，各式颂谢词。
> <sup>28</sup> 参见格前十二12-27; 梵二《教会宪章》(*Lumen gentium*), 49。
> <sup>29</sup> 参见梵二《教会宪章》(*Lumen gentium*), 50。
> <sup>30</sup> 参见若望·保禄二世，宗座牧函《神圣爱情的知识》(*Divini amoris scientia*), 7: AAS 90 (1998) p. 936; 又参见梵二《天主启示宪章》(*Dei Verbum*), 8。
> <sup>31</sup> 参见《罗马弥撒经书》，感恩经第一式（罗马正典），联合祈祷（*Communicantes*）。

### 三、论罗马殉道圣人录

*论殉道圣人录的特性及礼仪性质*

**20.** 历代以来，在用于礼仪庆典、为至圣圣三奉献应有敬礼的书籍中，殉道圣人录也被算作其一，其礼仪性质日渐明显。

**21.** 最古老的礼仪日历与殉道圣人录之间的关系，随着对两者之间相互联系及天主奥迹庆典之实用说明的逐步增加，不断发展至今日的形态，其主要目的和用途的礼仪性质已显而易见。

*论殉道圣人录的革新*

**22.** 历代以来，殉道圣人录经过多次修订。近年来，依梵蒂冈第二届大公会议之法令所进行的审订，以及其他礼仪书籍之革新的同时颁布，要求殉道圣人录在经过应有的历史考证之后，与罗马礼之其他书籍重新妥善配合。

**23.** 殉道圣人录中圣人及真福的名录，涉及上述第15条所指的圣人和真福，按照古老而通行的传统，从一月排列至十二月，与公历年的进程一致，尽管也绝不忽视礼仪年的进程。

*论殉道圣人录与其他礼仪书之关系*

**24.** 礼仪庆典作为教会对净配耶稣基督之爱的表达与实现，随着年度的推进展开并追念基督的全部奥迹，也涵盖了对圣人的敬礼。圣人们藉天主多种恩宠，已臻于完善并获得永恒的救恩，在天上向天主献上完美的赞颂，并为信友们乃至全人类代祷。因此，基督的奥迹与圣人的敬礼如此紧密地交融，以至于在教会礼仪中，殉道圣人录与其他用于庆祝基督奥迹的礼仪书之间存在密切的关联，而圣人也在这些庆典中被纪念。

**25.** 为此，教会为使圣人的庆祝不至于凌驾于追念救恩奥迹本身的庆典之上，在提供圣人及真福名录的同时，也颁布礼仪规范，据此在规定的日子纪念他们。<sup>32</sup>

**26.** 因为众所周知，除圣人的节日或庆日以及必行纪念之外，在允许举行自由纪念的常日中，有正当理由时，亦可以同等品级举行该日在本《罗马殉道圣人录》或经批准之专用殉道圣人录（即《罗马殉道圣人录》的专用附录）中所载之任何圣人的日课和弥撒。

> **第三章脚注**
> <sup>32</sup> 参见梵二《礼仪宪章》(*Sacrosanctum Concilium*), 111。

### 四、论殉道圣人录的使用

*论殉道圣人录中圣人及真福的名录*

**27.** 《罗马殉道圣人录》既应被视为礼仪书，其目的既非提供所有圣人及真福的穷尽名录，亦非为他们撰写冗长的赞辞（从中可以引申出灵修著作或教会历史，即教会作为圣人的家庭和因天主的拣选而成圣之民族的历史；参伯前二9；得前五9-10；得后二13）。

**28.** 殉道圣人录所载的纪念名录，首先是荣福童贞玛利亚天主之母的纪念，其次是天使，然后是在当今普世教会或个别教会及任何修会团体敬礼中的信友的纪念，而非所有享见天主荣福之人的完整目录。<sup>34</sup>

**29.** 因此，《罗马殉道圣人录》收录列入罗马历的圣人（因其在整个罗马礼教会中具有普世意义），以及众多（但非全部）受托于各个别教会或修会团体并以任何礼仪等级予以纪念的圣人。古代圣人及自中世纪至今的所有真福的这种个别或地方性纪念的状态，以编号旁的星号（\\*）标示，该编号指示当日圣人及真福的时间先后顺序。

*论圣人或真福的庆祝*

**30.** 如上述第26条所述，在允许举行自由纪念的常日中，有正当理由时，可在本《罗马殉道圣人录》或经批准的专用殉道圣人录中当日所载之任何圣人名下的日子，举行该圣人的弥撒乃至日课。

**31.** 在殉道圣人录或经批准的专用殉道圣人录中所载之真福的庆祝，保留给已获宗座授权的教区、国家或更大区域，或修会团体。<sup>36</sup>

**32.** 每个教区或修会团体均应有自己的专用日历；<sup>37</sup>各主教团则应编纂各自国家的专用日历，或与其他主教团联合编纂更大区域的日历；所有日历均须与《罗马殉道圣人录》妥善配合，并呈报宗座批准或确认。

**33.** 若殉道圣人录中所载之某位圣人或真福的庆日每年被更高等级的庆典所阻，该圣人或真福可在专用日历中于最近的空闲日或以其他合理方式确定的本属日期予以纪念（例如圣髑发现日、迁移日，甚至封圣或列真福品之日，但后者按惯例通常不宜采用）。若遇此情况，在诵读殉道圣人录时，可使用下文（第30页第12条）所列的程式之一，置于原位。<sup>38</sup>

**34.** 《罗马殉道圣人录》中所载之任何圣人均可被选为堂区主保。若涉及真福，则须向宗座申请特恩，除非该真福已正式列入教区或国家日历。

*论殉道圣人录的诵读*

**35.** 某日圣人之赞辞，常于前一日诵读。

**36.** 殉道圣人录宜在歌咏团中诵读，但亦可在歌咏团外举行。

**37.** 诵读殉道圣人录时，应遵守下文所列之程序。

> **第四章脚注**
> <sup>33</sup> 参见《罗马弥撒经书总论》, 316;《时辰颂祷总论》, 244, 234-239; 礼仪圣部训令《个别日历》(*Calendaria particularia*), 8-10: AAS 62 (1970) pp. 653-654。
> <sup>34</sup> 参见《罗马弥撒经书总论》, 316。
> <sup>35</sup> 参见《罗马弥撒经书总论》, 316;《时辰颂祷总论》, 244。
> <sup>36</sup> 参见礼仪圣部训令《个别日历》(*Calendaria particularia*), 8-9: AAS 62 (1970) pp. 653-654。
> <sup>37</sup> 参见《通用年历规则》(*Normae Universales de Anno liturgico et de Calendario*), 48-55; 礼仪圣部训令《个别日历》(*Calendaria particularia*), 1970年6月24日, 1-9, 12: AAS 62 (1970), pp. 651-654。
> <sup>38</sup> 参见礼仪圣部训令《个别日历》(*Calendaria particularia*), 21: AAS 62 (1970) p. 656。
> <sup>39</sup> 参见礼仪圣部训令《个别日历》(*Calendaria particularia*), 34: AAS 62 (1970) p. 659;《罗马主教礼典》,《祝圣教堂及祭台礼典》, 标准版, 1977, 第二章, 4。
> <sup>40</sup> 参见礼仪及圣事部通告，关于为某位真福祝圣或祝福教堂事宜，1998年11月29日: *Notitiae* 34 (1998) p. 664。

### 五、论各地专用殉道圣人录

**38.** 各教区、国家或修会团体均可编纂专用殉道圣人录或殉道圣人录附录，其中收录列入专用日历而《罗马殉道圣人录》未载者，或在不同日期庆祝者，或以不同庆祝等级举行者，或认为应适当扩充其赞辞者。此专用殉道圣人录须呈报礼仪及圣事部审核、批准或确认。

**39.** 扩充的赞辞不应仅仅按照文学体裁的"行传"或"传说"来撰写，而应尽可能彰显基督在其仆人身上的逾越胜利，并向信友展示每位圣人独特的恩宠。此外，应始终严守历史的可信性，不得掺入讲道式或"灵修教化"式的内容。赞辞不宜超过约四十个词。<sup>41</sup> <sup>42</sup>

> **第五章脚注**
> <sup>41</sup> 参见梵二《礼仪宪章》(*Sacrosanctum Concilium*), 92。
> <sup>42</sup> 同上, 111。

### 六、论主教团权限内的适应

**40.** 各主教团有责任编纂《罗马殉道圣人录》的地方语言译本，忠实完整地保持原文，并注意文学体裁的特色。

**41.** 在出版殉道圣人录时，每日的赞辞中凡属经宗座授权的全国或全区域专用部分，宜排列在通用罗马历之庆典赞辞之后、以相同字体印刷。至于属于地区或教区专用的赞辞，应始终置于专用附录中。各主教团所出各版之文本，均须依法呈报宗座批准和审核。以上原则比照适用于各修会团体。

**42.** 在筹备各版本时，应明确区分《罗马殉道圣人录》的完整译本与从殉道圣人录中摘录的、供牧灵使用的部分选集，后者不应用于礼仪。

---

## 月龄宣报（任选举行）

虽然太阳历在世界各地已广为人知并普遍使用，但仍认为宜保留按太阴历宣报日期的习惯；这种宣报可在殉道圣人录的礼仪诵读中自由选择举行。

月龄推算的重要性在于：复活节这一最大瞻礼，连同其前的四旬期及其后的复活期，取决于四月的满月。因此，在本标准版殉道圣人录中保留了月龄推算，以使旧约与新约子民之间的特殊联系在庆祝逾越奥迹时也得以彰显。此外，月龄推算也为东方诸教会以及世界各地众多非基督宗教和文化所保持。

在本殉道圣人录中，每日圣人纪事上方排列有三十个字母，其数目与历法学家所编制的太阴闰余周期中的数字相等。经适当推算后，这些字母指示全年每日应宣报的月龄。每个字母又对应其下方排列成三十或二十九个记号的序列中的相应数字，该数字标示太阴月的日数。这种用于查找月龄的字母与数字序列的使用，由相应的临时对照表所规范。在对照表中，每年对应一个专属的**金数**（*numerus aureus*），指示该年在月龄推算所采用的十九年太阴周期中的位置；还有**闰余**（*epacta*），即太阴年结束与太阳年开始之间的十一天之差；最后是**殉道圣人录字母**（*littera Martyrologii*），与上述闰余紧密相连，如下表所示：

\`\`\`
a    b    c    d    e    f    g    h    i    k    l    m    n    p    q
I    II   III  IV   V    VI   VII  VIII IX   X    XI   XII  XIII XIV  XV

r    s    t    u    A    B    C    D    E    F/F  G    H    M    N    P
XVI  XVII XVIII XIX XX   XXI  XXII XXIII XXIV XXV  XXV  XXVI XXVII XXVIII XXIX *
\`\`\`

上述月龄推算所需的全部要素，就2004年至2033年这一时段而言，均可在下方的临时对照表中查到。<sup>43</sup>宣报时，应于每年各月朔望月之各日查明金数，找到闰余及与之对应的殉道圣人录字母，然后在殉道圣人录中找到该字母在各日圣人纪事上方的对应数字，即为应宣报的月龄。

**举例**：2005年，金数为11，对应闰余 XIX 及殉道圣人录字母“u”。该年全年每日均应查找殉道圣人录中字母“u”所对应的数字。查阅均分表后可知：一月朔日（*primæ seu kalendis ianuarii*）字母“u”对应数字20，即为应宣报的月龄；二月第二日（*diei secundæ seu quarto nonas augusti*）对应数字26。

凡金数为1的年份，自一月朔日起至该年朔望月末日止，应宣报的月龄始终比殉道圣人录中字母“u”下方所标数字少一天。**举例**：2204年，金数为1，对应闰余 XXVIII 及殉道圣人录字母“M”。该年全年每日均应查找字母“M”所对应的数字。查阅一月朔日均分表后，字母“M”对应数字29，但实际上应宣报的月龄为28；以此类推，直至一月第二日（*diem secundam seu quartum nonas ianuarii*），太阴月的29实际上应宣报为月龄29（即以30为标准，但须注意该数字应理解为29），而此后规律恢复正常，字母下方数字即为应宣报的月龄，即1。对此规则的例外是：凡金数为1且殉道圣人录字母为大写“P”的年份，其下方始终应宣报的月龄即为字母所指示的数字，与其他年份相同。

若某年闰余恰好落在第二十五位，即对应双字母“F”（大写，以红色区别标注），则该年朔望月的计算日即为其前十一日或十二日（含当日）内金数较大者所对应的日期，即为月龄9。**举例**：2011年，金数为17，对应闰余 XXV，亦即殉道圣人录字母“F”。四月第三日及其后各日中，字母“F”下方的数字依次标示为：闰余 XXV 之下，月龄从11起往上递增（含当日），应宣报为月龄9。

临时对照表的有效期至2199年。此后可另行编制附有闰余周期变动推算用的延续表，以金数<sup>44</sup>、闰余<sup>45</sup>和每年对应的殉道圣人录字母排列。新编各表与上述样本表相似，仅在闰余周期变动时段内有效。

**举例**：2200年，金数为16，可据此编制样本表，其有效期至2299年。该表收录了在此时段内查找每日应宣报月龄所需的全部要素。

**殉道圣人录字母与闰余、金数对照表（2200年至2299年）**

| 金数 | 16 | 17 | 18 | 19 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|---|---|---|
| 闰余 | XIII | XIV | V | XVI | XXVIII | IX | XX | I | XII |
| 字母 | n | E | e | r | M | i | A | a | m |

| 金数 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|
| 闰余 | XXIII | IV | XV | XXVI | VII | XVIII | XXIX | X | XXI | II |
| 字母 | D | d | q | G | g | t | N | k | B | b |

2248年为例：金数为7，对应闰余 IV 及殉道圣人录字母小写“d”。据上文所述规则，即为该年每日朔望月应宣报之月龄的查找依据。

**殉道圣人录字母与闰余、金数临时对照表（2004年至2033年）**

| 主历年 | 金数 | 闰余 | 字母 | 主历年 | 金数 | 闰余 | 字母 |
|---|---|---|---|---|---|---|---|
| 2004 | 10 | VIII | **h** | 2019 | 6 | XXIV | **E** |
| 2005 | 11 | XIX | **u** | 2020 | 7 | V | **e** |
| 2006 | 12 | * | **P** | 2021 | 8 | XVI | **r** |
| 2007 | 13 | XI | **l** | 2022 | 9 | XXVII | **H** |
| 2008 | 14 | XXII | **C** | 2023 | 10 | VIII | **h** |
| 2009 | 15 | III | **c** | 2024 | 11 | XIX | **u** |
| 2010 | 16 | XIV | **p** | 2025 | 12 | * | **P** |
| 2011 | 17 | XXV | **F** | 2026 | 13 | XI | **l** |
| 2012 | 18 | VI | **f** | 2027 | 14 | XXII | **C** |
| 2013 | 19 | XVII | **s** | 2028 | 15 | III | **c** |
| 2014 | 1 | XXIX | **N** | 2029 | 16 | XIV | **p** |
| 2015 | 2 | IX | **k** | 2030 | 17 | XXV | **F** |
| 2016 | 3 | XXI | **B** | 2031 | 18 | VI | **f** |
| 2017 | 4 | II | **b** | 2032 | 19 | XVII | **s** |
| 2018 | 5 | XIII | **n** | 2033 | 1 | X | **N** |

---

## 一、时辰颂祷礼仪内诵读殉道圣人录之程序

**1.** 在歌咏团中，诵读照例在晨祷之后、该时辰结束词之后举行。诵读者径直从次日的纪事开始。诵读以下列唱答词结束：

> 领：在上主台前何其珍贵的，
> 应：是祂圣徒们的死亡。

**2.** 其后可接续一篇下文所列之短读经（原版第41-60页），诵读者以下列欢呼词作结：

> 领：上主的圣言。
> 应：感谢天主。

**3.** 读经之后，主持庆典的司铎或执事诵念下文所列之祷词一篇（原版第63-68页）。若无圣秩人员在场，由主持庆典的平信徒同样行之。

**4.** 然后行降福及遣散礼，程式如下：

> 愿全能的天主降福我们，
> 保护我们免于灾祸，
> 引领我们到达永生。
>
> 凡诸信者灵魂，
> 赖天主仁慈，
> 息止安所。
> 应：阿们。
>
> 领：祝大家平安。
> 应：感谢天主。

**5.** 若在晨祷中举行不甚相宜，亦可在任何一端小时辰经中以同样方式诵读殉道圣人录，并无妨碍。

**6.** 在小时辰经中诵读时，于该时辰结束词之后立即进行，如上所述。末尾加唱答词"在上主台前何其珍贵"，继以欢呼词"请赞美上主"（*Benedicámus Dómino*）及惯常的应答，或如上第4条所列程式。

**7.** 诵读赞辞时，若有移动庆节，应先予宣报，使用下文所列之程式（原版第35-37页）。
但在主复活日，在诵读次日赞辞之前，应先置入复活主日的纪念。

**8.** 圣周星期四、主受难日（圣周星期五）及圣周六，殉道圣人录之诵读一律省略，当日圣人赞辞从缺。

**9.** 在圣诞前夕，宣报十二月二十五日之后，应以特别方式隆重咏唱圣诞宣报词（原版第71-74页）。

**10.** 在宣读殉道圣人录时，月龄之指示可在宣报日期之后任选加入，按上文原版第23-26页所述方式进行。

**11.** 以星号标注之圣人或真福的赞辞，仅在获准敬礼该圣人或真福的教区或修会团体中诵读。

**12.** 若某纪念日被移至另一天或改期举行，应在相应赞辞末尾加注移日或改期之说明：

> 移日用语：其纪念（今年）在我处将于某日举行……
> 改期用语：圣某某的庆日载于某日……

---

## 二、时辰颂祷礼仪外诵读殉道圣人录之程序

**13.** 会众聚集于歌咏席、议事厅或餐桌旁，诵读者径直从次日的纪事开始，逐一宣报各圣人及真福之赞辞，以下列唱答词作结：

> 领：在上主台前何其珍贵的，
> 应：是祂圣徒们的死亡。

**14.** 其后可接续一篇下文所列之短读经（原版第41-60页），诵读者以下列欢呼词作结：

> 领：上主的圣言。
> 应：感谢天主。

**15.** 读经之后，主持庆典的司铎或执事诵念下文所列之祷词一篇（原版第63-68页）。若无圣秩人员在场，由主持庆典的平信徒同样行之。

**16.** 祷词之后，以降福及遣散礼结束，程式如下：

> 愿全能的天主降福我们，
> 保护我们免于灾祸，
> 引领我们到达永生。
>
> 凡诸信者灵魂，
> 赖天主仁慈，
> 息止安所。
> 应：阿们。
>
> 领：祝大家平安。
> 应：感谢天主。

**17.** 关于赞辞连同附加内容之诵读方式，适用上述第4-9条之规定。

---

## 移动庆节赞辞

移动庆节因其本质每年日期变化，无法载入各月各日的固定序列。故将其集中于此，以便在当年应庆祝之日，于宣报日期和月份之后，即刻置于该日殉道圣人录赞辞之前。

**1.** *将临期第一主日*

吾主耶稣基督将临期第一主日。此时追念天主圣子首次降临人间，同时期待祂在末世的第二次来临。

**2.** *圣诞节八日庆期内之主日（如无此主日，则为十二月二十九日）*

耶稣、玛利亚及若瑟圣家节。由圣家向基督徒家庭提出至圣的榜样，并祈求适时的助佑。

**3.** *一月六日后之主日*

吾主耶稣基督受洗节。天主的爱子在此奇妙地被宣示，水得以圣化，人得以洁净，普世欢腾。

**4.** *圣灰星期三*

圣灰日，至圣四旬期之开端：看，补赎罪过、拯救灵魂的忏悔日子来了；看，这是登上逾越圣山的悦纳时期。

**5.** *四旬期第一主日*

四旬期第一主日。以吾主耶稣基督为榜样，每年守斋的可敬圣事由此展开。

**6.** *主受难圣枝主日*

主受难圣枝主日。吾主耶稣基督应验匝加利亚先知的预言，骑驴驹进入耶路撒冷，群众手持棕榈枝迎接祂。

**7.** *圣周星期四、主受难日（圣周星期五）及圣周六*

殉道圣人录之诵读从略。

**8.** *复活主日*

这是上主所造的日子，节日中的节日，我们的逾越：吾主耶稣基督救世主肉身的复活。

*然后宣报次日的日期和月份，并诵读次日的赞辞。*

**9.** *耶稣升天节*<sup>46</sup>

吾主耶稣基督升天节。复活后第四十日，在门徒面前被举升天，坐于圣父右边，直到祂光荣地来审判生者死者。

<sup>46</sup> 凡耶稣升天节非当守瞻礼之处，指定于复活期第七主日作为本日庆祝。

**10.** *圣神降临节*

圣神降临节。逾越节五十天的神圣时期至此结束。同时纪念圣神在耶路撒冷倾注于门徒们身上，以及教会的肇始和向各部落、各语言、各民族、各邦国传布的宗徒使命之开端。

**11.** *圣神降临后主日*

圣三主日。我们宣认并敬礼三位一体的唯一天主，一体中的三位。

**12.** *圣三主日后星期四或主日*<sup>47</sup>

至圣基督圣体圣血节。基督以此神圣食粮赐予不死之良药和复活之保证。

<sup>47</sup> 凡基督圣体圣血节非当守瞻礼之处，指定于圣三主日后主日作为本日庆祝。

**13.** *圣神降临后第二主日后星期五*

耶稣至圣圣心节。祂良善心谦，在十字架上被举扬，成为生命和爱的泉源，万民从中汲取。

**14.** *耶稣至圣圣心节后星期六*

荣福童贞玛利亚无玷圣心纪念。圣母在心中保存了天主在其圣子身上成就的救恩奥迹的记忆，热切期待这些奥迹在基督内的圆满实现。

**15.** *常年期最末主日：吾主耶稣基督普世君王节*

吾主耶稣基督普世君王节。唯有祂享有权柄、光荣和威严，至于无穷之世。

---

## 短读经

### 一、常年专用部分

**1.** *将临期* （依三三2-3, 5-6）

上主啊！怜恤我们罢！我们仰望你，每日清晨，请作我们的臂膊！在窘迫时，请作我们的救援！叫嚣的声音一响，民众遂即逃遁；你一奋起，万民便都溃散。上主是崇高的，因为他居于高处；他以正义和公平充盈了熙雍。他是你命运的保障，得救的府库、智慧和明智；敬畏上主，将是你的宝藏。

> 上主的圣言。
> 感谢天主。

**2.** *圣诞节* （罗一1-3, 5-6）

基督耶稣的仆人保禄，蒙召作宗徒，被选拔为传天主的福音。这福音是天主先前借自己的先知在圣经上所预许的，是论及他的儿子，我们的主耶稣基督，他按肉身是生于达味的后裔。借着他，我们领受了宗徒职务的恩宠，为使万民服从信德，以光荣他的圣名，其中也有你们这些蒙召属于耶稣基督的人。

> 上主的圣言。
> 感谢天主。

**3.** *圣诞节及八日庆期内* （希一8-12）

天主！你的御座，永远常存；你治国的权杖，是公正的权杖。你爱护正义，憎恨不法；为此天主，你的天主，用欢愉的油傅了你，胜过你的伴侣。又说：“上主！你在起初奠定了大地，上天是你手的功绩；诸天必要毁灭，而你永远存在；万物必要如同衣裳一样破坏。你将它们卷起好似外套，它们必如衣服，都要变换更新；但是你却永存不变，你的寿命无尽无限。”

> 上主的圣言。
> 感谢天主。

十二月二十六日：

**4.** *圣斯德望首先殉道庆日* （宗七55-56, 59-60）

斯德望却充满了圣神，注目向天，看见天主的光荣，并看见耶稣站在天主右边，遂说道：“看，我见天开了，并见人子站在天主右边。”当他们用石头砸斯德望的时候，他祈求说：“主耶稣！接我的灵魂去罢！”遂屈膝跪下，大声呼喊说：“主，不要向他们算这罪债！”说了这话，就死了。

> 上主的圣言。
> 感谢天主。

十二月二十七日：

**5.** *圣若望宗徒兼圣史庆日* （德十五1-5）

敬畏上主的，必如此而行；谨守法律的，必获得智慧。智慧有如一位荣耀的母亲去迎接他，又如一位童贞的新娘收留他，要用生命和明智的食物养育他，用有益的智慧之水，给他当饮料。他依靠智慧，便不致动摇；他信赖智慧，就不致受辱。智慧要举扬他，超越他的同伴；在集会中，使他开口发言，使他充满上智聪敏之神，叫他穿上光荣的长袍。

> 上主的圣言。
> 感谢天主。

十二月二十八日：

**6.** *诸圣婴孩殉道庆日* （默十四4-5; 二十二14）

这些人没有与女人有过沾染，仍是童身；羔羊无论到那里去，他们常随着羔羊。这些人是从人类中赎回来，献给天主和羔羊当作初熟之果的；他们口中没有出过谎言，他们身上也没有瑕疵。那些洗净自己衣服的，是有福的！他们有吃生命树果的权利，并得由门进入圣城。

> 上主的圣言。
> 感谢天主。

圣诞节八日庆期内主日：

**7.** *耶稣、玛利亚及若瑟圣家节* （斐二5-8）

你们该怀有基督耶稣所怀有的心情：他虽具有天主的形体，并没有以自己与天主同等，为应当把持不舍的，却使自己空虚，取了奴仆的形体，与人相似，形状也一见如人；他贬抑自己，听命至死，且死在十字架上。

> 上主的圣言。
> 感谢天主。

**8.** *主显节前夕* （迦四4-7）

时期一满，天主就派遣了自己的儿子来，生于女人，生于法律之下，为把在法律之下的人赎出来，使我们获得义子的地位。为证实你们确实是天主的子女，天主派遣了自己儿子的圣神，到我们心内喊说：“阿爸，父啊！”所以你已不再是奴隶，而是儿子了；如果是儿子，赖天主的恩宠，也成了承继人。

> 上主的圣言。
> 感谢天主。

**9.** *主显节* （依六十1, 3, 6）

耶路撒冷啊！起来炫耀罢！因为你的光明已经来到，上主的荣耀已经照耀在你身上。万民要奔赴你的光明，众王要投奔你升起的光辉。成群结队的骆驼，以及米德杨和厄法的独峰驼要遮蔽你，它们都是由舍巴满载黄金和乳香而来，宣扬上主的荣耀。

> 上主的圣言。
> 感谢天主。

**10.** *四旬期* （依五五6-7）

趁上主可找到的时候，你们应寻找他；趁他在近处的时候，你们应呼求他。罪人应离开自己的行径，恶人该抛弃自己的思念，来归附上主，好让上主怜悯他；来归附我们的天主，因为他是富于仁慈的。

> 上主的圣言。
> 感谢天主。

或：（巴五5-7）

耶路撒冷！请你起来，站在高处，向东远眺，看，你的子女奉圣者的命，由西方至东方集合，喜庆天主终于想起了他们。他们离你远去，由仇人押送步行；如今天主却将他们给你再领回来；他们体面光荣，被人抬回，好像皇子一样；因为天主已命令夷平一切的高山和永恒的丘陵，填平所有的山谷，使它们化为平地，好让以色列在天主的光荣下平安前行。

> 上主的圣言。
> 感谢天主。

**11.** *主受难圣枝主日及圣周星期一、二、三* （依五十5-7）

吾主上主开启了我的耳朵，我并没有违抗，也没有退避。我将我的背转给打击我的人，把我的腮转给扯我胡须的人；对于侮辱和唾污，我没有遮掩我的面。因为吾主上主协助我，因此我不以为羞耻；所以我板着脸，像一块燧石，因我知道我不会受耻辱。

> 上主的圣言。
> 感谢天主。

**12.** *圣周星期四、主受难日（圣周星期五）及圣周六*

殉道圣人录之诵读从略。

**13.** *复活主日及八日庆期内* （哥三1-4）

你们既然与基督一同复活了，就该追求天上的事，在那里有基督坐在天主的右边。你们该思念天上的事，不该思念地上的事，因为你们已经死了，你们的生命已与基督一同藏在天主内了；当基督，我们的生命显现时，那时，你们也要与他一同出现在光荣之中。

> 上主的圣言。
> 感谢天主。

**14.** *复活期至耶稣升天节前夕* （格前十五13-14, 16-17, 20）

假如死人复活是没有的事，基督也就没有复活；假如基督没有复活，那么，我们的宣讲便是空的，你们的信仰也是空的。因为如果死人不复活，基督也就没有复活；如果基督没有复活，你们的信仰便是假的，你们还是在罪恶中。但是，基督从死者中实在复活了，做了死者的初果。

> 上主的圣言。
> 感谢天主。

或：（宗十三30-33）

天主却使他从死者中复活起来，他多日显现给同他一起，从加里肋亚往耶路撒冷去的人；这些人就是现今在百姓前给他作证的人。我们现今也给你们报告喜讯：就是那向祖先所应许的恩许，天主已给我们作他们子孙的完成了，叫耶稣复活了，就如在第二篇《圣咏》上所记载的：“你是我的儿子，我今日生了你。”

> 上主的圣言。
> 感谢天主。

**15.** *耶稣升天节及其后至圣神降临节前夕* （宗一9-11）

耶稣说完这些话，就在他们观望中，被举上升，有块云彩接了他去，离开他们的眼界。他们向天注视着他上升的时候，忽有两个穿白衣的人站在他们前，向他们说：“加里肋亚人！你们为什么站着望天呢？这位离开你们，被接到天上去的耶稣，你们看见他怎样升了天，也要怎样降来。”

> 上主的圣言。
> 感谢天主。

**16.** *圣神降临节* （宗二2-4）

忽然，从天上来了一阵响声，好像暴风来，充满了他们所在的全座房屋。有些散开好像火的舌头，停留在他们每人头上，众人都充满了圣神，照圣神赐给他们的话，说起外方话来。

> 上主的圣言。
> 感谢天主。

**17.** *圣神降临后主日：圣三主日* （若一五5-8）

谁是得胜世界的呢？不是那信耶稣为天主子的人吗？这位就是经过水及血而来的耶稣基督，他不但以水，而且也是以水及血而来的；并且有圣神作证，因为圣神是真理。原来作证的有三个：就是圣神，水及血，而这三个是一致的。

> 上主的圣言。
> 感谢天主。

**18.** *圣三主日后星期四或主日：基督圣体圣血节* （格前十一26-27）

的确，直到主再来，你们每次吃这饼，喝这杯，你们就是宣告主的死亡。为此，无论谁，若不相称地吃主的饼，或喝主的杯，就是干犯主体和主血的罪人。

> 上主的圣言。
> 感谢天主。

**19.** *圣神降临后第二主日后星期五：耶稣至圣圣心节* （弗三14, 16-19）

因此，我在天父面前屈膝，求他依照他丰富的光荣，借着他的圣神，以大能坚固你们内在的人，并使基督因着你们的信德，住在你们心中，叫你们在爱德上根深蒂固，奠定基础，为使你们能够同众圣徒领悟基督的爱是怎样的广、阔、高、深，并知道基督的爱是远超人所能知的，为叫你们充满天主的一切富裕。

> 上主的圣言。
> 感谢天主。

**20.** *常年期最末主日：吾主耶稣基督普世君王节* （参哥一16-20）

因为天上和地上的一切，可见的与不可见的，或是上座者，或是宰制者，或是率领者，或是掌权者，都是在他内受造的：一切都是借着他，并且是为了他而造的。他在万有之先就有，万有都赖他而存在。他又是身体即教会的头：他是元始，是死者中的首生者，为使他在万有之上独占首位，因为天主乐意叫整个的圆满居住在他内，并借着他使万有，无论是地上的，是天上的，都与自己重归于好，因着他十字架的血缔造了和平。

> 上主的圣言。
> 感谢天主。

**21.** *常年期主日及平日* （得后二15-17; 三5）

所以，弟兄们，你们要站立稳定，要坚持你们或由我们的言论，或由我们的书信所学得的传授。愿我们的主耶稣基督，和那爱我们，并开恩将永远的安慰和美好的希望，赐与我们的父天主，鼓励你们的心，并在各种善工善言上，坚固你们。愿主指引你们的心去爱天主，并学习基督的坚忍。

> 上主的圣言。
> 感谢天主。

或：（罗十一16-18）

如果所献的初熟的麦面是圣的，全面团也成为圣的；如果树根是圣的，树枝也是圣的。假如有几条橄榄树枝被折下来，而你这枝野橄榄树枝被接上去，同沾橄榄树根的肥脂，就不可向旧树枝自夸。如果你想自夸，就该想不是你托着树根，而是树根托着你。

> 上主的圣言。
> 感谢天主。

或：（德四四2, 13-15）

上主在他们身上，作出许多光耀的事，自太古就对他们，显示了自己的伟大。他们的子女，因了他们，也是如此：子子孙孙，永世常存；他们的光荣，决不会泯灭；他们的遗体必被人安葬，名誉必留于永世；民众必称述他们的智慧，集会必传扬他们的美德。

> 上主的圣言。
> 感谢天主。

或：（雅五8-11）

你们也该忍耐，坚固你们的心，因为主的来临已接近了。弟兄们，不要彼此抱怨，免得你们受审判；看审判者已站在门前。弟兄们，应拿那些曾因上主的名，讲话的先知们，作为受苦和忍耐的模范。看，我们称那些先前坚忍的人，是有福的：约伯的坚忍，你们听见了；上主赐给他的结局，你们也看见了，因为上主是满怀怜悯和慈爱的。

> 上主的圣言。
> 感谢天主。

或：（得前二9-12）

弟兄们，你们应回忆我们的勤劳和辛苦：我们向你们宣讲天主的福音时，黑夜白日操作，免得加给你们任何人负担。你们自己和天主都可作证：我们对你们信友曾是怎样的圣善、正义和无可指摘。你们也同样知道：我们怎样对待了你们中每一个人，就像父亲对待自己的孩子一样：劝勉、鼓励、忠告你们，叫你们的行动相称于那召选你们进入他的国和光荣的天主。

> 上主的圣言。
> 感谢天主。

或：（智十八1-3）

至于你的圣徒，却有极大的光明。埃及人只听见他们的声音，却看不见他们的面容，遂宣称那没有遭受痛苦的为有福，对他们表示感激，因他们虽受虐待，却不图报复，求他们宽恕以往的敌对行为。正与黑暗相反，你赐给了圣徒火柱，在他们不熟识的路上作向导，在光荣的旅途中作不为害的太阳。

> 上主的圣言。
> 感谢天主。

或：（德三四14-20）

敬畏上主之人的精神必然常存，在上主回顾下，必蒙祝福。因为他们的希望指向拯救他们的主，天主的眼常注视爱慕他的人。敬畏上主的人，无所畏惧，无所恐怖，因为上主是他的希望。敬畏上主的人，他的灵魂是有福的。他所仰望的是谁？谁又是他的扶助？上主的眼常注视爱慕他的人，他是大能的保障，是强有力的后盾，是隔除热气的屏风，是遮盖正午太阳的凉棚。是失足时的护卫，是跌倒时的救援；他鼓舞精神，开明眼目，赐与健康、生命和幸福。

> 上主的圣言。
> 感谢天主。


### 二、圣人专用部分

一月三日：

**22.** *耶稣圣名* （哥三16-17）


要让基督的话充分地存在你们内，以各种智慧彼此教导规劝，以圣咏、诗词和属神的歌曲在你们心内，怀着感恩之情，歌颂天主。你们无论作什么，在言语上或在行为上，一切都该因主耶稣的名而作，借着他感谢天主圣父。


上主的圣言。
℟. 感谢天主。

一月二十五日：

**23.** *圣保禄宗徒归化* （宗九19-22）


扫禄就同达玛士革的门徒住了几天。他即刻在各会堂中宣讲耶稣，说他是天主子。凡听见的人都奇怪说：“这不是那在耶路撒冷迫害呼求这名字的人吗？他不是为此而来这里，要把他们捆绑起来，解送到大司祭前吗？”扫禄却更有力量，使住在达玛士革的犹太人惊惶失措，因为他证明耶稣就是默西亚。


上主的圣言。
℟. 感谢天主。

二月二日：

**24.** *献耶稣于圣殿* （出十三2, 13）


以色列子民中，无论是人是牲畜，凡是开胎首生的，都应祝圣于我，属于我。凡首生的驴，应用羊赎回；你若不赎回，应打断牠的颈项。你的子孙中，凡是长子，你应赎回。


上主的圣言。
℟. 感谢天主。

三月十九日：

**25.** *圣若瑟* （智十9-12）


智慧引导逃避长兄愤怒的义人，走上了正路；将天主的国指示给他，叫他明白神圣的事；在困苦之中使他顺利，令他的劝劳效果丰满。有人由于贪婪，窘迫他时，智慧又在旁协助，使他致富。智慧保护他脱离仇敌，使他安全，不受暗算；在他搏斗时，使他获胜，叫他明了虔敬的能力，高于一切。


上主的圣言。
℟. 感谢天主。

三月二十五日：

**26.** *天使报喜（预报救主降生）* （依十一1-3）


由叶瑟的树干将生出一个嫩枝，由它的根上将发出一个幼芽。上主的神，智慧和聪敏的神，超见和刚毅的神，明达和敬畏上主的神将住在他内。他将以敬畏上主为快慰。


上主的圣言。
℟. 感谢天主。

六月二十四日：

**27.** *圣若翰诞辰* （依四九7）


上主，以色列的救主和圣者，向那极受轻慢，为列国所憎恶，且作统治者奴役的人这样说：“列王必要见而起立，诸侯必要见而下拜：这是因为上主忠实可靠，以色列的圣者拣选了你的缘故。”


上主的圣言。
℟. 感谢天主。

六月二十九日：

**28.** *圣伯多禄及圣保禄宗徒* （宗十二5-7）


伯多禄就被看管在监狱中，而教会恳切为他向天主祈祷。及至黑落德将要提出他的时候，那一夜伯多禄被两道锁链缚着，睡在两个士兵中，门前还有卫兵把守监狱。忽然，主的一位天使显现，有一道光，照亮了房间，天使拍着伯多禄的肋膀，唤醒他说：“快快起来！”锁链遂从他手上落下来。


上主的圣言。
℟. 感谢天主。

八月六日：

**29.** *耶稣显圣容* （默二一10-11, 23）


天使就使我神魂超拔，把我带到一座又大又高的山上，将那从天上，由天主那里降下的圣城耶路撒冷，指给我看。这圣城具有天主的光荣；城的光辉，好似极贵重的宝石，像水晶那么明亮的苍玉。那城也不需要太阳和月亮光照，因为有天主的光荣照耀她；羔羊就是她的明灯。


上主的圣言。
℟. 感谢天主。

八月十五日：

**30.** *圣母升天* （友十五9-10）


众人一来到她那里，就一致称赞她说：“你是耶路撒冷的荣耀，你是以色列的大喜乐，你是我们民族的大光荣，你亲手完成了这一切；你为以色列做了奇迹异事，天主也因你而喜悦。愿你永远为全能的上主所祝福！”全体民众回答说：“但愿如此！”


上主的圣言。
℟. 感谢天主。

九月八日：

**31.** *圣母诞辰* （创十七16, 19）


我必要祝福她，使她也给你生个儿子。我要祝福她，使她成为一大民族，人民的君王要由她而生。天主说：“你的妻子撒辣确要给你生个儿子，你要给他起名叫依撒格；我要与他和他的后裔，订立我的约当作永久的约。”


上主的圣言。
℟. 感谢天主。

九月十四日：

**32.** *光荣十字圣架* （斐二8-11）


他贬抑自己，听命至死，且死在十字架上。为此，天主极其举扬他，赐给了他一个名字，超越其他所有的名字，致使上天、地上和地下的一切，一听到耶稣的名字，无不屈膝叩拜；一切唇舌无不明认耶稣基督是主，以光荣天主圣父。


上主的圣言。
℟. 感谢天主。

九月十五日：

**33.** *痛苦圣母* （哀二18; 三19-23）


处女，熙雍女郎！你应该从心里呼号上主；白天黑夜，让眼泪像江河般地涌流，不要歇息，也不要让你的眼睛休息。我回忆着我的困厄和痛苦，尽是茹苦含辛！我的心越回想，越觉沮丧。但是我必要追念这事，以求获得希望：上主的慈爱，永无止境；他的仁慈，无穷无尽。你的仁慈，朝朝常新；你的忠信，浩大无垠！


上主的圣言。
℟. 感谢天主。

九月二十九日：

**34.** *圣弥额尔、圣嘉俾厄尔、圣拉法厄尔总领天使* （默十二7-10）


以后，天上就发生了战争：弥额尔和他的天使一同与那龙交战，那龙也和牠的使者一起应战，但牠们敌不住，在天上遂再也没有牠们的地方了。于是那大龙被摔了下来，牠就是那远古的蛇，号称魔鬼或撒殚的。那欺骗了全世界的，被摔到地上，牠的使者也同牠一起被摔了下来。那时，我听见天上有大声音说：“如今我们的天主获得了胜利、权能和国度，也显示了他基督的权柄，因为那日夜在我们的天主前，控告我们弟兄的控告者，已被摔下去了。”


上主的圣言。
℟. 感谢天主。

十一月一日：

**35.** *诸圣节* （默七12, 14-15）


“阿们。愿赞颂、光荣、智慧、称谢、尊威、权能和勇毅，全归于我们的天主，至于无穷之世。阿们。”这些人是由大灾难中来的，他们曾在羔羊的血中洗净了自己的衣裳，使衣裳雪白，因此，他们得站在天主的宝座前，且在他的殿宇内日夜事奉他；那坐在宝座上的，也必要住在他们中间。


上主的圣言。
℟. 感谢天主。

十二月八日：

**36.** *圣母始胎无原罪* （默十二1, 5-6）


那时，天上出现了一个大异兆：有一个女人，身披太阳，脚踏月亮，头戴十二颗星的荣冠。那女人生了一个男孩子，他就是那要以铁杖牧放万民的；那女人的孩子被提到天主和他的宝座前。女人就逃到旷野去了，在那里有天主已给她准备好的地方，叫她在那里受供养一千二百六十天。


上主的圣言。
℟. 感谢天主。



### 三、通用部分

**37.** *教堂奉献及其周年纪念* （默二一4-5）


他要拭去他们眼上的一切泪痕；以后再也没有死亡，再也没有悲伤，没有哀号，没有苦楚，因为先前的都已过去了。那位坐在宝座上的说："看，我已更新了一切。"又说："你写下来！因为这些话都是可信而真实的。"


上主的圣言。
℟. 感谢天主。

**38.** *荣福童贞玛利亚庆节通用* （友十三18-19）


我女！全世界妇女中，你分外应受至高者天主的祝福！创造天地的上主，领你割取我们的敌人统帅头颅的天主，应受赞美！在永远记得天主能力的人心中，不会忘记你的信心。


上主的圣言。
℟. 感谢天主。

**39.** *宗徒及圣史庆节通用（复活期外）* （罗十14, 17）


人若不信他，又怎能呼号他呢？若没有听到他，又怎能信他呢？若没有宣讲者，又怎能听到呢？所以信德是出于报道，报道是出于基督的命令。


上主的圣言。
℟. 感谢天主。

**40.** *宗徒及圣史庆节通用（复活期内）* （宗五41-42）


他们喜喜欢欢地由公议会前出来，因为他们配为这名字受侮辱。他们每天不断在圣殿内，或挨户施教，宣讲基督耶稣的福音。


上主的圣言。
℟. 感谢天主。

**41.** *多位殉道通用（复活期外）* （智三7-9）


他们蒙眷顾时，必要闪烁发光，有如禾楷间往来飞驰的火花。他们要审判万国，统治万民，上主要永远作他们的君王。倚恃上主的人，必明白真理；忠信于上主之爱的人，必与他同住，因为恩泽与仁慈，原归于他所选拔的人。


上主的圣言。
℟. 感谢天主。

**42.** *多位贞女殉道通用（复活期外）* （格后四17-18）


因为我们这现时轻微的苦难，正分外无比地给我们造就永远的光荣厚报，因为我们并不注目那看得见的，而只注目那看不见的；那看得见的，原是暂时的；那看不见的，才是永远的。


上主的圣言。
℟. 感谢天主。

**43.** *一位殉道通用（复活期外）* （德三九6-8）


他清早起来，即将自己的心，交给造他的上主，并在至高者的面前祈祷。他开口念经，为自己的罪求饶。若伟大的上主愿意，必使他充满智慧的精神：他就倾吐智言，有如落雨；在祈祷时，他必称谢上主。


上主的圣言。
℟. 感谢天主。

**44.** *一位圣妇殉道通用（复活期外）* （德五一8-9, 11-12）


我的灵魂已临近死亡，我的生命已接近地狱的边缘，但你却拯救了我。上主啊！当时我想起了你的仁慈，和你昔日的作为；上主啊！因为你救助期待你的人，救他们摆脱了仇敌的手。


上主的圣言。
℟. 感谢天主。

**45.** *一位贞女殉道通用（复活期外）* （德五一13-14）


我从地上高声恳求，求你救我脱免死亡；上主，你是我的父，我呼求了你；求你在我危难之日，不要离弃我；在骄傲人得势之时，不要使我孤立无援。


上主的圣言。
℟. 感谢天主。

**46.** *多位殉道通用（复活期内）* （格后四11, 13-14）


的确，我们这些活着的人，时常为耶稣的缘故被交于死亡，为使耶稣的生活也彰显在我们有死的肉身上。但我们既然具有经上所载的："我信了，所以我说"那同样的信心，我们也信，所以也说，因为我们知道那使主耶稣复活的，也要使我们与耶稣一起复活，并使我们与你们一同站在他前。


上主的圣言。
℟. 感谢天主。

**47.** *一位殉道通用（复活期内）* （罗八28-29）


而且我们也知道：天主使一切协助那些爱他的人，就是那些按他的旨意蒙召的人，获得益处，因为他所预选的人，也预定他们与自己的儿子的肖像相同，好使他在众多弟兄中作长子。


上主的圣言。
℟. 感谢天主。

**48.** *多位圣妇殉道通用（复活期内）* （希十二1-2）


所以，我们既有如此众多如云的证人，围绕着我们，就该卸下各种累赘和纠缠人的罪过，以坚忍的心，跑那摆在我们面前的赛程，双目常注视着信德的创始者和完成者耶稣：他为那摆在他面前的欢乐，轻视了凌辱，忍受了十字架，而今坐在天主宝座的右边。


上主的圣言。
℟. 感谢天主。

**49.** *一位圣妇殉道通用（复活期内）* （德五一8-9, 11-12）


我的灵魂已临近死亡，我的生命已接近地狱的边缘，但你却拯救了我。上主啊！当时我想起了你的仁慈，和你昔日的作为；上主啊！因为你救助期待你的人，救他们摆脱了仇敌的手。


上主的圣言。
℟. 感谢天主。

**50.** *多位牧者通用* （希十三17）


你们应该服从你们的领袖，顺从他们；因为他们为你们的灵魂时刻警醒，好像要代你们交账的人。你们应使他们喜欢地执行这任务，而不是叹息地去行，因为那样为你们并没有益处。


上主的圣言。
℟. 感谢天主。

**51.** *一位牧者通用* （德四五19-21）


上主命他向自己奉献祭品、焚香和悦纳的馨香，为获得纪念；并为自己的百姓，献赎罪的牺牲。赏他有颁发自己的诫命，和审核法规的权柄；将天主的证言教给雅各伯，藉法律光照以色列。


上主的圣言。
℟. 感谢天主。

**52.** *教会圣师通用* （德三九1-3）


明智人必考究历代古人的智慧，必专务先知的预言，必保留名人的言论，必领悟比喻的妙理，必考究箴言的真谛，必玩味喻言的微妙。


上主的圣言。
℟. 感谢天主。

**53.** *多位圣人通用* （德二11-13）


请你们追念前代，看看有谁依赖了上主，而受了耻辱？有谁保持了对他的敬畏，而被遗弃？有谁呼求了他，而被他轻视？因为，上主富于慈惠宽仁；在患难中，赦免罪过，并施救恩。他是一切真心寻求他的护卫者。


上主的圣言。
℟. 感谢天主。

**54.** *一位圣人通用* （德二18-20）


凡敬畏上主的，决不背弃他的言语；爱慕他的，必遵循他的道路。凡敬畏上主的，必寻求他的欢心；爱慕他的，必饱尝他法律的奥义。凡敬畏上主的，必常预备自己的心，在他面前谦卑自下。


上主的圣言。
℟. 感谢天主。

**55.** *多位贞女通用* （格前七34, 35）


没有丈夫的妇女和童女，所挂虑的是主的事，一心使身心圣洁。我说这话，是为你们的益处，并不是要设下圈套陷害你们，而只是为叫你们更齐全，得以不断地专心事主。


上主的圣言。
℟. 感谢天主。

**56.** *一位贞女通用* （智四1-2）


纯洁的后代，是多么光辉，多么美丽！更好是无子而有道德，因为道德的记念，永存不朽，常为天主和世人所赏识。有道德在，人都效法；道德不在，人都期待；道德在永远加冕奏凯，因为她在为无玷的报酬奋斗，获得了胜利。


上主的圣言。
℟. 感谢天主。

**57.** *多位圣妇通用* （弟前五5-7）


那真正做寡妇的，孤独无依，已寄望于天主，黑夜白日常在恳求和祈祷；但那任性纵欲的寡妇，虽生犹死。你要拿这些话去勤戒，使她们无可指摘。


上主的圣言。
℟. 感谢天主。

**58.** *一位圣妇通用* （箴三一29-31）


"贤淑的女子很多，惟有你超群出众。姿色是虚幻，美丽是泡影；敬畏上主的女人，才堪当受人赞美。愿她享受她双手操劳的成果！愿她的事业在城门口使她受赞扬！"


上主的圣言。
℟. 感谢天主。



## 祷词

在诵读殉道圣人录的礼仪结束时，司铎读经之后，合掌，不念"请众同祷"，众人答"阿们"，可任选念以下程式：

圣母玛利亚及诸圣人，
请在上主台前为我们转求，
使我们堪当蒙他助佑拯救。
他是永生永王者。

或任选以下祷词之一：

**1.** 上主，求你俯听在诸圣护佑下向你祈求的子民，赐我们在今世得享平安，在永世获得助佑。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**2.** 上主，愿你诸圣的友爱华冠使我们欢欣：既增长我们信德的力量，又以众圣的多方转求安慰我们。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**3.** 上主，求你赏赐我们在纪念诸圣的同时，也常蒙他们的护佑而欢欣。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**4.** 上主我们的天主，求你在我们身上广施恩宠：我们既庆祝诸圣光荣的战斗，也求你赐我们在圣善的生活中追随他们的胜利。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**5.** 上主，我们赞美你的仁慈，因你不断以诸圣的纪念眷顾我们；我们恳切祈求：我们所追念的诸圣，愿我们也能感受到他们的护佑。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**6.** 上主，求你将你的平安注入我们心中：你既已接纳了你的圣人们进入天上的宫殿，也求你因他们的功劳扶助，赐我们永远热心践行爱德。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**7.** 全能永生的天主，你在无数的恩惠中，尤其以诸圣的榜样安慰我们；求你恩赐：诸圣的美好纪念激励我们追求天上的事业，义人相称的祈祷引领我们到达天乡。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**8.** 天主，你以诸圣的纪念使我们欢乐，又以他们的榜样激发我们追求进步；求你恩赐：我们所虔敬尊崇的诸圣，也能在圣善的生活上效法他们的楷模。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**9.** 上主，求你以天上的眷顾围绕你的信众，将你降福的甘露倾注在他们心中，使他们因诸圣的代祷而获得支持，好能彰显你成全的恩宠。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**10.** 全能的天主，求你赏赐我们在纪念诸圣时常常赞美你，因为凡你恩许在敬礼你的事上恒心到底的人，你必将眷顾扶持。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**11.** 上主，求你赐给你的仆人们丰盛的保护和恩宠；因诸圣的转求，赐他们身心的康健，赐他们在圣德上不断增长，并使他们常常虔敬事奉你。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**12.** 上主，求你眷顾你的子民：他们在诸圣身上宣扬你的奇妙化工，又信赖你的仁慈；求你向他们广施恩惠。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**13.** 上主，求你仁慈善待你的子民：他们努力追随诸圣的芳踪；求你使他们日复一日，不断摒弃不中悦你的事，而以爱慕你诫命的心充满自己。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**14.** 全能的天主，我们为诸圣的胜利向你感恩，恳切呼求你的仁慈：求你使我们因他们代祷的扶持，常在赞美你的事上踊跃欢欣。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**15.** 上主，愿祈求者所仰望的仁慈来到他们中间，愿天上的慷慨恩赐因诸圣的代祷而赐予他们：使他们既知道当求什么，又能获得所祈求的。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**16.** 上主，求你恩赐：正如诸圣的庆节从不间断地与我们相伴，他们的代祷也同样时时护佑我们。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**17.** 全能仁慈的天主，我们纪念诸圣的庆辰，宣扬他们的凯旋；求你赏赐我们真切地效法他们的信德。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**18.** 天主，你在基督内赐予了诸圣光荣；我们恳求你的仁慈：求你也以你的降福不断更新我们，使我们因此中悦于你，成为永远的承继人。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**19.** 上主，求你慈悯垂顾我们卑微的祈祷；你既以这众多圣人的护佑加固我们，也求你赐给我们天上的真福。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**20.** 全能的天主，我们恳切祈求：赐我们获得诸圣恒常的转求，使我们在基督恩宠的运作下，也堪当效法他们的榜样。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**21.** 上主，求你守护你的信众：他们在诸圣身上认出基督的胜利；求你赐他们永远的仁慈，使他们常常虔敬事奉你的圣名。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**22.** 上主，求你眷顾你的仆人们，在他们身上增添你的恩宠，使他们感受到诸圣的助佑，并受到激励去追随圣人们的榜样。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**23.** 上主，求你悦纳你教会的呼声：使她瞻仰在众圣人身上受光荣的基督，永不懈怠地宣扬天国。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**24.** 全能永生的天主，你在诸圣身上处处显示你的奇妙；我们恳求你的仁慈：你既赐给了他们卓越的光荣，也求你使我们因他们的代祷而获得你丰厚的怜悯。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**25.** 上主，愿你的圣人们不断为我们向你祈求：既求宽恕，也求进步。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**26.** 上主，求你因诸圣的代祷，将你的仁慈赐予我们；你既赏赐他们作我们的转求者，也求你使他们不断为我们呼求你的威严，为我们求得救恩的助佑。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**27.** 上主，求你眷顾在诸圣护佑下向你祈求的子民，使他们凭自身信心所不敢奢望的，因代祷者的功劳而获得。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**28.** 上主，你以丰沛的仁慈围绕我们，我们向你感恩：你既以基督的逾越奥迹拯救了我们，又以诸圣的代祷扶持我们。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**29.** 天主，你普世王权的真理，你的圣人们在苦难中已经认识了；求你使这真理光照旅途中教会的心灵，使你的信众追求天上的事，在稳妥的自由中事奉你。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**30.** 上主，求你助佑那些臣服于你的威严和权能的人：凡他们凭自身功劳所不敢企望的，愿因诸圣的代祷而获得。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**31.** 上主，求你记念人性的软弱境况，使你的圣人们常常为我们呼求你的仁慈，并时时蒙你垂听。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**32.** 上主，愿我们因你诸圣的代祷而获得助佑：凡我们凭自己的力量所不能获得的，愿因他们的祈求而蒙你赐予。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**33.** 全能永生的天主，你以诸圣的转求守护我们；求你恩赐：我们既因他们的功劳而蒙眷顾，也在他们虔敬宣信的榜样上不断进步。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**34.** 上主，求你向我们施展你的仁慈；你使你的圣人们成为我们的护佑者，也求你使他们不断为我们呼求你的威严。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**35.** 上主，求你向祈求你的子民伸出右手：你既赏赐他们因诸圣的转求而获得扶持，也求你施以恩宠的助佑，使他们在你引导下满怀信心，远避一切邪恶，追求一切美善。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

**36.** 上主，我们恳求你：愿你的恩宠因诸圣的转求而时时保护我们，并向在世的和已亡的基督信众，处处广施你的仁慈。以上所求是靠你的子，我们的主天主耶稣基督，他和你及圣神永生永王。阿们。

> [^orationes]: 本部分36条祷词均译自拉丁文原版《罗马殉道圣人录》（2004年第二版）第63-68页。这些祷词汇编自罗马礼仪传统，其中多数出自梵二改革前《罗马弥撒经书》（1962年及更早版本）的圣人通用弥撒（Commune Sanctorum）集祷经及各圣人专用弥撒集祷经，部分出自旧版《罗马日课经》（Breviarium Romanum）。在现行2002年版《罗马弥撒经书》及梵二后《时辰颂祷》中，绝大多数已不再使用或已被替换为新编经文。因中文礼仪书中无既成译本可资参考，本译文系从拉丁原文直接翻译，文体参照现行中文弥撒集祷经惯例。


---

## 殉道圣人录咏唱调式

### 赞辞通用调式

殉道圣人录照惯例以如下方式咏唱（*Martyrológium de more cantátur hoc modo*）：

> [拉丁原版此处附四线谱示范（原版第71页上半），以通用诵读调式（*tonus lectiónis*）咏唱日期宣报及赞辞正文。示范如下：]
>
> *Quarto Nonas ianuárii. Luna ...*（一月初五前第四日。月龄……）
>
> *调式于此处屈折（以 † 标记），于此处终止。*（*Tonus sic fléctitur, † et sic finítur.*）
>
> *末句以此调式结束全篇诵读。*（*Períodus finális lectiónem sic conclúdit.*）

通用调式为简式诵读调（*tonus lectionis*）：正文诵于诵经音（*tenor*）上，遇中间停顿处行屈折（*flexus*，以 † 标记，下行一度），遇句末行结束调（*punctum*，下行二度）。每段末句以终止调（下行至次低音）结束全篇。日期宣报及月龄亦用同一调式。

### 主降生日赞辞

附调唱文（*Textus cum cantu*）

> [拉丁原版此处附四线谱全文（原版第71-74页），以庄严调式咏唱圣诞宣报词。宣报词正文部分沿用通用诵读调，至末尾"我等主耶稣基督按肉身而诞生"处转为庄严宣报调，旋律上升至高音区后庄严下行终结。拉丁原文、Gregorio gabc 转录及 XeLaTeX 排版代码见本节末尾注释]

一月初一前第八日（*Octávo Kaléndas ianuárii*，十二月廿五日）。月龄……

自创世以来，历经无数世代，在起初天主创造天地、按自己的肖像造人之时；又经许多世代，洪水之后至高者在云间设立虹弧，作为盟约与和平的标记；自我等信德之父亚巴郎从加色丁的乌尔出行，在第二十一世纪；自天主子民以色列在梅瑟率领下出离埃及，在第十三世纪；自达味受傅为王，约在第一千年，按达尼尔先知的预言，在第六十五个七之时；在第一百九十四届奥林匹亚竞技会时；自罗马建城第七百五十二年；凯撒屋大维·奥古斯都在位第四十二年；举世共享太平之际：耶稣基督，永生天主，永恒圣父之子，愿以至仁的降临祝圣世界，因圣神受孕，怀胎九月期满，在犹大白冷，由童贞玛利亚降生成人：**我等主耶稣基督按肉身而诞生。**

此日其余赞辞按通用调式咏唱。

#### 主降生日赞辞注释

> [^cantus-1]: **拉丁原文**（据2004年第二版第71-74页转录，去除咏唱音节分隔符）：
>
> *Octavo Kalendas ianuarii. Luna ...*
>
> *Innumeris transactis saeculis a creatione mundi, quando in principio Deus creavit caelum et terram et hominem formavit ad imaginem suam; permultis etiam saeculis, ex quo post diluvium Altissimus in nubibus arcum posuerat, signum foederis et pacis; a migratione Abrahae, patris nostri in fide, de Ur Chaldaeorum saeculo vigesimo primo; ab egressu populi Israel de Aegypto, Moyse duce, saeculo decimo tertio; ab unctione David in regem anno circiter millesimo, hebdomada sexagesima quinta, iuxta Danielis prophetiam; Olympiade centesima nonagesima quarta; ab Urbe condita anno septingentesimo quinquagesimo secundo; anno imperii Caesaris Octaviani Augusti quadragesimo secundo; toto Orbe in pace composito, Iesus Christus, aeternus Deus aeternique Patris Filius, mundum volens adventu suo piissimo consecrare, de Spiritu Sancto conceptus, novemque post conceptionem decursis mensibus, in Bethlehem Iudae nascitur ex Maria Virgine factus homo: Nativitas Domini nostri Iesu Christi secundum carnem.*
>
> *Reliqua elogia huius diei cantantur in tono consueto.*
>
> 本宣报词为殉道圣人录中最庄严的礼仪文本，于圣诞节前夕诵读或咏唱。其文体为一个完整的长句，以层层递进的时间标记（自创世、洪水、亚巴郎出行、以色列出埃及、达味受傅、达尼尔预言、奥林匹亚竞技会、罗马建城、奥古斯都在位），汇聚至终极宣告：耶稣基督的诞生。此宣报词的各项纪年数据沿用古代传统，与现代史学考据不尽吻合，但礼仪文本中原样保留。

> [^cantus-2]: **Gregorio gabc 转录**（据原版第71-74页四线谱。正文部分为通用诵读调，末尾 *Natívitas* 起转为庄严宣报调。本转录基于原版图版判读，最终使用前需逐音核对印刷本）：
>
> \`\`\`
> name:Elogium In Nativitate Domini;
> office-part:Martyrologium;
> annotation:Tonus solemnis;
> %%
> (c4) Oc(h)tá(h)vo(h) Ka(h)lén(h)das(h) i(h)a(h)nu(h)á(hi)ri(h)i.(hg..) (;) Lu(h)na(h) (z)
> In(h)nú(h)me(h)ris(h) trans(h)ác(h)tis(h) sǽ(h)cu(h)lis(h) a(h) cre(h)a(h)ti(h)ó(h)ne(h) mun(hg..)di,(g.) (;)
> quan(h)do(h) in(h) prin(h)cí(h)pi(h)o(h) De(h)us(h) cre(h)á(h)vit(h) cæ(h)lum(h) et(h) ter(hg..)ram(g.) (,)
> et(h) hó(h)mi(h)nem(h) for(h)má(h)vit(h) ad(h) i(h)má(h)gi(h)nem(h) su(hg..)am;(g.) (;)
> per(h)múl(h)tis(h) é(h)ti(h)am(h) sǽ(h)cu(h)lis,(h.) (,)
> ex(h) quo(h) post(h) di(h)lú(h)vi(h)um(h) Al(h)tís(h)si(h)mus(h) in(h) nú(h)bi(h)bus(h) (,)
> ar(h)cum(h) po(h)sú(h)e(h)rat,(h.) sig(h)num(h) fœ́(h)de(h)ris(h) et(h) pa(hg..)cis;(g.) (;)
> a(h) mi(h)gra(h)ti(h)ó(h)ne(h) A(h)bra(h)hæ,(h.) (,)
> pa(h)tris(h) nos(h)tri(h) in(h) fi(h)de,(h.) (,)
> de(h) Ur(h) Chal(h)dæ(h)ó(h)rum(h) sǽ(h)cu(h)lo(h) vi(h)gé(h)si(h)mo(h) pri(hg..)mo;(g.) (;)
> ab(h) e(h)grés(h)su(h) pó(h)pu(h)li(h) Is(h)ra(h)el(h) de(h) Æ(h)gýp(h)to,(h.) (,)
> Mó(h)y(h)se(h) du(h)ce,(h.) sǽ(h)cu(h)lo(h) dé(h)ci(h)mo(h) tér(h)ti(hg..)o;(g.) (;)
> ab(h) unc(h)ti(h)ó(h)ne(h) Da(h)vid(h) in(h) re(h)gem(h) (,)
> an(h)no(h) cir(h)ci(h)ter(h) mil(h)lé(h)si(hg..)mo,(g.) (,)
> heb(h)dó(h)ma(h)da(h) se(h)xa(h)gé(h)si(h)ma(h) quin(hg..)ta,(g.) (,)
> iux(h)ta(h) Da(h)ni(h)é(h)lis(h) pro(h)phe(h)tí(hg..)am;(g.) (;)
> O(h)lym(h)pí(h)a(h)de(h) cen(h)té(h)si(h)ma(h) (,)
> no(h)na(h)gé(h)si(h)ma(h) quar(hg..)ta;(g.) (;)
> ab(h) Ur(h)be(h) cón(h)di(h)ta(h) an(h)no(h) sep(h)tin(h)gen(h)té(h)si(h)mo(h) (,)
> quin(h)qua(h)gé(h)si(h)mo(h) se(h)cún(hg..)do;(g.) (;)
> an(h)no(h) im(h)pé(h)ri(h)i(h) Cǽ(h)sa(h)ris(h) (,)
> Oc(h)ta(h)vi(h)á(h)ni(h) Au(h)gús(h)ti(h) (,)
> qua(h)dra(h)gé(h)si(h)mo(h) se(h)cún(hg..)do;(g.) (;)
> to(h)to(h) Or(h)be(h) in(h) pa(h)ce(h) com(h)pó(h)si(hg..)to,(g.) (,)
> Ie(h)sus(h) Chris(h)tus,(h.) (,)
> æ(h)tér(h)nus(h) De(h)us(h) æ(h)ter(h)ní(h)que(h) Pa(h)tris(h) Fí(h)li(h)us,(h.) (,)
> mun(h)dum(h) vo(h)lens(h) ad(h)vén(h)tu(h) su(h)o(h) (,)
> pi(h)ís(h)si(h)mo(h) con(h)se(h)crá(h)re,(h.) (,)
> de(h) Spí(h)ri(h)tu(h) Sanc(h)to(h) con(h)cép(h)tus,(h.) (,)
> no(h)vém(h)que(h) post(h) con(h)cep(h)ti(h)ó(h)nem(h) (,)
> de(h)cúr(h)sis(h) mén(h)si(h)bus,(h.) (,)
> in(h) Béth(h)le(h)hem(h) Iu(h)dæ(h) nás(h)ci(h)tur(h) ex(h) Ma(h)rí(h)a(h) Vír(h)gi(h)ne(h) fac(h)tus(h) (,)
> ho(hg..)mo:g. (;)
> Na(ij)tí(k)vi(k)tas(k) Dó(k)mi(k)ni(k) nos(k)tri(k) Ie(k)su(k) Chris(kji..)ti(i.) (;)
> se(ixhi)cún(h)dum(gxfg) car(hgf..)nem.(f.) (::)
> \`\`\`
>
> 注：上方 gabc 以 (c4) 谱号表示 do 音（C）位于第四线。诵经音 h = la（A），位于第三线。正文主体为 recto tono 诵读，于分号处以 hg 二度下行行句末终止（*punctum*），于逗号处以短暂停顿行呼吸（*respiratio*）。末尾"Natívitas"处旋律上升至 k（do 上方二度），经庄严宣报后以 hgf 三度下行终止于 f（fa）。末尾"secúndum carnem"段含降 si 记号（♭），终止音 f。此 gabc 系从原版图版判读之初稿，庄严宣报段（*Natívitas* 起）的精确音高需与印刷本逐音核对后修订。

> [^cantus-3]: **XeLaTeX 排版模板**（拉丁唱词 + 四线谱 + 中文译文，用于 psalter.sty 或独立编译）：
>
> \`\`\`latex
> % Elogium In Nativitate Domini
> % 主降生日赞辞（圣诞宣报词）
> % Gregorio/XeLaTeX 排版：拉丁唱词 + 四线谱 + 中文译文
> %
> % 编译：lualatex kalenda.tex（需 TeX Live 完整安装 + Gregorio）
> % 前置：将上方 gabc 代码保存为 kalenda.gabc，与本文件同目录
> % 字体依赖：EB Garamond（拉丁）、Noto Serif CJK SC（中文）
> %   若使用 psalter.sty，可改用 psalter.sty 中定义的字体命令
> 
> \\documentclass[12pt,a4paper]{article}
> \\usepackage{fontspec}
> \\usepackage[autocompile]{gregoriotex}
> \\usepackage{xeCJK}
> \\usepackage[a4paper, top=2.5cm, bottom=2.5cm, left=3cm, right=3cm]{geometry}
> 
> % === 字体设置 ===
> \\setmainfont{EB Garamond}[
>   Ligatures=TeX,
>   Numbers=OldStyle
> ]
> \\setCJKmainfont{Noto Serif CJK SC}[
>   Scale=0.95,
>   ItalicFont=Noto Serif CJK SC
> ]
> 
> % === Gregorio 设置 ===
> \\grechangestyle{initial}{\\fontsize{36}{36}\\selectfont}
> \\grechangedim{spaceabovelines}{0.6cm}{scalable}
> \\grechangedim{spacelinestext}{0.3cm}{scalable}
> \\gresetcustosaliasaliased % 适配旧版 gregorio
> 
> % === 中文译文行间排版命令 ===
> % 用法：在 \\gregorioscore 各段之间插入对应中文译文
> \\newcommand{\\zhtrans}[1]{%
>   \\par\\nobreak\\vspace{6pt}%
>   {\\small\\kaishu #1}%
>   \\par\\vspace{10pt}%
> }
> 
> % === 版面 ===
> \\pagestyle{empty}
> 
> \\begin{document}
> 
> \\begin{center}
>   {\\Large\\textsc{Elogium In Nativitate Domini}}\\\\[6pt]
>   {\\large 主降生日赞辞}\\\\[3pt]
>   {\\small\\itshape Martyrologium Romanum, editio typica altera (2004), pp.\\,71--74}
> \\end{center}
> 
> \\vspace{1.5em}
> 
> % --- 四线谱乐谱 ---
> \\gregorioscore{kalenda.gabc}
> 
> \\vspace{2em}
> \\begin{center}\\rule{0.4\\textwidth}{0.4pt}\\end{center}
> \\vspace{1em}
> 
> % --- 中文译文 ---
> {\\noindent\\textbf{中文译文}\\par\\vspace{0.8em}}
> 
> \\noindent 一月初一前第八日（十二月廿五日）。月龄……
> 
> \\vspace{0.5em}
> 
> \\noindent 自创世以来，历经无数世代，在起初天主创造天地、按自己的肖像造人之时；%
> 又经许多世代，洪水之后至高者在云间设立虹弧，作为盟约与和平的标记；%
> 自我等信德之父亚巴郎从加色丁的乌尔出行，在第二十一世纪；%
> 自天主子民以色列在梅瑟率领下出离埃及，在第十三世纪；%
> 自达味受傅为王，约在第一千年，按达尼尔先知的预言，在第六十五个七之时；%
> 在第一百九十四届奥林匹亚竞技会时；%
> 自罗马建城第七百五十二年；%
> 凯撒屋大维·奥古斯都在位第四十二年；%
> 举世共享太平之际：%
> 耶稣基督，永生天主，永恒圣父之子，愿以至仁的降临祝圣世界，%
> 因圣神受孕，怀胎九月期满，%
> 在犹大白冷，由童贞玛利亚降生成人：%
> \\textbf{我等主耶稣基督按肉身而诞生。}
> 
> \\vspace{0.5em}
> 
> \\noindent 此日其余赞辞按通用调式咏唱。
> 
> \\end{document}
> \`\`\`



---

## 七月一日

**Die 1 iúlii** · 七月初一（*Kaléndis iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
> A B C D E F F G H M N P
> 25 26 27 28 29 30 30 1 2 3 4 5

**1\\.** 纪念圣亚郎（Aaron），肋未支派人。受兄长梅瑟以圣油傅抹，被立为旧约的司祭。在曷尔山上安葬。

**2\\.** 在里昂高卢之维埃纳（Viénna in Gállia Lugdunénsi），圣玛尔定（Martínus），主教（三世纪末）。

**3\\.** 在里昂高卢地区之贝布龙修院（monastérium Bebronnénse），圣多弥齐亚诺（Domitiánus），院长。最初在此地度独修生活，后聚集多人到此为天主服务。终目注天上，在高龄中离开尘世（五世纪）。

**4\\.** 在纽斯特里亚兰斯地区（território Néustriæ Reménsi），圣德奥多里科（Theodorícus），司铎，圣雷弥爵（Remígius）主教之门徒（533年）。

**5\\.** 在阿基坦之昂古莱姆（Engolísma in Aquitánia），圣厄帕尔基奥（Epárchius），司铎。在隐居中度过三十九年，唯独致力于祈祷，教导弟子说："信德不怕饥饿。"（581年）

**6\\*.** 在布列塔尼（Británnia Minor），圣戈尔韦诺（Golvénus），主教。据传度独修生活后继圣保禄·莱翁主教之位（六世纪）。

**7\\*.** 在里昂高卢勒芒地区之安尼尔修院（monastérium Annínsulæ in pago Cenomanénsi），圣加里莱佛（Cariléfus），院长（六世纪）。

**8\\*.** 在英格兰之伦敦（Londínium），真福乔治·比斯利（Geórgius Beesley）与蒙福尔·斯科特（Montfórdus Scott），司铎、殉道。在伊丽莎白一世治下因司铎身份被判处死刑，历经残酷折磨而获殉道之棕枝（1591年）。

**9\\*.** 同在伦敦，真福多默·马克斯菲尔德（Thomas Maxfield），司铎、殉道。在詹姆斯一世（Iacóbus rex Primus）治下因以司铎身份进入英格兰被判处死刑，在泰伯恩刑场受刑，在场的忠信信众以花环装饰刑台，彰显对他的至诚崇敬（1616年）。

**10\\.** 同在伦敦，圣奥利弗·普伦凯特（Olivérius Plunkett），阿尔马主教、殉道。在查理二世治下被诬以叛国罪名判处死刑。在围观群众面前、于绞刑台前宽恕仇人，坚定地宣认天主教信仰直至最后一刻（1681年）。

**11\\*.** 在法国罗什福尔海岸外，真福若翰·巴蒂斯特·迪韦尔诺伊（Ioánnes Baptísta Duverneuil），加尔默罗赤足会会士，与伯多禄·阿雷迪·拉布鲁什·德·拉博尔德里（Petrus Arédius Labrouhe de Laborderie），克莱蒙咏经司铎，殉道。法国大革命期间因司铎身份同被囚于奴隶运输船上，为饥病所吞噬（1794年）。

**12\\*.** 在马耳他岛之瓦莱塔（Vallétta in ínsula Meliténsi），真福依纳爵·法尔松（Ignátius Falzon），神职人员。致力于祈祷与教授基督要理，尤其关怀士兵与水手，在他们出征前引导其皈依天主教信仰（1865年）。

**13\\.** 在中国河北省（拉丁文误作 *Hunanénsi*）衡水（*Fieshui*）附近之祝葛店（*Zhuhedian*），圣张怀禄（Zhang Huailu），殉道。在义和团（*Yihetuan*）之迫害中尚为慕道者，即自发宣认自己是基督徒，以十字圣号自护，以自身之血受洗于基督（1900年）。

**14\\.** 在墨西哥瓜达拉哈拉之十字架牧场（Rancho de las Cruces），圣儒斯蒂诺·奥罗纳（Iustínus Orona）与圣阿蒂拉诺·克鲁斯（Atilánus Cruz），司铎、殉道。在墨西哥教难中为基督的国度一同被杀害（1928年）。

**15\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福若望·内波穆克·赫尔赞（Ioánnes Nepomucénus Chrzan），司铎、殉道。波兰人，战争期间在达豪集中营中面对迫害者捍卫信仰而完成受难（1942年）。

### 七月一日校注

1. **第1条（圣亚郎）**：亚郎（Aaron）、梅瑟（Moses）、肋未（Levi）、曷尔山（Mount Hor）均从思高圣经。亚郎受傅圣及在曷尔山安葬见出二十八-二十九章及户二十33-38。

2. **第5条（圣厄帕尔基奥）**："信德不怕饥饿"（*Fides famem non timet*）为该圣人对弟子之教诲。

3. **第9\\*条**：詹姆斯一世（James I, 1603-1625在位）从世俗通行译法。信众以花环装饰刑台之细节（*flóribus serto*）为殉道圣人录中极罕见的感人场景。

4. **第10条（圣奥利弗·普伦凯特）**：奥利弗·普伦凯特（Oliver Plunkett, 1625-1681），爱尔兰阿尔马总主教（Primate of All Ireland），1975年封圣，为爱尔兰最后一位殉道圣人。在"天主教阴谋案"（Popish Plot）时期被诬叛国。阿尔马（Armagh）为爱尔兰教会首席主教座。

5. **第13条（中华殉道圣人）**：张怀禄（Zhang Huailu），拉丁原文将其省份误标为"Hunanénsi"（湖南），实为河北省（Hebei）。衡水（Héngshui），拉丁文罗马化为 *Fieshui*；祝葛店（Zhùgědiàn），罗马化为 *Zhuhedian*。正文已据实更正省份为河北，义和团之迫害归属亦由此成立（义和团活动于华北）。张怀禄与七月二十日第16条郗柱子同为慕道者血洗殉道之案例。参考资料：ziliaozhan.win 中华殉道圣人条目。

6. **第14条（墨西哥殉道圣人）**：儒斯蒂诺·奥罗纳与阿蒂拉诺·克鲁斯为墨西哥基督战争（Cristero War, 1926-1929）期间殉道之司铎，2000年教宗若望保禄二世封圣。

---

## 七月二日

**Die 2 iúlii** · 七月初七前第六日（*Sexto Nonas iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
> A B C D E F F G H M N P
> 26 27 28 29 30 1 1 2 3 4 5 6

**1\\.** 在罗马奥雷利亚大道第二里程碑之达马索墓园（cœmetérium Dámasi via Aurélia），圣普罗切索（Procéssus）与圣马尔蒂尼亚诺（Martiniánus），殉道（年代不详）。

**2\\.** 纪念殉道者：圣利贝拉托（Liberátus），院长，博尼法爵（Bonifátius），执事，塞尔沃（Servus）与鲁斯蒂科（Rústicus），副执事，罗加托（Rogátus）与塞蒂莫（Séptimus），修士，及少年马西莫（Máximus）。在迦太基（Carthágo），于汪达尔亚略王胡内里克（Hunnéricus rex ariánus）治下之迫害中，因宣认天主教信仰及捍卫唯一圣洗，受尽残酷磨难。最终被钉于焚烧他们的木柱之上，又以桨棒击碎头颅而死，蒙主赐冠，光荣地跑完了这场美好的赛程（484年）。

**3\\.** 在纽斯特里亚之图尔（Turónes in Néustria），圣莫内贡德（Monegúndis），奉献于天主的妇女。离弃故乡与双亲，唯独致力于祈祷（557年以前）。

**4\\.** 在英格兰之温切斯特（Vintónia），圣斯威辛（Swithínus），主教。以严苦生活与爱护穷人著称，创建多座教堂，巡访时始终步行（862年）。

**5\\*.** 在拉齐奥之塞齐亚（Sétia in Látio），圣利达诺（Lidánus），院长，当地修院之创建者。以修士之劳作将周围沼泽地的瘴疫一扫而尽（1118年）。

**6\\*.** 在法国阿维尼翁附近之维尔纳夫（Villa Nova prope Aveniónem），真福伯多禄·卢森堡（Petrus de Luxembúrgo），梅斯主教之瞻礼（*tránsitus*）。一生致力于苦行与祈祷（1387年）。

**7\\*.** 在意大利皮切诺之法布里亚诺（Fabriánum in Picéno），纪念真福若望与伯多禄·贝凯蒂（Ioánnes et Petrus Becchetti），圣奥斯定隐修会司铎。同一修道生活的纽带比血缘更紧密地连结了他们（约1420-1421年）。

**8\\.** 在阿普利亚之莱切（Lýcia in Apúlia），圣贝尔纳迪诺·雷亚利诺（Bernardínus Realino），耶稣会司铎。以爱德与仁慈著称，弃世俗荣华于不顾，全心投入照顾囚犯与病人的牧灵工作，以及宣讲与修和圣事之服务（1616年）。

**9\\*.** 在比利时之列日（Leódium in Bélgio），真福厄乌日尼亚·茹贝尔（Eugénia Joubert），圣心圣家修女会（Congregátio Sacræ Famíliæ a Sacro Corde）童贞。致力于向幼童教授基督要理，后患肺痨，以爱追随了受苦的基督（1904年）。

### 七月二日校注

1. **第2条（迦太基殉道者）**：汪达尔王胡内里克（Hunneric, 477-484在位），信奉亚略异端（Arianism），从世俗通行译法。"唯一圣洗"（*únicus baptísmus*）指迦太基殉道者拒绝接受亚略派的重洗礼。"以桨棒击碎头颅"（*remórum véctibus percússi et comminútis cérebris*）为殉道圣人录中极残酷之描写。

2. **第4条（圣斯威辛）**：斯威辛（Swithun/Swithin, c.800-862），温切斯特主教。英格兰民间传说与其瞻礼日（7月15日旧历）的天气有关。拉丁文名 Swithinus 为盎格鲁-撒克逊名之拉丁化，从英文通行形式。

---

---

## 七月三日

**Die 3 iúlii** · 七月初七前第五日（*Quinto Nonas iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
> A B C D E F F G H M N P
> 27 28 29 30 1 2 2 3 4 5 6 7

**1\\.** 圣多默宗徒庆日。其余门徒向他宣报耶稣已复活时，他不肯相信。但当耶稣亲自向他展示被刺透的肋旁，他高呼说："我主！我的天主！"据传他以此信仰向印度诸民族宣讲了福音（一世纪）。

**2\\.** 在叙利亚之劳狄刻雅（Laodicéa in Sýria），纪念圣亚纳多略（Anatólius），主教。不仅为修道者，亦为哲学家留下了令人赞叹的著作（三世纪）。

**3\\.** 在色雷斯之比齐厄（Bízya in Thrácia），圣默姆农（Memnon），百夫长、殉道。在戴克里先与马克西米安时代由圣塞韦洛引导归依信仰，与塞韦洛同受惨烈酷刑后，率先凯旋升入天国（约三世纪）。

**4\\.** 在默西亚（Mæsia），纪念圣玛尔谷（Marcus）与圣莫齐亚诺（Mociánus），殉道。因拒绝向偶像献祭、更加勇猛地宣认基督而被斩首（约四世纪）。

**5\\.** 在威尼托之阿尔蒂诺（Altínum in Venétia），圣厄利奥多洛（Heliodórus），主教。受教于阿奎莱亚的圣瓦莱里亚诺（Valeriánus Aquileiénsis），为圣克罗马齐奥（Chromátius）与圣热罗尼莫（Hierónymus）之友伴，首任该城主教（四至五世纪）。

**6\\*.** 在君士坦丁堡，圣亚纳多略（Anatólius），主教。宣认了教宗圣良致弗拉维亚诺（Flaviánus）之信函（*tomus*）中所表述的、关于基督二性的正统信仰，并力促此信仰于加采东大公会议（Concílium Chalcedonénse）中获得宣认（458年）。

**7\\.** 在罗马圣伯多禄大殿，圣良二世（Leo papa Secúndus），教宗。精通希腊文与拉丁文，关爱贫穷及穷人，接受了第三次君士坦丁堡大公会议（683年）。

**8\\*.** 在法国加龙河畔之图卢兹（Tolósa ad Garúmnam），圣赖蒙多·盖拉尔（Raymúndus Gayrard），学校教师。丧偶后全心投入爱德事业，创建了济贫旅舍，后被接纳为圣撒图尔尼诺大殿之咏经司铎（1118年）。

**9\\.** 在东京（Tunquínum）之兴安城（Hung Yên），圣阮廷渊若瑟（Iosephus Nguyn Đình Uyn），传道员、殉道。在明命帝（Minh Mạng）治下因仇恨基督信仰而被投入狱中，死于狱中（1838年）。

**10\\.** 在交趾支那（Cocincína）之永隆城（Vĩnh Long），圣潘文明斐理伯（Philíppus Phan Văn Minh），司铎、殉道。在嗣德帝（Tự Đức）治下为基督被斩首（1853年）。

**11\\*.** 在西班牙马德里附近之丰卡拉尔（Fuencarral），真福玛利亚·安纳·莫加斯·丰特库贝尔塔（María Anna Mogas Fontcuberta），童贞。为培育少女、照顾穷人与病人，创立天主母善牧修女会（Congregátio Sorórum a Matre Divíni Pastóris）（1886年）。

**12\\.** 在中国河北省（*Hebei*）深县（*Shenxian*）附近之东洋台（*Dongyangtai*）沼泽中，圣赵明振伯多禄（Petrus Zhao Mingzhen）与圣赵明喜若翰（Ioánnes Baptísta Zhao Mingxi），殉道，二人为兄弟。在义和团之迫害中，不顾自身安危，奋力保护逃难的基督徒妇女与儿童，被敌人杀害（1900年）。

### 七月三日校注

1. **第1条（圣多默宗徒）**：庆日（*festum*）。多默（Thomas）从思高圣经。"我主！我的天主！"引自若二十28，从思高圣经原文。"据传他向印度诸民族宣讲了福音"为教会古老传统。OCR首字母缺失，据西语版补全。

2. **第3条（圣默姆农）**：与七月二十三日第4条（比齐厄之圣塞韦洛）为同一事件之两个主角，分列两日纪念。塞韦洛引导默姆农归依，二人同受酷刑。

3. **第6\\*条（君士坦丁堡之圣亚纳多略）**：教宗圣良之信函（*tomus Leonis*）为451年加采东大公会议讨论基督论之关键文献。弗拉维亚诺（Flavianus）为君士坦丁堡宗主教。

4. **第9-10条（越南殉道圣人）**：阮廷渊（Nguyễn Đình Uyên），汉字推定：阮=Nguyễn（无歧义），廷=Đình（无歧义），渊=Uyên（中等偏高）。兴安（Hưng Yên）为越南北部城市，汉字"兴安"无歧义。潘文明（Phan Văn Minh），汉字推定：潘=Phan（无歧义），文=Văn（无歧义），明=Minh（无歧义）。永隆（Vĩnh Long）在越南南部，汉字"永隆"无歧义。

5. **第12条（中华殉道圣人）**：赵明振与赵明喜为兄弟，在深县（今河北省衡水市深州市）东洋台附近之沼泽中殉道。拉丁文"in palúde"（在沼泽中）指二人在保护逃难者时被追杀于沼泽地带。

6. **西语版独有条目**：西语版在第8\\*条与第9条之间插入一条真福赖蒙多·柳利（Raimundus Lullus, 1232-1316），拉丁文底本无此条目，属地方敬礼（马略卡），从略不译。

## 七月四日

**Die 4 iúlii** · 七月初七前第四日（*Quarto Nonas iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
> A B C D E F F G H M N P
> 28 29 30 1 2 3 3 4 5 6 7 8

**1\\.** 葡萄牙的圣依撒伯尔（Elísabeth），路西塔尼亚（Lusitánia，葡萄牙）王后，以调和诸王纷争之才德及爱恤贫者之仁心称著。夫君迪尼斯（Dionýsius）王驾崩后，于路西塔尼亚埃斯特雷莫斯（Stremóntium）亲手所建之圣佳兰第三会女修院中度奉献生活，在致力于调和其子与其婿之际，蒙召归于天主（1336年）。

**2\\.** 在非洲，圣若孔迪亚诺（Iucundiánus），殉道（世纪不详）。

**3\\.** 在阿基坦（Aquitánia）布尔日（Bituricénsis）地区维斯丁（Vistínum）村，圣劳里亚诺（Lauriánus），殉道（三/四世纪）。

**4\\*.** 在阿基坦之卡杜尔科（Cadúrci，今卡奥尔），圣弗洛伦齐奥（Floréntius），主教。诺拉之圣保利诺（Paulínus Nolánus）称赞其心谦逊、恩宠刚毅、言辞甘美（五世纪）。

**5\\*.** 同在阿基坦，朗格勒（Língones）之圣瓦伦定（Valentínus），司铎及隐修士（约五世纪）。

**6\\*.** 在高卢阿特雷巴特地区（pagus Atrebaténsis）之布朗吉（Blangíacum），圣白尔大（Bertha），女院长。偕其女日多德（Gertrúda）及德奥蒂拉（Deotíla）入己所建之修院；数年后退隐独室，完全封闭（约725年）。

**7\\.** 在莱斯博斯（Lesbus）岛之厄雷索斯（Eréssus），克里特之圣安德肋（Andréas Creténsis），戈尔蒂纳（Gortyniénsis）主教善终之日。以祷词、赞美诗及圣歌，凭卓越之艺赞颂天主，并宣扬天主之母童贞圣母之始胎无玷及蒙召升天（740年）。

**8\\.** 在巴伐利亚（Bavária）之奥格斯堡（Augústa Vindelicórum），圣乌达利科（Udalrícus），主教，以超凡克苦、慷慨大度及牧职勤勉著称。任主教五十年后，年九十而安息（973年）。

**9\\*.** 在萨伏依（Sabáudia）布尔歇湖（lacus Burgétus）畔之奥特孔布（Alta Cumba）修院，安放真福博尼法爵（Bonifátius）主教之圣髑。出身王室，先隐于加尔都西会（Cartusiáni）士之中，后擢升贝莱（Bellicénsis）主教座，终受命为坎特伯里（Cantuariénsis）总主教。终其一生，殚精竭虑牧养所托之羊群。

**10\\*.** 在厄特鲁里亚（Etrúria，托斯卡纳）之佛罗伦萨（Floréntia），真福若望·维斯皮尼亚诺（Ioánnes de Vespiníano）（十三/十四世纪）。

**11\\*.** 在英格兰之多切斯特（Dorcéstria），诸真福殉道者：若望·科尔乃略（John Cornelius），司铎，入耶稣会未久；多默·博斯格雷夫（Thomas Bosgrave），若望·凯里（John Carey），巴特利·萨蒙（Patrick Salmon），平信徒，皆曾襄助该司铎。众人于伊丽莎白一世女王治下同受殉道，光荣基督（1594年）。

**12\\*.** 同在英格兰之约克（Eborácum），诸真福殉道者：威廉·安德尔比（William Andleby），司铎；亨利·阿博特（Henry Abbot），多默·沃科普（Thomas Warcop），爱德华·福尔索普（Edward Fulthorp），平信徒。在同一迫害中因忠于教会被判极刑，同经绞刑架之苦而迁入永福（1597年）。

**13\\.** 在加拿大休伦族（Hurónes）领地，圣安多尼·达尼尔（Antónius Daniel），耶稣会（Socíetas Iesu）司铎、殉道。弥撒礼成后，立于圣堂门前守护新领洗者，抵御闯入之异教敌人，身中箭矢遍体，终为火焚而殉。与其同伴之共同纪念日在十月十九日（1648年）。

**14\\*.** 在法国康塔尔山区（mons Celtórum）之莫里亚克（Mauríacum），真福加大利纳·雅里热（Catharína Jarrige），童贞，圣道明第三会（Tértius Ordo Sancti Domínici）会员。以服务穷人及病患称著；在法国大革命期间，竭尽全力保护遭叛乱者追捕之司铎，并探望系狱者（1836年）。

**15\\.** 在中国（Sínæ）湖南省（província Hunanénsis）衡州（urbs Hemceuvénsis，今衡阳），圣董哲西，方济各小兄弟会（Ordo Minórum）司铎、殉道。在义和团（Yihetuan）发动之迫害中，竭力保护至圣圣体（Sanctíssimum Sacraméntum）免受暴徒凌辱，遭乱石投击，复以浸油之布裹身，被活活烧死（1900年）。

**16\\*.** 在意大利之都灵（Augústa Taurinórum），真福伯多禄·乔治·弗拉萨蒂（Petrus Geórgius Frassati）。青年时即活跃于教友社团，满腔热忱致力于激励社会、力行仁爱、服务贫病，直至骤发暴发性瘫痪而安息主怀（1925年）。

**17\\*.** 在波兰克拉科夫（Cracóvia）附近之奥斯维辛（*Oświęcim* / *Auschwitz*）灭绝营，真福若瑟·科瓦尔斯基（Iosépus Kowalski），殉道。战争期间因基督之名被投入狱中，身受酷刑，终于狱中完成殉道（1942年）。

### 七月四日校注

1. **第1条 *fílium et génerum***：拉丁文 *generum* 义为"婿"（son-in-law），指依撒伯尔之子阿丰索四世与其婿、卡斯蒂利亚王阿丰索十一世之间的纷争。西语版误作 *un hijo y un nieto*（"一子一孙"），有违拉丁原文。本译从拉丁。依撒伯尔为迪尼斯一世之妻，非自行在位之女王，故译"王后"而非"女王"。

2. **第9\\*条（真福博尼法爵）**：西语版完全漏收此条，导致其后编号较拉丁版少一位（西语第9\\* = 拉丁第10\\*，依此类推）。本译依拉丁版保留全部十七条。

3. **第15条地名与人名**：拉丁文作 *urbs Hemceuvénsis*，系衡州（Hengzhou）之拉丁化拼写。西语版作 *Wan-sha-wa*，来源不明，疑为异系转写或误植。据史实径作"衡州"。圣人中文教名"董哲西"据香港教区档案处名录确认。董哲西（意大利语 Cesidio Giacomantonio，1873-1900），意大利阿布鲁佐人，方济各会士，在湖南衡州传教，拉丁文作 *Cæsídius Giacomantonio*。

4. **第16\\*条圣品等级**：2004年版原文作 *beátus*（真福），本译从底本。惟伯多禄·乔治·弗拉萨蒂已于2025年由教宗方济各列入圣品，未来新版殉道圣人录当改作 *sanctus*。

---

## 七月五日

**Die 5 iúlii** · 七月初七前第三日（*Tértio Nonas iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
> A B C D E F F G H M N P
> 29 30 1 2 3 4 4 5 6 7 8 9

**1\\.** 圣安多尼·匝加利（Antonio Maria Zaccaria），司铎。为革新信友之风俗，创立圣保禄正规司铎修会，又称巴尔纳伯会（Congregátio Clericórum Regulárium Sancti Pauli, seu Barnabitárum），在伦巴第（Langobárdia）之克雷莫纳（Cremóna）飞赴救主怀中（1539年）。

**2\\.** 在卡拉布里亚（Calábria）之勒佐（Rhégium Iúlii），尼西亚之圣斯德望（Stéphanus de Nicǽa），主教、殉道（一世纪）。

**3\\.** 在利比亚（Líbya）之基勒乃（Cyréne），圣济普利拉（Cyprílla），殉道。据传，在戴克里先（Diocletiánus）皇帝迫害期间，她将燃烧的炭火连同乳香一同置于掌上，久持不坠，以免拂落炭火而看似向偶像献了香；其后遭极残忍地肢解，以自身鲜血为荣饰，飞赴净配之怀（四世纪）。

**4\\.** 纪念耶路撒冷之圣亚大纳削（Athanásius Hierosolymitánus），至圣复活堂执事、殉道。因痛斥异端修士德奥多削（Theodósius）的不虔诚，并捍卫加采东（Chalcedonénsis）大公会议，抵御其反对者，遂为该修士惨杀（451/452年）。

**5\\.** 又纪念圣多默齐奥（Dométius），号"医者"（Médicus），亚美尼亚（Arménia）库洛斯山（mons Quros）隐修士（五世纪）。

**6\\*.** 在叙利亚（Sýria）之奇异山（mons Mirábilis），圣玛尔大（Martha），小柱头修士圣西默盎（Simeón Stylítes iunior）之母（551年）。

**7\\*.** 在卡拉布里亚勒佐附近之圣母特雷托修院（monastérium Sanctæ Maríæ de Terréto），圣多默（Thomas），院长（约1000年）。

**8\\*.** 在阿索斯山（mons Atho），圣亚大纳削（Athanásius），掌院，谦逊和善，在大拉夫拉修院（Magna Laura）创立团体修道制度（约1004年）。

**9\\*.** 在爱尔兰之韦克斯福德（Vexfórdia），诸真福殉道者：玛窦·兰伯特（Matthew Lambert），罗伯特·迈勒（Robert Meyler），爱德华·奇弗斯（Edward Cheevers），巴特利·卡瓦纳（Patrick Cavanagh）。其中兰伯特为面包师，其余皆水手，因忠于罗马教会并襄助受迫害之天主教徒，在伊丽莎白一世女王治下被处绞刑并遭开膛（1581年）。

**10\\*.** 在英格兰之牛津（Oxónium），诸真福殉道者：乔治·尼科尔斯（George Nichols），理查德·雅克斯利（Richard Yaxley），司铎；多默·贝尔森（Thomas Belson），修习司铎职者；汉弗莱·普里查德（Humphrey Pritchard）。在同一女王治下皆被判处死刑：或因身为司铎而进入英格兰，或因襄助此等司铎，同受绞刑架之苦（1589年）。

**11\\.** 在中国（Sínæ）河北省（província Hebei）宁晋县（Ningjinxian）黄儿营（Huangeryin）村附近，圣陈金婕德兰（Terésia Chen Jinxie）及圣陈爱婕洛莎（Rosa Chen Aixie），姐妹，贞女、殉道。在义和团（Yihetuan）发动之迫害中，为保全贞洁之荣誉与基督信仰，奋勇抵抗迫害者之野蛮暴行，被长矛刺死（1900年）。

### 七月五日校注

1. **第7\\*与第8\\*条次序**：西语版将阿索斯山之圣亚大纳削排为第7\\*（拉丁第8\\*），圣母特雷托修院之圣多默排为第8\\*（拉丁第7\\*），互换了次序。本译从拉丁版编号。

2. **第11条人名**：中文教名据香港教区档案处"120位中华殉道圣人"名录确认：圣陈金婕德兰（Teresia Chen Tinjieh）、圣陈爱婕洛莎（Rosa Chen Aijieh）。按香港方面惯例，中国籍圣人之圣名（教名）置于姓名之后。拉丁文作 *Terésia Chen Jinxie* 及 *Rosa Chen Aixie*，拼写略有出入，系同一人名之不同转写。黄儿营（Huangeryin）在今河北省宁晋县境内。

---

## 七月六日

**Die 6 iúlii** · 七月初七前一日（*Prídie Nonas iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
> A B C D E F F G H M N P
> 30 1 2 3 4 5 5 6 7 8 9 10

**1\\.** 圣玛利亚·葛蕾蒂（Maria Goretti），童贞、殉道。自幼度过艰辛的童年，以操持家务辅助母亲，并恒心祈祷。年方十二岁时，为抵御侵犯者保全贞洁，在意大利拉齐奥（Látium）内图诺（Neptúnum）附近，遭匕首刺穿致死（1902年）。

**2\\*.** 在比提尼亚（Bithýnia）之尼科美迪亚（Nicomedía），圣奇里亚加（Cyríaca），童贞、殉道。殉于戴克里先帝在位时，在卡拉布里亚（Calábria）之特罗佩亚（Tropǽa）深受崇敬（四世纪）。

**3\\.** 在厄特鲁里亚（Etrúria，托斯卡纳）之菲耶索莱（Fǽsulæ），圣罗慕洛（Rómulus），执事。该城奉其为首位殉道者（世纪不详）。

**4\\*.** 在埃及，圣"大"（Magnus）西索厄斯（Sísoes），隐修士，以修道生活之操修极为卓著（约429年）。

**5\\*.** 在苏格兰（Scótia），纪念圣帕拉迪奥（Palládius），主教。自罗马城受派遣赴爱尔兰（Hibérnia），在欧塞尔之圣杰尔马诺（Germánus Autissiodorénsis）于不列颠人中间抵御白拉奇（Pelágius）异端之际，于此间辞世（432年）。

**6\\*.** 在爱尔兰阿马（Armachánum）地区，圣莫内纳（Monénna），*基利维*（*Killeevy*）修院女院长，该修院由其亲手创建（517年）。

**7\\.** 在莱茵河畔，圣戈阿尔（Goáris），司铎，出自阿基坦（Aquitánia）。特里尔（Trevírensis）主教赞许，建造客栈与祈祷所，以接待过路旅客并照顾其灵魂之救恩（六世纪）。

**8\\*.** 在勃艮第（Burgúndia）汝拉山（Iura）区之孔达（Condatiscénsis）镇，圣犹斯多（Iustus），修士（六世纪）。

**9\\.** 在英格兰之伦敦（Londínium），圣多默·莫尔（Thomas More）殉道之日。其庆日在六月二十二日，与圣若望·费舍尔（Ioánnes Fisher）同日纪念（1535年）。

**10\\*.** 同在伦敦，真福多默·阿尔菲尔德（Thomas Alfield），司铎、殉道。先因酷刑胁迫而背弃天主教信仰，后被驱逐出境；旋即悔改返回祖国。因散发一篇为天主教徒辩护之《辩护书》（*Apología*），在伊丽莎白一世女王治下于泰伯恩（Tybúrnum）处以绞刑（1585年）。

**11\\*.** 在法国罗什福尔（Rupifórtium）海岸外之锚泊处，真福奥斯定·若瑟（厄利亚）·德加尔丹（Augustínus Ioséphi [Elías] Desgardin），熙笃会（Ordo Cisterciénsis）修士、殉道。法国大革命期间，因仇教之故被逐出七泉（Septem Fóntium）修院，投入一艘污秽不堪的囚船。染病之际，仍竭力照顾同船患病之囚伴，终至不治而亡（1794年）。

**12\\*.** 同在法国奥朗日（Arausio），真福苏珊娜·亚加大（玛利亚·罗莎）·德·洛瓦（Susánna Agatha [María Rosa] de Loye），本笃会（Ordo Sancti Benedícti）修女、童贞、殉道。法国大革命肆虐之际，来自各修会及女修院之三十二位女修道人同囚于一狱。她在狱中坚守修道生活。迫害者出于对基督之名的仇恨，于其后数日间将她与其余修女相继判处死刑。她为该批修女中首位受刑者，毅然无惧地走上断头台（1794年）。

**13\\.** 在中国（Sínæ）河北省（Hebei）蓟县（*Jixian*）附近之双忠（*Shuangzhong*），圣王作龙伯多禄（Petrus Wang Zuolong），殉道。在义和团（*Yihetuan*）发动之迫害中，被引至偶像前，因拒绝背弃基督信仰，遭悬吊处死（1900年）。

**14\\*.** 在罗马，真福玛利亚·德肋撒·莱多霍夫斯卡（María Terésia Ledóchowska），童贞。全心投身于服务受奴役压迫之非洲人，创立圣伯多禄·克拉维尔善会（Sodalítium Sancti Petri Claver）（1922年）。

**15\\*.** 在阿根廷布宜诺斯艾利斯（Bonǽrópolis），真福纳匝利亚（圣德肋撒）·马尔奇·梅萨（Nazária a Sancta Terésia March Mesa），童贞。生于西班牙，随家人移民墨西哥，满怀传教热忱，全身心投入拉丁美洲各国贫苦者与急需者之福传事业，创立教会传教十字军修女会（Instítutum Missionariárum Cruciatárum Ecclésiæ）（1943年）。

### 七月六日校注

1. **第7条与第8\\*条次序**：西语版将勃艮第之圣犹斯多排为第7\\*（拉丁第8\\*），莱茵河畔之圣戈阿尔排为第8（拉丁第7），互换了次序。此现象与七月五日第7\\*/第8\\*条之情况一致。本译从拉丁版编号。

2. **第9条（圣多默·莫尔殉道日）**：殉道圣人录按圣人实际殉道日记录。圣多默·莫尔于1535年7月6日在伦敦塔山（Tower Hill）被斩首，其礼仪庆日定于六月二十二日，与同年六月二十二日殉道之若望·费舍尔主教合庆。

3. **第13条人名与地名**：中文教名据香港教区档案处"120位中华殉道圣人"名录确认：圣王作龙伯多禄（Pietro Wang Zuolung）。按香港方面惯例，中国籍圣人之圣名（教名）置于姓名之后。拉丁文作 *Petrus Wang Zuolong*，与香港罗马化拼写 *Zuolung* 略有出入，系同一人名之不同转写。地名双忠（*Shuangzhong*）在今天津市蓟州区（原河北省蓟县）境内。

---

## 七月七日

**Die 7 iúlii** · 七月初七（*Nonis iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
> A B C D E F F G H M N P
> 1 2 3 4 5 6 6 7 8 9 10 11

**1\\.** 纪念亚历山大里亚之圣庞德诺（Pantǽnus），宗徒一般的人物，饱学多智。据传其研习天主圣言之热忱与爱慕至深，以至于因信仰与虔诚所激发，远赴东方极深僻远之地，向当地民族宣讲基督福音。最终返回亚历山大里亚，在卡拉卡拉皇帝（Antonínus Caracálla）治下安息主怀（三世纪）。

**2\\.** 在阿基坦（Aquitánia）莫城（Meldénsis）地区之埃布勒伊（Eboríacum），圣埃迪尔布尔加（Ædilbúrga），法勒穆提耶修院（monastérium Farénse）女院长。为东盎格鲁国王之女，以严格的身体克苦与终身守贞，将光荣归于天主（695年）。

**3\\.** 在英格兰之温切斯特（Vintónia），圣赫达（Hedda），西撒克逊人之主教，以智慧著称。将圣比里诺（Birínus）遗体自多切斯特（Dorcéstria）迁至此城，并在此设立主教座堂（706年）。

**4\\.** 在法兰科尼亚（Francónia）之德里奥波利斯（Drýopolis，今艾希施泰特），圣维利巴尔德（Willibáldus），主教。入修院为修士后，长期朝圣于圣地及各地区，以复兴修道生活。终蒙圣博尼法爵（Bonifátius）召用，受其祝圣为该城首任主教，在日耳曼福传事业中协助博尼法爵，领归许多民族皈依基督（787年）。

**5\\*.** 在爱尔兰之塔拉特（Tamláchtum），圣梅尔·鲁安（Mæl Ruain），主教兼院长，竭力恢复神圣礼仪之举行、诸圣之敬礼及修道纪律（789年）。

**6\\.** 在西班牙加泰罗尼亚（Cataláunia）之乌尔赫尔（Urgéllum），圣奥多（Odo），主教。尚为平信徒时即经民众欢呼推举并获确认，始终维护弱小者权益，待人一律仁慈宽厚（1122年）。

**7\\*.** 在翁布里亚（Umbria）之佩鲁贾（Perúsia），真福教宗本笃十一世（Benedíctus papa XI）善终。出自宣道会（Ordo Prædicatórum），为人仁慈温和，主持正义，热爱和平。在其短暂的在位期间，促进了教会之和平、纪律之整顿及信仰之增长（1304年）。

**8\\*.** 在皮埃蒙特（Subalpína）之福萨诺（Fossánum），真福奥迪诺·巴罗蒂（Oddínus Barotti），司铎。身为堂区主任，清贫度日，生活简朴。瘟疫肆虐之际，日夜竭尽全力照顾病患与垂死者（1400年）。

**9\\*.** 在英格兰之温切斯特，诸真福殉道者：罗杰·迪金森（Rogérius Dickinson），司铎；拉尔夫·米尔纳（Radúlphus Milner），农夫、贫苦一家之主，虽目不识丁却信仰坚定。在伊丽莎白一世女王治下，二人同时被捕，处以绞刑而殉。与二人同日纪念者，尚有真福劳伦斯·汉弗莱（Lauréntius Humphrey），少年时皈依天主教信仰，于日期不详之日在同城被处以绞刑而亡（1591年）。

**10\\*.** 在法国罗什福尔（Rupifórtium）海岸外之海峡中，真福若望·若瑟·朱热·德·圣马丁（Ioánnes Ioséphi Juge de Saint-Martin），司铎、殉道。原为利摩日（Lemovícum）教区法政，法国大革命期间因司铎身份被拘于非人待遇之囚船上，终因染病而归主怀（1794年）。

**11\\*.** 同在法国奥朗日（Arausio），真福依斐热尼亚（圣玛窦）·德·盖亚尔·德·拉·瓦尔代纳（Iphigenía a Sancto Matthǽo [Francísca María Suzánna] de Gaillard de la Valdène），本笃会修女、童贞、殉道，殉于法国大革命期间（1794年）。

**12\\.** 在中国（Sínæ）湖南省（Hunán）衡州城（Hemceuvénsis，今衡阳）附近，圣范怀德，主教，及圣安守仁，司铎，均出自小兄弟会（Ordo Minórum）。在义和团（*Yihetuan*）发动之迫害中，二人乘船抵达岸边以援助信众，被投石打死（1900年）。

**13\\.** 同在中国河北省（*Hebei*）卫辉城（Ueihœivénsis）附近，圣冀天祥马尔谷（Marcus Ji Tianxiang），殉道。因不能戒除鸦片之习而被禁领圣体达三十年之久，但始终不断祈求善终。及至被提上公堂受审，以坚定不移之心宣认基督信仰，遂获享永恒的筵席（1900年）。

**14\\.** 同在河北省深县（*Shenxian*）之胡家村（*Hujiacun*），圣郭李氏玛利亚（María Guo Lizhi），殉道。在同一迫害中，犹如又一位玛加伯母亲（参加下七），陪伴家中七位亲属前往刑场，坚固其心志，请求将自己留至最后处死。最终，追随了她先遣升天的亲人（1900年）。

**15\\*.** 在美拉尼西亚新不列颠岛之拉库奈（*Rakunai*）村，真福伯多禄·多·罗特（Petrus To Rot），殉道。为一家之主兼传道员，第二次世界大战期间，因坚持履行传道职责而被捕，终以注射致命毒素而完成殉道（1945年）。

**16\\*.** 在尼加拉瓜之莱昂（Légio），真福玛利亚·罗梅罗·梅内塞斯（María Romero Meneses），童贞，出自进教之佑孝女会（Instítutum Filiárum Maríæ Auxiliatrícis）。在哥斯达黎加（Ora Díves）致力于少女之教育，尤其关注贫苦及被遗弃之少女，广为传扬对至圣圣体及荣福童贞玛利亚之敬礼（1977年）。

### 七月七日校注

1. **第12条（意大利籍方济各会殉道者）**：范怀德（意大利语 Antonino Fantosati，1842-1900），会名安多尼诺，意大利翁布里亚人，方济各会士，湖南南境宗座代牧。安守仁（意大利语 Giuseppe Maria Gambaro，1869-1900），圣名若瑟，同为意大利籍方济各会士。中文传教名据中华殉道圣人芳名表确认。二人虽为外籍传教士，但因属120位中华殉道圣人之列且在中国已有通行中文名，正文从中文传教名。衡州（*Hemceuvensis*）即今湖南省衡阳市。

2. **第13条人名（冀天祥）**：中文教名据香港教区档案处名录及盐与光传媒核实：圣冀天祥马尔谷。注意姓氏为"冀"（Jì），非"季"。拉丁文作 *Marcus Ji Tianxiang*。冀天祥因鸦片成瘾被禁领圣体三十年，但始终未离弃信仰，坚持祈求善终，终在庚子年迫害中以殉道获得永生，为教会牧灵关怀成瘾者之重要案例。卫辉（*Ueihoeivensis*）在今河南省卫辉市（非河北省），拉丁文作"in *Hebei* provincia"系沿用当时教区划分而非现代行政区划。

3. **第14条人名（郭李氏）**：中文教名据香港教区档案处名录核实：圣妇郭李玛利亚（María Guo Lizhi）。"郭李"为中国传统已婚妇女称谓（夫姓郭、本姓李），拉丁文将全名罗马化为 *Guo Lizhi*。她在迫害中先后将家中七位亲属送上刑场并坚固其信德，最后自己殉道，故拉丁原文以玛加伯母亲（加下七）作比。深县（*Shenxian*）在今河北省深州市。

---

## 七月八日

**Die 8 iúlii** · 七月望日前第八日（*Octávo Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1
> A B C D E F F G H M N P
> 2 3 4 5 6 7 7 8 9 10 11 12

**1\\.** 纪念圣阿桂拉与圣普黎斯加（又名普黎史拉），夫妇。为圣保禄宗徒之助手，在家中接待教会聚会，并为保禄不惜自己的性命（参罗十六3-4）（一世纪）。

**2\\.** 在色雷斯（Thrácia）之赫拉克莱亚（Heracléa），圣格里切里亚（Glycéria），殉道（世纪不详）。

**3\\.** 在巴勒斯坦之凯撒勒雅（Cæsaréa），圣普罗科皮奥（Procópius），殉道。在戴克里先皇帝治下，自斯基托波利斯（Scythópolis）城被押至凯撒勒雅，初次受审即以坦荡之辞作答，随即被判官法比亚诺（Fabiánus）下令斩首（约303年）。

**4\\.** 在西西里（Sicília）之陶尔米纳（Tauroménium），圣庞克拉齐奥（Pancrátius），主教、殉道，据信为该教会之首任主教（世纪不详）。

**5\\.** 在比利时高卢（Gállia Bélgica）之图尔（Tullum），圣奥斯皮齐奥（Auspícius），主教（五世纪）。

**6\\*.** 在莱茵兰（Rhenánia），圣迪西博德（Disibódus），隐修士。召集若干同伴，在纳厄河（Nava）畔建立修院（七世纪）。

**7\\*.** 在布拉班特（Brabántia）之比尔森（Belísia），圣兰德拉达（Landráda），女院长（690年）。

**8\\.** 在奥斯特拉西亚（Austrásía）之维尔茨堡（Herbípolis），圣基利亚诺（Kiliánus），主教、殉道。出自爱尔兰，远赴此地宣讲福音，因严格维护基督徒风纪，遭杀害而完成殉道（七世纪末）。

**9\\.** 在君士坦丁堡，亚巴郎隐修院诸修士（monachi Abrahamítæ）殉道之日。因崇敬圣像，在德奥斐洛（Theóphilus）皇帝治下完成殉道（九世纪）。

**10\\*.** 在艾米利亚（Æmília）之斯皮兰贝托（Spína Lambérti），圣教宗亚德良三世（Hadriánus papa III）善终。竭尽全力促使君士坦丁堡教会与罗马教会和好。在赴高卢途中染重病，至圣地辞世（885年）。

**11\\*.** 在拉齐奥之蒂沃利（Tíbur），真福教宗安日纳三世（Eugénius papa III）善终。为圣伯尔纳铎（Bernárdus）之爱徒，曾任"三泉"（Aquæ Sálviæ）圣味增爵与亚纳斯大削修院院长。当选罗马教宗后，竭力保卫罗马城基督子民免受不信者之阴谋侵害，并致力于教会纪律之改善（1153年）。

**12\\*.** 在日本之岛原（Shimabára），真福曼肖·荒木弘左衛門（Máncius Araki，罗马化作 Kyūzaburō，日文作ひろ左衛門 Hirozaemon），殉道。因在家中收留真福方济各·帕切科（Francíscus Pacheco）司铎，被投入监狱，在狱中因痨病耗尽而亡（1626年）。

**13\\.** 在中国河北省（*Hebei*）永年城（Iomnienína），圣武文印若望（Ioánnis Wu Wenyin），殉道。为传道员，在义和团（*Yihetuan*）发动之迫害中，因拒绝弃绝基督教义而投向异教，被判斩首（1900年）。

### 七月八日校注

1. **第1条（阿桂拉与普黎斯加）**：人名从思高圣经。阿桂拉（Aquila）见宗十八2，普黎斯加（Prisca）见罗十六3，普黎史拉（Priscilla）见宗十八2。拉丁原文作 *Priscæ seu Priscillæ*（"普黎斯加或普黎史拉"），二名为同一人之正式名与昵称。

2. **第11\\*条教宗译名**：Eugenius 译"安日纳"，从梵蒂冈新闻网中文版所用定式。

3. **第13条人名与地名**：中文教名据香港教区档案处名录核实：圣武文印若望。拉丁文作 *Ioánnis Wu Wenyin*。永年（*Iomnienina*）在今河北省永年区（邯郸市）。

---

## 七月九日

**Die 9 iúlii** · 七月望日前第七日（*Séptimo Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2
> A B C D E F F G H M N P
> 3 4 5 6 7 8 8 9 10 11 12 13

**1\\.** 圣赵荣奥斯定，司铎，圣白多禄，主教，及同伴诸圣殉道者。在中国各地，于不同时代，以言行刚毅地为基督福音作证，因宣讲或宣认信仰而成为迫害之牺牲，在光荣的天宴中得享安慰（十七至二十世纪）。

**2\\*.** 在艾米利亚之雷焦（Régium Lépidi），真福若安纳·斯科佩利（Ioánna Scopelli），加尔默罗会修女、童贞。以市民捐赠创建修院，并以祈祷在餐厅中为修女们获取食粮（1491年）。

**3\\*.** 在英格兰之伦敦，真福亚德良·福蒂斯丘（Hadriánus Fortescue），殉道。为一家之主兼骑士，在亨利八世治下被诬告叛国，两度入狱，最终被斩首而完成殉道（1539年）。

**4\\.** 在荷兰马斯河畔之布里勒（Briéla），圣尼各老·皮克（Nicoláus Pieck），司铎，及方济各小兄弟会十位同伴与教区及修会八位司铎，诸圣殉道之日。为捍卫基督在圣体中的真实临在及罗马教会之权威，受加尔文派种种凌辱与酷刑，最终被处以绞刑而完成殉道（1572年）。

**5\\.** 在翁布里亚之蒂费尔诺·蒂伯利诺（Tiférnum Tiberínum，今城堡城），圣维罗尼加·朱利亚尼（Verónica Giuliani），嘉布遣方济各贫穷修女会女院长。蒙赐神恩，身心与基督苦难相通。因此被看管五十日之久，呈现出忍耐与服从之奇妙典范（1685年）。

**6\\*.** 在法国普罗旺斯之奥朗日（Arausio），真福梅拉妮及玛利亚·安纳·玛达肋纳·德·基耶尔米耶（María Anna Magdaléna de Guilhermier），暨真福玛利亚·安纳·玛尔格丽特（天使）·德·罗谢（María Anna Margaríta ab Ángelis de Rocher），圣乌尔苏拉修女会（Ordo Sanctæ Úrsulæ）修女、童贞、殉道，殉于法国大革命期间（1794年）。

**7\\.** 在中国贵州省（*Guizhou*）贵阳城（Cœiiaménsis），圣郝开枝若亚敬（Ióachim He Kaizhi），殉道，传道员，因坚守基督信仰而遭绞杀（1839年）。

**8\\.** 在中国山西省（*Shanxi*）太原城（Tæiuenénsis），圣艾士杰及圣富格辣，主教，均出自小兄弟会（Ordo Fratrum Minórum），及二十四位同伴，诸圣殉道之日。在义和团（*Yihetuan*）发动之迫害中，迫害者出于对基督之名的仇恨将他们杀害（1900年）。

**9\\.** 在巴西之圣保罗（Paulópolis），圣保利纳（耶稣苦痛圣心）·维辛泰纳（Paulína a Corde Iesu Agonizánte [Amábilis] Visintainer），童贞。少女时期自意大利移民巴西，创立无原罪始胎小姐妹会（Congregátio Parvárum Sorórum Immaculátæ Conceptiónis），服务病患与贫苦者。历经诸多艰辛，以极深之谦逊与恒心祈祷服务修会（1942年）。

**10\\*.** 在德国巴伐利亚慕尼黑附近之达豪（Dachánum），真福斐德理斯·希纳茨基（Fidélis Chijnacki），嘉布遣小兄弟会修士、殉道。在波兰被邪恶政权强制送入集中营，因宣认基督信仰，历经酷刑折磨而获享永恒光荣（1942年）。

### 七月九日校注

1. **第1条（中华殉道诸圣庆日）**：本条为120位中华殉道圣人之总庆日，正文仅列代表性二人：中国籍司铎赵荣（奥斯定，Augustinus Zhao Rong，1746-1815）及西班牙籍多明我会主教白多禄（桑实，Pedro Sans i Jordà, OP，1680-1747，福建宗座代牧）。中文教名据维基百科"中华殉道圣人"条目及香港教区档案处名录核实。拉丁原版第378-379页脚注1列出全部同伴圣人芳名，含主教6位、司铎24位、修士1位、修女7位及平信徒82位，分属方济各会、多明我会、耶稣会、巴黎外方传教会、宗座外方传教会、慈幼会、遣使会及各教区。各人之个别赞辞分布于全年各日，已翻译者见七月一日第13条（张怀禄）、七月三日第12条（赵明振、赵明喜）、七月四日第15条（董哲西）、七月五日第11条（陈金婕、陈爱婕）、七月六日第13条（王作龙）、七月七日第12-14条（范怀德、安守仁、冀天祥、郭李氏）、七月八日第13条（武文印）、本日第7-8条（郝开枝、太原殉道者）、七月十日第13条（阮有琼、阮克自）、七月十一日第15条（安辛、安郭、安焦、安灵花）、七月十二日第12条（王贵新）、七月十三日第16-17条（刘进德、王贵吉）、七月十四日第12条（王贵新）、七月十六日第16-17条（郎杨氏/郎福、张何氏）、七月十七日第15条（刘子玉）、七月十九日第11-12条（朱五瑞、秦边氏、秦春福）、七月二十日第12-16条（任德芬、汤爱玲、朱吴氏、朱日新、傅桂林、赵郭氏、赵罗撒、赵玛利亚、郗柱子）、七月二十一日第7-8条（郭西德、王玉梅）、七月二十二日第14-15条（王安纳、王王氏、王天庆、王李氏）、七月二十九日第13条（张文澜、陈昌品、娄廷荫、王骆氏）、七月三十日第9条（袁庚寅）、八月八日第13条（柯廷柱）、八月十六日第13条（樊惠）。

2. **第4条（戈尔库姆殉道者）**：拉丁原版脚注2列出全部同伴芳名。此为1572年荷兰独立战争期间被加尔文派"海上乞丐"在布里勒杀害的19位天主教殉道者，含方济各会士11人及教区和修会司铎8人。

3. **第7条人名**：中文教名据中华殉道圣人芳名表核实，作"郝开枝"（姓郝，非何），拉丁文罗马化 *He Kaizhi* 系从方言音。贵阳（*Coeiamensis*）为贵州省省会。

4. **第8条（太原殉道者）**：艾士杰（意大利语 Gregorio Grassi, OFM，1833-1900），太原宗座代牧；富格辣（意大利语 Francesco Fogolla, OFM，1839-1900），助理主教。拉丁原版脚注3列出24位同伴：含方济各会司铎雷体仁（Elias Facchini）、德奥理（Theodoricus Balat）、安振德修士（Andreas Bauer）；玛利亚方济各传教修女会修女7位；及中国籍修士与平信徒。

---

## 七月十日

**Die 10 iúlii** · 七月望日前第六日（*Sexto Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3
> A B C D E F F G H M N P
> 4 5 6 7 8 9 9 10 11 12 13 14

**1\\.** 在罗马，诸圣殉道者：斐理斯与斐理伯在普黎史拉墓地，维达理、玛尔齐亚理与亚历山大在约尔达诺（Iordanórum）墓地，西拉诺在马西莫墓地，雅努阿里奥在普雷特斯塔托（Prætextátus）墓地。罗马教会以同一日联合纪念他们，在如此众多的凯旋中受到光荣，因众多的表率与丰厚的代祷而获得坚固（世纪不详）。

**2\\.** 在罗马城第九里程碑之科尔内利亚大道（Via Cornélia），圣鲁斐纳（Rufína）与圣塞孔达（Secúnda），殉道（世纪不详）。

**3\\.** 在萨比纳（Sabína），圣阿纳多利亚（Anatólia）与圣维多利亚（Victória），殉道（世纪不详）。

**4\\.** 在非洲，圣雅努阿里奥（Ianuárius）与圣玛里诺（Marínus），殉道（世纪不详）。

**5\\.** 在吕考尼亚（Lycaónia）之依科尼雍（Icónium），圣阿波罗尼奥·撒尔德（Apollónius Sardénsis），殉道，据传以十字架之刑完成殉道（世纪不详）。

**6\\.** 在亚美尼亚之尼科波利（Nicópolis），圣良齐奥（Leóntius）、毛里齐奥（Maurítius）、达尼尔（Daniél）、安多尼（Antónius）、阿尼切多（Anicétus）、西辛尼奥（Sisínnius）等诸圣殉道者，在李锡尼皇帝（Licínius）及总督利西亚（Lýsia）治下受各种酷刑后殉道（四世纪）。

**7\\.** 在皮西迪亚（Pisídia），圣比亚诺尔（Biánor）与圣西尔瓦诺（Silvánus），殉道（四世纪）。

**8\\*.** 在布列塔尼（Británnia Minor）之南特（Nannétes），圣帕斯卡里奥（Paschârius），主教。自丰特内尔（Fontanélla）修院邀请圣赫尔梅兰德（Hermélándus）偕十二位同伴前来，安置于安特尔岛（Antro ínsula），以创建修院（七世纪）。

**9\\.** 在佛兰德（Flándria）之塔米斯（Tamísia），圣阿玛尔贝加（Amalbérga），由圣维利布罗德（Willibrórdus）为其覆以奉献贞女之面纱（八世纪）。

**10\\*.** 在翁布里亚之佩鲁贾，圣伯多禄·文齐奥利（Petrus Vincioli），司铎兼院长。重建圣伯多禄古教堂使其免于坍塌，并增设修院。虽屡遭反对，仍以极大耐心引入克吕尼（Cluniacénses）修道惯例（1007年）。

**11\\.** 在丹麦之欧登塞（Ottónia），圣加努多（Canútus），殉道。身为国王，以热忱推广国中天主敬礼，提升教士地位，创建隆德（Lund）及欧登塞教会。最终被叛乱市民杀害（1086年）。

**12\\*.** 在法国普罗旺斯之奥朗日（Arausio），真福玛利亚·日多德（圣索菲亚）·德·里佩尔·达洛赞（María Gertrúdis a Sancta Sophía de Ripert d'Alauzin），及真福依搦斯（耶稣，本名西尔维亚）·德·罗米翁（Agnétis a Iesu [Sýlviæ] de Romillon），圣乌尔苏拉修女会修女、童贞、殉道，殉于法国大革命期间（1794年）。

**13\\.** 在安南（Annámia）之洞海城（*Đồng Hới*），圣阮有琼安多尼（Antónius Nguyễn Hữu [Năm] Quỳnh）及圣阮克自伯多禄（Petrus Nguyễn Khắc Tự），殉道。二人均为传道员，在明命帝（Minh Mạng）治下因基督信仰而遭绞杀（1840年）。

**14\\*.** 在叙利亚之大马士革（Damáscus），真福厄玛奴耳·鲁伊斯（Emmanuélis Ruiz），司铎，及同伴诸真福殉道之日：方济各小兄弟会七人与马龙尼礼教会三位同胞兄弟。被叛徒出卖交于敌手，因信仰受种种折磨，以光荣之死完成殉道（1860年）。

### 七月十日校注

1. **第5条（阿波罗尼奥·撒尔德）**：Sardensis = 撒尔德人，地名撒尔德从思高圣经（默三1"撒尔德教会"）。依科尼雍从思高（宗十三51）。

2. **第13条（越南殉道圣人）**：1840年越南官方文字仍为汉字，但现存线上资料（圣座宣圣诏书、越南主教团、越南天主教传记）均只给拉丁文或越南国语字拼写，未直接给出汉字原名。正文所用汉字系据标准汉越对应推定，可信度不一：

> "阮有琼"（Nguyễn Hữu Quỳnh）：阮=Nguyễn、有=Hữu 均无歧义；琼（瓊）=Quỳnh 为最常见对应，可信度中等偏高，但 Quỳnh 亦有其他同音汉字，未见原件不能完全确定。
>
> "阮克自"（Nguyễn Khắc Tự）：克=Khắc 无歧义；但 Tự 在汉越字典中对应汉字多达二十余个（自、字、寺、序、敘等），"自"仅为其中之一，可信度较低。另据越南主教团介绍之巴黎外方传教会（MEP）所藏殉道画（第11幅），画中阮克自头上标注被释读为"Văn Tự"而非"Khắc Tự"，可能是另一称呼变体或画师标注，有待高清原件确认。如日后查得广平省呈明命帝之行刑报告原件或 MEP 殉道画汉字木牌，应据实修正。

> 阮有琼为医生兼传道员（越南文作 *trùm họ*，堂区首领），*Năm* 为其通称，因排行第五（越南语 năm = 五）。阮克自为传道员（越南文作 *thầy giảng*）。二人于明命帝（Minh Mạng）二十一年在广平省洞海（Đồng Hới，今越南广平省省会）殉道。

3. **第14\\*条（大马士革殉道者）**：拉丁原版脚注4列出同伴芳名。方济各会七人为：加尔默洛·沃尔塔（Carmelus Volta）、伯多禄·索莱尔（Petrus Soler）、尼各老·阿尔贝卡（Nicolaus Alberca）、恩格尔贝尔特·科兰德（Engelbertus Kolland）、阿斯卡尼奥·尼卡诺尔（Ascanius Nicanor）五位司铎，及方济各·皮纳佐（Franciscus Pinazo）、若望·雅各伯·费尔南德斯（Ioannes Iacobus Fernández）二位修士。马龙尼礼三位平信徒为马萨布基（Massabki）三兄弟：方济各、穆齐奥、辣法耳。

---

## 七月十一日

**Die 11 iúlii** · 七月望日前第五日（*Quinto Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4
> A B C D E F F G H M N P
> 5 6 7 8 9 10 10 11 12 13 14 15

**1\\.** 纪念圣本笃（Benedíctus），院长。生于翁布里亚之努西亚（Núrsia），在罗马受教育，于苏比亚科（Sublacénsis）地区开始隐修生活，聚集众多弟子。后移居卡西诺（Casínum），在此建立著名修院并制定会规。此会规传遍各地，使他当之无愧地被尊为西方修士之宗祖。据传于三月二十一日安逝（547年）。

**2\\.** 在罗马，纪念圣教宗庇护一世（Pius papa I）。为《牧人书》（*Pastor*）作者何而马（Hermas）之兄弟，本人亦为善牧，守护教会十五年（155年）。

**3\\.** 在吕考尼亚之依科尼雍（Icónium），圣玛尔齐亚诺（Marciánus），殉道，在总督佩伦尼奥（Perénnio）治下历经诸多酷刑后获得殉道之荣冠（三至四世纪）。

**4\\.** 在毛里塔尼亚之凯撒勒雅（Cæsaréa），圣玛尔齐亚纳（Marciána），童贞，被投于猛兽而完成殉道（约303年）。

**5\\*.** 在阿基坦之波尔多（Búrdigala），圣良齐奥（Leóntius），主教。为民众与城市之光荣，修建圣殿，修复圣洗堂，默默周济贫苦者（约570年）。

**6\\*.** 在苏格兰之瓦尔河口（*ad Varæ æstuárium*，今迪尔），圣德罗斯坦（Drostánus），院长，曾管理多座修院，最终度隐修生活（六世纪末）。

**7\\*.** 在上雷蒂亚（Rǽtia Superior，今瑞士）之迪森蒂斯（Desertína），圣普拉齐多（Plácidus），殉道，与圣西吉斯贝尔特（Sigisbértus），院长。前者为圣高隆邦（Columbánus）之同伴，在此地建立圣玛尔定修院，并在修院中以殉道为修道生活加冕（七世纪）。

**8\\*.** 在孚日山（Vósegus）之穆瓦延穆蒂耶修院（monastérium Mediánum），圣伊杜尔夫（Hidúlphus）。曾任特里尔辅理主教（chorepíscopus），后隐退独居，因弟子纷纷前来，遂建立修院并管理之（707年）。

**9\\.** 在西班牙汪达尔地区（Vandálica，今安达卢西亚）之科尔多瓦（Córduba），圣阿本迪奥（Abúndius），司铎。在摩尔人迫害中，受法官审问时以无畏之辞阐明信仰之理，激怒审判者，当即被处死，尸身被弃于犬兽吞食（854年）。

**10\\.** 在罗斯之基辅（Kióvia），圣奥尔加（Olga），圣弗拉基米尔（Vladimírus）之祖母。为留里克（Rurikid）王朝中首位领受洗礼者，同时取名海伦娜（Héléna），为全罗斯人民铺平了归向基督之路（969年）。

**11\\*.** 在法国图卢兹地区之格朗塞尔夫修院（monastérium Grandis Silvæ），真福贝尔特朗（Bertrandus），院长。为确立修会纪律，将其修院归入熙笃会（Ordo Cisterciénsis）（1149年）。

**12\\*.** 在丹麦之维堡（Vibúrgum），圣凯蒂洛（Ketíllus），司铎兼律修法政（canónicus reguláris），在座堂学校中极为勤勉，堪为修道生活之表率（约1151年）。

**13\\*.** 在英格兰之林肯（Lincólnia），纪念真福多默·本斯特德（Thomas Benstead）与多默·斯普罗特（Thomas Sprott），司铎、殉道。在伊丽莎白一世女王治下因司铎身份而被处死，殉道确切日期在本月内不详（1600年）。

**14\\*.** 在法国普罗旺斯之奥朗日（Arausio），真福罗莎利亚·克洛蒂尔德（圣佩拉贾）·贝斯（Rosália Clotíldis a Sancta Pelágia Bès），玛利亚·依撒伯尔（圣特奥克蒂斯托）·佩利西耶（María Elísabeth a Sancto Theoctísto Pélissier），玛利亚·佳兰（圣玛尔定）·布朗克（María Clara a Sancto Martíno Blanc），及玛利亚·玛尔格丽特（圣索菲亚）·德·巴尔贝日·达尔巴雷德（María Margaríta a Sancta Sophía de Barbegie d'Albarède），童贞、殉道，因基督信仰殉于法国大革命期间（1794年）。

**15\\.** 在中国河北省（*Hebei*）安平（*Anping*）附近之刘宫营（*Liugongyin*），圣安辛安纳（Anna An Xinzhi）、圣安郭玛利亚（María An Guozhi）、圣安焦安纳（Anna An Jiaozhi）及圣安灵花玛利亚（María An Lihua），童贞、殉道。义和团（*Yihetuan*）发动之迫害中，因无论如何不肯弃教从邪，被斩首处死（1900年）。

### 七月十一日校注

1. **第1条（圣本笃）**：圣本笃为本日首条，但其礼仪庆日在公历中定为七月十一日，殉道圣人录按传统死亡日三月二十一日记录并在此日交叉提及。本笃、卡西诺、会规等均从教会中文定例。

2. **第5\\*条译名（良齐奥）**：Leontius 与教宗名 Leo（良）同源，均出自希腊语 λέων（leōn，狮子）。译"良齐奥"以体现词源关系。

3. **第9条地名**：*Vandálica Hispániae regione* 直译为"西班牙之汪达尔地区"，因公元5世纪汪达尔人途经此地而得名，即今安达卢西亚（Andalucía，一说源自 Vandalusia → al-Andalus）。

4. **第10条（圣奥尔加）**：奥尔加为东西方教会共同敬奉之圣人（东正教纪念日7月11日旧历）。弗拉基米尔从世俗通行译法。基辅（Kiovia）为今乌克兰首都。

5. **第11\\*条地名**：*monastérium Grandis Silvæ* 意为"大森林修院"（grandis = 大，silva = 森林）。法语地名 Grandselve 直接来自此拉丁语义。格朗塞尔夫修院（Abbaye de Grandselve）为图卢兹附近之熙笃会修院，约1114年创建，法国大革命中被毁。

6. **第15条人名**：中文教名据中华殉道圣人芳名表核实，四人均姓安。芳名表所载短名为安辛、安郭、安焦、安灵花；拉丁文则作 An Xinzhi、An Guozhi、An Jiaozhi、An Lihua，前三人多出一个"zhi"音节（可能是辈分字"芝"，芳名表省略之），第四人拉丁文 Lihua 与芳名表"灵花"（Linghua）读音不合，可能系不同方言罗马化所致。正文从芳名表所载形式。安平（*Anping*）在今河北省衡水市安平县。

---

## 七月十二日

**Die 12 iúlii** · 七月望日前第四日（*Quarto Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5
> A B C D E F F G H M N P
> 6 7 8 9 10 11 11 12 13 14 15 16

**1\\.** 在迦拉达（Galátia）之安基拉（Ancýra），圣普罗科洛（Próclus）与圣依拉里翁（Hilarion），殉道，在特拉真皇帝（Traiánus）及总督马西莫（Máximus）治下（二世纪）。

**2\\.** 在威尼托（Venétia）之阿奎莱亚（Aquiléia），圣福尔图纳多（Fortunátus）与圣赫尔马戈拉（Hermágoras），殉道（三世纪）。

**3\\.** 在利古里亚（Ligúria）之米兰（Mediólánum），圣纳博尔（Nabor）与圣斐理斯（Felix），殉道。二人为毛里塔尼亚出身之军士，据传于劳斯·庞佩亚（Laus Pompéia，今洛迪）在迫害中受难，安葬于米兰（约304年）。

**4\\.** 在意大利皮切诺（Picénum）之法诺（Fanum），圣帕特尔尼亚诺（Paterniánus），主教（四世纪）。

**5\\.** 在高卢之里昂（Lugdúnum），圣维文齐奥洛（Viventiólus），主教。自圣厄乌真德（Eugéndus）修院学校擢升为主教，促使教士与平信徒出席埃帕奥内（Epaonénsis）教省会议，使教众更好地了解教宗之法规（约523年）。

**6\\.** 在厄特鲁里亚（Etrúria，托斯卡纳）之帕西尼亚诺（Passiniánum），圣若望·圭阿尔贝托（Ioánnes Gualbértus），院长。为佛罗伦萨军人，因基督之爱宽恕了杀害其兄长的凶手，遂领受修士会衣。后志于更严格的修道生活，在瓦隆布罗萨（Vallis Umbrósa）奠定了新修道团体之基础（1073年）。

**7\\*.** 在坎帕尼亚之卡瓦修院（monastérium Cavénse），圣莱奥（Leo），首任院长，以亲手劳作供养贫苦者，并在王公面前保护他们（1079年）。

**8\\*.** 在英格兰伦敦附近，真福达味·冈斯顿（Dávidis Gunston），殉道。为耶路撒冷圣若望骑士团骑士，拒绝承认亨利八世对教会事务的最高权威，被处以绞刑于南华克（Southvárcum）刑场（1541年）。

**9\\.** 同在伦敦，圣若望·琼斯（Ioánnes Jones），方济各小兄弟会司铎、殉道。威尔士人（Cambriénsis），在法国入修会。在伊丽莎白一世女王治下，因以司铎身份进入英格兰被判死刑，处以绞刑至死而完成殉道（1598年）。

**10\\*.** 在日本之长崎（Nagasáki），真福玛弟亚·荒木（Matthías Araki）及七位同伴殉道者，为基督承受殉道之苦（1626年）。

**11\\*.** 在法国普罗旺斯之奥朗日（Arausio），真福罗莎（圣方济各·沙勿略，本名玛达肋纳·德肋撒）·塔利安（Rosa a Sancto Xavério [Magdaléna Terésia] Tallien），玛尔大（善天使，本名玛利亚）·克吕斯（Martha a Bono Ángelo [María] Cluse），玛利亚（圣恩里科，本名玛尔格丽特·厄莱奥诺辣）·德·朱斯塔蒙（María a Sancto Henríco [Margaríta Eleonóra] de Justamond），及若安纳·玛利亚（圣伯尔纳铎）·德·罗米翁（Ioánna María a Sancto Bernárdo de Romillon），童贞、殉道，于法国大革命肆虐之际获得殉道之荣冠（1794年）。

**12\\.** 在东京（Tunquínum，越南北部）之南定城（*Nam Định*），圣克莱孟·依纳爵·德尔加多·塞布里安（Clemens Ignátius Delgado Cebrián），主教、殉道。在福音宣讲中度过五十年后，明命帝（Minh Mạng）以基督信仰为由下令将其逮捕，备受磨难，卒于狱中（1838年）。

**13\\.** 同在东京之宁平省（*Ninh Bình*），圣黎氏成依搦斯（Agnétis Lê Thị Thành [Đê]），殉道。为一家之母，在绍治帝（Thiệu Trị）治下因在家中藏匿司铎而受酷刑折磨，拒绝背弃信仰，死于狱中（1841年）。

**14\\.** 在安南（Annámia）之义安省（*Nghệ An*），圣庆伯多禄（Petrus Khanh），司铎、殉道。在税关被认出为基督徒，被拘禁六个月，屡受引诱弃教而不从，终奉绍治帝之命被斩首（1842年）。

### 七月十二日校注

1. **第1条**：本条拉丁原文在所提供图版中未出现（当在原版第383页末），据西语版补译。迦拉达从思高圣经（迦一2）。安基拉（Ancyra）即今土耳其安卡拉。

2. **第10\\*条（长崎殉道者）**：拉丁原版脚注5列出七位同伴：伯多禄·荒木与苏珊纳，夫妇；若望·田中与加大利纳，夫妇；若望·永井与莫尼加，夫妇；及其子路多维科，少年。

3. **第12-14条（越南殉道圣人）**：本日含三条越南殉道者。第12条之克莱孟·依纳爵·德尔加多·塞布里安（西班牙语 Clemente Ignacio Delgado y Cebrián, OP，1761-1838）为西班牙籍多明我会士，东京东境宗座代牧，正文从西班牙语音译。南定（Nam Định）、宁平（Ninh Bình）、义安（Nghệ An）均为越南地名之汉字原形，无歧义。东京（Tunquinum，越南语 Đông Kinh）为越南北部之历史称谓。

4. **第13条人名**：黎氏成（Lê Thị Thành）之汉字推定：黎=Lê（无歧义），氏=Thị（无歧义，越南已婚妇女传统用字），成=Thành（中等偏高，亦可为诚、城）。Đê 为其别名，汉字未详。绍治帝（Thiệu Trị，1841-1847在位）为阮朝第三代皇帝。

5. **第14条人名**：拉丁文仅作 *Petrus Khanh*，无姓氏。Khanh 之汉字推定为"庆"（Khánh），为最常见对应，可信度中等偏高，但因拉丁文未标声调，亦存其他可能。绍治帝同上条。

---

## 七月十三日

**Die 13 iúlii** · 七月望日前第三日（*Tértio Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6
> A B C D E F F G H M N P
> 7 8 9 10 11 12 12 13 14 15 16 17

**1\\.** 圣亨利（Henrícus），罗马人的皇帝。偕妻圣库内贡德（Cunegúndis）致力于革新教会生活并在全欧洲传播基督信仰，因传教热忱设立多处主教座堂并创建修院。在法兰科尼亚哥廷根（Gottínga）附近之格罗纳（Grona）于此日辞世（1024年）。

**2\\.** 纪念圣厄斯德拉（Esdras），司祭兼经师。在波斯王阿达薛西斯（Artaxérxis）时代，自巴比伦返回犹大，聚集四散之民，竭力研究、遵行并教导上主的法律于以色列（参厄上七10）。

**3\\.** 纪念圣息拉（Silas），蒙宗徒派遣往外邦各教会，偕圣保禄与巴尔纳伯同行，充满天主恩宠，恒心完成宣讲使命（参宗十五22-40）（一世纪）。

**4\\.** 在埃及之亚历山大里亚，圣塞拉皮翁（Serápio），殉道，在塞维鲁皇帝（Septímius Sevérus）及总督阿奎拉（Áquila）治下以火刑获得殉道之冠（约212年）。

**5\\.** 在希俄斯岛（Chios），圣米罗皮斯（Mýropis），殉道（三至四世纪）。

**6\\.** 在弗里吉亚（Phrýgia）之斐洛梅利翁（Philomélium），圣亚历山大及三十名军士诸圣殉道者，据传在皮西迪亚之安提约基雅（Antiochía Pisídiæ）总督马格诺（Magnus）治下受难（四世纪）。

**7\\.** 在阿基坦之阿尔比（Albia），迦太基主教圣安日纳（Eugénius）善终。以信德与诸德著称，在汪达尔人迫害中被放逐（501年）。

**8\\.** 在布列塔尼（Británnia Minor），圣图里亚沃（Turiávus），多尔（Dolénsis）修院院长兼主教（七至八世纪）。

**9\\*.** 在利古里亚之热那亚（Génua），真福雅各伯·德·沃拉吉内（Iacóbus de Vorágine），主教，出自宣道会（Ordo Prædicatórum）。为促进民间基督徒生活，在其著作中列举了众多圣德典范（1298年）。

**10\\*.** 在英格兰之诺里奇（Norvícum），真福多默·顿斯托尔（Thomas Tunstal），本笃会司铎、殉道。在詹姆斯一世治下，因以司铎身份进入英格兰被判死刑，处以绞刑（1616年）。

**11\\*.** 在法国罗什福尔（Rupifórtium）海岸外停泊于海上之污秽囚船中，真福路易·阿尔芒·若瑟·阿当（Ludovícus Armándus Ioséphi Adam），方济各小兄弟会士，及真福巴尔多禄茂·雅里热·德·拉·莫雷利·德·比亚尔（Bartholomǽus Jarrige de la Morélie de Biars），司铎、殉道。因迫害教会之故以司铎身份被判处苦役船刑，染疫后在照顾同船囚友中牺牲（1794年）。

**12\\*.** 在法国普罗旺斯之奥朗日（Arausio），真福玛达肋纳（天主之母，本名依撒伯尔）·韦尔希耶尔（Magdaléna a Matre Dei [Elísabeth] Verchière）及五位同伴，童贞、殉道，殉于同一迫害期间（1794年）。

**13\\.** 在交趾支那（Cocincína）之朱笃城（*Châu Đốc*），圣黎文奉厄玛奴耳（Emmanuélis Lê Văn Phụng），殉道。为一家之父，虽身陷囹圄，不断劝勉子女与家人以爱德对待仇敌，终奉嗣德帝（Tự Đức）之命被斩首（1859年）。

**14\\.** 在弗拉米尼亚（Flamínia）之布德里亚（Búdria），圣克莱利亚·巴尔比耶里（Clélia Barbieri），童贞。致力于少女之灵性福祉，创立痛苦圣母小修女会（Congregátio Minimárum a Vírgine Perdolénti），以仁爱与基督精神教育贫苦无依之少女（1870年）。

**15\\*.** 在意大利博洛尼亚（Bonónia）附近之加莱亚塔（Galeátia），真福斐迪南·玛利亚·巴奇利耶里（Ferdinándus María Baccilieri），司铎。全心牧养所托之民，为帮助贫困家庭并教育少女创立圣母仆人会（Congregátio Servárum Maríæ）（1893年）。

**16\\.** 在中国河北省（*Hebei*）衡水（*Hengshui*）附近之郎子桥（*Langziqiao*），圣刘进德保禄（Paulus Liu Jinde），殉道。年已高迈，义和团（*Yihetuan*）发动之迫害中为村中唯一留守之基督徒，手持念珠与经书迎向迫害者，以基督徒礼节向他们致意，当即被杀（1900年）。

**17\\.** 同在河北省之南宫城（*Nangong*），圣王贵吉若瑟（Ioséphi Wang Guiji），殉道。在同一迫害中，放弃以小小谎言保全性命之机会，宁愿为基督承受光荣之死（1900年）。

**18\\*.** 在哥伦比亚之安戈斯图拉（*Angostura*），真福玛里亚诺（耶稣）·厄乌塞·奥约斯（Mariánus a Iesu Euse Hoyos），司铎。为人纯朴正直，全身心投入祈祷、研学及儿童之基督徒教育（1926年）。

**19\\*.** 在波多黎各之圣胡安（Ioánnipolis Portus Dívitis），真福卡洛斯·厄玛奴耳·罗德里格斯·圣地亚哥（Cárolus Emmanuélis Rodríguez Santiago），不倦地致力于神圣礼仪之革新及青年信仰之激励（1963年）。

### 七月十三日校注

1. **第2-3条（圣经人物）**：厄斯德拉从思高圣经（厄上七10），息拉从思高（宗十五22），阿达薛西斯从思高（厄上七1）。

2. **第9\\*条（雅各伯·德·沃拉吉内）**：即《金传奇》（*Legenda Aurea*）之作者。Voragine 之拉丁文本为 *de Voragine*（深渊），但实际指意大利利古里亚之瓦拉泽（Varazze）。

3. **第12\\*条（奥朗日殉道修女）**：拉丁原版脚注6列出五位同伴：德肋撒·恩里加（天主报喜）·福里耶（Terésia Henríca ab Annuntiatióne Faurie），安纳·安德肋亚（圣亚肋西斯）·米纽特（Anna Andréa a Sancto Aléxio Minutte），玛利亚·安纳（圣方济各）·兰贝尔（María Anna a Sancto Francísco Lambert），玛利亚·安纳（圣方济加）·德佩耶尔（María Anna a Sancta Francísca Depeyre），及玛利亚·亚纳斯大削（圣日尔瓦西奥）·德·罗卡尔（María Anastásia a Sancto Gervásio de Roquard）。至本条为止，奥朗日殉道修女已连续第七日出现（7/6、7/7、7/9、7/10、7/11、7/12、7/13）。

4. **第13条（越南殉道圣人）**：黎文奉（Lê Văn Phụng）之汉字推定：黎=Lê（无歧义），文=Văn（无歧义），奉=Phụng（中等偏高，亦可为凤/鳳，但"奉"为最常见对应）。朱笃（Châu Đốc）在今越南安江省。嗣德帝（Tự Đức，1847-1883在位）为阮朝第四代皇帝。交趾支那（Cochinchina）为越南南部之历史称谓。

5. **第16-17条人名**：据 Asia Harvest 中华殉道圣人资料核实：圣刘进德保禄（Paul Liu Jinde），79岁，衡水县郎子桥（Langziqiao）村人。圣王贵吉若瑟（Joseph Wang Guiji），27岁，据同一资料在蓟州县"双冢村"，但拉丁文作"in urbe Nangong"（南宫城），二者不一致，从拉丁文。

6. **第19\\*条地名**：*Ioánnipolis Portus Dívitis* 为拉丁语"富港之若望城"，即波多黎各圣胡安（San Juan de Puerto Rico）。Portus Dives（富港）= Puerto Rico（西班牙语"富港"）。

---

## 七月十四日

**Die 14 iúlii** · 七月望日前一日（*Prídie Idus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7
> A B C D E F F G H M N P
> 8 9 10 11 12 13 13 14 15 16 17 18

**1\\.** 圣加弥禄·德·莱利斯（Camíllus de Lellis），司铎。生于阿布鲁佐（Aprútium）泰亚诺（Theánum）附近。自少年即从军，沉溺于世俗恶习，后幡然悔改，在不治之症医院中服务病患，视病人如同基督本人，竭尽全力。晋铎后在罗马奠定灵医会（Congregátio Clericórum Regulárium infírmis ministràntium）之基础（1614年）。

**2\\.** 在威尼托之布雷西亚（Bríxia），圣奥普塔齐亚诺（Optatiánus），主教。联署了米兰主教厄乌塞比奥（Eusébius）致教宗圣良关于天主教降生奥迹信仰之会议通函（五世纪）。

**3\\*.** 在奥斯特拉西亚（Austrásía）布拉班特之苏瓦尼（Sonégia），圣味增爵（又名玛德尔加里奥，Madelgárius），偕妻圣瓦尔德特鲁德（Valdetrúdis）同意后，弃俗入修。据传创建两座修院（约677年）。

**4\\.** 在弗利西亚（Frísia）之代芬特尔（Davéntria），圣玛尔凯尔莫（Marchélmus），司铎兼修士，盎格鲁人。自幼即为圣维利布罗德（Willibrórdus）之弟子，并为其基督事业之伙伴（约775年）。

**5\\*.** 在波希米亚（Bohémia）埃格尔（Egra）附近之*斯塔里·金斯佩尔克*（*Stáry Kynsperk*），真福赫罗兹纳塔（Hroznáta），殉道。妻儿亡故后离开公爵宫廷，据传入特普拉（Teplénse）普雷蒙特雷会修院。因维护修院权益被匪徒掳去，因饥饿耗尽而至于死（1217年）。

**6\\*.** 在威尼托之维罗纳（Veróna），圣图斯卡纳（Tuscána）。丧夫后将全部家产施予穷人，加入耶路撒冷圣若望骑士团，终身不辍地照顾病患（约1343年）。

**7\\*.** 在翁布里亚之福利尼奥（Fulgínium），真福安杰利纳·德·玛尔夏诺（Angelína de Marsciáno）。守寡后五十余年全心奉献于天主之服务与近人之福祉，为教育少女开创了方济各第三会隐修修女之先河（1435年）。

**8\\*.** 在西班牙之巴伦西亚（Valéntia），真福加斯帕尔·德·博诺（Gáspar de Bono），最小兄弟会（Ordo Minimórum）司铎。弃世俗君主之戎马生涯，投身基督君王之军旅，以热忱、审慎与仁爱管理该修会西班牙省之各会院（1604年）。

**9\\.** 在秘鲁之利马（Lima），圣方济各·索拉诺（Francíscus Solano），方济各小兄弟会司铎。为拯救灵魂，走遍南美各地区，以宣讲与奇迹全力教导原住民及西班牙殖民者认识基督信仰之生命更新（1610年）。

**10\\*.** 在英格兰之伦敦，真福理查德·朗霍恩（Richárdus Langhorne），殉道。著名律师，在查理二世治下被诬告叛国，判处死刑，在泰伯恩（Tybúrnum）刑场交付灵魂（1679年）。

**11\\*.** 在埃塞俄比亚之*切雷卡-格巴巴*（*Cerecca-Ghebaba*），真福格布雷·弥额尔（Ghebre Michaélis），遣使会（Congregátio Missiónis）司铎、殉道。毕生在研学与祈祷中追寻真信仰，终于归入教会之合一。因此先入狱，后被士兵押解行军，双脚负锁链之重，历时十三个月，受鞭笞之苦，终因饥渴交迫而亡（1855年）。

**12\\.** 在中国河北省（*Hebei*）南宫城（*Nangong*），圣王贵新若望（Ioánnis Wang Guixin），殉道。在义和团（*Yihetuan*）发动之迫害中，宁愿为基督而死，也不愿以哪怕一句小小的谎言玷污自己（1900年）。

### 七月十四日校注

1. **第1条（圣加弥禄·德·莱利斯）**：灵医会（Camillians）之中文名从教会定式。加弥禄为该修会创始人，以红十字为会徽，被尊为病患及护士主保。

2. **西语版独有条目**：西语版第6\\*条（萨瓦之奥特孔布修院真福博尼法爵）在拉丁版中无对应条目，系地方敬礼，不译。

3. **第12条人名**：圣王贵新若望（John Wang Guixin），据 Asia Harvest 资料为七月十三日第17条圣王贵吉若瑟之堂兄弟，二人同为河北蓟州县人。义和团迫害中同时被捕，分别殉道。拉丁文两条均作"in urbe Nangong"，但 Asia Harvest 称二人实居蓟州县"双冢村"。二人事迹相近：均拒绝以谎言保命而选择为基督而死。

---

## 七月十五日

**Die 15 iúlii** · 七月望日（*Idibus iúlii*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8
> A B C D E F F G H M N P
> 9 10 11 12 13 14 14 15 16 17 18 19

**1\\.** 纪念圣文都辣（Bonaventúra）安葬之日，阿尔巴诺（Albanénsis）主教、教会圣师。以其学说、生命之圣德及为教会服务的卓越功勋著称于世。以圣方济各之精神审慎地管理小兄弟会，曾任总会长。在众多著作中，将渊博学识与炽热虔诚融为一体。在为里昂第二届大公会议（Concílium Œcuménicum Lugdunénse Secúndum）竭力效劳之际，堪当进入天主的荣福直观（1274年）。

**2\\.** 在罗马古港（Portus Románus），圣厄乌特罗皮奥（Eutrópius）、圣佐西玛（Zósima）与圣博诺莎（Bonósa），殉道（四世纪）。

**3\\.** 在迦太基西利塔诺（Scillitanórum）大道之法乌斯多圣殿（basílica Fausti），圣斐理斯（Felix），提比乌加（Thibiúca）主教、殉道，安葬于此。长官马格尼利亚诺（Magniliánus）下令将圣经书卷交出焚毁，他回答说：与其焚烧天主的圣经，宁可自己被火焚烧。因此总督阿努利诺（Anulínus）下令以剑将其处决（303年）。

**4\\.** 同在迦太基，纪念圣加图利诺（Catulínus），执事、殉道，圣奥斯定曾就其美德向民众宣讲，以及安息于法乌斯多圣殿中的其余殉道者（303年）。

**5\\.** 在埃及之亚历山大里亚，圣斐理伯（Philíppus）及十名孩童诸圣殉道者（约四世纪）。

**6\\.** 在赫勒斯滂（Hellespóntus）之特内多斯岛（Ténedos），圣阿布德米奥（Abudémius），殉道（四世纪）。

**7\\.** 在美索不达米亚之尼西比（Nísibis），圣雅各伯（Iacóbus），该城首任主教。出席尼西亚大公会议（Concílium Nicǽnum），以和平牧养并抚育其羊群，抵御信仰敌人之攻击（338年）。

**8\\*.** 在奥斯特拉西亚布拉班特之鲁尔蒙德（Ruræmúnda），马斯河（Mosa）畔，圣普莱赫尔莫（Plechélmus），主教，出自诺森布里亚（Northúmbria），向众人宣报基督之丰富（约713年）。

**9\\*.** 在法兰科尼亚之安斯巴赫（Anspáchium），圣贡贝尔托（Gumbértus），院长，在自己的庄园上建立此修院（约790年）。

**10\\.** 在特萨利亚（Thessália），圣若瑟（Ioséphi），得撒洛尼城（Thessalonicénsis）主教，善终。为圣德奥多罗·斯图迪塔（Theodórus Studíta）之兄弟。初为修士，谱写众多赞美诗。继而擢升为主教，因维护教会纪律及捍卫圣像而备受磨难与酷刑，被放逐至特萨利亚，终因饥饿而亡（832年）。

**11\\.** 在坎帕尼亚之那不勒斯（Neápolis），圣亚大纳削（Athanásius），主教。遭不义的侄子塞尔焦（Sérgius）百般迫害，被逐出主教座堂。历经艰辛，终在赫尔尼奇（Hérnici）地区之韦罗利（Vérulæ）飞赴天乡（872年）。

**12\\.** 在罗斯之基辅（Kióvia），圣弗拉基米尔（Vladimírus），王公。受洗时取名巴西略（Basílius），竭力在其治下各族人民中传播正统信仰（1015年）。

**13\\*.** 在德意志荷尔斯泰因（Holsátia）之拉采堡（Racebúrgum），圣安苏厄罗（Ansuérus），院长、殉道。与二十八位修士一同被反对基督信仰传播者的文德人（Vínedi）投石打死（1066年）。

**14\\*.** 在瑞典之韦斯特罗斯（Arósia），圣达味（Dávidis），主教。英格兰人，入克吕尼修会成为修士后赴瑞典传扬基督，在自己所建之修院中年老时安息主怀（约1082年）。

**15\\*.** 在西里西亚（Silésia）之布雷斯劳（Breslávia，今弗罗茨瓦夫），真福切斯劳（Ceslái），宣道会最早期的弟兄之一，在西里西亚及波兰其他地区为天主之国效力（1242年）。

**16\\*.** 在皮埃蒙特之蒙卡列里（Monte Calério），真福贝尔纳铎（Bernárdus），巴登侯爵（márchio Badénsis）。在君士坦丁堡陷敌之后赴东方，为保卫基督徒民众，途中为死亡所夺（1458年）。

**17\\*.** 真福依纳爵·德·阿塞维多（Ignátius de Azevedo），司铎，及三十八位同伴殉道之日，均出自耶稣会。在乘名为"圣雅各伯"之船前往巴西传教途中，遭海盗船袭击，海盗出于对天主教信仰之仇恨，以刀剑枪矛将他们刺杀（1570年）。

**18\\.** 在阿普利亚（Apúlia）之坎波萨伦蒂诺（Campus Salentinórum），圣庞皮利奥·玛利亚·皮罗蒂（Pompílius María Pirrotti），比亚会（Ordo Clericórum Regulárium Scholárum Piárum）司铎，以生活之严格克苦著称（1766年）。

**19\\*.** 在法国罗什福尔（Rupifórtium）海岸外停泊之囚船上，真福弥额尔·伯尔纳铎·马尔尚（Michaélis Bernárdi Marchand），司铎、殉道。法国大革命期间因司铎身份自鲁昂（Rothomágum）被转押至污秽之囚船上，染病而亡（1794年）。

**20\\.** 在东京（Tunquínum）之南定城（*Nam Định*），圣阮伯遵伯多禄（Petrus Nguyễn Bá Tuân），司铎、殉道。因基督信仰被囚于狱中，在明命帝（Minh Mạng）治下因饥饿耗尽而亡（1838年）。

**21\\*.** 在法国巴黎，真福安纳·玛利亚·雅乌赫（Anna María Javouhey），童贞。创立克吕尼圣若瑟修女会（Congregátio Cluniacénsis Sorórum a Sancto Ióseph），致力于照顾病患与教育少女之基督信仰培育，并将修会拓展至传教地区（1851年）。

**22\\.** 在交趾支那之美萩省（*Mỹ Tho*），圣阮金通安德肋（Andréas Nguyễn Kim Thông Nam [Nam Thuông]），殉道。为传道员，在嗣德帝（Tự Đức）治下先入狱后遭流放，被锁链缚身、负以横木，在流徙途中完成殉道（1855年）。

**23\\*.** 在波兰之别尔斯克-波德拉斯基（*Bielsk Podlaski*），真福安多尼·贝什塔-博罗夫斯基（Antónius Beszta-Borowski），司铎、殉道。战争中被信仰之敌抓获，以枪弹杀害，为基督而亡（1943年）。

### 七月十五日校注

1. **第1条（圣文都辣）**：Bonaventura 译"文都辣"从教会中文定例。里昂第二届大公会议（1274年）确为大公会议（第十四届），由教宗额我略十世召集。"荣福直观"（*beáta Dei vísio*）为神学术语，指在天堂直接面见天主。

2. **第2条地名**：*Portus Románus* 为罗马古港，位于台伯河口，近今菲乌米奇诺（Fiumicino），由克劳迪奥与特拉真二帝修建，非罗马城本身。

3. **第3条**：西利塔诺（*Scillitanórum*）从教会式发音（*Sci-* = /ʃi/），不作"斯基利塔诺"。西利塔诺殉道者为北非早期著名殉道者团体。*curator* 译"长官"，为罗马行政区管理官员。

4. **第8\\*条**："基督之丰富"（*divítias Christi*）为圣经用语，参弗三8"基督那不可测量的丰富"（思高）。

5. **第12条（圣弗拉基米尔）**：*fidem orthódoxam* 此处意为"正统信仰"（正确之信仰），非专指东正教会。弗拉基米尔于988年受洗归入基督信仰，为东西方教会共敬之圣人。

6. **第17\\*条（依纳爵·德·阿塞维多及同伴）**：拉丁原版脚注7列出三十八位同伴芳名。此为1570年在加那利群岛附近海域遭加尔文派海盗雅克·苏里（Jacques Sourie）劫杀之耶稣会士。*in ódium religiónis cathólicæ*（出于对天主教信仰之仇恨）指海盗之动机，非殉道者之行为。

7. **第20条（越南殉道圣人）**：阮伯遵（Nguyễn Bá Tuân）之汉字推定：阮=Nguyễn（无歧义），伯=Bá（无歧义），遵=Tuân（中等偏高，亦可为纯、巡等）。明命帝同前。

8. **第22条（越南殉道圣人）**：阮金通（Nguyễn Kim Thông）之汉字推定：阮=Nguyễn（无歧义），金=Kim（无歧义），通=Thông（无歧义）。Nam（南）及 Nam Thuông（南通）为别名。嗣德帝同前。美萩（Mỹ Tho）在今越南前江省。

9. **西语版差异**：本日西语版与拉丁版条目数一致（23条），无独有条目。

---

## 七月十六日

**Die 16 iúlii** · 八月初一前第十七日（*Décimo séptimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9
> A B C D E F F G H M N P
> 10 11 12 13 14 15 15 16 17 18 19 20

**1\\.** 荣福童贞玛利亚加尔默罗山圣母（Beáta María Virgo de Monte Carmélo）。昔日厄里亚先知（Elías）曾在此山引导以色列民归向永生天主的敬拜。其后有隐修士到此追寻独居之旷野，最终建立修会，在天主之母圣母的护佑下度默观生活。

**2\\.** 在迦拉达（Galátia）之阿纳斯塔西奥波利（Anastasiópolim），圣安提约古（Antióchus），殉道，圣普拉多（Plato）之兄弟（三至四世纪）。

**3\\.** 在亚美尼亚之塞巴斯特（Sebáste），圣阿泰诺杰内（Athenógenes），辅理主教、殉道。留给弟子一首宣扬圣神之天主性的赞美诗，自己则为基督被投入火中（约305年）。

**4\\*.** 在不列颠海之泽西岛（Cæsaréa ínsula），圣厄莱里奥（Helérius），隐修士，据传为海盗所杀而殉道（六世纪）。

**5\\*.** 在奥斯特拉西亚布拉班特之马斯特里赫特（Traíectum Mosæ），圣莫努尔夫（Monúlphus）与圣贡杜尔夫（Gondúlphus），主教（六至七世纪）。

**6\\.** 在埃诺（Hannónia）之桑特（Sánto），圣雷尼尔迪斯（Reiníldis），童贞，圣格里莫阿尔德（Grimoáldus）与圣贡杜尔夫（Gondúlphus）诸圣殉道者，据传遭匪徒杀害（约680年）。

**7\\.** 在西班牙汪达尔地区（Vandálica，安达卢西亚）之科尔多瓦（Córduba），圣西塞南多（Sisenándus），执事、殉道，因基督信仰被摩尔人杀害（851年）。

**8\\*.** 在巴伐利亚基姆湖（lacus Auva）畔之修院，真福依尔门加德（Irmengárdis），女院长。自幼舍弃王室宫廷之荣华，立志事奉天主，引领众多贞女追随羔羊（866年）。

**9\\*.** 真福西满·达·科斯塔（Simon da Costa）殉道之日，耶稣会士。为前一日（七月十五日）在名为"圣雅各伯"之船上因仇教而遇害之殉道者团体中最后一位牺牲者（1570年）。

**10\\*.** 在路西塔尼亚（Lusitánia，葡萄牙）维亚纳堡（Viána Castélli）之圣十字架修院，真福巴尔多禄茂（殉道者之）·费尔南德斯（Bartholomǽus a Martýribus Fernandes），布拉加（Bracára）主教。德行超群，以极大的牧灵爱德在羊群急需之中竭力扶持，并以正确教义著述甚丰（1590年）。

**11\\*.** 在英格兰之沃里克（Virovíacum），真福若望·舒格尔（Ioánnes Sugar），司铎，及罗伯特·格里索尔德（Robértus Grissold），殉道。在詹姆斯一世治下被判罪，前者因以司铎身份进入英格兰，后者因曾予以帮助。二人经受严酷磨难后获得殉道之荣冠（1604年）。

**12\\*.** 在巴西纳塔尔（Natália）附近之库尼亚乌城（*Cunhaú*），真福安德肋·德·索维拉尔（Andréas de Soveral），耶稣会司铎，及真福多明我·卡尔瓦略（Domínicus Carvalho），殉道。在弥撒圣祭进行中，一群信友与二人一同被士兵诡计诱入教堂中关押，遭到残忍杀害（1645年）。

**13\\*.** 在法国罗什福尔（Rupifórtium）海岸外停泊之囚船上，真福尼各老·萨武雷（Nicoláus Savouret），方济各小兄弟会士，及真福克劳德·贝吉尼奥（Cláudius Béguignot），加尔都西会（Ordo Cartusiénsis）士，司铎、殉道。法国大革命期间，因仇恨司铎职分被拘于污秽囚船中，染病而亡（1794年）。

**14\\*.** 同在法国奥朗日（Arausio），真福阿玛达（耶稣，本名玛利亚·罗莎）·德·戈尔东（Amáta a Iesu [María Rosa] de Gordon）及六位同伴，童贞、殉道。在同一迫害中因拒绝放弃修道生活而被判斩首，欣然接受殉道之荣冠（1794年）。

**15\\.** 在法国诺曼底圣索沃尔-勒-维孔特（Sancti Salvatóris Vicecomitis）镇，圣玛利亚·玛达肋纳·波斯特尔（María Magdaléna Postel），童贞。在同一动乱时期，司铎遭驱逐后，为病患与信众竭尽一切援助。和平恢复后，在极端贫困中创立并管理仁慈之女修女会（Congregátio Filiárum a Misericórdia），致力于贫苦少女之基督信仰教育（1846年）。

**16\\.** 在中国河北省（*Hebei*）清河（*Qinghe*）附近之吕家坡（*Lüjiapo*），圣郎杨氏，慕道者，及其子圣郎福保禄（Paulus Lang Fu），殉道。在义和团（*Yihetuan*）发动之迫害中，母亲公开宣认自己为基督徒，母子二人在被焚毁的家中为基督完成殉道（1900年）。

**17\\.** 同在河北省宁晋（*Ningjin*）之张家集（*Zhangjiaji*），圣张何氏德肋撒（Terésia Zhang Hezhi），殉道。在同一迫害中被拖至异教庙宇，拒绝向庙中偶像行礼，遂与两个儿子一同被矛刺死（1900年）。

### 七月十六日校注

1. **第1条（加尔默罗圣母）**：本条为加尔默罗圣母瞻礼。加尔默罗山（Monte Carmelo）在今以色列海法附近。厄里亚从思高（列上十八）。

2. **第9\\*条（西满·达·科斯塔）**：此条与七月十五日第17\\*条（依纳爵·德·阿塞维多及三十八位同伴）为同一事件之延续。西满·达·科斯塔为该批殉道者中最后一位牺牲者，殉于次日（七月十六日）。

3. **第14\\*条（奥朗日殉道修女）**：拉丁原版脚注8列出六位同伴。至本条为止，奥朗日殉道修女已连续第八日出现（7/6至7/13连续七日，再加7/16）。

4. **第16-17条人名**：郎杨氏（Lang Yangzhi）及张何氏（Zhang Hezhi）均为中国传统已婚妇女称谓：夫姓+本姓+氏。郎杨氏即嫁入郎家之杨姓妇女，张何氏即嫁入张家之何姓妇女。拉丁文将"杨氏"罗马化为 *Yangzhi*，将"何氏"罗马化为 *Hezhi*，其中 *zhi* 对应"氏"（*shì*，在某些方言中读近 *zhì*）。郎杨氏为慕道者（*catechumena*，尚未领洗），其子郎福已领洗取名保禄。清河（*Qinghe*）在今河北省邢台市清河县，宁晋（*Ningjin*）在今河北省邢台市宁晋县。

---

## 七月十七日

**Die 17 iúlii** · 八月初一前第十六日（*Sextodécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10
> A B C D E F F G H M N P
> 11 12 13 14 15 16 16 17 18 19 20 21

**1\\.** 在迦太基，西利塔诺诸圣殉道者（mártyres Scillitáni）升天之日，即斯佩拉多（Sperátus）、纳尔查理斯（Nartzális）、奇蒂诺（Cittínus）、维图里奥（Vetúrius）、斐理斯（Felix）、阿奎利诺（Aquilínus）、莱坦齐奥（Lætántius）、雅努阿里亚（Ianuária）、杰内罗莎（Generósa）、维斯提亚（Véstia）、多纳达（Donáta）与塞孔达（Secúnda）。奉总督撒图尔尼诺（Saturnínus）之命，初次宣认基督后被投入监狱，翌日被缚于木架。当他们坚定地宣认自己是基督徒并拒绝向皇帝行神性之敬礼后，被判处死刑。在刑场上，众人一同跪下，口中感谢基督，以剑被斩首（180年）。

**2\\.** 在帕弗拉戈尼亚（Paphlagonía）之阿玛斯特里斯（Amástris），圣亚钦多（Hyacínthus），殉道（约三世纪）。

**3\\.** 在西班牙贝蒂卡省（Bǽtica）之塞维利亚（Híspalis），圣犹斯达（Iusta）与圣鲁斐纳（Rufína），童贞。被总督迪奥杰尼亚诺（Diogeniánus）逮捕后，遭受严酷刑罚，继又被囚禁、绝食及各种折磨。犹斯达终在狱中气绝身亡，鲁斐纳则在宣认上主之际被折断颈项（约287年）。

**4\\.** 在利古里亚之米兰（Mediólánum），圣玛尔切利纳（Marcellína），童贞，圣盎博罗削（Ambrósius）主教之姊妹。在罗马圣伯多禄大殿中，于主显节由教宗利伯略（Libérius）亲手为其覆以奉献贞女之面纱（四世纪末）。

**5\\.** 在罗马阿文提诺山（Aventínum）上的教堂中，以亚肋修（Aléxius）之名纪念一位天主的人。据传他舍弃富裕之家，甘为穷人，隐姓埋名以乞食度日（四世纪）。

**6\\.** 在里昂高卢（Gállia Lugdunénsis）之欧塞尔（Autissiódorum），圣德奥多西奥（Theodósius），主教（六世纪）。

**7\\.** 在利古里亚之帕维亚（Pápia），圣恩诺迪奥（Ennódius），主教。以赞美诗装饰圣人之纪念碑与圣殿，慷慨施舍财富（521年）。

**8\\*.** 在奥斯特拉西亚布拉班特安特卫普（Antverpia）附近之德尔讷（Turnínum），圣弗雷德甘德（Fredegándus）。据传为自爱尔兰前来之修士，圣福伊兰（Foillánus）及其他巡回传教士之旅伴与事工伙伴（八世纪）。

**9\\*.** 在英格兰麦西亚（Mércia）之温奇库姆修院（Wincélcumba），圣凯内尔姆（Kenélmus）。麦西亚王子，被尊为殉道者（约812年）。

**10\\.** 在罗马圣伯多禄大殿，圣教宗良四世（Leo papa IV），罗马城之捍卫者，伯多禄首席权之守护者（855年）。

**11\\.** 在巴伐利亚维也纳（Vindobóna）附近之施托克劳（*Stockerau*），圣科尔曼（Colmánus），爱尔兰人。为天主之名朝圣前往圣地途中，被误认为敌方探子，遭悬挂于树上处死，由此抵达天上的耶路撒冷（1012年）。

**12\\*.** 在喀尔巴阡山脉（montes Carpátes）瓦赫河（Vagum）畔之尼特拉（Nitráva），圣佐厄拉尔德（又名安德肋）（Zoerárdi seu Andréas）与圣本笃（Benedíctus），隐修士。二人自波兰应圣斯德望国王之邀前来匈牙利，在佐博尔山（Zobor）的旷野中度极为严苦的隐修生活（1031至1034年）。

**13\\.** 在波兰之克拉科夫（Cracóvia），圣雅德维加（Hedwígis）。生于匈牙利之王室，承继波兰王位，下嫁立陶宛大公雅盖沃（Iaghéllio），后者领洗取名拉迪斯劳（Ladísláus），夫妇二人在立陶宛播下天主教信仰（1399年）。

**14\\*.** 在法国巴黎，真福德肋撒（圣奥斯定，本名玛利亚·玛达肋纳·克劳迪纳）·利多瓦纳（Terésia a Sancto Augustíno [María Magdaléna Claudína] Lidoine）及十五位同伴，均为贡比涅加尔默罗会（Carmélo Compéndii）修女、童贞、殉道。法国大革命期间，忠诚恪守修道纪律。被判斩首后，在断头台前重新宣发领洗时的信仰誓愿与修道圣愿（1794年）。

**15\\.** 在中国河北省（*Hebei*）深县（*Shenxian*）之朱家斜庄（*Zhujiaxiezhuang*），圣刘子玉伯多禄（Petrus Liu Ziyu），殉道。在义和团（*Yihetuan*）发动之迫害中，不顾友人劝阻，在官长面前坚守基督信仰，遂被刀剑刺杀（1900年）。

**16\\*.** 在斯洛伐克之莱奥波尔多夫（Leopoldópolis），真福保禄（伯多禄）·戈伊迪奇（Paulus [Petrus] Gojdich），主教、殉道。任普雷绍夫（Presóvia）教区牧者期间，被仇视天主之政权投入监狱，备受摧残折磨，以坚忍不拔之信仰宣认，忠实接受基督之言，进入光荣的永生（1960年）。

### 七月十七日校注

1. **第1条（西利塔诺殉道者）**：为北非最早有文献记录的殉道者之一（180年）。"西利塔诺"（Scillitani）指来自北非西利乌姆（Scillium）之基督徒。拉丁文 *natális* 意为"诞辰"，指殉道者进入天堂之日（天上诞辰）。审判记录（*Acta Martyrum Scillitanorum*）为现存最早的拉丁文殉道文献之一。

2. **第5条（天主的人亚肋修）**：拉丁原文以"天主的人"（*homo Dei*）为主要称谓，*Alexius* 为传统附加之名。亚肋修传说在东西方教会均有流传，细节各异。

3. **第13条（圣雅德维加）**：波兰语 Jadwiga，非西里西亚之圣海德维格（Hedwig von Schlesien，庆日10月16日）。1386年嫁立陶宛大公约盖拉（Jogaila），后者领洗取名瓦迪斯瓦夫（Władysław，拉丁文作 Ladislaus），二人推动立陶宛皈依天主教，为欧洲最后一个改宗基督信仰的国家。

4. **第14\\*条（贡比涅加尔默罗会殉道修女）**：1794年7月17日在巴黎被送上断头台之十六位加尔默罗会修女，为法国大革命殉道者中最著名的一批。拉丁原版脚注9列出十五位同伴芳名。此事件为普朗克（Poulenc）歌剧《加尔默罗会修女的对话》（*Dialogues des Carmélites*）之原型。西语版误标年份为1791年，应为1794年。

5. **第15条人名**：刘子玉（Liu Ziyu）之汉字推定：刘=Liu（无歧义），子=Zi（无歧义），玉=Yu（中等偏高，亦可为育、瑜等）。深县（*Shenxian*）在今河北省深州市。

---

## 七月十八日

**Die 18 iúlii** · 八月初一前第十五日（*Quintodécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10 11
> A B C D E F F G H M N P
> 12 13 14 15 16 17 17 18 19 20 21 22

**1\\.** 在罗马城外提布尔提纳大道（Via Tiburtína）第九里程碑处，纪念圣辛福罗莎（Symphorósa）及七位同伴：克雷森斯（Crescens）、儒略（Iuliánus）、内梅西奥（Nemésius）、普里米提沃（Primitívus）、犹斯定（Iustínus）、斯塔切奥（Stácteus）与安日纳（Eugénius），殉道。以各种不同的致命方式完成殉道，在基督内结为手足（三至四世纪）。

**2\\.** 在利古里亚之米兰（Mediólánum），圣玛特尔诺（Matérnus），主教。在教会获得自由后，将殉道者纳博尔（Nabor）与斐理斯（Felix）之遗体从劳斯·庞佩亚（Laus Pompéia）隆重迎回本城（四世纪）。

**3\\.** 在默西亚（Mœ́sia）之多罗斯托罗（Doróstorium），圣厄弥利亚诺（Æmiliánus），殉道。蔑视叛教者尤里安（Iuliánus Apostáta）之诏令及其代理官加图利诺（Catulínus）之威胁，推翻偶像祭坛并阻止献祭，被投入烈窑，获得殉道之荣冠（362年）。

**4\\.** 在威尼托之布雷西亚（Bríxia），圣斐拉斯特里奥（Philástrius），主教，其继任者圣高登齐奥（Gaudéntius）赞颂了其生平与辞世（约397年）。

**5\\.** 在艾米利亚之福利恩波波利（Forum Popílii），圣鲁斐洛（Ruffíllus），主教。据信为该教会首位主管，将乡间全体民众引领归向基督（五世纪）。

**6\\.** 在奥斯特拉西亚之梅斯（Metis），圣阿尔努尔夫（Arnúlphus），主教。曾为奥斯特拉西亚国王达戈贝尔特（Dagobértus）之辅政大臣，卸任后在孚日山（Vósegus）中度隐修生活（640年）。

**7\\.** 在君士坦丁堡，圣德奥多西亚（Theodósia），修女。因捍卫一幅古老的基督圣像而殉道。伊苏里亚人利奥（Leo Isáuricus）皇帝曾下令将此圣像从皇宫的铜门（Porta Ǽnea）上拆除（八世纪）。

**8\\.** 在奥斯特拉西亚海尔德兰（Géldria）之乌特勒支（Ultraiéctum），圣弗里德里科（Fridéricus），主教。以研习圣经著称，致力于向弗利西亚人（Frísii）传播福音（838年）。

**9\\.** 在拉齐奥之塞尼（Sígnia），圣布鲁诺（Bruno），主教。为教会改革多有作为亦多有受苦，因此被迫离开主教座堂，在卡西诺山寻得庇护，并一度担任修院院长（1123年）。

**10\\*.** 在波兰之克拉科夫（Cracóvia），真福西满·德·利普尼察（Simon de Lipnica），方济各小兄弟会司铎。以宣讲和对耶稣圣名之热心著称，在照顾鼠疫垂死者之际，因仁爱之驱使而献出了自己的生命（1482年）。

**11\\*.** 在法国罗什福尔（Rupifórtium）海岸外之锚泊处，真福若翰·巴蒂斯特·德·布吕塞尔（Ioánnes Baptísta de Bruxelles），利摩日（Lemovícum）教区司铎、殉道。法国大革命期间被关入肮脏的囚船，因饥饿与瘟疫而亡（1794年）。

**12\\.** 在东京（Tunquínum）之南定城（*Nam Định*），圣丁达多明我（尼各老）（Domínicus Nicoláus Đinh Đạt），殉道。身为军人，受迫害后被迫弃教，在酷刑之下踩踏了十字架。但他立即悔悟，退还了叛教之赏赐，上书明命帝（Minh Mạng），请求重新以基督徒身份受审，终被绞杀（1839年）。

**13\\*.** 在乌克兰之克里斯托诺皮尔村（*Krystonopil*），真福塔尔西齐亚（奥尔加）·玛齐夫（Tarsícia [Olga] Mackiv），无原罪圣母婢女会（Congregátio Sorórum Ancillárum Maríæ Immaculátæ）修女、童贞、殉道。在战争期间，在迫害者面前捍卫信仰，赢得了贞洁与殉道的双重胜利（1944年）。

### 七月十八日校注

1. **第3条（圣厄弥利亚诺）**：叛教者尤里安（Iulianus Apostata）即罗马皇帝尤里安（Julian，361-363在位），为最后一位信奉异教之罗马皇帝。*Apostata*（叛教者）为教会传统称号。

2. **第6条（圣阿尔努尔夫）**：梅斯主教阿尔努尔夫为法兰克加洛林王朝之先祖。达戈贝尔特一世（Dagobert I）从世俗通行译法。

3. **第12条（越南殉道圣人）**：丁达（Đinh Đạt）之汉字推定：丁=Đinh（无歧义），达=Đạt（中等偏高）。此人经历先叛教后悔改再殉道之曲折过程，为殉道圣人录中极为罕见之案例。西语版误标年份为1859年，据史实及拉丁文所载"imperatori Minh Mạng"（明命帝1820-1841在位）确认应为1839年。

---

## 七月十九日

**Die 19 iúlii** · 八月初一前第十四日（*Quartodécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10 11 12
> A B C D E F F G H M N P
> 13 14 15 16 17 18 18 19 20 21 22 23

**1\\.** 纪念圣厄帕弗辣（Epaphras），在哥罗森（Colóssis）、劳狄刻雅（Laodicéa）与希辣颇里（Hierápolis）为福音辛勤劳碌，被保禄宗徒称为可爱的同仆、同囚及基督忠信的仆役（一世纪）。

**2\\.** 在弗里吉亚之美罗（Merum），圣马切多尼奥（Macedónius）、德奥杜洛（Theodúlus）与塔齐亚诺（Tatiánus），殉道。在叛教者尤里安皇帝治下，受总督阿尔马基奥（Almáchius）之命，历经种种酷刑后被置于烧红的铁栅上，满怀喜乐地完成了殉道（约362年）。

**3\\.** 在本都（Pontus）伊里斯河（Iris）畔之安讷西修院（monastérium Annesínum），圣玛克里纳（Macrína），童贞，圣大巴西略（Basílius Magnus）、尼撒的额我略（Gregórius Nyssénus）与色巴斯特的伯多禄（Petrus Sebasténsis）之姊妹。精通圣经，潜心度独修生活，成为渴慕天主及弃绝世俗虚荣的奇妙典范（379年）。

**4\\*.** 在君士坦丁堡，圣迪奥（Dius），号称"行奇迹者"（*Thaumatúrgus*），大修院长。安提约基雅人，在此城晋铎后，依不眠修士（Acœmétæ）会规创建修院（五世纪初）。

**5\\.** 在罗马圣伯多禄大殿，圣西玛克（Sýmmachus），教宗。长期受裂教派系之困扰，终以信仰宣认者安息主怀（514年）。

**6\\.** 在西班牙汪达尔地区（Vandalícia，今安达卢西亚）之科尔多瓦（Córduba），圣奥雷亚（Aurea），童贞，殉道者圣阿多尔佛（Adólphus）与圣若望（Ioánnes）之姊妹。在摩尔人迫害期间被押至审判官面前，因恐惧而一度背弃信仰，但旋即悔改，重新投入争战，以倾洒热血战胜了仇敌（856年）。

**7\\*.** 在洛塔林吉亚（Lotharíngia）海尔德兰（Géldria）之乌特勒支（Ultraiéctum），圣贝尔诺尔多（又名贝尔努尔佛）（Bernóldus seu Bernúlphus），主教。将教堂与修院从权势者的控制中解救出来，创建多座教堂，并在修院中推行克吕尼惯例（1054年）。

**8\\*.** 在弗兰科尼亚（Francónia）之玛利亚堡修院（monastérium Mariæbúrgi），真福斯蒂拉（Stilla），奉献童贞。安葬于其亲手创建的教堂中（约1140年）。

**9\\*.** 在翁布里亚之福利尼奥（Fulgínium），真福伯多禄·克里西（Petrus Crisci）。散尽家财施济贫人后，全心投入主教座堂的服务，在钟楼中度极谦卑、极刻苦的补赎生活（约1323年）。

**10\\.** 在英格兰之切斯特（Céstria），圣若望·普莱辛顿（Ioánnes Plessington），司铎、殉道。在塞戈维亚（Segóbia）晋铎后返回英格兰，因此在查理二世（Cárolus rex Secúndus）治下被判处绞刑（1679年）。

**11\\.** 在中国河北省（*Hebei*）应县（*Yingxian*）附近之陆家庄（*Lujiazhuang*），圣朱五瑞若翰（Ioánnes Baptísta Zhu Wurui），殉道。年方青少，在义和团（*Yihetuan*）众人面前坦然宣认自己是基督徒，遂被截断肢体后以斧斩杀（1900年）。

**12\\.** 同在河北省任丘（*Renqiu*）附近之刘村（*Liucun*），圣秦边氏依撒伯尔（Elísabeth Qin Bianzhi）及其子圣秦春福西满（Simon Qin Chunfu），时年十四岁，殉道。在同一迫害中坚守信德，以刚毅战胜了仇敌的一切残暴（1900年）。

**13\\*.** 在波兰之博罗维科夫什奇兹纳（*Borowikowszczyzna*），真福阿基莱·普哈瓦（Achílles Puchała）与赫尔曼·斯滕比恩（Hermánnus Stępień），方济各住院小兄弟会司铎、殉道。祖国波兰惨遭外国军事强权蹂躏之际，为信仰之故遭杀害（1943年）。

### 七月十九日校注

1. **第1条（圣厄帕弗辣）**：厄帕弗辣为保禄宗徒所称许之同工，见哥罗森书（哥一7: "可爱的同仆...基督忠信的仆役"；哥四12-13: 为哥罗森、劳狄刻雅及希辣颇里之信友辛勤劳碌）及费肋孟书（费一23: "同为囚犯的厄帕弗辣"）。上述称谓均从思高圣经用语。

2. **第3条（圣玛克里纳）**：即"小玛克里纳"（Macrina the Younger, 约327-379），卡帕多细雅三教父之姊妹。大巴西略（约330-379）、尼撒的额我略（约335-约395）及色巴斯特的伯多禄（约340-391）均为教会史上极重要的神学家与主教。安讷西修院位于今土耳其境内。伊里斯河即今土耳其之耶希尔河（Yeşilırmak）。

3. **第4\\*条（圣迪奥）**：不眠修士（Acoemetae，希腊文 Ἀκοίμητοι，"不寐者"）为五世纪君士坦丁堡之修道团体，以轮班不间断地咏唱圣咏著称。

4. **第6条（圣奥雷亚）**：汪达尔地区（Vandalicia）为拉丁文古地名，与日耳曼民族汪达尔人（Vandali）有关，后演变为今日之安达卢西亚（Andalucía）。奥雷亚先因恐惧而背教，后悔改殉道，与七月十八日第12条之越南殉道者丁达多明我有相似经历。

5. **第10条（圣若望·普莱辛顿）**：西语版误标为"Jacobo II"（詹姆斯二世），拉丁原文正确作"Carolo rege Secundo"（查理二世）。普莱辛顿系1679年英格兰"天主教阴谋案"（Popish Plot）期间被处决之殉道司铎，当时在位者为查理二世（1660-1685在位），非詹姆斯二世（1685-1688在位）。

6. **第11条人名**：拉丁原文将姓氏罗马化为"Zhou"，但据香港教区档案处120位中华殉道圣人名录及中文维基百科"中华殉道圣人"条目，正确姓氏为朱（Zhū），非周（Zhōu）。中文名为朱五瑞，"五"或指排行第五。同一朱姓家族另有两位殉道圣人见于七月二十日：朱日新伯多禄（Petrus Zhu Rixin）及朱吴氏玛利亚（Maria Zhu Wuzhi）。应县（Yingxian）在今山西省朔州市（非河北省），拉丁文将其归入河北省或因属同一教区管辖。

7. **第12条人名**：秦边氏（Qin Bianzhi）为中国传统已婚妇女称谓：夫姓秦+本姓边+氏。拉丁文将"氏"（shì）罗马化为 *zhi*。秦春福为其子，时年十四岁。任丘（Renqiu）在今河北省沧州市。

8. **第13\\*条（波兰殉道真福）**：拉丁文"外国军事强权"（*aliénum militáre impérium*）指1939年纳粹德国入侵波兰后之军事占领。二位真福于1943年在今白俄罗斯境内被占领军当局杀害。博罗维科夫什奇兹纳（Borowikowszczyzna）今属白俄罗斯。

---

## 七月二十日

**Die 20 iúlii** · 八月初一前第十三日（*Tertiodécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10 11 12 13
> A B C D E F F G H M N P
> 14 15 16 17 18 19 19 20 21 22 23 24

**1\\.** 圣阿波利纳雷（Apollináris），主教。在外邦人中传播基督那不可测量的丰富，如善牧走在羊群前面，据传以光荣的殉道装饰了弗拉米尼亚（Flamínia）拉文纳（Ravénna）附近之克拉塞教会（Ecclésia Classénsem）。实于七月二十三日迁入永恒的筵席（约二世纪）。

**2\\.** 纪念圣厄里亚（Elías Thesbíta），上主的先知。在以色列王阿哈布（Achab）与阿哈齐雅（Acazías）时代，以坚强的勇气在悖逆的子民面前捍卫唯一天主的权利，以至不仅预示了若翰洗者，更预示了基督本人。他未留下书面的神谕，但其纪念一直忠实地被保存，尤其在加尔默罗山。

**3\\.** 纪念真福若瑟（Ioseph），号称巴尔撒巴（Barsábbas），别名犹斯托（Iustus），主的门徒。宗徒们将他与圣玛弟亚一同推举，使其中一人填补叛徒犹达斯的宗徒职位。虽然签落在玛弟亚身上，他仍不懈地以宣讲与圣善的生活事奉主（一世纪）。

**4\\.** 在丕息狄雅之安提约基雅（Antiochía in Pisídia），圣玛利纳（又名玛加利大）（Marína seu Margaríta），据传以童贞与殉道将肉身献给了基督（年代不详）。

**5\\.** 在埃塞俄比亚（Æthiópia），圣弗鲁门齐奥（Fruméntius），主教。初为该地之俘虏，后由圣亚大纳削祝圣为主教，在该地区传播了福音（四世纪）。

**6\\.** 在迦太基（Carthágo），圣奥雷利奥（Aurélius），主教，教会最坚固的柱石。保护信众免受异教陋俗的侵蚀，并将主教座堂设于天后女神（dea Cæléstis）偶像之所在处（约430年）。

**7\\.** 在高卢之布洛涅地区（pagus Bononiénsis Gálliæ），圣武尔马洛（Vulmárus），司铎。出身卑微的牧人，被引导向学业后获得司铎圣职。仿效古代教父，隐居旷野。后在其故乡埃诺（Hannónia）之奥特蒙（Altomónte）林中创建两座修院：一为男修士，一为贞女（约700年）。

**8\\.** 在西班牙汪达尔地区之科尔多瓦（Córduba in Vandalícia），圣保禄（Paulus），执事、殉道。受圣西瑟南多（Sisenándus）之言行激励，不惧在摩尔人的王公与权贵面前斥责其虚妄的崇拜，宣认基督为真天主而被处死（851年）。

**9\\*.** 在日耳曼萨克森之希尔德斯海姆（Hildésia in Saxónia），真福贝尔纳尔多（Bernárdus），主教。虽双目失明，仍在和平中治理教会二十三年（1153年）。

**10\\.** 在朝鲜王朝之首尔（Seulum in Coréa），圣李永喜玛达肋纳（Magdaléna Yi Yǒng-hǔi）、李梅任德肋撒（Terésia Yi Mae-im）、金成任玛尔大（Martha Kim Sǒng-im）、金路济亚（Lúcia Kim）、金罗撒（Rosa Kim）、金长今安纳（Anna Kim Chang-gǔm）及元贵任玛利亚（María Wǒn Kwi-im），童贞，与圣李光烈若翰（Ioánnes Baptísta Yi Kwang-nyol），殉道（1839年）。

**11\\.** 在东京（Tunquínum）之南定城（Nam Đinh），圣若瑟·玛利亚·迪亚斯·桑胡尔霍（Iosephus María Díaz Sanjurjo），多明我会主教、殉道。在嗣德帝（Tự Đức）迫害肆虐之际，为信仰之故被斩首（1857年）。

**12\\.** 在中国河北省（*Hebei*）景县（*Jingxian*）之朱家河（*Zhujiahé*），圣任德芬（Leó Ignátius Mangin）与圣汤爱玲（Paulus Denn），耶稣会司铎，殉难。在义和团（*Yihetuan*）之迫害中，于教堂内竭力鼓励信众坚守信仰之际，敌人闯入，二人在祭台前被刺杀。圣朱吴氏玛利亚（María Zhou Wuzhi）与之同殉：她以身体挡护正在行圣事的任德芬神父，中伤而亡（1900年）。

**13\\.** 同在河北省应县（*Yingxian*）附近之陆家庄（*Lujiazhuang*），圣朱日新伯多禄（Petrus Zhou Rixin），殉道。在同一迫害中面对长官之逼迫，宣称不能背弃创造世界之天主，因此被斩首（1900年）。

**14\\.** 同在河北省武邑（*Wuyi*）之大刘村（*Daliucun*），圣傅桂林玛利亚（María Fu Guilin），教师。在同一迫害中被交于福音的仇敌之手，口呼救主基督之名而被斩首（1900年）。

**15\\.** 同在河北省吴桥赵家（*Wuqiao Zhaojia*），纪念圣赵郭氏玛利亚（María Zhao Guozhi）及其二女圣赵罗撒（Rosa Zhao）与圣赵玛利亚（María Zhao）。在同一迫害中，为免遭凌辱，投身于井中，被捞出后完成了殉道（1900年）。

**16\\.** 同在河北省得朝（*Dechao*），纪念圣郗柱子（Xi Guizi），殉道。尚为慕道者，在动乱中宣称自己是基督徒。遍体创伤，以自身之血受洗（1900年）。

**17\\*.** 在西班牙之马德里（Matrítum），真福丽达（痛苦圣母耶稣圣心）·普哈尔特·桑切斯（Rita a Vírgine Perdolénti a Corde Iesu Pujalte y Sánchez）及真福方济加（耶稣圣心）·阿尔德亚·阿劳霍（Francísca a Corde Iesu Aldea y Araujo），耶稣圣心仁爱修女会（Congregátio Sorórum Caritátis a Sacro Corde Iesu）童贞、殉道。内战宗教迫害期间，在学院圣堂内被教会的仇敌逮捕，旋即于路途中遭枪杀（1936年）。

### 七月二十日校注

1. **第1条（圣阿波利纳雷）**："基督那不可测量的丰富"（*investigábiles divítias Christi*）语出弗三8，从思高圣经用语。阿波利纳雷为拉文纳首任主教，据传殉道荣归。拉丁文特注其实际离世日为"七月二十三日"（*die vigésima tértia iúlii*），故本庆日非其忌日。克拉塞（Classe）为拉文纳的古代港口。

2. **第2条（圣厄里亚）**：厄里亚即旧约先知以利亚。阿哈布（列上十六29-二二40）与阿哈齐雅（列下一），名从思高圣经。本条不标年代，因厄里亚属旧约人物。加尔默罗山为厄里亚召集以色列民试验巴耳先知之处（列上十八），亦为加尔默罗隐修会之精神源头，参七月十六日第1条。

3. **第3条（真福若瑟·巴尔撒巴）**：见宗一23-26。思高圣经作"若瑟，又叫巴尔撒巴，号称犹斯托"；玛弟亚中签递补犹达斯之宗徒空缺。

4. **第10条（朝鲜殉道圣人）**：本条八位殉道者属103位朝鲜殉道圣人之列（1984年教宗若望保禄二世封圣，总庆日为九月二十日）。1839年己亥教难期间于首尔殉道。朝鲜人名本身即为汉字名，翻译径用汉字对应形式。"童贞"标记仅附于元贵任玛利亚，拉丁文原文如此。

5. **第11条（越南殉道圣人）**：若瑟·玛利亚·迪亚斯·桑胡尔霍（José María Díaz Sanjurjo, OP, 1818-1857），西班牙籍多明我会会士，东京代牧区主教。嗣德帝（Tự Đức，1847-1883在位）为越南阮朝第四代皇帝。拉丁文OCR将越南文"Tự Đức"残损为"T Đúc"。

6. **第12条人名与地名**：任德芬为法籍耶稣会司铎 Léon-Ignace Mangin（1857-1900）之中文传教名，汤爱玲为法籍耶稣会司铎 Paul Denn（1847-1900）之中文传教名。朱吴氏（Zhou Wuzhi）为已婚妇女称谓：夫姓朱+本姓吴+氏。拉丁原文"Zhoujiahe"实为朱家河（Zhūjiāhé），"Zhou"应为"Zhu"（朱），与七月十九日第11条注同一问题。朱家河位于今河北省景县（Jǐngxiàn），拉丁文作"Yingxian"疑为旧时教区地名习惯。任德芬与汤爱玲之中文传教名据耶稣会中华省网站核实。

7. **第13条人名**：朱日新之姓氏同上，应为朱（Zhū）。陆家庄同七月十九日第11条之地点。

8. **第15条人名**：赵郭氏（Zhao Guozhi）为已婚妇女称谓：夫姓赵+本姓郭+氏。其二女赵罗撒与赵玛利亚为童贞殉道者。三人投井未死，被捞出后遭杀害。

9. **第16条人名**：拉丁原文作"Xi Guizi"，但据香港教区档案处，此人中文名为郗柱子（Xī Zhùzǐ），"Guizi"与"Zhuzi"差异甚大，疑拉丁文有误。郗柱子尚为慕道者即殉道，以自身之血完成洗礼，教会传统称此为"血洗"（*baptísmus sánguinis*）。

10. **第17\\*条（西班牙殉道真福）**：1936年西班牙内战期间的宗教迫害。耶稣圣心仁爱修女会为西班牙本土修会。

---

## 七月二十一日

**Die 21 iúlii** · 八月初一前第十二日（*Duodécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10 11 12 13 14
> A B C D E F F G H M N P
> 15 16 17 18 19 20 20 21 22 23 24 25

**1\\.** 布林迪西的圣老楞佐（Lauréntius de Brundúsio），司铎、教会圣师。入方济各嘉布遣小兄弟会（Fratres Minóres Capuccíni）后，在欧洲各地不倦地宣讲：保卫教会免受异教徒侵犯，调解诸侯纷争，治理本修会。一切职务皆以简朴与谦逊履行。实于七月二十二日在葡萄牙之里斯本（Ulyssipóne in Lusitánia）辞世（1619年）。

**2\\.** 在高卢普罗旺斯之马赛（Massília in Província Gálliæ），圣维克多（Victor），殉道（约292年）。

**3\\.** 在叙利亚之厄默萨（Emésa），圣西默盎（Símeon），号称"愚者"（*Salos*）。受圣神推动，甘愿为基督被世人视为愚人和无名之辈。又纪念圣若望（Ioánnes），隐修士，约三十年间为圣西默盎的同行伴侣，与他一同行圣地朝圣之旅，又在死海（lacus Aspháltites）畔旷野中度隐修生活（四世纪）。

**4\\.** 在罗马，纪念圣普辣塞德（Praxédis），以其名在厄斯奎利诺山（Esquilínum）建有一座奉献于天主的教堂（491年以前）。

**5\\.** 在勃艮第之斯特拉斯堡（Argentorátum in Burgúndia），圣阿尔博加斯托（Arbogástus），主教（六世纪）。

**6\\*.** 在法国罗什福尔（Rupifórtium）海岸外，停泊海上的一艘肮脏囚船中，真福加俾额尔·佩尔戈（Gabriél Pergaud），司铎、殉道。圣布里厄教区博利厄修院之律修咏经司铎（canónicus reguláris），法国大革命期间因司铎身份被逐出修院，投入囚禁后染疫而获殉道之冠（1794年）。

**7\\.** 在中国陕南之宁强（*Ningqiang*）燕子砭（*Yanzibian*），阳平关（*Yangpingguan*）附近，圣郭西德（Albéricus Crescitelli），宗座外方传教会司铎、殉道。在义和团（*Yihetuan*）之迫害中，先遭酷烈殴打，几近于死。次日被缚足拖行于石铺小路至河边，遍体凌迟后终被斩首，获殉道之冠（1900年）。

**8\\.** 在中国河北省（*Hebei*）大名（*Daining*）途中，圣王玉梅若瑟（Iosephus Wang Yumei），殉道，在同一迫害中殉难（1900年）。

### 七月二十一日校注

1. **第1条（布林迪西的圣老楞佐）**：布林迪西的老楞佐（Laurentius de Brundusio, OFMCap, 1559-1619），教会圣师。出生于意大利南部之布林迪西（Brindisi），加入方济各嘉布遣会，精通多种语言（含希伯来文），以宣讲著称。1601年曾亲率基督宗教联军对抗奥斯曼军队。拉丁文特注其实际辞世日为七月二十二日，其忌日记录见七月二十二日第11条。

2. **第3条（圣西默盎·萨洛）**：萨洛（Salos，希腊文 σαλός）意为"疯子"，为东方教会"佯狂者"传统之代表人物，自愿以癫狂行为隐藏圣德，以唤醒世人。厄默萨（Emesa）即今叙利亚之霍姆斯（Homs）。"死海"拉丁文作 *lacus Asphaltites*（沥青湖），为其古名。

3. **第6\\*条（法国大革命殉道者）**：1794年罗什福尔（Rochefort）海岸外囚船上之殉道司铎，与七月十六日至十七日之奥朗日殉道修女属同一时代背景。另一位罗什福尔殉道者见七月二十二日第13\\*条。

4. **第7条人名与地名**：郭西德为意大利籍宗座外方传教会（PIME）司铎 Alberico Crescitelli（1863-1900）之中文传教名。燕子砭（Yanzibian）与阳平关（Yangpingguan）均在今陕西省汉中市宁强县境内，属汉中教区。拉丁文未标"河北省"，正确记录了此殉道发生于中国（*in Sinis*），而非河北。

5. **第8条（圣王玉梅）**：大名（Daining）为今河北省邯郸市大名县。拉丁文中"Iomnienínam"疑为OCR损坏之地名，据地理位置推测或为永年（Yǒngnián）等大名附近之县镇。

6. **条目归属更正**：拉丁文OCR将第8\\*至15条置于"Die 22 iulii"标题之后，西语官方译本亦将这些条目归于七月二十二日。据此确认第8\\*至15条属七月二十二日，非七月二十一日。

---

## 七月二十二日

**Die 22 iúlii** · 八月初一前第十一日（*Undécimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 27 28 29 30 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
> A B C D E F F G H M N P
> 16 17 18 19 20 21 21 22 23 24 25 26

**1\\.** 圣玛利亚·玛达肋纳（María Magdaléna）之庆日。主耶稣从她身上赶出七个魔鬼，使她成为自己的门徒。她追随主直至加尔瓦略山，在逾越节清晨最先得见从死者中复活的救主，并将复活的喜讯报告给其余门徒（一世纪）。

**2\\.** 在迦拉达之安基拉（Ancýra in Galátia），圣柏拉图（Plato），殉道（三至四世纪）。

**3\\.** 在非洲，玛西利塔诺诸圣殉道者（mártyres Massilitáni），圣奥斯定（Augustínus）曾在其瞻礼日发表讲道（三至四世纪）。

**4\\.** 在叙利亚之安提约基雅（Antiochía in Sýria），圣济利禄（Cyrillus），主教。在戴克里先（Diocletiánus）皇帝治下遭受监禁与流放（约306年）。

**5\\.** 在高加索山脉（iuga Cáucasi）之苏阿尼亚堡（castrum Suániæ），圣亚纳斯大削（Anastásius），修士。圣大玛西莫宣认者（Máximus Conféssor）之门徒，为捍卫正统信仰，与师同被投入监狱、遭受酷刑。被押往此堡后，在此处或在途中辞世（662年）。

**6\\.** 在纽斯特里亚（Néustria）之丰特内尔修院（monastérium Fontanellénse），圣万德雷吉西洛（Wandregísilus），院长。辞去达戈贝尔特国王（Dagobértus rex）之朝廷后，在各处度修道生活。由鲁昂（Rothomágum）主教圣奥多恩（Audœ́nus）祝圣为司铎后，在热梅蒂科森林（silva Gemmeticénsis）创建并治理修院（约668年）。

**7\\.** 在高卢阿维尔讷地区（Gállia Arvernénsis）之美纳（Menátum），圣美讷勒奥（Meneléus），院长（约700年）。

**8\\*.** 在伦巴第之帕维亚（Pápia in Langobárdia），圣热罗尼莫（Hierónymus），主教（八世纪）。

**9\\*.** 同在伦巴第之洛迪（Laus Pompéia），圣瓜尔泰里奥（Gualtérius），仁慈济贫院（Domus hospitális Misericórdiæ）之创立者（1224年）。

**10\\*.** 在威尼斯（Venétiæ），真福比耶拉的奥斯定·方吉（Augustínus de Bugélla Fangi），多明我会司铎，在松奇诺（Soncínum）、维杰瓦诺（Viglébanum）与威尼斯施行诸多善功（1493年）。

**11\\.** 在葡萄牙之里斯本（Ulyssipóne in Lusitánia），布林迪西的圣老楞佐之忌日（*natális*），其纪念已于前日举行（1619年）。

**12\\.** 在威尔士之卡迪夫（Cardíffa in Cámbria），圣斐理伯·埃文斯（Philíppus Evans），耶稣会会士，及圣若望·劳埃德（Ioánnes Lloyd），司铎、殉道。因在本国行使司铎职务被发现，在查理二世（Cárolus rex Secúndus）治下同被处以绞刑（1679年）。

**13\\*.** 在法国罗什福尔海岸外的一艘肮脏囚船上，真福雅各伯·隆巴尔迪（Iacóbus Lombardie），里摩日（Lemovicénsis）教区司铎、殉道。在反教会大迫害期间因司铎身份遭受非人拘禁，为不治之症所消磨而殉（1794年）。

**14\\.** 在中国河北省大名（*Daining*）附近之马家庄（*Majiazhuang*），圣王安纳（Anna Wang），童贞，圣王王氏路济亚（Lúcia Wang Wangzhi）及其子圣王天庆安德肋（Andréas Wang Tianqing），殉道。在义和团之迫害中因基督之名被杀害（1900年）。

**15\\.** 同在河北省大名附近，圣王李氏玛利亚（María Wang Lizhi），殉道。在同一迫害中，一些教外人欲救其性命，劝她否认自己是基督徒，她却坦然宣称自己是基督耶稣的仆人，随即被杀（1900年）。

### 七月二十二日校注

1. **第1条（圣玛利亚·玛达肋纳）**：玛利亚·玛达肋纳（抹大拉的玛利亚）之庆日于2016年由教宗方济各提升为庆日（festum），与宗徒们的庆日同级。拉丁文第1条因首页装饰大写字母（drop cap）OCR缺失，起首处"1."及首字母"S"丢失，正文从"usque ad Calvarium montem"开始，前半句据西语版补全。

2. **第4条（圣济利禄）**：济利禄（Cyrillus）为安提约基雅主教，非亚历山大的济利禄。戴克里先（Diocletianus，284-305在位）为罗马帝国大迫害之发起者。

3. **第5条（圣亚纳斯大削）**：此为高加索之亚纳斯大削，圣大玛西莫宣认者（Maximus Confessor, c.580-662）之弟子。大玛西莫因反对"一志论"（Monothelitism）异端被逮捕流放，此弟子与师同难。苏阿尼亚堡（Suania）在今格鲁吉亚斯瓦涅季地区。

4. **第6条（圣万德雷吉西洛）**：丰特内尔修院即今法国诺曼底之圣万德里耶修院（Abbaye de Saint-Wandrille）。达戈贝尔特（Dagobert I）从世俗通行译法。热梅蒂科森林（silva Gemmeticensis）为修院所在之森林。奥多恩主教（Audoenus）即圣旺（Saint Ouen）。

5. **第11条（布林迪西的圣老楞佐忌日）**：其庆日赞辞（elogium）见七月二十一日第1条。"前日"（*prídie*）指七月二十一日。

6. **第12条（威尔士殉道圣人）**：斐理伯·埃文斯（Philip Evans, SJ, 1645-1679）为威尔士籍耶稣会士，若望·劳埃德（John Lloyd, c.1630-1679）为威尔士籍教区司铎。二人因在本国秘密行使司铎职务，于查理二世治下依"天主教阴谋案"（Popish Plot）时期之法令被处决。与七月十九日第10条（若望·普莱辛顿）属同一历史背景。

7. **第13\\*条（法国大革命殉道者）**：罗什福尔囚船殉道者，与七月二十一日第6\\*条（佩尔戈）属同一背景。

8. **第14条人名**：王安纳为童贞殉道者。王王氏（Wang Wangzhi）为已婚妇女称谓：夫姓王+本姓王+氏，即两家同姓王。王天庆为王王氏之子。

9. **第15条人名**：王李氏（Wang Lizhi）为已婚妇女称谓：夫姓王+本姓李+氏。

---

## 七月二十三日

**Die 23 iúlii** · 八月初一前第十日（*Décimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 28 29 30 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16
> A B C D E F F G H M N P
> 17 18 19 20 21 22 22 23 24 25 26 27

**1\\.** 圣彼利日大（Birgítta），修女。在瑞典（Suécia）嫁与立法官乌尔佛（Ulfo légifer），将所生八名子女以至虔之心教育成人，并以言语和榜样激励丈夫度虔敬生活。丈夫去世后，遍历各处圣所朝圣，留下关于教会首脑与肢体奥秘革新的著作，又奠定了至圣救世主修会（Ordo Sanctíssimi Salvatóris）之基础，在罗马迁归天乡（1373年）。

**2\\.** 纪念圣厄则克耳（Ezechiél），先知，布齐（Buzi）司祭之子。在充军加色丁人之地时，因上主光荣的神见而蒙拣选，被立为以色列家族的警卫。他斥责选民的不忠，预见圣城耶路撒冷将被毁灭、子民将遭流放。他自己身在俘虏之中，坚固他们的希望，并预言枯骨将要复生。

**3\\.** 在弗拉米尼亚拉文纳附近之克拉塞（Classe apud Ravénnam in Flamínia），纪念圣阿波利纳雷（Apollináris），主教，其纪念于七月二十日举行（约二世纪）。

**4\\.** 在色雷斯之比齐厄（Bízya in Thrácia），圣塞韦洛（Sevérus），殉道。在戴克里先与马克西米安皇帝时代，仿效殉道者之英勇，据传感化百夫长圣默姆农（Memnon）皈依信仰，并在搏斗中追随了他（约304年）。

**5\\*.** 在高卢普罗旺斯之马赛（Massília in Província Gálliæ），圣若望·加西亚诺（Ioánnes Cassiánus），司铎。创建两座修院，一为男修士，一为贞女。凭借长年修道生活之经验，撰写了《修院制度》（*De Cœnobíticis Institútis*）与《教父谈话录》（*Collatiónes Patrum*），以造就修道者（约435年）。

**6\\*.** 同在普罗旺斯之西梅莱（Ciméla），圣瓦莱里亚诺（Valeriánus），主教。从莱兰（Lirinénsis）修院擢升主教之位后，以圣人行传为信众及修士树立楷模（约460年）。

**7\\*.** 在托斯卡纳之奥尔维耶托（Urbevétum in Túscia），真福若安纳（Ioánna），童贞，圣多明我补赎会修女（Soror de Pæniténtia Sancti Domínici），以爱德与忍耐著称（1306年）。

**8\\*.** 在西班牙新卡斯蒂利亚之曼萨纳雷斯（Manzanares in Nova Castélla），真福尼切佛洛（耶稣与玛利亚）·迪耶斯·特赫里纳（Nicéphorus a Iesu et María [Vincéntius] Díez Tejerina），司铎，及五位同伴，苦难会（Congregátio Passiónis）会士、殉道。宗教迫害期间，因忠于修道圣召，被枪杀而获殉道之冠（1936年）。

**9\\*.** 同在西班牙马德里附近之下卡拉班切尔（Carabanchel Bajo），在同一迫害中，真福赫尔马诺（耶稣与玛利亚）·佩雷斯·希梅内斯（Germánus a Iesu et María [Emmanuél] Pérez Giménez），司铎，及八位同伴，同属苦难会会士、殉道。为基督完成了胜利的搏斗（1936年）。

**10\\*.** 同在西班牙之托莱多（Tolétum），真福伯多禄·鲁伊斯·德·洛斯·帕尼奥斯（Petrus Ruiz de los Paños）与若瑟·萨拉·皮科（Iosephus Sala Picó），教区工人司铎善会（Institútum Sacerdótum operariórum diœcesanórum）司铎、殉道，在同一迫害中被杀害（1936年）。

**11\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau prope Monáchium Baváriæ），真福克里斯蒂诺·贡杰克（Christínus Gondek），方济各小兄弟会司铎、殉道。祖国波兰沦于一敌视人性尊严与宗教之政权统治之下，因基督信仰之故被强行押入集中营，受尽酷刑后获得光荣之冠（1942年）。

**12\\*.** 在斯洛伐克之普雷绍夫（Epéries in Slováchia），真福巴西略·霍普科（Basílius Hopko），普雷绍夫辅理主教、殉道。在一敌视基督信仰与教会之政权统治期间，因服务拜占廷礼信友而被投入监狱，忍受酷刑与漫长痛苦的疾病直至死亡，获得胜利的棕枝（1976年）。

### 七月二十三日校注

1. **第1条（圣彼利日大）**：彼利日大（Birgitta, 1303-1373），瑞典贵族妇女，八子之母，其中一女为圣加大利纳（Catharina Suecica）。丈夫乌尔佛（Ulf Gudmarsson）为瑞典王国立法官。丈夫去世后创立至圣救世主修会（又称彼利日大会），并力促教宗自亚维尼翁回归罗马。1999年教宗若望保禄二世宣布为欧洲主保圣人之一。"彼利日大"从《每日颂祷》译名。

2. **第2条（圣厄则克耳）**：厄则克耳为旧约先知，名从思高圣经。"布齐司祭之子"见厄一3。"上主光荣的神见"见厄一-三章。"以色列家族的警卫"见厄三17（思高圣经作"警卫"）。"枯骨将要复生"见厄三十七1-14（枯骨复生神见）。本条不标年代。

3. **第3条（圣阿波利纳雷）**：交叉引用七月二十日第1条。拉丁文"cuius memória die vigésima iúlii celebrátur"确认其庆日为七月二十日。

4. **第5\\*条（圣若望·加西亚诺）**：若望·加西亚诺（Ioannes Cassianus, c.360-c.435），修道灵修学大师，曾在埃及沙漠修行多年。其《修院制度》（De Institutis Coenobiorum）与《教父谈话录》（Collationes Patrum）为西方修道传统之奠基之作。加西亚诺（Cassianus）从拉丁文后缀规则：-ius → -io → 亚诺。

5. **第6\\*条（圣瓦莱里亚诺）**：莱兰（Lérins）修院为五世纪高卢最重要的修道中心之一，位于今法国戛纳附近之莱兰群岛。西梅莱（Cimiez/Cimela）在今法国尼斯附近。

6. **第8\\*-10\\*条（西班牙内战殉道真福）**：三条均涉及1936年西班牙内战期间的宗教迫害。苦难会（Congregatio Passionis，又称受难会）为传教修会。拉丁原版脚注10、11分别列出第8\\*条五位及第9\\*条八位同伴之姓名，此处从略。教区工人司铎善会（第10\\*条）为西班牙本土教区司铎团体。

7. **第11\\*条（真福克里斯蒂诺·贡杰克）**：波兰籍方济各小兄弟会士，1942年在纳粹德国达豪集中营殉难。"敌视人性尊严与宗教之政权"（*regímen humánæ dignitáti ac religióni infénsus*）指纳粹政权。

8. **第12\\*条（真福巴西略·霍普科）**：斯洛伐克希腊天主教（拜占廷礼）辅理主教，1976年在共产政权迫害下殉难。"敌视基督信仰与教会之政权"（*regímen Christi fídei et Ecclésiæ infénsus*）指捷克斯洛伐克共产政权。普雷绍夫（Prešov/Eperjes）位于今斯洛伐克东部。

---

## 七月二十四日

**Die 24 iúlii** · 八月初一前第九日（*Nono Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 29 30 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17
> A B C D E F F G H M N P
> 18 19 20 21 22 23 23 24 25 26 27 28

**1\\.** 圣沙尔贝勒（若瑟）·马赫卢夫（Sarbélius [Iosephus] Makhlūf），黎巴嫩马龙尼礼修会（Ordo Libanénsium Maronitárum）司铎。一心追求严格的独修生活与更高的成全之境，离开黎巴嫩之安纳亚（Annáia）修院退入旷野，以极度严苦的生活、斋戒与祈祷日夜事奉天主。实于十二月二十四日安息于主（1898年）。

**2\\.** 在托斯卡纳之沃尔西尼（Volsínii in Túscia），圣基斯蒂纳（Christína），童贞、殉道（年代不详）。

**3\\.** 在萨宾（Sabína）萨拉里亚大道旁之阿米泰尔诺（Amitérnum），圣维克多利诺（Victorínus），殉道（约四世纪）。

**4\\*.** 在卡拉布里亚之陶里亚诺（Tauriánum in Calábria），圣方蒂诺长老（Fantínus Sénior），号称"行奇迹者"（*Thaumatúrgus*）（四世纪）。

**5\\.** 在特拜德（Thebáis），圣欧弗拉西亚（Euphrásia），童贞。出身元老世家，却甘愿在旷野中度隐修生活，谦卑、贫穷、服从（五世纪）。

**6\\*.** 在爱尔兰莫莫尼亚省之阿尔德莫尔（Ardmóre in Momónia Hibérniæ），圣德克兰（Declánus），该教会奉为首位主教（约五世纪）。

**7\\*.** 在阿基坦阿尔比地区（pagus Albigénsis Aquitániæ），圣西戈莱纳（Sigoléna），修女（约六世纪）。

**8\\.** 在罗斯（Rússia），圣鲍里斯（Boris）与圣格列布（Gleb），殉道。罗斯王公，圣弗拉基米尔（Vladimírus）之子。宁愿赴死，不愿以暴力对抗兄长斯瓦托波尔克（Suatópolcus）。鲍里斯在佩列亚斯拉夫（Pereislávla）附近之阿尔塔河（Alta）畔获殉道之棕枝，格列布不久后在斯摩棱斯克（Smolénskum）附近之第聂伯河（Borísthenes）畔殉难（1015年）。

**9\\*.** 在萨宾之列阿泰（Reáte），圣巴尔杜伊诺（Balduínus），院长。圣贝尔纳尔多在克莱尔沃（Claravállum）修院之弟子，受其师派遣至此城创建并治理湖畔圣玛窦修院（cœnóbium Sancti Matthái sub Lacu）（1140年）。

**10\\*.** 在布拉班特（Brabántia）之圣特鲁伊登（Sancti Trudónis Fanum），真福基斯蒂纳（Christína），号称"奇异者"（*Mirábilis*），童贞。因天主在她身上以奇异的方式行了大事，使她肉身受苦、精神被提（约1224年）。

**11\\.** 在波兰塔尔诺夫（Tarnóvia）附近之桑德茨（Sandécia），圣金佳（又名贡内贡德）（Kinga seu Cunegúndis）。匈牙利国王之女，嫁与博莱斯瓦夫公爵（Boleslaus dux），与夫共守完整的童贞。丈夫去世后，在其亲手创建的修院中发愿遵守圣佳兰会规（1292年）。

**12\\*.** 在艾米利亚之费拉拉（Ferráriæ in Æmília），真福若望·塔韦利·迪·托西尼亚诺（Ioánnes de Tossiniáno Tavelli），主教，耶稳会（Ordo Iesuatórum）会士（1446年）。

**13\\.** 在洛塔林吉亚之科隆（Colónia Agrippína in Lotharíngia），三王迁葬（translátio trium magórum）。三王乃来自东方的贤士，携礼物前往白冷（Bethléhem），在一婴孩中瞻仰了圣子独生的崇高奥迹（1162年）。

**14\\*.** 在维斯蒂尼之阿奎拉（Aquila in Vestínis），真福安多尼·托里亚尼（Antónius Torriánus），圣奥斯定隐修会（Ordo Eremitárum Sancti Augustíni）司铎，身灵之医者（1494年）。

**15\\*.** 在萨瓦的奥尔布（Orbe in Sabáudia），真福路易莎（Ludovíca），修女。真福阿马德奥公爵（Amadéus dux）之女，嫁与沙隆的于格王公（Hugo prínceps de Chalon）。丈夫去世后，以谦卑忠诚发愿遵守圣佳兰会规，从圣高莱德（Coléta）之改革（1503年）。

**16\\*.** 在英格兰之德比（Derébia），真福尼各老·加利克（Nicoláus Garlick）、罗伯特·拉德拉姆（Robértus Ludlam）与理查德·辛普森（Richárds Simpson），司铎、殉道。在伊丽莎白一世（Elísabeth regína Prima）治下，历经诸多辛劳与迫害后，因司铎身份被判处死刑，经由刑台抵达天上的喜乐（1588年）。

**17\\*.** 同在英格兰之泰恩河畔纽卡斯尔（Novum Castrum ad Tinam），真福若瑟·兰布顿（Iosephus Lambton），司铎、殉道。在同一迫害中，年仅二十四岁，因司铎身份遭受惨烈酷刑后被活活肢解（1592年）。

**18\\.** 同在英格兰之达勒姆（Dunélmum），圣若望·博斯特（Ioánnes Boste），司铎、殉道。在同一女王治下因司铎身份殉道，即使在审判官面前仍不停地坚固同伴的信仰（1594年）。

**19\\.** 在东京（Tunquínum）之南定城（Nam Đinh），圣若瑟·费尔南德斯（Iosephus Fernández），多明我会司铎、殉道。在明命帝（Minh Mạng）治下为基督被斩首（1838年）。

**20\\*.** 在坎帕尼亚之那不勒斯（Neápolis in Campánia），真福莫德斯蒂诺（耶稣与玛利亚）·马扎雷洛（Modestínus a Iesu et María [Domínicus] Mazzarello），方济各小兄弟会司铎。一心亲近各种贫困与受苦之人，在瘟疫期间因照顾垂死病人而感染霍乱身亡（1854年）。

**21\\*.** 在西班牙之瓜达拉哈拉（Guadalaxára），真福玛利亚·比拉尔（圣方济各·鲍尔日亚）·马丁内斯·加西亚（María a Colúmna a Sancto Francísco Bórgia [Iacóba] Martínez García）、德肋撒（耶稣圣婴）·加西亚·加西亚（Terésia a Iesu Infánte [Eusébia] García García）及玛利亚·安日拉（圣若瑟）·巴尔蒂耶拉·托尔德西利亚斯（María Ángela a Sancto Iosépho [Marciána] Voltierra Tordesillas），加尔默罗赤足修女会（Ordo Carmelitárum Discalceatárum）童贞、殉道。宗教迫害期间，欢欣地向基督净配高呼而获殉道之冠（1936年）。

**22\\*.** 同在西班牙之巴塞罗那（Barcínona），真福玛利亚·梅瑟德·普拉特（María a Mercéde Prat），圣女德肋撒善会（Sociétas a Sancta Terésia a Iesu）童贞、殉道。在同一风暴中，因修女身份而完成了殉道（1936年）。

**23\\*.** 同在巴塞罗那，真福沙维耶·博尔达斯·皮费雷尔（Xavérius Bordas Piferrer），慈幼会（Sociétas Salesiána）修士、殉道。以殉道见证了自己是基督导师的门徒（1936年）。

### 七月二十四日校注

1. **第1条（圣沙尔贝勒·马赫卢夫）**：沙尔贝勒（Sharbel/Charbel, 1828-1898），黎巴嫩马龙尼礼修士，原名若瑟（Youssef）。入会后取名沙尔贝勒，纪念二世纪安提约基雅殉道者。1875年获准度独修生活，至1898年圣诞前夕辞世。教宗保禄六世于1977年封圣。拉丁文特注辞世日为十二月二十四日。安纳亚（Annaya）修院位于黎巴嫩北部。

2. **第8条（圣鲍里斯与圣格列布）**：罗斯（Rus'）王公，基辅大公圣弗拉基米尔之子。1015年弗拉基米尔去世后，长兄斯瓦托波尔克为夺权而杀害二人。鲍里斯与格列布宁死不反抗，为东方教会极重要的殉道圣人。拉丁文以古名"Borysthenes"称第聂伯河。

3. **第11条（圣金佳）**：金佳（Kinga/Cunegundis, 1234-1292），匈牙利贝拉四世之女，嫁波兰克拉科夫公爵博莱斯瓦夫五世。二人以"若瑟式婚姻"（virginal marriage）守贞。圣佳兰会规即方济各贫穷修女会（Poor Clares）会规。

4. **第12\\*条**：西语版误标年份为1146年，应为1446年。耶稳会（Jesuati/Gesuati）系1360年由真福哥伦比尼创立之修会，1668年教宗克雷芒九世令裁撤，非耶稣会（Societas Iesu）。

5. **第13条（三王迁葬）**：三王遗骸原藏于米兰，1162年由神圣罗马帝国皇帝腓特烈一世下令迁往科隆。白冷（Bethlehem）从思高圣经译名。

6. **第16\\*-18条（英格兰殉道者）**：三条涉及伊丽莎白一世（1558-1603在位）治下之天主教殉道司铎。加利克、拉德拉姆与辛普森在德比同日殉道（1588年）；兰布顿年仅24岁在纽卡斯尔殉道（1592年）；博斯特在达勒姆殉道（1594年）。博斯特为圣人（*sanctus*），兰布顿及其余三人为真福（*beati*）。

7. **第19条（越南殉道圣人）**：若瑟·费尔南德斯（José Fernández, OP, 1775-1838），西班牙籍多明我会司铎，越南北圻传教。明命帝（Minh Mạng, 1820-1841在位）为越南阮朝第二代皇帝，在位期间大规模迫害天主教。

8. **第21\\*-23\\*条（西班牙内战殉道者）**：三条均为1936年西班牙内战期间殉道者。第21\\*条三位加尔默罗赤足修女在瓜达拉哈拉殉道；第22\\*条圣女德肋撒善会修女在巴塞罗那殉道；第23\\*条慈幼会修士在巴塞罗那殉道。

---

## 七月二十五日

**Die 25 iúlii** · 八月初一前第八日（*Octávo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 30 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18
> A B C D E F F G H M N P
> 19 20 21 22 23 24 24 25 26 27 28 29

**1\\.** 圣雅各伯宗徒庆日。载伯德之子，圣若望圣史之兄弟。与伯多禄及若望同为耶稣显圣容与主山园祈祷的见证人。在逾越节前被黑落德·阿格黎帕斩首，为宗徒中第一位获得殉道之冠者（一世纪）。

**2\\.** 在吕基亚（Lýcia），圣克里斯托佛罗（Christóphorus），殉道（年代不详）。

**3\\.** 在塔拉戈纳西班牙之巴塞罗那（Barcínona in Hispánia Tarraconénsi），圣谷古法托（Cucuphátis），殉道。在戴克里先皇帝之迫害中被刀剑击杀，胜利地迁入天乡（四世纪）。

**4\\.** 在巴勒斯坦之凯撒勒雅（Cæsaréa in Palæstína），圣瓦伦蒂纳（Valentína）、特亚（Thea）与保禄（Paulus），殉道，在马克西米安皇帝之迫害中、总督菲尔米利亚诺（Firmiliánus）治下殉难。童贞瓦伦蒂纳以脚踢翻为偶像所立之祭坛，在酷刑之后与童贞特亚一同被投入火中，奔向了净配。保禄则被判处死刑，求得片刻祈祷的时间，全心为众人的得救向天主祈祷后，被斩首而获殉道之冠（308年）。

**5\\.** 在比提尼亚之尼科美狄亚（Nicomedía in Bithýnia），圣奥林比亚德（Olýmpias）之瞻礼（*transitus*）。年轻时即丧偶，此后在君士坦丁堡于奉献给天主的妇女之中虔敬地度过余生，服事穷人。始终忠于圣若望·金口（Ioánnes Chrysóstomus），甚至追随他的流放（408年）。

**6\\.** 在奥斯特拉西亚莱茵兰之特里尔（Tréviri in Rhenánia Austrásiæ），圣马涅里科（Magnéricus），主教。圣尼切齐奥（Nicétius）之门徒，在其师流放时忠心相伴，继任主教后以同样的牧灵热忱效法乃师（约596年）。

**7\\*.** 同在特里尔，圣贝亚托（Beátus）与圣班托（Bantus），司铎。在圣马涅里科时代度隐修生活（六至七世纪）。

**8\\*.** 在比利时高卢之梅斯（Metis in Gállia Bélgica），圣格洛德辛德（Glodesíndis），女院长（六世纪）。

**9\\.** 在西班牙汪达尔地区之科尔多瓦（Córduba in Vandalícia），圣德奥德米洛（Theodemírus），卡莫纳（Carmonénsis）修士、殉道。年纪尚轻，即在摩尔人之迫害中殉难（851年）。

**10\\*.** 在法国之昂热（Andégavum in Gállia），真福若望·索雷特（Ioánnes Soreth），加尔默罗会司铎。引导修会迈向更严格的遵守，并增设修女会院（1471年）。

**11\\*.** 在意大利皮切诺之卡梅里诺（Camerínum in Picéno），真福伯多禄·科拉迪尼·迪·莫利亚诺（Petrus de Molliáno Corradini），方济各小兄弟会司铎，以福音宣讲、德行表率与奇迹之声誉著称（1490年）。

**12\\*.** 在印度之萨尔塞特（Salséte in India），真福殉道者鲁道夫·阿夸维瓦（Radúlphus Aquaviva）、阿方索·帕切科（Alphónsus Pacheco）、伯多禄·贝尔纳（Petrus Berna）与安多尼·弗朗西斯科（Antónius Francisco），司铎，及方济各·阿拉尼亚（Francíscus Aranha），修士，均属耶稣会。因高举十字架而被异教徒杀害（1583年）。

**13\\*.** 在阿普利亚之博维诺（Bobínum in Apúlia），真福安多尼·卢奇（Antónius Lucci），方济各住院小兄弟会主教。以卓越的学识著称，全心赈济穷人，竟至不顾自身之所需（1752年）。

**14\\*.** 在法国罗什福尔海岸外停泊之囚船上，真福弥额尔·路易·布吕拉尔（Michaél Ludovícus Brulard），加尔默罗赤足会司铎、殉道。法国大革命期间因司铎身份遭受非人拘禁，终为疾病所吞噬（1794年）。

**15\\*.** 在西班牙之马德里（Matrítum），真福玛利亚·加尔默罗·萨耶斯·巴兰盖拉斯（María a Monte Carmélo Sallés y Barangueras），童贞。为培育虔诚且有教养的妇女，创立了无染原罪修女会（Congregátio Sorórum ab Immaculáta Conceptióne）（1911年）。

**16\\*.** 在西班牙托莱多省之乌尔达（Urda），真福殉道者伯多禄（圣心）·雷东多（Petrus a Corde Redondo），司铎，斐理斯（五伤）·乌加尔德·伊鲁尔顺（Felix a Quinque Vulnéribus Ugalde Irurzun）及本笃（维利亚尔圣母）·索拉诺·鲁伊斯（Benedíctus a Vírgine « del Villar » Solano Ruiz），苦难会修士。在宗教大迫害中为基督信仰而被枪杀，获殉道之棕枝（1936年）。

**17\\*.** 同在西班牙托莱多省、塔拉韦拉德拉雷纳（Eboram Carpetanórum）附近，真福殉道者斐德理科（卡洛斯）·鲁维奥·阿尔瓦雷斯（Fridéricus [Cárolus] Rubio Alvarez），司铎，普里莫·马丁内斯·德·圣文森特·卡斯蒂略（Primus Martínez de San Vicente Castillo）、热罗尼莫·奥乔亚·乌尔丹加林（Hierónymus Ochoa Urdangarín）与若望（十字架）（厄利日奥）·德尔加多·帕斯托尔（Ioánnes a Cruce [Elígius] Delgado Pastor），均属天主教仁爱修会（Ordo Sancti Ioánnis a Deo）修士、殉道。在同一迫害中迅即获得光荣之冠（1936年）。

**18\\*.** 在西班牙阿拉贡韦斯卡附近之蒙松（Monzon prope Oscam in Aragónia），真福狄奥尼削·潘普洛纳（Dionýsius Pamplona），圣母虔学会（Ordo Clericórum Regulárium Scholárum Piárum）司铎、殉道。在同一时期为信仰之故被杀害（1936年）。

**19\\*.** 在西班牙格拉纳达海滨之莫特里尔（Motril apud Granátam），真福殉道者德奥格拉齐亚斯·帕拉西奥斯（Deográtias Palacios）、莱翁·因乔斯蒂（Leo Inchausti）、若瑟·拉达（Iosephus Rada）与儒利安·莫雷诺（Iuliánus Moreno），司铎，及若瑟·里卡尔多·迪耶斯（Iosephus Richárds Díez），修士，均属奥斯定归省会（Ordo Augustinianórum Recollectórum）。在同一迫害中突遭暴民拘捕，即刻于路途中被枪杀（1936年）。

**20\\*.** 在波兰之杰亚乌多沃（Działdowo）集中营，真福玛利亚·德肋撒·科瓦尔斯卡（María Terésia Kowalska），嘉布遣佳兰修女会（Clarissæ Capuccínæ）童贞、殉道。祖国波兰在战争中遭军事占领期间，因坚守信仰被投入监狱，在基督信仰中度过了最后时日（1941年）。

### 七月二十五日校注

1. **第1条（圣雅各伯宗徒）**：庆日（*festum*）。载伯德（Zebedaeus）、雅各伯（Iacobus）、若望（Ioannes）、伯多禄（Petrus）、黑落德·阿格黎帕（Herodes Agrippa）均从思高圣经。黑落德·阿格黎帕杀雅各伯事见宗十二1-2。首字母因OCR缺失，据西语版补全。

2. **第4条（凯撒勒雅殉道者）**：凯撒勒雅从思高圣经。瓦伦蒂纳踢翻偶像祭坛的细节为殉道圣人录中罕见的女性反抗暴行描写。菲尔米利亚诺（Firmilianus）为罗马总督。

3. **第5条（圣奥林比亚德）**：奥林比亚德（Olympias, c.361-408），君士坦丁堡著名女执事，若望·金口（John Chrysostom）最重要的支持者之一。若望·金口遭流放后，她仍通过书信忠心追随，最终在流放中去世。拉丁文 *transitus*（瞻礼/逝世）用于此处而非 *natalis*，为较少见用法。

4. **第9条（圣德奥德米洛）**：科尔多瓦殉道者系列之一，同七月二十日第8条（圣保禄执事）、七月十九日第6条（圣奥雷亚）属同一摩尔人治下之殉道背景。卡莫纳（Carmona）为科尔多瓦附近城市。

5. **第12\\*条（印度萨尔塞特殉道者）**：1583年耶稣会传教士在印度果阿附近之萨尔塞特（Salsette）半岛传教时，因竖立十字架被当地人杀害。鲁道夫·阿夸维瓦为那不勒斯总主教之侄。

6. **第16\\*-19\\*条（西班牙内战殉道者）**：四条涉及1936年西班牙内战期间不同地区和修会的殉道者：乌尔达之苦难会修士（第16\\*条）、塔拉韦拉德拉雷纳附近之天主教仁爱修会（第17\\*条，Ordo Sancti Ioannis a Deo，即圣若望天主会）、蒙松之圣母虔学会司铎（第18\\*条）、莫特里尔之奥斯定归省会会士（第19\\*条）。

7. **第20\\*条（波兰殉道真福）**：1941年第二次世界大战期间，纳粹德国占领波兰，真福玛利亚·德肋撒·科瓦尔斯卡在杰亚乌多沃（Działdowo）集中营殉难。嘉布遣佳兰修女会（Clarissae Capuccinae）为佳兰会之嘉布遣改革支派。

---

## 七月二十六日

**Die 26 iúlii** · 八月初一前第七日（*Séptimo Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19
> A B C D E F F G H M N P
> 20 21 22 23 24 25 25 26 27 28 29 30

**1\\.** 圣若亚敬（Ioachim）与圣安纳（Anna）之纪念，荣福童贞玛利亚、天主之母的双亲。他们的名字因基督徒的古老传统而被保存。

**2\\.** 纪念圣厄辣斯托（Erástus），格林多城的司库，事奉了保禄宗徒（一世纪）。

**3\\.** 在曼图亚地区波河（Padus）畔之圣本笃修院（monastérium Sancti Benedícti），圣西默盎（Símeon），修士、隐修士（1016年）。

**4\\*.** 在阿基坦之奥什（Augústa Auscórum in Aquitánia），圣奥斯坦多（Austíndus），主教。建造本城主教座堂，改良民风，修建天主的圣殿（1068年）。

**5\\*.** 在威尼托之维罗纳（Veróna in Venétia），真福额万日斯塔（Evangelísta）与佩莱格里诺（Peregrínus），司铎（十二至十三世纪）。

**6\\*.** 在意大利皮切诺之萨索费拉托（Saxoferrátum in Picéno），真福乌戈·德·阿克蒂斯（Hugo de Actis），圣本笃会西尔韦斯特里诺修会（Congregátio Silvestrinórum Ordinis Sancti Benedícti）修士（1250年）。

**7\\*.** 同在皮切诺之赛滕佩达（Septémpeda，今圣塞韦里诺-马尔凯），真福卡米拉·真蒂利（Camílla Gentili），殉道。被不虔诚的丈夫杀害（十四至十五世纪）。

**8\\*.** 在英格兰泰恩河畔纽卡斯尔附近之盖茨黑德（Gateshead），真福若望·英格拉姆（Ioánnes Ingram），司铎、殉道。英格兰人，在拉特朗大殿晋铎后赴苏格兰传教，后越境入英格兰，在伊丽莎白一世治下因司铎身份被处绞刑（1594年）。

**9\\*.** 同在英格兰之达灵顿（Darlingtónium），真福乔治·斯沃洛威尔（Geórgius Swallowell），殉道。在与天主教会重归共融的同一年即被判处死刑。尽管在遭受残酷折磨时曾极度惊惧，仍坚守天主教信仰，承受了最惨烈的酷刑（1594年）。

**10\\*.** 同在英格兰之兰开斯特（Lancástria），真福厄德华·特温（Eduárdus Thwing），多明我会会士，与罗伯特·纳特（Robértus Nutter），司铎、殉道。在主的葡萄园中辛勤劳作之后，在伊丽莎白一世治下因司铎身份被判处死刑，完成了光荣的殉道（1600年）。

**11\\*.** 同在英格兰之伦敦（Londínium），真福威廉·韦伯斯特（Guliélmus Webster），司铎、殉道。在各处监狱中服务长达二十余年。在查理一世（Cárolus Primus）治下，奉议会之令因司铎身份被捕，在泰伯恩（Tybúrnum）刑场被处绞刑而完成殉道（1641年）。

**12\\*.** 在安南之富安（Phú Yên），真福安德肋（Andréas），传道员、殉道。当反对基督教义的迫害愈演愈烈之际，被兵丁蛮横逮捕，为基督倾洒了热血。他是这片土地上教会的初果（1644年）。

**13\\*.** 在法国罗什福尔海岸外停泊之肮脏囚船上，真福马尔切洛·戈谢里·拉比涅·德·雷涅福尔（Marcéllus Gauchérii Labigne de Reignefort），传教士会会士，与伯多禄·若瑟·勒格鲁安·德·拉罗马热尔（Petrus Iosephus Le Groing de La Romagère），司铎、殉道。前者任职于里摩日教区，后者任职于布尔日教区，法国大革命期间因仇视宗教而遭受非人拘禁，终为饥饿与疾病所吞噬（1794年）。

**14\\*.** 同在法国之奥朗日（Arausióne），真福玛利亚·玛加利大（圣奥斯定）·博内（María Margaríta a Sancto Augustíno Bonnet）及四位同伴，圣乌尔苏拉修女会（Ordo Sanctæ Ursulæ）童贞，在同一风暴中获殉道之冠（1794年）。

**15\\.** 在伦巴第之洛韦雷（Lúere in Langobárdia），圣巴尔多禄茂（Bartholomǽa Capitanio），童贞。与圣味增济亚·杰罗萨（Vincéntia Gerosa）共同创立圣母仁爱修女会（Institútum Sorórum a Caritáte a María Infánte）。年仅二十七岁，虽为肺痨所击倒，实则为爱德所焚尽（1833年）。

**16\\*.** 在西班牙格拉纳达海滨之莫特里尔（Motril apud Granátam），真福文森特·皮尼利亚（Vincéntius Pinilla），奥斯定归省会会士，与厄玛奴耳·马丁·西耶拉（Emmanuél Martín Sierra），司铎、殉道。在宗教迫害期间，五位同伴殉道翌日，二人被从教堂中强行拖出，以弹枪射杀（1936年）。

**17\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福弟铎·布兰茨马（Titus Brandsma），加尔默罗会司铎、殉道。荷兰人，为捍卫教会与人的尊严，以平静的心灵忍受了种种苦难与凌辱，对同囚者及刑吏均展现出卓越的爱德典范（1942年）。

**18\\*.** 在马耳他岛之瓦莱塔（Vallétta in ínsula Meliténsi），真福乔治·普雷卡（Geórgius Preca），司铎。满怀爱心致力于儿童的教理培育，创立基督要理善会（Sociétas Doctrínæ Christiánæ），为见证天主圣言、将之传播于民众（1962年）。

### 七月二十六日校注

1. **第1条（圣若亚敬与圣安纳）**：纪念（*memória*）。若亚敬与安纳之名不见于圣经正典，而出自早期基督徒传统（主要来自二世纪外典《雅各伯原始福音》）。拉丁文第1条因OCR首字母缺失，据西语版补全。

2. **第2条（圣厄辣斯托）**：厄辣斯托见罗十六23（"全城的司库厄辣斯托"）及弟后四20，名从思高圣经。格林多（Corinthus）从思高圣经。

3. **第8\\*-11\\*条（英格兰殉道者）**：四条涉及英格兰天主教殉道者。若望·英格拉姆在盖茨黑德（1594年）、乔治·斯沃洛威尔在达灵顿（1594年），均在伊丽莎白一世治下。厄德华·特温与罗伯特·纳特在兰开斯特（1600年），亦在伊丽莎白一世治下。威廉·韦伯斯特在伦敦泰伯恩刑场（1641年），在查理一世治下，因议会颁令逮捕。

4. **第12\\*条（富安真福安德肋）**：安德肋（Andrê Phú Yên, c.1625-1644）为越南中部富安（Phú Yên，汉字"富安"）之传道员，1644年被捕殉道。他被教会尊为越南教会之"初果"（*primítia*），即该地最早的殉道者。2000年教宗若望保禄二世宣布为真福。

5. **第14\\*条（奥朗日殉道修女）**：本条圣乌尔苏拉修女会修女与七月六日至十六日间已译之奥朗日殉道修女属同一系列（参奥朗日殉道修女追踪）。拉丁原版脚注12列出四位同伴姓名。

6. **第15条（圣巴尔多禄茂·卡皮塔尼奥）**："为肺痨所击倒，实则为爱德所焚尽"（*phthísi corrépta sed pótius caritáte consúmpta*）为拉丁原文佳句。圣母仁爱修女会（Suore di Carità di Maria Bambina）至今在全球活跃。

7. **第16\\*条**：此条之五位同伴即七月二十五日第19\\*条之莫特里尔奥斯定归省会殉道者。"翌日"（*postrídie*）指翌日被杀，故本条日期为七月二十六日。

8. **第17\\*条（真福弟铎·布兰茨马）**：弟铎·布兰茨马（Titus Brandsma, OC, 1881-1942），荷兰籍加尔默罗会士、记者、大学教授。因公开反对纳粹意识形态渗透天主教学校和媒体而被捕，1942年在达豪集中营被注射致死剂杀害。2004年版为真福（*beatus*），2022年教宗方济各已将其封圣。

9. **第18\\*条（真福乔治·普雷卡）**：乔治·普雷卡（George Preca, 1880-1962），马耳他首位封圣者（2007年教宗本笃十六世封圣）。2004年版为真福，已封圣。基督要理善会在马耳他至今活跃。

---

## 七月二十七日

**Die 27 iúlii** · 八月初一前第六日（*Sexto Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
> A B C D E F F G H M N P
> 21 22 23 24 25 26 26 27 28 29 30 1

**1\\.** 纪念厄弗所七圣眠者（septem Dormiéntes Ephesi）。据传说，他们完成殉道后，安息于平安之中，期待复活之日（年代不详）。

**2\\.** 在比提尼亚之尼科美狄亚（Nicomedía in Bithýnia），圣庞达莱翁（又名庞达莱蒙）（Pantáleo vel Pantaláimon），殉道。在东方被尊为行医不取分文的医者（约305年）。

**3\\*.** 在法国汝拉山之隆勒索涅（Ledo Salinário in monte Iura Gálliæ），圣德西德拉托（Desiderátus），据信曾为贝桑松（Bisuntínus）主教（五世纪）。

**4\\.** 在罗马萨拉里亚大道旁之普利西拉墓园（cœmetérium Priscíllæ via Salária），圣策肋斯定一世（Cælestínus papa Primus），教宗。致力于捍卫教会信仰并拓展教会疆域，率先在不列颠与爱尔兰设立主教之位。在其推动下，厄弗所大公会议反对奈斯多略，以"天主之母"称号向荣福玛利亚致敬（432年）。

**5\\.** 在叙利亚之安提约基雅附近，圣西默盎（Símeon），修士。多年站立于柱顶之上，因此获得"柱头"（*Stylíta*）之称号。其生活与为人皆令人赞叹（459年）。

**6\\*.** 在法国图赖讷之洛什（Loccis in pago Turonénsi Gálliæ），安德尔河（Ingeris）畔，圣乌尔索（Ursus），院长。众多修院之父，以惊人的苦行与其他德行著称（五至六世纪）。

**7\\*.** 在弗拉米尼亚之拉文纳（Ravénna in Flamínia），圣厄克莱西奥（Ecclésii），主教。与教宗圣若望一世同受狄奥多里克王（Theodorícus rex）之酷烈迫害，独自幸存，使其教会焕发新彩（约532年）。

**8\\*.** 在法国巴斯克比利牛斯之贝亚恩地区（Beárnia ad Pyrænéos in Vascónia Gálliæ），圣加拉克托里奥（Galactórius），被尊为莱斯卡尔（Lascurrénsem）主教与殉道者（六世纪）。

**9\\.** 在奥诺里亚德（Honorías）克劳狄奥波利斯（Claudiópolis）附近之曼蒂内翁（Mantineióne），圣安图萨（Anthúsa），童贞。身为修女，在君士坦丁五世（Constantínus Coprónimus）皇帝治下因敬礼圣像而遭鞭笞与流放，终获召回故土，在平安中辞世（八世纪）。

**10\\.** 在西班牙汪达尔地区之科尔多瓦（Córduba in Vandalícia），殉道者圣乔尔乔（Geórgius），叙利亚人，执事兼修士；圣奥雷利奥（Aurélius）与圣萨比戈托纳（Sabigothóna），夫妇；及圣斐理斯（Felix）与圣莉利奥萨（Liliósa），亦为夫妇。在摩尔人之迫害中，怀着渴望为基督作证的热忱，在狱中不停地赞美基督，终被斩首（852年）。

**11\\*.** 在伊利里亚之奥赫里德（Achrídes in Illýrico），圣克肋孟（Clemens），韦利察（Velicénsis）主教。以博学与圣经知识卓著，将信仰之光带给保加利亚人民。与他一同纪念的有圣主教戈拉兹德（Gorázdus）、纳呼姆（Nahum）、萨巴（Sabas）与安杰拉里奥（Angelárius），他们在保加利亚延续了圣济利禄与圣美铎第的事业（九至十世纪）。

**12\\*.** 在施蒂里亚之加尔斯滕修院（cœnóbium Garsténse in Stíria），真福贝尔托尔多（Berthóldus），院长。对前来悔改求教或请求帮助的人，总是慷慨开门（1142年）。

**13\\*.** 在艾米利亚之皮亚琴察（Placéntia in Æmília），真福赖蒙多·帕尔美里奥（Raymúndus Palmérius），一家之父。丧偶失子后，创立收容穷人的旅舍（1200年）。

**14\\*.** 同在艾米利亚之法恩札（Favéntia），真福内沃洛内（Nevolónus），以神圣朝圣、生活苦行与隐修持守著称（1280年）。

**15\\*.** 在翁布里亚之阿梅利亚（Améria in Umbria），真福路济亚·布法拉里（Lúcia Bufalari），童贞。真福列阿泰的若望（Ioánnes de Reáte）之姊妹，圣奥斯定修会献身修女（Obláta Ordinis Sancti Augustíni），以补赎与救灵热忱著称（约1350年）。

**16\\*.** 在英格兰之斯塔福德（Statefúrtum），真福罗伯特·萨顿（Robértus Sutton），司铎、殉道。在伊丽莎白一世治下因司铎身份被处绞刑（1588年）。

**17\\*.** 在威尔士之博马里斯（Bellomaríscum in Cámbria），真福威廉·戴维斯（Guliélmus Davies），司铎、殉道。在同一迫害中，仅因司铎身份，在为在场者祈祷后被处以同一极刑（1593年）。

**18\\*.** 在伦巴第之布雷西亚（Bríxia in Langobárdia），真福玛利亚·玛达肋纳·马尔蒂嫩戈（María Magdaléna Martinengo），嘉布遣佳兰修女会女院长，以严格的苦行著称（1737年）。

**19\\*.** 在西班牙巴伦西亚省之奥列里亚（Ollería），真福若亚敬·维拉诺瓦·卡马利翁加（Ióachim Vilanova Camallonga），司铎、殉道。在反信仰的迫害中获得天上的光荣（1936年）。

**20\\*.** 同在西班牙巴塞罗那附近之义萨（Llisà），真福莫德斯托·维加斯·维加斯（Modéstus Vegas Vegas），方济各住院小兄弟会司铎、殉道。在同一反信仰的迫害中为基督倾洒了热血（1936年）。

**21\\*.** 同在西班牙之巴塞罗那（Barcínona），真福斐理伯·埃尔南德斯·马丁内斯（Philíppus Hernández Martínez）、匝加利亚·阿瓦迪亚·布埃萨（Zacharías Abadía Buesa）与雅各伯·奥尔蒂斯·阿尔苏埃塔（Iacóbus Ortíz Alzueta），慈幼会（Sociétas Salesiána）修士、殉道。在同一迫害中获殉道之冠（1936年）。

**22\\*.** 在波兰克拉科夫附近之奥斯维辛（Oświęcim seu Auschwitz），真福玛利亚·克肋孟（被钉十字架之耶稣）·斯塔舍夫斯卡（María Clemens a Iesu Crucifíxo Staszewska），圣乌尔苏拉修女会童贞、殉道。战争肆虐之际，因信仰之故被关入灭绝营的可怖牢笼，为酷刑折磨致死（1943年）。

### 七月二十七日校注

1. **第1条（厄弗所七圣眠者）**：七圣眠者为基督宗教著名传说。据传七位年轻基督徒在戴克里先迫害期间躲入厄弗所附近山洞，沉睡约二百年后苏醒，以此见证复活的真理。东西方教会均有敬礼，伊斯兰传统中亦有对应叙事（古兰经第十八章"山洞章"）。

2. **第2条（圣庞达莱翁）**：庞达莱翁（Pantaleon，希腊文 Παντελεήμων/Panteleimon，意为"全慈悲者"）为东方教会极重要的殉道圣人，与圣葛斯默（Cosmas）、圣达弥盎（Damian）同属"不收费的医者"（Anargyroi）传统。

3. **第4条（圣策肋斯定一世）**：策肋斯定一世（Celestinus I, 422-432在位）。"厄弗所大公会议"（431年）在其推动下召开，谴责君士坦丁堡宗主教奈斯多略之异端，确认圣母为"天主之母"（*Deípara*，希腊文 Θεοτόκος/Theotokos）。"不列颠与爱尔兰"之主教设立与圣巴特利爵（Patricius）赴爱尔兰传教有关。

4. **第5条（柱头圣西默盎）**：西默盎·柱头（Simeon Stylites, c.388-459），在安提约基雅附近之柱顶上生活约三十七年，为苦行修道之极端形式。西默盎从思高圣经译名。"柱头"（Stylita，希腊文 στυλίτης，源自 στῦλος"柱子"）。

5. **第10条（科尔多瓦殉道者）**：本月第四组科尔多瓦殉道者（继七月十九日奥雷亚、七月二十日保禄、七月二十五日德奥德米洛之后）。本条五人包括两对夫妇及一位叙利亚修士，均自愿走向殉道。萨比戈托纳（Sabigotho）为哥特式名字，反映汪达尔-西哥特人在伊比利亚的历史遗存。

6. **第11\\*条（圣克肋孟与同伴）**：克肋孟（Clement of Ohrid, c.840-916）为圣济利禄（Cyril）与圣美铎第（Methodius）之学生，在保加利亚延续斯拉夫传教事业。奥赫里德（Ohrid）在今北马其顿。戈拉兹德、纳呼姆、萨巴、安杰拉里奥与克肋孟合称"保加利亚五圣人"。

7. **第16\\*-17\\*条（英格兰与威尔士殉道者）**：罗伯特·萨顿在斯塔福德（1588年）、威廉·戴维斯在博马里斯（1593年），均在伊丽莎白一世治下因司铎身份殉道。

8. **第22\\*条（奥斯维辛殉道真福）**：玛利亚·克肋孟·斯塔舍夫斯卡（Maria Klemensa Staszewska, 1890-1943），波兰籍圣乌尔苏拉修女会修女。奥斯维辛（Oświęcim/Auschwitz）为纳粹德国最大的灭绝营。拉丁文用 *campus exitii*（灭绝营）而非 *castra detentionis*（集中营），措辞更为严厉。

9. **西语版独有条目**：西语版第23条（伊鲁罗/马塔罗之圣儒利安纳与圣森普罗尼亚纳）及第24条（尼科美狄亚之圣厄尔莫劳斯）为拉丁原版所无，属地方敬礼，从略不译。

---

## 七月二十八日

**Die 28 iúlii** · 八月初一前第五日（*Quinto Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21
> A B C D E F F G H M N P
> 22 23 24 25 26 27 27 28 29 30 1 2

**1\\.** 纪念圣仆洛曷洛（Prochórus）、尼加诺尔（Nicánor）、提孟（Timon）、帕尔默纳（Pármenæ）及安提约基雅的归化者尼苛劳（Nicoláus），他们是门徒中充满圣神和智慧的七位之列，宗徒们为他们覆手，使之服务于照顾贫苦者（一世纪）。

**2\\.** 在罗马，圣维克多一世（Victor papa Primus），教宗，非洲人。规定逾越圣节应由所有教会在犹太逾越节后的主日举行（约200年）。

**3\\.** 纪念众多殉道者，在德西乌斯与瓦勒良皇帝之迫害中，于埃及之特拜德（Thebáis）受难。基督徒渴望为基督之名被刀剑击杀，狡诈的仇敌却反其道而行，不愿速杀肉身，而以迟缓的酷刑试图摧残灵魂（约250年）。

**4\\.** 在卡里亚之米利都（Milétos in Chária），圣阿加齐奥（Acácius），殉道，在李锡尼（Licínius）皇帝治下（约308-311年）。

**5\\.** 在利古里亚之米兰（Mediolánum in Ligúria），圣纳匝里奥（Nazárius）与圣切尔索（Celsus），殉道。其遗体由圣盎博罗削（Ambrósius）寻获（395年发现）。

**6\\*.** 在法国之特鲁瓦（Trecæ in Gállia），圣加默利亚诺（Cameliánus），主教，圣路波（Lupus）之门徒与继任者（六世纪）。

**7\\.** 在布列塔尼之多尔（Dolum in Británnia Minóre），圣三松（Samson），院长兼主教。将在威尔士从院长圣伊尔图多（Iltúdus）处所学的福音与修道纪律传播至多姆诺尼亚（Domnónia）地区（约565年）。

**8\\*.** 在瑞典（Suécia），圣博特维德（Botvídus），殉道。瑞典人，在英格兰受洗后，献身于福传本国的事业，终被自己从奴役中赎出的一人杀害（1100年）。

**9\\.** 在东京（Tunquínum）之南定城（Nam Đinh），圣默基瑟德·加西亚·桑佩德罗（Melchior García Sanpedro），多明我会主教、殉道。为基督之故被押入极狭小的牢狱，后奉嗣德帝（Tự Đức）之命被凌迟处死（1858年）。

**10\\.** 在西班牙之马德里（Matrítum），圣伯多禄·波韦达·卡斯特罗韦尔德（Petrus Poveda Castroverde），司铎、殉道。创立德兰善会（Institútum Teresiánum）以推广基督信仰教育。迫害教会之风暴甫起，即为信仰之故被杀害，为天主作出了明确的见证（1936年）。

**11\\*.** 同在西班牙萨拉戈萨省之加瓦萨（Gábasa），真福厄玛奴耳·塞古拉（Emmanuél Segura），司铎，与达味·卡洛斯（Dávid Carlos），修士，均属圣母虔学会，在同一迫害中殉道（1936年）。

**12\\.** 同在西班牙之塔拉戈纳（Tarráco），圣雅各伯·伊拉里奥（厄玛奴耳）·巴尔巴尔·科桑（Iacóbus Hilárius [Emmanuél] Barbal Cosán），喇沙修士会（Fratres Scholárum Christianárum）修士、殉道。迫害肆虐之际，因仇恨教会而被判处死刑（1936年）。

**13\\*.** 同在西班牙之巴塞罗那（Barcínona），真福若瑟·卡塞列斯·蒙乔（Iosephus Caselles Moncho）与若瑟·卡斯特利·坎普斯（Iosephus Castell Camps），慈幼会司铎、殉道。在同一反信仰的迫害中以殉道获得永生之荣光（1936年）。

**14\\*.** 在印度喀拉拉（Kérala）之巴拉南加纳姆（Bharananganam），真福无染原罪的阿方萨（安纳）·穆塔图帕达图（Alphónsa ab Immaculáta Conceptióne [Anna] Muttathupadathu），童贞。为逃避强加的婚姻，将脚伸入火中。被马拉巴尔佳兰修女会（Claríssæ Malabarénses）接纳后，几乎终生疾病缠身，却将一生献给了天主（1946年）。

### 七月二十八日校注

1. **第1条（七位执事）**：仆洛曷洛、尼加诺尔、提孟、帕尔默纳、尼苛劳均从思高圣经（宗六5）。七位执事中另外两位为斯德望（Stephanus，十二月二十六日庆日）及斐理伯（Philippus，六月六日纪念）。尼苛劳为安提约基雅的归化者（*proselytus*），即皈依犹太教后再信基督的外邦人。

2. **第2条（圣维克多一世）**：维克多一世（Victor I, c.189-c.199在位），非洲出身，为早期最重要的教宗之一。他在"逾越节争议"（Paschal Controversy）中坚持罗马惯例，规定复活节统一于春分后第一个满月后的主日庆祝。

3. **第7条（圣三松）**：三松从思高圣经（民长纪十三-十六章）之同名译法。此圣三松非旧约人物，乃六世纪威尔士修士，后渡海至布列塔尼传教。伊尔图多（Iltudus/Illtud）为威尔士著名修院院长。多姆诺尼亚（Domnonea）为布列塔尼北部之古地名。

4. **第9条（越南殉道圣人）**：默基瑟德·加西亚·桑佩德罗（Melchor García Sampedro, OP, 1821-1858），西班牙籍多明我会主教，东京代牧区副主教。嗣德帝（Tự Đức, 1847-1883在位）为越南阮朝第四代皇帝。"凌迟"（*membris cæsus*，直译"肢体被切割"）为越南执行死刑之一种。

5. **第10条与第12条之圣品等级**：西语版将第10条（伯多禄·波韦达）标为 *beato*（真福），第12条（雅各伯·伊拉里奥·巴尔巴尔）亦标为 *beato*。拉丁文2004版正确标为 *sanctus*（圣），因二人分别于2003年及1999年封圣，均在2004版刊行之前。翻译从拉丁文。

6. **第14\\*条（真福阿方萨）**：阿方萨·穆塔图帕达图（Alphonsa Muttathupadathu, 1910-1946），印度喀拉拉邦人，为印度首位封圣者（2008年教宗本笃十六世封圣）。2004年版为真福。马拉巴尔佳兰修女会（Clarisses of the Malabar Rite）为隶属东方礼之佳兰会分支。

---

## 七月二十九日

**Die 29 iúlii** · 八月初一前第四日（*Quarto Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22
> A B C D E F F G H M N P
> 23 24 25 26 27 28 28 29 30 1 2 3

**1\\.** 圣玛尔大（Martha）之纪念。她在耶路撒冷附近之伯达尼（Bethánia）接待了主耶稣。兄弟拉匝禄死后，她向主宣认说："你是默西亚，天主子，要来到世界上的那一位。"（一世纪）

**2\\.** 纪念圣拉匝禄（Lázarus），圣玛尔大之兄弟，主曾为他的死而哭泣，又使他复活；又纪念圣玛利亚（María），拉匝禄之姊妹，当玛尔大忙碌于频繁的服侍之际，她坐在主的脚前，聆听他的话语（一世纪）。

**3\\.** 在帕弗拉戈尼亚之甘格拉（Gangra in Paphlagónia），圣加利尼科（Callínicus），殉道（二至三世纪）。

**4\\.** 在罗马波尔图恩塞大道（via Portuénsis）第三里程碑处、以其名命名之墓园中，圣斐理斯（Felix），殉道（三至四世纪）。

**5\\.** 同在罗马，杰内罗萨墓园（cœmetérium Generósæ）中，圣辛普利齐奥（Simplícius）、法乌斯蒂诺（Faustínus）、维亚特里切（Viátrix）与鲁福（Rufus），殉道（三至四世纪）。

**6\\.** 在里昂高卢之特鲁瓦（Trecæ in Gállia Lugdunénsi），圣路波（Lupus），主教。与欧塞尔的圣热尔马诺（Germánus Autissiodorénsis）一同前往布列塔尼征伐白拉奇异端（hǽresis Pelagianórum），以祈祷保护本城免受阿提拉（Attila）之蹂躏。可敬地担任司铎职务五十二年后，在平安中安息（约478年）。

**7\\.** 同在里昂高卢之奥尔良（Aureliánum in Lugdunénsi），圣普罗斯佩洛（Prósper），主教（五世纪）。

**8\\.** 在挪威之尼达罗斯（Nidarósia，今特隆赫姆），圣奥拉夫（Olávus），殉道。本族之王，将在英格兰所认识的基督信仰积极传播于本国，消灭偶像崇拜。最终遭敌人攻击，被刀剑杀害（1030年）。

**9\\*.** 在罗马圣伯多禄大殿，真福乌尔巴诺二世（Urbánus papa Secúndus），教宗。捍卫教会自由免受世俗侵犯，打击买卖圣事及品行不端之神职人员。在克莱蒙会议（Concílium Claromontánum）上劝勉基督徒军士佩戴十字架标记，解救遭异教徒压迫之弟兄并收复主的圣墓（1099年）。

**10\\.** 在法国布列塔尼之圣布里厄城（Briocénse óppidum Británniæ Minóris），圣纪廉·潘雄（Guliélmus Pinchon），主教。致力于主教座堂的建造，以仁厚和质朴著称。为保护羊群与教会权利，以无畏的坚毅忍受了严酷的迫害与流放（1234年）。

**11\\*.** 在日本之大村（Omúra），真福殉道者路易·贝尔特兰（Ludovícus Bertrán），多明我会司铎，曼肖（圣十字架）（Máncius a Sancta Cruce）与伯多禄（圣母）（Petrus a Sancta María），同会修士。为基督被投入火中（1627年）。

**12\\*.** 在法国罗什福尔海岸外之海峡中，真福夏尔·尼各老·安多尼·安赛尔（Cárolus Nicoláus Antónius Ancel），耶稣玛利亚会（Sociétas Iesu et Maríæ）司铎、殉道。法国大革命期间因司铎身份遭受非人拘禁于囚船之上，为悲惨的瘟疫所吞噬而完成殉道（1794年）。

**13\\.** 在中国贵州省（*Guizhou*）之青岩（*Qingyan*），圣张文澜若瑟（Iosephus Zhang Wenlan）与圣陈昌品保禄（Paulus Chen Changpin），修院学生，圣娄廷荫若翰（Ioánnes Baptísta Lou Tingyin），修院管理员，及圣王骆氏玛尔大（Martha Wang Louzhi），寡妇，殉道。被关在酷热潮湿的洞穴中，遭受种种残酷迫害后，终为基督信仰之故被斩首（1861年）。

**14\\*.** 在西班牙巴塞罗那附近之埃斯普卢格斯（Esplugues），真福若翰·厄戈斯库埃萨巴尔·阿尔达斯（Ioánnes Baptísta Egozcuezábal Aldaz），天主教仁爱修会（Ordo Sancti Ioánnis a Deo）修士、殉道。在反信仰的迫害中因仇恨教会而被杀害（1936年）。

**15\\*.** 同在西班牙特鲁埃尔附近之卡兰达（Calánda prope Terúlium），真福路齐奥·马丁内斯·曼切博（Lúcius Martínez Mancebo），多明我会司铎，及同伴，殉道。以基督的力量为后盾，在同一迫害中殉难（1936年）。

**16\\*.** 同在西班牙之巴伦西亚（Valéntia），真福若瑟·德·加拉桑斯·马尔克斯（Iosephus de Calasanz Marqués），慈幼会司铎、殉道。在同一迫害中为基督倾洒了热血（1936年）。

### 七月二十九日校注

1. **第1条（圣玛尔大）**：纪念（*memória*）。玛尔大（Martha）、拉匝禄（Lazarus）、玛利亚（Maria）均从思高圣经。玛尔大之宣认"你是默西亚，天主子，要来到世界上的那一位"引自若十一27，从思高圣经原文。拉丁文第1条因OCR首字母缺失，据西语版补全。2021年教宗方济各将本日纪念扩展为"圣玛尔大、圣玛利亚与圣拉匝禄纪念日"，三人合为一个庆日。2004年版仍将玛尔大单列第1条，拉匝禄与玛利亚另列第2条纪念。

2. **第2条（圣拉匝禄与圣玛利亚）**：拉匝禄复活事迹见若十一章，"主为之哭泣"见若十一35。玛利亚坐在主脚前听道事迹见路十39-40。

3. **第6条（圣路波）**：路波（Lupus, c.395-c.478），特鲁瓦主教。热尔马诺（Germanus）为欧塞尔（Auxerre）主教，二人约429年赴不列颠对抗白拉奇异端。路波以祈祷保护特鲁瓦免受匈人王阿提拉（Attila）之劫掠事迹为中世纪传说。

4. **第8条（圣奥拉夫）**：奥拉夫二世（Olav II Haraldsson, c.995-1030），挪威国王（1015-1028），挪威主保圣人。尼达罗斯（Nidaros）即今挪威特隆赫姆（Trondheim）。

5. **第9\\*条（真福乌尔巴诺二世）**：乌尔巴诺二世（Urbanus II, c.1042-1099），1095年克莱蒙会议上号召第一次十字军东征。克莱蒙会议为教宗召集之教务会议，非大公会议。"佩戴十字架标记"（*cruce signáti*）即十字军（Crusaders）一词之来源。2004年版为真福。

6. **第11\\*条（日本殉道者）**：路易·贝尔特兰（Luis Bertrán, OP, 1596-1627）为西班牙籍多明我会司铎。曼肖（Mancio）与伯多禄均为日本籍传道员，殉道前不久正式加入多明我会。Mancius 为葡萄牙语教名 Mâncio 之拉丁化，日语作マンショ（Mansho），非日语固有名。此名因葡萄牙传教士而在日本信众中流行，如天正遣欧使节伊東マンショ（Mancio Itō）。伯多禄之日本姓名现存资料未记录。三人及收容他们的三位麻风病人于大村被火刑处死。

7. **第13条（贵州殉道圣人）**：青岩（Qingyan）位于今贵州省贵阳市花溪区，即历史上著名之"青岩教案"发生地。张文澜（Zhang Wenlan）与陈昌品（Chen Changpin）为修院学生，娄廷荫（Lou Tingyin）为修院管理员，王骆氏（Wang Louzhi）为寡妇：夫姓王+本姓骆+氏。四人被关入洞穴后遭受酷刑，最终被斩首殉道。拉丁文"in cálida et húmida cávea"之 *cavea* 可指洞穴或牢笼。

---

## 七月三十日

**Die 30 iúlii** · 八月初一前第三日（*Tértio Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
> A B C D E F F G H M N P
> 24 25 26 27 28 29 29 30 1 2 3 4

**1\\.** 圣伯多禄·金言（Petrus Chrysólogus），拉文纳主教、教会圣师。承真福宗徒之名，忠实履行其职务，以天上道理之网罗群众归于信仰，以天主圣言之甘美饱飨人灵。实于翌日在弗拉米尼亚之福尔利（Forum Cornélii in Flamínia）辞世（约450年）。

**2\\.** 在罗马波尔图恩塞大道旁之庞齐亚诺墓园（cœmetérium Pontiáni via Portuénsi），圣阿布冬（Abdon）与圣瑟能（Sennen），殉道（约三世纪）。

**3\\.** 在卡帕多细雅之凯撒勒雅（Cæsaréa in Cappadócia），圣茹莉达（Iulítta），殉道。因坚决拒绝审判官命她向偶像献乳香的指令，被投入火中（约303年）。

**4\\.** 在非洲之图布尔博·卢切尔纳里亚（Thubúrbo Lucernáriæ），圣玛西玛（Máxima）、多纳蒂拉（Donatílla）与塞贡达（Secúnda），童贞、殉道。前二人在戴克里先皇帝之迫害中无所畏惧地拒绝向偶像献祭之皇命，因总督阿努利诺（Anulínus）之判决，与少女塞贡达一同先被投于野兽，继而被刀剑斩杀（304年）。

**5\\.** 在里昂高卢之欧塞尔（Autissiodórum in Gállia Lugdunénsi），圣乌尔索（Ursus），主教（六世纪）。

**6\\*.** 在弗兰德之基斯泰莱（Gistélla in Flándria），圣戈德莱瓦（Godéléva），殉道。嫁与当地领主，遭丈夫及其母百般虐待，终被两名仆人勒死（约1070年）。

**7\\*.** 在西班牙卡斯蒂利亚之卡莱鲁埃加（Calerógæ in Castélla），纪念真福曼内斯·古斯曼（Mannis Guzmán），司铎。圣多明我之兄弟，协助其兄推广多明我会，为修女们的明达顾问（约1235年）。

**8\\*.** 在英格兰之伦敦（Londínium），真福厄德华·鲍威尔（Eduárdus Powell）、理查德·费瑟斯通（Richárds Featherstone）与多默·阿贝尔（Thomas Abel），司铎、殉道。均为神学博士，反对亨利八世（Henrícus rex Octávus）所提出的离婚案，坚定忠于罗马教宗。在伦敦塔（Turre civitátis）被囚后，于史密斯菲尔德（Smithfield）刑场被处绞刑（1540年）。

**9\\.** 在中国河北省（*Hebei*）枣强（*Zaoqiang*）附近之大营（*Daying*），圣袁庚寅若瑟（Iosephus Yuan Gengyin），殉道。为当地集市之商人，在义和团（*Yihetuan*）之迫害中因基督之名被杀害（1900年）。

**10\\*.** 在西班牙塔拉戈纳附近沿海之卡拉费利（Calafell），真福殉道者布劳利奥·玛利亚（保禄）·科雷斯·迪亚斯·德·切里奥（Bráulio María [Paulus] Corres Díaz de Cerio），司铎，及十四位同伴，均属天主教仁爱修会（Ordo Sancti Ioánnis a Deo）。在反宗教的迫害中被捕后宽恕仇人，获至福之殉道荣冠（1936年）。

**11\\*.** 同在西班牙特鲁埃尔附近之卡斯特尔塞拉斯（Castelserás），真福殉道者若瑟·玛利亚·穆罗·桑米格尔（Iosephus María Muro Sanmiguel），司铎，若亚敬·普拉茨·巴尔图埃尼亚（Ioáchim Prats Baltueña），修士，均属多明我会，及佐西莫·伊斯基耶尔多·吉尔（Zósimus Izquierdo Gil），司铎。在同一反信仰的迫害中为基督获得光荣之冠（1936年）。

**12\\*.** 同在西班牙之巴塞罗那（Barcínona），真福塞尔吉奥·西德·帕索（Sérgius Cid Pazo），慈幼会司铎、殉道。在同一迫害中因无畏的信仰见证而殉难（1936年）。

**13\\.** 在意大利之帕多瓦（Patávium），圣莱奥波尔多（博格丹）·德·卡斯特尔诺沃·曼迪奇（Leopóldus [Bogdánus] de Castronóvo Mandic），方济各嘉布遣会司铎。一生燃烧着基督徒合一的热忱，将全部生命倾注于修和圣事的服务（1942年）。

**14\\*.** 在墨西哥之瓜达拉哈拉（Guadalaxára），真福玛利亚·味增济亚（圣多罗特亚）·查韦斯·奥罗斯科（María Vincéntia a Sancta Dorothéa Chávez Orozco），童贞。创立穷人婢女会（Institútum Servárum Páuperum），唯独信赖天主与圣意的助佑，以温柔和勤勉照顾愁苦者与贫穷者（1949年）。

**15\\.** 同在瓜达拉哈拉，真福玛利亚（圣体耶稣）·韦内加斯·德·拉·托雷（María a Iesu Sacramentáto Venegas de la Torre），童贞。在为穷人而设的一所小诊所中照顾病人长达五十四年，并在其中创立耶稣圣心女儿会（Congregátio Filiárum a Sacro Corde Iesu）（1959年）。

### 七月三十日校注

1. **第1条（圣伯多禄·金言）**：伯多禄·金言（Petrus Chrysologus, c.380-c.450），拉文纳主教，教会圣师。"金言"（Chrysologus，希腊文 χρυσο-λόγος = 金+言）为其绰号，与若望·金口（Chrysostomus = 金+口）相呼应。拉丁文"承真福宗徒之名"指他与宗徒圣伯多禄同名。"以天上道理之网"借用路五1-11撒网捕鱼之典故。实际辞世日为七月三十一日，忌日记录见七月三十一日第7条。福尔利（Forum Cornelii）即今意大利之伊莫拉（Imola）。OCR首字母缺失，据西语版补全。

2. **第4条（非洲殉道童贞）**：图布尔博·卢切尔纳里亚（Thuburbo Lucernariae）在今突尼斯。阿努利诺（Anulinus）为非洲行省总督。三位童贞先被投于野兽而未死，继被刀剑杀害。

3. **第7\\*条（真福曼内斯·古斯曼）**：曼内斯（Mannes/Manes）为圣多明我（Dominicus de Guzmán）之兄弟。卡莱鲁埃加（Caleruega）在今西班牙布尔戈斯省，亦为圣多明我之出生地。

4. **第8\\*条（英格兰殉道者）**：三位均为神学博士，因反对亨利八世与阿拉贡的加大利纳离婚案、忠于罗马教宗而被处决。亨利八世（Henry VIII, 1509-1547在位）从世俗通行译法。伦敦塔（Tower of London）为关押政治犯之要塞。史密斯菲尔德（Smithfield）为伦敦刑场。

5. **第9条（中华殉道圣人）**：袁庚寅（Yuan Gengyin），河北枣强大营之商人，1900年义和团期间殉道。庚寅为干支纪年之术语，常用于取名。注意：此人与四川教区司铎袁在德（Yuan Zaide, d.1817）为不同的两位殉道圣人，勿混淆。大营（Daying）在今河北省衡水市枣强县境内。

6. **第13条（圣莱奥波尔多·曼迪奇）**：莱奥波尔多·曼迪奇（Leopold Mandić, OFMCap, 1866-1942），克罗地亚出身（原名博格丹），帕多瓦方济各嘉布遣会修院告解神师，1983年教宗若望保禄二世封圣。以修和圣事（告解）为终身使命，毕生热望基督徒东西方教会之合一。

---

## 七月三十一日

**Die 31 iúlii** · 八月初一前夕（*Prídie Kaléndas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
> A B C D E F F G H M N P
> 25 26 27 28 29 30 30 1 2 3 4 5

**1\\.** 圣依纳爵·罗耀拉（Ignátius de Loyola），司铎之纪念。生于西班牙巴斯克（Vascónia），早年在宫廷任侍从武士。负重伤后皈依天主，在巴黎完成神学学业，聚集最初的同伴，后在罗马创立耶稣会（Sociétas Iesu）。在罗马从事卓有成效的牧职，撰写著作、培育门生，一切为天主更大的光荣（1556年）。

**2\\.** 在利古里亚之米兰（Mediolánum in Transpadána），圣加利美洛（Calimérus），主教（二世纪末）。

**3\\.** 在弗里吉亚之辛纳达（Sýnnada in Phrýgia），圣德莫克里托（Demócritus）、瑟贡多（Secúndus）与狄奥尼削（Dionýsius），殉道（三世纪）。

**4\\.** 在毛里塔尼亚之凯撒勒雅（Cæsaréa in Mauretánia），圣法比奥（Fábius），殉道。因在全省集会中拒绝举总督之旗帜，先被投入监狱，又因在基督宣认中坚持不屈，被审判官判处死刑（303-304年）。

**5\\.** 在罗马拉丁大道（via Latína），圣德尔图利诺（Tertullínus），殉道（约四世纪）。

**6\\.** 在弗拉米尼亚之拉文纳（Ravénna in Flamínia），欧塞尔主教圣热尔马诺（Germánus Autissiodorénsis）之瞻礼（*tránsitus*）。曾两次赴布列塔尼捍卫信友之信仰免受白拉奇异端侵蚀。为调解阿尔莫里卡（Armórica）地区之和平而前往拉文纳，受瓦伦丁尼安（Valentiniánus）与加拉·普拉齐迪亚（Galla Placídia）二位奥古斯都之隆重接待，在此地升入天国（448年）。

**7\\.** 同在弗拉米尼亚之福尔利（Forum Cornélii），拉文纳主教圣伯多禄·金言之瞻礼（*tránsitus*），其纪念已于前日举行（约450年）。

**8\\.** 在瑞典之谢夫德（Schédvia），圣厄莱纳（Héléna），寡妇。被不义杀害，奉为殉道者（约1160年）。

**9\\*.** 在托斯卡纳之阿夸彭登特（Aquipéndium in Túscia），真福若望·科隆比尼（Ioánnes Columbini）之瞻礼（*tránsitus*）。本为富有的布商，弃富归贫，聚集门徒创立耶稳会（Ordo Iesuatórum），以基督之穷人与贫穷之淑女的净配自居（1367年）。

**10\\*.** 在英格兰之伦敦（Londínium），真福埃弗拉尔·汉斯（Everárdus Hanse），司铎、殉道。自信奉天主教之日起忠实守护信仰，在同胞中宣扬信仰，在伊丽莎白一世治下于泰伯恩刑场完成殉道，光荣地坚固了信仰（1581年）。

**11\\*.** 在法国罗什福尔海岸外，真福若望·方济各·雅里日·德·拉·莫雷利·迪布勒伊（Ioánnes Francíscus Jarrige de la Morélie du Breuil），司铎、殉道。法国大革命迫害教会最猛烈之际，被囚于肮脏的奴隶船上，因肺痨而亡（1794年）。

**12\\.** 在交趾支那（Cocincína）西贡附近之盖梅（Cây Mét），圣段公贵伯多禄（Petrus Đoàn Công Quý），司铎，与圣奉厄玛奴耳（Emmanuélis Phng），殉道。被囚约七月之后，在嗣德帝（Tự Đức）治下为基督被斩首（1859年）。

**13\\.** 在埃塞俄比亚之阿里盖德谷地（vallis Alighede in Æthiópia），圣儒斯蒂诺·德·雅各比斯（Iustínus De Iacobis），遣使会（Congregátio Missiónis）主教。性情温厚、满怀爱德，致力于宗徒事业和培育本地圣职人员，其间忍受了饥渴、困苦与监禁（1860年）。

**14\\*.** 在西班牙巴塞罗那附近之格拉诺列尔斯（Granollers），真福殉道者狄奥尼削·维森特·拉莫斯（Dionýsius Vicente Ramos），司铎，与方济各·雷蒙·哈蒂瓦（Francíscus Remón Játiva），修士，均属方济各住院小兄弟会。在反信仰的迫害中以殉道追随了基督的足迹（1936年）。

**15\\*.** 同在西班牙之巴伦西亚（Valéntia），真福雅各伯·布奇·卡纳尔斯（Iacóbus Buch Canals），慈幼会修士、殉道。在同一迫害中宣认基督而殉（1936年）。

**16\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福弥额尔·奥杰布沃夫斯基（Michaél Oziębłowski），司铎、殉道。祖国波兰沦于一敌视宗教之政权统治之下，因信仰之故被强行押往异国监狱，在酷刑中完成殉道（1942年）。

**17\\*.** 在波兰之卡利什（Calíssia），真福方济各·斯特里亚斯（Francíscus Stryjas），殉道。在同一风暴中，经受无数酷刑后光荣地迁归于主（1944年）。

**18\\*.** 在斯洛伐克之特尔纳瓦（Tyrnávia in Slováchia），真福西多妮亚（则济利亚）·谢林戈瓦（Sidónia [Cæcília] Schelingová），圣十字架仁爱修女会（Congregátio Sorórum a Caritáte Sanctæ Crucis）童贞、殉道。在本国教会极艰难之时期，因庇护一位司铎而承受了肉身与灵魂的诸多痛苦，终为疾病所消磨，成为基督无倦而喜乐的见证（1955年）。

### 七月三十一日校注

1. **第1条（圣依纳爵·罗耀拉）**：纪念（*memória*）。依纳爵·罗耀拉（Ignatius de Loyola, 1491-1556），耶稣会创始人。"愈显主容"（*ad maiórem Dei glóriam*，缩写 AMDG）为耶稣会格言。依纳爵（Ignatius）从方法论 -tius → 爵 规则，合为依纳爵。OCR首字母缺失，据西语版补全。

2. **第6条（欧塞尔主教圣热尔马诺）**：即七月二十九日第6条（特鲁瓦主教圣路波）之同行者。瓦伦丁尼安三世（Valentinian III, 425-455在位）与加拉·普拉齐迪亚（Galla Placidia, c.390-450）为罗马帝国西部之皇帝与摄政太后，均从世俗通行译法。阿尔莫里卡（Armorica）为布列塔尼之古地名。

3. **第7条（圣伯多禄·金言瞻礼）**：交叉引用七月三十日第1条。"前日"（*prídie*）指七月三十日。

4. **第12条（越南殉道圣人）**：段公贵（Đoàn Công Quý），越南籍司铎，与奉（Phụng，拉丁OCR残损为"Phng"）同在西贡附近殉道。汉字推定：段=Đoàn（无歧义）、公=Công（无歧义）、贵=Quý（中等偏高）。奉=Phụng（中等偏高，已于七月十三日建立）。盖梅（Cây Mét）在今胡志明市附近。"交趾支那"（Cochinchina）为越南南部之历史称谓，与"东京"（Tonquinum，北部）相对。

5. **第13条（圣儒斯蒂诺·德·雅各比斯）**：儒斯蒂诺·德·雅各比斯（Giustino de Jacobis, CM, 1800-1860），意大利籍遣使会主教，埃塞俄比亚宗座代牧。遣使会（Congregatio Missionis, CM）又称拉匝禄会（Lazarists），为圣味增爵·德·保禄于1625年所创。

6. **第18\\*条（斯洛伐克殉道真福）**：西多妮亚·谢林戈瓦（Sidónia Schelingová, 1916-1955），斯洛伐克籍修女。"敌视宗教之政权"指捷克斯洛伐克共产政权。她因庇护一位被通缉的司铎而被捕受审，身心遭受酷刑后染病去世。

---

## 八月一日

**Die 1 augústi** · 八月初一（*Kaléndis augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
> A B C D E F F G H M N P
> 26 27 28 29 30 1 1 2 3 4 5 6

**1\\.** 圣亚丰索·玛利亚·德·利果里（Alphónsus María de Ligório），主教、教会圣师之纪念。以生活表率卓著，致力于以宣讲和著述推进民众之基督徒生活，尤擅伦理神学，被尊为该学科之宗师。历经重重困难创立至圣救赎主会（Congregátio Sanctíssimi Redemptóris）以向乡村民众传播福音。当选为哥特人之圣亚加大（Sancta Agatha Gothórum）主教后，不遗余力投身于此职务。十五年后因重病辞任，在坎帕尼亚之诺切拉·帕加诺鲁姆（Nucéria Paganórum）度过余生，承受巨大的劳苦与困难（1787年）。

**2\\.** 纪念殉道者圣七兄弟（septem fratres）。在叙利亚之安提约基雅（Antiochía in Sýria），安提约古·厄丕法讷王治下，因以不屈的信德恪守上主的法律，与母亲一同被残酷地交付死亡。母亲在每一位儿子身上受苦，却在所有儿子身上获得了荣冠，如加下第七章所记。又纪念圣厄肋阿匝尔（Eleázarus），经师之首，年事已高之人。在同一迫害中，为保全性命而拒食禁肉，宁择至光荣之死、不取可憎之生，自愿走向刑场，留下了伟大的德行典范。

**3\\.** 在距罗马三十里之普雷讷斯提纳大道（via Prænestína），圣塞贡迪诺（Secundínus），殉道（年代不详）。

**4\\.** 在塔拉戈纳西班牙之赫罗纳（Gerúnda in Hispánia Tarraconénsi），圣斐理斯（Felix），殉道，在戴克里先皇帝之迫害中受难（四世纪初）。

**5\\.** 在利古里亚之韦尔切利（Vercéllæ in Ligúria），圣欧瑟伯（Eusébius），主教之忌日（*natális*），其纪念于明日举行（371年）。

**6\\*.** 在里昂高卢之巴约（Baiócæ in Gállia Lugdunénsi），圣厄克苏佩里奥（Exsupérius），被尊为该城首任主教（约四世纪）。

**7\\*.** 在阿基坦，圣塞韦洛（Sevérus），司铎。将其财产用于建造教堂和服务穷人（约500年）。

**8\\*.** 在法国南特附近之文杜讷塔岛（Vindunéta ínsula），圣弗里亚尔多（Friárdus）与圣塞贡德洛（Secundéllus），执事，二人均为隐修士（六世纪）。

**9\\*.** 在比利时高卢之马尔西安讷（Marciána in Gállia Bélgica），圣若纳托（Ionátus），院长，圣亚孟多（Amándus）之门徒（约690年）。

**10\\.** 在英格兰之温切斯特（Vintónia），圣厄特尔沃尔德（Ethelwóldus），主教之安葬。为恢复从圣邓斯坦（Dunstánus）处所习得的修道纪律，撰写了著名的《修院谐和典》（*Reguláris Concórdia*）（984年）。

**11\\*.** 在格雷安阿尔卑斯之奥斯塔（Augústa Prætória in Alpibus Graiis），真福埃梅里科·迪·夸尔特（Emerícus de Quart），主教，以严苦生活与救灵热忱著称（1313年）。

**12\\*.** 在萨宾之列阿泰（Reáte in Sabína），真福若望·布法拉里（Ioánnes Bufalari），圣奥斯定隐修会修士。为人谦逊和蔼，始终关怀近人（约1336年）。

**13\\*.** 在罗马，真福伯多禄·法伯尔（Petrus Favre），耶稣会司铎。为耶稣会诸同伴之首，在欧洲各地承受艰巨劳苦，在前往特伦多大公会议途中于罗马辞世（1546年）。

**14\\*.** 在英格兰之约克（Ebóracum），真福多默·韦尔伯恩（Thomas Welbourne），殉道。为学校教师，在詹姆斯一世治下因劝人追随罗马教宗被判处死刑，悬于绞刑台上殉难，以此肖似了基督至高的导师（1605年）。

**15\\*.** 在东京（Tunquínum）之南定城（Nam Đinh），圣阮文幸（妙）多明我（Domínicus Nguyn Văn Hnh [Diêu]），多明我会会士，与圣武文叡贝尔纳尔多（Bernárdus Vǔ Văn Du），司铎、殉道。在明命帝（Minh Mạng）治下为基督被斩首（1838年）。

**16\\.** 在法国伊泽尔河（Isara）畔之拉米尔（La Mure），圣伯多禄·儒利亚诺·厄马尔（Petrus Iuliánus Eymard），司铎之忌日（*natális*），其纪念于明日举行（1868年）。

**17\\*.** 在西班牙之马德里（Matrítum），真福本文努托（若瑟）·德·米盖尔·阿拉阿尔（Benvenútus [Iosephus] de Miguel Arahal），方济各第三会苦难圣母嘉布遣会（Tértius Ordo Sancti Francísci Capulatórum a Beáta Vírgine Perdolénti）司铎、殉道。在信仰遭受猛烈迫害之际，为基督倾洒了热血（1936年）。

**18\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福阿莱西·索巴谢克（Aléxius Sobaszek），司铎、殉道。波兰人，战争期间被侵略者非人道地押送至此，在捍卫信仰中为基督死于酷刑之下（1942年）。

**19\\*.** 在波兰诺沃格鲁德克（Nowogródek）城附近之森林中，真福玛利亚·斯特拉（至圣圣体）（阿德尔海德）·马尔多谢维奇（María Stella a Sanctíssimo Sacraménto [Adelhéidis] Mardosewicz）及十位同伴，纳匝肋圣家修女会（Congregátio Sorórum Sacrátæ Famíliæ a Názareth）童贞、殉道。战争年代被信仰之仇敌乱枪射杀，升入天上的荣耀（1943年）。

### 八月一日校注

1. **第1条（圣亚丰索·利果里）**：纪念（*memória*）。亚丰索·玛利亚·德·利果里（Alfonso Maria de' Liguori, 1696-1787），意大利人，从意大利文名形式。至圣救赎主会（Redemptorists, C.Ss.R.）1732年创立，专向乡村贫民传教。哥特人之圣亚加大（Sant'Agata de' Goti）为意大利南部之小教区。诺切拉·帕加诺鲁姆（Nocera de' Pagani）在今坎帕尼亚大区。OCR首字母缺失，据西语版补全。

2. **第2条（加下七兄弟与厄肋阿匝尔）**：安提约古·厄丕法讷（Antiochus IV Epiphanes）、厄肋阿匝尔（Eleazar）、"经师之首"（*unus de primóribus scribárum*）均从思高圣经。七兄弟及其母之殉道见加下七1-42。厄肋阿匝尔之殉道见加下六18-31。"宁择至光荣之死、不取可憎之生"（*gloriosíssimam mortem magis quam odiósam vitam compléctens*）近于加下六19原文，从思高圣经校对。

3. **第13\\*条（真福伯多禄·法伯尔）**：伯多禄·法伯尔（Pierre Favre, SJ, 1506-1546），萨瓦人，圣依纳爵在巴黎大学的第一位同伴。2004年版为真福（*beatus*），2013年教宗方济各已将其封圣。

4. **第15\\*条（越南殉道圣人）**：阮文幸（Nguyễn Văn Hạnh），汉字推定：幸=Hạnh（中等偏高）。括注中"妙"（Diệu/Diêu）为其多明我会会名。武文叡（Vũ Văn Duệ），汉字推定：武=Vũ（无歧义），叡=Duệ（中等偏高，意为"明睿"）。二人均在南定城殉道。

5. **第19\\*条（诺沃格鲁德克殉道修女）**：1943年纳粹占领下，十一位纳匝肋圣家修女会修女在白俄罗斯诺沃格鲁德克（今白俄罗斯之诺沃格鲁多克）附近被枪杀。她们自愿以自己的生命替代当地教友。拉丁原版脚注1列出十位同伴之姓名。诺沃格鲁德克（Nowogródek）今属白俄罗斯。

---

## 八月二日

**Die 2 augústi** · 八月初七前第四日（*Quarto Nonas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
> A B C D E F F G H M N P
> 27 28 29 30 1 2 2 3 4 5 6 7

**1\\.** 圣欧瑟伯（Eusébius），利古里亚韦尔切利（Vercéllæ in Ligúria）首任主教之纪念。在整个阿尔卑斯山麓地区巩固了教会。因宣认尼西亚信经（*fides nicǽna*），遭君士坦提乌斯二世（Constántius II）流放至斯基托波利斯（Scythópolis），继而至卡帕多细雅（Cappadócia）及特拜德（Thebáis）。八年后重返本座，奋力抵抗亚略派以恢复正统信仰（371年）。

**2\\.** 圣伯多禄·儒利亚诺·厄马尔（Petrus Iuliánus Eymard），司铎之纪念。初为教区司铎，后入玛利亚会（Sociétas Maríæ）。为至圣圣体奥迹的卓越崇敬者，创立两个新修会，一为神职人员，一为侍女，以培育和推广对至圣圣体的虔敬。在其出生地法国格勒诺布尔（Gratianópolis）附近之拉米尔（La Mure）辞世（1868年）。

**3\\.** 在非洲，纪念圣鲁蒂略（Rutílius），殉道。多次四处逃避迫害，有时甚至以金钱赎免险境。某日突遭逮捕，被押至总督面前，经受诸多酷刑后被投入火中，蒙受了光荣殉道之冠（约212年）。

**4\\.** 在罗马加理多墓园（cœmetérium Callísti），圣斯德望一世（Stéphanus papa Primus），教宗。为使基督徒经由圣洗与基督建立的唯一结合不致蒙蔽，禁止对寻求与教会完全共融的异端者重新施洗（257年）。

**5\\.** 在西班牙布尔戈斯地区（pagus Burgénsis），圣千多拉（Centólla），殉道（年代不详）。

**6\\.** 在威尼托之帕多瓦（Patávium in Venétia），圣马西莫（Máximus），主教，据信为圣普罗斯多齐莫（Prosdócimus）之继任者（三至四世纪）。

**7\\*.** 在高卢普罗旺斯之马赛（Massília in Província Gálliæ），圣塞雷诺（Serénus），主教。曾接待教宗圣大额我略（Gregórius Magnus）派遣至英格兰传教之圣奥斯定（Augustínus）及其同伴。后赴罗马途中，在韦尔切利郊外虔敬地安息于主（601年）。

**8\\*.** 在纽斯特里亚之沙尔特尔（Carnútum in Néustria），圣贝塔里奥（Bethárius），主教（约623年）。

**9\\*.** 在西班牙卡斯蒂利亚之帕伦西亚（Paléntia in Castélla），圣伯多禄，奥斯马（Oxoménsis）主教之瞻礼（*tránsitus*）。初为修士，继而任托莱多教会之副主教，最终擢升为新从摩尔人统治下光复之奥斯马主教座，以牧灵热忱加以振兴（约1109年）。

**10\\*.** 同在卡斯蒂利亚之卡莱鲁埃加（Calerógæ in Castélla），纪念真福若安纳（Ioánna），圣多明我之母。满怀信德，对贫苦者与受难者大施仁慈（十二至十三世纪）。

**11\\*.** 同在西班牙之巴尔巴斯特罗（Barbástrum），真福殉道者斐理伯（耶稣）·穆纳里斯·阿斯科纳（Philíppus a Iesu Munárriz Azcona），司铎，若望·迪亚斯·诺斯蒂（Ioánnes Díaz Nosti）与良齐奥·佩雷斯·拉莫斯（Leóntius Pérez Ramos），均为圣母无玷圣心传教士会（Missionárii Fílii Immaculáti Cordis Beátæ Maríæ Vírginis）司铎。在反教会的迫害肆虐之际，因仇恨修道生活而被民兵押至墓地枪杀（1936年）。

**12\\*.** 同在巴尔巴斯特罗，真福则费里诺·希梅内斯·马利亚（Zephyrínus Giménez Malla），殉道。罗姆人（*cíngarus*），毕生致力于促进本族与邻人之间的和平与和睦。在同一迫害中，因在街头挺身保护一位被民兵拖行的司铎而被投入狱中。最终被押至墓地，手持玫瑰念珠，在枪弹中完成了尘世的旅程（1936年）。

**13\\*.** 在西班牙特鲁埃尔附近之伊哈尔（Híjar prope Terúlium），真福方济各·卡尔沃·布里略（Francíscus Calvo Burillo），多明我会司铎、殉道。在反信仰的猛烈迫害中殉难（1936年）。

**14\\*.** 同在西班牙之马德里（Matrítum），真福方济各·多玛斯·塞雷尔（Francíscus Tomás Serer），方济各第三会苦难圣母嘉布遣会司铎、殉道。在同一迫害中倾洒热血而获殉道之荣（1936年）。

### 八月二日校注

1. **第1条（圣欧瑟伯）**：纪念（*memória*）。欧瑟伯（Eusebius, d. 371），韦尔切利首任主教。君士坦提乌斯二世（Constantius II, 337-361在位）为亚略派同情者，从世俗通行译法。斯基托波利斯（Scythopolis）在今以色列贝特谢安。忌日记录见八月一日第5条。

2. **第2条（圣伯多禄·儒利亚诺·厄马尔）**：纪念（*memória*）。厄马尔（Peter Julian Eymard, 1811-1868），创立圣体司铎会（Congregatio Presbyterorum a Sanctissimo Sacramento）及圣体侍女会。玛利亚会（Societas Mariae）即圣母会（Marists）。忌日记录见八月一日第16条。两条均OCR首字母缺失。

3. **第3条（圣鲁蒂略）**：此殉道者"以金钱赎免险境"（*perículum pecúnia redemísset*）之细节为德尔都良（Tertullian）《论逃避迫害》中所讨论之道德案例。

4. **第10\\*条（真福若安纳）**：圣多明我之母，与七月三十日第7\\*条（真福曼内斯·古斯曼，圣多明我之兄弟）同在卡莱鲁埃加。

5. **第11\\*-12\\*条（巴尔巴斯特罗殉道者）**：1936年西班牙内战期间巴尔巴斯特罗（Barbastro）之殉道。第11\\*条为圣母无玷圣心传教士会（克拉良会/Claretians, CMF）之三位司铎。第12\\*条则费里诺·希梅内斯·马利亚（Ceferino Giménez Malla, 1861-1936），绰号"厄尔·佩莱"（El Pelé），为首位被列真福品之罗姆人（吉卜赛人）。"手持玫瑰念珠"（*corónam Rosárii in mánibus tenens*）为其殉道之标志性细节。

---


---

## 八月三日

**Die 3 augústi** · 八月初七前第三日（*Tértio Nonas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
> A B C D E F F G H M N P
> 28 29 30 1 2 3 3 4 5 6 7 8

**1\\.** 在坎帕尼亚之那不勒斯（Neápolis in Campánia），圣阿斯普雷纳托（Asprenátus），该城首任主教（二至三世纪）。

**2\\.** 在里昂高卢之欧坦（Augustodúnum in Gállia Lugdunénsi），圣欧弗罗尼奥（Euphrónius），主教。建造了殉道者圣辛佛里亚诺（Symphoriánus）之大殿，并以更大的华美装饰了图尔的圣玛尔定之墓（475年以前）。

**3\\.** 在坎帕尼亚之马西科山（mons Mássicus），圣玛尔定（Martínus），度独修生活，多年闭居于极狭小的洞穴中（580年）。

**4\\.** 在拉齐奥之阿纳尼（Anágnia in Látio），圣伯多禄（Petrus），主教。先以修道持守、后以牧灵警醒著称，完成了主教座堂的建造（1105年）。

**5\\*.** 在阿普利亚之卢切拉（Lucéria in Apúlia），真福奥斯定·卡佐蒂奇（Augustínus Kazotic），多明我会主教。初领导萨格勒布教会（Ecclésia Zagrebiénsis），后因达尔马提亚王之敌意而转任卢切拉主教座，在此倾心照顾穷人与贫困者（1323年）。

**6\\*.** 在西班牙之阿利坎特（Lucéntum），真福萨尔瓦多尔·费兰迪斯·塞吉（Salvátor Ferrandis Seguí），司铎、殉道。在反信仰的猛烈迫害中，倾洒热血为基督作证而获光荣之棕枝（1936年）。

**7\\*.** 在西班牙巴塞罗那附近之萨马卢斯（Samalús），真福殉道者阿方索·洛佩斯（Alphónsus López López），司铎，与弥额尔·雷蒙·萨尔瓦多尔（Michaél Remón Salvador），修士，均属方济各住院小兄弟会。在同一迫害中因见证基督而获殉道之冠（1936年）。

**8\\*.** 同在西班牙之巴塞罗那（Barcínona），真福方济各·班德雷斯·桑切斯（Francíscus Bandrés Sánchez），慈幼会司铎、殉道。在同一迫害时期，以自身之血印证了对主的忠诚（1936年）。

### 八月三日校注

1. **第5\\*条（真福奥斯定·卡佐蒂奇）**：奥斯定·卡佐蒂奇（Augustin Kažotić, OP, c.1260-1323），克罗地亚出身，先任萨格勒布（Zagreb）主教，后因与达尔马提亚王之冲突转任阿普利亚之卢切拉（Lucera）。

---

## 八月四日

**Die 4 augústi** · 八月初七前夕（*Prídie Nonas augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
> A B C D E F F G H M N P
> 29 30 1 2 3 4 4 5 6 7 8 9

**1\\.** 圣若望·玛利亚·维雅内（Ioánnes María Vianney），司铎之纪念。在法国贝莱（Bellícium）附近之亚尔斯（Ars）乡村，四十余年以惊人的热忱服务所领受之堂区：每日教导儿童与成人教理、使忏悔者与天主和好。以从至圣圣体如同源泉汲取的炽热爱德光照四方，以至教诲远近传布，以智慧引领众多灵魂归向天主（1859年）。

**2\\.** 纪念圣阿黎斯塔苛（Aristárchus），得撒洛尼人，保禄宗徒之门徒、旅途中的忠实伴侣，最终在罗马成为保禄的同囚（一世纪）。

**3\\.** 在罗马蒂布尔蒂纳大道（via Tiburtína），圣儒斯蒂诺（Iustínus）与圣克雷森齐奥讷（Crescéntio），殉道（258年）。

**4\\.** 在比提尼亚之塔尔西亚（Társia in Bithýnia），圣厄肋乌泰里奥（Eleuthérius），殉道（四世纪）。

**5\\.** 在波斯（Pérsis），圣雅（Ia），殉道，在沙普尔二世（Sapor rex Secúndus）王治下（约362年）。

**6\\.** 在纽斯特里亚之图尔（Turónes in Néustria），纪念圣欧弗罗尼奥（Euphrónius），主教。出席多次教务会议，在城中修复多座教堂，在乡间创建堂区，并殷切推广圣十字架之敬礼（约573年）。

**7\\*.** 在卡拉布里亚卡塔齐奥（Catácium）附近之帕纳亚林中（silvæ Panáiæ），圣翁努弗里奥（Onúphrius），隐修士，以斋戒与严苦生活著称（年代不详）。

**8\\*.** 在达尔马提亚之斯普利特（Spálatun in Dalmátia），圣赖内里奥（Rainérius），主教、殉道。初为修士，为捍卫教会权利先在卡利（Calliénsis）主教座受尽苦难，后转任斯普利特主教座，终被乱石砸死（1180年）。

**9\\*.** 在艾米利亚之博洛尼亚（Bonónia in Æmília），真福则济利亚（Cæcília），童贞。从圣多明我亲手领受修女之会衣，为圣多明我的面容与精神最忠实的见证人（约1290年）。

**10\\*.** 在英格兰之伦敦（Londínium），真福威廉·霍恩（Guliélmus Horne），殉道。伦敦加尔都西会（Cartúsia）修士，从未偏离修会之恒常持守。在亨利八世治下遭长期监禁，最终于泰伯恩（Tybúrnum）刑场被处极刑，迁往基督的右边（1540年）。

**11\\*.** 在加拿大魁北克省之三河市（Marianópolis in Quebéco），真福斐德理科·扬松讷（Fridéricus Janssoone），方济各小兄弟会司铎。为增进信仰，大力推广赴圣地之朝圣活动（1916年）。

**12\\*.** 在西班牙之马德里（Matrítum），真福贡萨洛·贡萨洛（Gundisálvus Gonzalo），天主教仁爱修会修士、殉道。在反信仰的猛烈迫害中，以自身之血印证了对基督的宣认（1936年）。

**13\\*.** 同在西班牙之巴塞罗那（Barcínona），真福殉道者若瑟·巴塔利亚·帕拉蒙（Iosephus Batalla Parramón），司铎，若瑟·拉巴萨·本塔纳克斯（Iosephus Rabasa Bentanachs）与厄日迪奥·吉尔·罗迪齐奥（Ægídius Gil Rodicio），修士，均属慈幼会。在同一迫害中以信仰之搏斗获得永生（1936年）。

**14\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福亨利·克日什托菲克（Henrícus Krzysztofik），司铎、殉道。波兰人，战争期间因基督信仰之宣认被从波兰押往异国监狱，在酷刑中完成殉道（1942年）。

### 八月四日校注

1. **第1条（圣若望·玛利亚·维雅内）**：纪念（*memória*）。若望·玛利亚·维雅内（Jean-Marie Vianney, 1786-1859），法国亚尔斯本堂司铎（Curé d'Ars），从法文名形式。以告解圣事的非凡恩赐著称，每日在告解亭中长达十六小时以上。1925年封圣，1929年被宣布为堂区司铎之主保。"以从至圣圣体如同源泉汲取的炽热爱德"（*ardénti caritáte e sacra Eucharístia velut e fonte hausta*）为拉丁原文之优美比喻。OCR首字母缺失，据西语版补全。

2. **第2条（圣阿黎斯塔苛）**：阿黎斯塔苛（Aristarchus）从思高圣经，见宗十九29、二十4、二十七2、哥四10、费一24。"同囚"（*concaptívus*）见哥四10（思高圣经用语）。

3. **第5条（圣雅）**：波斯殉道圣女。沙普尔二世（Shapur II, 309-379在位）为萨珊波斯帝王，从世俗通行译法。

4. **第9\\*条（真福则济利亚）**：则济利亚（Cecilia, c.1200-c.1290），博洛尼亚多明我会修女，从圣多明我亲手领受会衣。"为圣多明我的面容与精神最忠实的见证人"（*cuius vultus et spíritus testis fuit fidelíssima*）表明她为圣多明我之直接门生。

5. **第10\\*条（真福威廉·霍恩）**：伦敦加尔都西会（Carthusians）修士，与其他加尔都西会同道一同在亨利八世治下殉道。"迁往基督的右边"（*ad déxteram Christi migrávit*）为殉道圣人录中较少见之表述。

---

## 八月五日

**Die 5 augústi** · 八月初七（*Nonis augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
> A B C D E F F G H M N P
> 30 1 2 3 4 5 5 6 7 8 9 10

**1\\.** 厄斯奎利诺山（Esquilínum）上之圣母大殿奉献日。教宗西斯笃三世（Xystus papa Tértius）为纪念厄弗所大公会议（在此会议上荣福童贞被尊为天主之母）而将此殿献给天主的子民（约434年）。

**2\\.** 在比利时高卢之沙隆（Cataláunum in Gállia Bélgica），圣默弥奥（Mémmius），被尊为该城首任主教（三至四世纪）。

**3\\.** 在坎帕尼亚之泰亚诺（Theánum），圣帕里德（Paris），主教，据信为该主教座首任主教（四世纪）。

**4\\.** 在里昂高卢之欧坦（Augustodúnum in Gállia Lugdunénsi），圣加西亚诺（Cassiánus），主教（四世纪）。

**5\\.** 在卡帕多细雅之纳齐盎（Naziánzum in Cappadócia），圣农纳（Nonna）。主教圣老额我略（Gregórius Sénior）之妻，圣额我略（神学家）（Gregórius Theólogus）、圣切萨里奥（Cæsárius）与圣戈尔戈尼亚（Gorgónia）之母（374年）。

**6\\.** 在意大利皮切诺之阿斯科利（Asculum in Picéno），圣厄弥格迪奥（Emígdius），被尊为该城首任主教与殉道者（四世纪）。

**7\\*.** 在法国罗讷河畔之维维耶（Vivário ad Rhódanum in Gállia），圣韦南齐奥（Venántius），主教（535年以前）。

**8\\*.** 在法国索洛涅地区之特朗布尔维夫（Tremúlium in Secaláunia），圣维亚多尔（Viátor），隐修士（六世纪）。

**9\\.** 在英格兰什罗普郡之马赛菲尔德（Maserfield），此地后因圣人之名而称奥斯韦斯特里（Oswéstria），圣奥斯瓦尔德（Oswáldus），殉道。诺森布里亚（Northúmbria）之王，以军事才能著称，然更好和平。在本地区积极传播基督信仰，在与异教徒之战中因基督之名被杀（642年）。

**10\\*.** 在意大利皮切诺之蒙特格拉纳里奥（Mons Granárius），真福方济各·赞弗雷迪尼（Francíscus Zanfredini），俗称佩萨罗的切基（Cecchi de Pisáuro），方济各第三会会士。散尽所有施与穷人后，在自己修建的旷野中度近五十年之补赎、祈祷与善功生活，为人楷模（约1350年）。

**11\\.** 同在皮切诺之赛滕佩达（Septémpeda，今圣塞韦里诺-马尔凯），圣玛加利大（Margaríta），寡妇（1395年）。

**12\\*.** 在法国罗什福尔海岸外之海峡中，真福伯多禄·弥额尔·诺厄尔（Petrus Michaél Noël），鲁昂（Rothomágum）教区司铎、殉道。法国大革命期间因司铎身份被非人道地拘禁于奴隶运输船上，为严重的瘟疫所吞噬（1794年）。

### 八月五日校注

1. **第1条（圣母大殿奉献日）**：罗马圣母大殿（Basilica di Santa Maria Maggiore），又称圣母雪地大殿（Sancta Maria ad Nives），建于厄斯奎利诺山上。教宗西斯笃三世（Sixtus III, 432-440在位）在厄弗所大公会议（431年）确认荣福童贞玛利亚为"天主之母"（Theotokos）后，将此殿献给天主的子民。为罗马四大宗座圣殿之一。OCR首字母缺失，据西语版补全。

2. **第5条（圣农纳）**：纳齐盎的圣老额我略（Gregory the Elder）为纳齐盎主教。其三名子女均被教会尊为圣人：额我略·纳齐盎（"神学家"，卡帕多细雅三教父之一）、切萨里奥（医生）、戈尔戈尼亚。圣农纳先于丈夫皈依基督信仰，后引导全家归主。

3. **第9条（圣奥斯瓦尔德）**：奥斯瓦尔德（Oswald of Northumbria, c.604-642），盎格鲁-撒克逊诺森布里亚王。642年在赫克斯菲尔德之战（Battle of Maserfield）中被麦西亚异教王彭达（Penda）所杀。马赛菲尔德后称奥斯韦斯特里（Oswestry），在今英格兰什罗普郡。

---

## 八月六日

**Die 6 augústi** · 八月十五前第八日（*Octávo Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
> A B C D E F F G H M N P
> 1 2 3 4 5 6 6 7 8 9 10 11

**1\\.** 耶稣显圣容庆日。在大博尔山上，至高父所钟爱的独生子，在圣宗徒伯多禄、雅各伯与若望面前，在法律与先知的见证下，显示了自己的光荣。如此，他在与我们同取的卑微奴仆形象中，彰显了我们因恩宠而获得的光荣复兴，使天主的肖像（虽因亚当而败坏，却在基督内得以重整）传扬至天涯地角。

**2\\.** 在罗马阿庇亚大道旁之加理多墓园（cœmetérium Callísti via Áppia），圣西斯笃二世教宗（Xystus papa Secúndus）及同伴殉难（*pássio*），其纪念于明日举行。

**3\\.** 在塔拉戈纳西班牙之孔普卢通（Complútum in Hispánia Carthaginénsi），圣儒斯托（Iustus）与圣帕斯托尔（Pastor），兄弟、殉道。尚为幼童，自发放下课堂上的书写板，奔赴殉道。二人被总督下令逮捕并以棍棒殴打，互相劝勉鼓励，被刽子手以刀斩杀而为基督殉难。

**4\\.** 在罗马圣伯多禄大殿，圣荷弥斯达（Hormísda），教宗之安葬。作为和平的旗手，促成东方阿加齐乌斯裂教（schísma Acaciánum）之弥合，又使西方教会权利受新兴民族之恭敬遵守（523年）。

**5\\*.** 在利古里亚之萨沃纳（Savóna），真福奥克塔维亚诺（Octaviánus），主教，教宗加理多二世（Callístus papa Secúndus）之兄弟。无论在修院还是在主教座上，皆一心事奉天主与弟兄（约1128年）。

**6\\*.** 在卢森堡地区（território Luxemburgénsi），真福谢切利诺（Schecelínus），隐修士。在森林中无居无衣而活，唯信赖"使降雪如羊毛"的天主（十二至十三世纪）。

**7\\.** 在艾米利亚之博洛尼亚（Bonónia in Æmília），圣多明我（Domínicus），司铎之忌日（*natális*），其纪念于后日举行（1221年）。

**8\\*.** 在乌拉圭之蒙得维的亚（Mons Videns in Uruguáia），真福玛利亚·方济加（安纳·玛利亚）·鲁巴托（María Francísca a Iesu [Anna María] Rubatto），童贞。在意大利萨沃纳附近之洛阿诺（Loano）创立嘉布遣方济各第三会修女会（Institútum Sorórum Tertiariárum Capuccinárum），后赴拉丁美洲，竭尽全力服务穷人（1904年）。

**9\\*.** 在西班牙巴伦西亚省甘迪亚（Gandía）附近，真福卡洛斯·洛佩斯·比达尔（Cárolus López Vidal），殉道。在反信仰的迫害中获得天上的光荣（1936年）。

**10\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福塔德乌什·杜尔尼（Thaddáus Dulny），殉道。波兰人，祖国遭军事占领期间，因基督信仰被投入达豪集中营，在酷刑之下迁入天上的光荣（1942年）。

### 八月六日校注

1. **第1条（耶稣显圣容庆日）**：庆日（*festum*）。大博尔山（Thabor）从思高圣经。伯多禄、雅各伯、若望从思高圣经。"法律与先知"（*lege prophetísque*）指显圣容时出现的梅瑟（法律）与厄里亚（先知），见玛十七1-8。"卑微奴仆形象"（*humilitas servilis formae*）出自斐二7。"天主的肖像因亚当而败坏，在基督内得以重整"（*imágo Dei in Adam corrúpta, in Christo reformáta*）为教父神学核心命题。OCR首字母缺失，据西语版补全。

2. **第4条（圣荷弥斯达）**：荷弥斯达（Hormisdas, 514-523在位）。阿加齐乌斯裂教（Acacian Schism, 484-519）为东西方教会因君士坦丁堡宗主教阿加齐乌斯及"合一诏书"（Henotikon）而生之分裂，荷弥斯达于519年成功弥合。"新兴民族"指日耳曼诸王国。

3. **第6\\*条（真福谢切利诺）**："使降雪如羊毛"（*dat nivem sicut lanam*）引自咏一四七16，从思高圣经。

4. **第7条（圣多明我忌日）**：圣多明我（Dominicus, 1170-1221）之忌日在八月六日，其纪念（*memória*）在八月八日举行。"后日"（*bíduo post*）即八月八日。

---

## 八月七日

**Die 7 augústi** · 八月十五前第七日（*Séptimo Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1
> A B C D E F F G H M N P
> 2 3 4 5 6 7 7 8 9 10 11 12

**1\\.** 圣西斯笃二世教宗（Xystus papa Secúndus）及同伴殉道之纪念。西斯笃教宗正在举行神圣礼仪、教导弟兄奉行天上的诫命时，因瓦勒良皇帝之诏令，士兵突然闯入，当即被捕斩首，时为八月六日。与教宗一同殉道的四位执事安葬于阿庇亚大道旁之加理多墓园。同日，其执事圣阿加皮托（Agapítus）与圣斐理齐西莫（Felicíssimus）倒于普雷德斯塔托墓园（cœmetérium Prætextáti），同葬于此（258年）。

**2\\.** 圣加耶大诺（Caietánus Thienǽus），司铎之纪念。在坎帕尼亚之那不勒斯，虔心致力于爱德事业，尤其照顾身患不治之症者。创立平信徒善会以推广宗教教育，并为改革教会而创立律修神职修会（Cléricos Reguláres），教导弟子遵循初期宗徒的生活方式（1547年）。

**3\\.** 在雷齐亚之奥格斯堡（Augústa Vindelicórum in Rǽtia），圣阿弗拉（Afra），殉道。罪妇皈依基督，尚未领洗，据传因宣认基督而被投入火中（304年）。

**4\\.** 在托斯卡纳之阿雷佐（Arétium in Etrúria），圣多纳托（Donátus），该城第二任主教。教宗圣大额我略（Gregórius Magnus）赞扬其祈祷之德能与力量（四世纪）。

**5\\.** 在比利时高卢之沙隆（Cataláunum in Gállia Bélgica），圣多纳齐亚诺（Donatiánus），主教（四世纪）。

**6\\.** 同在高卢之鲁昂（Rothómagum），圣维克特里齐奥（Victrícii），主教。初为军人，在尤里安皇帝治下，为基督之故抛弃军人腰带，遭军团长施以种种酷刑，被判处死刑。后获释出狱，被祝圣为主教，将桀骜不驯的莫里尼人（Moríni）与内尔维人（Nérvii）也引向了基督信仰（约410年）。

**7\\*.** 在勃艮第之贝桑松（Vesóntio in Burgúndia），圣多纳托（Donátus），主教。依据圣本笃、圣高隆邦（Columbánus）与圣切萨里奥（Cæsárius）之规条，为贞女们编纂了一部会规（658年以前）。

**8\\*.** 在威尼斯（Venétiæ），真福若尔当·福尔扎泰（Iordánus Forzaté），院长。在帕多瓦创建多座修院。竭尽全力仍无法挽回祖国之倾覆，遂以至虔之态度度过流亡岁月。以正直、善德与学识著称，虔敬地安息于主（约1248年）。

**9\\*.** 在西西里之墨西拿（Messána in Sicília），圣阿尔贝托·德·阿巴蒂斯（Albértus de Abbátibus），加尔默罗会司铎。以宣讲引导多位犹太人归依基督，并为被围城之本城供应粮食（约1306-1307年）。

**10\\*.** 在意大利皮切诺之萨索费拉托（Saxoferrátum in Picéno），真福阿尔贝托（Albértus），加玛道肋（Camaldulénsi）修会修士，以严苦生活与会规之至高遵守著称（1350年）。

**11\\*.** 在维斯蒂尼之阿奎拉（Aquila in Vestínis），真福文森特（Vincéntius），方济各小兄弟会修士，以谦卑与先知性神恩卓著（1504年）。

**12\\*.** 在埃塞俄比亚之贡达尔（Gondar in Æthiópia），真福万森的阿加唐哲洛（方济各）·努里（Agathángelus de Vindocíno [Francíscus] Nourry）与南特的加西亚诺（贡萨洛）·瓦斯·洛佩斯-内托（Cassiánus de Nannétibus [Gundisálvus] Vaz López-Netto），方济各嘉布遣会司铎、殉道。在叙利亚、埃及与埃塞俄比亚致力于使分离的基督徒与天主教会修好，终因埃塞俄比亚王之命令，以自身的绳索悬于树干之上，被乱石砸死（1638年）。

**13\\*.** 在英格兰之兰开斯特（Lancástria），真福玛尔定（圣斐理斯）（若望）·伍德考克（Martínus a Sancto Felíce [Ioánnes] Woodcock），方济各小兄弟会会士，厄德华·班贝尔（Eduárdus Bamber）与多默·惠特克（Thomas Whitaker），司铎、殉道。因为司铎而进入查理一世（Cárolus rex Primus）之领土，被处绞刑（1646年）。

**14\\*.** 同在英格兰之约克（Ebóracum），真福尼各老·波斯特盖特（Nicoláus Postgate），司铎、殉道。在查理二世治下，因秘密行使司铎职务约五十年之久服务穷人，被处以绞刑（1679年）。

**15\\*.** 在波兰波兹南（Posnánia）附近之古尔卡·杜霍夫纳（Górka Duchowna），真福厄德蒙德·博亚诺夫斯基（Edmúndus Bojanowski）。依据福音之教导，竭力教育穷人与乡民，并创立天主之母始胎无原罪婢女会（Congregátio Ancillárum Immaculátæ Conceptiónis Matris Dei）（1871年）。

**16\\.** 在墨西哥之科利马（Colíma），圣弥额尔·德·拉·莫拉（Michaél de la Mora），司铎、殉道。教会遭受烈焰般迫害之际，因司铎身份而荣获殉道之冠（1927年）。

### 八月七日校注

1. **第1条（圣西斯笃二世及同伴）**：纪念（*memória*）。西斯笃二世（Sixtus II, 257-258在位）。瓦勒良皇帝（Valerian, 253-260在位）从世俗通行译法。六位执事与教宗同日殉道。执事圣老楞佐（Laurentius）在三日后（八月十日）殉道，为另一庆日。OCR首字母缺失，据西语版补全。

2. **第2条（圣加耶大诺）**：纪念（*memória*）。加耶大诺·蒂耶讷（Gaetano da Thiene, 1480-1547），创立律修神职修会（Clerici Regulares），又称嘉定会（Theatines），为天主教改革运动之先驱。OCR首字母缺失。

3. **第3条（圣阿弗拉）**：阿弗拉为罪妇皈依后殉道，且"尚未领洗"（*nondum baptizáta*），与七月一日第13条（张怀禄）及七月二十日第16条（郗柱子）同属血洗案例。

4. **第6条（圣维克特里齐奥）**：尤里安（Julian）皇帝治下之军人殉道者。"抛弃军人腰带"（*cíngulum abíciens*）为罗马军人拒绝继续服役之象征性行为。莫里尼人与内尔维人为高卢北部（今比利时北部）之部族。

5. **第12\\*条（埃塞俄比亚殉道真福）**："以自身的绳索悬于树干"（*próprio fune trúncis suspénsi*）指被以方济各会士所佩之绳索缢于树上，为极具象征意义之残酷殉道方式。

6. **第14\\*条（真福尼各老·波斯特盖特）**：波斯特盖特（Nicholas Postgate, c.1597-1679）秘密服务约五十年而未被发现，为英格兰殉道者中服务时间最长者之一。查理二世从世俗通行译法。

7. **第16条（墨西哥殉道圣人）**：弥额尔·德·拉·莫拉（Miguel de la Mora, 1874-1927），墨西哥基督战争（Cristero War）期间殉道之教区司铎。西语版标为16\\*（真福），拉丁文标为16（无星号，*sanctus*），从拉丁文。

---

## 八月八日

**Die 8 augústi** · 八月十五前第六日（*Sexto Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2
> A B C D E F F G H M N P
> 3 4 5 6 7 8 8 9 10 11 12 13

**1\\.** 圣多明我（Domínicus），司铎之纪念。在阿尔比异端扰乱各地之际，甘愿度极度贫穷的隐退生活，或与天主交谈，或论及天主。渴望以新方式传扬信仰，创立了多明我会（Ordo Prædicatórum），使宗徒的生活方式在教会中得以更新。嘱咐弟兄们以祈祷、研学与圣言的服务来服事近人。在博洛尼亚于八月六日辞世（1221年）。

**2\\.** 在罗马以南阿庇亚大道第十五里程碑之阿尔巴诺（Albánum），圣塞贡多（Secúndus）、加尔波佛洛（Carpóphorus）、维克多利诺（Victorínus）与塞韦里亚诺（Severiánus），殉道（年代不详）。

**3\\.** 在罗马奥斯提恩塞大道第七里程碑处，圣济利亚科（Cyríacus）、拉尔格（Largus）、克雷森齐亚诺（Crescentiánus）、默弥亚（Mémmia）、茹利亚纳（Iuliána）与斯马辣格多（Smarágdus），殉道（年代不详）。

**4\\.** 在基利齐亚之塔尔索（Tarsus in Cilícia），纳匝尔布老者圣马里诺（Marínus）殉难（*pássio*）。在戴克里先皇帝及总督利西亚（Lýsia）治下被斩首，遗体奉长官之命被弃于野兽（年代不详）。

**5\\.** 在利古里亚之米兰（Mediolánum in Ligúria），圣欧瑟伯（Eusébius），主教。为正统信仰辛勤劳作，并修复了被匈人摧毁的主教座堂（462年）。

**6\\.** 在里昂高卢之维埃纳（Viénna in Gállia Lugdunénsi），圣塞韦洛（Sevérus），司铎（约500年）。

**7\\*.** 在阿基坦之波尔多（Burdígala in Aquitánia），圣穆莫洛（Múmmolus），弗勒里修院（Floriacénsis）院长（七世纪）。

**8\\.** 在赫勒斯滂之基齐科（Cýzicus in Hellespónto），圣厄弥利亚诺（Æmiliánus），主教。因敬礼圣像而在利奥皇帝治下受尽苦难，最终在流放中辞世（八世纪）。

**9\\*.** 在奥地利之格特韦格修院（monastérium Godewicénse in Áustria），圣阿尔特曼（Altmánnus），帕绍（Passaviénsis）主教。按圣奥斯定会规创建多座圣职修院，整顿圣职人员纪律。因捍卫教会自由而遭亨利四世（Henrícus imperátor Quartus）逐出主教座，客死异乡（1091年）。

**10\\*.** 在托斯卡纳维泰尔博（Vitérbium）附近之加莱塞（Gallésium），圣法米亚诺（Famiánus），隐修士。生于科隆（Colónia Agrippína），将财产分施穷人后，经多次圣地朝圣，身着熙笃会会衣在此地辞世（1150年）。

**11\\*.** 在英格兰之伦敦（Londínium），真福若望·费尔顿（Ioánnes Felton），殉道。公开张贴圣庇护五世教宗（Pius papa Quintus）针对伊丽莎白一世女王所颁之绝罚令。因此在圣保禄座堂前被施以惨烈肢解之刑，口呼救主之名而光荣完成殉道（1570年）。

**12\\*.** 同在英格兰之约克（Ebóracum），真福若望·芬格利（Ioánnes Fingley），司铎、殉道。在伊丽莎白一世治下因司铎身份被判处死刑，在绞刑台上殉难。与他一同纪念的有真福罗伯特·比肯代克（Robértus Bickendike），殉道。在同一时期（确切日期与年份不详），因与天主教会重归共融而遭受同一极刑。

**13\\.** 在中国河北省（*Hebei*）新河县（*Xinhexian*）附近之西小屯（*Xixiaodun*），圣柯廷柱保禄（Paulus Ke Tingzhu），殉道。为教友村落之领袖，在义和团（*Yihetuan*）之迫害中被一寸寸凌迟剥肉，在众人面前焕发出坚毅不屈之光辉典范（1900年）。

**14\\*.** 在西班牙之萨莫拉（Zamóra），真福博尼法齐亚·罗德里格斯·卡斯特罗（Bonifátia Rodríguez Castro），童贞。关切妇女在基督信仰与社会中的进步，仿效纳匝肋圣家以祈祷与劳作之精神，创立圣若瑟婢女会（Congregátio Servárum a Sancto Ioseph）（1905年）。

**15\\*.** 在澳大利亚之悉尼（Sydnéyum in Austrália），真福十字架的玛利亚（玛利亚·厄莱纳）·麦基洛普（María a Cruce [María Héléna] MacKillop），童贞。创立圣若瑟与圣心修女会（Congregátio Sorórum a Sancto Ioseph et a Sacro Corde），在重重磨难与屈辱中领导修会（1909年）。

**16\\*.** 在托斯卡纳之波焦阿卡亚诺（Pódium Caiánum in Etrúria），真福玛利亚·玛加利大（玛利亚·安纳·罗撒）·卡亚尼（María Margaríta [María Anna Rosa] Caiani），童贞。创立方济各圣心至小修女会（Institútum Franciscanárum Sorórum Minimárum a Sacro Corde），以培育青年并救助病人（1921年）。

**17\\*.** 在西班牙巴伦西亚附近之萨莱尔（El Saler），真福安多尼·西尔韦斯特雷·莫亚（Antónius Silvestre Moya），司铎、殉道。在反信仰的猛烈迫害中，以不屈的基督见证抵达天上之国（1936年）。

**18\\*.** 同在西班牙之巴伦西亚（Valéntia），真福耶稣圣婴的玛利亚·巴尔迪略·伊·布利特（María a Iesu Infánte Baldillou y Bullit）及同伴，圣母虔学女儿会（Institútum Filiárum Maríæ Scholárum Piárum）童贞、殉道。在同一迫害中因教会仇敌之暴力，光荣地迎向了基督净配（1936年）。

**19\\*.** 在德意志之古森（Gusen）集中营，真福弗拉基米尔·拉斯科夫斯基（Vladimírus Laskowski），司铎、殉道。波兰人，战争期间因信仰被投入集中营，遭受残酷折磨后获得殉道之荣光（1940年）。

### 八月八日校注

1. **第1条（圣多明我）**：纪念（*memória*）。多明我（Dominicus de Guzmán, 1170-1221），多明我会创始人。"或与天主交谈，或论及天主"（*cum Deo vel de Deo semper loquens*）为其名言。"阿尔比异端"（*hǽresis Albigénsis*）即卡特里派（Catharism），十二至十三世纪盛行于法国南部。忌日记录见八月六日第7条。OCR首字母缺失，据西语版补全。

2. **第9\\*条（圣阿尔特曼）**：帕绍主教阿尔特曼（Altmann von Passau, c.1020-1091）在主教叙任权之争（Investiture Controversy）中支持教宗额我略七世，被亨利四世（Henry IV, 1056-1106在位）驱逐。亨利四世从世俗通行译法。格特韦格修院（Göttweig）在今奥地利下奥地利州。

3. **第11\\*条（真福若望·费尔顿）**：费尔顿（John Felton, d. 1570）将庇护五世教宗的绝罚令（Regnans in Excelsis, 1570年）张贴于伦敦街头，被逮捕后在圣保禄座堂前被处以极刑。此绝罚令宣布伊丽莎白一世为异端和裂教者，免除英格兰天主教徒对女王的效忠义务。

4. **第13条（中华殉道圣人）**：柯廷柱（Ke Tingzhu），河北省新河县（Xīnhé xiàn，今邢台市新河县）西小屯之教友领袖，1900年义和团迫害期间殉道。"一寸寸凌迟剥肉"（*particulátim excarnificátus*）为殉道圣人录中极惨烈之描写。

5. **第15\\*条（真福十字架的玛利亚·麦基洛普）**：玛利亚·麦基洛普（Mary MacKillop, 1842-1909），2004年版为真福，2010年教宗本笃十六世封圣，为澳大利亚首位封圣者。

6. **第18\\*条**：拉丁原版脚注2列出同伴之姓名。"巴尔迪略·伊·布利特"中的"伊"为拉丁原文中 *y* 之直译，保留以忠于原文人名拼写。

---

## 八月九日

**Die 9 augústi** · 八月十五前第五日（*Quinto Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3
> A B C D E F F G H M N P
> 4 5 6 7 8 9 9 10 11 12 13 14

**1\\.** 十字架的圣德肋撒·本笃（依迪德·斯坦因）（Terésia Benedícta a Cruce [Edítha] Stein），加尔默罗赤足会童贞、殉道。生于犹太教家庭并受其教育。多年在艰辛中教授哲学后，经圣洗重生于基督的新生命，继而披上修女的面纱。在一仇视人的尊严与信仰的邪恶政权下，被逐入流亡与囚禁，在波兰克拉科夫（Cracóvia）附近之奥斯维辛（Oświęcim/Auschwitz）灭绝营中被毒气杀害（1942年）。

**2\\.** 在罗马蒂布尔蒂纳大道旁之圣老楞佐墓园（cœmetérium sancti Lauréntii via Tiburtína），圣罗马诺（Románus），殉道（258年）。

**3\\*.** 在爱尔兰之阿哈修院（monastérium Achadénse in Hibérnia），圣纳图斯（Nathus），主教、院长（六世纪）。

**4\\*.** 同在爱尔兰之基尔莫尔（Kilmóra），圣费德利米诺（Fedlimínus），主教（六世纪）。

**5\\.** 在君士坦丁堡，纪念诸位殉道圣人。据传当利奥三世（Leo III Isáuricus）下令拆毁安放于铜门（Porta Ǽnea）之古老救主圣像时，他们挺身捍卫而遭杀害（约726年）。

**6\\*.** 在卡拉布里亚之帕莱纳（Paléna），真福法尔科（Falcus），隐修士（约1146年）。

**7\\*.** 在托斯卡纳之佛罗伦萨（Floréntia in Etrúria），真福萨勒诺的若望（Ioánnes de Salérno），多明我会司铎。创建圣母新堂修院（convéntus Sanctæ Maríæ Novéllæ），无畏地与卡特里派异端（hæréticos Patarénos，意大利称帕塔雷诺）斗争（约1242年）。

**8\\*.** 在托斯卡纳之阿尔韦尔尼亚山（mons Alvérniæ in Etrúria），真福费尔莫的若望（Ioánnes de Firmo），方济各小兄弟会司铎。在独居中以惊人的苦行与补赎克制肉身（1322年）。

**9\\*.** 在英格兰之伦敦（Londínium），真福理查德·贝尔（Richárds Bere），司铎、殉道。在亨利八世之命令下，因忠于罗马教宗及捍卫基督徒婚姻，与伦敦加尔都西会同道一起长期饱受狱中的污秽与饥饿，终于含苦而殁（1537年）。

**10\\*.** 在法国罗什福尔海岸外停泊之肮脏囚船上，真福克劳德·理查尔（Cláudius Richard），圣本笃修会司铎、殉道。法国大革命期间因司铎身份被逐出美迪亚诺修院（Mediánum monastérium），投入奴隶运输船。在看护患病同囚时自己亦染疫而亡（1794年）。

**11\\*.** 在西班牙之萨拉曼卡（Salmántica），真福耶稣的坎迪达·玛利亚（若安纳·若瑟法）·齐比特里亚（Cándida María a Iesu [Ioánna Iosépha] Cipitria），童贞。创立耶稣女儿会（Congregátio Filiárum Iesu）以协助儿童的基督教育（1912年）。

**12\\*.** 同在西班牙之巴尔巴斯特罗（Barbástrum），真福弗洛伦蒂诺·阿森西奥·巴罗索（Florentínus Asensio Barroso），主教、殉道。在反教会的猛烈迫害中，始终不停地向托付给他的子民宣讲信仰，最终以自身之血为信仰作证，被民兵乱弹射杀（1936年）。

**13\\*.** 同在西班牙之巴塞罗那（Barcínona），真福殉道者鲁本（耶稣）·洛佩斯·阿吉拉尔（Ruben a Iesu López Aguilar）及六位同伴，天主教仁爱修会修士。在同一迫害中因仇恨修道生活而被杀害，迁归于主（1936年）。

**14\\*.** 同在西班牙韦斯卡省之阿萨努伊（Azanuy），真福殉道者法乌斯蒂诺·奥泰萨（Faustínus Oteiza），司铎，与弗洛伦蒂诺·斐理伯（Florentínus Felipe），均属圣母虔学会修士。在同一迫害中为基督殉难（1936年）。

**15\\*.** 同在西班牙托莱多附近之阿尔赫斯（Argès prope Tolétum），真福纪廉·普拉萨·埃尔南德斯（Guliélmus Plaza Hernández），教区工人司铎善会司铎、殉道。在同日同一搏斗中交付了灵魂（1936年）。

**16\\*.** 同在西班牙巴伦西亚省之卡尔卡申特（Carcaixent），真福赫尔马诺（若瑟·玛利亚）·加里格斯·埃尔南德斯（Germánus [Iosephus María] Garrigues Hernández），方济各嘉布遣会司铎、殉道。在反信仰的猛烈迫害中，以宝贵之死战胜了肉身的酷刑（1936年）。

### 八月九日校注

1. **第1条（十字架的圣德肋撒·本笃）**：依迪德·斯坦因（Edith Stein, 1891-1942），德国犹太裔哲学家，埃德蒙德·胡塞尔（Edmund Husserl）之学生。1922年领洗，1934年加入科隆加尔默罗赤足会修院，取会名"十字架的德肋撒·本笃"。1942年因纳粹迫害犹太人被捕，与姊妹罗撒一同被送往奥斯维辛灭绝营，以毒气杀害。1998年教宗若望保禄二世封圣，并宣布为欧洲主保圣人之一。OCR首字母缺失并含显示残余文字"D"。

2. **第5条（君士坦丁堡殉道者）**：利奥三世（Leo III the Isaurian, 717-741在位），从世俗通行译法。铜门（Porta Aenea，希腊文 Χαλκῆ Πύλη/Chalke Gate）为君士坦丁堡大皇宫正门。726年利奥三世下令拆除门上之基督圣像，为圣像破坏运动（Iconoclasm）之标志性事件。

3. **第9\\*条（真福理查德·贝尔）**：伦敦加尔都西会修士，因拒绝承认亨利八世之至上权（Act of Supremacy）而入狱。"捍卫基督徒婚姻"（*matrimónii christiáni defensiónem*）指反对亨利八世与阿拉贡的加大利纳离婚。

---

## 八月十日

**Die 10 augústi** · 八月十五前第四日（*Quarto Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4
> A B C D E F F G H M N P
> 5 6 7 8 9 10 10 11 12 13 14 15

**1\\.** 圣老楞佐（Lauréntius），执事、殉道之庆日。如圣大良所述，他渴望追随教宗西斯笃，甚至共享其殉道。当被命交出教会的财宝时，将穷人呈给暴君观看：他曾将教会的资财尽数用于供养和衣被穷人。三日后，他为基督信仰战胜了烈焰，为颂扬他的凯旋，连刑具也成为了光荣的标记。遗体安葬于罗马以其名命名的韦拉诺原野之墓园（cœmetérium in agro Veráno）（258年）。

**2\\.** 纪念殉道圣人们。在埃及之亚历山大里亚（Alexandría in Ægýpto），在瓦勒良皇帝之迫害中、总督厄弥利亚诺（Æmiliánus）治下，以各种精心设计的酷刑长久折磨后，以种种不同之死法获得了殉道之冠（约259年）。

**3\\*.** 在苏格兰之邓布莱恩（Dumblánum in Scótia），圣布拉诺（Blanus），主教（六世纪）。

**4\\*.** 在西西里之阿尔卡莫（Alcámi in Sicília），真福卡拉塔菲米的总领天使·皮亚琴蒂尼（Archángelus de Calataphíno Piacentini），方济各小兄弟会司铎，以苦行生活与隐修之志著称（1460年）。

**5\\*.** 在日本之壹岐（Iki），真福奥斯定·太田（Augustínus Ota），耶稣会修士、殉道。为基督被斩首（1622年）。

**6\\*.** 在法国罗什福尔海岸外之海峡中，真福殉道者克劳德·若瑟·茹弗雷·德·博讷丰（Cláudius Iosephus Jouffret de Bonnefont），圣苏尔比斯善会会士，方济各·弗朗索瓦（Francíscus François），方济各嘉布遣会会士，及拉匝禄·蒂耶尔索（Lázarus Tiersot），加尔都西会会士，司铎。法国大革命期间被投入肮脏的囚船，因司铎身份完成殉道（1794年）。

**7\\*.** 在西班牙巴伦西亚附近之萨莱尔（El Saler），真福若瑟·托莱多·佩利切尔（Iosephus Toledo Pellicer），司铎、殉道。效法其所崇敬的至高司祭基督，以殉道之凯旋追随了他（1936年）。

**8\\*.** 同在西班牙之巴伦西亚（Valéntia），真福若望·马尔托雷尔·索里亚（Ioánnes Martorell Soria），慈幼会司铎、殉道。在同一迫害中获殉道之冠。与他一同纪念的有真福伯多禄·美索内洛·罗德里格斯（Petrus Mesonero Rodríguez），同会修士、殉道。在巴伦西亚省之韦达特德托伦特（Vedat de Torrent），于不详之日期因基督之见证而获殉道（1936年）。

**9\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营内，真福方济各·杰维耶茨基（Francíscus Drzewiecki），天主圣意小工会（Congregátio Parvi Óperis Divínæ Providéntiæ）会士，与厄德华·格日马瓦（Eduárdus Grzymała），司铎、殉道。波兰人，战争期间被迫害者投入异国的监牢，因吸入致死毒气之刑而迁归于基督（1942年）。

### 八月十日校注

1. **第1条（圣老楞佐）**：庆日（*festum*）。老楞佐（Laurentius, d. 258），罗马教会七位执事之一。圣大良（Leo Magnus，教宗良一世）在其讲道中叙述老楞佐殉道事迹。"将穷人呈给暴君"为基督宗教传统中最著名的殉道逸事之一。"连刑具也成为了光荣的标记"（*in honórem eius triúmphi transiérunt étiam instruménta supplícii*）指传说中的铁烤架（gridiron），已成为圣老楞佐之象征。韦拉诺原野（Ager Veranus）之墓园即今罗马韦拉诺公墓（Cimitero del Verano），以圣老楞佐之名命名。OCR首字母缺失并含残余字符"C"。

2. **第5\\*条（日本殉道真福）**：奥斯定·太田（Augustine Ota），日本籍耶稣会修士。壹岐（Iki）为日本九州西北之岛屿。太田（Ota/おおた）为日本姓名，径用日文汉字。

3. **第9\\*条（达豪殉道真福）**："因吸入致死毒气之刑"（*per supplícium exhalatiónis mortíferi vapóris*）指纳粹在达豪集中营以毒气处决囚犯。天主圣意小工会（Opera della Divina Provvidenza）为意大利真福路易·奥里奥内（Luigi Orione）所创。

---

## 八月十一日

**Die 11 augústi** · 八月十五前第三日（*Tértio Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 17 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5
> A B C D E F F G H M N P
> 6 7 8 9 10 11 11 12 13 14 15 16

**1\\.** 圣佳兰（Clara），童贞之纪念。追随圣方济各，在翁布里亚之亚西西（Asísium in Umbria）度严苦而丰盛于爱德与虔诚善功的生活。她是贫穷之卓越爱好者，即使在极端的匮乏与病痛中，也绝不允许自己与贫穷分离（1253年）。

**2\\.** 在本都之科马纳（Cómana in Ponto），圣亚历山大（Alexánder），绰号"烧炭者"（*Carbonárius*），主教。从哲学中领悟了基督徒谦逊的卓越学问，由圣行奇迹者额我略（Gregórius Thaumatúrgus）擢升为该教会主教。不仅以宣讲，更以在烈火中圆满的殉道而闻名（三世纪）。

**3\\.** 在罗马拉比卡纳大道第三里程碑之双月桂墓园（cœmetérium ad duas lauros via Labicána），圣弟铎（Tibúrtius），殉道。教宗圣达马索（Dámasus）曾颂扬其荣光（约四世纪）。

**4\\.** 同在罗马，纪念圣苏珊纳（Susánna）。以其名著称于古代圣人名录中之殉道者行列，六世纪在戴克里先浴场（Thermæ Diocletiáni）旁之加犹堂区（Títulus Gáii）建有一座奉献于天主的大殿。

**5\\.** 在翁布里亚之亚西西（Asísium），圣鲁菲诺（Rufínus），被尊为该城首任主教与殉道者（年代不详）。

**6\\*.** 在坎帕尼亚之贝内文托（Benevéntum in Campánia），圣加西亚诺（Cassiánus），主教（约四世纪）。

**7\\.** 在法国之埃夫勒（Ebróicæ in Gállia），圣陶里诺（Taurínus），被尊为该城首任主教（年代不详）。

**8\\*.** 在爱尔兰（Hibérnia），圣阿特拉克塔（Attráctæ），女院长。据传从圣巴特利爵（Patrícius）手中领受了贞女的面纱（五世纪）。

**9\\.** 在瓦莱里亚省（província Valéria），圣厄基齐奥（Equítius），院长。如教宗圣大额我略所述，因其圣德之恩宠成为众多修院之父，凡他所到之处，皆为人开启圣经之泉源（约570年）。

**10\\.** 在奥斯特拉西亚之康布雷（Camerácum in Austrásia），圣高热里科（Gaugéricus），主教。以虔诚与爱护穷人闻名，由特里尔主教马涅里科（Magnéricus Trevirénsis）祝圣为执事。当选为康布雷主教后，治理教会三十九年（约625年）。

**11\\*.** 在普罗旺斯之阿尔勒（Areláte in Província），圣鲁斯蒂科拉（Rustícola），女院长。圣善地统领修女们近六十年（约632年）。

**12\\*.** 在英格兰之格洛斯特（Glocéstria），真福若望·桑兹（Ioánnes Sandys）与斯德望·罗沙姆（Stéphanus Rowsham），司铎，及威廉·兰普利（Guliélmus Lampley），手套匠，殉道。在伊丽莎白一世治下，于不同日期（具体不详）为基督遭受了同一极刑。

**13\\*.** 在法国罗什福尔港外停泊之囚船上，真福若望·乔治（雅各伯）·雷姆（Ioánnes Geórgius [Iacóbus] Rhem），多明我会司铎、殉道。在迫害期间被投入肮脏的囚禁中，以希望激励遭受酷虐的同囚们，直至自己为不治之症所吞噬而为基督殉命（1794年）。

**14\\*.** 在西班牙巴伦西亚省之阿古连特（Agullent），真福辣法厄尔·阿隆索·古铁雷斯（Raphaél Alonso Gutiérrez），殉道。为一家之父，在反信仰的猛烈迫害中为基督倾洒了热血（1936年）。与他一同纪念的有真福卡洛斯·迪亚斯·甘迪亚（Cárolus Díaz Gandía），殉道，在同日同一省份中以信仰之搏斗获得了永生。

**15\\*.** 同在西班牙塔拉戈纳附近之普拉特德孔普特（Prat de Compte），真福弥额尔·多明戈·森德拉（Michaél Domingo Cendra），慈幼会修士、殉道。在同一迫害中以殉道获得了殊胜的棕枝（1936年）。

**16\\*.** 在西藏边境（ad fines Tibéti），真福莫里斯·托尔奈（Maurítius Tornay），悠山圣尼各老与圣贝尔纳尔多律修咏经司铎会（Congregátio Sanctórum Nicolái et Bernárdi Montis Iovis）司铎、殉道。在中国（*Sinis*）与西藏热切传播福音，被基督之名的仇敌杀害（1949年）。

### 八月十一日校注

1. **第1条（圣佳兰）**：纪念（*memória*）。佳兰（Clara, 1194-1253），从方法论定译"佳兰"（不用"嘉勒"）。旧译"加辣"，因谐音不雅，今从台湾新译"佳兰"。方济各贫穷修女会（佳兰会/Poor Clares）创始人。"即使在极端的匮乏与病痛中，也绝不允许自己与贫穷分离"（*ab ea numquam, ne in extréma quidem indigéntia et infirmitáte, divélli concéssit*）为圣佳兰精神之精炼概括。OCR首字母缺失。

2. **第2条（圣亚历山大"烧炭者"）**：亚历山大因从事烧炭工作而得此绰号。圣行奇迹者额我略（Gregory Thaumaturgus, c.213-c.270）发现其在卑微职业中隐藏的深厚德行，将他擢升为科马纳主教。

3. **第10条（圣高热里科）**：马涅里科为特里尔主教，见七月二十五日第6条及第7\\*条。康布雷（Cambrai）在今法国北部。

4. **第16\\*条（真福莫里斯·托尔奈）**：莫里斯·托尔奈（Maurice Tornay, 1910-1949），瑞士籍律修咏经司铎，属大圣伯尔纳尔多山口（Grand-Saint-Bernard）之圣尼各老与圣贝尔纳尔多律修会。在云南与西藏边境传教，1949年被拉萨当局派遣之人杀害。"在中国与西藏"（*in Sinis et Tibeto*）指其传教活动横跨中国云南省与西藏地区。

---

## 八月十二日

**Die 12 augústi** · 八月十五前夕（*Prídie Idus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 18 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6
> A B C D E F F G H M N P
> 7 8 9 10 11 12 12 13 14 15 16 17

**1\\.** 圣若安纳·方济加·弗雷米奥·德·尚达尔（Ioánna Francísca Frémiot de Chantal），修女之纪念。在基督徒婚姻中育有六名子女，以至虔之心教养。丈夫去世后，在圣方济各·沙雷（Francíscus de Sales）的引导下热忱地奔走成全之路，向穷人尤其向病人广施爱德之工。创立圣母往见会（Ordo Visitatiónis Sanctæ Maríæ），并以智慧加以领导。实于十二月十三日在法国讷韦尔（Nivérnum）附近阿利埃河（Eláver）畔之穆兰（Molínis）辞世（1641年）。

**2\\.** 在西西里之卡塔尼亚（Cátana in Sicília），圣厄乌普洛（Euplus），殉道。在戴克里先皇帝之迫害中，据传手持福音书卷，被总督加尔维西亚诺（Calvisiánus）投入监狱。再次受审时，他以光荣宣称"我将福音持于心中"作答，被棍棒活活打死（约304年）。

**3\\.** 在比提尼亚之尼科美狄亚（Nicomedía），圣阿尼切托（Anicétus）与圣佛齐奥（Phótius），殉道（年代不详）。

**4\\*.** 在爱尔兰之阿拉达（Alláda），圣穆雷达克（Muredáchus），主教（五至六世纪）。

**5\\*.** 同在爱尔兰，以其名命名之隐室中，圣莱利亚（Lélia），童贞（六世纪）。

**6\\.** 在伦巴第之布雷西亚（Bríxia in Langobárdia），圣厄尔库拉诺（Herculánus），主教（五世纪）。

**7\\.** 在普罗旺斯之莱兰岛（ínsula Lirinénsis in Província），圣波尔卡里奥（Porcárius），院长，及众多修士，殉道。据传被萨拉森人屠杀（约732年）。

**8\\*.** 在威尔士北部之鲁辛（Ruthínum in Cámbria），真福查理·米汉（Cárolus Meehan），方济各小兄弟会司铎、殉道。爱尔兰人，途经威尔士回国时被捕，因进入查理二世之领土被判处死刑，以绞刑与肢解获殉道之棕枝（1679年）。

**9\\*.** 在罗马，真福依诺增爵十一世（Innocéntius papa Undécimus），教宗。虽饱受剧痛与磨难，仍以智慧治理教会（1689年）。

**10\\*.** 在法国罗什福尔海岸外停泊之肮脏囚船上，真福伯多禄·雅里日·德·拉·莫雷利·德·皮尔东（Petrus Jarrige de la Morélie de Puyredon），司铎、殉道。教会遭受猛烈迫害期间，长时间暴露于酷烈的日晒之下，为基督而亡（1794年）。

**11\\.** 在东京（Tunquínum）之南定城（Nam Đinh），圣杜梅南雅各伯（Iacóbus Đỗ Mai Năm），司铎，圣阮迪安多尼（Antónius Nguyễn Đích），农民，及圣阮辉美弥额尔（Michaél Nguyễn Huy Mỹ），医师，殉道。在明命帝（Minh Mạng）治下遭受残酷刑讯后被斩首（1838年）。

**12\\*.** 在西班牙科尔多瓦附近之奥尔纳丘埃洛斯（Hornachuelos），真福维克多利亚·迪耶斯·布斯托斯·德·莫利纳（Victória Díez y Bustos de Molina），童贞、殉道。在德兰善会（Institútum Teresiánum）担任教师。教会遭受突袭之际，宣认基督信仰，激励他人走向殉道，自己也蒙获殉道之恩（1936年）。

**13\\*.** 在西班牙马德里附近之毛里山谷（Valle Mauri），真福弗拉维奥（阿蒂拉诺）·阿尔圭索·冈萨莱斯（Flávius [Atilánus] Argüeso González），天主教仁爱修会修士、殉道。在同一迫害中因仇恨信仰而殉难（1936年）。

**14\\*.** 同在西班牙阿拉贡韦斯卡附近之巴尔巴斯特罗（Barbástrum），真福殉道者塞巴斯蒂安·卡尔沃·马丁内斯（Sebastiánus Calvo Martínez），司铎，及五位同伴，均属圣母无玷圣心传教士会（Claretians）。在同一迫害中跑完了光荣的赛程（1936年）。

**15\\*.** 同在西班牙之塔拉戈纳（Tarráco），真福安多尼·佩鲁列斯·埃斯蒂维尔（Antónius Perulles Estívill），教区工人司铎善会司铎、殉道。在同一迫害的风暴中于路途上完成了搏斗（1936年）。

**16\\*.** 在德意志巴伐利亚慕尼黑附近之达豪（Dachau）集中营，真福弗洛里安·斯滕普尼亚克（Floriánus Stępniak），方济各嘉布遣会会士，与若瑟·斯特拉舍夫斯基（Iosephus Straszewski），司铎、殉道。波兰人，战争期间在集中营中因致死毒气之污染而辞世（1942年）。

**17\\*.** 同在德意志慕尼黑附近之普拉内格（Planegg），真福卡尔·莱斯纳（Cárolus Leisner），司铎、殉道。尚为执事时，即因公开宣认信仰及不懈地服务灵魂而被投入监狱。在达豪集中营中被祝圣为司铎。虽获释归于自由，终因囚禁中所承受的磨难而辞世（1945年）。

### 八月十二日校注

1. **第1条（圣若安纳·方济加·德·尚达尔）**：纪念（*memória*）。若安纳·方济加·弗雷米奥·德·尚达尔（Jeanne-Françoise Frémyot de Chantal, 1572-1641），从法文名形式。圣方济各·沙雷（François de Sales, 1567-1622）为其灵修导师。沙雷（Sales）从法文发音。圣母往见会（Visitandines）1610年创立于安讷西（Annecy）。辞世日为十二月十三日，故本日非忌日。OCR首字母缺失。

2. **第2条（圣厄乌普洛）**："我将福音持于心中"（*se Evangélia in corde tenére*）：第一次受审时手持福音书卷（*volumina Evangeliorum in manu*），第二次受审时宣称已将福音刻于心中。

3. **第11条（越南殉道圣人）**：杜梅南（Đỗ Mai Năm），汉字推定：杜=Đỗ（无歧义），梅=Mai（无歧义），南=Năm（中等偏高，越南语"南"或"五"）。阮迪（Nguyễn Đích），迪=Đích（中等偏高）。阮辉美（Nguyễn Huy Mỹ），辉=Huy（无歧义），美=Mỹ（无歧义）。三人分别为司铎、农民及医师，在南定城同日殉道。

4. **第14\\*条（巴尔巴斯特罗殉道者）**：第二批巴尔巴斯特罗克拉良会殉道者（第一批见八月二日第11\\*条）。拉丁原版脚注4列出五位同伴之姓名。

5. **第17\\*条（真福卡尔·莱斯纳）**：卡尔·莱斯纳（Karl Leisner, 1915-1945），德国人，因公开反对纳粹被捕。1944年12月17日在达豪集中营内由同囚之法国主教加俾额尔·皮盖（Gabriel Piguet）秘密祝圣为司铎。1945年集中营解放后不久即因肺结核辞世。在集中营中被祝圣为司铎、仅主持一台弥撒后即辞世之经历，为二战殉道史中最动人之一页。1996年教宗若望保禄二世列为真福。

---

## 八月十三日

**Die 13 augústi** · 八月十五（*Idibus augústi*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 19 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7
> A B C D E F F G H M N P
> 8 9 10 11 12 13 13 14 15 16 17 18

**1\\.** 圣彭谦（Pontiánus），教宗，与圣依玻里多（Hippólytus），司铎，殉道之纪念。二人同被流放至撒丁岛（Sardínia），同受判决，并似乎共获同一荣冠。遗体后被迁回罗马：依玻里多移至蒂布尔蒂纳大道之墓园，彭谦移至加理多墓园（约235年）。

**2\\.** 在弗拉米尼亚之伊莫拉（Forum Cornélii in Flamínia），圣加西亚诺（Cassiánus），殉道。因拒绝崇拜偶像，被交给自己先前教过的学生们，以书写笔刺戳折磨至死。如此，手越稚弱，殉道之苦刑越为沉重（约四世纪）。

**3\\.** 在里昂高卢之里昂（Lugdúnum in Gállia），圣安提约古（Antíochus），主教。尚为司铎时，曾远赴埃及旷野探望其时正隐居于彼的本城主教圣儒斯托（Iustus）（约405年）。

**4\\.** 在阿基坦之普瓦捷（Pictávium in Aquitánia），圣拉德宫德（Radegúndis）。法兰克王后，丈夫克洛泰尔王（Clotárius rex）尚在世时即领受了修女面纱，在其亲手创建的普瓦捷圣十字架修院（monastérium Sanctæ Crucis Pictaviénsis）中依阿尔勒的圣切萨里奥会规度修道生活（587年）。

**5\\.** 在高加索山脉（iuga Cáucasi）希波斯河畔之谢马里堡（castrum Schemári），圣大玛西莫宣认者（Máximus Conféssor），君士坦丁堡附近克里索波利斯（Chrysópolis）修院院长之瞻礼（*tránsitus*）。以学识与捍卫天主教真理之热忱卓著。因奋力反对一志论（monothelítæ），被异端皇帝君士坦斯（Constans）砍去右手，与两位同名亚纳斯大削（Anastásius）的弟子一同在严酷的监禁与种种残暴之后被流放至拉齐卡（Lazíca）地区，将灵魂交还于天主（662年）。

**6\\.** 在奥斯特拉西亚黑森之弗里茨拉尔（Fritesláriæ in Hássia Austrásiæ），圣维格贝尔托（Vigbértus），司铎、院长。圣博尼法爵（Bonifátius）将此地修院之管理托付于他（约738年）。

**7\\*.** 在日耳曼沃伊特兰之阿尔滕堡修院（monastérium Aldenburgénse in terra Vocatórum），真福日多德（Gertrúdis），圣白冷修女会（Ordo Præmonstraténsis）女院长。幼年即被其母圣依撒伯尔（匈牙利王后）（Elísabeth regína Hungáriæ）在此地奉献于天主（1297年）。

**8\\*.** 在爱尔兰之马科利（Macólicum），真福巴特利爵·奥希利（Patrícius O'Healy），梅奥（Mayénsis）主教，与科恩·奥罗克（Connus O'Rourke），司铎，均属方济各小兄弟会。因公开行使司铎职务而被判处死刑，被送上绞刑台（1579年）。

**9\\*.** 在英格兰之维罗维亚库姆（Virovíacum），真福威廉·弗里曼（Guliélmus Freeman），司铎、殉道。在伊丽莎白一世治下仅因身为司铎而被判处死刑。在刑台前唱起"赞美天主颂"（*Te Deum*），以坚定的心灵走向殉道之刑（1595年）。

**10\\.** 在罗马，圣若望·贝尔克曼斯（Ioánnes Berchmans），耶稣会修士。因真诚的虔敬、无伪的爱德与恒常的喜乐而为众人所爱。短暂患病后欢欣地辞别尘世（1621年）。

**11\\*.** 在奥地利之维也纳（Vindóbona），真福亚维亚诺的玛尔谷（卡洛斯·多明我）·克里斯托佛里（Marcus de Aviáno [Cárolus Domínicus] Cristofori），方济各嘉布遣会司铎。天主圣言之卓越宣讲者，到处为穷人与病人施行奇妙的善工，尤其激励世上的当权者将信仰与和平置于一切事务与利益之上（1699年）。

**12\\*.** 在法国罗什福尔海岸外之海峡中，真福伯多禄·加比约（Petrus Gabilhaud），司铎、殉道。法国大革命风暴期间因司铎身份被囚于奴隶运输船上，为饥饿与疾病所吞噬（1794年）。

**13\\.** 在法国阿尼齐奥（Anícium）附近之索格（Saugues），圣贝尼尔多（伯多禄）·罗芒松（Beníldus [Petrus] Romançon），喇沙修士会会士。将一生投入教育青年的事业（1862年）。

**14\\*.** 在西班牙阿拉贡韦斯卡附近之巴尔巴斯特罗（Barbástrum），真福殉道者塞贡迪诺·玛利亚·奥尔特加·加西亚（Secundínus María Ortega García），司铎，及十九位同伴，均属圣母无玷圣心传教士会（Claretians）。反教会的猛烈迫害中，因仇恨修道生活而被杀害（1936年）。

**15\\*.** 在西班牙卡斯特利翁（Castellón）海岸附近之阿尔马索拉（Almazora），真福若望·阿格拉蒙特（Ioánnes Agramunt），圣母虔学会司铎、殉道。在同一迫害中殉难（1936年）。

**16\\*.** 在西班牙卡斯特利翁省之阿尔博卡塞尔（Albocàsser）附近，真福莫德斯托·加西亚·马尔蒂（Modéstus García Martí），方济各嘉布遣会司铎、殉道。在反信仰的迫害中以殉道成就了福音的宣认（1936年）。

**17\\*.** 同在西班牙之巴塞罗那（Barcínona），真福若瑟·博内特·纳达尔（Iosephus Bonet Nadal），慈幼会司铎、殉道。在同一迫害时期完成了为信仰的搏斗（1936年）。

**18\\*.** 在德意志柏林之普勒岑湖（Plötzensee in Berolíno），真福雅各伯·加普（Iacóbus Gapp），玛利亚会（Sociétas Maríæ）司铎、殉道。以坚定的心灵公开宣布一仇视人性与基督徒尊严之军事政权的邪恶主张与基督教义绝不相容。因此遭受迫害，流亡法国与西班牙，终被密探逮捕，以斩首处决（1943年）。

### 八月十三日校注

1. **第1条（圣彭谦与圣依玻里多）**：纪念（*memória*）。教宗彭谦（Pontian, 230-235在位）与司铎依玻里多（Hippolytus, c.170-c.236）同被流放至撒丁岛矿山。依玻里多为早期教会重要神学家，曾与罗马主教不和，后在流放中与彭谦和解。OCR首字母缺失。

2. **第2条（圣加西亚诺）**：伊莫拉（Imola）殉道教师。"手越稚弱，殉道之苦刑越为沉重"（*quanto infírmior manus, tanto grávior pœna*）为殉道圣人录中极精妙之修辞。伊莫拉拉丁名为 Forum Cornelii，参七月三十日第1条校注。

3. **第4条（圣拉德宫德）**：拉德宫德（Radegund, c.520-587），图林根公主，被法兰克王克洛泰尔一世（Clotaire I, 511-561在位）掳为王后。克洛泰尔从世俗通行译法。切萨里奥会规即阿尔勒的圣切萨里奥（Caesarius of Arles）为女修院所编之会规。

4. **第5条（圣大玛西莫宣认者）**：大玛西莫（Maximus the Confessor, c.580-662），参七月二十二日第5条校注。此处更详细记述其殉难经过：被砍去右手（*præcísa manu déxtera*），与两位弟子（均名亚纳斯大削）同被流放至高加索。君士坦斯（Constans II, 641-668在位），从世俗通行译法。一志论（Monothelitism）主张基督只有一个意志。

5. **第7\\*条（真福日多德）**：日多德从方法论定译（Gertruda）。其母匈牙利王后圣依撒伯尔（Elizabeth of Hungary, 1207-1231）将幼女奉献于阿尔滕堡之圣白冷修女会修院。圣白冷修女会即普雷蒙特雷会（Premonstratensians/Norbertines）。

6. **第11\\*条（真福亚维亚诺的玛尔谷）**：亚维亚诺的玛尔谷（Marco d'Aviano, OFMCap, 1631-1699），意大利嘉布遣会士。"激励世上的当权者将信仰与和平置于一切事务与利益之上"暗指其在1683年维也纳之战中激励基督宗教联军抵抗奥斯曼帝国之功绩。

7. **第14\\*条（巴尔巴斯特罗殉道者）**：第三批巴尔巴斯特罗克拉良会殉道者（第一批见八月二日第11\\*条，第二批见八月十二日第14\\*条）。本批含司铎及十九位同伴，共二十人。拉丁原版脚注5列出同伴姓名。三批合计构成著名的"巴尔巴斯特罗殉道者"群体。

8. **第18\\*条（真福雅各伯·加普）**：雅各伯·加普（Jakob Gapp, SM, 1897-1943），奥地利籍玛利亚会（Marianists, Society of Mary, 创始人为纪廉·若瑟·沙米纳德）司铎。因公开反对纳粹意识形态而流亡，在西班牙被盖世太保特工诱捕，押往柏林普勒岑湖监狱处决。

---

## 八月十四日

**Die 14 augústi** · 九月初一前第十九日（*Décimo nono Kaléndas septémbris*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 20 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8
> A B C D E F F G H M N P
> 9 10 11 12 13 14 14 15 16 17 18 19

**1\\.** 圣国柏（Maximiliánus María Kolbe），方济各住院小兄弟会司铎、殉道之纪念。圣母无玷军旅（Milítia Maríæ Immaculátæ）之创立者。被先后押往多处拘禁之所，最终在波兰克拉科夫附近之奥斯维辛（Oświęcim/Auschwitz）灭绝营中，为一位同囚者将自己交付于刽子手，将其事奉献为爱德之全燔祭，成为忠于天主和世人的典范（1941年）。

**2\\.** 在伊利里亚（Illýricum），圣乌尔西齐诺（Ursicínus），殉道（年代不详）。

**3\\.** 在叙利亚之阿帕美亚（Apaméa in Sýria），圣马尔切洛（Marcéllus），主教、殉道。因摧毁了朱庇特神殿而被狂暴的异教徒杀害（约389年）。

**4\\.** 在罗马，圣欧瑟伯（Eusébius），厄斯奎利诺山上以其名命名之堂区（títulus）之创建者（四至五世纪）。

**5\\*.** 在爱尔兰之罗西亚（Róssia），圣法哈南（Fachanánus），主教、院长。在此地创建修院，以神学与世学之教育闻名（六世纪）。

**6\\.** 在弗兰德之阿尔登堡（Aldenbúrgum in Flándria），苏瓦松（Suessionénsis）主教圣阿尔努尔夫（Arnúlphus）之瞻礼（*tránsitus*）。先为军人，继为修士，后为主教。毕生致力于和平与和睦，在其亲手创建的修院中辞世（1087年）。

**7\\*.** 在意大利皮切诺之巴罗基奥山（Mons Baróchius）附近，真福桑托·迪·乌尔比诺·布兰科尔西尼（Sanctus de Urbíno Brancorsini），方济各小兄弟会辅理修士（1394年）。

**8\\*.** 在阿普利亚之奥特朗托（Hydrúntum in Apúlia），真福近八百位殉道者。奥斯曼帝国士兵攻入城中，命他们背弃信仰。但真福安多尼·普里马尔多（Antónius Primaldo），年迈的织工，劝勉众人在基督信仰中坚守不移。众人遂以斩首之刑领受了殉道之冠（1480年）。

**9\\.** 在日本之长崎（Nagasáki），圣多明我·伊巴涅斯·德·埃尔基齐亚（Domínicus Ibáñez de Erquicia），多明我会司铎，与圣方济各·庄右衛門（Francíscus Shoyemon），同会初学生兼传道员，殉道。在将军德川家光（Tokugawa Yemitsu）治下因仇恨基督之名而被杀害（1633年）。

**10\\*.** 在艾米利亚之科里亚诺（Coriánum in Æmília），真福依撒伯尔·伦齐（Elísabeth Renzi），童贞。创立痛苦圣母虔学师修女会（Magistræ Piæ a Vírgine Perdolénte），全心致力于以人文与教理教育培养贫穷少女（1859年）。

**11\\*.** 在西班牙巴伦西亚省之皮卡森特（Picassent），真福文森特·鲁比奥尔斯·卡斯特略（Vincéntius Rubiols Castelló），司铎、殉道。在反信仰的迫害中以殉道见证了基督（1936年）。

**12\\*.** 同在西班牙巴伦西亚附近之萨莱尔（El Saler），真福斐理斯·尤斯特·卡瓦（Felix Yuste Cava），司铎、殉道。因无畏的信仰忠贞而蒙主赐以永恒的赏报（1936年）。

### 八月十四日校注

1. **第1条（圣国柏）**：纪念（*memória*）。国柏（Maximilian Kolbe, OFMConv, 1894-1941），波兰籍方济各住院小兄弟会会士。创立圣母无玷军旅（Militia Immaculatae）推广圣母敬礼。1941年在奥斯维辛集中营中，自愿替代一位有家室的同囚者（弗朗齐谢克·加约夫尼切克）赴死，在饥饿牢房中以注射石碳酸被杀害。1982年教宗若望保禄二世封圣。"爱德之全燔祭"（*holocáustum caritátis*）为拉丁原文极具神学深度之用语。OCR首字母缺失。

2. **第8\\*条（奥特朗托殉道者）**：1480年奥斯曼帝国攻陷阿普利亚之奥特朗托（Otranto），近八百名市民因拒绝皈依伊斯兰教而被斩首。安多尼·普里马尔多（Antonio Primaldo）为年迈织工，以其劝勉坚定了众人的信心。2004年版为真福，2013年教宗方济各已将全体封圣。

3. **第9条（日本殉道圣人）**：多明我·伊巴涅斯（Domingo Ibáñez de Erquicia, OP, 1589-1633），西班牙籍多明我会司铎。方济各·庄右衛門（Francisco Shoyemon），日本籍传道员及多明我会初学生，径用日文汉字。德川家光（Tokugawa Iemitsu, 1604-1651），江户幕府第三代将军，从世俗通行译法。

---

## 八月十五日

**Die 15 augústi** · 九月初一前第十八日（*Décimo octávo Kaléndas septémbris*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 21 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9
> A B C D E F F G H M N P
> 10 11 12 13 14 15 15 16 17 18 19 20

**1\\.** 圣母升天节。天主及我们的主耶稣基督之母、荣福童贞玛利亚。结束了尘世生命的旅程后，灵魂与肉身一同被提升至天上的光荣中。此信仰由教会传统所接受，经教宗庇护十二世（Pius papa Duodécimus）隆重定义。

**2\\.** 在罗马阿庇亚大道旁之加理多墓园（cœmetérium Callísti），纪念圣塔尔西齐奥（Tarsícius），殉道。捍卫基督的至圣圣体，不使之被一群疯狂的异教暴众亵渎。他宁愿被乱石砸死，也不愿将圣物弃与犬类。

**3\\.** 在比提尼亚之尼科美狄亚（Nicomedía），圣斯特拉托（Strato）、斐理伯（Philíppus）与厄乌提基亚诺（Euthychiánus），殉道（年代不详）。

**4\\.** 在利古里亚之米兰（Mediolánum），圣辛普利齐亚诺（Simpliciánus），主教。圣盎博罗削（Ambrósius）指定其为自己的继任者，圣奥斯定以赞辞颂扬之（400年）。

**5\\.** 纪念圣亚利比奥（Alýpius），努米底亚之塔加斯特（Thagáste in Numídia）主教。先为圣奥斯定之门徒，继为皈依中的同伴，在牧灵职务中为同僚，在对抗异端的搏斗中为勇猛的战友，最终在天上的光荣中为伙伴（约430年）。

**6\\*.** 在日耳曼萨克森之希尔德斯海姆（Hildésia in Saxónia），圣阿尔特弗里德（Altfrídus），主教。建造了主教座堂并推动创建修院（874年）。

**7\\*.** 在潘诺尼亚之塞凯什白堡（Alba Regális in Pannónia），匈牙利人之国王圣斯德望（Stéphanus rex Hungarórum）之忌日（*natális*），其纪念于明日举行。

**8\\.** 在波兰之克拉科夫（Cracóvia），圣亚钦多（Hyacínthus），多明我会司铎。由圣多明我亲自派遣，在波兰推广本修会。与真福切斯劳（Cesláus）及日耳曼人亨利（Henrícus Germánicus）为同伴，在波希米亚（Bohémia）及西里西亚（Silésia）宣讲了福音（1257年）。

**9\\*.** 在意大利苏巴尔卑纳之萨维利亚诺（Saviliánum in Subalpínis），真福海蒙·塔帕雷利（Haymo Taparelli），多明我会司铎。真理之不倦捍卫者（1495年）。

**10\\*.** 在意大利诺瓦拉附近之帕兰齐亚（Pallántia apud Nováriam），真福布斯托阿尔西齐奥的儒利亚纳（Iuliána de Busto Arsítio），圣奥斯定修会童贞。以不屈不挠的坚毅、惊人的忍耐和不断默观天上事物著称（约1501年）。

**11\\.** 在罗马，圣斯坦尼斯劳·科斯特卡（Stanislaus Kostka），波兰人。渴望加入耶稣会，从父家出逃，徒步前往罗马，由圣方济各·鲍尔日亚（Francíscus de Borja）接纳入初学院。不久即在执行最卑微的职务中，以圣德著称辞世（1568年）。

**12\\*.** 在比利时刚果之布西拉（Busira）附近之文加（Wenga），真福依西多禄·巴坎贾（Isidórus Bakanja），殉道。年轻的基督徒工人，虔诚地持守信仰并无畏地为之作证。在劳动中因殖民监工出于对基督宗教的仇恨而遭受长时间的鞭笞酷刑，数月后宽恕了迫害者，交还了灵魂（1909年）。

**13\\.** 在墨西哥杜兰戈地区（território Durangénsis）之查尔奇韦特斯（Chalchihuites），圣殉道者路易·巴蒂斯·赛恩斯（Aloýsius Batis Sáinz），司铎，曼努埃尔·莫拉莱斯（Emmanuél Morales），一家之父，萨尔瓦多尔·拉拉·普恩特（Salvátor Lara Puente）与达维德·罗尔丹·拉拉（Dávid Roldán Lara）。在墨西哥教难中因仇恨基督之名而被杀害（1926年）。

**14\\*.** 在西班牙阿拉贡韦斯卡附近之巴尔巴斯特罗（Barbástrum），真福殉道者路易·马斯费雷尔·比拉（Ludovícus Masferrer Vila），司铎，及十九位同伴，均属圣母无玷圣心传教士会。在反教会的猛烈迫害中为基督献出了生命，迎向了前日在同一地点被杀害之同会弟兄们的天上光荣（1936年）。

**15\\*.** 在西班牙卡斯特利翁（Castellón）海岸附近之阿尔马索拉（Almazora），真福若瑟·玛利亚·佩里斯·波洛（Iosephus María Peris Polo），教区工人司铎善会司铎、殉道。在同一迫害中于墓地获得殉道之棕枝（1936年）。

**16\\*.** 同在西班牙之马德里（Matrítum），真福玛利亚（圣所·圣亚尔丰索·公撒格）（厄尔维拉）·莫拉加斯·坎塔雷罗（María a Sacrário a Sancto Aloýsio Gonzaga [Elvíra] Moragas Cantarero），加尔默罗赤足修女会童贞、殉道。在同一迫害中殉难（1936年）。

**17\\*.** 同在马德里，真福多明我（奥斯定）·乌尔塔多·索莱尔（Domínicus [Augustínus] Hurtado Soler），方济各第三会苦难圣母嘉布遣会司铎、殉道。因基督之见证而获加冕（1936年）。

**18\\*.** 在西班牙格拉纳达海滨之莫特里尔（Motril），真福文森特·索莱尔（Vincéntius Soler），奥斯定归省会司铎、殉道。在同一迫害中与其他同囚者一起被判死刑。在他虔诚地为同囚们预备好赴死之心后，众人在墓地围墙前中弹，在基督内凯旋（1936年）。

**19\\*.** 同在西班牙巴伦西亚省甘迪亚（Gandía）附近之帕尔马（Palma de Gandía），真福加尔默罗·萨斯特雷（Carmélos Sastre Sastre），司铎、殉道。在同一迫害中追随基督的足迹，蒙基督之恩典抵达永恒之国（1936年）。

**20\\*.** 同在西班牙巴塞罗那附近之塔雷加（Tárrega），真福雅各伯·博内特·纳达尔（Iacóbus Bonet Nadal），慈幼会司铎、殉道。忠实的门徒蒙基督的宝血所救赎（1936年）。

**21\\*.** 在意大利之帕多瓦（Patávium），真福克劳迪奥（理查德）·格兰佐托（Cláudius [Richárds] Granzotto），方济各小兄弟会修士。将修道生活之操练与雕刻艺术相结合，在短短数年间即在效法基督中达致成全（1947年）。

### 八月十五日校注

1. **第1条（圣母蒙召升天节）**：节日（*sollémnitas*），全年最高等级之庆典。教宗庇护十二世（Pius XII）于1950年以宗座宪章《Munificentissimus Deus》隆重定义圣母灵魂与肉身一同蒙召升天为当信之道理。OCR首字母缺失。

2. **第2条（圣塔尔西齐奥）**："宁愿被乱石砸死，也不愿将圣物弃与犬类"（*lapídibus usque ad mortem mactári máluit quam sacra pródere cánibus*）。"犬类"（*cánibus*）呼应玛七6（"不要把圣物丢给狗"，思高圣经）。圣塔尔西齐奥为辅祭与圣体送达者之主保。

3. **第5条（圣亚利比奥）**：亚利比奥（Alypius, c.360-c.430）为圣奥斯定之同乡（塔加斯特）、门徒、挚友。"先为门徒，继为皈依中的同伴，在牧灵中为同僚，在对抗异端中为战友，在天上为伙伴"（*discípulus, sócius, colléga, commílito, consors*）为殉道圣人录中罕见的五重递进式结构。

4. **第8条（圣亚钦多）**：亚钦多（Jacek/Hyacinth, c.1183-1257），波兰籍多明我会士，由圣多明我本人派往波兰传教。在东欧传播多明我会与基督信仰。

5. **第12\\*条（真福依西多禄·巴坎贾）**：巴坎贾（Isidore Bakanja, c.1887-1909），刚果青年，因佩戴圣衣（scapular）并向同事传福音，被比利时殖民地监工以皮鞭抽打至死。临终前宽恕迫害者。1994年教宗若望保禄二世列为真福。

6. **第14\\*条（巴尔巴斯特罗殉道者第四批）**：路易·马斯费雷尔及十九位同伴，共二十人。"前日在同一地点被杀害之弟兄"（*confrátres prídie huius diéi interféctos*）指八月十三日第14\\*条之第三批殉道者。四批合计：八月二日3人 + 八月十三日20人 + 八月十五日20人 = 至少43人，另有八月十二日之6人（第二批），共约49人。巴尔巴斯特罗克拉良会殉道者为西班牙内战殉道者中最大的单一修会群体。

---

## 八月十六日

**Die 16 augústi** · 九月初一前第十七日（*Décimo séptimo Kaléndas septémbris*）

月龄表（*Luna*）：

> a b c d e f g h i k l m n p q r s t u
> 22 23 24 25 26 27 28 29 30 1 2 3 4 5 6 7 8 9 10
> A B C D E F F G H M N P
> 11 12 13 14 15 16 16 17 18 19 20 21

**1\\.** 匈牙利国王圣斯德望（Stéphanus）之纪念。受洗重生后，从教宗西尔维斯特二世（Silvéster papa Secúndus）领受王国之冠冕。致力于在匈牙利人中传播基督信仰，在国内建立并组织教会，以财富与修院加以充实。为人公正爱好和平，善治子民。在匈牙利之塞凯什白堡（Alba Regális），于圣母升天节将灵魂迁入天国（1038年）。

**2\\.** 纪念圣阿尔萨齐奥（Arsácius）。在李锡尼皇帝治下宣认了基督信仰，离弃军旅后在尼科美狄亚（Nicomedía）度独修生活。最终预告了该城即将来临的灾祸后，在祈祷中将灵魂交还天主（年代不详）。

**3\\.** 在瑞士瓦莱之锡永（Sedúnum in Vallésia），圣德奥多洛（Theodórus），该城首任主教。效法圣盎博罗削之表率，捍卫天主教信仰以抵抗亚略派，并隆重崇敬阿高讷（Agaunénses）殉道者之遗骸（四世纪）。

**4\\*.** 在布列塔尼（Británnia Minor），圣阿尔马吉洛（Armagílus），隐修士（六世纪）。

**5\\*.** 在法国勒芒地区（pagus Cenomanénsis），圣弗兰巴尔多（Frambáldus），修士。兼度独修与团体修道生活（六世纪）。

**6\\*.** 在布列塔尼雷恩森林（silva Rhedonénsis），真福拉杜尔夫·德·菲斯泰（Radúlphus de Fustéia），司铎，圣苏尔比斯修院（monastérium Sancti Sulpítii）之创建者（约1129年）。

**7\\*.** 在拉齐奥之苏比亚科（Sublácum in Látio），真福老楞佐（Lauréntius），绰号"锁甲者"（*Loricátus*）。因偶然杀人，决意以最严厉的苦行与补赎赎罪，在山中洞穴度独修生活（1243年）。

**8\\.** 在伦巴第，圣罗科（Rochus）。生于朗格多克之蒙彼利埃（Mons Pessulánus in Langedócia），虔诚地四方朝圣，并在意大利各地照顾瘟疫患者，因此获得圣德之名声（约十四至十五世纪）。

**9\\*.** 在托斯卡纳之佛罗伦萨（Floréntia），真福安杰洛·奥斯定·马齐吉（Ángelus Augustínus Mazzinghi），加尔默罗会司铎（约1438年）。

**10\\*.** 在日本之京都（Kyóto），真福若望（圣玛尔大）（Ioánnes a Sancta Martha），方济各小兄弟会司铎、殉道。被押赴刑场途中仍向民众宣讲，高唱圣咏"万民，请赞美上主"（*Laudáte Dóminum, omnes gentes*）（1618年）。

**11\\*.** 同在日本之小仓（Kokúra），真福殉道者西满·清田卜斎（Simon Bokusai Kyota，应作 Kiyota Bokusai），传道员，与其妻玛达肋纳（Magdaléna），多默·源五郎（Thomas Gengoro）与其妻玛利亚（María），及二人之幼子雅各伯·文蔵（Iacóbus Bunzo）。因地方官越中守（Yetsundo）之命令，出于仇恨基督之名，同被倒钉十字架（1627年）。

**12\\*.** 在法国罗什福尔海岸外停泊之肮脏囚船上，真福若翰·巴蒂斯特·梅内斯特雷尔（Ioánnes Baptísta Ménestrel），司铎、殉道。法国大革命风暴期间因司铎身份被投入囚船，生蛆之伤口感染后完成殉道（1794年）。

**13\\.** 在中国河北省（*Hebei*）吴桥（*Wujiao*）附近之樊家庄（*Fanjiazhuang*），圣樊惠罗撒（Rosa Fan Hui），童贞、殉道。在义和团（*Yihetuan*）之迫害中遍体刺伤，尚存一息之际被投入河中（1900年）。

**14\\*.** 在西班牙马拉加之维莱斯-马拉加（Velez-Málaga），真福若瑟之伯多辣（安纳·若瑟法）·佩雷斯·弗洛里多（Petra a Sancto Iosépho [Anna Iosépha] Pérez Florido），童贞。殷切关怀被遗弃之老人，创立被弃者之母修女会（Congregátio Sorórum Matrum Derelictórum）（1906年）。

**15\\*.** 在西班牙巴伦西亚省阿利坎特地区（pagus Lucentínus）之德尼亚（Hemeroscópium），真福普拉齐多·加西亚·吉拉贝尔（Plácidus García Gilabert），方济各小兄弟会修士、殉道。在反信仰的迫害中为基督完成了卓越的搏斗（1936年）。

**16\\*.** 同在西班牙卡斯特利翁附近之贝尼卡西姆（Benicasim），真福亨利·加西亚·贝尔特兰（Henrícus García Beltrán），方济各嘉布遣会执事、殉道。以殉道成为基督胜利之分享者（1936年）。

**17\\*.** 同在西班牙巴伦西亚省之皮卡森特（Picassent），真福加俾额尔（若瑟·玛利亚）·桑基斯·蒙波（Gabriél [Iosephus María] Sanchís Mompó），方济各第三会苦难圣母嘉布遣会修士、殉道。因教会仇敌之暴力而迁归于主（1936年）。

### 八月十六日校注

1. **第1条（圣斯德望国王）**：纪念（*memória*）。斯德望一世（Stephen I of Hungary, c.975-1038），匈牙利首位基督徒国王。教宗西尔维斯特二世（Sylvester II, 999-1003在位）于1000年或1001年授予王冠（即"圣斯德望王冠"）。"于圣母升天节将灵魂迁入天国"（*die Assumptiónis ánima eius in cælum migrávit*）表明其忌日正在八月十五日，纪念延至八月十六日。忌日记录见八月十五日第7\\*条。OCR首字母缺失。

2. **第8条（圣罗科）**：罗科（Roch/Rocco, c.1348-c.1376/1379），蒙彼利埃人，中世纪最受欢迎之瘟疫主保圣人之一。其传记细节多属传说。

3. **第10\\*-11\\*条（日本殉道真福）**：京都之若望（圣玛尔大）为方济各会司铎，1618年殉道。小仓（今北九州市小仓区）之五位殉道者为两对夫妇及一名幼子，1627年被倒钉十字架。拉丁文作"Bokusai Kyota"，据205位日本殉教者名录应为 Kiyota Bokusai：清田（Kiyota）为姓，卜斎（Bokusai）为号。拉丁文颠倒了姓名顺序并误拼姓氏。源五郎（Gengoro）、文蔵（Bunzo）径用日文汉字。"万民，请赞美上主"（*Laudáte Dóminum, omnes gentes*）引自咏一一七（一一六）1。

4. **第13条（中华殉道圣人）**：樊惠（Fan Hui），河北省吴桥（Wujiao，拉丁文罗马化或为吴桥 Wuqiao 之变体）附近之樊家庄（Fanjiazhuang）殉道。樊家庄即樊姓聚居之村落。"遍体刺伤，尚存一息之际被投入河中"（*vulnéribus confóssa, in flumen adhuc spirans præcipitáta est*）为殉道圣人录中罕见之残酷描写。
`,It={class:`martyrology-page`},Lt={class:`martyrology-header`},Rt={class:`date-picker`},zt={class:`martyrology-mode-switch`,"aria-label":`诵念模式`},Bt={key:0,class:`prima-options`,"aria-label":`第一时辰经显示选项`},Vt={key:1,class:`inline-help`},Ht={key:2,class:`martyrology-source`},Ut={key:0,class:`martyrology-panel`},Wt={key:1,class:`martyrology-panel martyrology-warning`},Gt=y({__name:`index`,setup(e){let i=p(`current`),s=p(!0),{loading:c,error:m,apiSource:h,selectedDateValue:g,targetKey:y,targetChineseDate:w,fixedDay:T,movableFeast:E,omitted:D,readings:O,prayers:k,primaResolution:A,loadForTargetDate:j,syncSelectedDate:M}=Ue(Ft,i);return l(()=>{j()}),v(i,()=>{j()}),(e,l)=>(t(),o(`main`,It,[d(`header`,Lt,[l[9]||=d(`p`,{class:`martyrology-eyebrow`},` Martyrologium Romanum `,-1),l[10]||=d(`h1`,null,`每日殉道圣人录`,-1),d(`p`,null,`宣报日期: `+b(_(w)),1),l[11]||=d(`p`,{class:`inline-help`},` 圣人或真福的每日赞辞，按惯例常在前一日诵读；因此本页所显示的宣报日期为所选诵读日期的次日。 `,-1),d(`label`,Rt,[l[5]||=d(`span`,null,`诵读日期`,-1),S(d(`input`,{"onUpdate:modelValue":l[0]||=e=>a(g)?g.value=e:null,type:`date`,onChange:l[1]||=(...e)=>_(M)&&_(M)(...e)},null,544),[[n,_(g)]])]),d(`section`,zt,[d(`label`,null,[S(d(`input`,{"onUpdate:modelValue":l[2]||=e=>i.value=e,type:`radio`,value:`current`},null,512),[[x,i.value]]),l[6]||=u(` 新礼圣人录 `,-1)]),d(`label`,null,[S(d(`input`,{"onUpdate:modelValue":l[3]||=e=>i.value=e,type:`radio`,value:`prima1962`},null,512),[[x,i.value]]),l[7]||=u(` 第一时辰经 `,-1)])]),i.value===`prima1962`?(t(),o(`section`,Bt,[d(`label`,null,[S(d(`input`,{"onUpdate:modelValue":l[4]||=e=>s.value=e,type:`checkbox`},null,512),[[C,s.value]]),l[8]||=u(` 拉丁中文对照`,-1)])])):r(`v-if`,!0),i.value===`current`?(t(),o(`p`,Vt,` 若在时辰礼仪中诵读，可于晨祷结束祷词后，或任一日间小时辰中诵读；若不在时辰礼仪中诵读，可在团体聚集后，由读经员直接从日期宣报开始。 `)):r(`v-if`,!0),i.value===`current`?(t(),o(`p`,Ht,` 礼仪日历来源: `+b(_(h)===`cpbjr-api`?`Catholic Readings API`:_(h)===`calapi`?`Church Calendar API`:`本地 Computus 降级算法`),1)):r(`v-if`,!0)]),_(c)?(t(),o(`section`,Ut,` 正在加载…… `)):_(m)?(t(),o(`section`,Wt,b(_(m)),1)):i.value===`current`?(t(),f(st,{key:2,"fixed-day":_(T),"movable-feast":_(E),omitted:_(D),"target-key":_(y),readings:_(O),prayers:_(k)},null,8,[`fixed-day`,`movable-feast`,`omitted`,`target-key`,`readings`,`prayers`])):(t(),f(Pt,{key:3,resolution:_(A),"fixed-day":_(T),"movable-feast":_(E),omitted:_(D),"target-key":_(y),bilingual:s.value},null,8,[`resolution`,`fixed-day`,`movable-feast`,`omitted`,`target-key`,`bilingual`]))]))}});export{Gt as default};