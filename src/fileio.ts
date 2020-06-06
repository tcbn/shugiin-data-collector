import path from 'path'
import fs from 'fs'

import { Raw議案, Raw経過 } from './model'

export class Path {
	public static toRaw回次Path = (回次: string, prefix = 'data') => `${prefix}/raw/第${回次.padStart(4, '0')}回国会`

	public static toRaw議案JsonlName = (g: Raw議案) => '議案.jsonl'

	public static toRaw議案Path = (g: Raw議案, prefix = 'data') => `${Path.toRaw回次Path(g.議案審議回次, prefix)}/${Path.toRaw議案JsonlName(g)}`

	public static toRaw経過JsonName = (k: Raw議案 | Raw経過) => '経過'
		+ '-' + (k.議案種類)
		+ '-' + (k.議案提出回次.padStart(4, '0'))
		+ '-' + (k.議案番号 ? k.議案番号.padStart(4, '0') : '0000')
		+ '-' + (path.normalize(k.議案件名))
		+ '.json'

	public static toRaw経過Path = (k: Raw議案 | Raw経過, prefix = 'data') => `${Path.toRaw回次Path(k.議案審議回次, prefix)}/${Path.toRaw経過JsonName(k)}`
}

export class Writer {
	public static writeRaw回次(k: string) {
		fs.mkdirSync(Path.toRaw回次Path(k), { recursive: true })
	}

	public static writeRaw議案(g: Raw議案) {
		fs.appendFileSync(Path.toRaw議案Path(g), JSON.stringify(g) + '\n')
	}

	public static writeRaw経過(k: Raw経過) {
		fs.writeFileSync(Path.toRaw経過Path(k), JSON.stringify(k))
	}
}