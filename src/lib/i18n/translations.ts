import { Locale } from "./config";

/**
 * English is the source of truth. Every other locale must provide the same
 * keys (enforced by the `Record<TranslationKey, string>` type below).
 *
 * Use `{name}` placeholders for interpolation — see `t()` in the provider.
 */
export const en = {
  // Bottom navigation
  "nav.calendar": "Calendar",
  "nav.history": "History",
  "nav.insights": "Insights",

  // Generic
  "common.cancel": "Cancel",
  "common.delete": "Delete",

  // Language switcher
  "language.label": "Language",

  // Calendar
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.tapHint": "Tap any day to log or remove a period day.",

  // Legend
  "legend.period": "Period",
  "legend.fertile": "Fertile",
  "legend.ovulation": "Ovulation",
  "legend.pms": "PMS",
  "legend.predicted": "Predicted",

  // Current-cycle card
  "cycle.welcomeTitle": "Welcome 🌸",
  "cycle.welcomeBody":
    "Tap a day on the calendar below to log your first period. Your predictions and insights appear once you've logged some data.",
  "cycle.today": "Today",
  "cycle.dayN": "Day {n}",
  "cycle.ofYourCycle": "of your cycle",
  "cycle.untilNextPeriod": "until next period",
  "cycle.periodWord": "period",
  "cycle.late": "{days} late",
  "cycle.avgCycle": "Avg cycle",
  "cycle.nextPeriod": "Next period",

  // History
  "history.title": "History",
  "history.subtitle": "Your past cycles",
  "history.avgCycleLength": "Average cycle length",
  "history.basedOn": "Based on {used} of {cycles}",
  "history.empty":
    "No completed cycles yet. Log at least two periods on the calendar to see your history here.",
  "history.periodLength": "{days} period",
  "history.onAverage": "on average",
  "history.vsAvg": "{sign}{d}d vs avg",

  // Insights
  "insights.title": "Insights",
  "insights.subtitle": "Your cycle at a glance",
  "insights.avgCycle": "Average cycle",
  "insights.avgPeriod": "Average period",
  "insights.shortest": "Shortest cycle",
  "insights.longest": "Longest cycle",
  "insights.daysUnit": "days",
  "insights.regularity": "Cycle regularity",
  "insights.veryRegular": "Very regular",
  "insights.fairlyRegular": "Fairly regular",
  "insights.irregular": "Irregular",
  "insights.spread": "{days} spread between your shortest and longest cycle",
  "insights.basedOnCompleted": "Based on {cycles} completed.",
  "insights.upcoming": "Predicted upcoming periods",
  "insights.clearData": "Clear all data",
  "insights.confirmClear": "Delete all logged periods? This can't be undone.",
  "insights.privacy":
    "Your data is securely synced to the cloud and available on all your devices.",

  // Settings (inside Insights)
  "settings.title": "Settings",
  "settings.signedInAs": "Signed in as",

  // Authentication
  "auth.title": "Sign in",
  "auth.subtitle": "Track your cycle and sync it across all your devices.",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendLink": "Send magic link",
  "auth.sending": "Sending…",
  "auth.checkEmail": "✉️ Check your email and tap the link to sign in",
  "auth.checkEmailHint":
    "The link signs you in automatically — no password needed.",
  "auth.useDifferentEmail": "Use a different email",
  "auth.invalidEmail": "Please enter a valid email address.",
  "auth.sendError": "Couldn't send the link. Please try again.",
  "auth.notConfigured":
    "Supabase isn't configured yet. Add your project URL and anon key to .env.local.",
  "auth.noPassword": "No password — just one tap in your inbox.",
  "auth.loading": "Loading…",
  "auth.signOut": "Sign out",
  "auth.signInWithGoogle": "Sign in with Google",
  "auth.orEmail": "or with email",

  // Sync status
  "sync.syncing": "Syncing…",
  "sync.error": "Offline — changes saved on this device",
  "sync.synced": "All changes synced",

  // Footer
  "footer.madeBy": "made by @vyukio",
} as const;

export type TranslationKey = keyof typeof en;

