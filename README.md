# yonchain-ui

#### 介绍
yonchain 是Yonchain AI应用开发平台的前端项目，基于 Vue.js 和 TypeScript 构建，旨在提供高效、灵活的用户界面解决方案。项目支持模块化开发和组件化设计，适用于企业级应用开发。

#### 软件架构
- 前端框架：Vue 3
- 构建工具：Vite
- 样式处理：Tailwind CSS
- 状态管理：Pinia

#### 安装教程

1. 确保已安装 Node.js（版本 >= 16）和 pnpm
2. 克隆项目仓库：`git clone https://github.com/yonchain/yonchain-ui.git`
3. 进入项目目录：`cd yonchain-ui`
4. 安装依赖：`pnpm install`

#### 使用说明

1. 开发模式：运行 `pnpm dev` 启动本地开发服务器
2. 生产构建：运行 `pnpm build` 生成优化后的静态文件
3. 预览生产环境：运行 `pnpm preview` 查看构建结果

#### 部署说明

1. **静态文件部署**：将 `dist` 目录下的文件上传到 Web 服务器（如 Nginx、Apache）
2. **Docker 部署**：
   - 构建 Docker 镜像：`docker build -t yonchain-ui .`
   - 运行容器：`docker run -p 80:80 yonchain-ui`

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
