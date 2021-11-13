<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'

const msg = ref('Hello World!')
const items = ref(
  new Array(20).fill().map((value, index) => ({
    name: `${value}-${index}`,
    id: Math.random(),
    index,
  }))
)

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

const onSort = ({ index, newIndex }) => {
  let data = items.value.slice()

  data = data.move(index, newIndex)
  items.value = data

  console.log(index, newIndex)
}
</script>

<template>
  <SortList :list="items" :row-height="100" item-id="id" @sort="onSort">
    <template v-slot:item="{ item, isActive }">
      <div v-if="isActive" style="box-shadow: inset 0px 0px 20px red"></div>
      <div v-else>Hello {{ item.id }} {{ isActive }}</div>
    </template>

    <template v-slot:drag-element="{ item }">
      <div>Hello {{ item.id }}</div>
    </template>
  </SortList>
</template>
