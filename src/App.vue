<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'
import DynamicVirtualList from './DynamicVirtualList.vue'
import dataItems from './data.js'

const msg = ref('Hello World!')

function uid() {
  var firstPart = (Math.random() * 46656) | 0
  var secondPart = (Math.random() * 46656) | 0
  firstPart = ('000' + firstPart.toString(36)).slice(-3)
  secondPart = ('000' + secondPart.toString(36)).slice(-3)
  return firstPart + secondPart
}

const items = ref(dataItems)

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

const onSort = ({ index, newIndex }) => {
  let data = items.value.slice()

  data = data.move(index, newIndex)
  items.value = data
}
</script>

<template>
  <DynamicVirtualList
    :list="items"
    @sort="onSort"
    item-id="key"
    class="container"
    :row-height="100"
    direction="row"
  >
    <template v-slot:item="{ item, isActive }">
      <div class="row" :class="{ invisible: isActive }">
        {{ item.data.key }} {{ item.data.content }}
      </div>
    </template>

    <template v-slot:drag-element="{ item }">
      <div class="item">{{ item.key }}</div>
    </template>
  </DynamicVirtualList>
  <!--<SortList
    :list="items"
    @sort="onSort"
    item-id="key"
    class="container"
    :row-height="100"
  >
    <template v-slot:item="{ item, isActive }">
      <div class="row">
        <div v-if="isActive" class="row--active">
          Hello {{ item.key }} 
        </div>
        <div v-else>Helo {{ item.key }}</div>
      </div>
    </template>

    <template v-slot:drag-element="{ item }">
      <div class="item">{{ item.key }}</div>
    </template>
  </SortList>-->
</template>

<style>
.container {
  height: 400px;
  width: 500px;
}

.item {
  box-shadow: 0px 0px 5px 1px red inset;
  user-select: none;
  height: 100%;
  user-select: none;
}

.row {
  background: #fff;
  /*max-width: 200px;*/
  /*height: 100px;*/
  box-shadow: 0px 0px 5px red inset;
}

.invisible {
  visibility: hidden;
}

.row--active {
  visibility: hidden;
}
</style>
