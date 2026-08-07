# CODEX TASK: Valaxy 赞美诗页面

## 前置步骤

hymn_catalog.json 已放在项目根目录。把它移到数据目录：

```bash
mkdir -p public/data/hymns
mv hymn_catalog.json public/data/hymns/
```

## 产出两个页面

### 页面 1：赞美诗汇总 `pages/hymns/index.vue`

静态资源页，展示全部赞美诗。

**数据源**：`/data/hymns/hymn_catalog.json`（Valaxy 中 public/ 下的文件通过绝对路径 fetch）

**布局**：
- 页面标题：Hymni Liturgiæ Horarum（日课赞美诗集）
- 按用途分组显示，分组顺序：
  1. **Psalterium — Per Annum**（常年期）：按星期几分 7 组（Dominica → Sabbato），每组内按时辰排列（Ad Laudes → Ad Vesperas → Ad Officium lectionis）
  2. **Psalterium — Tempus Adventus**（将临期）：同上结构，数据来自 volume=1 psalterium 条目
  3. **Psalterium — Tempus Quadragesimæ / Paschale**（四旬期/复活期）：volume=2
  4. **Proprium de Sanctis**（圣人专用）：按日期排列
  5. **Commune**（通用经文）：按 commune 类别排列

**判断季节的方法**：hymn_catalog.json 的 used_in 里有 volume 字段。
- volume 1 的 psalterium 条目 → 将临期/圣诞期
- volume 2 的 psalterium 条目 → 四旬期/复活期
- volume 3 或 4 的 psalterium 条目 → 常年期（两卷内容相同，去重）
- proprium_de_sanctis 条目 → 圣人专用
- commune 条目 → 通用

**每首赞美诗显示**：
- 标题行：incipit（大字）
- 使用场景标签：如 "Feria III · Ad Vesperas" 或 "29 Jul · Martha"
- 全文：保留分节（stanza），拉丁文用 serif 字体（Georgia 或 'Noto Serif' 系列）
- 默认折叠全文，点击展开

**搜索**：页面顶部一个搜索框，按 incipit 实时过滤。

### 页面 2：今日赞美诗 `pages/hymns/hodie.vue`

带算法的交互组件，显示今天（或指定日期）各时辰应使用的赞美诗。

**界面**：
- 日期选择器（默认今天）
- 显示该日的礼仪信息：礼仪季节、Psalter 周次、星期几
- 列出各时辰的赞美诗：Ad Laudes · Ad Vesperas · Ad Officium lectionis
- 每首显示 incipit + 点击展开全文

**核心算法**：给定一个公历日期，确定使用哪首赞美诗。

#### Step 1: 计算复活节日期（Computus）

```javascript
function easter(year) {
  // Anonymous Gregorian algorithm
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}
```

#### Step 2: 判断礼仪季节

给定日期 d 和该年的 Easter Sunday：

```
Ash Wednesday = Easter - 46 days
Pentecost = Easter + 49 days
Advent I Sunday = 第一个在 Nov 27—Dec 3 之间的周日
Christmas = Dec 25
Baptism of Lord = Christmas 后第一个周日之后的周一
                 （如果 Epiphany=Jan 6 落在周日则为 Jan 7 周一）
                  简化规则：Jan 6 之后的第一个周日之后的周一，
                  但如果 Jan 6 是周日则为 Jan 7

季节判断（按优先级）：
if d >= Advent I Sunday && d < Dec 25          → "adventus"
if d >= Dec 25 || d <= Baptism of Lord         → "nativitatis"
if d >= Ash Wednesday && d < Easter            → "quadragesimae"
if d >= Easter && d <= Pentecost               → "paschale"
else                                           → "per_annum"
```

#### Step 3: 确定 Psalter 周次

常年期周数的计算：
```
Ordinary Time 分两段：
  OT1: Baptism of Lord 次日(Mon) → Ash Wednesday 前一日
  OT2: Pentecost 次日(Mon) → Advent I Sunday 前一日

OT1 的周数从第 I 周开始。
OT2 的周数需要倒推：第 34 周总是最后一周（Advent 前），往前数。

Psalter 周次 = (liturgical_week - 1) % 4 + 1
  即 Week 1,5,9,13,17,21,25,29,33 → Psalter I
     Week 2,6,10,14,18,22,26,30,34 → Psalter II
     Week 3,7,11,15,19,23,27,31    → Psalter III
     Week 4,8,12,16,20,24,28,32    → Psalter IV
```

注意：对于赞美诗查找来说，**Psalter 周次不影响结果**——
同一星期几同一时辰在四个 Psalter 周用的赞美诗都一样。
但要在界面上显示出来供参考。

#### Step 4: 查找赞美诗

```
season_to_volume = {
  "adventus": 1,
  "nativitatis": 1,
  "quadragesimae": 2,
  "paschale": 2,
  "per_annum": 3    // volume 3 和 4 内容相同，只查 3
}

weekday_to_day = {
  0: "dominica",     // JS Date.getDay(): 0=Sunday
  1: "feria_II",
  2: "feria_III",
  3: "feria_IV",
  4: "feria_V",
  5: "feria_VI",
  6: "sabbato"
}

hours = ["ad_laudes", "ad_vesperas", "ad_officium_lectionis"]
```

对每个时辰：
1. 在 hymn_catalog.json 的 hymns 数组中，找 used_in 里同时匹配以下条件的条目：
   - `section == "psalterium"`
   - `volume == season_to_volume[season]`
   - `day == weekday_to_day[weekday]`
   - `hour == target_hour`
   - `type == "inline"`（优先有全文的）
2. 如果找到，显示该赞美诗
3. 如果没找到（某些季节/时辰可能缺数据），显示"未收录"

#### 特殊情况处理

**不要处理**圣人纪念日/庆节的赞美诗替换。这需要完整日历数据，
不在本任务范围内。页面底部加一行小字说明：
"仅显示时间季节（Temporale）赞美诗。圣人纪念日及庆节的专用赞美诗请参阅汇总页。"

---

## 导航

在两个页面之间互相链接：
- 汇总页底部："→ 查看今日赞美诗"
- 今日页底部："→ 赞美诗全集"

## 技术要求

- Vue 3 Composition API（`<script setup>`），Valaxy 项目标准写法
- 用 fetch 从 `/data/hymns/hymn_catalog.json` 加载数据
- 拉丁文用 serif 字体，中文说明用 sans-serif
- 响应式布局，移动端可用
- 不引入额外依赖（不用 moment/dayjs/luxon，原生 Date 足够）
- 不修改项目中已有的任何文件

## 验收

在本地 `npx valaxy dev` 后：
1. 访问 `/hymns/` 能看到分组的赞美诗列表，搜索框能过滤
2. 访问 `/hymns/hodie` 能看到今天的赞美诗，切换日期后内容跟着变
3. 今天是 2026-08-07（星期五，常年期），Ad Vesperas 应显示的赞美诗 incipit 是 "Plasmátor hóminis Deus"（周五晚祷固定赞美诗）
