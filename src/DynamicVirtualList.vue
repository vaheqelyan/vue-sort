<template>
  <div class="vList">
    <div
      class="vList__inner"
      :class="getProp.innerClass"
      ref="viewport"
      @scroll="onScroll"
    >
      <div :style="{ flexBasis: `${top}px`, flexShrink: 0 }"></div>

      <div class="vList__content" :class="getProp.contentClass" ref="content">
        <Move
          v-for="(row, index) in visible"
          :key="row.data[itemId]"
          @start="onStartDrag"
          :has-started="hasStarted"
          :container="viewport"
          :index="start + index"
          :active-index="activeIndex"
          :new-index="newIndex"
          :move-instance="moveInstance"
          :direction="direction"
          class="vList__row"
        >
          <slot
            name="item"
            v-bind:item="row"
            v-bind:is-active="start + index === activeIndex"
          />
        </Move>
      </div>

      <div :style="{ flexBasis: `${bottom}px`, flexShrink: 0 }"></div>
    </div>

    <Dragger
      v-if="hasStarted"
      :move="moveInstance"
      :container="getContainer"
      :direction="direction"
      @update="onUpdate"
      @end="onEnd"
    >
      <slot name="drag-element" v-bind:item="list[activeIndex]" />
    </Dragger>

    <div ref="logger"></div>
  </div>
</template>

<script setup>
import Move from './Move.vue'
import Dragger from './Dragger.vue'
import { DIRECTION } from './constants/props'
import useAutoscroll from './hooks/useAutoscroll'
import useDnD from './hooks/useDnD'
import {
  watch,
  ref,
  inject,
  nextTick,
  provide,
  reactive,
  computed,
  onMounted,
} from 'vue'

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

const EVENT_OPTS = {
  passive: true,
  capture: true,
}

const props = defineProps({
  list: Array,
  viewport: Boolean,
  itemId: String,
  direction: {
    type: String,
    default: DIRECTION.COLUMN,
  },
})

let bottom = ref(0)
let top = ref(0)
let start = ref(0)
let end = ref(0)
let viewportHeight = ref(0)
let rows = ref([])

let viewport = ref()
let content = ref()

let heightMap = reactive([])

let averageHeight = ref(0)
// ---
let hasStarted = ref(false)
let newIndex = ref(-1)
let activeIndex = ref(-1)
let moveInstance = reactive({})
let offset = ref(0)

onMounted(() => {
  if (props.viewport) {
    resized()
    addEventListener('resize', resized, EVENT_OPTS)
    addEventListener('scroll', onScroll, EVENT_OPTS)
  } else {
    viewportHeight.value = viewport.value[getProp.value.offsetSize]
  }

  rows.value = content.value.getElementsByClassName('vList__row')
  initVisibleRows()
})

const initVisibleRows = async () => {
  const scrollTop = viewport.value[getProp.value.scroll]

  await nextTick()

  let content_height = top.value - scrollTop
  let i = start.value

  while (content_height < viewportHeight.value && i < props.list.length) {
    let row = rows.value[i - start.value]

    if (!row) {
      end.value = i + 1
      await nextTick()
      row = rows.value[i - start.value]
    }

    const rowOffsetHeight = row[getProp.value.offsetSize]

    const row_height = (heightMap[i] = rowOffsetHeight)

    content_height += row_height

    i += 1
  }

  const remaining = props.list.length - end.value
  averageHeight.value = (top.value + content_height) / end.value

  bottom.value = remaining * averageHeight.value
  heightMap.length = props.list.length
}

const resized = () => {
  let height = window.innerHeight || document.documentElement.offsetHeight
  if (height !== viewportHeight.value) {
    viewportHeight.value = height
  }
}

