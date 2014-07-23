define([
    "jquery",
    "underscore",
    "backbone",
    "app/views/Base.View"
], function(
    $,
    _,
    Backbone,
    BaseView
) {
    return BaseView.extend({
        events: {
            'click .demoDiv': 'clickDiv',
            'click .demoDiv h4': 'clickChild',
            'click .manipulateDiv': 'manipulateDiv',
            'click .manipulateChild': 'manipulateChild',
            'keyup .bindData input': 'typeInput',
            'blur .bindData input': 'inputData',
            'click .createEl': 'createEl',
            'click .enterExit': 'enterExit',
            'click .runCode': 'runCode',
            'click .resetCode': 'resetCode'
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
            var bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : true,
                createEl = this.$('.createEl.active').length;

            if (createEl && bindDataActivated) {
                this.$('pre').removeClass('hidden');
            } else {
                this.$('pre').addClass('hidden')
            }
            this.showCode();
        },
        showCode: function(e) {
            // get the selected div's
            var data = this.bindDataCode(),
                create = this.createElCode(),
                enterExit = this.enterExitCode(),
                code = create + data + enterExit + ';';

            if (this.$('pre').hasClass('hidden')) {
                this.$('.runCode, .resetCode').addClass('hidden');
            } else {
                this.$('.runCode, .resetCode').removeClass('hidden');
            }

            this.$('pre').text(code);
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
                bindDataActivated = this.$('.bindData').length ?
                    this.$('.bindData.active input').val() : false;

            code = code.replace('d3', 'd3.select("#' + this.id + ' .demoEnv .demoContainer")');
            code = 'console.log(' + code.replace(/;/g, '') + ')';
            new Function(code)();

            if (bindDataActivated) {
                this.$('.demoContainer p').remove();
                var dataCode = this.createElCode()
                    .replace('d3', 'd3.select("#' + this.id + ' .demoContainer")');
                dataCode += this.bindDataCode();
                dataCode += '.insert("p", "h4").text(function(d) {return "__data__: " + d;})'

                new Function(dataCode)();
            }
        }
    });
})