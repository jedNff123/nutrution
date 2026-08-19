/**
 * NutriVision AI - Smart Alarm & Notification Engine
 * Synthesizes audio chimes using Web Audio API, triggers browser push notifications, and handles meal/workout timers.
 */

import { appState } from './state.js';

export const AlarmService = {
  audioCtx: null,
  activeInterval: null,
  lastTriggeredKey: null,

  init() {
    this.setupAudio();
    this.startScheduleChecker();
    this.requestNotificationPermission();
  },

  // Initialize Web Audio API
  setupAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  },

  // Request browser notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn('Notification permission error', e);
      }
    }
  },

  // Play synthetic pleasant musical chime (Double Harmonic Gong)
  playAlarmChime() {
    if (!this.audioCtx) this.setupAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    
    // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.15 },
      { freq: 783.99, time: 0.30 },
      { freq: 1046.50, time: 0.45 }
    ];

    notes.forEach(note => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.35, now + note.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.9);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + 0.9);
    });
  },

  // Test sound alert
  testAlarm() {
    this.playAlarmChime();
    this.triggerAlarmModal({
      title: '🔔 Test Alarme NutriVision',
      category: 'test',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      desc: 'Votre système d\'alarme et de notifications sonores fonctionne parfaitement !'
    });
  },

  // Periodic Schedule Checker (runs every 15s)
  startScheduleChecker() {
    if (this.activeInterval) clearInterval(this.activeInterval);

    this.activeInterval = setInterval(() => {
      if (!appState.settings.alarmsEnabled) return;

      const d = new Date();
      const currentHM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      const timeline = appState.dailyTimeline || [];
      const match = timeline.find(item => item.time === currentHM && item.alarmEnabled);

      if (match) {
        const triggerKey = `${currentHM}_${match.title}`;
        if (this.lastTriggeredKey !== triggerKey) {
          this.lastTriggeredKey = triggerKey;
          this.fireAlarm(match);
        }
      }
    }, 15000);
  },

  // Fire both audio chime, browser notification, and visual overlay
  fireAlarm(eventData) {
    this.playAlarmChime();

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ NutriVision : C'est l'heure !`, {
          body: `${eventData.title}\n${eventData.desc}`,
          icon: './assets/icon-192.png'
        });
      } catch (e) {
        console.warn('Notification trigger error', e);
      }
    }

    // Visual Modal
    this.triggerAlarmModal(eventData);
  },

  // Show ringing visual modal
  triggerAlarmModal(eventData) {
    const modal = document.getElementById('alarm-ringing-modal');
    if (!modal) return;

    const titleEl = document.getElementById('alarm-modal-title');
    const timeEl = document.getElementById('alarm-modal-time');
    const descEl = document.getElementById('alarm-modal-desc');

    if (titleEl) titleEl.textContent = eventData.title;
    if (timeEl) timeEl.textContent = `⏰ Heure : ${eventData.time}`;
    if (descEl) descEl.textContent = eventData.desc;

    modal.classList.add('open');

    const dismissBtn = document.getElementById('btn-dismiss-alarm');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        modal.classList.remove('open');
      };
    }

    const snoozeBtn = document.getElementById('btn-snooze-alarm');
    if (snoozeBtn) {
      snoozeBtn.onclick = () => {
        modal.classList.remove('open');
        setTimeout(() => {
          this.playAlarmChime();
          modal.classList.add('open');
        }, 10 * 60 * 1000); // 10 minutes snooze
      };
    }
  }
};
