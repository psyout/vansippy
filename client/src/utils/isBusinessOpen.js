const DAY_ALIASES = {
   sun: 0,
   sunday: 0,
   mon: 1,
   monday: 1,
   tue: 2,
   tues: 2,
   tuesday: 2,
   wed: 3,
   weds: 3,
   wednesday: 3,
   thu: 4,
   thur: 4,
   thurs: 4,
   thursday: 4,
   fri: 5,
   friday: 5,
   sat: 6,
   saturday: 6,
};

const EVERY_DAY_WORDS = new Set([
   "daily",
   "everyday",
   "every day",
   "all week",
   "all days",
]);

const normalizeText = (value) =>
   String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ");

const getHoursEntries = (hours) => {
   if (!hours) return [];
   if (hours instanceof Map) return Array.from(hours.entries());
   if (Array.isArray(hours)) return hours;
   return Object.entries(hours);
};

const getDayNumber = (dayText) => {
   const normalizedDay = normalizeText(dayText).replace(/[^a-z]/g, "");
   return DAY_ALIASES[normalizedDay] ?? null;
};

const getDaysFromLabel = (label) => {
   const normalizedLabel = normalizeText(label);

   const appliesEveryDay = Array.from(EVERY_DAY_WORDS).some(
      (word) =>
         normalizedLabel === word ||
         normalizedLabel.startsWith(`${word},`) ||
         normalizedLabel.startsWith(`${word} `),
   );

   if (appliesEveryDay) {
      return [0, 1, 2, 3, 4, 5, 6];
   }

   const dayMatches = normalizedLabel.match(
      /sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?/g,
   );

   if (!dayMatches?.length) return [];

   const uniqueDays = [...new Set(dayMatches.map(getDayNumber))].filter(
      (day) => day !== null,
   );

   const isRange =
      normalizedLabel.includes("-") ||
      normalizedLabel.includes(" to ") ||
      normalizedLabel.includes(" thru ") ||
      normalizedLabel.includes(" through ");

   if (!isRange || uniqueDays.length < 2) return uniqueDays;

   const [startDay, endDay] = uniqueDays;
   const days = [];
   let day = startDay;

   while (true) {
      days.push(day);
      if (day === endDay) break;
      day = (day + 1) % 7;
   }

   return days;
};

const parseTimeToMinutes = (timeText) => {
   const normalizedTime = normalizeText(timeText).replace(/\./g, "");
   const match = normalizedTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

   if (!match) return null;

   let hours = Number(match[1]);
   const minutes = Number(match[2] || 0);
   const meridiem = match[3];

   if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
      return null;
   }

   if (meridiem === "pm" && hours < 12) hours += 12;
   if (meridiem === "am" && hours === 12) hours = 0;

   if (hours > 23) return null;

   return hours * 60 + minutes;
};

const inferMissingMeridiem = (startText, endText) => {
   const startHasMeridiem = /\b(am|pm)\b/i.test(startText);
   const endMeridiem = endText.match(/\b(am|pm)\b/i)?.[1];

   if (startHasMeridiem || !endMeridiem) return startText;

   return `${startText} ${endMeridiem}`;
};

const parseTimeRange = (rangeText) => {
   const normalizedRange = String(rangeText || "")
      .trim()
      .replace(/[–—]/g, "-");

   if (!normalizedRange || /closed/i.test(normalizedRange)) return null;

   const [rawStart, rawEnd] = normalizedRange.split(/\s*(?:-|to)\s*/i);

   if (!rawStart || !rawEnd) return null;

   const startText = inferMissingMeridiem(rawStart.trim(), rawEnd.trim());
   const start = parseTimeToMinutes(startText);
   const end = parseTimeToMinutes(rawEnd.trim());

   if (start === null || end === null) return null;

   return { start, end };
};

const isCurrentTimeInsideRange = (currentMinutes, { start, end }) => {
   if (start === end) return true;

   if (start < end) {
      return currentMinutes >= start && currentMinutes < end;
   }

   return currentMinutes >= start || currentMinutes < end;
};

export default function isBusinessOpen(hours, currentDate = new Date()) {
   const entries = getHoursEntries(hours);
   const currentDay = currentDate.getDay();
   const currentMinutes =
      currentDate.getHours() * 60 + currentDate.getMinutes();

   const previousDay = (currentDay + 6) % 7;
   let foundRelevantDay = false;
   let hasRecognizedSchedule = false;

   for (const [daysLabel, rangeText] of entries) {
      const days = getDaysFromLabel(daysLabel);
      const matchesToday = days.includes(currentDay);

      if (days.length) hasRecognizedSchedule = true;
      if (matchesToday) foundRelevantDay = true;

      const range = parseTimeRange(rangeText);

      if (!range) continue;

      const isOvernightRange = range.start > range.end;
      const matchesPreviousOvernightDay =
         isOvernightRange &&
         days.includes(previousDay) &&
         currentMinutes < range.end;

      if (!matchesToday && !matchesPreviousOvernightDay) continue;

      if (matchesPreviousOvernightDay) foundRelevantDay = true;

      if (isCurrentTimeInsideRange(currentMinutes, range)) {
         return true;
      }
   }

   return foundRelevantDay || hasRecognizedSchedule ? false : null;
}
