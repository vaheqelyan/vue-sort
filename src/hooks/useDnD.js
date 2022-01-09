import { watch, ref, inject, provide, reactive, computed, onMounted } from 'vue'
import { DND_DROP_EVENT } from '../constants/dnd'

export default ({ dropId, on, newIndex }) => {
  const getDnDId = inject('getDropId')
  const getDnDFrom = inject('getDnDFrom')
  const shouldDrop = inject('shouldDrop')
  const dndCleanUp = inject('dndCleanUp')

  const dndEmitDrop = inject('dndEmitDrop')

  const getDnDMove = inject('getDnDMove')

  let isIn = ref(false)
  let selfDrag = ref(false)

  watch(getDnDId, (id) => {
    if (id === dropId) {
      selfDrag.value = dropId === getDnDFrom.value
      isIn.value = true
    } else if (isIn.value) {
      isIn.value = false
    }
  })

  watch(shouldDrop, (drag) => {
    if (!drag) return

    if (isIn.value && selfDrag.value) {
      if (newIndex.value > -1) {
        dndEmitDrop(DND_DROP_EVENT.SORT, {
          index: getDnDMove.index,
          newIndex: newIndex.value,
          dropId,
        })
      }

      dndCleanUp()
      on.drop()
      return
    }

    if (isIn.value && !selfDrag.value) {
      dndEmitDrop(DND_DROP_EVENT.ADD, {
        index: newIndex.value,
        element: getDnDMove.data,
        dropId,
      })

      dndCleanUp()
      on.drop()
    }

    if (selfDrag.value && getDnDFrom.value === dropId) {
      dndEmitDrop(DND_DROP_EVENT.REMOVE, { index: getDnDMove.index, dropId })

      on.drop()
    }
  })

  return { isIn, selfDrag }
}
