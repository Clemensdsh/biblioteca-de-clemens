import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import * as OpenCC from 'opencc-js'

const root = process.cwd()
const upstream = process.env.DIVINUM_OFFICIUM_ROOT || 'Q:/GithubSRC/divinum-officium'
const latinRoot = join(upstream, 'web/www/horas/Latin')
const outDir = join(root, 'public/data/prima1962')
const extractedAt = new Date().toISOString().slice(0, 10)
const traditionalToSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' })

const sourceFiles = {
  primaSpecial: 'web/www/horas/Latin/Psalterium/Special/Prima Special.txt',
  prayers: 'web/www/horas/Latin/Psalterium/Common/Prayers.txt',
  rubricae: 'web/www/horas/Latin/Psalterium/Common/Rubricae.txt',
  psalmiMinor: 'web/www/horas/Latin/Psalterium/Psalmi/Psalmi minor.txt',
  sigaoVulgatePsalms: '思高圣咏集_武加大编号_逐节纯文本.txt',
}

const psalmSpecs = [
  '117',
  '118(1-16)',
  '118(17-32)',
  '23',
  "18(2-'7b')",
  "18(8-'15b')",
  '24(1-7)',
  '24(8-14)',
  '24(15-22)',
  '25',
  '51',
  '52',
  '22',
  '71(2-8)',
  '71(9-19)',
  '21(2-12)',
  '21(13-23)',
  '21(24-32)',
  '93(1-11)',
  '93(12-23)',
  '107',
]

const chinese = {
  'opening.deus-in-adiutorium.verse': '天主，求你快来拯救我；',
  'opening.deus-in-adiutorium.response': '上主，求你速来扶助我。',
  'common.gloria-patri': '愿光荣归于父、及子、及圣神。\n起初如何，今日亦然，直到永远。阿们。',
  'common.alleluia': '阿肋路亚。',
  'common.laus-tibi': '上主，永恒光荣的君王，赞美归于你。',
  'hymn.iam-lucis.stanza-1': '晨光已升起时，虔诚向主祈求\n在此白日行事，护我免受邪害',
  'hymn.iam-lucis.stanza-2': '求主节制我舌，勿使争讼声起\n慈爱遮护双目，莫让虚妄入心',
  'hymn.iam-lucis.stanza-3': '使我内心洁净，愚妄迷情远离\n节制饮食诸欲，克胜肉身骄傲',
  'hymn.iam-lucis.stanza-4': '白日终将消逝，黑夜复又归来\n因克己而自制，向主歌唱光荣',
  'hymn.iam-lucis.doxology': '愿光荣归圣父，及其唯一圣子\n并归护慰之神，自今直到永远\n阿们',
  'capitulum.regi': '愿尊崇和光荣归于万世的君王，不死不灭、无形的惟一天主，于无穷世之世！阿们。',
  'common.deo-gratias': '感谢天主。',
  'responsory.christe': '基督，永生天主之子，求你垂怜我们。',
  'responsory.qui-sedes': '坐在圣父之右者。',
  'responsory.miserere': '垂怜我们。',
  'responsory.ordinary.1': '基督，永生天主之子，求你垂怜我们。',
  'responsory.ordinary.2': '坐在圣父之右者。',
  'responsory.ordinary.3': '垂怜我们。',
  'responsory.ordinary.4': '愿光荣归于父、及子、及圣神。',
  'responsory.ordinary.5': '基督，永生天主之子，求你垂怜我们。',
  'responsory.christe.repeat': '基督，永生天主之子，求你垂怜我们。',
  'responsory.paschal.1': '基督，永生天主之子，求你垂怜我们，阿肋路亚，阿肋路亚。',
  'responsory.qui-surrexisti': '从死者中复活者，阿肋路亚。',
  'responsory.paschal.2': '垂怜我们，阿肋路亚，阿肋路亚。',
  'responsory.paschal.gloria': '愿光荣归于父、及子、及圣神。',
  'responsory.paschal.3': '基督，永生天主之子，求你垂怜我们，阿肋路亚，阿肋路亚。',
  'responsory.proper.ordinary': '坐在圣父之右者。',
  'responsory.proper.adv': '即将来临于世者。',
  'responsory.proper.nat': '由童贞玛利亚所生者。',
  'responsory.proper.epi': '今日显现者。',
  'responsory.proper.pasch': '从死者中复活者。',
  'responsory.proper.asc': '升于星辰之上者。',
  'responsory.proper.pent': '坐在圣父之右者。',
  'responsory.proper.corp': '由童贞玛利亚所生者。',
  'responsory.proper.heart': '从圣心倾注恩宠者。',
  'responsory.exsurge': '基督，求你兴起，援助我们。',
  'responsory.libera': '为了你的圣名，求你解救我们。',
  'collect.domine-deus': '上主、全能的天主，你使我们得以迎来这一天的开始；求你今天以你的大能护佑我们，使我们在这一天不陷于任何罪恶；使我们的言语常以履行你的正义为依归，并使我们的思想和行为都蒙你引导。以上所求，是靠我们的主基督。阿们。',
  'martyrology.pretiosa.verse': '在上主台前何其珍贵的，',
  'martyrology.pretiosa.response': '是祂圣徒们的死亡。',
  'martyrology.sancta-maria': '愿圣母玛利亚和诸圣在上主台前为我们转求，使我们堪当蒙他助佑和拯救；他永生永王，世世无穷。阿们。',
  'chapter.deus-in-adiutorium.1': '天主，求你快来拯救我。',
  'chapter.deus-in-adiutorium.1.response': '上主，求你速来扶助我。',
  'chapter.deus-in-adiutorium.2': '天主，求你快来拯救我。',
  'chapter.deus-in-adiutorium.2.response': '上主，求你速来扶助我。',
  'chapter.deus-in-adiutorium.3': '天主，求你快来拯救我。',
  'chapter.deus-in-adiutorium.3.response': '上主，求你速来扶助我。',
  'chapter.gloria-patri': '愿光荣归于父、及子、及圣神。',
  'chapter.sicut-erat': '起初如何，今日亦然，直到永远。阿们。阿肋路亚。',
  'chapter.kyrie': '上主，求你垂怜。基督，求你垂怜。上主，求你垂怜。',
  'chapter.pater-secret': '我们的天父，愿你的名受显扬，愿你的国来临，愿你的旨意奉行在人间，如同在天上。求你今天赏给我们日用的食粮；求你宽恕我们的罪过，如同我们宽恕别人一样。',
  'chapter.et-ne-nos': '不要让我们陷于诱惑；',
  'chapter.sed-libera': '但救我们免于凶恶。',
  'chapter.respice': '上主，求你垂顾你的仆人和你的化工，并引导他们的子孙。',
  'chapter.respice.response': '愿上主、我们的天主，以他的光辉照临我们；求你促使我们双手所作的工作顺利成功，求你促使我们双手所作的工作顺利成功。',
  'chapter.dirigere': '上主天主、天地的君王、世界的救主，求你垂允，今天引导并圣化、统御并治理我们的心灵和身体、感官、言语和行为，使这一切遵循你的法律，实行你的诫命；赖你的助佑，使我们今世及永世堪当得救，获享自由。你永生永王，世世无穷。阿们。',
  'lectio.iube-domine': '上主，求你降福。',
  'lectio.iube-domne': '请神父祝福。',
  'lectio.tu-autem': '上主，求你垂怜我们。',
  'lectio.per-annum': '愿主指引我们的心神和身体，使我们爱天主，并学习基督的坚忍。',
  'lectio.adv': '上主，求你怜悯我们，因为我们仰望你；求你每日清晨作我们的臂膊，在患难时期作我们的救援。',
  'lectio.nat': '诸天必要灭亡，你却永存；万物都要像衣服一样陈旧；你要把它们像外衣一样更换，它们就要改变；可是你仍是同一位，你的岁月永无穷尽。',
  'lectio.epi': '众人都要由舍巴前来，携带黄金和乳香，传扬对上主的赞颂。',
  'lectio.asc': '加里肋亚人，你们为什么站着望天？这位离开你们、被接到天上去的耶稣，你们看见他怎样升了天，也要怎样降来。',
  'lectio.quad': '趁上主可找到的时候寻找他；趁他临近的时候呼求他。',
  'lectio.quad5': '我没有转面躲避斥责我和唾污我的人。上主天主是我的助佑，因此我不至蒙羞。',
  'lectio.pasch': '你们既然与基督一同复活，就该寻求天上的事，那里有基督坐在天主右边；你们该思念天上的事，不该思念地上的事。',
  'lectio.pent': '犹太人和归依犹太教的人、克里特人和阿剌伯人，我们都听见他们用我们的语言讲论天主的奇事。',
  'ending.adjutorium': '上主的圣名，是我们的助佑。',
  'ending.qui-fecit': '因他创造了天地。',
  'ending.benedicite': '请［降福我们］。',
  'ending.deus': '［愿］天主［降福我们］。',
  'ending.dominus-nos': '愿上主降福我们，保护我们免于一切凶恶，引领我们到达永生。阿们。',
  'ending.fidelium': '愿诸信者灵魂，赖天主仁慈，息止安所。',
  'common.amen': '阿们。',
}

