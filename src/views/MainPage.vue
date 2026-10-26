<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title><span class="brand-mark">◉</span> Cuaca Jakarta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <main class="weather-shell">
        <header class="page-heading">
          <div>
            <p class="eyebrow">PRAKIRAAN CUACA</p>
            <p class="intro">Pantau prakiraan suhu Jakarta, satu jam setiap waktunya.</p>
          </div>
          <ion-button class="refresh-button" fill="outline" :disabled="loading" @click="fetchWeather">
            <ion-icon slot="start" :icon="refreshOutline" aria-hidden="true" />
            Muat ulang
          </ion-button>
        </header>

        <section class="hourly-panel" aria-labelledby="hourly-heading" :aria-busy="loading">
          <div class="section-heading"><div><h2 id="hourly-heading">Prakiraan per jam</h2><p>Waktu UTC (GMT+0)</p></div><span class="section-icon"><ion-icon :icon="timeOutline" aria-hidden="true" /></span></div>
          <div v-if="loading" class="state-message" role="status"><ion-spinner name="crescent" /><p>Memuat data cuaca…</p></div>
          <div v-else-if="error" class="state-message error-message" role="alert"><strong>Prakiraan belum dapat dimuat</strong><p>{{ error }}</p></div>
          <template v-else-if="weather.length">
            <div class="list-heading"><span>Waktu prakiraan</span><span>Suhu</span></div>
            <ion-list lines="none">
              <ion-item v-for="(item, index) in weather" :key="item.time">
                <span class="row-number" slot="start">{{ String(index + 1).padStart(2, '0') }}</span>
                <ion-label><h3>{{ item.time.replace('T', ' ') }}</h3><p>UTC · {{ formatDate(item.time) }}</p></ion-label>
                <strong slot="end" class="row-temperature">{{ item.temperature_2m === null ? 'Tidak tersedia' : `${item.temperature_2m} °C` }}</strong>
              </ion-item>
            </ion-list>
          </template>
          <p v-else class="state-message">Data cuaca belum tersedia.</p>
        </section>
        <footer class="page-footer"><p>Sumber: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ↗</a></p></footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonSpinner, IonList, IonItem, IonLabel, IonIcon,
} from '@ionic/vue';

import { refreshOutline, timeOutline } from 'ionicons/icons';

interface WeatherItem {
  time: string;
  temperature_2m: number | null;
}

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m';
const weather = ref<WeatherItem[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchWeather() {
  loading.value = true;
  error.value = '';
  weather.value = [];

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Permintaan gagal: HTTP ${response.status}`);
    }

    const data = await response.json();
    const times = data.hourly?.time;
    const temperatures = data.hourly?.temperature_2m;

    if (!Array.isArray(times) || !Array.isArray(temperatures) ||
        times.length !== temperatures.length ||
        !times.every((time) => typeof time === 'string') ||
        !temperatures.every((temperature) => temperature === null ||
          (typeof temperature === 'number' && Number.isFinite(temperature)))) {
      throw new Error('Format data cuaca tidak sesuai.');
    }

    weather.value = times.slice(0, 10).map((time, index) => ({
      time,
      temperature_2m: temperatures[index],
    }));
  } catch (err) {
    error.value = err instanceof Error
      ? `Gagal memuat cuaca. ${err.message}. Coba muat ulang.`
      : 'Gagal memuat cuaca. Periksa koneksi internet dan coba lagi.';
  } finally {
    loading.value = false;
  }
}

function formatDate(time: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${time}Z`));
}
onMounted(fetchWeather);
</script>

