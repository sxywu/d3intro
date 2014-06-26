define([
    "jquery",
    "underscore",
    "backbone"
], function(
    $,
    _,
    Backboneization,
    PageView
) {
    return Backbone.View.extend({
        events: {
            'click .runCode': 'runCode'
        },
        runCode: function() {
            var code = this.$('textarea').val();
            new Function(code)();
        }
    });
})