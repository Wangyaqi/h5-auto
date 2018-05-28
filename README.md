# H5Auto  

一个由psd自动生成网页的小脚本  

## 用法  

- 打开要执行的psd文件  
- 文件 --> 脚本 --> 浏览 --> 选择H5Auto.jsx即可在psd文件所在目录生成文件
 
## 脚本注意事项

- H5AutoPx 将以像素为单位处理图片  
- psd文件必须已经保存到硬盘  
- 如果存在未隐藏的空图层，将会抛出错误
- 第一级图层组每组会被处理成一个页
- 其余图层组会分配到div标签
- 将图层命名为bg，脚本将会以此图层作为本页的背景图
- 每个文字图层对应一个div标签，文字图层里面的每个段落对应一个p标签
- 选择H5Auto.jsx里有标注好html,css的模版可酌情修改

## H5模版注意事项

- div.page_box除默认之外有top,bottom,contain,cover四个大小位置可以选择，添加对应的类名即可
- 可以使用以下代码处理页面显隐事件

  ```js
  $(".page_*").on("beforeHide|beforeShow|afterHide|afterShow",function(){});
  ```

  例：

  ```js
  $(".page_1").on("beforeShow",function(){
    console.log("野生的page_1将要出现了"); 
  });
  $(".page_1").on("afterShow",function(){
    console.log("野生的page_1已经出现了"); 
  });
  ```

- `script.js`很短写的也很简单，修改起来也很方便
- 本模版是我图省事随便弄的仅作参考，可以修改出一份适合你自己的来使用

具体表现可使用`example/example.psd`测试  

**如果使用过程中遇到进度缓慢内存占用持续增加的情况，请把psd的所有图层复制到一个新建的psd文件进行处理**
