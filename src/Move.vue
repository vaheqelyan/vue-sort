<template>
  <div @mousedown="mousedown" class="item">
    <slot />
  </div>
</template>

<script>
const EDGE_THRESHOLD = 20
const CARD_HEIGHT = 100

export default {
  name: 'move',
  props: {
    item: Object,
    hasStarted: Boolean,
    boundEntries: Array,
    columnName: String,
    container: HTMLDivElement,
    index: Number,
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
      const { clientX, clientY, target } = event

      const container = this.container

      this.active = true
      this.initXY = {
        x: clientX,
        y: clientY,
      }
      this.height = target.getBoundingClientRect().height
      this.top = target.getBoundingClientRect().top

      this.containerTop = container.getBoundingClientRect().top
      this.containerBottom = container.getBoundingClientRect().bottom

      this.enlargeEdges()

      this.$emit('start', {
        containerTop: this.containerTop,
        containerBottom: this.containerBottom,
        height: this.height,
        top: this.top,
        initXY: this.initXY,
        edge: this.edge,
        index: this.index,
      })
    },

    enlargeEdges() {
      const topSensor = this.top < this.containerTop + EDGE_THRESHOLD
      const bottomSensor =
        this.top + CARD_HEIGHT > this.containerBottom - EDGE_THRESHOLD

      if (bottomSensor) {
        this.edge.bottom =
          this.top + CARD_HEIGHT - (this.containerBottom - EDGE_THRESHOLD)
      }
      if (topSensor) {
        this.edge.top = this.top - (this.containerTop + EDGE_THRESHOLD)
      }
    },
  },
}
</script>

<style>
.item {
  height: 100px;
  width: 100%;
  box-shadow: inset 0px 0px 4px red;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  position: static;
}
.transition {
  transition: transform 0.2s;
}
.fixed {
  position: fixed;
}
</style>
