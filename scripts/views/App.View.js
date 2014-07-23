define([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/views/Base.View"
], function(
    $,
    _,
    Backbone,
    d3,
    BaseView
) {
    return Backbone.View.extend({
        render: function() {
            var that = this;
            // d3.json("data/hoods.json", function(data) {
            //     that.data = data.hoods;
            //     _.each(that.data, function(d) {
            //         var visualization = HoodVisualization();
            //         visualization.data(d);
            //         visualization($("svg#" + d.id));
            //     });
            // });

            $('.baseDemo').each(function() {
                new BaseView({el: this});
            });

        }
    });
})