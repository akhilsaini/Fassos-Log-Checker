// This string matching module search for substring using the KMP algorithm.
module.exports = {
	searchPattern: function searchPattern(str, pat) {
		if (module.exports.isNumber(pat)) pat = '' + pat;
		if (module.exports.isNumber(str)) str = '' + str;
		if (!(module.exports.isString(str) || module.exports.isArray(str))) return -1;
		if (!(module.exports.isString(pat) || module.exports.isArray(pat))) return -1;

		var m = 0; // start of str
		var i = 0; // start of pat
		var t = module.exports.patternTable(pat);
		var patLength = pat.length;

		while (m + i < str.length) {
			if (pat[i] === str[m + i]) {
				if (i === patLength - 1) {
					return m;
				}
				i = i + 1;
			} else {
				if (t[i] > -1) {
					m = m + i - t[i];
					i = t[i];
				} else {
					i = 0;
					m = m + 1;
				}
			}
		}

		return -1;
	},
	patternTable: function patternTable(pat) {
		var t = [];
		var pos = 2; // current position in T
		var cnd = 0; // index in pat of the next character of the current candidate substring

		t[0] = -1;
		t[1] = 0;
		var patLength = pat.length;

		while (pos < patLength) {
			// substring continues
			if (pat[pos - 1] === pat[cnd]) {
				cnd = cnd + 1;
				t[pos] = cnd;
				pos = pos + 1;
				// it doesn't but we can fall back
			} else if (cnd > 0) {
				cnd = t[cnd];
				// we have run out of candidates
			} else {
				t[pos] = 0;
				pos = pos + 1;
			}
		}

		return t;
	},
	isString: function isString(v) {
		return typeof v === 'string' || v instanceof String;
	},
	isArray: function isArray(v) {
		return Array.isArray(v);
	},
	isNumber: function isNumber(v) {
		return !isNaN(v);
	}
}
