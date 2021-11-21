<template>
  <div
    @mousedown="mousedown"
    class="item"
    :style="getStyle"
    :class="{ transition: hasStarted }"
  >
    <slot />
  </div>
</template>

<script>
const EDGE_THRESHOLD = 20

export default {
  name: 'move',
  props: {
    item: Object,
    hasStarted: Boolean,
    boundEntries: Array,
    columnName: String,
    container: HTMLDivElement,
    index: Number,
    newIndex: Number,
    activeIndex: Number,
    moveInstance: Object
  },
  data: () => ({
    initXY: {
      x: 0,
      y: 0,
    },
    newXY: {
      x: 0,
      y: 0,
    },
    height: 0,
    width: 0,
    active: false,
    top: 0,
    left: 0,
    // Autoscroll
    containerTop: 0,
    containerBottom: 0,
    oldY: 0,
    t: 0,
    vel: 1,
    sign: 0,
    intervalId: false,
    edge: {
      top: 0,
      bottom: 0,
    },
  }),
  methods: {
    mousedown() {
      const { clientX, clientY, currentTarget } = event

      const container = this.container

      this.active = true
      this.initXY = {
        x: clientX,
        y: clientY,
      }
      this.height = currentTarget.getBoundingClientRect().height
      this.width = currentTarget.getBoundingClientRect().width
      this.top = currentTarget.getBoundingClientRect().top

      this.containerTop = container.getBoundingClientRect().top
      this.containerBottom = container.getBoundingClientRect().bottom

      this.enlargeEdges()

      this.$emit('start', {
        containerTop: this.containerTop,
        containerBottom: this.containerBottom,
        height: this.height,
        width: this.width,
        top: this.top,
        initXY: this.initXY,
        edge: this.edge,
        index: this.index,
      })
    },

    enlargeEdges() {
      const topSensor = this.top < this.containerTop + EDGE_THRESHOLD
      const bottomSensor =
        this.top + this.height > this.containerBottom - EDGE_THRESHOLD

      if (bottomSensor) {
        this.edge.bottom =
          this.top + this.height - (this.containerBottom - EDGE_THRESHOLD)
      }
      if (topSensor) {
        this.edge.top = this.top - (this.containerTop + EDGE_THRESHOLD)
      }
    },
  },
  computed: {
    getStyle() {
      if (
        !this.hasStarted ||
        this.newIndex === -1 ||
        this.activeIndex === -1 ||
        this.activeIndex === this.index
      )
        return

      const isDown = Math.sign(this.newIndex - this.activeIndex) > 0

      if (
        this.index >= this.activeIndex &&
        this.index <= this.newIndex &&
        isDown
      ) {
        return { transform: `translateY(${-this.moveInstance.height}px)` }
      } else if (
        this.index <= this.activeIndex &&
        this.index >= this.newIndex &&
        !isDown
      ) {
        return { transform: `translateY(${this.moveInstance.height}px)` }
      }
    },
  },
}
</script>

<style>
.item {
  height: 100px;
  width: 100%;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  position: static;
  box-shadow: inset 0px 0px 4px red;
}
.transition {
  transition: transform 0.2s;
}
.fixed {
  position: fixed;
}
</style>
