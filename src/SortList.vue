<template>
  <div>
    <div class="scrollList" ref="container" @scroll="onScroll" v-bind="$attrs">
      <div class="scrollList__inner" :style="getContainerHeight.style">
        <div class="scrollList__content" :style="getVirtualList.style">
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
    if (!this.viewport) {
      this.height = this.$refs.container.offsetHeight
    } else {
      this.height = window.innerHeight || document.documentElement.offsetHeight

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
        let newIndex = Math.floor((this.offset + y) / this.rowHeight)

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
        this.offset = this.$refs.container.scrollTop
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

      return { selection, style: { top: `${start * this.rowHeight}px` }, start }
    },

    getContainerHeight() {
      let height = this.list.length * this.rowHeight

      return {
        height,
        style: {
          height: `${height}px`,
        },
      }
    },

    getContainer() {
      return this.viewport ? document.documentElement : this.$refs.container
    },
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
}
</style>
