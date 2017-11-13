const zk = require('node-zookeeper-client');

/**
 * params: {
 * 	remoteUrl, // 静态文件地址域名
 * 	zkIp, // zk服务器地址
 * 	dataDir, // zk服务器文件存储目录
 * 	files: [{
 * 		compliedFileName: '',
 * 		zkPathFileName: ''
 * 	}], // 编译后需要上传至zk的文件名，array
 * }
 */
export default class Zk {
	constructor(options) {
		if (!options.remoteUrl || !options.zkIp) {
			throw new Error('remoteUrl and zkIp must be provided');
		}

		!options.dataDir && ('[ZK Warning]: dataDir is empty, default "/" ');

		this.opts = options;
		this.chunkVersions = {};
	}

	apply(compiler) {
		compiler.plugin('after-emit', (compilation, callback) => {
			const { assets, hash } = compilation;
			const { files } = this.opts;

			if (files && Array.isArray(files) && files.length) {
				this.uploadConfigFile(files, assets, hash);
			} else {
				this.uploadAllFile(assets, hash);
			}

			callback && callback();
		});
	}

	/**
	 * upload all complied files
	 * @param assets
	 */
	uploadAllFile(assets, hash) {
		for (let fileName in assets) {
			assets.hasOwnProperty(fileName) && this.deploy(fileName, fileName, hash);
		}
	}

	/**
	 * upload configs compiled files
	 * @param files
	 * @param assets
	 */
	uploadConfigFile(files, assets, hash) {
		for (let filename in assets) {
			const isExist = files.filter(file => file.compliedFileName === filename);
			if (assets.hasOwnProperty(filename) && isExist.length) {
				this.deploy(filename, isExist[0].zkPathFileName, hash);
			}
		}
	}

	deploy(file, zkConfName, hash) {
		const { zkIp, dataDir, remoteUrl } = this.opts;
		const client = zk.createClient(zkIp);
		const url = `${remoteUrl.replace(/\[hash\]/g, hash)}${file}`;

		client.once('connected', () => {
			console.log('[ZK]: Connected zk server success');
			client.setData(`${dataDir}/${zkConfName}`, new Buffer(url), -1, (err, _) => {
				err && console.log('[ZK]: setData failed', `${dataDir}/${zkConfName}`);
				!err && console.log('[ZK]: setData success', `${dataDir}/${zkConfName}`);
				client.close();
			});
		});

		client.connect();
		console.log('[ZK]: Start connect zk server');
	}
}
