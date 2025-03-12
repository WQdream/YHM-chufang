<template>
	<div class="table-demo-container layout-padding">
		<div class="table-demo-padding layout-padding-view layout-padding-auto">
			<!-- 搜索区域 -->
			<div class="content-wrapper">
				<vxe-form v-bind="formOptions" v-on="formEvents"></vxe-form>
				<div style="margin-bottom: 10px;">
					<el-button type="primary" size="default" @click="handleAdd">新增处方</el-button>
					<!-- <el-button type="primary" size="default" @click="handleImport">导入</el-button> -->
					<el-button type="danger" size="default" @click="banchDelete">批量删除</el-button>
					
					<!-- 添加更多操作下拉菜单 -->
					<el-dropdown @command="handleCommand" style="margin-left: 10px;">
						<el-button type="primary" size="default">
							更多操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="export">
									<el-icon><Download /></el-icon>导出Excel
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
				<!-- 表格区域 -->
				<div class="table-wrapper">
					<vxe-table 
						ref="tableRef" 
						empty-text="没有更多数据了！" 
						:loading="loading" 
						round 
						stripe 
						border 
						show-overflow 
						:auto-resize="true"
						:data="tableData"
						:height="'100%'"
						:row-config="{ height: 80 }"
					>
						<vxe-column type="checkbox" width="60"></vxe-column>
						<vxe-column field="seq" type="seq" :width='isMobile?"17%":"70"'></vxe-column>
						<vxe-column field="patientName" :fixed="ifFixed?'left':''" :width='isMobile?"30%":""' title="姓名"></vxe-column>
						<vxe-column field="age" title="年龄" :width='isMobile?"30%":""'>
							<template #default="{ row }">
								{{ row.age == 0?'保密': row.age}}
							</template>
						</vxe-column>
						<vxe-column field="gender" title="性别" :width='isMobile?"30%":""'></vxe-column>
						<vxe-column field="prescriptionDate" title="开方时间" :width='isMobile?"30%":""'></vxe-column>
						<vxe-column field="diagnosis" title="临床诊断" :width='isMobile?"30%":""'></vxe-column>
						<vxe-column field="prescription" title="药方" :width='isMobile?"30%":""'></vxe-column>
						<vxe-column field="pairs" title="副数" :width='isMobile?"30%":""'></vxe-column>
					
						<vxe-column field="imageUrl" align="center" title="药方图片" :width='isMobile?"30%":""'>
							<template #default="{ row }">
								<div class="image-cell">
									<el-image 
										v-if="row.imageUrl"
										:src="checkHttpProtocol(row.imageUrl) ? row.imageUrl : baseUrl + row.imageUrl"
										:preview-src-list="[checkHttpProtocol(row.imageUrl) ? row.imageUrl : baseUrl + row.imageUrl]"
										:initial-index="0"
										preview-teleported
										class="table-image"
										fit="cover"
									/>
									<span v-else>暂无图片</span>
								</div>
							</template>
						</vxe-column>
						
						<vxe-column field="active" title="操作" width="180" align="center">
							<template #default="{ row }">
								<div class="flex items-center justify-center space-x-2">
									<el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
									<el-dropdown trigger="click" style="margin-left: 15px">
										<el-button type="primary" size="small">
											更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
										</el-button>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item @click="handleEdit(row)">编辑</el-dropdown-item>
												<el-dropdown-item @click="handleReuse(row)">复用</el-dropdown-item>
												<el-dropdown-item divided @click="handleDelete(row)" class="text-danger">删除</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</div>
							</template>
						</vxe-column>
					</vxe-table>
				</div>
			</div>
			<!-- 分页区域 -->
			<div class="pagination-wrapper">
				<vxe-pager
					v-model:currentPage="pageVO.currentPage"
					v-model:pageSize="pageVO.pageSize"
					:total="pageVO.total"
					@page-change="pageChange"
				>
				</vxe-pager>
			</div>
		</div>

		<!-- 新增/编辑弹窗 -->
		<el-dialog
			:title="dialogTitle"
			v-model="dialogVisible"
			width="50%"
			:close-on-click-modal="false"
		>
			<el-form :model="formData" label-width="100px">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="姓名" required>
							<el-input v-model="formData.patientName" placeholder="请输入患者姓名"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="年龄">
							<el-input-number v-model="formData.age" :min="0" :max="150" placeholder="请输入年龄"></el-input-number>
						</el-form-item>
					</el-col>
				</el-row>
				
				<el-row :gutter="20" style="margin: 20px;">
					<el-col :span="12">
						<el-form-item label="性别" required>
							<el-radio-group v-model="formData.gender">
								<el-radio label="1">男</el-radio>
								<el-radio label="2">女</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="开方时间" required>
							<el-date-picker
								v-model="formData.prescriptionDate"
								type="date"
								placeholder="选择开方时间"
								format="YYYY-MM-DD"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
				</el-row>

				<el-form-item label="临床诊断" required>
					<el-input
						v-model="formData.diagnosis"
						type="textarea"
						:rows="2"
						placeholder="请输入临床诊断"
					/>
				</el-form-item>

				<el-form-item label="药方">
					<div class="prescription-display">
						<div v-if="selectedMedicines.length > 0" class="medicine-list">
							<el-tag
								v-for="medicine in selectedMedicines"
								:key="medicine.id"
								class="medicine-tag"
								type="success"
								effect="light"
							>
								{{ medicine.name }} {{ medicine.weight }} {{  medicine.unit }}
							</el-tag>
						</div>
						<div v-else class="empty-text">暂未选择药材</div>
						<el-button type="primary" @click="selectMedicineVisible = true">
							选择药材
						</el-button>
					</div>
				</el-form-item>

				<el-form-item label="副数" required>
					<el-input-number
						v-model="formData.pairs"
						:min="1"
						:max="99"
						controls-position="right"
						placeholder="请输入副数"
					/>
				</el-form-item>

				<el-form-item label="备注">
					<el-input
						v-model="formData.remark"
						type="textarea"
						:rows="2"
						placeholder="请输入备注信息"
					/>
				</el-form-item>

				<el-form-item label="药方图片">
					<el-upload
						class="prescription-uploader"
						:action="uploadUrl"
						:show-file-list="false"
						:on-success="handleImageSuccess"
						:on-remove="handleImageRemove"
						:before-upload="beforeImageUpload"
					>
						<template v-if="formData.imageUrl">
							<div class="image-preview">
								<img :src="checkHttpProtocol(formData.imageUrl) ? formData.imageUrl : baseUrl + formData.imageUrl" class="prescription-image" />
								<div class="image-actions">
									<el-icon class="delete-icon" @click.stop="handleImageRemove"><Delete /></el-icon>
								</div>
							</div>
						</template>
						<el-icon v-else class="prescription-uploader-icon"><Plus /></el-icon>
					</el-upload>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
				</span>
			</template>
		</el-dialog>

		<!-- 导入弹窗 -->
		<el-dialog
			title="导入处方"
			v-model="importDialogVisible"
			width="30%"
			:close-on-click-modal="false"
		>
			<el-upload
				class="upload-demo"
				:auto-upload="false"
				accept=".xlsx,.xls"
				:on-change="handleFileChange"
				:limit="1"
				:file-list="importForm.fileList"
			>
				<template #trigger>
					<el-button type="primary">选择文件</el-button>
				</template>
				<template #tip>
					<div class="el-upload__tip">
						请上传Excel文件，必须包含以下列：姓名、年龄、性别、开方时间、临床诊断、药方，可选列：备注
					</div>
				</template>
			</el-upload>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="importDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="handleImportSubmit">确定</el-button>
				</span>
			</template>
		</el-dialog>

		<!-- 引入选择药方组件 -->
		<SelectMedicine
			v-model="selectMedicineVisible"
			:default-selected="selectedMedicines"
			@confirm="handleMedicineConfirm"
		/>

		<!-- 处方查看组件 -->
		<PrescriptionView
			v-model="prescriptionViewVisible"
			:prescription-data="currentPrescription"
		/>

		<!-- 新增导入组件 -->
		<!-- <el-upload
			class="upload-excel"
			:show-file-list="false"
			:before-upload="beforeUpload"
			:http-request="({ file }) => handleExcelImport(file)"
		>
			<el-button type="primary" size="default">导入Excel</el-button>
		</el-upload> -->
	</div>
