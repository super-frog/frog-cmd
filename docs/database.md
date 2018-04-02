### Frog - build your application fast and save your time +1s
![](http://bluestest.oss-cn-shanghai.aliyuncs.com/u=2760800048,436059731&fm=26&gp=0.jpg)
### Database

- Write a model ?

	`frog`采用链式方法调用定义一个数据库**字段**，再由**字段**组合成**表格**。 
	
	```
	// models/user.js
	
	module.exports = new Table('user', {
	  id:Field.name('id').bigint(true).primary().AI().comment('primary id'),
	  name: Field.name("user_name").varchar(64).allowNull().default("foo").uniq('u_a').comment("name of user"),
	  age: Field.name("user_age").tinyint().default(10).comment('ages').index()
	});
	```
	
	同时，`frog`提供了一些**预设**(`Presets`), 有助于同于通用字段。
	
	```
	module.exports = new Table('user', {
	  id:Field.name('user_id').bigint(true).primary().AI().comment('p id'),
	  name: Field.name("user_name").varchar(64).allowNull().default("foo").uniq('u_a').comment("name of user"),
	  age: Field.name("user_age").tinyint().default(10).comment('ages').index(),
	  ...Presets.opTime,
	});

	```
	其中
	
	```
	...Presets.opTime,
	```
	等价于
	
	```
	createTime: Field.name('create_time').bigint(true).index().comment('创建时间'),
	updateTime: Field.name('update_time').bigint(true).index().comment('更新时间'),
	```
	
	>这里`Presets`的实现利用了**结构**，不限于`frog`提供的预设值，你也可以自由地提取自己的预设值，只要符合编写要求即可。
	>
	`Presets`是`frog`的工程化技巧。
	
- Migrate

	`frog` 会根据上面定于的`Table`，在构建是自动 **diff**数据库变化，让数据库的真是设计维护在代码里。
	> 这是基于不同环境下数据库结构难以统一维护，经常出现不一致的问题而设计的。通过`Migrate`可以做到，只要代码一致，数据库就一致。

- Fetching Function

	`frog`会根据你定义的`Table`生成一个数据模型操作类， 里面的**查询方法**(`fetching function`)有哪些， 完全取决于你定义的**字段索引**。
	
	举个例子，如果你定义了一个`status`字段并且带索引定义，那么你将得到一个包含`fetchByStatus(){}` 方法的类。相反，对于没有建立索引定义的`desc`字段，是不会生成任何关于 `fetchByDesc(){}`之类的操作。
	
	>`frog`生成的数据操作类，从源头上就解决了用**非索引**属性做查询而引起的慢查询问题。
	这也是`frog`基于工程的一个考虑。