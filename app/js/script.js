jQuery(document).ready(function($) {

    $( "#gamer_head_link" ).on('click',function() {
        $('#developer_head_link').removeClass('selected');
        $('.content_container .gamer_block').css('visibility', 'visible');
        $('.content_container .developer_block').css('visibility', 'hidden');
        $(this).addClass('selected');
    });
    $( "#developer_head_link" ).on('click',function() {
        $('#gamer_head_link').removeClass('selected');
        $('.content_container .developer_block').css('visibility', 'visible');
        $('.content_container .gamer_block').css('visibility', 'hidden');
        $(this).addClass('selected');
    });


});