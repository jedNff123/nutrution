/**
 * NutriVision AI - Scanner & Camera Controller
 * Manages live video stream, photo captures, image compression, and portion calculations.
 */

import { AIService } from './ai-service.js';
import { appState } from './state.js';
import { UIManager } from './ui.js';

export const ScannerManager = {
  videoStream: null,
  currentFacingMode: 'environment', // back camera by default
  capturedBase64: null,
  activeScanData: null,
  basePortionGrams: 100,

  init() {
    this.videoEl = document.getElementById('camera-video');
    this.previewImg = document.getElementById('camera-preview-img');
    this.fileInput = document.getElementById('file-upload-input');
    this.shutterBtn = document.getElementById('btn-camera-shutter');
    this.flipCameraBtn = document.getElementById('btn-flip-camera');
    this.uploadBtn = document.getElementById('btn-trigger-upload');
    this.quickPickContainer = document.getElementById('quick-pick-chips-list');
    this.scanResultContainer = document.getElementById('scan-result-wrapper');
    this.viewfinder = document.getElementById('camera-viewfinder');

    this.bindEvents();
    this.renderSampleChips();
  },

  bindEvents() {
    if (this.shutterBtn) {
      this.shutterBtn.addEventListener('click', () => this.capturePhoto());
    }

    if (this.flipCameraBtn) {
      this.flipCameraBtn.addEventListener('click', () => this.toggleCameraFacing());
    }

    if (this.uploadBtn && this.fileInput) {
      this.uploadBtn.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  },

  // Start Camera Stream
  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      UIManager.showToast('⚠️ Caméra non supportée dans ce navigateur. Utilisez l\'import de photos.', 'warning');
      return;
    }

    this.stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoStream = stream;
      if (this.videoEl) {
        this.videoEl.srcObject = stream;
        this.videoEl.style.display = 'block';
        if (this.previewImg) this.previewImg.style.display = 'none';
        await this.videoEl.play();
      }
    } catch (err) {
      console.warn('Camera stream error or permission denied:', err);
      if (this.videoEl) this.videoEl.style.display = 'none';
      if (this.previewImg) {
        this.previewImg.style.display = 'block';
        this.previewImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23111827" width="100%" height="100%"/><text fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%" y="45%" text-anchor="middle">Caméra en attente ou import photo</text><text fill="%2310b981" font-family="sans-serif" font-size="13" x="50%" y="55%" text-anchor="middle">Cliquez sur un plat d\'exemple ci-dessous pour tester !</text></svg>';
      }
    }
  },

  // Stop Camera Stream
  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  },

  // Toggle Camera facing (front / back)
  toggleCameraFacing() {
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    this.startCamera();
    UIManager.showToast(`Caméra basculée (${this.currentFacingMode === 'environment' ? 'Arrière' : 'Avant'})`);
  },

  // Capture frame from video
  capturePhoto() {
    if (!this.videoEl || this.videoEl.style.display === 'none' || !this.videoStream) {
      // If camera is not active, trigger file upload
      if (this.fileInput) this.fileInput.click();
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.videoEl.videoWidth || 640;
    canvas.height = this.videoEl.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg', 0.85);
    this.displayCapturedPreview(base64Data);
    this.processImageWithAI(base64Data);
  },

  // Handle image file upload
  handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      this.displayCapturedPreview(base64Data);
      this.processImageWithAI(base64Data);
    };
    reader.readAsDataURL(file);
  },

  // Display captured image in viewfinder
  displayCapturedPreview(base64Data) {
    this.stopCamera();
    if (this.videoEl) this.videoEl.style.display = 'none';
    if (this.previewImg) {
      this.previewImg.src = base64Data;
      this.previewImg.style.display = 'block';
    }
    this.capturedBase64 = base64Data;
  },

  // Trigger AI analysis with animated scanner radar HUD
  async processImageWithAI(base64Image, customDataOverride = null) {
    if (this.viewfinder) {
      this.viewfinder.classList.add('scanning-active');
    }

    UIManager.showToast('🔍 Analyse intelligente du plat en cours...', 'info');

    let result;
    if (customDataOverride) {
      await new Promise(r => setTimeout(r, 600));
      result = { success: true, data: customDataOverride, source: 'sample-preset' };
    } else {
      result = await AIService.analyzeFoodImage(base64Image, appState.settings.apiKey);
    }

    if (this.viewfinder) {
      this.viewfinder.classList.remove('scanning-active');
    }

    if (result && result.success && result.data) {
      this.activeScanData = result.data;
      this.basePortionGrams = result.data.portionGrams || 250;
      this.renderScanResult(result.data);
      UIManager.showToast(`✨ Plat détecté: ${result.data.name}`, 'success');
    } else {
      UIManager.showToast('❌ Impossible d\'analyser l\'image. Réessayez.', 'error');
    }
  },

  // Render Sample Quick-Pick Chips
  renderSampleChips() {
    if (!this.quickPickContainer) return;
    const samples = AIService.getSampleFoods();

    this.quickPickContainer.innerHTML = samples.map(sample => `
      <div class="quick-pick-chip" data-sample-id="${sample.id}">
        <span>🍽️</span>
        <span>${sample.name.split(',')[0]}</span>
      </div>
    `).join('');

    this.quickPickContainer.querySelectorAll('.quick-pick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.sampleId;
        const sample = samples.find(s => s.id === id);
        if (sample) {
          // Create a realistic sample visual placeholder
          const svgPreview = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%231a2234" width="100%" height="100%"/><circle fill="%2310b981" opacity="0.2" cx="200" cy="150" r="100"/><text fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="18" x="50%" y="45%" text-anchor="middle">${sample.name.split(',')[0]}</text><text fill="%2310b981" font-family="sans-serif" font-size="14" x="50%" y="60%" text-anchor="middle">${sample.calories} kcal | ${sample.protein}g Protéines</text></svg>`;
          this.displayCapturedPreview(svgPreview);
          this.processImageWithAI(svgPreview, sample);
        }
      });
    });
  },

  // Render Analysis Result Card
  renderScanResult(data) {
    if (!this.scanResultContainer) return;

    const nutriClass = `score-${(data.nutriScore || 'B').toLowerCase()}`;

    this.scanResultContainer.innerHTML = `
      <div class="scan-result-card">
        <div class="scan-result-header">
          <div class="food-title-group">
            <h3 id="res-food-name">${data.name}</h3>
            <p>${data.category || 'Aliment détecté par Vision IA'}</p>
          </div>
          <div class="nutri-score-badge ${nutriClass}" title="Nutri-Score">
            ${data.nutriScore || 'A'}
          </div>
        </div>

        <div class="portion-slider-container">
          <div class="portion-header">
            <span>Taille de la portion</span>
            <span class="portion-val-display" id="res-portion-label">${this.basePortionGrams}g (1 portion)</span>
          </div>
          <input type="range" class="custom-range-slider" id="portion-slider" min="50" max="600" step="10" value="${this.basePortionGrams}">
        </div>

        <div class="scan-macros-breakdown">
          <div class="breakdown-box">
            <span class="label">Calories</span>
            <div class="val text-gradient-primary" id="res-cal-val">${data.calories} kcal</div>
          </div>
          <div class="breakdown-box">
            <span class="label" style="color: var(--macro-protein)">Protéines</span>
            <div class="val" id="res-prot-val">${data.protein}g</div>
          </div>
          <div class="breakdown-box">
            <span class="label" style="color: var(--macro-carbs)">Glucides</span>
            <div class="val" id="res-carb-val">${data.carbs}g</div>
          </div>
        </div>

        <div class="scan-macros-breakdown">
          <div class="breakdown-box">
            <span class="label" style="color: var(--macro-fats)">Lipides</span>
            <div class="val" id="res-fat-val">${data.fats}g</div>
          </div>
          <div class="breakdown-box">
            <span class="label" style="color: var(--macro-sugar)">Sucres</span>
            <div class="val" id="res-sugar-val">${data.sugar || 0}g</div>
          </div>
          <div class="breakdown-box">
            <span class="label" style="color: var(--macro-fiber)">Fibres</span>
            <div class="val" id="res-fiber-val">${data.fiber || 0}g</div>
          </div>
        </div>

        ${data.dietitianAdvice ? `
          <div class="ai-advice-box">
            <h5>💡 Conseil Diététique NutriVision</h5>
            <p>${data.dietitianAdvice}</p>
          </div>
        ` : ''}

        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="btn-primary" id="btn-log-scanned-food">
            <span>➕</span> Ajouter au Journal
          </button>
          <button class="btn-secondary" id="btn-new-scan" style="flex: 0 0 auto; width: auto; padding: 0 16px;">
            <span>📷</span> Nouveau Scan
          </button>
        </div>
      </div>
    `;

    this.scanResultContainer.style.display = 'block';

    // Portion Slider Dynamic Recalculation
    const slider = document.getElementById('portion-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const newWeight = parseInt(e.target.value, 10);
        const scale = newWeight / (this.basePortionGrams || 100);

        document.getElementById('res-portion-label').textContent = `${newWeight}g (${(scale).toFixed(1)}x)`;
        document.getElementById('res-cal-val').textContent = `${Math.round(data.calories * scale)} kcal`;
        document.getElementById('res-prot-val').textContent = `${Math.round(data.protein * scale)}g`;
        document.getElementById('res-carb-val').textContent = `${Math.round(data.carbs * scale)}g`;
        document.getElementById('res-fat-val').textContent = `${Math.round(data.fats * scale)}g`;
        document.getElementById('res-sugar-val').textContent = `${Math.round((data.sugar || 0) * scale)}g`;
        document.getElementById('res-fiber-val').textContent = `${Math.round((data.fiber || 0) * scale)}g`;
      });
    }

    // New Scan button
    const newScanBtn = document.getElementById('btn-new-scan');
    if (newScanBtn) {
      newScanBtn.addEventListener('click', () => {
        this.scanResultContainer.style.display = 'none';
        this.startCamera();
      });
    }

    // Log to Meals button
    const logBtn = document.getElementById('btn-log-scanned-food');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        const sliderVal = parseInt(document.getElementById('portion-slider')?.value || this.basePortionGrams, 10);
        const scale = sliderVal / (this.basePortionGrams || 100);

        UIManager.openMealSelectionModal({
          name: data.name,
          portion: `${sliderVal}g`,
          calories: Math.round(data.calories * scale),
          protein: Math.round(data.protein * scale),
          carbs: Math.round(data.carbs * scale),
          fats: Math.round(data.fats * scale),
          sugar: Math.round((data.sugar || 0) * scale),
          fiber: Math.round((data.fiber || 0) * scale)
        });
      });
    }

    // Smooth scroll down to result
    this.scanResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};
