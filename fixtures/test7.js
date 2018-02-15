/**
 * @overview Test classes without methods.
 * @license MIT
 * @author Gabor Sar
 */

/**
 * Test class.
 *
 * @class Test
 * @param {*} a First parameter.
 * @param {*} b Second parameter.
 * @classdesc
 */
function Test(a, b) {

  /**
   * @member {*} Test.a First member.
   */
  this.a = a;

  /**
   * @member {*} b Second member is incorrectly documented so it won't show up.
   */
  this.b = b;

  /**
   * @member {Number} c Third member is incorrectly documented but explicitly assigned.
   * @memberof Test
   */
  this.c = 1;
}
