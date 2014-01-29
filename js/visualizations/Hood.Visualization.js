define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    return function() {
        var svg, $svg, g, circles, paths, texts,
            width, height, 
            radius = 5,
            padding = 20,
            data, nodes, links, types,
            tree = d3.layout.tree()
                .children(function(d) {
                    return d.nodes;
                }),
            diagonal = d3.svg.diagonal();

        

        function Hood(selection) {     
            selection = (selection instanceof $ ? selection[0] : selection);
            $svg = $(selection);
            width = width || $svg.width();
            height = height || $svg.height();

            svg = d3.select(selection);
            g = svg.append("g").attr("transform", "translate(" + padding + "," + (2 * padding) + ")");

            tree.size([width - 2 * padding, height - 4 * padding]);
            nodes = tree.nodes(data.data);
            links = tree.links(nodes);
            types = _.filter(nodes, function(d) {
                return d.desc;
            });

            circles = g.selectAll("circle").data(nodes)
                .enter().append("circle")
                .attr("r", radius)
                .attr("cx", function(d) {
                    return d.x;
                }).attr("cy", function(d) {
                    return d.y;
                }).attr("opacity", function(d) {
                    if (d.type === "placeholder") {
                        return .25;
                    } else {
                        return 1;
                    }
                }).attr("fill", app.colors.gray);

            paths = g.selectAll("path").data(links)
                .enter().append("path")
                .attr("d", diagonal)
                .attr("fill", "none")
                .attr("stroke", app.colors.gray)
                .attr("opacity", function(d) {
                    if (d.target.type === "placeholder") {
                        return .25;
                    } else {
                        return 1;
                    }
                }).attr("stroke-dasharray", function(d) {
                    if (d.target.type === "parentNode") {
                        return "5,5";
                    } else {
                        return "none";
                    }
                });

            texts = g.selectAll("text.name").data(nodes)
                .enter().append("text").classed("name", true)
                .attr("x", function(d) {
                    return d.x + padding / 2;
                }).attr("y", function(d) {
                    return d.y;
                }).attr("text-anchor", "start")
                .attr("fill", app.colors.gray)
                .attr("stroke", "none")
                .attr("opacity", function(d) {
                    if (d.type === "placeholder") {
                        return .25;
                    } else {
                        return 1;
                    }
                }).text(function(d) {
                    return d.name;
                });
            g.selectAll("text.desc").data(types)
                .enter().append("text").classed("desc", true)
                .attr("x", function(d) {
                    return d.x;
                }).attr("y", function(d) {
                    return d.y + padding;
                }).attr("text-anchor", "start")
                .attr("fill", app.colors.gray)
                .attr("stroke", "none")
                .attr("opacity", function(d) {
                    if (d.type === "placeholder") {
                        return .25;
                    } else {
                        return .5;
                    }
                }).text(function(d, i) {
                    return d.desc;
                });
        }

        /* getter/setters */
        Hood.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return Hood;
        }

        return Hood;
    }
});