const antiphonChinese = {
  Dominica: '阿肋路亚，请赞颂上主，因为他的慈爱永远常存，阿肋路亚，阿肋路亚。',
  'Feria II': '手洁心清的人，必登上上主的圣山。',
  'Feria III': '我的天主，我信赖你，决不蒙羞。',
  'Feria IV': '上主，你的仁慈常在我眼前；我悦乐于你的真理。',
  'Feria V': '上主使我安卧在青草地上。',
  'Feria VI': '上主，求你不要远离我；因为灾难临近，又无人援助。',
  Sabbato: '上主，审判大地者，求你奋起；求你给骄傲人应得的报应。',
}

const antiphonTranslationByLatin = {
  ...Object.fromEntries(Object.values(antiphonChinese).map((value, index) => [index, value])),
  'Allelúja, * confitémini Dómino, quóniam in sǽculum misericórdia eius, allelúja, allelúja.': antiphonChinese.Dominica,
  'Ínnocens mánibus * et mundo corde ascéndet in montem Dómini.': antiphonChinese['Feria II'],
  'Deus meus * in te confído non erubéscam.': antiphonChinese['Feria III'],
  'Misericórdia tua, * Dómine, ante óculos meos: et complácui in veritáte tua.': antiphonChinese['Feria IV'],
  'In loco páscuæ * ibi Dóminus me collocávit.': antiphonChinese['Feria V'],
  'Ne discédas a me, * Dómine: quóniam tribulátio próxima est: quóniam non est qui ádiuvet.': antiphonChinese['Feria VI'],
  'Exaltáre, Dómine, * qui iúdicas terram: redde retributiónem supérbis.': antiphonChinese.Sabbato,
  'In illa die * stillábunt montes dulcédinem, et colles fluent lac et mel, allelúja.': '在那一天，山岳要滴下甘饴，丘陵要流出奶与蜜，阿肋路亚。',
  'Iucundáre, * fília Sion, et exsúlta satis, fília Ierúsalem, allelúja.': '熙雍女子，你要欢乐；耶路撒冷女子，你要踊跃欢欣，阿肋路亚。',
  'Ecce Dóminus véniet, * et omnes Sancti eius cum eo: et erit in die illa lux magna, allelúja.': '看，上主要来临，众圣也同他一起；那一日必有大光，阿肋路亚。',
  'Omnes sitiéntes, * veníte ad aquas: quǽrite Dóminum, dum inveníri potest, allelúja.': '凡口渴的，请到水边来；趁上主可寻时寻找他，阿肋路亚。',
  'Ecce véniet * Prophéta magnus, et ipse renovábit Ierúsalem, allelúja.': '看，一位伟大的先知要来，他要更新耶路撒冷，阿肋路亚。',
  'Jucundáre, * fília Sion, et exsúlta satis, fília Jerúsalem, allelúja.': '熙雍女子，你要欢乐；耶路撒冷女子，你要踊跃欢欣，阿肋路亚。',
  'Omnes sitiéntes, * veníte ad aquas: quærite Dóminum, dum inveníri potest, allelúja.': '凡口渴的，请到水边来；趁上主可寻时寻找他，阿肋路亚。',
  'Ecce véniet * Prophéta magnus, et ipse renovábit Jerúsalem, allelúja.': '看，一位伟大的先知要来，他要更新耶路撒冷，阿肋路亚。',
  'Ecce in núbibus cæli * Dóminus véniet cum potestáte magna, allelúja.': '看，上主要乘天上的云彩而来，带着大能，阿肋路亚。',
  'Urbs fortitúdinis * nostræ Sion, Salvátor ponétur in ea murus et antemurále: aperíte portas, quia nobíscum Deus, allelúja.': '熙雍是我们的坚城；救主将在其中作城墙和外郭。请打开城门，因为天主与我们同在，阿肋路亚。',
  'Ecce apparébit * Dóminus, et non mentiétur: si moram fécerit, exspécta eum, quia véniet, et non tardábit, allelúja.': '看，上主要显现，决不虚言；若他迟延，仍要等待，因为他必要来，决不迟延，阿肋路亚。',
  'Montes et colles * cantábunt coram Deo laudem, et ómnia ligna silvárum plaudent mánibus: quóniam véniet Dominátor Dóminus in regnum ætérnum, allelúja, allelúja.': '山岳丘陵要在天主面前歌唱赞美，林中树木都要鼓掌；因为主宰上主要进入永恒的国度，阿肋路亚，阿肋路亚。',
  'Ecce Dóminus * noster cum virtúte véniet, et illuminábit óculos servórum suórum, allelúja.': '看，我们的上主要带着德能来临，照明他仆人的眼目，阿肋路亚。',
  'Véniet Dóminus, * et non tardábit, et illuminábit abscóndita tenebrárum, et manifestábit se ad omnes gentes, allelúja.': '上主要来临，决不迟延；他要照明黑暗中的隐秘，向万民显示自己，阿肋路亚。',
  'Ierúsalem, gaude * gáudio magno, quia véniet tibi Salvátor, allelúja.': '耶路撒冷，你要大大欢乐，因为你的救主要来到你这里，阿肋路亚。',
  'Dabo in Sion * salútem, et in Ierúsalem glóriam meam, allelúja.': '我要在熙雍赐下救恩，在耶路撒冷彰显我的光荣，阿肋路亚。',
  'Jerúsalem, gaude * gáudio magno, quia véniet tibi Salvátor, allelúja.': '耶路撒冷，你要大大欢乐，因为你的救主要来到你这里，阿肋路亚。',
  'Dabo in Sion * salútem, et in Jerúsalem glóriam meam, allelúja.': '我要在熙雍赐下救恩，在耶路撒冷彰显我的光荣，阿肋路亚。',
  'Montes et omnes colles * humiliabúntur: et erunt prava in dirécta, et áspera in vias planas: veni, Dómine, et noli tardáre, allelúja.': '山岳和一切丘陵都要降低，弯曲的要变为正直，崎岖的要成为平路；上主，求你来，不要迟延，阿肋路亚。',
  'Iuste et pie * vivámus, exspectántes beátam spem, et advéntum Dómini.': '愿我们正义虔敬地生活，期待所盼望的真福和上主的来临。',
  'Juste et pie * vivámus, exspectántes beátam spem, et advéntum Dómini.': '愿我们正义虔敬地生活，期待所盼望的真福和上主的来临。',
  'Cánite tuba * in Sion, quia prope est dies Dómini: ecce véniet ad salvándum nos, allelúja, allelúja.': '请在熙雍吹响号角，因为上主的日子临近；看，他要来拯救我们，阿肋路亚，阿肋路亚。',
  'Ecce véniet * desiderátus cunctis Géntibus: et replébitur glória domus Dómini, allelúja.': '看，万民所期待的要来临；上主殿宇将充满光荣，阿肋路亚。',
  'Erunt prava * in dirécta, et áspera in vias planas: veni, Dómine, et noli tardáre, allelúja.': '弯曲的要变为正直，崎岖的要成为平路；上主，求你来，不要迟延，阿肋路亚。',
  'Dóminus véniet, * occúrrite illi, dicéntes: Magnum princípium, et regni eius non erit finis: Deus, Fortis, Dominátor, Princeps pacis, allelúja, allelúja.': '上主要来临，请前去迎接他，说：他的统治伟大无比，他的王国没有终结；他是天主、大能者、主宰、和平之王，阿肋路亚，阿肋路亚。',
  'Omnípotens Sermo tuus, * Dómine, a regálibus sédibus véniet, allelúja.': '上主，你全能的圣言要从王座降来，阿肋路亚。',
  'Ecce, véniet * Dóminus princeps regum terræ: beáti, qui paráti sunt occúrrere illi.': '看，上主要来，他是地上列王的元首；准备好迎接他的人是有福的。',
  'Cum vénerit * Fílius hóminis, putas, invéniet fidem super terram?': '当人子来临时，你想他在世上还能找到信德吗？',
  'Ecce, iam venit * plenitúdo témporis, in quo misit Deus Fílium suum in terras.': '看，时期已满，天主在这时期派遣自己的儿子来到世上。',
  'Hauriétis aquas * in gáudio de fóntibus Salvatóris.': '你们要欢欣地从救主的泉源汲水。',
  'Egrediétur * Dóminus de loco sancto suo: véniet, ut salvet pópulum suum.': '上主要从他的圣所出来；他要来拯救自己的子民。',
  'Roráte, cæli, désuper, * et nubes pluant iustum: aperiátur terra, et gérminet Salvatórem.': '诸天，请由上降下甘露；云彩，请降下义者；愿大地开启，萌生救主。',
  'Roráte, cæli, désuper, * et nubes pluant justum: aperiátur terra, et gérminet Salvatórem.': '诸天，请由上降下甘露；云彩，请降下义者；愿大地开启，萌生救主。',
  'Emítte Agnum, Dómine, * Dominatórem terræ, de Petra desérti, ad montem fíliæ Sion.': '上主，请从旷野磐石派遣羔羊，作大地的主宰，到熙雍女子的山上。',
  'Ut cognoscámus, Dómine, * in terra viam tuam, in ómnibus géntibus salutáre tuum.': '上主，愿我们在地上认识你的道路，在万民中认识你的救恩。',
  'Da mercédem, Dómine, * sustinéntibus te, ut prophétæ tui fidéles inveniántur.': '上主，求你赐报酬给期待你的人，使你的先知显为忠信。',
  'Lex per Móysen data est; * grátia et véritas per Iesum Christum facta est.': '法律是藉梅瑟赐下的；恩宠和真理由耶稣基督而来。',
  'Prophétæ prædicavérunt * nasci Salvatórem de Vírgine María.': '先知们预言救主要由童贞玛利亚诞生。',
  'Spíritus * Dómini super me, evangelizáre paupéribus misit me.': '上主的神临于我身上，派遣我向贫苦者传报喜讯。',
  'Propter Sion * non tacébo, donec egrediátur ut splendor iustus eius.': '为了熙雍，我决不缄默，直到她的正义如光辉显现。',
  'Propter Sion * non tacébo, donec egrediátur ut splendor justus eius.': '为了熙雍，我决不缄默，直到她的正义如光辉显现。',
  'Ecce, véniet Dóminus, * ut sédeat cum princípibus, et sólium glóriæ ténuit.': '看，上主要来，与首领同坐，并执掌光荣的宝座。',
  'Annuntiáte * pópulis, et dícite: Ecce, Deus Salvátor noster véniet.': '请向万民宣告说：看，我们的救主天主要来临。',
  'De Sion * véniet Dóminus omnípotens, ut salvum fáciat pópulum suum.': '全能的上主要由熙雍而来，拯救自己的子民。',
  'Convértere, Dómine, * aliquántulum, et ne tardes veníre ad servos tuos.': '上主，求你稍稍回心转意，不要迟延来到你的仆人这里。',
  'De Sion * véniet, qui regnatúrus est Dóminus, Emmánuel magnum nomen eius.': '那将要为王的上主要由熙雍而来，他伟大的名号是厄玛奴耳。',
  'Ecce Deus meus, * et honorábo eum: Deus patris mei, et exaltábo eum.': '看，这是我的天主，我要尊崇他；这是我父亲的天主，我要颂扬他。',
  'Dóminus * légifer noster, Dóminus Rex noster, ipse véniet, et salvábit nos.': '上主是我们的立法者，上主是我们的君王；他要来拯救我们。',
  'Constántes estóte, * vidébitis auxílium Dómini super vos.': '你们要坚定不移，必要看见上主在你们身上施行援助。',
  'Ad te, Dómine, * levávi ánimam meam: veni, et éripe me, Dómine, ad te confúgi.': '上主，我向你举起我的心灵；上主，求你来解救我，我投奔于你。',
  'Veni, Dómine, * et noli tardáre: reláxa facínora plebi tuæ Israël.': '上主，求你来，不要迟延；求你赦免你以色列子民的罪行。',
  'Deus a Líbano véniet, * et splendor eius sicut lumen erit.': '天主要由黎巴嫩而来，他的光辉将如光明。',
  'Ego autem * ad Dóminum aspíciam, et exspectábo Deum, Salvatórem meum.': '至于我，我要仰望上主，期待天主、我的救主。',
  'Intuémini, * quam sit gloriósus iste, qui ingréditur ad salvándos pópulos.': '请注视：这位前来拯救万民者何等光荣。',
  'Multiplicábitur * eius impérium, et pacis non erit finis.': '他的权柄必要广大无边，和平永无终结。',
  'Ego Dóminus * prope feci iustítiam meam, non elongábitur, et salus mea non morábitur.': '我是上主；我使我的正义临近，决不远离，我的救恩决不迟延。',
  'Ego Dóminus * prope feci justítiam meam, non elongábitur, et salus mea non morábitur.': '我是上主；我使我的正义临近，决不远离，我的救恩决不迟延。',
  'Exspectétur, * sicut plúvia, elóquium Dómini: et descéndat, sicut ros, super nos Deus noster.': '愿人期待上主的言语，如期待时雨；愿我们的天主如甘露降临于我们。',
  'Parátus esto, * Israël, in occúrsum Dómini, quóniam venit.': '以色列，请准备迎接上主，因为他要来了。',
  'Vivo ego * dicit Dóminus: nolo mortem peccatóris, sed ut magis convertátur et vivat.': '我指着我的生命起誓，上主说：我不愿罪人死亡，却愿他回头而生活。',
  'Advenérunt nobis * dies pœniténtiæ ad rediménda peccáta, ad salvándas ánimas.': '补赎的日子已经来到，为赎罪过，为拯救灵魂。',
  'Commendémus nosmetípsos * in multa patiéntia, in ieiúniis multis, per arma iustítiæ.': '让我们以极大的忍耐、多次禁食，并以正义的武器，荐举我们自己。',
  'Per arma iustítiæ * virtútis Dei commendémus nosmetípsos in multa patiéntia.': '让我们藉天主德能的正义武器，以极大的忍耐荐举我们自己。',
  'Commendémus nosmetípsos * in multa patiéntia, in jejúniis multis, per arma justítiæ.': '让我们以极大的忍耐、多次禁食，并以正义的武器，荐举我们自己。',
  'Per arma justítiæ * virtútis Dei commendémus nosmetípsos in multa patiéntia.': '让我们藉天主德能的正义武器，以极大的忍耐荐举我们自己。',
  'Líbera me, Dómine, * et pone me iuxta te: et cuiúsvis manus pugnet contra me.': '上主，求你解救我，使我靠近你；任谁的手攻击我也无妨。',
  'Líbera me, Dómine, * et pone me juxta te: et cujúsvis manus pugnet contra me.': '上主，求你解救我，使我靠近你；任谁的手攻击我也无妨。',
  'Iudicásti, Dómine, * causam ánimæ meæ, defénsor vitæ meæ, Dómine, Deus meus.': '上主，我的天主，你是我生命的护卫；你已审断我灵魂的案件。',
  'Pópule meus, * quid feci tibi? aut quid moléstus fui? Respónde mihi.': '我的子民，我对你做了什么？我在什么事上烦扰了你？请回答我。',
  'Numquid rédditur * pro bono malum, quia fodérunt fóveam ánimæ meæ.': '难道要以恶报善吗？他们竟为我的灵魂挖掘陷阱。',
  'Allelúja, * allelúja, allelúja.': '阿肋路亚，阿肋路亚，阿肋路亚。',
  'Iesus autem * cum ieiunásset quadragínta diébus et quadragínta nóctibus, póstea esúriit.': '耶稣禁食了四十天四十夜以后，就饿了。',
  'Conventióne autem * facta cum operáriis ex denário diúrno, misit eos in víneam suam.': '他同工人议定一天一个德纳，就派他们到自己的葡萄园里去。',
  'Semen cécidit * in terram bonam, et áttulit fructum in patiéntia.': '种子落在好地里，并以坚忍结出果实。',
  'Iter faciénte * Iesu, dum appropinquáret Iericho, cæcus clamábat ad eum, ut lumen recípere mererétur.': '耶稣行路将近耶里哥时，一个瞎子向他呼喊，为能获得光明。',
  'Iter faciénte * Iesu, dum appropinquáret Jericho, cæcus clamábat ad eum, ut lumen recípere mererétur.': '耶稣行路将近耶里哥时，一个瞎子向他呼喊，为能获得光明。',
  'Iesus autem * cum jejunásset quadragínta diébus et quadragínta nóctibus, póstea esúriit.': '耶稣禁食了四十天四十夜以后，就饿了。',
  'Dómine, * bonum est nos hic esse: si vis, faciámus hic tria tabernácula; tibi unum, Móysi unum, et Elíæ unum.': '上主，我们在这里真好；你若愿意，我们就在这里搭三个帐棚：一个为你，一个为梅瑟，一个为厄里亚。',
  'Et cum ejecísset Iesus * dæmónium, locútus est mutus, et admirátæ sunt turbæ.': '耶稣驱逐魔鬼以后，哑巴便说了话，群众都惊奇不已。',
  'Accépit ergo * Iesus panes, et, cum grátias egísset, distríbuit discumbéntibus.': '于是耶稣拿起饼，祝谢后，分给坐席的人。',
  'Ego dæmónium non hábeo, * sed honorífico Patrem meum, dicit Dóminus.': '上主说：我没有魔鬼；我尊敬我的父。',
  'Reminíscere * miseratiónum tuárum, Dómine, et misericórdiæ tuæ, quæ a sǽculo sunt.': '上主，求你记起你自亘古以来的怜悯和仁慈。',
  'Et respíciens * Iesus discípulos suos, dixit: Beáti páuperes, quia vestrum est regnum Dei.': '耶稣举目看着自己的门徒说：贫穷的人是有福的，因为天主的国是你们的。',
  'Non enim misit * Deus Fílium suum in mundum, ut iúdicet mundum, sed ut salvétur mundus per ipsum.': '天主派遣自己的儿子到世界上来，不是为审判世界，而是为使世界藉着他得救。',
  'Ego dæmónium * non hábeo: sed honorífico Patrem meum, et vos inhonorástis me.': '我没有魔鬼；我尊敬我的父，你们却侮辱我。',
  'Púeri Hebræórum * tolléntes ramos olivárum, obviavérunt Dómino clamántes et dicéntes: Hosánna in excélsis.': '希伯来儿童拿着橄榄枝，前去迎接上主，呼喊说：贺三纳于至高之天。',
  'Ecce pósitus est hic in signum cui contradicétur: et tuam ipsíus ánimam pertransíbit gládius, ut reveléntur ex multis córdibus cogitatiónes.': '看，这孩子被立为反对的记号；至于你，要有一把利剑刺透你的心灵，为叫许多人心中的思念显露出来。',
}

