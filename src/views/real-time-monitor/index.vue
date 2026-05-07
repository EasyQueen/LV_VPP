<script setup lang="ts">
import { PointLayer, Scene } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'
import Chart from '@/components/chart/chart.vue'
import type { EChartsOption } from 'echarts'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const pageSize = 6
const searchKeyword = ref('')
const currentPage = ref(1)

const timeLabels = Array.from({ length: 49 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0')
  const minute = index % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

const stationSeeds = [
  {
    name: '安徽瑞隆分布式光伏电站',
    capacity: 1480,
    offset: 0.2,
    gridProfile: {
      base: 0.08,
      noonPeak: 0.42,
    },
    lng: 117.205,
    lat: 31.765,
  },
  {
    name: '肥西零重力分布式光伏电站',
    capacity: 1280,
    offset: 1.1,
    gridProfile: {
      base: 0.12,
      noonPeak: 0.34,
    },
    lng: 117.475,
    lat: 31.855,
  },
  {
    name: '合肥周谷堆分布式光伏电站',
    capacity: 1360,
    offset: 2,
    gridProfile: {
      base: 0.68,
      noonPeak: 0.16,
    },
    lng: 117.295,
    lat: 31.705,
  },
  {
    name: '合肥航嘉分布式光伏电站',
    capacity: 1160,
    offset: 2.8,
    gridProfile: {
      base: 0.1,
      noonPeak: 0.3,
    },
    lng: 117.135,
    lat: 31.835,
  },
  {
    name: '淮北电子产业园分布式光伏电站',
    capacity: 980,
    offset: 3.5,
    gridProfile: {
      base: 0.72,
      noonPeak: 0.12,
    },
    lng: 117.27,
    lat: 31.91,
  },
  {
    name: '淮北电子产业园2期分布式光伏电站',
    capacity: 1080,
    offset: 4.4,
    gridProfile: {
      base: 0.14,
      noonPeak: 0.38,
    },
    lng: 117.36,
    lat: 31.895,
  },
  {
    name: '南京熊猫（一期）分布式光伏电站',
    capacity: 1320,
    offset: 5.2,
    gridProfile: {
      base: 0.16,
      noonPeak: 0.36,
    },
    lng: 117.08,
    lat: 31.76,
  },
  {
    name: '淮北色耐特分布式光伏电站',
    capacity: 860,
    offset: 6,
    gridProfile: {
      base: 0.7,
      noonPeak: 0.14,
    },
    lng: 117.42,
    lat: 31.74,
  },
  {
    name: '无锡德力佳分布式光伏电站',
    capacity: 1120,
    offset: 6.8,
    gridProfile: {
      base: 0.11,
      noonPeak: 0.33,
    },
    lng: 117.17,
    lat: 31.93,
  },
  {
    name: '淮北华辰选煤分布式光伏电站',
    capacity: 1540,
    offset: 7.6,
    gridProfile: {
      base: 0.07,
      noonPeak: 0.28,
    },
    lng: 117.52,
    lat: 31.92,
  },
  {
    name: '南京熊猫二期分布式光伏电站',
    capacity: 1180,
    offset: 8.4,
    gridProfile: {
      base: 0.2,
      noonPeak: 0.38,
    },
    lng: 117.03,
    lat: 31.86,
  },
  {
    name: '淮北蓝蓝科技分布式光伏电站',
    capacity: 940,
    offset: 9.2,
    gridProfile: {
      base: 0.66,
      noonPeak: 0.18,
    },
    lng: 117.34,
    lat: 31.68,
  },
  {
    name: '淮北电子产业园3期分布式光伏电站',
    capacity: 1260,
    offset: 10,
    gridProfile: {
      base: 0.13,
      noonPeak: 0.4,
    },
    lng: 117.24,
    lat: 31.98,
  },
]

const additionalStationSeeds = [
  ['合肥包河智造园分布式光伏电站', 1210, 10.8, 0.1, 0.32, 117.31, 31.79],
  ['合肥肥西联东U谷分布式光伏电站', 980, 11.6, 0.72, 0.1, 117.12, 31.73],
  ['合肥长丰双凤园区分布式光伏电站', 1360, 12.4, 0.15, 0.36, 117.25, 32.04],
  ['合肥庐江高新材料园分布式光伏电站', 1040, 13.2, 0.09, 0.3, 117.29, 31.26],
  ['芜湖鸠江产业园分布式光伏电站', 1420, 14, 0.18, 0.4, 118.39, 31.36],
  ['芜湖南陵智能装备园分布式光伏电站', 920, 14.8, 0.65, 0.16, 118.34, 30.91],
  ['马鞍山雨山制造基地分布式光伏电站', 1180, 15.6, 0.11, 0.34, 118.49, 31.68],
  ['铜陵义安精工园分布式光伏电站', 1060, 16.4, 0.13, 0.28, 117.8, 30.95],
  ['安庆经开区新能源园分布式光伏电站', 1320, 17.2, 0.2, 0.42, 117.08, 30.54],
  ['池州贵池电子园分布式光伏电站', 880, 18, 0.7, 0.12, 117.49, 30.66],
  ['宣城郎溪产业园分布式光伏电站', 1150, 18.8, 0.12, 0.35, 119.18, 31.13],
  ['滁州中新苏滁园分布式光伏电站', 1490, 19.6, 0.08, 0.31, 118.35, 32.28],
  ['滁州天长电子产业园分布式光伏电站', 1020, 20.4, 0.66, 0.18, 119.0, 32.69],
  ['蚌埠高新区装备园分布式光伏电站', 1270, 21.2, 0.14, 0.38, 117.31, 32.93],
  ['淮南寿县新桥园区分布式光伏电站', 970, 22, 0.09, 0.33, 116.97, 32.55],
  ['阜阳颍州食品园分布式光伏电站', 1100, 22.8, 0.74, 0.1, 115.82, 32.89],
  ['亳州谯城药业园分布式光伏电站', 1240, 23.6, 0.16, 0.37, 115.78, 33.85],
  ['宿州埇桥智能制造园分布式光伏电站', 1380, 24.4, 0.1, 0.3, 116.98, 33.64],
  ['六安金安新能源园分布式光伏电站', 1010, 25.2, 0.18, 0.35, 116.52, 31.75],
  ['黄山徽州绿色工厂分布式光伏电站', 760, 26, 0.68, 0.14, 118.34, 29.83],
  ['淮北濉溪铝基园分布式光伏电站', 1450, 26.8, 0.07, 0.29, 116.77, 33.92],
  ['淮北杜集新材料园分布式光伏电站', 1080, 27.6, 0.13, 0.41, 116.86, 33.99],
  ['淮北烈山循环经济园分布式光伏电站', 1180, 28.4, 0.12, 0.34, 116.81, 33.89],
  ['南京江宁智能制造园分布式光伏电站', 1290, 29.2, 0.2, 0.39, 118.84, 31.95],
  ['南京浦口科创园分布式光伏电站', 930, 30, 0.69, 0.15, 118.62, 32.06],
  ['苏州吴江精密制造园分布式光伏电站', 1330, 30.8, 0.15, 0.36, 120.64, 31.16],
  ['无锡惠山装备产业园分布式光伏电站', 1160, 31.6, 0.1, 0.32, 120.3, 31.68],
  ['常州武进新能源园分布式光伏电站', 1230, 32.4, 0.17, 0.4, 119.94, 31.7],
  ['镇江丹阳智能电气园分布式光伏电站', 990, 33.2, 0.64, 0.18, 119.58, 32.0],
  ['扬州仪征汽车零部件园分布式光伏电站', 1070, 34, 0.12, 0.31, 119.18, 32.27],
].map(([name, capacity, offset, base, noonPeak, lng, lat]) => ({
  name: name as string,
  capacity: capacity as number,
  offset: offset as number,
  gridProfile: {
    base: base as number,
    noonPeak: noonPeak as number,
  },
  lng: lng as number,
  lat: lat as number,
}))

const allStationSeeds = [...stationSeeds, ...additionalStationSeeds]

function createActualCurve(capacity: number, offset: number) {
  return timeLabels.map((_, index) => {
    const hour = index / 2
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    const cloudFactor = 0.88 + Math.sin(index * 0.47 + offset) * 0.08 + Math.cos(index * 0.19 + offset) * 0.05
    const noonLift = hour > 10 && hour < 14 ? 1.04 : 1
    return Number((daylight * capacity * cloudFactor * noonLift).toFixed(1))
  })
}

function createGridCurve(actual: number[], offset: number, profile: { base: number; noonPeak: number }) {
  return actual.map((value, index) => {
    const hour = index / 2
    const noonSurplus = Math.exp(-((hour - 12.8) ** 2) / 7.2)
    const volatility = Math.sin(index * 0.31 + offset) * 0.018
    const gridRatio = Math.min(0.88, Math.max(0.03, profile.base + profile.noonPeak * noonSurplus + volatility))
    return Number((value * gridRatio).toFixed(1))
  })
}

const stations = allStationSeeds.map((station) => {
  const actual = createActualCurve(station.capacity, station.offset)
  const grid = createGridCurve(actual, station.offset, station.gridProfile)
  const actualTotal = actual.reduce((sum, value) => sum + value, 0)
  const gridTotal = grid.reduce((sum, value) => sum + value, 0)

  return {
    ...station,
    actual,
    grid,
    gridRate: ((gridTotal / actualTotal) * 100).toFixed(1),
  }
})

function getVisibleSlotCount(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes()
  return Math.min(49, Math.max(1, Math.floor(minutes / 30) + 1))
}

const visibleSlotCount = ref(getVisibleSlotCount())

const visibleStations = computed(() => stations.map((station) => {
  const actual = station.actual.slice(0, visibleSlotCount.value)
  const grid = station.grid.slice(0, visibleSlotCount.value)
  const chartActual = station.actual.map((value, index) => (index < visibleSlotCount.value ? value : null))
  const chartGrid = station.grid.map((value, index) => (index < visibleSlotCount.value ? value : null))
  const actualTotal = actual.reduce((sum, value) => sum + value, 0)
  const gridTotal = grid.reduce((sum, value) => sum + value, 0)

  return {
    ...station,
    actual,
    grid,
    chartActual,
    chartGrid,
    gridRate: actualTotal > 0 ? ((gridTotal / actualTotal) * 100).toFixed(1) : '0.0',
  }
}))

const filteredStations = computed(() => {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    return visibleStations.value
  }

  return visibleStations.value.filter((station) => station.name.includes(keyword))
})

const totalActual = computed(() => filteredStations.value.reduce((sum, station) => sum + station.actual.reduce((a, b) => a + b, 0), 0))
const totalGrid = computed(() => filteredStations.value.reduce((sum, station) => sum + station.grid.reduce((a, b) => a + b, 0), 0))
const gridRate = computed(() => (totalActual.value > 0 ? ((totalGrid.value / totalActual.value) * 100).toFixed(1) : '0.0'))

const overviewItems = computed(() => [
  {
    label: '监测场站',
    value: filteredStations.value.length,
    unit: '座',
  },
  {
    label: '今日发电量',
    value: Math.round(totalActual.value).toLocaleString(),
    unit: 'kWh',
  },
  {
    label: '今日并网量',
    value: Math.round(totalGrid.value).toLocaleString(),
    unit: 'kWh',
  },
  {
    label: '平均并网率',
    value: gridRate.value,
    unit: '%',
  },
])

function createStationOption(station: (typeof visibleStations.value)[number]): EChartsOption {
  return {
    color: ['#7bdffb', '#35f2a6'],
    title: {
      text: station.name,
      subtext: `累计并网率 ${station.gridRate}%`,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#f4fbff',
        fontSize: 16,
        fontWeight: 600,
      },
      subtextStyle: {
        color: '#9cc7da',
        fontSize: 11,
        lineHeight: 16,
      },
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: 'rgba(8, 20, 36, 0.96)',
      borderColor: 'rgba(96, 215, 255, 0.35)',
      textStyle: {
        color: '#dff8ff',
        fontSize: 12,
      },
      valueFormatter: (value) => (value == null ? '-' : `${Number(value).toFixed(1)} kWh`),
    },
    legend: {
      right: 18,
      top: 14,
      itemWidth: 18,
      itemHeight: 3,
      textStyle: {
        color: '#b9d5e4',
        fontSize: 11,
      },
      data: ['实际发电量', '实际并网量'],
    },
    grid: {
      top: 66,
      left: 56,
      right: 20,
      bottom: 36,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeLabels,
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(151, 202, 226, 0.35)',
        },
      },
      axisLabel: {
        color: '#9bb9c9',
        fontSize: 10,
        interval: 5,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      nameTextStyle: {
        color: '#9bb9c9',
        fontSize: 10,
        padding: [0, 22, 0, 0],
      },
      axisLabel: {
        color: '#9bb9c9',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(151, 202, 226, 0.16)',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '实际发电量',
        type: 'line',
        data: station.chartActual,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: '#7bdffb',
        },
      },
      {
        name: '实际并网量',
        type: 'line',
        data: station.chartGrid,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2.4,
          color: '#35f2a6',
        },
        areaStyle: {
          color: 'rgba(53, 242, 166, 0.12)',
        },
      },
    ],
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStations.value.length / pageSize)))

