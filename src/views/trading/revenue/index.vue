<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import autofit from 'autofit.js'
import type { EChartsOption, TooltipComponentOption } from 'echarts'
import Chart from '@/components/chart/chart.vue'
import {
  latestPriceDay,
  marketBenchmarkPrice,
  priceDayLabels,
  recentMarketSeries,
  stationRows,
} from '@/data/trading'

const formatPrice = (value: number) => value.toFixed(1)

const totalTradedMwh = computed(() =>
  stationRows.reduce((sum, item) => sum + item.tradedMwh, 0),
)
const avgDealPrice = computed(() => {
  const traded = totalTradedMwh.value || 1
  return stationRows.reduce((sum, item) => sum + item.dealPrice * item.tradedMwh, 0) / traded
})
const upliftRate = computed(() => ((avgDealPrice.value - marketBenchmarkPrice) / marketBenchmarkPrice) * 100)

const kpiItems = computed(() => [
  { label: '代理场站数量', value: '43', unit: '座' },
  { label: '代理装机容量', value: '421.55', unit: 'MW' },
  { label: '今日预测上网电量', value: '1,286.4', unit: 'MWh' },
  { label: '累计交易电量', value: '38,624', unit: 'MWh' },
  { label: '综合成交均价', value: formatPrice(avgDealPrice.value), unit: '元/MWh' },
  { label: '市场均价', value: formatPrice(marketBenchmarkPrice), unit: '元/MWh' },
  { label: '较市场均价提升', value: `+${upliftRate.value.toFixed(1)}`, unit: '%' },
  { label: '累计增收金额', value: '1,286.8', unit: '万元' },
])

const tradeSteps = [
  { name: '气象采集', time: '07:30', rate: 100 },
  { name: '发电预测', time: '08:10', rate: 98 },
  { name: '价格研判', time: '08:35', rate: 96 },
  { name: '策略生成', time: '09:05', rate: 95 },
  { name: '申报执行', time: '10:20', rate: 100 },
  { name: '出清跟踪', time: '14:15', rate: 92 },
  { name: '结算复盘', time: 'T+1', rate: 88 },
]

const darkTooltipStyle: TooltipComponentOption = {
  show: true,
  confine: true,
  backgroundColor: 'rgba(6, 19, 31, 0.96)',
  borderColor: 'rgba(91, 215, 255, 0.42)',
  borderWidth: 1,
  axisPointer: {
    type: 'cross',
    lineStyle: {
      color: 'rgba(117, 215, 255, 0.42)',
    },
    crossStyle: {
      color: 'rgba(117, 215, 255, 0.42)',
    },
  },
  textStyle: {
    color: '#d9f6ff',
    fontSize: 11,
  },
}

type WeatherSnapshot = {
  weather: string
  temperature: number
  apparentTemperature: number
  irradiance: number
  humidity: number
  cloudCover: number
  windSpeed: number
  source: string
}

const weatherSnapshot = ref<WeatherSnapshot>({
  weather: '多云',
  temperature: 27.4,
  apparentTemperature: 29.1,
  irradiance: 812,
  humidity: 58,
  cloudCover: 32,
  windSpeed: 3.6,
  source: '展示兜底',
})

const weatherCodeMap: Record<number, string> = {
  0: '晴',
  1: '晴间多云',
  2: '局部多云',
  3: '阴',
  45: '雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '强毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  80: '阵雨',
  95: '雷雨',
}