const quicumqueChinese = [
  '不拘谁愿意得救，必须首先坚持公教会的信仰；',
  '除非谁完整地及不错误地坚信此信仰，无疑地永远丧亡。',
  '公教的信仰如下：我们在三位内恭敬一个天主，及在一体内恭敬三位；',
  '三个位格既不混淆，在实体上也不分离；',
  '父是一个位格，子是另一个位格，圣神是另一个位格；',
  '但父、子及圣神是一个天主，同等的光荣，永远同存的尊威。',
  '父如何，子就如何，圣神也如何。',
  '父是非受造的，子是非受造的，圣神是非受造的。',
  '父是无限的，子是无限的，圣神是无限的。',
  '父是永远的，子是永远的，圣神是永远的。',
  '但不是三个永远者，而是一个永远者。',
  '正如不是三个非受造者，也不是三个无限者，而是一个非受造者及一个无限者。',
  '相似地，父是全能的，子是全能的，圣神是全能的；',
  '但不是三个全能者，而是一个全能者。',
  '如此，父是天主，子是天主，圣神是天主；',
  '但不是三个天主，而是一个天主。',
  '如此，父是主，子是主，圣神是主；',
  '但不是三个主，而是一个主。',
  '因为，正如基督徒真理命令我们信，从独特性而言，每一位是天主及主；如此，公教会禁止我们说有三个天主，或三个主。',
  '父不是由别的存有物造成的、受造的、或被生的；',
  '子只是由父而存在的，不是由别的存有物造成的或受造的，而是受生的；',
  '圣神不是由别的存有物造成的或受造的，也不是受生的，而是由父及子而发的。',
  '所以，一个父，不是三个父；一个子，不是三个子；一个圣神，不是三个圣神。',
  '而且，在这圣三内，无先无后，无大无小；反而三位彼此永远同存及同等。',
  '如此，在一切中，一如上述的，应当尊敬在三位中的一体及在一体中的三位。',
  '所以谁愿意得救，应该认同此圣三的教义。',
  '不过，为了永远的救恩，一定也要忠信地信我们的主耶稣基督的降生。',
  '真正的信仰要我们信及承认：我们的主耶稣基督、天主子，是天主，同样又是人；',
  '祂是天主，在万世之前由父的实体所生；祂又是人，在时间内由母亲的实体所生；',
  '祂是完全的天主、完全的人，藉着理性的灵魂及人的血肉而存在；',
  '按天主性而言，祂与父同等；按人性而言，祂比父小。',
  '虽然祂是天主又是人，但不是两个，而是一个基督；',
  '不过，祂是一个，不是因为祂的天主性变成血肉，而是因为祂将人性取到天主内；',
  '祂是完全的一个，不是因为实体混淆，而是因为位格的统一。',
  '正如理性的灵魂与血肉是一个人，如此，天主与人是一个基督。',
  '祂为了我们的救恩受难，下降冥府，第三日从死者中复活；',
  '祂升了天，坐在全能天主父的右边，将从那里来临审判生者及死者。',
  '在祂来临时，众人该在自己的身体内复活，且对自己的行为要交账；',
  '那些行过善的人将入永生，那些行过恶的人则将入永火。',
  '这是公教会的信仰：除非人忠信地并坚强地相信，否则将不能得救。',
]

