set_global('$', global.make_zjquery());
set_global('i18n', global.stub_i18n);

set_global('templates', {});
set_global('alert_words', {
    words: ['foo', 'bar'],
});
set_global('channel', {});

zrequire('alert_words_ui');

run_test('render_alert_words_ui', () => {
    var word_list = $('#alert_words_list');
    var appended = [];
    word_list.append = (rendered) => {
        appended.push(rendered);
    };

    var alert_word_items = $.create('alert_word_items');
    word_list.set_find_results('.alert-word-item', alert_word_items);

    templates.render =  (name, args) => {
        assert.equal(name, 'alert_word_settings_item');
        return 'stub-' + args.word;
    };

    var new_alert_word = $('#create_alert_word_name');
    assert(!new_alert_word.is_focused());

    alert_words_ui.render_alert_words_ui();

    assert.deepEqual(appended, [
        'stub-foo',
        'stub-bar',
        'stub-',
    ]);
    assert(new_alert_word.is_focused());
});

run_test('add_alert_word', () => {
    alert_words_ui.render_alert_words_ui = () => {}; // we've already tested this above

    alert_words_ui.set_up_alert_words();

    var word_list = $('#alert_words_list');
    var add_func = word_list.get_on_handler('click', '#create_alert_word_button');

    var new_alert_word = $('#create_alert_word_name');
    var alert_word_status = $('#alert_word_status');
    var alert_word_status_text = $('.alert_word_status_text');
    alert_word_status.set_find_results('.alert_word_status_text', alert_word_status_text);

    // add '' as alert word
    add_func();
    assert.equal(new_alert_word.val(), '');
    assert(alert_word_status.hasClass('alert-danger'));
    assert.equal(alert_word_status_text.text(), "translated: Alert word can't be empty!");
    assert(alert_word_status.visible());

    // add 'foo' as alert word (existing word)
    new_alert_word.val('foo');

    add_func();
    assert(alert_word_status.hasClass('alert-danger'));
    assert.equal(alert_word_status_text.text(), "translated: Alert word already exists!");
    assert(alert_word_status.visible());

    // add 'zot' as alert word (new word)
    new_alert_word.val('zot');

    var success_func;
    var fail_func;
    channel.post = (opts) => {
        assert.equal(opts.url, '/json/users/me/alert_words');
        assert.deepEqual(opts.data, {alert_words: '["zot"]'});
        success_func = opts.success;
        fail_func = opts.error;
    };

    add_func();

    // test failure
    fail_func();
    assert(alert_word_status.hasClass('alert-danger'));
    assert.equal(alert_word_status_text.text(), "translated: Error adding alert word!");
    assert(alert_word_status.visible());

    // test success
    success_func();
    assert(alert_word_status.hasClass('alert-success'));
    assert.equal(alert_word_status_text.text(), "translated: Alert word added successfully!");
    assert(alert_word_status.visible());
});

