// 旧约颂歌逐行中文：数据在 resources/officium1962-ot-canticles/lines.json（可由 agy/人工直接编辑）。
// 底本：思高圣经（《思高本.epub》，sigao-epub-ot.json），与 1962 拉丁通行本不同处按拉丁文改写、加粗并注释；
// 另参考时辰礼仪中文。lines.json 每项：ref 节号，prefix 拉丁行首（用来定位数据里的一行），zh 中文（" * " 为半句分隔，** 为改动处），notes 注释数组。
import fs from 'node:fs'
import path from 'node:path'
import { root } from './psalms-zh-lib.mjs'

const lines = JSON.parse(fs.readFileSync(path.join(root, 'resources/officium1962-ot-canticles/lines.json'), 'utf8'))
export const OT_CANTICLES = lines.map((l) => [l.ref, l.prefix, l.zh, l.notes])
export const OT_CANTICLES_B = []
