<template>
	<div class="table-demo-container layout-padding">
		<div class="table-demo-padding layout-padding-view layout-padding-auto">
			<!-- 搜索区域 -->
			<div class="content-wrapper">
				<vxe-form v-bind="formOptions" v-on="formEvents"></vxe-form>
				<div style="margin-bottom: 10px;">
					<el-button type="primary" size="default" @click="handleAdd">新增</el-button>
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
						:data="tableData"
						:height="'100%'"
						:row-config="{ height: 80 }"
					>
						<vxe-column type="checkbox" width="60"></vxe-column>
						<vxe-column field="seq" type="seq" width="70"></vxe-column>
						<vxe-column field="patientName" title="姓名"></vxe-column>
						<vxe-column field="age" title="年龄">
							<template #default="{ row }">
								{{ row.age == 0?'保密': row.age}}
							</template>
						</vxe-column>
						<vxe-column field="gender" title="性别"></vxe-column>
						<vxe-column field="acupunctureDate" title="施针时间"></vxe-column>
						<vxe-column field="diagnosis" title="临床诊断"></vxe-column>
						<vxe-column field="acupoints" title="穴位"></vxe-column>
						<vxe-column field="remark" title="备注"></vxe-column>
						
						<vxe-column field="active" title="操作" width="200" fixed="right" align="center">
							<template #default="{ row }">
								<el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
								<el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
								<el-popconfirm
									title="确定要删除这条数据吗？"
									confirm-button-text="确定"
									cancel-button-text="取消"
									@confirm="handleDelete(row)"
								>
									<template #reference>
										<el-button type="danger" size="small">删除</el-button>
									</template>
								</el-popconfirm>
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
						<el-form-item label="施针时间" required>
							<el-date-picker
								v-model="formData.acupunctureDate"
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

				<el-form-item label="穴位">
					<div class="acupoints-display">
						<div v-if="selectedZhen.length > 0" class="medicine-list">
							<el-tag
								v-for="medicine in selectedZhen"
								:key="medicine.id"
								class="medicine-tag"
								type="success"
								effect="light"
							>
								{{ medicine.name }} {{ medicine.needleCount }}针
							</el-tag>
						</div>
						<div v-else class="empty-text">暂未穴位</div>
						<el-button type="primary" @click="selectMedicineVisible = true">
							选择穴位
						</el-button>
					</div>
				</el-form-item>

				<el-form-item label="备注">
					<el-input
						v-model="formData.remark"
						type="textarea"
						:rows="2"
						placeholder="请输入备注信息"
					/>
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
		<SelectZhen
			v-model="selectMedicineVisible"
			:default-selected="selectedZhen"
			@confirm="handleMedicineConfirm"
		/>

		<!-- 处方查看组件 -->
		<PrescriptionView
			v-model="prescriptionViewVisible"
			:acupoints-data="currentPrescription"
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

<script setup lang="ts" name="useNeedleManage">
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, ArrowDown, Download, Printer, Edit } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx';
import { useAcupointsApi } from '/@/api/zhenjiuManage/index';
import SelectZhen from './components/SelectZhen.vue'
import PrescriptionView from './components/PrescriptionView.vue'
import { useCommonApi } from '/@/api/common/index';


interface RowVO {
	id: string;
	name: string;
}

interface Medicine {
	id: string;
	name: string;
	needleCount: number; // 针数
}

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

const dialogTitle = ref('新增');
const formData = reactive({
	id: '',
	patientName: '',
	age: '',
	gender: '1', // 1-男，2-女
	acupunctureDate: '',
	diagnosis: '',
	acupoints: '',
	remark: ''
});



