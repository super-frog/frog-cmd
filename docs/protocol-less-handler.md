### Frog - build your application fast and save your time +1s
![](http://bluestest.oss-cn-shanghai.aliyuncs.com/u=2760800048,436059731&fm=26&gp=0.jpg)

### Protocol-less Handler

相比于`controller`， `frog`把处理业务逻辑的层次命名为`handler`。

`frog`在编写具体的业务逻辑时，是察觉不到当前使用的通信协议的。

要理解这句话，可以从两个方面：

- 代码中不会直接看到包含 `(req, res)`之类的设计。
	
- 直接在逻辑中return结果，而不关心协议层怎么通信。

可以看一段代码：

```
const Params = {
  //任务ID number:0,100 in:params require
  eventID: 0,
};

module.exports = async (Params) => {

  let model = await EventModel.fetchByAttr({
    id: Params.eventID,
  });

  return model;

};
```
`handler`本身是一个 **async function**， 通过**依赖注入**在运行时传入一个**扁平化Flatten**的参数，然后将处理结果直接返回，并不会出现型如`res.json(result)`这样的代码。

> 这样设计的好处是，具体的逻辑不会跟通信协议(http)过多的耦合，将来支持更多的通信协议时，不需要改动业务逻辑代码。
> 

### Dependency Injection

从上面的例子看出，`handler`会运行时依赖注入同名参数(例子里的**Params**)，但并不是传入上面定义的字面量**Params**, 而是根据这个字面量而生成的一个**类的实例**。

你并不需要在当前`handler`里引入这个生成的文件，`frog`在底层执行时帮你完成注入。

![](http://bluestest.oss-cn-shanghai.aliyuncs.com/gen_object.png)

> 这样设计的意图是，你可以在当前 handler 里操作Params实例时，得到很好的代码提示。这是基于工程的设计。

关于这个生成出来的 **类** ， 我们在下一节： [Incoming Validation](./incoming-validation.md) 里详细介绍。