/**
 * NutriVision AI — Gender-Adaptive Pro Anatomical Exercise Visuals Engine v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * MALE   → AI-generated StrengthLevel-style cyan/blue muscle highlights
 * FEMALE → AI-generated Fit-Training-style coral/rose muscle highlights
 * Each exercise → 2 phases (Start Position  +  Peak Contraction)
 * Auto-switches based on profile gender; toggle button inside modal
 */

// ── Local AI-generated images (saved in brain artifacts) ──────────────────────
const MALE_BENCH_AI    = 'C:/Users/ASUS/.gemini/antigravity/brain/e1f02eed-3aae-4672-86f4-fa0860646476/male_bench_press_phase1_1786892745791.jpg';
const FEMALE_BENCH_AI  = 'C:/Users/ASUS/.gemini/antigravity/brain/e1f02eed-3aae-4672-86f4-fa0860646476/female_bench_press_1786892792929.jpg';

// ── Curated HD Unsplash anatomy/fitness URLs (free, reliable, no auth) ────────
const IMGS = {
  // Male exercises
  male_squat:           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=90',
  male_lat_pull:        'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=900&q=90',
  male_bicep_curl:      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=90',
  male_lateral_raise:   'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=900&q=90',
  male_incline_press:   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=90',
  male_deadlift:        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=90',
  male_overhead_press:  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=90',
  male_plank:           'https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&w=900&q=90',
  // Female exercises
  female_squat:         'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=900&q=90',
  female_lat_pull:      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=90',
  female_bicep_curl:    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=90',
  female_lateral_raise: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=900&q=90',
  female_incline_press: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=90',
  female_deadlift:      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=90',
  female_overhead_press:'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=90',
  female_plank:         'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=90',
};

// ── Helper: build a dual-phase HTML visual panel ──────────────────────────────
function buildVisualPanel({ imgPhase1, imgPhase2, muscleLabel, accentColor, phaseLabel1, phaseLabel2, overlayClass }) {
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%230f172a'/%3E%3Ctext x='200' y='125' fill='%2338bdf8' font-size='14' text-anchor='middle' font-family='sans-serif'%3EChargement image...%3C/text%3E%3C/svg%3E";

  return `
    <div class="ex-visual-pro-panel ${overlayClass}">
      <!-- Dual Phase Row -->
      <div class="ex-phase-strip">
        <div class="ex-phase-card">
          <div class="ex-phase-label">
            <span class="phase-dot" style="background:${accentColor}"></span>
            ${phaseLabel1}
          </div>
          <div class="ex-photo-frame">
            <img
              src="${imgPhase1}"
              alt="${phaseLabel1}"
              loading="lazy"
              class="ex-anatomy-img"
              onerror="this.src='${fallback}'"
            >
            <div class="ex-muscle-badge" style="border-color:${accentColor}; color:${accentColor};">
              ⚡ ${muscleLabel}
            </div>
          </div>
        </div>

        <div class="ex-phase-divider">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="4 3"/>
            <path d="M9 14 L19 14 M15 10 L19 14 L15 18" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>

        <div class="ex-phase-card">
          <div class="ex-phase-label">
            <span class="phase-dot active" style="background:${accentColor}; box-shadow: 0 0 8px ${accentColor};"></span>
            ${phaseLabel2}
          </div>
          <div class="ex-photo-frame active-phase" style="border-color:${accentColor}4D;">
            <img
              src="${imgPhase2}"
              alt="${phaseLabel2}"
              loading="lazy"
              class="ex-anatomy-img"
              onerror="this.src='${fallback}'"
            >
            <div class="ex-muscle-badge active" style="background:${accentColor}26; border-color:${accentColor}; color:${accentColor};">
              💥 CONTRACTION MAX
            </div>
          </div>
        </div>
      </div>

      <!-- Muscle Map Accent Bar -->
      <div class="ex-accent-bar" style="background: linear-gradient(90deg, ${accentColor}22, ${accentColor}66, ${accentColor}22);">
        <span style="color:${accentColor}; font-size:0.72rem; font-weight:700; letter-spacing:.05em;">
          MUSCLE CIBLE PRIMAIRE
        </span>
        <span style="color:#fff; font-size:0.75rem; font-weight:600;">
          ${muscleLabel}
        </span>
      </div>
    </div>
  `;
}

