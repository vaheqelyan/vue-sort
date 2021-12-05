<template>
  <div 
    @mousedown="mousedown" 
    :style="getStyle" 
    :class="{ 'transition no-select': hasStarted }"
  >
    <slot />
  </div>
</template>

<script>
import { DIRECTION } from './constants/props'

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
    direction: String,
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
    containerBound: { width: 0, height: 0, top: 0, left: 0 },
    height: 0,
    width: 0,
    top: 0,
    left: 0,
    // Autoscroll
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

      this.initXY = {
        x: clientX,
        y: clientY,
      }

      this.targetBound = currentTarget.getBoundingClientRect()

      this.containerBound = container.getBoundingClientRect()

      this.enlargeEdges()

      this.$emit('start', {
        targetBound: this.targetBound,
        containerBound: this.containerBound,
        initXY: this.initXY,
        edge: this.edge,
        index: this.index,
      })
    },

    enlargeEdges() {
      const height = this.targetBound[this.getProp.size]
      const top = this.targetBound[this.getProp.position]

      const containerTop = this.containerBound[this.getProp.position]
      const containerBottom = this.containerBound[this.getProp.containerPosition]

      const topSensor = top < containerTop + EDGE_THRESHOLD
      const bottomSensor = top + height > containerBottom - EDGE_THRESHOLD

      if (bottomSensor) {
        this.edge.bottom =
          top + height - (containerBottom - EDGE_THRESHOLD)
      }
      if (topSensor) {
        this.edge.top = top - (containerTop + EDGE_THRESHOLD)
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

      const { translateAxis, size } = this.getProp
      const translateSize = this.moveInstance.targetBound[size]

      const isDown = Math.sign(this.newIndex - this.activeIndex) > 0


      if (
        this.index >= this.activeIndex &&
        this.index <= this.newIndex &&
        isDown
      ) {
        return {
          transform: `translate${translateAxis}(${-translateSize}px)`,
        }
      } else if (
        this.index <= this.activeIndex &&
        this.index >= this.newIndex &&
        !isDown
      ) {
        return {
          transform: `translate${translateAxis}(${translateSize}px)`,
        }
      }
    },

    getProp () {
      const propMap = {
        [DIRECTION.ROW]: {
          translateAxis: 'X',
          size: 'width',
          position: 'left',
          containerPosition: 'right'
        },
        [DIRECTION.COLUMN]: {
          translateAxis: 'Y',
          size: 'height',
          position: 'top',
          containerPosition: 'bottom'
        }
      }

      return propMap[this.direction]
    }
  },
}
</script>

<style>
.transition {
  transition: transform 0.2s;
}

.fixed {
  position: fixed;
}

.no-select {
  user-select: none;
}
</style>
