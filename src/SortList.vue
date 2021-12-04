<template>
  <div>
    <div class="scrollList" ref="container" @scroll="onScroll" v-bind="$attrs">
      <div class="scrollList__inner" :style="getContainerHeight.style">
        <div class="scrollList__content" :class="getDirectionClass" :style="getVirtualList.style">
          <move
            v-for="(item, index) in getVirtualList.selection"
            :key="item[itemId]"
            @start="onStartDrag"
            :has-started="start"
            :container="$refs.container"
            :index="getVirtualList.start + index"
            :active-index="activeIndex"
            :new-index="newIndex"
            :moveInstance="moveInstance"
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
      v-if="start"
      :move="moveInstance"
      :container="getContainer"
      :direction="direction"
      @update="onUpdate"
      @end="onEnd"
    >
      <slot name="drag-element" v-bind:item="list[activeIndex]" />
    </dragger>
  </div>
</template>

<script>
import Move from './Move.vue'
import Dragger from './Dragger.vue'
import { DIRECTION } from './constants/props'

const EVENT_OPTS = {
  passive: true,
  capture: true,
}

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

export default {
  props: {
    list: Array,
    itemId: String,
    rowHeight: Number,
    viewport: Boolean,
    overscanCount: {
      type: Number,
      default: 1,
    },
    direction: {
      type: String,
      default: DIRECTION.COLUMN
    }
  },
  inheritAttrs: false,
  components: {
    Move,
    Dragger,
  },
  data: () => ({
    start: false,
    activeIndex: -1,
    height: 0,
    offset: 0,
    moveInstance: {},
    newIndex: -1,
  }),
  mounted() {
    const { viewportSize, windowSize } = this.getProp
    if (!this.viewport) {
      this.height = this.$refs.container[viewportSize]
    } else {
      this.height = window[windowSize] || document.documentElement[viewportSize]

      window.addEventListener('scroll', this.onScroll, EVENT_OPTS)
      window.addEventListener('resize', this.onResize, EVENT_OPTS)
    }
  },
  methods: {
    onResize() {
      let height = window.innerHeight || document.documentElement.offsetHeight
      if (height !== this.height) {
        this.height = height
      }
    },

    onUpdate(y) {
      if (this.start) {
        let newIndex = Math.floor((this.offset + y + (this.rowHeight / 2)) / this.rowHeight)

        newIndex = Math.min(Math.max(0, newIndex), this.list.length - 1)

        this.newIndex = newIndex
      }
    },
    onStartDrag(value) {
      this.start = true
      this.activeIndex = value.index
      this.moveInstance = value
    },
    onEnd() {
      if (this.newIndex !== -1) {
        this.$emit('sort', {
          index: this.activeIndex,
          newIndex: this.newIndex,
        })
      }

      this.activeIndex = -1
      this.newIndex = -1
      this.start = false
    },
    onScroll() {
      if (!this.viewport) {
        this.offset = this.$refs.container[this.getProp.scroll]
      } else {
        let offset = Math.max(
          0,
          (this.$refs.container &&
            -this.$refs.container.getBoundingClientRect().top) ||
            0
        )

        this.offset = offset
      }
    },
  },
  computed: {
    getVirtualList() {
      let start = (this.offset / this.rowHeight) | 0
      let visibleRowCount = (this.height / this.rowHeight) | 0

      if (this.overscanCount) {
        start = Math.max(0, start - (start % this.overscanCount))
        visibleRowCount += this.overscanCount
      }
      let end = start + 1 + visibleRowCount

      let selection = this.list.slice(start, end)

      return { selection, style: { [this.getProp.position]: `${start * this.rowHeight}px` }, start }
    },

    getContainerHeight() {
      const size = this.list.length * this.rowHeight

      return {
        size,
        style: {
          [this.getDirectionSize ]: `${size}px`,
        },
      }
    },

    getContainer() {
      return this.viewport ? document.documentElement : this.$refs.container
    },

    getDirectionSize () {
      const classMap = {
        [DIRECTION.ROW]: 'width',
        [DIRECTION.COLUMN]: 'height'
      }

      return classMap[this.direction]
    },

    getDirectionClass () {
      const classMap = {
        [DIRECTION.ROW]: 'scrollList__content--row',
        [DIRECTION.COLUMN]: 'scrollList__content--col'
      }

      return classMap[this.direction]
    },

    getProp () {
      const classMap = {
        [DIRECTION.ROW]: {
          scroll: 'scrollLeft',
          position: 'left',
          viewportSize: 'offsetWidth',
          windowSize: 'innerWidth'
        },
        [DIRECTION.COLUMN]: {
          scroll: 'scrollTop',
          position: 'top',
          viewportSize: 'offsetHeight',
          windowSize: 'innerHeight'
        }
      }

      return classMap[this.direction]
    }
  },
}
</script>

<style>
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
  overflow: visible;
  display: flex;
}

.scrollList__content--row {
  flex-direction: row;
}

.scrollList__content--col {
  flex-direction: column;
}
</style>
