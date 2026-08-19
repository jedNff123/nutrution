/**
 * NutriVision AI - Main Application Controller
 */

import { appState } from './state.js';
import { UIManager } from './ui.js';
import { ScannerManager } from './scanner.js';
import { OnboardingManager } from './onboarding.js';
import { AlarmService } from './alarm-service.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize UI & Managers
  UIManager.init();
  ScannerManager.init();
  OnboardingManager.init();
  AlarmService.init();

  // 2. First Launch: Open Onboarding Wizard if not completed
  if (!appState.profile.onboardingCompleted) {
    setTimeout(() => {
      OnboardingManager.open();
    }, 400);
  }

  // 3. Tab Navigation Routing
  const navItems = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');

  const switchTab = (targetTabId) => {
    navItems.forEach(item => {
      if (item.dataset.tab === targetTabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    tabViews.forEach(view => {
      if (view.id === `tab-${targetTabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    appState.activeTab = targetTabId;

    // Handle Camera streaming state
    if (targetTabId === 'scanner') {
      ScannerManager.startCamera();
    } else {
      ScannerManager.stopCamera();
    }

    // Scroll to top
    const mainContainer = document.querySelector('.app-main');
    if (mainContainer) mainContainer.scrollTop = 0;
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // Quick Action cards from dashboard
  document.querySelectorAll('[data-switch-tab]').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.dataset.switchTab;
      if (tab) switchTab(tab);
    });
  });

  // 4. Subview Switching in Tab 4 (Meals vs Workout vs Timetable)
  const subviewChips = document.querySelectorAll('[data-subview]');
  const subviewMeals = document.getElementById('subview-meals-content');
  const subviewWorkout = document.getElementById('subview-workout-content');
  const subviewTimetable = document.getElementById('subview-timetable-content');

  subviewChips.forEach(chip => {
    chip.addEventListener('click', () => {
      subviewChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const target = chip.dataset.subview;
      if (subviewMeals) subviewMeals.style.display = target === 'meals' ? 'block' : 'none';
      if (subviewWorkout) subviewWorkout.style.display = target === 'workout' ? 'block' : 'none';
      if (subviewTimetable) subviewTimetable.style.display = target === 'timetable' ? 'block' : 'none';
    });
  });

  // 5. Register Service Worker for PWA (if supported)
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('NutriVision Service Worker registered', reg.scope))
      .catch(err => console.warn('Service Worker registration skipped or failed', err));
  }
});
