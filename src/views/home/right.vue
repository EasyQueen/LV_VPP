<!--
 * @Description:
 * @Author: ldx
 * @Date: 2024-12-13 09:38:18
 * @LastEditors: ldx
 * @LastEditTime: 2024-12-13 11:07:14
-->
<template>
  <div class="pt-10px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="ra" fit="fill" />
          <span>电力交易监控（实时）</span>
        </div>
      </template>
      <template #content>
        <div class="px-12px py-8px h-188px">
          <Chart height="100%" :options="chart1Options" />
        </div>
      </template>
    </ExteriorShell>
  </div>
  <div class="pt-10px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="rb" fit="fill" />
          <span>电力交易监控（日前）</span>
        </div>
      </template>
      <template #content>
        <div class="px-12px py-8px h-188px">
          <Chart height="100%" :options="chart2Options" />
        </div>
      </template>
    </ExteriorShell>
  </div>
  <div class="pt-10px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="rc" fit="fill" />
          <span>站点资源监控</span>
        </div>
      </template>
      <template #content>
        <div class="px-10px py-8px h-188px">
          <table class="site-table">
            <thead>
              <tr>
                <th>场站</th>
                <th>归属城市</th>
                <th>运营状态</th>
                <th>昨日发电量<br />（kWh）</th>
                <th>昨日交易量<br />（kWh）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in siteResourceRows" :key="item.name">
                <td class="site-name">{{ item.name }}</td>
                <td>{{ item.city }}</td>
                <td>
                  <span class="status-tag" :class="{ offline: item.status === '离线' }">
                    {{ item.status }}
                  </span>
                </td>
                <td>{{ item.generation }}</td>
                <td>{{ item.trade }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </ExteriorShell>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import ExteriorShell from '@/components/exteriorShell/index.vue'
import ra from '@/assets/home/ra.png'
import rb from '@/assets/home/rb.png'
import rc from '@/assets/home/rc.png'
import { createOption } from '@/components/chart';
import Chart from '@/components/chart/chart.vue'
const chart1Options = reactive<any>(createOption())
const chart2Options = reactive<any>(createOption())

const darkTooltipStyle = {
  backgroundColor: 'rgba(8, 22, 34, 0.94)',
  borderColor: 'rgba(91, 175, 203, 0.58)',
  borderWidth: 1,
  extraCssText: 'box-shadow: 0 0 14px rgba(91, 175, 203, 0.22);',
  textStyle: {
    color: '#C2D6E5',
    fontSize: 11,
  },
}

type SiteResourceRow = {
  name: string
  city: string
  status: '正常' | '离线'
  generation: number
  trade: number
}

const isSunnyTradingDay = true

const getPast12TradingHours = () => {
  const now = new Date()

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now)
    date.setHours(now.getHours() - (11 - index) * 2, 0, 0, 0)

    return `${`${date.getHours()}`.padStart(2, '0')}:00`
  })
}

const getPriceByHour = (hourLabel: string, offset = 0) => {
  const hour = Number(hourLabel.split(':')[0])
  const isSunnyLowPriceHour = isSunnyTradingDay && hour >= 9 && hour <= 16
  const basePrice = isSunnyLowPriceHour ? 0.015 + Math.random() * 0.035 : 0.3 + Math.random() * 0.1

  return Number(Math.max(0, basePrice + offset).toFixed(3))
}

const tradingHours = getPast12TradingHours()
const marketTradingPrices = tradingHours.map((hour) => getPriceByHour(hour, 0))
const greenBoatPremiumCount = Math.round(tradingHours.length * 0.7)
const greenBoatTradingPrices = marketTradingPrices.map((marketPrice, index) => {
  const isPremiumPoint = index < greenBoatPremiumCount
  const offset = isPremiumPoint ? 0.025 + Math.random() * 0.045 : -(0.018 + Math.random() * 0.032)

  return Number(Math.max(0, marketPrice + offset).toFixed(3))
})

