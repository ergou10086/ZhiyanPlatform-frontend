import comp from "D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/docs/.vuepress/.temp/pages/introduction.html.vue"
const data = JSON.parse("{\"path\":\"/introduction.html\",\"title\":\"平台介绍视频\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"headers\":[{\"level\":2,\"title\":\"智研平台功能概览\",\"slug\":\"智研平台功能概览\",\"link\":\"#智研平台功能概览\",\"children\":[]},{\"level\":2,\"title\":\"视频说明\",\"slug\":\"视频说明\",\"link\":\"#视频说明\",\"children\":[{\"level\":3,\"title\":\"主要内容包括：\",\"slug\":\"主要内容包括\",\"link\":\"#主要内容包括\",\"children\":[]}]}],\"git\":{\"updatedTime\":1766478821000,\"contributors\":[{\"name\":\"ErguTree\",\"username\":\"\",\"email\":\"zjm88822201@126.com\",\"commits\":1}],\"changelog\":[{\"hash\":\"77ec5eeeebbba4d6701f725265e4cd5059f7396f\",\"time\":1766478821000,\"email\":\"zjm88822201@126.com\",\"author\":\"ErguTree\",\"message\":\"编写了很多项目文档\"}]},\"filePathRelative\":\"introduction.md\"}")
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
