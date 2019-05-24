const RESTAPI = 'http://localhost:5000/tasksApi/v1';
const NiceButtons = '<td><a href="#"><img class="actionicon actiondelete" src="https://img.icons8.com/windows/32/000000/delete/2266EE"></a>' +
    '<a href="#"><img class="actionicon actionedit" src="https://img.icons8.com/windows/32/000000/edit/2266EE"></a></td>';


$(document).ready(function () {

    // for toggle button functionality
    // source: https://www.bootply.com/92189
    $('.btn-toggle').click(function () {
        $(this).find('.btn').toggleClass('active');

        if ($(this).find('.btn-primary').size() > 0) {
            $(this).find('.btn').toggleClass('btn-primary');
        }
        $(this).find('.btn').toggleClass('btn-default');

    });

    //// INSERT NEW TASK
    $('#newtask').click(function (event) {
        event.preventDefault();

        // gather input data
        let task_description = $("input[name='tasktext']").val();
        let task_urgent = $('button#taskurgent').hasClass('active');

        // alert( task_description + " " + task_urgent) ;

        // construct JSON for the request
        let jsonData = JSON.stringify({
            'description': task_description,
            'urgent': task_urgent
        });

        // call REST API
        $.ajax({
            'url': RESTAPI+'/tasks',
            'method': "POST",
            'data': jsonData,
            'contentType': "application/json",
            'success': function(data) {
                refreshTasks();
                $("input[name='tasktext']").val("");
            }
        });
    });

    //// REFRESH LIST OF TASKS

    function refreshTasks() {

        // get the updated list from the server (call GET /tasks)
        $.ajax({
            'url': RESTAPI+"/tasks",
            'method': "GET",
            'dataType': "json",
            'success': function (data, textStatus, jqXHR) {

                // empty the currently shown list (table contents)
                let tableBody = $('tbody#tasklistbody');
                tableBody.empty();

                // with the updated list, rebuild the table rows
                for (let i = 0; i < data.length; i++) {
                    let task_description = data[i]['description'];
                    let task_id = data[i]['id'];
                    let task_urgent = data[i]['urgent'];

                    tableBody.append(
                        "<tr data-id='"+task_id+"'>" +
                        "<td>" + task_description + "</td>" +
                        "<td>" + task_urgent + "</td>" + NiceButtons + "</tr>\n");
                }
                $(".actiondelete").parent("a").click(deleteTask);
                $(".actionedit").parent("a").click(editTask);

            }
        });
    }
    ///// Update existing task

    function editTask(event) {
        event.preventDefault();

            let row = $(this).parents("tr");
            let currentDescription = row.find("td:first-child").text();
            let currentUrgency = row.find("td:nth-child(2)").text();
            row.find("td:first-child").html("<input class=\"form-control\" type=\"text\" size=\"80\" name=\"tasktext\"/>");
            row.find("td:nth-child(2)").html("<div class=\"btn-group btn-toggle\">\n" +
                "                        <button class=\"btn btn-sm btn-default yes\">Yes</button>\n" +
                "                        <button class=\"btn btn-sm btn-primary active\">No</button>\n" +
                "                    </div>");
            row.find("td:first-child").find("input").val(currentDescription);
            if(currentUrgency==='1') {
                row.find(".btn-sm").toggleClass("active");
                row.find(".btn-sm").toggleClass("btn-primary");
                row.find(".btn-sm").toggleClass("btn-default");
            }
            $('.btn-toggle').click(function () {
                $(this).find('.btn').toggleClass('active');

                if ($(this).find('.btn-primary').size() > 0) {
                    $(this).find('.btn').toggleClass('btn-primary');
                }
                $(this).find('.btn').toggleClass('btn-default');

            });
            row.find("td:last-child").html("<a href=\"\" ><img class=\"actionicon\" " +
                "src=\"https://img.icons8.com/windows/32/000000/checked.png\"></a>");
            row.find("td:last-child").find('a').click(updateTask);

    }

    function updateTask() {
        event.preventDefault();

            let row = $(this).parent().parent();
            let identifier = row.attr("data-id");
            let currentDescription = row.find("input").val();
            let currentUrgency = row.find('button.yes').hasClass('active');
            if(currentUrgency){
                currentUrgency = 1;
            }
            else{
                currentUrgency = 0;
            }

            $.ajax({
                'url': RESTAPI + "/tasks/"+identifier,
                'method': "PUT",
                'contentType': "application/json",
                'data': JSON.stringify({
                    'id' : identifier,
                    'description' : currentDescription,
                    'urgent' : currentUrgency
                }),
                'success': function () {
                    row.find("td:first-child").text(currentDescription);
                    row.find("td:nth-child(2)").text(currentUrgency);
                    row.find("td:last-child").html("<a href=\"#\"><img class=\"actionicon actiondelete\" " +
                        "src=\"https://img.icons8.com/windows/32/000000/delete/2266EE\"></a>" +
                        "<a href=\"#\"><img class=\"actionicon actionedit\" " +
                        "src=\"https://img.icons8.com/windows/32/000000/edit/2266EE\"></a>");
                    row.find(".actiondelete").parent("a").click(deleteTask);
                    row.find(".actionedit").parent("a").click(editTask);
                },
            });
    }

    //// DELETE EXISTING TASK

    function deleteTask(event) {
        event.preventDefault();

            let row = $(this).parent().parent();
            let identifier = row[0].getAttribute("data-id");
            $.ajax({
                'url': RESTAPI + "/tasks/"+identifier,
                'method': "DELETE",
                'success': function () {
                    row.remove();
                }
            });
    }

    // STARTUP TASKS
    refreshTasks();
});

