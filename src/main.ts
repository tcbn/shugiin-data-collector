import program from 'commander'
import path from 'path'
import assert from 'assert'

import { Raw国会, Raw議案, Raw経過, 国会回次, 国会, 議案, toRaw議案Id, parse和暦 } from './model'
import { fetchRaw, list回次 } from './webio'
import { Writer, Reader, Path } from './fileio'
import { isUndefined } from 'util'

const packagejson: { version: string } = require("../package.json")

program
	.version(packagejson.version)
	.description('衆議院 data collector')

const gian = program
	.command('gian')
	.description('議案 data subcommand')

gian.command('list')
	.description('show 回次 that Raw議案 can fetch.')
	.action(async () => {
		const list = await list回次()
		console.log(list)
	})

gian.command('fetch <start> <end>')
	.description('fetch Raw議案 from <start> 回次 to <end> 回次.')
	.action(async (start, end) => {
		console.log(`fetch from ${start} to ${end}`)

		await fetchRaw(start, end,
			(k: Raw国会) => {
				console.log(Path.toRaw国会Path(k))
				Writer.writeRaw国会(k)
			},
			(g: Raw議案) => {
				Writer.writeRaw議案(g)
			},
			(k: Raw経過) => {
				console.log(Path.toRaw経過Path(k))
				Writer.writeRaw経過(k)
			}
		)
	})

gian.command('convert <start> <end>')
	.description('convert Raw議案 to 議案 from <start> 回次 to <end> 回次.')
	.action(async (start, end) => {
		console.log(`convert from ${start} to ${end}`)

		let 議案count = 0
		let 経過count = 0

		const out = {}

		const 国会s: { [id: number]: 国会 } = {}
		const 議案s: { [id: string]: 議案 } = {}
		const Raw議案s: { [id: string]: Raw議案 } = {}

		Reader.traverseRaw(start, end,
			(k: Raw国会) => {
				const 国会Id = parseInt(k.国会回次)
				国会s[国会Id] = { 国会Id: 国会Id, 国会回次: k.国会回次, 国会種類: k.国会種類 }
			},
			(g: Raw議案) => {
				議案count++
				const 議案Id = toRaw議案Id(g)
				Raw議案s[議案Id] = g
				if (!(議案Id in 議案s)) {
					議案s[議案Id] = {
						議案Id: 議案Id,
						議案種類: g.議案種類,
						議案提出国会Id: parseInt(g.議案提出回次),
						議案番号: g.議案番号 ? parseInt(g.議案番号) : 0,
						議案件名: g.議案件名,
						議案経過: [],
					}
				}
			},
			(k: Raw経過) => {
				経過count++
				const 議案Id = toRaw議案Id(k)
				const rg = Raw議案s[議案Id]
				assert.equal(k.議案種類, rg.議案種類)
				assert.equal(k.議案提出回次, rg.議案提出回次)
				assert.equal(k.議案審議回次, rg.議案審議回次)
				assert.equal(k.議案番号 ? k.議案番号 : '', rg.議案番号 ? rg.議案番号 : '')
				assert.equal(k.議案件名, rg.議案件名)

				const g = 議案s[議案Id]

				const xtrim = (t: string) => t === undefined || t === '' ? undefined : t

				const xsplit = (text: string, sep: string): string[] | undefined => {
					const result = text?.split(sep).map(e => e.trim()).filter(e => e !== '')
					return result?.length > 0 ? result : undefined
				}

				g.議案経過.push({
					議案審議国会Id: parseInt(k.議案審議回次),
					審議状況: rg.審議状況,
					議案提出者: xsplit(k.議案提出者, '君')?.map(e => e.replace('　', '')),
					衆議院予備審査議案受理年月日: parse和暦(k.衆議院予備審査議案受理年月日),
					衆議院予備付託年月日: parse和暦(k.衆議院予備付託年月日),
					衆議院予備付託委員会: xtrim(k.衆議院予備付託委員会),
					衆議院議案受理年月日: parse和暦(k.衆議院議案受理年月日),
					衆議院付託年月日: parse和暦(k.衆議院付託年月日),
					衆議院付託委員会: xtrim(k.衆議院付託委員会),
					衆議院審査終了年月日: parse和暦(k.衆議院審査終了年月日),
					衆議院審査結果: xtrim(k.衆議院審査結果),
					衆議院審議終了年月日: parse和暦(k.衆議院審議終了年月日),
					衆議院審議結果: xtrim(k.衆議院審議結果),
					衆議院審議時会派態度: xtrim(k.衆議院審議時会派態度),
					衆議院審議時賛成会派: xsplit(k.衆議院審議時賛成会派, ';'),
					衆議院審議時反対会派: xsplit(k.衆議院審議時反対会派, ';'),
					参議院予備審査議案受理年月日: parse和暦(k.参議院予備審査議案受理年月日),
					参議院予備付託年月日: parse和暦(k.参議院予備付託年月日),
					参議院予備付託委員会: xtrim(k.参議院予備付託委員会),
					参議院議案受理年月日: parse和暦(k.参議院議案受理年月日),
					参議院付託年月日: parse和暦(k.参議院付託年月日),
					参議院付託委員会: xtrim(k.参議院付託委員会),
					参議院審査終了年月日: parse和暦(k.参議院審査終了年月日),
					参議院審査結果: xtrim(k.参議院審査結果),
					参議院審議終了年月日: parse和暦(k.参議院審議終了年月日),
					参議院審議結果: xtrim(k.参議院審議結果),
					公布年月日: parse和暦(k.公布年月日),
					法律番号: k.法律番号 ? parseInt(k.法律番号) : undefined,
				})
			}
		)

		console.log([国会s, 議案count, 経過count])

		Writer.write衆議院議案Data({ '国会': 国会s, '議案': 議案s })
	})

program.parse(process.argv)