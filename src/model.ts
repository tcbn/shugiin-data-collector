export type 衆議院議案Data = {
	'国会': { [id: number]: 国会 },
	'議案': { [id: string]: 議案 }
}

export type 国会 = {
	国会Id: 国会Id,
	国会回次: 国会回次,
	国会種類: 国会種類,
}

export type 国会Id = number
export type 国会回次 = string
export enum 国会種類 {
	通常国会 = '通常国会',
	臨時国会 = '臨時国会',
	特別国会 = '特別国会',
}

export type 議案 = {
	議案Id: string,
	議案種類: 議案種類,
	議案提出国会Id: 国会Id,
	議案番号: number,
	議案件名: string,
	議案経過: 議案経過[]
}

export enum 議案種類 {
	衆法 = '衆法',
	参法 = '参法',
	閣法 = '閣法',
	予算 = '予算',
	条約 = '条約',
	承認 = '承認',
	承諾 = '承諾',
	議決 = '議決',
	決算 = '決算',
	決議 = '決議',
	規則 = '規則',
	規程 = '規程',
	国庫債務 = '国庫債務',
	国有財産 = '国有財産',
	ＮＨＫ決算 = 'ＮＨＫ決算',
	憲法八条議決案 = '憲法八条議決案',
}

export type 議案経過 = {
	議案審議国会Id: 国会Id,
	審議状況: string,
	議案提出者: string[] | undefined,
	衆議院予備審査議案受理年月日: string | undefined,
	衆議院予備付託年月日: string | undefined,
	衆議院予備付託委員会: string | undefined,
	衆議院議案受理年月日: string | undefined,
	衆議院付託年月日: string | undefined,
	衆議院付託委員会: string | undefined,
	衆議院審査終了年月日: string | undefined,
	衆議院審査結果: string | undefined,
	衆議院審議終了年月日: string | undefined,
	衆議院審議結果: string | undefined,
	衆議院審議時会派態度: string | undefined,
	衆議院審議時賛成会派: string[] | undefined,
	衆議院審議時反対会派: string[] | undefined,
	参議院予備審査議案受理年月日: string | undefined,
	参議院予備付託年月日: string | undefined,
	参議院予備付託委員会: string | undefined,
	参議院議案受理年月日: string | undefined,
	参議院付託年月日: string | undefined,
	参議院付託委員会: string | undefined,
	参議院審査終了年月日: string | undefined,
	参議院審査結果: string | undefined,
	参議院審議終了年月日: string | undefined,
	参議院審議結果: string | undefined,
	公布年月日: string | undefined,
	法律番号: number | undefined,
}

export const to議案Id = (g: 議案) => {
	return (g.議案種類)
		+ '-' + (g.議案提出国会Id.toString().padStart(4, '0'))
		+ '-' + (g.議案番号 ? g.議案番号.toString().padStart(4, '0') : '0000')
		+ '-' + (hashCode(g.議案件名).toString(16).padStart(8, '0'))
}

const hashCode = (s: string): number => {
	let hash = 0
	let i = s.length
	while (i--) {
		hash = (hash * 31 + s.charCodeAt(i)) >>> 0
	}
	return hash
}

export const toRaw議案Id = (k: Raw議案 | Raw経過) => {
	return (k.議案種類)
		+ '-' + (k.議案提出回次.padStart(4, '0'))
		+ '-' + (k.議案番号 ? k.議案番号.padStart(4, '0') : '0000')
		+ '-' + (hashCode(k.議案件名).toString(16).padStart(8, '0'))
}

const eraOffsets: { [era: string]: number } = {
	'明治': 1868 - 1,
	'大正': 1912 - 1,
	'昭和': 1926 - 1,
	'平成': 1989 - 1,
	'令和': 2019 - 1,
}

const 和暦splitter = new RegExp('(' + Object.keys(eraOffsets).join('|') + '|年|月|日)')

export const parse和暦 = (和暦: string): string | undefined => {
	if (和暦 === '') {
		return undefined
	}

	const elements = 和暦.split(和暦splitter)

	if (elements.length != 9) {
		throw `invalid format ${和暦}`
	}

	const [year, month, day] = [elements[2], elements[4], elements[6]].map(e => e.trim())
	return (eraOffsets[elements[1]] + parseInt(year))
		+ '-' + month.padStart(2, '0')
		+ '-' + day.padStart(2, '0')
}

export type Raw国会 = {
	国会回次: string,
	国会種類: 国会種類,
}

export type Raw議案 = {
	議案審議回次: string,
	議案種類: 議案種類,
	議案提出回次: string,
	議案番号: string,
	議案件名: string,
	審議状況: string,
	経過URL: string,
	本文URL: string,
}

export type Raw経過 = {
	議案審議回次: string,
	議案種類: 議案種類,
	議案提出回次: string,
	議案番号: string,
	議案件名: string,
	議案提出者: string,
	衆議院予備審査議案受理年月日: string,
	衆議院予備付託年月日: string,
	衆議院予備付託委員会: string,
	衆議院議案受理年月日: string,
	衆議院付託年月日: string,
	衆議院付託委員会: string,
	衆議院審査終了年月日: string,
	衆議院審査結果: string,
	衆議院審議終了年月日: string,
	衆議院審議結果: string,
	衆議院審議時会派態度: string,
	衆議院審議時賛成会派: string,
	衆議院審議時反対会派: string,
	参議院予備審査議案受理年月日: string,
	参議院予備付託年月日: string,
	参議院予備付託委員会: string,
	参議院議案受理年月日: string,
	参議院付託年月日: string,
	参議院付託委員会: string,
	参議院審査終了年月日: string,
	参議院審査結果: string,
	参議院審議終了年月日: string,
	参議院審議結果: string,
	公布年月日: string,
	法律番号: string,
}