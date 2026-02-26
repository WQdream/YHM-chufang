<template>
  <el-dialog
    title="选择药方"
    v-model="visible"
    width="60%"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="select-medicine-container">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入药材名称"
          clearable
          @clear="getMedicineList"
        >
        <!-- @keyup.enter="handleSearch" -->
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
            
          </template>
        </el-input>
      </div>

      <!-- 主体区域 -->
      <div class="content-area">
        <!-- 左侧药材列表 -->
        <div class="medicine-list" ref="medicineListRef">
          <el-scrollbar height="400px">
            <div class="medicine-grid">
              <div
                v-for="item in medicineList"
                :key="item.id"
                class="medicine-item"
                :class="{ active: isSelected(item.name) }"
                @click="toggleSelect(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </el-scrollbar>
        </div>

        <!-- 右侧已选择列表 -->
        <div class="selected-list">
          <div class="selected-header">
            <span>已选择药材 ({{ selectedMedicines.length }})</span>
            <el-button link type="danger" @click="clearSelected" v-if="selectedMedicines.length">
              清空
            </el-button>
          </div>
          <el-scrollbar height="360px">
            <template v-if="selectedMedicines.length > 0">
              <div v-for="item in selectedMedicines" :key="item.id" class="selected-item">
                <span class="medicine-name">{{ item.name }}</span>
                <div class="weight-input">
                  <el-input-number
                    v-model="item.weight"
                    :min="1"
                    :max="1000"
                    size="small"
                    controls-position="right"
                    @change="(value) => handleWeightChange(value, item)"
                  />
                  <el-select v-model="item.unit" size="small" style="width: 50px">
                    <el-option label="g" value="g" />
                    <el-option label="片" value="片" />
                    <el-option label="枚" value="枚" />
                  </el-select>
                  <el-dropdown @command="(command) => handleAddCommand(command, item)" trigger="click">
                    <el-button type="primary" link>
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="addAbove">向上添加</el-dropdown-item>
                        <el-dropdown-item command="replace">替换</el-dropdown-item>
                        <el-dropdown-item command="addBelow">向下添加</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button type="danger" link @click="removeSelected(item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div v-else class="empty-text">暂未选择药材</div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChineseMedicineApi } from '/@/api/chineseMedicine/index'

interface Medicine {
  id: string
  name: string
  weight: number
  unit: string
}

const props = defineProps<{
  modelValue: boolean
  defaultSelected?: Medicine[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', medicines: Medicine[]): void
}>()

const visible = ref(false)
const searchKeyword = ref('')
const medicineList = ref<Medicine[]>([])
const selectedMedicines = ref<Medicine[]>([])
const pendingAdd = ref<{ mode: string; index: number } | null>(null)
const isHighlightActive = ref(false)
const medicineListRef = ref<HTMLElement | null>(null)

// 监听弹窗显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 弹窗打开时，初始化数据
    getMedicineList()
    // 确保使用新的数组引用，避免直接修改 props
    selectedMedicines.value = props.defaultSelected ? [...props.defaultSelected] : []
    // 重置pendingAdd状态
    pendingAdd.value = null
    // 重置闪烁状态
    isHighlightActive.value = false
  }
})

// 监听内部显示状态
watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

// 监听pendingAdd状态变化
watch(() => pendingAdd.value, (val) => {
  const medicineList = document.querySelector('.medicine-list')
  if (medicineList) {
    if (val) {
      medicineList.classList.add('highlight-border')
      isHighlightActive.value = true
      
    } else if (!val && isHighlightActive.value) {
      medicineList.classList.remove('highlight-border')
      isHighlightActive.value = false
    }
  }
})

// 获取药材列表
const getMedicineList = (keyword = '') => {
  // if(keyword.length !== 0 && keyword.length < 2){
  //   ElMessage.warning('请输入两个字以上')
  //   return
  // }
  useChineseMedicineApi()
    .getMedicines({page:1, pageSize:9999, name: keyword })
    .then((res) => {
      if(res.data.list.length == 0) {
        ElMessage.warning('请输入全称进行搜索！')
      }
      medicineList.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        weight: selectedMedicines.value.find(m => m.id === item.id)?.weight || 15,
        unit: item.unit || 'g'
      }))

      // if(medicineList.value.length == 1) {
      //   const medicine = medicineList.value[0];
      //   if (pendingAdd.value) {
      //     const { mode, index } = pendingAdd.value;
      //     const newMedicine = {
      //       id: medicine.id,
      //       name: medicine.name,
      //       weight: 15,
      //       unit: medicine.unit || 'g'
      //     };

      //     switch (mode) {
      //       case 'addAbove':
      //         selectedMedicines.value.splice(index, 0, newMedicine);
      //         break;
      //       case 'replace':
      //         selectedMedicines.value.splice(index, 1, newMedicine);
      //         break;
      //       case 'addBelow':
      //         selectedMedicines.value.splice(index + 1, 0, newMedicine);
      //         break;
      //     }
      //     pendingAdd.value = null;
      //   } else if (!isSelected(medicine.name)) {
      //     // 如果没有待添加操作且药材未被选中，直接添加到末尾
      //     selectedMedicines.value.push({
      //       id: medicine.id,
      //       name: medicine.name,
      //       weight: 15,
      //       unit: medicine.unit || 'g'
      //     });
      //   }
      // }
      searchKeyword.value = ''
    })
}

// 搜索处理
const handleSearch = () => {
  getMedicineList(searchKeyword.value)
}