function handleSearchInput() {
  currentPage.value = 1
}

const pagedStations = computed(() => {
  const page = Math.min(currentPage.value, totalPages.value)
  const start = (page - 1) * pageSize

  return filteredStations.value.slice(start, start + pageSize)
})

const chartCards = computed(() => pagedStations.value.map((station) => ({
  ...station,
  option: createStationOption(station),
})))

let scene: Scene | undefined
let refreshTimer: number | undefined

onMounted(() => {
  const refreshVisibleSlot = () => {
    visibleSlotCount.value = getVisibleSlotCount()
  }

  refreshVisibleSlot()
  refreshTimer = window.setInterval(refreshVisibleSlot, 60_000)

  scene = new Scene({
    id: 'container',
    logoVisible: false,
    map: new GaodeMap({
      mapStyle: 'amap://styles/dark',
      center: [117.2272, 31.8206],
      pitch: 0,
      zoom: 10.8,
      dragEnable: false,
      zoomEnable: false,
      keyboardEnable: false,
      doubleClickZoom: false,
      scrollWheel: false,
      token: '455cdb79bf8735a87862d83e16f06c94',
    }),
  })

  scene.on('loaded', () => {
    const stationPointLayer = new PointLayer()
      .source(stations, {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat',
        },
      })
      .shape('circle')
      .size(14)
      .color('#35f2a6')
      .style({
        opacity: 0.9,
        stroke: '#d8fff2',
        strokeWidth: 1,
      })

    const stationLabelLayer = new PointLayer()
      .source(stations, {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat',
        },
      })
      .shape('name', 'text')
      .size(11)
      .color('#ecfbff')
      .style({
        textOffset: [0, 28],
        textAllowOverlap: true,
        opacity: 0.78,
      })

    scene?.addLayer(stationPointLayer)
    scene?.addLayer(stationLabelLayer)
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
  scene?.destroy()
})
</script>

