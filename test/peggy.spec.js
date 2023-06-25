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
   * @tags modifier
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

    /**
     * @tags each only
     */
    it('detects \'each\' modifier combined with "only" modifier', () => {
      const input = "describe.only.each([1,2,3])('Test example #1', (data)=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual(['only',{type: 'each', values: ['1','2','3']}]);
    });

    /**
     * @tags unknown
     */
    it('detects unknown modifier', () => {
      const input = "describe.example('Test example #1', ()=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual([{type: 'unknown', value: 'example'}]);
    });
  });

  /**
   * @tags javascript syntax
   */
  describe('Valid test syntax formats', () => {
    /**
     * @tags template-literal
     */
    it('detects test with name including template literal', () => {
      const input = "describe(`Test example #${count}`, ()=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example #${count}');
    });

    /**
     * @tags function standard
     */
    it('detects test function declared as function() {}', () => {
      const input = "describe('Test example', function (){});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].name).toEqual('describe');
    });

    /**
     * @tags space tabulation new-line
     */
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

    /**
     * @tags function arrow space tabulation new-line
     */
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

    /**
     * @tags double-quotes single-quotes string
     */
    it('detects test name in double quotes including single quotes', () => {
      const input = 'describe("Test example with \'single quotes\'", function (){});';
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual("Test example with 'single quotes'");
    });

    /**
     * @tags double-quotes single-quotes string
     */
    it('detects test name in single quotes including double quotes', () => {
      const input = "describe('Test example with \"double quotes\"', function (){});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with "double quotes"');
    });

    /**
     * @tags escaped single-quotes string
     */
    it('detects test with description including escaped single quotes', () => {
      const input = "describe('Test example with \\\'escaped single quotes\\\'', function (){});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual("Test example with \\\'escaped single quotes\\\'");
    });

    /**
     * @tags escaped double-quotes string
     */
    it('detects test with description including escaped double quotes', () => {
      const input = 'describe("Test example with \\\"escaped single quotes\\\"", function (){});';
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual("Test example with \\\"escaped single quotes\\\"");
    });

    /**
     * @tags escaped template-literal string
     */
    it('detects test with description including escaped template literal character', () => {
      const input = 'describe(`Test example with \\\`escaped single quotes\\\``, function (){});';
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual("Test example with \\\`escaped single quotes\\\`");
    });

    /**
     * @tags object curly new-line nested
     */
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
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags async function curly new-line nested
     */
    it('detects nested tests containing an async function call with a function argument with curly braces in multiple lines', () => {
      const input = `
        describe('Test example with curly', ()=>{
            myFunction(async () => {
              myLib.myOtherFunction();
            });
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags object curly new-line nested
     */
    it('detects nested tests containing an object with nested objects in multiple lines and numbers as keys', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const myObj = {
            1: {
              'key_one': {},
              'key_two': {}
            },
            2: {
              'keyone': {},
              'other_key[0]': {},
            },
          };
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment arrow-function argument objectcurly new-line nested
     */
    it('detects nested tests containing an assignment of an arrow function with an object as argument', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const myObj = ({
            argKey1,
            argKey2
          }) => {
            console.log('test);
          }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment arrow-function argument object spread curly new-line nested
     */
    it('detects nested tests containing an assignment of an arrow function with an object as argument', () => {
      const input = `
        describe('Test example with curly', ()=>{
          let myvar;
          myvar = aFunction({
            ...mFunc()
          });
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment arrow-function argument object return curly new-line nested
     */
    it('detects nested tests containing an assignment of an arrow function with return statement \
    of a function call with an object arg in multiple lines', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const aFunction = (args) => {
            return mFunc({
              a
            });
          });
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment object merge spread curly new-line nested
     */
    it('detects nested tests containing an assignment of an object composed with a merge of multiple spreaded objects in multiple lines', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const aFunction = {
            ...obj1,
            ...obj2,
          };
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment object curly new-line nested
     */
    it('detects nested tests containing an assignment to an object contained in another', () => {
      const input = `
        describe('Test example with curly', ()=>{
          window.obj = lib.fn(function() {
            this.anotherFn = lib.fn2();
          })
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags assignment object curly new-line nested
     */
    it('detects nested tests containing an object with a value obtained through a function call', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop: lib.fn2();
          }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags function-call chained object curly new-line nested
     */
    it('detects nested tests containing a function call with chained object accessor', () => {
      const input = `
        describe('Test example with curly', ()=>{
          func(obj.nested.el, {
            prop: 1,
          })
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags function-call chained curly new-line nested
     */
    it('detects nested tests containing a function call with chained object accessor', () => {
      const input = `
        describe('Test example with curly', ()=>{
          func(obj).func2({
            prop: 1,
          })
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags function-call chained return curly new-line nested
     */
    it('detects nested tests containing a chained function call with a return statement', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const formattedProduct = map((cProduct) => {
            return {
              data: cProduct,
            };
          });
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags conditional if else else-if return curly new-line nested
     */
    it('detects nested tests containing conditional statements', () => {
      const input = `
        describe('Test example with curly', ()=>{
          if (payload.type === 'skus') {
                return getStockResponse();
              } else if (payload.type === 'product'){
                return getStockByProductResponse();
              }else{
                yipikayey()
              }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags object string empty curly new-line nested
     */
    it('detects nested tests containing object assignment with empty string value', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            'my-key': '',
          }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags function-call direct empty curly new-line nested
     */
    it('detects nested tests containing test function call returning a function call without curly braces', () => {
      const input = `
        describe('Test example with curly', ()=>{
          it('direct fn', () => example());
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('direct fn');
      expect(analyzed[0].nested[1].test).toEqual('Second test example');
    });

    /**
     * @tags function-call return empty curly new-line nested
     */
    it('detects nested tests containing test function call returning a variable without curly braces', () => {
      const input = `
        describe('Test example with curly', ()=>{
          it('direct fn', () => example);
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('direct fn');
      expect(analyzed[0].nested[1].test).toEqual('Second test example');
    });

    /**
     * @tags object function-declaration curly new-line nested
     */
    it('detects nested tests containing object with a function declaration without keyword "function"', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            func() {
              console.log('my func')
            }
          }
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags object function-call chain curly new-line nested
     */
    it('detects nested tests containing object chained function call with argument not including parenthesis', () => {
      const input = `
        describe('Test example with curly', ()=>{
          obj.forEach(item => {
            console.log('my item')
          })
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags regex curly new-line nested
     */
    it('detects nested tests containing regular expressions', () => {
      const input = `
        describe('Test example with curly', ()=>{
          it('test regex', () => expect(wrapper.getByText(/footer.newsletter.subtitle/i)).toBeInTheDocument())
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('test regex');
      expect(analyzed[0].nested[1].test).toEqual('Second test example');
    });

    /**
     * @tags regex comment curly new-line nested
     */
    it('detects nested tests when there is a commented line (conflict with regex rule)', () => {
      const input = `
        // code comment
        describe('Test example with curly', ()=>{
          it('test regex', () => expect(wrapper.getByText(/footer.newsletter.subtitle/i)).toBeInTheDocument())
          // another comment
          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('test regex');
      expect(analyzed[0].nested[1].test).toEqual('Second test example');
    });

    /**
     * @tags function-call new-line nested
     */
    it('detects nested tests inside non-test function calls', () => {
      const input = `
        describe('Stock', () => {
          forEach(status => {
            describe('a',  () => {
              it('c', () => {
              })
            });
          });
        forEach(status => {
            it('b',  () => {
            });
          });
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Stock');
      expect(analyzed[0].nested[0].test).toEqual('a');
      expect(analyzed[0].nested[0].nested[0].test).toEqual('c');
      expect(analyzed[0].nested[1].test).toEqual('b');
    });

  });
});