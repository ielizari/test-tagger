const { describe, expect, it } = require('@jest/globals');
const { parser: peggyParser } = require('../src/peggy/index.js');

/**
 * @tags peggy
 */
describe('PEGGY Test suite', () => {
  /**
   * @tags dockblock nested
   */
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
        nested: [],
        location: {
          source: undefined,
          start: { offset: 136, line: 8, column: 7 },
          end: { offset: 294, line: 14, column: 5 }
        }
      }],
      location: {
        source: undefined,
        start: { offset: 0, line: 1, column: 1 },
        end: { offset: 297, line: 14, column: 8 }
      }
    }];
    const analyzed = peggyParser.parse(fileWithDocBlock.trim());
    expect(analyzed).toStrictEqual(expectedResult);
  });

  /**
   * @tags test-modifiers
   */
  describe('Test modifiers', () => {

    /**
     * @tagsLoopValues skip only failing concurrent
     */
    it.each(['skip', 'only', 'failing', 'concurrent'])(`detects '%s' modifier`, (modifier) => {
      const input = `describe.${modifier}('Test example #1', ()=>{});`;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual([modifier]);
    });

    it('detects \'each\' modifier combined with "only" modifier', () => {
      const input = "describe.only.each([1,2,3])('Test example #1', (data)=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual(['only',{type: 'each', values: ['1','2','3']}]);
    });

    it('detects unknown modifier', () => {
      const input = "describe.example('Test example #1', ()=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual([{type: 'unknown', value: 'example'}]);
    });
  });

  describe('Valid test syntax formats', () => {
    it('detects test with name including template literal', () => {
      const input = "describe(`Test example #${count}`, ()=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example #${count}');
    });

    it('detects test function declared as function() {}', () => {
      const input = "describe('Test example', function (){});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].name).toEqual('describe');
    });

    it('detects test function call including valid javascript spaces, tabulations and new lines', () => {
      const input = `
        describe 
          (
        'Test example'
        , 
            function 
            (  a
              ,
              
              b
              )
            {



            }
            );
      `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].name).toEqual('describe');
    });

    it('detects test function call with arrow function including valid javascript spaces, tabulations and new lines', () => {
      const input = `
        describe 
          (
        'Test example'
        , 
             
            (  a
              ,
              
              b
              )            =>
            {



            }
            );
      `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].name).toEqual('describe');
    });

    it('detects test name in double quotes including single quotes', () => {
      const input = 'describe("Test example with \'single quotes\'", function (){});';
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual("Test example with 'single quotes'");
    });

    it('detects test name in single quotes including double quotes', () => {
      const input = "describe('Test example with \"single quotes\"', function (){});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with "single quotes"');
    });

    it('detects nested tests when contains an object assignment with curly braces in multiple lines, with and without semicolon', () => {
      const input = `
        describe('Test example with curly', ()=>{
            const obj = {
              prop: 1,
            };
            const obj2 = {
              prop: 2,
            }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      console.log(analyzed)
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });
  });
});