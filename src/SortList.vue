<template>
  <div>
    <div class="scrollList" ref="container" @scroll="onScroll" v-bind="$attrs">
      <div class="scrollList__inner" :style="getContainerHeight.style">
        <div
          class="scrollList__content"
          :class="getDirectionClass"
          :style="getVirtualList.style"
        >
          <move
            v-for="(item, index) in getVirtualList.selection"
            :key="item[itemId]"
            @start="onStartDrag"
            :has-started="startDrag"
            :container="container"
            :index="getVirtualList.start + index"
            :active-index="activeIndex"
            :new-index="newIndex"
            :move-instance="getDnDMove"
            :direction="direction"
          >
            <slot
              name="item"
              v-bind:item="item"
              v-bind:is-active="getVirtualList.start + index === activeIndex"
            />
          </move>
        </div>
      </div>
    </div>

    <dragger
      v-if="startDrag"
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

const emit = defineEmits(['sort'])

let startDrag = ref(false)
const container = ref()

let activeIndex = ref(-1)
let height = ref(0)

let offset = ref(0)
let newIndex = ref(-1)

const setDnDBound = inject('setBound')
const getCordinate = inject('getCordinate')
const getDnDId = inject('getDropId')
const setDnDFrom = inject('setDnDFrom')
const getDnDFrom = inject('getDnDFrom')
const getDnDMove = inject('getDnDMove')
const setDnDMove = inject('setDnDMove')

const { autoscroll, stopAutoscroll } = useAutoscroll()
const { isIn, selfDrag } = useDnD(props.dropId)

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

const getVirtualList = computed(() => {
  let start = (offset.value / props.rowHeight) | 0
  let visibleRowCount = (height.value / props.rowHeight) | 0

  if (props.overscanCount) {
    start = Math.max(0, start - (start % props.overscanCount))
    visibleRowCount += props.overscanCount
  }
  let end = start + 1 + visibleRowCount

  let selection = props.list.slice(start, end)

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

const getDirectionClass = computed(() => {
  const classMap = {
    [DIRECTION.ROW]: 'scrollList__content--row',
    [DIRECTION.COLUMN]: 'scrollList__content--col',
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

  activeIndex.value = index
  newIndex.value = index
}

const onStartDrag = (value) => {
  setDnDFrom(props.dropId)

  setDnDMove(value)

  startDrag.value = true
}

const onEnd = () => {
  if (newIndex !== -1) {
    emit('sort', {
      index: activeIndex.value,
      newIndex: newIndex.value,
    })
  }

  activeIndex.value = -1
  newIndex.value = -1
  startDrag.value = false
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

watch(isIn, hasEntered => {
  if (hasEntered) {
    selfDrag.value = props.dropId === getDnDFrom.value

    if (selfDrag.value) {
      activeIndex.value = getDnDMove.index
    }
  } else {
    stopAutoscroll()
    activeIndex.value = -1
    newIndex.value = -1
  }
})

watch(getCordinate, (cordinate) => {
  if (isIn.value) {
    const containerBound = dndBounds[props.dropId]

    if (selfDrag.value) {
      autoscroll(
        cordinate,
        containerBound,
        getDnDMove,
        getProp,
        getContainer,
        onUpdate
      )
    } else {
      autoscroll(
        cordinate,
        containerBound,
        getDnDMove,
        getProp,
        getContainer,
        onNew
      )
    }
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
  min-height: 100%;
}

.scrollList__content {
  /*position: relative;*/
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
}

.scrollList__content--row {
  flex-direction: row;
}

.scrollList__content--col {
  flex-direction: column;
}
</style>
