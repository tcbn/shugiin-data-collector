import puppeteer from 'puppeteer'

import { 国会種類, 議案種類, Raw国会, Raw議案, Raw経過 } from './model'

type Settings = {
	browserLaunch: puppeteer.LaunchOptions,
	pageGoto: puppeteer.DirectNavigationOptions,
	pageOn: { resourceTypes: puppeteer.ResourceType[] }
}
const settings: Settings = {
	browserLaunch: {
		args: [
			'--disable-dev-shm-usage',
			'--no-sandbox',
			'--disable-setuid-sandbox',
		]
	},
	pageGoto: { waitUntil: 'domcontentloaded' },
	pageOn: {
		resourceTypes: [
			'document',
		]
	}
}

type to国会種類 = { [key: string]: 国会種類 }
const to国会種類: to国会種類 = {
	'常会': 国会種類.通常国会,
	'特別会': 国会種類.特別国会,
	'臨時会': 国会種類.臨時国会,
}

type to議案MemberName = { [key: string]: string }
const to議案MemberName: to議案MemberName = {
	'GIAN.TYPE': '議案種類',
	'GIAN.KAIJI': '議案提出回次',
	'GIAN.NUMBER': '議案番号',
	'GIAN.KENMEI': '議案件名',
	'GIAN.STATUS': '審議状況',
	'GIAN.KLINK': '経過URL',
	'GIAN.HLINK': '本文URL',
}

type to議案種類 = { [caption: string]: 議案種類 }
const to議案種類: to議案種類 = {
	'衆法の一覧': 議案種類.衆法,
	'参法の一覧': 議案種類.参法,
	'閣法の一覧': 議案種類.閣法,
	'予算の一覧': 議案種類.予算,
	'条約の一覧': 議案種類.条約,
	'承認の一覧': 議案種類.承認,
	'承諾の一覧': 議案種類.承諾,
	'議決の一覧': 議案種類.議決,
	'決算その他': 議案種類.決算,
	'決議の一覧': 議案種類.決議,
	'規則の一覧': 議案種類.規則,
	'規程の一覧': 議案種類.規程,
	'憲法八条議決案の一覧': 議案種類.憲法八条議決案,
}

const extract国会 = (page: puppeteer.Page): Promise<Raw国会> => {
	return page.evaluate((to国会種類: to国会種類) => {
		const option = document.querySelector('select[name="kaiji"]>option')
		const matches = option?.textContent?.match(/第([0-9]+)回国会（(.+)）/)
		const kaiji = matches ? matches[1] : ''
		const type = to国会種類[matches ? matches[2] : '']
		return { '国会回次': kaiji, '国会種類': type }
	}, to国会種類)
}

const extract議案 = (page: puppeteer.Page, prototype: {}): Promise<Raw議案[]> => {
	return page.evaluate((to議案MemberName: to議案MemberName, to議案種類: to議案種類, prototype: object) => {
		const toPartialObject = (td: HTMLTableDataCellElement) => {
			const attr = td.getAttribute('headers') || td.getAttribute('id')
			const memberName = to議案MemberName[String(attr)]
			switch (memberName) {
				case '経過URL':
				case '本文URL':
					return { [memberName]: td.querySelector('a')?.href }
				default:
					return { [memberName]: td.textContent }
			}
		}

		return Array.from(document.querySelectorAll('tr'))
			.filter(tr => tr.querySelector('td[headers="GIAN.KAIJI"]') !== null)
			.map(tr => {
				const tbody = tr.parentElement
				const table = tbody?.parentElement
				const caption = table?.querySelector('caption')?.textContent
				const type = to議案種類[String(caption)]
				return Object.assign({},
					prototype,
					{ '議案種類': type },
					...Array.from(tr.querySelectorAll('td'), toPartialObject)
				)
			})
	}, to議案MemberName, to議案種類, prototype)
}

const extract経過 = (page: puppeteer.Page, prototype: {}): Promise<Raw経過> => {
	return page.evaluate((prototype: object) => {
		return Object.assign(
			prototype,
			...Array.from(document.querySelectorAll('tr'))
				.filter(tr => tr.querySelector('td[headers="KOMOKU"]') !== null)
				.map(tr => {
					const row = Array.from(tr.querySelectorAll('td'), td => td.textContent)
					const left = String(row[0])
					const right = String(row[1])
					if (left.indexOf('／') < 0) {
						return { [left]: right }
					} else {
						const lefts = left.split('／')
						const rights = right.split('／').map(e => e.trim())
						return { [lefts[0]]: rights[0], [lefts[1]]: rights[1] }
					}
				})
		)
	}, prototype)
}

const newPage = async (browser: puppeteer.Browser) => {
	const page = await browser.newPage()
	await page.emulate(puppeteer.devices['iPhone X'])
	await page.setRequestInterception(true)
	page.on('request', (request) => {
		if (settings.pageOn.resourceTypes.includes(request.resourceType())) {
			request.continue()
		} else {
			request.abort()
		}
	})
	return page
}

export const list回次 = async () => {
	const browser = await puppeteer.launch(settings.browserLaunch)
	const page = await newPage(browser)
	const url = 'http://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm'
	await page.goto(url, settings.pageGoto)
	const options = await page.evaluate(() => {
		return Array.from(document.querySelectorAll('select[name="kaiji"]>option'))
			.map(e => e?.textContent || '')
			.map(e => e.match(/[0-9]+/))
			.flatMap(e => e === null ? [] : [e[0]])
			.map(e => parseInt(e))
			.sort()
	})
	browser.close()
	return options
}

export const fetchRaw = async (
	start回次: number, end回次: number,
	on国会: (k: Raw国会) => void,
	on議案: (g: Raw議案) => void,
	on経過: (k: Raw経過) => void,
) => {
	const browser = await puppeteer.launch(settings.browserLaunch)

	const page = await newPage(browser)

	for (let kaiji = start回次; kaiji <= end回次; kaiji++) {
		const 回次 = String(kaiji)

		const url = `http://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/kaiji${kaiji}.htm`
		await page.goto(url, settings.pageGoto)
		const kokkai = await extract国会(page)
		on国会(kokkai)

		const gians = await extract議案(page, { 議案審議回次: 回次 })
		await Promise.all(gians.map(e => { on議案(e) }))

		for (let gian of gians) {
			await page.goto(gian.経過URL, settings.pageGoto)
			const keika = await extract経過(page, { 議案審議回次: 回次 })
			on経過(keika)
		}
	}

	browser.close()
}