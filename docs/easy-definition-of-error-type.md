### Frog - build your application fast and save your time +1s
![](http://bluestest.oss-cn-shanghai.aliyuncs.com/u=2760800048,436059731&fm=26&gp=0.jpg)

### Easy Definition of Error Type

在进行业务开发的过程中，我们难免要处理很多不同类型的错误。

- `frog`提供了一个统一的约束来定义系统里的错误。

	```
	let Error = {
	  //通用错误
	  COMMON_ERROR: 500,
	  //未授权
	  UNAUTHORIZED: 401,
	  //授权错误
	  AUTHORIZED_INVALID: 401,
	  //没有找到活动详情
	  EVENT_NOT_FOUND: 404,
	  //没找到报名记录
	  SUBMIT_NOT_FOUND: 404,
	};
	```

- 无需不关心错误码，只需要定义错误族

	无数次惨痛经历告诉我们，为每一个项目分配错误码是多么头痛的事。
	
	frog将彻底解决这个问题。
	
	你只需要给出错误的中文描述(通过注释),错误的名字以及所属大类(http status风格)
	
	frog自动为你编排错误编码， 生成的代码如下：
	
	```
	module.exports = [
	  {
	    name: 'COMMON_ERROR',
	    httpStatus: 500,
	    code: (process.env.APPID || 1001)*1e6+500001,
	    message: '通用错误',
	  },
	  {
	    name: 'UNAUTHORIZED',
	    httpStatus: 401,
	    code: (process.env.APPID || 1001)*1e6+401001,
	    message: '未授权',
	  },
	  {
	    name: 'AUTHORIZED_INVALID',
	    httpStatus: 401,
	    code: (process.env.APPID || 1001)*1e6+401002,
	    message: '授权错误',
	  },
	  {
	    name: 'EVENT_NOT_FOUND',
	    httpStatus: 404,
	    code: (process.env.APPID || 1001)*1e6+404001,
	    message: '没有找到活动详情',
	  },
	  {
	    name: 'SUBMIT_NOT_FOUND',
	    httpStatus: 404,
	    code: (process.env.APPID || 1001)*1e6+404002,
	    message: '没找到报名记录',
	  },
];
	```
	
	> frog使用环境变量来配置项目的config， 因而对于docker环境更加亲和。
	
	>上面的 APPID 就是通过环境变量注入的，这样可以做到服务间错误码不冲突。
	
	> 最终的错误码格式: {APPID}{HTTP_CODE}{ERROR_CODE}, 如1001404001
