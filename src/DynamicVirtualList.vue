<template>
  <div class="vList" ref="viewport" @scroll="onScroll">
    <div class="vList__content" :style="getContentStyle" ref="content">
      <div v-for="row in visible" ref="row" class="vList__row" :key="row.key">
        <slot name="row" v-bind:row="row" />
      </div>
    </div>
  </div>
</template>

<script>
const EVENT_OPTS = {
  passive: true,
  capture: true,
}

export default {
  name: 'dynamic-virtual-list',
  props: {
    list: Array,
    viewport: Boolean,
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
  }),
  mounted() {
    if (this.viewport) {
      this.resized()
      //this.onScroll();
      window.addEventListener('resize', this.resized, EVENT_OPTS)
      window.addEventListener('scroll', this.onScroll, EVENT_OPTS)
    } else {
      this.viewportHeight = this.$refs.viewport.offsetHeight
    }

    /*var ro = new ResizeObserver(entries => {
  for (let entry of entries) {
  }
});

// Observe one or multiple elements
ro.observe(this.$refs.viewport);*/

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

      //console.log(this.heightMap.reduce((acc, value) => acc + value, 0))

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
  },
}
</script>

<style>
.vList {
  position: relative;
  /*overflow-y: auto;*/
  -webkit-overflow-scrolling: touch;
  display: block;
  height: 100%;
}

.vList__content,
.vList__row {
  display: block;
}

.vList__row {
  overflow: hidden;
}
</style>
