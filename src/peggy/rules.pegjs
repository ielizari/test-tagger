start = result:item* {
	return result.filter(block => block[0] === 'DOCBLOCK');
}

item = doc / content_line

content_line = _ p:content _ {return ['CONTENT',p]}

content =  p:([^\n]+) {return p.join('')}
doc = _ p:docblock {return ['DOCBLOCK',p]}

single = '//' p:([^\n]*) {return p.join('')}

docblock = "/**" inner:(!"*/" i:. {return i})* "*/" {return inner.join('')}

_ = [ \t\r\n]* {return null}