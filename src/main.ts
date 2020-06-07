import program from 'commander'
import path from 'path'

import { Raw国会, Raw議案, Raw経過 } from './model'
import { fetchRaw, list回次 } from './webio'
import { Writer, Path } from './fileio'

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

program.parse(process.argv)
