<template>
  <div class="vList">
    <div class="vList__inner" ref="viewport" @scroll="onScroll">
      <div class="vList__content" :style="getContentStyle" ref="content">
        <Move
          v-for="(row, index) in visible"
          :key="row.data[itemId]"
          @start="onStartDrag"
          :has-started="hasStarted"
          :container="$refs.viewport"
          :index="start + index"
          :active-index="activeIndex"
          :new-index="newIndex"
          :move-instance="moveInstance"
          :direction="direction"
        >
          <div class="vList__row">
            <slot
              name="item"
              v-bind:item="row"
              v-bind:is-active="start + index === activeIndex"
            />
          </div>
        </Move>
      </div>
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

export default {
  name: 'dynamic-virtual-list',
  props: {
    list: Array,
    viewport: Boolean,
    itemId: String,
    direction: {
      type: String,
      default: DIRECTION.COLUMN
    }
  },
  components: {
    Move,
    Dragger,
  },
  data: () => ({
    bottom: 0,
    top: 0,
    start: 0,
    end: 0,
    viewportHeight: 0,
    itemHeight: 0,
    rows: [],
    heightMap: [],
    averageHeight: 0,
    // ---
    hasStarted: false,
    newIndex: -1,
    activeIndex: -1,
    moveInstance: {},
  }),
  mounted() {
    if (this.viewport) {
      this.resized()
      window.addEventListener('resize', this.resized, EVENT_OPTS)
      window.addEventListener('scroll', this.onScroll, EVENT_OPTS)
    } else {
      this.viewportHeight = this.$refs.viewport.offsetHeight
    }

    this.rows = this.$refs.content.getElementsByClassName('vList__row')
    this.initVisibleRows()
  },
  methods: {
    resized() {
      let height = window.innerHeight || document.documentElement.offsetHeight
      if (height !== this.viewportHeight) {
        this.viewportHeight = height
      }
    },
    async onScroll() {
      let scrollTop = 0
      if (!this.viewport) {
        scrollTop = this.$refs.viewport.scrollTop
      } else {
        scrollTop = Math.max(
          0,
          -this.$refs.viewport.getBoundingClientRect().top || 0
        )
      }

      const listLength = this.list.length

      // Get start
      let i = 0
      let totalHeight = 0

      while (i < listLength) {
        const rowHeight = this.heightMap[i] || this.averageHeight

        if (totalHeight + rowHeight > scrollTop) {
          this.start = i
          this.top = totalHeight
          break
        }

        totalHeight += rowHeight
        i += 1
      }

      while (i < listLength) {
        if (this.heightMap[i]) {
          totalHeight += this.heightMap[i]
        } else if (this.rows[i]) {
          totalHeight += this.rows[i].offsetHeight
        } else {
          this.end = i + 1
          await this.$nextTick()
          const rowOffsetHeight = this.rows[i - this.start].offsetHeight
          totalHeight += rowOffsetHeight
          this.heightMap[i] = rowOffsetHeight
        }

        i++

        if (totalHeight > scrollTop + this.viewportHeight) break
      }

      this.end = i

      const remaining = listLength - this.end
      this.averageHeight = totalHeight / this.end

      this.bottom = remaining * this.averageHeight
    },
    async initVisibleRows() {
      const { scrollTop } = this.$refs.viewport

      await this.$nextTick()

      let content_height = this.top - scrollTop
      let i = this.start

      while (content_height < this.viewportHeight && i < this.list.length) {
        let row = this.rows[i - this.start]

        if (!row) {
          this.end = i + 1
          await this.$nextTick()
          row = this.rows[i - this.start]
        }

        const row_height = (this.heightMap[i] =
          this.itemHeight || row.offsetHeight)
        content_height += row_height

        i += 1
      }

      const remaining = this.list.length - this.end
      this.averageHeight = (this.top + content_height) / this.end

      this.bottom = remaining * this.averageHeight
      this.heightMap.length = this.list.length
    },

    onStartDrag(value) {
      this.hasStarted = true
      this.activeIndex = value.index
      this.moveInstance = value
    },

    onUpdate (y) {
      if (this.hasStarted) {
        let scrollTop = 0
        if (!this.viewport) {
          scrollTop = this.$refs.viewport.scrollTop
        } else {
          scrollTop = Math.max(
            0,
            -this.$refs.viewport.getBoundingClientRect().top || 0
          )
        }

        let offset = scrollTop + y + this.moveInstance.targetBound.height

        let newIndex

        let top = this.top

        for (let i = this.start; i < this.end; i++) {
          const height = this.heightMap[i]
          const nextHeight = this.heightMap[i+1] || 0

          if (offset <= (top + height + (nextHeight / 2))) {
            newIndex = i
            break
          }

          top += height
        }

        this.newIndex = newIndex
      }
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
      this.hasStarted = false
    },
  },
  computed: {
    visible() {
      return this.list.slice(this.start, this.end).map((data, i) => ({
        index: i + this.start,
        data,
      }))
    },
    getContentStyle() {
      return {
        paddingTop: `${this.top}px`,
        paddingBottom: `${this.bottom}px`,
      }
    },

    getContainer() {
      return this.viewport ? document.documentElement : this.$refs.viewport
    },
  },
}
</script>

<style>
.vList {
  height: 100%;
}

.vList__inner {
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}

.vList__content,
.vList__row {
  display: block;
}
</style>
