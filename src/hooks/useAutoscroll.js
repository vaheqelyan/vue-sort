import { inject, onMounted, ref, provide, reactive, computed } from "vue";

const EDGE_THRESHOLD = 20;

export default () => {
  let vel = ref(1);
  let sign = ref(0);
  let intervalId = ref(false);

  let edge = reactive({
    top: 0,
    bottom: 0,
  });

  const autoscroll = (
    cordinate,
    containerBound,
    getDnDMove,
    getProp,
    getContainer,
    callback
  ) => {
    const { targetBound } = getDnDMove;
    const top = targetBound[getProp.value.position];
    const height = targetBound[getProp.value.size];

    const containerTop = containerBound[getProp.value.position];
    const containerBottom = containerBound[getProp.value.containerSize];

    cordinate = cordinate + top

    const topSensor = cordinate < containerTop + EDGE_THRESHOLD;
    const bottomSensor = cordinate + height > containerBottom - EDGE_THRESHOLD;


    const velocityBottom =
      (cordinate + height - (containerBottom + edge.bottom - EDGE_THRESHOLD)) /
      EDGE_THRESHOLD;

    const velocityTop =
      (containerTop + edge.top + EDGE_THRESHOLD - cordinate) / EDGE_THRESHOLD;

    sign.value = topSensor ? -1 : bottomSensor ? 1 : 0;

    vel.value = sign.value === -1 ? Math.max(0, velocityTop) : Math.max(0, velocityBottom);

    if (topSensor || bottomSensor) {
      if (!intervalId.value) {
        intervalId.value = setInterval(() => {
          getContainer.value[getProp.value.scroll] += 2 * vel.value * sign.value;

          callback(cordinate - containerTop);
        }, 10);
      }
    } else if (intervalId.value) {
      // Clear timer when auto scroll is not true
      clearInterval(intervalId.value);
      intervalId.value = false;
      sign.value = 0;
      vel.value = 1;
      edge.top = 0;
      edge.bottom = 0;
    } else {
      callback(cordinate - containerTop);
    }
  };

  const stopAutoscroll = () => {
    edge.top = 0;
    edge.bottom = 0;
    clearInterval(intervalId.value);

    intervalId.value = false;
  };

  return { autoscroll, stopAutoscroll };
};

