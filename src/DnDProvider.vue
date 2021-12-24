<template>
  <slot />
</template>

<script setup>
import { ref, inject, provide, reactive, computed, onMounted } from 'vue'

let bounds = reactive({})
let dropIds = reactive([])
let moveElement = reactive({})

const cordinate = ref()
const from = ref()
let dropId = ref()

const setBound = (bound, dropId) => {
	Object.assign(bounds, {
	[dropId]: bound
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

 const setDnDMove = move => {
	Object.assign(moveElement, move)
 }

 const getDnDBounds = computed(() => {
 	return Object.entries(bounds)
 })


provide('bounds', bounds)

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

</script>
