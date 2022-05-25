<template>
  <div :style="getStyle" class="fixed no-transition">
    <slot />
  </div>
</template>

<script setup>
import { DIRECTION } from './constants/props';
import { findBucket } from './util';
import { inject, onMounted, ref, provide, reactive, computed } from 'vue';

const EDGE_THRESHOLD = 20;

const props = defineProps({
  move: Object,
  container: HTMLDivElement,
  viewport: Boolean,
  direction: String,
});

let newXY = reactive({
  x: 0,
  y: 0,
});

const height = ref(0);
const width = ref(0);
const top = ref(0);
const left = ref(0);

const emit = defineEmits(['end', 'firstMove']);

const dndBounds = inject('getDnDBounds');
const updateDnD = inject('updateDnD');
const dndDrop = inject('dndDrop');

onMounted(() => {
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('mouseup', mouseup);
});

function noop() {}

let once = () => {
  once = noop;

  emit('firstMove');
};

const mousemove = ({ clientX, clientY }) => {
  const { targetBound } = props.move;
  const { initXY } = props.move;

  once();

  newXY.x = clientX - initXY.x;
  newXY.y = clientY - initXY.y;

  const y = newXY[getProp.value.axis];

  updateDnD(y, findBucket(newXY, targetBound, dndBounds.value));
};

const mouseup = () => {
  window.removeEventListener('mousemove', mousemove);
  window.removeEventListener('mouseup', mouseup);

  newXY.x = 0;
  newXY.y = 0;

  //emit('end')

  // dndDrop();
};

const getStyle = computed(() => {
  const { top, left, width, height } = props.move.targetBound;

  return {
    transform: `translate(${newXY.x}px, ${newXY.y}px)`,
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: 2,
  };
});

const getProp = computed(() => {
  const propMap = {
    [DIRECTION.ROW]: {
      position: 'left',
      size: 'width',
      axis: 'x',
      scroll: 'scrollLeft',
      containerSize: 'right',
    },
    [DIRECTION.COLUMN]: {
      position: 'top',
      axis: 'y',
      size: 'height',
      scroll: 'scrollTop',
      containerSize: 'bottom',
    },
  };

  return propMap[props.direction];
});
</script>

<style>
.no-transition {
  transition: none;
}
</style>
