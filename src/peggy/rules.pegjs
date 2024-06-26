{
	const TYPES = Object.freeze({
		FUNCTION_CALL: 'function call',
		IGNORED_CONTENT: 'ignored',
		TEST: 'test',
		IMPORT: 'import',
		EACH: 'each',
		ASSIGNMENT: 'assignment',
		UNKNOWN_MODIFIER: 'unknown',
	})
  const tags = getAutotagConfig();

	function getAutotagConfig () {
		if (!Array.isArray(options.autotags)) return [];
		return options.autotags
			.filter((tag) => {
				return !tag.disabled;
			})
			.map((tag) => {
				if(typeof tag === 'string') return [tag.toLowerCase()];
				return tag.match ? [tag.tag].concat(tag.match).map(item => item.toLowerCase()) : [tag.tag.toLowerCase()];
			})
			//.flat(Number.POSITIVE_INFINITY);
	}
	function autotag(item, testDescription) {
		let testAutoTags = [];
		if (testDescription) {
			tags.forEach((tagList) => {
				const match = matchesTag(tagList, testDescription);
				if(match) {
					testAutoTags.push(match);
				}
			});
		}
		if(item?.type === TYPES.IGNORED_CONTENT) {
			// tags.forEach((tagList) => {
			// 	const match = matchesTag(tagList, item.content)
			// 	if(match){
			// 		testAutoTags.push(match);
			// 	}
			// });
		} else if (item?.type === TYPES.FUNCTION_CALL) {
			// tags.forEach((tagList) => {
			// 	const argMatch = matchesTag(tagList, item.args);
			// 	const nameMatch = matchesTag(tagList, item.name);
			// 	if(argMatch || nameMatch) {
			// 		testAutoTags.push(tagList[0]);
			// 	}
			// });
		} else if (item?.type === TYPES.TEST) {
			// tags.forEach((tagList) => {
			// 	const match = matchesTag(tagList, item.test);
			// 	if(match) {
			// 		testAutoTags.push(match);
			// 	}
			// });
		}
		return testAutoTags;
	}

	function isString (str) {
		return 'string' === typeof str;
	}
	function stringMatch (str, match) {
		return isString(str) && isString(match) && str.toLowerCase().includes(match.toLowerCase());
	}

	function arrayMatch (arr, match) {
		if (!isString(match)) return false;
		if(isString(arr)) {
			return stringMatch(arr, match);
		}	else if (Array.isArray(arr)) {
			return arr.some((item) => {
				if (!item) return false;
				if (isString(item)) {
					return item.includes(match);
				} else if ('object' === typeof item) {
					return Object.values(item).some(el => arrayMatch(el, match));
				}
			});
		}
	}

	function matchesTag(tagList, content) {
		let cont;
		if(typeof content === 'string') {
			cont = content.toLowerCase();
		} else if(Array.isArray(content)) {
			cont = content.map((item) => typeof item === 'string' ? item.toLowerCase() : item);
		}
		return tagList.some(tag => arrayMatch(cont, tag)) ? tagList[0] : undefined;
	}
}
start "entrypoint" = result:(testFnCall / ignored_content)* {
	//return result
	return result.filter((match) => match.type !== TYPES.IGNORED_CONTENT);
}

testFnCall "test function call" = tags:docblock? _ fnName:testFnNames _ modifiers:testModifiers* "(" _ description:testDescription _ "," testFn:testFunction ( _ "," _ variable _)? _ ")" _ ";"? _ {
	let nested = [];
	const flatResults = Array.isArray(testFn) ? testFn.flat(Number.POSITIVE_INFINITY) : [];
	const autoTags = flatResults.reduce((total, current) => {
		const tags = autotag(current, description);
		return total.concat(tags).filter((tag, index, array) => array.indexOf(tag) === index);
	},[]);

	if(Array.isArray(testFn)) {
		nested = flatResults.filter((match) => match?.type === TYPES.TEST);
	} else {
		if (testFn?.type === TYPES.TEST) {
			nested.push(testFn);
		}
	}
    //nested=testFn.flat(Number.POSITIVE_INFINITY)
	const { links, ...codeTags } = tags ?? {};
	return {
		type: TYPES.TEST,
    name: fnName,
		test: description,
    modifiers: modifiers,
    codeTags: codeTags,
    autoTags: autoTags,
		links: links ?? [],
		nested: nested,
		location: location()
	}
}

testFnNames "test function names" =
	"describe" /
	"test" /
	"it"

testModifiers "test modifiers" = _ "." _ mod:("skip" / "only" / "failing" / "concurrent" / eachModifier / unknownModifier) _ { return mod; }
eachModifier "each modifier" = "each" _ "(" _ a:(Array / identifier / functionCall)? _ ")" { return { type: TYPES.EACH, values: a }; }
unknownModifier "unknown modifier" =  i:identifier { return { type: TYPES.UNKNOWN_MODIFIER, value: i }; }

