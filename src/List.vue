<template>
  <div>
    {{ heightMap }} {{getFixedHeight }}
    <div class="c-list" ref="container" @scroll="onScroll">
      <div class="c-list__stick" :style="{ height: `${getFixedHeight}px` }" />
      <move
        v-for="(item, index) in getList"
        :start-transition="startTransition"
        :key="item[itemId]"
        :item="item"
        :item-id="itemId"
        :has-started="startDrag"
        :container="container"
        :index="index"
        :active-index="activeIndex"
        :new-index="newIndex"
        :move-instance="getDnDMove"
        :direction="direction"
        @start="onStartDrag"
      >
        <slot
          name="item"
          v-bind:item="item"
          v-bind:index="index"
          v-bind:is-active="start + index === activeIndex"
        />
      </move>
    </div>


    <div ref="deb"></div>

    <dragger
      v-if="startDrag"
      @firstMove="setTransition"
      :move="getDnDMove"
      :container="container"
      :direction="direction"
      @update="onUpdate"
      @end="onEnd"
    >
      <slot name="drag-element" v-bind:item="list[getDnDMove.index]" />
    </dragger>
  </div>
</template>

<script setup>
import { DIRECTION } from './constants/props';
import Dragger from './Dragger.vue';
import Move from './Move.vue';
import {
  watch,
  ref,
  inject,
  nextTick,
  provide,
  reactive,
  computed,
  onMounted,
} from 'vue';

import useDnD from './hooks/useDnD';
import useAutoscroll from './hooks/useAutoscroll';
const { autoscroll, stopAutoscroll } = useAutoscroll();

const getDnDMove = inject('getDnDMove');
const getCordinate = inject('getCordinate');
const setDnDBound = inject('setBound');
const getDnDFrom = inject('getDnDFrom');

const props = defineProps({
  dropId: String,
  list: Array,
  viewport: Boolean,
  itemId: String,
  disableEvent: Boolean,
  direction: {
    type: String,
    default: DIRECTION.COLUMN,
  },
});

let hasStarted = ref(false);
let start = ref(0);
let deb = ref()

let activeIndex = ref(-1);
const container = ref();

let newIndex = ref(-1);
let zIndex = ref(-1);

let filterIndex = ref(-1);
const startDnD = inject('startDnD');
let startDrag = ref(false);
let startTransition = ref(false);

const { isIn, selfDrag, dropEvent } = useDnD({
  dropId: props.dropId,
  on: {
    drop: () => onEnd(),
  },
  newIndex,
});

const dndBounds = inject('bounds');
const setTransition = () => {
  startTransition.value = true;
};

let offset = ref(0);
const onScroll = () => {
  offset.value = container.value[getProp.value.scroll];
};

const onStartDrag = (value) => {
  startDnD({
    fromBucket: props.dropId,
    element: value,
  });

  filterIndex.value = value.index;
  startDrag.value = true;
  newIndex.value = value.index;
  activeIndex.value = value.index;
};

const onUpdate = (y) => {
  if (isIn.value) {
    const targetHeight = getDnDMove.targetBound[getProp.value.size];

    let scrollTop = offset.value + y + targetHeight;

    let index;

    let topValue = 0;

    for (let i = 0; i < heightMap.length; i++) {
      const height = heightMap[i];


      deb.value.innerHTML = `${topValue} ${topValue + height} ${y + offset.value + (targetHeight / 2)} ${i}

      ${topValue + height >= offset.value + y + (targetHeight / 2)}
      `

      if (topValue + height >= offset.value + y + (targetHeight / 2)) {
        index = i;
        break;
      }

      topValue += height;
    }


    if (index !== undefined) {
      newIndex.value = index;
    }
  }
};

const onEnd = () => {};

const getFixedHeight = computed(() => {
  return heightMap.reduce((acc, value) => acc + value, 0);
});

const getList = computed(() => {
  if (filterIndex.value !== -1) {
    return props.list.filter((_, index) => index !== filterIndex.value);
  }

  return props.list;
});

let heightMap = reactive([]);
onMounted(() => {
  const els = container.value.children;
  for (let i = 1; i < els.length; i++) {
    heightMap[i - 1] = els[i].offsetHeight;
  }

  setDnDBound(container.value.getBoundingClientRect(), props.dropId);
});

const getProp = computed(() => {
  const classMap = {
    [DIRECTION.ROW]: {
      scroll: 'scrollLeft',
      position: 'left',
      size: 'width',
      containerSize: 'right',

      viewportSize: 'offsetWidth',
      windowSize: 'innerWidth',
    },
    [DIRECTION.COLUMN]: {
      scroll: 'scrollTop',
      position: 'top',
      viewportSize: 'offsetHeight',
      windowSize: 'innerHeight',
      containerSize: 'bottom',

      size: 'height',
    },
  };

  return classMap[props.direction];
});

watch(isIn, (hasEntered, prevValue) => {
  if (hasEntered) {
    if (!selfDrag.value) {
      startTransition.value = true;
    }
  } else {
    if (getDnDFrom.value === props.dropId) {
      //filterIndex.value = getDnDMove.index
      // Leave from
    } else {
      // Leave
    }

    stopAutoscroll();
    //activeIndex.value = -1
    newIndex.value = -1;
  }
});

watch(getCordinate, (cordinate) => {
  if (isIn.value) {
    const containerBound = dndBounds[props.dropId];

    const callback = selfDrag.value ? onUpdate : onNew;

    autoscroll(
      cordinate,
      containerBound,
      getDnDMove,
      getProp,
      container,
      callback
    );
  }
});
</script>

<style>
.c-list {
  overflow-y: scroll;
  max-height: 100%;
  position: relative;
}

.c-list__stick {
  width: 1px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
