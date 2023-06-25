start = result:(testFnCall / ignored_content)* {
	//return result
	return result.filter((match) => match.type !== 'ignored');
}

testFnCall = tags:docblock? _ fnName:testFnNames _ modifiers:testModifiers* "(" _ description:testDescription _ "," testFn:testFunction ")" _ ";"? _ {
	let nested = [];
	if(Array.isArray(testFn)) {
		nested = testFn.flat(Number.POSITIVE_INFINITY).filter((match) => match.type && match.type === 'test');
	} else {
		if (testFn.type && testFn.type === 'test') {
			nested.push(testFn);
		}
	}
	return {
		type: 'test',
    name: fnName,
		test: description,
    modifiers: modifiers,
    codeTags: tags,
		nested: nested,
		location: location()
	}
}

testFnNames =
	"describe" /
	"test" /
	"it"

testModifiers = _ "." _ mod:("skip" / "only" / "failing" / "concurrent" / eachModifier / unknownModifier) _ { return mod; }
eachModifier = "each" _ "(" _ a:Array? _ ")" { return { type: 'each', values: a }; }
unknownModifier =  i:identifier { return { type: 'unknown', value: i }; }

testDescription =
	string /
  identifier

testFunction = standardFunction / arrowFunction
standardFunction = _ "async"? _ "function"? _ identifier? _ "(" _ functionArgs? _ ")" _ "{" _ blockFns:(!"}" block:(testFnCall / ignored_content) _ { return block; })*  _ "}" _ { return blockFns; }
arrowFunction = _ "async"? _ arrowFnArgs [ \t]* "=>" _ b:(curlyBlock / directBlock) _ { return b;}
arrowFnArgs = _ "(" _ functionArgs? _ ")" _ / _ identifier _
directBlock = _ block:(testFnCall / ignored_content) _ { return block; }
curlyBlock = _ "{" _ "return"? _ blockFns:(!"}" block:(conditional / testFnCall / functionCall / function / ignored_content) _ { return block; })*  _ "}" _ { return blockFns; }

docblock = _ "/**" inner:(!"*/" i:(code_tag)* { return i; }) "*/" _ { return inner.reduce((result, current) => { return {...result,...current}}, {}); }
code_tag = _ "* @" tag:($[a-zA-Z0-9_-]*) " " value:[ a-zA-Z0-9_-]* _ {
	const mTag = tag;
	const mVal = value.join('').split(' ');
	const result = { [mTag]: mVal };
	return result;
}

functionArgs = _ args:(arg:fn_arg _ ","? _ { return arg; })* _ { return args; }
fn_arg =
	function /
	functionCall /
	variable /
	identifier _ "="_ variable

expression =
	_ "(" _ v:(!")" assignment) _ ")" _ ";"? _ /
  assignment /
  functionCall /
	import /
  return

assignment = _ ("const" / "let" / "var")? _ (identifier"." _)* i:$identifier _ "=" _ v:(functionCall/function/$variable) _ ";"? _ {
	return {
		type: 'assignment',
		name: i,
		values: v
	}
}

functionCall = _ "return"? _ "await"? _ (spreadOperator / notOperator)? _ ((identifier/variable) _ "." _)* name:identifier _ "(" _ args:(!")" functionArgs)? _ ")" _ ("." _ functionCall)* _ ";"? _ {
	const nested = Array.isArray(args) ? args.filter(arg => arg).flat(Number.POSITIVE_INFINITY) : new Array(args);
	const nestedTests = nested.filter(item => item?.type === 'test')
	if (nestedTests.length) return nestedTests;
    return {
    	type: 'function call',
        name: name,
        args: nested,
    }
}

function =
	standardFunction /
	arrowFunction

import = _ "import" _ "{"? _ i:(v:$(identifier/"*") _ ","? { return v; })+  _ "}"? _ "from" _ string _ ";" _ {
	return {
		type: 'import',
		names: i
	}
}


conditional = _ "if" _ i:conditionalContent _ ("else if" _ conditionalContent)? _ ("else" _ conditionalContent)? _ {
	return {
    	type: 'ignored',
    };
}
conditionalContent = _ "(" _ (!")" (comparison / variable)) _ (logicalOperator _ (comparison / variable))* _ ")" _ "{" _ (!"}" (testFnCall/ignored_content) _ )* _ "}" _ 

return = _ "return" _ (function / functionCall / comparison / variable)? _ ";"? _

variable =
	Array /
	Object /
	identifier _ "?"? (_ "." _ identifier)* /
	string /
	float /
	integer /
	boolean

Array = _ "[" _ val:(!"]" v:$variable _ ","? _  { return v; })* _ "]" _ { return val; }
Object =_ "{" _ pair:(!"}" k:(spreadOperator? _ ObjectKey) v:(spreadOperator? _ ObjectValue?) _ ","? _  { return [k,v]; })* _ "}" _ { return pair; }
ObjectKey = _ k:$(function / functionCall / identifier / string / Array / integer) _ { return k; }
ObjectValue = _ ":" _ v:(function/functionCall/$variable) _ { return v; }

boolean = "true" / "false"
float = integer? "." [0-9]+
integer = "-"? [0-9]+
string =
	"\"\"" /
	"''" /
    "``" /
	"\"" _ text:$(!([^\\] "\"") .)* l:([^\\]) _ "\"" { return text+l; } /
	"'" _ text:$(!([^\\] "'") .)* l:([^\\]) _ "'" { return text+l; } /
	"`" _ text:$(!([^\\] "`") .)* l:([^\\]) _ "`" { return text+l; } /
    regex

typeOperator = "typeof" / "instanceof"
bitwiseOperator = "&" / "|" / "~" / "^" / "<<" / ">>" / ">>>"
logicalOperator = "&&" / "||" / notOperator
notOperator = "!"
comparisonOperator = "===" / "!==" / "==" / "!=" / "<=" / "<" / ">=" / ">" / "??" / "?"
spreadOperator = "..."

operand = variable
comparison = _ operand _ comparisonOperator _ operand _

regex = _ !singleLineComment "/" text:$(!([^\\] "/") .)* l:([^\\]) "/" [igm]* _
comment = singleLineComment
singleLineComment = _ "//" p:$([^\n]*) {return p }

identifier = first:[a-zA-Z_$] next:$([a-zA-Z_$0-9])* { return first+next; }

ignored_content =
	p:expression { return { type: 'ignored', location: location(), content: p}; } /
	p:variable { return { type: 'ignored', location: location(), content: p}; } /
    p:function { return { type: 'ignored', location: location(), content: p}; } /
	_ p:([^\n]+) _ { return { type: 'ignored', location: location(), content: p.join('') }; }
_ = [ \t\r\n]* { return null; }