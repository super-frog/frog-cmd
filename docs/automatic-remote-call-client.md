### Frog - build your application fast and save your time +1s
![](http://bluestest.oss-cn-shanghai.aliyuncs.com/u=2760800048,436059731&fm=26&gp=0.jpg)

### Automatic Remote Call Client

`frog`构建的是HTTP服务，那么多个服务之间的调用，如果还要自己编写**client**，

显然是不符合`frog`的思想的。

如果你已经理解了`frog`如何做到**自动化文档**，

那么你应该也能理解**自动生成客户端**

![](http://bluestest.oss-cn-shanghai.aliyuncs.com/auto-client.png)

`frog`通过**抽象语法树**得到接口**返回结构**的同时，也得到了接口**入参定义**,

有了以上内容，我们可以将繁琐的http调用的代码，交给程序自动生成。

> 自动生成客户端调用代码，可以让开发者不关心服务之间的通信协议。
> 
> 开发者依赖其他服务时，都是通过**函数调用**的方式访问的，及时将来frog底层更换了其他通信协议，也不需要开发者修改现有的代码。