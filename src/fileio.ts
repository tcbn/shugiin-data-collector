import path from 'path'
import fs, { read } from 'fs'
import readline from 'readline'

import { Raw国会, Raw議案, Raw経過, toRaw議案Id, 議案, 衆議院議案Data } from './model'
import { once } from 'cluster'

export class Path {
	public static toRaw回次Path = (回次: string, prefix = 'data') => `${prefix}/raw/${回次.padStart(4, '0')}`

	public static toRaw国会JsonName = () => '国会.json'

	public static toRaw国会PathBy回次 = (k: string, prefix = 'data') => `${Path.toRaw回次Path(k, prefix)}/${Path.toRaw国会JsonName()}`

	public static toRaw国会Path = (k: Raw国会, prefix = 'data') => `${Path.toRaw国会PathBy回次(k.国会回次, prefix)}`

	public static toRaw議案JsonlName = () => '議案.jsonl'

	public static toRaw議案PathBy回次 = (k: string, prefix = 'data') => `${Path.toRaw回次Path(k, prefix)}/${Path.toRaw議案JsonlName()}`

	public static toRaw議案Path = (g: Raw議案, prefix = 'data') => `${Path.toRaw議案PathBy回次(g.議案審議回次, prefix)}`

	public static toRaw経過JsonName = (k: Raw議案 | Raw経過) => '経過'
		+ '-' + path.normalize(toRaw議案Id(k))
		+ '.json'

	public static toRaw経過Path = (k: Raw議案 | Raw経過, prefix = 'data') => `${Path.toRaw回次Path(k.議案審議回次, prefix)}/${Path.toRaw経過JsonName(k)}`

	public static to議案Path = (g: 議案, prefix = 'data') => `${prefix}/gian/${g.議案Id}.json`

}

export class Writer {
	public static writeRaw国会(k: Raw国会) {
		fs.mkdirSync(Path.toRaw回次Path(k.国会回次), { recursive: true })
		fs.writeFileSync(Path.toRaw国会Path(k), JSON.stringify(k))
	}

	public static writeRaw議案(g: Raw議案) {
		fs.appendFileSync(Path.toRaw議案Path(g), JSON.stringify(g) + '\n')
	}

	public static writeRaw経過(k: Raw経過) {
		fs.writeFileSync(Path.toRaw経過Path(k), JSON.stringify(k))
	}

	public static write衆議院議案Data(g: 衆議院議案Data) {
		fs.writeFileSync(`data/衆議院議案Data.json`, JSON.stringify(g, null, 2))
	}
}

export class Reader {
	public static traverseRaw(
		start回次: number, end回次: number,
		on国会: (k: Raw国会) => void,
		on議案: (g: Raw議案) => void,
		on経過: (k: Raw経過) => void,
		prefix = 'data',
	) {
		for (let kaiji = start回次; kaiji <= end回次; kaiji++) {
			const 回次 = String(kaiji)
			on国会(Reader.readRaw国会(Path.toRaw国会PathBy回次(回次, prefix)))

			Reader.readRaw議案s(Path.toRaw議案PathBy回次(回次, prefix)).map((gian) => {
				on議案(gian)
				on経過(Reader.readRaw経過(Path.toRaw経過Path(gian, prefix)))
			})
		}
	}

	public static readRaw国会(kokkaiPath: string): Raw国会 {
		return JSON.parse(fs.readFileSync(kokkaiPath, 'utf8'))
	}

	public static readRaw経過(keikaPath: string): Raw経過 {
		return JSON.parse(fs.readFileSync(keikaPath, 'utf8'))
	}

	public static readRaw議案s(gianPath: string): Raw議案[] {
		return fs
			.readFileSync(gianPath, 'utf8')
			.trim()
			.split('\n')
			.map(e => JSON.parse(e))
	}
}