testDescription "test description" =
	string /
  identifier

block "block" = _ !"}" block:(
	conditional /
	testFnCall /
	functionCall /
	function /
	expression /
	variable /
	ignored_content
	) _ { return block; }

testFunction "test function" = standardFunction / arrowFunction
standardFunction "standard function" = _ "async"? _ "function"? _ identifier? _ "(" _ functionArgs? _ ")" _ "{" _ blockFns:(block)*  _ "}" _ { return blockFns; }
arrowFunction "arrow function" = _ "async"? _ arrowFnArgs [ \t]* "=>" _ b:(curlyBlock / directBlock) _ { return b;}
arrowFnArgs "arrow function args" = _ "(" _ functionArgs? _ ")" _ / _ identifier _
directBlock "direct block" = _ block:(testFnCall / ignored_content) _ { return block; }
curlyBlock "curly block" = _ "{" _ "return"? _ blockFns:(!"}" block:(
	conditional /
	testFnCall /
	functionCall /
	function /
	expression /
	variable /
	ignored_content
	) _ { return block; })*  _ "}" _ { return blockFns; }

docblock "docblock" = _ "/**" inner:(!"*/" i:(code_tag)* { return i; }) "*/" _ {
let tags = [];
let links = [];
for (const item of inner) {
	if (item.tags) {
   		tags = tags.concat(item.tags);
    }
    if (item.links) {
    	links = links.concat(item.links);
    }
}
const items = inner.reduce((result, current) => { return {...result,...current}}, {});
const result = {
	...items,
    ...(tags.length && {tags: tags}),
    ...(links.length && {links: links}),
}

return result;
}
code_tag "code tag" = string_tag / link_tag / custom_tag

array_tag "array tag" =  _ "* @tags_EXTRA" _ ":" _ Array

//string_tag "string tag" = _ "* @tags" tag:($[a-zA-Z0-9_-]*) " " value:[ a-zA-Z0-9_-]* _ {
string_tag "string tag" = _ "* @tags " value:[ a-zA-Z0-9_-]* _ {
	const mVal = value.join('').split(' ');
	const result = { tags: mVal };
	return result;
}

link_tag "link tag" = _ "* @tags_link " label:(string) " " src:(text { return text().trim();}) _ {
	return { links: [{ label, src}] };
}

custom_tag "custom tag" = _ "* @tags_" label:([a-zA-Z0-9-]+ { return text().trim(); }) " " value:[ a-zA-Z0-9_-]*_ {
	const mVal = value.join('').split(' ');
	const result = { [label]: mVal };
	return result;
}

text "text" = (!whitespace .)+

whitespace "whitespace"
  = [ \t\v\f\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]
eolChar
  = [\n\r\u2028\u2029]
eol "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

functionArgs "function arguments" = _ args:(arg:fn_arg _ ","? _ { return arg; })* _ { return args; }
fn_arg "function argument" =
	function /
	functionCall /
	objectFnArgs /
	assignment /
	variable /
	identifier _ "="_ variable /
	expression

objectFnArgs "object args" = _ "{" _ pair:(!"}" k:(spreadOperator? _ ObjectKey (_ "." _ ObjectKey _)*) v:(spreadOperator? _ ObjectFnArgValue?)? _ ","? _  { return [k,v]; })* _ "}" _ { return pair; }
ObjectFnArgValue "object value" = _ ("="/":") _ v:(function/functionCall/$variable) _ { return v; }

expression "expression" =
	conditional /
	_ "(" _ v:(!")" (variable/assignment)) _ ")" _ ";"? _ /
  assignment /
  functionCall /
	loop /
	import /
  $delete /
  return /
	mathOperator

assignment "assignment" = _ ("const" / "let" / "var")? _ i:assignmentOperands _ "=" _ v:(function/functionCall/expression/$variable) _ ";"? _ {
	return {
		type: TYPES.ASSIGNMENT,
		name: i,
		values: v
	}
}

assignmentOperands "assignment operands" =
    "{" _ !"}"_ i:assignmentVariable+ _ "}" _ { return i} /
    "[" _ !"]"_ i:(assignmentVariable / _ "," _ )+ _ "]" _ { return i} /
	assignmentVariable

assignmentVariable "variable assignment" = _ v:((identifier _ "." _)* i:$identifier _ ","?)+ _ { return v}

functionCall "function call" = _ "return"? _ "await"? _ (spreadOperator / notOperator)? _ ((identifier/variable) _ "." _)* name:identifier _ "(" _ args:(!")" functionArgs)? _ ")" _ ("." _ functionCall)* _ ("." _ identifier)? _ ";"? _ {
	const nested = Array.isArray(args) ? args.filter(arg => arg).flat(Number.POSITIVE_INFINITY) : new Array(args);
	const nestedTests = nested.filter(item => item?.type === TYPES.TEST)
	if (nestedTests.length) return nestedTests;
    return {
    	type: TYPES.FUNCTION_CALL,
			name: name,
			args: nested,
    }
}

