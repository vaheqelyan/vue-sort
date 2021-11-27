<template>
  <div @mousedown="mousedown" :style="getStyle">
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
    moveInstance: Object,
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
    targetBound: { width: 0, height: 0, top: 0, left: 0 },
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

      const { container } = this

      this.active = true
      this.initXY = {
        x: clientX,
        y: clientY,
      }

      this.targetBound = currentTarget.getBoundingClientRect()
      const containerBound = container.getBoundingClientRect()

      this.containerTop = containerBound.top
      this.containerBottom = containerBound.bottom

      this.enlargeEdges()

      this.$emit('start', {
        containerTop: this.containerTop,
        containerBottom: this.containerBottom,
        targetBound: this.targetBound,
        initXY: this.initXY,
        edge: this.edge,
        index: this.index,
      })
    },

    enlargeEdges() {
      const { top, left, width, height } = this.targetBound

      const topSensor = top < this.containerTop + EDGE_THRESHOLD
      const bottomSensor = top + height > this.containerBottom - EDGE_THRESHOLD

      if (bottomSensor) {
        this.edge.bottom =
          top + height - (this.containerBottom - EDGE_THRESHOLD)
      }
      if (topSensor) {
        this.edge.top = top - (this.containerTop + EDGE_THRESHOLD)
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
        return {
          transform: `translateY(${-this.moveInstance.targetBound.height}px)`,
        }
      } else if (
        this.index <= this.activeIndex &&
        this.index >= this.newIndex &&
        !isDown
      ) {
        return {
          transform: `translateY(${this.moveInstance.targetBound.height}px)`,
        }
      }
    },
  },
}
</script>

<style>
.transition {
  transition: transform 2s;
}
.fixed {
  position: fixed;
}
</style>
