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
          :container="$refs.viewport"
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

<script>
import Move from './Move.vue'
import Dragger from './Dragger.vue'
import { DIRECTION } from './constants/props'

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

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
      default: DIRECTION.COLUMN,
    },
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
    rows: [],
    heightMap: [],
    averageHeight: 0,
    // ---
    hasStarted: false,
    newIndex: -1,
    activeIndex: -1,
    moveInstance: {},
    offset: 0,
  }),
  mounted() {
    if (this.viewport) {
      this.resized()
      window.addEventListener('resize', this.resized, EVENT_OPTS)
      window.addEventListener('scroll', this.onScroll, EVENT_OPTS)
    } else {
      this.viewportHeight = this.$refs.viewport[this.getProp.offsetSize]
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
        scrollTop = this.$refs.viewport[this.getProp.scroll]
      } else {
        scrollTop = Math.max(
          0,
          -this.$refs.viewport.getBoundingClientRect().top || 0
        )
      }

      this.offset = scrollTop

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
          totalHeight += this.rows[i][this.getProp.offsetSize]
        } else {
          this.end = i + 1
          await this.$nextTick()

          const rowOffsetHeight =
            this.rows[i - this.start][this.getProp.offsetSize]

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
      const scrollTop = this.$refs.viewport[this.getProp.scroll]

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

        const rowOffsetHeight = row[this.getProp.offsetSize]

        const row_height = (this.heightMap[i] = rowOffsetHeight)

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

    onUpdate(y) {
      if (this.hasStarted) {
        const targetHeight =
          this.moveInstance.targetBound[this.getProp.targetSize]
        let offset = this.offset + y + targetHeight

        let newIndex

        let top = this.top

        this.$refs.logger.innerHTML = `<b>${offset}</b>`

        for (let i = this.start; i < this.end; i++) {
          const height = this.heightMap[i]
          const nextHeight = this.heightMap[i + 1] || 0

          if (offset <= top + height + nextHeight / 2) {
            newIndex = i
            break
          }

          top += height
        }

        if (newIndex !== undefined) {
          this.newIndex = newIndex
        }
      }
    },

    onEnd() {
      if (this.newIndex !== -1) {
        this.save = {
          index: this.activeIndex,
          newIndex: this.newIndex,
        }
        let heightMap = this.heightMap.slice()

        this.heightMap = heightMap.move(this.activeIndex, this.newIndex)

        this.$emit('sort', {
          index: this.activeIndex,
          newIndex: this.newIndex,
        })
      }

      this.onScroll()

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
      const { paddingTop, paddingBottom } = this.getProp

      return {
        [paddingTop]: `${this.top}px`,
        [paddingBottom]: `${this.bottom}px`,
      }
    },

    getContainer() {
      return this.viewport ? document.documentElement : this.$refs.viewport
    },

    getProp() {
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

      return classMap[this.direction]
    },
  },
}
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