export const ru: Record<TranslationKey, string> = {
  "nav.calendar": "Календарь",
  "nav.history": "История",
  "nav.insights": "Аналитика",

  "common.cancel": "Отмена",
  "common.delete": "Удалить",

  "language.label": "Язык",

  "calendar.prevMonth": "Предыдущий месяц",
  "calendar.nextMonth": "Следующий месяц",
  "calendar.tapHint": "Нажмите на день, чтобы отметить или убрать день месячных.",

  "legend.period": "Месячные",
  "legend.fertile": "Фертильные",
  "legend.ovulation": "Овуляция",
  "legend.pms": "ПМС",
  "legend.predicted": "Прогноз",

  "cycle.welcomeTitle": "Добро пожаловать 🌸",
  "cycle.welcomeBody":
    "Нажмите на день в календаре ниже, чтобы отметить первые месячные. Прогнозы и аналитика появятся, как только вы внесёте данные.",
  "cycle.today": "Сегодня",
  "cycle.dayN": "День {n}",
  "cycle.ofYourCycle": "вашего цикла",
  "cycle.untilNextPeriod": "до следующих месячных",
  "cycle.periodWord": "месячные",
  "cycle.late": "задержка {days}",
  "cycle.avgCycle": "Средний цикл",
  "cycle.nextPeriod": "Следующие",

  "history.title": "История",
  "history.subtitle": "Ваши прошлые циклы",
  "history.avgCycleLength": "Средняя длина цикла",
  "history.basedOn": "На основе {used} из {cycles}",
  "history.empty":
    "Пока нет завершённых циклов. Отметьте хотя бы две менструации в календаре, чтобы увидеть историю здесь.",
  "history.periodLength": "Менструация: {days}",
  "history.onAverage": "как в среднем",
  "history.vsAvg": "{sign}{d}д от среднего",

  "insights.title": "Аналитика",
  "insights.subtitle": "Ваш цикл вкратце",
  "insights.avgCycle": "Средний цикл",
  "insights.avgPeriod": "Средние месячные",
  "insights.shortest": "Самый короткий",
  "insights.longest": "Самый длинный",
  "insights.daysUnit": "дн.",
  "insights.regularity": "Регулярность цикла",
  "insights.veryRegular": "Очень регулярный",
  "insights.fairlyRegular": "Довольно регулярный",
  "insights.irregular": "Нерегулярный",
  "insights.spread":
    "разница {days} между самым коротким и длинным циклом",
  "insights.basedOnCompleted": "На основе {cycles}.",
  "insights.upcoming": "Прогноз следующих месячных",
  "insights.clearData": "Удалить все данные",
  "insights.confirmClear":
    "Удалить все записи о месячных? Это нельзя отменить.",
  "insights.privacy":
    "Ваши данные надёжно синхронизируются с облаком и доступны на всех устройствах.",

  "settings.title": "Настройки",
  "settings.signedInAs": "Вы вошли как",

  "auth.title": "Вход",
  "auth.subtitle": "Отслеживайте цикл и синхронизируйте его на всех устройствах.",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendLink": "Отправить ссылку",
  "auth.sending": "Отправляем…",
  "auth.checkEmail": "✉️ Проверьте почту и нажмите на ссылку для входа",
  "auth.checkEmailHint":
    "Ссылка выполнит вход автоматически — пароль не нужен.",
  "auth.useDifferentEmail": "Другой адрес",
  "auth.invalidEmail": "Введите корректный адрес электронной почты.",
  "auth.sendError": "Не удалось отправить ссылку. Попробуйте ещё раз.",
  "auth.notConfigured":
    "Supabase ещё не настроен. Добавьте URL проекта и anon-ключ в .env.local.",
  "auth.noPassword": "Без пароля — один тап в письме.",
  "auth.loading": "Загрузка…",
  "auth.signOut": "Выйти",
  "auth.signInWithGoogle": "Войти через Google",
  "auth.orEmail": "или по email",

  "sync.syncing": "Синхронизация…",
  "sync.error": "Офлайн — изменения сохранены на устройстве",
  "sync.synced": "Все изменения синхронизированы",

  "footer.madeBy": "создано @vyukio",
};

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ru,
};

/** Single-letter / short weekday labels (week starts on Sunday). */
export const WEEKDAYS: Record<Locale, string[]> = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
};
