function clear(){
    $("#maxDate").val("");
    $("#minDate").val("");
    $("#monthly").val("");
    $("#yearly").val("");
    $("#daily").val("");
    if (!$(".daily").hasClass('d-none')) $(".daily").addClass('d-none');
    if (!$(".yearly").hasClass('d-none')) $(".yearly").addClass('d-none');
    if (!$(".monthly").hasClass('d-none')) $(".monthly").addClass('d-none');
    if (!$(".custom").hasClass('d-none')) $(".custom").addClass('d-none');
}

function select(){
    clear();
    var filter = $("#filter-dropdown").val();
    if(filter=="daily")$(".daily").removeClass("d-none");
    if(filter=="yearly")$(".yearly").removeClass("d-none");
    if(filter=="monthly")$(".monthly").removeClass("d-none");
    if(filter=="custom")$(".custom").removeClass("d-none");
}