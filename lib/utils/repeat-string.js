/**
 * repeat string
 * @param {string} string : return string
 * @param {char} char : character to add to it
 * @param {number} n : number of `char` to add
 * @return {string} string
 */
module.exports = function repeatCharacter (num, str = ' ') {
	var string = '';
	for (num; num > 0; num -= 1) {
		string += str;
	}
	return string;
}
