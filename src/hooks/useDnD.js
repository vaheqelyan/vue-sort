import { watch, ref, inject, provide, reactive, computed, onMounted } from 'vue'

export default (dropId) => {
  const getDnDId = inject('getDropId')

  let isIn = ref(false)
  let selfDrag = ref(false)

  const getDnDFrom = inject('getDnDFrom')


  watch(getDnDId, (id) => {
    if (id === dropId) {

      selfDrag.value = dropId === getDnDFrom.value

      if (!isIn.value) {
        isIn.value = true
      }
    } else if (isIn.value) {
      isIn.value = false
    }
  })

  return { isIn, selfDrag }
}
