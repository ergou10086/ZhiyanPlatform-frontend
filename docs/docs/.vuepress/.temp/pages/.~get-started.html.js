import comp from "D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/.~get-started.html.vue"
const data = JSON.parse("{\"path\":\"/.~get-started.html\",\"title\":\"快速开始\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"headers\":[{\"level\":2,\"title\":\"平台简介\",\"slug\":\"平台简介\",\"link\":\"#平台简介\",\"children\":[]},{\"level\":2,\"title\":\"开始使用平台\",\"slug\":\"开始使用平台\",\"link\":\"#开始使用平台\",\"children\":[{\"level\":3,\"title\":\"注册\",\"slug\":\"注册\",\"link\":\"#注册\",\"children\":[]},{\"level\":3,\"title\":\"登录\",\"slug\":\"登录\",\"link\":\"#登录\",\"children\":[]}]}],\"git\":{},\"filePathRelative\":\".~get-started.md\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
