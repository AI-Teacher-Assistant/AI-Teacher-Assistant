/**
 * Middleware to enforce the 2-month free trial on server-side protected actions
 * (e.g. AI generation, PDF export, document creation)
 */
const requireActiveTrial = (req, res, next) => {
  const teacher = req.teacher;

  if (!teacher) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const isValid = typeof teacher.isTrialValid === 'function'
    ? teacher.isTrialValid()
    : Boolean(teacher.isTrialActive && new Date() <= new Date(teacher.trialEndDate));

  const daysRemaining = typeof teacher.getDaysRemaining === 'function'
    ? teacher.getDaysRemaining()
    : Math.max(0, Math.ceil((new Date(teacher.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)));

  if (!isValid || daysRemaining <= 0) {
    return res.status(403).json({
      success: false,
      message: 'Your 2-month free trial has expired. Please upgrade your plan to continue generating and exporting content.',
      trial: {
        isExpired: true,
        daysRemaining: 0,
        endDate: teacher.trialEndDate
      }
    });
  }

  req.trial = {
    isActive: true,
    daysRemaining,
    endDate: teacher.trialEndDate
  };

  next();
};

module.exports = { requireActiveTrial };
