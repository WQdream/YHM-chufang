import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 */
export function useChineseMedicineApi() {
	return {
		create: (data: object) => {
			return request({
				url: '/api/chinese-medicines/create',
				method: 'post',
				data,
			});
		},
		getMedicines: (params: object) => {
			return request({
				url: '/api/chinese-medicines/getMedicines',
				method: 'get',
				params,
			});
		},
		update: (data: object) => {
			return request({
				url: '/api/chinese-medicines/update',
				method: 'post',
				data,
			});
		},
		delete: (data: object) => {
			return request({
				url: '/api/chinese-medicines/delete',
				method: 'post',
				data,
			});
		},


		signOut: (data: object) => {
			return request({
				url: '/user/signOut',
				method: 'post',
				data,
			});
		},
		login: (data: object) => {
			return request({
				url: '/api/auth/login',
				method: 'post',
				data,
			});
		},
		getUserInfo: (params: object) => {
			return request({
				url: '/api/auth/user',
				method: 'get',
				params,
			});
		},
	};
}
