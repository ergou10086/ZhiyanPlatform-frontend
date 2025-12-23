export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/API.html", { loader: () => import(/* webpackChunkName: "API.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/API.html.js"), meta: {"title":""} }],
  ["/get-started.html", { loader: () => import(/* webpackChunkName: "get-started.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/get-started.html.js"), meta: {"title":"快速开始"} }],
  ["/introduction.html", { loader: () => import(/* webpackChunkName: "introduction.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/introduction.html.js"), meta: {"title":"平台介绍视频"} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"智研平台帮助文档"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);
