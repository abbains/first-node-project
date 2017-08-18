$(document).ready(function(){
  $('#delete').on('click',function(e){
    $target = $(e.target);
    const id = ($target.attr('data.id'));
    console.log(id);
    $.ajax({
      type: 'DELETE',
      url:'/delete/'+id,
      success: function(){
        alert('Deleting');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
