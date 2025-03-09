import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function usePrescriptionsApi() {
	return {
		create: (data: object) => {
			return request({
				url: '/api/prescriptions/create',
				method: 'post',
				data,
			});
		},
		getPrescript: (params: object) => {
			return request({
				url: '/api/prescriptions/getPrescriptions',
				method: 'get',
				params,
			});
		},
		update: (data: object) => {
			return request({
				url: '/api/prescriptions/update',
				method: 'post',
				data,
			});
		},
		delete: (data: object) => {
			return request({
				url: '/api/prescriptions/delete',
				method: 'post',
				data,
			});
		},
	};
}