function "function" =
	standardFunction /
	arrowFunction

import "import" = _ "import" _ "{"? _ i:(v:$(identifier/"*") _ ","? { return v; })*  _ "}"? _ "from"? _ string _ ";"? _ {
	return {
		type: TYPES.IMPORT,
		names: i
	}
}

loop "loop" =
	forOfLoop /
	whileLoop

forOfLoop "for of loop" = _ "for" _ "await"? _ "(" _  ("const" / "let" / "var") _ (variable) _  "of" _ (variable / functionCall) _ ")" _ block:("{" _ blockFns:(block)*  _ "}" _ { return blockFns; })? _
whileLoop "while loop" = _ "while" _ conditionalContent _
conditional "conditional" = _ "if" _ i:conditionalContent _ ("else if" _ conditionalContent)? _ ("else" _ conditionalContent)? _ {
	return {
    	type: TYPES.IGNORED_CONTENT,
    };
}
conditionalContent "conditional content" = _ ("(" _ (!")" notOperator? _ (comparison / variable)) _ (logicalOperator _ (comparison / variable))* _ ")")? _ conditionalBlock _
conditionalBlock "conditional block" = _ "{" _ (!"}" (testFnCall/ignored_content) _ )* _ "}" _

return "return statement" = _ "return" _ (function / functionCall / comparison / variable)? _ ";"? _
delete "delete statement" = _ "delete" _ f:$(identifier v:$(_ "." _ identifier _)*) _ ";"? _

variable "variable" =
	Array /
	Object /
	identifier _ "?"? (_ "." _ identifier)* /
	string /
	float /
	integer /
	boolean

Array "array" = _ "[" _ val:(!"]" spreadOperator? v:(function/functionCall/$variable) _ ","? _  { return v; })* _ "]" _ { return val; }
Object "object" =_ "{" _ pair:(!"}" k:(spreadOperator? _ ObjectKey (_ "." _ ObjectKey _)*) v:(spreadOperator? _ ObjectValue?) _ ","? _  { return [k,v]; })* _ "}" _ { return pair; }
ObjectKey "object key" = _ k:$(function / functionCall / identifier / string / Array / integer / ignored_content) _ { return k; }
ObjectValue "object value" = _ ":" _ v:(function/functionCall/$variable) _ { return v; }

boolean "boolean" = "true" / "false"
float "float" = integer? "." [0-9]+
integer "integer" = "-"? [0-9]+
string "string" =
	"\"\"" /
	"''" /
    "``" /
	"\"" _ text:$(!([^\\] "\"") .)* l:([^\\]) _ "\"" { return text+l; } /
	"'" _ text:$(!([^\\] "'") .)* l:([^\\]) _ "'" { return text+l; } /
	"`" _ text:$(!([^\\] "`") .)* l:([^\\]) _ "`" { return text+l; } /
  $regex

mathOperator "math operator" = "+" / "-" / "/" / "*" / "^"
typeOperator "type operator" = "typeof" / "instanceof"
bitwiseOperator "bitwise operator" = "&" / "|" / "~" / "^" / "<<" / ">>" / ">>>"
logicalOperator "logical operator" = "&&" / "||" / notOperator
notOperator "not operator" = "!"
comparisonOperator "comparison operator" = "===" / "!==" / "==" / "!=" / "<=" / "<" / ">=" / ">" / "??" / "?"
spreadOperator "spread operator" = "..."

operand "operand - variable" = variable
comparison "comparison" = _ operand _ comparisonOperator _ operand _

regex "regex" = _ !singleLineComment "/" text:$(!([^\\] "/") .)* l:([^\\]) "/" [igm]* _
comment "single line comment" = singleLineComment
singleLineComment = _ "//" p:$([^\n]*) _ {return p }

identifier "identifier" = first:[a-zA-Z_$] next:$([a-zA-Z_$0-9])* accessor:$("[" _ !"]" variable _ "]")* { return first+next; }

ignored_content "ignored content" =
	p:$comment { return { type: TYPES.IGNORED_CONTENT, location: location(), content: p}; } /
	p:$expression { return { type: TYPES.IGNORED_CONTENT, location: location(), content: p}; } /
	p:$variable { return { type: TYPES.IGNORED_CONTENT, location: location(), content: p}; } /
  p:$function { return { type: TYPES.IGNORED_CONTENT, location: location(), content: p}; } /
	p:$([^\n]+) _ { return { type: TYPES.IGNORED_CONTENT, location: location(), content: p}; }

_ = [ \t\r\n]* { return null; }