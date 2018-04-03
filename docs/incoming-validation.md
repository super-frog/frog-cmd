### Frog - build your application fast and save your time +1s
![](http://bluestest.oss-cn-shanghai.aliyuncs.com/u=2760800048,436059731&fm=26&gp=0.jpg)

### Incoming Validation

过去我们每次开发新项目，都要重新编写很多**入参校验**的逻辑，有的甚至是跟业务逻辑混杂在一起，回想起来实在苦不堪言。

`frog`试图通过**对象字面量+注释**的方式来编写入参校验。

以一种极致直观的方式实现**入参校验**和**参数扁平化**：

```
const Params = {
  //任务ID number:0,100 in:params require
  eventID: 0,
  //登录凭据 string:32,32 in:headers require
  token: ''
};
```

你只要在对应的`handler`里定义了上面这样的**对象字面量**，就能自动生成一个带有完整**入参校验**的`class`。

同时，你可以在`handler`里使用同名参数的方式进行依赖注入

```
module.exports = async (Params) => {

  let model = await EventModel.fetchByAttr({
    id: Params.eventID,
  });

  return model;

};
```


> 以上代码的书写方式完全遵守 **javascript** , 任何带代码检查的编辑器都不会报错。 
> 
> frog不希望通过**发明新语法**来达到自己的目的。
> 
> 自动生成的类的代码，都是通过抽象语法树解释对象字面量规则而来的。


### 参数注释的写法

基本写法

	// {描述名字} {类型}:{下限},{上限} in:{参数位置} key:{别名} {require}?
	
逐一解释：

- 描述名字
	
		一般是中文描述，用于自动化文档是的参数提示，也可以用于前端展示的label
- 类型

		类型目前有 
		string, number, []string, []number, enum{..}, []enum{...}
- 下限,上限

		对应字符串的长度，或数字类型的大小。
		
		如果类型是数组类型，则对应的是元素的个数。
		此时，你可以再声明一组上下限表达元素的范围，
		如 []number:0,10:18,60  表示数组长度0-10，元素取值范围18-60.

- 参数位置

		确定属性从哪里获取，一般有 body, query, params, headers
		
		也支持多级， in:body.title 
- 别名

		上面只定义了参数所在的位置，默认会用字面量的属性key去检索，
		
		如果你想使用别名，如： 参数位置在  body.user_mobile
		你希望扁平化后使用简单一点的 'mobile',可以这样做
		{
			//电话 string:11,11 in:body key:user_mobile
			mobile:'',
		}
		
		