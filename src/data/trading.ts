export type PricePoint = {
  date: string
  time: string
  index: number
  dayAheadPrice: number
  realTimePrice: number
  spread: number
}

export type PriceDay = {
  date: string
  points: PricePoint[]
  dayAheadAvg: number
  realTimeAvg: number
  dayAheadMin: number
  dayAheadMax: number
  realTimeMin: number
  realTimeMax: number
  absSpreadAvg: number
  zeroPriceCount: number
  noonZeroPriceCount: number
}

export type TradingStation = {
  name: string
  city: string
  gridType: string
  capacityMw: number
  tradableMwh: number
  tradedMwh: number
  dealPrice: number
  marketPrice: number
  upliftRate: number
  revenueLift: number
}

export type RevenueBreakdown = {
  label: string
  value: number
  unit: string
  color: string
}

export type TradingStrategy = {
  name: string
  style: string
  volume: number
  targetPrice: number
  expectedRevenue: number
  risk: string
  confidence: number
}

const rawPriceFiles = import.meta.glob('../../electricity_price_data/*.csv', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const fallbackRawCsv = `时间,日前出清价格,实时出清价格
00:15,333.93,357.39
00:30,321.41,364.83
00:45,319.03,350.91
01:00,314.26,323.65
01:15,300.95,320.73
01:30,304.74,319.83
01:45,304.74,329.51
02:00,307.59,325.57
02:15,311.39,320.78
02:30,304.74,316.70
02:45,303.93,332.00
03:00,303.93,330.28
03:15,303.93,322.45
03:30,303.93,321.12
03:45,302.18,310.64
04:00,298.66,306.38
04:15,296.21,301.14
04:30,288.54,290.42
04:45,281.73,286.31
05:00,276.4,281.82
05:15,265.32,276.16
05:30,258.18,268.83
05:45,246.71,260.47
06:00,236.2,253.76
06:15,221.5,246.82
06:30,208.34,238.16
06:45,196.2,225.41
07:00,178.45,214.26
07:15,165.32,202.18
07:30,148.4,186.2
07:45,126.8,164.9
08:00,98.5,142.6
08:15,74.3,118.2
08:30,42.6,82.8
08:45,18.4,54.2
09:00,0,22.8
09:15,0,12.4
09:30,0,0
09:45,0,0
10:00,0,0
10:15,0,0
10:30,0,0
10:45,0,0
11:00,0,0
11:15,0,0
11:30,0,0
11:45,0,0
12:00,0,0
12:15,0,0
12:30,0,0
12:45,0,0
13:00,0,0
13:15,0,0
13:30,0,0
13:45,0,0
14:00,0,0
14:15,0,8.6
14:30,0,16.8
14:45,12.4,28.1
15:00,34.2,52.6
15:15,68.4,86.2
15:30,102.6,126.8
15:45,145.8,172.4
16:00,196.3,215.6
16:15,236.7,254.2
16:30,268.9,286.4
16:45,296.2,312.6
17:00,318.4,336.7
17:15,329.6,345.3
17:30,336.8,354.4
17:45,342.09,360.5
18:00,338.2,364.83
18:15,332.4,358.7
18:30,326.8,352.1
18:45,320.6,345.2
19:00,316.4,336.8
19:15,310.2,328.6
19:30,306.5,320.4
19:45,302.4,315.2
20:00,296.4,307.8
20:15,286.2,296.6
20:30,276.4,286.8
20:45,268.2,276.4
21:00,258.6,266.2
21:15,248.4,256.7
21:30,238.2,246.5
21:45,228.4,236.2
22:00,218.6,228.4
22:15,210.2,218.8
22:30,204.6,212.2
22:45,198.4,206.1
23:00,192.8,200.2
23:15,186.4,194.6
23:30,180.2,188.4
23:45,174.6,182.2
00:00,170.4,178.5`

function toNumber(value: string) {
  const normalized = Number(value?.trim())
  return Number.isFinite(normalized) ? normalized : 0
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function round(value: number, precision = 2) {
  return Number(value.toFixed(precision))
}

function parseDateFromPath(path: string, fallback: string) {
  return path.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? fallback
}

function parsePriceCsv(raw: string, date: string): PricePoint[] {
  const lines = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.slice(1).map((line, index) => {
    const [time, dayAheadPrice, realTimePrice] = line.split(',')
    const dayAhead = toNumber(dayAheadPrice)
    const realTime = toNumber(realTimePrice)

    return {
      date,
      time,
      index,
      dayAheadPrice: dayAhead,
      realTimePrice: realTime,
      spread: round(realTime - dayAhead),
    }
  })
}

function createPriceDay(date: string, points: PricePoint[]): PriceDay {
  const dayAheadPrices = points.map((item) => item.dayAheadPrice)
  const realTimePrices = points.map((item) => item.realTimePrice)
  const spreads = points.map((item) => Math.abs(item.spread))
  const noonPoints = points.filter((item) => {
    const hour = Number(item.time.split(':')[0])
    return hour >= 10 && hour < 15
  })

  return {
    date,
    points,
    dayAheadAvg: round(average(dayAheadPrices)),
    realTimeAvg: round(average(realTimePrices)),
    dayAheadMin: round(Math.min(...dayAheadPrices)),
    dayAheadMax: round(Math.max(...dayAheadPrices)),
    realTimeMin: round(Math.min(...realTimePrices)),
    realTimeMax: round(Math.max(...realTimePrices)),
    absSpreadAvg: round(average(spreads)),
    zeroPriceCount: points.filter((item) => item.dayAheadPrice === 0 || item.realTimePrice === 0).length,
    noonZeroPriceCount: noonPoints.filter((item) => item.dayAheadPrice === 0 || item.realTimePrice === 0).length,
  }
}

const parsedPriceDays = Object.entries(rawPriceFiles)
  .map(([path, raw]) => {
    const date = parseDateFromPath(path, '2026-05-06')
    return createPriceDay(date, parsePriceCsv(raw, date))
  })
  .sort((a, b) => a.date.localeCompare(b.date))

export const priceDays =
  parsedPriceDays.length > 0
    ? parsedPriceDays
    : [createPriceDay('2026-05-06', parsePriceCsv(fallbackRawCsv, '2026-05-06'))]

export const latestPriceDay = priceDays[priceDays.length - 1]

export const priceDayLabels = priceDays.map((item) => item.date.slice(5))

export const marketBenchmarkPrice = round(average(priceDays.map((item) => item.dayAheadAvg)))

export const recentMarketSeries = {
  dayAheadAvg: priceDays.map((item) => item.dayAheadAvg),
  realTimeAvg: priceDays.map((item) => item.realTimeAvg),
  spreadAvg: priceDays.map((item) => item.absSpreadAvg),
}

export const stationRows: TradingStation[] = [
  {
    name: '安徽瑞隆分布式光伏电站',
    city: '合肥',
    gridType: '全额上网',
    capacityMw: 18.6,
    tradableMwh: 94.2,
    tradedMwh: 88.5,
    dealPrice: 423.6,
    marketPrice: marketBenchmarkPrice,
    upliftRate: 8.7,
    revenueLift: 18.4,
  },
  {
    name: '肥西零重力分布式光伏电站',
    city: '合肥',
    gridType: '余电上网',
    capacityMw: 14.8,
    tradableMwh: 72.4,
    tradedMwh: 69.1,
    dealPrice: 418.2,
    marketPrice: marketBenchmarkPrice,
    upliftRate: 7.3,
    revenueLift: 12.6,
  },
  {
    name: '淮北电子产业园分布式光伏电站',
    city: '淮北',
    gridType: '全额上网',
    capacityMw: 21.3,
    tradableMwh: 108.6,
    tradedMwh: 101.8,
    dealPrice: 429.8,
    marketPrice: marketBenchmarkPrice,
    upliftRate: 9.5,
    revenueLift: 22.1,
  },
  {
    name: '南京熊猫一期分布式光伏电站',
    city: '南京',
    gridType: '余电上网',
    capacityMw: 16.2,
    tradableMwh: 76.8,
    tradedMwh: 72.7,
    dealPrice: 412.9,
    marketPrice: marketBenchmarkPrice,
    upliftRate: 6.8,
    revenueLift: 10.9,
  },
  {
    name: '无锡惠山装备园分布式光伏电站',
    city: '无锡',
    gridType: '全额上网',
    capacityMw: 12.5,
    tradableMwh: 58.2,
    tradedMwh: 55.4,
    dealPrice: 416.4,
    marketPrice: marketBenchmarkPrice,
    upliftRate: 7.1,
    revenueLift: 8.6,
  },
]

export const revenueBreakdown: RevenueBreakdown[] = [
  { label: '电能量交易收益', value: 286.4, unit: '万元', color: '#35f2a6' },
  { label: '绿电/绿证增益', value: 36.8, unit: '万元', color: '#75d7ff' },
  { label: '辅助服务/响应', value: 18.6, unit: '万元', color: '#ffc857' },
  { label: '偏差考核抵扣', value: -6.3, unit: '万元', color: '#ff7a90' },
]

export const tradingStrategies: TradingStrategy[] = [
  {
    name: '保守型',
    style: '低偏差优先',
    volume: 312.6,
    targetPrice: 365,
    expectedRevenue: 114.1,
    risk: '低',
    confidence: 91,
  },
  {
    name: '均衡型',
    style: '收益/风险平衡',
    volume: 356.8,
    targetPrice: 386,
    expectedRevenue: 137.7,
    risk: '中',
    confidence: 86,
  },
  {
    name: '进取型',
    style: '高价窗口增报',
    volume: 392.4,
    targetPrice: 412,
    expectedRevenue: 161.7,
    risk: '中高',
    confidence: 78,
  },
]