const fetchWeatherSnapshot = async () => {
  try {
    const params = new URLSearchParams({
      latitude: '31.82',
      longitude: '117.23',
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m',
      hourly: 'shortwave_radiation',
      timezone: 'Asia/Shanghai',
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
    if (!response.ok) return
    const data = await response.json()
    const current = data.current ?? {}
    const hourlyTime = (data.hourly?.time ?? []) as string[]
    const hourlyIrradiance = (data.hourly?.shortwave_radiation ?? []) as number[]
    const currentHourIndex = Math.max(
      0,
      hourlyTime.findIndex((time) => String(current.time ?? '').slice(0, 13) === String(time).slice(0, 13)),
    )
    const irradiance = hourlyIrradiance[currentHourIndex] ?? weatherSnapshot.value.irradiance

    weatherSnapshot.value = {
      weather: weatherCodeMap[Number(current.weather_code)] ?? '多云',
      temperature: Number(current.temperature_2m ?? weatherSnapshot.value.temperature),
      apparentTemperature: Number(current.apparent_temperature ?? weatherSnapshot.value.apparentTemperature),
      irradiance: Number(irradiance),
      humidity: Number(current.relative_humidity_2m ?? weatherSnapshot.value.humidity),
      cloudCover: Number(current.cloud_cover ?? weatherSnapshot.value.cloudCover),
      windSpeed: Number(current.wind_speed_10m ?? weatherSnapshot.value.windSpeed),
      source: '实时',
    }
  } catch {
    weatherSnapshot.value = {
      ...weatherSnapshot.value,
      source: '展示兜底',
    }
  }
}

const latestPriceLabels = latestPriceDay.points.map((item) => item.time)

const weatherPredictedPrices = computed(() => {
  const irradianceFactor = Math.min(1.18, Math.max(0.72, weatherSnapshot.value.irradiance / 760))
  const cloudPenalty = weatherSnapshot.value.cloudCover / 100

  return latestPriceDay.points.map((item, index) => {
    const hour = index / 4
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    const pvPressure = daylight * (irradianceFactor - cloudPenalty * 0.32)
    const weatherDelta = (0.58 - pvPressure) * 38
    return Number(Math.max(0, item.dayAheadPrice * 0.35 + item.realTimePrice * 0.65 + weatherDelta).toFixed(1))
  })
})

const priceMonitorStats = computed(() => {
  const predicted = weatherPredictedPrices.value
  const nextHigh = Math.max(...predicted.slice(64, 76))
  const noonLow = Math.min(...predicted.slice(40, 58))

  return [
    {
      label: '天气',
      value: weatherSnapshot.value.weather,
      detail: `${weatherSnapshot.value.source}`,
      tone: 'cyan',
    },
    {
      label: '气温',
      value: `${weatherSnapshot.value.temperature.toFixed(1)}℃`,
      detail: `体感 ${weatherSnapshot.value.apparentTemperature.toFixed(1)}℃`,
      tone: 'blue',
    },
    {
      label: '辐照度',
      value: `${Math.round(weatherSnapshot.value.irradiance)}`,
      detail: 'W/m2',
      tone: 'green',
    },
    {
      label: '未来2小时走势',
      value: noonLow < 80 ? '低价延续' : '震荡回升',
      detail: `云量 ${weatherSnapshot.value.cloudCover.toFixed(0)}% / 风速 ${weatherSnapshot.value.windSpeed.toFixed(1)}m/s`,
      tone: 'gold',
    },
    {
      label: '实时报价策略',
      value: nextHigh > 300 ? '高峰增报' : '稳态跟随',
      detail: nextHigh > 300 ? '锁定晚峰价差' : '按预测曲线滚动校准',
      tone: 'red',
    },
  ]
})

const agentWorkflow = [
  { title: '光伏出力计划已获取', time: '11:03', detail: '43 座代理场站接入', status: 'done' },
  { title: '风电出力计划已获取', time: '11:03', detail: '区域新能源边界同步', status: 'done' },
  { title: '水电出力计划已获取', time: '11:03', detail: '补充省间调节能力', status: 'done' },
  { title: '联络线计划已获取', time: '11:05', detail: '跨区送受电边界确认', status: 'done' },
  { title: '省调负荷计划正在获取', time: '监听中', detail: '从电力交易中心数据读取中', status: 'running' },
  { title: '竞价空间（96点）等待计算', time: '队列中', detail: '等待最新负荷与天气因子', status: 'pending' },
  { title: 'CosineSimilarity 等待计算', time: '队列中', detail: '匹配历史相似日价格形态', status: 'pending' },
  { title: '输出预测的电价曲线', time: '待生成', detail: '形成实时报价策略建议', status: 'pending' },
]

const priceTrendOption = computed<EChartsOption>(() => ({
  color: ['#58d9ff', '#35f2a6', '#ffc857'],
  tooltip: {
    ...darkTooltipStyle,
    trigger: 'axis',
    valueFormatter: (value) => `${Number(value).toFixed(1)} 元/MWh`,
  },
  legend: {
    top: 0,
    right: 0,
    itemWidth: 12,
    itemHeight: 6,
    textStyle: {
      color: '#b8d8e8',
      fontSize: 10,
    },
  },
  grid: {
    top: 34,
    left: 42,
    right: 12,
    bottom: 24,
  },
  xAxis: {
    data: priceDayLabels,
    axisLabel: {
      color: '#91abba',
      fontSize: 9,
    },
  },
  yAxis: {
    name: '元/MWh',
    nameTextStyle: {
      color: '#75d7ff',
      fontSize: 9,
      padding: [0, 22, 0, 0],
    },
    axisLabel: {
      color: '#91abba',
      fontSize: 9,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(117, 215, 255, 0.12)',
        type: 'dashed',
      },
    },
  },
  series: [
    {
      name: '日前均价',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: recentMarketSeries.dayAheadAvg,
    },
    {
      name: '实时均价',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: recentMarketSeries.realTimeAvg,
    },
    {
      name: '代理成交',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: recentMarketSeries.dayAheadAvg.map((value, index) =>
        Number((value * (1.05 + index * 0.004)).toFixed(1)),
      ),
      areaStyle: {
        color: 'rgba(255, 200, 87, 0.1)',
      },
    },
  ],
}))

const realTimePriceOption = computed<EChartsOption>(() => ({
  color: ['#35f2a6', '#58d9ff', '#ffc857'],
  tooltip: {
    ...darkTooltipStyle,
    trigger: 'axis',
    valueFormatter: (value) => `${Number(value).toFixed(1)} 元/MWh`,
  },
  legend: {
    top: 0,
    right: 8,
    itemWidth: 12,
    itemHeight: 6,
    textStyle: {
      color: '#b8d8e8',
      fontSize: 10,
    },
  },
  grid: {
    top: 38,
    left: 48,
    right: 18,
    bottom: 30,
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100,
    },
  ],
  xAxis: {
    data: latestPriceLabels,
    axisLabel: {
      interval: 7,
      color: '#91abba',
      fontSize: 9,
    },
  },
  yAxis: {
    name: '元/MWh',
    nameTextStyle: {
      color: '#75d7ff',
      fontSize: 9,
    },
    axisLabel: {
      color: '#91abba',
      fontSize: 9,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(117, 215, 255, 0.12)',
        type: 'dashed',
      },
    },
  },
  series: [
    {
      name: '实时电价',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
      },
      data: latestPriceDay.points.map((item) => item.realTimePrice),
    },
    {
      name: '日前电价',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
      },
      data: latestPriceDay.points.map((item) => item.dayAheadPrice),
    },
    {
      name: '天气修正预测',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        type: 'dashed',
      },
      areaStyle: {
        color: 'rgba(255, 200, 87, 0.08)',
      },
      data: weatherPredictedPrices.value,
    },
  ],
}))