</template>

<script setup lang="ts" name="zhongyaoManage">
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, ArrowDown, Download, Printer, Edit } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx';
import { usePrescriptionsApi } from '/@/api/prescriptions/index';
import SelectMedicine from './components/SelectMedicine.vue'
import PrescriptionView from './components/PrescriptionView.vue'
import { useCommonApi } from '/@/api/common/index';


interface RowVO {
	id: string;
	name: string;
}

interface Medicine {
	id: string;
	name: string;
	weight: number; // 克数
	unit: string; // 添加单位字段
}

const isMobile = ref(window.innerWidth < 768)
let ifFixed = ref(false)
isMobile.value && (ifFixed.value = true)
const tableRef = ref<VxeTableInstance<RowVO>>()
const submitLoading = ref(false)
// 分页数据
const pageVO = reactive({
	total: 0,
	currentPage: 1,
	pageSize: 10
});

const loading = ref(false);
const dialogVisible = ref(false);
const uploadUrl = `${import.meta.env.VITE_API_URL}/api/common/upload`
// const baseUrl = import.meta.env.VITE_API_URL.slice(0, -1)
const baseUrl = import.meta.env.VITE_API_URL

const dialogTitle = ref('新增处方');
const formData = reactive({
	id: '',
	patientName: '',
	age: '',
	gender: '1', // 1-男，2-女
	prescriptionDate: '',
	diagnosis: '',
	prescription: '', // 存储格式: "药材1 10g、药材2 15g、药材3 20g"
	imageUrl: '',
	remark: '', // 添加备注字段
	pairs: 7  // 添加副数字段
});

