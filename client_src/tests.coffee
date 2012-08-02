root = exports ? window

compareJsonPaths = (p1, p2) ->
    if p1.length != p2.length 
        return false
    equal = true
    for i in [0..p1.length - 1]
        equal = equal and (p1[i] == p2[i])
    return equal

$(document).ready () ->
    
module "Load document"

test "Load a new document", () ->
    stop()
    openDoc "test" + new Date().getTime(), $('<div id="qunit-fixture"/>').get(0), (error, doc, div) ->
        ok _observer?, "Observer running"
        ok not error?, "No errors when loading document"
        ok doc?, "Document was loaded"
        ok div?, "Content installed in DOM"
        start()
        
load = () ->
    content = $('<div id="content"/>')
    $('<div id="qunit-fixture"/>').append(content)
    stop()
    openDoc "test" + new Date().getTime(), content.get(0), (error, doc, div) ->
        root._rootDiv = $(div)
        ok not error?, "No errors when loading document"
        start()

module "DOM to JSON", {setup: load}

test "Add element to DOM", () ->
    newElement = $('<div someattr="foo"/>')
    stop()
    _doc.on 'change', (ops) ->
        start()
        op = ops[0]
        ok op?, "Update received"
        ok op.li?, "Op was list insert"
        ok compareJsonPaths(op.p, newElement.jsonMLPath(_rootDiv)), "op path match computed element path"
        equal op.li[0], 'DIV', "The element from op match the one inserted"
        ok op.li[1].someattr?, "Element from op has attr from DOM div"
        equal op.li[1].someattr, "foo", "Value of element attribute match value of attribute in op"
        
    _rootDiv.append(newElement)
    
test "Set attribute", () ->
    newElement = $('<div someattr="foo"/>')
    stop()
    _doc.on 'change', (ops) ->
        op = ops[0]
        console.log op
        if op.oi?
            #console.log op
            start()
                
        #    ok op?, "Update received"
        #ok op.li?, "Op was list insert"
        #ok compareJsonPaths(op.p, newElement.jsonMLPath(_rootDiv)), "op path match computed element path"
        #equal op.li[0], 'DIV', "The element from op match the one inserted"
        #ok op.li[1].someattr?, "Element from op has attr from DOM div"
        #equal op.li[1].someattr, "foo", "Value of element attribute match value of attribute in op"
        
    _rootDiv.append(newElement)
    setTimeout (->
      newElement.attr('someattr', 'bar')
    ), 0
    
    
# test "a basic test example", () ->
#   ok true, "this test is fine"
#   value = "hello"
#   equal value, "hello", "We expect value to be hello"
# 
# module "Module A"
# 
# test "first test within module", () ->
#    ok true, "all pass"
# 
#  
# test "second test within module", () ->
#    ok true, "all pass"
# 
#  
# module "Module B"
#  
# test "some other test", () ->
#    expect 2
#    equal true, false, "failing test" 
#    equal true, true, "passing test"