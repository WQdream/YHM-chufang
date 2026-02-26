<template>
  <div class="address-manager">
    <!-- 头部标题和新增按钮 -->
    <div class="header">
      <h2 class="title">收货地址管理</h2>
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增地址
      </el-button>
    </div>

    <!-- 地址卡片列表 -->
    <div class="address-list">
      <div 
        v-for="address in addressList" 
        :key="address.id" 
        class="address-card"
        @click="handleCardClick(address)"
      >
        
        <!-- 地址信息 -->
        <div class="address-info">
          <div class="contact-info">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ address.province }} {{ address.city }} {{ address.county }} {{ address.detailAddress }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions" @click.stop>
          <el-button link type="primary" @click="handleEdit(address)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(address)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="addressList.length === 0" class="empty-state">
        <el-empty description="暂无收货地址">
          <el-button type="primary" @click="handleAdd">添加地址</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="450px"
      class="address-dialog"
    >
      <el-form 
        ref="formRef" 
        :model="currentAddress" 
        :rules="formRules" 
        label-width="80px"
        class="address-form"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="currentAddress.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="currentAddress.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="regionValue"
            :options="regionOptions"
            placeholder="请选择省市区"
            style="width: 100%"
            @change="handleRegionChange"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input
            v-model="currentAddress.detailAddress"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="currentAddress.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>
        
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

// 地址类型定义
interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  county: string
  detailAddress: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

// 响应式数据
const addressList = ref<Address[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

// 当前编辑的地址
const currentAddress = reactive<Address>({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  county: '',
  detailAddress: '',
  remark: ''
})

// 地区选择器的值
const regionValue = ref<string[]>([])

// 模拟地区数据
const regionOptions = ref([
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '海淀区', label: '海淀区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '荔湾区', label: '荔湾区' },
          { value: '天河区', label: '天河区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '罗湖区', label: '罗湖区' },
          { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' }
        ]
      }
    ]
  }
])

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '详细地址长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

// API基础URL
const API_BASE_URL = 'http://addressback.wqdream.vip/api'

// API请求函数
const fetchAddresses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses`)
    const result = await response.json()
    if (result.code === 200) {
      return result.data.list
    } else {
      throw new Error(result.message || '获取地址列表失败')
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
    return []
  }
}

// 初始化地址数据
const initAddressData = async () => {
  const addresses = await fetchAddresses()
  addressList.value = addresses
}

// 重置表单
const resetForm = () => {
  Object.assign(currentAddress, {
    id: '',
    name: '',
    phone: '',
    province: '',
    city: '',
    county: '',
    detailAddress: '',
    remark: ''
  })
  regionValue.value = []
}

// 新增地址
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (address: Address) => {
  isEdit.value = true
  Object.assign(currentAddress, { ...address })
  regionValue.value = [address.province, address.city, address.county]
  dialogVisible.value = true
}

// 点击卡片复制地址
const handleCardClick = async (address: Address) => {
  try {
    const addressText = `收件人: ${address.name}
手机号码: ${address.phone}
所在地区: ${address.province}${address.city}${address.county}
详细地址: ${address.detailAddress}`
    await navigator.clipboard.writeText(addressText)
    ElMessage.success('地址已复制到剪贴板')
  } catch (error) {
    // 如果剪贴板API不可用，尝试使用传统方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = `收件人: ${address.name}
手机号码: ${address.phone}
所在地区: ${address.province}${address.city}${address.county}
详细地址: ${address.detailAddress}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('地址已复制到剪贴板')
    } catch (fallbackError) {
      ElMessage.error('复制失败，请手动复制')
    }
  }
}

// 删除地址
const handleDelete = async (address: Address) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除收货人"${address.name}"的地址吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const index = addressList.value.findIndex(item => item.id === address.id)
    if (index > -1) {
      addressList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 地区选择变化
const handleRegionChange = (value: string[]) => {
  if (value && value.length === 3) {
    currentAddress.province = value[0]
    currentAddress.city = value[1]
    currentAddress.county = value[2]
  }
}

// 保存地址
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // 编辑模式
      const index = addressList.value.findIndex(item => item.id === currentAddress.id)
      if (index > -1) {
        addressList.value[index] = { ...currentAddress }
      }
      ElMessage.success('编辑成功')
    } else {
      // 新增模式
      const newAddress = {
        ...currentAddress,
        id: Date.now().toString() // 简单的ID生成，转为字符串
      }
      
      addressList.value.unshift(newAddress)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 初始化数据
initAddressData()
</script>

<style scoped>
.address-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.add-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 100%;
}

/* 确保在宽屏幕上最多显示4列 */
@media (min-width: 1200px) {
  .address-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

.address-card {
  position: relative;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.address-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}


.address-info {
  margin-bottom: 16px;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.phone {
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.address-detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.actions .el-button {
  padding: 8px 12px;
  font-size: 13px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.address-dialog {
  border-radius: 12px;
}

.address-form {
  padding: 0 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .address-manager {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .title {
    font-size: 20px;
    text-align: center;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
  }
  
  .address-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .address-card {
    padding: 16px;
  }
  
  .contact-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .actions {
    justify-content: space-between;
  }
  
  .actions .el-button {
    flex: 1;
    min-width: 0;
  }
  
  .el-dialog {
    margin: 5vh auto;
    width: 95% !important;
    max-width: 400px !important;
  }
  
  .address-form .el-form-item__label {
    width: 70px !important;
  }
}

@media (max-width: 480px) {
  .address-manager {
    padding: 12px;
  }
  
  .address-card {
    padding: 12px;
  }
  
  .name {
    font-size: 16px;
  }
  
  .actions {
    justify-content: center;
    gap: 16px;
  }
  
  .actions .el-button {
    flex: 0 0 auto;
    min-width: 80px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .address-card {
    background: #1d1e1f;
    border-color: #414243;
  }
  
  .name {
    color: #f0f0f0;
  }
  
  .phone {
    background: #2d2d2d;
    color: #a0a0a0;
  }
  
  .address-detail {
    color: #a0a0a0;
  }
}
</style>