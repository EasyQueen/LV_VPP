<script setup lang="ts">
import Left from './left.vue'
import Right from './right.vue'
import { LineLayer, PointLayer, Scene } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'
import { onMounted, onUnmounted, ref } from 'vue'
import autofit from 'autofit.js'
import c1 from '@/assets/home/marker-core.svg'
import c2 from '@/assets/home/marker-blue.svg'
import c3 from '@/assets/home/marker-cyan.svg'
import c4 from '@/assets/home/marker-pink.svg'

type CityMarker = 'core' | 'blue' | 'blue-alt' | 'pink'

type CityLabel = {
  name: string
  x: number
  y: number
}

const hubCity = {
  name: '合肥',
  lng: 117.227239,
  lat: 31.820586,
  marker: 'core' as CityMarker,
}

const cityPoints = [
  hubCity,
  { name: '阜阳', lng: 115.819729, lat: 32.896969, marker: 'blue' as CityMarker },
  { name: '淮北', lng: 116.794664, lat: 33.971707, marker: 'blue' as CityMarker },
  { name: '六安', lng: 116.505253, lat: 31.750814, marker: 'blue-alt' as CityMarker },
  { name: '铜陵', lng: 117.812039, lat: 30.945667, marker: 'pink' as CityMarker },
  { name: '黄山', lng: 118.22096, lat: 30.48, marker: 'pink' as CityMarker },
  { name: '池州', lng: 117.491568, lat: 30.66469, marker: 'pink' as CityMarker },
  { name: '宣城', lng: 118.758816, lat: 30.940718, marker: 'pink' as CityMarker },
  { name: '芜湖', lng: 118.433065, lat: 31.352614, marker: 'blue' as CityMarker },
  { name: '蚌埠', lng: 117.389719, lat: 33.971707, marker: 'blue-alt' as CityMarker },
  { name: '宿州', lng: 116.984084, lat: 33.636772, marker: 'blue' as CityMarker },
  { name: '南京', lng: 118.796877, lat: 32.060255, marker: 'blue-alt' as CityMarker },
  { name: '苏州', lng: 120.585315, lat: 31.298886, marker: 'pink' as CityMarker },
  { name: '无锡', lng: 120.31237, lat: 31.491911, marker: 'blue' as CityMarker },
  { name: '淮安', lng: 119.021265, lat: 33.597506, marker: 'blue-alt' as CityMarker },
]

const lineData = {
  type: 'FeatureCollection',
  features: cityPoints
    .filter((city) => city.name !== hubCity.name)
    .map((city) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [hubCity.lng, hubCity.lat],
          [city.lng, city.lat],
        ],
      },
      properties: {
        name: city.name,
      },
    })),
}

let scene: Scene | null = null
let labelResizeObserver: ResizeObserver | null = null
let labelUpdateFrame = 0
const cityLabels = ref<CityLabel[]>([])
const CITY_LABEL_Y_OFFSET = -20

const updateCityLabels = () => {
  if (!scene) return
  const container = document.getElementById('container')
  const width = container?.clientWidth || 1
  const height = container?.clientHeight || 1

  cityLabels.value = cityPoints.map((city) => {
    const point = scene?.lngLatToContainer([city.lng, city.lat])

    return {
      name: city.name,
      x: (((point?.x ?? 0) / width) * 100),
      y: ((((point?.y ?? 0) + CITY_LABEL_Y_OFFSET) / height) * 100),
    }
  })
}

const scheduleCityLabelUpdate = () => {
  if (labelUpdateFrame) {
    cancelAnimationFrame(labelUpdateFrame)
  }

  labelUpdateFrame = requestAnimationFrame(() => {
    labelUpdateFrame = requestAnimationFrame(() => {
      updateCityLabels()
      labelUpdateFrame = 0
    })
  })
}

onMounted(() => {
  autofit.init({
    el: '.wrapfit',
    dw: 1440,
    dh: 780,
  })

  scene = new Scene({
    id: 'container',
    logoVisible: false,
    map: new GaodeMap({
      mapStyle: 'amap://styles/dark',
      center: [118.22, 32.35],
      pitch: 0,
      zoom: 6.75,
      dragEnable: false,
      zoomEnable: false,
      keyboardEnable: false,
      doubleClickZoom: false,
      scrollWheel: false,
      showLabel: false,
      token: '455cdb79bf8735a87862d83e16f06c94',
    }),
  })

  scene.addImage('city-core', c1)
  scene.addImage('city-blue', c2)
  scene.addImage('city-blue-alt', c3)
  scene.addImage('city-pink', c4)

  scene.on('loaded', () => {
    const lineLayer = new LineLayer({})
      .source(lineData)
      .size(2)
      .shape('line')
      .style({
        opacity: 0.85,
        sourceColor: '#73d7ff',
        targetColor: '#e095c0',
      })
      .animate({
        interval: 1,
        duration: 4,
        trailLength: 2,
      })
    scene?.addLayer(lineLayer)

    const pointLayer = new PointLayer()
      .source(cityPoints, {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat',
        },
      })
      .shape('marker', ['city-core', 'city-blue', 'city-blue-alt', 'city-pink'])
      .size(18)
      .style({
        offsets: [0, 34],
      })
    scene?.addLayer(pointLayer)

    scheduleCityLabelUpdate()
  })

  const container = document.getElementById('container')
  if (container) {
    labelResizeObserver = new ResizeObserver(scheduleCityLabelUpdate)
    labelResizeObserver.observe(container)
  }
  window.addEventListener('resize', scheduleCityLabelUpdate)
})
onUnmounted(() => {
  window.removeEventListener('resize', scheduleCityLabelUpdate)
  if (labelUpdateFrame) {
    cancelAnimationFrame(labelUpdateFrame)
    labelUpdateFrame = 0
  }
  labelResizeObserver?.disconnect()
  labelResizeObserver = null
  scene?.destroy()
  scene = null
  autofit.off()
})
</script>

<template>
  <main class="relative overflow-hidden h-100% wrapfit">
    <div id="container" />
    <div class="city-label-layer">
      <span
        v-for="label in cityLabels"
        :key="label.name"
        class="city-label"
        :style="{ left: `${label.x}%`, top: `${label.y}%` }"
      >
        {{ label.name }}
      </span>
    </div>
    <div class="left z-9 absolute left-15px top-0px w-350px h-100%">
      <Left></Left>
    </div>
    <div class="right z-9 absolute right-16px top-0px w-380px h-100%">
      <Right></Right>
    </div>
  </main>
</template>

<style lang="scss" scoped>
#container {
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  background: #0b111a;
}

#container :deep(.amap-layer) {
  filter: brightness(1.18) contrast(1.28) saturate(1.12);
}

.city-label-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: calc(100% - 60px);
  pointer-events: none;
  overflow: hidden;
}

.city-label {
  position: absolute;
  transform: translateX(-50%);
  color: #e3f4ff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-shadow:
    0 1px 2px #07131f,
    0 0 6px rgba(7, 19, 31, 0.92),
    0 0 10px rgba(91, 175, 203, 0.42);
}
</style>
