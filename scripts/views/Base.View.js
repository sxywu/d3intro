define([
    "jquery",
    "underscore",
    "backbone"
], function(
    $,
    _,
    Backbone
) {
    return Backbone.View.extend({
        initialize: function() {
            this.id = _.uniqueId('page');
            this.$el.attr('id', this.id);

            this.elTop = this.$('.demo').offset().top;
            this.elBottom = this.$('.demo:last').offset().top + this.$('.demo:last').outerHeight();

            $(window).scroll(_.bind(this.windowScroll, this));
        },
        events: {
            'click .demoDiv': 'clickDiv',
            'click .demoDiv h4': 'clickChild',
            'click .manipulateDiv': 'manipulateDiv',
            'click .manipulateChild': 'manipulateChild',
            'keyup .bindData input': 'typeInput',
            'blur .bindData input': 'inputData',
            'click .runCode': 'runCode',
            'click .resetCode': 'resetCode'
        },
        windowScroll: function(e) {
            var top = $(window).scrollTop();
            this.containerHeight = this.$('.demoContainer').height();
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
                    this.$('.manipulateChild').removeClass('active').addClass('hidden');
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
            var val = $(e.target).val();
            val = val.replace(/[^\w\d, ]/g, '');

            $(e.target).val(val);
            this.$('.bindData span').text(val);
        },
        inputData: function(e) {
            e.stopPropagation();

            var $bindData = ($(e.target).is('.bindData') ? $(e.target) : $(e.target).parents('.bindData'));
            if ($bindData.find('input').val()) {
                this.$('.bindData.active').removeClass('active');
                $bindData.addClass('active');
            } else {
                $bindData.removeClass('active');
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

            if ((demoHighlighted && manipulateActivated)
                || (demoHighlighted && bindDataActivated)) {
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
                code = selection + data + manipulate + ';';

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
                val = this.$('.bindData.active input').val(),
                data = '';

            if (val) {
                val = val.split(', ').map(function(val) {
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
        runCode: function() {
            var code = this.$('pre').text(),
                bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : false;

            code = code.replace(/div/g, '#' + this.id + ' .demoDiv.highlight'); 
            code = 'console.log(' + code.replace(/;/g, '') + ')';
            new Function(code)();

            if (bindDataActivated) {
                this.$('.demoDiv p').remove();
                var dataCode = 'd3.selectAll("#' + this.id + ' .highlight")';
                dataCode += this.bindDataCode();
                dataCode += '.insert("p", "h4").text(function(d) {return "__data__: " + d;})'

                new Function(dataCode)();
            }
        },
        resetCode: function() {
            this.$('.demoDiv, .demoDiv h4').empty();
            this.$('.demoEnv .demoContainer').html('');
        }
    });
})