const getRecentSevenDays = () => {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - 6 + index)
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${month}/${day}`
  })
}

const dayAheadDates = getRecentSevenDays()
const marketDayAheadPrices = dayAheadDates.map(() => Number((0.31 + Math.random() * 0.09).toFixed(3)))
const greenBoatDayAheadPremiumIndexes = new Set([0, 1, 3, 4, 6])
const greenBoatDayAheadPrices = marketDayAheadPrices.map((marketPrice, index) => {
  const isPremiumPoint = greenBoatDayAheadPremiumIndexes.has(index)
  const offset = isPremiumPoint ? 0.018 + Math.random() * 0.042 : -(0.012 + Math.random() * 0.028)

  return Number(Math.max(0, marketPrice + offset).toFixed(3))
})

const siteResourceRows: SiteResourceRow[] = [
  { name: '安徽瑞隆', city: '合肥', status: '正常', generation: 28640, trade: 10458 },
  { name: '肥西零重力', city: '合肥', status: '正常', generation: 18420, trade: 7260 },
  { name: '合肥周谷堆', city: '合肥', status: '正常', generation: 3920, trade: 486 },
  { name: '合肥航嘉', city: '合肥', status: '正常', generation: 12680, trade: 3984 },
  { name: '淮北电子产业园', city: '淮北', status: '正常', generation: 23150, trade: 11235 },
]

onMounted(() => {
  chart1Options.color = ['#20C997', '#5DA5E5']
  chart1Options.tooltip = {
    ...darkTooltipStyle,
    trigger: 'axis',
    show: true,
    valueFormatter: (value: string) => `${Number(value).toFixed(3)} 元/kWh`,
  }
  chart1Options.legend = {
    top: 0,
    right: 2,
    itemWidth: 10,
    itemHeight: 6,
    textStyle: {
      color: '#C2D6E5',
      fontSize: 10,
    },
  }
  chart1Options.grid = {
    top: 34,
    left: 38,
    right: 12,
    bottom: 24,
  }
  chart1Options.xAxis.data = tradingHours
  chart1Options.xAxis.axisLabel = {
    interval: 1,
    color: '#8FA7B6',
    fontSize: 8,
  }
  chart1Options.yAxis.name = '元/kWh'
  chart1Options.yAxis.nameTextStyle = {
    color: '#5BAFCB',
    fontSize: 9,
    padding: [0, 16, 0, 0],
  }
  chart1Options.yAxis.min = 0
  chart1Options.yAxis.max = 0.5
  chart1Options.yAxis.axisLabel = {
    color: '#8FA7B6',
    fontSize: 9,
    formatter: (value: number) => value.toFixed(1),
  }
  chart1Options.yAxis.splitLine = {
    show: true,
    lineStyle: {
      color: 'rgba(91, 175, 203, 0.12)',
      type: 'dashed',
    },
  }
  chart1Options.series = [
    {
      data: greenBoatTradingPrices,
      name: '绿舟交易均价',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      areaStyle: {
        color: 'rgba(32, 201, 151, 0.12)',
      },
    },
    {
      data: marketTradingPrices,
      name: '市场交易均价',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      areaStyle: {
        color: 'rgba(93, 165, 229, 0.1)',
      },
    },
  ]
  chart2Options.color = ['#20C997', '#ffffff']
  chart2Options.tooltip = {
    ...darkTooltipStyle,
    trigger: 'axis',
    show: true,
    valueFormatter: (value: string) => `${Number(value).toFixed(3)} 元/kWh`,
  }
  chart2Options.legend = {
    top: 0,
    right: 2,
    itemWidth: 10,
    itemHeight: 6,
    textStyle: {
      color: '#C2D6E5',
      fontSize: 10,
    },
  }
  chart2Options.grid = {
    top: 34,
    left: 38,
    right: 12,
    bottom: 24,
  }
  chart2Options.xAxis.data = dayAheadDates
  chart2Options.xAxis.axisLabel = {
    interval: 0,
    color: '#8FA7B6',
    fontSize: 9,
  }
  chart2Options.yAxis.name = '元/kWh'
  chart2Options.yAxis.nameTextStyle = {
    color: '#5BAFCB',
    fontSize: 9,
    padding: [0, 16, 0, 0],
  }
  chart2Options.yAxis.min = 0
  chart2Options.yAxis.max = 0.5
  chart2Options.yAxis.axisLabel = {
    color: '#8FA7B6',
    fontSize: 9,
    formatter: (value: number) => value.toFixed(1),
  }
  chart2Options.yAxis.splitLine = {
    show: true,
    lineStyle: {
      color: 'rgba(91, 175, 203, 0.12)',
      type: 'dashed',
    },
  }
  chart2Options.series = [
    {
      data: greenBoatDayAheadPrices,
      name: '绿舟交易均价',
      type: 'bar',
      color: '#20C997',
      barWidth: 8,
      barGap: '35%',
    },
    {
      data: marketDayAheadPrices,
      name: '市场交易均价',
      type: 'bar',
      color: '#ffffff',
      barWidth: 8,
    },
  ]
})

</script>

<style scoped lang="scss">
.site-table {
  width: 100%;
  height: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 4px;
  color: #c2d6e5;
  font-size: 10px;
}

.site-table th {
  height: 38px;
  color: #8fa7b6;
  font-weight: 500;
  line-height: 14px;
  text-align: center;
  background: rgba(27, 58, 76, 0.38);
  border-top: 1px solid rgba(91, 175, 203, 0.18);
  border-bottom: 1px solid rgba(91, 175, 203, 0.18);
}

.site-table td {
  height: 23px;
  text-align: center;
  background: rgba(13, 34, 48, 0.52);
  border-top: 1px solid rgba(91, 175, 203, 0.1);
  border-bottom: 1px solid rgba(91, 175, 203, 0.1);
}

.site-table th:first-child,
.site-table td:first-child {
  width: 82px;
  text-align: left;
  padding-left: 8px;
}

.site-table th:nth-child(2),
.site-table td:nth-child(2) {
  width: 58px;
  padding-right: 8px;
}

.site-table th:nth-child(3),
.site-table td:nth-child(3) {
  width: 60px;
}

.site-name {
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 16px;
  color: #20c997;
  background: rgba(32, 201, 151, 0.12);
  border: 1px solid rgba(32, 201, 151, 0.34);
}

.status-tag.offline {
  color: #b8656e;
  background: rgba(184, 101, 110, 0.12);
  border-color: rgba(184, 101, 110, 0.36);
}
</style>