const temporaryIds = new Set(Object.keys(chinese).filter(id => ![
  'common.gloria-patri',
  'common.alleluia',
  'common.deo-gratias',
  'martyrology.pretiosa.verse',
  'martyrology.pretiosa.response',
  'common.amen',
].includes(id)))

function read(rel) {
  return readFileSync(join(upstream, rel), 'utf8')
}

function sections(text) {
  const map = {}
  let current = ''
  let enabled = true
  for (const raw of text.split(/\r?\n/)) {
    const match = raw.match(/^\[([^\]]+)\]/)
    if (match) {
      current = match[1]
      enabled = !(current in map)
      if (enabled)
        map[current] = []
      continue
    }
    if (current && enabled)
      map[current].push(raw)
  }
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, value.join('\n').trim()]))
}

function textLines(section) {
  return section
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('!') && !line.startsWith('(sed rubrica') && !line.startsWith('_'))
    .map(line => line
      .replace(/^R\.br\.\s*/i, '℟. ')
      .replace(/^R\.\s*/i, '℟. ')
      .replace(/^V\.\s*/i, '℣. ')
      .replace(/&Gloria1/g, '℣. Glória Patri, et Fílio, * et Spirítui Sancto.'))
}

function primaResponsoryOrdinary() {
  return [
    block('responsory.ordinary.1', 'response', '℟. Christe, Fili Dei vivi, * miserére nobis.'),
    block('responsory.ordinary.2', 'verse', '℣. Qui sedes ad déxteram Patris.'),
    block('responsory.ordinary.3', 'response', '℟. Miserére nobis.', 'temporary-translation'),
    block('responsory.ordinary.4', 'verse', '℣. Glória Patri, et Fílio, * et Spirítui Sancto.'),
    block('responsory.ordinary.5', 'response', '℟. Christe, Fili Dei vivi, * miserére nobis.'),
  ]
}

function primaResponsoryProperVerses(prima) {
  const sectionsByKey = {
    ordinary: undefined,
    adv: 'Responsory Adv',
    nat: 'Responsory Nat',
    epi: 'Responsory Epi',
    pasch: 'Responsory Pasch',
    asc: 'Responsory Asc',
    pent: 'Responsory Pent',
    corp: 'Responsory Corp',
    heart: 'Responsory Heart',
  }
  const defaults = {
    ordinary: 'Qui sedes ad déxteram Patris.',
    adv: 'Qui ventúrus es in mundum.',
    nat: 'Qui natus es de María Vírgine.',
    epi: 'Qui apparuísti hódie.',
    pasch: 'Qui surrexísti a mórtuis.',
    asc: 'Qui scandis super sídera.',
    pent: 'Qui sedes ad déxteram Patris.',
    corp: 'Qui natus est de María Vírgine.',
    heart: 'Qui corde fundis grátiam.',
  }

  return Object.fromEntries(Object.entries(sectionsByKey).map(([key, section]) => {
    const latin = section ? (textLines(prima[section] || '')[0] || defaults[key]) : defaults[key]
    return [key, block(`responsory.proper.${key}`, 'verse', `℣. ${latin}`)]
  }))
}

function parseQuicumque() {
  const file = readFileSync(join(latinRoot, 'Psalterium/Psalmorum/Psalm234.txt'), 'utf8')
  return file
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('(Canticum'))
    .map((latin, index) => ({
      id: `quicumque.${index + 1}`,
      type: 'psalm-verse',
      latin: normalizeLatin(latin),
      chinese: quicumqueChinese[index] || '',
      translationStatus: quicumqueChinese[index] ? 'temporary-translation' : 'missing',
      sourceRefs: [{ file: 'web/www/horas/Latin/Psalterium/Psalmorum/Psalm234.txt', section: String(index + 1) }],
    }))
}

function hymnStanzas(section) {
  return section
    .split(/\r?\n_\r?\n/)
    .map(stanza => stanza
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.replace(/^v\.\s*/, '').replace(/^\*\s*/, ''))
      .join('\n'))
    .filter(Boolean)
}

function normalizeLatin(text) {
  return text
    .replace(/\bJam\b/g, 'Iam')
    .replace(/\bjam\b/g, 'iam')
    .replace(/\bEjus\b/g, 'Eius')
    .replace(/\bejus\b/g, 'eius')
    .replace(/\bEjús/g, 'Eiús')
    .replace(/\bejús/g, 'eiús')
    .replace(/\badj/g, 'adi')
    .replace(/\bAdj/g, 'Adi')
    .replace(/Jesum/g, 'Iesum')
    .replace(/Jesu/g, 'Iesu')
    .replace(/Jesus/g, 'Iesus')
    .replace(/Jud/g, 'Iud')
    .replace(/jud/g, 'iud')
    .replace(/Jacob/g, 'Iacob')
}

function block(id, type, latin, status = undefined) {
  return {
    id,
    type,
    latin: normalizeLatin(latin),
    chinese: chinese[id] || '',
    translationStatus: status || (temporaryIds.has(id) ? 'temporary-translation' : chinese[id] ? 'existing-project-translation' : 'missing'),
    sourceRefs: [],
  }
}

