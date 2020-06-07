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

export enum 国会種類 {
	通常国会 = '通常国会',
	臨時国会 = '臨時国会',
	特別国会 = '特別国会',
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