const searchForm = reactive({
	name: '',
	startTime: '',
	endTime: ''
});


const checkHttpProtocol = (url)=> {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

const formOptions = reactive<VxeFormProps<FormDataVO>>({
	data: {
		name: '',
		startTime: '',
		endTime: ''
	},
	items: [
		{ field: 'name', title: '姓名', span: 6, itemRender: { name: 'VxeInput', placeholder: '请输入姓名' } },
		{ field: 'startTime', title: '开始时间', span: 6, folding: true, itemRender: { name: 'VxeDatePicker' } },
		{ 
			field: 'endTime',
			title: '至',
			span: 6,
			folding: true,
			itemRender: {
				name: 'VxeDatePicker',
			}
		},
		{
			span: 6,
			collapseNode: true,
			align: 'left',
			itemRender: {
				name: 'VxeButtonGroup',
				options: [
					{ type: 'submit', content: '搜索', status: 'primary' },
					{ type: 'reset', content: '重置' },
				],
			},
		},
	],
});

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type == 'image/jpeg' || rawFile.type == 'image/png' || rawFile.type == 'image/jpeg') {
	if (rawFile.size / 1024 / 1024 > 4) {
  	  ElMessage.error('图片大小限制 4MB!')
  	  return false
  	}
  }else{
	ElMessage.error('必须上传jpg或者png格式！')
    return false
  }
  return true
}

const formEvents: VxeFormListeners = {
	submit(e) {
		console.log(e,'e');
		
		pageVO.currentPage = 1
		searchForm.name = e.data.name
		searchForm.startTime = e.data.startTime
		searchForm.endTime = e.data.endTime
		getPrescript(searchForm)
	},
	reset() {
		pageVO.currentPage = 1
		searchForm.name = ''
		searchForm.startTime = ''
		searchForm.endTime = ''
		getPrescript()
	},
};

// 表格数据
const tableData = ref<RowVO[]>([
]);

// 获取中药材列表
const getPrescript = (params = searchForm) => {
	let obj = {
		page: pageVO.currentPage,
		pageSize: pageVO.pageSize,
		name: params.name,
		startTime: params.startTime,
		endTime: params.endTime
	}
	usePrescriptionsApi().getPrescript(obj).then(res => {
		tableData.value = res.data.list
		pageVO.total = res.data.total
	})
}
// 初始化中药材列表
getPrescript()

const updateMedicines = (id = '',name = '') => {
	let obj = {
		id: id,
		name: name
	}
	usePrescriptionsApi().update(obj).then(res => {
		console.log(res,'res')
	})
}