const onScroll = async () => {
  let scrollTop = 0

  if (!props.viewport) {
    scrollTop = viewport.value[getProp.value.scroll]
  } else {
    scrollTop = Math.max(0, -viewport.value.getBoundingClientRect().top || 0)
  }

  offset.value = scrollTop

  const listLength = props.list.length

  // Get start
  let i = 0
  let totalHeight = 0

  while (i < listLength) {
    const rowHeight = heightMap[i] || averageHeight.value

    if (totalHeight + rowHeight > scrollTop) {
      start.value = i

      top.value = totalHeight
      break
    }

    totalHeight += rowHeight
    i += 1
  }

  while (i < listLength) {
    if (heightMap[i]) {
      totalHeight += heightMap[i]
    } else if (rows.value[i]) {
      totalHeight += rows.value[i][getProp.value.offsetSize]
    } else {
      end.value = i + 1
      await nextTick()

      const rowOffsetHeight =
        rows.value[i - start.value][getProp.value.offsetSize]

      totalHeight += rowOffsetHeight

      heightMap[i] = rowOffsetHeight
    }

    i++

    if (totalHeight > scrollTop + viewportHeight.value) break
  }

  end.value = i

  const remaining = listLength - end.value
  averageHeight.value = totalHeight / end.value

  bottom.value = remaining * averageHeight.value
}

const onStartDrag = (value) => {
  Object.assign(moveInstance, value)

  hasStarted.value = true
  activeIndex.value = value.index
}

const onUpdate = (y) => {
  if (hasStarted.value) {
    const targetHeight = moveInstance.targetBound[getProp.value.targetSize]

    let offset = offset.value + y + targetHeight

    let newIndex

    let top = top.value

    logger.value.innerHTML = `<b>${offset}</b>`

    for (let i = start.value; i < end.value; i++) {
      const height = heightMap[i]
      const nextHeight = heightMap[i + 1] || 0

      if (offset <= top + height + nextHeight / 2) {
        newIndex = i
        break
      }

      top += height
    }

    if (newIndex !== undefined) {
      newIndex.value = newIndex
    }
  }
}

const onEnd = () => {
  if (newIndex.value !== -1) {
    let heightMap = heightMap.slice()

    heightMap = reactive(heightMap.move(this.activeIndex, this.newIndex))

    emit('sort', {
      index: activeIndex.value,
      newIndex: newIndex.value,
    })
  }

  onScroll()

  activeIndex.value = -1
  newIndex.value = -1
  hasStarted.value = false
}

const visible = computed(() => {
  return props.list.slice(start.value, end.value).map((data, i) => ({
    index: i + start.value,
    data,
  }))
})

const getContentStyle = computed(() => {
  const { paddingTop, paddingBottom } = getProp.value

  return {
    [paddingTop]: `${top.value}px`,
    [paddingBottom]: `${bottom.value}px`,
  }
})

const getContainer = computed(() => {
  return props.viewport ? document.documentElement : viewport.value
})

const getProp = computed(() => {
  const classMap = {
    [DIRECTION.ROW]: {
      innerClass: 'vList__inner--row',
      contentClass: 'vList__content--row',
      offsetSize: 'offsetWidth',
      paddingTop: 'paddingLeft',
      paddingBottom: 'paddingRight',
      scroll: 'scrollLeft',
      targetSize: 'width',
    },
    [DIRECTION.COLUMN]: {
      innerClass: 'vList__inner--column',
      contentClass: 'vList__content--column',
      offsetSize: 'offsetHeight',
      paddingTop: 'paddingTop',
      paddingBottom: 'paddingBottom',
      scroll: 'scrollTop',
      targetSize: 'height',
    },
  }

  return classMap[props.direction]
})
</script>

<style>
.vList {
  height: 100%;
}

.vList__inner {
  -webkit-overflow-scrolling: touch;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.vList__inner--column {
  overflow-y: scroll;
  flex-direction: column;
}

.vList__inner--row {
  overflow-x: scroll;
  flex-direction: row;
}

.vList__content {
  display: flex;
  flex-shrink: 0;
}

.vList__row {
  flex-shrink: 0;
  max-width: 100px;
}

.vList__content--row {
  flex-direction: row;
}

.vList__content--column {
  flex-direction: column;
}
</style>
