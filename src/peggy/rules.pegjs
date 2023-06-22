start = result:(testFnCall / ignored_content)* {
	//return result
	return result.filter((match) => match.type !== 'ignored');
}

testFnCall = tags:docblock? _ fnName:testFnNames _ modifiers:testModifiers* "(" _ description:testDescription _ "," testFn:testFunction ")" _ ";"? {
	const nested = testFn.filter((match) => match?.type !== 'ignored');
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
standardFunction = _ "async"? _ "function" _ identifier? _ "(" _ functionArgs _ ")" _ "{" _ blockFns:(!"}" block:(testFnCall / ignored_content) _ { return block; })*  _ "}" _ { return blockFns; }
arrowFunction = _ "async"? _ "(" _ functionArgs _ ")" [ \t]* "=>" _ "{" _ blockFns:(!"}" block:(testFnCall / ignored_content) _ { return block; })*  _ "}" _ { return blockFns; }

docblock = _ "/**" inner:(!"*/" i:(code_tag)* { return i; }) "*/" _ { return inner.reduce((result, current) => { return {...result,...current}}, {}); }
code_tag = _ "* @" tag:($[a-zA-Z0-9_-]*) " " value:[ a-zA-Z0-9_-]* _ {
	const mTag = tag;
	const mVal = value.join('').split(' ');
	const result = { [mTag]: mVal };
	return result;
}

functionArgs = _ args:(arg:$fn_arg _ ","? _ { return arg; })* _ { return args; }
fn_arg =
	functionCall /
	function /
	string /
	identifier _ "="_ variable /
	identifier

expression =
	_ "(" _ v:(!")" assignment) _ ")" _ ";"? _ /
    assignment /
    functionCall /
		import

assignment = _ ("const" / "let" / "var")? _ i:$identifier _ "=" _ v:$variable _ ";"? _ {
	return {
		type: 'assignment',
		name: i,
		values: v
	}
}

functionCall = _ "await"? _ (identifier"." _)* name:identifier _ "(" _ args:(!")" functionArgs) _ ")" _ ";"? _ {
	return {
    	type: 'function call',
        name: name,
        args: args
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

variable =
	Array /
	Object /
	identifier /
	string /
	float /
	integer /
	boolean

Array = _ "[" _ val:(!"]" v:$variable _ ","? _  { return v; })* _ "]" _ { return val; }
Object =_ "{" _ pair:(!"}" k:ObjectKey v:ObjectValue? _ ","? _  { return [k,v]; })* _ "}" _ { return pair; }
ObjectKey = _ k:$(identifier / string / Array / integer) _ { return k; }
ObjectValue = _ ":" _ v:$variable _ { return v; }

boolean = "true" / "false"
float = integer? "." [0-9]+
integer = "-"? [0-9]+
string =
	"\"" text:$(!([^\\] "\"") .)* l:([^\\])"\"" { return text+l; } /
	"'" text:$(!([^\\] "'") .)* l:([^\\])"'" { return text+l; } /
	"`" text:$(!([^\\] "`") .)* l:([^\\])"`" { return text+l; }

identifier = first:[a-zA-Z_$] next:$([a-zA-Z_$0-9])* { return first+next; }

ignored_content =
	p:expression { return { type: 'ignored', content: p}; } /
	_ p:([^\n]+) _ { return { type: 'ignored', content: p.join('') }; }
_ = [ \t\r\n]* { return null; }