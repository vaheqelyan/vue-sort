<template>
  <div :style="getStyle" class="fixed no-transition">
    <slot />
  </div>
</template>

<script setup>
import { DIRECTION } from './constants/props'
import { onMounted, ref, provide, reactive, computed } from 'vue'

const EDGE_THRESHOLD = 20

function throttle(func, timeFrame) {
  var lastTime = 0
  return function () {
    var now = new Date()
    if (now - lastTime >= timeFrame) {
      func()
      lastTime = now
    }
  }
}

const props = defineProps({
  move: Object,
  container: HTMLDivElement,
  viewport: Boolean,
  direction: String,
})

let initXY = reactive({
  x: 0,
  y: 0,
})

let newXY = reactive({
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
let oldY = ref(0)
let t = ref(0)
let vel = ref(1)
let sign = ref(0)
let intervalId = ref(false)

let edge = reactive({
  top: 0,
  bottom: 0,
})

const emit = defineEmits(['update', 'end'])

onMounted(() => {
  window.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', mouseup)

  initXY = reactive(props.move.initXY)
  edge = reactive(props.move.edge)

  containerBound = reactive(props.move.containerBound)

  targetBound = reactive(props.move.targetBound)
})

const mousemove = ({ clientX, clientY }) => {
  const top = targetBound[getProp.value.position]
  const height = targetBound[getProp.value.size]

  const containerTop = containerBound[getProp.value.position]
  const containerBottom = containerBound[getProp.value.containerSize]

  newXY.x = clientX - initXY.x
  newXY.y = clientY - initXY.y

  const y = newXY[getProp.value.axis]

  const topSensor = top + y < containerTop + EDGE_THRESHOLD
  const bottomSensor = top + y + height > containerBottom - EDGE_THRESHOLD

  const velocityBottom =
    (top + y + height - (containerBottom + edge.bottom - EDGE_THRESHOLD)) /
    EDGE_THRESHOLD

  const velocityTop =
    (containerTop + edge.top + EDGE_THRESHOLD - (top + y)) / EDGE_THRESHOLD

  sign = topSensor ? -1 : bottomSensor ? 1 : 0

  vel = sign === -1 ? Math.max(0, velocityTop) : Math.max(0, velocityBottom)

  if (topSensor || bottomSensor) {
    if (!intervalId) {
      intervalId = setInterval(() => {
        update()
        props.container[getProp.value.scroll] += 2 * vel * sign
      }, 10)
    }
  } else if (intervalId) {
    // Clear timer when auto scroll is not true
    clearInterval(intervalId)
    intervalId = false
    sign = 0
    vel = 1
    edge.top = 0
    edge.bottom = 0
  } else {
    update()
  }
}

const mouseup = () => {
  window.removeEventListener('mousemove', mousemove)
  window.removeEventListener('mouseup', mouseup)

  newXY.x = 0
  newXY.y = 0

  edge.top = 0
  edge.bottom = 0
  clearInterval(intervalId)

  intervalId = false

  emit('end')
}

const update = () => {
  const { position, axis } = getProp.value

  emit('update', targetBound[position] - containerBound[position] + newXY[axis])
}

const getStyle = computed(() => {
  const { top, left, width, height } = props.move.targetBound

  return {
    transform: `translate(${newXY.x}px, ${newXY.y}px)`,
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: 2,
  }
})

const getProp = computed(() => {
  const propMap = {
    [DIRECTION.ROW]: {
      position: 'left',
      size: 'width',
      axis: 'x',
      scroll: 'scrollLeft',
      containerSize: 'right',
    },
    [DIRECTION.COLUMN]: {
      position: 'top',
      axis: 'y',
      size: 'height',
      scroll: 'scrollTop',
      containerSize: 'bottom',
    },
  }

  return propMap[props.direction]
})
</script>

<style>
.no-transition {
  transition: none;
}
</style>
