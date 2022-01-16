<template>
  <slot />
</template>

<script setup>
import { ref, inject, provide, reactive, computed, onMounted } from 'vue'
import { DND_DROP_EVENT } from './constants/dnd'

let bounds = reactive({})
let dropIds = reactive([])
let moveElement = reactive({})

const cordinate = ref()
const from = ref()
let dropId = ref()

let shouldDrop = ref(false)

const emit = defineEmits(['sort', 'add', 'remove'])

const setBound = (bound, dropId) => {
  Object.assign(bounds, {
    [dropId]: bound,
  })
}

const setDropZone = (id) => {
  dropId.value = id
}

const setCordinate = (value) => {
  cordinate.value = value
}

const setDnDFrom = (dropId) => {
  from.value = dropId
}

const setDnDMove = (move, element) => {
  Object.assign(moveElement, {
    ...move,
    data: { ...element },
  })
}

const getDnDBounds = computed(() => {
  return Object.entries(bounds)
})

const dndDrop = () => {
  shouldDrop.value = true
}

const dndCleanUp = () => {
  setDropZone(null)
  shouldDrop.value = false

  setDnDFrom(null)
  setCordinate(0)
}

const dndEmitDrop = (event, payload) => {
  switch (event) {
    case DND_DROP_EVENT.SORT:
      emit('sort', payload)
      break
    case DND_DROP_EVENT.ADD:
      emit('add', payload)
      break
    case DND_DROP_EVENT.REMOVE:
      emit('remove', payload)
      break
  }
}

const startDnD = ({ fromBucket, element }) => {
  dropId.value = fromBucket
  from.value = fromBucket

  Object.assign(moveElement, {
    ...element,
    //data: { ...element }, ?
  })
}

provide('bounds', bounds)


provide('startDnD', startDnD)

provide('getDnDBounds', getDnDBounds)
provide('getDropId', dropId)
provide('setBound', setBound)
provide('setDropZone', setDropZone)
provide('setDnDCordinate', setCordinate)
provide('getCordinate', cordinate)
provide('setDnDFrom', setDnDFrom)
provide('getDnDFrom', from)

provide('getDnDMove', moveElement)
provide('setDnDMove', setDnDMove)

provide('dndDrop', dndDrop)

provide('shouldDrop', shouldDrop)

provide('dndCleanUp', dndCleanUp)

provide('dndEmitDrop', dndEmitDrop)
</script>
