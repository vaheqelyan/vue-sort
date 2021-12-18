<template>
  <div
    @mousedown="mousedown"
    :style="getStyle"
    :class="{ 'transition no-select': hasStarted }"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, provide, reactive, computed } from 'vue'
import { DIRECTION } from './constants/props'

const EDGE_THRESHOLD = 20

const props = defineProps({
  item: Object,
  hasStarted: Boolean,
  boundEntries: Array,
  columnName: String,
  container: HTMLDivElement,
  index: Number,
  newIndex: Number,
  activeIndex: Number,
  moveInstance: Object,
  direction: String,
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

  targetBound = reactive(currentTarget.getBoundingClientRect())

  containerBound = reactive(props.container.getBoundingClientRect())

  enlargeEdges()

  emit('start', {
    targetBound: targetBound,
    containerBound: containerBound,
    initXY: initXY,
    edge: edge,
    index: props.index,
  })
}

const enlargeEdges = () => {
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
}

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

const getStyle = computed(() => {
  if (
    !props.hasStarted ||
    props.newIndex === -1 ||
    props.activeIndex === -1 ||
    props.activeIndex === props.index
  )
    return

  const { translateAxis, size } = getProp.value

  const translateSize = props.moveInstance.targetBound[size]

  const isDown = Math.sign(props.newIndex - props.activeIndex) > 0

  if (
    props.index >= props.activeIndex &&
    props.index <= props.newIndex &&
    isDown
  ) {
    return {
      transform: `translate${translateAxis}(${-translateSize}px)`,
    }
  } else if (
    props.index <= props.activeIndex &&
    props.index >= props.newIndex &&
    !isDown
  ) {
    return {
      transform: `translate${translateAxis}(${translateSize}px)`,
    }
  }
})
</script>

<style>
.transition {
  transition: transform 0.2s;
}

.fixed {
  position: fixed;
}

.no-select {
  user-select: none;
}
</style>