function parsePrimaPsalmody() {
  const psalmiMinorSections = sections(read(sourceFiles.psalmiMinor))
  const section = psalmiMinorSections.Prima
  const rows = {}
  const lines = section.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  for (let i = 0; i < lines.length; i += 2) {
    const match = lines[i].match(/^([^=]+)=\s*(.+)$/)
    if (!match)
      continue
    const day = match[1].trim()
    if (!['Dominica', 'Feria II', 'Feria III', 'Feria IV', 'Feria V', 'Feria VI', 'Sabbato'].includes(day))
      continue
    rows[day] = {
      antiphon: normalizeLatin(match[2].trim()),
      antiphonChinese: translateAntiphon(match[2].trim(), antiphonChinese[day] || ''),
      psalms: lines[i + 1].split(',').map(item => item.trim()).filter(item => !/^\[/.test(item)),
    }
  }
  rows.seasonalAntiphons = parseSeasonalAntiphons(psalmiMinorSections)
  rows.properPrimaAntiphons = parseProperPrimaAntiphons()
  return rows
}

function parseSeasonalAntiphons(psalmiMinorSections) {
  const names = [
    'Adv1',
    'Adv2',
    'Adv3',
    'Adv4',
    'Adv42',
    'Adv43',
    'Adv44',
    'Adv45',
    'Adv46',
    'Adv47',
    'Quad',
    'Quad5',
    'Pasch',
  ]
  return Object.fromEntries(names.map(name => [name, antiphonsFromSection(psalmiMinorSections, name)]))
}

function antiphonsFromSection(psalmiMinorSections, name, seen = new Set()) {
  if (seen.has(name))
    return []
  seen.add(name)
  const section = psalmiMinorSections[name]
  if (!section)
    return []

  const rows = []
  for (const raw of section.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || /^\(sed rubrica/i.test(line))
      break
    const ref = line.match(/^@:(.+?)(?::(\d+)(?:-(\d+))?)?$/)
    if (ref) {
      const source = antiphonsFromSection(psalmiMinorSections, ref[1].trim(), seen)
      const from = ref[2] ? Number(ref[2]) - 1 : 0
      const to = ref[3] ? Number(ref[3]) : source.length
      rows.push(...source.slice(from, to))
      continue
    }
    if (line.startsWith('@'))
      continue
    const latin = normalizeLatin(line.replace(/^\d+\s*=\s*/, '').trim())
    if (latin)
      rows.push(antiphonRecord(`${name}.${rows.length + 1}`, latin, `Psalmi minor [${name}]`))
  }
  return rows
}

function parseProperPrimaAntiphons() {
  const files = [
    'Tempora/Quadp1-0.txt',
    'Tempora/Quadp2-0.txt',
    'Tempora/Quadp3-0.txt',
    'Tempora/Quad1-0.txt',
    'Tempora/Quad2-0.txt',
    'Tempora/Quad3-0.txt',
    'Tempora/Quad4-0.txt',
    'Tempora/Quad5-0.txt',
    'Tempora/Quad6-0.txt',
  ]
  return Object.fromEntries(files.map((file) => {
    const latin = sections(read(`web/www/horas/Latin/${file}`))['Ant Prima']?.split(/\r?\n/).map(line => line.trim()).filter(Boolean)[0] || ''
    return [file.replace(/\.txt$/, ''), latin ? antiphonRecord(file.replace(/\.txt$/, ''), latin, file) : undefined]
  }).filter(([, value]) => value))
}

function antiphonRecord(id, latin, source) {
  const normalized = normalizeLatin(latin)
  return {
    id,
    latin: normalized,
    chinese: translateAntiphon(normalized),
    translationStatus: 'temporary-translation',
    sourceRefs: [{ file: source }],
  }
}

function translateAntiphon(latin, fallback = '') {
  const normalized = normalizeLatin(latin)
  return antiphonReviewTranslations().get(normalized) || fallback || antiphonTranslationByLatin[normalized] || `（暂译缺失）${normalized.replace(/\s*\*\s*/g, ' ')}`
}

let antiphonReviewTranslationCache

function antiphonReviewTranslations() {
  if (antiphonReviewTranslationCache)
    return antiphonReviewTranslationCache

  antiphonReviewTranslationCache = new Map()
  const file = join(root, 'prima1962-antiphons-bilingual.txt')
  if (!existsSync(file))
    return antiphonReviewTranslationCache

  let currentLatin = ''
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const latinMatch = raw.match(/^(?:\d+\.\s*)?Latin:\s*(.+)$/)
    if (latinMatch) {
      currentLatin = normalizeLatin(latinMatch[1].trim())
      continue
    }

    const chineseMatch = raw.match(/^\s*Chinese:\s*(.*)$/)
    if (currentLatin && chineseMatch) {
      const chineseText = chineseMatch[1].trim()
      if (chineseText)
        antiphonReviewTranslationCache.set(currentLatin, chineseText)
      currentLatin = ''
    }
  }
  return antiphonReviewTranslationCache
}

function parsePsalmSpec(spec) {
  const match = spec.match(/^(\d+)(?:\((.+)\))?$/)
  return { number: match[1], range: match[2] || '' }
}

function parseVerseNumber(raw) {
  return Number(String(raw).replace(/[^0-9]/g, ''))
}

function parseSigaoVulgatePsalmText() {
  const text = readFileSync(join(root, sourceFiles.sigaoVulgatePsalms), 'utf8')
  const psalms = {}
  let currentPsalm = ''
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line)
      continue
    const heading = line.match(/^聖詠\s+(\d+)/)
    if (heading) {
      if (currentPsalm)
        normalizeSigaoPsalmVerses(currentPsalm, psalms[currentPsalm])
      currentPsalm = heading[1]
      psalms[currentPsalm] = {}
      continue
    }
    const verse = line.match(/^(\d+)\s+(.+)$/)
    if (currentPsalm && verse) {
      const verseNumber = Number(verse[1])
      psalms[currentPsalm][verseNumber] = cleanSigaoVulgateVerse(verseNumber, toSimplifiedChinese(verse[2].trim()))
    }
  }
  if (currentPsalm)
    normalizeSigaoPsalmVerses(currentPsalm, psalms[currentPsalm])
  return psalms
}

function cleanSigaoVulgateVerse(verse, text) {
  if (verse !== 1)
    return text

  return text.replace(superscriptionPattern(), '')
}

function normalizeSigaoPsalmVerses(psalm, verses) {
  if (!verses)
    return

  if (psalm === '52' && (verses[1] === '' || isPsalmSuperscription(verses[1]))) {
    const source = { ...verses }
    verses[1] = source[2] || ''
    verses[2] = source[2] || ''
    verses[3] = source[3] || ''
    verses[4] = source[4] || ''
    verses[5] = source[5] || ''
    verses[6] = source[6] || ''
    verses[7] = source[7] || ''
    return
  }

  if (verses[1] === '' || isPsalmSuperscription(verses[1]))
    delete verses[1]
}

function isPsalmSuperscription(text) {
  return Boolean(text && superscriptionPattern().test(text))
}

function superscriptionPattern() {
  return /^(?:达味(?:诗歌(?:，[^。．]*)?|作|训诲歌，交与乐官，悲调)|撒罗满诗歌|阿撒夫诗歌|科辣黑后裔诗歌|登圣殿歌|交与乐官[^。．]*|训诲歌[^。．]*)[。．]\s*/
}

