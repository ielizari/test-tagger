const { describe, expect, it } = require('@jest/globals');
const { parser: peggyParser } = require('../src/peggy/index.js');

/**
 * @tags peg pdp add_to_cart
 */
describe('PEGGY Test suite', () => {
  it('Detects nested dockblocks', () => {
    const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     * @tags_custom example-tag
     */
    describe('Test example', () => {
      const a = 1;

      /**
       * @tags_device mobile
       */
      it('nested it test', () => {
        const b = () => { console.log('not test arrow function')};
      })
    });
    `;
    const expectedResult = [{
      type: 'test',
      name: 'describe',
      test: 'Test example',
      modifiers: [],
      codeTags: {
        tags: [
          'pdp',
          'add_to_cart'
        ],
        tags_custom: [
          'example-tag'
        ]
      },
      nested: [{
        type: 'test',
        name: 'it',
        test: 'nested it test',
        modifiers: [],
        codeTags: {
          tags_device: ['mobile']
        },
        nested: []
      }]
    }];
    const analyzed = peggyParser.parse(fileWithDocBlock.trim());
    expect(analyzed).toStrictEqual(expectedResult);
  });

  describe('Test modifiers', () => {

    it.each(['skip', 'only', 'failing', 'concurrent'])(`detects '%s' modifier`, (modifier) => {
      const input = `
        /**
         * @tags ${modifier}
         */
        describe.${modifier}('Test example #1', ()=>{});
        `;

      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual([modifier]);
    });

    it('detects \'each\' modifier combined with "only" modifier', () => {
      const input = `
        /**
         * @tags modifiers each
         */
        describe.only.each([1,2,3])('Test example #1', (data)=>{});
        `;

      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual(['only',{type: 'each', values: ['1','2','3']}]);
    });

    it('detects unknown modifier', () => {
      const input = `
        /**
         * @tags unknown-modifier
         */
        describe.example('Test example #1', ()=>{});
        `;

      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual([{type: 'unknown', value: 'example'}]);
    });
  });
});