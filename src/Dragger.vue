<template>
  <div :style="getStyle" class="item fixed no-transition">
    <slot />
  </div>
</template>

<script>
const CARD_WIDTH = 280
const EDGE_THRESHOLD = 20
const CARD_HEIGHT = 100

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
    viewport: Boolean
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
  created() {
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)

    this.initXY = this.move.initXY
    this.containerBottom = this.move.containerBottom
    this.containerTop = this.move.containerTop
    this.edge = this.move.edge
    this.top = this.move.top
    this.height = this.move.height
  },
  methods: {
    mousemove({ clientX, clientY }) {
      this.newXY = {
        x: clientX - this.initXY.x,
        y: clientY - this.initXY.y,
      }
      const { x, y } = this.newXY

      const topSensor = this.top + y < this.containerTop + EDGE_THRESHOLD
      const bottomSensor =
        this.top + y + CARD_HEIGHT > this.containerBottom - EDGE_THRESHOLD

      const velocityBottom =
        (this.top +
          y +
          CARD_HEIGHT -
          (this.containerBottom + this.edge.bottom - EDGE_THRESHOLD)) /
        EDGE_THRESHOLD

      const velocityTop =
        (this.containerTop + this.edge.top + EDGE_THRESHOLD - (this.top + y)) /
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
            this.container.scrollTop += 2 * this.vel * this.sign
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
      this.$emit('update', this.top + this.newXY.y)
    },
  },
  computed: {
    getStyle() {
      const { top, left } = this.move

      const { newXY } = this

      return {
        transform: `translate(${newXY.x}px, ${newXY.y}px)`,
        left: `${left}px`,
        top: `${top}px`,
        width: `${CARD_WIDTH}px`,
        height: `100px`,
        zIndex: 2,
      }
    },
  },
}
</script>

<style>
.no-transition {
  transition: none;
}
</style>