// 新增按钮点击
const handleAdd = () => {
	dialogTitle.value = '新增处方'
	// 重置表单数据
	Object.assign(formData, {
		id: '',
		patientName: '',
		age: '',
		gender: '1',
		prescriptionDate: '',
		diagnosis: '',
		prescription: '',
		imageUrl: '',
		remark: '',
		pairs: 7  // 默认值为7
	})
	selectedMedicines.value = []
	dialogVisible.value = true
}

// 编辑按钮点击
const handleEdit = (row: any) => {
	dialogTitle.value = '编辑处方'
	// 重置表单数据
	Object.assign(formData, {
		id: row.id,
		patientName: row.patientName,
		age: row.age,
		gender: row.gender == '男'?'1':'2',
		prescriptionDate: row.prescriptionDate,
		diagnosis: row.diagnosis,
		prescription: row.prescription,
		imageUrl: row.imageUrl,
		remark: row.remark,
		pairs: row.pairs || 7
	})
	
	if (row.prescription) {
		// 解析带单位的药方字符串
		const medicines = row.prescription.split('、').map((item: string) => {
			const [name, weightWithUnit] = item.split(' ')
			
			// 使用正则表达式匹配数字和非数字部分
			const match = weightWithUnit.match(/(\d+)([^\d]+)/)
			
			// 如果匹配成功，则分别获取数字(克数)和非数字(单位)部分
			const weight = match ? parseInt(match[1]) : 0
			const unit = match ? match[2] : 'g' // 如果没有匹配到单位，默认为'g'
			
			return {
				id: String(Math.random()),
				name,
				weight,
				unit
			}
		})
		selectedMedicines.value = medicines
	} else {
		selectedMedicines.value = []
	}
	
	dialogVisible.value = true
}

// 查看按钮点击
const handleView = (row: any) => {
	currentPrescription.value = {
		...row,
		imageUrl: row.imageUrl ?  checkHttpProtocol(row.imageUrl) ? row.imageUrl : baseUrl + row.imageUrl : ''
	}
	prescriptionViewVisible.value = true
}

// 选择药方按钮点击
const handlePrescript = (row: RowVO) => {
	dialogTitle.value = '选择药方';
	dialogVisible.value = true;
};

// 删除按钮点击
const handleDelete = (row: any) => {
	ElMessageBox.confirm('确认要删除该处方记录吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		let obj = {
			ids: Array.isArray(row.id) ? row.id : [row.id]
		}
		usePrescriptionsApi().delete(obj).then(res => {	
			ElMessage.success('删除成功');
			pageVO.currentPage = 1
			getPrescript()
		}).catch(err => {
			ElMessage.error('删除失败');
		})
	}).catch(() => {
		ElMessage.info('已取消删除')
	})
};

// 弹窗确定按钮
const handleSubmit = () => {
	if (!formData.patientName) {
		ElMessage.warning('请输入患者姓名')
		return
	}
	if (!selectedMedicines.value.length) {
		ElMessage.warning('请选择药方')
		return
	}
	
	// 更新处方字符串，包含单位信息
	formData.prescription = selectedMedicines.value
		.map(medicine => `${medicine.name} ${medicine.weight}${medicine.unit}`)
		.join('、')
	
	submitLoading.value = true
	if(dialogTitle.value === '新增处方'){
		delete formData.id
	}
	// 如果是编辑，需要传入 id
	const api = formData.id ? 
		usePrescriptionsApi().update({ data: formData }) : 
		usePrescriptionsApi().create({ data: formData })
		
	api.then(() => {
		ElMessage.success(formData.id ? '更新成功' : '新增成功')
		dialogVisible.value = false
		getPrescript()
	}).finally(() => {
		submitLoading.value = false
	})
}

const banchDelete = () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length === 0) {
      ElMessage.warning('请先选择要删除的数据')
      return
    }
    
    // 添加确认对话框
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectRecords.length} 条数据吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        let ids = []
        selectRecords.forEach(item => {
          ids.push(item.id)
        })
        let obj = {
          id: ids
        }
        
        handleDelete(obj)
      })
      .catch(() => {
        ElMessage.info('已取消删除操作')
      })
  }
}

// 分页变化
const pageChange = ({ pageSize, currentPage }: { pageSize: number; currentPage: number }) => {
	pageVO.currentPage = currentPage;
	pageVO.pageSize = pageSize;
	getPrescript()
};

