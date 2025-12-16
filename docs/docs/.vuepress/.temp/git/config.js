import { GitContributors } from "D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/node_modules/@vuepress/plugin-git/lib/client/components/GitContributors.js";
import { GitChangelog } from "D:/WorkSpace/JavaDemo/Programe/ZhiyanPlatform/zhiyan_front/docs/node_modules/@vuepress/plugin-git/lib/client/components/GitChangelog.js";

export default {
  enhance: ({ app }) => {
    app.component("GitContributors", GitContributors);
    app.component("GitChangelog", GitChangelog);
  },
};
