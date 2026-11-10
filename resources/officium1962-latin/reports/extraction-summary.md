# 拉丁文语料提取摘要

- 提取时间（固定生产提交时间）：2026-07-22T12:32:51-04:00
- 上游 commit：`515a213f79951c563be4f599ca591c63aa63bb6d`
- 生产 commit：`10d951f5901a6d2991063763d7b7d471566c688a`
- Canonical corpus 条目：10019
- Shared block 条目：9630
- Calendar 日数 / 去重标题：365 / 354
- Release occurrence：60739
- Metadata/display occurrence：3722
- Corpus-mapped occurrence：64461
- 拉丁文字符 / 词数：4115286 / 577350
- SourceRefs 完整率：100%
- Needs classification：0
- Duplicate groups / audit groups：950 / 950
- Translation template：10019

`releaseOccurrences` 只计算原始 day/hour block occurrences；metadata/display occurrence 是 calendar title、rank、hour title 与 release 外静态拉丁文标题的独立出现位置，不会冒充礼文 block。

## 按类型

| Type | 条目 | 字符 |
| --- | ---: | ---: |
| absolution | 5 | 2419 |
| antiphon | 3656 | 392547 |
| blessing | 44 | 5933 |
| canticle | 28 | 38089 |
| capitulum | 392 | 93796 |
| chapter-office | 1 | 1191 |
| commemoration | 88 | 47019 |
| dialogue | 22 | 7415 |
| heading | 392 | 19246 |
| hymn | 179 | 106234 |
| invitatory | 71 | 88878 |
| marian-antiphon | 4 | 2406 |
| martyrology | 360 | 589427 |
| matins-responsory | 736 | 324394 |
| prayer | 1683 | 788150 |
| pretiosa | 1 | 221 |
| psalm | 480 | 562791 |
| reading | 1350 | 977989 |
| responsory | 134 | 30093 |
| rubric | 37 | 4761 |
| te-deum | 1 | 1534 |
| versicle | 355 | 30753 |

## 按优先级

| Priority | 条目 | 字符 |
| --- | ---: | ---: |
| core | 682 | 219857 |
| high | 588 | 115573 |
| low | 4037 | 1509478 |
| metadata | 389 | 19210 |
| normal | 4289 | 2246560 |
| rubric | 34 | 4608 |

## 输出哈希

- `by-type/absolution.jsonl`: `ea4f96418a3b1dc77deb163ed69f79e9aa04ab8cab6efe2ee115ae28967aee0a`
- `by-type/antiphon.jsonl`: `e1650fc274f996cd5351cfa50caee1114e8aa8eac6b73c4930b666ae5505628a`
- `by-type/blessing.jsonl`: `2793b0745d670149a470bb2f945ab3588a5dac76fd961ac1e1682a02f65f6989`
- `by-type/canticle.jsonl`: `9bbc22ff253631f8ba349599c9da960e26d53d931d665071b18f121625ff7617`
- `by-type/capitulum.jsonl`: `cf76ac5ee8fe6046953df6f5622061e401f015469e80efacc8efcbf8c1093f4e`
- `by-type/chapter-office.jsonl`: `69737ab97e5b5faaf31ce1a6063a5eb5bdcd3106db0f3b608cc2ca2944460632`
- `by-type/commemoration.jsonl`: `7d29c783241a7ae17df9223df27bdbbe20687827769e0f5aeebe25b3776fad79`
- `by-type/dialogue.jsonl`: `7792c1c689b091e7f64ea7587f9a496b8224cb2d104ae46356b132c2ffa0ff16`
- `by-type/heading.jsonl`: `9031a482b8935df0df07421dacddeb8d3a9919cab3fc287770cf17cd08999334`
- `by-type/hymn.jsonl`: `42e9b982065a3425e2e23502e109695c3a103fbc90ab71b32a36a7ba567e9744`
- `by-type/invitatory.jsonl`: `4578c5466021faed2dcadbbf78ce35027379f7ad9969f1ace78e7a012923eeaa`
- `by-type/martyrology-placeholder.jsonl`: `034fa66692c70a6b2669380e54f4de660ce9e04b7aa21e45709349ea3adb8518`
- `by-type/other.jsonl`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `by-type/prayer.jsonl`: `089adf545c94f36cd5020054a5f8b4d88b8045eedfd143568bd26ab109c68638`
- `by-type/pretiosa.jsonl`: `4375e5777c9a344819f46bd9fbc82826d81a1d455a9edab2d6ba46edcdc69be5`
- `by-type/psalm.jsonl`: `981d6ba3eb4a1ad0b1db4c74451cbf593c81102236bbed1c6b40de938901fdac`
- `by-type/reading.jsonl`: `90f38c7034848eb865876cfb6ef85cee028bc04d5298ec17e850b6fdda5ca10d`
- `by-type/responsory.jsonl`: `7425170d7556f10248aeec5e8dce85a525edb0fb208247a98773abbf31d8a3fd`
- `by-type/rubric.jsonl`: `71facf4f2b60b887c90c434eabf48fd3349440928728eb46482086ffb028af66`
- `by-type/te-deum.jsonl`: `d16475f524ad1e0db1035c4425e99a2363690c05eefcce7788a46730ac569ca6`
- `by-type/versicle.jsonl`: `9abfd74b58a03227351fa7e99dd7d17bdb1a12e85c1122dd6642bb5b593b143e`
- `calendar-titles.jsonl`: `7a2119ed8b43409b5e9d65cccce9ee44acb5c98c87e85e787f5e7c4cd3abfc6e`
- `corpus.jsonl`: `7b309278d523151b3ec94b23fd8dd856d8627c56c2db1e76cc9ecafb7ffeef6b`
- `index.csv`: `673303db8408aafc28b8ea36664f818aa54668c009a90874334f7280967c01d9`
- `occurrence-map.json`: `a29cc5e7ac6240996360c90eea5bfd2406d5fd6dd7b7dd3c31c0bde79827578d`
- `reports/deprecated-translations.jsonl`: `b7f00bf7f9ccf5bb87bf0f0a57772e4723bbb02f07a1b7f84c54df71684d9437`
- `source-map.json`: `bf3c5a4a16c5c324480e933211b51f3990b7629303953cfcdf0be7fc0c54dd9d`
- `translation-template.zh-Hans.jsonl`: `dcdeb5486e1ae68c01f6cfe360db2972ec3f4df02cbaf848846cc51eeeb6cbeb`