// 导入相关的状态
const importDialogVisible = ref(false)
const importForm = reactive({
  fileList: [] as any[]
})

// 打开导入弹窗
const handleImport = () => {
  importDialogVisible.value = true
  importForm.fileList = []
}

// 处理文件变化
const handleFileChange = (file: any) => {
  importForm.fileList = [file]
}

// 处理导入提交
const handleImportSubmit = () => {
  if (importForm.fileList.length === 0) {
    ElMessage.error('请选择要导入的文件')
    return
  }

  const file = importForm.fileList[0].raw
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 检查必要的列是否存在
      const requiredColumns = ['姓名', '年龄', '性别', '开方时间', '临床诊断', '药方']
      const hasAllColumns = requiredColumns.every(column => 
        jsonData.length > 0 && column in (jsonData[0] as any)
      )

      if (!hasAllColumns) {
        ElMessage.error('Excel文件格式不正确，请确保包含：姓名、年龄、性别、开方时间、临床诊断、药方')
        return
      }

      // 转换数据格式
      const prescriptions = (jsonData as any[]).map(row => ({
        patientName: row['姓名'],
        age: row['年龄'],
        gender: row['性别'] === '男' ? '1' : '2',
        prescriptionDate: row['开方时间'],
        diagnosis: row['临床诊断'],
        prescription: row['药方'],
        remark: row['备注'] || '' // 添加备注字段
      }))
	
      // 创建处方
      usePrescriptionsApi()
        .create({ data: prescriptions })
        .then(() => {
          ElMessage.success('导入成功')
          importDialogVisible.value = false
          getPrescript()
        })
        .catch(() => {
          ElMessage.error('导入失败')
        })

    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
    }
  }

  reader.readAsBinaryString(file)
}

// 添加图片上传相关方法
const handleImageSuccess = (response: any) => {
	formData.imageUrl = response.data.url; // 根据实际返回数据结构调整
};

const handleImageRemove = (file?: any) => {
	formData.imageUrl = ''
}

// 清空表单
const resetForm = () => {
	formData.id = '';
	formData.patientName = '';
	formData.age = '';
	formData.gender = '1';
	formData.prescriptionDate = '';
	formData.diagnosis = '';
	formData.prescription = '';
	formData.imageUrl = '';
	selectedMedicines.value = []
};

// 添加相关数据
const selectMedicineVisible = ref(false)
const selectedMedicines = ref<Medicine[]>([])

// 打开选择药方弹窗
const openSelectMedicine = () => {
	selectMedicineVisible.value = true
}

// 处理药方选择确认
const handleMedicineConfirm = (medicines: Medicine[]) => {
	selectedMedicines.value = medicines
	// 更新表单数据中的药方字段，加入克数信息
	formData.prescription = medicines.map(item => `${item.name} ${item.weight}${item.unit}`).join('、')
}

// 添加相关数据
const prescriptionViewVisible = ref(false)
const currentPrescription = ref({
	id: '',
	patientName: '',
	age: '',
	gender: '',
	prescriptionDate: '',
	diagnosis: '',
	prescription: '',
	imageUrl: ''
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
	switch (command) {
		case 'export':
			handleExport()
			break
		case 'print':
			printTable()
			break
	}
}

// 导出Excel
const handleExport = () => {
  // 准备导出数据
  const exportData = tableData.value.map(item => ({
    '姓名': item.patientName,
    '年龄': item.age,
    '性别': item.gender === '1' ? '男' : '女',
    '开方时间': item.prescriptionDate,
    '临床诊断': item.diagnosis,
    '药方': item.prescription,
    '副数': item.pairs || 7, // 添加副数字段，如果不存在则默认为7
    '备注': item.remark || '' // 添加备注字段
  }))

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)

  // 设置列宽
  ws['!cols'] = [
    { width: 10 }, // 姓名
    { width: 8 },  // 年龄
    { width: 8 },  // 性别
    { width: 15 }, // 开方时间
    { width: 30 }, // 临床诊断
    { width: 40 }, // 药方
    { width: 8 },  // 副数
    { width: 20 }  // 备注
  ]

  XLSX.utils.book_append_sheet(wb, ws, '处方列表')
  XLSX.writeFile(wb, '处方数据.xlsx')
}