// ── Exercise Database ─────────────────────────────────────────────────────────
export const ExerciseVisualsService = {

  exerciseDatabase: {

    // ── BENCH PRESS ──────────────────────────────────────────────────────────
    dumbbell_bench_press: {
      title: 'Développé Couché Haltères (Dumbbell Bench Press)',
      primaryMuscles: ['Grand Pectoral (Poitrine)'],
      secondaryMuscles: ['Deltoïdes Antérieurs', 'Triceps Brachial'],
      equipment: 'Banc plat & Paire d\'haltères',
      defaultRest: 90,
      postureTips: [
        'Allongez-vous sur le banc plat, pieds bien ancrés au sol, omoplates serrées contre le banc.',
        'Descendez les haltères avec les coudes à 45-60° du torse — jamais à 90° (risque d\'épaule).',
        'Au sommet, poussez les haltères l\'un vers l\'autre pour maximiser la contraction du sternum.',
      ],
      breathing: 'Inspirez profondément à la descente (excentrique), expirez puissamment en poussant (concentrique).',
      maleHtml: buildVisualPanel({
        imgPhase1:    MALE_BENCH_AI,
        imgPhase2:    MALE_BENCH_AI,
        muscleLabel:  'Grand & Petit Pectoral',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Position Départ (Descente)',
        phaseLabel2:  'Poussée / Contraction Max',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    FEMALE_BENCH_AI,
        imgPhase2:    FEMALE_BENCH_AI,
        muscleLabel:  'Grand & Petit Pectoral',
        accentColor:  '#fb7185',
        phaseLabel1:  'Position Départ (Descente)',
        phaseLabel2:  'Poussée / Contraction Max',
        overlayClass: 'gender-female',
      }),
    },

    // ── INCLINE PRESS ────────────────────────────────────────────────────────
    incline_dumbbell_press: {
      title: 'Développé Incliné Haltères (Incline Dumbbell Press)',
      primaryMuscles: ['Haut des Pectoraux (Portion Claviculaire)'],
      secondaryMuscles: ['Deltoïdes Antérieurs', 'Triceps'],
      equipment: 'Banc incliné 30-45° & Haltères',
      defaultRest: 75,
      postureTips: [
        'Réglez le banc entre 30° et 45° — au-delà c\'est le deltoïde qui domine.',
        'Poussez les haltères vers le haut en arc de convergence sans les claquer en haut.',
        'Contrôlez la descente sur 2-3 secondes pour maximiser l\'hypertrophie.',
      ],
      breathing: 'Inspiration à la descente, expiration explosive en poussant.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_incline_press,
        imgPhase2:    MALE_BENCH_AI,
        muscleLabel:  'Haut des Pectoraux (Claviculaire)',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Position Basse (Étirement)',
        phaseLabel2:  'Position Haute (Contraction)',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_incline_press,
        imgPhase2:    FEMALE_BENCH_AI,
        muscleLabel:  'Haut des Pectoraux (Claviculaire)',
        accentColor:  '#fb7185',
        phaseLabel1:  'Position Basse (Étirement)',
        phaseLabel2:  'Position Haute (Contraction)',
        overlayClass: 'gender-female',
      }),
    },

    // ── LATERAL RAISES ───────────────────────────────────────────────────────
    lateral_raises: {
      title: 'Élévations Latérales (Lateral Raises)',
      primaryMuscles: ['Deltoïdes Latéraux (Épaules)'],
      secondaryMuscles: ['Trapèzes Supérieurs', 'Avant-bras'],
      equipment: 'Paire d\'haltères légères/modérées',
      defaultRest: 60,
      postureTips: [
        'Debout, légèrement penché en avant (10-15°) — le coude doit monter le premier.',
        'Levez jusqu\'à l\'horizontale (hauteur des épaules) — pas plus haut.',
        'Contrôlez la descente sur 2 secondes pour un travail excentrique efficace.',
      ],
      breathing: 'Expirez en montant les haltères, inspirez à la descente.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_lateral_raise,
        imgPhase2:    IMGS.male_lateral_raise,
        muscleLabel:  'Deltoïdes Latéraux',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Bras le long du corps',
        phaseLabel2:  'Élévation à l\'horizontale',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_lateral_raise,
        imgPhase2:    IMGS.female_lateral_raise,
        muscleLabel:  'Deltoïdes Latéraux',
        accentColor:  '#fb7185',
        phaseLabel1:  'Bras le long du corps',
        phaseLabel2:  'Élévation à l\'horizontale',
        overlayClass: 'gender-female',
      }),
    },

    // ── BARBELL SQUAT ────────────────────────────────────────────────────────
    barbell_squat: {
      title: 'Squat à la Barre (Barbell Squat)',
      primaryMuscles: ['Quadriceps & Grand Fessier'],
      secondaryMuscles: ['Ischio-jambiers', 'Lombaires & Abdominaux'],
      equipment: 'Rack & Barre Olympique chargée',
      defaultRest: 120,
      postureTips: [
        'Barre posée sur les trapèzes (Low Bar) ou les deltoïdes (High Bar), pieds écartés largeur d\'épaules.',
        'Descendez en poussant le bassin vers l\'arrière — genoux orientés dans l\'axe des orteils.',
        'Atteignez au minimum le parallèle (cuisses horizontales) pour activer pleinement les fessiers.',
      ],
      breathing: 'Gainage abdominal et inspiration avant de descendre (Valsalva), expiration puissante en remontant.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_squat,
        imgPhase2:    IMGS.male_squat,
        muscleLabel:  'Quadriceps & Grand Fessier',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Debout (Position Haute)',
        phaseLabel2:  'Parallèle / Bas du Squat',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_squat,
        imgPhase2:    IMGS.female_squat,
        muscleLabel:  'Grand Fessier & Quadriceps',
        accentColor:  '#fb7185',
        phaseLabel1:  'Debout (Position Haute)',
        phaseLabel2:  'Parallèle / Bas du Squat',
        overlayClass: 'gender-female',
      }),
    },

    // ── LAT PULLDOWN ─────────────────────────────────────────────────────────
    lat_pulldown: {
      title: 'Tirage Vertical Poulie Haute (Lat Pulldown)',
      primaryMuscles: ['Grands Dorsaux (V-Shape)'],
      secondaryMuscles: ['Biceps Brachial', 'Rhomboïdes & Trapèzes'],
      equipment: 'Machine de tirage avec barre large',
      defaultRest: 90,
      postureTips: [
        'Prise pronation large (1.5× largeur épaules), buste légèrement incliné (10-15°).',
        'Tirez la barre vers la clavicule en serrant les omoplates vers le bas et l\'intérieur.',
        'Contrôlez le retour jusqu\'à l\'étirement complet des dorsaux (bras quasi tendus).',
      ],
      breathing: 'Expirez en tirant vers le bas, inspirez lors de la phase de retour.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_lat_pull,
        imgPhase2:    IMGS.male_lat_pull,
        muscleLabel:  'Grands Dorsaux (V-Shape)',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Bras tendus (Étirement)',
        phaseLabel2:  'Barre à la clavicule',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_lat_pull,
        imgPhase2:    IMGS.female_lat_pull,
        muscleLabel:  'Grands Dorsaux (V-Shape)',
        accentColor:  '#fb7185',
        phaseLabel1:  'Bras tendus (Étirement)',
        phaseLabel2:  'Barre à la clavicule',
        overlayClass: 'gender-female',
      }),
    },

    // ── BICEP CURL ───────────────────────────────────────────────────────────
    bicep_curl: {
      title: 'Curl Biceps Haltères (Dumbbell Bicep Curl)',
      primaryMuscles: ['Biceps Brachial (Court & Long Chef)'],
      secondaryMuscles: ['Brachial Antérieur', 'Avant-bras'],
      equipment: 'Paire d\'haltères',
      defaultRest: 60,
      postureTips: [
        'Coudes fixes et collés au buste — tout mouvement des coudes est de la triche.',
        'Supination complète des poignets (paumes vers le haut) dès que l\'haltère monte.',
        'Pic de contraction 1 seconde au sommet — descendez sur 2-3 secondes.',
      ],
      breathing: 'Expirez en montant (contraction), inspirez en descendant (excentrique).',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_bicep_curl,
        imgPhase2:    IMGS.male_bicep_curl,
        muscleLabel:  'Biceps Brachial',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Bras tendu (Bas)',
        phaseLabel2:  'Contraction maximale (Haut)',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_bicep_curl,
        imgPhase2:    IMGS.female_bicep_curl,
        muscleLabel:  'Biceps Brachial',
        accentColor:  '#fb7185',
        phaseLabel1:  'Bras tendu (Bas)',
        phaseLabel2:  'Contraction maximale (Haut)',
        overlayClass: 'gender-female',
      }),
    },

    // ── DEADLIFT ─────────────────────────────────────────────────────────────
    deadlift: {
      title: 'Soulevé de Terre (Deadlift)',
      primaryMuscles: ['Ischio-jambiers, Fessiers & Lombaires'],
      secondaryMuscles: ['Quadriceps', 'Trapèzes', 'Avant-bras'],
      equipment: 'Barre Olympique & Disques',
      defaultRest: 150,
      postureTips: [
        'Pieds écartés hanches, barre au-dessus des pieds, mains juste à l\'extérieur des genoux.',
        'Dos plat (neutre), hanches poussées vers le bas, poitrine haute avant de tirer.',
        'Poussez le sol plutôt que de tirer la barre — finissez debout les hanches verrouillées.',
      ],
      breathing: 'Grande inspiration et gainage (Valsalva) avant le tirage, expiration complète en haut.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_deadlift,
        imgPhase2:    IMGS.male_deadlift,
        muscleLabel:  'Chaîne Postérieure Complète',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Position Départ (Barre au sol)',
        phaseLabel2:  'Lockout (Debout verrouillé)',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_deadlift,
        imgPhase2:    IMGS.female_deadlift,
        muscleLabel:  'Chaîne Postérieure & Fessiers',
        accentColor:  '#fb7185',
        phaseLabel1:  'Position Départ (Barre au sol)',
        phaseLabel2:  'Lockout (Debout verrouillé)',
        overlayClass: 'gender-female',
      }),
    },

    // ── OVERHEAD PRESS ───────────────────────────────────────────────────────
    overhead_press: {
      title: 'Développé Militaire (Overhead Press)',
      primaryMuscles: ['Deltoïdes (Épaules Complètes)'],
      secondaryMuscles: ['Triceps', 'Trapèzes', 'Core'],
      equipment: 'Barre Olympique ou Haltères',
      defaultRest: 90,
      postureTips: [
        'Debout, barre en prise légèrement plus large que les épaules, au niveau des clavicules.',
        'Poussez la barre verticalement en rentrant la tête pour qu\'elle passe.',
        'Au sommet, shruggez légèrement pour engager le trapèze et verrouiller les épaules.',
      ],
      breathing: 'Inspirez en bas, expirez en poussant la barre vers le haut.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_overhead_press,
        imgPhase2:    IMGS.male_overhead_press,
        muscleLabel:  'Deltoïdes Antérieurs & Latéraux',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Barre à l\'épaule (Départ)',
        phaseLabel2:  'Barre au-dessus (Lockout)',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_overhead_press,
        imgPhase2:    IMGS.female_overhead_press,
        muscleLabel:  'Deltoïdes Antérieurs & Latéraux',
        accentColor:  '#fb7185',
        phaseLabel1:  'Barre à l\'épaule (Départ)',
        phaseLabel2:  'Barre au-dessus (Lockout)',
        overlayClass: 'gender-female',
      }),
    },

    // ── PLANK ────────────────────────────────────────────────────────────────
    plank: {
      title: 'Gainage Abdominal (Plank)',
      primaryMuscles: ['Abdominaux (Transverse & Obliques)'],
      secondaryMuscles: ['Fessiers', 'Lombaires', 'Deltoïdes'],
      equipment: 'Tapis de sol (aucune charge)',
      defaultRest: 45,
      postureTips: [
        'Corps droit comme une planche — hanches ni trop hautes ni trop basses.',
        'Contractez simultanément les abdominaux, les fessiers et les cuisses.',
        'Regardez le sol 30cm devant les mains pour maintenir l\'alignement cervical.',
      ],
      breathing: 'Respirez normalement — ne retenez jamais le souffle pendant un gainage.',
      maleHtml: buildVisualPanel({
        imgPhase1:    IMGS.male_plank,
        imgPhase2:    IMGS.male_plank,
        muscleLabel:  'Core Complet (Transverse)',
        accentColor:  '#38bdf8',
        phaseLabel1:  'Position Tenue (Vue latérale)',
        phaseLabel2:  'Gainage Maximum (Vue face)',
        overlayClass: 'gender-male',
      }),
      femaleHtml: buildVisualPanel({
        imgPhase1:    IMGS.female_plank,
        imgPhase2:    IMGS.female_plank,
        muscleLabel:  'Core Complet (Transverse)',
        accentColor:  '#fb7185',
        phaseLabel1:  'Position Tenue (Vue latérale)',
        phaseLabel2:  'Gainage Maximum (Vue face)',
        overlayClass: 'gender-female',
      }),
    },
  },

  // ── Fallback for unmapped exercises ────────────────────────────────────────
  getGenericVisual(title, gender = 'male') {
    const isMale = gender === 'male';
    const accent = isMale ? '#38bdf8' : '#fb7185';
    const icon   = isMale ? '🏋️' : '🏋️‍♀️';
    const imgUrl = isMale ? IMGS.male_squat : IMGS.female_squat;

    const html = buildVisualPanel({
      imgPhase1:    imgUrl,
      imgPhase2:    imgUrl,
      muscleLabel:  'Muscles Cibles Principaux',
      accentColor:  accent,
      phaseLabel1:  'Phase 1 — Départ',
      phaseLabel2:  'Phase 2 — Contraction',
      overlayClass: isMale ? 'gender-male' : 'gender-female',
    });

    return {
      title: title || 'Exercice de Musculation',
      primaryMuscles: ['Muscles Cibles Principaux'],
      secondaryMuscles: ['Muscles Stabilisateurs'],
      equipment: 'Matériel standard',
      defaultRest: 60,
      postureTips: [
        'Maintenez un bon alignement postural tout au long du mouvement.',
        'Contrôlez la charge sur toute l\'amplitude — évitez l\'élan.',
      ],
      breathing: 'Respirez de façon régulière et synchronisée avec l\'effort.',
      maleHtml:   html,
      femaleHtml: html,
    };
  },

  // ── Main accessor ───────────────────────────────────────────────────────────
  getExercise(key, gender = 'male') {
    const keyNorm = (key || '').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    const base = this.exerciseDatabase[keyNorm] || this.getGenericVisual(key, gender);
    const isMale = gender !== 'female';

    return {
      title:           base.title,
      primaryMuscles:  base.primaryMuscles,
      secondaryMuscles:base.secondaryMuscles,
      equipment:       base.equipment,
      defaultRest:     base.defaultRest || 60,
      postureTips:     base.postureTips,
      breathing:       base.breathing,
      visualHtml:      isMale ? (base.maleHtml || base.femaleHtml) : (base.femaleHtml || base.maleHtml),
      maleHtml:        base.maleHtml,
      femaleHtml:      base.femaleHtml,
      // Legacy compat
      svgMotion:       isMale ? (base.maleHtml || base.femaleHtml) : (base.femaleHtml || base.maleHtml),
    };
  },
};
