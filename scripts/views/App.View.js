define([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/visualizations/Hood.Visualization"
], function(
    $,
    _,
    Backbone,
    d3,
    HoodVisualization
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

            console.log('d3.select("tr"): ', d3.select("tr"));
            console.log('d3.selectAll("tr"): ', d3.selectAll("tr"));
            console.log('d3.selectAll("tr").selectAll("td"): ', d3.selectAll("tr").selectAll("td"));
            console.log('d3.selectAll("tr").data([1, 2, 3]): ', d3.selectAll("tr").data([1, 2, 3]));
            console.log('d3.selectAll("tr").data([1, 2, 3, 4, 5]).enter(): ', d3.selectAll("tr").data([1, 2, 3, 4, 5]).enter());
        }
    });
})