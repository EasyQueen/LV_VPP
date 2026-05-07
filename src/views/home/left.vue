<!--
 * @Description:
 * @Author: ldx
 * @Date: 2024-12-13 09:35:57
 * @LastEditors: ldx
 * @LastEditTime: 2024-12-13 11:20:27
-->
<template>
  <div class="pt-10px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="a" fit="fill" />
          <span>资源容量概览</span>
        </div>
      </template>
      <template #content>
        <div class="px-16px mb-6px">
          <div class="flex justify-between gap-12px mt-6px">
            <div class="flex-1 min-w-0">
              <div class="bg_wrap_c text-10px text-#C2D6E5 pl-28px">分布式光伏总容量</div>
              <div class="capacity-value">
                <span class="text-18px text-#fff font-bold">421.55</span>
                <span class="text-12px text-#869bb0">MW</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="bg_wrap_c text-10px text-#C2D6E5 pl-28px">分布式光伏场站数量</div>
              <div class="capacity-value">
                <span class="text-18px text-#fff font-bold">43</span>
                <span class="text-12px text-#869bb0">户</span>
              </div>
            </div>
          </div>
          <div class="flex justify-between gap-12px mt-6px">
            <div class="flex-1 min-w-0">
              <div class="bg_wrap_c text-10px text-#C2D6E5 pl-28px">网侧储能容量</div>
              <div class="capacity-value">
                <span class="text-18px text-#fff font-bold">14</span>
                <span class="text-12px text-#869bb0">MW</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="bg_wrap_c text-10px text-#C2D6E5 pl-28px">负荷接入容量</div>
              <div class="capacity-value">
                <span class="text-18px text-#fff font-bold">16</span>
                <span class="text-12px text-#869bb0">MW</span>
              </div>
            </div>
          </div>
        </div>
      </template>

    </ExteriorShell>
  </div>
  <div class="pt-16px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="b" fit="fill" />
          <span>运行模式：计划曲线</span>
        </div>
      </template>
      <template #content>
        <div class="px-10px my-10px">
          <div class="h-15px flex items-center px-2px">
            <el-image class="w-9px h-9px mr-6px" :src="c" fit="fill" />
            <span class="text-11px text-#9AAEBF font-500">发电负荷因子：</span>
            <span class="metric-value">
              <span class="text-15px text-#fff font-500">25.70</span>
              <span class="text-15px text-#5BAFCB font-500 mt-2px">%</span>
            </span>
          </div>
          <div class="h-15px flex items-center px-2px mt-16px">
            <el-image class="w-9px h-9px mr-6px" :src="c" fit="fill" />
            <span class="text-11px text-#9AAEBF font-500 shrink-0">网供负荷：</span>
            <div class="bg_wrap_d flex-1 min-w-0 flex items-center justify-center font-500">
              <span class="metric-value">
                <span class="text-15px text-#fff ">18.52</span>
                <span class="text-12px text-#5BAFCB ">MW</span>
              </span>
            </div>
          </div>
          <div class="h-15px flex items-center px-2px mt-16px">
            <el-image class="w-9px h-9px mr-6px" :src="c" fit="fill" />
            <span class="text-11px text-#9AAEBF font-500 shrink-0">上网负荷：</span>
            <div class="bg_wrap_d flex-1 min-w-0 flex items-center justify-center font-500">
              <span class="metric-value">
                <span class="text-15px text-#fff ">17.62</span>
                <span class="text-12px text-#5BAFCB ">MW</span>
              </span>
            </div>
          </div>
        </div>
      </template>

    </ExteriorShell>
  </div>
  <div class="pt-16px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="e" fit="fill" />
          <span>注册调控能力</span>
        </div>
      </template>
      <template #content>
        <div class="px-16px py-14px">
          <div class="grid grid-cols-2 gap-12px">
            <div class="control-card">
              <div class="flex items-center text-11px text-#9AAEBF font-500">
                <el-image class="w-9px h-9px mr-6px" :src="c" fit="fill" />
                <span>削峰能力</span>
              </div>
              <div class="control-value">
                <span class="text-22px text-#fff font-700">1.30</span>
                <span class="text-10px text-#5BAFCB ml-4px">MW</span>
              </div>
            </div>
            <div class="control-card">
              <div class="flex items-center text-11px text-#9AAEBF font-500">
                <el-image class="w-9px h-9px mr-6px" :src="c" fit="fill" />
                <span>填谷能力</span>
              </div>
              <div class="control-value">
                <span class="text-22px text-#fff font-700">2.40</span>
                <span class="text-10px text-#5BAFCB ml-4px">MW</span>
              </div>
            </div>
          </div>
        </div>
      </template>

    </ExteriorShell>
  </div>
  <div class="pt-16px">
    <ExteriorShell>
      <template #title>
        <div class="h-26px flex items-center px-16px">
          <el-image class="w-20px h-20px mr-14px" :src="h" fit="fill" />
          <span>发电用电曲线</span>
        </div>
      </template>
      <template #content>
        <div class="px-12px py-8px h-178px">
          <Chart height="100%" :options="powerCurveOptions" />
        </div>
      </template>
    </ExteriorShell>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ExteriorShell from '@/components/exteriorShell/index.vue'
