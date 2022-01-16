<template>
  <div>
    <div class="scrollList" ref="container" @scroll="onScroll" v-bind="$attrs">
      <div class="scrollList__inner" :style="getContainerHeight.style">
        <move
          :item-id="itemId"
          :disable-event="disableEvent"
          :row-height="rowHeight"
          :start-transition="startTransition"
          :item="item"
          :filter-index="filterIndex"
          v-for="(item, index) in getVirtualList.selection"
          :key="item[itemId]"
          @start="onStartDrag"
          :start-number="getVirtualList.start"
          :has-started="isIn"
          :container="container"
          :index="getVirtualList.start + index"
          :active-index="activeIndex"
          :new-index="newIndex"
          :move-instance="getDnDMove"
          :direction="direction"
        >
          <template #default="{ mousedown }">
            <slot name="item" :item="item" :mousedown="mousedown" />
          </template>
        </move>
      </div>
    </div>

    <dragger
      v-if="startDrag"
      @firstMove="setTransition"
      :move="getDnDMove"
      :container="getContainer"
      :direction="direction"
      @update="onUpdate"
      @end="onEnd"
    >
      <slot name="drag-element" v-bind:item="list[getDnDMove.index]" />
    </dragger>
  </div>
</template>

<script setup>
import Move from './Move.vue'
import Dragger from './Dragger.vue'
import { DIRECTION } from './constants/props'
import { watch, ref, inject, provide, reactive, computed, onMounted } from 'vue'
import useAutoscroll from './hooks/useAutoscroll'
import useDnD from './hooks/useDnD'

const EVENT_OPTS = {
  passive: true,
  capture: true,
}

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

const props = defineProps({
  disableEvent: Boolean,
  list: Array,
  itemId: String,
  rowHeight: Number,
  viewport: Boolean,
  overscanCount: {
    type: Number,
    default: 1,
  },
  dropId: String,
  direction: {
    type: String,
    default: DIRECTION.COLUMN,
  },
})

const emit = defineEmits(['sort', 'dnd-insert'])

let startDrag = ref(false)
const container = ref()
let startTransition = ref(false)

let activeIndex = ref(-1)
let height = ref(0)

let offset = ref(0)
let newIndex = ref(-1)

let filterIndex = ref(-1)

const setDnDBound = inject('setBound')
const getCordinate = inject('getCordinate')
const getDnDFrom = inject('getDnDFrom')
const getDnDMove = inject('getDnDMove')
const startDnD = inject('startDnD')

const { autoscroll, stopAutoscroll } = useAutoscroll()
const { isIn, selfDrag, dropEvent } = useDnD({
  dropId: props.dropId,
  on: {
    drop: () => onEnd(),
  },
  newIndex,
})

onMounted(() => {
  const { viewportSize, windowSize } = getProp.value

  if (!props.viewport) {
    height.value = container.value[viewportSize]
  } else {
    height.value = window[windowSize] || document.documentElement[viewportSize]

    window.addEventListener('scroll', onScroll, EVENT_OPTS)
    window.addEventListener('resize', onResize, EVENT_OPTS)
  }

  setDnDBound(container.value.getBoundingClientRect(), props.dropId)
})

const setTransition = () => {
  startTransition.value = true
}

const getList = computed(() => {
  if (filterIndex.value !== -1) {
    return props.list.filter((_, index) => index !== filterIndex.value)
  }

  return props.list
})

const getVirtualList = computed(() => {
  let start = (offset.value / props.rowHeight) | 0
  let visibleRowCount = (height.value / props.rowHeight) | 0

  if (props.overscanCount) {
    start = Math.max(0, start - (start % props.overscanCount))
    visibleRowCount += props.overscanCount
  }
  let end = start + 1 + visibleRowCount

  let selection = getList.value.slice(start, end)

  return {
    selection,
    style: { [getProp.value.position]: `${start * props.rowHeight}px` },
    start,
  }
})

const getContainerHeight = computed(() => {
  const size = props.list.length * props.rowHeight

  return {
    size,
    style: {
      [getDirectionSize.value]: `${size}px`,
    },
  }
})

const getContainer = computed(() => {
  return props.viewport ? document.documentElement : container.value
})

const getDirectionSize = computed(() => {
  const classMap = {
    [DIRECTION.ROW]: 'width',
    [DIRECTION.COLUMN]: 'height',
  }

  return classMap[props.direction]
})

const getProp = computed(() => {
  const classMap = {
    [DIRECTION.ROW]: {
      scroll: 'scrollLeft',
      position: 'left',
      size: 'width',
      containerSize: 'right',

      viewportSize: 'offsetWidth',
      windowSize: 'innerWidth',
    },
    [DIRECTION.COLUMN]: {
      scroll: 'scrollTop',
      position: 'top',
      viewportSize: 'offsetHeight',
      windowSize: 'innerHeight',
      containerSize: 'bottom',

      size: 'height',
    },
  }

  return classMap[props.direction]
})

const onResize = () => {
  let height = window.innerHeight || document.documentElement.offsetHeight
  if (height !== height) {
    height = height
  }
}

const onUpdate = (y) => {
  let index = Math.round((offset.value + y) / props.rowHeight)

  index = Math.min(Math.max(0, index), props.list.length - 1)

  newIndex.value = index
}

const onNew = (y) => {
  let index = Math.round((offset.value + y) / props.rowHeight)
  index = Math.min(Math.max(0, index), props.list.length - 1)

  newIndex.value = index
}

const onStartDrag = (value) => {
  startDnD({
    fromBucket: props.dropId,
    element: value,
  })

  filterIndex.value = value.index
  startDrag.value = true
  newIndex.value = value.index
  activeIndex.value = value.index
}

const onEnd = () => {
  startTransition.value = false
  activeIndex.value = -1
  newIndex.value = -1
  startDrag.value = false
  filterIndex.value = -1
}

const onScroll = () => {
  if (!props.viewport) {
    offset.value = container.value[getProp.value.scroll]
  } else {
    offset.value = Math.max(
      0,
      (container.value && -container.value.getBoundingClientRect().top) || 0
    )
  }
}

const dndBounds = inject('bounds')

watch(isIn, (hasEntered, prevValue) => {
  if (hasEntered) {
    if (!selfDrag.value) {
      startTransition.value = true
    }
  } else {
    if (getDnDFrom.value === props.dropId) {
      //filterIndex.value = getDnDMove.index
      // Leave from
    } else {
      // Leave
    }

    stopAutoscroll()
    //activeIndex.value = -1
    newIndex.value = -1
  }
})

watch(getCordinate, (cordinate) => {
  if (isIn.value) {
    const containerBound = dndBounds[props.dropId]

    const callback = selfDrag.value ? onUpdate : onNew

    autoscroll(
      cordinate,
      containerBound,
      getDnDMove,
      getProp,
      getContainer,
      callback
    )
  }
})
</script>

<style>
.scrollList {
  overflow-y: scroll;
}

.scrollList__inner {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>
