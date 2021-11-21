<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'
import DynamicVirtualList from './DynamicVirtualList.vue'
import items from './data.js';

const msg = ref('Hello World!')

function uid() {
  var firstPart = (Math.random() * 46656) | 0
  var secondPart = (Math.random() * 46656) | 0
  firstPart = ('000' + firstPart.toString(36)).slice(-3)
  secondPart = ('000' + secondPart.toString(36)).slice(-3)
  return firstPart + secondPart
}

/*const items = ref(
  new Array(20).fill().map((value, index) => ({
    name: `${value}-${index}`,
    id: uid(),
    index,
  }))
)*/

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

/*const onSort = ({ index, newIndex }) => {
  let data = items.value.slice()

  data = data.move(index, newIndex)
  items.value = data
}*/
</script>

<template>
  <div class="container">
    <SortList
        :list="items"
        :row-height="100"
        item-id="id"
        @sort="onSort"
        class="list"
        >
        <template v-slot:item="{ item, isActive }">
          <div v-if="isActive">ACTIVE</div>
          <div v-else>Hello {{ item.id }}</div>
        </template>

        <template v-slot:drag-element="{ item }">
          <div>Hello {{ item.index }}</div>
        </template>
    </SortList>
  </div>
</template>

<style>
.list {
  height: 500px;
  width: 300px;
  overflow-y: scroll;
  /*position: relative;
  top: 100px;*/
}

.container {
  margin-top: 100px;
  /*height: 100%;*/
  /*border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  min-height: 200px;
  height: calc(100vh - 15em);*/
}
</style>
