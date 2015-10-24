$(document).ready(function() {

  console.log('document ready');

  var $breweries = $('.breweries');
  var $name = $('#name');
  var $location = $('#location');

  function createHtml(brewery) {
    var html = '<li class="list-group-item"><a href="/breweries/' + brewery._id + '">' + brewery.name + '</a><span> - ' + brewery.location + '</span></li>';
    return html;
  }

  $.ajax({
    type: 'GET',
    url: '/breweries',
    success: function(breweries) {
      $.each(breweries, function(i, breweries) {
        $breweries.append(createHtml(breweries));
      })
    }
  });

  $('.add').on('click', function(e) {

    var breweries = {
      name: $name.val(),
      location: $location.val(),
    };

    $.ajax({
      type: 'POST',
      url: '/breweries',
      data: breweries,
      success: function(newBrewery) {
        $breweries.append(createHtml(newBrewery));
      }
    })
    e.preventDefault();
  })
});