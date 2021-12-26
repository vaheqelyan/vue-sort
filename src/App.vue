<script setup>
import { ref } from 'vue'
import SortList from './SortList.vue'
import DynamicVirtualList from './DynamicVirtualList.vue'
import DnDProvider from './DnDProvider.vue'
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

const items2 = ref(dataItems.slice())


Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item )
}

const onInsert = ({ index, element }) => {
  const newItem = { ...element, key: element.key + Math.random() }
  items2.value.insert(index, newItem)
}

const onRemove = ({ index }) => {
  items.value.splice(index, 1)
}


const onSort = ({ index, newIndex }) => {
  let data = items.value.slice()

  data = data.move(index, newIndex)
  items.value = data
}

const onSort2 = ({ index, newIndex }) => {
  let data = items2.value.slice()

  data = data.move(index, newIndex)
  items2.value = data
}

</script>

<template>
  <DnDProvider>
  <!--<DynamicVirtualList
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
  </DynamicVirtualList>-->


  <SortList
    :list="items"
    @sort="onSort"
    @remove="onRemove"
    item-id="key"
    class="container"
    :row-height="100"
		drop-id="bucket-1"
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
  </SortList>


  <SortList
    :list="items2"
    @sort="onSort2"
    @dnd-insert="onInsert"
    item-id="key"
    class="container container--pos"
    :row-height="100"
		drop-id="bucket-2"
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
  </SortList>


  </DnDProvider>
</template>

<style>
.container {
  height: 300px;
  width: 500px;
}

.container--pos {
  position: relative;
  top: 0px;
  left: 400px;
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
  height: 100px;
  box-shadow: 0px 0px 5px red inset;
}

.invisible {
  visibility: hidden;
}

.row--active {
  visibility: hidden;
}
</style>
