/**
 * NutriVision AI - Local Storage & Data Persistence Helper
 */

export const StorageHelper = {
  // Export all user data as JSON file backup
  exportUserData() {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: JSON.parse(localStorage.getItem('nutrivision_profile_v1') || '{}'),
      settings: JSON.parse(localStorage.getItem('nutrivision_settings_v1') || '{}'),
      mealPlan: JSON.parse(localStorage.getItem('nutrivision_mealplan_v1') || '{}')
    };

    // Grab all daily logs
    const logs = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutrivision_daily_logs_v1_')) {
        logs[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    backup.logs = logs;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutrivision_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Clear all data (Reset app)
  resetAllData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutrivision_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }
};