onMounted(() => {
  autofit.init({
    el: '.trading-revenue-fit',
    dw: 1440,
    dh: 780,
  })
  void fetchWeatherSnapshot()
})

onUnmounted(() => {
  autofit.off()
})
</script>

<template>
  <main class="trading-revenue-page trading-revenue-fit">
    <section class="kpi-grid">
      <article v-for="item in kpiItems" :key="item.label" class="kpi-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em>{{ item.unit }}</em>
      </article>
    </section>

    <section class="content-grid">
      <aside class="panel left-panel">
        <header class="panel-title">
          <span>交易结果</span>
          <em>价格样本：{{ latestPriceDay.date }}</em>
        </header>
        <div class="chart-box price-chart">
          <Chart height="100%" :options="priceTrendOption" />
        </div>
        <div class="station-rank">
          <div class="rank-head">
            <span>场站</span>
            <span>成交电量</span>
            <span>较基准</span>
          </div>
          <div v-for="station in stationRows" :key="station.name" class="rank-row">
            <div class="station-name">
              <strong>{{ station.name }}</strong>
              <em>{{ station.capacityMw }}MW / {{ station.gridType }}</em>
            </div>
            <span>{{ station.tradedMwh.toFixed(1) }}MWh</span>
            <b>+{{ station.upliftRate.toFixed(1) }}%</b>
          </div>
        </div>
      </aside>

      <section class="price-monitor panel">
        <header class="panel-title">
          <span>实时电价曲线监控</span>
          <em>{{ latestPriceDay.date }} / CSV最新交易日 / 天气修正预测</em>
        </header>
        <div class="chart-box realtime-price-chart">
          <Chart height="100%" :options="realTimePriceOption" />
        </div>
        <div class="weather-grid">
          <article
            v-for="item in priceMonitorStats"
            :key="item.label"
            class="weather-card"
            :class="item.tone"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.detail }}</em>
          </article>
        </div>
      </section>

      <aside class="agent-workflow panel">
        <header>
          <span>超脑Agent运算中...</span>
          <em>Workflow 实时进站</em>
        </header>
        <div class="workflow-list">
          <article
            v-for="item in agentWorkflow"
            :key="item.title"
            class="workflow-item"
            :class="item.status"
          >
            <i>{{ item.status === 'done' ? '✓' : item.status === 'running' ? '●' : '■' }}</i>
            <div>
              <strong>{{ item.title }}</strong>
              <em>{{ item.detail }}</em>
            </div>
            <span>{{ item.time }}</span>
          </article>
        </div>
      </aside>
    </section>

    <section class="trade-flow">
      <article v-for="(step, index) in tradeSteps" :key="step.name" class="flow-step">
        <div class="step-top">
          <div class="step-index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="step-copy">
            <strong>{{ step.name }}</strong>
            <span>{{ step.time }}</span>
          </div>
        </div>
        <em class="step-rate">{{ step.rate }}%</em>
        <div class="step-progress">
          <i :style="{ width: `${step.rate}%` }"></i>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
