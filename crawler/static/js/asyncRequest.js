$(function () {
    $('#search').on('click', function () {
        if (!$('#keyword').val().trim()) {
            $('#collapseAlert').collapse('show');
            return;
        }
        $('#collapseAlert').collapse('hide');
        $(this).prop("disabled", true).text('Please waiting...');
        $.get('/crawler', {
            keyword: $('#keyword').val(),
            device: $('#device option:selected').val()
        }, data => {
            $('#search').prop("disabled", false).text('Search');
            $('#result').html(data);
        })
    });
});
