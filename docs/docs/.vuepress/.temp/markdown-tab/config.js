import { CodeTabs } from "D:/workplace/spring/ZhiaYan/zhiyan-backend/zhiyan_front/docs/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/CodeTabs.js";
import { Tabs } from "D:/workplace/spring/ZhiaYan/zhiyan-backend/zhiyan_front/docs/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/Tabs.js";
import "D:/workplace/spring/ZhiaYan/zhiyan-backend/zhiyan_front/docs/node_modules/@vuepress/plugin-markdown-tab/lib/client/styles/vars.css";

export default {
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    app.component("Tabs", Tabs);
  },
};
