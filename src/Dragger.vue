<template>
  <div :style="getStyle" class="fixed no-transition">
    <slot />
  </div>
</template>

<script setup>
import { DIRECTION } from './constants/props'
import { inject, onMounted, ref, provide, reactive, computed } from 'vue'

const EDGE_THRESHOLD = 20

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

let edge = reactive({
  top: 0,
  bottom: 0,
})

const emit = defineEmits(['end'])

const dndBounds = inject('getDnDBounds')
const dndSetDropZone = inject('setDropZone')
const dndSetCordinate = inject('setDnDCordinate')

onMounted(() => {
  window.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', mouseup)

  initXY = reactive(props.move.initXY)
  edge = reactive(props.move.edge)

  containerBound = reactive(props.move.containerBound)

  targetBound = reactive(props.move.targetBound)
})

const mousemove = ({ clientX, clientY }) => {
  newXY.x = clientX - initXY.x
  newXY.y = clientY - initXY.y

  const y = newXY[getProp.value.axis]

  let foundId

  for (let i = 0; i < dndBounds.value.length; i++) {
    let [dropId, bound] = dndBounds.value[i]

		var isOverlap = !(targetBound.right + newXY.x < bound.left || 
                targetBound.left + newXY.x > bound.right || 
                targetBound.bottom + newXY.y < bound.top || 
                targetBound.top + newXY.y > bound.bottom)

    if (isOverlap) {
      foundId = dropId
      break
    }
  }

  dndSetDropZone(foundId)

	dndSetCordinate(y)
}

const mouseup = () => {
  window.removeEventListener('mousemove', mousemove)
  window.removeEventListener('mouseup', mouseup)

  newXY.x = 0
  newXY.y = 0

  edge.top = 0
  edge.bottom = 0

  emit('end')
}

const getStyle = computed(() => {
  const { top, left, width, height } = targetBound

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
