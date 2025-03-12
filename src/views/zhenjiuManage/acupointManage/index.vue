<template>
	<div class="table-demo-container layout-padding">
		<div class="table-demo-padding layout-padding-view layout-padding-auto">
			<!-- 搜索区域 -->
			<div class="content-wrapper">
				<vxe-form v-bind="formOptions" v-on="formEvents"></vxe-form>
				<div style="margin-bottom: 10px;">
					<el-button type="primary" size="default" @click="handleAdd">新增穴位</el-button>
					<el-button type="primary" size="default" @click="handleImport">导入</el-button>
					<el-button type="danger" size="default" @click="banchDelete">批量删除</el-button>
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
					>
						<vxe-column type="checkbox" width="60"></vxe-column>
						<vxe-column field="seq" type="seq" width="70"></vxe-column>
						<vxe-column field="name" title="穴位名称" :width='isMobile?"30%":""'></vxe-column>
						<vxe-column field="active" title="操作" width="200" align="center">
							<template #default="{ row }">
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
			width="30%"
			:close-on-click-modal="false"
		>
			<el-form :model="formData" label-width="100px">
				<el-form-item label="穴位名称">
					<el-input v-model="formData.name" placeholder="请输入穴位名称"></el-input>
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
			title="导入穴位"
			v-model="importDialogVisible"
			width="30%"
			:close-on-click-modal="false"
		>
			<el-form :model="importForm" label-width="100px">
				<el-form-item label="导入方式">
					<el-radio-group v-model="importForm.importType">
						<el-radio :label="1">追加导入</el-radio>
						<el-radio :label="2">覆盖导入</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="文件上传">
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
								请上传Excel文件，仅支持.xlsx,.xls格式
							</div>
							<div style="color: red;">导入文件列名必须包含穴位名称</div>
						</template>
					</el-upload>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="importDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="handleImportSubmit">确定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="acupointManage">
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { useAcupointsApi } from '/@/api/zhenjiuManage/index';

interface RowVO {
	id: string;
	name: string;
}
const isMobile = ref(window.innerWidth < 768)
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
const dialogTitle = ref('新增穴位');
const formData = reactive({
	id: '',
	name: ''
});

const searchForm = reactive({
	name: ''
});

const formOptions = reactive<VxeFormProps<FormDataVO>>({
	data: {
		name: '',
	},
	items: [
		{ field: 'name', title: '穴位名称', span: 8, itemRender: { name: 'VxeInput' } },
		{
			span: 1,
			collapseNode: false,
			align: 'center',
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

const formEvents: VxeFormListeners = {
	submit(e) {
		pageVO.currentPage = 1
		searchForm.name = e.data.name
		getAcupoints(e.data.name)
	},
	reset() {
		pageVO.currentPage = 1
		searchForm.name = ''
		getAcupoints()
	},
};

// 表格数据
const tableData = ref<RowVO[]>([
]);

// 获取中药材列表
const getAcupoints = (name = '') => {
	let obj = {
		page: pageVO.currentPage,
		pageSize: pageVO.pageSize,
		name: name
	}
	useAcupointsApi().getAcupoints(obj).then(res => {
		tableData.value = res.data.list
		pageVO.total = res.data.total
	})
}
// 初始化中药材列表
getAcupoints()

const updateMedicines = (id = '',name = '') => {
	let obj = {
		id: id,
		name: name
	}
	useAcupointsApi().update(obj).then(res => {
		console.log(res,'res')
	})
}

// 新增按钮点击
const handleAdd = () => {
	dialogTitle.value = '新增穴位';
	formData.name = '';
	dialogVisible.value = true;
};

// 编辑按钮点击
const handleEdit = (row: RowVO) => {
	dialogTitle.value = '编辑穴位';
	formData.id = row.id;
	formData.name = row.name;
	dialogVisible.value = true;
};

// 删除按钮点击
const handleDelete = (row: any) => {
	let obj = {
		ids: Array.isArray(row.id) ?row.id:[row.id]
	}
	useAcupointsApi().delete(obj).then(res => {	
		ElMessage.success('删除成功');
		pageVO.currentPage = 1
		getAcupoints()
	}).catch(err => {
		ElMessage.error('删除失败');
	})
};

// 弹窗确定按钮
const handleSubmit = () => {
	if (!formData.name) {
		ElMessage.warning('请输入穴位名称');
		return;
	}
	if(dialogTitle.value == '新增穴位'){
		let obj = {
			data: {
				name: formData.name
			}
		}
		useAcupointsApi().create(obj).then(res => {
				ElMessage.success('添加成功');
				dialogVisible.value = false;
				pageVO.currentPage = 1
				submitLoading.value = false
				getAcupoints()
		}).catch(err => {
			submitLoading.value = false
			if(err.response.data.code == 502){
				ElMessage.error(err.response.data.message);
			}else{
				ElMessage.error('添加失败');
			}
		})
	}else{
		// updateMedicines(formData.id,formData.name)
		let obj = {
			id: formData.id,
			name: formData.name
		}
		useAcupointsApi().update(obj).then(res => {
			ElMessage.success('修改成功');
			dialogVisible.value = false;
			submitLoading.value = false
			getAcupoints()
		}).catch(err => {
			submitLoading.value = false
			if(err.response.data.code == 502){
				ElMessage.error(err.response.data.message);
			}else{
				ElMessage.error('添加失败');
			}
		})
		
	}
	
};

const banchDelete = () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length === 0) {
      ElMessage.warning('请选择要删除的数据');
      return;
    }
    ElMessageBox.confirm('确定要删除选中的数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      let ids = []
      selectRecords.forEach(item => {
        ids.push(item.id)
      })
      let obj = {
        id: ids
      }
      handleDelete(obj)
    }).catch(() => {})
  }
}