// 编辑按钮点击
const handleEdit = (row: any) => {
	console.log(row,'row');
	
	dialogTitle.value = '编辑施针记录'
	// 重置表单数据
	Object.assign(formData, {
		id: row.id,
		patientName: row.patientName,
		age: row.age,
		gender: row.gender == '男'?'1':'2',
		acupunctureDate: row.acupunctureDate,
		diagnosis: row.diagnosis,
		acupoints: row.acupoints,
		remark: row.remark
	})

	if (row.acupoints) {
		// 解析带单位的药方字符串
		const curZhen = row.acupoints.split('、').map((item: string) => {
			const [name, needleCountStr] = item.split(' ')

			// 使用正则表达式匹配数字和非数字部分
			const match = needleCountStr.match(/(\d+)([^\d]+)/)
			
			// 如果匹配成功，则分别获取数字(克数)和非数字(单位)部分
			const needleCount = match ? parseInt(match[1]) : 1
			
			return {
				id: String(Math.random()),
				name,
				needleCount
			}
		})
		selectedZhen.value = curZhen
	} else {
		selectedZhen.value = []
	}
	
	dialogVisible.value = true
}

const searchForm = reactive({
	patientName: '',
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
		patientName: '',
		startTime: '',
		endTime: ''
	},
	items: [
		{ field: 'patientName', title: '姓名', span: 6, itemRender: { name: 'VxeInput', placeholder: '请输入姓名' } },
		{ field: 'startTime', title: '开始时间', span: 6, itemRender: { name: 'VxeDatePicker' } },
		{ 
			field: 'endTime',
			title: '至',
			span: 6,
			itemRender: {
				name: 'VxeDatePicker',
			}
		},
		{
			span: 6,
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
		searchForm.patientName = e.data.patientName
		searchForm.startTime = e.data.startTime
		searchForm.endTime = e.data.endTime
		getAcupunctures(searchForm)
	},
	reset() {
		pageVO.currentPage = 1
		searchForm.patientName = ''
		searchForm.startTime = ''
		searchForm.endTime = ''
		getAcupunctures()
	},
};

// 表格数据
const tableData = ref<RowVO[]>([
]);

// 获取中药材列表
const getAcupunctures = (params = searchForm) => {
	let obj = {
		page: pageVO.currentPage,
		pageSize: pageVO.pageSize,
		patientName: params.patientName,
		startTime: params.startTime,
		endTime: params.endTime
	}
	useAcupointsApi().getAcupunctures(obj).then(res => {
		tableData.value = res.data.list
		pageVO.total = res.data.total
	})
}
// 初始化中药材列表
getAcupunctures()

const updateMedicines = (id = '',name = '') => {
	let obj = {
		id: id,
		name: name
	}
	useAcupointsApi().updateAcupuncture(obj).then(res => {
		console.log(res,'res')
	})
}

// 新增按钮点击
const handleAdd = () => {
	dialogTitle.value = '新增'
	// 重置表单数据
	Object.assign(formData, {
		id: '',
		patientName: '',
		age: '',
		gender: '1',
		acupunctureDate: '',
		diagnosis: '',
		acupoints: '',
		imageUrl: '',
		remark: '',
		pairs: 1  // 默认值为1
	})
	selectedZhen.value = []
	dialogVisible.value = true
}

// 查看按钮点击
const handleView = (row: any) => {
	currentPrescription.value = {
		...row
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
	let obj = {
		ids: Array.isArray(row.id) ?row.id:[row.id]
	}
	useAcupointsApi().deleteAcupuncture(obj).then(res => {	
		ElMessage.success('删除成功');
		pageVO.currentPage = 1
		getAcupunctures()
	}).catch(err => {
		ElMessage.error('删除失败');
	})
};

// 弹窗确定按钮
const handleSubmit = () => {
	if (!formData.patientName) {
		ElMessage.warning('请输入患者姓名')
		return
	}
	if (!selectedZhen.value.length) {
		ElMessage.warning('请选择穴位')
		return
	}
	
	// 更新处方字符串，包含单位信息
	formData.acupoints = selectedZhen.value
		.map(medicine => `${medicine.name} ${medicine.needleCount}针`)
		.join('、')
	
	submitLoading.value = true
	if(dialogTitle.value === '新增'){
		delete formData.id
	}
	
	// 如果是编辑，需要传入 id
	const api = formData.id ? 
		useAcupointsApi().updateAcupuncture({ data: formData }) : 
		useAcupointsApi().createAcupuncture({ data: formData })
		
	api.then(() => {
		ElMessage.success(formData.id ? '更新成功' : '新增成功')
		dialogVisible.value = false
		getAcupunctures()
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
	getAcupunctures()
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
      const requiredColumns = ['姓名', '年龄', '性别', '施针时间', '临床诊断', '药方']
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
        acupunctureDate: row['施针时间'],
        diagnosis: row['临床诊断'],
        acupoints: row['药方'],
        remark: row['备注'] || '' // 添加备注字段
      }))
	
      // 创建处方
      useAcupointsApi()
        .createAcupuncture({ data: prescriptions })
        .then(() => {
          ElMessage.success('导入成功')
          importDialogVisible.value = false
          getAcupunctures()
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
	formData.acupunctureDate = '';
	formData.diagnosis = '';
	formData.acupoints = '';
	formData.imageUrl = '';
	selectedZhen.value = []
};

// 添加相关数据
const selectMedicineVisible = ref(false)
const selectedZhen = ref<Medicine[]>([])

// 打开选择药方弹窗
const openSelectMedicine = () => {
	selectMedicineVisible.value = true
}

// 处理药方选择确认
const handleMedicineConfirm = (xueWei: Medicine[]) => {
	selectedZhen.value = xueWei
	formData.acupoints = xueWei.map(item => `${item.name} ${item.needleCount}`).join('、')
}

// 添加相关数据
const prescriptionViewVisible = ref(false)
const currentPrescription = ref({
	id: '',
	patientName: '',
	age: '',
	gender: '',
	acupunctureDate: '',
	diagnosis: '',
	acupoints: '',
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
    '施针时间': item.acupunctureDate,
    '临床诊断': item.diagnosis,
    '穴位': item.acupoints,
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
    { width: 15 }, // 施针时间
    { width: 30 }, // 临床诊断
    { width: 40 }, // 穴位
    { width: 20 }  // 备注
  ]

  XLSX.utils.book_append_sheet(wb, ws, '施针管理列表')
  XLSX.writeFile(wb, '施针管理列表数据.xlsx')
}

// 打印表格
const printTable = () => {
	const $table = tableRef.value
	if ($table) {
		const opts = {
			sheetName: '施针管理列表',
			type: 'html',
			mode: 'print',
			original: false,
			// 打印的列配置，不包含图片列
			columns: [
				{ field: 'patientName', title: '姓名' },
				{ field: 'age', title: '年龄' },
				{ field: 'gender', title: '性别' },
				{ field: 'acupunctureDate', title: '施针时间' },
				{ field: 'diagnosis', title: '临床诊断' },
				{ field: 'acupoints', title: '穴位' },
				{ field: 'remark', title: '备注' }
			],
			// 打印数据转换
			data: tableData.value.map(item => ({
				patientName: item.patientName,
				age: item.age,
				gender: item.gender === '1' ? '男' : '女',
				acupunctureDate: item.acupunctureDate,
				diagnosis: item.diagnosis,
				acupoints: item.acupoints,
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
					td:nth-child(4), th:nth-child(4) { width: 14% !important; }  /* 施针时间 */
					td:nth-child(5), th:nth-child(5) { width: 25% !important; }  /* 临床诊断 */
					td:nth-child(6), th:nth-child(6) { width: 30% !important; }  /* 药方 */
					td:nth-child(7), th:nth-child(7) { width: 15% !important; }  /* 备注 */
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
      const requiredColumns = ['姓名', '年龄', '性别', '施针时间', '临床诊断', '药方']
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
        acupunctureDate: row['施针时间'],
        diagnosis: row['临床诊断'],
        acupoints: row['药方'],
        remark: row['备注'] || '' // 添加备注字段
      }))

      // 创建处方
      useAcupointsApi()
        .createAcupuncture({ data: prescriptions })
        .then(() => {
          ElMessage.success('导入成功')
          getAcupunctures()
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

.acupoints-uploader {
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

.acupoints-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 100px;
	height: 100px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
}

.acupoints-image {
	width: 100px;
	height: 100px;
	display: block;
	object-fit: cover;
}

.acupoints-display {
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