function toSimplifiedChinese(text) {
  const map = {
    聖: '圣', 詠: '咏', 隨: '随', 從: '从', 惡: '恶', 計: '计', 謀: '谋', 參: '参', 與: '与', 譏: '讥', 諷: '讽', 專: '专', 畫: '昼',
    誡: '诫', 準: '准', 結: '结', 葉: '叶', 隨: '随', 糠: '糠', 粃: '秕', 審: '审', 賞: '赏', 識: '识', 趨: '趋', 萬: '万',
    爲: '为', 為: '为', 眾: '众', 囂: '嚣', 張: '张', 群: '群', 諸: '诸', 畢: '毕', 斷: '断', 綁: '绑', 擺: '摆', 脫: '脱',
    繩: '绳', 韁: '缰', 於: '于', 熱: '热', 憤: '愤', 發: '发', 聖: '圣', 傳: '传', 報: '报', 產: '产', 業: '业', 領: '领',
    鐵: '铁', 杖: '杖', 瓦: '瓦', 器: '器', 覺: '觉', 應: '应', 叩: '叩', 頭: '头', 滅: '灭', 於: '于', 這: '这', 絕: '绝',
    達: '达', 詩: '诗', 兒: '儿', 數: '数', 結: '结', 隊: '队', 論: '论', 維: '维', 護: '护', 盾: '盾', 牌: '牌', 榮: '荣',
    號: '号', 聖: '圣', 俯: '俯', 聽: '听', 躺: '躺', 睡: '睡', 覺: '觉', 雖: '虽', 圍: '围', 攻: '攻', 驚: '惊', 齒: '齿',
    援: '援', 屬: '属', 願: '愿', 眷: '眷', 詳: '详', 遜: '逊', 貴: '贵', 冠: '冠', 冕: '冕', 統: '统', 治: '治', 腳: '脚',
    鳥: '鸟', 類: '类', 種: '种', 讚: '赞', 頌: '颂', 宣: '宣', 揚: '扬', 偉: '伟', 歡: '欢', 踴: '踊', 躍: '跃', 顛: '颠',
    寶: '宝', 秉: '秉', 義: '义', 審: '审', 訊: '讯', 避: '避', 難: '难', 尋: '寻', 覓: '觅', 擯: '摈', 棄: '弃', 債: '债',
    懷: '怀', 慘: '惨', 痛: '痛', 聲: '声', 養: '养', 蒼: '苍', 靈: '灵', 蘇: '苏', 魂: '魂', 甦: '苏', 儀: '仪', 顧: '顾',
    樣: '样', 麼: '么', 讓: '让', 裏: '里', 麵: '面', 麥: '麦', 豐: '丰', 饒: '饶', 寢: '寝', 寧: '宁', 順: '顺', 憐: '怜',
    憫: '悯', 禱: '祷', 傾: '倾', 語: '语', 歎: '叹', 禱: '祷', 聲: '声', 滿: '满', 應: '应', 允: '允', 愛: '爱', 殿: '殿',
    宇: '宇', 賴: '赖', 厚: '厚', 肅: '肃', 跪: '跪', 導: '导', 舖: '铺', 誠: '诚', 盈: '盈', 墳: '坟', 瑩: '茔', 舌: '舌',
    顧美: '顾美', 驅: '驱', 逐: '逐', 叛: '叛', 逆: '逆', 忠: '忠', 興: '兴', 彩: '采', 烈: '烈', 歡: '欢', 愉: '愉',
    護: '护', 祐: '佑', 原: '原', 來: '来', 祇: '只', 體: '体', 衰: '衰', 弱: '弱', 痛: '痛', 結: '结', 援: '援',
    慈: '慈', 陰: '阴', 稱: '称', 頌: '颂', 濕: '湿', 舖: '铺', 褥: '褥', 憂: '忧', 傷: '伤', 盲: '盲', 仇: '仇',
    敵: '敌', 衆: '众', 感: '感', 惆: '惆', 悵: '怅', 姦: '奸', 科: '科', 遠: '远', 離: '离', 悲: '悲', 號: '号',
    悅: '悦', 納: '纳', 轉: '转', 瞬: '瞬', 間: '间', 會: '会', 向: '向', 唱: '唱', 流: '流', 話: '话',
    實: '实', 無: '无', 臥: '卧', 綠: '绿', 場: '场', 靜: '静', 還: '还', 暢: '畅', 號: '号', 義: '义', 緣: '缘',
    懼: '惧', 兩: '两', 溪: '溪', 應: '应', 準: '准', 滿: '满', 溢: '溢', 歲: '岁', 慈: '慈', 愛: '爱', 隨: '随',
    殿: '殿', 內: '内', 直: '直', 遠: '远', 叢: '丛', 順: '顺', 過: '过', 獻: '献', 膏: '膏', 杯: '杯',
    裏: '里', 纔: '才', 藉: '借', 賜: '赐', 憶: '忆', 禍: '祸', 險: '险', 災: '灾', 壞: '坏', 國: '国',
    請: '请', 勝: '胜', 權: '权', 壓: '压', 謙: '谦', 虛: '虚', 顯: '显', 願: '愿', 獲: '获', 獎: '奖',
    濟: '济', 貧: '贫', 困: '困', 眾: '众', 憫: '悯', 樣: '样', 齊: '齐', 樹: '树', 營: '营', 壽: '寿',
    榮: '荣', 貴: '贵', 將: '将', 樂: '乐', 龍: '龙', 齒: '齿', 門: '门', 開: '开', 閉: '闭', 醫: '医',
  }
  return traditionalToSimplified([...text].map(char => map[char] || char).join('')).replace(/幺/g, '么')
}

function psalmText(spec, sigaoPsalms) {
  const { number, range } = parsePsalmSpec(spec)
  const file = readFileSync(join(latinRoot, 'Psalterium/Psalmorum', `Psalm${number}.txt`), 'utf8')
  let verses = file.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^(\d+):(\d+)\s+(.+)$/)
      return match ? { psalm: match[1], verse: Number(match[2]), latin: normalizeLatin(match[3]) } : null
    })
    .filter(Boolean)
  if (range) {
    const [fromRaw, toRaw] = range.split('-')
    const from = parseVerseNumber(fromRaw)
    const to = parseVerseNumber(toRaw)
    verses = verses.filter(item => item.verse >= from && item.verse <= to)
  }
  return verses.map(item => ({
    id: `psalm.${number}.${item.verse}`,
    verse: item.verse,
    latin: item.latin,
    chinese: sigaoPsalms[number]?.[item.verse] || '',
    translationStatus: sigaoPsalms[number]?.[item.verse] ? 'verified-source-translation' : 'missing',
    sourceRefs: [
      { file: `web/www/horas/Latin/Psalterium/Psalmorum/Psalm${number}.txt`, section: `${number}:${item.verse}` },
      { file: sourceFiles.sigaoVulgatePsalms, section: `圣咏 ${number}:${item.verse}` },
    ],
  }))
}

