const { describe, expect, it } = require('@jest/globals');
const { parser: peggyParser } = require('../src/peggy/index.js');

/**
 * @tags peggy
 */
describe('PEGGY Test suite', () => {
  /**
   * @tags dockblock nested
   */
  describe('DocBlcoks', () => {
    it('Detects nested docblocks and custom docblocks', () => {
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
        autoTags: [],
        codeTags: {
          tags: [
            'pdp',
            'add_to_cart'
          ],
          custom: [
            'example-tag'
          ]
        },
        links: [],
        nested: [{
          type: 'test',
          name: 'it',
          test: 'nested it test',
          modifiers: [],
          autoTags: [],
          codeTags: {
            device: ['mobile']
          },
          links: [],
          nested: [],
          location: {
            source: undefined,
            start: { offset: 150, line: 8, column: 9 },
            end: { offset: 320, line: 14, column: 7 }
          }
        }],
        location: {
          source: undefined,
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 323, line: 14, column: 10 }
        }
      }];
      const analyzed = peggyParser.parse(fileWithDocBlock.trim());
      expect(analyzed).toStrictEqual(expectedResult);
    });

    it('Detects test documentation links in docblocks', () => {
      const fileWithDocBlock = `
        /**
         * @tags pdp
         * @tags_link 'Pînia actions' https://pinia.vuejs.org/core-concepts/actions.html
         * @tags_link 'Testing library - byRole' https://testing-library.com/docs/queries/byrole/
         */
        describe('Test example', () => {
          const a = 1;

          /**
           * @tags_link 'Nested test link' https://testing-library.com/
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
          autoTags: [],
          codeTags: {
            tags: [
              'pdp',
            ],
          },
          links: [
            {
              label: 'Pînia actions',
              src: 'https://pinia.vuejs.org/core-concepts/actions.html'
            },
            {
              label: 'Testing library - byRole',
              src: 'https://testing-library.com/docs/queries/byrole/'
            },
          ],
          nested: [{
            type: 'test',
            name: 'it',
            test: 'nested it test',
            modifiers: [],
            autoTags: [],
            codeTags: {},
            links: [
              {
                label: 'Nested test link',
                src: 'https://testing-library.com/'
              },
            ],
            nested: [],
            location: {
              source: undefined,
              start: { offset: 299, line: 9, column: 11 },
              end: { offset: 520, line: 15, column: 9 }
            }
          }],
          location: {
            source: undefined,
            start: { offset: 0, line: 1, column: 1 },
            end: { offset: 523, line: 15, column: 12 }
          }
        }];
        const analyzed = peggyParser.parse(fileWithDocBlock.trim());
        expect(analyzed).toStrictEqual(expectedResult);
      });
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
     * @tags each
     */
    it('detects \'each\' modifier when table is passed as a variable', () => {
      const input = "describe.only.each(table)('Test example #1', (data)=>{});";
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].modifiers).toStrictEqual(['only',{type: 'each', values: 'table'}]);
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
     * @tags conditional if new-line nested
     */
    it('detects nested tests containing conditional statement without curly braces', () => {
      const input = `
        describe('Test example with curly', ()=>{
          if (setPromosPerProduct) {
            doNothing()
          } else {
            if (index !== -1) doSomething();
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
     * @tags conditional if new-line nested
     */
    it('detects nested tests containing delete expression inside of an "else" conditional block', () => {
      const input = `
        describe('Test example with curly', ()=>{
          if (setPromosPerProduct) {
            doNothing()
          } else {
            delete obj.prop.val;
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
          ['a',2].forEach(status => {
            describe('a',  () => {
              it('c', () => {
              })
            });
          });
          anArray.forEach(status => {
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

    it('detects nested tests containing chained function call with new line', () => {
      const input = `
        describe('Test example with curly', ()=>{
          it('first test example', () => {
            lib
              .func('a', {
                key,
              })
          })
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('first test example');
      expect(analyzed[0].nested[1].test).toEqual('second test example');
    });

    /**
     * @tags function-call chain new-line nested
     */
    it('detects nested tests containing chained function call with optional chaining operator', () => {
      const input = `
        describe('Test example with curly', ()=>{
          obj = {
            keyA: otherObj?.prop,
            keyB: 2
          }
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

    /**
     * @tags variable destructuring new-line nested
     */
    it('detects nested tests containing variable declarations using destructuring to pick only the desired ones', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const { a, b } = mFunc({
            options
          })
          const [,,third,] = ...[
            {
              a, b,
            },
            2,
            3,
            4
          ]
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

    /**
     * @tags variable async function new-line nested
     */
    it('detects nested tests containing async function assignment', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const func = async (options) => {
            console.log('async func');
          }
          const func2 = async function () {
            console.log('async func2')
          }
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

    /**
     * @tags object chain new-line nested
     */
    it('detects nested tests object with keys obtained through chaining', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            obj2.key1.value,
            obj2.key1.value: 3,
            ...func().value,
            ...func().value: 5
          }
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

    /**
     * @tags array assignment new-line nested
     */
    it('detects nested tests containing assignment to an array element', () => {
      const input = `
        describe('Test example with curly', ()=>{
          myArray[2] = {
            key1: 1
          }
          myArray[index] = {
            key2: 2,
          }
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

    /**
     * @tags object comment new-line nested
     */
    it('detects nested tests containing an object declaration with multiple lines and one of them commented', () => {
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }
          it('second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
    });

     /**
     * @tags nested timeout
     */
     it('detects nested tests containing timeout param', () => {
      const input = `
        describe('Test example with timeout', ()=>{
          it('test example', () => {
            console.log('testing')
          },
          2000)
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with timeout');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    /**
     * @tags nested import
     */
     it('detects nested tests when there is a comment followed by import full library', () => {
      const input = `
        // a comment
        import '@my-library/lib'

        describe('Test example with import', ()=>{
          it('test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with import');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    /**
     * @tags nested class
     */
     it('detects nested tests when there is a comment followed by an unknown syntax with curly braces', () => {
      const input = `
        // Comment
        a senseless<<js(]syntax {
          aProp = '';
          // Comment on my method
          aMethod = jest.fn();
        }
        describe('Test example with class', ()=>{
          it('test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with class');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    /**
     * @tags for loop await
     */
    it('detects nested tests when there is a for...await of loop', () => {
      const input = `
        describe('Test example with await for', ()=>{
          it('test example', async () => {
            for await (const item of items) {
              const myvar = await screen.findByText(item.type);
              expect(myvar).toBeInTheDocument();
            }
          });
        });
      `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with await for');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    /**
     * @tags while loop
     */
    it('detects nested tests when there is a while loop', () => {
      const input = `
        describe('Test example with while loop', ()=>{
          it('test example', async () => {
            while (x == 1) {
              const myvar = await screen.findByText(item.type);
              expect(myvar).toBeInTheDocument();
            }
          });
        });
      `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with while loop');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    it('detects tests when there is a for of loop', () => {
      const input = `
      describe('Test example with for...of loop', () => {

        it('test example', async () => {
          for await (const participant of participants) {
            const linkType = await screen.findByText(participant.type);
            expect(linkType).toBeInTheDocument();
            for (const link of participant.links) {
              const i = 0;
            }
          }
        });
      });
      `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with for...of loop');
      expect(analyzed[0].nested[0].test).toEqual('test example');
    });

    /**
     * @tags object expression chain curly new-line nested
     */
      it('detects nested tests containing variable assignment of an empty object returned by an expression', () => {
      const input = `
        describe('Test example with empty object', ()=>{
          const a = ({

          });

          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with empty object');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });

    /**
     * @tags function object arguments default
     */
    it('detects nested tests containing function with object parameter and default value', () => {
      const input = `
        describe('Test example with empty object', ()=>{
          const a = ({ b = 'Desktop' }) => {
            return a;
          }

          it('Second test example', () => {
            console.log('testing')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim());
      expect(analyzed[0].test).toEqual('Test example with empty object');
      expect(analyzed[0].nested[0].test).toEqual('Second test example');
    });
  });

  describe('Automatic test tagging', () => {
    it('detects automatic tag when provided as string', () => {
      const config = {
        autotags: [
          'mytag'
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }
          it('second test example', () => {
            console.log('mytag')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
      expect(analyzed[0].nested[0].autoTags).toContain('mytag');
    });

    it('detects automatic tag when provided as object', () => {
      const config = {
        autotags: [
          {
            tag: 'mytag',
          }
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }
          it('second test example', () => {
            console.log('mytag')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
      expect(analyzed[0].nested[0].autoTags).toContain('mytag');
    });

    it('ignores autotag if it is disabled', () => {
      const config = {
        autotags: [
          {
            tag: 'mytag',
            disabled: true
          }
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }
          it('second test example', () => {
            console.log('mytag')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
      expect(analyzed[0].nested[0].autoTags).toHaveLength(0);
    });

    it('detects autotag if one of the matches in config array is found', () => {
      const config = {
        autotags: [
          {
            tag: 'mytag',
            disabled: false,
            match: ['similar', 'anothertag']
          }
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }
          it('second test example', () => {
            console.log('anothertag')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
      expect(analyzed[0].nested[0].autoTags).toContain('mytag');
    });

    it('detects autotag and docblock tag in the same test', () => {
      const config = {
        autotags: [
          {
            tag: 'mytag',
            disabled: false,
            match: ['similar', 'anothertag']
          }
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{
          const obj = {
            prop1: 1,
            // prop2: 2,
            prop2: 5, // a comment
          }

          /**
           * @tags manual-tag
           */
          it('second test example', () => {
            console.log('mytag')
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('second test example');
      expect(analyzed[0].nested[0].autoTags).toContain('mytag');
      expect(analyzed[0].nested[0].codeTags.tags).toContain('manual-tag');
    });

    it('detects automatic tag when it is part of a bigger string', () => {
      const config = {
        autotags: [
          {
            "tag": "autotag",
          },
        ]
      }
      const input = `
        describe('Test example with curly', ()=>{

          it('detects automatic tag when provided as string', () => {
            var autotags = 1;
            console.log('autotags included')
          });
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags });
      expect(analyzed[0].test).toEqual('Test example with curly');
      expect(analyzed[0].nested[0].test).toEqual('detects automatic tag when provided as string');
      expect(analyzed[0].nested[0].autoTags).toContain('autotag');
    });

    it('detects autotag into a function call argument', () => {
      const config = {
        autotags: [
          {
            "tag": "autotag",
          },
        ]
      }
      const input = `
        describe('Test example with function call as function argument', ()=>{
          it('test example', () => {
            expect(screen.getCompnent('autotag')).toBeInTheDocument();
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags});
      expect(analyzed[0].test).toEqual('Test example with function call as function argument');
      expect(analyzed[0].nested[0].test).toEqual('test example');
      expect(analyzed[0].nested[0].autoTags).toContain('autotag');
    });

    it('detects autotag into a function call argument passed as a regular expression', () => {
      const config = {
        autotags: [
          {
            "tag": "autotag",
          },
        ]
      }
      const input = `
        describe('Test example with function call as function argument', ()=>{
          it('test example', () => {
            expect(screen.getCompnent(/autotag/i)).toBeInTheDocument();
          })
        });
        `;
      const analyzed = peggyParser.parse(input.trim(), { autotags: config.autotags});
      expect(analyzed[0].test).toEqual('Test example with function call as function argument');
      expect(analyzed[0].nested[0].test).toEqual('test example');
      expect(analyzed[0].nested[0].autoTags).toContain('autotag');
    });
  });
});