<template>
  <main class="monitor-page">
    <div id="container" />
    <section class="monitor-layer">
      <header class="monitor-header">
        <div class="overview">
          <div v-for="item in overviewItems" :key="item.label" class="overview-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.unit }}</em>
          </div>
        </div>
        <el-input
          v-model="searchKeyword"
          clearable
          placeholder="搜索电站名称"
          class="station-search"
          @input="handleSearchInput"
          @clear="handleSearchInput"
        />
        <el-pagination
          v-model:current-page="currentPage"
          background
          :page-size="pageSize"
          :total="filteredStations.length"
          layout="prev, pager, next, total"
        />
      </header>

      <div v-if="chartCards.length" class="chart-board">
        <article v-for="station in chartCards" :key="station.name" class="station-card">
          <Chart height="100%" :options="station.option" />
        </article>
      </div>
      <div v-else class="empty-board">未检索到匹配电站</div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.monitor-page {
  position: relative;
  height: calc(100vh - 70px);
  overflow: hidden;
  background: #07111d;
}

#container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.monitor-layer {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 18px 22px 20px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 50% 12%, rgba(55, 158, 207, 0.22), transparent 34%),
    linear-gradient(180deg, rgba(4, 11, 21, 0.28), rgba(4, 11, 21, 0.78));
}

