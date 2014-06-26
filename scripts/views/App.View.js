define([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/visualizations/Hood.Visualization",
    "app/views/Page.View"
], function(
    $,
    _,
    Backbone,
    d3,
    HoodVisualization,
    PageView
) {
    return Backbone.View.extend({
        render: function() {
            var that = this;
            d3.json("data/hoods.json", function(data) {
                that.data = data.hoods;
                _.each(that.data, function(d) {
                    var visualization = HoodVisualization();
                    visualization.data(d);
                    visualization($("svg#" + d.id));
                });
            });

            $('.demo').each(function(value) {
                new PageView({el: this});
            });

        }
    });
})