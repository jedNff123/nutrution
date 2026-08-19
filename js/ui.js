/**
 * NutriVision AI - UI Rendering & Interactive Controller
 * Enhanced with Gender-Adaptive 3D Exercise Visuals and HD Food Photos
 */

import { appState } from './state.js';
import { MealPlannerService } from './meal-planner.js';
import { AIService } from './ai-service.js';
import { StorageHelper } from './storage.js';
import { CountryFoodDatabase } from './country-foods.js';
import { AlarmService } from './alarm-service.js';
import { OnboardingManager } from './onboarding.js';
import { ExerciseVisualsService } from './exercise-visuals.js';

export const UIManager = {
  activeRestTimerInterval: null,
  currentRestSeconds: 60,
  currentModalGender: 'male',
  currentModalExerciseKey: 'dumbbell_bench_press',

  init() {
    this.bindGlobalEventListeners();
    this.renderAll();

    // Subscribe to state updates for automatic UI re-rendering
    appState.subscribe((event, payload) => {
      if (event === 'PROFILE_UPDATED' || event === 'FOOD_LOGGED' || event === 'FOOD_REMOVED' || event === 'WATER_UPDATED') {
        this.renderDashboard();
        this.renderProfile();
        this.renderCountryMarket();
        this.renderWorkoutAndTimetable();
      }
      if (event === 'SETTINGS_UPDATED') {
        this.applyTheme(appState.settings.theme);
      }
      if (event === 'MEALPLAN_UPDATED') {
        this.renderMealPlan(payload);
      }
      if (event === 'TIMELINE_UPDATED' || event === 'WORKOUT_UPDATED') {
        this.renderWorkoutAndTimetable();
      }
    });

    this.applyTheme(appState.settings.theme);
  },

  renderAll() {
    this.renderDashboard();
    this.renderProfile();
    this.renderCountryMarket();
    this.renderWorkoutAndTimetable();
    this.initMealPlanner();
    this.initChat();
  },

  // ---------------------------------------------------------
  // 1. Dashboard View Rendering
  // ---------------------------------------------------------
  renderDashboard() {
    const totals = appState.getTodayTotals();
    const metabolism = appState.metabolism;
    const p = appState.profile;

    // Header Greeting
    const greetingEl = document.getElementById('user-greeting-name');
    if (greetingEl) {
      const countryObj = CountryFoodDatabase.countries.find(c => c.code === p.country) || CountryFoodDatabase.countries[0];
      greetingEl.textContent = `Bonjour, ${p.firstName || p.name} ${countryObj.flag}`;
    }

    // 1. Calorie SVG Ring Gauge
    const gaugeProgress = document.getElementById('calorie-gauge-circle');
    const calValueEl = document.getElementById('calorie-consumed-display');
    const calSubtextEl = document.getElementById('calorie-remaining-display');
    const calTargetEl = document.getElementById('calorie-target-display');
    const calConsumedMetricEl = document.getElementById('metric-consumed-val');

    if (calValueEl) calValueEl.textContent = totals.calories;
    if (calConsumedMetricEl) calConsumedMetricEl.textContent = `${totals.calories} kcal`;
    if (calTargetEl) calTargetEl.textContent = `${totals.targetCalories} kcal`;

    if (calSubtextEl) {
      if (totals.isOverBudget) {
        calSubtextEl.textContent = `+${totals.calories - totals.targetCalories} kcal au-dessus`;
        calSubtextEl.style.color = 'var(--accent-rose)';
      } else {
        calSubtextEl.textContent = `${totals.remainingCalories} kcal restantes`;
        calSubtextEl.style.color = 'var(--primary-light)';
      }
    }

    const totalCircumference = 534;
    const offset = totalCircumference - (totalCircumference * (totals.caloriePercentage / 100));
    if (gaugeProgress) {
      gaugeProgress.style.strokeDashoffset = Math.max(0, offset);
      if (totals.isOverBudget) {
        gaugeProgress.classList.add('over-budget');
      } else {
        gaugeProgress.classList.remove('over-budget');
      }
    }

    // 2. Macro Nutrients Bars & Values
    this.updateMacroPill('protein', totals.protein, metabolism.proteinGrams, 'g');
    this.updateMacroPill('carbs', totals.carbs, metabolism.carbGrams, 'g');
    this.updateMacroPill('fats', totals.fats, metabolism.fatGrams, 'g');
    this.updateMacroPill('sugar', totals.sugar, metabolism.sugarLimitGrams, 'g');

    // 3. Water Tracker
    const waterValEl = document.getElementById('water-count-display');
    const waterTargetEl = document.getElementById('water-target-display');
    if (waterValEl) waterValEl.textContent = `${(appState.dailyLogs.waterMl / 1000).toFixed(2)} L`;
    if (waterTargetEl) waterTargetEl.textContent = `Objectif: ${(metabolism.waterTargetMl / 1000).toFixed(1)} L`;

    // 4. Daily Meals List
    this.renderDailyMeals();
  },

  updateMacroPill(type, current, target, unit) {
    const valEl = document.getElementById(`macro-${type}-val`);
    const targetEl = document.getElementById(`macro-${type}-target`);
    const barEl = document.getElementById(`macro-${type}-bar`);

    if (valEl) valEl.textContent = `${current}${unit}`;
    if (targetEl) targetEl.textContent = `/${target}${unit}`;
    if (barEl) {
      const pct = Math.min(100, Math.round((current / (target || 1)) * 100));
      barEl.style.width = `${pct}%`;
    }
  },

  renderDailyMeals() {
    const mealsContainer = document.getElementById('daily-meals-list-container');
    if (!mealsContainer) return;

    const mealCategories = [
      { key: 'breakfast', name: 'Petit-déjeuner (Ftour Sbah)', emoji: '🍳', targetRatio: 0.25 },
      { key: 'lunch', name: 'Déjeuner (Ftour Noss Nhar)', emoji: '🥗', targetRatio: 0.35 },
      { key: 'dinner', name: 'Dîner (3ché)', emoji: '🍲', targetRatio: 0.30 },
      { key: 'snacks', name: 'Collation & Snack', emoji: '🍎', targetRatio: 0.10 }
    ];

    const targetCal = appState.metabolism.targetCalories;

    mealsContainer.innerHTML = mealCategories.map(cat => {
      const items = appState.dailyLogs.meals[cat.key] || [];
      const mealTotalCal = items.reduce((sum, it) => sum + (parseFloat(it.calories) || 0), 0);
      const budgetCal = Math.round(targetCal * cat.targetRatio);

      return `
        <div class="meal-block" data-meal-key="${cat.key}">
          <div class="meal-block-header">
            <div class="meal-block-title">
              <span class="meal-emoji">${cat.emoji}</span>
              <div>
                <span class="meal-name">${cat.name}</span>
                <span class="meal-target-cal"> ~${budgetCal} kcal</span>
              </div>
            </div>
            <div class="meal-block-calories">${mealTotalCal} kcal</div>
          </div>

          <div class="meal-items-list">
            ${items.length === 0 ? `
              <div class="meal-empty-state">
                <span>Aucun aliment enregistré</span>
              </div>
            ` : items.map(item => `
              <div class="meal-item-row" data-item-id="${item.id}">
                <div class="meal-item-info">
                  <h5>${item.name}</h5>
                  <p>${item.portion || ''} • P: ${item.protein}g | G: ${item.carbs}g | L: ${item.fats}g</p>
                </div>
                <div class="meal-item-actions">
                  <span class="meal-item-cal">${item.calories} kcal</span>
                  <button class="btn-delete-item" data-meal="${cat.key}" data-id="${item.id}" title="Supprimer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <button class="btn-add-to-meal" data-meal="${cat.key}">
            <span>➕</span> Ajouter un aliment
          </button>
        </div>
      `;
    }).join('');

    mealsContainer.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mealKey = btn.dataset.meal;
        const itemId = btn.dataset.id;
        appState.removeFoodItem(mealKey, itemId);
        this.showToast('Aliment retiré');
      });
    });

    mealsContainer.querySelectorAll('.btn-add-to-meal').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealKey = btn.dataset.meal;
        this.openQuickAddModal(mealKey);
      });
    });
  },

  // ---------------------------------------------------------
  // 2. Country Food Market Rendering (with Real Food Photos)
  // ---------------------------------------------------------
  renderCountryMarket() {
    const marketContainer = document.getElementById('country-food-market-list');
    const countryTitleEl = document.getElementById('market-country-title');
    if (!marketContainer) return;

    const countryCode = appState.profile.country || 'TN';
    const countryObj = CountryFoodDatabase.countries.find(c => c.code === countryCode) || CountryFoodDatabase.countries[0];
    const foods = CountryFoodDatabase.getFoodsByCountry(countryCode);

    if (countryTitleEl) {
      countryTitleEl.textContent = `Marché & Aliments Locaux (${countryObj.flag} ${countryObj.name})`;
    }

    marketContainer.innerHTML = foods.map(f => `
      <div class="market-food-card">
        <div class="market-food-left">
          ${f.image ? `
            <img class="market-food-img" src="${f.image}" alt="${f.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="market-food-icon" style="display: none;">${f.icon}</div>
          ` : `
            <div class="market-food-icon">${f.icon}</div>
          `}
          <div class="market-food-info">
            <h4>${f.name}</h4>
            <span class="brand-badge">${f.brand}</span>
            <p>${f.portion} • ${f.calories} kcal (P: ${f.protein}g | G: ${f.carbs}g | L: ${f.fats}g)</p>
          </div>
        </div>
        <div class="market-food-right">
          <span class="market-food-price">${f.price.toFixed(3)} ${f.currency}</span>
          <button class="btn-add-market-item" data-food-id="${f.id}">
            + Journal
          </button>
        </div>
      </div>
    `).join('');

    marketContainer.querySelectorAll('.btn-add-market-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = btn.dataset.foodId;
        const item = foods.find(x => x.id === foodId);
        if (item) {
          this.openMealSelectionModal({
            name: `${item.name} (${item.brand})`,
            portion: item.portion,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            sugar: item.sugar || 0,
            fiber: item.fiber || 0
          });
        }
      });
    });
  },

  // ---------------------------------------------------------
  // 3. Workout Routine & Gender-Adaptive 3D Exercise Visuals
  // ---------------------------------------------------------
  renderWorkoutAndTimetable() {
    const workoutContainer = document.getElementById('workout-routine-list');
    const timetableContainer = document.getElementById('daily-timetable-list');
    const userGender = appState.profile.gender || 'male';

    // 1. Workout 7-day routine with gender-specific anatomical cards
    if (workoutContainer && appState.workoutPlan) {
      const plan = appState.workoutPlan;
      workoutContainer.innerHTML = `
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="color: #38bdf8; font-size: 1rem; font-weight: 800;">${plan.title}</h4>
            <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #bae6fd; border-color: #38bdf8;">
              ${userGender === 'female' ? '👩 Modèle Femme 3D' : '👨 Modèle Homme 3D'}
            </span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
            ${plan.description} • <strong>Cliquez sur un exercice</strong> pour voir l'animation 3D et démarrer le chronomètre !
          </p>
        </div>

        ${plan.schedule.map(s => `
          <div class="workout-day-card">
            <div class="workout-day-header">
              <div class="workout-day-title">
                <span>${s.icon}</span>
                <span>${s.dayName} : ${s.focus}</span>
              </div>
              <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;">⏱️ ${s.duration}</span>
            </div>

            <div class="exercise-items-list">
              ${s.exercises.map(ex => {
                const visual = ExerciseVisualsService.getExercise(ex.key || 'dumbbell_bench_press', userGender);
                const accentCol = userGender === 'female' ? '#fb7185' : '#38bdf8';
                // Extract first photo URL from the dual-phase HTML for thumbnail
                const thumbMatch = (visual.maleHtml || visual.femaleHtml || '').match(/src="([^"]+)"/);
                const thumbUrl = thumbMatch ? thumbMatch[1] : '';
                return `
                  <div class="exercise-card-interactive" data-exercise-key="${ex.key || 'dumbbell_bench_press'}" data-exercise-name="${ex.name}" data-sets="${ex.sets}" data-reps="${ex.reps}" data-rest="${ex.rest}">
                    <div class="exercise-thumb-photo" style="border-color:${accentCol}44;">
                      ${thumbUrl
                        ? `<img src="${thumbUrl}" alt="${ex.name}" loading="lazy" onerror="this.style.display='none'"><div class="exercise-thumb-muscle-dot" style="background:${accentCol};"></div>`
                        : `<div style="color:${accentCol};font-size:1.6rem;display:flex;align-items:center;justify-content:center;height:100%;">💪</div>`
                      }
                    </div>
                    <div class="exercise-info-block">
                      <h4>${ex.name}</h4>
                      <span class="muscle-target-tag" style="color:${accentCol};">⚡ ${visual.primaryMuscles[0] || 'Muscles Cibles'}</span>
                      <p style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
                        ${ex.sets} séries × ${ex.reps} • Repos: ${ex.rest}
                      </p>
                    </div>
                    <div style="color: ${accentCol}; font-size: 1.2rem;">➔</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      `;

      // Bind click on exercise cards to open full detail modal
      workoutContainer.querySelectorAll('.exercise-card-interactive').forEach(card => {
        card.addEventListener('click', () => {
          const exKey = card.dataset.exerciseKey;
          const sets = parseInt(card.dataset.sets, 10) || 4;
          const reps = card.dataset.reps || '10-12';
          const restStr = card.dataset.rest || '60s';
          this.openExerciseModal(exKey, sets, reps, restStr);
        });
      });
    }

    // 2. Synchronized Daily Timetable
    if (timetableContainer && appState.dailyTimeline) {
      timetableContainer.innerHTML = `
        <div class="timeline-container">
          ${appState.dailyTimeline.map(ev => `
            <div class="timeline-event-card ${ev.category}">
              <div class="timeline-event-header">
                <span class="timeline-time-badge">${ev.time}</span>
                <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-dim);">${ev.typeText}</span>
              </div>
              <div class="timeline-event-title">${ev.title}</div>
              <div class="timeline-event-desc">${ev.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  // ---------------------------------------------------------
  // 4. Interactive Exercise Detail Modal (with Male/Female Model Switcher)
  // ---------------------------------------------------------
  openExerciseModal(exerciseKey, targetSets = 4, targetReps = '10-12', restStr = '60s') {
    const modal = document.getElementById('exercise-detail-modal');
    if (!modal) return;

    this.currentModalExerciseKey = exerciseKey;
    this.currentModalGender = appState.profile.gender || 'male';

    const restSeconds = parseInt(restStr.replace(/\D/g, ''), 10) || 60;
    this.currentRestSeconds = restSeconds;

    this.updateModalExerciseVisual(this.currentModalGender);

    const setTrackerContainer = document.getElementById('modal-ex-set-tracker');
    // Render set tracker pills
    if (setTrackerContainer) {
      let setPillsHtml = '';
      for (let i = 1; i <= targetSets; i++) {
        setPillsHtml += `
          <div class="set-check-pill" data-set-num="${i}">
            Série ${i}<br><span style="font-size: 0.68rem; font-weight: normal;">${targetReps} reps</span>
          </div>
        `;
      }
      setTrackerContainer.innerHTML = setPillsHtml;

      setTrackerContainer.querySelectorAll('.set-check-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          pill.classList.toggle('completed');
          if (pill.classList.contains('completed')) {
            this.showToast(`✔️ Série ${pill.dataset.setNum} validée ! Lancez votre repos.`);
            this.startRestTimer(restSeconds);
          }
        });
      });
    }

    // Reset Rest Timer display
    const timerDisplay = document.getElementById('rest-timer-countdown');
    if (timerDisplay) timerDisplay.textContent = `${restSeconds}s`;

    const startTimerBtn = document.getElementById('btn-start-rest-timer');
    if (startTimerBtn) {
      startTimerBtn.onclick = () => this.startRestTimer(restSeconds);
    }

    // Bind Gender Switch Buttons inside Modal
    const btnMale = document.getElementById('modal-gender-btn-male');
    const btnFemale = document.getElementById('modal-gender-btn-female');

    if (btnMale && btnFemale) {
      btnMale.onclick = () => {
        this.currentModalGender = 'male';
        btnMale.classList.add('active');
        btnFemale.classList.remove('active');
        this.updateModalExerciseVisual('male');
      };

      btnFemale.onclick = () => {
        this.currentModalGender = 'female';
        btnFemale.classList.add('active');
        btnMale.classList.remove('active');
        this.updateModalExerciseVisual('female');
      };

      if (this.currentModalGender === 'female') {
        btnFemale.classList.add('active');
        btnMale.classList.remove('active');
      } else {
        btnMale.classList.add('active');
        btnFemale.classList.remove('active');
      }
    }

    modal.classList.add('open');
  },

  updateModalExerciseVisual(gender = 'male') {
    const data = ExerciseVisualsService.getExercise(this.currentModalExerciseKey, gender);

    const titleEl = document.getElementById('modal-ex-title');
    const heroVisualEl = document.getElementById('modal-ex-visual-hero');
    const primaryMusclesEl = document.getElementById('modal-ex-primary-muscles');
    const secondaryMusclesEl = document.getElementById('modal-ex-secondary-muscles');
    const postureListEl = document.getElementById('modal-ex-posture-tips');
    const breathingEl = document.getElementById('modal-ex-breathing');
    const genderBadgeEl = document.getElementById('modal-gender-badge');

    const accentColor = gender === 'female' ? '#fb7185' : '#38bdf8';
    const genderLabel = gender === 'female' ? '👩‍🦱 Modèle Femme' : '👨 Modèle Homme';

    if (titleEl) titleEl.textContent = data.title;

    // Render the dual-phase visual panel with smooth transition
    if (heroVisualEl) {
      heroVisualEl.style.opacity = '0';
      heroVisualEl.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        heroVisualEl.innerHTML = data.visualHtml || data.svgMotion || '';
        heroVisualEl.style.opacity = '1';
      }, 150);
    }

    if (genderBadgeEl) {
      genderBadgeEl.textContent = genderLabel;
      genderBadgeEl.style.color = accentColor;
    }

    if (primaryMusclesEl) {
      primaryMusclesEl.innerHTML = data.primaryMuscles.map(m => `
        <span class="badge" style="background: ${accentColor}1A; color: ${accentColor}; border: 1px solid ${accentColor}66; margin-right: 4px; padding: 4px 10px;">
          ⚡ ${m}
        </span>
      `).join('');
    }

    if (secondaryMusclesEl) {
      secondaryMusclesEl.innerHTML = data.secondaryMuscles.map(m => `
        <span class="badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted); margin-right: 4px;">
          ${m}
        </span>
      `).join('');
    }

    if (postureListEl) {
      postureListEl.innerHTML = data.postureTips.map((tip, i) => `
        <li style="margin-bottom: 8px; padding-left: 4px;">
          <span style="color: ${accentColor}; font-weight: 700;">${i + 1}.</span> ${tip}
        </li>
      `).join('');
    }

    if (breathingEl) {
      breathingEl.innerHTML = `<span style="color: ${accentColor};">🌬️</span> <strong>Respiration :</strong> ${data.breathing}`;
    }

    // Update modal border/theme accent
    const modal = document.getElementById('exercise-detail-modal');
    if (modal) {
      modal.style.setProperty('--modal-accent', accentColor);
    }
  },

  // Start Rest Countdown with Web Audio Chime at zero
  startRestTimer(totalSeconds) {
    if (this.activeRestTimerInterval) {
      clearInterval(this.activeRestTimerInterval);
    }

    let remaining = totalSeconds;
    const display = document.getElementById('rest-timer-countdown');
    const startBtn = document.getElementById('btn-start-rest-timer');

    if (startBtn) startBtn.textContent = 'En cours... ⏳';

    this.activeRestTimerInterval = setInterval(() => {
      remaining--;
      if (display) display.textContent = `${remaining}s`;

      if (remaining <= 0) {
        clearInterval(this.activeRestTimerInterval);
        this.activeRestTimerInterval = null;
        if (display) display.textContent = '0s';
        if (startBtn) startBtn.textContent = '▶️ Relancer';

        // Play chime & alert
        AlarmService.playAlarmChime();
        this.showToast('🔔 Temps de repos terminé ! Attaquez la série suivante !', 'success');
      }
    }, 1000);
  },

  // ---------------------------------------------------------
  // 5. Profile & Metabolic Calculator View
  // ---------------------------------------------------------
  renderProfile() {
    const p = appState.profile;
    const m = appState.metabolism;

    const firstNameInput = document.getElementById('input-profile-firstname');
    const lastNameInput = document.getElementById('input-profile-lastname');
    const countrySelect = document.getElementById('select-profile-country');
    const ageInput = document.getElementById('input-profile-age');
    const genderSelect = document.getElementById('select-profile-gender');
    const weightInput = document.getElementById('input-profile-weight');
    const targetWeightInput = document.getElementById('input-profile-target-weight');
    const heightInput = document.getElementById('input-profile-height');
    const activitySelect = document.getElementById('select-profile-activity');
    const workoutTypeSelect = document.getElementById('select-profile-workout-type');
    const workoutTimeInput = document.getElementById('input-profile-workout-time');

    if (firstNameInput) firstNameInput.value = p.firstName || '';
    if (lastNameInput) lastNameInput.value = p.lastName || '';
    if (countrySelect) countrySelect.value = p.country || 'TN';
    if (ageInput) ageInput.value = p.age || 24;
    if (genderSelect) genderSelect.value = p.gender || 'male';
    if (weightInput) weightInput.value = p.weightKg || 80;
    if (targetWeightInput) targetWeightInput.value = p.targetWeightKg || p.weightKg;
    if (heightInput) heightInput.value = p.heightCm || 178;
    if (activitySelect) activitySelect.value = p.activityLevel || 'moderate';
    if (workoutTypeSelect) workoutTypeSelect.value = p.workoutType || 'gym';
    if (workoutTimeInput) workoutTimeInput.value = p.workoutTime || '17:30';

    document.querySelectorAll('.goal-card').forEach(card => {
      if (card.dataset.goal === p.goal) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const bmrDisplay = document.getElementById('calc-res-bmr');
    const tdeeDisplay = document.getElementById('calc-res-tdee');
    const targetCalDisplay = document.getElementById('calc-res-target-cal');
    const deltaDisplay = document.getElementById('calc-res-delta');
    const weeksDisplay = document.getElementById('calc-res-weeks');

    if (bmrDisplay) bmrDisplay.textContent = `${m.bmr} kcal`;
    if (tdeeDisplay) tdeeDisplay.textContent = `${m.tdee} kcal`;
    if (targetCalDisplay) targetCalDisplay.textContent = `${m.targetCalories} kcal/jour`;

    if (deltaDisplay) {
      if (m.calorieDelta < 0) {
        deltaDisplay.textContent = `Déficit: ${m.calorieDelta} kcal/jour`;
        deltaDisplay.style.color = 'var(--primary-light)';
      } else if (m.calorieDelta > 0) {
        deltaDisplay.textContent = `Surplus: +${m.calorieDelta} kcal/jour`;
        deltaDisplay.style.color = 'var(--accent-coral)';
      } else {
        deltaDisplay.textContent = 'Maintien strict (0 kcal)';
        deltaDisplay.style.color = 'var(--text-muted)';
      }
    }

    if (weeksDisplay) {
      if (m.estimatedWeeks) {
        weeksDisplay.textContent = `⏳ Atteinte estimée de l'objectif en ~${m.estimatedWeeks} semaines`;
        weeksDisplay.style.display = 'block';
      } else {
        weeksDisplay.style.display = 'none';
      }
    }
  },

  // ---------------------------------------------------------
  // 6. AI Meal Planner View (with HD Food Photos)
  // ---------------------------------------------------------
  initMealPlanner() {
    const generateBtn = document.getElementById('btn-generate-mealplan');
    const dietChips = document.querySelectorAll('.diet-chip');

    let selectedDiet = 'mediterranean';

    dietChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dietChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedDiet = chip.dataset.diet;
      });
    });

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.showToast('✨ Génération du programme nutritionnel...', 'info');
        const plan = MealPlannerService.generatePlan(
          appState.metabolism.targetCalories,
          appState.metabolism,
          selectedDiet
        );
        appState.saveMealPlan(plan);
        this.renderMealPlan(plan);
        this.showToast('✅ Programme de repas prêt !', 'success');
      });
    }

    if (appState.mealPlan) {
      this.renderMealPlan(appState.mealPlan);
    }
  },

  renderMealPlan(plan) {
    const container = document.getElementById('mealplan-results-container');
    if (!container || !plan) return;

    const mealKeys = [
      { key: 'breakfast', name: 'Petit-déjeuner (Ftour Sbah)', emoji: '🍳' },
      { key: 'lunch', name: 'Déjeuner (Ftour Noss Nhar)', emoji: '🥗' },
      { key: 'dinner', name: 'Dîner (3ché)', emoji: '🍲' },
      { key: 'snack', name: 'Collation / Snack', emoji: '🍎' }
    ];

    container.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--border-active); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; text-align: center;">
        <h4 style="color: var(--primary-light); font-size: 1rem;">Programme Journalier Personnalisé</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
          Total: <strong style="color: #fff;">${plan.totalCalories} kcal</strong> • P: ${plan.totalProtein}g | G: ${plan.totalCarbs}g | L: ${plan.totalFats}g
        </p>
      </div>

      ${mealKeys.map(m => {
        const item = plan.meals[m.key];
        if (!item) return '';
        return `
          <div class="plan-meal-card">
            ${item.image ? `
              <div class="plan-meal-img-banner">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="plan-meal-cal-badge">${item.calories} kcal</div>
              </div>
            ` : ''}
            
            <div class="plan-meal-body">
              <div class="plan-meal-header">
                <h4>${m.emoji} ${m.name}</h4>
                ${!item.image ? `<span style="font-family: 'JetBrains Mono'; font-weight: 700; color: var(--primary-light);">${item.calories} kcal</span>` : ''}
              </div>
              <div style="font-size: 0.92rem; font-weight: 700; color: #fff; margin-bottom: 4px;">${item.name}</div>
              
              <div class="plan-meal-macros">
                <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">Portion: ${item.portion}</span>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--primary-light);">P: ${item.protein}g</span>
                <span class="badge">G: ${item.carbs}g</span>
                <span class="badge">L: ${item.fats}g</span>
                <span class="badge">⏱️ ${item.prepTime}</span>
              </div>
              
              <div class="plan-ingredients-list">
                <strong>Ingrédients :</strong> ${item.ingredients.join(', ')}
              </div>
              
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 12px; font-style: italic; line-height: 1.4;">
                ${item.instructions}
              </div>
              
              <button class="btn-secondary btn-log-planned-meal" data-meal-type="${m.key === 'snack' ? 'snacks' : m.key}" data-meal-index="${m.key}">
                <span>➕</span> Ajouter au Journal d'aujourd'hui
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;

    container.querySelectorAll('.btn-log-planned-meal').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealType = btn.dataset.mealType;
        const mealKey = btn.dataset.mealIndex;
        const item = plan.meals[mealKey];
        if (item) {
          appState.addFoodItem(mealType, {
            name: item.name,
            portion: item.portion,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            sugar: 2,
            fiber: 4
          });
          this.showToast(`✅ "${item.name}" ajouté au ${mealType} !`, 'success');
        }
      });
    });
  },

  // ---------------------------------------------------------
  // 7. AI Nutrition Coach Chat View
  // ---------------------------------------------------------
  initChat() {
    const chatContainer = document.getElementById('chat-messages-box');
    const inputField = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('chat-send-action');
    const quickPills = document.querySelectorAll('.prompt-pill');

    const handleSendMessage = async (textToSend) => {
      const text = (textToSend || inputField.value || '').trim();
      if (!text) return;

      appState.addChatMessage('user', text);
      if (inputField) inputField.value = '';
      this.renderChatMessages();

      const typingEl = document.createElement('div');
      typingEl.className = 'chat-bubble ai';
      typingEl.id = 'chat-typing-indicator';
      typingEl.innerHTML = '<span style="opacity: 0.7;">NutriCoach réfléchit... 💭</span>';
      chatContainer.appendChild(typingEl);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      const aiReply = await AIService.askNutritionCoach(
        text,
        appState.profile,
        appState.getTodayTotals(),
        appState.settings.apiKey
      );

      const typing = document.getElementById('chat-typing-indicator');
      if (typing) typing.remove();

      appState.addChatMessage('ai', aiReply);
      this.renderChatMessages();
    };

    if (sendBtn) {
      sendBtn.addEventListener('click', () => handleSendMessage());
    }

    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
      });
    }

    quickPills.forEach(pill => {
      pill.addEventListener('click', () => {
        handleSendMessage(pill.textContent.trim());
      });
    });

    this.renderChatMessages();
  },

  renderChatMessages() {
    const chatContainer = document.getElementById('chat-messages-box');
    if (!chatContainer) return;

    chatContainer.innerHTML = appState.chatMessages.map(msg => `
      <div class="chat-bubble ${msg.sender}">
        ${msg.text.replace(/\n/g, '<br>')}
      </div>
    `).join('');

    chatContainer.scrollTop = chatContainer.scrollHeight;
  },

  // ---------------------------------------------------------
  // 8. Global Event Listeners & Modals
  // ---------------------------------------------------------
  bindGlobalEventListeners() {
    // Water Add button on Dashboard
    const addWaterBtn = document.getElementById('btn-add-water-250');
    if (addWaterBtn) {
      addWaterBtn.addEventListener('click', () => {
        appState.addWater(250);
        this.showToast('💧 +250ml d\'eau enregistrés !');
      });
    }

    // Profile form submit & goal card picks
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        goalCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const goal = card.dataset.goal;
        appState.updateProfile({ goal });
      });
    });

    const profileForm = document.getElementById('profile-settings-form');
    if (profileForm) {
      profileForm.addEventListener('input', () => {
        const formData = {
          firstName: document.getElementById('input-profile-firstname')?.value || 'Mohamed',
          lastName: document.getElementById('input-profile-lastname')?.value || '',
          country: document.getElementById('select-profile-country')?.value || 'TN',
          age: parseInt(document.getElementById('input-profile-age')?.value, 10) || 24,
          gender: document.getElementById('select-profile-gender')?.value || 'male',
          weightKg: parseFloat(document.getElementById('input-profile-weight')?.value) || 80,
          targetWeightKg: parseFloat(document.getElementById('input-profile-target-weight')?.value) || 74,
          heightCm: parseFloat(document.getElementById('input-profile-height')?.value) || 178,
          activityLevel: document.getElementById('select-profile-activity')?.value || 'moderate',
          workoutType: document.getElementById('select-profile-workout-type')?.value || 'gym',
          workoutTime: document.getElementById('input-profile-workout-time')?.value || '17:30'
        };
        formData.name = `${formData.firstName} ${formData.lastName}`.trim();
        appState.updateProfile(formData);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = appState.settings.theme === 'dark' ? 'light' : 'dark';
        appState.updateSettings({ theme: newTheme });
        this.showToast(`Thème ${newTheme === 'dark' ? 'Sombre' : 'Clair'} activé`);
      });
    }

    // Settings Modal Trigger
    const settingsBtn = document.getElementById('btn-open-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    // Test Alarm Sound button
    const testAlarmBtn = document.getElementById('btn-test-alarm-sound');
    if (testAlarmBtn) {
      testAlarmBtn.addEventListener('click', () => {
        AlarmService.testAlarm();
      });
    }

    // Re-run Onboarding button in Settings
    const rerunOnboardingBtn = document.getElementById('btn-rerun-onboarding');
    if (rerunOnboardingBtn) {
      rerunOnboardingBtn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        OnboardingManager.open();
      });
    }
  },

  // Apply Theme
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    }
  },

  // Open Meal Selection Modal
  openMealSelectionModal(foodData) {
    const modal = document.getElementById('meal-select-modal');
    if (!modal) return;

    modal.classList.add('open');

    const foodNameEl = document.getElementById('modal-food-title');
    const foodCalEl = document.getElementById('modal-food-cal');
    if (foodNameEl) foodNameEl.textContent = foodData.name;
    if (foodCalEl) foodCalEl.textContent = `${foodData.calories} kcal (${foodData.portion})`;

    const confirmBtn = document.getElementById('btn-confirm-add-scanned');
    const mealRadios = document.getElementsByName('target-meal-type');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
      let selectedMeal = 'lunch';
      for (const radio of mealRadios) {
        if (radio.checked) {
          selectedMeal = radio.value;
          break;
        }
      }

      appState.addFoodItem(selectedMeal, foodData);
      modal.classList.remove('open');
      this.showToast(`✅ "${foodData.name}" ajouté !`, 'success');
      
      document.querySelector('.nav-item[data-tab="dashboard"]')?.click();
    });
  },

  // Open Quick Add Modal
  openQuickAddModal(defaultMeal = 'lunch') {
    const modal = document.getElementById('quick-add-modal');
    if (!modal) return;

    modal.classList.add('open');

    const mealSelect = document.getElementById('quick-add-meal-select');
    if (mealSelect) mealSelect.value = defaultMeal;

    const form = document.getElementById('quick-add-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('quick-add-name').value.trim();
      const calories = parseFloat(document.getElementById('quick-add-cal').value) || 0;
      const protein = parseFloat(document.getElementById('quick-add-prot').value) || 0;
      const carbs = parseFloat(document.getElementById('quick-add-carb').value) || 0;
      const fats = parseFloat(document.getElementById('quick-add-fat').value) || 0;
      const portion = document.getElementById('quick-add-portion').value.trim() || '1 portion';
      const targetMeal = mealSelect.value;

      if (!name || calories <= 0) {
        this.showToast('Veuillez saisir au moins le nom et les calories', 'warning');
        return;
      }

      appState.addFoodItem(targetMeal, {
        name,
        calories,
        protein,
        carbs,
        fats,
        portion,
        sugar: 0,
        fiber: 0
      });

      modal.classList.remove('open');
      form.reset();
      this.showToast(`✅ "${name}" ajouté !`, 'success');
    };
  },

  // Open Settings Modal
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const apiKeyInput = document.getElementById('setting-api-key');
    const alarmsToggle = document.getElementById('setting-alarms-toggle');
    if (apiKeyInput) apiKeyInput.value = appState.settings.apiKey || '';
    if (alarmsToggle) alarmsToggle.checked = appState.settings.alarmsEnabled;

    modal.classList.add('open');

    const saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.onclick = () => {
        const apiKey = apiKeyInput.value.trim();
        const alarmsEnabled = alarmsToggle ? alarmsToggle.checked : true;
        appState.updateSettings({ apiKey, alarmsEnabled });
        modal.classList.remove('open');
        this.showToast('Paramètres enregistrés !', 'success');
      };
    }

    const exportDataBtn = document.getElementById('btn-export-backup');
    if (exportDataBtn) {
      exportDataBtn.onclick = () => StorageHelper.exportUserData();
    }

    const resetDataBtn = document.getElementById('btn-reset-data');
    if (resetDataBtn) {
      resetDataBtn.onclick = () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de l\'application ?')) {
          StorageHelper.resetAllData();
        }
      };
    }
  },

  // Toast notification helper
  showToast(message, type = 'info') {
    let container = document.getElementById('app-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'app-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
};