.monitor-header {
  display: grid;
  grid-template-columns: minmax(560px, 1fr) 320px minmax(360px, 1fr);
  align-items: center;
  gap: 18px;
  height: 64px;
  margin-bottom: 14px;
}

.eyebrow {
  height: 18px;
  font-size: 13px;
  line-height: 18px;
  color: #84dfff;
}

h1 {
  margin: 4px 0 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: 700;
  color: #f4fbff;
  text-shadow: 0 0 14px rgba(88, 210, 255, 0.42);
}

.overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(112px, 1fr));
  gap: 10px;
  min-width: 560px;
}

.overview-item {
  height: 58px;
  padding: 8px 12px;
  box-sizing: border-box;
  border: 1px solid rgba(105, 210, 255, 0.24);
  background: linear-gradient(180deg, rgba(14, 54, 82, 0.68), rgba(8, 28, 48, 0.58));
  box-shadow: inset 0 0 18px rgba(84, 209, 255, 0.08);
}

.overview-item span {
  display: block;
  height: 17px;
  font-size: 12px;
  line-height: 17px;
  color: #9cc7da;
}

.overview-item strong {
  margin-right: 5px;
  font-size: 20px;
  line-height: 26px;
  font-weight: 700;
  color: #fff;
}

.overview-item em {
  font-size: 11px;
  font-style: normal;
  color: #84dfff;
}

