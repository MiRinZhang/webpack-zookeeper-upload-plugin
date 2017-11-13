# webpack-zookeeper-upload-plugin
Webpack plugin for uploading static resources to the zookeeper server

### Usage

#### Install

> npm i -D webpack-zookeeper-upload-plugin

#### Config

* import

```javascript
const zkUploadPlugin = require('webpack-zookeeper-upload-plugin');
```

* config

```javascript
plugins: [
  new qiniuPlugin({
    // 静态文件地址目录，文件名不用传，直接使用webpack assets里面的；
    // 如果静态文件上传时使用了hash来做目录名，可以使用[hash]拼接在合适的位置，在上传至zk服务器时会自动替换；
    // 例如：静态文件地址为: https://cdn.com/9c371e67cb62ffbc037e/index.html,
    // 此时[hash]在上传至zk时会被替换为9c371e67cb62ffbc037e
    remoteUrl: 'https://cdn.com/[hash]/',
    zkIp: '127.0.0.1', // zk 地址
    dataDir: '/configs/static/', // 文件存储目录
    // 要上传的文件，如果不传或者传空，默认上传complie后的所有文件
    files: [
      {
        compliedFileName: 'index.html', // complie后的文件名
        zkPathFileName: 'manager.html' // 上传至zk后的文件名，可用来重命名文件
      }
    ]
  });
]
```