// 打印表格
const printTable = () => {
	const $table = tableRef.value
	if ($table) {
		const opts = {
			sheetName: '处方列表',
			type: 'html',
			mode: 'print',
			original: false,
			// 打印的列配置，不包含图片列
			columns: [
				{ field: 'patientName', title: '姓名' },
				{ field: 'age', title: '年龄' },
				{ field: 'gender', title: '性别' },
				{ field: 'prescriptionDate', title: '开方时间' },
				{ field: 'diagnosis', title: '临床诊断' },
				{ field: 'prescription', title: '药方' },
				{ field: 'pairs', title: '副数' }, // 添加副数列
				{ field: 'remark', title: '备注' }
			],
			// 打印数据转换
			data: tableData.value.map(item => ({
				patientName: item.patientName,
				age: item.age,
				gender: item.gender === '1' ? '男' : '女',
				prescriptionDate: item.prescriptionDate,
				diagnosis: item.diagnosis,
				prescription: item.prescription,
				pairs: item.pairs || 7, // 添加副数字段，如果不存在则默认为7
				remark: item.remark
			})),
			style: {
				table: {
					'border-collapse': 'collapse',
					'width': '100%',
					'margin': '0',
					'font-size': '12px',
					'table-layout': 'fixed'
				},
				th: {
					'background-color': '#f8f9fa',
					'padding': '8px 4px',
					'border': '1px solid #ddd',
					'font-weight': 'bold',
					'text-align': 'center',
					'white-space': 'normal',
					'word-break': 'break-all'
				},
				td: {
					'padding': '8px 4px',
					'border': '1px solid #ddd',
					'text-align': 'center',
					'white-space': 'normal',
					'word-break': 'break-all'
				}
			},
			printStyle: `
				@media print {
					@page {
						size: A4 landscape;  /* 使用横向打印 */
						margin: 10mm;
					}
					body {
						margin: 0;
						padding: 0;
					}
					.vxe-table--print {
						margin: 0 auto;
						max-width: 277mm !important;  /* A4 横向宽度减去边距 */
					}
					table {
						width: 100% !important;
						margin: 0 auto !important;
						page-break-inside: auto !important;
					}
					tr {
						page-break-inside: avoid !important;
						page-break-after: auto !important;
					}
					td, th {
						font-size: 12px !important;
					}
					/* 设置每列的宽度 */
					td:nth-child(1), th:nth-child(1) { width: 10% !important; }  /* 姓名 */
					td:nth-child(2), th:nth-child(2) { width: 8% !important; }   /* 年龄 */
					td:nth-child(3), th:nth-child(3) { width: 8% !important; }   /* 性别 */
					td:nth-child(4), th:nth-child(4) { width: 14% !important; }  /* 开方时间 */
					td:nth-child(5), th:nth-child(5) { width: 25% !important; }  /* 临床诊断 */
					td:nth-child(6), th:nth-child(6) { width: 30% !important; }  /* 药方 */
					td:nth-child(7), th:nth-child(7) { width: 5% !important; }   /* 副数 */
					td:nth-child(8), th:nth-child(8) { width: 15% !important; }  /* 备注 */
				}
			`
		}
		$table.print(opts)
	}
}

// 处理Excel导入
const handleExcelImport = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 检查必要的列
      const requiredColumns = ['姓名', '年龄', '性别', '开方时间', '临床诊断', '药方']
      const hasAllColumns = requiredColumns.every(column => 
        jsonData.length > 0 && column in (jsonData[0] as any)
      )

      if (!hasAllColumns) {
        ElMessage.error('Excel文件格式不正确，请确保包含：姓名、年龄、性别、开方时间、临床诊断、药方')
        return
      }

      // 转换数据格式
      const prescriptions = (jsonData as any[]).map(row => ({
        patientName: row['姓名'],
        age: row['年龄'],
        gender: row['性别'] === '男' ? '1' : '2',
        prescriptionDate: row['开方时间'],
        diagnosis: row['临床诊断'],
        prescription: row['药方'],
        remark: row['备注'] || '' // 添加备注字段
      }))

      // 创建处方
      usePrescriptionsApi()
        .create({ data: prescriptions })
        .then(() => {
          ElMessage.success('导入成功')
          getPrescript()
        })
        .catch(() => {
          ElMessage.error('导入失败')
        })
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
    }
  }
  reader.readAsBinaryString(file)
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  return true
}

