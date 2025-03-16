<template>
  <el-dialog
    title="选择穴位"
    v-model="visible"
    width="70%"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="select-medicine-container">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入穴位名称"
          @keyup.enter="handleSearch"
          clearable
          @clear="getMedicineList"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 主体区域 -->
      <div class="content-area">
        <!-- 左侧穴位列表 -->
        <div class="medicine-list">
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
            <span>已选择穴位 ({{ selectedZhen.length }})</span>
            <el-button link type="danger" @click="clearSelected" v-if="selectedZhen.length">
              清空
            </el-button>
          </div>
          <el-scrollbar height="360px">
            <template v-if="selectedZhen.length > 0">
              <div v-for="item in selectedZhen" :key="item.id" class="selected-item">
                <span class="medicine-name">{{ item.name }}</span>
                <el-button type="danger" link @click="removeSelected(item.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
            <div v-else class="empty-text">暂未选择穴位</div>
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
import { Search, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAcupointsApi } from '/@/api/zhenjiuManage/index'

interface Medicine {
  id: string
  name: string
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
const selectedZhen = ref<Medicine[]>([])

// 监听弹窗显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 弹窗打开时，初始化数据
    getMedicineList()
    // 确保使用新的数组引用，避免直接修改 props
    selectedZhen.value = props.defaultSelected ? [...props.defaultSelected] : []
  }
})

// 监听内部显示状态
watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

// 获取穴位列表
const getMedicineList = (keyword = '') => {
  useAcupointsApi()
    .getAcupoints({page:1, pageSize:9999, name: keyword })
    .then((res) => {
      medicineList.value = res.data.list.map(item => ({
        id: item.id,
        name: item.name
      }))

      if(medicineList.value.length == 1 && !selectedZhen.value.some(item => item.name === medicineList.value[0].name)){
        selectedZhen.value.push({
          id: medicineList.value[0].id,
          name: medicineList.value[0].name
        })
      }
      searchKeyword.value = ''
    })
}

// 搜索处理
const handleSearch = () => {
  getMedicineList(searchKeyword.value)
}

// 选择/取消选择穴位
const toggleSelect = (medicine: Medicine) => {
  const index = selectedZhen.value.findIndex(item => item.name === medicine.name)
  if (index === -1) {
    selectedZhen.value.push({
      id: medicine.id,
      name: medicine.name
    })
  } else {
    selectedZhen.value.splice(index, 1)
  }
}

// 移除已选择的穴位
const removeSelected = (id: string) => {
  const index = selectedZhen.value.findIndex(item => item.id === id)
  if (index !== -1) {
    selectedZhen.value.splice(index, 1)
  }
}

// 清空选择
const clearSelected = () => {
  selectedZhen.value = []
}

// 确认选择
const handleConfirm = () => {
  if (!selectedZhen.value.length) {
    ElMessage.warning('请至少选择一个穴位')
    return
  }
  console.log(selectedZhen.value, 'kk');
  
  emit('confirm', selectedZhen.value)
  visible.value = false
  ElMessage.warning('当前修改尚未保存，退出可能丢失内容！')
}

// 关闭弹窗
const handleClose = () => {
  searchKeyword.value = ''
  // 不再清空选中的穴位，保持状态
}

const isSelected = (name: string): boolean => {
  return selectedZhen.value.some(item => item.name === name)
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
          color: var(--el-text-color-primary);
          text-align: center;
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