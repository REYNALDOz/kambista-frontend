import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { useSession } from './features/auth/session.store';
import { router } from './router';
import { configureHttp } from './shared/api/http';
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// The HTTP client does not know about the session: it is connected here, in one place.
const session = useSession();
configureHttp({
  getToken: () => session.token,
  onUnauthorized: () => {
    // The API rejected the token (it expired): back to the login, saying why.
    session.logout();
    void router.push({ name: 'login', query: { notice: 'expired' } });
  },
});

app.mount('#app');
