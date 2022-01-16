<template>
  <div
    :data-index="index"
    @mousedown="mousedown"
    :style="getStyle"
    :class="getClass"
    class="item"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, provide, reactive, computed, inject } from 'vue'
import { DIRECTION } from './constants/props'

const EDGE_THRESHOLD = 20

const props = defineProps({
  rowHeight: Number,
  item: Object,
  hasStarted: Boolean,
  boundEntries: Array,
  columnName: String,
  activeIndex: Number,
  container: HTMLDivElement,
  index: Number,
  newIndex: Number,
  moveInstance: Object,
  direction: String,
  startNumber: Number,
  filterIndex: Number,
  startTransition: Boolean,
})

const initXY = reactive({
  x: 0,
  y: 0,
})

const newXY = reactive({
  x: 0,
  y: 0,
})

let targetBound = reactive({ width: 0, height: 0, top: 0, left: 0 })
let containerBound = reactive({ width: 0, height: 0, top: 0, left: 0 })

const height = ref(0)
const width = ref(0)
const top = ref(0)
const left = ref(0)
// Autoscroll
const oldY = ref(0)
const t = ref(0)
const vel = ref(1)
const sign = ref(0)
const intervalId = ref(false)

const edge = reactive({
  top: 0,
  bottom: 0,
})

const emit = defineEmits(['start'])

const mousedown = (event) => {
  const { clientX, clientY, currentTarget } = event

  initXY.x = clientX
  initXY.y = clientY

  const targetBound = currentTarget.getBoundingClientRect()
  const containerBound = props.container.getBoundingClientRect()

  //enlargeEdges()

  const top = targetBound[getProp.value.position]

  const containerTop = containerBound[getProp.value.position]

  emit('start', {
    targetBound,
    containerBound,
    initXY: initXY,
    edge: edge,
    index: props.index,
    initPosition: top - containerTop,
  })
}

/*const enlargeEdges = () => {
  const height = targetBound[getProp.size]
  const top = targetBound[getProp.position]

  const containerTop = containerBound[getProp.position]
  const containerBottom = containerBound[getProp.containerPosition]

  const topSensor = top < containerTop + EDGE_THRESHOLD
  const bottomSensor = top + height > containerBottom - EDGE_THRESHOLD

  if (bottomSensor) {
    edge.bottom = top + height - (containerBottom - EDGE_THRESHOLD)
  }
  if (topSensor) {
    edge.top = top - (containerTop + EDGE_THRESHOLD)
  }
}*/

const getProp = computed(() => {
  const propMap = {
    [DIRECTION.ROW]: {
      translateAxis: 'X',
      size: 'width',
      position: 'left',
      containerPosition: 'right',
    },
    [DIRECTION.COLUMN]: {
      translateAxis: 'Y',
      size: 'height',
      position: 'top',
      containerPosition: 'bottom',
    },
  }

  return propMap[props.direction]
})

const getClass = computed(() => {
  return [
    { 'transition no-select': props.startTransition },
    `vue-sort--${props.direction}`
  ]
})

const getStyle = computed(() => {
  const { index, activeIndex, newIndex, rowHeight } = props

  const { position, translateAxis, size } = getProp.value

  if (props.hasStarted) {
    const translateSize = props.moveInstance.targetBound[size]

    let y = index * rowHeight

    if (index >= newIndex && newIndex !== -1) {
      return {
        [position]: `${index * rowHeight}px`,
        transform: `translate${translateAxis}(${rowHeight}px)`,
        [size]: `${rowHeight}px`
      }
    }
  }

  return {
    [position]: `${index * rowHeight}px`,
    [size]: `${rowHeight}px`
  }
})
</script>

<style>
.item {
  position: absolute;
  width: 100%;
}

.transition {
  transition: transform 0.2s;
}

.fixed {
  position: fixed;
}

.no-select {
  user-select: none;
}

.vue-sort--column {
  width: 100%;
}

.vue-sort--row {
  height: 100%;
}
</style>
