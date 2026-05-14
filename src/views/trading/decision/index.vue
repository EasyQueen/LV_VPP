<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import autofit from 'autofit.js'
import type { EChartsOption, TooltipComponentOption } from 'echarts'
import Chart from '@/components/chart/chart.vue'
import {
  latestPriceDay,
  priceDayLabels,
  recentMarketSeries,
  tradingStrategies,
} from '@/data/trading'

const points = latestPriceDay.points
const labels = points.map((item) => item.time)

const predictedPrices = points.map((item, index) => {
  const drift = Math.sin(index * 0.28) * 9 + Math.cos(index * 0.11) * 6
  return Number(Math.max(0, item.dayAheadPrice + drift).toFixed(1))
})

const pvForecast = points.map((_, index) => {
  const hour = index / 4
  const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
  const cloud = 0.9 + Math.sin(index * 0.22) * 0.08
  return Number((daylight * 86 * cloud).toFixed(1))
})

const bidVolume = pvForecast.map((value, index) => {
  const price = predictedPrices[index]
  const hour = index / 4
  const lowPriceDiscount = price < 80 && hour >= 9 && hour <= 15 ? 0.28 : 1
  const highPriceBoost = price > 300 && (hour < 9 || hour >= 16) ? 1.08 : 0.9
  return Number((value * lowPriceDiscount * highPriceBoost).toFixed(1))
})

const lowPriceCount = points.filter((item) => item.dayAheadPrice <= 80 || item.realTimePrice <= 80).length
const zeroPriceCount = points.filter((item) => item.dayAheadPrice === 0 || item.realTimePrice === 0).length
const priceWindowHitRate = Math.round(((96 - lowPriceCount + zeroPriceCount * 0.5) / 96) * 100)
const forecastAccuracy = 96.8
const strategyWinRate = 78.4
const avgSpread = recentMarketSeries.spreadAvg.at(-1) ?? latestPriceDay.absSpreadAvg

const kpiItems = [
  { label: '日前预测准确率', value: forecastAccuracy.toFixed(1), unit: '%' },
  { label: '价格窗口识别率', value: String(priceWindowHitRate), unit: '%' },
  { label: '报价策略胜率', value: strategyWinRate.toFixed(1), unit: '%' },
  { label: '偏差考核规避', value: '42.8', unit: '万元' },
  { label: '可申报电量', value: '356.8', unit: 'MWh' },
  { label: '建议申报价差', value: avgSpread.toFixed(1), unit: '元/MWh' },
  { label: '策略置信度', value: '86', unit: '%' },
  { label: '风险敞口', value: '中低', unit: '' },
]

const factorItems = [
  { label: '辐照度', value: '812 W/m2', level: 86 },
  { label: '云量', value: '32%', level: 38 },
  { label: '温度', value: '27.4℃', level: 62 },
  { label: '系统负荷', value: '34.6GW', level: 74 },
  { label: '新能源出力', value: '高', level: 88 },
  { label: '阻塞风险', value: '中', level: 46 },
]

const riskActions = ['午间低价窗口降额申报', '早晚高价窗口分段报价', '实时偏差滚动修正', '异常天气策略锁仓']

const replayCases = [
  { label: '低价时段少报', time: '10:00-14:15', value: '规避 126.4MWh' },
  { label: '高价时段增报', time: '16:30-18:30', value: '锁定 78.2MWh' },
  { label: '实时偏差规避', time: 'T+0 滚动', value: '减少 18.6万元' },
]