// 分页变化
const pageChange = ({ pageSize, currentPage }: { pageSize: number; currentPage: number }) => {
	pageVO.currentPage = currentPage;
	pageVO.pageSize = pageSize;
	getAcupoints(searchForm.name)
};

// 导入相关数据
const importDialogVisible = ref(false);
const importForm = reactive({
	importType: 1, // 1: 追加导入, 2: 覆盖导入
	fileList: [] as any[],
	file: null as any
});

// 打开导入弹窗
const handleImport = () => {
	importForm.importType = 1;
	importForm.fileList = [];
	importForm.file = null;
	importDialogVisible.value = true;
};

// 文件选择变化
const handleFileChange = (file: any) => {
	importForm.file = file.raw;
};

// 处理导入提交
const handleImportSubmit = async () => {
	if (!importForm.file) {
		ElMessage.warning('请选择要导入的文件');
		return;
	}

	try {
		const reader = new FileReader();
		reader.onload = (e: any) => {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			// 检查是否包含穴位名称列
			if (jsonData.length > 0 && !jsonData[0].hasOwnProperty('穴位名称')) {
				ElMessage.error('Excel文件中未找到"穴位名称"列');
				return;
			}

			// 处理导入的数据
			const importedData = jsonData.map((item: any, index: number) => ({
				name: item['穴位名称']
			}));

			// 根据导入方式处理数据
			// if (importForm.importType === 1) {
			// 	// 追加导入
			// 	tableData.value = [...tableData.value, ...importedData];
			// } else {
			// 	// 覆盖导入
			// 	tableData.value = importedData;
			// }
			let obj = {
				type: importForm.importType,
				data: importedData
			}
			useAcupointsApi().create(obj).then(res => {
				if(res.code == 200){
					ElMessage.success('导入成功');
					pageVO.currentPage = 1
					getAcupoints()
					importDialogVisible.value = false;
				}
			}).catch(err => {
				if(err.response.data.code == 502){
					ElMessage.error(err.response.data.message);
				}else{
					ElMessage.error('导入失败');
				}
			})

	
		};

		reader.readAsArrayBuffer(importForm.file);
	} catch (error) {
		console.error('导入失败:', error);
		ElMessage.error('导入失败，请检查文件格式是否正确');
	}
};
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
</style>