import { createOption } from '@/components/chart'
import Chart from '@/components/chart/chart.vue'

import a from '@/assets/home/a.png'
import b from '@/assets/home/b.png'
import c from '@/assets/home/c.png'
import e from '@/assets/home/e.png'
import h from '@/assets/home/h.png'

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

const createRandomSeries = (base: number, range: number) =>
  Array.from({ length: 7 }, () => Number((base + Math.random() * range).toFixed(1)))

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

const powerCurveOptions = reactive<any>(
  createOption({
    color: ['#5DA5E5', '#20C997'],
    tooltip: {
      ...darkTooltipStyle,
      trigger: 'axis',
      show: true,
      valueFormatter: (value: string) => `${Number(value).toFixed(1)} MW`,
    },
    legend: {
      top: 0,
      right: 2,
      itemWidth: 10,
      itemHeight: 6,
      textStyle: {
        color: '#C2D6E5',
        fontSize: 10,
      },
    },
    grid: {
      top: 34,
      left: 36,
      right: 12,
      bottom: 28,
    },
    xAxis: {
      data: getRecentSevenDays(),
      axisLabel: {
        color: '#8FA7B6',
        fontSize: 9,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(143, 167, 182, 0.24)',
        },
      },
    },
    yAxis: {
      name: 'MW',
      nameTextStyle: {
        color: '#5BAFCB',
        fontSize: 9,
        padding: [0, 20, 0, 0],
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(91, 175, 203, 0.12)',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#8FA7B6',
        fontSize: 9,
      },
    },
    series: [
      {
        name: '发电曲线',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: createRandomSeries(118, 42),
        areaStyle: {
          color: 'rgba(93, 165, 229, 0.14)',
        },
      },
      {
        name: '消纳数据',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: createRandomSeries(96, 36),
        areaStyle: {
          color: 'rgba(32, 201, 151, 0.1)',
        },
      },
    ],
  }),
)
</script>

<style scoped lang="scss">
.bg_wrap_c {
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  background: url('@/assets/home/tb.png');
  background-size: 100% 24px;
  background-repeat: no-repeat;
  white-space: nowrap;
}

.capacity-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
}

.metric-value {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.bg_wrap_d {
  // width: 100%;
  background: url('@/assets/home/d.png');
  background-size: cover;
  background-repeat: no-repeat;
}

.bg_warp_e {
  background: url('@/assets/home/g.png');
  background-size: cover;
  background-repeat: no-repeat;
}

.control-card {
  height: 72px;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(35, 90, 118, 0.22), rgba(10, 28, 42, 0.64));
  border: 1px solid rgba(91, 175, 203, 0.28);
  box-shadow: inset 0 0 18px rgba(91, 175, 203, 0.12);
}

.control-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-top: auto;
  padding-bottom: 2px;
}

</style>