const tradeLogs = [
  { time: '08:10', text: '完成光伏 96 点出力预测' },
  { time: '08:35', text: '识别午间低价/零价风险窗口' },
  { time: '09:05', text: '生成均衡型申报策略' },
  { time: '10:20', text: '提交日前分段报价曲线' },
  { time: '14:15', text: '跟踪出清结果并更新复盘' },
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

const decisionOption = computed<EChartsOption>(() => ({
  color: ['#58d9ff', '#35f2a6', '#ffc857', '#ff7a90'],
  tooltip: {
    ...darkTooltipStyle,
    trigger: 'axis',
  },
  legend: {
    top: 0,
    right: 6,
    itemWidth: 12,
    itemHeight: 6,
    textStyle: {
      color: '#b8d8e8',
      fontSize: 10,
    },
  },
  grid: {
    top: 38,
    left: 50,
    right: 56,
    bottom: 34,
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100,
    },
  ],
  xAxis: {
    data: labels,
    axisLabel: {
      interval: 7,
      color: '#91abba',
      fontSize: 9,
    },
  },
  yAxis: [
    {
      type: 'value',
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
    {
      type: 'value',
      name: 'MWh',
      nameTextStyle: {
        color: '#35f2a6',
        fontSize: 9,
      },
      axisLabel: {
        color: '#91abba',
        fontSize: 9,
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: '日前出清价格',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: points.map((item) => item.dayAheadPrice),
      markArea: {
        silent: true,
        itemStyle: {
          color: 'rgba(255, 122, 144, 0.12)',
        },
        data: [
          [
            { name: '低价风险窗口', xAxis: '09:00' },
            { xAxis: '14:30' },
          ],
        ],
      },
    },
    {
      name: '实时出清价格',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: points.map((item) => item.realTimePrice),
    },
    {
      name: '平台预测价',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        type: 'dashed',
      },
      data: predictedPrices,
    },
    {
      name: '建议申报电量',
      type: 'bar',
      yAxisIndex: 1,
      barWidth: 4,
      data: bidVolume,
      itemStyle: {
        opacity: 0.66,
      },
    },
  ],
}))

const pvOption = computed<EChartsOption>(() => ({
  color: ['#35f2a6', '#75d7ff'],
  tooltip: {
    ...darkTooltipStyle,
    trigger: 'axis',
    valueFormatter: (value) => `${Number(value).toFixed(1)} MWh`,
  },
  grid: {
    top: 18,
    left: 40,
    right: 16,
    bottom: 24,
  },
  xAxis: {
    data: labels,
    axisLabel: {
      interval: 15,
      color: '#91abba',
      fontSize: 9,
    },
  },
  yAxis: {
    name: 'MWh',
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
      name: '预测出力',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: pvForecast,
      areaStyle: {
        color: 'rgba(53, 242, 166, 0.12)',
      },
    },
    {
      name: '置信下界',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: pvForecast.map((value) => Number((value * 0.88).toFixed(1))),
      lineStyle: {
        type: 'dashed',
      },
    },
  ],
}))

const riskRadarOption = computed<EChartsOption>(() => ({
  color: ['#ffc857'],
  tooltip: {
    ...darkTooltipStyle,
  },
  radar: {
    radius: 58,
    center: ['50%', '50%'],
    indicator: [
      { name: '预测误差', max: 100 },
      { name: '价格波动', max: 100 },
      { name: '限电风险', max: 100 },
      { name: '出清失败', max: 100 },
      { name: '偏差考核', max: 100 },
    ],
    axisName: {
      color: '#b8d8e8',
      fontSize: 9,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(117, 215, 255, 0.14)',
      },
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(117, 215, 255, 0.03)', 'rgba(117, 215, 255, 0.07)'],
      },
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(117, 215, 255, 0.18)',
      },
    },
  },
  xAxis: {
    show: false,
  },
  yAxis: {
    show: false,
  },
  series: [
    {
      type: 'radar',
      symbol: 'circle',
      symbolSize: 4,
      areaStyle: {
        color: 'rgba(255, 200, 87, 0.14)',
      },
      data: [
        {
          value: [38, 62, 46, 28, 34],
          name: '风险敞口',
        },
      ],
    },
  ],
}))

