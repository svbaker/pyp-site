// ------- Used for chickipedia user breed survey uploader ----------------

var timerId;
var breed_id;

$(document).ready(function() {

    breed_id = localStorage.getItem('upload_breed_id');

    // Redirect to splash screen if no breed id is provided
    if (!breed_id) {
        window.location.href = '/splash.html';
        return false;
    }

    // Load breed data
    $.ajax({
        url: "/ops/ajax/getBreed",
        type: 'POST',
        timeout: 10000,
        dataType: 'json',
        cache: false,
        data: {breed_id: breed_id},
        success: function(data) {
            if (data.status == 'OK') {
                $('.breed_name_text').html(data.payload.breed.breed_name);
            } else {
                alert('Sorry, there was an issue loading this page: ' + data.status_text);
            }
        },
        error: function(a, b, c) {
            alert('Sorry, there was an issue loading this page, please try again.');
        }
    });


    $('.photos-list').on('click', '.remove', function() {

        $(this).parent().parent().remove();

        if ($('.image-box.active').length == 4) {
            var new_li_html = '';
            new_li_html += '<li class="image-box" id="image_add">';
            new_li_html += '<form id="uploadForm" method="post" enctype="multipart/form-data" action="/uploadPhoto">';
            new_li_html += '<div class="upload-container">';
            new_li_html += '<input class="image-upload" type="file" id="userPhotoInput" name="userPhoto" multiple="multiple" accept="image/*"/>';
            new_li_html += '</div><div class="add-photos-button">';
            new_li_html += '<span class="button-add"></span>';
            new_li_html += '<span>Add Photos</span>';
            new_li_html += '</div></form></li>';
            $('ul.photos-list').append(new_li_html);

            timerId = setInterval(function() {
                if($('#userPhotoInput').val() !== '') {
                    clearInterval(timerId);
                    $('#uploadForm').submit();
                }
            }, 500);

            $('#uploadForm').submit(submitFunction);

        } else {
            $('ul.photos-list').append('<li class="image-box empty"><div></div></li>');
        }
        return false;
    });

    timerId = setInterval(function() {
        if($('#userPhotoInput').val() !== '') {
            clearInterval(timerId);

            $('#uploadForm').submit();
        }
    }, 500);

    $('#uploadForm').submit(submitFunction);


    $('body').on('click', '#formSubmit', function() {
        
        var is_valid = true;

        $('.validated-input').each(function(i) {
            var msg_dom_id = '#' + $(this).attr('id') + '-msg';
            if ($(this).val().length == 0) {
                $(msg_dom_id).show();
                $(this).css('border-color', '#d00');
                is_valid = false;
            } else {
                $(msg_dom_id).hide();
                $(this).css('border-color', '#959595');
            }
        })

        if (!validEmail($('#email').val())) {
            $('#email-msg').show();
            $('#email').css('border-color', '#d00');
            is_valid = false;
        }

        if ($('.image-box.active').length == 0) {
            is_valid = false;
        }

        if (!is_valid) {
            alert('We are missing some inforation');
        } else {
            submitToServer();
        } 

    });

    // Handle on-page validation cues
    $('body').on('blur', '.validated-input', function() {
        var msg_dom_id = '#' + $(this).attr('id') + '-msg';
        if ($(this).val().length == 0) {
            $(msg_dom_id).show();
            $(this).css('border-color', '#d00');
        } else {
            $(msg_dom_id).hide();
            $(this).css('border-color', '#959595');
        }

        if ($(this).attr('id') == 'email') {
            if (!validEmail($('#email').val())) {
                $('#email-msg').show();
                $('#email').css('border-color', '#d00');
                is_valid = false;
            }
        }

    });

});