// 添加编辑克数的功能
const editWeightVisible = ref(false)
const currentEditMedicine = ref<Medicine | null>(null)
const tempWeight = ref(0)

const openEditWeight = (medicine: Medicine) => {
  currentEditMedicine.value = medicine
  tempWeight.value = medicine.weight
  editWeightVisible.value = true
}

const handleWeightConfirm = () => {
  if (currentEditMedicine.value) {
    currentEditMedicine.value.weight = tempWeight.value
  }
  editWeightVisible.value = false
}
// 复用按钮点击
const handleReuse = (row: any) => {
	dialogTitle.value = '复用处方'
	// 复制表单数据，包含患者信息
	Object.assign(formData, {
		id: '', // 新建处方，不需要id
		patientName: row.patientName,
		age: row.age,
		gender: row.gender == '男'?'1':'2',
		prescriptionDate: row.prescriptionDate, // 保留原处方的开方时间
		diagnosis: row.diagnosis,
		prescription: row.prescription,
		imageUrl: '',
		remark: row.remark,
		pairs: row.pairs || 7
	})
	delete formData.id
	if (row.prescription) {
		// 解析带单位的药方字符串
		const medicines = row.prescription.split('、').map((item: string) => {
			const [name, weightWithUnit] = item.split(' ')
			
			// 使用正则表达式匹配数字和非数字部分
			const match = weightWithUnit.match(/(\d+)([^\d]+)/)
			
			// 如果匹配成功，则分别获取数字(克数)和非数字(单位)部分
			const weight = match ? parseInt(match[1]) : 0
			const unit = match ? match[2] : 'g' // 如果没有匹配到单位，默认为'g'
			
			return {
				id: String(Math.random()),
				name,
				weight,
				unit
			}
		})
		selectedMedicines.value = medicines
	} else {
		selectedMedicines.value = []
	}
	
	dialogVisible.value = true
}
</script>

<style scoped lang="scss">
.table-demo-container {
	height: 100%;
	
	.table-demo-padding {
		height: 100%;
		padding: 15px;
		display: flex;
		flex-direction: column;
		
		.content-wrapper {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			margin-bottom: 15px;
			
			.table-wrapper {
				flex: 1;
				overflow: hidden;
			}
		}
		
		.pagination-wrapper {
			height: 40px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}

		.upload-demo {
			width: 100%;
		}
	}
}

.table-image {
	width: 50px;
	height: 50px;
	border-radius: 4px;
	cursor: pointer;
}

.prescription-uploader {
	:deep(.el-upload) {
		border: 1px dashed var(--el-border-color);
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: var(--el-transition-duration-fast);

		&:hover {
			border-color: var(--el-color-primary);
		}
	}

	.image-preview {
		position: relative;
		
		&:hover .image-actions {
			opacity: 1;
		}
	}

	.image-actions {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: opacity 0.3s;

		.delete-icon {
			color: #fff;
			font-size: 20px;
			cursor: pointer;
			
			&:hover {
				color: var(--el-color-danger);
			}
		}
	}
}

.prescription-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 100px;
	height: 100px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
}

.prescription-image {
	width: 100px;
	height: 100px;
	display: block;
	object-fit: cover;
}

.prescription-display {
	.medicine-list {
		margin-bottom: 15px;
		
		.medicine-tag {
			margin: 0 8px 8px 0;
			padding: 0 10px;
			height: 32px;
			line-height: 32px;
		}
	}
	
	.empty-text {
		color: var(--el-text-color-secondary);
		text-align: center;
		padding: 15px 0;
		margin-bottom: 15px;
		background-color: var(--el-fill-color-lighter);
		border-radius: 4px;
	}
}

.image-cell {
	padding: 8px 0;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	
	.table-image {
		width: 60px;
		height: 60px;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.3s;
		
		&:hover {
			transform: scale(1.05);
		}
	}
}

.el-dropdown {
	vertical-align: top;
	
	.el-icon {
		margin-right: 5px;
		vertical-align: middle;
	}
	
	.el-icon--right {
		margin-right: 0;
		margin-left: 5px;
	}
}

.el-dropdown-menu {
	.el-icon {
		margin-right: 5px;
		vertical-align: middle;
	}
}
</style>