<style scoped>
ion-content { --background: #f3f6fb; --color: #1d2c46; }
ion-toolbar { --background: #f3f6fb; --color: #1d2c46; --min-height: 72px; padding-inline: max(8px, calc((100vw - 960px) / 2)); }
ion-title { font-size: 18px; font-weight: 750; letter-spacing: -.5px; }
.brand-mark { color: #3663df; margin-right: 9px; }
.weather-shell { max-width: 960px; margin: auto; padding: 26px 24px 30px; }
.page-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 30px; }
.eyebrow { font-size: 10px; font-weight: 750; color: #4669af; letter-spacing: 2px; margin: 0 0 12px; }
h1 { font-size: clamp(28px, 5vw, 38px); font-weight: 750; letter-spacing: -1.2px; margin: 0 0 10px; }
.intro { font-size: 14px; color: #65748c; line-height: 1.6; margin: 0; }
.refresh-button { --color: #315cba; --border-color: #d1ddef; --border-radius: 12px; --border-width: 1px; --padding-start: 16px; --padding-end: 16px; text-transform: none; letter-spacing: 0; font-size: 13px; min-height: 42px; flex-shrink: 0; }
.forecast-hero { position: relative; overflow: hidden; background: linear-gradient(115deg, #17387e, #346bd8); color: white; border-radius: 24px; padding: 30px 34px 0; box-shadow: 0 14px 32px #254f9a1c; }
.hero-content { position: relative; z-index: 1; }
.location { display: flex; align-items: center; gap: 7px; font-size: 14px; margin: 0 0 30px; }
.hero-caption { margin: 0 0 4px; font-size: 12px; color: #d0dffa; }
.hero-temperature { font-size: clamp(64px, 12vw, 86px); font-weight: 650; letter-spacing: -4px; line-height: 1.2; }
.hero-temperature span { font-size: 30px; font-weight: 400; letter-spacing: -1px; vertical-align: top; display: inline-block; margin-top: 13px; margin-left: 6px; }
.hero-time { font-size: 13px; color: #e0eaff; margin: 8px 0 27px; }
.hero-footer { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #ffffff29; padding: 16px 0; font-size: 11px; color: #d6e4ff; }
.hero-orbit { position: absolute; width: 340px; height: 340px; border: 1px solid #ffffff18; border-radius: 50%; right: -30px; top: -60px; box-shadow: 0 0 0 45px #ffffff06, 0 0 0 90px #ffffff04; }
.hero-symbol { position: absolute; right: 80px; top: 65px; font-size: 140px; color: #e8f1ff; transform: rotate(16deg); filter: drop-shadow(0 10px 18px #10295b30); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
.summary-card { display: flex; align-items: center; gap: 14px; background: white; border: 1px solid #e5ebf4; padding: 20px 24px; border-radius: 17px; }
.summary-card p { margin: 0 0 7px; color: #6b7890; font-size: 12px; }
.summary-card strong { font-size: 25px; font-weight: 700; letter-spacing: -.5px; }
.summary-card small { font-size: 15px; font-weight: 500; color: #6b7890; }
.stat-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px; font-size: 21px; flex-shrink: 0; }
.cool { background: #edf4ff; color: #4276cf; } .warm { background: #fff2e7; color: #bd6c2b; }
.hourly-panel { background: white; border: 1px solid #e5ebf4; border-radius: 20px; margin-top: 22px; overflow: hidden; }
.section-heading { display: flex; align-items: center; justify-content: space-between; padding: 24px; gap: 12px; }
h2 { font-size: 18px; font-weight: 750; letter-spacing: -.4px; margin: 0 0 7px; }
.section-heading p { margin: 0; font-size: 12px; color: #6b7890; line-height: 1.5; }
.section-icon { color: #6680a8; font-size: 24px; }
.list-heading { display: flex; justify-content: space-between; background: #f7f9fc; padding: 12px 24px; color: #6d7b91; font-size: 11px; font-weight: 650; }
ion-list { background: white; padding: 0 12px; }
ion-item { --background: white; --color: #26364e; --padding-start: 12px; --inner-padding-end: 12px; --min-height: 78px; border-bottom: 1px solid #eff2f7; }
ion-item:last-child { border-bottom: 0; }
.row-number { color: #8b9bb1; font-size: 11px; margin-right: 16px; font-variant-numeric: tabular-nums; }
ion-label h3 { font-size: 14px; font-weight: 650; } ion-label p { color: #7c889b; font-size: 11px; margin-top: 5px; }
.row-temperature { font-size: 17px; font-weight: 700; color: #254c96; font-variant-numeric: tabular-nums; margin-left: 12px; }
.state-message { text-align: center; padding: 36px 24px; color: #6b7890; font-size: 14px; line-height: 1.7; }
.error-message { color: #9b423c; background: #fff7f5; margin: 0 20px 20px; border-radius: 12px; }
.page-footer { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: #6b7890; margin-top: 20px; line-height: 1.6; }
.page-footer a { color: #3c63ad; text-decoration: none; } a:focus-visible { outline: 2px solid #3663df; outline-offset: 4px; }
@media (max-width: 540px) {
  .weather-shell { padding: 16px 16px 24px; } .page-heading { flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
  .forecast-hero { padding: 24px 22px 0; border-radius: 20px; } .hero-symbol { right: 18px; top: 83px; font-size: 92px; opacity: .7; }
  .hero-orbit { right: -180px; } .summary-grid { gap: 10px; } .summary-card { padding: 16px 12px; gap: 9px; }
  .stat-icon { width: 32px; height: 36px; border-radius: 10px; } .summary-card strong { font-size: 22px; } .summary-card p { font-size: 11px; }
  .section-heading { padding: 20px 16px; } .list-heading { padding-inline: 16px; } ion-list { padding-inline: 4px; }
  .row-number { margin-right: 10px; } .row-temperature { font-size: 15px; } .page-footer { display: block; }
}
</style>
