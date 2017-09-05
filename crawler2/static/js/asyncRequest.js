$(function () {
    const socket = io('http://localhost:8080');
    let taskNum = 0,
        percentage = 0,
        n = 0;
    socket.on('result', function (data) {
        let $result = $('#result');
        if (!$result.children(`[data-kw=${data.keyword}]`).length) {
            $result.append(`<h1 data-kw=${data.keyword}>keyword:${data.keyword}</h1>`);
        }
        if (!$result.children(`[data-dv=${data.device}]`).length) {
            $result.append(`<h3>${data.device}</h3><hr><div data-dv=${data.device} class="waterfall"></div>`);
        }
        $(`#result [data-dv=${data.device}]`).append(data.html);
        $('[data-ride="carousel"]').carousel();
        percentage = Math.floor(++n / taskNum * 100);
        $('.progress-bar').attr("aria-valuenow", percentage).css({
            'width': percentage + '%'
        }).html(percentage + '%');
        if (percentage === 100) {
            $('.progress').fadeOut('500', function () {
                $(this).addClass('d-none');
            });
            n = 0;
            $('.progress-bar').attr("aria-valuenow", 0).css({
                'width': '0%'
            }).html('0%');
            $('#search').prop("disabled", false).text('Search');
        }
    });

    $('#search').on('click', function () {
        if (!$('#keyword').val().trim()) {
            $('#collapseAlert').collapse('show');
            return;
        }
        $('#collapseAlert').collapse('hide');
        $('#result').html('');
        $('.progress').fadeIn('500', function () {
            $(this).removeClass('d-none');
        });
        $(this).prop("disabled", true).text('Please waiting...');

        let queue = {
            keyword: $('#keyword').val(),
            page: $('#page').val() || '1',
            device: $.map($('[name="device"]:checked'), i => i.value)
        }
        let task = convert2Queue(queue);
        taskNum = task.length;
        socket.emit('query', task);
    });

    //Converts query objects into a series of tasks
    function convert2Queue(query) {
        let queue = [];
        for (let i of query.device) {
            for (let j = 1; j <= Number(query.page); j++) {
                queue.push({
                    keyword: query.keyword,
                    device: i,
                    page: j,
                });
            }
        }
        return queue;
    }

});
