(function (undefined) {
  var moment, VERSION = '2.4.0', round = Math.round, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, hasModule = typeof module !== 'undefined' && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{1,4}/, parseTokenSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, isoRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d:?\d\d|Z)?)?$/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoDates = [
      'YYYY-MM-DD',
      'GGGG-[W]WW',
      'GGGG-[W]WW-E',
      'YYYY-DDD'
    ], isoTimes = [
      [
        'HH:mm:ss.SSSS',
        /(T| )\d\d:\d\d:\d\d\.\d{1,3}/
      ],
      [
        'HH:mm:ss',
        /(T| )\d\d:\d\d:\d\d/
      ],
      [
        'HH:mm',
        /(T| )\d\d:\d\d/
      ],
      [
        'HH',
        /(T| )\d\d/
      ]
    ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
      'Milliseconds': 1,
      'Seconds': 1000,
      'Minutes': 60000,
      'Hours': 3600000,
      'Days': 86400000,
      'Months': 2592000000,
      'Years': 31536000000
    }, unitAliases = {
      ms: 'millisecond',
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      D: 'date',
      w: 'week',
      W: 'isoWeek',
      M: 'month',
      y: 'year',
      DDD: 'dayOfYear',
      e: 'weekday',
      E: 'isoWeekday',
      gg: 'weekYear',
      GG: 'isoWeekYear'
    }, camelFunctions = {
      dayofyear: 'dayOfYear',
      isoweekday: 'isoWeekday',
      isoweek: 'isoWeek',
      weekyear: 'weekYear',
      isoweekyear: 'isoWeekYear'
    }, formatFunctions = {}, ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
      M: function () {
        return this.month() + 1;
      },
      MMM: function (format) {
        return this.lang().monthsShort(this, format);
      },
      MMMM: function (format) {
        return this.lang().months(this, format);
      },
      D: function () {
        return this.date();
      },
      DDD: function () {
        return this.dayOfYear();
      },
      d: function () {
        return this.day();
      },
      dd: function (format) {
        return this.lang().weekdaysMin(this, format);
      },
      ddd: function (format) {
        return this.lang().weekdaysShort(this, format);
      },
      dddd: function (format) {
        return this.lang().weekdays(this, format);
      },
      w: function () {
        return this.week();
      },
      W: function () {
        return this.isoWeek();
      },
      YY: function () {
        return leftZeroFill(this.year() % 100, 2);
      },
      YYYY: function () {
        return leftZeroFill(this.year(), 4);
      },
      YYYYY: function () {
        return leftZeroFill(this.year(), 5);
      },
      gg: function () {
        return leftZeroFill(this.weekYear() % 100, 2);
      },
      gggg: function () {
        return this.weekYear();
      },
      ggggg: function () {
        return leftZeroFill(this.weekYear(), 5);
      },
      GG: function () {
        return leftZeroFill(this.isoWeekYear() % 100, 2);
      },
      GGGG: function () {
        return this.isoWeekYear();
      },
      GGGGG: function () {
        return leftZeroFill(this.isoWeekYear(), 5);
      },
      e: function () {
        return this.weekday();
      },
      E: function () {
        return this.isoWeekday();
      },
      a: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), true);
      },
      A: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), false);
      },
      H: function () {
        return this.hours();
      },
      h: function () {
        return this.hours() % 12 || 12;
      },
      m: function () {
        return this.minutes();
      },
      s: function () {
        return this.seconds();
      },
      S: function () {
        return toInt(this.milliseconds() / 100);
      },
      SS: function () {
        return leftZeroFill(toInt(this.milliseconds() / 10), 2);
      },
      SSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      SSSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      Z: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
      },
      ZZ: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(10 * a / 6), 4);
      },
      z: function () {
        return this.zoneAbbr();
      },
      zz: function () {
        return this.zoneName();
      },
      X: function () {
        return this.unix();
      }
    }, lists = [
      'months',
      'monthsShort',
      'weekdays',
      'weekdaysShort',
      'weekdaysMin'
    ];
  function padToken(func, count) {
    return function (a) {
      return leftZeroFill(func.call(this, a), count);
    };
  }
  function ordinalizeToken(func, period) {
    return function (a) {
      return this.lang().ordinal(func.call(this, a), period);
    };
  }
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop();
    formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  function Language() {
  }
  function Moment(config) {
    checkOverflow(config);
    extend(this, config);
  }
  function Duration(duration) {
    var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
    this._input = duration;
    this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
    this._days = +days + weeks * 7;
    this._months = +months + years * 12;
    this._data = {};
    this._bubble();
  }
  function extend(a, b) {
    for (var i in b) {
      if (b.hasOwnProperty(i)) {
        a[i] = b[i];
      }
    }
    if (b.hasOwnProperty('toString')) {
      a.toString = b.toString;
    }
    if (b.hasOwnProperty('valueOf')) {
      a.valueOf = b.valueOf;
    }
    return a;
  }
  function absRound(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }
  function leftZeroFill(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return output;
  }
  function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
    var milliseconds = duration._milliseconds, days = duration._days, months = duration._months, minutes, hours;
    if (milliseconds) {
      mom._d.setTime(+mom._d + milliseconds * isAdding);
    }
    if (days || months) {
      minutes = mom.minute();
      hours = mom.hour();
    }
    if (days) {
      mom.date(mom.date() + days * isAdding);
    }
    if (months) {
      mom.month(mom.month() + months * isAdding);
    }
    if (milliseconds && !ignoreUpdateOffset) {
      moment.updateOffset(mom);
    }
    if (days || months) {
      mom.minute(minutes);
      mom.hour(hours);
    }
  }
  function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }
  function isDate(input) {
    return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
  }
  function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
    for (i = 0; i < len; i++) {
      if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
        diffs++;
      }
    }
    return diffs + lengthDiff;
  }
  function normalizeUnits(units) {
    if (units) {
      var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
      units = unitAliases[units] || camelFunctions[lowered] || lowered;
    }
    return units;
  }
  function normalizeObjectUnits(inputObject) {
    var normalizedInput = {}, normalizedProp, prop, index;
    for (prop in inputObject) {
      if (inputObject.hasOwnProperty(prop)) {
        normalizedProp = normalizeUnits(prop);
        if (normalizedProp) {
          normalizedInput[normalizedProp] = inputObject[prop];
        }
      }
    }
    return normalizedInput;
  }
  function makeList(field) {
    var count, setter;
    if (field.indexOf('week') === 0) {
      count = 7;
      setter = 'day';
    } else if (field.indexOf('month') === 0) {
      count = 12;
      setter = 'month';
    } else {
      return;
    }
    moment[field] = function (format, index) {
      var i, getter, method = moment.fn._lang[field], results = [];
      if (typeof format === 'number') {
        index = format;
        format = undefined;
      }
      getter = function (i) {
        var m = moment().utc().set(setter, i);
        return method.call(moment.fn._lang, m, format || '');
      };
      if (index != null) {
        return getter(index);
      } else {
        for (i = 0; i < count; i++) {
          results.push(getter(i));
        }
        return results;
      }
    };
  }
  function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion, value = 0;
    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      if (coercedNumber >= 0) {
        value = Math.floor(coercedNumber);
      } else {
        value = Math.ceil(coercedNumber);
      }
    }
    return value;
  }
  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }
  function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }
  function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  function checkOverflow(m) {
    var overflow;
    if (m._a && m._pf.overflow === -2) {
      overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
      if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
        overflow = DATE;
      }
      m._pf.overflow = overflow;
    }
  }
  function initializeParsingFlags(config) {
    config._pf = {
      empty: false,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: false,
      invalidMonth: null,
      invalidFormat: false,
      userInvalidated: false,
      iso: false
    };
  }
  function isValid(m) {
    if (m._isValid == null) {
      m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
      if (m._strict) {
        m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
      }
    }
    return m._isValid;
  }
  function normalizeLanguage(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
  }
  extend(Language.prototype, {
    set: function (config) {
      var prop, i;
      for (i in config) {
        prop = config[i];
        if (typeof prop === 'function') {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
    },
    _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    months: function (m) {
      return this._months[m.month()];
    },
    _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    monthsShort: function (m) {
      return this._monthsShort[m.month()];
    },
    monthsParse: function (monthName) {
      var i, mom, regex;
      if (!this._monthsParse) {
        this._monthsParse = [];
      }
      for (i = 0; i < 12; i++) {
        if (!this._monthsParse[i]) {
          mom = moment.utc([
            2000,
            i
          ]);
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdays: function (m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysShort: function (m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    weekdaysMin: function (m) {
      return this._weekdaysMin[m.day()];
    },
    weekdaysParse: function (weekdayName) {
      var i, mom, regex;
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
      }
      for (i = 0; i < 7; i++) {
        if (!this._weekdaysParse[i]) {
          mom = moment([
            2000,
            1
          ]).day(i);
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat: {
      LT: 'h:mm A',
      L: 'MM/DD/YYYY',
      LL: 'MMMM D YYYY',
      LLL: 'MMMM D YYYY LT',
      LLLL: 'dddd, MMMM D YYYY LT'
    },
    longDateFormat: function (key) {
      var output = this._longDateFormat[key];
      if (!output && this._longDateFormat[key.toUpperCase()]) {
        output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
          return val.slice(1);
        });
        this._longDateFormat[key] = output;
      }
      return output;
    },
    isPM: function (input) {
      return (input + '').toLowerCase().charAt(0) === 'p';
    },
    _meridiemParse: /[ap]\.?m?\.?/i,
    meridiem: function (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    },
    _calendar: {
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      nextWeek: 'dddd [at] LT',
      lastDay: '[Yesterday at] LT',
      lastWeek: '[Last] dddd [at] LT',
      sameElse: 'L'
    },
    calendar: function (key, mom) {
      var output = this._calendar[key];
      return typeof output === 'function' ? output.apply(mom) : output;
    },
    _relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'a few seconds',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years'
    },
    relativeTime: function (number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    },
    pastFuture: function (diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
      return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    },
    ordinal: function (number) {
      return this._ordinal.replace('%d', number);
    },
    _ordinal: '%d',
    preparse: function (string) {
      return string;
    },
    postformat: function (string) {
      return string;
    },
    week: function (mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week: {
      dow: 0,
      doy: 6
    },
    _invalidDate: 'Invalid date',
    invalidDate: function () {
      return this._invalidDate;
    }
  });
  function loadLang(key, values) {
    values.abbr = key;
    if (!languages[key]) {
      languages[key] = new Language();
    }
    languages[key].set(values);
    return languages[key];
  }
  function unloadLang(key) {
    delete languages[key];
  }
  function getLangDefinition(key) {
    var i = 0, j, lang, next, split, get = function (k) {
        if (!languages[k] && hasModule) {
          try {
            require('./lang/' + k);
          } catch (e) {
          }
        }
        return languages[k];
      };
    if (!key) {
      return moment.fn._lang;
    }
    if (!isArray(key)) {
      lang = get(key);
      if (lang) {
        return lang;
      }
      key = [key];
    }
    while (i < key.length) {
      split = normalizeLanguage(key[i]).split('-');
      j = split.length;
      next = normalizeLanguage(key[i + 1]);
      next = next ? next.split('-') : null;
      while (j > 0) {
        lang = get(split.slice(0, j).join('-'));
        if (lang) {
          return lang;
        }
        if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
          break;
        }
        j--;
      }
      i++;
    }
    return moment.fn._lang;
  }
  function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
      return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
  }
  function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;
    for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
        array[i] = formatTokenFunctions[array[i]];
      } else {
        array[i] = removeFormattingTokens(array[i]);
      }
    }
    return function (mom) {
      var output = '';
      for (i = 0; i < length; i++) {
        output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
      }
      return output;
    };
  }
  function formatMoment(m, format) {
    if (!m.isValid()) {
      return m.lang().invalidDate();
    }
    format = expandFormat(format, m.lang());
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format);
    }
    return formatFunctions[format](m);
  }
  function expandFormat(format, lang) {
    var i = 5;
    function replaceLongDateFormatTokens(input) {
      return lang.longDateFormat(input) || input;
    }
    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
      localFormattingTokens.lastIndex = 0;
      i -= 1;
    }
    return format;
  }
  function getParseRegexForToken(token, config) {
    var a;
    switch (token) {
    case 'DDDD':
      return parseTokenThreeDigits;
    case 'YYYY':
    case 'GGGG':
    case 'gggg':
      return parseTokenFourDigits;
    case 'YYYYY':
    case 'GGGGG':
    case 'ggggg':
      return parseTokenSixDigits;
    case 'S':
    case 'SS':
    case 'SSS':
    case 'DDD':
      return parseTokenOneToThreeDigits;
    case 'MMM':
    case 'MMMM':
    case 'dd':
    case 'ddd':
    case 'dddd':
      return parseTokenWord;
    case 'a':
    case 'A':
      return getLangDefinition(config._l)._meridiemParse;
    case 'X':
      return parseTokenTimestampMs;
    case 'Z':
    case 'ZZ':
      return parseTokenTimezone;
    case 'T':
      return parseTokenT;
    case 'SSSS':
      return parseTokenDigits;
    case 'MM':
    case 'DD':
    case 'YY':
    case 'GG':
    case 'gg':
    case 'HH':
    case 'hh':
    case 'mm':
    case 'ss':
    case 'M':
    case 'D':
    case 'd':
    case 'H':
    case 'h':
    case 'm':
    case 's':
    case 'w':
    case 'ww':
    case 'W':
    case 'WW':
    case 'e':
    case 'E':
      return parseTokenOneOrTwoDigits;
    default:
      a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
      return a;
    }
  }
  function timezoneMinutesFromString(string) {
    var tzchunk = (parseTokenTimezone.exec(string) || [])[0], parts = (tzchunk + '').match(parseTimezoneChunker) || [
        '-',
        0,
        0
      ], minutes = +(parts[1] * 60) + toInt(parts[2]);
    return parts[0] === '+' ? -minutes : minutes;
  }
  function addTimeToArrayFromToken(token, input, config) {
    var a, datePartArray = config._a;
    switch (token) {
    case 'M':
    case 'MM':
      if (input != null) {
        datePartArray[MONTH] = toInt(input) - 1;
      }
      break;
    case 'MMM':
    case 'MMMM':
      a = getLangDefinition(config._l).monthsParse(input);
      if (a != null) {
        datePartArray[MONTH] = a;
      } else {
        config._pf.invalidMonth = input;
      }
      break;
    case 'D':
    case 'DD':
      if (input != null) {
        datePartArray[DATE] = toInt(input);
      }
      break;
    case 'DDD':
    case 'DDDD':
      if (input != null) {
        config._dayOfYear = toInt(input);
      }
      break;
    case 'YY':
      datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
      break;
    case 'YYYY':
    case 'YYYYY':
      datePartArray[YEAR] = toInt(input);
      break;
    case 'a':
    case 'A':
      config._isPm = getLangDefinition(config._l).isPM(input);
      break;
    case 'H':
    case 'HH':
    case 'h':
    case 'hh':
      datePartArray[HOUR] = toInt(input);
      break;
    case 'm':
    case 'mm':
      datePartArray[MINUTE] = toInt(input);
      break;
    case 's':
    case 'ss':
      datePartArray[SECOND] = toInt(input);
      break;
    case 'S':
    case 'SS':
    case 'SSS':
    case 'SSSS':
      datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
      break;
    case 'X':
      config._d = new Date(parseFloat(input) * 1000);
      break;
    case 'Z':
    case 'ZZ':
      config._useUTC = true;
      config._tzm = timezoneMinutesFromString(input);
      break;
    case 'w':
    case 'ww':
    case 'W':
    case 'WW':
    case 'd':
    case 'dd':
    case 'ddd':
    case 'dddd':
    case 'e':
    case 'E':
      token = token.substr(0, 1);
    case 'gg':
    case 'gggg':
    case 'GG':
    case 'GGGG':
    case 'GGGGG':
      token = token.substr(0, 2);
      if (input) {
        config._w = config._w || {};
        config._w[token] = input;
      }
      break;
    }
  }
  function dateFromConfig(config) {
    var i, date, input = [], currentDate, yearToUse, fixYear, w, temp, lang, weekday, week;
    if (config._d) {
      return;
    }
    currentDate = currentDateArray(config);
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
      fixYear = function (val) {
        return val ? val.length < 3 ? parseInt(val, 10) > 68 ? '19' + val : '20' + val : val : config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR];
      };
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
      } else {
        lang = getLangDefinition(config._l);
        weekday = w.d != null ? parseWeekday(w.d, lang) : w.e != null ? parseInt(w.e, 10) + lang._week.dow : 0;
        week = parseInt(w.w, 10) || 1;
        if (w.d != null && weekday < lang._week.dow) {
          week++;
        }
        temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
      }
      config._a[YEAR] = temp.year;
      config._dayOfYear = temp.dayOfYear;
    }
    if (config._dayOfYear) {
      yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];
      if (config._dayOfYear > daysInYear(yearToUse)) {
        config._pf._overflowDayOfYear = true;
      }
      date = makeUTCDate(yearToUse, 0, config._dayOfYear);
      config._a[MONTH] = date.getUTCMonth();
      config._a[DATE] = date.getUTCDate();
    }
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
      config._a[i] = input[i] = currentDate[i];
    }
    for (; i < 7; i++) {
      config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
    }
    input[HOUR] += toInt((config._tzm || 0) / 60);
    input[MINUTE] += toInt((config._tzm || 0) % 60);
    config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
  }
  function dateFromObject(config) {
    var normalizedInput;
    if (config._d) {
      return;
    }
    normalizedInput = normalizeObjectUnits(config._i);
    config._a = [
      normalizedInput.year,
      normalizedInput.month,
      normalizedInput.day,
      normalizedInput.hour,
      normalizedInput.minute,
      normalizedInput.second,
      normalizedInput.millisecond
    ];
    dateFromConfig(config);
  }
  function currentDateArray(config) {
    var now = new Date();
    if (config._useUTC) {
      return [
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ];
    } else {
      return [
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ];
    }
  }
  function makeDateFromStringAndFormat(config) {
    config._a = [];
    config._pf.empty = true;
    var lang = getLangDefinition(config._l), string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
    tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      parsedInput = (getParseRegexForToken(token, config).exec(string) || [])[0];
      if (parsedInput) {
        skipped = string.substr(0, string.indexOf(parsedInput));
        if (skipped.length > 0) {
          config._pf.unusedInput.push(skipped);
        }
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
        totalParsedInputLength += parsedInput.length;
      }
      if (formatTokenFunctions[token]) {
        if (parsedInput) {
          config._pf.empty = false;
        } else {
          config._pf.unusedTokens.push(token);
        }
        addTimeToArrayFromToken(token, parsedInput, config);
      } else if (config._strict && !parsedInput) {
        config._pf.unusedTokens.push(token);
      }
    }
    config._pf.charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
      config._pf.unusedInput.push(string);
    }
    if (config._isPm && config._a[HOUR] < 12) {
      config._a[HOUR] += 12;
    }
    if (config._isPm === false && config._a[HOUR] === 12) {
      config._a[HOUR] = 0;
    }
    dateFromConfig(config);
    checkOverflow(config);
  }
  function unescapeFormat(s) {
    return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
      return p1 || p2 || p3 || p4;
    });
  }
  function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  function makeDateFromStringAndArray(config) {
    var tempConfig, bestMoment, scoreToBeat, i, currentScore;
    if (config._f.length === 0) {
      config._pf.invalidFormat = true;
      config._d = new Date(NaN);
      return;
    }
    for (i = 0; i < config._f.length; i++) {
      currentScore = 0;
      tempConfig = extend({}, config);
      initializeParsingFlags(tempConfig);
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      if (!isValid(tempConfig)) {
        continue;
      }
      currentScore += tempConfig._pf.charsLeftOver;
      currentScore += tempConfig._pf.unusedTokens.length * 10;
      tempConfig._pf.score = currentScore;
      if (scoreToBeat == null || currentScore < scoreToBeat) {
        scoreToBeat = currentScore;
        bestMoment = tempConfig;
      }
    }
    extend(config, bestMoment || tempConfig);
  }
  function makeDateFromString(config) {
    var i, string = config._i, match = isoRegex.exec(string);
    if (match) {
      config._pf.iso = true;
      for (i = 4; i > 0; i--) {
        if (match[i]) {
          config._f = isoDates[i - 1] + (match[6] || ' ');
          break;
        }
      }
      for (i = 0; i < 4; i++) {
        if (isoTimes[i][1].exec(string)) {
          config._f += isoTimes[i][0];
          break;
        }
      }
      if (parseTokenTimezone.exec(string)) {
        config._f += 'Z';
      }
      makeDateFromStringAndFormat(config);
    } else {
      config._d = new Date(string);
    }
  }
  function makeDateFromInput(config) {
    var input = config._i, matched = aspNetJsonRegex.exec(input);
    if (input === undefined) {
      config._d = new Date();
    } else if (matched) {
      config._d = new Date(+matched[1]);
    } else if (typeof input === 'string') {
      makeDateFromString(config);
    } else if (isArray(input)) {
      config._a = input.slice(0);
      dateFromConfig(config);
    } else if (isDate(input)) {
      config._d = new Date(+input);
    } else if (typeof input === 'object') {
      dateFromObject(config);
    } else {
      config._d = new Date(input);
    }
  }
  function makeDate(y, m, d, h, M, s, ms) {
    var date = new Date(y, m, d, h, M, s, ms);
    if (y < 1970) {
      date.setFullYear(y);
    }
    return date;
  }
  function makeUTCDate(y) {
    var date = new Date(Date.UTC.apply(null, arguments));
    if (y < 1970) {
      date.setUTCFullYear(y);
    }
    return date;
  }
  function parseWeekday(input, language) {
    if (typeof input === 'string') {
      if (!isNaN(input)) {
        input = parseInt(input, 10);
      } else {
        input = language.weekdaysParse(input);
        if (typeof input !== 'number') {
          return null;
        }
      }
    }
    return input;
  }
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
    return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  function relativeTime(milliseconds, withoutSuffix, lang) {
    var seconds = round(Math.abs(milliseconds) / 1000), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < 45 && [
        's',
        seconds
      ] || minutes === 1 && ['m'] || minutes < 45 && [
        'mm',
        minutes
      ] || hours === 1 && ['h'] || hours < 22 && [
        'hh',
        hours
      ] || days === 1 && ['d'] || days <= 25 && [
        'dd',
        days
      ] || days <= 45 && ['M'] || days < 345 && [
        'MM',
        round(days / 30)
      ] || years === 1 && ['y'] || [
        'yy',
        years
      ];
    args[2] = withoutSuffix;
    args[3] = milliseconds > 0;
    args[4] = lang;
    return substituteTimeAgo.apply({}, args);
  }
  function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
    var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
    if (daysToDayOfWeek > end) {
      daysToDayOfWeek -= 7;
    }
    if (daysToDayOfWeek < end - 7) {
      daysToDayOfWeek += 7;
    }
    adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
    return {
      week: Math.ceil(adjustedMoment.dayOfYear() / 7),
      year: adjustedMoment.year()
    };
  }
  function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
    var d = new Date(Date.UTC(year, 0)).getUTCDay(), daysToAdd, dayOfYear;
    weekday = weekday != null ? weekday : firstDayOfWeek;
    daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0);
    dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
    return {
      year: dayOfYear > 0 ? year : year - 1,
      dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
    };
  }
  function makeMoment(config) {
    var input = config._i, format = config._f;
    if (typeof config._pf === 'undefined') {
      initializeParsingFlags(config);
    }
    if (input === null) {
      return moment.invalid({ nullInput: true });
    }
    if (typeof input === 'string') {
      config._i = input = getLangDefinition().preparse(input);
    }
    if (moment.isMoment(input)) {
      config = extend({}, input);
      config._d = new Date(+input._d);
    } else if (format) {
      if (isArray(format)) {
        makeDateFromStringAndArray(config);
      } else {
        makeDateFromStringAndFormat(config);
      }
    } else {
      makeDateFromInput(config);
    }
    return new Moment(config);
  }
  moment = function (input, format, lang, strict) {
    if (typeof lang === 'boolean') {
      strict = lang;
      lang = undefined;
    }
    return makeMoment({
      _i: input,
      _f: format,
      _l: lang,
      _strict: strict,
      _isUTC: false
    });
  };
  moment.utc = function (input, format, lang, strict) {
    var m;
    if (typeof lang === 'boolean') {
      strict = lang;
      lang = undefined;
    }
    m = makeMoment({
      _useUTC: true,
      _isUTC: true,
      _l: lang,
      _i: input,
      _f: format,
      _strict: strict
    }).utc();
    return m;
  };
  moment.unix = function (input) {
    return moment(input * 1000);
  };
  moment.duration = function (input, key) {
    var isDuration = moment.isDuration(input), isNumber = typeof input === 'number', duration = isDuration ? input._input : isNumber ? {} : input, match = null, sign, ret, parseIso, timeEmpty, dateTimeEmpty;
    if (isNumber) {
      if (key) {
        duration[key] = input;
      } else {
        duration.milliseconds = input;
      }
    } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      duration = {
        y: 0,
        d: toInt(match[DATE]) * sign,
        h: toInt(match[HOUR]) * sign,
        m: toInt(match[MINUTE]) * sign,
        s: toInt(match[SECOND]) * sign,
        ms: toInt(match[MILLISECOND]) * sign
      };
    } else if (!!(match = isoDurationRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      parseIso = function (inp) {
        var res = inp && parseFloat(inp.replace(',', '.'));
        return (isNaN(res) ? 0 : res) * sign;
      };
      duration = {
        y: parseIso(match[2]),
        M: parseIso(match[3]),
        d: parseIso(match[4]),
        h: parseIso(match[5]),
        m: parseIso(match[6]),
        s: parseIso(match[7]),
        w: parseIso(match[8])
      };
    }
    ret = new Duration(duration);
    if (isDuration && input.hasOwnProperty('_lang')) {
      ret._lang = input._lang;
    }
    return ret;
  };
  moment.version = VERSION;
  moment.defaultFormat = isoFormat;
  moment.updateOffset = function () {
  };
  moment.lang = function (key, values) {
    var r;
    if (!key) {
      return moment.fn._lang._abbr;
    }
    if (values) {
      loadLang(normalizeLanguage(key), values);
    } else if (values === null) {
      unloadLang(key);
      key = 'en';
    } else if (!languages[key]) {
      getLangDefinition(key);
    }
    r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    return r._abbr;
  };
  moment.langData = function (key) {
    if (key && key._lang && key._lang._abbr) {
      key = key._lang._abbr;
    }
    return getLangDefinition(key);
  };
  moment.isMoment = function (obj) {
    return obj instanceof Moment;
  };
  moment.isDuration = function (obj) {
    return obj instanceof Duration;
  };
  for (i = lists.length - 1; i >= 0; --i) {
    makeList(lists[i]);
  }
  moment.normalizeUnits = function (units) {
    return normalizeUnits(units);
  };
  moment.invalid = function (flags) {
    var m = moment.utc(NaN);
    if (flags != null) {
      extend(m._pf, flags);
    } else {
      m._pf.userInvalidated = true;
    }
    return m;
  };
  moment.parseZone = function (input) {
    return moment(input).parseZone();
  };
  extend(moment.fn = Moment.prototype, {
    clone: function () {
      return moment(this);
    },
    valueOf: function () {
      return +this._d + (this._offset || 0) * 60000;
    },
    unix: function () {
      return Math.floor(+this / 1000);
    },
    toString: function () {
      return this.clone().lang('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    },
    toDate: function () {
      return this._offset ? new Date(+this) : this._d;
    },
    toISOString: function () {
      return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    },
    toArray: function () {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hours(),
        m.minutes(),
        m.seconds(),
        m.milliseconds()
      ];
    },
    isValid: function () {
      return isValid(this);
    },
    isDSTShifted: function () {
      if (this._a) {
        return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
      }
      return false;
    },
    parsingFlags: function () {
      return extend({}, this._pf);
    },
    invalidAt: function () {
      return this._pf.overflow;
    },
    utc: function () {
      return this.zone(0);
    },
    local: function () {
      this.zone(0);
      this._isUTC = false;
      return this;
    },
    format: function (inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, 1);
      return this;
    },
    subtract: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, -1);
      return this;
    },
    diff: function (input, units, asFloat) {
      var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(), zoneDiff = (this.zone() - that.zone()) * 60000, diff, output;
      units = normalizeUnits(units);
      if (units === 'year' || units === 'month') {
        diff = (this.daysInMonth() + that.daysInMonth()) * 43200000;
        output = (this.year() - that.year()) * 12 + (this.month() - that.month());
        output += (this - moment(this).startOf('month') - (that - moment(that).startOf('month'))) / diff;
        output -= (this.zone() - moment(this).startOf('month').zone() - (that.zone() - moment(that).startOf('month').zone())) * 60000 / diff;
        if (units === 'year') {
          output = output / 12;
        }
      } else {
        diff = this - that;
        output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? (diff - zoneDiff) / 86400000 : units === 'week' ? (diff - zoneDiff) / 604800000 : diff;
      }
      return asFloat ? output : absRound(output);
    },
    from: function (time, withoutSuffix) {
      return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
    },
    fromNow: function (withoutSuffix) {
      return this.from(moment(), withoutSuffix);
    },
    calendar: function () {
      var diff = this.diff(moment().zone(this.zone()).startOf('day'), 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
      return this.format(this.lang().calendar(format, this));
    },
    isLeapYear: function () {
      return isLeapYear(this.year());
    },
    isDST: function () {
      return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
    },
    day: function (input) {
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      if (input != null) {
        input = parseWeekday(input, this.lang());
        return this.add({ d: input - day });
      } else {
        return day;
      }
    },
    month: function (input) {
      var utc = this._isUTC ? 'UTC' : '', dayOfMonth;
      if (input != null) {
        if (typeof input === 'string') {
          input = this.lang().monthsParse(input);
          if (typeof input !== 'number') {
            return this;
          }
        }
        dayOfMonth = this.date();
        this.date(1);
        this._d['set' + utc + 'Month'](input);
        this.date(Math.min(dayOfMonth, this.daysInMonth()));
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + 'Month']();
      }
    },
    startOf: function (units) {
      units = normalizeUnits(units);
      switch (units) {
      case 'year':
        this.month(0);
      case 'month':
        this.date(1);
      case 'week':
      case 'isoWeek':
      case 'day':
        this.hours(0);
      case 'hour':
        this.minutes(0);
      case 'minute':
        this.seconds(0);
      case 'second':
        this.milliseconds(0);
      }
      if (units === 'week') {
        this.weekday(0);
      } else if (units === 'isoWeek') {
        this.isoWeekday(1);
      }
      return this;
    },
    endOf: function (units) {
      units = normalizeUnits(units);
      return this.startOf(units).add(units === 'isoWeek' ? 'week' : units, 1).subtract('ms', 1);
    },
    isAfter: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) > +moment(input).startOf(units);
    },
    isBefore: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) < +moment(input).startOf(units);
    },
    isSame: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) === +moment(input).startOf(units);
    },
    min: function (other) {
      other = moment.apply(null, arguments);
      return other < this ? this : other;
    },
    max: function (other) {
      other = moment.apply(null, arguments);
      return other > this ? this : other;
    },
    zone: function (input) {
      var offset = this._offset || 0;
      if (input != null) {
        if (typeof input === 'string') {
          input = timezoneMinutesFromString(input);
        }
        if (Math.abs(input) < 16) {
          input = input * 60;
        }
        this._offset = input;
        this._isUTC = true;
        if (offset !== input) {
          addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
        }
      } else {
        return this._isUTC ? offset : this._d.getTimezoneOffset();
      }
      return this;
    },
    zoneAbbr: function () {
      return this._isUTC ? 'UTC' : '';
    },
    zoneName: function () {
      return this._isUTC ? 'Coordinated Universal Time' : '';
    },
    parseZone: function () {
      if (typeof this._i === 'string') {
        this.zone(this._i);
      }
      return this;
    },
    hasAlignedHourOffset: function (input) {
      if (!input) {
        input = 0;
      } else {
        input = moment(input).zone();
      }
      return (this.zone() - input) % 60 === 0;
    },
    daysInMonth: function () {
      return daysInMonth(this.year(), this.month());
    },
    dayOfYear: function (input) {
      var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
      return input == null ? dayOfYear : this.add('d', input - dayOfYear);
    },
    weekYear: function (input) {
      var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
      return input == null ? year : this.add('y', input - year);
    },
    isoWeekYear: function (input) {
      var year = weekOfYear(this, 1, 4).year;
      return input == null ? year : this.add('y', input - year);
    },
    week: function (input) {
      var week = this.lang().week(this);
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    isoWeek: function (input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    weekday: function (input) {
      var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
      return input == null ? weekday : this.add('d', input - weekday);
    },
    isoWeekday: function (input) {
      return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units]();
    },
    set: function (units, value) {
      units = normalizeUnits(units);
      if (typeof this[units] === 'function') {
        this[units](value);
      }
      return this;
    },
    lang: function (key) {
      if (key === undefined) {
        return this._lang;
      } else {
        this._lang = getLangDefinition(key);
        return this;
      }
    }
  });
  function makeGetterAndSetter(name, key) {
    moment.fn[name] = moment.fn[name + 's'] = function (input) {
      var utc = this._isUTC ? 'UTC' : '';
      if (input != null) {
        this._d['set' + utc + key](input);
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + key]();
      }
    };
  }
  for (i = 0; i < proxyGettersAndSetters.length; i++) {
    makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
  }
  makeGetterAndSetter('year', 'FullYear');
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.toJSON = moment.fn.toISOString;
  extend(moment.duration.fn = Duration.prototype, {
    _bubble: function () {
      var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years;
      data.milliseconds = milliseconds % 1000;
      seconds = absRound(milliseconds / 1000);
      data.seconds = seconds % 60;
      minutes = absRound(seconds / 60);
      data.minutes = minutes % 60;
      hours = absRound(minutes / 60);
      data.hours = hours % 24;
      days += absRound(hours / 24);
      data.days = days % 30;
      months += absRound(days / 30);
      data.months = months % 12;
      years = absRound(months / 12);
      data.years = years;
    },
    weeks: function () {
      return absRound(this.days() / 7);
    },
    valueOf: function () {
      return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
    },
    humanize: function (withSuffix) {
      var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
      if (withSuffix) {
        output = this.lang().pastFuture(difference, output);
      }
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds += dur._milliseconds;
      this._days += dur._days;
      this._months += dur._months;
      this._bubble();
      return this;
    },
    subtract: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds -= dur._milliseconds;
      this._days -= dur._days;
      this._months -= dur._months;
      this._bubble();
      return this;
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units.toLowerCase() + 's']();
    },
    as: function (units) {
      units = normalizeUnits(units);
      return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
    },
    lang: moment.fn.lang,
    toIsoString: function () {
      var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
      if (!this.asSeconds()) {
        return 'P0D';
      }
      return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
    }
  });
  function makeDurationGetter(name) {
    moment.duration.fn[name] = function () {
      return this._data[name];
    };
  }
  function makeDurationAsGetter(name, factor) {
    moment.duration.fn['as' + name] = function () {
      return +this / factor;
    };
  }
  for (i in unitMillisecondFactors) {
    if (unitMillisecondFactors.hasOwnProperty(i)) {
      makeDurationAsGetter(i, unitMillisecondFactors[i]);
      makeDurationGetter(i.toLowerCase());
    }
  }
  makeDurationAsGetter('Weeks', 604800000);
  moment.duration.fn.asMonths = function () {
    return (+this - this.years() * 31536000000) / 2592000000 + this.years() * 12;
  };
  moment.lang('en', {
    ordinal: function (number) {
      var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
      return number + output;
    }
  });
  function makeGlobal(deprecate) {
    var warned = false, local_moment = moment;
    if (typeof ender !== 'undefined') {
      return;
    }
    if (deprecate) {
      this.moment = function () {
        if (!warned && console && console.warn) {
          warned = true;
          console.warn('Accessing Moment through the global scope is ' + 'deprecated, and will be removed in an upcoming ' + 'release.');
        }
        return local_moment.apply(null, arguments);
      };
    } else {
      this['moment'] = moment;
    }
  }
  if (hasModule) {
    module.exports = moment;
    makeGlobal(true);
  } else if (typeof define === 'function' && define.amd) {
    define('moment', function (require, exports, module) {
      if (module.config().noGlobal !== true) {
        makeGlobal(module.config().noGlobal === undefined);
      }
      return moment;
    });
  } else {
    makeGlobal();
  }
}.call(this));
(function (window, document, undefined) {
  'use strict';
  function minErr(module) {
    return function () {
      var code = arguments[0], prefix = '[' + (module ? module + ':' : '') + code + '] ', template = arguments[1], templateArgs = arguments, stringify = function (obj) {
          if (isFunction(obj)) {
            return obj.toString().replace(/ \{[\s\S]*$/, '');
          } else if (isUndefined(obj)) {
            return 'undefined';
          } else if (!isString(obj)) {
            return JSON.stringify(obj);
          }
          return obj;
        }, message, i;
      message = prefix + template.replace(/\{\d+\}/g, function (match) {
        var index = +match.slice(1, -1), arg;
        if (index + 2 < templateArgs.length) {
          arg = templateArgs[index + 2];
          if (isFunction(arg)) {
            return arg.toString().replace(/ ?\{[\s\S]*$/, '');
          } else if (isUndefined(arg)) {
            return 'undefined';
          } else if (!isString(arg)) {
            return toJson(arg);
          }
          return arg;
        }
        return match;
      });
      message = message + '\nhttp://errors.angularjs.org/' + version.full + '/' + (module ? module + '/' : '') + code;
      for (i = 2; i < arguments.length; i++) {
        message = message + (i == 2 ? '?' : '&') + 'p' + (i - 2) + '=' + encodeURIComponent(stringify(arguments[i]));
      }
      return new Error(message);
    };
  }
  var lowercase = function (string) {
    return isString(string) ? string.toLowerCase() : string;
  };
  var uppercase = function (string) {
    return isString(string) ? string.toUpperCase() : string;
  };
  var manualLowercase = function (s) {
    return isString(s) ? s.replace(/[A-Z]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) | 32);
    }) : s;
  };
  var manualUppercase = function (s) {
    return isString(s) ? s.replace(/[a-z]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) & ~32);
    }) : s;
  };
  if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
  }
  var msie, jqLite, jQuery, slice = [].slice, push = [].push, toString = Object.prototype.toString, ngMinErr = minErr('ng'), _angular = window.angular, angular = window.angular || (window.angular = {}), angularModule, nodeName_, uid = [
      '0',
      '0',
      '0'
    ];
  msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
  if (isNaN(msie)) {
    msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
  }
  function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
      return false;
    }
    var length = obj.length;
    if (obj.nodeType === 1 && length) {
      return true;
    }
    return isString(obj) || isArray(obj) || length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj;
  }
  function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isArrayLike(obj)) {
        for (key = 0; key < obj.length; key++)
          iterator.call(context, obj[key], key);
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  }
  function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys.sort();
  }
  function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
  }
  function reverseParams(iteratorFn) {
    return function (value, key) {
      iteratorFn(key, value);
    };
  }
  function nextUid() {
    var index = uid.length;
    var digit;
    while (index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  }
  function setHashKey(obj, h) {
    if (h) {
      obj.$$hashKey = h;
    } else {
      delete obj.$$hashKey;
    }
  }
  function extend(dst) {
    var h = dst.$$hashKey;
    forEach(arguments, function (obj) {
      if (obj !== dst) {
        forEach(obj, function (value, key) {
          dst[key] = value;
        });
      }
    });
    setHashKey(dst, h);
    return dst;
  }
  function int(str) {
    return parseInt(str, 10);
  }
  function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, { prototype: parent }))(), extra);
  }
  function noop() {
  }
  noop.$inject = [];
  function identity($) {
    return $;
  }
  identity.$inject = [];
  function valueFn(value) {
    return function () {
      return value;
    };
  }
  function isUndefined(value) {
    return typeof value == 'undefined';
  }
  function isDefined(value) {
    return typeof value != 'undefined';
  }
  function isObject(value) {
    return value != null && typeof value == 'object';
  }
  function isString(value) {
    return typeof value == 'string';
  }
  function isNumber(value) {
    return typeof value == 'number';
  }
  function isDate(value) {
    return toString.apply(value) == '[object Date]';
  }
  function isArray(value) {
    return toString.apply(value) == '[object Array]';
  }
  function isFunction(value) {
    return typeof value == 'function';
  }
  function isRegExp(value) {
    return toString.apply(value) == '[object RegExp]';
  }
  function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  }
  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }
  function isFile(obj) {
    return toString.apply(obj) === '[object File]';
  }
  function isBoolean(value) {
    return typeof value == 'boolean';
  }
  var trim = function () {
      if (!String.prototype.trim) {
        return function (value) {
          return isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value;
        };
      }
      return function (value) {
        return isString(value) ? value.trim() : value;
      };
    }();
  function isElement(node) {
    return node && (node.nodeName || node.on && node.find);
  }
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  if (msie < 9) {
    nodeName_ = function (element) {
      element = element.nodeName ? element : element[0];
      return element.scopeName && element.scopeName != 'HTML' ? uppercase(element.scopeName + ':' + element.nodeName) : element.nodeName;
    };
  } else {
    nodeName_ = function (element) {
      return element.nodeName ? element.nodeName : element[0].nodeName;
    };
  }
  function map(obj, iterator, context) {
    var results = [];
    forEach(obj, function (value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  }
  function size(obj, ownPropsOnly) {
    var size = 0, key;
    if (isArray(obj) || isString(obj)) {
      return obj.length;
    } else if (isObject(obj)) {
      for (key in obj)
        if (!ownPropsOnly || obj.hasOwnProperty(key))
          size++;
    }
    return size;
  }
  function includes(array, obj) {
    return indexOf(array, obj) != -1;
  }
  function indexOf(array, obj) {
    if (array.indexOf)
      return array.indexOf(obj);
    for (var i = 0; i < array.length; i++) {
      if (obj === array[i])
        return i;
    }
    return -1;
  }
  function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >= 0)
      array.splice(index, 1);
    return value;
  }
  function isLeafNode(node) {
    if (node) {
      switch (node.nodeName) {
      case 'OPTION':
      case 'PRE':
      case 'TITLE':
        return true;
      }
    }
    return false;
  }
  function copy(source, destination) {
    if (isWindow(source) || isScope(source)) {
      throw ngMinErr('cpws', 'Can\'t copy! Making copies of Window or Scope instances is not supported.');
    }
    if (!destination) {
      destination = source;
      if (source) {
        if (isArray(source)) {
          destination = copy(source, []);
        } else if (isDate(source)) {
          destination = new Date(source.getTime());
        } else if (isRegExp(source)) {
          destination = new RegExp(source.source);
        } else if (isObject(source)) {
          destination = copy(source, {});
        }
      }
    } else {
      if (source === destination)
        throw ngMinErr('cpi', 'Can\'t copy! Source and destination are identical.');
      if (isArray(source)) {
        destination.length = 0;
        for (var i = 0; i < source.length; i++) {
          destination.push(copy(source[i]));
        }
      } else {
        var h = destination.$$hashKey;
        forEach(destination, function (value, key) {
          delete destination[key];
        });
        for (var key in source) {
          destination[key] = copy(source[key]);
        }
        setHashKey(destination, h);
      }
    }
    return destination;
  }
  function shallowCopy(src, dst) {
    dst = dst || {};
    for (var key in src) {
      if (src.hasOwnProperty(key) && key.substr(0, 2) !== '$$') {
        dst[key] = src[key];
      }
    }
    return dst;
  }
  function equals(o1, o2) {
    if (o1 === o2)
      return true;
    if (o1 === null || o2 === null)
      return false;
    if (o1 !== o1 && o2 !== o2)
      return true;
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2))
            return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!equals(o1[key], o2[key]))
                return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          return isDate(o2) && o1.getTime() == o2.getTime();
        } else if (isRegExp(o1) && isRegExp(o2)) {
          return o1.toString() == o2.toString();
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2))
            return false;
          keySet = {};
          for (key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key]))
              continue;
            if (!equals(o1[key], o2[key]))
              return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !isFunction(o2[key]))
              return false;
          }
          return true;
        }
      }
    }
    return false;
  }
  function concat(array1, array2, index) {
    return array1.concat(slice.call(array2, index));
  }
  function sliceArgs(args, startIndex) {
    return slice.call(args, startIndex || 0);
  }
  function bind(self, fn) {
    var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
    if (isFunction(fn) && !(fn instanceof RegExp)) {
      return curryArgs.length ? function () {
        return arguments.length ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0))) : fn.apply(self, curryArgs);
      } : function () {
        return arguments.length ? fn.apply(self, arguments) : fn.call(self);
      };
    } else {
      return fn;
    }
  }
  function toJsonReplacer(key, value) {
    var val = value;
    if (typeof key === 'string' && key.charAt(0) === '$') {
      val = undefined;
    } else if (isWindow(value)) {
      val = '$WINDOW';
    } else if (value && document === value) {
      val = '$DOCUMENT';
    } else if (isScope(value)) {
      val = '$SCOPE';
    }
    return val;
  }
  function toJson(obj, pretty) {
    if (typeof obj === 'undefined')
      return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
  }
  function fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  }
  function toBoolean(value) {
    if (value && value.length !== 0) {
      var v = lowercase('' + value);
      value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
    } else {
      value = false;
    }
    return value;
  }
  function startingTag(element) {
    element = jqLite(element).clone();
    try {
      element.html('');
    } catch (e) {
    }
    var TEXT_NODE = 3;
    var elemHtml = jqLite('<div>').append(element).html();
    try {
      return element[0].nodeType === TEXT_NODE ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function (match, nodeName) {
        return '<' + lowercase(nodeName);
      });
    } catch (e) {
      return lowercase(elemHtml);
    }
  }
  function tryDecodeURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
    }
  }
  function parseKeyValue(keyValue) {
    var obj = {}, key_value, key;
    forEach((keyValue || '').split('&'), function (keyValue) {
      if (keyValue) {
        key_value = keyValue.split('=');
        key = tryDecodeURIComponent(key_value[0]);
        if (isDefined(key)) {
          var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
          if (!obj[key]) {
            obj[key] = val;
          } else if (isArray(obj[key])) {
            obj[key].push(val);
          } else {
            obj[key] = [
              obj[key],
              val
            ];
          }
        }
      }
    });
    return obj;
  }
  function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function (value, key) {
      if (isArray(value)) {
        forEach(value, function (arrayValue) {
          parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
        });
      } else {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
      }
    });
    return parts.length ? parts.join('&') : '';
  }
  function encodeUriSegment(val) {
    return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
  }
  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
  }
  function angularInit(element, bootstrap) {
    var elements = [element], appElement, module, names = [
        'ng:app',
        'ng-app',
        'x-ng-app',
        'data-ng-app'
      ], NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;
    function append(element) {
      element && elements.push(element);
    }
    forEach(names, function (name) {
      names[name] = true;
      append(document.getElementById(name));
      name = name.replace(':', '\\:');
      if (element.querySelectorAll) {
        forEach(element.querySelectorAll('.' + name), append);
        forEach(element.querySelectorAll('.' + name + '\\:'), append);
        forEach(element.querySelectorAll('[' + name + ']'), append);
      }
    });
    forEach(elements, function (element) {
      if (!appElement) {
        var className = ' ' + element.className + ' ';
        var match = NG_APP_CLASS_REGEXP.exec(className);
        if (match) {
          appElement = element;
          module = (match[2] || '').replace(/\s+/g, ',');
        } else {
          forEach(element.attributes, function (attr) {
            if (!appElement && names[attr.name]) {
              appElement = element;
              module = attr.value;
            }
          });
        }
      }
    });
    if (appElement) {
      bootstrap(appElement, module ? [module] : []);
    }
  }
  function bootstrap(element, modules) {
    var doBootstrap = function () {
      element = jqLite(element);
      if (element.injector()) {
        var tag = element[0] === document ? 'document' : startingTag(element);
        throw ngMinErr('btstrpd', 'App Already Bootstrapped with this Element \'{0}\'', tag);
      }
      modules = modules || [];
      modules.unshift([
        '$provide',
        function ($provide) {
          $provide.value('$rootElement', element);
        }
      ]);
      modules.unshift('ng');
      var injector = createInjector(modules);
      injector.invoke([
        '$rootScope',
        '$rootElement',
        '$compile',
        '$injector',
        '$animate',
        function (scope, element, compile, injector, animate) {
          scope.$apply(function () {
            element.data('$injector', injector);
            compile(element)(scope);
          });
          animate.enabled(true);
        }
      ]);
      return injector;
    };
    var NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;
    if (window && !NG_DEFER_BOOTSTRAP.test(window.name)) {
      return doBootstrap();
    }
    window.name = window.name.replace(NG_DEFER_BOOTSTRAP, '');
    angular.resumeBootstrap = function (extraModules) {
      forEach(extraModules, function (module) {
        modules.push(module);
      });
      doBootstrap();
    };
  }
  var SNAKE_CASE_REGEXP = /[A-Z]/g;
  function snake_case(name, separator) {
    separator = separator || '_';
    return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }
  function bindJQuery() {
    jQuery = window.jQuery;
    if (jQuery) {
      jqLite = jQuery;
      extend(jQuery.fn, {
        scope: JQLitePrototype.scope,
        controller: JQLitePrototype.controller,
        injector: JQLitePrototype.injector,
        inheritedData: JQLitePrototype.inheritedData
      });
      JQLitePatchJQueryRemove('remove', true, true, false);
      JQLitePatchJQueryRemove('empty', false, false, false);
      JQLitePatchJQueryRemove('html', false, false, true);
    } else {
      jqLite = JQLite;
    }
    angular.element = jqLite;
  }
  function assertArg(arg, name, reason) {
    if (!arg) {
      throw ngMinErr('areq', 'Argument \'{0}\' is {1}', name || '?', reason || 'required');
    }
    return arg;
  }
  function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
    }
    assertArg(isFunction(arg), name, 'not a function, got ' + (arg && typeof arg == 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
  }
  function assertNotHasOwnProperty(name, context) {
    if (name === 'hasOwnProperty') {
      throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
    }
  }
  function getter(obj, path, bindFnToScope) {
    if (!path)
      return obj;
    var keys = path.split('.');
    var key;
    var lastInstance = obj;
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      key = keys[i];
      if (obj) {
        obj = (lastInstance = obj)[key];
      }
    }
    if (!bindFnToScope && isFunction(obj)) {
      return bind(lastInstance, obj);
    }
    return obj;
  }
  function setupModuleLoader(window) {
    var $injectorMinErr = minErr('$injector');
    function ensure(obj, name, factory) {
      return obj[name] || (obj[name] = factory());
    }
    return ensure(ensure(window, 'angular', Object), 'module', function () {
      var modules = {};
      return function module(name, requires, configFn) {
        assertNotHasOwnProperty(name, 'module');
        if (requires && modules.hasOwnProperty(name)) {
          modules[name] = null;
        }
        return ensure(modules, name, function () {
          if (!requires) {
            throw $injectorMinErr('nomod', 'Module \'{0}\' is not available! You either misspelled the module name ' + 'or forgot to load it. If registering a module ensure that you specify the dependencies as the second ' + 'argument.', name);
          }
          var invokeQueue = [];
          var runBlocks = [];
          var config = invokeLater('$injector', 'invoke');
          var moduleInstance = {
              _invokeQueue: invokeQueue,
              _runBlocks: runBlocks,
              requires: requires,
              name: name,
              provider: invokeLater('$provide', 'provider'),
              factory: invokeLater('$provide', 'factory'),
              service: invokeLater('$provide', 'service'),
              value: invokeLater('$provide', 'value'),
              constant: invokeLater('$provide', 'constant', 'unshift'),
              animation: invokeLater('$animateProvider', 'register'),
              filter: invokeLater('$filterProvider', 'register'),
              controller: invokeLater('$controllerProvider', 'register'),
              directive: invokeLater('$compileProvider', 'directive'),
              config: config,
              run: function (block) {
                runBlocks.push(block);
                return this;
              }
            };
          if (configFn) {
            config(configFn);
          }
          return moduleInstance;
          function invokeLater(provider, method, insertMethod) {
            return function () {
              invokeQueue[insertMethod || 'push']([
                provider,
                method,
                arguments
              ]);
              return moduleInstance;
            };
          }
        });
      };
    });
  }
  var version = {
      full: '1.2.0-rc.3',
      major: 1,
      minor: 2,
      dot: 0,
      codeName: 'ferocious-twitch'
    };
  function publishExternalAPI(angular) {
    extend(angular, {
      'bootstrap': bootstrap,
      'copy': copy,
      'extend': extend,
      'equals': equals,
      'element': jqLite,
      'forEach': forEach,
      'injector': createInjector,
      'noop': noop,
      'bind': bind,
      'toJson': toJson,
      'fromJson': fromJson,
      'identity': identity,
      'isUndefined': isUndefined,
      'isDefined': isDefined,
      'isString': isString,
      'isFunction': isFunction,
      'isObject': isObject,
      'isNumber': isNumber,
      'isElement': isElement,
      'isArray': isArray,
      '$$minErr': minErr,
      'version': version,
      'isDate': isDate,
      'lowercase': lowercase,
      'uppercase': uppercase,
      'callbacks': { counter: 0 }
    });
    angularModule = setupModuleLoader(window);
    try {
      angularModule('ngLocale');
    } catch (e) {
      angularModule('ngLocale', []).provider('$locale', $LocaleProvider);
    }
    angularModule('ng', ['ngLocale'], [
      '$provide',
      function ngModule($provide) {
        $provide.provider('$compile', $CompileProvider).directive({
          a: htmlAnchorDirective,
          input: inputDirective,
          textarea: inputDirective,
          form: formDirective,
          script: scriptDirective,
          select: selectDirective,
          style: styleDirective,
          option: optionDirective,
          ngBind: ngBindDirective,
          ngBindHtml: ngBindHtmlDirective,
          ngBindTemplate: ngBindTemplateDirective,
          ngClass: ngClassDirective,
          ngClassEven: ngClassEvenDirective,
          ngClassOdd: ngClassOddDirective,
          ngCsp: ngCspDirective,
          ngCloak: ngCloakDirective,
          ngController: ngControllerDirective,
          ngForm: ngFormDirective,
          ngHide: ngHideDirective,
          ngIf: ngIfDirective,
          ngInclude: ngIncludeDirective,
          ngInit: ngInitDirective,
          ngNonBindable: ngNonBindableDirective,
          ngPluralize: ngPluralizeDirective,
          ngRepeat: ngRepeatDirective,
          ngShow: ngShowDirective,
          ngStyle: ngStyleDirective,
          ngSwitch: ngSwitchDirective,
          ngSwitchWhen: ngSwitchWhenDirective,
          ngSwitchDefault: ngSwitchDefaultDirective,
          ngOptions: ngOptionsDirective,
          ngTransclude: ngTranscludeDirective,
          ngModel: ngModelDirective,
          ngList: ngListDirective,
          ngChange: ngChangeDirective,
          required: requiredDirective,
          ngRequired: requiredDirective,
          ngValue: ngValueDirective
        }).directive(ngAttributeAliasDirectives).directive(ngEventDirectives);
        $provide.provider({
          $anchorScroll: $AnchorScrollProvider,
          $animate: $AnimateProvider,
          $browser: $BrowserProvider,
          $cacheFactory: $CacheFactoryProvider,
          $controller: $ControllerProvider,
          $document: $DocumentProvider,
          $exceptionHandler: $ExceptionHandlerProvider,
          $filter: $FilterProvider,
          $interpolate: $InterpolateProvider,
          $interval: $IntervalProvider,
          $http: $HttpProvider,
          $httpBackend: $HttpBackendProvider,
          $location: $LocationProvider,
          $log: $LogProvider,
          $parse: $ParseProvider,
          $rootScope: $RootScopeProvider,
          $q: $QProvider,
          $sce: $SceProvider,
          $sceDelegate: $SceDelegateProvider,
          $sniffer: $SnifferProvider,
          $templateCache: $TemplateCacheProvider,
          $timeout: $TimeoutProvider,
          $window: $WindowProvider
        });
      }
    ]);
  }
  var jqCache = JQLite.cache = {}, jqName = JQLite.expando = 'ng-' + new Date().getTime(), jqId = 1, addEventListenerFn = window.document.addEventListener ? function (element, type, fn) {
      element.addEventListener(type, fn, false);
    } : function (element, type, fn) {
      element.attachEvent('on' + type, fn);
    }, removeEventListenerFn = window.document.removeEventListener ? function (element, type, fn) {
      element.removeEventListener(type, fn, false);
    } : function (element, type, fn) {
      element.detachEvent('on' + type, fn);
    };
  function jqNextId() {
    return ++jqId;
  }
  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;
  var jqLiteMinErr = minErr('jqLite');
  function camelCase(name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
  }
  function JQLitePatchJQueryRemove(name, dispatchThis, filterElems, getterIfNoArguments) {
    var originalJqFn = jQuery.fn[name];
    originalJqFn = originalJqFn.$original || originalJqFn;
    removePatch.$original = originalJqFn;
    jQuery.fn[name] = removePatch;
    function removePatch(param) {
      var list = filterElems && param ? [this.filter(param)] : [this], fireEvent = dispatchThis, set, setIndex, setLength, element, childIndex, childLength, children;
      if (!getterIfNoArguments || param != null) {
        while (list.length) {
          set = list.shift();
          for (setIndex = 0, setLength = set.length; setIndex < setLength; setIndex++) {
            element = jqLite(set[setIndex]);
            if (fireEvent) {
              element.triggerHandler('$destroy');
            } else {
              fireEvent = !fireEvent;
            }
            for (childIndex = 0, childLength = (children = element.children()).length; childIndex < childLength; childIndex++) {
              list.push(jQuery(children[childIndex]));
            }
          }
        }
      }
      return originalJqFn.apply(this, arguments);
    }
  }
  function JQLite(element) {
    if (element instanceof JQLite) {
      return element;
    }
    if (!(this instanceof JQLite)) {
      if (isString(element) && element.charAt(0) != '<') {
        throw jqLiteMinErr('nosel', 'Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element');
      }
      return new JQLite(element);
    }
    if (isString(element)) {
      var div = document.createElement('div');
      div.innerHTML = '<div>&#160;</div>' + element;
      div.removeChild(div.firstChild);
      JQLiteAddNodes(this, div.childNodes);
      var fragment = jqLite(document.createDocumentFragment());
      fragment.append(this);
    } else {
      JQLiteAddNodes(this, element);
    }
  }
  function JQLiteClone(element) {
    return element.cloneNode(true);
  }
  function JQLiteDealoc(element) {
    JQLiteRemoveData(element);
    for (var i = 0, children = element.childNodes || []; i < children.length; i++) {
      JQLiteDealoc(children[i]);
    }
  }
  function JQLiteOff(element, type, fn, unsupported) {
    if (isDefined(unsupported))
      throw jqLiteMinErr('offargs', 'jqLite#off() does not support the `selector` argument');
    var events = JQLiteExpandoStore(element, 'events'), handle = JQLiteExpandoStore(element, 'handle');
    if (!handle)
      return;
    if (isUndefined(type)) {
      forEach(events, function (eventHandler, type) {
        removeEventListenerFn(element, type, eventHandler);
        delete events[type];
      });
    } else {
      forEach(type.split(' '), function (type) {
        if (isUndefined(fn)) {
          removeEventListenerFn(element, type, events[type]);
          delete events[type];
        } else {
          arrayRemove(events[type] || [], fn);
        }
      });
    }
  }
  function JQLiteRemoveData(element, name) {
    var expandoId = element[jqName], expandoStore = jqCache[expandoId];
    if (expandoStore) {
      if (name) {
        delete jqCache[expandoId].data[name];
        return;
      }
      if (expandoStore.handle) {
        expandoStore.events.$destroy && expandoStore.handle({}, '$destroy');
        JQLiteOff(element);
      }
      delete jqCache[expandoId];
      element[jqName] = undefined;
    }
  }
  function JQLiteExpandoStore(element, key, value) {
    var expandoId = element[jqName], expandoStore = jqCache[expandoId || -1];
    if (isDefined(value)) {
      if (!expandoStore) {
        element[jqName] = expandoId = jqNextId();
        expandoStore = jqCache[expandoId] = {};
      }
      expandoStore[key] = value;
    } else {
      return expandoStore && expandoStore[key];
    }
  }
  function JQLiteData(element, key, value) {
    var data = JQLiteExpandoStore(element, 'data'), isSetter = isDefined(value), keyDefined = !isSetter && isDefined(key), isSimpleGetter = keyDefined && !isObject(key);
    if (!data && !isSimpleGetter) {
      JQLiteExpandoStore(element, 'data', data = {});
    }
    if (isSetter) {
      data[key] = value;
    } else {
      if (keyDefined) {
        if (isSimpleGetter) {
          return data && data[key];
        } else {
          extend(data, key);
        }
      } else {
        return data;
      }
    }
  }
  function JQLiteHasClass(element, selector) {
    if (!element.getAttribute)
      return false;
    return (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + selector + ' ') > -1;
  }
  function JQLiteRemoveClass(element, cssClasses) {
    if (cssClasses && element.setAttribute) {
      forEach(cssClasses.split(' '), function (cssClass) {
        element.setAttribute('class', trim((' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').replace(' ' + trim(cssClass) + ' ', ' ')));
      });
    }
  }
  function JQLiteAddClass(element, cssClasses) {
    if (cssClasses && element.setAttribute) {
      var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ');
      forEach(cssClasses.split(' '), function (cssClass) {
        cssClass = trim(cssClass);
        if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
          existingClasses += cssClass + ' ';
        }
      });
      element.setAttribute('class', trim(existingClasses));
    }
  }
  function JQLiteAddNodes(root, elements) {
    if (elements) {
      elements = !elements.nodeName && isDefined(elements.length) && !isWindow(elements) ? elements : [elements];
      for (var i = 0; i < elements.length; i++) {
        root.push(elements[i]);
      }
    }
  }
  function JQLiteController(element, name) {
    return JQLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
  }
  function JQLiteInheritedData(element, name, value) {
    element = jqLite(element);
    if (element[0].nodeType == 9) {
      element = element.find('html');
    }
    while (element.length) {
      if ((value = element.data(name)) !== undefined)
        return value;
      element = element.parent();
    }
  }
  var JQLitePrototype = JQLite.prototype = {
      ready: function (fn) {
        var fired = false;
        function trigger() {
          if (fired)
            return;
          fired = true;
          fn();
        }
        if (document.readyState === 'complete') {
          setTimeout(trigger);
        } else {
          this.on('DOMContentLoaded', trigger);
          JQLite(window).on('load', trigger);
        }
      },
      toString: function () {
        var value = [];
        forEach(this, function (e) {
          value.push('' + e);
        });
        return '[' + value.join(', ') + ']';
      },
      eq: function (index) {
        return index >= 0 ? jqLite(this[index]) : jqLite(this[this.length + index]);
      },
      length: 0,
      push: push,
      sort: [].sort,
      splice: [].splice
    };
  var BOOLEAN_ATTR = {};
  forEach('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function (value) {
    BOOLEAN_ATTR[lowercase(value)] = value;
  });
  var BOOLEAN_ELEMENTS = {};
  forEach('input,select,option,textarea,button,form,details'.split(','), function (value) {
    BOOLEAN_ELEMENTS[uppercase(value)] = true;
  });
  function getBooleanAttrName(element, name) {
    var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
    return booleanAttr && BOOLEAN_ELEMENTS[element.nodeName] && booleanAttr;
  }
  forEach({
    data: JQLiteData,
    inheritedData: JQLiteInheritedData,
    scope: function (element) {
      return JQLiteInheritedData(element, '$scope');
    },
    controller: JQLiteController,
    injector: function (element) {
      return JQLiteInheritedData(element, '$injector');
    },
    removeAttr: function (element, name) {
      element.removeAttribute(name);
    },
    hasClass: JQLiteHasClass,
    css: function (element, name, value) {
      name = camelCase(name);
      if (isDefined(value)) {
        element.style[name] = value;
      } else {
        var val;
        if (msie <= 8) {
          val = element.currentStyle && element.currentStyle[name];
          if (val === '')
            val = 'auto';
        }
        val = val || element.style[name];
        if (msie <= 8) {
          val = val === '' ? undefined : val;
        }
        return val;
      }
    },
    attr: function (element, name, value) {
      var lowercasedName = lowercase(name);
      if (BOOLEAN_ATTR[lowercasedName]) {
        if (isDefined(value)) {
          if (!!value) {
            element[name] = true;
            element.setAttribute(name, lowercasedName);
          } else {
            element[name] = false;
            element.removeAttribute(lowercasedName);
          }
        } else {
          return element[name] || (element.attributes.getNamedItem(name) || noop).specified ? lowercasedName : undefined;
        }
      } else if (isDefined(value)) {
        element.setAttribute(name, value);
      } else if (element.getAttribute) {
        var ret = element.getAttribute(name, 2);
        return ret === null ? undefined : ret;
      }
    },
    prop: function (element, name, value) {
      if (isDefined(value)) {
        element[name] = value;
      } else {
        return element[name];
      }
    },
    text: function () {
      var NODE_TYPE_TEXT_PROPERTY = [];
      if (msie < 9) {
        NODE_TYPE_TEXT_PROPERTY[1] = 'innerText';
        NODE_TYPE_TEXT_PROPERTY[3] = 'nodeValue';
      } else {
        NODE_TYPE_TEXT_PROPERTY[1] = NODE_TYPE_TEXT_PROPERTY[3] = 'textContent';
      }
      getText.$dv = '';
      return getText;
      function getText(element, value) {
        var textProp = NODE_TYPE_TEXT_PROPERTY[element.nodeType];
        if (isUndefined(value)) {
          return textProp ? element[textProp] : '';
        }
        element[textProp] = value;
      }
    }(),
    val: function (element, value) {
      if (isUndefined(value)) {
        if (nodeName_(element) === 'SELECT' && element.multiple) {
          var result = [];
          forEach(element.options, function (option) {
            if (option.selected) {
              result.push(option.value || option.text);
            }
          });
          return result.length === 0 ? null : result;
        }
        return element.value;
      }
      element.value = value;
    },
    html: function (element, value) {
      if (isUndefined(value)) {
        return element.innerHTML;
      }
      for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) {
        JQLiteDealoc(childNodes[i]);
      }
      element.innerHTML = value;
    }
  }, function (fn, name) {
    JQLite.prototype[name] = function (arg1, arg2) {
      var i, key;
      if ((fn.length == 2 && (fn !== JQLiteHasClass && fn !== JQLiteController) ? arg1 : arg2) === undefined) {
        if (isObject(arg1)) {
          for (i = 0; i < this.length; i++) {
            if (fn === JQLiteData) {
              fn(this[i], arg1);
            } else {
              for (key in arg1) {
                fn(this[i], key, arg1[key]);
              }
            }
          }
          return this;
        } else {
          var value = fn.$dv;
          var jj = value == undefined ? Math.min(this.length, 1) : this.length;
          for (var j = 0; j < jj; j++) {
            var nodeValue = fn(this[j], arg1, arg2);
            value = value ? value + nodeValue : nodeValue;
          }
          return value;
        }
      } else {
        for (i = 0; i < this.length; i++) {
          fn(this[i], arg1, arg2);
        }
        return this;
      }
    };
  });
  function createEventHandler(element, events) {
    var eventHandler = function (event, type) {
      if (!event.preventDefault) {
        event.preventDefault = function () {
          event.returnValue = false;
        };
      }
      if (!event.stopPropagation) {
        event.stopPropagation = function () {
          event.cancelBubble = true;
        };
      }
      if (!event.target) {
        event.target = event.srcElement || document;
      }
      if (isUndefined(event.defaultPrevented)) {
        var prevent = event.preventDefault;
        event.preventDefault = function () {
          event.defaultPrevented = true;
          prevent.call(event);
        };
        event.defaultPrevented = false;
      }
      event.isDefaultPrevented = function () {
        return event.defaultPrevented || event.returnValue == false;
      };
      forEach(events[type || event.type], function (fn) {
        fn.call(element, event);
      });
      if (msie <= 8) {
        event.preventDefault = null;
        event.stopPropagation = null;
        event.isDefaultPrevented = null;
      } else {
        delete event.preventDefault;
        delete event.stopPropagation;
        delete event.isDefaultPrevented;
      }
    };
    eventHandler.elem = element;
    return eventHandler;
  }
  forEach({
    removeData: JQLiteRemoveData,
    dealoc: JQLiteDealoc,
    on: function onFn(element, type, fn, unsupported) {
      if (isDefined(unsupported))
        throw jqLiteMinErr('onargs', 'jqLite#on() does not support the `selector` or `eventData` parameters');
      var events = JQLiteExpandoStore(element, 'events'), handle = JQLiteExpandoStore(element, 'handle');
      if (!events)
        JQLiteExpandoStore(element, 'events', events = {});
      if (!handle)
        JQLiteExpandoStore(element, 'handle', handle = createEventHandler(element, events));
      forEach(type.split(' '), function (type) {
        var eventFns = events[type];
        if (!eventFns) {
          if (type == 'mouseenter' || type == 'mouseleave') {
            var contains = document.body.contains || document.body.compareDocumentPosition ? function (a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
              } : function (a, b) {
                if (b) {
                  while (b = b.parentNode) {
                    if (b === a) {
                      return true;
                    }
                  }
                }
                return false;
              };
            events[type] = [];
            var eventmap = {
                mouseleave: 'mouseout',
                mouseenter: 'mouseover'
              };
            onFn(element, eventmap[type], function (event) {
              var target = this, related = event.relatedTarget;
              if (!related || related !== target && !contains(target, related)) {
                handle(event, type);
              }
            });
          } else {
            addEventListenerFn(element, type, handle);
            events[type] = [];
          }
          eventFns = events[type];
        }
        eventFns.push(fn);
      });
    },
    off: JQLiteOff,
    replaceWith: function (element, replaceNode) {
      var index, parent = element.parentNode;
      JQLiteDealoc(element);
      forEach(new JQLite(replaceNode), function (node) {
        if (index) {
          parent.insertBefore(node, index.nextSibling);
        } else {
          parent.replaceChild(node, element);
        }
        index = node;
      });
    },
    children: function (element) {
      var children = [];
      forEach(element.childNodes, function (element) {
        if (element.nodeType === 1)
          children.push(element);
      });
      return children;
    },
    contents: function (element) {
      return element.childNodes || [];
    },
    append: function (element, node) {
      forEach(new JQLite(node), function (child) {
        if (element.nodeType === 1 || element.nodeType === 11) {
          element.appendChild(child);
        }
      });
    },
    prepend: function (element, node) {
      if (element.nodeType === 1) {
        var index = element.firstChild;
        forEach(new JQLite(node), function (child) {
          element.insertBefore(child, index);
        });
      }
    },
    wrap: function (element, wrapNode) {
      wrapNode = jqLite(wrapNode)[0];
      var parent = element.parentNode;
      if (parent) {
        parent.replaceChild(wrapNode, element);
      }
      wrapNode.appendChild(element);
    },
    remove: function (element) {
      JQLiteDealoc(element);
      var parent = element.parentNode;
      if (parent)
        parent.removeChild(element);
    },
    after: function (element, newElement) {
      var index = element, parent = element.parentNode;
      forEach(new JQLite(newElement), function (node) {
        parent.insertBefore(node, index.nextSibling);
        index = node;
      });
    },
    addClass: JQLiteAddClass,
    removeClass: JQLiteRemoveClass,
    toggleClass: function (element, selector, condition) {
      if (isUndefined(condition)) {
        condition = !JQLiteHasClass(element, selector);
      }
      (condition ? JQLiteAddClass : JQLiteRemoveClass)(element, selector);
    },
    parent: function (element) {
      var parent = element.parentNode;
      return parent && parent.nodeType !== 11 ? parent : null;
    },
    next: function (element) {
      if (element.nextElementSibling) {
        return element.nextElementSibling;
      }
      var elm = element.nextSibling;
      while (elm != null && elm.nodeType !== 1) {
        elm = elm.nextSibling;
      }
      return elm;
    },
    find: function (element, selector) {
      return element.getElementsByTagName(selector);
    },
    clone: JQLiteClone,
    triggerHandler: function (element, eventName, eventData) {
      var eventFns = (JQLiteExpandoStore(element, 'events') || {})[eventName];
      eventData = eventData || [];
      var event = [{
            preventDefault: noop,
            stopPropagation: noop
          }];
      forEach(eventFns, function (fn) {
        fn.apply(element, event.concat(eventData));
      });
    }
  }, function (fn, name) {
    JQLite.prototype[name] = function (arg1, arg2, arg3) {
      var value;
      for (var i = 0; i < this.length; i++) {
        if (value == undefined) {
          value = fn(this[i], arg1, arg2, arg3);
          if (value !== undefined) {
            value = jqLite(value);
          }
        } else {
          JQLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
        }
      }
      return value == undefined ? this : value;
    };
    JQLite.prototype.bind = JQLite.prototype.on;
    JQLite.prototype.unbind = JQLite.prototype.off;
  });
  function hashKey(obj) {
    var objType = typeof obj, key;
    if (objType == 'object' && obj !== null) {
      if (typeof (key = obj.$$hashKey) == 'function') {
        key = obj.$$hashKey();
      } else if (key === undefined) {
        key = obj.$$hashKey = nextUid();
      }
    } else {
      key = obj;
    }
    return objType + ':' + key;
  }
  function HashMap(array) {
    forEach(array, this.put, this);
  }
  HashMap.prototype = {
    put: function (key, value) {
      this[hashKey(key)] = value;
    },
    get: function (key) {
      return this[hashKey(key)];
    },
    remove: function (key) {
      var value = this[key = hashKey(key)];
      delete this[key];
      return value;
    }
  };
  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  var FN_ARG_SPLIT = /,/;
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  var $injectorMinErr = minErr('$injector');
  function annotate(fn) {
    var $inject, fnText, argDecl, last;
    if (typeof fn == 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];
        if (fn.length) {
          fnText = fn.toString().replace(STRIP_COMMENTS, '');
          argDecl = fnText.match(FN_ARGS);
          forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
            arg.replace(FN_ARG, function (all, underscore, name) {
              $inject.push(name);
            });
          });
        }
        fn.$inject = $inject;
      }
    } else if (isArray(fn)) {
      last = fn.length - 1;
      assertArgFn(fn[last], 'fn');
      $inject = fn.slice(0, last);
    } else {
      assertArgFn(fn, 'fn', true);
    }
    return $inject;
  }
  function createInjector(modulesToLoad) {
    var INSTANTIATING = {}, providerSuffix = 'Provider', path = [], loadedModules = new HashMap(), providerCache = {
        $provide: {
          provider: supportObject(provider),
          factory: supportObject(factory),
          service: supportObject(service),
          value: supportObject(value),
          constant: supportObject(constant),
          decorator: decorator
        }
      }, providerInjector = providerCache.$injector = createInternalInjector(providerCache, function () {
        throw $injectorMinErr('unpr', 'Unknown provider: {0}', path.join(' <- '));
      }), instanceCache = {}, instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function (servicename) {
        var provider = providerInjector.get(servicename + providerSuffix);
        return instanceInjector.invoke(provider.$get, provider);
      });
    forEach(loadModules(modulesToLoad), function (fn) {
      instanceInjector.invoke(fn || noop);
    });
    return instanceInjector;
    function supportObject(delegate) {
      return function (key, value) {
        if (isObject(key)) {
          forEach(key, reverseParams(delegate));
        } else {
          return delegate(key, value);
        }
      };
    }
    function provider(name, provider_) {
      assertNotHasOwnProperty(name, 'service');
      if (isFunction(provider_) || isArray(provider_)) {
        provider_ = providerInjector.instantiate(provider_);
      }
      if (!provider_.$get) {
        throw $injectorMinErr('pget', 'Provider \'{0}\' must define $get factory method.', name);
      }
      return providerCache[name + providerSuffix] = provider_;
    }
    function factory(name, factoryFn) {
      return provider(name, { $get: factoryFn });
    }
    function service(name, constructor) {
      return factory(name, [
        '$injector',
        function ($injector) {
          return $injector.instantiate(constructor);
        }
      ]);
    }
    function value(name, value) {
      return factory(name, valueFn(value));
    }
    function constant(name, value) {
      assertNotHasOwnProperty(name, 'constant');
      providerCache[name] = value;
      instanceCache[name] = value;
    }
    function decorator(serviceName, decorFn) {
      var origProvider = providerInjector.get(serviceName + providerSuffix), orig$get = origProvider.$get;
      origProvider.$get = function () {
        var origInstance = instanceInjector.invoke(orig$get, origProvider);
        return instanceInjector.invoke(decorFn, null, { $delegate: origInstance });
      };
    }
    function loadModules(modulesToLoad) {
      var runBlocks = [];
      forEach(modulesToLoad, function (module) {
        if (loadedModules.get(module))
          return;
        loadedModules.put(module, true);
        try {
          if (isString(module)) {
            var moduleFn = angularModule(module);
            runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
            for (var invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
              var invokeArgs = invokeQueue[i], provider = providerInjector.get(invokeArgs[0]);
              provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
            }
          } else if (isFunction(module)) {
            runBlocks.push(providerInjector.invoke(module));
          } else if (isArray(module)) {
            runBlocks.push(providerInjector.invoke(module));
          } else {
            assertArgFn(module, 'module');
          }
        } catch (e) {
          if (isArray(module)) {
            module = module[module.length - 1];
          }
          if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
            e = e.message + '\n' + e.stack;
          }
          throw $injectorMinErr('modulerr', 'Failed to instantiate module {0} due to:\n{1}', module, e.stack || e.message || e);
        }
      });
      return runBlocks;
    }
    function createInternalInjector(cache, factory) {
      function getService(serviceName) {
        if (cache.hasOwnProperty(serviceName)) {
          if (cache[serviceName] === INSTANTIATING) {
            throw $injectorMinErr('cdep', 'Circular dependency found: {0}', path.join(' <- '));
          }
          return cache[serviceName];
        } else {
          try {
            path.unshift(serviceName);
            cache[serviceName] = INSTANTIATING;
            return cache[serviceName] = factory(serviceName);
          } finally {
            path.shift();
          }
        }
      }
      function invoke(fn, self, locals) {
        var args = [], $inject = annotate(fn), length, i, key;
        for (i = 0, length = $inject.length; i < length; i++) {
          key = $inject[i];
          if (typeof key !== 'string') {
            throw $injectorMinErr('itkn', 'Incorrect injection token! Expected service name as string, got {0}', key);
          }
          args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key));
        }
        if (!fn.$inject) {
          fn = fn[length];
        }
        switch (self ? -1 : args.length) {
        case 0:
          return fn();
        case 1:
          return fn(args[0]);
        case 2:
          return fn(args[0], args[1]);
        case 3:
          return fn(args[0], args[1], args[2]);
        case 4:
          return fn(args[0], args[1], args[2], args[3]);
        case 5:
          return fn(args[0], args[1], args[2], args[3], args[4]);
        case 6:
          return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7:
          return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        case 8:
          return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        case 9:
          return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        case 10:
          return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
        default:
          return fn.apply(self, args);
        }
      }
      function instantiate(Type, locals) {
        var Constructor = function () {
          }, instance, returnedValue;
        Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype;
        instance = new Constructor();
        returnedValue = invoke(Type, instance, locals);
        return isObject(returnedValue) ? returnedValue : instance;
      }
      return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        annotate: annotate,
        has: function (name) {
          return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
        }
      };
    }
  }
  function $AnchorScrollProvider() {
    var autoScrollingEnabled = true;
    this.disableAutoScrolling = function () {
      autoScrollingEnabled = false;
    };
    this.$get = [
      '$window',
      '$location',
      '$rootScope',
      function ($window, $location, $rootScope) {
        var document = $window.document;
        function getFirstAnchor(list) {
          var result = null;
          forEach(list, function (element) {
            if (!result && lowercase(element.nodeName) === 'a')
              result = element;
          });
          return result;
        }
        function scroll() {
          var hash = $location.hash(), elm;
          if (!hash)
            $window.scrollTo(0, 0);
          else if (elm = document.getElementById(hash))
            elm.scrollIntoView();
          else if (elm = getFirstAnchor(document.getElementsByName(hash)))
            elm.scrollIntoView();
          else if (hash === 'top')
            $window.scrollTo(0, 0);
        }
        if (autoScrollingEnabled) {
          $rootScope.$watch(function autoScrollWatch() {
            return $location.hash();
          }, function autoScrollWatchAction() {
            $rootScope.$evalAsync(scroll);
          });
        }
        return scroll;
      }
    ];
  }
  var $animateMinErr = minErr('$animate');
  var $AnimateProvider = [
      '$provide',
      function ($provide) {
        this.$$selectors = {};
        this.register = function (name, factory) {
          var key = name + '-animation';
          if (name && name.charAt(0) != '.')
            throw $animateMinErr('notcsel', 'Expecting class selector starting with \'.\' got \'{0}\'.', name);
          this.$$selectors[name.substr(1)] = key;
          $provide.factory(key, factory);
        };
        this.$get = [
          '$timeout',
          function ($timeout) {
            return {
              enter: function (element, parent, after, done) {
                var afterNode = after && after[after.length - 1];
                var parentNode = parent && parent[0] || afterNode && afterNode.parentNode;
                var afterNextSibling = afterNode && afterNode.nextSibling || null;
                forEach(element, function (node) {
                  parentNode.insertBefore(node, afterNextSibling);
                });
                done && $timeout(done, 0, false);
              },
              leave: function (element, done) {
                element.remove();
                done && $timeout(done, 0, false);
              },
              move: function (element, parent, after, done) {
                this.enter(element, parent, after, done);
              },
              addClass: function (element, className, done) {
                className = isString(className) ? className : isArray(className) ? className.join(' ') : '';
                forEach(element, function (element) {
                  JQLiteAddClass(element, className);
                });
                done && $timeout(done, 0, false);
              },
              removeClass: function (element, className, done) {
                className = isString(className) ? className : isArray(className) ? className.join(' ') : '';
                forEach(element, function (element) {
                  JQLiteRemoveClass(element, className);
                });
                done && $timeout(done, 0, false);
              },
              enabled: noop
            };
          }
        ];
      }
    ];
  function Browser(window, document, $log, $sniffer) {
    var self = this, rawDocument = document[0], location = window.location, history = window.history, setTimeout = window.setTimeout, clearTimeout = window.clearTimeout, pendingDeferIds = {};
    self.isMock = false;
    var outstandingRequestCount = 0;
    var outstandingRequestCallbacks = [];
    self.$$completeOutstandingRequest = completeOutstandingRequest;
    self.$$incOutstandingRequestCount = function () {
      outstandingRequestCount++;
    };
    function completeOutstandingRequest(fn) {
      try {
        fn.apply(null, sliceArgs(arguments, 1));
      } finally {
        outstandingRequestCount--;
        if (outstandingRequestCount === 0) {
          while (outstandingRequestCallbacks.length) {
            try {
              outstandingRequestCallbacks.pop()();
            } catch (e) {
              $log.error(e);
            }
          }
        }
      }
    }
    self.notifyWhenNoOutstandingRequests = function (callback) {
      forEach(pollFns, function (pollFn) {
        pollFn();
      });
      if (outstandingRequestCount === 0) {
        callback();
      } else {
        outstandingRequestCallbacks.push(callback);
      }
    };
    var pollFns = [], pollTimeout;
    self.addPollFn = function (fn) {
      if (isUndefined(pollTimeout))
        startPoller(100, setTimeout);
      pollFns.push(fn);
      return fn;
    };
    function startPoller(interval, setTimeout) {
      (function check() {
        forEach(pollFns, function (pollFn) {
          pollFn();
        });
        pollTimeout = setTimeout(check, interval);
      }());
    }
    var lastBrowserUrl = location.href, baseElement = document.find('base'), newLocation = null;
    self.url = function (url, replace) {
      if (location !== window.location)
        location = window.location;
      if (url) {
        if (lastBrowserUrl == url)
          return;
        lastBrowserUrl = url;
        if ($sniffer.history) {
          if (replace)
            history.replaceState(null, '', url);
          else {
            history.pushState(null, '', url);
            baseElement.attr('href', baseElement.attr('href'));
          }
        } else {
          newLocation = url;
          if (replace) {
            location.replace(url);
          } else {
            location.href = url;
          }
        }
        return self;
      } else {
        return newLocation || location.href.replace(/%27/g, '\'');
      }
    };
    var urlChangeListeners = [], urlChangeInit = false;
    function fireUrlChange() {
      newLocation = null;
      if (lastBrowserUrl == self.url())
        return;
      lastBrowserUrl = self.url();
      forEach(urlChangeListeners, function (listener) {
        listener(self.url());
      });
    }
    self.onUrlChange = function (callback) {
      if (!urlChangeInit) {
        if ($sniffer.history)
          jqLite(window).on('popstate', fireUrlChange);
        if ($sniffer.hashchange)
          jqLite(window).on('hashchange', fireUrlChange);
        else
          self.addPollFn(fireUrlChange);
        urlChangeInit = true;
      }
      urlChangeListeners.push(callback);
      return callback;
    };
    self.baseHref = function () {
      var href = baseElement.attr('href');
      return href ? href.replace(/^https?\:\/\/[^\/]*/, '') : '';
    };
    var lastCookies = {};
    var lastCookieString = '';
    var cookiePath = self.baseHref();
    self.cookies = function (name, value) {
      var cookieLength, cookieArray, cookie, i, index;
      if (name) {
        if (value === undefined) {
          rawDocument.cookie = escape(name) + '=;path=' + cookiePath + ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } else {
          if (isString(value)) {
            cookieLength = (rawDocument.cookie = escape(name) + '=' + escape(value) + ';path=' + cookiePath).length + 1;
            if (cookieLength > 4096) {
              $log.warn('Cookie \'' + name + '\' possibly not set or overflowed because it was too large (' + cookieLength + ' > 4096 bytes)!');
            }
          }
        }
      } else {
        if (rawDocument.cookie !== lastCookieString) {
          lastCookieString = rawDocument.cookie;
          cookieArray = lastCookieString.split('; ');
          lastCookies = {};
          for (i = 0; i < cookieArray.length; i++) {
            cookie = cookieArray[i];
            index = cookie.indexOf('=');
            if (index > 0) {
              var name = unescape(cookie.substring(0, index));
              if (lastCookies[name] === undefined) {
                lastCookies[name] = unescape(cookie.substring(index + 1));
              }
            }
          }
        }
        return lastCookies;
      }
    };
    self.defer = function (fn, delay) {
      var timeoutId;
      outstandingRequestCount++;
      timeoutId = setTimeout(function () {
        delete pendingDeferIds[timeoutId];
        completeOutstandingRequest(fn);
      }, delay || 0);
      pendingDeferIds[timeoutId] = true;
      return timeoutId;
    };
    self.defer.cancel = function (deferId) {
      if (pendingDeferIds[deferId]) {
        delete pendingDeferIds[deferId];
        clearTimeout(deferId);
        completeOutstandingRequest(noop);
        return true;
      }
      return false;
    };
  }
  function $BrowserProvider() {
    this.$get = [
      '$window',
      '$log',
      '$sniffer',
      '$document',
      function ($window, $log, $sniffer, $document) {
        return new Browser($window, $document, $log, $sniffer);
      }
    ];
  }
  function $CacheFactoryProvider() {
    this.$get = function () {
      var caches = {};
      function cacheFactory(cacheId, options) {
        if (cacheId in caches) {
          throw minErr('$cacheFactory')('iid', 'CacheId \'{0}\' is already taken!', cacheId);
        }
        var size = 0, stats = extend({}, options, { id: cacheId }), data = {}, capacity = options && options.capacity || Number.MAX_VALUE, lruHash = {}, freshEnd = null, staleEnd = null;
        return caches[cacheId] = {
          put: function (key, value) {
            var lruEntry = lruHash[key] || (lruHash[key] = { key: key });
            refresh(lruEntry);
            if (isUndefined(value))
              return;
            if (!(key in data))
              size++;
            data[key] = value;
            if (size > capacity) {
              this.remove(staleEnd.key);
            }
            return value;
          },
          get: function (key) {
            var lruEntry = lruHash[key];
            if (!lruEntry)
              return;
            refresh(lruEntry);
            return data[key];
          },
          remove: function (key) {
            var lruEntry = lruHash[key];
            if (!lruEntry)
              return;
            if (lruEntry == freshEnd)
              freshEnd = lruEntry.p;
            if (lruEntry == staleEnd)
              staleEnd = lruEntry.n;
            link(lruEntry.n, lruEntry.p);
            delete lruHash[key];
            delete data[key];
            size--;
          },
          removeAll: function () {
            data = {};
            size = 0;
            lruHash = {};
            freshEnd = staleEnd = null;
          },
          destroy: function () {
            data = null;
            stats = null;
            lruHash = null;
            delete caches[cacheId];
          },
          info: function () {
            return extend({}, stats, { size: size });
          }
        };
        function refresh(entry) {
          if (entry != freshEnd) {
            if (!staleEnd) {
              staleEnd = entry;
            } else if (staleEnd == entry) {
              staleEnd = entry.n;
            }
            link(entry.n, entry.p);
            link(entry, freshEnd);
            freshEnd = entry;
            freshEnd.n = null;
          }
        }
        function link(nextEntry, prevEntry) {
          if (nextEntry != prevEntry) {
            if (nextEntry)
              nextEntry.p = prevEntry;
            if (prevEntry)
              prevEntry.n = nextEntry;
          }
        }
      }
      cacheFactory.info = function () {
        var info = {};
        forEach(caches, function (cache, cacheId) {
          info[cacheId] = cache.info();
        });
        return info;
      };
      cacheFactory.get = function (cacheId) {
        return caches[cacheId];
      };
      return cacheFactory;
    };
  }
  function $TemplateCacheProvider() {
    this.$get = [
      '$cacheFactory',
      function ($cacheFactory) {
        return $cacheFactory('templates');
      }
    ];
  }
  var $compileMinErr = minErr('$compile');
  $CompileProvider.$inject = ['$provide'];
  function $CompileProvider($provide) {
    var hasDirectives = {}, Suffix = 'Directive', COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/, CLASS_DIRECTIVE_REGEXP = /(([\d\w\-_]+)(?:\:([^;]+))?;?)/, aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/, imgSrcSanitizationWhitelist = /^\s*(https?|ftp|file):|data:image\//;
    var EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
    this.directive = function registerDirective(name, directiveFactory) {
      assertNotHasOwnProperty(name, 'directive');
      if (isString(name)) {
        assertArg(directiveFactory, 'directiveFactory');
        if (!hasDirectives.hasOwnProperty(name)) {
          hasDirectives[name] = [];
          $provide.factory(name + Suffix, [
            '$injector',
            '$exceptionHandler',
            function ($injector, $exceptionHandler) {
              var directives = [];
              forEach(hasDirectives[name], function (directiveFactory, index) {
                try {
                  var directive = $injector.invoke(directiveFactory);
                  if (isFunction(directive)) {
                    directive = { compile: valueFn(directive) };
                  } else if (!directive.compile && directive.link) {
                    directive.compile = valueFn(directive.link);
                  }
                  directive.priority = directive.priority || 0;
                  directive.index = index;
                  directive.name = directive.name || name;
                  directive.require = directive.require || directive.controller && directive.name;
                  directive.restrict = directive.restrict || 'A';
                  directives.push(directive);
                } catch (e) {
                  $exceptionHandler(e);
                }
              });
              return directives;
            }
          ]);
        }
        hasDirectives[name].push(directiveFactory);
      } else {
        forEach(name, reverseParams(registerDirective));
      }
      return this;
    };
    this.aHrefSanitizationWhitelist = function (regexp) {
      if (isDefined(regexp)) {
        aHrefSanitizationWhitelist = regexp;
        return this;
      }
      return aHrefSanitizationWhitelist;
    };
    this.imgSrcSanitizationWhitelist = function (regexp) {
      if (isDefined(regexp)) {
        imgSrcSanitizationWhitelist = regexp;
        return this;
      }
      return imgSrcSanitizationWhitelist;
    };
    this.$get = [
      '$injector',
      '$interpolate',
      '$exceptionHandler',
      '$http',
      '$templateCache',
      '$parse',
      '$controller',
      '$rootScope',
      '$document',
      '$sce',
      '$animate',
      function ($injector, $interpolate, $exceptionHandler, $http, $templateCache, $parse, $controller, $rootScope, $document, $sce, $animate) {
        var Attributes = function (element, attr) {
          this.$$element = element;
          this.$attr = attr || {};
        };
        Attributes.prototype = {
          $normalize: directiveNormalize,
          $addClass: function (classVal) {
            if (classVal && classVal.length > 0) {
              $animate.addClass(this.$$element, classVal);
            }
          },
          $removeClass: function (classVal) {
            if (classVal && classVal.length > 0) {
              $animate.removeClass(this.$$element, classVal);
            }
          },
          $set: function (key, value, writeAttr, attrName) {
            if (key == 'class') {
              value = value || '';
              var current = this.$$element.attr('class') || '';
              this.$removeClass(tokenDifference(current, value).join(' '));
              this.$addClass(tokenDifference(value, current).join(' '));
            } else {
              var booleanKey = getBooleanAttrName(this.$$element[0], key), normalizedVal, nodeName;
              if (booleanKey) {
                this.$$element.prop(key, value);
                attrName = booleanKey;
              }
              this[key] = value;
              if (attrName) {
                this.$attr[key] = attrName;
              } else {
                attrName = this.$attr[key];
                if (!attrName) {
                  this.$attr[key] = attrName = snake_case(key, '-');
                }
              }
              nodeName = nodeName_(this.$$element);
              if (nodeName === 'A' && key === 'href' || nodeName === 'IMG' && key === 'src') {
                if (!msie || msie >= 8) {
                  normalizedVal = urlResolve(value).href;
                  if (normalizedVal !== '') {
                    if (key === 'href' && !normalizedVal.match(aHrefSanitizationWhitelist) || key === 'src' && !normalizedVal.match(imgSrcSanitizationWhitelist)) {
                      this[key] = value = 'unsafe:' + normalizedVal;
                    }
                  }
                }
              }
              if (writeAttr !== false) {
                if (value === null || value === undefined) {
                  this.$$element.removeAttr(attrName);
                } else {
                  this.$$element.attr(attrName, value);
                }
              }
            }
            var $$observers = this.$$observers;
            $$observers && forEach($$observers[key], function (fn) {
              try {
                fn(value);
              } catch (e) {
                $exceptionHandler(e);
              }
            });
            function tokenDifference(str1, str2) {
              var values = [], tokens1 = str1.split(/\s+/), tokens2 = str2.split(/\s+/);
              outer:
                for (var i = 0; i < tokens1.length; i++) {
                  var token = tokens1[i];
                  for (var j = 0; j < tokens2.length; j++) {
                    if (token == tokens2[j])
                      continue outer;
                  }
                  values.push(token);
                }
              return values;
            }
            ;
          },
          $observe: function (key, fn) {
            var attrs = this, $$observers = attrs.$$observers || (attrs.$$observers = {}), listeners = $$observers[key] || ($$observers[key] = []);
            listeners.push(fn);
            $rootScope.$evalAsync(function () {
              if (!listeners.$$inter) {
                fn(attrs[key]);
              }
            });
            return fn;
          }
        };
        var startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), denormalizeTemplate = startSymbol == '{{' || endSymbol == '}}' ? identity : function denormalizeTemplate(template) {
            return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
          }, NG_ATTR_BINDING = /^ngAttr[A-Z]/;
        return compile;
        function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
          if (!($compileNodes instanceof jqLite)) {
            $compileNodes = jqLite($compileNodes);
          }
          forEach($compileNodes, function (node, index) {
            if (node.nodeType == 3 && node.nodeValue.match(/\S+/)) {
              $compileNodes[index] = node = jqLite(node).wrap('<span></span>').parent()[0];
            }
          });
          var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext);
          return function publicLinkFn(scope, cloneConnectFn) {
            assertArg(scope, 'scope');
            var $linkNode = cloneConnectFn ? JQLitePrototype.clone.call($compileNodes) : $compileNodes;
            for (var i = 0, ii = $linkNode.length; i < ii; i++) {
              var node = $linkNode[i];
              if (node.nodeType == 1 || node.nodeType == 9) {
                $linkNode.eq(i).data('$scope', scope);
              }
            }
            safeAddClass($linkNode, 'ng-scope');
            if (cloneConnectFn)
              cloneConnectFn($linkNode, scope);
            if (compositeLinkFn)
              compositeLinkFn(scope, $linkNode, $linkNode);
            return $linkNode;
          };
        }
        function safeAddClass($element, className) {
          try {
            $element.addClass(className);
          } catch (e) {
          }
        }
        function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
          var linkFns = [], nodeLinkFn, childLinkFn, directives, attrs, linkFnFound;
          for (var i = 0; i < nodeList.length; i++) {
            attrs = new Attributes();
            directives = collectDirectives(nodeList[i], [], attrs, i == 0 ? maxPriority : undefined, ignoreDirective);
            nodeLinkFn = directives.length ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null;
            childLinkFn = nodeLinkFn && nodeLinkFn.terminal || !nodeList[i].childNodes || !nodeList[i].childNodes.length ? null : compileNodes(nodeList[i].childNodes, nodeLinkFn ? nodeLinkFn.transclude : transcludeFn);
            linkFns.push(nodeLinkFn);
            linkFns.push(childLinkFn);
            linkFnFound = linkFnFound || nodeLinkFn || childLinkFn;
            previousCompileContext = null;
          }
          return linkFnFound ? compositeLinkFn : null;
          function compositeLinkFn(scope, nodeList, $rootElement, boundTranscludeFn) {
            var nodeLinkFn, childLinkFn, node, childScope, childTranscludeFn, i, ii, n;
            var stableNodeList = [];
            for (i = 0, ii = nodeList.length; i < ii; i++) {
              stableNodeList.push(nodeList[i]);
            }
            for (i = 0, n = 0, ii = linkFns.length; i < ii; n++) {
              node = stableNodeList[n];
              nodeLinkFn = linkFns[i++];
              childLinkFn = linkFns[i++];
              if (nodeLinkFn) {
                if (nodeLinkFn.scope) {
                  childScope = scope.$new(isObject(nodeLinkFn.scope));
                  jqLite(node).data('$scope', childScope);
                } else {
                  childScope = scope;
                }
                childTranscludeFn = nodeLinkFn.transclude;
                if (childTranscludeFn || !boundTranscludeFn && transcludeFn) {
                  nodeLinkFn(childLinkFn, childScope, node, $rootElement, function (transcludeFn) {
                    return function (cloneFn) {
                      var transcludeScope = scope.$new();
                      transcludeScope.$$transcluded = true;
                      return transcludeFn(transcludeScope, cloneFn).on('$destroy', bind(transcludeScope, transcludeScope.$destroy));
                    };
                  }(childTranscludeFn || transcludeFn));
                } else {
                  nodeLinkFn(childLinkFn, childScope, node, undefined, boundTranscludeFn);
                }
              } else if (childLinkFn) {
                childLinkFn(scope, node.childNodes, undefined, boundTranscludeFn);
              }
            }
          }
        }
        function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
          var nodeType = node.nodeType, attrsMap = attrs.$attr, match, className;
          switch (nodeType) {
          case 1:
            addDirective(directives, directiveNormalize(nodeName_(node).toLowerCase()), 'E', maxPriority, ignoreDirective);
            for (var attr, name, nName, ngAttrName, value, nAttrs = node.attributes, j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
              var attrStartName = false;
              var attrEndName = false;
              attr = nAttrs[j];
              if (!msie || msie >= 8 || attr.specified) {
                name = attr.name;
                ngAttrName = directiveNormalize(name);
                if (NG_ATTR_BINDING.test(ngAttrName)) {
                  name = snake_case(ngAttrName.substr(6), '-');
                }
                var directiveNName = ngAttrName.replace(/(Start|End)$/, '');
                if (ngAttrName === directiveNName + 'Start') {
                  attrStartName = name;
                  attrEndName = name.substr(0, name.length - 5) + 'end';
                  name = name.substr(0, name.length - 6);
                }
                nName = directiveNormalize(name.toLowerCase());
                attrsMap[nName] = name;
                attrs[nName] = value = trim(msie && name == 'href' ? decodeURIComponent(node.getAttribute(name, 2)) : attr.value);
                if (getBooleanAttrName(node, nName)) {
                  attrs[nName] = true;
                }
                addAttrInterpolateDirective(node, directives, value, nName);
                addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName, attrEndName);
              }
            }
            className = node.className;
            if (isString(className) && className !== '') {
              while (match = CLASS_DIRECTIVE_REGEXP.exec(className)) {
                nName = directiveNormalize(match[2]);
                if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                  attrs[nName] = trim(match[3]);
                }
                className = className.substr(match.index + match[0].length);
              }
            }
            break;
          case 3:
            addTextInterpolateDirective(directives, node.nodeValue);
            break;
          case 8:
            try {
              match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
              if (match) {
                nName = directiveNormalize(match[1]);
                if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
                  attrs[nName] = trim(match[2]);
                }
              }
            } catch (e) {
            }
            break;
          }
          directives.sort(byPriority);
          return directives;
        }
        function groupScan(node, attrStart, attrEnd) {
          var nodes = [];
          var depth = 0;
          if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
            var startNode = node;
            do {
              if (!node) {
                throw $compileMinErr('uterdir', 'Unterminated attribute, found \'{0}\' but no matching \'{1}\' found.', attrStart, attrEnd);
              }
              if (node.nodeType == 1) {
                if (node.hasAttribute(attrStart))
                  depth++;
                if (node.hasAttribute(attrEnd))
                  depth--;
              }
              nodes.push(node);
              node = node.nextSibling;
            } while (depth > 0);
          } else {
            nodes.push(node);
          }
          return jqLite(nodes);
        }
        function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
          return function (scope, element, attrs, controllers) {
            element = groupScan(element[0], attrStart, attrEnd);
            return linkFn(scope, element, attrs, controllers);
          };
        }
        function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {
          previousCompileContext = previousCompileContext || {};
          var terminalPriority = -Number.MAX_VALUE, newScopeDirective, newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective, templateDirective = previousCompileContext.templateDirective, $compileNode = templateAttrs.$$element = jqLite(compileNode), directive, directiveName, $template, transcludeDirective = previousCompileContext.transcludeDirective, replaceDirective = originalReplaceDirective, childTranscludeFn = transcludeFn, controllerDirectives, linkFn, directiveValue;
          for (var i = 0, ii = directives.length; i < ii; i++) {
            directive = directives[i];
            var attrStart = directive.$$start;
            var attrEnd = directive.$$end;
            if (attrStart) {
              $compileNode = groupScan(compileNode, attrStart, attrEnd);
            }
            $template = undefined;
            if (terminalPriority > directive.priority) {
              break;
            }
            if (directiveValue = directive.scope) {
              newScopeDirective = newScopeDirective || directive;
              if (!directive.templateUrl) {
                assertNoDuplicate('new/isolated scope', newIsolateScopeDirective, directive, $compileNode);
                if (isObject(directiveValue)) {
                  safeAddClass($compileNode, 'ng-isolate-scope');
                  newIsolateScopeDirective = directive;
                }
                safeAddClass($compileNode, 'ng-scope');
              }
            }
            directiveName = directive.name;
            if (!directive.templateUrl && directive.controller) {
              directiveValue = directive.controller;
              controllerDirectives = controllerDirectives || {};
              assertNoDuplicate('\'' + directiveName + '\' controller', controllerDirectives[directiveName], directive, $compileNode);
              controllerDirectives[directiveName] = directive;
            }
            if (directiveValue = directive.transclude) {
              if (directiveName !== 'ngRepeat') {
                assertNoDuplicate('transclusion', transcludeDirective, directive, $compileNode);
                transcludeDirective = directive;
              }
              if (directiveValue == 'element') {
                terminalPriority = directive.priority;
                $template = groupScan(compileNode, attrStart, attrEnd);
                $compileNode = templateAttrs.$$element = jqLite(document.createComment(' ' + directiveName + ': ' + templateAttrs[directiveName] + ' '));
                compileNode = $compileNode[0];
                replaceWith(jqCollection, jqLite(sliceArgs($template)), compileNode);
                childTranscludeFn = compile($template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {
                  newIsolateScopeDirective: newIsolateScopeDirective,
                  transcludeDirective: transcludeDirective,
                  templateDirective: templateDirective
                });
              } else {
                $template = jqLite(JQLiteClone(compileNode)).contents();
                $compileNode.html('');
                childTranscludeFn = compile($template, transcludeFn);
              }
            }
            if (directive.template) {
              assertNoDuplicate('template', templateDirective, directive, $compileNode);
              templateDirective = directive;
              directiveValue = isFunction(directive.template) ? directive.template($compileNode, templateAttrs) : directive.template;
              directiveValue = denormalizeTemplate(directiveValue);
              if (directive.replace) {
                replaceDirective = directive;
                $template = jqLite('<div>' + trim(directiveValue) + '</div>').contents();
                compileNode = $template[0];
                if ($template.length != 1 || compileNode.nodeType !== 1) {
                  throw $compileMinErr('tplrt', 'Template for directive \'{0}\' must have exactly one root element. {1}', directiveName, '');
                }
                replaceWith(jqCollection, $compileNode, compileNode);
                var newTemplateAttrs = { $attr: {} };
                directives = directives.concat(collectDirectives(compileNode, directives.splice(i + 1, directives.length - (i + 1)), newTemplateAttrs));
                mergeTemplateAttributes(templateAttrs, newTemplateAttrs);
                ii = directives.length;
              } else {
                $compileNode.html(directiveValue);
              }
            }
            if (directive.templateUrl) {
              assertNoDuplicate('template', templateDirective, directive, $compileNode);
              templateDirective = directive;
              if (directive.replace) {
                replaceDirective = directive;
              }
              nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode, templateAttrs, jqCollection, childTranscludeFn, preLinkFns, postLinkFns, {
                newIsolateScopeDirective: newIsolateScopeDirective,
                transcludeDirective: transcludeDirective,
                templateDirective: templateDirective
              });
              ii = directives.length;
            } else if (directive.compile) {
              try {
                linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
                if (isFunction(linkFn)) {
                  addLinkFns(null, linkFn, attrStart, attrEnd);
                } else if (linkFn) {
                  addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
                }
              } catch (e) {
                $exceptionHandler(e, startingTag($compileNode));
              }
            }
            if (directive.terminal) {
              nodeLinkFn.terminal = true;
              terminalPriority = Math.max(terminalPriority, directive.priority);
            }
          }
          nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope;
          nodeLinkFn.transclude = transcludeDirective && childTranscludeFn;
          return nodeLinkFn;
          function addLinkFns(pre, post, attrStart, attrEnd) {
            if (pre) {
              if (attrStart)
                pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd);
              pre.require = directive.require;
              preLinkFns.push(pre);
            }
            if (post) {
              if (attrStart)
                post = groupElementsLinkFnWrapper(post, attrStart, attrEnd);
              post.require = directive.require;
              postLinkFns.push(post);
            }
          }
          function getControllers(require, $element) {
            var value, retrievalMethod = 'data', optional = false;
            if (isString(require)) {
              while ((value = require.charAt(0)) == '^' || value == '?') {
                require = require.substr(1);
                if (value == '^') {
                  retrievalMethod = 'inheritedData';
                }
                optional = optional || value == '?';
              }
              value = $element[retrievalMethod]('$' + require + 'Controller');
              if ($element[0].nodeType == 8 && $element[0].$$controller) {
                value = value || $element[0].$$controller;
                $element[0].$$controller = null;
              }
              if (!value && !optional) {
                throw $compileMinErr('ctreq', 'Controller \'{0}\', required by directive \'{1}\', can\'t be found!', require, directiveName);
              }
              return value;
            } else if (isArray(require)) {
              value = [];
              forEach(require, function (require) {
                value.push(getControllers(require, $element));
              });
            }
            return value;
          }
          function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
            var attrs, $element, i, ii, linkFn, controller;
            if (compileNode === linkNode) {
              attrs = templateAttrs;
            } else {
              attrs = shallowCopy(templateAttrs, new Attributes(jqLite(linkNode), templateAttrs.$attr));
            }
            $element = attrs.$$element;
            if (newIsolateScopeDirective) {
              var LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/;
              var parentScope = scope.$parent || scope;
              forEach(newIsolateScopeDirective.scope, function (definition, scopeName) {
                var match = definition.match(LOCAL_REGEXP) || [], attrName = match[3] || scopeName, optional = match[2] == '?', mode = match[1], lastValue, parentGet, parentSet;
                scope.$$isolateBindings[scopeName] = mode + attrName;
                switch (mode) {
                case '@': {
                    attrs.$observe(attrName, function (value) {
                      scope[scopeName] = value;
                    });
                    attrs.$$observers[attrName].$$scope = parentScope;
                    if (attrs[attrName]) {
                      scope[scopeName] = $interpolate(attrs[attrName])(parentScope);
                    }
                    break;
                  }
                case '=': {
                    if (optional && !attrs[attrName]) {
                      return;
                    }
                    parentGet = $parse(attrs[attrName]);
                    parentSet = parentGet.assign || function () {
                      lastValue = scope[scopeName] = parentGet(parentScope);
                      throw $compileMinErr('nonassign', 'Expression \'{0}\' used with directive \'{1}\' is non-assignable!', attrs[attrName], newIsolateScopeDirective.name);
                    };
                    lastValue = scope[scopeName] = parentGet(parentScope);
                    scope.$watch(function parentValueWatch() {
                      var parentValue = parentGet(parentScope);
                      if (parentValue !== scope[scopeName]) {
                        if (parentValue !== lastValue) {
                          lastValue = scope[scopeName] = parentValue;
                        } else {
                          parentSet(parentScope, parentValue = lastValue = scope[scopeName]);
                        }
                      }
                      return parentValue;
                    });
                    break;
                  }
                case '&': {
                    parentGet = $parse(attrs[attrName]);
                    scope[scopeName] = function (locals) {
                      return parentGet(parentScope, locals);
                    };
                    break;
                  }
                default: {
                    throw $compileMinErr('iscp', 'Invalid isolate scope definition for directive \'{0}\'. Definition: {... {1}: \'{2}\' ...}', newIsolateScopeDirective.name, scopeName, definition);
                  }
                }
              });
            }
            if (controllerDirectives) {
              forEach(controllerDirectives, function (directive) {
                var locals = {
                    $scope: scope,
                    $element: $element,
                    $attrs: attrs,
                    $transclude: boundTranscludeFn
                  }, controllerInstance;
                controller = directive.controller;
                if (controller == '@') {
                  controller = attrs[directive.name];
                }
                controllerInstance = $controller(controller, locals);
                if ($element[0].nodeType == 8) {
                  $element[0].$$controller = controllerInstance;
                } else {
                  $element.data('$' + directive.name + 'Controller', controllerInstance);
                }
                if (directive.controllerAs) {
                  locals.$scope[directive.controllerAs] = controllerInstance;
                }
              });
            }
            for (i = 0, ii = preLinkFns.length; i < ii; i++) {
              try {
                linkFn = preLinkFns[i];
                linkFn(scope, $element, attrs, linkFn.require && getControllers(linkFn.require, $element));
              } catch (e) {
                $exceptionHandler(e, startingTag($element));
              }
            }
            childLinkFn && childLinkFn(scope, linkNode.childNodes, undefined, boundTranscludeFn);
            for (i = postLinkFns.length - 1; i >= 0; i--) {
              try {
                linkFn = postLinkFns[i];
                linkFn(scope, $element, attrs, linkFn.require && getControllers(linkFn.require, $element));
              } catch (e) {
                $exceptionHandler(e, startingTag($element));
              }
            }
          }
        }
        function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
          if (name === ignoreDirective)
            return null;
          var match = null;
          if (hasDirectives.hasOwnProperty(name)) {
            for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; i < ii; i++) {
              try {
                directive = directives[i];
                if ((maxPriority === undefined || maxPriority > directive.priority) && directive.restrict.indexOf(location) != -1) {
                  if (startAttrName) {
                    directive = inherit(directive, {
                      $$start: startAttrName,
                      $$end: endAttrName
                    });
                  }
                  tDirectives.push(directive);
                  match = directive;
                }
              } catch (e) {
                $exceptionHandler(e);
              }
            }
          }
          return match;
        }
        function mergeTemplateAttributes(dst, src) {
          var srcAttr = src.$attr, dstAttr = dst.$attr, $element = dst.$$element;
          forEach(dst, function (value, key) {
            if (key.charAt(0) != '$') {
              if (src[key]) {
                value += (key === 'style' ? ';' : ' ') + src[key];
              }
              dst.$set(key, value, true, srcAttr[key]);
            }
          });
          forEach(src, function (value, key) {
            if (key == 'class') {
              safeAddClass($element, value);
              dst['class'] = (dst['class'] ? dst['class'] + ' ' : '') + value;
            } else if (key == 'style') {
              $element.attr('style', $element.attr('style') + ';' + value);
            } else if (key.charAt(0) != '$' && !dst.hasOwnProperty(key)) {
              dst[key] = value;
              dstAttr[key] = srcAttr[key];
            }
          });
        }
        function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
          var linkQueue = [], afterTemplateNodeLinkFn, afterTemplateChildLinkFn, beforeTemplateCompileNode = $compileNode[0], origAsyncDirective = directives.shift(), derivedSyncDirective = extend({}, origAsyncDirective, {
              templateUrl: null,
              transclude: null,
              replace: null
            }), templateUrl = isFunction(origAsyncDirective.templateUrl) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl;
          $compileNode.html('');
          $http.get($sce.getTrustedResourceUrl(templateUrl), { cache: $templateCache }).success(function (content) {
            var compileNode, tempTemplateAttrs, $template;
            content = denormalizeTemplate(content);
            if (origAsyncDirective.replace) {
              $template = jqLite('<div>' + trim(content) + '</div>').contents();
              compileNode = $template[0];
              if ($template.length != 1 || compileNode.nodeType !== 1) {
                throw $compileMinErr('tplrt', 'Template for directive \'{0}\' must have exactly one root element. {1}', origAsyncDirective.name, templateUrl);
              }
              tempTemplateAttrs = { $attr: {} };
              replaceWith($rootElement, $compileNode, compileNode);
              collectDirectives(compileNode, directives, tempTemplateAttrs);
              mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
            } else {
              compileNode = beforeTemplateCompileNode;
              $compileNode.html(content);
            }
            directives.unshift(derivedSyncDirective);
            afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs, childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns, previousCompileContext);
            forEach($rootElement, function (node, i) {
              if (node == compileNode) {
                $rootElement[i] = $compileNode[0];
              }
            });
            afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn);
            while (linkQueue.length) {
              var scope = linkQueue.shift(), beforeTemplateLinkNode = linkQueue.shift(), linkRootElement = linkQueue.shift(), controller = linkQueue.shift(), linkNode = $compileNode[0];
              if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                linkNode = JQLiteClone(compileNode);
                replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);
              }
              afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, controller);
            }
            linkQueue = null;
          }).error(function (response, code, headers, config) {
            throw $compileMinErr('tpload', 'Failed to load template: {0}', config.url);
          });
          return function delayedNodeLinkFn(ignoreChildLinkFn, scope, node, rootElement, controller) {
            if (linkQueue) {
              linkQueue.push(scope);
              linkQueue.push(node);
              linkQueue.push(rootElement);
              linkQueue.push(controller);
            } else {
              afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, controller);
            }
          };
        }
        function byPriority(a, b) {
          var diff = b.priority - a.priority;
          if (diff !== 0)
            return diff;
          if (a.name !== b.name)
            return a.name < b.name ? -1 : 1;
          return a.index - b.index;
        }
        function assertNoDuplicate(what, previousDirective, directive, element) {
          if (previousDirective) {
            throw $compileMinErr('multidir', 'Multiple directives [{0}, {1}] asking for {2} on: {3}', previousDirective.name, directive.name, what, startingTag(element));
          }
        }
        function addTextInterpolateDirective(directives, text) {
          var interpolateFn = $interpolate(text, true);
          if (interpolateFn) {
            directives.push({
              priority: 0,
              compile: valueFn(function textInterpolateLinkFn(scope, node) {
                var parent = node.parent(), bindings = parent.data('$binding') || [];
                bindings.push(interpolateFn);
                safeAddClass(parent.data('$binding', bindings), 'ng-binding');
                scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {
                  node[0].nodeValue = value;
                });
              })
            });
          }
        }
        function getTrustedContext(node, attrNormalizedName) {
          if (attrNormalizedName == 'xlinkHref' || nodeName_(node) != 'IMG' && (attrNormalizedName == 'src' || attrNormalizedName == 'ngSrc')) {
            return $sce.RESOURCE_URL;
          }
        }
        function addAttrInterpolateDirective(node, directives, value, name) {
          var interpolateFn = $interpolate(value, true);
          if (!interpolateFn)
            return;
          if (name === 'multiple' && nodeName_(node) === 'SELECT') {
            throw $compileMinErr('selmulti', 'Binding to the \'multiple\' attribute is not supported. Element: {0}', startingTag(node));
          }
          directives.push({
            priority: -100,
            compile: valueFn(function attrInterpolateLinkFn(scope, element, attr) {
              var $$observers = attr.$$observers || (attr.$$observers = {});
              if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                throw $compileMinErr('nodomevents', 'Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- ' + 'versions (such as ng-click instead of onclick) instead.');
              }
              interpolateFn = $interpolate(attr[name], true, getTrustedContext(node, name));
              if (!interpolateFn)
                return;
              attr[name] = interpolateFn(scope);
              ($$observers[name] || ($$observers[name] = [])).$$inter = true;
              (attr.$$observers && attr.$$observers[name].$$scope || scope).$watch(interpolateFn, function interpolateFnWatchAction(value) {
                attr.$set(name, value);
              });
            })
          });
        }
        function replaceWith($rootElement, elementsToRemove, newNode) {
          var firstElementToRemove = elementsToRemove[0], removeCount = elementsToRemove.length, parent = firstElementToRemove.parentNode, i, ii;
          if ($rootElement) {
            for (i = 0, ii = $rootElement.length; i < ii; i++) {
              if ($rootElement[i] == firstElementToRemove) {
                $rootElement[i++] = newNode;
                for (var j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j++, j2++) {
                  if (j2 < jj) {
                    $rootElement[j] = $rootElement[j2];
                  } else {
                    delete $rootElement[j];
                  }
                }
                $rootElement.length -= removeCount - 1;
                break;
              }
            }
          }
          if (parent) {
            parent.replaceChild(newNode, firstElementToRemove);
          }
          var fragment = document.createDocumentFragment();
          fragment.appendChild(firstElementToRemove);
          newNode[jqLite.expando] = firstElementToRemove[jqLite.expando];
          for (var k = 1, kk = elementsToRemove.length; k < kk; k++) {
            var element = elementsToRemove[k];
            jqLite(element).remove();
            fragment.appendChild(element);
            delete elementsToRemove[k];
          }
          elementsToRemove[0] = newNode;
          elementsToRemove.length = 1;
        }
      }
    ];
  }
  var PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i;
  function directiveNormalize(name) {
    return camelCase(name.replace(PREFIX_REGEXP, ''));
  }
  function nodesetLinkingFn(scope, nodeList, rootElement, boundTranscludeFn) {
  }
  function directiveLinkingFn(nodesetLinkingFn, scope, node, rootElement, boundTranscludeFn) {
  }
  function $ControllerProvider() {
    var controllers = {}, CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;
    this.register = function (name, constructor) {
      assertNotHasOwnProperty(name, 'controller');
      if (isObject(name)) {
        extend(controllers, name);
      } else {
        controllers[name] = constructor;
      }
    };
    this.$get = [
      '$injector',
      '$window',
      function ($injector, $window) {
        return function (expression, locals) {
          var instance, match, constructor, identifier;
          if (isString(expression)) {
            match = expression.match(CNTRL_REG), constructor = match[1], identifier = match[3];
            expression = controllers.hasOwnProperty(constructor) ? controllers[constructor] : getter(locals.$scope, constructor, true) || getter($window, constructor, true);
            assertArgFn(expression, constructor, true);
          }
          instance = $injector.instantiate(expression, locals);
          if (identifier) {
            if (!(locals && typeof locals.$scope == 'object')) {
              throw minErr('$controller')('noscp', 'Cannot export controller \'{0}\' as \'{1}\'! No $scope object provided via `locals`.', constructor || expression.name, identifier);
            }
            locals.$scope[identifier] = instance;
          }
          return instance;
        };
      }
    ];
  }
  function $DocumentProvider() {
    this.$get = [
      '$window',
      function (window) {
        return jqLite(window.document);
      }
    ];
  }
  function $ExceptionHandlerProvider() {
    this.$get = [
      '$log',
      function ($log) {
        return function (exception, cause) {
          $log.error.apply($log, arguments);
        };
      }
    ];
  }
  function parseHeaders(headers) {
    var parsed = {}, key, val, i;
    if (!headers)
      return parsed;
    forEach(headers.split('\n'), function (line) {
      i = line.indexOf(':');
      key = lowercase(trim(line.substr(0, i)));
      val = trim(line.substr(i + 1));
      if (key) {
        if (parsed[key]) {
          parsed[key] += ', ' + val;
        } else {
          parsed[key] = val;
        }
      }
    });
    return parsed;
  }
  function headersGetter(headers) {
    var headersObj = isObject(headers) ? headers : undefined;
    return function (name) {
      if (!headersObj)
        headersObj = parseHeaders(headers);
      if (name) {
        return headersObj[lowercase(name)] || null;
      }
      return headersObj;
    };
  }
  function transformData(data, headers, fns) {
    if (isFunction(fns))
      return fns(data, headers);
    forEach(fns, function (fn) {
      data = fn(data, headers);
    });
    return data;
  }
  function isSuccess(status) {
    return 200 <= status && status < 300;
  }
  function $HttpProvider() {
    var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/, CONTENT_TYPE_APPLICATION_JSON = { 'Content-Type': 'application/json;charset=utf-8' };
    var defaults = this.defaults = {
        transformResponse: [function (data) {
            if (isString(data)) {
              data = data.replace(PROTECTION_PREFIX, '');
              if (JSON_START.test(data) && JSON_END.test(data))
                data = fromJson(data);
            }
            return data;
          }],
        transformRequest: [function (d) {
            return isObject(d) && !isFile(d) ? toJson(d) : d;
          }],
        headers: {
          common: { 'Accept': 'application/json, text/plain, */*' },
          post: CONTENT_TYPE_APPLICATION_JSON,
          put: CONTENT_TYPE_APPLICATION_JSON,
          patch: CONTENT_TYPE_APPLICATION_JSON
        },
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
      };
    var interceptorFactories = this.interceptors = [];
    var responseInterceptorFactories = this.responseInterceptors = [];
    this.$get = [
      '$httpBackend',
      '$browser',
      '$cacheFactory',
      '$rootScope',
      '$q',
      '$injector',
      function ($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {
        var defaultCache = $cacheFactory('$http');
        var reversedInterceptors = [];
        forEach(interceptorFactories, function (interceptorFactory) {
          reversedInterceptors.unshift(isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
        });
        forEach(responseInterceptorFactories, function (interceptorFactory, index) {
          var responseFn = isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory);
          reversedInterceptors.splice(index, 0, {
            response: function (response) {
              return responseFn($q.when(response));
            },
            responseError: function (response) {
              return responseFn($q.reject(response));
            }
          });
        });
        function $http(requestConfig) {
          var config = {
              transformRequest: defaults.transformRequest,
              transformResponse: defaults.transformResponse
            };
          var headers = mergeHeaders(requestConfig);
          extend(config, requestConfig);
          config.headers = headers;
          config.method = uppercase(config.method);
          var xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
          if (xsrfValue) {
            headers[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue;
          }
          var serverRequest = function (config) {
            headers = config.headers;
            var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);
            if (isUndefined(config.data)) {
              forEach(headers, function (value, header) {
                if (lowercase(header) === 'content-type') {
                  delete headers[header];
                }
              });
            }
            if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
              config.withCredentials = defaults.withCredentials;
            }
            return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
          };
          var chain = [
              serverRequest,
              undefined
            ];
          var promise = $q.when(config);
          forEach(reversedInterceptors, function (interceptor) {
            if (interceptor.request || interceptor.requestError) {
              chain.unshift(interceptor.request, interceptor.requestError);
            }
            if (interceptor.response || interceptor.responseError) {
              chain.push(interceptor.response, interceptor.responseError);
            }
          });
          while (chain.length) {
            var thenFn = chain.shift();
            var rejectFn = chain.shift();
            promise = promise.then(thenFn, rejectFn);
          }
          promise.success = function (fn) {
            promise.then(function (response) {
              fn(response.data, response.status, response.headers, config);
            });
            return promise;
          };
          promise.error = function (fn) {
            promise.then(null, function (response) {
              fn(response.data, response.status, response.headers, config);
            });
            return promise;
          };
          return promise;
          function transformResponse(response) {
            var resp = extend({}, response, { data: transformData(response.data, response.headers, config.transformResponse) });
            return isSuccess(response.status) ? resp : $q.reject(resp);
          }
          function mergeHeaders(config) {
            var defHeaders = defaults.headers, reqHeaders = extend({}, config.headers), defHeaderName, lowercaseDefHeaderName, reqHeaderName;
            defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
            execHeaders(defHeaders);
            execHeaders(reqHeaders);
            defaultHeadersIteration:
              for (defHeaderName in defHeaders) {
                lowercaseDefHeaderName = lowercase(defHeaderName);
                for (reqHeaderName in reqHeaders) {
                  if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                    continue defaultHeadersIteration;
                  }
                }
                reqHeaders[defHeaderName] = defHeaders[defHeaderName];
              }
            return reqHeaders;
            function execHeaders(headers) {
              var headerContent;
              forEach(headers, function (headerFn, header) {
                if (isFunction(headerFn)) {
                  headerContent = headerFn();
                  if (headerContent != null) {
                    headers[header] = headerContent;
                  } else {
                    delete headers[header];
                  }
                }
              });
            }
          }
        }
        $http.pendingRequests = [];
        createShortMethods('get', 'delete', 'head', 'jsonp');
        createShortMethodsWithData('post', 'put');
        $http.defaults = defaults;
        return $http;
        function createShortMethods(names) {
          forEach(arguments, function (name) {
            $http[name] = function (url, config) {
              return $http(extend(config || {}, {
                method: name,
                url: url
              }));
            };
          });
        }
        function createShortMethodsWithData(name) {
          forEach(arguments, function (name) {
            $http[name] = function (url, data, config) {
              return $http(extend(config || {}, {
                method: name,
                url: url,
                data: data
              }));
            };
          });
        }
        function sendReq(config, reqData, reqHeaders) {
          var deferred = $q.defer(), promise = deferred.promise, cache, cachedResp, url = buildUrl(config.url, config.params);
          $http.pendingRequests.push(config);
          promise.then(removePendingReq, removePendingReq);
          if ((config.cache || defaults.cache) && config.cache !== false && config.method == 'GET') {
            cache = isObject(config.cache) ? config.cache : isObject(defaults.cache) ? defaults.cache : defaultCache;
          }
          if (cache) {
            cachedResp = cache.get(url);
            if (isDefined(cachedResp)) {
              if (cachedResp.then) {
                cachedResp.then(removePendingReq, removePendingReq);
                return cachedResp;
              } else {
                if (isArray(cachedResp)) {
                  resolvePromise(cachedResp[1], cachedResp[0], copy(cachedResp[2]));
                } else {
                  resolvePromise(cachedResp, 200, {});
                }
              }
            } else {
              cache.put(url, promise);
            }
          }
          if (isUndefined(cachedResp)) {
            $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType);
          }
          return promise;
          function done(status, response, headersString) {
            if (cache) {
              if (isSuccess(status)) {
                cache.put(url, [
                  status,
                  response,
                  parseHeaders(headersString)
                ]);
              } else {
                cache.remove(url);
              }
            }
            resolvePromise(response, status, headersString);
            if (!$rootScope.$$phase)
              $rootScope.$apply();
          }
          function resolvePromise(response, status, headers) {
            status = Math.max(status, 0);
            (isSuccess(status) ? deferred.resolve : deferred.reject)({
              data: response,
              status: status,
              headers: headersGetter(headers),
              config: config
            });
          }
          function removePendingReq() {
            var idx = indexOf($http.pendingRequests, config);
            if (idx !== -1)
              $http.pendingRequests.splice(idx, 1);
          }
        }
        function buildUrl(url, params) {
          if (!params)
            return url;
          var parts = [];
          forEachSorted(params, function (value, key) {
            if (value == null || value == undefined)
              return;
            if (!isArray(value))
              value = [value];
            forEach(value, function (v) {
              if (isObject(v)) {
                v = toJson(v);
              }
              parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
            });
          });
          return url + (url.indexOf('?') == -1 ? '?' : '&') + parts.join('&');
        }
      }
    ];
  }
  var XHR = window.XMLHttpRequest || function () {
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch (e1) {
      }
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch (e2) {
      }
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (e3) {
      }
      throw minErr('$httpBackend')('noxhr', 'This browser does not support XMLHttpRequest.');
    };
  function $HttpBackendProvider() {
    this.$get = [
      '$browser',
      '$window',
      '$document',
      function ($browser, $window, $document) {
        return createHttpBackend($browser, XHR, $browser.defer, $window.angular.callbacks, $document[0], $window.location.protocol.replace(':', ''));
      }
    ];
  }
  function createHttpBackend($browser, XHR, $browserDefer, callbacks, rawDocument, locationProtocol) {
    return function (method, url, post, callback, headers, timeout, withCredentials, responseType) {
      var status;
      $browser.$$incOutstandingRequestCount();
      url = url || $browser.url();
      if (lowercase(method) == 'jsonp') {
        var callbackId = '_' + (callbacks.counter++).toString(36);
        callbacks[callbackId] = function (data) {
          callbacks[callbackId].data = data;
        };
        var jsonpDone = jsonpReq(url.replace('JSON_CALLBACK', 'angular.callbacks.' + callbackId), function () {
            if (callbacks[callbackId].data) {
              completeRequest(callback, 200, callbacks[callbackId].data);
            } else {
              completeRequest(callback, status || -2);
            }
            delete callbacks[callbackId];
          });
      } else {
        var xhr = new XHR();
        xhr.open(method, url, true);
        forEach(headers, function (value, key) {
          if (isDefined(value)) {
            xhr.setRequestHeader(key, value);
          }
        });
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var responseHeaders = xhr.getAllResponseHeaders();
            completeRequest(callback, status || xhr.status, xhr.responseType ? xhr.response : xhr.responseText, responseHeaders);
          }
        };
        if (withCredentials) {
          xhr.withCredentials = true;
        }
        if (responseType) {
          xhr.responseType = responseType;
        }
        xhr.send(post || null);
      }
      if (timeout > 0) {
        var timeoutId = $browserDefer(timeoutRequest, timeout);
      } else if (timeout && timeout.then) {
        timeout.then(timeoutRequest);
      }
      function timeoutRequest() {
        status = -1;
        jsonpDone && jsonpDone();
        xhr && xhr.abort();
      }
      function completeRequest(callback, status, response, headersString) {
        var protocol = locationProtocol || urlResolve(url).protocol;
        timeoutId && $browserDefer.cancel(timeoutId);
        jsonpDone = xhr = null;
        status = protocol == 'file' ? response ? 200 : 404 : status;
        status = status == 1223 ? 204 : status;
        callback(status, response, headersString);
        $browser.$$completeOutstandingRequest(noop);
      }
    };
    function jsonpReq(url, done) {
      var script = rawDocument.createElement('script'), doneWrapper = function () {
          rawDocument.body.removeChild(script);
          if (done)
            done();
        };
      script.type = 'text/javascript';
      script.src = url;
      if (msie) {
        script.onreadystatechange = function () {
          if (/loaded|complete/.test(script.readyState))
            doneWrapper();
        };
      } else {
        script.onload = script.onerror = doneWrapper;
      }
      rawDocument.body.appendChild(script);
      return doneWrapper;
    }
  }
  var $interpolateMinErr = minErr('$interpolate');
  function $InterpolateProvider() {
    var startSymbol = '{{';
    var endSymbol = '}}';
    this.startSymbol = function (value) {
      if (value) {
        startSymbol = value;
        return this;
      } else {
        return startSymbol;
      }
    };
    this.endSymbol = function (value) {
      if (value) {
        endSymbol = value;
        return this;
      } else {
        return endSymbol;
      }
    };
    this.$get = [
      '$parse',
      '$exceptionHandler',
      '$sce',
      function ($parse, $exceptionHandler, $sce) {
        var startSymbolLength = startSymbol.length, endSymbolLength = endSymbol.length;
        function $interpolate(text, mustHaveExpression, trustedContext) {
          var startIndex, endIndex, index = 0, parts = [], length = text.length, hasInterpolation = false, fn, exp, concat = [];
          while (index < length) {
            if ((startIndex = text.indexOf(startSymbol, index)) != -1 && (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) {
              index != startIndex && parts.push(text.substring(index, startIndex));
              parts.push(fn = $parse(exp = text.substring(startIndex + startSymbolLength, endIndex)));
              fn.exp = exp;
              index = endIndex + endSymbolLength;
              hasInterpolation = true;
            } else {
              index != length && parts.push(text.substring(index));
              index = length;
            }
          }
          if (!(length = parts.length)) {
            parts.push('');
            length = 1;
          }
          if (trustedContext && parts.length > 1) {
            throw $interpolateMinErr('noconcat', 'Error while interpolating: {0}\nStrict Contextual Escaping disallows ' + 'interpolations that concatenate multiple expressions when a trusted value is ' + 'required.  See http://docs.angularjs.org/api/ng.$sce', text);
          }
          if (!mustHaveExpression || hasInterpolation) {
            concat.length = length;
            fn = function (context) {
              try {
                for (var i = 0, ii = length, part; i < ii; i++) {
                  if (typeof (part = parts[i]) == 'function') {
                    part = part(context);
                    if (trustedContext) {
                      part = $sce.getTrusted(trustedContext, part);
                    } else {
                      part = $sce.valueOf(part);
                    }
                    if (part == null || part == undefined) {
                      part = '';
                    } else if (typeof part != 'string') {
                      part = toJson(part);
                    }
                  }
                  concat[i] = part;
                }
                return concat.join('');
              } catch (err) {
                var newErr = $interpolateMinErr('interr', 'Can\'t interpolate: {0}\n{1}', text, err.toString());
                $exceptionHandler(newErr);
              }
            };
            fn.exp = text;
            fn.parts = parts;
            return fn;
          }
        }
        $interpolate.startSymbol = function () {
          return startSymbol;
        };
        $interpolate.endSymbol = function () {
          return endSymbol;
        };
        return $interpolate;
      }
    ];
  }
  function $IntervalProvider() {
    this.$get = [
      '$rootScope',
      '$window',
      '$q',
      function ($rootScope, $window, $q) {
        var intervals = {};
        function interval(fn, delay, count, invokeApply) {
          var setInterval = $window.setInterval, clearInterval = $window.clearInterval;
          var deferred = $q.defer(), promise = deferred.promise, count = isDefined(count) ? count : 0, iteration = 0, skipApply = isDefined(invokeApply) && !invokeApply;
          promise.then(null, null, fn);
          promise.$$intervalId = setInterval(function tick() {
            deferred.notify(iteration++);
            if (count > 0 && iteration >= count) {
              deferred.resolve(iteration);
              clearInterval(promise.$$intervalId);
              delete intervals[promise.$$intervalId];
            }
            if (!skipApply)
              $rootScope.$apply();
          }, delay);
          intervals[promise.$$intervalId] = deferred;
          return promise;
        }
        interval.cancel = function (promise) {
          if (promise && promise.$$intervalId in intervals) {
            intervals[promise.$$intervalId].reject('canceled');
            clearInterval(promise.$$intervalId);
            delete intervals[promise.$$intervalId];
            return true;
          }
          return false;
        };
        return interval;
      }
    ];
  }
  function $LocaleProvider() {
    this.$get = function () {
      return {
        id: 'en-us',
        NUMBER_FORMATS: {
          DECIMAL_SEP: '.',
          GROUP_SEP: ',',
          PATTERNS: [
            {
              minInt: 1,
              minFrac: 0,
              maxFrac: 3,
              posPre: '',
              posSuf: '',
              negPre: '-',
              negSuf: '',
              gSize: 3,
              lgSize: 3
            },
            {
              minInt: 1,
              minFrac: 2,
              maxFrac: 2,
              posPre: '\xa4',
              posSuf: '',
              negPre: '(\xa4',
              negSuf: ')',
              gSize: 3,
              lgSize: 3
            }
          ],
          CURRENCY_SYM: '$'
        },
        DATETIME_FORMATS: {
          MONTH: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
          SHORTMONTH: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
          DAY: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
          SHORTDAY: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
          AMPMS: [
            'AM',
            'PM'
          ],
          medium: 'MMM d, y h:mm:ss a',
          short: 'M/d/yy h:mm a',
          fullDate: 'EEEE, MMMM d, y',
          longDate: 'MMMM d, y',
          mediumDate: 'MMM d, y',
          shortDate: 'M/d/yy',
          mediumTime: 'h:mm:ss a',
          shortTime: 'h:mm a'
        },
        pluralCat: function (num) {
          if (num === 1) {
            return 'one';
          }
          return 'other';
        }
      };
    };
  }
  var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/, DEFAULT_PORTS = {
      'http': 80,
      'https': 443,
      'ftp': 21
    };
  var $locationMinErr = minErr('$location');
  function encodePath(path) {
    var segments = path.split('/'), i = segments.length;
    while (i--) {
      segments[i] = encodeUriSegment(segments[i]);
    }
    return segments.join('/');
  }
  function parseAbsoluteUrl(absoluteUrl, locationObj) {
    var parsedUrl = urlResolve(absoluteUrl);
    locationObj.$$protocol = parsedUrl.protocol;
    locationObj.$$host = parsedUrl.hostname;
    locationObj.$$port = int(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
  }
  function parseAppUrl(relativeUrl, locationObj) {
    var prefixed = relativeUrl.charAt(0) !== '/';
    if (prefixed) {
      relativeUrl = '/' + relativeUrl;
    }
    var match = urlResolve(relativeUrl);
    locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname);
    locationObj.$$search = parseKeyValue(match.search);
    locationObj.$$hash = decodeURIComponent(match.hash);
    if (locationObj.$$path && locationObj.$$path.charAt(0) != '/')
      locationObj.$$path = '/' + locationObj.$$path;
  }
  function beginsWith(begin, whole) {
    if (whole.indexOf(begin) == 0) {
      return whole.substr(begin.length);
    }
  }
  function stripHash(url) {
    var index = url.indexOf('#');
    return index == -1 ? url : url.substr(0, index);
  }
  function stripFile(url) {
    return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
  }
  function serverBase(url) {
    return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
  }
  function LocationHtml5Url(appBase, basePrefix) {
    this.$$html5 = true;
    basePrefix = basePrefix || '';
    var appBaseNoFile = stripFile(appBase);
    parseAbsoluteUrl(appBase, this);
    this.$$parse = function (url) {
      var pathUrl = beginsWith(appBaseNoFile, url);
      if (!isString(pathUrl)) {
        throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
      }
      parseAppUrl(pathUrl, this);
      if (!this.$$path) {
        this.$$path = '/';
      }
      this.$$compose();
    };
    this.$$compose = function () {
      var search = toKeyValue(this.$$search), hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';
      this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
      this.$$absUrl = appBaseNoFile + this.$$url.substr(1);
    };
    this.$$rewrite = function (url) {
      var appUrl, prevAppUrl;
      if ((appUrl = beginsWith(appBase, url)) !== undefined) {
        prevAppUrl = appUrl;
        if ((appUrl = beginsWith(basePrefix, appUrl)) !== undefined) {
          return appBaseNoFile + (beginsWith('/', appUrl) || appUrl);
        } else {
          return appBase + prevAppUrl;
        }
      } else if ((appUrl = beginsWith(appBaseNoFile, url)) !== undefined) {
        return appBaseNoFile + appUrl;
      } else if (appBaseNoFile == url + '/') {
        return appBaseNoFile;
      }
    };
  }
  function LocationHashbangUrl(appBase, hashPrefix) {
    var appBaseNoFile = stripFile(appBase);
    parseAbsoluteUrl(appBase, this);
    this.$$parse = function (url) {
      var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url);
      var withoutHashUrl = withoutBaseUrl.charAt(0) == '#' ? beginsWith(hashPrefix, withoutBaseUrl) : this.$$html5 ? withoutBaseUrl : '';
      if (!isString(withoutHashUrl)) {
        throw $locationMinErr('ihshprfx', 'Invalid url "{0}", missing hash prefix "{1}".', url, hashPrefix);
      }
      parseAppUrl(withoutHashUrl, this);
      this.$$compose();
    };
    this.$$compose = function () {
      var search = toKeyValue(this.$$search), hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';
      this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
      this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');
    };
    this.$$rewrite = function (url) {
      if (stripHash(appBase) == stripHash(url)) {
        return url;
      }
    };
  }
  function LocationHashbangInHtml5Url(appBase, hashPrefix) {
    this.$$html5 = true;
    LocationHashbangUrl.apply(this, arguments);
    var appBaseNoFile = stripFile(appBase);
    this.$$rewrite = function (url) {
      var appUrl;
      if (appBase == stripHash(url)) {
        return url;
      } else if (appUrl = beginsWith(appBaseNoFile, url)) {
        return appBase + hashPrefix + appUrl;
      } else if (appBaseNoFile === url + '/') {
        return appBaseNoFile;
      }
    };
  }
  LocationHashbangInHtml5Url.prototype = LocationHashbangUrl.prototype = LocationHtml5Url.prototype = {
    $$html5: false,
    $$replace: false,
    absUrl: locationGetter('$$absUrl'),
    url: function (url, replace) {
      if (isUndefined(url))
        return this.$$url;
      var match = PATH_MATCH.exec(url);
      if (match[1])
        this.path(decodeURIComponent(match[1]));
      if (match[2] || match[1])
        this.search(match[3] || '');
      this.hash(match[5] || '', replace);
      return this;
    },
    protocol: locationGetter('$$protocol'),
    host: locationGetter('$$host'),
    port: locationGetter('$$port'),
    path: locationGetterSetter('$$path', function (path) {
      return path.charAt(0) == '/' ? path : '/' + path;
    }),
    search: function (search, paramValue) {
      switch (arguments.length) {
      case 0:
        return this.$$search;
      case 1:
        if (isString(search)) {
          this.$$search = parseKeyValue(search);
        } else if (isObject(search)) {
          this.$$search = search;
        } else {
          throw $locationMinErr('isrcharg', 'The first argument of the `$location#search()` call must be a string or an object.');
        }
        break;
      default:
        if (paramValue == undefined || paramValue == null) {
          delete this.$$search[search];
        } else {
          this.$$search[search] = paramValue;
        }
      }
      this.$$compose();
      return this;
    },
    hash: locationGetterSetter('$$hash', identity),
    replace: function () {
      this.$$replace = true;
      return this;
    }
  };
  function locationGetter(property) {
    return function () {
      return this[property];
    };
  }
  function locationGetterSetter(property, preprocess) {
    return function (value) {
      if (isUndefined(value))
        return this[property];
      this[property] = preprocess(value);
      this.$$compose();
      return this;
    };
  }
  function $LocationProvider() {
    var hashPrefix = '', html5Mode = false;
    this.hashPrefix = function (prefix) {
      if (isDefined(prefix)) {
        hashPrefix = prefix;
        return this;
      } else {
        return hashPrefix;
      }
    };
    this.html5Mode = function (mode) {
      if (isDefined(mode)) {
        html5Mode = mode;
        return this;
      } else {
        return html5Mode;
      }
    };
    this.$get = [
      '$rootScope',
      '$browser',
      '$sniffer',
      '$rootElement',
      function ($rootScope, $browser, $sniffer, $rootElement) {
        var $location, LocationMode, baseHref = $browser.baseHref(), initialUrl = $browser.url(), appBase;
        if (html5Mode) {
          appBase = serverBase(initialUrl) + (baseHref || '/');
          LocationMode = $sniffer.history ? LocationHtml5Url : LocationHashbangInHtml5Url;
        } else {
          appBase = stripHash(initialUrl);
          LocationMode = LocationHashbangUrl;
        }
        $location = new LocationMode(appBase, '#' + hashPrefix);
        $location.$$parse($location.$$rewrite(initialUrl));
        $rootElement.on('click', function (event) {
          if (event.ctrlKey || event.metaKey || event.which == 2)
            return;
          var elm = jqLite(event.target);
          while (lowercase(elm[0].nodeName) !== 'a') {
            if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0])
              return;
          }
          var absHref = elm.prop('href');
          var rewrittenUrl = $location.$$rewrite(absHref);
          if (absHref && !elm.attr('target') && rewrittenUrl && !event.isDefaultPrevented()) {
            event.preventDefault();
            if (rewrittenUrl != $browser.url()) {
              $location.$$parse(rewrittenUrl);
              $rootScope.$apply();
              window.angular['ff-684208-preventDefault'] = true;
            }
          }
        });
        if ($location.absUrl() != initialUrl) {
          $browser.url($location.absUrl(), true);
        }
        $browser.onUrlChange(function (newUrl) {
          if ($location.absUrl() != newUrl) {
            if ($rootScope.$broadcast('$locationChangeStart', newUrl, $location.absUrl()).defaultPrevented) {
              $browser.url($location.absUrl());
              return;
            }
            $rootScope.$evalAsync(function () {
              var oldUrl = $location.absUrl();
              $location.$$parse(newUrl);
              afterLocationChange(oldUrl);
            });
            if (!$rootScope.$$phase)
              $rootScope.$digest();
          }
        });
        var changeCounter = 0;
        $rootScope.$watch(function $locationWatch() {
          var oldUrl = $browser.url();
          var currentReplace = $location.$$replace;
          if (!changeCounter || oldUrl != $location.absUrl()) {
            changeCounter++;
            $rootScope.$evalAsync(function () {
              if ($rootScope.$broadcast('$locationChangeStart', $location.absUrl(), oldUrl).defaultPrevented) {
                $location.$$parse(oldUrl);
              } else {
                $browser.url($location.absUrl(), currentReplace);
                afterLocationChange(oldUrl);
              }
            });
          }
          $location.$$replace = false;
          return changeCounter;
        });
        return $location;
        function afterLocationChange(oldUrl) {
          $rootScope.$broadcast('$locationChangeSuccess', $location.absUrl(), oldUrl);
        }
      }
    ];
  }
  function $LogProvider() {
    var debug = true, self = this;
    this.debugEnabled = function (flag) {
      if (isDefined(flag)) {
        debug = flag;
        return this;
      } else {
        return debug;
      }
    };
    this.$get = [
      '$window',
      function ($window) {
        return {
          log: consoleLog('log'),
          info: consoleLog('info'),
          warn: consoleLog('warn'),
          error: consoleLog('error'),
          debug: function () {
            var fn = consoleLog('debug');
            return function () {
              if (debug) {
                fn.apply(self, arguments);
              }
            };
          }()
        };
        function formatError(arg) {
          if (arg instanceof Error) {
            if (arg.stack) {
              arg = arg.message && arg.stack.indexOf(arg.message) === -1 ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
            } else if (arg.sourceURL) {
              arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
            }
          }
          return arg;
        }
        function consoleLog(type) {
          var console = $window.console || {}, logFn = console[type] || console.log || noop;
          if (logFn.apply) {
            return function () {
              var args = [];
              forEach(arguments, function (arg) {
                args.push(formatError(arg));
              });
              return logFn.apply(console, args);
            };
          }
          return function (arg1, arg2) {
            logFn(arg1, arg2 == null ? '' : arg2);
          };
        }
      }
    ];
  }
  var $parseMinErr = minErr('$parse');
  var promiseWarningCache = {};
  var promiseWarning;
  function ensureSafeMemberName(name, fullExpression) {
    if (name === 'constructor') {
      throw $parseMinErr('isecfld', 'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}', fullExpression);
    }
    return name;
  }
  ;
  function ensureSafeObject(obj, fullExpression) {
    if (obj && obj.constructor === obj) {
      throw $parseMinErr('isecfn', 'Referencing Function in Angular expressions is disallowed! Expression: {0}', fullExpression);
    } else if (obj && obj.document && obj.location && obj.alert && obj.setInterval) {
      throw $parseMinErr('isecwindow', 'Referencing the Window in Angular expressions is disallowed! Expression: {0}', fullExpression);
    } else if (obj && (obj.nodeName || obj.on && obj.find)) {
      throw $parseMinErr('isecdom', 'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}', fullExpression);
    } else {
      return obj;
    }
  }
  var OPERATORS = {
      'null': function () {
        return null;
      },
      'true': function () {
        return true;
      },
      'false': function () {
        return false;
      },
      undefined: noop,
      '+': function (self, locals, a, b) {
        a = a(self, locals);
        b = b(self, locals);
        if (isDefined(a)) {
          if (isDefined(b)) {
            return a + b;
          }
          return a;
        }
        return isDefined(b) ? b : undefined;
      },
      '-': function (self, locals, a, b) {
        a = a(self, locals);
        b = b(self, locals);
        return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
      },
      '*': function (self, locals, a, b) {
        return a(self, locals) * b(self, locals);
      },
      '/': function (self, locals, a, b) {
        return a(self, locals) / b(self, locals);
      },
      '%': function (self, locals, a, b) {
        return a(self, locals) % b(self, locals);
      },
      '^': function (self, locals, a, b) {
        return a(self, locals) ^ b(self, locals);
      },
      '=': noop,
      '===': function (self, locals, a, b) {
        return a(self, locals) === b(self, locals);
      },
      '!==': function (self, locals, a, b) {
        return a(self, locals) !== b(self, locals);
      },
      '==': function (self, locals, a, b) {
        return a(self, locals) == b(self, locals);
      },
      '!=': function (self, locals, a, b) {
        return a(self, locals) != b(self, locals);
      },
      '<': function (self, locals, a, b) {
        return a(self, locals) < b(self, locals);
      },
      '>': function (self, locals, a, b) {
        return a(self, locals) > b(self, locals);
      },
      '<=': function (self, locals, a, b) {
        return a(self, locals) <= b(self, locals);
      },
      '>=': function (self, locals, a, b) {
        return a(self, locals) >= b(self, locals);
      },
      '&&': function (self, locals, a, b) {
        return a(self, locals) && b(self, locals);
      },
      '||': function (self, locals, a, b) {
        return a(self, locals) || b(self, locals);
      },
      '&': function (self, locals, a, b) {
        return a(self, locals) & b(self, locals);
      },
      '|': function (self, locals, a, b) {
        return b(self, locals)(self, locals, a(self, locals));
      },
      '!': function (self, locals, a) {
        return !a(self, locals);
      }
    };
  var ESCAPE = {
      'n': '\n',
      'f': '\f',
      'r': '\r',
      't': '\t',
      'v': '\x0B',
      '\'': '\'',
      '"': '"'
    };
  var Lexer = function (options) {
    this.options = options;
  };
  Lexer.prototype = {
    constructor: Lexer,
    lex: function (text) {
      this.text = text;
      this.index = 0;
      this.ch = undefined;
      this.lastCh = ':';
      this.tokens = [];
      var token;
      var json = [];
      while (this.index < this.text.length) {
        this.ch = this.text.charAt(this.index);
        if (this.is('"\'')) {
          this.readString(this.ch);
        } else if (this.isNumber(this.ch) || this.is('.') && this.isNumber(this.peek())) {
          this.readNumber();
        } else if (this.isIdent(this.ch)) {
          this.readIdent();
          if (this.was('{,') && json[0] === '{' && (token = this.tokens[this.tokens.length - 1])) {
            token.json = token.text.indexOf('.') === -1;
          }
        } else if (this.is('(){}[].,;:?')) {
          this.tokens.push({
            index: this.index,
            text: this.ch,
            json: this.was(':[,') && this.is('{[') || this.is('}]:,')
          });
          if (this.is('{['))
            json.unshift(this.ch);
          if (this.is('}]'))
            json.shift();
          this.index++;
        } else if (this.isWhitespace(this.ch)) {
          this.index++;
          continue;
        } else {
          var ch2 = this.ch + this.peek();
          var ch3 = ch2 + this.peek(2);
          var fn = OPERATORS[this.ch];
          var fn2 = OPERATORS[ch2];
          var fn3 = OPERATORS[ch3];
          if (fn3) {
            this.tokens.push({
              index: this.index,
              text: ch3,
              fn: fn3
            });
            this.index += 3;
          } else if (fn2) {
            this.tokens.push({
              index: this.index,
              text: ch2,
              fn: fn2
            });
            this.index += 2;
          } else if (fn) {
            this.tokens.push({
              index: this.index,
              text: this.ch,
              fn: fn,
              json: this.was('[,:') && this.is('+-')
            });
            this.index += 1;
          } else {
            this.throwError('Unexpected next character ', this.index, this.index + 1);
          }
        }
        this.lastCh = this.ch;
      }
      return this.tokens;
    },
    is: function (chars) {
      return chars.indexOf(this.ch) !== -1;
    },
    was: function (chars) {
      return chars.indexOf(this.lastCh) !== -1;
    },
    peek: function (i) {
      var num = i || 1;
      return this.index + num < this.text.length ? this.text.charAt(this.index + num) : false;
    },
    isNumber: function (ch) {
      return '0' <= ch && ch <= '9';
    },
    isWhitespace: function (ch) {
      return ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n' || ch === '\x0B' || ch === '\xa0';
    },
    isIdent: function (ch) {
      return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '_' === ch || ch === '$';
    },
    isExpOperator: function (ch) {
      return ch === '-' || ch === '+' || this.isNumber(ch);
    },
    throwError: function (error, start, end) {
      end = end || this.index;
      var colStr = isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end;
      throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].', error, colStr, this.text);
    },
    readNumber: function () {
      var number = '';
      var start = this.index;
      while (this.index < this.text.length) {
        var ch = lowercase(this.text.charAt(this.index));
        if (ch == '.' || this.isNumber(ch)) {
          number += ch;
        } else {
          var peekCh = this.peek();
          if (ch == 'e' && this.isExpOperator(peekCh)) {
            number += ch;
          } else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && number.charAt(number.length - 1) == 'e') {
            number += ch;
          } else if (this.isExpOperator(ch) && (!peekCh || !this.isNumber(peekCh)) && number.charAt(number.length - 1) == 'e') {
            this.throwError('Invalid exponent');
          } else {
            break;
          }
        }
        this.index++;
      }
      number = 1 * number;
      this.tokens.push({
        index: start,
        text: number,
        json: true,
        fn: function () {
          return number;
        }
      });
    },
    readIdent: function () {
      var parser = this;
      var ident = '';
      var start = this.index;
      var lastDot, peekIndex, methodName, ch;
      while (this.index < this.text.length) {
        ch = this.text.charAt(this.index);
        if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
          if (ch === '.')
            lastDot = this.index;
          ident += ch;
        } else {
          break;
        }
        this.index++;
      }
      if (lastDot) {
        peekIndex = this.index;
        while (peekIndex < this.text.length) {
          ch = this.text.charAt(peekIndex);
          if (ch === '(') {
            methodName = ident.substr(lastDot - start + 1);
            ident = ident.substr(0, lastDot - start);
            this.index = peekIndex;
            break;
          }
          if (this.isWhitespace(ch)) {
            peekIndex++;
          } else {
            break;
          }
        }
      }
      var token = {
          index: start,
          text: ident
        };
      if (OPERATORS.hasOwnProperty(ident)) {
        token.fn = OPERATORS[ident];
        token.json = OPERATORS[ident];
      } else {
        var getter = getterFn(ident, this.options, this.text);
        token.fn = extend(function (self, locals) {
          return getter(self, locals);
        }, {
          assign: function (self, value) {
            return setter(self, ident, value, parser.text, parser.options);
          }
        });
      }
      this.tokens.push(token);
      if (methodName) {
        this.tokens.push({
          index: lastDot,
          text: '.',
          json: false
        });
        this.tokens.push({
          index: lastDot + 1,
          text: methodName,
          json: false
        });
      }
    },
    readString: function (quote) {
      var start = this.index;
      this.index++;
      var string = '';
      var rawString = quote;
      var escape = false;
      while (this.index < this.text.length) {
        var ch = this.text.charAt(this.index);
        rawString += ch;
        if (escape) {
          if (ch === 'u') {
            var hex = this.text.substring(this.index + 1, this.index + 5);
            if (!hex.match(/[\da-f]{4}/i))
              this.throwError('Invalid unicode escape [\\u' + hex + ']');
            this.index += 4;
            string += String.fromCharCode(parseInt(hex, 16));
          } else {
            var rep = ESCAPE[ch];
            if (rep) {
              string += rep;
            } else {
              string += ch;
            }
          }
          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (ch === quote) {
          this.index++;
          this.tokens.push({
            index: start,
            text: rawString,
            string: string,
            json: true,
            fn: function () {
              return string;
            }
          });
          return;
        } else {
          string += ch;
        }
        this.index++;
      }
      this.throwError('Unterminated quote', start);
    }
  };
  var Parser = function (lexer, $filter, options) {
    this.lexer = lexer;
    this.$filter = $filter;
    this.options = options;
  };
  Parser.ZERO = function () {
    return 0;
  };
  Parser.prototype = {
    constructor: Parser,
    parse: function (text, json) {
      this.text = text;
      this.json = json;
      this.tokens = this.lexer.lex(text);
      if (json) {
        this.assignment = this.logicalOR;
        this.functionCall = this.fieldAccess = this.objectIndex = this.filterChain = function () {
          this.throwError('is not valid json', {
            text: text,
            index: 0
          });
        };
      }
      var value = json ? this.primary() : this.statements();
      if (this.tokens.length !== 0) {
        this.throwError('is an unexpected token', this.tokens[0]);
      }
      value.literal = !!value.literal;
      value.constant = !!value.constant;
      return value;
    },
    primary: function () {
      var primary;
      if (this.expect('(')) {
        primary = this.filterChain();
        this.consume(')');
      } else if (this.expect('[')) {
        primary = this.arrayDeclaration();
      } else if (this.expect('{')) {
        primary = this.object();
      } else {
        var token = this.expect();
        primary = token.fn;
        if (!primary) {
          this.throwError('not a primary expression', token);
        }
        if (token.json) {
          primary.constant = true;
          primary.literal = true;
        }
      }
      var next, context;
      while (next = this.expect('(', '[', '.')) {
        if (next.text === '(') {
          primary = this.functionCall(primary, context);
          context = null;
        } else if (next.text === '[') {
          context = primary;
          primary = this.objectIndex(primary);
        } else if (next.text === '.') {
          context = primary;
          primary = this.fieldAccess(primary);
        } else {
          this.throwError('IMPOSSIBLE');
        }
      }
      return primary;
    },
    throwError: function (msg, token) {
      throw $parseMinErr('syntax', 'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].', token.text, msg, token.index + 1, this.text, this.text.substring(token.index));
    },
    peekToken: function () {
      if (this.tokens.length === 0)
        throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
      return this.tokens[0];
    },
    peek: function (e1, e2, e3, e4) {
      if (this.tokens.length > 0) {
        var token = this.tokens[0];
        var t = token.text;
        if (t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4) {
          return token;
        }
      }
      return false;
    },
    expect: function (e1, e2, e3, e4) {
      var token = this.peek(e1, e2, e3, e4);
      if (token) {
        if (this.json && !token.json) {
          this.throwError('is not valid json', token);
        }
        this.tokens.shift();
        return token;
      }
      return false;
    },
    consume: function (e1) {
      if (!this.expect(e1)) {
        this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
      }
    },
    unaryFn: function (fn, right) {
      return extend(function (self, locals) {
        return fn(self, locals, right);
      }, { constant: right.constant });
    },
    ternaryFn: function (left, middle, right) {
      return extend(function (self, locals) {
        return left(self, locals) ? middle(self, locals) : right(self, locals);
      }, { constant: left.constant && middle.constant && right.constant });
    },
    binaryFn: function (left, fn, right) {
      return extend(function (self, locals) {
        return fn(self, locals, left, right);
      }, { constant: left.constant && right.constant });
    },
    statements: function () {
      var statements = [];
      while (true) {
        if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
          statements.push(this.filterChain());
        if (!this.expect(';')) {
          return statements.length === 1 ? statements[0] : function (self, locals) {
            var value;
            for (var i = 0; i < statements.length; i++) {
              var statement = statements[i];
              if (statement) {
                value = statement(self, locals);
              }
            }
            return value;
          };
        }
      }
    },
    filterChain: function () {
      var left = this.expression();
      var token;
      while (true) {
        if (token = this.expect('|')) {
          left = this.binaryFn(left, token.fn, this.filter());
        } else {
          return left;
        }
      }
    },
    filter: function () {
      var token = this.expect();
      var fn = this.$filter(token.text);
      var argsFn = [];
      while (true) {
        if (token = this.expect(':')) {
          argsFn.push(this.expression());
        } else {
          var fnInvoke = function (self, locals, input) {
            var args = [input];
            for (var i = 0; i < argsFn.length; i++) {
              args.push(argsFn[i](self, locals));
            }
            return fn.apply(self, args);
          };
          return function () {
            return fnInvoke;
          };
        }
      }
    },
    expression: function () {
      return this.assignment();
    },
    assignment: function () {
      var left = this.ternary();
      var right;
      var token;
      if (token = this.expect('=')) {
        if (!left.assign) {
          this.throwError('implies assignment but [' + this.text.substring(0, token.index) + '] can not be assigned to', token);
        }
        right = this.ternary();
        return function (scope, locals) {
          return left.assign(scope, right(scope, locals), locals);
        };
      }
      return left;
    },
    ternary: function () {
      var left = this.logicalOR();
      var middle;
      var token;
      if (token = this.expect('?')) {
        middle = this.ternary();
        if (token = this.expect(':')) {
          return this.ternaryFn(left, middle, this.ternary());
        } else {
          this.throwError('expected :', token);
        }
      } else {
        return left;
      }
    },
    logicalOR: function () {
      var left = this.logicalAND();
      var token;
      while (true) {
        if (token = this.expect('||')) {
          left = this.binaryFn(left, token.fn, this.logicalAND());
        } else {
          return left;
        }
      }
    },
    logicalAND: function () {
      var left = this.equality();
      var token;
      if (token = this.expect('&&')) {
        left = this.binaryFn(left, token.fn, this.logicalAND());
      }
      return left;
    },
    equality: function () {
      var left = this.relational();
      var token;
      if (token = this.expect('==', '!=', '===', '!==')) {
        left = this.binaryFn(left, token.fn, this.equality());
      }
      return left;
    },
    relational: function () {
      var left = this.additive();
      var token;
      if (token = this.expect('<', '>', '<=', '>=')) {
        left = this.binaryFn(left, token.fn, this.relational());
      }
      return left;
    },
    additive: function () {
      var left = this.multiplicative();
      var token;
      while (token = this.expect('+', '-')) {
        left = this.binaryFn(left, token.fn, this.multiplicative());
      }
      return left;
    },
    multiplicative: function () {
      var left = this.unary();
      var token;
      while (token = this.expect('*', '/', '%')) {
        left = this.binaryFn(left, token.fn, this.unary());
      }
      return left;
    },
    unary: function () {
      var token;
      if (this.expect('+')) {
        return this.primary();
      } else if (token = this.expect('-')) {
        return this.binaryFn(Parser.ZERO, token.fn, this.unary());
      } else if (token = this.expect('!')) {
        return this.unaryFn(token.fn, this.unary());
      } else {
        return this.primary();
      }
    },
    fieldAccess: function (object) {
      var parser = this;
      var field = this.expect().text;
      var getter = getterFn(field, this.options, this.text);
      return extend(function (scope, locals, self) {
        return getter(self || object(scope, locals), locals);
      }, {
        assign: function (scope, value, locals) {
          return setter(object(scope, locals), field, value, parser.text, parser.options);
        }
      });
    },
    objectIndex: function (obj) {
      var parser = this;
      var indexFn = this.expression();
      this.consume(']');
      return extend(function (self, locals) {
        var o = obj(self, locals), i = indexFn(self, locals), v, p;
        if (!o)
          return undefined;
        v = ensureSafeObject(o[i], parser.text);
        if (v && v.then && parser.options.unwrapPromises) {
          p = v;
          if (!('$$v' in v)) {
            p.$$v = undefined;
            p.then(function (val) {
              p.$$v = val;
            });
          }
          v = v.$$v;
        }
        return v;
      }, {
        assign: function (self, value, locals) {
          var key = indexFn(self, locals);
          var safe = ensureSafeObject(obj(self, locals), parser.text);
          return safe[key] = value;
        }
      });
    },
    functionCall: function (fn, contextGetter) {
      var argsFn = [];
      if (this.peekToken().text !== ')') {
        do {
          argsFn.push(this.expression());
        } while (this.expect(','));
      }
      this.consume(')');
      var parser = this;
      return function (scope, locals) {
        var args = [];
        var context = contextGetter ? contextGetter(scope, locals) : scope;
        for (var i = 0; i < argsFn.length; i++) {
          args.push(argsFn[i](scope, locals));
        }
        var fnPtr = fn(scope, locals, context) || noop;
        ensureSafeObject(fnPtr, parser.text);
        var v = fnPtr.apply ? fnPtr.apply(context, args) : fnPtr(args[0], args[1], args[2], args[3], args[4]);
        return ensureSafeObject(v, parser.text);
      };
    },
    arrayDeclaration: function () {
      var elementFns = [];
      var allConstant = true;
      if (this.peekToken().text !== ']') {
        do {
          var elementFn = this.expression();
          elementFns.push(elementFn);
          if (!elementFn.constant) {
            allConstant = false;
          }
        } while (this.expect(','));
      }
      this.consume(']');
      return extend(function (self, locals) {
        var array = [];
        for (var i = 0; i < elementFns.length; i++) {
          array.push(elementFns[i](self, locals));
        }
        return array;
      }, {
        literal: true,
        constant: allConstant
      });
    },
    object: function () {
      var keyValues = [];
      var allConstant = true;
      if (this.peekToken().text !== '}') {
        do {
          var token = this.expect(), key = token.string || token.text;
          this.consume(':');
          var value = this.expression();
          keyValues.push({
            key: key,
            value: value
          });
          if (!value.constant) {
            allConstant = false;
          }
        } while (this.expect(','));
      }
      this.consume('}');
      return extend(function (self, locals) {
        var object = {};
        for (var i = 0; i < keyValues.length; i++) {
          var keyValue = keyValues[i];
          object[keyValue.key] = keyValue.value(self, locals);
        }
        return object;
      }, {
        literal: true,
        constant: allConstant
      });
    }
  };
  function setter(obj, path, setValue, fullExp, options) {
    options = options || {};
    var element = path.split('.'), key;
    for (var i = 0; element.length > 1; i++) {
      key = ensureSafeMemberName(element.shift(), fullExp);
      var propertyObj = obj[key];
      if (!propertyObj) {
        propertyObj = {};
        obj[key] = propertyObj;
      }
      obj = propertyObj;
      if (obj.then && options.unwrapPromises) {
        promiseWarning(fullExp);
        if (!('$$v' in obj)) {
          (function (promise) {
            promise.then(function (val) {
              promise.$$v = val;
            });
          }(obj));
        }
        if (obj.$$v === undefined) {
          obj.$$v = {};
        }
        obj = obj.$$v;
      }
    }
    key = ensureSafeMemberName(element.shift(), fullExp);
    obj[key] = setValue;
    return setValue;
  }
  var getterFnCache = {};
  function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, options) {
    ensureSafeMemberName(key0, fullExp);
    ensureSafeMemberName(key1, fullExp);
    ensureSafeMemberName(key2, fullExp);
    ensureSafeMemberName(key3, fullExp);
    ensureSafeMemberName(key4, fullExp);
    return !options.unwrapPromises ? function cspSafeGetter(scope, locals) {
      var pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
      if (pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key0];
      if (!key1 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key1];
      if (!key2 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key2];
      if (!key3 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key3];
      if (!key4 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key4];
      return pathVal;
    } : function cspSafePromiseEnabledGetter(scope, locals) {
      var pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope, promise;
      if (pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key0];
      if (pathVal && pathVal.then) {
        promiseWarning(fullExp);
        if (!('$$v' in pathVal)) {
          promise = pathVal;
          promise.$$v = undefined;
          promise.then(function (val) {
            promise.$$v = val;
          });
        }
        pathVal = pathVal.$$v;
      }
      if (!key1 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key1];
      if (pathVal && pathVal.then) {
        promiseWarning(fullExp);
        if (!('$$v' in pathVal)) {
          promise = pathVal;
          promise.$$v = undefined;
          promise.then(function (val) {
            promise.$$v = val;
          });
        }
        pathVal = pathVal.$$v;
      }
      if (!key2 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key2];
      if (pathVal && pathVal.then) {
        promiseWarning(fullExp);
        if (!('$$v' in pathVal)) {
          promise = pathVal;
          promise.$$v = undefined;
          promise.then(function (val) {
            promise.$$v = val;
          });
        }
        pathVal = pathVal.$$v;
      }
      if (!key3 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key3];
      if (pathVal && pathVal.then) {
        promiseWarning(fullExp);
        if (!('$$v' in pathVal)) {
          promise = pathVal;
          promise.$$v = undefined;
          promise.then(function (val) {
            promise.$$v = val;
          });
        }
        pathVal = pathVal.$$v;
      }
      if (!key4 || pathVal === null || pathVal === undefined)
        return pathVal;
      pathVal = pathVal[key4];
      if (pathVal && pathVal.then) {
        promiseWarning(fullExp);
        if (!('$$v' in pathVal)) {
          promise = pathVal;
          promise.$$v = undefined;
          promise.then(function (val) {
            promise.$$v = val;
          });
        }
        pathVal = pathVal.$$v;
      }
      return pathVal;
    };
  }
  function getterFn(path, options, fullExp) {
    if (getterFnCache.hasOwnProperty(path)) {
      return getterFnCache[path];
    }
    var pathKeys = path.split('.'), pathKeysLength = pathKeys.length, fn;
    if (options.csp) {
      fn = pathKeysLength < 6 ? cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, options) : function (scope, locals) {
        var i = 0, val;
        do {
          val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], fullExp, options)(scope, locals);
          locals = undefined;
          scope = val;
        } while (i < pathKeysLength);
        return val;
      };
    } else {
      var code = 'var l, fn, p;\n';
      forEach(pathKeys, function (key, index) {
        ensureSafeMemberName(key, fullExp);
        code += 'if(s === null || s === undefined) return s;\n' + 'l=s;\n' + 's=' + (index ? 's' : '((k&&k.hasOwnProperty("' + key + '"))?k:s)') + '["' + key + '"]' + ';\n' + (options.unwrapPromises ? 'if (s && s.then) {\n' + ' pw("' + fullExp.replace(/\"/g, '\\"') + '");\n' + ' if (!("$$v" in s)) {\n' + ' p=s;\n' + ' p.$$v = undefined;\n' + ' p.then(function(v) {p.$$v=v;});\n' + '}\n' + ' s=s.$$v\n' + '}\n' : '');
      });
      code += 'return s;';
      var evaledFnGetter = Function('s', 'k', 'pw', code);
      evaledFnGetter.toString = function () {
        return code;
      };
      fn = function (scope, locals) {
        return evaledFnGetter(scope, locals, promiseWarning);
      };
    }
    if (path !== 'hasOwnProperty') {
      getterFnCache[path] = fn;
    }
    return fn;
  }
  function $ParseProvider() {
    var cache = {};
    var $parseOptions = {
        csp: false,
        unwrapPromises: false,
        logPromiseWarnings: true
      };
    this.unwrapPromises = function (value) {
      if (isDefined(value)) {
        $parseOptions.unwrapPromises = !!value;
        return this;
      } else {
        return $parseOptions.unwrapPromises;
      }
    };
    this.logPromiseWarnings = function (value) {
      if (isDefined(value)) {
        $parseOptions.logPromiseWarnings = value;
        return this;
      } else {
        return $parseOptions.logPromiseWarnings;
      }
    };
    this.$get = [
      '$filter',
      '$sniffer',
      '$log',
      function ($filter, $sniffer, $log) {
        $parseOptions.csp = $sniffer.csp;
        promiseWarning = function promiseWarningFn(fullExp) {
          if (!$parseOptions.logPromiseWarnings || promiseWarningCache.hasOwnProperty(fullExp))
            return;
          promiseWarningCache[fullExp] = true;
          $log.warn('[$parse] Promise found in the expression `' + fullExp + '`. ' + 'Automatic unwrapping of promises in Angular expressions is deprecated.');
        };
        return function (exp) {
          var parsedExpression;
          switch (typeof exp) {
          case 'string':
            if (cache.hasOwnProperty(exp)) {
              return cache[exp];
            }
            var lexer = new Lexer($parseOptions);
            var parser = new Parser(lexer, $filter, $parseOptions);
            parsedExpression = parser.parse(exp, false);
            if (exp !== 'hasOwnProperty') {
              cache[exp] = parsedExpression;
            }
            return parsedExpression;
          case 'function':
            return exp;
          default:
            return noop;
          }
        };
      }
    ];
  }
  function $QProvider() {
    this.$get = [
      '$rootScope',
      '$exceptionHandler',
      function ($rootScope, $exceptionHandler) {
        return qFactory(function (callback) {
          $rootScope.$evalAsync(callback);
        }, $exceptionHandler);
      }
    ];
  }
  function qFactory(nextTick, exceptionHandler) {
    var defer = function () {
      var pending = [], value, deferred;
      deferred = {
        resolve: function (val) {
          if (pending) {
            var callbacks = pending;
            pending = undefined;
            value = ref(val);
            if (callbacks.length) {
              nextTick(function () {
                var callback;
                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                  callback = callbacks[i];
                  value.then(callback[0], callback[1], callback[2]);
                }
              });
            }
          }
        },
        reject: function (reason) {
          deferred.resolve(reject(reason));
        },
        notify: function (progress) {
          if (pending) {
            var callbacks = pending;
            if (pending.length) {
              nextTick(function () {
                var callback;
                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                  callback = callbacks[i];
                  callback[2](progress);
                }
              });
            }
          }
        },
        promise: {
          then: function (callback, errback, progressback) {
            var result = defer();
            var wrappedCallback = function (value) {
              try {
                result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
              } catch (e) {
                result.reject(e);
                exceptionHandler(e);
              }
            };
            var wrappedErrback = function (reason) {
              try {
                result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
              } catch (e) {
                result.reject(e);
                exceptionHandler(e);
              }
            };
            var wrappedProgressback = function (progress) {
              try {
                result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
              } catch (e) {
                exceptionHandler(e);
              }
            };
            if (pending) {
              pending.push([
                wrappedCallback,
                wrappedErrback,
                wrappedProgressback
              ]);
            } else {
              value.then(wrappedCallback, wrappedErrback, wrappedProgressback);
            }
            return result.promise;
          },
          'catch': function (callback) {
            return this.then(null, callback);
          },
          'finally': function (callback) {
            function makePromise(value, resolved) {
              var result = defer();
              if (resolved) {
                result.resolve(value);
              } else {
                result.reject(value);
              }
              return result.promise;
            }
            function handleCallback(value, isResolved) {
              var callbackOutput = null;
              try {
                callbackOutput = (callback || defaultCallback)();
              } catch (e) {
                return makePromise(e, false);
              }
              if (callbackOutput && isFunction(callbackOutput.then)) {
                return callbackOutput.then(function () {
                  return makePromise(value, isResolved);
                }, function (error) {
                  return makePromise(error, false);
                });
              } else {
                return makePromise(value, isResolved);
              }
            }
            return this.then(function (value) {
              return handleCallback(value, true);
            }, function (error) {
              return handleCallback(error, false);
            });
          }
        }
      };
      return deferred;
    };
    var ref = function (value) {
      if (value && isFunction(value.then))
        return value;
      return {
        then: function (callback) {
          var result = defer();
          nextTick(function () {
            result.resolve(callback(value));
          });
          return result.promise;
        }
      };
    };
    var reject = function (reason) {
      return {
        then: function (callback, errback) {
          var result = defer();
          nextTick(function () {
            try {
              result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
            } catch (e) {
              result.reject(e);
              exceptionHandler(e);
            }
          });
          return result.promise;
        }
      };
    };
    var when = function (value, callback, errback, progressback) {
      var result = defer(), done;
      var wrappedCallback = function (value) {
        try {
          return (isFunction(callback) ? callback : defaultCallback)(value);
        } catch (e) {
          exceptionHandler(e);
          return reject(e);
        }
      };
      var wrappedErrback = function (reason) {
        try {
          return (isFunction(errback) ? errback : defaultErrback)(reason);
        } catch (e) {
          exceptionHandler(e);
          return reject(e);
        }
      };
      var wrappedProgressback = function (progress) {
        try {
          return (isFunction(progressback) ? progressback : defaultCallback)(progress);
        } catch (e) {
          exceptionHandler(e);
        }
      };
      nextTick(function () {
        ref(value).then(function (value) {
          if (done)
            return;
          done = true;
          result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback));
        }, function (reason) {
          if (done)
            return;
          done = true;
          result.resolve(wrappedErrback(reason));
        }, function (progress) {
          if (done)
            return;
          result.notify(wrappedProgressback(progress));
        });
      });
      return result.promise;
    };
    function defaultCallback(value) {
      return value;
    }
    function defaultErrback(reason) {
      return reject(reason);
    }
    function all(promises) {
      var deferred = defer(), counter = 0, results = isArray(promises) ? [] : {};
      forEach(promises, function (promise, key) {
        counter++;
        ref(promise).then(function (value) {
          if (results.hasOwnProperty(key))
            return;
          results[key] = value;
          if (!--counter)
            deferred.resolve(results);
        }, function (reason) {
          if (results.hasOwnProperty(key))
            return;
          deferred.reject(reason);
        });
      });
      if (counter === 0) {
        deferred.resolve(results);
      }
      return deferred.promise;
    }
    return {
      defer: defer,
      reject: reject,
      when: when,
      all: all
    };
  }
  function $RootScopeProvider() {
    var TTL = 10;
    var $rootScopeMinErr = minErr('$rootScope');
    this.digestTtl = function (value) {
      if (arguments.length) {
        TTL = value;
      }
      return TTL;
    };
    this.$get = [
      '$injector',
      '$exceptionHandler',
      '$parse',
      '$browser',
      function ($injector, $exceptionHandler, $parse, $browser) {
        function Scope() {
          this.$id = nextUid();
          this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
          this['this'] = this.$root = this;
          this.$$destroyed = false;
          this.$$asyncQueue = [];
          this.$$postDigestQueue = [];
          this.$$listeners = {};
          this.$$isolateBindings = {};
        }
        Scope.prototype = {
          constructor: Scope,
          $new: function (isolate) {
            var Child, child;
            if (isolate) {
              child = new Scope();
              child.$root = this.$root;
              child.$$asyncQueue = this.$$asyncQueue;
              child.$$postDigestQueue = this.$$postDigestQueue;
            } else {
              Child = function () {
              };
              Child.prototype = this;
              child = new Child();
              child.$id = nextUid();
            }
            child['this'] = child;
            child.$$listeners = {};
            child.$parent = this;
            child.$$watchers = child.$$nextSibling = child.$$childHead = child.$$childTail = null;
            child.$$prevSibling = this.$$childTail;
            if (this.$$childHead) {
              this.$$childTail.$$nextSibling = child;
              this.$$childTail = child;
            } else {
              this.$$childHead = this.$$childTail = child;
            }
            return child;
          },
          $watch: function (watchExp, listener, objectEquality) {
            var scope = this, get = compileToFn(watchExp, 'watch'), array = scope.$$watchers, watcher = {
                fn: listener,
                last: initWatchVal,
                get: get,
                exp: watchExp,
                eq: !!objectEquality
              };
            if (!isFunction(listener)) {
              var listenFn = compileToFn(listener || noop, 'listener');
              watcher.fn = function (newVal, oldVal, scope) {
                listenFn(scope);
              };
            }
            if (typeof watchExp == 'string' && get.constant) {
              var originalFn = watcher.fn;
              watcher.fn = function (newVal, oldVal, scope) {
                originalFn.call(this, newVal, oldVal, scope);
                arrayRemove(array, watcher);
              };
            }
            if (!array) {
              array = scope.$$watchers = [];
            }
            array.unshift(watcher);
            return function () {
              arrayRemove(array, watcher);
            };
          },
          $watchCollection: function (obj, listener) {
            var self = this;
            var oldValue;
            var newValue;
            var changeDetected = 0;
            var objGetter = $parse(obj);
            var internalArray = [];
            var internalObject = {};
            var oldLength = 0;
            function $watchCollectionWatch() {
              newValue = objGetter(self);
              var newLength, key;
              if (!isObject(newValue)) {
                if (oldValue !== newValue) {
                  oldValue = newValue;
                  changeDetected++;
                }
              } else if (isArrayLike(newValue)) {
                if (oldValue !== internalArray) {
                  oldValue = internalArray;
                  oldLength = oldValue.length = 0;
                  changeDetected++;
                }
                newLength = newValue.length;
                if (oldLength !== newLength) {
                  changeDetected++;
                  oldValue.length = oldLength = newLength;
                }
                for (var i = 0; i < newLength; i++) {
                  if (oldValue[i] !== newValue[i]) {
                    changeDetected++;
                    oldValue[i] = newValue[i];
                  }
                }
              } else {
                if (oldValue !== internalObject) {
                  oldValue = internalObject = {};
                  oldLength = 0;
                  changeDetected++;
                }
                newLength = 0;
                for (key in newValue) {
                  if (newValue.hasOwnProperty(key)) {
                    newLength++;
                    if (oldValue.hasOwnProperty(key)) {
                      if (oldValue[key] !== newValue[key]) {
                        changeDetected++;
                        oldValue[key] = newValue[key];
                      }
                    } else {
                      oldLength++;
                      oldValue[key] = newValue[key];
                      changeDetected++;
                    }
                  }
                }
                if (oldLength > newLength) {
                  changeDetected++;
                  for (key in oldValue) {
                    if (oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key)) {
                      oldLength--;
                      delete oldValue[key];
                    }
                  }
                }
              }
              return changeDetected;
            }
            function $watchCollectionAction() {
              listener(newValue, oldValue, self);
            }
            return this.$watch($watchCollectionWatch, $watchCollectionAction);
          },
          $digest: function () {
            var watch, value, last, watchers, asyncQueue = this.$$asyncQueue, postDigestQueue = this.$$postDigestQueue, length, dirty, ttl = TTL, next, current, target = this, watchLog = [], logIdx, logMsg, asyncTask;
            beginPhase('$digest');
            do {
              dirty = false;
              current = target;
              while (asyncQueue.length) {
                try {
                  asyncTask = asyncQueue.shift();
                  asyncTask.scope.$eval(asyncTask.expression);
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
              do {
                if (watchers = current.$$watchers) {
                  length = watchers.length;
                  while (length--) {
                    try {
                      watch = watchers[length];
                      if (watch && (value = watch.get(current)) !== (last = watch.last) && !(watch.eq ? equals(value, last) : typeof value == 'number' && typeof last == 'number' && isNaN(value) && isNaN(last))) {
                        dirty = true;
                        watch.last = watch.eq ? copy(value) : value;
                        watch.fn(value, last === initWatchVal ? value : last, current);
                        if (ttl < 5) {
                          logIdx = 4 - ttl;
                          if (!watchLog[logIdx])
                            watchLog[logIdx] = [];
                          logMsg = isFunction(watch.exp) ? 'fn: ' + (watch.exp.name || watch.exp.toString()) : watch.exp;
                          logMsg += '; newVal: ' + toJson(value) + '; oldVal: ' + toJson(last);
                          watchLog[logIdx].push(logMsg);
                        }
                      }
                    } catch (e) {
                      $exceptionHandler(e);
                    }
                  }
                }
                if (!(next = current.$$childHead || current !== target && current.$$nextSibling)) {
                  while (current !== target && !(next = current.$$nextSibling)) {
                    current = current.$parent;
                  }
                }
              } while (current = next);
              if (dirty && !ttl--) {
                clearPhase();
                throw $rootScopeMinErr('infdig', '{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}', TTL, toJson(watchLog));
              }
            } while (dirty || asyncQueue.length);
            clearPhase();
            while (postDigestQueue.length) {
              try {
                postDigestQueue.shift()();
              } catch (e) {
                $exceptionHandler(e);
              }
            }
          },
          $destroy: function () {
            if ($rootScope == this || this.$$destroyed)
              return;
            var parent = this.$parent;
            this.$broadcast('$destroy');
            this.$$destroyed = true;
            if (parent.$$childHead == this)
              parent.$$childHead = this.$$nextSibling;
            if (parent.$$childTail == this)
              parent.$$childTail = this.$$prevSibling;
            if (this.$$prevSibling)
              this.$$prevSibling.$$nextSibling = this.$$nextSibling;
            if (this.$$nextSibling)
              this.$$nextSibling.$$prevSibling = this.$$prevSibling;
            this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
          },
          $eval: function (expr, locals) {
            return $parse(expr)(this, locals);
          },
          $evalAsync: function (expr) {
            if (!$rootScope.$$phase && !$rootScope.$$asyncQueue.length) {
              $browser.defer(function () {
                if ($rootScope.$$asyncQueue.length) {
                  $rootScope.$digest();
                }
              });
            }
            this.$$asyncQueue.push({
              scope: this,
              expression: expr
            });
          },
          $$postDigest: function (fn) {
            this.$$postDigestQueue.push(fn);
          },
          $apply: function (expr) {
            try {
              beginPhase('$apply');
              return this.$eval(expr);
            } catch (e) {
              $exceptionHandler(e);
            } finally {
              clearPhase();
              try {
                $rootScope.$digest();
              } catch (e) {
                $exceptionHandler(e);
                throw e;
              }
            }
          },
          $on: function (name, listener) {
            var namedListeners = this.$$listeners[name];
            if (!namedListeners) {
              this.$$listeners[name] = namedListeners = [];
            }
            namedListeners.push(listener);
            return function () {
              namedListeners[indexOf(namedListeners, listener)] = null;
            };
          },
          $emit: function (name, args) {
            var empty = [], namedListeners, scope = this, stopPropagation = false, event = {
                name: name,
                targetScope: scope,
                stopPropagation: function () {
                  stopPropagation = true;
                },
                preventDefault: function () {
                  event.defaultPrevented = true;
                },
                defaultPrevented: false
              }, listenerArgs = concat([event], arguments, 1), i, length;
            do {
              namedListeners = scope.$$listeners[name] || empty;
              event.currentScope = scope;
              for (i = 0, length = namedListeners.length; i < length; i++) {
                if (!namedListeners[i]) {
                  namedListeners.splice(i, 1);
                  i--;
                  length--;
                  continue;
                }
                try {
                  namedListeners[i].apply(null, listenerArgs);
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
              if (stopPropagation)
                return event;
              scope = scope.$parent;
            } while (scope);
            return event;
          },
          $broadcast: function (name, args) {
            var target = this, current = target, next = target, event = {
                name: name,
                targetScope: target,
                preventDefault: function () {
                  event.defaultPrevented = true;
                },
                defaultPrevented: false
              }, listenerArgs = concat([event], arguments, 1), listeners, i, length;
            do {
              current = next;
              event.currentScope = current;
              listeners = current.$$listeners[name] || [];
              for (i = 0, length = listeners.length; i < length; i++) {
                if (!listeners[i]) {
                  listeners.splice(i, 1);
                  i--;
                  length--;
                  continue;
                }
                try {
                  listeners[i].apply(null, listenerArgs);
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
              if (!(next = current.$$childHead || current !== target && current.$$nextSibling)) {
                while (current !== target && !(next = current.$$nextSibling)) {
                  current = current.$parent;
                }
              }
            } while (current = next);
            return event;
          }
        };
        var $rootScope = new Scope();
        return $rootScope;
        function beginPhase(phase) {
          if ($rootScope.$$phase) {
            throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope.$$phase);
          }
          $rootScope.$$phase = phase;
        }
        function clearPhase() {
          $rootScope.$$phase = null;
        }
        function compileToFn(exp, name) {
          var fn = $parse(exp);
          assertArgFn(fn, name);
          return fn;
        }
        function initWatchVal() {
        }
      }
    ];
  }
  var $sceMinErr = minErr('$sce');
  var SCE_CONTEXTS = {
      HTML: 'html',
      CSS: 'css',
      URL: 'url',
      RESOURCE_URL: 'resourceUrl',
      JS: 'js'
    };
  function escapeForRegexp(s) {
    return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
  }
  ;
  function adjustMatcher(matcher) {
    if (matcher === 'self') {
      return matcher;
    } else if (isString(matcher)) {
      if (matcher.indexOf('***') > -1) {
        throw $sceMinErr('iwcard', 'Illegal sequence *** in string matcher.  String: {0}', matcher);
      }
      matcher = escapeForRegexp(matcher).replace('\\*\\*', '.*').replace('\\*', '[^:/.?&;]*');
      return new RegExp('^' + matcher + '$');
    } else if (isRegExp(matcher)) {
      return new RegExp('^' + matcher.source + '$');
    } else {
      throw $sceMinErr('imatcher', 'Matchers may only be "self", string patterns or RegExp objects');
    }
  }
  function adjustMatchers(matchers) {
    var adjustedMatchers = [];
    if (isDefined(matchers)) {
      forEach(matchers, function (matcher) {
        adjustedMatchers.push(adjustMatcher(matcher));
      });
    }
    return adjustedMatchers;
  }
  function $SceDelegateProvider() {
    this.SCE_CONTEXTS = SCE_CONTEXTS;
    var resourceUrlWhitelist = ['self'], resourceUrlBlacklist = [];
    this.resourceUrlWhitelist = function (value) {
      if (arguments.length) {
        resourceUrlWhitelist = adjustMatchers(value);
      }
      return resourceUrlWhitelist;
    };
    this.resourceUrlBlacklist = function (value) {
      if (arguments.length) {
        resourceUrlBlacklist = adjustMatchers(value);
      }
      return resourceUrlBlacklist;
    };
    this.$get = [
      '$log',
      '$document',
      '$injector',
      function ($log, $document, $injector) {
        var htmlSanitizer = function htmlSanitizer(html) {
          throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
        };
        if ($injector.has('$sanitize')) {
          htmlSanitizer = $injector.get('$sanitize');
        }
        function matchUrl(matcher, parsedUrl) {
          if (matcher === 'self') {
            return urlIsSameOrigin(parsedUrl);
          } else {
            return !!matcher.exec(parsedUrl.href);
          }
        }
        function isResourceUrlAllowedByPolicy(url) {
          var parsedUrl = urlResolve(url.toString());
          var i, n, allowed = false;
          for (i = 0, n = resourceUrlWhitelist.length; i < n; i++) {
            if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
              allowed = true;
              break;
            }
          }
          if (allowed) {
            for (i = 0, n = resourceUrlBlacklist.length; i < n; i++) {
              if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                allowed = false;
                break;
              }
            }
          }
          return allowed;
        }
        function generateHolderType(base) {
          var holderType = function TrustedValueHolderType(trustedValue) {
            this.$$unwrapTrustedValue = function () {
              return trustedValue;
            };
          };
          if (base) {
            holderType.prototype = new base();
          }
          holderType.prototype.valueOf = function sceValueOf() {
            return this.$$unwrapTrustedValue();
          };
          holderType.prototype.toString = function sceToString() {
            return this.$$unwrapTrustedValue().toString();
          };
          return holderType;
        }
        var trustedValueHolderBase = generateHolderType(), byType = {};
        byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
        byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
        byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase);
        byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
        byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);
        function trustAs(type, trustedValue) {
          var constructor = byType.hasOwnProperty(type) ? byType[type] : null;
          if (!constructor) {
            throw $sceMinErr('icontext', 'Attempted to trust a value in invalid context. Context: {0}; Value: {1}', type, trustedValue);
          }
          if (trustedValue === null || trustedValue === undefined || trustedValue === '') {
            return trustedValue;
          }
          if (typeof trustedValue !== 'string') {
            throw $sceMinErr('itype', 'Attempted to trust a non-string value in a content requiring a string: Context: {0}', type);
          }
          return new constructor(trustedValue);
        }
        function valueOf(maybeTrusted) {
          if (maybeTrusted instanceof trustedValueHolderBase) {
            return maybeTrusted.$$unwrapTrustedValue();
          } else {
            return maybeTrusted;
          }
        }
        function getTrusted(type, maybeTrusted) {
          if (maybeTrusted === null || maybeTrusted === undefined || maybeTrusted === '') {
            return maybeTrusted;
          }
          var constructor = byType.hasOwnProperty(type) ? byType[type] : null;
          if (constructor && maybeTrusted instanceof constructor) {
            return maybeTrusted.$$unwrapTrustedValue();
          }
          if (type === SCE_CONTEXTS.RESOURCE_URL) {
            if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
              return maybeTrusted;
            } else {
              throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
            }
          } else if (type === SCE_CONTEXTS.HTML) {
            return htmlSanitizer(maybeTrusted);
          }
          throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
        }
        return {
          trustAs: trustAs,
          getTrusted: getTrusted,
          valueOf: valueOf
        };
      }
    ];
  }
  function $SceProvider() {
    var enabled = true;
    this.enabled = function (value) {
      if (arguments.length) {
        enabled = !!value;
      }
      return enabled;
    };
    this.$get = [
      '$parse',
      '$document',
      '$sceDelegate',
      function ($parse, $document, $sceDelegate) {
        if (enabled && msie) {
          var documentMode = $document[0].documentMode;
          if (documentMode !== undefined && documentMode < 8) {
            throw $sceMinErr('iequirks', 'Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks ' + 'mode.  You can fix this by adding the text <!doctype html> to the top of your HTML ' + 'document.  See http://docs.angularjs.org/api/ng.$sce for more information.');
          }
        }
        var sce = copy(SCE_CONTEXTS);
        sce.isEnabled = function () {
          return enabled;
        };
        sce.trustAs = $sceDelegate.trustAs;
        sce.getTrusted = $sceDelegate.getTrusted;
        sce.valueOf = $sceDelegate.valueOf;
        if (!enabled) {
          sce.trustAs = sce.getTrusted = function (type, value) {
            return value;
          }, sce.valueOf = identity;
        }
        sce.parseAs = function sceParseAs(type, expr) {
          var parsed = $parse(expr);
          if (parsed.literal && parsed.constant) {
            return parsed;
          } else {
            return function sceParseAsTrusted(self, locals) {
              return sce.getTrusted(type, parsed(self, locals));
            };
          }
        };
        var parse = sce.parseAs, getTrusted = sce.getTrusted, trustAs = sce.trustAs;
        forEach(SCE_CONTEXTS, function (enumValue, name) {
          var lName = lowercase(name);
          sce[camelCase('parse_as_' + lName)] = function (expr) {
            return parse(enumValue, expr);
          };
          sce[camelCase('get_trusted_' + lName)] = function (value) {
            return getTrusted(enumValue, value);
          };
          sce[camelCase('trust_as_' + lName)] = function (value) {
            return trustAs(enumValue, value);
          };
        });
        return sce;
      }
    ];
  }
  function $SnifferProvider() {
    this.$get = [
      '$window',
      '$document',
      function ($window, $document) {
        var eventSupport = {}, android = int((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]), boxee = /Boxee/i.test(($window.navigator || {}).userAgent), document = $document[0] || {}, vendorPrefix, vendorRegex = /^(Moz|webkit|O|ms)(?=[A-Z])/, bodyStyle = document.body && document.body.style, transitions = false, animations = false, match;
        if (bodyStyle) {
          for (var prop in bodyStyle) {
            if (match = vendorRegex.exec(prop)) {
              vendorPrefix = match[0];
              vendorPrefix = vendorPrefix.substr(0, 1).toUpperCase() + vendorPrefix.substr(1);
              break;
            }
          }
          if (!vendorPrefix) {
            vendorPrefix = 'WebkitOpacity' in bodyStyle && 'webkit';
          }
          transitions = !!('transition' in bodyStyle || vendorPrefix + 'Transition' in bodyStyle);
          animations = !!('animation' in bodyStyle || vendorPrefix + 'Animation' in bodyStyle);
          if (android && (!transitions || !animations)) {
            transitions = isString(document.body.style.webkitTransition);
            animations = isString(document.body.style.webkitAnimation);
          }
        }
        return {
          history: !!($window.history && $window.history.pushState && !(android < 4) && !boxee),
          hashchange: 'onhashchange' in $window && (!document.documentMode || document.documentMode > 7),
          hasEvent: function (event) {
            if (event == 'input' && msie == 9)
              return false;
            if (isUndefined(eventSupport[event])) {
              var divElm = document.createElement('div');
              eventSupport[event] = 'on' + event in divElm;
            }
            return eventSupport[event];
          },
          csp: document.securityPolicy ? document.securityPolicy.isActive : false,
          vendorPrefix: vendorPrefix,
          transitions: transitions,
          animations: animations
        };
      }
    ];
  }
  function $TimeoutProvider() {
    this.$get = [
      '$rootScope',
      '$browser',
      '$q',
      '$exceptionHandler',
      function ($rootScope, $browser, $q, $exceptionHandler) {
        var deferreds = {};
        function timeout(fn, delay, invokeApply) {
          var deferred = $q.defer(), promise = deferred.promise, skipApply = isDefined(invokeApply) && !invokeApply, timeoutId;
          timeoutId = $browser.defer(function () {
            try {
              deferred.resolve(fn());
            } catch (e) {
              deferred.reject(e);
              $exceptionHandler(e);
            } finally {
              delete deferreds[promise.$$timeoutId];
            }
            if (!skipApply)
              $rootScope.$apply();
          }, delay);
          promise.$$timeoutId = timeoutId;
          deferreds[timeoutId] = deferred;
          return promise;
        }
        timeout.cancel = function (promise) {
          if (promise && promise.$$timeoutId in deferreds) {
            deferreds[promise.$$timeoutId].reject('canceled');
            delete deferreds[promise.$$timeoutId];
            return $browser.defer.cancel(promise.$$timeoutId);
          }
          return false;
        };
        return timeout;
      }
    ];
  }
  var urlParsingNode = document.createElement('a');
  var originUrl = urlResolve(window.location.href, true);
  function urlResolve(url) {
    var href = url;
    if (msie) {
      urlParsingNode.setAttribute('href', href);
      href = urlParsingNode.href;
    }
    urlParsingNode.setAttribute('href', href);
    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
      hostname: urlParsingNode.hostname,
      port: urlParsingNode.port,
      pathname: urlParsingNode.pathname && urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
    };
  }
  function urlIsSameOrigin(requestUrl) {
    var parsed = isString(requestUrl) ? urlResolve(requestUrl) : requestUrl;
    return parsed.protocol === originUrl.protocol && parsed.host === originUrl.host;
  }
  function $WindowProvider() {
    this.$get = valueFn(window);
  }
  $FilterProvider.$inject = ['$provide'];
  function $FilterProvider($provide) {
    var suffix = 'Filter';
    function register(name, factory) {
      if (isObject(name)) {
        var filters = {};
        forEach(name, function (filter, key) {
          filters[key] = register(key, filter);
        });
        return filters;
      } else {
        return $provide.factory(name + suffix, factory);
      }
    }
    this.register = register;
    this.$get = [
      '$injector',
      function ($injector) {
        return function (name) {
          return $injector.get(name + suffix);
        };
      }
    ];
    register('currency', currencyFilter);
    register('date', dateFilter);
    register('filter', filterFilter);
    register('json', jsonFilter);
    register('limitTo', limitToFilter);
    register('lowercase', lowercaseFilter);
    register('number', numberFilter);
    register('orderBy', orderByFilter);
    register('uppercase', uppercaseFilter);
  }
  function filterFilter() {
    return function (array, expression, comperator) {
      if (!isArray(array))
        return array;
      var predicates = [];
      predicates.check = function (value) {
        for (var j = 0; j < predicates.length; j++) {
          if (!predicates[j](value)) {
            return false;
          }
        }
        return true;
      };
      switch (typeof comperator) {
      case 'function':
        break;
      case 'boolean':
        if (comperator == true) {
          comperator = function (obj, text) {
            return angular.equals(obj, text);
          };
          break;
        }
      default:
        comperator = function (obj, text) {
          text = ('' + text).toLowerCase();
          return ('' + obj).toLowerCase().indexOf(text) > -1;
        };
      }
      var search = function (obj, text) {
        if (typeof text == 'string' && text.charAt(0) === '!') {
          return !search(obj, text.substr(1));
        }
        switch (typeof obj) {
        case 'boolean':
        case 'number':
        case 'string':
          return comperator(obj, text);
        case 'object':
          switch (typeof text) {
          case 'object':
            return comperator(obj, text);
            break;
          default:
            for (var objKey in obj) {
              if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                return true;
              }
            }
            break;
          }
          return false;
        case 'array':
          for (var i = 0; i < obj.length; i++) {
            if (search(obj[i], text)) {
              return true;
            }
          }
          return false;
        default:
          return false;
        }
      };
      switch (typeof expression) {
      case 'boolean':
      case 'number':
      case 'string':
        expression = { $: expression };
      case 'object':
        for (var key in expression) {
          if (key == '$') {
            (function () {
              if (!expression[key])
                return;
              var path = key;
              predicates.push(function (value) {
                return search(value, expression[path]);
              });
            }());
          } else {
            (function () {
              if (typeof expression[key] == 'undefined') {
                return;
              }
              var path = key;
              predicates.push(function (value) {
                return search(getter(value, path), expression[path]);
              });
            }());
          }
        }
        break;
      case 'function':
        predicates.push(expression);
        break;
      default:
        return array;
      }
      var filtered = [];
      for (var j = 0; j < array.length; j++) {
        var value = array[j];
        if (predicates.check(value)) {
          filtered.push(value);
        }
      }
      return filtered;
    };
  }
  currencyFilter.$inject = ['$locale'];
  function currencyFilter($locale) {
    var formats = $locale.NUMBER_FORMATS;
    return function (amount, currencySymbol) {
      if (isUndefined(currencySymbol))
        currencySymbol = formats.CURRENCY_SYM;
      return formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, 2).replace(/\u00A4/g, currencySymbol);
    };
  }
  numberFilter.$inject = ['$locale'];
  function numberFilter($locale) {
    var formats = $locale.NUMBER_FORMATS;
    return function (number, fractionSize) {
      return formatNumber(number, formats.PATTERNS[0], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize);
    };
  }
  var DECIMAL_SEP = '.';
  function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
    if (isNaN(number) || !isFinite(number))
      return '';
    var isNegative = number < 0;
    number = Math.abs(number);
    var numStr = number + '', formatedText = '', parts = [];
    var hasExponent = false;
    if (numStr.indexOf('e') !== -1) {
      var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
      if (match && match[2] == '-' && match[3] > fractionSize + 1) {
        numStr = '0';
      } else {
        formatedText = numStr;
        hasExponent = true;
      }
    }
    if (!hasExponent) {
      var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;
      if (isUndefined(fractionSize)) {
        fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
      }
      var pow = Math.pow(10, fractionSize);
      number = Math.round(number * pow) / pow;
      var fraction = ('' + number).split(DECIMAL_SEP);
      var whole = fraction[0];
      fraction = fraction[1] || '';
      var pos = 0, lgroup = pattern.lgSize, group = pattern.gSize;
      if (whole.length >= lgroup + group) {
        pos = whole.length - lgroup;
        for (var i = 0; i < pos; i++) {
          if ((pos - i) % group === 0 && i !== 0) {
            formatedText += groupSep;
          }
          formatedText += whole.charAt(i);
        }
      }
      for (i = pos; i < whole.length; i++) {
        if ((whole.length - i) % lgroup === 0 && i !== 0) {
          formatedText += groupSep;
        }
        formatedText += whole.charAt(i);
      }
      while (fraction.length < fractionSize) {
        fraction += '0';
      }
      if (fractionSize && fractionSize !== '0')
        formatedText += decimalSep + fraction.substr(0, fractionSize);
    } else {
      if (fractionSize > 0 && number > -1 && number < 1) {
        formatedText = number.toFixed(fractionSize);
      }
    }
    parts.push(isNegative ? pattern.negPre : pattern.posPre);
    parts.push(formatedText);
    parts.push(isNegative ? pattern.negSuf : pattern.posSuf);
    return parts.join('');
  }
  function padNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
      neg = '-';
      num = -num;
    }
    num = '' + num;
    while (num.length < digits)
      num = '0' + num;
    if (trim)
      num = num.substr(num.length - digits);
    return neg + num;
  }
  function dateGetter(name, size, offset, trim) {
    offset = offset || 0;
    return function (date) {
      var value = date['get' + name]();
      if (offset > 0 || value > -offset)
        value += offset;
      if (value === 0 && offset == -12)
        value = 12;
      return padNumber(value, size, trim);
    };
  }
  function dateStrGetter(name, shortForm) {
    return function (date, formats) {
      var value = date['get' + name]();
      var get = uppercase(shortForm ? 'SHORT' + name : name);
      return formats[get][value];
    };
  }
  function timeZoneGetter(date) {
    var zone = -1 * date.getTimezoneOffset();
    var paddedZone = zone >= 0 ? '+' : '';
    paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
    return paddedZone;
  }
  function ampmGetter(date, formats) {
    return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
  }
  var DATE_FORMATS = {
      yyyy: dateGetter('FullYear', 4),
      yy: dateGetter('FullYear', 2, 0, true),
      y: dateGetter('FullYear', 1),
      MMMM: dateStrGetter('Month'),
      MMM: dateStrGetter('Month', true),
      MM: dateGetter('Month', 2, 1),
      M: dateGetter('Month', 1, 1),
      dd: dateGetter('Date', 2),
      d: dateGetter('Date', 1),
      HH: dateGetter('Hours', 2),
      H: dateGetter('Hours', 1),
      hh: dateGetter('Hours', 2, -12),
      h: dateGetter('Hours', 1, -12),
      mm: dateGetter('Minutes', 2),
      m: dateGetter('Minutes', 1),
      ss: dateGetter('Seconds', 2),
      s: dateGetter('Seconds', 1),
      sss: dateGetter('Milliseconds', 3),
      EEEE: dateStrGetter('Day'),
      EEE: dateStrGetter('Day', true),
      a: ampmGetter,
      Z: timeZoneGetter
    };
  var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/, NUMBER_STRING = /^\-?\d+$/;
  dateFilter.$inject = ['$locale'];
  function dateFilter($locale) {
    var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
    function jsonStringToDate(string) {
      var match;
      if (match = string.match(R_ISO8601_STR)) {
        var date = new Date(0), tzHour = 0, tzMin = 0, dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear, timeSetter = match[8] ? date.setUTCHours : date.setHours;
        if (match[9]) {
          tzHour = int(match[9] + match[10]);
          tzMin = int(match[9] + match[11]);
        }
        dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
        var h = int(match[4] || 0) - tzHour;
        var m = int(match[5] || 0) - tzMin;
        var s = int(match[6] || 0);
        var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
        timeSetter.call(date, h, m, s, ms);
        return date;
      }
      return string;
    }
    return function (date, format) {
      var text = '', parts = [], fn, match;
      format = format || 'mediumDate';
      format = $locale.DATETIME_FORMATS[format] || format;
      if (isString(date)) {
        if (NUMBER_STRING.test(date)) {
          date = int(date);
        } else {
          date = jsonStringToDate(date);
        }
      }
      if (isNumber(date)) {
        date = new Date(date);
      }
      if (!isDate(date)) {
        return date;
      }
      while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
          parts = concat(parts, match, 1);
          format = parts.pop();
        } else {
          parts.push(format);
          format = null;
        }
      }
      forEach(parts, function (value) {
        fn = DATE_FORMATS[value];
        text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
      });
      return text;
    };
  }
  function jsonFilter() {
    return function (object) {
      return toJson(object, true);
    };
  }
  var lowercaseFilter = valueFn(lowercase);
  var uppercaseFilter = valueFn(uppercase);
  function limitToFilter() {
    return function (input, limit) {
      if (!isArray(input) && !isString(input))
        return input;
      limit = int(limit);
      if (isString(input)) {
        if (limit) {
          return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
        } else {
          return '';
        }
      }
      var out = [], i, n;
      if (limit > input.length)
        limit = input.length;
      else if (limit < -input.length)
        limit = -input.length;
      if (limit > 0) {
        i = 0;
        n = limit;
      } else {
        i = input.length + limit;
        n = input.length;
      }
      for (; i < n; i++) {
        out.push(input[i]);
      }
      return out;
    };
  }
  orderByFilter.$inject = ['$parse'];
  function orderByFilter($parse) {
    return function (array, sortPredicate, reverseOrder) {
      if (!isArray(array))
        return array;
      if (!sortPredicate)
        return array;
      sortPredicate = isArray(sortPredicate) ? sortPredicate : [sortPredicate];
      sortPredicate = map(sortPredicate, function (predicate) {
        var descending = false, get = predicate || identity;
        if (isString(predicate)) {
          if (predicate.charAt(0) == '+' || predicate.charAt(0) == '-') {
            descending = predicate.charAt(0) == '-';
            predicate = predicate.substring(1);
          }
          get = $parse(predicate);
        }
        return reverseComparator(function (a, b) {
          return compare(get(a), get(b));
        }, descending);
      });
      var arrayCopy = [];
      for (var i = 0; i < array.length; i++) {
        arrayCopy.push(array[i]);
      }
      return arrayCopy.sort(reverseComparator(comparator, reverseOrder));
      function comparator(o1, o2) {
        for (var i = 0; i < sortPredicate.length; i++) {
          var comp = sortPredicate[i](o1, o2);
          if (comp !== 0)
            return comp;
        }
        return 0;
      }
      function reverseComparator(comp, descending) {
        return toBoolean(descending) ? function (a, b) {
          return comp(b, a);
        } : comp;
      }
      function compare(v1, v2) {
        var t1 = typeof v1;
        var t2 = typeof v2;
        if (t1 == t2) {
          if (t1 == 'string') {
            v1 = v1.toLowerCase();
            v2 = v2.toLowerCase();
          }
          if (v1 === v2)
            return 0;
          return v1 < v2 ? -1 : 1;
        } else {
          return t1 < t2 ? -1 : 1;
        }
      }
    };
  }
  function ngDirective(directive) {
    if (isFunction(directive)) {
      directive = { link: directive };
    }
    directive.restrict = directive.restrict || 'AC';
    return valueFn(directive);
  }
  var htmlAnchorDirective = valueFn({
      restrict: 'E',
      compile: function (element, attr) {
        if (msie <= 8) {
          if (!attr.href && !attr.name) {
            attr.$set('href', '');
          }
          element.append(document.createComment('IE fix'));
        }
        return function (scope, element) {
          element.on('click', function (event) {
            if (!element.attr('href')) {
              event.preventDefault();
            }
          });
        };
      }
    });
  var ngAttributeAliasDirectives = {};
  forEach(BOOLEAN_ATTR, function (propName, attrName) {
    if (propName == 'multiple')
      return;
    var normalized = directiveNormalize('ng-' + attrName);
    ngAttributeAliasDirectives[normalized] = function () {
      return {
        priority: 100,
        compile: function () {
          return function (scope, element, attr) {
            scope.$watch(attr[normalized], function ngBooleanAttrWatchAction(value) {
              attr.$set(attrName, !!value);
            });
          };
        }
      };
    };
  });
  forEach([
    'src',
    'srcset',
    'href'
  ], function (attrName) {
    var normalized = directiveNormalize('ng-' + attrName);
    ngAttributeAliasDirectives[normalized] = function () {
      return {
        priority: 99,
        link: function (scope, element, attr) {
          attr.$observe(normalized, function (value) {
            if (!value)
              return;
            attr.$set(attrName, value);
            if (msie)
              element.prop(attrName, attr[attrName]);
          });
        }
      };
    };
  });
  var nullFormCtrl = {
      $addControl: noop,
      $removeControl: noop,
      $setValidity: noop,
      $setDirty: noop,
      $setPristine: noop
    };
  FormController.$inject = [
    '$element',
    '$attrs',
    '$scope'
  ];
  function FormController(element, attrs) {
    var form = this, parentForm = element.parent().controller('form') || nullFormCtrl, invalidCount = 0, errors = form.$error = {}, controls = [];
    form.$name = attrs.name || attrs.ngForm;
    form.$dirty = false;
    form.$pristine = true;
    form.$valid = true;
    form.$invalid = false;
    parentForm.$addControl(form);
    element.addClass(PRISTINE_CLASS);
    toggleValidCss(true);
    function toggleValidCss(isValid, validationErrorKey) {
      validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
      element.removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
    }
    form.$addControl = function (control) {
      assertNotHasOwnProperty(control.$name, 'input');
      controls.push(control);
      if (control.$name) {
        form[control.$name] = control;
      }
    };
    form.$removeControl = function (control) {
      if (control.$name && form[control.$name] === control) {
        delete form[control.$name];
      }
      forEach(errors, function (queue, validationToken) {
        form.$setValidity(validationToken, true, control);
      });
      arrayRemove(controls, control);
    };
    form.$setValidity = function (validationToken, isValid, control) {
      var queue = errors[validationToken];
      if (isValid) {
        if (queue) {
          arrayRemove(queue, control);
          if (!queue.length) {
            invalidCount--;
            if (!invalidCount) {
              toggleValidCss(isValid);
              form.$valid = true;
              form.$invalid = false;
            }
            errors[validationToken] = false;
            toggleValidCss(true, validationToken);
            parentForm.$setValidity(validationToken, true, form);
          }
        }
      } else {
        if (!invalidCount) {
          toggleValidCss(isValid);
        }
        if (queue) {
          if (includes(queue, control))
            return;
        } else {
          errors[validationToken] = queue = [];
          invalidCount++;
          toggleValidCss(false, validationToken);
          parentForm.$setValidity(validationToken, false, form);
        }
        queue.push(control);
        form.$valid = false;
        form.$invalid = true;
      }
    };
    form.$setDirty = function () {
      element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
      form.$dirty = true;
      form.$pristine = false;
      parentForm.$setDirty();
    };
    form.$setPristine = function () {
      element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
      form.$dirty = false;
      form.$pristine = true;
      forEach(controls, function (control) {
        control.$setPristine();
      });
    };
  }
  var formDirectiveFactory = function (isNgForm) {
    return [
      '$timeout',
      function ($timeout) {
        var formDirective = {
            name: 'form',
            restrict: isNgForm ? 'EAC' : 'E',
            controller: FormController,
            compile: function () {
              return {
                pre: function (scope, formElement, attr, controller) {
                  if (!attr.action) {
                    var preventDefaultListener = function (event) {
                      event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    };
                    addEventListenerFn(formElement[0], 'submit', preventDefaultListener);
                    formElement.on('$destroy', function () {
                      $timeout(function () {
                        removeEventListenerFn(formElement[0], 'submit', preventDefaultListener);
                      }, 0, false);
                    });
                  }
                  var parentFormCtrl = formElement.parent().controller('form'), alias = attr.name || attr.ngForm;
                  if (alias) {
                    setter(scope, alias, controller, alias);
                  }
                  if (parentFormCtrl) {
                    formElement.on('$destroy', function () {
                      parentFormCtrl.$removeControl(controller);
                      if (alias) {
                        setter(scope, alias, undefined, alias);
                      }
                      extend(controller, nullFormCtrl);
                    });
                  }
                }
              };
            }
          };
        return formDirective;
      }
    ];
  };
  var formDirective = formDirectiveFactory();
  var ngFormDirective = formDirectiveFactory(true);
  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
  var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
  var inputType = {
      'text': textInputType,
      'number': numberInputType,
      'url': urlInputType,
      'email': emailInputType,
      'radio': radioInputType,
      'checkbox': checkboxInputType,
      'hidden': noop,
      'button': noop,
      'submit': noop,
      'reset': noop
    };
  function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
    var listener = function () {
      var value = element.val();
      if (toBoolean(attr.ngTrim || 'T')) {
        value = trim(value);
      }
      if (ctrl.$viewValue !== value) {
        scope.$apply(function () {
          ctrl.$setViewValue(value);
        });
      }
    };
    if ($sniffer.hasEvent('input')) {
      element.on('input', listener);
    } else {
      var timeout;
      var deferListener = function () {
        if (!timeout) {
          timeout = $browser.defer(function () {
            listener();
            timeout = null;
          });
        }
      };
      element.on('keydown', function (event) {
        var key = event.keyCode;
        if (key === 91 || 15 < key && key < 19 || 37 <= key && key <= 40)
          return;
        deferListener();
      });
      element.on('change', listener);
      if ($sniffer.hasEvent('paste')) {
        element.on('paste cut', deferListener);
      }
    }
    ctrl.$render = function () {
      element.val(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
    };
    var pattern = attr.ngPattern, patternValidator, match;
    var validate = function (regexp, value) {
      if (ctrl.$isEmpty(value) || regexp.test(value)) {
        ctrl.$setValidity('pattern', true);
        return value;
      } else {
        ctrl.$setValidity('pattern', false);
        return undefined;
      }
    };
    if (pattern) {
      match = pattern.match(/^\/(.*)\/([gim]*)$/);
      if (match) {
        pattern = new RegExp(match[1], match[2]);
        patternValidator = function (value) {
          return validate(pattern, value);
        };
      } else {
        patternValidator = function (value) {
          var patternObj = scope.$eval(pattern);
          if (!patternObj || !patternObj.test) {
            throw minErr('ngPattern')('noregexp', 'Expected {0} to be a RegExp but was {1}. Element: {2}', pattern, patternObj, startingTag(element));
          }
          return validate(patternObj, value);
        };
      }
      ctrl.$formatters.push(patternValidator);
      ctrl.$parsers.push(patternValidator);
    }
    if (attr.ngMinlength) {
      var minlength = int(attr.ngMinlength);
      var minLengthValidator = function (value) {
        if (!ctrl.$isEmpty(value) && value.length < minlength) {
          ctrl.$setValidity('minlength', false);
          return undefined;
        } else {
          ctrl.$setValidity('minlength', true);
          return value;
        }
      };
      ctrl.$parsers.push(minLengthValidator);
      ctrl.$formatters.push(minLengthValidator);
    }
    if (attr.ngMaxlength) {
      var maxlength = int(attr.ngMaxlength);
      var maxLengthValidator = function (value) {
        if (!ctrl.$isEmpty(value) && value.length > maxlength) {
          ctrl.$setValidity('maxlength', false);
          return undefined;
        } else {
          ctrl.$setValidity('maxlength', true);
          return value;
        }
      };
      ctrl.$parsers.push(maxLengthValidator);
      ctrl.$formatters.push(maxLengthValidator);
    }
  }
  function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
    textInputType(scope, element, attr, ctrl, $sniffer, $browser);
    ctrl.$parsers.push(function (value) {
      var empty = ctrl.$isEmpty(value);
      if (empty || NUMBER_REGEXP.test(value)) {
        ctrl.$setValidity('number', true);
        return value === '' ? null : empty ? value : parseFloat(value);
      } else {
        ctrl.$setValidity('number', false);
        return undefined;
      }
    });
    ctrl.$formatters.push(function (value) {
      return ctrl.$isEmpty(value) ? '' : '' + value;
    });
    if (attr.min) {
      var min = parseFloat(attr.min);
      var minValidator = function (value) {
        if (!ctrl.$isEmpty(value) && value < min) {
          ctrl.$setValidity('min', false);
          return undefined;
        } else {
          ctrl.$setValidity('min', true);
          return value;
        }
      };
      ctrl.$parsers.push(minValidator);
      ctrl.$formatters.push(minValidator);
    }
    if (attr.max) {
      var max = parseFloat(attr.max);
      var maxValidator = function (value) {
        if (!ctrl.$isEmpty(value) && value > max) {
          ctrl.$setValidity('max', false);
          return undefined;
        } else {
          ctrl.$setValidity('max', true);
          return value;
        }
      };
      ctrl.$parsers.push(maxValidator);
      ctrl.$formatters.push(maxValidator);
    }
    ctrl.$formatters.push(function (value) {
      if (ctrl.$isEmpty(value) || isNumber(value)) {
        ctrl.$setValidity('number', true);
        return value;
      } else {
        ctrl.$setValidity('number', false);
        return undefined;
      }
    });
  }
  function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
    textInputType(scope, element, attr, ctrl, $sniffer, $browser);
    var urlValidator = function (value) {
      if (ctrl.$isEmpty(value) || URL_REGEXP.test(value)) {
        ctrl.$setValidity('url', true);
        return value;
      } else {
        ctrl.$setValidity('url', false);
        return undefined;
      }
    };
    ctrl.$formatters.push(urlValidator);
    ctrl.$parsers.push(urlValidator);
  }
  function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
    textInputType(scope, element, attr, ctrl, $sniffer, $browser);
    var emailValidator = function (value) {
      if (ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value)) {
        ctrl.$setValidity('email', true);
        return value;
      } else {
        ctrl.$setValidity('email', false);
        return undefined;
      }
    };
    ctrl.$formatters.push(emailValidator);
    ctrl.$parsers.push(emailValidator);
  }
  function radioInputType(scope, element, attr, ctrl) {
    if (isUndefined(attr.name)) {
      element.attr('name', nextUid());
    }
    element.on('click', function () {
      if (element[0].checked) {
        scope.$apply(function () {
          ctrl.$setViewValue(attr.value);
        });
      }
    });
    ctrl.$render = function () {
      var value = attr.value;
      element[0].checked = value == ctrl.$viewValue;
    };
    attr.$observe('value', ctrl.$render);
  }
  function checkboxInputType(scope, element, attr, ctrl) {
    var trueValue = attr.ngTrueValue, falseValue = attr.ngFalseValue;
    if (!isString(trueValue))
      trueValue = true;
    if (!isString(falseValue))
      falseValue = false;
    element.on('click', function () {
      scope.$apply(function () {
        ctrl.$setViewValue(element[0].checked);
      });
    });
    ctrl.$render = function () {
      element[0].checked = ctrl.$viewValue;
    };
    ctrl.$isEmpty = function (value) {
      return value !== trueValue;
    };
    ctrl.$formatters.push(function (value) {
      return value === trueValue;
    });
    ctrl.$parsers.push(function (value) {
      return value ? trueValue : falseValue;
    });
  }
  var inputDirective = [
      '$browser',
      '$sniffer',
      function ($browser, $sniffer) {
        return {
          restrict: 'E',
          require: '?ngModel',
          link: function (scope, element, attr, ctrl) {
            if (ctrl) {
              (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrl, $sniffer, $browser);
            }
          }
        };
      }
    ];
  var VALID_CLASS = 'ng-valid', INVALID_CLASS = 'ng-invalid', PRISTINE_CLASS = 'ng-pristine', DIRTY_CLASS = 'ng-dirty';
  var NgModelController = [
      '$scope',
      '$exceptionHandler',
      '$attrs',
      '$element',
      '$parse',
      function ($scope, $exceptionHandler, $attr, $element, $parse) {
        this.$viewValue = Number.NaN;
        this.$modelValue = Number.NaN;
        this.$parsers = [];
        this.$formatters = [];
        this.$viewChangeListeners = [];
        this.$pristine = true;
        this.$dirty = false;
        this.$valid = true;
        this.$invalid = false;
        this.$name = $attr.name;
        var ngModelGet = $parse($attr.ngModel), ngModelSet = ngModelGet.assign;
        if (!ngModelSet) {
          throw minErr('ngModel')('nonassign', 'Expression \'{0}\' is non-assignable. Element: {1}', $attr.ngModel, startingTag($element));
        }
        this.$render = noop;
        this.$isEmpty = function (value) {
          return isUndefined(value) || value === '' || value === null || value !== value;
        };
        var parentForm = $element.inheritedData('$formController') || nullFormCtrl, invalidCount = 0, $error = this.$error = {};
        $element.addClass(PRISTINE_CLASS);
        toggleValidCss(true);
        function toggleValidCss(isValid, validationErrorKey) {
          validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
          $element.removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
        }
        this.$setValidity = function (validationErrorKey, isValid) {
          if ($error[validationErrorKey] === !isValid)
            return;
          if (isValid) {
            if ($error[validationErrorKey])
              invalidCount--;
            if (!invalidCount) {
              toggleValidCss(true);
              this.$valid = true;
              this.$invalid = false;
            }
          } else {
            toggleValidCss(false);
            this.$invalid = true;
            this.$valid = false;
            invalidCount++;
          }
          $error[validationErrorKey] = !isValid;
          toggleValidCss(isValid, validationErrorKey);
          parentForm.$setValidity(validationErrorKey, isValid, this);
        };
        this.$setPristine = function () {
          this.$dirty = false;
          this.$pristine = true;
          $element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
        };
        this.$setViewValue = function (value) {
          this.$viewValue = value;
          if (this.$pristine) {
            this.$dirty = true;
            this.$pristine = false;
            $element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
            parentForm.$setDirty();
          }
          forEach(this.$parsers, function (fn) {
            value = fn(value);
          });
          if (this.$modelValue !== value) {
            this.$modelValue = value;
            ngModelSet($scope, value);
            forEach(this.$viewChangeListeners, function (listener) {
              try {
                listener();
              } catch (e) {
                $exceptionHandler(e);
              }
            });
          }
        };
        var ctrl = this;
        $scope.$watch(function ngModelWatch() {
          var value = ngModelGet($scope);
          if (ctrl.$modelValue !== value) {
            var formatters = ctrl.$formatters, idx = formatters.length;
            ctrl.$modelValue = value;
            while (idx--) {
              value = formatters[idx](value);
            }
            if (ctrl.$viewValue !== value) {
              ctrl.$viewValue = value;
              ctrl.$render();
            }
          }
        });
      }
    ];
  var ngModelDirective = function () {
    return {
      require: [
        'ngModel',
        '^?form'
      ],
      controller: NgModelController,
      link: function (scope, element, attr, ctrls) {
        var modelCtrl = ctrls[0], formCtrl = ctrls[1] || nullFormCtrl;
        formCtrl.$addControl(modelCtrl);
        element.on('$destroy', function () {
          formCtrl.$removeControl(modelCtrl);
        });
      }
    };
  };
  var ngChangeDirective = valueFn({
      require: 'ngModel',
      link: function (scope, element, attr, ctrl) {
        ctrl.$viewChangeListeners.push(function () {
          scope.$eval(attr.ngChange);
        });
      }
    });
  var requiredDirective = function () {
    return {
      require: '?ngModel',
      link: function (scope, elm, attr, ctrl) {
        if (!ctrl)
          return;
        attr.required = true;
        var validator = function (value) {
          if (attr.required && ctrl.$isEmpty(value)) {
            ctrl.$setValidity('required', false);
            return;
          } else {
            ctrl.$setValidity('required', true);
            return value;
          }
        };
        ctrl.$formatters.push(validator);
        ctrl.$parsers.unshift(validator);
        attr.$observe('required', function () {
          validator(ctrl.$viewValue);
        });
      }
    };
  };
  var ngListDirective = function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, ctrl) {
        var match = /\/(.*)\//.exec(attr.ngList), separator = match && new RegExp(match[1]) || attr.ngList || ',';
        var parse = function (viewValue) {
          if (isUndefined(viewValue))
            return;
          var list = [];
          if (viewValue) {
            forEach(viewValue.split(separator), function (value) {
              if (value)
                list.push(trim(value));
            });
          }
          return list;
        };
        ctrl.$parsers.push(parse);
        ctrl.$formatters.push(function (value) {
          if (isArray(value)) {
            return value.join(', ');
          }
          return undefined;
        });
        ctrl.$isEmpty = function (value) {
          return !value || !value.length;
        };
      }
    };
  };
  var CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/;
  var ngValueDirective = function () {
    return {
      priority: 100,
      compile: function (tpl, tplAttr) {
        if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
          return function ngValueConstantLink(scope, elm, attr) {
            attr.$set('value', scope.$eval(attr.ngValue));
          };
        } else {
          return function ngValueLink(scope, elm, attr) {
            scope.$watch(attr.ngValue, function valueWatchAction(value) {
              attr.$set('value', value);
            });
          };
        }
      }
    };
  };
  var ngBindDirective = ngDirective(function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.ngBind);
      scope.$watch(attr.ngBind, function ngBindWatchAction(value) {
        element.text(value == undefined ? '' : value);
      });
    });
  var ngBindTemplateDirective = [
      '$interpolate',
      function ($interpolate) {
        return function (scope, element, attr) {
          var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
          element.addClass('ng-binding').data('$binding', interpolateFn);
          attr.$observe('ngBindTemplate', function (value) {
            element.text(value);
          });
        };
      }
    ];
  var ngBindHtmlDirective = [
      '$sce',
      '$parse',
      function ($sce, $parse) {
        return function (scope, element, attr) {
          element.addClass('ng-binding').data('$binding', attr.ngBindHtml);
          var parsed = $parse(attr.ngBindHtml);
          function getStringValue() {
            return (parsed(scope) || '').toString();
          }
          scope.$watch(getStringValue, function ngBindHtmlWatchAction(value) {
            element.html($sce.getTrustedHtml(parsed(scope)) || '');
          });
        };
      }
    ];
  function classDirective(name, selector) {
    name = 'ngClass' + name;
    return function () {
      return {
        restrict: 'AC',
        link: function (scope, element, attr) {
          var oldVal = undefined;
          scope.$watch(attr[name], ngClassWatchAction, true);
          attr.$observe('class', function (value) {
            ngClassWatchAction(scope.$eval(attr[name]));
          });
          if (name !== 'ngClass') {
            scope.$watch('$index', function ($index, old$index) {
              var mod = $index & 1;
              if (mod !== old$index & 1) {
                if (mod === selector) {
                  addClass(scope.$eval(attr[name]));
                } else {
                  removeClass(scope.$eval(attr[name]));
                }
              }
            });
          }
          function ngClassWatchAction(newVal) {
            if (selector === true || scope.$index % 2 === selector) {
              if (oldVal && !equals(newVal, oldVal)) {
                removeClass(oldVal);
              }
              addClass(newVal);
            }
            oldVal = copy(newVal);
          }
          function removeClass(classVal) {
            attr.$removeClass(flattenClasses(classVal));
          }
          function addClass(classVal) {
            attr.$addClass(flattenClasses(classVal));
          }
          function flattenClasses(classVal) {
            if (isArray(classVal)) {
              return classVal.join(' ');
            } else if (isObject(classVal)) {
              var classes = [], i = 0;
              forEach(classVal, function (v, k) {
                if (v) {
                  classes.push(k);
                }
              });
              return classes.join(' ');
            }
            return classVal;
          }
          ;
        }
      };
    };
  }
  var ngClassDirective = classDirective('', true);
  var ngClassOddDirective = classDirective('Odd', 0);
  var ngClassEvenDirective = classDirective('Even', 1);
  var ngCloakDirective = ngDirective({
      compile: function (element, attr) {
        attr.$set('ngCloak', undefined);
        element.removeClass('ng-cloak');
      }
    });
  var ngControllerDirective = [function () {
        return {
          scope: true,
          controller: '@'
        };
      }];
  var ngCspDirective = [
      '$sniffer',
      function ($sniffer) {
        return {
          priority: 1000,
          compile: function () {
            $sniffer.csp = true;
          }
        };
      }
    ];
  var ngEventDirectives = {};
  forEach('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '), function (name) {
    var directiveName = directiveNormalize('ng-' + name);
    ngEventDirectives[directiveName] = [
      '$parse',
      function ($parse) {
        return function (scope, element, attr) {
          var fn = $parse(attr[directiveName]);
          element.on(lowercase(name), function (event) {
            scope.$apply(function () {
              fn(scope, { $event: event });
            });
          });
        };
      }
    ];
  });
  var ngIfDirective = [
      '$animate',
      function ($animate) {
        return {
          transclude: 'element',
          priority: 600,
          terminal: true,
          restrict: 'A',
          compile: function (element, attr, transclude) {
            return function ($scope, $element, $attr) {
              var childElement, childScope;
              $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {
                if (childElement) {
                  $animate.leave(childElement);
                  childElement = undefined;
                }
                if (childScope) {
                  childScope.$destroy();
                  childScope = undefined;
                }
                if (toBoolean(value)) {
                  childScope = $scope.$new();
                  transclude(childScope, function (clone) {
                    childElement = clone;
                    $animate.enter(clone, $element.parent(), $element);
                  });
                }
              });
            };
          }
        };
      }
    ];
  var ngIncludeDirective = [
      '$http',
      '$templateCache',
      '$anchorScroll',
      '$compile',
      '$animate',
      '$sce',
      function ($http, $templateCache, $anchorScroll, $compile, $animate, $sce) {
        return {
          restrict: 'ECA',
          priority: 400,
          terminal: true,
          transclude: 'element',
          compile: function (element, attr, transclusion) {
            var srcExp = attr.ngInclude || attr.src, onloadExp = attr.onload || '', autoScrollExp = attr.autoscroll;
            return function (scope, $element) {
              var changeCounter = 0, currentScope, currentElement;
              var cleanupLastIncludeContent = function () {
                if (currentScope) {
                  currentScope.$destroy();
                  currentScope = null;
                }
                if (currentElement) {
                  $animate.leave(currentElement);
                  currentElement = null;
                }
              };
              scope.$watch($sce.parseAsResourceUrl(srcExp), function ngIncludeWatchAction(src) {
                var thisChangeId = ++changeCounter;
                if (src) {
                  $http.get(src, { cache: $templateCache }).success(function (response) {
                    if (thisChangeId !== changeCounter)
                      return;
                    var newScope = scope.$new();
                    transclusion(newScope, function (clone) {
                      cleanupLastIncludeContent();
                      currentScope = newScope;
                      currentElement = clone;
                      currentElement.html(response);
                      $animate.enter(currentElement, null, $element);
                      $compile(currentElement.contents())(currentScope);
                      if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                        $anchorScroll();
                      }
                      currentScope.$emit('$includeContentLoaded');
                      scope.$eval(onloadExp);
                    });
                  }).error(function () {
                    if (thisChangeId === changeCounter)
                      cleanupLastIncludeContent();
                  });
                  scope.$emit('$includeContentRequested');
                } else {
                  cleanupLastIncludeContent();
                }
              });
            };
          }
        };
      }
    ];
  var ngInitDirective = ngDirective({
      compile: function () {
        return {
          pre: function (scope, element, attrs) {
            scope.$eval(attrs.ngInit);
          }
        };
      }
    });
  var ngNonBindableDirective = ngDirective({
      terminal: true,
      priority: 1000
    });
  var ngPluralizeDirective = [
      '$locale',
      '$interpolate',
      function ($locale, $interpolate) {
        var BRACE = /{}/g;
        return {
          restrict: 'EA',
          link: function (scope, element, attr) {
            var numberExp = attr.count, whenExp = attr.$attr.when && element.attr(attr.$attr.when), offset = attr.offset || 0, whens = scope.$eval(whenExp) || {}, whensExpFns = {}, startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), isWhen = /^when(Minus)?(.+)$/;
            forEach(attr, function (expression, attributeName) {
              if (isWhen.test(attributeName)) {
                whens[lowercase(attributeName.replace('when', '').replace('Minus', '-'))] = element.attr(attr.$attr[attributeName]);
              }
            });
            forEach(whens, function (expression, key) {
              whensExpFns[key] = $interpolate(expression.replace(BRACE, startSymbol + numberExp + '-' + offset + endSymbol));
            });
            scope.$watch(function ngPluralizeWatch() {
              var value = parseFloat(scope.$eval(numberExp));
              if (!isNaN(value)) {
                if (!(value in whens))
                  value = $locale.pluralCat(value - offset);
                return whensExpFns[value](scope, element, true);
              } else {
                return '';
              }
            }, function ngPluralizeWatchAction(newVal) {
              element.text(newVal);
            });
          }
        };
      }
    ];
  var ngRepeatDirective = [
      '$parse',
      '$animate',
      function ($parse, $animate) {
        var NG_REMOVED = '$$NG_REMOVED';
        var ngRepeatMinErr = minErr('ngRepeat');
        return {
          transclude: 'element',
          priority: 1000,
          terminal: true,
          compile: function (element, attr, linker) {
            return function ($scope, $element, $attr) {
              var expression = $attr.ngRepeat;
              var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/), trackByExp, trackByExpGetter, trackByIdExpFn, trackByIdArrayFn, trackByIdObjFn, lhs, rhs, valueIdentifier, keyIdentifier, hashFnLocals = { $id: hashKey };
              if (!match) {
                throw ngRepeatMinErr('iexp', 'Expected expression in form of \'_item_ in _collection_[ track by _id_]\' but got \'{0}\'.', expression);
              }
              lhs = match[1];
              rhs = match[2];
              trackByExp = match[4];
              if (trackByExp) {
                trackByExpGetter = $parse(trackByExp);
                trackByIdExpFn = function (key, value, index) {
                  if (keyIdentifier)
                    hashFnLocals[keyIdentifier] = key;
                  hashFnLocals[valueIdentifier] = value;
                  hashFnLocals.$index = index;
                  return trackByExpGetter($scope, hashFnLocals);
                };
              } else {
                trackByIdArrayFn = function (key, value) {
                  return hashKey(value);
                };
                trackByIdObjFn = function (key) {
                  return key;
                };
              }
              match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
              if (!match) {
                throw ngRepeatMinErr('iidexp', '\'_item_\' in \'_item_ in _collection_\' should be an identifier or \'(_key_, _value_)\' expression, but got \'{0}\'.', lhs);
              }
              valueIdentifier = match[3] || match[1];
              keyIdentifier = match[2];
              var lastBlockMap = {};
              $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
                var index, length, previousNode = $element[0], nextNode, nextBlockMap = {}, arrayLength, childScope, key, value, trackById, trackByIdFn, collectionKeys, block, nextBlockOrder = [], elementsToRemove;
                if (isArrayLike(collection)) {
                  collectionKeys = collection;
                  trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
                } else {
                  trackByIdFn = trackByIdExpFn || trackByIdObjFn;
                  collectionKeys = [];
                  for (key in collection) {
                    if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
                      collectionKeys.push(key);
                    }
                  }
                  collectionKeys.sort();
                }
                arrayLength = collectionKeys.length;
                length = nextBlockOrder.length = collectionKeys.length;
                for (index = 0; index < length; index++) {
                  key = collection === collectionKeys ? index : collectionKeys[index];
                  value = collection[key];
                  trackById = trackByIdFn(key, value, index);
                  assertNotHasOwnProperty(trackById, '`track by` id');
                  if (lastBlockMap.hasOwnProperty(trackById)) {
                    block = lastBlockMap[trackById];
                    delete lastBlockMap[trackById];
                    nextBlockMap[trackById] = block;
                    nextBlockOrder[index] = block;
                  } else if (nextBlockMap.hasOwnProperty(trackById)) {
                    forEach(nextBlockOrder, function (block) {
                      if (block && block.startNode)
                        lastBlockMap[block.id] = block;
                    });
                    throw ngRepeatMinErr('dupes', 'Duplicates in a repeater are not allowed. Use \'track by\' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}', expression, trackById);
                  } else {
                    nextBlockOrder[index] = { id: trackById };
                    nextBlockMap[trackById] = false;
                  }
                }
                for (key in lastBlockMap) {
                  if (lastBlockMap.hasOwnProperty(key)) {
                    block = lastBlockMap[key];
                    elementsToRemove = getBlockElements(block);
                    $animate.leave(elementsToRemove);
                    forEach(elementsToRemove, function (element) {
                      element[NG_REMOVED] = true;
                    });
                    block.scope.$destroy();
                  }
                }
                for (index = 0, length = collectionKeys.length; index < length; index++) {
                  key = collection === collectionKeys ? index : collectionKeys[index];
                  value = collection[key];
                  block = nextBlockOrder[index];
                  if (nextBlockOrder[index - 1])
                    previousNode = nextBlockOrder[index - 1].endNode;
                  if (block.startNode) {
                    childScope = block.scope;
                    nextNode = previousNode;
                    do {
                      nextNode = nextNode.nextSibling;
                    } while (nextNode && nextNode[NG_REMOVED]);
                    if (block.startNode == nextNode) {
                    } else {
                      $animate.move(getBlockElements(block), null, jqLite(previousNode));
                    }
                    previousNode = block.endNode;
                  } else {
                    childScope = $scope.$new();
                  }
                  childScope[valueIdentifier] = value;
                  if (keyIdentifier)
                    childScope[keyIdentifier] = key;
                  childScope.$index = index;
                  childScope.$first = index === 0;
                  childScope.$last = index === arrayLength - 1;
                  childScope.$middle = !(childScope.$first || childScope.$last);
                  childScope.$odd = !(childScope.$even = index % 2 == 0);
                  if (!block.startNode) {
                    linker(childScope, function (clone) {
                      clone[clone.length++] = document.createComment(' end ngRepeat: ' + expression + ' ');
                      $animate.enter(clone, null, jqLite(previousNode));
                      previousNode = clone;
                      block.scope = childScope;
                      block.startNode = previousNode && previousNode.endNode ? previousNode.endNode : clone[0];
                      block.endNode = clone[clone.length - 1];
                      nextBlockMap[block.id] = block;
                    });
                  }
                }
                lastBlockMap = nextBlockMap;
              });
            };
          }
        };
        function getBlockElements(block) {
          if (block.startNode === block.endNode) {
            return jqLite(block.startNode);
          }
          var element = block.startNode;
          var elements = [element];
          do {
            element = element.nextSibling;
            if (!element)
              break;
            elements.push(element);
          } while (element !== block.endNode);
          return jqLite(elements);
        }
      }
    ];
  var ngShowDirective = [
      '$animate',
      function ($animate) {
        return function (scope, element, attr) {
          scope.$watch(attr.ngShow, function ngShowWatchAction(value) {
            $animate[toBoolean(value) ? 'removeClass' : 'addClass'](element, 'ng-hide');
          });
        };
      }
    ];
  var ngHideDirective = [
      '$animate',
      function ($animate) {
        return function (scope, element, attr) {
          scope.$watch(attr.ngHide, function ngHideWatchAction(value) {
            $animate[toBoolean(value) ? 'addClass' : 'removeClass'](element, 'ng-hide');
          });
        };
      }
    ];
  var ngStyleDirective = ngDirective(function (scope, element, attr) {
      scope.$watch(attr.ngStyle, function ngStyleWatchAction(newStyles, oldStyles) {
        if (oldStyles && newStyles !== oldStyles) {
          forEach(oldStyles, function (val, style) {
            element.css(style, '');
          });
        }
        if (newStyles)
          element.css(newStyles);
      }, true);
    });
  var ngSwitchDirective = [
      '$animate',
      function ($animate) {
        return {
          restrict: 'EA',
          require: 'ngSwitch',
          controller: [
            '$scope',
            function ngSwitchController() {
              this.cases = {};
            }
          ],
          link: function (scope, element, attr, ngSwitchController) {
            var watchExpr = attr.ngSwitch || attr.on, selectedTranscludes, selectedElements, selectedScopes = [];
            scope.$watch(watchExpr, function ngSwitchWatchAction(value) {
              for (var i = 0, ii = selectedScopes.length; i < ii; i++) {
                selectedScopes[i].$destroy();
                $animate.leave(selectedElements[i]);
              }
              selectedElements = [];
              selectedScopes = [];
              if (selectedTranscludes = ngSwitchController.cases['!' + value] || ngSwitchController.cases['?']) {
                scope.$eval(attr.change);
                forEach(selectedTranscludes, function (selectedTransclude) {
                  var selectedScope = scope.$new();
                  selectedScopes.push(selectedScope);
                  selectedTransclude.transclude(selectedScope, function (caseElement) {
                    var anchor = selectedTransclude.element;
                    selectedElements.push(caseElement);
                    $animate.enter(caseElement, anchor.parent(), anchor);
                  });
                });
              }
            });
          }
        };
      }
    ];
  var ngSwitchWhenDirective = ngDirective({
      transclude: 'element',
      priority: 800,
      require: '^ngSwitch',
      compile: function (element, attrs, transclude) {
        return function (scope, element, attr, ctrl) {
          ctrl.cases['!' + attrs.ngSwitchWhen] = ctrl.cases['!' + attrs.ngSwitchWhen] || [];
          ctrl.cases['!' + attrs.ngSwitchWhen].push({
            transclude: transclude,
            element: element
          });
        };
      }
    });
  var ngSwitchDefaultDirective = ngDirective({
      transclude: 'element',
      priority: 800,
      require: '^ngSwitch',
      compile: function (element, attrs, transclude) {
        return function (scope, element, attr, ctrl) {
          ctrl.cases['?'] = ctrl.cases['?'] || [];
          ctrl.cases['?'].push({
            transclude: transclude,
            element: element
          });
        };
      }
    });
  var ngTranscludeDirective = ngDirective({
      controller: [
        '$element',
        '$transclude',
        function ($element, $transclude) {
          if (!$transclude) {
            throw minErr('ngTransclude')('orphan', 'Illegal use of ngTransclude directive in the template! ' + 'No parent directive that requires a transclusion found. ' + 'Element: {0}', startingTag($element));
          }
          this.$transclude = $transclude;
        }
      ],
      link: function ($scope, $element, $attrs, controller) {
        controller.$transclude(function (clone) {
          $element.html('');
          $element.append(clone);
        });
      }
    });
  var scriptDirective = [
      '$templateCache',
      function ($templateCache) {
        return {
          restrict: 'E',
          terminal: true,
          compile: function (element, attr) {
            if (attr.type == 'text/ng-template') {
              var templateUrl = attr.id, text = element[0].text;
              $templateCache.put(templateUrl, text);
            }
          }
        };
      }
    ];
  var ngOptionsMinErr = minErr('ngOptions');
  var ngOptionsDirective = valueFn({ terminal: true });
  var selectDirective = [
      '$compile',
      '$parse',
      function ($compile, $parse) {
        var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/, nullModelCtrl = { $setViewValue: noop };
        return {
          restrict: 'E',
          require: [
            'select',
            '?ngModel'
          ],
          controller: [
            '$element',
            '$scope',
            '$attrs',
            function ($element, $scope, $attrs) {
              var self = this, optionsMap = {}, ngModelCtrl = nullModelCtrl, nullOption, unknownOption;
              self.databound = $attrs.ngModel;
              self.init = function (ngModelCtrl_, nullOption_, unknownOption_) {
                ngModelCtrl = ngModelCtrl_;
                nullOption = nullOption_;
                unknownOption = unknownOption_;
              };
              self.addOption = function (value) {
                assertNotHasOwnProperty(value, '"option value"');
                optionsMap[value] = true;
                if (ngModelCtrl.$viewValue == value) {
                  $element.val(value);
                  if (unknownOption.parent())
                    unknownOption.remove();
                }
              };
              self.removeOption = function (value) {
                if (this.hasOption(value)) {
                  delete optionsMap[value];
                  if (ngModelCtrl.$viewValue == value) {
                    this.renderUnknownOption(value);
                  }
                }
              };
              self.renderUnknownOption = function (val) {
                var unknownVal = '? ' + hashKey(val) + ' ?';
                unknownOption.val(unknownVal);
                $element.prepend(unknownOption);
                $element.val(unknownVal);
                unknownOption.prop('selected', true);
              };
              self.hasOption = function (value) {
                return optionsMap.hasOwnProperty(value);
              };
              $scope.$on('$destroy', function () {
                self.renderUnknownOption = noop;
              });
            }
          ],
          link: function (scope, element, attr, ctrls) {
            if (!ctrls[1])
              return;
            var selectCtrl = ctrls[0], ngModelCtrl = ctrls[1], multiple = attr.multiple, optionsExp = attr.ngOptions, nullOption = false, emptyOption, optionTemplate = jqLite(document.createElement('option')), optGroupTemplate = jqLite(document.createElement('optgroup')), unknownOption = optionTemplate.clone();
            for (var i = 0, children = element.children(), ii = children.length; i < ii; i++) {
              if (children[i].value == '') {
                emptyOption = nullOption = children.eq(i);
                break;
              }
            }
            selectCtrl.init(ngModelCtrl, nullOption, unknownOption);
            if (multiple && (attr.required || attr.ngRequired)) {
              var requiredValidator = function (value) {
                ngModelCtrl.$setValidity('required', !attr.required || value && value.length);
                return value;
              };
              ngModelCtrl.$parsers.push(requiredValidator);
              ngModelCtrl.$formatters.unshift(requiredValidator);
              attr.$observe('required', function () {
                requiredValidator(ngModelCtrl.$viewValue);
              });
            }
            if (optionsExp)
              Options(scope, element, ngModelCtrl);
            else if (multiple)
              Multiple(scope, element, ngModelCtrl);
            else
              Single(scope, element, ngModelCtrl, selectCtrl);
            function Single(scope, selectElement, ngModelCtrl, selectCtrl) {
              ngModelCtrl.$render = function () {
                var viewValue = ngModelCtrl.$viewValue;
                if (selectCtrl.hasOption(viewValue)) {
                  if (unknownOption.parent())
                    unknownOption.remove();
                  selectElement.val(viewValue);
                  if (viewValue === '')
                    emptyOption.prop('selected', true);
                } else {
                  if (isUndefined(viewValue) && emptyOption) {
                    selectElement.val('');
                  } else {
                    selectCtrl.renderUnknownOption(viewValue);
                  }
                }
              };
              selectElement.on('change', function () {
                scope.$apply(function () {
                  if (unknownOption.parent())
                    unknownOption.remove();
                  ngModelCtrl.$setViewValue(selectElement.val());
                });
              });
            }
            function Multiple(scope, selectElement, ctrl) {
              var lastView;
              ctrl.$render = function () {
                var items = new HashMap(ctrl.$viewValue);
                forEach(selectElement.find('option'), function (option) {
                  option.selected = isDefined(items.get(option.value));
                });
              };
              scope.$watch(function selectMultipleWatch() {
                if (!equals(lastView, ctrl.$viewValue)) {
                  lastView = copy(ctrl.$viewValue);
                  ctrl.$render();
                }
              });
              selectElement.on('change', function () {
                scope.$apply(function () {
                  var array = [];
                  forEach(selectElement.find('option'), function (option) {
                    if (option.selected) {
                      array.push(option.value);
                    }
                  });
                  ctrl.$setViewValue(array);
                });
              });
            }
            function Options(scope, selectElement, ctrl) {
              var match;
              if (!(match = optionsExp.match(NG_OPTIONS_REGEXP))) {
                throw ngOptionsMinErr('iexp', 'Expected expression in form of \'_select_ (as _label_)? for (_key_,)?_value_ in _collection_\' but got \'{0}\'. Element: {1}', optionsExp, startingTag(selectElement));
              }
              var displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ''), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]), track = match[8], trackFn = track ? $parse(match[8]) : null, optionGroupsCache = [[{
                      element: selectElement,
                      label: ''
                    }]];
              if (nullOption) {
                $compile(nullOption)(scope);
                nullOption.removeClass('ng-scope');
                nullOption.remove();
              }
              selectElement.html('');
              selectElement.on('change', function () {
                scope.$apply(function () {
                  var optionGroup, collection = valuesFn(scope) || [], locals = {}, key, value, optionElement, index, groupIndex, length, groupLength, trackIndex;
                  if (multiple) {
                    value = [];
                    for (groupIndex = 0, groupLength = optionGroupsCache.length; groupIndex < groupLength; groupIndex++) {
                      optionGroup = optionGroupsCache[groupIndex];
                      for (index = 1, length = optionGroup.length; index < length; index++) {
                        if ((optionElement = optionGroup[index].element)[0].selected) {
                          key = optionElement.val();
                          if (keyName)
                            locals[keyName] = key;
                          if (trackFn) {
                            for (trackIndex = 0; trackIndex < collection.length; trackIndex++) {
                              locals[valueName] = collection[trackIndex];
                              if (trackFn(scope, locals) == key)
                                break;
                            }
                          } else {
                            locals[valueName] = collection[key];
                          }
                          value.push(valueFn(scope, locals));
                        }
                      }
                    }
                  } else {
                    key = selectElement.val();
                    if (key == '?') {
                      value = undefined;
                    } else if (key == '') {
                      value = null;
                    } else {
                      if (trackFn) {
                        for (trackIndex = 0; trackIndex < collection.length; trackIndex++) {
                          locals[valueName] = collection[trackIndex];
                          if (trackFn(scope, locals) == key) {
                            value = valueFn(scope, locals);
                            break;
                          }
                        }
                      } else {
                        locals[valueName] = collection[key];
                        if (keyName)
                          locals[keyName] = key;
                        value = valueFn(scope, locals);
                      }
                    }
                  }
                  ctrl.$setViewValue(value);
                });
              });
              ctrl.$render = render;
              scope.$watch(render);
              function render() {
                var optionGroups = { '': [] }, optionGroupNames = [''], optionGroupName, optionGroup, option, existingParent, existingOptions, existingOption, modelValue = ctrl.$modelValue, values = valuesFn(scope) || [], keys = keyName ? sortedKeys(values) : values, key, groupLength, length, groupIndex, index, locals = {}, selected, selectedSet = false, lastElement, element, label;
                if (multiple) {
                  if (trackFn && isArray(modelValue)) {
                    selectedSet = new HashMap([]);
                    for (var trackIndex = 0; trackIndex < modelValue.length; trackIndex++) {
                      locals[valueName] = modelValue[trackIndex];
                      selectedSet.put(trackFn(scope, locals), modelValue[trackIndex]);
                    }
                  } else {
                    selectedSet = new HashMap(modelValue);
                  }
                }
                for (index = 0; length = keys.length, index < length; index++) {
                  key = index;
                  if (keyName) {
                    key = keys[index];
                    if (key.charAt(0) === '$')
                      continue;
                    locals[keyName] = key;
                  }
                  locals[valueName] = values[key];
                  optionGroupName = groupByFn(scope, locals) || '';
                  if (!(optionGroup = optionGroups[optionGroupName])) {
                    optionGroup = optionGroups[optionGroupName] = [];
                    optionGroupNames.push(optionGroupName);
                  }
                  if (multiple) {
                    selected = selectedSet.remove(trackFn ? trackFn(scope, locals) : valueFn(scope, locals)) !== undefined;
                  } else {
                    if (trackFn) {
                      var modelCast = {};
                      modelCast[valueName] = modelValue;
                      selected = trackFn(scope, modelCast) === trackFn(scope, locals);
                    } else {
                      selected = modelValue === valueFn(scope, locals);
                    }
                    selectedSet = selectedSet || selected;
                  }
                  label = displayFn(scope, locals);
                  label = label === undefined ? '' : label;
                  optionGroup.push({
                    id: trackFn ? trackFn(scope, locals) : keyName ? keys[index] : index,
                    label: label,
                    selected: selected
                  });
                }
                if (!multiple) {
                  if (nullOption || modelValue === null) {
                    optionGroups[''].unshift({
                      id: '',
                      label: '',
                      selected: !selectedSet
                    });
                  } else if (!selectedSet) {
                    optionGroups[''].unshift({
                      id: '?',
                      label: '',
                      selected: true
                    });
                  }
                }
                for (groupIndex = 0, groupLength = optionGroupNames.length; groupIndex < groupLength; groupIndex++) {
                  optionGroupName = optionGroupNames[groupIndex];
                  optionGroup = optionGroups[optionGroupName];
                  if (optionGroupsCache.length <= groupIndex) {
                    existingParent = {
                      element: optGroupTemplate.clone().attr('label', optionGroupName),
                      label: optionGroup.label
                    };
                    existingOptions = [existingParent];
                    optionGroupsCache.push(existingOptions);
                    selectElement.append(existingParent.element);
                  } else {
                    existingOptions = optionGroupsCache[groupIndex];
                    existingParent = existingOptions[0];
                    if (existingParent.label != optionGroupName) {
                      existingParent.element.attr('label', existingParent.label = optionGroupName);
                    }
                  }
                  lastElement = null;
                  for (index = 0, length = optionGroup.length; index < length; index++) {
                    option = optionGroup[index];
                    if (existingOption = existingOptions[index + 1]) {
                      lastElement = existingOption.element;
                      if (existingOption.label !== option.label) {
                        lastElement.text(existingOption.label = option.label);
                      }
                      if (existingOption.id !== option.id) {
                        lastElement.val(existingOption.id = option.id);
                      }
                      if (lastElement[0].selected !== option.selected) {
                        lastElement.prop('selected', existingOption.selected = option.selected);
                      }
                    } else {
                      if (option.id === '' && nullOption) {
                        element = nullOption;
                      } else {
                        (element = optionTemplate.clone()).val(option.id).attr('selected', option.selected).text(option.label);
                      }
                      existingOptions.push(existingOption = {
                        element: element,
                        label: option.label,
                        id: option.id,
                        selected: option.selected
                      });
                      if (lastElement) {
                        lastElement.after(element);
                      } else {
                        existingParent.element.append(element);
                      }
                      lastElement = element;
                    }
                  }
                  index++;
                  while (existingOptions.length > index) {
                    existingOptions.pop().element.remove();
                  }
                }
                while (optionGroupsCache.length > groupIndex) {
                  optionGroupsCache.pop()[0].element.remove();
                }
              }
            }
          }
        };
      }
    ];
  var optionDirective = [
      '$interpolate',
      function ($interpolate) {
        var nullSelectCtrl = {
            addOption: noop,
            removeOption: noop
          };
        return {
          restrict: 'E',
          priority: 100,
          compile: function (element, attr) {
            if (isUndefined(attr.value)) {
              var interpolateFn = $interpolate(element.text(), true);
              if (!interpolateFn) {
                attr.$set('value', element.text());
              }
            }
            return function (scope, element, attr) {
              var selectCtrlName = '$selectController', parent = element.parent(), selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName);
              if (selectCtrl && selectCtrl.databound) {
                element.prop('selected', false);
              } else {
                selectCtrl = nullSelectCtrl;
              }
              if (interpolateFn) {
                scope.$watch(interpolateFn, function interpolateWatchAction(newVal, oldVal) {
                  attr.$set('value', newVal);
                  if (newVal !== oldVal)
                    selectCtrl.removeOption(oldVal);
                  selectCtrl.addOption(newVal);
                });
              } else {
                selectCtrl.addOption(attr.value);
              }
              element.on('$destroy', function () {
                selectCtrl.removeOption(attr.value);
              });
            };
          }
        };
      }
    ];
  var styleDirective = valueFn({
      restrict: 'E',
      terminal: true
    });
  bindJQuery();
  publishExternalAPI(angular);
  jqLite(document).ready(function () {
    angularInit(document, bootstrap);
  });
}(window, document));
angular.element(document).find('head').prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}</style>');
(function (window, angular, undefined) {
  'use strict';
  var ngRouteModule = angular.module('ngRoute', ['ng']).provider('$route', $RouteProvider);
  function $RouteProvider() {
    function inherit(parent, extra) {
      return angular.extend(new (angular.extend(function () {
      }, { prototype: parent }))(), extra);
    }
    var routes = {};
    this.when = function (path, route) {
      routes[path] = angular.extend({ reloadOnSearch: true }, route, path && pathRegExp(path, route));
      if (path) {
        var redirectPath = path[path.length - 1] == '/' ? path.substr(0, path.length - 1) : path + '/';
        routes[redirectPath] = angular.extend({ redirectTo: path }, pathRegExp(redirectPath, route));
      }
      return this;
    };
    function pathRegExp(path, opts) {
      var insensitive = opts.caseInsensitiveMatch, ret = {
          originalPath: path,
          regexp: path
        }, keys = ret.keys = [];
      path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?|\*])?/g, function (_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({
          name: key,
          optional: !!optional
        });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '');
      }).replace(/([\/$\*])/g, '\\$1');
      ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
      return ret;
    }
    this.otherwise = function (params) {
      this.when(null, params);
      return this;
    };
    this.$get = [
      '$rootScope',
      '$location',
      '$routeParams',
      '$q',
      '$injector',
      '$http',
      '$templateCache',
      '$sce',
      function ($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {
        var forceReload = false, $route = {
            routes: routes,
            reload: function () {
              forceReload = true;
              $rootScope.$evalAsync(updateRoute);
            }
          };
        $rootScope.$on('$locationChangeSuccess', updateRoute);
        return $route;
        function switchRouteMatcher(on, route) {
          var keys = route.keys, params = {};
          if (!route.regexp)
            return null;
          var m = route.regexp.exec(on);
          if (!m)
            return null;
          for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];
            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
            if (key && val) {
              params[key.name] = val;
            }
          }
          return params;
        }
        function updateRoute() {
          var next = parseRoute(), last = $route.current;
          if (next && last && next.$$route === last.$$route && angular.equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload) {
            last.params = next.params;
            angular.copy(last.params, $routeParams);
            $rootScope.$broadcast('$routeUpdate', last);
          } else if (next || last) {
            forceReload = false;
            $rootScope.$broadcast('$routeChangeStart', next, last);
            $route.current = next;
            if (next) {
              if (next.redirectTo) {
                if (angular.isString(next.redirectTo)) {
                  $location.path(interpolate(next.redirectTo, next.params)).search(next.params).replace();
                } else {
                  $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search())).replace();
                }
              }
            }
            $q.when(next).then(function () {
              if (next) {
                var locals = angular.extend({}, next.resolve), template, templateUrl;
                angular.forEach(locals, function (value, key) {
                  locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value);
                });
                if (angular.isDefined(template = next.template)) {
                  if (angular.isFunction(template)) {
                    template = template(next.params);
                  }
                } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                  if (angular.isFunction(templateUrl)) {
                    templateUrl = templateUrl(next.params);
                  }
                  templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                  if (angular.isDefined(templateUrl)) {
                    next.loadedTemplateUrl = templateUrl;
                    template = $http.get(templateUrl, { cache: $templateCache }).then(function (response) {
                      return response.data;
                    });
                  }
                }
                if (angular.isDefined(template)) {
                  locals['$template'] = template;
                }
                return $q.all(locals);
              }
            }).then(function (locals) {
              if (next == $route.current) {
                if (next) {
                  next.locals = locals;
                  angular.copy(next.params, $routeParams);
                }
                $rootScope.$broadcast('$routeChangeSuccess', next, last);
              }
            }, function (error) {
              if (next == $route.current) {
                $rootScope.$broadcast('$routeChangeError', next, last, error);
              }
            });
          }
        }
        function parseRoute() {
          var params, match;
          angular.forEach(routes, function (route, path) {
            if (!match && (params = switchRouteMatcher($location.path(), route))) {
              match = inherit(route, {
                params: angular.extend({}, $location.search(), params),
                pathParams: params
              });
              match.$$route = route;
            }
          });
          return match || routes[null] && inherit(routes[null], {
            params: {},
            pathParams: {}
          });
        }
        function interpolate(string, params) {
          var result = [];
          angular.forEach((string || '').split(':'), function (segment, i) {
            if (i === 0) {
              result.push(segment);
            } else {
              var segmentMatch = segment.match(/(\w+)(.*)/);
              var key = segmentMatch[1];
              result.push(params[key]);
              result.push(segmentMatch[2] || '');
              delete params[key];
            }
          });
          return result.join('');
        }
      }
    ];
  }
  ngRouteModule.provider('$routeParams', $RouteParamsProvider);
  function $RouteParamsProvider() {
    this.$get = function () {
      return {};
    };
  }
  ngRouteModule.directive('ngView', ngViewFactory);
  ngViewFactory.$inject = [
    '$route',
    '$anchorScroll',
    '$compile',
    '$controller',
    '$animate'
  ];
  function ngViewFactory($route, $anchorScroll, $compile, $controller, $animate) {
    return {
      restrict: 'ECA',
      terminal: true,
      priority: 400,
      transclude: 'element',
      compile: function (element, attr, linker) {
        return function (scope, $element, attr) {
          var currentScope, currentElement, onloadExp = attr.onload || '';
          scope.$on('$routeChangeSuccess', update);
          update();
          function cleanupLastView() {
            if (currentScope) {
              currentScope.$destroy();
              currentScope = null;
            }
            if (currentElement) {
              $animate.leave(currentElement);
              currentElement = null;
            }
          }
          function update() {
            var locals = $route.current && $route.current.locals, template = locals && locals.$template;
            if (template) {
              var newScope = scope.$new();
              linker(newScope, function (clone) {
                cleanupLastView();
                clone.html(template);
                $animate.enter(clone, null, $element);
                var link = $compile(clone.contents()), current = $route.current;
                currentScope = current.scope = newScope;
                currentElement = clone;
                if (current.controller) {
                  locals.$scope = currentScope;
                  var controller = $controller(current.controller, locals);
                  if (current.controllerAs) {
                    currentScope[current.controllerAs] = controller;
                  }
                  clone.data('$ngControllerController', controller);
                  clone.children().data('$ngControllerController', controller);
                }
                link(currentScope);
                currentScope.$emit('$viewContentLoaded');
                currentScope.$eval(onloadExp);
                $anchorScroll();
              });
            } else {
              cleanupLastView();
            }
          }
        };
      }
    };
  }
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngAnimate', ['ng']).config([
    '$provide',
    '$animateProvider',
    function ($provide, $animateProvider) {
      var noop = angular.noop;
      var forEach = angular.forEach;
      var selectors = $animateProvider.$$selectors;
      var NG_ANIMATE_STATE = '$$ngAnimateState';
      var NG_ANIMATE_CLASS_NAME = 'ng-animate';
      var rootAnimateState = { running: true };
      $provide.decorator('$animate', [
        '$delegate',
        '$injector',
        '$sniffer',
        '$rootElement',
        '$timeout',
        '$rootScope',
        function ($delegate, $injector, $sniffer, $rootElement, $timeout, $rootScope) {
          $rootElement.data(NG_ANIMATE_STATE, rootAnimateState);
          function lookup(name) {
            if (name) {
              var matches = [], flagMap = {}, classes = name.substr(1).split('.');
              if ($sniffer.transitions || $sniffer.animations) {
                classes.push('');
              }
              for (var i = 0; i < classes.length; i++) {
                var klass = classes[i], selectorFactoryName = selectors[klass];
                if (selectorFactoryName && !flagMap[klass]) {
                  matches.push($injector.get(selectorFactoryName));
                  flagMap[klass] = true;
                }
              }
              return matches;
            }
          }
          return {
            enter: function (element, parent, after, done) {
              this.enabled(false, element);
              $delegate.enter(element, parent, after);
              $rootScope.$$postDigest(function () {
                performAnimation('enter', 'ng-enter', element, parent, after, function () {
                  done && $timeout(done, 0, false);
                });
              });
            },
            leave: function (element, done) {
              cancelChildAnimations(element);
              this.enabled(false, element);
              $rootScope.$$postDigest(function () {
                performAnimation('leave', 'ng-leave', element, null, null, function () {
                  $delegate.leave(element, done);
                });
              });
            },
            move: function (element, parent, after, done) {
              cancelChildAnimations(element);
              this.enabled(false, element);
              $delegate.move(element, parent, after);
              $rootScope.$$postDigest(function () {
                performAnimation('move', 'ng-move', element, null, null, function () {
                  done && $timeout(done, 0, false);
                });
              });
            },
            addClass: function (element, className, done) {
              performAnimation('addClass', className, element, null, null, function () {
                $delegate.addClass(element, className, done);
              });
            },
            removeClass: function (element, className, done) {
              performAnimation('removeClass', className, element, null, null, function () {
                $delegate.removeClass(element, className, done);
              });
            },
            enabled: function (value, element) {
              switch (arguments.length) {
              case 2:
                if (value) {
                  cleanup(element);
                } else {
                  var data = element.data(NG_ANIMATE_STATE) || {};
                  data.structural = true;
                  data.running = true;
                  element.data(NG_ANIMATE_STATE, data);
                }
                break;
              case 1:
                rootAnimateState.running = !value;
                break;
              default:
                value = !rootAnimateState.running;
                break;
              }
              return !!value;
            }
          };
          function performAnimation(event, className, element, parent, after, onComplete) {
            var classes = (element.attr('class') || '') + ' ' + className;
            var animationLookup = (' ' + classes).replace(/\s+/g, '.'), animations = [];
            forEach(lookup(animationLookup), function (animation, index) {
              animations.push({ start: animation[event] });
            });
            if (!parent) {
              parent = after ? after.parent() : element.parent();
            }
            var disabledAnimation = { running: true };
            if ((parent.inheritedData(NG_ANIMATE_STATE) || disabledAnimation).running || animations.length == 0) {
              done();
              return;
            }
            var ngAnimateState = element.data(NG_ANIMATE_STATE) || {};
            var isClassBased = event == 'addClass' || event == 'removeClass';
            if (ngAnimateState.running) {
              if (isClassBased && ngAnimateState.structural) {
                onComplete && onComplete();
                return;
              }
              $timeout.cancel(ngAnimateState.flagTimer);
              cancelAnimations(ngAnimateState.animations);
              (ngAnimateState.done || noop)();
            }
            element.data(NG_ANIMATE_STATE, {
              running: true,
              structural: !isClassBased,
              animations: animations,
              done: done
            });
            element.addClass(NG_ANIMATE_CLASS_NAME);
            forEach(animations, function (animation, index) {
              var fn = function () {
                progress(index);
              };
              if (animation.start) {
                animation.endFn = isClassBased ? animation.start(element, className, fn) : animation.start(element, fn);
              } else {
                fn();
              }
            });
            function progress(index) {
              animations[index].done = true;
              (animations[index].endFn || noop)();
              for (var i = 0; i < animations.length; i++) {
                if (!animations[i].done)
                  return;
              }
              done();
            }
            function done() {
              if (!done.hasBeenRun) {
                done.hasBeenRun = true;
                var data = element.data(NG_ANIMATE_STATE);
                if (data) {
                  if (isClassBased) {
                    cleanup(element);
                  } else {
                    data.flagTimer = $timeout(function () {
                      cleanup(element);
                    }, 0, false);
                    element.data(NG_ANIMATE_STATE, data);
                  }
                }
                (onComplete || noop)();
              }
            }
          }
          function cancelChildAnimations(element) {
            angular.forEach(element[0].querySelectorAll('.' + NG_ANIMATE_CLASS_NAME), function (element) {
              element = angular.element(element);
              var data = element.data(NG_ANIMATE_STATE);
              if (data) {
                cancelAnimations(data.animations);
                cleanup(element);
              }
            });
          }
          function cancelAnimations(animations) {
            var isCancelledFlag = true;
            forEach(animations, function (animation) {
              (animation.endFn || noop)(isCancelledFlag);
            });
          }
          function cleanup(element) {
            element.removeClass(NG_ANIMATE_CLASS_NAME);
            element.removeData(NG_ANIMATE_STATE);
          }
        }
      ]);
      $animateProvider.register('', [
        '$window',
        '$sniffer',
        '$timeout',
        function ($window, $sniffer, $timeout) {
          var forEach = angular.forEach;
          var transitionProp, transitionendEvent, animationProp, animationendEvent;
          if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
            transitionProp = 'WebkitTransition';
            transitionendEvent = 'webkitTransitionEnd transitionend';
          } else {
            transitionProp = 'transition';
            transitionendEvent = 'transitionend';
          }
          if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
            animationProp = 'WebkitAnimation';
            animationendEvent = 'webkitAnimationEnd animationend';
          } else {
            animationProp = 'animation';
            animationendEvent = 'animationend';
          }
          var durationKey = 'Duration', propertyKey = 'Property', delayKey = 'Delay', animationIterationCountKey = 'IterationCount', ELEMENT_NODE = 1;
          var NG_ANIMATE_PARENT_KEY = '$ngAnimateKey';
          var lookupCache = {};
          var parentCounter = 0;
          var animationReflowQueue = [], animationTimer, timeOut = false;
          function afterReflow(callback) {
            animationReflowQueue.push(callback);
            $timeout.cancel(animationTimer);
            animationTimer = $timeout(function () {
              angular.forEach(animationReflowQueue, function (fn) {
                fn();
              });
              animationReflowQueue = [];
              animationTimer = null;
              lookupCache = {};
            }, 10, false);
          }
          function getElementAnimationDetails(element, cacheKey, onlyCheckTransition) {
            var data = lookupCache[cacheKey];
            if (!data) {
              var transitionDuration = 0, transitionDelay = 0, animationDuration = 0, animationDelay = 0;
              forEach(element, function (element) {
                if (element.nodeType == ELEMENT_NODE) {
                  var elementStyles = $window.getComputedStyle(element) || {};
                  transitionDuration = Math.max(parseMaxTime(elementStyles[transitionProp + durationKey]), transitionDuration);
                  if (!onlyCheckTransition) {
                    transitionDelay = Math.max(parseMaxTime(elementStyles[transitionProp + delayKey]), transitionDelay);
                    animationDelay = Math.max(parseMaxTime(elementStyles[animationProp + delayKey]), animationDelay);
                    var aDuration = parseMaxTime(elementStyles[animationProp + durationKey]);
                    if (aDuration > 0) {
                      aDuration *= parseInt(elementStyles[animationProp + animationIterationCountKey]) || 1;
                    }
                    animationDuration = Math.max(aDuration, animationDuration);
                  }
                }
              });
              data = {
                transitionDelay: transitionDelay,
                animationDelay: animationDelay,
                transitionDuration: transitionDuration,
                animationDuration: animationDuration
              };
              lookupCache[cacheKey] = data;
            }
            return data;
          }
          function parseMaxTime(str) {
            var total = 0, values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
            forEach(values, function (value) {
              total = Math.max(parseFloat(value) || 0, total);
            });
            return total;
          }
          function getCacheKey(element) {
            var parent = element.parent();
            var parentID = parent.data(NG_ANIMATE_PARENT_KEY);
            if (!parentID) {
              parent.data(NG_ANIMATE_PARENT_KEY, ++parentCounter);
              parentID = parentCounter;
            }
            return parentID + '-' + element[0].className;
          }
          function animate(element, className, done) {
            var cacheKey = getCacheKey(element);
            if (getElementAnimationDetails(element, cacheKey, true).transitionDuration > 0) {
              done();
              return;
            }
            element.addClass(className);
            var timings = getElementAnimationDetails(element, cacheKey + ' ' + className);
            var maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
            if (maxDuration > 0) {
              var maxDelayTime = Math.max(timings.transitionDelay, timings.animationDelay) * 1000, startTime = Date.now(), node = element[0];
              if (timings.transitionDuration > 0) {
                node.style[transitionProp + propertyKey] = 'none';
              }
              var activeClassName = '';
              forEach(className.split(' '), function (klass, i) {
                activeClassName += (i > 0 ? ' ' : '') + klass + '-active';
              });
              var css3AnimationEvents = animationendEvent + ' ' + transitionendEvent;
              afterReflow(function () {
                if (timings.transitionDuration > 0) {
                  node.style[transitionProp + propertyKey] = '';
                }
                element.addClass(activeClassName);
              });
              element.on(css3AnimationEvents, onAnimationProgress);
              return function onEnd(cancelled) {
                element.off(css3AnimationEvents, onAnimationProgress);
                element.removeClass(className);
                element.removeClass(activeClassName);
                if (cancelled) {
                  done();
                }
              };
            } else {
              element.removeClass(className);
              done();
            }
            function onAnimationProgress(event) {
              event.stopPropagation();
              var ev = event.originalEvent || event;
              var timeStamp = ev.$manualTimeStamp || ev.timeStamp || Date.now();
              if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && ev.elapsedTime >= maxDuration) {
                done();
              }
            }
          }
          return {
            enter: function (element, done) {
              return animate(element, 'ng-enter', done);
            },
            leave: function (element, done) {
              return animate(element, 'ng-leave', done);
            },
            move: function (element, done) {
              return animate(element, 'ng-move', done);
            },
            addClass: function (element, className, done) {
              return animate(element, suffixClasses(className, '-add'), done);
            },
            removeClass: function (element, className, done) {
              return animate(element, suffixClasses(className, '-remove'), done);
            }
          };
          function suffixClasses(classes, suffix) {
            var className = '';
            classes = angular.isArray(classes) ? classes : classes.split(/\s+/);
            forEach(classes, function (klass, i) {
              if (klass && klass.length > 0) {
                className += (i > 0 ? ' ' : '') + klass + suffix;
              }
            });
            return className;
          }
        }
      ]);
    }
  ]);
}(window, window.angular));
angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', [
  'ui.filters',
  'ui.directives',
  'ui.config'
]);
angular.module('ui.directives').directive('uiAnimate', [
  'ui.config',
  '$timeout',
  function (uiConfig, $timeout) {
    var options = {};
    if (angular.isString(uiConfig.animate)) {
      options['class'] = uiConfig.animate;
    } else if (uiConfig.animate) {
      options = uiConfig.animate;
    }
    return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
        var opts = {};
        if (attrs.uiAnimate) {
          opts = $scope.$eval(attrs.uiAnimate);
          if (angular.isString(opts)) {
            opts = { 'class': opts };
          }
        }
        opts = angular.extend({ 'class': 'ui-animate' }, options, opts);
        element.addClass(opts['class']);
        $timeout(function () {
          element.removeClass(opts['class']);
        }, 20, false);
      }
    };
  }
]);
angular.module('ui.directives').directive('uiCalendar', [
  'ui.config',
  '$parse',
  function (uiConfig, $parse) {
    uiConfig.uiCalendar = uiConfig.uiCalendar || {};
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elm, attrs, $timeout) {
        var sources = scope.$eval(attrs.ngModel);
        var tracker = 0;
        var getSources = function () {
          var equalsTracker = scope.$eval(attrs.equalsTracker);
          tracker = 0;
          angular.forEach(sources, function (value, key) {
            if (angular.isArray(value)) {
              tracker += value.length;
            }
          });
          if (angular.isNumber(equalsTracker)) {
            return tracker + sources.length + equalsTracker;
          } else {
            return tracker + sources.length;
          }
        };
        function update() {
          scope.calendar = elm.html('');
          var view = scope.calendar.fullCalendar('getView');
          if (view) {
            view = view.name;
          }
          var expression, options = {
              defaultView: view,
              eventSources: sources
            };
          if (attrs.uiCalendar) {
            expression = scope.$eval(attrs.uiCalendar);
          } else {
            expression = {};
          }
          angular.extend(options, uiConfig.uiCalendar, expression);
          scope.calendar.fullCalendar(options);
        }
        update();
        scope.$watch(getSources, function (newVal, oldVal) {
          update();
        });
      }
    };
  }
]);
angular.module('ui.directives').directive('uiCodemirror', [
  'ui.config',
  '$timeout',
  function (uiConfig, $timeout) {
    'use strict';
    var events = [
        'cursorActivity',
        'viewportChange',
        'gutterClick',
        'focus',
        'blur',
        'scroll',
        'update'
      ];
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var options, opts, onChange, deferCodeMirror, codeMirror;
        if (elm[0].type !== 'textarea') {
          throw new Error('uiCodemirror3 can only be applied to a textarea element');
        }
        options = uiConfig.codemirror || {};
        opts = angular.extend({}, options, scope.$eval(attrs.uiCodemirror));
        onChange = function (aEvent) {
          return function (instance, changeObj) {
            var newValue = instance.getValue();
            if (newValue !== ngModel.$viewValue) {
              ngModel.$setViewValue(newValue);
              scope.$apply();
            }
            if (typeof aEvent === 'function')
              aEvent(instance, changeObj);
          };
        };
        deferCodeMirror = function () {
          codeMirror = CodeMirror.fromTextArea(elm[0], opts);
          codeMirror.on('change', onChange(opts.onChange));
          for (var i = 0, n = events.length, aEvent; i < n; ++i) {
            aEvent = opts['on' + events[i].charAt(0).toUpperCase() + events[i].slice(1)];
            if (aEvent === void 0)
              continue;
            if (typeof aEvent !== 'function')
              continue;
            codeMirror.on(events[i], aEvent);
          }
          ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
              return '';
            } else if (angular.isObject(value) || angular.isArray(value)) {
              throw new Error('ui-codemirror cannot use an object or an array as a model');
            }
            return value;
          });
          ngModel.$render = function () {
            codeMirror.setValue(ngModel.$viewValue);
          };
          if (attrs.uiRefresh) {
            scope.$watch(attrs.uiRefresh, function (newVal, oldVal) {
              if (newVal !== oldVal)
                $timeout(codeMirror.refresh);
            });
          }
        };
        $timeout(deferCodeMirror);
      }
    };
  }
]);
angular.module('ui.directives').directive('uiCurrency', [
  'ui.config',
  'currencyFilter',
  function (uiConfig, currencyFilter) {
    var options = {
        pos: 'ui-currency-pos',
        neg: 'ui-currency-neg',
        zero: 'ui-currency-zero'
      };
    if (uiConfig.currency) {
      angular.extend(options, uiConfig.currency);
    }
    return {
      restrict: 'EAC',
      require: 'ngModel',
      link: function (scope, element, attrs, controller) {
        var opts, renderview, value;
        opts = angular.extend({}, options, scope.$eval(attrs.uiCurrency));
        renderview = function (viewvalue) {
          var num;
          num = viewvalue * 1;
          element.toggleClass(opts.pos, num > 0);
          element.toggleClass(opts.neg, num < 0);
          element.toggleClass(opts.zero, num === 0);
          if (viewvalue === '') {
            element.text('');
          } else {
            element.text(currencyFilter(num, opts.symbol));
          }
          return true;
        };
        controller.$render = function () {
          value = controller.$viewValue;
          element.val(value);
          renderview(value);
        };
      }
    };
  }
]);
angular.module('ui.directives').directive('uiDate', [
  'ui.config',
  function (uiConfig) {
    'use strict';
    var options;
    options = {};
    if (angular.isObject(uiConfig.date)) {
      angular.extend(options, uiConfig.date);
    }
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, controller) {
        var getOptions = function () {
          return angular.extend({}, uiConfig.date, scope.$eval(attrs.uiDate));
        };
        var initDateWidget = function () {
          var opts = getOptions();
          if (controller) {
            var updateModel = function () {
              scope.$apply(function () {
                var date = element.datepicker('getDate');
                element.datepicker('setDate', element.val());
                controller.$setViewValue(date);
                element.blur();
              });
            };
            if (opts.onSelect) {
              var userHandler = opts.onSelect;
              opts.onSelect = function (value, picker) {
                updateModel();
                scope.$apply(function () {
                  userHandler(value, picker);
                });
              };
            } else {
              opts.onSelect = updateModel;
            }
            element.bind('change', updateModel);
            controller.$render = function () {
              var date = controller.$viewValue;
              if (angular.isDefined(date) && date !== null && !angular.isDate(date)) {
                throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
              }
              element.datepicker('setDate', date);
            };
          }
          element.datepicker('destroy');
          element.datepicker(opts);
          if (controller) {
            controller.$render();
          }
        };
        scope.$watch(getOptions, initDateWidget, true);
      }
    };
  }
]).directive('uiDateFormat', [
  'ui.config',
  function (uiConfig) {
    var directive = {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
          var dateFormat = attrs.uiDateFormat || uiConfig.dateFormat;
          if (dateFormat) {
            modelCtrl.$formatters.push(function (value) {
              if (angular.isString(value)) {
                return $.datepicker.parseDate(dateFormat, value);
              }
            });
            modelCtrl.$parsers.push(function (value) {
              if (value) {
                return $.datepicker.formatDate(dateFormat, value);
              }
            });
          } else {
            modelCtrl.$formatters.push(function (value) {
              if (angular.isString(value)) {
                return new Date(value);
              }
            });
            modelCtrl.$parsers.push(function (value) {
              if (value) {
                return value.toISOString();
              }
            });
          }
        }
      };
    return directive;
  }
]);
angular.module('ui.directives').directive('uiEvent', [
  '$parse',
  function ($parse) {
    return function (scope, elm, attrs) {
      var events = scope.$eval(attrs.uiEvent);
      angular.forEach(events, function (uiEvent, eventName) {
        var fn = $parse(uiEvent);
        elm.bind(eventName, function (evt) {
          var params = Array.prototype.slice.call(arguments);
          params = params.splice(1);
          scope.$apply(function () {
            fn(scope, {
              $event: evt,
              $params: params
            });
          });
        });
      });
    };
  }
]);
angular.module('ui.directives').directive('uiIf', [function () {
    return {
      transclude: 'element',
      priority: 1000,
      terminal: true,
      restrict: 'A',
      compile: function (element, attr, transclude) {
        return function (scope, element, attr) {
          var childElement;
          var childScope;
          scope.$watch(attr['uiIf'], function (newValue) {
            if (childElement) {
              childElement.remove();
              childElement = undefined;
            }
            if (childScope) {
              childScope.$destroy();
              childScope = undefined;
            }
            if (newValue) {
              childScope = scope.$new();
              transclude(childScope, function (clone) {
                childElement = clone;
                element.after(clone);
              });
            }
          });
        };
      }
    };
  }]);
angular.module('ui.directives').directive('uiJq', [
  'ui.config',
  '$timeout',
  function uiJqInjectingFunction(uiConfig, $timeout) {
    return {
      restrict: 'A',
      compile: function uiJqCompilingFunction(tElm, tAttrs) {
        if (!angular.isFunction(tElm[tAttrs.uiJq])) {
          throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
        }
        var options = uiConfig.jq && uiConfig.jq[tAttrs.uiJq];
        return function uiJqLinkingFunction(scope, elm, attrs) {
          var linkOptions = [];
          if (attrs.uiOptions) {
            linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
            if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
              linkOptions[0] = angular.extend({}, options, linkOptions[0]);
            }
          } else if (options) {
            linkOptions = [options];
          }
          if (attrs.ngModel && elm.is('select,input,textarea')) {
            elm.on('change', function () {
              elm.trigger('input');
            });
          }
          function callPlugin() {
            $timeout(function () {
              elm[attrs.uiJq].apply(elm, linkOptions);
            }, 0, false);
          }
          if (attrs.uiRefresh) {
            scope.$watch(attrs.uiRefresh, function (newVal) {
              callPlugin();
            });
          }
          callPlugin();
        };
      }
    };
  }
]);
angular.module('ui.directives').factory('keypressHelper', [
  '$parse',
  function keypress($parse) {
    var keysByCode = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete'
      };
    var capitaliseFirstLetter = function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return function (mode, scope, elm, attrs) {
      var params, combinations = [];
      params = scope.$eval(attrs['ui' + capitaliseFirstLetter(mode)]);
      angular.forEach(params, function (v, k) {
        var combination, expression;
        expression = $parse(v);
        angular.forEach(k.split(' '), function (variation) {
          combination = {
            expression: expression,
            keys: {}
          };
          angular.forEach(variation.split('-'), function (value) {
            combination.keys[value] = true;
          });
          combinations.push(combination);
        });
      });
      elm.bind(mode, function (event) {
        var altPressed = event.metaKey || event.altKey;
        var ctrlPressed = event.ctrlKey;
        var shiftPressed = event.shiftKey;
        var keyCode = event.keyCode;
        if (mode === 'keypress' && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
          keyCode = keyCode - 32;
        }
        angular.forEach(combinations, function (combination) {
          var mainKeyPressed = combination.keys[keysByCode[event.keyCode]] || combination.keys[event.keyCode.toString()] || false;
          var altRequired = combination.keys.alt || false;
          var ctrlRequired = combination.keys.ctrl || false;
          var shiftRequired = combination.keys.shift || false;
          if (mainKeyPressed && altRequired == altPressed && ctrlRequired == ctrlPressed && shiftRequired == shiftPressed) {
            scope.$apply(function () {
              combination.expression(scope, { '$event': event });
            });
          }
        });
      });
    };
  }
]);
angular.module('ui.directives').directive('uiKeydown', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keydown', scope, elm, attrs);
      }
    };
  }
]);
angular.module('ui.directives').directive('uiKeypress', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keypress', scope, elm, attrs);
      }
    };
  }
]);
angular.module('ui.directives').directive('uiKeyup', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keyup', scope, elm, attrs);
      }
    };
  }
]);
(function () {
  var app = angular.module('ui.directives');
  function bindMapEvents(scope, eventsStr, googleObject, element) {
    angular.forEach(eventsStr.split(' '), function (eventName) {
      var $event = { type: 'map-' + eventName };
      google.maps.event.addListener(googleObject, eventName, function (evt) {
        element.triggerHandler(angular.extend({}, $event, evt));
        if (!scope.$$phase)
          scope.$apply();
      });
    });
  }
  app.directive('uiMap', [
    'ui.config',
    '$parse',
    function (uiConfig, $parse) {
      var mapEvents = 'bounds_changed center_changed click dblclick drag dragend ' + 'dragstart heading_changed idle maptypeid_changed mousemove mouseout ' + 'mouseover projection_changed resize rightclick tilesloaded tilt_changed ' + 'zoom_changed';
      var options = uiConfig.map || {};
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          var map = new google.maps.Map(elm[0], opts);
          var model = $parse(attrs.uiMap);
          model.assign(scope, map);
          bindMapEvents(scope, mapEvents, map, elm);
        }
      };
    }
  ]);
  app.directive('uiMapInfoWindow', [
    'ui.config',
    '$parse',
    '$compile',
    function (uiConfig, $parse, $compile) {
      var infoWindowEvents = 'closeclick content_change domready ' + 'position_changed zindex_changed';
      var options = uiConfig.mapInfoWindow || {};
      return {
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          opts.content = elm[0];
          var model = $parse(attrs.uiMapInfoWindow);
          var infoWindow = model(scope);
          if (!infoWindow) {
            infoWindow = new google.maps.InfoWindow(opts);
            model.assign(scope, infoWindow);
          }
          bindMapEvents(scope, infoWindowEvents, infoWindow, elm);
          elm.replaceWith('<div></div>');
          var _open = infoWindow.open;
          infoWindow.open = function open(a1, a2, a3, a4, a5, a6) {
            $compile(elm.contents())(scope);
            _open.call(infoWindow, a1, a2, a3, a4, a5, a6);
          };
        }
      };
    }
  ]);
  function mapOverlayDirective(directiveName, events) {
    app.directive(directiveName, [function () {
        return {
          restrict: 'A',
          link: function (scope, elm, attrs) {
            scope.$watch(attrs[directiveName], function (newObject) {
              bindMapEvents(scope, events, newObject, elm);
            });
          }
        };
      }]);
  }
  mapOverlayDirective('uiMapMarker', 'animation_changed click clickable_changed cursor_changed ' + 'dblclick drag dragend draggable_changed dragstart flat_changed icon_changed ' + 'mousedown mouseout mouseover mouseup position_changed rightclick ' + 'shadow_changed shape_changed title_changed visible_changed zindex_changed');
  mapOverlayDirective('uiMapPolyline', 'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');
  mapOverlayDirective('uiMapPolygon', 'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');
  mapOverlayDirective('uiMapRectangle', 'bounds_changed click dblclick mousedown mousemove mouseout mouseover ' + 'mouseup rightclick');
  mapOverlayDirective('uiMapCircle', 'center_changed click dblclick mousedown mousemove ' + 'mouseout mouseover mouseup radius_changed rightclick');
  mapOverlayDirective('uiMapGroundOverlay', 'click dblclick');
}());
angular.module('ui.directives').directive('uiMask', [function () {
    return {
      require: 'ngModel',
      link: function ($scope, element, attrs, controller) {
        controller.$render = function () {
          var value = controller.$viewValue || '';
          element.val(value);
          element.mask($scope.$eval(attrs.uiMask));
        };
        controller.$parsers.push(function (value) {
          var isValid = element.isMaskValid() || angular.isUndefined(element.isMaskValid()) && element.val().length > 0;
          controller.$setValidity('mask', isValid);
          return isValid ? value : undefined;
        });
        element.bind('keyup', function () {
          $scope.$apply(function () {
            controller.$setViewValue(element.mask());
          });
        });
      }
    };
  }]);
angular.module('ui.directives').directive('uiReset', [
  'ui.config',
  function (uiConfig) {
    var resetValue = null;
    if (uiConfig.reset !== undefined)
      resetValue = uiConfig.reset;
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        var aElement;
        aElement = angular.element('<a class="ui-reset" />');
        elm.wrap('<span class="ui-resetwrap" />').after(aElement);
        aElement.bind('click', function (e) {
          e.preventDefault();
          scope.$apply(function () {
            if (attrs.uiReset)
              ctrl.$setViewValue(scope.$eval(attrs.uiReset));
            else
              ctrl.$setViewValue(resetValue);
            ctrl.$render();
          });
        });
      }
    };
  }
]);
angular.module('ui.directives').directive('uiRoute', [
  '$location',
  '$parse',
  function ($location, $parse) {
    return {
      restrict: 'AC',
      compile: function (tElement, tAttrs) {
        var useProperty;
        if (tAttrs.uiRoute) {
          useProperty = 'uiRoute';
        } else if (tAttrs.ngHref) {
          useProperty = 'ngHref';
        } else if (tAttrs.href) {
          useProperty = 'href';
        } else {
          throw new Error('uiRoute missing a route or href property on ' + tElement[0]);
        }
        return function ($scope, elm, attrs) {
          var modelSetter = $parse(attrs.ngModel || attrs.routeModel || '$uiRoute').assign;
          var watcher = angular.noop;
          function staticWatcher(newVal) {
            if ((hash = newVal.indexOf('#')) > -1)
              newVal = newVal.substr(hash + 1);
            watcher = function watchHref() {
              modelSetter($scope, $location.path().indexOf(newVal) > -1);
            };
            watcher();
          }
          function regexWatcher(newVal) {
            if ((hash = newVal.indexOf('#')) > -1)
              newVal = newVal.substr(hash + 1);
            watcher = function watchRegex() {
              var regexp = new RegExp('^' + newVal + '$', ['i']);
              modelSetter($scope, regexp.test($location.path()));
            };
            watcher();
          }
          switch (useProperty) {
          case 'uiRoute':
            if (attrs.uiRoute)
              regexWatcher(attrs.uiRoute);
            else
              attrs.$observe('uiRoute', regexWatcher);
            break;
          case 'ngHref':
            if (attrs.ngHref)
              staticWatcher(attrs.ngHref);
            else
              attrs.$observe('ngHref', staticWatcher);
            break;
          case 'href':
            staticWatcher(attrs.href);
          }
          $scope.$on('$routeChangeSuccess', function () {
            watcher();
          });
        };
      }
    };
  }
]);
angular.module('ui.directives').directive('uiScrollfix', [
  '$window',
  function ($window) {
    'use strict';
    return {
      link: function (scope, elm, attrs) {
        var top = elm.offset().top;
        if (!attrs.uiScrollfix) {
          attrs.uiScrollfix = top;
        } else {
          if (attrs.uiScrollfix.charAt(0) === '-') {
            attrs.uiScrollfix = top - attrs.uiScrollfix.substr(1);
          } else if (attrs.uiScrollfix.charAt(0) === '+') {
            attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
          }
        }
        angular.element($window).on('scroll.ui-scrollfix', function () {
          var offset;
          if (angular.isDefined($window.pageYOffset)) {
            offset = $window.pageYOffset;
          } else {
            var iebody = document.compatMode && document.compatMode !== 'BackCompat' ? document.documentElement : document.body;
            offset = iebody.scrollTop;
          }
          if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
            elm.addClass('ui-scrollfix');
          } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
            elm.removeClass('ui-scrollfix');
          }
        });
      }
    };
  }
]);
angular.module('ui.directives').directive('uiSelect2', [
  'ui.config',
  '$timeout',
  function (uiConfig, $timeout) {
    var options = {};
    if (uiConfig.select2) {
      angular.extend(options, uiConfig.select2);
    }
    return {
      require: '?ngModel',
      compile: function (tElm, tAttrs) {
        var watch, repeatOption, repeatAttr, isSelect = tElm.is('select'), isMultiple = tAttrs.multiple !== undefined;
        if (tElm.is('select')) {
          repeatOption = tElm.find('option[ng-repeat], option[data-ng-repeat]');
          if (repeatOption.length) {
            repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
            watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
          }
        }
        return function (scope, elm, attrs, controller) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));
          if (isSelect) {
            delete opts.multiple;
            delete opts.initSelection;
          } else if (isMultiple) {
            opts.multiple = true;
          }
          if (controller) {
            controller.$render = function () {
              if (isSelect) {
                elm.select2('val', controller.$modelValue);
              } else {
                if (isMultiple) {
                  if (!controller.$modelValue) {
                    elm.select2('data', []);
                  } else if (angular.isArray(controller.$modelValue)) {
                    elm.select2('data', controller.$modelValue);
                  } else {
                    elm.select2('val', controller.$modelValue);
                  }
                } else {
                  if (angular.isObject(controller.$modelValue)) {
                    elm.select2('data', controller.$modelValue);
                  } else {
                    elm.select2('val', controller.$modelValue);
                  }
                }
              }
            };
            if (watch) {
              scope.$watch(watch, function (newVal, oldVal, scope) {
                if (!newVal)
                  return;
                $timeout(function () {
                  elm.select2('val', controller.$viewValue);
                  elm.trigger('change');
                });
              });
            }
            if (!isSelect) {
              elm.bind('change', function () {
                scope.$apply(function () {
                  controller.$setViewValue(elm.select2('data'));
                });
              });
              if (opts.initSelection) {
                var initSelection = opts.initSelection;
                opts.initSelection = function (element, callback) {
                  initSelection(element, function (value) {
                    controller.$setViewValue(value);
                    callback(value);
                  });
                };
              }
            }
          }
          attrs.$observe('disabled', function (value) {
            elm.select2(value && 'disable' || 'enable');
          });
          if (attrs.ngMultiple) {
            scope.$watch(attrs.ngMultiple, function (newVal) {
              elm.select2(opts);
            });
          }
          elm.val(scope.$eval(attrs.ngModel));
          $timeout(function () {
            elm.select2(opts);
            if (!opts.initSelection && !isSelect)
              controller.$setViewValue(elm.select2('data'));
          });
        };
      }
    };
  }
]);
angular.module('ui.directives').directive('uiShow', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiShow, function (newVal, oldVal) {
        if (newVal) {
          elm.addClass('ui-show');
        } else {
          elm.removeClass('ui-show');
        }
      });
    };
  }]).directive('uiHide', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiHide, function (newVal, oldVal) {
        if (newVal) {
          elm.addClass('ui-hide');
        } else {
          elm.removeClass('ui-hide');
        }
      });
    };
  }]).directive('uiToggle', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiToggle, function (newVal, oldVal) {
        if (newVal) {
          elm.removeClass('ui-hide').addClass('ui-show');
        } else {
          elm.removeClass('ui-show').addClass('ui-hide');
        }
      });
    };
  }]);
angular.module('ui.directives').directive('uiSortable', [
  'ui.config',
  function (uiConfig) {
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, ngModel) {
        var onReceive, onRemove, onStart, onUpdate, opts, _receive, _remove, _start, _update;
        opts = angular.extend({}, uiConfig.sortable, scope.$eval(attrs.uiSortable));
        if (ngModel) {
          ngModel.$render = function () {
            element.sortable('refresh');
          };
          onStart = function (e, ui) {
            ui.item.sortable = { index: ui.item.index() };
          };
          onUpdate = function (e, ui) {
            ui.item.sortable.resort = ngModel;
          };
          onReceive = function (e, ui) {
            ui.item.sortable.relocate = true;
            ngModel.$modelValue.splice(ui.item.index(), 0, ui.item.sortable.moved);
          };
          onRemove = function (e, ui) {
            if (ngModel.$modelValue.length === 1) {
              ui.item.sortable.moved = ngModel.$modelValue.splice(0, 1)[0];
            } else {
              ui.item.sortable.moved = ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0];
            }
          };
          onStop = function (e, ui) {
            if (ui.item.sortable.resort && !ui.item.sortable.relocate) {
              var end, start;
              start = ui.item.sortable.index;
              end = ui.item.index();
              if (start < end)
                end--;
              ui.item.sortable.resort.$modelValue.splice(end, 0, ui.item.sortable.resort.$modelValue.splice(start, 1)[0]);
            }
            if (ui.item.sortable.resort || ui.item.sortable.relocate) {
              scope.$apply();
            }
          };
          _start = opts.start;
          opts.start = function (e, ui) {
            onStart(e, ui);
            if (typeof _start === 'function')
              _start(e, ui);
          };
          _stop = opts.stop;
          opts.stop = function (e, ui) {
            onStop(e, ui);
            if (typeof _stop === 'function')
              _stop(e, ui);
          };
          _update = opts.update;
          opts.update = function (e, ui) {
            onUpdate(e, ui);
            if (typeof _update === 'function')
              _update(e, ui);
          };
          _receive = opts.receive;
          opts.receive = function (e, ui) {
            onReceive(e, ui);
            if (typeof _receive === 'function')
              _receive(e, ui);
          };
          _remove = opts.remove;
          opts.remove = function (e, ui) {
            onRemove(e, ui);
            if (typeof _remove === 'function')
              _remove(e, ui);
          };
        }
        element.sortable(opts);
      }
    };
  }
]);
angular.module('ui.directives').directive('uiTinymce', [
  'ui.config',
  function (uiConfig) {
    uiConfig.tinymce = uiConfig.tinymce || {};
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var expression, options = {
            onchange_callback: function (inst) {
              if (inst.isDirty()) {
                inst.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase)
                  scope.$apply();
              }
            },
            handle_event_callback: function (e) {
              if (this.isDirty()) {
                this.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase)
                  scope.$apply();
              }
              return true;
            },
            setup: function (ed) {
              ed.onSetContent.add(function (ed, o) {
                if (ed.isDirty()) {
                  ed.save();
                  ngModel.$setViewValue(elm.val());
                  if (!scope.$$phase)
                    scope.$apply();
                }
              });
            }
          };
        if (attrs.uiTinymce) {
          expression = scope.$eval(attrs.uiTinymce);
        } else {
          expression = {};
        }
        angular.extend(options, uiConfig.tinymce, expression);
        setTimeout(function () {
          elm.tinymce(options);
        });
      }
    };
  }
]);
angular.module('ui.directives').directive('uiValidate', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var validateFn, watch, validators = {}, validateExpr = scope.$eval(attrs.uiValidate);
      if (!validateExpr)
        return;
      if (angular.isString(validateExpr)) {
        validateExpr = { validator: validateExpr };
      }
      angular.forEach(validateExpr, function (expression, key) {
        validateFn = function (valueToValidate) {
          if (scope.$eval(expression, { '$value': valueToValidate })) {
            ctrl.$setValidity(key, true);
            return valueToValidate;
          } else {
            ctrl.$setValidity(key, false);
            return undefined;
          }
        };
        validators[key] = validateFn;
        ctrl.$formatters.push(validateFn);
        ctrl.$parsers.push(validateFn);
      });
      if (attrs.uiValidateWatch) {
        watch = scope.$eval(attrs.uiValidateWatch);
        if (angular.isString(watch)) {
          scope.$watch(watch, function () {
            angular.forEach(validators, function (validatorFn, key) {
              validatorFn(ctrl.$modelValue);
            });
          });
        } else {
          angular.forEach(watch, function (expression, key) {
            scope.$watch(expression, function () {
              validators[key](ctrl.$modelValue);
            });
          });
        }
      }
    }
  };
});
angular.module('ui.filters').filter('format', function () {
  return function (value, replace) {
    if (!value) {
      return value;
    }
    var target = value.toString(), token;
    if (replace === undefined) {
      return target;
    }
    if (!angular.isArray(replace) && !angular.isObject(replace)) {
      return target.split('$0').join(replace);
    }
    token = angular.isArray(replace) && '$' || ':';
    angular.forEach(replace, function (value, key) {
      target = target.split(token + key).join(value);
    });
    return target;
  };
});
angular.module('ui.filters').filter('highlight', function () {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});
angular.module('ui.filters').filter('inflector', function () {
  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }
  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function (match) {
      return separator + match;
    });
  }
  var inflectors = {
      humanize: function (value) {
        return ucwords(breakup(value, ' ').split('_').join(' '));
      },
      underscore: function (value) {
        return value.substr(0, 1).toLowerCase() + breakup(value.substr(1), '_').toLowerCase().split(' ').join('_');
      },
      variable: function (value) {
        value = value.substr(0, 1).toLowerCase() + ucwords(value.split('_').join(' ')).substr(1).split(' ').join('');
        return value;
      }
    };
  return function (text, inflector, separator) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});
angular.module('ui.filters').filter('unique', function () {
  return function (items, filterOn) {
    if (filterOn === false) {
      return items;
    }
    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];
      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };
      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;
        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }
      });
      items = newItems;
    }
    return items;
  };
});
angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function ($q, $timeout, $rootScope) {
    var $transition = function (element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function (event) {
        $rootScope.$apply(function () {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function () {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function () {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
      };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
      };
    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }
]);
var dialogModule = angular.module('ui.bootstrap.dialog', ['ui.bootstrap.transition']);
dialogModule.controller('MessageBoxController', [
  '$scope',
  'dialog',
  'model',
  function ($scope, dialog, model) {
    $scope.title = model.title;
    $scope.message = model.message;
    $scope.buttons = model.buttons;
    $scope.close = function (res) {
      dialog.close(res);
    };
  }
]);
dialogModule.provider('$dialog', function () {
  var defaults = {
      backdrop: true,
      dialogClass: 'modal',
      backdropClass: 'modal-backdrop',
      transitionClass: 'fade',
      triggerClass: 'in',
      dialogOpenClass: 'modal-open',
      resolve: {},
      backdropFade: false,
      dialogFade: false,
      keyboard: true,
      backdropClick: true
    };
  var globalOptions = {};
  var activeBackdrops = { value: 0 };
  this.options = function (value) {
    globalOptions = value;
  };
  this.$get = [
    '$http',
    '$document',
    '$compile',
    '$rootScope',
    '$controller',
    '$templateCache',
    '$q',
    '$transition',
    '$injector',
    function ($http, $document, $compile, $rootScope, $controller, $templateCache, $q, $transition, $injector) {
      var body = $document.find('body');
      function createElement(clazz) {
        var el = angular.element('<div>');
        el.addClass(clazz);
        return el;
      }
      function Dialog(opts) {
        var self = this, options = this.options = angular.extend({}, defaults, globalOptions, opts);
        this._open = false;
        this.backdropEl = createElement(options.backdropClass);
        if (options.backdropFade) {
          this.backdropEl.addClass(options.transitionClass);
          this.backdropEl.removeClass(options.triggerClass);
        }
        this.modalEl = createElement(options.dialogClass);
        if (options.dialogFade) {
          this.modalEl.addClass(options.transitionClass);
          this.modalEl.removeClass(options.triggerClass);
        }
        this.handledEscapeKey = function (e) {
          if (e.which === 27) {
            self.close();
            e.preventDefault();
            self.$scope.$apply();
          }
        };
        this.handleBackDropClick = function (e) {
          self.close();
          e.preventDefault();
          self.$scope.$apply();
        };
        this.handleLocationChange = function () {
          self.close();
        };
      }
      Dialog.prototype.isOpen = function () {
        return this._open;
      };
      Dialog.prototype.open = function (templateUrl, controller) {
        var self = this, options = this.options;
        if (templateUrl) {
          options.templateUrl = templateUrl;
        }
        if (controller) {
          options.controller = controller;
        }
        if (!(options.template || options.templateUrl)) {
          throw new Error('Dialog.open expected template or templateUrl, neither found. Use options or open method to specify them.');
        }
        this._loadResolves().then(function (locals) {
          var $scope = locals.$scope = self.$scope = locals.$scope ? locals.$scope : $rootScope.$new();
          self.modalEl.html(locals.$template);
          if (self.options.controller) {
            var ctrl = $controller(self.options.controller, locals);
            self.modalEl.children().data('ngControllerController', ctrl);
          }
          $compile(self.modalEl)($scope);
          self._addElementsToDom();
          body.addClass(self.options.dialogOpenClass);
          setTimeout(function () {
            if (self.options.dialogFade) {
              self.modalEl.addClass(self.options.triggerClass);
            }
            if (self.options.backdropFade) {
              self.backdropEl.addClass(self.options.triggerClass);
            }
          });
          self._bindEvents();
        });
        this.deferred = $q.defer();
        return this.deferred.promise;
      };
      Dialog.prototype.close = function (result) {
        var self = this;
        var fadingElements = this._getFadingElements();
        body.removeClass(self.options.dialogOpenClass);
        if (fadingElements.length > 0) {
          for (var i = fadingElements.length - 1; i >= 0; i--) {
            $transition(fadingElements[i], removeTriggerClass).then(onCloseComplete);
          }
          return;
        }
        this._onCloseComplete(result);
        function removeTriggerClass(el) {
          el.removeClass(self.options.triggerClass);
        }
        function onCloseComplete() {
          if (self._open) {
            self._onCloseComplete(result);
          }
        }
      };
      Dialog.prototype._getFadingElements = function () {
        var elements = [];
        if (this.options.dialogFade) {
          elements.push(this.modalEl);
        }
        if (this.options.backdropFade) {
          elements.push(this.backdropEl);
        }
        return elements;
      };
      Dialog.prototype._bindEvents = function () {
        if (this.options.keyboard) {
          body.bind('keydown', this.handledEscapeKey);
        }
        if (this.options.backdrop && this.options.backdropClick) {
          this.backdropEl.bind('click', this.handleBackDropClick);
        }
        this.$scope.$on('$locationChangeSuccess', this.handleLocationChange);
      };
      Dialog.prototype._unbindEvents = function () {
        if (this.options.keyboard) {
          body.unbind('keydown', this.handledEscapeKey);
        }
        if (this.options.backdrop && this.options.backdropClick) {
          this.backdropEl.unbind('click', this.handleBackDropClick);
        }
      };
      Dialog.prototype._onCloseComplete = function (result) {
        this._removeElementsFromDom();
        this._unbindEvents();
        this.deferred.resolve(result);
      };
      Dialog.prototype._addElementsToDom = function () {
        body.append(this.modalEl);
        if (this.options.backdrop) {
          if (activeBackdrops.value === 0) {
            body.append(this.backdropEl);
          }
          activeBackdrops.value++;
        }
        this._open = true;
      };
      Dialog.prototype._removeElementsFromDom = function () {
        this.modalEl.remove();
        if (this.options.backdrop) {
          activeBackdrops.value--;
          if (activeBackdrops.value === 0) {
            this.backdropEl.remove();
          }
        }
        this._open = false;
      };
      Dialog.prototype._loadResolves = function () {
        var values = [], keys = [], templatePromise, self = this;
        if (this.options.template) {
          templatePromise = $q.when(this.options.template);
        } else if (this.options.templateUrl) {
          templatePromise = $http.get(this.options.templateUrl, { cache: $templateCache }).then(function (response) {
            return response.data;
          });
        }
        angular.forEach(this.options.resolve || [], function (value, key) {
          keys.push(key);
          values.push(angular.isString(value) ? $injector.get(value) : $injector.invoke(value));
        });
        keys.push('$template');
        values.push(templatePromise);
        return $q.all(values).then(function (values) {
          var locals = {};
          angular.forEach(values, function (value, index) {
            locals[keys[index]] = value;
          });
          locals.dialog = self;
          return locals;
        });
      };
      return {
        dialog: function (opts) {
          return new Dialog(opts);
        },
        messageBox: function (title, message, buttons) {
          return new Dialog({
            templateUrl: 'template/dialog/message.html',
            controller: 'MessageBoxController',
            resolve: {
              model: function () {
                return {
                  title: title,
                  message: message,
                  buttons: buttons
                };
              }
            }
          });
        }
      };
    }
  ];
});
angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function ($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
            top: 0,
            left: 0
          };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop;
          offsetParentBCR.left += offsetParentEl.clientLeft;
        }
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft)
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position']).provider('$tooltip', function () {
  var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };
  var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };
  var globalOptions = {};
  this.options = function (value) {
    angular.extend(globalOptions, value);
  };
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }
  this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$parse',
    '$document',
    '$position',
    function ($window, $compile, $timeout, $parse, $document, $position) {
      return function $tooltip(type, prefix, defaultTriggerShow) {
        var options = angular.extend({}, defaultOptions, globalOptions);
        function setTriggers(trigger) {
          var show, hide;
          show = trigger || options.trigger || defaultTriggerShow;
          if (angular.isDefined(options.trigger)) {
            hide = triggerMap[options.trigger] || show;
          } else {
            hide = triggerMap[show] || show;
          }
          return {
            show: show,
            hide: hide
          };
        }
        var directiveName = snake_case(type);
        var triggers = setTriggers(undefined);
        var template = '<' + directiveName + '-popup ' + 'title="{{tt_title}}" ' + 'content="{{tt_content}}" ' + 'placement="{{tt_placement}}" ' + 'animation="tt_animation()" ' + 'is-open="tt_isOpen"' + '>' + '</' + directiveName + '-popup>';
        return {
          restrict: 'EA',
          scope: true,
          link: function link(scope, element, attrs) {
            var tooltip = $compile(template)(scope);
            var transitionTimeout;
            var popupTimeout;
            var $body;
            scope.tt_isOpen = false;
            function toggleTooltipBind() {
              if (!scope.tt_isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }
            function showTooltipBind() {
              if (scope.tt_popupDelay) {
                popupTimeout = $timeout(show, scope.tt_popupDelay);
              } else {
                scope.$apply(show);
              }
            }
            function hideTooltipBind() {
              scope.$apply(function () {
                hide();
              });
            }
            function show() {
              var position, ttWidth, ttHeight, ttPosition;
              if (!scope.tt_content) {
                return;
              }
              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
              }
              tooltip.css({
                top: 0,
                left: 0,
                display: 'block'
              });
              if (options.appendToBody) {
                $body = $body || $document.find('body');
                $body.append(tooltip);
              } else {
                element.after(tooltip);
              }
              position = $position.position(element);
              ttWidth = tooltip.prop('offsetWidth');
              ttHeight = tooltip.prop('offsetHeight');
              switch (scope.tt_placement) {
              case 'right':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2 + 'px',
                  left: position.left + position.width + 'px'
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + position.height + 'px',
                  left: position.left + position.width / 2 - ttWidth / 2 + 'px'
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2 + 'px',
                  left: position.left - ttWidth + 'px'
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight + 'px',
                  left: position.left + position.width / 2 - ttWidth / 2 + 'px'
                };
                break;
              }
              tooltip.css(ttPosition);
              scope.tt_isOpen = true;
            }
            function hide() {
              scope.tt_isOpen = false;
              $timeout.cancel(popupTimeout);
              if (angular.isDefined(scope.tt_animation) && scope.tt_animation()) {
                transitionTimeout = $timeout(function () {
                  tooltip.remove();
                }, 500);
              } else {
                tooltip.remove();
              }
            }
            attrs.$observe(type, function (val) {
              scope.tt_content = val;
            });
            attrs.$observe(prefix + 'Title', function (val) {
              scope.tt_title = val;
            });
            attrs.$observe(prefix + 'Placement', function (val) {
              scope.tt_placement = angular.isDefined(val) ? val : options.placement;
            });
            attrs.$observe(prefix + 'Animation', function (val) {
              scope.tt_animation = angular.isDefined(val) ? $parse(val) : function () {
                return options.animation;
              };
            });
            attrs.$observe(prefix + 'PopupDelay', function (val) {
              var delay = parseInt(val, 10);
              scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
            });
            attrs.$observe(prefix + 'Trigger', function (val) {
              element.unbind(triggers.show);
              element.unbind(triggers.hide);
              triggers = setTriggers(val);
              if (triggers.show === triggers.hide) {
                element.bind(triggers.show, toggleTooltipBind);
              } else {
                element.bind(triggers.show, showTooltipBind);
                element.bind(triggers.hide, hideTooltipBind);
              }
            });
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: '/components/angular-ui-bootstrap/template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]);
;
angular.module('ui.bootstrap.tabs', []).controller('TabsController', [
  '$scope',
  '$element',
  function ($scope, $element) {
    var panes = $scope.panes = [];
    this.select = $scope.select = function selectPane(pane) {
      angular.forEach(panes, function (pane) {
        pane.selected = false;
      });
      pane.selected = true;
    };
    this.addPane = function addPane(pane) {
      if (!panes.length) {
        $scope.select(pane);
      }
      panes.push(pane);
    };
    this.removePane = function removePane(pane) {
      var index = panes.indexOf(pane);
      panes.splice(index, 1);
      if (pane.selected && panes.length > 0) {
        $scope.select(panes[index < panes.length ? index : index - 1]);
      }
    };
  }
]).directive('tabs', function () {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {},
    controller: 'TabsController',
    templateUrl: 'template/tabs/tabs.html',
    replace: true
  };
}).directive('pane', [
  '$parse',
  function ($parse) {
    return {
      require: '^tabs',
      restrict: 'EA',
      transclude: true,
      scope: { heading: '@' },
      link: function (scope, element, attrs, tabsCtrl) {
        var getSelected, setSelected;
        scope.selected = false;
        if (attrs.active) {
          getSelected = $parse(attrs.active);
          setSelected = getSelected.assign;
          scope.$watch(function watchSelected() {
            return getSelected(scope.$parent);
          }, function updateSelected(value) {
            scope.selected = value;
          });
          scope.selected = getSelected ? getSelected(scope.$parent) : false;
        }
        scope.$watch('selected', function (selected) {
          if (selected) {
            tabsCtrl.select(scope);
          }
          if (setSelected) {
            setSelected(scope.$parent, selected);
          }
        });
        tabsCtrl.addPane(scope);
        scope.$on('$destroy', function () {
          tabsCtrl.removePane(scope);
        });
      },
      templateUrl: 'template/tabs/pane.html',
      replace: true
    };
  }
]);
angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', [
  '$document',
  '$location',
  '$window',
  function ($document, $location, $window) {
    var openElement = null, closeMenu = angular.noop;
    return {
      restrict: 'CA',
      scope: true,
      link: function (scope, element, attrs) {
        scope.$watch('$location.path', function () {
          closeMenu();
        });
        element.parent().bind('click', function () {
          closeMenu();
        });
        element.bind('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var elementWasOpen = element === openElement;
          if (!!openElement) {
            closeMenu();
          }
          if (!elementWasOpen) {
            element.parent().addClass('open');
            openElement = element;
            closeMenu = function (event) {
              if (event) {
                event.preventDefault();
                event.stopPropagation();
              }
              $document.unbind('click', closeMenu);
              element.parent().removeClass('open');
              closeMenu = angular.noop;
              openElement = null;
            };
            $document.bind('click', closeMenu);
          }
        });
      }
    };
  }
]);
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngResource', ['ng']).factory('$resource', [
    '$http',
    '$parse',
    function ($http, $parse) {
      var DEFAULT_ACTIONS = {
          'get': { method: 'GET' },
          'save': { method: 'POST' },
          'query': {
            method: 'GET',
            isArray: true
          },
          'remove': { method: 'DELETE' },
          'delete': { method: 'DELETE' }
        };
      var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction, getter = function (obj, path) {
          return $parse(path)(obj);
        };
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
      }
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
      }
      function Route(template, defaults) {
        this.template = template = template + '#';
        this.defaults = defaults || {};
        var urlParams = this.urlParams = {};
        forEach(template.split(/\W/), function (param) {
          if (param && new RegExp('(^|[^\\\\]):' + param + '\\W').test(template)) {
            urlParams[param] = true;
          }
        });
        this.template = template.replace(/\\:/g, ':');
      }
      Route.prototype = {
        url: function (params) {
          var self = this, url = this.template, val, encodedVal;
          params = params || {};
          forEach(this.urlParams, function (_, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(':' + urlParam + '(\\W)', 'g'), encodedVal + '$1');
            } else {
              url = url.replace(new RegExp('(/?):' + urlParam + '(\\W)', 'g'), function (match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
          url = url.replace(/\/?#$/, '');
          var query = [];
          forEach(params, function (value, key) {
            if (!self.urlParams[key]) {
              query.push(encodeUriQuery(key) + '=' + encodeUriQuery(value));
            }
          });
          query.sort();
          url = url.replace(/\/*$/, '');
          return url + (query.length ? '?' + query.join('&') : '');
        }
      };
      function ResourceFactory(url, paramDefaults, actions) {
        var route = new Route(url);
        actions = extend({}, DEFAULT_ACTIONS, actions);
        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function (value, key) {
            ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
          });
          return ids;
        }
        function Resource(value) {
          copy(value || {}, this);
        }
        forEach(actions, function (action, name) {
          action.method = angular.uppercase(action.method);
          var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
          Resource[name] = function (a1, a2, a3, a4) {
            var params = {};
            var data;
            var success = noop;
            var error = null;
            switch (arguments.length) {
            case 4:
              error = a4;
              success = a3;
            case 3:
            case 2:
              if (isFunction(a2)) {
                if (isFunction(a1)) {
                  success = a1;
                  error = a2;
                  break;
                }
                success = a2;
                error = a3;
              } else {
                params = a1;
                data = a2;
                success = a3;
                break;
              }
            case 1:
              if (isFunction(a1))
                success = a1;
              else if (hasBody)
                data = a1;
              else
                params = a1;
              break;
            case 0:
              break;
            default:
              throw 'Expected between 0-4 arguments [params, data, success, error], got ' + arguments.length + ' arguments.';
            }
            var value = this instanceof Resource ? this : action.isArray ? [] : new Resource(data);
            $http({
              method: action.method,
              url: route.url(extend({}, extractParams(data, action.params || {}), params)),
              data: data
            }).then(function (response) {
              var data = response.data;
              if (data) {
                if (action.isArray) {
                  value.length = 0;
                  forEach(data, function (item) {
                    value.push(new Resource(item));
                  });
                } else {
                  copy(data, value);
                }
              }
              (success || noop)(value, response.headers);
            }, error);
            return value;
          };
          Resource.prototype['$' + name] = function (a1, a2, a3) {
            var params = extractParams(this), success = noop, error;
            switch (arguments.length) {
            case 3:
              params = a1;
              success = a2;
              error = a3;
              break;
            case 2:
            case 1:
              if (isFunction(a1)) {
                success = a1;
                error = a2;
              } else {
                params = a1;
                success = a2 || noop;
              }
            case 0:
              break;
            default:
              throw 'Expected between 1-3 arguments [params, success, error], got ' + arguments.length + ' arguments.';
            }
            var data = hasBody ? this : undefined;
            Resource[name].call(this, params, data, success, error);
          };
        });
        Resource.bind = function (additionalParamDefaults) {
          return ResourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };
        return Resource;
      }
      return ResourceFactory;
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function ($rootScope, $browser) {
      var cookies = {}, lastCookies = {}, lastBrowserCookies, runEval = false, copy = angular.copy, isUndefined = angular.isUndefined;
      $browser.addPollFn(function () {
        var currentCookies = $browser.cookies();
        if (lastBrowserCookies != currentCookies) {
          lastBrowserCookies = currentCookies;
          copy(currentCookies, lastCookies);
          copy(currentCookies, cookies);
          if (runEval)
            $rootScope.$apply();
        }
      })();
      runEval = true;
      $rootScope.$watch(push);
      return cookies;
      function push() {
        var name, value, browserCookies, updated;
        for (name in lastCookies) {
          if (isUndefined(cookies[name])) {
            $browser.cookies(name, undefined);
          }
        }
        for (name in cookies) {
          value = cookies[name];
          if (!angular.isString(value)) {
            if (angular.isDefined(lastCookies[name])) {
              cookies[name] = lastCookies[name];
            } else {
              delete cookies[name];
            }
          } else if (value !== lastCookies[name]) {
            $browser.cookies(name, value);
            updated = true;
          }
        }
        if (updated) {
          updated = false;
          browserCookies = $browser.cookies();
          for (name in cookies) {
            if (cookies[name] !== browserCookies[name]) {
              if (isUndefined(browserCookies[name])) {
                delete cookies[name];
              } else {
                cookies[name] = browserCookies[name];
              }
              updated = true;
            }
          }
        }
      }
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function ($cookies) {
      return {
        get: function (key) {
          var value = $cookies[key];
          return value ? angular.fromJson(value) : value;
        },
        put: function (key, value) {
          $cookies[key] = angular.toJson(value);
        },
        remove: function (key) {
          delete $cookies[key];
        }
      };
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var $sanitize = function (html) {
    var buf = [];
    htmlParser(html, htmlSanitizeWriter(buf));
    return buf.join('');
  };
  var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#)/, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
  var voidElements = makeMap('area,br,col,hr,img,wbr');
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'), optionalEndTagInlineElements = makeMap('rp,rt'), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
  var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap('address,article,aside,' + 'blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,' + 'header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));
  var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,bdi,bdo,' + 'big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,' + 'span,strike,strong,sub,sup,time,tt,u,var'));
  var specialElements = makeMap('script,style');
  var validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = angular.extend({}, uriAttrs, makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' + 'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' + 'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' + 'scope,scrolling,shape,span,start,summary,target,title,type,' + 'valign,value,vspace,width'));
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  function htmlParser(html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
      return stack[stack.length - 1];
    };
    while (html) {
      chars = true;
      if (!stack.last() || !specialElements[stack.last()]) {
        if (html.indexOf('<!--') === 0) {
          index = html.indexOf('-->');
          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
        } else if (BEGING_END_TAGE_REGEXP.test(html)) {
          match = html.match(END_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(END_TAG_REGEXP, parseEndTag);
            chars = false;
          }
        } else if (BEGIN_TAG_REGEXP.test(html)) {
          match = html.match(START_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
            chars = false;
          }
        }
        if (chars) {
          index = html.indexOf('<');
          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);
          if (handler.chars)
            handler.chars(decodeEntities(text));
        }
      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'), function (all, text) {
          text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');
          if (handler.chars)
            handler.chars(decodeEntities(text));
          return '';
        });
        parseEndTag('', stack.last());
      }
      if (html == last) {
        throw 'Parse Error: ' + html;
      }
      last = html;
    }
    parseEndTag();
    function parseStartTag(tag, tagName, rest, unary) {
      tagName = angular.lowercase(tagName);
      if (blockElements[tagName]) {
        while (stack.last() && inlineElements[stack.last()]) {
          parseEndTag('', stack.last());
        }
      }
      if (optionalEndTagElements[tagName] && stack.last() == tagName) {
        parseEndTag('', tagName);
      }
      unary = voidElements[tagName] || !!unary;
      if (!unary)
        stack.push(tagName);
      var attrs = {};
      rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQoutedValue, unqoutedValue) {
        var value = doubleQuotedValue || singleQoutedValue || unqoutedValue || '';
        attrs[name] = decodeEntities(value);
      });
      if (handler.start)
        handler.start(tagName, attrs, unary);
    }
    function parseEndTag(tag, tagName) {
      var pos = 0, i;
      tagName = angular.lowercase(tagName);
      if (tagName)
        for (pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;
      if (pos >= 0) {
        for (i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);
        stack.length = pos;
      }
    }
  }
  var hiddenPre = document.createElement('pre');
  function decodeEntities(value) {
    hiddenPre.innerHTML = value.replace(/</g, '&lt;');
    return hiddenPre.innerText || hiddenPre.textContent || '';
  }
  function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(NON_ALPHANUMERIC_REGEXP, function (value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function htmlSanitizeWriter(buf) {
    var ignore = false;
    var out = angular.bind(buf, buf.push);
    return {
      start: function (tag, attrs, unary) {
        tag = angular.lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] == true) {
          out('<');
          out(tag);
          angular.forEach(attrs, function (value, key) {
            var lkey = angular.lowercase(key);
            if (validAttrs[lkey] == true && (uriAttrs[lkey] !== true || value.match(URI_REGEXP))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function (tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
      chars: function (chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
    };
  }
  angular.module('ngSanitize', []).value('$sanitize', $sanitize);
  angular.module('ngSanitize').directive('ngBindHtml', [
    '$sanitize',
    function ($sanitize) {
      return function (scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.ngBindHtml);
        scope.$watch(attr.ngBindHtml, function ngBindHtmlWatchAction(value) {
          value = $sanitize(value);
          element.html(value || '');
        });
      };
    }
  ]);
  angular.module('ngSanitize').filter('linky', function () {
    var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/, MAILTO_REGEXP = /^mailto:/;
    return function (text) {
      if (!text)
        return text;
      var match;
      var raw = text;
      var html = [];
      var writer = htmlSanitizeWriter(html);
      var url;
      var i;
      while (match = raw.match(LINKY_URL_REGEXP)) {
        url = match[0];
        if (match[2] == match[3])
          url = 'mailto:' + url;
        i = match.index;
        writer.chars(raw.substr(0, i));
        writer.start('a', { href: url });
        writer.chars(match[0].replace(MAILTO_REGEXP, ''));
        writer.end('a');
        raw = raw.substring(i + match[0].length);
      }
      writer.chars(raw);
      return html.join('');
    };
  });
}(window, window.angular));
(function () {
  var angularFileUpload = angular.module('angularFileUpload', []);
  angularFileUpload.service('$upload', [
    '$http',
    function ($http) {
      this.upload = function (config) {
        config.method = config.method || 'POST';
        config.headers = config.headers || {};
        config.headers['Content-Type'] = undefined;
        config.transformRequest = angular.identity;
        var formData = new FormData();
        if (config.data) {
          for (key in config.data) {
            formData.append(key, config.data[key]);
          }
        }
        formData.append(config.fileFormDataName || 'file', config.file, config.file.name);
        formData['__uploadProgress_'] = function (e) {
          if (e)
            config.progress(e);
        };
        var response = $http.post(config.url, formData, config);
        return response;
      };
    }
  ]);
  angularFileUpload.directive('ngFileSelect', [
    '$parse',
    '$http',
    function ($parse, $http) {
      return function (scope, elem, attr) {
        var fn = $parse(attr['ngFileSelect']);
        elem.bind('change', function (evt) {
          var files = [], fileList, i;
          fileList = evt.target.files;
          if (fileList != null) {
            for (i = 0; i < fileList.length; i++) {
              files.push(fileList.item(i));
            }
          }
          scope.$apply(function () {
            fn(scope, {
              $files: files,
              $event: evt
            });
          });
        });
        elem.bind('click', function () {
          this.value = null;
        });
      };
    }
  ]);
  angularFileUpload.directive('ngFileDropAvailable', [
    '$parse',
    '$http',
    function ($parse, $http) {
      return function (scope, elem, attr) {
        if ('draggable' in document.createElement('span')) {
          var fn = $parse(attr['ngFileDropAvailable']);
          if (!scope.$$phase) {
            scope.$apply(function () {
              fn(scope);
            });
          } else {
            fn(scope);
          }
        }
      };
    }
  ]);
  angularFileUpload.directive('ngFileDrop', [
    '$parse',
    '$http',
    function ($parse, $http) {
      return function (scope, elem, attr) {
        if ('draggable' in document.createElement('span')) {
          var fn = $parse(attr['ngFileDrop']);
          elem[0].addEventListener('dragover', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            elem.addClass('dragover');
          }, false);
          elem[0].addEventListener('dragleave', function (evt) {
            elem.removeClass('dragover');
          }, false);
          elem[0].addEventListener('drop', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            elem.removeClass('dragover');
            var files = [], fileList = evt.dataTransfer.files, i;
            if (fileList != null) {
              for (i = 0; i < fileList.length; i++) {
                files.push(fileList.item(i));
              }
            }
            scope.$apply(function () {
              fn(scope, {
                $files: files,
                $event: evt
              });
            });
          }, false);
        }
      };
    }
  ]);
}());
(function ($) {
  if (typeof $.fn.each2 == 'undefined') {
    $.fn.extend({
      each2: function (c) {
        var j = $([0]), i = -1, l = this.length;
        while (++i < l && (j.context = j[0] = this[i]) && c.call(j[0], i, j) !== false);
        return this;
      }
    });
  }
}(jQuery));
(function ($, undefined) {
  'use strict';
  if (window.Select2 !== undefined) {
    return;
  }
  var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer, lastMousePosition, $document;
  KEY = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    BACKSPACE: 8,
    DELETE: 46,
    isArrow: function (k) {
      k = k.which ? k.which : k;
      switch (k) {
      case KEY.LEFT:
      case KEY.RIGHT:
      case KEY.UP:
      case KEY.DOWN:
        return true;
      }
      return false;
    },
    isControl: function (e) {
      var k = e.which;
      switch (k) {
      case KEY.SHIFT:
      case KEY.CTRL:
      case KEY.ALT:
        return true;
      }
      if (e.metaKey)
        return true;
      return false;
    },
    isFunctionKey: function (k) {
      k = k.which ? k.which : k;
      return k >= 112 && k <= 123;
    }
  };
  $document = $(document);
  nextUid = function () {
    var counter = 1;
    return function () {
      return counter++;
    };
  }();
  function indexOf(value, array) {
    var i = 0, l = array.length;
    for (; i < l; i = i + 1) {
      if (equal(value, array[i]))
        return i;
    }
    return -1;
  }
  function equal(a, b) {
    if (a === b)
      return true;
    if (a === undefined || b === undefined)
      return false;
    if (a === null || b === null)
      return false;
    if (a.constructor === String)
      return a + '' === b + '';
    if (b.constructor === String)
      return b + '' === a + '';
    return false;
  }
  function splitVal(string, separator) {
    var val, i, l;
    if (string === null || string.length < 1)
      return [];
    val = string.split(separator);
    for (i = 0, l = val.length; i < l; i = i + 1)
      val[i] = $.trim(val[i]);
    return val;
  }
  function getSideBorderPadding(element) {
    return element.outerWidth(false) - element.width();
  }
  function installKeyUpChangeEvent(element) {
    var key = 'keyup-change-value';
    element.bind('keydown', function () {
      if ($.data(element, key) === undefined) {
        $.data(element, key, element.val());
      }
    });
    element.bind('keyup', function () {
      var val = $.data(element, key);
      if (val !== undefined && element.val() !== val) {
        $.removeData(element, key);
        element.trigger('keyup-change');
      }
    });
  }
  $document.bind('mousemove', function (e) {
    lastMousePosition = {
      x: e.pageX,
      y: e.pageY
    };
  });
  function installFilteredMouseMove(element) {
    element.bind('mousemove', function (e) {
      var lastpos = lastMousePosition;
      if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
        $(e.target).trigger('mousemove-filtered', e);
      }
    });
  }
  function debounce(quietMillis, fn, ctx) {
    ctx = ctx || undefined;
    var timeout;
    return function () {
      var args = arguments;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        fn.apply(ctx, args);
      }, quietMillis);
    };
  }
  function thunk(formula) {
    var evaluated = false, value;
    return function () {
      if (evaluated === false) {
        value = formula();
        evaluated = true;
      }
      return value;
    };
  }
  ;
  function installDebouncedScroll(threshold, element) {
    var notify = debounce(threshold, function (e) {
        element.trigger('scroll-debounced', e);
      });
    element.bind('scroll', function (e) {
      if (indexOf(e.target, element.get()) >= 0)
        notify(e);
    });
  }
  function focus($el) {
    if ($el[0] === document.activeElement)
      return;
    window.setTimeout(function () {
      var el = $el[0], pos = $el.val().length, range;
      $el.focus();
      if ($el.is(':visible') && el === document.activeElement) {
        if (el.setSelectionRange) {
          el.setSelectionRange(pos, pos);
        } else if (el.createTextRange) {
          range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
      }
    }, 0);
  }
  function killEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  function killEventImmediately(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function measureTextWidth(e) {
    if (!sizer) {
      var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
      sizer = $(document.createElement('div')).css({
        position: 'absolute',
        left: '-10000px',
        top: '-10000px',
        display: 'none',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        whiteSpace: 'nowrap'
      });
      sizer.attr('class', 'select2-sizer');
      $('body').append(sizer);
    }
    sizer.text(e.val());
    return sizer.width();
  }
  function syncCssClasses(dest, src, adapter) {
    var classes, replacements = [], adapted;
    classes = dest.attr('class');
    if (classes) {
      classes = '' + classes;
      $(classes.split(' ')).each2(function () {
        if (this.indexOf('select2-') === 0) {
          replacements.push(this);
        }
      });
    }
    classes = src.attr('class');
    if (classes) {
      classes = '' + classes;
      $(classes.split(' ')).each2(function () {
        if (this.indexOf('select2-') !== 0) {
          adapted = adapter(this);
          if (adapted) {
            replacements.push(this);
          }
        }
      });
    }
    dest.attr('class', replacements.join(' '));
  }
  function markMatch(text, term, markup, escapeMarkup) {
    var match = text.toUpperCase().indexOf(term.toUpperCase()), tl = term.length;
    if (match < 0) {
      markup.push(escapeMarkup(text));
      return;
    }
    markup.push(escapeMarkup(text.substring(0, match)));
    markup.push('<span class=\'select2-match\'>');
    markup.push(escapeMarkup(text.substring(match, match + tl)));
    markup.push('</span>');
    markup.push(escapeMarkup(text.substring(match + tl, text.length)));
  }
  function ajax(options) {
    var timeout, requestSequence = 0, handler = null, quietMillis = options.quietMillis || 100, ajaxUrl = options.url, self = this;
    return function (query) {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        requestSequence += 1;
        var requestNumber = requestSequence, data = options.data, url = ajaxUrl, transport = options.transport || $.ajax, type = options.type || 'GET', params = {};
        data = data ? data.call(self, query.term, query.page, query.context) : null;
        url = typeof url === 'function' ? url.call(self, query.term, query.page, query.context) : url;
        if (null !== handler) {
          handler.abort();
        }
        if (options.params) {
          if ($.isFunction(options.params)) {
            $.extend(params, options.params.call(self));
          } else {
            $.extend(params, options.params);
          }
        }
        $.extend(params, {
          url: url,
          dataType: options.dataType,
          data: data,
          type: type,
          cache: false,
          success: function (data) {
            if (requestNumber < requestSequence) {
              return;
            }
            var results = options.results(data, query.page);
            query.callback(results);
          }
        });
        handler = transport.call(self, params);
      }, quietMillis);
    };
  }
  function local(options) {
    var data = options, dataText, tmp, text = function (item) {
        return '' + item.text;
      };
    if ($.isArray(data)) {
      tmp = data;
      data = { results: tmp };
    }
    if ($.isFunction(data) === false) {
      tmp = data;
      data = function () {
        return tmp;
      };
    }
    var dataItem = data();
    if (dataItem.text) {
      text = dataItem.text;
      if (!$.isFunction(text)) {
        dataText = data.text;
        text = function (item) {
          return item[dataText];
        };
      }
    }
    return function (query) {
      var t = query.term, filtered = { results: [] }, process;
      if (t === '') {
        query.callback(data());
        return;
      }
      process = function (datum, collection) {
        var group, attr;
        datum = datum[0];
        if (datum.children) {
          group = {};
          for (attr in datum) {
            if (datum.hasOwnProperty(attr))
              group[attr] = datum[attr];
          }
          group.children = [];
          $(datum.children).each2(function (i, childDatum) {
            process(childDatum, group.children);
          });
          if (group.children.length || query.matcher(t, text(group), datum)) {
            collection.push(group);
          }
        } else {
          if (query.matcher(t, text(datum), datum)) {
            collection.push(datum);
          }
        }
      };
      $(data().results).each2(function (i, datum) {
        process(datum, filtered.results);
      });
      query.callback(filtered);
    };
  }
  function tags(data) {
    var isFunc = $.isFunction(data);
    return function (query) {
      var t = query.term, filtered = { results: [] };
      $(isFunc ? data() : data).each(function () {
        var isObject = this.text !== undefined, text = isObject ? this.text : this;
        if (t === '' || query.matcher(t, text)) {
          filtered.results.push(isObject ? this : {
            id: this,
            text: this
          });
        }
      });
      query.callback(filtered);
    };
  }
  function checkFormatter(formatter, formatterName) {
    if ($.isFunction(formatter))
      return true;
    if (!formatter)
      return false;
    throw new Error('formatterName must be a function or a falsy value');
  }
  function evaluate(val) {
    return $.isFunction(val) ? val() : val;
  }
  function countResults(results) {
    var count = 0;
    $.each(results, function (i, item) {
      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    });
    return count;
  }
  function defaultTokenizer(input, selection, selectCallback, opts) {
    var original = input, dupe = false, token, index, i, l, separator;
    if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1)
      return undefined;
    while (true) {
      index = -1;
      for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
        separator = opts.tokenSeparators[i];
        index = input.indexOf(separator);
        if (index >= 0)
          break;
      }
      if (index < 0)
        break;
      token = input.substring(0, index);
      input = input.substring(index + separator.length);
      if (token.length > 0) {
        token = opts.createSearchChoice(token, selection);
        if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
          dupe = false;
          for (i = 0, l = selection.length; i < l; i++) {
            if (equal(opts.id(token), opts.id(selection[i]))) {
              dupe = true;
              break;
            }
          }
          if (!dupe)
            selectCallback(token);
        }
      }
    }
    if (original !== input)
      return input;
  }
  function clazz(SuperClass, methods) {
    var constructor = function () {
    };
    constructor.prototype = new SuperClass();
    constructor.prototype.constructor = constructor;
    constructor.prototype.parent = SuperClass.prototype;
    constructor.prototype = $.extend(constructor.prototype, methods);
    return constructor;
  }
  AbstractSelect2 = clazz(Object, {
    bind: function (func) {
      var self = this;
      return function () {
        func.apply(self, arguments);
      };
    },
    init: function (opts) {
      var results, search, resultsSelector = '.select2-results', mask;
      this.opts = opts = this.prepareOpts(opts);
      this.id = opts.id;
      if (opts.element.data('select2') !== undefined && opts.element.data('select2') !== null) {
        this.destroy();
      }
      this.enabled = true;
      this.container = this.createContainer();
      this.containerId = 's2id_' + (opts.element.attr('id') || 'autogen' + nextUid());
      this.containerSelector = '#' + this.containerId.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
      this.container.attr('id', this.containerId);
      this.body = thunk(function () {
        return opts.element.closest('body');
      });
      syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
      this.container.css(evaluate(opts.containerCss));
      this.container.addClass(evaluate(opts.containerCssClass));
      this.elementTabIndex = this.opts.element.attr('tabIndex');
      this.opts.element.data('select2', this).addClass('select2-offscreen').bind('focus.select2', function () {
        $(this).select2('focus');
      }).attr('tabIndex', '-1').before(this.container);
      this.container.data('select2', this);
      this.dropdown = this.container.find('.select2-drop');
      this.dropdown.addClass(evaluate(opts.dropdownCssClass));
      this.dropdown.data('select2', this);
      this.results = results = this.container.find(resultsSelector);
      this.search = search = this.container.find('input.select2-input');
      search.attr('tabIndex', this.elementTabIndex);
      this.resultsPage = 0;
      this.context = null;
      this.initContainer();
      installFilteredMouseMove(this.results);
      this.dropdown.delegate(resultsSelector, 'mousemove-filtered touchstart touchmove touchend', this.bind(this.highlightUnderEvent));
      installDebouncedScroll(80, this.results);
      this.dropdown.delegate(resultsSelector, 'scroll-debounced', this.bind(this.loadMoreIfNeeded));
      if ($.fn.mousewheel) {
        results.mousewheel(function (e, delta, deltaX, deltaY) {
          var top = results.scrollTop(), height;
          if (deltaY > 0 && top - deltaY <= 0) {
            results.scrollTop(0);
            killEvent(e);
          } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
            results.scrollTop(results.get(0).scrollHeight - results.height());
            killEvent(e);
          }
        });
      }
      installKeyUpChangeEvent(search);
      search.bind('keyup-change input paste', this.bind(this.updateResults));
      search.bind('focus', function () {
        search.addClass('select2-focused');
      });
      search.bind('blur', function () {
        search.removeClass('select2-focused');
      });
      this.dropdown.delegate(resultsSelector, 'mouseup', this.bind(function (e) {
        if ($(e.target).closest('.select2-result-selectable').length > 0) {
          this.highlightUnderEvent(e);
          this.selectHighlighted(e);
        }
      }));
      this.dropdown.bind('click mouseup mousedown', function (e) {
        e.stopPropagation();
      });
      if ($.isFunction(this.opts.initSelection)) {
        this.initSelection();
        this.monitorSource();
      }
      if (opts.element.is(':disabled') || opts.element.is('[readonly=\'readonly\']'))
        this.disable();
    },
    destroy: function () {
      var select2 = this.opts.element.data('select2');
      if (this.propertyObserver) {
        delete this.propertyObserver;
        this.propertyObserver = null;
      }
      if (select2 !== undefined) {
        select2.container.remove();
        select2.dropdown.remove();
        select2.opts.element.removeClass('select2-offscreen').removeData('select2').unbind('.select2').attr({ 'tabIndex': this.elementTabIndex }).show();
      }
    },
    prepareOpts: function (opts) {
      var element, select, idKey, ajaxUrl;
      element = opts.element;
      if (element.get(0).tagName.toLowerCase() === 'select') {
        this.select = select = opts.element;
      }
      if (select) {
        $.each([
          'id',
          'multiple',
          'ajax',
          'query',
          'createSearchChoice',
          'initSelection',
          'data',
          'tags'
        ], function () {
          if (this in opts) {
            throw new Error('Option \'' + this + '\' is not allowed for Select2 when attached to a <select> element.');
          }
        });
      }
      opts = $.extend({}, {
        populateResults: function (container, results, query) {
          var populate, data, result, children, id = this.opts.id, self = this;
          populate = function (results, container, depth) {
            var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;
            results = opts.sortResults(results, container, query);
            for (i = 0, l = results.length; i < l; i = i + 1) {
              result = results[i];
              disabled = result.disabled === true;
              selectable = !disabled && id(result) !== undefined;
              compound = result.children && result.children.length > 0;
              node = $('<li></li>');
              node.addClass('select2-results-dept-' + depth);
              node.addClass('select2-result');
              node.addClass(selectable ? 'select2-result-selectable' : 'select2-result-unselectable');
              if (disabled) {
                node.addClass('select2-disabled');
              }
              if (compound) {
                node.addClass('select2-result-with-children');
              }
              node.addClass(self.opts.formatResultCssClass(result));
              label = $(document.createElement('div'));
              label.addClass('select2-result-label');
              formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
              if (formatted !== undefined) {
                label.html(formatted);
              }
              node.append(label);
              if (compound) {
                innerContainer = $('<ul></ul>');
                innerContainer.addClass('select2-result-sub');
                populate(result.children, innerContainer, depth + 1);
                node.append(innerContainer);
              }
              node.data('select2-data', result);
              container.append(node);
            }
          };
          populate(results, container, 0);
        }
      }, $.fn.select2.defaults, opts);
      if (typeof opts.id !== 'function') {
        idKey = opts.id;
        opts.id = function (e) {
          return e[idKey];
        };
      }
      if ($.isArray(opts.element.data('select2Tags'))) {
        if ('tags' in opts) {
          throw 'tags specified as both an attribute \'data-select2-tags\' and in options of Select2 ' + opts.element.attr('id');
        }
        opts.tags = opts.element.data('select2Tags');
      }
      if (select) {
        opts.query = this.bind(function (query) {
          var data = {
              results: [],
              more: false
            }, term = query.term, children, firstChild, process;
          process = function (element, collection) {
            var group;
            if (element.is('option')) {
              if (query.matcher(term, element.text(), element)) {
                collection.push({
                  id: element.attr('value'),
                  text: element.text(),
                  element: element.get(),
                  css: element.attr('class'),
                  disabled: equal(element.attr('disabled'), 'disabled')
                });
              }
            } else if (element.is('optgroup')) {
              group = {
                text: element.attr('label'),
                children: [],
                element: element.get(),
                css: element.attr('class')
              };
              element.children().each2(function (i, elm) {
                process(elm, group.children);
              });
              if (group.children.length > 0) {
                collection.push(group);
              }
            }
          };
          children = element.children();
          if (this.getPlaceholder() !== undefined && children.length > 0) {
            firstChild = children[0];
            if ($(firstChild).text() === '') {
              children = children.not(firstChild);
            }
          }
          children.each2(function (i, elm) {
            process(elm, data.results);
          });
          query.callback(data);
        });
        opts.id = function (e) {
          return e.id;
        };
        opts.formatResultCssClass = function (data) {
          return data.css;
        };
      } else {
        if (!('query' in opts)) {
          if ('ajax' in opts) {
            ajaxUrl = opts.element.data('ajax-url');
            if (ajaxUrl && ajaxUrl.length > 0) {
              opts.ajax.url = ajaxUrl;
            }
            opts.query = ajax.call(opts.element, opts.ajax);
          } else if ('data' in opts) {
            opts.query = local(opts.data);
          } else if ('tags' in opts) {
            opts.query = tags(opts.tags);
            if (opts.createSearchChoice === undefined) {
              opts.createSearchChoice = function (term) {
                return {
                  id: term,
                  text: term
                };
              };
            }
            if (opts.initSelection === undefined) {
              opts.initSelection = function (element, callback) {
                var data = [];
                $(splitVal(element.val(), opts.separator)).each(function () {
                  var id = this, text = this, tags = opts.tags;
                  if ($.isFunction(tags))
                    tags = tags();
                  $(tags).each(function () {
                    if (equal(this.id, id)) {
                      text = this.text;
                      return false;
                    }
                  });
                  data.push({
                    id: id,
                    text: text
                  });
                });
                callback(data);
              };
            }
          }
        }
      }
      if (typeof opts.query !== 'function') {
        throw 'query function not defined for Select2 ' + opts.element.attr('id');
      }
      return opts;
    },
    monitorSource: function () {
      var el = this.opts.element, sync;
      el.bind('change.select2', this.bind(function (e) {
        if (this.opts.element.data('select2-change-triggered') !== true) {
          this.initSelection();
        }
      }));
      sync = this.bind(function () {
        var enabled, readonly, self = this;
        enabled = this.opts.element.attr('disabled') !== 'disabled';
        readonly = this.opts.element.attr('readonly') === 'readonly';
        enabled = enabled && !readonly;
        if (this.enabled !== enabled) {
          if (enabled) {
            this.enable();
          } else {
            this.disable();
          }
        }
        syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
        this.container.addClass(evaluate(this.opts.containerCssClass));
        syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
        this.dropdown.addClass(evaluate(this.opts.dropdownCssClass));
      });
      el.bind('propertychange.select2 DOMAttrModified.select2', sync);
      if (typeof WebKitMutationObserver !== 'undefined') {
        if (this.propertyObserver) {
          delete this.propertyObserver;
          this.propertyObserver = null;
        }
        this.propertyObserver = new WebKitMutationObserver(function (mutations) {
          mutations.forEach(sync);
        });
        this.propertyObserver.observe(el.get(0), {
          attributes: true,
          subtree: false
        });
      }
    },
    triggerChange: function (details) {
      details = details || {};
      details = $.extend({}, details, {
        type: 'change',
        val: this.val()
      });
      this.opts.element.data('select2-change-triggered', true);
      this.opts.element.trigger(details);
      this.opts.element.data('select2-change-triggered', false);
      this.opts.element.click();
      if (this.opts.blurOnChange)
        this.opts.element.blur();
    },
    enable: function () {
      if (this.enabled)
        return;
      this.enabled = true;
      this.container.removeClass('select2-container-disabled');
      this.opts.element.removeAttr('disabled');
    },
    disable: function () {
      if (!this.enabled)
        return;
      this.close();
      this.enabled = false;
      this.container.addClass('select2-container-disabled');
      this.opts.element.attr('disabled', 'disabled');
    },
    opened: function () {
      return this.container.hasClass('select2-dropdown-open');
    },
    positionDropdown: function () {
      var offset = this.container.offset(), height = this.container.outerHeight(false), width = this.container.outerWidth(false), dropHeight = this.dropdown.outerHeight(false), viewPortRight = $(window).scrollLeft() + $(window).width(), viewportBottom = $(window).scrollTop() + $(window).height(), dropTop = offset.top + height, dropLeft = offset.left, enoughRoomBelow = dropTop + dropHeight <= viewportBottom, enoughRoomAbove = offset.top - dropHeight >= this.body().scrollTop(), dropWidth = this.dropdown.outerWidth(false), enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight, aboveNow = this.dropdown.hasClass('select2-drop-above'), bodyOffset, above, css;
      if (this.body().css('position') !== 'static') {
        bodyOffset = this.body().offset();
        dropTop -= bodyOffset.top;
        dropLeft -= bodyOffset.left;
      }
      if (aboveNow) {
        above = true;
        if (!enoughRoomAbove && enoughRoomBelow)
          above = false;
      } else {
        above = false;
        if (!enoughRoomBelow && enoughRoomAbove)
          above = true;
      }
      if (!enoughRoomOnRight) {
        dropLeft = offset.left + width - dropWidth;
      }
      if (above) {
        dropTop = offset.top - dropHeight;
        this.container.addClass('select2-drop-above');
        this.dropdown.addClass('select2-drop-above');
      } else {
        this.container.removeClass('select2-drop-above');
        this.dropdown.removeClass('select2-drop-above');
      }
      css = $.extend({
        top: dropTop,
        left: dropLeft,
        width: width
      }, evaluate(this.opts.dropdownCss));
      this.dropdown.css(css);
    },
    shouldOpen: function () {
      var event;
      if (this.opened())
        return false;
      event = $.Event('opening');
      this.opts.element.trigger(event);
      return !event.isDefaultPrevented();
    },
    clearDropdownAlignmentPreference: function () {
      this.container.removeClass('select2-drop-above');
      this.dropdown.removeClass('select2-drop-above');
    },
    open: function () {
      if (!this.shouldOpen())
        return false;
      window.setTimeout(this.bind(this.opening), 1);
      return true;
    },
    opening: function () {
      var cid = this.containerId, scroll = 'scroll.' + cid, resize = 'resize.' + cid, orient = 'orientationchange.' + cid, mask;
      this.clearDropdownAlignmentPreference();
      this.container.addClass('select2-dropdown-open').addClass('select2-container-active');
      if (this.dropdown[0] !== this.body().children().last()[0]) {
        this.dropdown.detach().appendTo(this.body());
      }
      this.updateResults(true);
      mask = $('#select2-drop-mask');
      if (mask.length == 0) {
        mask = $(document.createElement('div'));
        mask.attr('id', 'select2-drop-mask').attr('class', 'select2-drop-mask');
        mask.hide();
        mask.appendTo(this.body());
        mask.bind('mousedown touchstart', function (e) {
          var dropdown = $('#select2-drop'), self;
          if (dropdown.length > 0) {
            self = dropdown.data('select2');
            if (self.opts.selectOnBlur) {
              self.selectHighlighted({ noFocus: true });
            }
            self.close();
          }
        });
      }
      if (this.dropdown.prev()[0] !== mask[0]) {
        this.dropdown.before(mask);
      }
      $('#select2-drop').removeAttr('id');
      this.dropdown.attr('id', 'select2-drop');
      mask.css(_makeMaskCss());
      mask.show();
      this.dropdown.show();
      this.positionDropdown();
      this.dropdown.addClass('select2-drop-active');
      this.ensureHighlightVisible();
      var that = this;
      this.container.parents().add(window).each(function () {
        $(this).bind(resize + ' ' + scroll + ' ' + orient, function (e) {
          $('#select2-drop-mask').css(_makeMaskCss());
          that.positionDropdown();
        });
      });
      this.focusSearch();
      function _makeMaskCss() {
        return {
          width: Math.max(document.documentElement.scrollWidth, $(window).width()),
          height: Math.max(document.documentElement.scrollHeight, $(window).height())
        };
      }
    },
    close: function () {
      if (!this.opened())
        return;
      var cid = this.containerId, scroll = 'scroll.' + cid, resize = 'resize.' + cid, orient = 'orientationchange.' + cid;
      this.container.parents().add(window).each(function () {
        $(this).unbind(scroll).unbind(resize).unbind(orient);
      });
      this.clearDropdownAlignmentPreference();
      $('#select2-drop-mask').hide();
      this.dropdown.removeAttr('id');
      this.dropdown.hide();
      this.container.removeClass('select2-dropdown-open');
      this.results.empty();
      this.clearSearch();
      this.search.removeClass('select2-active');
      this.opts.element.trigger($.Event('close'));
    },
    clearSearch: function () {
    },
    getMaximumSelectionSize: function () {
      return evaluate(this.opts.maximumSelectionSize);
    },
    ensureHighlightVisible: function () {
      var results = this.results, children, index, child, hb, rb, y, more;
      index = this.highlight();
      if (index < 0)
        return;
      if (index == 0) {
        results.scrollTop(0);
        return;
      }
      children = this.findHighlightableChoices();
      child = $(children[index]);
      hb = child.offset().top + child.outerHeight(true);
      if (index === children.length - 1) {
        more = results.find('li.select2-more-results');
        if (more.length > 0) {
          hb = more.offset().top + more.outerHeight(true);
        }
      }
      rb = results.offset().top + results.outerHeight(true);
      if (hb > rb) {
        results.scrollTop(results.scrollTop() + (hb - rb));
      }
      y = child.offset().top - results.offset().top;
      if (y < 0 && child.css('display') != 'none') {
        results.scrollTop(results.scrollTop() + y);
      }
    },
    findHighlightableChoices: function () {
      var h = this.results.find('.select2-result-selectable:not(.select2-selected):not(.select2-disabled)');
      return this.results.find('.select2-result-selectable:not(.select2-selected):not(.select2-disabled)');
    },
    moveHighlight: function (delta) {
      var choices = this.findHighlightableChoices(), index = this.highlight();
      while (index > -1 && index < choices.length) {
        index += delta;
        var choice = $(choices[index]);
        if (choice.hasClass('select2-result-selectable') && !choice.hasClass('select2-disabled') && !choice.hasClass('select2-selected')) {
          this.highlight(index);
          break;
        }
      }
    },
    highlight: function (index) {
      var choices = this.findHighlightableChoices(), choice, data;
      if (arguments.length === 0) {
        return indexOf(choices.filter('.select2-highlighted')[0], choices.get());
      }
      if (index >= choices.length)
        index = choices.length - 1;
      if (index < 0)
        index = 0;
      this.results.find('.select2-highlighted').removeClass('select2-highlighted');
      choice = $(choices[index]);
      choice.addClass('select2-highlighted');
      this.ensureHighlightVisible();
      data = choice.data('select2-data');
      if (data) {
        this.opts.element.trigger({
          type: 'highlight',
          val: this.id(data),
          choice: data
        });
      }
    },
    countSelectableResults: function () {
      return this.findHighlightableChoices().length;
    },
    highlightUnderEvent: function (event) {
      var el = $(event.target).closest('.select2-result-selectable');
      if (el.length > 0 && !el.is('.select2-highlighted')) {
        var choices = this.findHighlightableChoices();
        this.highlight(choices.index(el));
      } else if (el.length == 0) {
        this.results.find('.select2-highlighted').removeClass('select2-highlighted');
      }
    },
    loadMoreIfNeeded: function () {
      var results = this.results, more = results.find('li.select2-more-results'), below, offset = -1, page = this.resultsPage + 1, self = this, term = this.search.val(), context = this.context;
      if (more.length === 0)
        return;
      below = more.offset().top - results.offset().top - results.height();
      if (below <= this.opts.loadMorePadding) {
        more.addClass('select2-active');
        this.opts.query({
          element: this.opts.element,
          term: term,
          page: page,
          context: context,
          matcher: this.opts.matcher,
          callback: this.bind(function (data) {
            if (!self.opened())
              return;
            self.opts.populateResults.call(this, results, data.results, {
              term: term,
              page: page,
              context: context
            });
            self.postprocessResults(data, false, false);
            if (data.more === true) {
              more.detach().appendTo(results).text(self.opts.formatLoadMore(page + 1));
              window.setTimeout(function () {
                self.loadMoreIfNeeded();
              }, 10);
            } else {
              more.remove();
            }
            self.positionDropdown();
            self.resultsPage = page;
            self.context = data.context;
          })
        });
      }
    },
    tokenize: function () {
    },
    updateResults: function (initial) {
      var search = this.search, results = this.results, opts = this.opts, data, self = this, input, term = search.val(), lastTerm = $.data(this.container, 'select2-last-term');
      if (initial !== true && lastTerm && equal(term, lastTerm))
        return;
      $.data(this.container, 'select2-last-term', term);
      if (initial !== true && (this.showSearchInput === false || !this.opened())) {
        return;
      }
      function postRender() {
        results.scrollTop(0);
        search.removeClass('select2-active');
        self.positionDropdown();
      }
      function render(html) {
        results.html(html);
        postRender();
      }
      var maxSelSize = this.getMaximumSelectionSize();
      if (maxSelSize >= 1) {
        data = this.data();
        if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, 'formatSelectionTooBig')) {
          render('<li class=\'select2-selection-limit\'>' + opts.formatSelectionTooBig(maxSelSize) + '</li>');
          return;
        }
      }
      if (search.val().length < opts.minimumInputLength) {
        if (checkFormatter(opts.formatInputTooShort, 'formatInputTooShort')) {
          render('<li class=\'select2-no-results\'>' + opts.formatInputTooShort(search.val(), opts.minimumInputLength) + '</li>');
        } else {
          render('');
        }
        return;
      }
      if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
        if (checkFormatter(opts.formatInputTooLong, 'formatInputTooLong')) {
          render('<li class=\'select2-no-results\'>' + opts.formatInputTooLong(search.val(), opts.maximumInputLength) + '</li>');
        } else {
          render('');
        }
        return;
      }
      if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
        render('<li class=\'select2-searching\'>' + opts.formatSearching() + '</li>');
      }
      search.addClass('select2-active');
      input = this.tokenize();
      if (input != undefined && input != null) {
        search.val(input);
      }
      this.resultsPage = 1;
      opts.query({
        element: opts.element,
        term: search.val(),
        page: this.resultsPage,
        context: null,
        matcher: opts.matcher,
        callback: this.bind(function (data) {
          var def;
          if (!this.opened()) {
            this.search.removeClass('select2-active');
            return;
          }
          this.context = data.context === undefined ? null : data.context;
          if (this.opts.createSearchChoice && search.val() !== '') {
            def = this.opts.createSearchChoice.call(null, search.val(), data.results);
            if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
              if ($(data.results).filter(function () {
                  return equal(self.id(this), self.id(def));
                }).length === 0) {
                data.results.unshift(def);
              }
            }
          }
          if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, 'formatNoMatches')) {
            render('<li class=\'select2-no-results\'>' + opts.formatNoMatches(search.val()) + '</li>');
            return;
          }
          results.empty();
          self.opts.populateResults.call(this, results, data.results, {
            term: search.val(),
            page: this.resultsPage,
            context: null
          });
          if (data.more === true && checkFormatter(opts.formatLoadMore, 'formatLoadMore')) {
            results.append('<li class=\'select2-more-results\'>' + self.opts.escapeMarkup(opts.formatLoadMore(this.resultsPage)) + '</li>');
            window.setTimeout(function () {
              self.loadMoreIfNeeded();
            }, 10);
          }
          this.postprocessResults(data, initial);
          postRender();
          this.opts.element.trigger({
            type: 'loaded',
            data: data
          });
        })
      });
    },
    cancel: function () {
      this.close();
    },
    blur: function () {
      if (this.opts.selectOnBlur)
        this.selectHighlighted({ noFocus: true });
      this.close();
      this.container.removeClass('select2-container-active');
      if (this.search[0] === document.activeElement) {
        this.search.blur();
      }
      this.clearSearch();
      this.selection.find('.select2-search-choice-focus').removeClass('select2-search-choice-focus');
    },
    focusSearch: function () {
      focus(this.search);
    },
    selectHighlighted: function (options) {
      var index = this.highlight(), highlighted = this.results.find('.select2-highlighted'), data = highlighted.closest('.select2-result').data('select2-data');
      if (data) {
        this.highlight(index);
        this.onSelect(data, options);
      }
    },
    getPlaceholder: function () {
      return this.opts.element.attr('placeholder') || this.opts.element.attr('data-placeholder') || this.opts.element.data('placeholder') || this.opts.placeholder;
    },
    initContainerWidth: function () {
      function resolveContainerWidth() {
        var style, attrs, matches, i, l;
        if (this.opts.width === 'off') {
          return null;
        } else if (this.opts.width === 'element') {
          return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
        } else if (this.opts.width === 'copy' || this.opts.width === 'resolve') {
          style = this.opts.element.attr('style');
          if (style !== undefined) {
            attrs = style.split(';');
            for (i = 0, l = attrs.length; i < l; i = i + 1) {
              matches = attrs[i].replace(/\s/g, '').match(/width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/);
              if (matches !== null && matches.length >= 1)
                return matches[1];
            }
          }
          if (this.opts.width === 'resolve') {
            style = this.opts.element.css('width');
            if (style.indexOf('%') > 0)
              return style;
            return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
          }
          return null;
        } else if ($.isFunction(this.opts.width)) {
          return this.opts.width();
        } else {
          return this.opts.width;
        }
      }
      ;
      var width = resolveContainerWidth.call(this);
      if (width !== null) {
        this.container.css('width', width);
      }
    }
  });
  SingleSelect2 = clazz(AbstractSelect2, {
    createContainer: function () {
      var container = $(document.createElement('div')).attr({ 'class': 'select2-container' }).html([
          '<a href=\'javascript:void(0)\' onclick=\'return false;\' class=\'select2-choice\' tabindex=\'-1\'>',
          '   <span></span><abbr class=\'select2-search-choice-close\' style=\'display:none;\'></abbr>',
          '   <div><b></b></div>',
          '</a>',
          '<input class=\'select2-focusser select2-offscreen\' type=\'text\'/>',
          '<div class=\'select2-drop\' style=\'display:none\'>',
          '   <div class=\'select2-search\'>',
          '       <input type=\'text\' autocomplete=\'off\' class=\'select2-input\'/>',
          '   </div>',
          '   <ul class=\'select2-results\'>',
          '   </ul>',
          '</div>'
        ].join(''));
      return container;
    },
    disable: function () {
      if (!this.enabled)
        return;
      this.parent.disable.apply(this, arguments);
      this.focusser.attr('disabled', 'disabled');
    },
    enable: function () {
      if (this.enabled)
        return;
      this.parent.enable.apply(this, arguments);
      this.focusser.removeAttr('disabled');
    },
    opening: function () {
      this.parent.opening.apply(this, arguments);
      this.focusser.attr('disabled', 'disabled');
      this.opts.element.trigger($.Event('open'));
    },
    close: function () {
      if (!this.opened())
        return;
      this.parent.close.apply(this, arguments);
      this.focusser.removeAttr('disabled');
      focus(this.focusser);
    },
    focus: function () {
      if (this.opened()) {
        this.close();
      } else {
        this.focusser.removeAttr('disabled');
        this.focusser.focus();
      }
    },
    isFocused: function () {
      return this.container.hasClass('select2-container-active');
    },
    cancel: function () {
      this.parent.cancel.apply(this, arguments);
      this.focusser.removeAttr('disabled');
      this.focusser.focus();
    },
    initContainer: function () {
      var selection, container = this.container, dropdown = this.dropdown, clickingInside = false;
      this.showSearch(this.opts.minimumResultsForSearch >= 0);
      this.selection = selection = container.find('.select2-choice');
      this.focusser = container.find('.select2-focusser');
      this.focusser.attr('id', 's2id_autogen' + nextUid());
      $('label[for=\'' + this.opts.element.attr('id') + '\']').attr('for', this.focusser.attr('id'));
      this.search.bind('keydown', this.bind(function (e) {
        if (!this.enabled)
          return;
        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          killEvent(e);
          return;
        }
        switch (e.which) {
        case KEY.UP:
        case KEY.DOWN:
          this.moveHighlight(e.which === KEY.UP ? -1 : 1);
          killEvent(e);
          return;
        case KEY.TAB:
        case KEY.ENTER:
          this.selectHighlighted();
          killEvent(e);
          return;
        case KEY.ESC:
          this.cancel(e);
          killEvent(e);
          return;
        }
      }));
      this.search.bind('blur', this.bind(function (e) {
        if (document.activeElement === this.body().get(0)) {
          window.setTimeout(this.bind(function () {
            this.search.focus();
          }), 0);
        }
      }));
      this.focusser.bind('keydown', this.bind(function (e) {
        if (!this.enabled)
          return;
        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
          return;
        }
        if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
          killEvent(e);
          return;
        }
        if (e.which == KEY.DOWN || e.which == KEY.UP || e.which == KEY.ENTER && this.opts.openOnEnter) {
          this.open();
          killEvent(e);
          return;
        }
        if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
          if (this.opts.allowClear) {
            this.clear();
          }
          killEvent(e);
          return;
        }
      }));
      installKeyUpChangeEvent(this.focusser);
      this.focusser.bind('keyup-change input', this.bind(function (e) {
        if (this.opened())
          return;
        this.open();
        if (this.showSearchInput !== false) {
          this.search.val(this.focusser.val());
        }
        this.focusser.val('');
        killEvent(e);
      }));
      selection.delegate('abbr', 'mousedown', this.bind(function (e) {
        if (!this.enabled)
          return;
        this.clear();
        killEventImmediately(e);
        this.close();
        this.selection.focus();
      }));
      selection.bind('mousedown', this.bind(function (e) {
        clickingInside = true;
        if (this.opened()) {
          this.close();
        } else if (this.enabled) {
          this.open();
        }
        killEvent(e);
        clickingInside = false;
      }));
      dropdown.bind('mousedown', this.bind(function () {
        this.search.focus();
      }));
      selection.bind('focus', this.bind(function (e) {
        killEvent(e);
      }));
      this.focusser.bind('focus', this.bind(function () {
        this.container.addClass('select2-container-active');
      })).bind('blur', this.bind(function () {
        if (!this.opened()) {
          this.container.removeClass('select2-container-active');
        }
      }));
      this.search.bind('focus', this.bind(function () {
        this.container.addClass('select2-container-active');
      }));
      this.initContainerWidth();
      this.setPlaceholder();
    },
    clear: function (triggerChange) {
      var data = this.selection.data('select2-data');
      if (data) {
        this.opts.element.val('');
        this.selection.find('span').empty();
        this.selection.removeData('select2-data');
        this.setPlaceholder();
        if (triggerChange !== false) {
          this.opts.element.trigger({
            type: 'removed',
            val: this.id(data),
            choice: data
          });
          this.triggerChange({ removed: data });
        }
      }
    },
    initSelection: function () {
      var selected;
      if (this.opts.element.val() === '' && this.opts.element.text() === '') {
        this.close();
        this.setPlaceholder();
      } else {
        var self = this;
        this.opts.initSelection.call(null, this.opts.element, function (selected) {
          if (selected !== undefined && selected !== null) {
            self.updateSelection(selected);
            self.close();
            self.setPlaceholder();
          }
        });
      }
    },
    prepareOpts: function () {
      var opts = this.parent.prepareOpts.apply(this, arguments);
      if (opts.element.get(0).tagName.toLowerCase() === 'select') {
        opts.initSelection = function (element, callback) {
          var selected = element.find(':selected');
          if ($.isFunction(callback))
            callback({
              id: selected.attr('value'),
              text: selected.text(),
              element: selected
            });
        };
      } else if ('data' in opts) {
        opts.initSelection = opts.initSelection || function (element, callback) {
          var id = element.val();
          var match = null;
          opts.query({
            matcher: function (term, text, el) {
              var is_match = equal(id, opts.id(el));
              if (is_match) {
                match = el;
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              callback(match);
            }
          });
        };
      }
      return opts;
    },
    getPlaceholder: function () {
      if (this.select) {
        if (this.select.find('option').first().text() !== '') {
          return undefined;
        }
      }
      return this.parent.getPlaceholder.apply(this, arguments);
    },
    setPlaceholder: function () {
      var placeholder = this.getPlaceholder();
      if (this.opts.element.val() === '' && placeholder !== undefined) {
        if (this.select && this.select.find('option:first').text() !== '')
          return;
        this.selection.find('span').html(this.opts.escapeMarkup(placeholder));
        this.selection.addClass('select2-default');
        this.selection.find('abbr').hide();
      }
    },
    postprocessResults: function (data, initial, noHighlightUpdate) {
      var selected = 0, self = this, showSearchInput = true;
      this.findHighlightableChoices().each2(function (i, elm) {
        if (equal(self.id(elm.data('select2-data')), self.opts.element.val())) {
          selected = i;
          return false;
        }
      });
      if (noHighlightUpdate !== false) {
        this.highlight(selected);
      }
      if (initial === true) {
        var min = this.opts.minimumResultsForSearch;
        showSearchInput = min < 0 ? false : countResults(data.results) >= min;
        this.showSearch(showSearchInput);
      }
    },
    showSearch: function (showSearchInput) {
      this.showSearchInput = showSearchInput;
      this.dropdown.find('.select2-search')[showSearchInput ? 'removeClass' : 'addClass']('select2-search-hidden');
      $(this.dropdown, this.container)[showSearchInput ? 'addClass' : 'removeClass']('select2-with-searchbox');
    },
    onSelect: function (data, options) {
      var old = this.opts.element.val();
      this.opts.element.val(this.id(data));
      this.updateSelection(data);
      this.opts.element.trigger({
        type: 'selected',
        val: this.id(data),
        choice: data
      });
      this.close();
      if (!options || !options.noFocus)
        this.selection.focus();
      if (!equal(old, this.id(data))) {
        this.triggerChange();
      }
    },
    updateSelection: function (data) {
      var container = this.selection.find('span'), formatted;
      this.selection.data('select2-data', data);
      container.empty();
      formatted = this.opts.formatSelection(data, container);
      if (formatted !== undefined) {
        container.append(this.opts.escapeMarkup(formatted));
      }
      this.selection.removeClass('select2-default');
      if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
        this.selection.find('abbr').show();
      }
    },
    val: function () {
      var val, triggerChange = false, data = null, self = this;
      if (arguments.length === 0) {
        return this.opts.element.val();
      }
      val = arguments[0];
      if (arguments.length > 1) {
        triggerChange = arguments[1];
      }
      if (this.select) {
        this.select.val(val).find(':selected').each2(function (i, elm) {
          data = {
            id: elm.attr('value'),
            text: elm.text(),
            element: elm.get(0)
          };
          return false;
        });
        this.updateSelection(data);
        this.setPlaceholder();
        if (triggerChange) {
          this.triggerChange();
        }
      } else {
        if (this.opts.initSelection === undefined) {
          throw new Error('cannot call val() if initSelection() is not defined');
        }
        if (!val && val !== 0) {
          this.clear(triggerChange);
          if (triggerChange) {
            this.triggerChange();
          }
          return;
        }
        this.opts.element.val(val);
        this.opts.initSelection(this.opts.element, function (data) {
          self.opts.element.val(!data ? '' : self.id(data));
          self.updateSelection(data);
          self.setPlaceholder();
          if (triggerChange) {
            self.triggerChange();
          }
        });
      }
    },
    clearSearch: function () {
      this.search.val('');
      this.focusser.val('');
    },
    data: function (value) {
      var data;
      if (arguments.length === 0) {
        data = this.selection.data('select2-data');
        if (data == undefined)
          data = null;
        return data;
      } else {
        if (!value || value === '') {
          this.clear();
        } else {
          this.opts.element.val(!value ? '' : this.id(value));
          this.updateSelection(value);
        }
      }
    }
  });
  MultiSelect2 = clazz(AbstractSelect2, {
    createContainer: function () {
      var container = $(document.createElement('div')).attr({ 'class': 'select2-container select2-container-multi' }).html([
          '    <ul class=\'select2-choices\'>',
          '  <li class=\'select2-search-field\'>',
          '    <input type=\'text\' autocomplete=\'off\' class=\'select2-input\'>',
          '  </li>',
          '</ul>',
          '<div class=\'select2-drop select2-drop-multi\' style=\'display:none;\'>',
          '   <ul class=\'select2-results\'>',
          '   </ul>',
          '</div>'
        ].join(''));
      return container;
    },
    prepareOpts: function () {
      var opts = this.parent.prepareOpts.apply(this, arguments);
      if (opts.element.get(0).tagName.toLowerCase() === 'select') {
        opts.initSelection = function (element, callback) {
          var data = [];
          element.find(':selected').each2(function (i, elm) {
            data.push({
              id: elm.attr('value'),
              text: elm.text(),
              element: elm[0]
            });
          });
          callback(data);
        };
      } else if ('data' in opts) {
        opts.initSelection = opts.initSelection || function (element, callback) {
          var ids = splitVal(element.val(), opts.separator);
          var matches = [];
          opts.query({
            matcher: function (term, text, el) {
              var is_match = $.grep(ids, function (id) {
                  return equal(id, opts.id(el));
                }).length;
              if (is_match) {
                matches.push(el);
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              callback(matches);
            }
          });
        };
      }
      return opts;
    },
    initContainer: function () {
      var selector = '.select2-choices', selection;
      this.searchContainer = this.container.find('.select2-search-field');
      this.selection = selection = this.container.find(selector);
      this.search.attr('id', 's2id_autogen' + nextUid());
      $('label[for=\'' + this.opts.element.attr('id') + '\']').attr('for', this.search.attr('id'));
      this.search.bind('input paste', this.bind(function () {
        if (!this.enabled)
          return;
        if (!this.opened()) {
          this.open();
        }
      }));
      this.search.bind('keydown', this.bind(function (e) {
        if (!this.enabled)
          return;
        if (e.which === KEY.BACKSPACE && this.search.val() === '') {
          this.close();
          var choices, selected = selection.find('.select2-search-choice-focus');
          if (selected.length > 0) {
            this.unselect(selected.first());
            this.search.width(10);
            killEvent(e);
            return;
          }
          choices = selection.find('.select2-search-choice:not(.select2-locked)');
          if (choices.length > 0) {
            choices.last().addClass('select2-search-choice-focus');
          }
        } else {
          selection.find('.select2-search-choice-focus').removeClass('select2-search-choice-focus');
        }
        if (this.opened()) {
          switch (e.which) {
          case KEY.UP:
          case KEY.DOWN:
            this.moveHighlight(e.which === KEY.UP ? -1 : 1);
            killEvent(e);
            return;
          case KEY.ENTER:
          case KEY.TAB:
            this.selectHighlighted();
            killEvent(e);
            return;
          case KEY.ESC:
            this.cancel(e);
            killEvent(e);
            return;
          }
        }
        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
          return;
        }
        if (e.which === KEY.ENTER) {
          if (this.opts.openOnEnter === false) {
            return;
          } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
            return;
          }
        }
        this.open();
        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          killEvent(e);
        }
        if (e.which === KEY.ENTER) {
          killEvent(e);
        }
      }));
      this.search.bind('keyup', this.bind(this.resizeSearch));
      this.search.bind('blur', this.bind(function (e) {
        this.container.removeClass('select2-container-active');
        this.search.removeClass('select2-focused');
        if (!this.opened())
          this.clearSearch();
        e.stopImmediatePropagation();
      }));
      this.container.delegate(selector, 'mousedown', this.bind(function (e) {
        if (!this.enabled)
          return;
        if ($(e.target).closest('.select2-search-choice').length > 0) {
          return;
        }
        this.clearPlaceholder();
        this.open();
        this.focusSearch();
        e.preventDefault();
      }));
      this.container.delegate(selector, 'focus', this.bind(function () {
        if (!this.enabled)
          return;
        this.container.addClass('select2-container-active');
        this.dropdown.addClass('select2-drop-active');
        this.clearPlaceholder();
      }));
      this.initContainerWidth();
      this.clearSearch();
    },
    enable: function () {
      if (this.enabled)
        return;
      this.parent.enable.apply(this, arguments);
      this.search.removeAttr('disabled');
    },
    disable: function () {
      if (!this.enabled)
        return;
      this.parent.disable.apply(this, arguments);
      this.search.attr('disabled', true);
    },
    initSelection: function () {
      var data;
      if (this.opts.element.val() === '' && this.opts.element.text() === '') {
        this.updateSelection([]);
        this.close();
        this.clearSearch();
      }
      if (this.select || this.opts.element.val() !== '') {
        var self = this;
        this.opts.initSelection.call(null, this.opts.element, function (data) {
          if (data !== undefined && data !== null) {
            self.updateSelection(data);
            self.close();
            self.clearSearch();
          }
        });
      }
    },
    clearSearch: function () {
      var placeholder = this.getPlaceholder();
      if (placeholder !== undefined && this.getVal().length === 0 && this.search.hasClass('select2-focused') === false) {
        this.search.val(placeholder).addClass('select2-default');
        this.search.width(this.getMaxSearchWidth());
      } else {
        this.search.val('').width(10);
      }
    },
    clearPlaceholder: function () {
      if (this.search.hasClass('select2-default')) {
        this.search.val('').removeClass('select2-default');
      }
    },
    opening: function () {
      this.clearPlaceholder();
      this.resizeSearch();
      this.parent.opening.apply(this, arguments);
      this.focusSearch();
      this.opts.element.trigger($.Event('open'));
    },
    close: function () {
      if (!this.opened())
        return;
      this.parent.close.apply(this, arguments);
    },
    focus: function () {
      this.close();
      this.search.focus();
    },
    isFocused: function () {
      return this.search.hasClass('select2-focused');
    },
    updateSelection: function (data) {
      var ids = [], filtered = [], self = this;
      $(data).each(function () {
        if (indexOf(self.id(this), ids) < 0) {
          ids.push(self.id(this));
          filtered.push(this);
        }
      });
      data = filtered;
      this.selection.find('.select2-search-choice').remove();
      $(data).each(function () {
        self.addSelectedChoice(this);
      });
      self.postprocessResults();
    },
    tokenize: function () {
      var input = this.search.val();
      input = this.opts.tokenizer(input, this.data(), this.bind(this.onSelect), this.opts);
      if (input != null && input != undefined) {
        this.search.val(input);
        if (input.length > 0) {
          this.open();
        }
      }
    },
    onSelect: function (data, options) {
      this.addSelectedChoice(data);
      this.opts.element.trigger({
        type: 'selected',
        val: this.id(data),
        choice: data
      });
      if (this.select || !this.opts.closeOnSelect)
        this.postprocessResults();
      if (this.opts.closeOnSelect) {
        this.close();
        this.search.width(10);
      } else {
        if (this.countSelectableResults() > 0) {
          this.search.width(10);
          this.resizeSearch();
          if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
            this.updateResults(true);
          }
          this.positionDropdown();
        } else {
          this.close();
          this.search.width(10);
        }
      }
      this.triggerChange({ added: data });
      if (!options || !options.noFocus)
        this.focusSearch();
    },
    cancel: function () {
      this.close();
      this.focusSearch();
    },
    addSelectedChoice: function (data) {
      var enableChoice = !data.locked, enabledItem = $('<li class=\'select2-search-choice\'>' + '    <div></div>' + '    <a href=\'#\' onclick=\'return false;\' class=\'select2-search-choice-close\' tabindex=\'-1\'></a>' + '</li>'), disabledItem = $('<li class=\'select2-search-choice select2-locked\'>' + '<div></div>' + '</li>');
      var choice = enableChoice ? enabledItem : disabledItem, id = this.id(data), val = this.getVal(), formatted;
      formatted = this.opts.formatSelection(data, choice.find('div'));
      if (formatted != undefined) {
        choice.find('div').replaceWith('<div>' + this.opts.escapeMarkup(formatted) + '</div>');
      }
      if (enableChoice) {
        choice.find('.select2-search-choice-close').bind('mousedown', killEvent).bind('click dblclick', this.bind(function (e) {
          if (!this.enabled)
            return;
          $(e.target).closest('.select2-search-choice').fadeOut('fast', this.bind(function () {
            this.unselect($(e.target));
            this.selection.find('.select2-search-choice-focus').removeClass('select2-search-choice-focus');
            this.close();
            this.focusSearch();
          })).dequeue();
          killEvent(e);
        })).bind('focus', this.bind(function () {
          if (!this.enabled)
            return;
          this.container.addClass('select2-container-active');
          this.dropdown.addClass('select2-drop-active');
        }));
      }
      choice.data('select2-data', data);
      choice.insertBefore(this.searchContainer);
      val.push(id);
      this.setVal(val);
    },
    unselect: function (selected) {
      var val = this.getVal(), data, index;
      selected = selected.closest('.select2-search-choice');
      if (selected.length === 0) {
        throw 'Invalid argument: ' + selected + '. Must be .select2-search-choice';
      }
      data = selected.data('select2-data');
      if (!data) {
        return;
      }
      index = indexOf(this.id(data), val);
      if (index >= 0) {
        val.splice(index, 1);
        this.setVal(val);
        if (this.select)
          this.postprocessResults();
      }
      selected.remove();
      this.opts.element.trigger({
        type: 'removed',
        val: this.id(data),
        choice: data
      });
      this.triggerChange({ removed: data });
    },
    postprocessResults: function () {
      var val = this.getVal(), choices = this.results.find('.select2-result'), compound = this.results.find('.select2-result-with-children'), self = this;
      choices.each2(function (i, choice) {
        var id = self.id(choice.data('select2-data'));
        if (indexOf(id, val) >= 0) {
          choice.addClass('select2-selected');
          choice.find('.select2-result-selectable').addClass('select2-selected');
        }
      });
      compound.each2(function (i, choice) {
        if (!choice.is('.select2-result-selectable') && choice.find('.select2-result-selectable:not(.select2-selected)').length === 0) {
          choice.addClass('select2-selected');
        }
      });
      if (this.highlight() == -1) {
        self.highlight(0);
      }
    },
    getMaxSearchWidth: function () {
      return this.selection.width() - getSideBorderPadding(this.search);
    },
    resizeSearch: function () {
      var minimumWidth, left, maxWidth, containerLeft, searchWidth, sideBorderPadding = getSideBorderPadding(this.search);
      minimumWidth = measureTextWidth(this.search) + 10;
      left = this.search.offset().left;
      maxWidth = this.selection.width();
      containerLeft = this.selection.offset().left;
      searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;
      if (searchWidth < minimumWidth) {
        searchWidth = maxWidth - sideBorderPadding;
      }
      if (searchWidth < 40) {
        searchWidth = maxWidth - sideBorderPadding;
      }
      if (searchWidth <= 0) {
        searchWidth = minimumWidth;
      }
      this.search.width(searchWidth);
    },
    getVal: function () {
      var val;
      if (this.select) {
        val = this.select.val();
        return val === null ? [] : val;
      } else {
        val = this.opts.element.val();
        return splitVal(val, this.opts.separator);
      }
    },
    setVal: function (val) {
      var unique;
      if (this.select) {
        this.select.val(val);
      } else {
        unique = [];
        $(val).each(function () {
          if (indexOf(this, unique) < 0)
            unique.push(this);
        });
        this.opts.element.val(unique.length === 0 ? '' : unique.join(this.opts.separator));
      }
    },
    val: function () {
      var val, triggerChange = false, data = [], self = this;
      if (arguments.length === 0) {
        return this.getVal();
      }
      val = arguments[0];
      if (arguments.length > 1) {
        triggerChange = arguments[1];
      }
      if (!val && val !== 0) {
        this.opts.element.val('');
        this.updateSelection([]);
        this.clearSearch();
        if (triggerChange) {
          this.triggerChange();
        }
        return;
      }
      this.setVal(val);
      if (this.select) {
        this.opts.initSelection(this.select, this.bind(this.updateSelection));
        if (triggerChange) {
          this.triggerChange();
        }
      } else {
        if (this.opts.initSelection === undefined) {
          throw new Error('val() cannot be called if initSelection() is not defined');
        }
        this.opts.initSelection(this.opts.element, function (data) {
          var ids = $(data).map(self.id);
          self.setVal(ids);
          self.updateSelection(data);
          self.clearSearch();
          if (triggerChange) {
            self.triggerChange();
          }
        });
      }
      this.clearSearch();
    },
    onSortStart: function () {
      if (this.select) {
        throw new Error('Sorting of elements is not supported when attached to <select>. Attach to <input type=\'hidden\'/> instead.');
      }
      this.search.width(0);
      this.searchContainer.hide();
    },
    onSortEnd: function () {
      var val = [], self = this;
      this.searchContainer.show();
      this.searchContainer.appendTo(this.searchContainer.parent());
      this.resizeSearch();
      this.selection.find('.select2-search-choice').each(function () {
        val.push(self.opts.id($(this).data('select2-data')));
      });
      this.setVal(val);
      this.triggerChange();
    },
    data: function (values) {
      var self = this, ids;
      if (arguments.length === 0) {
        return this.selection.find('.select2-search-choice').map(function () {
          return $(this).data('select2-data');
        }).get();
      } else {
        if (!values) {
          values = [];
        }
        ids = $.map(values, function (e) {
          return self.opts.id(e);
        });
        this.setVal(ids);
        this.updateSelection(values);
        this.clearSearch();
      }
    }
  });
  $.fn.select2 = function () {
    var args = Array.prototype.slice.call(arguments, 0), opts, select2, value, multiple, allowedMethods = [
        'val',
        'destroy',
        'opened',
        'open',
        'close',
        'focus',
        'isFocused',
        'container',
        'onSortStart',
        'onSortEnd',
        'enable',
        'disable',
        'positionDropdown',
        'data'
      ];
    this.each(function () {
      if (args.length === 0 || typeof args[0] === 'object') {
        opts = args.length === 0 ? {} : $.extend({}, args[0]);
        opts.element = $(this);
        if (opts.element.get(0).tagName.toLowerCase() === 'select') {
          multiple = opts.element.attr('multiple');
        } else {
          multiple = opts.multiple || false;
          if ('tags' in opts) {
            opts.multiple = multiple = true;
          }
        }
        select2 = multiple ? new MultiSelect2() : new SingleSelect2();
        select2.init(opts);
      } else if (typeof args[0] === 'string') {
        if (indexOf(args[0], allowedMethods) < 0) {
          throw 'Unknown method: ' + args[0];
        }
        value = undefined;
        select2 = $(this).data('select2');
        if (select2 === undefined)
          return;
        if (args[0] === 'container') {
          value = select2.container;
        } else {
          value = select2[args[0]].apply(select2, args.slice(1));
        }
        if (value !== undefined) {
          return false;
        }
      } else {
        throw 'Invalid arguments to select2 plugin: ' + args;
      }
    });
    return value === undefined ? this : value;
  };
  $.fn.select2.defaults = {
    width: 'copy',
    loadMorePadding: 0,
    closeOnSelect: true,
    openOnEnter: true,
    containerCss: {},
    dropdownCss: {},
    containerCssClass: '',
    dropdownCssClass: '',
    formatResult: function (result, container, query, escapeMarkup) {
      var markup = [];
      markMatch(result.text, query.term, markup, escapeMarkup);
      return markup.join('');
    },
    formatSelection: function (data, container) {
      return data ? data.text : undefined;
    },
    sortResults: function (results, container, query) {
      return results;
    },
    formatResultCssClass: function (data) {
      return undefined;
    },
    formatNoMatches: function () {
      return 'No matches found';
    },
    formatInputTooShort: function (input, min) {
      var n = min - input.length;
      return 'Please enter ' + n + ' more character' + (n == 1 ? '' : 's');
    },
    formatInputTooLong: function (input, max) {
      var n = input.length - max;
      return 'Please delete ' + n + ' character' + (n == 1 ? '' : 's');
    },
    formatSelectionTooBig: function (limit) {
      return 'You can only select ' + limit + ' item' + (limit == 1 ? '' : 's');
    },
    formatLoadMore: function (pageNumber) {
      return 'Loading more results...';
    },
    formatSearching: function () {
      return 'Searching...';
    },
    minimumResultsForSearch: 0,
    minimumInputLength: 0,
    maximumInputLength: null,
    maximumSelectionSize: 0,
    id: function (e) {
      return e.id;
    },
    matcher: function (term, text) {
      return ('' + text).toUpperCase().indexOf(('' + term).toUpperCase()) >= 0;
    },
    separator: ',',
    tokenSeparators: [],
    tokenizer: defaultTokenizer,
    escapeMarkup: function (markup) {
      var replace_map = {
          '\\': '&#92;',
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '/': '&#47;'
        };
      return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
        return replace_map[match[0]];
      });
    },
    blurOnChange: false,
    selectOnBlur: false,
    adaptContainerCssClass: function (c) {
      return c;
    },
    adaptDropdownCssClass: function (c) {
      return null;
    }
  };
  window.Select2 = {
    query: {
      ajax: ajax,
      local: local,
      tags: tags
    },
    util: {
      debounce: debounce,
      markMatch: markMatch
    },
    'class': {
      'abstract': AbstractSelect2,
      'single': SingleSelect2,
      'multi': MultiSelect2
    }
  };
}(jQuery));
(function (angular, analytics) {
  'use strict';
  var angulartics = window.angulartics || (window.angulartics = {});
  angulartics.waitForVendorApi = function (objectName, delay, registerFn) {
    if (!window.hasOwnProperty(objectName)) {
      setTimeout(function () {
        angulartics.waitForVendorApi(objectName, delay, registerFn);
      }, delay);
    } else {
      registerFn(window[objectName]);
    }
  };
  angular.module('angulartics', []).provider('$analytics', function () {
    var settings = {
        pageTracking: {
          autoTrackFirstPage: true,
          autoTrackVirtualPages: true,
          bufferFlushDelay: 1000
        },
        eventTracking: { bufferFlushDelay: 1000 }
      };
    var cache = {
        pageviews: [],
        events: []
      };
    var bufferedPageTrack = function (path) {
      cache.pageviews.push(path);
    };
    var bufferedEventTrack = function (event, properties) {
      cache.events.push({
        name: event,
        properties: properties
      });
    };
    var api = {
        settings: settings,
        pageTrack: bufferedPageTrack,
        eventTrack: bufferedEventTrack
      };
    var registerPageTrack = function (fn) {
      api.pageTrack = fn;
      angular.forEach(cache.pageviews, function (path, index) {
        setTimeout(function () {
          api.pageTrack(path);
        }, index * settings.pageTracking.bufferFlushDelay);
      });
    };
    var registerEventTrack = function (fn) {
      api.eventTrack = fn;
      angular.forEach(cache.events, function (event, index) {
        setTimeout(function () {
          api.eventTrack(event.name, event.properties);
        }, index * settings.eventTracking.bufferFlushDelay);
      });
    };
    return {
      $get: function () {
        return api;
      },
      settings: settings,
      virtualPageviews: function (value) {
        this.settings.pageTracking.autoTrackVirtualPages = value;
      },
      firstPageview: function (value) {
        this.settings.pageTracking.autoTrackFirstPage = value;
      },
      registerPageTrack: registerPageTrack,
      registerEventTrack: registerEventTrack
    };
  }).run([
    '$rootScope',
    '$location',
    '$analytics',
    function ($rootScope, $location, $analytics) {
      if ($analytics.settings.pageTracking.autoTrackFirstPage) {
        $analytics.pageTrack($location.absUrl());
      }
      if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route || current).redirectTo)
            return;
          $analytics.pageTrack($location.url());
        });
      }
    }
  ]).directive('analyticsOn', [
    '$analytics',
    function ($analytics) {
      function isCommand(element) {
        return [
          'a:',
          'button:',
          'button:button',
          'button:submit',
          'input:button',
          'input:submit'
        ].indexOf(element.tagName.toLowerCase() + ':' + (element.type || '')) >= 0;
      }
      function inferEventType(element) {
        if (isCommand(element))
          return 'click';
        return 'click';
      }
      function inferEventName(element) {
        if (isCommand(element))
          return element.innerText || element.value;
        return element.id || element.name || element.tagName;
      }
      function isProperty(name) {
        return name.substr(0, 9) === 'analytics' && [
          'on',
          'event'
        ].indexOf(name.substr(10)) === -1;
      }
      return {
        restrict: 'A',
        scope: false,
        link: function ($scope, $element, $attrs) {
          var eventType = $attrs.analyticsOn || inferEventType($element[0]), eventName = $attrs.analyticsEvent || inferEventName($element[0]);
          var properties = {};
          angular.forEach($attrs.$attr, function (attr, name) {
            if (isProperty(attr)) {
              properties[name.slice(9).toLowerCase()] = $attrs[name];
            }
          });
          angular.element($element[0]).bind(eventType, function () {
            $analytics.eventTrack(eventName, properties);
          });
        }
      };
    }
  ]);
}(angular));
(function (angular) {
  'use strict';
  angular.module('angulartics.google.analytics', ['angulartics']).config([
    '$analyticsProvider',
    function ($analyticsProvider) {
      $analyticsProvider.registerPageTrack(function (path) {
        if (window._gaq)
          _gaq.push([
            '_trackPageview',
            path
          ]);
        if (window.ga)
          ga('send', 'pageview', path);
      });
      $analyticsProvider.registerEventTrack(function (action, properties) {
        if (window._gaq)
          _gaq.push([
            '_trackEvent',
            properties.category,
            action,
            properties.label,
            properties.value
          ]);
        if (window.ga)
          ga('send', 'event', properties.category, action, properties.label, properties.value);
      });
    }
  ]);
}(angular));
(function () {
  'use strict';
  var _camelizeCssPropName = function () {
      var matcherRegex = /\-([a-z])/g, replacerFn = function (match, group) {
          return group.toUpperCase();
        };
      return function (prop) {
        return prop.replace(matcherRegex, replacerFn);
      };
    }();
  var _getStyle = function (el, prop) {
    var value, camelProp, tagName, possiblePointers, i, len;
    if (window.getComputedStyle) {
      value = window.getComputedStyle(el, null).getPropertyValue(prop);
    } else {
      camelProp = _camelizeCssPropName(prop);
      if (el.currentStyle) {
        value = el.currentStyle[camelProp];
      } else {
        value = el.style[camelProp];
      }
    }
    if (prop === 'cursor') {
      if (!value || value === 'auto') {
        tagName = el.tagName.toLowerCase();
        possiblePointers = ['a'];
        for (i = 0, len = possiblePointers.length; i < len; i++) {
          if (tagName === possiblePointers[i]) {
            return 'pointer';
          }
        }
      }
    }
    return value;
  };
  var _elementMouseOver = function (event) {
    if (!ZeroClipboard.prototype._singleton)
      return;
    if (!event) {
      event = window.event;
    }
    var target;
    if (this !== window) {
      target = this;
    } else if (event.target) {
      target = event.target;
    } else if (event.srcElement) {
      target = event.srcElement;
    }
    ZeroClipboard.prototype._singleton.setCurrent(target);
  };
  var _addEventHandler = function (element, method, func) {
    if (element.addEventListener) {
      element.addEventListener(method, func, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + method, func);
    }
  };
  var _removeEventHandler = function (element, method, func) {
    if (element.removeEventListener) {
      element.removeEventListener(method, func, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + method, func);
    }
  };
  var _addClass = function (element, value) {
    if (element.addClass) {
      element.addClass(value);
      return element;
    }
    if (value && typeof value === 'string') {
      var classNames = (value || '').split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = ' ' + element.className + ' ', setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(' ' + classNames[c] + ' ') < 0) {
              setClass += ' ' + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, '');
        }
      }
    }
    return element;
  };
  var _removeClass = function (element, value) {
    if (element.removeClass) {
      element.removeClass(value);
      return element;
    }
    if (value && typeof value === 'string' || value === undefined) {
      var classNames = (value || '').split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        if (value) {
          var className = (' ' + element.className + ' ').replace(/[\n\t]/g, ' ');
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            className = className.replace(' ' + classNames[c] + ' ', ' ');
          }
          element.className = className.replace(/^\s+|\s+$/g, '');
        } else {
          element.className = '';
        }
      }
    }
    return element;
  };
  var _getZoomFactor = function () {
    var rect, physicalWidth, logicalWidth, zoomFactor = 1;
    if (typeof document.body.getBoundingClientRect === 'function') {
      rect = document.body.getBoundingClientRect();
      physicalWidth = rect.right - rect.left;
      logicalWidth = document.body.offsetWidth;
      zoomFactor = Math.round(physicalWidth / logicalWidth * 100) / 100;
    }
    return zoomFactor;
  };
  var _getDOMObjectPosition = function (obj) {
    var info = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        zIndex: 999999999
      };
    var zi = _getStyle(obj, 'z-index');
    if (zi && zi !== 'auto') {
      info.zIndex = parseInt(zi, 10);
    }
    if (obj.getBoundingClientRect) {
      var rect = obj.getBoundingClientRect();
      var pageXOffset, pageYOffset, zoomFactor;
      if ('pageXOffset' in window && 'pageYOffset' in window) {
        pageXOffset = window.pageXOffset;
        pageYOffset = window.pageYOffset;
      } else {
        zoomFactor = _getZoomFactor();
        pageXOffset = Math.round(document.documentElement.scrollLeft / zoomFactor);
        pageYOffset = Math.round(document.documentElement.scrollTop / zoomFactor);
      }
      var leftBorderWidth = document.documentElement.clientLeft || 0;
      var topBorderWidth = document.documentElement.clientTop || 0;
      info.left = rect.left + pageXOffset - leftBorderWidth;
      info.top = rect.top + pageYOffset - topBorderWidth;
      info.width = 'width' in rect ? rect.width : rect.right - rect.left;
      info.height = 'height' in rect ? rect.height : rect.bottom - rect.top;
    }
    return info;
  };
  var _noCache = function (path, options) {
    var useNoCache = !(options && options.useNoCache === false);
    if (useNoCache) {
      return (path.indexOf('?') === -1 ? '?' : '&') + 'nocache=' + new Date().getTime();
    } else {
      return '';
    }
  };
  var _vars = function (options) {
    var str = [];
    var origins = [];
    if (options.trustedOrigins) {
      if (typeof options.trustedOrigins === 'string') {
        origins.push(options.trustedOrigins);
      } else if (typeof options.trustedOrigins === 'object' && 'length' in options.trustedOrigins) {
        origins = origins.concat(options.trustedOrigins);
      }
    }
    if (options.trustedDomains) {
      if (typeof options.trustedDomains === 'string') {
        origins.push(options.trustedDomains);
      } else if (typeof options.trustedDomains === 'object' && 'length' in options.trustedDomains) {
        origins = origins.concat(options.trustedDomains);
      }
    }
    if (origins.length) {
      str.push('trustedOrigins=' + encodeURIComponent(origins.join(',')));
    }
    if (typeof options.amdModuleId === 'string' && options.amdModuleId) {
      str.push('amdModuleId=' + encodeURIComponent(options.amdModuleId));
    }
    if (typeof options.cjsModuleId === 'string' && options.cjsModuleId) {
      str.push('cjsModuleId=' + encodeURIComponent(options.cjsModuleId));
    }
    return str.join('&');
  };
  var _inArray = function (elem, array) {
    if (array.indexOf) {
      return array.indexOf(elem);
    }
    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i] === elem) {
        return i;
      }
    }
    return -1;
  };
  var _prepGlue = function (elements) {
    if (typeof elements === 'string')
      throw new TypeError('ZeroClipboard doesn\'t accept query strings.');
    if (!elements.length)
      return [elements];
    return elements;
  };
  var _dispatchCallback = function (func, element, instance, args, async) {
    if (async) {
      window.setTimeout(function () {
        func.call(element, instance, args);
      }, 0);
    } else {
      func.call(element, instance, args);
    }
  };
  var ZeroClipboard = function (elements, options) {
    if (elements)
      (ZeroClipboard.prototype._singleton || this).glue(elements);
    if (ZeroClipboard.prototype._singleton)
      return ZeroClipboard.prototype._singleton;
    ZeroClipboard.prototype._singleton = this;
    this.options = {};
    for (var kd in _defaults)
      this.options[kd] = _defaults[kd];
    for (var ko in options)
      this.options[ko] = options[ko];
    this.handlers = {};
    if (ZeroClipboard.detectFlashSupport())
      _bridge();
  };
  var currentElement, gluedElements = [];
  ZeroClipboard.prototype.setCurrent = function (element) {
    currentElement = element;
    this.reposition();
    var titleAttr = element.getAttribute('title');
    if (titleAttr) {
      this.setTitle(titleAttr);
    }
    var useHandCursor = this.options.forceHandCursor === true || _getStyle(element, 'cursor') === 'pointer';
    _setHandCursor.call(this, useHandCursor);
    return this;
  };
  ZeroClipboard.prototype.setText = function (newText) {
    if (newText && newText !== '') {
      this.options.text = newText;
      if (this.ready())
        this.flashBridge.setText(newText);
    }
    return this;
  };
  ZeroClipboard.prototype.setTitle = function (newTitle) {
    if (newTitle && newTitle !== '')
      this.htmlBridge.setAttribute('title', newTitle);
    return this;
  };
  ZeroClipboard.prototype.setSize = function (width, height) {
    if (this.ready())
      this.flashBridge.setSize(width, height);
    return this;
  };
  ZeroClipboard.prototype.setHandCursor = function (enabled) {
    enabled = typeof enabled === 'boolean' ? enabled : !!enabled;
    _setHandCursor.call(this, enabled);
    this.options.forceHandCursor = enabled;
    return this;
  };
  var _setHandCursor = function (enabled) {
    if (this.ready())
      this.flashBridge.setHandCursor(enabled);
  };
  ZeroClipboard.version = '1.2.2';
  var _defaults = {
      moviePath: 'ZeroClipboard.swf',
      trustedOrigins: null,
      text: null,
      hoverClass: 'zeroclipboard-is-hover',
      activeClass: 'zeroclipboard-is-active',
      allowScriptAccess: 'sameDomain',
      useNoCache: true,
      forceHandCursor: false
    };
  ZeroClipboard.setDefaults = function (options) {
    for (var ko in options)
      _defaults[ko] = options[ko];
  };
  ZeroClipboard.destroy = function () {
    ZeroClipboard.prototype._singleton.unglue(gluedElements);
    var bridge = ZeroClipboard.prototype._singleton.htmlBridge;
    bridge.parentNode.removeChild(bridge);
    delete ZeroClipboard.prototype._singleton;
  };
  ZeroClipboard.detectFlashSupport = function () {
    var hasFlash = false;
    if (typeof ActiveXObject === 'function') {
      try {
        if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
          hasFlash = true;
        }
      } catch (error) {
      }
    }
    if (!hasFlash && navigator.mimeTypes['application/x-shockwave-flash']) {
      hasFlash = true;
    }
    return hasFlash;
  };
  var _amdModuleId = null;
  var _cjsModuleId = null;
  var _bridge = function () {
    var client = ZeroClipboard.prototype._singleton;
    var container = document.getElementById('global-zeroclipboard-html-bridge');
    if (!container) {
      var opts = {};
      for (var ko in client.options)
        opts[ko] = client.options[ko];
      opts.amdModuleId = _amdModuleId;
      opts.cjsModuleId = _cjsModuleId;
      var flashvars = _vars(opts);
      var html = '      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="' + client.options.moviePath + _noCache(client.options.moviePath, client.options) + '"/>         <param name="allowScriptAccess" value="' + client.options.allowScriptAccess + '"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="' + flashvars + '"/>         <embed src="' + client.options.moviePath + _noCache(client.options.moviePath, client.options) + '"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="always"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="' + flashvars + '"           scale="exactfit">         </embed>       </object>';
      container = document.createElement('div');
      container.id = 'global-zeroclipboard-html-bridge';
      container.setAttribute('class', 'global-zeroclipboard-container');
      container.setAttribute('data-clipboard-ready', false);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '15px';
      container.style.height = '15px';
      container.style.zIndex = '9999';
      container.innerHTML = html;
      document.body.appendChild(container);
    }
    client.htmlBridge = container;
    client.flashBridge = document['global-zeroclipboard-flash-bridge'] || container.children[0].lastElementChild;
  };
  ZeroClipboard.prototype.resetBridge = function () {
    this.htmlBridge.style.left = '-9999px';
    this.htmlBridge.style.top = '-9999px';
    this.htmlBridge.removeAttribute('title');
    this.htmlBridge.removeAttribute('data-clipboard-text');
    _removeClass(currentElement, this.options.activeClass);
    currentElement = null;
    this.options.text = null;
    return this;
  };
  ZeroClipboard.prototype.ready = function () {
    var ready = this.htmlBridge.getAttribute('data-clipboard-ready');
    return ready === 'true' || ready === true;
  };
  ZeroClipboard.prototype.reposition = function () {
    if (!currentElement)
      return false;
    var pos = _getDOMObjectPosition(currentElement);
    this.htmlBridge.style.top = pos.top + 'px';
    this.htmlBridge.style.left = pos.left + 'px';
    this.htmlBridge.style.width = pos.width + 'px';
    this.htmlBridge.style.height = pos.height + 'px';
    this.htmlBridge.style.zIndex = pos.zIndex + 1;
    this.setSize(pos.width, pos.height);
    return this;
  };
  ZeroClipboard.dispatch = function (eventName, args) {
    ZeroClipboard.prototype._singleton.receiveEvent(eventName, args);
  };
  ZeroClipboard.prototype.on = function (eventName, func) {
    var events = eventName.toString().split(/\s/g);
    for (var i = 0; i < events.length; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, '');
      if (!this.handlers[eventName])
        this.handlers[eventName] = func;
    }
    if (this.handlers.noflash && !ZeroClipboard.detectFlashSupport()) {
      this.receiveEvent('onNoFlash', null);
    }
    return this;
  };
  ZeroClipboard.prototype.addEventListener = ZeroClipboard.prototype.on;
  ZeroClipboard.prototype.off = function (eventName, func) {
    var events = eventName.toString().split(/\s/g);
    for (var i = 0; i < events.length; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, '');
      for (var event in this.handlers) {
        if (event === eventName && this.handlers[event] === func) {
          delete this.handlers[event];
        }
      }
    }
    return this;
  };
  ZeroClipboard.prototype.removeEventListener = ZeroClipboard.prototype.off;
  ZeroClipboard.prototype.receiveEvent = function (eventName, args) {
    eventName = eventName.toString().toLowerCase().replace(/^on/, '');
    var element = currentElement;
    var performCallbackAsync = true;
    switch (eventName) {
    case 'load':
      if (args && parseFloat(args.flashVersion.replace(',', '.').replace(/[^0-9\.]/gi, '')) < 10) {
        this.receiveEvent('onWrongFlash', { flashVersion: args.flashVersion });
        return;
      }
      this.htmlBridge.setAttribute('data-clipboard-ready', true);
      break;
    case 'mouseover':
      _addClass(element, this.options.hoverClass);
      break;
    case 'mouseout':
      _removeClass(element, this.options.hoverClass);
      this.resetBridge();
      break;
    case 'mousedown':
      _addClass(element, this.options.activeClass);
      break;
    case 'mouseup':
      _removeClass(element, this.options.activeClass);
      break;
    case 'datarequested':
      var targetId = element.getAttribute('data-clipboard-target'), targetEl = !targetId ? null : document.getElementById(targetId);
      if (targetEl) {
        var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
        if (textContent)
          this.setText(textContent);
      } else {
        var defaultText = element.getAttribute('data-clipboard-text');
        if (defaultText)
          this.setText(defaultText);
      }
      performCallbackAsync = false;
      break;
    case 'complete':
      this.options.text = null;
      break;
    }
    if (this.handlers[eventName]) {
      var func = this.handlers[eventName];
      if (typeof func === 'string' && typeof window[func] === 'function') {
        func = window[func];
      }
      if (typeof func === 'function') {
        _dispatchCallback(func, element, this, args, performCallbackAsync);
      }
    }
  };
  ZeroClipboard.prototype.glue = function (elements) {
    elements = _prepGlue(elements);
    for (var i = 0; i < elements.length; i++) {
      if (_inArray(elements[i], gluedElements) == -1) {
        gluedElements.push(elements[i]);
        _addEventHandler(elements[i], 'mouseover', _elementMouseOver);
      }
    }
    return this;
  };
  ZeroClipboard.prototype.unglue = function (elements) {
    elements = _prepGlue(elements);
    for (var i = 0; i < elements.length; i++) {
      _removeEventHandler(elements[i], 'mouseover', _elementMouseOver);
      var arrayIndex = _inArray(elements[i], gluedElements);
      if (arrayIndex != -1)
        gluedElements.splice(arrayIndex, 1);
    }
    return this;
  };
  if (typeof define === 'function' && define.amd) {
    define([
      'require',
      'exports',
      'module'
    ], function (require, exports, module) {
      _amdModuleId = module && module.id || null;
      return ZeroClipboard;
    });
  } else if (typeof module === 'object' && module && typeof module.exports === 'object' && module.exports) {
    _cjsModuleId = module.id || null;
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
}());
(function () {
  'use strict';
  angular.module('chieffancypants.loadingBar', []).config([
    '$httpProvider',
    function ($httpProvider) {
      var interceptor = [
          '$q',
          '$cacheFactory',
          'cfpLoadingBar',
          function ($q, $cacheFactory, cfpLoadingBar) {
            var reqsTotal = 0;
            var reqsCompleted = 0;
            function setComplete() {
              cfpLoadingBar.complete();
              reqsCompleted = 0;
              reqsTotal = 0;
            }
            function isCached(config) {
              var cache;
              var defaults = $httpProvider.defaults;
              if (config.method !== 'GET' || config.cache === false) {
                config.cached = false;
                return false;
              }
              if (config.cache === true && defaults.cache === undefined) {
                cache = $cacheFactory.get('$http');
              } else if (defaults.cache !== undefined) {
                cache = defaults.cache;
              } else {
                cache = config.cache;
              }
              var cached = cache !== undefined ? cache.get(config.url) !== undefined : false;
              if (config.cached !== undefined && cached !== config.cached) {
                return config.cached;
              }
              config.cached = cached;
              return cached;
            }
            return {
              'request': function (config) {
                if (!isCached(config)) {
                  if (reqsTotal === 0) {
                    cfpLoadingBar.start();
                  }
                  reqsTotal++;
                }
                return config;
              },
              'response': function (response) {
                if (!isCached(response.config)) {
                  reqsCompleted++;
                  if (reqsCompleted >= reqsTotal) {
                    setComplete();
                  } else {
                    cfpLoadingBar.set(reqsCompleted / reqsTotal);
                  }
                }
                return response;
              },
              'responseError': function (rejection) {
                if (!isCached(rejection.config)) {
                  reqsCompleted++;
                  if (reqsCompleted >= reqsTotal) {
                    setComplete();
                  } else {
                    cfpLoadingBar.set(reqsCompleted / reqsTotal);
                  }
                }
                return $q.reject(rejection);
              }
            };
          }
        ];
      $httpProvider.interceptors.push(interceptor);
    }
  ]).provider('cfpLoadingBar', function () {
    this.includeSpinner = true;
    this.parentSelector = 'body';
    this.$get = [
      '$document',
      '$timeout',
      '$animate',
      function ($document, $timeout, $animate) {
        var $parentSelector = this.parentSelector, $parent = $document.find($parentSelector), loadingBarContainer = angular.element('<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>'), loadingBar = loadingBarContainer.find('div').eq(0), spinner = angular.element('<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>');
        var incTimeout, completeTimeout, started = false, status = 0;
        var includeSpinner = this.includeSpinner;
        function _start() {
          started = true;
          $timeout.cancel(completeTimeout);
          $animate.enter(loadingBarContainer, $parent);
          if (includeSpinner) {
            $animate.enter(spinner, $parent);
          }
          _set(0.02);
        }
        function _set(n) {
          if (!started) {
            return;
          }
          var pct = n * 100 + '%';
          loadingBar.css('width', pct);
          status = n;
          $timeout.cancel(incTimeout);
          incTimeout = $timeout(function () {
            _inc();
          }, 250);
        }
        function _inc() {
          if (_status() >= 1) {
            return;
          }
          var rnd = 0;
          var stat = _status();
          if (stat >= 0 && stat < 0.25) {
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
          } else if (stat >= 0.25 && stat < 0.65) {
            rnd = Math.random() * 3 / 100;
          } else if (stat >= 0.65 && stat < 0.9) {
            rnd = Math.random() * 2 / 100;
          } else if (stat >= 0.9 && stat < 0.99) {
            rnd = 0.005;
          } else {
            rnd = 0;
          }
          var pct = _status() + rnd;
          _set(pct);
        }
        function _status() {
          return status;
        }
        function _complete() {
          _set(1);
          completeTimeout = $timeout(function () {
            $animate.leave(loadingBarContainer, function () {
              status = 0;
              started = false;
            });
            $animate.leave(spinner);
          }, 500);
        }
        return {
          start: _start,
          set: _set,
          status: _status,
          inc: _inc,
          complete: _complete,
          includeSpinner: this.includeSpinner,
          parentSelector: this.parentSelector
        };
      }
    ];
  });
}());
angular.module('security.authorization', ['security.service']).provider('securityAuthorization', {
  requireAdminUser: [
    'securityAuthorization',
    function (securityAuthorization) {
      return securityAuthorization.requireAdminUser();
    }
  ],
  requireAuthenticatedUser: [
    'securityAuthorization',
    function (securityAuthorization) {
      return securityAuthorization.requireAuthenticatedUser();
    }
  ],
  requireDeveloperRole: [
    'securityAuthorization',
    function (securityAuthorization) {
      return securityAuthorization.requireDeveloperRole();
    }
  ],
  requireGamerRole: [
    'securityAuthorization',
    function (securityAuthorization) {
      return securityAuthorization.requireGamerRole();
    }
  ],
  $get: [
    'security',
    'securityRetryQueue',
    function (security, queue) {
      var service = {
          requireAuthenticatedUser: function () {
            var promise = security.requestCurrentUser().then(function (userInfo) {
                if (!security.isAuthenticated()) {
                  return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
                }
              });
            return promise;
          },
          requireAdminUser: function () {
            var promise = security.requestCurrentUser().then(function (userInfo) {
                if (!security.isAdmin()) {
                  return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
                }
              });
            return promise;
          },
          requireDeveloperRole: function () {
            var promise = security.requestCurrentUser().then(function (user) {
                if (!user || user.role != 'game_developer') {
                  return queue.pushRetryFn('unauthorized-client', service.requireDeveloperRole);
                }
              });
            return promise;
          },
          requireGamerRole: function () {
            var promise = security.requestCurrentUser().then(function (user) {
                if (!user || user.role != 'gamer') {
                  return queue.pushRetryFn('unauthorized-client', service.requireGamerRole);
                }
              });
            return promise;
          }
        };
      return service;
    }
  ]
});
angular.module('security.interceptor', ['security.retryQueue']).factory('securityInterceptor', [
  '$injector',
  'securityRetryQueue',
  function ($injector, queue) {
    return function (promise) {
      return promise.then(null, function (originalResponse) {
        console.log(originalResponse);
        if (originalResponse.status === 403 && originalResponse.config.url.indexOf('/auth/login') == -1) {
          promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
            return $injector.get('$http')(originalResponse.config);
          });
        }
        return promise;
      });
    };
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.responseInterceptors.push('securityInterceptor');
  }
]);
angular.module('security.retryQueue', []).factory('securityRetryQueue', [
  '$q',
  '$log',
  function ($q, $log) {
    var retryQueue = [];
    var service = {
        onItemAddedCallbacks: [],
        hasMore: function () {
          return retryQueue.length > 0;
        },
        push: function (retryItem) {
          retryQueue.push(retryItem);
          angular.forEach(service.onItemAddedCallbacks, function (cb) {
            try {
              cb(retryItem);
            } catch (e) {
              $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
            }
          });
        },
        pushRetryFn: function (reason, retryFn) {
          if (arguments.length === 1) {
            retryFn = reason;
            reason = undefined;
          }
          var deferred = $q.defer();
          var retryItem = {
              reason: reason,
              retry: function () {
                $q.when(retryFn()).then(function (value) {
                  deferred.resolve(value);
                }, function (value) {
                  deferred.reject(value);
                });
              },
              cancel: function () {
                deferred.reject();
              }
            };
          service.push(retryItem);
          return deferred.promise;
        },
        retryReason: function () {
          return service.hasMore() && retryQueue[0].reason;
        },
        cancelAll: function () {
          while (service.hasMore()) {
            retryQueue.shift().cancel();
          }
        },
        retryAll: function () {
          while (service.hasMore()) {
            retryQueue.shift().retry();
          }
        }
      };
    return service;
  }
]);
angular.module('security.service', [
  'security.retryQueue',
  'security.login',
  'ui.bootstrap.dialog',
  'services.i18nNotifications',
  'config',
  'templates.common'
]).factory('security', [
  '$http',
  '$q',
  '$location',
  'securityRetryQueue',
  '$dialog',
  'config',
  '$injector',
  '$cookieStore',
  function ($http, $q, $location, queue, $dialog, config, $injector, $cookieStore) {
    var i18nNotifications = $injector.get('i18nNotifications');
    function redirect(url) {
      url = url || '/';
      $location.path(url);
    }
    var loginDialog = null;
    function openLoginDialog() {
      if (loginDialog) {
        throw new Error('Trying to open a dialog that is already open!');
      }
      loginDialog = $dialog.dialog();
      loginDialog.open('common/security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
    }
    function closeLoginDialog(success) {
      if (loginDialog) {
        loginDialog.close(success);
      }
    }
    function onLoginDialogClose(success) {
      loginDialog = null;
      if (success) {
        queue.retryAll();
      } else {
      }
    }
    queue.onItemAddedCallbacks.push(function (retryItem) {
      if (queue.hasMore()) {
        service.showLogin();
      }
    });
    var service = {
        getLoginReason: function () {
          return queue.retryReason();
        },
        showLogin: function () {
          openLoginDialog();
        },
        closeLoginDialog: function (cb) {
          closeLoginDialog(false);
        },
        login: function (email, password) {
          return $http.post(config.api.host + '/auth/login', {
            email: email,
            password: password
          });
        },
        cancelLogin: function () {
          closeLoginDialog(false);
          redirect();
        },
        logout: function (redirectTo) {
          service.currentUser = null;
          delete sessionStorage.authToken;
          delete sessionStorage.user;
          delete $http.defaults.headers.common['X-Auth-Token'];
          $cookieStore.remove('authToken');
          $cookieStore.remove('user');
          i18nNotifications.pushForNextRoute('logout.success', 'success', {}, {});
          redirect(redirectTo);
        },
        requestCurrentUser: function () {
          if (service.isAuthenticated()) {
            return $q.when(service.currentUser);
          } else {
            var cookieAuthTokenString = $cookieStore.get('authToken');
            if (cookieAuthTokenString) {
              $http.defaults.headers.common['X-Auth-Token'] = cookieAuthTokenString;
            }
            return this.refreshCurrentUser();
          }
        },
        refreshCurrentUser: function () {
          return $http.get(config.api.host + '/auth/current-user').then(function (response) {
            service.currentUser = response.data;
            return service.currentUser;
          }, function (err) {
            console.log(err);
          });
        },
        currentUser: null,
        isAuthenticated: function () {
          return !!service.currentUser;
        },
        isAdmin: function () {
          return !!(service.currentUser && service.currentUser.admin);
        },
        verifyEmailAddress: function (token) {
          var deferred = $q.defer();
          $http.post(config.api.host + '/auth/verify/email/' + token).success(function (data) {
            deferred.resolve(data);
          }).error(function (err) {
            deferred.reject(err);
          });
          return deferred.promise;
        },
        requestPasswordReset: function (email) {
          return $http.post(config.api.host + '/auth/request_password_reset', { email: email });
        },
        resetPasswordWithToken: function (newPassword, token) {
          return $http.post(config.api.host + '/auth/reset_password', {
            password: newPassword,
            token: token
          });
        }
      };
    return service;
  }
]);
angular.module('security', [
  'security.service',
  'security.interceptor',
  'security.login',
  'security.authorization'
]);
angular.module('security.login', [
  'security.login.form',
  'security.login.navigation'
]);
angular.module('security.login.navigation', ['templates.common']).directive('userNavigation', [
  'security',
  '$location',
  function (security, $location) {
    var directive = {
        templateUrl: 'common/security/login/navigation.tpl.html',
        restrict: 'A',
        replace: true,
        scope: true,
        link: function ($scope, $element, $attrs, $controller) {
          $scope.isAuthenticated = security.isAuthenticated;
          $scope.login = security.showLogin;
          $scope.logout = security.logout;
          $scope.account = function () {
            $location.path('/account');
          };
          $scope.$watch(function () {
            return security.currentUser;
          }, function (currentUser) {
            $scope.currentUser = currentUser;
          });
          $scope.register = function () {
            $location.path('/account/register/gamer');
          };
        }
      };
    return directive;
  }
]);
angular.module('security.login.form', [
  'services.localizedMessages',
  'services.i18nNotifications'
]).controller('LoginFormController', [
  '$scope',
  'security',
  'localizedMessages',
  '$window',
  '$http',
  '$cookieStore',
  function ($scope, security, localizedMessages, $window, $http, $cookieStore) {
    $scope.user = {};
    $scope.authError = null;
    $scope.authReason = null;
    if (security.getLoginReason()) {
      $scope.authReason = security.isAuthenticated() ? localizedMessages.get('login.reason.notAuthorized') : localizedMessages.get('login.reason.notAuthenticated');
    }
    $scope.login = function () {
      $scope.authError = null;
      console.log($scope.user.rememberLogin);
      security.login($scope.user.email, $scope.user.password).success(function (response) {
        var authTokenString = response.user.email + ':' + response['auth-token'];
        $http.defaults.headers.common['X-Auth-Token'] = authTokenString;
        console.log(response);
        console.log('callback');
        security.requestCurrentUser().then(function (user) {
          var stringifiedUser = JSON.stringify(user);
          if ($scope.user.rememberLogin) {
            $cookieStore.put('authToken', authTokenString);
            $cookieStore.put('user', stringifiedUser);
          }
          sessionStorage.setItem('authToken', authTokenString);
          sessionStorage.setItem('user', stringifiedUser);
          $http.defaults.headers.common['X-Auth-Token'] = authTokenString;
          if (security.isAuthenticated()) {
            $window.location.href = '/#/account';
            security.closeLoginDialog();
          } else {
            console.log('not authenticated');
          }
        });
      }).error(function (error) {
        if (error && error.message === 'EmailVerificationIncomplete') {
          $scope.authError = localizedMessages.get('login.error.emailVerificationIncomplete');
        } else {
          $scope.authError = localizedMessages.get('login.error.invalidCredentials');
        }
      });
    };
    $scope.resetPassword = function () {
      console.log('reset the password');
      $window.location.href = '/#/account/password/reset';
    };
    $scope.clearForm = function () {
      user = {};
    };
    $scope.cancelLogin = function () {
      security.cancelLogin();
    };
  }
]);
angular.module('services.breadcrumbs', []);
angular.module('services.breadcrumbs').factory('breadcrumbs', [
  '$rootScope',
  '$location',
  function ($rootScope, $location) {
    var breadcrumbs = [];
    var breadcrumbsService = {};
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
      var pathElements = $location.path().split('/'), result = [], i;
      var breadcrumbPath = function (index) {
        return '/' + pathElements.slice(0, index + 1).join('/');
      };
      pathElements.shift();
      for (i = 0; i < pathElements.length; i++) {
        result.push({
          name: pathElements[i],
          path: breadcrumbPath(i)
        });
      }
      breadcrumbs = result;
    });
    breadcrumbsService.getAll = function () {
      return breadcrumbs;
    };
    breadcrumbsService.getFirst = function () {
      return breadcrumbs[0] || {};
    };
    return breadcrumbsService;
  }
]);
angular.module('services.crud', ['services.crudRouteProvider']);
angular.module('services.crud').factory('crudEditMethods', function () {
  return function (itemName, item, formName, successcb, errorcb) {
    var mixin = {};
    mixin[itemName] = item;
    mixin[itemName + 'Copy'] = angular.copy(item);
    mixin.save = function () {
      this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
    };
    mixin.canSave = function () {
      return this[formName].$valid && !angular.equals(this[itemName], this[itemName + 'Copy']);
    };
    mixin.revertChanges = function () {
      this[itemName] = angular.copy(this[itemName + 'Copy']);
    };
    mixin.canRevert = function () {
      return !angular.equals(this[itemName], this[itemName + 'Copy']);
    };
    mixin.remove = function () {
      if (this[itemName].$id()) {
        this[itemName].$remove(successcb, errorcb);
      } else {
        successcb();
      }
    };
    mixin.canRemove = function () {
      return item.$id();
    };
    mixin.getCssClasses = function (fieldName) {
      var ngModelContoller = this[formName][fieldName];
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };
    mixin.showError = function (fieldName, error) {
      return this[formName][fieldName].$error[error];
    };
    return mixin;
  };
});
angular.module('services.crud').factory('crudListMethods', [
  '$location',
  function ($location) {
    return function (pathPrefix) {
      var mixin = {};
      mixin['new'] = function () {
        $location.path(pathPrefix + '/new');
      };
      mixin['edit'] = function (itemId) {
        $location.path(pathPrefix + '/' + itemId);
      };
      return mixin;
    };
  }
]);
(function () {
  function crudRouteProvider($routeProvider) {
    this.$get = angular.noop;
    this.routesFor = function (resourceName, urlPrefix, routePrefix) {
      var baseUrl = resourceName.toLowerCase();
      var baseRoute = '/' + resourceName.toLowerCase();
      routePrefix = routePrefix || urlPrefix;
      if (angular.isString(urlPrefix) && urlPrefix !== '') {
        baseUrl = urlPrefix + '/' + baseUrl;
      }
      if (routePrefix !== null && routePrefix !== undefined && routePrefix !== '') {
        baseRoute = '/' + routePrefix + baseRoute;
      }
      var templateUrl = function (operation) {
        return baseUrl + '/' + resourceName.toLowerCase() + '-' + operation.toLowerCase() + '.tpl.html';
      };
      var controllerName = function (operation) {
        return resourceName + operation + 'Ctrl';
      };
      var routeBuilder = {
          whenList: function (resolveFns) {
            routeBuilder.when(baseRoute, {
              templateUrl: templateUrl('List'),
              controller: controllerName('List'),
              resolve: resolveFns
            });
            return routeBuilder;
          },
          whenNew: function (resolveFns) {
            routeBuilder.when(baseRoute + '/new', {
              templateUrl: templateUrl('Edit'),
              controller: controllerName('Edit'),
              resolve: resolveFns
            });
            return routeBuilder;
          },
          whenEdit: function (resolveFns) {
            routeBuilder.when(baseRoute + '/:itemId', {
              templateUrl: templateUrl('Edit'),
              controller: controllerName('Edit'),
              resolve: resolveFns
            });
            return routeBuilder;
          },
          when: function (path, route) {
            $routeProvider.when(path, route);
            return routeBuilder;
          },
          otherwise: function (params) {
            $routeProvider.otherwise(params);
            return routeBuilder;
          },
          $routeProvider: $routeProvider
        };
      return routeBuilder;
    };
  }
  crudRouteProvider.$inject = ['$routeProvider'];
  angular.module('services.crudRouteProvider', []).provider('crudRoute', crudRouteProvider);
}());
angular.module('services.exceptionHandler', ['services.i18nNotifications']);
angular.module('services.exceptionHandler').factory('exceptionHandlerFactory', [
  '$injector',
  function ($injector) {
    return function ($delegate) {
      return function (exception, cause) {
        var i18nNotifications = $injector.get('i18nNotifications');
        $delegate(exception, cause);
        i18nNotifications.pushForCurrentRoute('error.fatal', 'error', {}, {
          exception: exception,
          cause: cause
        });
      };
    };
  }
]);
angular.module('services.exceptionHandler').config([
  '$provide',
  function ($provide) {
    $provide.decorator('$exceptionHandler', [
      '$delegate',
      'exceptionHandlerFactory',
      function ($delegate, exceptionHandlerFactory) {
        return exceptionHandlerFactory($delegate);
      }
    ]);
  }
]);
angular.module('services.httpRequestTracker', []);
angular.module('services.httpRequestTracker').factory('httpRequestTracker', [
  '$http',
  function ($http) {
    var httpRequestTracker = {};
    httpRequestTracker.hasPendingRequests = function () {
      return $http.pendingRequests.length > 0;
    };
    return httpRequestTracker;
  }
]);
angular.module('services.i18nNotifications', [
  'services.notifications',
  'services.localizedMessages'
]);
angular.module('services.i18nNotifications').factory('i18nNotifications', [
  'localizedMessages',
  'notifications',
  function (localizedMessages, notifications) {
    var prepareNotification = function (msgKey, type, interpolateParams, otherProperties) {
      return angular.extend({
        message: localizedMessages.get(msgKey, interpolateParams),
        type: type
      }, otherProperties);
    };
    var I18nNotifications = {
        pushSticky: function (msgKey, type, interpolateParams, otherProperties) {
          return notifications.pushSticky(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },
        pushForCurrentRoute: function (msgKey, type, interpolateParams, otherProperties) {
          return notifications.pushForCurrentRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },
        pushForNextRoute: function (msgKey, type, interpolateParams, otherProperties) {
          return notifications.pushForNextRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
        },
        getCurrent: function () {
          return notifications.getCurrent();
        },
        remove: function (notification) {
          return notifications.remove(notification);
        }
      };
    return I18nNotifications;
  }
]);
angular.module('services.localizedMessages', []).factory('localizedMessages', [
  '$interpolate',
  'I18N.MESSAGES',
  function ($interpolate, i18nmessages) {
    var handleNotFound = function (msg, msgKey) {
      return msg || '?' + msgKey + '?';
    };
    return {
      get: function (msgKey, interpolateParams) {
        var msg = i18nmessages[msgKey];
        if (msg) {
          return $interpolate(msg)(interpolateParams);
        } else {
          return handleNotFound(msg, msgKey);
        }
      }
    };
  }
]);
angular.module('services.notifications', []).factory('notifications', [
  '$rootScope',
  function ($rootScope) {
    var notifications = {
        'STICKY': [],
        'ROUTE_CURRENT': [],
        'ROUTE_NEXT': []
      };
    var notificationsService = {};
    var addNotification = function (notificationsArray, notificationObj) {
      if (!angular.isObject(notificationObj)) {
        throw new Error('Only object can be added to the notification service');
      }
      notificationsArray.push(notificationObj);
      return notificationObj;
    };
    $rootScope.$on('$routeChangeSuccess', function () {
      notifications.ROUTE_CURRENT.length = 0;
      notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
      notifications.ROUTE_NEXT.length = 0;
    });
    notificationsService.getCurrent = function () {
      return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
    };
    notificationsService.pushSticky = function (notification) {
      return addNotification(notifications.STICKY, notification);
    };
    notificationsService.pushForCurrentRoute = function (notification) {
      return addNotification(notifications.ROUTE_CURRENT, notification);
    };
    notificationsService.pushForNextRoute = function (notification) {
      return addNotification(notifications.ROUTE_NEXT, notification);
    };
    notificationsService.remove = function (notification) {
      angular.forEach(notifications, function (notificationsByType) {
        var idx = notificationsByType.indexOf(notification);
        if (idx > -1) {
          notificationsByType.splice(idx, 1);
        }
      });
    };
    notificationsService.removeAll = function () {
      angular.forEach(notifications, function (notificationsByType) {
        notificationsByType.length = 0;
      });
    };
    return notificationsService;
  }
]);
angular.module('services.users', []).factory('usersService', [
  '$rootScope',
  '$upload',
  'config',
  '$q',
  function ($rootScope, $upload, config, $q) {
    var service = {};
    service.uploadProfilePicture = function (user, $files) {
      var defer = $q.defer();
      $upload.upload({
        url: config.api.host + '/users/' + user.id + '/profile_picture',
        fileFormDataName: 'profilePicture',
        file: $files
      }).success(function () {
        defer.resolve();
      }).error(function (err) {
        defer.reject(err);
      });
      return defer.promise;
    };
    return service;
  }
]);
angular.module('services.invites', []).factory('invitesService', [
  '$rootScope',
  'config',
  '$http',
  function ($rootScope, config, $http) {
    var service = {
        generateInviteCode: function () {
          return $http.post(config.api.host + '/invites/create');
        },
        sendEmailInvites: function (emailAddresses) {
          return $http.post(config.api.host + '/invites/send', { emailAddresses: emailAddresses });
        }
      };
    return service;
  }
]);
angular.module('directives.crud', [
  'directives.crud.buttons',
  'directives.crud.edit'
]);
angular.module('directives.crud.buttons', []).directive('crudButtons', function () {
  return {
    restrict: 'E',
    replace: true,
    template: '<div>' + '  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">Save</button>' + '  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">Revert changes</button>' + '  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">Remove</button>' + '</div>'
  };
});
angular.module('directives.crud.edit', []).directive('crudEdit', [
  '$parse',
  function ($parse) {
    return {
      scope: true,
      require: '^form',
      link: function (scope, element, attrs, form) {
        var resourceGetter = $parse(attrs.crudEdit);
        var resourceSetter = resourceGetter.assign;
        var resource = resourceGetter(scope);
        var original = angular.copy(resource);
        var checkResourceMethod = function (methodName) {
          if (!angular.isFunction(resource[methodName])) {
            throw new Error('crudEdit directive: The resource must expose the ' + methodName + '() instance method');
          }
        };
        checkResourceMethod('$saveOrUpdate');
        checkResourceMethod('$id');
        checkResourceMethod('$remove');
        var makeFn = function (attrName) {
          var fn = scope.$eval(attrs[attrName]);
          if (!angular.isFunction(fn)) {
            throw new Error('crudEdit directive: The attribute "' + attrName + '" must evaluate to a function');
          }
          return fn;
        };
        var userOnSave = attrs.onSave ? makeFn('onSave') : scope.onSave || angular.noop;
        var onSave = function (result, status, headers, config) {
          original = result;
          userOnSave(result, status, headers, config);
        };
        var onRemove = attrs.onRemove ? makeFn('onRemove') : scope.onRemove || onSave;
        var onError = attrs.onError ? makeFn('onError') : scope.onError || angular.noop;
        scope.save = function () {
          resource.$saveOrUpdate(onSave, onSave, onError, onError);
        };
        scope.revertChanges = function () {
          resource = angular.copy(original);
          resourceSetter(scope, resource);
          form.$setPristine();
        };
        scope.remove = function () {
          if (resource.$id()) {
            resource.$remove(onRemove, onError);
          } else {
            onRemove();
          }
        };
        scope.canSave = function () {
          return form.$valid && !angular.equals(resource, original);
        };
        scope.canRevert = function () {
          return !angular.equals(resource, original);
        };
        scope.canRemove = function () {
          return resource.$id();
        };
        scope.getCssClasses = function (fieldName) {
          var ngModelContoller = form[fieldName];
          return {
            error: ngModelContoller.$invalid && !angular.equals(resource, original),
            success: ngModelContoller.$valid && !angular.equals(resource, original)
          };
        };
        scope.showError = function (fieldName, error) {
          return form[fieldName].$error[error];
        };
      }
    };
  }
]);
angular.module('directives.gravatar', []).directive('gravatar', [
  'md5',
  function (md5) {
    return {
      restrict: 'E',
      template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
      replace: true,
      scope: {
        email: '=',
        size: '=',
        defaultImage: '=',
        forceDefault: '='
      },
      link: function (scope, element, attrs) {
        scope.options = {};
        scope.$watch('email', function (email) {
          if (email) {
            scope.hash = md5(email.trim().toLowerCase());
          }
        });
        scope.$watch('size', function (size) {
          scope.options.s = angular.isNumber(size) ? size : undefined;
          generateParams();
        });
        scope.$watch('forceDefault', function (forceDefault) {
          scope.options.f = forceDefault ? 'y' : undefined;
          generateParams();
        });
        scope.$watch('defaultImage', function (defaultImage) {
          scope.options.d = defaultImage ? defaultImage : undefined;
          generateParams();
        });
        function generateParams() {
          var options = [];
          scope.getParams = '';
          angular.forEach(scope.options, function (value, key) {
            if (value) {
              options.push(key + '=' + encodeURIComponent(value));
            }
          });
          if (options.length > 0) {
            scope.getParams = '?' + options.join('&');
          }
        }
      }
    };
  }
]).factory('md5', function () {
  function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32(a << s | a >>> 32 - s, b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function md51(s) {
    txt = '';
    var n = s.length, state = [
        1732584193,
        -271733879,
        -1732584194,
        271733878
      ], i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
    }
    tail[i >> 2] |= 128 << (i % 4 << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) {
        tail[i] = 0;
      }
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  function md5blk(s) {
    var md5blks = [], i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  var hex_chr = '0123456789abcdef'.split('');
  function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++) {
      s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
    }
    return s;
  }
  function hex(x) {
    for (var i = 0; i < x.length; i++) {
      x[i] = rhex(x[i]);
    }
    return x.join('');
  }
  function md5(s) {
    return hex(md51(s));
  }
  add32 = function (a, b) {
    return a + b & 4294967295;
  };
  if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
    add32 = function (x, y) {
      var lsw = (x & 65535) + (y & 65535), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return msw << 16 | lsw & 65535;
    };
  }
  return md5;
});
angular.module('directives.modal', []).directive('modal', [
  '$parse',
  function ($parse) {
    var backdropEl;
    var body = angular.element(document.getElementsByTagName('body')[0]);
    var defaultOpts = {
        backdrop: true,
        escape: true
      };
    return {
      restrict: 'ECA',
      link: function (scope, elm, attrs) {
        var opts = angular.extend(defaultOpts, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
        var shownExpr = attrs.modal || attrs.show;
        var setClosed;
        if (attrs.close) {
          setClosed = function () {
            scope.$apply(attrs.close);
          };
        } else {
          setClosed = function () {
            scope.$apply(function () {
              $parse(shownExpr).assign(scope, false);
            });
          };
        }
        elm.addClass('modal');
        if (opts.backdrop && !backdropEl) {
          backdropEl = angular.element('<div class="modal-backdrop"></div>');
          backdropEl.css('display', 'none');
          body.append(backdropEl);
        }
        function setShown(shown) {
          scope.$apply(function () {
            model.assign(scope, shown);
          });
        }
        function escapeClose(evt) {
          if (evt.which === 27) {
            setClosed();
          }
        }
        function clickClose() {
          setClosed();
        }
        function close() {
          if (opts.escape) {
            body.unbind('keyup', escapeClose);
          }
          if (opts.backdrop) {
            backdropEl.css('display', 'none').removeClass('in');
            backdropEl.unbind('click', clickClose);
          }
          elm.css('display', 'none').removeClass('in');
          body.removeClass('modal-open');
        }
        function open() {
          if (opts.escape) {
            body.bind('keyup', escapeClose);
          }
          if (opts.backdrop) {
            backdropEl.css('display', 'block').addClass('in');
            backdropEl.bind('click', clickClose);
          }
          elm.css('display', 'block').addClass('in');
          body.addClass('modal-open');
        }
        scope.$watch(shownExpr, function (isShown, oldShown) {
          if (isShown) {
            open();
          } else {
            close();
          }
        });
      }
    };
  }
]);
angular.module('directives.remoteForm', ['config']).directive('remoteForm', [
  '$resource',
  'config',
  'Platform',
  'Genre',
  '$http',
  '$location',
  function ($resource, config, Platform, Genre, $http, $location) {
    function IllegalArgumentException(message) {
      this.message = message;
    }
    var forEach = angular.forEach, noop = angular.noop;
    return {
      restrict: 'A',
      scope: true,
      controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attrs) {
          var self = this;
          self.formComponents = {};
          self.registerFormComponent = function (name, ngModel) {
            self.formComponents[name] = ngModel;
          };
          self.hasFormComponent = function (name) {
            return self.formComponents[name] !== undefined;
          };
          self.getFormComponent = function (name) {
            return self.formComponents[name];
          };
          self.resetFormComponentsValidity = function () {
            forEach(self.formComponents, function (component) {
              component.$setValidity('server', true);
            });
          };
          $scope.serverValidationError = {};
          $scope.validationErrorCode = 400;
          $scope.isSubmitted = false;
          $scope.submit = function (formData) {
            $scope.formData = formData;
            $scope.isSubmitted = true;
            self.resetFormComponentsValidity();
          };
        }
      ],
      'link': function (scope, element, attrs, ctrl) {
        scope.$watch('isSubmitted', function (isSubmitted) {
          if (!isSubmitted) {
            return;
          }
          console.log(attrs);
          $http.post(config.api.host + '/auth/register', scope.formData).then(function () {
            $location.path('/account/register/success');
          }, function (res) {
            if (res.status === scope.validationErrorCode) {
              for (var key in res.data.message) {
                if (ctrl.hasFormComponent(key)) {
                  ctrl.getFormComponent(key).$setValidity('server', false);
                  scope.serverValidationError[key] = res.data.message[key][0];
                }
              }
            }
          });
          scope.isSubmitted = false;
        });
      }
    };
  }
]).directive('remoteFormComponent', function () {
  return {
    'restrict': 'A',
    'require': [
      '^remoteForm',
      'ngModel'
    ],
    'link': function (scope, element, attrs, ctrls) {
      var formCtrl = ctrls[0];
      var ngModel = ctrls[1];
      formCtrl.registerFormComponent(attrs.name, ngModel);
    }
  };
});
angular.module('filters.fromNow', []).filter('fromNow', function () {
  return function (dateString) {
    return moment(dateString).fromNow();
  };
});
'use strict';
angular.module('resources.platforms', [
  'ngResource',
  'config'
]);
angular.module('resources.platforms').factory('Platform', [
  '$resource',
  'config',
  function ($resource, config) {
    return $resource(config.api.host.replace(/:([0-9].*)$/, '\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/platforms/:id', { id: '@id' }, {
      'index': {
        method: 'GET',
        isArray: true
      },
      'get': { method: 'GET' },
      'create': { method: 'POST' },
      'update': { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    });
  }
]);
'use strict';
angular.module('resources.genres', [
  'ngResource',
  'config'
]);
angular.module('resources.genres').factory('Genre', [
  '$resource',
  'config',
  function ($resource, config) {
    return $resource(config.api.host.replace(/:([0-9].*)$/, '\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/genres/:id', { id: '@id' }, {
      'index': {
        method: 'GET',
        isArray: true
      },
      'get': { method: 'GET' },
      'create': { method: 'POST' },
      'update': { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    });
  }
]);
'use strict';
angular.module('resources.users', [
  'ngResource',
  'config'
]);
angular.module('resources.users').factory('User', [
  '$resource',
  'config',
  function ($resource, config) {
    return $resource(config.api.host.replace(/:([0-9].*)$/, '\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/users/:id', { id: '@id' }, {
      'index': {
        method: 'GET',
        isArray: true
      },
      'get': { method: 'GET' },
      'create': { method: 'POST' },
      'update': { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    });
  }
]);
'use strict';
angular.module('homepage', [
  'config',
  'ngRoute',
  'templates.app'
], [
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'modules/homepage/homepage.tpl.html',
      controller: 'HomepageCtrl'
    });
  }
]);
angular.module('homepage').controller('HomepageCtrl', [
  '$scope',
  'config',
  function ($scope, config) {
    $scope.config = config;
  }
]);
'use strict';
angular.module('account', [
  'config',
  'security',
  'services.invites',
  'ngRoute',
  'templates.app'
], [
  '$routeProvider',
  'securityAuthorizationProvider',
  function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/account', {
      templateUrl: 'account/account.tpl.html',
      controller: 'AccountCtrl',
      resolve: {
        authorization: securityAuthorizationProvider.requireAuthenticatedUser,
        accountStatus: [
          'security',
          '$q',
          function (security, $q) {
            var deferred = $q.defer();
            if (security.currentUser) {
              if (security.currentUser._embedded.accounts[0].status === 'active') {
                deferred.resolve();
              } else {
                deferred.reject(new Error('No active accounts found'));
              }
            } else {
              deferred.reject(new Error('No active accounts found'));
            }
            return deferred.promise;
          }
        ]
      }
    }).when('/account/register/success', {
      templateUrl: 'account/account.register.success.tpl.html',
      controller: 'AccountCtrl'
    }).when('/account/login/:inviteCode', {
      controller: [
        'security',
        function (security) {
          security.showLogin();
        }
      ]
    }).when('/account/verify/:token', {
      templateUrl: 'account/account.emailVerification.tpl.html',
      controller: 'AccountEmailVerificationCtrl',
      resolve: {
        verification: [
          'security',
          '$q',
          '$route',
          function (security, $q, $route) {
            var deferred = $q.defer(), token = $route.current.params.token;
            security.verifyEmailAddress(token).then(function (data) {
              console.log(data);
              if (!data.error) {
                deferred.resolve(data);
              } else {
                console.log('reject');
                deferred.reject();
              }
            }, function (err) {
              console.log(err);
              deferred.resolve(err);
            });
            return deferred.promise;
          }
        ]
      }
    }).when('/account/password/reset', {
      templateUrl: 'account/account.resetPassword.tpl.html',
      controller: 'AccountPasswordResetCtrl'
    }).when('/account/password/reset/:token', {
      templateUrl: 'account/account.resetPassword.tpl.html',
      controller: 'AccountPasswordResetCtrl'
    });
  }
]);
angular.module('account').controller('AccountCtrl', [
  '$scope',
  'config',
  '$location',
  'security',
  'i18nNotifications',
  function ($scope, config, $location, security, i18nNotifications) {
    switch (security.currentUser.role) {
    case 'gamer':
      $location.path('/gamer/account');
      break;
    case 'game_developer':
      $location.path('/developer/account');
      break;
    }
    ;
    $scope.config = config;
  }
]).controller('AccountEmailVerificationCtrl', [
  '$scope',
  'config',
  '$location',
  'security',
  'i18nNotifications',
  'verification',
  function ($scope, config, $location, security, i18nNotifications, verification) {
    $scope.showLogin = security.showLogin;
    $scope.validated = true;
    if (verification.code && verification.code === 'InvalidContent') {
      $scope.validated = false;
    }
  }
]).controller('AccountPasswordResetCtrl', [
  '$scope',
  'config',
  '$location',
  'security',
  'i18nNotifications',
  '$route',
  function ($scope, config, $location, security, i18nNotifications, $route) {
    $scope.showLogin = security.showLogin;
    $scope.resetToken = $route.current.params.token || false;
    if ($scope.resetToken) {
      $scope.resetPassword = function () {
        if (!$scope.user) {
          $scope.error = {
            'title': 'Error.',
            'msg': 'Please enter your new password.'
          };
          return;
        }
        if ($scope.user.password != $scope.user.password_confirm) {
          $scope.error = {
            'title': 'Passwords don\'t match.',
            'msg': 'The passwords you entered do not match'
          };
          return;
        }
        security.resetPasswordWithToken($scope.user.password, $scope.resetToken).success(function () {
          $scope.success = true;
        }).error(function (err) {
          if (err.code === 'InvalidContent' && err.message === 'InvalidToken') {
            $scope.error = {
              title: 'Invalid Token',
              msg: 'The password reset token you\'re attempting to use isn\'t valid or may have expired.'
            };
          }
        });
      };
    } else {
      $scope.sendPasswordResetEmail = function () {
        if ($scope.user && $scope.user.email) {
          security.requestPasswordReset($scope.user.email).success(function () {
            $scope.emailSent = true;
          }).error(function () {
          });
        }
      };
    }
  }
]).directive('emailInvites', [function () {
    var directive = {
        restrict: 'E',
        templateUrl: 'scripts/modules/account/account.emailInvites.tpl.html',
        scope: { invites: '=' },
        controller: [
          '$scope',
          '$element',
          '$attrs',
          'invitesService',
          '$timeout',
          'security',
          function ($scope, $element, $attrs, invitesService, $timeout, security) {
            $scope.emailAddresses = [];
            $scope.send = function () {
              var emailAddresses = $scope.emailAddresses.map(function (item) {
                  return item.text;
                });
              if (emailAddresses) {
                invitesService.sendEmailInvites(emailAddresses).success(function (invites) {
                  var inviteArr = [];
                  invites.forEach(function (invite) {
                    $scope.invites.unshift(invite);
                  });
                  $scope.emailAddresses = [];
                  security.requestCurrentUser().then(function (currentUser) {
                    currentUser.inviteCount = currentUser.inviteCount - invites.length;
                  });
                }).error(function (err) {
                  console.log(err);
                });
              }
            };
          }
        ]
      };
    return directive;
  }]).directive('inviteHistory', [function () {
    var directive = {
        restrict: 'E',
        templateUrl: 'scripts/modules/account/account.inviteHistory.tpl.html',
        scope: { invites: '=' },
        controller: [
          '$scope',
          '$element',
          '$attrs',
          '$timeout',
          function ($scope, $element, $attrs, $timeout) {
            $timeout(function () {
              $scope.$apply();
            }, 60000);
            $scope.$watch('invites', function (invites) {
              console.log('WATCH');
              console.log($scope.invites);
            });
          }
        ]
      };
    return directive;
  }]).directive('activeInvites', [
  'invitesService',
  function (invitesService) {
    var directive = {
        restrict: 'E',
        templateUrl: 'scripts/modules/account/account.activeInvites.tpl.html',
        scope: { invites: '=' },
        controller: [
          '$scope',
          '$element',
          '$attrs',
          'security',
          '$timeout',
          function ($scope, $element, $attrs, security, $timeout) {
            $scope.generateInviteCode = function () {
              invitesService.generateInviteCode().success(function (invite) {
                $scope.invites.unshift(invite);
                security.requestCurrentUser().then(function (currentUser) {
                  currentUser.inviteCount--;
                });
              }).error(function (err) {
                console.log(err);
              });
            };
            $scope.showPendingInvites = function (item) {
              return item.status === 'pending';
            };
            $timeout(function () {
              console.log('timeout');
              console.log($element.find('.copy-top-clipboard'));
              var clip = new ZeroClipboard($element.find('.copy-to-clipboard'), { moviePath: '/components/zeroclipboard/ZeroClipboard.swf' });
              clip.on('load', function (client) {
                client.on('complete', function (client, args) {
                  alert('Copied text to clipboard: ' + args.text);
                });
              });
            }, 1000);
            $scope.copyToClipboard = function (token) {
            };
          }
        ]
      };
    return directive;
  }
]);
'use strict';
angular.module('account.gamer', [
  'config',
  'templates.app'
], [
  '$routeProvider',
  'securityAuthorizationProvider',
  function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/gamer/account', {
      templateUrl: 'account/gamer/account.gamer.tpl.html',
      controller: 'GamerAccountCtrl',
      resolve: { authorization: securityAuthorizationProvider.requireGamerRole }
    }).when('/gamer/account/settings', {
      templateUrl: 'account/gamer/account.gamer.settings.tpl.html',
      controller: 'GamerAccountCtrl',
      resolve: { authorization: securityAuthorizationProvider.requireGamerRole }
    }).when('/gamer/account/invites', {
      templateUrl: 'account/gamer/account.gamer.invites.tpl.html',
      controller: 'GamerAccountInvitesCtrl',
      resolve: {
        authorization: securityAuthorizationProvider.requireGamerRole,
        invites: [
          '$http',
          'security',
          'config',
          '$q',
          function ($http, security, config, $q) {
            console.log('here');
            return security.requestCurrentUser().then(function (user) {
              var deferred = $q.defer();
              $http.get(config.api.host + '/users/' + user.id + '/invites').success(function (data) {
                deferred.resolve(data.invites);
              }).error(function (err) {
                deferred.reject(err);
              });
              return deferred.promise;
            });
          }
        ]
      }
    });
    ;
  }
]);
angular.module('account.gamer').controller('GamerAccountCtrl', [
  '$scope',
  'config',
  'security',
  'User',
  'i18nNotifications',
  '$http',
  'usersService',
  function ($scope, config, security, User, i18nNotifications, $http, usersService) {
    $scope.config = config;
    security.requestCurrentUser().then(function (user) {
      $scope.user = user;
    });
    ;
    $scope.updateAccountSettings = function () {
      $scope.updateAccountSettingsLoading = true;
    };
    $scope.resetPassword = function (e) {
      $scope.passwordResetLoading = true;
      angular.element(this).attr('disabled');
      security.requestPasswordReset($scope.user.email).success(function () {
        $scope.passwordResetLoading = false;
        i18nNotifications.pushForCurrentRoute('account.details.password.reset.email.sent', 'warning');
      }).error(function () {
      });
    };
    $scope.showFilesystemDialog = function () {
      angular.element('input[type="file"]').click();
    };
    $scope.uploadProfilePicture = function (files) {
      usersService.uploadProfilePicture($scope.user, files[0]).then(function () {
        security.requestCurrentUser().then(function (user) {
          $scope.user = user;
          console.log($scope.user.profilePicture);
        });
        ;
      });
    };
    $scope.submit = function (userDetailsForm) {
      if (userDetailsForm.$valid) {
        var oldDetails = angular.copy(userDetailsForm);
        User.update($scope.user, function () {
          i18nNotifications.pushForCurrentRoute('account.details.updated.success', 'success');
        }, function () {
        });
      } else {
        console.log('invalid');
      }
    };
  }
]);
angular.module('account.gamer').controller('GamerAccountInvitesCtrl', [
  '$q',
  '$scope',
  'security',
  'config',
  '$http',
  'invites',
  'invitesService',
  function ($q, $scope, security, config, $http, invites, invitesService) {
    $q.when(invites).then(function (invites) {
      $scope.invites = invites;
    });
    security.requestCurrentUser().then(function (user) {
      $scope.user = user;
    });
    $scope.generateInviteCode = function () {
      invitesService.generateInviteCode().success(function () {
      }).error(function () {
      });
    };
  }
]);
angular.module('account.gamer.register', [
  'resources.platforms',
  'resources.genres',
  'directives.remoteForm'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/account/register/gamer', {
      templateUrl: 'account/gamer/account.gamer.register.tpl.html',
      controller: 'AccountGamerRegisterCtrl'
    });
    $routeProvider.when('/account/register/gamer/:inviteCode', {
      templateUrl: 'account/gamer/account.gamer.register.tpl.html',
      controller: 'AccountGamerRegisterCtrl'
    });
  }
]).controller('AccountGamerRegisterCtrl', [
  '$scope',
  '$location',
  'Platform',
  'Genre',
  '$routeParams',
  function ($scope, $location, Platform, Genre, $routeParams) {
    $scope.newUser = {
      role: 'gamer',
      inviteToken: $routeParams.inviteCode
    };
    $scope.navigateToGameDeveloperRegistrationForm = function () {
      $location.path('/account/register/developer');
    };
    $scope.success = function () {
      $location.path('/account/register/success');
    };
  }
]);
'use strict';
angular.module('account.developer', [
  'config',
  'security',
  'ui.bootstrap.tabs',
  'templates.app'
], [
  '$routeProvider',
  'securityAuthorizationProvider',
  function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/developer/account', {
      templateUrl: 'account/developer/account.developer.tpl.html',
      controller: 'DeveloperAccountCtrl',
      resolve: { authorization: securityAuthorizationProvider.requireDeveloperRole }
    }).when('/account/settings', { redirectTo: '/developer/account/settings' }).when('/developer/account/settings', {
      templateUrl: 'account/developer/account.developer.settings.tpl.html',
      controller: 'DeveloperAccountCtrl',
      resolve: { authorization: securityAuthorizationProvider.requireDeveloperRole }
    }).when('/account/invites', { redirectTo: '/developer/account/invites' }).when('/developer/account/invites', {
      templateUrl: 'account/developer/account.developer.invites.tpl.html',
      controller: 'DeveloperAccountInvitesCtrl',
      resolve: {
        authorization: securityAuthorizationProvider.requireDeveloperRole,
        invites: [
          '$http',
          'security',
          'config',
          '$q',
          function ($http, security, config, $q) {
            console.log('here');
            return security.requestCurrentUser().then(function (user) {
              var deferred = $q.defer();
              $http.get(config.api.host + '/users/' + user.id + '/invites').success(function (data) {
                deferred.resolve(data.invites);
              }).error(function (err) {
                deferred.reject(err);
              });
              return deferred.promise;
            });
          }
        ]
      }
    });
  }
]);
angular.module('account.developer').controller('DeveloperAccountCtrl', [
  '$scope',
  'config',
  'security',
  'User',
  'i18nNotifications',
  '$http',
  'usersService',
  function ($scope, config, security, User, i18nNotifications, $http, usersService) {
    $scope.config = config;
    security.requestCurrentUser().then(function (user) {
      $scope.user = user;
    });
    ;
    $scope.resetPassword = function (e) {
      $scope.passwordResetLoading = true;
      angular.element(this).attr('disabled');
      security.requestPasswordReset($scope.user.email).success(function () {
        $scope.passwordResetLoading = false;
        i18nNotifications.pushForCurrentRoute('account.details.password.reset.email.sent', 'warning');
      }).error(function () {
      });
    };
    $scope.showFilesystemDialog = function () {
      angular.element('input[type="file"]').click();
    };
    $scope.uploadProfilePicture = function (files) {
      usersService.uploadProfilePicture($scope.user, files[0]).then(function () {
        security.refreshCurrentUser().then(function (user) {
          $scope.user = user;
        });
      });
    };
    $scope.submit = function (userDetailsForm) {
      if (userDetailsForm.$valid) {
        var oldDetails = angular.copy(userDetailsForm);
        User.update($scope.user, function () {
          i18nNotifications.pushForCurrentRoute('account.details.updated.success', 'success');
        }, function () {
        });
      } else {
        console.log('invalid');
      }
    };
  }
]);
angular.module('account.developer').controller('DeveloperAccountInvitesCtrl', [
  '$q',
  '$scope',
  'security',
  'config',
  '$http',
  'invites',
  'invitesService',
  function ($q, $scope, security, config, $http, invites, invitesService) {
    $q.when(invites).then(function (invites) {
      $scope.invites = invites;
    });
    security.requestCurrentUser().then(function (user) {
      $scope.user = user;
    });
    $scope.generateInviteCode = function () {
      invitesService.generateInviteCode().success(function () {
      }).error(function () {
      });
    };
  }
]);
angular.module('account.developer').directive('developerAccountNav', function () {
  return {
    restrict: 'E',
    templateUrl: 'account/developer/account.developer.nav.tpl.html'
  };
});
angular.module('account.developer.register', [
  'resources.platforms',
  'resources.genres',
  'directives.remoteForm'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/account/register/developer', {
      templateUrl: 'account/developer/account.developer.register.tpl.html',
      controller: 'AccountDeveloperRegisterCtrl'
    });
  }
]).controller('AccountDeveloperRegisterCtrl', [
  '$scope',
  '$location',
  'Platform',
  'Genre',
  function ($scope, $location, Platform, Genre) {
    $scope.newUser = { role: 'game_developer' };
    $scope.success = function () {
      $location.path('/account/register/success');
    };
  }
]);
angular.module('templates.app', [
  'modules/account/account.activeInvites.tpl.html',
  'modules/account/account.emailInvites.tpl.html',
  'modules/account/account.emailVerification.tpl.html',
  'modules/account/account.inviteHistory.tpl.html',
  'modules/account/account.invites.tpl.html',
  'modules/account/account.register.success.tpl.html',
  'modules/account/account.resetPassword.tpl.html',
  'modules/account/account.tpl.html',
  'modules/account/developer/account.developer.invites.tpl.html',
  'modules/account/developer/account.developer.nav.tpl.html',
  'modules/account/developer/account.developer.register.tpl.html',
  'modules/account/developer/account.developer.settings.tpl.html',
  'modules/account/developer/account.developer.tpl.html',
  'modules/account/gamer/account.gamer.invites.tpl.html',
  'modules/account/gamer/account.gamer.register.tpl.html',
  'modules/account/gamer/account.gamer.settings.tpl.html',
  'modules/account/gamer/account.gamer.tpl.html',
  'modules/homepage/homepage.tpl.html'
]);
angular.module('modules/account/account.activeInvites.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.activeInvites.tpl.html', '<div class="well well-large">\n' + '  <h4>Active Invites</h4>\n' + '  <p><em>You have {{ invites.filter(showPendingInvites).length }} active invites</em></p>\n' + '  <p><a class="btn btn-mini" ng-click="generateInviteCode()">Generate a new Invite Code</a></p>\n' + '  <ul class="codes">\n' + '    <li ng-repeat="invite in invites | filter:showPendingInvites | orderBy:\'updatedAt\':true ">\n' + '    <span class="label label-info copy-to-clipboard" data-clipboard-text="{{ invite.token }}" tooltip="Click to copy">{{ invite.token }}</span> <i class="icon-share pull-right"></i>\n' + '    </li>\n' + '  </ul>\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/account.emailInvites.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.emailInvites.tpl.html', '<div class="well well-large">\n' + '  <h4>Send Email Invites</h4>\n' + '  <input class="input-xxlarge" type="hidden" ui-select2="{\'tags\':[], \'simple_tags\':true, \'multiple\':true}" ng-model="emailAddresses" data-placeholder="Enter some email addresses..." />\n' + '  <span class="help-block">Just hit enter after each email address and hit send when you\'re done.</span>\n' + '  <button class="btn btn-primary" ng-click="send()">Send</button>\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/account.emailVerification.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.emailVerification.tpl.html', '<div data-ng-show="validated">\n' + '<h1>All done!</h1>\n' + '<p>Your email address has been verified.  You\'re all ready to go. <a href="" data-ng-click="showLogin()">Login?</a></p>\n' + '</div>\n' + '\n' + '<div data-ng-hide="validated">\n' + '<h1>Uh oh!</h1>\n' + '<p>It looks like something went wrong.  Perhaps you\'ve already verified your email address.  Try <a href="" data-ng-click="showLogin()">logging in</a>.</p>\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/account.inviteHistory.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.inviteHistory.tpl.html', '<div class="well well-large">\n' + '  <ul class="codes">\n' + '    <li ng-repeat="invite in invites | orderBy:\'updatedAt\':true">\n' + '    <span class="label ng-class: {\'label-success\': (invite.status == \'redeemed\'), \'label-info\': (invite.status == \'sent\')}" >{{invite.token}}</span> \n' + '    <em ng-hide="invite.status!=\'redeemed\'">was redeemed by <i class="icon-user"></i><strong>{{ invite.redeemed_by_company || invite.redeemed_by_fullname }} </strong> {{ invite.redeemedAt | fromNow }}</em>\n' + '    <em ng-hide="invite.status!=\'pending\'">was generated {{ invite.createdAt | fromNow }}</em>\n' + '    <em ng-hide="invite.status!=\'sent\'">was sent to <i class="icon-envelope"></i><strong>{{ invite.sentToEmailAddress }}</strong> {{ invite.sentAt | fromNow }}</em>\n' + '    </li>\n' + '\n' + '\n' + '    <!-- <li><span class="label label-info">A23DSfGSD</span> <em>was sent to <i class="icon-envelope"></i><strong>matt@lucidmoon.co.uk</strong> yesterday at 20:22</em></li> -->\n' + '    <!-- <li><span class="label">A23DSfGSD</span> <em>was generated yesterday at 13:49</em></li> -->\n' + '  </ul>\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/account.invites.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.invites.tpl.html', '<h2>Invites</h2>\n' + '<form class="form" name="invitesForm">\n' + '  <fieldset>\n' + '    <legend>Invite by Email</legend>\n' + '    <p>You can invite people by sending them an email.  You have <span class="badge badge-info">{{ user.inviteCount }}</span> invites remaning.<p>\n' + '    <email-invites invites="invites"></email-invites>\n' + '  </fieldset>\n' + '</form>\n' + '<form class="form">\n' + '  <fieldset>\n' + '    <legend>Generate Invite Code</legend>\n' + '    <p>You can invite people by generating an invite code and sending the code to them yourself</p>\n' + '    <active-invites invites="invites"></active-invites>\n' + '    <hr />\n' + '\n' + '    <h4>Invite History</h4>\n' + '    <invite-history invites="invites"></invite-history>\n' + '  </div>\n' + '</div>\n' + '\n' + '\n' + '\n' + '');
  }
]);
angular.module('modules/account/account.register.success.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.register.success.tpl.html', '<h1>Nearly there!</h1>\n' + '<p>In order to progress your account registration you must first verify your email account.  Check your email for details.</p>\n' + '');
  }
]);
angular.module('modules/account/account.resetPassword.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.resetPassword.tpl.html', '<h3>Password Reset</h3>\n' + '<div ng-hide="resetToken">\n' + '  <form class="form" ng-hide="emailSent">\n' + '    <div class="control-group">\n' + '      <div class="controls">\n' + '        <input name="email" data-ng-model="user.email" type="text" placeholder="Email" required autofocus />\n' + '      </div>\n' + '    </div>\n' + '    <div class="control-group">\n' + '      <button class="btn btn-primary" ng-click="sendPasswordResetEmail()">Request Password Reset</button>\n' + '    </div>\n' + '  </form>\n' + '  <div ng-hide="!emailSent">\n' + '    <p>We\'ve sent you an email with further instructions.  Check your email to complete the process</p>\n' + '  </div>\n' + '</div>\n' + '\n' + '<div ng-hide="!resetToken">\n' + '  <div class="alert alert-error" ng-hide="!error">\n' + '      <h4>{{ error.title }}</h4> {{ error.msg }}\n' + '  </div>\n' + '  <div ng-hide="!success" class="alert alert-success">\n' + '    <p><strong>Success!</strong> You have successfully reset your password.</p>\n' + '    <p>Click <a href="" ng-click="showLogin()">here to login</a></p>\n' + '  </div>\n' + '  <form class="form">\n' + '  <div ng-hide="success">\n' + '    <div class="control-group">\n' + '      <div class="controls">\n' + '        <input name="password" data-ng-model="user.password" type="password" placeholder="New Password" required autofocus />\n' + '      </div>\n' + '    </div>\n' + '    <div class="control-group">\n' + '      <div class="controls">\n' + '        <input name="password_confirm" data-ng-model="user.password_confirm" type="password" placeholder="New Password (again)" required  />\n' + '      </div>\n' + '    </div>\n' + '    <div class="control-group">\n' + '      <button class="btn btn-primary" ng-click="resetPassword()">Reset Password</button>\n' + '    </div>\n' + '  </div>\n' + '</form>\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/account.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/account.tpl.html', '<h1>Account!</h1>\n' + '');
  }
]);
angular.module('modules/account/developer/account.developer.invites.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/developer/account.developer.invites.tpl.html', '<div class="account invites">\n' + '  <div class="row-fluid">\n' + '    <div class="span3">\n' + '      <div class="well well-small">\n' + '        <ul class="nav nav-list">\n' + '          <li class="nav-header">My Account</li>\n' + '          <li><a href="/#/developer/account/settings">Account Settings</a></li>\n' + '          <li class="nav-header">Profile</li>\n' + '          <li><a href="">Edit Profile</a></li>\n' + '          <li><a href="">View Public Profile</a></li>\n' + '          <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '          <li class="active"><a href="/#/developer/account/invites">Invite People</a></li>\n' + '        </ul> \n' + '      </div>\n' + '\n' + '    </div>\n' + '\n' + '    <div class="span9" data-ng-include="\'scripts/modules/account/account.invites.tpl.html\'"></div>\n' + '\n' + '');
  }
]);
angular.module('modules/account/developer/account.developer.nav.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/developer/account.developer.nav.tpl.html', '<ul class="nav nav-list">\n' + '  <li class="nav-header">My Account</li>\n' + '  <li><a href="/#/developer/account/settings">Account Settings</a></li>\n' + '  <li class="nav-header">Campaigns</li>\n' + '  <li><a href="/#/developer/account/campaigns/active">Active Campaigns</a></li>\n' + '  <li><a href="/#/developer/account/campaigns/archive">Past Campaigns</a></li>\n' + '  <li class="nav-header">Profile</li>\n' + '  <li><a href="">Edit Profile</a></li>\n' + '  <li><a href="">View Public Profile</a></li>\n' + '  <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '  <li><a href="/#/developer/account/invites">Invite People</a></li>\n' + '</ul> \n' + '');
  }
]);
angular.module('modules/account/developer/account.developer.register.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/developer/account.developer.register.tpl.html', '  <form name="imvgmRegistrationForm" data-remote-form="" data-remote-form-action="/auth/register" data-ng-success="success()">\n' + '    <fieldset>\n' + '      <legend><h2>Create Developer account</h2></legend>\n' + '\n' + '      <div class="alert alert-error" data-ng-show="!imvgmRegistrationForm.$valid">\n' + '        <button type="button" class="close" data-dismiss="alert">&times;</button>\n' + '        <strong>Uh Oh!</strong> Best check yo self, you\'re not looking too good.\n' + '      </div>\n' + '\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.company.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-company">Company Name:</label>\n' + '          <input name="company" id="imvgm-reg-frm-company" data-remote-form-component="" data-ng-model="newUser.company" type="text" placeholder="Company Name" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.company.$valid && imvgmRegistrationForm.company.$error.server">{{serverValidationError[\'company\']}}</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.fullname.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-fullname">Full Name:</label>\n' + '          <input name="fullname" id="imvgm-reg-frm-fullname" data-remote-form-component="" data-ng-model="newUser.fullname" type="text" placeholder="Full Name" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.fullname.$valid && imvgmRegistrationForm.fullname.$error.server">{{serverValidationError[\'fullname\']}}</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.email.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-email">Email</label>\n' + '          <input name="email" id="imvgm-reg-frm-email" data-email data-remote-form-component="" data-ng-model="newUser.email" type="text" placeholder="Email Address" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.email.$valid">{{serverValidationError[\'email\']}}</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.password.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-password">Password</label>\n' + '          <input name="password" id="imvgm-reg-frm-password" data-remote-form-component="" data-ng-model="newUser.password" type="password" placeholder="Password" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.password.$valid && imvgmRegistrationForm.password.$error.server">Please enter a strong password.</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.agreeToTerms.$valid}">\n' + '        <div class="controls">\n' + '        <label for="imvgm-reg-frm-terms"><input name="agreeToTerms" id="imvgm-reg-frm-terms" data-remote-form-component="" data-ng-model="newUser.agreeToTerms" type="checkbox" /> I agree to the <a href="/terms.html">Terms &amp; Conditions</a></label>\n' + '        <span class="help-inline" ng-show="!imvgmRegistrationForm.agreeToTerms.$valid && imvgmRegistrationForm.agreeToTerms.$error.server">You must agree to the terms &amp; conditions</span>\n' + '      </div>\n' + '      </div>\n' + '      <div class="control-group">\n' + '        <div class="controls">\n' + '          <input type="hidden" name="role" value="game_developer" data-ng-model="newUser.role" />\n' + '          <button class="btn" data-ng-click="submit(newUser)" data-ng-disabled="imvgmRegistrationForm.$pristine">Create Account</button>\n' + '        </div>\n' + '      </div>\n' + '    </fieldset>\n' + '  </form>\n' + '');
  }
]);
angular.module('modules/account/developer/account.developer.settings.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/developer/account.developer.settings.tpl.html', '<div class="account">\n' + '<div class="row-fluid">\n' + '  <div class="span3">\n' + '    <div class="well well-small">\n' + '      <ul class="nav nav-list">\n' + '        <li class="nav-header">My Account</li>\n' + '        <li class="active"><a href="/#/developer/account/settings">Account Settings</a></li>\n' + '        <li class="nav-header">Profile</li>\n' + '        <li><a href="">Edit Profile</a></li>\n' + '        <li><a href="">View Public Profile</a></li>\n' + '        <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '        <li><a href="/#/developer/account/invites">Invite People</a></li>\n' + '      </ul> \n' + '    </div>\n' + '\n' + '  </div>\n' + '  <div class="span9">\n' + '\n' + '\n' + '    <form name="userDetailsForm">\n' + '      <fieldset>\n' + '        <legend>Account</legend>\n' + '        <div class="pull-right">\n' + '        <div class="avatar ng-class: {\'avatar-default\': !user.profilePicture}" tooltip="Click to Change" tooltip-toggle="mouseenter" tooltip-placement="bottom" ng-click="showFilesystemDialog()">\n' + '          <i ng-hide="user.profilePicture" class="icon-user"></i>\n' + '          <img ng-show="user.profilePicture" src="http://localhost:3030/profile_pictures/{{user.profilePicture}}" alt="" />\n' + '        </div>\n' + '        <!-- <p><a href="" ng-click="uploadProfilePicture">Change Profile Picture</a></p> -->\n' + '        <input type="file" name="profilePicture" ng-file-select="uploadProfilePicture($files)"/>\n' + '      </div>\n' + '        <label>Company Name</label>\n' + '        <input ng-model="user.company" type="text" placeholder="Company Name" required />\n' + '        <label for="">Name</label>\n' + '        <input type="text" ng-model="user.fullname" placeholder="Name" required />\n' + '        <label for="">Email</label>\n' + '        <input type="email" ng-model="user.email" placeholder="Name" required />\n' + '        <div>\n' + '          <button ng-disabled="updateAccountSettingsLoading" type="submit" class="btn btn-primary" ng-click="submit(userDetailsForm)">Save</button>\n' + '        </div>\n' + '      </fieldset>\n' + '    </form>\n' + '    <form>\n' + '      <fieldset>\n' + '        <legend>Password</legend>\n' + '        <p><a class="btn btn-warning" ng-disabled="passwordResetLoading" href="" ng-click="resetPassword()">Reset Password</a></p>\n' + '      </fieldset>\n' + '  </div>\n' + '</div>\n' + '\n' + '</div>\n' + '');
  }
]);
angular.module('modules/account/developer/account.developer.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/developer/account.developer.tpl.html', '  <div class="row-fluid">\n' + '    \n' + '    <div class="span3">\n' + '      <div class="well well-small">\n' + '        <developer-account-nav></developer-account-nav>\n' + '      </div>\n' + '    </div>\n' + '\n' + '    <div class="span9">\n' + '      <h1>Developer account</h1>\n' + '      <p>Hey {{user.username}}. You are a {{user.role}} and your account ID is {{user.id}}</p>\n' + '      <p ng-show="user.inviteCount">You have {{ user.inviteCount }} invite<span ng-show="(user.inviteCount > 1)">s</span> remaining. <em ng-show="user.inviteCount == 1">Better use it wisely!</em></p>\n' + '      <p ng-hide="user.inviteCount">You have no Invites remaining :( <a href="#">Want some more?</a></p>\n' + '      <!--Body content-->\n' + '    </div>\n' + '\n' + '  </div>\n' + '\n' + '');
  }
]);
angular.module('modules/account/gamer/account.gamer.invites.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/gamer/account.gamer.invites.tpl.html', '<div class="account invites">\n' + '  <div class="row-fluid">\n' + '    <div class="span3">\n' + '      <div class="well well-small">\n' + '        <ul class="nav nav-list">\n' + '          <li class="nav-header">My Account</li>\n' + '          <li><a href="/#/gamer/account/settings">Account Settings</a></li>\n' + '          <li class="nav-header">Profile</li>\n' + '          <li><a href="">Edit Profile</a></li>\n' + '          <li><a href="">View Public Profile</a></li>\n' + '          <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '          <li class="active"><a href="/#/gamer/account/invites">Invite People</a></li>\n' + '        </ul> \n' + '      </div>\n' + '\n' + '    </div>\n' + '\n' + '    <div class="span9" data-ng-include="\'scripts/modules/account/account.invites.tpl.html\'"></div>\n' + '\n' + '\n' + '');
  }
]);
angular.module('modules/account/gamer/account.gamer.register.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/gamer/account.gamer.register.tpl.html', '  <form name="imvgmRegistrationForm" data-remote-form="" data-remote-form-action="/auth/register" data-remote-form-success="success()">\n' + '    <fieldset>\n' + '      <legend><h2>Create a Gamer account</h2></legend>\n' + '      <p><a href="" data-ng-click="navigateToGameDeveloperRegistrationForm()">Develop games?  Sign-up for a Game Developer account.</a></p>\n' + '      <div class="alert alert-error" data-ng-show="!imvgmRegistrationForm.$valid">\n' + '        <button type="button" class="close" data-dismiss="alert">&times;</button>\n' + '        <strong>Uh Oh!</strong> Best check yo self, you\'re not looking too good.\n' + '      </div>\n' + '\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.inviteToken.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-inviteToken">Invite Code:</label>\n' + '          <input name="inviteToken" id="imvgm-reg-frm-inviteToken" data-remote-form-component="" data-ng-model="newUser.inviteToken" type="text" placeholder="Full Name" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.inviteToken.$valid && imvgmRegistrationForm.inviteToken.$error.server">Invalid Invite Code.</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.fullname.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-fullname">Name:</label>\n' + '          <input name="fullname" id="imvgm-reg-frm-fullname" data-remote-form-component="" data-ng-model="newUser.fullname" type="text" placeholder="Full Name" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.fullname.$valid && imvgmRegistrationForm.fullname.$error.server">Please enter your Full Name.</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.email.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-email">Email</label>\n' + '          <input name="email" id="imvgm-reg-frm-email" data-email data-remote-form-component="" data-ng-model="newUser.email" type="text" placeholder="Email Address" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.email.$valid">{{serverValidationError[\'email\']}}</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.password.$valid}">\n' + '        <div class="controls">\n' + '          <label for="imvgm-reg-frm-password">Password</label>\n' + '          <input name="password" id="imvgm-reg-frm-password" data-remote-form-component="" data-ng-model="newUser.password" type="password" placeholder="Password" />\n' + '          <span class="help-inline" data-ng-show="!imvgmRegistrationForm.password.$valid && imvgmRegistrationForm.password.$error.server">Please enter a strong password.</span>\n' + '        </div>\n' + '      </div>\n' + '      <div class="control-group" data-ng-class="{error: !imvgmRegistrationForm.agreeToTerms.$valid}">\n' + '        <div class="controls">\n' + '        <label for="imvgm-reg-frm-terms"><input name="agreeToTerms" target="_blank" id="imvgm-reg-frm-terms" data-remote-form-component="" data-ng-model="newUser.agreeToTerms" type="checkbox" /> I agree to the <a href="/terms.html">Terms &amp; Conditions</a></label>\n' + '        <span class="help-inline" ng-show="!imvgmRegistrationForm.agreeToTerms.$valid && imvgmRegistrationForm.agreeToTerms.$error.server">You must agree to the terms &amp; conditions</span>\n' + '      </div>\n' + '      </div>\n' + '      <div class="control-group">\n' + '        <div class="controls">\n' + '          <input type="hidden" name="role" data-ng-model="newUser.role" data-remote-form-component="" />\n' + '          <button class="btn" data-ng-click="submit(newUser)" data-ng-disabled="imvgmRegistrationForm.$pristine">Create Account</button>\n' + '        </div>\n' + '      </div>\n' + '    </fieldset>\n' + '  </form>\n' + '');
  }
]);
angular.module('modules/account/gamer/account.gamer.settings.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/gamer/account.gamer.settings.tpl.html', '<div class="account">\n' + '<div class="row-fluid">\n' + '  <div class="span3">\n' + '    <div class="well well-small">\n' + '      <ul class="nav nav-list">\n' + '        <li class="nav-header">My Account</li>\n' + '        <li class="active"><a href="/#/gamer/account/settings">Account Settings</a></li>\n' + '        <li class="nav-header">Profile</li>\n' + '        <li><a href="">Edit Profile</a></li>\n' + '        <li><a href="">View Public Profile</a></li>\n' + '        <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '        <li><a href="/#/gamer/account/invites">Invite People</a></li>\n' + '      </ul> \n' + '    </div>\n' + '\n' + '  </div>\n' + '  <div class="span9">\n' + '\n' + '\n' + '    <form name="userDetailsForm">\n' + '      <fieldset>\n' + '        <legend>Account</legend>\n' + '        <div class="pull-right">\n' + '        <div class="avatar ng-class: {\'avatar-default\': !user.profilePicture}" tooltip="Click to Change" tooltip-toggle="mouseenter" tooltip-placement="bottom" ng-click="showFilesystemDialog()">\n' + '          <span ng-hide="user.profilePicture"><i class="icon-user"></i></span>\n' + '          <img ng-show="user.profilePicture" src="http://localhost:3030/profile_pictures/{{user.profilePicture}}" alt="" />\n' + '        </div>\n' + '        <!-- <p><a href="" ng-click="uploadProfilePicture">Change Profile Picture</a></p> -->\n' + '        <input type="file" name="profilePicture" ng-file-select="uploadProfilePicture($files)"/>\n' + '      </div>\n' + '        <label for="">Name</label>\n' + '        <input type="text" ng-model="user.fullname" placeholder="Name" required />\n' + '        <label for="">Email</label>\n' + '        <input type="email" ng-model="user.email" placeholder="Name" required />\n' + '        <div>\n' + '          <button ng-disabled="updateAccountSettingsLoading" type="submit" class="btn btn-primary" ng-click="submit(userDetailsForm)">Save</button>\n' + '        </div>\n' + '      </fieldset>\n' + '    </form>\n' + '    <form>\n' + '      <fieldset>\n' + '        <legend>Password</legend>\n' + '        <p><a class="btn btn-warning" ng-disabled="passwordResetLoading" href="" ng-click="resetPassword()">Reset Password</a></p>\n' + '      </fieldset>\n' + '  </div>\n' + '</div>\n' + '\n' + '</div>\n' + '\n' + '');
  }
]);
angular.module('modules/account/gamer/account.gamer.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/account/gamer/account.gamer.tpl.html', '  <div class="row-fluid">\n' + '    <div class="span3">\n' + '      <div class="well well-small">\n' + '      <ul class="nav nav-list">\n' + '        <li class="nav-header">My Account</li>\n' + '        <li><a href="/#/gamer/account/settings">Account Settings</a></li>\n' + '        <li class="nav-header">Profile</li>\n' + '        <li><a href="">Edit Profile</a></li>\n' + '        <li><a href="">View Public Profile</a></li>\n' + '        <li class="nav-header">Invites ({{ user.inviteCount }})</li>\n' + '        <li><a href="/#/gamer/account/invites">Invite People</a></li>\n' + '      </ul> \n' + '    </div>\n' + '\n' + '    </div>\n' + '    <div class="span9">\n' + '\n' + '      <h1>Hey {{ user.fullname }}</h1>\n' + '      <p>You are a {{user.role}} and your account ID is {{user.id}}</p>\n' + '      <p ng-show="user.inviteCount">You have {{ user.inviteCount }} invite<span ng-show="(user.inviteCount > 1)">s</span> remaining. <em ng-show="user.inviteCount == 1">Better use it wisely!</em></p>\n' + '      <p ng-hide="user.inviteCount">You have no Invites remaining :( <a href="#">Want some more?</a></p>\n' + '      <!--Body content-->\n' + '    </div>\n' + '  </div>\n' + '\n' + '\n' + '');
  }
]);
angular.module('modules/homepage/homepage.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('modules/homepage/homepage.tpl.html', '\n' + '  <!-- Main hero unit for a primary marketing message or call to action -->\n' + '  <div class="hero-unit">\n' + '    <h1>Welcome to {{ config.name }}.</h1>\n' + '    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi similique magni quae ipsum pariatur enim laudantium commodi. Consequatur, nostrum tenetur ut nemo deserunt porro autem ad possimus ullam recusandae saepe.</p>\n' + '    <p><a href="/for-gamers.html" class="btn btn-primary btn-large">For Gamers&raquo;</a> <a href="/for-gamers.html" class="btn btn-large">For Gamer Developers&raquo;</a></p>\n' + '  </div>\n' + '  <hr>\n' + '  <div class="row">\n' + '    <div class="span4">\n' + '      <p><img class="img-rounded" src="http://lorempixel.com/g/300/100/technics/?1"  alt="" /></p>\n' + '\n' + '      <h2>Join the Journey</h2>\n' + '      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo.</p>\n' + '    </div>\n' + '    <div class="span4">\n' + '      <p><img class="img-rounded" src="http://lorempixel.com/g/300/100/technics/?2"  alt="" /></p>\n' + '      <h2>Engage</h2>\n' + '      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo.</p>\n' + '    </div>\n' + '    <div class="span4">\n' + '      <p><img class="img-rounded" src="http://lorempixel.com/g/300/100/technics/?3"  alt="" /></p>\n' + '      <h2>Exclusive</h2>\n' + '      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo.</p>\n' + '    </div>\n' + '  </div>\n' + '');
  }
]);
angular.module('templates.common', [
  'common/security/login/form.tpl.html',
  'common/security/login/navigation.tpl.html',
  'common/templates/footer.tpl.html',
  'common/templates/header.tpl.html',
  'common/templates/notifications.tpl.html'
]);
angular.module('common/security/login/form.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('common/security/login/form.tpl.html', '<div>\n' + '  <div class="modal-header">\n' + '    <button type="button" class="close" ng-click="cancelLogin()">&times;</button>\n' + '    <h3>Sign into your account</h3>\n' + '  </div>\n' + '  <div class="modal-body">\n' + '    <div class="alert alert-warning" ng-show="authReason">\n' + '      {{authReason}}\n' + '    </div>\n' + '    <div class="alert alert-error" ng-show="authError">\n' + '      {{authError}}\n' + '    </div>\n' + '    <form novalidate class="form login-form">\n' + '      <fieldset>\n' + '        <div class="control-group">\n' + '          <div class="controls">\n' + '            <input name="email" data-ng-model="user.email" type="text" placeholder="Email" required autofocus />\n' + '          </div>\n' + '        </div>\n' + '        <div class="control-group">\n' + '          <div class="controls">\n' + '            <input name="password" data-ng-model="user.password" type="password" placeholder="Password" required />\n' + '           <span class="help-block"><a ng-click="resetPassword()" href="">Forgotten your password?</a><br /><a href="#/register">Create an Account</a></span>\n' + '          </div>\n' + '        </div>\n' + '    </fieldset>\n' + '    </form>\n' + '  </div>\n' + '  <div class="modal-footer">\n' + '      <label class="pull-left">\n' + '      <input type="checkbox" data-ng-model="user.rememberLogin" value="true" /> Keep me logged in?\n' + '      </label>\n' + '    <button class="btn btn-primary login" ng-click="login()" ng-disabled=\'form.$invalid\'>Sign in</button>\n' + '    <button class="btn btn-warning cancel" ng-click="cancelLogin()">Cancel</button>\n' + '  </div>\n' + '\n' + '</div>\n' + '\n' + '\n' + '');
  }
]);
angular.module('common/security/login/navigation.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('common/security/login/navigation.tpl.html', '<ul class="nav pull-right">\n' + '  <li class="divider-vertical"></li>\n' + '  <li ng-show="isAuthenticated()">\n' + '\n' + '  </li>\n' + '  <li class="dropdown" ng-hide="isAuthenticated()">\n' + '  <a href="#" class="dropdown-toggle">\n' + '    <i class="icon-lock"></i>\n' + '    <b class="caret"></b>\n' + '  </a>\n' + '  <ul class="dropdown-menu">\n' + '    <li ng-hide="isAuthenticated()" class="login">\n' + '    <a ng-click="login()">Log in</a>\n' + '    </li>\n' + '    <li ng-hide="isAuthenticated()" class="login">\n' + '    <a href="/#/account/register/developer">Register</a>\n' + '    </li>\n' + '  </ul>\n' + '  </li>\n' + '  <li ng-show="isAuthenticated()" class="dropdown">\n' + '  <a href="#" class="dropdown-toggle avatar ng-class: {\'avatar-default\': !currentUser.profilePicture}">\n' + '    {{currentUser.email}}&nbsp;\n' + '    <span class="profile-picture"><i ng-hide="currentUser.profilePicture" class="icon icon-user"></i></span>\n' + '      \n' + '      <img src="http://localhost:3030/profile_pictures/{{ currentUser.profilePicture }}" ng-hide="!currentUser.profilePicture" alt="" width="32" height="32" />\n' + '      <b class="caret"></b>\n' + '    </a>\n' + '    <ul class="dropdown-menu">\n' + '    <li class="nav-header">{{ currentUser.company || currentUser.fullname }}</li>\n' + '    <li><a href="/#/account/settings">Account</a></li>\n' + '    <li><a ng-click="profile()">Profile</a><li>\n' + '    <li><a href="/#/account/invites">Invites</a><li>\n' + '    <li class="divider"></li>\n' + '    <li ng-show="isAuthenticated()" class="logout">\n' + '    <a ng-click="logout()">Log out</a>\n' + '    </li>\n' + '  </ul>\n' + '  </li>\n' + '</ul>\n' + '');
  }
]);
angular.module('common/templates/footer.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('common/templates/footer.tpl.html', '<hr />\n' + '<footer>\n' + '  <p>&copy; Tastemaker Tools 2013</p>\n' + '</footer>\n' + '');
  }
]);
angular.module('common/templates/header.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('common/templates/header.tpl.html', '<div class="navbar navbar-inverse navbar-fixed-top" data-ng-controller="HeaderCtrl">\n' + '  <div class="navbar-inner">\n' + '    <div class="container">\n' + '            <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">\n' + '        <span class="icon-bar"></span>\n' + '        <span class="icon-bar"></span>\n' + '        <span class="icon-bar"></span>\n' + '      </a>\n' + '      <a class="brand" href="#">{{ config.name }} <em>{{ config.version }}</em></a>\n' + '      <div class="nav-collapse collapse">\n' + '        <ul class="nav">\n' + '          <li><a href="/">Home</a></li>\n' + '          <li><a href="/for-gamers.html">For Gamers</a></li>\n' + '          <li><a href="/for-game-developers.html">For Game Developers</a></li>\n' + '        </ul>\n' + '        <div class="pull-right user-registration" data-user-navigation=""></div>\n' + '      </div>\n' + '    </div>\n' + '  </div>\n' + '</div>\n' + '');
  }
]);
angular.module('common/templates/notifications.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('common/templates/notifications.tpl.html', '<div ng-class="[\'alert\', \'alert-\'+notification.type]" ng-repeat="notification in notifications.getCurrent()">\n' + '    <button class="close" ng-click="removeNotification(notification)">x</button>\n' + '    {{notification.message}}\n' + '</div>\n' + '');
  }
]);
angular.module('config', []);
angular.module('config').constant('config', {
  name: 'TastemakerTools',
  version: '1.0',
  api: { host: 'http://localhost:3030' }
});
'use strict';
(function (angular) {
  angular.module('app', [
    'templates.app',
    'templates.common',
    'homepage',
    'account',
    'account.gamer',
    'account.gamer.register',
    'account.developer',
    'account.developer.register',
    'services.breadcrumbs',
    'services.i18nNotifications',
    'services.httpRequestTracker',
    'services.users',
    'services.invites',
    'security.login.navigation',
    'security',
    'directives.crud',
    'filters.fromNow',
    'resources.platforms',
    'resources.genres',
    'resources.users',
    'config',
    'angulartics',
    'angulartics.google.analytics',
    'ngResource',
    'ngRoute',
    'ngCookies',
    'ui',
    'ui.bootstrap.dialog',
    'ui.bootstrap.dropdownToggle',
    'ui.bootstrap.tooltip',
    'ui.bootstrap.tabs',
    'angularFileUpload',
    'chieffancypants.loadingBar',
    'ngAnimate'
  ]);
  angular.module('app').constant('I18N.MESSAGES', {
    'errors.route.changeError': 'Route change error',
    'crud.user.save.success': 'A user with id \'{{id}}\' was saved successfully.',
    'crud.user.remove.success': 'A user with id \'{{id}}\' was removed successfully.',
    'crud.user.remove.error': 'Something went wrong when removing user with id \'{{id}}\'.',
    'crud.user.save.error': 'Something went wrong when trying to save a user...',
    'crud.project.save.success': 'A project with id \'{{id}}\' was saved successfully.',
    'crud.project.remove.success': 'A project with id \'{{id}}\' was removed successfully.',
    'crud.project.save.error': 'Something went wrong when saving a project...',
    'login.reason.notAuthorized': 'You do not have the necessary access permissions.  Do you want to login as someone else?',
    'login.reason.notAuthenticated': 'You must be logged in to access this part of the application.',
    'login.error.invalidCredentials': 'Login failed.  Please check your credentials and try again.',
    'login.error.emailVerificationIncomplete': 'You must verify your email address before you can access the system',
    'login.error.serverError': 'There was a problem with authenticating: {{exception}}.',
    'login.success': 'You have successfully logged in.',
    'logout.success': 'You have successfully logged out of your account.',
    'account.details.password.reset.email.sent': 'We\'ve sent an email to your registered email account.  Check your inbox for further instructions',
    'account.details.updated.success': 'Account details succesfully updated'
  });
  angular.module('app').config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.otherwise({ redirectTo: '/' });
    }
  ]);
  angular.module('app').run([
    'security',
    '$http',
    '$cookieStore',
    function (security, $http, $cookieStore) {
      var authTokenString = $cookieStore.get('authToken');
      if (authTokenString) {
        $http.defaults.headers.common['X-Auth-Token'] = authTokenString;
        security.requestCurrentUser();
      }
    }
  ]);
  angular.module('app').controller('AppCtrl', [
    '$scope',
    'i18nNotifications',
    'localizedMessages',
    function ($scope, i18nNotifications) {
      $scope.notifications = i18nNotifications;
      $scope.removeNotification = function (notification) {
        i18nNotifications.remove(notification);
      };
      $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
        i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, { rejection: rejection });
      });
    }
  ]);
  angular.module('app').controller('HeaderCtrl', [
    '$scope',
    '$location',
    '$route',
    'security',
    'breadcrumbs',
    'notifications',
    'httpRequestTracker',
    'config',
    function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker, config) {
      $scope.location = $location;
      $scope.breadcrumbs = breadcrumbs;
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.isAdmin = security.isAdmin;
      $scope.home = function () {
        $location.path('/');
      };
      $scope.config = config;
      $scope.isNavbarActive = function (navBarPath) {
        return navBarPath === breadcrumbs.getFirst().name;
      };
      $scope.hasPendingRequests = function () {
        return httpRequestTracker.hasPendingRequests();
      };
    }
  ]);
}(angular));