const backtestOption = computed<EChartsOption>(() => ({
  color: ['#58d9ff', '#35f2a6', '#ff7a90'],
  tooltip: {
    ...darkTooltipStyle,
    trigger: 'axis',
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
    right: 16,
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
      type: 'bar',
      barWidth: 8,
      data: recentMarketSeries.dayAheadAvg,
    },
    {
      name: '实时均价',
      type: 'bar',
      barWidth: 8,
      data: recentMarketSeries.realTimeAvg,
    },
    {
      name: '平均价差',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: recentMarketSeries.spreadAvg,
    },
  ],
}))

onMounted(() => {
  autofit.init({
    el: '.trading-decision-fit',
    dw: 1440,
    dh: 780,
  })
})

onUnmounted(() => {
  autofit.off()
})
</script>

<template>
  <main class="trading-decision-page trading-decision-fit">
    <section class="kpi-grid">
      <article v-for="item in kpiItems" :key="item.label" class="kpi-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em>{{ item.unit }}</em>
      </article>
    </section>

    <section class="main-grid">
      <aside class="panel left-panel">
        <header class="panel-title">
          <span>预测能力</span>
          <em>{{ latestPriceDay.date }} / 96点</em>
        </header>
        <div class="price-stats">
          <div>
            <span>峰价</span>
            <strong>{{ latestPriceDay.dayAheadMax.toFixed(1) }}</strong>
            <em>元/MWh</em>
          </div>
          <div>
            <span>谷价</span>
            <strong>{{ latestPriceDay.dayAheadMin.toFixed(1) }}</strong>
            <em>元/MWh</em>
          </div>
          <div>
            <span>零价时段</span>
            <strong>{{ zeroPriceCount }}</strong>
            <em>点</em>
          </div>
        </div>
        <div class="weather-strip">
          <span>多云转晴</span>
          <span>午间高出力</span>
          <span>低价风险</span>
        </div>
        <div class="pv-chart">
          <Chart height="100%" :options="pvOption" />
        </div>
        <div class="factor-list">
          <div v-for="item in factorItems" :key="item.label" class="factor-row">
            <span>{{ item.label }}</span>
            <div class="factor-bar">
              <i :style="{ width: `${item.level}%` }"></i>
            </div>
            <em>{{ item.value }}</em>
          </div>
        </div>
      </aside>

      <section class="center-panel">
        <header class="panel-title">
          <span>日前预测与量化申报曲线</span>
          <em>低价/零价窗口已自动高亮</em>
        </header>
        <div class="decision-chart">
          <Chart height="100%" :options="decisionOption" />
        </div>
        <div class="window-cards">
          <article>
            <span>午间低价窗口</span>
            <strong>{{ lowPriceCount }}</strong>
            <em>个15分钟点，建议降额申报</em>
          </article>
          <article>
            <span>早晚高价窗口</span>
            <strong>24</strong>
            <em>个15分钟点，建议分段报价</em>
          </article>
          <article>
            <span>日前实时平均价差</span>
            <strong>{{ latestPriceDay.absSpreadAvg.toFixed(1) }}</strong>
            <em>元/MWh，纳入偏差风控</em>
          </article>
        </div>
      </section>

      <aside class="panel right-panel">
        <header class="panel-title">
          <span>策略与风控</span>
          <em>模拟策略，待真实成交替换</em>
        </header>
        <div class="strategy-list">
          <article v-for="item in tradingStrategies" :key="item.name" class="strategy-card">
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.style }}</span>
            </div>
            <em>{{ item.confidence }}%</em>
            <p>
              {{ item.volume.toFixed(1) }}MWh / {{ item.targetPrice.toFixed(0) }}元/MWh /
              {{ item.expectedRevenue.toFixed(1) }}万元
            </p>
            <b>风险：{{ item.risk }}</b>
          </article>
        </div>
        <div class="radar-chart">
          <Chart height="100%" :options="riskRadarOption" />
        </div>
        <div class="action-list">
          <span v-for="item in riskActions" :key="item">{{ item }}</span>
        </div>
      </aside>
    </section>

    <section class="bottom-grid">
      <article class="panel backtest-panel">
        <header class="panel-title">
          <span>近10日市场复盘</span>
          <em>CSV 实际出清价格</em>
        </header>
        <div class="backtest-chart">
          <Chart height="100%" :options="backtestOption" />
        </div>
      </article>
      <article class="panel replay-panel">
        <header class="panel-title">
          <span>策略命中案例</span>
          <em>展示型测算</em>
        </header>
        <div class="case-list">
          <div v-for="item in replayCases" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.time }}</em>
          </div>
        </div>
      </article>
      <article class="panel log-panel">
        <header class="panel-title">
          <span>交易日志</span>
          <em>决策链路留痕</em>
        </header>
        <div class="log-list">
          <div v-for="item in tradeLogs" :key="item.time">
            <span>{{ item.time }}</span>
            <em>{{ item.text }}</em>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
