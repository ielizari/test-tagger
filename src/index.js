const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;

const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     * @description Prueba1
     */
    describe('Test example #1', () => {
      console.log('veenga')
    });

    /**
     * @tags pdp add_to_cart
     * @description Prueba2
     */
    describe('Test example #2', () => {
      console.log('veenga2')
      /**
       * @tags finance
       */
      describe('Inner test', () => {
        console.log('vamos');
      });
    });
    `;



//regexParse(fileWithDocBlock);
const result = peggyParser.parse(fileWithDocBlock);
console.log(result)

