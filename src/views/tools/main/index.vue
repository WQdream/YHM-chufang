<template>
	<div class="layout-pd">
		<el-card shadow="hover" header="常用的工具(此处无需使用)">
			<el-input v-model="state.password" placeholder="请输入">
				
			</el-input>
			<el-button style="margin-top: 10px;" type="primary" @click="handleEncrypt">加密一下吧</el-button>
			<span style="margin-left: 80px;">加密后：{{ passwordEncrypt }}</span>
			<!-- <el-button type="primary" @click="handleDecrypt">解密一下吧</el-button> -->
		</el-card>
	</div>
</template>

<script setup lang="ts" name="tools">
import { reactive, ref } from 'vue';
import { useCommonApi } from '/@/api/common/index';

const { handlePassword } = useCommonApi();

const state = reactive({
	password: '',
});

let passwordEncrypt = ref('');

const handleEncrypt = (event: Event) => {
	handlePassword({ type:1, password: state.password }).then((res: any) => {
		passwordEncrypt.value = res.data.password;
	});
};

const handleDecrypt = (event: Event) => {
	handlePassword({ type:2, password: state.password}).then((res: any) => {
		alert(res.data.password);
	});
};
</script>

<style scoped lang="scss">
.tools-warp-form {
	:deep(.el-form-item--small.el-form-item) {
		margin-bottom: 0 !important;
	}
	.tools-warp-form-msg {
		color: #666666;
		font-size: 14px;
		width: 100%;
		.tools-warp-form-msg-red {
			color: red;
		}
	}
	.tools-warp-form-msg + div {
		width: 100%;
	}
}
</style>