.trading-decision-page {
  position: relative;
  width: 1440px;
  height: 760px;
  padding: 14px 18px 16px;
  box-sizing: border-box;
  overflow: hidden;
  color: #eaf8ff;
  background:
    radial-gradient(circle at 50% 20%, rgba(45, 190, 220, 0.2), transparent 32%),
    radial-gradient(circle at 12% 76%, rgba(255, 200, 87, 0.08), transparent 23%),
    radial-gradient(circle at 90% 72%, rgba(53, 242, 166, 0.1), transparent 25%),
    linear-gradient(180deg, #06101c 0%, #081622 48%, #06101a 100%);
}

.trading-decision-page::before,
.trading-decision-page::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
}

.trading-decision-page::before {
  background:
    linear-gradient(rgba(117, 215, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(117, 215, 255, 0.045) 1px, transparent 1px),
    linear-gradient(115deg, transparent 0 46%, rgba(255, 200, 87, 0.1) 47%, transparent 48% 100%),
    linear-gradient(64deg, transparent 0 54%, rgba(88, 217, 255, 0.08) 55%, transparent 56% 100%);
  background-size:
    40px 40px,
    40px 40px,
    620px 360px,
    760px 420px;
  opacity: 0.64;
  mask-image: radial-gradient(circle at 50% 45%, black 0%, transparent 78%);
}

.trading-decision-page::after {
  border: 1px solid rgba(117, 215, 255, 0.1);
  background:
    linear-gradient(90deg, rgba(88, 217, 255, 0.16), transparent 18%, transparent 82%, rgba(255, 200, 87, 0.1)),
    linear-gradient(180deg, rgba(117, 215, 255, 0.1), transparent 18%, transparent 84%, rgba(53, 242, 166, 0.08));
  box-shadow: inset 0 0 70px rgba(18, 118, 158, 0.18);
}

.trading-decision-page > * {
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
  background: #ffc857;
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

.main-grid {
  display: grid;
  grid-template-columns: 326px minmax(0, 1fr) 334px;
  gap: 14px;
  height: 430px;
  margin-top: 12px;
}

.panel,
.center-panel {
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

.price-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.price-stats div {
  height: 50px;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid rgba(117, 215, 255, 0.14);
  background: rgba(10, 35, 52, 0.66);
}

.price-stats span {
  display: block;
  color: #91abba;
  font-size: 10px;
}

.price-stats strong {
  color: #fff;
  font-size: 16px;
}

.price-stats em {
  color: #75d7ff;
  font-size: 9px;
  font-style: normal;
}

.weather-strip {
  display: flex;
  gap: 7px;
  margin-top: 10px;
}

.weather-strip span {
  height: 22px;
  padding: 0 9px;
  color: #dff9ff;
  font-size: 10px;
  line-height: 22px;
  border: 1px solid rgba(53, 242, 166, 0.26);
  background: rgba(53, 242, 166, 0.08);
}

.pv-chart {
  height: 134px;
  margin-top: 8px;
}

.factor-list {
  margin-top: 8px;
}

.factor-row {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) 66px;
  gap: 8px;
  align-items: center;
  height: 22px;
  font-size: 10px;
}

.factor-row span {
  color: #b8d8e8;
}

.factor-row em {
  color: #75d7ff;
  font-style: normal;
  text-align: right;
}

.factor-bar {
  height: 6px;
  overflow: hidden;
  background: rgba(117, 215, 255, 0.12);
}

.factor-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #35f2a6, #75d7ff);
}

.decision-chart {
  height: 300px;
  margin-top: 8px;
}

.window-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.window-cards article {
  height: 65px;
  padding: 7px 10px;
  box-sizing: border-box;
  border: 1px solid rgba(117, 215, 255, 0.14);
  background: rgba(10, 35, 52, 0.66);
}

.window-cards span {
  display: block;
  color: #91abba;
  font-size: 10px;
}

.window-cards strong {
  margin-right: 5px;
  color: #fff;
  font-size: 20px;
}

.window-cards em {
  color: #75d7ff;
  font-size: 10px;
  font-style: normal;
}

.strategy-list {
  display: grid;
  grid-template-rows: repeat(3, 50px);
  gap: 6px;
  margin-top: 8px;
}

.strategy-card {
  position: relative;
  min-height: 0;
  padding: 5px 10px 15px;
  box-sizing: border-box;
  border: 1px solid rgba(117, 215, 255, 0.14);
  background: rgba(10, 35, 52, 0.66);
}

.strategy-card div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.strategy-card strong {
  color: #fff;
  font-size: 13px;
}

.strategy-card span {
  color: #91abba;
  font-size: 10px;
}

.strategy-card em {
  position: absolute;
  right: 10px;
  top: 7px;
  color: #35f2a6;
  font-size: 13px;
  font-style: normal;
}

.strategy-card p {
  margin: 3px 0 0;
  padding-right: 4px;
  overflow: hidden;
  color: #c8e7f4;
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.strategy-card b {
  position: absolute;
  right: 10px;
  bottom: 4px;
  display: block;
  margin-top: 0;
  color: #ffc857;
  font-size: 10px;
  font-weight: 500;
}

.radar-chart {
  height: 136px;
  margin-top: 7px;
  overflow: hidden;
}

.action-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  margin-top: 6px;
}

.action-list span {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 28px;
  padding: 0 7px;
  color: #dff9ff;
  font-size: 10px;
  line-height: 13px;
  text-align: center;
  border: 1px solid rgba(53, 242, 166, 0.26);
  background: rgba(53, 242, 166, 0.08);
}

.bottom-grid {
  display: grid;
  grid-template-columns: 470px 360px minmax(0, 1fr);
  gap: 14px;
  height: 198px;
  margin-top: 12px;
}

.backtest-chart {
  height: 150px;
  margin-top: 4px;
}

.case-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.case-list div {
  height: 126px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(53, 242, 166, 0.18);
  background: rgba(53, 242, 166, 0.07);
}

.case-list span,
.log-list span {
  display: block;
  color: #91abba;
  font-size: 10px;
}

.case-list strong {
  display: block;
  margin-top: 10px;
  color: #fff;
  font-size: 14px;
}

.case-list em {
  display: block;
  margin-top: 8px;
  color: #75d7ff;
  font-size: 10px;
  font-style: normal;
}

.log-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.log-list div {
  min-height: 126px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(117, 215, 255, 0.14);
  background: rgba(10, 35, 52, 0.66);
}

.log-list span {
  color: #35f2a6;
  font-size: 12px;
}

.log-list em {
  display: block;
  margin-top: 10px;
  color: #c8e7f4;
  font-size: 11px;
  font-style: normal;
  line-height: 17px;
}
</style>
