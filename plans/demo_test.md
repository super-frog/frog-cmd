## 接口文档 [demo_test] 
### 接口地址:

    http://127.0.0.1:3001

### 生成日期:2017-6-1

***

## api1
**请求路径**:   
>GET   /demo/{id}

**URL占位参数**:   

<table style="width: 90%;text-align: center;">
<thead>
<tr><th>参数名</th><th>类型</th><th>描述</th><th>必填</th>
</tr></thead>
<tbody>
<tr><td>id</td><td>number</td><td></td><td>Yes</td></tr>

</tbody>
</table>

**请求头部**:   

<p>（无）</p>

**QueryString**:   

<table style="width: 90%;text-align: center;">
<thead>
<tr><th>参数名</th><th>类型</th><th>描述</th><th>必填</th>
</tr></thead>
<tbody>
<tr><td>page</td><td>number</td><td></td><td>No</td></tr>

</tbody>
</table>

**Body**:   

<p>（无）</p>

**返回示例**:

    {
        code : 200,
        data : {
            int : 1,
            float : 1.1,
            string : 'hello world',
            array : [
                1,
                2,
                3
            ],
            object : {
                one : 1
            }
        }
        message : 'run success'
    }

