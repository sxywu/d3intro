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

            this.elTop = this.$('.demo').offset().top;
            this.elBottom = this.$('.demo:last').offset().top + this.$('.demo:last').outerHeight();
            this.containerHeight = this.$('.demoContainer').height();

            $(window).scroll(_.bind(this.windowScroll, this));
        },
        events: {
            'click .demoDiv': 'clickDiv',
            'click .demoDiv h4': 'clickChild',
            'click .manipulateDiv': 'manipulateDiv',
            'click .manipulateChild': 'manipulateChild',
            'keyup .bindData input': 'typeInput',
            'click .bindData': 'inputData',
            'blur .bindData input': 'inputData',
            'click .createEl': 'createEl',
            'click .enterExit': 'enterExit',
            'click .runCode': 'runCode',
            'click .resetCode': 'resetCode'
        },
        windowScroll: function(e) {
            var top = $(window).scrollTop();
            if ((top > this.elTop) && ((top + this.containerHeight) < this.elBottom)) {
                this.$('.demoContainer, .codeContainer')
                    .addClass('fixed')
                    .css('top', (top - this.elTop));
            } else if (top < this.elTop) {
                this.$('.demoContainer, .codeContainer')
                    .removeClass('fixed')
                    .css('top', 0);
            }

        },
        clickDiv: function(e) {
            var $div = ($(e.target).is('.demoDiv') ? $(e.target) : $(e.target).parents('.demoDiv'))
            if ($div.hasClass('highlight')) {
                $div.removeClass('highlight');
            } else {
                $div.addClass('highlight');
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
                    $manipulateDiv.next('.manipulateChild').removeClass('hidden');
                } else {
                    $manipulateDiv.next('.manipulateChild').addClass('hidden');
                }
            }
            
            this.toggleShowCode();
        },
        manipulateChild: function(e) {
            if (this.$('.manipulateChild').hasClass('active')) {
                this.$('.manipulateChild').removeClass('active');
            } else {
                this.$('.manipulateChild.active').removeClass('active');
                this.$('.manipulateChild').addClass('active')
            }
            this.toggleShowCode();
        },
        typeInput: function(e) {
            var val = this.$('.bindData input').val();
            val = val.replace(/[^\w\d, ]/g, '');

            this.$('.bindData input').val(val);
            this.$('.bindData span').text(val);
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
        createEl: function(e) {
            var $createEl = ($(e.target).is('.createEl') ? $(e.target) : $(e.target).parents('.createEl'));
            
            if ($createEl.hasClass('active')) {
                $createEl.removeClass('active');
            } else {
                this.$('.createEl.active').removeClass('active');
                $createEl.addClass('active');
            }
            this.toggleShowCode();
        },
        enterExit: function(e) {
            var $enterExit = ($(e.target).is('.enterExit') ? $(e.target) : $(e.target).parents('.enterExit'));
            
            if ($enterExit.hasClass('active')) {
                $enterExit.removeClass('active');
            } else {
                this.$('.enterExit.active').removeClass('active');
                $enterExit.addClass('active');

                if (($enterExit.attr('data-type') === 'enter')
                    || ($enterExit.attr('data-type') === 'update')) {
                    this.$('.manipulateChild').addClass('hidden');
                    $enterExit.next('.manipulateChild').removeClass('hidden');
                } else {
                    $enterExit.next('.manipulateChild').addClass('hidden');
                }
            }
            
            this.toggleShowCode();
        },
        /* toggle show code button */
        toggleShowCode: function() {
            var demoHighlighted = this.$('.demoDiv.highlight').length,
                manipulateActivated = this.$('.manipulateDiv').length ?
                    this.$('.manipulateDiv.active').length : true,
                bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : true,
                createEl = this.$('.createEl.active').length,
                enterExit = this.$('.enterExit.active').length;

            if ((demoHighlighted && manipulateActivated)
                || (demoHighlighted && bindDataActivated)
                || (createEl && bindDataActivated)) {
                this.$('pre').removeClass('hidden');
            } else {
                this.$('pre').addClass('hidden')
            }
            this.showCode();
        },
        showCode: function(e) {
            // get the selected div's
            var selection = this.selectionCode(),
                data = this.bindDataCode(),
                manipulate = this.manipulateCode(),
                create = this.createElCode(),
                enterExit = this.enterExitCode(),
                code;

            if (selection) {
                code = selection 
                    + data
                    + manipulate
                    + ';';
            } else if (create) {
                code = create
                    + data
                    + enterExit
                    + ';';
            }

            if (this.$('pre').hasClass('hidden')) {
                this.$('.runCode, .resetCode').addClass('hidden');
            } else {
                this.$('.runCode, .resetCode').removeClass('hidden');
            }

            this.$('pre').text(code);
        },
        selectionCode: function() {
            var divLength = this.$('.demoDiv.highlight').length,
                selection = '';
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
            } else if (divLength === 2) {
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
                $child = this.$('.manipulateChild.active'),
                childVal = $child.attr('data-val');

            if (type === 'text') {
                if (val) {
                    manipulate = '\n  .text("' + val + '")';
                } else {
                    manipulate = '\n  .text(function(d) {return d;})'
                }
            } else if (type === 'append') {
                manipulate = '\n  .append("' + val + '")';
            }

            if ($child.length) {
                if (childVal) {
                    manipulate += '\n    .text("' + childVal + '")';
                } else {
                    manipulate += '\n    .text(function(d) {return d;})'
                }
            }
            return manipulate;
        },
        createElCode: function() {
            var create = '';

            if (this.$('.createEl.active').length) {
                var val = this.$('.createEl.active').attr('data-val');
                create = 'd3.selectAll("' + val + '")';
            }

            return create;
        },
        enterExitCode: function() {
            var enterExit = '',
                type = this.$('.enterExit.active').attr('data-type'),
                $child = this.$('.manipulateChild.active');

            if (type === 'enter') {
                var val = this.$('.createEl.active').attr('data-val');
                enterExit = '\n  .enter().append("' + val + '")';

                if ($child.length) {
                    enterExit += '\n    .text(function(d) {return d;})';
                }
            } else if (type === 'update') {
                if ($child.length) {
                    enterExit += '\n  .text(function(d) {return d;})';
                }
            } else if (type === 'exit') {
                enterExit = '\n  .exit().remove()';
            }

            return enterExit;
        },
        runCode: function() {
            // clear demo div's first
            
            var code = this.$('pre').text(),
                manipulateActivated = this.$('.manipulateDiv').length ?
                    this.$('.manipulateDiv.active').length : true,
                bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : true,
                create = this.$('.createEl').length,
                enterExit = this.$('.enterExit.active').length;

            if (bindDataActivated) {
                this.$('.demoDiv p').remove();
                var dataCode = 'd3.selectAll("#' + this.id + ' .highlight")';
                dataCode += this.bindDataCode();
                dataCode += '.insert("p", "div, li, h4").text(function(d) {return "__data__: " + d;})'

                new Function(dataCode)();
            }

            if (create) {
                code = code.replace('d3', 'd3.select("#' + this.id + ' .demoEnv .demoContainer")');
            } else {
                code = code.replace(/div/g, '#' + this.id + ' .demoDiv');
            } 
            
            new Function(code)();
        },
        resetCode: function() {
            this.$('.demoDiv, .demoDiv h4').empty();
            this.$('.demoEnv .demoContainer').html('');
        }
    });
})