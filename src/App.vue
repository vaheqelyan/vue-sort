<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'

const msg = ref('Hello World!')
const items = ref(
  new Array(100).fill().map((value, index) => ({
    name: `${value}-${index}`,
    id: Math.random(),
    index,
  }))
)
</script>

<template>
  <SortList :list="items" :row-height="100" item-id="id">
    <template v-slot:item="{ item, isActive }">
      <div v-if="isActive" style="box-shadow: inset 0px 0px 20px red"></div>
      <div v-else>Hello {{ item.index }} {{ isActive }}</div>
    </template>

    <template v-slot:drag-element="{ item }">
      <div>Hello {{ item.index }}</div>
    </template>
  </SortList>
</template>
