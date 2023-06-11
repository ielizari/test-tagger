
prueba = result:(testFnCall / ignored_content)* {
	//return result
	return result.filter((match) => match.type !== 'ignored');
}

testFnCall = tags:docblock? fnName:testFnNames modifiers:testModifiers* "(" _ description:testDescription _ "," testFn:testFunction ")" _ ";"? {
	const nested = testFn.filter((match) => match?.type !== 'ignored');
	return {
		type: 'test',
    name: fnName,
		test: description,
    modifiers: modifiers,
    codeTags: tags,
		nested: nested,
	}
}

testFnNames =
	"describe" /
	"test" /
	"it"

testModifiers = _ "." _ mod:("skip" / "only" / "each" / "failing" / "concurrent" / identifier) _ { return mod; }

testDescription =
	string /
  identifier

testFunction = _ "(" functionArgs* ")" _ "=>" _ "{" _ blockFns:(!"}" block:(testFnCall / ignored_content) _ { return block; })*  _ "}" _ { return blockFns }

docblock = _ "/**" inner:(!"*/" i:(code_tag)* { return i; }) "*/" _ { return inner.reduce((result, current) => { return {...result,...current}}, {}); }
code_tag = _ "* @" tag:($[a-zA-Z0-9_-]*) " " value:[ a-zA-Z0-9_-]* _ {
	const mTag = tag;
	const mVal = value.join('').split(' ');
	const result = { [mTag]: mVal };
	return result;
}

functionArgs = _ "(" args:(!")" _ arg:$fn_arg _ ","? { return arg })* ")" _ { return args }
fn_arg =
	//functionCall /
	//function /
	string /
	identifier _ "="_ variable /
	identifier

variable =
	identifier /
	string /
	float /
	integer /
	boolean

boolean = "true" / "false"
float = integer? "." [0-9]+
integer = "-"? [0-9]+
string =
	"\"" text:$(!"\"" .)* "\"" { return text } /
	"'" text:$(!"'" .)* "'" { return text } /
	"`" text:$(!"`" .)* "`" { return text }

identifier = first:[a-zA-Z_$] next:$([a-zA-Z_$0-9])* { return first+next }

ignored_content = _ p:([^\n]+) _ {return { type: 'ignored', content: p.join('')}}
_ = [ \t\r\n]* {return null}