var submitFunction = function() {

    var filesToUpload = document.getElementById('userPhotoInput').files.length;

    if (filesToUpload + $('.image-box.active').length > 5) {
        if ($('.image-box.active').length == 0) {
            alert('Oh dear. You can only add 5 photos.');
        } else {
            if ($('.image-box.active').length == 4) {
                alert('Oh dear. You can only add one more photo.');
            } else {
                alert('Oh dear. You can only add ' + (5 - $('.image-box.active').length) + ' more photos.');
            }
        }

        document.getElementById("uploadForm").reset();
        timerId = setInterval(function() {
            if($('#userPhotoInput').val() !== '') {
                clearInterval(timerId);
                $('#uploadForm').submit();
            }
        }, 500);

        return false;
    }

    // Uploading files...
    var spinner = ajaxWaitingStatus(document.getElementById('image_add'));
    $('#loading_pane').show();

    //alert('Uploading...');

    // IMPORTANT: FireFox needs to expect JSON response as dataType "text"
    $(this).ajaxSubmit({                                                                                                                 

        dataType: 'text',

        error: function(xhr) {
            spinner.stop();
            $('#loading_pane').hide();
            alert('Error: ' + xhr.status);
        },

        success: function(response) {
            spinner.stop();
            $('#loading_pane').hide();

            res = JSON.parse(response);

            if(res.error){
                alert(res.error);
                return;
            }

            var uploadedFiles = res.fileList;
            var new_li_html = '';

            for (var i = 0; i < uploadedFiles.length; i++) {

                new_li_html += '<li class="image-box active" dbid="' + uploadedFiles[i].id +'">';
                new_li_html += '<div class="photo-container" style="';
                new_li_html += 'background: url(' + uploadedFiles[i].img_thumb_path + ') no-repeat left top;';
                new_li_html += 'background-position: center;';
                new_li_html += 'background-size: cover;';
                new_li_html += '"><a href="#" class="remove"></a>';
                new_li_html += '<a href="' + uploadedFiles[i].img_path + '" rel="lightbox" title="" class="preview"></a>';
                new_li_html += '</div></li>';

            }

            $('#image_add').before(new_li_html)

            $('ul.photos-list > li').slice(5).remove();


            // Upload complete, so reset form and restart timer
            if ($('.image-box.active').length < 5) {
                document.getElementById("uploadForm").reset();

                timerId = setInterval(function() {
                    if($('#userPhotoInput').val() !== '') {
                        clearInterval(timerId);
                        $('#uploadForm').submit();
                    }
                }, 500);

            }

        }
    });

    // Stop the form from submitting and causing a refresh                                                                                                                                                                                                                      
    return false;

}




function ajaxWaitingStatus(locationTarget) {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 7, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#fff', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    
    var spinner = new Spinner(opts).spin(locationTarget);

    return spinner;
}


function validEmail(email)   
{  
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
}  



function submitToServer() {

    var photo_ids_array = [];

    $('.image-box.active').each(function(i) {
        photo_ids_array.push($(this).attr('dbid'));
    });

    var formVals = {
        breed_id: breed_id,
        full_name: $('#full_name').val(),
        farm_name: $('#farm_name').val(),
        mailing_address: $('#mailing_address').val(),
        email: $('#email').val(),
        email_optin: checkbox_yn($('#email_optin').prop('checked')),
        website: $('#website').val(),
        photo_ids: photo_ids_array,
        photo_credit: $('#photo-credit').val(),
        breed_description: $('#breed_description').val(),
        breed_personality: $('#breed_personality').val(),
        breedvalue_eggs: checkbox_yn($('#eggs').prop('checked')),
        breedvalue_meat: checkbox_yn($('#meat').prop('checked')),
        breedvalue_dual: checkbox_yn($('#dual').prop('checked')),
        breedvalue_pet: checkbox_yn($('#pet').prop('checked')),
        breedvalue_looks: checkbox_yn($('#looks').prop('checked'))
    };


    $.ajax({
      url: '/uploadPhotosForm',
      type: 'POST',
      data: JSON.stringify(formVals),
      processData: false,
      dataType: 'json',

      success: function(data) {
        window.location.replace("http://www.pamperyourpoultry.com/thankyou.asp");
        },

      error: function(a, b, c) {
        alert('Server error posting form: ' + b);
        }
    });

}

function checkbox_yn(bool) {
    if (bool) {
        return 'y';
    } else {
        return 'n';
    }
}
