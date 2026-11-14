# 历史会话归档索引（预审，迁移未完成）

本索引只供追溯；新会话不应自动读取原始 JSONL。候选是宽松路径/主题命中，不等于每项都属于网站。记录级索引及原文件位置位于 `C:\Users\Cleme\ccremote-quota-audit-2026-11-13\project-migration\record-index.jsonl`；应按 session、UUID、来源和行号查证。VPS 原始路径映射见同目录 `remote-inventory.json`。文件可能含用户隐私，项目内只存本索引，不复制原始会话或摘要正文。

`remote` 指从 VPS 只读复制的候选、`mirror` 指本机 cc-remote 会话目录、`native` 指本机 .claude 目录；同一 ID 不代表各副本完全一致，差异见记录级索引。`agent-*` 为子代理记录单位，不能统计为独立主会话。

| ID | 来源 | 首末 UTC | 主题与归属 |
|---|---|---|---|
| `00525f7a-78ba-42b0-9c0e-962aeb5ba1a1` | mirror, native, remote | 2026-10-27T01:14:10.873Z – 2026-11-04T15:14:33.110Z | 哥特日课源文本及网站试验组件（关联项目） |
| `18e5ff86-fe6d-42ce-9b91-0a8d1a99b50e` | native | 2026-10-26T04:16:51.476Z – 2026-11-03T04:32:55.655Z | 1962 夜课经单行本项目，只有路径引用；独立项目，待排除 |
| `bc5847c7-7d87-40a2-9df0-92aa2d4677bb` | native | 2026-10-05T23:13:45.838Z – 2026-10-11T02:40:28.016Z | LH-Local-Handoff 上游；含 53 个候选子代理，目标于 10 月 11 日收缩（关联） |
| `c8b5a1e3-1ce7-4676-9752-fba93fc321ab` | mirror, native, remote | 2026-10-26T23:42:08.182Z – 2026-11-06T03:52:35.711Z | 新礼时辰上游方法与网站集成、双语数据和发布决策（关联项目） |
| `e7c714af-1934-4d32-a781-75f38d277b69` | mirror, remote | 2026-11-10T23:05:56.010Z – 2026-11-12T06:57:25.685Z | 域名/SSH/其他基础设施，非网站项目任务；不要迁入项目工作记忆 |
| `e7e88082-101d-4d49-b146-dd85f552c02a` | remote | 2026-11-11T14:38:22.325Z – 2026-11-12T06:40:06.209Z | Android 日课 App（另一主机/仓库），引用网站组件；仅作为关联工作 |
| `f8bd0edb-a6d5-455e-8cf3-8fb9042cd69e` | mirror, native, remote | 2026-11-04T15:14:38.854Z – 2026-11-09T04:06:20.472Z | 哥特日课交接、网站入口及后续云任务（关联项目） |
| `fcb21c05-fede-4af1-84fe-870cc36a7e11` | mirror, remote | 2026-11-10T20:48:26.399Z – 2026-11-13T17:26:34.916Z | 网站信息架构、双语时辰礼仪、11 月 OCR 试做及额度中断前最后任务（核心） |
| `agent-a0643ea7f131b25c6` | native | 2026-10-06T15:57:41.145Z – 2026-10-06T16:00:23.778Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a06d128f972f684a3` | native | 2026-10-06T15:09:46.486Z – 2026-10-06T15:12:59.572Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a122419bcdb78ed45` | native | 2026-10-06T16:08:53.519Z – 2026-10-06T16:13:53.603Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a137c71d37e6f3209` | native | 2026-10-07T16:42:36.380Z – 2026-10-07T16:48:58.060Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a166fca99c51246a9` | native | 2026-10-07T09:11:24.193Z – 2026-10-07T09:14:01.393Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a16721ec06103e0a2` | native | 2026-10-09T08:47:50.856Z – 2026-10-09T09:13:55.079Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a1a9f7b4e659e4d7f` | native | 2026-10-07T09:17:59.150Z – 2026-10-07T09:19:18.221Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a1d4e1bbd091a9cc1` | native | 2026-10-05T23:18:59.854Z – 2026-10-05T23:19:25.566Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a2354aea0668fd618` | native | 2026-10-07T16:33:28.100Z – 2026-10-07T16:48:57.790Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a2d8b29136a6f4eb8` | native | 2026-10-09T04:04:49.106Z – 2026-10-09T04:16:34.520Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a2ee8fc1718a10576` | native | 2026-10-09T04:17:23.941Z – 2026-10-09T04:29:22.095Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a38da80b522eac0c7` | native | 2026-10-06T15:57:41.159Z – 2026-10-06T16:02:19.648Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a3c23d53469f6277d` | native | 2026-10-07T16:33:28.114Z – 2026-10-07T16:48:57.913Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a40686d83d672385d` | native | 2026-10-07T02:06:35.037Z – 2026-10-07T02:35:45.467Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a4199f29b91015c20` | native | 2026-10-05T23:18:59.834Z – 2026-10-05T23:31:24.666Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a454b65c69a73dbab` | native | 2026-10-09T12:50:20.898Z – 2026-10-09T12:57:47.837Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a4712bafa77d663e9` | native | 2026-10-09T13:18:29.487Z – 2026-10-09T13:40:38.252Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a49102f317d2e9a45` | native | 2026-10-07T10:55:54.180Z – 2026-10-07T11:00:27.787Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a4b49d5f9b48dcbda` | native | 2026-10-06T16:24:43.776Z – 2026-10-06T16:27:05.176Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a534558fb0b925e3e` | native | 2026-10-06T15:36:07.299Z – 2026-10-06T15:36:54.584Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a57b62cb8395b4636` | native | 2026-10-06T15:22:08.955Z – 2026-10-06T15:53:54.842Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a5b02ba29da2a1d3e` | native | 2026-10-06T16:14:15.639Z – 2026-10-06T16:20:43.322Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a5b841baee8d902bf` | native | 2026-10-09T06:57:05.062Z – 2026-10-09T07:10:23.097Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a5e985294bcbe4314` | native | 2026-10-07T01:14:57.727Z – 2026-10-07T01:18:57.782Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a618f6f46a19ea3ab` | native | 2026-10-07T01:00:44.318Z – 2026-10-07T01:13:24.279Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a6350e74bce0a5b25` | native | 2026-10-06T15:12:16.924Z – 2026-10-06T15:22:11.555Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a664839d2a744b852` | native | 2026-10-06T16:02:41.104Z – 2026-10-06T16:08:03.641Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a7397bca5e4a3679e` | native | 2026-10-07T02:36:09.633Z – 2026-10-07T03:05:31.427Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a74f55da18073bcae` | native | 2026-10-07T09:50:19.800Z – 2026-10-07T09:54:20.923Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a7f2e2d02b1749aeb` | native | 2026-10-09T08:21:05.400Z – 2026-10-09T08:45:44.225Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a8472e947e1ac74a5` | native | 2026-10-06T15:12:16.940Z – 2026-10-06T15:22:11.849Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a97e05b867846d7eb` | native | 2026-10-06T15:12:16.933Z – 2026-10-06T15:51:55.960Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a98b1d4c791b6b321` | native | 2026-10-07T16:34:54.399Z – 2026-10-07T16:41:54.617Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-a9c971f73a5a79260` | native | 2026-10-09T04:30:42.210Z – 2026-10-09T04:40:40.770Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aa4b283540eb64a1a` | native | 2026-10-09T07:51:32.651Z – 2026-10-09T08:04:30.314Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aa50a031cf98f2330` | native | 2026-10-09T04:50:55.034Z – 2026-10-09T04:58:37.602Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aa96734a0246cf065` | native | 2026-10-07T01:40:07.143Z – 2026-10-07T02:05:42.453Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aab2810158f1e47c1` | native | 2026-10-09T04:04:34.447Z – 2026-10-10T14:56:19.512Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aad210ca13c869e49` | native | 2026-10-07T16:33:46.979Z – 2026-10-07T16:48:57.790Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aad724adf9e994b52` | native | 2026-10-09T04:39:29.232Z – 2026-10-10T14:56:18.304Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aaddcd1b164332d4f` | native | 2026-10-06T16:21:51.754Z – 2026-10-06T16:24:20.596Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-ab092b97aa15ff11e` | native | 2026-10-09T04:59:08.094Z – 2026-10-09T05:07:48.288Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-ab1ec679951eb520d` | native | 2026-10-05T23:31:22.747Z – 2026-10-05T23:32:50.877Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-ac7147ef9321fa86f` | native | 2026-10-07T11:00:53.204Z – 2026-10-07T12:00:56.251Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-acd43ec659912e2bf` | native | 2026-10-07T09:25:09.037Z – 2026-10-07T09:31:18.997Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-ad523c5a58d525172` | native | 2026-10-06T15:17:20.508Z – 2026-10-06T15:21:26.796Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-adc43b39e2b76a29a` | native | 2026-10-07T01:14:57.707Z – 2026-10-08T02:10:32.059Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-addb2436e99c0612f` | native | 2026-10-06T15:36:23.841Z – 2026-10-06T15:51:02.060Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-adf8d222d64ed8ff1` | native | 2026-10-07T09:29:44.391Z – 2026-10-07T09:33:35.917Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-ae842c5e7b4627de0` | native | 2026-10-07T10:25:51.158Z – 2026-10-07T10:37:48.143Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-aed27c2f57a9fb9e2` | native | 2026-10-06T15:51:41.363Z – 2026-10-06T15:56:35.648Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-af743f91d0c1fa2c4` | native | 2026-10-09T05:56:07.115Z – 2026-10-09T06:10:13.709Z | LH-Local-Handoff 子代理，任务语义待复核 |
| `agent-afab7987e1b168e24` | native | 2026-10-07T10:44:41.833Z – 2026-10-07T10:46:21.808Z | LH-Local-Handoff 子代理，任务语义待复核 |