.trading-revenue-page {
  position: relative;
  width: 1440px;
  height: 780px;
  padding: 14px 18px 16px;
  box-sizing: border-box;
  overflow: hidden;
  color: #eaf8ff;
  background:
    radial-gradient(circle at 52% 22%, rgba(45, 190, 220, 0.22), transparent 31%),
    radial-gradient(circle at 11% 78%, rgba(53, 242, 166, 0.1), transparent 24%),
    radial-gradient(circle at 91% 76%, rgba(117, 215, 255, 0.12), transparent 26%),
    linear-gradient(180deg, #06101c 0%, #081622 48%, #06101a 100%);
}

.trading-revenue-page::before,
.trading-revenue-page::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
}

.trading-revenue-page::before {
  background:
    linear-gradient(rgba(117, 215, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(117, 215, 255, 0.045) 1px, transparent 1px),
    linear-gradient(115deg, transparent 0 46%, rgba(53, 242, 166, 0.1) 47%, transparent 48% 100%),
    linear-gradient(64deg, transparent 0 54%, rgba(88, 217, 255, 0.08) 55%, transparent 56% 100%);
  background-size:
    40px 40px,
    40px 40px,
    620px 360px,
    760px 420px;
  opacity: 0.64;
  mask-image: radial-gradient(circle at 50% 45%, black 0%, transparent 78%);
}

.trading-revenue-page::after {
  border: 1px solid rgba(117, 215, 255, 0.1);
  background:
    linear-gradient(90deg, rgba(88, 217, 255, 0.16), transparent 18%, transparent 82%, rgba(53, 242, 166, 0.12)),
    linear-gradient(180deg, rgba(117, 215, 255, 0.1), transparent 18%, transparent 84%, rgba(53, 242, 166, 0.08));
  box-shadow: inset 0 0 70px rgba(18, 118, 158, 0.18);
}

.trading-revenue-page > * {
  position: relative;
  z-index: 1;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 10px;
  height: 74px;
}

.kpi-card {
  position: relative;
  min-width: 0;
  padding: 9px 10px 8px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgba(106, 217, 255, 0.22);
  background: linear-gradient(180deg, rgba(17, 63, 86, 0.74), rgba(8, 31, 49, 0.62));
  box-shadow: inset 0 0 16px rgba(91, 215, 255, 0.08);
}

.kpi-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 38px;
  height: 2px;
  content: '';
  background: #35f2a6;
}

.kpi-card span {
  display: block;
  height: 18px;
  overflow: hidden;
  color: #9cc7da;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.kpi-card strong {
  margin-right: 4px;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  line-height: 32px;
}

.kpi-card em {
  color: #75d7ff;
  font-size: 10px;
  font-style: normal;
}

.content-grid {
  display: grid;
  grid-template-columns: 372px minmax(0, 1fr) 372px;
  gap: 14px;
  height: 528px;
  margin-top: 12px;
}

.panel {
  min-width: 0;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid rgba(106, 217, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(61, 184, 227, 0.14), transparent 38%),
    rgba(6, 22, 36, 0.82);
  box-shadow: inset 0 0 24px rgba(91, 215, 255, 0.07);
}

.panel-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  height: 26px;
}

.panel-title span {
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}

.panel-title em {
  color: #7fa9bb;
  font-size: 10px;
  font-style: normal;
}

.chart-box {
  min-height: 0;
}

.price-chart {
  height: 238px;
  margin-top: 8px;
}

.station-rank {
  margin-top: 18px;
}

.rank-head,
.rank-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px 58px;
  gap: 8px;
  align-items: center;
}

.rank-head {
  height: 28px;
  padding: 0 8px;
  color: #8fb7c8;
  font-size: 10px;
  background: rgba(30, 76, 96, 0.42);
}

.rank-head span:nth-child(n + 2) {
  text-align: right;
}

