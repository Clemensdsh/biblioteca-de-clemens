# 拉丁文语料提取摘要

- 提取时间（固定生产提交时间）：2026-07-22T12:32:51-04:00
- 上游 commit：`515a213f79951c563be4f599ca591c63aa63bb6d`
- 生产 commit：`10d951f5901a6d2991063763d7b7d471566c688a`
- Canonical corpus 条目：9102
- Shared block 条目：8713
- Calendar 日数 / 去重标题：365 / 354
- Release occurrence：55184
- Metadata/display occurrence：3716
- Corpus-mapped occurrence：58900
- 拉丁文字符 / 词数：3937984 / 552136
- SourceRefs 完整率：100%
- Needs classification：0
- Duplicate groups / audit groups：607 / 607
- Translation template：9102

`releaseOccurrences` 只计算原始 day/hour block occurrences；metadata/display occurrence 是 calendar title、rank、hour title 与 release 外静态拉丁文标题的独立出现位置，不会冒充礼文 block。

## 按类型

| Type | 条目 | 字符 |
| --- | ---: | ---: |
| absolution | 5 | 2419 |
| antiphon | 2948 | 316297 |
| blessing | 44 | 5933 |
| canticle | 28 | 38089 |
| capitulum | 315 | 75123 |
| chapter-office | 1 | 1191 |
| commemoration | 67 | 35635 |
| dialogue | 22 | 7415 |
| heading | 392 | 19246 |
| hymn | 125 | 74743 |
| invitatory | 71 | 88878 |
| marian-antiphon | 4 | 2406 |
| martyrology | 360 | 589427 |
| matins-responsory | 736 | 324394 |
| prayer | 1723 | 805592 |
| pretiosa | 1 | 221 |
| psalm | 414 | 505847 |
| reading | 1350 | 977989 |
| responsory | 134 | 30093 |
| rubric | 70 | 10316 |
| te-deum | 1 | 1534 |
| versicle | 291 | 25196 |

## 按优先级

| Priority | 条目 | 字符 |
| --- | ---: | ---: |
| core | 582 | 201640 |
| high | 489 | 96112 |
| low | 3774 | 1495503 |
| metadata | 389 | 19210 |
| normal | 3802 | 2115362 |
| rubric | 66 | 10157 |

## 输出哈希

- `by-type/absolution.jsonl`: `ea4f96418a3b1dc77deb163ed69f79e9aa04ab8cab6efe2ee115ae28967aee0a`
- `by-type/antiphon.jsonl`: `ef7648a44e01ea6f4416f51d0e164d65d308caa578a0be61d023c4f703398b29`
- `by-type/blessing.jsonl`: `b0e972dac73fb3c214b1dae67ab8cc86a90d256a906c2cd3c2983e98d6302cc9`
- `by-type/canticle.jsonl`: `0182ce81381405acb42104c67e4a5336f7c35e20c736463e8a004763ea046dbd`
- `by-type/capitulum.jsonl`: `6794116f68884faf7495361c02fd0b3eb2602c7766393e2e1c47a0bdcdceb0b8`
- `by-type/chapter-office.jsonl`: `69737ab97e5b5faaf31ce1a6063a5eb5bdcd3106db0f3b608cc2ca2944460632`
- `by-type/commemoration.jsonl`: `b64f604fca64bec9440339ec5294a7860c37cf33894647cedf6b6619861b6621`
- `by-type/dialogue.jsonl`: `3d9dc312affebd344532f34b3f718e245d2e77ea28b7294c176b7663762177c3`
- `by-type/heading.jsonl`: `ada974094bf991e7c69eaef99c0bd26af9deedffe09a0f99b764ebcb6a738423`
- `by-type/hymn.jsonl`: `5356a74646d93a09444b94b861fa4269dd263858a9cbbeeafa531322fbe7686d`
- `by-type/invitatory.jsonl`: `4578c5466021faed2dcadbbf78ce35027379f7ad9969f1ace78e7a012923eeaa`
- `by-type/martyrology-placeholder.jsonl`: `034fa66692c70a6b2669380e54f4de660ce9e04b7aa21e45709349ea3adb8518`
- `by-type/other.jsonl`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `by-type/prayer.jsonl`: `e5c8a4a8e44181217a996a65a29794c0c7f27045c2d7270eccfb6b51886f0df8`
- `by-type/pretiosa.jsonl`: `4375e5777c9a344819f46bd9fbc82826d81a1d455a9edab2d6ba46edcdc69be5`
- `by-type/psalm.jsonl`: `e6502f2bde844424078840cd06d2b6662f53030edc0041f1ed051f936c9f12eb`
- `by-type/reading.jsonl`: `90f38c7034848eb865876cfb6ef85cee028bc04d5298ec17e850b6fdda5ca10d`
- `by-type/responsory.jsonl`: `7425170d7556f10248aeec5e8dce85a525edb0fb208247a98773abbf31d8a3fd`
- `by-type/rubric.jsonl`: `424b589b6751da2ec91803921e8566e3fd914011d81e16de9bc3f8289f4f6400`
- `by-type/te-deum.jsonl`: `d16475f524ad1e0db1035c4425e99a2363690c05eefcce7788a46730ac569ca6`
- `by-type/versicle.jsonl`: `9dc4f819c934e3b8421ca05b40b81522030ceda6e197b7bb289ecf9753c7e4fe`
- `calendar-titles.jsonl`: `d7bbc43b0d6f84ea8529c533c142efa328b3619b46c5cac50b06c81dc004afa1`
- `corpus.jsonl`: `b9f0baf6893ce025d50225e812e3209296236ccc61665e6ec4e0898b85bfee9a`
- `index.csv`: `a4f6961f21d9d78c37127d4ad1cc08f5818145cd5e0dbd4a36cca332976ec334`
- `occurrence-map.json`: `f00159099a767debd24b2c09439586f3257bf3c39f3036e8eb579b1622e62e85`
- `reports/deprecated-translations.jsonl`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `source-map.json`: `1404ada30c435582b2226db911de6ceab0970a9ff0c984f360b6ad1bbc0baacb`
- `translation-template.zh-Hans.jsonl`: `186ab0ddb08b10f6d21866b1e1308f1b6bd3a3c16c8788efdc508a25f69a1a8c`
