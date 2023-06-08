const { describe, expect, it } = require('@jest/globals');
const { regexParse } = require('../src/regex/parser.js');
const { parser: peggyParser } = require('../src/peggy/index.js');

/**
 * @tags regex pdp add_to_cart
 */
describe.skip('RegEx Test suite', () => {
  it('Detects dockblock', () => {
    const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     */
    describe('Test example')
    `;
    const analyzed = regexParse(fileWithDocBlock);
    expect(analyzed).toHaveLength(1);
    expect(analyzed[0].tags).toHaveLength(1);
    expect(analyzed[0].tags[0].groups.itemName).toBe('tags');
    expect(analyzed[0].tags[0].groups.itemValue).toBe('pdp add_to_cart');
  });

  it('Detects multiple docblocks', () => {
    const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     * @description Prueba1
     */
    describe('Test example #1')

    /**
     * @tags plp add_to_cart
     * @description Prueba2
     */
    describe('Test example #2')
    `;

    const analyzed = regexParse(fileWithDocBlock);
    expect(analyzed).toHaveLength(2);
    expect(analyzed[0].tags).toHaveLength(2);
    expect(analyzed[0].tags[0].groups.itemName).toBe('tags');
    expect(analyzed[0].tags[0].groups.itemValue).toBe('pdp add_to_cart');
    expect(analyzed[0].tags[1].groups.itemName).toBe('description');
    expect(analyzed[0].tags[1].groups.itemValue).toBe('Prueba1');
    expect(analyzed[1].tags[0].groups.itemName).toBe('tags');
    expect(analyzed[1].tags[0].groups.itemValue).toBe('plp add_to_cart');
    expect(analyzed[1].tags[1].groups.itemName).toBe('description');
    expect(analyzed[1].tags[1].groups.itemValue).toBe('Prueba2');
  });
});

/**
 * @tags peg pdp add_to_cart
 */
describe('PEGGY Test suite', () => {
  it('Detects dockblock', () => {
    const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     */
    describe('Test example')
    `;
    const analyzed = peggyParser.parse(fileWithDocBlock);
  });

  it('Detects multiple docblocks', () => {
    const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     * @description Prueba1
     */
    describe('Test example #1')

    /**
     * @tags plp add_to_cart
     * @description Prueba2
     */
    describe('Test example #2')
    `;

    const analyzed = peggyParser.parse(fileWithDocBlock);
    console.log(analyzed);
    expect(analyzed).toHaveLength(2);
    expect(analyzed[0].tags).toHaveLength(2);
    expect(analyzed[0].tags[0].groups.itemName).toBe('tags');
    expect(analyzed[0].tags[0].groups.itemValue).toBe('pdp add_to_cart');
    expect(analyzed[0].tags[1].groups.itemName).toBe('description');
    expect(analyzed[0].tags[1].groups.itemValue).toBe('Prueba1');
    expect(analyzed[1].tags[0].groups.itemName).toBe('tags');
    expect(analyzed[1].tags[0].groups.itemValue).toBe('plp add_to_cart');
    expect(analyzed[1].tags[1].groups.itemName).toBe('description');
    expect(analyzed[1].tags[1].groups.itemValue).toBe('Prueba2');
  });
});

describe.only('Javascript parser', () => {
  it('Detects javascript functions', () => {
    const input = `
    describe('a');
      aleale()
      //asdasd
      function aleale(1, a) {
        console.log('vamooos');
        // nested function
        function probando() {
          console.log('esto es una prueba');
        }
        const p = (param) => {
          console.log(param);
        }
      }
      aleale()
      //asds

      describe('Tests pdp', () => {
        describe('Subgroup test', () => {
          test('pues eso')
        })
        it('otra prueba')
      });
    `;
    const analyzed = peggyParser.parse(input);
    console.log(analyzed);
  })
});