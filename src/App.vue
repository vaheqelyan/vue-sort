<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'

const msg = ref('Hello World!')
const items = ref(new Array(100).fill().map((value,index)=> ({
  name: `${value}-${index}`,
  id: Math.random(),
  index
})))
</script>

<template>
  <SortList :list="items" :row-height="100">
  <template v-slot:item="{item}">
      <div>
        Hello {{item.index}}
      </div>
    </template>

    <template v-slot:drag-element="{item}">
      <div>
        Hello {{item.index}}
      </div>
    </template>

  </SortList>
</template>
