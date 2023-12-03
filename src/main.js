import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ru } from './element-plus-lang-ru'
import dayjsRu from 'dayjs/locale/ru'
import dayjs from 'dayjs'

dayjs.locale({
    ...dayjsRu,
    weekStart: 1,
})

import App from './App.vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus, { locale: ru })
app.mount('#app')
