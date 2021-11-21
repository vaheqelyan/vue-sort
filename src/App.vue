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
    <DynamicVirtualList :list="items" v-slot:row="{row}" viewport>
    <img width="100" height="100" :src="row.data.avatar" style="float: left"/>
    <h2>#{{row.index}} {{row.data.name}}</h2>
    <p>{{row.data.content}}</p>
    </DynamicVirtualList>
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