.station-search {
  width: 320px;
  height: 42px;
  justify-self: center;
}

.monitor-header :deep(.el-input__wrapper) {
  background: rgba(6, 23, 39, 0.78);
  border: 1px solid rgba(105, 210, 255, 0.26);
  box-shadow: inset 0 0 14px rgba(84, 209, 255, 0.08);
}

.monitor-header :deep(.el-input) {
  --el-input-height: 42px;
}

.monitor-header :deep(.el-input__inner) {
  color: #eefbff;
  font-size: 13px;
}

.monitor-header :deep(.el-input__inner::placeholder) {
  color: #7fa9bb;
}

.monitor-header :deep(.el-pagination) {
  justify-self: end;
  --el-pagination-bg-color: rgba(7, 25, 42, 0.86);
  --el-pagination-button-color: #bdefff;
  --el-pagination-button-disabled-bg-color: rgba(7, 25, 42, 0.46);
  --el-pagination-button-disabled-color: rgba(147, 190, 208, 0.42);
  --el-pagination-hover-color: #35f2a6;
  --el-color-primary: #21b7df;
  color: #9cc7da;
}

.monitor-header :deep(.el-pagination .btn-prev),
.monitor-header :deep(.el-pagination .btn-next),
.monitor-header :deep(.el-pagination .el-pager li) {
  min-width: 32px;
  height: 32px;
  margin: 0 3px;
  border: 1px solid rgba(105, 210, 255, 0.22);
  border-radius: 2px;
  background: rgba(7, 25, 42, 0.86);
  color: #bdefff;
  box-shadow: inset 0 0 12px rgba(84, 209, 255, 0.08);
}

.monitor-header :deep(.el-pagination .el-pager li.is-active) {
  border-color: rgba(53, 242, 166, 0.72);
  background: linear-gradient(180deg, rgba(41, 190, 220, 0.92), rgba(15, 91, 129, 0.92));
  color: #fff;
}

.monitor-header :deep(.el-pagination__total) {
  margin-left: 8px;
  color: #9cc7da;
}

.chart-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 18px 20px;
  height: calc(100% - 78px);
  overflow: hidden;
  padding: 2px 4px 8px 0;
  box-sizing: border-box;
}

.chart-board::-webkit-scrollbar {
  width: 6px;
}

.chart-board::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(104, 205, 255, 0.35);
}

.station-card {
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(105, 210, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(54, 174, 221, 0.18), transparent 36%),
    rgba(5, 18, 32, 0.78);
  box-shadow:
    inset 0 0 24px rgba(93, 215, 255, 0.08),
    0 10px 26px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(2px);
}

.empty-board {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 78px);
  border: 1px solid rgba(105, 210, 255, 0.2);
  background: rgba(5, 18, 32, 0.72);
  color: #9cc7da;
  font-size: 15px;
}

@media (max-width: 960px) {
  .monitor-header {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    height: auto;
  }

  .overview {
    width: 100%;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .station-search {
    width: 100%;
  }

  .chart-board {
    height: calc(100% - 174px);
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, minmax(168px, 1fr));
    overflow-y: auto;
  }
}
</style>
