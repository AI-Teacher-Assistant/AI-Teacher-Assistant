/**
 * free-trial.js — Trial counter UI helpers
 * Member 1: Frontend (Sunaina)
 */

export const trial = {
  /**
   * Update the sidebar trial badge.
   * @param {number} used  - generations used
   * @param {number} limit - total allowed (default 5)
   */
  updateBadge(used, limit = 5) {
    const badge    = document.getElementById('trialBadge');
    const bar      = document.getElementById('trialBar');
    const countEl  = document.getElementById('trialCount');

    if (!badge) return;

    const pct = Math.min((used / limit) * 100, 100);
    bar.style.width   = `${pct}%`;
    countEl.textContent = `${used} / ${limit} generations used`;

    badge.classList.remove('warn', 'exhausted');
    if (used >= limit)      badge.classList.add('exhausted');
    else if (used >= limit - 1) badge.classList.add('warn');
  },

  /** True when user has hit their limit */
  isExhausted(used, limit = 5) { return used >= limit; },

  /** Show the upgrade modal */
  showUpgradeModal() {
    document.getElementById('upgradeModal')?.classList.add('show');
  },

  /** Hide the upgrade modal */
  hideUpgradeModal() {
    document.getElementById('upgradeModal')?.classList.remove('show');
  },
};