function main() {
  mkdirSync(outDir, { recursive: true })
  const commit = execFileSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const prima = sections(read(sourceFiles.primaSpecial))
  const prayers = sections(read(sourceFiles.prayers))
  const psalmody = parsePrimaPsalmody()
  const sigaoPsalms = parseSigaoVulgatePsalmText()
  const psalms = Object.fromEntries(psalmSpecs.map(spec => [spec, psalmText(spec, sigaoPsalms)]))
  const antiphonTxt = writeAntiphonExport(psalmody)
  const psalmAlignmentReport = buildPsalmAlignmentReport(psalms)

  const fixedTexts = {
    opening: [
      block('opening.deus-in-adiutorium.verse', 'verse', '℣. Deus, in adiutórium meum inténde.'),
      block('opening.deus-in-adiutorium.response', 'response', '℟. Dómine, ad adiuvándum me festína.'),
      block('common.gloria-patri', 'verse', '℣. Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.'),
      block('common.alleluia', 'verse', 'Allelúia.'),
      block('common.laus-tibi', 'verse', 'Laus tibi, Dómine, Rex ætérnæ glóriæ.'),
    ],
    hymn: hymnStanzas(prima['Hymnus Prima']).map((latin, index) => block(index === 4 ? 'hymn.iam-lucis.doxology' : `hymn.iam-lucis.stanza-${index + 1}`, 'hymn-stanza', latin)),
    doxologies: {},
    quicumque: parseQuicumque(),
    capitulum: block('capitulum.regi', 'reading', 'Regi sæculórum immortáli et invisíbili, soli Deo honor et glória in sǽcula sæculórum. Amen.'),
    responsory: {
      ordinary: primaResponsoryOrdinary(),
      passion: [
        block('responsory.christe', 'response', '℟. Christe, Fili Dei vivi, miserére nobis.'),
        block('responsory.qui-sedes', 'verse', '℣. Qui sedes ad déxteram Patris.'),
        block('responsory.christe.repeat', 'response', '℟. Christe, Fili Dei vivi, miserére nobis.', 'temporary-translation'),
      ],
      paschal: [
        block('responsory.paschal.1', 'response', '℟. Christe, Fili Dei vivi, miserére nobis, allelúia, allelúia.', 'temporary-translation'),
        block('responsory.qui-surrexisti', 'verse', '℣. Qui surrexísti a mórtuis, allelúia.', 'temporary-translation'),
        block('responsory.paschal.2', 'response', '℟. Miserére nobis, allelúia, allelúia.', 'temporary-translation'),
        block('responsory.paschal.gloria', 'verse', '℣. Glória Patri, et Fílio, et Spirítui Sancto.'),
        block('responsory.paschal.3', 'response', '℟. Christe, Fili Dei vivi, miserére nobis, allelúia, allelúia.', 'temporary-translation'),
      ],
      versum: [
        block('responsory.exsurge', 'verse', '℣. Exsúrge, Christe, ádiuva nos.'),
        block('responsory.libera', 'response', '℟. Et líbera nos propter nomen tuum.'),
      ],
      properVerses: primaResponsoryProperVerses(prima),
    },
    collect: block('collect.domine-deus', 'prayer', 'Dómine Deus omnípotens, qui ad princípium huius diéi nos perveníre fecísti: tua nos hódie salva virtúte; ut in hac die ad nullum declinémus peccátum, sed semper ad tuam iustítiam faciéndam nostra procédant elóquia, dirigántur cogitatiónes et ópera. Per Christum Dóminum nostrum. Amen.'),
    pretiosa: [
      block('martyrology.pretiosa.verse', 'verse', '℣. Pretiósa in conspéctu Dómini.'),
      block('martyrology.pretiosa.response', 'response', '℟. Mors Sanctórum eius.'),
      block('martyrology.sancta-maria', 'prayer', 'Sancta María et omnes Sancti intercédant pro nobis ad Dóminum, ut nos mereámur ab eo adiuvári et salvári, qui vivit et regnat in sǽcula sæculórum. Amen.'),
    ],
    chapter: [
      block('chapter.deus-in-adiutorium.1', 'verse', '℣. Deus, in adiutórium meum inténde.'),
      block('chapter.deus-in-adiutorium.1.response', 'response', '℟. Dómine, ad adiuvándum me festína.'),
      block('chapter.deus-in-adiutorium.2', 'verse', '℣. Deus, in adiutórium meum inténde.'),
      block('chapter.deus-in-adiutorium.2.response', 'response', '℟. Dómine, ad adiuvándum me festína.'),
      block('chapter.deus-in-adiutorium.3', 'verse', '℣. Deus, in adiutórium meum inténde.'),
      block('chapter.deus-in-adiutorium.3.response', 'response', '℟. Dómine, ad adiuvándum me festína.'),
      block('chapter.gloria-patri', 'verse', '℣. Glória Patri, et Fílio, et Spirítui Sancto.'),
      block('chapter.sicut-erat', 'response', '℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen. Allelúia.'),
      block('chapter.kyrie', 'verse', 'Kýrie, eléison. Christe, eléison. Kýrie, eléison.'),
      block('chapter.pater-secret', 'prayer', 'Pater noster, qui es in cælis, sanctificétur nomen tuum. Advéniat regnum tuum. Fiat volúntas tua, sicut in cælo et in terra. Panem nostrum cotidiánum da nobis hódie. Et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris.'),
      block('chapter.et-ne-nos', 'verse', '℣. Et ne nos indúcas in tentatiónem.'),
      block('chapter.sed-libera', 'response', '℟. Sed líbera nos a malo.'),
      block('chapter.respice', 'verse', '℣. Réspice in servos tuos, Dómine, et in ópera tua, et dírige fílios eórum.'),
      block('chapter.respice.response', 'response', '℟. Et sit splendor Dómini Dei nostri super nos, et ópera mánuum nostrárum dírige super nos, et opus mánuum nostrárum dírige.'),
      block('chapter.dirigere', 'prayer', 'Dirígere et sanctificáre, régere et gubernáre dignáre, Dómine Deus, Rex cæli et terræ, hódie corda et córpora nostra, sensus, sermónes et actus nostros in lege tua, et in opéribus mandatórum tuórum: ut hic et in ætérnum, te auxiliánte, salvi et líberi esse mereámur, Salvátor mundi: qui vivis et regnas in sǽcula sæculórum. Amen.'),
    ],
    lectioFormulae: {
      privateBlessing: block('lectio.iube-domine', 'verse', 'Iube, Dómine, benedícere.'),
      choirBlessing: block('lectio.iube-domne', 'verse', 'Iube, domne, benedícere.'),
      conclusion: [
        block('lectio.tu-autem', 'verse', '℣. Tu autem, Dómine, miserére nobis.'),
        block('common.deo-gratias', 'response', '℟. Deo grátias.'),
      ],
    },
    ending: [
      block('ending.adjutorium', 'verse', '℣. Adiutórium nostrum in nómine Dómini.'),
      block('ending.qui-fecit', 'response', '℟. Qui fecit cælum et terram.'),
      block('ending.benedicite', 'verse', '℣. Benedicite.'),
      block('ending.deus', 'response', '℟. Deus.'),
      block('ending.dominus-nos', 'prayer', 'Dóminus nos benedícat, et ab omni malo deféndat, et ad vitam perdúcat ætérnam.'),
      block('ending.fidelium', 'verse', '℣. Fidélium ánimæ per misericórdiam Dei requiéscant in pace.'),
      block('common.amen', 'response', '℟. Amen.'),
    ],
  }

  const lectioBrevis = Object.fromEntries(['Per Annum', 'Adv', 'Nat', 'Epi', 'Asc', 'Quad', 'Quad5', 'Pasch', 'Pent'].map(key => {
    const lines = textLines(prima[key])
    return [key, block(`lectio.${key.toLowerCase().replace(/\s+/g, '-')}`, 'reading', lines.join(' '), key === 'Per Annum' ? 'existing-project-translation' : 'temporary-translation')]
  }))

  const manifest = {
    generatedAt: extractedAt,
    upstreamRepository: 'https://github.com/DivinumOfficium/divinum-officium',
    upstreamCommit: commit,
    license: 'MIT',
    sourceFiles: Object.values(sourceFiles),
    generatedFiles: [
      'public/data/prima1962/manifest.json',
      'public/data/prima1962/fixed-texts.json',
      'public/data/prima1962/psalmody.json',
      'public/data/prima1962/psalms-latin.json',
      'public/data/prima1962/psalms-chinese.json',
      'public/data/prima1962/lectio-brevis.json',
      'public/data/prima1962/translation-status.json',
      'prima1962-antiphons-bilingual.txt',
      'prima1962-responsory-verses-bilingual.txt',
      'prima1962-lectio-brevis-bilingual.txt',
      'prima1962-variable-texts-bilingual.txt',
      'docs/prima1962-psalm-alignment-report.md',
    ],
    normalized: ['J/I spelling in selected displayed Latin', 'adjutorium to adiutorium', 'Jam to Iam', 'Sigaō psalm text converted from Traditional to Simplified Chinese with OpenCC', 'Psalm superscriptions removed where they are not present in the Latin office text'],
    notImported: ['web/www/horas/Latin/Martyrologium1960/'],
  }

  const allBlocks = [
    ...fixedTexts.opening,
    ...fixedTexts.hymn,
    ...fixedTexts.quicumque,
    fixedTexts.capitulum,
    ...fixedTexts.responsory.ordinary,
    ...fixedTexts.responsory.passion,
    ...fixedTexts.responsory.paschal,
    ...fixedTexts.responsory.versum,
    ...Object.values(fixedTexts.responsory.properVerses),
    fixedTexts.collect,
    ...fixedTexts.pretiosa,
    ...fixedTexts.chapter,
    fixedTexts.lectioFormulae.privateBlessing,
    fixedTexts.lectioFormulae.choirBlessing,
    ...fixedTexts.lectioFormulae.conclusion,
    ...fixedTexts.ending,
    ...Object.values(lectioBrevis),
  ]

  const translationStatus = allBlocks.map(item => ({
    id: item.id,
    latin: item.latin,
    chinese: item.chinese,
    type: item.type,
    usage: 'standalone /martyrology-prima1962/ mixed Prima page',
    latinSourceFile: 'Divinum Officium Latin Prima/Psalterium data',
    chineseSourceFile: item.translationStatus === 'existing-project-translation' ? 'project text or established page wording' : '',
    translationStatus: item.translationStatus,
    automaticallyMatched: false,
    codexTemporaryTranslation: item.translationStatus === 'temporary-translation',
    needsUserConfirmation: item.translationStatus !== 'existing-project-translation',
    notes: item.translationStatus === 'missing' ? 'No Chinese text supplied.' : '',
  }))

  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(join(outDir, 'fixed-texts.json'), `${JSON.stringify(fixedTexts, null, 2)}\n`)
  writeFileSync(join(outDir, 'psalmody.json'), `${JSON.stringify(psalmody, null, 2)}\n`)
  writeFileSync(join(outDir, 'psalms-latin.json'), `${JSON.stringify(psalms, null, 2)}\n`)
  writeFileSync(join(outDir, 'psalms-chinese.json'), `${JSON.stringify(psalms, null, 2)}\n`)
  writeFileSync(join(outDir, 'lectio-brevis.json'), `${JSON.stringify(lectioBrevis, null, 2)}\n`)
  writeFileSync(join(outDir, 'translation-status.json'), `${JSON.stringify(translationStatus, null, 2)}\n`)
  writeFileSync(join(root, 'prima1962-antiphons-bilingual.txt'), antiphonTxt)
  writeFileSync(join(root, 'prima1962-responsory-verses-bilingual.txt'), writeResponsoryVersesExport(fixedTexts.responsory.properVerses))
  writeFileSync(join(root, 'prima1962-lectio-brevis-bilingual.txt'), writeLectioBrevisExport(lectioBrevis))
  writeFileSync(join(root, 'prima1962-variable-texts-bilingual.txt'), writeVariableTextsExport(fixedTexts, lectioBrevis))
  writeFileSync(join(root, 'docs/prima1962-psalm-alignment-report.md'), psalmAlignmentReport)
  writeTranslationReport(translationStatus)
}

function writeAntiphonExport(psalmody) {
  const lines = ['# Prima 1962 Antiphons', '']
  for (const [day, item] of Object.entries(psalmody)) {
    if (!item || typeof item.antiphon !== 'string')
      continue
    lines.push(`[Ordinary ${day}]`, `Latin: ${item.antiphon}`, `Chinese: ${item.antiphonChinese || ''}`, '')
  }
  lines.push('## Seasonal groups from Psalmi minor', '')
  for (const [group, items] of Object.entries(psalmody.seasonalAntiphons || {})) {
    lines.push(`[${group}]`)
    for (const [index, item] of items.entries())
      lines.push(`${index + 1}. Latin: ${item.latin}`, `   Chinese: ${item.chinese || ''}`)
    lines.push('')
  }
  lines.push('## Proper Ant Prima from Tempora', '')
  for (const [key, item] of Object.entries(psalmody.properPrimaAntiphons || {}))
    lines.push(`[${key}]`, `Latin: ${item.latin}`, `Chinese: ${item.chinese || ''}`, '')
  return `${lines.join('\n')}\n`
}

