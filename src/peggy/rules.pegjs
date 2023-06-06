{
	const blocks = [];
}

prueba = result:function* {
	return result;
}

start = result:item* {
	console.log(blocks);
	//return result;
	return result
		.filter((block) => block[0] === 'DOCBLOCK')
	 	.map((block) => block[1]);
}

item
	= code_tags /
		content_line

content_line = _ p:content _ {return ['CONTENT',p]}
content =  p:([^\n]+) {return p.join('')}

code_tags = _ p:docblock _ {return ['DOCBLOCK',p]}
docblock = "/**" inner:(!"*/" i:code_tag )* "*/" _ { return inner; }
code_tag = _ "* @" tag:[a-zA-Z0-9_-]* " " value:[ a-zA-Z0-9_-]* {
	const mTag = tag.join('');
	const mVal = value.join('');
	const result = { [mTag]: mVal };
	blocks.push(result);
	return result;
}

test_function = _ target_functions _ "(" _ string _ ")" _

target_functions =
	"describe" /
	"test" /
	"it"

function =
	_ "function" _ identifier _ functionArgs fn_content


functionArgs = _ "(" args:(!")" _ i:(variable) _ ","? { console.log('var', i); return i })* ")" { console.log('arrrgs', args); return args }
fn_content = _ "{" content:(!"}" i:. { return i })* _ "}" _ { return content.join('') }

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
	"\"" text:(!"\"" .)* "\"" { return text.join('')} /
	"'" text:(!"\"" .)* "'" { return text.join('')} /
	"`" text:(!"\"" .)* "`" { return text.join('')}

identifier = [a-zA-Z_$][a-zA-Z_$0-9]*

_ = [ \t\r\n]* {return null}

// start = result:item* {
// 	return result.filter(block => block[0] === 'DOCBLOCK');
// }

// item = doc / content_line

// content_line = _ p:content _ {return ['CONTENT',p]}

// content =  p:([^\n]+) {return p.join('')}
// doc = _ p:docblock {return ['DOCBLOCK',p]}

// single = '//' p:([^\n]*) {return p.join('')}

// docblock = "/**" inner:(!"*/" i:. {return i})* "*/" {return inner.join('')}

// _ = [ \t\r\n]* {return null}