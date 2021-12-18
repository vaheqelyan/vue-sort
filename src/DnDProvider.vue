<template>
  <slot />
</template>

<script setup>
import { ref, inject, provide, reactive, computed, onMounted } from 'vue'

let bounds = reactive([])
let dropIds = reactive([])
let dropId = ref()

const setBound = (bound, dropId) => {
  bounds.push(bound)
  dropIds.push(dropId)
}

const setDropZone = (index) => {
  dropId.value = dropIds[index]
}

provide('bounds', bounds)
provide('getDropId', dropId)
provide('setBound', setBound)
provide('setDropZone', setDropZone)
</script>
