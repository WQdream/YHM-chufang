<template>
  <el-dialog
    v-model="visible"
    :title="'施针详情'"
    width="800px"
    :close-on-click-modal="false"
    class="prescription-dialog"
  >
    <div class="prescription-view">
      <!-- 打印按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon>打印处方
        </el-button>
      </div>

      <!-- 处方内容 -->
      <div ref="printRef" class="prescription-content">
        <div class="prescription-header">
          <h1>针灸处方</h1>
          <div class="prescription-date">施针时间：{{ acupointsData.acupunctureDate }}</div>
        </div>

        <!-- 患者信息 -->
        <div class="info-section">
          <div class="info-row">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ acupointsData.patientName }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别：</span>
              <span class="value">{{ acupointsData.gender === '1' ? '男' : '女' }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄：</span>
              <span class="value">{{ acupointsData.age == 0?'保密': `${acupointsData.age}岁`}}</span>
            </div>
          </div>
        </div>

        <!-- 诊断信息 -->
        <div class="section">
          <div class="section-title">临床诊断</div>
          <div class="section-content">{{ acupointsData.diagnosis }}</div>
        </div>

        <!-- 药方信息 -->
        <div class="section">
          <div class="section-title">穴位</div>
          <div class="section-content">
            <div class="medicine-list">
              <template v-for="(medicine, index) in prescriptionMedicines" :key="medicine.id">
                <span class="medicine-item">
                  {{ medicine.name }}
                </span>
                <span v-if="index !== prescriptionMedicines.length - 1" class="separator">、</span>
              </template>
            </div>
          </div>
        </div>


        <!-- 备注信息 -->
        <div class="section" v-if="acupointsData.remark">
          <div class="section-title">备注</div>
          <div class="section-content">{{ acupointsData.remark }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Printer } from '@element-plus/icons-vue'

interface AcupointsData {
  id: string
  patientName: string
  age: string | number
  gender: string
  prescriptionDate: string
  diagnosis: string
  acupoints: string
  remark: string
}

interface Medicine {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: boolean
  acupointsData: AcupointsData
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = ref(false)
const prescriptionMedicines = ref<Medicine[]>([])
const printRef = ref<HTMLElement | null>(null)

// 监听弹窗显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.acupointsData.acupoints) {
    // 将处方字符串转换为药材数组，格式为：药材1 10g、药材2 15mg
    const zhen = props.acupointsData.acupoints.split('、')
    prescriptionMedicines.value = zhen.map((item, index) => {
      const [name] = item.split(' ')
			// 使用正则表达式匹配数字和非数字部分
      return {
        id: String(index),
        name
      }
    })
  }
})

// 监听内部显示状态
watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

// 修改复制文本功能
const copyText = (text: string) => {
  // 创建临时文本域
  const textarea = document.createElement('textarea')
  textarea.value = text
  // 将文本域添加到文档中
  document.body.appendChild(textarea)
  // 选中文本
  textarea.select()
  try {
    // 执行复制命令
    document.execCommand('copy')
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  } finally {
    // 移除临时文本域
    document.body.removeChild(textarea)
  }
}

// 处理打印
const handlePrint = () => {
  const content = printRef.value
  if (!content) return

  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('打印窗口被阻止，请允许弹出窗口')
    return
  }

  // 写入打印内容
  const printContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<title>处方单</title>',
    '<style>',
    'body { margin: 0; padding: 0; background: #fff; }',
    '.prescription-content { background: #fff; padding: 20px; }',
    '@media screen { .prescription-content { display: none; } }', // 在屏幕上隐藏内容
    '@media print {',
    'body * { display: none; }',
    '.prescription-content, .prescription-content * { display: block; }',
    '.prescription-image, .image-section, .section:has(.image-section) { display: none !important; }',
    '@page { size: A4; margin: 20mm; }',
    'body { font-family: SimSun, serif; color: #000; line-height: 1.5; }',
    '.prescription-content { max-width: 170mm; margin: 0 auto; }',
    '.prescription-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }',
    '.prescription-header h1 { font-size: 24px; margin: 0; }',
    '.info-section { margin-bottom: 20px; }',
    '.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }',
    '.info-item { display: flex; align-items: center; }',
    '.info-item .label { min-width: 80px; color: #000; }',
    '.section { margin-bottom: 20px; }',
    '.section-title { font-weight: bold; margin-bottom: 10px; font-size: 16px; }',
    '.section-content { padding: 10px; border: 1px solid #000; min-height: 60px; }',
    '.prescription-medicines { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }',
    '.medicine-item { padding: 5px 0; white-space: nowrap; }',
    '.section-content .medicine-list { display: flex; flex-wrap: wrap; gap: 20px; }',
    '.section-content .medicine-list { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }',
    '.section-content .medicine-list .medicine-item { padding: 0; background: none; box-shadow: none; }',
    '.section-content .medicine-list .separator { margin: 0 2px; }',
    '}',
    '</style>',
    '</head>',
    '<body style="background: #fff;">',
    content.outerHTML,
    '<scr' + 'ipt>',
    'window.onload = function() { window.print(); window.close(); }',
    '</scr' + 'ipt>',
    '</body>',
    '</html>'
  ].join('\n')

  printWindow.document.write(printContent)
  printWindow.document.close()
}
</script>

<style scoped lang="scss">
.prescription-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.prescription-view {
  .action-bar {
    margin-bottom: 20px;
    text-align: right;
  }

  .prescription-content {
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .prescription-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e4e7ed;

      h1 {
        font-size: 24px;
        color: #303133;
        margin: 0 0 10px 0;
        font-weight: 600;
      }

      .prescription-date {
        color: #909399;
        font-size: 14px;
      }
    }

    .info-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;

      .info-row {
        display: flex;
        flex-wrap: wrap;
        gap: 40px;

        .info-item {
          display: flex;
          align-items: center;

          .label {
            color: #606266;
            margin-right: 8px;
            font-weight: 500;
          }

          .value {
            color: #303133;
          }
        }
      }
    }

    .section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 16px;
        color: #303133;
        font-weight: 600;
        margin-bottom: 12px;
        position: relative;
        padding-left: 12px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          background: var(--el-color-primary);
          border-radius: 2px;
        }
      }

      .section-content {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        color: #606266;
        line-height: 1.6;
      }

      .medicine-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;

        .medicine-item {
          padding: 8px 16px;
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .separator {
          color: #606266;
          display: none;
        }
      }
    }

    .image-section {
      // text-align: center;
      
      .prescription-image {
        max-width: 100px;
        max-height: 100px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 打印样式
@media print {
  .prescription-content {
    padding: 20px !important;
    box-shadow: none !important;
  }

  .action-bar {
    display: none !important;
  }

  .section-content {
    border: 1px solid #dcdfe6 !important;
  }
}
</style> 