.rank-row {
  height: 32px;
  margin-top: 5px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid rgba(117, 215, 255, 0.1);
  background: rgba(10, 35, 52, 0.56);
}

.station-name {
  min-width: 0;
}

.station-name strong {
  display: block;
  overflow: hidden;
  color: #f2fbff;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.station-name em {
  display: none;
  margin-top: 0;
  color: #83a8b8;
  font-size: 9px;
  font-style: normal;
}

.rank-row span {
  color: #c6e5f0;
  font-size: 10px;
  text-align: right;
}

.rank-row b {
  color: #35f2a6;
  font-size: 11px;
  text-align: right;
}

.price-monitor,
.agent-workflow {
  min-width: 0;
  min-height: 0;
}

.price-monitor {
  display: flex;
  flex-direction: column;
}

.realtime-price-chart {
  height: 362px;
  margin-top: 10px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.weather-card {
  position: relative;
  height: 86px;
  padding: 9px 8px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgba(117, 215, 255, 0.18);
  background: rgba(8, 30, 48, 0.72);
}

.weather-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 2px;
  content: '';
  background: #58d9ff;
}

.weather-card.green::before {
  background: #35f2a6;
}

.weather-card.gold::before {
  background: #ffc857;
}

.weather-card.red::before {
  background: #ff7a90;
}

.weather-card span,
.weather-card em {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.weather-card span {
  color: #9fc4d3;
  font-size: 11px;
}

.weather-card strong {
  display: block;
  margin-top: 4px;
  color: #fff;
  overflow: hidden;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.weather-card em {
  margin-top: 6px;
  color: #7fa9bb;
  font-size: 10px;
  font-style: normal;
}

.agent-workflow {
  padding: 12px 14px;
  box-sizing: border-box;
  border: 2px solid rgba(117, 215, 255, 0.18);
  background: rgba(5, 18, 31, 0.62);
}

.agent-workflow header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  height: 30px;
}

.agent-workflow header span {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.agent-workflow header em {
  color: #7fa9bb;
  font-size: 10px;
  font-style: normal;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-top: 8px;
}

.workflow-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
  min-height: 42px;
  padding: 5px 8px;
  box-sizing: border-box;
  border: 1px dashed rgba(184, 216, 232, 0.34);
  background: rgba(8, 30, 48, 0.54);
}

.workflow-item i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #06131f;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  background: #35f2a6;
}

.workflow-item div {
  min-width: 0;
}

.workflow-item strong,
.workflow-item em {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.workflow-item strong {
  color: #eaf8ff;
  font-size: 11px;
  font-weight: 600;
}

.workflow-item em {
  margin-top: 3px;
  color: #8fb7c8;
  font-size: 9px;
  font-style: normal;
}

.workflow-item span {
  color: #9cc7da;
  font-size: 10px;
  text-align: right;
}

.workflow-item.running {
  min-height: 52px;
  border-color: rgba(255, 200, 87, 0.58);
  background: linear-gradient(90deg, rgba(255, 200, 87, 0.12), rgba(8, 30, 48, 0.58));
}

.workflow-item.running i {
  color: #06131f;
  background: #ffc857;
}

.workflow-item.pending i {
  color: #dff9ff;
  background: rgba(184, 216, 232, 0.14);
  border: 1px solid rgba(184, 216, 232, 0.34);
}

.trade-flow {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  height: 100px;
  margin-top: 12px;
}

.flow-step {
  position: relative;
  padding: 14px 14px 12px;
  box-sizing: border-box;
  border: 1px solid rgba(106, 217, 255, 0.18);
  background:
    linear-gradient(135deg, rgba(53, 242, 166, 0.08), transparent 44%),
    linear-gradient(180deg, rgba(14, 53, 76, 0.76), rgba(7, 26, 42, 0.82));
}

.step-top {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.step-index {
  color: rgba(117, 215, 255, 0.36);
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.step-copy {
  min-width: 0;
}

.flow-step strong {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.flow-step span {
  display: block;
  margin-top: 8px;
  color: #9cc7da;
  font-size: 11px;
  line-height: 14px;
}

.step-rate {
  display: block;
  margin-top: 0px;
  color: #35f2a6;
  font-size: 12px;
  font-style: normal;
  line-height: 12px;
  text-align: right;
}

.step-progress {
  height: 5px;
  margin-top: 8px;
  overflow: hidden;
  background: rgba(117, 215, 255, 0.12);
}

.step-progress i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #35f2a6, #75d7ff);
  box-shadow: 0 0 10px rgba(53, 242, 166, 0.36);
}
</style>
