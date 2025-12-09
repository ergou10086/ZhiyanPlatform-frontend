export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/API.html", { loader: () => import(/* webpackChunkName: "API.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/API.html.js"), meta: {"title":""} }],
  ["/get-started.html", { loader: () => import(/* webpackChunkName: "get-started.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/get-started.html.js"), meta: {"title":"快速开始"} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":"智研平台帮助文档"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
