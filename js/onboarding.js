/**
 * NutriVision AI - Interactive Onboarding Wizard
 * First-launch profile customizer with country, biometrics, fitness goals, and alarm setup.
 */

import { appState } from './state.js';
import { CountryFoodDatabase } from './country-foods.js';
import { MetabolicCalculator } from './calculator.js';
import { WorkoutScheduleService } from './workout-schedule.js';
import { AlarmService } from './alarm-service.js';

export const OnboardingManager = {
  currentStep: 1,
  totalSteps: 5,

  formData: {
    firstName: '',
    lastName: '',
    country: 'TN',
    age: 24,
    gender: 'male',
    heightCm: 178,
    weightKg: 80,
    targetWeightKg: 74,
    goal: 'fat_loss_only', // 'lose_weight', 'fat_loss_only', 'gain_muscle', 'maintain'
    activityLevel: 'moderate',
    workoutType: 'gym', // 'gym', 'cardio', 'home'
    workoutDays: 4,
    workoutTime: '17:30',
    mealCount: 4,
    alarmsEnabled: true
  },

  init() {
    this.modal = document.getElementById('onboarding-modal');
    this.bindEvents();
    this.renderCountries();
  },

  bindEvents() {
    // Next / Prev buttons
    const nextBtn = document.getElementById('onboard-btn-next');
    const prevBtn = document.getElementById('onboard-btn-prev');
    const finishBtn = document.getElementById('onboard-btn-finish');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevStep());
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => this.completeOnboarding());
    }

    // Step 3 Goal picks
    document.querySelectorAll('.onboard-goal-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.onboard-goal-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.goal = card.dataset.goal;
        this.updateLiveCalculations();
      });
    });

    // Step 4 Workout type picks
    document.querySelectorAll('.onboard-workout-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.onboard-workout-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.workoutType = card.dataset.workout;
      });
    });

    // Input listeners for live calculation updates
    ['onboard-age', 'onboard-gender', 'onboard-height', 'onboard-weight', 'onboard-target-weight', 'onboard-activity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.readStepData();
          this.updateLiveCalculations();
        });
      }
    });
  },

  renderCountries() {
    const select = document.getElementById('onboard-country');
    if (!select) return;

    select.innerHTML = CountryFoodDatabase.countries.map(c => `
      <option value="${c.code}" ${c.code === 'TN' ? 'selected' : ''}>
        ${c.flag} ${c.name} (${c.currency})
      </option>
    `).join('');
  },

  open() {
    if (!this.modal) return;
    this.currentStep = 1;
    this.showStep(1);
    this.modal.classList.add('open');
  },

  close() {
    if (this.modal) {
      this.modal.classList.remove('open');
    }
  },

  showStep(stepNum) {
    this.currentStep = stepNum;

    // Hide all steps, show current
    document.querySelectorAll('.onboarding-step').forEach(step => {
      step.style.display = 'none';
    });

    const activeStepEl = document.getElementById(`onboard-step-${stepNum}`);
    if (activeStepEl) activeStepEl.style.display = 'block';

    // Update Progress indicators
    const progressFill = document.getElementById('onboard-progress-bar');
    if (progressFill) {
      progressFill.style.width = `${(stepNum / this.totalSteps) * 100}%`;
    }

    const stepLabel = document.getElementById('onboard-step-label');
    if (stepLabel) {
      stepLabel.textContent = `Étape ${stepNum} sur ${this.totalSteps}`;
    }

    // Toggle navigation buttons
    const prevBtn = document.getElementById('onboard-btn-prev');
    const nextBtn = document.getElementById('onboard-btn-next');
    const finishBtn = document.getElementById('onboard-btn-finish');

    if (prevBtn) prevBtn.style.visibility = stepNum > 1 ? 'visible' : 'hidden';

    if (stepNum === this.totalSteps) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (finishBtn) finishBtn.style.display = 'flex';
      this.renderSummaryCelebration();
    } else {
      if (nextBtn) nextBtn.style.display = 'flex';
      if (finishBtn) finishBtn.style.display = 'none';
    }

    this.updateLiveCalculations();
  },

  readStepData() {
    this.formData.firstName = document.getElementById('onboard-firstname')?.value.trim() || this.formData.firstName || 'Champion';
    this.formData.lastName = document.getElementById('onboard-lastname')?.value.trim() || this.formData.lastName || '';
    this.formData.country = document.getElementById('onboard-country')?.value || 'TN';
    this.formData.age = parseInt(document.getElementById('onboard-age')?.value, 10) || 24;
    this.formData.gender = document.getElementById('onboard-gender')?.value || 'male';
    this.formData.heightCm = parseFloat(document.getElementById('onboard-height')?.value) || 178;
    this.formData.weightKg = parseFloat(document.getElementById('onboard-weight')?.value) || 80;
    this.formData.targetWeightKg = parseFloat(document.getElementById('onboard-target-weight')?.value) || 74;
    this.formData.activityLevel = document.getElementById('onboard-activity')?.value || 'moderate';
    this.formData.workoutDays = parseInt(document.getElementById('onboard-workout-days')?.value, 10) || 4;
    this.formData.workoutTime = document.getElementById('onboard-workout-time')?.value || '17:30';
    this.formData.mealCount = parseInt(document.getElementById('onboard-meal-count')?.value, 10) || 4;
    this.formData.alarmsEnabled = document.getElementById('onboard-alarms-toggle')?.checked ?? true;
  },

  nextStep() {
    this.readStepData();
    if (this.currentStep < this.totalSteps) {
      this.showStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.showStep(this.currentStep - 1);
    }
  },

  updateLiveCalculations() {
    const meta = MetabolicCalculator.evaluateProfile({
      gender: this.formData.gender,
      weightKg: this.formData.weightKg,
      targetWeightKg: this.formData.targetWeightKg,
      heightCm: this.formData.heightCm,
      ageYears: this.formData.age,
      activityLevel: this.formData.activityLevel,
      goal: this.formData.goal,
      workoutType: this.formData.workoutType
    });

    const bmrEl = document.getElementById('onboard-live-bmr');
    const tdeeEl = document.getElementById('onboard-live-tdee');
    const calEl = document.getElementById('onboard-live-cal');
    const waterEl = document.getElementById('onboard-live-water');

    if (bmrEl) bmrEl.textContent = `${meta.bmr} kcal`;
    if (tdeeEl) tdeeEl.textContent = `${meta.tdee} kcal`;
    if (calEl) calEl.textContent = `${meta.targetCalories} kcal/jour`;
    if (waterEl) waterEl.textContent = `${(meta.waterTargetMl / 1000).toFixed(1)} L/jour`;
  },

  renderSummaryCelebration() {
    this.readStepData();
    const meta = MetabolicCalculator.evaluateProfile({
      gender: this.formData.gender,
      weightKg: this.formData.weightKg,
      targetWeightKg: this.formData.targetWeightKg,
      heightCm: this.formData.heightCm,
      ageYears: this.formData.age,
      activityLevel: this.formData.activityLevel,
      goal: this.formData.goal,
      workoutType: this.formData.workoutType
    });

    const summaryContainer = document.getElementById('onboard-final-summary');
    if (!summaryContainer) return;

    const countryObj = CountryFoodDatabase.countries.find(c => c.code === this.formData.country) || CountryFoodDatabase.countries[0];

    summaryContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 14px;">
        <span style="font-size: 2.4rem;">🎉</span>
        <h3 style="color: #fff; font-size: 1.15rem; font-weight: 800; margin-top: 4px;">
          Bienvenue, ${this.formData.firstName} !
        </h3>
        <p style="color: var(--primary-light); font-size: 0.8rem; font-weight: 600;">
          Votre programme sur-mesure pour la ${countryObj.name} est prêt !
        </p>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-active); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Budget Calories</span>
            <strong style="display: block; font-size: 1.25rem; font-family: 'JetBrains Mono'; color: var(--primary-light);">${meta.targetCalories} kcal</strong>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Hydratation Eau</span>
            <strong style="display: block; font-size: 1.25rem; font-family: 'JetBrains Mono'; color: var(--accent-cyan);">${(meta.waterTargetMl / 1000).toFixed(1)} Litres</strong>
          </div>
        </div>

        <div style="margin-top: 10px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
          • <strong>Protéines cibles :</strong> ${meta.proteinGrams}g / jour<br>
          • <strong>Glucides :</strong> ${meta.carbGrams}g • <strong>Bons Lipides :</strong> ${meta.fatGrams}g<br>
          • <strong>Entraînement :</strong> ${this.formData.workoutDays} jours / sem à ${this.formData.workoutTime}<br>
          • <strong>Alarmes & Notifications :</strong> ${this.formData.alarmsEnabled ? '🟢 Activées' : '⚪ Désactivées'}
        </div>
      </div>
    `;
  },

  completeOnboarding() {
    this.readStepData();

    // Update app profile state
    appState.updateProfile({
      name: `${this.formData.firstName} ${this.formData.lastName}`.trim(),
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      country: this.formData.country,
      age: this.formData.age,
      gender: this.formData.gender,
      heightCm: this.formData.heightCm,
      weightKg: this.formData.weightKg,
      targetWeightKg: this.formData.targetWeightKg,
      goal: this.formData.goal,
      activityLevel: this.formData.activityLevel,
      workoutType: this.formData.workoutType,
      workoutDays: this.formData.workoutDays,
      workoutTime: this.formData.workoutTime,
      mealCount: this.formData.mealCount,
      onboardingCompleted: true
    });

    // Update alarm settings
    appState.updateSettings({
      alarmsEnabled: this.formData.alarmsEnabled
    });

    // Generate synchronized timeline & workout plan
    appState.updateWorkoutAndTimeline();

    // Play welcome chime
    AlarmService.playAlarmChime();

    this.close();
  }
};
