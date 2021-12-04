<template>
  <div :style="getStyle" class="fixed no-transition">
    <slot />
  </div>
</template>

<script>
import { DIRECTION } from './constants/props'

const EDGE_THRESHOLD = 20

function throttle(func, timeFrame) {
  var lastTime = 0
  return function () {
    var now = new Date()
    if (now - lastTime >= timeFrame) {
      func()
      lastTime = now
    }
  }
}

export default {
  name: 'dragger',
  props: {
    move: Object,
    container: HTMLDivElement,
    viewport: Boolean,
    direction: String
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
  created() {
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)

    this.initXY = this.move.initXY
    this.edge = this.move.edge

    this.containerBound = this.move.containerBound
    this.targetBound = this.move.targetBound
  },
  methods: {
    mousemove({ clientX, clientY }) {
      const top = this.targetBound[this.getProp.position]
      const height = this.targetBound[this.getProp.size]

      const containerTop = this.containerBound[this.getProp.position]
      const containerBottom = this.containerBound[this.getProp.containerSize]

      this.newXY = {
        x: clientX - this.initXY.x,
        y: clientY - this.initXY.y,
      }

      const y = this.newXY[this.getProp.axis]

      const topSensor = top + y < containerTop + EDGE_THRESHOLD
      const bottomSensor =
        top + y + height > containerBottom - EDGE_THRESHOLD

      const velocityBottom =
        (top +
          y +
          height -
          (containerBottom + this.edge.bottom - EDGE_THRESHOLD)) /
        EDGE_THRESHOLD

      const velocityTop =
        (containerTop + this.edge.top + EDGE_THRESHOLD - (top + y)) /
        EDGE_THRESHOLD

      this.sign = topSensor ? -1 : bottomSensor ? 1 : 0

      this.vel =
        this.sign === -1
          ? Math.max(0, velocityTop)
          : Math.max(0, velocityBottom)

      if (topSensor || bottomSensor) {
        if (!this.intervalId) {
          this.intervalId = setInterval(() => {
            this.update()
            this.container[this.getProp.scroll] += 2 * this.vel * this.sign
          }, 10)
        }
      } else if (this.intervalId) {
        // Clear timer when auto scroll is not true
        clearInterval(this.intervalId)
        this.intervalId = false
        this.sign = 0
        this.vel = 1
        this.edge = { top: 0, bottom: 0 }
      } else {
        this.update()
      }
    },

    mouseup() {
      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
      this.newXY = { x: 0, y: 0 }
      this.initXY = { x: 0, y: 0 }
      this.active = false
      this.edge = { top: 0, bottom: 0 }
      clearInterval(this.intervalId)
      this.intervalId = false

      this.$emit('end')
    },

    update() {
      const { position, axis } = this.getProp

      this.$emit('update', this.targetBound[position] - this.containerBound[position] + this.newXY[axis])
    },
  },
  computed: {
    getStyle() {
      const { top, left, width, height } = this.targetBound

      const { newXY } = this

      return {
        transform: `translate(${newXY.x}px, ${newXY.y}px)`,
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 2,
      }
    },

    getProp () {
      const propMap = {
        [DIRECTION.ROW]: {
          position: 'left',
          size: 'width',
          axis: 'x',
          scroll: 'scrollLeft',
          containerSize: 'right'
        },
        [DIRECTION.COLUMN]: {
          position: 'top',
          axis: 'y',
          size: 'height',
          scroll: 'scrollTop',
          containerSize: 'bottom'
        }
      }

      return propMap[this.direction]
    }
  },
}
</script>

<style>
.no-transition {
  transition: none;
}
</style>
