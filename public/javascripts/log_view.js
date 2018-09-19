define([
    'ko'
], function(
    ko
) {
    function log_view() {
        var vm = {
            name: ko.observable('undefined'),
            pathname: ko.observable('D:\\OneDrive\\shortcuts\\sl\\logs'),
            watching: ko.observable(false),
            editing: ko.observable(false),
            log: ko.observable(''),
            max_buffer: ko.observable(1000),
            length: 0,
            timer: undefined,
            clean: function() {
                var self = this;
                self.log('');
            },
            keywords: ko.observableArray(),
            remove_keywork: function($data) {
                vm.keywords.remove($data);
            },
            keyword_to_add: ko.observable(),
            add_keyword: function() {
                var keyword_to_add = this.keyword_to_add();
                if (keyword_to_add.length &&
                    this.keywords().indexOf(keyword_to_add) == -1
                ) {
                    this.keywords.push(keyword_to_add);
                    this.keyword_to_add('');
                } else {
                    return;
                }
            },
            highlight_reg: null,
            highlights: function(logs) {
                if (this.highlight_reg) {
                    return logs.replace(this.highlight_reg, function($) {
                        return '<span class="highlight">' + $ + '</span>';
                    });
                } else {
                    return logs;
                }
            },
            generate_highlight_reg: function() {
                var keywords = this.keywords();
                generate_highlight_reg(keywords);
            },
            load_log: function(done) {
                var self = this;
                $.post('/tail_log', {
                        pathname: this.pathname,
                        length: this.length
                    },
                    function(res) {
                        var err = res.err;
                        var text = res.text;
                        var length = res.length;
                        done && done();

                        if (err) {

                        } else {
                            self.length = length;

                            text = self.highlights(text);

                            text = self.log() + text;
                            var count = text.split('\n').length;

                            var count_delta = count - self.max_buffer();

                            var index_lineend = 0;
                            while (count_delta > 0) {
                                index_lineend = text.indexOf('\n', index_lineend)
                                count_delta--;
                                count--;
                            }

                            text = text.slice(index_lineend);
                            self.line_count = count;
                            self.log(text);
                        }
                    });
            },
            start: function(done) {
                this.length = 0;
                $.post('/start_log_tail', {
                    pathname: this.pathname
                }, function(args) {
                    console.log(args);
                    done && done();
                });
            },
            stop_load_log: function() {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.timer = undefined;
                $.post('/stop_tail_log', {
                    pathname: this.pathname
                }, function() {

                });
            }
        };

        function generate_highlight_reg(keywords) {

            if (keywords.length) {
                var reg = RegExp(
                    keywords.map(function(word) {
                        return word.replace(/(\.\\\/\?\[\]\(\)\!\*)/g, '\\\\$1');
                    }).join('|'),
                    'g');
            } else {
                reg = null;
            }

            vm.highlight_reg = reg;
        }

        setTimeout(function() {
            // lazy set subscriber
            vm.name.subscribe(function(name) {
                $.post('/update_view', {
                    data: {
                        name: name
                    },
                    _id: vm._id
                }, function(res) {

                });
            });

            vm.pathname.subscribe(function(pathname) {
                $.post('/update_view', {
                    data: {
                        pathname: pathname
                    },
                    _id: vm._id
                }, function(res) {

                });
            });

            vm.keywords.subscribe(function(keywords) {

                generate_highlight_reg(keywords);

                $.post('/update_view', {
                    data: {
                        keywords: keywords
                    },
                    _id: vm._id
                }, function(res) {

                });
            });
        }, 0);

        vm.watching.subscribe(function(bool) {
            if (!bool) {
                vm.stop_load_log();
            } else {
                if (vm.timer) {
                    // pass
                } else {

                    var load_log = function() {
                        vm.load_log(function() {
                            vm.timer = setTimeout(load_log, 1e3);
                        })
                    };

                    vm.start(load_log);
                }
            }
        });
        return vm;
    }

    log_view.create = function(doc) {
        var view = log_view();
        view._id = doc._id;

        view.name(doc.name);
        view.pathname(doc.pathname);

        var keywords;

        if (doc.keywords) {
            keywords = [].slice.call(doc.keywords);
        }
        if (keywords && keywords.length) {

        } else {
            keywords = ['xxxx', 'project']
        }

        view.keywords(keywords);

        view.generate_highlight_reg();

        return view;
    }

    return log_view;
});