import { createApp } from 'vue'
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

app.use(ElementPlus, { locale: ru })
app.mount('#app')