function writeResponsoryVersesExport(properVerses) {
  const labels = {
    ordinary: 'Per Annum / Ordinary',
    adv: 'Adventus',
    nat: 'Nativitas',
    epi: 'Epiphania',
    pasch: 'Tempus Paschale',
    asc: 'Ascensio',
    pent: 'Pentecostes',
    corp: 'Corpus Christi',
    heart: 'Sacratissimum Cor Iesu',
  }
  const lines = ['# Prima 1962 Responsory Proper Verses', '']
  for (const [key, block] of Object.entries(properVerses)) {
    lines.push(`[${key} - ${labels[key] || key}]`)
    lines.push(`Latin: ${block.latin}`)
    lines.push(`Chinese: ${block.chinese}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

function writeLectioBrevisExport(lectioBrevis) {
  const citations = {
    'Per Annum': '2 Thess 3:5',
    Adv: 'Isa 33:2',
    Nat: 'Heb 1:11-12',
    Epi: 'Isa 60:6',
    Asc: 'Acts 1:11',
    Quad: 'Isa 55:6',
    Quad5: 'Isa 50:6-7',
    Pasch: 'Col 3:1-2',
    Pent: 'Acts 2:11',
  }
  const lines = ['# Prima 1962 Lectio Brevis', '']
  for (const [key, block] of Object.entries(lectioBrevis)) {
    lines.push(`[${key}]`)
    lines.push(`Citation: ${citations[key] || ''}`)
    lines.push(`Latin: ${block.latin}`)
    lines.push(`Chinese: ${block.chinese}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

function writeVariableTextsExport(fixedTexts, lectioBrevis) {
  const lines = ['# Prima 1962 Variable Texts', '']

  lines.push('## Incipit seasonal acclamation', '')
  for (const item of fixedTexts.opening.filter(block => ['common.alleluia', 'common.laus-tibi'].includes(block.id))) {
    lines.push(`[${item.id}]`)
    lines.push(`Latin: ${item.latin}`)
    lines.push(`Chinese: ${item.chinese}`)
    lines.push('')
  }

  lines.push('## Responsorium breve seasonal forms', '')
  for (const [key, blocks] of Object.entries({
    ordinary: fixedTexts.responsory.ordinary,
    passion: fixedTexts.responsory.passion,
    paschal: fixedTexts.responsory.paschal,
  })) {
    lines.push(`[${key}]`)
    for (const block of blocks) {
      lines.push(`Latin: ${block.latin}`)
      lines.push(`Chinese: ${block.chinese}`)
    }
    lines.push('')
  }

  lines.push('## Responsorium breve proper verses', '')
  for (const [key, block] of Object.entries(fixedTexts.responsory.properVerses)) {
    lines.push(`[${key}]`)
    lines.push(`Latin: ${block.latin}`)
    lines.push(`Chinese: ${block.chinese}`)
    lines.push('')
  }

  lines.push('## Capitulum Responsorium', '')
  lines.push('[Capitulum]')
  lines.push('Citation: 1 Tim 1:17')
  lines.push(`Latin: ${fixedTexts.capitulum.latin}`)
  lines.push(`Chinese: ${fixedTexts.capitulum.chinese}`)
  lines.push('')

  lines.push('## Lectio brevis', '')
  for (const [key, block] of Object.entries(lectioBrevis)) {
    lines.push(`[${key}]`)
    lines.push(`Latin: ${block.latin}`)
    lines.push(`Chinese: ${block.chinese}`)
    lines.push('')
  }

  lines.push('## Quicumque vult {in festo Sanctissimae Trinitatis}', '')
  for (const block of fixedTexts.quicumque) {
    lines.push(`Latin: ${block.latin}`)
    lines.push(`Chinese: ${block.chinese}`)
    lines.push('')
  }

  lines.push('## Structural rubric notes', '')
  lines.push('[triduum]')
  lines.push('Latin: In Triduo Sacro schema ordinarium Primæ non simpliciter adhibetur; Gloria post psalmos omittitur iuxta rubricas.')
  lines.push('Chinese: 圣周三日庆典内，不可简单套用普通第一时辰经结构；圣咏后的光荣颂按礼规省略。')
  lines.push('')
  lines.push('[quicumque]')
  lines.push('Latin: Symbolum Athanasianum dicitur ad Primam in festo Sanctissimæ Trinitatis.')
  lines.push('Chinese: 圣三主日第一时辰经诵念《不拘谁信经》。')
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildPsalmAlignmentReport(psalms) {
  const lines = ['# Prima 1962 Psalm Alignment Report', '', 'Source: `思高圣咏集_武加大编号_逐节纯文本.txt`.', '']
  for (const [spec, verses] of Object.entries(psalms)) {
    const first = verses[0]
    const last = verses[verses.length - 1]
    lines.push(`## ${spec}`, '')
    lines.push(`- First Latin: ${first?.latin || ''}`)
    lines.push(`- First Chinese: ${first?.chinese || '（缺）'}`)
    lines.push(`- Last Latin: ${last?.latin || ''}`)
    lines.push(`- Last Chinese: ${last?.chinese || '（缺）'}`)
    lines.push(`- Missing Chinese verses: ${verses.filter(item => !item.chinese).length}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

function writeTranslationReport(items) {
  const docsDir = join(root, 'docs')
  mkdirSync(docsDir, { recursive: true })
  const counts = items.reduce((acc, item) => {
    acc[item.translationStatus] = (acc[item.translationStatus] || 0) + 1
    return acc
  }, {})
  const temporary = items.filter(item => item.translationStatus === 'temporary-translation')
  const missingFixed = items.filter(item => item.translationStatus === 'missing')
  const temporaryList = temporary.map(item => `### ${item.id}

- 类型：${item.type}
- 拉丁文：${String(item.latin).replace(/\n/g, ' / ')}
- 中文：${item.chinese || '（中文暂缺）'}
- 状态：暂译
- 使用位置：${item.usage}
- 拉丁文来源：${item.latinSourceFile}
- 中文来源：${item.chineseSourceFile || 'Codex 暂译'}
- 是否由程序自动匹配：${item.automaticallyMatched ? '是' : '否'}
- 是否由 Codex 自行暂译：${item.codexTemporaryTranslation ? '是' : '否'}
- 需要用户确认：${item.needsUserConfirmation ? '是' : '否'}
- 备注：${item.notes || '项目内未找到可直接复用的正式中文译文。'}
`).join('\n')
  const missingList = missingFixed.length
    ? missingFixed.map(item => `### ${item.id}\n\n- 类型：${item.type}\n- 拉丁文：${item.latin}\n- 使用位置：${item.usage}\n- 状态：缺译\n`).join('\n')
    : '固定 Prima 文本清单中无缺译条目。圣咏逐节中文仍缺失，见 `public/data/prima1962/psalms-latin.json` 中每节的 `missing` 状态。'

  const report = `# Prima 1962 Translation Report

Generated for the standalone \`/martyrology-prima1962/\` page:

> 混合形式：1962年 Prima 结构与本站现有新礼《罗马殉道圣人录》文本。并非原样复刻的1962年完整礼书。

## Summary

- Prima Latin units in translation status file: ${items.length}
- Directly reused project or existing page wording: ${counts['existing-project-translation'] || 0}
- Mapped from project readings or existing wording: 1
- New temporary translations: ${counts['temporary-translation'] || 0}
- Missing translations in fixed-text status list: ${counts.missing || 0}
- Ambiguous candidate translations awaiting decision: 0
- Psalm verse Chinese translations: missing by design in this iteration and shown with explicit \`missing\` status in \`psalms-latin.json\`.

The martyrology body itself continues to use the existing project translation in \`pages/martyrologium-translation/index.md\`. No 1960 martyrology text was imported.

## Directly Reused Project Wording

- \`common.gloria-patri\`: 光荣颂 wording follows existing project style used in Saturday Mary Office.
- \`common.alleluia\`: 阿肋路亚.
- \`common.deo-gratias\`: 感谢天主.
- \`martyrology.pretiosa.verse\`: 在上主台前何其珍贵的，
- \`martyrology.pretiosa.response\`: 是祂圣徒们的死亡。
- \`common.amen\`: 阿们.
- Current new-rite martyrology date proclamation, movable feasts, fixed elogium and notes rendering are reused from the existing martyrology parser.

## Mapped from Project Readings

### lectio.per-annum

- 类型：Prima Lectio brevis
- 拉丁文：Dóminus autem dírigat corda et córpora nostra in caritáte Dei et patiéntia Christi.
- 中文：愿主指引你们的心去爱天主，并学习基督的坚忍。
- 来源：现有 \`pages/martyrologium-translation/index.md\` 中常年期短读经，2 Thess 3:5。
- 备注：拉丁文含 \`corda et corpora\`；现有中文对应经文含义，但不是逐词日课译文。

## New Temporary Translations

${temporaryList}

## Still Missing

${missingList}

## Candidate Translation Conflicts

无。

## Latin and Chinese Texts Not Fully Corresponding

- \`lectio.per-annum\`: 复用项目内圣经短句译文，但拉丁日课文本与中文现有短读经不是逐词对齐。

## Not Reused Because of Liturgical Version Difference

- 现代圣人录短读经没有被整体复用为 1962 Prima 的 Lectio brevis。
- 现代圣人录祷词和结束词在 Prima 模式中隐藏。
- 本站现有新礼圣人录正文继续使用，但不会标称为 1960、1961 或 1962 圣人录。
`
  writeFileSync(join(docsDir, 'prima1962-translation-report.md'), report)
}

main()
