import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from 'vue-i18n'
const i18n = createI18n({
  // something vue-i18n options here ...
})
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import "./assets/style.css";
import "./assets/scss/main.scss";
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(i18n)
app.use(router);
app.mount("#app");