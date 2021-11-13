<template>
  <div>
    <div class="scrollList" ref="container" @scroll="onScroll">
      <div class="appList__inner" :style="getContainerHeight.style">
        <div class="scrollList__content" :style="getVirtualList.style">
          <move
            v-for="(item, index) in getVirtualList.selection"
            :key="item[itemId]"
            @start="onStartDrag"
            @end="onEnd"
            :has-started="start"
            :container="$refs.container"
            :index="index"
          >
            <slot
              name="item"
              v-bind:item="item"
              v-bind:is-active="index === activeIndex"
            />
          </move>
        </div>
      </div>
    </div>

    <dragger v-if="start" :move="moveInstance" :container="$refs.container">
      <slot name="drag-element" v-bind:item="list[activeIndex]" />
    </dragger>
  </div>
</template>

<script>
import Move from './Move.vue'
import Dragger from './Dragger.vue'

export default {
  props: {
    list: Array,
    itemId: String,
    rowHeight: Number,
    overscanCount: {
      type: Number,
      default: 5,
    },
  },
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
  }),
  mounted() {
    this.height = this.$refs.container.offsetHeight
  },
  methods: {
    onStartDrag(value) {
      this.start = true
      this.activeIndex = value.index
      this.moveInstance = value
    },
    onStart({ index, height }) {
      this.start = true
    },
    onEnd() {
      this.start = false
    },
    onScroll() {
      const { scrollTop } = this.$refs.container
      this.offset = scrollTop
    },
  },
  computed: {
    getVirtualList() {
      let start = (this.offset / this.rowHeight) | 0
      let visibleRowCount = (this.height / this.rowHeight) | 0
      start = Math.max(0, start - (start % this.overscanCount))
      visibleRowCount += this.overscanCount
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
  },
}
</script>

<style>
.scrollList {
  overflow-y: scroll;
  max-height: 300px;
  width: 303px;
  height: 100%;
  position: relative;
}
.scrollList__inner {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100%;
}
.scollList__inner--push {
  margin-top: 88px;
}
.scrollList__content {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: visible;
}
</style>
