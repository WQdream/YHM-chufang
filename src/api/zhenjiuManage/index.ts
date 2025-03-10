import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 */
export function useAcupointsApi() {
	return {
		create: (data: object) => {
			return request({
				url: '/api/acupoints/create',
				method: 'post',
				data,
			});
		},
		getAcupoints: (params: object) => {
			return request({
				url: '/api/acupoints/getAcupoints',
				method: 'get',
				params,
			});
		},
		update: (data: object) => {
			return request({
				url: '/api/acupoints/update',
				method: 'post',
				data,
			});
		},
		delete: (data: object) => {
			return request({
				url: '/api/acupoints/delete',
				method: 'post',
				data,
			});
		},
		// 施针管理
		createAcupuncture: (data: object) => {
			return request({
				url: '/api/acupunctures/create',
				method: 'post',
				data,
			});
		},
		getAcupunctures: (params: object) => {
			return request({
				url: '/api/acupunctures/getAcupunctures',
				method: 'get',
				params,
			});
		},
		updateAcupuncture: (data: object) => {
			return request({
				url: '/api/acupunctures/update',
				method: 'post',
				data,
			});
		},
		deleteAcupuncture: (data: object) => {
			return request({
				url: '/api/acupunctures/delete',
				method: 'post',
				data,
			});
		},
	};
}
