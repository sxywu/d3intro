define([
    "jquery",
    "underscore",
    "backbone"
], function(
    $,
    _,
    Backbone,
    d3,
    HoodVisualization
) {
    return Backbone.View.extend({
        initialize: function() {
            this.id = _.uniqueId('page');
            this.$el.attr('id', this.id);
        },
        events: {
            'click .demoDiv': 'clickDiv',
            'click .manipulateDiv': 'manipulateDiv',
            'click .manipulateChild': 'manipulateChild',
            // 'click .bindData': 'bindData',
            // 'click .bindData input': 'inputData',
            'keyup .bindData input': 'typeInput',
            'blur .bindData input': 'inputData',
            'click .showCode': 'showCode',
            'click .runCode': 'runCode'
        },
        clickDiv: function(e) {
            if ($(e.target).hasClass('highlight')) {
                $(e.target).removeClass('highlight');
            } else {
                $(e.target).addClass('highlight');
            }

            this.toggleShowCode();
        },
        manipulateDiv: function(e) {

            var $manipulateDiv = ($(e.target).is('.manipulateDiv') ? $(e.target) : $(e.target).parents('.manipulateDiv'));
            
            if ($manipulateDiv.hasClass('active')) {
                $manipulateDiv.removeClass('active');
            } else {
                this.$('.manipulateDiv.active').removeClass('active');
                $manipulateDiv.addClass('active');

                if ($manipulateDiv.attr('data-type') === 'append') {
                    this.$('.manipulateChild').removeClass('hidden');
                } else {
                    this.$('.manipulateChild').addClass('hidden');
                }
            }
            
            this.toggleShowCode();
        },
        manipulateChild: function(e) {
            if (this.$('.manipulateChild').hasClass('active')) {
                this.$('.manipulateChild').removeClass('active');
            } else {
                this.$('.manipulateChild').addClass('active')
            }
            this.toggleShowCode();
        },
        // bindData: function() {
        //     if (this.$('.bindData').hasClass('active')) {
        //         this.$('.bindData').removeClass('active');
        //     } else {
        //         this.$('.bindData').addClass('active')
        //     }
        //     this.toggleShowCode();
        // },
        typeInput: function(e) {
            var val = this.$('.bindData input').val();
            val = val.replace(/[^\w\d, ]/g, '');

            this.$('.bindData input').val(val);
        },
        inputData: function(e) {
            e.stopPropagation();
            if (this.$('.bindData input').val()) {
                this.$('.bindData').addClass('active');
            } else {
                this.$('.bindData').removeClass('active');
            }
            this.toggleShowCode();
        },
        /* toggle show code button */
        toggleShowCode: function() {
            var demoHighlighted = this.$('.demoDiv.highlight').length,
                manipulateActivated = this.$('.manipulateDiv').length ?
                    this.$('.manipulateDiv.active').length : true,
                bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : true;

            if (demoHighlighted && (manipulateActivated || bindDataActivated)) {
                this.$('.showCode').removeClass('disabled');
            } else {
                this.$('.showCode').addClass('disabled')
            }
            this.showCode();
        },
        showCode: function(e) {
            // get the selected div's
            var selection = this.selectionCode(),
                data = this.bindDataCode(),
                manipulate = this.manipulateCode(),
                code = selection 
                    + data
                    + manipulate
                    + ';';

            if (this.$('.showCode').hasClass('disabled')) {
                // if not showing, then also hide code
                this.$('pre').addClass('hidden');
            } else if (e) {
                // only show code if it's been clicked
                this.$('pre').removeClass('hidden');
            }

            if (this.$('pre').hasClass('hidden')) {
                this.$('.runCode').addClass('disabled');
            } else {
                this.$('.runCode').removeClass('disabled');
            }

            this.$('pre').text(code);
        },
        selectionCode: function() {
            var divLength = this.$('.demoDiv.highlight').length,
                selection;
            if (divLength === 1) {
                var selector;
                this.$('.demoDiv').each(function(i) {
                    if ($(this).hasClass('highlight')) {
                        if (i === 0) {
                            selector = 'div';
                        } else {
                            selector = 'div:nth-child(' + (i + 1) + ')';
                        }
                    }
                });
                selection = 'd3.select("' + selector + '")';
            } else if (divLength === 3) {
                selection = 'd3.selectAll("div")'
            } else {
                var selectors = [];
                this.$('.demoDiv').each(function(i) {
                    if ($(this).hasClass('highlight')) {
                        selectors.push('div:nth-child(' + (i + 1) + ')');
                    }
                });
                selection = 'd3.selectAll("' + selectors.join(',') + '")';
            }
            
            return selection;    
        },
        bindDataCode: function() {
            var divLength = this.$('.demoDiv.highlight').length,
                val = this.$('.bindData input').val(),
                data = '';

            if (val) {
                val = val.split(', ').map(function(val) {
                    console.log(_.isString(val), _.isNumber(val));
                    val = val.replace(/"/g, '');
                    return '"' + val + '"';
                }).join(', ');


                data = '\n  .' + (divLength === 1 ? 'datum' : 'data') + '([' + val + '])';
            }
            
            return data;
        },
        manipulateCode: function() {
            var manipulate = '',
                type = this.$('.manipulateDiv.active').attr('data-type'),
                val = this.$('.manipulateDiv.active').attr('data-val'),
                child = this.$('.manipulateChild.active'),
                childVal = this.$('.manipulateChild.active').attr('data-val');

            if (type === 'text') {
                if (val) {
                    manipulate = '\n  .text("' + val + '")';
                } else {
                    manipulate = '\n  .text(function(d) {return d;})'
                }
            } else if (type === 'append') {
                manipulate = '\n  .append("' + val + '")';
            }

            if (child.length) {
                if (childVal) {
                    manipulate += '\n    .text("' + childVal + '")';
                } else {
                    manipulate += '\n    .text(function(d) {return d;})'
                }
            }
            return manipulate;
        },
        runCode: function() {
            // clear demo div's first
            this.$('.demoDiv, .demoDiv h4').empty();

            var code = this.$('pre').text();
            code = code.replace(/div/g, '#' + this.id + ' .demoDiv');
            new Function(code)();
        }
    });
})