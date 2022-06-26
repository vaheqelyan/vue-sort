<script setup>
import { onMounted, ref } from 'vue'
import SortList from './SortList.vue'
import DynamicVirtualList from './DynamicVirtualList.vue'
import List from './List.vue'
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

const items = ref(dataItems())

const items2 = ref(dataItems())

const items3 = ref([
  { id: 1, text: 'foo' },
  { id: 2, text: 'foo' },
  { id: 3, text: 'foo' },
  { id: 4, text: 'foo' },
  { id: 5, text: 'foo' },
  { id: 6, text: 'foo' },

  {
    id: 6,
    text: 'foo',
    list: [
      { id: 1, text: 'foo' },
      { id: 2, text: 'foo' },
      { id: 3, text: 'foo' },
      { id: 4, text: 'foo' },
      { id: 5, text: 'foo' },
      { id: 6, text: 'foo' },
    ],
  },

  { id: 7, text: 'foo' },
  { id: 8, text: 'foo' },
])

// items.value[items.value.length - 1] = {
// ...items.value[items.value.length - 1],
// data: [1, 2, 3, 4, 5],
// };

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item)
}

const onInsert = ({ index, element }) => {
  const newItem = { ...element.dataElement }
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
  <DnDProvider @sort="onSort" @remove="onRemove" @add="onInsert">
    <!--<DynamicVirtualList
      :list="items"
      drop-id="bucket-1"
      @sort="onSort"
      item-id="key"
      class="container"
      :row-height="100"
    >
      <template v-slot:item="{ item, isActive }">
        <div>
          #{{item.data.key}} {{ item.data.content }}
        </div>
      </template>

      <template v-slot:drag-element="{ item }">
        <div class="item">#{{item.key}} {{ item.content }}</div>
      </template>
    </DynamicVirtualList>-->

    <List
      :list="items"
      item-id="key"
      class="container"
      drop-id="bucket-1"
      direction="column"
    >
      <template v-slot:item="{ item, index }">
        <div style="padding: 10px">Item {{ item.content }} {{ index }}</div>
      </template>

      <template v-slot:drag-element="{ item }">
        <div class="item" style="padding: 10px">Item {{ item.content }}</div>
      </template>
    </List>

    <List
      :list="items2"
      item-id="key"
      class="container"
      drop-id="bucket-2"
      direction="column"
      style="left: 800px; top: 100px; position: relative"
    >
      <template v-slot:item="{ item, index }">
        <div style="padding: 10px">Item {{ item.content }} {{ index }}</div>
      </template>

      <template v-slot:drag-element="{ item }">
        <div class="item" style="padding: 10px">Item {{ item.content }}</div>
      </template>
    </List>

    <List
      :list="items3"
      item-id="id"
      class="container"
      drop-id="bucket-3"
      direction="column"
      style="left: 800px; top: 100px; position: relative; margin-top: 10px"
    >
      <template v-slot:item="{ item, index }">
        <List
          v-if="item.list"
          :list="item.list"
          item-id="id"
          class="container"
          drop-id="bucket-10"
          direction="column"
          style="max-height: 100px; width: 100%;"
        >
          <template v-slot:item="{ item, index }">
            <div style="padding: 10px">Item {{ item.text }}</div>
          </template>

          <template v-slot:drag-element="{ item }">
            <div class="item" style="padding: 10px">Item {{ item.text }}</div>
          </template>
        </List>
        <div v-else style="padding: 10px">Item {{ item.text }}</div>
      </template>

      <template v-slot:drag-element="{ item }">
        <div class="item" style="padding: 10px">Item {{ item.text }}</div>
      </template>
    </List>

    <!--<SortList
      :list="items"
      item-id="key"
      class="container"
      :row-height="100"
      drop-id="bucket-1"
      direction="row"
      disable-event
    >
      <template v-slot:item="{ item, mousedown }">
        <div class="row">
          <button @mousedown="mousedown">Drag</button>
          Hello {{ item.key }}
        </div>
      </template>

      <template v-slot:drag-element="{ item }">
        <div class="item">{{ item.key }}</div>
      </template>
    </SortList>-->

    <!--<SortList
    :list="items2"
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
  </SortList>-->
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
  /*height: 100px;*/
  width: 100%;
  height: 100%;
  box-shadow: 0px 0px 5px red inset;
}

.invisible {
  visibility: hidden;
}
</style>