// 选择/取消选择药材
// const toggleSelect = (medicine: Medicine) => {
//   const index = selectedMedicines.value.findIndex(item => item.name === medicine.name)
//   if (index === -1) {
//     selectedMedicines.value.push({
//       id: medicine.id,
//       name: medicine.name,
//       weight: 15,
//       unit: 'g'
//     })
//   } else {
//     selectedMedicines.value.splice(index, 1)
//   }
// }

// 移除已选择的药材
const removeSelected = (id: string) => {
  const index = selectedMedicines.value.findIndex(item => item.id === id)
  if (index !== -1) {
    selectedMedicines.value.splice(index, 1)
  }
}

// 清空选择
const clearSelected = () => {
  selectedMedicines.value = []
}

// 确认选择
const handleConfirm = () => {
  if (!selectedMedicines.value.length) {
    ElMessage.warning('请至少选择一个药材')
    return
  }

  // 检查是否有药材克数为空或0
  const invalidMedicine = selectedMedicines.value.find(medicine => !medicine.weight || medicine.weight === 0)
  if (invalidMedicine) {
    ElMessage.warning(`药材 "${invalidMedicine.name}" 的克数不能为空或0`)
    return
  }

  // 清除pendingAdd状态
  pendingAdd.value = null
  emit('confirm', selectedMedicines.value)
  visible.value = false
  ElMessage.warning('当前修改尚未保存，退出可能丢失内容！')
}

// 关闭弹窗
const handleClose = () => {
  searchKeyword.value = ''
  // 清除pendingAdd状态
  pendingAdd.value = null
  // 不再清空选中的药材，保持状态
}

const isSelected = (name: string): boolean => {
  return selectedMedicines.value.some(item => item.name === name)
}

// 修改克数变化的处理方法
const handleWeightChange = (value: number, medicine: Medicine) => {
  const index = selectedMedicines.value.findIndex(item => item.id === medicine.id)
  if (index !== -1) {
    selectedMedicines.value[index].weight = value
  }
}

// 处理添加命令
const handleAddCommand = (command: string, medicine: Medicine) => {
  const index = selectedMedicines.value.findIndex(item => item.id === medicine.id)
  if (index === -1) return

  // 标记当前的添加模式和位置
  const addMode = {
    mode: command,
    index: index
  }
  // 存储添加模式，供后续选择药材时使用
  pendingAdd.value = addMode

  // 添加闪烁动画类
  if (medicineListRef.value) {
    medicineListRef.value.classList.add('highlight-border')
  }
}

// 修改toggleSelect方法中的相关部分
const toggleSelect = (medicine: Medicine) => {
  // 如果有待添加的操作
  if (pendingAdd.value) {
    const { mode, index } = pendingAdd.value
    const newMedicine = {
      id: medicine.id,
      name: medicine.name,
      weight: 15,
      unit: 'g'
    }

    switch (mode) {
      case 'addAbove':
        selectedMedicines.value.splice(index, 0, newMedicine)
        break
      case 'replace':
        selectedMedicines.value.splice(index, 1, newMedicine)
        break
      case 'addBelow':
        selectedMedicines.value.splice(index + 1, 0, newMedicine)
        break
    }

    // 清除待添加状态并移除闪烁效果
    pendingAdd.value = null
    if (medicineListRef.value) {
      medicineListRef.value.classList.remove('highlight-border')
    }
    return
  }

  // 常规的选择/取消选择逻辑
  const index = selectedMedicines.value.findIndex(item => item.name === medicine.name)
  if (index === -1) {
    selectedMedicines.value.push({
      id: medicine.id,
      name: medicine.name,
      weight: 15,
      unit: 'g'
    })
  } else {
    selectedMedicines.value.splice(index, 1)
  }
}
</script>

<style scoped lang="scss">
.select-medicine-container {
  .search-area {
    margin-bottom: 20px;
  }

  .content-area {
    display: flex;
    gap: 20px;

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }

    .medicine-list {
      flex: 1;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;

      &.highlight-border {
        animation: borderBlink 1s infinite;
      }

      @keyframes borderBlink {
        0% {
          border-color: var(--el-border-color-lighter);
        }
        50% {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 5px var(--el-color-primary);
        }
        100% {
          border-color: var(--el-border-color-lighter);
        }
      }

      @media screen and (max-width: 768px) {
        height: 300px;
      }

      .medicine-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
        padding: 10px;

        @media screen and (max-width: 768px) {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }

        .medicine-item {
          height: 32px;
          line-height: 32px;
          padding: 0 12px;
          background-color: var(--el-fill-color-lighter);
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.3s;

          &:hover {
            background-color: var(--el-color-primary-light-9);
          }

          &.active {
            background-color: var(--el-color-primary) !important;
            color: white !important;
          }
        }
      }
    }

    .selected-list {
      width: 300px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;

      @media screen and (max-width: 768px) {
        width: 100%;
        height: 300px;
      }

      .selected-header {
        padding: 10px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .selected-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:hover {
          background-color: var(--el-fill-color-light);
        }
        
        .medicine-name {
          flex: 1;
          font-size: 14px;
        }
        
        .weight-input {
          display: flex;
          align-items: center;
          gap: 10px;
          
          :deep(.el-input-number) {
            width: 100px;

            @media screen and (max-width: 768px) {
              width: 80px;
            }
          }
        }
      }

      .empty-text {
        padding: 20px;
        text-align: center;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>